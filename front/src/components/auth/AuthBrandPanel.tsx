import React from 'react';
import Image from 'next/image';

interface AuthBrandPanelProps {
  title: string;
  description: string;
}

export const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({ title, description }) => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-primary to-blue-900 text-white overflow-hidden">
      {/* Efectos de luz difuminada (Glow effects) de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Top logo o marca (Optimizado a un solo div contenedor y más grande) */}
      <div className="relative z-10">
        <div className="relative w-20 h-20 overflow-hidden rounded-full shadow-lg bg-white/15 p-1 border border-white/20">
          <Image 
            src="/logo2.png"  
            alt="Vesta Logo" 
            fill
            className="object-cover" 
            priority
          />
        </div>
      </div>

      {/* Contenido principal con beneficios */}
      <div className="relative z-10 my-auto max-w-lg space-y-6">
        <div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            {description}
          </p>
        </div>

        {/* Lista de beneficios minimalistas */}
        <div className="pt-4 space-y-3.5 border-t border-white/15">
          <div className="flex items-center gap-3 text-sm text-blue-50">
            <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Propiedades verificadas y exclusivas en la región</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-blue-50">
            <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Agenda de citas directas sin intermediarios complejos</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-blue-50">
            <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Gestión y seguimiento de reservas en tiempo real</span>
          </div>
        </div>
      </div>

      {/* Footer inferior */}
      <div className="relative z-10 text-xs text-blue-200/70">
        © 2026 Vesta PropTech. Todos los derechos reservados.
      </div>
    </div>
  );
};