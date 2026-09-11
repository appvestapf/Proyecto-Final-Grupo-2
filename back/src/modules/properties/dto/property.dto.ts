import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class PropertyDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  lat: number;

  @IsOptional()
  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  rentalType: string;

  @IsOptional()
  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsNumber()
  rooms: number;

  @IsOptional()
  @IsNumber()
  bathrooms: number;

  @IsOptional()
  @IsBoolean()
  isPetFriendly: boolean;

  @IsOptional()
  @IsBoolean()
  hasGarage: boolean;

  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;
}
