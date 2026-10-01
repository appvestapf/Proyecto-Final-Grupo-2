import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { Property } from '../properties/entities/property.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Payment } from '../payments/entities/payment.entity';
import { ReservationStatus } from './enums/reservation-status.enum';
import { PaymentStatus } from '../payments/enums/payment-status.enum';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationsRepository: any;
  let propertiesRepository: any;
  let paymentsRepository: any;
  let usersService: any;
  let mailService: any;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn<() => Promise<any>>().mockResolvedValue(null),
      //getOne: jest.fn().mockResolvedValue(null),
    };
    reservationsRepository = {
      create: jest.fn((data: any) => data),
      save: jest.fn((data: any) => Promise.resolve({ id: 'res-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    propertiesRepository = { findOne: jest.fn() };
    paymentsRepository = { update: jest.fn() };
    usersService = { findOne: jest.fn() };
    mailService = { sendReservationConfirmation: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationsRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: propertiesRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: paymentsRepository,
        },
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  describe('createReservation', () => {
    it('lanza NotFoundException si la propiedad no existe', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createReservation({ propertyId: 'no-existe' } as any, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si la propiedad no está disponible', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isAvailable: false,
      });

      await expect(
        service.createReservation({ propertyId: 'prop-1' } as any, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('exige fecha de inicio y fin para propiedades temporarias', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isAvailable: true,
        rentalType: 'Temporario',
      });

      await expect(
        service.createReservation({ propertyId: 'prop-1' } as any, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza ConflictException si ya hay una reserva en esas fechas', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isAvailable: true,
        rentalType: 'Temporario',
        price: 100,
      });
      queryBuilder.getOne.mockResolvedValue({ id: 'otra-reserva' });

      await expect(
        service.createReservation(
          {
            propertyId: 'prop-1',
            startDate: '2026-10-01',
            endDate: '2026-10-05',
          } as any,
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('crea la reserva, calcula el precio total y manda el mail de confirmación', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isAvailable: true,
        rentalType: 'Temporario',
        price: 100,
      });
      usersService.findOne.mockResolvedValue({
        email: 'juan@gmail.com',
        name: 'Juan',
      });

      const result = await service.createReservation(
        {
          propertyId: 'prop-1',
          startDate: '2026-10-01',
          endDate: '2026-10-04',
        } as any,
        'user-1',
      );

      expect(result.nights).toBe(3);
      expect(result.totalPrice).toBe(300);
      expect(mailService.sendReservationConfirmation).toHaveBeenCalled();
    });
  });
});
