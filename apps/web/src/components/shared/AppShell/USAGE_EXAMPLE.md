# AppShell - Guía de Uso

## Ejemplo: Layout de Admin

Este es un ejemplo de cómo reemplazar el layout actual de Admin (~614 líneas) con el nuevo AppShell (~50 líneas):

```tsx
// apps/web/src/app/admin/layout.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AppShell, NavigationItem } from '@/components/shared/AppShell';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  BarChart3,
  Key,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

/**
 * Items de navegación del panel admin
 * Cada item tiene su propio gradiente de color
 */
const navItems: NavigationItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    color: 'from-violet-500 to-purple-500',
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/admin/credenciales',
    label: 'Credenciales',
    icon: Key,
    color: 'from-amber-500 to-orange-500',
  },
  {
    href: '/admin/clases',
    label: 'Clubes y Cursos',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    href: '/admin/estudiantes',
    label: 'Estudiantes',
    icon: GraduationCap,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    href: '/admin/planificaciones',
    label: 'Planificaciones',
    icon: Calendar,
    color: 'from-pink-500 to-rose-500',
  },
  {
    href: '/admin/pagos',
    label: 'Pagos',
    icon: CreditCard,
    color: 'from-green-500 to-emerald-500',
  },
  {
    href: '/admin/reportes',
    label: 'Reportes',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
  },
];

/**
 * Notificaciones de ejemplo
 */
const mockNotifications = [
  {
    id: '1',
    title: '3 clases sin docente',
    description: 'Programadas para esta semana',
    icon: AlertCircle,
    iconColor: 'from-orange-500 to-red-500',
    timestamp: 'Hace 5 minutos',
  },
  {
    id: '2',
    title: '15 nuevos estudiantes',
    description: 'Registrados este mes',
    icon: CheckCircle2,
    iconColor: 'from-emerald-500 to-green-500',
    timestamp: 'Hace 1 hora',
  },
  {
    id: '3',
    title: 'Actualización disponible',
    description: 'Nueva versión de Mateatletas OS',
    icon: Info,
    iconColor: 'from-blue-500 to-cyan-500',
    timestamp: 'Hace 2 horas',
  },
];

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
        const redirectPath =
          activeRole === 'docente'
            ? '/docente/dashboard'
            : activeRole === 'estudiante'
              ? '/estudiante/gimnasio'
              : '/dashboard';
        router.replace(redirectPath);
        return;
      }

      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;
          const currentSelectedRole = useAuthStore.getState().selectedRole;

          if (!currentUser) {
            router.replace('/login');
            return;
          }

          const currentActiveRole = currentSelectedRole || currentUser.role;
          if (currentActiveRole !== 'admin') {
            const redirectPath =
              currentActiveRole === 'docente'
                ? '/docente/dashboard'
                : currentActiveRole === 'estudiante'
                  ? '/estudiante/gimnasio'
                  : '/dashboard';
            router.replace(redirectPath);
            return;
          }

          setIsValidating(false);
        } catch {
          router.replace('/login');
        }
      }
    };

    validateAuth();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Convertir usuario del store al formato AppShellUser
  const appShellUser = user
    ? {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: 'admin',
      }
    : null;

  return (
    <AppShell
      variant="admin"
      navigation={navItems}
      user={appShellUser}
      isLoading={isValidating}
      onLogout={handleLogout}
      notificationCount={3}
      notifications={mockNotifications}
    >
      {children}
    </AppShell>
  );
}
```

## Comparación

| Aspecto            | Layout Actual                              | Con AppShell |
| ------------------ | ------------------------------------------ | ------------ |
| Líneas de código   | ~614                                       | ~160         |
| Componentes inline | 4 (LoadingScreen, NotificationButton, etc) | 0            |
| Duplicación        | Alta (similar a docente/tutor)             | Ninguna      |
| Mantenimiento      | Difícil                                    | Fácil        |
| Consistencia       | Manual                                     | Automática   |

## Ejemplo: Layout de Docente

```tsx
// apps/web/src/app/docente/layout.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AppShell, NavigationItem } from '@/components/shared/AppShell';
import { LayoutDashboard, Calendar, FileText } from 'lucide-react';

const navItems: NavigationItem[] = [
  { href: '/docente/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/docente/calendario', label: 'Calendario', icon: Calendar },
  { href: '/docente/observaciones', label: 'Observaciones', icon: FileText },
];

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, checkAuth, selectedRole } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const hasValidatedRef = useRef(false);

  // ... misma lógica de validación ...

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const appShellUser = user
    ? {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        role: 'docente',
      }
    : null;

  return (
    <AppShell
      variant="docente"
      navigation={navItems}
      user={appShellUser}
      isLoading={isValidating}
      onLogout={handleLogout}
      showThemeToggle={true}
    >
      {children}
    </AppShell>
  );
}
```

## Props Disponibles

| Prop                | Tipo                              | Requerido | Descripción                    |
| ------------------- | --------------------------------- | --------- | ------------------------------ |
| `variant`           | `'admin' \| 'docente' \| 'tutor'` | ✅        | Estilo visual del shell        |
| `navigation`        | `NavigationItem[]`                | ✅        | Items del menú lateral         |
| `user`              | `AppShellUser \| null`            | ❌        | Usuario logueado               |
| `children`          | `ReactNode`                       | ✅        | Contenido de la página         |
| `branding`          | `Partial<AppShellBranding>`       | ❌        | Personalizar logo/título       |
| `isLoading`         | `boolean`                         | ❌        | Mostrar pantalla de carga      |
| `loadingMessage`    | `string`                          | ❌        | Mensaje de carga personalizado |
| `onLogout`          | `() => void`                      | ✅        | Handler de logout              |
| `notificationCount` | `number`                          | ❌        | Badge de notificaciones        |
| `notifications`     | `AppShellNotification[]`          | ❌        | Lista de notificaciones        |
| `showThemeToggle`   | `boolean`                         | ❌        | Mostrar toggle de tema         |
| `topbarActions`     | `ReactNode`                       | ❌        | Acciones extra en topbar       |
| `defaultCollapsed`  | `boolean`                         | ❌        | Sidebar colapsado por defecto  |

## Beneficios

1. **Código centralizado**: Un solo lugar para mantener la lógica del layout
2. **Consistencia visual**: Temas definidos en `VARIANT_THEMES`
3. **TypeScript estricto**: Todas las props tipadas
4. **Extensible**: Agregar nuevas variantes es trivial
5. **Testeable**: Componentes pequeños y aislados
