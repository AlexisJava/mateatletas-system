import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CatalogoService } from '../catalogo/catalogo.service';
import { ValidarSemanaService } from '../services/semanas/validar-semana.service';
import { GuardarSemanaDto } from './dto/guardar-semana.dto';
import {
  SemanaEditorResponse,
  ValidacionResponse,
  BloqueEditorResponse,
} from './dto/respuesta-editor.dto';
import { EstadoSemanaStudio, CasaTipo, Prisma } from '@prisma/client';

/** Estructura del JSON de contenido de semana almacenado */
interface ContenidoSemanaJson {
  numero: number;
  nombre: string;
  descripcion: string;
  objetivosAprendizaje: string[];
  actividades: Array<{
    numero: number;
    nombre: string;
    descripcion: string;
    duracionMinutos: number;
    objetivos: string[];
    prerrequisitos: unknown;
    bloques: Array<{
      orden: number;
      componente: string;
      titulo: string;
      contenido: Record<string, unknown>;
      minimoParaAprobar?: number;
      repasoSiFalla?: unknown;
    }>;
    gamificacion: {
      xpCompletar: number;
      xpBonusSinErrores: number;
      badge: unknown;
    };
    notasDocente: unknown;
  }>;
  recursos: unknown[];
  resumenGamificacion: {
    xpTotalSemana: number;
    xpBonusPosible: number;
    badgesPosibles: unknown[];
  };
}

@Injectable()
export class EditorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogoService: CatalogoService,
    private readonly validarSemanaService: ValidarSemanaService,
  ) {}

  /** Carga una semana para edición */
  async cargarSemana(
    cursoId: string,
    semanaNum: number,
  ): Promise<SemanaEditorResponse> {
    const semana = await this.prisma.semanaStudio.findUnique({
      where: { curso_id_numero: { curso_id: cursoId, numero: semanaNum } },
      include: { curso: true },
    });

    if (!semana) {
      throw new NotFoundException(
        `Semana ${semanaNum} no encontrada en curso ${cursoId}`,
      );
    }

    const componentesHabilitados =
      await this.catalogoService.listarHabilitados();
    const componentesDisponibles = componentesHabilitados.map((c) => c.tipo);

    const contenido = semana.contenido as ContenidoSemanaJson | null;
    const bloques = this.extraerBloques(contenido);
    const metadata = this.extraerMetadata(contenido);

    return {
      semana,
      metadata,
      bloques,
      componentesDisponibles,
    };
  }

  /** Guarda una semana con validación */
  async guardarSemana(
    cursoId: string,
    semanaNum: number,
    data: GuardarSemanaDto,
  ): Promise<SemanaEditorResponse> {
    // Verificar que la semana existe
    const semanaExistente = await this.prisma.semanaStudio.findUnique({
      where: { curso_id_numero: { curso_id: cursoId, numero: semanaNum } },
      include: { curso: true },
    });

    if (!semanaExistente) {
      throw new NotFoundException(
        `Semana ${semanaNum} no encontrada en curso ${cursoId}`,
      );
    }

    // Construir JSON completo para validación
    const contenidoJson = this.construirContenidoJson(data, semanaNum);

    // Validar contenido (cast a Record para compatibilidad)
    const validacion = await this.validarSemanaService.ejecutar(
      contenidoJson as unknown as Record<string, unknown>,
      {
        casa: semanaExistente.curso.casa,
        numeroSemanaEsperado: semanaNum,
        actividadesEsperadas: 1,
      },
    );

    if (!validacion.valido) {
      const erroresStr = validacion.errores.map((e) => e.mensaje);
      throw new Error(`Validación fallida: ${erroresStr.join('; ')}`);
    }

    // Guardar
    const semanaActualizada = await this.prisma.semanaStudio.update({
      where: { curso_id_numero: { curso_id: cursoId, numero: semanaNum } },
      data: {
        nombre: data.metadata.titulo,
        descripcion: data.metadata.descripcion,
        contenido: contenidoJson as unknown as Prisma.InputJsonValue,
        estado: EstadoSemanaStudio.COMPLETA,
      },
      include: { curso: true },
    });

    const componentesHabilitados =
      await this.catalogoService.listarHabilitados();

    return {
      semana: semanaActualizada,
      metadata: {
        titulo: data.metadata.titulo,
        descripcion: data.metadata.descripcion,
        objetivos: data.metadata.objetivos,
      },
      bloques: data.bloques.map((b) => ({
        id: b.id,
        orden: b.orden,
        componente: b.componente,
        titulo: b.titulo,
        contenido: b.contenido,
        minimoParaAprobar: b.minimoParaAprobar,
      })),
      componentesDisponibles: componentesHabilitados.map((c) => c.tipo),
    };
  }

  /** Valida datos sin persistir */
  async validarSinGuardar(data: GuardarSemanaDto): Promise<ValidacionResponse> {
    const contenidoJson = this.construirContenidoJson(data, 1);

    // Limpiar cache para obtener datos frescos
    this.validarSemanaService.clearCache();

    const validacion = await this.validarSemanaService.ejecutar(
      contenidoJson as unknown as Record<string, unknown>,
      {
        casa: CasaTipo.VERTEX,
        numeroSemanaEsperado: 1,
        actividadesEsperadas: 1,
      },
    );

    return {
      valido: validacion.valido,
      errores: validacion.errores.map((e) => e.mensaje),
    };
  }

  /** Extrae bloques del JSON de contenido */
  private extraerBloques(
    contenido: ContenidoSemanaJson | null,
  ): BloqueEditorResponse[] {
    if (!contenido?.actividades?.length) return [];

    const bloques: BloqueEditorResponse[] = [];
    let globalId = 0;

    for (const actividad of contenido.actividades) {
      for (const bloque of actividad.bloques || []) {
        bloques.push({
          id: `bloque-${globalId++}`,
          orden: bloque.orden,
          componente: bloque.componente,
          titulo: bloque.titulo,
          contenido: bloque.contenido,
          minimoParaAprobar: bloque.minimoParaAprobar,
        });
      }
    }

    return bloques;
  }

  /** Extrae metadata del JSON de contenido */
  private extraerMetadata(contenido: ContenidoSemanaJson | null): {
    titulo: string;
    descripcion?: string;
    objetivos?: string[];
  } {
    if (!contenido) {
      return { titulo: '' };
    }

    return {
      titulo: contenido.nombre || '',
      descripcion: contenido.descripcion,
      objetivos: contenido.objetivosAprendizaje,
    };
  }

  /** Construye JSON de contenido desde DTOs */
  private construirContenidoJson(
    data: GuardarSemanaDto,
    semanaNum: number,
  ): ContenidoSemanaJson {
    return {
      numero: semanaNum,
      nombre: data.metadata.titulo,
      descripcion: data.metadata.descripcion || '',
      objetivosAprendizaje: data.metadata.objetivos || [
        'Objetivo de la semana',
      ],
      actividades: [
        {
          numero: 1,
          nombre: data.metadata.titulo,
          descripcion: data.metadata.descripcion || '',
          duracionMinutos: 15,
          objetivos: data.metadata.objetivos || ['Completar actividad'],
          prerrequisitos: null,
          bloques: data.bloques.map((b) => ({
            orden: b.orden,
            componente: b.componente,
            titulo: b.titulo,
            contenido: b.contenido,
            minimoParaAprobar: b.minimoParaAprobar,
            repasoSiFalla: undefined,
          })),
          gamificacion: {
            xpCompletar: 10,
            xpBonusSinErrores: 5,
            badge: null,
          },
          notasDocente: null,
        },
      ],
      recursos: [],
      resumenGamificacion: {
        xpTotalSemana: 15,
        xpBonusPosible: 5,
        badgesPosibles: [],
      },
    };
  }
}
