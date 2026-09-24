// "use client";

// import { useState } from "react";
// import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// // TODO: Reemplazar con la clave pública provista por el backend en el archivo .env
// initMercadoPago("TEST-YOUR-PUBLIC-KEY-HERE");

// interface PaymentButtonProps {
//   propertyId: string;
//   price: number;
// }

// export default function PaymentButton({ propertyId, price }: PaymentButtonProps) {
//   const [preferenceId, setPreferenceId] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleCheckout = async () => {
//     setIsLoading(true);

//     try {
//       // ====================================================================
//       // 🚀 ZONA DE MOCK (EL BACKEND REEMPLAZARÁ ESTO CON EL FETCH REAL)
//       // ====================================================================
//       console.log(`[MOCK] Solicitando preferencia para ID: ${propertyId} por $${price}`);
      
//       // Simulamos la latencia de red idéntica a la carga del proyecto
//       await new Promise((resolve) => setTimeout(resolve, 1500)); 
//       const mockPreferenceId = "123456789-mock-preference-id"; 
      
//       /*
//       // Código futuro del Backend:
//       const response = await fetch("http://localhost:4000/payments/create-preference", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ propertyId, price }),
//       });
//       const data = await response.json();
//       const mockPreferenceId = data.id;
//       */
//       // ====================================================================

//       setPreferenceId(mockPreferenceId);
//     } catch (error) {
//       console.error("Error al generar la preferencia de pago:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       {!preferenceId ? (
//         <button
//           onClick={handleCheckout}
//           disabled={isLoading}
//           className="w-full text-center text-sm font-medium bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
//         >
//           {isLoading ? (
//             <span className="flex items-center justify-center gap-2">
//               {/* Spinner sutil de carga */}
//               <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//               </svg>
//               Procesando...
//             </span>
//           ) : (
//             `Pagar de Forma Segura`
//           )}
//         </button>
//       ) : (
//         /* Componente nativo del SDK que hereda la billetera de Mercado Pago */
//         <div className="w-full animation-fade-in">
//           <Wallet 
//             initialization={{ preferenceId: preferenceId }} 
//           />
//         </div>
//       )}
//     </div>
//   );
// }







// _________________________________________
// _________________________________________
// _________________________________________





// "use client";

// import { useState } from "react";

// interface PaymentButtonProps {
//   reservationId: string; // El único ID que el backend necesita para procesar o reintentar el pago
//   price: number;         // Para mostrar el monto en el texto del botón
//   className?: string;    // Por si quieres pasarle estilos extra desde afuera
// }

// export default function PaymentButton({ reservationId, price, className = "" }: PaymentButtonProps) {
//   const [isLoading, setIsLoading] = useState(false);

//   const handleCheckout = async () => {
//     setIsLoading(true);

//     try {
//       // 🚀 LLAMADO REAL AL BACKEND QUE ENCENDIMOS CON TS-NODE
//       const response = await fetch(`http://localhost:3001/payments/${reservationId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!response.ok) {
//         throw new Error("Error en la respuesta del servidor de pagos");
//       }

//       const data = await response.json();

//       // 💳 REDIRECCIÓN AL CHECKOUT PRO DE MERCADO PAGO
//       // El backend genera la preferencia y nos devuelve la URL en 'init_point'
//       if (data.init_point) {
//         window.location.href = data.init_point;
//       } else if (data.url) {
//         // Por si tus compañeros nombraron el campo como 'url' en vez de 'init_point'
//         window.location.href = data.url;
//       } else {
//         console.error("El backend no devolvió ninguna URL de redirección:", data);
//         alert("Hubo un problema al generar el enlace de Mercado Pago.");
//       }

//     } catch (error) {
//       console.error("Error al procesar el pago con Mercado Pago:", error);
//       alert("No se pudo conectar con la pasarela de pagos. Inténtalo de nuevo.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleCheckout}
//       disabled={isLoading}
//       className={`w-full text-center text-sm font-semibold bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed ${className}`}
//     >
//       {isLoading ? (
//         <span className="flex items-center justify-center gap-2">
//           {/* Spinner de carga animado */}
//           <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//           </svg>
//           Abriendo Mercado Pago...
//         </span>
//       ) : (
//         `Pagar de Forma Segura`
//       )}
//     </button>
//   );
// }


// _________________________________________
// _________________________________________
// _________________________________________






// _________________________________________

// CODIGO MOKEADO:
// _________________________________________


"use client";

import { useState } from "react";

interface PaymentButtonProps {
  reservationId: string; // ID de la reserva que se va a pagar o reintentar
  price: number;         // Monto a mostrar en el botón
  className?: string;    // Estilos personalizados opcionales
}

export default function PaymentButton({ reservationId, price, className = "" }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // ====================================================================
      // 🚀 ZONA DE MOCK SEGURO (SIMULACIÓN TOTAL)
      // ====================================================================
      console.log(`[MOCK] Iniciando pago para la reserva ID: ${reservationId}`);
      console.log(`[MOCK] Monto a procesar: $${price}`);

      // Simulamos 1.5 segundos de espera de red para ver la animación de carga
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulamos la URL que nos devolvería Mercado Pago
      // En el futuro esto será data.init_point
      const mockInitPoint = "https://google.com"; 

      console.log(`[MOCK] Redirigiendo exitosamente a: ${mockInitPoint}`);
      window.location.href = mockInitPoint;
      // ====================================================================

      /*
      // 📋 CÓDIGO REAL COMPLETO (COMENTADO PARA QUE NADA SE ROMPA)
      const response = await fetch(`http://localhost:3001/payments/${reservationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Error en el servidor de pagos");
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
      */

    } catch (error) {
      console.error("Error simulado en el proceso de pago:", error);
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
          Conectando con Mercado Pago...
        </span>
      ) : (
        `Pagar de Forma Segura`
      )}
    </button>
  );
}





