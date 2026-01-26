import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { AnunciosService } from './anuncios.service';
import {
  AnunciosDocenteController,
  AnunciosTutorController,
  AnunciosEstudianteController,
} from './anuncios.controller';

/**
 * Módulo de Anuncios
 *
 * Funcionalidad:
 * - CRUD de anuncios para docentes
 * - Lectura de anuncios para tutores (de los docentes de sus hijos)
 * - Lectura de anuncios para estudiantes (de sus comisiones)
 * - Notificaciones automáticas para anuncios IMPORTANTE/URGENTE
 */
@Module({
  imports: [DatabaseModule, NotificacionesModule],
  controllers: [
    AnunciosDocenteController,
    AnunciosTutorController,
    AnunciosEstudianteController,
  ],
  providers: [AnunciosService],
  exports: [AnunciosService],
})
export class AnunciosModule {}
