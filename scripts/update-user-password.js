/**
 * Script para actualizar contraseña directamente en Railway
 * Se ejecuta con: railway run node scripts/update-user-password.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
  const newPassword = 'Alexis93$';

  console.log(`Actualizando contraseña para: ${email}`);

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar en la base de datos
  const result = await prisma.usuario.updateMany({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`✅ Contraseña actualizada. Registros afectados: ${result.count}`);

  if (result.count === 0) {
    console.log('⚠️  No se encontró ningún usuario con ese email.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
