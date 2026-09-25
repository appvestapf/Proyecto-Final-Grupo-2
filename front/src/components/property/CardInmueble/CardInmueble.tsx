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
      <div className="w-full h-full bg-base-1 rounded-[12px] border border-base-2 shadow-sm overflow-hidden flex flex-col cursor-pointer transition-transform duration-200 hover:-translate-y-1">
        
        {/* Contenedor de Imagen */}
        <div className="relative h-[220px] w-full bg-base-2 shrink-0">
          <div className="absolute top-3 left-3 z-10">
            <Badge text={data.rentalType} type={data.rentalType} />
          </div>

          {/* 2. Botón de Favorito Flotante */}
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
              <p className="font-bold text-xl text-base-4">
                US$ {data.price} <span className="text-[15px] font-semibold">/ {data.priceUnit}</span>
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-base-4">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{data.rating}</span>
              </div>
            </div>
            
            {/* Título y Ubicación */}
            <p className="font-medium text-base-4 truncate mb-1">{data.name}</p>
            <p className="text-sm text-base-3 truncate mb-3">{data.location}</p>
          </div>

          <div>
            {/* Línea divisoria */}
            <hr className="border-t border-base-3/20 my-3" />
            
            {/* Características Íconos */}
            <div className="flex items-center justify-between text-xs font-medium text-base-3">
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