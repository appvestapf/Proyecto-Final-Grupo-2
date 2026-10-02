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

// Extensión para la UI / Frontend
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

// Estructura simplificada que usa PropertyMap para renderizar pines y popups
export interface PropertyLocation {
  id: string | number;
  title: string;
  price: number;
  lat: number;
  lng: number;
  image?: string;
  address?: string;
  city?: string;
}

// Props que acepta el componente PropertyMap
export interface PropertyMapProps {
  properties: PropertyLocation[];
  hoveredPropertyId?: string | number | null;
  onSelectProperty?: (id: string | number) => void;
  onAreaSearch?: (lat: number, lng: number, radius: number) => void;
  initialLat?: number;
  initialLng?: number;
  zoom?: number;
  showPopup?: boolean;
  simpleMarker?: boolean;
}