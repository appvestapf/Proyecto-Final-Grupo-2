import AppDataSource from '../config/data-source';
import { Property } from '../modules/properties/entities/property.entity';
import { propertiesSeed } from './properties.seed';

async function runSeed() {
  await AppDataSource.initialize();

  const propertyRepository = AppDataSource.getRepository(Property);

  const existing = await propertyRepository.count();

  if (existing > 0) {
    console.log(
      `Ya hay ${existing} propiedades cargadas. No se insertó nada para evitar duplicados.`,
    );
    await AppDataSource.destroy();
    return;
  }

  await propertyRepository.save(propertiesSeed);

  console.log(`${propertiesSeed.length} propiedades cargadas correctamente.`);

  await AppDataSource.destroy();
}

runSeed().catch((error) => {
  console.error('Error al cargar el seed:', error);
  process.exit(1);
});
