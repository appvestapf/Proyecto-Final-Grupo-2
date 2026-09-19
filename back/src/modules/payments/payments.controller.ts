import { Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payments.service";
import { RequestWithUser } from "../auth/interfaces/request-whit-user.interface";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Request } from "express";

@Controller('payments')
export class PaymentsController{
    constructor(
        private readonly paymentsService: PaymentService
    ){}

    @Post('webhook')
    webhook(@Req() req: Request) {
        console.log('🚨🚨🚨 MERCADO PAGO / WEBHOOK RECIBIDO 🚨🚨🚨');
        console.log('========== WEBHOOK ==========');
        console.log('BODY:', req.body);
        console.log('QUERY:', req.query);
        console.log('HEADERS:', req.headers);
        console.log('=============================');

        return { received: true };
    }

    @Post(':reservationId')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    createPayment(@Param('reservationId')reservationId:string,@Req()req: RequestWithUser ){ 
        return this.paymentsService.createPayment(reservationId,req.user.id)
    }

}