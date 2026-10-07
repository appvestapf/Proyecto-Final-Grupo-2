"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PagoExitosoPage() {
  // Estado para manejar la espera simulada
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Simulamos un retraso de 3.5 segundos para dar tiempo al Webhook
    // de actualizar el estado de la reserva en el backend.
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        
        {isVerifying ? (
          // --- ESTADO DE VERIFICACIÓN (Muestra esto primero) ---
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
              Verificando tu pago...
            </h1>
            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-2">
              Estamos confirmando la transacción con Mercado Pago.
            </p>
            <p className="text-xs text-slate-400">
              Por favor, aguardá un momento.
            </p>
          </div>
        ) : (
          // --- ESTADO CONFIRMADO (Aparece luego de 3.5s) ---
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
              ¡Reserva Confirmada!
            </h1>
            
            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
              Hemos registrado tu pago exitosamente. Ya podés ver los detalles y comunicarte con el anfitrión.
            </p>

            <div className="w-full border-t border-slate-100 my-6" />

            <div className="flex flex-col w-full gap-3">
              <Link
                href="/perfil/alquileres"
                className="w-full text-center text-sm font-medium bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                Ir a Mis Alquileres
              </Link>
              
              <Link
                href="/"
                className="w-full text-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}