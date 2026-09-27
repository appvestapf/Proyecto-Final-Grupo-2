"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Key, Heart } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const TABS = [
    { name: "Sobre mí", path: "/perfil", icon: User, exact: true },
    { name: "Mis alquileres", path: "/perfil/alquileres", icon: Key, exact: false },
    { name: "Mis favoritos", path: "/perfil/favoritos", icon: Heart, exact: false },
  ];

  return (
    <div className="min-h-screen bg-app transition-colors duration-200 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* SIDEBAR IZQUIERDA */}
        <aside className="w-full md:w-64 shrink-0">
          <h1 className="text-3xl font-bold text-main mb-6 tracking-tight">Perfil</h1>
          
          <nav className="flex flex-col space-y-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.exact ? pathname === tab.path : pathname.startsWith(tab.path);
              
              return (
                <Link
                  key={tab.name}
                  href={tab.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-surface border border-subtle shadow-sm text-main' 
                      : 'text-muted hover:bg-surface/50 hover:text-main border border-transparent'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-muted'} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* CONTENIDO DERECHO (Renderiza las sub-páginas aquí) */}
        <div className="flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}