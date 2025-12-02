# AUDITORÍA EXHAUSTIVA - PORTAL ADMIN DE MATEATLETAS

**Fecha**: 2025-12-02
**Estado**: Problemas críticos identificados

---

## Resumen Ejecutivo

Se identificaron **4 PROBLEMAS CRÍTICOS** que causan el comportamiento de "redirección al inicio":

1. **FALTA DE RUTA RAÍZ**: No existe `/admin/page.tsx`
2. **USO DE `<a>` EN LUGAR DE `<Link>`**: Causa recargas completas de página
3. **REDIRECCIONES AGRESIVAS EN LAYOUT**: useEffect redirige en cada navegación
4. **LÓGICA DE ROL CONFUSA**: Confunde `selectedRole` con `user.role`

---

## 1. ESTRUCTURA DE RUTAS

```
/admin/                          ❌ NO EXISTE page.tsx
  ├── layout.tsx                 ✅ Existe (pero con problemas)
  ├── error.tsx                  ✅ Existe
  ├── dashboard/page.tsx         ✅ Existe
  ├── usuarios/page.tsx          ✅ Existe
  ├── credenciales/page.tsx      ✅ Existe
  ├── clases/
  │   ├── page.tsx               ✅ Existe
  │   └── [id]/page.tsx          ✅ Existe
  ├── estudiantes/page.tsx       ✅ Existe
  ├── pagos/page.tsx             ✅ Existe
  ├── planificaciones/
  │   ├── page.tsx               ✅ Existe
  │   └── demo/page.tsx          ✅ Existe
  ├── planificaciones-simples/
  │   ├── page.tsx               ✅ Existe
  │   └── [codigo]/page.tsx      ✅ Existe
  ├── reportes/page.tsx          ✅ Existe
  └── sectores-rutas/page.tsx    ✅ Existe
```

---

## 2. PROBLEMAS CRÍTICOS

### P1: Falta `/admin/page.tsx`

**Ubicación**: `/apps/web/src/app/admin/`

**Problema**: El directorio `/admin/` solo tiene `layout.tsx` y `error.tsx`, pero NO tiene `page.tsx`. En Next.js App Router, acceder a `/admin` sin `page.tsx` causa comportamiento indefinido.

**Síntoma**: Acceder a `/admin` directamente causa redirección inesperada.

**Solución**: Crear `/admin/page.tsx` que redirija a `/admin/dashboard`

---

### P2: Uso de `<a>` en lugar de `<Link>` en Sidebar

**Ubicación**: `/apps/web/src/app/admin/layout.tsx`
- Línea ~219 (sidebar desktop)
- Línea ~475 (sidebar mobile)

**Código problemático**:
```typescript
<a
  key={item.href}
  href={item.href}  // ← Etiqueta <a> HTML causa reload completo
  className={...}
>
```

**Impacto**:
- Cada click en sidebar hace **reload completo de página**
- El layout se **remonta** (componente se destruye y recrea)
- El `useEffect` se ejecuta de nuevo
- Las validaciones de auth se re-ejecutan
- Esto puede causar redirecciones inesperadas

**Solución**: Cambiar a `<Link>` de Next.js:
```typescript
import Link from 'next/link';

<Link
  key={item.href}
  href={item.href}
  className={...}
>
```

---

### P3: Redirecciones Agresivas en useEffect

**Ubicación**: `/apps/web/src/app/admin/layout.tsx` líneas 59-123

**Código problemático**:
```typescript
useEffect(() => {
  const validateAuth = async () => {
    const activeRole = selectedRole || user?.role;

    // Si tiene otro rol activo, REDIRIGIR
    if (user && activeRole && activeRole !== 'admin') {
      router.replace(redirectPath);  // ← REDIRECCIÓN PROBLEMÁTICA
      return;
    }

    // Si no hay usuario, checkAuth y más redirecciones...
  };
  validateAuth();
}, []);
```

**Problema**:
- Se ejecuta en CADA navegación (porque `<a>` causa remount)
- La condición `activeRole !== 'admin'` puede fallar si `selectedRole` está desincronizado
- Causa redirecciones incluso para admins legítimos

**Síntoma**: "Se vuelve al inicio y no sabe por qué"

---

### P4: Lógica de Rol Confusa

**Ubicación**: `/apps/web/src/app/admin/layout.tsx` línea 69

**Código problemático**:
```typescript
const activeRole = selectedRole || user?.role;

if (user && activeRole && activeRole !== 'admin') {
  // Redirige aunque el usuario SEA admin pero tenga selectedRole diferente
}
```

**Problema**: Si un admin tiene múltiples roles (`roles: ['admin', 'docente']`) y por alguna razón `selectedRole = 'docente'`, será redirigido fuera del admin aunque tiene permisos.

**Solución correcta**:
```typescript
const userRoles = user?.roles || [user?.role];
if (user && !userRoles.includes('admin')) {
  // Solo redirigir si NO tiene rol admin en absoluto
}
```

---

## 3. FLUJO DEL BUG

```
1. Admin hace click en "Usuarios" en sidebar
   ↓
2. <a href="/admin/usuarios"> causa RELOAD COMPLETO
   ↓
3. Layout se destruye y recrea (remount)
   ↓
4. useEffect se ejecuta nuevamente
   ↓
5. validateAuth() se ejecuta
   ↓
6. Si selectedRole !== 'admin' por cualquier razón:
   router.replace('/docente/dashboard')
   ↓
7. Usuario es redirigido FUERA del admin
```

---

## 4. PROBLEMAS SECUNDARIOS

### P5: Falta validación en páginas individuales

**Estado**: Ninguna página en `/admin/**/page.tsx` valida autenticación

**Impacto**: Si alguien bypasea el layout, podría ver contenido admin

**Severidad**: MEDIA

---

### P6: `isActiveRoute` incompleto

**Ubicación**: Layout línea 130-135

```typescript
const isActiveRoute = (route: string) => {
  if (route === '/admin/dashboard') {
    return pathname === '/admin' || pathname === '/admin/dashboard';
  }
  return pathname?.startsWith(route);  // Puede dar falsos positivos
};
```

**Problema**: `/admin/pagos` matchea `/admin/pagos-config` (si existiera)

---

## 5. PLAN DE CORRECCIÓN

### Prioridad 1 (CRÍTICO)

| # | Tarea | Archivo | Líneas |
|---|-------|---------|--------|
| 1 | Crear `/admin/page.tsx` | nuevo archivo | - |
| 2 | Cambiar `<a>` a `<Link>` (desktop) | layout.tsx | ~219 |
| 3 | Cambiar `<a>` a `<Link>` (mobile) | layout.tsx | ~475 |
| 4 | Arreglar lógica de validación de rol | layout.tsx | 69-84 |

### Prioridad 2 (ALTA)

| # | Tarea | Archivo |
|---|-------|---------|
| 5 | Agregar validación de auth a cada página | todas las pages |
| 6 | Mejorar `isActiveRoute` | layout.tsx |

### Prioridad 3 (MEDIA)

| # | Tarea | Archivo |
|---|-------|---------|
| 7 | Verificar persistencia de `selectedRole` | auth.store.ts |
| 8 | Limpiar console.logs de debug | varios |

---

## 6. ARCHIVOS AFECTADOS

| Archivo | Problema | Severidad |
|---------|----------|-----------|
| `/admin/page.tsx` | NO EXISTE | CRÍTICA |
| `/admin/layout.tsx` | Usa `<a>` líneas 219, 475 | CRÍTICA |
| `/admin/layout.tsx` | Redirección agresiva líneas 59-123 | CRÍTICA |
| `/admin/layout.tsx` | Lógica de rol línea 69 | CRÍTICA |
| Todas `/admin/**/page.tsx` | Sin validación individual | ALTA |
| `/store/auth.store.ts` | selectedRole desincronizado | MEDIA |

---

## 7. CHECKLIST DE VERIFICACIÓN POST-FIX

- [ ] Existe `/admin/page.tsx` que redirija a dashboard
- [ ] Sidebar usa `<Link>` en lugar de `<a>`
- [ ] Layout NO redirige si `user.roles` incluye 'admin'
- [ ] Navegación NO causa recargas de página
- [ ] Console no muestra errores de navegación
- [ ] Admin con múltiples roles puede acceder sin problema

---

## 8. CONCLUSIÓN

El portal admin tiene una **estructura de rutas correcta** pero sufre de **problemas de navegación críticos**:

1. **Navegación HTML tradicional** (`<a>`) en lugar de **Next.js Link**
2. **Validación de auth re-ejecutándose** en cada navegación
3. **Lógica de roles confusa** que no considera multi-rol

**La causa raíz es P2**: El uso de `<a>` causa reload completo, que a su vez dispara P3 (validación) y P4 (lógica de rol confusa), resultando en redirecciones inesperadas.

**Tiempo estimado de corrección**: 1-2 horas para fixes críticos