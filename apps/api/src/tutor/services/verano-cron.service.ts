/**
 * ============================================================================
 * VERANO CRON SERVICE - Tareas programadas para el flujo de verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md
 *
 * Tareas programadas:
 * 1. Notificar inicio del período de decisión (15 nov)
 * 2. Recordatorio antes del deadline (1 dic, 4 dic)
 * 3. Procesar bajas automáticas (6 dic)
 * 4. Restaurar suscripciones (1 mar)
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { PERIODO_DECISION } from './verano-query.service';
import {
  DecisionVerano,
  EstadoSuscripcionFamiliar,
  TipoNotificacion,
} from '@prisma/client';

@Injectable()
export class VeranoCronService {
  private readonly logger = new Logger(VeranoCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Notificación de inicio del período de decisión
   * Se ejecuta el 15 de noviembre a las 09:00
   */
  @Cron('0 9 15 11 *') // 15 de noviembre a las 09:00
  async notificarInicioPeriodoDecision(): Promise<void> {
    this.logger.log(
      '🌴 Iniciando notificación de período de decisión verano...',
    );

    const startTime = Date.now();

    try {
      // Obtener tutores con suscripciones activas
      const tutoresActivos = await this.prisma.suscripcionFamiliar.findMany({
        where: {
          estado: {
            in: [
              EstadoSuscripcionFamiliar.AUTHORIZED,
              EstadoSuscripcionFamiliar.CONTINUIDAD,
            ],
          },
        },
        include: {
          tutor: true,
        },
      });

      const anio = new Date().getFullYear();
      const fechaLimite = new Date(
        anio,
        PERIODO_DECISION.MES_FIN - 1,
        PERIODO_DECISION.DIA_FIN,
      );

      // Crear notificaciones para cada tutor
      for (const suscripcion of tutoresActivos) {
        if (!suscripcion.tutor?.id) continue;

        await this.prisma.notificacion.create({
          data: {
            tutorId: suscripcion.tutor.id,
            titulo: '🌴 Decisión de Verano Abierta',
            mensaje: `Ya podés elegir la modalidad de verano para tus hijos. Opciones: Colonia de Verano, Continuidad o Baja. Fecha límite: ${fechaLimite.toLocaleDateString('es-AR')}`,
            tipo: TipoNotificacion.TUTOR_PERIODO_INSCRIPCION_ABIERTO,
            leida: false,
            metadata: {
              tipo: 'inicio_periodo_verano',
              anio,
              fechaLimite: fechaLimite.toISOString(),
            },
          },
        });
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Notificaciones enviadas a ${tutoresActivos.length} tutores en ${duration}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Error en notificación de inicio de período: ${message}`,
      );
    }
  }

  /**
   * Recordatorio de decisión pendiente
   * Se ejecuta el 1 y 4 de diciembre a las 09:00
   */
  @Cron('0 9 1,4 12 *') // 1 y 4 de diciembre a las 09:00
  async recordatorioPendientes(): Promise<void> {
    this.logger.log('⏰ Enviando recordatorios de decisión de verano...');

    const startTime = Date.now();
    const anio = new Date().getFullYear();

    try {
      // Buscar estudiantes con suscripción activa pero sin decisión o PENDIENTE
      const estudiantesActivos =
        await this.prisma.inscripcionActividad.findMany({
          where: {
            estado: 'ACTIVA',
            suscripcionFamiliar: {
              estado: {
                in: [
                  EstadoSuscripcionFamiliar.AUTHORIZED,
                  EstadoSuscripcionFamiliar.CONTINUIDAD,
                ],
              },
            },
          },
          include: {
            estudiante: {
              include: {
                tutor: true,
              },
            },
          },
          distinct: ['estudianteId'],
        });

      // Filtrar los que no tienen decisión o tienen PENDIENTE
      const tutoresParaNotificar = new Set<string>();

      for (const inscripcion of estudiantesActivos) {
        const decision = await this.prisma.decisionVeranoEstudiante.findUnique({
          where: {
            estudianteId_anio: {
              estudianteId: inscripcion.estudianteId,
              anio,
            },
          },
        });

        if (!decision || decision.decision === DecisionVerano.PENDIENTE) {
          const tutorId = inscripcion.estudiante.tutor?.id;
          if (tutorId) {
            tutoresParaNotificar.add(tutorId);
          }
        }
      }

      const fechaLimite = new Date(
        anio,
        PERIODO_DECISION.MES_FIN - 1,
        PERIODO_DECISION.DIA_FIN,
      );
      const diasRestantes = Math.ceil(
        (fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      // Crear notificaciones de recordatorio
      for (const tutorId of tutoresParaNotificar) {
        await this.prisma.notificacion.create({
          data: {
            tutorId: tutorId,
            titulo: '⚠️ Recordatorio: Decisión de Verano',
            mensaje: `Aún no elegiste la modalidad de verano para alguno de tus hijos. Quedan ${diasRestantes} días para decidir. Si no elegís, se dará de baja automáticamente.`,
            tipo: TipoNotificacion.TUTOR_RECORDATORIO,
            leida: false,
            metadata: {
              tipo: 'recordatorio_verano',
              anio,
              diasRestantes,
            },
          },
        });
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Recordatorios enviados a ${tutoresParaNotificar.size} tutores en ${duration}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en recordatorios: ${message}`);
    }
  }

  /**
   * Procesar bajas automáticas
   * Se ejecuta el 6 de diciembre a las 00:05 (después del deadline)
   */
  @Cron('5 0 6 12 *') // 6 de diciembre a las 00:05
  async procesarBajasAutomaticas(): Promise<void> {
    this.logger.log('🔴 Procesando bajas automáticas de verano...');

    const startTime = Date.now();
    const anio = new Date().getFullYear();

    try {
      // Buscar estudiantes sin decisión o con PENDIENTE
      const estudiantesActivos =
        await this.prisma.inscripcionActividad.findMany({
          where: {
            estado: 'ACTIVA',
            suscripcionFamiliar: {
              estado: {
                in: [
                  EstadoSuscripcionFamiliar.AUTHORIZED,
                  EstadoSuscripcionFamiliar.CONTINUIDAD,
                ],
              },
            },
          },
          select: {
            estudianteId: true,
            suscripcionFamiliarId: true,
          },
          distinct: ['estudianteId'],
        });

      const estudiantesDadosDeBaja: string[] = [];

      await this.prisma.$transaction(async (tx) => {
        for (const inscripcion of estudiantesActivos) {
          const decision = await tx.decisionVeranoEstudiante.findUnique({
            where: {
              estudianteId_anio: {
                estudianteId: inscripcion.estudianteId,
                anio,
              },
            },
          });

          // Si no tiene decisión o está PENDIENTE, dar de baja
          if (!decision || decision.decision === DecisionVerano.PENDIENTE) {
            // Cancelar inscripciones
            await tx.inscripcionActividad.updateMany({
              where: { estudianteId: inscripcion.estudianteId },
              data: { estado: 'CANCELADA' },
            });

            estudiantesDadosDeBaja.push(inscripcion.estudianteId);

            // Obtener info del estudiante para notificación
            const estudiante = await tx.estudiante.findUnique({
              where: { id: inscripcion.estudianteId },
              include: { tutor: true },
            });

            if (estudiante?.tutor?.id) {
              await tx.notificacion.create({
                data: {
                  tutorId: estudiante.tutor.id,
                  titulo: '❌ Baja por no respuesta',
                  mensaje: `${estudiante.nombre} ${estudiante.apellido} fue dado/a de baja por no responder en el período de decisión de verano. Perdió su cupo para marzo.`,
                  tipo: TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
                  leida: false,
                  metadata: {
                    tipo: 'baja_automatica_verano',
                    estudianteId: estudiante.id,
                    anio,
                  },
                },
              });
            }
          }
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Bajas procesadas: ${estudiantesDadosDeBaja.length} estudiantes en ${duration}ms`,
      );

      if (estudiantesDadosDeBaja.length > 0) {
        this.logger.warn(
          `⚠️ Estudiantes dados de baja: ${estudiantesDadosDeBaja.join(', ')}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en bajas automáticas: ${message}`);
    }
  }

  /**
   * Restaurar suscripciones a montos normales
   * Se ejecuta el 1 de marzo a las 00:05
   */
  @Cron('5 0 1 3 *') // 1 de marzo a las 00:05
  async restaurarSuscripciones(): Promise<void> {
    this.logger.log('🔄 Restaurando suscripciones a montos normales...');

    const startTime = Date.now();

    try {
      // Buscar suscripciones con monto original guardado
      const suscripciones = await this.prisma.suscripcionFamiliar.findMany({
        where: {
          montoOriginal: { not: null },
          estado: {
            in: [
              EstadoSuscripcionFamiliar.AUTHORIZED,
              EstadoSuscripcionFamiliar.CONTINUIDAD,
            ],
          },
        },
        include: {
          tutor: true,
        },
      });

      await this.prisma.$transaction(async (tx) => {
        for (const sub of suscripciones) {
          await tx.suscripcionFamiliar.update({
            where: { id: sub.id },
            data: {
              montoMensual: sub.montoOriginal!,
              montoOriginal: null,
              estado: EstadoSuscripcionFamiliar.AUTHORIZED,
            },
          });

          // Notificar al tutor
          if (sub.tutor?.id) {
            await tx.notificacion.create({
              data: {
                tutorId: sub.tutor.id,
                titulo: '🎓 Bienvenidos a marzo',
                mensaje: `Tu suscripción fue restaurada al monto normal de $${sub.montoOriginal!.toLocaleString()}/mes. ¡Comienza un nuevo ciclo!`,
                tipo: TipoNotificacion.TUTOR_SUSCRIPCION_RENOVADA,
                leida: false,
                metadata: {
                  tipo: 'restauracion_suscripcion',
                  montoRestaurado: sub.montoOriginal,
                },
              },
            });
          }
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Suscripciones restauradas: ${suscripciones.length} en ${duration}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en restauración: ${message}`);
    }
  }
}
