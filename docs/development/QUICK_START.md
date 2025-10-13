# 🚀 Quick Start Guide - Mateatletas

Esta guía te ayudará a comenzar a trabajar con el proyecto Mateatletas después de completar la Fase 1.

---

## 📦 Instalación

```bash
# Clonar el repositorio (si aún no lo has hecho)
cd /home/alexis/Documentos/Mateatletas-Ecosystem

# Instalar dependencias
npm install

# Configurar variables de entorno
# Ya están configuradas en:
# - apps/api/.env
# - apps/web/.env.local
```

---

## 🗄️ Base de Datos

### Iniciar PostgreSQL (Docker)

```bash
# Iniciar contenedor de PostgreSQL
docker compose up -d

# Verificar que esté corriendo
docker ps | grep postgres
```

### Ejecutar Migraciones

```bash
# Ya ejecutadas, pero si necesitas recrear:
cd apps/api
npx prisma migrate reset  # ⚠️ Elimina todos los datos
npx prisma migrate dev    # Aplica migraciones

# Ver BD con interfaz gráfica
npx prisma studio
# Abre: http://localhost:5555
```

---

## 🏃 Ejecutar en Desarrollo

### Opción 1: Ejecutar Todo el Monorepo

```bash
# Desde la raíz del proyecto
npm run dev

# Esto inicia:
# - API (NestJS): http://localhost:3001
# - Web (Next.js): http://localhost:3000
```

### Opción 2: Ejecutar Individual

#### API (Backend)
```bash
cd apps/api
npm run start:dev

# API disponible en: http://localhost:3001
# Swagger docs: http://localhost:3001/api (si está configurado)
```

#### Web (Frontend)
```bash
cd apps/web
npm run dev

# Web disponible en: http://localhost:3000
```

---

## 🧪 Probar el Sistema

### 1. Ver Componentes UI

Abre tu navegador en:
```
http://localhost:3000/showcase
```

Aquí verás todos los componentes UI con ejemplos interactivos.

### 2. Probar API con cURL

#### Registrar un Tutor
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "Password123!",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "telefono": "+54 11 1234-5678"
  }'
```

#### Hacer Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "Password123!"
  }'

# Guarda el access_token de la respuesta
```

#### Obtener Perfil (requiere token)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Más ejemplos en: [apps/api/CURL_EXAMPLES.md](apps/api/CURL_EXAMPLES.md)

---

## 🔍 Explorar el Código

### Backend (NestJS)

```bash
# Estructura principal
apps/api/src/
├── auth/              # Módulo de autenticación
│   ├── dto/           # DTOs con validación
│   ├── guards/        # Guards (JWT, Roles)
│   ├── strategies/    # Passport strategies
│   ├── decorators/    # Decoradores personalizados
│   ├── auth.service.ts
│   └── auth.controller.ts
├── core/
│   └── database/      # Prisma service
└── main.ts
```

**Archivos clave:**
- [apps/api/src/auth/auth.service.ts](apps/api/src/auth/auth.service.ts) - Lógica de negocio
- [apps/api/src/auth/auth.controller.ts](apps/api/src/auth/auth.controller.ts) - Endpoints REST
- [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma) - Modelo de datos

### Frontend (Next.js)

```bash
# Estructura principal
apps/web/src/
├── app/               # App Router (Next.js 15)
│   ├── layout.tsx
│   ├── page.tsx
│   └── showcase/      # Página de demostración
├── components/
│   └── ui/            # Componentes UI reutilizables
├── lib/
│   ├── axios.ts       # Cliente HTTP configurado
│   └── api/           # Funciones de API tipadas
└── store/
    └── auth.store.ts  # Estado global (Zustand)
```

**Archivos clave:**
- [apps/web/src/store/auth.store.ts](apps/web/src/store/auth.store.ts) - Store de autenticación
- [apps/web/src/lib/axios.ts](apps/web/src/lib/axios.ts) - Configuración de Axios
- [apps/web/src/components/ui/](apps/web/src/components/ui/) - Componentes UI

---

## 📚 Documentación

### Documentos Principales

1. **[CHECKPOINT_FASE_0.md](CHECKPOINT_FASE_0.md)** - Setup inicial del monorepo
2. **[CHECKPOINT_FASE_1.md](CHECKPOINT_FASE_1.md)** - Sistema de autenticación completo
3. **[apps/api/src/auth/README.md](apps/api/src/auth/README.md)** - Documentación del módulo Auth
4. **[apps/api/CURL_EXAMPLES.md](apps/api/CURL_EXAMPLES.md)** - Ejemplos de API
5. **[apps/web/src/lib/README.md](apps/web/src/lib/README.md)** - Uso de Axios
6. **[apps/web/src/store/README.md](apps/web/src/store/README.md)** - Uso del store

### Arquitectura

```
Mateatletas-Ecosystem/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   └── shared/       # Código compartido
├── docs/             # Documentación general
└── docker-compose.yml
```

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Build completo del monorepo
npm run build

# Limpiar builds
npx turbo clean

# Verificar tipos TypeScript
cd apps/api && npm run type-check
cd apps/web && npm run type-check

# Linting
npm run lint

# Formatear código
npm run format
```

### Base de Datos

```bash
cd apps/api

# Crear una nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear BD (⚠️ borra todos los datos)
npx prisma migrate reset

# Generar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

### Docker

```bash
# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Eliminar volúmenes (⚠️ borra todos los datos)
docker compose down -v
```

---

## 🎨 Usar los Componentes UI

### Importar Componentes

```typescript
import { Button, Input, Card } from '@/components/ui';

// O individualmente:
import { Button } from '@/components/ui/Button';
```

### Ejemplo de Uso

```typescript
'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';

export default function MyPage() {
  const [value, setValue] = useState('');

  return (
    <Card title="Mi Formulario">
      <Input
        label="Nombre"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ingresa tu nombre"
      />
      <Button variant="primary" size="lg">
        Enviar
      </Button>
    </Card>
  );
}
```

---

## 🔐 Usar el Sistema de Autenticación

### En un Componente de React

```typescript
'use client';

import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui';

export default function ProfileComponent() {
  const { user, logout, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <p>No has iniciado sesión</p>;
  }

  return (
    <div>
      <h1>Hola, {user?.nombre}!</h1>
      <p>Email: {user?.email}</p>
      <Button onClick={logout}>Cerrar Sesión</Button>
    </div>
  );
}
```

### Verificar Auth al Cargar la App

```typescript
// apps/web/src/app/layout.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout({ children }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Verificar token al cargar la app
    checkAuth();
  }, [checkAuth]);

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

---

## 🐛 Debugging

### Ver Logs de la API

```bash
# Si iniciaste con npm run dev
# Los logs aparecen en la terminal

# Si usas Docker
docker compose logs -f api
```

### Ver Estado de la BD

```bash
cd apps/api
npx prisma studio

# O conéctate directamente con psql
docker exec -it mateatletas-postgres psql -U postgres -d mateatletas_db
```

### Inspeccionar Tokens JWT

Ve a: https://jwt.io/

Pega tu token para ver el payload (sin revelar el secret).

---

## 📝 Próximos Pasos

### Fase 2 Sugerida: Páginas de Autenticación

1. Crear página de login: `apps/web/src/app/login/page.tsx`
2. Crear página de registro: `apps/web/src/app/register/page.tsx`
3. Crear dashboard protegido: `apps/web/src/app/dashboard/page.tsx`
4. Agregar navbar con estado de autenticación
5. Implementar protección de rutas (middleware)

### Mejoras Opcionales

- [ ] Agregar tests unitarios (Jest)
- [ ] Agregar tests E2E (Playwright)
- [ ] Implementar refresh tokens
- [ ] Agregar recuperación de contraseña
- [ ] Configurar CI/CD
- [ ] Agregar Swagger para la API

---

## 🆘 Ayuda

### Errores Comunes

**Error: "Cannot connect to database"**
- Verifica que PostgreSQL esté corriendo: `docker ps`
- Revisa las credenciales en `apps/api/.env`

**Error: "JWT_SECRET not configured"**
- Asegúrate de que `apps/api/.env` tenga `JWT_SECRET`
- Reinicia el servidor después de cambiar .env

**Error: "Module not found"**
- Ejecuta `npm install` en la raíz del proyecto
- Verifica que estés usando Node 18+

**Error de CORS en el frontend**
- Verifica que `NEXT_PUBLIC_API_URL` en `apps/web/.env.local` sea correcto
- Asegúrate de que la API tenga CORS habilitado

### Recursos

- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Zustand Docs**: https://zustand-demo.pmnd.rs/

---

## ✅ Checklist de Verificación

Antes de comenzar a desarrollar, verifica que todo funcione:

- [ ] PostgreSQL corriendo (`docker ps`)
- [ ] Migraciones aplicadas (`npx prisma migrate status`)
- [ ] API corriendo en http://localhost:3001
- [ ] Web corriendo en http://localhost:3000
- [ ] Puedes ver el showcase en http://localhost:3000/showcase
- [ ] Puedes registrar un usuario con cURL
- [ ] Puedes hacer login con cURL
- [ ] Puedes obtener perfil con token

Si todos los checks están ✅, ¡estás listo para comenzar! 🚀

---

**¿Necesitas más ayuda?** Revisa la documentación en los archivos README de cada módulo.
