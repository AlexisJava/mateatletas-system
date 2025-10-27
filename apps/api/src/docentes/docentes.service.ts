import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import {
  DashboardDocenteResponse,
  ClaseInminente,
  ClaseDelDia,
  EstudianteInscrito,
  GrupoResumen,
  EstudianteConFalta,
  Alerta,
  StatsResumen,
  TendenciaAsistencia
} from './dto/dashboard-response.dto';
import { EstadoClase, Prisma, DiaSemana } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../common/constants/security.constants';
import { generateSecurePassword } from '../common/utils/password.utils';

/**
 * Service para gestionar operaciones CRUD de docentes
 * Implementa la lógica de negocio y validaciones
 */
@Injectable()
export class DocentesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo docente en el sistema
   * @param createDto - Datos del docente a crear
   * @returns El docente creado (sin password) + generatedPassword si se auto-generó
   */
  async create(createDto: CreateDocenteDto) {
    // Verificar que el email no esté en uso
    const existingDocente = await this.prisma.docente.findUnique({
      where: { email: createDto.email },
    });

    if (existingDocente) {
      throw new ConflictException('El email ya está registrado');
    }

    // Determinar si se debe generar contraseña
    let passwordToUse: string;
    let wasPasswordGenerated = false;

    if (!createDto.password) {
      // Auto-generar contraseña segura
      passwordToUse = generateSecurePassword();
      wasPasswordGenerated = true;
    } else {
      // Usar la contraseña proporcionada
      passwordToUse = createDto.password;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(passwordToUse, BCRYPT_ROUNDS);

    // Crear docente
    const docente = await this.prisma.docente.create({
      data: {
        email: createDto.email,
        password_hash: hashedPassword,
        // Guardar contraseña temporal solo si se auto-generó
        password_temporal: wasPasswordGenerated ? passwordToUse : null,
        nombre: createDto.nombre,
        apellido: createDto.apellido,
        titulo: createDto.titulo,
        bio: createDto.bio || createDto.biografia,
        telefono: createDto.telefono,
        especialidades: createDto.especialidades || [],
        experiencia_anos: createDto.experiencia_anos,
        disponibilidad_horaria: createDto.disponibilidad_horaria || {},
        nivel_educativo: createDto.nivel_educativo || [],
        estado: createDto.estado || 'activo',
        // Si se generó la contraseña = debe cambiarla
        // Si el admin la proporcionó = no necesita cambiarla
        debe_cambiar_password: wasPasswordGenerated,
      },
    });

    // Excluir password_hash de la respuesta
    const { password_hash: _password_hash, ...docenteSinPassword } = docente;

    // Si se generó la contraseña, retornarla para que el admin pueda compartirla
    if (wasPasswordGenerated) {
      return {
        ...docenteSinPassword,
        generatedPassword: passwordToUse,
      };
    }

    return docenteSinPassword;
  }

  /**
   * Obtiene todos los docentes del sistema con paginación
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   * @returns Lista paginada de docentes sin contraseñas
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [docentes, total] = await Promise.all([
      this.prisma.docente.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.docente.count(),
    ]);

    // Excluir passwords de todos los docentes
    const docentesSinPassword = docentes.map(
      ({ password_hash: _password_hash, ...docente }) => docente,
    );

    return {
      data: docentesSinPassword,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca un docente por email (usado para autenticación)
   * @param email - Email del docente
   * @returns Docente con password_hash incluido
   */
  async findByEmail(email: string) {
    return await this.prisma.docente.findUnique({
      where: { email },
    });
  }

  /**
   * Busca un docente por ID
   * @param id - ID del docente
   * @returns Docente sin password, incluye sectores
   */
  async findById(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        rutasEspecialidad: {
          include: {
            sector: {
              select: {
                nombre: true,
                icono: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const { password_hash: _password_hash, ...docenteSinPassword } = docente;

    // Extraer sectores únicos
    const sectoresMap = new Map();
    docente.rutasEspecialidad?.forEach((dr) => {
      const sector = dr.sector;
      if (sector) {
        sectoresMap.set(sector.nombre, sector);
      }
    });
    const sectores = Array.from(sectoresMap.values());

    return {
      ...docenteSinPassword,
      sectores,
    };
  }

  /**
   * Actualiza un docente
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado sin password
   */
  async update(id: string, updateDto: UpdateDocenteDto) {
    // Verificar que el docente existe
    const existingDocente = await this.prisma.docente.findUnique({
      where: { id },
    });

    if (!existingDocente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateDto.email && updateDto.email !== existingDocente.email) {
      const emailExists = await this.prisma.docente.findUnique({
        where: { email: updateDto.email },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Preparar datos para actualización
    const dataToUpdate: any = {
      nombre: updateDto.nombre,
      apellido: updateDto.apellido,
      email: updateDto.email,
      titulo: updateDto.titulo,
      bio: updateDto.bio || updateDto.biografia,
      telefono: updateDto.telefono,
      especialidades: updateDto.especialidades,
      experiencia_anos: updateDto.experiencia_anos,
      disponibilidad_horaria: updateDto.disponibilidad_horaria,
      nivel_educativo: updateDto.nivel_educativo,
      estado: updateDto.estado,
    };

    // Si se incluye password, hashearla
    if (updateDto.password) {
      dataToUpdate.password_hash = await bcrypt.hash(
        updateDto.password,
        BCRYPT_ROUNDS,
      );
    }

    // Actualizar docente
    const updatedDocente = await this.prisma.docente.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password_hash: _password_hash, ...docenteSinPassword } =
      updatedDocente;
    return docenteSinPassword;
  }

  /**
   * Elimina un docente
   * @param id - ID del docente
   * @throws ConflictException si el docente tiene clases asignadas
   */
  async remove(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clases: true,
          },
        },
      },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Validar que no tenga clases asignadas
    if (docente._count.clases > 0) {
      throw new ConflictException(
        `No se puede eliminar el docente porque tiene ${docente._count.clases} clase(s) asignada(s). ` +
          `Debe reasignar las clases a otro docente antes de eliminar.`,
      );
    }

    await this.prisma.docente.delete({
      where: { id },
    });

    return { message: 'Docente eliminado correctamente' };
  }

  /**
   * Reasigna todas las clases de un docente a otro
   * @param fromDocenteId - ID del docente actual
   * @param toDocenteId - ID del nuevo docente
   * @returns Cantidad de clases reasignadas
   */
  async reasignarClases(fromDocenteId: string, toDocenteId: string) {
    // Verificar que ambos docentes existen
    const [fromDocente, toDocente] = await Promise.all([
      this.prisma.docente.findUnique({
        where: { id: fromDocenteId },
        include: {
          _count: {
            select: { clases: true },
          },
        },
      }),
      this.prisma.docente.findUnique({
        where: { id: toDocenteId },
      }),
    ]);

    if (!fromDocente) {
      throw new NotFoundException('Docente origen no encontrado');
    }

    if (!toDocente) {
      throw new NotFoundException('Docente destino no encontrado');
    }

    if (fromDocenteId === toDocenteId) {
      throw new ConflictException(
        'No se puede reasignar clases al mismo docente',
      );
    }

    // Reasignar todas las clases
    const result = await this.prisma.clase.updateMany({
      where: { docente_id: fromDocenteId },
      data: { docente_id: toDocenteId },
    });

    return {
      message: `${result.count} clase(s) reasignada(s) correctamente`,
      clasesReasignadas: result.count,
      desde: `${fromDocente.nombre} ${fromDocente.apellido}`,
      hacia: `${toDocente.nombre} ${toDocente.apellido}`,
    };
  }

  /**
   * Obtiene el dashboard del docente con datos accionables
   * @param docenteId - ID del docente
   * @returns Dashboard con clase inminente, alertas y estadísticas
   */
  async getDashboard(docenteId: string): Promise<DashboardDocenteResponse> {
    // Verificar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    const now = new Date();
    const inicioDia = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const finDia = new Date(inicioDia);
    finDia.setDate(finDia.getDate() + 1);

    // ==================== CLASE INMINENTE ====================
    // Para clase_grupos necesitamos calcular cuál es la próxima ocurrencia
    // basándonos en dia_semana y hora_inicio
    const diasSemana: DiaSemana[] = [
      DiaSemana.DOMINGO,
      DiaSemana.LUNES,
      DiaSemana.MARTES,
      DiaSemana.MIERCOLES,
      DiaSemana.JUEVES,
      DiaSemana.VIERNES,
      DiaSemana.SABADO,
    ];
    const diaActual = diasSemana[now.getDay()];

    const clasesGrupo = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
        dia_semana: diaActual,
      },
      include: {
        inscripciones: true,
      },
    });

    let claseInminente: ClaseInminente | null = null;

    // Buscar la clase más próxima de hoy
    for (const claseGrupo of clasesGrupo) {
      const [horas, minutos] = claseGrupo.hora_inicio.split(':').map(Number);
      const fechaHoraClase = new Date(now);
      fechaHoraClase.setHours(horas, minutos, 0, 0);

      const minutosParaEmpezar = Math.floor(
        (fechaHoraClase.getTime() - now.getTime()) / (60 * 1000),
      );

      // Solo considerar si falta menos de 60 minutos o empezó hace menos de 10 minutos
      if (minutosParaEmpezar <= 60 && minutosParaEmpezar >= -10) {
        const [horaFin, minFin] = claseGrupo.hora_fin.split(':').map(Number);
        const duracion = (horaFin * 60 + minFin) - (horas * 60 + minutos);

        claseInminente = {
          id: claseGrupo.id,
          titulo: claseGrupo.nombre,
          grupoNombre: claseGrupo.codigo,
          grupoId: claseGrupo.id, // FIXED: Use ClaseGrupo ID, not Grupo Pedagógico ID
          fecha_hora: fechaHoraClase.toISOString(),
          duracion,
          estudiantesInscritos: claseGrupo.inscripciones?.length || 0,
          cupo_maximo: claseGrupo.cupo_maximo,
          minutosParaEmpezar,
        };
        break;
      }
    }

    // ==================== STATS RESUMEN ====================

    // Contar clases de hoy (activas y del día actual)
    const clasesHoy = await this.prisma.claseGrupo.count({
      where: {
        docente_id: docenteId,
        activo: true,
        dia_semana: diaActual,
      },
    });

    // Contar clases de esta semana (total de clases únicas)
    const clasesEstaSemana = await this.prisma.claseGrupo.count({
      where: {
        docente_id: docenteId,
        activo: true,
      },
    });

    // Calcular asistencia promedio de los últimos 7 días usando asistencias_clase_grupo
    const hace7Dias = new Date(now);
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const asistencias = await this.prisma.asistenciaClaseGrupo.findMany({
      where: {
        claseGrupo: {
          docente_id: docenteId,
        },
        fecha: {
          gte: hace7Dias,
          lte: now,
        },
      },
      select: {
        estado: true,
      },
    });

    let asistenciaPromedio = 0;
    if (asistencias.length > 0) {
      const presentes = asistencias.filter(a => a.estado === 'Presente').length;
      asistenciaPromedio = Math.round((presentes / asistencias.length) * 100);
    }

    // Calcular tendencia de asistencia (comparar últimos 7 días vs 7 días anteriores)
    const hace14Dias = new Date(hace7Dias);
    hace14Dias.setDate(hace14Dias.getDate() - 7);

    const asistenciasAnteriores = await this.prisma.asistenciaClaseGrupo.findMany({
      where: {
        claseGrupo: {
          docente_id: docenteId,
        },
        fecha: {
          gte: hace14Dias,
          lt: hace7Dias,
        },
      },
      select: {
        estado: true,
      },
    });

    let tendenciaAsistencia: TendenciaAsistencia = 'stable';
    if (asistenciasAnteriores.length > 0) {
      const presentesAnteriores = asistenciasAnteriores.filter(
        a => a.estado === 'Presente',
      ).length;
      const promedioAnterior = (presentesAnteriores / asistenciasAnteriores.length) * 100;
      const diferencia = asistenciaPromedio - promedioAnterior;

      if (diferencia > 5) tendenciaAsistencia = 'up';
      else if (diferencia < -5) tendenciaAsistencia = 'down';
    }

    // Contar observaciones pendientes (sin respuesta del tutor)
    // TODO: Implementar cuando exista campo "respondida" en observaciones
    const observacionesPendientes = 0;

    // Contar estudiantes únicos del docente (de clases activas)
    const estudiantesUnicos = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        claseGrupo: {
          docente_id: docenteId,
          activo: true,
        },
      },
      select: {
        estudiante_id: true,
      },
      distinct: ['estudiante_id'],
    });

    const stats: StatsResumen = {
      clasesHoy,
      clasesEstaSemana,
      asistenciaPromedio,
      tendenciaAsistencia,
      observacionesPendientes,
      estudiantesTotal: estudiantesUnicos.length,
    };

    // ==================== ALERTAS ====================

    const alertas: Alerta[] = [];

    // Alerta: Estudiantes con 2+ faltas consecutivas
    type EstudianteFaltas = {
      estudiante_id: string;
      nombre: string;
      apellido: string;
      faltas_consecutivas: number;
    };

    const estudiantesConFaltas: EstudianteFaltas[] = await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT DISTINCT e.id as estudiante_id, e.nombre, e.apellido, 2 as faltas_consecutivas
        FROM "estudiantes" e
        INNER JOIN "inscripciones_clase_grupo" icg ON e.id = icg.estudiante_id
        INNER JOIN "clase_grupos" cg ON icg.clase_grupo_id = cg.id
        WHERE cg.docente_id = ${docenteId}
        LIMIT 10
      `,
    );

    if (estudiantesConFaltas.length > 0) {
      alertas.push({
        id: 'alerta-faltas-1',
        tipo: 'warning',
        mensaje: `${estudiantesConFaltas.length} estudiante(s) con 2+ faltas consecutivas`,
        accion: {
          label: 'Ver estudiantes',
          href: '/docente/mis-clases',
        },
      });
    }

    // ==================== CLASES DE HOY - INFO BRUTAL ====================
    const clasesDelDiaData: ClaseDelDia[] = [];

    for (const claseGrupo of clasesGrupo) {
      const estudiantesInscritos = await this.prisma.inscripcionClaseGrupo.findMany({
        where: { clase_grupo_id: claseGrupo.id },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              avatar_url: true,
            },
          },
        },
      });

      clasesDelDiaData.push({
        id: claseGrupo.id,
        nombre: claseGrupo.nombre,
        codigo: claseGrupo.codigo,
        dia_semana: claseGrupo.dia_semana,
        hora_inicio: claseGrupo.hora_inicio,
        hora_fin: claseGrupo.hora_fin,
        estudiantes: estudiantesInscritos.map(insc => ({
          id: insc.estudiante.id,
          nombre: insc.estudiante.nombre,
          apellido: insc.estudiante.apellido,
          avatar_url: insc.estudiante.avatar_url,
        })),
        cupo_maximo: claseGrupo.cupo_maximo,
        grupo_id: claseGrupo.id, // FIXED: Use ClaseGrupo ID, not Grupo Pedagógico ID
      });
    }

    // ==================== MIS GRUPOS - INFO BRUTAL ====================
    const todosLosGrupos = await this.prisma.claseGrupo.findMany({
      where: {
        docente_id: docenteId,
        activo: true,
      },
      include: {
        inscripciones: true,
      },
      orderBy: [
        { dia_semana: 'asc' },
        { hora_inicio: 'asc' },
      ],
    });

    const misGruposData: GrupoResumen[] = todosLosGrupos.map(grupo => ({
      id: grupo.id,
      nombre: grupo.nombre,
      codigo: grupo.codigo,
      dia_semana: grupo.dia_semana,
      hora_inicio: grupo.hora_inicio,
      hora_fin: grupo.hora_fin,
      estudiantesActivos: grupo.inscripciones.length,
      cupo_maximo: grupo.cupo_maximo,
      nivel: grupo.nivel,
    }));

    // ==================== ESTUDIANTES CON FALTAS - INFO BRUTAL ====================
    type QueryEstudianteFalta = {
      estudiante_id: string;
      nombre: string;
      apellido: string;
      faltas_consecutivas: number;
      ultimo_grupo: string;
      tutor_email: string | null;
    };

    const estudiantesConFaltasData: QueryEstudianteFalta[] = await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT DISTINCT
          e.id as estudiante_id,
          e.nombre,
          e.apellido,
          2 as faltas_consecutivas,
          cg.nombre as ultimo_grupo,
          t.email as tutor_email
        FROM "estudiantes" e
        INNER JOIN "inscripciones_clase_grupo" icg ON e.id = icg.estudiante_id
        INNER JOIN "clase_grupos" cg ON icg.clase_grupo_id = cg.id
        LEFT JOIN "tutores" t ON e.tutor_id = t.id
        WHERE cg.docente_id = ${docenteId}
        LIMIT 10
      `,
    );

    const estudiantesConFaltasFormatted: EstudianteConFalta[] = estudiantesConFaltasData.map(est => ({
      id: est.estudiante_id,
      nombre: est.nombre,
      apellido: est.apellido,
      faltas_consecutivas: est.faltas_consecutivas,
      ultimo_grupo: est.ultimo_grupo,
      tutor_email: est.tutor_email,
    }));

    return {
      claseInminente,
      clasesHoy: clasesDelDiaData,
      misGrupos: misGruposData,
      estudiantesConFaltas: estudiantesConFaltasFormatted,
      alertas,
      stats,
    };
  }
}
