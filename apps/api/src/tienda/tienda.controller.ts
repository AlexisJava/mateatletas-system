/**
 * TiendaController
 * Endpoints para la tienda de items, inventario y compras
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.decorator';
import { TiendaService } from './tienda.service';
import {
  ItemsTiendaResponse,
  ItemTiendaConCategoria,
  CategoriaItem,
  CreateCategoriaItem,
  UpdateCategoriaItem,
  CreateItemTienda,
  UpdateItemTienda,
  FiltrosItemsTienda,
  InventarioEstudianteResponse,
  CompraResponse,
  RealizarCompra,
  ItemObtenido,
  ItemTienda,
} from '@mateatletas/contracts';

@Controller('tienda')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  // ============================================================================
  // CATEGORÍAS
  // ============================================================================

  /**
   * GET /tienda/categorias
   * Obtiene todas las categorías activas
   */
  @Get('categorias')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerCategorias(): Promise<CategoriaItem[]> {
    return await this.tiendaService.obtenerCategorias();
  }

  /**
   * POST /tienda/categorias
   * Crea una nueva categoría (ADMIN)
   */
  @Post('categorias')
  @Roles(Role.Admin)
  async crearCategoria(
    @Body() data: CreateCategoriaItem,
  ): Promise<CategoriaItem> {
    return await this.tiendaService.crearCategoria(data);
  }

  /**
   * PUT /tienda/categorias/:id
   * Actualiza una categoría (ADMIN)
   */
  @Put('categorias/:id')
  @Roles(Role.Admin)
  async actualizarCategoria(
    @Param('id') id: string,
    @Body() data: UpdateCategoriaItem,
  ): Promise<CategoriaItem> {
    return await this.tiendaService.actualizarCategoria(id, data);
  }

  // ============================================================================
  // ITEMS DE LA TIENDA
  // ============================================================================

  /**
   * GET /tienda/items
   * Obtiene items de la tienda con filtros opcionales
   */
  @Get('items')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerItemsTienda(
    @Query('categoria_id') categoria_id?: string,
    @Query('tipo_item') tipo_item?: string,
    @Query('rareza') rareza?: string,
    @Query('nivel_estudiante') nivel_estudiante?: string,
    @Query('solo_disponibles') solo_disponibles?: string,
    @Query('incluir_edicion_limitada') incluir_edicion_limitada?: string,
  ): Promise<ItemsTiendaResponse> {
    const filtros: FiltrosItemsTienda = {
      categoria_id,
      tipo_item: tipo_item as never,
      rareza: rareza as never,
      nivel_estudiante: nivel_estudiante ? Number(nivel_estudiante) : undefined,
      solo_disponibles: solo_disponibles !== 'false',
      incluir_edicion_limitada: incluir_edicion_limitada !== 'false',
    };

    return await this.tiendaService.obtenerItemsTienda(filtros);
  }

  /**
   * GET /tienda/items/:id
   * Obtiene un item específico por ID
   */
  @Get('items/:id')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerItemPorId(@Param('id') id: string): Promise<ItemTiendaConCategoria> {
    return await this.tiendaService.obtenerItemPorId(id);
  }

  /**
   * POST /tienda/items
   * Crea un nuevo item en la tienda (ADMIN)
   */
  @Post('items')
  @Roles(Role.Admin)
  async crearItem(@Body() data: CreateItemTienda): Promise<ItemTienda> {
    return await this.tiendaService.crearItem(data);
  }

  /**
   * PUT /tienda/items/:id
   * Actualiza un item de la tienda (ADMIN)
   */
  @Put('items/:id')
  @Roles(Role.Admin)
  async actualizarItem(
    @Param('id') id: string,
    @Body() data: UpdateItemTienda,
  ): Promise<ItemTienda> {
    return await this.tiendaService.actualizarItem(id, data);
  }

  // ============================================================================
  // INVENTARIO DEL ESTUDIANTE
  // ============================================================================

  /**
   * GET /tienda/inventario/:estudianteId
   * Obtiene el inventario completo del estudiante
   */
  @Get('inventario/:estudianteId')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerInventario(
    @Param('estudianteId') estudianteId: string,
  ): Promise<InventarioEstudianteResponse> {
    return await this.tiendaService.obtenerInventario(estudianteId);
  }

  /**
   * PUT /tienda/inventario/:estudianteId/equipar/:itemId
   * Equipa un item en el estudiante
   */
  @Put('inventario/:estudianteId/equipar/:itemId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Estudiante)
  async equiparItem(
    @Param('estudianteId') estudianteId: string,
    @Param('itemId') itemId: string,
  ): Promise<ItemObtenido> {
    return await this.tiendaService.equiparItem(estudianteId, itemId);
  }

  // ============================================================================
  // COMPRAS
  // ============================================================================

  /**
   * POST /tienda/comprar
   * Realiza la compra de un item
   */
  @Post('comprar')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Estudiante)
  async realizarCompra(@Body() data: RealizarCompra): Promise<CompraResponse> {
    return await this.tiendaService.realizarCompra(data);
  }

  /**
   * GET /tienda/compras/:estudianteId
   * Obtiene el historial de compras del estudiante
   */
  @Get('compras/:estudianteId')
  @Roles(Role.Estudiante, Role.Tutor, Role.Docente, Role.Admin)
  async obtenerHistorialCompras(
    @Param('estudianteId') estudianteId: string,
  ): Promise<CompraResponse[]> {
    return await this.tiendaService.obtenerHistorialCompras(estudianteId);
  }
}
