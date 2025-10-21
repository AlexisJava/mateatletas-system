/**
 * Tipos de usuario autenticado
 * Representa el objeto user que se inyecta en request.user después de la autenticación JWT
 */

export interface BaseAuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthEstudiante extends BaseAuthUser {
  role: 'estudiante';
  edad: number;
  nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
  foto_url: string | null;
  puntos_totales: number;
  nivel_actual: number;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
  };
  equipo: {
    id: string;
    nombre: string;
    color_primario: string;
  } | null;
}

export interface AuthDocente extends BaseAuthUser {
  role: 'docente';
  titulo: string | null;
  bio: string | null;
}

export interface AuthTutor extends BaseAuthUser {
  role: 'tutor';
  dni: string;
  telefono: string | null;
  fecha_registro: Date;
  ha_completado_onboarding: boolean;
}

export interface AuthAdmin extends BaseAuthUser {
  role: 'admin';
  fecha_registro: Date;
}

/**
 * Union type para todos los tipos de usuario autenticado
 * Usar este tipo en @GetUser() decorators
 */
export type AuthUser = AuthEstudiante | AuthDocente | AuthTutor | AuthAdmin;

/**
 * Type guards para verificar el rol del usuario
 */
export function isEstudiante(user: AuthUser): user is AuthEstudiante {
  return user.role === 'estudiante';
}

export function isDocente(user: AuthUser): user is AuthDocente {
  return user.role === 'docente';
}

export function isTutor(user: AuthUser): user is AuthTutor {
  return user.role === 'tutor';
}

export function isAdmin(user: AuthUser): user is AuthAdmin {
  return user.role === 'admin';
}
