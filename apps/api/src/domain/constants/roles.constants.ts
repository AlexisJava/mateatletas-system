/**
 * Constantes de dominio para roles y permisos
 *
 * Centraliza:
 * - Roles del sistema
 * - Jerarquía de permisos
 * - Helpers de validación
 */

/**
 * Roles del sistema
 */
export enum Role {
  ESTUDIANTE = 'ESTUDIANTE',
  TUTOR = 'TUTOR',
  DOCENTE = 'DOCENTE',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Jerarquía de roles (de menor a mayor privilegio)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.ESTUDIANTE]: 1,
  [Role.TUTOR]: 2,
  [Role.DOCENTE]: 3,
  [Role.ADMIN]: 4,
  [Role.SUPER_ADMIN]: 5,
};

/**
 * Labels legibles para roles
 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.ESTUDIANTE]: 'Estudiante',
  [Role.TUTOR]: 'Tutor/Padre',
  [Role.DOCENTE]: 'Docente',
  [Role.ADMIN]: 'Administrador',
  [Role.SUPER_ADMIN]: 'Super Administrador',
};

/**
 * Permisos asociados a cada rol
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [Role.ESTUDIANTE]: [
    'leer:clases_propias',
    'leer:cursos',
    'leer:tareas_propias',
    'crear:tarea_entrega',
    'leer:perfil_propio',
    'actualizar:perfil_propio',
  ],
  [Role.TUTOR]: [
    'leer:clases_propias',
    'leer:cursos',
    'leer:estudiantes_propios',
    'leer:perfil_propio',
    'actualizar:perfil_propio',
    'crear:inscripcion_estudiante',
  ],
  [Role.DOCENTE]: [
    'leer:clases_propias',
    'crear:clase',
    'actualizar:clase_propia',
    'eliminar:clase_propia',
    'leer:estudiantes',
    'crear:tarea',
    'actualizar:tarea',
    'eliminar:tarea',
    'leer:asistencias',
    'crear:asistencia',
    'actualizar:asistencia',
    'leer:calendario_propio',
    'crear:evento_calendario',
    'actualizar:evento_calendario',
    'eliminar:evento_calendario',
  ],
  [Role.ADMIN]: [
    'leer:clases',
    'crear:clase',
    'actualizar:clase',
    'eliminar:clase',
    'leer:estudiantes',
    'crear:estudiante',
    'actualizar:estudiante',
    'eliminar:estudiante',
    'leer:docentes',
    'crear:docente',
    'actualizar:docente',
    'eliminar:docente',
    'leer:cursos',
    'crear:curso',
    'actualizar:curso',
    'eliminar:curso',
    'leer:pagos',
    'crear:pago',
    'actualizar:pago',
    'leer:reportes',
  ],
  [Role.SUPER_ADMIN]: [
    '*', // Todos los permisos
  ],
};

/**
 * Verificar si un rol tiene un permiso específico
 * @param role - Rol a verificar
 * @param permission - Permiso requerido
 * @returns true si el rol tiene el permiso
 */
export function tienePermiso(role: Role, permission: string): boolean {
  const permisos = ROLE_PERMISSIONS[role];

  // Super admin tiene todos los permisos
  if (permisos.includes('*')) {
    return true;
  }

  return permisos.includes(permission);
}

/**
 * Verificar si un rol es mayor o igual a otro en jerarquía
 * @param role - Rol a verificar
 * @param minRole - Rol mínimo requerido
 * @returns true si role >= minRole
 */
export function cumpleJerarquia(role: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Verificar si un rol puede actuar sobre otro (ej: admin puede modificar docente)
 * @param actorRole - Rol que intenta realizar acción
 * @param targetRole - Rol objetivo de la acción
 * @returns true si actor tiene permisos sobre target
 */
export function puedeActuarSobre(actorRole: Role, targetRole: Role): boolean {
  // Super admin puede actuar sobre cualquiera
  if (actorRole === Role.SUPER_ADMIN) {
    return true;
  }

  // Admin puede actuar sobre roles menores (no super admin)
  if (actorRole === Role.ADMIN && targetRole !== Role.SUPER_ADMIN) {
    return true;
  }

  // Docente puede actuar sobre estudiantes
  if (actorRole === Role.DOCENTE && targetRole === Role.ESTUDIANTE) {
    return true;
  }

  // Tutor puede actuar sobre sus estudiantes (verificación adicional en service)
  if (actorRole === Role.TUTOR && targetRole === Role.ESTUDIANTE) {
    return true;
  }

  return false;
}

/**
 * Obtener lista de roles que un rol puede asignar/modificar
 * @param role - Rol actual
 * @returns Array de roles que puede gestionar
 */
export function getRolesGestionables(role: Role): Role[] {
  switch (role) {
    case Role.SUPER_ADMIN:
      return [Role.ADMIN, Role.DOCENTE, Role.TUTOR, Role.ESTUDIANTE];
    case Role.ADMIN:
      return [Role.DOCENTE, Role.TUTOR, Role.ESTUDIANTE];
    case Role.DOCENTE:
      return [Role.ESTUDIANTE];
    default:
      return [];
  }
}

/**
 * Verificar si un string es un Role válido
 * @param role - String a validar
 * @returns true si es un Role válido
 */
export function esRoleValido(role: string): role is Role {
  return Object.values(Role).includes(role as Role);
}
