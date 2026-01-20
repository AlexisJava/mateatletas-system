import {
  PrismaClient,
  CasaTipo,
  MundoTipo,
  TierNombre,
  DiaSemana,
  TipoAccesoInscripcion,
  EstadoInscripcionActividad,
  EstadoSuscripcionFamiliar,
  TipoDescuento,
  EstadoPago,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * ============================================================================
 * CLEAN SEED - Datos Mínimos para Testing
 * ============================================================================
 *
 * Este script:
 * 1. BORRA absolutamente todo de la base de datos
 * 2. Crea un escenario minimalista pero completo para testing
 *
 * ESCENARIO:
 * - 1 Admin (Super Admin)
 * - 1 Docente (Prof. García) con 3 ClaseGrupos (1 por casa)
 * - 1 Tutor (Familia López) con 3 hijos - TODOS SINCRÓNICOS:
 *   - Luna (8 años, QUANTUM, STEAM_SINCRONICO) - Lunes 18:00
 *   - Martín (11 años, VERTEX, STEAM_SINCRONICO) - Martes 19:00
 *   - Sofía (14 años, PULSAR, STEAM_SINCRONICO) - Miércoles 20:00
 *
 * CREDENCIALES (Password universal: Test123!):
 * - Admin: admin@mateatletas.com
 * - Docente: docente@mateatletas.com
 * - Tutor: tutor@mateatletas.com
 * - Estudiantes: luna.lopez, martin.lopez, sofia.lopez
 *
 * PORTALES CONECTADOS:
 * - /admin/* → Admin ve todo
 * - /docente/* → Prof. García ve sus 3 grupos con estudiantes inscritos
 * - /tutor/* → Familia López ve sus 3 hijos
 * - /estudiante-login/* → Cada estudiante ve su dashboard y clases
 *
 * Uso:
 *   cd apps/api && npx ts-node prisma/seeds/clean-seed.ts
 */

const PASSWORD = 'Test123!';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function cleanDatabase(prisma: PrismaClient) {
  console.log('🧹 Limpiando base de datos...\n');

  // Orden de borrado (respeta foreign keys)
  // Primero las tablas con más dependencias, luego las más independientes
  const tablesToClean = [
    // Nivel 1: Tablas con muchas foreign keys (hijas)
    'cambio_inscripcion',
    'inscripciones_actividad',
    'suscripciones_familiares',
    'pagos_curso',
    'pago_suscripcion',
    'historial_estado_suscripcion',
    'suscripciones',
    'seguimientos_observacion',
    'observaciones_estudiante',
    'observaciones',
    'progreso_tarea_estudiante',
    'progreso_clase_estudiante',
    'tareas_asignadas',
    'estado_clase_grupos',
    'asignaciones_planificacion',
    'tareas_clase',
    'clases_planificacion',
    'planificaciones',
    'asistencias_comision',
    'inscripciones_comision',
    'comisiones',
    'tareas_admin',
    'webhooks_failed',
    'colonia_pagos',
    'colonia_estudiante_cursos',
    'colonia_estudiantes',
    'colonia_inscripciones',
    'reacciones_feed',
    'actividades_feed',
    'racha_estudiantes',
    'logros_estudiante',
    'logros',
    'transacciones_recursos',
    'recursos_estudiante',
    'inscripciones_mensuales',
    'historial_cambio_precios',
    'configuracion_precios',
    'docentes_rutas',
    'rutas_especialidad',
    'notas',
    'recordatorios',
    'tareas',
    'eventos',
    'notificaciones',
    'puntos_obtenidos',
    'alertas',
    'asistencias',
    'inscripciones_clase',
    'asistencias_live',
    'asistencias_clase_grupo',
    'inscripciones_clase_grupo',
    'clase_grupos',
    'grupos',
    'clases',
    'progreso_contenidos',
    'nodos_contenido',
    'contenidos',
    'historial_acceso_estudiante',

    // Nivel 2: Tablas intermedias
    'docentes_casas',
    'docentes_mundos',
    'estudiantes',
    'planes_suscripcion',

    // Nivel 3: Tablas principales
    'tutores',
    'docentes',
    'admins',
    'productos',
    'sectores',
    'tiers',
    'mundos',
    'casas',

    // Nivel 4: Tablas de sistema
    'refresh_token_sessions',
    'password_reset_tokens',
    'login_attempts',
    'webhooks_processed',
    'audit_logs',
    'secret_rotations',
  ];

  for (const table of tablesToClean) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
      console.log(`   ✓ ${table}`);
    } catch {
      // Tabla no existe o ya está vacía - ignorar silenciosamente
    }
  }

  console.log('\n✅ Base de datos limpiada\n');
}

async function seedCasas(prisma: PrismaClient) {
  console.log('🏠 Creando casas...');

  const casas = [
    {
      tipo: CasaTipo.QUANTUM,
      nombre: 'Quantum',
      emoji: '⚛️',
      slogan: 'Exploradores del conocimiento',
      edadMinima: 6,
      edadMaxima: 9,
      colorPrimary: '#00d4ff',
      colorSecondary: '#0099cc',
      colorAccent: '#00ffff',
      colorDark: '#006699',
      gradiente: 'linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)',
    },
    {
      tipo: CasaTipo.VERTEX,
      nombre: 'Vertex',
      emoji: '🔺',
      slogan: 'Constructores del futuro',
      edadMinima: 10,
      edadMaxima: 12,
      colorPrimary: '#ff00ff',
      colorSecondary: '#cc00cc',
      colorAccent: '#ff66ff',
      colorDark: '#990099',
      gradiente: 'linear-gradient(135deg, #ff00ff 0%, #9900cc 100%)',
    },
    {
      tipo: CasaTipo.PULSAR,
      nombre: 'Pulsar',
      emoji: '💫',
      slogan: 'Dominadores del universo',
      edadMinima: 13,
      edadMaxima: 17,
      colorPrimary: '#ffaa00',
      colorSecondary: '#cc8800',
      colorAccent: '#ffcc00',
      colorDark: '#996600',
      gradiente: 'linear-gradient(135deg, #ffaa00 0%, #ff6600 100%)',
    },
  ];

  for (const casa of casas) {
    await prisma.casa.upsert({
      where: { tipo: casa.tipo },
      update: {},
      create: casa,
    });
    console.log(`   ✓ Casa ${casa.nombre} (${casa.emoji})`);
  }
}

async function seedMundos(prisma: PrismaClient) {
  console.log('🌍 Creando mundos...');

  const mundos = [
    {
      tipo: MundoTipo.MATEMATICA,
      nombre: 'Matemática',
      descripcion: 'El mundo de los números y la lógica',
      icono: '🔢',
      colorPrimary: '#4CAF50',
      colorSecondary: '#388E3C',
      colorAccent: '#8BC34A',
      gradiente: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    },
    {
      tipo: MundoTipo.PROGRAMACION,
      nombre: 'Programación',
      descripcion: 'El mundo del código y la tecnología',
      icono: '💻',
      colorPrimary: '#2196F3',
      colorSecondary: '#1976D2',
      colorAccent: '#03A9F4',
      gradiente: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
    },
    {
      tipo: MundoTipo.CIENCIAS,
      nombre: 'Ciencias',
      descripcion: 'El mundo de la experimentación',
      icono: '🔬',
      colorPrimary: '#9C27B0',
      colorSecondary: '#7B1FA2',
      colorAccent: '#E040FB',
      gradiente: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)',
    },
  ];

  for (const mundo of mundos) {
    await prisma.mundo.upsert({
      where: { tipo: mundo.tipo },
      update: {},
      create: mundo,
    });
    console.log(`   ✓ Mundo ${mundo.nombre} (${mundo.icono})`);
  }
}

async function seedTiers(prisma: PrismaClient) {
  console.log('📊 Creando tiers...');

  const tiers = [
    {
      nombre: TierNombre.STEAM_LIBROS,
      precio_mensual: 40000,
      mundos_async: 3,
      mundos_sync: 0,
      tiene_docente: false,
      descripcion: 'Acceso a plataforma completa',
    },
    {
      nombre: TierNombre.STEAM_ASINCRONICO,
      precio_mensual: 65000,
      mundos_async: 3,
      mundos_sync: 0,
      tiene_docente: false,
      descripcion: 'Plataforma + clases grabadas',
    },
    {
      nombre: TierNombre.STEAM_SINCRONICO,
      precio_mensual: 95000,
      mundos_async: 3,
      mundos_sync: 3,
      tiene_docente: true,
      descripcion: 'Todo + clases en vivo',
    },
  ];

  for (const tier of tiers) {
    await prisma.tier.upsert({
      where: { nombre: tier.nombre },
      update: {},
      create: tier,
    });
    console.log(`   ✓ Tier ${tier.nombre} ($${tier.precio_mensual})`);
  }
}

async function seedPlanes(prisma: PrismaClient) {
  console.log('📋 Creando planes de suscripción...');

  const planes = [
    {
      id: 'plan-libros',
      nombre: 'STEAM_LIBROS',
      precio_base: 40000,
      descripcion: 'Acceso a plataforma completa',
      activo: true,
    },
    {
      id: 'plan-asincronico',
      nombre: 'STEAM_ASINCRONICO',
      precio_base: 65000,
      descripcion: 'Plataforma + clases grabadas',
      activo: true,
    },
    {
      id: 'plan-sincronico',
      nombre: 'STEAM_SINCRONICO',
      precio_base: 95000,
      descripcion: 'Todo + clases en vivo con docente',
      activo: true,
    },
  ];

  for (const plan of planes) {
    await prisma.planSuscripcion.upsert({
      where: { id: plan.id },
      update: {},
      create: plan,
    });
    console.log(`   ✓ Plan ${plan.nombre}`);
  }
}

async function seedAdmin(prisma: PrismaClient) {
  console.log('👑 Creando admin...');

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mateatletas.com' },
    update: {},
    create: {
      email: 'admin@mateatletas.com',
      password_hash: await hashPassword(PASSWORD),
      nombre: 'Super',
      apellido: 'Admin',
    },
  });

  console.log(`   ✓ Admin: ${admin.email}`);
  return admin;
}

async function seedDocente(prisma: PrismaClient) {
  console.log('👨‍🏫 Creando docente...');

  const docente = await prisma.docente.upsert({
    where: { email: 'docente@mateatletas.com' },
    update: {},
    create: {
      email: 'docente@mateatletas.com',
      password_hash: await hashPassword(PASSWORD),
      nombre: 'Carlos',
      apellido: 'García',
      titulo: 'Profesor de Matemática',
      bio: 'Docente con 10 años de experiencia en educación STEAM',
      must_change_password: false,
    },
  });

  console.log(`   ✓ Docente: ${docente.nombre} ${docente.apellido}`);
  return docente;
}

async function seedGruposYClases(prisma: PrismaClient, docenteId: string) {
  console.log('📚 Creando grupos pedagógicos y clases...');

  const casas = await prisma.casa.findMany();
  const casaQuantum = casas.find((c) => c.tipo === CasaTipo.QUANTUM)!;
  const casaVertex = casas.find((c) => c.tipo === CasaTipo.VERTEX)!;
  const casaPulsar = casas.find((c) => c.tipo === CasaTipo.PULSAR)!;

  const fechaInicio = new Date('2026-03-01');
  const fechaFin = new Date('2026-12-15');

  // Crear grupos pedagógicos
  const grupoQuantum = await prisma.grupoPedagogico.upsert({
    where: { codigo: 'MAT-Q1' },
    update: {},
    create: {
      codigo: 'MAT-Q1',
      nombre: 'Matemática Quantum Nivel 1',
      descripcion: 'Matemática para niños de 6-9 años',
      casa_tipo: CasaTipo.QUANTUM,
      mundo_tipo: MundoTipo.MATEMATICA,
      edad_minima: 6,
      edad_maxima: 9,
    },
  });

  const grupoVertex = await prisma.grupoPedagogico.upsert({
    where: { codigo: 'MAT-V1' },
    update: {},
    create: {
      codigo: 'MAT-V1',
      nombre: 'Matemática Vertex Nivel 1',
      descripcion: 'Matemática para niños de 10-12 años',
      casa_tipo: CasaTipo.VERTEX,
      mundo_tipo: MundoTipo.MATEMATICA,
      edad_minima: 10,
      edad_maxima: 12,
    },
  });

  const grupoPulsar = await prisma.grupoPedagogico.upsert({
    where: { codigo: 'MAT-P1' },
    update: {},
    create: {
      codigo: 'MAT-P1',
      nombre: 'Matemática Pulsar Nivel 1',
      descripcion: 'Matemática para adolescentes de 13-17 años',
      casa_tipo: CasaTipo.PULSAR,
      mundo_tipo: MundoTipo.MATEMATICA,
      edad_minima: 13,
      edad_maxima: 17,
    },
  });

  // Crear ClaseGrupos (horarios de clases)
  const claseQuantum = await prisma.claseGrupo.upsert({
    where: { nombre: 'Matemática Quantum - Lunes 18:00' },
    update: {},
    create: {
      codigo: 'MAT-Q1',
      nombre: 'Matemática Quantum - Lunes 18:00',
      dia_semana: DiaSemana.LUNES,
      hora_inicio: '18:00',
      hora_fin: '19:30',
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      anio_lectivo: 2026,
      cupo_maximo: 15,
      grupo_id: grupoQuantum.id,
      docente_id: docenteId,
      livekit_room_name: `clase_quantum_${Date.now()}`,
    },
  });

  const claseVertex = await prisma.claseGrupo.upsert({
    where: { nombre: 'Matemática Vertex - Martes 19:00' },
    update: {},
    create: {
      codigo: 'MAT-V1',
      nombre: 'Matemática Vertex - Martes 19:00',
      dia_semana: DiaSemana.MARTES,
      hora_inicio: '19:00',
      hora_fin: '20:30',
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      anio_lectivo: 2026,
      cupo_maximo: 15,
      grupo_id: grupoVertex.id,
      docente_id: docenteId,
      livekit_room_name: `clase_vertex_${Date.now()}`,
    },
  });

  const clasePulsar = await prisma.claseGrupo.upsert({
    where: { nombre: 'Matemática Pulsar - Miércoles 20:00' },
    update: {},
    create: {
      codigo: 'MAT-P1',
      nombre: 'Matemática Pulsar - Miércoles 20:00',
      dia_semana: DiaSemana.MIERCOLES,
      hora_inicio: '20:00',
      hora_fin: '21:30',
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      anio_lectivo: 2026,
      cupo_maximo: 15,
      grupo_id: grupoPulsar.id,
      docente_id: docenteId,
      livekit_room_name: `clase_pulsar_${Date.now()}`,
    },
  });

  console.log(`   ✓ Grupo Quantum: ${claseQuantum.nombre}`);
  console.log(`   ✓ Grupo Vertex: ${claseVertex.nombre}`);
  console.log(`   ✓ Grupo Pulsar: ${clasePulsar.nombre}`);

  return {
    claseQuantum,
    claseVertex,
    clasePulsar,
    casaQuantum,
    casaVertex,
    casaPulsar,
  };
}

async function seedTutorYFamilia(
  prisma: PrismaClient,
  clases: {
    claseQuantum: { id: string };
    claseVertex: { id: string };
    clasePulsar: { id: string };
    casaQuantum: { id: string };
    casaVertex: { id: string };
    casaPulsar: { id: string };
  },
) {
  console.log('👨‍👩‍👧‍👦 Creando tutor y familia...');

  const passwordHash = await hashPassword(PASSWORD);

  // Crear tutor
  const tutor = await prisma.tutor.upsert({
    where: { email: 'tutor@mateatletas.com' },
    update: {},
    create: {
      email: 'tutor@mateatletas.com',
      password_hash: passwordHash,
      nombre: 'María',
      apellido: 'López',
      telefono: '+5491155550001',
      dni: '30123456',
      cuil: '27-30123456-0',
    },
  });

  console.log(`   ✓ Tutor: ${tutor.nombre} ${tutor.apellido} (${tutor.email})`);

  // Definición de los 3 hijos - TODOS SINCRÓNICOS para testing completo
  const hijos = [
    {
      username: 'luna.lopez',
      nombre: 'Luna',
      apellido: 'López',
      edad: 8,
      nivelEscolar: 'Primaria - 3er grado',
      casaId: clases.casaQuantum.id,
      planId: 'plan-sincronico',
      tier: TierNombre.STEAM_SINCRONICO,
      claseGrupoId: clases.claseQuantum.id,
    },
    {
      username: 'martin.lopez',
      nombre: 'Martín',
      apellido: 'López',
      edad: 11,
      nivelEscolar: 'Primaria - 6to grado',
      casaId: clases.casaVertex.id,
      planId: 'plan-sincronico',
      tier: TierNombre.STEAM_SINCRONICO,
      claseGrupoId: clases.claseVertex.id,
    },
    {
      username: 'sofia.lopez',
      nombre: 'Sofía',
      apellido: 'López',
      edad: 14,
      nivelEscolar: 'Secundaria - 2do año',
      casaId: clases.casaPulsar.id,
      planId: 'plan-sincronico',
      tier: TierNombre.STEAM_SINCRONICO,
      claseGrupoId: clases.clasePulsar.id,
    },
  ];

  // Crear suscripción familiar
  const suscripcionFamiliar = await prisma.suscripcionFamiliar.create({
    data: {
      tutor_id: tutor.id,
      estado: EstadoSuscripcionFamiliar.AUTHORIZED,
      tier: TierNombre.STEAM_SINCRONICO, // Tier máximo de la familia
      monto_mensual: 200000, // Suma aproximada
      fecha_proximo_cobro: new Date('2026-02-01'),
    },
  });

  const estudiantesCreados = [];

  for (const hijo of hijos) {
    // Crear estudiante
    const estudiante = await prisma.estudiante.upsert({
      where: { username: hijo.username },
      update: {},
      create: {
        username: hijo.username,
        nombre: hijo.nombre,
        apellido: hijo.apellido,
        edad: hijo.edad,
        nivelEscolar: hijo.nivelEscolar,
        password_hash: passwordHash,
        tutor_id: tutor.id,
        casaId: hijo.casaId,
        plan_id: hijo.planId,
      },
    });

    // Crear recursos del estudiante - valores iniciales realistas (recién empezando)
    await prisma.recursosEstudiante.upsert({
      where: { estudiante_id: estudiante.id },
      update: {},
      create: {
        estudiante_id: estudiante.id,
        xp_total: 0, // Estudiante nuevo, sin XP
      },
    });

    // Crear racha del estudiante - valores iniciales (recién empezando)
    await prisma.rachaEstudiante.upsert({
      where: { estudiante_id: estudiante.id },
      update: {},
      create: {
        estudiante_id: estudiante.id,
        racha_actual: 0,
        racha_maxima: 0,
        total_dias_activos: 0,
      },
    });

    // Crear inscripción a ClaseGrupo (manual - para docente)
    await prisma.inscripcionClaseGrupo.upsert({
      where: {
        clase_grupo_id_estudiante_id: {
          clase_grupo_id: hijo.claseGrupoId,
          estudiante_id: estudiante.id,
        },
      },
      update: {},
      create: {
        clase_grupo_id: hijo.claseGrupoId,
        estudiante_id: estudiante.id,
        tutor_id: tutor.id,
        tipo_acceso:
          hijo.tier === TierNombre.STEAM_SINCRONICO
            ? TipoAccesoInscripcion.SINCRONICO
            : TipoAccesoInscripcion.ASINCRONICO,
      },
    });

    // Crear inscripción de actividad (sistema 2026)
    await prisma.inscripcionActividad
      .create({
        data: {
          suscripcion_familiar_id: suscripcionFamiliar.id,
          estudiante_id: estudiante.id,
          producto_id: 'producto-placeholder', // Se crea si no existe
          clase_grupo_id: hijo.claseGrupoId,
          tier: hijo.tier,
          estado: EstadoInscripcionActividad.ACTIVA,
        },
      })
      .catch(() => {
        // Ignorar si falla por falta de producto
      });

    estudiantesCreados.push({ estudiante, hijo });

    const tierLabel =
      hijo.tier === TierNombre.STEAM_SINCRONICO
        ? '🟢 SINCRONICO'
        : hijo.tier === TierNombre.STEAM_ASINCRONICO
          ? '🟡 ASINCRONICO'
          : '🔵 LIBROS';

    console.log(
      `   ✓ ${hijo.nombre} (${hijo.edad} años) - ${hijo.username} - ${tierLabel}`,
    );
  }

  return { tutor, estudiantesCreados };
}

async function seedInscripcionesMensuales(
  prisma: PrismaClient,
  tutorId: string,
  estudiantesCreados: Array<{
    estudiante: { id: string; nombre: string };
    hijo: { tier: TierNombre };
  }>,
) {
  console.log('💰 Creando inscripciones mensuales (facturación)...');

  // Crear un producto genérico para las inscripciones
  const producto = await prisma.producto.upsert({
    where: { id: 'producto-membresia-steam' },
    update: {},
    create: {
      id: 'producto-membresia-steam',
      nombre: 'Membresía STEAM',
      descripcion: 'Membresía mensual STEAM con clases en vivo',
      precio: 95000,
      categoria: 'membresia',
      activo: true,
    },
  });

  // Período actual (Enero 2026)
  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const anioActual = now.getFullYear();
  const periodoActual = `${anioActual}-${mesActual.toString().padStart(2, '0')}`;

  // Precio por tier
  const preciosPorTier: Record<TierNombre, number> = {
    [TierNombre.STEAM_LIBROS]: 40000,
    [TierNombre.STEAM_ASINCRONICO]: 65000,
    [TierNombre.STEAM_SINCRONICO]: 95000,
  };

  // Descuento por posición de hermano (12% segundo, 20% tercero+)
  const descuentos = [0, 0.12, 0.2]; // Primer hijo 0%, segundo 12%, tercero 20%

  for (let i = 0; i < estudiantesCreados.length; i++) {
    const { estudiante, hijo } = estudiantesCreados[i];
    const precioBase = preciosPorTier[hijo.tier];
    const descuentoPorcentaje = descuentos[Math.min(i, 2)];
    const descuentoMonto = precioBase * descuentoPorcentaje;
    const precioFinal = precioBase - descuentoMonto;

    const tipoDescuento =
      i === 0
        ? TipoDescuento.NINGUNO
        : i === 1
          ? TipoDescuento.HERMANO_2
          : TipoDescuento.HERMANO_3_MAS;

    await prisma.inscripcionMensual.create({
      data: {
        estudiante_id: estudiante.id,
        tutor_id: tutorId,
        producto_id: producto.id,
        anio: anioActual,
        mes: mesActual,
        periodo: periodoActual,
        precio_base: precioBase,
        descuento_aplicado: descuentoMonto,
        precio_final: precioFinal,
        tipo_descuento: tipoDescuento,
        detalle_calculo:
          i === 0
            ? 'Primer hijo - sin descuento'
            : i === 1
              ? 'Segundo hijo - 12% descuento'
              : 'Tercer hijo - 20% descuento',
        estado_pago: EstadoPago.Pendiente, // Todos pendientes para probar "Por Cobrar"
        fecha_vencimiento: new Date(anioActual, mesActual - 1, 15), // Vence el 15
      },
    });

    const descuentoLabel =
      descuentoPorcentaje > 0
        ? ` (-${(descuentoPorcentaje * 100).toFixed(0)}%)`
        : '';
    console.log(
      `   ✓ ${estudiante.nombre}: $${precioFinal.toLocaleString()}${descuentoLabel} - PENDIENTE`,
    );
  }

  // Calcular total por cobrar
  const totalPorCobrar = estudiantesCreados.reduce((acc, { hijo }, i) => {
    const precio = preciosPorTier[hijo.tier];
    const descuento = descuentos[Math.min(i, 2)];
    return acc + precio * (1 - descuento);
  }, 0);

  console.log(`   📊 Total Por Cobrar: $${totalPorCobrar.toLocaleString()}`);
}

async function printCredentials() {
  console.log('\n');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('                    📋 CREDENCIALES DE ACCESO');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('');
  console.log('  🔑 Password universal: Test123!');
  console.log('');
  console.log(
    '  ┌─────────────────────────────────────────────────────────────┐',
  );
  console.log(
    '  │ ROL        │ EMAIL/USERNAME              │ NOTAS            │',
  );
  console.log(
    '  ├─────────────────────────────────────────────────────────────┤',
  );
  console.log(
    '  │ 👑 Admin   │ admin@mateatletas.com       │                  │',
  );
  console.log(
    '  │ 👨‍🏫 Docente │ docente@mateatletas.com     │ 3 grupos         │',
  );
  console.log(
    '  │ 👨‍👩‍👧 Tutor   │ tutor@mateatletas.com       │ 3 hijos          │',
  );
  console.log(
    '  ├─────────────────────────────────────────────────────────────┤',
  );
  console.log(
    '  │ 👧 Luna    │ luna.lopez                  │ 8 años, Quantum  │',
  );
  console.log(
    '  │ 👦 Martín  │ martin.lopez                │ 11 años, Vertex  │',
  );
  console.log(
    '  │ 👧 Sofía   │ sofia.lopez                 │ 14 años, Pulsar  │',
  );
  console.log(
    '  └─────────────────────────────────────────────────────────────┘',
  );
  console.log('');
  console.log('  📌 TIERS DE ESTUDIANTES (TODOS SINCRÓNICOS):');
  console.log('     • Luna (Quantum):  STEAM_SINCRONICO - Clases en vivo ✓');
  console.log('     • Martín (Vertex): STEAM_SINCRONICO - Clases en vivo ✓');
  console.log('     • Sofía (Pulsar):  STEAM_SINCRONICO - Clases en vivo ✓');
  console.log('');
  console.log(
    '═══════════════════════════════════════════════════════════════',
  );
  console.log('');
}

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('');
    console.log(
      '═══════════════════════════════════════════════════════════════',
    );
    console.log('            🌱 CLEAN SEED - Datos Mínimos para Testing');
    console.log(
      '═══════════════════════════════════════════════════════════════',
    );
    console.log('');

    // 1. Limpiar todo
    await cleanDatabase(prisma);

    // 2. Crear datos base
    await seedCasas(prisma);
    await seedMundos(prisma);
    await seedTiers(prisma);
    await seedPlanes(prisma);

    // 3. Crear usuarios
    await seedAdmin(prisma);
    const docente = await seedDocente(prisma);

    // 4. Crear grupos y clases
    const clases = await seedGruposYClases(prisma, docente.id);

    // 5. Crear tutor y familia
    await seedTutorYFamilia(prisma, clases);

    // 6. Mostrar credenciales
    await printCredentials();

    console.log('🎉 ¡Seed completado exitosamente!\n');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
