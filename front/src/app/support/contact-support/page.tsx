"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { toast } from 'sonner';

export default function ContactSupportPage() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitAction = (formData: FormData) => {
    // Extraemos los valores de manera nativa usando la API FormData
    const name = formData.get("name");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    // startTransition envuelve la lógica asíncrona y activa 'isPending' automáticamente
    startTransition(async () => {
      try {
        // Simulación de envío a la API que conectará con Nodemailer
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setIsSuccess(true);
        toast.success("Mensaje enviado con éxito");
      } catch (error) {
        toast.error("Hubo un error al enviar el mensaje. Intente nuevamente.");
      }
    });
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-subtle p-8 rounded-3xl text-center shadow-lg space-y-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-2xl font-bold text-main">¡Mensaje Enviado!</h1>
          <p className="text-muted text-sm leading-relaxed">
            Hemos recibido tu solicitud de asistencia. Nuestro equipo de soporte te responderá vía correo electrónico en un plazo máximo de 48 horas hábiles.
          </p>
          <Link href="/support" passHref>
            <Button variant="primary" className="w-full rounded-full py-3">
              Volver a Ayuda
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        
        <Link href="/support" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a Ayuda
        </Link>

        <div className="bg-surface border border-subtle p-8 rounded-3xl shadow-sm">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-main tracking-tight">Formulario de Contacto</h1>
            <p className="text-sm text-muted mt-2">Especificá tu consulta para que podamos ayudarte lo más rápido posible.</p>
          </header>

          <form action={handleSubmitAction} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-main mb-2">Nombre completo</label>
              <input 
                type="text" 
                id="name" 
                name="name"
                required
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-3 rounded-xl bg-app border border-subtle text-main focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-main mb-2">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                required
                placeholder="juan.perez@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl bg-app border border-subtle text-main focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-main mb-2">Motivo de la consulta</label>
              <select 
                id="subject" 
                name="subject"
                defaultValue="Soporte Técnico"
                className="w-full px-4 py-3 rounded-xl bg-app border border-subtle text-main focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm appearance-none cursor-pointer"
              >
                <option value="Soporte Técnico">Problemas Técnico / Bugs</option>
                <option value="Pagos y Señas">Inconvenientes con Pagos</option>
                <option value="Inmobiliarias">Consultas sobre Inmobiliarias o Propietarios</option>
                <option value="Otros">Otro motivo</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-main mb-2">Mensaje o descripción</label>
              <textarea 
                id="message" 
                name="message"
                required
                minLength={10}
                rows={5}
                placeholder="Escribí detalladamente tu problema o consulta..."
                className="w-full px-4 py-3 rounded-xl bg-app border border-subtle text-main focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={isPending}
              className="w-full rounded-full py-3 flex items-center justify-center gap-2"
            >
              {isPending ? 'Enviando...' : 'Enviar Mensaje'}
              <Send size={16} />
            </Button>
          </form>
        </div>

      </div>
    </main>
  );
}
