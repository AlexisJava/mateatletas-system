import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { BCRYPT_ROUNDS } from '../../common/constants/security.constants';
import * as bcrypt from 'bcrypt';

/**
 * Servicio especializado para gestión de estudiantes desde admin
 * Responsabilidad única: CRUD de estudiantes y operaciones relacionadas
 */
@Injectable()
export class AdminEstudiantesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar estudiantes del sistema con paginación y filtros
   *
   * PAGINACIÓN:
   * - page: Número de página (default: 1)
   * - limit: Elementos por página (default: 50, max: 200)
   * - search: Búsqueda por nombre o apellido (opcional)
   * - Retorna metadata con total, totalPages, currentPage
   *
   * PERFORMANCE:
   * - ANTES: Retornaba TODOS los estudiantes (potencialmente miles)
   * - AHORA: Retorna solo 50-200 estudiantes por request
   * - Búsqueda optimizada con índices en nombre/apellido
   */
  async listarEstudiantes(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // Normalizar parámetros
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(Math.max(1, options?.limit || 50), 200); // Max 200 por página
    const skip = (page - 1) * limit;

    // Construir filtro de búsqueda
    const searchFilter = options?.search
      ? {
          OR: [
            { nombre: { contains: options.search, mode: 'insensitive' as const } },
            { apellido: { contains: options.search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Query con paginación
    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        skip,
        take: limit,
        where: searchFilter,
        include: {
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          equipo: {
            select: {
              nombre: true,
              color_primario: true,
            },
          },
        },
        orderBy: {
          apellido: 'asc',
        },
      }),
      this.prisma.estudiante.count({ where: searchFilter }),
    ]);

    const mappedEstudiantes = estudiantes.map((est) => ({
      id: est.id,
      nombre: est.nombre,
      apellido: est.apellido,
      edad: est.edad,
      nivel_escolar: est.nivel_escolar,
      nivel_actual: est.nivel_actual,
      puntos_totales: est.puntos_totales,
      tutor: est.tutor,
      equipo: est.equipo,
      createdAt: est.createdAt,
      updatedAt: est.updatedAt,
    }));

    return {
      data: mappedEstudiantes,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Crear estudiante de forma rápida con o sin tutor existente
   * Si no existe el tutor, lo crea automáticamente
   */
  async crearEstudianteRapido(data: {
    nombre: string;
    apellido: string;
    edad: number;
    nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
    tutor_id?: string;
    tutor_email?: string;
    tutor_nombre?: string;
    tutor_apellido?: string;
    tutor_telefono?: string;
  }) {
    // Validar datos del estudiante
    if (!data.nombre || !data.apellido) {
      throw new BadRequestException('Nombre y apellido del estudiante son requeridos');
    }

    if (data.edad < 3 || data.edad > 99) {
      throw new BadRequestException('La edad debe estar entre 3 y 99 años');
    }

    // 1. Determinar o crear el tutor
    let tutor;

    if (data.tutor_id) {
      // Usar tutor existente
      tutor = await this.prisma.tutor.findUnique({
        where: { id: data.tutor_id },
      });

      if (!tutor) {
        throw new NotFoundException(`Tutor con ID ${data.tutor_id} no encontrado`);
      }
    } else {
      // Crear tutor nuevo si no existe
      const tutorEmail =
        data.tutor_email ||
        `tutor.${data.nombre.toLowerCase()}.${data.apellido.toLowerCase()}@temp.com`;
      const tutorNombre = data.tutor_nombre || 'Tutor';
      const tutorApellido = data.tutor_apellido || 'Genérico';

      // Generar password temporal
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

      tutor = await this.prisma.tutor.create({
        data: {
          email: tutorEmail,
          password_hash: passwordHash,
          nombre: tutorNombre,
          apellido: tutorApellido,
          telefono: data.tutor_telefono || null,
          roles: ['tutor'],
        },
      });

      console.info(
        `Tutor creado automáticamente: ${tutorEmail} | Password temporal: ${tempPassword}`
      );
    }

    // 2. Crear el estudiante
    const estudiante = await this.prisma.estudiante.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        edad: data.edad,
        nivel_escolar: data.nivel_escolar,
        tutor_id: tutor.id,
        nivel_actual: 1,
        puntos_totales: 0,
      },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Estudiante creado exitosamente',
      estudiante,
      tutor_creado: !data.tutor_id, // Indica si se creó un tutor nuevo
    };
  }

  /**
   * Actualizar información de un estudiante
   */
  async actualizarEstudiante(
    id: string,
    data: {
      nombre?: string;
      apellido?: string;
      edad?: number;
      nivel_escolar?: 'Primaria' | 'Secundaria' | 'Universidad';
      tutor_id?: string;
    }
  ) {
    // Verificar que el estudiante existe
    const estudianteExistente = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudianteExistente) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    // Si se cambia el tutor, verificar que existe
    if (data.tutor_id) {
      const tutorExiste = await this.prisma.tutor.findUnique({
        where: { id: data.tutor_id },
      });

      if (!tutorExiste) {
        throw new NotFoundException(`Tutor con ID ${data.tutor_id} no encontrado`);
      }
    }

    // Actualizar estudiante
    const estudianteActualizado = await this.prisma.estudiante.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.edad && { edad: data.edad }),
        ...(data.nivel_escolar && { nivel_escolar: data.nivel_escolar }),
        ...(data.tutor_id && { tutor_id: data.tutor_id }),
      },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Estudiante actualizado exitosamente',
      estudiante: estudianteActualizado,
    };
  }

  /**
   * Eliminar un estudiante
   */
  async eliminarEstudiante(id: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    await this.prisma.estudiante.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Estudiante ${estudiante.nombre} ${estudiante.apellido} eliminado`,
    };
  }

  /**
   * Obtener estadísticas de un estudiante
   *
   * OPTIMIZACIÓN SELECT:
   * - ANTES: Cargaba tutor completo (incluía password_hash!)
   * - ANTES: Cargaba clase completa en cada inscripción
   * - AHORA: Select solo campos necesarios
   * - SECURITY: Excluye password_hash del tutor
   * - Reducción: ~70% del payload size
   */
  async obtenerEstadisticasEstudiante(id: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        edad: true,
        nivel_actual: true,
        puntos_totales: true,
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            // SECURITY: Excluye password_hash
          },
        },
        equipo: {
          select: {
            id: true,
            nombre: true,
            color_primario: true,
            color_secundario: true,
          },
        },
        inscripciones_clase: {
          select: {
            id: true,
            clase: {
              select: {
                id: true,
                nombre: true,
                estado: true,
                fecha_hora_inicio: true,
              },
            },
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivel_actual: estudiante.nivel_actual,
        puntos_totales: estudiante.puntos_totales,
      },
      tutor: estudiante.tutor,
      equipo: estudiante.equipo,
      estadisticas: {
        clases_inscritas: estudiante.inscripciones_clase.length,
        clases_completadas: estudiante.inscripciones_clase.filter(
          (insc: any) => insc.clase.estado === 'Programada' && new Date(insc.clase.fecha_hora_inicio) < new Date()
        ).length,
        clases_pendientes: estudiante.inscripciones_clase.filter(
          (insc: any) => insc.clase.estado === 'Programada' && new Date(insc.clase.fecha_hora_inicio) >= new Date()
        ).length,
      },
    };
  }
}
