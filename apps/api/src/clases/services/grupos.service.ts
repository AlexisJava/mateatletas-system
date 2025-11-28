import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { parseHorario } from '../../common/utils/time.utils';
import {
  GrupoDetalleCompletoDto,
  EstudianteConStatsDto,
  TareaGrupoDto,
  ObservacionRecienteDto,
  TipoObservacion,
  ProximaClaseDto,
} from '../dto/grupo-detalle-completo.dto';
import { EstadoAsistencia, DiaSemana } from '@prisma/client';

/**
 * Servicio para operaciones avanzadas de ClaseGrupo
 * Incluye queries complejos para el portal docente
 * SIN `any` NI `unknown` - TypeScript estricto
 */
@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener detalle COMPLETO de un ClaseGrupo
   * Incluye: estudiantes con stats, tareas, observaciones, próxima clase
   *
   * Query BRUTAL optimizado con Prisma types correctos
   */
  async getDetalleCompleto(
    claseGrupoId: string,
    docenteId: string,
  ): Promise<GrupoDetalleCompletoDto> {
    // 1. Obtener ClaseGrupo con todas las relaciones necesarias
    const claseGrupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      include: {
        rutaCurricular: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        inscripciones: {
          where: { fecha_baja: null }, // Solo inscritos activos
          include: {
            estudiante: {
              include: {
                casa: {
                  select: {
                    nombre: true,
                    colorPrimary: true,
                  },
                },
                asistencias_clase_grupo: {
                  where: {
                    clase_grupo_id: claseGrupoId,
                  },
                  select: {
                    id: true,
                    estado: true,
                    fecha: true,
                  },
                },
                puntosObtenidos: {
                  select: {
                    puntos: true,
                  },
                },
              },
            },
          },
        },
        asistencias: {
          where: {
            observaciones: { not: null },
          },
          orderBy: {
            fecha: 'desc',
          },
          take: 20,
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    if (!claseGrupo) {
      throw new NotFoundException('Grupo de clase no encontrado');
    }

    // 2. Verificar que el docente autenticado es el titular
    if (claseGrupo.docente_id !== docenteId) {
      throw new ForbiddenException('No tiene permisos para ver este grupo');
    }

    // 3. Calcular estadísticas de cada estudiante
    const estudiantesConStats: EstudianteConStatsDto[] =
      claseGrupo.inscripciones.map((insc) => {
        const estudiante = insc.estudiante;

        // Asistencias del estudiante en este grupo
        const asistencias = estudiante.asistencias_clase_grupo;
        const clasesAsistidas = asistencias.filter(
          (a) => a.estado === EstadoAsistencia.Presente,
        ).length;
        const porcentajeAsistencia =
          asistencias.length > 0
            ? Math.round((clasesAsistidas / asistencias.length) * 100)
            : 0;

        // Puntos totales del estudiante
        const puntosTotal = estudiante.puntosObtenidos.reduce(
          (sum, p) => sum + p.puntos,
          0,
        );

        // Última asistencia
        const ultimaAsistenciaReg =
          asistencias.length > 0
            ? asistencias.sort(
                (a, b) => b.fecha.getTime() - a.fecha.getTime(),
              )[0]
            : null;

        return {
          id: estudiante.id,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
          avatar_gradient: estudiante.avatar_gradient,
          casa: estudiante.casa
            ? {
                nombre: estudiante.casa.nombre,
                color: estudiante.casa.colorPrimary,
              }
            : null,
          stats: {
            puntosTotal,
            clasesAsistidas,
            porcentajeAsistencia,
            tareasCompletadas: 0, // TODO: Implementar cuando tengamos sistema de tareas
            tareasTotal: 0,
            ultimaAsistencia: ultimaAsistenciaReg
              ? ultimaAsistenciaReg.fecha.toISOString()
              : null,
          },
        };
      });

    // 4. Tareas del grupo (por ahora vacío - implementar cuando tengamos sistema de tareas)
    const tareas: TareaGrupoDto[] = [];

    // 5. Observaciones recientes con clasificación
    const observacionesRecientes: ObservacionRecienteDto[] =
      claseGrupo.asistencias
        .filter((a) => a.observaciones !== null)
        .map((a) => {
          // Clasificar observación por keywords
          const obs = a.observaciones!.toLowerCase();
          let tipo: TipoObservacion = 'neutral';

          if (
            obs.includes('excelente') ||
            obs.includes('muy bien') ||
            obs.includes('destacado') ||
            obs.includes('felicitaciones')
          ) {
            tipo = 'positiva';
          } else if (
            obs.includes('debe mejorar') ||
            obs.includes('atención') ||
            obs.includes('problema') ||
            obs.includes('distracción')
          ) {
            tipo = 'atencion';
          }

          return {
            id: a.id,
            estudiante: {
              id: a.estudiante.id,
              nombre: a.estudiante.nombre,
              apellido: a.estudiante.apellido,
            },
            observacion: a.observaciones!,
            fecha: a.fecha.toISOString(),
            estado: a.estado,
            tipo,
          };
        });

    // 6. Calcular stats del grupo
    const totalEstudiantes = estudiantesConStats.length;
    const asistenciaPromedio =
      totalEstudiantes > 0
        ? Math.round(
            estudiantesConStats.reduce(
              (sum, e) => sum + e.stats.porcentajeAsistencia,
              0,
            ) / totalEstudiantes,
          )
        : 0;
    const puntosPromedio =
      totalEstudiantes > 0
        ? Math.round(
            estudiantesConStats.reduce(
              (sum, e) => sum + e.stats.puntosTotal,
              0,
            ) / totalEstudiantes,
          )
        : 0;

    // 7. Calcular próxima clase
    const proximaClase = this.calcularProximaClase(
      claseGrupo.dia_semana,
      claseGrupo.hora_inicio,
    );

    // 8. Ensamblar response BRUTAL
    return {
      id: claseGrupo.id,
      nombre: claseGrupo.nombre,
      codigo: claseGrupo.codigo,
      dia_semana: claseGrupo.dia_semana,
      hora_inicio: claseGrupo.hora_inicio,
      hora_fin: claseGrupo.hora_fin,
      cupo_maximo: claseGrupo.cupo_maximo,
      rutaCurricular: claseGrupo.rutaCurricular,
      estudiantes: estudiantesConStats,
      tareas,
      observacionesRecientes,
      stats: {
        totalEstudiantes,
        asistenciaPromedio,
        puntosPromedio,
        tareasCompletadasPromedio: 0, // TODO: Cuando tengamos tareas
      },
      proximaClase,
      docenteId: claseGrupo.docente_id,
      activo: claseGrupo.activo,
    };
  }

  /**
   * Calcular la próxima clase del grupo
   * Devuelve la fecha del próximo día que coincide con el dia_semana
   */
  private calcularProximaClase(
    dia_semana: DiaSemana,
    hora_inicio: string,
  ): ProximaClaseDto | null {
    const now = new Date();
    const diasSemanaMap: Record<DiaSemana, number> = {
      [DiaSemana.DOMINGO]: 0,
      [DiaSemana.LUNES]: 1,
      [DiaSemana.MARTES]: 2,
      [DiaSemana.MIERCOLES]: 3,
      [DiaSemana.JUEVES]: 4,
      [DiaSemana.VIERNES]: 5,
      [DiaSemana.SABADO]: 6,
    };

    const diaNumero = diasSemanaMap[dia_semana];
    const hoyNumero = now.getDay();

    // Calcular cuántos días faltan para el próximo día de clase
    let diasHasta = diaNumero - hoyNumero;
    if (diasHasta < 0) {
      diasHasta += 7;
    }
    if (diasHasta === 0) {
      // Si es hoy, verificar si ya pasó la hora
      const { horas: horaClase, minutos: minutoClase } =
        parseHorario(hora_inicio);
      const horaActual = now.getHours();
      const minutoActual = now.getMinutes();

      if (
        horaActual > horaClase ||
        (horaActual === horaClase && minutoActual >= minutoClase)
      ) {
        // Ya pasó la hora, la próxima clase es en 7 días
        diasHasta = 7;
      }
    }

    const proximaFecha = new Date(now);
    proximaFecha.setDate(proximaFecha.getDate() + diasHasta);

    // Calcular minutos para empezar (solo si es hoy)
    let minutosParaEmpezar: number | null = null;
    if (diasHasta === 0) {
      const { horas: horaClase, minutos: minutoClase } =
        parseHorario(hora_inicio);
      const fechaClase = new Date(now);
      fechaClase.setHours(horaClase, minutoClase, 0, 0);
      minutosParaEmpezar = Math.floor(
        (fechaClase.getTime() - now.getTime()) / (1000 * 60),
      );
    }

    return {
      fecha: proximaFecha.toISOString().split('T')[0] || '', // YYYY-MM-DD
      hora: hora_inicio,
      minutosParaEmpezar,
    };
  }
}
