import { z } from 'zod';
import {
  ISODateSchema,
  UUIDSchema,
  EmailSchema,
  RoleSchema,
  NonNegativeNumberSchema,
} from '../../shared/schemas/common.schema';

/**
 * Schema para AdminUser
 */
export const AdminUserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  role: RoleSchema.exclude(['estudiante']), // Admin users no pueden ser solo estudiantes
  roles: z.array(RoleSchema).optional(),
  activo: z.boolean(),
  createdAt: ISODateSchema,
  updatedAt: ISODateSchema,
  _count: z
    .object({
      estudiantes: NonNegativeNumberSchema.optional(),
      equipos: NonNegativeNumberSchema.optional(),
      clases: NonNegativeNumberSchema.optional(),
    })
    .optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

/**
 * Schema para ChangeRoleDto (input)
 */
export const ChangeRoleDtoSchema = z.object({
  role: RoleSchema.exclude(['estudiante']),
});

export type ChangeRoleDto = z.infer<typeof ChangeRoleDtoSchema>;

/**
 * Schema para UpdateRolesDto (input)
 */
export const UpdateRolesDtoSchema = z.object({
  roles: z.array(RoleSchema).min(1, 'Debe tener al menos un rol'),
});

export type UpdateRolesDto = z.infer<typeof UpdateRolesDtoSchema>;

/**
 * Parser seguro para AdminUser
 */
export function parseAdminUser(data: unknown): AdminUser {
  return AdminUserSchema.parse(data);
}

/**
 * Parser seguro para array de AdminUser
 */
export function parseAdminUsers(data: unknown): AdminUser[] {
  return z.array(AdminUserSchema).parse(data);
}

/**
 * Parser seguro que retorna null en caso de error
 */
export function safeParseAdminUser(data: unknown): AdminUser | null {
  const result = AdminUserSchema.safeParse(data);
  return result.success ? result.data : null;
}
