import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../core/database/prisma.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { TipoProducto, CasaTipo, MundoTipo, Prisma } from '@prisma/client';

/**
 * Service para gestionar operaciones CRUD de productos del catálogo
 * Maneja suscripciones, cursos y recursos digitales
 */
@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Crea un nuevo producto en el catálogo
   * Valida que los campos específicos estén presentes según el tipo
   * @param createDto - Datos del producto a crear
   * @returns El producto creado
   */
  async create(createDto: CrearProductoDto) {
    this.validateProductoFields(createDto);

    const data = this.buildCreateData(createDto);

    const producto = await this.prisma.producto.create({ data });

    await this.invalidateProductosCache();

    return producto;
  }

  /**
   * Construye los datos base para crear un producto
   */
  private buildCreateData(dto: CrearProductoDto): Prisma.ProductoCreateInput {
    const data: Prisma.ProductoCreateInput = {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      precio: dto.precio,
      tipo: dto.tipo,
      activo: dto.activo ?? true,
      subcategoria: dto.subcategoria,
    };

    this.addTipoSpecificFields(data, dto);
    this.addCasaMundoFields(data, dto);

    return data;
  }

  /**
   * Agrega campos específicos según el tipo de producto
   */
  private addTipoSpecificFields(
    data: Prisma.ProductoCreateInput,
    dto: CrearProductoDto,
  ): void {
    if (dto.tipo === 'Curso' || dto.tipo === 'Evento') {
      const fechaInicio = dto.fecha_inicio || dto.fechaInicio;
      const fechaFin = dto.fecha_fin || dto.fechaFin;
      const cupoMaximo = dto.cupo_maximo || dto.cupoMaximo;

      data.fecha_inicio = fechaInicio ? new Date(fechaInicio) : undefined;
      data.fecha_fin = fechaFin ? new Date(fechaFin) : undefined;
      data.cupo_maximo = cupoMaximo;
    } else if (dto.tipo === 'Servicio') {
      data.duracion_meses = dto.duracion_meses ?? 1;
    }
  }

  /**
   * Agrega campos del Sistema Casa/Mundo 2026
   */
  private addCasaMundoFields(
    data: Prisma.ProductoCreateInput,
    dto: CrearProductoDto,
  ): void {
    const casaMundoFields = [
      'casa',
      'mundo',
      'subtipo_mundo',
      'nivel_olimpiada',
      'edad_minima',
      'edad_maxima',
      'permite_excepciones',
      'visible_en_landing',
      'orden_display',
    ] as const;

    for (const field of casaMundoFields) {
      if (dto[field] !== undefined) {
        (data as Record<string, unknown>)[field] = dto[field];
      }
    }
  }

  /**
   * Obtiene todos los productos del catálogo
   * @param tipo - Filtro opcional por tipo de producto
   * @param soloActivos - Si true, solo devuelve productos activos
   * @returns Lista de productos
   *
   * CACHE: Este endpoint está cacheado por 5 minutos
   * El catálogo de productos cambia con poca frecuencia
   */
  async findAll(tipo?: TipoProducto, soloActivos: boolean = true) {
    // Construir cache key basado en los filtros
    const cacheKey = `productos_${tipo || 'all'}_${soloActivos ? 'activos' : 'todos'}`;

    // Intentar obtener del cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Productos obtenidos del cache: ${cacheKey}`);
      return cached;
    }

    // Si no está en cache, consultar la BD
    const where: Prisma.ProductoWhereInput = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (soloActivos) {
      where.activo = true;
    }

    const productos = await this.prisma.producto.findMany({
      where,
      orderBy: [{ tipo: 'asc' }, { createdAt: 'desc' }],
    });

    // Guardar en cache por 5 minutos (300000ms)
    await this.cacheManager.set(cacheKey, productos, 300000);
    this.logger.debug(`Productos guardados en cache (5 min): ${cacheKey}`);

    return productos;
  }

  /**
   * Busca un producto por ID
   * @param id - ID del producto
   * @returns El producto encontrado
   * @throws NotFoundException si el producto no existe
   */
  async findById(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  /**
   * Obtiene solo los cursos disponibles
   * Filtra cursos cuya fecha de inicio es futura o está en curso
   * @returns Lista de cursos
   */
  async findCursosDisponibles() {
    const ahora = new Date();

    return await this.prisma.producto.findMany({
      where: {
        tipo: 'Curso',
        activo: true,
        fecha_inicio: {
          lte: new Date(ahora.getTime() + 90 * 24 * 60 * 60 * 1000), // Próximos 90 días
        },
      },
      orderBy: {
        fecha_inicio: 'asc',
      },
    });
  }

  /**
   * Obtiene solo los servicios disponibles (membresías, mentorías)
   * @returns Lista de servicios activos
   */
  async findServicios() {
    return await this.prisma.producto.findMany({
      where: {
        tipo: 'Servicio',
        activo: true,
      },
      orderBy: {
        precio: 'asc',
      },
    });
  }

  /**
   * Construye el objeto de datos para actualización de producto
   */
  private buildUpdateData(
    updateDto: ActualizarProductoDto,
  ): Prisma.ProductoUpdateInput {
    const data: Prisma.ProductoUpdateInput = {};

    // Campos base
    const baseFields = [
      'nombre',
      'descripcion',
      'precio',
      'tipo',
      'activo',
    ] as const;
    for (const field of baseFields) {
      if (updateDto[field] !== undefined) {
        (data as Record<string, unknown>)[field] = updateDto[field];
      }
    }

    // Campos de fecha (requieren conversión)
    if (updateDto.fecha_inicio !== undefined) {
      data.fecha_inicio = new Date(updateDto.fecha_inicio);
    }
    if (updateDto.fecha_fin !== undefined) {
      data.fecha_fin = new Date(updateDto.fecha_fin);
    }

    // Campos adicionales (sin conversión)
    const additionalFields = [
      'cupo_maximo',
      'duracion_meses',
      'casa',
      'mundo',
      'subtipo_mundo',
      'nivel_olimpiada',
      'edad_minima',
      'edad_maxima',
      'permite_excepciones',
      'visible_en_landing',
      'orden_display',
    ] as const;

    for (const field of additionalFields) {
      if (updateDto[field] !== undefined) {
        (data as Record<string, unknown>)[field] = updateDto[field];
      }
    }

    return data;
  }

  /**
   * Actualiza un producto existente
   * @param id - ID del producto
   * @param updateDto - Datos a actualizar
   * @returns El producto actualizado
   * @throws NotFoundException si el producto no existe
   */
  async update(id: string, updateDto: ActualizarProductoDto) {
    await this.findById(id);

    if (updateDto.tipo) {
      this.validateProductoFields(updateDto as CrearProductoDto);
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: this.buildUpdateData(updateDto),
    });

    await this.invalidateProductosCache();

    return producto;
  }

  /**
   * Elimina un producto (o lo marca como inactivo)
   * Por defecto marca como inactivo en lugar de eliminar
   * @param id - ID del producto
   * @param hardDelete - Si true, elimina permanentemente
   * @returns Mensaje de confirmación
   */
  async remove(id: string, hardDelete: boolean = false) {
    this.logger.log(`remove() called - id: ${id}, hardDelete: ${hardDelete}`);

    // Verificar que el producto existe
    await this.findById(id);

    if (hardDelete) {
      await this.prisma.producto.delete({
        where: { id },
      });
    } else {
      await this.prisma.producto.update({
        where: { id },
        data: { activo: false },
      });
    }

    // Invalidar caché de productos
    await this.invalidateProductosCache();

    return {
      message: hardDelete
        ? 'Producto eliminado permanentemente'
        : 'Producto marcado como inactivo',
    };
  }

  /**
   * Invalida todas las claves de caché de productos
   */
  private async invalidateProductosCache() {
    const cacheKeys = [
      'productos_all_activos',
      'productos_all_todos',
      'productos_Curso_activos',
      'productos_Curso_todos',
      'productos_Evento_activos',
      'productos_Evento_todos',
      'productos_Digital_activos',
      'productos_Digital_todos',
      'productos_Fisico_activos',
      'productos_Fisico_todos',
      'productos_Servicio_activos',
      'productos_Servicio_todos',
    ];
    await Promise.all(cacheKeys.map((key) => this.cacheManager.del(key)));
    this.logger.debug('Cache de productos invalidado');
  }

  /**
   * Obtiene el conteo de ventas (inscripciones) de un producto
   * @param id - ID del producto
   * @returns { total, pagadas, pendientes }
   */
  async getVentasCount(id: string) {
    await this.findById(id);

    const [total, pagadas] = await Promise.all([
      this.prisma.inscripcionMensual.count({
        where: { producto_id: id },
      }),
      this.prisma.inscripcionMensual.count({
        where: {
          producto_id: id,
          estado_pago: 'Pagado',
        },
      }),
    ]);

    return {
      total,
      pagadas,
      pendientes: total - pagadas,
    };
  }

  /**
   * Obtiene el conteo de ventas de TODOS los productos en una sola query
   * Evita el problema N+1 cuando se necesitan ventas de múltiples productos
   * @returns Record<productoId, { total, pagadas, pendientes }>
   */
  async getVentasCountBatch(): Promise<
    Record<string, { total: number; pagadas: number; pendientes: number }>
  > {
    // Usar groupBy para obtener todos los conteos en una sola query
    const inscripcionesPorProducto =
      await this.prisma.inscripcionMensual.groupBy({
        by: ['producto_id'],
        _count: { id: true },
      });

    const inscripcionesPagadasPorProducto =
      await this.prisma.inscripcionMensual.groupBy({
        by: ['producto_id'],
        where: { estado_pago: 'Pagado' },
        _count: { id: true },
      });

    // Crear mapa de pagadas para lookup rápido
    const pagadasMap = new Map(
      inscripcionesPagadasPorProducto.map((item) => [
        item.producto_id,
        item._count.id,
      ]),
    );

    // Construir resultado
    const result: Record<
      string,
      { total: number; pagadas: number; pendientes: number }
    > = {};

    for (const item of inscripcionesPorProducto) {
      const productoId = item.producto_id;
      const total = item._count.id;
      const pagadas = pagadasMap.get(productoId) ?? 0;

      result[productoId] = {
        total,
        pagadas,
        pendientes: total - pagadas,
      };
    }

    return result;
  }

  /**
   * Valida que los campos requeridos estén presentes según el tipo de producto
   * @param dto - DTO del producto
   * @throws BadRequestException si faltan campos requeridos o hay validaciones inválidas
   * @private
   */
  private validateProductoFields(
    dto: CrearProductoDto | ActualizarProductoDto,
  ) {
    if (dto.tipo === 'Curso') {
      // Validar que tenga los campos de curso
      if (!dto.fecha_inicio || !dto.fecha_fin || !dto.cupo_maximo) {
        throw new BadRequestException(
          'Los cursos requieren fecha_inicio, fecha_fin y cupo_maximo',
        );
      }

      // Validar que fecha_fin sea posterior a fecha_inicio
      const fechaInicio = new Date(dto.fecha_inicio);
      const fechaFin = new Date(dto.fecha_fin);

      if (fechaFin <= fechaInicio) {
        throw new BadRequestException(
          'La fecha de fin debe ser posterior a la fecha de inicio',
        );
      }
    }
  }

  // ============================================================================
  // MÉTODOS CATÁLOGO PÚBLICO 2026
  // ============================================================================

  /**
   * Obtiene productos visibles en landing filtrados por Casa/Mundo
   * Para el catálogo público de la landing page
   */
  async findCatalogoPublico(filtros: {
    casa?: CasaTipo;
    mundo?: MundoTipo;
    edad?: number;
  }) {
    const where: Prisma.ProductoWhereInput = {
      activo: true,
      visible_en_landing: true,
    };

    if (filtros.casa) {
      where.casa = filtros.casa;
    }

    if (filtros.mundo) {
      where.mundo = filtros.mundo;
    }

    // Filtrar por edad si se proporciona
    if (filtros.edad !== undefined) {
      where.OR = [
        // Productos sin restricción de edad
        { edad_minima: null, edad_maxima: null },
        // Productos donde la edad está en rango
        {
          edad_minima: { lte: filtros.edad },
          edad_maxima: { gte: filtros.edad },
        },
        // Productos que permiten excepciones
        { permite_excepciones: true },
      ];
    }

    return await this.prisma.producto.findMany({
      where,
      orderBy: [{ orden_display: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        tipo: true,
        casa: true,
        mundo: true,
        subtipo_mundo: true,
        nivel_olimpiada: true,
        edad_minima: true,
        edad_maxima: true,
        permite_excepciones: true,
        orden_display: true,
      },
    });
  }

  /**
   * Obtiene productos por Casa pedagógica
   */
  async findByCasa(casa: CasaTipo) {
    return await this.prisma.producto.findMany({
      where: {
        casa,
        activo: true,
        visible_en_landing: true,
      },
      orderBy: [{ orden_display: 'asc' }, { nombre: 'asc' }],
    });
  }

  /**
   * Obtiene productos por Mundo
   */
  async findByMundo(mundo: MundoTipo) {
    return await this.prisma.producto.findMany({
      where: {
        mundo,
        activo: true,
        visible_en_landing: true,
      },
      orderBy: [{ orden_display: 'asc' }, { nombre: 'asc' }],
    });
  }

  /**
   * Obtiene productos Club para suscripciones familiares
   * Incluye ClaseGrupos con información del docente
   */
  async findClubs() {
    return await this.prisma.producto.findMany({
      where: {
        tipo: 'Club',
        activo: true,
      },
      include: {
        claseGrupos: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            dia_semana: true,
            hora_inicio: true,
            hora_fin: true,
            cupo_maximo: true,
            docente: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: [{ casa: 'asc' }, { mundo: 'asc' }, { orden_display: 'asc' }],
    });
  }

  /**
   * Obtiene resumen del catálogo agrupado por Casa y Mundo
   */
  async getCatalogoResumen() {
    const productos = await this.prisma.producto.findMany({
      where: { activo: true, visible_en_landing: true },
      select: {
        casa: true,
        mundo: true,
        tipo: true,
      },
    });

    // Agrupar por casa
    const porCasa: Record<string, number> = {};
    const porMundo: Record<string, number> = {};
    const porTipo: Record<string, number> = {};

    for (const p of productos) {
      if (p.casa) {
        porCasa[p.casa] = (porCasa[p.casa] ?? 0) + 1;
      }
      if (p.mundo) {
        porMundo[p.mundo] = (porMundo[p.mundo] ?? 0) + 1;
      }
      porTipo[p.tipo] = (porTipo[p.tipo] ?? 0) + 1;
    }

    return {
      total: productos.length,
      porCasa,
      porMundo,
      porTipo,
    };
  }

  // ============================================================================
  // ASIGNACIÓN DE PLANIFICACIÓN A PRODUCTO
  // ============================================================================

  /**
   * Asigna una planificación a un producto (Club)
   * La planificación aplica a todos los ClaseGrupos del producto
   * @param productoId - ID del producto
   * @param planificacionId - ID de la planificación a asignar
   * @returns El producto actualizado con la planificación
   */
  async asignarPlanificacion(productoId: string, planificacionId: string) {
    // Verificar que el producto existe y es de tipo Club
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (producto.tipo !== 'Club') {
      throw new BadRequestException(
        'Solo los productos de tipo Club pueden tener planificación asignada',
      );
    }

    // Verificar que la planificación existe y está publicada
    const planificacion = await this.prisma.planificacion.findUnique({
      where: { id: planificacionId },
      select: {
        id: true,
        titulo: true,
        estado: true,
        casa_tipo: true,
        mundo_tipo: true,
      },
    });

    if (!planificacion) {
      throw new NotFoundException('Planificación no encontrada');
    }

    if (planificacion.estado !== 'PUBLICADO') {
      throw new BadRequestException(
        'Solo se pueden asignar planificaciones publicadas',
      );
    }

    // Actualizar el producto con la planificación
    const productoActualizado = await this.prisma.producto.update({
      where: { id: productoId },
      data: {
        planificacion_id: planificacionId,
      },
      include: {
        planificacion: {
          select: {
            id: true,
            titulo: true,
            cantidad_clases: true,
            casa_tipo: true,
            mundo_tipo: true,
            estado: true,
          },
        },
      },
    });

    this.logger.log(
      `Planificación ${planificacion.titulo} asignada a producto ${producto.nombre}`,
    );

    await this.invalidateProductosCache();

    return {
      success: true,
      message: `Planificación "${planificacion.titulo}" asignada exitosamente`,
      data: productoActualizado,
    };
  }

  /**
   * Quita la planificación asignada a un producto
   * @param productoId - ID del producto
   * @returns El producto actualizado sin planificación
   */
  async quitarPlanificacion(productoId: string) {
    // Verificar que el producto existe
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
      include: {
        planificacion: {
          select: { titulo: true },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (!producto.planificacion_id) {
      throw new BadRequestException(
        'El producto no tiene planificación asignada',
      );
    }

    const planificacionTitulo = producto.planificacion?.titulo;

    // Quitar la planificación del producto
    const productoActualizado = await this.prisma.producto.update({
      where: { id: productoId },
      data: {
        planificacion_id: null,
      },
    });

    this.logger.log(
      `Planificación "${planificacionTitulo}" removida del producto ${producto.nombre}`,
    );

    await this.invalidateProductosCache();

    return {
      success: true,
      message: `Planificación removida exitosamente`,
      data: productoActualizado,
    };
  }

  /**
   * Obtiene un producto por ID con su planificación (si tiene)
   * Usado para mostrar detalles en admin
   */
  async findByIdConPlanificacion(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        planificacion: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            cantidad_clases: true,
            casa_tipo: true,
            mundo_tipo: true,
            estado: true,
          },
        },
        claseGrupos: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            dia_semana: true,
            hora_inicio: true,
            hora_fin: true,
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }
}
