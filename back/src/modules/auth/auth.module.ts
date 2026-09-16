import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        UsersModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '1h'
            }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService]
})

export class AuthModule {}