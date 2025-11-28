# Zustand Store - Guía de Uso

Este directorio contiene los stores de Zustand para el manejo de estado global de la aplicación.

## Store de Autenticación

### Archivo

[auth.store.ts](./auth.store.ts)

### Descripción

El store de autenticación maneja todo el estado relacionado con la autenticación del usuario:

- Información del usuario autenticado
- Token JWT
- Estado de autenticación
- Acciones para login, registro, logout, etc.

### Estado

```typescript
interface AuthState {
  // Estado
  user: User | null; // Datos del usuario autenticado
  token: string | null; // Token JWT
  isAuthenticated: boolean; // Estado de autenticación
  isLoading: boolean; // Indicador de carga

  // Acciones
  login: (email, password) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user) => void;
}
```

### Persistencia

El store usa el middleware `persist` de Zustand para guardar automáticamente el estado en `localStorage`:

- **Key en localStorage:** `auth-storage`
- **Datos persistidos:** `user` y `token`
- **Datos NO persistidos:** `isLoading`, `isAuthenticated` (se calculan en runtime)

## Uso Básico

### Importar el store

```typescript
import { useAuthStore } from '@/store/auth.store';
```

### Uso en componentes

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';

export default function MyComponent() {
  // Extraer estado y acciones
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenido, {user?.nombre}</p>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <p>No autenticado</p>
      )}
    </div>
  );
}
```

### Selección de estado específico (optimización)

Para evitar re-renders innecesarios, selecciona solo el estado que necesitas:

```typescript
// ❌ Mal: el componente se re-renderiza con cualquier cambio
const authStore = useAuthStore();

// ✅ Bien: solo se re-renderiza si 'user' cambia
const user = useAuthStore((state) => state.user);

// ✅ Bien: múltiples valores
const { user, isLoading } = useAuthStore((state) => ({
  user: state.user,
  isLoading: state.isLoading,
}));
```

## Acciones

### 1. Login

Autentica al usuario con email y contraseña.

```typescript
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData.email, formData.password);
      // Login exitoso, redirigir
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en login');
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
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### 2. Register

Registra un nuevo usuario y hace login automáticamente.

```typescript
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore(state => state.register);
  const isLoading = useAuthStore(state => state.isLoading);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await register(formData);
      // Registro exitoso y login automático, redirigir
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* inputs... */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### 3. Logout

Cierra la sesión del usuario.

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  );
}
```

### 4. CheckAuth

Verifica la sesión al cargar la aplicación.

**Uso en Layout Principal:**

```typescript
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isLoading = useAuthStore(state => state.isLoading);

  useEffect(() => {
    // Verificar autenticación al montar el componente
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return <>{children}</>;
}
```

**Uso en RootLayout:**

```typescript
// app/layout.tsx
import AuthProvider from '@/components/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5. SetUser

Actualiza los datos del usuario sin hacer logout/login.

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth.api';

export default function UpdateProfileButton() {
  const setUser = useAuthStore(state => state.setUser);

  const handleUpdate = async () => {
    try {
      // Obtener perfil actualizado del backend
      const profile = await authApi.getProfile();

      // Actualizar store
      setUser(profile);

      alert('Perfil actualizado');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
    }
  };

  return (
    <button onClick={handleUpdate}>
      Actualizar Perfil
    </button>
  );
}
```

## Rutas Protegidas

### HOC (Higher Order Component)

```typescript
// components/withAuth.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Uso
export default withAuth(function DashboardPage() {
  return <div>Dashboard</div>;
});
```

### Middleware de Next.js (Recomendado)

```typescript
// middleware.ts (en la raíz de src/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener token de las cookies o headers
  const token = request.cookies.get('auth-token')?.value;

  // Si no hay token y la ruta es protegida, redirigir a login
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

## Patrones Comunes

### Mostrar datos del usuario

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';

export default function UserProfile() {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <p>No hay usuario</p>;
  }

  return (
    <div>
      <h1>{user.nombre} {user.apellido}</h1>
      <p>Email: {user.email}</p>
      <p>DNI: {user.dni || 'No especificado'}</p>
      <p>Teléfono: {user.telefono || 'No especificado'}</p>
      <p>
        Onboarding: {user.ha_completado_onboarding ? 'Completado' : 'Pendiente'}
      </p>
    </div>
  );
}
```

### Condicional por autenticación

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';

export default function Navigation() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <nav>
      <a href="/">Home</a>
      {isAuthenticated ? (
        <>
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Perfil</a>
        </>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/register">Registrarse</a>
        </>
      )}
    </nav>
  );
}
```

## Debugging

### Ver estado actual en DevTools

Zustand se integra con Redux DevTools. Para habilitarlo:

```typescript
// Modificar auth.store.ts
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... estado y acciones
      }),
      { name: 'auth-storage' },
    ),
    { name: 'AuthStore' },
  ),
);
```

### Logging manual

```typescript
const user = useAuthStore((state) => state.user);

useEffect(() => {
  console.log('Usuario actual:', user);
}, [user]);
```

## Consideraciones de Seguridad

1. **Token en localStorage:** Vulnerable a XSS. Para mayor seguridad en producción, considera usar cookies `httpOnly`.
2. **Expiración del token:** El interceptor de axios maneja automáticamente tokens expirados (401).
3. **HTTPS:** Siempre usa HTTPS en producción para proteger el token en tránsito.
4. **Refresh tokens:** Considera implementar refresh tokens para sesiones largas.

## Testing

```typescript
// Mockear el store en tests
import { create } from 'zustand';

const mockAuthStore = create(() => ({
  user: { id: '1', email: 'test@example.com', nombre: 'Test', apellido: 'User' },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/store/auth.store', () => ({
  useAuthStore: mockAuthStore,
}));
```
