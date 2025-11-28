# Modelo de Tiers - Mateatletas 2026

## Decisión de Negocio (Fecha: 2024-11-28)

### Contexto

- Los docentes son especialistas (Mate ≠ Progra ≠ Ciencias)
- No queremos que PRO se llene porque implica contratar más docentes
- Matemática es el mundo con más demanda

### Segmentación Intencional

- **Amplitud** (3 mundos async) → ARCADE+
- **Profundidad** (docente especialista) → PRO
- PRO NO es "ARCADE+ con docente", es un producto diferente
- Esto protege la operación: la mayoría va a ARCADE+, PRO queda para los que valoran 1:1

### Reglas de Negocio

- El estudiante NO debe ver su tier (evitar sensación de "segunda clase")
- PRO incluye Matemática sync por default (mayor demanda)
- El estudiante PRO puede elegir cambiar el mundo sync si quiere (Progra o Ciencias en vez de Mate)

---

## Modelo Final de Tiers

| Tier    | Mundos Async | Mundos Sync | Precio  | Restricción                      |
| ------- | ------------ | ----------- | ------- | -------------------------------- |
| ARCADE  | 1            | 0           | $30,000 | -                                |
| ARCADE+ | 3            | 0           | $60,000 | -                                |
| PRO     | 1            | 1           | $75,000 | Async ≠ Sync (mundos diferentes) |

---

## Addons (SLICE futuro)

| Addon                 | Precio  | Notas                          |
| --------------------- | ------- | ------------------------------ |
| Mundo async adicional | $15,000 | Consistente con ARCADE→ARCADE+ |
| Mundo sync (docente)  | $45,000 | ARCADE + sync = PRO            |

**Ejemplos de combinaciones futuras:**

- ARCADE + sync Mate = $30k + $45k = $75k (equivale a PRO)
- ARCADE+ + sync Progra = $60k + $45k = $105k
- PRO + async adicional = $75k + $15k = $90k

---

## Descuentos Familiares

| Cantidad de hijos | Descuento al total |
| ----------------- | ------------------ |
| 1                 | 0%                 |
| 2                 | 12%                |
| 3+                | 20%                |

**Reglas:**

- El descuento aplica al total sin importar el tier de cada hijo
- Cada hijo puede elegir tier diferente
- El descuento se calcula en la lógica de pricing, no es un campo persistido

**Ejemplo:**

```
Familia con 3 hijos:
- Hijo 1: PRO ($75,000)
- Hijo 2: ARCADE+ ($60,000)
- Hijo 3: ARCADE ($30,000)

Subtotal: $165,000
Descuento 20%: -$33,000
Total mensual: $132,000
```

---

## Modelo de Datos

- `tier` va en `EstudianteInscripcion2026` (tier por estudiante, no por familia)
- El descuento se calcula en la lógica de pricing, no es un campo
- Relación: `EstudianteInscripcion2026` → `Tier` (FK)

```prisma
enum TierNombre {
  ARCADE
  ARCADE_PLUS
  PRO
}

model Tier {
  id             String     @id @default(cuid())
  nombre         TierNombre @unique
  precio_mensual Int        // 30000, 60000, 75000
  mundos_async   Int        // 1, 3, 1
  mundos_sync    Int        // 0, 0, 1
  tiene_docente  Boolean    // false, false, true
  descripcion    String?
  activo         Boolean    @default(true)
}

model EstudianteInscripcion2026 {
  // ... campos existentes ...
  tier_id String?
  tier    Tier?   @relation(...)
}
```

---

## Cambios de Tier

### Upgrade

- Aplica desde el **1ro del próximo mes**
- No hay prorrateo (se paga el mes completo al nuevo precio)
- El estudiante mantiene acceso actual hasta fecha efectiva
- Se guarda como "cambio pendiente" con `fecha_efectiva`

### Downgrade

- **Inmediato** (aplica al momento de solicitar)
- Pierde acceso sync al momento (si viene de PRO)
- Los mundos async se ajustan según nuevo tier
- El padre elige cuándo aplicar

### Validaciones

- No se puede cambiar al mismo tier
- El padre puede cancelar upgrade pendiente antes de `fecha_efectiva`

### Pendiente (SLICE futuro)

- [ ] Algoritmo de diagnóstico automático basado en planificaciones
- [ ] Guardar planificaciones completadas para diagnóstico instantáneo
- [ ] Notificaciones de cambio de tier próximo

---

## Preguntas Resueltas

- [x] ¿Tier por familia o estudiante? → **Por estudiante**
- [x] ¿Descuentos familiares? → **0%/12%/20% según cantidad de hijos**
- [x] ¿PRO mismo mundo async y sync? → **No, deben ser diferentes**
- [x] ¿Se puede hacer upgrade/downgrade mid-ciclo? → **Sí, con reglas diferentes**
- [x] ¿Qué pasa si un PRO quiere cambiar su mundo sync mid-ciclo? → **Pendiente SLICE futuro**

---

Última actualización: 2024-11-28
