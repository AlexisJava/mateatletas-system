import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding rutas curriculares...');

  // Rutas curriculares predefinidas
  const rutas = [
    {
      id: 'seed-ruta-logica',
      nombre: 'Lógica y Razonamiento',
      color: '#8B5CF6', // Violeta
      descripcion:
        'Desarrollo de pensamiento lógico, resolución de problemas y razonamiento abstracto',
    },
    {
      id: 'seed-ruta-algebra',
      nombre: 'Álgebra',
      color: '#3B82F6', // Azul
      descripcion: 'Ecuaciones, sistemas, funciones y expresiones algebraicas',
    },
    {
      id: 'seed-ruta-geometria',
      nombre: 'Geometría',
      color: '#10B981', // Verde
      descripcion:
        'Figuras planas, cuerpos geométricos, trigonometría y transformaciones',
    },
    {
      id: 'seed-ruta-aritmetica',
      nombre: 'Aritmética',
      color: '#F59E0B', // Amarillo/Naranja
      descripcion:
        'Números, operaciones básicas, fracciones, decimales y porcentajes',
    },
    {
      id: 'seed-ruta-estadistica',
      nombre: 'Estadística y Probabilidad',
      color: '#EF4444', // Rojo
      descripcion:
        'Análisis de datos, gráficos, medidas de tendencia y probabilidad',
    },
    {
      id: 'seed-ruta-calculo',
      nombre: 'Cálculo',
      color: '#6366F1', // Índigo
      descripcion: 'Límites, derivadas, integrales y análisis matemático',
    },
  ];

  for (const ruta of rutas) {
    await prisma.rutaCurricular.upsert({
      where: { id: ruta.id },
      update: ruta,
      create: ruta,
    });
    console.log(`✅ Ruta creada/actualizada: ${ruta.nombre}`);
  }

  console.log('🎉 Seed de rutas curriculares completado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de rutas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
