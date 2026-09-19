import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";

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
    @ApiOperation({ summary: 'Listar mis citas' })
    @ApiResponse({ status: 200, description: 'Listado de citas del usuario logueado' })
    findAll(@Req() req: Request) {
        const user = req.user as { id: string };
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
}
