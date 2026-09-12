import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class PropertyDto {
  @ApiProperty({ example: 'Departamento Palermo', required: true })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Moderno departamento cerca de todo',
    required: true,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: 850, required: true })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Argentina', required: true })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({ example: 'Buenos Aires', required: true })
  @IsOptional()
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
  @IsOptional()
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

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hasGarage: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;
}
