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
import { EstudianteOwnershipGuard } from './guards/estudiante-ownership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

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
  async create(
    @Body() createDto: CreateEstudianteDto,
    @GetUser() user: any,
  ) {
    return this.estudiantesService.create(user.sub, createDto);
  }

  /**
   * GET /estudiantes - Listar estudiantes del tutor autenticado
   * @param query - Filtros y paginación
   * @param user - Usuario autenticado
   * @returns Lista de estudiantes con metadata
   */
  @Get()
  async findAll(@Query() query: QueryEstudiantesDto, @GetUser() user: any) {
    return this.estudiantesService.findAllByTutor(user.sub, query);
  }

  /**
   * GET /estudiantes/count - Contar estudiantes del tutor
   * @param user - Usuario autenticado
   * @returns Total de estudiantes
   */
  @Get('count')
  async count(@GetUser() user: any) {
    const count = await this.estudiantesService.countByTutor(user.sub);
    return { count };
  }

  /**
   * GET /estudiantes/estadisticas - Estadísticas de estudiantes
   * @param user - Usuario autenticado
   * @returns Estadísticas agregadas
   */
  @Get('estadisticas')
  async getEstadisticas(@GetUser() user: any) {
    return this.estudiantesService.getEstadisticas(user.sub);
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
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.estudiantesService.findOne(id, user.sub);
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
    @GetUser() user: any,
  ) {
    return this.estudiantesService.update(id, user.sub, updateDto);
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
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.estudiantesService.remove(id, user.sub);
    return {
      message: 'Estudiante eliminado exitosamente',
    };
  }
}
