import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { CreateLeccionDto } from './dto/create-leccion.dto';
import { UpdateLeccionDto } from './dto/update-leccion.dto';
import { CompletarLeccionDto } from './dto/completar-leccion.dto';
import {
  ReordenarModulosDto,
  ReordenarLeccionesDto,
} from './dto/reordenar.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';

/**
 * Controller para gestionar cursos, módulos y lecciones
 *
 * Endpoints divididos por funcionalidad:
 * - ADMIN: CRUD de módulos y lecciones
 * - ESTUDIANTE: Ver contenido y completar lecciones
 * - PÚBLICO: Ver estructura del curso (si está publicado)
 */
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  // ============================================================================
  // MÓDULOS - Admin
  // ============================================================================

  /**
   * POST /cursos/productos/:productoId/modulos
   * Crear un nuevo módulo en un curso
   * Solo admin puede crear contenido
   */
  @Post('productos/:productoId/modulos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createModulo(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Body() createModuloDto: CreateModuloDto,
  ) {
    return this.cursosService.createModulo(productoId, createModuloDto);
  }

  /**
   * GET /cursos/productos/:productoId/modulos
   * Obtener todos los módulos de un curso
   * Público (para que estudiantes puedan ver estructura)
   */
  @Get('productos/:productoId/modulos')
  findModulosByProducto(
    @Param('productoId', ParseUUIDPipe) productoId: string,
  ) {
    return this.cursosService.findModulosByProducto(productoId);
  }

  /**
   * GET /cursos/modulos/:id
   * Obtener un módulo específico con sus lecciones
   */
  @Get('modulos/:id')
  findOneModulo(@Param('id', ParseUUIDPipe) id: string) {
    return this.cursosService.findOneModulo(id);
  }

  /**
   * PATCH /cursos/modulos/:id
   * Actualizar un módulo
   * Solo admin
   */
  @Patch('modulos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateModulo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuloDto: UpdateModuloDto,
  ) {
    return this.cursosService.updateModulo(id, updateModuloDto);
  }

  /**
   * DELETE /cursos/modulos/:id
   * Eliminar un módulo (y sus lecciones)
   * Solo admin
   */
  @Delete('modulos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeModulo(@Param('id', ParseUUIDPipe) id: string) {
    return this.cursosService.removeModulo(id);
  }

  /**
   * POST /cursos/productos/:productoId/modulos/reordenar
   * Reordenar módulos
   * Body: { orden: ['id1', 'id2', 'id3'] }
   * Solo admin
   */
  @Post('productos/:productoId/modulos/reordenar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reordenarModulos(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @Body() dto: ReordenarModulosDto,
  ) {
    return this.cursosService.reordenarModulos(productoId, dto.orden);
  }

  // ============================================================================
  // LECCIONES - Admin
  // ============================================================================

  /**
   * POST /cursos/modulos/:moduloId/lecciones
   * Crear una nueva lección en un módulo
   * Solo admin
   */
  @Post('modulos/:moduloId/lecciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createLeccion(
    @Param('moduloId', ParseUUIDPipe) moduloId: string,
    @Body() createLeccionDto: CreateLeccionDto,
  ) {
    return this.cursosService.createLeccion(moduloId, createLeccionDto);
  }

  /**
   * GET /cursos/modulos/:moduloId/lecciones
   * Obtener todas las lecciones de un módulo
   * Público (para estudiantes)
   */
  @Get('modulos/:moduloId/lecciones')
  findLeccionesByModulo(@Param('moduloId', ParseUUIDPipe) moduloId: string) {
    return this.cursosService.findLeccionesByModulo(moduloId);
  }

  /**
   * GET /cursos/lecciones/:id
   * Obtener una lección específica con todo su contenido
   * Requiere autenticación (estudiante inscrito)
   */
  @Get('lecciones/:id')
  @UseGuards(JwtAuthGuard)
  findOneLeccion(@Param('id', ParseUUIDPipe) id: string) {
    return this.cursosService.findOneLeccion(id);
  }

  /**
   * PATCH /cursos/lecciones/:id
   * Actualizar una lección
   * Solo admin
   */
  @Patch('lecciones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateLeccion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeccionDto: UpdateLeccionDto,
  ) {
    return this.cursosService.updateLeccion(id, updateLeccionDto);
  }

  /**
   * DELETE /cursos/lecciones/:id
   * Eliminar una lección
   * Solo admin
   */
  @Delete('lecciones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeLeccion(@Param('id', ParseUUIDPipe) id: string) {
    return this.cursosService.removeLeccion(id);
  }

  /**
   * POST /cursos/modulos/:moduloId/lecciones/reordenar
   * Reordenar lecciones de un módulo
   * Body: { orden: ['id1', 'id2', 'id3'] }
   * Solo admin
   */
  @Post('modulos/:moduloId/lecciones/reordenar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reordenarLecciones(
    @Param('moduloId', ParseUUIDPipe) moduloId: string,
    @Body() dto: ReordenarLeccionesDto,
  ) {
    return this.cursosService.reordenarLecciones(moduloId, dto.orden);
  }

  // ============================================================================
  // PROGRESO - Estudiante
  // ============================================================================

  /**
   * POST /cursos/lecciones/:id/completar
   * Completar una lección (estudiante)
   * Implementa gamificación: otorga puntos y desbloquea logros
   */
  @Post('lecciones/:id/completar')
  @UseGuards(JwtAuthGuard)
  completarLeccion(
    @Param('id', ParseUUIDPipe) leccionId: string,
    @GetUser() user: AuthUser,
    @Body() completarDto: CompletarLeccionDto,
  ) {
    return this.cursosService.completarLeccion(
      leccionId,
      user.id,
      completarDto,
    );
  }

  /**
   * GET /cursos/productos/:productoId/progreso
   * Obtener progreso del estudiante en un curso
   * Learning Analytics: porcentajes, lecciones completadas, etc.
   */
  @Get('productos/:productoId/progreso')
  @UseGuards(JwtAuthGuard)
  getProgresoCurso(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.cursosService.getProgresoCurso(productoId, user.id);
  }

  /**
   * GET /cursos/productos/:productoId/siguiente-leccion
   * Obtener la siguiente lección disponible
   * Implementa Progressive Disclosure
   */
  @Get('productos/:productoId/siguiente-leccion')
  @UseGuards(JwtAuthGuard)
  getSiguienteLeccion(
    @Param('productoId', ParseUUIDPipe) productoId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.cursosService.getSiguienteLeccion(productoId, user.id);
  }
}
