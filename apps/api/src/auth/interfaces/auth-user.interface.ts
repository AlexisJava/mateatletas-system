import { Request } from 'express';

import { Role } from '../decorators/roles.decorator';

/**
 * Representa el usuario autenticado disponible en request.user
 * Garantiza la presencia de los campos mínimos compartidos entre roles
 */
export interface AuthUser {
  /** Identificador único del usuario */
  id: string;
  /** Correo electrónico principal del usuario */
  email: string;
  /** Roles asignados al usuario (multi-rol soportado) */
  roles: Role[];
  /** Rol principal (backward compatibility) */
  role?: Role;
}

/**
 * Request de Express que contiene un usuario autenticado
 */
export type RequestWithAuthUser = Request & { user: AuthUser };
