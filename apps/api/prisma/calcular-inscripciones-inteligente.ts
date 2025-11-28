/**
 * CÁLCULO INTELIGENTE DE INSCRIPCIONES MENSUALES
 * Aplica descuentos por hermanos y múltiples actividades automáticamente
 */

import { PrismaClient, TipoDescuento } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('💰 Calculando inscripciones mensuales con descuentos...\n');

  const periodo = '2025-11';
  const [anio, mes] = periodo.split('-').map(Number);

  // Obtener producto Club Matemáticas
  const productoClub = await prisma.producto.findFirst({
    where: { nombre: { contains: 'Club' }, activo: true },
  });

  if (!productoClub) {
    console.error('❌ No se encontró el producto Club Matemáticas');
    return;
  }

  // Obtener configuración de precios
  const config = await prisma.configuracionPrecios.findFirst();
  if (!config) {
    console.error('❌ No se encontró configuración de precios');
    return;
  }

  // Agrupar estudiantes por tutor
  const tutores = await prisma.tutor.findMany({
    include: {
      estudiantes: {
        include: {
          inscripciones_clase_grupo: {
            include: {
              claseGrupo: true,
            },
          },
        },
      },
    },
  });

  console.log(`👨‍👩‍👧 Total tutores: ${tutores.length}\n`);

  let totalInscripciones = 0;
  let totalRecaudacion = 0;

  // Borrar inscripciones existentes
  await prisma.inscripcionMensual.deleteMany({ where: { periodo } });

  // Definir grupos presenciales y sus precios
  const gruposPresenciales = new Map<string, number>([
    ['B2-LUNES-19:00-AYELEN', 60000],
    ['L4-LUNES-17:00-ALEXIS', 75000],
    ['PROG-VID-VIERNES-19:30', 60000],
  ]);

  for (const tutor of tutores) {
    const estudiantes = tutor.estudiantes;
    if (estudiantes.length === 0) continue;

    const numEstudiantes = estudiantes.length;
    const esHermanos = numEstudiantes > 1;

    console.log(`\n📋 Tutor: ${tutor.nombre} ${tutor.apellido}`);
    console.log(`   Estudiantes: ${numEstudiantes}`);

    for (const estudiante of estudiantes) {
      const numActividades = estudiante.inscripciones_clase_grupo.length;

      let precioFinal: number;
      let tipoDescuento: TipoDescuento;
      let detalleCalculo: string;

      if (numActividades === 0) {
        // Sin actividades, no se crea inscripción
        continue;
      }

      // Verificar si el estudiante tiene actividades presenciales
      const actividadPresencial = estudiante.inscripciones_clase_grupo.find(
        (i) => gruposPresenciales.has(i.claseGrupo.codigo),
      );

      // LÓGICA DE PRECIOS
      if (actividadPresencial) {
        // ESTUDIANTE PRESENCIAL - No aplican descuentos por hermanos
        const precioPresencial = gruposPresenciales.get(
          actividadPresencial.claseGrupo.codigo,
        )!;
        const actividadesVirtuales =
          estudiante.inscripciones_clase_grupo.filter(
            (i) => !gruposPresenciales.has(i.claseGrupo.codigo),
          );
        const numVirtuales = actividadesVirtuales.length;

        if (numVirtuales === 0) {
          // Solo actividad presencial
          precioFinal = precioPresencial;
          tipoDescuento = TipoDescuento.NINGUNO;
          detalleCalculo = `Presencial (${actividadPresencial.claseGrupo.codigo}): $${precioPresencial.toLocaleString()}`;
        } else {
          // Presencial + virtuales: precio presencial + $44,000 por cada virtual
          const costoVirtuales = numVirtuales * 44000;
          precioFinal = precioPresencial + costoVirtuales;
          tipoDescuento = TipoDescuento.NINGUNO;
          detalleCalculo = `Presencial (${actividadPresencial.claseGrupo.codigo}): $${precioPresencial.toLocaleString()} + ${numVirtuales} virtual(es) × $44,000 = $${precioFinal.toLocaleString()}`;
        }
      } else if (!esHermanos && numActividades === 1) {
        // Caso 1: Un solo estudiante, una actividad virtual
        precioFinal = 50000;
        tipoDescuento = TipoDescuento.NINGUNO;
        detalleCalculo = 'Estudiante único - 1 actividad: $50,000';
      } else if (!esHermanos && numActividades > 1) {
        // Caso 2: Un solo estudiante, múltiples actividades virtuales
        precioFinal = 44000 * numActividades;
        tipoDescuento = TipoDescuento.MULTIPLE_ACTIVIDADES;
        detalleCalculo = `Estudiante único - ${numActividades} actividades: ${numActividades} × $44,000 = $${precioFinal.toLocaleString()}`;
      } else if (esHermanos && numActividades === 1) {
        // Caso 3: Hermanos, una actividad cada uno
        precioFinal = 44000;
        tipoDescuento = TipoDescuento.HERMANOS_BASICO;
        detalleCalculo = `Hermanos (${numEstudiantes}) - 1 actividad: $44,000`;
      } else {
        // Caso 4: Hermanos, múltiples actividades
        precioFinal = 38000 * numActividades;
        tipoDescuento = TipoDescuento.HERMANOS_MULTIPLE;
        detalleCalculo = `Hermanos (${numEstudiantes}) - ${numActividades} actividades: ${numActividades} × $38,000 = $${precioFinal.toLocaleString()}`;
      }

      const descuentoAplicado = Number(productoClub.precio) - precioFinal;

      // Crear inscripción mensual
      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          producto_id: productoClub.id,
          tutor_id: tutor.id,
          periodo,
          anio,
          mes,
          precio_base: productoClub.precio,
          descuento_aplicado: descuentoAplicado,
          precio_final: precioFinal,
          tipo_descuento: tipoDescuento,
          estado_pago: 'Pendiente',
          detalle_calculo: detalleCalculo,
        },
      });

      console.log(
        `   ✓ ${estudiante.nombre} ${estudiante.apellido}: $${precioFinal.toLocaleString()}`,
      );
      console.log(
        `      → ${numActividades} actividad(es): ${estudiante.inscripciones_clase_grupo.map((i) => i.claseGrupo.codigo).join(', ')}`,
      );

      totalInscripciones++;
      totalRecaudacion += precioFinal;
    }
  }

  console.log('\n========================================');
  console.log('✅ INSCRIPCIONES CALCULADAS');
  console.log('========================================');
  console.log(`📝 Total inscripciones: ${totalInscripciones}`);
  console.log(`💵 Total a recaudar: $${totalRecaudacion.toLocaleString()}`);
  console.log(`📅 Periodo: ${periodo}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
