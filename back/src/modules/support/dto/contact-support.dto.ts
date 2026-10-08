import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const SUPPORT_SUBJECTS = [
  'Soporte Técnico',
  'Pagos y Señas',
  'Inmobiliarias',
  'Otros',
] as const;

export class ContactSupportDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'juan.perez@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Soporte Técnico', enum: SUPPORT_SUBJECTS })
  @IsIn(SUPPORT_SUBJECTS)
  subject: string;

  @ApiProperty({ example: 'No puedo cargar las fotos de mi propiedad.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}
