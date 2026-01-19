/**
 * ============================================================================
 * AUTH HELPERS - Helpers de Autenticación para Tests
 * ============================================================================
 *
 * Funciones para login y manejo de sesiones en tests de integración.
 */

import type { INestApplication } from '@nestjs/common';
import request, { type Test } from 'supertest';

import '../setup/test-env';

// ============================================================================
// TIPOS
// ============================================================================

export interface AuthSession {
  token: string;
  cookie: string;
  user?: Record<string, unknown>;
}

export const FRONTEND_ORIGIN =
  process.env.FRONTEND_URL ?? 'http://localhost:3000';

// ============================================================================
// GENERADOR DE IPs ÚNICAS PARA EVITAR THROTTLE
// ============================================================================

/**
 * Contador global de IPs para tests.
 * Cada llamada a generateUniqueIP() devuelve una IP diferente,
 * simulando que cada request viene de un cliente diferente.
 *
 * Esto evita que el throttle de login (5 req/min por IP) bloquee los tests.
 */
let ipCounter = 0;

/**
 * Genera una IP única para cada request de test.
 * Usa el rango 10.x.x.x que es privado y no colisiona con IPs reales.
 */
export function generateUniqueIP(): string {
  ipCounter++;
  const octet4 = ipCounter % 256;
  const octet3 = Math.floor(ipCounter / 256) % 256;
  const octet2 = Math.floor(ipCounter / 65536) % 256;
  return `10.${octet2}.${octet3}.${octet4}`;
}

/**
 * Resetea el contador de IPs.
 * Útil si se necesita reiniciar entre test suites.
 */
export function resetIPCounter(): void {
  ipCounter = 0;
}

// ============================================================================
// UTILIDADES INTERNAS
// ============================================================================

function extractAuthCookie(cookies: string[] | string | undefined) {
  if (!cookies || (Array.isArray(cookies) && cookies.length === 0)) {
    return undefined;
  }
  const cookieList = Array.isArray(cookies) ? cookies : [cookies];
  return cookieList.find((cookie) => cookie.startsWith('auth-token='));
}

function extractTokenFromCookie(cookie: string | undefined) {
  if (!cookie) return undefined;
  const match = /auth-token=([^;]+)/.exec(cookie);
  return match?.[1];
}

/**
 * Extrae solo la parte "nombre=valor" de una cookie completa.
 * Input: "auth-token=eyJ...; Path=/; HttpOnly; SameSite=Lax"
 * Output: "auth-token=eyJ..."
 */
function extractCookieNameValue(fullCookie: string): string {
  // La parte nombre=valor siempre está antes del primer ";"
  const semicolonIndex = fullCookie.indexOf(';');
  if (semicolonIndex === -1) {
    return fullCookie; // No hay atributos, retornar completa
  }
  return fullCookie.substring(0, semicolonIndex);
}

// ============================================================================
// LOGIN HELPERS
// ============================================================================

/**
 * Realiza login con credenciales y simula IP única.
 * Cada llamada usa una IP diferente para evitar throttle.
 */
async function performLogin(
  app: INestApplication,
  path: string,
  credentials: { email?: string; username?: string; password: string },
): Promise<AuthSession> {
  const uniqueIP = generateUniqueIP();

  const response = await request(app.getHttpServer())
    .post(path)
    .set('Origin', FRONTEND_ORIGIN)
    .set('X-Forwarded-For', uniqueIP)
    .send(credentials)
    .expect(200);

  const identifier = credentials.email ?? credentials.username ?? 'unknown';
  const authCookie = extractAuthCookie(response.get('set-cookie'));
  if (!authCookie) {
    throw new Error(`No auth-token cookie returned for ${identifier}`);
  }

  const token = extractTokenFromCookie(authCookie);
  if (!token) {
    throw new Error(`No JWT token extracted for ${identifier}`);
  }

  return {
    token,
    cookie: authCookie,
    user: response.body?.user,
  };
}

/**
 * Login de tutor/admin con email y password.
 * Usa prefijo /api porque los tests configuran app.setGlobalPrefix('api').
 */
export async function loginUser(
  app: INestApplication,
  credentials: { email: string; password: string },
): Promise<AuthSession> {
  return performLogin(app, '/api/auth/login', credentials);
}

/**
 * Login de estudiante usando username (NO email).
 * Los estudiantes usan username, no email, para autenticarse.
 * Usa prefijo /api porque los tests configuran app.setGlobalPrefix('api').
 */
export async function loginEstudiante(
  app: INestApplication,
  credentials: { username: string; password: string },
): Promise<AuthSession> {
  return performLogin(app, '/api/auth/estudiante/login', credentials);
}

/**
 * Login de estudiante que retorna cookies limpias (array de "nombre=valor").
 * Útil para tests que necesitan pasar cookies directamente a .set('Cookie', cookies).
 *
 * IMPORTANTE: Retorna cookies sin atributos (Path, HttpOnly, etc.) para que
 * cookie-parser las parsee correctamente en el servidor.
 *
 * @example
 * const cookies = await loginEstudianteRaw(app, { username, password });
 * // cookies = ["auth-token=eyJ...", "refresh-token=eyJ..."]
 * await request(app).get('/api/endpoint').set('Cookie', cookies);
 */
export async function loginEstudianteRaw(
  app: INestApplication,
  credentials: { username: string; password: string },
): Promise<string[]> {
  const uniqueIP = generateUniqueIP();

  const response = await request(app.getHttpServer())
    .post('/api/auth/estudiante/login')
    .set('Origin', FRONTEND_ORIGIN)
    .set('X-Forwarded-For', uniqueIP)
    .send(credentials);

  if (response.status !== 200) {
    throw new Error(
      `Login failed for ${credentials.username}: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  const cookies = response.headers['set-cookie'];
  if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
    throw new Error(`No cookies returned for ${credentials.username}`);
  }

  // Extraer solo "nombre=valor" de cada cookie, sin atributos (Path, HttpOnly, etc.)
  // Esto evita que cookie-parser interprete los atributos como cookies separadas
  return cookies.map(extractCookieNameValue);
}

// ============================================================================
// HELPERS PARA REQUESTS AUTENTICADOS
// ============================================================================

/**
 * Agrega headers de autenticación a un request builder.
 * Incluye Authorization Bearer y Cookie.
 */
export function withAuthHeaders<T extends Test>(
  requestBuilder: T,
  auth: AuthSession,
): T {
  return requestBuilder
    .set('Authorization', `Bearer ${auth.token}`)
    .set('Cookie', auth.cookie);
}

/**
 * Agrega header Origin para requests que lo requieren.
 */
export function withOriginHeader<T extends Test>(requestBuilder: T): T {
  return requestBuilder.set('Origin', FRONTEND_ORIGIN);
}

/**
 * Agrega IP única para evitar throttle en requests manuales.
 * Usar cuando no se usa performLogin (ej: tests de throttle específicos).
 */
export function withUniqueIP<T extends Test>(requestBuilder: T): T {
  return requestBuilder.set('X-Forwarded-For', generateUniqueIP());
}
