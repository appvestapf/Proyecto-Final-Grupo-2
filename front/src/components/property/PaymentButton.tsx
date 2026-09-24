"use client";

import { useState } from "react";
import { toast } from "sonner";

interface PaymentButtonProps {
  reservationId: string;
  price?: number;
  className?: string;
}

export default function PaymentButton({ reservationId, price, className = "" }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const response = await fetch(`${API_URL}/payments/${reservationId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });

      if (!response.ok) {
        throw new Error("Error al generar la orden de pago");
      }

      const data = await response.json();

      // El backend devuelve 'paymentUrl' según tu payment.service.ts
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error("El servidor no devolvió una URL válida.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("No se pudo conectar con Mercado Pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full text-center text-sm font-semibold bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Conectando a Mercado Pago...
        </span>
      ) : (
        price ? `Reintentar Pago — US$ ${price}` : `Pagar de Forma Segura`
      )}
    </button>
  );
}