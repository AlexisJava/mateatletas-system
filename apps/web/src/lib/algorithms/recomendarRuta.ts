// ═══════════════════════════════════════════════════════════════════════════════
// ALGORITMO DE RECOMENDACIÓN DE RUTAS - VERSIÓN 2.0
// Scoring ultra-inteligente basado en 50+ puntos de datos del quiz
// ═══════════════════════════════════════════════════════════════════════════════

import { Ruta, QuizResponses, ResultadoRecomendacion } from '@/types/courses';

/**
 * Función principal: recomienda la mejor ruta basada en las respuestas del quiz
 */
export function recomendarRuta(
  respuestas: QuizResponses,
  todasLasRutas: Ruta[],
): ResultadoRecomendacion {
  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 1: FILTRADO DURO - Eliminar rutas incompatibles
  // ═══════════════════════════════════════════════════════════════════════════
  const rutasCompatibles = todasLasRutas.filter((ruta) => {
    // Edad dentro del rango
    const dentroRangoEdad =
      respuestas.edad >= ruta.edad_minima && respuestas.edad <= ruta.edad_maxima;

    // No recomendar rutas avanzadas a principiantes absolutos
    const nivelCompatible = !(
      respuestas.nivel_programacion === 'nunca' && ruta.nivel_estudiante === 'avanzado'
    );

    return dentroRangoEdad && nivelCompatible;
  });

  // Fallback si no hay rutas compatibles
  if (rutasCompatibles.length === 0) {
    const fallback = todasLasRutas.find(
      (r) => respuestas.edad >= r.edad_minima && respuestas.edad <= r.edad_maxima,
    );

    return {
      ruta_principal: fallback || todasLasRutas[0],
      score_match: 50,
      alternativas: [],
      mensaje_personalizado: generarMensajeGenerico(respuestas, fallback || todasLasRutas[0]),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 2: SCORING - Calcular puntuación para cada ruta
  // ═══════════════════════════════════════════════════════════════════════════
  const rutasConScore = rutasCompatibles.map((ruta) => ({
    ruta,
    score: calcularScore(ruta, respuestas),
  }));

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 3: ORDENAR - Por score descendente, desempate por duración
  // ═══════════════════════════════════════════════════════════════════════════
  rutasConScore.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Empate: priorizar rutas más cortas (mejor para empezar)
    return a.ruta.duracion_total_meses - b.ruta.duracion_total_meses;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 4: SELECCIONAR - Principal y alternativas
  // ═══════════════════════════════════════════════════════════════════════════
  const principal = rutasConScore[0];
  const alternativas = rutasConScore
    .slice(1, 4) // Máximo 3 alternativas
    .filter((r) => r.score >= 60) // Solo alternativas con buen match
    .map((r) => r.ruta);

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 5: GENERAR MENSAJE PERSONALIZADO
  // ═══════════════════════════════════════════════════════════════════════════
  const mensaje = generarMensajePersonalizado(respuestas, principal.ruta);

  return {
    ruta_principal: principal.ruta,
    score_match: principal.score,
    alternativas,
    mensaje_personalizado: mensaje,
  };
}

/**
 * Calcula el score de match entre una ruta y las respuestas (0-100)
 * Ahora con 50+ puntos de datos del nuevo quiz
 */
function calcularScore(ruta: Ruta, respuestas: QuizResponses): number {
  let score = 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. OBJETIVO PRINCIPAL (25 puntos) - EL MÁS IMPORTANTE
  // ═══════════════════════════════════════════════════════════════════════════
  const objetivoScore = calcularScoreObjetivo(ruta, respuestas.objetivo_principal);
  score += objetivoScore;

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. INTERESES Y ACTIVIDADES (20 puntos) - Basado en qué hace en tiempo libre
  // ═══════════════════════════════════════════════════════════════════════════
  const interesesScore = calcularScoreIntereses(ruta, respuestas);
  score += interesesScore;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. NIVEL TÉCNICO (20 puntos) - Programación + Matemática + Desafíos
  // ═══════════════════════════════════════════════════════════════════════════
  const nivelScore = calcularScoreNivel(ruta, respuestas);
  score += nivelScore;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. PERSONALIDAD Y ESTILO (15 puntos) - Cómo aprende y crea
  // ═══════════════════════════════════════════════════════════════════════════
  const personalidadScore = calcularScorePersonalidad(ruta, respuestas);
  score += personalidadScore;

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MOTIVACIÓN Y TIEMPO (10 puntos) - Compromiso y disponibilidad
  // ═══════════════════════════════════════════════════════════════════════════
  const motivacionScore = calcularScoreMotivacion(ruta, respuestas);
  score += motivacionScore;

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. EDAD (10 puntos) - Qué tan cerca está de la edad ideal
  // ═══════════════════════════════════════════════════════════════════════════
  const edadScore = calcularScoreEdad(ruta, respuestas.edad);
  score += edadScore;

  return Math.min(100, Math.round(score));
}

/**
 * Score basado en objetivo principal (0-25 puntos)
 */
function calcularScoreObjetivo(ruta: Ruta, objetivo: string): number {
  const matchesObjetivo: Record<string, string[]> = {
    crear_su_propio_juego: ['videojuegos', 'crear_cosas', 'programacion'],
    publicar_juego_roblox: ['videojuegos', 'crear_cosas'],
    ganar_olimpiada: ['matematica', 'competencias'],
    hacer_web_propia: ['programacion', 'crear_cosas'],
    entender_como_funcionan_juegos: ['videojuegos', 'programacion'],
    mejorar_en_mate: ['matematica'],
    aprender_ia: ['programacion', 'matematica', 'ciencias'],
    crear_app: ['programacion', 'crear_cosas'],
    explorar_ciencia: ['ciencias'],
  };

  const objetivosRuta = matchesObjetivo[objetivo] || [];
  const hayMatch = ruta.objetivos_match?.some((obj) => objetivosRuta.includes(obj));

  if (hayMatch) return 25;

  // Match parcial: si el objetivo es compatible con intereses de la ruta
  const matchParcial = ruta.intereses_requeridos?.some((int) => objetivosRuta.includes(int));
  if (matchParcial) return 15;

  return 0;
}

/**
 * Score basado en intereses y actividades (0-20 puntos)
 */
function calcularScoreIntereses(ruta: Ruta, respuestas: QuizResponses): number {
  let score = 0;

  // Actividades de tiempo libre
  const actividades = respuestas.actividades_tiempo_libre || [];

  if (actividades.includes('videojuegos') && ruta.intereses_requeridos?.includes('videojuegos')) {
    score += 8;
  }
  if (actividades.includes('matematica') && ruta.intereses_requeridos?.includes('matematica')) {
    score += 8;
  }
  if (actividades.includes('ciencia') && ruta.intereses_requeridos?.includes('ciencias')) {
    score += 8;
  }
  if (actividades.includes('arte_crear') && ruta.intereses_requeridos?.includes('crear_cosas')) {
    score += 8;
  }
  if (actividades.includes('programar') && ruta.intereses_requeridos?.includes('programacion')) {
    score += 8;
  }

  // Bonus: Contenido que consume
  const contenido = respuestas.contenido_consume || [];
  if (contenido.includes('programacion') && ruta.intereses_requeridos?.includes('programacion')) {
    score += 4;
  }
  if (contenido.includes('matematica') && ruta.intereses_requeridos?.includes('matematica')) {
    score += 4;
  }
  if (contenido.includes('ciencia') && ruta.intereses_requeridos?.includes('ciencias')) {
    score += 4;
  }

  // Bonus extra: juegos específicos (si aplica)
  const juegos = respuestas.juegos_favoritos || [];
  if (juegos.includes('minecraft') && ruta.nombre.toLowerCase().includes('minecraft')) {
    score += 5;
  }
  if (juegos.includes('roblox') && ruta.nombre.toLowerCase().includes('roblox')) {
    score += 5;
  }

  return Math.min(20, score);
}

/**
 * Score basado en nivel técnico (0-20 puntos)
 */
function calcularScoreNivel(ruta: Ruta, respuestas: QuizResponses): number {
  let score = 0;

  // Mapeo de nivel de programación a nivel de estudiante
  const nivelMap: Record<string, string> = {
    nunca: 'principiante',
    scratch_basico: 'principiante',
    scratch_avanzado: 'intermedio',
    otro_lenguaje: 'avanzado',
  };

  const nivelEstudiante = nivelMap[respuestas.nivel_programacion || 'nunca'];

  if (ruta.nivel_estudiante === nivelEstudiante) {
    score += 15; // Nivel perfecto
  } else if (nivelEstudiante === 'principiante' && ruta.nivel_estudiante === 'intermedio') {
    score += 8; // Puede dar el salto
  } else if (nivelEstudiante === 'intermedio' && ruta.nivel_estudiante === 'principiante') {
    score += 10; // Puede repasar
  }

  // Bonus por nivel de matemática
  if (
    respuestas.nivel_mate_escuela === 'es_lo_mejor' &&
    ruta.intereses_requeridos?.includes('matematica')
  ) {
    score += 3;
  }
  if (
    respuestas.nivel_mate_escuela === 'muy_bien' &&
    ruta.intereses_requeridos?.includes('matematica')
  ) {
    score += 2;
  }

  // Bonus por gusto por desafíos
  if (respuestas.disfruta_desafios === 'si_mucho') {
    score += 2; // Puede con rutas más exigentes
  }

  return Math.min(20, score);
}

/**
 * Score basado en personalidad y estilo (0-15 puntos)
 */
function calcularScorePersonalidad(ruta: Ruta, respuestas: QuizResponses): number {
  let score = 5; // Base score

  // Personalidad ante problemas
  if (respuestas.personalidad_problema === 'insiste_solo') {
    // Perseverante: funciona bien con rutas autodirigidas
    score += 5;
  } else if (respuestas.personalidad_problema === 'pide_ayuda') {
    // Colaborativo: prefiere rutas con soporte
    score += 4;
  } else if (respuestas.personalidad_problema === 'busca_alternativa') {
    // Creativo: funciona bien con rutas abiertas
    score += 5;
  } else if (respuestas.personalidad_problema === 'se_frustra') {
    // Necesita apoyo: mejor con rutas más estructuradas
    score += 3;
  }

  // Estilo creativo
  if (
    respuestas.estilo_creativo === 'planifica_primero' &&
    ruta.intereses_requeridos?.includes('programacion')
  ) {
    score += 3; // Planificadores -> programación estructurada
  } else if (
    respuestas.estilo_creativo === 'improvisa' &&
    ruta.intereses_requeridos?.includes('crear_cosas')
  ) {
    score += 3; // Improvisadores -> proyectos creativos
  } else if (respuestas.estilo_creativo === 'copia_tutoriales') {
    score += 2; // Aprende bien con guías paso a paso
  }

  return Math.min(15, score);
}

/**
 * Score basado en motivación y tiempo (0-10 puntos)
 */
function calcularScoreMotivacion(ruta: Ruta, respuestas: QuizResponses): number {
  let score = 0;

  // Nivel de motivación
  if (respuestas.nivel_motivacion === 'muy_motivado') {
    score += 5; // Puede con cualquier ruta
  } else if (respuestas.nivel_motivacion === 'curioso') {
    score += 4; // Buen nivel de compromiso
  } else if (respuestas.nivel_motivacion === 'padres_quieren') {
    score += 2; // Mejor empezar con rutas más cortas/divertidas
  }

  // Tiempo disponible
  if (respuestas.tiempo_disponible === '1-2hrs') {
    // Poco tiempo: priorizar rutas más cortas
    if (ruta.duracion_total_meses <= 6) {
      score += 5;
    } else if (ruta.duracion_total_meses <= 8) {
      score += 3;
    }
  } else if (respuestas.tiempo_disponible === '3-4hrs') {
    // Tiempo medio: cualquier ruta funciona bien
    score += 5;
  } else if (respuestas.tiempo_disponible === '5+hrs') {
    // Mucho tiempo: puede hacer rutas más intensas
    if (ruta.duracion_total_meses >= 8) {
      score += 5;
    } else {
      score += 4;
    }
  }

  return Math.min(10, score);
}

/**
 * Score basado en edad (0-10 puntos)
 */
function calcularScoreEdad(ruta: Ruta, edad: number): number {
  const edadIdeal = (ruta.edad_minima + ruta.edad_maxima) / 2;
  const diferenciaEdad = Math.abs(edad - edadIdeal);

  if (diferenciaEdad <= 1) return 10; // Edad perfecta
  if (diferenciaEdad <= 2) return 8; // Muy buena edad
  if (diferenciaEdad <= 3) return 6; // Edad aceptable
  if (diferenciaEdad <= 5) return 3; // Edad marginal

  return 0;
}

/**
 * Genera un mensaje personalizado basado en las respuestas y la ruta
 */
function generarMensajePersonalizado(respuestas: QuizResponses, ruta: Ruta): string {
  const nombre = respuestas.nombre_estudiante;
  const partes: string[] = [];

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONALIDAD
  // ═══════════════════════════════════════════════════════════════════════════
  if (respuestas.personalidad_problema === 'insiste_solo') {
    partes.push(`${nombre} es perseverante y le gusta resolver las cosas solo/a`);
  } else if (respuestas.personalidad_problema === 'pide_ayuda') {
    partes.push(`${nombre} es colaborativo/a y sabe pedir ayuda cuando la necesita`);
  } else if (respuestas.personalidad_problema === 'busca_alternativa') {
    partes.push(`${nombre} es creativo/a y busca diferentes formas de resolver problemas`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERESES ESPECÍFICOS
  // ═══════════════════════════════════════════════════════════════════════════
  const actividades = respuestas.actividades_tiempo_libre || [];
  const interesesTexto: string[] = [];

  if (actividades.includes('videojuegos')) interesesTexto.push('los videojuegos');
  if (actividades.includes('matematica')) interesesTexto.push('la matemática');
  if (actividades.includes('ciencia')) interesesTexto.push('la ciencia');
  if (actividades.includes('arte_crear')) interesesTexto.push('crear y diseñar');
  if (actividades.includes('programar')) interesesTexto.push('programar');

  if (interesesTexto.length > 0) {
    partes.push(`le fascina ${interesesTexto.join(', ')}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OBJETIVO
  // ═══════════════════════════════════════════════════════════════════════════
  const objetivos: Record<string, string> = {
    crear_su_propio_juego: 'crear su propio juego',
    publicar_juego_roblox: 'publicar un juego en Roblox',
    ganar_olimpiada: 'destacarse en olimpiadas',
    hacer_web_propia: 'crear su propia web',
    entender_como_funcionan_juegos: 'entender cómo funcionan los juegos',
    mejorar_en_mate: 'mejorar en matemática',
    aprender_ia: 'aprender sobre IA',
    crear_app: 'crear su propia app',
    explorar_ciencia: 'explorar ciencia',
  };

  const objetivoTexto = objetivos[respuestas.objetivo_principal];
  if (objetivoTexto) {
    partes.push(`y quiere ${objetivoTexto}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NIVEL
  // ═══════════════════════════════════════════════════════════════════════════
  const nivelTexto: Record<string, string> = {
    nunca: 'Aunque no tiene experiencia previa',
    scratch_basico: 'Con su experiencia básica en Scratch',
    scratch_avanzado: 'Con su nivel avanzado en Scratch',
    otro_lenguaje: 'Con su experiencia en programación',
  };

  const nivel = nivelTexto[respuestas.nivel_programacion || 'nunca'];

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUIR MENSAJE FINAL
  // ═══════════════════════════════════════════════════════════════════════════
  const base = partes.join(', ');
  const mensaje = `${base}. ${nivel}, la ruta "${ruta.nombre}" es perfecta para alcanzar sus objetivos.`;

  return mensaje;
}

/**
 * Mensaje genérico de fallback
 */
function generarMensajeGenerico(respuestas: QuizResponses, ruta: Ruta): string {
  return `La ruta "${ruta.nombre}" es apropiada para ${respuestas.nombre_estudiante} de ${respuestas.edad} años y le permitirá desarrollar nuevas habilidades.`;
}

/**
 * Función auxiliar: explica por qué una ruta tiene cierto score (para debug)
 */
export function explicarScore(
  ruta: Ruta,
  respuestas: QuizResponses,
): {
  score_total: number;
  desglose: {
    objetivo: number;
    intereses: number;
    nivel: number;
    personalidad: number;
    motivacion: number;
    edad: number;
  };
} {
  const desglose = {
    objetivo: calcularScoreObjetivo(ruta, respuestas.objetivo_principal),
    intereses: calcularScoreIntereses(ruta, respuestas),
    nivel: calcularScoreNivel(ruta, respuestas),
    personalidad: calcularScorePersonalidad(ruta, respuestas),
    motivacion: calcularScoreMotivacion(ruta, respuestas),
    edad: calcularScoreEdad(ruta, respuestas.edad),
  };

  const score_total = Object.values(desglose).reduce((a, b) => a + b, 0);

  return { score_total: Math.min(100, Math.round(score_total)), desglose };
}
