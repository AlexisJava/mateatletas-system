import { Module, forwardRef } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { EstudiantesController } from './estudiantes.controller';
import { EquiposController } from './equipos.controller';
import { AuthModule } from '../auth/auth.module';
import { GamificacionModule } from '../gamificacion/gamificacion.module';

/**
 * Módulo de Estudiantes
 * Gestiona la funcionalidad CRUD de estudiantes y equipos
 * PrismaService está disponible globalmente a través de DatabaseModule
 */
@Module({
  imports: [AuthModule, forwardRef(() => GamificacionModule)],
  controllers: [EstudiantesController, EquiposController],
  providers: [EstudiantesService],
  exports: [EstudiantesService],
})
export class EstudiantesModule {}
