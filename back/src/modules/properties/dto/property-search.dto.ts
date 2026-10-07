import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class PropertySearchDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate debe tener formato YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate debe tener formato YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  endDate?: string;

  /** Para residenciales: startDate + months en vez de endDate */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(6)
  @Max(36)
  months?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsIn(['Temporario', 'Residencial'])
  rentalType?: string;

  @IsOptional()
  @IsIn(['noche', 'mes'])
  priceUnit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isPetFriendly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number;
}
