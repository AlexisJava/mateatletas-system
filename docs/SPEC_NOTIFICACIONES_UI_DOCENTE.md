# SPEC: Notificaciones UI Docente

## Resumen Ejecutivo

Conectar el frontend de notificaciones del Portal Docente con el backend existente. Actualmente el dropdown usa datos mock.

**IMPORTANTE**: Este documento es la fuente de verdad para la implementación. Claude Code debe seguir este spec al pie de la letra.

---

## 1. DROPDOWN (Header)

| Requisito                        | Detalle                                   |
| -------------------------------- | ----------------------------------------- |
| Mostrar últimas 5                | Ordenadas por fecha, más reciente primero |
| Badge contador                   | Número de no leídas (rojo si > 0)         |
| Link "Ver todas"                 | Navega a /docente/notificaciones          |
| Click en notificación            | Marca como leída + navega si tiene link   |
| Botón "Marcar todas como leídas" | Visible si hay no leídas                  |

---

## 2. PÁGINA COMPLETA (/docente/notificaciones)

| Requisito                | Detalle                             |
| ------------------------ | ----------------------------------- |
| Lista paginada           | 20 por página                       |
| Buscador                 | Filtrar por texto en título/mensaje |
| Filtro por estado        | Todas / No leídas / Leídas          |
| Filtro por tipo          | Dropdown con tipos de notificación  |
| Marcar como leída        | Click individual                    |
| Marcar todas como leídas | Botón global                        |
| NO se pueden eliminar    | Sin botón de eliminar               |

---

## 3. ENDPOINTS A USAR (ya existen en backend)

| Endpoint                   | Método | Uso                             |
| -------------------------- | ------ | ------------------------------- |
| /notificaciones            | GET    | Listar con paginación y filtros |
| /notificaciones/count      | GET    | Contador para badge             |
| /notificaciones/:id/leer   | PATCH  | Marcar individual como leída    |
| /notificaciones/leer-todas | PATCH  | Marcar todas como leídas        |

---

## 4. COMPORTAMIENTO

| Acción                   | Comportamiento                                                |
| ------------------------ | ------------------------------------------------------------- |
| Abrir dropdown           | GET últimas 5 notificaciones                                  |
| Entrar a página completa | GET con paginación (20 por página)                            |
| Click en notificación    | Marca como leída + navega si tiene link destino               |
| Marcar todas como leídas | Llamar PATCH /leer-todas + actualizar UI + resetear badge a 0 |
| Polling                  | Cada 60 segundos consultar count para actualizar badge        |

---

## 5. UI/UX

### Dropdown

- Icono de campana en header
- Badge rojo con número si hay no leídas (oculto si es 0)
- Al abrir: lista de 5 notificaciones con título, mensaje truncado, fecha relativa
- Footer con link "Ver todas las notificaciones"
- Botón "Marcar todas como leídas" solo si hay no leídas

### Página completa

- Header: "Notificaciones" + botón "Marcar todas como leídas"
- Barra de filtros: Buscador + Filtro estado + Filtro tipo
- Lista de notificaciones con:
  - Indicador visual de leída/no leída (punto azul o fondo diferente)
  - Título
  - Mensaje completo
  - Fecha relativa (hace 5 min, ayer, etc.)
  - Tipo de notificación (badge/tag)
- Paginación al final

---

## 6. ESTADOS DE NOTIFICACIÓN

| Estado   | Visual                       |
| -------- | ---------------------------- |
| No leída | Fondo destacado + punto azul |
| Leída    | Fondo normal, sin indicador  |

---

## 7. TIPOS DE NOTIFICACIÓN DOCENTE

```typescript
enum TipoNotificacionDocente {
  DOCENTE_CLASE_PROXIMA
  DOCENTE_CLASE_ASIGNADA
  DOCENTE_ASISTENCIA_PENDIENTE
  DOCENTE_ESTUDIANTE_ALERTA
  DOCENTE_CLASE_CANCELADA
  DOCENTE_LOGRO_ESTUDIANTE
  DOCENTE_NUEVO_ESTUDIANTE
  DOCENTE_ESTUDIANTE_BAJA
  DOCENTE_MENSAJE_TUTOR
  DOCENTE_TAREAS_PENDIENTES
  DOCENTE_EVALUACION_PENDIENTE
  DOCENTE_MATERIAL_ASIGNADO
  DOCENTE_CLASE_REPROGRAMADA
  DOCENTE_REPORTE_MENSUAL
  DOCENTE_RECORDATORIO_PLANIFICACION
}
```

---

## 8. NO INCLUYE

- Eliminar notificaciones (no permitido)
- WebSocket para real-time (usar polling por ahora)
- Notificaciones push del navegador

---

## 9. ARCHIVOS A MODIFICAR

| Archivo                                                     | Cambio                                 |
| ----------------------------------------------------------- | -------------------------------------- |
| `apps/web/src/components/docente/NotificationsDropdown.tsx` | Conectar con API real                  |
| `apps/web/src/app/docente/notificaciones/page.tsx`          | Crear página completa                  |
| `apps/web/src/lib/api/docentes.api.ts`                      | Verificar que notificacionesApi existe |
| `apps/web/src/components/docente/Sidebar.tsx`               | Agregar link a notificaciones          |

---

## 10. CRITERIOS DE ACEPTACIÓN

- [ ] Dropdown muestra notificaciones reales del backend
- [ ] Badge muestra contador correcto de no leídas
- [ ] Click en notificación la marca como leída
- [ ] Botón "Marcar todas" funciona y actualiza UI
- [ ] Página /docente/notificaciones existe y es funcional
- [ ] Filtros funcionan correctamente
- [ ] Paginación funciona
- [ ] Polling cada 60 segundos actualiza el badge
