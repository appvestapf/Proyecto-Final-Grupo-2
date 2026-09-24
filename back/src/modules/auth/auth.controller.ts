import {Body,Controller,Get,Post, Req, Res, UseGuards,} from '@nestjs/common';
import {ApiOperation,ApiResponse, ApiTags} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
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

    @Post('logout')
    @ApiOperation({
        summary: 'Cerrar sesión',
    })
    @ApiResponse({
        status: 200,
        description: 'Sesión cerrada correctamente',
    })
    logout() {
        return this.authService.logout();
    }

    @Get('google')
    @ApiOperation({
        summary: 'Iniciar el flujo de login con Google',
    })
    @UseGuards(AuthGuard('google'))
    googleAuth() {}

    @Get('google/callback')
    @ApiOperation({
        summary: 'Callback de Google OAuth (uso interno, no se llama directamente)',
    })
    @ApiResponse({
        status: 302,
        description: 'Redirige al front luego del login con Google',
    })
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req: Request,@Res() res: Response){
        const result = await this.authService.googleLogin(req.user as GoogleUser)
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${result.access_token}`)
    }
}