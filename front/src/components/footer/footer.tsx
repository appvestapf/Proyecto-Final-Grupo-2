export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 bg-linear-to-b mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* CONTENIDO PRINCIPAL DEL FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Nombre de la Marca */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-blue-600 tracking-tight">
              Vesta<span className="text-slate-400 font-normal">.</span>
            </span>
          </div>

          {/* Enlaces Rápidos Informativos (Estáticos por ahora) */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Términos de Servicio
            </span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Política de Privacidad
            </span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              Soporte
            </span>
          </div>
          
        </div>

        {/* LÍNEA DIVISORIA Y COPYRIGHT */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Vesta Inc. Alquileres en Latinoamérica.
          </p>
          <p className="font-medium text-slate-500">
            Proyecto Final - Grupo 2
          </p>
        </div>

      </div>
    </footer>
  );
}
