import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { QueryEquiposDto } from './dto/query-equipos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controlador REST para gestionar Equipos
 * Todos los endpoints requieren autenticación JWT
 *
 * Rutas disponibles:
 * - POST /api/equipos - Crear equipo
 * - GET /api/equipos - Listar equipos con filtros
 * - GET /api/equipos/estadisticas - Obtener estadísticas generales
 * - GET /api/equipos/:id - Obtener equipo por ID
 * - PATCH /api/equipos/:id - Actualizar equipo
 * - DELETE /api/equipos/:id - Eliminar equipo
 * - POST /api/equipos/:id/recalcular-puntos - Recalcular puntos del equipo
 */
@Controller('equipos')
@UseGuards(JwtAuthGuard)
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  /**
   * Crear un nuevo equipo
   * POST /api/equipos
   *
   * Body ejemplo:
   * {
   *   "nombre": "Quantum",
   *   "color_primario": "#10B981",
   *   "color_secundario": "#34D399",
   *   "icono_url": "https://example.com/quantum.png"
   * }
   *
   * @returns Equipo creado con relaciones
   */
  @Post()
  create(@Body() createEquipoDto: CreateEquipoDto) {
    return this.equiposService.create(createEquipoDto);
  }

  /**
   * Listar todos los equipos con filtros y paginación
   * GET /api/equipos?page=1&limit=10&search=fénix&sortBy=puntos_totales&order=desc
   *
   * @returns { data: Equipo[], metadata: { total, page, limit, totalPages } }
   */
  @Get()
  findAll(@Query() query: QueryEquiposDto) {
    return this.equiposService.findAll(query);
  }

  /**
   * Obtener estadísticas generales de equipos
   * GET /api/equipos/estadisticas
   *
   * IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar que
   * "estadisticas" sea interpretado como un ID
   *
   * @returns {
   *   totalEquipos: number,
   *   totalEstudiantes: number,
   *   promedioEstudiantesPorEquipo: number,
   *   ranking: Array<{ posicion, id, nombre, puntos_totales, cantidad_estudiantes }>
   * }
   */
  @Get('estadisticas')
  getEstadisticas() {
    return this.equiposService.getEstadisticas();
  }

  /**
   * Obtener un equipo por ID con sus estudiantes
   * GET /api/equipos/:id
   *
   * @param id - ID del equipo (CUID)
   * @returns Equipo con estudiantes ordenados por puntos
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equiposService.findOne(id);
  }

  /**
   * Actualizar un equipo existente
   * PATCH /api/equipos/:id
   *
   * Body ejemplo (todos los campos opcionales):
   * {
   *   "nombre": "Quantum Actualizado",
   *   "color_primario": "#00FF00"
   * }
   *
   * @param id - ID del equipo
   * @param updateEquipoDto - Datos a actualizar
   * @returns Equipo actualizado
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEquipoDto: UpdateEquipoDto) {
    return this.equiposService.update(id, updateEquipoDto);
  }

  /**
   * Eliminar un equipo
   * DELETE /api/equipos/:id
   *
   * NOTA: Los estudiantes asociados NO se eliminan,
   * solo se desvinculan (equipo_id se pone en NULL)
   *
   * @param id - ID del equipo
   * @returns { message: string, estudiantesDesvinculados: number }
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.equiposService.remove(id);
  }

  /**
   * Recalcular puntos totales de un equipo
   * POST /api/equipos/:id/recalcular-puntos
   *
   * Suma los puntos de todos los estudiantes del equipo
   * y actualiza el campo puntos_totales del equipo
   *
   * Útil cuando:
   * - Se actualizan puntos de estudiantes
   * - Se agregan/quitan estudiantes del equipo
   * - Se detectan inconsistencias en los puntos
   *
   * @param id - ID del equipo
   * @returns Equipo con puntos actualizados
   */
  @Post(':id/recalcular-puntos')
  @HttpCode(HttpStatus.OK)
  recalcularPuntos(@Param('id') id: string) {
    return this.equiposService.recalcularPuntos(id);
  }
}
