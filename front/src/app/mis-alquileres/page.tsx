"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import { Calendar, MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { reservationService } from '@/services/reservationService';

export default function MisAlquileresPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'activas' | 'historial'>('activas');
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Extraemos el token del estado global (Zustand)
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchReservations = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }
      
      const data = await reservationService.getMyReservations(token);
      setReservas(data);
      setLoading(false);
    };

    fetchReservations();
  }, [token, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="animate-spin" size={40} />
        <p>Cargando tus reservas...</p>
      </div>
    );
  }

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
            Mis Reservas
            {activeTab === 'activas' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Lista de Reservas Vacía */}
  {reservas.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium">Aún no tienes reservas registradas.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/catalog')}>
              Explorar propiedades
            </Button>
          </div>
        )}
        {/* Lista de Reservas con Datos Reales */}
        <div className="space-y-6">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              
              {/* Imagen (Viene de la relación con Property) */}
              <div className="relative w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <Image 
                  src={reserva.property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} 
                  alt={reserva.property.name} 
                  fill 
                  className="object-cover"
                />
              </div>

              {/* Información */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{reserva.property.name}</h3>
                    
                    {/* Badge de Estado Dinámico */}
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                      reserva.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                      reserva.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {reserva.status === 'confirmed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {reserva.status === 'pending' ? 'Pendiente' : reserva.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                    <MapPin size={16} /> {reserva.property.city}, {reserva.property.country}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      <div className="text-sm">
                        <p className="text-slate-500 text-xs font-medium uppercase">Fecha de Solicitud</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(reserva.createdAt).toLocaleDateString('es-AR', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
                  <p className="text-lg font-bold text-slate-900">
                    Total: US$ {reserva.property.price} <span className="text-sm font-normal text-slate-500">/ {reserva.property.priceUnit}</span>
                  </p>
                  <div className="flex gap-3 w-full sm:w-auto">
                    {/* Botón condicional para pagos pendientes */}
                    {reserva.status === 'pending' && (
                       <p className="text-xs text-amber-600 font-medium flex items-center">
                         Falta completar el pago en Mercado Pago
                       </p>
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