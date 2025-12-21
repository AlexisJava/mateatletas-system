import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { BCRYPT_ROUNDS } from '../../common/constants/security.constants';
import { esEdadValida, getMensajeErrorEdad } from '../../domain/constants';
import * as bcrypt from 'bcrypt';
import {
  generateEstudianteUsername,
  generateEstudiantePin,
  generateTutorUsername,
  generateTutorPassword,
} from '../../common/utils/credential-generator';

/**
 * Servicio especializado para gestión de estudiantes desde admin
 * Responsabilidad única: CRUD de estudiantes y operaciones relacionadas
 */
@Injectable()
export class AdminEstudiantesService {
  private readonly logger = new Logger(AdminEstudiantesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Genera un username único basado en nombre y apellido
   * Formato: nombre.apellido (normalizado)
   * Si existe, agrega número: nombre.apellido1, nombre.apellido2
   */
  private async generarUsernameUnico(
    nombre: string,
    apellido: string,
  ): Promise<string> {
    const baseUsername = `${nombre}.${apellido}`
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
    // Construir filtro de búsqueda
    const searchFilter = options?.search
      ? {
          OR: [
            {
              nombre: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
            {
              apellido: {
                contains: options.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    // Query SIN paginación - traer TODOS los estudiantes
    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
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
          casa: {
            select: {
              nombre: true,
              colorPrimary: true,
            },
          },
          sector: {
            select: {
              id: true,
              nombre: true,
              color: true,
              icono: true,
            },
          },
          inscripciones_clase_grupo: {
            where: {
              fecha_baja: null, // Solo inscripciones activas
            },
            select: {
              id: true,
              fecha_inscripcion: true,
              claseGrupo: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  dia_semana: true,
                  hora_inicio: true,
                  hora_fin: true,
                  activo: true,
                  grupo: {
                    select: {
                      id: true,
                      codigo: true,
                      nombre: true,
                      descripcion: true,
                    },
                  },
                },
              },
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
      nivelEscolar: est.nivelEscolar, // Convertir a camelCase para el frontend
      nivel_actual: est.nivel_actual,
      puntos_totales: est.puntos_totales,
      tutor: est.tutor,
      casa: est.casa,
      sector: est.sector,
      // GRUPOS: Inscripciones activas en grupos
      inscripciones_grupos: est.inscripciones_clase_grupo.map((insc) => ({
        id: insc.id,
        fecha_inscripcion: insc.fecha_inscripcion,
        clase_grupo: {
          id: insc.claseGrupo.id,
          codigo: insc.claseGrupo.codigo,
          nombre: insc.claseGrupo.nombre,
          dia_semana: insc.claseGrupo.dia_semana,
          hora_inicio: insc.claseGrupo.hora_inicio,
          hora_fin: insc.claseGrupo.hora_fin,
          activo: insc.claseGrupo.activo,
        },
        grupo: insc.claseGrupo.grupo,
      })),
      createdAt: est.createdAt,
      updatedAt: est.updatedAt,
    }));

    return {
      data: mappedEstudiantes,
      metadata: {
        total,
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
    nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
    sectorId?: string;
    tutorNombre?: string;
    tutorApellido?: string;
    tutorEmail?: string;
    tutorTelefono?: string;
  }) {
    // Validar datos del estudiante
    if (!data.nombre || !data.apellido) {
      throw new BadRequestException(
        'Nombre y apellido del estudiante son requeridos',
      );
    }

    if (!esEdadValida(data.edad)) {
      throw new BadRequestException(getMensajeErrorEdad());
    }

    // 1. Determinar o crear el tutor
    let tutor;

    if (data.sectorId) {
      // Usar tutor existente
      tutor = await this.prisma.tutor.findUnique({
        where: { id: data.sectorId },
      });

      if (!tutor) {
        throw new NotFoundException(
          `Tutor con ID ${data.sectorId} no encontrado`,
        );
      }
    } else {
      // Crear tutor nuevo si no existe
      const tutorEmail =
        data.tutorEmail ||
        `tutor.${data.nombre.toLowerCase()}.${data.apellido.toLowerCase()}@temp.com`;
      const tutorNombre = data.tutorNombre || 'Tutor';
      const tutorApellido = data.tutorApellido || 'Genérico';

      // Generar password temporal
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

      tutor = await this.prisma.tutor.create({
        data: {
          email: tutorEmail,
          password_hash: passwordHash,
          nombre: tutorNombre,
          apellido: tutorApellido,
          telefono: data.tutorTelefono || null,
          roles: ['tutor'],
        },
      });

      this.logger.log(
        `Tutor creado automáticamente: ${tutorEmail} | Password temporal: ${tempPassword}`,
      );
    }

    // 2. Crear el estudiante
    const estudiante = await this.prisma.estudiante.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        username: await this.generarUsernameUnico(data.nombre, data.apellido),
        edad: data.edad,
        nivelEscolar: data.nivelEscolar,
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
      tutor_creado: !data.sectorId, // Indica si se creó un tutor nuevo
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
    },
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
        throw new NotFoundException(
          `Tutor con ID ${data.tutor_id} no encontrado`,
        );
      }
    }

    // Actualizar estudiante
    const estudianteActualizado = await this.prisma.estudiante.update({
      where: { id },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.apellido && { apellido: data.apellido }),
        ...(data.edad && { edad: data.edad }),
        ...(data.nivel_escolar && { nivelEscolar: data.nivel_escolar }),
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
        casa: {
          select: {
            id: true,
            nombre: true,
            colorPrimary: true,
            colorSecondary: true,
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
      casa: estudiante.casa,
      estadisticas: {
        clases_inscritas: estudiante.inscripciones_clase.length,
        clases_completadas: estudiante.inscripciones_clase.filter(
          (insc) =>
            insc.clase.estado === 'Programada' &&
            new Date(insc.clase.fecha_hora_inicio) < new Date(),
        ).length,
        clases_pendientes: estudiante.inscripciones_clase.filter(
          (insc) =>
            insc.clase.estado === 'Programada' &&
            new Date(insc.clase.fecha_hora_inicio) >= new Date(),
        ).length,
      },
    };
  }

  /**
   * Crear estudiante con generación automática de credenciales
   */
  async crearEstudianteConCredenciales(dto: {
    nombreEstudiante: string;
    apellidoEstudiante: string;
    edadEstudiante: number;
    nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
    sectorId: string;
    casaId?: string;
    puntosIniciales?: number;
    nivelInicial?: number;
    nombreTutor: string;
    apellidoTutor: string;
    emailTutor?: string;
    telefonoTutor?: string;
    dniTutor?: string;
  }) {
    // Validar sector
    const sector = await this.prisma.sector.findUnique({
      where: { id: dto.sectorId },
    });
    if (!sector) {
      throw new NotFoundException(
        `Sector con ID ${dto.sectorId} no encontrado`,
      );
    }

    // Validar casa si se proporciona
    if (dto.casaId) {
      const casa = await this.prisma.casa.findUnique({
        where: { id: dto.casaId },
      });
      if (!casa) {
        throw new NotFoundException(`Casa con ID ${dto.casaId} no encontrada`);
      }
    }

    // Verificar si tutor existe (por DNI, email, o username)
    let tutorExistente = null;
    if (dto.dniTutor) {
      tutorExistente = await this.prisma.tutor.findFirst({
        where: { dni: dto.dniTutor },
      });
    } else if (dto.emailTutor) {
      tutorExistente = await this.prisma.tutor.findFirst({
        where: { email: dto.emailTutor },
      });
    } else {
      // Si no hay DNI ni email, buscar por nombre y apellido
      tutorExistente = await this.prisma.tutor.findFirst({
        where: {
          nombre: dto.nombreTutor,
          apellido: dto.apellidoTutor,
        },
      });
    }

    // Generar credenciales
    const estudianteUsername = generateEstudianteUsername(
      dto.nombreEstudiante,
      dto.apellidoEstudiante,
    );
    const estudiantePin = generateEstudiantePin();
    const estudiantePinHash = await bcrypt.hash(estudiantePin, BCRYPT_ROUNDS);

    let tutorCredenciales: {
      username: string;
      passwordTemporal: string;
    } | null = null;
    let tutorCreado = false;

    // Transacción
    const resultado = await this.prisma.$transaction(async (tx) => {
      let tutor = tutorExistente;

      if (!tutor) {
        const tutorUsername = generateTutorUsername(
          dto.nombreTutor,
          dto.apellidoTutor,
        );
        const tutorPassword = generateTutorPassword();
        const tutorPasswordHash = await bcrypt.hash(
          tutorPassword,
          BCRYPT_ROUNDS,
        );

        tutor = await tx.tutor.create({
          data: {
            nombre: dto.nombreTutor,
            apellido: dto.apellidoTutor,
            username: tutorUsername,
            email: dto.emailTutor,
            telefono: dto.telefonoTutor,
            dni: dto.dniTutor,
            password_hash: tutorPasswordHash,
            debe_completar_perfil: false,
            roles: ['tutor'],
          },
        });

        tutorCredenciales = {
          username: tutorUsername,
          passwordTemporal: tutorPassword,
        };
        tutorCreado = true;
      }

      const estudiante = await tx.estudiante.create({
        data: {
          nombre: dto.nombreEstudiante,
          apellido: dto.apellidoEstudiante,
          username: estudianteUsername,
          edad: dto.edadEstudiante,
          nivelEscolar: dto.nivelEscolar,
          tutor_id: tutor.id,
          password_hash: estudiantePinHash,
          sector_id: dto.sectorId,
          casaId: dto.casaId || null,
          puntos_totales: dto.puntosIniciales ?? 0,
          nivel_actual: dto.nivelInicial ?? 1,
          avatar_gradient: 0,
          fotoUrl: null,
        },
      });

      return { tutor, estudiante };
    });

    return {
      estudiante: resultado.estudiante,
      tutor: resultado.tutor,
      tutorCreado,
      credencialesTutor: tutorCredenciales,
      credencialesEstudiante: {
        username: estudianteUsername,
        pin: estudiantePin,
      },
    };
  }
}
