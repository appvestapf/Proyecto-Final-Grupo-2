"use client"; 

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import { NavItems } from "@/utils/NavItems"; 

export default function Navbar() {
  const pathname = usePathname(); 

  // Si estamos en el panel de admin, no renderizamos este Navbar (Lógica original)
  if (pathname.startsWith('/admin')) { 
    return null; 
  }

  // 1. Simulación del usuario actual (Lógica original)
  const currentUserRole: "visitante" | "inquilino" | "admin" = "visitante";

  // 2. Aplicamos el Renderizado Condicional mediante .filter()
  // Ocultamos "Inicio" y "Explorar" para mantener el diseño limpio.
  const allowedItems = NavItems.filter((item) =>
    item.roles.includes(currentUserRole) &&
    item.nameToRender !== "Inicio" &&
    item.nameToRender !== "Explorar Propiedades"
  );

  // IDENTIFICAR LA PÁGINA ACTUAL
  const isHome = pathname === '/';

  // LÓGICA DE POSICIONAMIENTO Y COLORES
  // Si es Home: 'absolute' (flota sobre la foto, pero se va al hacer scroll) + transparente
  // Si NO es Home: 'relative' (ocupa espacio y NO solapa el Login) + fondo blanco
  const wrapperStyles = isHome
    ? "absolute top-0 left-0 bg-transparent border-transparent"
    : "relative bg-white border-b border-slate-200 shadow-sm";

  // Textos blancos en el home, oscuros en las demás páginas
  const textStyles = isHome ? "text-white hover:text-gray-200" : "text-slate-600 hover:text-blue-600";

  return (
    <header className={`w-full z-50 ${wrapperStyles}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* EXTREMO IZQUIERDO: Enlaces Dinámicos */}
        <div className="flex-1 hidden md:flex items-center">
          <nav className="flex items-center gap-6 text-sm font-medium">
            {allowedItems.map((item) => (
              <Link
                key={item.id}
                href={item.route}
                className={`transition-colors duration-200 ${textStyles}`}
              >
                {item.nameToRender}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTRO: LOGO DE VESTA EN PNG */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <Image 
              src="/logo.png"  
              alt="Vesta Logo" 
              width={70} 
              height={35} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* EXTREMO DERECHO: Lógica original de los botones, con estilos adaptados */}
        <div className="flex-1 flex items-center justify-end gap-4">
          {currentUserRole === "visitante" ? (
            <>
              <Link 
                href="/auth/login" 
                className={`text-sm font-medium transition-colors ${textStyles}`}
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/auth/register" 
                className={`text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm ${isHome ? 'border border-white/20' : ''}`}
              >
                Registrarse
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${isHome ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {currentUserRole}
              </span>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200 shadow-sm">
                {currentUserRole === "admin" ? "A" : "U"}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}