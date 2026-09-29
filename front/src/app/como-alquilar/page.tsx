"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Share2, Search, CalendarClock, CreditCard, Key, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { toast } from 'sonner';

export default function ComoAlquilarArticlePage() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Cómo alquilar en Vesta',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <main className="min-h-screen bg-app transition-colors duration-200 pb-20">
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        
        {/* HERO SECTION (Basado en el diseño de referencia) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mb-16">
          
          {/* Columna Izquierda: Textos y Meta */}
          <div className="flex-1 w-full order-2 lg:order-1">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted font-medium mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight size={16} className="mx-1 opacity-50" />
              <Link href="/ayuda" className="hover:text-primary transition-colors">Guías</Link>
              <ChevronRight size={16} className="mx-1 opacity-50" />
              <span className="text-main">Cómo alquilar</span>
            </nav>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-main tracking-tight leading-[1.1] mb-6">
              Guía práctica para alquilar de forma 100% segura
            </h1>
            
            <p className="text-lg md:text-xl text-muted leading-relaxed mb-8 max-w-2xl">
              Alquilar tu próximo hogar nunca fue tan simple. Descubrí cómo funciona nuestra plataforma, desde la búsqueda filtrada hasta la entrega de llaves, sin intermediarios ocultos.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-subtle pt-6">
              <div>
                <p className="text-sm font-semibold text-main">Por Equipo Vesta <span className="font-normal text-muted">— 28/09/2026</span></p>
                <p className="text-xs text-muted mt-1">Actualizado: hace 2 días</p>
              </div>
              
              <button 
                onClick={handleShare}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-primary hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                title="Compartir artículo"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Columna Derecha: Imagen Principal */}
          <div className="flex-1 w-full order-1 lg:order-2">
            <div className="relative w-full aspect-[4/3] lg:aspect-square max-h-[500px] rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
              <Image 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1073&auto=format&fit=crop" 
                alt="Pareja recibiendo las llaves de su nuevo departamento" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

        </div>

        {/* CUERPO DEL ARTÍCULO */}
        <div className="max-w-3xl mx-auto space-y-12">
          
          <section>
            <p className="text-lg text-main/90 leading-relaxed">
              En Vesta rediseñamos la experiencia de alquilar para que sea transparente, rápida y sin sorpresas. Ya sea que busques un departamento amoblado para unas vacaciones de dos semanas o una casa familiar para establecerte a largo plazo, nuestra plataforma centraliza todo el proceso.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-subtle pb-4">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-primary shadow-sm">
                <Search size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-main">1. Búsqueda y Tipos de Alquiler</h2>
            </div>
            
            <p className="text-main/80 leading-relaxed text-lg">
              Nuestro catálogo cuenta con más de 12.000 inmuebles verificados. Al utilizar el buscador, notarás que las propiedades se dividen en dos grandes categorías:
            </p>
            <ul className="space-y-4 mt-4">
              <li className="flex items-start gap-3 bg-surface p-4 border border-subtle rounded-2xl">
                <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-main block">Alquiler Temporario</strong>
                  <span className="text-muted text-sm">Ideal para nómadas o turismo. Requiere que selecciones fechas exactas de llegada y salida. El precio final se calcula multiplicando el valor por noche por la cantidad de días de tu estadía.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-surface p-4 border border-subtle rounded-2xl">
                <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-main block">Alquiler Residencial</strong>
                  <span className="text-muted text-sm">Pensado para contratos tradicionales a largo plazo. El precio mostrado corresponde al valor mensual base. Solo debes solicitar la reserva para iniciar el trámite formal del primer mes.</span>
                </div>
              </li>
            </ul>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-subtle pb-4">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-primary shadow-sm">
                <CalendarClock size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-main">2. Agendar una Visita Presencial</h2>
            </div>
            
            <p className="text-main/80 leading-relaxed text-lg">
              ¿Viste una propiedad que te enamoró pero querés estar 100% seguro antes de pagar? Todas nuestras publicaciones verificadas te permiten <strong>agendar una visita presencial</strong> directamente desde la página del inmueble. 
              <br/><br/>
              Solo tienes que elegir el día y la hora. El sistema bloqueará ese espacio y notificará al propietario. Puedes gestionar todas tus visitas desde la sección "Mis Alquileres" en tu perfil.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-subtle pb-4">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-primary shadow-sm">
                <CreditCard size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-main">3. Reserva segura con Mercado Pago</h2>
            </div>
            
            <p className="text-main/80 leading-relaxed text-lg">
              Una vez que tomas la decisión, hacer clic en "Solicitar reserva" congelará la propiedad a tu nombre. Inmediatamente serás redirigido a la pasarela segura de <strong>Mercado Pago</strong> para abonar la seña o el primer mes.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-6 rounded-r-2xl mt-4">
              <p className="text-main italic">
                "Si por algún motivo la propiedad no cumple con los estándares de la <strong>Garantía Vesta</strong> al momento del check-in, tu dinero está protegido y se te devuelve de forma automática a tu cuenta."
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-subtle pb-4">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-primary shadow-sm">
                <Key size={24} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-main">4. ¡Mudanza!</h2>
            </div>
            
            <p className="text-main/80 leading-relaxed text-lg">
              Cuando el pago se acredita, la reserva cambia automáticamente a estado <strong>Confirmada</strong>. Recibirás un correo electrónico con el recibo oficial y los datos de contacto directo del anfitrión para coordinar la entrega de llaves.
            </p>
          </section>

          {/* CALL TO ACTION BOTTOM */}
          <div className="mt-16 bg-surface border border-subtle rounded-3xl p-8 md:p-12 text-center shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col items-center">
            <h3 className="text-3xl font-bold text-main mb-4 tracking-tight">¿Listo para encontrar tu lugar?</h3>
            <p className="text-muted mb-8 text-lg max-w-lg">
              Empieza a buscar ahora mismo filtrando por ciudad, fechas o comodidades específicas.
            </p>
            <Link href="/catalog">
              <Button variant="primary" className="rounded-full px-10 py-4 text-lg">
                Explorar Catálogo
              </Button>
            </Link>
          </div>

        </div>
      </article>
    </main>
  );
}