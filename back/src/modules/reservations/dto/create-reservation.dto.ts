import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateReservationDto {
    @ApiProperty({description: 'ID de la propiedad que se desea reservar'})
    @IsUUID()
    propertyId: string;
}