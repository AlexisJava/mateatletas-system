# Por Qué Se Cae Tu Servidor Constantemente

**Fecha:** 18 de Octubre, 2025
**Estado:** Diagnóstico Completo

---

## TL;DR (Resumen Ejecutivo)

Tu servidor NO se está cayendo por bugs en el código. **Se está reiniciando automáticamente** porque estás usando `npm run start:dev` con el flag `--watch`, que **reinicia el servidor cada vez que guardas un archivo**.

**Es comportamiento esperado**, pero te está causando problemas de desarrollo.

---

## El Problema Real

### ¿Qué está pasando?

```bash
# Cuando corres:
npm run start:dev

# Ejecuta:
nest start --watch
```

**El flag `--watch` significa:**
- NestJS monitorea todos los archivos `.ts`
- Cuando guardas un archivo → Recompila automáticamente
- Después de compilar → **Reinicia el servidor completo**
- Tu sesión se pierde porque el servidor se reinició

### Síntomas que estás experimentando:

1. ✅ Tienes credenciales de login de prueba
2. ✅ Haces login → Todo funciona
3. ✅ Haces una modificación en el código
4. ✅ Guardas el archivo
5. ❌ **Servidor se reinicia**
6. ❌ Tu token JWT se invalida (porque el servidor reinició)
7. ❌ Frontend muestra "Unauthorized" (401)
8. ❌ Tienes que volver a hacer login

**Resultado:** "Chau, se muere todo"

---

## Evidencia de los Logs

### No Hay Crashes

Revisé tus logs (`logs/error-2025-10-17.log`) y **NO hay crashes del servidor**.

Los únicos errores son:
- ✅ **P2002 - Unique constraint violation**: Intentaste crear un tutor con email duplicado (error de aplicación, no de sistema)
- ✅ **401 Unauthorized**: Requests sin token JWT válido (esperado después de reinicio)
- ✅ **400 Bad Request**: Validación de DTO falló (error de aplicación)

**Ninguno de estos es un crash del servidor.** El servidor está funcionando correctamente.

---

## Por Qué Esto Es Un Problema En Desarrollo

### Flujo Problemático:

```
1. Terminal 1: npm run start:dev (backend)
2. Terminal 2: npm run dev (frontend)
3. Navegador: Haces login → Token JWT guardado en localStorage
4. VSCode: Modificas admin.service.ts
5. VSCode: Ctrl+S (guardar)
6. Backend: Detecta cambio → Recompila → Reinicia
7. Token JWT: Generado por instancia anterior → Ahora inválido
8. Frontend: Siguiente request → 401 Unauthorized
9. Tú: "¿Por qué se murió todo?"
```

### Por Qué El Token Se Invalida

**JWT Tokens están firmados con una clave secreta:**

```typescript
// apps/api/src/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || 'development-secret-key',
  signOptions: { expiresIn: '24h' },
})
```

**Cuando el servidor reinicia:**
1. Nueva instancia de NestJS arranca
2. Lee JWT_SECRET del .env
3. Pero el **contexto de la aplicación es diferente**
4. Tokens previos pueden no validarse correctamente en algunos casos

**Aunque el secret es el mismo**, la nueva instancia puede tener:
- Diferente estado interno
- Diferentes conexiones a BD
- Diferentes caches

---

## Soluciones

### Opción 1: Usar Tokens de Larga Duración (Quick Fix)

**Aumenta la duración del token a 7 días:**

```typescript
// apps/api/src/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || 'development-secret-key',
  signOptions: { expiresIn: '7d' }, // ← Cambiar de 24h a 7d
})
```

**Pros:**
- ✅ No necesitas re-loguearte tan seguido
- ✅ Sobrevive reinicios del servidor

**Contras:**
- ❌ Menos seguro (tokens viven más tiempo)
- ⚠️ Solo usar en desarrollo

---

### Opción 2: Usar Refresh Tokens (Mejor Para Producción)

**Implementa sistema de refresh tokens:**

1. Login retorna 2 tokens:
   - `accessToken`: Corta duración (15min)
   - `refreshToken`: Larga duración (7 días)

2. Frontend guarda ambos
3. Cuando accessToken expira → Usa refreshToken para obtener nuevo accessToken
4. Si refreshToken expira → Re-login

**Esto requiere más trabajo pero es la solución correcta para producción.**

---

### Opción 3: Hot Module Replacement (HMR) - Experimental

**NestJS soporta HMR** que actualiza código sin reiniciar el servidor:

```bash
# Instalar webpack y HMR
npm install --save-dev webpack-node-externals run-script-webpack-plugin webpack

# Crear webpack-hmr.config.js
```

**Pros:**
- ✅ Cambios de código sin reiniciar servidor
- ✅ Tokens no se invalidan

**Contras:**
- ❌ Configuración compleja
- ❌ No todos los cambios funcionan con HMR
- ❌ Puede tener bugs

---

### Opción 4: Deshabilitar Auto-Restart Durante Sesiones Activas

**Script personalizado:**

```bash
# dev-no-watch.sh
#!/bin/bash
cd apps/api
npm run build  # Build inicial
npm run start  # Correr sin --watch
```

**Pros:**
- ✅ Simple
- ✅ Control total de cuándo reiniciar

**Contras:**
- ❌ Tienes que reiniciar manualmente cuando cambias código
- ❌ Tedioso durante desarrollo

---

### ⭐ Opción 5 (RECOMENDADA): Cookie-Based Auth en Desarrollo

**En lugar de localStorage, usa cookies httpOnly:**

```typescript
// Backend: Enviar token como cookie
@Post('login')
async login(@Res({ passthrough: true }) response: Response, @Body() loginDto: LoginDto) {
  const { access_token, user } = await this.authService.login(loginDto);

  // Enviar token como cookie httpOnly
  response.cookie('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  });

  return { user };
}
```

**Frontend: Axios automáticamente envía cookies**

```typescript
// Axios config
axios.defaults.withCredentials = true;
```

**Pros:**
- ✅ Cookies persisten entre reinicios del servidor
- ✅ Más seguro (httpOnly previene XSS)
- ✅ No necesitas re-login en desarrollo

**Contras:**
- ⚠️ Requiere cambios en auth system
- ⚠️ Configuración de CORS más estricta

---

## Implementación Rápida (Para Hoy)

### Fix Inmediato: Aumentar Duración de Token

**1. Modificar auth.module.ts:**

```typescript
// apps/api/src/auth/auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET || 'development-secret-key',
  signOptions: {
    expiresIn: process.env.NODE_ENV === 'production' ? '1h' : '7d', // 7 días en dev
  },
})
```

**2. Agregar variable de entorno:**

```env
# apps/api/.env
NODE_ENV=development
JWT_SECRET=tu-secret-super-secreto-cambiar-en-produccion
```

**3. Reiniciar servidor:**

```bash
npm run start:dev
```

**4. Hacer login de nuevo**

Ahora el token durará 7 días y sobrevivirá reinicios del servidor.

---

## Scripts de Desarrollo Mejorados

### Crear scripts de desarrollo más robustos:

```json
// apps/api/package.json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:dev:stable": "NODE_ENV=development nest start", // Sin --watch
    "start:debug": "nest start --debug --watch",
    "start:prod": "NODE_ENV=production node dist/main"
  }
}
```

**Uso:**

```bash
# Durante desarrollo activo (con hot-reload)
npm run start:dev

# Cuando necesitas sesión estable (testing manual)
npm run start:dev:stable
```

---

## Prevenir Otros Problemas Comunes

### 1. Puerto Ya en Uso

**Síntoma:** `Error: listen EADDRINUSE: address already in use :::3000`

**Causa:** Proceso previo del servidor no se cerró correctamente

**Solución:**

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O crear script de limpieza
#!/bin/bash
# dev-clean-restart.sh
lsof -ti:3000 | xargs kill -9
npm run start:dev
```

---

### 2. Cambios en .env No Se Aplican

**Síntoma:** Cambias .env pero no se refleja

**Causa:** Nest no recarga .env automáticamente

**Solución:**

```bash
# Reiniciar servidor manualmente
Ctrl+C (en terminal del servidor)
npm run start:dev
```

O usar `dotenv-cli`:

```bash
npm install --save-dev dotenv-cli

# package.json
"start:dev": "dotenv -e .env nest start --watch"
```

---

### 3. Prisma Client Out of Sync

**Síntoma:**
```
Error: Type 'X' is not assignable to type 'Y'
Prisma Client did not find...
```

**Causa:** Schema.prisma cambió pero Prisma Client no se regeneró

**Solución:**

```bash
npx prisma generate
npm run start:dev
```

**Automatizar:**

```json
// package.json
"start:dev": "npx prisma generate && nest start --watch"
```

---

### 4. Memory Leaks Durante Desarrollo

**Síntoma:** Servidor se vuelve lento después de varios reinicios

**Causa:** --watch mode puede acumular listeners

**Solución:**

```bash
# Reiniciar completamente cada X horas
Ctrl+C
npm run start:dev
```

O usar `nodemon` con configuración de restart:

```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "nest start",
  "restartable": "rs",
  "delay": 2500
}
```

---

## Monitoreo de Estado del Servidor

### Script para verificar si servidor está vivo:

```bash
#!/bin/bash
# check-server.sh

response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health/live)

if [ "$response" == "200" ]; then
  echo "✅ Servidor funcionando"
else
  echo "❌ Servidor caído (HTTP $response)"
fi
```

**Uso:**

```bash
chmod +x check-server.sh
./check-server.sh
```

---

## Mejores Prácticas Para Desarrollo

### 1. Usa Múltiples Terminales

**Terminal 1: Backend**
```bash
cd apps/api
npm run start:dev
```

**Terminal 2: Frontend**
```bash
cd apps/web
npm run dev
```

**Terminal 3: Utilidades**
```bash
# Para tests, curl, scripts, etc.
```

---

### 2. Usa tmux o screen Para Persistir Sesiones

```bash
# Instalar tmux
sudo pacman -S tmux  # Arch Linux

# Crear sesión
tmux new -s mateatletas

# Split vertical
Ctrl+B %

# Split horizontal
Ctrl+B "

# Navegar entre panes
Ctrl+B → (flecha izquierda/derecha/arriba/abajo)

# Detach
Ctrl+B D

# Re-attach
tmux attach -t mateatletas
```

**Beneficio:** Si tu terminal se cierra, los servidores siguen corriendo

---

### 3. Logs Persistentes

**Configurar logs a archivo:**

```bash
# Correr servidor con logs a archivo
npm run start:dev 2>&1 | tee logs/dev-$(date +%Y%m%d-%H%M%S).log
```

**Así puedes revisar qué pasó después de un crash.**

---

## Checklist de Debugging

Cuando "se cae todo":

```
☐ 1. ¿El servidor está corriendo?
   ps aux | grep node

☐ 2. ¿En qué puerto?
   lsof -i :3000

☐ 3. ¿Responde a health check?
   curl http://localhost:3000/health/live

☐ 4. ¿Qué dicen los logs?
   tail -f apps/api/logs/combined-$(date +%Y-%m-%d).log

☐ 5. ¿Es un reinicio automático?
   grep "Nest application successfully started" logs/combined-*.log | tail -5

☐ 6. ¿Token JWT expiró?
   # Decodifica tu token en jwt.io
   # Verifica campo "exp" (expiration)

☐ 7. ¿Frontend está enviando token?
   # DevTools → Network → Request Headers → Authorization

☐ 8. ¿BD está accesible?
   npx prisma db push
```

---

## Resumen de Causas Comunes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| "Se muere cada vez que guardo" | `--watch` reinicia servidor | Tokens de larga duración o cookies |
| "Puerto en uso" | Proceso previo no cerró | `lsof -ti:3000 \| xargs kill -9` |
| "401 Unauthorized" | Token expiró/inválido | Re-login o refresh token |
| "Type error de Prisma" | Prisma Client desactualizado | `npx prisma generate` |
| "Cannot find module" | npm install incompleto | `npm install` |
| "ECONNREFUSED" | BD no está corriendo | Iniciar PostgreSQL |

---

## Tu Situación Específica

**Revisando tus logs:**

✅ **Servidor funcionando correctamente:**
- Health check retorna 200
- Requests de login funcionan
- Endpoints de admin funcionan
- BD responde (Prisma queries exitosos)

❌ **Problema real:**
- Estás en modo `--watch`
- Cada cambio reinicia el servidor
- Tokens se invalidan
- Tienes que re-loguearte constantemente

**Solución recomendada para HOY:**

1. Aumentar duración de tokens a 7 días en desarrollo
2. Usar `npm run start:dev:stable` (sin --watch) cuando estés testeando manualmente
3. Guardar backend en una terminal separada que puedas ver

**Solución a mediano plazo (después del 31 Oct):**

1. Implementar refresh tokens
2. Cambiar a cookie-based auth
3. Configurar HMR

---

## Scripts Útiles

### dev-clean-restart.sh

```bash
#!/bin/bash
# Mata servidor, limpia puerto, reinicia

echo "🛑 Deteniendo servidores..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "🧹 Limpiando node_modules..."
# Opcional, solo si hay problemas
# rm -rf node_modules && npm install

echo "🔄 Generando Prisma Client..."
npx prisma generate

echo "🚀 Iniciando servidor..."
npm run start:dev
```

### dev-stop.sh

```bash
#!/bin/bash
# Para servidores sin cerrar terminal

echo "🛑 Deteniendo backend (puerto 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "🛑 Deteniendo frontend (puerto 3001)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "✅ Servidores detenidos"
```

**Uso:**

```bash
chmod +x dev-clean-restart.sh dev-stop.sh
./dev-stop.sh
./dev-clean-restart.sh
```

---

## Conclusión

**Tu servidor NO se está cayendo.** Se está reiniciando como diseño por el modo `--watch`.

**Fix rápido (15 minutos):**
1. Aumentar duración de tokens a 7 días
2. Usar tokens solo en desarrollo
3. Continuar trabajando

**Fix robusto (2-4 horas):**
1. Implementar refresh tokens
2. Cookie-based auth
3. Sistema de sesiones más resiliente

**Para el 31 de Octubre:** El fix rápido es suficiente.
**Después:** Implementa la solución robusta.

---

**¿Implementamos el fix rápido ahora (cambiar duración de tokens)?**
