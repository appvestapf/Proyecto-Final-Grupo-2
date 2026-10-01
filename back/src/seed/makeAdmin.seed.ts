import AppDataSource from '../config/data-source';
import { User } from '../modules/users/entities/user.entity';

async function makeAdmin() {
  const args = process.argv.slice(2);
  const makeSuper = args.includes('--super');
  const email = args.find((a) => !a.startsWith('--'))?.trim();

  if (!email) {
    console.error(
      'Falta el email. Uso: npm run make-admin -- usuario@mail.com [--super]',
    );
    process.exit(1);
  }

  await AppDataSource.initialize();
  const usersRepository = AppDataSource.getRepository(User);

  const user = await usersRepository.findOneBy({ email });
  if (!user) {
    console.error(`No existe un usuario con el email ${email}`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  const role = makeSuper ? 'superAdmin' : 'admin';
  const alreadyHasRole = makeSuper ? user.isSuperAdmin : user.isAdmin;

  if (alreadyHasRole) {
    console.log(`${email} ya es ${role}. No se cambió nada.`);
  } else {
    await usersRepository.update(user.id, {
      isAdmin: true,
      isActive: true,
      ...(makeSuper ? { isSuperAdmin: true } : {}),
    });
    console.log(`${email} ahora es ${role}.`);
  }

  await AppDataSource.destroy();
}

makeAdmin().catch((error) => {
  console.error('Error al asignar el rol:', error);
  process.exit(1);
});
