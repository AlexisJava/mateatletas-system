import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Migración de TipoProducto ===\n');

  console.log('1. Agregando nuevos valores al enum...');
  const newValues = [
    'Evento',
    'Digital',
    'Fisico',
    'Servicio',
    'Bundle',
    'Certificacion',
  ];

  for (const val of newValues) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TYPE "TipoProducto" ADD VALUE IF NOT EXISTS '${val}'`,
      );
      console.log(`   + ${val}`);
    } catch (err) {
      console.log(`   x ${val} (ya existe o error)`);
    }
  }

  console.log('\n2. Actualizando productos existentes...');

  // Mapear RecursoDigital -> Digital
  const updated1 = await prisma.$executeRawUnsafe(
    `UPDATE productos SET tipo = 'Digital' WHERE tipo = 'RecursoDigital'`,
  );
  console.log(`   RecursoDigital -> Digital: ${updated1} registros`);

  // Mapear Suscripcion -> Servicio
  const updated2 = await prisma.$executeRawUnsafe(
    `UPDATE productos SET tipo = 'Servicio' WHERE tipo = 'Suscripcion'`,
  );
  console.log(`   Suscripcion -> Servicio: ${updated2} registros`);

  console.log('\n3. Verificando productos actualizados...');
  const result = await prisma.producto.findMany({
    select: { id: true, nombre: true, tipo: true },
  });
  console.log(result);

  console.log('\n=== Migración completada ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
