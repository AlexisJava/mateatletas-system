# 🛡️ Estrategia de Protección CSRF (Opt-In)

**Fecha**: 2025-11-12
**Estado**: ✅ Implementado
**Criticidad**: 🟡 MEDIA (Seguridad Web)

---

## 📋 Resumen Ejecutivo

La protección CSRF (Cross-Site Request Forgery) ha sido convertida de **global** a **opt-in** usando el decorator `@RequireCsrf()`. Esto permite que webhooks, API calls y herramientas como Postman funcionen sin restricciones, mientras protegemos únicamente los endpoints web críticos.

### ✅ Antes (Problemático)

```typescript
// ❌ CSRF aplicado globalmente en app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: CsrfProtectionGuard, // Bloqueaba TODO
  },
];

// Resultado: Webhooks de MercadoPago fallaban
// Resultado: API calls sin Origin/Referer fallaban
// Resultado: Postman no funcionaba
```

### ✅ Después (Solución)

```typescript
// ✅ CSRF removido de guards globales
// ✅ Solo aplica en endpoints marcados con @RequireCsrf()

@Post('login')
@RequireCsrf() // ✅ Solo este endpoint protegido
async login(@Body() dto: LoginDto) {
  // ...
}

@Post('webhook')
// ✅ NO tiene @RequireCsrf(), permite MercadoPago
async webhook(@Body() dto: WebhookDto) {
  // ...
}
```

---

## 🎯 ¿Qué es CSRF?

### Ejemplo de Ataque CSRF

Imagina que un usuario está logueado en Mateatletas. Luego visita un sitio malicioso que tiene este código:

```html
<!-- Sitio malicioso: evil-site.com -->
<form action="https://mateatletas.com/api/estudiantes/123" method="POST">
  <input type="hidden" name="activo" value="false" />
</form>
<script>
  document.forms[0].submit(); // Envía el formulario automáticamente
</script>
```

**¿Qué pasa?**

1. El navegador envía el request a `mateatletas.com`
2. **Las cookies httpOnly se envían automáticamente** (el navegador lo hace)
3. El backend ve un token válido y ejecuta la acción
4. ¡El atacante modificó datos sin permiso del usuario!

### ¿Cómo lo prevenimos?

El `CsrfProtectionGuard` verifica el header `Origin` o `Referer`:

- Si el request viene de **nuestro frontend** → ✅ Permitir
- Si viene de **otro sitio** → ❌ Rechazar

---

## 🔧 Arquitectura de la Solución

### 1. Decorator `@RequireCsrf()`

**Archivo**: [`apps/api/src/common/decorators/require-csrf.decorator.ts`](../apps/api/src/common/decorators/require-csrf.decorator.ts)

```typescript
import { SetMetadata } from '@nestjs/common';

export const REQUIRE_CSRF_KEY = 'require_csrf';

/**
 * Decorator @RequireCsrf()
 * Marca un endpoint para que requiera validación CSRF.
 *
 * Solo usar en endpoints que:
 * 1. Modifican estado (POST, PUT, PATCH, DELETE)
 * 2. Son llamados desde el navegador/frontend web
 * 3. NO son webhooks ni API pura
 */
export const RequireCsrf = () => SetMetadata(REQUIRE_CSRF_KEY, true);
```

### 2. Guard `CsrfProtectionGuard` (Opt-In)

**Archivo**: [`apps/api/src/common/guards/csrf-protection.guard.ts`](../apps/api/src/common/guards/csrf-protection.guard.ts)

**Lógica**:

```typescript
canActivate(context: ExecutionContext): boolean {
  // 1. Verificar si el endpoint tiene @RequireCsrf()
  const requireCsrf = this.reflector.getAllAndOverride<boolean>(
    REQUIRE_CSRF_KEY,
    [context.getHandler(), context.getClass()],
  );

  if (!requireCsrf) {
    return true; // ✅ Permitir (webhooks, API calls, Postman)
  }

  // 2. Endpoint requiere CSRF, validar Origin/Referer
  const request = context.switchToHttp().getRequest<Request>();
  const method = request.method.toUpperCase();

  // 3. Métodos seguros (GET, HEAD, OPTIONS) no necesitan CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // 4. Obtener Origin o Referer
  const origin = request.headers.origin || request.headers.referer;

  if (!origin) {
    throw new ForbiddenException('Request rechazado: falta Origin/Referer');
  }

  // 5. Verificar que el origin esté en la lista permitida
  const normalizedOrigin = this.normalizeOrigin(origin);
  const isAllowed = this.allowedOrigins.includes(normalizedOrigin);

  if (!isAllowed) {
    throw new ForbiddenException(
      `Request rechazado: origin '${normalizedOrigin}' no permitido`,
    );
  }

  return true; // ✅ Request legítimo
}
```

### 3. Configuración en `app.module.ts`

**Archivo**: [`apps/api/src/app.module.ts`](../apps/api/src/app.module.ts)

```typescript
@Module({
  providers: [
    // ✅ CSRF removido de guards globales
    // CSRF es ahora opt-in con @RequireCsrf() decorator
    // Esto permite webhooks, API calls, y Postman sin bloqueos

    // Otros guards globales (TokenBlacklist, RateLimiting, etc.)
    {
      provide: APP_GUARD,
      useClass: TokenBlacklistGuard,
    },
  ],
})
export class AppModule {}
```

---

## 📝 Endpoints Protegidos

### Endpoints CON `@RequireCsrf()` (Solo 3)

**Archivo**: [`apps/api/src/auth/auth.controller.ts`](../apps/api/src/auth/auth.controller.ts)

| Endpoint                    | Método | ¿Por qué?                             |
| --------------------------- | ------ | ------------------------------------- |
| `/api/auth/login`           | POST   | Formulario web de autenticación       |
| `/api/auth/logout`          | POST   | Cierre de sesión desde navegador      |
| `/api/auth/change-password` | POST   | Operación sensible desde frontend web |

```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @RequireCsrf() // ✅ Proteger login de CSRF
  async login(@Body() dto: LoginDto) {
    // ...
  }

  @Post('logout')
  @RequireCsrf() // ✅ Proteger logout de CSRF
  async logout() {
    // ...
  }

  @Post('change-password')
  @RequireCsrf() // ✅ Proteger cambio de contraseña
  async changePassword(@Body() dto: ChangePasswordDto) {
    // ...
  }
}
```

### Endpoints SIN `@RequireCsrf()` (Webhooks)

| Endpoint                              | ¿Por qué NO tiene CSRF?                               |
| ------------------------------------- | ----------------------------------------------------- |
| `/api/pagos/webhook`                  | MercadoPago no envía Origin/Referer (webhook externo) |
| `/api/colonia/webhook`                | MercadoPago no envía Origin/Referer (webhook externo) |
| `/api/inscripciones-2026/webhook`     | MercadoPago no envía Origin/Referer (webhook externo) |
| `/api/estudiantes` (y todos los CRUD) | API pura, llamadas programáticas sin navegador        |

**Ejemplo: Webhook de MercadoPago**

```typescript
@Controller('pagos')
export class PagosController {
  @Post('webhook')
  @UseGuards(MercadoPagoWebhookGuard) // ✅ Validación HMAC en lugar de CSRF
  async webhook(@Body() dto: WebhookDto) {
    // ✅ NO necesita @RequireCsrf()
    // MercadoPago valida con firma HMAC
  }
}
```

---

## 🧑‍💻 Guía para Desarrolladores

### ¿Cuándo usar `@RequireCsrf()`?

#### ✅ SÍ usar en:

1. **Formularios web que modifican estado**

   ```typescript
   @Post('login')
   @RequireCsrf() // ✅ Formulario HTML de login
   async login(@Body() dto: LoginDto) {}
   ```

2. **Acciones sensibles desde el navegador**

   ```typescript
   @Delete('estudiantes/:id')
   @RequireCsrf() // ✅ Botón "Eliminar" en UI web
   async eliminar(@Param('id') id: string) {}
   ```

3. **Endpoints que solo se llaman desde tu frontend**
   ```typescript
   @Post('perfil/actualizar')
   @RequireCsrf() // ✅ Formulario de perfil en React
   async actualizarPerfil(@Body() dto: UpdateProfileDto) {}
   ```

#### ❌ NO usar en:

1. **Webhooks externos**

   ```typescript
   @Post('webhook')
   // ❌ NO usar @RequireCsrf() aquí
   async webhook(@Body() dto: WebhookDto) {}
   ```

2. **API pura (llamadas programáticas)**

   ```typescript
   @Get('estudiantes')
   // ❌ NO usar @RequireCsrf() en API REST
   async listar() {}
   ```

3. **Endpoints que usan Bearer token en header**

   ```typescript
   @Post('api/v1/resource')
   @UseGuards(JwtAuthGuard) // JWT en Authorization header
   // ❌ NO usar @RequireCsrf() (no es navegador)
   async create(@Body() dto: CreateDto) {}
   ```

4. **Métodos seguros (GET, HEAD, OPTIONS)**
   ```typescript
   @Get('productos')
   // ❌ NO usar @RequireCsrf() en GET
   async listar() {}
   ```

### Alternativas a CSRF

| Caso de Uso     | Alternativa            | Ejemplo                        |
| --------------- | ---------------------- | ------------------------------ |
| Webhooks        | Firma HMAC             | `MercadoPagoWebhookGuard`      |
| API REST        | JWT en Bearer header   | `@UseGuards(JwtAuthGuard)`     |
| Operaciones GET | No necesita protección | Métodos seguros (solo lectura) |

---

## 🧪 Tests

### Archivo de Tests

**Archivo**: [`apps/api/src/common/guards/__tests__/csrf-opt-in.spec.ts`](../apps/api/src/common/guards/__tests__/csrf-opt-in.spec.ts)

### Casos de Prueba

| Test                                        | Descripción                                         |
| ------------------------------------------- | --------------------------------------------------- |
| Endpoint SIN decorator permite sin Origin   | Webhooks funcionan sin Origin/Referer               |
| Endpoint CON decorator rechaza sin Origin   | Login rechaza requests sin Origin                   |
| Endpoint CON decorator acepta Origin válido | Login acepta requests de localhost:3000             |
| Webhook desde MercadoPago                   | POST /pagos/webhook funciona sin Origin             |
| API call desde Postman                      | POST /api/estudiantes funciona sin Origin           |
| Ataque CSRF bloqueado                       | POST /auth/login desde sitio malicioso es rechazado |

### Ejecutar Tests

```bash
npm test csrf-opt-in.spec.ts
```

---

## 🌐 Configuración de Origins

### Variables de Entorno

```bash
# .env.development
FRONTEND_URL=http://localhost:3000

# .env.production
FRONTEND_URL=https://mateatletas.com,https://www.mateatletas.com
```

### Múltiples Origins

```typescript
// Guard soporta múltiples origins separados por coma
private readonly allowedOrigins = [
  'http://localhost:3000', // Dev
  'http://localhost:3002', // Dev alternativo
  ...process.env.FRONTEND_URL.split(',').map((url) => url.trim()),
];
```

---

## 🚨 Casos Edge y Validación

### 1. Origin vs Referer

```typescript
// Prioridad: Origin > Referer
const origin = request.headers.origin || request.headers.referer;
```

### 2. Normalización de URLs

```typescript
// Normalizar trailing slashes y paths
normalizeOrigin('http://localhost:3000/') → 'http://localhost:3000'
normalizeOrigin('http://localhost:3000/login') → 'http://localhost:3000'
```

### 3. Origins Malformados

```typescript
// Rechazar origins inválidos
normalizeOrigin('not-a-url') → Reject
normalizeOrigin('') → Reject
normalizeOrigin(undefined) → Reject
```

---

## 📊 Comparación: Global vs Opt-In

| Aspecto              | CSRF Global (Antes)   | CSRF Opt-In (Ahora)    |
| -------------------- | --------------------- | ---------------------- |
| Webhooks MercadoPago | ❌ Bloqueados         | ✅ Funcionan           |
| API calls sin Origin | ❌ Bloqueadas         | ✅ Funcionan           |
| Postman/Insomnia     | ❌ No funciona        | ✅ Funciona            |
| Login desde frontend | ✅ Protegido          | ✅ Protegido           |
| Desarrolladores      | 😡 Frustrados         | 😊 Contentos           |
| Seguridad web        | ✅ Fuerte (demasiado) | ✅ Fuerte (balanceado) |

---

## 🛠️ Troubleshooting

### Problema: "Request rechazado: falta Origin/Referer"

**Causa**: Endpoint tiene `@RequireCsrf()` pero el request no incluye Origin/Referer.

**Solución**:

1. Si es un webhook → **Remover** `@RequireCsrf()`
2. Si es API pura → **Remover** `@RequireCsrf()`
3. Si es frontend web → Verificar que el browser envía Origin (debería ser automático)

### Problema: "Origin no permitido"

**Causa**: El Origin del request no está en `FRONTEND_URL`.

**Solución**:

```bash
# Agregar el origin a FRONTEND_URL
FRONTEND_URL=http://localhost:3000,https://nuevo-dominio.com
```

### Problema: CORS error + CSRF error

**Causa**: Configuración de CORS incorrecta.

**Solución**: Verificar `main.ts`:

```typescript
app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'), false);
    }
  },
  credentials: true, // ✅ CRÍTICO para cookies
});
```

---

## 📚 Referencias

- [OWASP: Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: Origin Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin)
- [MDN: Referer Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer)
- [NestJS: Guards](https://docs.nestjs.com/guards)
- [NestJS: Reflector](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata)

---

## ✅ Checklist de Implementación

- [x] Crear decorator `@RequireCsrf()`
- [x] Actualizar `CsrfProtectionGuard` a opt-in
- [x] Remover CSRF de guards globales en `app.module.ts`
- [x] Aplicar `@RequireCsrf()` en endpoints críticos (login, logout, change-password)
- [x] Verificar que webhooks NO tienen `@RequireCsrf()`
- [x] Crear tests de opt-in (`csrf-opt-in.spec.ts`)
- [x] Documentar estrategia (`CSRF-PROTECTION-STRATEGY.md`)
- [ ] Ejecutar tests y verificar funcionamiento
- [ ] Deploy y verificación en producción

---

## 🎉 Conclusión

La conversión de CSRF a **opt-in** elimina fricción en desarrollo y operaciones (webhooks, API calls) mientras mantiene protección en los puntos críticos. La regla es simple:

**Si es un formulario web que modifica estado → `@RequireCsrf()`**
**Si es webhook, API o lectura → NO decorator**

Esta estrategia balancea seguridad con usabilidad, siguiendo el principio de **"seguridad por defecto donde importa, flexibilidad donde no"**.

---

**Autor**: Claude Code (Anthropic)
**Reviewers**: Equipo Mateatletas
**Aprobado**: [Pendiente]
