# API Client - Guía de Uso

Esta carpeta contiene la configuración del cliente Axios y las funciones para comunicarse con el backend.

## Estructura

```
lib/
├── axios.ts          # Cliente Axios configurado con interceptores
└── api/
    └── auth.api.ts   # Funciones específicas de autenticación
```

## Configuración

### Variables de Entorno

El cliente Axios lee la base URL desde las variables de entorno de Next.js:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Importante:** Las variables de entorno en Next.js que comienzan con `NEXT_PUBLIC_` están disponibles en el navegador.

### Cliente Axios (axios.ts)

El cliente está preconfigurado con:

- **Base URL:** `process.env.NEXT_PUBLIC_API_URL` o `http://localhost:3001/api` por defecto
- **Timeout:** 10 segundos
- **Headers:** `Content-Type: application/json`

#### Interceptores

**Request Interceptor:**
- Lee el token JWT de `localStorage` (key: `'auth-token'`)
- Adjunta automáticamente el header `Authorization: Bearer <token>` si existe
- Solo funciona en el navegador (Next.js puede renderizar en servidor)

**Response Interceptor:**
- Extrae `response.data` automáticamente para simplificar el uso
- Si recibe un **401 Unauthorized**:
  - Elimina el token de `localStorage`
  - Redirige a `/login` (excepto si ya está en login/register)
- Propaga otros errores para manejo en componentes

## Uso

### Importar el cliente

```typescript
import apiClient from '@/lib/axios';
```

### Usar directamente

```typescript
// GET request
const data = await apiClient.get('/some-endpoint');

// POST request
const result = await apiClient.post('/some-endpoint', { key: 'value' });

// Con tipos
interface User {
  id: string;
  name: string;
}

const user: User = await apiClient.get<User>('/user/123');
```

### Usar funciones de auth.api.ts (Recomendado)

```typescript
import { authApi } from '@/lib/api/auth.api';

// Registro
try {
  const response = await authApi.register({
    email: 'tutor@example.com',
    password: 'Test1234!',
    nombre: 'Juan',
    apellido: 'Pérez',
  });

  console.log('Usuario registrado:', response.user);
} catch (error) {
  console.error('Error en registro:', error);
}

// Login
try {
  const response = await authApi.login({
    email: 'tutor@example.com',
    password: 'Test1234!',
  });

  // Guardar token en localStorage
  localStorage.setItem('auth-token', response.access_token);

  console.log('Login exitoso:', response.user);
} catch (error) {
  console.error('Error en login:', error);
}

// Obtener perfil (requiere token en localStorage)
try {
  const profile = await authApi.getProfile();
  console.log('Perfil:', profile);
} catch (error) {
  // Si el token es inválido, el interceptor redirigirá a /login automáticamente
  console.error('Error obteniendo perfil:', error);
}

// Logout
try {
  await authApi.logout();
  // Eliminar token manualmente
  localStorage.removeItem('auth-token');
  // Redirigir a login
  window.location.href = '/login';
} catch (error) {
  console.error('Error en logout:', error);
}
```

## Uso en Componentes de React

### Ejemplo con useState y useEffect

```typescript
'use client';

import { useState, useEffect } from 'react';
import { authApi, Tutor } from '@/lib/api/auth.api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.getProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error cargando perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No hay datos</div>;

  return (
    <div>
      <h1>Perfil de {profile.nombre} {profile.apellido}</h1>
      <p>Email: {profile.email}</p>
    </div>
  );
}
```

### Ejemplo de formulario de login

```typescript
'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api/auth.api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(formData);

      // Guardar token
      localStorage.setItem('auth-token', response.access_token);

      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Cargando...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

## Manejo de Errores

### Estructura de errores del backend

Los errores del backend siguen este formato:

```typescript
{
  message: string | string[];  // Mensaje de error o array de mensajes
  error: string;               // Tipo de error (BadRequest, Unauthorized, etc.)
  statusCode: number;          // Código HTTP
}
```

### Ejemplo de manejo de errores

```typescript
import { AxiosError } from 'axios';

try {
  const response = await authApi.login({ email, password });
} catch (error) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        // Validación fallida
        console.error('Datos inválidos:', message);
        break;
      case 401:
        // Credenciales inválidas
        console.error('Email o contraseña incorrectos');
        break;
      case 409:
        // Conflicto (ej: email duplicado)
        console.error('Email ya está registrado');
        break;
      default:
        console.error('Error desconocido:', message);
    }
  }
}
```

## Tipos TypeScript

### Interfaces disponibles en auth.api.ts

```typescript
// Requests
interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Responses
interface Tutor {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  telefono: string | null;
  fecha_registro: string;
  ha_completado_onboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisterResponse {
  message: string;
  user: Tutor;
}

interface LoginResponse {
  access_token: string;
  user: Omit<Tutor, 'createdAt' | 'updatedAt'>;
}

interface LogoutResponse {
  message: string;
  description: string;
}
```

## Seguridad

### Token Storage

- El token JWT se guarda en `localStorage` con la key `'auth-token'`
- **Importante:** `localStorage` es vulnerable a ataques XSS
- Para mayor seguridad en producción, considera:
  - Usar cookies `httpOnly` (requiere cambios en el backend)
  - Implementar refresh tokens
  - Agregar CSRF protection

### HTTPS

En producción, **siempre** usa HTTPS para:
- Proteger el token JWT en tránsito
- Prevenir ataques man-in-the-middle
- Cumplir con mejores prácticas de seguridad

## Próximos Pasos

Este cliente Axios se usará en:
1. **Zustand Store** - Para manejo de estado global de autenticación
2. **React Query** - Para caché y sincronización de datos del servidor (opcional)
3. **Componentes de UI** - Formularios de login/register, dashboard, etc.

## Testing

Para probar el cliente en componentes:

```typescript
// Mock del cliente para testing
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
```
