import { Property } from '@/interfaces/property';
import mockPropertiesData from '@/services/mock-properties.json';

// Función adaptador para transformar los datos crudos del mock a la interfaz Property
const mapMockToProperty = (item: any): Property => ({
  ...item,
  id: String(item.id), // Asegura que el ID sea string según BaseProperty
  name: item.title,    // Usa el título como nombre para cumplir con BaseProperty
});

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mappedProperties = (mockPropertiesData as any[]).map(mapMockToProperty);
        resolve(mappedProperties);
      }, 300);
    });
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = (mockPropertiesData as any[]).find((p) => String(p.id) === id);
        resolve(found ? mapMockToProperty(found) : undefined);
      }, 300);
    });
  },
};