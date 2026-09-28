"use client";
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const SLIDES = [
  {
    id: 1,
    title: "Casas en alquiler",
    description: "Encuentra casas para alquilar y ten un rincón solo tuyo.",
    buttonText: "Ver casas en alquiler",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    href: "/catalog?location=casa"
  },
  {
    id: 2,
    title: "Departamentos céntricos",
    description: "Vive cerca de todo con nuestra selección exclusiva de departamentos.",
    buttonText: "Ver departamentos",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    href: "/catalog?location=departamento"
  },
  {
    id: 3,
    title: "Alquileres temporarios",
    description: "Espacios amoblados perfectos para estancias cortas y viajes de trabajo.",
    buttonText: "Ver temporarios",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    href: "/catalog?rentalType=Temporario"
  }
];

export const PromoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <section className="w-full max-w-[1350px] mx-auto flex flex-col lg:flex-row my-12 px-4 lg:px-8">
      
      {/* ================= COLUMNA IZQUIERDA ================= */}
      <div 
        className="relative w-full lg:w-[45%] h-[420px] lg:h-[460px] bg-cover bg-center rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl overflow-hidden"
        style={{ backgroundImage: `url('${SLIDES[currentIndex].image}')` }}
      >
        {/* CORRECCIÓN: bg-surface, text-main y text-muted */}
        <div className="absolute top-0 left-0 lg:top-8 lg:left-8 bg-surface p-6 lg:p-8 w-[90%] lg:w-[380px] shadow-lg rounded-br-2xl lg:rounded-2xl">
          <h3 className="text-2xl lg:text-3xl font-bold text-main mb-3 leading-tight">
            {SLIDES[currentIndex].title}
          </h3>
          <p className="text-muted mb-6 text-sm lg:text-base">
            {SLIDES[currentIndex].description}
          </p>
          <Link href={SLIDES[currentIndex].href} className="flex items-center gap-2 font-bold text-main hover:text-primary transition-colors cursor-pointer text-sm lg:text-base w-max">
            {SLIDES[currentIndex].buttonText} <ArrowRight size={16} />
          </Link>
        </div>

        {/* Controles del carrusel */}
        <div className="absolute bottom-8 right-6 flex gap-3 z-10">
          <button 
            onClick={prevSlide}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-surface rounded-full flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} className="text-main" />
          </button>
          <button 
            onClick={nextSlide}
            className="w-10 h-10 lg:w-12 lg:h-12 bg-surface rounded-full flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight size={20} className="text-main" />
          </button>
        </div>
        
        <div className="absolute bottom-4 left-6 right-36 flex gap-2 z-10">
          {SLIDES.map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-full rounded-full transition-colors duration-300 ${
                index === currentIndex ? 'bg-white' : 'bg-white/40 shadow-sm'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* ================= COLUMNA DERECHA ================= */}
      <div className="w-full lg:w-[55%] bg-[#DFE4D6] dark:bg-slate-800 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden h-[420px] lg:h-[460px] rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl">
        
        <div className="relative z-10 w-full max-w-[400px]">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            Alquilar tu inmueble y tener un rincón solo tuyo
          </h2>
          
          <p className="text-slate-800/80 dark:text-slate-300 mb-6 text-sm lg:text-base">
            Cuenta con nuestros asesores para conseguir las mejores condiciones, resolver todas tus dudas y tener soporte durante todo el proceso.
          </p>
          
          <Link href="/catalog?location=departamento" className="inline-block bg-surface text-main font-bold text-sm lg:text-base py-2.5 px-6 rounded-full w-max shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all mb-5 cursor-pointer border border-subtle">
            Ver departamentos en alquiler
          </Link>
          
          <Link href="/como-alquilar" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white hover:underline w-max cursor-pointer text-sm lg:text-base">
            Cómo alquilar en Vesta <ArrowRight size={16} />
          </Link>
        </div>

        <div className="absolute bottom-0 right-0 lg:bottom-4 lg:right-4 w-[160px] h-[160px] lg:w-[200px] lg:h-[200px] pointer-events-none opacity-90 dark:opacity-75">
           <Image 
             src="/gestures-receiving-keys.webp" 
             alt="Entrega de llaves"
             fill
             className="object-contain object-bottom right-0 drop-shadow-md"
           />
        </div>
      </div>

    </section>
  );
};