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

type DashboardStatsResult = Awaited<
  ReturnType<AdminStatsService['getDashboardStats']>
>;
type SystemStatsResult = Awaited<
  ReturnType<AdminStatsService['getSystemStats']>
>;
type AlertListResult = Awaited<
  ReturnType<AdminAlertasService['listarAlertas']>
>;
type ResolverAlertaResult = Awaited<
  ReturnType<AdminAlertasService['resolverAlerta']>
>;
type SugerirSolucionResult = Awaited<
  ReturnType<AdminAlertasService['sugerirSolucion']>
>;
type CrearAlertaResult = Awaited<
  ReturnType<AdminAlertasService['crearAlerta']>
>;
type UsuariosListResult = Awaited<
  ReturnType<AdminUsuariosService['listarUsuarios']>
>;
type DeleteUserResult = Awaited<
  ReturnType<AdminUsuariosService['deleteUser']>
>;
type EstudiantesListResult = Awaited<
  ReturnType<AdminEstudiantesService['listarEstudiantes']>
>;
type CrearEstudianteResult = Awaited<
  ReturnType<AdminEstudiantesService['crearEstudianteRapido']>
>;
type RoleMutationResult = Awaited<
  ReturnType<AdminRolesService['changeUserRole']>
>;

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

  // Circuit Breakers para cada operación delegada
  private readonly dashboardStatsCircuit = new CircuitBreaker({
    name: 'AdminStatsService.getDashboardStats',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => ({
      activeMemberships: 0,
      upcomingClasses: 0,
      openAlerts: 0,
      totalEstudiantes: 0,
      totalDocentes: 0,
      totalTutores: 0,
      fecha: new Date(),
    }),
  });

  private readonly systemStatsCircuit = new CircuitBreaker({
    name: 'AdminStatsService.getSystemStats',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => ({
      totalUsuarios: 0,
      totalTutores: 0,
      totalDocentes: 0,
      totalEstudiantes: 0,
      totalClases: 0,
      clasesActivas: 0,
      totalProductos: 0,
      ingresosTotal: 0,
    }),
  });

  private readonly listarAlertasCircuit = new CircuitBreaker({
    name: 'AdminAlertasService.listarAlertas',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => [],
  });

  private readonly resolverAlertaCircuit = new CircuitBreaker({
    name: 'AdminAlertasService.resolverAlerta',
    failureThreshold: 5,
    resetTimeout: 60000,
  });

  private readonly sugerirSolucionCircuit = new CircuitBreaker({
    name: 'AdminAlertasService.sugerirSolucion',
    failureThreshold: 5,
    resetTimeout: 60000,
  });

  private readonly crearAlertaCircuit = new CircuitBreaker({
    name: 'AdminAlertasService.crearAlerta',
    failureThreshold: 5,
    resetTimeout: 60000,
  });

  private readonly listarUsuariosCircuit = new CircuitBreaker({
    name: 'AdminUsuariosService.listarUsuarios',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => [],
  });

  private readonly deleteUsuarioCircuit = new CircuitBreaker({
    name: 'AdminUsuariosService.deleteUser',
    failureThreshold: 5,
    resetTimeout: 60000,
  });

  private readonly listarEstudiantesCircuit = new CircuitBreaker({
    name: 'AdminEstudiantesService.listarEstudiantes',
    failureThreshold: 5,
    resetTimeout: 60000,
    fallback: () => ({
      data: [],
      metadata: {
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  });

  private readonly crearEstudianteCircuit = new CircuitBreaker({
    name: 'AdminEstudiantesService.crearEstudianteRapido',
    failureThreshold: 5,
    resetTimeout: 60000,
  });

  private readonly rolesCircuit = new CircuitBreaker({
    name: 'AdminRolesService',
    failureThreshold: 5,
    resetTimeout: 60000,
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
    return this.dashboardStatsCircuit.execute(() =>
      this.statsService.getDashboardStats(),
    );
  }

  /**
   * Obtener estadísticas agregadas para el panel administrativo
   * DELEGACIÓN: AdminStatsService
   * PROTECCIÓN: Circuit Breaker con fallback (stats en 0)
   */
  async getSystemStats() {
    return this.systemStatsCircuit.execute(() =>
      this.statsService.getSystemStats(),
    );
  }

  /**
   * Listar alertas pendientes (no resueltas)
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker con fallback (array vacío)
   */
  async listarAlertas() {
    return this.listarAlertasCircuit.execute(() =>
      this.alertasService.listarAlertas(),
    );
  }

  /**
   * Marcar una alerta como resuelta
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async resolverAlerta(id: string) {
    return this.resolverAlertaCircuit.execute(() =>
      this.alertasService.resolverAlerta(id),
    );
  }

  /**
   * Generar sugerencia para resolver una alerta
   * DELEGACIÓN: AdminAlertasService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async sugerirSolucion(alertaId: string) {
    return this.sugerirSolucionCircuit.execute(() =>
      this.alertasService.sugerirSolucion(alertaId),
    );
  }

  /**
   * Listar usuarios para el panel administrativo
   * DELEGACIÓN: AdminUsuariosService
   * PROTECCIÓN: Circuit Breaker con fallback (array vacío)
   */
  async listarUsuarios() {
    return this.listarUsuariosCircuit.execute(() =>
      this.usuariosService.listarUsuarios(),
    );
  }

  /**
   * Listar estudiantes del sistema
   * DELEGACIÓN: AdminEstudiantesService
   * PROTECCIÓN: Circuit Breaker con fallback (array vacío)
   */
  async listarEstudiantes() {
    return this.listarEstudiantesCircuit.execute(() =>
      this.estudiantesService.listarEstudiantes(),
    );
  }

  /**
   * Crear estudiante rápido con tutor automático
   * DELEGACIÓN: AdminEstudiantesService
   * PROTECCIÓN: Circuit Breaker (sin fallback - debe fallar si servicio cae)
   */
  async crearEstudianteRapido(data: CrearEstudianteRapidoData) {
    return this.crearEstudianteCircuit.execute(() =>
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
    return this.deleteUsuarioCircuit.execute(() =>
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
    return this.crearAlertaCircuit.execute(() =>
      this.alertasService.crearAlerta(estudianteId, claseId, descripcion),
    );
  }

  /**
   * Obtener todas las credenciales de usuarios
   * Retorna todos los usuarios (tutores, estudiantes, docentes, admins) con sus credenciales temporales
   * Para la planilla administrativa de primer ingreso
   */
  async obtenerTodasLasCredenciales() {
    // Obtener todos los tutores con password_temporal
    const tutores = await this.prisma.tutor.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        password_temporal: true,
        debe_cambiar_password: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Obtener todos los estudiantes con password_temporal
    const estudiantes = await this.prisma.estudiante.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        username: true,
        password_temporal: true,
        debe_cambiar_password: true,
        createdAt: true,
        tutor: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Obtener todos los docentes con password_temporal
    const docentes = await this.prisma.docente.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        password_temporal: true,
        debe_cambiar_password: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formatear los datos para la planilla
    return {
      tutores: tutores.map((t) => ({
        id: t.id,
        rol: 'Tutor',
        nombre: t.nombre,
        apellido: t.apellido,
        usuario: t.email,
        password_temporal: t.password_temporal,
        estado: t.debe_cambiar_password ? 'Pendiente' : 'Contraseña Cambiada',
        fecha_creacion: t.createdAt,
      })),
      estudiantes: estudiantes.map((e) => ({
        id: e.id,
        rol: 'Estudiante',
        nombre: e.nombre,
        apellido: e.apellido,
        usuario: e.username,
        password_temporal: e.password_temporal,
        estado: e.debe_cambiar_password ? 'Pendiente' : 'Contraseña Cambiada',
        tutor: `${e.tutor.nombre} ${e.tutor.apellido}`,
        fecha_creacion: e.createdAt,
      })),
      docentes: docentes.map((d) => ({
        id: d.id,
        rol: 'Docente',
        nombre: d.nombre,
        apellido: d.apellido,
        usuario: d.email,
        password_temporal: d.password_temporal,
        estado: d.debe_cambiar_password ? 'Pendiente' : 'Contraseña Cambiada',
        fecha_creacion: d.createdAt,
      })),
    };
  }

  /**
   * Obtener métricas de los circuit breakers (para monitoring)
   * Útil para dashboards de observabilidad
   */
  getCircuitMetrics() {
    return {
      dashboardStats: this.dashboardStatsCircuit.getMetrics(),
      systemStats: this.systemStatsCircuit.getMetrics(),
      listarAlertas: this.listarAlertasCircuit.getMetrics(),
      resolverAlerta: this.resolverAlertaCircuit.getMetrics(),
      sugerirSolucion: this.sugerirSolucionCircuit.getMetrics(),
      crearAlerta: this.crearAlertaCircuit.getMetrics(),
      listarUsuarios: this.listarUsuariosCircuit.getMetrics(),
      deleteUsuario: this.deleteUsuarioCircuit.getMetrics(),
      listarEstudiantes: this.listarEstudiantesCircuit.getMetrics(),
      crearEstudiante: this.crearEstudianteCircuit.getMetrics(),
      roles: this.rolesCircuit.getMetrics(),
    };
  }
}
