import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Seed de Equipos predefinidos
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

  console.log('📦 Creando equipos...');
  for (const equipo of equipos) {
    const equipoCreado = await prisma.equipo.upsert({
      where: { nombre: equipo.nombre },
      update: {},
      create: equipo,
    });
    console.log(`✅ Equipo creado: ${equipoCreado.nombre}`);
  }

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
