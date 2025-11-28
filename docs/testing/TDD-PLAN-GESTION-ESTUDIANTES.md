# 🧪 PLAN TDD - GESTIÓN DE ESTUDIANTES Y TUTORES POR SECTOR

## 📋 RESUMEN DE FUNCIONALIDAD

### Objetivo Principal

Implementar un sistema completo de gestión de estudiantes por sectores que permita:

- Crear estudiantes con tutor desde cada sector
- Agregar múltiples hermanos en un solo flujo
- Copiar estudiantes existentes entre sectores
- Asignar clases específicas del sector a cada estudiante
- Generar credenciales automáticas para acceso a portales

### Flujo de Usuario

1. Admin entra a pestaña "Estudiantes"
2. Ve sectores: Matemática, Programación, Ciencias
3. Cada sector tiene botón "Añadir estudiante"
4. Modal permite agregar 1+ estudiantes (hermanos)
5. Formulario de tutor compartido (o vincular existente)
6. Sistema genera usuarios y contraseñas
7. Estudiantes quedan disponibles para asignar a clases del sector

---

## 🎯 SUITE DE TESTS - BACKEND

### Archivo 1: `crear-estudiante-con-tutor.spec.ts`

#### ✅ Test 1: Crear un estudiante con tutor nuevo en un sector

**Estado:** RED (no implementado)
**Lo que prueba:**

- Crear estudiante con todos sus datos
- Crear tutor nuevo con usuario y contraseña
- Vincular estudiante al sector especificado
- Generar username: `nombre.apellido` (lowercase, sin espacios)
- Generar password temporal de 8 caracteres alfanuméricos
- Retornar credenciales generadas

**Entrada:**

```json
{
  "estudiantes": [
    {
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "fechaNacimiento": "2010-05-15",
      "telefono": "1234567890"
    }
  ],
  "tutor": {
    "nombre": "María",
    "apellido": "Pérez",
    "dni": "87654321",
    "email": "maria.perez@example.com",
    "telefono": "0987654321"
  },
  "sectorId": "sector-matematica-id"
}
```

**Salida esperada:**

```json
{
  "estudiantes": [
    {
      "id": "estudiante-id",
      "nombre": "Juan",
      "apellido": "Pérez",
      "sector": { "id": "sector-matematica-id", "nombre": "Matemática" },
      "tutor": { "id": "tutor-id", "nombre": "María" }
    }
  ],
  "tutor": {
    "id": "tutor-id",
    "nombre": "María",
    "apellido": "Pérez"
  },
  "credenciales": {
    "tutor": {
      "username": "maria.perez",
      "password": "A1b2C3d4"
    },
    "estudiantes": [
      {
        "nombre": "Juan Pérez",
        "username": "juan.perez",
        "password": "X9y8Z7w6"
      }
    ]
  }
}
```

---

#### ✅ Test 2: Crear múltiples hermanos con el mismo tutor

**Estado:** RED (no implementado)
**Lo que prueba:**

- Procesar array de 2+ estudiantes
- Crear todos los estudiantes con el mismo tutor
- Generar credenciales únicas para cada estudiante
- Vincular todos al mismo sector

**Entrada:**

```json
{
  "estudiantes": [
    { "nombre": "Juan", "apellido": "Pérez", "dni": "12345678", "fechaNacimiento": "2010-05-15" },
    { "nombre": "Ana", "apellido": "Pérez", "dni": "12345679", "fechaNacimiento": "2012-08-20" }
  ],
  "tutor": {
    "nombre": "María",
    "apellido": "Pérez",
    "dni": "87654321",
    "email": "maria.perez@example.com"
  },
  "sectorId": "sector-matematica-id"
}
```

**Validaciones:**

- `result.estudiantes.length === 2`
- `result.credenciales.estudiantes.length === 2`
- Ambos estudiantes tienen `tutor_id` idéntico

---

#### ✅ Test 3: Vincular estudiantes a tutor existente

**Estado:** RED (no implementado)
**Lo que prueba:**

- Detectar tutor existente por email
- NO crear nuevo tutor
- NO generar nuevas credenciales para tutor
- Vincular estudiantes al tutor existente

**Lógica:**

```typescript
// Buscar tutor existente
const tutorExistente = await prisma.tutor.findFirst({
  where: { user: { email: dto.tutor.email } }
});

if (tutorExistente) {
  // Usar tutor existente, no generar credenciales
  return { ..., credenciales: { tutor: undefined, estudiantes: [...] } };
}
```

---

#### ✅ Test 4: Validación de sector existente

**Estado:** RED (no implementado)
**Lo que prueba:**

- Lanzar `BadRequestException` si `sectorId` no existe
- Mensaje: "El sector especificado no existe"

---

#### ✅ Test 5: Validación de DNI duplicado

**Estado:** RED (no implementado)
**Lo que prueba:**

- Lanzar `ConflictException` si un estudiante con ese DNI ya existe
- Mensaje: "Ya existe un estudiante con el DNI {dni}"
- Validar ANTES de crear en base de datos

---

#### ✅ Test 6: Generación automática de username

**Estado:** RED (no implementado)
**Lo que prueba:**

- Generar username desde `nombre.apellido`
- Convertir a lowercase
- Remover espacios y acentos
- Si username existe, agregar número: `juan.perez2`, `juan.perez3`

**Algoritmo:**

```typescript
function generarUsername(nombre: string, apellido: string): Promise<string> {
  let base = `${nombre}.${apellido}`.toLowerCase().replace(/\s+/g, '');
  let username = base;
  let counter = 2;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
}
```

---

#### ✅ Test 7: Generación de contraseña temporal segura

**Estado:** RED (no implementado)
**Lo que prueba:**

- Generar contraseña de exactamente 8 caracteres
- Solo caracteres alfanuméricos: `[A-Za-z0-9]`
- Cada contraseña debe ser única (probabilísticamente)

**Algoritmo:**

```typescript
function generarPasswordTemporal(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

---

### Archivo 2: `copiar-estudiante-entre-sectores.spec.ts`

#### ✅ Test 8: Copiar estudiante existente a nuevo sector

**Estado:** RED (no implementado)
**Lo que prueba:**

- Buscar estudiante por ID
- Actualizar `sector_id` al nuevo sector
- Mantener mismo tutor
- NO duplicar usuario
- Retornar estudiante actualizado con nueva relación

**Endpoint:** `PATCH /estudiantes/:id/copiar-a-sector`
**Body:**

```json
{ "sectorId": "sector-programacion-id" }
```

---

#### ✅ Test 9: Validar que el sector destino existe

**Estado:** RED (no implementado)
**Lo que prueba:**

- Lanzar `BadRequestException` si sector no existe
- Mensaje: "El sector destino no existe"

---

#### ✅ Test 10: Validar que el estudiante existe

**Estado:** RED (no implementado)
**Lo que prueba:**

- Lanzar `BadRequestException` si estudiante no existe
- Mensaje: "El estudiante no existe"

---

#### ✅ Test 11: Prevenir duplicación en el mismo sector

**Estado:** RED (no implementado)
**Lo que prueba:**

- Lanzar `ConflictException` si `estudiante.sector_id === nuevoSectorId`
- Mensaje: "El estudiante ya está asignado a este sector"

---

#### ✅ Test 12: Buscar estudiante por DNI para copiar

**Estado:** RED (no implementado)
**Lo que prueba:**

- Endpoint alternativo: `POST /estudiantes/copiar-por-dni`
- Body: `{ "dni": "12345678", "sectorId": "sector-programacion-id" }`
- Buscar estudiante por DNI
- Aplicar misma lógica de copia

---

### Archivo 3: `asignar-clases-a-estudiante.spec.ts`

#### ✅ Test 13: Asignar una clase a un estudiante

**Estado:** RED (no implementado)
**Lo que prueba:**

- Crear inscripción para la clase
- Incrementar `cupos_ocupados` de la clase
- Estado inicial: `Activa`
- Retornar inscripción creada

**Endpoint:** `POST /estudiantes/:id/asignar-clases`
**Body:**

```json
{ "clasesIds": ["clase-matematica-b1"] }
```

---

#### ✅ Test 14: Asignar múltiples clases a un estudiante

**Estado:** RED (no implementado)
**Lo que prueba:**

- Crear múltiples inscripciones en transacción
- Incrementar cupos de todas las clases
- Retornar array de inscripciones

---

#### ✅ Test 15: Validar que las clases pertenecen al sector del estudiante

**Estado:** RED (no implementado)
**Lo que prueba:**

- Para cada clase, validar `clase.sector_id === estudiante.sector_id`
- Lanzar `BadRequestException` si no coincide
- Mensaje: "La clase {nombre} no pertenece al sector del estudiante"

---

#### ✅ Test 16: Validar cupos disponibles

**Estado:** RED (no implementado)
**Lo que prueba:**

- Validar `clase.cupos_ocupados < clase.cupos_maximo`
- Lanzar `ConflictException` si está llena
- Mensaje: "La clase {nombre} no tiene cupos disponibles"

---

#### ✅ Test 17: Prevenir inscripción duplicada

**Estado:** RED (no implementado)
**Lo que prueba:**

- Buscar inscripción existente: `{ estudiante_id, clase_id }`
- Lanzar `ConflictException` si existe
- Mensaje: "El estudiante ya está inscrito en esta clase"

---

#### ✅ Test 18: Obtener clases disponibles por sector

**Estado:** RED (no implementado)
**Lo que prueba:**

- Endpoint: `GET /estudiantes/:id/clases-disponibles`
- Filtrar clases donde:
  - `clase.sector_id === estudiante.sector_id`
  - `clase.cupos_ocupados < clase.cupos_maximo`
  - Estudiante NO está inscrito
- Retornar array de clases con cupos disponibles

---

## 🎨 SUITE DE TESTS - FRONTEND

### Archivo 4: `modal-agregar-estudiantes.spec.tsx` (React Testing Library)

#### ✅ Test 19: Renderizar modal con formulario de estudiante

**Estado:** RED (no implementado)
**Lo que prueba:**

- Modal se abre al click en "Añadir estudiante"
- Muestra título del sector: "Agregar estudiante a Matemática"
- Formulario con campos: nombre, apellido, DNI, fecha nacimiento, teléfono
- Botón "Agregar otro estudiante"
- Sección de tutor al final

---

#### ✅ Test 20: Agregar múltiples estudiantes en el modal

**Estado:** RED (no implementado)
**Lo que prueba:**

- Click en "Agregar otro estudiante"
- Aparece segundo formulario idéntico
- Ambos formularios son independientes
- Se puede eliminar el segundo estudiante

---

#### ✅ Test 21: Validación de campos requeridos

**Estado:** RED (no implementado)
**Lo que prueba:**

- Marcar campos vacíos con error al submit
- DNI debe tener 7-8 dígitos
- Email del tutor debe ser válido
- Fecha de nacimiento en formato correcto

---

#### ✅ Test 22: Enviar datos y mostrar credenciales

**Estado:** RED (no implementado)
**Lo que prueba:**

- Submit del formulario llama al endpoint
- Mostrar modal de éxito con credenciales generadas
- Listar username y password de cada estudiante y tutor
- Opción de copiar credenciales

---

#### ✅ Test 23: Buscar y copiar estudiante existente

**Estado:** RED (no implementado)
**Lo que prueba:**

- Botón "Buscar estudiante existente" en el modal
- Campo de búsqueda por DNI
- Mostrar datos del estudiante encontrado
- Confirmar para copiarlo al sector actual

---

#### ✅ Test 24: Asignar clases después de crear estudiante

**Estado:** RED (no implementado)
**Lo que prueba:**

- Después de crear estudiante, mostrar lista de clases del sector
- Checkboxes para seleccionar múltiples clases
- Submit asigna clases seleccionadas
- Actualiza tabla de estudiantes con clases asignadas

---

## 🔄 CICLO TDD COMPLETO

### Fase 1: RED (Tests Fallan)

```bash
# Ejecutar todos los tests backend
cd apps/api
npm test crear-estudiante-con-tutor.spec.ts
npm test copiar-estudiante-entre-sectores.spec.ts
npm test asignar-clases-a-estudiante.spec.ts

# Resultado esperado: 18 tests FAILED
```

### Fase 2: GREEN (Implementar hasta que pasen)

1. Crear `EstudiantesService` con métodos:
   - `crearEstudiantesConTutor(dto)`
   - `copiarEstudianteASector(id, sectorId)`
   - `copiarEstudiantePorDNIASector(dni, sectorId)`
   - `asignarClasesAEstudiante(id, clasesIds)`
   - `obtenerClasesDisponiblesParaEstudiante(id)`

2. Crear `EstudiantesController` con endpoints:
   - `POST /estudiantes/crear-con-tutor`
   - `PATCH /estudiantes/:id/copiar-a-sector`
   - `POST /estudiantes/copiar-por-dni`
   - `POST /estudiantes/:id/asignar-clases`
   - `GET /estudiantes/:id/clases-disponibles`

3. Implementar utilities:
   - `generarUsername(nombre, apellido)`
   - `generarPasswordTemporal()`
   - `hashPassword(password)`

### Fase 3: REFACTOR

- Extraer lógica de validación a funciones reutilizables
- Crear servicio de generación de credenciales
- Optimizar queries de base de datos
- Agregar índices en Prisma para DNI, email

---

## 📊 ENDPOINTS FINALES

| Método | Ruta                                  | Descripción                              |
| ------ | ------------------------------------- | ---------------------------------------- |
| POST   | `/estudiantes/crear-con-tutor`        | Crear 1+ estudiantes con tutor en sector |
| PATCH  | `/estudiantes/:id/copiar-a-sector`    | Copiar estudiante a otro sector          |
| POST   | `/estudiantes/copiar-por-dni`         | Buscar por DNI y copiar a sector         |
| POST   | `/estudiantes/:id/asignar-clases`     | Asignar clases a estudiante              |
| GET    | `/estudiantes/:id/clases-disponibles` | Listar clases disponibles del sector     |
| GET    | `/estudiantes/por-sector/:sectorId`   | Listar estudiantes de un sector          |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend

- [ ] Crear DTOs (`crear-estudiantes-con-tutor.dto.ts`, `asignar-clases.dto.ts`)
- [ ] Implementar `EstudiantesService` con todos los métodos
- [ ] Implementar `EstudiantesController` con todos los endpoints
- [ ] Crear utilities (`generarUsername`, `generarPassword`)
- [ ] Ejecutar tests y verificar que todos pasan (GREEN)
- [ ] Refactorizar código

### Frontend

- [ ] Crear componente `ModalAgregarEstudiantes.tsx`
- [ ] Implementar formulario dinámico de múltiples estudiantes
- [ ] Integrar búsqueda de estudiante por DNI
- [ ] Mostrar modal de credenciales generadas
- [ ] Crear componente de asignación de clases
- [ ] Actualizar pestaña de estudiantes con filtro por sector

### Testing

- [ ] 18 tests backend pasando
- [ ] 6 tests frontend pasando
- [ ] Tests de integración E2E con Cypress/Playwright

---

## 🚀 ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. ✅ **DTOs** (ya creados)
2. **Test 1-7** → Crear estudiantes con tutor
3. **Test 13-18** → Asignar clases
4. **Test 8-12** → Copiar entre sectores
5. **Tests Frontend** → UI completa
6. **Refactoring** → Optimización y limpieza

---

**Fecha:** 2025-10-22
**Rama:** `gestion_estudiantes_y_tutores`
**Metodología:** TDD (RED → GREEN → REFACTOR)
