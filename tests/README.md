# Tests - Mateatletas Ecosystem

Scripts automatizados de testing para validar las verticales implementadas.

## 📂 Estructura

```
tests/
└── scripts/
    ├── test-integration-full.sh    # Test completo end-to-end
    ├── test-docentes.sh           # Slice #4: Docentes
    ├── test-catalogo.sh           # Slice #5: Catálogo
    ├── test-clases-simple.sh      # Slice #7: Clases
    ├── test-clases.sh             # Slice #7: Clases (completo)
    ├── test-pagos-simple.sh       # Slice #6: Pagos
    ├── test-estudiantes.sh        # Slice #2: Estudiantes
    ├── test-equipos.sh            # Slice #3: Equipos
    └── test-error-handling.sh     # Manejo de errores
```

## 🚀 Prerequisitos

Antes de ejecutar los tests, asegúrate de:

1. **Servidor corriendo**

   ```bash
   cd apps/api
   npm run start:dev
   ```

2. **PostgreSQL activo**

   ```bash
   docker start mateatletas-postgres
   ```

3. **Seeds ejecutados**
   ```bash
   cd apps/api
   npx prisma db seed
   ```

## ▶️ Ejecutar Tests

### Test de Integración Completo

Este test ejecuta un flujo end-to-end completo simulando un usuario real:

```bash
cd /home/alexis/Documentos/Mateatletas-Ecosystem
./tests/scripts/test-integration-full.sh
```

**Flujo del test:**

1. Registro de tutor
2. Autenticación y obtención de token
3. Creación de 2 estudiantes
4. Creación de equipo y asignación
5. Registro de docente
6. Consulta de catálogo
7. Inicio de suscripción (MercadoPago mock)
8. Activación de membresía
9. Consulta de rutas curriculares
10. Programación de clase
11. Reserva de cupo
12. Verificación de cupos ocupados

**Tiempo estimado:** ~5 segundos

### Tests Individuales

#### Slice #2: Estudiantes

```bash
./tests/scripts/test-estudiantes.sh
```

- Registro de tutor
- CRUD completo de estudiantes
- Ownership validation
- Paginación

#### Slice #3: Equipos

```bash
./tests/scripts/test-equipos.sh
```

- Creación de equipos
- Asignación de estudiantes
- Sistema de gamificación

#### Slice #4: Docentes

```bash
./tests/scripts/test-docentes.sh
```

- Registro público de docente
- Login con role "docente"
- Consulta de perfil
- Actualización de perfil
- Lista pública

#### Slice #5: Catálogo

```bash
./tests/scripts/test-catalogo.sh
```

- Listado de productos
- Filtros por tipo (Suscripción, Curso, Recurso)
- Creación de productos
- Actualización

#### Slice #6: Pagos (MercadoPago)

```bash
./tests/scripts/test-pagos-simple.sh
```

- Consulta de estado de membresía
- Creación de preferencias de pago
- Activación de membresía (mock)
- Compra de cursos
- Webhook de MercadoPago

#### Slice #7: Clases

```bash
./tests/scripts/test-clases-simple.sh
```

- Listado de rutas curriculares (6 rutas)
- Programación de clases
- Reserva de cupos
- Incremento de cupos_ocupados
- Cancelación de reservas
- Registro de asistencia

### Test de Manejo de Errores

```bash
./tests/scripts/test-error-handling.sh
```

- Validación de DTOs
- Manejo de recursos no encontrados
- Validación de ownership
- Errores de autenticación

## 📊 Resultados Esperados

Todos los tests deben terminar con:

```
✅ INTEGRACIÓN COMPLETA: TODOS LOS TESTS PASARON
```

O para tests individuales:

```
✅ Tests de [Módulo] completados!
```

## 🐛 Troubleshooting

### Error: "Connection refused"

**Causa:** El servidor no está corriendo
**Solución:**

```bash
cd apps/api
npm run start:dev
```

### Error: "Can't reach database"

**Causa:** PostgreSQL no está activo
**Solución:**

```bash
docker start mateatletas-postgres
```

### Error: "Producto no encontrado"

**Causa:** Los seeds no se han ejecutado
**Solución:**

```bash
cd apps/api
npx prisma db seed
```

### Tests fallan intermitentemente

**Causa:** Race conditions o estado de DB inconsistente
**Solución:**

```bash
cd apps/api
npx prisma migrate reset
npx prisma db seed
```

## 📝 Agregar Nuevos Tests

### Template de Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:3001/api"

echo "============================================="
echo "🧪 TEST: [Nombre del Test]"
echo "============================================="

# 1. Setup - Crear usuario de prueba
TEST_EMAIL="test.$RANDOM@mateatletas.com"

# 2. Autenticación
echo -e "\n1️⃣ Autenticando..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"Test123!\"}")

TOKEN=$(echo $LOGIN | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
  echo "✅ Autenticado"
else
  echo "❌ Error en autenticación"
  exit 1
fi

# 3. Ejecutar tests...

# 4. Resumen
echo -e "\n============================================="
echo "✅ Tests completados!"
echo "============================================="
```

### Hacer el script ejecutable

```bash
chmod +x tests/scripts/tu-nuevo-test.sh
```

## 🔍 Debugging

### Ver requests detallados

Agrega `-v` al comando curl:

```bash
curl -v -X POST "$BASE_URL/endpoint" ...
```

### Ver JSON formateado

Usa `jq` para formatear respuestas:

```bash
curl -s "$BASE_URL/endpoint" | jq '.'
```

### Logs del servidor

Mientras corren los tests, observa los logs del servidor:

```bash
cd apps/api
npm run start:dev
```

## 📈 Métricas de Cobertura

| Slice          | Tests       | Cobertura | Estado |
| -------------- | ----------- | --------- | ------ |
| #1 Auth        | 4 endpoints | 100%      | ✅     |
| #2 Estudiantes | 7 endpoints | 100%      | ✅     |
| #3 Equipos     | 7 endpoints | 100%      | ✅     |
| #4 Docentes    | 7 endpoints | 100%      | ✅     |
| #5 Catálogo    | 7 endpoints | 100%      | ✅     |
| #6 Pagos       | 7 endpoints | 100%      | ✅     |
| #7 Clases      | 9 endpoints | 100%      | ✅     |

**Total:** 48 endpoints testeados

## 📚 Documentación Relacionada

- [Resumen de Testing](../docs/testing/TESTING_SUMMARY.md)
- [API Specs](../docs/api-specs/)
- [Guía de Desarrollo](../docs/development/DEVELOPMENT.md)

---

**Última actualización:** 13 de Octubre, 2025
