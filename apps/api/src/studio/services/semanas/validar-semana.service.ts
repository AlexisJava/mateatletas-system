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
import { CatalogoService } from '../../catalogo/catalogo.service';

/** Contexto para validación de semana */
export interface ValidacionContexto {
  casa: CasaTipo;
  numeroSemanaEsperado: number;
  actividadesEsperadas: number;
}

/** Servicio para validar contenido de semanas (docs/MATEATLETAS_STUDIO.md Sección 9) */
@Injectable()
export class ValidarSemanaService {
  private componentesHabilitadosCache: Set<string> | null = null;

  constructor(private readonly catalogoService: CatalogoService) {}

  private async getComponentesHabilitados(): Promise<Set<string>> {
    if (this.componentesHabilitadosCache) {
      return this.componentesHabilitadosCache;
    }
    const componentes = await this.catalogoService.listarHabilitados();
    this.componentesHabilitadosCache = new Set(componentes.map((c) => c.tipo));
    return this.componentesHabilitadosCache;
  }

  /** Limpia el cache de componentes */
  clearCache(): void {
    this.componentesHabilitadosCache = null;
  }

  /** Valida el contenido de una semana */
  async ejecutar(
    contenido: Record<string, unknown>,
    contexto: ValidacionContexto,
  ): Promise<ValidacionSemanaResult> {
    const errores: ValidacionError[] = [];
    const warnings: ValidacionWarning[] = [];
    const info: ValidacionInfo[] = [];

    // Cargar componentes habilitados una sola vez
    const componentesHabilitados = await this.getComponentesHabilitados();

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
        this.validarActividad(
          act,
          idx,
          componentesHabilitados,
          errores,
          warnings,
        );
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
    componentesHabilitados: Set<string>,
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
          componentesHabilitados,
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
    componentesHabilitados: Set<string>,
    errores: ValidacionError[],
    warnings: ValidacionWarning[],
  ): void {
    const ubicacion = `${ubicacionBase}.bloque_${idx + 1}`;

    // Componente debe estar habilitado en el catálogo
    if (!componentesHabilitados.has(bloque.componente)) {
      errores.push({
        tipo: 'error',
        ubicacion: `${ubicacion}.componente`,
        mensaje: `Componente "${bloque.componente}" no está habilitado. Habilitalo en la Biblioteca o usá otro componente.`,
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
