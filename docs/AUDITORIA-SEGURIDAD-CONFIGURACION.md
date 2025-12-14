# AUDITORIA DE SEGURIDAD - CONFIGURACION Y HEADERS

**Fecha**: 2025-12-12
**Scope**: /home/alexis/Documentos/Mateatletas-Ecosystem/apps/api
**Auditor**: Claude Code - Security Auditor
**Estado General**: BUENO con recomendaciones CRITICAS

---

## RESUMEN EJECUTIVO

La aplicacion Mateatletas API tiene una configuracion de seguridad **solida** con implementaciones avanzadas de:

- Helmet con CSP configurado
- Rate limiting por usuario/IP
- JWT con rotacion automatica de secrets
- CORS restrictivo con whitelist
- Validacion de webhooks con HMAC-SHA256
- Auditoria completa de eventos criticos

**PROBLEMAS CRITICOS ENCONTRADOS**:

1. Console.log con datos sensibles en estrategia JWT (tokens expuestos)
2. Console.log extensivo en main.ts (webhook debugging)
3. Falta archivo .env.example actualizado (no existe)
4. Logs de validacion de firma exponen secrets parcialmente

**RIESGO GENERAL**: MEDIO (requiere accion inmediata en produccion)

---

## 1. CORS (Cross-Origin Resource Sharing)

### Configuracion Encontrada

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/main.ts` (lineas 138-191)

```typescript
const isProduction = process.env.NODE_ENV === 'production';

const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
      .map((url) => url.trim())
      .filter(Boolean)
  : [];

const allowedOrigins = isProduction
  ? frontendUrls.length > 0
    ? frontendUrls
    : (() => {
        logger.error('CRITICAL: FRONTEND_URL is not set in production!');
        logger.error('CORS will block ALL origins for security.');
        return []; // Bloquear TODOS los origenes si no hay config en produccion
      })()
  : ['http://localhost:3000', 'http://localhost:3001', ...frontendUrls].filter(Boolean);

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permitir requests sin origin

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('CORS policy: Origin not allowed'), false);
    }
  },
  credentials: true, // Permite cookies httpOnly
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'set-cookie'],
  maxAge: isProduction ? 86400 : 3600, // 24h en prod, 1h en dev
});
```

### Analisis

**FORTALEZAS**:

- NO usa wildcard (\*) en produccion
- Whitelist dinamica desde variable de entorno FRONTEND_URL
- Soporta multiples URLs separadas por coma
- Fail-safe: bloquea TODO si FRONTEND_URL no esta configurada en produccion
- Logging de intentos bloqueados para auditoria
- `credentials: true` correcto para cookies httpOnly
- Permite requests sin origin (apps moviles, Postman)

**DEBILIDADES**:

- Permite requests sin origin (potencial CSRF si no hay guard)
- maxAge alto en produccion (86400s = 24h) - considerar reducir a 3600s (1h)

**RIESGO**: BAJO

### Recomendaciones

1. **CRITICO**: Validar que FRONTEND_URL este configurada en produccion

   ```bash
   # En Railway / Vercel / AWS
   FRONTEND_URL=https://app.mateatletas.com,https://admin.mateatletas.com
   ```

2. **MEDIO**: Considerar denegar requests sin origin en produccion

   ```typescript
   if (!origin) {
     if (isProduction) {
       callback(new Error('CORS: Origin header required'), false);
     }
     return callback(null, true);
   }
   ```

3. **BAJO**: Reducir maxAge en produccion de 24h a 1h
   ```typescript
   maxAge: isProduction ? 3600 : 600, // 1h en prod, 10min en dev
   ```

---

## 2. SECRETS Y VARIABLES DE ENTORNO

### Variables Detectadas

**Archivo**: Analisis de codigo fuente completo

**Secrets Criticos Identificados**:

- `JWT_SECRET` - Para firmar tokens de autenticacion (OBLIGATORIO)
- `MERCADOPAGO_WEBHOOK_SECRET` - Para validar webhooks de pago (OBLIGATORIO)
- `FRONTEND_URL` - URLs permitidas para CORS (OBLIGATORIO en produccion)
- `BCRYPT_ROUNDS` - Rondas de hashing (opcional, default: 12)
- `JWT_EXPIRATION` - Tiempo de expiracion de tokens (opcional, default: 24h)
- `RATE_LIMIT_TTL` - Ventana de rate limiting (opcional, default: 60s)
- `RATE_LIMIT_MAX` - Max requests por ventana (opcional, default: 100 en prod)
- `NODE_ENV` - Ambiente (development/production)
- `PORT` - Puerto de escucha (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis para cache y rate limiting

### Uso Correcto de process.env

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/auth/strategies/jwt.strategy.ts`

```typescript
const secret = configService.get<string>('JWT_SECRET');
if (!secret) {
  throw new Error('JWT_SECRET no esta configurado en las variables de entorno');
}
```

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/security/security.module.ts`

```typescript
ThrottlerModule.forRoot([
  {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
    limit: parseInt(
      process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? '100' : '1000'),
      10,
    ),
  },
]);
```

### Hardcoded Secrets

**RESULTADO**: NO SE ENCONTRARON SECRETS HARDCODED EN CODIGO DE PRODUCCION

Los unicos "secrets" encontrados estan en:

- Archivos de test (`*.spec.ts`) - ACEPTABLE
- Documentacion (`CURL_EXAMPLES.md`) - Token de ejemplo, NO real
- README.md - Ejemplo de configuracion, NO secret real

**Ejemplo aceptable**:

```typescript
// apps/api/src/auth/README.md:250
JWT_SECRET = 'tu-secreto-super-seguro-cambialo-en-produccion';
```

Este es un ejemplo de documentacion, NO un secret real en codigo.

### .env.example

**ESTADO**: NO EXISTE (archivo no encontrado)

**RIESGO**: CRITICO - Sin .env.example, nuevos desarrolladores no saben que variables configurar.

### Analisis

**FORTALEZAS**:

- Uso correcto de ConfigService de NestJS
- Validacion de secrets obligatorios al inicio de la aplicacion
- Sistema de rotacion automatica de secrets (SecretRotationService)
- Hashing SHA-256 de secrets en base de datos (NO almacena secrets reales)
- Cronjob para alertar 7 dias antes de expiracion de secrets

**DEBILIDADES CRITICAS**:

- Falta archivo .env.example
- Logs de debug exponen parcialmente secrets (webhook-guard)

**RIESGO**: ALTO

### Recomendaciones

1. **CRITICO**: Crear archivo .env.example con todas las variables necesarias

   ```bash
   # apps/api/.env.example

   # SERVIDOR
   NODE_ENV=development
   PORT=3001

   # BASE DE DATOS
   DATABASE_URL="postgresql://user:password@localhost:5432/mateatletas"

   # REDIS (Cache y Rate Limiting)
   REDIS_URL="redis://localhost:6379"

   # AUTENTICACION (CAMBIAR EN PRODUCCION)
   JWT_SECRET="CAMBIAR-secret-super-seguro-minimo-32-caracteres-aleatorios"
   JWT_EXPIRATION="24h"  # 1h en produccion recomendado
   BCRYPT_ROUNDS=12      # Minimo 12, optimo 14

   # MERCADOPAGO
   MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxx"
   MERCADOPAGO_WEBHOOK_SECRET="CAMBIAR-secret-webhook-mercadopago"

   # CORS
   FRONTEND_URL="http://localhost:3000,http://localhost:3001"
   BACKEND_URL="http://localhost:3001"

   # RATE LIMITING
   RATE_LIMIT_TTL=60000    # 60 segundos
   RATE_LIMIT_MAX=1000     # 1000 req/min en dev, 100 en prod

   # SEGURIDAD (SOLO EN TESTING)
   DISABLE_WEBHOOK_SIGNATURE_VALIDATION=false
   ```

2. **CRITICO**: Eliminar logs que exponen secrets parcialmente

   ```typescript
   // apps/api/src/pagos/guards/mercadopago-webhook.guard.ts:400
   // ELIMINAR ESTE LOG:
   this.logger.debug(`Secret (primeros 10 chars): ${this.webhookSecret.substring(0, 10)}...`);
   ```

3. **ALTO**: Configurar rotacion automatica de JWT_SECRET cada 90 dias
   - El sistema ya esta implementado (SecretRotationService)
   - Configurar alertas en Slack/email cuando falten 7 dias

4. **MEDIO**: Usar secrets manager en produccion
   - AWS Secrets Manager
   - HashiCorp Vault
   - Railway Secrets (si estas en Railway)

---

## 3. HELMET Y SECURITY HEADERS

### Configuracion Encontrada

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/main.ts` (lineas 97-133)

```typescript
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Para Swagger
        scriptSrc: ["'self'", "'unsafe-inline'"], // Para Swagger
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // HTTP Strict Transport Security - Forzar HTTPS
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },
    // X-Frame-Options - Previene clickjacking
    frameguard: {
      action: 'deny',
    },
    // X-Content-Type-Options - Previene MIME sniffing
    noSniff: true,
    // X-XSS-Protection - Proteccion XSS legacy
    xssFilter: true,
    // Referrer-Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  }),
);
```

### Headers de Seguridad Aplicados

1. **Content-Security-Policy (CSP)**:
   - `default-src 'self'` - Solo permite recursos del mismo origin
   - `script-src 'self' 'unsafe-inline'` - Scripts propios + inline (Swagger)
   - `style-src 'self' 'unsafe-inline'` - Estilos propios + inline (Swagger)
   - `object-src 'none'` - Bloquea Flash, Java applets
   - `frame-src 'none'` - Previene clickjacking

2. **HTTP Strict Transport Security (HSTS)**:
   - `max-age=31536000` (1 año)
   - `includeSubDomains` - Aplica a todos los subdominios
   - `preload` - Incluido en lista HSTS de navegadores

3. **X-Frame-Options**: `DENY` - Previene clickjacking completamente

4. **X-Content-Type-Options**: `nosniff` - Previene MIME type sniffing

5. **X-XSS-Protection**: Activado (legacy, pero util para navegadores antiguos)

6. **Referrer-Policy**: `strict-origin-when-cross-origin`

### Analisis

**FORTALEZAS**:

- Helmet correctamente configurado
- CSP restrictivo (default-src 'self')
- HSTS con maxAge de 1 año y preload
- Todos los headers criticos presentes
- Configuracion especifica para Swagger (unsafe-inline necesario)

**DEBILIDADES**:

- CSP permite 'unsafe-inline' para scripts y estilos (necesario para Swagger)
- No hay header Permissions-Policy (antes Feature-Policy)
- No hay CORP/COEP/COOP headers (necesarios para SharedArrayBuffer)

**RIESGO**: BAJO

### Recomendaciones

1. **MEDIO**: Agregar Permissions-Policy header

   ```typescript
   app.use(
     helmet({
       // ... config existente
       permissionsPolicy: {
         features: {
           geolocation: ["'none'"],
           camera: ["'none'"],
           microphone: ["'none'"],
           payment: ["'self'"], // Solo si usas Payment Request API
           usb: ["'none'"],
         },
       },
     }),
   );
   ```

2. **BAJO**: Considerar headers CORP/COEP/COOP si necesitas SharedArrayBuffer

   ```typescript
   app.use((req, res, next) => {
     res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
     res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
     next();
   });
   ```

3. **INFO**: Documentar por que 'unsafe-inline' es necesario
   ```typescript
   // JUSTIFICACION: unsafe-inline es necesario para Swagger UI
   // Alternativa: Servir Swagger en subdominio separado sin CSP estricto
   ```

---

## 4. RATE LIMITING

### Configuracion Encontrada

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/security/security.module.ts`

```typescript
ThrottlerModule.forRoot([{
  ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // 60s
  limit: parseInt(
    process.env.RATE_LIMIT_MAX ||
    (process.env.NODE_ENV === 'production' ? '100' : '1000'),
    10,
  ),
}])

// Guard global aplicado
{
  provide: APP_GUARD,
  useClass: UserThrottlerGuard,
}
```

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/common/guards/user-throttler.guard.ts`

```typescript
export class UserThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request & { user?: { id: string } };

    // Usuarios autenticados: limitar por user.id
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Usuarios anonimos: limitar por IP
    const ip = extractIpFromRequest(request);
    return `ip:${ip}`;
  }
}
```

### Rate Limits Aplicados

| Ambiente   | TTL | Limite   | Scope          |
| ---------- | --- | -------- | -------------- |
| Desarrollo | 60s | 1000 req | Por usuario/IP |
| Produccion | 60s | 100 req  | Por usuario/IP |

### Protecciones Implementadas

1. **Rate limiting por usuario autenticado**: Limita abuse de API por cuentas comprometidas
2. **Rate limiting por IP anonima**: Protege endpoints publicos (login, registro)
3. **Extraccion correcta de IP**: Considera X-Forwarded-For, X-Real-IP
4. **Guard global**: Aplica a TODOS los endpoints automaticamente

### Analisis

**FORTALEZAS**:

- Rate limiting global aplicado a toda la API
- Diferenciacion usuario/IP (mas restrictivo por usuario)
- Configuracion via variables de entorno
- Limite razonable en produccion (100 req/min)
- Usa @nestjs/throttler (probado en produccion)

**DEBILIDADES**:

- Sin rate limiting especifico para endpoints criticos (login, password reset)
- Sin respuesta 429 personalizada con Retry-After header
- No hay rate limiting diferenciado por endpoint
- Limite de 100 req/min puede ser bajo para dashboards con muchos charts

**RIESGO**: BAJO

### Recomendaciones

1. **ALTO**: Agregar rate limiting estricto para endpoints de autenticacion

   ```typescript
   // En auth.controller.ts
   @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
   @Post('login')
   async login(@Body() loginDto: LoginDto) { ... }

   @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 intentos por 5 min
   @Post('forgot-password')
   async forgotPassword(@Body() dto: ForgotPasswordDto) { ... }
   ```

2. **MEDIO**: Personalizar respuesta 429 con Retry-After

   ```typescript
   // Interceptor personalizado
   @Catch(ThrottlerException)
   export class ThrottlerExceptionFilter implements ExceptionFilter {
     catch(exception: ThrottlerException, host: ArgumentsHost) {
       const response = host.switchToHttp().getResponse();
       response.header('Retry-After', '60');
       response.status(429).json({
         statusCode: 429,
         message: 'Too Many Requests. Please wait 60 seconds.',
         retryAfter: 60,
       });
     }
   }
   ```

3. **MEDIO**: Considerar aumentar limite para usuarios autenticados en produccion

   ```typescript
   limit: parseInt(
     process.env.RATE_LIMIT_MAX ||
     (process.env.NODE_ENV === 'production' ? '200' : '1000'), // 200 en prod
     10,
   ),
   ```

4. **BAJO**: Implementar redis-backed throttler para clusters

   ```typescript
   // Ya tienen Redis configurado, solo falta conectar throttler
   import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

   ThrottlerModule.forRootAsync({
     imports: [ConfigModule],
     inject: [ConfigService],
     useFactory: (config: ConfigService) => ({
       throttlers: [{ ttl: 60000, limit: 100 }],
       storage: new ThrottlerStorageRedisService(config.get('REDIS_URL')),
     }),
   });
   ```

---

## 5. LOGS Y DATOS SENSIBLES

### Console.log Detectados

#### CRITICO: JWT Strategy expone tokens

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/auth/strategies/jwt.strategy.ts` (lineas 47-75)

```typescript
console.log('🔍 [JWT-STRATEGY] Extrayendo token...');
console.log('🍪 [JWT-STRATEGY] request.cookies:', request?.cookies);
console.log('🔑 [JWT-STRATEGY] Authorization header:', request?.headers?.authorization);

if (token) {
  console.log(
    '✅ [JWT-STRATEGY] Token extraído de COOKIE (primeros 20 chars):',
    token.substring(0, 20) + '...',
  );
}

if (bearerToken) {
  console.log(
    '✅ [JWT-STRATEGY] Token extraído de HEADER (primeros 20 chars):',
    bearerToken.substring(0, 20) + '...',
  );
}

console.log('🔐 [JWT-VALIDATE] Token decodificado exitosamente');
console.log('📦 [JWT-VALIDATE] Payload:', {
  sub: payload.sub,
  email: payload.email,
  role: payload.role,
});
```

**RIESGO**: ALTO

- Expone primeros 20 caracteres de JWT tokens en logs
- Expone email y user ID en payload
- En produccion, estos logs pueden terminar en sistemas de logging centralizados

#### CRITICO: Main.ts con debug extensivo de webhooks

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/main.ts` (lineas 45-86)

```typescript
console.log('🔍 [VERIFY CALLBACK] req.url:', req.url);
console.log('🔍 [VERIFY CALLBACK] req.originalUrl:', (req as any).originalUrl);
console.log('🔍 [VERIFY CALLBACK] req.path:', (req as any).path);
console.log('🔍 [VERIFY CALLBACK] req.baseUrl:', (req as any).baseUrl);
console.log('🔍 [VERIFY CALLBACK] buf length:', buf.length);
console.log('🔍 [VERIFY CALLBACK] encoding:', encoding);
console.log('✅ [VERIFY CALLBACK] MATCH: Guardando rawBody para', req.url);
console.log('✅ [VERIFY CALLBACK] rawBody guardado, longitud:', req.rawBody.length);
console.log('❌ [VERIFY CALLBACK] NO MATCH: req.url =', req.url);

// Al final del archivo:
console.log(`🚀 API corriendo en http://localhost:${port}/api`);
console.log(`📚 Documentación Swagger en http://localhost:${port}/api/docs`);
```

**RIESGO**: MEDIO

- Debug extensivo de webhooks puede exponer datos de pagos
- Los 2 ultimos console.log son ACEPTABLES (informacion de inicio)

#### ALTO: Webhook Guard expone secret parcialmente

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/pagos/guards/mercadopago-webhook.guard.ts` (lineas 390-410)

```typescript
this.logger.debug(`🔍 DEBUG Webhook Signature Validation:`);
this.logger.debug(`  - Timestamp: ${timestamp}`);
this.logger.debug(`  - Body string (first 200 chars): ${bodyString.substring(0, 200)}...`);
this.logger.debug(`  - Payload: ${payload.substring(0, 200)}...`);
this.logger.debug(`  - Secret (primeros 10 chars): ${this.webhookSecret.substring(0, 10)}...`);
this.logger.debug(`  - Received signature: ${receivedSignature}`);
this.logger.debug(`  - Expected signature: ${expectedSignature}`);
```

**RIESGO**: ALTO

- Expone primeros 10 caracteres del webhook secret
- Expone firmas completas (receivedSignature, expectedSignature)
- Expone payload parcial (puede contener datos de pago)

### Logging Service (Winston)

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/common/logger/logger.service.ts`

**FORTALEZAS**:

- Usa Winston para logging estructurado
- Rotacion automatica de logs (14 dias para errores, 7 dias combinados)
- Sanitizacion de metadata (no loguea passwords por defecto)
- Logs separados por nivel (error.log, combined.log)

**DEBILIDADES**:

- logValidationError puede exponer valores de campos sensibles (linea 427)
  ```typescript
  logValidationError(field: string, value: unknown, constraints: Record<string, string>) {
    this.logger.warn('Validation Error', {
      field,
      value, // PROBLEMA: puede ser password, token, etc.
      constraints,
    });
  }
  ```

### Audit Logs

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/audit/audit-log.service.ts`

**FORTALEZAS**:

- Sistema de auditoria completo con categorias (AUTH, PAYMENT, SECURITY)
- Comentario explicito: "NO incluir passwords" (linea 85)
- Tracking de IP, user agent, request ID
- Severidad correctamente categorizada (INFO, WARNING, ERROR, CRITICAL)

### Analisis

**FORTALEZAS**:

- Sistema de logging estructurado con Winston
- Auditoria completa de eventos criticos
- Rotacion automatica de logs
- Comentarios sobre NO loguear passwords

**DEBILIDADES CRITICAS**:

- Console.log en JWT strategy expone tokens (primeros 20 chars)
- Console.log en main.ts con debug de webhooks
- Webhook guard expone secret parcialmente
- logValidationError puede exponer passwords en errores de validacion

**RIESGO**: ALTO

### Recomendaciones

1. **CRITICO**: Eliminar TODOS los console.log que exponen datos sensibles

   ```typescript
   // ELIMINAR COMPLETAMENTE estos logs de jwt.strategy.ts:
   // - Lineas 47-75 (extraccion de token)
   // - Lineas 93-213 (validacion de token)

   // ALTERNATIVA: Usar logger con nivel DEBUG y desactivar en produccion
   if (process.env.NODE_ENV === 'development') {
     this.logger.debug('Token extraction attempt');
   }
   ```

2. **CRITICO**: Eliminar debug de webhook secret

   ```typescript
   // ELIMINAR de mercadopago-webhook.guard.ts:400
   this.logger.debug(`  - Secret (primeros 10 chars): ${this.webhookSecret.substring(0, 10)}...`);

   // TAMBIEN ELIMINAR:
   this.logger.debug(`  - Received signature: ${receivedSignature}`);
   this.logger.debug(`  - Expected signature: ${expectedSignature}`);
   ```

3. **ALTO**: Sanitizar logValidationError

   ```typescript
   logValidationError(field: string, value: unknown, constraints: Record<string, string>) {
     // Lista de campos sensibles que NO deben loguearse
     const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'apiKey',
                              'accessToken', 'refreshToken', 'pin', 'otp'];

     const sanitizedValue = sensitiveFields.includes(field.toLowerCase())
       ? '[REDACTED]'
       : value;

     this.logger.warn('Validation Error', {
       field,
       value: sanitizedValue,
       constraints,
     });
   }
   ```

4. **MEDIO**: Convertir console.log de main.ts (webhooks) a logger con nivel DEBUG

   ```typescript
   // Reemplazar todos los console.log de lineas 45-86 con:
   this.logger.debug('[VERIFY CALLBACK] req.url:', req.url);
   // Y desactivar DEBUG en produccion via NODE_ENV
   ```

5. **MEDIO**: Agregar .gitignore para logs/

   ```gitignore
   # logs/ ya deberia estar en .gitignore
   logs/
   *.log
   ```

6. **BAJO**: Documentar politica de logging

   ```markdown
   # POLITICA DE LOGGING

   NUNCA loguear:

   - Passwords (plano o hash completo)
   - Tokens JWT (completos o parciales)
   - API Keys / Secrets
   - Numeros de tarjeta / CVV
   - PII sensible (DNI completo, telefono)

   OK para loguear:

   - User IDs (UUID/CUID)
   - Emails (solo en logs de auditoria)
   - Timestamps, IPs, user agents
   - Errores sin valores de campos sensibles
   ```

---

## 6. OTROS HALLAZGOS DE SEGURIDAD

### Cookies httpOnly

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/auth/auth.controller.ts`

```typescript
response.cookie('auth-token', token, {
  httpOnly: true, // ✅ Previene acceso desde JavaScript
  secure: process.env.NODE_ENV === 'production', // ✅ Solo HTTPS en prod
  sameSite: 'lax', // ✅ CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/',
});
```

**FORTALEZA**: Configuracion correcta de cookies seguras.

### ValidationPipe con whitelist

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/main.ts` (lineas 194-223)

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // ✅ Elimina propiedades no definidas
    forbidNonWhitelisted: true, // ✅ Error si hay propiedades extra
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: false,
    validateCustomDecorators: true,
    exceptionFactory: (errors) => {
      // ✅ NO loguea valores de campos sensibles
      const messages = errors.map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      });
      return new BadRequestException(messages);
    },
  }),
);
```

**FORTALEZA**: Previene mass assignment attacks y no expone valores en errores.

### Exception Filters

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/common/filters/http-exception.filter.ts`

```typescript
private logError(exception: HttpException, request: Request, status: number, errorId: string) {
  const { user } = request as Request & { user?: { id?: string; role?: string } };

  // Solo incluir body/query/params en errores 500+
  const metadata: LoggerMetadata =
    status >= 500
      ? { ...baseMetadata, body, query, params }
      : baseMetadata;

  // ✅ No loguea body en errores 4xx (previene passwords en logs)
}
```

**FORTALEZA**: No loguea request body en errores de cliente (400-499).

### Secret Rotation Service

**Archivo**: `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/api/src/security/services/secret-rotation.service.ts`

**FORTALEZAS**:

- Rotacion automatica de secrets cada 90 dias
- Alertas 7 dias antes de expiracion
- Solo almacena hash SHA-256 de secrets (NO el secret real)
- Cronjob diario para monitoreo
- Endpoint de health para dashboards

**MEJORAS**:

- Implementar rotacion automatica real (actualmente solo alerta)
- Integrar con secrets manager (AWS Secrets Manager, Vault)

---

## 7. RESUMEN DE RIESGOS

| Categoria     | Riesgo | Descripcion                                      | Prioridad |
| ------------- | ------ | ------------------------------------------------ | --------- |
| CORS          | BAJO   | Configuracion correcta, solo mejorar maxAge      | P3        |
| Secrets       | ALTO   | Falta .env.example, logs exponen secrets         | P1        |
| Helmet        | BAJO   | Configuracion solida, agregar Permissions-Policy | P3        |
| Rate Limiting | BAJO   | Funcional, agregar limites especificos para auth | P2        |
| Logging       | ALTO   | Console.log expone tokens y secrets              | P1        |
| Cookies       | BAJO   | Configuracion correcta httpOnly + secure         | P4        |
| Validation    | BAJO   | Whitelist correcto, no expone valores            | P4        |

### Prioridades de Accion

**P1 - CRITICO (Accion Inmediata)**:

1. Eliminar console.log que exponen tokens JWT (jwt.strategy.ts)
2. Eliminar debug de webhook secret (mercadopago-webhook.guard.ts)
3. Crear archivo .env.example completo
4. Sanitizar logValidationError para campos sensibles

**P2 - ALTO (Esta Semana)**:

1. Agregar rate limiting estricto para /auth/login (5 req/min)
2. Convertir console.log de main.ts a logger.debug
3. Configurar alertas de rotacion de secrets (Slack/email)
4. Reducir maxAge de CORS de 24h a 1h

**P3 - MEDIO (Este Mes)**:

1. Agregar Permissions-Policy header
2. Personalizar respuesta 429 con Retry-After
3. Implementar redis-backed throttler para clusters
4. Documentar politica de logging

**P4 - BAJO (Backlog)**:

1. Agregar CORP/COEP/COOP headers
2. Servir Swagger en subdominio sin CSP estricto
3. Implementar rotacion automatica real de secrets

---

## 8. CHECKLIST DE VERIFICACION

### Pre-Deploy a Produccion

- [ ] FRONTEND_URL configurada correctamente
- [ ] JWT_SECRET generado con minimo 32 caracteres aleatorios
- [ ] MERCADOPAGO_WEBHOOK_SECRET configurado
- [ ] NODE_ENV=production
- [ ] Todos los console.log eliminados o convertidos a logger.debug
- [ ] .env.example actualizado con todas las variables
- [ ] HTTPS habilitado (secure cookies)
- [ ] Rate limiting configurado (100 req/min)
- [ ] Logs rotando correctamente (verificar disk space)
- [ ] Secrets rotation alerts configuradas

### Post-Deploy

- [ ] Verificar headers con securityheaders.com
- [ ] Probar CORS desde frontend en produccion
- [ ] Verificar rate limiting con herramienta de testing
- [ ] Revisar logs para confirmar que no hay datos sensibles
- [ ] Probar webhook de MercadoPago con signature valida
- [ ] Verificar que cookies se setean con secure=true

---

## 9. RECURSOS Y REFERENCIAS

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [MercadoPago Webhook Security](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [NIST Password Guidelines 2025](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

## CONCLUSION

La aplicacion Mateatletas API tiene una **base de seguridad solida** con:

- Helmet configurado correctamente
- CORS restrictivo con whitelist
- Rate limiting global
- Sistema de auditoria completo
- Rotacion de secrets implementada

**ACCION REQUERIDA INMEDIATA**:

1. Eliminar logs que exponen tokens y secrets
2. Crear .env.example
3. Agregar rate limiting especifico para autenticacion

**RIESGO ACTUAL**: MEDIO (ALTO sin las correcciones P1)
**RIESGO POST-CORRECCION**: BAJO

**Firma Digital**: Claude Code Security Auditor
**Fecha**: 2025-12-12
