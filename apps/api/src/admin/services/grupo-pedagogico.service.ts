import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CasaTipo, MundoTipo } from '@prisma/client';

/**
 * DTOs para grupos pedagógicos
 */
export interface FiltrosGrupoPedagogicoDto {
  casa_tipo?: CasaTipo;
  mundo_tipo?: MundoTipo;
  activo?: boolean;
}

export interface ActualizarGrupoPedagogicoDto {
  casa_tipo?: CasaTipo;
  mundo_tipo?: MundoTipo;
  nombre?: string;
  descripcion?: string;
}

/**
 * Servicio para gestionar Grupos Pedagógicos con Casa/Mundo
 * Sistema Casa/Mundo 2026
 *
 * Nota: Este servicio maneja la lógica específica de Casa/Mundo.
 * La lógica existente de ClaseGrupos sigue en ClaseGruposService.
 */
@Injectable()
export class GrupoPedagogicoService {
  private readonly logger = new Logger(GrupoPedagogicoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar grupos pedagógicos con filtros de Casa/Mundo
   */
  async listar(filtros: FiltrosGrupoPedagogicoDto) {
    const where: Record<string, unknown> = {};

    if (filtros.casa_tipo) {
      where.casa_tipo = filtros.casa_tipo;
    }
    if (filtros.mundo_tipo) {
      where.mundo_tipo = filtros.mundo_tipo;
    }
    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }

    return this.prisma.grupoPedagogico.findMany({
      where,
      include: {
        _count: {
          select: {
            claseGrupos: true,
            comisionesProducto: true,
          },
        },
      },
      orderBy: [{ casa_tipo: 'asc' }, { mundo_tipo: 'asc' }, { codigo: 'asc' }],
    });
  }

  /**
   * Obtener un grupo pedagógico por ID
   */
  async obtenerPorId(id: string) {
    const grupo = await this.prisma.grupoPedagogico.findUnique({
      where: { id },
      include: {
        claseGrupos: {
          where: { activo: true },
          include: {
            docente: { select: { id: true, nombre: true, apellido: true } },
            _count: { select: { inscripciones: true } },
          },
        },
        comisionesProducto: {
          where: { activo: true },
          include: {
            producto: { select: { id: true, nombre: true } },
            _count: { select: { inscripciones: true } },
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo pedagógico ${id} no encontrado`);
    }

    return grupo;
  }

  /**
   * Actualizar casa_tipo y mundo_tipo de un grupo
   */
  async actualizar(id: string, dto: ActualizarGrupoPedagogicoDto) {
    const grupo = await this.prisma.grupoPedagogico.findUnique({
      where: { id },
    });
    if (!grupo) {
      throw new NotFoundException(`Grupo pedagógico ${id} no encontrado`);
    }

    const actualizado = await this.prisma.grupoPedagogico.update({
      where: { id },
      data: {
        casa_tipo: dto.casa_tipo,
        mundo_tipo: dto.mundo_tipo,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });

    this.logger.log(
      `Grupo ${grupo.codigo} actualizado: casa=${dto.casa_tipo}, mundo=${dto.mundo_tipo}`,
    );
    return actualizado;
  }

  /**
   * Migrar grupos legacy (sector_id) a Casa/Mundo
   * Útil para migración de datos existentes
   */
  async migrarGruposLegacy() {
    // Obtener grupos con sector_id pero sin casa_tipo/mundo_tipo
    const gruposLegacy = await this.prisma.grupoPedagogico.findMany({
      where: {
        sector_id: { not: null },
        OR: [{ casa_tipo: null }, { mundo_tipo: null }],
      },
      include: {
        sector: true,
      },
    });

    if (gruposLegacy.length === 0) {
      return { mensaje: 'No hay grupos legacy para migrar', migrados: 0 };
    }

    const resultados = [];

    for (const grupo of gruposLegacy) {
      // Mapear sector a mundo
      let mundoTipo: MundoTipo | null = null;
      if (grupo.sector?.nombre) {
        const nombreLower = grupo.sector.nombre.toLowerCase();
        if (nombreLower.includes('matem')) {
          mundoTipo = MundoTipo.MATEMATICA;
        } else if (
          nombreLower.includes('prog') ||
          nombreLower.includes('compu')
        ) {
          mundoTipo = MundoTipo.PROGRAMACION;
        } else if (nombreLower.includes('ciencia')) {
          mundoTipo = MundoTipo.CIENCIAS;
        }
      }

      // Inferir casa por rango de edad del grupo
      let casaTipo: CasaTipo | null = null;
      if (grupo.edad_minima !== null && grupo.edad_maxima !== null) {
        const edadPromedio = (grupo.edad_minima + grupo.edad_maxima) / 2;
        if (edadPromedio < 10) {
          casaTipo = CasaTipo.QUANTUM;
        } else if (edadPromedio < 13) {
          casaTipo = CasaTipo.VERTEX;
        } else {
          casaTipo = CasaTipo.PULSAR;
        }
      }

      if (casaTipo || mundoTipo) {
        await this.prisma.grupoPedagogico.update({
          where: { id: grupo.id },
          data: {
            casa_tipo: casaTipo,
            mundo_tipo: mundoTipo,
          },
        });

        resultados.push({
          id: grupo.id,
          codigo: grupo.codigo,
          casa_tipo: casaTipo,
          mundo_tipo: mundoTipo,
        });
      }
    }

    this.logger.log(`Migrados ${resultados.length} grupos legacy a Casa/Mundo`);

    return {
      mensaje: `Migrados ${resultados.length} grupos`,
      migrados: resultados.length,
      detalles: resultados,
    };
  }

  /**
   * Obtener estadísticas de grupos por Casa/Mundo
   */
  async obtenerEstadisticas() {
    const [porCasa, porMundo, totales] = await Promise.all([
      this.prisma.grupoPedagogico.groupBy({
        by: ['casa_tipo'],
        where: { activo: true },
        _count: true,
      }),
      this.prisma.grupoPedagogico.groupBy({
        by: ['mundo_tipo'],
        where: { activo: true },
        _count: true,
      }),
      this.prisma.grupoPedagogico.aggregate({
        where: { activo: true },
        _count: true,
      }),
    ]);

    return {
      total_grupos: totales._count,
      por_casa: porCasa.map((c) => ({
        casa: c.casa_tipo ?? 'SIN_ASIGNAR',
        cantidad: c._count,
      })),
      por_mundo: porMundo.map((m) => ({
        mundo: m.mundo_tipo ?? 'SIN_ASIGNAR',
        cantidad: m._count,
      })),
    };
  }
}
