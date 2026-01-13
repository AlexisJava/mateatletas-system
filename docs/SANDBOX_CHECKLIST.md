# Sandbox Checklist - Auditoría

## Arquitectura (Revisión de Código)

| Archivo             | Líneas | Estado | Notas                                  |
| ------------------- | ------ | ------ | -------------------------------------- |
| SandboxView.tsx     | 241    | [ ]    | Componente principal, layout 3 paneles |
| TreePanel.tsx       | 241    | [ ]    | Navegación del árbol/clases            |
| EditorPanel.tsx     | 134    | [ ]    | Monaco editor                          |
| StartModal.tsx      | 170    | [ ]    | Modal para crear contenido             |
| PreviewPanel.tsx    | 33     | [ ]    | Preview con LessonRenderer             |
| SandboxContext.tsx  | 142    | [ ]    | Estado + Reducer                       |
| useSandboxApi.ts    | 248    | [ ]    | Calls a API                            |
| useCreateContent.ts | 86     | [ ]    | Hook para crear contenido              |
| useLoadFromUrl.ts   | 52     | [ ]    | Carga desde URL params                 |
| tree.utils.ts       | 59     | [ ]    | Funciones de árbol                     |
| sandbox.types.ts    | 91     | [ ]    | Tipos TypeScript                       |

---

## StartModal - Crear contenido

- [ ] Crear Microlección funciona (verificar POST /admin/contenidos)
- [ ] Crear Planificación funciona (verificar POST /admin/planificaciones)
- [ ] Validación de título no vacío funciona
- [ ] Selector de Casa (QUANTUM/VERTEX/PULSAR) funciona
- [ ] Selector de Materia (MATEMATICA/PROGRAMACION/CIENCIAS) funciona
- [ ] Campo cantidad de clases solo aparece en Planificación
- [ ] Redirección post-creación funciona
- [ ] Error se muestra si falla la creación

---

## TreePanel - Navegación

### Microlección (nodos)

- [ ] Muestra árbol de nodos
- [ ] Click selecciona nodo
- [ ] Chevron expande/colapsa nodos con hijos
- [ ] Doble click permite editar nombre
- [ ] Enter confirma nombre editado
- [ ] Escape cancela edición
- [ ] Botón + agrega nodo hijo
- [ ] Botón × elimina nodo
- [ ] Nodos bloqueados no muestran botones de acción

### Planificación (clases)

- [ ] Muestra lista de clases
- [ ] Click selecciona clase
- [ ] Muestra número y título de clase

---

## EditorPanel - Monaco

### Microlección

- [ ] Monaco carga correctamente
- [ ] Muestra JSON del nodo seleccionado
- [ ] Editor vacío si nodo no tiene contenidoJson
- [ ] Cambios actualizan estado (dispatch UPDATE_NODO_JSON)
- [ ] Theme vs-dark aplicado
- [ ] Word wrap funciona

### Planificación

- [ ] Muestra título y descripción de la clase
- [ ] Botón "Editar Teoría" funciona (navega a microlección)
- [ ] Botón "Editar Práctica" funciona (navega a microlección)
- [ ] Botones deshabilitados si no hay teoriaId/practicaId

---

## PreviewPanel

- [ ] Renderiza JSON con LessonRenderer
- [ ] Muestra mensaje si no hay nodo seleccionado
- [ ] Muestra mensaje si nodo es contenedor (sin contenidoJson)
- [ ] Se actualiza al cambiar nodo seleccionado

---

## Persistencia

- [ ] Auto-save funciona (al editar JSON, se guarda automáticamente)
- [ ] Indicador de estado de guardado visible (idle/saving/saved/error)
- [ ] addNodo llama POST /admin/contenidos/:id/nodos
- [ ] removeNodo llama DELETE /admin/nodos/:id
- [ ] renameNodo llama PATCH /admin/nodos/:id
- [ ] saveNodoJson llama PATCH /admin/nodos/:id

---

## Navegación URL

- [ ] Crear microlección redirige a ?type=microleccion&id=xxx
- [ ] Crear planificación redirige a ?type=planificacion&id=xxx
- [ ] Abrir URL con id carga contenido existente
- [ ] URL sin id muestra StartModal

---

## Problemas Encontrados

### Críticos (bloquean uso)

1. _(vacío - completar durante testing)_

### Importantes (afectan UX)

1. _(vacío - completar durante testing)_

### Menores (mejoras futuras)

1. _(vacío - completar durante testing)_

---

## Notas de Testing

_Probar cada funcionalidad manualmente en http://localhost:3000/admin/sandbox_

### Fecha de auditoría:

### Testeado por:
