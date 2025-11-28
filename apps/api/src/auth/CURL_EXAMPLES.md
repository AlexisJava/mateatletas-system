# Ejemplos de uso del API de Autenticación con cURL

Este documento contiene ejemplos prácticos de cómo usar los endpoints de autenticación con cURL.

## Configuración

Base URL del API: `http://localhost:3001/api`

## Endpoints Públicos

### 1. Registro de Nuevo Tutor

**Endpoint:** `POST /api/auth/register`

**Request:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@example.com",
    "password": "Test1234!",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "telefono": "+54911234567"
  }'
```

**Response (201 Created):**

```json
{
  "message": "Tutor registrado exitosamente",
  "user": {
    "id": "cmgnsdpah0000xwhuncx4ag4d",
    "email": "tutor@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "telefono": "+54911234567",
    "fecha_registro": "2025-10-12T14:15:18.087Z",
    "ha_completado_onboarding": false,
    "createdAt": "2025-10-12T14:15:18.089Z",
    "updatedAt": "2025-10-12T14:15:18.089Z"
  }
}
```

**Errores posibles:**

- **409 Conflict:** Email ya registrado
- **400 Bad Request:** Datos inválidos (contraseña débil, email inválido, etc.)

---

### 2. Login (Autenticación)

**Endpoint:** `POST /api/auth/login`

**Request:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@example.com",
    "password": "Test1234!"
  }'
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWduc2RwYWgwMDAweHdodW5jeDRhZzRkIiwiZW1haWwiOiJ0dXRvckBleGFtcGxlLmNvbSIsInJvbGUiOiJ0dXRvciIsImlhdCI6MTc2MDI3ODUyOSwiZXhwIjoxNzYwODgzMzI5fQ.-1-Dbj1cTJl5ci_Hofl8A9ocCFQIDyHGh0fAftcJ1jQ",
  "user": {
    "id": "cmgnsdpah0000xwhuncx4ag4d",
    "email": "tutor@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "telefono": "+54911234567",
    "fecha_registro": "2025-10-12T14:15:18.087Z",
    "ha_completado_onboarding": false
  }
}
```

**Errores posibles:**

- **401 Unauthorized:** Credenciales inválidas
- **400 Bad Request:** Datos inválidos

**Nota:** Guarda el `access_token` para usarlo en los endpoints protegidos.

---

## Endpoints Protegidos (Requieren JWT)

### 3. Obtener Perfil del Usuario

**Endpoint:** `GET /api/auth/profile`

**Headers requeridos:**

- `Authorization: Bearer <access_token>`

**Request:**

```bash
# Reemplaza TOKEN con el access_token recibido del login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**

```json
{
  "id": "cmgnsdpah0000xwhuncx4ag4d",
  "email": "tutor@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "telefono": "+54911234567",
  "fecha_registro": "2025-10-12T14:15:18.087Z",
  "ha_completado_onboarding": false,
  "createdAt": "2025-10-12T14:15:18.089Z",
  "updatedAt": "2025-10-12T14:15:18.089Z"
}
```

**Errores posibles:**

- **401 Unauthorized:** Token inválido o no proporcionado
- **404 Not Found:** Usuario no encontrado en la base de datos

---

### 4. Logout (Cerrar Sesión)

**Endpoint:** `POST /api/auth/logout`

**Headers requeridos:**

- `Authorization: Bearer <access_token>`

**Request:**

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**

```json
{
  "message": "Logout exitoso",
  "description": "El token debe ser eliminado del almacenamiento del cliente (localStorage/sessionStorage)"
}
```

**Errores posibles:**

- **401 Unauthorized:** Token inválido o no proporcionado

**Nota:** El logout es manejado en el cliente. El token debe ser eliminado del almacenamiento local.

---

## Ejemplos de Errores Comunes

### Email Duplicado (409 Conflict)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@example.com",
    "password": "Test1234!",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

**Response:**

```json
{
  "message": "El email ya está registrado",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### Credenciales Inválidas (401 Unauthorized)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@example.com",
    "password": "WrongPassword123!"
  }'
```

**Response:**

```json
{
  "message": "Credenciales inválidas",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### Acceso sin Token (401 Unauthorized)

```bash
curl -X GET http://localhost:3001/api/auth/profile
```

**Response:**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### Validación de Datos (400 Bad Request)

```bash
# Contraseña débil (sin mayúsculas, sin caracteres especiales)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@example.com",
    "password": "test123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

**Response:**

```json
{
  "message": [
    "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
    "La contraseña debe tener al menos 8 caracteres"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Script Completo de Prueba

```bash
#!/bin/bash

API_BASE="http://localhost:3001/api"

echo "=== 1. Registrar nuevo tutor ==="
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "nombre": "Test",
    "apellido": "User"
  }')
echo "$REGISTER_RESPONSE" | python3 -m json.tool

echo -e "\n=== 2. Login ==="
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }')
echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extraer el token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo -e "\n=== 3. Obtener perfil ==="
curl -s -X GET "$API_BASE/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo -e "\n=== 4. Logout ==="
curl -s -X POST "$API_BASE/auth/logout" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## Notas Adicionales

1. **ValidationPipe Global:** El API tiene validación automática de datos con class-validator
2. **CORS:** El API permite peticiones desde cualquier origen (configurado con `app.enableCors()`)
3. **JWT Expiration:** Los tokens JWT expiran en 7 días por defecto (configurable en `JWT_EXPIRATION`)
4. **Password Hashing:** Las contraseñas se hashean con bcrypt (10 rounds)
5. **Security:** El `password_hash` nunca se envía al frontend

---

## Códigos de Estado HTTP

| Código  | Descripción  | Casos de Uso                                   |
| ------- | ------------ | ---------------------------------------------- |
| **200** | OK           | Login exitoso, perfil obtenido, logout exitoso |
| **201** | Created      | Tutor registrado exitosamente                  |
| **400** | Bad Request  | Datos de entrada inválidos (validación DTO)    |
| **401** | Unauthorized | Credenciales inválidas o token JWT inválido    |
| **404** | Not Found    | Tutor no encontrado en la BD                   |
| **409** | Conflict     | Email ya está registrado                       |
