"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Plus, Minus, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { DateRange, RangeKeyDict, Range } from 'react-date-range';
import { es } from 'date-fns/locale';
import { format, parseISO, isValid } from 'date-fns';

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

interface SearchFilterBarProps {
  variant?: 'hero' | 'catalog';
}

const SearchFilterBarContent: React.FC<SearchFilterBarProps> = ({ variant = 'hero' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Referencias para cierre de dropdowns
  const destRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  // Control de UI
  const [showDestinations, setShowDestinations] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detección de pantalla responsiva
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Estados de Filtros desde URL params
  const [location, setLocation] = useState(
    searchParams.get('keyword') || searchParams.get('location') || ''
  );
  const [capacity, setCapacity] = useState(Number(searchParams.get('capacity')) || 1);
  const [rentalType, setRentalType] = useState(searchParams.get('rentalType') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isPetFriendly, setIsPetFriendly] = useState(searchParams.get('isPetFriendly') === 'true');

  // Inicialización Segura de Fechas
  const [dateRange, setDateRange] = useState<Range[]>(() => {
    const initStart = searchParams.get('startDate');
    const initEnd = searchParams.get('endDate');

    const parsedStart = initStart ? parseISO(initStart) : null;
    const parsedEnd = initEnd ? parseISO(initEnd) : null;

    const today = new Date();
    return [
      {
        startDate: parsedStart && isValid(parsedStart) ? parsedStart : today,
        endDate: parsedEnd && isValid(parsedEnd) ? parsedEnd : today,
        key: 'selection'
      }
    ];
  });

  // PERSISTENCIA: Restaurar búsqueda guardada si la URL viene vacía
  useEffect(() => {
    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (!hasUrlParams && typeof window !== 'undefined') {
      const savedSearch = sessionStorage.getItem(SEARCH_STORAGE_KEY);
      if (savedSearch) {
        try {
          const parsed = JSON.parse(savedSearch);
          if (parsed.keyword) setLocation(parsed.keyword);
          if (parsed.capacity) setCapacity(Number(parsed.capacity));
          if (parsed.rentalType) setRentalType(parsed.rentalType);
          if (parsed.maxPrice) setMaxPrice(parsed.maxPrice);
          if (parsed.isPetFriendly) setIsPetFriendly(parsed.isPetFriendly === 'true');

          if (parsed.startDate && parsed.endDate) {
            const start = parseISO(parsed.startDate);
            const end = parseISO(parsed.endDate);
            if (isValid(start) && isValid(end)) {
              setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
            }
          }

          // Si estamos en la página del catálogo, aplicamos la URL recuperada
          if (window.location.pathname === '/catalog') {
            const queryStr = new URLSearchParams(parsed).toString();
            if (queryStr) router.replace(`/catalog?${queryStr}`);
          }
        } catch (e) {
          console.error("Error al leer la búsqueda guardada:", e);
        }
      }
    }
  }, []);

  // Sincronización cuando cambia la URL y Guardado en SessionStorage
  useEffect(() => {
    const keyword = searchParams.get('keyword') || searchParams.get('location') || '';
    const cap = Number(searchParams.get('capacity')) || 1;
    const rType = searchParams.get('rentalType') || '';
    const price = searchParams.get('maxPrice') || '';
    const pet = searchParams.get('isPetFriendly') === 'true';

    setLocation(keyword);
    setCapacity(cap);
    setRentalType(rType);
    setMaxPrice(price);
    setIsPetFriendly(pet);

    const s = searchParams.get('startDate');
    const e = searchParams.get('endDate');
    if (s && e) {
      const start = parseISO(s);
      const end = parseISO(e);
      if (isValid(start) && isValid(end)) {
        setDateRange([{ startDate: start, endDate: end, key: 'selection' }]);
      }
    }

    // Si la URL contiene filtros activos, los guardamos en sessionStorage
    if (Array.from(searchParams.keys()).length > 0 && typeof window !== 'undefined') {
      const currentParams: Record<string, string> = {};
      searchParams.forEach((val, key) => { currentParams[key] = val; });
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(currentParams));
    }
  }, [searchParams]);

  // Manejo de Click Outside y Tecla Escape
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

  // Handler de Búsqueda
  const handleSearch = (e?: React.FormEvent) => {
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

    if (rentalType) {
      params.set('rentalType', rentalType);
      storageObj['rentalType'] = rentalType;
    }
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
      storageObj['maxPrice'] = maxPrice;
    }
    if (isPetFriendly) {
      params.set('isPetFriendly', 'true');
      storageObj['isPetFriendly'] = 'true';
    }

    // Persistir estado en SessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(storageObj));
    }

    setShowFilterModal(false);
    setShowCalendar(false);
    setShowDestinations(false);
    router.push(`/catalog?${params.toString()}`);
  };

  // Limpiar todos los filtros activos
  const handleResetFilters = () => {
    setLocation('');
    setCapacity(1);
    setRentalType('');
    setMaxPrice('');
    setIsPetFriendly(false);
    const today = new Date();
    setDateRange([{ startDate: today, endDate: today, key: 'selection' }]);

    // Borrar estado guardado
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
    startDate && endDate && startDate.getTime() !== endDate.getTime()
  );

  const hasActiveFilters = Boolean(
    location || capacity > 1 || hasActiveDates || rentalType || maxPrice || isPetFriendly
  );

  // ==========================================
  // RENDER: VARIANTE HERO
  // ==========================================
  if (variant === 'hero') {
    return (
      <div className="relative w-full max-w-4xl">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl md:rounded-full p-2 md:p-1.5 w-full shadow-2xl relative z-20 gap-2 md:gap-0"
        >
          {/* Destino */}
          <div
            ref={destRef}
            className="w-full md:flex-1 flex flex-col justify-center px-4 md:px-6 py-2.5 md:py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors cursor-text relative"
            onClick={() => setShowDestinations(true)}
          >
            <label htmlFor="hero-location-input" className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5 cursor-text">
              Destino
            </label>
            <div className="flex items-center justify-between gap-1">
              <input
                id="hero-location-input"
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
              <div className="absolute top-full left-0 mt-2 md:mt-4 w-full max-w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden z-[60] py-3">
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
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500">
                          <MapPin size={18} />
                        </div>
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

          {/* Fechas */}
          <div
            ref={calRef}
            className="w-full md:flex-[1.5] flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors cursor-pointer relative"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <div className="flex-1 px-4 md:px-6 py-2.5 md:py-3 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">Llegada</span>
              <span className={`text-sm md:text-base font-medium truncate ${hasActiveDates ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                {hasActiveDates && startDate ? format(startDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fechas'}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 px-4 md:px-6 py-2.5 md:py-3 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-0.5">Salida</span>
              <span className={`text-sm md:text-base font-medium truncate ${hasActiveDates ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                {hasActiveDates && endDate ? format(endDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fechas'}
              </span>
            </div>

            {showCalendar && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 md:mt-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-[60] border border-slate-200 dark:border-slate-800 p-2"
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

          <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-slate-700" />

          {/* Huéspedes y Acción */}
          <div className="w-full md:flex-[0.8] flex items-center justify-between px-4 md:pl-6 md:pr-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl md:rounded-full transition-colors">
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-800 dark:text-slate-300 tracking-wider text-left mb-1">Huéspedes</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Reducir cantidad de huéspedes"
                  onClick={(e) => { e.stopPropagation(); setCapacity(Math.max(1, capacity - 1)); }}
                  className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:border-slate-800 dark:hover:border-slate-100 transition-colors cursor-pointer disabled:opacity-30"
                  disabled={capacity <= 1}
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="text-sm font-bold w-4 text-center text-slate-700 dark:text-slate-200">{capacity}</span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad de huéspedes"
                  onClick={(e) => { e.stopPropagation(); setCapacity(Math.min(99, capacity + 1)); }}
                  className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:border-slate-800 dark:hover:border-slate-100 transition-colors cursor-pointer disabled:opacity-30"
                  disabled={capacity >= 99}
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              aria-label="Buscar propiedades"
              className="bg-primary hover:bg-primary/90 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0 ml-2 shadow-lg"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // RENDER: VARIANTE CATALOG
  // ==========================================
  return (
    <div className="w-full max-w-[1100px] mx-auto mb-8">
      <form
        onSubmit={handleSearch}
        className="bg-surface p-3 rounded-2xl border border-subtle shadow-md flex flex-wrap md:flex-nowrap items-center gap-2"
      >
        {/* Destino Compacto */}
        <div ref={destRef} className="relative flex-1 min-w-[180px]">
          <div
            onClick={() => setShowDestinations(true)}
            className="flex items-center gap-2 px-3 py-2 bg-app/60 rounded-xl border border-subtle focus-within:border-primary transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              placeholder="¿Dónde buscás?"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setShowDestinations(true); }}
              onFocus={() => setShowDestinations(true)}
              className="w-full bg-transparent text-sm text-main focus:outline-none placeholder:text-muted"
            />
            {location && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLocation(''); }}
                className="text-muted hover:text-main"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {showDestinations && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[260px] bg-surface border border-subtle rounded-2xl shadow-2xl overflow-hidden z-[60] py-2">
              <ul>
                {destinosFiltrados.length > 0 ? (
                  destinosFiltrados.map((dest, idx) => (
                    <li
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setLocation(dest); setShowDestinations(false); }}
                      className="px-4 py-2 hover:bg-app text-sm text-main flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin size={16} className="text-muted" />
                      <span>{dest}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-xs text-muted text-center">No hay resultados</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Fechas Compactas */}
        <div ref={calRef} className="relative flex-1 min-w-[200px]">
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-between px-3 py-2 bg-app/60 rounded-xl border border-subtle text-sm text-main transition-colors text-left"
          >
            <span className="truncate">
              {hasActiveDates && startDate && endDate
                ? `${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`
                : 'Añadir fechas'}
            </span>
          </button>

          {showCalendar && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden z-[60] border border-subtle p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <DateRange
                ranges={dateRange}
                onChange={(item: RangeKeyDict) => {
                  if (item.selection) setDateRange([item.selection]);
                }}
                minDate={new Date()}
                months={1}
                direction="horizontal"
                locale={es}
                showDateDisplay={false}
                rangeColors={['#0055FF']}
              />
            </div>
          )}
        </div>

        {/* Huéspedes Compacto */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-app/60 rounded-xl border border-subtle min-w-[130px] justify-between">
          <span className="text-xs text-muted font-medium">Huéspedes</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Reducir cantidad de huéspedes"
              onClick={() => setCapacity(Math.max(1, capacity - 1))}
              className="w-5 h-5 rounded-full border border-subtle flex items-center justify-center text-muted hover:text-main cursor-pointer disabled:opacity-30"
              disabled={capacity <= 1}
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-semibold text-main">{capacity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad de huéspedes"
              onClick={() => setCapacity(Math.min(99, capacity + 1))}
              className="w-5 h-5 rounded-full border border-subtle flex items-center justify-center text-muted hover:text-main cursor-pointer disabled:opacity-30"
              disabled={capacity >= 99}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Botón Filtros Avanzados */}
        <button
          type="button"
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-app hover:bg-subtle/40 rounded-xl border border-subtle text-sm text-main font-medium transition-colors cursor-pointer relative"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filtros</span>
          {(rentalType || maxPrice || isPetFriendly) && (
            <span className="w-2 h-2 rounded-full bg-primary absolute top-1.5 right-1.5" />
          )}
        </button>

        {/* Botón Restablecer Filtros (Visible cuando hay filtros activos) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            title="Limpiar filtros"
            className="p-2 text-muted hover:text-main bg-app hover:bg-subtle/40 rounded-xl border border-subtle transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
        )}

        {/* Botón Buscar */}
        <button
          type="submit"
          className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Search size={16} />
          <span>Buscar</span>
        </button>
      </form>

      {/* MODAL DE FILTROS AVANZADOS */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-subtle mb-4">
              <h3 className="text-lg font-bold text-main">Filtros de búsqueda</h3>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="p-1 text-muted hover:text-main rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="rental-type-select" className="block text-xs font-bold uppercase text-muted mb-2">Tipo de Contrato</label>
                <select
                  id="rental-type-select"
                  value={rentalType}
                  onChange={(e) => setRentalType(e.target.value)}
                  className="w-full bg-app text-main border border-subtle rounded-xl p-3 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Todos los tipos</option>
                  <option value="Temporario">Temporario</option>
                  <option value="Residencial">Residencial</option>
                </select>
              </div>

              <div>
                <label htmlFor="max-price-input" className="block text-xs font-bold uppercase text-muted mb-2">Precio Máximo (US$)</label>
                <input
                  id="max-price-input"
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-app text-main border border-subtle rounded-xl p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label htmlFor="pet-friendly-checkbox" className="text-sm font-medium text-main cursor-pointer">
                  Acepta mascotas (Pet Friendly)
                </label>
                <input
                  id="pet-friendly-checkbox"
                  type="checkbox"
                  checked={isPetFriendly}
                  onChange={(e) => setIsPetFriendly(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 pt-4 border-t border-subtle">
              <button
                type="button"
                onClick={() => { setRentalType(''); setMaxPrice(''); setIsPetFriendly(false); }}
                className="flex-1 py-2.5 text-sm font-medium text-muted hover:text-main cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
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