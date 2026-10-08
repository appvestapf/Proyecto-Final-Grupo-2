import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MESSAGE_EXAMPLE } from '../../common/swagger/examples';
import { MailService } from '../mail/mail.service';
import { ContactSupportDto } from './dto/contact-support.dto';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact')
  @ApiOperation({
    summary: 'Enviar una consulta de soporte por mail',
    description:
      'Endpoint público. Manda un mail a la casilla de soporte del equipo con los datos del formulario de contacto.',
  })
  @ApiResponse({
    status: 201,
    description: 'Consulta enviada correctamente',
    schema: { example: MESSAGE_EXAMPLE },
  })
  @ApiResponse({ status: 400, description: 'Datos del formulario inválidos' })
  async contact(@Body() contactSupportDto: ContactSupportDto) {
    await this.mailService.sendSupportRequest(contactSupportDto);
    return { message: 'Consulta enviada correctamente' };
  }
}
