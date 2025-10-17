import { PrismaClient } from '@prisma/client';

/**
 * Seed: Equipos
 * Crea los 4 equipos base del sistema de gamificación
 */
export async function seedEquipos(prisma: PrismaClient) {
  console.log('\n🛡️  Creando equipos base...');

  const equipos = [
    {
      nombre: 'Fénix',
      color_primario: '#FF6B35',
      color_secundario: '#F7B801',
    },
    {
      nombre: 'Dragón',
      color_primario: '#F44336',
      color_secundario: '#9C27B0',
    },
    {
      nombre: 'Tigre',
      color_primario: '#2196F3',
      color_secundario: '#00BCD4',
    },
    {
      nombre: 'Águila',
      color_primario: '#4CAF50',
      color_secundario: '#8BC34A',
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
