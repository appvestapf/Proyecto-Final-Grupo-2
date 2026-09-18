import { Reservation } from '../../reservations/entities/reservation.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @ApiProperty({ description: 'UUID generado automáticamente' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Sarah Ramirez' })
  @Column({ length: 80 })
  name: string;

  @ApiProperty({ example: 'sarah@mail.com' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column({type : 'varchar',nullable: true})
  password: string|null;

  @ApiProperty({ example: 'Calle Falsa 123, Buenos Aires' })
  @Column({type: 'varchar',nullable:true})
  address: string|null;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isAdmin: boolean;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @Column({ nullable: true })
  pfp: string;

  @Column({ type:'varchar',nullable: true, unique: true })
  googleId: string|null;

  @OneToMany(()=> Reservation, (reservation)=> reservation.user)
  reservations: Reservation[];

  //@OneToMany(() => Cita, (cita) => cita.user)
  //citas: Cita[];

  //@OneToMany(() => Reserva, (reserva) => reserva.user)
  //reservas: Reserva[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
