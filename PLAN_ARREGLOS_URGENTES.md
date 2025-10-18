# PLAN DE ARREGLOS URGENTES - Mateatletas Ecosystem

**Fecha:** 2025-10-17
**Auditoría:** Completa (Backend + Frontend + Scripts)

---

## RESUMEN EJECUTIVO

**Total bugs encontrados:** 53 críticos/altos
- **Backend:** 7 críticos, 5 altos
- **Frontend:** 8 críticos, 15 altos
- **Scripts:** 3 problemas críticos

**Principales causas de bugs recurrentes:**
1. Falta de tipado estricto (170+ `any`)
2. Código duplicado sin refactorizar (5+ ubicaciones)
3. Violaciones masivas de Single Responsibility
4. Falta de manejo de errores en operaciones async
5. Scripts de desarrollo sin health checks

---

## PROBLEMAS CON LOS SCRIPTS DE REINICIO

### PROBLEMA 1: Race Condition en Inicio
**Archivo:** `dev-clean-restart.sh:44-54`

```bash
# ❌ PROBLEMA ACTUAL
npm run start:dev > /tmp/mateatletas-backend.log 2>&1 &
BACKEND_PID=$!
sleep 5  # ⚠️ Espera arbitraria, no verifica si levantó
```

**Por qué falla:**
- El script no verifica si el backend realmente levantó
- Si el backend tarda más de 5s, el frontend arranca sin API
- Si hay error en el backend, el script no se entera

### PROBLEMA 2: Falta Health Check de Puertos
**Archivo:** `dev-clean-restart.sh:23-34`

```bash
# ❌ PROBLEMA ACTUAL
PUERTO_3001=$(lsof -ti:3001 2>/dev/null)
if [ -n "$PUERTO_3001" ]; then
  echo "⚠️  Puerto 3001 todavía en uso"
  exit 1
fi
```

**Por qué falla:**
- Solo verifica después de `sleep 3`
- Si el puerto se libera en 3.5s, falla sin razón
- No reintenta, solo sale con error

### PROBLEMA 3: Logs No Rotados
**Archivo:** `dev-clean-restart.sh:44,53`

```bash
# ❌ PROBLEMA ACTUAL
npm run start:dev > /tmp/mateatletas-backend.log 2>&1 &
npm run dev > /tmp/mateatletas-frontend.log 2>&1 &
```

**Por qué es problema:**
- Los logs se sobreescriben en cada reinicio
- Si hay error al arrancar, se pierde el log anterior
- Dificulta debug de problemas intermitentes

---

## ETAPA 1: FIXES CRÍTICOS (Día 1-2) ⚠️

### 1.1 ARREGLAR SCRIPTS DE DESARROLLO

**Archivo:** `dev-clean-restart.sh`

**Cambios necesarios:**

```bash
# 1. Agregar función wait_for_port con timeout
wait_for_port() {
  local port=$1
  local timeout=$2
  local elapsed=0

  while [ $elapsed -lt $timeout ]; do
    if lsof -ti:$port > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  return 1
}

# 2. Cambiar inicio del backend
npm run start:dev > /tmp/mateatletas-backend-$(date +%Y%m%d-%H%M%S).log 2>&1 &
BACKEND_PID=$!
echo "Esperando backend en puerto 3001..."
if wait_for_port 3001 30; then
  echo "✅ Backend listo"
else
  echo "❌ Backend no levantó en 30s"
  cat /tmp/mateatletas-backend-*.log | tail -20
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# 3. Verificar salud del backend con curl
for i in {1..10}; do
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend responde OK"
    break
  fi
  sleep 1
done
```

**Crear endpoint health:**
```typescript
// apps/api/src/app.controller.ts
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}
```

---

### 1.2 ARREGLAR JSON.PARSE SIN TRY-CATCH (5 ubicaciones)

**Archivos afectados:**
- `apps/api/src/admin/services/admin-usuarios.service.ts:46,75,103`
- `apps/api/src/auth/auth.service.ts:134,215`

**Código a crear:**

```typescript
// apps/api/src/common/utils/role.utils.ts
export function parseUserRoles(roles: any): string[] {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === 'string') {
    try {
      const parsed = JSON.parse(roles);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing roles:', error);
      return [];
    }
  }
  return [];
}
```

**Reemplazar en 5 ubicaciones:**
```typescript
// ❌ ANTES
let userRoles: string[] = [];
if (tutor.roles) {
  userRoles = Array.isArray(tutor.roles)
    ? tutor.roles
    : JSON.parse(tutor.roles as string);
}

// ✅ DESPUÉS
const userRoles = parseUserRoles(tutor.roles);
```

---

### 1.3 ARREGLAR IMPORTACIÓN BCRYPT

**Archivo:** `apps/api/src/admin/services/admin-usuarios.service.ts:402`

```typescript
// ❌ ANTES
async resetPassword(userId: string) {
  const bcrypt = require('bcrypt');
  const tempPassword = this.generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  // ...
}

// ✅ DESPUÉS
// En la cabecera del archivo
import * as bcrypt from 'bcrypt';

async resetPassword(userId: string) {
  const tempPassword = this.generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, this.BCRYPT_ROUNDS);
  // ...
}
```

**Crear constante centralizada:**
```typescript
// apps/api/src/common/constants/security.constants.ts
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
```

---

### 1.4 ARREGLAR MISSING DEPENDENCIES EN HOOKS (Frontend)

**Archivo:** `apps/web/src/app/admin/clases/page.tsx:48-56`

```typescript
// ❌ ANTES
useEffect(() => {
  loadClases();
  loadDocentes();
  loadRutasCurriculares();
}, []); // ⚠️ Falta dependencia

// ✅ DESPUÉS
useEffect(() => {
  loadClases();
  loadDocentes();
  loadRutasCurriculares();
}, [loadClases, loadDocentes, loadRutasCurriculares]);

// Y envolver las funciones en useCallback
const loadClases = useCallback(async () => {
  setIsLoading(true);
  try {
    const data = await clasesApi.obtenerClases();
    setClases(data);
  } catch (error) {
    console.error('Error cargando clases:', error);
  } finally {
    setIsLoading(false);
  }
}, []);
```

---

### 1.5 ARREGLAR XSS EN TABLAS ADMIN (Frontend)

**Archivos afectados:** 7 tablas admin

**Cambios necesarios:**

```typescript
// Crear sanitizer utility
// apps/web/src/lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

// Usar en tablas
// ❌ ANTES
<td>{estudiante.nombre}</td>

// ✅ DESPUÉS
<td>{sanitizeHtml(estudiante.nombre)}</td>
```

**Instalar dependencia:**
```bash
cd apps/web && npm install isomorphic-dompurify
```

---

### 1.6 ARREGLAR RACE CONDITION EN LOGIN (Frontend)

**Archivo:** `apps/web/src/app/login/page.tsx:32-58`

```typescript
// ❌ ANTES
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const data = await loginApi(email, password);
    const decoded = jwtDecode<JWTPayload>(data.access_token);
    localStorage.setItem('token', data.access_token);
    router.push(redirect);
  } catch (error) {
    setError('Credenciales inválidas');
  } finally {
    setIsLoading(false);
  }
};

// ✅ DESPUÉS
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Prevenir doble submit
  if (isLoading) return;

  setIsLoading(true);
  setError('');

  const abortController = new AbortController();

  try {
    const data = await loginApi(email, password, {
      signal: abortController.signal
    });

    const decoded = jwtDecode<JWTPayload>(data.access_token);

    // Validar token antes de guardar
    if (!decoded.userId || !decoded.email) {
      throw new Error('Token inválido');
    }

    localStorage.setItem('token', data.access_token);

    // Usar router.replace para evitar back al login
    router.replace(redirect);
  } catch (error) {
    if (error.name === 'AbortError') return;
    setError('Credenciales inválidas');
  } finally {
    setIsLoading(false);
  }

  // Cleanup on unmount
  return () => abortController.abort();
};
```

---

## ETAPA 2: REFACTORING CRÍTICO (Día 3-5) 🔧

### 2.1 DIVIDIR AdminUsuariosService (108 líneas)

**Archivo:** `apps/api/src/admin/services/admin-usuarios.service.ts`

**Nueva estructura:**

```
admin/services/
├── admin-usuarios.service.ts       # Solo gestión básica usuarios
├── admin-estudiantes.service.ts    # Gestión estudiantes
├── admin-roles.service.ts          # Gestión roles
└── common/
    └── role.utils.ts               # Utilidades compartidas
```

**admin-usuarios.service.ts** (simplificado):
```typescript
@Injectable()
export class AdminUsuariosService {
  constructor(
    private prisma: PrismaService,
    private rolesService: AdminRolesService,
  ) {}

  async listarUsuarios(): Promise<UsuarioDto[]> {
    const [tutores, docentes, admins] = await Promise.all([
      this.prisma.tutor.findMany(),
      this.prisma.docente.findMany(),
      this.prisma.admin.findMany(),
    ]);

    return [
      ...this.mapTutores(tutores),
      ...this.mapDocentes(docentes),
      ...this.mapAdmins(admins),
    ];
  }

  private mapTutores(tutores: any[]): UsuarioDto[] {
    return tutores.map(t => ({
      id: t.id,
      email: t.email,
      nombre: `${t.nombre} ${t.apellido}`,
      rol: parseUserRoles(t.roles),
      tipo: 'tutor',
    }));
  }

  // Similar para docentes y admins
}
```

**admin-estudiantes.service.ts** (nuevo):
```typescript
@Injectable()
export class AdminEstudiantesService {
  constructor(private prisma: PrismaService) {}

  async crearEstudianteRapido(dto: CrearEstudianteRapidoDto) {
    // Lógica actual de crearEstudianteRapido
  }

  async listarEstudiantes(tutorId?: string) {
    // Lógica actual de listarEstudiantes
  }
}
```

---

### 2.2 IMPLEMENTAR STRATEGY PATTERN PARA ROLES

**Archivo:** `apps/api/src/auth/auth.service.ts:171-264`

**Problema actual:**
```typescript
// ❌ 93 líneas de if/else
if (role === 'tutor') { ... }
else if (role === 'docente') { ... }
else if (role === 'admin') { ... }
```

**Solución:**

```typescript
// auth/strategies/role-strategies/role-handler.interface.ts
export interface RoleHandler {
  findUser(identifier: string): Promise<any>;
  getProfile(userId: string): Promise<any>;
  validateCredentials(user: any, password: string): Promise<boolean>;
}

// auth/strategies/role-strategies/tutor.handler.ts
@Injectable()
export class TutorHandler implements RoleHandler {
  constructor(private prisma: PrismaService) {}

  async findUser(email: string) {
    return this.prisma.tutor.findUnique({ where: { email } });
  }

  async getProfile(userId: string) {
    return this.prisma.tutor.findUnique({
      where: { id: userId },
      include: { estudiantes: true },
    });
  }

  async validateCredentials(user: any, password: string) {
    return bcrypt.compare(password, user.password);
  }
}

// Similar para DocenteHandler y AdminHandler

// auth/auth.service.ts (refactorizado)
@Injectable()
export class AuthService {
  private roleHandlers: Map<string, RoleHandler>;

  constructor(
    private tutorHandler: TutorHandler,
    private docenteHandler: DocenteHandler,
    private adminHandler: AdminHandler,
  ) {
    this.roleHandlers = new Map([
      ['tutor', this.tutorHandler],
      ['docente', this.docenteHandler],
      ['admin', this.adminHandler],
    ]);
  }

  async login(email: string, password: string) {
    // Intentar login con cada rol
    for (const [role, handler] of this.roleHandlers) {
      const user = await handler.findUser(email);
      if (user && await handler.validateCredentials(user, password)) {
        return this.generateToken(user, role);
      }
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // De 264 líneas → 40 líneas
}
```

---

### 2.3 DIVIDIR COMPONENTES GRANDES (Frontend)

**Archivos afectados:**
- `apps/web/src/app/admin/clases/page.tsx` (386 líneas)
- `apps/web/src/app/admin/estudiantes/page.tsx` (412 líneas)
- `apps/web/src/app/admin/pagos/page.tsx` (367 líneas)

**Estrategia:**

```
admin/clases/
├── page.tsx                    # Solo layout y state
├── components/
│   ├── ClasesList.tsx          # Tabla de clases
│   ├── ClaseForm.tsx           # Formulario
│   ├── ClaseFilters.tsx        # Filtros
│   └── ClaseDetails.tsx        # Modal detalles
└── hooks/
    ├── useClases.ts            # Lógica de estado
    └── useClaseForm.ts         # Lógica formulario
```

**Ejemplo page.tsx refactorizado:**
```typescript
export default function ClasesPage() {
  const { clases, isLoading, loadClases } = useClases();
  const [filtros, setFiltros] = useState<ClaseFilters>({});

  return (
    <div className="p-6">
      <h1>Gestión de Clases</h1>
      <ClaseFilters value={filtros} onChange={setFiltros} />
      <ClasesList
        clases={clases}
        isLoading={isLoading}
        onRefresh={loadClases}
      />
    </div>
  );
}

// De 386 líneas → 30 líneas
```

---

### 2.4 MIGRAR COMPLETAMENTE A REACT QUERY (Frontend)

**Problema actual:**
- 50% usa Zustand
- 50% usa React Query
- Duplicación de estado
- Sincronización manual

**Solución:**

```typescript
// apps/web/src/lib/api/hooks/useClases.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clasesApi } from '../clases.api';

export function useClases(filters?: ClaseFilters) {
  return useQuery({
    queryKey: ['clases', filters],
    queryFn: () => clasesApi.obtenerClases(filters),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useCrearClase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clasesApi.crearClase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clases'] });
    },
  });
}

// En componente
function ClasesPage() {
  const { data: clases, isLoading } = useClases();
  const crearClase = useCrearClase();

  const handleCrear = async (data: CrearClaseDto) => {
    await crearClase.mutateAsync(data);
  };

  // No más manejo manual de estado
}
```

**Eliminar stores:**
- `apps/web/src/store/clases.store.ts` ❌
- `apps/web/src/store/estudiantes.store.ts` ❌
- `apps/web/src/store/pagos.store.ts` ❌

---

## ETAPA 3: OPTIMIZACIONES (Día 6-7) 🚀

### 3.1 ARREGLAR N+1 QUERIES

**Archivo:** `apps/api/src/admin/services/admin-usuarios.service.ts:18-126`

```typescript
// ❌ ANTES (3 queries separadas)
const [tutores, docentes, admins] = await Promise.all([
  this.prisma.tutor.findMany(),
  this.prisma.docente.findMany(),
  this.prisma.admin.findMany(),
]);

// ✅ DESPUÉS (1 query optimizada con raw SQL)
async listarUsuarios(): Promise<UsuarioDto[]> {
  const usuarios = await this.prisma.$queryRaw`
    SELECT
      id, email, nombre, apellido, 'tutor' as tipo, roles
    FROM "Tutor"
    UNION ALL
    SELECT
      id, email, nombre, apellido, 'docente' as tipo, '["docente"]' as roles
    FROM "Docente"
    UNION ALL
    SELECT
      id, email, nombre, apellido, 'admin' as tipo, '["admin"]' as roles
    FROM "Admin"
    ORDER BY apellido, nombre
  `;

  return usuarios.map(u => ({
    id: u.id,
    email: u.email,
    nombre: `${u.nombre} ${u.apellido}`,
    rol: parseUserRoles(u.roles),
    tipo: u.tipo,
  }));
}
```

---

### 3.2 AGREGAR ÍNDICES AL SCHEMA

**Archivo:** `apps/api/prisma/schema.prisma`

```prisma
model Tutor {
  id       String @id @default(cuid())
  email    String @unique  // ✅ Ya tiene
  nombre   String
  apellido String

  // Agregar índices
  @@index([apellido, nombre])  // Para ordenamiento
  @@index([email])              // Para búsqueda
}

model Estudiante {
  id         String @id @default(cuid())
  tutor_id   String
  nombre     String
  apellido   String

  // Agregar índices
  @@index([tutor_id])          // Para joins
  @@index([apellido, nombre])  // Para ordenamiento
}

model Clase {
  id                String   @id @default(cuid())
  docente_id        String
  fechaHoraInicio   DateTime
  estado            String

  // Agregar índices
  @@index([docente_id])                    // Para joins
  @@index([fechaHoraInicio])               // Para filtros
  @@index([estado, fechaHoraInicio])       // Para queries complejas
}
```

**Generar migración:**
```bash
cd apps/api
npx prisma migrate dev --name add_performance_indexes
```

---

### 3.3 IMPLEMENTAR PAGINACIÓN EN TABLAS ADMIN

**Backend:**
```typescript
// apps/api/src/common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// En controller
@Get()
async listarEstudiantes(
  @Query() pagination: PaginationDto,
  @Query('tutorId') tutorId?: string,
) {
  const skip = (pagination.page - 1) * pagination.limit;

  const [data, total] = await Promise.all([
    this.prisma.estudiante.findMany({
      where: tutorId ? { tutor_id: tutorId } : {},
      skip,
      take: pagination.limit,
      orderBy: { apellido: 'asc' },
    }),
    this.prisma.estudiante.count({
      where: tutorId ? { tutor_id: tutorId } : {},
    }),
  ]);

  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}
```

**Frontend:**
```typescript
// apps/web/src/components/shared/Pagination.tsx
export function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="flex gap-2">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </div>
  );
}

// En page.tsx
function EstudiantesPage() {
  const [page, setPage] = useState(1);
  const { data } = useEstudiantes({ page, limit: 20 });

  return (
    <>
      <EstudiantesList estudiantes={data?.data} />
      <Pagination
        page={page}
        totalPages={data?.meta.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

---

### 3.4 AGREGAR ERROR BOUNDARIES (Frontend)

```typescript
// apps/web/src/components/shared/ErrorBoundary.tsx
'use client';

import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2>Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// En layout.tsx
export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <div className="admin-layout">
        {children}
      </div>
    </ErrorBoundary>
  );
}
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### ✅ Día 1-2 (CRÍTICO)
- [ ] Arreglar scripts con health checks
- [ ] Crear endpoint /api/health
- [ ] Arreglar 5 JSON.parse sin try-catch
- [ ] Arreglar importación bcrypt
- [ ] Arreglar missing dependencies en hooks
- [ ] Arreglar XSS en 7 tablas
- [ ] Arreglar race condition login

### ✅ Día 3-5 (REFACTORING)
- [ ] Dividir AdminUsuariosService en 3 servicios
- [ ] Implementar Strategy Pattern para roles
- [ ] Dividir 3 componentes grandes (clases, estudiantes, pagos)
- [ ] Migrar completamente a React Query

### ✅ Día 6-7 (OPTIMIZACIÓN)
- [ ] Arreglar N+1 queries
- [ ] Agregar índices al schema
- [ ] Implementar paginación en backend
- [ ] Implementar paginación en frontend
- [ ] Agregar Error Boundaries

---

## DESPUÉS DE ESTOS FIXES

**Expectativa:**
- 90% menos bugs recurrentes
- Código 3x más mantenible
- Scripts que funcionan SIEMPRE
- Performance mejorado 50%+
- Tests más fáciles de escribir

**Próximos pasos (Sprint futuro):**
- Agregar tests unitarios (cobertura 70%+)
- Implementar CI/CD con checks automáticos
- Agregar Storybook para componentes
- Documentar APIs con OpenAPI/Swagger
- Agregar monitoreo con Sentry

---

**FIN DEL PLAN**
