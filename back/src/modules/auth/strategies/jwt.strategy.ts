import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub).catch(() => null);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Usuario inexistente o dado de baja');
    return {
      id: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
      isSuperAdmin: payload.isSuperAdmin ?? false, //los tokens viejos no lo traen
      name: payload.name,
      pfp: payload.pfp,
    };
  }
}
