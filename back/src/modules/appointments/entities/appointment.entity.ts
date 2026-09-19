import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Property } from "../../properties/entities/property.entity";

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    propertyId: string;

    @Column({
        type: 'timestamp',
    })
    date: Date;

    @Column({ default: 'pending' })
    status: string;

    @ManyToOne(() => User, (user) => user.appointments)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Property, (property) => property.appointments)
    @JoinColumn({ name: 'propertyId' })
    property: Property;
}
