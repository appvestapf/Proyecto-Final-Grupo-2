"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function PagoFallidoPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-app px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-xl border border-subtle bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent shadow-xs">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-main">
          No pudimos procesar tu pago
        </h1>

        <p className="mb-6 text-sm font-medium leading-relaxed text-muted">
          La transacción fue declinada por Mercado Pago. Por favor, verifica los fondos disponibles de tu tarjeta o ingresa a tu perfil para reintentar el pago.
        </p>

        <div className="my-6 border-t border-subtle" />

        <div className="flex flex-col gap-3">
          <Link
            href="/perfil/alquileres?status=failure"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-primary/90"
          >
            Ir a Mis Alquileres para reintentar
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
    </div>
  );
}
