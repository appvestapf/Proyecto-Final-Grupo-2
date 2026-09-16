import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ length: 60 })
  country: string;

  @Column({ length: 60 })
  city: string;

  @Column('decimal')
  lat: number;

  @Column('decimal')
  lng: number;

  @Column({ length: 30 })
  rentalType: string;

  @Column()
  capacity: number;

  @Column()
  rooms: number;

  @Column()
  bathrooms: number;

  @Column({ default: false })
  isPetFriendly: boolean;

  @Column({ default: false })
  hasGarage: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @Column('text', { array: true, default: [] })
  images: string[];
}
// @ManyToOne(() => User, (user) => user.properties)
// owner: User;

// @OneToMany(() => Cita, (cita) => cita.property)
// citas: Cita[];

// @OneToMany(() => Reserva, (reserva) => reserva.property)
// reservas: Reserva[];

// @OneToMany(() => PropImage, (propImage) => propImage.property)
// images: PropImage[];
