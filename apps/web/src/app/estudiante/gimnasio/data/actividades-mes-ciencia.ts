/**
 * Data Mock - Actividades del Mes de la Ciencia
 * 4 semanas × 4 actividades = 16 actividades totales
 */

import type { Actividad } from '../types/actividad.types';

/**
 * SEMANA 1: QUÍMICA 🧪
 * 1 clase sincrónica (90 min) + 5 actividades asincrónicas
 */
const ACTIVIDADES_QUIMICA: readonly Actividad[] = [
  {
    id: 'quimica-clase-sincronica',
    semanaId: 'quimica',
    numero: 0, // Clase principal
    titulo: 'Clase Virtual: Laboratorio Mágico',
    descripcion:
      'Experiencia sincrónica de 90 minutos con tu docente. Simulador interactivo, quizzes en vivo y trabajo en equipos.',
    emoji: '🎬',
    tipo: 'juego', // Tipo especial para clase sincrónica
    dificultad: 'medio',
    duracionEstimada: 90,
    puntosMaximos: 500,
    xpRecompensa: 1000,
    monedasRecompensa: 250,
    estado: 'disponible',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'juego',
      juegoId: 'clase-sincronica-quimica-v1',
      instrucciones:
        'Únete a la clase virtual con tu docente y grupo. Necesitarás un link de Google Meet.',
      objetivo: 'Completar la experiencia de laboratorio químico en 90 minutos',
      config: {
        duracion: 90,
        requiereDocente: true,
        requiereMeet: true,
        fases: [
          'Introducción narrativa (5 min)',
          'Tutorial interactivo (10 min)',
          'Simulador colaborativo (30 min)',
          'Quizzes en vivo (20 min)',
          'Desafío final en equipos (20 min)',
          'Cierre y resumen (5 min)',
        ],
      },
    },
  },
  {
    id: 'quimica-01',
    semanaId: 'quimica',
    numero: 1,
    titulo: 'Introducción a los Átomos',
    descripcion: 'Descubre qué son los átomos y cómo se forman las moléculas',
    emoji: '⚛️',
    tipo: 'video',
    dificultad: 'facil',
    duracionEstimada: 10,
    puntosMaximos: 50,
    xpRecompensa: 100,
    monedasRecompensa: 25,
    estado: 'completada',
    progreso: 100,
    estrellas: 3,
    contenido: {
      tipo: 'video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duracion: 600,
      thumbnail: '/videos/atomos-intro.jpg',
      subtitulos: true,
    },
    resultado: {
      actividadId: 'quimica-01',
      completada: true,
      puntajeObtenido: 50,
      puntajeMaximo: 50,
      porcentaje: 100,
      estrellas: 3,
      tiempoEmpleado: 580,
      intentos: 1,
      fechaCompletado: new Date('2025-11-03'),
    },
  },
  {
    id: 'quimica-02',
    semanaId: 'quimica',
    numero: 2,
    titulo: 'Tabla Periódica Interactiva',
    descripcion: 'Aprende los elementos químicos jugando',
    emoji: '🧪',
    tipo: 'ejercicio',
    dificultad: 'facil',
    duracionEstimada: 15,
    puntosMaximos: 100,
    xpRecompensa: 150,
    monedasRecompensa: 50,
    estado: 'completada',
    progreso: 100,
    estrellas: 3,
    contenido: {
      tipo: 'ejercicio',
      preguntas: [
        {
          tipo: 'multiple-choice',
          enunciado: '¿Cuál es el símbolo químico del Oxígeno?',
          opciones: [
            { id: 'a', texto: 'O', esCorrecta: true },
            { id: 'b', texto: 'Ox', esCorrecta: false },
            { id: 'c', texto: 'Og', esCorrecta: false },
            { id: 'd', texto: 'H₂O', esCorrecta: false },
          ],
          explicacion:
            'El oxígeno es el elemento químico con número atómico 8 y se representa con la letra O.',
          puntaje: 25,
        },
        {
          tipo: 'fill-blank',
          enunciado: 'El agua está compuesta por 2 átomos de Hidrógeno y 1 átomo de ______',
          respuestaCorrecta: ['oxígeno', 'Oxígeno', 'oxigeno', 'Oxigeno', 'O'],
          placeholder: 'Escribe el elemento...',
          explicacion: 'La molécula de agua (H₂O) tiene 2 hidrógenos y 1 oxígeno.',
          puntaje: 25,
          caseSensitive: false,
        },
        {
          tipo: 'verdadero-falso',
          enunciado: 'El Oro es un elemento químico metálico',
          respuestaCorrecta: true,
          explicacion: 'El Oro (Au) es un metal precioso del grupo 11 de la tabla periódica.',
          puntaje: 25,
        },
        {
          tipo: 'multiple-choice',
          enunciado: '¿Qué gas respiramos para vivir?',
          opciones: [
            { id: 'a', texto: 'Nitrógeno', esCorrecta: false },
            { id: 'b', texto: 'Oxígeno', esCorrecta: true },
            { id: 'c', texto: 'Dióxido de Carbono', esCorrecta: false },
            { id: 'd', texto: 'Hidrógeno', esCorrecta: false },
          ],
          explicacion: 'Los humanos necesitamos oxígeno (O₂) para la respiración celular.',
          puntaje: 25,
        },
      ],
      intentosMaximos: 3,
      porcentajeAprobacion: 70,
    },
    resultado: {
      actividadId: 'quimica-02',
      completada: true,
      puntajeObtenido: 100,
      puntajeMaximo: 100,
      porcentaje: 100,
      estrellas: 3,
      tiempoEmpleado: 420,
      intentos: 1,
      fechaCompletado: new Date('2025-11-04'),
    },
  },
  {
    id: 'quimica-03',
    semanaId: 'quimica',
    numero: 3,
    titulo: 'Laboratorio Virtual',
    descripcion: 'Mezcla sustancias y crea reacciones químicas',
    emoji: '🔬',
    tipo: 'juego',
    dificultad: 'medio',
    duracionEstimada: 20,
    puntosMaximos: 150,
    xpRecompensa: 200,
    monedasRecompensa: 75,
    estado: 'completada',
    progreso: 100,
    estrellas: 2,
    contenido: {
      tipo: 'juego',
      juegoId: 'laboratorio-virtual-v1',
      instrucciones: 'Combina los elementos químicos para crear 10 compuestos diferentes',
      objetivo: 'Crear agua (H₂O), dióxido de carbono (CO₂) y otras moléculas',
      config: {
        nivel: 1,
        elementos: ['H', 'O', 'C', 'N', 'Na', 'Cl'],
        compuestosObjetivo: ['H2O', 'CO2', 'NaCl', 'O2', 'N2'],
      },
    },
    resultado: {
      actividadId: 'quimica-03',
      completada: true,
      puntajeObtenido: 120,
      puntajeMaximo: 150,
      porcentaje: 80,
      estrellas: 2,
      tiempoEmpleado: 1080,
      intentos: 2,
      fechaCompletado: new Date('2025-11-05'),
    },
  },
  {
    id: 'quimica-04',
    semanaId: 'quimica',
    numero: 4,
    titulo: 'Evaluación: Química Básica',
    descripcion: 'Demuestra todo lo que aprendiste sobre química',
    emoji: '📝',
    tipo: 'evaluacion',
    dificultad: 'medio',
    duracionEstimada: 25,
    puntosMaximos: 200,
    xpRecompensa: 300,
    monedasRecompensa: 100,
    estado: 'completada',
    progreso: 100,
    estrellas: 3,
    contenido: {
      tipo: 'evaluacion',
      preguntas: [
        {
          tipo: 'multiple-choice',
          enunciado: '¿Qué es un átomo?',
          opciones: [
            { id: 'a', texto: 'La unidad más pequeña de materia', esCorrecta: true },
            { id: 'b', texto: 'Una molécula grande', esCorrecta: false },
            { id: 'c', texto: 'Un tipo de energía', esCorrecta: false },
            { id: 'd', texto: 'Una célula viva', esCorrecta: false },
          ],
          explicacion: 'El átomo es la unidad más pequeña de un elemento químico.',
          puntaje: 50,
        },
        {
          tipo: 'fill-blank',
          enunciado: 'La sal de mesa está formada por Sodio (Na) y ______ (Cl)',
          respuestaCorrecta: ['Cloro', 'cloro', 'Cl'],
          explicacion: 'NaCl es cloruro de sodio (sal común).',
          puntaje: 50,
          caseSensitive: false,
        },
        {
          tipo: 'verdadero-falso',
          enunciado: 'El agua hierve a 100°C al nivel del mar',
          respuestaCorrecta: true,
          explicacion: 'A presión atmosférica normal, el agua hierve a 100°C.',
          puntaje: 50,
        },
        {
          tipo: 'multiple-choice',
          enunciado: '¿Cuántos átomos de Hidrógeno hay en H₂O?',
          opciones: [
            { id: 'a', texto: '1', esCorrecta: false },
            { id: 'b', texto: '2', esCorrecta: true },
            { id: 'c', texto: '3', esCorrecta: false },
            { id: 'd', texto: '0', esCorrecta: false },
          ],
          explicacion: 'H₂O tiene 2 átomos de Hidrógeno y 1 de Oxígeno.',
          puntaje: 50,
        },
      ],
      tiempoLimite: 1200,
      intentosMaximos: 1,
      porcentajeAprobacion: 75,
    },
    resultado: {
      actividadId: 'quimica-04',
      completada: true,
      puntajeObtenido: 200,
      puntajeMaximo: 200,
      porcentaje: 100,
      estrellas: 3,
      tiempoEmpleado: 890,
      intentos: 1,
      fechaCompletado: new Date('2025-11-06'),
    },
  },
  {
    id: 'quimica-concentraciones',
    semanaId: 'quimica',
    numero: 5,
    titulo: 'Simulador de Concentraciones',
    descripcion: 'Mezcla soluto y solvente para lograr la concentración perfecta',
    emoji: '💧',
    tipo: 'juego',
    dificultad: 'medio',
    duracionEstimada: 15,
    puntosMaximos: 150,
    xpRecompensa: 200,
    monedasRecompensa: 75,
    estado: 'disponible',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'juego',
      juegoId: 'concentraciones-v1',
      instrucciones:
        'Ajusta las cantidades de soluto y solvente para alcanzar la concentración objetivo',
      objetivo: 'Completar 10 niveles de dificultad creciente',
      config: {
        nivel: 1,
        niveles: 10,
        tolerancia: [10, 8, 6, 5, 4, 3, 2, 2, 1, 1], // % de margen por nivel
      },
    },
  },
  {
    id: 'quimica-reacciones-cadena',
    semanaId: 'quimica',
    numero: 6,
    titulo: 'Reacción en Cadena',
    descripcion: 'Balancea variables químicas para crear la reacción perfecta',
    emoji: '💥',
    tipo: 'juego',
    dificultad: 'dificil',
    duracionEstimada: 20,
    puntosMaximos: 200,
    xpRecompensa: 300,
    monedasRecompensa: 100,
    estado: 'disponible',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'juego',
      juegoId: 'reacciones-cadena-v1',
      instrucciones:
        'Controla temperatura, pH y cantidades de reactivos para lograr la reacción ideal',
      objetivo: 'Neutralizar ácidos y bases para crear compuestos estables',
      config: {
        nivel: 1,
        experimentos: [
          {
            nombre: 'Neutralización Básica',
            objetivo: { pH: 7, temperatura: 25 },
            reactivos: ['HCl', 'NaOH', 'H2O'],
          },
          {
            nombre: 'Creación de Sal',
            objetivo: { pH: 7, temperatura: 20 },
            reactivos: ['HCl', 'NaOH'],
          },
        ],
      },
    },
  },
];

/**
 * SEMANA 2: ASTRONOMÍA 🌌
 * 4 actividades progresivas
 */
const ACTIVIDADES_ASTRONOMIA: readonly Actividad[] = [
  {
    id: 'astronomia-01',
    semanaId: 'astronomia',
    numero: 1,
    titulo: 'Nuestro Sistema Solar',
    descripcion: 'Conoce los 8 planetas y sus características',
    emoji: '🪐',
    tipo: 'video',
    dificultad: 'facil',
    duracionEstimada: 12,
    puntosMaximos: 50,
    xpRecompensa: 100,
    monedasRecompensa: 25,
    estado: 'completada',
    progreso: 100,
    estrellas: 3,
    contenido: {
      tipo: 'video',
      url: 'https://www.youtube.com/watch?v=sistema-solar',
      duracion: 720,
      thumbnail: '/videos/sistema-solar.jpg',
      subtitulos: true,
    },
    resultado: {
      actividadId: 'astronomia-01',
      completada: true,
      puntajeObtenido: 50,
      puntajeMaximo: 50,
      porcentaje: 100,
      estrellas: 3,
      tiempoEmpleado: 700,
      intentos: 1,
      fechaCompletado: new Date('2025-11-10'),
    },
  },
  {
    id: 'astronomia-02',
    semanaId: 'astronomia',
    numero: 2,
    titulo: 'Planetas del Sistema Solar',
    descripcion: 'Identifica y ordena los planetas correctamente',
    emoji: '🌍',
    tipo: 'ejercicio',
    dificultad: 'medio',
    duracionEstimada: 18,
    puntosMaximos: 100,
    xpRecompensa: 150,
    monedasRecompensa: 50,
    estado: 'en-progreso',
    progreso: 50,
    estrellas: 0,
    contenido: {
      tipo: 'ejercicio',
      preguntas: [
        {
          tipo: 'multiple-choice',
          enunciado: '¿Cuál es el planeta más cercano al Sol?',
          opciones: [
            { id: 'a', texto: 'Venus', esCorrecta: false },
            { id: 'b', texto: 'Mercurio', esCorrecta: true },
            { id: 'c', texto: 'Tierra', esCorrecta: false },
            { id: 'd', texto: 'Marte', esCorrecta: false },
          ],
          explicacion: 'Mercurio es el planeta más cercano al Sol.',
          puntaje: 25,
        },
        {
          tipo: 'multiple-choice',
          enunciado: '¿Cuál es el planeta más grande del Sistema Solar?',
          opciones: [
            { id: 'a', texto: 'Saturno', esCorrecta: false },
            { id: 'b', texto: 'Neptuno', esCorrecta: false },
            { id: 'c', texto: 'Júpiter', esCorrecta: true },
            { id: 'd', texto: 'Urano', esCorrecta: false },
          ],
          explicacion: 'Júpiter es el gigante gaseoso más grande.',
          puntaje: 25,
        },
        {
          tipo: 'verdadero-falso',
          enunciado: 'Saturno tiene anillos visibles',
          respuestaCorrecta: true,
          explicacion: 'Saturno es famoso por sus espectaculares anillos.',
          puntaje: 25,
        },
        {
          tipo: 'fill-blank',
          enunciado: 'El planeta rojo es ______',
          respuestaCorrecta: ['Marte', 'marte'],
          explicacion: 'Marte se conoce como el planeta rojo por su color.',
          puntaje: 25,
          caseSensitive: false,
        },
      ],
      intentosMaximos: 3,
      porcentajeAprobacion: 70,
    },
  },
  {
    id: 'astronomia-03',
    semanaId: 'astronomia',
    numero: 3,
    titulo: 'Explorador Espacial',
    descripcion: 'Viaja por el espacio y descubre planetas',
    emoji: '🚀',
    tipo: 'juego',
    dificultad: 'medio',
    duracionEstimada: 22,
    puntosMaximos: 150,
    xpRecompensa: 200,
    monedasRecompensa: 75,
    estado: 'disponible',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'juego',
      juegoId: 'explorador-espacial-v1',
      instrucciones: 'Navega por el sistema solar y visita todos los planetas',
      objetivo: 'Recolectar datos de los 8 planetas',
      config: {
        nivel: 1,
        naveVelocidad: 100,
        combustibleInicial: 1000,
      },
    },
  },
  {
    id: 'astronomia-04',
    semanaId: 'astronomia',
    numero: 4,
    titulo: 'Evaluación: Astronomía',
    descripcion: 'Quiz completo sobre el Sistema Solar',
    emoji: '📝',
    tipo: 'evaluacion',
    dificultad: 'medio',
    duracionEstimada: 20,
    puntosMaximos: 200,
    xpRecompensa: 300,
    monedasRecompensa: 100,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'evaluacion',
      preguntas: [
        {
          tipo: 'multiple-choice',
          enunciado: '¿Cuántos planetas hay en el Sistema Solar?',
          opciones: [
            { id: 'a', texto: '7', esCorrecta: false },
            { id: 'b', texto: '8', esCorrecta: true },
            { id: 'c', texto: '9', esCorrecta: false },
            { id: 'd', texto: '10', esCorrecta: false },
          ],
          explicacion: 'Desde 2006, el Sistema Solar tiene oficialmente 8 planetas.',
          puntaje: 50,
        },
      ],
      tiempoLimite: 1200,
      intentosMaximos: 1,
      porcentajeAprobacion: 75,
    },
    requisitos: {
      actividadPreviaId: 'astronomia-03',
    },
  },
];

/**
 * SEMANA 3: FÍSICA ⚡
 * 4 actividades progresivas
 */
const ACTIVIDADES_FISICA: readonly Actividad[] = [
  {
    id: 'fisica-01',
    semanaId: 'fisica',
    numero: 1,
    titulo: 'Leyes del Movimiento',
    descripcion: 'Descubre las leyes de Newton',
    emoji: '🎱',
    tipo: 'video',
    dificultad: 'medio',
    duracionEstimada: 15,
    puntosMaximos: 50,
    xpRecompensa: 100,
    monedasRecompensa: 25,
    estado: 'disponible',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'video',
      url: 'https://www.youtube.com/watch?v=leyes-newton',
      duracion: 900,
      thumbnail: '/videos/newton.jpg',
      subtitulos: true,
    },
  },
  {
    id: 'fisica-02',
    semanaId: 'fisica',
    numero: 2,
    titulo: 'Fuerza y Movimiento',
    descripcion: 'Resuelve problemas de física básica',
    emoji: '⚖️',
    tipo: 'ejercicio',
    dificultad: 'medio',
    duracionEstimada: 20,
    puntosMaximos: 100,
    xpRecompensa: 150,
    monedasRecompensa: 50,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'ejercicio',
      preguntas: [],
      intentosMaximos: 3,
      porcentajeAprobacion: 70,
    },
    requisitos: {
      actividadPreviaId: 'fisica-01',
    },
  },
  {
    id: 'fisica-03',
    semanaId: 'fisica',
    numero: 3,
    titulo: 'Máquinas Simples',
    descripcion: 'Construye y prueba poleas, palancas y más',
    emoji: '⚙️',
    tipo: 'juego',
    dificultad: 'dificil',
    duracionEstimada: 25,
    puntosMaximos: 150,
    xpRecompensa: 200,
    monedasRecompensa: 75,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'juego',
      juegoId: 'maquinas-simples-v1',
      instrucciones: 'Construye máquinas para resolver desafíos físicos',
      objetivo: 'Completar 8 niveles usando poleas, palancas y planos inclinados',
      config: {
        nivel: 1,
        herramientas: ['polea', 'palanca', 'plano-inclinado'],
      },
    },
    requisitos: {
      actividadPreviaId: 'fisica-02',
    },
  },
  {
    id: 'fisica-04',
    semanaId: 'fisica',
    numero: 4,
    titulo: 'Evaluación: Física',
    descripcion: 'Examen final de física',
    emoji: '📝',
    tipo: 'evaluacion',
    dificultad: 'dificil',
    duracionEstimada: 30,
    puntosMaximos: 200,
    xpRecompensa: 300,
    monedasRecompensa: 100,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'evaluacion',
      preguntas: [],
      tiempoLimite: 1800,
      intentosMaximos: 1,
      porcentajeAprobacion: 75,
    },
    requisitos: {
      actividadPreviaId: 'fisica-03',
    },
  },
];

/**
 * SEMANA 4: INFORMÁTICA 💻
 * 4 actividades progresivas
 */
const ACTIVIDADES_INFORMATICA: readonly Actividad[] = [
  {
    id: 'informatica-01',
    semanaId: 'informatica',
    numero: 1,
    titulo: '¿Qué es la Programación?',
    descripcion: 'Introducción al mundo del código',
    emoji: '💻',
    tipo: 'video',
    dificultad: 'facil',
    duracionEstimada: 10,
    puntosMaximos: 50,
    xpRecompensa: 100,
    monedasRecompensa: 25,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'video',
      url: 'https://www.youtube.com/watch?v=intro-programacion',
      duracion: 600,
      thumbnail: '/videos/programacion.jpg',
      subtitulos: true,
    },
  },
  {
    id: 'informatica-02',
    semanaId: 'informatica',
    numero: 2,
    titulo: 'Algoritmos Básicos',
    descripcion: 'Aprende a pensar como programador',
    emoji: '🧮',
    tipo: 'ejercicio',
    dificultad: 'medio',
    duracionEstimada: 18,
    puntosMaximos: 100,
    xpRecompensa: 150,
    monedasRecompensa: 50,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'ejercicio',
      preguntas: [],
      intentosMaximos: 3,
      porcentajeAprobacion: 70,
    },
  },
  {
    id: 'informatica-03',
    semanaId: 'informatica',
    numero: 3,
    titulo: 'Crea tu Primer Programa',
    descripcion: 'Programa un juego simple con bloques',
    emoji: '🎮',
    tipo: 'juego',
    dificultad: 'medio',
    duracionEstimada: 30,
    puntosMaximos: 150,
    xpRecompensa: 200,
    monedasRecompensa: 75,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'juego',
      juegoId: 'scratch-intro-v1',
      instrucciones: 'Usa bloques de código para programar tu primer juego',
      objetivo: 'Hacer que el personaje se mueva y recolecte objetos',
      config: {
        nivel: 1,
        lenguaje: 'bloques',
      },
    },
  },
  {
    id: 'informatica-04',
    semanaId: 'informatica',
    numero: 4,
    titulo: 'Evaluación: Informática',
    descripcion: 'Demuestra tus conocimientos de programación',
    emoji: '📝',
    tipo: 'evaluacion',
    dificultad: 'medio',
    duracionEstimada: 25,
    puntosMaximos: 200,
    xpRecompensa: 300,
    monedasRecompensa: 100,
    estado: 'bloqueada',
    progreso: 0,
    estrellas: 0,
    contenido: {
      tipo: 'evaluacion',
      preguntas: [],
      tiempoLimite: 1500,
      intentosMaximos: 1,
      porcentajeAprobacion: 75,
    },
  },
];

/**
 * Todas las actividades del Mes de la Ciencia
 */
export const ACTIVIDADES_MES_CIENCIA: readonly Actividad[] = [
  ...ACTIVIDADES_QUIMICA,
  ...ACTIVIDADES_ASTRONOMIA,
  ...ACTIVIDADES_FISICA,
  ...ACTIVIDADES_INFORMATICA,
];

/**
 * Buscar actividad por ID
 */
export function getActividadById(id: string): Actividad | undefined {
  return ACTIVIDADES_MES_CIENCIA.find((a) => a.id === id);
}

/**
 * Obtener actividades de una semana
 */
export function getActividadesBySemana(semanaId: string): readonly Actividad[] {
  return ACTIVIDADES_MES_CIENCIA.filter((a) => a.semanaId === semanaId);
}

/**
 * Estadísticas de progreso por semana
 */
export function getEstadisticasSemana(semanaId: string) {
  const actividades = getActividadesBySemana(semanaId);
  const completadas = actividades.filter((a) => a.estado === 'completada').length;
  const enProgreso = actividades.filter((a) => a.estado === 'en-progreso').length;
  const total = actividades.length;
  const progreso = Math.round((completadas / total) * 100);

  return {
    total,
    completadas,
    enProgreso,
    disponibles: actividades.filter((a) => a.estado === 'disponible').length,
    bloqueadas: actividades.filter((a) => a.estado === 'bloqueada').length,
    progreso,
    puntosObtenidos: actividades.reduce((acc, a) => acc + (a.resultado?.puntajeObtenido || 0), 0),
    puntosMaximos: actividades.reduce((acc, a) => acc + a.puntosMaximos, 0),
  };
}
