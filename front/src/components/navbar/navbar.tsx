"use client"; 

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";
import { NavItems } from "@/utils/NavItems"; 
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeToggle } from "@/components/common/ThemeToggle/ThemeToggle";

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
  
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) { 
    return null; 
  }

  const currentRole = mounted ? role : "visitante";

  const allowedItems = NavItems.filter((item) =>
    item.roles.includes(currentRole) &&
    item.nameToRender !== "Inicio"
  );
  
  const isHome = pathname === '/';

  const wrapperStyles = isHome
    ? "absolute top-0 left-0 bg-transparent border-transparent"
    : "relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200";

  const textStyles = isHome 
    ? "text-white hover:text-gray-200" 
    : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400";

  const actionButtonStyles = isHome 
    ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50' 
    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <>
      <header className={`w-full z-50 ${wrapperStyles}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          
          {/* Izquierda: Menú Hamburguesa + Links Desktop */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-all duration-200 focus:outline-none border shadow-sm ${
                isHome 
                  ? 'bg-slate-900/60 backdrop-blur-md border-white/20 text-white hover:bg-slate-900/80' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
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

          {/* Centro: Logo (Responsive) */}
          <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
            <Link href="/">
              <div className={`relative w-11 h-11 sm:w-14 sm:h-14 overflow-hidden rounded-full shadow-md p-1 border transition-all duration-200 ${
                  isHome 
                    ? 'bg-white/15 border-white/20 backdrop-blur-md hover:bg-white/25' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
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

          {/* Derecha: ThemeToggle + Usuario */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <ThemeToggle isHome={isHome} />

            {!mounted ? (
              <div className="h-8 w-20 animate-pulse bg-slate-200/20 rounded-full" />
            ) : currentRole === "visitante" ? (
              <Link 
                href="/auth/login" 
                className={`text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-200 shadow-sm whitespace-nowrap ${actionButtonStyles}`}
              >
                Iniciar Sesión
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded hidden md:inline-block ${
                  isHome ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {currentRole}
                </span>
                
                <div 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center overflow-hidden text-blue-600 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 shadow-sm tracking-wide relative shrink-0"
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
                  onClick={handleLogout}
                  className={`hidden md:inline-block text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${actionButtonStyles}`}
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Menú Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 w-full z-50 ${
            isHome 
              ? 'bg-slate-900/95 backdrop-blur-xl text-white border-slate-800' 
              : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800'
          } border-b px-4 pt-3 pb-5 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200`}>
            
            <nav className="flex flex-col space-y-1">
              {allowedItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.route}
                  className={`text-base font-medium px-3 py-2.5 rounded-xl transition-colors ${
                    isHome 
                      ? 'hover:bg-white/10 text-white' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {item.nameToRender}
                </Link>
              ))}
            </nav>

            {mounted && currentRole !== "visitante" && (
              <div className={`pt-3 border-t ${isHome ? 'border-white/15' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-between px-2`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                    isHome ? 'bg-white/15 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {currentRole}
                  </span>
                  <span className="text-sm font-medium opacity-90 truncate">
                    {user?.name || "Usuario"}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 shrink-0 ${actionButtonStyles}`}
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Backdrop para cerrar el menú al hacer clic afuera */}
      {mobileMenuOpen && (
      <div 
        onClick={() => setMobileMenuOpen(false)} 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200"
      />
      )}
    </>
  );
}