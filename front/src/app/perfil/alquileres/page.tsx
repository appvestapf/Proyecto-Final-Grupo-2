"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  CalendarHeart, 
  Ban, 
  XCircle, 
  AlertTriangle, 
  Receipt, 
  Key, 
  ShieldCheck, 
  X,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { reservationService } from '@/services/reservationService';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';
import PaymentButton from '@/components/property/PaymentButton';

function RentalSkeletonList() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-surface border border-subtle rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 md:h-36 rounded-xl bg-muted/20 shrink-0" />
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-muted/20 rounded-md w-1/3" />
                <div className="h-6 bg-muted/20 rounded-full w-24" />
              </div>
              <div className="h-4 bg-muted/20 rounded-md w-1/2" />
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-subtle">
              <div className="h-6 bg-muted/20 rounded-md w-28" />
              <div className="h-9 bg-muted/20 rounded-xl w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MisAlquileresPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'reservas' | 'visitas'>('reservas');
  const [reservas, setReservas] = useState<any[]>([]);
  const [visitas, setVisitas] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); 
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    reserva: any | null;
  }>({
    isOpen: false,
    reserva: null,
  });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'reserva' | 'visita';
    id: string | null;
    title: string;
  }>({
    isOpen: false,
    type: 'reserva',
    id: null,
    title: '',
  });

  const { token, isAuthenticated } = useAuthStore();

  const loadData = useCallback(async () => {
    if (!token) return [];
    try {
      const [resData, visData] = await Promise.all([
        reservationService.getMyReservations(token),
        appointmentService.getMyAppointments(token)
      ]);

      const sortedReservas = (resData || []).sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.startDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.startDate || 0).getTime();
        return dateB - dateA;
      });

      const sortedVisitas = (visData || []).sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      });
    
      setReservas(sortedReservas);
      setVisitas(sortedVisitas);

      return sortedReservas;
    } catch (error) {
      console.error("Error cargando el panel:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  // Polling inteligente al ingresar con status approved
  useEffect(() => {
    if (token && !isCheckingAuth) {
      loadData();

      const status = searchParams.get('status') || searchParams.get('collection_status');
      if (status === 'approved') {
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts += 1;
          const currentReservas = await loadData();
          
          // Detener el polling si alguna reserva cambió a confirmed
          const hasConfirmed = currentReservas.some((r: any) => r.status === 'confirmed');
          if (hasConfirmed || attempts >= 6) {
            clearInterval(interval);
          }
        }, 2000);

        return () => clearInterval(interval);
      }
    }
  }, [token, isCheckingAuth, loadData, searchParams]);

  const openCancelModal = (type: 'reserva' | 'visita', id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      type,
      id,
      title,
    });
  };

  const closeCancelModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmCancel = async () => {
    if (!token || !confirmModal.id) return;

    const { type, id } = confirmModal;
    closeCancelModal();

    if (type === 'reserva') {
      setCancellingReservationId(id);
      try {
        await reservationService.cancelReservation(token, id);
        toast.success('Reserva cancelada correctamente');
        await loadData();
      } catch (error: any) {
        toast.error(error.message || 'No se pudo cancelar la reserva');
      } finally {
        setCancellingReservationId(null);
      }
    } else {
      setCancellingAppointmentId(id);
      try {
        await appointmentService.cancelAppointment(id, token);
        toast.success('Visita presencial cancelada correctamente');
        await loadData();
      } catch (error: any) {
        toast.error(error.message || 'No se pudo cancelar la visita');
      } finally {
        setCancellingAppointmentId(null);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    
    if (!year || !month || !day) return '-';

    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return '-';

    return parsedDate.toLocaleString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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

      {isCheckingAuth || loading ? (
        <RentalSkeletonList />
      ) : activeTab === 'reservas' ? (
        <div className="space-y-6">
          {reservas.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-subtle shadow-sm">
              <p className="text-muted font-medium">Aún no tienes reservas registradas.</p>
              <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => router.push('/catalog')}>
                Explorar propiedades
              </Button>
            </div>
          ) : (
            reservas.map((reserva) => {
              const propertyName = reserva.property?.title || reserva.property?.name || 'Propiedad';
              const propertyImage = reserva.property?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";
              const isCancelled = reserva.status === 'cancelled';

              return (
                <div 
                  key={reserva.id} 
                  className={`bg-surface border border-subtle rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 transition-all ${
                    isCancelled ? 'opacity-60 grayscale-[25%]' : 'hover:shadow-md'
                  }`}
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
                            : isCancelled
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {reserva.status === 'confirmed' ? (
                            <CheckCircle2 size={14} />
                          ) : isCancelled ? (
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

                      {(reserva.startDate || reserva.endDate) && (
                        <div className="inline-flex items-center gap-2 bg-app/60 px-3 py-2 rounded-xl border border-subtle text-xs text-main font-medium">
                          <Calendar size={14} className="text-primary" />
                          <span>{formatDate(reserva.startDate)}</span>
                          <span className="text-muted">→</span>
                          <span>{formatDate(reserva.endDate)}</span>
                          {reserva.nights && <span className="text-muted text-xs">({reserva.nights} noches)</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-end justify-between mt-6 pt-4 border-t border-subtle gap-4">
                      <div>
                        <p className="text-xs text-muted uppercase font-semibold">Monto Total</p>
                        <p className="text-lg font-bold text-main">
                          US$ {reserva.totalPrice || reserva.property?.price}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {reserva.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            onClick={() => setReceiptModal({ isOpen: true, reserva })}
                            className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                          >
                            <Receipt size={14} />
                            Ver Comprobante
                          </Button>
                        )}

                        {reserva.status === 'pending' && (
                          <>
                            <PaymentButton 
                              reservationId={reserva.id} 
                              price={reserva.totalPrice || reserva.property?.price} 
                            />
                            <Button
                              variant="outline"
                              onClick={() => openCancelModal('reserva', reserva.id, propertyName)}
                              disabled={cancellingReservationId === reserva.id}
                              className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 flex items-center gap-1 text-xs py-2 px-3 rounded-xl cursor-pointer"
                            >
                              <Ban size={14} />
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
      ) : (
        <div className="space-y-6">
          {visitas.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-subtle shadow-sm">
              <p className="text-muted font-medium">No tienes visitas presenciales agendadas.</p>
              <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => router.push('/catalog')}>
                Agendar una visita
              </Button>
            </div>
          ) : (
            visitas.map((visita) => {
              const propertyName = visita.property?.title || visita.property?.name || 'Propiedad';
              const propertyImage = visita.property?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";
              const isCancelled = visita.status === 'cancelled';

              return (
                <div 
                  key={visita.id} 
                  className={`bg-surface border border-subtle rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 transition-all ${
                    isCancelled ? 'opacity-60 grayscale-[25%]' : 'hover:shadow-md'
                  }`}
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
                            : isCancelled
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {visita.status === 'confirmed' ? (
                            <CheckCircle2 size={14} />
                          ) : isCancelled ? (
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
                        <p className="text-sm font-bold text-main capitalize">
                          {formatDateTime(visita.date)}
                        </p>
                      </div>

                      {!isCancelled && (
                        <Button
                          variant="outline"
                          onClick={() => openCancelModal('visita', visita.id, propertyName)}
                          disabled={cancellingAppointmentId === visita.id}
                          className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 flex items-center gap-1 text-xs py-2 px-3 rounded-xl cursor-pointer"
                        >
                          <Ban size={14} />
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

      {/* Modal de Cancelación Directo */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-surface border border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 border border-rose-500/20">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-main">
                  Cancelar {confirmModal.type === 'reserva' ? 'Reserva' : 'Visita Presencial'}
                </h3>
                <p className="text-sm text-muted">
                  ¿Estás seguro de que deseas cancelar la {confirmModal.type} para <span className="font-semibold text-main">{confirmModal.title}</span>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-subtle">
              <Button
                variant="outline"
                onClick={closeCancelModal}
                className="rounded-xl text-xs py-2 px-4 cursor-pointer"
              >
                Volver
              </Button>
              <Button
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs py-2 px-4 font-medium transition-colors cursor-pointer"
              >
                Sí, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprobante / Detalles del Alquiler */}
      {receiptModal.isOpen && receiptModal.reserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-subtle rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            
            <button 
              onClick={() => setReceiptModal({ isOpen: false, reserva: null })}
              className="absolute top-4 right-4 text-muted hover:text-main p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-subtle pb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-main">Comprobante de Reserva</h3>
                <p className="text-xs text-muted">ID Reserva: #{receiptModal.reserva.id?.slice(-8)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-app/60 border border-subtle rounded-xl space-y-2">
                <p className="text-xs font-semibold uppercase text-muted">Propiedad Alquilada</p>
                <p className="text-base font-bold text-main">
                  {receiptModal.reserva.property?.title || 'Propiedad en Vesta'}
                </p>
                <p className="text-xs text-muted flex items-center gap-1">
                  <MapPin size={14} /> {receiptModal.reserva.property?.location || 'Dirección no especificada'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-app/40 border border-subtle rounded-xl">
                  <span className="text-muted block mb-1">Estado de Pago:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={14} /> Mercado Pago (Aprobado)
                  </span>
                </div>
                <div className="p-3 bg-app/40 border border-subtle rounded-xl">
                  <span className="text-muted block mb-1">Monto Abonado:</span>
                  <span className="text-main font-bold">
                    US$ {receiptModal.reserva.totalPrice || receiptModal.reserva.property?.price}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <p className="text-xs font-bold uppercase text-primary flex items-center gap-1">
                  <Key size={14} /> Instrucciones de Check-in
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  Presenta tu documento de identidad y este comprobante al momento del ingreso. El anfitrión te contactará vía correo para las llaves y detalles del ingreso.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setReceiptModal({ isOpen: false, reserva: null })}
                className="rounded-xl text-xs py-2 px-6 cursor-pointer"
              >
                Cerrar Comprobante
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}