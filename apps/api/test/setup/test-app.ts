/**
 * ============================================================================
 * TEST APP BOOTSTRAP
 * ============================================================================
 *
 * Configuración reutilizable para crear la aplicación NestJS en tests.
 * Evita duplicar el setup en cada archivo de test.
 *
 * Uso:
 *   const { app, prisma } = await createTestApp();
 *   // ... tests
 *   await closeTestApp(app, prisma);
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/database/prisma.service';

export interface TestAppContext {
  app: INestApplication;
  prisma: PrismaService;
  module: TestingModule;
}

/**
 * Crea y configura una instancia de la aplicación NestJS para tests.
 *
 * Configuración incluida:
 * - Global prefix: 'api'
 * - Cookie parser
 * - Trust proxy (para X-Forwarded-For)
 * - ValidationPipe con whitelist, forbidNonWhitelisted, transform
 *
 * @param options Opciones de configuración adicionales
 * @returns Contexto con app, prisma y module
 */
export async function createTestApp(options?: {
  globalPrefix?: string;
  skipInit?: boolean;
}): Promise<TestAppContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Configurar prefix
  app.setGlobalPrefix(options?.globalPrefix ?? 'api');

  // Cookie parser para auth
  app.use(cookieParser());

  // Trust proxy para IPs en X-Forwarded-For
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.set('trust proxy', true);

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Obtener PrismaService
  const prisma = app.get<PrismaService>(PrismaService);

  // Inicializar app (a menos que se indique lo contrario)
  if (!options?.skipInit) {
    await app.init();
  }

  return { app, prisma, module: moduleFixture };
}

/**
 * Cierra correctamente la aplicación y la conexión a la base de datos.
 */
export async function closeTestApp(
  app: INestApplication,
  prisma: PrismaService,
): Promise<void> {
  await prisma.$disconnect();
  await app.close();
}

/**
 * Obtiene el PrismaService de una aplicación existente.
 * Útil cuando ya tienes la app creada.
 */
export function getPrisma(app: INestApplication): PrismaService {
  return app.get<PrismaService>(PrismaService);
}
