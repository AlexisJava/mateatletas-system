import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';

/**
 * Service para gestionar operaciones CRUD de estudiantes
 * Implementa la lógica de negocio y validaciones
 */
@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo estudiante asociado a un tutor
   * @param tutorId - ID del tutor que crea el estudiante
   * @param createDto - Datos del estudiante a crear
   * @returns El estudiante creado con sus relaciones
   */
  async create(tutorId: string, createDto: CreateEstudianteDto) {
    // Validar que el tutor existe
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // Validar equipo si se proporciona
    if (createDto.equipo_id) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id: createDto.equipo_id },
      });

      if (!equipo) {
        throw new NotFoundException('Equipo no encontrado');
      }
    }

    // Calcular edad desde fecha_nacimiento
    const fechaNac = new Date(createDto.fecha_nacimiento);
    const edad = this.calcularEdad(fechaNac);

    if (edad < 5 || edad > 25) {
      throw new BadRequestException('La edad debe estar entre 5 y 25 años');
    }

    // Crear estudiante
    const estudiante = await this.prisma.estudiante.create({
      data: {
        ...createDto,
        tutor_id: tutorId,
        fecha_nacimiento: new Date(createDto.fecha_nacimiento),
      },
      include: {
        equipo: true,
      },
    });

    return estudiante;
  }

  /**
   * Obtiene todos los estudiantes de un tutor con filtros y paginación
   * @param tutorId - ID del tutor
   * @param query - Filtros y parámetros de paginación
   * @returns Lista de estudiantes con metadata
   */
  async findAllByTutor(tutorId: string, query?: QueryEstudiantesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      tutor_id: tutorId,
    };

    if (query?.equipo_id) {
      where.equipo_id = query.equipo_id;
    }

    if (query?.nivel_escolar) {
      where.nivel_escolar = query.nivel_escolar;
    }

    // Ejecutar consultas en paralelo
    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        where,
        include: {
          equipo: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.estudiante.count({ where }),
    ]);

    return {
      data: estudiantes,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene un estudiante específico verificando ownership
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @returns El estudiante con sus relaciones
   */
  async findOne(id: string, tutorId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        equipo: true,
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

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  /**
   * Actualiza un estudiante existente
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @param updateDto - Datos a actualizar
   * @returns El estudiante actualizado
   */
  async update(id: string, tutorId: string, updateDto: UpdateEstudianteDto) {
    // Verificar ownership
    await this.findOne(id, tutorId);

    // Si se cambia equipo_id, validar que el nuevo equipo existe
    if (updateDto.equipo_id) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id: updateDto.equipo_id },
      });

      if (!equipo) {
        throw new NotFoundException('Equipo no encontrado');
      }
    }

    // Validar fecha_nacimiento si se actualiza
    if (updateDto.fecha_nacimiento) {
      const fechaNac = new Date(updateDto.fecha_nacimiento);
      const edad = this.calcularEdad(fechaNac);

      if (edad < 5 || edad > 25) {
        throw new BadRequestException('La edad debe estar entre 5 y 25 años');
      }
    }

    // Validar que el equipo existe si se está asignando
    if (updateDto.equipo_id) {
      const equipoExists = await this.prisma.equipo.findUnique({
        where: { id: updateDto.equipo_id },
      });

      if (!equipoExists) {
        throw new NotFoundException(
          `Equipo con ID ${updateDto.equipo_id} no encontrado`,
        );
      }
    }

    // Actualizar estudiante
    const estudiante = await this.prisma.estudiante.update({
      where: { id },
      data: {
        ...updateDto,
        fecha_nacimiento: updateDto.fecha_nacimiento
          ? new Date(updateDto.fecha_nacimiento)
          : undefined,
      },
      include: {
        equipo: true,
      },
    });

    return estudiante;
  }

  /**
   * Elimina un estudiante
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   */
  async remove(id: string, tutorId: string) {
    // Verificar ownership
    await this.findOne(id, tutorId);

    // Eliminar estudiante
    await this.prisma.estudiante.delete({
      where: { id },
    });

    return { message: 'Estudiante eliminado exitosamente' };
  }

  /**
   * Cuenta el total de estudiantes de un tutor
   * @param tutorId - ID del tutor
   * @returns Número total de estudiantes
   */
  async countByTutor(tutorId: string): Promise<number> {
    return this.prisma.estudiante.count({
      where: { tutor_id: tutorId },
    });
  }

  /**
   * Obtiene estadísticas agregadas de los estudiantes de un tutor
   * @param tutorId - ID del tutor
   * @returns Estadísticas con totales y distribuciones
   */
  async getEstadisticas(tutorId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      include: {
        equipo: true,
      },
    });

    // Distribución por nivel escolar
    const porNivel = estudiantes.reduce(
      (acc: Record<string, number>, est) => {
        acc[est.nivel_escolar] = (acc[est.nivel_escolar] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Distribución por equipo
    const porEquipo = estudiantes.reduce(
      (acc: Record<string, number>, est) => {
        if (est.equipo) {
          acc[est.equipo.nombre] = (acc[est.equipo.nombre] || 0) + 1;
        } else {
          acc['Sin equipo'] = (acc['Sin equipo'] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Suma de puntos totales
    const puntosTotales = estudiantes.reduce(
      (sum: number, est) => sum + est.puntos_totales,
      0,
    );

    return {
      total: estudiantes.length,
      por_nivel: porNivel,
      por_equipo: porEquipo,
      puntos_totales: puntosTotales,
    };
  }

  /**
   * Calcula la edad en años desde una fecha de nacimiento
   * @param fechaNacimiento - Fecha de nacimiento
   * @returns Edad en años
   */
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }
}
