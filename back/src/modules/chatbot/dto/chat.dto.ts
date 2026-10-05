import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    example: 'Busco una casa en Buenos Aires para 4 personas',
    description: 'Consulta o mensaje enviado por el usuario al chatbot.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}