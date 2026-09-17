"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, Users, CalendarDays, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore'; // Asumo que usas tu store

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout); // Traemos la acción del store

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR LATERAL FIJO */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <Link href="/" className="font-bold text-2xl text-blue-600 tracking-tight">
            Vesta<span className="text-slate-400 font-normal">.</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Resumen" href="/admin/dashboard" active={pathname === '/admin/dashboard'} />
          <SidebarItem icon={Home} label="Mis Propiedades" href="/admin/properties" active={pathname.includes('/properties')} />
          <SidebarItem icon={CalendarDays} label="Reservas y Citas" href="/admin/reservations" active={pathname.includes('/reservations')} />
          {/* Solo visible para Super Admin (ejemplo visual) */}
<SidebarItem icon={Users} label="Inquilinos" href="/admin/users" active={pathname.includes('/users')} />
</nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-200">
          <SidebarItem icon={Settings} label="Configuración" href="/admin/settings" active={pathname === '/admin/settings'} />
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50 mt-2 cursor-pointer"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DINÁMICA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Topbar (Para móvil o acciones rápidas) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-6 shrink-0">
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-700">Panel de Control</span>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                A
             </div>
          </div>
        </header>

        {/* Contenido (Aquí se inyecta page.tsx) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
      
    </div>
  );
}