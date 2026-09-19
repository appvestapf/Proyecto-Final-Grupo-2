import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment } from "./entities/appointment.entity";
import { Property } from "../properties/entities/property.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
        @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>,
    ) {}

    async createAppointment(createAppointmentDto: CreateAppointmentDto, userId: string) {
        const { propertyId, date } = createAppointmentDto;

        const property = await this.propertiesRepository.findOne({ where: { id: propertyId } });
        if (!property) throw new NotFoundException('La propiedad no existe');

        const appointment = this.appointmentsRepository.create({
            userId,
            propertyId,
            date: new Date(date),
        });

        return this.appointmentsRepository.save(appointment);
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
        appointment.status = 'cancelled';
        return this.appointmentsRepository.save(appointment);
    }
}
