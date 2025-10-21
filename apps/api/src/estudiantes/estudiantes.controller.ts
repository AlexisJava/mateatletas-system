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
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { EstudianteOwnershipGuard } from './guards/estudiante-ownership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types';

/**
 * Controller para endpoints de estudiantes
 * Define las rutas HTTP para operaciones CRUD
 * Todas las rutas requieren autenticación JWT
 */
@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  /**
   * POST /estudiantes - Crear nuevo estudiante
   * @param createDto - Datos del estudiante
   * @param user - Usuario autenticado (del JWT)
   * @returns Estudiante creado
   */
  @Post()
  async create(@Body() createDto: CreateEstudianteDto, @GetUser() user: AuthUser) {
    return this.estudiantesService.create(user.id, createDto);
  }

  /**
   * GET /estudiantes/admin/all - Listar TODOS los estudiantes (solo admin)
   * @returns Lista completa de estudiantes
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async findAllForAdmin() {
    return this.estudiantesService.findAll();
  }

  /**
   * GET /estudiantes - Listar estudiantes del tutor autenticado
   * @param query - Filtros y paginación
   * @param user - Usuario autenticado
   * @returns Lista de estudiantes con metadata
   */
  @Get()
  async findAll(@Query() query: QueryEstudiantesDto, @GetUser() user: AuthUser) {
    return this.estudiantesService.findAllByTutor(user.id, query);
  }

  /**
   * GET /estudiantes/count - Contar estudiantes del tutor
   * @param user - Usuario autenticado
   * @returns Total de estudiantes
   */
  @Get('count')
  async count(@GetUser() user: AuthUser) {
    const count = await this.estudiantesService.countByTutor(user.id);
    return { count };
  }

  /**
   * GET /estudiantes/estadisticas - Estadísticas de estudiantes
   * @param user - Usuario autenticado
   * @returns Estadísticas agregadas
   */
  @Get('estadisticas')
  async getEstadisticas(@GetUser() user: AuthUser) {
    return this.estudiantesService.getEstadisticas(user.id);
  }

  /**
   * GET /estudiantes/:id/detalle-completo - Obtener detalle COMPLETO del estudiante
   * Para el portal de tutores - pestaña "Mis Hijos"
   * Incluye: gamificación, asistencias, inscripciones, estadísticas
   * @param id - ID del estudiante
   * @param user - Usuario autenticado (tutor)
   * @returns Detalle completo del estudiante con todas sus métricas
   */
  @Get(':id/detalle-completo')
  @UseGuards(EstudianteOwnershipGuard)
  async getDetalleCompleto(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.estudiantesService.getDetalleCompleto(id, user.id);
  }

  /**
   * GET /estudiantes/:id - Obtener un estudiante específico
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Estudiante con sus relaciones
   */
  @Get(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async findOne(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.estudiantesService.findOne(id, user.id);
  }

  /**
   * PATCH /estudiantes/:id - Actualizar estudiante
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param updateDto - Datos a actualizar
   * @param user - Usuario autenticado
   * @returns Estudiante actualizado
   */
  @Patch(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstudianteDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.update(id, user.id, updateDto);
  }

  /**
   * PATCH /estudiantes/:id/avatar - Actualizar avatar del estudiante
   *
   * SECURITY FIX (2025-10-18):
   * - Agregado EstudianteOwnershipGuard para prevenir modificación no autorizada
   * - Solo el tutor dueño del estudiante puede actualizar el avatar
   * - Previene CVE-INTERNAL-001: Unauthorized avatar modification
   *
   * @param id - ID del estudiante
   * @param body - { avatar_url: string }
   * @param user - Usuario autenticado (inyectado por JwtAuthGuard, usado por EstudianteOwnershipGuard)
   * @returns Estudiante actualizado con nuevo avatar
   * @throws {ForbiddenException} Si el tutor no es dueño del estudiante
   * @throws {NotFoundException} Si el estudiante no existe
   */
  @Patch(':id/avatar')
  @UseGuards(EstudianteOwnershipGuard)
  async updateAvatar(
    @Param('id') id: string,
    @Body() body: { avatar_url: string },
    @GetUser() user: AuthUser,
  ) {
    // Nota: No necesitamos usar 'user' aquí porque el guard ya validó ownership
    // El guard se ejecuta ANTES de este método y rechaza requests no autorizados
    return this.estudiantesService.updateAvatar(id, body.avatar_url);
  }

  /**
   * DELETE /estudiantes/:id - Eliminar estudiante
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async remove(@Param('id') id: string, @GetUser() user: AuthUser) {
    await this.estudiantesService.remove(id, user.id);
    return {
      message: 'Estudiante eliminado exitosamente',
    };
  }
}
