import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { Property } from "../properties/entities/property.entity";
import { ReservationService } from "./reservation.service";
import { ReservationController } from "./reservation.controller";
import { PassportModule } from "@nestjs/passport";

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation,Property]),
        PassportModule
    ],
    controllers: [ReservationController],
    providers: [ReservationService],
})
export class ReservationModule {}