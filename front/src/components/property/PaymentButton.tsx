"use client";

import { useEffect } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

interface PaymentButtonProps {
  preferenceId: string;
}

export default function PaymentButton({ preferenceId }: PaymentButtonProps) {
  useEffect(() => {
    // Se ejecuta una sola vez de forma silenciosa, sin forzar re-renderizados
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "es-AR" });
    } else {
      console.error("Falta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en .env");
    }
  }, []);

  return (
    <div className="w-full animation-fade-in min-h-[50px] flex items-center justify-center">
      {preferenceId ? (
        <Wallet initialization={{ preferenceId }} />
      ) : (
        <span className="text-sm text-slate-500">Cargando pasarela segura...</span>
      )}
    </div>
  );
}