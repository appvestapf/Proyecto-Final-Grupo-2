import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'juan@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string;
}
