// ═══════════════════════════════════════════════════════════════════════════════
// 10 RUTAS DE APRENDIZAJE PRE-DEFINIDAS
// Cada ruta tiene exactamente 4 cursos secuenciales
// ═══════════════════════════════════════════════════════════════════════════════

import { Ruta } from '@/types/courses';

export const RUTAS: Ruta[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. GAME MAKER - Programación de juegos (8-13 años, principiante)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'game-maker',
    nombre: 'Game Maker',
    descripcion: 'Crea y publica juegos desde cero hasta Roblox con código real',
    emoji: '🎮',
    area_principal: 'programacion',
    edad_minima: 8,
    edad_maxima: 13,
    intereses_requeridos: ['videojuegos', 'crear_cosas'],
    objetivos_match: ['diversion', 'proyecto'],
    nivel_estudiante: 'principiante',
    cursos: ['scratch-basico', 'scratch-juegos-avanzados', 'roblox-studio-intro', 'scripting-luau'],
    duracion_total_meses: 8,
    total_clases: 58,
    resultado_final: 'Podrá crear y publicar juegos completos en Roblox con código Lua real',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. WEB DEVELOPER - Desarrollo web (12-16 años, principiante)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'web-developer',
    nombre: 'Web Developer',
    descripcion: 'Desde tu primera página web hasta aplicaciones modernas con React',
    emoji: '💻',
    area_principal: 'programacion',
    edad_minima: 12,
    edad_maxima: 16,
    intereses_requeridos: ['crear_cosas', 'varios'],
    objetivos_match: ['proyecto', 'futuro'],
    nivel_estudiante: 'principiante',
    cursos: [
      'html-css-fundamentos',
      'javascript-interactivo',
      'react-moderno',
      'proyecto-web-fullstack',
    ],
    duracion_total_meses: 8,
    total_clases: 60,
    resultado_final: 'Creará sitios web modernos y apps interactivas con React',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. AI EXPLORER - Inteligencia Artificial (14-17 años, intermedio)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ai-explorer',
    nombre: 'AI Explorer',
    descripcion: 'Entrena tus propias IAs y crea proyectos con Machine Learning',
    emoji: '🤖',
    area_principal: 'programacion',
    edad_minima: 14,
    edad_maxima: 17,
    intereses_requeridos: ['varios', 'matematica'],
    objetivos_match: ['futuro', 'proyecto'],
    nivel_estudiante: 'intermedio',
    cursos: [
      'python-ia-fundamentos',
      'machine-learning-intro',
      'redes-neuronales',
      'proyecto-ia-aplicada',
    ],
    duracion_total_meses: 9,
    total_clases: 64,
    resultado_final: 'Entrenará modelos de IA y creará proyectos con Machine Learning',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. MATH MASTER - Matemática aplicada (10-13 años, principiante)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'math-master',
    nombre: 'Math Master',
    descripcion: 'Matemática divertida con juegos, puzzles y desafíos creativos',
    emoji: '🧮',
    area_principal: 'matematica',
    edad_minima: 10,
    edad_maxima: 13,
    intereses_requeridos: ['matematica', 'varios'],
    objetivos_match: ['academico', 'diversion'],
    nivel_estudiante: 'principiante',
    cursos: ['algebra-jugando', 'geometria-visual', 'logica-puzzles', 'matematica-aplicada'],
    duracion_total_meses: 7,
    total_clases: 52,
    resultado_final: 'Dominará álgebra, geometría y resolución de problemas complejos',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. OLIMPIADAS TRACK - Preparación competencias (10-14 años, intermedio)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'olimpiadas-track',
    nombre: 'Olimpiadas Track',
    descripcion: 'Entrena para competencias de matemática con estrategias ganadoras',
    emoji: '🏆',
    area_principal: 'matematica',
    edad_minima: 10,
    edad_maxima: 14,
    intereses_requeridos: ['matematica'],
    objetivos_match: ['competencias', 'academico'],
    nivel_estudiante: 'intermedio',
    cursos: [
      'teoria-numeros',
      'combinatoria-avanzada',
      'problemas-olimpiadas',
      'estrategias-competencia',
    ],
    duracion_total_meses: 9,
    total_clases: 68,
    resultado_final: 'Estará preparado para competir en Olimpiadas Matemáticas',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. FINANCIAL GENIUS - Matemática financiera (12-16 años, principiante)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'financial-genius',
    nombre: 'Financial Genius',
    descripcion: 'Aprende finanzas, inversiones y economía con matemática real',
    emoji: '💰',
    area_principal: 'matematica',
    edad_minima: 12,
    edad_maxima: 16,
    intereses_requeridos: ['matematica', 'varios'],
    objetivos_match: ['futuro', 'academico'],
    nivel_estudiante: 'principiante',
    cursos: [
      'matematica-financiera-basica',
      'inversiones-interes-compuesto',
      'economia-personal',
      'proyecto-startup',
    ],
    duracion_total_meses: 7,
    total_clases: 50,
    resultado_final: 'Entenderá finanzas personales, inversiones y economía aplicada',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. SPACE EXPLORER - Astronomía y ciencias espaciales (8-13 años, principiante)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'space-explorer',
    nombre: 'Space Explorer',
    descripcion: 'Explora el universo: planetas, estrellas, física espacial',
    emoji: '🚀',
    area_principal: 'ciencias',
    edad_minima: 8,
    edad_maxima: 13,
    intereses_requeridos: ['ciencias', 'varios'],
    objetivos_match: ['diversion', 'academico'],
    nivel_estudiante: 'principiante',
    cursos: ['sistema-solar', 'estrellas-galaxias', 'fisica-espacial', 'proyecto-mision-espacial'],
    duracion_total_meses: 6,
    total_clases: 48,
    resultado_final: 'Comprenderá astronomía, física espacial y podrá diseñar misiones',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. MAD SCIENTIST - Química y Física (10-14 años, principiante)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mad-scientist',
    nombre: 'Mad Scientist',
    descripcion: 'Experimentos épicos de química y física con proyectos reales',
    emoji: '🔬',
    area_principal: 'ciencias',
    edad_minima: 10,
    edad_maxima: 14,
    intereses_requeridos: ['ciencias', 'crear_cosas'],
    objetivos_match: ['diversion', 'proyecto'],
    nivel_estudiante: 'principiante',
    cursos: ['quimica-experimental', 'fisica-divertida', 'biologia-makers', 'proyecto-cientifico'],
    duracion_total_meses: 7,
    total_clases: 54,
    resultado_final: 'Realizará experimentos y proyectos científicos reales',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. STEAM PRO - Integrado matemática + código + ciencias (13-16 años, intermedio)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'steam-pro',
    nombre: 'STEAM Pro',
    descripcion: 'Integra matemática, programación y ciencias en proyectos innovadores',
    emoji: '⚡',
    area_principal: 'mixto',
    edad_minima: 13,
    edad_maxima: 16,
    intereses_requeridos: ['varios', 'crear_cosas'],
    objetivos_match: ['proyecto', 'futuro'],
    nivel_estudiante: 'intermedio',
    cursos: [
      'robotica-arduino',
      'simulaciones-python',
      'analisis-datos',
      'proyecto-steam-integrado',
    ],
    duracion_total_meses: 8,
    total_clases: 62,
    resultado_final: 'Creará proyectos que integren código, mate y ciencias',
    precio_usd: 30,
    precio_ars: 45000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. DATA WIZARD - Data Science (14-17 años, avanzado)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'data-wizard',
    nombre: 'Data Wizard',
    descripcion: 'Análisis de datos, visualizaciones y predicciones con Python',
    emoji: '📊',
    area_principal: 'programacion',
    edad_minima: 14,
    edad_maxima: 17,
    intereses_requeridos: ['matematica', 'varios'],
    objetivos_match: ['futuro', 'proyecto'],
    nivel_estudiante: 'avanzado',
    cursos: [
      'python-data-science',
      'estadistica-aplicada',
      'visualizacion-datos',
      'proyecto-analytics',
    ],
    duracion_total_meses: 9,
    total_clases: 66,
    resultado_final: 'Analizará datasets reales y creará dashboards interactivos',
    precio_usd: 30,
    precio_ars: 45000,
  },
];

/**
 * Obtener ruta por ID
 */
export function obtenerRutaPorId(id: string): Ruta | undefined {
  return RUTAS.find((r) => r.id === id);
}

/**
 * Obtener rutas por área
 */
export function obtenerRutasPorArea(
  area: 'matematica' | 'programacion' | 'ciencias' | 'mixto',
): Ruta[] {
  return RUTAS.filter((r) => r.area_principal === area);
}

/**
 * Obtener rutas por edad
 */
export function obtenerRutasPorEdad(edad: number): Ruta[] {
  return RUTAS.filter((r) => edad >= r.edad_minima && edad <= r.edad_maxima);
}

/**
 * Obtener rutas por nivel
 */
export function obtenerRutasPorNivel(nivel: 'principiante' | 'intermedio' | 'avanzado'): Ruta[] {
  return RUTAS.filter((r) => r.nivel_estudiante === nivel);
}
