import { Property } from "@/interfaces/property";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PropertySearchParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  rentalType?: string;
  maxPrice?: number;
  isPetFriendly?: boolean;
}

const mapBackendToProperty = (item: any): Property => ({
  ...item,
  title: item.name || item.title,
  location: item.location || `${item.city || ''}, ${item.country || ''}`.replace(/^, |, $/g, '')
});

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      const response = await fetch(`${API_URL}/properties`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Error al obtener propiedades');      
      const data = await response.json();
      return data.map(mapBackendToProperty);
    } catch (error) {
      console.error("Error obteniendo propiedades:", error);
      return []; 
    }
  },

  async searchProperties(params: PropertySearchParams): Promise<Property[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.keyword?.trim()) {
        queryParams.append('keyword', params.keyword.trim());
      }
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      if (typeof params.capacity === 'number' && params.capacity > 0) {
        queryParams.append('capacity', params.capacity.toString());
      }

      if (params.rentalType?.trim()) {
        queryParams.append('rentalType', params.rentalType.trim());
      }

      if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice) && params.maxPrice > 0) {
        queryParams.append('maxPrice', params.maxPrice.toString());
      }

      if (typeof params.isPetFriendly === 'boolean') {
        queryParams.append('isPetFriendly', params.isPetFriendly.toString());
      }

      // Sanitización y formato de coordenadas/radio
      if (
        typeof params.lat === 'number' && Number.isFinite(params.lat) &&
        typeof params.lng === 'number' && Number.isFinite(params.lng)
      ) {
        queryParams.append('lat', params.lat.toFixed(6));
        queryParams.append('lng', params.lng.toFixed(6));
        
        if (typeof params.radius === 'number' && Number.isFinite(params.radius)) {
          queryParams.append('radius', Math.max(1, Math.round(params.radius)).toString());
        }
      }

      const queryString = queryParams.toString();
      const url = `${API_URL}/properties/search${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.warn(`[searchProperties] El servidor respondió con estado: ${response.status}`);
        throw new Error(`Error en la búsqueda (${response.status})`);
      }

      const data = await response.json();
      return data.map(mapBackendToProperty);
    } catch (error) {
      console.error("Error buscando propiedades:", error);
      return [];
    }
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, { cache: 'no-store' });
      
      if (!response.ok) return undefined;
      
      const data = await response.json();
      return mapBackendToProperty(data);
    } catch (error) {
      console.error(`Error obteniendo la propiedad ${id}:`, error);
      return undefined;
    }
  },
};