"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/common/Button/Button";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function SobreMiPage() {
  const { user, role } = useAuthStore();

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    return fullName.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex items-center justify-between border-b border-subtle pb-6">
        <h2 className="text-3xl font-bold text-main tracking-tight">Sobre mí</h2>
        <Button variant="outline" className="rounded-full shadow-sm text-xs py-1.5 px-4 h-auto">
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* TARJETA PRINCIPAL (Izquierda) */}
        <div className="bg-surface border border-subtle rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 overflow-hidden shadow-inner border-4 border-white dark:border-slate-800">
            {user?.pfp ? (
              <Image src={user.pfp} alt="Avatar" width={128} height={128} className="object-cover w-full h-full" />
            ) : (
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {getInitials(user?.name)}
              </span>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-main tracking-tight">{user?.name || 'Usuario'}</h3>
          <p className="text-muted font-medium mt-1 capitalize">{role}</p>
        </div>

        {/* TARJETA INFORMATIVA (Derecha) */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-main mb-2">Completá tu perfil</h4>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Tu perfil en Vesta es una parte importante de todas las reservas. Completá el tuyo para que los dueños y anfitriones te conozcan mejor.
            </p>
            <Button variant="primary" className="hover:bg-rose-700 text-white rounded-[12px] border-none">
              Comenzar
            </Button>
          </div>

          <hr className="border-t border-subtle" />

          <div className="flex items-start gap-4">
            <ShieldCheck className="text-muted mt-0.5" size={24} />
            <div>
              <h5 className="font-semibold text-main text-sm">Identidad verificada</h5>
              <p className="text-xs text-muted mt-1">Al mostrar que eres un inquilino real, ayudas a mantener segura la comunidad de Vesta.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}