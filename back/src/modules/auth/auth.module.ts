import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";
import { AuthService } from "./auth.service";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";

@Module({
    imports: [
        UsersModule,
        MailModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '1h'
            }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy]
})

export class AuthModule {}