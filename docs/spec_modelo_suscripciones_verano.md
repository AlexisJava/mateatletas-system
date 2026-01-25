# SPEC: Modelo de Suscripciones y Ciclo de Verano

## Resumen Ejecutivo

Mateatletas opera con un ciclo lectivo (marzo-noviembre) y un período de verano (diciembre-febrero). Este documento define cómo funcionan las suscripciones a lo largo del año completo.

**IMPORTANTE**: Este documento es la fuente de verdad para la implementación. Claude Code debe seguir este spec al pie de la letra.

---

## 1. MODELO DE NEGOCIO

### 1.1 Ciclo Anual

| Período       | Meses               | Servicio                                 |
| ------------- | ------------------- | ---------------------------------------- |
| Ciclo Lectivo | Marzo - Noviembre   | Club activo (clases sync, async, profes) |
| Verano        | Diciembre - Febrero | Colonia de Verano O Continuidad          |

### 1.2 Tiers de Suscripción (precios actuales)

| Tier              | Precio Mensual | Incluye                                 |
| ----------------- | -------------- | --------------------------------------- |
| STEAM Libros      | $40.000        | Contenido async, libros                 |
| STEAM Asincrónico | $65.000        | Libros + contenido grabado + ejercicios |
| STEAM Sincrónico  | $95.000        | Todo + clases en vivo + profe asignado  |

### 1.3 Estados de Suscripción

| Estado        | Descripción                       | Cobro         |
| ------------- | --------------------------------- | ------------- |
| `ACTIVA`      | Servicio completo según tier      | 100% del tier |
| `CONTINUIDAD` | Verano sin colonia, mantiene cupo | $20.000/mes   |
| `BAJA`        | Cancelada, pierde cupo            | $0            |
| `PAUSADA`     | Pausa temporal (casos especiales) | $0            |

### 1.4 Modelo de Precios Verano (CRÍTICO)

| Decisión        | Diciembre           | Enero   | Febrero | Total Verano |
| --------------- | ------------------- | ------- | ------- | ------------ |
| **Colonia**     | $40.000 (matrícula) | $95.000 | $95.000 | $230.000     |
| **Continuidad** | $20.000             | $20.000 | $20.000 | $60.000      |
| **Baja**        | $0                  | $0      | $0      | $0           |

**Notas importantes:**

- La matrícula de Colonia ($40k) es **NO REEMBOLSABLE**
- Si el padre elige Colonia y luego se arrepiente → pierde la matrícula
- Las clases de Colonia son en **enero y febrero** (diciembre es solo matrícula)
- Continuidad da acceso async + cupo reservado para marzo

---

## 2. FLUJO DE TRANSICIÓN AL VERANO

### 2.1 Timeline

```
15 de Noviembre:
  └─→ Notificación a todos los tutores
      "¿Qué querés hacer en verano? Tenés hasta el 5 de diciembre para decidir"

      Opciones:
      [ ] Colonia de Verano (matrícula $40k + $95k en ene/feb)
      [ ] Solo mantener cupo ($20k/mes)
      [ ] Dar de baja (pierdo el lugar)

1-5 de Diciembre:
  └─→ Recordatorio final a quienes NO respondieron
      "Si no respondés antes del 5/12, tu suscripción se dará de baja"

6 de Diciembre:
  └─→ Procesamiento automático:
      - Respondió "Colonia" → Estado: ACTIVA, Cobra: $40.000 (matrícula)
      - Respondió "Mantener cupo" → Estado: CONTINUIDAD, Cobra: $20.000
      - No respondió → Estado: BAJA, Cobra: $0, pierde cupo

Enero:
  └─→ Colonia: $95.000 (servicio activo, clases en vivo)
      Continuidad: $20.000 (async + cupo)

Febrero:
  └─→ Colonia: $95.000 (servicio activo, clases en vivo)
      Continuidad: $20.000 (async + cupo)

1 de Marzo:
  └─→ Los que estaban en CONTINUIDAD vuelven a ACTIVA
      Monto vuelve a su tier original
```

### 2.2 Diagrama de Estados (Verano)

```
                    ┌─────────────────────────────────────────┐
                    │           NOVIEMBRE                      │
                    │    Suscripción ACTIVA (tier normal)     │
                    └─────────────────┬───────────────────────┘
                                      │
                            Notificación (15/nov)
                            "¿Qué hacés en verano?"
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            "Quiero Colonia"   "Solo cupo"      No responde
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
            │    ACTIVA     │ │ CONTINUIDAD   │ │     BAJA      │
            │               │ │               │ │               │
            │ Dic: $40k mat │ │ Dic: $20k     │ │ Dic: $0       │
            │ Ene: $95k     │ │ Ene: $20k     │ │ Pierde cupo   │
            │ Feb: $95k     │ │ Feb: $20k     │ │               │
            │               │ │               │ │               │
            │ Colonia activa│ │ Solo async    │ │               │
            └───────┬───────┘ └───────┬───────┘ └───────────────┘
                    │                 │
                    │    ┌────────────┤
                    │    │            │
                    │    ▼            │
                    │  ¿Quiere        │
                    │  sumarse a      │
                    │  Colonia?       │
                    │    │            │
                    │    ├─► Sí + Hay cupo → ACTIVA ($95k)
                    │    │   (matrícula perdida, no se devuelve)
                    │    │
                    │    └─► No hay cupo → Sigue CONTINUIDAD
                    │
                    │  ¿Se arrepiente │
                    │  de Colonia?    │
                    │    │            │
                    │    └─► Puede pasarse a CONTINUIDAD
                    │        PERO pierde matrícula ($40k)
                    │        Empieza a pagar $20k
                    │
                    └────────────────┬────────────────┘
                                     │
                                1 de Marzo
                                     │
                                     ▼
                    ┌─────────────────────────────────────────┐
                    │           MARZO                          │
                    │    Todos en CONTINUIDAD → ACTIVA        │
                    │    Vuelve monto original del tier       │
                    └─────────────────────────────────────────┘
```

---

## 3. REGLAS DE NEGOCIO

### 3.1 Continuidad ($20.000/mes en dic, ene, feb)

**El estudiante RECIBE:**

- ✅ Cupo reservado garantizado para marzo
- ✅ Acceso a contenido async (libros, videos)
- ✅ Historial y progreso guardado
- ✅ Mantiene beneficios de su tier original (si era Sync, vuelve como Sync en marzo)

**El estudiante NO RECIBE:**

- ❌ Clases en vivo
- ❌ Profe asignado
- ❌ Soporte activo/seguimiento

### 3.2 Colonia de Verano (matrícula $40k + $95k/mes en ene y feb)

**El estudiante RECIBE:**

- ✅ Todo el servicio activo (en enero y febrero)
- ✅ Clases en vivo de Colonia
- ✅ Profe asignado
- ✅ Actividades especiales de verano
- ✅ Si es tier Sync, mantiene beneficios Sync en Colonia

**Sobre la matrícula de diciembre ($40.000):**

- Es un pago de reserva/compromiso
- Las clases de Colonia empiezan en ENERO, no en diciembre
- La matrícula es **NO REEMBOLSABLE** bajo ninguna circunstancia

### 3.3 Cambio tardío (Enero/Febrero)

**De CONTINUIDAD a COLONIA:**

- Un padre en CONTINUIDAD puede solicitar cambiar a Colonia
- **SI hay cupo disponible** → Se aprueba, pasa a ACTIVA, paga $95k desde ese mes
- **SI NO hay cupo** → Se rechaza, sigue en CONTINUIDAD
- Cupo se verifica por grupo de Colonia, no total

**De COLONIA a CONTINUIDAD (arrepentimiento):**

- Se puede hacer en cualquier momento
- **PIERDE la matrícula de $40k** (no hay devolución)
- Empieza a pagar $20k/mes desde el mes siguiente
- Mantiene cupo para marzo

### 3.4 Baja (no responde o elige baja)

- Pierde el cupo inmediatamente
- No se le cobra nada
- Si quiere volver en marzo, debe inscribirse como nuevo
- Compite por cupo con inscripciones nuevas
- No tiene prioridad ni beneficios

### 3.5 Múltiples hijos

- Un tutor puede elegir diferente para cada hijo
- Ejemplo: Hijo 1 → Colonia, Hijo 2 → Continuidad
- Cada estudiante tiene su propia decisión de verano
- Se cobra por estudiante, no por familia

### 3.6 Cupos de Colonia

- El cupo es **por grupo** de Colonia, no total
- Cada grupo de Colonia tiene su límite (igual que ClaseGrupos normales)
- Si un grupo se llena, el padre puede elegir otro grupo con cupo
- Si todos los grupos están llenos → solo puede elegir Continuidad

---

## 4. IMPLICACIONES TÉCNICAS

### 4.1 Base de Datos

**Nuevo enum para estado de suscripción:**

```prisma
enum EstadoSuscripcion {
  ACTIVA        // Servicio completo, cobra tier normal
  CONTINUIDAD   // Verano sin colonia, cobra $20k
  BAJA          // Cancelada, no cobra
  PAUSADA       // Pausa especial, no cobra
}
```

**Nuevo enum para decisión de verano:**

```prisma
enum DecisionVerano {
  COLONIA       // Quiere Colonia de Verano
  CONTINUIDAD   // Solo mantener cupo
  PENDIENTE     // Aún no decidió
}
```

**Nuevos campos en modelo de Suscripción:**

```prisma
model SuscripcionFamiliar {
  // ... campos existentes

  // Campos para manejo de verano
  estadoSuscripcion       EstadoSuscripcion @default(ACTIVA)
  decisionVerano          DecisionVerano?
  fechaDecisionVerano     DateTime?
  montoOriginal           Decimal?          // Guardar tier original para restaurar en marzo
  matriculaColoniaPagada  Boolean @default(false)  // Si pagó los $40k de matrícula
}
```

**Constantes de precios (configurables):**

```typescript
const PRECIOS_VERANO = {
  MATRICULA_COLONIA: 40000, // Diciembre - no reembolsable
  CUOTA_COLONIA: 95000, // Enero y Febrero
  CUOTA_CONTINUIDAD: 20000, // Diciembre, Enero, Febrero
};
```

### 4.2 Integración MercadoPago

**CRÍTICO - Investigar antes de implementar:**

- [ ] ¿Se puede modificar el monto de una PreApproval activa?
- [ ] ¿O hay que cancelar la suscripción y crear una nueva?
- [ ] ¿Cómo manejar el cambio de monto mes a mes? (ej: $40k dic → $95k ene)

**Escenarios de cobro:**
| Mes | Colonia | Continuidad |
|-----|---------|-------------|
| Diciembre | $40.000 (matrícula) | $20.000 |
| Enero | $95.000 | $20.000 |
| Febrero | $95.000 | $20.000 |
| Marzo | Vuelve a tier original | Vuelve a tier original |

### 4.3 Endpoints Necesarios

```typescript
// ============ PORTAL TUTOR ============

// Ver opciones de verano y estado actual
GET /tutor/verano/estado
Response: {
  puedeDecidir: boolean,           // true si estamos en período de decisión
  fechaLimite: Date,               // "2025-12-05"
  decisionActual: DecisionVerano | null,
  estudiantes: [{
    id: string,
    nombre: string,
    decision: DecisionVerano | null,
    cuposColoniaDisponibles: number
  }]
}

// Tomar decisión de verano para un estudiante
POST /tutor/verano/decidir
Body: {
  estudianteId: string,
  decision: "COLONIA" | "CONTINUIDAD" | "BAJA"
}
Response: {
  success: boolean,
  mensaje: string,
  montoProximoCobro: number
}

// Cambio tardío: de CONTINUIDAD a COLONIA (si hay cupo)
POST /tutor/verano/solicitar-colonia
Body: {
  estudianteId: string
}
Response: {
  success: boolean,
  mensaje: string,  // "Aprobado" o "Sin cupo disponible"
  cupoAsignado?: string  // grupo asignado
}

// Cambio tardío: de COLONIA a CONTINUIDAD (pierde matrícula)
POST /tutor/verano/cancelar-colonia
Body: {
  estudianteId: string,
  confirmaPerderMatricula: boolean  // debe ser true
}
Response: {
  success: boolean,
  mensaje: string  // "Matrícula no reembolsable. Ahora pagás $20k/mes"
}

// ============ PORTAL ADMIN ============

// Dashboard resumen de verano
GET /admin/verano/resumen
Response: {
  totalEstudiantes: number,
  decidieronColonia: number,
  decidieronContinuidad: number,
  noRespondieron: number,
  fechaLimite: Date,
  cuposColoniaPorGrupo: [{
    grupoId: string,
    nombre: string,
    cupoTotal: number,
    cupoOcupado: number,
    disponible: number
  }]
}

// Listar decisiones individuales
GET /admin/verano/decisiones
Query: { filtro?: "COLONIA" | "CONTINUIDAD" | "PENDIENTE" | "BAJA" }
Response: [{
  estudianteId: string,
  nombre: string,
  tutor: string,
  decision: DecisionVerano,
  fechaDecision: Date | null
}]

// Procesar no respondieron (ejecutar el 6 de diciembre)
POST /admin/verano/procesar-bajas
Response: {
  procesados: number,
  dadosDeBaja: string[]  // IDs de estudiantes
}

// Forzar cambio (admin override)
POST /admin/verano/forzar-decision
Body: {
  estudianteId: string,
  decision: "COLONIA" | "CONTINUIDAD" | "BAJA",
  motivo: string
}
```

### 4.4 Cron Jobs / Tareas Programadas

| Fecha  | Job                          | Acción                                   |
| ------ | ---------------------------- | ---------------------------------------- |
| 15 Nov | `enviar-notificacion-verano` | Notificar a todos los tutores activos    |
| 1 Dic  | `recordatorio-verano`        | Notificar a quienes NO respondieron      |
| 6 Dic  | `procesar-no-respondieron`   | Dar de BAJA a quienes no decidieron      |
| 6 Dic  | `aplicar-cambios-monto`      | Cambiar montos en MercadoPago            |
| 1 Ene  | `actualizar-montos-enero`    | Colonia: $40k → $95k                     |
| 1 Mar  | `restaurar-suscripciones`    | Todos vuelven a ACTIVA con tier original |

### 4.5 Notificaciones

| Evento | Canal       | Destinatario         | Mensaje                                                    |
| ------ | ----------- | -------------------- | ---------------------------------------------------------- |
| 15 Nov | Email + App | Tutor                | "Decidí qué hacer en verano. Tenés hasta el 5/dic"         |
| 1 Dic  | Email + App | Tutor (no respondió) | "ÚLTIMO AVISO: Si no decidís, perdés el cupo"              |
| 6 Dic  | Email       | Tutor (baja)         | "Tu suscripción fue cancelada por no responder"            |
| 6 Dic  | Email       | Tutor (continuidad)  | "Confirmamos tu continuidad. Nos vemos en marzo"           |
| 6 Dic  | Email       | Tutor (colonia)      | "¡Confirmado! Colonia de Verano. Clases empiezan en enero" |
| 1 Mar  | Email + App | Tutor (continuidad)  | "¡Volvemos! Tu suscripción está activa"                    |

### 4.6 UI Portal Tutor

**Nueva sección visible desde 1 de noviembre:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🌴 DECISIÓN DE VERANO                                          │
│                                                                 │
│  Elegí qué hacer en diciembre, enero y febrero para cada hijo: │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👦 Juan Pérez                                            │   │
│  │                                                          │   │
│  │ ○ ☀️ COLONIA DE VERANO                                   │   │
│  │   Matrícula: $40.000 (dic) + $95.000/mes (ene-feb)      │   │
│  │   Clases en vivo + servicio completo                    │   │
│  │   Cupos disponibles: 5                                   │   │
│  │                                                          │   │
│  │ ○ 📚 MANTENER MI CUPO                                    │   │
│  │   $20.000/mes (dic-ene-feb)                             │   │
│  │   Acceso async + lugar reservado para marzo             │   │
│  │                                                          │   │
│  │ ○ ❌ DAR DE BAJA                                         │   │
│  │   $0 - Cancelo suscripción y pierdo el cupo             │   │
│  │                                                          │   │
│  │                              [CONFIRMAR DECISIÓN]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ Tenés hasta el 5 de diciembre para decidir.                │
│     Si no elegís, tu suscripción se dará de baja               │
│     automáticamente.                                            │
│                                                                 │
│  ℹ️ La matrícula de Colonia ($40k) no es reembolsable.         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Estado post-decisión (si eligió Colonia):**

```
┌─────────────────────────────────────────────────────────────────┐
│  🌴 VERANO 2026                                                 │
│                                                                 │
│  👦 Juan Pérez                                                  │
│  ✅ COLONIA DE VERANO confirmada                                │
│  Matrícula pagada: $40.000                                      │
│  Próximo cobro (enero): $95.000                                 │
│                                                                 │
│  [CAMBIAR A CONTINUIDAD]  ⚠️ Perderás la matrícula ($40k)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Estado post-decisión (si eligió Continuidad y quiere cambiar):**

```
┌─────────────────────────────────────────────────────────────────┐
│  🌴 VERANO 2026                                                 │
│                                                                 │
│  👧 María Pérez                                                 │
│  📚 CONTINUIDAD confirmada                                      │
│  Próximo cobro: $20.000/mes                                     │
│                                                                 │
│  [CAMBIAR A COLONIA]  (3 cupos disponibles)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. CASOS BORDE Y PREGUNTAS

### 5.1 Resueltos

| Pregunta                                                   | Respuesta                                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ¿Qué pasa si no responde?                                  | BAJA automática, pierde cupo                                                        |
| ¿Puede cambiar de opinión en enero?                        | Sí, de CONTINUIDAD a COLONIA si hay cupo. De COLONIA a CONTINUIDAD pierde matrícula |
| ¿El fee de continuidad da algún servicio?                  | Sí, async + cupo reservado                                                          |
| ¿El tier se mantiene?                                      | Sí, si era Sync vuelve como Sync en marzo                                           |
| ¿Qué se paga en diciembre?                                 | Colonia: $40k (matrícula). Continuidad: $20k                                        |
| ¿Qué pasa si tiene 2 hijos y quiere Colonia solo para uno? | Se puede, cada hijo tiene decisión independiente                                    |
| ¿La Colonia tiene cupo total o por grupo?                  | Por grupo                                                                           |
| ¿La matrícula es reembolsable?                             | NO, bajo ninguna circunstancia                                                      |

### 5.2 Por definir (lógica de negocio futura)

| Pregunta                                                             | Decisión pendiente |
| -------------------------------------------------------------------- | ------------------ |
| ¿Hay descuento en Colonia por hermanos?                              | Definir con Aye    |
| ¿Qué pasa si un grupo de Colonia se cancela por falta de inscriptos? | Definir política   |

---

## 6. TIMELINE DE IMPLEMENTACIÓN

**Esto debe estar listo ANTES del 15 de noviembre.**

| Componente                             | Prioridad | Estimación |
| -------------------------------------- | --------- | ---------- |
| Modelo de datos (estados, campos)      | CRÍTICO   | 1 día      |
| Endpoint decisión de verano            | CRÍTICO   | 1 día      |
| UI Portal Tutor (decisión)             | CRÍTICO   | 2 días     |
| Integración MercadoPago (cambio monto) | CRÍTICO   | 2-3 días   |
| Sistema de notificaciones              | CRÍTICO   | 1 día      |
| Cron jobs (procesamiento automático)   | CRÍTICO   | 1 día      |
| Admin dashboard verano                 | MEDIO     | 1 día      |
| Tests                                  | CRÍTICO   | 2 días     |

**Total estimado: 10-12 días de desarrollo**

---

## 7. APÉNDICE: DIFERENCIA CON EVENTOS/CURSOS

Este spec cubre el **flujo de verano para suscriptores existentes**.

Para **padres nuevos** que quieren comprar solo Colonia sin suscripción previa, o para **talleres/cursos sueltos**, se necesita el flujo de Eventos/Cursos (5.5 Parte B), que es un spec separado.

| Concepto                  | Suscriptor existente              | Padre nuevo             |
| ------------------------- | --------------------------------- | ----------------------- |
| Colonia de Verano         | Elige "Colonia" en su suscripción | Compra Evento "Colonia" |
| Taller de Robótica        | Adicional a su suscripción        | Compra Evento "Taller"  |
| Curso de Verano 2 semanas | Adicional a su suscripción        | Compra Curso            |
