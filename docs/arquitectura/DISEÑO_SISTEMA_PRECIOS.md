# 💰 Sistema de Precios Configurables - Mateatletas

## 📋 Especificación Completa

### **Precios Base Configurables:**

| Configuración                    | Valor Inicial | Descripción                                      |
| -------------------------------- | ------------- | ------------------------------------------------ |
| `precio_club_matematicas`        | $50.000       | Precio base Club de Matemáticas                  |
| `precio_cursos_especializados`   | $55.000       | Precio base Cursos (Robótica, Programación, etc) |
| `descuento_multiple_actividades` | $44.000       | Precio por actividad cuando estudiante tiene 2+  |
| `descuento_hermanos_basico`      | $44.000       | Precio por actividad con 2+ hermanos, 1 act c/u  |
| `descuento_hermanos_multiple`    | $38.000       | Precio por actividad con 2+ hermanos, 2+ act c/u |
| `descuento_aacrea_porcentaje`    | 20%           | Descuento AACREA (sobre precio base)             |

---

## 🎯 Reglas de Negocio (Prioridad de aplicación):

### **Orden de Evaluación:**

1. **¿Tiene AACREA?** → Solo aplica si 1 estudiante, 1 actividad
2. **¿Son hermanos con múltiples actividades?** → $38.000 por actividad
3. **¿Son hermanos con 1 actividad cada uno?** → $44.000 por actividad
4. **¿Un estudiante con múltiples actividades?** → $44.000 por actividad
5. **Ninguno** → Precio base ($50k o $55k)

---

## 🗄️ Modelos de Base de Datos

### **1. ConfiguracionPrecios** (tabla singleton)

```prisma
model ConfiguracionPrecios {
  id                                String   @id @default("singleton")

  // Precios base
  precio_club_matematicas           Decimal  @default(50000) @db.Decimal(10, 2)
  precio_cursos_especializados      Decimal  @default(55000) @db.Decimal(10, 2)

  // Descuentos por múltiples actividades
  precio_multiple_actividades       Decimal  @default(44000) @db.Decimal(10, 2)

  // Descuentos por hermanos
  precio_hermanos_basico            Decimal  @default(44000) @db.Decimal(10, 2)
  precio_hermanos_multiple          Decimal  @default(38000) @db.Decimal(10, 2)

  // Descuento AACREA
  descuento_aacrea_porcentaje       Decimal  @default(20) @db.Decimal(5, 2)
  descuento_aacrea_activo           Boolean  @default(true)

  // Metadata
  ultima_actualizacion              DateTime @updatedAt
  actualizado_por_admin_id          String?

  // Historial
  historial                         HistorialCambioPrecios[]

  @@map("configuracion_precios")
}
```

### **2. HistorialCambioPrecios**

```prisma
model HistorialCambioPrecios {
  id                        String   @id @default(cuid())
  configuracion_id          String

  // Valores anteriores (JSON para flexibilidad)
  valores_anteriores        Json
  valores_nuevos            Json

  // Metadata
  motivo_cambio             String?
  admin_id                  String
  fecha_cambio              DateTime @default(now())

  configuracion             ConfiguracionPrecios @relation(fields: [configuracion_id], references: [id])

  @@map("historial_cambio_precios")
}
```

### **3. InscripcionMensual** (reemplaza InscripcionClase)

```prisma
model InscripcionMensual {
  id                        String   @id @default(cuid())

  // Relaciones
  estudiante_id             String
  producto_id               String
  tutor_id                  String

  // Período
  anio                      Int
  mes                       Int      // 1-12
  periodo                   String   // "2025-01"

  // Precios calculados
  precio_base               Decimal  @db.Decimal(10, 2)
  descuento_aplicado        Decimal  @db.Decimal(10, 2) @default(0)
  precio_final              Decimal  @db.Decimal(10, 2)

  // Metadata del descuento
  tipo_descuento            TipoDescuento
  detalle_calculo           String   // Explicación del cálculo

  // Estado de pago
  estado_pago               EstadoPago @default(Pendiente)
  fecha_pago                DateTime?
  metodo_pago               String?
  comprobante_url           String?
  observaciones             String?

  // Auditoría
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  // Relaciones
  estudiante                Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)
  producto                  Producto   @relation(fields: [producto_id], references: [id])
  tutor                     Tutor      @relation(fields: [tutor_id], references: [id])

  @@unique([estudiante_id, producto_id, periodo])
  @@index([tutor_id, periodo])
  @@index([estado_pago])
  @@map("inscripciones_mensuales")
}
```

### **4. Enums**

```prisma
enum TipoDescuento {
  NINGUNO
  MULTIPLE_ACTIVIDADES
  HERMANOS_BASICO
  HERMANOS_MULTIPLE
  AACREA
}

enum EstadoPago {
  Pendiente
  Pagado
  Vencido
  Parcial
  Becado
}
```

### **5. Actualización modelo Estudiante**

```prisma
model Estudiante {
  // ... campos existentes

  // Descuentos especiales
  tiene_descuento_aacrea    Boolean  @default(false)
  numero_socio_aacrea       String?
  fecha_vencimiento_aacrea  DateTime?

  // Nueva relación
  inscripciones_mensuales   InscripcionMensual[]
}
```

---

## 🧪 Tests (TDD)

### **Test 1: Cálculo de Precio - 1 estudiante, 1 actividad**

```typescript
describe('PreciosService.calcularPrecio', () => {
  it('debe calcular precio base para 1 estudiante, 1 actividad', () => {
    const precio = calcularPrecio({
      cantidadHermanos: 1,
      actividadesPorEstudiante: 1,
      tipoProducto: 'CLUB_MATEMATICAS',
      tieneAACREA: false,
    });

    expect(precio).toBe(50000);
  });
});
```

### **Test 2: Descuento por múltiples actividades**

```typescript
it('debe aplicar descuento por múltiples actividades', () => {
  const precio = calcularPrecio({
    cantidadHermanos: 1,
    actividadesPorEstudiante: 2,
    tipoProducto: 'CLUB_MATEMATICAS',
    tieneAACREA: false,
  });

  expect(precio).toBe(44000);
});
```

### **Test 3: Descuento por hermanos básico**

```typescript
it('debe aplicar descuento hermanos básico', () => {
  const precio = calcularPrecio({
    cantidadHermanos: 2,
    actividadesPorEstudiante: 1,
    tipoProducto: 'CLUB_MATEMATICAS',
    tieneAACREA: false,
  });

  expect(precio).toBe(44000);
});
```

### **Test 4: Descuento por hermanos con múltiples actividades**

```typescript
it('debe aplicar descuento hermanos múltiple', () => {
  const precio = calcularPrecio({
    cantidadHermanos: 2,
    actividadesPorEstudiante: 2,
    tipoProducto: 'CLUB_MATEMATICAS',
    tieneAACREA: false,
  });

  expect(precio).toBe(38000);
});
```

### **Test 5: Descuento AACREA**

```typescript
it('debe aplicar descuento AACREA 20%', () => {
  const precio = calcularPrecio({
    cantidadHermanos: 1,
    actividadesPorEstudiante: 1,
    tipoProducto: 'CLUB_MATEMATICAS',
    tieneAACREA: true,
  });

  expect(precio).toBe(40000); // 50000 - 20%
});
```

### **Test 6: AACREA no aplica con múltiples actividades**

```typescript
it('NO debe aplicar AACREA con múltiples actividades', () => {
  const precio = calcularPrecio({
    cantidadHermanos: 1,
    actividadesPorEstudiante: 2,
    tipoProducto: 'CLUB_MATEMATICAS',
    tieneAACREA: true,
  });

  expect(precio).toBe(44000); // Descuento múltiples, NO AACREA
});
```

---

## 🎨 UI - Panel de Configuración de Precios

### **Página: `/admin/configuracion/precios`**

**Componentes:**

1. **Card de Precios Base**
   - Input: Precio Club Matemáticas
   - Input: Precio Cursos Especializados
   - Vista previa: Cálculo automático de descuentos

2. **Card de Descuentos**
   - Input: Precio múltiples actividades
   - Input: Precio hermanos básico
   - Input: Precio hermanos múltiple

3. **Card AACREA**
   - Toggle: Activar/Desactivar
   - Input: Porcentaje de descuento

4. **Simulador de Precios**
   - Selector: Cantidad hermanos
   - Selector: Actividades por hermano
   - Checkbox: Tiene AACREA
   - Output: Precio calculado

5. **Historial de Cambios**
   - Tabla con: Fecha, Admin, Cambios, Motivo

---

## 📊 Endpoints API

### **GET /admin/configuracion/precios**

```typescript
Response: {
  precio_club_matematicas: 50000,
  precio_cursos_especializados: 55000,
  precio_multiple_actividades: 44000,
  precio_hermanos_basico: 44000,
  precio_hermanos_multiple: 38000,
  descuento_aacrea_porcentaje: 20,
  descuento_aacrea_activo: true,
  ultima_actualizacion: "2025-01-23T10:00:00Z"
}
```

### **PUT /admin/configuracion/precios**

```typescript
Request: {
  precio_club_matematicas?: number,
  precio_cursos_especializados?: number,
  // ... otros campos
  motivo_cambio: string
}

Response: {
  success: true,
  configuracion: { ... },
  cambios_aplicados: { ... }
}
```

### **POST /admin/calcular-precio**

```typescript
Request: {
  tutor_id: string,
  estudiantes: [
    {
      estudiante_id: string,
      productos: ['CLUB_MATEMATICAS', 'ROBOTICA']
    }
  ]
}

Response: {
  total_mensual: 88000,
  detalle_por_estudiante: [
    {
      estudiante_id: "...",
      inscripciones: [
        {
          producto: "CLUB_MATEMATICAS",
          precio_base: 50000,
          precio_final: 44000,
          tipo_descuento: "MULTIPLE_ACTIVIDADES",
          detalle: "Estudiante con 2 actividades"
        }
      ]
    }
  ]
}
```

---

## ✅ Criterios de Aceptación

- [ ] Admin puede actualizar cualquier precio
- [ ] Todos los precios se recalculan automáticamente
- [ ] Historial completo de cambios
- [ ] Simulador muestra precio exacto
- [ ] Sin `any` ni `unknown` en el código
- [ ] Cobertura de tests > 90%
- [ ] Tipado estricto TypeScript
- [ ] Validaciones de negocio correctas
- [ ] UI intuitiva y responsive

---

**¿Aprobás este diseño para empezar la implementación?** 🚀
