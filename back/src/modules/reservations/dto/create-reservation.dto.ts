import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class CreateReservationDto {
    @ApiProperty({description: 'ID de la propiedad que se desea reservar'})
    @IsUUID()
    propertyId: string;

    @ApiPropertyOptional({description:'Fecha de inicio de la reserva. Obligatoria para propiedades temporarias',example:'2026-10-15'})
    @IsOptional()
    @IsDateString()
    startDate?:string;

    @ApiPropertyOptional({description:'Fecha de finalización de la reserva. Obligatoria para propiedades temporarias',example:'2026-10-20'})
    @IsOptional()
    @IsDateString()
    endDate?:string;
}