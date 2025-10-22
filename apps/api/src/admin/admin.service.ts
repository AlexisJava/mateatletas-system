import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { Role } from '../auth/decorators/roles.decorator';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAlertasService } from './services/admin-alertas.service';
import { AdminUsuariosService } from './services/admin-usuarios.service';
import { AdminRolesService } from './services/admin-roles.service';
import { AdminEstudiantesService } from './services/admin-estudiantes.service';
import { CircuitBreaker } from '../common/circuit-breaker';

type CrearEstudianteRapidoData = Parameters<
  AdminEstudiantesService['crearEstudianteRapido']
>[0];

/**
 * Servicio principal de administración
 * REFACTORIZADO (ETAPA 2): Delega operaciones específicas a servicios especializados
 * Actúa como Facade Pattern para mantener compatibilidad con controlador
 *
 * ARQUITECTURA:
 * - AdminUsuariosService: Listar y eliminar usuarios
 * - AdminRolesService: Gestión de roles
 * - AdminEstudiantesService: CRUD de estudiantes
 * - AdminStatsService: Estadísticas
 * - AdminAlertasService: Sistema de alertas
 *
 * RESILIENCIA (ETAPA 3 - Circuit Breakers):
 * - Protege contra fallos en cascada
 * - Si un servicio delegado falla 5+ veces, circuit se abre
 * - Retorna fallbacks (datos por defecto) en lugar de crashear
 * - Circuit se cierra automáticamente después de 60s
 *
 * BENEFICIOS:
 * - Si AdminStatsService falla → Dashboard muestra stats en 0, pero NO crashea
 * - Si AdminAlertasService falla → Muestra array vacío, resto del admin funciona
 * - Permite degradación elegante en lugar de fallo total
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // Circuit Breakers para cada servicio delegado
  private readonly statsCircuit = new CircuitBreaker({
    name: 'AdminStatsService',
    failureThreshold: 5,
    resetTimeout: 60000, // 60 segundos
    fallback: () => ({
      totalEstudiantes: 0,
      totalDocentes: 0,
      totalClases: 0,
      clasesHoy: 0,
    }),
  });

  private readonly alertasCircuit = new CircuitBreaker({
    name: 'AdminAlertasService',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => [],
  });

  private readonly usuariosCircuit = new CircuitBreaker({
    name: 'AdminUsuariosService',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => [],
  });

  private readonly estudiantesCircuit = new CircuitBreaker({
    name: 'AdminEstudiantesService',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => [],
  });

  private readonly rolesCircuit = new CircuitBreaker({
    name: 'AdminRolesService',
    failureThreshold: 5,
    resetTimeout: 60000,
    // No fallback para roles - Si falla, debe lanzar error (operaciones críticas)
  });

  constructor(
    private prisma: PrismaService,
    private statsService: AdminStatsService,
    private alertasService: AdminAlertasService,
    private usuariosService: AdminUsuariosService,
    private rolesService: AdminRolesService,
    private estudiantesService: AdminEstudiantesService,
  ) {
    this.logger.log('AdminService initialized with circuit breakers');
  }

  /**
   * Obtener estadísticas del dashboard administrativo
   * DELEGACIÓN: AdminStatsService
   * PROTECCIÓN: Circuit Breaker con fallback (stats en 0)
   */
  async getDashboardStats() {
    return this.statsCircuit.execute(
      () => this.statsService.getDashboardStats(),
    );
  }

  /**
   * Obtener estadísticas agregadas para el panel administrativo
   * DELEGACIÓN: AdminStatsService
   * PROTECCIÓN: Circuit Breaker con fallback (stats en 0)
   */
  async getSystemStats() {
    return this.statsCircuit.execute(() => this.statsService.getSystemStats());
  }

  /**
   * Listar alertas pendientes (no resueltas)
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker con fallback (array vacío)
   */
  async listarAlertas() {
    return this.alertasCircuit.execute(() =>
      this.alertasService.listarAlertas(),
    );
  }

  /**
   * Marcar una alerta como resuelta
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async resolverAlerta(id: string) {
    return this.alertasCircuit.execute(() =>
      this.alertasService.resolverAlerta(id),
    );
  }

  /**
   * Generar sugerencia para resolver una alerta
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async sugerirSolucion(alertaId: string) {
    return this.alertasCircuit.execute(() =>
      this.alertasService.sugerirSolucion(alertaId),
    );
  }

  /**
   * Listar usuarios para el panel administrativo
   * DELEGACIÓN: AdminUsuariosService
   * PROTECCIÓN: Circuit Breaker con fallback (array vacío)
   */
  async listarUsuarios() {
    return this.usuariosCircuit.execute(() =>
      this.usuariosService.listarUsuarios(),
    );
  }

  /**
   * Listar estudiantes del sistema
   * DELEGACIÓN: AdminEstudiantesService
   * PROTECCIÓN: Circuit Breaker con fallback (array vacío)
   */
  async listarEstudiantes() {
    return this.estudiantesCircuit.execute(() =>
      this.estudiantesService.listarEstudiantes(),
    );
  }

  /**
   * Crear estudiante rápido con tutor automático
   * DELEGACIÓN: AdminEstudiantesService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async crearEstudianteRapido(data: CrearEstudianteRapidoData) {
    return this.estudiantesCircuit.execute(() =>
      this.estudiantesService.crearEstudianteRapido(data),
    );
  }

  /**
   * Cambiar el rol de un usuario (agregar rol)
   * DELEGACIÓN: AdminRolesService
   * PROTECCIÓN: Circuit Breaker (sin fallback - operación crítica)
   */
  async changeUserRole(id: string, role: Role) {
    return this.rolesCircuit.execute(() =>
      this.rolesService.changeUserRole(id, role),
    );
  }

  /**
   * Actualizar roles completos de un usuario (sobrescribir)
   * DELEGACIÓN: AdminRolesService
   * PROTECCIÓN: Circuit Breaker (sin fallback - operación crítica)
   */
  async updateUserRoles(id: string, roles: Role[]) {
    return this.rolesCircuit.execute(() =>
      this.rolesService.updateUserRoles(id, roles),
    );
  }

  /**
   * Eliminar usuario de la plataforma
   * DELEGACIÓN: AdminUsuariosService
   * PROTECCIÓN: Circuit Breaker (sin fallback - operación crítica)
   */
  async deleteUser(id: string) {
    return this.usuariosCircuit.execute(() =>
      this.usuariosService.deleteUser(id),
    );
  }

  /**
   * Crear una alerta manualmente (para testing)
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async crearAlerta(
    estudianteId: string,
    claseId: string,
    descripcion: string,
  ) {
    return this.alertasCircuit.execute(() =>
      this.alertasService.crearAlerta(estudianteId, claseId, descripcion),
    );
  }

  /**
   * Obtener métricas de los circuit breakers (para monitoring)
   * Útil para dashboards de observabilidad
   */
  getCircuitMetrics() {
    return {
      stats: this.statsCircuit.getMetrics(),
      alertas: this.alertasCircuit.getMetrics(),
      usuarios: this.usuariosCircuit.getMetrics(),
      estudiantes: this.estudiantesCircuit.getMetrics(),
      roles: this.rolesCircuit.getMetrics(),
    };
  }
}
