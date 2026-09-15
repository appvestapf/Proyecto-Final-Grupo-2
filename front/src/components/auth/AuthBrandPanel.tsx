import React from 'react';

interface AuthBrandPanelProps {
  title: string;
  description: string;
}

export const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({ title, description }) => {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-white relative overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tight">Vesta.</span>
      </div>
      <div className="my-auto max-w-lg">
        <h2 className="text-4xl font-bold mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-white/80 text-base leading-relaxed">
          {description}
        </p>
      </div>
      <div className="text-xs text-white/60">
        © 2026 Vesta PropTech. Todos los derechos reservados.
      </div>
    </div>
  );
};