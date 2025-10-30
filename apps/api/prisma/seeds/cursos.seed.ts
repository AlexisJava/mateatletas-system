import { PrismaClient } from '@prisma/client';

const cursos = [
  // ==========================================
  // CATEGORÍA: QUÍMICA
  // ==========================================
  {
    codigo: 'quimica_explosiva',
    titulo: 'Química Explosiva: Experimentos Increíbles',
    descripcion: 'Conviértete en un científico loco y aprende química haciendo experimentos seguros pero asombrosos. Crearemos volcanes, slime, cristales y más.',
    categoria: 'ciencia',
    subcategoria: 'quimica',
    duracion_clases: 8,
    nivel_requerido: 1,
    precio_usd: 25.00,
    precio_monedas: 500,
    imagen_url: '/cursos/quimica-explosiva.jpg',
    destacado: true,
    nuevo: true,
    orden: 1,
    activo: true,
  },
  {
    codigo: 'alquimia_moderna',
    titulo: 'Alquimia Moderna: De la Magia a la Ciencia',
    descripcion: 'Descubre cómo la química moderna nació de la alquimia antigua. Aprende sobre elementos, reacciones químicas y la tabla periódica de forma divertida.',
    categoria: 'ciencia',
    subcategoria: 'quimica',
    duracion_clases: 6,
    nivel_requerido: 2,
    precio_usd: 30.00,
    precio_monedas: 600,
    imagen_url: '/cursos/alquimia-moderna.jpg',
    destacado: false,
    nuevo: false,
    orden: 2,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: ASTRONOMÍA
  // ==========================================
  {
    codigo: 'exploradores_espaciales',
    titulo: 'Exploradores Espaciales: Viaje al Sistema Solar',
    descripcion: 'Embárcate en una aventura por el espacio. Visita planetas, aprende sobre estrellas, agujeros negros y la exploración espacial.',
    categoria: 'ciencia',
    subcategoria: 'astronomia',
    duracion_clases: 10,
    nivel_requerido: 1,
    precio_usd: 35.00,
    precio_monedas: 700,
    imagen_url: '/cursos/exploradores-espaciales.jpg',
    destacado: true,
    nuevo: true,
    orden: 3,
    activo: true,
  },
  {
    codigo: 'mision_marte',
    titulo: 'Misión a Marte: Colonización del Planeta Rojo',
    descripcion: 'Diseña tu propia misión a Marte. Aprende sobre cohetes, vida en otros planetas y cómo los humanos podrían vivir en Marte algún día.',
    categoria: 'ciencia',
    subcategoria: 'astronomia',
    duracion_clases: 8,
    nivel_requerido: 3,
    precio_usd: 40.00,
    precio_monedas: 800,
    imagen_url: '/cursos/mision-marte.jpg',
    destacado: true,
    nuevo: false,
    orden: 4,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: FÍSICA
  // ==========================================
  {
    codigo: 'fuerzas_movimiento',
    titulo: 'Fuerzas y Movimiento: Física en Acción',
    descripcion: 'Descubre las leyes de Newton mientras construyes catapultas, rampas y experimentos de física. Aprende cómo funcionan las cosas.',
    categoria: 'ciencia',
    subcategoria: 'fisica',
    duracion_clases: 8,
    nivel_requerido: 2,
    precio_usd: 30.00,
    precio_monedas: 600,
    imagen_url: '/cursos/fuerzas-movimiento.jpg',
    destacado: false,
    nuevo: false,
    orden: 5,
    activo: true,
  },
  {
    codigo: 'energia_poder',
    titulo: 'Energía y Poder: De la Electricidad a la Luz',
    descripcion: 'Explora todos los tipos de energía: eléctrica, solar, eólica. Construye circuitos simples y aprende cómo funciona la electricidad.',
    categoria: 'ciencia',
    subcategoria: 'fisica',
    duracion_clases: 10,
    nivel_requerido: 3,
    precio_usd: 45.00,
    precio_monedas: 900,
    imagen_url: '/cursos/energia-poder.jpg',
    destacado: false,
    nuevo: false,
    orden: 6,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: PROGRAMACIÓN
  // ==========================================
  {
    codigo: 'scratch_juegos',
    titulo: 'Scratch: Crea tus Propios Videojuegos',
    descripcion: 'Aprende a programar creando videojuegos con Scratch. No necesitas experiencia previa. ¡Diseña, programa y juega tus creaciones!',
    categoria: 'programacion',
    subcategoria: 'scratch',
    duracion_clases: 12,
    nivel_requerido: 1,
    precio_usd: 50.00,
    precio_monedas: 1000,
    imagen_url: '/cursos/scratch-juegos.jpg',
    destacado: true,
    nuevo: true,
    orden: 7,
    activo: true,
  },
  {
    codigo: 'python_aventuras',
    titulo: 'Python: Aventuras de Programación',
    descripcion: 'Da tus primeros pasos en Python, uno de los lenguajes más populares. Crea juegos de texto, calculadoras y proyectos divertidos.',
    categoria: 'programacion',
    subcategoria: 'python',
    duracion_clases: 16,
    nivel_requerido: 3,
    precio_usd: 80.00,
    precio_monedas: 1600,
    imagen_url: '/cursos/python-aventuras.jpg',
    destacado: true,
    nuevo: false,
    orden: 8,
    activo: true,
  },
  {
    codigo: 'web_desarrollo',
    titulo: 'Desarrollo Web: Crea tu Primera Página',
    descripcion: 'Aprende HTML, CSS y JavaScript básico. Crea tu propia página web desde cero y publícala en internet.',
    categoria: 'programacion',
    subcategoria: 'web',
    duracion_clases: 14,
    nivel_requerido: 4,
    precio_usd: 70.00,
    precio_monedas: 1400,
    imagen_url: '/cursos/web-desarrollo.jpg',
    destacado: false,
    nuevo: false,
    orden: 9,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: ROBÓTICA
  // ==========================================
  {
    codigo: 'robotica_basica',
    titulo: 'Robótica Básica: Construye tu Primer Robot',
    descripcion: 'Diseña y construye robots simples con motores y sensores. Aprende cómo funcionan los robots y programa sus movimientos.',
    categoria: 'robotica',
    subcategoria: 'construccion',
    duracion_clases: 10,
    nivel_requerido: 2,
    precio_usd: 60.00,
    precio_monedas: 1200,
    imagen_url: '/cursos/robotica-basica.jpg',
    destacado: true,
    nuevo: false,
    orden: 10,
    activo: true,
  },
  {
    codigo: 'arduino_exploradores',
    titulo: 'Arduino para Exploradores',
    descripcion: 'Aprende electrónica y programación con Arduino. Crea proyectos increíbles como semáforos, alarmas y sensores.',
    categoria: 'robotica',
    subcategoria: 'arduino',
    duracion_clases: 12,
    nivel_requerido: 4,
    precio_usd: 90.00,
    precio_monedas: 1800,
    imagen_url: '/cursos/arduino-exploradores.jpg',
    destacado: true,
    nuevo: false,
    orden: 11,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: MATEMÁTICAS APLICADAS
  // ==========================================
  {
    codigo: 'matematicas_vida',
    titulo: 'Matemáticas en la Vida Real',
    descripcion: 'Descubre cómo usamos las matemáticas todos los días: en el supermercado, en deportes, en videojuegos y más.',
    categoria: 'matematicas',
    subcategoria: 'aplicadas',
    duracion_clases: 8,
    nivel_requerido: 1,
    precio_usd: 25.00,
    precio_monedas: 500,
    imagen_url: '/cursos/matematicas-vida.jpg',
    destacado: false,
    nuevo: false,
    orden: 12,
    activo: true,
  },
  {
    codigo: 'geometria_arquitectura',
    titulo: 'Geometría y Arquitectura: Diseña Edificios',
    descripcion: 'Usa geometría para diseñar casas, puentes y rascacielos. Aprende cómo los arquitectos usan las matemáticas.',
    categoria: 'matematicas',
    subcategoria: 'geometria',
    duracion_clases: 10,
    nivel_requerido: 3,
    precio_usd: 40.00,
    precio_monedas: 800,
    imagen_url: '/cursos/geometria-arquitectura.jpg',
    destacado: false,
    nuevo: false,
    orden: 13,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: ARTE Y DISEÑO
  // ==========================================
  {
    codigo: 'diseno_3d',
    titulo: 'Diseño 3D: Crea Mundos Virtuales',
    descripcion: 'Aprende a modelar objetos en 3D con Tinkercad. Diseña personajes, edificios y objetos para imprimir en 3D.',
    categoria: 'diseno',
    subcategoria: '3d',
    duracion_clases: 12,
    nivel_requerido: 2,
    precio_usd: 55.00,
    precio_monedas: 1100,
    imagen_url: '/cursos/diseno-3d.jpg',
    destacado: false,
    nuevo: true,
    orden: 14,
    activo: true,
  },
  {
    codigo: 'animacion_digital',
    titulo: 'Animación Digital: Da Vida a tus Ideas',
    descripcion: 'Crea animaciones y videos con herramientas digitales. Aprende los fundamentos de la animación frame por frame.',
    categoria: 'diseno',
    subcategoria: 'animacion',
    duracion_clases: 14,
    nivel_requerido: 3,
    precio_usd: 65.00,
    precio_monedas: 1300,
    imagen_url: '/cursos/animacion-digital.jpg',
    destacado: false,
    nuevo: false,
    orden: 15,
    activo: true,
  },

  // ==========================================
  // CATEGORÍA: BIOLOGÍA
  // ==========================================
  {
    codigo: 'biologia_aventura',
    titulo: 'Biología: La Aventura de la Vida',
    descripcion: 'Explora el mundo de los seres vivos. Desde células hasta ecosistemas, descubre cómo funciona la vida en la Tierra.',
    categoria: 'ciencia',
    subcategoria: 'biologia',
    duracion_clases: 10,
    nivel_requerido: 2,
    precio_usd: 35.00,
    precio_monedas: 700,
    imagen_url: '/cursos/biologia-aventura.jpg',
    destacado: false,
    nuevo: false,
    orden: 16,
    activo: true,
  },
  {
    codigo: 'genetica_dna',
    titulo: 'Genética: El Código de la Vida',
    descripcion: 'Descubre cómo funciona el ADN, los genes y la herencia. Aprende por qué te pareces a tu familia.',
    categoria: 'ciencia',
    subcategoria: 'genetica',
    duracion_clases: 8,
    nivel_requerido: 4,
    precio_usd: 45.00,
    precio_monedas: 900,
    imagen_url: '/cursos/genetica-dna.jpg',
    destacado: false,
    nuevo: false,
    orden: 17,
    activo: true,
  },

  // ==========================================
  // CURSOS PREMIUM / MAESTRÍAS
  // ==========================================
  {
    codigo: 'maestria_python',
    titulo: '🏆 Maestría Python: De Novato a Experto',
    descripcion: 'Curso completo de Python con 40 clases. Desde lo básico hasta proyectos avanzados como apps web, bots y juegos.',
    categoria: 'programacion',
    subcategoria: 'python',
    duracion_clases: 40,
    nivel_requerido: 5,
    precio_usd: 200.00,
    precio_monedas: 4000,
    imagen_url: '/cursos/maestria-python.jpg',
    destacado: true,
    nuevo: true,
    orden: 18,
    activo: true,
  },
  {
    codigo: 'maestria_robotica',
    titulo: '🏆 Maestría Robótica: Construye Robots Avanzados',
    descripcion: 'Conviértete en un maestro de la robótica. Construye robots complejos, usa sensores avanzados y compite en desafíos.',
    categoria: 'robotica',
    subcategoria: 'avanzado',
    duracion_clases: 36,
    nivel_requerido: 6,
    precio_usd: 250.00,
    precio_monedas: 5000,
    imagen_url: '/cursos/maestria-robotica.jpg',
    destacado: true,
    nuevo: false,
    orden: 19,
    activo: true,
  },
  {
    codigo: 'maestria_ciencia',
    titulo: '🏆 Maestría Científica: La Academia de Ciencias',
    descripcion: 'Curso completo que combina química, física, biología y astronomía. Experimentos avanzados y proyectos científicos reales.',
    categoria: 'ciencia',
    subcategoria: 'integral',
    duracion_clases: 50,
    nivel_requerido: 7,
    precio_usd: 300.00,
    precio_monedas: 6000,
    imagen_url: '/cursos/maestria-ciencia.jpg',
    destacado: true,
    nuevo: false,
    orden: 20,
    activo: true,
  },
];

export async function seedCursos(prisma: PrismaClient) {
  console.log('📚 Seeding catálogo de cursos...');

  for (const curso of cursos) {
    await prisma.cursoCatalogo.upsert({
      where: { codigo: curso.codigo },
      update: curso,
      create: curso,
    });
  }

  console.log(`✅ Se crearon ${cursos.length} cursos en el catálogo`);
  console.log('📊 Distribución por categoría:');

  const porCategoria = cursos.reduce((acc, curso) => {
    acc[curso.categoria] = (acc[curso.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(porCategoria).forEach(([categoria, cantidad]) => {
    console.log(`  - ${categoria}: ${cantidad} cursos`);
  });
}
