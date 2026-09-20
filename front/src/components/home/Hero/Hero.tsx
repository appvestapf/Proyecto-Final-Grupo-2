"use client";
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Hero = () => {
  const router = useRouter();
  
  // Estados para guardar lo que escribe el usuario
  const [location, setLocation] = useState('');
  const [dates, setDates] = useState('');
  const [capacity, setCapacity] = useState('');

  // Función que se ejecuta al hacer clic en la lupa
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location) params.append('location', location);
    if (capacity) params.append('capacity', capacity);
    
    // Redirigimos al catálogo enviando los parámetros en la URL
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-10">
      
      {/* Imagen de fondo natural */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://www.zillowstatic.com/bedrock/app/uploads/sites/55/2026/02/image2-lg%402x.jpg')" }} 
      />
      
      {/* Overlay oscuro para que el navbar y los textos resalten más */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Contenedor del contenido */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-start text-left mt-4">
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg max-w-3xl">
          Tu próximo hogar.<br />
          Por días o por años.
        </h1>
        
        <p className="text-base md:text-xl text-white/90 font-medium mb-12 max-w-xl drop-shadow-md">
          Más de 12.000 inmuebles verificados en Argentina, Uruguay y Chile. Reservá online con seña protegida.
        </p>

        {/* Buscador unificado (Estilo 3 bloques) */}
<form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col md:flex-row items-center bg-white rounded-3xl md:rounded-full p-2 w-full max-w-3xl shadow-2xl"
        >
          
          {/* Destino */}
          <div className="flex-1 w-full flex flex-col justify-center px-6 py-3 md:py-2 md:border-r border-slate-200">
            <span className="text-[11px] font-bold uppercase text-slate-800 tracking-wider text-left mb-0.5">Destino</span>
            <input
              type="text"
              maxLength={30}
              placeholder="¿A dónde vas?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 font-medium outline-none text-sm md:text-base truncate"
            />
          </div>

          {/* Check-in */}
          <div className="flex-1 w-full flex flex-col justify-center px-6 py-3 md:py-2 md:border-r border-slate-200 border-t md:border-t-0">
            <span className="text-[11px] font-bold uppercase text-slate-800 tracking-wider text-left mb-0.5">Llegada</span>
            <input
              type="date"
              className="w-full bg-transparent text-slate-600 font-medium outline-none text-sm md:text-base cursor-pointer"
            />
          </div>

          {/* Check-out */}
          <div className="flex-1 w-full flex flex-col justify-center px-6 py-3 md:py-2 md:border-r border-slate-200 border-t md:border-t-0">
            <span className="text-[11px] font-bold uppercase text-slate-800 tracking-wider text-left mb-0.5">Salida</span>
            <input
              type="date"
              className="w-full bg-transparent text-slate-600 font-medium outline-none text-sm md:text-base cursor-pointer"
            />
          </div>

          {/* Huéspedes */}
          <div className="flex-1 w-full flex flex-col justify-center px-6 py-3 md:py-2 border-t md:border-t-0">
            <span className="text-[11px] font-bold uppercase text-slate-800 tracking-wider text-left mb-0.5">Huéspedes</span>
            <input
              type="number"
              min="1"
              max="20"
              placeholder="¿Cuántos?"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full bg-transparent text-slate-600 placeholder:text-slate-400 font-medium outline-none text-sm md:text-base truncate"
            />
          </div>

          {/* Botón de Búsqueda */}
          <button 
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-full md:w-14 h-12 md:h-14 flex items-center justify-center transition-colors cursor-pointer shrink-0 md:ml-2 mt-2 md:mt-0"
          >
            <Search size={22} strokeWidth={2.5} />
          </button>
          
        </form>
      </div>
    </section>
  );
};