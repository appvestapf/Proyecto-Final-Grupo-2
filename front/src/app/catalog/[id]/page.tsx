"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertyService } from '@/services/propertyService';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Users, Bed, Bath, Scaling, CheckCircle2, Loader2, X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { Property } from '@/interfaces/property';
import PaymentButton from '@/components/property/PaymentButton';
import { FavoriteButton } from '@/components/common/FavoriteButton/FavoriteButton';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { token, isAuthenticated } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  // Estados para reservas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estados para citas (Appointments)
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [processingAppointment, setProcessingAppointment] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const data = await propertyService.getPropertyById(resolvedParams.id);
      if (!data) {
        router.push('/catalog');
      } else {
        setProperty(data);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (showGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showGallery]);

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = property?.rentalType === 'Temporario' ? calculateNights() : 1;
  const totalPrice = property ? (property.rentalType === 'Temporario' ? property.price * (nights || 1) : property.price) : 0;

  // Manejador para Agendar Cita
  const handleScheduleAppointment = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Debes iniciar sesión para agendar una visita');
      router.push('/auth/login');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error('Seleccioná una fecha y hora para la visita');
      return;
    }

    setProcessingAppointment(true);

    try {
      const dateTimeString = `${appointmentDate}T${appointmentTime}`;
      const dateObj = new Date(dateTimeString);

      if (dateObj <= new Date()) {
        toast.error('La fecha y hora de la visita debe ser en el futuro');
        setProcessingAppointment(false);
        return;
      }

      await appointmentService.createAppointment(token, property?.id as string, dateObj.toISOString());
      
      toast.success('¡Visita presencial agendada con éxito!');
      setShowAppointment(false);
      setAppointmentDate('');
      setAppointmentTime('');
    } catch (error: any) {
      toast.error(error.message || 'Error al intentar agendar la cita');
    } finally {
      setProcessingAppointment(false);
    }
  };

  // Manejador para la Reserva Principal
  const handleReservation = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Debes iniciar sesión para solicitar una reserva');
      router.push('/auth/login');
      return;
    }

    if (property?.rentalType === 'Temporario') {
      if (!startDate || !endDate) {
        toast.error('Por favor selecciona las fechas de llegada y salida');
        return;
      }
      if (nights < 1) {
        toast.error('La fecha de salida debe ser posterior a la llegada');
        return;
      }
    }

    setProcessingPayment(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const payload: any = { propertyId: property?.id };
      
      if (property?.rentalType === 'Temporario') {
        payload.startDate = startDate;
        payload.endDate = endDate;
      }

      const resResponse = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!resResponse.ok) {
        const errorData = await resResponse.json().catch(() => ({}));
        const serverMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(serverMessage || 'Error al conectar con el servidor');
      }
      
      const reservation = await resResponse.json();

      const payResponse = await fetch(`${API_URL}/payments/${reservation.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!payResponse.ok) throw new Error('Error al generar la orden de pago');
      
      const payment = await payResponse.json();
      
      toast.success('¡Reserva creada! Por favor completa el pago.');
      
      const prefId = payment.paymentUrl ? new URL(payment.paymentUrl).searchParams.get('pref_id') : payment.paymentId;
      
      if (prefId) {
        setPreferenceId(prefId);
      } else {
        window.location.href = payment.paymentUrl;
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="animate-spin" size={40} />
        <p>Cargando detalles del inmueble...</p>
      </div>
    );
  }

  if (!property) return null;

  return (
    <>
      {showGallery && (
        <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
          <div className="sticky top-0 w-full bg-white/90 backdrop-blur-md z-[9999] py-4 px-6 flex justify-end shadow-sm">
            <button 
              onClick={() => setShowGallery(false)} 
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={24} className="text-slate-900" />
            </button>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 pb-20 pt-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h2>
              <p className="text-slate-500">{property.capacity} huéspedes • {property.rooms} dorm. • {property.bathrooms} baños</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.images.map((img, idx) => (
                <div key={idx} className={`relative w-full h-[300px] md:h-[450px] ${idx % 3 === 0 ? 'md:col-span-2 md:h-[600px]' : ''}`}>
                  <Image src={img} alt={`${property.title} - foto ${idx + 1}`} fill className="object-cover rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="w-full bg-white pb-24">
        <div className="relative w-full h-[40vh] md:h-[55vh] flex overflow-hidden">
          <div className="relative w-1/2 h-full border-r-4 border-white">
            <Image src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} alt={property.title} fill className="object-cover" priority />
          </div>
          <div className="relative w-1/2 h-full">
            <Image src={property.images[1] || property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} alt={`${property.title} interior`} fill className="object-cover" priority />
          </div>
          <div className="absolute bottom-6 right-6 z-10 flex gap-3">
            <button onClick={() => setShowGallery(true)} className="bg-white px-4 py-2 text-sm font-semibold text-base-4 rounded-[8px] shadow-md border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center gap-2">
              Ver las {property.images.length} fotos
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="text-xs text-base-3 mb-4 uppercase tracking-wider font-medium">
            Vesta {'>'} {property.location}
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="flex-1">
              {/* Título e ícono de Favorito integrado */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-base-4 tracking-tight">
                  {property.title}
                </h1>
                <FavoriteButton propertyId={property.id} size={24} className="shrink-0 mt-2" />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-base-4 mb-8">
                <span className="flex items-center gap-2"><Users size={20} className="text-base-3" /> {property.capacity} huéspedes</span>
                <span className="flex items-center gap-2"><Bed size={20} className="text-base-3" /> {property.rooms} dorm.</span>
                <span className="flex items-center gap-2"><Bath size={20} className="text-base-3" /> {property.bathrooms} baños</span>
                <span className="flex items-center gap-2"><Scaling size={20} className="text-base-3" /> {property.area} m²</span>
              </div>

              <hr className="border-t border-slate-200 mb-8" />

              <div className="text-base-4/80 text-lg leading-relaxed mb-10">
                <p>{property.description}</p>
              </div>

              <hr className="border-t border-slate-200 mb-8" />

              <div className="mb-10">
                <h3 className="text-2xl font-bold text-base-4 mb-6 tracking-tight">Garantía Vesta</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="text-[#EAB308] shrink-0" fill="#FEF08A" size={24} />
                    <div>
                      <strong className="text-base-4 block">Propiedades verificadas</strong>
                      <span className="text-base-3 text-sm">Rechazamos miles de propiedades para que tú no tengas que preocuparte.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CAJA LATERAL FLOTANTE */}
            <div className="w-full lg:w-[400px]">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-2xl font-bold text-base-4">US$ {property.price}</span>
                      <span className="text-base-3"> / {property.priceUnit}</span>
                    </div>
                  </div>

                  {property.rentalType === 'Temporario' && (
                    <div className={`grid grid-cols-2 gap-3 mb-6 border border-slate-200 rounded-xl p-3 ${preferenceId ? 'bg-slate-100 opacity-60' : 'bg-slate-50'}`}>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Llegada</label>
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)} 
                          min={new Date().toISOString().split("T")[0]}
                          disabled={preferenceId !== null}
                          className="w-full bg-transparent text-sm font-semibold outline-none text-slate-800 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Salida</label>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)} 
                          min={startDate || new Date().toISOString().split("T")[0]}
                          disabled={preferenceId !== null}
                          className="w-full bg-transparent text-sm font-semibold outline-none text-slate-800 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-sm text-base-3 mb-6">
                    <div className="flex justify-between">
                      {property.rentalType === 'Temporario' ? (
                        <span>US$ {property.price} x {nights || 1} {nights === 1 ? 'noche' : 'noches'}</span>
                      ) : (
                        <span>Reserva residencial (1er mes)</span>
                      )}
                      <span>US$ {totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base-4 pt-3 border-t border-slate-200 text-lg">
                      <span>Total</span>
                      <span>US$ {totalPrice}</span>
                    </div>
                  </div>

                  {!preferenceId ? (
                    <Button 
                      variant="primary" 
                      onClick={handleReservation}
                      disabled={processingPayment || !property.isAvailable}
                      className={`w-full py-4 text-base border-none flex items-center justify-center gap-2 ${
                        !property.isAvailable 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                          : 'bg-[#EAB308] hover:bg-[#CA8A04] text-white cursor-pointer'
                      }`}
                    >
                      {processingPayment ? (
                        <><Loader2 className="animate-spin" size={20} /> Preparando pago...</>
                      ) : !property.isAvailable ? (
                        "Propiedad no disponible"
                      ) : (
                        "Solicitar reserva"
                      )}
                    </Button>
                  ) : (
                    <PaymentButton preferenceId={preferenceId} />
                  )}
                  
                  {/* SECCIÓN AGENDAR CITA */}
                  {!preferenceId && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowAppointment(!showAppointment)}
                        disabled={!property.isAvailable}
                        className={`w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          !property.isAvailable 
                            ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <CalendarClock size={18} />
                        Agendar visita presencial
                      </Button>

                      {showAppointment && (
                        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animation-fade-in">
                          <p className="text-xs font-bold uppercase text-slate-500">Elige cuándo ir:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="date"
                              value={appointmentDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setAppointmentDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-sm font-medium outline-none text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                              type="time"
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-sm font-medium outline-none text-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <Button
                            variant="primary"
                            onClick={handleScheduleAppointment}
                            disabled={processingAppointment}
                            className="w-full py-2.5 text-sm"
                          >
                            {processingAppointment ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} /> Procesando...
                              </span>
                            ) : (
                              "Confirmar Visita"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {!preferenceId && (
                    <p className="text-center text-xs text-base-3 mt-4">
                      Pagos asegurados a través de Mercado Pago.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}