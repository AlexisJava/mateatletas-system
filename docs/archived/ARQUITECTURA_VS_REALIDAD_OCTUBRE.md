# 🔍 ARQUITECTURA VS REALIDAD - Análisis de Discrepancias
**Fecha:** 13 de Octubre de 2025
**Propósito:** Identificar diferencias entre el diseño arquitectónico original y la implementación actual

---

## 📋 RESUMEN EJECUTIVO

**Estado General:** 🟡 Parcialmente Alineado

El proyecto ha seguido **el 70% de la arquitectura original**, pero con desviaciones significativas en:
1. Sistema de gamificación (implementación diferente)
2. Estructura de roles y autenticación
3. Tabla de logros simplificada
4. Faltan algunas tablas del diseño original

---

## ✅ LO QUE COINCIDE (Implementado correctamente)

### 1. Estructura Core de Usuarios
```
ARQUITECTURA ORIGINAL          ⟷    IMPLEMENTACIÓN ACTUAL
─────────────────────────────        ─────────────────────────────
✅ Tutor (con UUID)                  ✅ Tutor (String CUID)
✅ Estudiante                        ✅ Estudiante
✅ Docente                           ✅ Docente
✅ Admin (propuesto)                 ✅ Admin (implementado)
```

**Nota:** Los UUIDs se implementaron como CUIDs (más óptimos para Prisma)

---

### 2. Productos y Comercial
```
ARQUITECTURA ORIGINAL          ⟷    IMPLEMENTACIÓN ACTUAL
─────────────────────────────        ─────────────────────────────
✅ Producto (modelo_cobro)          ✅ Producto (tipo enum)
✅ Membresia                        ✅ Membresia
✅ InscripcionCurso                 ✅ InscripcionCurso
✅ Precio, descripción, etc.        ✅ Todos los campos implementados
```

**Adaptación:** Se usó `tipo` enum en vez de `modelo_cobro`/`modelo_servicio`

---

### 3. Sistema Académico
```
ARQUITECTURA ORIGINAL          ⟷    IMPLEMENTACIÓN ACTUAL
─────────────────────────────        ─────────────────────────────
✅ RutaCurricular                   ✅ RutaCurricular (6 rutas)
✅ Clase                            ✅ Clase
✅ InscripcionClase                 ✅ InscripcionClase
✅ Asistencia                       ✅ Asistencia (separada)
```

**Mejora:** La asistencia se separó en su propia tabla (mejor normalización)

---

### 4. Equipos
```
ARQUITECTURA ORIGINAL          ⟷    IMPLEMENTACIÓN ACTUAL
─────────────────────────────        ─────────────────────────────
✅ Equipo (nombre, color)           ✅ Equipo (4 equipos seeded)
✅ Relación estudiante-equipo       ✅ equipo_id en Estudiante
```

---

## 🔴 DISCREPANCIAS CRÍTICAS (Diferencias importantes)

### 1. Sistema de Gamificación ⚠️

**ARQUITECTURA ORIGINAL:**
```sql
❌ acciones_puntuables (tabla de configuración)
❌ logros (tabla de configuración con descripción, imagen_url, puntos_extra)
❌ puntos_obtenidos (registro transaccional con accion_id)
❌ logros_obtenidos (registro de insignias desbloqueadas)
```

**IMPLEMENTACIÓN ACTUAL:**
```sql
✅ Logro (simplificado - solo id, nombre, descripcion, icono, puntos)
❌ NO HAY: AccionPuntuable
❌ NO HAY: PuntosObtenidos
❌ NO HAY: LogroDesbloqueado
```

**IMPACTO:**
- 🔴 **No hay sistema de acciones puntuables** (los docentes no pueden otorgar puntos por acciones específicas)
- 🔴 **No hay registro transaccional de puntos**
- 🟡 La tabla Logro existe pero sin relación con Estudiante
- 🟡 Los puntos están en Estudiante.puntos_totales pero sin historial

**CONSECUENCIA:**
El sistema de gamificación del BACKEND está incompleto. La **Fase 4 del FRONTEND** funciona con datos mock porque el backend no tiene las tablas necesarias para registrar:
- Puntos ganados por acción
- Logros desbloqueados por estudiante
- Historial de gamificación

---

### 2. Auth y Supabase ⚠️

**ARQUITECTURA ORIGINAL:**
```
Decía explícitamente:
"La gestión de identidad (email y contraseña) es responsabilidad
exclusiva del sistema de autenticación de Supabase (auth.users)"

"Los campos email y contraseña_hash se eliminan de estas tablas
y se gestionan en auth.users de Supabase"
```

**IMPLEMENTACIÓN ACTUAL:**
```typescript
model Tutor {
  email String @unique          ❌ Debería estar en Supabase Auth
  password_hash String          ❌ Debería estar en Supabase Auth
}

model User {
  // No existe un modelo User genérico
  // Cada rol tiene su propia tabla
}
```

**IMPACTO:**
- 🔴 **No estamos usando Supabase Auth** como se diseñó
- 🔴 Estamos manejando contraseñas manualmente (menos seguro)
- 🟡 Cada rol tiene campos duplicados (email, password_hash)

**DECISIÓN PENDIENTE:**
¿Migramos a Supabase Auth o mantenemos el sistema custom JWT actual?

---

### 3. Estudiantes como Usuarios ⚠️

**ARQUITECTURA ORIGINAL:**
```sql
Estudiante {
  id UUID (PK - referencia a auth.users.id)
  // Los estudiantes tienen su propio login
}
```

**IMPLEMENTACIÓN ACTUAL:**
```typescript
model Estudiante {
  id String @id @default(cuid())  // ID independiente
  // NO tienen login propio
  // Portal estudiante usa MOCK MODE
}
```

**IMPACTO:**
- 🟡 Los estudiantes **NO pueden hacer login** actualmente
- 🟡 Portal estudiante funciona en MOCK MODE
- 🟡 No hay auth.users entry para estudiantes

**STATUS:**
Esto está **pendiente de decisión** - ¿Los estudiantes deben tener login propio?

---

### 4. Campos de Optimización

**ARQUITECTURA ORIGINAL:**
```sql
Estudiante {
  puntos_totales INTEGER (calculado por trigger)
  nivel_actual INTEGER (calculado por trigger)
}

Clase {
  cupos_ocupados INTEGER (actualizado por trigger)
}
```

**IMPLEMENTACIÓN ACTUAL:**
```typescript
✅ Estudiante {
  puntos_totales Int
  nivel_actual Int
}

✅ Clase {
  cupos_ocupados Int
}
```

**STATUS:** ✅ IMPLEMENTADO correctamente
Los triggers no se implementaron aún, pero los campos existen.

---

## 🟡 TABLAS FALTANTES (Del diseño original)

### Tablas Principales No Implementadas

| Tabla Original | Status | Prioridad |
|----------------|--------|-----------|
| `acciones_puntuables` | ❌ No existe | 🔴 ALTA |
| `puntos_obtenidos` | ❌ No existe | 🔴 ALTA |
| `logros_obtenidos` | ❌ No existe | 🔴 ALTA |
| `modulos` | ❌ No existe | 🟡 MEDIA |
| `lecciones` | ❌ No existe | 🟡 MEDIA |
| `juegos` | ❌ No existe | 🟢 BAJA |
| `intentos_juego` | ❌ No existe | 🟢 BAJA |
| `descuentos` | ❌ No existe | 🟡 MEDIA |
| `notificaciones` | ❌ No existe | 🟡 MEDIA |
| `tickets_soporte` | ❌ No existe | 🟢 BAJA |
| `mensajes_ticket` | ❌ No existe | 🟢 BAJA |
| `docente_especialidades` | ❌ No existe | 🟡 MEDIA |
| `alertas_estudiante` | ⚠️ Parcial (Alerta existe) | 🟡 MEDIA |

---

## 📊 TABLA DE ALINEACIÓN COMPLETA

```
┌────────────────────────────┬──────────┬────────────┐
│ Entidad                    │ Diseño   │ Realidad   │
├────────────────────────────┼──────────┼────────────┤
│ USUARIOS                   │          │            │
│ ├─ Tutor                   │    ✅    │     ✅     │
│ ├─ Estudiante              │    ✅    │     ✅     │
│ ├─ Docente                 │    ✅    │     ✅     │
│ ├─ Admin                   │    ✅    │     ✅     │
│ └─ auth.users (Supabase)   │    ✅    │     ❌     │
├────────────────────────────┼──────────┼────────────┤
│ COMERCIAL                  │          │            │
│ ├─ Producto                │    ✅    │     ✅     │
│ ├─ Membresia               │    ✅    │     ✅     │
│ ├─ InscripcionCurso        │    ✅    │     ✅     │
│ └─ Descuento               │    ✅    │     ❌     │
├────────────────────────────┼──────────┼────────────┤
│ ACADÉMICO                  │          │            │
│ ├─ RutaCurricular          │    ✅    │     ✅     │
│ ├─ Clase                   │    ✅    │     ✅     │
│ ├─ InscripcionClase        │    ✅    │     ✅     │
│ ├─ Asistencia              │    ⚠️    │     ✅     │
│ ├─ Modulo                  │    ✅    │     ❌     │
│ └─ Leccion                 │    ✅    │     ❌     │
├────────────────────────────┼──────────┼────────────┤
│ GAMIFICACIÓN               │          │            │
│ ├─ Equipo                  │    ✅    │     ✅     │
│ ├─ AccionPuntuable         │    ✅    │     ❌     │
│ ├─ Logro                   │    ✅    │     ⚠️     │
│ ├─ PuntosObtenidos         │    ✅    │     ❌     │
│ └─ LogrosObtenidos         │    ✅    │     ❌     │
├────────────────────────────┼──────────┼────────────┤
│ CONTENIDO PROPIO           │          │            │
│ ├─ Juego                   │    ✅    │     ❌     │
│ └─ IntentoJuego            │    ✅    │     ❌     │
├────────────────────────────┼──────────┼────────────┤
│ SOPORTE                    │          │            │
│ ├─ Alerta                  │    ✅    │     ⚠️     │
│ ├─ Notificacion            │    ✅    │     ❌     │
│ ├─ TicketSoporte           │    ✅    │     ❌     │
│ └─ MensajeTicket           │    ✅    │     ❌     │
└────────────────────────────┴──────────┴────────────┘

LEYENDA:
✅ = Implementado y alineado
⚠️ = Parcialmente implementado o con diferencias
❌ = No implementado
```

---

## 🎯 IMPACTO EN LAS FUNCIONALIDADES

### Funcionalidades Completas ✅
1. Login/Register de tutores
2. Gestión de estudiantes
3. Sistema de equipos
4. Catálogo de productos
5. Compra de suscripciones
6. Programación de clases
7. Reserva de clases
8. Registro de asistencia
9. Panel admin básico
10. Panel docente básico

### Funcionalidades Incompletas ⚠️
1. **Sistema de puntos por acción** (sin AccionPuntuable)
2. **Historial de puntos** (sin PuntosObtenidos)
3. **Logros desbloqueables** (sin LogrosObtenidos)
4. **Login de estudiantes** (auth pendiente)
5. **Sistema de módulos/lecciones** (cursos sin contenido interno)
6. **Sistema de juegos propios** (sin tablas)
7. **Descuentos y promociones** (sin tabla)
8. **Notificaciones automáticas** (sin tabla)
9. **Sistema de soporte** (sin tickets)
10. **Especialidades de docentes** (sin tabla relación)

### Fase 4 Frontend vs Backend
**CRÍTICO:**
El **Portal Estudiante Fase 4** muestra:
- Dashboard con puntos ✅ (lee de Estudiante.puntos_totales)
- Logros con badges 🟡 (datos mock, no hay LogrosObtenidos)
- Rankings ✅ (funciona con Estudiante.puntos_totales y Equipo)

**El problema:** Los logros mostrados en el frontend **no se pueden desbloquear** porque no hay tabla LogrosObtenidos para registrarlos.

---

## 🔧 PLAN DE ALINEACIÓN (Recomendaciones)

### Prioridad ALTA (Crítico)

#### 1. Completar Sistema de Gamificación
```sql
-- AGREGAR:
CREATE TABLE acciones_puntuables (...)
CREATE TABLE puntos_obtenidos (...)
CREATE TABLE logros_obtenidos (...)
```

**Impacto:** Permitirá que el sistema de gamificación funcione completamente.
**Tiempo estimado:** 3-4 horas
**Slice asociado:** Ninguno (debe agregarse como nuevo slice #11)

#### 2. Decidir sobre Supabase Auth
**Opciones:**
- A) Migrar a Supabase Auth (como diseño original)
- B) Mantener sistema custom y actualizar docs

**Impacto:** Define la arquitectura de seguridad a largo plazo.
**Tiempo estimado:** 8-12 horas (si se migra)

#### 3. Auth de Estudiantes
**Decisión necesaria:**
- ¿Los estudiantes deben poder hacer login?
- Si sí → implementar tabla User + auth
- Si no → documentar MOCK MODE como permanente para estudiantes

---

### Prioridad MEDIA (Importante)

#### 4. Contenido de Cursos (Módulos/Lecciones)
```sql
CREATE TABLE modulos (...)
CREATE TABLE lecciones (...)
```

**Impacto:** Permite crear cursos con contenido estructurado interno.
**Tiempo estimado:** 4-5 horas
**Slice asociado:** Nuevo slice #12

#### 5. Sistema de Descuentos
```sql
CREATE TABLE descuentos (...)
```

**Impacto:** Permitirá promociones y códigos de descuento.
**Tiempo estimado:** 2-3 horas

#### 6. Sistema de Notificaciones
```sql
CREATE TABLE notificaciones (...)
```

**Impacto:** Notificaciones automáticas a usuarios.
**Tiempo estimado:** 3-4 horas

---

### Prioridad BAJA (Nice to Have)

#### 7. Juegos Interactivos
```sql
CREATE TABLE juegos (...)
CREATE TABLE intentos_juego (...)
```

**Impacto:** Contenido gamificado propio.
**Tiempo estimado:** 6-8 horas
**Decisión:** ¿Es realmente necesario o usamos contenido externo?

#### 8. Sistema de Soporte
```sql
CREATE TABLE tickets_soporte (...)
CREATE TABLE mensajes_ticket (...)
```

**Impacto:** Support tickets dentro de la plataforma.
**Tiempo estimado:** 5-6 horas
**Alternativa:** Usar herramienta externa (Zendesk, Intercom)

#### 9. Especialidades de Docentes
```sql
CREATE TABLE docente_especialidades (...)
```

**Impacto:** Mejor matching docente-ruta curricular.
**Tiempo estimado:** 2 horas

---

## 📝 DECISIONES REQUERIDAS

### Decisión #1: Auth Strategy
**Pregunta:** ¿Migramos a Supabase Auth o mantenemos custom?
**Pros Supabase:**
- Seguridad robusta out-of-the-box
- OAuth social login fácil
- Manejo de sesiones automático

**Pros Custom:**
- Ya está funcionando
- Control total
- Sin dependencias externas

**Recomendación:** Mantener custom por ahora, migrar a Supabase en v2.0

---

### Decisión #2: Login de Estudiantes
**Pregunta:** ¿Los estudiantes deben poder hacer login?
**Pros Sí:**
- Experiencia más personalizada
- Pueden ver su progreso desde cualquier lugar
- Alineado con arquitectura original

**Pros No:**
- Simplifica la gestión (tutores gestionan todo)
- Menos problemas de seguridad infantil
- MOCK MODE permanente es aceptable

**Recomendación:** SÍ para estudiantes mayores (12+), NO para niños menores.

---

### Decisión #3: Sistema de Gamificación
**Pregunta:** ¿Implementamos las 3 tablas faltantes?
**Respuesta:** SÍ - Es crítico para que la Fase 4 funcione completamente.

**Tablas necesarias:**
1. `acciones_puntuables` - Define qué acciones dan puntos
2. `puntos_obtenidos` - Historial transaccional
3. `logros_obtenidos` - Registro de badges desbloqueados

---

## 🎯 SIGUIENTES PASOS INMEDIATOS

1. **AHORA:** Crear documento ARQUITECTURA_ALINEACION_PLAN.md con pasos específicos
2. **MAÑANA:** Implementar las 3 tablas de gamificación faltantes
3. **ESTA SEMANA:** Decidir sobre auth de estudiantes
4. **PRÓXIMA SEMANA:** Implementar módulos/lecciones

---

## 📊 SCORE DE ALINEACIÓN

```
ALINEACIÓN GLOBAL: 70%

Por Categoría:
├─ Usuarios:        85% ✅ (falta Supabase Auth)
├─ Comercial:       90% ✅ (falta Descuentos)
├─ Académico:       70% 🟡 (falta Módulos/Lecciones)
├─ Gamificación:    40% 🔴 (faltan 3 tablas críticas)
├─ Contenido:       20% 🔴 (Juegos no implementados)
└─ Soporte:         30% 🔴 (Sistema básico)
```

---

## 💡 CONCLUSIÓN

El proyecto **ha seguido la arquitectura original en su mayoría**, pero con **adaptaciones pragmáticas** que permitieron avanzar más rápido:

**LO BUENO:**
✅ Core de usuarios implementado
✅ Sistema comercial funcionando
✅ Clases y reservas operativas
✅ 70% de alineación general

**LO CRÍTICO:**
🔴 Sistema de gamificación incompleto (faltan 3 tablas)
🔴 Supabase Auth no implementado
🟡 Auth de estudiantes pendiente

**RECOMENDACIÓN:**
Implementar las **3 tablas de gamificación** ASAP para que la Fase 4 funcione con datos reales en vez de mocks.

---

**Documento creado por:** Claude Code
**Fecha:** 13 de Octubre de 2025
**Próximo paso:** Crear plan de implementación de tablas faltantes
