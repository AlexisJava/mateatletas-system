import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './admin.seed';
import { seedDocente } from './docente.seed';
import { seedTutor } from './tutor.seed';
import { seedEquipos } from './equipos.seed';
import { seedRutasCurriculares } from './rutas-curriculares.seed';
import { seedProductos } from './productos.seed';
import { seedAccionesPuntuables } from './acciones-puntuables.seed';
import { seedLogros } from './logros.seed';
import { seedSectores } from './sectores.seed';
import { seedConfiguracionPrecios } from './configuracion-precios.seed';
import { seedInscripcionesMensuales } from './inscripciones-mensuales.seed';

/**
 * Orchestrator para todos los seeds modulares
 * Ejecuta seeds según el entorno (NODE_ENV)
 */
export async function runAllSeeds(prisma: PrismaClient) {
  const env = process.env.NODE_ENV || 'development';
  console.log(`🌱 Iniciando seed de la base de datos (${env})...\n`);

  if (env === 'production') {
    // PRODUCTION: Solo datos esenciales
    console.log('🏭 Modo PRODUCCIÓN: Creando solo datos esenciales\n');
    await seedAdmin(prisma);
    await seedConfiguracionPrecios(prisma); // ESENCIAL: Configuración de precios
    await seedSectores(prisma); // Sectores base (Matemática y Programación)
    await seedRutasCurriculares(prisma); // Las rutas son necesarias para el sistema
    await seedProductos(prisma); // Productos del catálogo (pueden ser reales)
    await seedAccionesPuntuables(prisma); // Configuración de gamificación
    await seedLogros(prisma); // Logros del sistema
  } else {
    // DEVELOPMENT/TEST: Datos completos de prueba
    console.log('🧪 Modo DESARROLLO: Creando datos de prueba completos\n');
    await seedAdmin(prisma);
    await seedConfiguracionPrecios(prisma); // ESENCIAL: Configuración de precios
    await seedSectores(prisma); // Sectores base (Matemática y Programación)
    await seedDocente(prisma);
    await seedTutor(prisma);
    await seedEquipos(prisma);
    await seedRutasCurriculares(prisma);
    await seedProductos(prisma);
    await seedAccionesPuntuables(prisma);
    await seedLogros(prisma);
    await seedInscripcionesMensuales(prisma); // Inscripciones de prueba para el tutor
  }

  console.log(`\n🎉 Seed completado exitosamente (${env})!`);
}

// Re-export individual seeds for flexibility
export {
  seedAdmin,
  seedConfiguracionPrecios,
  seedSectores,
  seedDocente,
  seedTutor,
  seedEquipos,
  seedRutasCurriculares,
  seedProductos,
  seedAccionesPuntuables,
  seedLogros,
  seedInscripcionesMensuales,
};
