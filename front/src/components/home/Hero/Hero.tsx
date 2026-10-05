"use client";

import React from 'react';
import { SearchFilterBar } from '@/components/property/SearchFilterBar/SearchFilterBar';

export const Hero = () => {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-10">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://www.zillowstatic.com/bedrock/app/uploads/sites/55/2026/02/image2-lg%402x.jpg')" }} 
      />
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-[60] w-full max-w-5xl flex flex-col items-start text-left mt-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg max-w-3xl font-serif tracking-tight">
          Tu próximo hogar.<br />
          Por días o por años.
        </h1>
        
        <p className="text-base md:text-xl text-white/90 font-medium mb-12 max-w-xl drop-shadow-md">
          Más de 12.000 inmuebles verificados en Argentina, Uruguay y Chile. Reservá online con seña protegida.
        </p>

        <div className="relative w-full max-w-4xl">
          <SearchFilterBar variant="hero" />
        </div>
      </div>
    </section>
  );
};