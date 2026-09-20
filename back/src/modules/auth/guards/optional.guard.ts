import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { info } from 'console';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    console.log('GUARD - err:', err);
    console.log('GUARD - user:', user);
    console.log('GUARD - info:', info);
    return user;
  }
}
