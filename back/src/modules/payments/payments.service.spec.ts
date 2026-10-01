import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { PaymentStatus } from './enums/payment-status.enum';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';

const orderGetMock = jest.fn();

jest.unstable_mockModule('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Order: jest.fn().mockImplementation(() => ({
    get: orderGetMock,
  })),
}));

let PaymentService: typeof import('./payments.service').PaymentService;

beforeAll(async () => {
  ({ PaymentService } = await import('./payments.service'));
});

describe('PaymentService', () => {
  let service: any;
  let paymentsRepository: any;
  let reservationsRepository: any;
  let propertiesRepository: any;
  let usersRepository: any;
  let mailService: any;

  beforeEach(async () => {
    orderGetMock.mockReset();
    paymentsRepository = { findOne: jest.fn(), save: jest.fn() };
    reservationsRepository = { findOne: jest.fn(), save: jest.fn() };
    propertiesRepository = { findOne: jest.fn() };
    usersRepository = { findOne: jest.fn() };
    mailService = { sendPaymentConfirmation: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: paymentsRepository },
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationsRepository,
        },
        { provide: getRepositoryToken(Property), useValue: propertiesRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get(PaymentService);
  });

  describe('handleWebhook', () => {
    it('no procesa nada si la orden todavía no está acreditada', async () => {
      orderGetMock.mockResolvedValue({
        status: 'pending',
        status_detail: 'pending',
      });

      const result = await service.handleWebhook('order-1');

      expect(result).toEqual({ received: true, processed: false });
      expect(reservationsRepository.save).not.toHaveBeenCalled();
    });

    it('no reprocesa un pago que ya estaba aprobado', async () => {
      orderGetMock.mockResolvedValue({
        id: 'order-1',
        status: 'processed',
        status_detail: 'accredited',
        external_reference: 'res-1',
        transactions: { payments: [{ id: 'mp-payment-1' }] },
      });
      paymentsRepository.findOne.mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      });

      const result = await service.handleWebhook('order-1');

      expect(result.alreadyProcessed).toBe(true);
      expect(paymentsRepository.save).not.toHaveBeenCalled();
      expect(reservationsRepository.save).not.toHaveBeenCalled();
    });

    it('confirma la reserva y manda el mail de pago aprobado', async () => {
      orderGetMock.mockResolvedValue({
        id: 'order-1',
        status: 'processed',
        status_detail: 'accredited',
        external_reference: 'res-1',
        transactions: { payments: [{ id: 'mp-payment-1' }] },
      });
      paymentsRepository.findOne.mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.PENDING,
        amount: 100,
      });
      reservationsRepository.findOne.mockResolvedValue({
        id: 'res-1',
        propertyId: 'prop-1',
        userId: 'user-1',
        status: ReservationStatus.PENDING,
      });
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        name: 'Depto Centro',
      });
      usersRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'juan@gmail.com',
        name: 'Juan',
      });
      paymentsRepository.save.mockImplementation((p: any) => Promise.resolve(p));
      reservationsRepository.save.mockImplementation((r: any) =>
        Promise.resolve(r),
      );

      const result = await service.handleWebhook('order-1');

      expect(reservationsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ReservationStatus.CONFIRMED }),
      );
      expect(mailService.sendPaymentConfirmation).toHaveBeenCalledWith(
        'juan@gmail.com',
        'Juan',
        expect.objectContaining({ id: 'prop-1' }),
        100,
      );
      expect(result.processed).toBe(true);
    });
  });
});
