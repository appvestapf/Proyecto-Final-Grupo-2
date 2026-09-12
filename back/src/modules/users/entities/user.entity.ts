import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @Column()
  password: string;

  @ApiProperty({ example: 'Calle Falsa 123, Buenos Aires' })
  @Column()
  address: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  isAdmin: boolean;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @Column({ nullable: true })
  pfp: string;

  //@OneToMany(() => Cita, (cita) => cita.user)
  //citas: Cita[];

  //@OneToMany(() => Reserva, (reserva) => reserva.user)
  //reservas: Reserva[];
}
