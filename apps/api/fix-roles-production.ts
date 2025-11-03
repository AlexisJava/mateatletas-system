import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'alexis.figueroa@est.fi.uncoma.edu.ar';

  console.log('🔧 Actualizando roles en producción...\n');

  // 1. Verificar estado actual
  console.log('📋 Estado actual:');

  const docente = await prisma.docente.findUnique({
    where: { email },
    select: { id: true, nombre: true, apellido: true, roles: true },
  });

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true, nombre: true, apellido: true, roles: true },
  });

  if (docente) {
    console.log(`   Docente: ${docente.nombre} ${docente.apellido}`);
    console.log(`   Roles actuales: ${JSON.stringify(docente.roles)}`);
  }

  if (admin) {
    console.log(`   Admin: ${admin.nombre} ${admin.apellido}`);
    console.log(`   Roles actuales: ${JSON.stringify(admin.roles)}`);
  }

  console.log('\n🔄 Actualizando roles...\n');

  // 2. Actualizar Docente
  if (docente) {
    await prisma.docente.update({
      where: { email },
      data: {
        roles: ['docente', 'admin'],
      },
    });
    console.log('✅ Docente actualizado: roles = ["docente", "admin"]');
  }

  // 3. Actualizar Admin
  if (admin) {
    await prisma.admin.update({
      where: { email },
      data: {
        roles: ['admin', 'docente'],
      },
    });
    console.log('✅ Admin actualizado: roles = ["admin", "docente"]');
  }

  // 4. Verificar cambios
  console.log('\n✅ Verificación final:');

  const docenteUpdated = await prisma.docente.findUnique({
    where: { email },
    select: { nombre: true, apellido: true, roles: true },
  });

  const adminUpdated = await prisma.admin.findUnique({
    where: { email },
    select: { nombre: true, apellido: true, roles: true },
  });

  if (docenteUpdated) {
    console.log(`   Docente: ${docenteUpdated.nombre} ${docenteUpdated.apellido}`);
    console.log(`   Roles nuevos: ${JSON.stringify(docenteUpdated.roles)}`);
  }

  if (adminUpdated) {
    console.log(`   Admin: ${adminUpdated.nombre} ${adminUpdated.apellido}`);
    console.log(`   Roles nuevos: ${JSON.stringify(adminUpdated.roles)}`);
  }

  console.log('\n🎉 ¡Roles actualizados exitosamente!');
  console.log('\nAhora deberías poder:');
  console.log('  1. Loguearte con alexis.figueroa@est.fi.uncoma.edu.ar');
  console.log('  2. Ver el modal de selección de rol');
  console.log('  3. Elegir entre "Docente" o "Admin"');
  console.log('  4. Acceder al dashboard sin errores 401');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
