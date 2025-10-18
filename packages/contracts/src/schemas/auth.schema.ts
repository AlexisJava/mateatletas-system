import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;

/**
 * Schema para registro de tutor
 */
export const registerTutorSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().optional(),
  telefono: z.string().optional(),
});

export type RegisterTutorDto = z.infer<typeof registerTutorSchema>;

/**
 * Schema para JWT payload
 */
export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Schema para auth response
 */
export const authResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    nombre: z.string(),
    apellido: z.string(),
    roles: z.array(z.string()),
  }),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
