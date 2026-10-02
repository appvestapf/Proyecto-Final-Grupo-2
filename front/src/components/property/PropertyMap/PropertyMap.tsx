'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import Map, { Marker, Popup, NavigationControl, MapRef } from 'react-map-gl/mapbox';
import Link from 'next/link';
import Image from 'next/image';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PropertyLocation, PropertyMapProps } from '@/interfaces/property';
import { RefreshCw } from 'lucide-react';

interface ExtendedPropertyMapProps extends PropertyMapProps {
  onHoverProperty?: (id: string | number | null) => void;
}

export const PropertyMap = ({
  properties,
  hoveredPropertyId,
  onSelectProperty,
  onHoverProperty,
  onAreaSearch,
  initialLat = -31.4201,
  initialLng = -64.1887,
  zoom = 12,
  showPopup = true,
  simpleMarker = false,
}: ExtendedPropertyMapProps) => {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  
  // Banderas para controlar interacciones de usuario vs. movimientos programáticos
  const isUserInteractingRef = useRef<boolean>(false);
  const isProgrammaticMoveRef = useRef<boolean>(false);

  const [selectedProperty, setSelectedProperty] = useState<PropertyLocation | null>(null);
  const [mapMoved, setMapMoved] = useState<boolean>(false);

  const mapStyle =
    resolvedTheme === 'dark'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

  const validProperties = properties.filter(
    (prop) => typeof prop.lat === 'number' && typeof prop.lng === 'number'
  );

  // Resetear popups cuando cambian las propiedades
  useEffect(() => {
    setSelectedProperty(null);
  }, [properties]);

  // Centrar o hacer flyTo a la propiedad resaltada con Hover
  useEffect(() => {
    if (!hoveredPropertyId || !mapRef.current) return;
    const targetProp = validProperties.find((p) => p.id === hoveredPropertyId);
    if (targetProp) {
      isProgrammaticMoveRef.current = true;
      mapRef.current.easeTo({
        center: [targetProp.lng, targetProp.lat],
        duration: 500,
      });
    }
  }, [hoveredPropertyId]);

  // Fit bounds automático cuando la lista de propiedades cambia
  useEffect(() => {
    if (validProperties.length === 0 || !mapRef.current) return;

    isProgrammaticMoveRef.current = true;

    if (validProperties.length === 1) {
      mapRef.current.flyTo({
        center: [validProperties[0].lng, validProperties[0].lat],
        zoom: 14,
        duration: 1200,
      });
      return;
    }

    const lngs = validProperties.map((p) => p.lng);
    const lats = validProperties.map((p) => p.lat);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 80,
        duration: 1200,
      }
    );
  }, [properties]);

  // Botón "Rebuscar en esta área"
  const handleSearchThisArea = () => {
    if (!onAreaSearch || !mapRef.current) return;

    const center = mapRef.current.getCenter();
    const currentZoom = mapRef.current.getZoom();

    const estimatedRadius = Math.max(1, Math.round(40000 / Math.pow(2, currentZoom)));

    isUserInteractingRef.current = false;
    setMapMoved(false);

    onAreaSearch(center.lat, center.lng, estimatedRadius);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-subtle shadow-sm">
      {/* Botón flotante para rebuscar */}
      {mapMoved && onAreaSearch && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={handleSearchThisArea}
            className="flex items-center gap-2 bg-surface text-main font-semibold text-xs md:text-sm px-4 py-2.5 rounded-full shadow-xl border border-subtle hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer hover:scale-105"
          >
            <RefreshCw size={14} className="text-primary" />
            <span>Rebuscar en esta área</span>
          </button>
        </div>
      )}

      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          latitude: initialLat,
          longitude: initialLng,
          zoom: zoom,
        }}
        onMoveStart={() => {
          if (!isProgrammaticMoveRef.current) {
            isUserInteractingRef.current = true;
          }
        }}
        onMove={() => {
          if (isUserInteractingRef.current) {
            setMapMoved(true);
          }
        }}
        onMoveEnd={() => {
          isUserInteractingRef.current = false;
          isProgrammaticMoveRef.current = false;
        }}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {validProperties.map((prop) => {
          const isHovered = hoveredPropertyId === prop.id;

          return (
            <Marker
              key={prop.id}
              latitude={prop.lat}
              longitude={prop.lng}
              anchor={simpleMarker ? 'center' : 'bottom'}
              style={{ zIndex: isHovered ? 50 : 10 }}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                if (showPopup) setSelectedProperty(prop);
                if (onSelectProperty) onSelectProperty(prop.id);
              }}
            >
              {simpleMarker ? (
                <div className="relative group cursor-pointer flex items-center justify-center">
                  <span className="absolute w-8 h-8 bg-primary/20 rounded-full animate-ping" />
                  <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onMouseEnter={() => onHoverProperty && onHoverProperty(prop.id)}
                  onMouseLeave={() => onHoverProperty && onHoverProperty(null)}
                  className={`transition-all duration-200 font-bold text-xs cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full shadow-md ${
                    isHovered
                      ? 'bg-primary text-white scale-125 ring-2 ring-white shadow-xl'
                      : 'bg-surface border border-subtle text-main hover:scale-110'
                  }`}
                >
                  <span className={isHovered ? 'text-white' : 'text-primary'}>$</span>
                  {prop.price.toLocaleString()}
                </button>
              )}
            </Marker>
          );
        })}

        {showPopup && selectedProperty && (
          <Popup
            latitude={selectedProperty.lat}
            longitude={selectedProperty.lng}
            anchor="top"
            onClose={() => setSelectedProperty(null)}
            closeOnClick={false}
            focusAfterOpen={false}
            className="custom-mapbox-popup z-40"
          >
            <Link
              href={`/catalog/${selectedProperty.id}`}
              className="block w-[230px] bg-surface border border-subtle rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]"
            >
              <div className="w-full h-28 overflow-hidden relative bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                {selectedProperty.image ? (
                  <Image
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    fill
                    sizes="230px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted font-medium">Sin imagen</span>
                )}

                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm z-10">
                  US$ {selectedProperty.price.toLocaleString()}
                </span>
              </div>

              <div className="p-3">
                <h4 className="font-bold text-xs text-main line-clamp-1">
                  {selectedProperty.title}
                </h4>
                <p className="text-[11px] text-muted truncate mt-0.5">
                  {selectedProperty.address || selectedProperty.city || 'Ubicación no especificada'}
                </p>
              </div>
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  );
};