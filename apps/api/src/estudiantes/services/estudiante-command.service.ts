import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateEstudianteDto } from '../dto/create-estudiante.dto';
import { UpdateEstudianteDto } from '../dto/update-estudiante.dto';
import {
  CrearEstudiantesConTutorDto,
  CredencialesGeneradas,
} from '../dto/crear-estudiantes-con-tutor.dto';
import {
  generarUsername,
  generarPasswordTemporal,
  generarPasswordEstudiante,
  hashPassword,
} from '../utils/credenciales.utils';
import { EstudianteBusinessValidator } from '../validators/estudiante-business.validator';

/**
 * Service para operaciones de ESCRITURA de estudiantes
 * Responsabilidad: Solo commands (Create, Update, Delete) - CQRS Pattern
 *
 * IMPORTANTE: Usa EventEmitter2 en lugar de LogrosService para evitar
 * dependencia circular. Los eventos son escuchados por GamificacionModule.
 */
@Injectable()
export class EstudianteCommandService {
  private readonly logger = new Logger(EstudianteCommandService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private validator: EstudianteBusinessValidator,
  ) {}

  /**
   * Genera un username único basado en nombre y apellido
   * Formato: nombre.apellido (normalizado)
   * Si existe, agrega número: nombre.apellido1, nombre.apellido2
   */
  private async generarUsernameUnico(
    nombre: string,
    apellido: string,
    sufijo?: string,
  ): Promise<string> {
    const baseUsername = `${nombre}.${apellido}${sufijo ? `.${sufijo}` : ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9.]/g, ''); // Solo letras, números y puntos

    let username = baseUsername;
    let contador = 1;

    // Verificar si existe y agregar número si es necesario
    while (await this.prisma.estudiante.findUnique({ where: { username } })) {
      username = `${baseUsername}${contador}`;
      contador++;
    }

    return username;
  }

  /**
   * Crea un nuevo estudiante asociado a un tutor
   * @param tutorId - ID del tutor que crea el estudiante
   * @param createDto - Datos del estudiante a crear
   * @returns El estudiante creado con credenciales temporales
   */
  async create(tutorId: string, createDto: CreateEstudianteDto) {
    // Validar que el tutor existe
    await this.validator.validateTutorExists(tutorId);

    // Validar casa si se proporciona
    if (createDto.casaId) {
      await this.validator.validateCasaExists(createDto.casaId);
    }

    // Validar edad
    this.validator.validateEdad(createDto.edad);

    // Generar credenciales
    const username = await this.generarUsernameUnico(
      createDto.nombre,
      createDto.apellido,
    );
    const passwordTemporal = generarPasswordEstudiante();
    const passwordHash = await hashPassword(passwordTemporal);

    // Crear estudiante con credenciales
    const estudiante = await this.prisma.estudiante.create({
      data: {
        ...createDto,
        username,
        password_hash: passwordHash,
        tutor_id: tutorId,
      },
      include: {
        casa: true,
      },
    });

    // Emitir evento en lugar de llamar a LogrosService directamente
    this.eventEmitter.emit('estudiante.created', {
      estudianteId: estudiante.id,
      tutorId,
    });

    this.logger.log(`Estudiante creado: ${estudiante.id}`);

    // Retornar estudiante con credenciales temporales (solo en response, NO en BD)
    return {
      estudiante,
      credenciales: {
        username,
        passwordTemporal,
      },
    };
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
    await this.validator.validateOwnership(id, tutorId);

    // Si se cambia casaId, validar que la nueva casa existe
    if (updateDto.casaId) {
      await this.validator.validateCasaExists(updateDto.casaId);
    }

    // Validar edad si se actualiza
    if (updateDto.edad !== undefined) {
      this.validator.validateEdad(updateDto.edad);
    }

    // Actualizar estudiante
    const estudiante = await this.prisma.estudiante.update({
      where: { id },
      data: updateDto,
      include: {
        casa: true,
      },
    });

    // Emitir evento de actualización
    this.eventEmitter.emit('estudiante.updated', {
      estudianteId: estudiante.id,
      tutorId,
      changes: updateDto,
    });

    this.logger.log(`Estudiante actualizado: ${estudiante.id}`);

    return estudiante;
  }

  /**
   * Elimina un estudiante
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   */
  async remove(id: string, tutorId: string) {
    // Verificar ownership
    await this.validator.validateOwnership(id, tutorId);

    // Eliminar estudiante
    await this.prisma.estudiante.delete({
      where: { id },
    });

    // Emitir evento de eliminación
    this.eventEmitter.emit('estudiante.deleted', {
      estudianteId: id,
      tutorId,
    });

    this.logger.log(`Estudiante eliminado: ${id}`);

    return { message: 'Estudiante eliminado correctamente' };
  }

  /**
   * Actualiza la URL de animación idle del estudiante
   * @param id - ID del estudiante
   * @param animacion_idle_url - URL de la animación
   * @returns El estudiante actualizado
   */
  async updateAnimacionIdle(id: string, animacion_idle_url: string) {
    // Verificar que el estudiante existe
    await this.validator.validateEstudianteExists(id);

    // Actualizar solo la animación idle
    const estudiante = await this.prisma.estudiante.update({
      where: { id },
      data: { animacion_idle_url },
      include: {
        casa: true,
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

    this.logger.log(`Animación idle actualizada para estudiante: ${id}`);

    return estudiante;
  }

  /**
   * Actualiza el gradient de avatar del estudiante
   * @param id - ID del estudiante
   * @param gradientId - ID del gradient
   * @returns El estudiante actualizado
   */
  async updateAvatarGradient(id: string, gradientId: number) {
    // Verificar que el estudiante exists
    await this.validator.validateEstudianteExists(id);

    const estudiante = await this.prisma.estudiante.update({
      where: { id },
      data: {
        avatar_gradient: gradientId,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        avatar_gradient: true,
      },
    });

    this.logger.log(`Avatar gradient actualizado para estudiante: ${id}`);

    return estudiante;
  }

  /**
   * Actualiza el avatar 3D del estudiante
   * @param id - ID del estudiante
   * @param avatarUrl - URL del avatar 3D
   * @returns El estudiante actualizado
   */
  async updateAvatar3D(id: string, avatarUrl: string) {
    // Verificar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Verificar si es la primera vez que crea avatar
    const esPrimerAvatar = !estudiante.avatarUrl;

    // Actualizar solo el avatar 3D
    const estudianteActualizado = await this.prisma.estudiante.update({
      where: { id },
      data: { avatarUrl },
      include: {
        casa: true,
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

    // Emitir evento si es la primera vez que crea avatar
    if (esPrimerAvatar) {
      this.eventEmitter.emit('estudiante.avatar.created', {
        estudianteId: id,
        logroId: 'AVATAR_CREADO',
      });
      this.logger.log(`Evento avatar.created emitido para estudiante ${id}`);
    }

    this.logger.log(`Avatar 3D actualizado para estudiante: ${id}`);

    return estudianteActualizado;
  }

  /**
   * TDD: Crear uno o múltiples estudiantes con tutor en un sector
   * @param dto - Datos de estudiantes y tutor
   * @returns Estudiantes creados con credenciales generadas
   */
  async crearEstudiantesConTutor(dto: CrearEstudiantesConTutorDto) {
    // Validar que el sector existe
    await this.validator.validateSectorExists(dto.sectorId);

    // Buscar si el tutor ya existe por email
    const tutorExistente = await this.prisma.tutor.findFirst({
      where: {
        email: dto.tutor.email,
      },
    });

    const credenciales: CredencialesGeneradas = {
      estudiantes: [],
    };

    let tutor = tutorExistente;

    // Si el tutor no existe, crear uno nuevo
    if (!tutorExistente) {
      const usernameTutor = await generarUsername(
        dto.tutor.nombre,
        dto.tutor.apellido,
        this.prisma,
      );
      const passwordTutor = generarPasswordTemporal();
      const passwordHash = await hashPassword(passwordTutor);

      tutor = await this.prisma.tutor.create({
        data: {
          nombre: dto.tutor.nombre,
          apellido: dto.tutor.apellido,
          dni: dto.tutor.dni,
          telefono: dto.tutor.telefono,
          username: usernameTutor,
          email: dto.tutor.email,
          password_hash: passwordHash,
        },
      });

      credenciales.tutor = {
        username: usernameTutor,
        password: passwordTutor,
      };
    }

    // Crear estudiantes en transacción
    const estudiantesCreados = await this.prisma.$transaction(
      async (prisma) => {
        const estudiantesPromises = dto.estudiantes.map(async (estDto) => {
          const usernameEstudiante = await generarUsername(
            estDto.nombre,
            estDto.apellido,
            this.prisma,
          );
          const passwordEstudiante = generarPasswordTemporal();
          const passwordHash = await hashPassword(passwordEstudiante);

          const estudiante = await prisma.estudiante.create({
            data: {
              nombre: estDto.nombre,
              apellido: estDto.apellido,
              edad: estDto.edad,
              nivelEscolar: estDto.nivelEscolar,
              email: estDto.email,
              username: usernameEstudiante,
              password_hash: passwordHash,
              tutor_id: tutor!.id,
              sector_id: dto.sectorId,
            },
            include: {
              sector: true,
              tutor: true,
            },
          });

          credenciales.estudiantes.push({
            nombre: `${estDto.nombre} ${estDto.apellido}`,
            username: usernameEstudiante,
            password: passwordEstudiante,
          });

          // Emitir evento para cada estudiante creado
          this.eventEmitter.emit('estudiante.created', {
            estudianteId: estudiante.id,
            tutorId: tutor!.id,
          });

          return estudiante;
        });

        return await Promise.all(estudiantesPromises);
      },
    );

    this.logger.log(
      `Creados ${estudiantesCreados.length} estudiantes con tutor ${tutor!.id}`,
    );

    return {
      estudiantes: estudiantesCreados,
      tutor,
      credenciales,
    };
  }

  /**
   * TDD: Asignar una clase a un estudiante
   * @param estudianteId - ID del estudiante
   * @param claseId - ID de la clase
   * @returns Inscripción creada
   */
  async asignarClaseAEstudiante(estudianteId: string, claseId: string) {
    // Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Validar que la clase existe
    await this.validator.validateClaseExists(claseId);

    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
    });

    // Validar que la clase pertenece al sector del estudiante
    if (clase!.sector_id !== estudiante.sector_id) {
      throw new BadRequestException(
        'La clase no pertenece al sector del estudiante',
      );
    }

    // Validar cupos disponibles
    if (clase!.cupos_ocupados >= clase!.cupos_maximo) {
      throw new ConflictException('La clase no tiene cupos disponibles');
    }

    // Validar que no esté ya inscrito
    const inscripcionExistente = await this.prisma.inscripcionClase.findFirst({
      where: {
        estudiante_id: estudianteId,
        clase_id: claseId,
      },
    });

    if (inscripcionExistente) {
      throw new ConflictException(
        'El estudiante ya está inscrito en esta clase',
      );
    }

    // Crear inscripción e incrementar cupos
    const inscripcion = await this.prisma.inscripcionClase.create({
      data: {
        estudiante_id: estudianteId,
        clase_id: claseId,
        tutor_id: estudiante.tutor_id,
      },
    });

    // Incrementar cupos ocupados
    await this.prisma.clase.update({
      where: { id: claseId },
      data: {
        cupos_ocupados: {
          increment: 1,
        },
      },
    });

    this.logger.log(`Estudiante ${estudianteId} asignado a clase ${claseId}`);

    return inscripcion;
  }

  /**
   * TDD: Asignar múltiples clases a un estudiante
   * @param estudianteId - ID del estudiante
   * @param clasesIds - Array de IDs de clases
   * @returns Array de inscripciones creadas
   */
  async asignarClasesAEstudiante(estudianteId: string, clasesIds: string[]) {
    // Validar estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Validar clases
    const clases = await this.prisma.clase.findMany({
      where: {
        id: {
          in: clasesIds,
        },
      },
    });

    if (clases.length !== clasesIds.length) {
      throw new BadRequestException('Una o más clases no existen');
    }

    // Validar que todas las clases pertenecen al sector
    for (const clase of clases) {
      if (clase.sector_id !== estudiante.sector_id) {
        throw new BadRequestException(
          `La clase ${clase.nombre} no pertenece al sector del estudiante`,
        );
      }

      if (clase.cupos_ocupados >= clase.cupos_maximo) {
        throw new ConflictException(
          `La clase ${clase.nombre} no tiene cupos disponibles`,
        );
      }
    }

    // Crear inscripciones en transacción
    const inscripciones = await this.prisma.$transaction(async (prisma) => {
      const inscripcionesPromises = clasesIds.map(async (claseId) => {
        // Verificar inscripción duplicada
        const existente = await prisma.inscripcionClase.findFirst({
          where: {
            estudiante_id: estudianteId,
            clase_id: claseId,
          },
        });

        if (existente) {
          throw new ConflictException(
            'El estudiante ya está inscrito en una de las clases',
          );
        }

        // Crear inscripción
        const inscripcion = await prisma.inscripcionClase.create({
          data: {
            estudiante_id: estudianteId,
            clase_id: claseId,
            tutor_id: estudiante.tutor_id,
          },
        });

        // Incrementar cupos
        await prisma.clase.update({
          where: { id: claseId },
          data: {
            cupos_ocupados: {
              increment: 1,
            },
          },
        });

        return inscripcion;
      });

      return await Promise.all(inscripcionesPromises);
    });

    this.logger.log(
      `Estudiante ${estudianteId} asignado a ${clasesIds.length} clases`,
    );

    return inscripciones;
  }
}
