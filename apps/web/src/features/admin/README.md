# Admin Portal - Feature-Based Architecture

## 📁 Estructura

```
features/admin/
├── shared/           # Código compartido entre features
│   ├── schemas/      # Schemas Zod comunes
│   └── types/        # Tipos e interfaces compartidos
├── dashboard/        # Feature: Dashboard
│   ├── store/        # Zustand store
│   ├── hooks/        # React hooks selectores
│   ├── types/        # Schemas y tipos
│   └── index.ts      # Export público
├── stats/            # Feature: Estadísticas
├── users/            # Feature: Usuarios
├── classes/          # Feature: Clases
└── products/         # Feature: Productos
```

## 🎯 Principios de Arquitectura

### 1. **Separación por Features**

Cada feature es independiente y contiene todo lo necesario:

- **Store**: Estado global con Zustand
- **Hooks**: Selectores optimizados para prevenir re-renders
- **Types**: Schemas Zod + TypeScript types
- **Index**: Exportaciones públicas controladas

### 2. **Type-Safety con Zod**

Todas las respuestas de API se validan con Zod:

```typescript
// ❌ Antes: Sin validación
const stats = await adminApi.getSystemStats();
// stats podría tener cualquier estructura

// ✅ Ahora: Con validación Zod
const rawStats = await adminApi.getSystemStats();
const stats = parseSystemStats(rawStats); // Validado y type-safe
```

### 3. **Manejo de Errores Type-Safe**

Sistema de errores unificado con tipos específicos:

```typescript
// Tipos de errores
- NetworkError: Problemas de conectividad
- ValidationError: Errores de validación Zod
- AuthError: 401/403
- BusinessError: 404/409
- ServerError: 500+

// Uso en stores
catch (error) {
  let appError: AppError;

  if (error instanceof z.ZodError) {
    appError = ErrorFactory.fromZodError(error);
  } else {
    appError = ErrorFactory.fromAxiosError(error);
  }

  set({ error: appError });
}
```

## 🔧 Uso de Features

### Importar hooks

```typescript
// ✅ Correcto: Import desde feature
import { useStats, useFetchStats, useStatsError } from '@/features/admin/stats';

// ❌ Incorrecto: Import directo de internals
import { useStatsStore } from '@/features/admin/stats/store/stats.store';
```

### Usar en componentes

```typescript
function StatsComponent() {
  const stats = useStats();
  const fetchStats = useFetchStats();
  const error = useStatsError();
  const loading = useStatsLoading();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <Loading />;

  if (error) {
    // error es type-safe AppError
    return <Error code={error.code} message={error.message} />;
  }

  // stats es validado y type-safe
  return <div>{stats?.totalUsuarios}</div>;
}
```

## 📊 Schemas Zod

### Crear un nuevo schema

```typescript
// users/types/users.schema.ts
import { z } from 'zod';
import { UUIDSchema, EmailSchema } from '../../shared/schemas/common.schema';

export const AdminUserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  role: z.enum(['tutor', 'docente', 'admin']),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export function parseAdminUser(data: unknown): AdminUser {
  return AdminUserSchema.parse(data);
}
```

### Usar schema en el store

```typescript
// users/store/users.store.ts
import { parseAdminUsers } from '../types/users.schema';
import { ErrorFactory } from '../../shared/types/errors.types';

fetchUsers: async () => {
  set({ isLoading: true, error: null });
  try {
    const rawUsers = await adminApi.getAllUsers();
    const users = parseAdminUsers(rawUsers); // Validado
    set({ users, isLoading: false });
  } catch (error) {
    const appError =
      error instanceof z.ZodError
        ? ErrorFactory.fromZodError(error)
        : ErrorFactory.fromAxiosError(error);

    set({ error: appError, isLoading: false });
  }
};
```

## 🛡️ Manejo de Errores

### Error Factory

```typescript
import { ErrorFactory, ErrorCode } from '@/features/admin/shared/types/errors.types';

// Crear errores específicos
const networkErr = ErrorFactory.network('Connection failed', '/api/users', 500);
const validationErr = ErrorFactory.validation('Invalid data', { email: ['Invalid format'] });
const authErr = ErrorFactory.auth('Unauthorized', ErrorCode.UNAUTHORIZED);

// Desde Axios
const axiosErr = ErrorFactory.fromAxiosError(error);

// Desde Zod
const zodErr = ErrorFactory.fromZodError(zodError);
```

### Type Guards

```typescript
import {
  isNetworkError,
  isValidationError,
  isAuthError,
} from '@/features/admin/shared/types/errors.types';

if (isNetworkError(error)) {
  // error es NetworkError
  console.log(error.statusCode, error.url);
}

if (isValidationError(error)) {
  // error es ValidationError
  console.log(error.fieldErrors);
}

if (isAuthError(error)) {
  // error es AuthError
  router.push('/login');
}
```

## 🎨 Convenciones

### Nombres de hooks selectores

```typescript
// Datos
export const useStats = () => useStatsStore((state) => state.stats);
export const useUsers = () => useUsersStore((state) => state.users);

// Estado de carga
export const useStatsLoading = () => useStatsStore((state) => state.isLoading);

// Errores
export const useStatsError = () => useStatsStore((state) => state.error);

// Acciones
export const useFetchStats = () => useStatsStore((state) => state.fetchStats);
export const useDeleteUser = () => useUsersStore((state) => state.deleteUser);
```

### Exports en index.ts

```typescript
// Solo exportar API pública
export { useStatsStore } from './store/stats.store';
export { useStats, useStatsLoading, useStatsError, useFetchStats } from './hooks/useStats';
export type { SystemStats } from './types/stats.schema';
```

## 🚀 Beneficios

### 1. **Type-Safety Total**

- Zod valida datos en runtime
- TypeScript valida en compile-time
- Errores detectados antes de llegar al usuario

### 2. **Performance Optimizada**

- Hooks selectores previenen re-renders
- Solo componentes afectados se actualizan
- Mejor UX y menor uso de recursos

### 3. **Mantenibilidad**

- Features aisladas y cohesivas
- Cambios localizados
- Testing más fácil

### 4. **Developer Experience**

- Autocompletado preciso
- Errores claros y type-safe
- Documentación integrada con tipos

## 📚 Recursos

- [Zod Documentation](https://zod.dev/)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [Feature-Sliced Design](https://feature-sliced.design/)
