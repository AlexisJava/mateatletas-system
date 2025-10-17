import { PrismaClient } from '@prisma/client';

export async function seedRutasCurriculares(prisma: PrismaClient) {
  console.log('\n🧭 Creando rutas curriculares...');

  const rutas = [
    {
      id: 'seed-ruta-logica',
      nombre: 'Lógica y Razonamiento',
      color: '#8B5CF6',
      descripcion:
        'Desarrollo de pensamiento lógico, resolución de problemas y razonamiento abstracto',
    },
    {
      id: 'seed-ruta-algebra',
      nombre: 'Álgebra',
      color: '#3B82F6',
      descripcion: 'Ecuaciones, sistemas, funciones y expresiones algebraicas',
    },
    {
      id: 'seed-ruta-geometria',
      nombre: 'Geometría',
      color: '#10B981',
      descripcion:
        'Figuras planas, cuerpos geométricos, trigonometría y transformaciones',
    },
    {
      id: 'seed-ruta-aritmetica',
      nombre: 'Aritmética',
      color: '#F59E0B',
      descripcion:
        'Números, operaciones básicas, fracciones, decimales y porcentajes',
    },
    {
      id: 'seed-ruta-estadistica',
      nombre: 'Estadística y Probabilidad',
      color: '#EF4444',
      descripcion:
        'Análisis de datos, gráficos, medidas de tendencia y probabilidad',
    },
    {
      id: 'seed-ruta-calculo',
      nombre: 'Cálculo',
      color: '#6366F1',
      descripcion: 'Límites, derivadas, integrales y análisis matemático',
    },
  ];

  for (const ruta of rutas) {
    const { id, ...data } = ruta;

    await prisma.rutaCurricular.upsert({
      where: { nombre: ruta.nombre },
      update: data,
      create: { id, ...data },
    });
    console.log(`   • ${ruta.nombre}`);
  }

  console.log('✅ Rutas curriculares cargadas');
}
