import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './admin.seed';
import { seedDocente } from './docente.seed';
import { seedDocentes } from './docentes.seed';
import { seedTutor } from './tutor.seed';
import { seedCasas } from './casas.seed';
import { seedMundos } from './mundos.seed';
import { seedTiers } from './tiers.seed';
import { seedPlanesSuscripcion } from './planes-suscripcion.seed';
import { seedProductos } from './productos.seed';
import { seedLogros } from './logros.seed';
import { seedLogrosPlanificaciones } from './logros-planificaciones.seed';
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
    await seedCasas(prisma); // ESENCIAL: Casas 2026 (Quantum, Vertex, Pulsar)
    await seedMundos(prisma); // ESENCIAL: Mundos STEAM 2026 (Mat, Prog, Ciencias)
    await seedTiers(prisma); // ESENCIAL: Tiers STEAM 2026
    await seedPlanesSuscripcion(prisma); // ESENCIAL: Planes de suscripción STEAM
    await seedProductos(prisma); // Productos del catálogo (pueden ser reales)
    await seedLogros(prisma); // Logros del sistema
    await seedLogrosPlanificaciones(prisma); // Logros de planificaciones
  } else {
    // DEVELOPMENT/TEST: Datos completos de prueba
    console.log('🧪 Modo DESARROLLO: Creando datos de prueba completos\n');
    await seedAdmin(prisma);
    await seedConfiguracionPrecios(prisma); // ESENCIAL: Configuración de precios
    await seedDocente(prisma);
    await seedDocentes(prisma); // Docentes reales: Gimena y Ayelen
    await seedTutor(prisma);
    await seedCasas(prisma);
    await seedMundos(prisma); // Mundos STEAM 2026
    await seedTiers(prisma); // Tiers STEAM 2026
    await seedPlanesSuscripcion(prisma); // Planes de suscripción STEAM
    await seedProductos(prisma);
    await seedLogros(prisma);
    await seedLogrosPlanificaciones(prisma); // Logros de planificaciones
    await seedInscripcionesMensuales(prisma); // Inscripciones de prueba para el tutor
  }

  console.log(`\n🎉 Seed completado exitosamente (${env})!`);
}

// Re-export individual seeds for flexibility
export {
  seedAdmin,
  seedConfiguracionPrecios,
  seedDocente,
  seedDocentes,
  seedTutor,
  seedCasas,
  seedMundos,
  seedTiers,
  seedPlanesSuscripcion,
  seedProductos,
  seedLogros,
  seedLogrosPlanificaciones,
  seedInscripcionesMensuales,
};
