import { Module } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { CatalogoController } from './catalogo.controller';

/**
 * Módulo de Catálogo de Componentes
 *
 * Gestiona el catálogo de componentes disponibles para el editor de semanas.
 *
 * NOTA: PrismaService está disponible globalmente via DatabaseModule (@Global)
 * por lo que no es necesario importarlo explícitamente.
 */
@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
