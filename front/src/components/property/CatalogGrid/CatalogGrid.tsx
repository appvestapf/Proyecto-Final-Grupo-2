"use client";
import { useState, useEffect } from 'react';
import { CardInmueble } from '../CardInmueble/CardInmueble';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Property } from '@/interfaces/property';
import { propertyService } from '@/services/propertyService'; // Ajusta tu ruta exacta

export const CatalogGrid = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [hydratedItems, setHydratedItems] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  useEffect(() => {
    const fetchData = async () => {
      const data = await propertyService.getProperties();
      setProperties(data);
    };
    fetchData();
  }, []);

  // Matemática del paginado
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = properties.slice(startIndex, startIndex + itemsPerPage);

  // 2. Hidratar SOLO los items de la página actual (Performance)
  useEffect(() => {
    const hydrateCurrentPage = async () => {
      const updatedItems = await Promise.all(
        currentItems.map(async (prop) => {
          if (prop.rentalType === 'Residencial') {
            const availability = await propertyService.getNextAvailable(prop.id);
            if (availability) {
              return { 
                ...prop, 
                availableNow: availability.availableNow, 
                availableFrom: availability.availableFrom 
              };
            }
          }
          return { ...prop, availableNow: true }; // Temporarios por defecto pasan
        })
      );
      setHydratedItems(updatedItems);
    };

    if (currentItems.length > 0) {
      hydrateCurrentPage();
    }
  }, [currentItems]); // Se dispara al cambiar de página o cargar propiedades


  return (
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {hydratedItems.map((property) => (
          <CardInmueble key={property.id} data={property} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages}
          onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        />
      )}
    </div>
  );
};