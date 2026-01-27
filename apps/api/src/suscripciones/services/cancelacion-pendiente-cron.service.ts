/**
 * ============================================================================
 * CANCELACIÓN PENDIENTE CRON SERVICE - FASE 8.1
 * ============================================================================
 *
 * Spec: docs/specs/SPEC_FASE_8_MERCADOPAGO.md
 *
 * Procesa cancelaciones que pasaron las 24hs de arrepentimiento:
 * - Busca suscripciones en estado PENDIENTE_CANCELACION
 * - Si fechaSolicitudCancelacion > 24hs, confirma la cancelación
 * - Ejecuta borrado total del progreso de estudiantes
 *
 * Se ejecuta cada hora para detectar cancelaciones expiradas.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoSuscripcionFamiliar } from '@prisma/client';
import { SuscripcionFamiliarCommandService } from './suscripcion-familiar-command.service';

/** Horas de arrepentimiento antes de confirmar cancelación */
const HORAS_ARREPENTIMIENTO = 24;

@Injectable()
export class CancelacionPendienteCronService {
  private readonly logger = new Logger(CancelacionPendienteCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commandService: SuscripcionFamiliarCommandService,
  ) {}

  /**
   * Procesa cancelaciones pendientes que expiraron (> 24hs)
   *
   * Se ejecuta cada hora, minuto 5 (para evitar conflictos con otros cron)
   * Ejemplo: 00:05, 01:05, 02:05, etc.
   */
  @Cron('5 * * * *') // Cada hora, minuto 5
  async procesarCancelacionesExpiradas(): Promise<void> {
    this.logger.log('🔍 Buscando cancelaciones pendientes expiradas...');

    const startTime = Date.now();

    try {
      // Calcular fecha límite (24hs atrás)
      const fechaLimite = new Date();
      fechaLimite.setHours(fechaLimite.getHours() - HORAS_ARREPENTIMIENTO);

      // Buscar suscripciones en PENDIENTE_CANCELACION con fecha > 24hs
      const cancelacionesExpiradas =
        await this.prisma.suscripcionFamiliar.findMany({
          where: {
            estado: EstadoSuscripcionFamiliar.PENDIENTE_CANCELACION,
            fechaSolicitudCancelacion: {
              lt: fechaLimite, // Fecha solicitud anterior al límite = expirada
            },
          },
          select: {
            id: true,
            tutorId: true,
            fechaSolicitudCancelacion: true,
            motivoCancelacion: true,
            tutor: {
              select: { email: true },
            },
          },
        });

      if (cancelacionesExpiradas.length === 0) {
        this.logger.debug('No hay cancelaciones pendientes expiradas');
        return;
      }

      this.logger.log(
        `📋 Encontradas ${cancelacionesExpiradas.length} cancelaciones expiradas`,
      );

      let exitosas = 0;
      let fallidas = 0;

      // Procesar cada cancelación expirada
      for (const suscripcion of cancelacionesExpiradas) {
        try {
          const horasTranscurridas = suscripcion.fechaSolicitudCancelacion
            ? (Date.now() - suscripcion.fechaSolicitudCancelacion.getTime()) /
              (1000 * 60 * 60)
            : 0;

          this.logger.log(
            `⏳ Procesando ${suscripcion.id} (${horasTranscurridas.toFixed(1)}hs desde solicitud)`,
          );

          // Confirmar cancelación y ejecutar borrado total
          const resultado = await this.commandService.confirmarCancelacion({
            suscripcionFamiliarId: suscripcion.id,
          });

          this.logger.log(
            `✅ Cancelación confirmada: ${suscripcion.id}. Estudiantes borrados: ${resultado.estudiantesBorrados.join(', ')}`,
          );

          // TODO: Emitir evento para enviar email de confirmación de cancelación
          // await this.emailService.enviarCancelacionConfirmada(suscripcion.tutor.email, resultado.estudiantesBorrados);

          exitosas++;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `❌ Error confirmando cancelación ${suscripcion.id}: ${message}`,
          );
          fallidas++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `🏁 Proceso finalizado en ${duration}ms. Exitosas: ${exitosas}, Fallidas: ${fallidas}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en cron de cancelaciones: ${message}`);
    }
  }

  /**
   * Envía recordatorio de 12hs antes de confirmar cancelación
   *
   * Se ejecuta cada 30 minutos para enviar recordatorios a tutores
   * que están a punto de perder su ventana de arrepentimiento.
   */
  @Cron('15,45 * * * *') // Cada hora, minutos 15 y 45
  async enviarRecordatorios12hs(): Promise<void> {
    this.logger.debug(
      '🔔 Verificando cancelaciones para recordatorio de 12hs...',
    );

    try {
      // Calcular ventana: entre 11 y 13 horas (para capturar justo las de 12hs)
      const hace11hs = new Date();
      hace11hs.setHours(hace11hs.getHours() - 11);

      const hace13hs = new Date();
      hace13hs.setHours(hace13hs.getHours() - 13);

      // Buscar suscripciones que van por las ~12hs
      const cancelacionesProximas =
        await this.prisma.suscripcionFamiliar.findMany({
          where: {
            estado: EstadoSuscripcionFamiliar.PENDIENTE_CANCELACION,
            fechaSolicitudCancelacion: {
              gte: hace13hs, // No más de 13hs
              lt: hace11hs, // Al menos 11hs
            },
          },
          include: {
            tutor: {
              select: {
                id: true,
                email: true,
              },
            },
            inscripciones: {
              where: { estado: 'ACTIVA' },
              include: {
                estudiante: {
                  select: { nombre: true, apellido: true },
                },
              },
            },
          },
        });

      if (cancelacionesProximas.length === 0) {
        return;
      }

      this.logger.log(
        `🔔 Enviando recordatorios de 12hs a ${cancelacionesProximas.length} tutores`,
      );

      for (const suscripcion of cancelacionesProximas) {
        // Verificar si ya se envió recordatorio (usando metadata o campo separado)
        // Por simplicidad, creamos notificación in-app
        const estudiantesNombres = suscripcion.inscripciones
          .map((i) => `${i.estudiante.nombre} ${i.estudiante.apellido}`)
          .join(', ');

        await this.prisma.notificacion.create({
          data: {
            tutorId: suscripcion.tutor.id,
            titulo: '⚠️ Te quedan 12hs para arrepentirte',
            mensaje: `Tu solicitud de cancelación se confirmará en 12 horas. Si no revertís, se eliminará TODO el progreso de ${estudiantesNombres}.`,
            tipo: 'TUTOR_SUSCRIPCION_RENOVADA', // Usar tipo existente
            leida: false,
            metadata: {
              tipo: 'recordatorio_arrepentimiento_12hs',
              suscripcionId: suscripcion.id,
              fechaLimiteCancelacion: new Date(
                suscripcion.fechaSolicitudCancelacion!.getTime() +
                  HORAS_ARREPENTIMIENTO * 60 * 60 * 1000,
              ).toISOString(),
            },
          },
        });

        // TODO: Enviar email
        // await this.emailService.enviarRecordatorioArrepentimiento(suscripcion.tutor.email, 12);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en recordatorios de 12hs: ${message}`);
    }
  }
}
