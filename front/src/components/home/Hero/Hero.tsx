"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DateRange } from 'react-date-range';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

const DESTINOS_FAMOSOS = [
  "Buenos Aires, Argentina",
  "Córdoba, Argentina",
  "Mendoza, Argentina",
  "Santiago, Chile",
  "Bogotá, Colombia",
  "Lima, Perú",
  "Montevideo, Uruguay",
  "Ciudad de México, México"
];

export const Hero = () => {
  const router = useRouter();
  
  const destRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  const [location, setLocation] = useState('');
  const [showDestinations, setShowDestinations] = useState(false);
  const [capacity, setCapacity] = useState(1);

  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
      if (calRef.current && !calRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (location) params.append('location', location.split(',')[0]);
    if (capacity > 1) params.append('capacity', capacity.toString());
    
    if (dateRange[0].startDate !== dateRange[0].endDate) {
      params.append('startDate', format(dateRange[0].startDate, 'yyyy-MM-dd'));
      params.append('endDate', format(dateRange[0].endDate, 'yyyy-MM-dd'));
    }
    
    router.push(`/catalog?${params.toString()}`);
  };

  const destinosFiltrados = DESTINOS_FAMOSOS.filter(dest => 
    dest.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-10">
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://www.zillowstatic.com/bedrock/app/uploads/sites/55/2026/02/image2-lg%402x.jpg')" }} 
      />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* CORRECCIÓN 1: Se subió el z-index del contenedor de z-10 a z-[60] */}
      <div className="relative z-[60] w-full max-w-5xl flex flex-col items-start text-left mt-4">
        
       <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg max-w-3xl font-serif tracking-tight">
          Tu próximo hogar.<br />
          Por días o por años.
        </h1>
        
        <p className="text-base md:text-xl text-white/90 font-medium mb-12 max-w-xl drop-shadow-md">
          Más de 12.000 inmuebles verificados en Argentina, Uruguay y Chile. Reservá online con seña protegida.
        </p>

        <div className="relative w-full max-w-4xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex flex-col md:flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl md:rounded-full p-1.5 w-full shadow-2xl relative z-20"
          >
            
            <div 
              ref={destRef}
              className="flex-1 w-full flex flex-col justify-center px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-text relative" 
              onClick={() => setShowDestinations(true)}
            >
              <label className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5 cursor-text">Destino</label>
              <input
                type="text"
                maxLength={30}
                placeholder="¿A dónde vas?"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setShowDestinations(true); }}
                className="w-full bg-transparent text-slate-600 dark:text-slate-200 placeholder:text-slate-400 font-medium outline-none text-sm md:text-base truncate"
              />

              {showDestinations && (
                <div className="absolute top-full left-0 mt-4 w-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden z-50 py-4">
                  <p className="px-6 text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Búsquedas populares</p>
                  <ul>
                    {destinosFiltrados.length > 0 ? (
                      destinosFiltrados.map((dest, idx) => (
                        <li 
                          key={idx}
                          // CORRECCIÓN 2: e.stopPropagation() previene el event bubbling
                          onClick={(e) => { e.stopPropagation(); setLocation(dest); setShowDestinations(false); }}
                          className="px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-4 cursor-pointer transition-colors"
                        >
                          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                            <MapPin size={20} />
                          </div>
                          <span className="text-slate-700 dark:text-slate-200 font-medium">{dest}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-6 py-4 text-sm text-slate-500 text-center">No se encontraron destinos</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />

            <div 
              ref={calRef}
              className="flex-[1.5] w-full flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer relative"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <div className="flex-1 px-6 py-3 flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">Llegada</span>
                <span className={`text-sm md:text-base font-medium truncate ${dateRange[0].startDate !== dateRange[0].endDate ? 'text-slate-600 dark:text-slate-200' : 'text-slate-400'}`}>
                  {dateRange[0].startDate !== dateRange[0].endDate ? format(dateRange[0].startDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fechas'}
                </span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 px-6 py-3 flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">Salida</span>
                <span className={`text-sm md:text-base font-medium truncate ${dateRange[0].startDate !== dateRange[0].endDate ? 'text-slate-600 dark:text-slate-200' : 'text-slate-400'}`}>
                  {dateRange[0].startDate !== dateRange[0].endDate ? format(dateRange[0].endDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fechas'}
                </span>
              </div>

              {showCalendar && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-3xl shadow-2xl overflow-hidden z-50 border border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DateRange
                    ranges={dateRange}
                    onChange={(item: any) => setDateRange([item.selection])}
                    minDate={new Date()}
                    months={2}
                    direction="horizontal"
                    locale={es}
                    showDateDisplay={false}
                    rangeColors={['#0055FF']}
                  />
                </div>
              )}
            </div>

            <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />

            <div className="flex-[0.8] w-full flex items-center justify-between pl-6 pr-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-1">Huéspedes</span>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setCapacity(Math.max(1, capacity - 1))}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:border-slate-800 hover:text-slate-800 dark:hover:border-slate-300 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-30"
                    disabled={capacity <= 1}
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center text-slate-700 dark:text-slate-200">{capacity}</span>
                  <button 
                    type="button"
                    onClick={() => setCapacity(Math.min(99, capacity + 1))}
                    className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:border-slate-800 hover:text-slate-800 dark:hover:border-slate-300 dark:hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-30"
                    disabled={capacity >= 99}
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0 ml-2"
              >
                <Search size={22} strokeWidth={2.5} />
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </section>
  );
};