import type { Course, PricingOption, FAQ, CourseDetails } from '@/types/colonia';

/**
 * Catálogo completo de cursos de la Colonia de Verano 2026
 */
export const COURSES: Course[] = [
  // MATEMÁTICA (5 cursos)
  {
    id: 'mat-juegos-desafios',
    name: 'Matemática con Juegos y Desafíos',
    area: 'Matemática',
    ageRange: '8-9',
    description: 'Escape rooms matemáticos, batallas de matehéroes, construcción de imperio y desafíos finales. Aprende matemática jugando sin darte cuenta.',
    color: '#10b981',
    icon: '🎯',
    schedules: [
      {
        id: 'mat-juegos-desafios',
        dayOfWeek: 'Lunes',
        timeSlot: '10:30-12:00',
        instructor: 'Gimena',
      },
    ],
  },
  {
    id: 'mat-proyectos-reales',
    name: 'Matemática en Acción: Proyectos Reales',
    area: 'Matemática',
    ageRange: '10-12',
    description: 'Organiza tu fiesta épica, diseña tu cuarto ideal, planifica tu viaje soñado. Matemática aplicada a proyectos que te importan.',
    color: '#10b981',
    icon: '🎨',
    schedules: [
      {
        id: 'mat-proyectos-reales',
        dayOfWeek: 'Martes',
        timeSlot: '10:30-12:00',
        instructor: 'Gimena',
      },
    ],
  },
  {
    id: 'mat-superheroes',
    name: 'Superhéroes de los Números',
    area: 'Matemática',
    ageRange: '6-7',
    description: 'Aprende las 4 operaciones básicas (suma, resta, multiplicación, división) convirtiéndote en un superhéroe matemático.',
    color: '#10b981',
    icon: '🦸',
    schedules: [
      {
        id: 'mat-superheroes',
        dayOfWeek: 'Miércoles',
        timeSlot: '10:30-12:00',
        instructor: 'Gimena',
      },
    ],
  },
  {
    id: 'mat-olimpico',
    name: 'Iniciación a las Olimpiadas de Matemática',
    area: 'Matemática',
    ageRange: '10-12',
    description: 'Problemas de lógica y razonamiento estilo Olimpiadas de Matemática (OMA). Desarrolla tu pensamiento crítico.',
    color: '#10b981',
    icon: '🏆',
    schedules: [
      {
        id: 'mat-olimpico',
        dayOfWeek: 'Jueves',
        timeSlot: '10:30-12:00',
        instructor: 'Fabricio',
      },
    ],
  },
  {
    id: 'mat-iniciacion',
    name: 'Iniciación de las Matemáticas',
    area: 'Didáctica de la Matemática',
    ageRange: '5-6',
    description: 'Introducción amigable al mundo de los números. Aprende a contar, reconocer formas y desarrollar pensamiento lógico temprano. Ideal para prepararse para primer grado.',
    color: '#10b981',
    icon: '🌟',
    schedules: [
      {
        id: 'mat-iniciacion-lunes',
        dayOfWeek: 'Lunes',
        timeSlot: '15:00-16:00',
        instructor: 'Ayelen',
      },
      {
        id: 'mat-iniciacion-jueves',
        dayOfWeek: 'Jueves',
        timeSlot: '10:30-11:30',
        instructor: 'Ayelen',
      },
    ],
  },
  {
    id: 'mat-dominio-operaciones',
    name: 'Dominio de las Operaciones Básicas',
    area: 'Didáctica de la Matemática',
    ageRange: '8-9',
    description: 'Domina suma, resta, multiplicación y división con técnicas didácticas probadas. Refuerza las bases matemáticas para destacarte en la escuela.',
    color: '#10b981',
    icon: '➕',
    schedules: [
      {
        id: 'mat-dominio-operaciones-martes',
        dayOfWeek: 'Martes',
        timeSlot: '14:30-16:00',
        instructor: 'Ayelen',
      },
      {
        id: 'mat-dominio-operaciones-miercoles',
        dayOfWeek: 'Miércoles',
        timeSlot: '10:30-12:00',
        instructor: 'Ayelen',
      },
    ],
  },

  // PROGRAMACIÓN (4 cursos)
  {
    id: 'prog-scratch',
    name: 'Crea tu Videojuego con Scratch',
    area: 'Programación',
    ageRange: '8-9',
    description: 'Programa tu primer videojuego desde cero. Aprende movimiento, enemigos, puntos y vidas. ¡Tu juego completo en 8 semanas!',
    color: '#f43f5e',
    icon: '🎮',
    schedules: [
      {
        id: 'prog-scratch',
        dayOfWeek: 'Lunes',
        timeSlot: '10:30-12:00',
        instructor: 'Fabricio',
      },
    ],
  },
  {
    id: 'prog-robotica',
    name: 'Robótica Virtual con Arduino y Tinkercad',
    area: 'Programación',
    ageRange: '10-12',
    description: 'Diseña circuitos, programa LEDs, botones, sensores y motores. Construye tu robot virtual sin necesidad de hardware.',
    color: '#f43f5e',
    icon: '🤖',
    schedules: [
      {
        id: 'prog-robotica',
        dayOfWeek: 'Martes',
        timeSlot: '10:30-12:00',
        instructor: 'Fabricio',
      },
    ],
  },
  {
    id: 'prog-roblox',
    name: 'Roblox Studio: Crea y Publica tu Juego',
    area: 'Programación',
    ageRange: '10-12',
    description: 'Diseña mundos 3D, programa con Lua, crea mecánicas de juego y publica en la plataforma Roblox. ¡Millones pueden jugar tu creación!',
    color: '#f43f5e',
    icon: '🌍',
    schedules: [
      {
        id: 'prog-roblox',
        dayOfWeek: 'Lunes',
        timeSlot: '14:30-16:00',
        instructor: 'Alexis',
      },
    ],
  },
  {
    id: 'prog-godot',
    name: 'Desarrollo de Videojuegos con Godot Engine',
    area: 'Programación',
    ageRange: '13-17',
    description: 'Motor profesional de desarrollo de juegos. Aprende escenas, nodos, scripting y física. Crea tu juego 2D como un desarrollador real.',
    color: '#f43f5e',
    icon: '🕹️',
    schedules: [
      {
        id: 'prog-godot',
        dayOfWeek: 'Martes',
        timeSlot: '14:30-16:00',
        instructor: 'Alexis',
      },
    ],
  },

  // CIENCIAS (2 cursos)
  {
    id: 'cienc-dinosaurios',
    name: 'Científicos de Dinosaurios: Paleontología',
    area: 'Ciencias',
    ageRange: '8-12',
    description: 'Explora la era de los dinosaurios: fósiles, evolución, extinción y recreación de especies. ¡Conviértete en paleontólogo!',
    color: '#0ea5e9',
    icon: '🦕',
    schedules: [
      {
        id: 'cienc-dinosaurios',
        dayOfWeek: 'Miércoles',
        timeSlot: '10:30-12:00',
        instructor: 'Alexis',
      },
    ],
  },
  {
    id: 'cienc-tierra',
    name: 'Expedición Tierra: Misterios del Planeta',
    area: 'Ciencias',
    ageRange: '8-12',
    description: 'Volcanes, terremotos, océanos misteriosos, atmósfera extrema. Descubre los secretos más increíbles de nuestro planeta.',
    color: '#0ea5e9',
    icon: '🌋',
    schedules: [
      {
        id: 'cienc-tierra',
        dayOfWeek: 'Jueves',
        timeSlot: '10:30-12:00',
        instructor: 'Alexis',
      },
    ],
  },
];

/**
 * Detalles completos de cada curso
 */
export const COURSE_DETAILS_MAP: Record<string, CourseDetails> = {
  'mat-juegos-desafios': {
    temario: [
      'Semana 1: Escape Room Matemático - Resuelve acertijos con sumas y restas',
      'Semana 2: Batalla de Matehéroes - Combates usando multiplicación',
      'Semana 3: Construcción de Imperio - Geometría y medidas',
      'Semana 4: Desafío del Tesoro - Problemas con fracciones simples',
      'Semana 5: Torneo de Cálculo Mental - Estrategias de cálculo rápido',
      'Semana 6: Misión Espacial - Operaciones combinadas',
      'Semana 7: Gran Competencia - Todos los conceptos integrados',
      'Semana 8: Desafío Final - Proyecto integrador matemático',
    ],
    objetivos: [
      'Dominar las 4 operaciones básicas de forma divertida',
      'Desarrollar estrategias de cálculo mental',
      'Resolver problemas matemáticos con confianza',
      'Aplicar matemática en situaciones de juego',
    ],
    metodologia: 'Aprendizaje basado en juegos. Cada clase es una nueva aventura donde los conceptos matemáticos se presentan como desafíos a resolver. Los estudiantes trabajan en equipos, compiten sanamente y ganan puntos por cada logro.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Cuaderno y lápiz para hacer cálculos',
      'Edad: 8-9 años',
    ],
  },
  'mat-proyectos-reales': {
    temario: [
      'Semana 1: Planifica tu Fiesta Épica - Presupuesto y porcentajes',
      'Semana 2: Diseña tu Cuarto Ideal - Medidas, área y perímetro',
      'Semana 3: Viaje Soñado - Distancias, tiempos y conversiones',
      'Semana 4: Recetas del Chef - Proporciones y fracciones',
      'Semana 5: Tienda Online - Ventas, descuentos y ganancias',
      'Semana 6: Estudio de Cine - Estadísticas y gráficos',
      'Semana 7: Arquitecto Jr - Escalas y planos',
      'Semana 8: Proyecto Final - Presenta tu proyecto completo',
    ],
    objetivos: [
      'Aplicar matemática a situaciones reales y relevantes',
      'Trabajar con presupuestos, medidas y porcentajes',
      'Desarrollar pensamiento crítico y toma de decisiones',
      'Crear un proyecto final presentable',
    ],
    metodologia: 'Metodología de proyectos. Cada semana trabajamos en un proyecto diferente que requiere aplicar conceptos matemáticos para resolver problemas reales. Los estudiantes toman decisiones, calculan, diseñan y presentan sus resultados.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Calculadora (puede ser de la compu)',
      'Materiales de dibujo (papel, regla, colores)',
      'Edad: 10-12 años',
    ],
  },
  'mat-superheroes': {
    temario: [
      'Semana 1: Origen del Superhéroe - Introducción a las sumas',
      'Semana 2: Primeras Misiones - Restas básicas',
      'Semana 3: Entrenamiento Avanzado - Sumas y restas con llevadas',
      'Semana 4: El Poder de Multiplicar - Tablas del 2, 3 y 5',
      'Semana 5: Multiplicación Heroica - Tablas del 4, 6 y 8',
      'Semana 6: División Justiciera - Introducción a la división',
      'Semana 7: Liga de Superhéroes - Operaciones combinadas',
      'Semana 8: Batalla Final - Demuestra tus superpoderes',
    ],
    objetivos: [
      'Aprender las 4 operaciones básicas desde cero',
      'Memorizar las tablas de multiplicar de forma divertida',
      'Ganar confianza en matemática',
      'Prepararse para primer grado',
    ],
    metodologia: 'Narrativa inmersiva de superhéroes. Cada concepto matemático es un "superpoder" que los niños desbloquean. Usamos juegos, desafíos y misiones para practicar. Refuerzo positivo constante y celebración de logros.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Cuaderno y lápiz',
      'Edad: 6-7 años',
      'No requiere conocimientos previos',
    ],
  },
  'mat-olimpico': {
    temario: [
      'Semana 1: Estrategias de Resolución - Polya y heurísticas',
      'Semana 2: Problemas de Lógica - Razonamiento deductivo',
      'Semana 3: Patrones y Secuencias - Pensamiento algebraico',
      'Semana 4: Geometría Olímpica - Figuras, áreas y ángulos',
      'Semana 5: Combinatoria Básica - Conteo y probabilidad',
      'Semana 6: Divisibilidad y Primos - Teoría de números',
      'Semana 7: Problemas Integrados - Múltiples conceptos',
      'Semana 8: Simulacro OMA - Preparación para olimpiadas',
    ],
    objetivos: [
      'Desarrollar pensamiento lógico y razonamiento crítico',
      'Aprender técnicas de resolución de problemas',
      'Prepararse para competencias matemáticas',
      'Disfrutar los desafíos matemáticos complejos',
    ],
    metodologia: 'Entrenamiento estilo Olimpiadas. Trabajamos con problemas desafiantes que requieren creatividad y pensamiento lateral. Los estudiantes aprenden técnicas específicas de resolución y practican en un ambiente colaborativo. Feedback personalizado constante.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Cuaderno para tomar notas y hacer diagramas',
      'Edad: 10-12 años',
      'Se recomienda buen nivel de matemática escolar',
    ],
  },
  'prog-scratch': {
    temario: [
      'Semana 1: Introducción a Scratch - Movimientos y coordenadas',
      'Semana 2: Controles y Eventos - Teclado y mouse',
      'Semana 3: Variables y Puntaje - Sistema de puntos',
      'Semana 4: Enemigos y Colisiones - Detectar tocando',
      'Semana 5: Vidas y Game Over - Lógica de juego',
      'Semana 6: Niveles Múltiples - Progresión del juego',
      'Semana 7: Sonidos y Efectos - Pulido del juego',
      'Semana 8: Publicación - Comparte tu juego con el mundo',
    ],
    objetivos: [
      'Crear un videojuego completo y funcional',
      'Aprender conceptos de programación (variables, condicionales, bucles)',
      'Desarrollar lógica y pensamiento computacional',
      'Publicar tu juego en la comunidad Scratch',
    ],
    metodologia: 'Aprendizaje por proyectos. Desde el día 1 empezamos a construir un juego. Cada semana agregamos una nueva mecánica. Los estudiantes siguen tutoriales paso a paso y luego personalizan con su creatividad. Al final tienen un juego completo.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Crear cuenta gratuita en scratch.mit.edu',
      'Edad: 8-9 años',
      'No requiere experiencia previa',
    ],
  },
  'prog-robotica': {
    temario: [
      'Semana 1: Introducción a Arduino - LEDs y circuitos básicos',
      'Semana 2: Botones y Entradas - Control interactivo',
      'Semana 3: Sensores de Distancia - Detectar obstáculos',
      'Semana 4: Motores y Servos - Movimiento robótico',
      'Semana 5: Displays y Comunicación - Mostrar información',
      'Semana 6: Robot Evita Obstáculos - Proyecto integrador',
      'Semana 7: Sensores Avanzados - Luz, temperatura, sonido',
      'Semana 8: Proyecto Final - Tu robot personalizado',
    ],
    objetivos: [
      'Entender fundamentos de electrónica y circuitos',
      'Programar Arduino usando lenguaje C++',
      'Diseñar y simular robots virtuales',
      'Integrar sensores, motores y lógica de control',
    ],
    metodologia: 'Robótica virtual en Tinkercad. Usamos simuladores online para diseñar circuitos reales sin necesidad de hardware físico. Los estudiantes arrastran componentes, los conectan y los programan. Ven los resultados en tiempo real. Es como tener un laboratorio completo en casa.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Crear cuenta gratuita en tinkercad.com',
      'Edad: 10-12 años',
      'Recomendable conocimientos básicos de programación',
    ],
  },
  'prog-roblox': {
    temario: [
      'Semana 1: Roblox Studio Básico - Interface y herramientas',
      'Semana 2: Construcción 3D - Crear tu mundo',
      'Semana 3: Introducción a Lua - Variables y funciones',
      'Semana 4: Scripts Interactivos - Botones, puertas y trampas',
      'Semana 5: Sistema de Teletransporte - Conectar áreas',
      'Semana 6: Coleccionables y Puntos - Sistema de recompensas',
      'Semana 7: Pulido y Testing - Mejorar la experiencia',
      'Semana 8: Publicación - Tu juego en Roblox público',
    ],
    objetivos: [
      'Crear mundos 3D interactivos en Roblox',
      'Aprender programación con Lua',
      'Diseñar mecánicas de juego funcionales',
      'Publicar un juego jugable por otros',
    ],
    metodologia: 'Creación de juegos en Roblox Studio. Los estudiantes aprenden diseño 3D y programación Lua al mismo tiempo. Cada clase construye sobre la anterior para crear un juego completo. Al final lo publican y sus amigos pueden jugarlo. Es motivador ver tu creación cobrar vida.',
    requisitos: [
      'Computadora con conexión a internet (Windows o Mac)',
      'Google Meet (acceso desde el navegador)',
      'Descargar Roblox Studio (gratuito)',
      'Crear cuenta en roblox.com',
      'Edad: 10-12 años',
      'No requiere experiencia previa',
    ],
  },
  'prog-godot': {
    temario: [
      'Semana 1: Introducción a Godot - Interfaz y nodos',
      'Semana 2: Escenas y Sprites - Tu personaje 2D',
      'Semana 3: Movimiento y Input - Controles del jugador',
      'Semana 4: Colisiones y Física - Interacción con el mundo',
      'Semana 5: Enemigos y Comportamiento - IA básica',
      'Semana 6: UI y HUD - Interfaz de usuario',
      'Semana 7: Sonidos y Animaciones - Efectos visuales',
      'Semana 8: Exportar tu Juego - Build y distribución',
    ],
    objetivos: [
      'Dominar un motor de juegos profesional',
      'Crear un juego 2D completo con física',
      'Aprender GDScript (similar a Python)',
      'Exportar tu juego como ejecutable',
    ],
    metodologia: 'Desarrollo profesional con Godot Engine. Trabajamos con el mismo motor que usan estudios indie reales. Los estudiantes aprenden arquitectura de escenas, programación orientada a objetos y diseño de juegos. Es un paso más allá de Scratch, para quienes quieren crear juegos más complejos.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Descargar Godot Engine (gratuito y open source)',
      'Edad: 13-17 años',
      'Recomendable experiencia previa en Scratch u otra plataforma',
    ],
  },
  'cienc-dinosaurios': {
    temario: [
      'Semana 1: Era Mesozoica - Triásico, Jurásico, Cretácico',
      'Semana 2: Tipos de Dinosaurios - Carnívoros, herbívoros y omnívoros',
      'Semana 3: Fósiles y Paleontología - Cómo sabemos lo que sabemos',
      'Semana 4: Extinción Masiva - Teorías del meteorito y volcanes',
      'Semana 5: Evolución de las Aves - Los dinosaurios nunca se extinguieron',
      'Semana 6: Excavación Virtual - Simulación de sitio paleontológico',
      'Semana 7: Recreación 3D - Cómo eran realmente los dinosaurios',
      'Semana 8: Proyecto Final - Presenta tu dinosaurio favorito',
    ],
    objetivos: [
      'Entender la evolución y extinción de los dinosaurios',
      'Aprender métodos científicos de la paleontología',
      'Desarrollar pensamiento crítico sobre evidencia científica',
      'Diferenciar mitos de realidad científica',
    ],
    metodologia: 'Ciencia basada en evidencia. Analizamos fósiles reales (en imágenes), estudiamos papers científicos adaptados para niños, vemos recreaciones 3D modernas y comparamos con películas. Los estudiantes aprenden a pensar como científicos: observar, hipotetizar, buscar evidencia.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Cuaderno para tomar notas',
      'Edad: 8-12 años',
      'Pasión por los dinosaurios',
    ],
  },
  'cienc-tierra': {
    temario: [
      'Semana 1: Estructura de la Tierra - Capas y composición',
      'Semana 2: Volcanes Extremos - Tipos, erupciones y lava',
      'Semana 3: Terremotos y Placas Tectónicas - Cómo se mueve el suelo',
      'Semana 4: Océanos Profundos - Fosas, montañas submarinas y criaturas',
      'Semana 5: Atmósfera y Clima - Tormentas, huracanes y fenómenos',
      'Semana 6: Glaciares y Polos - Hielo, cambio climático',
      'Semana 7: Recursos Naturales - Agua, minerales y energía',
      'Semana 8: Proyecto Final - Expedición virtual a un lugar extremo',
    ],
    objetivos: [
      'Comprender los procesos geológicos del planeta',
      'Entender fenómenos naturales extremos',
      'Desarrollar conciencia ambiental',
      'Aplicar método científico a la geología',
    ],
    metodologia: 'Expediciones virtuales. Cada clase es una expedición a un lugar extremo de la Tierra: el volcán más activo, la fosa más profunda, el desierto más seco. Usamos Google Earth, videos científicos, simulaciones y datos reales de la NASA. Los estudiantes se convierten en exploradores.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Google Earth instalado (opcional pero recomendado)',
      'Edad: 8-12 años',
      'Curiosidad por el planeta',
    ],
  },
  'mat-iniciacion-lunes': {
    temario: [
      'Semana 1: Los Números son Nuestros Amigos - Conteo y reconocimiento hasta 20',
      'Semana 2: Juntar y Separar - Primeras sumas con objetos concretos',
      'Semana 3: Historias con Números - Restas simples con materiales',
      'Semana 4: Comparando Cantidades - Mayor, menor, igual',
      'Semana 5: Formas que nos Rodean - Círculos, cuadrados, triángulos',
      'Semana 6: Medimos el Mundo - Largo, corto, alto, bajo',
      'Semana 7: Ordenamos y Clasificamos - Patrones y secuencias simples',
      'Semana 8: Fiesta Matemática - Integración lúdica de conceptos',
    ],
    objetivos: [
      'Desarrollar el sentido numérico básico (0-20)',
      'Iniciarse en operaciones con material concreto',
      'Reconocer formas geométricas básicas',
      'Prepararse para el ingreso a primer grado',
    ],
    metodologia: 'Didáctica de la matemática temprana. Trabajo con material concreto, juegos manipulativos, canciones matemáticas y cuentos numéricos. Respetamos el ritmo de cada niño y celebramos cada pequeño logro. Metodología lúdica adaptada a 5-6 años.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Materiales: bloques, fichas o elementos para contar',
      'Cuaderno y lápices de colores',
      'Edad: 5-6 años',
      'No requiere conocimientos previos',
    ],
  },
  'mat-iniciacion-jueves': {
    temario: [
      'Semana 1: Los Números son Nuestros Amigos - Conteo y reconocimiento hasta 20',
      'Semana 2: Juntar y Separar - Primeras sumas con objetos concretos',
      'Semana 3: Historias con Números - Restas simples con materiales',
      'Semana 4: Comparando Cantidades - Mayor, menor, igual',
      'Semana 5: Formas que nos Rodean - Círculos, cuadrados, triángulos',
      'Semana 6: Medimos el Mundo - Largo, corto, alto, bajo',
      'Semana 7: Ordenamos y Clasificamos - Patrones y secuencias simples',
      'Semana 8: Fiesta Matemática - Integración lúdica de conceptos',
    ],
    objetivos: [
      'Desarrollar el sentido numérico básico (0-20)',
      'Iniciarse en operaciones con material concreto',
      'Reconocer formas geométricas básicas',
      'Prepararse para el ingreso a primer grado',
    ],
    metodologia: 'Didáctica de la matemática temprana. Trabajo con material concreto, juegos manipulativos, canciones matemáticas y cuentos numéricos. Respetamos el ritmo de cada niño y celebramos cada pequeño logro. Metodología lúdica adaptada a 5-6 años.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Materiales: bloques, fichas o elementos para contar',
      'Cuaderno y lápices de colores',
      'Edad: 5-6 años',
      'No requiere conocimientos previos',
    ],
  },
  'mat-dominio-operaciones-martes': {
    temario: [
      'Semana 1: Maestros de la Suma - Sumas con llevadas y estrategias',
      'Semana 2: Expertos en Resta - Restas con prestadas y verificación',
      'Semana 3: Tablas Divertidas - Multiplicación del 2, 3, 4 y 5',
      'Semana 4: Más Tablas - Multiplicación del 6, 7, 8 y 9',
      'Semana 5: División Inteligente - División como reparto equitativo',
      'Semana 6: División Exacta - División y su relación con multiplicación',
      'Semana 7: Operaciones Combinadas - Problemas que integran las 4 operaciones',
      'Semana 8: Desafío Final - Demostración de dominio completo',
    ],
    objetivos: [
      'Dominar las 4 operaciones básicas con fluidez',
      'Memorizar todas las tablas de multiplicar',
      'Resolver problemas aplicando la operación correcta',
      'Desarrollar cálculo mental ágil',
    ],
    metodologia: 'Práctica sistemática y estratégica. Cada operación se trabaja con múltiples estrategias (descomposición, recta numérica, algoritmos). Incluye juegos de cálculo mental, desafíos cronometrados y problemas contextualizados. Metodología de dominio progresivo adaptada a 8-9 años.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Cuaderno de matemática',
      'Lápiz y goma',
      'Edad: 8-9 años',
      'Se recomienda conocer números hasta 100',
    ],
  },
  'mat-dominio-operaciones-miercoles': {
    temario: [
      'Semana 1: Maestros de la Suma - Sumas con llevadas y estrategias',
      'Semana 2: Expertos en Resta - Restas con prestadas y verificación',
      'Semana 3: Tablas Divertidas - Multiplicación del 2, 3, 4 y 5',
      'Semana 4: Más Tablas - Multiplicación del 6, 7, 8 y 9',
      'Semana 5: División Inteligente - División como reparto equitativo',
      'Semana 6: División Exacta - División y su relación con multiplicación',
      'Semana 7: Operaciones Combinadas - Problemas que integran las 4 operaciones',
      'Semana 8: Desafío Final - Demostración de dominio completo',
    ],
    objetivos: [
      'Dominar las 4 operaciones básicas con fluidez',
      'Memorizar todas las tablas de multiplicar',
      'Resolver problemas aplicando la operación correcta',
      'Desarrollar cálculo mental ágil',
    ],
    metodologia: 'Práctica sistemática y estratégica. Cada operación se trabaja con múltiples estrategias (descomposición, recta numérica, algoritmos). Incluye juegos de cálculo mental, desafíos cronometrados y problemas contextualizados. Metodología de dominio progresivo adaptada a 8-9 años.',
    requisitos: [
      'Computadora con conexión a internet',
      'Google Meet (acceso desde el navegador)',
      'Cuaderno de matemática',
      'Lápiz y goma',
      'Edad: 8-9 años',
      'Se recomienda conocer números hasta 100',
    ],
  },
};

/**
 * Opciones de precios
 * 1 curso: $55,000
 * 2 cursos: $96,800 (12% descuento)
 */
export const PRICING_OPTIONS: PricingOption[] = [
  {
    courses: 1,
    price: 55000,
    features: [
      '1 clase semanal (90 minutos)',
      '8 semanas de contenido',
      'Certificado digital al finalizar',
      'Acceso a plataforma LMS',
      'Sistema de gamificación',
      'Soporte de profesor',
    ],
  },
  {
    courses: 2,
    price: 96800,
    originalPrice: 110000,
    discount: 'Ahorrás $13,200 (12% OFF)',
    features: [
      '2 clases semanales (90 min c/u)',
      '8 semanas de contenido',
      '2 Certificados digitales',
      'Acceso completo a plataforma',
      'Logros de verano exclusivos',
      'Ranking semanal',
      'Avatares especiales',
    ],
  },
];

/**
 * Preguntas frecuentes
 */
export const FAQS: FAQ[] = [
  {
    question: '¿Qué pasa si mi hijo falta a una clase?',
    answer: 'Todas las clases quedan grabadas y disponibles en la plataforma durante todo el verano. Tu hijo puede verla cuando quiera y al ritmo que prefiera.',
  },
  {
    question: '¿Necesita conocimientos previos?',
    answer: 'No! Cada curso está diseñado para que pueda empezar desde cero. Los cursos están organizados por edad para asegurar que el contenido sea apropiado.',
  },
  {
    question: '¿Qué materiales necesita?',
    answer: 'Solo una computadora con conexión a internet y muchas ganas de aprender. Todas las herramientas que usamos son gratuitas y te damos las instrucciones de instalación.',
  },
  {
    question: '¿Cómo son las clases?',
    answer: 'Son 100% en vivo por Google Meet. El profe explica, los chicos participan, hacen actividades prácticas y se divierten. Nada de videos pregrabados aburridos.',
  },
  {
    question: '¿Hay límite de cupos?',
    answer: 'Sí, cada curso tiene un máximo de 10 estudiantes para asegurar atención personalizada. Las vacantes se asignan por orden de inscripción.',
  },
  {
    question: '¿Qué incluye el sistema de gamificación?',
    answer: 'Los estudiantes ganan XP (experiencia) doble durante el verano, desbloquean insignias exclusivas, suben en el ranking semanal y obtienen avatares especiales de verano.',
  },
  {
    question: '¿Cómo funcionan los descuentos?',
    answer: 'Si inscribís 2+ hermanos O eligen 2+ cursos en total: 12% de descuento por curso. Si inscribís 2+ hermanos Y eligen 2+ cursos en total: 20% de descuento por curso (máximo). Los descuentos se aplican automáticamente.',
  },
  {
    question: '¿Trabajan el feriado de carnaval?',
    answer: 'No, respetamos el feriado de carnaval. Las fechas están planificadas para garantizar que todos tengan las 8 semanas completas de clases sin superponerse con el feriado.',
  },
  {
    question: '¿Puedo cambiar de curso una vez inscripto?',
    answer: 'Sí, durante la primera semana podés cambiar de curso sin costo adicional si sentís que no era el indicado.',
  },
];
