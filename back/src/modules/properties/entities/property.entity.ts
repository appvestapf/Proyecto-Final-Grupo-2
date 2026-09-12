import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column('decimal')
  lat: number;

  @Column('decimal')
  lng: number;

  @Column()
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
}

// @ManyToOne(() => User, (user) => user.properties)
// owner: User;

// @OneToMany(() => Cita, (cita) => cita.property)
// citas: Cita[];

// @OneToMany(() => Reserva, (reserva) => reserva.property)
// reservas: Reserva[];

// @OneToMany(() => PropImage, (propImage) => propImage.property)
// images: PropImage[];
