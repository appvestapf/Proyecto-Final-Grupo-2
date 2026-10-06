"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ArrowLeft, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

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
  const { role } = useAuthStore(); 

  return (
    // CAMBIAMOS w-64 por w-56 para darle más espacio a la tabla
    <aside className="w-56 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 text-white flex flex-col h-full shadow-2xl shrink-0 z-10 transition-colors duration-200">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Vesta <span className="text-primary text-[10px] uppercase tracking-widest px-2 py-1 bg-primary/20 rounded-md">Admin</span>
        </h2>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 mt-6">
        {MENU_ITEMS.map((item) => {
          if (item.name === "Usuarios" && role !== "superadmin") {
            return null;
          }

          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 font-semibold" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Salir al sitio</span>
        </Link>
      </div>
    </aside>
  );
}