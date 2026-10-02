import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  ParseEnumPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payments.service';
import {
  PAYMENT_EXAMPLE,
  PROPERTY_EXAMPLE,
  RESERVATION_EXAMPLE,
  USER_EXAMPLE,
} from '../../common/swagger/examples';
import { RequestWithUser } from '../auth/interfaces/request-whit-user.interface';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentStatus } from './enums/payment-status.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'Listar todos los pagos con su reserva, usuario y propiedad (admin)',
  })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiResponse({
    status: 200,
    description: 'Listado de pagos',
    schema: { example: [{ ...PAYMENT_EXAMPLE, reservation: { ...RESERVATION_EXAMPLE, status: 'confirmed', user: USER_EXAMPLE, property: PROPERTY_EXAMPLE } }] },
  })
  @ApiResponse({ status: 400, description: 'El status no es válido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo un admin puede listar los pagos' })
  findAll(
    @Query('status', new ParseEnumPipe(PaymentStatus, { optional: true }))
    status?: PaymentStatus,
  ) {
    return this.paymentsService.findAll(status);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Recibir notificaciones de Mercado Pago',
    description:
      'Recibe las notificaciones enviadas por MercadoPago y actualiza el estado del pago y de la reserva cuando el pago sea acreditado',
  })
  @ApiResponse({
    status: 201,
    description:
      'Siempre responde 201 al instante. Si el body trae data.id, el pago se procesa en segundo plano y los errores solo quedan en los logs. Si no lo trae, devuelve processed: false',
    schema: {
      oneOf: [
        { example: { received: true } },
        { example: { received: true, processed: false } },
      ],
    },
  })
  webhook(@Req() req: Request) {
    console.log('🚨 WEBHOOK RECIBIDO 🚨');
    console.log('BODY:', req.body);

    const orderId = req.body?.data?.id;

    if (!orderId) {
      console.log('❌ El webhook no contiene data.id');

      return {
        received: true,
        processed: false,
      };
    }

    // Procesamos el webhook después de responder a Mercado Pago
    setImmediate(() => {
      this.paymentsService
        .handleWebhook(orderId)
        .then((result) => {
          console.log('✅ WEBHOOK PROCESADO:', result);
        })
        .catch((error) => {
          console.error('❌ ERROR PROCESANDO WEBHOOK:', error);
        });
    });

    return {
      received: true,
    };
  }

  @Get(':reservationId/status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Consultar el estado del pago de una reserva',
    description:
      'Devuelve el estado actual del pago y de la reserva asociada. Solo para el dueño de la reserva: para cualquier otro usuario, admins incluidos, responde 404',
  })
  @ApiParam({ name: 'reservationId', description: 'UUID de la reserva' })
  @ApiResponse({
    status: 200,
    description: 'Estado del pago obtenido correctamente',
    schema: {
      example: {
        reservationId: 'UUID',
        reservationStatus: 'confirmed',
        paymentId: 'UUID',
        paymentStatus: 'approved',
        mercadoPagoOrderId: 'ORDTST01...',
        mercadoPagoPaymentId: '123456789',
        amount: 3000,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado',
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 404,
    description:
      'La reserva no existe, no es del usuario, o todavía no tiene un pago',
  })
  getPaymentsStatus(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.paymentsService.getPaymentStatus(reservationId, user.id);
  }

  @Post(':reservationId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Crear un pago para una reserva',
    description:
      'Crea una orden de pago en Mercado Pago para la reserva indicada y devuelve la URL de checkout. Solo el dueño de la reserva, y la reserva tiene que estar pendiente',
  })
  @ApiParam({ name: 'reservationId', description: 'UUID de la reserva' })
  @ApiResponse({
    status: 201,
    description: 'Pago creado correctamente',
    schema: {
      example: {
        paymentId: 'UUID',
        reservationId: 'UUID',
        status: 'pending',
        paymentUrl:
          'https://www.mercadopago.com/checkout/v1/redirect?pref_id=123456789',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 401,
    description: 'Usuario no autenticado o token JWT inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para pagar esta reserva',
  })
  @ApiResponse({
    status: 404,
    description: 'La reserva, propiedad o usuario asociado no existe',
  })
  @ApiResponse({
    status: 409,
    description:
      'La reserva no está pendiente de pago o Mercado Pago no devolvió una orden válida',
  })
  createPayment(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.paymentsService.createPayment(reservationId, req.user.id);
  }
}
