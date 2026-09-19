import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { Appointment } from "./entities/appointment.entity";
import { Property } from "../properties/entities/property.entity";
import { AppointmentService } from "./appointment.service";
import { AppointmentController } from "./appointment.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Appointment, Property]),
        PassportModule,
    ],
    controllers: [AppointmentController],
    providers: [AppointmentService],
})
export class AppointmentModule {}
