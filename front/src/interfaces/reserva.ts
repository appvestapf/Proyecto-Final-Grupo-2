import { Property } from './property';
import { User } from './user';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reserva {
  id: string;
  userId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  nights: number | null;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  months?: number | null;
  property?: Property;
  user?: User;
  payments?: any[];
}