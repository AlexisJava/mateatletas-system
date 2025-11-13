// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS PARA EL SISTEMA DE QUIZ Y RECOMENDACIÓN DE RUTAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Metadata completa de un curso individual
 */
export interface CourseMetadata {
  id: string;
  titulo: string;
  descripcion_corta: string;
  area: 'matematica' | 'programacion' | 'ciencias';

  // Para matching del algoritmo
  edad_minima: number;
  edad_maxima: number;
  edad_ideal: number;
  nivel_requerido: 'principiante' | 'intermedio' | 'avanzado';

  // Tags de contenido
  categorias: string[]; // Ej: ['game_dev', 'visual', '3d']
  intereses_match: string[]; // Ej: ['crear_juegos', 'roblox', 'minecraft']
  objetivos_match: string[]; // Ej: ['proyecto', 'diversion', 'academico']
  keywords: string[]; // Para búsqueda textual

  // Metadata del curso
  duracion_semanas: number;
  total_clases: number;
  horas_por_semana: number;
  tipo_contenido: 'teorico' | 'proyecto_practico' | 'mixto';
  resultado_final: string; // Ej: "Juego 3D publicado en Roblox"

  // Secuenciación
  requisitos_previos: string[]; // IDs de cursos que deben ir antes
  cursos_siguientes: string[]; // IDs de cursos que pueden seguir

  // Comercial
  precio_individual: number; // 30000
}

/**
 * Curso individual para mostrar en la UI (versión simplificada)
 */
export interface Curso {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracion_semanas: number;
  total_clases: number;
  modalidad: 'Asincrónico' | 'Sincrónico' | 'Mixto';
  skills_principales: string[];
  resultado_esperado: string;
  proyecto_final?: string;
}

/**
 * Ruta de aprendizaje completa (4 cursos secuenciales)
 */
export interface Ruta {
  id: string;
  nombre: string; // Ej: "Game Maker"
  descripcion: string;
  emoji: string; // Ej: "🎮"
  area_principal: 'matematica' | 'programacion' | 'ciencias' | 'mixto';

  // Criterios de match
  edad_minima: number;
  edad_maxima: number;
  intereses_requeridos: string[]; // Al menos uno debe coincidir
  objetivos_match: string[];
  nivel_estudiante: 'principiante' | 'intermedio' | 'avanzado';

  // Cursos de la ruta (EN ORDEN)
  cursos: string[]; // Array de 4 IDs de cursos

  // Metadata
  duracion_total_meses: number;
  total_clases: number;
  resultado_final: string; // Ej: "Podrá crear y publicar juegos en Roblox"

  // Comercial
  precio_usd: number; // 30
  precio_ars: number; // 45000
}

/**
 * Respuestas del quiz - NUEVO SISTEMA PROFUNDO
 */
export interface QuizResponses {
  // ═══ PASO 1: DATOS BÁSICOS ═══
  nombre_estudiante: string;
  edad: number;

  // ═══ PASO 2: PERSONALIDAD Y ESTILO DE APRENDIZAJE ═══
  // ¿Cómo es tu hijo cuando se encuentra con un problema difícil?
  personalidad_problema: 'insiste_solo' | 'pide_ayuda' | 'busca_alternativa' | 'se_frustra';

  // ¿Qué tipo de actividades disfruta más en su tiempo libre?
  actividades_tiempo_libre: string[]; // multi-select
  // Opciones: 'videojuegos', 'leer', 'construir_legos', 'deportes', 'dibujar',
  // 'ver_videos_educativos', 'experimentos', 'armar_cosas', 'puzzles'

  // ═══ PASO 3: INTERESES ESPECÍFICOS - MUY DETALLADO ═══
  // Si le gustan videojuegos, ¿cuáles?
  juegos_favoritos: string[]; // multi-select
  // Opciones: 'minecraft', 'roblox', 'fortnite', 'pokemon', 'mario',
  // 'zelda', 'terraria', 'among_us', 'geometry_dash', 'otro'

  // ¿Qué videos mira en YouTube/TikTok?
  contenido_consume: string[]; // multi-select
  // Opciones: 'tutoriales_juegos', 'gameplays', 'ciencia', 'matematica',
  // 'construcciones_minecraft', 'experimentos', 'animales', 'astronomia',
  // 'programacion', 'arte_digital', 'no_mira_mucho'

  // Cuando crea algo (en Minecraft, dibujo, etc), ¿qué prefiere?
  estilo_creativo: 'planifica_primero' | 'improvisa' | 'copia_tutoriales' | 'mezcla_todo';

  // ═══ PASO 4: HABILIDADES Y EXPERIENCIA ═══
  // ¿Ha programado algo antes?
  nivel_programacion: 'nunca' | 'scratch_basico' | 'scratch_avanzado' | 'otro_lenguaje';

  // ¿Cómo le va en matemáticas en la escuela?
  nivel_mate_escuela: 'le_cuesta' | 'bien' | 'muy_bien' | 'es_lo_mejor';

  // ¿Disfruta los desafíos matemáticos/lógicos?
  disfruta_desafios: 'si_mucho' | 'a_veces' | 'prefiere_otras_cosas' | 'no';

  // ═══ PASO 5: MOTIVACIÓN Y OBJETIVOS ═══
  // ¿Qué quiere LOGRAR específicamente?
  objetivo_principal: string; // single select
  // Opciones: 'crear_su_propio_juego', 'publicar_juego_roblox', 'ganar_olimpiada',
  // 'hacer_web_propia', 'entender_como_funcionan_juegos', 'mejorar_en_mate',
  // 'aprender_ia', 'crear_app', 'explorar_ciencia'

  // ¿Qué tan motivado/a está?
  nivel_motivacion: 'muy_motivado' | 'curioso' | 'padres_quieren' | 'no_seguro';

  // ¿Cuánto tiempo puede dedicar por semana?
  tiempo_disponible: '1-2hrs' | '3-4hrs' | '5+hrs';

  // ═══ OPCIONAL: CONTACTO ═══
  parent_email?: string;
  parent_name?: string;
}

/**
 * Resultado de la recomendación del algoritmo
 */
export interface ResultadoRecomendacion {
  ruta_principal: Ruta;
  score_match: number; // 0-100
  alternativas: Ruta[]; // Máximo 3
  mensaje_personalizado: string;
}

/**
 * Opciones predefinidas para las preguntas del quiz - ULTRA DETALLADO
 */
export const OPCIONES_QUIZ = {
  edades: [
    { value: 6, label: '6-7 años', min: 6, max: 7 },
    { value: 8, label: '8-9 años', min: 8, max: 9 },
    { value: 10, label: '10-11 años', min: 10, max: 11 },
    { value: 12, label: '12-13 años', min: 12, max: 13 },
    { value: 14, label: '14-15 años', min: 14, max: 15 },
    { value: 16, label: '16-17 años', min: 16, max: 17 },
  ],

  personalidad_problema: [
    { value: 'insiste_solo', label: 'Insiste solo hasta resolverlo', emoji: '💪', descripcion: 'Perseverante, le gusta superar desafíos' },
    { value: 'pide_ayuda', label: 'Pide ayuda cuando se traba', emoji: '🙋', descripcion: 'Colaborativo, sabe cuándo necesita apoyo' },
    { value: 'busca_alternativa', label: 'Busca otra forma de hacerlo', emoji: '🔄', descripcion: 'Creativo, encuentra soluciones alternativas' },
    { value: 'se_frustra', label: 'Se frustra y deja', emoji: '😤', descripcion: 'Necesita apoyo adicional y motivación' },
  ],

  actividades_tiempo_libre: [
    { value: 'videojuegos', label: 'Jugar videojuegos', emoji: '🎮' },
    { value: 'leer', label: 'Leer libros', emoji: '📚' },
    { value: 'construir_legos', label: 'Construir con Legos/bloques', emoji: '🧱' },
    { value: 'deportes', label: 'Hacer deportes', emoji: '⚽' },
    { value: 'dibujar', label: 'Dibujar o pintar', emoji: '🎨' },
    { value: 'ver_videos_educativos', label: 'Ver videos educativos', emoji: '📺' },
    { value: 'experimentos', label: 'Hacer experimentos', emoji: '🔬' },
    { value: 'armar_cosas', label: 'Armar/desarmar cosas', emoji: '🔧' },
    { value: 'puzzles', label: 'Resolver puzzles/acertijos', emoji: '🧩' },
  ],

  juegos_favoritos: [
    { value: 'minecraft', label: 'Minecraft', emoji: '⛏️', match: ['programacion', 'creatividad', 'construccion'] },
    { value: 'roblox', label: 'Roblox', emoji: '🎮', match: ['programacion', 'game_dev', '3d'] },
    { value: 'fortnite', label: 'Fortnite', emoji: '🔫', match: ['estrategia', 'competitivo'] },
    { value: 'pokemon', label: 'Pokémon', emoji: '⚡', match: ['estrategia', 'coleccionismo'] },
    { value: 'mario', label: 'Mario Bros/Kart', emoji: '🍄', match: ['plataformas', 'casual'] },
    { value: 'zelda', label: 'Zelda', emoji: '🗡️', match: ['aventura', 'puzzles', 'exploracion'] },
    { value: 'terraria', label: 'Terraria', emoji: '⚒️', match: ['construccion', 'creatividad'] },
    { value: 'among_us', label: 'Among Us', emoji: '🚀', match: ['social', 'logica'] },
    { value: 'geometry_dash', label: 'Geometry Dash', emoji: '🟦', match: ['ritmo', 'precision'] },
    { value: 'otro', label: 'Otro', emoji: '🎯', match: [] },
  ],

  contenido_consume: [
    { value: 'tutoriales_juegos', label: 'Tutoriales de juegos', emoji: '📖', match: ['aprendizaje', 'game_dev'] },
    { value: 'gameplays', label: 'Gameplays/Streams', emoji: '🎬', match: ['entretenimiento'] },
    { value: 'ciencia', label: 'Videos de ciencia', emoji: '🔬', match: ['ciencias', 'experimentos'] },
    { value: 'matematica', label: 'Videos de matemática', emoji: '🧮', match: ['matematica', 'logica'] },
    { value: 'construcciones_minecraft', label: 'Construcciones Minecraft', emoji: '🏗️', match: ['programacion', 'creatividad'] },
    { value: 'experimentos', label: 'Experimentos caseros', emoji: '⚗️', match: ['ciencias', 'hands_on'] },
    { value: 'animales', label: 'Animales/Naturaleza', emoji: '🦕', match: ['ciencias', 'biologia'] },
    { value: 'astronomia', label: 'Astronomía/Espacio', emoji: '🌌', match: ['ciencias', 'astronomia'] },
    { value: 'programacion', label: 'Programación/Coding', emoji: '💻', match: ['programacion', 'tech'] },
    { value: 'arte_digital', label: 'Arte digital', emoji: '🎨', match: ['creatividad', 'diseño'] },
    { value: 'no_mira_mucho', label: 'No mira mucho', emoji: '📵', match: [] },
  ],

  estilo_creativo: [
    { value: 'planifica_primero', label: 'Planifica todo antes de empezar', emoji: '📋', descripcion: 'Metódico, le gusta tener un plan' },
    { value: 'improvisa', label: 'Improvisa y ve qué sale', emoji: '🎭', descripcion: 'Espontáneo, prefiere experimentar' },
    { value: 'copia_tutoriales', label: 'Sigue tutoriales paso a paso', emoji: '📺', descripcion: 'Aprende mejor con guías estructuradas' },
    { value: 'mezcla_todo', label: 'Mezcla: planifica, improvisa y copia', emoji: '🔀', descripcion: 'Flexible, adapta según la situación' },
  ],

  nivel_programacion: [
    { value: 'nunca', label: 'Nunca programó', emoji: '❌', nivel: 0 },
    { value: 'scratch_basico', label: 'Scratch básico', emoji: '🟡', nivel: 1 },
    { value: 'scratch_avanzado', label: 'Scratch avanzado', emoji: '🟢', nivel: 2 },
    { value: 'otro_lenguaje', label: 'Python, JavaScript, u otro', emoji: '⭐', nivel: 3 },
  ],

  nivel_mate_escuela: [
    { value: 'le_cuesta', label: 'Le cuesta, necesita apoyo', emoji: '😅' },
    { value: 'bien', label: 'Le va bien', emoji: '🙂' },
    { value: 'muy_bien', label: 'Le va muy bien', emoji: '😊' },
    { value: 'es_lo_mejor', label: 'Es su materia favorita', emoji: '🤩' },
  ],

  disfruta_desafios: [
    { value: 'si_mucho', label: 'Sí, le encanta', emoji: '🤩' },
    { value: 'a_veces', label: 'A veces, depende', emoji: '🤔' },
    { value: 'prefiere_otras_cosas', label: 'Prefiere otras actividades', emoji: '🤷' },
    { value: 'no', label: 'No, se aburre', emoji: '😴' },
  ],

  objetivo_principal: [
    { value: 'crear_su_propio_juego', label: 'Crear su propio videojuego', emoji: '🎮', area: 'programacion' },
    { value: 'publicar_juego_roblox', label: 'Publicar un juego en Roblox', emoji: '🎨', area: 'programacion' },
    { value: 'ganar_olimpiada', label: 'Ganar una olimpiada de matemática', emoji: '🏆', area: 'matematica' },
    { value: 'hacer_web_propia', label: 'Hacer su propia página web', emoji: '🌐', area: 'programacion' },
    { value: 'entender_como_funcionan_juegos', label: 'Entender cómo funcionan los juegos', emoji: '🔍', area: 'programacion' },
    { value: 'mejorar_en_mate', label: 'Mejorar en matemáticas', emoji: '📈', area: 'matematica' },
    { value: 'aprender_ia', label: 'Aprender sobre IA', emoji: '🤖', area: 'programacion' },
    { value: 'crear_app', label: 'Crear una app móvil', emoji: '📱', area: 'programacion' },
    { value: 'explorar_ciencia', label: 'Explorar experimentos científicos', emoji: '🔬', area: 'ciencias' },
  ],

  nivel_motivacion: [
    { value: 'muy_motivado', label: 'Muy motivado/a, no para de hablar de esto', emoji: '🔥' },
    { value: 'curioso', label: 'Curioso/a, quiere probar', emoji: '🤔' },
    { value: 'padres_quieren', label: 'Es más idea de los padres', emoji: '👨‍👩‍👧' },
    { value: 'no_seguro', label: 'No está seguro/a todavía', emoji: '🤷' },
  ],

  tiempos: [
    { value: '1-2hrs', label: '1-2 horas por semana', emoji: '⏰' },
    { value: '3-4hrs', label: '3-4 horas por semana', emoji: '⏱️' },
    { value: '5+hrs', label: '5+ horas por semana', emoji: '⏳' },
  ],
} as const;

/**
 * Submission del quiz al backend
 */
export interface QuizSubmission {
  respuestas: QuizResponses;
  resultado: ResultadoRecomendacion;
  timestamp: string;
}

/**
 * Respuesta del backend al enviar el quiz
 */
export interface QuizBackendResponse {
  success: boolean;
  quiz_id?: string;
  message?: string;
}
