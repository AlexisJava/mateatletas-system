# Sistema Multi-Rol - Flujo con Logging Exhaustivo

## 📋 Resumen de Cambios

Se implementó un sistema de logging exhaustivo para debuggear el flujo completo de autenticación multi-rol.

## 🔍 Componentes Modificados

### 1. **apps/web/src/store/auth.store.ts**
- ✅ `login()`: Logging completo del proceso de login
- ✅ `setSelectedRole()`: Logging antes y después de setear el rol
- ✅ `logout()`: Reset de `selectedRole` a `null`

### 2. **apps/web/src/app/login/page.tsx**
- ✅ `[MOUNT-EFFECT]`: Resetea `selectedRole` al montar componente
- ✅ `[MODAL-DETECTOR]`: Detecta cuándo mostrar modal de selección de rol
- ✅ `[HANDLE-SELECT-ROLE]`: Handler cuando usuario selecciona un rol
- ✅ `[REDIRECT-EFFECT]`: Lógica de redirección con verificaciones paso a paso

### 3. **apps/web/src/app/admin/layout.tsx**
- ✅ Usa `activeRole = selectedRole || user.role` para validaciones

### 4. **apps/web/src/app/docente/layout.tsx**
- ✅ Usa `activeRole = selectedRole || user.role` para validaciones

## 📊 Logs Esperados - Flujo Exitoso

### Paso 1: Usuario entra a /login
```
🔄 [MOUNT-EFFECT] Componente LoginPage montado
🔄 [MOUNT-EFFECT] selectedRole actual: null
✓ [MOUNT-EFFECT] selectedRole ya es null - OK
```

### Paso 2: Usuario hace login
```
╔═══════════════════════════════════════════════╗
║ [AUTH-STORE] LOGIN INICIADO                   ║
╚═══════════════════════════════════════════════╝
📧 [AUTH-STORE] Email: alexis.figueroa@est.fi.uncoma.edu.ar
🔄 [AUTH-STORE] Seteando isLoading=true, selectedRole=null
🌐 [AUTH-STORE] Llamando authApi.login...
✓ [AUTH-STORE] Respuesta recibida del backend:
   → user.role: admin
   → user.roles: ["admin", "docente"]
   → user.debe_cambiar_password: false
🔄 [AUTH-STORE] Actualizando estado del store:
   → selectedRole: null
✓ [AUTH-STORE] Estado final del store:
   → selectedRole: null
   → isAuthenticated: true
╔═══════════════════════════════════════════════╗
║ [AUTH-STORE] LOGIN COMPLETADO                 ║
╚═══════════════════════════════════════════════╝
```

### Paso 3: Modal Detector detecta multi-rol
```
🔍 [MODAL-DETECTOR] useEffect ejecutado:
   isAuthenticated: true
   hasUser: true
   roles: ["admin", "docente"]
   rolesLength: 2
   selectedRole: null
   showRoleSelector: false
✅ [MODAL-DETECTOR] ACCIÓN: Mostrando modal de selector de rol
   → Usuario tiene 2 roles: ["admin", "docente"]
   → selectedRole actual: null
```

### Paso 4: Redirect Effect BLOQUEADO por modal
```
───────────────────────────────────────────────
🔄 [REDIRECT-EFFECT] useEffect ejecutado:
   isAuthenticated: true
   selectedRole: null
   showRoleSelector: true
⏸️ [REDIRECT-EFFECT] BLOQUEADO: Modales activos
   → showRoleSelector: true
───────────────────────────────────────────────
```

### Paso 5: Usuario selecciona "Docente"
```
═══════════════════════════════════════════════
🎯 [HANDLE-SELECT-ROLE] Inicio
🎯 [HANDLE-SELECT-ROLE] Rol seleccionado: docente
🎯 [HANDLE-SELECT-ROLE] Estado ANTES de setSelectedRole:
   → selectedRole en hook: null
   → selectedRole en store: null
   → showRoleSelector: true

╔═══════════════════════════════════════════════╗
║ [AUTH-STORE] SET SELECTED ROLE                ║
╚═══════════════════════════════════════════════╝
🎯 [AUTH-STORE] selectedRole ANTES: null
🎯 [AUTH-STORE] Nuevo valor: docente
✓ [AUTH-STORE] selectedRole DESPUÉS: docente
╚═══════════════════════════════════════════════╝

✓ [HANDLE-SELECT-ROLE] setSelectedRole(docente) ejecutado
✓ [HANDLE-SELECT-ROLE] setShowRoleSelector(false) ejecutado
✓ [HANDLE-SELECT-ROLE] hasRedirectedRef.current = false

🔄 [HANDLE-SELECT-ROLE] Estado DESPUÉS (100ms):
   → selectedRole en store: docente
═══════════════════════════════════════════════
```

### Paso 6: Modal Detector no hace nada
```
🔍 [MODAL-DETECTOR] useEffect ejecutado:
   selectedRole: docente
   showRoleSelector: false
⏸️ [MODAL-DETECTOR] No hay acción requerida
```

### Paso 7: Redirect Effect ejecuta redirección
```
───────────────────────────────────────────────
🔄 [REDIRECT-EFFECT] useEffect ejecutado:
   isAuthenticated: true
   selectedRole: docente
   user.role: admin
   user.roles: ["admin", "docente"]
   showRoleSelector: false
   hasRedirected: false

✅ [REDIRECT-EFFECT] TODAS LAS CONDICIONES CUMPLIDAS
   → Calculando activeRole:
     · selectedRole: docente
     · user.role: admin
     · activeRole (resultado): docente

🚀 [REDIRECT-EFFECT] EJECUTANDO REDIRECCIÓN
   → redirectPath: /docente/dashboard
   → Método: router.replace()
✓ [REDIRECT-EFFECT] router.replace() ejecutado
───────────────────────────────────────────────
```

### Paso 8: Layout de Docente permite acceso
```
[Layout de Docente valida]
activeRole = selectedRole || user.role
activeRole = "docente" || "admin" = "docente"
✅ activeRole === "docente" → PERMITIR ACCESO
```

## ❌ Escenarios de Error y Qué Logs Buscar

### Error 1: Modal no aparece
**Buscar:**
```
🔍 [MODAL-DETECTOR] useEffect ejecutado:
   selectedRole: [VALOR_NO_NULL] ← PROBLEMA AQUÍ
```
**Causa:** `selectedRole` no se reseteó correctamente

### Error 2: Redirige antes de mostrar modal
**Buscar:**
```
🔄 [REDIRECT-EFFECT] useEffect ejecutado:
   showRoleSelector: false ← DEBERÍA SER true
✅ [REDIRECT-EFFECT] TODAS LAS CONDICIONES CUMPLIDAS
```
**Causa:** Orden de ejecución de useEffects incorrecto

### Error 3: Redirige al dashboard incorrecto
**Buscar:**
```
✅ [REDIRECT-EFFECT] TODAS LAS CONDICIONES CUMPLIDAS
   → activeRole (resultado): admin ← DEBERÍA SER docente
```
**Causa:** `selectedRole` no se actualizó correctamente en el store

### Error 4: Layout redirige de vuelta
**Causa:** Layout no está usando `selectedRole`
**Solución:** Ya está implementado en ambos layouts

## 🧪 Casos de Prueba

### Caso 1: Usuario multi-rol selecciona Docente
1. Ir a /login
2. Ingresar credenciales
3. **ESPERADO:** Modal aparece inmediatamente
4. Seleccionar "Docente"
5. **ESPERADO:** Redirige a /docente/dashboard
6. **ESPERADO:** Permanece en /docente/dashboard

### Caso 2: Usuario multi-rol selecciona Admin
1. Ir a /login
2. Ingresar credenciales
3. **ESPERADO:** Modal aparece inmediatamente
4. Seleccionar "Admin"
5. **ESPERADO:** Redirige a /admin/dashboard
6. **ESPERADO:** Permanece en /admin/dashboard

### Caso 3: Usuario con 1 solo rol
1. Ir a /login
2. Ingresar credenciales de usuario con 1 solo rol
3. **ESPERADO:** NO aparece modal
4. **ESPERADO:** Redirige directamente al dashboard correspondiente

## 📝 Prefijos de Logs

- `[MOUNT-EFFECT]` = useEffect de montaje del componente
- `[MODAL-DETECTOR]` = useEffect que detecta si debe mostrar modal
- `[HANDLE-SELECT-ROLE]` = Handler cuando usuario selecciona rol
- `[REDIRECT-EFFECT]` = useEffect que maneja redirecciones
- `[AUTH-STORE]` = Acciones del store de autenticación

## 🎯 Próximos Pasos

1. Hacer login con credenciales multi-rol
2. Copiar TODOS los logs de la consola
3. Analizar los logs siguiendo este documento
4. Identificar dónde está fallando el flujo
5. Corregir el problema específico
