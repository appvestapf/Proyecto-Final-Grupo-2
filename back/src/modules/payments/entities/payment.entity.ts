import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PaymentStatus } from "../enums/payment-status.enum";
import { Reservation } from "../../reservations/entities/reservation.entity";

@Entity('payment')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column()
    reservationId:string

    @Column({nullable:true})
    mercadoPagoOrderId: string

    @Column({nullable:true})
    mercadoPagoPaymentId: string

    @Column({type:'decimal',precision:10,scale:2})
    amount: number

    @Column({type:'enum',enum:PaymentStatus,default:PaymentStatus.PENDING})
    status: PaymentStatus

    @CreateDateColumn()
    createdAt : Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(()=> Reservation,(reservation)=>reservation.payments)
    @JoinColumn({name: 'reservationId'})
    reservation: Reservation
}