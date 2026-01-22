import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CasaTipo, MundoTipo, TipoAsignacionDocente } from '@prisma/client';

/**
 * DTOs para asignaciones de docentes
 */
export interface AsignarCasaDto {
  casaTipo: CasaTipo;
}

export interface AsignarMundoDto {
  mundoTipo: MundoTipo;
}

export interface ActualizarTipoAsignacionDto {
  tipoAsignacion: TipoAsignacionDocente;
}

export interface FiltrosDocentesDto {
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
  tipoAsignacion?: TipoAsignacionDocente;
}

/**
 * Servicio para gestionar asignaciones de Docentes a Casas y Mundos
 * Sistema Casa/Mundo 2026
 */
@Injectable()
export class DocenteAsignacionesService {
  private readonly logger = new Logger(DocenteAsignacionesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // ASIGNACIONES DE CASAS
  // ============================================================================

  /**
   * Asignar una Casa a un docente
   */
  async asignarCasa(docenteId: string, dto: AsignarCasaDto) {
    // Verificar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    // Verificar si ya tiene esta casa asignada
    const existente = await this.prisma.docenteCasa.findUnique({
      where: {
        docenteId_casaTipo: {
          docenteId: docenteId,
          casaTipo: dto.casaTipo,
        },
      },
    });
    if (existente) {
      throw new ConflictException(
        `El docente ya tiene asignada la casa ${dto.casaTipo}`,
      );
    }

    const asignacion = await this.prisma.docenteCasa.create({
      data: {
        docenteId: docenteId,
        casaTipo: dto.casaTipo,
      },
      include: { docente: { select: { nombre: true, apellido: true } } },
    });

    this.logger.log(
      `Casa ${dto.casaTipo} asignada a docente ${docente.nombre} ${docente.apellido}`,
    );
    return asignacion;
  }

  /**
   * Remover una Casa de un docente
   */
  async removerCasa(docenteId: string, casaTipo: CasaTipo) {
    const asignacion = await this.prisma.docenteCasa.findUnique({
      where: {
        docenteId_casaTipo: {
          docenteId: docenteId,
          casaTipo: casaTipo,
        },
      },
    });
    if (!asignacion) {
      throw new NotFoundException(
        `El docente no tiene asignada la casa ${casaTipo}`,
      );
    }

    await this.prisma.docenteCasa.delete({
      where: {
        docenteId_casaTipo: {
          docenteId: docenteId,
          casaTipo: casaTipo,
        },
      },
    });

    this.logger.log(`Casa ${casaTipo} removida del docente ${docenteId}`);
    return { mensaje: `Casa ${casaTipo} removida exitosamente` };
  }

  /**
   * Obtener todas las casas asignadas a un docente
   */
  async obtenerCasasDocente(docenteId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    return this.prisma.docenteCasa.findMany({
      where: { docenteId: docenteId },
      orderBy: { asignadoEn: 'asc' },
    });
  }

  /**
   * Listar docentes por Casa
   */
  async listarDocentesPorCasa(casaTipo: CasaTipo) {
    return this.prisma.docenteCasa.findMany({
      where: { casaTipo: casaTipo },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            tipoAsignacion: true,
          },
        },
      },
      orderBy: { asignadoEn: 'asc' },
    });
  }

  // ============================================================================
  // ASIGNACIONES DE MUNDOS
  // ============================================================================

  /**
   * Asignar un Mundo a un docente
   */
  async asignarMundo(docenteId: string, dto: AsignarMundoDto) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    const existente = await this.prisma.docenteMundo.findUnique({
      where: {
        docenteId_mundoTipo: {
          docenteId: docenteId,
          mundoTipo: dto.mundoTipo,
        },
      },
    });
    if (existente) {
      throw new ConflictException(
        `El docente ya tiene asignado el mundo ${dto.mundoTipo}`,
      );
    }

    const asignacion = await this.prisma.docenteMundo.create({
      data: {
        docenteId: docenteId,
        mundoTipo: dto.mundoTipo,
      },
      include: { docente: { select: { nombre: true, apellido: true } } },
    });

    this.logger.log(
      `Mundo ${dto.mundoTipo} asignado a docente ${docente.nombre} ${docente.apellido}`,
    );
    return asignacion;
  }

  /**
   * Remover un Mundo de un docente
   */
  async removerMundo(docenteId: string, mundoTipo: MundoTipo) {
    const asignacion = await this.prisma.docenteMundo.findUnique({
      where: {
        docenteId_mundoTipo: {
          docenteId: docenteId,
          mundoTipo: mundoTipo,
        },
      },
    });
    if (!asignacion) {
      throw new NotFoundException(
        `El docente no tiene asignado el mundo ${mundoTipo}`,
      );
    }

    await this.prisma.docenteMundo.delete({
      where: {
        docenteId_mundoTipo: {
          docenteId: docenteId,
          mundoTipo: mundoTipo,
        },
      },
    });

    this.logger.log(`Mundo ${mundoTipo} removido del docente ${docenteId}`);
    return { mensaje: `Mundo ${mundoTipo} removido exitosamente` };
  }

  /**
   * Obtener todos los mundos asignados a un docente
   */
  async obtenerMundosDocente(docenteId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    return this.prisma.docenteMundo.findMany({
      where: { docenteId: docenteId },
      orderBy: { asignadoEn: 'asc' },
    });
  }

  /**
   * Listar docentes por Mundo
   */
  async listarDocentesPorMundo(mundoTipo: MundoTipo) {
    return this.prisma.docenteMundo.findMany({
      where: { mundoTipo: mundoTipo },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            tipoAsignacion: true,
          },
        },
      },
      orderBy: { asignadoEn: 'asc' },
    });
  }

  // ============================================================================
  // TIPO DE ASIGNACIÓN
  // ============================================================================

  /**
   * Actualizar el tipo de asignación del docente
   */
  async actualizarTipoAsignacion(
    docenteId: string,
    dto: ActualizarTipoAsignacionDto,
  ) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    const actualizado = await this.prisma.docente.update({
      where: { id: docenteId },
      data: { tipoAsignacion: dto.tipoAsignacion },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tipoAsignacion: true,
      },
    });

    this.logger.log(
      `Tipo asignación actualizado a ${dto.tipoAsignacion} para ${docente.nombre} ${docente.apellido}`,
    );
    return actualizado;
  }

  // ============================================================================
  // CONSULTAS COMBINADAS
  // ============================================================================

  /**
   * Obtener perfil completo de asignaciones del docente
   */
  async obtenerPerfilAsignaciones(docenteId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tipoAsignacion: true,
      },
    });
    if (!docente) {
      throw new NotFoundException(`Docente ${docenteId} no encontrado`);
    }

    const [casas, mundos] = await Promise.all([
      this.prisma.docenteCasa.findMany({
        where: { docenteId: docenteId },
        orderBy: { asignadoEn: 'asc' },
      }),
      this.prisma.docenteMundo.findMany({
        where: { docenteId: docenteId },
        orderBy: { asignadoEn: 'asc' },
      }),
    ]);

    return {
      ...docente,
      casas,
      mundos,
    };
  }

  /**
   * Listar docentes con filtros de Casa/Mundo
   */
  async listarDocentesConFiltros(filtros: FiltrosDocentesDto) {
    // Construir where dinámico
    const docenteIds: string[] = [];
    let needsIntersection = false;

    // Filtrar por casa
    if (filtros.casaTipo) {
      const docentesConCasa = await this.prisma.docenteCasa.findMany({
        where: { casaTipo: filtros.casaTipo },
        select: { docenteId: true },
      });
      docenteIds.push(...docentesConCasa.map((d) => d.docenteId));
      needsIntersection = true;
    }

    // Filtrar por mundo
    if (filtros.mundoTipo) {
      const docentesConMundo = await this.prisma.docenteMundo.findMany({
        where: { mundoTipo: filtros.mundoTipo },
        select: { docenteId: true },
      });

      if (needsIntersection) {
        // Intersección con los que ya tienen la casa
        const mundoIds = new Set(docentesConMundo.map((d) => d.docenteId));
        const intersected = docenteIds.filter((id) => mundoIds.has(id));
        docenteIds.length = 0;
        docenteIds.push(...intersected);
      } else {
        docenteIds.push(...docentesConMundo.map((d) => d.docenteId));
        needsIntersection = true;
      }
    }

    // Construir where final
    const where: Record<string, unknown> = {};

    if (filtros.tipoAsignacion) {
      where.tipoAsignacion = filtros.tipoAsignacion;
    }

    if (needsIntersection) {
      where.id = { in: docenteIds };
    }

    const docentes = await this.prisma.docente.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipoAsignacion: true,
      },
      orderBy: { apellido: 'asc' },
    });

    // Agregar casas y mundos a cada docente
    const result = await Promise.all(
      docentes.map(async (docente) => {
        const [casas, mundos] = await Promise.all([
          this.prisma.docenteCasa.findMany({
            where: { docenteId: docente.id },
          }),
          this.prisma.docenteMundo.findMany({
            where: { docenteId: docente.id },
          }),
        ]);
        return { ...docente, casas, mundos };
      }),
    );

    return result;
  }
}
