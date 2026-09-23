import { ConflictException, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import {MercadoPagoConfig, Order} from 'mercadopago'
import { Payment } from "./entities/payment.entity";
import { PaymentStatus } from "./enums/payment-status.enum";
import { Reservation } from "../reservations/entities/reservation.entity";
import { ReservationStatus } from "../reservations/enums/reservation-status.enum";
import { Property } from "../properties/entities/property.entity";
import { User } from "../users/entities/user.entity";

@Injectable()
export class PaymentService {
    private readonly mercadoPagoClient: MercadoPagoConfig

    constructor (
        @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
        @InjectRepository(Reservation) private readonly reservationsRepository: Repository<Reservation>,
        @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ){
        this.mercadoPagoClient = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
        })
    }
    async createPayment(reservationId: string, userId: string) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId }
        });

        if (!reservation) {
            throw new NotFoundException('La reserva no existe');
        }

        if (reservation.userId !== userId) {
            throw new ForbiddenException(
                'No tenés permiso para pagar esta reserva'
            );
        }

        if (reservation.status !== ReservationStatus.PENDING) {
            throw new ConflictException(
                'La reserva no está pendiente de pago'
            );
        }

        const property = await this.propertiesRepository.findOne({
            where: { id: reservation.propertyId }
        });

        if (!property) {
            throw new NotFoundException(
                'La propiedad asociada a la reserva no existe'
            );
        }

        const user = await this.usersRepository.findOne({
            where: { id: reservation.userId }
        });

        if (!user) {
            throw new NotFoundException('El usuario no existe');
        }

        const amount = Number(reservation.totalPrice);

        const orderClient = new Order(this.mercadoPagoClient);

        const idempotencyKey = randomUUID();

        let orderResponse;

        try {
            orderResponse = await orderClient.create({
                body: {
                    type: 'online',
                    processing_mode: 'manual',
                    total_amount: amount.toFixed(2),
                    external_reference: reservation.id,

                    payer: {
                        email: user.email,
                    },

                    items: [
                        {
                            title: property.name,
                            quantity: 1,
                            unit_price: amount.toFixed(2),
                        },
                    ],
                },

                requestOptions: {
                    idempotencyKey,
                },
            });

        } catch (error) {
            console.log('ERROR MERCADO PAGO:', error);
            throw error;
        }

        if (!orderResponse.id || !orderResponse.checkout_url) {
            throw new ConflictException(
                'Mercado Pago no devolvió una orden válida'
            );
        }

        const payment = this.paymentsRepository.create({
            reservationId: reservation.id,
            mercadoPagoOrderId: orderResponse.id,
            amount,
            status: PaymentStatus.PENDING,
        });

        const savedPayment = await this.paymentsRepository.save(payment);

        return {
            paymentId: savedPayment.id,
            reservationId: reservation.id,
            status: savedPayment.status,
            paymentUrl: orderResponse.checkout_url,
        };
    }

    async handleWebhook(orderId:string){
        const orderClient = new Order(this.mercadoPagoClient)

        const order = await orderClient.get({id:orderId})

        console.log('===========ORDER MERCADO PAGO==============')
        console.log('ORDER:ID: ',order.id)
        console.log('STATUS: ',order.status)
        console.log('STATUS DETAIL: ',order.status_detail)
        console.log('EXTERNAL REFERENCE: ',order.external_reference)

        if(order.status!=='processed'||order.status_detail!=='accredited'){
            console.log('La orden todavia no está acreditada')
            return {
                received:true,
                processed:false
            }
        }
        
        const reservationId = order.external_reference
        if(!reservationId)throw new ConflictException('La orden de Mercado Pago no tiene external_reference')

        const payment = await this.paymentsRepository.findOne({where: {mercadoPagoOrderId: order.id}})
        if(!payment) throw new NotFoundException('No se encontró el pago asociado a la orden de Mercado Pago')

        const mercadoPagoPaymentId= order.transactions?.payments?.[0]?.id
        if(!mercadoPagoPaymentId)throw new ConflictException('Lo orden no contiene un ID de pago de Mercado Pago')
        if(payment.status === PaymentStatus.APPROVED){
            console.log('Este pago ya fue procesado!')
            return {
                received:true,
                processed:true,
                alreadyProcessed:true,
                paymentId: payment.id,
                mercadoPagoPaymentId: payment.mercadoPagoPaymentId,
                reservationId,
                status: payment.status
            }
        }
        payment.mercadoPagoPaymentId = mercadoPagoPaymentId
        payment.status = PaymentStatus.APPROVED
        await this.paymentsRepository.save(payment)

        const reservation = await this.reservationsRepository.findOne({where:{id:reservationId}})
        if(!reservation)throw new NotFoundException('No se encontró la reserva asociada al pago')
        reservation.status= ReservationStatus.CONFIRMED
        await this.reservationsRepository.save(reservation)

        console.log('🆗 PAGO APROBADO')
        console.log('Payment local: ',payment.id)
        console.log('Mercado Pago Payment ID: ',mercadoPagoPaymentId)
        console.log('Reservation ID: ',reservationId)
        console.log('Reservation status: ',reservation.status)

        return {
            received:true,
            processed:true,
            paymentId: payment.id,
            mercadoPagoPaymentId,
            reservationId,
            status: payment.status,
            reservationStatus: reservation.status
        }
    }

}