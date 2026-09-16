import {IsEmail,IsNotEmpty,IsString,} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'juan@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}