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
    item.nameToRender !== "Inicio" // Quitamos la restricción del catálogo
  );
  
  const isHome = pathname === '/';

  const wrapperStyles = isHome
    ? "absolute top-0 left-0 bg-transparent border-transparent"
    : "relative bg-white border-b border-slate-200 shadow-sm";

  const textStyles = isHome ? "text-white hover:text-gray-200" : "text-slate-600 hover:text-blue-600";

  return (
    <header className={`w-full z-50 ${wrapperStyles}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
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

        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            <Image 
              src="/logo2.png"  
              alt="Vesta Logo" 
              width={70} 
              height={35} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-end gap-4">
          {!mounted ? (
            // Placeholder de carga mientras hidrata el storage
            <div className="h-9 w-24 animate-pulse bg-slate-200/20 rounded-full" />
          ) : currentRole === "visitante" ? (
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
                {currentRole}
              </span>
              <div 
                className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200 shadow-sm tracking-wide"
                title={user?.name || "Usuario"}
              >
                {currentRole === "admin" ? "A" : getInitials(user?.name)}
              </div>
              <button 
                onClick={logout}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${isHome ? 'border-white/30 text-white hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}