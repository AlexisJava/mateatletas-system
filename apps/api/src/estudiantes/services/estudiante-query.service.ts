import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import {
  parseHorario,
  calcularDuracionMinutos,
} from '../../common/utils/time.utils';
import { QueryEstudiantesDto } from '../dto/query-estudiantes.dto';

/**
 * Service para operaciones de LECTURA de estudiantes
 * Responsabilidad: Solo queries (GET operations) - CQRS Pattern
 */
@Injectable()
export class EstudianteQueryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca estudiantes de un tutor con filtros y paginación
   * @param tutorId - ID del tutor
   * @param query - Filtros y parámetros de paginación
   * @returns Lista de estudiantes con metadata
   */
  async findAllByTutor(tutorId: string, query?: QueryEstudiantesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Prisma.EstudianteWhereInput = {
      tutor_id: tutorId,
    };

    if (query?.casaId) {
      where.casaId = query.casaId;
    }

    if (query?.nivelEscolar) {
      where.nivelEscolar = query.nivelEscolar;
    }

    // Ejecutar consultas en paralelo
    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        where,
        include: {
          casa: true,
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
   * Busca un estudiante por ID sin validación de ownership
   * Útil para que el estudiante acceda a sus propios datos
   * @param id - ID del estudiante
   * @returns Estudiante encontrado
   * @throws NotFoundException si no existe
   */
  async findOneById(id: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
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

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  /**
   * Obtiene un estudiante específico verificando ownership
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @returns El estudiante con sus relaciones
   * @throws NotFoundException si no existe o no pertenece al tutor
   */
  async findOne(id: string, tutorId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
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

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  /**
   * Obtiene TODOS los estudiantes (solo para admin)
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista completa de estudiantes con tutor y casa
   */
  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        include: {
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          casa: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.estudiante.count(),
    ]);

    return {
      data: estudiantes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
   * Obtiene el detalle COMPLETO de un estudiante
   * Incluye: gamificación, asistencias, inscripciones, estadísticas
   * Para el portal de tutores - pestaña "Mis Hijos"
   * @param estudianteId - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @returns Detalle completo del estudiante con todas sus métricas
   */
  async getDetalleCompleto(estudianteId: string, tutorId: string) {
    // Verificar que el estudiante pertenece al tutor
    const estudiante = await this.prisma.estudiante.findFirst({
      where: {
        id: estudianteId,
        tutor_id: tutorId,
      },
      include: {
        casa: true,
        recursos: {
          select: { xp_total: true },
        },
        logros_desbloqueados: {
          include: {
            logro: true,
          },
          orderBy: {
            fecha_desbloqueo: 'desc',
          },
        },
        inscripciones_clase: {
          include: {
            clase: {
              include: {
                docente: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            clase: {
              fecha_hora_inicio: 'desc',
            },
          },
          take: 10, // Últimas 10 inscripciones
        },
        asistencias: {
          include: {
            clase: true,
          },
          orderBy: {
            clase: {
              fecha_hora_inicio: 'desc',
            },
          },
          take: 20, // Últimas 20 asistencias
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        'Estudiante no encontrado o no pertenece a este tutor',
      );
    }

    // Calcular estadísticas
    const totalClases = estudiante.asistencias.length;
    const clasesPresente = estudiante.asistencias.filter(
      (a: { estado: string }) => a.estado === 'Presente',
    ).length;
    const tasaAsistencia =
      totalClases > 0 ? Math.round((clasesPresente / totalClases) * 100) : 0;

    return {
      ...estudiante,
      estadisticas: {
        total_clases: totalClases,
        clases_presente: clasesPresente,
        tasa_asistencia: tasaAsistencia,
        nivel: estudiante.nivel_actual,
        puntos: estudiante.recursos?.xp_total ?? 0,
        logros: estudiante.logros_desbloqueados?.length || 0,
      },
    };
  }

  /**
   * Obtiene clases disponibles para un estudiante en su sector
   * @param estudianteId - ID del estudiante
   * @returns Array de clases del sector con cupos disponibles
   */
  async obtenerClasesDisponiblesParaEstudiante(estudianteId: string) {
    // Validar estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Obtener clases del sector con cupos disponibles
    const clases = await this.prisma.clase.findMany({
      where: {
        sector_id: estudiante.sector_id,
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        sector: true,
      },
    });

    // Filtrar las que tienen cupos disponibles
    return clases.filter((clase) => clase.cupos_ocupados < clase.cupos_maximo);
  }

  /**
   * Obtener la próxima clase del estudiante (más cercana en el tiempo)
   * @param estudianteId - ID del estudiante
   * @returns La próxima clase programada o null si no hay ninguna
   */
  async obtenerProximaClase(estudianteId: string) {
    const ahora = new Date();

    // Buscar en clases grupales (ClaseGrupo)
    const proximaClaseGrupo = await this.prisma.claseGrupo.findFirst({
      where: {
        inscripciones: {
          some: {
            estudiante_id: estudianteId,
          },
        },
        activo: true,
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        grupo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            link_meet: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Podemos usar createdAt como referencia temporal
      },
    });

    // Si encontramos clase grupal, calcular la próxima fecha según el día de la semana
    if (proximaClaseGrupo) {
      // Mapeo de enum DiaSemana de Prisma a índices de JavaScript (0=Domingo, 6=Sábado)
      const diasSemanaMap: Record<string, number> = {
        DOMINGO: 0,
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6,
      };
      const diaActual = ahora.getDay();
      const diaClase = diasSemanaMap[proximaClaseGrupo.dia_semana] ?? -1;

      // Parsear hora usando utilidad robusta
      const { horas, minutos } = parseHorario(proximaClaseGrupo.hora_inicio);

      let diasHasta = diaClase - diaActual;

      // Si es hoy mismo, verificar si la hora ya pasó
      if (diasHasta === 0) {
        const horaClase = horas * 60 + minutos;
        const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
        if (horaActual >= horaClase) {
          // La clase de hoy ya pasó, próxima semana
          diasHasta = 7;
        }
      } else if (diasHasta < 0) {
        // El día ya pasó esta semana, próxima semana
        diasHasta += 7;
      }

      const fechaProxima = new Date(ahora);
      fechaProxima.setDate(ahora.getDate() + diasHasta);
      fechaProxima.setHours(horas, minutos, 0, 0);

      // Calcular duración usando utilidad robusta
      const duracionMinutos = calcularDuracionMinutos(
        proximaClaseGrupo.hora_inicio,
        proximaClaseGrupo.hora_fin,
      );

      return {
        tipo: 'grupo' as const,
        id: proximaClaseGrupo.id,
        nombre: proximaClaseGrupo.nombre,
        codigo: proximaClaseGrupo.codigo,
        fecha_hora_inicio: fechaProxima,
        duracion_minutos: duracionMinutos,
        docente: proximaClaseGrupo.docente,
        dia_semana: proximaClaseGrupo.dia_semana,
        hora_inicio: proximaClaseGrupo.hora_inicio,
        link_meet: proximaClaseGrupo.grupo?.link_meet,
      };
    }

    // Si no hay clase grupal, buscar en clases individuales (Clase)
    const proximaClaseIndividual = await this.prisma.clase.findFirst({
      where: {
        inscripciones: {
          some: {
            estudiante_id: estudianteId,
          },
        },
        fecha_hora_inicio: {
          gte: ahora,
        },
        estado: 'Programada',
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fecha_hora_inicio: 'asc',
      },
    });

    if (proximaClaseIndividual) {
      return {
        tipo: 'individual' as const,
        id: proximaClaseIndividual.id,
        nombre: proximaClaseIndividual.nombre,
        fecha_hora_inicio: proximaClaseIndividual.fecha_hora_inicio,
        duracion_minutos: proximaClaseIndividual.duracion_minutos,
        docente: proximaClaseIndividual.docente,
        estado: proximaClaseIndividual.estado,
      };
    }

    return null;
  }

  /**
   * Obtener compañeros de ClaseGrupo del estudiante
   * Retorna todos los estudiantes inscritos en el mismo ClaseGrupo que el estudiante actual
   * @param estudianteId - ID del estudiante
   * @returns Lista de compañeros con sus puntos totales
   */
  async obtenerCompanerosDeClase(estudianteId: string) {
    // Buscar el ClaseGrupo al que pertenece el estudiante
    const inscripcion = await this.prisma.inscripcionClaseGrupo.findFirst({
      where: {
        estudiante_id: estudianteId,
      },
      include: {
        claseGrupo: true,
      },
    });

    if (!inscripcion) {
      return [];
    }

    // Obtener todos los estudiantes inscritos en el mismo ClaseGrupo
    const companeros = await this.prisma.estudiante.findMany({
      where: {
        inscripciones_clase_grupo: {
          some: {
            clase_grupo_id: inscripcion.clase_grupo_id,
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        recursos: {
          select: { xp_total: true },
        },
      },
    });

    // Ordenar por XP en memoria y mapear
    return companeros
      .map((c) => ({
        id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        puntos: c.recursos?.xp_total ?? 0,
      }))
      .sort((a, b) => b.puntos - a.puntos);
  }

  /**
   * Obtener TODAS las clases del estudiante para el portal
   * Incluye:
   * - ClaseGrupo (clases regulares semanales)
   * - Comisiones (talleres, colonias, etc.)
   * @param estudianteId - ID del estudiante autenticado
   * @returns Array de clases con información completa para el portal
   */
  async obtenerMisClases(estudianteId: string) {
    const ahora = new Date();

    // Mapeo de enum DiaSemana de Prisma a índices de JavaScript (0=Domingo, 6=Sábado)
    const diasSemanaMap: Record<string, number> = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    // Nombres de días para mostrar en UI
    const nombresDia: Record<string, string> = {
      LUNES: 'Lunes',
      MARTES: 'Martes',
      MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves',
      VIERNES: 'Viernes',
      SABADO: 'Sábado',
      DOMINGO: 'Domingo',
    };

    // Buscar inscripciones a ClaseGrupo Y Comisiones en paralelo
    const [inscripcionesClaseGrupo, inscripcionesComision] = await Promise.all([
      // 1. Inscripciones a ClaseGrupo (clases regulares semanales)
      this.prisma.inscripcionClaseGrupo.findMany({
        where: {
          estudiante_id: estudianteId,
          fecha_baja: null,
        },
        include: {
          claseGrupo: {
            include: {
              docente: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  titulo: true,
                  bio: true,
                  especialidades: true,
                  experiencia_anos: true,
                },
              },
              grupo: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  link_meet: true,
                },
              },
              sector: {
                select: { id: true, nombre: true, color: true, icono: true },
              },
            },
          },
        },
      }),
      // 2. Inscripciones a Comisiones (talleres, colonias, etc)
      this.prisma.inscripcionComision.findMany({
        where: {
          estudiante_id: estudianteId,
          estado: { in: ['Confirmada', 'Pendiente'] },
        },
        include: {
          comision: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              horario: true,
              fecha_inicio: true,
              fecha_fin: true,
              activo: true,
              // Campos LiveKit
              estado_clase: true,
              iniciada_en: true,
              // Relaciones
              docente: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  titulo: true,
                  bio: true,
                  especialidades: true,
                  experiencia_anos: true,
                },
              },
              producto: {
                select: { id: true, nombre: true, descripcion: true },
              },
            },
          },
        },
      }),
    ]);

    // Mapear ClaseGrupo a formato para el frontend
    const clasesGrupales = inscripcionesClaseGrupo
      .filter((i) => i.claseGrupo.activo)
      .map((inscripcion) => {
        const cg = inscripcion.claseGrupo;
        const diaActual = ahora.getDay();
        const diaClase = diasSemanaMap[cg.dia_semana] ?? -1;
        const { horas, minutos } = parseHorario(cg.hora_inicio);

        let diasHasta = diaClase - diaActual;
        if (diasHasta === 0) {
          const horaClase = horas * 60 + minutos;
          const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
          if (horaActual >= horaClase) {
            diasHasta = 7;
          }
        } else if (diasHasta < 0) {
          diasHasta += 7;
        }

        const fechaProxima = new Date(ahora);
        fechaProxima.setDate(ahora.getDate() + diasHasta);
        fechaProxima.setHours(horas, minutos, 0, 0);

        return {
          id: cg.id,
          nombre: cg.nombre,
          codigo: cg.codigo,
          nivel: cg.nivel,
          dia_semana: cg.dia_semana,
          dia_nombre: nombresDia[cg.dia_semana] || cg.dia_semana,
          hora_inicio: cg.hora_inicio,
          hora_fin: cg.hora_fin,
          duracion_minutos: calcularDuracionMinutos(
            cg.hora_inicio,
            cg.hora_fin,
          ),
          fecha_proxima: fechaProxima,
          docente: cg.docente,
          grupo: cg.grupo,
          sector: cg.sector,
          link_meet: cg.grupo?.link_meet || null,
          fecha_inscripcion: inscripcion.fecha_inscripcion,
          tipo: 'clase_grupal' as const,
          // LiveKit: estado de clase en vivo
          estado_clase: cg.estado_clase,
          iniciada_en: cg.iniciada_en,
        };
      });

    // Mapear Comisiones a formato para el frontend
    // No filtramos por activo porque las comisiones pueden no tenerlo seteado
    const comisiones = inscripcionesComision.map((inscripcion) => {
      const com = inscripcion.comision;
      // Usar fecha_inicio de la comisión si existe, sino hoy
      const fechaProxima = com.fecha_inicio || ahora;

      return {
        id: com.id,
        nombre: com.producto?.nombre || com.nombre,
        codigo: com.nombre,
        nivel: null,
        dia_semana: null,
        dia_nombre: com.horario || 'Ver horario',
        hora_inicio: '09:00',
        hora_fin: '12:00',
        duracion_minutos: 180,
        fecha_proxima: fechaProxima,
        docente: com.docente || {
          id: '',
          nombre: 'Por',
          apellido: 'asignar',
        },
        grupo: null,
        sector: {
          id: 'comision',
          nombre: 'Taller',
          color: '#8b5cf6',
          icono: '🎮',
        },
        link_meet: null,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        tipo: 'comision' as const,
        comision_id: com.id,
        // LiveKit: estado real de la comisión
        estado_clase: com.estado_clase,
        iniciada_en: com.iniciada_en,
      };
    });

    // Combinar y ordenar por próxima fecha
    const todas = [...clasesGrupales, ...comisiones];
    return todas.sort(
      (a, b) =>
        new Date(a.fecha_proxima).getTime() -
        new Date(b.fecha_proxima).getTime(),
    );
  }

  /**
   * Obtener el plan de suscripción del estudiante
   * PRIORIDAD: 1) plan_id directo del estudiante, 2) suscripción del tutor (legacy)
   * Usado para validar acceso a clases en vivo (solo STEAM_SINCRONICO)
   * @param estudianteId - ID del estudiante autenticado
   * @returns Plan de suscripción con información de acceso
   */
  async obtenerMiPlan(estudianteId: string) {
    // 1. Obtener el estudiante con plan directo y tutor_id
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: {
        tutor_id: true,
        plan_id: true,
        estado_acceso: true,
        fecha_vencimiento_plan: true,
        notas_plan: true,
        plan: true, // Relación directa con PlanSuscripcion
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 2. Verificar estado de acceso del estudiante
    if (estudiante.estado_acceso === 'SUSPENDIDO') {
      return {
        tiene_plan: false,
        plan: null,
        acceso_clases_vivo: false,
        estado_acceso: 'SUSPENDIDO',
        mensaje: 'Tu acceso está suspendido. Contacta a soporte.',
      };
    }

    // 3. Verificar si el plan venció
    if (
      estudiante.fecha_vencimiento_plan &&
      new Date(estudiante.fecha_vencimiento_plan) < new Date()
    ) {
      return {
        tiene_plan: false,
        plan: null,
        acceso_clases_vivo: false,
        estado_acceso: 'VENCIDO',
        mensaje: 'Tu plan ha vencido. Contacta a tu tutor para renovar.',
      };
    }

    // 4. PRIORIDAD 1: Plan asignado directamente al estudiante
    if (estudiante.plan_id && estudiante.plan) {
      const planNombre = estudiante.plan.nombre;
      const accesoClasesVivo = planNombre === 'STEAM_SINCRONICO';

      return {
        tiene_plan: true,
        plan: {
          id: estudiante.plan.id,
          nombre: planNombre,
          descripcion: estudiante.plan.descripcion,
          precio_base: estudiante.plan.precio_base,
        },
        estado_acceso: estudiante.estado_acceso,
        acceso_clases_vivo: accesoClasesVivo,
        es_plan_directo: true, // Indica que el plan es asignado directamente
        notas_plan: estudiante.notas_plan,
        fecha_vencimiento: estudiante.fecha_vencimiento_plan,
        mensaje: accesoClasesVivo
          ? 'Acceso completo a clases en vivo'
          : 'Tu plan no incluye clases en vivo. Actualiza a STEAM Sincrónico para acceder.',
      };
    }

    // 5. PRIORIDAD 2: Buscar suscripción activa del tutor (comportamiento legacy)
    const suscripcion = await this.prisma.suscripcion.findFirst({
      where: {
        tutor_id: estudiante.tutor_id,
        estado: {
          in: ['ACTIVA', 'EN_GRACIA'],
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!suscripcion || !suscripcion.plan) {
      return {
        tiene_plan: false,
        plan: null,
        acceso_clases_vivo: false,
        estado_acceso: estudiante.estado_acceso,
        es_plan_directo: false,
        mensaje: 'Sin suscripción activa',
      };
    }

    // 6. Determinar acceso a clases en vivo según el plan del tutor
    const planNombre = suscripcion.plan.nombre;
    const accesoClasesVivo = planNombre === 'STEAM_SINCRONICO';

    return {
      tiene_plan: true,
      plan: {
        id: suscripcion.plan.id,
        nombre: planNombre,
        descripcion: suscripcion.plan.descripcion,
        precio_base: suscripcion.plan.precio_base,
      },
      estado_suscripcion: suscripcion.estado,
      estado_acceso: estudiante.estado_acceso,
      acceso_clases_vivo: accesoClasesVivo,
      es_plan_directo: false, // Plan heredado del tutor
      mensaje: accesoClasesVivo
        ? 'Acceso completo a clases en vivo'
        : 'Tu plan no incluye clases en vivo. Actualiza a STEAM Sincrónico para acceder.',
    };
  }

  /**
   * Obtener los sectores (Matemática, Programación, Ciencias) en los que está inscrito el estudiante
   * Agrupa los grupos por sector para mostrar en el portal del estudiante
   * @param estudianteId - ID del estudiante autenticado
   * @returns Array de sectores con sus grupos y metadata
   */
  async obtenerMisSectores(estudianteId: string) {
    // 1. Obtener todas las inscripciones del estudiante con grupos y sectores
    const inscripciones = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        estudiante_id: estudianteId,
        fecha_baja: null, // Solo inscripciones activas
      },
      include: {
        claseGrupo: {
          include: {
            grupo: {
              include: {
                sector: true,
              },
            },
          },
        },
      },
    });

    // 2. Extraer sectores únicos
    const sectoresMap = new Map<
      string,
      {
        id: string;
        nombre: string;
        descripcion: string | null;
        color: string;
        icono: string;
        grupos: Array<{
          id: string;
          codigo: string;
          nombre: string;
          link_meet: string | null;
        }>;
      }
    >();

    for (const inscripcion of inscripciones) {
      const grupo = inscripcion.claseGrupo.grupo;
      const sector = grupo.sector;

      if (!sector) continue; // Saltar grupos sin sector

      // Si el sector no está en el map, agregarlo
      if (!sectoresMap.has(sector.id)) {
        sectoresMap.set(sector.id, {
          id: sector.id,
          nombre: sector.nombre,
          descripcion: sector.descripcion,
          color: sector.color,
          icono: sector.icono,
          grupos: [],
        });
      }

      // Agregar grupo al sector (evitar duplicados)
      const sectorData = sectoresMap.get(sector.id)!;
      const grupoExiste = sectorData.grupos.some((g) => g.id === grupo.id);

      if (!grupoExiste) {
        sectorData.grupos.push({
          id: grupo.id,
          codigo: grupo.codigo,
          nombre: grupo.nombre,
          link_meet: grupo.link_meet,
        });
      }
    }

    // 3. Convertir Map a Array y ordenar por nombre
    return Array.from(sectoresMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  }
}
