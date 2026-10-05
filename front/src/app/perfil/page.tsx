"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/common/Button/Button";
import Image from "next/image";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

export default function SobreMiPage() {
  const { user, role } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    return fullName.charAt(0).toUpperCase();
  };

  const isProfileComplete = Boolean(user?.address && user?.pfp);

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Header sin botón de editar */}
        <div className="border-b border-subtle pb-6">
          <h2 className="text-3xl font-bold text-main tracking-tight">Sobre mí</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="bg-surface border border-subtle rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 overflow-hidden shadow-inner border-4 border-white dark:border-slate-800 relative">
              {user?.pfp ? (
                <Image src={user.pfp} alt="Avatar" fill sizes="128px" className="object-cover" />
              ) : (
                <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {getInitials(user?.name)}
                </span>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-main tracking-tight">{user?.name || 'Usuario'}</h3>
            <p className="text-muted font-medium mt-1 capitalize">{role}</p>
            {user?.address && (
              <p className="text-sm text-muted mt-3 bg-app px-3 py-1 rounded-full border border-subtle">
                📍 {user.address}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {!isProfileComplete ? (
              <div>
                <h4 className="text-xl font-bold text-main mb-2">Completá tu perfil</h4>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  Tu perfil en Vesta es una parte importante de todas las reservas. Agregá tu foto y dirección para que los dueños te conozcan mejor.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setIsModalOpen(true)}
                  className="text-white rounded-[12px] border-none cursor-pointer"
                >
                  Comenzar
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6 flex flex-col items-start gap-4">
                <div className="flex gap-4">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={28} />
                  <div>
                    <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-1">¡Perfil al 100%!</h4>
                    <p className="text-emerald-600/80 dark:text-emerald-500 text-sm leading-relaxed">
                      Tus datos están completos. Esto genera mayor confianza en los propietarios a la hora de aceptar tus reservas y visitas.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
                >
                  Editar mis datos
                </Button>
              </div>
            )}

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

      {isModalOpen && <EditProfileModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}