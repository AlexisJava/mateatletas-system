# 📚 Documentación Mateatletas Ecosystem

Bienvenido a la documentación completa del proyecto Mateatletas.

---

## 🗂️ Índice de Documentación

### 📄 Documentos Principales (Raíz del Proyecto)

| Documento | Descripción | Última Actualización |
|-----------|-------------|---------------------|
| [CHECKPOINT_FASE_0.md](../CHECKPOINT_FASE_0.md) | Setup inicial del monorepo | 2025-10-12 |
| [CHECKPOINT_FASE_1.md](../CHECKPOINT_FASE_1.md) | Sistema de autenticación completo | 2025-10-12 |
| [QUICK_START.md](../QUICK_START.md) | Guía de inicio rápido | 2025-10-12 |
| [SESSION_SUMMARY.md](../SESSION_SUMMARY.md) | Resumen de la sesión de desarrollo | 2025-10-12 |
| [GITHUB_SETUP.md](../GITHUB_SETUP.md) | Configuración de GitHub | 2025-10-12 |

### 🏗️ Arquitectura (docs/)

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE_FASE_1.md](./ARCHITECTURE_FASE_1.md) | Arquitectura detallada con diagramas |

### 🎯 Guías de Construcción (docs/)

| Documento | Descripción |
|-----------|-------------|
| [guia-de-construccion.md](./guia-de-construccion.md) | Guía general de construcción |
| [manual-construccion-diseno-fases.md](./manual-construccion-diseno-fases.md) | Manual de diseño por fases |
| [frontend-arquitectura.md](./frontend-arquitectura.md) | Arquitectura del frontend |
| [slice-1.md](./slice-1.md) | Documentación del slice 1 |

### 🔐 Backend - Auth Module (apps/api/)

| Documento | Descripción |
|-----------|-------------|
| [apps/api/src/auth/README.md](../apps/api/src/auth/README.md) | Módulo de autenticación |
| [apps/api/CURL_EXAMPLES.md](../apps/api/CURL_EXAMPLES.md) | Ejemplos de uso con cURL |

### 🎨 Frontend (apps/web/)

| Documento | Descripción |
|-----------|-------------|
| [apps/web/src/lib/README.md](../apps/web/src/lib/README.md) | Cliente Axios y API |
| [apps/web/src/store/README.md](../apps/web/src/store/README.md) | Store Zustand de autenticación |

---

## 🚀 Por Dónde Empezar

### Para Nuevos Desarrolladores

1. **Lee primero**: [QUICK_START.md](../QUICK_START.md)
2. **Entiende el setup**: [CHECKPOINT_FASE_0.md](../CHECKPOINT_FASE_0.md)
3. **Revisa la arquitectura**: [ARCHITECTURE_FASE_1.md](./ARCHITECTURE_FASE_1.md)
4. **Explora el código**: Empieza por los componentes UI en `/apps/web/src/components/ui/`

### Para Trabajar con Auth

1. **Backend**: [apps/api/src/auth/README.md](../apps/api/src/auth/README.md)
2. **Frontend**: [apps/web/src/store/README.md](../apps/web/src/store/README.md)
3. **Ejemplos**: [apps/api/CURL_EXAMPLES.md](../apps/api/CURL_EXAMPLES.md)

### Para Entender la Fase Actual

1. **Estado del proyecto**: [CHECKPOINT_FASE_1.md](../CHECKPOINT_FASE_1.md)
2. **Resumen de sesión**: [SESSION_SUMMARY.md](../SESSION_SUMMARY.md)

---

## 📋 Fases del Proyecto

### ✅ Fase 0: Setup Inicial
**Estado**: Completado
- Configuración del monorepo con Turborepo
- Setup de NestJS y Next.js
- Configuración de PostgreSQL con Docker
- Setup de Prisma

**Documento**: [CHECKPOINT_FASE_0.md](../CHECKPOINT_FASE_0.md)

### ✅ Fase 1: Sistema de Autenticación
**Estado**: Completado
- Modelo Tutor en Prisma
- Módulo Auth completo (NestJS)
- Guards, Strategies, Decorators
- Cliente Axios con interceptors
- Store Zustand con persist
- Componentes UI (Button, Input, Card)
- 4 endpoints funcionales

**Documentos**:
- [CHECKPOINT_FASE_1.md](../CHECKPOINT_FASE_1.md) - Detalles completos
- [ARCHITECTURE_FASE_1.md](./ARCHITECTURE_FASE_1.md) - Diagramas y flujos
- [SESSION_SUMMARY.md](../SESSION_SUMMARY.md) - Resumen ejecutivo

### 🔄 Fase 2: Páginas de Autenticación (TODO)
**Estado**: Pendiente
- Página de login
- Página de registro
- Dashboard protegido
- Navbar con estado de auth
- Middleware de protección de rutas

### 🔮 Fases Futuras
- Fase 3: Gestión de Atletas
- Fase 4: Sistema de Ejercicios
- Fase 5: Planes de Entrenamiento
- Fase 6: Dashboard de Progreso

---

## 🔍 Buscar Información

### ¿Cómo hacer...?

- **Registrar un usuario**: Ver [CURL_EXAMPLES.md](../apps/api/CURL_EXAMPLES.md)
- **Usar componentes UI**: Ver [ComponentShowcase.tsx](../apps/web/src/components/ui/ComponentShowcase.tsx)
- **Proteger una ruta**: Ver [auth/README.md](../apps/api/src/auth/README.md)
- **Usar el store de auth**: Ver [store/README.md](../apps/web/src/store/README.md)
- **Ejecutar migraciones**: Ver [QUICK_START.md](../QUICK_START.md)

### ¿Dónde está...?

- **Backend**: `apps/api/src/`
- **Frontend**: `apps/web/src/`
- **Componentes UI**: `apps/web/src/components/ui/`
- **Documentación**: `docs/` y raíz del proyecto
- **Migraciones**: `apps/api/prisma/migrations/`

---

## 🛠️ Comandos Rápidos

```bash
# Ver esta documentación
cat docs/README.md

# Iniciar desarrollo
npm run dev

# Build completo
npm run build

# Ver showcase de componentes
# http://localhost:3000/showcase

# Ver guía rápida
cat QUICK_START.md

# Ver arquitectura detallada
cat docs/ARCHITECTURE_FASE_1.md
```

---

## 📊 Estructura del Proyecto

```
Mateatletas-Ecosystem/
├── docs/                          ← Esta carpeta
│   ├── README.md                  ← Este archivo
│   ├── ARCHITECTURE_FASE_1.md     ← Diagramas y flujos
│   ├── guia-de-construccion.md
│   ├── manual-construccion-diseno-fases.md
│   ├── frontend-arquitectura.md
│   └── slice-1.md
│
├── apps/
│   ├── api/                       ← Backend NestJS
│   │   ├── src/
│   │   │   └── auth/              ← Módulo de autenticación
│   │   │       └── README.md      ← Doc del módulo
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── CURL_EXAMPLES.md       ← Ejemplos de API
│   │
│   └── web/                       ← Frontend Next.js
│       └── src/
│           ├── components/ui/     ← Componentes reutilizables
│           ├── lib/               ← Axios y API client
│           │   └── README.md      ← Doc de lib
│           └── store/             ← Estado global
│               └── README.md      ← Doc de store
│
├── CHECKPOINT_FASE_0.md           ← Setup inicial
├── CHECKPOINT_FASE_1.md           ← Fase 1 completa
├── QUICK_START.md                 ← Guía rápida
└── SESSION_SUMMARY.md             ← Resumen de sesión
```

---

## 📚 Recursos Externos

### Tecnologías Utilizadas

- **NestJS**: https://docs.nestjs.com/
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Zustand**: https://zustand-demo.pmnd.rs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Turborepo**: https://turbo.build/repo/docs

### Librerías de Auth

- **Passport.js**: https://www.passportjs.org/
- **JWT**: https://jwt.io/
- **bcrypt**: https://www.npmjs.com/package/bcrypt

---

## 🤝 Contribuir

### Agregar Nueva Documentación

1. Crea el archivo en la carpeta apropiada (`docs/` o raíz)
2. Actualiza este `README.md` con el nuevo enlace
3. Usa formato Markdown consistente
4. Incluye fecha de última actualización

### Actualizar Documentación Existente

1. Edita el archivo correspondiente
2. Actualiza la fecha de última modificación
3. Si cambias estructura, actualiza índices

---

## 📞 Contacto

Para preguntas sobre la documentación o el proyecto:

1. Revisa la documentación existente
2. Busca en los archivos README de cada módulo
3. Consulta [QUICK_START.md](../QUICK_START.md) para troubleshooting

---

## ✅ Checklist de Lectura Recomendada

Para un nuevo desarrollador, recomendamos leer en este orden:

- [ ] [QUICK_START.md](../QUICK_START.md) - Configuración inicial
- [ ] [CHECKPOINT_FASE_1.md](../CHECKPOINT_FASE_1.md) - Estado actual
- [ ] [ARCHITECTURE_FASE_1.md](./ARCHITECTURE_FASE_1.md) - Arquitectura
- [ ] [apps/api/src/auth/README.md](../apps/api/src/auth/README.md) - Backend Auth
- [ ] [apps/web/src/store/README.md](../apps/web/src/store/README.md) - Frontend State
- [ ] [ComponentShowcase.tsx](../apps/web/src/components/ui/ComponentShowcase.tsx) - Componentes UI

**Tiempo estimado**: 30-45 minutos

Después de leer estos documentos, tendrás una comprensión completa del proyecto y podrás comenzar a desarrollar.

---

**Última Actualización**: 2025-10-12
**Mantenedor**: Equipo Mateatletas
**Versión**: 1.0
