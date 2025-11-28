/**
 * ACTUALIZAR CONFIGURACIÓN DE PRECIOS
 * Establece los precios correctos de Mateatletas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('💰 Actualizando configuración de precios...\n');

  // 1. ACTUALIZAR CONFIGURACIÓN GENERAL
  const config = await prisma.configuracionPrecios.upsert({
    where: { id: 'singleton' },
    update: {
      precio_club_matematicas: 50000,
      precio_cursos_especializados: 55000,
      precio_multiple_actividades: 44000,
      precio_hermanos_basico: 44000,
      precio_hermanos_multiple: 38000,
      descuento_aacrea_porcentaje: 20,
      descuento_aacrea_activo: true,
      dia_vencimiento: 15,
      notificaciones_activas: true,
    },
    create: {
      id: 'singleton',
      precio_club_matematicas: 50000,
      precio_cursos_especializados: 55000,
      precio_multiple_actividades: 44000,
      precio_hermanos_basico: 44000,
      precio_hermanos_multiple: 38000,
      descuento_aacrea_porcentaje: 20,
      descuento_aacrea_activo: true,
      dia_vencimiento: 15,
      notificaciones_activas: true,
    },
  });

  console.log('✅ Configuración general actualizada:');
  console.log(`   • Club Matemáticas: $${config.precio_club_matematicas}`);
  console.log(
    `   • Cursos Especializados: $${config.precio_cursos_especializados}`,
  );
  console.log(
    `   • Múltiples actividades: $${config.precio_multiple_actividades}`,
  );
  console.log(`   • Hermanos básico: $${config.precio_hermanos_basico}`);
  console.log(`   • Hermanos múltiple: $${config.precio_hermanos_multiple}`);
  console.log(
    `   • Descuento altas capacidades (AACREA): ${config.descuento_aacrea_porcentaje}%`,
  );
  console.log(`   • Día de vencimiento: ${config.dia_vencimiento}\n`);

  // 2. ACTUALIZAR PRODUCTOS
  console.log('📦 Actualizando productos...\n');

  // Producto principal: Club Matemáticas
  const clubMate = await prisma.producto.findFirst({
    where: { nombre: { contains: 'Club' } },
  });

  if (clubMate) {
    await prisma.producto.update({
      where: { id: clubMate.id },
      data: { precio: 50000 },
    });
    console.log('   ✓ Club Matemáticas: $50,000');
  }

  // Cursos especializados
  await prisma.producto.updateMany({
    where: { tipo: 'Curso' },
    data: { precio: 55000 },
  });
  console.log('   ✓ Cursos especializados: $55,000');

  // Eliminar o actualizar producto de suscripción mensual viejo
  await prisma.producto.updateMany({
    where: { nombre: 'Suscripción Mensual Mateatletas' },
    data: { activo: false }, // Lo desactivamos
  });

  console.log('\n========================================');
  console.log('✅ PRECIOS ACTUALIZADOS CORRECTAMENTE');
  console.log('========================================\n');

  console.log('📋 RESUMEN DE PRECIOS:');
  console.log('   • Club Matemáticas: $50,000/mes');
  console.log('   • Cursos Especializados: $55,000/mes');
  console.log('   • Múltiples actividades: $44,000/mes por actividad');
  console.log('   • Hermanos (1 actividad): $44,000/mes c/u');
  console.log('   • Hermanos (múltiples): $38,000/mes c/u por actividad');
  console.log('   • Descuento altas capacidades: 20%\n');
}

main()
  .catch((e) => {
    console.error('❌ Error actualizando precios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
