import { PrismaClient } from '@prisma/client';

/**
 * Seed de Planes de Suscripción - Sistema Mateatletas 2026
 *
 * Modelo STEAM - 3 niveles de suscripción:
 * - STEAM_LIBROS: $40k - Plataforma completa sin clases en vivo
 * - STEAM_ASINCRONICO: $65k - Todo + contenido extra
 * - STEAM_SINCRONICO: $95k - Todo + clases en vivo con docente
 *
 * Estos planes se asignan:
 * 1. A través de la suscripción del tutor (MercadoPago PreApproval)
 * 2. Directamente al estudiante por admin (becas, casos especiales)
 */
export async function seedPlanesSuscripcion(
  prisma: PrismaClient,
): Promise<void> {
  console.log('💳 Seeding Planes de Suscripción STEAM 2026...');

  const planes = [
    {
      nombre: 'STEAM_LIBROS',
      descripcion:
        'Plataforma completa STEAM: Matemáticas + Programación + Ciencias. Acceso a todo el contenido asincrónico, ejercicios interactivos y progreso gamificado.',
      precio_base: 40000,
      moneda: 'ARS',
      activo: true,
    },
    {
      nombre: 'STEAM_ASINCRONICO',
      descripcion:
        'Todo el contenido de STEAM Libros + clases grabadas premium, recursos descargables y material de apoyo exclusivo.',
      precio_base: 65000,
      moneda: 'ARS',
      activo: true,
    },
    {
      nombre: 'STEAM_SINCRONICO',
      descripcion:
        'Experiencia completa: Todo lo anterior + clases en vivo con docentes especializados, chat en tiempo real y seguimiento personalizado.',
      precio_base: 95000,
      moneda: 'ARS',
      activo: true,
    },
  ];

  for (const plan of planes) {
    // Buscar si existe un plan con ese nombre
    const existente = await prisma.planSuscripcion.findFirst({
      where: { nombre: plan.nombre },
    });

    if (existente) {
      // Actualizar el existente
      await prisma.planSuscripcion.update({
        where: { id: existente.id },
        data: {
          descripcion: plan.descripcion,
          precio_base: plan.precio_base,
          moneda: plan.moneda,
          activo: plan.activo,
        },
      });
      console.log(`   ✏️  Actualizado: ${plan.nombre}`);
    } else {
      // Crear nuevo
      await prisma.planSuscripcion.create({
        data: plan,
      });
      console.log(`   ✅ Creado: ${plan.nombre}`);
    }
  }

  console.log(
    '   ✅ 3 planes creados: STEAM_LIBROS, STEAM_ASINCRONICO, STEAM_SINCRONICO',
  );
}
