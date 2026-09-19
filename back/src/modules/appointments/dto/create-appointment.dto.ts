import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsUUID } from "class-validator";

export class CreateAppointmentDto {
    @ApiProperty({ description: 'ID de la propiedad que se desea visitar' })
    @IsUUID()
    propertyId: string;

    @ApiProperty({ description: 'Fecha y hora de la cita', example: '2026-09-25T15:00:00Z' })
    @IsDateString()
    date: string;
}
