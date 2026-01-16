import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Query Service para operaciones de lectura del módulo Docentes
 *
 * Responsabilidades:
 * - Búsquedas y listados de docentes
 * - Solo operaciones READ (sin side effects)
 * - Excluye password_hash de las respuestas (excepto findByEmail para auth)
 *
 * Patrón: CQRS (Command Query Responsibility Segregation)
 */
@Injectable()
export class DocenteQueryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos los docentes con paginación
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   * @returns Lista paginada de docentes sin password_hash
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [docentes, total] = await Promise.all([
      this.prisma.docente.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.docente.count(),
    ]);

    // Excluir password_hash de todos los docentes
    const docentesSinPassword = docentes.map(
      ({ password_hash: _password_hash, ...docente }) => docente,
    );

    return {
      data: docentesSinPassword,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca un docente por email (usado para autenticación)
   * IMPORTANTE: Este método SÍ retorna password_hash para verificación
   * @param email - Email del docente
   * @returns Docente con password_hash incluido, o null si no existe
   */
  async findByEmail(email: string) {
    return await this.prisma.docente.findUnique({
      where: { email },
    });
  }

  /**
   * Busca un docente por ID
   * @param id - ID del docente
   * @returns Docente sin password_hash, incluye sectores únicos
   * @throws NotFoundException si el docente no existe
   */
  async findById(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        rutasEspecialidad: {
          include: {
            sector: {
              select: {
                nombre: true,
                icono: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Excluir password_hash del resultado (ignoreRestSiblings en eslint config)
    const { password_hash, ...docenteSinPassword } = docente;

    // Extraer sectores únicos de las rutas de especialidad
    const sectoresMap = new Map();
    docente.rutasEspecialidad?.forEach((dr) => {
      const sector = dr.sector;
      if (sector) {
        sectoresMap.set(sector.nombre, sector);
      }
    });
    const sectores = Array.from(sectoresMap.values());

    return {
      ...docenteSinPassword,
      sectores,
    };
  }

  /**
   * Busca múltiples docentes por sus IDs
   * Helper interno para operaciones que necesitan múltiples docentes
   * @param ids - Array de IDs de docentes
   * @returns Array de docentes sin password_hash
   */
  async findByIds(ids: string[]) {
    const docentes = await this.prisma.docente.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    // Excluir password_hash
    return docentes.map(
      ({ password_hash: _password_hash, ...docente }) => docente,
    );
  }

  /**
   * Obtiene el conteo de clases asignadas a un docente
   * Cuenta ClaseGrupos (grupos recurrentes) y Comisiones (cursos)
   * @param id - ID del docente
   * @returns { claseGrupos, comisiones, total }
   */
  async getClasesCount(id: string) {
    const [claseGrupos, comisiones] = await Promise.all([
      this.prisma.claseGrupo.count({
        where: {
          docente_id: id,
          activo: true,
        },
      }),
      this.prisma.comision.count({
        where: {
          docente_id: id,
          activo: true,
        },
      }),
    ]);

    return {
      claseGrupos,
      comisiones,
      total: claseGrupos + comisiones,
    };
  }

  /**
   * Obtiene el conteo de clases de TODOS los docentes en una sola operación
   * Evita el problema N+1 cuando se necesita el conteo de múltiples docentes
   * @returns Record<docenteId, { claseGrupos, comisiones, total }>
   */
  async getClasesCountBatch(): Promise<
    Record<string, { claseGrupos: number; comisiones: number; total: number }>
  > {
    // Usar groupBy para obtener todos los conteos en 2 queries (en paralelo)
    const [claseGruposPorDocente, comisionesPorDocente] = await Promise.all([
      this.prisma.claseGrupo.groupBy({
        by: ['docente_id'],
        where: { activo: true },
        _count: { id: true },
      }),
      this.prisma.comision.groupBy({
        by: ['docente_id'],
        where: { activo: true },
        _count: { id: true },
      }),
    ]);

    // Crear mapas para lookup rápido (filtrando nulls en runtime)
    const claseGruposMap = new Map<string, number>();
    for (const item of claseGruposPorDocente) {
      if (item.docente_id) {
        claseGruposMap.set(item.docente_id, item._count.id);
      }
    }

    const comisionesMap = new Map<string, number>();
    for (const item of comisionesPorDocente) {
      if (item.docente_id) {
        comisionesMap.set(item.docente_id, item._count.id);
      }
    }

    // Obtener todos los IDs de docentes únicos
    const docenteIds = new Set<string>();
    for (const item of claseGruposPorDocente) {
      if (item.docente_id) docenteIds.add(item.docente_id);
    }
    for (const item of comisionesPorDocente) {
      if (item.docente_id) docenteIds.add(item.docente_id);
    }

    // Construir resultado
    const result: Record<
      string,
      { claseGrupos: number; comisiones: number; total: number }
    > = {};

    for (const docenteId of docenteIds) {
      const claseGrupos = claseGruposMap.get(docenteId) ?? 0;
      const comisiones = comisionesMap.get(docenteId) ?? 0;

      result[docenteId] = {
        claseGrupos,
        comisiones,
        total: claseGrupos + comisiones,
      };
    }

    return result;
  }
}
