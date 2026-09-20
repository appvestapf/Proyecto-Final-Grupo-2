"use client";
import { useState, useEffect, Suspense } from 'react';
import { SearchBar } from '@/components/property/SearchBar/SearchBar';
import { CardInmueble } from '@/components/property/CardInmueble/CardInmueble';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Property } from '@/interfaces/property';
import { propertyService } from '@/services/propertyService';
import { useSearchParams } from 'next/navigation';

// Envolvemos el contenido en un sub-componente para poder usar useSearchParams de forma segura en Next.js
function CatalogContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      // 1. Traemos todas las propiedades del backend
      const data = await propertyService.getProperties();
      setProperties(data);

      // 2. Leemos qué viene en la URL desde el Hero
      const urlLocation = searchParams.get('location');
      const urlCapacity = searchParams.get('capacity');

      let result = data;

      // 3. Si alguien escribió un destino en el Hero, filtramos de entrada
      if (urlLocation) {
        result = result.filter(p => 
          p.location.toLowerCase().includes(urlLocation.toLowerCase()) ||
          p.title.toLowerCase().includes(urlLocation.toLowerCase())
        );
      }

      // 4. Si buscaron por cantidad de personas, filtramos también
      if (urlCapacity) {
        const cap = parseInt(urlCapacity, 10);
        result = result.filter(p => p.capacity >= cap);
      }

      // Guardamos el resultado final
      setFilteredProperties(result);
    };
    fetchData();
  }, [searchParams]);

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
  );
}

// Componente principal de la página
export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-base-2/20 py-10 px-4">
      {/* Suspense es requerido por Next.js al usar useSearchParams */}
      <Suspense fallback={<p className="text-center mt-10">Cargando catálogo...</p>}>
        <CatalogContent />
      </Suspense>
    </main>
  );
}