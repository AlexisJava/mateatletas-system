# 📋 Formato Estándar de Respuestas API

**Fecha**: 2025-11-12
**Estado**: ✅ Implementado
**Versión**: 1.0

---

## 🎯 Objetivo

Todas las respuestas de la API siguen un formato consistente para facilitar el manejo en el frontend y eliminar la necesidad de validaciones defensivas en cada componente.

---

## 📐 Formatos de Respuesta

### 1. Respuesta Simple (Objeto)

**Formato:**
```json
{
  "data": {
    "id": "123",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  },
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  },
  "message": "Usuario obtenido exitosamente"
}
```

**Uso:**
- GET /api/estudiantes/:id
- POST /api/auth/login
- PUT /api/estudiantes/:id

### 2. Respuesta con Array

**Formato:**
```json
{
  "data": [
    { "id": "1", "nombre": "Estudiante 1" },
    { "id": "2", "nombre": "Estudiante 2" },
    { "id": "3", "nombre": "Estudiante 3" }
  ],
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

**Uso:**
- GET /api/estudiantes
- GET /api/clases
- GET /api/docentes

### 3. Respuesta Paginada

**Formato:**
```json
{
  "data": [
    { "id": "1", "nombre": "Item 1" },
    { "id": "2", "nombre": "Item 2" }
  ],
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

**Uso:**
- GET /api/estudiantes?page=1&limit=10
- GET /api/clases?page=2&limit=20

**Campos de metadata:**
- `total`: Total de elementos disponibles en la base de datos
- `page`: Página actual (1-indexed)
- `limit`: Cantidad de elementos por página
- `totalPages`: Total de páginas disponibles (`Math.ceil(total / limit)`)
- `timestamp`: Timestamp ISO 8601 de cuándo se generó la respuesta

### 4. Respuesta Vacía

**Formato:**
```json
{
  "data": null,
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

**Uso:**
- DELETE /api/estudiantes/:id (sin cuerpo de respuesta)
- Operaciones que no retornan datos

### 5. Respuesta Primitiva

**Formato:**
```json
{
  "data": 42,
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

**Uso:**
- GET /api/estudiantes/count
- GET /api/clases/:id/asistencias/count

---

## ❌ Formato de Errores

Las respuestas de error **NO** siguen el formato `{ data, metadata }`. En su lugar, utilizan el formato estándar manejado por `AllExceptionsFilter`:

### Error de Validación (400)

```json
{
  "statusCode": 400,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "path": "/api/estudiantes",
  "method": "POST",
  "errorId": "abc-123-def",
  "message": [
    "email: email must be a valid email",
    "nombre: nombre should not be empty"
  ],
  "error": "Bad Request"
}
```

### Error de Autorización (401)

```json
{
  "statusCode": 401,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "path": "/api/estudiantes",
  "method": "GET",
  "message": "Token JWT inválido o no proporcionado",
  "error": "Unauthorized"
}
```

### Error de Permisos (403)

```json
{
  "statusCode": 403,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "path": "/api/admin/usuarios",
  "method": "GET",
  "message": "No tienes permisos para acceder a este recurso",
  "error": "Forbidden"
}
```

### Error de Recurso No Encontrado (404)

```json
{
  "statusCode": 404,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "path": "/api/estudiantes/123",
  "method": "GET",
  "message": "Estudiante no encontrado",
  "error": "Not Found"
}
```

### Error Interno del Servidor (500)

```json
{
  "statusCode": 500,
  "timestamp": "2025-11-12T10:30:00.000Z",
  "path": "/api/estudiantes",
  "method": "POST",
  "errorId": "xyz-789-abc",
  "message": "Error interno del servidor",
  "error": "Internal Server Error"
}
```

---

## 🔧 Implementación Técnica

### TransformResponseInterceptor

El interceptor global `TransformResponseInterceptor` procesa todas las respuestas exitosas (status 2xx) y las envuelve automáticamente en el formato estándar.

**Lógica:**
1. Si la respuesta ya tiene propiedad `data` → No re-envolver (ya está en formato correcto)
2. Si no → Envolver en `{ data, metadata: { timestamp } }`
3. Asegurar que siempre exista `metadata.timestamp`

**Ventajas:**
- ✅ Transformación automática, no requiere cambios en controladores
- ✅ Respeta respuestas ya formateadas manualmente
- ✅ No procesa respuestas de error (las maneja AllExceptionsFilter)
- ✅ Garantiza formato consistente en toda la API

### Interfaces TypeScript

```typescript
// Respuesta estándar
interface ApiResponse<T> {
  data: T;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
  message?: string;
}

// Respuesta paginada
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    timestamp: string;
  };
}
```

---

## 📚 Ejemplos por Endpoint

### Auth

#### POST /api/auth/login
```json
{
  "data": {
    "user": {
      "id": "user-123",
      "email": "juan@example.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "role": "Tutor"
    }
  },
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  },
  "message": "Login exitoso"
}
```

#### GET /api/auth/profile
```json
{
  "data": {
    "id": "user-123",
    "email": "juan@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "role": "Tutor"
  },
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

### Estudiantes

#### GET /api/estudiantes
```json
{
  "data": [
    {
      "id": "est-1",
      "nombre": "María",
      "apellido": "González",
      "edad": 10
    },
    {
      "id": "est-2",
      "nombre": "Pedro",
      "apellido": "Martínez",
      "edad": 11
    }
  ],
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

#### GET /api/estudiantes?page=1&limit=10
```json
{
  "data": [
    { "id": "est-1", "nombre": "María" },
    { "id": "est-2", "nombre": "Pedro" }
  ],
  "metadata": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

#### GET /api/estudiantes/:id
```json
{
  "data": {
    "id": "est-1",
    "nombre": "María",
    "apellido": "González",
    "edad": 10,
    "tutor": {
      "id": "tutor-1",
      "nombre": "Juan Pérez"
    }
  },
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

### Clases

#### GET /api/clases
```json
{
  "data": [
    {
      "id": "clase-1",
      "titulo": "Matemáticas Básicas",
      "fecha": "2025-11-15T10:00:00.000Z",
      "docente": {
        "id": "doc-1",
        "nombre": "Prof. García"
      }
    }
  ],
  "metadata": {
    "timestamp": "2025-11-12T10:30:00.000Z"
  }
}
```

---

## 🧪 Tests

### Unit Tests

```typescript
describe('TransformResponseInterceptor', () => {
  it('debe envolver respuesta simple', () => {
    const input = { id: '123', nombre: 'Juan' };
    const output = interceptor.transform(input);

    expect(output).toEqual({
      data: input,
      metadata: {
        timestamp: expect.any(String)
      }
    });
  });

  it('debe dejar respuesta ya formateada', () => {
    const input = {
      data: { id: '123' },
      metadata: { timestamp: '2025-11-12T10:30:00.000Z' }
    };

    const output = interceptor.transform(input);
    expect(output).toEqual(input);
  });
});
```

### Integration Tests (E2E)

```typescript
describe('API Response Format (E2E)', () => {
  it('GET /api/estudiantes debe retornar formato estándar', () => {
    return request(app.getHttpServer())
      .get('/api/estudiantes')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('metadata');
        expect(res.body.metadata).toHaveProperty('timestamp');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('POST /api/auth/login debe retornar formato estándar', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body).toHaveProperty('metadata');
      });
  });
});
```

---

## 📖 Guía para Desarrolladores

### Backend (NestJS)

**No es necesario hacer nada especial en controladores**. El interceptor global envuelve automáticamente todas las respuestas:

```typescript
@Get()
async findAll() {
  return this.estudiantesService.findAll();
  // El interceptor envuelve automáticamente en { data, metadata }
}
```

**Si querés control explícito** (opcional):

```typescript
@Get()
async findAll(): Promise<ApiResponse<Estudiante[]>> {
  const estudiantes = await this.estudiantesService.findAll();
  return {
    data: estudiantes,
    metadata: {
      timestamp: new Date().toISOString(),
    },
    message: 'Estudiantes obtenidos exitosamente'
  };
}
```

### Frontend (React/Next.js)

**Antes (formato inconsistente):**
```typescript
// Tenías que adivinar el formato
const estudiantes = await fetch('/api/estudiantes').then(r => r.json());
// ¿Es array directo? ¿O { data: [] }? ¿O { estudiantes: [] }?
const list = Array.isArray(estudiantes)
  ? estudiantes
  : estudiantes.data || estudiantes.estudiantes || [];
```

**Ahora (formato consistente):**
```typescript
const response = await fetch('/api/estudiantes').then(r => r.json());
const estudiantes = response.data; // ✅ Siempre es response.data
```

**Con TypeScript:**
```typescript
interface ApiResponse<T> {
  data: T;
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
  message?: string;
}

const response: ApiResponse<Estudiante[]> = await fetch('/api/estudiantes')
  .then(r => r.json());

const estudiantes = response.data; // ✅ Type-safe
```

---

## ✅ Checklist de Migración

- [x] Interfaces creadas (`api-response.interface.ts`)
- [x] Interceptor implementado (`transform-response.interceptor.ts`)
- [x] Interceptor aplicado globalmente en `main.ts`
- [x] Documentación creada (`API-RESPONSE-FORMAT.md`)
- [ ] Tests unitarios implementados
- [ ] Tests E2E implementados
- [ ] Frontend actualizado para consumir nuevo formato

---

## 🔄 Compatibilidad con Código Existente

El interceptor es **backward compatible**:

- ✅ Respuestas que ya usan `{ data }` NO se re-envuelven
- ✅ Respuestas directas (objetos/arrays) se envuelven automáticamente
- ✅ No rompe controladores existentes
- ✅ No afecta respuestas de error (las maneja AllExceptionsFilter)

---

## 📊 Beneficios

| Antes | Ahora |
|-------|-------|
| ❌ Formato inconsistente | ✅ Formato estándar `{ data, metadata }` |
| ❌ Validaciones defensivas en frontend | ✅ Confianza en formato consistente |
| ❌ Código duplicado para manejar formatos | ✅ Código limpio y simple |
| ❌ Difícil de tipar con TypeScript | ✅ Type-safe con interfaces |
| ❌ Confusión sobre estructura de respuesta | ✅ Documentación clara |

---

**Autor**: Claude Code (Anthropic)
**Reviewers**: Equipo Mateatletas
**Aprobado**: [Pendiente]
