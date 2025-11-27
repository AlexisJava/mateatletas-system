import { PrismaClient } from '@prisma/client';

/**
 * Seed: Equipos
 * Crea los 4 equipos base del sistema de gamificación
 */
export async function seedEquipos(prisma: PrismaClient) {
  console.log('\n🛡️  Creando equipos base...');

  const equipos = [
    {
      nombre: 'Quantum',
      color_primario: '#10B981',
      color_secundario: '#34D399',
      descripcion: 'Lógica y Ciberseguridad. Para los analíticos.',
    },
    {
      nombre: 'Vertex',
      color_primario: '#8B5CF6',
      color_secundario: '#A78BFA',
      descripcion: 'Diseño y Mundos 3D. Para los creativos.',
    },
    {
      nombre: 'Pulsar',
      color_primario: '#F97316',
      color_secundario: '#FB923C',
      descripcion: 'Ciencia Experimental. Para los curiosos.',
    },
  ];

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { nombre: equipo.nombre },
      update: {
        color_primario: equipo.color_primario,
        color_secundario: equipo.color_secundario,
      },
      create: equipo,
    });
    console.log(`   • ${equipo.nombre}`);
  }

  console.log('✅ Equipos cargados');
}
