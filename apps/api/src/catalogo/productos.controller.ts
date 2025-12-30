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
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoProducto } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controller para gestionar productos del catálogo
 * Endpoints públicos para consulta y protegidos para modificación
 */
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /**
   * GET /productos
   * Obtiene lista de productos con filtros opcionales
   * Endpoint público para mostrar catálogo
   *
   * Query params:
   * - tipo: 'Suscripcion' | 'Curso' | 'RecursoDigital'
   * - soloActivos: 'true' | 'false' (default: true)
   */
  @Public()
  @Get()
  async findAll(
    @Query('tipo') tipo?: TipoProducto,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const activos = soloActivos !== 'false'; // Por defecto true
    return this.productosService.findAll(tipo, activos);
  }

  /**
   * GET /productos/cursos
   * Obtiene solo cursos disponibles para inscripción
   * Endpoint público
   */
  @Public()
  @Get('cursos')
  async findCursosDisponibles() {
    return this.productosService.findCursosDisponibles();
  }

  /**
   * GET /productos/suscripciones
   * Obtiene solo planes de suscripción disponibles
   * Endpoint público
   */
  @Public()
  @Get('suscripciones')
  async findSuscripciones() {
    return this.productosService.findSuscripciones();
  }

  /**
   * GET /productos/:id
   * Obtiene detalles de un producto específico
   * Endpoint público
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIdPipe) id: string) {
    return this.productosService.findById(id);
  }

  /**
   * POST /productos
   * Crea un nuevo producto en el catálogo
   * Requiere autenticación y rol Admin
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CrearProductoDto) {
    return this.productosService.create(createDto);
  }

  /**
   * PATCH /productos/:id
   * Actualiza un producto existente
   * Requiere autenticación y rol Admin
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIdPipe) id: string,
    @Body() updateDto: ActualizarProductoDto,
  ) {
    return this.productosService.update(id, updateDto);
  }

  /**
   * DELETE /productos/:id
   * Elimina o desactiva un producto
   * Por defecto solo lo marca como inactivo
   * Requiere autenticación y rol Admin
   *
   * Query params:
   * - hardDelete: 'true' para eliminación permanente
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(
    @Param('id', ParseIdPipe) id: string,
    @Query('hardDelete') hardDelete?: string,
  ) {
    const permanent = hardDelete === 'true';
    return this.productosService.remove(id, permanent);
  }
}
