# REFACTOR: Productos, Suscripciones y Modelo de Negocio 2026

> **FUENTE DE VERDAD** - Este documento define exhaustivamente el refactor del sistema de productos, suscripciones y pagos de Mateatletas para el ciclo 2026.

**Fecha de creación**: 2026-01-17
**Rama**: `refactor/productos-suscripciones-2026`
**Estado**: En desarrollo

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Modelo de Negocio Actual vs Nuevo](#2-modelo-de-negocio-actual-vs-nuevo)
3. [Sistema de Casas y Mundos](#3-sistema-de-casas-y-mundos)
4. [Catálogo de Productos](#4-catálogo-de-productos)
5. [Sistema de Precios y Tiers](#5-sistema-de-precios-y-tiers)
6. [Suscripciones Familiares](#6-suscripciones-familiares)
7. [Cursos Temporales (Comisiones)](#7-cursos-temporales-comisiones)
8. [Cambios en Schema Prisma](#8-cambios-en-schema-prisma)
9. [Flujos de Usuario](#9-flujos-de-usuario)
10. [Endpoints de API](#10-endpoints-de-api)
11. [Vistas de UI](#11-vistas-de-ui)
12. [Casos de Borde](#12-casos-de-borde)
13. [Plan de Migración](#13-plan-de-migración)
14. [Checklist de Implementación](#14-checklist-de-implementación)

---

## 1. RESUMEN EJECUTIVO

### Problema Actual

El sistema actual tiene las siguientes deficiencias:

1. **Producto no se relaciona con ClaseGrupo** - Solo se relaciona con Comision
2. **No existe TipoProducto.Club** - El enum solo tiene tipos de cursos temporales
3. **Suscripciones individuales** - Cada actividad genera un PreApproval separado en MercadoPago
4. **Flujo de asignación roto** - No hay endpoint para crear `AsignacionPlanificacion`
5. **UI desconectada** - El Sandbox crea planificaciones pero no hay forma de listarlas/asignarlas

### Solución Propuesta

1. **Un PreApproval por familia** - Suma total de todas las actividades de todos los hijos
2. **Producto unificado** - Relaciona tanto ClaseGrupo (Club) como Comision (Cursos)
3. **Tiers determinan el precio** - STEAM_LIBROS, STEAM_ASINCRONICO, STEAM_SINCRONICO
4. **Descuento familiar automático** - 10% en la 2da actividad en adelante
5. **Landing pages por Mundo** - Filtrado automático por edad/casa del estudiante

---

## 2. MODELO DE NEGOCIO ACTUAL VS NUEVO

### Modelo Actual (Problemático)

```
Tutor
  └── Estudiante(s)
        └── Suscripcion (1 por actividad) ❌ Genera múltiples PreApprovals
              └── Plan (STEAM_LIBROS | STEAM_ASINCRONICO | STEAM_SINCRONICO)
```

### Modelo Nuevo (Propuesto)

```
Tutor
  └── SuscripcionFamiliar (1 por familia) ✅ Un solo PreApproval
        └── InscripcionActividad[] (1 por estudiante+producto)
              ├── Estudiante
              ├── Producto
              ├── ClaseGrupo (si es Club)
              └── Comision (si es Curso temporal)
```

---

## 3. SISTEMA DE CASAS Y MUNDOS

### 3.1 Casas (por Edad)

| Casa    | Rango de Edad | Descripción               |
| ------- | ------------- | ------------------------- |
| QUANTUM | 6-9 años      | Primeros pasos en STEAM   |
| VERTEX  | 10-12 años    | Desarrollo de habilidades |
| PULSAR  | 13-17 años    | Preparación avanzada      |

### 3.2 Mundos (Disciplinas)

| Mundo        | Descripción                              |
| ------------ | ---------------------------------------- |
| MATEMATICA   | Matemática general y olimpiadas          |
| PROGRAMACION | Programación y pensamiento computacional |
| CIENCIAS     | Ciencias naturales y experimentales      |

### 3.3 Subtipos de Mundo Matemática

Solo aplica a VERTEX y PULSAR:

| Subtipo  | Descripción                             | Aplica a       |
| -------- | --------------------------------------- | -------------- |
| GENERAL  | Matemática curricular estándar          | Todos          |
| OLIMPICA | Preparación para Olimpiadas Matemáticas | VERTEX, PULSAR |

### 3.4 Niveles de Olimpiadas Matemáticas

#### VERTEX (10-12 años) - Ñandú

| Nivel    | Edad Exacta | Descripción   |
| -------- | ----------- | ------------- |
| NANDU_N1 | 10 años     | Ñandú Nivel 1 |
| NANDU_N2 | 11-12 años  | Ñandú Nivel 2 |

#### PULSAR (13-17 años) - OMA

| Nivel  | Edad Exacta | Descripción |
| ------ | ----------- | ----------- |
| OMA_N1 | 13 años     | OMA Nivel 1 |
| OMA_N2 | 14-15 años  | OMA Nivel 2 |
| OMA_N3 | 16-17 años  | OMA Nivel 3 |

### 3.5 Excepciones por Altas Capacidades

- El sistema permite excepciones para estudiantes con altas capacidades
- Un estudiante de 12 años podría inscribirse en OMA_N1 si demuestra nivel
- Campo `permite_excepciones` en Producto controla esto
- Requiere aprobación manual del Admin

---

## 4. CATÁLOGO DE PRODUCTOS

### 4.1 Tipos de Producto

| Tipo       | Descripción                        | Modelo de Pago      |
| ---------- | ---------------------------------- | ------------------- |
| CLUB       | Actividad recurrente todo el año   | Suscripción mensual |
| CURSO      | Curso temporal con inicio y fin    | Pago único / cuotas |
| COLONIA    | Colonia de verano (enero-febrero)  | Pago único / cuotas |
| TALLER     | Taller intensivo de corta duración | Pago único          |
| CAMPAMENTO | Evento presencial especial         | Pago único          |

### 4.2 Estructura de Producto

```typescript
interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoProducto; // CLUB | CURSO | COLONIA | TALLER | CAMPAMENTO

  // Segmentación
  mundo: Mundo; // MATEMATICA | PROGRAMACION | CIENCIAS
  subtipo_mundo?: SubtipoMundo; // GENERAL | OLIMPICA (solo para Matemática)
  casa: Casa; // QUANTUM | VERTEX | PULSAR
  nivel_olimpiada?: NivelOlimpiada; // NANDU_N1, OMA_N1, etc.

  // Restricciones de edad
  edad_minima: number;
  edad_maxima: number;
  permite_excepciones: boolean; // Para altas capacidades

  // Pricing (solo para cursos temporales)
  precio_contado?: number; // Precio si paga de una
  precio_cuotas?: number; // Precio total en cuotas (inflado)
  cantidad_cuotas?: number; // Número de cuotas

  // Relaciones
  claseGrupos: ClaseGrupo[]; // Horarios de Club
  comisiones: Comision[]; // Instancias de cursos temporales

  // Metadata
  activo: boolean;
  visible_en_landing: boolean;
  orden_display: number;
}
```

### 4.3 Ejemplos de Productos

#### Club Matemática Olímpica - Ñandú N1 (VERTEX)

```json
{
  "nombre": "Club Matemática Olímpica - Ñandú N1",
  "tipo": "CLUB",
  "mundo": "MATEMATICA",
  "subtipo_mundo": "OLIMPICA",
  "casa": "VERTEX",
  "nivel_olimpiada": "NANDU_N1",
  "edad_minima": 10,
  "edad_maxima": 10,
  "permite_excepciones": true,
  "claseGrupos": [
    { "dia": "LUNES", "hora": "17:00", "docente": "..." },
    { "dia": "MIERCOLES", "hora": "18:00", "docente": "..." }
  ]
}
```

#### Curso de Verano Programación (QUANTUM)

```json
{
  "nombre": "Programación de Videojuegos - Verano 2026",
  "tipo": "COLONIA",
  "mundo": "PROGRAMACION",
  "casa": "QUANTUM",
  "edad_minima": 6,
  "edad_maxima": 9,
  "precio_contado": 75000,
  "precio_cuotas": 90000,
  "cantidad_cuotas": 3,
  "comisiones": [{ "inicio": "2026-01-06", "fin": "2026-01-31", "horario": "..." }]
}
```

---

## 5. SISTEMA DE PRECIOS Y TIERS

### 5.1 Tiers STEAM (Solo para Club)

Los precios de Club NO se definen en el Producto, sino por el Tier que elige el tutor:

| Tier              | Precio Mensual | Incluye                              |
| ----------------- | -------------- | ------------------------------------ |
| STEAM_LIBROS      | $40.000        | Microlecciones + Juegos (sin clases) |
| STEAM_ASINCRONICO | $65.000        | Todo + Clases grabadas               |
| STEAM_SINCRONICO  | $95.000        | Todo + Clases en vivo con docente    |

**IMPORTANTE**: El Tier se elige a nivel de familia, no por actividad. Todos los estudiantes de la familia tienen el mismo Tier.

### 5.2 Descuento Familiar

- **10% de descuento** en la 2da actividad en adelante
- Se aplica sobre el precio del Tier, no sobre el total
- Ejemplo con STEAM_SINCRONICO ($95.000):
  - 1 actividad: $95.000
  - 2 actividades: $95.000 + $85.500 = $180.500
  - 3 actividades: $95.000 + $85.500 + $85.500 = $266.000

### 5.3 Precios de Cursos Temporales

Los cursos temporales tienen precio propio, independiente del Tier:

```typescript
// Estrategia de precios
precio_contado = precio_real; // Precio "real"
precio_cuotas = precio_real * 1.2; // 20% más por financiación
descuento_contado = ((precio_cuotas - precio_contado) / precio_cuotas) * 100;
// → Siempre mostrar "20% OFF pagando de contado"
```

### 5.4 Cálculo de Monto Total Mensual

```typescript
function calcularMontoMensual(
  inscripciones: InscripcionActividad[],
  tier: PlanSuscripcion,
): number {
  const precioTier = TIERS_STEAM[tier]; // 40000 | 65000 | 95000

  // Filtrar solo inscripciones de tipo CLUB activas
  const actividadesClub = inscripciones.filter(
    (i) => i.producto.tipo === 'CLUB' && i.estado === 'ACTIVA',
  );

  if (actividadesClub.length === 0) return 0;

  // Primera actividad: precio completo
  let total = precioTier;

  // 2da en adelante: 10% descuento
  for (let i = 1; i < actividadesClub.length; i++) {
    total += precioTier * 0.9;
  }

  return total;
}
```

---

## 6. SUSCRIPCIONES FAMILIARES

### 6.1 Modelo de Datos

```typescript
interface SuscripcionFamiliar {
  id: string;
  tutor_id: string;

  // MercadoPago PreApproval
  preapproval_id: string; // ID de MercadoPago
  preapproval_plan_id?: string; // Plan de MP (si usamos plans)

  // Estado
  estado: EstadoSuscripcion; // PENDING | AUTHORIZED | PAUSED | CANCELLED

  // Facturación
  tier: PlanSuscripcion; // STEAM_LIBROS | STEAM_ASINCRONICO | STEAM_SINCRONICO
  monto_mensual: number; // Calculado automáticamente
  fecha_proximo_cobro: Date;

  // Historial
  inscripciones: InscripcionActividad[];
  historial_cambios: CambioInscripcion[];
}

interface InscripcionActividad {
  id: string;
  suscripcion_familiar_id: string;
  estudiante_id: string;
  producto_id: string;

  // Asignación específica
  clase_grupo_id?: string; // Para Club
  comision_id?: string; // Para cursos temporales

  // Estado
  estado: EstadoInscripcion; // ACTIVA | PAUSADA | CANCELADA
  fecha_inicio: Date;
  fecha_fin?: Date; // Para cursos temporales

  // Metadata
  created_at: Date;
  updated_at: Date;
}

interface CambioInscripcion {
  id: string;
  suscripcion_familiar_id: string;
  tipo: TipoCambio; // ALTA | BAJA | CAMBIO_HORARIO | CAMBIO_PRODUCTO

  // Detalle del cambio
  inscripcion_anterior_id?: string;
  inscripcion_nueva_id?: string;

  // Cuándo aplica
  solicitado_en: Date;
  aplica_desde: Date; // Siempre el 1ro del mes siguiente

  // Montos
  monto_anterior: number;
  monto_nuevo: number;
}
```

### 6.2 Ciclo de Vida de Suscripción

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE SUSCRIPCIÓN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CREACIÓN                                                    │
│     Tutor selecciona productos → Se crea PreApproval en MP      │
│     Estado: PENDING                                             │
│                                                                 │
│  2. AUTORIZACIÓN                                                │
│     MP confirma pago → Webhook actualiza estado                 │
│     Estado: AUTHORIZED                                          │
│     → Estudiantes obtienen acceso inmediato                     │
│                                                                 │
│  3. MODIFICACIÓN                                                │
│     Tutor agrega/quita actividades                              │
│     → Se crea CambioInscripcion                                 │
│     → Se recalcula monto_mensual                                │
│     → Se actualiza PreApproval en MP                            │
│     → Cambio aplica desde el 1ro del mes siguiente              │
│                                                                 │
│  4. RENOVACIÓN MENSUAL                                          │
│     MP cobra automáticamente                                    │
│     → Webhook confirma pago                                     │
│     → Si falla, se reintenta 3 veces                            │
│     → Si sigue fallando, Estado: PAUSED                         │
│                                                                 │
│  5. CANCELACIÓN                                                 │
│     Tutor cancela suscripción                                   │
│     → Acceso continúa hasta fin de mes pagado                   │
│     → Estado: CANCELLED                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Reglas de Negocio

1. **Un solo PreApproval por familia**
   - Aunque tenga 5 hijos con 3 actividades cada uno, un solo cobro mensual

2. **Cambios aplican el mes siguiente**
   - Si hoy es 15 de enero y agrego una actividad, se cobra desde febrero
   - Si hoy es 15 de enero y quito una actividad, acceso hasta 31 de enero

3. **No hay prorrateo**
   - No se cobra proporcional por los días restantes del mes
   - Simplifica la lógica y evita confusiones

4. **Cancelación = pérdida de acceso a fin de mes**
   - Si cancela el 5 de marzo, acceso hasta el 31 de marzo
   - No hay reembolsos

5. **Cambio de Tier afecta a todos**
   - Si sube de LIBROS a SINCRONICO, todos los estudiantes suben
   - Se recalcula el monto con el nuevo tier

---

## 7. CURSOS TEMPORALES (COMISIONES)

### 7.1 Diferencias con Club

| Aspecto            | Club                  | Curso Temporal             |
| ------------------ | --------------------- | -------------------------- |
| Duración           | Todo el año           | Fecha inicio → fecha fin   |
| Pago               | Suscripción mensual   | Pago único / cuotas        |
| Precio             | Determinado por Tier  | Precio propio del producto |
| Descuento familiar | 10% en 2da+ actividad | No aplica                  |
| Renovación         | Automática            | No (termina y listo)       |

### 7.2 Flujo de Pago de Curso Temporal

```
┌─────────────────────────────────────────────────────────────────┐
│                 PAGO DE CURSO TEMPORAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OPCIÓN A: Pago de Contado                                      │
│  ─────────────────────────────                                  │
│  1. Tutor selecciona "Pagar de contado"                         │
│  2. Se muestra precio_contado con badge "20% OFF"               │
│  3. Checkout de MercadoPago (pago único)                        │
│  4. Acceso inmediato al confirmar pago                          │
│                                                                 │
│  OPCIÓN B: Pago en Cuotas                                       │
│  ─────────────────────────────                                  │
│  1. Tutor selecciona "Pagar en cuotas"                          │
│  2. Se muestra precio_cuotas dividido en N cuotas               │
│  3. Primera cuota: Checkout inmediato                           │
│  4. Siguientes cuotas: Cobro automático mensual                 │
│  5. Acceso inmediato al confirmar primera cuota                 │
│                                                                 │
│  NOTA: Las cuotas se manejan con un PreApproval separado        │
│        del PreApproval de la SuscripcionFamiliar                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Modelo de Datos para Cursos

```typescript
interface PagoCurso {
  id: string;
  tutor_id: string;
  estudiante_id: string;
  comision_id: string;

  // Tipo de pago
  modalidad: 'CONTADO' | 'CUOTAS';

  // Montos
  monto_total: number;
  monto_por_cuota?: number;
  cantidad_cuotas?: number;
  cuotas_pagadas: number;

  // MercadoPago
  payment_id?: string; // Para pago contado
  preapproval_id?: string; // Para cuotas

  // Estado
  estado: EstadoPago; // PENDING | PAID | PARTIAL | FAILED | REFUNDED

  // Fechas
  fecha_pago: Date;
  fecha_proximo_cobro?: Date; // Para cuotas
}
```

---

## 8. CAMBIOS EN SCHEMA PRISMA

### 8.1 Nuevos Enums

```prisma
enum TipoProducto {
  CLUB          // Nuevo - Actividad recurrente
  CURSO
  COLONIA
  TALLER
  CAMPAMENTO
}

enum SubtipoMundo {
  GENERAL
  OLIMPICA
}

enum NivelOlimpiada {
  // Ñandú (VERTEX)
  NANDU_N1
  NANDU_N2
  // OMA (PULSAR)
  OMA_N1
  OMA_N2
  OMA_N3
}

enum EstadoSuscripcionFamiliar {
  PENDING
  AUTHORIZED
  PAUSED
  CANCELLED
}

enum EstadoInscripcion {
  ACTIVA
  PAUSADA
  CANCELADA
}

enum TipoCambioInscripcion {
  ALTA
  BAJA
  CAMBIO_HORARIO
  CAMBIO_PRODUCTO
  CAMBIO_TIER
}

enum ModalidadPago {
  CONTADO
  CUOTAS
}

enum EstadoPagoCurso {
  PENDING
  PAID
  PARTIAL
  FAILED
  REFUNDED
}
```

### 8.2 Modelo Producto (Modificado)

```prisma
model Producto {
  id                    String          @id @default(uuid())
  nombre                String
  descripcion           String?
  tipo                  TipoProducto    // CLUB | CURSO | COLONIA | etc.

  // Segmentación (NUEVOS CAMPOS)
  mundo                 Mundo
  subtipo_mundo         SubtipoMundo?   // Solo para MATEMATICA
  casa                  Casa
  nivel_olimpiada       NivelOlimpiada? // Solo para OLIMPICA

  // Restricciones de edad (NUEVOS CAMPOS)
  edad_minima           Int
  edad_maxima           Int
  permite_excepciones   Boolean         @default(false)

  // Pricing para cursos temporales (NUEVOS CAMPOS)
  precio_contado        Int?
  precio_cuotas         Int?
  cantidad_cuotas       Int?

  // Relaciones
  comisiones            Comision[]
  claseGrupos           ClaseGrupo[]    // NUEVA RELACIÓN
  inscripciones         InscripcionActividad[]

  // Metadata
  activo                Boolean         @default(true)
  visible_en_landing    Boolean         @default(true)
  orden_display         Int             @default(0)

  created_at            DateTime        @default(now())
  updated_at            DateTime        @updatedAt

  @@index([tipo, mundo, casa])
  @@index([activo, visible_en_landing])
}
```

### 8.3 Modelo ClaseGrupo (Modificado)

```prisma
model ClaseGrupo {
  id              String    @id @default(uuid())

  // NUEVA RELACIÓN con Producto
  producto_id     String
  producto        Producto  @relation(fields: [producto_id], references: [id])

  // Horario
  dia_semana      DiaSemana
  hora_inicio     String    // "17:00"
  hora_fin        String    // "18:30"

  // Docente asignado
  docente_id      String?
  docente         Docente?  @relation(fields: [docente_id], references: [id])

  // Casa/Mundo (heredados de Producto, pero pueden ser específicos)
  casa_tipo       Casa?
  mundo_tipo      Mundo?

  // Capacidad
  cupo_maximo     Int       @default(30)

  // Relaciones
  estudiantes     EstudianteClaseGrupo[]
  inscripciones   InscripcionActividad[]
  asignaciones    AsignacionPlanificacion[]

  // Estado
  activo          Boolean   @default(true)

  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  @@index([producto_id])
  @@index([docente_id])
  @@index([dia_semana, hora_inicio])
}
```

### 8.4 Nuevos Modelos

```prisma
model SuscripcionFamiliar {
  id                    String                      @id @default(uuid())
  tutor_id              String                      @unique
  tutor                 Tutor                       @relation(fields: [tutor_id], references: [id])

  // MercadoPago
  preapproval_id        String?                     @unique
  preapproval_plan_id   String?

  // Estado
  estado                EstadoSuscripcionFamiliar   @default(PENDING)

  // Facturación
  tier                  PlanSuscripcion             @default(STEAM_LIBROS)
  monto_mensual         Int                         @default(0)
  fecha_proximo_cobro   DateTime?

  // Relaciones
  inscripciones         InscripcionActividad[]
  historial_cambios     CambioInscripcion[]

  created_at            DateTime                    @default(now())
  updated_at            DateTime                    @updatedAt

  @@index([estado])
  @@index([fecha_proximo_cobro])
}

model InscripcionActividad {
  id                        String                  @id @default(uuid())

  // Relaciones principales
  suscripcion_familiar_id   String
  suscripcion_familiar      SuscripcionFamiliar     @relation(fields: [suscripcion_familiar_id], references: [id])

  estudiante_id             String
  estudiante                Estudiante              @relation(fields: [estudiante_id], references: [id])

  producto_id               String
  producto                  Producto                @relation(fields: [producto_id], references: [id])

  // Asignación específica (uno u otro)
  clase_grupo_id            String?
  clase_grupo               ClaseGrupo?             @relation(fields: [clase_grupo_id], references: [id])

  comision_id               String?
  comision                  Comision?               @relation(fields: [comision_id], references: [id])

  // Estado
  estado                    EstadoInscripcion       @default(ACTIVA)
  fecha_inicio              DateTime                @default(now())
  fecha_fin                 DateTime?

  // Metadata
  created_at                DateTime                @default(now())
  updated_at                DateTime                @updatedAt

  @@unique([estudiante_id, producto_id, clase_grupo_id])
  @@unique([estudiante_id, comision_id])
  @@index([suscripcion_familiar_id])
  @@index([estado])
}

model CambioInscripcion {
  id                        String                  @id @default(uuid())

  suscripcion_familiar_id   String
  suscripcion_familiar      SuscripcionFamiliar     @relation(fields: [suscripcion_familiar_id], references: [id])

  tipo                      TipoCambioInscripcion

  // Referencias a inscripciones (para CAMBIO_HORARIO, CAMBIO_PRODUCTO)
  inscripcion_anterior_id   String?
  inscripcion_nueva_id      String?

  // Cuándo aplica
  solicitado_en             DateTime                @default(now())
  aplica_desde              DateTime                // Siempre el 1ro del mes siguiente
  procesado                 Boolean                 @default(false)

  // Montos para registro histórico
  monto_anterior            Int
  monto_nuevo               Int

  // Detalle (JSON para flexibilidad)
  detalle                   Json?

  created_at                DateTime                @default(now())

  @@index([suscripcion_familiar_id])
  @@index([aplica_desde, procesado])
}

model PagoCurso {
  id                  String            @id @default(uuid())

  tutor_id            String
  tutor               Tutor             @relation(fields: [tutor_id], references: [id])

  estudiante_id       String
  estudiante          Estudiante        @relation(fields: [estudiante_id], references: [id])

  comision_id         String
  comision            Comision          @relation(fields: [comision_id], references: [id])

  // Modalidad
  modalidad           ModalidadPago

  // Montos
  monto_total         Int
  monto_por_cuota     Int?
  cantidad_cuotas     Int?
  cuotas_pagadas      Int               @default(0)

  // MercadoPago
  payment_id          String?           // Pago único
  preapproval_id      String?           // Cuotas

  // Estado
  estado              EstadoPagoCurso   @default(PENDING)

  // Fechas
  fecha_pago          DateTime?
  fecha_proximo_cobro DateTime?

  created_at          DateTime          @default(now())
  updated_at          DateTime          @updatedAt

  @@unique([estudiante_id, comision_id])
  @@index([tutor_id])
  @@index([estado])
}
```

### 8.5 Modificaciones a Modelos Existentes

```prisma
// Agregar a Tutor
model Tutor {
  // ... campos existentes ...

  suscripcion_familiar    SuscripcionFamiliar?
  pagos_cursos            PagoCurso[]
}

// Agregar a Estudiante
model Estudiante {
  // ... campos existentes ...

  inscripciones           InscripcionActividad[]
  pagos_cursos            PagoCurso[]
}

// Agregar a Comision
model Comision {
  // ... campos existentes ...

  inscripciones           InscripcionActividad[]
  pagos                   PagoCurso[]
}
```

---

## 9. FLUJOS DE USUARIO

### 9.1 Flujo: Admin Configura Catálogo

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN: CONFIGURACIÓN DE CATÁLOGO                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Admin va a /admin/productos                                 │
│                                                                 │
│  2. Crea nuevo Producto:                                        │
│     - Nombre: "Club Matemática Olímpica - Ñandú N1"             │
│     - Tipo: CLUB                                                │
│     - Mundo: MATEMATICA                                         │
│     - Subtipo: OLIMPICA                                         │
│     - Casa: VERTEX                                              │
│     - Nivel: NANDU_N1                                           │
│     - Edad: 10-10 años                                          │
│     - Permite excepciones: Sí                                   │
│                                                                 │
│  3. Crea ClaseGrupos para el Producto:                          │
│     - Grupo A: Lunes 17:00, Docente: Prof. García               │
│     - Grupo B: Miércoles 18:00, Docente: Prof. López            │
│     - Grupo C: Viernes 16:00, Docente: Prof. Martínez           │
│                                                                 │
│  4. Asigna Planificación a cada ClaseGrupo                      │
│     (Las planificaciones se crean en /admin/sandbox)            │
│                                                                 │
│  5. Marca Producto como visible_en_landing = true               │
│                                                                 │
│  ✅ Producto listo para inscripciones                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Flujo: Tutor Inscribe a Estudiante (Primera vez)

```
┌─────────────────────────────────────────────────────────────────┐
│  TUTOR: PRIMERA INSCRIPCIÓN                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Tutor entra a Landing Page de Mateatletas                   │
│     → /mundo/matematica/olimpica                                │
│                                                                 │
│  2. Ve productos filtrados por:                                 │
│     - Mundo: Matemática Olímpica                                │
│     - Casa del estudiante (calculada por edad)                  │
│     - Nivel compatible (calculado por edad exacta)              │
│                                                                 │
│  3. Selecciona producto: "Club Matemática Olímpica - Ñandú N1"  │
│                                                                 │
│  4. Ve horarios disponibles (ClaseGrupos con cupo):             │
│     ┌─────────────────────────────────────────────┐             │
│     │ ○ Lunes 17:00 - Prof. García (12/30)        │             │
│     │ ● Miércoles 18:00 - Prof. López (5/30)      │ ← Selecciona│
│     │ ○ Viernes 16:00 - Prof. Martínez (28/30)    │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  5. Selecciona Tier:                                            │
│     ┌─────────────────────────────────────────────┐             │
│     │ ○ STEAM Libros - $40.000/mes                │             │
│     │   Solo microlecciones y juegos              │             │
│     │                                             │             │
│     │ ○ STEAM Asincrónico - $65.000/mes           │             │
│     │   + Clases grabadas                         │             │
│     │                                             │             │
│     │ ● STEAM Sincrónico - $95.000/mes            │ ← Selecciona│
│     │   + Clases en vivo con docente              │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  6. Resumen:                                                    │
│     ┌─────────────────────────────────────────────┐             │
│     │ Estudiante: Juan Pérez (10 años)            │             │
│     │ Producto: Club Matemática Olímpica          │             │
│     │ Horario: Miércoles 18:00                    │             │
│     │ Tier: STEAM Sincrónico                      │             │
│     │                                             │             │
│     │ Total mensual: $95.000                      │             │
│     │                                             │             │
│     │ [Confirmar y Pagar]                         │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  7. Redirect a MercadoPago PreApproval                          │
│     → Autoriza suscripción mensual                              │
│                                                                 │
│  8. Webhook confirma → Estado: AUTHORIZED                       │
│     → Juan tiene acceso inmediato                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Flujo: Tutor Agrega Segunda Actividad

```
┌─────────────────────────────────────────────────────────────────┐
│  TUTOR: AGREGAR SEGUNDA ACTIVIDAD                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Tutor va a /tutor/suscripcion                               │
│                                                                 │
│  2. Ve su suscripción actual:                                   │
│     ┌─────────────────────────────────────────────┐             │
│     │ Suscripción Familiar                        │             │
│     │ Tier: STEAM Sincrónico                      │             │
│     │ Total mensual: $95.000                      │             │
│     │                                             │             │
│     │ Actividades:                                │             │
│     │ • Juan - Matemática Olímpica (Mié 18:00)    │             │
│     │                                             │             │
│     │ [+ Agregar actividad]                       │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  3. Click en "Agregar actividad"                                │
│     → Selecciona estudiante (Juan u otro hijo)                  │
│     → Ve productos compatibles con ese estudiante               │
│                                                                 │
│  4. Selecciona: "Club Programación - Python Básico"             │
│     → Elige horario: Jueves 17:00                               │
│                                                                 │
│  5. Preview del cambio:                                         │
│     ┌─────────────────────────────────────────────┐             │
│     │ Resumen de cambios                          │             │
│     │                                             │             │
│     │ Actividades actuales: 1                     │             │
│     │ Actividades nuevas: 2                       │             │
│     │                                             │             │
│     │ Monto actual: $95.000                       │             │
│     │ Monto nuevo: $180.500                       │             │
│     │   → 1ra actividad: $95.000                  │             │
│     │   → 2da actividad: $85.500 (10% desc.)      │             │
│     │                                             │             │
│     │ ⓘ El cambio aplica desde el 1/Feb          │             │
│     │                                             │             │
│     │ [Confirmar cambio]                          │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  6. Sistema:                                                    │
│     → Crea InscripcionActividad con fecha_inicio = 1/Feb        │
│     → Crea CambioInscripcion con aplica_desde = 1/Feb           │
│     → Actualiza monto en PreApproval de MP (para febrero)       │
│                                                                 │
│  7. Juan puede acceder a la nueva actividad desde el 1/Feb      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 Flujo: Tutor Cambia Horario

```
┌─────────────────────────────────────────────────────────────────┐
│  TUTOR: CAMBIO DE HORARIO                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. En /tutor/suscripcion, click en actividad de Juan           │
│                                                                 │
│  2. Ve opciones:                                                │
│     ┌─────────────────────────────────────────────┐             │
│     │ Juan - Matemática Olímpica                  │             │
│     │ Horario actual: Miércoles 18:00             │             │
│     │                                             │             │
│     │ [Cambiar horario]  [Cambiar producto]       │             │
│     │ [Dar de baja]                               │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  3. Click "Cambiar horario"                                     │
│     → Ve otros horarios del MISMO producto:                     │
│     ┌─────────────────────────────────────────────┐             │
│     │ Horarios disponibles:                       │             │
│     │ ○ Lunes 17:00 - Prof. García (12/30)        │             │
│     │ ● Viernes 16:00 - Prof. Martínez (20/30)    │ ← Selecciona│
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  4. Confirma cambio                                             │
│     → El cambio aplica desde el 1/Feb                           │
│     → NO cambia el monto (mismo producto, mismo tier)           │
│     → Juan asiste a Mié hasta fin de enero, Vie desde febrero   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.5 Flujo: Tutor Cambia de Producto

```
┌─────────────────────────────────────────────────────────────────┐
│  TUTOR: CAMBIO DE PRODUCTO                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Click "Cambiar producto" en la actividad                    │
│                                                                 │
│  2. Ve productos compatibles:                                   │
│     - Misma Casa (VERTEX)                                       │
│     - Edad compatible                                           │
│     - Excluye producto actual                                   │
│                                                                 │
│     ┌─────────────────────────────────────────────┐             │
│     │ Productos compatibles con Juan (10 años):   │             │
│     │                                             │             │
│     │ ○ Club Matemática General (no olímpica)     │             │
│     │ ○ Club Programación - Scratch              │             │
│     │ ● Club Ciencias - Experimentos              │ ← Selecciona│
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  3. Elige horario del nuevo producto                            │
│                                                                 │
│  4. Confirma:                                                   │
│     → El monto NO cambia (sigue siendo 1 actividad)             │
│     → El progreso en Matemática Olímpica se mantiene            │
│       (vinculado a la Planificación anterior)                   │
│     → Cambio aplica desde el 1/Feb                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.6 Flujo: Tutor Da de Baja Actividad

```
┌─────────────────────────────────────────────────────────────────┐
│  TUTOR: BAJA DE ACTIVIDAD                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Click "Dar de baja" en la actividad                         │
│                                                                 │
│  2. Confirmación:                                               │
│     ┌─────────────────────────────────────────────┐             │
│     │ ⚠️ ¿Estás seguro?                           │             │
│     │                                             │             │
│     │ Juan perderá acceso a Matemática Olímpica   │             │
│     │ a partir del 1 de Febrero.                  │             │
│     │                                             │             │
│     │ Puede seguir asistiendo hasta el 31/Ene.    │             │
│     │                                             │             │
│     │ Monto actual: $95.000                       │             │
│     │ Monto nuevo: $0                             │             │
│     │                                             │             │
│     │ [Cancelar]  [Confirmar baja]                │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  3. Si confirma:                                                │
│     → InscripcionActividad.estado = CANCELADA                   │
│     → InscripcionActividad.fecha_fin = 31/Ene                   │
│     → Se crea CambioInscripcion tipo BAJA                       │
│     → Se actualiza PreApproval en MP (monto = 0)                │
│                                                                 │
│  NOTA: Si era la única actividad, el PreApproval se cancela     │
│        y la SuscripcionFamiliar queda CANCELLED                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.7 Flujo: Tutor Cancela Suscripción Completa

```
┌─────────────────────────────────────────────────────────────────┐
│  TUTOR: CANCELACIÓN TOTAL                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. En /tutor/suscripcion, click "Cancelar suscripción"         │
│                                                                 │
│  2. Confirmación con warning fuerte:                            │
│     ┌─────────────────────────────────────────────┐             │
│     │ ⚠️ CANCELAR SUSCRIPCIÓN                     │             │
│     │                                             │             │
│     │ Esto cancelará TODAS las actividades:       │             │
│     │ • Juan - Matemática Olímpica                │             │
│     │ • Juan - Programación Python                │             │
│     │                                             │             │
│     │ Tus hijos perderán acceso el 31/Ene.        │             │
│     │ No hay reembolsos por el mes en curso.      │             │
│     │                                             │             │
│     │ [Volver]  [Cancelar todo]                   │             │
│     └─────────────────────────────────────────────┘             │
│                                                                 │
│  3. Si confirma:                                                │
│     → Todas las InscripcionActividad.estado = CANCELADA         │
│     → SuscripcionFamiliar.estado = CANCELLED                    │
│     → Se cancela PreApproval en MercadoPago                     │
│     → Acceso hasta fin de mes                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. ENDPOINTS DE API

### 10.1 Productos (Admin)

```typescript
// GET /api/admin/productos
// Lista todos los productos con filtros
interface ListProductosQuery {
  tipo?: TipoProducto;
  mundo?: Mundo;
  casa?: Casa;
  activo?: boolean;
  page?: number;
  limit?: number;
}

// GET /api/admin/productos/:id
// Detalle de producto con claseGrupos y comisiones

// POST /api/admin/productos
// Crear nuevo producto
interface CreateProductoDto {
  nombre: string;
  descripcion?: string;
  tipo: TipoProducto;
  mundo: Mundo;
  subtipo_mundo?: SubtipoMundo;
  casa: Casa;
  nivel_olimpiada?: NivelOlimpiada;
  edad_minima: number;
  edad_maxima: number;
  permite_excepciones?: boolean;
  precio_contado?: number;
  precio_cuotas?: number;
  cantidad_cuotas?: number;
}

// PUT /api/admin/productos/:id
// Actualizar producto

// DELETE /api/admin/productos/:id
// Soft delete (activo = false)

// POST /api/admin/productos/:id/clase-grupos
// Crear ClaseGrupo para un Producto
interface CreateClaseGrupoDto {
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  docente_id?: string;
  cupo_maximo?: number;
}
```

### 10.2 Suscripciones (Tutor)

```typescript
// GET /api/tutor/suscripcion
// Obtiene la suscripción familiar del tutor autenticado
interface SuscripcionFamiliarResponse {
  id: string;
  estado: EstadoSuscripcionFamiliar;
  tier: PlanSuscripcion;
  monto_mensual: number;
  fecha_proximo_cobro: Date;
  inscripciones: InscripcionActividadResponse[];
}

// POST /api/tutor/suscripcion
// Crea la suscripción familiar (primera inscripción)
interface CreateSuscripcionDto {
  estudiante_id: string;
  producto_id: string;
  clase_grupo_id?: string; // Para CLUB
  comision_id?: string; // Para cursos
  tier: PlanSuscripcion;
}

// POST /api/tutor/suscripcion/inscripciones
// Agrega una inscripción a la suscripción existente
interface AddInscripcionDto {
  estudiante_id: string;
  producto_id: string;
  clase_grupo_id?: string;
  comision_id?: string;
}

// PUT /api/tutor/suscripcion/inscripciones/:id/horario
// Cambia el horario de una inscripción
interface CambiarHorarioDto {
  nuevo_clase_grupo_id: string;
}

// PUT /api/tutor/suscripcion/inscripciones/:id/producto
// Cambia el producto de una inscripción
interface CambiarProductoDto {
  nuevo_producto_id: string;
  nuevo_clase_grupo_id?: string;
}

// DELETE /api/tutor/suscripcion/inscripciones/:id
// Da de baja una inscripción

// PUT /api/tutor/suscripcion/tier
// Cambia el tier de la suscripción
interface CambiarTierDto {
  nuevo_tier: PlanSuscripcion;
}

// DELETE /api/tutor/suscripcion
// Cancela toda la suscripción
```

### 10.3 Landing/Catálogo (Público)

```typescript
// GET /api/catalogo/productos
// Lista productos públicos con filtros
interface CatalogoQuery {
  mundo?: Mundo;
  subtipo_mundo?: SubtipoMundo;
  casa?: Casa;
  tipo?: TipoProducto;
  edad?: number; // Filtra por rango de edad
}

// GET /api/catalogo/productos/:id
// Detalle público de producto con horarios disponibles
interface ProductoPublicoResponse {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoProducto;
  mundo: Mundo;
  subtipo_mundo?: SubtipoMundo;
  casa: Casa;
  nivel_olimpiada?: NivelOlimpiada;
  edad_minima: number;
  edad_maxima: number;

  // Solo para cursos temporales
  precio_contado?: number;
  precio_cuotas?: number;
  cantidad_cuotas?: number;

  // Horarios disponibles (solo con cupo)
  horarios: HorarioDisponibleResponse[];
}

interface HorarioDisponibleResponse {
  clase_grupo_id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  docente_nombre: string;
  cupo_disponible: number;
  cupo_maximo: number;
}
```

### 10.4 Webhooks MercadoPago

```typescript
// POST /api/webhooks/mercadopago/preapproval
// Recibe notificaciones de cambios en PreApproval
interface PreApprovalWebhook {
  id: string;
  type: 'subscription_preapproval';
  data: {
    id: string; // preapproval_id
  };
}

// Acciones según status del PreApproval:
// - authorized → SuscripcionFamiliar.estado = AUTHORIZED
// - paused → SuscripcionFamiliar.estado = PAUSED
// - cancelled → SuscripcionFamiliar.estado = CANCELLED

// POST /api/webhooks/mercadopago/payment
// Recibe notificaciones de pagos
interface PaymentWebhook {
  id: string;
  type: 'payment';
  data: {
    id: string; // payment_id
  };
}
```

---

## 11. VISTAS DE UI

### 11.1 Admin: Gestión de Productos

**Ruta**: `/admin/productos`

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin / Productos                                    [+ Nuevo] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filtros: [Tipo ▼] [Mundo ▼] [Casa ▼] [Estado ▼]  [Buscar...] │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐
│  │ 📦 Club Matemática Olímpica - Ñandú N1                      │
│  │    CLUB • MATEMATICA/OLIMPICA • VERTEX • 10-10 años         │
│  │    3 horarios • 45 inscriptos                               │
│  │    [Editar] [Horarios] [Ver inscriptos]                     │
│  ├─────────────────────────────────────────────────────────────┤
│  │ 📦 Colonia Programación Verano 2026                         │
│  │    COLONIA • PROGRAMACION • QUANTUM • 6-9 años              │
│  │    $75.000 contado / $90.000 en 3 cuotas                    │
│  │    2 comisiones • 28 inscriptos                             │
│  │    [Editar] [Comisiones] [Ver inscriptos]                   │
│  └─────────────────────────────────────────────────────────────┘
│                                                                 │
│  Página 1 de 5  [< Anterior] [Siguiente >]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Admin: Crear/Editar Producto

**Ruta**: `/admin/productos/new` o `/admin/productos/:id/edit`

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin / Productos / Nuevo Producto                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Información Básica ───────────────────────────────────┐   │
│  │ Nombre: [________________________________]               │   │
│  │ Descripción: [________________________________]          │   │
│  │              [________________________________]          │   │
│  │ Tipo: ( ) Club  ( ) Curso  ( ) Colonia  ( ) Taller       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Segmentación ─────────────────────────────────────────┐   │
│  │ Mundo:    [MATEMATICA ▼]                                 │   │
│  │ Subtipo:  [OLIMPICA ▼]      (solo si Matemática)         │   │
│  │ Casa:     [VERTEX ▼]                                     │   │
│  │ Nivel:    [NANDU_N1 ▼]      (solo si Olímpica)           │   │
│  │                                                          │   │
│  │ Edad mínima: [10]   Edad máxima: [10]                    │   │
│  │ [✓] Permite excepciones (altas capacidades)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Precios (solo Cursos Temporales) ─────────────────────┐   │
│  │ Precio contado: [$75.000]                                │   │
│  │ Precio cuotas:  [$90.000]  en [3] cuotas                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Visibilidad ──────────────────────────────────────────┐   │
│  │ [✓] Activo                                               │   │
│  │ [✓] Visible en landing                                   │   │
│  │ Orden de display: [0]                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Cancelar]                              [Guardar Producto]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Admin: Horarios de Producto (ClaseGrupos)

**Ruta**: `/admin/productos/:id/horarios`

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin / Productos / Club Mat. Olímpica / Horarios   [+ Nuevo]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📅 Lunes 17:00 - 18:30                                    │  │
│  │    Docente: Prof. García                                  │  │
│  │    Inscriptos: 12/30                                      │  │
│  │    Planificación: "Ñandú N1 - 2026" ✓                     │  │
│  │    [Editar] [Asignar planificación] [Ver estudiantes]     │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ 📅 Miércoles 18:00 - 19:30                                │  │
│  │    Docente: Prof. López                                   │  │
│  │    Inscriptos: 5/30                                       │  │
│  │    Planificación: Sin asignar ⚠️                          │  │
│  │    [Editar] [Asignar planificación] [Ver estudiantes]     │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ 📅 Viernes 16:00 - 17:30                                  │  │
│  │    Docente: Prof. Martínez                                │  │
│  │    Inscriptos: 28/30                                      │  │
│  │    Planificación: "Ñandú N1 - 2026" ✓                     │  │
│  │    [Editar] [Asignar planificación] [Ver estudiantes]     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Tutor: Portal de Suscripción

**Ruta**: `/tutor/suscripcion`

```
┌─────────────────────────────────────────────────────────────────┐
│  Tu Suscripción Familiar                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Resumen ──────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Estado: ● ACTIVA          Próximo cobro: 1 Feb 2026     │   │
│  │  Tier: STEAM Sincrónico                                  │   │
│  │  Total mensual: $180.500                                 │   │
│  │                                                          │   │
│  │  [Cambiar tier] [Historial de pagos] [Cancelar todo]     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Actividades de Juan (10 años) ────────────────────────┐   │
│  │                                                          │   │
│  │  📚 Club Matemática Olímpica - Ñandú N1                  │   │
│  │     Miércoles 18:00 • Prof. López                        │   │
│  │     $95.000/mes                                          │   │
│  │     [Cambiar horario] [Cambiar actividad] [Dar de baja]  │   │
│  │                                                          │   │
│  │  💻 Club Programación - Python Básico                    │   │
│  │     Jueves 17:00 • Prof. Rodríguez                       │   │
│  │     $85.500/mes (10% desc. familiar)                     │   │
│  │     [Cambiar horario] [Cambiar actividad] [Dar de baja]  │   │
│  │                                                          │   │
│  │  [+ Agregar actividad para Juan]                         │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Agregar otro hijo ────────────────────────────────────┐   │
│  │  [+ Inscribir a otro estudiante]                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.5 Landing: Catálogo por Mundo

**Ruta**: `/mundo/matematica/olimpica`

```
┌─────────────────────────────────────────────────────────────────┐
│  🏆 Matemática Olímpica                                         │
│  Preparación para Olimpiadas Matemáticas Argentinas             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Para tu hijo de 10 años (VERTEX) ─────────────────────┐   │
│  │                                                          │   │
│  │  ┌────────────────────┐  ┌────────────────────┐          │   │
│  │  │ 📊 Ñandú Nivel 1   │  │ 📊 Ñandú Nivel 2   │          │   │
│  │  │                    │  │                    │          │   │
│  │  │ Para 10 años       │  │ Para 11-12 años    │          │   │
│  │  │                    │  │                    │          │   │
│  │  │ 3 horarios disp.   │  │ ⚠️ No compatible   │          │   │
│  │  │                    │  │    (requiere 11+)  │          │   │
│  │  │ Desde $40.000/mes  │  │                    │          │   │
│  │  │                    │  │                    │          │   │
│  │  │ [Ver horarios]     │  │                    │          │   │
│  │  └────────────────────┘  └────────────────────┘          │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Tiers STEAM ──────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  📚 STEAM Libros      💻 Asincrónico     🎓 Sincrónico   │   │
│  │  $40.000/mes          $65.000/mes        $95.000/mes     │   │
│  │  Microlecciones       + Clases grabadas  + Clases VIVO   │   │
│  │  + Juegos             con docente        con docente     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 10% de descuento en la segunda actividad                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.6 Landing: Detalle de Producto

**Ruta**: `/mundo/matematica/olimpica/nandu-n1`

```
┌─────────────────────────────────────────────────────────────────┐
│  🏆 Club Matemática Olímpica - Ñandú Nivel 1                    │
│  Preparación para competencias Ñandú de la OMA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Descripción ──────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Programa anual de preparación para las Olimpiadas       │   │
│  │  Matemáticas Argentinas, nivel Ñandú 1 (10 años).        │   │
│  │                                                          │   │
│  │  Incluye:                                                │   │
│  │  • Resolución de problemas estilo OMA                    │   │
│  │  • Geometría, combinatoria, álgebra, números             │   │
│  │  • Simulacros de competencia                             │   │
│  │  • Acompañamiento personalizado                          │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Horarios Disponibles ─────────────────────────────────┐   │
│  │                                                          │   │
│  │  ○ Lunes 17:00 - 18:30                                   │   │
│  │    Prof. García • 18 lugares disponibles                 │   │
│  │                                                          │   │
│  │  ● Miércoles 18:00 - 19:30                    ← Elegido  │   │
│  │    Prof. López • 25 lugares disponibles                  │   │
│  │                                                          │   │
│  │  ○ Viernes 16:00 - 17:30                                 │   │
│  │    Prof. Martínez • 2 lugares disponibles ⚠️             │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Elige tu Plan ────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ○ 📚 STEAM Libros - $40.000/mes                         │   │
│  │  ○ 💻 STEAM Asincrónico - $65.000/mes                    │   │
│  │  ● 🎓 STEAM Sincrónico - $95.000/mes (Recomendado)       │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─── Resumen ──────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Estudiante: Juan Pérez (10 años)                        │   │
│  │  Actividad: Club Matemática Olímpica - Ñandú N1          │   │
│  │  Horario: Miércoles 18:00 - 19:30                        │   │
│  │  Tier: STEAM Sincrónico                                  │   │
│  │                                                          │   │
│  │  Total: $95.000/mes                                      │   │
│  │                                                          │   │
│  │  [Inscribir a Juan]                                      │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. CASOS DE BORDE

### 12.1 Estudiante Cumple Años y Cambia de Casa

**Escenario**: Juan tiene 9 años (QUANTUM) y cumple 10 (pasa a VERTEX) en marzo.

**Regla**:

- El cálculo de Casa se hace por la edad al 30 de junio del año en curso
- Si cumple 10 antes del 30/Jun, es VERTEX todo el año
- Si cumple 10 después del 30/Jun, sigue en QUANTUM ese año

**Implementación**:

```typescript
function calcularCasa(fechaNacimiento: Date, anioLectivo: number): Casa {
  const corte = new Date(anioLectivo, 5, 30); // 30 de junio
  const edadAlCorte = calcularEdad(fechaNacimiento, corte);

  if (edadAlCorte >= 13) return 'PULSAR';
  if (edadAlCorte >= 10) return 'VERTEX';
  return 'QUANTUM';
}
```

### 12.2 Cupo Lleno al Confirmar Inscripción

**Escenario**: Tutor elige un horario, pero otro lo confirma primero.

**Regla**:

- Verificar cupo al momento de confirmar (no al mostrar)
- Si no hay cupo, mostrar error y sugerir alternativas
- Reservar cupo temporalmente durante el checkout (15 minutos)

**Implementación**:

```typescript
async function reservarCupo(claseGrupoId: string, duracion: number = 15) {
  const reserva = await prisma.reservaCupo.create({
    data: {
      clase_grupo_id: claseGrupoId,
      expira_en: new Date(Date.now() + duracion * 60 * 1000),
    },
  });
  // Cron job limpia reservas expiradas cada minuto
  return reserva;
}
```

### 12.3 Fallo de Pago Recurrente

**Escenario**: MercadoPago no puede cobrar el mes de febrero.

**Flujo**:

1. MP intenta cobrar → Falla
2. Webhook notifica → Estado sigue AUTHORIZED
3. MP reintenta a las 24h → Falla
4. MP reintenta a las 48h → Falla
5. MP reintenta a las 72h → Falla
6. MP pausa suscripción → Webhook: Estado = PAUSED
7. Sistema envía email al tutor
8. Acceso continúa 7 días más (gracia)
9. Si no regulariza, acceso se corta

**Implementación**:

```typescript
// En webhook de PreApproval
if (preapproval.status === 'paused') {
  await prisma.suscripcionFamiliar.update({
    where: { preapproval_id: preapproval.id },
    data: {
      estado: 'PAUSED',
      fecha_gracia: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await enviarEmailPagoFallido(tutor);
}

// En middleware de acceso
if (suscripcion.estado === 'PAUSED') {
  if (new Date() > suscripcion.fecha_gracia) {
    throw new UnauthorizedException('Suscripción pausada. Regularice su pago.');
  }
  // Aún en período de gracia, permitir acceso
}
```

### 12.4 Excepción por Altas Capacidades

**Escenario**: Estudiante de 9 años quiere inscribirse en Ñandú N1 (requiere 10).

**Flujo**:

1. Tutor intenta inscribir → Sistema bloquea por edad
2. Tutor solicita excepción (formulario en landing)
3. Admin recibe solicitud
4. Admin aprueba → Se crea flag `excepcion_edad` en estudiante
5. Tutor puede inscribir

**Implementación**:

```typescript
// En validación de inscripción
function validarCompatibilidadEdad(estudiante, producto) {
  const edad = calcularEdad(estudiante.fecha_nacimiento);

  // Si el producto permite excepciones y el estudiante tiene una aprobada
  if (
    producto.permite_excepciones &&
    estudiante.excepciones?.some((e) => e.producto_id === producto.id && e.estado === 'APROBADA')
  ) {
    return true;
  }

  return edad >= producto.edad_minima && edad <= producto.edad_maxima;
}
```

### 12.5 Cambio de Tier Afecta el Monto

**Escenario**: Tutor tiene 2 actividades en LIBROS ($40k + $36k = $76k) y sube a SINCRONICO.

**Nuevo monto**: $95k + $85.5k = $180.5k

**Flujo**:

1. Tutor selecciona nuevo Tier
2. Sistema muestra preview del cambio
3. Tutor confirma
4. Se actualiza monto en MP para el mes siguiente
5. Acceso al nuevo contenido (clases en vivo) desde el 1ro del mes siguiente

### 12.6 Baja de Última Actividad

**Escenario**: Tutor tiene 1 actividad y la da de baja.

**Flujo**:

1. Sistema detecta que es la última
2. Muestra advertencia: "Esto cancelará tu suscripción"
3. Si confirma:
   - InscripcionActividad.estado = CANCELADA
   - SuscripcionFamiliar.estado = CANCELLED
   - Se cancela PreApproval en MP
   - Acceso hasta fin de mes

### 12.7 Múltiples Hijos en Diferentes Casas

**Escenario**: Familia con 2 hijos: Juan (10, VERTEX) y María (7, QUANTUM).

**Regla**:

- Cada hijo ve productos de su propia Casa
- El Tier es compartido (toda la familia)
- Descuento familiar aplica a partir de la 2da actividad (sin importar de qué hijo)

**Ejemplo**:

- Juan: Matemática Olímpica (VERTEX) → $95k
- María: Programación Scratch (QUANTUM) → $85.5k (10% desc.)
- Total: $180.5k

---

## 13. PLAN DE MIGRACIÓN

### 13.1 Fase 1: Schema y Modelos (Semana 1-2)

1. **Crear migración Prisma** con:
   - Nuevos enums
   - Nuevos modelos (SuscripcionFamiliar, InscripcionActividad, etc.)
   - Modificaciones a Producto y ClaseGrupo

2. **Actualizar Prisma Client**

3. **Crear tests unitarios** para los nuevos modelos

### 13.2 Fase 2: Backend Services (Semana 2-3)

1. **ProductosService** - CRUD completo
2. **ClaseGruposService** - Gestión de horarios
3. **SuscripcionFamiliarService**:
   - Crear suscripción
   - Agregar/quitar inscripciones
   - Cambiar tier
   - Cancelar

4. **MercadoPagoService** - Actualizar para PreApproval familiar

5. **Tests de integración**

### 13.3 Fase 3: API Endpoints (Semana 3-4)

1. Endpoints de Admin (productos, horarios, planificaciones)
2. Endpoints de Tutor (suscripción, inscripciones)
3. Endpoints de Catálogo (público)
4. Webhooks de MercadoPago

### 13.4 Fase 4: Frontend Admin (Semana 4-5)

1. `/admin/productos` - Lista y CRUD
2. `/admin/productos/:id/horarios` - Gestión de ClaseGrupos
3. `/admin/productos/:id/asignar-planificacion` - Conectar con Sandbox

### 13.5 Fase 5: Frontend Tutor (Semana 5-6)

1. `/tutor/suscripcion` - Portal de suscripción
2. Flujos de alta/baja/cambio
3. Historial de pagos

### 13.6 Fase 6: Landing Pages (Semana 6-7)

1. `/mundo/:mundo` - Catálogo por mundo
2. `/mundo/:mundo/:subtipo` - Catálogo por subtipo
3. `/mundo/:mundo/:subtipo/:producto` - Detalle de producto
4. Checkout integrado con MP

### 13.7 Fase 7: Testing E2E y QA (Semana 7-8)

1. Tests E2E con Playwright
2. QA manual de todos los flujos
3. Pruebas con MercadoPago Sandbox

### 13.8 Fase 8: Migración de Datos (Previo a deploy)

1. Migrar suscripciones existentes al nuevo modelo
2. Crear SuscripcionFamiliar para cada tutor con suscripción
3. Convertir Suscripcion → InscripcionActividad
4. Verificar integridad de datos

---

## 14. CHECKLIST DE IMPLEMENTACIÓN

### 14.1 Prisma Schema

- [ ] Agregar enum `TipoProducto` con valor `CLUB`
- [ ] Agregar enum `SubtipoMundo`
- [ ] Agregar enum `NivelOlimpiada`
- [ ] Agregar enums de estado (`EstadoSuscripcionFamiliar`, etc.)
- [ ] Modificar modelo `Producto` con nuevos campos
- [ ] Agregar relación `Producto.claseGrupos`
- [ ] Modificar modelo `ClaseGrupo` con `producto_id`
- [ ] Crear modelo `SuscripcionFamiliar`
- [ ] Crear modelo `InscripcionActividad`
- [ ] Crear modelo `CambioInscripcion`
- [ ] Crear modelo `PagoCurso`
- [ ] Agregar relaciones a `Tutor` y `Estudiante`
- [ ] Crear migración
- [ ] Ejecutar migración en staging

### 14.2 Backend - Services

- [ ] `ProductosService` - CRUD
- [ ] `ClaseGruposService` - CRUD
- [ ] `SuscripcionFamiliarService`
  - [ ] `crear()`
  - [ ] `obtenerPorTutor()`
  - [ ] `agregarInscripcion()`
  - [ ] `quitarInscripcion()`
  - [ ] `cambiarHorario()`
  - [ ] `cambiarProducto()`
  - [ ] `cambiarTier()`
  - [ ] `cancelar()`
  - [ ] `recalcularMonto()`
- [ ] `PreApprovalService` - Integración MP
  - [ ] `crearPreApproval()`
  - [ ] `actualizarMonto()`
  - [ ] `cancelarPreApproval()`
  - [ ] `procesarWebhook()`
- [ ] `CatalogoService`
  - [ ] `listarProductos()`
  - [ ] `obtenerProducto()`
  - [ ] `obtenerHorariosDisponibles()`

### 14.3 Backend - Controllers

- [ ] `AdminProductosController`
- [ ] `AdminClaseGruposController`
- [ ] `TutorSuscripcionController`
- [ ] `CatalogoController`
- [ ] `WebhooksController` (MP)

### 14.4 Backend - Tests

- [ ] Unit tests de services
- [ ] Integration tests de controllers
- [ ] Tests de webhooks
- [ ] Tests de cálculo de precios

### 14.5 Frontend - Admin

- [ ] Página `/admin/productos`
- [ ] Componente `ProductoForm`
- [ ] Página `/admin/productos/:id/horarios`
- [ ] Componente `ClaseGrupoForm`
- [ ] Modal de asignación de planificación

### 14.6 Frontend - Tutor

- [ ] Página `/tutor/suscripcion`
- [ ] Componente `SuscripcionResumen`
- [ ] Componente `InscripcionCard`
- [ ] Modal `AgregarActividad`
- [ ] Modal `CambiarHorario`
- [ ] Modal `CambiarProducto`
- [ ] Modal `ConfirmarBaja`
- [ ] Modal `CambiarTier`
- [ ] Modal `CancelarSuscripcion`

### 14.7 Frontend - Landing

- [ ] Página `/mundo/:mundo`
- [ ] Página `/mundo/:mundo/:subtipo`
- [ ] Página `/mundo/:mundo/:subtipo/:slug`
- [ ] Componente `ProductoCard`
- [ ] Componente `HorarioSelector`
- [ ] Componente `TierSelector`
- [ ] Componente `CheckoutResumen`
- [ ] Integración con MP Checkout

### 14.8 Integración MercadoPago

- [ ] Configurar PreApproval en sandbox
- [ ] Implementar creación de PreApproval
- [ ] Implementar actualización de monto
- [ ] Implementar cancelación
- [ ] Configurar webhooks
- [ ] Probar todos los flujos en sandbox
- [ ] Configurar credenciales de producción

### 14.9 Migración de Datos

- [ ] Script de migración de suscripciones
- [ ] Script de validación de datos
- [ ] Backup de base de datos
- [ ] Ejecutar migración en staging
- [ ] Validar datos migrados
- [ ] Ejecutar migración en producción

### 14.10 QA Final

- [ ] Test E2E: Alta de primera suscripción
- [ ] Test E2E: Agregar segunda actividad
- [ ] Test E2E: Cambio de horario
- [ ] Test E2E: Cambio de producto
- [ ] Test E2E: Baja de actividad
- [ ] Test E2E: Cambio de tier
- [ ] Test E2E: Cancelación total
- [ ] Test E2E: Pago de curso temporal
- [ ] Pruebas de carga
- [ ] Pruebas de seguridad

---

## APÉNDICE A: Constantes de Precios

Referencia: `apps/api/src/domain/constants/pricing.constants.ts`

```typescript
export const TIERS_STEAM = {
  STEAM_LIBROS: 40000,
  STEAM_ASINCRONICO: 65000,
  STEAM_SINCRONICO: 95000,
} as const;

export const DESCUENTO_FAMILIAR_STEAM = 10; // Porcentaje
```

---

## APÉNDICE B: Navegación del Admin Panel

### Estado Actual

El Admin Panel tiene la siguiente estructura de navegación que necesita reorganizarse:

- Dashboard
- Pagos
- Estadísticas
- Personas
- Productos
- Contenidos
- Sandbox

### Vistas Existentes que se Integran

- `GruposPedagogicosView` - Gestión Casa/Mundo de grupos
- `DocenteAsignacionesView` - Asignaciones de docentes a Casa/Mundo

### Propuesta de Reorganización

Con el nuevo modelo de Productos, la navegación quedaría:

1. **Dashboard** - Métricas generales
2. **Productos** - CRUD de productos (nuevo)
3. **Horarios** - ClaseGrupos por producto
4. **Planificaciones** - Listar y asignar
5. **Suscripciones** - Ver suscripciones familiares
6. **Pagos** - Historial de cobros
7. **Personas** - Tutores, estudiantes, docentes
8. **Sandbox** - Editor de microlecciones

---

## APÉNDICE C: Glosario

| Término           | Definición                                                   |
| ----------------- | ------------------------------------------------------------ |
| **Casa**          | Agrupación de estudiantes por edad (QUANTUM, VERTEX, PULSAR) |
| **Mundo**         | Disciplina o materia (MATEMATICA, PROGRAMACION, CIENCIAS)    |
| **Tier**          | Nivel de suscripción que determina acceso y precio           |
| **PreApproval**   | Autorización de cobro recurrente en MercadoPago              |
| **ClaseGrupo**    | Horario específico de una actividad de Club                  |
| **Comision**      | Instancia de un curso temporal con fechas de inicio/fin      |
| **Planificación** | Conjunto de clases/lecciones asignadas a un grupo            |
| **Microlección**  | Unidad mínima de contenido educativo                         |

---

**FIN DEL DOCUMENTO**

_Última actualización: 2026-01-17_
_Autor: Claude Code / Equipo Mateatletas_
