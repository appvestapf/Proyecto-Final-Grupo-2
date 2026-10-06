import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { Property } from '../properties/entities/property.entity';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Payment } from '../payments/entities/payment.entity';

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
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn<() => Promise<any>>().mockResolvedValue(null),
      getMany: jest.fn<() => Promise<any>>().mockResolvedValue([]),
      getRawMany: jest.fn<() => Promise<any>>().mockResolvedValue([]),
    };
    reservationsRepository = {
      create: jest.fn((data: any) => data),
      save: jest.fn((data: any) => Promise.resolve({ id: 'res-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
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
            startDate: '2099-10-01',
            endDate: '2099-10-05',
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
          startDate: '2099-10-01',
          endDate: '2099-10-04',
        } as any,
        'user-1',
      );

      expect(result.nights).toBe(3);
      expect(result.totalPrice).toBe(300);
      expect(mailService.sendReservationConfirmation).toHaveBeenCalled();
    });

    it('rechaza una fecha de inicio pasada', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isAvailable: true,
        rentalType: 'Temporario',
        price: 100,
      });

      await expect(
        service.createReservation(
          {
            propertyId: 'prop-1',
            startDate: '2020-01-01',
            endDate: '2020-01-05',
          } as any,
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    describe('Residencial', () => {
      const residencial = {
        id: 'prop-1',
        isAvailable: true,
        rentalType: 'Residencial',
        price: 500000,
      };

      beforeEach(() => {
        propertiesRepository.findOne.mockResolvedValue(residencial);
        usersService.findOne.mockResolvedValue({
          email: 'ana@gmail.com',
          name: 'Ana',
        });
      });

      it('sin months toma 6 meses y cobra el primer mes', async () => {
        const result = await service.createReservation(
          { propertyId: 'prop-1', startDate: '2099-01-15' } as any,
          'user-1',
        );

        expect(result.startDate).toBe('2099-01-15');
        expect(result.endDate).toBe('2099-07-15');
        expect(result.months).toBe(6);
        expect(result.nights).toBeNull();
        expect(result.totalPrice).toBe(500000);
      });

      it('respeta los meses pedidos', async () => {
        const result = await service.createReservation(
          { propertyId: 'prop-1', startDate: '2099-03-01', months: 12 } as any,
          'user-1',
        );

        expect(result.endDate).toBe('2100-03-01');
        expect(result.months).toBe(12);
      });

      it('ajusta al último día del mes (31/08 + 6 meses = 28/02)', async () => {
        const result = await service.createReservation(
          { propertyId: 'prop-1', startDate: '2098-08-31' } as any,
          'user-1',
        );

        expect(result.endDate).toBe('2099-02-28');
      });

      it('rechaza menos de 6 meses', async () => {
        await expect(
          service.createReservation(
            { propertyId: 'prop-1', startDate: '2099-01-01', months: 3 } as any,
            'user-1',
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    it('cancela las reservas PENDING vencidas y sus pagos antes de reservar', async () => {
      queryBuilder.getRawMany.mockResolvedValue([{ id: 'reserva-vieja' }]);
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isAvailable: true,
        rentalType: 'Residencial',
        price: 500000,
      });
      usersService.findOne.mockResolvedValue({
        email: 'ana@gmail.com',
        name: 'Ana',
      });

      await service.createReservation(
        { propertyId: 'prop-1', startDate: '2099-01-01' } as any,
        'user-1',
      );

      expect(reservationsRepository.update).toHaveBeenCalled();
      expect(paymentsRepository.update).toHaveBeenCalled();
    });
  });
});
