import { ForbiddenException, Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Property } from "../properties/entities/property.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";
import { UsersService } from "../users/users.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
        @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
    ) {}

    private async hasTimeConflict(propertyId: string, date: Date, excludeAppointmentId?: string): Promise<boolean> {
        const windowMinutes = 30;
        const windowStart = new Date(date.getTime() - windowMinutes * 60 * 1000);
        const windowEnd = new Date(date.getTime() + windowMinutes * 60 * 1000);

        const query = this.appointmentsRepository.createQueryBuilder('appointment')
            .where('appointment.propertyId = :propertyId', { propertyId })
            .andWhere('appointment.status != :cancelled', { cancelled: 'cancelled' })
            .andWhere('appointment.date BETWEEN :windowStart AND :windowEnd', { windowStart, windowEnd });

        if (excludeAppointmentId) {
            query.andWhere('appointment.id != :excludeAppointmentId', { excludeAppointmentId });
        }

        const conflicting = await query.getOne();
        return !!conflicting;
    }

    async createAppointment(createAppointmentDto: CreateAppointmentDto, userId: string) {
        const { propertyId, date } = createAppointmentDto;
        const appointmentDate = new Date(date);

        if (appointmentDate <= new Date()) {
            throw new BadRequestException('La fecha de la cita debe ser futura');
        }

        const property = await this.propertiesRepository.findOne({ where: { id: propertyId }, relations: { owner: true } });
        if (!property || property.isDeleted) throw new NotFoundException('La propiedad no existe');

        const hasConflict = await this.hasTimeConflict(propertyId, appointmentDate);
        if (hasConflict) {
            throw new ConflictException('Ya hay una cita agendada para esta propiedad cerca de ese horario');
        }

        const appointment = this.appointmentsRepository.create({
            userId,
            propertyId,
            date: appointmentDate,
        });
        const savedAppointment = await this.appointmentsRepository.save(appointment);

        const user = await this.usersService.findOne(userId);
        await this.mailService.sendAppointmentConfirmation(user.email, user.name, property.name, appointmentDate);

        if (property.owner) {
            await this.mailService.sendNewAppointmentToOwner(
                property.owner.email,
                property.owner.name,
                user.name,
                property.name,
                appointmentDate,
            );
        }

        return savedAppointment;
    }

    findAllByUser(userId: string) {
        return this.appointmentsRepository.find({ where: { userId } });
    }

    findAllAdmin() {
        return this.appointmentsRepository.find({ relations: { user: true, property: true } });
    }

    async findOne(id: string, userId: string) {
        const appointment = await this.appointmentsRepository.findOne({ where: { id } });
        if (!appointment) throw new NotFoundException('La cita no existe');
        if (appointment.userId !== userId) throw new ForbiddenException('Esta cita no te pertenece');
        return appointment;
    }

    async cancel(id: string, userId: string) {
        const appointment = await this.findOne(id, userId);
        if (appointment.status === 'cancelled') {
            throw new ConflictException('Esta cita ya está cancelada');
        }
        appointment.status = 'cancelled';
        return this.appointmentsRepository.save(appointment);
    }

    async reschedule(id: string, userId: string, rescheduleDto: RescheduleAppointmentDto) {
        const appointment = await this.findOne(id, userId);
        if (appointment.status === 'cancelled') {
            throw new ConflictException('No podés reprogramar una cita cancelada');
        }

        const newDate = new Date(rescheduleDto.date);
        if (newDate <= new Date()) {
            throw new BadRequestException('La fecha de la cita debe ser futura');
        }

        const hasConflict = await this.hasTimeConflict(appointment.propertyId, newDate, appointment.id);
        if (hasConflict) {
            throw new ConflictException('Ya hay una cita agendada para esta propiedad cerca de ese horario');
        }

        appointment.date = newDate;
        appointment.status = 'pending';
        const savedAppointment = await this.appointmentsRepository.save(appointment);

        const property = await this.propertiesRepository.findOne({ where: { id: appointment.propertyId }, relations: { owner: true } });
        const user = await this.usersService.findOne(userId);
        if (property) {
            await this.mailService.sendAppointmentRescheduled(user.email, user.name, property.name, newDate);
            if (property.owner) {
                await this.mailService.sendNewAppointmentToOwner(
                    property.owner.email,
                    property.owner.name,
                    user.name,
                    property.name,
                    newDate,
                );
            }
        }

        return savedAppointment;
    }

    async confirm(id: string, requesterId: string, isAdmin: boolean) {
        const appointment = await this.appointmentsRepository.findOne({ where: { id } });
        if (!appointment) throw new NotFoundException('La cita no existe');

        const property = await this.propertiesRepository.findOne({ where: { id: appointment.propertyId }, relations: { owner: true } });
        const isOwner = property?.owner?.id === requesterId;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('No podés confirmar esta cita');
        }

        if (appointment.status === 'cancelled') {
            throw new ConflictException('Esta cita está cancelada');
        }
        if (appointment.status === 'confirmed') {
            throw new ConflictException('Esta cita ya está confirmada');
        }

        appointment.status = 'confirmed';
        return this.appointmentsRepository.save(appointment);
    }
}
