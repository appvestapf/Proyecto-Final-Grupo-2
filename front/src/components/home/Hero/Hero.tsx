import React from 'react';
import { Search } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative w-full h-[560px] flex items-center justify-start px-6 md:px-20 lg:px-32">
      
      {/* Imagen de fondo natural 100% iluminada */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://www.zillowstatic.com/bedrock/app/uploads/sites/55/2026/02/image2-lg%402x.jpg')" }} 
      />
      
      {/* Contenedor del contenido */}
      <div className="relative z-10 w-full max-w-3xl">
        
        {/* Título (Más chico, con salto de línea y sombra para legibilidad) */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
          Tu próximo hogar.<br />
          Por días o por años.
        </h1>
        
        {/* Subtítulo (Más chico) */}
        <p className="text-base md:text-lg text-white font-medium mb-8 max-w-xl drop-shadow-md">
          Más de 12.000 inmuebles verificados en Argentina, Uruguay y Chile. Reservá online con seña protegida.
        </p>

        {/* Buscador unificado (Píldora más compacta) */}
        <div className="flex items-center bg-white rounded-full p-1.5 w-full max-w-2xl shadow-xl">
          <input
            type="text"
            placeholder="Ciudad, barrio o tipo de propiedad"
            className="flex-1 bg-transparent px-5 py-2.5 md:py-3 text-base-4 placeholder:text-base-3 text-base outline-none rounded-l-full"
          />
          <button className="bg-primary hover:bg-primary/90 text-white rounded-full p-3 flex items-center justify-center transition-colors cursor-pointer">
            <Search size={20} />
          </button>
        </div>

      </div>
    </section>
  );
};