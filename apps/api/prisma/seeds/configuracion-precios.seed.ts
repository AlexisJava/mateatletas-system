import { PrismaClient } from '@prisma/client';

/**
 * Seed: Configuración de Precios
 * Crea/actualiza la configuración singleton de precios del sistema
 *
 * Esta configuración es ESENCIAL para el funcionamiento del módulo de pagos
 * Valores por defecto según DISEÑO_SISTEMA_PRECIOS.md
 */
export async function seedConfiguracionPrecios(prisma: PrismaClient) {
  console.log('💰 Creando/actualizando configuración de precios...');

  const configuracion = await prisma.configuracionPrecios.upsert({
    where: { id: 'singleton' },
    update: {
      // En update solo actualizamos si es necesario
      // No sobrescribimos valores que el admin pudo haber cambiado
    },
    create: {
      id: 'singleton',

      // Precios base por tipo de producto
      precio_club_matematicas: 50000.0,
      precio_cursos_especializados: 55000.0,

      // Precios con descuentos configurables
      precio_multiple_actividades: 44000.0,
      precio_hermanos_basico: 44000.0,
      precio_hermanos_multiple: 38000.0,

      // Descuento AACREA
      descuento_aacrea_porcentaje: 20.0,
      descuento_aacrea_activo: true,

      // Configuración de notificaciones
      dia_vencimiento: 15,
      dias_antes_recordatorio: 5,
      notificaciones_activas: true,
    },
  });

  console.log('   ✅ Configuración de precios inicializada:');
  console.log(
    `      - Club Matemáticas: $${configuracion.precio_club_matematicas.toNumber().toLocaleString('es-AR')}`,
  );
  console.log(
    `      - Cursos Especializados: $${configuracion.precio_cursos_especializados.toNumber().toLocaleString('es-AR')}`,
  );
  console.log(
    `      - Múltiples actividades: $${configuracion.precio_multiple_actividades.toNumber().toLocaleString('es-AR')}`,
  );
  console.log(
    `      - Hermanos básico: $${configuracion.precio_hermanos_basico.toNumber().toLocaleString('es-AR')}`,
  );
  console.log(
    `      - Hermanos múltiple: $${configuracion.precio_hermanos_multiple.toNumber().toLocaleString('es-AR')}`,
  );
  console.log(
    `      - Descuento AACREA: ${configuracion.descuento_aacrea_porcentaje.toNumber()}%`,
  );
  console.log(
    `      - Día de vencimiento: ${configuracion.dia_vencimiento} de cada mes`,
  );
  console.log(
    `      - Notificaciones: ${configuracion.notificaciones_activas ? 'Activas' : 'Inactivas'}\n`,
  );
}
