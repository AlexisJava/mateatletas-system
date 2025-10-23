import { AuthUser } from '../interfaces';
import { Role } from '../decorators/roles.decorator';

// Re-export AuthUser para que esté disponible desde este módulo
export { AuthUser } from '../interfaces';

/**
 * Tipos detallados de usuario autenticado
 * Extienden la información mínima garantizada por AuthUser con metadatos específicos
 */

export interface DetailedAuthUserBase extends Omit<AuthUser, 'role'> {
  nombre: string;
  apellido: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
}

export interface AuthEstudiante extends DetailedAuthUserBase {
  role: Role.Estudiante;
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

export interface AuthDocente extends DetailedAuthUserBase {
  role: Role.Docente;
  titulo: string | null;
  bio: string | null;
}

export interface AuthTutor extends DetailedAuthUserBase {
  role: Role.Tutor;
  dni: string;
  telefono: string | null;
  fecha_registro: Date;
  ha_completado_onboarding: boolean;
}

export interface AuthAdmin extends DetailedAuthUserBase {
  role: Role.Admin;
  fecha_registro: Date;
}

/**
 * Union type para todos los tipos de usuario autenticado
 * Usar este tipo en @GetUser() decorators
 */
export type DetailedAuthUser =
  | AuthEstudiante
  | AuthDocente
  | AuthTutor
  | AuthAdmin;

/**
 * Type guards para verificar el rol del usuario
 */
export function isEstudiante(user: DetailedAuthUser): user is AuthEstudiante {
  return user.role === 'estudiante';
}

export function isDocente(user: DetailedAuthUser): user is AuthDocente {
  return user.role === 'docente';
}

export function isTutor(user: DetailedAuthUser): user is AuthTutor {
  return user.role === 'tutor';
}

export function isAdmin(user: DetailedAuthUser): user is AuthAdmin {
  return user.role === 'admin';
}
