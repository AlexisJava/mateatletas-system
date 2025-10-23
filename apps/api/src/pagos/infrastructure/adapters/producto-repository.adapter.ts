import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  IProductoRepository,
  Producto,
} from '../../domain/repositories/producto.repository.interface';
import { TipoProducto } from '../../domain/types/pagos.types';

/**
 * Adapter para el repositorio de Productos
 * Conecta el módulo de pagos con el módulo de productos/catálogo
 *
 * Clean Architecture:
 * - Implementa interface del Domain
 * - Usa PrismaService (inyección de dependencias NestJS)
 * - Solo expone los métodos necesarios para pagos
 */
@Injectable()
export class ProductoRepositoryAdapter implements IProductoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerPorId(id: string): Promise<Producto | null> {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        tipo: true,
      },
    });

    if (!producto) {
      return null;
    }

    return {
      id: producto.id,
      nombre: producto.nombre,
      tipo: this.mapearTipoProducto(producto.tipo),
    };
  }

  async obtenerPorIds(ids: readonly string[]): Promise<Producto[]> {
    const productos = await this.prisma.producto.findMany({
      where: {
        id: { in: [...ids] },
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
      },
    });

    return productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tipo: this.mapearTipoProducto(p.tipo),
    }));
  }

  /**
   * Mapea tipos de Prisma a tipos del Domain
   * Prisma usa TipoProducto enum, nosotros también
   */
  private mapearTipoProducto(tipo: string): TipoProducto {
    // Por simplicidad, asumimos que todos los productos son Club Matemáticas
    // TODO: Expandir cuando tengamos más tipos de productos definidos
    return 'CLUB_MATEMATICAS' as TipoProducto;
  }
}
