import { Property } from "@/interfaces/property";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const mapBackendToProperty = (item: any): Property => ({
  ...item,
  title: item.name, // Tu vista de detalle usa property.title
  location: `${item.city}, ${item.country}` // Unificamos ciudad y país
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