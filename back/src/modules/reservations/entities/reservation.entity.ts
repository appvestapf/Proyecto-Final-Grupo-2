import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Property } from "../../properties/entities/property.entity";
import { ReservationStatus } from "../enums/reservation-status.enum";
import { Payment } from "../../payments/entities/payment.entity";

@Entity('reservations')
export class Reservation{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId : string;

    @Column()
    propertyId: string;

    @Column({type:'enum',enum:ReservationStatus,default:ReservationStatus.PENDING})
    status: ReservationStatus

    @Column({
        type: 'timestamp',
        default: ()=> 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;


    @ManyToOne(()=> User, (user)=> user.reservations)
    @JoinColumn({name: 'userId'})
    user: User;

    @ManyToOne(()=> Property, (property)=> property.reservations)
    @JoinColumn({name: 'propertyId'})
    property: Property;

    @OneToMany(()=>Payment,(payment)=>payment.reservation)
    payments: Payment[]

}