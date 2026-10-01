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
  @ApiOperation({ summary: 'Crear una nueva reserva' })
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
  })
  @ApiResponse({ status: 403, description: 'La reserva no es tuya' })
  @ApiResponse({ status: 404, description: 'La reserva no existe' })
  @ApiResponse({
    status: 409,
    description: 'Ya estaba cancelada, o está pagada y no sos admin',
  })
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
  getDashboardMetrics(@Req() req: Request) {
    const user = req.user as { isAdmin: boolean };

    // Medida de seguridad: Bloquear si no es admin
    if (!user.isAdmin) {
      throw new ForbiddenException('Acceso denegado. Solo administradores.');
    }

    return this.reservationService.getDashboardMetrics();
  }
}
