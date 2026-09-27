import React from 'react';
import { Property } from '@/interfaces/property';
import { Badge } from '@/components/common/Badge/Badge';
import { FavoriteButton } from '@/components/common/FavoriteButton/FavoriteButton';
import { Star, Bath, Bed, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const CardInmueble = ({ data }: { data: Property }) => {
  return (
    <Link href={`/catalog/${data.id}`} className="block w-full h-full">
      <div className="w-full h-full bg-surface rounded-[12px] border border-subtle shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1">
        
        {/* Contenedor de Imagen */}
        <div className="relative h-[220px] w-full bg-app shrink-0">
          <div className="absolute top-3 left-3 z-10">
            <Badge text={data.rentalType} type={data.rentalType} />
          </div>

          {/* Botón de Favorito Flotante */}
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton propertyId={data.id} />
          </div>

          <Image 
            src={data.images[0]} 
            alt={data.name} 
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        </div>

        {/* Contenido Inferior */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            {/* Precio y Calificación */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-xl text-main">
                US$ {data.price} <span className="text-[15px] font-semibold text-muted">/ {data.priceUnit}</span>
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-main">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{data.rating}</span>
              </div>
            </div>
            
            {/* Título y Ubicación */}
            <p className="font-medium text-main truncate mb-1">{data.name}</p>
            <p className="text-sm text-muted truncate mb-3">{data.location}</p>
          </div>

          <div>
            {/* Línea divisoria */}
            <hr className="border-t border-subtle my-3" />
            
            {/* Características Íconos */}
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <div className="flex items-center gap-1.5">
                <Bed size={16} /> <span>{data.rooms} dorm.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath size={16} /> <span>{data.bathrooms} baños</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag size={16} className="rotate-90" /> <span>{data.area} m²</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
};