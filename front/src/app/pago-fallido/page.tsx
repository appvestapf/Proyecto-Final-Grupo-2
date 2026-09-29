"use client";

import Link from "next/link";

export default function PagoFallidoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-app px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-subtle bg-surface rounded-xl p-8 shadow-sm text-center">
        
        {/* Ícono de Alerta */}
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-900 shadow-xs">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Títulos y Textos */}
        <h1 className="text-2xl font-bold text-main tracking-tight mb-3">
          No pudimos procesar tu pago
        </h1>
        
        <p className="text-sm font-medium text-muted leading-relaxed mb-6">
          La transacción fue declinada por Mercado Pago. Por favor, verifica los fondos disponibles de tu tarjeta o ingresa a tu perfil para reintentar el pago.
        </p>

        <div className="border-t border-subtle my-6" />

        {/* Acciones principales */}
        <div className="flex flex-col items-center gap-3 w-full">
          
          {/* REINTENTAR: Lo mandamos al panel de usuario */}
          <Link href="/perfil/alquileres" className="w-full">
            <button className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
              Ir a Mis Alquileres para reintentar
            </button>
          </Link>
          
          <Link
            href="/"
            className="w-full text-center text-sm font-medium text-muted hover:text-primary transition-colors duration-200 py-2 mt-1"
          >
            Regresar al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}