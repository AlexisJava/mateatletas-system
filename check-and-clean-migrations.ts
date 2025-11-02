import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndCleanMigrations() {
  try {
    console.log('=== VERIFICANDO TABLA _prisma_migrations ===\n');

    // Ver contenido actual
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT * FROM _prisma_migrations ORDER BY started_at
    `;

    console.log(`Total de registros: ${migrations.length}\n`);

    if (migrations.length > 0) {
      console.table(migrations.map(m => ({
        nombre: m.migration_name,
        inicio: m.started_at?.toISOString(),
        fin: m.finished_at?.toISOString() || 'NO FINALIZADA',
        pasos: m.applied_steps_count,
      })));

      console.log('\n❌ La tabla NO está vacía. Limpiando...\n');

      // Limpiar tabla
      await prisma.$executeRaw`TRUNCATE TABLE _prisma_migrations`;
      console.log('✅ Tabla limpiada con TRUNCATE\n');

      // Verificar que quedó vacía
      const countAfter = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as total FROM _prisma_migrations
      `;
      console.log(`Registros después del TRUNCATE: ${countAfter[0].total}`);

      if (countAfter[0].total === '0') {
        console.log('\n✅ ÉXITO: La tabla _prisma_migrations está completamente vacía');
        console.log('   Ahora Railway puede aplicar las migraciones desde cero');
      } else {
        console.log('\n❌ ERROR: La tabla todavía tiene registros');
      }
    } else {
      console.log('✅ La tabla _prisma_migrations ya está vacía');
    }

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCleanMigrations()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
