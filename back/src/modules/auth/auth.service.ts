import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { MailService } from "../mail/mail.service";
import { JwtService } from "@nestjs/jwt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcrypt'
import { GoogleUser } from "./interfaces/google-user.interface";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) { }

    async signup(signupDto: SignupDto) {
        const existingUser = await this.usersService.findByEmail(signupDto.email)
        if (existingUser) throw new ConflictException('El email ya está registrado')

        const { confirmPassword, ...userData } = signupDto

        const user = await this.usersService.create(userData)

        await this.mailService.sendWelcomeEmail(user.email, user.name)

        const payload = {
            sub: user.id,
            email: user.email,
        }

        const accessToken = await this.jwtService.signAsync(payload)

        const { password, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            access_token: accessToken
        }
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email)

        if (!user) throw new UnauthorizedException('Credenciales inválidas')
        
        if(!user.password) throw new UnauthorizedException('Este usuario no tiene contraseña, inicia sesión con Google')

        const passwordValid = await bcrypt.compare(loginDto.password, user.password)

        if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas')

        const payload = {
            sub: user.id,
            email: user.email,
        }

        const accessToken = await this.jwtService.signAsync(payload)

        const { password, ...userWithoutPassword } = user


        return {
            user: userWithoutPassword,
            access_token: accessToken
        }
    }

    async logout() {
        // JWT es stateless: no hay nada que invalidar del lado del servidor.
        // El frontend es responsable de borrar el token guardado (localStorage/cookies).
        return { message: 'Sesión cerrada correctamente' }
    }

    async googleLogin(googleUser: GoogleUser) {
        let user = await this.usersService.findByEmail(
            googleUser.email,
        );

        if (!user) {
            user = await this.usersService.create({
                name: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.googleId,
                pfp: googleUser.pfp,
                password: null,
                address: null,
            });

            await this.mailService.sendWelcomeEmail(user.email, user.name)
        } else if (
            user.googleId &&
            user.googleId !== googleUser.googleId
        ) {
            throw new UnauthorizedException(
                'La cuenta de Google no coincide con el usuario',
            );
        } else if (!user.googleId) {
            throw new ConflictException(
                'Ya existe una cuenta con este email. Iniciá sesión con email y contraseña.',
            );
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken =
            await this.jwtService.signAsync(payload);

        return {
            access_token: accessToken,
        };
    }
}