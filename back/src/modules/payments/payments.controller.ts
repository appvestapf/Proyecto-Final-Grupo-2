import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payments.service";
import { RequestWithUser } from "../auth/interfaces/request-whit-user.interface";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";

@Controller('payments')
export class PaymentsController {

    constructor(
        private readonly paymentsService: PaymentService
    ) {}

    @Post('webhook')
    @ApiOperation({
        summary: 'Recibir notificaciones de Mercado Pago',
        description: 'Recibe las notificaciones enviadas por MercadoPago y actualiza el estado del pago y de la reserva cuando el pago sea acreditado'
    })
    @ApiResponse({
        status:201,
        description: 'Notificacion recibida y procesada correctamente',
        schema: {
            example: {
                received: true,
                processed: true,
                paymentId: 'UUID',
                mercadoPagoPaymentId: '123456789',
                reservationId: 'UUID',
                status: 'approved',
                reservationStatus: 'confirmed',               
            }
        }
    })
    @ApiResponse({
        status:400,
        description: 'La notificación recibida no tiene un formato válido'
    })
    @ApiResponse({
        status:404,
        description:'No se encontró el pago o la reserva asociada'
    })
    @ApiResponse({
        status:409,
        description:'La orden no contiene la información necesaria o el pago no puede ser procesado'
    })
    webhook(@Req() req: Request) {
        console.log('🚨 WEBHOOK RECIBIDO 🚨');
        console.log('BODY:', req.body);

        const orderId = req.body?.data?.id;

        if (!orderId) {
            console.log('❌ El webhook no contiene data.id');

            return {
                received: true,
                processed: false,
            };
        }

        // Procesamos el webhook después de responder a Mercado Pago
        setImmediate(() => {
            this.paymentsService.handleWebhook(orderId)
                .then((result) => {
                    console.log('✅ WEBHOOK PROCESADO:', result);
                })
                .catch((error) => {
                    console.error('❌ ERROR PROCESANDO WEBHOOK:', error);
                });
        });

        return {
            received: true,
        };
    }

    @Get(':reservationId/status')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary:'Consultar el estado del pago de una reserva',
        description:'Devuelve el estado actual del pago y de la reserva asociada'
    })
    @ApiResponse({
        status:200,
        description:'Estado del pago obtenido correctamente',
        schema:{
        example: {
            reservationId: 'UUID',
            reservationStatus: 'confirmed',
            paymentId: 'UUID',
            paymentStatus: 'approved',
            mercadoPagoOrderId: 'ORDTST01...',
            mercadoPagoPaymentId: '123456789',
            amount: 3000,
        }
        }
    })
    @ApiResponse({
        status:401,
        description:'Usuario no autenticado'
    })
    @ApiResponse({
        status:404,
        description:'No se encontró la reserva o el pago asociado'
    })
    getPaymentsStatus(@Param('reservationId')reservationId:string,@Req()req: Request){
        const user = req.user as {id: string}
        return this.paymentsService.getPaymentStatus(reservationId,user.id)
    }

    @Post(':reservationId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Crear un pago para una reserva',
        description:'Crea una orden de pago en Mercado Pago para la reserva indicada y devuelve la URL de checkout'
    })
    @ApiResponse({
        status:201,
        description:'Pago creado correctamente',
        schema: {
            example: {
                paymentId: 'UUID',
                reservationId: 'UUID',
                status: 'pending',
                paymentUrl:'https://www.mercadopago.com/checkout/v1/redirect?pref_id=123456789',                
            }
        }
    })
    @ApiResponse({
        status:401,
        description:'Usuario no autenticado o token JWT inválido'
    })
    @ApiResponse({
        status:403,
        description:'El usuario no tiene permisos para pagar esta reserva'
    })
    @ApiResponse({
        status:404,
        description:'La reseva, propiedad o usuario asociado no existe'
    })
    @ApiResponse({
        status:409,
        description:'La reserva no está pendiende de pago o Mercado Pago no devolvió una orden valida'
    })
    createPayment(
        @Param('reservationId') reservationId: string,
        @Req() req: RequestWithUser
    ) {
        return this.paymentsService.createPayment(
            reservationId,
            req.user.id
        );
    }
}