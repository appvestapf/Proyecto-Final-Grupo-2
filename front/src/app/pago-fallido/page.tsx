"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function PagoFallidoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        
        {/* Ícono de Alerta */}
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Títulos y Textos */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          No pudimos procesar tu pago
        </h1>
        
        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
          La transacción fue declinada por Mercado Pago. Por favor, verifica los fondos disponibles de tu tarjeta o ingresa a tu perfil para reintentar el pago.
        </p>

        <div className="border-t border-slate-100 my-6" />

        {/* Acciones principales */}
        <div className="flex flex-col gap-3">
          <Link
            href="/perfil/alquileres?status=failure"
            className="w-full text-center text-sm font-medium bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            Ir a Mis Alquileres para reintentar
            <ArrowRight size={16} />
          </Link>
          
          <Link
            href="/"
            className="w-full text-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
          >
            Volver al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}