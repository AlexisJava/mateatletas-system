# Cambio: apps/web/src/app/admin/layout.tsx
**Descripción:** Validé el rol admin tras checkAuth usando el estado persistido.
**Motivo:** Redirigir a usuarios no admin aunque tengan token válido.
**Fecha:** 2025-10-13 12:00
```tsx
        await checkAuth();
        const currentUser = useAuthStore.getState().user;
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
```
