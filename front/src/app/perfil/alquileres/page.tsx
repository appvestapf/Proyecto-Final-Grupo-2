"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Clock, CheckCircle2, Loader2, CalendarHeart, Ban, XCircle } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { reservationService } from '@/services/reservationService';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';
import PaymentButton from '@/components/property/PaymentButton';

export default function MisAlquileresPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reservas' | 'visitas'>('reservas');
  const [reservas, setReservas] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
  
  const { token, isAuthenticated } = useAuthStore();

  const loadData = async () => {
    if (!token) return;
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        toast.error('Debes iniciar sesión para ver tu panel.');
        router.push('/auth/login');
        return;
      }
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (token && !isCheckingAuth) {
      loadData();
    }
  }, [token, isCheckingAuth]);

  const handleCancelReservation = async (reservationId: string) => {
    if (!token) return;
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

    setCancellingReservationId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId, token);
      toast.success('Reserva cancelada correctamente');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cancelar la reserva');
    } finally {
      setCancellingReservationId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!token) return;
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta visita?')) return;

    setCancellingAppointmentId(appointmentId);
    try {
      await appointmentService.cancelAppointment(appointmentId, token);
      toast.success('Visita cancelada correctamente');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cancelar la visita');
    } finally {
      setCancellingAppointmentId(null);
    }
  };

  if (isCheckingAuth || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted transition-colors duration-200">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-medium">{isCheckingAuth ? "Verificando acceso..." : "Cargando tu información..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between border-b border-subtle pb-6">
        <div>
          <h2 className="text-3xl font-bold text-main tracking-tight">Mis Alquileres</h2>
          <p className="text-muted mt-2">Gestiona tus reservas, pagos y visitas agendadas.</p>
        </div>
      </div>

      <div className="flex gap-6 border-b border-subtle mb-8">
        <button 
          onClick={() => setActiveTab('reservas')}
          className={`pb-4 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'reservas' ? 'text-primary' : 'text-muted hover:text-main'
          }`}
        >
          Mis Reservas
          {activeTab === 'reservas' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('visitas')}
          className={`pb-4 text-sm font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'visitas' ? 'text-primary' : 'text-muted hover:text-main'
          }`}
        >
          Visitas Presenciales
          {activeTab === 'visitas' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
          )}
        </button>
      </div>

      {activeTab === 'reservas' && (
        <div className="space-y-6">
          {reservas.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-subtle shadow-sm">
              <p className="text-muted font-medium">Aún no tienes reservas registradas.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/catalog')}>
                Explorar propiedades
              </Button>
            </div>
          ) : (
            reservas.map((reserva) => {
              const propertyName = reserva.property?.title || reserva.property?.name || 'Propiedad';
              const propertyImage = reserva.property?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";

              return (
                <div 
                  key={reserva.id} 
                  className="bg-surface border border-subtle rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all"
                >
                  <div className="relative w-full md:w-48 h-48 md:h-auto rounded-xl overflow-hidden shrink-0 bg-app">
                    <Image 
                      src={propertyImage} 
                      alt={propertyName} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-main">{propertyName}</h3>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                          reserva.status === 'confirmed' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : reserva.status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {reserva.status === 'confirmed' ? (
                            <CheckCircle2 size={14} />
                          ) : reserva.status === 'cancelled' ? (
                            <XCircle size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {reserva.status === 'pending' ? 'Pendiente' : reserva.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm text-muted flex items-center gap-2 mb-4">
                        <MapPin size={16} /> {reserva.property?.location || `${reserva.property?.city || ''}, ${reserva.property?.country || ''}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end justify-between mt-6 pt-4 border-t border-subtle gap-4">
                      <p className="text-lg font-bold text-main">
                        US$ {reserva.totalPrice || reserva.property?.price}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        {reserva.status === 'pending' && (
                          <>
                            <PaymentButton 
                              reservationId={reserva.id} 
                              price={reserva.totalPrice || reserva.property?.price} 
                            />
                            <Button
                              variant="outline"
                              onClick={() => handleCancelReservation(reserva.id)}
                              disabled={cancellingReservationId === reserva.id}
                              className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 flex items-center gap-1 text-xs py-2 px-3 rounded-xl"
                            >
                              {cancellingReservationId === reserva.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Ban size={14} />
                              )}
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'visitas' && (
        <div className="space-y-6">
          {visitas.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-subtle shadow-sm">
              <p className="text-muted font-medium">No tienes visitas presenciales agendadas.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/catalog')}>
                Agendar una visita
              </Button>
            </div>
          ) : (
            visitas.map((visita) => {
              const propertyName = visita.property?.title || visita.property?.name || 'Propiedad';
              const propertyImage = visita.property?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";

              return (
                <div 
                  key={visita.id} 
                  className="bg-surface border border-subtle rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all"
                >
                  <div className="relative w-full md:w-32 h-32 md:h-auto rounded-xl overflow-hidden shrink-0 bg-app">
                    <Image 
                      src={propertyImage} 
                      alt={propertyName} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-main">{propertyName}</h3>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                          visita.status === 'confirmed' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : visita.status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {visita.status === 'confirmed' ? (
                            <CheckCircle2 size={14} />
                          ) : visita.status === 'cancelled' ? (
                            <XCircle size={14} />
                          ) : (
                            <CalendarHeart size={14} />
                          )}
                          {visita.status === 'pending' ? 'Pendiente' : visita.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm text-muted flex items-center gap-2 mb-4">
                        <MapPin size={16} /> {visita.property?.location || `${visita.property?.city || ''}, ${visita.property?.country || ''}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-end justify-between pt-4 border-t border-subtle gap-4">
                      <div className="bg-app/60 p-3 rounded-xl border border-subtle inline-block">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Fecha y Hora</p>
                        <p className="text-sm font-bold text-main">
                          {new Date(visita.date).toLocaleString('es-AR', { 
                            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' 
                          })}
                        </p>
                      </div>

                      {visita.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelAppointment(visita.id)}
                          disabled={cancellingAppointmentId === visita.id}
                          className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 flex items-center gap-1 text-xs py-2 px-3 rounded-xl"
                        >
                          {cancellingAppointmentId === visita.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Ban size={14} />
                          )}
                          Cancelar visita
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}