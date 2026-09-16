import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { SignUpDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService{
    constructor(
        private readonly usersService : UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async signup(signupDto: SignUpDto){
        const existingUser = await this.usersService.findByEmail(signupDto.email)
        if(existingUser)throw new ConflictException('El email ya está registrado')
        
        const hashedPassword= await bcrypt.hash(signupDto.password,10)

        const user = await this.usersService.create({
            ...signupDto,
            password: hashedPassword,
        })

        const {password,...userWithoutPassword} = user

        return userWithoutPassword
    }

    async login(loginDto: LoginDto){
        const user = await this.usersService.findByEmail(loginDto.email)

        if(!user)throw new UnauthorizedException('Credenciales inválidas')
        
        const passwordValid = await bcrypt.compare(loginDto.password, user.password)

        if(!passwordValid)throw new UnauthorizedException('Credenciales inválidas')

        const payload = {
            sub: user.id,
            email: user.email,
        }

        const accessToken = await this.jwtService.signAsync(payload)

        return {
            acces_token : accessToken
        }
    }
}