import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class RescheduleAppointmentDto {
    @ApiProperty({ description: 'Nueva fecha y hora de la cita', example: '2026-09-30T15:00:00Z' })
    @IsDateString()
    date: string;
}
