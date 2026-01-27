import {
  PrismaClient,
  EstadoPago,
  TipoDescuento,
  EstadoInscripcionComision,
  EstadoAccesoEstudiante,
  TipoProducto,
  TipoAccesoInscripcion,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  calcularDescuentoFamiliar,
  calcularPrecioConDescuento,
} from '../../src/suscripciones/domain/constants/descuento-familiar.constants';

/**
 * Seed: Tutor Familia Numerosa - Edge Cases Completos
 *
 * Crea un tutor con 6 hijos que cubren TODOS los edge cases:
 * 1. Valentina (8 años) - Casa QUANTUM, Tier LIBROS, 0% descuento (1er hijo)
 * 2. Mateo (11 años) - Casa VERTEX, Tier ASINCRONICO, 10% descuento
 * 3. Joaquín (14 años) - Casa PULSAR, Tier SINCRONICO, 10% descuento
 * 4. Camila (7 años) - Casa QUANTUM, múltiples actividades (2 cursos), 10% descuento
 * 5. Tomás (12 años) - Casa VERTEX, pago VENCIDO, SUSPENDIDO, 10% descuento
 * 6. Isabella (15 años) - Casa PULSAR, inscripción LISTA_ESPERA, BECA, 10% descuento
 *
 * Descuento familiar: 10% FIJO para 2do hijo en adelante (NO acumulativo)
 */
export async function seedTutorFamilia(prisma: PrismaClient) {
  console.log(
    '👨‍👩‍👧‍👦 Creando tutor con familia numerosa (6 hijos - edge cases)...\n',
  );

  const email = 'roberto.martinez@tutor.com';
  const rawPassword = 'Familia123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 1. Crear el tutor
  const tutor = await prisma.tutor.upsert({
    where: { email },
    update: { passwordHash: hashedPassword },
    create: {
      email,
      passwordHash: hashedPassword,
      nombre: 'Roberto',
      apellido: 'Martínez',
      telefono: '+549261987654',
      dni: '28654321',
      cuil: '20-28654321-9',
    },
  });

  console.log(`   ✅ Tutor: ${tutor.nombre} ${tutor.apellido}`);
  console.log(`      Email: ${email}`);
  console.log(`      Password: ${rawPassword}\n`);

  // 2. Obtener casas (case-insensitive para mayor robustez)
  const casas = await prisma.casa.findMany();
  const casaQuantum = casas.find((c) => c.nombre.toUpperCase() === 'QUANTUM');
  const casaVertex = casas.find((c) => c.nombre.toUpperCase() === 'VERTEX');
  const casaPulsar = casas.find((c) => c.nombre.toUpperCase() === 'PULSAR');

  if (!casaQuantum || !casaVertex || !casaPulsar) {
    console.log('⚠️  Casas no encontradas. Ejecutar seed de casas primero.');
    return;
  }

  // 3. Obtener planes
  const planes = await prisma.planSuscripcion.findMany();
  const planLibros = planes.find((p) => p.nombre === 'STEAM_LIBROS');
  const planAsincronico = planes.find((p) => p.nombre === 'STEAM_ASINCRONICO');
  const planSincronico = planes.find((p) => p.nombre === 'STEAM_SINCRONICO');

  if (!planLibros || !planAsincronico || !planSincronico) {
    console.log('⚠️  Planes no encontrados. Ejecutar seed de planes primero.');
    return;
  }

  // 4. Crear producto adicional para múltiples actividades
  const tallerId = 'seed-taller-robotica';
  const tallerRobotica = await prisma.producto.upsert({
    where: { id: tallerId },
    update: {},
    create: {
      id: tallerId,
      nombre: 'Taller de Robótica STEAM',
      descripcion: 'Taller práctico de robótica y programación con Arduino',
      precio: 8000,
      tipo: TipoProducto.Servicio,
      activo: true,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 meses
      cupoMaximo: 15,
    },
  });

  // 5. Crear comisiones de ejemplo (para inscripciones a actividades)
  const docente = await prisma.docente.findFirst();

  const comisionQuantum = await prisma.comision.upsert({
    where: { id: 'seed-comision-quantum' },
    update: {},
    create: {
      id: 'seed-comision-quantum',
      nombre: 'Robótica QUANTUM - Mañana',
      productoId: tallerRobotica.id,
      docenteId: docente?.id,
      casa_id: casaQuantum.id,
      horario: 'Martes y Jueves 10:00-12:00',
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      cupoMaximo: 15,
      activo: true,
      modalidad: TipoAccesoInscripcion.SINCRONICO,
    },
  });

  const comisionVertex = await prisma.comision.upsert({
    where: { id: 'seed-comision-vertex' },
    update: {},
    create: {
      id: 'seed-comision-vertex',
      nombre: 'Robótica VERTEX - Tarde',
      productoId: tallerRobotica.id,
      docenteId: docente?.id,
      casa_id: casaVertex.id,
      horario: 'Lunes y Miércoles 15:00-17:00',
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      cupoMaximo: 15,
      activo: true,
      modalidad: TipoAccesoInscripcion.SINCRONICO,
    },
  });

  const comisionPulsar = await prisma.comision.upsert({
    where: { id: 'seed-comision-pulsar' },
    update: {},
    create: {
      id: 'seed-comision-pulsar',
      nombre: 'Robótica PULSAR - Avanzado',
      productoId: tallerRobotica.id,
      docenteId: docente?.id,
      casa_id: casaPulsar.id,
      horario: 'Viernes 14:00-18:00',
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      cupoMaximo: 12,
      activo: true,
      modalidad: TipoAccesoInscripcion.SINCRONICO,
    },
  });

  // 6. Definir los 6 hijos con edge cases
  interface HijoConfig {
    nombre: string;
    apellido: string;
    edad: number;
    nivelEscolar: string;
    email: string;
    username: string;
    planId: string;
    casaId: string;
    estadoAcceso: EstadoAccesoEstudiante;
    estadoPago: EstadoPago;
    estadoComision?: EstadoInscripcionComision;
    comisionId?: string;
    multipleCursos?: boolean;
    esOverride?: boolean;
    notasPlan?: string;
  }

  const hijos: HijoConfig[] = [
    {
      nombre: 'Valentina',
      apellido: 'Martínez',
      edad: 8,
      nivelEscolar: 'Primaria - 3er grado',
      email: 'valentina.martinez@email.com',
      username: 'valentina.martinez',
      planId: planLibros.id,
      casaId: casaQuantum.id,
      estadoAcceso: EstadoAccesoEstudiante.ACTIVO,
      estadoPago: EstadoPago.Pagado,
      estadoComision: EstadoInscripcionComision.Confirmada,
      comisionId: comisionQuantum.id,
    },
    {
      nombre: 'Mateo',
      apellido: 'Martínez',
      edad: 11,
      nivelEscolar: 'Primaria - 6to grado',
      email: 'mateo.martinez@email.com',
      username: 'mateo.martinez',
      planId: planAsincronico.id,
      casaId: casaVertex.id,
      estadoAcceso: EstadoAccesoEstudiante.ACTIVO,
      estadoPago: EstadoPago.Pagado,
      estadoComision: EstadoInscripcionComision.Confirmada,
      comisionId: comisionVertex.id,
    },
    {
      nombre: 'Joaquín',
      apellido: 'Martínez',
      edad: 14,
      nivelEscolar: 'Secundaria - 2do año',
      email: 'joaquin.martinez@email.com',
      username: 'joaquin.martinez',
      planId: planSincronico.id,
      casaId: casaPulsar.id,
      estadoAcceso: EstadoAccesoEstudiante.ACTIVO,
      estadoPago: EstadoPago.Pendiente,
      estadoComision: EstadoInscripcionComision.Confirmada,
      comisionId: comisionPulsar.id,
    },
    {
      nombre: 'Camila',
      apellido: 'Martínez',
      edad: 7,
      nivelEscolar: 'Primaria - 2do grado',
      email: 'camila.martinez@email.com',
      username: 'camila.martinez',
      planId: planSincronico.id,
      casaId: casaQuantum.id,
      estadoAcceso: EstadoAccesoEstudiante.ACTIVO,
      estadoPago: EstadoPago.Parcial,
      multipleCursos: true, // Inscripta en 2 actividades
      estadoComision: EstadoInscripcionComision.Confirmada,
      comisionId: comisionQuantum.id,
    },
    {
      nombre: 'Tomás',
      apellido: 'Martínez',
      edad: 12,
      nivelEscolar: 'Secundaria - 1er año',
      email: 'tomas.martinez@email.com',
      username: 'tomas.martinez',
      planId: planAsincronico.id,
      casaId: casaVertex.id,
      estadoAcceso: EstadoAccesoEstudiante.SUSPENDIDO, // Edge: Suspendido
      estadoPago: EstadoPago.Vencido, // Edge: Pago vencido
      estadoComision: EstadoInscripcionComision.Cancelada,
      comisionId: comisionVertex.id,
      notasPlan: 'Suspendido por falta de pago - 3 meses de mora',
    },
    {
      nombre: 'Isabella',
      apellido: 'Martínez',
      edad: 15,
      nivelEscolar: 'Secundaria - 3er año',
      email: 'isabella.martinez@email.com',
      username: 'isabella.martinez',
      planId: planSincronico.id,
      casaId: casaPulsar.id,
      estadoAcceso: EstadoAccesoEstudiante.BECA, // Edge: Beca
      estadoPago: EstadoPago.Pagado,
      estadoComision: EstadoInscripcionComision.ListaEspera, // Edge: Lista espera
      comisionId: comisionPulsar.id,
      esOverride: true,
      notasPlan: 'Beca completa - Olimpiadas de Matemática 2025',
    },
  ];

  const studentPassword = 'Student123!';
  const studentPasswordHash = await bcrypt.hash(studentPassword, 10);

  console.log('   ═══════════════════════════════════════════════════════════');
  console.log('   👥 CREANDO ESTUDIANTES (EDGE CASES):');
  console.log(
    '   ═══════════════════════════════════════════════════════════\n',
  );

  const estudiantesCreados: Array<{
    estudiante: Awaited<ReturnType<typeof prisma.estudiante.create>>;
    numeroHijo: number;
    descuentoPorcentaje: number;
    precioFinal: number;
    tipoDescuento: TipoDescuento;
    config: HijoConfig;
  }> = [];

  for (const [index, hijo] of hijos.entries()) {
    const numeroHijo = index + 1;
    const plan = planes.find((p) => p.id === hijo.planId);
    const precioBase = Number(plan?.precioBase ?? 0);

    // Calcular descuento usando lógica real
    const descuentoPorcentaje = calcularDescuentoFamiliar(numeroHijo);
    const resultado = calcularPrecioConDescuento(precioBase, numeroHijo);

    // Determinar tipo de descuento para enum
    let tipoDescuento: TipoDescuento;
    if (descuentoPorcentaje === 0) {
      tipoDescuento = TipoDescuento.NINGUNO;
    } else if (descuentoPorcentaje <= 10) {
      tipoDescuento = TipoDescuento.HERMANO_2;
    } else {
      tipoDescuento = TipoDescuento.HERMANO_3_MAS;
    }

    // Crear estudiante
    const estudiante = await prisma.estudiante.upsert({
      where: { email: hijo.email },
      update: {
        planId: hijo.planId,
        casaId: hijo.casaId,
        estado_acceso: hijo.estadoAcceso,
        notas_plan: hijo.notasPlan,
        acceso_override: hijo.esOverride ?? false,
        acceso_override_motivo: hijo.esOverride
          ? 'Beca completa por mérito académico'
          : undefined,
      },
      create: {
        username: hijo.username,
        nombre: hijo.nombre,
        apellido: hijo.apellido,
        edad: hijo.edad,
        nivelEscolar: hijo.nivelEscolar,
        email: hijo.email,
        passwordHash: studentPasswordHash,
        tutorId: tutor.id,
        planId: hijo.planId,
        casaId: hijo.casaId,
        estado_acceso: hijo.estadoAcceso,
        notas_plan: hijo.notasPlan,
        acceso_override: hijo.esOverride ?? false,
        acceso_override_motivo: hijo.esOverride
          ? 'Beca completa por mérito académico'
          : undefined,
      },
    });

    // Crear RecursosEstudiante con XP variado
    const xpVariado = 500 + index * 1000 + Math.floor(Math.random() * 2000);
    await prisma.recursosEstudiante.upsert({
      where: { estudianteId: estudiante.id },
      update: { xpTotal: xpVariado },
      create: {
        estudianteId: estudiante.id,
        xpTotal: xpVariado,
      },
    });

    // Crear RachaEstudiante
    await prisma.rachaEstudiante.upsert({
      where: { estudianteId: estudiante.id },
      update: {},
      create: {
        estudianteId: estudiante.id,
        racha_actual: Math.floor(Math.random() * 20),
        racha_maxima: 15 + Math.floor(Math.random() * 30),
        total_dias_activos: 20 + Math.floor(Math.random() * 80),
      },
    });

    // Crear inscripción a comisión si tiene
    if (hijo.comisionId && hijo.estadoComision) {
      await prisma.inscripcionComision.upsert({
        where: {
          comision_id_estudianteId: {
            comision_id: hijo.comisionId,
            estudianteId: estudiante.id,
          },
        },
        update: { estado: hijo.estadoComision },
        create: {
          comision_id: hijo.comisionId,
          estudianteId: estudiante.id,
          estado: hijo.estadoComision,
          notas:
            hijo.estadoComision === EstadoInscripcionComision.ListaEspera
              ? 'En espera de cupo disponible'
              : undefined,
        },
      });
    }

    // Si tiene múltiples cursos, agregar otra inscripción
    if (hijo.multipleCursos) {
      // También inscribir al curso de Álgebra
      const cursoAlgebra = await prisma.producto.findFirst({
        where: { nombre: { contains: 'Álgebra' } },
      });
      if (cursoAlgebra) {
        const comisionAlgebra = await prisma.comision.upsert({
          where: { id: 'seed-comision-algebra-quantum' },
          update: {},
          create: {
            id: 'seed-comision-algebra-quantum',
            nombre: 'Álgebra QUANTUM - Refuerzo',
            productoId: cursoAlgebra.id,
            docenteId: docente?.id,
            casa_id: casaQuantum.id,
            horario: 'Sábados 10:00-12:00',
            cupoMaximo: 20,
            activo: true,
            modalidad: TipoAccesoInscripcion.SINCRONICO,
          },
        });

        await prisma.inscripcionComision.upsert({
          where: {
            comision_id_estudianteId: {
              comision_id: comisionAlgebra.id,
              estudianteId: estudiante.id,
            },
          },
          update: {},
          create: {
            comision_id: comisionAlgebra.id,
            estudianteId: estudiante.id,
            estado: EstadoInscripcionComision.Confirmada,
            notas: 'Inscripción adicional - Refuerzo matemático',
          },
        });
      }
    }

    estudiantesCreados.push({
      estudiante,
      numeroHijo,
      descuentoPorcentaje,
      precioFinal: resultado.precioFinal,
      tipoDescuento,
      config: hijo,
    });

    const casaNombre = casas.find((c) => c.id === hijo.casaId)?.nombre;
    const planNombre = plan?.nombre ?? 'Sin plan';

    console.log(`   ${numeroHijo}. ${hijo.nombre} (${hijo.edad} años)`);
    console.log(`      Casa: ${casaNombre} | Plan: ${planNombre}`);
    console.log(
      `      Estado: ${hijo.estadoAcceso} | Pago: ${hijo.estadoPago}`,
    );
    console.log(`      Descuento: ${descuentoPorcentaje}%`);
    console.log(
      `      Precio: $${precioBase} → $${resultado.precioFinal} (ahorro: $${resultado.descuentoMonto})`,
    );
    if (hijo.multipleCursos) {
      console.log(`      📚 MÚLTIPLES ACTIVIDADES (2 cursos)`);
    }
    if (hijo.estadoComision === EstadoInscripcionComision.ListaEspera) {
      console.log(`      ⏳ EN LISTA DE ESPERA`);
    }
    if (hijo.esOverride) {
      console.log(`      🎓 BECA ACTIVA`);
    }
    console.log(
      `      Login: ${hijo.username} | Password: ${studentPassword}\n`,
    );
  }

  // 7. Crear inscripciones mensuales
  const productoMensual = await prisma.producto.findFirst({
    where: { nombre: { contains: 'Suscripción Mensual' } },
  });

  if (!productoMensual) {
    console.log('⚠️  Producto mensual no encontrado.');
    return;
  }

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const anioActual = fechaActual.getFullYear();
  const periodoActual = `${anioActual}-${mesActual.toString().padStart(2, '0')}`;

  console.log('   ═══════════════════════════════════════════════════════════');
  console.log(`   💳 INSCRIPCIONES MENSUALES (${periodoActual}):`);
  console.log(
    '   ═══════════════════════════════════════════════════════════\n',
  );

  for (const {
    estudiante,
    numeroHijo,
    descuentoPorcentaje,
    precioFinal,
    tipoDescuento,
    config,
  } of estudiantesCreados) {
    const plan = planes.find((p) => p.id === config.planId);
    const precioBase = Number(plan?.precioBase ?? 0);

    const detalleCalculo =
      descuentoPorcentaje === 0
        ? `Precio base ${plan?.nombre} - Primer hijo (sin descuento)`
        : `Descuento familiar ${descuentoPorcentaje}% - Hijo N°${numeroHijo} (${plan?.nombre})`;

    await prisma.inscripcionMensual.upsert({
      where: {
        estudianteId_productoId_periodo: {
          estudianteId: estudiante.id,
          productoId: productoMensual.id,
          periodo: periodoActual,
        },
      },
      update: {
        precioBase: precioBase,
        descuento_aplicado: precioBase - precioFinal,
        precio_final: precioFinal,
        tipo_descuento: tipoDescuento,
        detalle_calculo: detalleCalculo,
        estadoPago: config.estadoPago,
      },
      create: {
        estudianteId: estudiante.id,
        productoId: productoMensual.id,
        tutorId: tutor.id,
        anio: anioActual,
        mes: mesActual,
        periodo: periodoActual,
        precioBase: precioBase,
        descuento_aplicado: precioBase - precioFinal,
        precio_final: precioFinal,
        tipo_descuento: tipoDescuento,
        detalle_calculo: detalleCalculo,
        estadoPago: config.estadoPago,
        observaciones: config.notasPlan,
      },
    });

    const statusIcon =
      config.estadoPago === EstadoPago.Pagado
        ? '✅'
        : config.estadoPago === EstadoPago.Pendiente
          ? '⏳'
          : config.estadoPago === EstadoPago.Vencido
            ? '🔴'
            : '🟡';

    console.log(
      `   ${statusIcon} ${estudiante.nombre}: $${precioFinal} (${config.estadoPago})`,
    );
  }

  // 8. Calcular resumen
  const resumenPorPlan = new Map<string, { count: number; total: number }>();
  for (const e of estudiantesCreados) {
    const plan = planes.find((p) => p.id === e.config.planId);
    const nombre = plan?.nombre ?? 'Sin plan';
    const existing = resumenPorPlan.get(nombre) ?? { count: 0, total: 0 };
    resumenPorPlan.set(nombre, {
      count: existing.count + 1,
      total: existing.total + e.precioFinal,
    });
  }

  const totalSinDescuento = estudiantesCreados.reduce((sum, e) => {
    const plan = planes.find((p) => p.id === e.config.planId);
    return sum + Number(plan?.precioBase ?? 0);
  }, 0);
  const totalConDescuento = estudiantesCreados.reduce(
    (sum, e) => sum + e.precioFinal,
    0,
  );
  const ahorroTotal = totalSinDescuento - totalConDescuento;

  console.log(
    '\n   ═══════════════════════════════════════════════════════════',
  );
  console.log('   📊 RESUMEN FAMILIA MARTÍNEZ:');
  console.log('   ═══════════════════════════════════════════════════════════');
  console.log(`   👥 Total hijos: ${estudiantesCreados.length}`);
  console.log(
    '   ─────────────────────────────────────────────────────────────',
  );
  for (const [planNombre, data] of resumenPorPlan) {
    console.log(`   📦 ${planNombre}: ${data.count} hijo(s) → $${data.total}`);
  }
  console.log(
    '   ─────────────────────────────────────────────────────────────',
  );
  console.log(`   💰 Total sin descuento:  $${totalSinDescuento}`);
  console.log(`   💰 Total con descuento:  $${totalConDescuento}`);
  console.log(`   🎉 Ahorro mensual:       $${ahorroTotal}`);
  console.log(
    '   ═══════════════════════════════════════════════════════════\n',
  );

  console.log('   📋 EDGE CASES CUBIERTOS:');
  console.log(
    '   ─────────────────────────────────────────────────────────────',
  );
  console.log('   ✓ Casa QUANTUM (6-9 años): Valentina, Camila');
  console.log('   ✓ Casa VERTEX (10-12 años): Mateo, Tomás');
  console.log('   ✓ Casa PULSAR (13-17 años): Joaquín, Isabella');
  console.log('   ✓ Tier LIBROS: Valentina');
  console.log('   ✓ Tier ASINCRONICO: Mateo, Tomás');
  console.log('   ✓ Tier SINCRONICO: Joaquín, Camila, Isabella');
  console.log('   ✓ Pago PAGADO: Valentina, Mateo, Isabella');
  console.log('   ✓ Pago PENDIENTE: Joaquín');
  console.log('   ✓ Pago PARCIAL: Camila');
  console.log('   ✓ Pago VENCIDO: Tomás');
  console.log('   ✓ Estado SUSPENDIDO: Tomás');
  console.log('   ✓ Estado BECA: Isabella');
  console.log('   ✓ LISTA_ESPERA: Isabella');
  console.log('   ✓ MÚLTIPLES ACTIVIDADES: Camila (2 cursos)');
  console.log('   ✓ Descuentos: 0% (1er hijo), 10% (2do+ hijos) - FIJO');
  console.log(
    '   ═══════════════════════════════════════════════════════════\n',
  );

  console.log(
    '✅ Tutor con familia numerosa (edge cases) creado exitosamente!\n',
  );
}
