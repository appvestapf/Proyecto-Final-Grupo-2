"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, MapPin, Clock, CheckCircle2, Loader2, CalendarHeart } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { reservationService } from '@/services/reservationService';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner'; // <-- IMPORTANTE: Agregar esto

export default function MisAlquileresPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reservas' | 'visitas'>('reservas');
  const [reservas, setReservas] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  
  // Agregamos un estado extra para bloquear el renderizado inicial
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
  
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 1. GUARD: Protección de ruta con pequeño retraso para hidratación
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        toast.error('Debes iniciar sesión para ver tu panel de alquileres.');
        router.push('/auth/login');
        return;
      }
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // 2. Carga de datos (Solo se ejecuta si pasó el guard)
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token || isCheckingAuth) return;
      
      try {
        const [resData, visData] = await Promise.all([
          reservationService.getMyReservations(token),
          appointmentService.getMyAppointments(token)
        ]);
        
        setReservas(resData);
        setVisitas(visData);
      } catch (error) {
        console.error("Error cargando el panel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [token, isCheckingAuth]);

  // 3. PANTALLA DE BLOQUEO (Mientras verifica el login o carga datos)
  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="animate-spin" size={40} />
        <p>{isCheckingAuth ? "Verificando acceso..." : "Cargando tu panel..."}</p>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Panel</h1>
          <p className="text-slate-500 mt-2">Gestiona tus reservas, pagos y visitas agendadas.</p>
        </div>

        <div className="flex gap-6 border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('reservas')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'reservas' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mis Reservas
            {activeTab === 'reservas' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('visitas')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'visitas' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Visitas Presenciales
            {activeTab === 'visitas' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* PESTAÑA: RESERVAS */}
        {activeTab === 'reservas' && (
          <div className="space-y-6">
            {reservas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">Aún no tienes reservas registradas.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/catalog')}>
                  Explorar propiedades
                </Button>
              </div>
            ) : (
              reservas.map((reserva) => (
                <div key={reserva.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  <div className="relative w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <Image src={reserva.property?.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} alt="Propiedad" fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{reserva.property?.name}</h3>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                          reserva.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {reserva.status === 'confirmed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                          {reserva.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                        <MapPin size={16} /> {reserva.property?.city}, {reserva.property?.country}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                      <p className="text-lg font-bold text-slate-900">US$ {reserva.property?.price}</p>
                      {reserva.status === 'pending' && <p className="text-xs text-amber-600 font-medium">Falta completar pago</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PESTAÑA: VISITAS */}
        {activeTab === 'visitas' && (
          <div className="space-y-6">
            {visitas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">No tienes visitas presenciales agendadas.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/catalog')}>
                  Agendar una visita
                </Button>
              </div>
            ) : (
              visitas.map((visita) => (
                <div key={visita.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  <div className="relative w-full md:w-32 h-32 md:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <Image src={visita.property?.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} alt="Propiedad" fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{visita.property?.name}</h3>
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 bg-blue-100 text-blue-700">
                          <CalendarHeart size={14} /> Agendada
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                        <MapPin size={16} /> {visita.property?.city}, {visita.property?.country}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block w-max">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha y Hora</p>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(visita.date).toLocaleString('es-AR', { 
                          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}