import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PropertySearchDto {
    @IsOptional()
    @IsString()
    keyword?:string;

    @IsOptional()
    @IsDateString()
    startDate?:string;

    @IsOptional()
    @IsDateString()
    endDate?:string;

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    capacity?:number;

    @IsOptional()
    @IsIn(['Temporario', 'Residencial'])
    rentalType?:string;

    @IsOptional()
    @IsIn(['noche', 'mes'])
    priceUnit?:string;

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(0)
    maxPrice?:number;

    @IsOptional()
    @Transform(({ value }) => {
      if (value === 'true' || value === true) return true;
      if (value === 'false' || value === false) return false;
      return value;
    })
    @IsBoolean()
    isPetFriendly?:boolean;

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    lat?:number;

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    lng?:number;

    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    radius?:number;
}