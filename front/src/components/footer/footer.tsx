import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, HelpCircle, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-subtle mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CONTENIDO PRINCIPAL DEL FOOTER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Isotipo Vesta y Eslogan */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="group" title="Ir al inicio">
              <div className="relative w-13 h-13 sm:w-14 sm:h-14 overflow-hidden rounded-full shadow-md p-0.5 border border-subtle bg-app group-hover:scale-105 transition-transform duration-200">
                <Image 
                  src="/logo2.png" 
                  alt="Vesta Logo" 
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <p className="text-xs text-muted">
              Tu próximo hogar por días o por años.
            </p>
          </div>

          {/* Enlaces Rápidos Informativos */}
          <nav aria-label="Enlaces de pie de página" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <Link 
              href="/terms" 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <FileText size={15} className="shrink-0" />
              <span>Términos de Servicio</span>
            </Link>

            <Link 
              href="/privacy" 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <ShieldCheck size={15} className="shrink-0" />
              <span>Política de Privacidad</span>
            </Link>

            <Link 
              href="/support" 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <HelpCircle size={15} className="shrink-0" />
              <span>Soporte</span>
            </Link>
          </nav>
          
        </div>

        {/* LÍNEA DIVISORIA Y COPYRIGHT */}
        <div className="mt-8 pt-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Vesta Inc. Alquileres verificados en Latinoamérica.
          </p>
          
          <p className="font-medium flex items-center gap-1 text-main">
            Proyecto Final <span className="text-muted">•</span> Grupo 2
          </p>
        </div>

      </div>
    </footer>
  );
}