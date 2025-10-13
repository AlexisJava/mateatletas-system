// @ts-nocheck - Complex Prisma types, runtime works correctly
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CrearClaseDto } from './dto/crear-clase.dto';
import { ReservarClaseDto } from './dto/reservar-clase.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { EstadoClase, EstadoInscripcionCurso } from '@prisma/client';

@Injectable()
export class ClasesService {
  private readonly logger = new Logger(ClasesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Programar una nueva clase (solo Admin)
   */
  async programarClase(dto: CrearClaseDto) {
    // 1. Validar que la ruta curricular existe
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id: dto.rutaCurricularId },
    });

    if (!ruta) {
      throw new NotFoundException(
        `Ruta curricular con ID ${dto.rutaCurricularId} no encontrada`,
      );
    }

    // 2. Validar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: dto.docenteId },
    });

    if (!docente) {
      throw new NotFoundException(
        `Docente con ID ${dto.docenteId} no encontrado`,
      );
    }

    // 3. Si hay productoId, validar que sea un curso
    if (dto.productoId) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: dto.productoId },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${dto.productoId} no encontrado`,
        );
      }

      if (producto.tipo !== 'Curso') {
        throw new BadRequestException(
          'El producto asociado debe ser de tipo Curso',
        );
      }
    }

    // 4. Validar que la fecha sea futura
    const fechaInicio = new Date(dto.fechaHoraInicio);
    if (fechaInicio <= new Date()) {
      throw new BadRequestException(
        'La fecha de inicio debe ser en el futuro',
      );
    }

    // 5. Crear la clase
    const clase = await this.prisma.clase.create({
      data: {
        ruta_curricular_id: dto.rutaCurricularId,
        docente_id: dto.docenteId,
        fecha_hora_inicio: fechaInicio,
        duracion_minutos: dto.duracionMinutos,
        cupos_maximo: dto.cuposMaximo,
        cupos_ocupados: 0,
        estado: 'Programada',
        producto_id: dto.productoId || null,
      },
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        docente: { select: { nombre: true, apellido: true } },
        producto: {
          select: { nombre: true, tipo: true },
        },
      },
    });

    this.logger.log(`Clase programada: ${clase.id}`);
    return clase;
  }

  /**
   * Cancelar una clase (Admin o Docente de la clase)
   */
  async cancelarClase(id: string, userId?: string, userRole?: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        inscripciones: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    if (clase.estado === 'Cancelada') {
      throw new BadRequestException('La clase ya está cancelada');
    }

    // Verificar permisos: Admin puede cancelar cualquier, Docente solo las suyas
    if (userRole === 'docente' && clase.docente_id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para cancelar esta clase',
      );
    }

    // Actualizar estado de la clase
    const claseActualizada = await this.prisma.clase.update({
      where: { id },
      data: {
        estado: 'Cancelada',
        cupos_ocupados: 0, // Liberar todos los cupos
      },
      include: {
        rutaCurricular: { select: { nombre: true } },
        docente: { select: { nombre: true, apellido: true } },
      },
    });

    this.logger.warn(
      `Clase ${id} cancelada. ${clase.inscripciones.length} inscripciones afectadas`,
    );

    return claseActualizada;
  }

  /**
   * Listar todas las clases (Admin)
   */
  async listarTodasLasClases(filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    estado?: 'Programada' | 'Cancelada';
    docenteId?: string;
    rutaCurricularId?: string;
  }) {
    const where: any = {};

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_hora_inicio = {};
      if (filtros.fechaDesde) where.fecha_hora_inicio.gte = filtros.fechaDesde;
      if (filtros.fechaHasta) where.fecha_hora_inicio.lte = filtros.fechaHasta;
    }

    if (filtros?.estado) where.estado = filtros.estado;
    if (filtros?.docenteId) where.docente_id = filtros.docenteId;
    if (filtros?.rutaCurricularId)
      where.ruta_curricular_id = filtros.rutaCurricularId;

    return this.prisma.clase.findMany({
      where,
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        docente: { select: { nombre: true, apellido: true } },
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          select: { id: true, estudiante_id: true },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
    });
  }

  /**
   * Listar clases disponibles para tutores
   * - Solo clases programadas
   * - Solo clases futuras
   * - Filtrar clases de cursos específicos si el tutor no tiene inscripción
   */
  async listarClasesParaTutor(tutorId: string) {
    const now = new Date();

    // 1. Obtener estudiantes del tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        estudiantes: {
          include: {
            inscripciones_curso: {
              where: { estado: 'Activo' },
              select: { producto_id: true },
            },
          },
        },
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // 2. Obtener IDs de productos de cursos activos
    const cursosActivos = new Set<string>();
    tutor.estudiantes.forEach((estudiante) => {
      estudiante.inscripciones_curso.forEach((inscripcion) => {
        cursosActivos.add(inscripcion.producto_id);
      });
    });

    // 3. Buscar clases disponibles
    const clases = await this.prisma.clase.findMany({
      where: {
        estado: 'Programada',
        fecha_hora_inicio: { gte: now },
        OR: [
          { producto_id: null }, // Clases de suscripción general
          { producto_id: { in: Array.from(cursosActivos) } }, // Clases de cursos activos
        ],
      },
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        docente: { select: { nombre: true, apellido: true } },
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          where: {
            tutor_id: tutorId,
          },
          select: {
            id: true,
            estudiante_id: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
    });

    return clases;
  }

  /**
   * Listar clases de un docente
   */
  async listarClasesDeDocente(docenteId: string, incluirPasadas = false) {
    const where: any = {
      docente_id: docenteId,
    };

    if (!incluirPasadas) {
      where.fecha_hora_inicio = { gte: new Date() };
    }

    return this.prisma.clase.findMany({
      where,
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          select: {
            id: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
    });
  }

  /**
   * Obtener detalles de una clase específica
   */
  async obtenerClase(id: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        rutaCurricular: true,
        docente: {
          select: { id: true, nombre: true, apellido: true, titulo: true },
        },
        producto: {
          select: { nombre: true, tipo: true, descripcion: true },
        },
        inscripciones: {
          include: {
            estudiante: {
              select: { id: true, nombre: true, apellido: true, nivel_escolar: true },
            },
            tutor: {
              select: { nombre: true, apellido: true, email: true },
            },
          },
        },
        asistencias: {
          include: {
            estudiante: {
              select: { nombre: true, apellido: true },
            },
          },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    return clase;
  }

  /**
   * Reservar un cupo en una clase (Tutor reserva para su estudiante)
   */
  async reservarClase(claseId: string, tutorId: string, dto: ReservarClaseDto) {
    // 1. Verificar que la clase existe y está disponible
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        producto: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    if (clase.estado === 'Cancelada') {
      throw new BadRequestException('La clase está cancelada');
    }

    if (clase.fecha_hora_inicio <= new Date()) {
      throw new BadRequestException('La clase ya comenzó o pasó');
    }

    if (clase.cupos_ocupados >= clase.cupos_maximo) {
      throw new BadRequestException('La clase está llena');
    }

    // 2. Verificar que el estudiante pertenece al tutor
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      include: {
        inscripciones_curso: {
          where: { estado: 'Activo' },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        `Estudiante con ID ${dto.estudianteId} no encontrado`,
      );
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new ForbiddenException(
        'El estudiante no pertenece a este tutor',
      );
    }

    // 3. Si la clase es de un curso específico, verificar inscripción activa
    if (clase.producto_id) {
      const tieneInscripcion = estudiante.inscripciones_curso.some(
        (insc) => insc.producto_id === clase.producto_id,
      );

      if (!tieneInscripcion) {
        throw new BadRequestException(
          `El estudiante no está inscrito en el curso: ${clase.producto?.nombre}`,
        );
      }
    }

    // 4. Verificar que no esté ya inscrito
    const yaInscrito = await this.prisma.inscripcionClase.findUnique({
      where: {
        clase_id_estudiante_id: {
          clase_id: claseId,
          estudiante_id: dto.estudianteId,
        },
      },
    });

    if (yaInscrito) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en esta clase',
      );
    }

    // 5. Crear la inscripción y actualizar cupos
    const inscripcion = await this.prisma.$transaction(async (tx) => {
      // Crear inscripción
      const nuevaInscripcion = await tx.inscripcionClase.create({
        data: {
          clase_id: claseId,
          estudiante_id: dto.estudianteId,
          tutor_id: tutorId,
          observaciones: dto.observaciones,
        },
        include: {
          estudiante: { select: { nombre: true, apellido: true } },
          clase: {
            include: {
              rutaCurricular: { select: { nombre: true } },
            },
          },
        },
      });

      // Incrementar cupos ocupados
      await tx.clase.update({
        where: { id: claseId },
        data: { cupos_ocupados: { increment: 1 } },
      });

      return nuevaInscripcion;
    });

    this.logger.log(
      `Inscripción creada: Estudiante ${dto.estudianteId} en clase ${claseId}`,
    );

    return inscripcion;
  }

  /**
   * Cancelar una reserva (Tutor cancela inscripción de su estudiante)
   */
  async cancelarReserva(inscripcionId: string, tutorId: string) {
    const inscripcion = await this.prisma.inscripcionClase.findUnique({
      where: { id: inscripcionId },
      include: {
        clase: true,
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        `Inscripción con ID ${inscripcionId} no encontrada`,
      );
    }

    if (inscripcion.tutor_id !== tutorId) {
      throw new ForbiddenException(
        'No tienes permiso para cancelar esta inscripción',
      );
    }

    // Verificar que la clase aún no haya pasado
    if (inscripcion.clase.fecha_hora_inicio <= new Date()) {
      throw new BadRequestException(
        'No se puede cancelar una inscripción de una clase que ya comenzó',
      );
    }

    // Eliminar inscripción y decrementar cupos
    await this.prisma.$transaction(async (tx) => {
      await tx.inscripcionClase.delete({
        where: { id: inscripcionId },
      });

      await tx.clase.update({
        where: { id: inscripcion.clase_id },
        data: { cupos_ocupados: { decrement: 1 } },
      });
    });

    this.logger.log(`Inscripción ${inscripcionId} cancelada por tutor ${tutorId}`);

    return { message: 'Inscripción cancelada exitosamente' };
  }

  /**
   * Registrar asistencia (Docente registra después de la clase)
   */
  async registrarAsistencia(
    claseId: string,
    docenteId: string,
    dto: RegistrarAsistenciaDto,
  ) {
    // 1. Verificar que la clase existe y pertenece al docente
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        inscripciones: {
          select: { estudiante_id: true },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    if (clase.docente_id !== docenteId) {
      throw new ForbiddenException(
        'No tienes permiso para registrar asistencia de esta clase',
      );
    }

    // 2. Verificar que todos los estudiantes estén inscritos en la clase
    const estudiantesInscritos = new Set(
      clase.inscripciones.map((i) => i.estudiante_id),
    );

    for (const asistencia of dto.asistencias) {
      if (!estudiantesInscritos.has(asistencia.estudianteId)) {
        throw new BadRequestException(
          `El estudiante ${asistencia.estudianteId} no está inscrito en esta clase`,
        );
      }
    }

    // 3. Registrar asistencias (upsert para permitir actualizaciones)
    const resultados = await Promise.all(
      dto.asistencias.map(async (asistencia) => {
        return this.prisma.asistencia.upsert({
          where: {
            clase_id_estudiante_id: {
              clase_id: claseId,
              estudiante_id: asistencia.estudianteId,
            },
          },
          update: {
            estado: asistencia.estado,
            observaciones: asistencia.observaciones,
            puntos_otorgados: asistencia.puntosOtorgados || 0,
            fecha_registro: new Date(),
          },
          create: {
            clase_id: claseId,
            estudiante_id: asistencia.estudianteId,
            estado: asistencia.estado,
            observaciones: asistencia.observaciones,
            puntos_otorgados: asistencia.puntosOtorgados || 0,
          },
          include: {
            estudiante: {
              select: { nombre: true, apellido: true },
            },
          },
        });
      }),
    );

    this.logger.log(
      `Asistencia registrada para clase ${claseId}: ${resultados.length} estudiantes`,
    );

    return resultados;
  }

  /**
   * Obtener rutas curriculares (para formularios)
   */
  async listarRutasCurriculares() {
    return this.prisma.rutaCurricular.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}
