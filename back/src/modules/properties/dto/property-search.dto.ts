import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

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