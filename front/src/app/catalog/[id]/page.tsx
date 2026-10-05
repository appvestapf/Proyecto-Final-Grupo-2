"use client";

import { useState, useEffect, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { propertyService } from '@/services/propertyService';
import { appointmentService } from '@/services/appointmentService';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Users, Bed, Bath, Scaling, CheckCircle2, Loader2, X, CalendarClock, MapPin } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { Property } from '@/interfaces/property';
import { FavoriteButton } from '@/components/common/FavoriteButton/FavoriteButton';

// Importaciones del Calendario
import { DateRange, Range, RangeKeyDict } from 'react-date-range';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 

// Importación dinámica de PropertyDetailMap deshabilitando SSR para Mapbox
const PropertyDetailMap = dynamic(
  () => import('@/components/property/PropertyDetailMap/PropertyDetailMap').then((mod) => mod.PropertyDetailMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] bg-surface rounded-2xl animate-pulse border border-subtle flex items-center justify-center text-muted text-sm">
        Cargando mapa de ubicación...
      </div>
    ),
  }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";

export default function PropertyDetailPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const { token, isAuthenticated } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Estados para reservas con react-date-range e inicialización mediante Query Params
  const [showCalendar, setShowCalendar] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  const [dateRange, setDateRange] = useState<Range[]>(() => {
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (startDateParam && endDateParam) {
      const [sYear, sMonth, sDay] = startDateParam.split('-').map(Number);
      const [eYear, eMonth, eDay] = endDateParam.split('-').map(Number);

      return [{
        startDate: new Date(sYear, sMonth - 1, sDay),
        endDate: new Date(eYear, eMonth - 1, eDay),
        key: 'selection'
      }];
    }

    return [{
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }];
  });

  // Estados para citas (Appointments)
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [processingAppointment, setProcessingAppointment] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyById(resolvedParams.id);
        if (!data) {
          router.push('/catalog');
        } else {
          setProperty(data);
        }
      } catch (error) {
        toast.error('Error al cargar la propiedad');
        router.push('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [resolvedParams.id, router]);

  // Manejo del scroll de fondo y tecla Escape para el modal de galería
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowGallery(false);
      }
    };

    if (showGallery) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGallery]);

  // Cerrar el calendario al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar selección de fechas y actualización de Query Params
  const handleDateSelect = (item: RangeKeyDict) => {
    const selectedRange = item.selection;
    setDateRange([selectedRange]);

    if (selectedRange.startDate && selectedRange.endDate) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('startDate', format(selectedRange.startDate, 'yyyy-MM-dd'));
      newParams.set('endDate', format(selectedRange.endDate, 'yyyy-MM-dd'));

      router.replace(`/catalog/${resolvedParams.id}?${newParams.toString()}`, { scroll: false });
    }
  };

  // Conversión numérica y segura de las coordenadas
  const lat = property ? Number(property.lat) : 0;
  const lng = property ? Number(property.lng) : 0;

  // Cálculo de noches para alquileres temporarios
  const calculateNights = () => {
    const start = dateRange[0].startDate;
    const end = dateRange[0].endDate;
    if (!start || !end || start.getTime() === end.getTime()) return 0;
    
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
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error('Seleccioná una fecha y hora para la visita');
      return;
    }

    setProcessingAppointment(true);

    try {
      const [year, month, day] = appointmentDate.split('-').map(Number);
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const dateObj = new Date(year, month - 1, day, hours, minutes);

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
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (property?.rentalType === 'Temporario') {
      const start = dateRange[0].startDate;
      const end = dateRange[0].endDate;
      if (!start || !end || start.getTime() === end.getTime()) {
        toast.error('Por favor selecciona un rango de fechas válido');
        return;
      }
    }

    setProcessingPayment(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const payload: Record<string, any> = { propertyId: property?.id };
      
      if (property?.rentalType === 'Temporario' && dateRange[0].startDate && dateRange[0].endDate) {
        payload.startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
        payload.endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');
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
      
      toast.success('¡Reserva creada! Redirigiendo a Mercado Pago...');     
      window.location.href = payment.paymentUrl;

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-muted bg-app">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Cargando detalles del inmueble...</p>
      </div>
    );
  }

  if (!property) return null;

  const imagesList = property.images && property.images.length > 0 ? property.images : [DEFAULT_IMAGE];
  const coverMainImage = imagesList[0];
  const coverSecondaryImage = imagesList[1] || imagesList[0];

  const startDate = dateRange[0].startDate;
  const endDate = dateRange[0].endDate;
  const hasValidRange = startDate && endDate && startDate.getTime() !== endDate.getTime();

  return (
    <>
      {showGallery && (
        <div className="fixed inset-0 z-[9999] bg-surface overflow-y-auto">
          <div className="sticky top-0 w-full bg-surface/90 backdrop-blur-md z-[9999] py-4 px-6 flex justify-end shadow-sm">
            <button 
              onClick={() => setShowGallery(false)} 
              className="p-3 bg-app hover:bg-subtle rounded-full transition-colors cursor-pointer flex items-center justify-center text-main"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 pb-20 pt-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-main mb-2">{property.title}</h2>
              <p className="text-muted">{property.capacity} huéspedes • {property.rooms} dorm. • {property.bathrooms} baños</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagesList.map((img, idx) => (
                <div key={idx} className={`relative w-full h-[300px] md:h-[450px] ${idx % 3 === 0 ? 'md:col-span-2 md:h-[600px]' : ''}`}>
                  <Image src={img} alt={`${property.title} - foto ${idx + 1}`} fill className="object-cover rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="w-full bg-app pb-24 transition-colors duration-200">
        {/* Galería de Portada */}
        <div className="relative w-full h-[40vh] md:h-[55vh] flex overflow-hidden">
          <div className="relative w-1/2 h-full border-r-4 border-app">
            <Image src={coverMainImage} alt={property.title} fill className="object-cover" priority />
          </div>
          <div className="relative w-1/2 h-full">
            <Image src={coverSecondaryImage} alt={`${property.title} interior`} fill className="object-cover" priority />
          </div>
          <div className="absolute bottom-6 right-6 z-10 flex gap-3">
            <button onClick={() => setShowGallery(true)} className="bg-surface px-4 py-2 text-sm font-semibold text-main rounded-[8px] shadow-md border border-subtle hover:bg-app cursor-pointer flex items-center gap-2 transition-colors">
              Ver las {imagesList.length} fotos
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="text-xs text-muted mb-4 uppercase tracking-wider font-bold">
            Vesta {'>'} {property.location}
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-main tracking-tight">
                  {property.title}
                </h1>
                <FavoriteButton propertyId={property.id} size={24} className="shrink-0 mt-2" />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-main mb-8">
                <span className="flex items-center gap-2"><Users size={20} className="text-muted" /> {property.capacity} huéspedes</span>
                <span className="flex items-center gap-2"><Bed size={20} className="text-muted" /> {property.rooms} dorm.</span>
                <span className="flex items-center gap-2"><Bath size={20} className="text-muted" /> {property.bathrooms} baños</span>
                <span className="flex items-center gap-2"><Scaling size={20} className="text-muted" /> {property.area} m²</span>
              </div>

              <hr className="border-t border-subtle mb-8" />

              <div className="text-main/80 text-lg leading-relaxed mb-10">
                <p>{property.description}</p>
              </div>

              <hr className="border-t border-subtle mb-8" />

              <div className="mb-10">
                <h3 className="text-2xl font-bold text-main mb-6 tracking-tight">Garantía Vesta</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="text-[#EAB308] shrink-0" fill="#FEF08A" size={24} />
                    <div>
                      <strong className="text-main block">Propiedades verificadas</strong>
                      <span className="text-muted text-sm">Rechazamos miles de propiedades para que tú no tengas que preocuparte.</span>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-t border-subtle mb-8" />

              {/* SECCIÓN DE UBICACIÓN Y MAPA */}
              {!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-main mb-3 tracking-tight flex items-center gap-2">
                    <MapPin className="text-primary" size={24} />
                    Ubicación
                  </h3>
                  <p className="text-muted text-base mb-6">
                    {property.location}
                  </p>
                  <PropertyDetailMap 
                    lat={lat}
                    lng={lng}
                    title={property.title}
                    isExactLocationVisible={false}
                    radiusInMeters={350}
                  />
                </div>
              )}
            </div>

            {/* CAJA LATERAL FLOTANTE */}
            <div className="w-full lg:w-[400px]">
              <div className="sticky top-24 space-y-6">
                <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-xl dark:shadow-none transition-colors duration-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-2xl font-bold text-main">US$ {property.price}</span>
                      <span className="text-muted"> / {property.priceUnit}</span>
                    </div>
                  </div>

                  {/* CALENDARIO DE RESERVAS */}
                  {property.rentalType === 'Temporario' && (
                    <div ref={calRef} className="relative mb-6">
                      <div 
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="flex border border-subtle rounded-2xl p-3 bg-surface hover:bg-app cursor-pointer transition-colors"
                      >
                        <div className="flex-1 flex flex-col justify-center px-2">
                          <label className="block text-[10px] font-bold uppercase text-muted mb-0.5 cursor-pointer tracking-wider">Llegada</label>
                          <span className={`text-sm font-semibold truncate ${hasValidRange ? 'text-main' : 'text-muted'}`}>
                            {hasValidRange && startDate ? format(startDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fechas'}
                          </span>
                        </div>
                        <div className="w-[1px] bg-subtle my-1" />
                        <div className="flex-1 flex flex-col justify-center px-4">
                          <label className="block text-[10px] font-bold uppercase text-muted mb-0.5 cursor-pointer tracking-wider">Salida</label>
                          <span className={`text-sm font-semibold truncate ${hasValidRange ? 'text-main' : 'text-muted'}`}>
                            {hasValidRange && endDate ? format(endDate, 'dd MMM. yyyy', { locale: es }) : 'Añadir fechas'}
                          </span>
                        </div>
                      </div>

                      {/* Popover del Calendario */}
                      {showCalendar && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-3xl shadow-xl overflow-hidden z-50 border border-slate-200 text-slate-900" onClick={(e) => e.stopPropagation()}>
                          <DateRange
                            ranges={dateRange}
                            onChange={handleDateSelect}
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
                  )}

                  <div className="space-y-3 text-sm text-muted mb-6">
                    <div className="flex justify-between">
                      {property.rentalType === 'Temporario' ? (
                        <span>US$ {property.price} x {nights || 1} {nights === 1 ? 'noche' : 'noches'}</span>
                      ) : (
                        <span>Reserva residencial (1er mes)</span>
                      )}
                      <span>US$ {totalPrice.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-main pt-3 border-t border-subtle text-lg">
                      <span>Total</span>
                      <span>US$ {totalPrice.toLocaleString("es-AR")}</span>
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    onClick={handleReservation}
                    disabled={processingPayment || !property.isAvailable}
                    className={`w-full py-4 text-base border-none flex items-center justify-center gap-2 rounded-[14px] ${
                      !property.isAvailable 
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' 
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
                  
                  {/* SECCIÓN AGENDAR CITA */}
                  <div className="mt-6 border-t border-subtle pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowAppointment(!showAppointment)}
                      disabled={!property.isAvailable}
                      className={`w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded-[14px] ${
                        !property.isAvailable 
                          ? 'border-subtle text-muted cursor-not-allowed'
                          : 'border-subtle text-main hover:bg-app'
                      }`}
                    >
                      <CalendarClock size={18} />
                      Agendar visita presencial
                    </Button>

                    {showAppointment && (
                      <div className="mt-4 p-4 bg-app border border-subtle rounded-2xl space-y-4 animation-fade-in">
                        <p className="text-xs font-bold uppercase text-muted tracking-wider">Elige cuándo ir:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={appointmentDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            className="w-full bg-surface border border-subtle text-sm font-medium outline-none text-main rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 dark:[color-scheme:dark]"
                          />
                          <input
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            className="w-full bg-surface border border-subtle text-sm font-medium outline-none text-main rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 dark:[color-scheme:dark]"
                          />
                        </div>
                        <Button
                          variant="primary"
                          onClick={handleScheduleAppointment}
                          disabled={processingAppointment}
                          className="w-full py-2.5 text-sm rounded-[12px]"
                        >
                          {processingAppointment ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="animate-spin" size={16} /> Procesando...
                            </span>
                          ) : (
                            "Confirmar Visita"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-xs text-muted mt-4 font-medium">
                    Pagos asegurados a través de Mercado Pago.
                  </p>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}