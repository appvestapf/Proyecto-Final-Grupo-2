import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { In, Repository } from 'typeorm';
import { Property } from '../properties/entities/property.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from './enums/reservation-status.enum';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../payments/enums/payment-status.enum';

// ── Reglas de disponibilidad (también las usan properties y payments) ──

export const PENDING_TTL_MINUTES = 30;
export const RESIDENTIAL_MIN_MONTHS = 6;
export const RESIDENTIAL_MAX_MONTHS = 36;

/** Hoy en hora Argentina (YYYY-MM-DD). */
export function todayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Suma meses con tope al fin de mes: 31/08 + 6 = 28/02. */
export function addMonths(dateString: string, months: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const index = month - 1 + months;
  const targetYear = year + Math.floor(index / 12);
  const targetMonth = index % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  const targetDay = Math.min(day, lastDay);
  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(
    targetDay,
  ).padStart(2, '0')}`;
}

/** La reserva ocupa fechas si está CONFIRMED, o PENDING con menos de 30 min. */
export function blockingReservationSql(alias: string): string {
  return `("${alias}"."status" = :blockingConfirmed OR ("${alias}"."status" = :blockingPending AND "${alias}"."createdAt" > LOCALTIMESTAMP - INTERVAL '${PENDING_TTL_MINUTES} minutes'))`;
}

export const blockingReservationParams = {
  blockingConfirmed: ReservationStatus.CONFIRMED,
  blockingPending: ReservationStatus.PENDING,
};

/** Superposición con checkout libre: quien sale el 10 no bloquea el 10. */
export function overlapSql(alias: string): string {
  return `"${alias}"."startDate" < :endDate AND "${alias}"."endDate" > :startDate`;
}

/** Cancela las PENDING vencidas y sus pagos pendientes. Devuelve los ids. */
export async function expireStalePendingReservations(
  reservationsRepository: Repository<Reservation>,
  paymentsRepository: Repository<Payment>,
): Promise<string[]> {
  const stale: { id: string }[] = await reservationsRepository
    .createQueryBuilder('reservation')
    .select('"reservation"."id"', 'id')
    .where('"reservation"."status" = :pending', {
      pending: ReservationStatus.PENDING,
    })
    .andWhere(
      `"reservation"."createdAt" <= LOCALTIMESTAMP - INTERVAL '${PENDING_TTL_MINUTES} minutes'`,
    )
    .getRawMany();

  const ids = stale.map((row) => row.id);
  if (ids.length === 0) return [];

  await reservationsRepository.update(
    { id: In(ids), status: ReservationStatus.PENDING },
    { status: ReservationStatus.CANCELLED },
  );
  await paymentsRepository.update(
    { reservationId: In(ids), status: PaymentStatus.PENDING },
    { status: PaymentStatus.CANCELLED },
  );
  return ids;
}

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  private async hasDateConflict(
    propertyId: string,
    startDate: string,
    endDate: string,
  ): Promise<boolean> {
    const conflict = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('"reservation"."propertyId" = :propertyId', { propertyId })
      .andWhere(
        blockingReservationSql('reservation'),
        blockingReservationParams,
      )
      .andWhere(overlapSql('reservation'), { startDate, endDate })
      .getOne();

    return !!conflict;
  }

  private calculateNights(startDate: string, endDate: string): number {
    const start = Date.parse(`${startDate}T00:00:00Z`);
    const end = Date.parse(`${endDate}T00:00:00Z`);
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  }

  async createReservation(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    const {
      propertyId,
      startDate: requestedStartDate,
      endDate: requestedEndDate,
      months: requestedMonths,
    } = createReservationDto;

    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('La propiedad no existe');
    if (!property.isAvailable)
      throw new ConflictException(
        'La propiedad no está disponible para reservar',
      );

    const today = todayDateString();
    if (requestedStartDate && requestedStartDate < today)
      throw new BadRequestException(
        'La fecha de inicio no puede ser anterior a hoy',
      );

    let startDate: string;
    let endDate: string;
    let nights: number | null = null;
    let months: number | null = null;
    let totalPrice: number;

    if (property.rentalType === 'Temporario') {
      if (!requestedStartDate || !requestedEndDate)
        throw new BadRequestException(
          'Las propiedades temporarias requieren fecha de inicio y de finalizacion',
        );
      if (requestedStartDate >= requestedEndDate)
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de finalización',
        );
      startDate = requestedStartDate;
      endDate = requestedEndDate;

      nights = this.calculateNights(startDate, endDate);
      if (nights < 1) {
        throw new BadRequestException(
          'La reserva debe tener al menos una noche',
        );
      }
      totalPrice = property.price * nights;
    } else if (property.rentalType === 'Residencial') {
      months = requestedMonths ?? RESIDENTIAL_MIN_MONTHS;
      if (months < RESIDENTIAL_MIN_MONTHS || months > RESIDENTIAL_MAX_MONTHS)
        throw new BadRequestException(
          `Los alquileres residenciales son de ${RESIDENTIAL_MIN_MONTHS} a ${RESIDENTIAL_MAX_MONTHS} meses`,
        );
      startDate = requestedStartDate ?? today;
      endDate = addMonths(startDate, months);
      // Al reservar se paga el primer mes
      totalPrice = property.price;
    } else {
      throw new BadRequestException(
        `Tipo de alquiler no válido: ${property.rentalType}`,
      );
    }

    // Libera las fechas de reservas pendientes que nunca se pagaron
    await expireStalePendingReservations(
      this.reservationsRepository,
      this.paymentsRepository,
    );

    const hasConflict = await this.hasDateConflict(
      propertyId,
      startDate,
      endDate,
    );
    if (hasConflict)
      throw new ConflictException(
        'La propiedad ya está reservada durante el periodo seleccionado',
      );

    const reservation = this.reservationsRepository.create({
      userId,
      propertyId,
      startDate,
      endDate,
      nights,
      totalPrice,
      status: ReservationStatus.PENDING,
    });

    const savedReservation =
      await this.reservationsRepository.save(reservation);

    const user = await this.usersService.findOne(userId);
    await this.mailService.sendReservationConfirmation(
      user.email,
      user.name,
      property,
    );

    return { ...savedReservation, months };
  }

  async findAll(status?: ReservationStatus) {
    return this.reservationsRepository.find({
      where: status ? { status } : {},
      relations: { user: true, property: true, payments: true },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(id: string, requester: { id: string; isAdmin: boolean }) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: { payments: true },
    });
    if (!reservation) throw new NotFoundException('La reserva no existe');

    const isOwner = reservation.userId === requester.id;
    if (!isOwner && !requester.isAdmin) {
      throw new ForbiddenException(
        'No podés cancelar una reserva que no es tuya',
      );
    }
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('La reserva ya está cancelada');
    }
    if (
      reservation.status === ReservationStatus.CONFIRMED &&
      !requester.isAdmin
    ) {
      throw new ConflictException(
        'La reserva ya está pagada. Para cancelarla contactá a un administrador',
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationsRepository.save(reservation);

    await this.paymentsRepository.update(
      { reservationId: id, status: PaymentStatus.PENDING },
      { status: PaymentStatus.CANCELLED },
    );

    const requiresRefund = !!reservation.payments?.some(
      (p) => p.status === PaymentStatus.APPROVED,
    );

    return { id: reservation.id, status: reservation.status, requiresRefund };
  }

  async findByUser(userId: string) {
    return this.reservationsRepository.find({
      where: { userId },
      relations: { property: true },
      order: { createdAt: 'DESC' },
    });
  }
  async getDashboardMetrics(user: {
  id: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}) {
  const isSuperAdmin = user.isSuperAdmin;

  // ==========================================
  // 1. INGRESOS TOTALES
  // ==========================================

  const revenueQuery = this.reservationsRepository
    .createQueryBuilder('reservation')
    .leftJoin('reservation.property', 'property')
    .select('SUM(reservation.totalPrice)', 'revenue')
    .where('reservation.status = :status', {
      status: ReservationStatus.CONFIRMED,
    });

  if (!isSuperAdmin) {
    revenueQuery.andWhere(
      'property.ownerId = :ownerId',
      {
        ownerId: user.id,
      },
    );
  }

  const { revenue } = await revenueQuery.getRawOne();

  // ==========================================
  // 2. PROPIEDADES ACTIVAS
  // ==========================================

  const activePropertiesQuery =
    this.propertiesRepository
      .createQueryBuilder('property')
      .where('property.isDeleted = :isDeleted', {
        isDeleted: false,
      })
      .andWhere('property.isAvailable = :isAvailable', {
        isAvailable: true,
      });

  if (!isSuperAdmin) {
    activePropertiesQuery.andWhere(
      'property.ownerId = :ownerId',
      {
        ownerId: user.id,
      },
    );
  }

  const activeProperties =
    await activePropertiesQuery.getCount();

  // ==========================================
  // 3. RESERVAS PENDIENTES
  // ==========================================

  const pendingReservationsQuery =
    this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.property', 'property')
      .where('reservation.status = :status', {
        status: ReservationStatus.PENDING,
      });

  if (!isSuperAdmin) {
    pendingReservationsQuery.andWhere(
      'property.ownerId = :ownerId',
      {
        ownerId: user.id,
      },
    );
  }

  const pendingReservations =
    await pendingReservationsQuery.getCount();

  // ==========================================
  // 4. RESERVAS CONFIRMADAS
  // ==========================================

  const confirmedReservationsQuery =
    this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.property', 'property')
      .where('reservation.status = :status', {
        status: ReservationStatus.CONFIRMED,
      });

  if (!isSuperAdmin) {
    confirmedReservationsQuery.andWhere(
      'property.ownerId = :ownerId',
      {
        ownerId: user.id,
      },
    );
  }

  const confirmedReservations =
    await confirmedReservationsQuery.getCount();

  // ==========================================
  // 5. OCUPACIÓN
  // ==========================================

  let occupancyRate = 0;

  if (activeProperties > 0) {
    occupancyRate = Math.round(
      (confirmedReservations / activeProperties) * 100,
    );
  }

  // ==========================================
  // 6. INGRESOS ÚLTIMOS 6 MESES
  // ==========================================

  const sixMonthsAgo = new Date();

  sixMonthsAgo.setMonth(
    sixMonthsAgo.getMonth() - 6,
  );

  const recentConfirmedQuery =
    this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.property', 'property')
      .where('reservation.status = :status', {
        status: ReservationStatus.CONFIRMED,
      });

  if (!isSuperAdmin) {
    recentConfirmedQuery.andWhere(
      'property.ownerId = :ownerId',
      {
        ownerId: user.id,
      },
    );
  }

  const recentConfirmed =
    await recentConfirmedQuery.getMany();

  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  const revenueMap = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();

    d.setMonth(d.getMonth() - i);

    revenueMap.set(
      monthNames[d.getMonth()],
      0,
    );
  }

  recentConfirmed.forEach((res) => {
    const resDate = new Date(res.createdAt);

    if (resDate >= sixMonthsAgo) {
      const month =
        monthNames[resDate.getMonth()];

      if (revenueMap.has(month)) {
        revenueMap.set(
          month,
          revenueMap.get(month)! +
            Number(res.totalPrice),
        );
      }
    }
  });

  const revenueData = Array.from(
    revenueMap,
    ([name, total]) => ({
      name,
      total,
    }),
  );

  // ==========================================
  // 7. ACTIVIDAD RECIENTE
  // ==========================================

  const recentActivityQuery =
    this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect(
        'reservation.property',
        'property',
      )
      .leftJoinAndSelect(
        'reservation.user',
        'user',
      )
      .orderBy(
        'reservation.createdAt',
        'DESC',
      )
      .take(5);

  if (!isSuperAdmin) {
    recentActivityQuery.andWhere(
      'property.ownerId = :ownerId',
      {
        ownerId: user.id,
      },
    );
  }

  const recentActivityRaw =
    await recentActivityQuery.getMany();

  const recentActivity =
    recentActivityRaw.map((res) => ({
      id: res.id,
      user:
        res.user?.name ||
        'Usuario desconocido',
      property:
        res.property?.name ||
        'Propiedad eliminada',
      status: res.status,
      date: res.createdAt,
      amount: Number(res.totalPrice),
    }));

  // ==========================================
  // 8. RESPONSE
  // ==========================================

  return {
    monthlyRevenue:
      Number(revenue) || 0,

    activeProperties,

    pendingReservations,

    occupancyRate:
      occupancyRate > 100
        ? 100
        : occupancyRate,

    revenueData,

    recentActivity,
  };
}

  async getBlockedDates(propertyId: string) {
    const reservations = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .select([
        'reservation.id',
        'reservation.startDate',
        'reservation.endDate',
      ])
      .where('"reservation"."propertyId" = :propertyId', { propertyId })
      .andWhere(
        blockingReservationSql('reservation'),
        blockingReservationParams,
      )
      .andWhere('"reservation"."endDate" > :today', {
        today: todayDateString(),
      })
      .orderBy('reservation.startDate', 'ASC')
      .getMany();

    // endDate es el día de salida: ese día queda libre para otra reserva
    return reservations.map((r) => ({
      startDate: r.startDate,
      endDate: r.endDate,
    }));
  }
}
