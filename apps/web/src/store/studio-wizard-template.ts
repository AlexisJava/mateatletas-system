/**
 * Generador de plantilla JSON para cursos de Mateatletas Studio
 * Genera la estructura completa de semanas y actividades para poblar con Claude
 */

import type { WizardDatos } from './studio-wizard.store';

// ═══════════════════════════════════════════════════════════════════════════════
// CATÁLOGO DE COMPONENTES DISPONIBLES (95 componentes)
// ═══════════════════════════════════════════════════════════════════════════════

export const COMPONENTES_DISPONIBLES = {
  // CATEGORÍA 1: INTERACTIVOS BÁSICOS (15)
  interactivosBasicos: [
    'DragDropZone',
    'MatchingPairs',
    'OrderSequence',
    'MultipleChoice',
    'FillBlanks',
    'Slider',
    'ToggleSwitch',
    'NumberInput',
    'TextInput',
    'Hotspot',
    'Timeline',
    'SortingBins',
    'ScaleBalance',
    'PieChart',
    'BarGraph',
  ],

  // CATEGORÍA 2: MOTRICIDAD FINA (10)
  motricidadFina: [
    'PinchZoom',
    'RotateGesture',
    'TracePath',
    'PressureControl',
    'SwipeSequence',
    'TapRhythm',
    'LongPress',
    'MultiTouch',
    'DrawShape',
    'ScratchReveal',
  ],

  // CATEGORÍA 3: SIMULADORES CIENTÍFICOS (25)
  simuladoresQuimica: [
    'MoleculeBuilder3D',
    'ReactionChamber',
    'pHSimulator',
    'ElectronOrbitals',
    'PeriodicExplorer',
    'StateMatterSim',
    'ElectrochemCell',
    'GasLawsSim',
  ],
  simuladoresFisica: [
    'GravitySandbox',
    'WaveSimulator',
    'CircuitBuilder',
    'ProjectileMotion',
    'PendulumLab',
    'OpticsTable',
    'ThermodynamicsSim',
    'FluidSimulator',
    'MagnetismLab',
  ],
  simuladoresBiologia: [
    'CellExplorer',
    'GeneticsLab',
    'EcosystemSim',
    'BodySystems',
    'EvolutionSim',
  ],
  simuladoresMatematica: ['FunctionGrapher', 'GeometryCanvas', 'StatisticsLab'],

  // CATEGORÍA 4: EDITORES DE CÓDIGO (10)
  editoresCodigo: [
    'BlockEditor',
    'PythonEditor',
    'LuaEditor',
    'JavaScriptEditor',
    'HTMLCSSEditor',
    'SQLPlayground',
    'RegexTester',
    'AlgorithmViz',
    'DataStructureViz',
    'TerminalEmulator',
  ],

  // CATEGORÍA 5: CREATIVOS (10)
  creativos: [
    'PixelArtEditor',
    'VectorDrawing',
    '3DModeler',
    'StoryCreator',
    'PresentationBuilder',
    'MindMapEditor',
    'InfoGraphicMaker',
    'ComicCreator',
    'PodcastRecorder',
    'VideoAnnotator',
  ],

  // CATEGORÍA 6: MULTIMEDIA (9)
  multimedia: [
    'VideoPlayer',
    'AudioPlayer',
    'ImageGallery',
    'DocumentViewer',
    '3DModelViewer',
    'InteractivePresentation',
    'NarrationWithTracking',
    'StepAnimation',
    'Checkpoint',
  ],

  // CATEGORÍA 7: EVALUACIÓN (8)
  evaluacion: [
    'Quiz',
    'PracticeMode',
    'ChallengeMode',
    'PeerReview',
    'Portfolio',
    'Rubric',
    'ProgressTracker',
    'BadgeDisplay',
  ],

  // CATEGORÍA 8: MULTIPLAYER / COLABORATIVO (8)
  multiplayer: [
    'SharedWhiteboard',
    'CollaborativeDoc',
    'TeamChallenge',
    'DebateArena',
    'PollLive',
    'BrainstormCloud',
    'PeerTutoring',
    'GroupProject',
  ],
} as const;

// Lista plana para referencia rápida
export const TODOS_LOS_COMPONENTES = [
  ...COMPONENTES_DISPONIBLES.interactivosBasicos,
  ...COMPONENTES_DISPONIBLES.motricidadFina,
  ...COMPONENTES_DISPONIBLES.simuladoresQuimica,
  ...COMPONENTES_DISPONIBLES.simuladoresFisica,
  ...COMPONENTES_DISPONIBLES.simuladoresBiologia,
  ...COMPONENTES_DISPONIBLES.simuladoresMatematica,
  ...COMPONENTES_DISPONIBLES.editoresCodigo,
  ...COMPONENTES_DISPONIBLES.creativos,
  ...COMPONENTES_DISPONIBLES.multimedia,
  ...COMPONENTES_DISPONIBLES.evaluacion,
  ...COMPONENTES_DISPONIBLES.multiplayer,
];

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA LA PLANTILLA
// ═══════════════════════════════════════════════════════════════════════════════

interface BloqueTemplate {
  numero: number;
  componente: string;
  titulo: string;
  contenido: Record<string, unknown>;
  minimoParaAprobar?: number;
  repasoSiFalla?: BloqueTemplate | null;
  desbloquea: number | null;
}

interface ActividadTemplate {
  numero: number;
  nombre: string;
  duracionMinutos: number;
  bloques: BloqueTemplate[];
}

interface SemanaTemplate {
  numero: number;
  nombre: string;
  descripcion: string;
  objetivosAprendizaje: string[];
  actividades: ActividadTemplate[];
}

interface CursoTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  casa: string;
  mundo: string;
  tipoExperiencia?: string;
  materia?: string;
  esteticaBase: string;
  esteticaVariante?: string;
  cantidadSemanas: number;
  actividadesPorSemana: number;
  tierMinimo: string;
}

export interface PlantillaJSON {
  _meta: {
    version: string;
    generadoEn: string;
    instrucciones: string;
  };
  curso: CursoTemplate;
  semanas: SemanaTemplate[];
  componentesDisponibles: {
    porCategoria: typeof COMPONENTES_DISPONIBLES;
    listaCompleta: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERADOR DE PLANTILLA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Genera la plantilla JSON completa para un curso
 */
export function generarPlantillaJSON(cursoId: string, datos: WizardDatos): PlantillaJSON {
  const semanas: SemanaTemplate[] = [];

  // Generar estructura de semanas
  for (let semana = 1; semana <= datos.cantidadSemanas; semana++) {
    const actividades: ActividadTemplate[] = [];

    // Generar estructura de actividades por semana
    for (let actividad = 1; actividad <= datos.actividadesPorSemana; actividad++) {
      actividades.push({
        numero: actividad,
        nombre: '', // Para completar con Claude
        duracionMinutos: 30, // Default
        bloques: [
          {
            numero: 1,
            componente: '', // Para completar con Claude
            titulo: '',
            contenido: {},
            desbloquea: null,
          },
        ],
      });
    }

    semanas.push({
      numero: semana,
      nombre: '', // Para completar con Claude
      descripcion: '', // Para completar con Claude
      objetivosAprendizaje: [], // Para completar con Claude
      actividades,
    });
  }

  return {
    _meta: {
      version: '1.0.0',
      generadoEn: new Date().toISOString(),
      instrucciones: `
        INSTRUCCIONES PARA CLAUDE:

        1. Completar cada semana con:
           - nombre: Título atractivo de la semana
           - descripcion: Qué aprenderán
           - objetivosAprendizaje: Array de 2-4 objetivos

        2. Completar cada actividad con:
           - nombre: Título de la actividad
           - duracionMinutos: Entre 5-60 minutos
           - bloques: Mínimo 2, máximo 10

        3. Cada bloque debe tener:
           - numero: Secuencial (1, 2, 3...)
           - componente: Del catálogo (PascalCase exacto)
           - titulo: Título del bloque
           - contenido: Props específicas del componente
           - minimoParaAprobar: 70-100 (solo bloques evaluativos)
           - repasoSiFalla: Bloque alternativo si no aprueba
           - desbloquea: número del siguiente bloque o null si es el último

        4. Usar componentes apropiados según:
           - Casa: ${datos.casa} (adaptar complejidad)
           - Mundo: ${datos.mundo} (simuladores relevantes)
           - Categoría: ${datos.categoria} (${datos.categoria === 'EXPERIENCIA' ? datos.tipoExperiencia : datos.materia})
           - Estética: ${datos.esteticaBase} ${datos.esteticaVariante ? `(${datos.esteticaVariante})` : ''}

        5. Estructura recomendada por actividad:
           - Bloque 1: Presentación/Intro (InteractivePresentation, NarrationWithTracking)
           - Bloques 2-N: Contenido interactivo (Simuladores, DragDrop, etc.)
           - Bloque final: Evaluación (MultipleChoice, Quiz, ChallengeMode)
      `.trim(),
    },
    curso: {
      id: cursoId,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoria: datos.categoria!,
      casa: datos.casa!,
      mundo: datos.mundo!,
      ...(datos.categoria === 'EXPERIENCIA' && datos.tipoExperiencia
        ? { tipoExperiencia: datos.tipoExperiencia }
        : {}),
      ...(datos.categoria === 'CURRICULAR' && datos.materia ? { materia: datos.materia } : {}),
      esteticaBase: datos.esteticaBase,
      ...(datos.esteticaVariante ? { esteticaVariante: datos.esteticaVariante } : {}),
      cantidadSemanas: datos.cantidadSemanas,
      actividadesPorSemana: datos.actividadesPorSemana,
      tierMinimo: datos.tierMinimo!,
    },
    semanas,
    componentesDisponibles: {
      porCategoria: COMPONENTES_DISPONIBLES,
      listaCompleta: TODOS_LOS_COMPONENTES,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESCARGA DE ARCHIVO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convierte string a slug para nombre de archivo
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
    .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio/final
}

/**
 * Descarga la plantilla como archivo JSON
 */
export function descargarPlantillaJSON(plantilla: PlantillaJSON): void {
  const nombreCurso = slugify(plantilla.curso.nombre);
  const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const nombreArchivo = `plantilla-${nombreCurso}-${fecha}.json`;

  const jsonString = JSON.stringify(plantilla, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Crear link temporal y triggear descarga
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Limpiar URL
  URL.revokeObjectURL(url);
}

/**
 * Función combinada: genera y descarga la plantilla
 */
export function generarYDescargarPlantilla(cursoId: string, datos: WizardDatos): PlantillaJSON {
  const plantilla = generarPlantillaJSON(cursoId, datos);
  descargarPlantillaJSON(plantilla);
  return plantilla;
}
