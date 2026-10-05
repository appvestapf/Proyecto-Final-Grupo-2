"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ArrowLeft, Users } from "lucide-react";

const MENU_ITEMS = [
  { 
    name: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/admin/dashboard" 
  },
  { 
    name: "Propiedades", 
    icon: Building2, 
    path: "/admin/properties" 
  },
  { 
    name: "Usuarios", 
    icon: Users, 
    path: "/admin/users" 
  }, 
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white flex flex-col h-full shadow-2xl shrink-0 z-10 transition-colors duration-200">
      {/* Logo / Header del Sidebar */}
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Vesta <span className="text-primary text-sm uppercase tracking-widest px-2 py-1 bg-primary/20 rounded-md">Admin</span>
        </h2>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 space-y-2 mt-8">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 font-semibold" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar (Volver al sitio) */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-sm">Volver al sitio</span>
        </Link>
      </div>
    </aside>
  );
}