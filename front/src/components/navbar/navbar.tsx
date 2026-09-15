"use client"; // Le indica a Next.js que este componente tiene interactividad

import Link from "next/link";
import { NavItems } from "@/utils/NavItems"; 

export default function Navbar() {
  // 1. Simulación del usuario actual (Historias de usuario)
  // Cambia este valor para probar cómo se transforma la Navbar:
  // "visitante" -> Ve Inicio y Explorar. Botones de Login/Registro.
  // "inquilino" -> Ve Inicio, Explorar, Favoritos y Mis Alquileres. Perfil.
  // "admin"     -> Ve Inicio, Explorar y Panel de Gestión. Perfil.
  const currentUserRole: "visitante" | "inquilino" | "admin" = "visitante";

  // 2. Aplicamos el Renderizado Condicional mediante .filter()
  const allowedItems = NavItems.filter((item) =>
    item.roles.includes(currentUserRole)
  );

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO DE VESTA */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-2xl text-blue-600 tracking-tight">
            Vesta<span className="text-slate-400 font-normal">.</span>
          </Link>
        </div>

        {/* ENLACES DINÁMICOS (Filtrados por Rol) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {allowedItems.map((item) => (
            <Link
              key={item.id}
              href={item.route}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {item.nameToRender}
            </Link>
          ))}
        </nav>

        {/* EXTREMO DERECHO: Botones de Acción Condicionales */}
        <div className="flex items-center gap-4">
          {currentUserRole === "visitante" ? (
            <>
              {/* Si es visitante, ve botones para registrarse (Historia de Usuario) */}
              <button className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                Iniciar Sesión
              </button>
              <button className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Registrarse
              </button>
            </>
          ) : (
            <>
              {/* Si está registrado (inquilino o admin), ve su perfil / cerrar sesión */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {currentUserRole}
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
                  {currentUserRole === "admin" ? "A" : "U"}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
