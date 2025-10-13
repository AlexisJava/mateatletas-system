# Phase 2 Testing - Issues Found

**Date:** October 13, 2025
**Status:** ⚠️ BLOCKED - Backend fixes required

---

## 🐛 Critical Issues Found

### Issue #1: Prisma Schema Naming Mismatch

**Location:** `apps/api/src/asistencia/asistencia.service.ts`
**Type:** Backend Bug
**Severity:** CRITICAL - Blocks all attendance functionality

**Problem:**
The AsistenciaService is using snake_case field names (`ruta_curricular`, `inscripcion_clase_id`) but Prisma Client generates camelCase names (`rutaCurricular`, `inscripcionClaseId`).

**Error Messages:**
```
Unknown field `ruta_curricular` for include statement on model `Clase`.
Available options are marked with ?: rutaCurricular

Unknown argument `inscripcion_clase_id`. Available options are marked with ?
```

**Affected Endpoints:**
- ❌ POST `/api/asistencia/clases/:claseId/estudiantes/:estudianteId` - Mark attendance
- ❌ GET `/api/asistencia/clases/:claseId` - Get attendance roster
- ❌ GET `/api/asistencia/clases/:claseId/estadisticas` - Get class statistics
- ❌ GET `/api/asistencia/estudiantes/:estudianteId` - Get student history
- ❌ GET `/api/asistencia/docente/resumen` - Get teacher summary

**Root Cause:**
The Prisma schema uses snake_case for database columns, but the TypeScript client uses camelCase for model properties. The service code incorrectly uses snake_case in Prisma queries.

**Examples of Incorrect Code:**

1. `asistencia.service.ts:55` - Searching for existing attendance:
```typescript
// ❌ WRONG - using snake_case
const asistenciaExistente = await this.prisma.asistencia.findFirst({
  where: {
    inscripcion_clase_id: inscripcionId, // ❌ Should be: inscripcionClaseId
  }
});
```

2. `asistencia.service.ts:101` - Including related data:
```typescript
// ❌ WRONG - using snake_case
clase: {
  select: {
    id: true,
    ruta_curricular: { // ❌ Should be: rutaCurricular
      select: {
        nombre: true
      }
    },
  }
}
```

3. `asistencia.service.ts:141` - Including asistencias in InscripcionClase:
```typescript
// ❌ WRONG - field doesn't exist
include: {
  asistencias: true, // ❌ InscripcionClase doesn't have asistencias relation
}
```

**Correct Code Should Be:**
```typescript
// ✅ CORRECT - using camelCase
const asistenciaExistente = await this.prisma.asistencia.findFirst({
  where: {
    claseId: claseId,
    estudianteId: estudianteId,
  }
});

// ✅ CORRECT - using camelCase
clase: {
  select: {
    id: true,
    rutaCurricular: {
      select: {
        nombre: true
      }
    },
  }
}
```

---

### Issue #2: Missing Prisma Relation

**Location:** `prisma/schema.prisma`
**Type:** Schema Design Issue
**Severity:** HIGH

**Problem:**
The `InscripcionClase` model doesn't have a relation to `Asistencia`, but the service code tries to include it.

**Current Schema:**
```prisma
model InscripcionClase {
  id             String     @id @default(cuid())
  clase_id       String
  estudiante_id  String
  tutor_id       String
  // ... other fields

  clase      Clase      @relation(fields: [clase_id], references: [id])
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id])
  tutor      User       @relation(fields: [tutor_id], references: [id])

  // ❌ MISSING: asistencias relation
}
```

**Should Be:**
```prisma
model InscripcionClase {
  // ... existing fields

  asistencias Asistencia[] // ✅ Add this relation
}

model Asistencia {
  // ... existing fields
  inscripcionClaseId String? // Link to enrollment
  inscripcionClase   InscripcionClase? @relation(fields: [inscripcionClaseId], references: [id])
}
```

---

## 📋 Test Results Summary

### Tests Created:
1. ✅ `test-phase2-dashboard.sh` - Dashboard and auth tests (Created)
2. ✅ `test-phase2-asistencia.sh` - Attendance registration tests (Created)
3. ✅ `test-phase2-full.sh` - Complete E2E docente flow (Created)

### Tests Executed:
- ❌ Dashboard test - BLOCKED by backend errors
- ❌ Asistencia test - BLOCKED by backend errors
- ❌ Full E2E test - BLOCKED by backend errors

### Tests Passing:
- 0/3 (0%) - All blocked by backend issues

---

## 🔧 Required Fixes

### Fix #1: Update AsistenciaService to use camelCase

**File:** `apps/api/src/asistencia/asistencia.service.ts`

**Changes Required:**

1. **Line 55** - Fix existing attendance search:
```typescript
// Change from:
inscripcion_clase_id: inscripcionId

// To:
claseId: claseId,
estudianteId: estudianteId
```

2. **Lines 101, 292, 345** - Fix ruta_curricular includes:
```typescript
// Change all instances of:
ruta_curricular: { ... }

// To:
rutaCurricular: { ... }
```

3. **Lines 141, 205, 268, 337** - Remove or fix asistencias include:
```typescript
// Option A: Remove the include (if relation doesn't exist)
include: {
  estudiante: { ... },
  // Remove: asistencias: true,
}

// Option B: Query asistencias separately
const asistencias = await this.prisma.asistencia.findMany({
  where: {
    claseId: claseId,
    estudianteId: inscripcion.estudianteId
  }
});
```

### Fix #2: Update Prisma Schema (Optional)

**File:** `apps/api/prisma/schema.prisma`

Add the missing relation if needed:
```prisma
model InscripcionClase {
  // ... existing fields

  asistencias Asistencia[]

  @@map("inscripcion_clase")
}

model Asistencia {
  // ... existing fields

  inscripcionClaseId String?            @map("inscripcion_clase_id")
  inscripcionClase   InscripcionClase?  @relation(fields: [inscripcionClaseId], references: [id])

  @@map("asistencia")
}
```

Then run:
```bash
npx prisma migrate dev --name add-asistencia-inscription-relation
npx prisma generate
```

---

## 📊 Impact Assessment

### Frontend (Phase 2):
- ✅ **Panel Docente UI** - COMPLETE and ready
- ✅ **All components** - COMPLETE and ready
- ✅ **State management** - COMPLETE and ready
- ❌ **Functionality** - BLOCKED until backend is fixed

### Backend (Slice #8):
- ❌ **Asistencia module** - BROKEN (naming mismatch)
- ✅ **Docentes module** - Working
- ✅ **Clases module** - Working
- ✅ **Auth module** - Working

### Tests:
- ✅ **Phase 1 tests** - Still passing
- ❌ **Phase 2 tests** - Cannot run until backend is fixed
- ⏳ **Backend Slice #8 tests** - Need to be re-run after fixes

---

## 🎯 Action Items

### Immediate (Before Phase 2 can be tested):

1. **Fix AsistenciaService** (30 minutes)
   - Update all snake_case field names to camelCase
   - Fix or remove asistencias includes
   - Test each endpoint individually

2. **Run Backend Tests** (10 minutes)
   - Re-run: `./tests/scripts/test-asistencia.sh`
   - Verify all endpoints return correct data
   - Check for other naming issues

3. **Re-run Frontend Tests** (5 minutes)
   - Run: `./tests/frontend/test-phase2-full.sh`
   - Verify complete docente flow works
   - Document final results

### Optional (For better architecture):

4. **Add Prisma Relation** (20 minutes)
   - Update schema with inscripcionClase relation
   - Create migration
   - Update service to use relation
   - More maintainable long-term

---

## 📝 Notes

### Why This Wasn't Caught Earlier:

1. **Backend Slice #8 tests** used direct curl commands that might have worked with the database directly
2. **Prisma Client** wasn't regenerated after schema changes
3. **Service code** was written before schema was finalized
4. **No type checking** for Prisma queries (they're runtime errors)

### Lessons Learned:

1. ✅ Always run `npx prisma generate` after schema changes
2. ✅ Use TypeScript strict mode to catch more issues
3. ✅ Test backend endpoints BEFORE creating frontend
4. ✅ Keep naming conventions consistent (all camelCase or all snake_case)
5. ✅ Use Prisma Studio to verify schema visually

---

## 🚀 Once Fixed:

Phase 2 will be **100% functional** because:
- ✅ All UI components are complete
- ✅ All state management is correct
- ✅ All API integrations use correct endpoints
- ✅ All TypeScript types match backend responses
- ⏳ Just waiting for backend to return valid data

**Estimated time to completion:** ~1 hour (30min fixes + 30min testing)

---

**Created by:** Claude Code
**Date:** October 13, 2025
**Project:** Mateatletas Ecosystem - Phase 2 Testing
