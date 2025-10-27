import type { INestApplication } from '@nestjs/common';
import request, { type Test } from 'supertest';

import '../test-env';

export interface AuthSession {
  token: string;
  cookie: string;
  user?: any;
}

export const FRONTEND_ORIGIN =
  process.env.FRONTEND_URL ?? 'http://localhost:3000';

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

async function performLogin(
  app: INestApplication,
  path: string,
  credentials: { email: string; password: string },
): Promise<AuthSession> {
  const response = await request(app.getHttpServer())
    .post(path)
    .set('Origin', FRONTEND_ORIGIN)
    .send(credentials)
    .expect(200);

  const authCookie = extractAuthCookie(response.get('set-cookie'));
  if (!authCookie) {
    throw new Error(`No auth-token cookie returned for ${credentials.email}`);
  }

  const token = extractTokenFromCookie(authCookie);
  if (!token) {
    throw new Error(`No JWT token extracted for ${credentials.email}`);
  }

  return {
    token,
    cookie: authCookie,
    user: response.body?.user,
  };
}

export async function loginUser(
  app: INestApplication,
  credentials: { email: string; password: string },
): Promise<AuthSession> {
  return performLogin(app, '/auth/login', credentials);
}

export async function loginEstudiante(
  app: INestApplication,
  credentials: { email: string; password: string },
): Promise<AuthSession> {
  return performLogin(app, '/auth/estudiante/login', credentials);
}

export function withAuthHeaders<T extends Test>(
  requestBuilder: T,
  auth: AuthSession,
): T {
  return requestBuilder
    .set('Authorization', `Bearer ${auth.token}`)
    .set('Cookie', auth.cookie);
}

export function withOriginHeader<T extends Test>(requestBuilder: T): T {
  return requestBuilder.set('Origin', FRONTEND_ORIGIN);
}
