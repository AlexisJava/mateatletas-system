import { PrismaClient } from '@prisma/client';

/**
 * Seed: Configuración de Precios - Sistema STEAM 2026
 * Crea/actualiza la configuración singleton de precios del sistema
 *
 * Tiers STEAM:
 * - STEAM_LIBROS: $40,000/mes - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65,000/mes - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95,000/mes - Todo + clases en vivo con docente
 *
 * Descuento familiar simplificado:
 * - 10% para segundo hermano en adelante
 */
export async function seedConfiguracionPrecios(prisma: PrismaClient) {
  console.log(
    '💰 Creando/actualizando configuración de precios (STEAM 2026)...',
  );

  const configuracion = await prisma.configuracionPrecios.upsert({
    where: { id: 'singleton' },
    update: {
      // Actualizar precios de Tiers STEAM
      precio_steam_libros: 40000.0,
      precio_steam_asincronico: 65000.0,
      precio_steam_sincronico: 95000.0,
      // Descuento familiar simplificado
      descuento_segundo_hermano: 10.0,
    },
    create: {
      id: 'singleton',

      // Precios por Tier STEAM (Sistema 2026)
      precio_steam_libros: 40000.0,
      precio_steam_asincronico: 65000.0,
      precio_steam_sincronico: 95000.0,

      // Descuento familiar simplificado
      descuento_segundo_hermano: 10.0, // 10% para 2do hermano en adelante

      // Configuración de notificaciones
      dia_vencimiento: 15,
      dias_antes_recordatorio: 5,
      notificaciones_activas: true,
    },
  });

  console.log('   ✅ Configuración de precios inicializada (STEAM 2026):');
  console.log(
    `      - STEAM Libros: $${configuracion.precio_steam_libros.toNumber().toLocaleString('es-AR')}/mes`,
  );
  console.log(
    `      - STEAM Asincrónico: $${configuracion.precio_steam_asincronico.toNumber().toLocaleString('es-AR')}/mes`,
  );
  console.log(
    `      - STEAM Sincrónico: $${configuracion.precio_steam_sincronico.toNumber().toLocaleString('es-AR')}/mes`,
  );
  console.log(
    `      - Descuento 2do hermano: ${configuracion.descuento_segundo_hermano.toNumber()}%`,
  );
  console.log(
    `      - Día de vencimiento: ${configuracion.dia_vencimiento} de cada mes`,
  );
  console.log(
    `      - Notificaciones: ${configuracion.notificaciones_activas ? 'Activas' : 'Inactivas'}\n`,
  );
}
