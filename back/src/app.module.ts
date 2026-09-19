import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import 'dotenv/config';
import { AuthModule } from './modules/auth/auth.module';
import { ReservationModule } from './modules/reservations/reservation.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
    PropertiesModule,
    AuthModule,
    ReservationModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
