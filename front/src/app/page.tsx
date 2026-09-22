import { Hero } from '@/components/home/Hero/Hero'; 
import { FeaturedRow } from '@/components/home/FeaturedRow/FeaturedRow'; // Ajusta la ruta si es necesario
import { PromoSlider } from '@/components/home/PromeSlider/PromoSlider';
import { propertyService } from '@/services/propertyService';
import { PopularDestination } from '@/components/home/PopularDestination/PopularDestination';

export default async function Home() {
  const properties = await propertyService.getProperties();

  const destacadosTemporarios = properties.filter(p => p.rentalType === 'Temporario');
  const destacadosResidenciales = properties.filter(p => p.rentalType === 'Residencial');

  return (
    <main className="flex flex-col min-h-screen bg-base-1">
      <Hero />      
      <div className="py-6">
{destacadosTemporarios.length > 0 && (
          <FeaturedRow 
            title="Alojamientos populares por días" 
            properties={destacadosTemporarios} 
            href="/catalog?rentalType=Temporario" // <-- Pasamos el filtro exacto
          />
        )}
        {destacadosResidenciales.length > 0 && (
          <FeaturedRow 
            title="Ideal para vivir a largo plazo" 
            properties={destacadosResidenciales} 
            href="/catalog?rentalType=Residencial" // <-- Pasamos el filtro exacto
          />
        )}
      </div>
      <PopularDestination/>
      <PromoSlider/>
    </main>
  );
}