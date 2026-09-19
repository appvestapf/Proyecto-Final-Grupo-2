import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payments.service";
import { RequestWithUser } from "../auth/interfaces/request-whit-user.interface";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";

@Controller('payments')
export class PaymentsController {

    constructor(
        private readonly paymentsService: PaymentService
    ) {}

    @Post('webhook')
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

    @Post(':reservationId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
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