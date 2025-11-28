import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';
  const password = 'Alexis93$';

  console.log(`🔐 Sincronizando contraseña para: ${email}\n`);

  // Generar el hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // Actualizar Admin
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) {
    await prisma.admin.update({
      where: { email },
      data: { password_hash: hashedPassword },
    });
    console.log(`✅ Admin actualizado: ${admin.nombre} ${admin.apellido}`);
  }

  // Actualizar Docente
  const docente = await prisma.docente.findUnique({ where: { email } });
  if (docente) {
    await prisma.docente.update({
      where: { email },
      data: { password_hash: hashedPassword },
    });
    console.log(
      `✅ Docente actualizado: ${docente.nombre} ${docente.apellido}`,
    );
  }

  // Actualizar Tutor (si existe)
  const tutor = await prisma.tutor.findUnique({ where: { email } });
  if (tutor) {
    await prisma.tutor.update({
      where: { email },
      data: { password_hash: hashedPassword },
    });
    console.log(`✅ Tutor actualizado: ${tutor.nombre} ${tutor.apellido}`);
  }

  console.log(`\n✅ Contraseña sincronizada en todos los registros`);
  console.log(`🔑 Password: ${password}`);
  console.log(
    `\nAhora podés loguearte con cualquiera de tus roles usando la misma contraseña.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
