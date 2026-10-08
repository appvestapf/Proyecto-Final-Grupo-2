"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function PagoExitosoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado de verificación simulada
  const [isVerifying, setIsVerifying] = useState(true);
  // Contador de redirección
  const [countdown, setCountdown] = useState(5);

  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");

  // Simulación de espera para el webhook
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Temporizador para redirección (comienza a restar solo cuando termina la verificación)
  useEffect(() => {
    if (isVerifying || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerifying, countdown]);

  // Redirección automática
  useEffect(() => {
    if (!isVerifying && countdown === 0) {
      router.push("/perfil/alquileres?status=approved");
    }
  }, [isVerifying, countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        {isVerifying ? (
          /* --- ESTADO DE VERIFICACIÓN --- */
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
          /* --- ESTADO CONFIRMADO --- */
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
              ¡Reserva Confirmada!
            </h1>

            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
              Tu pago ha sido registrado de forma segura. La propiedad ha quedado reservada.
            </p>

            {paymentId && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-4 text-xs text-slate-500 font-mono w-full">
                Comprobante MP: #{paymentId}
              </div>
            )}

            <p className="text-xs text-slate-400 mb-6">
              Redirigiendo a tus alquileres en <span className="font-bold text-slate-700">{countdown}</span> segundos...
            </p>

            <div className="w-full border-t border-slate-100 my-4" />

            <div className="flex flex-col w-full gap-3">
              <Link
                href="/perfil/alquileres?status=approved"
                className="w-full text-center text-sm font-medium bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                Ir a Mis Alquileres
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
        )}
      </div>
    </div>
  );
}