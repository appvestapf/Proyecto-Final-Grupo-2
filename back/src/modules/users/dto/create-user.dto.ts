import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Sarah Ramirez', description: 'Nombre completo del usuario' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'sarah@mail.com', description: 'Email único del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 8, description: 'Contraseña, mínimo 8 caracteres' })
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Calle Falsa 123, Buenos Aires', description: 'Dirección del usuario' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  pfp?: string;
}
