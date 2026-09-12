// Datos puros que vienen de la Base de Datos (DER)
export interface BaseProperty {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  price: number;
  isAvailable: boolean;
}

// Extensión para la UI / Frontend (obligatorios u opcionales según necesites)
export interface Property extends BaseProperty {
  title: string;
  priceUnit: 'noche' | 'mes';
  rentalType: 'Temporario' | 'Residencial';
  rating: number;
  area: number;
  lat?: number;
  lng?: number;
  rooms: number;
  bathrooms: number;
  isPetFriendly: boolean;
  hasGarage: boolean;
  images: string[];
}