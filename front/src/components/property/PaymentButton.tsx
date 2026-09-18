"use client";

import { useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// TODO: Reemplazar con la clave pública provista por el backend en el archivo .env
initMercadoPago("TEST-YOUR-PUBLIC-KEY-HERE");

interface PaymentButtonProps {
  propertyId: string;
  price: number;
}

export default function PaymentButton({ propertyId, price }: PaymentButtonProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // ====================================================================
      // 🚀 ZONA DE MOCK (EL BACKEND REEMPLAZARÁ ESTO CON EL FETCH REAL)
      // ====================================================================
      console.log(`[MOCK] Solicitando preferencia para ID: ${propertyId} por $${price}`);
      
      // Simulamos la latencia de red idéntica a la carga del proyecto
      await new Promise((resolve) => setTimeout(resolve, 1500)); 
      const mockPreferenceId = "123456789-mock-preference-id"; 
      
      /*
      // Código futuro del Backend:
      const response = await fetch("http://localhost:4000/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, price }),
      });
      const data = await response.json();
      const mockPreferenceId = data.id;
      */
      // ====================================================================

      setPreferenceId(mockPreferenceId);
    } catch (error) {
      console.error("Error al generar la preferencia de pago:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!preferenceId ? (
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full text-center text-sm font-medium bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              {/* Spinner sutil de carga */}
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </span>
          ) : (
            `Reintentar Pago — $${price.toLocaleString("es-AR")}`
          )}
        </button>
      ) : (
        /* Componente nativo del SDK que hereda la billetera de Mercado Pago */
        <div className="w-full animation-fade-in">
          <Wallet 
            initialization={{ preferenceId: preferenceId }} 
          />
        </div>
      )}
    </div>
  );
}
