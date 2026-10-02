import { Body, Controller, Post } from '@nestjs/common';
import {ApiBody,ApiOperation,ApiResponse,ApiTags,} from '@nestjs/swagger';

import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/chat.dto';

@ApiTags('Chatbot')
@Controller('chat')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Enviar mensaje al chatbot',
    description:
      'Recibe una consulta del usuario y devuelve una respuesta del chatbot. ' +
      'Si la consulta corresponde a una búsqueda de propiedades, también devuelve las propiedades encontradas.',
  })
  @ApiBody({
    type: ChatDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de consulta',
        value: {
          message: 'Busco una casa en Buenos Aires para 4 personas',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta generada correctamente por el chatbot.',
  })
  @ApiResponse({
    status: 400,
    description: 'El mensaje es inválido o está vacío.',
  })
  @ApiResponse({
    status: 503,
    description: 'El servicio de IA no está disponible temporalmente.',
  })
  chat(@Body() chatDto: ChatDto) {
    return this.chatbotService.chat(chatDto.message);
  }
}