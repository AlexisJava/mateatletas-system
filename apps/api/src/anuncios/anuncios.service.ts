import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearAnuncioDto } from './dto/crear-anuncio.dto';
import { ActualizarAnuncioDto } from './dto/actualizar-anuncio.dto';
import { TipoAnuncio, EstadoInscripcionComision } from '@prisma/client';

/**
 * Servicio para gestionar anuncios de docentes a grupos/comisiones
 *
 * Responsabilidades:
 * - CRUD de anuncios para docentes
 * - Lectura de anuncios para tutores (de sus hijos)
 * - Lectura de anuncios para estudiantes (de sus comisiones)
 * - Notificaciones para anuncios IMPORTANTE/URGENTE
 */
@Injectable()
export class AnunciosService {
  private readonly logger = new Logger(AnunciosService.name);

  constructor(
    private prisma: PrismaService,
    private notificacionesService: NotificacionesService,
  ) {}

  // ============================================================================
  // OPERACIONES DE DOCENTE
  // ============================================================================

  /**
   * Crear un nuevo anuncio (solo docente)
   */
  async crearAnuncio(docenteId: string, dto: CrearAnuncioDto) {
    // Validar que si se especifica comisionId, sea del docente
    if (dto.comisionId) {
      const comision = await this.prisma.comision.findFirst({
        where: {
          id: dto.comisionId,
          docenteId: docenteId,
        },
      });

      if (!comision) {
        throw new ForbiddenException(
          'No tenés permiso para publicar en esta comisión',
        );
      }
    }

    const anuncio = await this.prisma.anuncio.create({
      data: {
        docenteId,
        titulo: dto.titulo,
        contenido: dto.contenido,
        tipo: dto.tipo ?? TipoAnuncio.INFORMATIVO,
        comisionId: dto.comisionId ?? null,
        fechaExpiracion: dto.fechaExpiracion
          ? new Date(dto.fechaExpiracion)
          : null,
      },
      include: {
        comision: {
          select: { id: true, nombre: true },
        },
        docente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    this.logger.log(
      `Anuncio creado: ${anuncio.id} por docente ${docenteId} (tipo: ${anuncio.tipo})`,
    );

    // Notificar si es IMPORTANTE o URGENTE
    if (
      anuncio.tipo === TipoAnuncio.IMPORTANTE ||
      anuncio.tipo === TipoAnuncio.URGENTE
    ) {
      await this.notificarAnuncio(anuncio);
    }

    return anuncio;
  }

  /**
   * Listar anuncios del docente autenticado
   */
  async listarAnunciosDocente(docenteId: string, incluirInactivos = false) {
    const where = {
      docenteId,
      ...(incluirInactivos ? {} : { activo: true }),
    };

    return this.prisma.anuncio.findMany({
      where,
      include: {
        comision: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener un anuncio por ID (solo el docente dueño)
   */
  async obtenerAnuncioDocente(anuncioId: string, docenteId: string) {
    const anuncio = await this.prisma.anuncio.findUnique({
      where: { id: anuncioId },
      include: {
        comision: {
          select: { id: true, nombre: true },
        },
        docente: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    if (!anuncio) {
      throw new NotFoundException(`Anuncio con ID ${anuncioId} no encontrado`);
    }

    if (anuncio.docenteId !== docenteId) {
      throw new ForbiddenException('No tenés permiso para ver este anuncio');
    }

    return anuncio;
  }

  /**
   * Actualizar un anuncio (solo el docente dueño)
   */
  async actualizarAnuncio(
    anuncioId: string,
    docenteId: string,
    dto: ActualizarAnuncioDto,
  ) {
    // Verificar que el anuncio existe y pertenece al docente
    await this.obtenerAnuncioDocente(anuncioId, docenteId);

    const anuncio = await this.prisma.anuncio.update({
      where: { id: anuncioId },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.contenido !== undefined && { contenido: dto.contenido }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
        ...(dto.fechaExpiracion !== undefined && {
          fechaExpiracion: dto.fechaExpiracion
            ? new Date(dto.fechaExpiracion)
            : null,
        }),
      },
      include: {
        comision: {
          select: { id: true, nombre: true },
        },
      },
    });

    this.logger.log(
      `Anuncio actualizado: ${anuncioId} por docente ${docenteId}`,
    );

    return anuncio;
  }

  /**
   * Eliminar un anuncio (solo el docente dueño)
   */
  async eliminarAnuncio(anuncioId: string, docenteId: string) {
    // Verificar que el anuncio existe y pertenece al docente
    await this.obtenerAnuncioDocente(anuncioId, docenteId);

    await this.prisma.anuncio.delete({
      where: { id: anuncioId },
    });

    this.logger.log(`Anuncio eliminado: ${anuncioId} por docente ${docenteId}`);

    return { message: 'Anuncio eliminado exitosamente' };
  }

  // ============================================================================
  // OPERACIONES DE TUTOR (LECTURA)
  // ============================================================================

  /**
   * Listar anuncios para un tutor (de los docentes de sus hijos)
   */
  async listarAnunciosTutor(tutorId: string) {
    // Obtener las comisiones de los estudiantes del tutor
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutorId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        inscripcionesComision: {
          where: { estado: EstadoInscripcionComision.Confirmada },
          select: {
            comision: {
              select: {
                id: true,
                nombre: true,
                docenteId: true,
              },
            },
          },
        },
      },
    });

    // Extraer IDs de comisiones y docentes
    const comisionIds = new Set<string>();
    const docenteIds = new Set<string>();

    for (const estudiante of estudiantes) {
      for (const inscripcion of estudiante.inscripcionesComision) {
        comisionIds.add(inscripcion.comision.id);
        if (inscripcion.comision.docenteId) {
          docenteIds.add(inscripcion.comision.docenteId);
        }
      }
    }

    const now = new Date();

    // Buscar anuncios:
    // 1. De comisiones específicas donde están mis hijos
    // 2. Generales (sin comisionId) de esos docentes
    // 3. No expirados
    const anuncios = await this.prisma.anuncio.findMany({
      where: {
        activo: true,
        AND: [
          {
            OR: [
              // Anuncios para comisiones específicas de mis hijos
              { comisionId: { in: Array.from(comisionIds) } },
              // Anuncios generales de los docentes de mis hijos
              {
                docenteId: { in: Array.from(docenteIds) },
                comisionId: null,
              },
            ],
          },
          {
            // No expirados
            OR: [{ fechaExpiracion: null }, { fechaExpiracion: { gte: now } }],
          },
        ],
      },
      include: {
        docente: {
          select: { id: true, nombre: true, apellido: true },
        },
        comision: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: [{ tipo: 'desc' }, { createdAt: 'desc' }],
    });

    return anuncios;
  }

  // ============================================================================
  // OPERACIONES DE ESTUDIANTE (LECTURA)
  // ============================================================================

  /**
   * Listar anuncios para un estudiante (de sus comisiones)
   */
  async listarAnunciosEstudiante(estudianteId: string) {
    // Obtener las comisiones del estudiante
    const inscripciones = await this.prisma.inscripcionComision.findMany({
      where: {
        estudianteId,
        estado: EstadoInscripcionComision.Confirmada,
      },
      include: {
        comision: {
          select: {
            id: true,
            nombre: true,
            docenteId: true,
          },
        },
      },
    });

    const comisionIds = inscripciones.map((i) => i.comision.id);
    const docenteIds = inscripciones
      .map((i) => i.comision.docenteId)
      .filter((id): id is string => id !== null);

    const now = new Date();

    // Buscar anuncios de mis comisiones + generales de esos docentes
    const anuncios = await this.prisma.anuncio.findMany({
      where: {
        activo: true,
        AND: [
          {
            OR: [
              { comisionId: { in: comisionIds } },
              {
                docenteId: { in: docenteIds },
                comisionId: null,
              },
            ],
          },
          {
            OR: [{ fechaExpiracion: null }, { fechaExpiracion: { gte: now } }],
          },
        ],
      },
      include: {
        docente: {
          select: { id: true, nombre: true, apellido: true },
        },
        comision: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: [{ tipo: 'desc' }, { createdAt: 'desc' }],
    });

    return anuncios;
  }

  // ============================================================================
  // NOTIFICACIONES
  // ============================================================================

  /**
   * Notificar a tutores y estudiantes sobre un anuncio IMPORTANTE/URGENTE
   */
  private async notificarAnuncio(anuncio: {
    id: string;
    docenteId: string;
    comisionId: string | null;
    titulo: string;
    tipo: TipoAnuncio;
    docente: { nombre: string; apellido: string };
  }) {
    const docenteNombre = `${anuncio.docente.nombre} ${anuncio.docente.apellido}`;

    // Obtener estudiantes afectados
    let estudiantes: {
      id: string;
      tutorId: string;
      nombre: string;
      apellido: string;
    }[];

    if (anuncio.comisionId) {
      // Anuncio para una comisión específica
      const inscripciones = await this.prisma.inscripcionComision.findMany({
        where: {
          comisionId: anuncio.comisionId,
          estado: EstadoInscripcionComision.Confirmada,
        },
        include: {
          estudiante: {
            select: { id: true, tutorId: true, nombre: true, apellido: true },
          },
        },
      });
      estudiantes = inscripciones.map((i) => i.estudiante);
    } else {
      // Anuncio general - todas las comisiones del docente
      const comisiones = await this.prisma.comision.findMany({
        where: { docenteId: anuncio.docenteId },
        select: { id: true },
      });
      const comisionIds = comisiones.map((c) => c.id);

      const inscripciones = await this.prisma.inscripcionComision.findMany({
        where: {
          comisionId: { in: comisionIds },
          estado: EstadoInscripcionComision.Confirmada,
        },
        include: {
          estudiante: {
            select: { id: true, tutorId: true, nombre: true, apellido: true },
          },
        },
      });
      estudiantes = inscripciones.map((i) => i.estudiante);
    }

    // Deduplicar tutores (un tutor puede tener varios hijos en la misma comisión)
    const tutoresNotificados = new Set<string>();

    const notificaciones = estudiantes.map(async (estudiante) => {
      try {
        // Notificar al tutor (una vez por tutor)
        if (!tutoresNotificados.has(estudiante.tutorId)) {
          tutoresNotificados.add(estudiante.tutorId);

          if (anuncio.tipo === TipoAnuncio.URGENTE) {
            await this.notificacionesService.notificarAnuncioUrgenteATutor(
              estudiante.tutorId,
              docenteNombre,
              anuncio.id,
              anuncio.titulo,
              anuncio.comisionId ?? undefined,
            );
          } else {
            await this.notificacionesService.notificarAnuncioImportanteATutor(
              estudiante.tutorId,
              docenteNombre,
              anuncio.id,
              anuncio.titulo,
              anuncio.comisionId ?? undefined,
            );
          }
        }

        // Notificar al estudiante
        if (anuncio.tipo === TipoAnuncio.URGENTE) {
          await this.notificacionesService.notificarAnuncioUrgenteAEstudiante(
            estudiante.id,
            docenteNombre,
            anuncio.id,
            anuncio.titulo,
            anuncio.comisionId ?? undefined,
          );
        } else {
          await this.notificacionesService.notificarAnuncioImportanteAEstudiante(
            estudiante.id,
            docenteNombre,
            anuncio.id,
            anuncio.titulo,
            anuncio.comisionId ?? undefined,
          );
        }
      } catch (error) {
        this.logger.warn(
          `⚠️ Falló notificación para estudiante ${estudiante.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    await Promise.allSettled(notificaciones);

    this.logger.log(
      `Notificaciones enviadas para anuncio ${anuncio.id}: ${tutoresNotificados.size} tutores, ${estudiantes.length} estudiantes`,
    );
  }
}
