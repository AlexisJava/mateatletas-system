import {
  PrismaClient,
  TipoProducto,
  CasaTipo,
  MundoTipo,
  DiaSemana,
} from '@prisma/client';

export async function seedProductos(prisma: PrismaClient) {
  console.log('\n🛒 Creando productos del catálogo...');

  // ============================================================================
  // PRODUCTOS LEGACY (mantener compatibilidad)
  // ============================================================================
  const productosLegacy = [
    {
      id: 'seed-suscripcion-mensual',
      nombre: 'Suscripción Mensual Mateatletas',
      descripcion:
        'Acceso ilimitado a todos los cursos y recursos de la plataforma durante un mes. Incluye clases en vivo, ejercicios interactivos, seguimiento personalizado y sistema de gamificación.',
      precio: 2500.0,
      tipo: TipoProducto.Servicio,
      activo: true,
      duracion_meses: 1,
    },
    {
      id: 'seed-suscripcion-anual',
      nombre: 'Suscripción Anual Mateatletas',
      descripcion:
        'Acceso ilimitado por 12 meses con 20% de descuento. Incluye todos los beneficios de la suscripción mensual más acceso prioritario a nuevos cursos y contenido exclusivo.',
      precio: 24000.0,
      tipo: TipoProducto.Servicio,
      activo: true,
      duracion_meses: 12,
    },
    {
      id: 'seed-curso-algebra-basica',
      nombre: 'Curso Intensivo: Álgebra Básica',
      descripcion:
        'Curso intensivo de 4 semanas para dominar los fundamentos del álgebra. Incluye ecuaciones lineales, sistemas de ecuaciones, factorización y funciones lineales. Ideal para estudiantes de secundaria.',
      precio: 3500.0,
      tipo: TipoProducto.Curso,
      activo: true,
      fechaInicio: new Date('2025-11-15'),
      fechaFin: new Date('2025-12-13'),
      cupoMaximo: 25,
    },
    {
      id: 'seed-curso-geometria',
      nombre: 'Curso: Geometría y Trigonometría',
      descripcion:
        'Aprende geometría plana y espacial, más introducción a trigonometría. Incluye teoremas, construcciones geométricas y aplicaciones prácticas. Duración: 6 semanas.',
      precio: 4200.0,
      tipo: TipoProducto.Curso,
      activo: true,
      fechaInicio: new Date('2025-12-01'),
      fechaFin: new Date('2026-01-12'),
      cupoMaximo: 20,
    },
    {
      id: 'seed-recurso-guia-ejercicios',
      nombre: 'Guía Completa de Ejercicios - Matemática Nivel Secundaria',
      descripcion:
        'Colección digital de más de 500 ejercicios resueltos y explicados paso a paso. Incluye todos los temas de matemática de nivel secundario.',
      precio: 1500.0,
      tipo: TipoProducto.Digital,
      activo: true,
    },
  ];

  for (const producto of productosLegacy) {
    const { id, ...data } = producto;
    await prisma.producto.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    console.log(`   • ${producto.nombre}`);
  }

  // ============================================================================
  // CLUBS 2026 - Sistema Casa/Mundo con ClaseGrupos
  // ============================================================================
  console.log('\n🏫 Creando Clubs 2026 (Casa/Mundo)...');

  // Definición de Clubs por Casa y Mundo
  const clubsDefinition = [
    // === QUANTUM (6-9 años) ===
    {
      casa: CasaTipo.QUANTUM,
      mundo: MundoTipo.MATEMATICA,
      clubs: [
        {
          id: 'club-mat-olimp-quantum',
          nombre: 'Olimpíadas de Matemática - Quantum',
          descripcion:
            'Preparación para competencias matemáticas nacionales e internacionales. Resolución de problemas y pensamiento lógico avanzado para niños de 6-9 años.',
        },
        {
          id: 'club-geometria-quantum',
          nombre: 'Club de Geometría - Quantum',
          descripcion:
            'Exploración de formas, espacios y figuras. Desde polígonos hasta geometría 3D con proyectos prácticos.',
        },
        {
          id: 'club-mat-recreativa-quantum',
          nombre: 'Matemática Recreativa - Quantum',
          descripcion:
            'Juegos, acertijos y desafíos matemáticos. Aprendé matemática divirtiéndote con puzzles y enigmas.',
        },
      ],
    },
    {
      casa: CasaTipo.QUANTUM,
      mundo: MundoTipo.PROGRAMACION,
      clubs: [
        {
          id: 'club-videojuegos-quantum',
          nombre: 'Desarrollo de Videojuegos - Quantum',
          descripcion:
            'Creá tus propios videojuegos desde cero con Scratch. Aprendé programación mientras diseñás mundos virtuales.',
        },
        {
          id: 'club-robotica-quantum',
          nombre: 'Club de Robótica - Quantum',
          descripcion:
            'Programá robots y automatizá tareas. Introducción a la robótica con kits educativos.',
        },
        {
          id: 'club-web-quantum',
          nombre: 'Programación Web Junior - Quantum',
          descripcion:
            'Primeros pasos en diseño web. HTML básico y creatividad digital para los más chicos.',
        },
      ],
    },
    {
      casa: CasaTipo.QUANTUM,
      mundo: MundoTipo.CIENCIAS,
      clubs: [
        {
          id: 'club-lab-quantum',
          nombre: 'Laboratorio de Ciencias - Quantum',
          descripcion:
            'Experimentos prácticos de física, química y biología. Método científico en acción para curiosos.',
        },
        {
          id: 'club-astro-quantum',
          nombre: 'Astronomía y Espacio - Quantum',
          descripcion:
            'Explorá el universo, las estrellas y los planetas. Observación astronómica para principiantes.',
        },
        {
          id: 'club-ambiente-quantum',
          nombre: 'Ciencias Ambientales - Quantum',
          descripcion:
            'Ecología, sustentabilidad y cuidado del medio ambiente. Proyectos de impacto real.',
        },
      ],
    },
    // === VERTEX (10-12 años) ===
    {
      casa: CasaTipo.VERTEX,
      mundo: MundoTipo.MATEMATICA,
      clubs: [
        {
          id: 'club-mat-olimp-vertex',
          nombre: 'Olimpíadas de Matemática - Vertex',
          descripcion:
            'Preparación intensiva para Ñandú y OMA. Resolución de problemas nivel intermedio.',
        },
        {
          id: 'club-geometria-vertex',
          nombre: 'Club de Geometría - Vertex',
          descripcion:
            'Geometría euclidiana avanzada. Teoremas, demostraciones y construcciones complejas.',
        },
        {
          id: 'club-mat-recreativa-vertex',
          nombre: 'Matemática Recreativa - Vertex',
          descripcion:
            'Problemas de ingenio, lógica y estrategia. Desarrollá el pensamiento crítico.',
        },
      ],
    },
    {
      casa: CasaTipo.VERTEX,
      mundo: MundoTipo.PROGRAMACION,
      clubs: [
        {
          id: 'club-videojuegos-vertex',
          nombre: 'Desarrollo de Videojuegos - Vertex',
          descripcion:
            'Creá videojuegos con Python y Pygame. Programación orientada a objetos aplicada.',
        },
        {
          id: 'club-robotica-vertex',
          nombre: 'Club de Robótica - Vertex',
          descripcion:
            'Arduino, sensores y mecánica aplicada. Proyectos de automatización reales.',
        },
        {
          id: 'club-web-vertex',
          nombre: 'Programación Web - Vertex',
          descripcion:
            'HTML, CSS y JavaScript. Diseñá y programá sitios web modernos e interactivos.',
        },
      ],
    },
    {
      casa: CasaTipo.VERTEX,
      mundo: MundoTipo.CIENCIAS,
      clubs: [
        {
          id: 'club-lab-vertex',
          nombre: 'Laboratorio de Ciencias - Vertex',
          descripcion:
            'Experimentos avanzados de física y química. Introducción al método científico formal.',
        },
        {
          id: 'club-astro-vertex',
          nombre: 'Astronomía y Espacio - Vertex',
          descripcion:
            'Astrofísica básica, cosmología y observación con telescopio. Sistema solar y más allá.',
        },
        {
          id: 'club-ambiente-vertex',
          nombre: 'Ciencias Ambientales - Vertex',
          descripcion:
            'Cambio climático, biodiversidad y proyectos de sustentabilidad comunitaria.',
        },
      ],
    },
    // === PULSAR (13-17 años) ===
    {
      casa: CasaTipo.PULSAR,
      mundo: MundoTipo.MATEMATICA,
      clubs: [
        {
          id: 'club-mat-olimp-pulsar',
          nombre: 'Olimpíadas de Matemática - Pulsar',
          descripcion:
            'Preparación OMA nivel 3 y competencias internacionales. Problemas de alto nivel.',
        },
        {
          id: 'club-geometria-pulsar',
          nombre: 'Club de Geometría - Pulsar',
          descripcion:
            'Geometría proyectiva, transformaciones y geometría analítica avanzada.',
        },
        {
          id: 'club-mat-recreativa-pulsar',
          nombre: 'Matemática Avanzada - Pulsar',
          descripcion:
            'Teoría de números, combinatoria y álgebra abstracta. Preparación universitaria.',
        },
      ],
    },
    {
      casa: CasaTipo.PULSAR,
      mundo: MundoTipo.PROGRAMACION,
      clubs: [
        {
          id: 'club-videojuegos-pulsar',
          nombre: 'Desarrollo de Videojuegos - Pulsar',
          descripcion:
            'Game development profesional con Unity o Godot. Física de juegos y AI.',
        },
        {
          id: 'club-robotica-pulsar',
          nombre: 'Club de Robótica - Pulsar',
          descripcion:
            'Robótica avanzada, ROS, visión por computadora. Proyectos de competencia.',
        },
        {
          id: 'club-web-pulsar',
          nombre: 'Desarrollo Full Stack - Pulsar',
          descripcion:
            'React, Node.js, bases de datos. Construí aplicaciones web profesionales.',
        },
      ],
    },
    {
      casa: CasaTipo.PULSAR,
      mundo: MundoTipo.CIENCIAS,
      clubs: [
        {
          id: 'club-lab-pulsar',
          nombre: 'Laboratorio de Ciencias - Pulsar',
          descripcion:
            'Investigación científica real. Física cuántica básica, química orgánica, biología molecular.',
        },
        {
          id: 'club-astro-pulsar',
          nombre: 'Astrofísica - Pulsar',
          descripcion:
            'Mecánica celeste, espectroscopía, cosmología moderna. Preparación para carreras STEM.',
        },
        {
          id: 'club-ambiente-pulsar',
          nombre: 'Ciencias Ambientales - Pulsar',
          descripcion:
            'Investigación ambiental, análisis de datos climáticos y políticas de sustentabilidad.',
        },
      ],
    },
  ];

  // Crear Clubs con ClaseGrupos
  for (const grupo of clubsDefinition) {
    for (const club of grupo.clubs) {
      // Crear o actualizar el producto Club
      const producto = await prisma.producto.upsert({
        where: { id: club.id },
        update: {
          nombre: club.nombre,
          descripcion: club.descripcion,
          tipo: TipoProducto.Club,
          casa: grupo.casa,
          mundo: grupo.mundo,
          activo: true,
          visibleEnLanding: true,
          precio: 0, // El precio lo define el Tier, no el producto
        },
        create: {
          id: club.id,
          nombre: club.nombre,
          descripcion: club.descripcion,
          tipo: TipoProducto.Club,
          casa: grupo.casa,
          mundo: grupo.mundo,
          activo: true,
          visibleEnLanding: true,
          precio: 0,
        },
      });

      console.log(`   • ${club.nombre}`);

      // Crear ClaseGrupos para cada Club
      // Necesitamos un docente - usar el primer docente existente
      const docente = await prisma.docente.findFirst();
      if (!docente) {
        console.log('   ⚠️  No hay docentes, saltando ClaseGrupos');
        continue;
      }

      // Crear o buscar el GrupoPedagogico para este club
      const gpCodigo = club.id.toUpperCase();
      const nombreCorto = club.nombre.split(' - ')[0] ?? club.nombre;
      const grupoPedagogico = await prisma.grupoPedagogico.upsert({
        where: { codigo: gpCodigo },
        update: {
          nombre: nombreCorto,
          descripcion: club.descripcion,
          casaTipo: grupo.casa,
          mundoTipo: grupo.mundo,
        },
        create: {
          codigo: gpCodigo,
          nombre: nombreCorto,
          descripcion: club.descripcion,
          casaTipo: grupo.casa,
          mundoTipo: grupo.mundo,
        },
      });

      const horarios = [
        { dia: DiaSemana.LUNES, hora: '17:00', codigo: 'L17' },
        { dia: DiaSemana.MIERCOLES, hora: '18:00', codigo: 'X18' },
        { dia: DiaSemana.SABADO, hora: '10:00', codigo: 'S10' },
      ];

      for (const horario of horarios) {
        const claseGrupoId = `${club.id}-${horario.codigo}`;
        // Nombre único: incluye casa para evitar duplicados
        const cgNombre = `${nombreCorto} ${grupo.casa} - ${horario.codigo}`;
        const horaFin = `${String(parseInt(horario.hora) + 1).padStart(2, '0')}:30`;

        await prisma.claseGrupo.upsert({
          where: { id: claseGrupoId },
          update: {
            nombre: cgNombre,
            diaSemana: horario.dia,
            horaInicio: horario.hora,
            horaFin: horaFin,
            cupoMaximo: 8,
            activo: true,
          },
          create: {
            id: claseGrupoId,
            codigo: `${club.id.substring(5)}-${horario.codigo}`.toUpperCase(),
            nombre: cgNombre,
            diaSemana: horario.dia,
            horaInicio: horario.hora,
            horaFin: horaFin,
            fechaInicio: new Date('2026-03-01'),
            fechaFin: new Date('2026-12-15'),
            anioLectivo: 2026,
            cupoMaximo: 8,
            grupoId: grupoPedagogico.id,
            docenteId: docente.id,
            productoId: producto.id,
            activo: true,
          },
        });
      }
    }
  }

  console.log('✅ Productos del catálogo listos');
  console.log('✅ Clubs 2026 con ClaseGrupos listos');
}
