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
  ): Promise<Boolean> {
    const conflictingReservation = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('"reservation"."propertyId" = :propertyId', { propertyId })
      .andWhere('"reservation"."status" IN (:...statuses)', {
        statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      })
      .andWhere('"reservation"."startDate"<= :endDate', { endDate })
      .andWhere('"reservation"."endDate">= :startDate', { startDate })
      .getOne();

    return !!conflictingReservation;
  }
  private calculateNights(startDate: string, endDate: string): number {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const differenceInMilliseconds = end.getTime() - start.getTime();
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    return differenceInDays;
  }
  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private addOneMonth(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`);
    date.setMonth(date.getMonth() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  async createReservation(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    const {
      propertyId,
      startDate: requestedStartDate,
      endDate: requestedEndDate,
    } = createReservationDto;

    const property = await this.propertiesRepository.findOne({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('La propiedad no existe');
    if (!property.isAvailable)
      throw new ConflictException(
        'La propiedad no está disponible para reservar',
      );
    let startDate: string;
    let endDate: string;
    let nights: number | null;
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
      startDate = this.getTodayDate();
      endDate = this.addOneMonth(startDate);
      nights = null;
      totalPrice = property.price;
    } else {
      throw new BadRequestException(
        `Tipo de alquiler no válido: ${property.rentalType}`,
      );
    }

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

    return savedReservation;
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
  async getDashboardMetrics() {
    // 1. Métricas Generales
    const { revenue } = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .select('SUM(reservation.totalPrice)', 'revenue')
      .where('reservation.status = :status', {
        status: ReservationStatus.CONFIRMED,
      })
      .getRawOne();

    const activeProperties = await this.propertiesRepository.count({
      where: { isDeleted: false, isAvailable: true },
    });

    const pendingReservations = await this.reservationsRepository.count({
      where: { status: ReservationStatus.PENDING },
    });

    const confirmedReservations = await this.reservationsRepository.count({
      where: { status: ReservationStatus.CONFIRMED },
    });

    let occupancyRate = 0;
    if (activeProperties > 0) {
      occupancyRate = Math.round(
        (confirmedReservations / activeProperties) * 100,
      );
    }

    // 2. Gráfico: Ingresos de los últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentConfirmed = await this.reservationsRepository.find({
      where: { status: ReservationStatus.CONFIRMED },
    });

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
    const revenueMap = new Map();

    // Creamos los últimos 6 meses en orden cronológico con valor 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      revenueMap.set(monthNames[d.getMonth()], 0);
    }

    // Sumamos el dinero al mes correspondiente
    recentConfirmed.forEach((res) => {
      const resDate = new Date(res.createdAt);
      if (resDate >= sixMonthsAgo) {
        const month = monthNames[resDate.getMonth()];
        if (revenueMap.has(month)) {
          revenueMap.set(month, revenueMap.get(month) + Number(res.totalPrice));
        }
      }
    });

    const revenueData = Array.from(revenueMap, ([name, total]) => ({
      name,
      total,
    }));

    // 3. Actividad Reciente: Últimas 5 reservas con datos del usuario y propiedad
    const recentActivityRaw = await this.reservationsRepository.find({
      relations: { property: true, user: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentActivity = recentActivityRaw.map((res) => ({
      id: res.id,
      user: res.user?.name || 'Usuario desconocido',
      property: res.property?.name || 'Propiedad eliminada',
      status: res.status,
      date: res.createdAt,
      amount: Number(res.totalPrice),
    }));

    return {
      monthlyRevenue: Number(revenue) || 0,
      activeProperties,
      pendingReservations,
      occupancyRate: occupancyRate > 100 ? 100 : occupancyRate,
      revenueData,
      recentActivity,
    };
  }
  async getBlockedDates(propertyId:string) {
    const reservations = await this.reservationsRepository.find({
      where: {
        propertyId,
        status: In([
          ReservationStatus.PENDING,
          ReservationStatus.CONFIRMED,
        ])
      },
      select: {
        startDate:true,
        endDate: true,
      },
      order: {
        startDate: 'ASC'
      }
    })
    return reservations.map((reservation)=>({
      startDate: reservation.startDate,
      endDate: reservation.endDate
    }))
  }
}

