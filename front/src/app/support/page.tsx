"use client";

import React, { useState } from 'react';
import { Home, CreditCard, CalendarClock, ShieldCheck, Mail, ChevronDown } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';

const CATEGORIES = [
  { icon: Home, title: "Reservas y Estadías", desc: "Todo sobre temporarios y residenciales." },
  { icon: CreditCard, title: "Pagos y Reembolsos", desc: "Mercado Pago, señas y garantías." },
  { icon: CalendarClock, title: "Visitas Presenciales", desc: "Cómo agendar o reprogramar citas." },
  { icon: ShieldCheck, title: "Confianza y Seguridad", desc: "Reglas de la comunidad y verificación." },
];

const FAQS = [
  { q: "¿Cómo funciona el pago de la seña?", a: "Al solicitar una reserva, abonarás el total de la seña a través de Mercado Pago. Si el anfitrión rechaza la solicitud, el dinero se devuelve automáticamente a tu cuenta." },
  { q: "¿Cuál es la diferencia entre Temporario y Residencial?", a: "Los temporarios requieren elegir fecha de inicio y fin, calculando el precio por noche. Los residenciales asumen contratos largos y muestran el valor mensual base." },
  { q: "¿Puedo cancelar una visita presencial?", a: "Sí, desde tu panel en 'Mis Alquileres' > 'Visitas Presenciales' puedes cancelar o reprogramar tu cita hasta 24hs antes." },
];

export default function AyudaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-app transition-colors duration-200">
      
      {/* HERO SECTION CON IMAGEN DE FONDO */}
      <section className="relative pt-32 pb-28 px-4 text-center">
        {/* Imagen base */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop')" }} 
        />
        {/* Overlay oscuro para asegurar contraste */}
        <div className="absolute inset-0 bg-slate-900/65" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            ¿En qué podemos ayudarte?
          </h1>
          
        </div>
      </section>

      {/* CATEGORÍAS (Bento Grid) superpuestas a la imagen */}
      <section className="max-w-5xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button 
                key={idx} 
                className="bg-surface border border-subtle p-6 rounded-3xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-left flex flex-col items-start gap-4 cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-primary">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-main mb-1">{cat.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-main mb-8 text-center">Preguntas Frecuentes</h2>
        
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm transition-colors">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center cursor-pointer hover:bg-app transition-colors"
              >
                <span className="font-semibold text-main">{faq.q}</span>
                <ChevronDown className={`text-muted transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} size={20} />
              </button>
              
              <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-muted text-sm leading-relaxed border-t border-subtle pt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-surface border-t border-subtle py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-muted shadow-sm">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-main mb-4">¿No encontraste lo que buscabas?</h2>
          <p className="text-muted mb-8">Nuestro equipo de soporte está disponible para ayudarte con cualquier problema o duda sobre tus alquileres y propiedades.</p>
          <Button variant="primary" className="rounded-full px-8 py-3">
            Contactar a Soporte
          </Button>
        </div>
      </section>

    </main>
  );
}