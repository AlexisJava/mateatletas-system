import { Injectable } from '@nestjs/common';
import {
  ValidacionSemanaResult,
  ValidacionError,
  ValidacionWarning,
  ValidacionInfo,
  SemanaContenidoJson,
  ActividadJson,
  BloqueJson,
  CasaTipo,
} from '../../interfaces';

/**
 * Contexto para validación de semana
 */
export interface ValidacionContexto {
  casa: CasaTipo;
  numeroSemanaEsperado: number;
  actividadesEsperadas: number;
}

/**
 * Servicio para validar contenido de semanas
 * Responsabilidad única: Validar JSON de semana según las reglas del documento
 *
 * Referencia: docs/MATEATLETAS_STUDIO.md Sección 9
 */
@Injectable()
export class ValidarSemanaService {
  /**
   * Catálogo de componentes válidos
   * TODO: Mover a un servicio/archivo separado cuando el catálogo crezca
   */
  private readonly componentesValidos = new Set([
    // Interactivos básicos (1-15)
    'DragDrop',
    'FillBlanks',
    'Matching',
    'MultipleChoice',
    'NumberInput',
    'Ordering',
    'Slider',
    'TextInput',
    'TrueFalse',
    'ColorPicker',
    'DrawingCanvas',
    'SortingBins',
    'Hotspot',
    'Timeline',
    'Puzzle',
    // Simuladores (16-40)
    'Calculator',
    'GraphPlotter',
    'GeoBoard',
    'FractionCircles',
    'NumberLine',
    'BaseBlocks',
    'PatternMaker',
    'SymmetryMirror',
    'AngleMeasurer',
    'AreaBuilder',
    'StateMatterSim',
    'WaveSim',
    'CircuitBuilder',
    'PendulumLab',
    'ProjectileMotion',
    'GravitySim',
    'ReactionBalancer',
    'MoleculeBuild',
    'PeriodicTable',
    'ConcentrationSim',
    // Editores de código (41-55)
    'ScratchJr',
    'Blockly',
    'PythonTurtle',
    'PythonConsole',
    'JavaScriptPlayground',
    'HTMLPreview',
    'CSSPlayground',
    'SQLSandbox',
    'GitSimulator',
    'AlgorithmVisualizer',
    'DataStructureViz',
    'DebugChallenge',
    'CodeDiff',
    'RegexTester',
    'JSONValidator',
    // Contenido estático (56-70)
    'TextBlock',
    'ImageDisplay',
    'VideoEmbed',
    'CodeSnippet',
    'MathFormula',
    'Table',
    'List',
    'Accordion',
    'Tabs',
    'Carousel',
    'Tooltip',
    'Callout',
    'Quote',
    'Divider',
    'Spacer',
    // Multimedia (71-80)
    'AudioPlayer',
    'VideoPlayer',
    'ImageGallery',
    'Slideshow',
    'Animation',
    'Quiz',
    'Survey',
    'ChallengeMode',
    'Leaderboard',
    'Timer',
    // Gamificación (81-91)
    'ProgressBar',
    'XPCounter',
    'BadgeDisplay',
    'AchievementUnlock',
    'StreakTracker',
    'LevelIndicator',
    'StarRating',
    'CoinCounter',
    'MissionTracker',
    'RewardAnimation',
    'CelebrationEffect',
    // Nuevos componentes (92-95)
    'InteractivePresentation',
    'NarrationWithTracking',
    'StepAnimation',
    'Checkpoint',
  ]);

  /**
   * Valida el contenido de una semana
   * @param contenido JSON a validar
   * @param contexto Contexto con información del curso
   * @returns Resultado de validación
   */
  async ejecutar(
    contenido: Record<string, unknown>,
    contexto: ValidacionContexto,
  ): Promise<ValidacionSemanaResult> {
    const errores: ValidacionError[] = [];
    const warnings: ValidacionWarning[] = [];
    const info: ValidacionInfo[] = [];

    const semana = contenido as unknown as SemanaContenidoJson;

    // Validar campos requeridos de semana
    this.validarCamposRequeridosSemana(semana, errores);

    // Validar número de semana
    this.validarNumeroSemana(semana, contexto.numeroSemanaEsperado, errores);

    // Validar cantidad de actividades
    this.validarCantidadActividades(
      semana,
      contexto.actividadesEsperadas,
      errores,
      warnings,
    );

    // Validar cada actividad
    if (semana.actividades) {
      semana.actividades.forEach((act, idx) => {
        this.validarActividad(act, idx, contexto.casa, errores, warnings);
      });
    }

    // Agregar info de resumen
    if (semana.actividades) {
      info.push({
        tipo: 'info',
        mensaje: `Semana con ${semana.actividades.length} actividades validada`,
      });
    }

    return {
      valido: errores.length === 0,
      errores,
      warnings,
      info,
    };
  }

  private validarCamposRequeridosSemana(
    semana: SemanaContenidoJson,
    errores: ValidacionError[],
  ): void {
    if (!semana.nombre) {
      errores.push({
        tipo: 'error',
        ubicacion: 'semana.nombre',
        mensaje: 'El nombre de la semana es requerido',
      });
    }

    if (!semana.descripcion) {
      errores.push({
        tipo: 'error',
        ubicacion: 'semana.descripcion',
        mensaje: 'La descripción de la semana es requerida',
      });
    }

    if (
      !semana.objetivosAprendizaje ||
      semana.objetivosAprendizaje.length === 0
    ) {
      errores.push({
        tipo: 'error',
        ubicacion: 'semana.objetivosAprendizaje',
        mensaje: 'Debe haber al menos un objetivo de aprendizaje',
      });
    }

    if (!semana.actividades || semana.actividades.length === 0) {
      errores.push({
        tipo: 'error',
        ubicacion: 'semana.actividades',
        mensaje: 'Debe haber al menos una actividad',
      });
    }
  }

  private validarNumeroSemana(
    semana: SemanaContenidoJson,
    esperado: number,
    errores: ValidacionError[],
  ): void {
    if (semana.numero !== esperado) {
      errores.push({
        tipo: 'error',
        ubicacion: 'semana.numero',
        mensaje: `El número de semana (${semana.numero}) no coincide con el esperado (${esperado})`,
        sugerencia: `Cambiar "numero": ${semana.numero} por "numero": ${esperado}`,
      });
    }
  }

  private validarCantidadActividades(
    semana: SemanaContenidoJson,
    esperadas: number,
    errores: ValidacionError[],
    warnings: ValidacionWarning[],
  ): void {
    const cantidad = semana.actividades?.length ?? 0;

    if (cantidad < esperadas) {
      warnings.push({
        tipo: 'warning',
        ubicacion: 'semana.actividades',
        mensaje: `Se esperaban ${esperadas} actividades, hay ${cantidad}`,
        ignorable: true,
      });
    }

    if (cantidad > esperadas) {
      warnings.push({
        tipo: 'warning',
        ubicacion: 'semana.actividades',
        mensaje: `Hay más actividades (${cantidad}) de las esperadas (${esperadas})`,
        ignorable: true,
      });
    }
  }

  private validarActividad(
    actividad: ActividadJson,
    idx: number,
    casa: CasaTipo,
    errores: ValidacionError[],
    warnings: ValidacionWarning[],
  ): void {
    const ubicacionBase = `actividad_${idx + 1}`;

    // Campos requeridos
    if (!actividad.nombre) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacionBase}.nombre`,
        mensaje: 'El nombre de la actividad es requerido',
      });
    }

    // Duración
    if (actividad.duracionMinutos < 5 || actividad.duracionMinutos > 60) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacionBase}.duracionMinutos`,
        mensaje: 'La duración debe estar entre 5 y 60 minutos',
      });
    }

    // Bloques
    if (!actividad.bloques || actividad.bloques.length < 2) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacionBase}.bloques`,
        mensaje: 'Cada actividad debe tener al menos 2 bloques',
      });
    }

    if (actividad.bloques && actividad.bloques.length > 10) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacionBase}.bloques`,
        mensaje: 'Una actividad no puede tener más de 10 bloques',
      });
    }

    // Validar cada bloque
    if (actividad.bloques) {
      actividad.bloques.forEach((bloque, bloqueIdx) => {
        this.validarBloque(
          bloque,
          bloqueIdx,
          ubicacionBase,
          casa,
          errores,
          warnings,
        );
      });

      // Validar orden secuencial
      this.validarOrdenBloques(actividad.bloques, ubicacionBase, errores);
    }

    // Gamificación
    if (!actividad.gamificacion) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacionBase}.gamificacion`,
        mensaje: 'La configuración de gamificación es requerida',
      });
    }
  }

  private validarBloque(
    bloque: BloqueJson,
    idx: number,
    ubicacionBase: string,
    casa: CasaTipo,
    errores: ValidacionError[],
    warnings: ValidacionWarning[],
  ): void {
    const ubicacion = `${ubicacionBase}.bloque_${idx + 1}`;

    // Componente existe en catálogo
    if (!this.componentesValidos.has(bloque.componente)) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacion}.componente`,
        mensaje: `Componente "${bloque.componente}" no existe en el catálogo`,
        sugerencia:
          'Ver docs/MATEATLETAS_STUDIO.md Sección 7 para componentes disponibles',
      });
    }

    // Título requerido
    if (!bloque.titulo) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacion}.titulo`,
        mensaje: 'El título del bloque es requerido',
      });
    }

    // Si tiene minimoParaAprobar, debe tener repasoSiFalla
    if (bloque.minimoParaAprobar !== undefined && !bloque.repasoSiFalla) {
      warnings.push({
        tipo: 'warning',
        ubicacion: `${ubicacion}`,
        mensaje: `Bloque con minimoParaAprobar (${bloque.minimoParaAprobar}%) pero sin repasoSiFalla`,
        ignorable: false,
      });
    }

    // minimoParaAprobar debe estar entre 70 y 100
    if (
      bloque.minimoParaAprobar !== undefined &&
      (bloque.minimoParaAprobar < 70 || bloque.minimoParaAprobar > 100)
    ) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacion}.minimoParaAprobar`,
        mensaje: 'minimoParaAprobar debe estar entre 70 y 100',
      });
    }

    // TODO: Validar componente por casa (advertencia si no es apropiado)
    // Esto requiere una tabla de compatibilidad componente/casa
  }

  private validarOrdenBloques(
    bloques: BloqueJson[],
    ubicacionBase: string,
    errores: ValidacionError[],
  ): void {
    const ordenes = bloques.map((b) => b.orden);
    const ordenesUnicos = new Set(ordenes);

    if (ordenes.length !== ordenesUnicos.size) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacionBase}.bloques`,
        mensaje: 'Los números de orden de los bloques deben ser únicos',
      });
    }

    // Verificar que los ordenes sean secuenciales
    const ordenesOrdenados = [...ordenes].sort((a, b) => a - b);
    for (let i = 0; i < ordenesOrdenados.length; i++) {
      if (ordenesOrdenados[i] !== i + 1) {
        errores.push({
          tipo: 'error',
          ubicacion: `${ubicacionBase}.bloques`,
          mensaje: `Los números de orden deben ser secuenciales desde 1. Falta o sobra el orden ${i + 1}`,
        });
        break;
      }
    }
  }
}
