"use client";

import Link from "next/link";
import PaymentButton from "@/components/property/PaymentButton";

export default function PagoFallidoPage() {
  // Simulamos datos temporales para el reintento.
  // En producción, estos datos se pueden recuperar de los parámetros de la URL.
  const mockPropertyId = "reintento-propiedad-123";
  const mockPrice = 150000; 

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        
        {/* Ícono de Alerta */}
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-100 shadow-xs">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Títulos y Textos */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          No pudimos procesar tu pago
        </h1>
        
        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
          La transacción de la seña fue declinada. Por favor, verifica los fondos disponibles de tu tarjeta o presiona el botón de abajo para reintentar el proceso de reserva.
        </p>

        {/* Separador estético sutil */}
        <div className="border-t border-slate-100 my-6" />

        {/* Acciones principales */}
        <div className="flex flex-col items-center gap-3 w-full">
          
          {/* REINTENTAR: Invoca directamente el flujo dinámico de Mercado Pago */}
          <div className="w-full">
            <PaymentButton propertyId={mockPropertyId} price={mockPrice} />
          </div>
          
          <Link
            href="/"
            className="w-full text-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2 mt-1"
          >
            Regresar al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
