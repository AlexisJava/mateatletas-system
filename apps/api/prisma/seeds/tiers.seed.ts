import { PrismaClient, TierNombre } from '@prisma/client';

/**
 * Seed de Tiers - Sistema Mateatletas 2026
 *
 * Modelo STEAM - 3 niveles de suscripción:
 * - STEAM_LIBROS: $40k - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65k - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95k - Todo + clases en vivo con docente
 *
 * Reglas de negocio:
 * - El tier es por estudiante, no por familia
 * - Descuento 10% para 2do hermano en adelante
 * - STEAM_SINCRONICO incluye acceso a clases grupales con docente
 */
export async function seedTiers(prisma: PrismaClient): Promise<void> {
  console.log('🎮 Seeding Tiers STEAM 2026...');

  const tiers = [
    {
      nombre: TierNombre.STEAM_LIBROS,
      precio_mensual: 40000,
      mundos_async: 3, // Acceso a todos los mundos (Mate, Progra, Ciencias)
      mundos_sync: 0,
      tiene_docente: false,
      descripcion:
        'Plataforma completa STEAM: Matemáticas + Programación + Ciencias',
      activo: true,
      orden: 1,
    },
    {
      nombre: TierNombre.STEAM_ASINCRONICO,
      precio_mensual: 65000,
      mundos_async: 3,
      mundos_sync: 0,
      tiene_docente: false,
      descripcion: 'STEAM completo + clases grabadas asincrónicas',
      activo: true,
      orden: 2,
    },
    {
      nombre: TierNombre.STEAM_SINCRONICO,
      precio_mensual: 95000,
      mundos_async: 3,
      mundos_sync: 1,
      tiene_docente: true,
      descripcion: 'STEAM completo + clases en vivo con docente',
      activo: true,
      orden: 3,
    },
  ];

  for (const tier of tiers) {
    await prisma.tier.upsert({
      where: { nombre: tier.nombre },
      update: {
        precio_mensual: tier.precio_mensual,
        mundos_async: tier.mundos_async,
        mundos_sync: tier.mundos_sync,
        tiene_docente: tier.tiene_docente,
        descripcion: tier.descripcion,
        activo: tier.activo,
        orden: tier.orden,
      },
      create: tier,
    });
  }

  console.log(
    '   ✅ 3 tiers creados: STEAM_LIBROS, STEAM_ASINCRONICO, STEAM_SINCRONICO',
  );
}
