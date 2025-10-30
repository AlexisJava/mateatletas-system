/**
 * TiendaModule
 * Módulo que contiene la lógica de la tienda, recursos e inventario
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { RecursosService } from './recursos.service';
import { TiendaService } from './tienda.service';
import { RecursosController } from './recursos.controller';
import { TiendaController } from './tienda.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [RecursosController, TiendaController],
  providers: [RecursosService, TiendaService],
  exports: [RecursosService, TiendaService],
})
export class TiendaModule {}
