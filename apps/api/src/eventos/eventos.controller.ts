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
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Controlador de Eventos
 *
 * Endpoints para gestionar el calendario del docente
 *
 * Rutas:
 * - GET    /eventos                 - Lista de eventos con filtros opcionales
 * - GET    /eventos/mes/:year/:month - Eventos del mes
 * - GET    /eventos/semana          - Eventos de la semana
 * - GET    /eventos/dia             - Eventos del día
 * - GET    /eventos/estadisticas    - Estadísticas de eventos
 * - GET    /eventos/:id             - Detalle de evento
 * - POST   /eventos                 - Crear evento
 * - PATCH  /eventos/:id             - Actualizar evento
 * - DELETE /eventos/:id             - Eliminar evento
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

  /**
   * Crear un nuevo evento
   *
   * POST /eventos
   * Body: CreateEventoDto
   */
  @Post()
  async create(
    @GetUser('id') docenteId: string,
    @Body() createEventoDto: CreateEventoDto,
  ) {
    return this.eventosService.create(docenteId, createEventoDto);
  }

  /**
   * Obtener todos los eventos del docente
   * Con filtros opcionales por rango de fechas
   *
   * GET /eventos
   * Query params opcionales:
   * - fechaInicio: ISO date string
   * - fechaFin: ISO date string
   */
  @Get()
  async findAll(
    @GetUser('id') docenteId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
    const fin = fechaFin ? new Date(fechaFin) : undefined;

    return this.eventosService.findAll(docenteId, inicio, fin);
  }

  /**
   * Obtener eventos del mes
   *
   * GET /eventos/mes/:year/:month
   * Params:
   * - year: número (ej: 2025)
   * - month: número 1-12 (ej: 1 = enero)
   */
  @Get('mes/:year/:month')
  async findEventosDelMes(
    @GetUser('id') docenteId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    return this.eventosService.findEventosDelMes(docenteId, yearNum, monthNum);
  }

  /**
   * Obtener eventos de la semana
   *
   * GET /eventos/semana
   * Query params:
   * - fecha: ISO date string (cualquier día de la semana deseada)
   * Si no se provee, usa la semana actual
   */
  @Get('semana')
  async findEventosDeLaSemana(
    @GetUser('id') docenteId: string,
    @Query('fecha') fecha?: string,
  ) {
    const fechaBase = fecha ? new Date(fecha) : new Date();
    return this.eventosService.findEventosDeLaSemana(docenteId, fechaBase);
  }

  /**
   * Obtener eventos del día
   *
   * GET /eventos/dia
   * Query params:
   * - fecha: ISO date string
   * Si no se provee, usa el día actual
   */
  @Get('dia')
  async findEventosDelDia(
    @GetUser('id') docenteId: string,
    @Query('fecha') fecha?: string,
  ) {
    const fechaBase = fecha ? new Date(fecha) : new Date();
    return this.eventosService.findEventosDelDia(docenteId, fechaBase);
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
  async findOne(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
  ) {
    return this.eventosService.findOne(id, docenteId);
  }

  /**
   * Actualizar un evento
   *
   * PATCH /eventos/:id
   * Body: UpdateEventoDto
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
    @Body() updateEventoDto: UpdateEventoDto,
  ) {
    return this.eventosService.update(id, docenteId, updateEventoDto);
  }

  /**
   * Eliminar un evento
   *
   * DELETE /eventos/:id
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
  ) {
    await this.eventosService.remove(id, docenteId);
    return { message: 'Evento eliminado correctamente' };
  }
}
