import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
  Patch,
  Param,
  ParseEnumPipe,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import {
  PAYMENT_EXAMPLE,
  PROPERTY_EXAMPLE,
  RESERVATION_EXAMPLE,
  USER_EXAMPLE,
} from '../../common/swagger/examples';
import { CreateReservationDto } from './dto/create-reservation.dto';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ReservationStatus } from './enums/reservation-status.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Crear una nueva reserva',
    description:
      'Temporaria: startDate y endDate obligatorias, totalPrice = precio × noches. Residencial: sin fechas, va de hoy a un mes y totalPrice = precio mensual. La reserva queda pendiente de pago',
  })
  @ApiResponse({
    status: 201,
    description: 'Reserva creada (status pending)',
    schema: { example: RESERVATION_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description:
      'Faltan las fechas en una temporaria, el inicio no es anterior al fin, o los datos no son válidos',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'La propiedad no existe' })
  @ApiResponse({
    status: 409,
    description:
      'La propiedad no está disponible o ya está reservada en esas fechas',
  })
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.reservationService.createReservation(
      createReservationDto,
      user.id,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar todas las reservas con usuario, propiedad y pagos (admin)',
  })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  @ApiResponse({
    status: 200,
    description: 'Listado de reservas',
    schema: { example: [{ ...RESERVATION_EXAMPLE, user: USER_EXAMPLE, property: PROPERTY_EXAMPLE, payments: [PAYMENT_EXAMPLE] }] },
  })
  @ApiResponse({ status: 400, description: 'El status no es válido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Solo un admin puede listar todas las reservas',
  })
  findAll(
    @Query('status', new ParseEnumPipe(ReservationStatus, { optional: true }))
    status?: ReservationStatus,
  ) {
    return this.reservationService.findAll(status);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Cancelar una reserva (el dueño si está pendiente; un admin cualquiera)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada. requiresRefund = true si ya estaba pagada',
    schema: { example: { id: RESERVATION_EXAMPLE.id, status: 'cancelled', requiresRefund: false } },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 403, description: 'La reserva no es tuya' })
  @ApiResponse({ status: 404, description: 'La reserva no existe' })
  @ApiResponse({
    status: 409,
    description: 'Ya estaba cancelada, o está pagada y no sos admin',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = req.user as {
      id: string;
      isAdmin: boolean;
      isSuperAdmin?: boolean;
    };
    return this.reservationService.cancel(id, {
      id: user.id,
      isAdmin: !!(user.isAdmin || user.isSuperAdmin),
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener todas las reservas del usuario logueado' })
  @ApiResponse({
    status: 200,
    description: 'Reservas del usuario, con su propiedad, de la más nueva a la más vieja',
    schema: { example: [{ ...RESERVATION_EXAMPLE, property: PROPERTY_EXAMPLE }] },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findMyReservations(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.reservationService.findByUser(user.id);
  }
  @Get('admin/metrics')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Obtener métricas para el dashboard de administrador',
  })
  @ApiResponse({
    status: 200,
    description:
      'monthlyRevenue, activeProperties, pendingReservations, occupancyRate, revenueData (últimos 6 meses) y recentActivity (últimas 5 reservas)',
    schema: {
      example: {
        monthlyRevenue: 125000,
        activeProperties: 18,
        pendingReservations: 4,
        occupancyRate: 61,
        revenueData: [
          { name: 'May', total: 0 },
          { name: 'Jun', total: 18000 },
          { name: 'Jul', total: 22500 },
          { name: 'Ago', total: 30100 },
          { name: 'Sep', total: 27400 },
          { name: 'Oct', total: 27000 },
        ],
        recentActivity: [
          {
            id: RESERVATION_EXAMPLE.id,
            user: 'Sarah Ramirez',
            property: 'Departamento Palermo',
            status: 'confirmed',
            date: '2026-10-01T18:30:00.000Z',
            amount: 4250,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  getDashboardMetrics(@Req() req: Request) {
    const user = req.user as { isAdmin: boolean };

    // Medida de seguridad: Bloquear si no es admin
    if (!user.isAdmin) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }

    return this.reservationService.getDashboardMetrics();
  }
}
