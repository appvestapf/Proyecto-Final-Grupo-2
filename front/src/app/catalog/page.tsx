"use client";
import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/property/SearchBar/SearchBar';
import { CardInmueble } from '@/components/property/CardInmueble/CardInmueble';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Property } from '@/interfaces/property';
import { propertyService } from '@/services/propertyService';

export default function CatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      const data = await propertyService.getProperties();
      setProperties(data);
      setFilteredProperties(data);
    };
    fetchData();
  }, []);

  const handleSearch = (filters: { location: string; rentalType: string; maxPrice: string; capacity: string }) => {
    let result = properties;

    if (filters.location) {
      result = result.filter(p => 
        p.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.title.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.rentalType) {
      result = result.filter(p => p.rentalType === filters.rentalType);
    }

    if (filters.capacity) {
      const cap = parseInt(filters.capacity, 10);
      result = result.filter(p => p.capacity >= cap);
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter(p => p.price <= max);
    }

    setFilteredProperties(result);
    setCurrentPage(1); // Reset al paginado al filtrar
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="min-h-screen bg-base-2/20 py-10 px-4">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-3xl font-bold text-base-4 mb-8 text-center">Catálogo de Inmuebles</h1>
        
        {/* Barra de búsqueda integrada */}
        <SearchBar onSearch={handleSearch} />

        {/* Grilla de resultados */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {currentItems.map((property) => (
              <CardInmueble key={property.id} data={property} />
            ))}
          </div>
        ) : (
          <p className="text-center text-base-3 py-10">No se encontraron inmuebles con los filtros seleccionados.</p>
        )}

        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages}
            onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          />
        )}
      </div>
    </main>
  );
}