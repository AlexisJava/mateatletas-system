import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CasaTipo, MundoTipo } from '@prisma/client';

/**
 * DTOs para grupos pedagógicos
 */
export interface FiltrosGrupoPedagogicoDto {
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  activo?: boolean | string; // Query params llegan como string
}

export interface ActualizarGrupoPedagogicoDto {
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
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

    if (filtros.casaTipo) {
      where.casaTipo = filtros.casaTipo;
    }
    if (filtros.mundoTipo) {
      where.mundoTipo = filtros.mundoTipo;
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
      orderBy: [{ casaTipo: 'asc' }, { mundoTipo: 'asc' }, { codigo: 'asc' }],
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
   * Actualizar casaTipo y mundoTipo de un grupo
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
        casaTipo: dto.casaTipo,
        mundoTipo: dto.mundoTipo,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });

    this.logger.log(
      `Grupo ${grupo.codigo} actualizado: casa=${dto.casaTipo}, mundo=${dto.mundoTipo}`,
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
   * Migrar grupos legacy (sectorId) a Casa/Mundo
   * Útil para migración de datos existentes
   */
  async migrarGruposLegacy() {
    const gruposLegacy = await this.prisma.grupoPedagogico.findMany({
      where: {
        sectorId: { not: null },
        OR: [{ casaTipo: null }, { mundoTipo: null }],
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
        grupo.edadMinima,
        grupo.edadMaxima,
      );

      if (!casaTipo && !mundoTipo) continue;

      await this.prisma.grupoPedagogico.update({
        where: { id: grupo.id },
        data: { casaTipo: casaTipo, mundoTipo: mundoTipo },
      });

      resultados.push({
        id: grupo.id,
        codigo: grupo.codigo,
        casaTipo: casaTipo,
        mundoTipo: mundoTipo,
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
        by: ['casaTipo'],
        where: { activo: true },
        _count: true,
      }),
      this.prisma.grupoPedagogico.groupBy({
        by: ['mundoTipo'],
        where: { activo: true },
        _count: true,
      }),
      this.prisma.grupoPedagogico.aggregate({
        where: { activo: true },
        _count: true,
      }),
    ]);

    return {
      totalGrupos: totales._count,
      porCasa: porCasa.map((c) => ({
        casa: c.casaTipo ?? 'SIN_ASIGNAR',
        cantidad: c._count,
      })),
      porMundo: porMundo.map((m) => ({
        mundo: m.mundoTipo ?? 'SIN_ASIGNAR',
        cantidad: m._count,
      })),
    };
  }
}
