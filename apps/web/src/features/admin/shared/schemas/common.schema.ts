import { z } from 'zod';

/**
 * Schemas comunes compartidos entre features del admin
 */

// Roles disponibles
export const RoleSchema = z.enum(['tutor', 'docente', 'admin', 'estudiante']);
export type Role = z.infer<typeof RoleSchema>;

// Estado de salud del sistema
export const SystemHealthStatusSchema = z.enum(['healthy', 'degraded', 'down']);
export type SystemHealthStatus = z.infer<typeof SystemHealthStatusSchema>;

// Fecha en formato ISO string
export const ISODateSchema = z.string().datetime();

// ID como string UUID
export const UUIDSchema = z.string().uuid();

// Email válido
export const EmailSchema = z.string().email();

// Número positivo
export const PositiveNumberSchema = z.number().positive();

// Número no negativo
export const NonNegativeNumberSchema = z.number().nonnegative();
