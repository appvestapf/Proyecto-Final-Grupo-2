import { ForbiddenException, Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Property } from "../properties/entities/property.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
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

    async createAppointment(createAppointmentDto: CreateAppointmentDto, userId: string) {
        const { propertyId, date } = createAppointmentDto;
        const appointmentDate = new Date(date);

        if (appointmentDate <= new Date()) {
            throw new BadRequestException('La fecha de la cita debe ser futura');
        }

        const property = await this.propertiesRepository.findOne({ where: { id: propertyId } });
        if (!property) throw new NotFoundException('La propiedad no existe');

        const duplicate = await this.appointmentsRepository.findOne({
            where: { propertyId, date: appointmentDate },
        });
        if (duplicate && duplicate.status !== 'cancelled') {
            throw new ConflictException('Ya existe una cita agendada para esta propiedad en esa fecha');
        }

        const appointment = this.appointmentsRepository.create({
            userId,
            propertyId,
            date: appointmentDate,
        });
        const savedAppointment = await this.appointmentsRepository.save(appointment);

        const user = await this.usersService.findOne(userId);
        await this.mailService.sendAppointmentConfirmation(user.email, user.name, property.name, appointmentDate);

        return savedAppointment;
    }

    findAllByUser(userId: string) {
        return this.appointmentsRepository.find({ where: { userId } });
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
}
