import { Body, Controller, Post, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReservationService } from "./reservation.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService){}

    @Post()
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Crear una nueva reserva' })
    create(@Body() createReservationDto: CreateReservationDto, @Req() req: Request){
        const user = req.user as {id: string}
        return this.reservationService.createReservation(createReservationDto, user.id)
    }

    @Get('me')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Obtener todas las reservas del usuario logueado' })
    findMyReservations(@Req() req: Request) {
        const user = req.user as { id: string };
        return this.reservationService.findByUser(user.id);
    }
}