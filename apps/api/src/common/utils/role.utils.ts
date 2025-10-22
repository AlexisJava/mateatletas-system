/**
 * Utilidades para manejo seguro de roles de usuario
 */

import { Role } from '../../auth/decorators/roles.decorator';

/**
 * Parsea roles de usuario de forma segura, manejando diferentes formatos
 * @param roles - Puede ser string (JSON), array o undefined
 * @returns Array de roles como Role enum
 */
export function parseUserRoles(roles: unknown): Role[] {
  // Si ya es un array, retornarlo directamente
  if (Array.isArray(roles)) {
    return roles;
  }

  // Si es un string, intentar parsearlo como JSON
  if (typeof roles === 'string') {
    try {
      const parsed = JSON.parse(roles);
      // Verificar que el resultado sea un array
      if (Array.isArray(parsed)) {
        return parsed;
      }
      console.warn('Roles parseados no son un array:', parsed);
      return [];
    } catch (error) {
      console.error('Error al parsear roles JSON:', error);
      return [];
    }
  }

  // Para cualquier otro caso (undefined, null, object, etc.)
  return [];
}

/**
 * Valida que un array de roles contenga solo valores permitidos
 * @param roles - Array de roles a validar
 * @param allowedRoles - Roles permitidos (opcional)
 * @returns Array de roles válidos
 */
export function validateRoles(
  roles: string[],
  allowedRoles: string[] = ['tutor', 'docente', 'admin'],
): string[] {
  return roles.filter((role) => allowedRoles.includes(role));
}

/**
 * Convierte roles a formato JSON string de forma segura
 * @param roles - Array de roles
 * @returns String JSON de roles
 */
export function stringifyRoles(roles: string[]): string {
  if (!Array.isArray(roles)) {
    return '[]';
  }
  return JSON.stringify(roles);
}
