import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { Repository } from "typeorm";
import { Property } from "../properties/entities/property.entity";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { ReservationStatus } from "./enums/reservation-status.enum";
import { UsersService } from "../users/users.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class ReservationService {
    constructor(
        @InjectRepository(Reservation) private readonly reservationsRepository: Repository<Reservation>,
        @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
    ){}

    private async hasDateConflict(propertyId:string,startDate:string,endDate:string):Promise<Boolean>{
        const conflictingReservation = 
            await this.reservationsRepository.createQueryBuilder('reservation').where(
                '"reservation"."propertyId" = :propertyId', {propertyId}
            ).andWhere(
                '"reservation"."status" IN (:...statuses)',{statuses: [ReservationStatus.PENDING,ReservationStatus.CONFIRMED],}
            ).andWhere(
                '"reservation"."startDate"<= :endDate',{endDate}
            ).andWhere(
                '"reservation"."endDate">= :startDate',{startDate}
            ).getOne();
        
        return !!conflictingReservation;
    }
    private calculateNights(startDate:string,endDate:string):number{
        const start = new Date(`${startDate}T00:00:00`)
        const end = new Date(`${endDate}T00:00:00`)
        const differenceInMilliseconds = end.getTime() - start.getTime();
        const differenceInDays = differenceInMilliseconds/(1000*60*60*24)

        return differenceInDays
    }
    private getTodayDate():string{
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth()+1).padStart(2,'0');
        const day = String(today.getDate()).padStart(2,'0');
        return `${year}-${month}-${day}`
    }
    private addOneMonth(dateString:string):string{
        const date = new Date(`${dateString}T00:00:00`);
        date.setMonth(date.getMonth()+1);
        const year = date.getFullYear();
        const month = String(date.getMonth()+1).padStart(2,'0')
        const day = String(date.getDate()).padStart(2,'0')

        return `${year}-${month}-${day}`
    }

    async createReservation(createReservationDto: CreateReservationDto,userId:string){
        const {
            propertyId,
            startDate: requestedStartDate,
            endDate: requestedEndDate,
        }= createReservationDto;

        const property = await this.propertiesRepository.findOne({where:{id:propertyId}})
        if(!property)throw new NotFoundException('La propiedad no existe')
        if(!property.isAvailable) throw new ConflictException('La propiedad no está disponible para reservar')
        let startDate:string;
        let endDate:string;
        let nights: number|null;
        let totalPrice: number;

        if(property.rentalType === 'Temporario'){
            if(!requestedStartDate||!requestedEndDate)throw new BadRequestException('Las propiedades temporarias requieren fecha de inicio y de finalizacion')
            if(requestedStartDate>=requestedEndDate)throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de finalización')
            startDate = requestedStartDate;
            endDate = requestedEndDate;

            nights = this.calculateNights(startDate,endDate);
            if(nights<1){
                throw new BadRequestException('La reserva debe tener al menos una noche')  
            }
            totalPrice = property.price*nights;
        } else if(property.rentalType === 'Residencial'){
            startDate = this.getTodayDate();
            endDate = this.addOneMonth(startDate);
            nights = null;
            totalPrice = property.price
        } else {
            throw new BadRequestException(`Tipo de alquiler no válido: ${property.rentalType}`)
        }

        const hasConflict = await this.hasDateConflict(propertyId,startDate,endDate)
        if(hasConflict)throw new ConflictException('La propiedad ya está reservada durante el periodo seleccionado')
        
        const reservation = this.reservationsRepository.create({
            userId,
            propertyId,
            startDate,
            endDate,
            nights,
            totalPrice,
            status: ReservationStatus.PENDING
        })

        const savedReservation = await this.reservationsRepository.save(reservation);

        const user = await this.usersService.findOne(userId);
        await this.mailService.sendReservationConfirmation(user.email, user.name, property);

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

