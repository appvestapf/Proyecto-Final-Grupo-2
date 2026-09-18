import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../../reservations/entities/reservation.entity';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value),
};

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  price: number;

  @Column({ length: 10 })
  priceUnit: string;

  @Column({ length: 60 })
  country: string;

  @Column({ length: 60 })
  city: string;

  @Column('decimal', { transformer: numericTransformer })
  lat: number;

  @Column('decimal', { transformer: numericTransformer })
  lng: number;

  @Column({ length: 30 })
  rentalType: string;

  @Column()
  capacity: number;

  @Column()
  rooms: number;

  @Column()
  bathrooms: number;

  @Column()
  area: number;

  @Column('decimal', {
    precision: 3,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  rating: number;

  @Column({ default: false })
  isPetFriendly: boolean;

  @Column({ default: false })
  hasGarage: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @Column('text', { array: true, default: [] })
  images: string[];

  @OneToMany(()=> Reservation, (reservation)=> reservation.property)
  reservations: Reservation[];
}

// @ManyToOne(() => User, (user) => user.properties)
// owner: User;

// @OneToMany(() => Cita, (cita) => cita.property)
// citas: Cita[];

// @OneToMany(() => PropImage, (propImage) => propImage.property)
// images: PropImage[];
