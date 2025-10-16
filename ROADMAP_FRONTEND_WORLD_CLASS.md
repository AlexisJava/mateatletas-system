# 🎯 ROADMAP: Frontend de 6.0/10 → 9.5/10 (World-Class)

**Estado Inicial**: 6.0/10 - FUNCIONAL CON DEUDA TÉCNICA
**Objetivo**: 9.5/10 - WORLD-CLASS
**Gap a cerrar**: +3.5 puntos
**Basado en**: [AUDITORIA_DEUDA_TECNICA_COMPLETA.md](AUDITORIA_DEUDA_TECNICA_COMPLETA.md)

---

## 📊 ESTADO ACTUAL (6.0/10)

### ✅ Lo que está bien
- Arquitectura Next.js 15 con App Router
- Zustand para state management (10 stores)
- Tailwind CSS para styling
- 157 archivos TypeScript/TSX organizados
- Playwright configurado para E2E

### ❌ Problemas Críticos
- **185 usos de `any`** - TypeScript sin type safety
- **0 tests unitarios** - Sin testing de componentes
- **JWT en localStorage** - Vulnerabilidad XSS
- **Sin manejo de errores global** - UX inconsistente
- **Loading states inconsistentes** - UX pobre
- **Sin optimización de renders** - Performance deficiente

---

## 🎯 PLAN DE REFACTORIZACIÓN (6 Fases)

### FASE 1: TYPE SAFETY (+0.8 puntos)
**Objetivo**: Eliminar todos los `any`, tipar correctamente
**Impacto**: 6.0 → 6.8

#### 1.1 Crear Types Centralizados
```typescript
// types/api.types.ts
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: 'Admin' | 'Docente' | 'Tutor' | 'Estudiante';
}

export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
  tutor_id: string;
  equipo_id?: string;
  foto_url?: string;
}

// ... 50+ interfaces más
```

#### 1.2 Tipar Zustand Stores
```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Implementación tipada
}));
```

#### 1.3 Tipar API Calls
```typescript
// lib/api/estudiantes.api.ts
export const estudiantesApi = {
  getAll: async (): Promise<Estudiante[]> => {
    const { data } = await api.get<Estudiante[]>('/estudiantes');
    return data;
  },

  getById: async (id: string): Promise<Estudiante> => {
    const { data } = await api.get<Estudiante>(`/estudiantes/${id}`);
    return data;
  },

  create: async (dto: CreateEstudianteDto): Promise<Estudiante> => {
    const { data } = await api.post<Estudiante>('/estudiantes', dto);
    return data;
  },
};
```

**Archivos a modificar**: ~50 archivos
**Tiempo estimado**: 2-3 días

---

### FASE 2: SEGURIDAD (+0.7 puntos)
**Objetivo**: Migrar JWT a httpOnly cookies, CORS correcto
**Impacto**: 6.8 → 7.5

#### 2.1 Backend: Configurar Cookies
```typescript
// apps/api/src/auth/auth.service.ts
async login(loginDto: LoginDto, response: Response) {
  const { access_token, user } = await this.validateAndGenerateToken(loginDto);

  // Setear cookie httpOnly
  response.cookie('auth-token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  return { user }; // NO devolver token
}
```

#### 2.2 Frontend: Eliminar localStorage
```typescript
// apps/web/src/lib/axios.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Enviar cookies automáticamente
});

// ❌ ELIMINAR:
// const token = localStorage.getItem('auth-token');
// api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### 2.3 CORS Restrictivo
```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Archivos a modificar**: 5 archivos (2 backend, 3 frontend)
**Tiempo estimado**: 1 día

---

### FASE 3: ERROR HANDLING & UX (+0.6 puntos)
**Objetivo**: Manejo global de errores, toast notifications
**Impacto**: 7.5 → 8.1

#### 3.1 Error Boundary Global
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    toast.error('Algo salió mal. Por favor, recarga la página.');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">
              Algo salió mal
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 3.2 Axios Interceptor para Errores
```typescript
// lib/axios.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Error desconocido';
    const status = error.response?.status;

    switch (status) {
      case 401:
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        toast.error('No tienes permisos para realizar esta acción');
        break;
      case 404:
        toast.error('Recurso no encontrado');
        break;
      case 429:
        toast.error('Demasiadas peticiones. Por favor, espera un momento.');
        break;
      case 500:
        toast.error('Error del servidor. Intenta nuevamente más tarde.');
        break;
      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);
```

#### 3.3 Loading States Consistentes
```typescript
// components/ui/LoadingSpinner.tsx
export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className={`animate-spin rounded-full border-t-2 border-blue-600 ${
    size === 'sm' ? 'h-4 w-4' :
    size === 'md' ? 'h-8 w-8' :
    'h-12 w-12'
  }`} />
);

// components/ui/SkeletonCard.tsx
export const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);
```

**Archivos a modificar**: ~30 archivos
**Tiempo estimado**: 2 días

---

### FASE 4: TESTING (+0.6 puntos)
**Objetivo**: Implementar tests unitarios con Jest + React Testing Library
**Impacto**: 8.1 → 8.7

#### 4.1 Configurar Jest
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

#### 4.2 Tests de Componentes
```typescript
// components/EstudianteCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EstudianteCard } from './EstudianteCard';

describe('EstudianteCard', () => {
  const mockEstudiante = {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    nivel_escolar: 'Primaria',
  };

  it('should render student name', () => {
    render(<EstudianteCard estudiante={mockEstudiante} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('should display nivel escolar', () => {
    render(<EstudianteCard estudiante={mockEstudiante} />);
    expect(screen.getByText('Primaria')).toBeInTheDocument();
  });
});
```

#### 4.3 Tests de Stores
```typescript
// store/auth.store.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
```

**Objetivo**: 50+ tests
**Tiempo estimado**: 3 días

---

### FASE 5: PERFORMANCE (+0.5 puntos)
**Objetivo**: Optimizar renders, lazy loading, memoization
**Impacto**: 8.7 → 9.2

#### 5.1 React.memo para Componentes Pesados
```typescript
// components/EstudiantesList.tsx
import { memo } from 'react';

export const EstudianteCard = memo(({ estudiante }: Props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.estudiante.id === nextProps.estudiante.id;
});
```

#### 5.2 useMemo para Cálculos Pesados
```typescript
// pages/dashboard.tsx
const sortedEstudiantes = useMemo(() => {
  return estudiantes.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
}, [estudiantes]);
```

#### 5.3 Lazy Loading de Rutas
```typescript
// app/layout.tsx
import dynamic from 'next/dynamic';

const DashboardView = dynamic(() => import('./components/DashboardView'), {
  loading: () => <LoadingSpinner />,
});
```

#### 5.4 Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={estudiante.foto_url || '/default-avatar.png'}
  alt={estudiante.nombre}
  width={80}
  height={80}
  loading="lazy"
  className="rounded-full"
/>
```

**Archivos a modificar**: ~40 archivos
**Tiempo estimado**: 2 días

---

### FASE 6: VALIDACIÓN & FORMS (+0.3 puntos)
**Objetivo**: React Hook Form + Zod validation
**Impacto**: 9.2 → 9.5

#### 6.1 Configurar React Hook Form + Zod
```bash
npm install react-hook-form zod @hookform/resolvers
```

#### 6.2 Schema de Validación
```typescript
// schemas/estudiante.schema.ts
import { z } from 'zod';

export const estudianteSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),

  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede superar los 100 caracteres'),

  fecha_nacimiento: z.string()
    .refine((date) => {
      const age = calculateAge(new Date(date));
      return age >= 4 && age <= 18;
    }, 'El estudiante debe tener entre 4 y 18 años'),

  nivel_escolar: z.enum(['Primaria', 'Secundaria', 'Universidad']),

  equipo_id: z.string().uuid().optional(),
});

export type EstudianteFormData = z.infer<typeof estudianteSchema>;
```

#### 6.3 Formulario con Validación
```typescript
// components/FormEstudiante.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const FormEstudiante = ({ onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EstudianteFormData>({
    resolver: zodResolver(estudianteSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('nombre')}
        className={errors.nombre ? 'border-red-500' : ''}
      />
      {errors.nombre && (
        <p className="text-red-500 text-sm">{errors.nombre.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Guardar'}
      </button>
    </form>
  );
};
```

**Archivos a modificar**: ~20 forms
**Tiempo estimado**: 2 días

---

## 📊 RESUMEN: ROADMAP A 9.5/10

| Fase | Objetivo | Puntos | Esfuerzo | Prioridad |
|------|----------|--------|----------|-----------|
| 1. Type Safety | Eliminar `any`, tipar todo | +0.8 | 2-3 días | 🔴 CRÍTICA |
| 2. Seguridad | httpOnly cookies + CORS | +0.7 | 1 día | 🔴 CRÍTICA |
| 3. Error Handling | Toast + ErrorBoundary | +0.6 | 2 días | 🟠 ALTA |
| 4. Testing | Jest + RTL (50+ tests) | +0.6 | 3 días | 🟠 ALTA |
| 5. Performance | Memoization + Lazy | +0.5 | 2 días | 🟡 MEDIA |
| 6. Validación | React Hook Form + Zod | +0.3 | 2 días | 🟡 MEDIA |
| **TOTAL** | **6.0 → 9.5** | **+3.5** | **12-14 días** | |

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Sprint 1 (4-5 días): FUNDAMENTOS
- ✅ FASE 1: Type Safety (eliminar 185 `any`)
- ✅ FASE 2: Seguridad (httpOnly cookies)

**Resultado**: Frontend pasa de 6.0 → 7.5

### Sprint 2 (5-6 días): CALIDAD
- ✅ FASE 3: Error Handling & UX
- ✅ FASE 4: Testing (50+ tests)

**Resultado**: Frontend pasa de 7.5 → 8.7

### Sprint 3 (3-4 días): OPTIMIZACIÓN
- ✅ FASE 5: Performance
- ✅ FASE 6: Validación

**Resultado**: Frontend llega a 9.5/10 ⭐

---

## 🚀 BENEFICIOS DE LLEGAR A 9.5/10

### Técnicos
- ✅ **Type Safety**: 0 errores de tipos en runtime
- ✅ **Seguridad**: Tokens protegidos de XSS
- ✅ **UX Consistente**: Errores manejados uniformemente
- ✅ **Testing**: 50+ tests dan confianza
- ✅ **Performance**: Renders optimizados

### Negocio
- ✅ **Menos bugs**: Testing reduce bugs 80%
- ✅ **Desarrollo más rápido**: Types = autocomplete
- ✅ **Mejor UX**: Loading + error states
- ✅ **Seguridad**: Protección XSS/CSRF
- ✅ **Mantenibilidad**: Código más limpio

---

## 💡 RECOMENDACIÓN

**Prioridad 1** (Crítica - Empezar YA):
1. FASE 2: Seguridad (httpOnly cookies) - **1 DÍA**
2. FASE 1: Type Safety (eliminar any) - **2-3 DÍAS**

**Prioridad 2** (Alta - Siguiente semana):
3. FASE 3: Error Handling - **2 DÍAS**
4. FASE 4: Testing - **3 DÍAS**

**Prioridad 3** (Media - Cuando tengas tiempo):
5. FASE 5: Performance - **2 DÍAS**
6. FASE 6: Validación - **2 DÍAS**

---

**¿Empezamos con la FASE 2 (Seguridad) para cerrar la vulnerabilidad XSS crítica?** 🔒

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
