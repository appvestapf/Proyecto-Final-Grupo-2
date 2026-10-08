"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

function PagoExitosoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isVerifying, setIsVerifying] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVerifying || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerifying, countdown]);

  useEffect(() => {
    if (!isVerifying && countdown === 0) {
      router.push("/perfil/alquileres?status=approved");
    }
  }, [isVerifying, countdown, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-app px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-xl border border-subtle bg-surface p-8 text-center shadow-sm">
        {isVerifying ? (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-xs">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-main">
              Verificando tu pago...
            </h1>
            <p className="mb-2 text-sm font-medium leading-relaxed text-muted">
              Estamos confirmando la transacción con Mercado Pago.
            </p>
            <p className="text-xs text-muted">
              Por favor, aguardá un momento.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10 text-secondary shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="mb-3 text-2xl font-bold tracking-tight text-main">
              ¡Reserva Confirmada!
            </h1>

            <p className="mb-4 text-sm font-medium leading-relaxed text-muted">
              Tu pago ha sido registrado de forma segura. La propiedad ha quedado reservada.
            </p>

            {paymentId && (
              <div className="mb-4 w-full rounded-lg border border-subtle bg-app p-3 font-mono text-xs text-muted">
                Comprobante MP: #{paymentId}
              </div>
            )}

            <p className="mb-6 text-xs text-muted">
              Redirigiendo a tus alquileres en{" "}
              <span className="font-bold text-main">{countdown}</span> segundos...
            </p>

            <div className="my-4 w-full border-t border-subtle" />

            <div className="flex w-full flex-col gap-3">
              <Link
                href="/perfil/alquileres?status=approved"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary/90"
              >
                Ir a Mis Alquileres
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/"
                className="w-full py-2 text-center text-sm font-medium text-muted transition-colors duration-200 hover:text-primary"
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

export default function PagoExitosoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-app">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PagoExitosoContent />
    </Suspense>
  );
}