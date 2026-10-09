"use client";

import React from 'react';
import { Property } from '@/interfaces/property';
import { Badge } from '@/components/common/Badge/Badge';
import { FavoriteButton } from '@/components/common/FavoriteButton/FavoriteButton';
import { Star, Bath, Bed, Tag, CalendarClock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";

export const CardInmueble = ({ data }: { data: Property }) => {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  // Construimos la URL dinámica: si existen parámetros activos (fechas, ubicación, etc.), los adjuntamos
  const detailHref = queryString
    ? `/catalog/${data.id}?${queryString}`
    : `/catalog/${data.id}`;

  const coverImage = data.images && data.images.length > 0 ? data.images[0] : DEFAULT_IMAGE;

  return (
    <Link href={detailHref} className="block w-full h-full">
      {/* 
        ¡AQUÍ ESTÁ LA MAGIA! 
        Agregamos `relative z-0` para crear un Stacking Context.
        Así encerramos todos los z-10 hijos dentro de esta tarjeta.
      */}
      <div className="relative z-0 w-full h-full bg-surface rounded-[12px] border border-subtle shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1">
        
        {/* Contenedor de Imagen */}
        <div className="relative h-[220px] w-full bg-app shrink-0">
          
          {/* BADGE (z-10) */}
          <div className="absolute top-3 left-3 z-10">
            <Badge text={data.rentalType} type={data.rentalType} />
          </div>
          
          {/* OVERLAY DE DISPONIBILIDAD (z-10) */}
          {data.rentalType === 'Residencial' && data.availableNow === false && data.availableFrom && (
            <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent">
              <div className="flex items-center gap-2 text-white text-[11px] font-semibold tracking-wide">
                <CalendarClock size={14} className="text-amber-400" />
                <span>Libre desde {new Date(data.availableFrom).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          )}
          
          {/* BOTÓN FAVORITO (z-20 para asegurar que sea clickeable por encima de un posible overlay) */}
          <div className="absolute top-3 right-3 z-20">
            <FavoriteButton propertyId={data.id} />
          </div>

          <Image 
            src={coverImage} 
            alt={data.name || data.title || "Inmueble"} 
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className={`object-cover transition-transform duration-500 ${data.availableNow === false ? 'opacity-90' : 'group-hover:scale-105'}`}
          />
        </div>

        {/* Contenido Inferior */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div>
            {/* Precio y Calificación */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-xl text-main">
                US$ {data.price?.toLocaleString("es-AR")}{" "}
                <span className="text-[15px] font-semibold text-muted">
                  / {data.priceUnit || (data.rentalType === 'Temporario' ? 'noche' : 'mes')}
                </span>
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-main">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{data.rating ?? 0}</span>
              </div>
            </div>
            
            {/* Título y Ubicación */}
            <p className="font-medium text-main truncate mb-1">{data.name || data.title}</p>
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