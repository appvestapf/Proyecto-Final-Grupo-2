import Link from 'next/link';
import Image from 'next/image';

const DESTINATIONS = [
  {
    id: 1,
    name: "Buenos Aires",
    country: "Argentina",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849",
    colSpan: "lg:col-span-2", // Esta tarjeta será más ancha para romper la simetría (estilo Bento Grid)
  },
  {
    id: 2,
    name: "Santiago",
    country: "Chile",
    image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a",
    colSpan: "lg:col-span-1",
  },
  {
    id: 3,
    name: "Bogotá",
    country: "Colombia",
    image: "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    colSpan: "lg:col-span-1",
  },
  {
    id: 4,
    name: "Lima",
    country: "Perú",
    image: "https://images.unsplash.com/photo-1577587230708-187fdbef4d91?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    colSpan: "lg:col-span-1",
  },
  {
    id: 5,
    name: "Montevideo",
    country: "Uruguay",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c", // Usando una imagen residencial bonita
    colSpan: "lg:col-span-3", // Tarjeta ancha abajo
  },
];

export const PopularDestination = () => {
  return (
    <section className="w-full max-w-[1350px] mx-auto py-4 px-6 md:px-12 lg:px-8">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
          Destinos más elegidos
        </h2>
        <p className="text-slate-500 text-lg">
          Explora propiedades verificadas en las ciudades con mayor demanda de la región.
        </p>
      </div>

      {/* Grilla asimétrica (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {DESTINATIONS.map((dest) => (
          <Link 
            key={dest.id} 
            href={`/catalog?location=${dest.name}`}
            className={`group relative h-[250px] md:h-[300px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${dest.colSpan}`}
          >
            {/* Imagen de fondo con efecto zoom en hover */}
            <Image 
              src={dest.image} 
              alt={`Alquileres en ${dest.name}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradiente oscuro para que el texto sea siempre legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Contenido (Textos flotantes) */}
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <span className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1 block">
                {dest.country}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {dest.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};