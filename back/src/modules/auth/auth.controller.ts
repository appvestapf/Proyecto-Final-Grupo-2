import {Body,Controller,Get,Post, Req, Res, UseGuards,} from '@nestjs/common';
import {ApiOperation,ApiResponse, ApiTags} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
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

    @Post('forgot-password')
    @ApiOperation({
        summary: 'Solicitar el restablecimiento de contraseña',
    })
    @ApiResponse({
        status: 200,
        description: 'Se envió un mail con instrucciones (si el email existe)',
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @ApiOperation({
        summary: 'Restablecer la contraseña con el token recibido por mail',
    })
    @ApiResponse({
        status: 200,
        description: 'Contraseña actualizada correctamente',
    })
    @ApiResponse({
        status: 401,
        description: 'El token es inválido o expiró',
    })
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
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