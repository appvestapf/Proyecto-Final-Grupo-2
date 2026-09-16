import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Departamento Palermo', required: true })
  @IsString()
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

  @ApiProperty({ example: 'Argentina', required: true })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Buenos Aires', required: true })
  @IsString()
  city: string;

  @ApiProperty({ example: -34.5889, required: false })
  @IsOptional()
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -58.4309, required: false })
  @IsOptional()
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 'temporario', required: true })
  @IsString()
  rentalType: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  rooms: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  bathrooms: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPetFriendly: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  hasGarage: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({
    example: ['https://res.cloudinary.com/tucuenta/image1.jpg'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
