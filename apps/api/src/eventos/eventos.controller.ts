import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TipoEvento } from '@prisma/client';
import { EventosService } from './eventos.service';
import {
  CreateTareaDto,
  CreateRecordatorioDto,
  CreateNotaDto,
} from './dto/create-evento.dto';
import {
  UpdateTareaDto,
  UpdateRecordatorioDto,
  UpdateNotaDto,
} from './dto/update-evento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { TipoEvento } from '@prisma/client';

/**
 * Controlador de Eventos - Sistema de Calendario Completo
 *
 * Endpoints organizados por tipo de evento:
 *
 * **TAREAS:**
 * - POST   /eventos/tareas           - Crear tarea
 * - PATCH  /eventos/tareas/:id       - Actualizar tarea
 *
 * **RECORDATORIOS:**
 * - POST   /eventos/recordatorios    - Crear recordatorio
 * - PATCH  /eventos/recordatorios/:id - Actualizar recordatorio
 *
 * **NOTAS:**
 * - POST   /eventos/notas            - Crear nota
 * - PATCH  /eventos/notas/:id        - Actualizar nota
 *
 * **GENERAL:**
 * - GET    /eventos                  - Lista de todos los eventos con filtros
 * - GET    /eventos/vista-agenda     - Vista Agenda (agrupada por días)
 * - GET    /eventos/vista-semana     - Vista Semana (grid semanal)
 * - GET    /eventos/estadisticas     - Estadísticas del calendario
 * - GET    /eventos/:id              - Detalle de evento
 * - PATCH  /eventos/:id/fechas       - Actualizar fechas (Drag & Drop)
 * - DELETE /eventos/:id              - Eliminar evento
 *
 * Todos los endpoints requieren:
 * - Autenticación JWT
 * - Rol de Docente
 */
@Controller('eventos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Docente)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  // ==================== CREAR EVENTOS ====================

  /**
   * Crear una Tarea completa
   *
   * POST /eventos/tareas
   * Body: CreateTareaDto
   */
  @Post('tareas')
  async createTarea(
    @GetUser('id') docenteId: string,
    @Body() createTareaDto: CreateTareaDto,
  ) {
    return this.eventosService.createTarea(docenteId, createTareaDto);
  }

  /**
   * Crear un Recordatorio
   *
   * POST /eventos/recordatorios
   * Body: CreateRecordatorioDto
   */
  @Post('recordatorios')
  async createRecordatorio(
    @GetUser('id') docenteId: string,
    @Body() createRecordatorioDto: CreateRecordatorioDto,
  ) {
    return this.eventosService.createRecordatorio(
      docenteId,
      createRecordatorioDto,
    );
  }

  /**
   * Crear una Nota
   *
   * POST /eventos/notas
   * Body: CreateNotaDto
   */
  @Post('notas')
  async createNota(
    @GetUser('id') docenteId: string,
    @Body() createNotaDto: CreateNotaDto,
  ) {
    return this.eventosService.createNota(docenteId, createNotaDto);
  }

  // ==================== LEER EVENTOS ====================

  /**
   * Obtener todos los eventos del docente con filtros
   *
   * GET /eventos
   * Query params opcionales:
   * - fechaInicio: ISO date string
   * - fechaFin: ISO date string
   * - tipo: CLASE | TAREA | RECORDATORIO | NOTA
   * - busqueda: texto a buscar en título y descripción
   */
  @Get()
  async findAll(
    @GetUser('id') docenteId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('tipo') tipo?: TipoEvento,
    @Query('busqueda') busqueda?: string,
  ) {
    const options: {
      fechaInicio?: Date;
      fechaFin?: Date;
      tipo?: TipoEvento;
      busqueda?: string;
    } = {};

    if (fechaInicio) options.fechaInicio = new Date(fechaInicio);
    if (fechaFin) options.fechaFin = new Date(fechaFin);
    if (tipo) options.tipo = tipo;
    if (busqueda) options.busqueda = busqueda;

    return this.eventosService.findAll(docenteId, options);
  }

  /**
   * Obtener Vista Agenda (agrupada por días)
   *
   * GET /eventos/vista-agenda
   *
   * Retorna eventos agrupados:
   * {
   *   hoy: [],
   *   manana: [],
   *   proximos7Dias: [],
   *   masAdelante: []
   * }
   */
  @Get('vista-agenda')
  async getVistaAgenda(@GetUser('id') docenteId: string) {
    return this.eventosService.getVistaAgenda(docenteId);
  }

  /**
   * Obtener Vista Semana (grid semanal)
   *
   * GET /eventos/vista-semana
   * Query params:
   * - fecha: ISO date string (cualquier día de la semana deseada)
   * Si no se provee, usa la semana actual
   */
  @Get('vista-semana')
  async getVistaSemana(
    @GetUser('id') docenteId: string,
    @Query('fecha') fecha?: string,
  ) {
    const fechaBase = fecha ? new Date(fecha) : new Date();
    return this.eventosService.getVistaSemana(docenteId, fechaBase);
  }

  /**
   * Obtener estadísticas de eventos
   *
   * GET /eventos/estadisticas
   */
  @Get('estadisticas')
  async getEstadisticas(@GetUser('id') docenteId: string) {
    return this.eventosService.getEstadisticas(docenteId);
  }

  /**
   * Obtener un evento por ID
   *
   * GET /eventos/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser('id') docenteId: string) {
    return this.eventosService.findOne(id, docenteId);
  }

  // ==================== ACTUALIZAR EVENTOS ====================

  /**
   * Actualizar una Tarea
   *
   * PATCH /eventos/tareas/:id
   * Body: UpdateTareaDto
   */
  @Patch('tareas/:id')
  async updateTarea(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
    @Body() updateTareaDto: UpdateTareaDto,
  ) {
    return this.eventosService.updateTarea(id, docenteId, updateTareaDto);
  }

  /**
   * Actualizar un Recordatorio
   *
   * PATCH /eventos/recordatorios/:id
   * Body: UpdateRecordatorioDto
   */
  @Patch('recordatorios/:id')
  async updateRecordatorio(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
    @Body() updateRecordatorioDto: UpdateRecordatorioDto,
  ) {
    return this.eventosService.updateRecordatorio(
      id,
      docenteId,
      updateRecordatorioDto,
    );
  }

  /**
   * Actualizar una Nota
   *
   * PATCH /eventos/notas/:id
   * Body: UpdateNotaDto
   */
  @Patch('notas/:id')
  async updateNota(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
    @Body() updateNotaDto: UpdateNotaDto,
  ) {
    return this.eventosService.updateNota(id, docenteId, updateNotaDto);
  }

  /**
   * Actualizar fechas de un evento (para Drag & Drop)
   *
   * PATCH /eventos/:id/fechas
   * Body: { fecha_inicio: string, fecha_fin: string }
   */
  @Patch(':id/fechas')
  async updateFechas(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
    @Body() body: { fecha_inicio: string; fecha_fin: string },
  ) {
    return this.eventosService.updateFechas(
      id,
      docenteId,
      new Date(body.fecha_inicio),
      new Date(body.fecha_fin),
    );
  }

  // ==================== ELIMINAR EVENTOS ====================

  /**
   * Eliminar un evento
   *
   * DELETE /eventos/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('id') docenteId: string) {
    await this.eventosService.remove(id, docenteId);
    return { message: 'Evento eliminado correctamente' };
  }
}
