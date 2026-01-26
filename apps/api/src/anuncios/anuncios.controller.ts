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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';
import { ParseIdPipe } from '../common/pipes';
import { AnunciosService } from './anuncios.service';
import { CrearAnuncioDto } from './dto/crear-anuncio.dto';
import { ActualizarAnuncioDto } from './dto/actualizar-anuncio.dto';

/**
 * Controller para operaciones CRUD de anuncios (solo docentes)
 * Ruta base: /docentes/me/anuncios
 */
@ApiTags('Anuncios - Docente')
@ApiBearerAuth()
@Controller('docentes/me/anuncios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCENTE)
export class AnunciosDocenteController {
  constructor(private readonly anunciosService: AnunciosService) {}

  /**
   * POST /docentes/me/anuncios - Crear un nuevo anuncio
   */
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo anuncio' })
  @ApiResponse({ status: 201, description: 'Anuncio creado exitosamente' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permiso para esta comisión',
  })
  async crearAnuncio(@GetUser() user: AuthUser, @Body() dto: CrearAnuncioDto) {
    return this.anunciosService.crearAnuncio(user.id, dto);
  }

  /**
   * GET /docentes/me/anuncios - Listar mis anuncios
   */
  @Get()
  @ApiOperation({ summary: 'Listar mis anuncios' })
  @ApiResponse({ status: 200, description: 'Lista de anuncios del docente' })
  async listarAnuncios(
    @GetUser() user: AuthUser,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    const incluir = incluirInactivos === 'true';
    return this.anunciosService.listarAnunciosDocente(user.id, incluir);
  }

  /**
   * GET /docentes/me/anuncios/:id - Obtener un anuncio específico
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un anuncio específico' })
  @ApiResponse({ status: 200, description: 'Detalles del anuncio' })
  @ApiResponse({ status: 404, description: 'Anuncio no encontrado' })
  async obtenerAnuncio(
    @GetUser() user: AuthUser,
    @Param('id', ParseIdPipe) id: string,
  ) {
    return this.anunciosService.obtenerAnuncioDocente(id, user.id);
  }

  /**
   * PATCH /docentes/me/anuncios/:id - Actualizar un anuncio
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un anuncio' })
  @ApiResponse({ status: 200, description: 'Anuncio actualizado' })
  @ApiResponse({ status: 404, description: 'Anuncio no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permiso para este anuncio',
  })
  async actualizarAnuncio(
    @GetUser() user: AuthUser,
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: ActualizarAnuncioDto,
  ) {
    return this.anunciosService.actualizarAnuncio(id, user.id, dto);
  }

  /**
   * DELETE /docentes/me/anuncios/:id - Eliminar un anuncio
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un anuncio' })
  @ApiResponse({ status: 200, description: 'Anuncio eliminado' })
  @ApiResponse({ status: 404, description: 'Anuncio no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permiso para este anuncio',
  })
  async eliminarAnuncio(
    @GetUser() user: AuthUser,
    @Param('id', ParseIdPipe) id: string,
  ) {
    return this.anunciosService.eliminarAnuncio(id, user.id);
  }
}

/**
 * Controller para lectura de anuncios (tutores)
 * Ruta base: /tutor/anuncios
 */
@ApiTags('Anuncios - Tutor')
@ApiBearerAuth()
@Controller('tutor/anuncios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TUTOR)
export class AnunciosTutorController {
  constructor(private readonly anunciosService: AnunciosService) {}

  /**
   * GET /tutor/anuncios - Listar anuncios de docentes de mis hijos
   */
  @Get()
  @ApiOperation({ summary: 'Listar anuncios de docentes de mis hijos' })
  @ApiResponse({ status: 200, description: 'Lista de anuncios relevantes' })
  async listarAnuncios(@GetUser() user: AuthUser) {
    return this.anunciosService.listarAnunciosTutor(user.id);
  }
}

/**
 * Controller para lectura de anuncios (estudiantes)
 * Ruta base: /estudiantes/anuncios
 */
@ApiTags('Anuncios - Estudiante')
@ApiBearerAuth()
@Controller('estudiantes/anuncios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ESTUDIANTE)
export class AnunciosEstudianteController {
  constructor(private readonly anunciosService: AnunciosService) {}

  /**
   * GET /estudiantes/anuncios - Listar anuncios de mis comisiones
   */
  @Get()
  @ApiOperation({ summary: 'Listar anuncios de mis comisiones' })
  @ApiResponse({ status: 200, description: 'Lista de anuncios de mis grupos' })
  async listarAnuncios(@GetUser() user: AuthUser) {
    return this.anunciosService.listarAnunciosEstudiante(user.id);
  }
}
