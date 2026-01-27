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
      precioMensual: 40000,
      mundosAsync: 3, // Acceso a todos los mundos (Mate, Progra, Ciencias)
      mundosSync: 0,
      tieneDocente: false,
      descripcion:
        'Plataforma completa STEAM: Matemáticas + Programación + Ciencias',
      activo: true,
      orden: 1,
    },
    {
      nombre: TierNombre.STEAM_ASINCRONICO,
      precioMensual: 65000,
      mundosAsync: 3,
      mundosSync: 0,
      tieneDocente: false,
      descripcion: 'STEAM completo + clases grabadas asincrónicas',
      activo: true,
      orden: 2,
    },
    {
      nombre: TierNombre.STEAM_SINCRONICO,
      precioMensual: 95000,
      mundosAsync: 3,
      mundosSync: 1,
      tieneDocente: true,
      descripcion: 'STEAM completo + clases en vivo con docente',
      activo: true,
      orden: 3,
    },
  ];

  for (const tier of tiers) {
    await prisma.tier.upsert({
      where: { nombre: tier.nombre },
      update: {
        precioMensual: tier.precioMensual,
        mundosAsync: tier.mundosAsync,
        mundosSync: tier.mundosSync,
        tieneDocente: tier.tieneDocente,
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
