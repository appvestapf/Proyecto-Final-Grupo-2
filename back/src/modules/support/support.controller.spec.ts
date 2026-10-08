import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SupportController } from './support.controller';
import { MailService } from '../mail/mail.service';

describe('SupportController', () => {
  let controller: SupportController;
  let mailService: any;

  beforeEach(async () => {
    mailService = { sendSupportRequest: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [{ provide: MailService, useValue: mailService }],
    }).compile();

    controller = module.get<SupportController>(SupportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('envía la consulta por mail y devuelve un mensaje de confirmación', async () => {
    const dto = {
      name: 'Juan Pérez',
      email: 'juan.perez@ejemplo.com',
      subject: 'Soporte Técnico',
      message: 'No puedo cargar las fotos de mi propiedad.',
    };

    const result = await controller.contact(dto as any);

    expect(mailService.sendSupportRequest).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'Consulta enviada correctamente' });
  });
});
