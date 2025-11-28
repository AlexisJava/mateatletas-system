import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
  const newPassword = 'Alexis93$';

  console.log(`🔐 Reseteando contraseña para: ${email}`);

  // Hash de la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar el admin
  const admin = await prisma.admin.update({
    where: { email },
    data: {
      password_hash: hashedPassword,
    },
  });

  console.log(
    `✅ Contraseña actualizada exitosamente para: ${admin.nombre} ${admin.apellido}`,
  );
  console.log(`📧 Email: ${admin.email}`);
  console.log(`🔑 Nueva contraseña: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
