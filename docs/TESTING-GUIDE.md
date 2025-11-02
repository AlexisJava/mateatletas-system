# 🧪 Guía de Testing: Conectividad Frontend-Backend

**Fecha:** 2025-11-02
**Propósito:** Testing completo después de resolver problemas de conectividad

---

## 📋 Pre-requisitos

Antes de empezar el testing, verifica que:

- [x] **Paso 1 completado:** Fix de `cursos.store.ts` (commit 6fca1fe)
- [x] **Paso 2 completado:** Variables de entorno configuradas en Vercel
- [ ] **Railway deployment:** Esperando ~10 minutos para deployment completo
- [ ] **Vercel deployment:** Esperando ~3-5 minutos para build completo

---

## 🎯 Paso 3: Testing Completo

### **Test 1: Backend Health Check** ✅

Verifica que el backend en Railway esté respondiendo correctamente.

```bash
# Test básico
curl https://mateatletas-system-production.up.railway.app/api

# Esperado:
# "Hello World!" (200 OK)
```

**Si falla:**
- Verificar que Railway deployment está completo
- Ver logs: `railway logs --deployment | tail -50`
- Buscar: "Nest application successfully started"

---

### **Test 2: CORS Headers** ✅

Verifica que CORS esté configurado correctamente para tu frontend.

```bash
# Test CORS con OPTIONS (preflight)
curl -X OPTIONS \
  -H "Origin: https://www.mateatletasclub.com.ar" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://mateatletas-system-production.up.railway.app/api/auth/login \
  -v 2>&1 | grep -i "access-control"

# Esperado:
# access-control-allow-origin: https://www.mateatletasclub.com.ar
# access-control-allow-credentials: true
# access-control-allow-methods: POST
```

**Si falla:**
- Verificar `FRONTEND_URL` en Railway: `railway variables --json | jq '.FRONTEND_URL'`
- Debe incluir exactamente tu dominio (sin trailing slash)
- Ver logs de CORS: `railway logs --deployment | grep CORS`

---

### **Test 3: Endpoint Público (Login)** ✅

Verifica que el endpoint de login esté accesible sin autenticación.

```bash
# Test login endpoint (debe responder 401 con credenciales inválidas)
curl -X POST \
  https://mateatletas-system-production.up.railway.app/api/auth/estudiante/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"wrongpass"}' \
  -v

# Esperado:
# 401 Unauthorized (porque las credenciales son inválidas)
# {"statusCode":401,"message":"Credenciales inválidas"}

# ❌ NO debería responder:
# 403 Forbidden (indicaría que guards están bloqueando)
# 404 Not Found (indicaría que la ruta no existe)
```

---

### **Test 4: Frontend Apunta a Railway** 🔥 CRÍTICO

Verifica que el frontend esté usando la URL correcta del backend.

#### **Método 1: DevTools Network Tab**

1. Abrir: https://www.mateatletasclub.com.ar
2. Abrir DevTools (F12) → Network tab
3. Intentar hacer cualquier request (ej: cargar cursos)
4. Verificar en Network:

```
✅ CORRECTO:
Request URL: https://mateatletas-system-production.up.railway.app/api/productos
Status: 200 OK (o 401 si requiere auth)

❌ INCORRECTO:
Request URL: https://www.mateatletasclub.com.ar/api/productos
Status: 404 Not Found o 405 Method Not Allowed
```

#### **Método 2: Ver Source Code**

```bash
# Descargar página HTML de producción
curl https://www.mateatletasclub.com.ar > /tmp/frontend.html

# Buscar referencias a localhost (no debería haber ninguna)
grep -i "localhost:3001" /tmp/frontend.html
# Resultado esperado: (vacío, sin matches)

# Buscar referencias a Railway
grep -i "mateatletas-system-production.up.railway.app" /tmp/frontend.html
# Resultado esperado: Puede o no aparecer (las vars se bake en build time)
```

---

### **Test 5: Login de Estudiante (End-to-End)** 🎯

Test completo del flujo de login desde el frontend.

#### **Pre-requisito: Crear estudiante de prueba**

Primero necesitas un estudiante con credenciales configuradas en la BD:

```sql
-- En Railway dashboard → PostgreSQL → Query
-- O usar un endpoint admin para crear estudiante
SELECT id, nombre, apellido, username, email
FROM "Estudiante"
WHERE username IS NOT NULL
LIMIT 5;

-- Si no hay estudiantes con username, crear uno:
-- (Esto debería hacerse desde la app admin)
```

#### **Test desde Frontend:**

1. Ir a: https://www.mateatletasclub.com.ar/login
2. Abrir DevTools (F12) → Network tab
3. Ingresar credenciales:
   - Username: `[username del estudiante]`
   - Password: `[password configurado]`
4. Click en "Iniciar Sesión"
5. Observar en Network:

**✅ Request exitoso:**
```
Request URL: https://mateatletas-system-production.up.railway.app/api/auth/estudiante/login
Method: POST
Status: 200 OK

Request Headers:
  Content-Type: application/json
  Origin: https://www.mateatletasclub.com.ar

Request Payload:
  {"username":"test.student","password":"*******"}

Response Headers:
  Access-Control-Allow-Origin: https://www.mateatletasclub.com.ar
  Access-Control-Allow-Credentials: true
  Set-Cookie: auth-token=...; HttpOnly; Secure; SameSite=Strict

Response:
  {
    "user": {
      "id": "uuid...",
      "nombre": "Test",
      "apellido": "Student",
      ...
    }
  }
```

**❌ Errores posibles:**

| Error | Causa | Solución |
|-------|-------|----------|
| **405 Method Not Allowed** | Frontend va a Vercel, no a Railway | Redeploy Vercel después de configurar vars |
| **401 Unauthorized** | Credenciales incorrectas (esperado si son fake) | Usar credenciales reales de BD |
| **400 Bad Request** | Datos inválidos (falta username o password) | Ver logs de Railway para detalles |
| **403 Forbidden** | CSRF bloqueando request | Verificar que request tenga Origin header |
| **500 CORS Error** | Origin no permitido en FRONTEND_URL | Agregar dominio a FRONTEND_URL en Railway |

---

### **Test 6: Verificar Cookie HttpOnly** 🔒

Después de un login exitoso, verificar que la cookie se estableció correctamente.

#### **En DevTools:**

1. DevTools → Application tab → Cookies
2. Seleccionar: https://www.mateatletasclub.com.ar
3. Buscar cookie: `auth-token`

**✅ Cookie correcta:**
```
Name: auth-token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain: .mateatletasclub.com.ar
Path: /
Expires: (7 días desde ahora)
HttpOnly: ✅ Yes
Secure: ✅ Yes (en producción)
SameSite: Strict (en producción) o Lax (en desarrollo)
```

#### **Test que la cookie se envía automáticamente:**

Después del login, hacer otro request protegido:

```javascript
// En DevTools Console:
fetch('https://mateatletas-system-production.up.railway.app/api/auth/profile', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)

// Esperado:
// { id: "...", nombre: "...", ... }

// NO debería responder:
// 401 Unauthorized (indicaría que cookie no se envió)
```

---

### **Test 7: Error 400 en Login (Debugging)** 🐛

Si el login responde 400, verificar logs de Railway para ver el error exacto.

```bash
# Ver logs en tiempo real
railway logs --deployment | grep -E "LOGIN ESTUDIANTE|VALIDATION ERROR"

# Buscar líneas como:
# 📥 [LOGIN ESTUDIANTE] Request recibido: { username: 'test', password_length: 8, dto_keys: ['username','password'] }
# ❌ [VALIDATION ERROR] Campos con error: [...]
```

**Errores comunes:**

1. **Username demasiado corto:**
```json
{
  "property": "username",
  "constraints": {
    "minLength": "El username debe tener al menos 3 caracteres"
  }
}
```

2. **Password demasiado corto:**
```json
{
  "property": "password",
  "constraints": {
    "minLength": "La contraseña debe tener al menos 8 caracteres"
  }
}
```

3. **Propiedades extra (forbidNonWhitelisted):**
```json
{
  "property": "rememberMe",
  "constraints": {
    "whitelistValidation": "property rememberMe should not exist"
  }
}
```

---

## 📊 Checklist de Verificación Completa

### Backend ✅

- [ ] `curl /api` responde "Hello World!" (200 OK)
- [ ] CORS headers incluyen tu dominio
- [ ] Endpoint `/auth/estudiante/login` responde (401 con credenciales inválidas)
- [ ] Logs no muestran errores CORS
- [ ] Logs muestran "Nest application successfully started"

### Frontend ✅

- [ ] Deployment de Vercel completado exitosamente
- [ ] Variables de entorno visibles en Vercel dashboard
- [ ] Network tab muestra requests a Railway (no a Vercel)
- [ ] No hay errores CORS en console
- [ ] No hay errores de "Mixed Content" (http vs https)

### Login Flow ✅

- [ ] Login request va a Railway
- [ ] Responde 200 OK con credenciales correctas
- [ ] Cookie `auth-token` se establece
- [ ] Cookie tiene HttpOnly y Secure activados
- [ ] Requests subsecuentes incluyen cookie automáticamente
- [ ] Redirect a dashboard después de login exitoso

### Error Handling ✅

- [ ] 401 con credenciales incorrectas (mensaje claro)
- [ ] 400 con datos inválidos (mensaje descriptivo en logs)
- [ ] 403 no aparece en endpoints públicos
- [ ] No hay errores 500 inesperados

---

## 🔧 Comandos Útiles para Testing

```bash
# ========================================
# BACKEND TESTING
# ========================================

# Health check
curl https://mateatletas-system-production.up.railway.app/api

# Test CORS
curl -X OPTIONS \
  -H "Origin: https://www.mateatletasclub.com.ar" \
  https://mateatletas-system-production.up.railway.app/api/auth/login \
  -v 2>&1 | grep -i "access-control"

# Test login endpoint
curl -X POST \
  https://mateatletas-system-production.up.railway.app/api/auth/estudiante/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test1234"}' \
  -v

# Ver logs de Railway
railway logs --deployment | tail -50
railway logs --deployment | grep "LOGIN ESTUDIANTE"
railway logs --deployment | grep "VALIDATION ERROR"
railway logs --deployment | grep "CORS"

# ========================================
# FRONTEND TESTING
# ========================================

# Verificar deployment de Vercel
vercel ls

# Ver variables de entorno
vercel env ls

# Pull variables localmente
vercel env pull

# Test de conectividad desde curl (simular frontend)
curl -X POST \
  https://mateatletas-system-production.up.railway.app/api/auth/estudiante/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.mateatletasclub.com.ar" \
  -d '{"username":"real.user","password":"realpass"}' \
  -v

# ========================================
# DEBUGGING
# ========================================

# Ver últimos 100 logs de Railway
railway logs --deployment | tail -100

# Filtrar por errores
railway logs --deployment | grep -E "ERROR|ERRO|error"

# Filtrar por CORS
railway logs --deployment | grep -i cors

# Ver status de servicios
railway status

# Ver dominios
railway domain
```

---

## 🎉 Resultado Esperado

Después de completar todos los tests, deberías poder:

1. ✅ Abrir https://www.mateatletasclub.com.ar
2. ✅ Hacer login con credenciales de estudiante
3. ✅ Ver la cookie `auth-token` establecida
4. ✅ Ser redirigido al dashboard
5. ✅ Todas las peticiones van a Railway (no a Vercel)
6. ✅ No hay errores CORS en console
7. ✅ La sesión persiste (cookie guardada por 7 días)

---

## 🚨 Troubleshooting Rápido

### "Request va a Vercel en lugar de Railway"

**Problema:** Network tab muestra `https://www.mateatletasclub.com.ar/api/...`

**Solución:**
1. Verificar que `NEXT_PUBLIC_API_URL` esté en Vercel: `vercel env ls`
2. Si está, hacer redeploy: `vercel --prod` (sin usar cache)
3. Esperar 3-5 minutos y probar de nuevo

### "Error CORS"

**Problema:** Console muestra "CORS policy blocked..."

**Solución:**
1. Verificar `FRONTEND_URL` en Railway: `railway variables --json | jq '.FRONTEND_URL'`
2. Debe incluir tu dominio exacto (https://www.mateatletasclub.com.ar)
3. Si falta, agregar: `railway variables --set "FRONTEND_URL=https://www.mateatletasclub.com.ar,..."`
4. Redeploy Railway: `railway up --detach`

### "Error 400 en login"

**Problema:** Login responde 400 Bad Request

**Solución:**
1. Ver logs: `railway logs --deployment | grep "VALIDATION ERROR"`
2. Verificar que username ≥ 3 chars y password ≥ 8 chars
3. Verificar que no haya campos extra en el request body

### "Cookie no se guarda"

**Problema:** Login exitoso pero cookie no aparece

**Solución:**
1. Verificar que el dominio use **https** (no http)
2. En development, cambiar `SameSite` de `strict` a `lax`
3. Verificar en DevTools → Application → Cookies

---

*Generado por Claude Code - 2025-11-02*
