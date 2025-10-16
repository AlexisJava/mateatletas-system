import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { Role } from '../auth/decorators/roles.decorator';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAlertasService } from './services/admin-alertas.service';
import { AdminUsuariosService } from './services/admin-usuarios.service';

/**
 * Servicio principal de administración
 * REFACTORIZADO: Delega operaciones específicas a servicios especializados
 * Mantiene compatibilidad con controlador existente actuando como facade
 */
@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private statsService: AdminStatsService,
    private alertasService: AdminAlertasService,
    private usuariosService: AdminUsuariosService,
  ) {}

  /**
   * Obtener estadísticas del dashboard administrativo
   * DELEGACIÓN: AdminStatsService
   */
  async getDashboardStats() {
    return this.statsService.getDashboardStats();
  }

  /**
   * Obtener estadísticas agregadas para el panel administrativo
   * DELEGACIÓN: AdminStatsService
   */
  async getSystemStats() {
    return this.statsService.getSystemStats();
  }

  /**
   * Listar alertas pendientes (no resueltas)
   * DELEGACIÓN: AdminAlertasService
   */
  async listarAlertas() {
    return this.alertasService.listarAlertas();
  }

  /**
   * Marcar una alerta como resuelta
   * DELEGACIÓN: AdminAlertasService
   */
  async resolverAlerta(id: string) {
    return this.alertasService.resolverAlerta(id);
  }

  /**
   * Generar sugerencia para resolver una alerta
   * DELEGACIÓN: AdminAlertasService
   */
  async sugerirSolucion(alertaId: string) {
    return this.alertasService.sugerirSolucion(alertaId);
  }

  /**
   * Listar usuarios para el panel administrativo
   * DELEGACIÓN: AdminUsuariosService
   */
  async listarUsuarios() {
    return this.usuariosService.listarUsuarios();
  }

  /**
   * Cambiar el rol de un usuario gestionado por el panel administrativo
   * DELEGACIÓN: AdminUsuariosService
   */
  async changeUserRole(id: string, role: Role) {
    return this.usuariosService.changeUserRole(id, role);
  }

  /**
   * Eliminar usuario de la plataforma
   * DELEGACIÓN: AdminUsuariosService
   */
  async deleteUser(id: string) {
    return this.usuariosService.deleteUser(id);
  }

  /**
   * Crear una alerta manualmente (para testing)
   * DELEGACIÓN: AdminAlertasService
   */
  async crearAlerta(
    estudianteId: string,
    claseId: string,
    descripcion: string,
  ) {
    return this.alertasService.crearAlerta(estudianteId, claseId, descripcion);
  }
}
