import Link from "next/link";

export default function PagoExitosoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 sm:px-6 lg:px-8">
      {/* Contenedor principal alineado a la estética de Vesta */}
      <div className="w-full max-w-md border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        
        {/* Ícono de Éxito en Azul de la Marca */}
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-xs">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Títulos y Textos con fuentes del proyecto */}
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          ¡Pago Procesado con Éxito!
        </h1>
        
        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
          Tu pago ha sido registrado de forma segura en la plataforma. La propiedad ha quedado reservada temporalmente.
        </p>

        {/* Separador estético sutil */}
        <div className="border-t border-slate-100 my-6" />

        {/* Acciones principales con botones idénticos a los del Navbar */}
        <div className="flex flex-col gap-3">
          <Link
            href="/mis-alquileres"
            className="w-full text-center text-sm font-medium bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            Ir a Mis Alquileres
          </Link>
          
          <Link
            href="/"
            className="w-full text-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
          >
            Volver al Inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
