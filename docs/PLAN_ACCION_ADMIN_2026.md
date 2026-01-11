# PLAN DE ACCION - PORTAL ADMIN 2026

> Fecha: 2026-01-10
> Branch: feature/refactor-casa-mundo-architecture (47 commits ahead of main)
> Estado actual: 90% funcional

---

## RESUMEN EJECUTIVO

El Portal Admin está **mayormente completo**. El Sistema Casa/Mundo 2026 está implementado.
Quedan gaps menores en datos del backend y funcionalidades de exportación.

---

## FASE 0: MERGE Y ESTABILIZACIÓN (Inmediato)

**Objetivo**: Consolidar el trabajo actual antes de continuar

### Tareas

- [ ] Correr suite de tests completa (`yarn test`)
- [ ] Verificar build (`yarn build`)
- [ ] Crear PR para merge a main
- [ ] Merge feature/refactor-casa-mundo-architecture → main

### Criterio de Éxito

- Build sin errores
- Tests críticos pasando
- PR aprobado y mergeado

---

## FASE 1: ENDPOINTS FALTANTES (Backend) - CRÍTICO

**Objetivo**: Completar los datos que el frontend necesita pero están hardcodeados

### 1.1 Endpoint: Clases Asignadas por Docente

**Problema**: En `usePersonas.ts:193` está hardcodeado `clasesAsignadas: 0`

**Solución**:

```typescript
// GET /api/docentes/:id/clases-count
// Response: { claseGrupos: number, comisiones: number, total: number }
```

**Archivos a modificar**:

- `apps/api/src/docentes/docentes.controller.ts` - Agregar endpoint
- `apps/api/src/docentes/docentes.service.ts` - Agregar método
- `apps/web/src/lib/api/admin.api.ts` - Agregar llamada
- `apps/web/src/components/admin/views/personas/hooks/usePersonas.ts` - Consumir endpoint

**Tiempo estimado**: 1-2 horas

### 1.2 Endpoint: Libros Leídos (Analytics)

**Problema**: En `AnalyticsView.tsx` muestra "—" si no hay datos

**Solución**:

```typescript
// GET /api/admin/analytics/libros-leidos
// Response: { total: number, porEstudiante: number, tendencia: [...] }
```

**Archivos a modificar**:

- `apps/api/src/admin/admin.controller.ts` - Agregar endpoint
- `apps/api/src/admin/admin.service.ts` - Agregar método (query a ProgresoLibro)
- `apps/web/src/lib/api/admin.api.ts` - Agregar llamada
- `apps/web/src/components/admin/views/analytics/AnalyticsView.tsx` - Consumir

**Tiempo estimado**: 1-2 horas

---

## FASE 2: FUNCIONALIDADES PENDIENTES (Frontend + Backend)

### 2.1 Exportar Reportes CSV/PDF

**Problema**: Botón visible en FinanzasView pero sin funcionalidad

**Solución Backend**:

```typescript
// GET /api/admin/finanzas/exportar?formato=csv|pdf&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
// Response: Blob (archivo descargable)
```

**Solución Frontend**:

- Implementar descarga con `fetch` + `Blob` + `URL.createObjectURL`
- Agregar modal de opciones (rango de fechas, formato)

**Archivos**:

- `apps/api/src/admin/admin.controller.ts`
- `apps/api/src/admin/services/admin-exportar.service.ts` (nuevo)
- `apps/web/src/components/admin/views/finanzas/components/ExportModal.tsx` (nuevo)

**Tiempo estimado**: 3-4 horas

### 2.2 Registro de Pago Manual

**Problema**: No hay forma de registrar pagos manuales (transferencias, efectivo)

**Solución**:

```typescript
// POST /api/admin/pagos/manual
// Body: { tutorId, monto, metodoPago, referencia, concepto }
```

**Frontend**:

- Modal de registro de pago
- Validaciones de monto y tutor
- Confirmación

**Tiempo estimado**: 2-3 horas

---

## FASE 3: MEJORAS DE UX (Frontend)

### 3.1 Feedback Visual en Acciones

- [ ] Toast notifications para acciones exitosas/fallidas
- [ ] Loading states más claros en botones
- [ ] Confirmaciones antes de acciones destructivas

### 3.2 Filtros Persistentes

- [ ] Guardar filtros en localStorage
- [ ] Restaurar filtros al volver a la vista

### 3.3 Responsive Design

- [ ] Verificar tablas en móvil
- [ ] Sidebar colapsable en tablets

**Tiempo estimado**: 2-3 horas

---

## FASE 4: TESTING Y DOCUMENTACIÓN

### 4.1 Tests de Integración

- [ ] Tests para nuevos endpoints (clases-count, libros-leidos)
- [ ] Tests E2E para flujos críticos del admin

### 4.2 Documentación API

- [ ] Swagger/OpenAPI actualizado
- [ ] Ejemplos de uso para nuevos endpoints

**Tiempo estimado**: 2-3 horas

---

## CRONOGRAMA SUGERIDO

| Fase     | Prioridad | Tiempo | Dependencias |
| -------- | --------- | ------ | ------------ |
| FASE 0   | CRÍTICA   | 30 min | Ninguna      |
| FASE 1.1 | ALTA      | 1-2h   | FASE 0       |
| FASE 1.2 | ALTA      | 1-2h   | FASE 0       |
| FASE 2.1 | MEDIA     | 3-4h   | FASE 1       |
| FASE 2.2 | MEDIA     | 2-3h   | FASE 1       |
| FASE 3   | BAJA      | 2-3h   | FASE 2       |
| FASE 4   | BAJA      | 2-3h   | FASE 2       |

**Total estimado**: 12-18 horas de trabajo

---

## ESTADO ACTUAL POR VISTA

| Vista                   | Estado  | Datos Reales | Pendiente             |
| ----------------------- | ------- | ------------ | --------------------- |
| Dashboard               | ✅ 95%  | ✅           | -                     |
| Personas                | ⚠️ 90%  | ⚠️           | clasesAsignadas       |
| Finanzas                | ⚠️ 85%  | ✅           | Exportar, Pago manual |
| Analytics               | ⚠️ 80%  | ⚠️           | librosLeidos          |
| Productos               | ✅ 100% | ✅           | -                     |
| Casa/Mundo Asignaciones | ✅ 100% | ✅           | -                     |
| Grupos Pedagógicos      | ✅ 100% | ✅           | -                     |

---

## ENDPOINTS EXISTENTES (Referencia)

### Admin Controller (`/api/admin/`)

- `GET /dashboard` - Stats del dashboard
- `GET /estadisticas` - Stats del sistema
- `GET /analytics/retencion` - Retención de estudiantes
- `GET /pagos/recientes` - Transacciones recientes
- `GET /pagos/historico-mensual` - Histórico de ingresos
- `GET /estudiantes` - Listar estudiantes
- `POST /estudiantes/con-credenciales` - Crear con credenciales
- `PATCH /estudiantes/:id` - Actualizar estudiante
- `PATCH /estudiantes/:id/plan` - Asignar plan
- `GET /docentes/filtrados` - Docentes con filtros Casa/Mundo
- `POST /docentes/:id/casas` - Asignar casa
- `DELETE /docentes/:id/casas/:casa` - Remover casa
- `POST /docentes/:id/mundos` - Asignar mundo
- `DELETE /docentes/:id/mundos/:mundo` - Remover mundo
- `GET /grupos-pedagogicos` - Listar grupos
- `PATCH /grupos-pedagogicos/:id` - Actualizar grupo
- `POST /grupos-pedagogicos/migrar-legacy` - Migrar legacy

### Docentes Controller (`/api/docentes/`)

- `GET /` - Listar todos (Admin)
- `GET /:id` - Obtener uno (Admin)
- `POST /` - Crear (Admin)
- `PATCH /:id` - Actualizar (Admin)
- `DELETE /:id` - Eliminar (Admin)
- `GET /me/*` - Endpoints self-service (Docente)

---

## DECISIONES ARQUITECTURALES

1. **No crear vista de Comisiones separada** - Las comisiones se gestionan desde Productos
2. **Exportación server-side** - El backend genera el archivo, no el frontend
3. **Mantener patrón hooks** - Cada vista tiene su hook de datos

---

## NOTAS

- El Sistema Casa/Mundo 2026 está **100% implementado**
- Los 47 commits del feature branch están listos para merge
- La documentación obsoleta ya fue limpiada (112 archivos eliminados)

---

_Generado por Claude Opus 4.5 - 2026-01-10_
