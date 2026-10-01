import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entities/appointment.entity';
import { Property } from '../properties/entities/property.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let appointmentsRepository: any;
  let propertiesRepository: any;
  let usersService: any;
  let mailService: any;
  let queryBuilder: any;

  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    appointmentsRepository = {
      create: jest.fn((data: any) => data),
      save: jest.fn((data: any) => Promise.resolve({ id: 'appt-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    propertiesRepository = { findOne: jest.fn() };
    usersService = { findOne: jest.fn() };
    mailService = {
      sendAppointmentConfirmation: jest.fn(),
      sendNewAppointmentToOwner: jest.fn(),
      sendAppointmentRescheduled: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: appointmentsRepository,
        },
        { provide: getRepositoryToken(Property), useValue: propertiesRepository },
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  describe('createAppointment', () => {
    it('rechaza una fecha que no es futura', async () => {
      await expect(
        service.createAppointment(
          { propertyId: 'prop-1', date: pastDate.toISOString() } as any,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza NotFoundException si la propiedad no existe o está borrada', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAppointment(
          { propertyId: 'prop-1', date: futureDate.toISOString() } as any,
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si ya hay una cita cerca de ese horario', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isDeleted: false,
        owner: null,
      });
      queryBuilder.getOne.mockResolvedValue({ id: 'otra-cita' });

      await expect(
        service.createAppointment(
          { propertyId: 'prop-1', date: futureDate.toISOString() } as any,
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('crea la cita y avisa al visitante y al dueño por mail', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        name: 'Depto Centro',
        isDeleted: false,
        owner: { email: 'dueño@gmail.com', name: 'Dueño' },
      });
      usersService.findOne.mockResolvedValue({
        email: 'visitante@gmail.com',
        name: 'Visitante',
      });

      await service.createAppointment(
        { propertyId: 'prop-1', date: futureDate.toISOString() } as any,
        'user-1',
      );

      expect(mailService.sendAppointmentConfirmation).toHaveBeenCalled();
      expect(mailService.sendNewAppointmentToOwner).toHaveBeenCalled();
    });

    it('no falla si la propiedad no tiene dueño asignado', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        name: 'Depto Centro',
        isDeleted: false,
        owner: null,
      });
      usersService.findOne.mockResolvedValue({
        email: 'visitante@gmail.com',
        name: 'Visitante',
      });

      await service.createAppointment(
        { propertyId: 'prop-1', date: futureDate.toISOString() } as any,
        'user-1',
      );

      expect(mailService.sendNewAppointmentToOwner).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('lanza NotFoundException si la cita no existe', async () => {
      appointmentsRepository.findOne.mockResolvedValue(null);

      await expect(service.confirm('no-existe', 'user-1', false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rechaza si quien confirma no es el dueño ni admin', async () => {
      appointmentsRepository.findOne.mockResolvedValue({
        id: 'appt-1',
        propertyId: 'prop-1',
        status: 'pending',
      });
      propertiesRepository.findOne.mockResolvedValue({
        owner: { id: 'owner-1' },
      });

      await expect(
        service.confirm('appt-1', 'otro-usuario', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rechaza si la cita ya está confirmada', async () => {
      appointmentsRepository.findOne.mockResolvedValue({
        id: 'appt-1',
        propertyId: 'prop-1',
        status: 'confirmed',
      });
      propertiesRepository.findOne.mockResolvedValue({
        owner: { id: 'owner-1' },
      });

      await expect(service.confirm('appt-1', 'owner-1', false)).rejects.toThrow(
        ConflictException,
      );
    });

    it('permite al dueño de la propiedad confirmar la cita', async () => {
      const appointment = {
        id: 'appt-1',
        propertyId: 'prop-1',
        status: 'pending',
      };
      appointmentsRepository.findOne.mockResolvedValue(appointment);
      propertiesRepository.findOne.mockResolvedValue({
        owner: { id: 'owner-1' },
      });
      appointmentsRepository.save.mockImplementation((a: any) =>
        Promise.resolve(a),
      );

      const result = await service.confirm('appt-1', 'owner-1', false);

      expect(result.status).toBe('confirmed');
    });

    it('permite a un admin confirmar aunque no sea el dueño', async () => {
      appointmentsRepository.findOne.mockResolvedValue({
        id: 'appt-1',
        propertyId: 'prop-1',
        status: 'pending',
      });
      propertiesRepository.findOne.mockResolvedValue({
        owner: { id: 'owner-1' },
      });
      appointmentsRepository.save.mockImplementation((a: any) =>
        Promise.resolve(a),
      );

      const result = await service.confirm('appt-1', 'admin-1', true);

      expect(result.status).toBe('confirmed');
    });
  });

  describe('reschedule', () => {
    it('rechaza reprogramar una cita cancelada', async () => {
      appointmentsRepository.findOne.mockResolvedValue({
        id: 'appt-1',
        userId: 'user-1',
        status: 'cancelled',
      });

      await expect(
        service.reschedule('appt-1', 'user-1', {
          date: futureDate.toISOString(),
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rechaza una nueva fecha que no es futura', async () => {
      appointmentsRepository.findOne.mockResolvedValue({
        id: 'appt-1',
        userId: 'user-1',
        status: 'pending',
      });

      await expect(
        service.reschedule('appt-1', 'user-1', {
          date: pastDate.toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('reprograma la cita y vuelve a pending', async () => {
      appointmentsRepository.findOne.mockResolvedValue({
        id: 'appt-1',
        userId: 'user-1',
        propertyId: 'prop-1',
        status: 'confirmed',
      });
      propertiesRepository.findOne.mockResolvedValue({
        name: 'Depto Centro',
        owner: null,
      });
      usersService.findOne.mockResolvedValue({
        email: 'visitante@gmail.com',
        name: 'Visitante',
      });
      appointmentsRepository.save.mockImplementation((a: any) =>
        Promise.resolve(a),
      );

      const result = await service.reschedule('appt-1', 'user-1', {
        date: futureDate.toISOString(),
      });

      expect(result.status).toBe('pending');
      expect(mailService.sendAppointmentRescheduled).toHaveBeenCalled();
    });
  });
});
