import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CasaTipo, MundoTipo } from '@prisma/client';

/**
 * DTOs para grupos pedagógicos
 */
export interface FiltrosGrupoPedagogicoDto {
  casa_tipo?: CasaTipo;
  mundo_tipo?: MundoTipo;
  activo?: boolean | string; // Query params llegan como string
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
      // Query params llegan como string, convertir a boolean
      where.activo =
        filtros.activo === true || filtros.activo === 'true' ? true : false;
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
   * Inferir MundoTipo a partir del nombre del sector
   */
  private inferirMundoDesdeNombreSector(
    nombreSector: string | undefined,
  ): MundoTipo | null {
    if (!nombreSector) return null;

    const nombreLower = nombreSector.toLowerCase();
    if (nombreLower.includes('matem')) return MundoTipo.MATEMATICA;
    if (nombreLower.includes('prog') || nombreLower.includes('compu')) {
      return MundoTipo.PROGRAMACION;
    }
    if (nombreLower.includes('ciencia')) return MundoTipo.CIENCIAS;

    return null;
  }

  /**
   * Inferir CasaTipo a partir del rango de edad
   */
  private inferirCasaDesdeEdad(
    edadMinima: number | null,
    edadMaxima: number | null,
  ): CasaTipo | null {
    if (edadMinima === null || edadMaxima === null) return null;

    const edadPromedio = (edadMinima + edadMaxima) / 2;
    if (edadPromedio < 10) return CasaTipo.QUANTUM;
    if (edadPromedio < 13) return CasaTipo.VERTEX;
    return CasaTipo.PULSAR;
  }

  /**
   * Migrar grupos legacy (sector_id) a Casa/Mundo
   * Útil para migración de datos existentes
   */
  async migrarGruposLegacy() {
    const gruposLegacy = await this.prisma.grupoPedagogico.findMany({
      where: {
        sector_id: { not: null },
        OR: [{ casa_tipo: null }, { mundo_tipo: null }],
      },
      include: { sector: true },
    });

    if (gruposLegacy.length === 0) {
      return { mensaje: 'No hay grupos legacy para migrar', migrados: 0 };
    }

    const resultados = [];

    for (const grupo of gruposLegacy) {
      const mundoTipo = this.inferirMundoDesdeNombreSector(
        grupo.sector?.nombre,
      );
      const casaTipo = this.inferirCasaDesdeEdad(
        grupo.edad_minima,
        grupo.edad_maxima,
      );

      if (!casaTipo && !mundoTipo) continue;

      await this.prisma.grupoPedagogico.update({
        where: { id: grupo.id },
        data: { casa_tipo: casaTipo, mundo_tipo: mundoTipo },
      });

      resultados.push({
        id: grupo.id,
        codigo: grupo.codigo,
        casa_tipo: casaTipo,
        mundo_tipo: mundoTipo,
      });
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
