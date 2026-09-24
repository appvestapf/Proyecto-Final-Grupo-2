import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { Property } from "../properties/entities/property.entity";
import { ReservationService } from "./reservation.service";
import { ReservationController } from "./reservation.controller";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation,Property]),
        PassportModule,
        UsersModule,
        MailModule,
    ],
    controllers: [ReservationController],
    providers: [ReservationService],
})
export class ReservationModule {}