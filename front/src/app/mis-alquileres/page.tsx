"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';

// Mock de reservas del usuario para la maquetación
const mockReservas = [
  {
    id: 'RES-001',
    propertyName: 'Departamento luminoso con balcón en Palermo',
    location: 'Palermo Soho, Buenos Aires',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
    checkIn: '12 Oct 2026',
    checkOut: '18 Oct 2026',
    status: 'Confirmada',
    total: 468
  },
  {
    id: 'RES-002',
    propertyName: 'Casa Nueva Córdoba',
    location: 'Córdoba, Argentina',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d',
    checkIn: '01 Nov 2026',
    checkOut: '31 Dic 2026',
    status: 'Pendiente de pago',
    total: 2200
  }
];

export default function MisAlquileresPage() {
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas');

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabecera del Panel */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Alquileres</h1>
          <p className="text-slate-500 mt-2">Gestiona tus reservas, pagos y visitas agendadas.</p>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-6 border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('activas')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'activas' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Reservas Activas
            {activeTab === 'activas' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'historial' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Historial
            {activeTab === 'historial' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Lista de Reservas */}
        <div className="space-y-6">
          {mockReservas.map((reserva) => (
            <div key={reserva.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              
              {/* Imagen */}
              <div className="relative w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden shrink-0">
                <Image 
                  src={reserva.image} 
                  alt={reserva.propertyName} 
                  fill 
                  className="object-cover"
                />
              </div>

              {/* Información */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{reserva.propertyName}</h3>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                      reserva.status === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {reserva.status === 'Confirmada' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {reserva.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                    <MapPin size={16} /> {reserva.location}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      <div className="text-sm">
                        <p className="text-slate-500 text-xs font-medium uppercase">Check-in</p>
                        <p className="font-semibold text-slate-900">{reserva.checkIn}</p>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      <div className="text-sm">
                        <p className="text-slate-500 text-xs font-medium uppercase">Check-out</p>
                        <p className="font-semibold text-slate-900">{reserva.checkOut}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
                  <p className="text-lg font-bold text-slate-900">
                    Total: US$ {reserva.total}
                  </p>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none">Ver detalles</Button>
                    {reserva.status === 'Pendiente de pago' && (
                      <Button variant="primary" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700">Pagar ahora</Button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}