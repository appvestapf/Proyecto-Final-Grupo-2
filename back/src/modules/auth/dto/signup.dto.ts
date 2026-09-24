import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../decorators/match.decorator';

export class SignupDto {
  @ApiProperty({
    example: 'Juan Perez',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiProperty({
    example: 'juan@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    required: true,
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(50, {
    message: 'La contraseña no puede superar los 50 caracteres',
  })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe contener al menos una mayúscula',
  })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe contener al menos una minúscula',
  })
  @Matches(/[0-9]/, {
    message: 'La contraseña debe contener al menos un número',
  })
  password: string;

  @ApiProperty({
    example: 'Password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Match('password', {
    message: 'Las contraseñas no coinciden',
  })
  confirmPassword: string;

  @ApiProperty({
    example: 'Av. Santa Fe 1234',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}