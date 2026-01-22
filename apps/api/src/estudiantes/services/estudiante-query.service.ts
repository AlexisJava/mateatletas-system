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
      tutorId: tutorId,
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

    if (estudiante.tutorId !== tutorId) {
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
      where: { tutorId: tutorId },
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
        tutorId: tutorId,
      },
      include: {
        casa: true,
        recursos: {
          select: { xpTotal: true },
        },
        logrosDesbloqueados: {
          include: {
            logro: true,
          },
          orderBy: {
            fechaDesbloqueo: 'desc',
          },
        },
        inscripcionesClase: {
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
              fechaHoraInicio: 'desc',
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
              fechaHoraInicio: 'desc',
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
        totalClases: totalClases,
        clasesPresente: clasesPresente,
        tasaAsistencia: tasaAsistencia,
        nivel: estudiante.nivelActual,
        puntos: estudiante.recursos?.xpTotal ?? 0,
        logros: estudiante.logrosDesbloqueados?.length || 0,
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
        sectorId: estudiante.sectorId,
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
    return clases.filter((clase) => clase.cuposOcupados < clase.cuposMaximo);
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
            estudianteId: estudianteId,
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
            linkMeet: true,
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
      const diaClase = diasSemanaMap[proximaClaseGrupo.diaSemana] ?? -1;

      // Parsear hora usando utilidad robusta
      const { horas, minutos } = parseHorario(proximaClaseGrupo.horaInicio);

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
        proximaClaseGrupo.horaInicio,
        proximaClaseGrupo.horaFin,
      );

      return {
        tipo: 'grupo' as const,
        id: proximaClaseGrupo.id,
        nombre: proximaClaseGrupo.nombre,
        codigo: proximaClaseGrupo.codigo,
        fechaHoraInicio: fechaProxima,
        duracionMinutos: duracionMinutos,
        docente: proximaClaseGrupo.docente,
        diaSemana: proximaClaseGrupo.diaSemana,
        horaInicio: proximaClaseGrupo.horaInicio,
        linkMeet: proximaClaseGrupo.grupo?.linkMeet,
      };
    }

    // Si no hay clase grupal, buscar en clases individuales (Clase)
    const proximaClaseIndividual = await this.prisma.clase.findFirst({
      where: {
        inscripciones: {
          some: {
            estudianteId: estudianteId,
          },
        },
        fechaHoraInicio: {
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
        fechaHoraInicio: 'asc',
      },
    });

    if (proximaClaseIndividual) {
      return {
        tipo: 'individual' as const,
        id: proximaClaseIndividual.id,
        nombre: proximaClaseIndividual.nombre,
        fechaHoraInicio: proximaClaseIndividual.fechaHoraInicio,
        duracionMinutos: proximaClaseIndividual.duracionMinutos,
        docente: proximaClaseIndividual.docente,
        estado: proximaClaseIndividual.estado,
      };
    }

    return null;
  }

  /**
   * Obtener compañeros del estudiante (de ClaseGrupo o Comisión)
   * Busca primero en ClaseGrupo, si no encuentra busca en Comisión
   * @param estudianteId - ID del estudiante
   * @returns Lista de compañeros con sus puntos totales
   */
  async obtenerCompanerosDeClase(estudianteId: string) {
    // 1. Buscar primero en ClaseGrupo usando vista unificada
    const inscripcionClaseGrupo =
      await this.prisma.inscripcionUnificada.findFirst({
        where: {
          estudianteId: estudianteId,
          estado: 'ACTIVA',
        },
      });

    if (inscripcionClaseGrupo) {
      // Obtener compañeros del mismo ClaseGrupo usando vista unificada
      const companeros = await this.prisma.estudiante.findMany({
        where: {
          id: { not: estudianteId }, // Excluir al estudiante actual
          inscripcionesUnificadas: {
            some: {
              claseGrupoId: inscripcionClaseGrupo.claseGrupoId,
              estado: 'ACTIVA',
            },
          },
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          recursos: {
            select: { xpTotal: true },
          },
        },
      });

      return companeros
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          puntos: c.recursos?.xpTotal ?? 0,
        }))
        .sort((a, b) => b.puntos - a.puntos);
    }

    // 2. Si no tiene ClaseGrupo, buscar en Comisión
    const inscripcionComision = await this.prisma.inscripcionComision.findFirst(
      {
        where: {
          estudianteId: estudianteId,
          estado: 'Confirmada',
        },
      },
    );

    if (inscripcionComision) {
      // Obtener compañeros de la misma Comisión
      const companeros = await this.prisma.estudiante.findMany({
        where: {
          id: { not: estudianteId }, // Excluir al estudiante actual
          inscripcionesComision: {
            some: {
              comisionId: inscripcionComision.comisionId,
              estado: 'Confirmada',
            },
          },
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          recursos: {
            select: { xpTotal: true },
          },
        },
      });

      return companeros
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          puntos: c.recursos?.xpTotal ?? 0,
        }))
        .sort((a, b) => b.puntos - a.puntos);
    }

    // No tiene inscripciones
    return [];
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
    // Usa vista unificada para incluir inscripciones manuales y via suscripción
    const [inscripcionesClaseGrupo, inscripcionesComision] = await Promise.all([
      // 1. Inscripciones a ClaseGrupo (clases regulares semanales)
      this.prisma.inscripcionUnificada.findMany({
        where: {
          estudianteId: estudianteId,
          estado: 'ACTIVA',
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
                  experienciaAnos: true,
                },
              },
              grupo: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  linkMeet: true,
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
          estudianteId: estudianteId,
          estado: { in: ['Confirmada', 'Pendiente'] },
        },
        include: {
          comision: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              horario: true,
              fechaInicio: true,
              fechaFin: true,
              activo: true,
              // Campos LiveKit
              estadoClase: true,
              iniciadaEn: true,
              // Relaciones
              docente: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  titulo: true,
                  bio: true,
                  especialidades: true,
                  experienciaAnos: true,
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
        const diaClase = diasSemanaMap[cg.diaSemana] ?? -1;
        const { horas, minutos } = parseHorario(cg.horaInicio);

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
          diaSemana: cg.diaSemana,
          diaNombre: nombresDia[cg.diaSemana] || cg.diaSemana,
          horaInicio: cg.horaInicio,
          horaFin: cg.horaFin,
          duracionMinutos: calcularDuracionMinutos(cg.horaInicio, cg.horaFin),
          fechaProxima: fechaProxima,
          docente: cg.docente,
          grupo: cg.grupo,
          sector: cg.sector,
          linkMeet: cg.grupo?.linkMeet || null,
          fechaInscripcion: inscripcion.fechaInscripcion,
          tipo: 'claseGrupal' as const,
          // LiveKit: estado de clase en vivo
          estadoClase: cg.estadoClase,
          iniciadaEn: cg.iniciadaEn,
        };
      });

    // Mapear Comisiones a formato para el frontend
    // No filtramos por activo porque las comisiones pueden no tenerlo seteado
    const comisiones = inscripcionesComision.map((inscripcion) => {
      const com = inscripcion.comision;
      // Usar fechaInicio de la comisión si existe, sino hoy
      const fechaProxima = com.fechaInicio || ahora;

      return {
        id: com.id,
        nombre: com.producto?.nombre || com.nombre,
        codigo: com.nombre,
        nivel: null,
        diaSemana: null,
        diaNombre: com.horario || 'Ver horario',
        horaInicio: '09:00',
        horaFin: '12:00',
        duracionMinutos: 180,
        fechaProxima: fechaProxima,
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
        linkMeet: null,
        fechaInscripcion: inscripcion.fechaInscripcion,
        tipo: 'comision' as const,
        comisionId: com.id,
        // LiveKit: estado real de la comisión
        estadoClase: com.estadoClase,
        iniciadaEn: com.iniciadaEn,
      };
    });

    // Combinar y ordenar por próxima fecha
    const todas = [...clasesGrupales, ...comisiones];
    return todas.sort(
      (a, b) =>
        new Date(a.fechaProxima).getTime() - new Date(b.fechaProxima).getTime(),
    );
  }

  /**
   * Obtener el plan de suscripción del estudiante
   * PRIORIDAD: 1) planId directo del estudiante, 2) suscripción del tutor (legacy)
   * Usado para validar acceso a clases en vivo (solo STEAM_SINCRONICO)
   * @param estudianteId - ID del estudiante autenticado
   * @returns Plan de suscripción con información de acceso
   */
  async obtenerMiPlan(estudianteId: string) {
    // 1. Obtener el estudiante con plan directo y tutorId
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: {
        tutorId: true,
        planId: true,
        estadoAcceso: true,
        fechaVencimientoPlan: true,
        notasPlan: true,
        plan: true, // Relación directa con PlanSuscripcion
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 2. Verificar estado de acceso del estudiante
    if (estudiante.estadoAcceso === 'SUSPENDIDO') {
      return {
        tienePlan: false,
        plan: null,
        accesoClasesVivo: false,
        estadoAcceso: 'SUSPENDIDO',
        mensaje: 'Tu acceso está suspendido. Contacta a soporte.',
      };
    }

    // 3. Verificar si el plan venció
    if (
      estudiante.fechaVencimientoPlan &&
      new Date(estudiante.fechaVencimientoPlan) < new Date()
    ) {
      return {
        tienePlan: false,
        plan: null,
        accesoClasesVivo: false,
        estadoAcceso: 'VENCIDO',
        mensaje: 'Tu plan ha vencido. Contacta a tu tutor para renovar.',
      };
    }

    // 4. PRIORIDAD 1: Plan asignado directamente al estudiante
    if (estudiante.planId && estudiante.plan) {
      const planNombre = estudiante.plan.nombre;
      const accesoClasesVivo = planNombre === 'STEAM_SINCRONICO';

      return {
        tienePlan: true,
        plan: {
          id: estudiante.plan.id,
          nombre: planNombre,
          descripcion: estudiante.plan.descripcion,
          precioBase: estudiante.plan.precioBase,
        },
        estadoAcceso: estudiante.estadoAcceso,
        accesoClasesVivo: accesoClasesVivo,
        esPlanDirecto: true, // Indica que el plan es asignado directamente
        notasPlan: estudiante.notasPlan,
        fechaVencimiento: estudiante.fechaVencimientoPlan,
        mensaje: accesoClasesVivo
          ? 'Acceso completo a clases en vivo'
          : 'Tu plan no incluye clases en vivo. Actualiza a STEAM Sincrónico para acceder.',
      };
    }

    // 5. PRIORIDAD 2: Buscar suscripción activa del tutor (comportamiento legacy)
    const suscripcion = await this.prisma.suscripcion.findFirst({
      where: {
        tutorId: estudiante.tutorId,
        estado: {
          in: ['ACTIVA', 'EN_GRACIA'],
        },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!suscripcion || !suscripcion.plan) {
      return {
        tienePlan: false,
        plan: null,
        accesoClasesVivo: false,
        estadoAcceso: estudiante.estadoAcceso,
        esPlanDirecto: false,
        mensaje: 'Sin suscripción activa',
      };
    }

    // 6. Determinar acceso a clases en vivo según el plan del tutor
    const planNombre = suscripcion.plan.nombre;
    const accesoClasesVivo = planNombre === 'STEAM_SINCRONICO';

    return {
      tienePlan: true,
      plan: {
        id: suscripcion.plan.id,
        nombre: planNombre,
        descripcion: suscripcion.plan.descripcion,
        precioBase: suscripcion.plan.precioBase,
      },
      estadoSuscripcion: suscripcion.estado,
      estadoAcceso: estudiante.estadoAcceso,
      accesoClasesVivo: accesoClasesVivo,
      esPlanDirecto: false, // Plan heredado del tutor
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
    // Usa vista unificada para incluir inscripciones manuales y via suscripción
    const inscripciones = await this.prisma.inscripcionUnificada.findMany({
      where: {
        estudianteId: estudianteId,
        estado: 'ACTIVA',
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
          linkMeet: string | null;
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
          linkMeet: grupo.linkMeet,
        });
      }
    }

    // 3. Convertir Map a Array y ordenar por nombre
    return Array.from(sectoresMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre),
    );
  }
}
