import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { GuardarSemanaDto } from '../../dto/guardar-semana.dto';
import {
  SemanaCompleta,
  SemanaContenidoJson,
  EstadoSemanaStudio,
  EstadoCursoStudio,
} from '../../interfaces';
import { ValidarSemanaService } from './validar-semana.service';

/**
 * Servicio para guardar contenido de semanas
 * Responsabilidad única: Guardar JSON de semana después de validar
 */
@Injectable()
export class GuardarSemanaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validarSemanaService: ValidarSemanaService,
  ) {}

  /**
   * Guarda el contenido de una semana
   * Valida el JSON antes de guardar
   * @param cursoId ID del curso
   * @param numeroSemana Número de la semana
   * @param dto DTO con el contenido
   * @returns Semana actualizada
   */
  async ejecutar(
    cursoId: string,
    numeroSemana: number,
    dto: GuardarSemanaDto,
  ): Promise<SemanaCompleta> {
    // Verificar que la semana existe y obtener datos del curso
    const semanaExistente = await this.prisma.semanaStudio.findUnique({
      where: {
        curso_id_numero: {
          curso_id: cursoId,
          numero: numeroSemana,
        },
      },
    });

    if (!semanaExistente) {
      throw new NotFoundException(
        `Semana ${numeroSemana} del curso ${cursoId} no encontrada`,
      );
    }

    // Obtener datos del curso para validación
    const curso = await this.prisma.cursoStudio.findUnique({
      where: { id: cursoId },
      select: {
        casa: true,
        actividades_por_semana: true,
      },
    });

    if (!curso) {
      throw new NotFoundException(`Curso ${cursoId} no encontrado`);
    }

    // Validar el contenido
    const validacion = await this.validarSemanaService.ejecutar(dto.contenido, {
      casa: curso.casa,
      numeroSemanaEsperado: numeroSemana,
      actividadesEsperadas: curso.actividades_por_semana,
    });

    if (!validacion.valido) {
      // Retornar errores de validación
      const erroresMsgs = validacion.errores
        .map((e) => `${e.ubicacion}: ${e.mensaje}`)
        .join('; ');
      throw new BadRequestException(`Validación fallida: ${erroresMsgs}`);
    }

    const contenido = dto.contenido as unknown as SemanaContenidoJson;

    // Guardar en transacción
    const semana = await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar semana
      const semanaActualizada = await tx.semanaStudio.update({
        where: {
          curso_id_numero: {
            curso_id: cursoId,
            numero: numeroSemana,
          },
        },
        data: {
          nombre: contenido.nombre,
          descripcion: contenido.descripcion,
          contenido: JSON.stringify(dto.contenido),
          estado: EstadoSemanaStudio.COMPLETA,
        },
      });

      // 2. Actualizar estado del curso si corresponde
      await this.actualizarEstadoCurso(tx, cursoId);

      return semanaActualizada;
    });

    return {
      id: semana.id,
      cursoId: semana.curso_id,
      numero: semana.numero,
      nombre: semana.nombre,
      descripcion: semana.descripcion,
      contenido: semana.contenido as SemanaContenidoJson | null,
      estado: semana.estado,
      creadoEn: semana.creado_en,
      actualizadoEn: semana.actualizado_en,
    };
  }

  /**
   * Actualiza el estado del curso según las semanas completadas
   */
  private async actualizarEstadoCurso(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    cursoId: string,
  ): Promise<void> {
    const curso = await tx.cursoStudio.findUnique({
      where: { id: cursoId },
      include: {
        semanas: {
          select: { estado: true },
        },
      },
    });

    if (!curso) return;

    const semanasCompletas = curso.semanas.filter(
      (s) => s.estado === EstadoSemanaStudio.COMPLETA,
    ).length;

    let nuevoEstado = curso.estado;

    // Si hay al menos una semana completa y el curso está en DRAFT, pasar a EN_PROGRESO
    if (semanasCompletas > 0 && curso.estado === EstadoCursoStudio.DRAFT) {
      nuevoEstado = EstadoCursoStudio.EN_PROGRESO;
    }

    // Si todas las semanas están completas, pasar a EN_REVISION
    if (
      semanasCompletas === curso.cantidad_semanas &&
      curso.estado !== EstadoCursoStudio.PUBLICADO
    ) {
      nuevoEstado = EstadoCursoStudio.EN_REVISION;
    }

    if (nuevoEstado !== curso.estado) {
      await tx.cursoStudio.update({
        where: { id: cursoId },
        data: { estado: nuevoEstado },
      });
    }
  }
}
