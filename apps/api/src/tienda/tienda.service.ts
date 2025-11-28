/**
 * TiendaService
 * Maneja Items, Categorías, Inventario y Compras de la tienda
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { RecursosService } from './recursos.service';
import type {
  ItemTienda,
  ItemTiendaConCategoria,
  ItemsTiendaResponse,
  CategoriaItem,
  CreateCategoriaItem,
  UpdateCategoriaItem,
  CreateItemTienda,
  UpdateItemTienda,
  FiltrosItemsTienda,
  ItemObtenido,
  ItemObtenidoConInfo,
  InventarioEstudianteResponse,
  CompraResponse,
  RealizarCompra,
} from '@mateatletas/contracts';

@Injectable()
export class TiendaService {
  private readonly logger = new Logger(TiendaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recursosService: RecursosService,
  ) {}

  // ============================================================================
  // CATEGORÍAS
  // ============================================================================

  async obtenerCategorias(): Promise<CategoriaItem[]> {
    return (await this.prisma.categoriaItem.findMany({
      where: { activa: true },
      orderBy: { orden: 'asc' },
    })) as CategoriaItem[];
  }

  async crearCategoria(data: CreateCategoriaItem): Promise<CategoriaItem> {
    this.logger.log(`Creando categoría: ${data.nombre}`);

    return (await this.prisma.categoriaItem.create({
      data,
    })) as CategoriaItem;
  }

  async actualizarCategoria(
    id: string,
    data: UpdateCategoriaItem,
  ): Promise<CategoriaItem> {
    this.logger.log(`Actualizando categoría: ${id}`);

    const categoriaExiste = await this.prisma.categoriaItem.findUnique({
      where: { id },
    });

    if (!categoriaExiste) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return (await this.prisma.categoriaItem.update({
      where: { id },
      data,
    })) as CategoriaItem;
  }

  // ============================================================================
  // ITEMS DE LA TIENDA
  // ============================================================================

  /**
   * Obtiene items de la tienda con filtros opcionales
   */
  async obtenerItemsTienda(
    filtros: Partial<FiltrosItemsTienda> = {},
  ): Promise<ItemsTiendaResponse> {
    this.logger.log(`Obteniendo items de tienda con filtros:`, filtros);

    const {
      categoria_id,
      tipo_item,
      rareza,
      nivel_estudiante,
      solo_disponibles = true,
      incluir_edicion_limitada = true,
    } = filtros;

    const whereClause: Record<string, unknown> = {};

    // Filtro: Solo items disponibles
    if (solo_disponibles) {
      whereClause.disponible = true;
    }

    // Filtro: Por categoría
    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }

    // Filtro: Por tipo de item
    if (tipo_item) {
      whereClause.tipo_item = tipo_item;
    }

    // Filtro: Por rareza
    if (rareza) {
      whereClause.rareza = rareza;
    }

    // Filtro: Por nivel mínimo requerido
    if (nivel_estudiante) {
      whereClause.nivel_minimo_requerido = { lte: nivel_estudiante };
    }

    // Filtro: Edición limitada
    if (!incluir_edicion_limitada) {
      whereClause.edicion_limitada = false;
    } else {
      // Si se incluyen edición limitada, verificar fechas
      const now = new Date();
      whereClause.OR = [
        { edicion_limitada: false },
        {
          AND: [
            { edicion_limitada: true },
            { fecha_inicio: { lte: now } },
            {
              OR: [{ fecha_fin: null }, { fecha_fin: { gte: now } }],
            },
          ],
        },
      ];
    }

    const [items, total, categorias] = await Promise.all([
      this.prisma.itemTienda.findMany({
        where: whereClause,
        include: { categoria: true },
        orderBy: [
          { categoria_id: 'asc' },
          { rareza: 'desc' },
          { nombre: 'asc' },
        ],
      }),
      this.prisma.itemTienda.count({ where: whereClause }),
      this.obtenerCategorias(),
    ]);

    return {
      items: items as ItemTiendaConCategoria[],
      total,
      categorias,
    };
  }

  /**
   * Obtiene un item específico por ID
   */
  async obtenerItemPorId(id: string): Promise<ItemTiendaConCategoria> {
    const item = await this.prisma.itemTienda.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    return item as ItemTiendaConCategoria;
  }

  /**
   * Crea un nuevo item en la tienda (ADMIN)
   */
  async crearItem(data: CreateItemTienda): Promise<ItemTienda> {
    this.logger.log(`Creando item: ${data.nombre}`);

    // Verificar que la categoría exista
    const categoria = await this.prisma.categoriaItem.findUnique({
      where: { id: data.categoria_id },
    });

    if (!categoria) {
      throw new NotFoundException(
        `Categoría con ID ${data.categoria_id} no encontrada`,
      );
    }

    return (await this.prisma.itemTienda.create({
      data: {
        ...data,
        metadata: data.metadata as never,
      },
    })) as ItemTienda;
  }

  /**
   * Actualiza un item de la tienda (ADMIN)
   */
  async actualizarItem(
    id: string,
    data: UpdateItemTienda,
  ): Promise<ItemTienda> {
    this.logger.log(`Actualizando item: ${id}`);

    const itemExiste = await this.prisma.itemTienda.findUnique({
      where: { id },
    });

    if (!itemExiste) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    return (await this.prisma.itemTienda.update({
      where: { id },
      data: {
        ...data,
        metadata: data.metadata as never,
      },
    })) as ItemTienda;
  }

  // ============================================================================
  // INVENTARIO DEL ESTUDIANTE
  // ============================================================================

  /**
   * Obtiene el inventario completo del estudiante
   */
  async obtenerInventario(
    estudianteId: string,
  ): Promise<InventarioEstudianteResponse> {
    this.logger.log(`Obteniendo inventario de estudiante: ${estudianteId}`);

    const [items, recursos] = await Promise.all([
      this.prisma.itemObtenido.findMany({
        where: { estudiante_id: estudianteId },
        include: {
          item: {
            include: { categoria: true },
          },
        },
        orderBy: { fecha_obtencion: 'desc' },
      }),
      this.recursosService.obtenerOCrearRecursos(estudianteId),
    ]);

    return {
      items: items as ItemObtenidoConInfo[],
      total: items.length,
      recursos,
    };
  }

  /**
   * Verifica si el estudiante tiene un item específico
   */
  async estudianteTieneItem(
    estudianteId: string,
    itemId: string,
  ): Promise<boolean> {
    const itemObtenido = await this.prisma.itemObtenido.findUnique({
      where: {
        estudiante_id_item_id: {
          estudiante_id: estudianteId,
          item_id: itemId,
        },
      },
    });

    return !!itemObtenido;
  }

  /**
   * Equipa un item en el estudiante
   */
  async equiparItem(
    estudianteId: string,
    itemId: string,
  ): Promise<ItemObtenido> {
    this.logger.log(
      `Equipando item ${itemId} para estudiante: ${estudianteId}`,
    );

    // Verificar que el estudiante tenga el item
    const itemObtenido = await this.prisma.itemObtenido.findUnique({
      where: {
        estudiante_id_item_id: {
          estudiante_id: estudianteId,
          item_id: itemId,
        },
      },
      include: { item: true },
    });

    if (!itemObtenido) {
      throw new NotFoundException('No tienes este item en tu inventario');
    }

    // Desequipar otros items del mismo tipo
    await this.prisma.itemObtenido.updateMany({
      where: {
        estudiante_id: estudianteId,
        item: { tipo_item: itemObtenido.item.tipo_item },
        equipado: true,
      },
      data: { equipado: false },
    });

    // Equipar el item seleccionado
    const itemEquipado = await this.prisma.itemObtenido.update({
      where: { id: itemObtenido.id },
      data: { equipado: true },
    });

    return itemEquipado as ItemObtenido;
  }

  // ============================================================================
  // COMPRAS
  // ============================================================================

  /**
   * Realiza la compra de un item
   */
  async realizarCompra(data: RealizarCompra): Promise<CompraResponse> {
    const { item_id, estudiante_id } = data;

    this.logger.log(
      `Procesando compra de item ${item_id} para estudiante: ${estudiante_id}`,
    );

    // 1. Verificar que el item exista y esté disponible
    const item = await this.obtenerItemPorId(item_id);

    if (!item.disponible) {
      throw new BadRequestException('Este item no está disponible actualmente');
    }

    // 2. Verificar si es edición limitada y está dentro del periodo
    if (item.edicion_limitada) {
      const now = new Date();
      if (item.fecha_inicio && item.fecha_inicio > now) {
        throw new BadRequestException('Este item aún no está disponible');
      }
      if (item.fecha_fin && item.fecha_fin < now) {
        throw new BadRequestException('Este item ya no está disponible');
      }
    }

    // 3. Verificar que el estudiante no tenga ya el item
    const yaLoTiene = await this.estudianteTieneItem(estudiante_id, item_id);
    if (yaLoTiene) {
      throw new ConflictException('Ya tienes este item en tu inventario');
    }

    // 4. Verificar nivel mínimo requerido
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudiante_id },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.nivel_actual < item.nivel_minimo_requerido) {
      throw new BadRequestException(
        `Necesitas ser nivel ${item.nivel_minimo_requerido} para comprar este item. Tu nivel actual es ${estudiante.nivel_actual}`,
      );
    }

    // 5. Verificar que tenga recursos suficientes
    const verificacion =
      await this.recursosService.verificarRecursosSuficientes(
        estudiante_id,
        item.precio_monedas,
      );

    if (!verificacion.suficientes) {
      throw new BadRequestException(verificacion.mensaje);
    }

    // 6. Obtener recursos para crear compra
    const recursos =
      await this.recursosService.obtenerOCrearRecursos(estudiante_id);

    // 7. Usar transacción de Prisma para atomicidad
    const resultado = await this.prisma.$transaction(async (tx) => {
      // 7a. Consumir monedas
      if (item.precio_monedas > 0) {
        // Crear transacción negativa
        await tx.transaccionRecurso.create({
          data: {
            recursos_estudiante_id: recursos.id,
            tipo_recurso: 'MONEDAS',
            cantidad: -item.precio_monedas,
            razon: 'compra_tienda',
            metadata: { item_id, nombre_item: item.nombre } as never,
          },
        });
        // Actualizar total
        await tx.recursosEstudiante.update({
          where: { id: recursos.id },
          data: { monedas_total: { decrement: item.precio_monedas } },
        });
      }

      // 7b. Registrar compra
      const compra = await tx.compraItem.create({
        data: {
          recursos_estudiante_id: recursos.id,
          item_id,
          monedas_gastadas: item.precio_monedas,
        },
      });

      // 7c. Agregar item al inventario
      const itemObtenido = await tx.itemObtenido.create({
        data: {
          estudiante_id,
          item_id,
          fecha_obtencion: new Date(),
          equipado: false,
          cantidad: 1,
        },
      });

      // 7d. Incrementar contador de veces comprado
      await tx.itemTienda.update({
        where: { id: item_id },
        data: { veces_comprado: { increment: 1 } },
      });

      return { compra, itemObtenido };
    });

    // 8. Obtener recursos actualizados
    const recursosActualizados =
      await this.recursosService.obtenerOCrearRecursos(estudiante_id);

    this.logger.log(`Compra realizada exitosamente: ${item.nombre}`);

    return {
      compra: resultado.compra as never,
      item_obtenido: resultado.itemObtenido as never,
      recursos_actualizados: recursosActualizados,
      mensaje: `¡Has comprado ${item.nombre}! 🎉`,
    };
  }

  /**
   * Obtiene el historial de compras de un estudiante
   */
  async obtenerHistorialCompras(
    estudianteId: string,
  ): Promise<CompraResponse[]> {
    const recursos =
      await this.recursosService.obtenerOCrearRecursos(estudianteId);

    const compras = await this.prisma.compraItem.findMany({
      where: { recursos_estudiante_id: recursos.id },
      include: {
        item: {
          include: { categoria: true },
        },
      },
      orderBy: { fecha_compra: 'desc' },
    });

    return compras as never[];
  }
}
