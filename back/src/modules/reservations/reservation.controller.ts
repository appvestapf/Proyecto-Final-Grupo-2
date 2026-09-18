import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
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
    create(@Body() createReservationDto: CreateReservationDto, @Req() req: Request){
        const user = req.user as {id: string}

        return this.reservationService.createReservation(createReservationDto, user.id)
    }
}
