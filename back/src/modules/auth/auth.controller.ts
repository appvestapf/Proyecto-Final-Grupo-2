import {Body,Controller,Get,Post, Req, Res, UseGuards,} from '@nestjs/common';
import {ApiOperation,ApiResponse, ApiTags} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AUTH_RESPONSE_EXAMPLE, MESSAGE_EXAMPLE } from '../../common/swagger/examples';
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
        schema: { example: AUTH_RESPONSE_EXAMPLE },
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
        status: 201,
        description: 'Login exitoso: devuelve user y access_token',
        schema: { example: AUTH_RESPONSE_EXAMPLE },
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos',
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciales inválidas, o el usuario se registró con Google y no tiene contraseña',
    })
    @ApiResponse({
        status: 403,
        description: 'Cuenta bloqueada 15 minutos por 5 intentos fallidos seguidos',
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('forgot-password')
    @ApiOperation({
        summary: 'Solicitar el restablecimiento de contraseña',
    })
    @ApiResponse({
        status: 201,
        description: 'Se envió un mail con instrucciones (si el email existe)',
        schema: { example: MESSAGE_EXAMPLE('Si el email está registrado, vas a recibir instrucciones para restablecer tu contraseña') },
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
    @ApiOperation({
        summary: 'Restablecer la contraseña con el token recibido por mail',
    })
    @ApiResponse({
        status: 201,
        description: 'Contraseña actualizada correctamente',
        schema: { example: MESSAGE_EXAMPLE('Contraseña actualizada correctamente') },
    })
    @ApiResponse({
        status: 400,
        description: 'La contraseña no cumple los requisitos o no coincide con confirmPassword',
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
        description: 'El JWT no se invalida en el servidor: el front tiene que borrar el token',
    })
    @ApiResponse({
        status: 201,
        description: 'Sesión cerrada correctamente',
        schema: { example: MESSAGE_EXAMPLE('Sesión cerrada correctamente') },
    })
    logout() {
        return this.authService.logout();
    }

    @Get('google')
    @ApiOperation({
        summary: 'Iniciar el flujo de login con Google',
        description: 'No se puede probar desde Swagger: abrir la URL en el navegador',
    })
    @ApiResponse({
        status: 302,
        description: 'Redirige a la pantalla de login de Google',
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