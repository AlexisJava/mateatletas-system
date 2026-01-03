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
import { TipoProducto, Prisma } from '@prisma/client';

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
    // Validar campos según el tipo de producto
    this.validateProductoFields(createDto);

    // Construir los datos para crear el producto
    const data: Prisma.ProductoCreateInput = {
      nombre: createDto.nombre,
      descripcion: createDto.descripcion,
      precio: createDto.precio,
      tipo: createDto.tipo,
      activo: createDto.activo ?? true,
      subcategoria: createDto.subcategoria,
    };

    // Agregar campos específicos según el tipo
    if (createDto.tipo === 'Curso' || createDto.tipo === 'Evento') {
      // Soportar tanto snake_case como camelCase
      const fechaInicio = createDto.fecha_inicio || createDto.fechaInicio;
      const fechaFin = createDto.fecha_fin || createDto.fechaFin;
      const cupoMaximo = createDto.cupo_maximo || createDto.cupoMaximo;

      data.fecha_inicio = fechaInicio ? new Date(fechaInicio) : undefined;
      data.fecha_fin = fechaFin ? new Date(fechaFin) : undefined;
      data.cupo_maximo = cupoMaximo;
    } else if (createDto.tipo === 'Servicio') {
      data.duracion_meses = createDto.duracion_meses ?? 1;
    }

    const producto = await this.prisma.producto.create({
      data,
    });

    // Invalidar caché
    await this.invalidateProductosCache();

    return producto;
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
   * Actualiza un producto existente
   * @param id - ID del producto
   * @param updateDto - Datos a actualizar
   * @returns El producto actualizado
   * @throws NotFoundException si el producto no existe
   */
  async update(id: string, updateDto: ActualizarProductoDto) {
    // Verificar que el producto existe
    await this.findById(id);

    // Si se está cambiando el tipo, validar los campos requeridos
    if (updateDto.tipo) {
      this.validateProductoFields(updateDto as CrearProductoDto);
    }

    // Construir los datos para actualizar
    const data: Prisma.ProductoUpdateInput = {};

    if (updateDto.nombre !== undefined) data.nombre = updateDto.nombre;
    if (updateDto.descripcion !== undefined)
      data.descripcion = updateDto.descripcion;
    if (updateDto.precio !== undefined) data.precio = updateDto.precio;
    if (updateDto.tipo !== undefined) data.tipo = updateDto.tipo;
    if (updateDto.activo !== undefined) data.activo = updateDto.activo;

    // Campos específicos de Curso
    if (updateDto.fecha_inicio !== undefined) {
      data.fecha_inicio = new Date(updateDto.fecha_inicio);
    }
    if (updateDto.fecha_fin !== undefined) {
      data.fecha_fin = new Date(updateDto.fecha_fin);
    }
    if (updateDto.cupo_maximo !== undefined) {
      data.cupo_maximo = updateDto.cupo_maximo;
    }

    // Campos específicos de Suscripcion
    if (updateDto.duracion_meses !== undefined) {
      data.duracion_meses = updateDto.duracion_meses;
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data,
    });

    // Invalidar caché
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
}
