import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  CursoListItem,
  EstadoCursoStudio,
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
} from '../../interfaces';

/**
 * Filtros para listar cursos
 */
export interface ListarCursosFiltros {
  estado?: EstadoCursoStudio;
  categoria?: CategoriaStudio;
  mundo?: MundoTipo;
  casa?: CasaTipo;
}

/**
 * Servicio para listar cursos
 * Responsabilidad única: Consultar lista de cursos con filtros opcionales
 */
@Injectable()
export class ListarCursosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista cursos con filtros opcionales
   * @param filtros Filtros opcionales
   * @returns Lista de cursos resumidos
   */
  async ejecutar(filtros?: ListarCursosFiltros): Promise<CursoListItem[]> {
    const where: Prisma.CursoStudioWhereInput = {};

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }
    if (filtros?.categoria) {
      where.categoria = filtros.categoria;
    }
    if (filtros?.mundo) {
      where.mundo = filtros.mundo;
    }
    if (filtros?.casa) {
      where.casa = filtros.casa;
    }

    const cursos = await this.prisma.cursoStudio.findMany({
      where,
      include: {
        semanas: {
          select: {
            estado: true,
          },
        },
      },
      orderBy: { actualizado_en: 'desc' },
    });

    return cursos.map((curso) => ({
      id: curso.id,
      nombre: curso.nombre,
      categoria: curso.categoria,
      mundo: curso.mundo,
      casa: curso.casa,
      estado: curso.estado,
      cantidadSemanas: curso.cantidad_semanas,
      semanasCompletas: curso.semanas.filter((s) => s.estado === 'COMPLETA')
        .length,
      creadoEn: curso.creado_en,
      actualizadoEn: curso.actualizado_en,
    }));
  }

  /**
   * Cuenta cursos por estado
   */
  async contarPorEstado(): Promise<Record<EstadoCursoStudio, number>> {
    const counts = await this.prisma.cursoStudio.groupBy({
      by: ['estado'],
      _count: { estado: true },
    });

    const result: Record<EstadoCursoStudio, number> = {
      DRAFT: 0,
      EN_PROGRESO: 0,
      EN_REVISION: 0,
      PUBLICADO: 0,
    };

    counts.forEach((c) => {
      result[c.estado] = c._count.estado;
    });

    return result;
  }
}
