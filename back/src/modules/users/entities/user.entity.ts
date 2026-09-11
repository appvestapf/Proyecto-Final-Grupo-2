import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  address: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  pfp: string;

  //@OneToMany(() => Cita, (cita) => cita.user)
  //citas: Cita[];

  //@OneToMany(() => Reserva, (reserva) => reserva.user)
  //reservas: Reserva[];
}
