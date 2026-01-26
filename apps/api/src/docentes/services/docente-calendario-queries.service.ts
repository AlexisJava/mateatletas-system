import { Injectable } from '@nestjs/common';
import { DiaSemana } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import { calcularProximaClase } from './helpers/docente-schedule-parser';

/**
 * Service for calendar-related queries
 *
 * Handles:
 * - Clases del mes (calendar view)
 * - Próxima clase (upcoming class)
 */
@Injectable()
export class DocenteCalendarioQueriesService {
  constructor(
    private prisma: PrismaService,
    private validator: DocenteBusinessValidator,
  ) {}

  /**
   * Obtiene las clases del mes para el calendario del docente
   * @param docenteId - ID del docente
   * @param mes - Mes (1-12)
   * @param anio - Año (ej: 2025)
   * @returns Clases del mes con información de estudiantes
   */
  async getClasesDelMes(docenteId: string, mes: number, anio: number) {
    await this.validator.validarDocenteExiste(docenteId);

    // Obtener grupos activos del docente
    const gruposDocente = await this.prisma.claseGrupo.findMany({
      where: {
        docenteId: docenteId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
        diaSemana: true,
        horaInicio: true,
        horaFin: true,
        cupoMaximo: true,
        inscripciones: {
          select: {
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

    // Generar las fechas de clase del mes
    const primerDiaDelMes = new Date(anio, mes - 1, 1);
    const ultimoDiaDelMes = new Date(anio, mes, 0);

    const diasSemanaMap: Record<DiaSemana, number> = {
      [DiaSemana.DOMINGO]: 0,
      [DiaSemana.LUNES]: 1,
      [DiaSemana.MARTES]: 2,
      [DiaSemana.MIERCOLES]: 3,
      [DiaSemana.JUEVES]: 4,
      [DiaSemana.VIERNES]: 5,
      [DiaSemana.SABADO]: 6,
    };

    const clasesDelMes: Array<{
      id: string;
      fecha: string;
      nombre: string;
      codigo: string;
      horaInicio: string;
      horaFin: string;
      estudiantesCount: number;
      cupoMaximo: number;
      grupoId: string;
    }> = [];

    for (const grupo of gruposDocente) {
      const diaSemanaNum = diasSemanaMap[grupo.diaSemana];

      // Encontrar el primer día del mes que coincida con el día de la semana
      const fechaInicial = new Date(primerDiaDelMes);
      const diasHastaProximo = (diaSemanaNum - fechaInicial.getDay() + 7) % 7;
      let fechaMs =
        fechaInicial.getTime() + diasHastaProximo * 24 * 60 * 60 * 1000;

      // Generar todas las fechas de este grupo en el mes
      while (fechaMs <= ultimoDiaDelMes.getTime()) {
        const fechaActual = new Date(fechaMs);
        clasesDelMes.push({
          id: `${grupo.id}-${fechaActual.toISOString().split('T')[0]}`,
          fecha: fechaActual.toISOString().split('T')[0]!,
          nombre: grupo.nombre,
          codigo: grupo.codigo,
          horaInicio: grupo.horaInicio,
          horaFin: grupo.horaFin,
          estudiantesCount: grupo.inscripciones.length,
          cupoMaximo: grupo.cupoMaximo,
          grupoId: grupo.id,
        });

        // Avanzar una semana (7 días en milisegundos)
        fechaMs += 7 * 24 * 60 * 60 * 1000;
      }
    }

    // Ordenar por fecha y hora
    clasesDelMes.sort((a, b) => {
      const fechaComparison = a.fecha.localeCompare(b.fecha);
      if (fechaComparison !== 0) return fechaComparison;
      return a.horaInicio.localeCompare(b.horaInicio);
    });

    // Calcular stats del mes
    const estudiantesUnicos = new Set<string>();
    gruposDocente.forEach((grupo) => {
      grupo.inscripciones.forEach((insc) => {
        estudiantesUnicos.add(insc.estudiante.id);
      });
    });

    return {
      clases: clasesDelMes,
      stats: {
        totalClases: clasesDelMes.length,
        totalGrupos: gruposDocente.length,
        totalEstudiantes: estudiantesUnicos.size,
      },
    };
  }

  /**
   * Obtiene la próxima clase del docente basado en sus comisiones activas
   * @param docenteId - ID del docente
   * @returns Próxima clase con comisión, fecha_hora y minutos_restantes, o null
   */
  async getProximaClase(docenteId: string): Promise<{
    comision: {
      id: string;
      nombre: string;
      horario: string | null;
    };
    fechaHora: string;
    minutosRestantes: number;
  } | null> {
    await this.validator.validarDocenteExiste(docenteId);

    const now = new Date();

    // Obtener comisiones activas del docente
    const comisiones = await this.prisma.comision.findMany({
      where: {
        docenteId: docenteId,
        activo: true,
        OR: [{ fechaFin: null }, { fechaFin: { gte: now } }],
      },
      select: {
        id: true,
        nombre: true,
        horario: true,
        fechaFin: true,
      },
    });

    if (comisiones.length === 0) {
      return null;
    }

    // Calcular la próxima clase para cada comisión
    let proximaClaseData: {
      comision: { id: string; nombre: string; horario: string | null };
      fechaHora: Date;
    } | null = null;

    for (const comision of comisiones) {
      const fechaProxima = calcularProximaClase(
        comision.horario,
        comision.fechaFin,
        now,
      );

      if (fechaProxima) {
        if (!proximaClaseData || fechaProxima < proximaClaseData.fechaHora) {
          proximaClaseData = {
            comision: {
              id: comision.id,
              nombre: comision.nombre,
              horario: comision.horario,
            },
            fechaHora: fechaProxima,
          };
        }
      }
    }

    if (!proximaClaseData) {
      return null;
    }

    // Calcular minutos restantes
    const minutosRestantes = Math.floor(
      (proximaClaseData.fechaHora.getTime() - now.getTime()) / (60 * 1000),
    );

    return {
      comision: proximaClaseData.comision,
      fechaHora: proximaClaseData.fechaHora.toISOString(),
      minutosRestantes: minutosRestantes,
    };
  }
}
