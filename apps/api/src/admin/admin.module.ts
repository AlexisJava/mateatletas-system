import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RutasCurricularesService } from './rutas-curriculares.service';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAlertasService } from './services/admin-alertas.service';
import { AdminUsuariosService } from './services/admin-usuarios.service';
import { AdminRolesService } from './services/admin-roles.service';
import { AdminEstudiantesService } from './services/admin-estudiantes.service';
import { SectoresRutasService } from './services/sectores-rutas.service';
import { ClaseGruposService } from './clase-grupos.service';
import { AsistenciasService } from './asistencias.service';
import { DatabaseModule } from '../core/database/database.module';

/**
 * Módulo administrativo con servicios especializados
 * Refactorizado para separar responsabilidades (SOLID)
 *
 * ETAPA 2: División de servicios grandes en servicios específicos
 * - AdminUsuariosService: Solo listar y eliminar usuarios
 * - AdminRolesService: Solo gestión de roles
 * - AdminEstudiantesService: Solo gestión de estudiantes
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
    AdminRolesService, // ✅ NUEVO: Gestión de roles separada
    AdminEstudiantesService, // ✅ NUEVO: Gestión de estudiantes separada
    SectoresRutasService,
    ClaseGruposService, // ✅ NUEVO: Gestión de grupos de clases recurrentes
    AsistenciasService, // ✅ NUEVO: Gestión de asistencias
  ],
  exports: [
    AdminService,
    RutasCurricularesService,
    AdminStatsService,
    AdminAlertasService,
    AdminUsuariosService,
    AdminRolesService, // ✅ Exportar para uso en otros módulos
    AdminEstudiantesService, // ✅ Exportar para uso en otros módulos
    SectoresRutasService,
  ],
})
export class AdminModule {}
