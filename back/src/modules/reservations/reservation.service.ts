import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { Repository } from "typeorm";
import { Property } from "../properties/entities/property.entity";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ReservationStatus } from "./enums/reservation-status.enum";

@Injectable()
export class ReservationService {
    constructor(
        @InjectRepository(Reservation) private readonly reservationsRepository: Repository<Reservation>,
        @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>
    ){}

    async createReservation(createReservationDto: CreateReservationDto, userId: string){
        const {propertyId} = createReservationDto;

        const property = await this.propertiesRepository.findOne({where: {id: propertyId}})

        if(!property)throw new NotFoundException('La propiedad no existe');

        if(!property.isAvailable)throw new ConflictException('La propiedad no está disponible para reservar');

        const reservation = this.reservationsRepository.create({
            userId,
            propertyId,
            status: ReservationStatus.PENDING
        })
        const savedReservation = await this.reservationsRepository.save(reservation);

        property.isAvailable = false;
        await this.propertiesRepository.save(property);

        return savedReservation;
    }
async findByUser(userId: string) {
        return this.reservationsRepository.find({
            where: { userId },
            relations: { property: true }, 
            order: { createdAt: 'DESC' }
        });
    }
}

