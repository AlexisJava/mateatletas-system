import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RutasCurricularesService } from './rutas-curriculares.service';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAlertasService } from './services/admin-alertas.service';
import { AdminUsuariosService } from './services/admin-usuarios.service';
import { DatabaseModule } from '../core/database/database.module';

/**
 * Módulo administrativo con servicios especializados
 * Refactorizado para separar responsabilidades en subdominios
 */
@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    RutasCurricularesService,
    // Servicios especializados (extraídos de AdminService monolítico)
    AdminStatsService,
    AdminAlertasService,
    AdminUsuariosService,
  ],
  exports: [
    AdminService,
    RutasCurricularesService,
    AdminStatsService,
    AdminAlertasService,
    AdminUsuariosService,
  ],
})
export class AdminModule {}
