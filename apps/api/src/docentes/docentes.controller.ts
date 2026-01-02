import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { DocentesService } from './docentes.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { ReasignarClasesDto } from './dto/reasignar-clases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/interfaces';

/**
 * Controller para endpoints de docentes
 * Define las rutas HTTP para operaciones CRUD
 * Incluye endpoints para Admin y para Docentes (self-service)
 */
@Controller('docentes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  /**
   * POST /docentes - Crear nuevo docente (Admin only)
   * @param createDto - Datos del docente
   * @returns Docente creado
   */
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CreateDocenteDto) {
    return this.docentesService.create(createDto);
  }

  /**
   * GET /docentes - Listar todos los docentes (Admin only)
   * @returns Lista de docentes
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.docentesService.findAll();
  }

  /**
   * GET /docentes/me/dashboard - Obtener dashboard del docente autenticado
   * DEBE ir ANTES de GET /docentes/me para evitar conflictos de rutas
   * @param user - Usuario autenticado (del JWT)
   * @returns Dashboard con clase inminente, alertas y stats
   */
  @Get('me/dashboard')
  @Roles(Role.DOCENTE)
  async getDashboard(@GetUser() user: AuthUser) {
    return this.docentesService.getDashboard(user.id);
  }

  /**
   * GET /docentes/me/estadisticas-completas - Obtener estadísticas detalladas
   * Para la página de Observaciones del portal docente
   * Incluye: top estudiantes por puntos, asistencia perfecta, faltas, ranking de grupos, etc.
   * @param user - Usuario autenticado (del JWT)
   * @returns Estadísticas completas y detalladas
   */
  @Get('me/estadisticas-completas')
  @Roles(Role.DOCENTE)
  async getEstadisticasCompletas(@GetUser() user: AuthUser) {
    return this.docentesService.getEstadisticasCompletas(user.id);
  }

  /**
   * GET /docentes/me/clases-del-mes - Obtener clases del mes para el calendario
   * @param user - Usuario autenticado (del JWT)
   * @param mes - Mes (1-12), por defecto mes actual
   * @param anio - Año (ej: 2025), por defecto año actual
   * @returns Clases del mes con stats
   */
  @Get('me/clases-del-mes')
  @Roles(Role.DOCENTE)
  async getClasesDelMes(
    @GetUser() user: AuthUser,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const now = new Date();
    const mesNum = mes ? parseInt(mes, 10) : now.getMonth() + 1;
    const anioNum = anio ? parseInt(anio, 10) : now.getFullYear();
    return this.docentesService.getClasesDelMes(user.id, mesNum, anioNum);
  }

  /**
   * GET /docentes/me - Obtener perfil del docente autenticado
   * @param user - Usuario autenticado (del JWT)
   * @returns Perfil del docente
   */
  @Get('me')
  @Roles(Role.DOCENTE)
  async getProfile(@GetUser() user: AuthUser) {
    return this.docentesService.findById(user.id);
  }

  /**
   * PATCH /docentes/me - Actualizar perfil del docente autenticado
   * @param user - Usuario autenticado
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado
   */
  @Patch('me')
  @Roles(Role.DOCENTE)
  async updateProfile(
    @GetUser() user: AuthUser,
    @Body() updateDto: UpdateDocenteDto,
  ) {
    return this.docentesService.update(user.id, updateDto);
  }

  /**
   * GET /docentes/:id - Obtener un docente específico (Admin only)
   * @param id - ID del docente
   * @returns Docente encontrado
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id', ParseIdPipe) id: string) {
    return this.docentesService.findById(id);
  }

  /**
   * PATCH /docentes/:id - Actualizar un docente (Admin only)
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIdPipe) id: string,
    @Body() updateDto: UpdateDocenteDto,
  ) {
    return this.docentesService.update(id, updateDto);
  }

  /**
   * POST /docentes/:id/reasignar-clases - Reasignar clases a otro docente (Admin only)
   * @param id - ID del docente actual (desde)
   * @param dto - { toDocenteId: string } - ID del nuevo docente (hacia)
   * @returns Cantidad de clases reasignadas
   */
  @Post(':id/reasignar-clases')
  @Roles(Role.ADMIN)
  async reasignarClases(
    @Param('id', ParseIdPipe) fromDocenteId: string,
    @Body() dto: ReasignarClasesDto,
  ) {
    return this.docentesService.reasignarClases(fromDocenteId, dto.toDocenteId);
  }

  /**
   * DELETE /docentes/:id - Eliminar un docente (Admin only)
   * Solo permite eliminar si no tiene clases asignadas
   * @param id - ID del docente
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIdPipe) id: string) {
    return this.docentesService.remove(id);
  }
}
