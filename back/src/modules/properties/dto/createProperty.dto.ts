import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsIn,
  IsUrl,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Departamento Palermo', required: true })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Moderno departamento cerca de todo',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 850, required: true })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'noche',
    enum: ['noche', 'mes'],
    required: true,
  })
  @IsIn(['noche', 'mes'])
  priceUnit: string;

  @ApiProperty({ example: 'Argentina', required: true })
  @IsString()
  @MaxLength(60)
  country: string;

  @ApiProperty({ example: 'Buenos Aires', required: true })
  @IsString()
  @MaxLength(60)
  city: string;

  @ApiProperty({ example: -34.5889, required: true })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -58.4309, required: true })
  @IsNumber()
  lng: number;

  @ApiProperty({
    example: 'Temporario',
    enum: ['Temporario', 'Residencial'],
    required: true,
  })
  @IsIn(['Temporario', 'Residencial'])
  rentalType: string;

  @ApiProperty({ example: 4, required: true })
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 2, required: true })
  @IsNumber()
  rooms: number;

  @ApiProperty({ example: 1, required: true })
  @IsNumber()
  bathrooms: number;

  @ApiProperty({ example: 65, required: true })
  @IsNumber()
  area: number;

  @ApiProperty({ example: true, required: true })
  @IsBoolean()
  isPetFriendly: boolean;

  @ApiProperty({ example: false, required: true })
  @IsBoolean()
  hasGarage: boolean;

  @ApiProperty({ example: true, required: true })
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({
    example: ['https://res.cloudinary.com/tucuenta/image1.jpg'],
    required: true,
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  images: string[];

  @ApiPropertyOptional({
    description:
      'Si la propiedad está dada de baja (se usa para reactivarla por PATCH)',
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
