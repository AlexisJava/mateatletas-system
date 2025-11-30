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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role } from '../../domain/constants/roles.constants';
import { CrearCursoDto } from '../dto/crear-curso.dto';
import { ActualizarCursoDto } from '../dto/actualizar-curso.dto';
import { CrearCursoService } from '../services/cursos/crear-curso.service';
import { ObtenerCursoService } from '../services/cursos/obtener-curso.service';
import {
  ListarCursosService,
  ListarCursosFiltros,
} from '../services/cursos/listar-cursos.service';
import { ActualizarCursoService } from '../services/cursos/actualizar-curso.service';
import { EliminarCursoService } from '../services/cursos/eliminar-curso.service';
import {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  EstadoCursoStudio,
} from '../interfaces';

/**
 * Controlador de cursos de Studio
 * Endpoints para CRUD de cursos
 */
@ApiTags('Studio - Cursos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('studio/cursos')
export class CursosController {
  constructor(
    private readonly crearCursoService: CrearCursoService,
    private readonly obtenerCursoService: ObtenerCursoService,
    private readonly listarCursosService: ListarCursosService,
    private readonly actualizarCursoService: ActualizarCursoService,
    private readonly eliminarCursoService: EliminarCursoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo curso desde wizard' })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crear(@Body() dto: CrearCursoDto) {
    return this.crearCursoService.ejecutar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos con filtros opcionales' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoCursoStudio })
  @ApiQuery({ name: 'categoria', required: false, enum: CategoriaStudio })
  @ApiQuery({ name: 'mundo', required: false, enum: MundoTipo })
  @ApiQuery({ name: 'casa', required: false, enum: CasaTipo })
  @ApiResponse({ status: 200, description: 'Lista de cursos' })
  async listar(
    @Query('estado') estado?: EstadoCursoStudio,
    @Query('categoria') categoria?: CategoriaStudio,
    @Query('mundo') mundo?: MundoTipo,
    @Query('casa') casa?: CasaTipo,
  ) {
    const filtros: ListarCursosFiltros = {};
    if (estado) filtros.estado = estado;
    if (categoria) filtros.categoria = categoria;
    if (mundo) filtros.mundo = mundo;
    if (casa) filtros.casa = casa;

    return this.listarCursosService.ejecutar(filtros);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener conteo de cursos por estado' })
  @ApiResponse({ status: 200, description: 'Estadísticas de cursos' })
  async estadisticas() {
    return this.listarCursosService.contarPorEstado();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener curso completo por ID' })
  @ApiResponse({ status: 200, description: 'Curso encontrado' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async obtener(@Param('id') id: string) {
    return this.obtenerCursoService.ejecutar(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar curso' })
  @ApiResponse({ status: 200, description: 'Curso actualizado' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarCursoDto) {
    return this.actualizarCursoService.ejecutar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar curso (solo DRAFT)' })
  @ApiResponse({ status: 204, description: 'Curso eliminado' })
  @ApiResponse({ status: 400, description: 'Curso no está en estado DRAFT' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado' })
  async eliminar(@Param('id') id: string) {
    await this.eliminarCursoService.ejecutar(id);
  }
}
