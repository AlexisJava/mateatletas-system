import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { TipoProducto } from '@prisma/client';

/**
 * Service para gestionar operaciones CRUD de productos del catálogo
 * Maneja suscripciones, cursos y recursos digitales
 */
@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

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
    const data: any = {
      nombre: createDto.nombre,
      descripcion: createDto.descripcion,
      precio: createDto.precio,
      tipo: createDto.tipo,
      activo: createDto.activo ?? true,
    };

    // Agregar campos específicos según el tipo
    if (createDto.tipo === 'Curso') {
      // Soportar tanto snake_case como camelCase
      const fechaInicio = createDto.fecha_inicio || createDto.fechaInicio;
      const fechaFin = createDto.fecha_fin || createDto.fechaFin;
      const cupoMaximo = createDto.cupo_maximo || createDto.cupoMaximo;

      data.fecha_inicio = fechaInicio ? new Date(fechaInicio) : undefined;
      data.fecha_fin = fechaFin ? new Date(fechaFin) : undefined;
      data.cupo_maximo = cupoMaximo;
    } else if (createDto.tipo === 'Suscripcion') {
      data.duracion_meses = createDto.duracion_meses ?? 1;
    }

    return await this.prisma.producto.create({
      data,
    });
  }

  /**
   * Obtiene todos los productos del catálogo
   * @param tipo - Filtro opcional por tipo de producto
   * @param soloActivos - Si true, solo devuelve productos activos
   * @returns Lista de productos
   */
  async findAll(tipo?: TipoProducto, soloActivos: boolean = true) {
    const where: any = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (soloActivos) {
      where.activo = true;
    }

    return await this.prisma.producto.findMany({
      where,
      orderBy: [{ tipo: 'asc' }, { createdAt: 'desc' }],
    });
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
   * Obtiene solo las suscripciones disponibles
   * @returns Lista de suscripciones activas
   */
  async findSuscripciones() {
    return await this.prisma.producto.findMany({
      where: {
        tipo: 'Suscripcion',
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
    const data: any = {};

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

    return await this.prisma.producto.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina un producto (o lo marca como inactivo)
   * Por defecto marca como inactivo en lugar de eliminar
   * @param id - ID del producto
   * @param hardDelete - Si true, elimina permanentemente
   * @returns Mensaje de confirmación
   */
  async remove(id: string, hardDelete: boolean = false) {
    // Verificar que el producto existe
    await this.findById(id);

    if (hardDelete) {
      await this.prisma.producto.delete({
        where: { id },
      });
      return { message: 'Producto eliminado permanentemente' };
    } else {
      await this.prisma.producto.update({
        where: { id },
        data: { activo: false },
      });
      return { message: 'Producto marcado como inactivo' };
    }
  }

  /**
   * Valida que los campos requeridos estén presentes según el tipo de producto
   * @param dto - DTO del producto
   * @throws BadRequestException si faltan campos requeridos o hay validaciones inválidas
   * @private
   */
  private validateProductoFields(dto: CrearProductoDto | ActualizarProductoDto) {
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
