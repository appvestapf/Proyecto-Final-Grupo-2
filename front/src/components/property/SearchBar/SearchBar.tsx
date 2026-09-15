"use client";
import React, { useState } from 'react';
import { Button } from '@/components/common/Button/Button';
import { Search, MapPin, Home, DollarSign, Users } from 'lucide-react';

interface SearchBarProps {
  onSearch: (filters: { location: string; rentalType: string; maxPrice: string; capacity: string }) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [location, setLocation] = useState('');
  const [rentalType, setRentalType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, rentalType, maxPrice, capacity });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-[1100px] mx-auto bg-base-1 p-4 rounded-[12px] border border-base-2 shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-8"
    >
      {/* Filtro por Ubicación */}
      <div className="flex items-center gap-2 px-3 py-2 bg-base-2/50 rounded-[12px] border border-base-2">
        <MapPin className="w-5 h-5 text-base-3 shrink-0" />
        <input 
          type="text" 
          placeholder="¿Dónde buscás?" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent text-sm text-base-4 focus:outline-none placeholder:text-base-3"
        />
      </div>

      {/* Filtro por Tipo de Operación / Inmueble */}
      <div className="flex items-center gap-2 px-3 py-2 bg-base-2/50 rounded-[12px] border border-base-2">
        <Home className="w-5 h-5 text-base-3 shrink-0" />
        <select 
          value={rentalType}
          onChange={(e) => setRentalType(e.target.value)}
          className="w-full bg-transparent text-sm text-base-4 focus:outline-none cursor-pointer"
        >
          <option value="">Tipo (Todos)</option>
          <option value="Temporario">Temporario</option>
          <option value="Residencial">Residencial</option>
        </select>
      </div>

      {/* Filtro por Capacidad (Huéspedes) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-base-2/50 rounded-[12px] border border-base-2">
        <Users className="w-5 h-5 text-base-3 shrink-0" />
        <input 
          type="number" 
          placeholder="Huéspedes" 
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full bg-transparent text-sm text-base-4 focus:outline-none placeholder:text-base-3"
        />
      </div>

      {/* Filtro por Precio Máximo */}
      <div className="flex items-center gap-2 px-3 py-2 bg-base-2/50 rounded-[12px] border border-base-2">
        <DollarSign className="w-5 h-5 text-base-3 shrink-0" />
        <input 
          type="number" 
          placeholder="Precio máx. (US$)" 
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full bg-transparent text-sm text-base-4 focus:outline-none placeholder:text-base-3"
        />
      </div>

      {/* Botón de Búsqueda */}
      <div className="flex justify-center">
        <Button variant="primary" type="submit" className="w-full h-full py-3">
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>
    </form>
  );
};