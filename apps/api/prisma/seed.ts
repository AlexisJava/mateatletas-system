import { PrismaClient, TipoProducto, TipoContenido } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  await seedAdmin();
  await seedDocente();
  await seedTutor();
  await seedEquipos();
  await seedRutasCurriculares();
  await seedProductos();
  await seedAccionesPuntuables();
  await seedLogros();
  // await seedEstudiantesConCredenciales(); // TODO: Re-enable after adding email to Estudiante model
  await seedCursoFundamentosAlgebra();
  await seedInscripcionEstudiante();

  console.log('\n🎉 Seed completado exitosamente!');
}

async function seedAdmin() {
  console.log('👤 Creando/actualizando usuario Admin por defecto...');

  const email = process.env.ADMIN_EMAIL ?? 'admin@mateatletas.com';
  const rawPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: hashedPassword,
      nombre: process.env.ADMIN_NOMBRE ?? 'Admin',
      apellido: process.env.ADMIN_APELLIDO ?? 'Mateatletas',
    },
  });

  console.log(`✅ Admin listo: ${email}`);
}

async function seedDocente() {
  console.log('\n👨‍🏫 Creando/actualizando usuario Docente de prueba...');

  const email = 'docente@test.com';
  const rawPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.docente.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: hashedPassword,
      nombre: 'María',
      apellido: 'González',
      titulo: 'Profesora de Matemáticas',
      bio: 'Profesora especializada en álgebra y geometría con más de 5 años de experiencia en educación secundaria.',
    },
  });

  console.log(`✅ Docente listo: ${email} (password: ${rawPassword})`);
}

async function seedTutor() {
  console.log('\n👨‍👩‍👧 Creando/actualizando usuario Tutor de prueba...');

  const email = 'tutor@test.com';
  const rawPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.tutor.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: hashedPassword,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      telefono: '+52 55 1234 5678',
    },
  });

  console.log(`✅ Tutor listo: ${email} (password: ${rawPassword})`);
}

async function seedEquipos() {
  console.log('\n🛡️  Creando equipos base...');

  const equipos = [
    {
      nombre: 'Fénix',
      color_primario: '#FF6B35',
      color_secundario: '#F7B801',
    },
    {
      nombre: 'Dragón',
      color_primario: '#F44336',
      color_secundario: '#9C27B0',
    },
    {
      nombre: 'Tigre',
      color_primario: '#2196F3',
      color_secundario: '#00BCD4',
    },
    {
      nombre: 'Águila',
      color_primario: '#4CAF50',
      color_secundario: '#8BC34A',
    },
  ];

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { nombre: equipo.nombre },
      update: {
        color_primario: equipo.color_primario,
        color_secundario: equipo.color_secundario,
      },
      create: equipo,
    });
    console.log(`   • ${equipo.nombre}`);
  }

  console.log('✅ Equipos cargados');
}

async function seedRutasCurriculares() {
  console.log('\n🧭 Creando rutas curriculares...');

  const rutas = [
    {
      id: 'seed-ruta-logica',
      nombre: 'Lógica y Razonamiento',
      color: '#8B5CF6',
      descripcion:
        'Desarrollo de pensamiento lógico, resolución de problemas y razonamiento abstracto',
    },
    {
      id: 'seed-ruta-algebra',
      nombre: 'Álgebra',
      color: '#3B82F6',
      descripcion: 'Ecuaciones, sistemas, funciones y expresiones algebraicas',
    },
    {
      id: 'seed-ruta-geometria',
      nombre: 'Geometría',
      color: '#10B981',
      descripcion:
        'Figuras planas, cuerpos geométricos, trigonometría y transformaciones',
    },
    {
      id: 'seed-ruta-aritmetica',
      nombre: 'Aritmética',
      color: '#F59E0B',
      descripcion:
        'Números, operaciones básicas, fracciones, decimales y porcentajes',
    },
    {
      id: 'seed-ruta-estadistica',
      nombre: 'Estadística y Probabilidad',
      color: '#EF4444',
      descripcion:
        'Análisis de datos, gráficos, medidas de tendencia y probabilidad',
    },
    {
      id: 'seed-ruta-calculo',
      nombre: 'Cálculo',
      color: '#6366F1',
      descripcion: 'Límites, derivadas, integrales y análisis matemático',
    },
  ];

  for (const ruta of rutas) {
    const { id, ...data } = ruta;

    await prisma.rutaCurricular.upsert({
      where: { nombre: ruta.nombre },
      update: data,
      create: { id, ...data },
    });
    console.log(`   • ${ruta.nombre}`);
  }

  console.log('✅ Rutas curriculares cargadas');
}

async function seedProductos() {
  console.log('\n🛒 Creando productos del catálogo...');

  const productos = [
    {
      id: 'seed-suscripcion-mensual',
      nombre: 'Suscripción Mensual Mateatletas',
      descripcion:
        'Acceso ilimitado a todos los cursos y recursos de la plataforma durante un mes. Incluye clases en vivo, ejercicios interactivos, seguimiento personalizado y sistema de gamificación.',
      precio: 2500.0,
      tipo: TipoProducto.Suscripcion,
      activo: true,
      duracion_meses: 1,
    },
    {
      id: 'seed-suscripcion-anual',
      nombre: 'Suscripción Anual Mateatletas',
      descripcion:
        'Acceso ilimitado por 12 meses con 20% de descuento. Incluye todos los beneficios de la suscripción mensual más acceso prioritario a nuevos cursos y contenido exclusivo.',
      precio: 24000.0,
      tipo: TipoProducto.Suscripcion,
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
      fecha_inicio: new Date('2025-11-15'),
      fecha_fin: new Date('2025-12-13'),
      cupo_maximo: 25,
    },
    {
      id: 'seed-curso-geometria',
      nombre: 'Curso: Geometría y Trigonometría',
      descripcion:
        'Aprende geometría plana y espacial, más introducción a trigonometría. Incluye teoremas, construcciones geométricas y aplicaciones prácticas. Duración: 6 semanas.',
      precio: 4200.0,
      tipo: TipoProducto.Curso,
      activo: true,
      fecha_inicio: new Date('2025-12-01'),
      fecha_fin: new Date('2026-01-12'),
      cupo_maximo: 20,
    },
    {
      id: 'seed-recurso-guia-ejercicios',
      nombre: 'Guía Completa de Ejercicios - Matemática Nivel Secundaria',
      descripcion:
        'Colección digital de más de 500 ejercicios resueltos y explicados paso a paso. Incluye todos los temas de matemática de nivel secundario.',
      precio: 1500.0,
      tipo: TipoProducto.RecursoDigital,
      activo: true,
    },
  ];

  for (const producto of productos) {
    const { id, ...data } = producto;
    await prisma.producto.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    console.log(`   • ${producto.nombre}`);
  }

  console.log('✅ Productos del catálogo listos');
}

async function seedAccionesPuntuables() {
  console.log('\n⭐ Creando acciones puntuables...');

  const acciones = [
    {
      nombre: 'Asistencia a clase',
      descripcion: 'El estudiante asistió puntualmente a una clase programada',
      puntos: 10,
    },
    {
      nombre: 'Participación activa',
      descripcion:
        'El estudiante participó activamente durante la clase, respondiendo preguntas o haciendo consultas',
      puntos: 15,
    },
    {
      nombre: 'Ejercicios completados',
      descripcion:
        'El estudiante completó todos los ejercicios asignados durante la clase',
      puntos: 20,
    },
    {
      nombre: 'Ayudó a un compañero',
      descripcion:
        'El estudiante ayudó a explicar un concepto a otro compañero durante la clase',
      puntos: 25,
    },
    {
      nombre: 'Excelencia en ejercicios',
      descripcion:
        'El estudiante completó todos los ejercicios sin errores y de forma destacada',
      puntos: 30,
    },
    {
      nombre: 'Racha semanal',
      descripcion:
        'El estudiante asistió a todas las clases de la semana sin faltas',
      puntos: 50,
    },
    {
      nombre: 'Desafío superado',
      descripcion:
        'El estudiante completó exitosamente un desafío matemático adicional',
      puntos: 40,
    },
    {
      nombre: 'Mejora destacada',
      descripcion:
        'El estudiante mostró una mejora significativa en su desempeño respecto a clases anteriores',
      puntos: 35,
    },
  ];

  for (const accion of acciones) {
    await prisma.accionPuntuable.upsert({
      where: { nombre: accion.nombre },
      update: {
        descripcion: accion.descripcion,
        puntos: accion.puntos,
      },
      create: accion,
    });
    console.log(`   • ${accion.nombre} (${accion.puntos} pts)`);
  }

  console.log('✅ Acciones puntuables cargadas');
}

async function seedLogros() {
  console.log('\n🏆 Creando logros (achievements)...');

  const logros = [
    {
      nombre: 'Primera Clase',
      descripcion: 'Asististe a tu primera clase en Mateatletas',
      icono: '🎓',
      puntos: 50,
      requisito: 'Asistir a 1 clase',
    },
    {
      nombre: 'Racha de Fuego',
      descripcion: 'Asististe a 5 clases consecutivas sin faltar',
      icono: '🔥',
      puntos: 200,
      requisito: 'Asistir a 5 clases consecutivas',
    },
    {
      nombre: 'Matemático Dedicado',
      descripcion: 'Acumulaste 500 puntos totales',
      icono: '📚',
      puntos: 100,
      requisito: 'Alcanzar 500 puntos totales',
    },
    {
      nombre: 'Estrella Brillante',
      descripcion: 'Alcanzaste el nivel 5',
      icono: '⭐',
      puntos: 150,
      requisito: 'Alcanzar nivel 5',
    },
    {
      nombre: 'Leyenda Matemática',
      descripcion: 'Alcanzaste el nivel 10',
      icono: '👑',
      puntos: 300,
      requisito: 'Alcanzar nivel 10',
    },
    {
      nombre: 'Maestro de Equipo',
      descripcion: 'Tu equipo alcanzó el primer lugar en el ranking',
      icono: '🏆',
      puntos: 250,
      requisito: 'Equipo en primer lugar del ranking',
    },
    {
      nombre: 'Colaborador',
      descripcion: 'Ayudaste a 10 compañeros durante las clases',
      icono: '🤝',
      puntos: 180,
      requisito: 'Ayudar a 10 compañeros',
    },
    {
      nombre: 'Perfeccionista',
      descripcion: 'Completaste 20 ejercicios sin errores',
      icono: '💯',
      puntos: 220,
      requisito: 'Completar 20 ejercicios perfectos',
    },
  ];

  for (const logro of logros) {
    await prisma.logro.upsert({
      where: { nombre: logro.nombre },
      update: {
        descripcion: logro.descripcion,
        icono: logro.icono,
        puntos: logro.puntos,
        requisito: logro.requisito,
      },
      create: logro,
    });
    console.log(`   • ${logro.icono} ${logro.nombre} (${logro.puntos} pts)`);
  }

  console.log('✅ Logros cargados');
}

async function seedEstudiantesConCredenciales() {
  console.log('\n👦 Actualizando estudiantes con credenciales...');

  // Obtener todos los estudiantes existentes sin email
  const estudiantesSinEmail = await prisma.estudiante.findMany({
    where: { email: null },
    take: 5, // Actualizar máximo 5
  });

  if (estudiantesSinEmail.length === 0) {
    console.log('  ℹ️  No hay estudiantes sin email para actualizar');
    return;
  }

  const password = 'estudiante123'; // Contraseña por defecto para testing
  const passwordHash = await bcrypt.hash(password, 10);

  let actualizados = 0;

  for (const [index, estudiante] of estudiantesSinEmail.entries()) {
    const email = `estudiante${index + 1}@test.com`;

    try {
      // Verificar si el email ya existe
      const emailExiste = await prisma.estudiante.findUnique({
        where: { email },
      });

      if (!emailExiste) {
        await prisma.estudiante.update({
          where: { id: estudiante.id },
          data: {
            email,
            password_hash: passwordHash,
          },
        });

        console.log(
          `   ✅ ${estudiante.nombre} ${estudiante.apellido} → ${email}`,
        );
        actualizados++;
      } else {
        console.log(
          `   ⏭️  ${estudiante.nombre} ${estudiante.apellido} → email ya existe, saltando`,
        );
      }
    } catch (error) {
      console.log(
        `   ⚠️  Error actualizando ${estudiante.nombre}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  if (actualizados > 0) {
    console.log(`✅ ${actualizados} estudiantes actualizados con credenciales`);
    console.log(`   📧 Email: estudiante1@test.com ... estudiante${actualizados}@test.com`);
    console.log(`   🔑 Password: ${password}`);
  } else {
    console.log('  ℹ️  No se actualizaron estudiantes (emails ya existen)');
  }
}

/**
 * SLICE #16: Seed de Curso Completo con Ed-Tech Best Practices
 *
 * Curso: "Fundamentos de Álgebra"
 * - 3 módulos temáticos (Chunking)
 * - 10 lecciones totales (Microlearning: 5-15 min cada una)
 * - Multiple content types (Multi-modal Learning)
 * - Sequential unlocking (Progressive Disclosure)
 * - Gamification (points + achievements)
 */
async function seedCursoFundamentosAlgebra() {
  console.log('\n📚 Creando curso completo: Fundamentos de Álgebra...');

  // Verificar que existe el producto del curso
  const producto = await prisma.producto.findUnique({
    where: { id: 'seed-curso-algebra-basica' },
  });

  if (!producto) {
    console.log('   ⚠️  Producto "Álgebra Básica" no encontrado, saltando...');
    return;
  }

  // Obtener un logro para vincular a lecciones especiales
  const logro = await prisma.logro.findFirst({
    where: { nombre: 'Primera Clase' },
  });

  console.log('   📦 Creando módulos y lecciones...\n');

  // ========================================
  // MÓDULO 1: Variables y Expresiones
  // ========================================
  const modulo1 = await prisma.modulo.upsert({
    where: { id: 'seed-modulo-variables' },
    update: {},
    create: {
      id: 'seed-modulo-variables',
      producto_id: producto.id,
      titulo: 'Variables y Expresiones Algebraicas',
      descripcion:
        'Introducción a los conceptos fundamentales del álgebra: variables, términos, coeficientes y expresiones algebraicas.',
      orden: 1,
      duracion_estimada_minutos: 45, // 3 lecciones x 15 min
      puntos_totales: 40, // Calculado automáticamente
      publicado: true,
    },
  });
  console.log(`   ✅ Módulo 1: ${modulo1.titulo}`);

  // Lección 1.1 - Video introductorio (sin prerequisito)
  const leccion1_1 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-1-1' },
    update: {},
    create: {
      id: 'seed-leccion-1-1',
      modulo_id: modulo1.id,
      titulo: '¿Qué es el Álgebra?',
      descripcion:
        'Video introductorio que explica qué es el álgebra, su historia y por qué es importante aprenderla.',
      tipo_contenido: TipoContenido.Video,
      contenido: JSON.stringify({
        video_url: 'https://www.youtube.com/watch?v=example-algebra-intro',
        duracion: '12:30',
        subtitulos: true,
      }),
      orden: 1,
      puntos_por_completar: 10,
      logro_desbloqueable_id: logro?.id,
      duracion_estimada_minutos: 15,
      activo: true,
      recursos_adicionales: JSON.stringify({
        links: [
          'https://es.wikipedia.org/wiki/Álgebra',
          'https://www.khanacademy.org/math/algebra',
        ],
      }),
    },
  });
  console.log(`      • ${leccion1_1.titulo} (Video, 10 pts)`);

  // Lección 1.2 - Texto explicativo (prerequisito: 1.1)
  const leccion1_2 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-1-2' },
    update: {},
    create: {
      id: 'seed-leccion-1-2',
      modulo_id: modulo1.id,
      titulo: 'Variables: Las Incógnitas del Álgebra',
      descripcion:
        'Aprende qué son las variables, cómo se representan y su rol en las expresiones algebraicas.',
      tipo_contenido: TipoContenido.Texto,
      contenido: `# Variables: Las Incógnitas del Álgebra

## ¿Qué es una variable?

Una **variable** es un símbolo (generalmente una letra) que representa un valor desconocido o que puede cambiar.

### Ejemplos:
- **x** = número de manzanas en una caja
- **y** = edad de una persona
- **z** = temperatura en grados Celsius

## ¿Por qué usar variables?

Las variables nos permiten:
1. Representar valores desconocidos
2. Generalizar problemas matemáticos
3. Crear fórmulas y ecuaciones

## Expresiones Algebraicas

Una **expresión algebraica** combina variables, números y operaciones.

### Ejemplos:
- \`3x + 5\`
- \`2y - 7\`
- \`x² + 4x + 4\`

## Términos y Coeficientes

En la expresión \`5x + 3\`:
- **5x** es un término (variable con coeficiente)
- **5** es el coeficiente de x
- **3** es un término constante

## Práctica

Identifica las variables en estas expresiones:
1. \`7a + 2b\`
2. \`m² - 5m + 6\`
3. \`3xy + 2x - y\``,
      orden: 2,
      puntos_por_completar: 15,
      duracion_estimada_minutos: 12,
      activo: true,
      leccion_prerequisito_id: leccion1_1.id, // Progressive Disclosure
    },
  });
  console.log(
    `      • ${leccion1_2.titulo} (Texto, 15 pts) [Prerequisito: 1.1]`,
  );

  // Lección 1.3 - Quiz (prerequisito: 1.2)
  const leccion1_3 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-1-3' },
    update: {},
    create: {
      id: 'seed-leccion-1-3',
      modulo_id: modulo1.id,
      titulo: 'Quiz: Variables y Expresiones',
      descripcion: 'Pon a prueba tu comprensión de variables y expresiones.',
      tipo_contenido: TipoContenido.Quiz,
      contenido: JSON.stringify({
        preguntas: [
          {
            id: 1,
            pregunta: '¿Qué es una variable en álgebra?',
            opciones: [
              'Un número que nunca cambia',
              'Un símbolo que representa un valor desconocido',
              'Una operación matemática',
              'Un tipo de ecuación',
            ],
            respuesta_correcta: 1, // índice 1 = segunda opción
            explicacion:
              'Las variables son símbolos que representan valores desconocidos o que pueden cambiar.',
          },
          {
            id: 2,
            pregunta: 'En la expresión 7x + 3, ¿cuál es el coeficiente de x?',
            opciones: ['x', '7', '3', '10'],
            respuesta_correcta: 1,
            explicacion: 'El coeficiente es el número que multiplica a la variable.',
          },
          {
            id: 3,
            pregunta: '¿Cuál de estas es una expresión algebraica?',
            opciones: ['5 + 3 = 8', '2x - 7', 'x = 4', '10'],
            respuesta_correcta: 1,
            explicacion:
              'Una expresión algebraica combina variables y números sin un signo igual.',
          },
        ],
      }),
      orden: 3,
      puntos_por_completar: 15,
      duracion_estimada_minutos: 10,
      activo: true,
      leccion_prerequisito_id: leccion1_2.id,
    },
  });
  console.log(`      • ${leccion1_3.titulo} (Quiz, 15 pts) [Prerequisito: 1.2]`);

  // ========================================
  // MÓDULO 2: Ecuaciones Lineales
  // ========================================
  const modulo2 = await prisma.modulo.upsert({
    where: { id: 'seed-modulo-ecuaciones' },
    update: {},
    create: {
      id: 'seed-modulo-ecuaciones',
      producto_id: producto.id,
      titulo: 'Ecuaciones Lineales',
      descripcion:
        'Aprende a resolver ecuaciones lineales simples y complejas paso a paso.',
      orden: 2,
      duracion_estimada_minutos: 60, // 4 lecciones
      puntos_totales: 65,
      publicado: true,
    },
  });
  console.log(`\n   ✅ Módulo 2: ${modulo2.titulo}`);

  // Lección 2.1 - Video (sin prerequisito del módulo anterior por ahora)
  const leccion2_1 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-2-1' },
    update: {},
    create: {
      id: 'seed-leccion-2-1',
      modulo_id: modulo2.id,
      titulo: 'Introducción a las Ecuaciones',
      descripcion: 'Descubre qué es una ecuación y cómo se diferencia de una expresión.',
      tipo_contenido: TipoContenido.Video,
      contenido: JSON.stringify({
        video_url: 'https://www.youtube.com/watch?v=example-equations',
        duracion: '14:20',
        subtitulos: true,
      }),
      orden: 1,
      puntos_por_completar: 10,
      duracion_estimada_minutos: 15,
      activo: true,
    },
  });
  console.log(`      • ${leccion2_1.titulo} (Video, 10 pts)`);

  // Lección 2.2 - Texto explicativo
  const leccion2_2 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-2-2' },
    update: {},
    create: {
      id: 'seed-leccion-2-2',
      modulo_id: modulo2.id,
      titulo: 'Resolver Ecuaciones de un Paso',
      descripcion: 'Aprende a resolver ecuaciones simples como x + 5 = 12.',
      tipo_contenido: TipoContenido.Texto,
      contenido: `# Resolver Ecuaciones de un Paso

## ¿Qué es una ecuación?

Una **ecuación** es una igualdad matemática que contiene una o más variables.

Ejemplo: \`x + 5 = 12\`

## Objetivo: Aislar la variable

Para resolver una ecuación, debemos **aislar la variable** en un lado del signo igual.

### Regla de Oro
> Lo que hagas de un lado, hazlo también del otro.

## Ejemplo 1: Suma/Resta

Resolver: \`x + 5 = 12\`

**Paso 1**: Identificar la operación que afecta a x → suma (+5)

**Paso 2**: Hacer la operación inversa en ambos lados → restar 5

\`\`\`
x + 5 = 12
x + 5 - 5 = 12 - 5
x = 7
\`\`\`

**Verificación**: 7 + 5 = 12 ✅

## Ejemplo 2: Multiplicación/División

Resolver: \`3x = 15\`

**Paso 1**: Identificar la operación → multiplicación (×3)

**Paso 2**: Hacer la operación inversa → dividir entre 3

\`\`\`
3x = 15
3x ÷ 3 = 15 ÷ 3
x = 5
\`\`\`

**Verificación**: 3 × 5 = 15 ✅

## Practica

Resuelve estas ecuaciones:
1. \`x + 8 = 20\`
2. \`y - 3 = 10\`
3. \`4m = 28\`
4. \`z ÷ 2 = 9\``,
      orden: 2,
      puntos_por_completar: 15,
      duracion_estimada_minutos: 15,
      activo: true,
      leccion_prerequisito_id: leccion2_1.id,
    },
  });
  console.log(
    `      • ${leccion2_2.titulo} (Texto, 15 pts) [Prerequisito: 2.1]`,
  );

  // Lección 2.3 - Práctica interactiva
  const leccion2_3 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-2-3' },
    update: {},
    create: {
      id: 'seed-leccion-2-3',
      modulo_id: modulo2.id,
      titulo: 'Práctica: Ecuaciones de Dos Pasos',
      descripcion: 'Resuelve ecuaciones que requieren dos operaciones.',
      tipo_contenido: TipoContenido.Practica,
      contenido: JSON.stringify({
        ejercicios: [
          {
            id: 1,
            problema: '2x + 3 = 11',
            pasos: [
              'Restar 3 de ambos lados: 2x = 8',
              'Dividir ambos lados entre 2: x = 4',
            ],
            respuesta: 4,
            dificultad: 'fácil',
          },
          {
            id: 2,
            problema: '5y - 7 = 18',
            pasos: [
              'Sumar 7 a ambos lados: 5y = 25',
              'Dividir ambos lados entre 5: y = 5',
            ],
            respuesta: 5,
            dificultad: 'fácil',
          },
          {
            id: 3,
            problema: '3(m + 2) = 21',
            pasos: [
              'Dividir ambos lados entre 3: m + 2 = 7',
              'Restar 2 de ambos lados: m = 5',
            ],
            respuesta: 5,
            dificultad: 'medio',
          },
        ],
      }),
      orden: 3,
      puntos_por_completar: 20,
      duracion_estimada_minutos: 15,
      activo: true,
      leccion_prerequisito_id: leccion2_2.id,
    },
  });
  console.log(
    `      • ${leccion2_3.titulo} (Práctica, 20 pts) [Prerequisito: 2.2]`,
  );

  // Lección 2.4 - Quiz final del módulo
  const leccion2_4 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-2-4' },
    update: {},
    create: {
      id: 'seed-leccion-2-4',
      modulo_id: modulo2.id,
      titulo: 'Quiz: Ecuaciones Lineales',
      descripcion: 'Evaluación final del módulo de ecuaciones.',
      tipo_contenido: TipoContenido.Quiz,
      contenido: JSON.stringify({
        preguntas: [
          {
            id: 1,
            pregunta: '¿Cuál es la solución de x + 9 = 15?',
            opciones: ['x = 6', 'x = 24', 'x = 9', 'x = -6'],
            respuesta_correcta: 0,
            explicacion: 'x = 15 - 9 = 6',
          },
          {
            id: 2,
            pregunta: 'Resuelve: 4x = 32',
            opciones: ['x = 8', 'x = 28', 'x = 128', 'x = 4'],
            respuesta_correcta: 0,
            explicacion: 'x = 32 ÷ 4 = 8',
          },
          {
            id: 3,
            pregunta: 'Resuelve: 2x + 5 = 17',
            opciones: ['x = 6', 'x = 11', 'x = 12', 'x = 8.5'],
            respuesta_correcta: 0,
            explicacion: '2x = 17 - 5 = 12, entonces x = 12 ÷ 2 = 6',
          },
          {
            id: 4,
            pregunta: '¿Qué operación es inversa a la multiplicación?',
            opciones: ['División', 'Suma', 'Resta', 'Potenciación'],
            respuesta_correcta: 0,
            explicacion: 'La división es la operación inversa de la multiplicación.',
          },
        ],
      }),
      orden: 4,
      puntos_por_completar: 20,
      duracion_estimada_minutos: 15,
      activo: true,
      leccion_prerequisito_id: leccion2_3.id,
    },
  });
  console.log(
    `      • ${leccion2_4.titulo} (Quiz, 20 pts) [Prerequisito: 2.3]`,
  );

  // ========================================
  // MÓDULO 3: Sistemas de Ecuaciones
  // ========================================
  const modulo3 = await prisma.modulo.upsert({
    where: { id: 'seed-modulo-sistemas' },
    update: {},
    create: {
      id: 'seed-modulo-sistemas',
      producto_id: producto.id,
      titulo: 'Sistemas de Ecuaciones',
      descripcion:
        'Aprende a resolver sistemas de ecuaciones lineales con dos variables usando diferentes métodos.',
      orden: 3,
      duracion_estimada_minutos: 45, // 3 lecciones
      puntos_totales: 60,
      publicado: true,
    },
  });
  console.log(`\n   ✅ Módulo 3: ${modulo3.titulo}`);

  // Lección 3.1 - Video introducción
  const leccion3_1 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-3-1' },
    update: {},
    create: {
      id: 'seed-leccion-3-1',
      modulo_id: modulo3.id,
      titulo: '¿Qué son los Sistemas de Ecuaciones?',
      descripcion:
        'Introducción a sistemas de ecuaciones lineales y sus aplicaciones.',
      tipo_contenido: TipoContenido.Video,
      contenido: JSON.stringify({
        video_url: 'https://www.youtube.com/watch?v=example-systems',
        duracion: '13:45',
        subtitulos: true,
      }),
      orden: 1,
      puntos_por_completar: 15,
      duracion_estimada_minutos: 15,
      activo: true,
    },
  });
  console.log(`      • ${leccion3_1.titulo} (Video, 15 pts)`);

  // Lección 3.2 - Texto: Método de sustitución
  const leccion3_2 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-3-2' },
    update: {},
    create: {
      id: 'seed-leccion-3-2',
      modulo_id: modulo3.id,
      titulo: 'Método de Sustitución',
      descripcion: 'Aprende a resolver sistemas usando el método de sustitución.',
      tipo_contenido: TipoContenido.Texto,
      contenido: `# Método de Sustitución

## ¿Qué es un sistema de ecuaciones?

Un **sistema de ecuaciones** es un conjunto de dos o más ecuaciones con las mismas variables.

Ejemplo:
\`\`\`
x + y = 10
x - y = 4
\`\`\`

## Método de Sustitución

### Pasos:
1. **Despejar** una variable en una ecuación
2. **Sustituir** esa expresión en la otra ecuación
3. **Resolver** para encontrar una variable
4. **Sustituir de nuevo** para encontrar la otra variable

## Ejemplo Completo

Resolver:
\`\`\`
y = 2x + 1  ... (1)
x + y = 7   ... (2)
\`\`\`

**Paso 1**: Ya tenemos y despejada en (1): \`y = 2x + 1\`

**Paso 2**: Sustituir en (2):
\`\`\`
x + (2x + 1) = 7
\`\`\`

**Paso 3**: Resolver:
\`\`\`
3x + 1 = 7
3x = 6
x = 2
\`\`\`

**Paso 4**: Sustituir x = 2 en (1):
\`\`\`
y = 2(2) + 1
y = 5
\`\`\`

**Solución**: x = 2, y = 5

**Verificación** en (2): 2 + 5 = 7 ✅

## Practica

Resuelve usando sustitución:
\`\`\`
y = x + 3
2x + y = 12
\`\`\``,
      orden: 2,
      puntos_por_completar: 20,
      duracion_estimada_minutos: 15,
      activo: true,
      leccion_prerequisito_id: leccion3_1.id,
    },
  });
  console.log(
    `      • ${leccion3_2.titulo} (Texto, 20 pts) [Prerequisito: 3.1]`,
  );

  // Lección 3.3 - Tarea final
  const leccion3_3 = await prisma.leccion.upsert({
    where: { id: 'seed-leccion-3-3' },
    update: {},
    create: {
      id: 'seed-leccion-3-3',
      modulo_id: modulo3.id,
      titulo: 'Tarea: Problemas del Mundo Real',
      descripcion:
        'Aplica lo aprendido resolviendo problemas contextualizados con sistemas de ecuaciones.',
      tipo_contenido: TipoContenido.Tarea,
      contenido: JSON.stringify({
        problemas: [
          {
            id: 1,
            enunciado:
              'En una tienda, María compró 3 cuadernos y 2 lápices por $45. Su amigo Carlos compró 2 cuadernos y 3 lápices por $40. ¿Cuánto cuesta cada artículo?',
            variables: {
              x: 'precio de un cuaderno',
              y: 'precio de un lápiz',
            },
            ecuaciones: ['3x + 2y = 45', '2x + 3y = 40'],
            solucion: { x: 11, y: 6 },
            explicacion:
              'Un cuaderno cuesta $11 y un lápiz cuesta $6. Verificación: 3(11) + 2(6) = 33 + 12 = 45 ✅',
          },
          {
            id: 2,
            enunciado:
              'Un rectángulo tiene un perímetro de 40 metros. El largo es el doble del ancho. ¿Cuáles son las dimensiones del rectángulo?',
            variables: {
              l: 'largo del rectángulo',
              a: 'ancho del rectángulo',
            },
            ecuaciones: ['2l + 2a = 40', 'l = 2a'],
            solucion: { l: 13.33, a: 6.67 },
            explicacion:
              'El largo es aproximadamente 13.33 metros y el ancho es aproximadamente 6.67 metros.',
          },
        ],
        fecha_entrega: '2025-11-22',
        instrucciones:
          'Resuelve cada problema mostrando todos los pasos: definición de variables, planteamiento de ecuaciones, método de solución y verificación.',
      }),
      orden: 3,
      puntos_por_completar: 25,
      duracion_estimada_minutos: 20,
      activo: true,
      leccion_prerequisito_id: leccion3_2.id,
    },
  });
  console.log(
    `      • ${leccion3_3.titulo} (Tarea, 25 pts) [Prerequisito: 3.2]`,
  );

  // Recalcular puntos de cada módulo (suma de puntos de lecciones)
  await recalcularPuntosTodos();

  console.log('\n✅ Curso "Fundamentos de Álgebra" creado exitosamente!');
  console.log('   📊 Resumen:');
  console.log('      • 3 módulos temáticos');
  console.log('      • 10 lecciones con Progressive Disclosure');
  console.log('      • Tipos de contenido: Video, Texto, Quiz, Práctica, Tarea');
  console.log('      • Puntos totales del curso: ~145 pts');
  console.log('      • Duración estimada total: ~2.5 horas');
}

/**
 * Inscribe al estudiante1 de prueba al curso de Álgebra
 * para permitir testing del endpoint de completar lecciones
 */
async function seedInscripcionEstudiante() {
  console.log('\n📝 Inscribiendo estudiante1 al curso de Álgebra...');

  const estudiante = await prisma.estudiante.findUnique({
    where: { email: 'estudiante1@test.com' },
  });

  const producto = await prisma.producto.findUnique({
    where: { id: 'seed-curso-algebra-basica' },
  });

  if (!estudiante || !producto) {
    console.log('   ⚠️  Estudiante o producto no encontrado, saltando...');
    return;
  }

  await prisma.inscripcionCurso.upsert({
    where: {
      estudiante_id_producto_id: {
        estudiante_id: estudiante.id,
        producto_id: producto.id,
      },
    },
    update: {},
    create: {
      estudiante_id: estudiante.id,
      producto_id: producto.id,
      estado: 'Activo',
      fecha_inscripcion: new Date(),
    },
  });

  console.log('   ✅ Estudiante1 inscrito en el curso de Álgebra');
}

/**
 * Recalcula los puntos totales de todos los módulos
 * basándose en la suma de puntos de sus lecciones
 */
async function recalcularPuntosTodos() {
  const modulos = await prisma.modulo.findMany({
    include: {
      lecciones: {
        where: { activo: true },
      },
    },
  });

  for (const modulo of modulos) {
    const puntosTotal = modulo.lecciones.reduce(
      (sum, leccion) => sum + leccion.puntos_por_completar,
      0,
    );

    const duracionTotal = modulo.lecciones.reduce(
      (sum, leccion) => sum + (leccion.duracion_estimada_minutos || 0),
      0,
    );

    await prisma.modulo.update({
      where: { id: modulo.id },
      data: {
        puntos_totales: puntosTotal,
        duracion_estimada_minutos: duracionTotal,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
