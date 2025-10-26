# 🔐 CÓMO INGRESAR CUANDO TENÉS MÚLTIPLES ROLES

**Fecha**: 2025-10-25
**Problema**: Tenés rol de Admin Y Docente con el mismo email
**Solución**: El sistema ahora prioriza Admin automáticamente

---

## 🎯 RESUMEN EJECUTIVO

**Si tenés múltiples roles (Admin + Docente), el sistema SIEMPRE te loguea como Admin automáticamente.**

Ya no podés elegir con cuál rol ingresar. El sistema prioriza:
1. **Admin** (prioridad máxima)
2. Docente
3. Tutor

---

## 📝 CÓMO FUNCIONA AHORA

### Escenario 1: Solo tenés rol de Admin
```
Email: tu@email.com (Admin)
→ Login: Te loguea como Admin ✅
→ Dashboard: /admin/dashboard
```

### Escenario 2: Solo tenés rol de Docente
```
Email: tu@email.com (Docente)
→ Login: Te loguea como Docente ✅
→ Dashboard: /docente/dashboard
```

### Escenario 3: Tenés Admin + Docente (TU CASO)
```
Email: tu@email.com (Admin + Docente)
→ Login: Te loguea como Admin ✅ (prioridad)
→ Dashboard: /admin/dashboard
→ Token JWT: Tiene AMBOS roles en el array `roles`
```

---

## 🔧 CAMBIOS TÉCNICOS REALIZADOS

### Backend: Prioridad de Búsqueda ([auth.service.ts:184-199](apps/api/src/auth/auth.service.ts#L184-L199))

**ANTES (INCORRECTO)**:
```typescript
// Buscaba primero Tutor, luego Docente, luego Admin
let user = await this.prisma.tutor.findUnique({ where: { email } });
if (!user) user = await this.prisma.docente.findUnique({ where: { email } });
if (!user) user = await this.prisma.admin.findUnique({ where: { email } });
```

**AHORA (CORRECTO)**:
```typescript
// Busca primero Admin, luego Docente, luego Tutor
let user = await this.prisma.admin.findUnique({ where: { email } });
if (!user) user = await this.prisma.docente.findUnique({ where: { email } });
if (!user) user = await this.prisma.tutor.findUnique({ where: { email } });
```

### Respuesta del Login Incluye Roles

**Nuevo campo en la respuesta** ([auth.service.ts:248](apps/api/src/auth/auth.service.ts#L248)):
```json
{
  "access_token": "...",
  "user": {
    "id": "...",
    "email": "tu@email.com",
    "nombre": "Tu Nombre",
    "role": "admin",          ← Rol principal
    "roles": ["admin", "docente"],  ← Array de TODOS tus roles
    "debe_cambiar_password": false
  }
}
```

---

## 🚀 CÓMO INGRESAR

### 1. **Ingresar como Admin** (tu caso por defecto)

```
1. Ir a: https://mateatletas.com/login
2. Ingresar:
   - Email: tu@email.com
   - Password: (tu contraseña)
3. Click "Ingresar al Portal"
4. Sistema detecta que sos Admin → Te redirige a /admin/dashboard
```

### 2. **¿Querés acceder al portal Docente teniendo rol de Admin?**

**Opción A (Recomendada)**: Crear un usuario Docente separado
- Email diferente: `tu+docente@email.com`
- Solo rol: Docente
- Ventaja: Separación clara de permisos

**Opción B**: Usar la misma cuenta y navegar manualmente
1. Loguear normalmente (entrarás como Admin)
2. Navegar manualmente a `/docente/dashboard`
3. El backend validará que tenés el rol `docente` en tu array de roles

---

## 🔐 SISTEMA DE CAMBIO DE CONTRASEÑA OBLIGATORIO

### ¿Qué pasa si `debe_cambiar_password = true`?

Cuando te resetean la contraseña o sos creado nuevo:

1. **Login exitoso** → Backend retorna `debe_cambiar_password: true`
2. **Modal bloqueante aparece** → NO podés cerrar el modal
3. **Debés cambiar tu contraseña** con:
   - Contraseña actual (temporal)
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
4. **Después del cambio exitoso** → El flag cambia a `false` y te redirige al dashboard

### Pantalla del Modal:
```
┌─────────────────────────────────────────┐
│  🔒 Cambio de Contraseña Obligatorio   │
│                                         │
│  Por seguridad, debes cambiar tu        │
│  contraseña antes de continuar          │
│                                         │
│  ⚠️ Tu contraseña actual es temporal   │
│                                         │
│  Contraseña Actual: [_________] 👁️     │
│  Nueva Contraseña:  [_________] 👁️     │
│  Confirmar:         [_________] 👁️     │
│                                         │
│       [Cambiar Contraseña]              │
└─────────────────────────────────────────┘
```

---

## 📊 CASOS DE USO

### Caso 1: Admin puro
```javascript
{
  role: 'admin',
  roles: ['admin'],
  debe_cambiar_password: false
}
→ Redirige a: /admin/dashboard
```

### Caso 2: Docente puro
```javascript
{
  role: 'docente',
  roles: ['docente'],
  debe_cambiar_password: true  ← DEBE CAMBIAR
}
→ Muestra modal de cambio de contraseña
→ Después redirige a: /docente/dashboard
```

### Caso 3: Admin + Docente (TU CASO)
```javascript
{
  role: 'admin',  ← Rol principal
  roles: ['admin', 'docente'],  ← Ambos roles disponibles
  debe_cambiar_password: false
}
→ Redirige a: /admin/dashboard
→ Podés navegar manualmente a /docente/dashboard si querés
```

---

## 🛠️ TROUBLESHOOTING

### "Entro como Docente cuando debería ser Admin"
✅ **Solucionado** - El backend ahora prioriza Admin primero.

### "No me pide cambiar la contraseña"
✅ **Solucionado** - El backend ahora retorna `debe_cambiar_password` en el login.

### "El modal de cambio de contraseña no aparece"
- Verificar que el backend retorne `debe_cambiar_password: true`
- Verificar en DevTools: `localStorage` → `auth-storage` → `user.debe_cambiar_password`

### "Cambié la contraseña pero el modal sigue apareciendo"
- El modal se cierra automáticamente cuando `debe_cambiar_password` cambia a `false`
- Verificar que el endpoint `/api/auth/cambiar-password` funcione correctamente

---

## 📝 ENDPOINTS RELEVANTES

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login de Tutor/Docente/Admin |
| `/api/auth/cambiar-password` | POST | Cambiar contraseña del usuario autenticado |
| `/api/admin/credenciales/:id/reset` | POST | Resetear contraseña (Admin) |

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después del login exitoso, verificar:

- [ ] El token JWT incluye `role` (principal) y `roles` (array)
- [ ] Si `debe_cambiar_password = true`, aparece el modal
- [ ] El modal NO se puede cerrar sin cambiar la contraseña
- [ ] Después de cambiar la contraseña, el flag cambia a `false`
- [ ] La redirección al dashboard funciona correctamente según el rol

---

## 🎉 TODO LISTO

**El sistema ahora funciona correctamente para usuarios con múltiples roles!**

Si tenés preguntas o encontrás algún bug, revisá los logs o contactame.
