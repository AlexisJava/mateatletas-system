import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  PrismaExceptionFilter,
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './common/filters';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener instancia del LoggerService para los filters
  const logger = app.get(LoggerService);

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS with secure configuration
  app.enableCors({
    origin: [
      'http://localhost:3000', // Frontend development
      'http://localhost:3002', // Frontend alternative port
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'], // Para descargas de archivos
    maxAge: 3600, // Cache preflight requests por 1 hora
  });

  // Global validation pipe with advanced options
  app.useGlobalPipes(
    new ValidationPipe({
      // Seguridad: elimina propiedades no definidas en el DTO
      whitelist: true,
      // Seguridad: lanza error si hay propiedades extra (evita ataques de mass assignment)
      forbidNonWhitelisted: true,
      // Transformación automática de tipos y decoradores (@Trim, @Capitalize, etc.)
      transform: true,
      // Habilita conversión implícita de tipos (ej: '123' → 123)
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Mensajes de error más descriptivos
      disableErrorMessages: false,
      // Validación de parámetros de rutas y queries
      validateCustomDecorators: true,
    }),
  );

  // Global exception filters (orden importa: más específico a más general)
  // 1. AllExceptionsFilter - Catch-all para errores no manejados
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  // 2. HttpExceptionFilter - Errores HTTP específicos
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  // 3. PrismaExceptionFilter - Errores de base de datos
  app.useGlobalFilters(new PrismaExceptionFilter(logger));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 API corriendo en http://localhost:${port}/api`);
}
bootstrap();
