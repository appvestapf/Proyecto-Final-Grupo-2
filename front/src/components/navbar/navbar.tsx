"use client"; 

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { NavItems } from "@/utils/NavItems"; 
import { useAuthStore } from "@/store/useAuthStore";

// Helper para obtener las iniciales del nombre y apellido (Ej: "Juan Pérez" -> "JP")
const getInitials = (fullName?: string) => {
  if (!fullName) return "U";
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return fullName.charAt(0).toUpperCase();
};

export default function Navbar() {
  const pathname = usePathname(); 
  
  // Estados de Zustand
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Evitamos problemas de hidratación con Zustand persist
  const [mounted, setMounted] = useState(false);
  // Estado para controlar la apertura del menú móvil
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si estamos en el panel de admin, no renderizamos este Navbar
  if (pathname.startsWith('/admin')) { 
    return null; 
  }

  // Si aún no se montó en el cliente, renderizamos una versión neutra para evitar parpadeos
  const currentRole = mounted ? role : "visitante";

  const allowedItems = NavItems.filter((item) =>
    item.roles.includes(currentRole) &&
    item.nameToRender !== "Inicio"
  );
  
  const isHome = pathname === '/';

  const wrapperStyles = isHome
    ? "absolute top-0 left-0 bg-transparent border-transparent"
    : "relative bg-white border-b border-slate-200 shadow-sm";

  const textStyles = isHome ? "text-white hover:text-gray-200" : "text-slate-600 hover:text-blue-600";

  return (
    <header className={`w-full z-50 ${wrapperStyles}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Izquierda: Menú Hamburguesa (Móvil) + Links de Navegación (Escritorio) */}
        <div className="flex-1 flex items-center">
          
          {/* Botón de Menú Hamburguesa para Móviles optimizado con Glassmorphism seguro */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-xl transition-all duration-200 focus:outline-none border shadow-sm ${
              isHome 
                ? 'bg-slate-900/60 backdrop-blur-md border-white/20 text-white hover:bg-slate-900/80' 
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
            }`}
            aria-label="Abrir menú principal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Navegación para Escritorio */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
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

        {/* Centro: Logo (Absoluto) con estilos dinámicos según el fondo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <div className={`relative w-16 h-16 overflow-hidden rounded-full shadow-md p-1.5 border transition-all duration-200 ${
                isHome 
                  ? 'bg-white/15 border-white/20 backdrop-blur-md' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}>
              <Image 
                src="/logo2.png"  
                alt="Vesta Logo" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Derecha: Acciones de Usuario (Visible siempre en móvil y escritorio) */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          {!mounted ? (
            // Placeholder de carga mientras hidrata el storage
            <div className="h-9 w-24 animate-pulse bg-slate-200/20 rounded-full" />
          ) : currentRole === "visitante" ? (
            <Link 
              href="/auth/login" 
              className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors shadow-sm ${
                isHome 
                  ? 'border-white/30 text-white hover:bg-white/10' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded hidden sm:inline-block ${isHome ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {currentRole}
              </span>
              
              {/* Contenedor del Avatar */}
              <div 
                className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden text-blue-600 font-bold text-xs border border-blue-200 shadow-sm tracking-wide relative"
                title={user?.name || "Usuario"}
              >
                {currentRole === "admin" ? (
                  "A"
                ) : user?.pfp ? (
                  <Image 
                    src={user.pfp} 
                    alt={user.name || "Avatar"} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>

              <button 
                onClick={logout}
                className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors ${isHome ? 'border-white/30 text-white hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Menú Desplegable para Móviles (Limpio, exclusivo para navegación) */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${isHome ? 'bg-slate-900/90 backdrop-blur-xl text-white border-slate-800' : 'bg-white text-slate-800 border-slate-200'} border-b px-4 pt-3 pb-5 space-y-3 shadow-2xl transition-all duration-300 ease-in-out`}>
          <nav className="flex flex-col space-y-2">
            {allowedItems.map((item) => (
              <Link
                key={item.id}
                href={item.route}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium px-3 py-2.5 rounded-xl transition-colors ${
                  isHome ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {item.nameToRender}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}