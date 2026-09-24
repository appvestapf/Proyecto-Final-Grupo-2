import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('appointments')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Post()
    @ApiOperation({ summary: 'Agendar una cita para visitar una propiedad' })
    @ApiResponse({ status: 201, description: 'Cita creada correctamente' })
    @ApiResponse({ status: 404, description: 'La propiedad no existe' })
    create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.appointmentService.createAppointment(createAppointmentDto, user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar mis citas (todas las del sistema si sos admin)' })
    @ApiResponse({ status: 200, description: 'Listado de citas' })
    findAll(@Req() req: Request) {
        const user = req.user as { id: string; isAdmin: boolean };
        if (user.isAdmin) {
            return this.appointmentService.findAllAdmin();
        }
        return this.appointmentService.findAllByUser(user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar una cita por id' })
    @ApiParam({ name: 'id', description: 'UUID de la cita' })
    @ApiResponse({ status: 200, description: 'Cita encontrada' })
    @ApiResponse({ status: 403, description: 'La cita no pertenece al usuario logueado' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.appointmentService.findOne(id, user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancelar una cita' })
    @ApiParam({ name: 'id', description: 'UUID de la cita' })
    @ApiResponse({ status: 200, description: 'Cita cancelada correctamente' })
    @ApiResponse({ status: 403, description: 'La cita no pertenece al usuario logueado' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const user = req.user as { id: string };
        return this.appointmentService.cancel(id, user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Reprogramar una cita (queda pendiente de confirmar de nuevo)' })
    @ApiParam({ name: 'id', description: 'UUID de la cita' })
    @ApiResponse({ status: 200, description: 'Cita reprogramada correctamente' })
    @ApiResponse({ status: 403, description: 'La cita no pertenece al usuario logueado' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    reschedule(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() rescheduleDto: RescheduleAppointmentDto,
        @Req() req: Request,
    ) {
        const user = req.user as { id: string };
        return this.appointmentService.reschedule(id, user.id, rescheduleDto);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Confirmar una cita (dueño de la propiedad, o admin)' })
    @ApiParam({ name: 'id', description: 'UUID de la cita' })
    @ApiResponse({ status: 200, description: 'Cita confirmada correctamente' })
    @ApiResponse({ status: 403, description: 'No podés confirmar esta cita' })
    @ApiResponse({ status: 404, description: 'Cita no encontrada' })
    confirm(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const user = req.user as { id: string; isAdmin: boolean };
        return this.appointmentService.confirm(id, user.id, user.isAdmin);
    }
}
