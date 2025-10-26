/**
 * Admin Dashboard Types
 */

export interface SystemStats {
  totalUsuarios: number;
  totalTutores: number;
  totalDocentes: number;
  totalEstudiantes: number;
  totalClases: number;
  clasesActivas: number;
  totalProductos: number;
  ingresosTotal: number;
}

export interface DashboardData {
  stats: SystemStats;
  recentUsers: UserSummary[];
  recentClasses: ClassSummary[];
  systemHealth: SystemHealth;
}

export interface UserSummary {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: 'tutor' | 'docente' | 'admin';
  createdAt: string;
}

export interface ClassSummary {
  id: string;
  titulo: string;
  docenteNombre: string;
  fechaHora: string;
  estado: string;
  inscritos: number;
}

export interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username?: string; // Username generado automáticamente (nombre.apellido)
  nombre: string;
  apellido: string;
  role: 'tutor' | 'docente' | 'admin'; // Rol principal (primer rol)
  roles?: ('tutor' | 'docente' | 'admin' | 'estudiante')[]; // Múltiples roles
  activo: boolean;
  password_temporal?: string; // Contraseña temporal mostrada al admin
  createdAt: string;
  updatedAt: string;
  _count?: {
    estudiantes?: number;
    equipos?: number;
    clases?: number;
  };
}

export interface ChangeRoleDto {
  role: 'tutor' | 'docente' | 'admin';
}

export interface UpdateRolesDto {
  roles: ('tutor' | 'docente' | 'admin' | 'estudiante')[];
}
