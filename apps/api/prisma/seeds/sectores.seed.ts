import { PrismaClient } from '@prisma/client';

export async function seedSectores(prisma: PrismaClient) {
  console.log('📐 Seeding sectores...');

  const sectorMate = await prisma.sector.upsert({
    where: { nombre: 'Matemática' },
    update: {},
    create: {
      nombre: 'Matemática',
      descripcion: 'Sector de matemática',
      color: '#3B82F6',
      icono: '📐',
      activo: true,
    },
  });
  console.log(`  ✅ Sector Matemática: ${sectorMate.id}`);

  const sectorProg = await prisma.sector.upsert({
    where: { nombre: 'Programación' },
    update: {},
    create: {
      nombre: 'Programación',
      descripcion: 'Sector de programación',
      color: '#8B5CF6',
      icono: '💻',
      activo: true,
    },
  });
  console.log(`  ✅ Sector Programación: ${sectorProg.id}`);

  const sectorCiencias = await prisma.sector.upsert({
    where: { nombre: 'Ciencias' },
    update: {},
    create: {
      nombre: 'Ciencias',
      descripcion: 'Sector de ciencias naturales y exactas',
      color: '#10B981',
      icono: '🔬',
      activo: true,
    },
  });
  console.log(`  ✅ Sector Ciencias: ${sectorCiencias.id}`);
}
