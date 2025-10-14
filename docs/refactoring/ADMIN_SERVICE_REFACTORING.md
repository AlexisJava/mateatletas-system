# AdminService Refactoring Plan

## Estado Actual
- **Tamaño:** 911 líneas
- **Responsabilidades:** Stats, Alertas, Usuarios, Cambio de roles
- **Problema:** Múltiples responsabilidades violando Single Responsibility Principle

## Servicios Creados

### ✅ AdminStatsService (Completado)
**Ubicación:** `apps/api/src/admin/services/admin-stats.service.ts`

**Métodos:**
- `getDashboardStats()` - Estadísticas principales del dashboard
- `getSystemStats()` - Estadísticas agregadas del sistema

**Líneas:** ~120

---

### ✅ AdminAlertasService (Completado)
**Ubicación:** `apps/api/src/admin/services/admin-alertas.service.ts`

**Métodos:**
- `listarAlertas()` - Listar alertas pendientes
- `resolverAlerta(id)` - Marcar alerta como resuelta
- `sugerirSolucion(alertaId)` - Generar sugerencia de solución
- `crearAlerta(estudianteId, claseId, descripcion)` - Crear alerta manual

**Líneas:** ~190

---

### ✅ AdminUsuariosService (Completado)
**Ubicación:** `apps/api/src/admin/services/admin-usuarios.service.ts`

**Métodos:**
- `listarUsuarios()` - Listar todos los usuarios
- `changeUserRole(id, role)` - Cambiar rol (simplificado)
- `deleteUser(id)` - Eliminar usuario

**Líneas:** ~195

---

## Plan de Migración

### Paso 1: Servicios Especializados ✅
- [x] Crear AdminStatsService
- [x] Crear AdminAlertasService
- [x] Crear AdminUsuariosService
- [x] Registrar en AdminModule

### Paso 2: Actualizar AdminService (Facade Pattern)
- [ ] Inyectar servicios especializados en constructor
- [ ] Delegar métodos:
  - `getDashboardStats()` → `statsService.getDashboardStats()`
  - `getSystemStats()` → `statsService.getSystemStats()`
  - `listarAlertas()` → `alertasService.listarAlertas()`
  - `resolverAlerta(id)` → `alertasService.resolverAlerta(id)`
  - `sugerirSolucion(id)` → `alertasService.sugerirSolucion(id)`
  - `crearAlerta(...)` → `alertasService.crearAlerta(...)`
  - `listarUsuarios()` → `usuariosService.listarUsuarios()`
  - `changeUserRole(id, role)` → `usuariosService.changeUserRole(id, role)`
  - `deleteUser(id)` → `usuariosService.deleteUser(id)`

### Paso 3: Limpiar Código Legacy
- [ ] Eliminar métodos privados complejos de cambio de rol (mover a AdminUsuariosService)
- [ ] Eliminar tipos internos no utilizados
- [ ] Reducir AdminService a ~100-150 líneas (facade puro)

### Paso 4: Tests
- [ ] Tests unitarios para AdminStatsService
- [ ] Tests unitarios para AdminAlertasService
- [ ] Tests unitarios para AdminUsuariosService
- [ ] Tests de integración para AdminService (facade)

## Beneficios

### Antes
- 1 servicio monolítico de 911 líneas
- Múltiples responsabilidades mezcladas
- Difícil de testear
- Alta complejidad ciclomática

### Después
- 4 servicios especializados (~150 líneas c/u)
- Responsabilidades claras y separadas
- Fácil de testear (mocking simple)
- Baja complejidad por servicio
- Patrón Facade mantiene compatibilidad

## Métricas

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas por servicio | 911 | ~150 | ✅ 83% |
| Servicios | 1 | 4 | ✅ +300% modularidad |
| Responsabilidades | 5 | 1-2 | ✅ SRP cumplido |
| Testabilidad | Baja | Alta | ✅ Mocking simple |

## Notas de Implementación

### Compatibilidad
- AdminService mantiene interfaz pública original
- Controlador no requiere cambios
- Migración sin breaking changes

### Siguiente Fase (Post-MVP)
- Extraer lógica compleja de cambio de roles
- Implementar eventos para auditoría
- Agregar caching en queries pesadas
- Integración real con OpenAI para sugerencias
