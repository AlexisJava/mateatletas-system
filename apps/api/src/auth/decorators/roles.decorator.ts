import { SetMetadata } from '@nestjs/common';

/**
 * Enum de roles disponibles en la plataforma
 * Roles: Tutor (tutores/padres), Docente (profesores), Admin (administradores), Estudiante (alumnos)
 */
export enum Role {
  Tutor = 'tutor',
  Docente = 'docente',
  Admin = 'admin',
  Estudiante = 'estudiante',
}

/**
 * Clave para almacenar los roles requeridos en los metadatos
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator para especificar qué roles tienen acceso a un endpoint
 *
 * Uso:
 * @Roles(Role.TUTOR)
 * @Get('dashboard')
 * getDashboard() {
 *   return 'Dashboard del tutor';
 * }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
