import {Body,Controller,Get,Post, Req, UseGuards,} from '@nestjs/common';
import {ApiOperation,ApiResponse, ApiTags} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { GoogleUser } from './interfaces/google-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('signup')
    @ApiOperation({
        summary: 'Registrar un nuevo usuario',
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario registrado correctamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de registro inválidos',
    })
    @ApiResponse({
        status: 409,
        description: 'El email ya está registrado',
    })
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Iniciar sesión',
    })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciales inválidas',
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthCallback(@Req() req: Request){
        return this.authService.googleLogin(req.user as GoogleUser)
    }
}