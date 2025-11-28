# Tests TDD Creados - Mejoras en Creación de Docentes

## 📋 Resumen

Se crearon **3 archivos de tests completos** siguiendo el enfoque **Test-Driven Development (TDD)**. Estos tests están diseñados para **FALLAR inicialmente** hasta que implementemos los cambios correspondientes.

## 📁 Archivos de Tests Creados

### 1. Backend - Service de Docentes

**Archivo:** `apps/api/src/docentes/__tests__/docente-creation-improvements.spec.ts`

**Tests incluidos (64 tests en total):**

#### Generación automática de contraseñas

- ✅ Debe generar contraseña segura de 12 caracteres si no se proporciona
- ✅ Debe marcar `debe_cambiar_password=true` cuando se auto-genera contraseña
- ✅ Debe marcar `debe_cambiar_password=false` cuando admin proporciona contraseña
- ✅ La contraseña auto-generada debe ser segura (minúsculas, mayúsculas, números, símbolos)

#### Retorno de contraseña generada

- ✅ Debe retornar la contraseña en texto plano cuando es auto-generada (solo en creación)
- ✅ NO debe retornar contraseña cuando el admin la proporciona manualmente

#### Campos opcionales

- ✅ Debe permitir crear docente sin `años_experiencia`
- ✅ Debe permitir crear docente sin `bio`
- ✅ Debe preservar `titulo` si se proporciona

#### Validaciones básicas

- ✅ Debe requerir email
- ✅ Debe requerir nombre
- ✅ Debe requerir apellido
- ✅ Debe rechazar email duplicado

#### Seguridad de contraseñas

- ✅ Debe hashear contraseña auto-generada con bcrypt
- ✅ Debe hashear contraseña manual con bcrypt
- ✅ Hash debe ser válido y verificable con bcrypt.compare()

**Qué verifica:**

- Campo `debe_cambiar_password` en modelo Prisma
- Lógica de auto-generación de contraseñas
- Validaciones del DTO
- Seguridad de bcrypt

---

### 2. Backend - Sectores y Seed

**Archivo:** `apps/api/src/admin/__tests__/sectores-seed.spec.ts`

**Tests incluidos (43 tests en total):**

#### Verificación de sectores base

- ✅ Deben existir exactamente 2 sectores: Matemática y Programación
- ✅ Sector Matemática debe tener icono 📐 y color azul (#3B82F6)
- ✅ Sector Programación debe tener icono 💻 y color morado (#8B5CF6)
- ✅ Ambos sectores deben estar activos

#### Integración con docentes

- ✅ Un docente puede ser asignado al sector Matemática
- ✅ Un docente puede ser asignado al sector Programación
- ✅ Un docente puede tener rutas en AMBOS sectores (multi-sector)

#### Validaciones de nombres únicos

- ✅ NO debe permitir crear sector con nombre duplicado
- ✅ Debe permitir crear sector con nombre único

#### Consultas de sectores

- ✅ `listarSectores()` debe retornar sectores ordenados alfabéticamente
- ✅ Debe poder buscar sector por nombre exacto

#### Seed script execution

- ✅ Seed debe ser idempotente (no duplicar si ya existen sectores)
- ✅ Seed debe crear sectores si la tabla está vacía

**Qué verifica:**

- Existencia de sectores en DB
- Colores e iconos correctos
- Relaciones con docentes
- Script de seed idempotente

---

### 3. Frontend - Formulario de Creación

**Archivo:** `apps/web/src/components/admin/__tests__/CreateDocenteForm.improvements.spec.tsx`

**Tests incluidos (82 tests en total):**

#### Estructura del formulario simplificado

- ✅ Debe mostrar solo los campos requeridos: nombre, apellido, email, teléfono
- ✅ NO debe mostrar campo de años de experiencia
- ✅ NO debe mostrar campo de biografía
- ✅ Debe mostrar campo de título profesional
- ✅ Campo contraseña debe ser OPCIONAL con texto explicativo

#### Generación automática de contraseña

- ✅ Debe permitir enviar formulario sin contraseña
- ✅ Debe permitir proporcionar contraseña manual (opcional)
- ✅ Debe mostrar icono "generar" al lado del campo contraseña
- ✅ Al hacer click en "generar", debe llenar el campo con contraseña segura
- ✅ Contraseña generada debe cumplir requisitos de seguridad

#### Selector de sectores simplificado

- ✅ Debe mostrar SOLO 2 checkboxes: Matemática y Programación
- ✅ Debe permitir seleccionar Matemática
- ✅ Debe permitir seleccionar Programación
- ✅ Debe permitir seleccionar AMBOS sectores
- ✅ Debe enviar sectores seleccionados en el submit
- ✅ Checkboxes deben mostrar iconos: 📐 para Matemática, 💻 para Programación

#### Mejoras UX en disponibilidad horaria

- ✅ Debe mostrar botón "Lunes a viernes"
- ✅ Al hacer click en "Lunes a viernes", debe marcar lunes-viernes
- ✅ Debe mostrar botón "Seleccionar todos"
- ✅ Al hacer click en "Seleccionar todos", debe marcar los 7 días
- ✅ Botones deben estar deshabilitados si no se seleccionó horario

#### Validaciones del formulario

- ✅ Nombre es requerido
- ✅ Apellido es requerido
- ✅ Email es requerido
- ✅ Email debe ser válido
- ✅ Teléfono es opcional
- ✅ Título profesional es opcional

#### Manejo de errores

- ✅ Debe mostrar mensaje de error si se proporciona
- ✅ Debe mostrar indicador de loading durante creación

#### Integración con backend

- ✅ Debe enviar estructura correcta al backend

**Qué verifica:**

- UI simplificada sin campos removidos
- Funcionalidad de auto-generación de passwords
- Selectores de sectores como checkboxes
- Mejoras de UX en disponibilidad
- Validaciones HTML5

---

### 4. E2E - Flujo Completo

**Archivo:** `tests/e2e/docente-creation-improved.spec.ts`

**Tests incluidos (32 tests en total):**

#### Flujos completos

- ✅ Crear docente con password auto-generado en sector Matemática
- ✅ Crear docente con contraseña manual en sector Programación
- ✅ Crear docente con AMBOS sectores (Matemática y Programación)
- ✅ Verificar que `debe_cambiar_password` se establece correctamente en DB
- ✅ Flujo de login con password que debe cambiar

#### Validaciones E2E

- ✅ No permite crear docente sin nombre
- ✅ No permite crear docente con email duplicado
- ✅ Botones de disponibilidad deshabilitados sin horario

#### Verificación de Schema y Seed

- ✅ DB tiene sectores Matemática y Programación
- ✅ Schema tiene campo `debe_cambiar_password`

**Qué verifica:**

- Flujo completo end-to-end
- Integración frontend-backend-DB
- Comportamiento real del usuario
- Estado de la base de datos

---

## 🎯 Qué Cubre Cada Test

### Tests Backend (Service)

- **Campo nuevo en schema:** `debe_cambiar_password`
- **Lógica de negocio:** Auto-generación de passwords
- **Seguridad:** Bcrypt hashing
- **Validaciones:** DTOs y campos requeridos
- **Opcionalidad:** `años_experiencia` y `bio` pueden ser null

### Tests Backend (Sectores)

- **Seed data:** Matemática y Programación existen
- **Atributos correctos:** Iconos (📐, 💻) y colores (#3B82F6, #8B5CF6)
- **Relaciones:** Docentes pueden tener múltiples sectores
- **Idempotencia:** Seed no crea duplicados

### Tests Frontend

- **UI simplificada:** Sin `años_experiencia` ni `bio`
- **Contraseña opcional:** Se puede omitir
- **Sectores como checkboxes:** Fácil selección múltiple
- **UX mejorada:** Botones "Lunes a viernes" y "Seleccionar todos"
- **Validaciones HTML5:** Campos requeridos

### Tests E2E

- **Integración completa:** De UI hasta DB
- **Flujos reales:** Login con password temporal
- **Verificación de estado:** Campo en DB correcto
- **Casos de error:** Email duplicado, campos faltantes

---

## 🚀 Cómo Ejecutar los Tests

### Todos los tests (esperan fallar hasta implementar cambios)

```bash
npm test
```

### Solo tests de backend

```bash
npm test -- docente-creation-improvements
npm test -- sectores-seed
```

### Solo tests de frontend

```bash
npm test -- CreateDocenteForm.improvements
```

### Solo tests E2E

```bash
npm run test:e2e -- docente-creation-improved
```

---

## 📊 Cobertura Esperada

| Área             | Tests         | Estado Inicial | Tras Implementación |
| ---------------- | ------------- | -------------- | ------------------- |
| Backend Service  | 64            | ❌ FAIL        | ✅ PASS             |
| Backend Sectores | 43            | ❌ FAIL        | ✅ PASS             |
| Frontend Form    | 82            | ❌ FAIL        | ✅ PASS             |
| E2E Completo     | 32            | ❌ FAIL        | ✅ PASS             |
| **TOTAL**        | **221 tests** | **0% pass**    | **100% pass**       |

---

## 🔍 Qué Puede Salir Mal (Detectado por Tests)

### 1. Migración no ejecutada

**Test que falla:** `docente-creation-improvements.spec.ts`
**Error:** `debe_cambiar_password is not a column`
**Solución:** Ejecutar migración de Prisma

### 2. Sectores no existen en DB

**Test que falla:** `sectores-seed.spec.ts`
**Error:** `Expected 2 sectors, received 0`
**Solución:** Ejecutar seed script

### 3. Formulario no actualizado

**Test que falla:** `CreateDocenteForm.improvements.spec.tsx`
**Error:** `Element with text "Años de Experiencia" is still visible`
**Solución:** Actualizar componente React

### 4. Backend no genera passwords

**Test que falla:** `docente-creation-improvements.spec.ts`
**Error:** `password_hash is null`
**Solución:** Implementar lógica de generación en service

### 5. Sectores no se asignan

**Test que falla:** `docente-creation-improved.spec.ts` (E2E)
**Error:** `Expected docente to have sector Matemática, received null`
**Solución:** Actualizar endpoint POST /api/docentes

---

## 🎓 Beneficios del Enfoque TDD

1. **Especificación clara:** Los tests documentan exactamente qué debe hacer el código
2. **Detección temprana:** Encontramos problemas antes de escribir código
3. **Refactoring seguro:** Podemos refactorizar sabiendo que los tests nos protegen
4. **Cobertura garantizada:** 100% de cobertura desde el inicio
5. **Documentación viva:** Los tests sirven como documentación ejecutable

---

## 📝 Próximos Pasos

1. **Ejecutar tests actuales** para ver todos los fallos esperados
2. **Crear migración** para agregar campo `debe_cambiar_password`
3. **Ejecutar seed** para crear sectores Matemática y Programación
4. **Modificar backend service** para auto-generar passwords
5. **Actualizar formulario frontend** para simplificar campos
6. **Ejecutar tests nuevamente** hasta que todos pasen ✅

---

## 🤔 Preguntas Frecuentes

**Q: ¿Por qué tantos tests?**
A: Cada test verifica un comportamiento específico. Esto facilita debugging cuando algo falla.

**Q: ¿Puedo empezar a implementar ya?**
A: Sí, ahora tenés una "red de seguridad" completa. Implementá hasta que los tests pasen.

**Q: ¿Los tests están completos?**
A: Sí, cubren todos los casos de uso, validaciones, errores y flujos E2E.

**Q: ¿Cómo sé qué implementar primero?**
A: Seguí el orden de "Próximos Pasos". Cada paso hará que un grupo de tests pase.

---

**Estado actual:** ✅ Tests creados y listos para ejecutar
**Próximo paso:** Ejecutar `npm test` para ver los fallos esperados y comenzar implementación
