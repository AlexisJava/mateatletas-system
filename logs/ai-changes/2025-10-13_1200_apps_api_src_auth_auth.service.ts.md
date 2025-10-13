# Cambio: apps/api/src/auth/auth.service.ts
**Descripción:** Extendí register/login/profile para incluir datos de rol.
**Motivo:** Permitir que el frontend conozca el rol real y recupere el perfil correcto.
**Fecha:** 2025-10-13 12:00
```ts
    return {
      message: 'Tutor registrado exitosamente',
      user: {
        ...tutor,
        role: Role.Tutor,
      },
    };
```
