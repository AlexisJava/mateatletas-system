import { PrismaClient } from '@prisma/client';

/**
 * Seed: Configuración de Precios - Sistema Tiers 2026
 * Crea/actualiza la configuración singleton de precios del sistema
 *
 * Tiers:
 * - Arcade: $30,000/mes - 1 mundo async, sin docente
 * - Arcade+: $60,000/mes - 3 mundos async, sin docente
 * - Pro: $75,000/mes - 1 mundo async + 1 mundo sync con docente
 *
 * Descuentos familiares:
 * - 2do hermano: 12% de descuento
 * - 3er hermano en adelante: 20% de descuento
 */
export async function seedConfiguracionPrecios(prisma: PrismaClient) {
  console.log(
    '💰 Creando/actualizando configuración de precios (Tiers 2026)...',
  );

  const configuracion = await prisma.configuracionPrecios.upsert({
    where: { id: 'singleton' },
    update: {
      // Actualizar precios de Tiers si cambian
      precio_arcade: 30000.0,
      precio_arcade_plus: 60000.0,
      precio_pro: 75000.0,
      // Descuentos familiares
      descuento_hermano_2: 12.0,
      descuento_hermano_3_mas: 20.0,
    },
    create: {
      id: 'singleton',

      // Precios por Tier (Sistema 2026)
      precio_arcade: 30000.0,
      precio_arcade_plus: 60000.0,
      precio_pro: 75000.0,

      // Descuentos familiares
      descuento_hermano_2: 12.0, // 12% segundo hermano
      descuento_hermano_3_mas: 20.0, // 20% tercer hermano en adelante

      // Configuración de notificaciones
      dia_vencimiento: 15,
      dias_antes_recordatorio: 5,
      notificaciones_activas: true,
    },
  });

  console.log('   ✅ Configuración de precios inicializada (Tiers 2026):');
  console.log(
    `      - Arcade: $${configuracion.precio_arcade.toNumber().toLocaleString('es-AR')}/mes`,
  );
  console.log(
    `      - Arcade+: $${configuracion.precio_arcade_plus.toNumber().toLocaleString('es-AR')}/mes`,
  );
  console.log(
    `      - Pro: $${configuracion.precio_pro.toNumber().toLocaleString('es-AR')}/mes`,
  );
  console.log(
    `      - Descuento 2do hermano: ${configuracion.descuento_hermano_2.toNumber()}%`,
  );
  console.log(
    `      - Descuento 3er+ hermano: ${configuracion.descuento_hermano_3_mas.toNumber()}%`,
  );
  console.log(
    `      - Día de vencimiento: ${configuracion.dia_vencimiento} de cada mes`,
  );
  console.log(
    `      - Notificaciones: ${configuracion.notificaciones_activas ? 'Activas' : 'Inactivas'}\n`,
  );
}
