import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Módulo de Catálogo de Productos
 * Gestiona productos disponibles: suscripciones, cursos y recursos digitales
 */
@Module({
  controllers: [ProductosController],
  providers: [ProductosService, PrismaService],
  exports: [ProductosService], // Exportar para uso en otros módulos (ej: Pagos)
})
export class CatalogoModule {}
