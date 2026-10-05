'use client';

import { useTheme } from 'next-themes';
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ShieldCheck, MapPin } from 'lucide-react';

interface PropertyDetailMapProps {
  lat: number;
  lng: number;
  title?: string;
  isExactLocationVisible?: boolean;
  radiusInMeters?: number;
}

// Función auxiliar para generar un polígono GeoJSON circular
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };

  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ret],
    },
    properties: {},
  };
}

export const PropertyDetailMap = ({
  lat,
  lng,
  title = 'Ubicación del inmueble',
  isExactLocationVisible = false,
  radiusInMeters = 350,
}: PropertyDetailMapProps) => {
  const { resolvedTheme } = useTheme();

  const mapStyle =
    resolvedTheme === 'dark'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

  const circleGeoJSON = createGeoJSONCircle([lng, lat], radiusInMeters);

  return (
    <div className="w-full space-y-3">
      {/* Banner informativo de privacidad */}
      {!isExactLocationVisible && (
        <div className="flex items-center gap-2 p-3 bg-app border border-subtle rounded-xl text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Ubicación aproximada:</strong> La dirección exacta se proporcionará una vez confirmada la reserva para proteger la privacidad del propietario.
          </span>
        </div>
      )}

      {/* Contenedor Mapbox */}
      <div className="w-full h-[350px] md:h-[420px] rounded-2xl overflow-hidden border border-subtle shadow-sm relative z-10">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            latitude: lat,
            longitude: lng,
            zoom: 14,
          }}
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />

          {isExactLocationVisible ? (
            /* Pin exacto cuando la reserva ya está confirmada */
            <Marker latitude={lat} longitude={lng} anchor="bottom">
              <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-900">
                <MapPin className="w-5 h-5" />
              </div>
            </Marker>
          ) : (
            /* Capas de Circulo Aproximado */
            <Source id="circle-source" type="geojson" data={circleGeoJSON}>
              {/* Relleno translúcido */}
              <Layer
                id="circle-fill"
                type="fill"
                paint={{
                  'fill-color': '#0055FF',
                  'fill-opacity': 0.15,
                }}
              />
              {/* Borde del círculo */}
              <Layer
                id="circle-outline"
                type="line"
                paint={{
                  'line-color': '#0055FF',
                  'line-width': 2,
                  'line-dasharray': [2, 2],
                }}
              />
            </Source>
          )}
        </Map>
      </div>
    </div>
  );
};