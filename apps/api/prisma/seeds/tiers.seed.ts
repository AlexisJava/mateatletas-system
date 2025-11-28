import { PrismaClient, TierNombre } from '@prisma/client';

/**
 * Seed de Tiers - Sistema Mateatletas 2026
 *
 * Crea los 3 tiers de suscripcion:
 * - ARCADE: $30k - 1 mundo async, sin docente (entry-level)
 * - ARCADE_PLUS: $60k - 3 mundos async, sin docente (amplitud)
 * - PRO: $75k - 1 mundo async + 1 mundo sync con docente (profundidad)
 *
 * Reglas de negocio:
 * - El tier es por estudiante, no por familia
 * - Los descuentos familiares (12%/20%) aplican al total
 * - PRO requiere que mundo async != mundo sync
 */
export async function seedTiers(prisma: PrismaClient): Promise<void> {
  console.log('🎮 Seeding Tiers 2026...');

  const tiers = [
    {
      nombre: TierNombre.ARCADE,
      precio_mensual: 30000,
      mundos_async: 1,
      mundos_sync: 0,
      tiene_docente: false,
      descripcion: 'Plan inicial - 1 mundo async para explorar',
      activo: true,
      orden: 1,
    },
    {
      nombre: TierNombre.ARCADE_PLUS,
      precio_mensual: 60000,
      mundos_async: 3,
      mundos_sync: 0,
      tiene_docente: false,
      descripcion: 'Plan amplitud - 3 mundos async para variedad',
      activo: true,
      orden: 2,
    },
    {
      nombre: TierNombre.PRO,
      precio_mensual: 75000,
      mundos_async: 1,
      mundos_sync: 1,
      tiene_docente: true,
      descripcion:
        'Plan profundidad - 1 mundo async + 1 mundo sync con docente',
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

  console.log('   ✅ 3 tiers creados: ARCADE, ARCADE_PLUS, PRO');
}
