import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Módulo de Eventos - Sistema de Calendario Completo
 *
 * Gestiona el sistema de calendario del docente con tipos de eventos:
 * - CLASE: Referencias a clases para reprogramación
 * - TAREA: Sistema robusto de tareas con subtareas, archivos, recurrencia
 * - RECORDATORIO: Recordatorios simples
 * - NOTA: Notas de texto largo
 *
 * Características:
 * - CRUD completo para cada tipo de evento
 * - Vista Agenda (agrupada por días)
 * - Vista Semana (grid semanal)
 * - Filtrado avanzado y búsqueda
 * - Drag & Drop support
 * - Estadísticas
 */
@Module({
  controllers: [EventosController],
  providers: [EventosService, PrismaService],
  exports: [EventosService],
})
export class EventosModule {}
