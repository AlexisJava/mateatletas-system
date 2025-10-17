# Plan de Validación Avanzada (+0.2 puntos)

**Objetivo**: Llevar Backend de 8.5/10 → 8.7/10
**Tiempo estimado**: 2-3 horas

---

## 📊 Estado Actual de Validaciones

### ✅ Ya Implementado (Básico)

Los DTOs actuales tienen validaciones básicas con `class-validator`:
- `@IsEmail()`, `@IsString()`, `@IsNumber()`
- `@MinLength()`, `@Min()`, `@Max()`
- `@IsOptional()`, `@IsNotEmpty()`
- `@IsEnum()`, `@IsDateString()`
- `@ValidateIf()` (validación condicional)
- Mensajes de error básicos

### ❌ Falta Implementar (Avanzado)

1. **Validadores Custom** para reglas de negocio
2. **Sanitización** de inputs (trim, lowercase, escape)
3. **Validación de dependencias** entre campos
4. **Validación de fechas** (futuro, rango, lógica de negocio)
5. **Validación de IDs** (UUID, existencia en BD)
6. **Transformación** automática de datos
7. **Mensajes de error mejorados** con contexto
8. **Validación de arrays** y objetos anidados

---

## 🎯 Tareas a Implementar

### 1. Crear Validadores Custom (Prioridad Alta)

**Validadores necesarios**:

#### `@IsFutureDate()` - Validar fechas futuras
```typescript
// Casos de uso:
// - CrearClaseDto.fechaHoraInicio
// - CrearProductoDto.fecha_inicio
// - ReservarClaseDto (validar que clase no ha pasado)
```

#### `@IsDateRange()` - Validar rango de fechas
```typescript
// Casos de uso:
// - CrearProductoDto (fecha_inicio < fecha_fin)
// - Filtros de búsqueda con fecha_desde/fecha_hasta
```

#### `@IsValidAge()` - Validar edad mínima/máxima
```typescript
// Casos de uso:
// - CreateEstudianteDto.fecha_nacimiento (4-18 años)
```

#### `@IsValidPassword()` - Validación de contraseña robusta
```typescript
// Casos de uso:
// - RegisterDto.password
// - CambiarPasswordDto.newPassword
```

#### `@IsUUID()` - Validar formato UUID
```typescript
// Casos de uso:
// - Todos los campos de ID (rutaCurricularId, docenteId, etc.)
```

#### `@IsPhoneNumber()` - Validar teléfonos argentinos
```typescript
// Casos de uso:
// - RegisterDto.telefono
// - CreateDocenteDto.telefono
```

---

### 2. Agregar Sanitización de Inputs

**Transformadores necesarios**:

#### `@Trim()` - Eliminar espacios en blanco
```typescript
// Aplicar a:
// - Todos los campos de texto (nombre, apellido, email)
// - Evita " Juan " → "Juan"
```

#### `@Lowercase()` - Convertir a minúsculas
```typescript
// Aplicar a:
// - email (evita duplicados por case sensitivity)
```

#### `@Capitalize()` - Primera letra en mayúscula
```typescript
// Aplicar a:
// - nombre, apellido (consistencia en BD)
```

#### `@SanitizeHTML()` - Eliminar tags HTML
```typescript
// Aplicar a:
// - descripcion (prevenir XSS)
// - observaciones, notas
```

---

### 3. Mejorar DTOs Críticos

#### `RegisterDto` (Auth)
```typescript
✅ Ya tiene: email, password con regex, nombres
➕ Agregar:
- @Trim() en nombre, apellido, email
- @Lowercase() en email
- @IsPhoneNumber('AR') en telefono
- @Capitalize() en nombre, apellido
- Validador custom para DNI argentino
```

#### `CreateEstudianteDto`
```typescript
✅ Ya tiene: nombre, apellido, nivel_escolar
➕ Agregar:
- @IsValidAge(4, 18) en fecha_nacimiento
- @Trim() en todos los strings
- @Capitalize() en nombre, apellido
- Validación: foto_url debe ser https si existe
```

#### `CrearClaseDto`
```typescript
✅ Ya tiene: IDs, fechaHoraInicio, duracion, cupos
➕ Agregar:
- @IsFutureDate() en fechaHoraInicio
- @IsUUID() en rutaCurricularId, docenteId, productoId
- Validación: duracionMinutos debe ser múltiplo de 15
- Validación: cuposMaximo <= 30 (límite de plataforma)
- Validación: fechaHoraInicio debe ser horario escolar (8-20hs)
```

#### `CrearProductoDto`
```typescript
✅ Ya tiene: ValidateIf para campos condicionales
➕ Agregar:
- @Trim() en nombre, descripcion
- @Capitalize() en nombre
- @IsDateRange() para fecha_inicio/fecha_fin
- @IsFutureDate() en fecha_inicio
- Validación: fecha_fin > fecha_inicio + 1 mes (mínimo)
- Validación: precio <= 10000 (límite razonable)
```

#### `RegistrarAsistenciaDto`
```typescript
✅ Actualmente muy básico
➕ Agregar:
- @IsArray() para estudiantes
- @ArrayMinSize(1) - al menos 1 estudiante
- @ArrayMaxSize(30) - máximo 30 estudiantes
- @IsUUID() en estudiante_id
- @IsEnum() en estado (Presente, Ausente, Tardanza)
- @Min(0) @Max(100) en puntos_otorgados
- @Trim() en observaciones
- @MaxLength(500) en observaciones
```

---

### 4. Crear Pipe de Validación Global

**Objetivo**: Configurar ValidationPipe con opciones avanzadas

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Elimina propiedades no definidas
    forbidNonWhitelisted: true, // Error si hay propiedades extra
    transform: true,            // Transforma tipos automáticamente
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      // Mensajes de error mejorados con contexto
      return new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: formatValidationErrors(errors),
      });
    },
  }),
);
```

---

### 5. Tests de Validación

**Tests necesarios**:

```typescript
describe('CrearClaseDto Validation', () => {
  it('should reject past dates');
  it('should reject invalid UUID format');
  it('should reject duracion not multiple of 15');
  it('should reject cupos > 30');
  it('should reject fechaHora outside 8-20hs');
  it('should trim whitespace from IDs');
  it('should accept valid DTO');
});
```

---

## 📦 Estructura de Archivos

```
apps/api/src/
├── common/
│   ├── validators/
│   │   ├── is-future-date.validator.ts
│   │   ├── is-date-range.validator.ts
│   │   ├── is-valid-age.validator.ts
│   │   ├── is-phone-number-ar.validator.ts
│   │   ├── is-business-hours.validator.ts
│   │   └── index.ts
│   ├── decorators/
│   │   ├── trim.decorator.ts
│   │   ├── capitalize.decorator.ts
│   │   ├── sanitize-html.decorator.ts
│   │   └── index.ts
│   └── pipes/
│       ├── validation-error-formatter.ts
│       └── index.ts
└── [módulos]/dto/
    └── *.dto.ts (actualizados con nuevos validadores)
```

---

## 🎯 Priorización de Implementación

### Sprint 1: Validadores Custom (1 hora)
1. ✅ Crear `@IsFutureDate()`
2. ✅ Crear `@IsDateRange()`
3. ✅ Crear `@IsValidAge()`
4. ✅ Crear `@IsBusinessHours()`
5. ✅ Crear `@IsPhoneNumberAR()`

### Sprint 2: Sanitización (30 min)
1. ✅ Crear `@Trim()`
2. ✅ Crear `@Capitalize()`
3. ✅ Crear `@Lowercase()`
4. ✅ Crear `@SanitizeHTML()`

### Sprint 3: Aplicar a DTOs (45 min)
1. ✅ Actualizar `RegisterDto`
2. ✅ Actualizar `CreateEstudianteDto`
3. ✅ Actualizar `CrearClaseDto`
4. ✅ Actualizar `CrearProductoDto`
5. ✅ Actualizar `RegistrarAsistenciaDto`

### Sprint 4: Tests (30 min)
1. ✅ Tests de validadores custom
2. ✅ Tests de sanitización
3. ✅ Tests de DTOs actualizados

---

## 📈 Impacto Esperado

**Antes (8.5/10)**:
- ✅ Validaciones básicas
- ❌ Sin sanitización
- ❌ Sin validación de reglas de negocio
- ❌ Mensajes de error genéricos

**Después (8.7/10)**:
- ✅ Validaciones básicas
- ✅ Validaciones avanzadas con reglas de negocio
- ✅ Sanitización automática de inputs
- ✅ Validadores custom reutilizables
- ✅ Mensajes de error con contexto
- ✅ Prevención de XSS y SQL injection
- ✅ Transformación automática de datos

**Mejora**: +0.2 puntos (+2.35%)

---

## 🚀 Comenzar Implementación

**Orden recomendado**:
1. Crear validadores custom básicos
2. Aplicar a DTOs críticos (Auth, Clases, Estudiantes)
3. Agregar sanitización
4. Tests
5. Documentar patrones

**Tiempo total estimado**: 2-3 horas
