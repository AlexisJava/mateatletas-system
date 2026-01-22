import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { Request, Response } from 'express';
import {
  PrismaExceptionFilter,
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './common/filters';
import { LoggerService } from './common/logger/logger.service';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { DecimalResponseInterceptor } from './common/interceptors/camel-case-response.interceptor';

/**
 * Extended Express Request interface with rawBody property
 * Used for MercadoPago webhook signature validation
 */
interface RequestWithRawBody extends Request {
  rawBody?: string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable NestJS automatic body parsing
  });

  // Obtener instancia del LoggerService para los filters
  const logger = app.get(LoggerService);
  logger.log('🚀 Iniciando aplicación Mateatletas API...');

  // Confiar en proxies para obtener IP real del cliente
  // Necesario para rate limiting correcto detrás de Railway/load balancers
  // X-Forwarded-For header será usado para identificar clientes
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.set('trust proxy', true);

  // Raw body middleware for webhook signature validation
  // Captura raw body ANTES de parsear JSON
  app.use(
    express.json({
      verify: (
        req: RequestWithRawBody,
        _res: Response,
        buf: Buffer,
        encoding: string,
      ) => {
        // Solo guardar raw body para webhooks de MercadoPago
        // CRITICAL: Esto es esencial para validar la firma HMAC-SHA256
        const isWebhookUrl =
          req.url.startsWith('/api/pagos/webhook') ||
          req.url.startsWith('/api/colonia/webhook');

        if (isWebhookUrl) {
          // Usar encoding explícito o UTF-8 por defecto
          const bufferEncoding: BufferEncoding =
            encoding === 'utf-8' || encoding === 'utf8'
              ? 'utf8'
              : encoding === 'ascii'
                ? 'ascii'
                : encoding === 'base64'
                  ? 'base64'
                  : encoding === 'hex'
                    ? 'hex'
                    : 'utf8'; // default seguro

          req.rawBody = buf.toString(bufferEncoding);
        }
      },
    }),
  );

  // URL-encoded parser (para formularios)
  app.use(express.urlencoded({ extended: true }));

  // Cookie parser middleware (debe ir ANTES de las rutas)
  app.use(cookieParser());

  // Security: Helmet - Configura headers HTTP seguros
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Permite inline styles para Swagger
          scriptSrc: ["'self'", "'unsafe-inline'"], // Permite inline scripts para Swagger
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // HTTP Strict Transport Security - Forzar HTTPS en producción
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true,
      },
      // X-Frame-Options - Previene clickjacking
      frameguard: {
        action: 'deny',
      },
      // X-Content-Type-Options - Previene MIME type sniffing
      noSniff: true,
      // X-XSS-Protection - Protección XSS (legacy pero útil)
      xssFilter: true,
      // Referrer-Policy - Controla información del referer
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    }),
  );

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS with environment-aware configuration
  const isProduction = process.env.NODE_ENV === 'production';

  // Soportar múltiples URLs separadas por coma en FRONTEND_URL
  const frontendUrls = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  const allowedOrigins = isProduction
    ? frontendUrls.length > 0
      ? frontendUrls
      : (() => {
          logger.error('❌ CRITICAL: FRONTEND_URL is not set in production!');
          logger.error('❌ CORS will block ALL origins for security.');
          logger.error(
            '❌ Set FRONTEND_URL environment variable to enable CORS.',
          );
          return []; // Bloquear TODOS los orígenes si no hay config en producción
        })()
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        ...frontendUrls,
      ].filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir requests sin origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Validar que el origin esté en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`⚠️  CORS blocked request from origin: ${origin}`);
        callback(new Error('CORS policy: Origin not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Disposition', 'set-cookie'], // Para descargas de archivos y cookies cross-domain
    maxAge: isProduction ? 86400 : 3600, // 24 horas en prod, 1 hora en dev
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
      // ✅ SECURITY FIX: Lanzar BadRequestException para devolver 400 en lugar de 500
      // ✅ SECURITY FIX: No loggear valores de campos sensibles (passwords, tokens, etc.)
      exceptionFactory: (errors) => {
        // Construir mensajes de error sin incluir valores sensibles
        const messages = errors.map((error) => {
          const constraints = Object.values(error.constraints || {});
          return `${error.property}: ${constraints.join(', ')}`;
        });

        // Lanzar BadRequestException con array de errores (status 400)
        return new BadRequestException(messages);
      },
    }),
  );

  // Global exception filters (orden importa: más específico a más general)
  // 1. AllExceptionsFilter - Catch-all para errores no manejados
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  // 2. HttpExceptionFilter - Errores HTTP específicos
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  // 3. PrismaExceptionFilter - Errores de base de datos
  app.useGlobalFilters(new PrismaExceptionFilter(logger));

  // Global interceptors (aplicar DESPUÉS de ValidationPipe y filters)
  // ORDEN IMPORTANTE: Los interceptors se ejecutan en orden de registro
  //
  // RESPONSE FLOW (después del controller):
  // 1. DecimalResponseInterceptor - Convierte Prisma Decimal a números JavaScript
  // 2. TransformResponseInterceptor - Envuelve en formato {data, metadata}
  //
  // NOTA: Ya no necesitamos transformar snake_case → camelCase porque:
  // - Prisma Schema usa @map para mapear camelCase a snake_case en DB
  // - Prisma Client genera propiedades en camelCase automáticamente
  // - Los services retornan camelCase nativo
  app.useGlobalInterceptors(
    new DecimalResponseInterceptor(),
    new TransformResponseInterceptor(),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Mateatletas API')
    .setDescription(
      `
      API Backend para la plataforma educativa Mateatletas.

      ## Características

      - 🔐 Autenticación JWT con roles (Admin, Docente, Tutor)
      - 👥 Gestión de usuarios y estudiantes
      - 📚 Sistema de cursos y clases
      - 💳 Integración con MercadoPago
      - 🎮 Gamificación (puntos, logros, ranking)
      - 📊 Dashboard administrativo
      - 📅 Sistema de calendario y eventos
      - 🔔 Sistema de notificaciones

      ## Autenticación

      La mayoría de los endpoints requieren autenticación mediante JWT Bearer token.

      1. Login: \`POST /api/auth/login\`
      2. Usar el token en el header: \`Authorization: Bearer <token>\`

      ## Roles

      - **Admin**: Acceso completo al sistema
      - **Docente**: Gestión de clases y asistencias
      - **Tutor**: Gestión de estudiantes e inscripciones

      ## Rate Limiting

      100 requests por minuto por IP
      `,
    )
    .setVersion('1.0')
    .setContact(
      'Equipo Mateatletas',
      'https://mateatletas.com',
      'soporte@mateatletas.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth()
    )
    .addTag('Auth', 'Autenticación y registro de usuarios')
    .addTag('Admin', 'Endpoints administrativos (requiere rol Admin)')
    .addTag('Docentes', 'Gestión de docentes')
    .addTag('Estudiantes', 'Gestión de estudiantes')
    .addTag('Clases', 'Programación y gestión de clases')
    .addTag('Asistencia', 'Registro de asistencias')
    .addTag('Cursos', 'Sistema de cursos y lecciones')
    .addTag('Catálogo', 'Productos (suscripciones, cursos, recursos)')
    .addTag('Pagos', 'Integración con MercadoPago')
    .addTag('Gamificación', 'Puntos, logros y ranking')
    .addTag(
      'Casas',
      'Sistema de casas de estudiantes (Quantum, Vertex, Pulsar)',
    )
    .addTag('Notificaciones', 'Sistema de notificaciones')
    .addTag('Eventos', 'Calendario y eventos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Mateatletas API Docs',
    customfavIcon: 'https://mateatletas.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`🚀 API corriendo en http://localhost:${port}/api`);
  logger.log(`📚 Documentación Swagger en http://localhost:${port}/api/docs`);
}
void bootstrap();
