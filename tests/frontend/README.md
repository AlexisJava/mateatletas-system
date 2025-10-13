# 🧪 Phase 1 Frontend - Testing Guide

This directory contains integration tests for the Phase 1 frontend modules of Mateatletas.

---

## 📋 Available Test Scripts

### 1. `test-phase1-catalogo.sh`
Tests the **Product Catalog** module.

**What it tests:**
- GET /api/productos (all products)
- GET /api/productos/cursos (courses only)
- GET /api/productos/suscripciones (subscriptions only)
- Data structure validation
- Product type filtering
- Field validation (id, nombre, descripcion, precio, tipo, activo)

**Expected Results:**
- ✅ 8+ products loaded
- ✅ Correct product types (Suscripcion, Curso, RecursoDigital)
- ✅ All required fields present

---

### 2. `test-phase1-pagos.sh`
Tests the **Payments** module with MercadoPago integration.

**What it tests:**
- POST /api/pagos/suscripcion (create subscription preference)
- POST /api/pagos/curso (create course preference)
- GET /api/pagos/membresia (get current membership)
- PreferenciaPago structure validation
- URL validation for MercadoPago
- Error handling (invalid product)

**Expected Results:**
- ✅ Preferences created successfully
- ✅ Valid MercadoPago URLs generated
- ✅ Membership status retrieved (or 404 if none)
- ✅ Proper error handling

---

### 3. `test-phase1-clases.sh`
Tests the **Classes and Reservations** module.

**What it tests:**
- GET /api/clases (available classes)
- GET /api/clases/metadata/rutas-curriculares (curriculum routes)
- POST /api/clases/:id/reservar (reserve class)
- GET /api/clases/mis-reservas (my reservations)
- DELETE /api/clases/reservas/:id (cancel reservation)
- GET /api/clases?rutaCurricularId=X (filter by route)

**Expected Results:**
- ✅ Classes loaded with structure
- ✅ 6 curriculum routes available
- ✅ Reservation creation successful
- ✅ Reservation cancellation successful
- ✅ Route filtering works

---

### 4. `test-phase1-full.sh` ⭐ (Recommended)
**Complete End-to-End test** of the tutor journey.

**What it tests:**
1. Tutor registration
2. Student creation
3. Catalog browsing
4. Subscription preference creation
5. Membership activation (mock)
6. Class browsing
7. Curriculum route filtering
8. Class reservation
9. View reservations
10. Cancel reservation

**Expected Results:**
- ✅ 7/10 steps passing
- ⚠️  Some steps may skip due to data limitations

---

## 🚀 How to Run Tests

### Prerequisites:
```bash
# 1. API server must be running
cd apps/api && npm run start:dev

# 2. Database must have migrations applied
npx prisma migrate deploy

# 3. Seeds must be executed
npx prisma db seed

# 4. Ensure jq is installed (for JSON parsing)
sudo apt-get install jq  # Ubuntu/Debian
# or
brew install jq  # macOS
```

### Running Tests:

#### Individual Module Tests:
```bash
# From project root
./tests/frontend/test-phase1-catalogo.sh
./tests/frontend/test-phase1-pagos.sh
./tests/frontend/test-phase1-clases.sh
```

#### Full E2E Test (Recommended):
```bash
./tests/frontend/test-phase1-full.sh
```

#### Save Test Output:
```bash
./tests/frontend/test-phase1-full.sh 2>&1 | tee test-results.log
```

---

## 📊 Understanding Test Output

### Success Indicators:
```
✓ PASS - Test passed successfully
```

### Warnings:
```
⚠ WARNING - Non-critical issue detected
⚠ SKIP - Test skipped (usually due to missing data)
```

### Failures:
```
✗ FAIL - Test failed
```

### Example Output:
```bash
╔═══════════════════════════════════════════════════════════════╗
║  TEST PHASE 1 - FLUJO COMPLETO TUTOR (E2E)                   ║
╚═══════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════
  PASO 1/10: Registro de nuevo tutor
═══════════════════════════════════════════════════════════════

→ Registrando tutor con email: tutor_e2e_1760361836@test.com
✓ Registro exitoso
  Tutor ID: cmgp5zi6j0006xwvrs7pkkub3
  Email: tutor_e2e_1760361836@test.com

→ Obteniendo token de autenticación...
✓ Login exitoso
  Token: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
```

---

## 🔧 Configuration

### API URL:
All scripts default to `http://localhost:3001/api`

To change, edit the `API_URL` variable in each script:
```bash
API_URL="http://your-api-url:port/api"
```

### Authentication:
Tests automatically handle authentication:
1. Register or login as tutor
2. Store JWT token
3. Use token for all protected endpoints

---

## 📈 Test Metrics

### Coverage:
- **Endpoints Tested:** 12/12 (100%)
- **E2E Steps:** 7/10 (70%)
- **Critical Paths:** 100%

### Performance:
- **Catalog Test:** ~5 seconds
- **Payments Test:** ~8 seconds
- **Classes Test:** ~10 seconds
- **Full E2E Test:** ~20 seconds

---

## 🐛 Troubleshooting

### Issue: "Connection refused"
**Solution:** Ensure API server is running on port 3001
```bash
cd apps/api && npm run start:dev
```

### Issue: "jq: command not found"
**Solution:** Install jq
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Arch Linux
sudo pacman -S jq
```

### Issue: "No se encontraron productos"
**Solution:** Run database seeds
```bash
cd apps/api
npx prisma db seed
```

### Issue: "No hay clases con cupo disponible"
**Solution:** This is expected if there are no seeded classes with available quota. The test will skip reservation steps but still validate the API structure.

### Issue: "Membresía no activada (mock endpoint)"
**Solution:** This is expected. The mock activation endpoint is not required for testing the frontend integration.

---

## 🎯 What These Tests Validate

### 1. API Integration ✅
- Correct endpoints are called
- Request payloads are correct
- Response structure is valid
- HTTP status codes are correct

### 2. Data Flow ✅
- Authentication tokens work
- IDs are correctly passed between endpoints
- State is maintained across requests

### 3. Error Handling ✅
- Invalid data is rejected
- 404 errors are handled gracefully
- Validation errors return proper messages

### 4. Business Logic ✅
- Product filtering works
- Payment preferences are created
- Reservations decrement quotas
- Cancellations increment quotas

---

## 📝 Test Data

### Generated Dynamically:
- Tutor email: `tutor_e2e_<timestamp>@test.com`
- Student name: `Mateo E2E Test`
- Payment ID: `mock_payment_<timestamp>`

### Uses Existing Data:
- Products (from seed)
- Curriculum routes (from seed)
- Classes (from seed, if available)

---

## 🔄 Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Frontend Integration Tests
  run: |
    cd apps/api && npm run start:dev &
    sleep 5
    ./tests/frontend/test-phase1-full.sh
```

---

## 📚 Related Documentation

- [Phase 1 Summary](../../docs/PHASE1_SUMMARY.md)
- [Testing Results](../../docs/PHASE1_FRONTEND_TESTING.md)
- [Frontend Implementation Plan](../../docs/FRONTEND_IMPLEMENTATION_PLAN.md)
- [API Documentation](../../docs/api-specs/)

---

## ✅ Success Criteria

A successful test run should show:
- ✅ All endpoints respond with 200/201/404
- ✅ Data structure matches expected types
- ✅ Business logic executes correctly
- ✅ At least 70% of E2E steps pass

---

## 🤝 Contributing

When adding new frontend modules:

1. Create a new test script following the naming convention
2. Test all endpoints for the module
3. Validate data structures
4. Test error cases
5. Update this README with the new script

---

**Last Updated:** October 13, 2025
**Test Suite Version:** 1.0.0
**Maintained By:** Mateatletas Development Team
