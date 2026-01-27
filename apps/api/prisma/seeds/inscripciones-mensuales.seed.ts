import { PrismaClient, EstadoPago, TipoDescuento } from '@prisma/client';

export async function seedInscripcionesMensuales(prisma: PrismaClient) {
  console.log('\n💳 Creando inscripciones mensuales de prueba...');

  // Buscar el tutor de prueba (María García)
  const tutor = await prisma.tutor.findFirst({
    where: {
      email: 'maria.garcia@tutor.com',
    },
    include: {
      estudiantes: true,
    },
  });

  if (!tutor) {
    console.log(
      '⚠️  No se encontró el tutor de prueba, saltando inscripciones...',
    );
    return;
  }

  if (tutor.estudiantes.length === 0) {
    console.log('⚠️  El tutor no tiene estudiantes, saltando inscripciones...');
    return;
  }

  console.log(`   📋 Tutor: ${tutor.nombre} ${tutor.apellido}`);
  console.log(`   👥 Estudiantes: ${tutor.estudiantes.length}`);

  // Buscar productos existentes (suscripción mensual)
  const productoMensual = await prisma.producto.findFirst({
    where: {
      nombre: { contains: 'Suscripción Mensual' },
    },
  });

  if (!productoMensual) {
    console.log('⚠️  No se encontró producto de suscripción mensual');
    return;
  }

  console.log(
    `   🛒 Producto: ${productoMensual.nombre} ($${productoMensual.precio})`,
  );

  // Crear inscripciones para cada hijo
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1; // 1-12
  const anioActual = fechaActual.getFullYear();

  for (const estudiante of tutor.estudiantes) {
    // Crear inscripción del mes actual (pendiente)
    const periodoActual = `${anioActual}-${mesActual.toString().padStart(2, '0')}`;

    const inscripcionActual = await prisma.inscripcionMensual.upsert({
      where: {
        estudianteId_productoId_periodo: {
          estudianteId: estudiante.id,
          productoId: productoMensual.id,
          periodo: periodoActual,
        },
      },
      update: {},
      create: {
        estudianteId: estudiante.id,
        productoId: productoMensual.id,
        tutorId: tutor.id,
        anio: anioActual,
        mes: mesActual,
        periodo: periodoActual,
        precioBase: productoMensual.precio,
        descuento_aplicado: 0,
        precio_final: productoMensual.precio,
        tipo_descuento: TipoDescuento.NINGUNO,
        detalle_calculo: 'Precio base sin descuentos aplicables',
        estadoPago: EstadoPago.Pendiente,
      },
    });

    console.log(
      `   ✅ ${estudiante.nombre} - ${mesActual}/${anioActual}: $${inscripcionActual.precio_final} (${inscripcionActual.estadoPago})`,
    );

    // Crear inscripción del mes pasado (vencida) para probar alertas
    const mesPasado = mesActual === 1 ? 12 : mesActual - 1;
    const anioPasado = mesActual === 1 ? anioActual - 1 : anioActual;
    const periodoPasado = `${anioPasado}-${mesPasado.toString().padStart(2, '0')}`;

    const inscripcionVencida = await prisma.inscripcionMensual.upsert({
      where: {
        estudianteId_productoId_periodo: {
          estudianteId: estudiante.id,
          productoId: productoMensual.id,
          periodo: periodoPasado,
        },
      },
      update: {},
      create: {
        estudianteId: estudiante.id,
        productoId: productoMensual.id,
        tutorId: tutor.id,
        anio: anioPasado,
        mes: mesPasado,
        periodo: periodoPasado,
        precioBase: productoMensual.precio,
        descuento_aplicado: 0,
        precio_final: productoMensual.precio,
        tipo_descuento: TipoDescuento.NINGUNO,
        detalle_calculo: 'Precio base sin descuentos aplicables',
        estadoPago: EstadoPago.Vencido,
      },
    });

    console.log(
      `   ⚠️  ${estudiante.nombre} - ${mesPasado}/${anioPasado}: $${inscripcionVencida.precio_final} (${inscripcionVencida.estadoPago})`,
    );
  }

  console.log('✅ Inscripciones mensuales creadas');
}
