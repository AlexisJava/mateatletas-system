2025-10-13T14:33:49Z - Asegurar panel admin Phase 3
- apps/api/src/auth/auth.controller.ts
- apps/api/src/auth/auth.service.ts
- apps/api/src/catalogo/productos.controller.ts
- apps/api/src/clases/clases.controller.ts
- apps/api/src/docentes/docentes.controller.ts
- apps/api/src/admin/admin.controller.ts
- apps/api/src/admin/admin.service.ts
- apps/web/src/lib/api/admin.api.ts
- apps/web/src/lib/api/auth.api.ts
- apps/web/src/store/auth.store.ts
- apps/web/src/app/admin/layout.tsx
- apps/web/src/app/admin/clases/page.tsx
- apps/web/src/app/admin/reportes/page.tsx
2025-10-13T15:00:49Z - Phase 3 admin hardening follow-up
- apps/api/src/catalogo/productos.controller.ts
- apps/api/src/docentes/docentes.controller.ts
- apps/api/src/clases/clases.controller.ts
- apps/api/src/auth/auth.controller.ts
- apps/api/src/auth/auth.service.ts
- apps/api/src/admin/admin.controller.ts
- apps/api/src/admin/admin.service.ts
- apps/web/src/components/ui/Badge.tsx
- apps/web/src/components/ui/Card.tsx
- apps/web/src/components/ui/Modal.tsx
- apps/web/src/app/(protected)/membresia/planes/page.tsx
- apps/web/src/app/(protected)/mis-clases/page.tsx
- apps/web/src/components/docente/AttendanceList.tsx
- apps/web/src/app/docente/dashboard/page.tsx
- apps/web/src/components/features/clases/ClassReservationModal.tsx
- apps/web/src/components/features/clases/ClassCard.tsx
- apps/web/src/store/catalogo.store.ts
- apps/web/src/store/pagos.store.ts
- apps/web/src/app/admin/usuarios/page.tsx
- apps/web/src/store/auth.store.ts
- apps/web/src/lib/api/auth.api.ts
- apps/web/src/lib/api/admin.api.ts
- apps/web/src/app/admin/layout.tsx
- apps/web/src/app/admin/clases/page.tsx
- apps/web/src/app/admin/reportes/page.tsx
Validaciones: type-check ✅ | test-integration-full ❌ (API/PostgreSQL no disponibles en el entorno) | POST /admin/usuarios/:id/role pendiente de verificación manual
2025-10-13T15:30:56Z - Restablecer seeds principales
- apps/api/prisma/seed.ts
Validaciones: no ejecutadas (solo reconstrucción del seed)
Notas: ajustes posteriores al seed para usar enums Prisma.
2025-10-13T15:54:14Z - Ajuste roles clases
- apps/api/src/clases/clases.controller.ts
Validaciones: pendientes de reejecutar test de integración
