"use client";

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Plus, Minus, SlidersHorizontal, X, RotateCcw, Calendar, Clock } from 'lucide-react';
import { DateRange, Calendar as SingleCalendar, RangeKeyDict, Range } from 'react-date-range';
import { es } from 'date-fns/locale';
import { format, parseISO, isValid, addMonths } from 'date-fns';

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

const SEARCH_STORAGE_KEY = 'vesta_last_search_params';

const DURACIONES_RESIDENCIAL = [
  { value: '3', label: '3 Meses' },
  { value: '6', label: '6 Meses' },
  { value: '12', label: '1 Año (12 Meses)' },
  { value: '24', label: '2 Años (24 Meses)' }
];

interface SearchFilterBarProps {
  variant?: 'hero' | 'catalog';
}

const SearchFilterBarContent: React.FC<SearchFilterBarProps> = ({ variant = 'hero' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  const [showDestinations, setShowDestinations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Estados de Filtros
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [rentalType, setRentalType] = useState<'Temporario' | 'Residencial' | ''>('Temporario');
  const [maxPrice, setMaxPrice] = useState('');
  const [isPetFriendly, setIsPetFriendly] = useState(false);

  // Fechas para Temporario (Rango)
  const [dateRange, setDateRange] = useState<Range[]>([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);

  // Fechas para Residencial (Fecha ingreso + Duración)
  const [moveInDate, setMoveInDate] = useState<Date>(new Date());
  const [durationMonths, setDurationMonths] = useState<string>('12');

  // Responsivo
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sincronizar desde URLParams
  useEffect(() => {
    const keyword = searchParams.get('keyword') || searchParams.get('location') || '';
    const cap = Number(searchParams.get('capacity')) || 1;
    const rType = (searchParams.get('rentalType') as 'Temporario' | 'Residencial') || 'Temporario';
    const price = searchParams.get('maxPrice') || '';
    const pet = searchParams.get('isPetFriendly') === 'true';

    setLocation(keyword);
    setCapacity(cap);
    setRentalType(rType);
    setMaxPrice(price);
    setIsPetFriendly(pet);

    // Carga de fechas temporarias
    const s = searchParams.get('startDate');
    const e = searchParams.get('endDate');
    if (s && e) {
      const start = parseISO(s);
      const end = parseISO(e);
      if (isValid(start) && isValid(end)) {
        setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
      }
    }

    // Carga de fechas residenciales
    const mIn = searchParams.get('moveInDate');
    const dur = searchParams.get('durationMonths');
    if (mIn) {
      const parsedMoveIn = parseISO(mIn);
      if (isValid(parsedMoveIn)) setMoveInDate(parsedMoveIn);
    }
    if (dur) setDurationMonths(dur);

    if (Array.from(searchParams.keys()).length > 0 && typeof window !== 'undefined') {
      const currentParams: Record<string, string> = {};
      searchParams.forEach((val, key) => { currentParams[key] = val; });
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(currentParams));
    }
  }, [searchParams]);

  // Click outside / Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
      if (calRef.current && !calRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDestinations(false);
        setShowCalendar(false);
        setShowFilterModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    const storageObj: Record<string, string> = {};

    if (location.trim()) {
      const loc = location.trim().split(',')[0];
      params.set('keyword', loc);
      storageObj['keyword'] = loc;
    }

    if (capacity > 1) {
      params.set('capacity', capacity.toString());
      storageObj['capacity'] = capacity.toString();
    }

    // Lógica segregada por Tipo de Contrato
    const activeRentalType = rentalType || 'Temporario';
    params.set('rentalType', activeRentalType);
    storageObj['rentalType'] = activeRentalType;

    if (activeRentalType === 'Temporario') {
      const startDate = dateRange[0]?.startDate;
      const endDate = dateRange[0]?.endDate;

      if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
        const sFormatted = format(startDate, 'yyyy-MM-dd');
        const eFormatted = format(endDate, 'yyyy-MM-dd');
        params.set('startDate', sFormatted);
        params.set('endDate', eFormatted);
        storageObj['startDate'] = sFormatted;
        storageObj['endDate'] = eFormatted;
      }
      if (maxPrice) {
        params.set('maxPrice', maxPrice);
        params.set('priceUnit', 'noche');
        storageObj['maxPrice'] = maxPrice;
        storageObj['priceUnit'] = 'noche';
      }
    } else {
      // Residencial
      if (moveInDate) {
        const moveInFormatted = format(moveInDate, 'yyyy-MM-dd');
        params.set('moveInDate', moveInFormatted);
        storageObj['moveInDate'] = moveInFormatted;
      }
      if (durationMonths) {
        params.set('durationMonths', durationMonths);
        storageObj['durationMonths'] = durationMonths;
      }
      if (maxPrice) {
        params.set('maxPrice', maxPrice);
        params.set('priceUnit', 'mes');
        storageObj['maxPrice'] = maxPrice;
        storageObj['priceUnit'] = 'mes';
      }
    }

    if (isPetFriendly) {
      params.set('isPetFriendly', 'true');
      storageObj['isPetFriendly'] = 'true';
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(storageObj));
    }

    setShowFilterModal(false);
    setShowCalendar(false);
    setShowDestinations(false);
    router.push(`/catalog?${params.toString()}`);
  }, [location, capacity, dateRange, moveInDate, durationMonths, rentalType, maxPrice, isPetFriendly, router]);

  const handleResetFilters = () => {
    setLocation('');
    setCapacity(1);
    setRentalType('Temporario');
    setMaxPrice('');
    setIsPetFriendly(false);
    const today = new Date();
    setDateRange([{ startDate: today, endDate: today, key: 'selection' }]);
    setMoveInDate(today);
    setDurationMonths('12');

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    }

    router.push('/catalog');
  };

  const destinosFiltrados = DESTINOS_FAMOSOS.filter(dest =>
    dest.toLowerCase().includes(location.toLowerCase())
  );

  const startDate = dateRange[0]?.startDate;
  const endDate = dateRange[0]?.endDate;
  const hasActiveDates = Boolean(
    rentalType === 'Temporario'
      ? startDate && endDate && startDate.getTime() !== endDate.getTime()
      : Boolean(moveInDate)
  );

  const hasActiveFilters = Boolean(
    location || capacity > 1 || hasActiveDates || maxPrice || isPetFriendly
  );

  return (
    <div className={`w-full ${variant === 'hero' ? 'max-w-4xl' : 'max-w-[1100px] mx-auto mb-8'}`}>
      
      {/* Pestañas de Selección de Contrato (Temporario vs Residencial) */}
      <div className="flex items-center gap-2 mb-3 px-2">
        <button
          type="button"
          onClick={() => setRentalType('Temporario')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            rentalType === 'Temporario'
              ? 'bg-primary text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Alquiler Temporario
        </button>
        <button
          type="button"
          onClick={() => setRentalType('Residencial')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            rentalType === 'Residencial'
              ? 'bg-primary text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Alquiler Residencial
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className={`flex flex-col md:flex-row items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 shadow-xl relative z-20 gap-2 md:gap-0 ${
          variant === 'hero' ? 'md:rounded-full p-1.5' : 'p-3 rounded-2xl'
        }`}
      >
        {/* Destino */}
        <div
          ref={destRef}
          className="w-full md:flex-1 flex flex-col justify-center px-4 md:px-6 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors cursor-text relative"
          onClick={() => setShowDestinations(true)}
        >
          <label className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">
            Destino
          </label>
          <div className="flex items-center justify-between gap-1">
            <input
              type="text"
              maxLength={30}
              placeholder="¿A dónde vas?"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setShowDestinations(true); }}
              className="w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium outline-none text-sm md:text-base truncate"
            />
            {location && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLocation(''); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showDestinations && (
            <div className="absolute top-full left-0 mt-2 w-full max-w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden z-[60] py-3">
              <p className="px-6 text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Búsquedas populares</p>
              <ul>
                {destinosFiltrados.length > 0 ? (
                  destinosFiltrados.map((dest, idx) => (
                    <li
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(dest);
                        setShowDestinations(false);
                      }}
                      className="px-6 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <MapPin size={18} className="text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{dest}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-6 py-3 text-sm text-slate-500 text-center">No se encontraron destinos</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />

        {/* Sección Dinámica de Fechas */}
        {rentalType === 'Temporario' ? (
          /* TEMPORARIO: Llegada - Salida */
          <div
            ref={calRef}
            className="w-full md:flex-[1.5] flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors cursor-pointer relative"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 px-4 md:px-6 py-2.5 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">Llegada</span>
              <span className={`text-sm md:text-base font-medium truncate ${hasActiveDates ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                {hasActiveDates && startDate ? format(startDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fecha'}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 px-4 md:px-6 py-2.5 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">Salida</span>
              <span className={`text-sm md:text-base font-medium truncate ${hasActiveDates ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                {hasActiveDates && endDate ? format(endDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fecha'}
              </span>
            </div>

            {showCalendar && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-[60] border border-slate-200 dark:border-slate-800 p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <DateRange
                  ranges={dateRange}
                  onChange={(item: RangeKeyDict) => {
                    if (item.selection) setDateRange([item.selection]);
                  }}
                  minDate={new Date()}
                  months={isMobile ? 1 : 2}
                  direction="horizontal"
                  locale={es}
                  showDateDisplay={false}
                  rangeColors={['#0055FF']}
                />
              </div>
            )}
          </div>
        ) : (
          /* RESIDENCIAL: Fecha de Ingreso + Duración */
          <div className="w-full md:flex-[1.5] flex items-center">
            {/* Picker Fecha Ingreso */}
            <div
              ref={calRef}
              className="flex-1 px-4 md:px-6 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors cursor-pointer relative"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5 block">
                Fecha de ingreso
              </span>
              <span className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 truncate block">
                {moveInDate ? format(moveInDate, 'dd MMM. yyyy', { locale: es }) : 'Seleccionar'}
              </span>

              {showCalendar && (
                <div
                  className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-[60] border border-slate-200 dark:border-slate-800 p-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SingleCalendar
                    date={moveInDate}
                    onChange={(date: Date) => {
                      setMoveInDate(date);
                      setShowCalendar(false);
                    }}
                    minDate={new Date()}
                    locale={es}
                    color="#0055FF"
                  />
                </div>
              )}
            </div>

            <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />

            {/* Selector de Duración */}
            <div className="flex-1 px-4 md:px-6 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors">
              <label htmlFor="duration-months-select" className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5 block cursor-pointer">
                Duración
              </label>
              <select
                id="duration-months-select"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                className="w-full bg-transparent text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                {DURACIONES_RESIDENCIAL.map((dur) => (
                  <option key={dur.value} value={dur.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {dur.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />

        {/* Huéspedes / Ocupantes */}
        <div className="w-full md:flex-[0.8] flex items-center justify-between px-4 md:pl-6 md:pr-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors">
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-1">
              {rentalType === 'Residencial' ? 'Inquilinos' : 'Huéspedes'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCapacity(Math.max(1, capacity - 1)); }}
                className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:border-slate-800 transition-colors disabled:opacity-30"
                disabled={capacity <= 1}
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="text-sm font-bold w-4 text-center text-slate-700 dark:text-slate-200">{capacity}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCapacity(Math.min(99, capacity + 1)); }}
                className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:border-slate-800 transition-colors disabled:opacity-30"
                disabled={capacity >= 99}
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0 ml-2 shadow-lg"
          >
            <Search size={22} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
};

export const SearchFilterBar: React.FC<SearchFilterBarProps> = (props) => {
  return (
    <Suspense fallback={<div className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />}>
      <SearchFilterBarContent {...props} />
    </Suspense>
  );
};