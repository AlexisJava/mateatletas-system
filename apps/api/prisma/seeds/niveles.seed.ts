import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed para crear los niveles del sistema de gamificación
 * con nombres creativos y configuración de puntos
 */
export async function seedNiveles() {
  console.log('🌟 Seeding niveles...');

  const niveles = [
    {
      nivel: 1,
      nombre: 'Explorador Numérico',
      descripcion: '¡Empezando tu viaje matemático!',
      puntos_minimos: 0,
      puntos_maximos: 499,
      color: '#10b981', // Verde
      icono: '🌱',
    },
    {
      nivel: 2,
      nombre: 'Aprendiz Matemático',
      descripcion: 'Dominando los fundamentos',
      puntos_minimos: 500,
      puntos_maximos: 999,
      color: '#3b82f6', // Azul
      icono: '📚',
    },
    {
      nivel: 3,
      nombre: 'Calculador Experto',
      descripcion: 'Resolviendo problemas complejos',
      puntos_minimos: 1000,
      puntos_maximos: 1999,
      color: '#8b5cf6', // Púrpura
      icono: '🧮',
    },
    {
      nivel: 4,
      nombre: 'Maestro del Álgebra',
      descripcion: 'Variables y ecuaciones son tu especialidad',
      puntos_minimos: 2000,
      puntos_maximos: 3499,
      color: '#ec4899', // Rosa
      icono: '🎯',
    },
    {
      nivel: 5,
      nombre: 'Genio Geométrico',
      descripcion: 'Formas y espacios no tienen secretos para ti',
      puntos_minimos: 3500,
      puntos_maximos: 4999,
      color: '#f59e0b', // Amarillo
      icono: '📐',
    },
    {
      nivel: 6,
      nombre: 'Hechicero del Cálculo',
      descripcion: 'Derivadas e integrales a tu merced',
      puntos_minimos: 5000,
      puntos_maximos: 7499,
      color: '#06b6d4', // Cyan
      icono: '🔮',
    },
    {
      nivel: 7,
      nombre: 'Sabio Matemático',
      descripcion: 'Tu conocimiento es vasto y profundo',
      puntos_minimos: 7500,
      puntos_maximos: 9999,
      color: '#8b5cf6', // Púrpura oscuro
      icono: '🧙‍♂️',
    },
    {
      nivel: 8,
      nombre: 'Leyenda Numérica',
      descripcion: 'Pocos llegan a este nivel de maestría',
      puntos_minimos: 10000,
      puntos_maximos: 14999,
      color: '#ef4444', // Rojo
      icono: '👑',
    },
    {
      nivel: 9,
      nombre: 'Titán Matemático',
      descripcion: 'Tu dominio es absoluto',
      puntos_minimos: 15000,
      puntos_maximos: 24999,
      color: '#f97316', // Naranja
      icono: '⚡',
    },
    {
      nivel: 10,
      nombre: 'Dios de los Números',
      descripcion: '¡Has alcanzado la cúspide del conocimiento!',
      puntos_minimos: 25000,
      puntos_maximos: 999999,
      color: '#FFD700', // Dorado
      icono: '🌟',
    },
  ];

  for (const nivel of niveles) {
    await prisma.nivelConfig.upsert({
      where: { nivel: nivel.nivel },
      update: nivel,
      create: nivel,
    });
  }

  console.log(`✅ ${niveles.length} niveles creados/actualizados`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedNiveles()
    .then(() => {
      console.log('✅ Seed de niveles completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed de niveles:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
