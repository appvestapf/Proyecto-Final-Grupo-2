import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { GoogleUser } from "../interfaces/google-user.interface";
import { Profile } from "passport";

@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    'google',
){
    constructor(){
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ['email', 'profile'],
            passReqToCallback: false,
        })
    }
    async validate(
        accessToken: string,
        refreshToken:string,
        profile:Profile,
    ): Promise<GoogleUser>{
        const email = profile.emails?.[0].value;

        if(!email) throw new UnauthorizedException('Google no proporcionó un email válido')

        return {
            googleId: profile.id,
            email,
            name: profile.displayName,
            pfp: profile.photos?.[0].value,
        }
    }
}