"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SearchFilterBar } from '@/components/property/SearchFilterBar/SearchFilterBar';
import { CardInmueble } from '@/components/property/CardInmueble/CardInmueble';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Property, PropertyMapProps } from '@/interfaces/property';
import { propertyService, PropertySearchParams } from '@/services/propertyService';
import { mapPropertiesToLocations } from '@/utils/propertyMappers';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchX, MapPin, RefreshCw } from 'lucide-react';

const SEARCH_STORAGE_KEY = 'vesta_last_search_params';

const SUGGESTED_DESTINATIONS = [
  "Buenos Aires",
  "Córdoba",
  "Mendoza",
  "Santiago",
  "Bogotá"
];

const PropertyMap = dynamic<PropertyMapProps>(
  () => import('@/components/property/PropertyMap/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false }
);

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const keyword = searchParams.get('keyword') || searchParams.get('location') || undefined;
        const rentalType = searchParams.get('rentalType') || undefined;

        const startDate = searchParams.get('startDate') || searchParams.get('moveInDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        
        const durationParam = searchParams.get('durationMonths') || searchParams.get('months');
        const months = durationParam ? parseInt(durationParam, 10) : undefined;

        const capacityParam = searchParams.get('capacity');
        const capacity = capacityParam ? parseInt(capacityParam, 10) : undefined;

        const maxPriceParam = searchParams.get('maxPrice');
        const maxPriceVal = maxPriceParam ? parseFloat(maxPriceParam) : undefined;

        const maxPrice = (rentalType && maxPriceVal && !isNaN(maxPriceVal)) ? maxPriceVal : undefined;
        const priceUnit = maxPrice ? (rentalType?.toLowerCase() === 'temporario' ? 'noche' : 'mes') : undefined;

        const isPetFriendlyParam = searchParams.get('isPetFriendly') || searchParams.get('petsAllowed');
        const isPetFriendly = isPetFriendlyParam === 'true' ? true : undefined;

        const latParam = searchParams.get('lat');
        const lngParam = searchParams.get('lng');
        const radiusParam = searchParams.get('radius');

        const searchPayload: PropertySearchParams = {
          keyword,
          startDate,
          endDate: rentalType?.toLowerCase() === 'residencial' ? undefined : endDate,
          months: months && !isNaN(months) ? months : undefined,
          capacity: capacity && !isNaN(capacity) ? capacity : undefined,
          rentalType,
          maxPrice,
          priceUnit,
          isPetFriendly,
          ...(latParam && lngParam ? {
            lat: parseFloat(latParam),
            lng: parseFloat(lngParam),
            radius: radiusParam ? parseFloat(radiusParam) : 10
          } : {})
        };

        const data = await propertyService.searchProperties(searchPayload);
        setProperties(data);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error al cargar propiedades con filtros:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    const rentalType = searchParams.get('rentalType');
    const isPetFriendlyParam = searchParams.get('isPetFriendly') || searchParams.get('petsAllowed');

    return properties.filter(p => {
      if (rentalType && p.rentalType?.toLowerCase() !== rentalType.toLowerCase()) {
        return false;
      }
      if (isPetFriendlyParam === 'true') {
        const hasPets = p.isPetFriendly === true || (p as any).petsAllowed === true;
        if (!hasPets) return false;
      }
      return true;
    });
  }, [properties, searchParams]);

  const handleResetFilters = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    }
    router.push('/catalog');
  };

  const handleSelectSuggestedDestination = (dest: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify({ keyword: dest }));
    }
    router.push(`/catalog?keyword=${encodeURIComponent(dest)}`);
  };

  const handleAreaSearch = (lat: number, lng: number, radius: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lat', lat.toFixed(6));
    params.set('lng', lng.toFixed(6));
    params.set('radius', Math.round(radius).toString());

    router.push(`/catalog?${params.toString()}`);
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const mapLocations = useMemo(() => {
    return mapPropertiesToLocations(filteredProperties);
  }, [filteredProperties]);

  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

  return (
    <div className="max-w-[1400px] mx-auto px-2 lg:px-6">
      <h1 className="text-3xl font-bold text-main mb-6 text-center tracking-tight">
        Catálogo de Inmuebles
      </h1>

      <SearchFilterBar variant="catalog" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">

        {/* Lista de Tarjetas */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center py-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full max-w-sm h-80 bg-surface border border-subtle rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
              {currentItems.map((property) => (
                <div
                  key={property.id}
                  className="w-full flex justify-center"
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                >
                  <CardInmueble data={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-surface border border-subtle rounded-3xl my-6 flex flex-col items-center shadow-sm">
              <div className="w-16 h-16 bg-app rounded-full flex items-center justify-center text-muted mb-4 border border-subtle">
                <SearchX size={32} />
              </div>
              <h3 className="text-main font-bold text-xl mb-1">
                No encontramos propiedades disponibles
              </h3>
              <p className="text-muted text-sm max-w-md mb-6 leading-relaxed">
                Prueba borrando o ajustando los filtros seleccionados, o explora uno de nuestros destinos sugeridos.
              </p>

              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-md hover:shadow-lg mb-8"
              >
                <RefreshCw size={16} />
                <span>Limpiar todos los filtros</span>
              </button>

              <div className="w-full border-t border-subtle pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Destinos populares
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => handleSelectSuggestedDestination(dest)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-app hover:bg-subtle/40 border border-subtle rounded-full text-xs text-main font-medium transition-colors cursor-pointer"
                    >
                      <MapPin size={12} className="text-primary" />
                      <span>{dest}</span>
                    </button>
                  ))}
                </div>
              </div>
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

        {/* Mapa Interactivo */}
        <div className="hidden lg:block lg:col-span-5 sticky top-6 h-[calc(100vh-140px)] min-h-[500px]">
          <PropertyMap
            properties={mapLocations}
            hoveredPropertyId={hoveredPropertyId}
            onAreaSearch={handleAreaSearch}
            initialLat={initialLat}
            initialLng={initialLng}
          />
        </div>

      </div>
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