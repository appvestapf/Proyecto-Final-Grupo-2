import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { Reservation } from "../reservations/entities/reservation.entity";
import { Property } from "../properties/entities/property.entity";
import { User } from "../users/entities/user.entity";
import { PaymentsController } from "./payments.controller";
import { PaymentService } from "./payments.service";
import { MailModule } from "../mail/mail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Payment,Reservation,Property,User
        ]),
        MailModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentService],
    exports: [PaymentService]
})
export class PaymentsModule {}