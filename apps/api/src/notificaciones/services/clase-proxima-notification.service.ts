import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { NotificacionesService } from '../notificaciones.service';
import { DiaSemana, TipoNotificacion } from '@prisma/client';

/**
 * Mapeo de día JavaScript (0=Domingo) a enum DiaSemana de Prisma
 */
const JS_DAY_TO_DIA_SEMANA: Record<number, DiaSemana> = {
  0: DiaSemana.DOMINGO,
  1: DiaSemana.LUNES,
  2: DiaSemana.MARTES,
  3: DiaSemana.MIERCOLES,
  4: DiaSemana.JUEVES,
  5: DiaSemana.VIERNES,
  6: DiaSemana.SABADO,
};

interface ClaseConInscripciones {
  id: string;
  nombre: string;
  horaInicio: string;
  docenteId: string;
  docente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  inscripcionesUnificadas: Array<{
    estudianteId: string;
    tutorId: string;
    estado: string;
    estudiante: {
      id: string;
      nombre: string;
      apellido: string;
    };
  }>;
}

/**
 * Servicio de Notificación de Clases Próximas
 *
 * REGLA DE NEGOCIO:
 * - Notifica a docentes, estudiantes y tutores sobre clases que ocurren mañana
 * - Se ejecuta diariamente a las 8:00 AM (hora Argentina)
 * - Evita duplicados verificando notificaciones previas con metadata.claseId
 *
 * DESTINATARIOS:
 * - Docente: "Mañana tienes clase X a las HH:MM"
 * - Estudiantes inscritos: "Mañana tienes clase X a las HH:MM"
 * - Tutores de esos estudiantes: "Tu hijo X tiene clase mañana a las HH:MM"
 */
@Injectable()
export class ClaseProximaNotificationService {
  private readonly logger = new Logger(ClaseProximaNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /**
   * Cron job que se ejecuta diariamente a las 8:00 AM (hora Argentina)
   * Busca clases programadas para mañana y notifica a los involucrados
   */
  @Cron('0 8 * * *', { timeZone: 'America/Argentina/Buenos_Aires' })
  async notificarClasesProximas(): Promise<void> {
    this.logger.log('Iniciando proceso de notificación de clases próximas...');

    const startTime = Date.now();

    try {
      const resultado = await this.procesarNotificaciones();
      const duration = Date.now() - startTime;

      this.logger.log(
        `Proceso completado en ${duration}ms. ` +
          `Docentes: ${resultado.docentes}, ` +
          `Estudiantes: ${resultado.estudiantes}, ` +
          `Tutores: ${resultado.tutores}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error en proceso de notificación: ${message}`);
      throw error;
    }
  }

  /**
   * Procesa las notificaciones de clases próximas
   */
  private async procesarNotificaciones(): Promise<{
    docentes: number;
    estudiantes: number;
    tutores: number;
  }> {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const diaSemanaManana = JS_DAY_TO_DIA_SEMANA[manana.getDay()];

    this.logger.log(`Buscando clases para mañana (${diaSemanaManana})...`);

    // Buscar clases activas que ocurren mañana
    const clases = await this.prisma.claseGrupo.findMany({
      where: {
        diaSemana: diaSemanaManana,
        activo: true,
        fechaInicio: { lte: manana },
        fechaFin: { gte: manana },
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        inscripcionesUnificadas: {
          where: {
            estado: 'ACTIVA',
          },
          select: {
            estudianteId: true,
            tutorId: true,
            estado: true,
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

    if (clases.length === 0) {
      this.logger.log('No hay clases programadas para mañana');
      return { docentes: 0, estudiantes: 0, tutores: 0 };
    }

    this.logger.log(`Encontradas ${clases.length} clases para mañana`);

    let docentesNotificados = 0;
    let estudiantesNotificados = 0;
    let tutoresNotificados = 0;

    for (const clase of clases as ClaseConInscripciones[]) {
      // 1. Notificar al docente
      const docenteNotificado = await this.notificarDocente(clase);
      if (docenteNotificado) docentesNotificados++;

      // 2. Notificar a estudiantes y tutores
      const { estudiantes, tutores } =
        await this.notificarEstudiantesYTutores(clase);
      estudiantesNotificados += estudiantes;
      tutoresNotificados += tutores;
    }

    return {
      docentes: docentesNotificados,
      estudiantes: estudiantesNotificados,
      tutores: tutoresNotificados,
    };
  }

  /**
   * Notifica al docente sobre su clase de mañana
   */
  private async notificarDocente(
    clase: ClaseConInscripciones,
  ): Promise<boolean> {
    // Verificar si ya existe notificación para esta clase/docente hoy
    const existeNotificacion = await this.existeNotificacionHoy(
      'docente',
      clase.docenteId,
      clase.id,
    );

    if (existeNotificacion) {
      return false;
    }

    await this.notificacionesService.notificarClaseProxima(
      clase.docenteId,
      clase.id,
      clase.nombre,
      this.buildFechaHoraManana(clase.horaInicio),
    );

    return true;
  }

  /**
   * Notifica a estudiantes y sus tutores sobre la clase de mañana
   */
  private async notificarEstudiantesYTutores(
    clase: ClaseConInscripciones,
  ): Promise<{ estudiantes: number; tutores: number }> {
    let estudiantes = 0;
    let tutores = 0;

    // Set para evitar notificar al mismo tutor múltiples veces por la misma clase
    const tutoresNotificados = new Set<string>();

    for (const inscripcion of clase.inscripcionesUnificadas) {
      // Notificar al estudiante
      const estudianteNotificado = await this.notificarEstudiante(
        inscripcion.estudianteId,
        clase,
      );
      if (estudianteNotificado) estudiantes++;

      // Notificar al tutor (solo una vez por clase, aunque tenga varios hijos)
      if (!tutoresNotificados.has(inscripcion.tutorId)) {
        const tutorNotificado = await this.notificarTutor(
          inscripcion.tutorId,
          inscripcion.estudiante,
          clase,
        );
        if (tutorNotificado) {
          tutores++;
          tutoresNotificados.add(inscripcion.tutorId);
        }
      }
    }

    return { estudiantes, tutores };
  }

  /**
   * Notifica a un estudiante sobre su clase de mañana
   */
  private async notificarEstudiante(
    estudianteId: string,
    clase: ClaseConInscripciones,
  ): Promise<boolean> {
    const existeNotificacion = await this.existeNotificacionHoy(
      'estudiante',
      estudianteId,
      clase.id,
    );

    if (existeNotificacion) {
      return false;
    }

    await this.notificacionesService.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_CLASE_PROXIMA,
      titulo: 'Clase mañana',
      mensaje: `Mañana tienes "${clase.nombre}" a las ${clase.horaInicio}`,
      metadata: { claseId: clase.id },
    });

    return true;
  }

  /**
   * Notifica a un tutor sobre la clase de su hijo mañana
   */
  private async notificarTutor(
    tutorId: string,
    estudiante: { id: string; nombre: string; apellido: string },
    clase: ClaseConInscripciones,
  ): Promise<boolean> {
    const existeNotificacion = await this.existeNotificacionHoy(
      'tutor',
      tutorId,
      clase.id,
    );

    if (existeNotificacion) {
      return false;
    }

    await this.notificacionesService.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_CLASE_PROXIMA_HIJO,
      titulo: 'Clase de tu hijo mañana',
      mensaje: `${estudiante.nombre} tiene "${clase.nombre}" mañana a las ${clase.horaInicio}`,
      metadata: {
        claseId: clase.id,
        estudianteId: estudiante.id,
      },
    });

    return true;
  }

  /**
   * Verifica si ya existe una notificación de clase próxima para hoy
   * Usa metadata.claseId para identificar notificaciones duplicadas
   */
  private async existeNotificacionHoy(
    tipo: 'docente' | 'estudiante' | 'tutor',
    destinatarioId: string,
    claseId: string,
  ): Promise<boolean> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const whereClause: Record<string, string> = {};
    if (tipo === 'docente') whereClause['docenteId'] = destinatarioId;
    if (tipo === 'estudiante') whereClause['estudianteId'] = destinatarioId;
    if (tipo === 'tutor') whereClause['tutorId'] = destinatarioId;

    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        ...whereClause,
        tipo: {
          in: [
            TipoNotificacion.DOCENTE_CLASE_PROXIMA,
            TipoNotificacion.ESTUDIANTE_CLASE_PROXIMA,
            TipoNotificacion.TUTOR_CLASE_PROXIMA_HIJO,
          ],
        },
        createdAt: {
          gte: hoy,
          lt: manana,
        },
        metadata: {
          path: ['claseId'],
          equals: claseId,
        },
      },
    });

    return notificacion !== null;
  }

  /**
   * Construye un Date para mañana a la hora especificada
   */
  private buildFechaHoraManana(horaInicio: string): Date {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const [horas, minutos] = horaInicio.split(':').map(Number);
    manana.setHours(horas ?? 0, minutos ?? 0, 0, 0);

    return manana;
  }

  /**
   * Método para ejecución manual (útil para testing y admin)
   */
  async runManually(): Promise<{
    docentes: number;
    estudiantes: number;
    tutores: number;
  }> {
    this.logger.log('Ejecutando notificación manual de clases próximas...');
    return this.procesarNotificaciones();
  }
}
