import { Module } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesController } from './estudiantes.controller';
import { EquiposController } from './equipos.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de Estudiantes
 * Gestiona la funcionalidad CRUD de estudiantes y equipos
 * PrismaService está disponible globalmente a través de DatabaseModule
 */
@Module({
  imports: [AuthModule],
  controllers: [EstudiantesController, EquiposController],
  providers: [EstudiantesService],
  exports: [EstudiantesService],
})
export class EstudiantesModule {}
