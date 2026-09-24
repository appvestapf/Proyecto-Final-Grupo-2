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
  const itemsPerPage = 6;

useEffect(() => {
    const fetchData = async () => {
      const data = await propertyService.getProperties();
      setProperties(data);

      const urlLocation = searchParams.get('location');
      const urlCapacity = searchParams.get('capacity');
      const urlRentalType = searchParams.get('rentalType');

      // --- 🔍 INICIO DE DIAGNÓSTICO ---
      console.log("🔍 1. Parámetro en URL (urlRentalType):", urlRentalType);
      console.log("🔍 2. Primera propiedad del backend:", data[0]?.name, "| Tipo:", data[0]?.rentalType);
      // --- FIN DE DIAGNÓSTICO ---

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
        result = result.filter(p => {
          const match = p.rentalType?.toLowerCase() === urlRentalType.toLowerCase();
          // Log para ver si las palabras son exactamente iguales o si hay espacios invisibles
          if (!match) {
            console.log(`❌ Filtrado descarta: '${p.rentalType}' (BD) vs '${urlRentalType}' (URL)`);
          }
          return match;
        });
        console.log("🔍 3. Resultados que sobrevivieron al filtro:", result.length);
      }

      setFilteredProperties(result);
      setCurrentPage(1);
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
      <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Catálogo de Inmuebles</h1>
      
      <SearchBar onSearch={handleSearch} />

      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {currentItems.map((property) => (
            <CardInmueble key={property.id} data={property} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-10">No se encontraron inmuebles con los filtros seleccionados.</p>
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

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-transparent py-10 px-4">
      <Suspense fallback={<p className="text-center mt-10 text-slate-500">Cargando catálogo...</p>}>
        <CatalogContent />
      </Suspense>
    </main>
  );
}