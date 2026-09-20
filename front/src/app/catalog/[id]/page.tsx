"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { propertyService } from '@/services/propertyService';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Users, Bed, Bath, Scaling, CheckCircle2, Heart, Share, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { Property } from '@/interfaces/property';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extraemos el token y estado de autenticación de tu store global
  const { token, isAuthenticated } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Cargamos la propiedad al montar el componente
  useEffect(() => {
    const fetchProperty = async () => {
      // Desenvolvemos params.id porque en Next.js App Router params puede comportarse como Promesa
      const id = typeof params?.id === 'string' ? params.id : await params?.id;
      
      const data = await propertyService.getPropertyById(id as string);
      if (!data) {
        router.push('/catalog'); // Si no existe, lo devolvemos al catálogo
      } else {
        setProperty(data);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [params, router]);

  // LA LÓGICA CORE: Crear Reserva -> Crear Pago -> Mercado Pago
  const handleReservation = async () => {
    if (!isAuthenticated || !token) {
      toast.error('Debes iniciar sesión para solicitar una reserva');
      router.push('/auth/login');
      return;
    }

    setProcessingPayment(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // 1. Crear la Reserva en la base de datos
      const resResponse = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId: property?.id })
      });

      if (!resResponse.ok) {
        throw new Error('La propiedad ya no está disponible o hubo un error al reservar');
      }
      const reservation = await resResponse.json();

      // 2. Generar el enlace de Mercado Pago atado a esa reserva
      const payResponse = await fetch(`${API_URL}/payments/${reservation.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!payResponse.ok) {
        throw new Error('Error al generar la orden de pago');
      }
      const payment = await payResponse.json();

      // 3. Redirigir al checkout oficial de Mercado Pago
      window.location.href = payment.paymentUrl;

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
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
    <main className="w-full bg-white pb-24">
      {/* ================= HERO GALLERY ================= */}
      <div className="relative w-full h-[40vh] md:h-[55vh] flex overflow-hidden">
        <div className="relative w-1/2 h-full border-r-4 border-white">
          <Image 
            src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative w-1/2 h-full">
          <Image 
            src={property.images[1] || property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"}
            alt={`${property.title} interior`}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute bottom-6 right-6 z-10 flex gap-3">
          <button className="bg-white px-4 py-2 text-sm font-semibold text-base-4 rounded-[8px] shadow-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
            Ver {property.images.length} fotos
          </button>
        </div>
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-xs text-base-3 mb-4 uppercase tracking-wider font-medium">
          Vesta {'>'} {property.location}
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* ----- COLUMNA IZQUIERDA (Info) ----- */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-base-4 tracking-tight mb-6">
              {property.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-base-4 mb-8">
              <span className="flex items-center gap-2"><Users size={20} className="text-base-3" /> {property.capacity} huéspedes</span>
              <span className="flex items-center gap-2"><Bed size={20} className="text-base-3" /> {property.rooms} dorm.</span>
              <span className="flex items-center gap-2"><Bath size={20} className="text-base-3" /> {property.bathrooms} baños</span>
              <span className="flex items-center gap-2"><Scaling size={20} className="text-base-3" /> {property.area} m²</span>
            </div>

            <hr className="border-t border-slate-200 mb-8" />

            <div className="text-base-4/80 text-lg leading-relaxed mb-10">
              <p>{property.description}</p>
              <p className="mt-4">
                {property.isPetFriendly && "🐾 Tu mascota es bienvenida."}
                {property.hasGarage && " 🚗 Incluye estacionamiento privado."}
              </p>
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

          {/* ----- COLUMNA DERECHA (Widget de Reserva) ----- */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-2xl font-bold text-base-4">US$ {property.price}</span>
                    <span className="text-base-3"> / {property.priceUnit}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                      <Share size={18} className="text-base-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                      <Heart size={18} className="text-base-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-base-3 mb-6">
                  <div className="flex justify-between">
                    <span>US$ {property.price} x 1 {property.priceUnit}</span>
                    <span>US$ {property.price}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base-4 pt-3 border-t border-slate-200 text-lg">
                    <span>Total ({property.rentalType})</span>
                    <span>US$ {property.price}</span>
                  </div>
                </div>

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
                    <><Loader2 className="animate-spin" size={20} /> Conectando...</>
                  ) : !property.isAvailable ? (
                    "Propiedad no disponible"
                  ) : (
                    "Solicitar reserva"
                  )}
                </Button>
                
                <p className="text-center text-xs text-base-3 mt-3">
                  Serás redirigido a Mercado Pago de forma segura.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base-4 text-sm mb-1">Contacta al anunciante</h4>
                  <p className="text-xs text-base-3 max-w-[200px]">
                    ¿Tienes dudas? <span className="underline cursor-pointer font-medium text-base-4">Envía un mensaje</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                  <MessageCircle className="text-base-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}