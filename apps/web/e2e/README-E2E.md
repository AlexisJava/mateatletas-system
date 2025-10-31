# 🧪 Tests E2E - Mateatletas

Suite completa de tests End-to-End con Playwright para verificar funcionalidades críticas antes del lanzamiento.

---

## 🚀 INICIO RÁPIDO

### 1. Ejecutar Tests Críticos (Pre-Lanzamiento)

```bash
cd apps/web
npx playwright test 00-critical-launch.spec.ts
```

### 2. Ver Reporte HTML

```bash
npx playwright show-report
```

---

## 📂 ESTRUCTURA

```
e2e/
├── helpers/
│   └── portal-helpers.ts              # Funciones auxiliares compartidas
│
├── 00-critical-launch.spec.ts         # 🔴 CRÍTICOS - 5 tests que DEBEN PASAR
├── 00-diagnostico.spec.ts             # 🔍 Diagnóstico del sistema - 3 tests
│
├── estudiante-critical.spec.ts        # 🎓 Portal Estudiante - 8 tests
├── docente-critical.spec.ts           # 👨‍🏫 Portal Docente - 10 tests
└── tutor-basic.spec.ts                # 👨‍👩‍👧 Portal Tutor - 6 tests (skip)
```

---

## ⚡ COMANDOS PRINCIPALES

| Comando | Descripción |
|---------|-------------|
| `npx playwright test` | Ejecutar todos los tests |
| `npx playwright test 00-critical-launch.spec.ts` | Solo tests críticos |
| `npx playwright test --ui` | UI interactiva |
| `npx playwright test --debug` | Modo debug |
| `npx playwright show-report` | Ver reporte HTML |

---

## 📊 RESUMEN DE TESTS

| Suite | Tests | Estado | Tiempo Est. |
|-------|-------|--------|-------------|
| Critical Paths | 5 | ⚠️ Requiere ajuste | 60s |
| Estudiante | 8 | ⚠️ Requiere ajuste | 90s |
| Docente | 10 | ⚠️ Requiere ajuste | 120s |
| Tutor | 6 | ⚪ Skip | N/A |
| **TOTAL** | **29** | **23 activos** | **~4min** |

---

## 🎯 USUARIOS DE PRUEBA

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Estudiante | `lucas.garcia@email.com` | `Student123!` |
| Docente | `juan.perez@docente.com` | `Test123!` |
| Admin | `admin@mateatletas.com` | `Admin123!` |

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **[REPORTE-E2E-PRE-LANZAMIENTO.md](../../../REPORTE-E2E-PRE-LANZAMIENTO.md)** - Resultados detallados
- **[GUIA-EJECUCION-TESTS-E2E.md](../../../GUIA-EJECUCION-TESTS-E2E.md)** - Guía completa

---

*Tests implementados: 31 de octubre de 2025*
