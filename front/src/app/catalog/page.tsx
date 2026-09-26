"use client";
import { useState, useEffect, Suspense } from 'react';
import { SearchBar } from '@/components/property/SearchBar/SearchBar';
import { CardInmueble } from '@/components/property/CardInmueble/CardInmueble';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Property } from '@/interfaces/property';
import { propertyService } from '@/services/propertyService';
import { useSearchParams } from 'next/navigation';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getProperties();
        setProperties(data);

        const urlLocation = searchParams.get('location');
        const urlCapacity = searchParams.get('capacity');
        const urlRentalType = searchParams.get('rentalType');

        let result = data;

        if (urlLocation) {
          result = result.filter(p => 
            p.location.toLowerCase().includes(urlLocation.toLowerCase()) ||
            p.title.toLowerCase().includes(urlLocation.toLowerCase())
          );
        }

        if (urlCapacity) {
          const cap = parseInt(urlCapacity, 10);
          result = result.filter(p => p.capacity >= cap);
        }

        if (urlRentalType) {
          result = result.filter(p => 
            p.rentalType?.toLowerCase() === urlRentalType.toLowerCase()
          );
        }

        setFilteredProperties(result);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error al cargar propiedades:", error);
      } finally {
        setLoading(false);
      }
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
    setCurrentPage(1); 
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-[1100px] mx-auto">
      <h1 className="text-3xl font-bold text-main mb-8 text-center tracking-tight">
        Catálogo de Inmuebles
      </h1>
      
      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center py-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-full max-w-sm h-80 bg-surface border border-subtle rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : currentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {currentItems.map((property) => (
            <CardInmueble key={property.id} data={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface border border-subtle rounded-2xl my-6">
          <p className="text-main font-medium text-lg mb-1">
            No se encontraron inmuebles
          </p>
          <p className="text-muted text-sm">
            Intenta ajustando o borrando algunos de los filtros seleccionados.
          </p>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages}
            onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          />
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-app py-10 px-4 transition-colors duration-200">
      <Suspense fallback={
        <div className="flex justify-center items-center py-20 text-muted">
          Cargando catálogo...
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </main>
  );
}