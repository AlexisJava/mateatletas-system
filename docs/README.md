# 📚 Documentación Mateatletas Ecosystem

Bienvenido a la documentación completa del proyecto Mateatletas.

---

## 🗂️ Estructura de Documentación

```
docs/
├── api-specs/        # Especificaciones de endpoints y módulos
├── architecture/     # Diagramas y documentación de arquitectura
├── development/      # Guías de desarrollo y setup
├── slices/          # Documentación por vertical slice
├── testing/         # Resultados y guías de testing
├── archived/        # Documentos históricos
└── README.md        # Este archivo
```

---

## 🎯 Inicio Rápido

### Para Nuevos Desarrolladores

1. **Lee primero**: [development/QUICK_START.md](development/QUICK_START.md)
2. **Setup inicial**: [development/setup_inicial.md](development/setup_inicial.md)
3. **Arquitectura**: [architecture/ARCHITECTURE_FASE_1.md](architecture/ARCHITECTURE_FASE_1.md)
4. **Testing**: [testing/TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md)

### Para Trabajar con APIs

1. **Autenticación**: [api-specs/Autenticacion.md](api-specs/Autenticacion.md)
2. **Estudiantes**: [api-specs/estudiantes.md](api-specs/estudiantes.md)
3. **Docentes**: [api-specs/docentes.md](api-specs/docentes.md)
4. **Ver todos**: [api-specs/](api-specs/)

---

## 📋 Documentos por Categoría

### 🏗️ Arquitectura

| Documento | Descripción |
|-----------|-------------|
| [arquitectura-de-software.md](architecture/arquitectura-de-software.md) | Arquitectura general del sistema |
| [ARCHITECTURE_FASE_1.md](architecture/ARCHITECTURE_FASE_1.md) | Arquitectura detallada Fase 1 |
| [frontend-arquitectura.md](architecture/frontend-arquitectura.md) | Arquitectura del frontend Next.js |
| [documento-tecnico-del-backend.md](architecture/documento-tecnico-del-backend.md) | Especificaciones técnicas del backend |
| [design-system.md](architecture/design-system.md) | Sistema de diseño y componentes |
| [context.md](architecture/context.md) | Contexto general del proyecto |

### 🔧 Desarrollo

| Documento | Descripción |
|-----------|-------------|
| [QUICK_START.md](development/QUICK_START.md) | Guía de inicio rápido |
| [setup_inicial.md](development/setup_inicial.md) | Configuración inicial paso a paso |
| [guia-de-construccion.md](development/guia-de-construccion.md) | Guía general de construcción |
| [manual-construccion-diseno-fases.md](development/manual-construccion-diseno-fases.md) | Manual de diseño por fases |
| [prisma-schema-unificado.md](development/prisma-schema-unificado.md) | Documentación del schema de Prisma |
| [CONTRIBUTING.md](development/CONTRIBUTING.md) | Guía de contribución |
| [DEVELOPMENT.md](development/DEVELOPMENT.md) | Guía de desarrollo |
| [GITHUB_SETUP.md](development/GITHUB_SETUP.md) | Configuración de GitHub |

### 📡 API Specs

| Módulo | Documento |
|--------|-----------|
| **Auth** | [Autenticacion.md](api-specs/Autenticacion.md) |
| **Tutores** | [tutores.md](api-specs/tutores.md) |
| **Estudiantes** | [estudiantes.md](api-specs/estudiantes.md) |
| **Docentes** | [docentes.md](api-specs/docentes.md) |
| **Catálogo** | [catalogo.md](api-specs/catalogo.md) |
| **Clases** | [clases.md](api-specs/clases.md) |
| **Reservas** | [reserva_clase.md](api-specs/reserva_clase.md) |
| **Asistencia** | [asistencia.md](api-specs/asistencia.md) |
| **Pagos** | [pagos.md](api-specs/pagos.md) |
| **Gamificación** | [gamificacion_puntos_logros.md](api-specs/gamificacion_puntos_logros.md) |
| **Admin** | [admin_copiloto.md](api-specs/admin_copiloto.md) |

### 📦 Slices Implementados

| Slice | Documento | Estado |
|-------|-----------|--------|
| #1 | [slice-1.md](slices/slice-1.md) | ✅ Completado |
| #2 | [slice-2.md](slices/slice-2.md) | ✅ Completado |
| #6 | [SLICE_6_PAGOS_SUMMARY.md](slices/SLICE_6_PAGOS_SUMMARY.md) | ✅ Completado |

### 🧪 Testing

| Documento | Descripción |
|-----------|-------------|
| [TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md) | Resumen completo de todos los tests |

Ver también: [../tests/README.md](../tests/README.md) para scripts de testing

---

## 🚀 Estado del Proyecto

### ✅ Slices Completados (7/10)

| # | Slice | Estado | Tests | Documentación |
|---|-------|--------|-------|---------------|
| 1 | Autenticación (JWT) | ✅ | ✅ | [Autenticacion.md](api-specs/Autenticacion.md) |
| 2 | Estudiantes (CRUD) | ✅ | ✅ | [estudiantes.md](api-specs/estudiantes.md) |
| 3 | Equipos (Gamificación) | ✅ | ✅ | [gamificacion_puntos_logros.md](api-specs/gamificacion_puntos_logros.md) |
| 4 | Docentes | ✅ | ✅ | [docentes.md](api-specs/docentes.md) |
| 5 | Catálogo de Productos | ✅ | ✅ | [catalogo.md](api-specs/catalogo.md) |
| 6 | Pagos (MercadoPago) | ✅ | ✅ | [pagos.md](api-specs/pagos.md) |
| 7 | Clases y Reservas | ✅ | ✅ | [clases.md](api-specs/clases.md) |

### 🔜 Próximos Slices

| # | Slice | Estado | Documentación |
|---|-------|--------|---------------|
| 8 | Sistema de Asistencia | 📋 Planificado | [asistencia.md](api-specs/asistencia.md) |
| 9 | Reserva de Clase | 📋 Planificado | [reserva_clase.md](api-specs/reserva_clase.md) |
| 10 | Admin Copilot | 📋 Planificado | [admin_copiloto.md](api-specs/admin_copiloto.md) |

Ver detalles completos: [testing/TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md)

---

## 🔍 Buscar Información

### ¿Cómo hacer...?

- **Setup inicial**: [development/setup_inicial.md](development/setup_inicial.md)
- **Ejecutar tests**: [testing/TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md)
- **Usar una API**: Ver [api-specs/](api-specs/)
- **Contribuir**: [development/CONTRIBUTING.md](development/CONTRIBUTING.md)
- **Entender arquitectura**: [architecture/ARCHITECTURE_FASE_1.md](architecture/ARCHITECTURE_FASE_1.md)

### ¿Dónde está...?

- **Código Backend**: `../apps/api/src/`
- **Código Frontend**: `../apps/web/src/`
- **Tests**: `../tests/scripts/`
- **Migraciones**: `../apps/api/prisma/migrations/`
- **Docs de módulos**: En subcarpetas de `../apps/api/src/`

---

## 📊 Documentos Archivados

Documentos históricos que ya no son relevantes pero se mantienen para referencia:

- [archived/AUDITORIA_COMPLETA.md](archived/AUDITORIA_COMPLETA.md)
- [archived/FIXES_APPLIED.md](archived/FIXES_APPLIED.md)
- [archived/TECHNICAL_DEBT.md](archived/TECHNICAL_DEBT.md)
- [archived/TECHNICAL_DEBT_RESOLVED.md](archived/TECHNICAL_DEBT_RESOLVED.md)
- [archived/INFORME_LIMPIEZA.md](archived/INFORME_LIMPIEZA.md)
- [archived/PLAN_MAESTRO_DEFINITIVO.md](archived/PLAN_MAESTRO_DEFINITIVO.md)

---

## 🛠️ Comandos Rápidos

```bash
# Ver documentación de testing
cat docs/testing/TESTING_SUMMARY.md

# Ver especificaciones de API
ls docs/api-specs/

# Ejecutar tests
cd tests/scripts && ./test-integration-full.sh

# Ver guía rápida
cat docs/development/QUICK_START.md

# Ver arquitectura
cat docs/architecture/ARCHITECTURE_FASE_1.md
```

---

## 📚 Recursos Externos

### Tecnologías Backend
- **NestJS**: https://docs.nestjs.com/
- **Prisma**: https://www.prisma.io/docs
- **Passport.js**: https://www.passportjs.org/
- **JWT**: https://jwt.io/

### Tecnologías Frontend
- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://zustand-demo.pmnd.rs/

### DevOps
- **Turborepo**: https://turbo.build/repo/docs
- **Docker**: https://docs.docker.com/

---

## 🤝 Contribuir a la Documentación

### Agregar Nueva Documentación

1. Determina la categoría apropiada:
   - `api-specs/` - Especificaciones de endpoints
   - `architecture/` - Documentación de arquitectura
   - `development/` - Guías de desarrollo
   - `slices/` - Documentación de slices
   - `testing/` - Testing y QA

2. Crea el archivo con formato `.md`

3. Actualiza este `README.md` con el nuevo enlace

4. Incluye fecha de última actualización al final del documento

### Formato Recomendado

```markdown
# Título del Documento

Breve descripción del propósito.

## Sección 1

Contenido...

## Sección 2

Contenido...

---

**Última actualización:** YYYY-MM-DD
**Autor:** Nombre
```

---

## ✅ Checklist de Lectura Recomendada

Para un nuevo desarrollador, recomendamos leer en este orden:

- [ ] [development/QUICK_START.md](development/QUICK_START.md) - Configuración inicial (10 min)
- [ ] [development/setup_inicial.md](development/setup_inicial.md) - Setup detallado (15 min)
- [ ] [architecture/ARCHITECTURE_FASE_1.md](architecture/ARCHITECTURE_FASE_1.md) - Arquitectura (20 min)
- [ ] [testing/TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md) - Estado de tests (10 min)
- [ ] [api-specs/Autenticacion.md](api-specs/Autenticacion.md) - API de Auth (5 min)
- [ ] Explorar otros módulos en [api-specs/](api-specs/) según necesidad

**Tiempo estimado total**: ~60 minutos

Después de leer estos documentos, tendrás una comprensión completa del proyecto.

---

## 📞 Obtener Ayuda

1. **Revisa la documentación relevante** en esta carpeta
2. **Busca en los archivos README** de cada módulo en `apps/`
3. **Consulta los tests** en `../tests/scripts/` para ejemplos prácticos
4. **Revisa el código** - está bien documentado con comentarios

---

**Última Actualización**: 2025-10-13
**Versión**: 2.0 (Post-organización)
**Slices Completados**: 7/10
