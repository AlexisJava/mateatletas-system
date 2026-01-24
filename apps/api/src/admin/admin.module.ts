import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PlanificacionesAdminController } from './planificaciones-admin.controller';
import { AdminDlqController } from './controllers/admin-dlq.controller';
import { AdminService } from './admin.service';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAlertasService } from './services/admin-alertas.service';
import { AdminUsuariosService } from './services/admin-usuarios.service';
import { AdminRolesService } from './services/admin-roles.service';
import { AdminEstudiantesService } from './services/admin-estudiantes.service';
import { AdminCredencialesService } from './services/admin-credenciales.service';
import { AdminPagosService } from './services/admin-pagos.service';
import { AdminTareasService } from './services/admin-tareas.service';
import { AdminPlanificacionesService } from './services/admin-planificaciones.service';
import { DocenteAsignacionesService } from './services/docente-asignaciones.service';
import { GrupoPedagogicoService } from './services/grupo-pedagogico.service';
import { ClaseGruposService } from './clase-grupos.service';
import { AsistenciasService } from './asistencias.service';
import { ComisionesService } from './comisiones.service';
import { DatabaseModule } from '../core/database/database.module';
import { PagosModule } from '../pagos/pagos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

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
  imports: [DatabaseModule, PagosModule, NotificacionesModule],
  controllers: [
    AdminController,
    PlanificacionesAdminController,
    AdminDlqController,
  ],
  providers: [
    AdminService,
    // Servicios especializados (extraídos de AdminService monolítico)
    AdminStatsService,
    AdminAlertasService,
    AdminUsuariosService,
    AdminRolesService,
    AdminEstudiantesService,
    AdminCredencialesService,
    AdminPagosService,
    AdminTareasService,
    AdminPlanificacionesService,
    DocenteAsignacionesService,
    GrupoPedagogicoService,
    ClaseGruposService,
    AsistenciasService,
    ComisionesService,
  ],
  exports: [
    AdminService,
    AdminStatsService,
    AdminAlertasService,
    AdminUsuariosService,
    AdminRolesService,
    AdminEstudiantesService,
    AdminPlanificacionesService,
  ],
})
export class AdminModule {}
