import { PrismaClient } from '@prisma/client';
import { runAllSeeds } from './seeds';

const prisma = new PrismaClient();

/**
 * Main seed function
 * Delegated to modular seed orchestrator
 *
 * Estructura modular:
 * - prisma/seeds/index.ts - Orchestrator principal
 * - prisma/seeds/admin.seed.ts - Usuario administrador
 * - prisma/seeds/docente.seed.ts - Docente de prueba
 * - prisma/seeds/tutor.seed.ts - Tutor de prueba
 * - prisma/seeds/equipos.seed.ts - 4 equipos base
 * - prisma/seeds/rutas-curriculares.seed.ts - 6 rutas curriculares
 * - prisma/seeds/productos.seed.ts - Catálogo de productos
 * - prisma/seeds/acciones-puntuables.seed.ts - Configuración de gamificación
 * - prisma/seeds/logros.seed.ts - Sistema de logros
 *
 * Uso:
 * - npm run db:seed (development)
 * - NODE_ENV=production npm run db:seed (production - solo datos esenciales)
 */
async function main() {
  await runAllSeeds(prisma);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
