/**
 * Utilidades para manejo seguro de roles de usuario
 */

import { Role } from '../../auth/decorators/roles.decorator';
import { JsonValue } from '@prisma/client/runtime/library';

/**
 * Parsea roles de usuario de forma segura, manejando diferentes formatos
 * @param roles - Puede ser string (JSON), array, JsonValue o undefined
 * @returns Array de roles como Role enum
 */
export function parseUserRoles(
  roles: string | Role[] | JsonValue | null | undefined,
): Role[] {
  const validRoles = new Set<Role>([
    Role.Admin,
    Role.Docente,
    Role.Estudiante,
    Role.Tutor,
  ]);
  const isRole = (value: unknown): value is Role =>
    typeof value === 'string' && validRoles.has(value as Role);

  // Si ya es un array, retornarlo directamente
  if (Array.isArray(roles)) {
    // Filtrar solo elementos válidos como Role (strings)
    return roles.filter(isRole) as Role[];
  }

  // Si es un string, intentar parsearlo como JSON
  if (typeof roles === 'string') {
    try {
      const parsed = JSON.parse(roles) as unknown;
      // Verificar que el resultado sea un array
      if (Array.isArray(parsed)) {
        return parsed.filter(isRole);
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
