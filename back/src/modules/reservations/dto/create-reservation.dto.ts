import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'ID de la propiedad que se desea reservar' })
  @IsUUID()
  propertyId: string;

  @ApiPropertyOptional({
    description:
      'Fecha de inicio (YYYY-MM-DD). Obligatoria para temporarias. En residenciales es la fecha de mudanza; si no se envía, se toma hoy. No puede ser pasada.',
    example: '2026-11-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate debe tener formato YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'Fecha de salida (YYYY-MM-DD). Solo para temporarias; el día de salida queda libre para otra reserva.',
    example: '2026-11-05',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate debe tener formato YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  endDate?: string;

  @ApiPropertyOptional({
    description:
      'Duración en meses. Solo para residenciales: de 6 a 36. Si no se envía, se toman 6.',
    example: 12,
    minimum: 6,
    maximum: 36,
  })
  @IsOptional()
  @IsInt()
  @Min(6)
  @Max(36)
  months?: number;
}
