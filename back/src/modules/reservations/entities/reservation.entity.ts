import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Property } from "../../properties/entities/property.entity";

@Entity('reservations')
export class Reservation{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId : string;

    @Column()
    propertyId: string;

    @Column({default: 'confirmed'})
    status: string;

    @Column({
        type: 'timestamp',
        default: ()=> 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @ManyToOne(()=> User, (user)=> user.reservations)
    @JoinColumn({name: 'userId'})
    user: User;

    @ManyToOne(()=> Property, (property)=> property.reservations)
    @JoinColumn({name: 'propertyId'})
    property: Property;

}