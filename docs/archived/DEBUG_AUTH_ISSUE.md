# Debugging: Problema de Autenticación Persistente

**Problema Reportado:** "El problema sigue" - Login repetitivo al navegar

---

## 🔧 Fixes Aplicados

### Fix #1: Persistir `isAuthenticated` en Zustand

**Archivo:** `apps/web/src/store/auth.store.ts`
**Línea:** 195

**Cambio:**
```typescript
// ANTES
partialize: (state) => ({
  user: state.user,
  token: state.token,
  // isAuthenticated NO se persistía
}),

// DESPUÉS
partialize: (state) => ({
  user: state.user,
  token: state.token,
  isAuthenticated: state.isAuthenticated, // ← AGREGADO
}),
```

**Razón:** `isAuthenticated` no se guardaba en localStorage, entonces al rehidratar el store quedaba en `false` incluso con `user` y `token` válidos.

---

### Fix #2: Simplificar validación en Admin Layout

**Archivo:** `apps/web/src/app/admin/layout.tsx`
**Líneas:** 14-62

**Lógica actualizada:**
1. Verificar token en localStorage
2. Si tenemos `user` con rol `admin` → OK ✅
3. Si NO tenemos `user` → Llamar `checkAuth()` (backend)
4. Si falla o rol incorrecto → Redirigir

---

## 🧪 Pasos para Probar

### Paso 1: Limpiar caché del navegador

1. Abrí DevTools (F12)
2. Andá a Application → Storage
3. Click derecho en tu dominio → "Clear site data"
4. Refrescá la página (F5)

### Paso 2: Login de nuevo

1. Andá a `http://localhost:3000/login`
2. Ingresá:
   - Email: `admin@mateatletas.com`
   - Password: `Admin123!`
3. Deberías ir a `/admin/dashboard`

### Paso 3: Verificar localStorage

1. En DevTools, andá a Application → Local Storage
2. Buscá el key `auth-storage`
3. Deberías ver algo así:
```json
{
  "state": {
    "user": {
      "id": "...",
      "email": "admin@mateatletas.com",
      "role": "admin",
      ...
    },
    "token": "eyJhbGc...",
    "isAuthenticated": true
  },
  "version": 0
}
```

4. También buscá el key `auth-token`
5. Deberías ver el JWT token

### Paso 4: Navegar entre páginas

1. Click en "Usuarios" → Debería cargar SIN pedir login
2. Click en "Reportes" → Debería cargar SIN pedir login
3. Click en "Productos" → Debería cargar SIN pedir login

### Paso 5: Refrescar página

1. Estando en `/admin/reportes`
2. Presioná F5 (refresh)
3. Deberías ver un spinner breve
4. Luego debería cargar la página (NO redirigir a login)

---

## 🐛 Si el problema persiste...

### Opción A: Ver consola del navegador

1. Abrí DevTools (F12)
2. Andá a la pestaña "Console"
3. Navegá entre páginas
4. Buscá errores en rojo
5. Decime qué errores ves

### Opción B: Ver Network tab

1. Abrí DevTools (F12)
2. Andá a la pestaña "Network"
3. Navegá de Dashboard a Reportes
4. Buscá llamadas a `/auth/profile` o `/auth/login`
5. Decime cuántas veces se llama al backend

### Opción C: Ver el state del store

Agregá esto en la consola del navegador:
```javascript
// Ver el state actual del auth store
localStorage.getItem('auth-storage')

// Ver el token
localStorage.getItem('auth-token')
```

Decime qué te devuelve.

---

## 🔍 Debugging Avanzado

Si seguís teniendo el problema, agregá estos console.logs:

### En `admin/layout.tsx` (línea 15):

```typescript
useEffect(() => {
  const validateAuth = async () => {
    console.log('🔍 [ADMIN LAYOUT] Validando auth...', {
      pathname,
      hasToken: !!localStorage.getItem('auth-token'),
      user,
      isAuthenticated
    });

    // Verificar token en localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.log('❌ [ADMIN LAYOUT] No hay token, redirigiendo a login');
      router.push('/login');
      return;
    }

    // Si ya tenemos user en el store y es admin, TODO OK
    if (user && user.role === 'admin') {
      console.log('✅ [ADMIN LAYOUT] User admin encontrado en store, OK!');
      setIsValidating(false);
      return;
    }

    console.log('⚠️ [ADMIN LAYOUT] No tenemos user, llamando checkAuth()...');
    // ... resto del código
  };

  validateAuth();
}, [pathname]);
```

Luego abrí la consola del navegador y navegá entre páginas. Decime qué logs ves.

---

## 📋 Checklist de Diagnóstico

Marcá lo que ya probaste:

- [ ] Limpiaste caché del navegador
- [ ] Hiciste login de nuevo
- [ ] Verificaste que `auth-storage` existe en localStorage
- [ ] Verificaste que `auth-token` existe en localStorage
- [ ] Navegaste entre páginas y sigue pidiendo login
- [ ] Abriste la consola y NO ves errores
- [ ] Abriste la consola y SÍ ves errores (¿cuáles?)

---

## 🚨 Posibles Causas Adicionales

Si ninguno de los fixes anteriores funciona, el problema puede ser:

### 1. Token expirado muy rápido

El JWT puede estar configurado para expirar en 5 minutos. Revisá el backend:

```bash
# En el backend
grep -r "expiresIn" apps/api/src/auth/
```

Debería ser algo como `'24h'` o `'7d'`, no `'5m'`.

### 2. CORS bloqueando el checkAuth

Si el backend rechaza la llamada a `/auth/profile`, el frontend piensa que no estás autenticado.

Verificá en Network tab si la llamada a `/auth/profile` retorna 200 OK.

### 3. Zustand persist no funcionando

Puede ser que el `persist` de Zustand no esté guardando correctamente.

Probá esto en la consola:
```javascript
// Forzar un set en el store
window.localStorage.setItem('auth-storage', JSON.stringify({
  state: {
    user: { role: 'admin' },
    token: 'test',
    isAuthenticated: true
  },
  version: 0
}));

// Refrescar
location.reload();
```

Si después del reload seguís sin user, el problema es Zustand persist.

---

## 💡 Solución Temporal (Workaround)

Si nada funciona, podés deshabilitar temporalmente la validación estricta:

En `admin/layout.tsx`, línea 14:

```typescript
useEffect(() => {
  const token = localStorage.getItem('auth-token');
  if (!token) {
    router.push('/login');
    return;
  }

  // TEMPORAL: Asumir que si hay token, está todo OK
  setIsValidating(false);
}, [pathname]);
```

Esto va a hacer que NO valide el rol, pero al menos no te va a pedir login cada vez.

**ADVERTENCIA:** Esto es inseguro y solo para debugging.

---

## 📞 Próximos Pasos

Decime:

1. ¿Ya limpiaste el caché del navegador?
2. ¿Qué ves en localStorage después del login?
3. ¿Qué errores ves en la consola del navegador?
4. ¿Cuántas veces se llama al backend al navegar?

Con esa info voy a poder identificar exactamente dónde está el problema.

---

**Última actualización:** Octubre 13, 2025
**Status:** Investigando...
