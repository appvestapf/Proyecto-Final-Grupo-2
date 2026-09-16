import { notFound } from 'next/navigation';
import Image from 'next/image';
import { propertyService } from '@/services/propertyService';
import { Users, Bed, Bath, Scaling, CheckCircle2, Heart, Share, MessageCircle } from 'lucide-react';
import { Button } from '@/components/common/Button/Button'; // Usamos tu componente de botón

// En Next.js App Router, los parámetros de la URL llegan como 'params'
// Actualizamos el tipado para indicar que params es una Promesa
export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. "Desenvolvemos" los parámetros asíncronos (El truco está aquí)
  const resolvedParams = await params;
  
  // 2. Ahora sí buscamos la propiedad con el ID real
  const property = await propertyService.getPropertyById(resolvedParams.id);

  // Si alguien pone un ID que no existe (ej: /catalog/999), mostramos página 404
  if (!property) {
    notFound();
  }



  return (
    <main className="w-full bg-white pb-24">
      
      {/* ================= HERO GALLERY (Estilo Plum Guide 50/50) ================= */}
      <div className="relative w-full h-[40vh] md:h-[55vh] flex overflow-hidden">
        {/* Imagen Izquierda (Principal) */}
        <div className="relative w-1/2 h-full border-r-4 border-white">
          <Image 
            src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"}
            alt={property.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        {/* Imagen Derecha (Secundaria) */}
        <div className="relative w-1/2 h-full">
          <Image 
            // Si no hay segunda imagen, repetimos la primera para no romper el layout
            src={property.images[1] || property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"}
            alt={`${property.name} interior`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Botón flotante para ver todas las fotos (Bottom Right de la galería) */}
        <div className="absolute bottom-6 right-6 z-10 flex gap-3">
          <button className="bg-white px-4 py-2 text-sm font-semibold text-base-4 rounded-[8px] shadow-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
            Ver {property.images.length} fotos
          </button>
        </div>
      </div>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Breadcrumbs (Migas de pan) */}
  {/* Breadcrumbs (Migas de pan) */}
<div className="text-xs text-base-3 mb-4 uppercase tracking-wider font-medium">
  Vesta {'>'} {property.location}
</div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* ----- COLUMNA IZQUIERDA (Info de la propiedad) ----- */}
          <div className="flex-1">
            
            {/* Título Principal (Geist font hace que luzca muy limpio) */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-base-4 tracking-tight mb-6">
              {property.title}
            </h1>

            {/* Fila de características (Features Row) */}
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-base-4 mb-8">
              <span className="flex items-center gap-2"><Users size={20} className="text-base-3" /> {property.capacity} huéspedes</span>
              <span className="flex items-center gap-2"><Bed size={20} className="text-base-3" /> {property.rooms} dorm.</span>
              <span className="flex items-center gap-2"><Bath size={20} className="text-base-3" /> {property.bathrooms} baños</span>
              <span className="flex items-center gap-2"><Scaling size={20} className="text-base-3" /> {property.area} m²</span>
            </div>

            <hr className="border-t border-slate-200 mb-8" />

            {/* Descripción */}
            <div className="text-base-4/80 text-lg leading-relaxed mb-10">
              <p>{property.description}</p>
              <p className="mt-4">
                El inmueble cuenta con todas las comodidades para garantizar una estadía perfecta. 
                Ideal para quienes buscan confort y diseño en una de las mejores zonas de la ciudad.
                {property.isPetFriendly && " Además, ¡tu mascota es bienvenida!"}
                {property.hasGarage && " Incluye estacionamiento privado."}
              </p>
            </div>

            <hr className="border-t border-slate-200 mb-8" />

            {/* The Vesta Promise (Garantía Vesta) */}
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
                <div className="flex gap-4">
                  <CheckCircle2 className="text-[#EAB308] shrink-0" fill="#FEF08A" size={24} />
                  <div>
                    <strong className="text-base-4 block">Anfitriones de confianza</strong>
                    <span className="text-base-3 text-sm">Con historial comprobado de alojamiento de alta calidad.</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-[#EAB308] shrink-0" fill="#FEF08A" size={24} />
                  <div>
                    <strong className="text-base-4 block">Soporte 24/7</strong>
                    <span className="text-base-3 text-sm">Asistencia excepcional antes, durante y después de tu estadía.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ----- COLUMNA DERECHA (Widget de Reserva Sticky) ----- */}
          <div className="w-full lg:w-[400px]">
            {/* position: sticky hace que la tarjeta baje contigo al hacer scroll */}
            <div className="sticky top-24 space-y-6">
              
              {/* Tarjeta Principal de Reserva */}
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

                {/* Simulador de Inputs para Fechas y Huéspedes */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="border border-slate-300 rounded-xl p-3 flex flex-col justify-center cursor-pointer hover:border-base-4 transition">
                    <span className="text-[10px] uppercase font-bold text-base-3">Fechas</span>
                    <span className="text-sm font-medium text-base-4">Seleccionar</span>
                  </div>
                  <div className="border border-slate-300 rounded-xl p-3 flex flex-col justify-center cursor-pointer hover:border-base-4 transition">
                    <span className="text-[10px] uppercase font-bold text-base-3">Huéspedes</span>
                    <span className="text-sm font-medium text-base-4">1 huésped</span>
                  </div>
                </div>

                {/* Desglose de precios (Mock) */}
                <div className="space-y-3 text-sm text-base-3 mb-6">
                  <div className="flex justify-between">
                    <span>US$ {property.price} x 1 {property.priceUnit}</span>
                    <span>US$ {property.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline cursor-pointer">Tarifa de limpieza</span>
                    <span>Incluido</span>
                  </div>
                  <div className="flex justify-between font-bold text-base-4 pt-3 border-t border-slate-200 text-lg">
                    <span>Total ({property.rentalType})</span>
                    <span>US$ {property.price}</span>
                  </div>
                </div>

                <Button variant="primary" className="w-full py-4 text-base bg-[#EAB308] hover:bg-[#CA8A04] text-white border-none">
                  Solicitar reserva
                </Button>
                
                <p className="text-center text-xs text-base-3 mt-3">
                  Aún no se te cobrará ningún cargo.
                </p>
              </div>

              {/* Tarjeta de Contacto con el Anunciante */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base-4 text-sm mb-1">Contacta al anunciante</h4>
                  <p className="text-xs text-base-3 max-w-[200px]">
                    ¿Tienes dudas sobre esta propiedad? <span className="underline cursor-pointer font-medium text-base-4">Envía un mensaje</span>
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