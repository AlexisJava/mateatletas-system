# ProtectedLayout - Guía de Uso

## Antes vs Después

### ANTES (admin/layout.tsx - 175 líneas de lógica duplicada)

```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, checkAuth, selectedRole } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    if (hasValidatedRef.current) return;

    const validateAuth = async () => {
      hasValidatedRef.current = true;
      const activeRole = selectedRole || user?.role;

      if (user && activeRole === 'admin') {
        setIsValidating(false);
        return;
      }

      if (user && activeRole && activeRole !== 'admin') {
        const redirectPath = activeRole === 'docente' ? '/docente/dashboard' : /* etc */;
        router.replace(redirectPath);
        return;
      }

      if (!user) {
        try {
          await checkAuth();
          // ... más lógica duplicada ...
        } catch {
          router.replace('/login');
        }
      }
    };

    validateAuth();
  }, []);

  return (
    <div>
      {isValidating ? <LoadingScreen /> : (
        {/* ... 400+ líneas de UI ... */}
        {children}
      )}
    </div>
  );
}
```

### DESPUÉS (con ProtectedLayout)

```tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN']}>
      <AdminShell>{children}</AdminShell>
    </ProtectedLayout>
  );
}

// La UI del shell se separa en su propio componente
function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  // ... solo UI, sin lógica de auth ...

  return (
    <div className="h-screen">
      {/* Sidebar, header, etc. */}
      {children}
    </div>
  );
}
```

## Ejemplos de Integración

### 1. Layout de Admin (solo ADMIN)

```tsx
// app/admin/layout.tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN']}>
      {/* El contenido solo se renderiza si el usuario es admin */}
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </ProtectedLayout>
  );
}
```

### 2. Layout de Docente (solo DOCENTE)

```tsx
// app/docente/layout.tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ProtectedLayout allowedRoles={['DOCENTE']}>
        <DocenteShell>{children}</DocenteShell>
      </ProtectedLayout>
    </ThemeProvider>
  );
}
```

### 3. Layout compartido Admin + Docente

```tsx
// app/reportes/layout.tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';

export default function ReportesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'DOCENTE']}>
      <ReportesShell>{children}</ReportesShell>
    </ProtectedLayout>
  );
}
```

### 4. Con loading personalizado

```tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';

function SpaceLoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Loading espacial estilo Mateatletas */}
    </div>
  );
}

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout allowedRoles={['ESTUDIANTE']} loadingComponent={<SpaceLoadingScreen />}>
      {children}
    </ProtectedLayout>
  );
}
```

### 5. Con callbacks para analytics/logging

```tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout
      allowedRoles={['ADMIN']}
      onAuthenticated={(user) => {
        // Track login en analytics
        analytics.identify(user.id, { role: user.activeRole });
      }}
      onUnauthorized={(reason) => {
        // Log intentos de acceso no autorizado
        console.warn('Unauthorized access attempt:', reason);
      }}
    >
      <AdminShell>{children}</AdminShell>
    </ProtectedLayout>
  );
}
```

### 6. Con URL de redirección personalizada

```tsx
import { ProtectedLayout } from '@/components/shared/ProtectedLayout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout
      allowedRoles={['ADMIN']}
      fallbackUrl="/login?redirect=/super-admin"
      unauthorizedUrl="/admin/dashboard?error=no_permission"
    >
      {children}
    </ProtectedLayout>
  );
}
```

## Props Reference

| Prop                 | Tipo                                                  | Default      | Descripción                          |
| -------------------- | ----------------------------------------------------- | ------------ | ------------------------------------ |
| `allowedRoles`       | `('ADMIN' \| 'DOCENTE' \| 'TUTOR' \| 'ESTUDIANTE')[]` | **required** | Roles permitidos                     |
| `children`           | `ReactNode`                                           | **required** | Contenido protegido                  |
| `fallbackUrl`        | `string`                                              | `'/login'`   | URL si no autenticado                |
| `unauthorizedUrl`    | `string`                                              | `undefined`  | URL si autenticado pero sin permiso  |
| `loadingComponent`   | `ReactNode`                                           | `undefined`  | Loading personalizado                |
| `onUnauthorized`     | `(reason) => void`                                    | `undefined`  | Callback en acceso denegado          |
| `onAuthenticated`    | `(user) => void`                                      | `undefined`  | Callback en auth exitosa             |
| `allowPartialAccess` | `boolean`                                             | `false`      | Mostrar contenido durante validación |

## Beneficios

1. **DRY**: La lógica de auth está en UN solo lugar
2. **Type-safe**: Roles tipados, callbacks tipados
3. **Extensible**: Callbacks para analytics, logging, etc.
4. **Testeable**: Un componente vs 4 layouts duplicados
5. **Mantenible**: Cambios de lógica en un solo archivo
