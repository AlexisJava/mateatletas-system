import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { SemanaCompleta, SemanaContenidoJson } from '../../interfaces';

/**
 * Servicio para obtener semanas
 * Responsabilidad única: Consultar semanas de un curso
 */
@Injectable()
export class ObtenerSemanaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene una semana específica por número
   * @param cursoId ID del curso
   * @param numeroSemana Número de la semana (1-indexed)
   * @returns Semana completa con contenido
   */
  async ejecutar(
    cursoId: string,
    numeroSemana: number,
  ): Promise<SemanaCompleta> {
    const semana = await this.prisma.semanaStudio.findUnique({
      where: {
        curso_id_numero: {
          curso_id: cursoId,
          numero: numeroSemana,
        },
      },
    });

    if (!semana) {
      throw new NotFoundException(
        `Semana ${numeroSemana} del curso ${cursoId} no encontrada`,
      );
    }

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
   * Lista todas las semanas de un curso
   * @param cursoId ID del curso
   * @returns Lista de semanas ordenadas por número
   */
  async listarPorCurso(cursoId: string): Promise<SemanaCompleta[]> {
    const semanas = await this.prisma.semanaStudio.findMany({
      where: { curso_id: cursoId },
      orderBy: { numero: 'asc' },
    });

    return semanas.map((s) => ({
      id: s.id,
      cursoId: s.curso_id,
      numero: s.numero,
      nombre: s.nombre,
      descripcion: s.descripcion,
      contenido: s.contenido as SemanaContenidoJson | null,
      estado: s.estado,
      creadoEn: s.creado_en,
      actualizadoEn: s.actualizado_en,
    }));
  }
}
