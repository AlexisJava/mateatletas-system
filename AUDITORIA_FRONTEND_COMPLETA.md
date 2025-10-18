# AUDITORÍA EXHAUSTIVA DEL FRONTEND - MATEATLETAS

**Fecha:** 2025-10-17  
**Scope:** apps/web/src (TypeScript/React con Next.js 14, Zustand, TailwindCSS)  
**Severidad total:** 42 issues (8 CRÍTICAS, 15 ALTAS, 12 MEDIAS, 7 BAJAS)

---

## ERRORES CRÍTICOS (Deben corregirse antes de producción)

### 1. MISSING DEPENDENCY IN useEffect - useMisClases hook
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/docente/mis-clases/hooks/useMisClases.ts`  
**Línea:** 34-36  
**Tipo:** Error - React Hooks  
**Severidad:** CRÍTICA

```typescript
useEffect(() => {
  fetchMisClases();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Problema:** Se desactiva la regla ESLint con `eslint-disable-next-line`. `fetchMisClases` debería estar en las dependencias o ser estable (memoizada).

**Solución:**
```typescript
useEffect(() => {
  fetchMisClases();
}, [fetchMisClases]); // Agregar como dependencia
// OR
useCallback(() => {
  fetchMisClases();
}, [])
```

---

### 2. STATE MUTATION IN ZUSTAND - admin.store
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/store/admin.store.ts`  
**Línea:** 122-124  
**Tipo:** Error - Tipado  
**Severidad:** CRÍTICA

```typescript
const response = await adminApi.getAllClasses() as unknown as { data: Clase[]; meta?: unknown } | Clase[];
const classes = Array.isArray(response) ? response : (response?.data || []);
```

**Problema:** Type casting incorrecto a `unknown`. Si `response` no es del tipo esperado, causará runtime error.

**Solución:** Usar type guard apropiado
```typescript
function isClassesArray(response: unknown): response is Clase[] {
  return Array.isArray(response);
}
```

---

### 3. MISSING AWAIT EN async loadFormData - admin/clases page
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/clases/page.tsx`  
**Línea:** 42-45  
**Tipo:** Error - Async/Await  
**Severidad:** CRÍTICA

```typescript
useEffect(() => {
  fetchClasses();
  loadFormData();  // NO ESPERA, puede fallar silenciosamente
}, []);
```

**Problema:** `loadFormData()` retorna Promise pero no se espera. Si hay error, no se captura.

**Solución:**
```typescript
useEffect(() => {
  const load = async () => {
    await fetchClasses();
    await loadFormData();
  };
  load().catch(error => console.error('Error loading:', error));
}, []);
```

---

### 4. RACE CONDITION EN login page
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/login/page.tsx`  
**Línea:** 128-143  
**Tipo:** Error - Race Condition  
**Severidad:** CRÍTICA

```typescript
useEffect(() => {
  if (isAuthenticated && user && !hasRedirectedRef.current) {
    hasRedirectedRef.current = true;
    setIsRedirecting(true);
    // Redirigir según rol
    if (user.role === 'admin') {
      router.push('/admin/dashboard');
    }
    // ...
  }
}, [isAuthenticated, user, router]);
```

**Problema:** El ref se setea ANTES de que la redirección se complete. Si hay múltiples renders rápidos, puede intentar redirigir múltiples veces.

**Solución:** Usar abort controller o check más seguro
```typescript
useEffect(() => {
  if (isAuthenticated && user) {
    const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : ...;
    setIsRedirecting(true);
    router.push(redirectUrl);
  }
}, [isAuthenticated, user?.role]); // Cambiar dependencies
```

---

### 5. UNSAFE TYPE CASTING - admin/usuarios page
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/usuarios/page.tsx`  
**Línea:** 219, 221  
**Tipo:** Error - Tipado  
**Severidad:** CRÍTICA

```typescript
exportToExcel(formattedData as any, `${tabName}-${timestamp}`, 'Usuarios');
exportToCSV(formattedData as any, `${tabName}-${timestamp}`);
```

**Problema:** Múltiples castings a `any` sin validación. Exporta data potencialmente corrupta.

**Solución:** Crear tipos específicos
```typescript
interface ExportData {
  nombre: string;
  email: string;
  rol: string;
  // ...
}

const validatedData: ExportData[] = formatUsersForExport(displayedUsers);
exportToExcel(validatedData, ...);
```

---

### 6. MISSING ERROR HANDLING - dashboard page
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/(protected)/dashboard/page.tsx`  
**Línea:** 82-104  
**Tipo:** Error - Error Handling  
**Severidad:** CRÍTICA

```typescript
const loadDashboardData = async () => {
  try {
    setLoading(true);
    const [estudiantesRes, clasesRes, membresiaRes] = await Promise.all([...]);
    const estudiantesArray = estudiantesRes?.data || [];
    setEstudiantes(estudiantesArray as unknown as Estudiante[]);
  } catch (error: unknown) {
    // Error loading dashboard data  <- COMENTARIO SIN MANEJO
  } finally {
    setLoading(false);
  }
};
```

**Problema:** catch block vacío, no notifica error al usuario.

**Solución:** Mostrar error y permitir retry
```typescript
catch (error: unknown) {
  console.error('Error:', error);
  setError(getErrorMessage(error));
  toast.error('Error cargando dashboard');
}
```

---

### 7. MISSING ABORT SIGNAL - admin layout auth validation
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/layout.tsx`  
**Línea:** 54-107  
**Tipo:** Error - Memory Leak  
**Severidad:** CRÍTICA

```typescript
useEffect(() => {
  const validateAuth = async () => {
    if (!user) {
      try {
        await checkAuth();  // NO SE CANCELA SI COMPONENT UNMOUNTS
        // ...
      }
    }
  };
  validateAuth();
}, [user, router, checkAuth]);
```

**Problema:** No hay cleanup si el componente unmount. Puede causar memory leak y "Can't perform a React state update on an unmounted component".

**Solución:** Usar abort signal
```typescript
useEffect(() => {
  const controller = new AbortController();
  const validateAuth = async () => {
    try {
      await checkAuth();
      if (controller.signal.aborted) return;
      // update state
    }
  };
  validateAuth();
  return () => controller.abort();
}, []);
```

---

### 8. UNSAFE INTERSECTION IN API - axios interceptor
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/lib/axios.ts`  
**Línea:** 80-86  
**Tipo:** Error - Seguridad/Tipado  
**Severidad:** CRÍTICA

```typescript
if (typeof window !== 'undefined' && (window as unknown as { showToast?: (msg: string, type: string) => void }).showToast) {
  (window as unknown as { showToast: (msg: string, type: string) => void }).showToast(
```

**Problema:** Type casting a `unknown` múltiples veces. Acceso unsafe a propiedades de window.

**Solución:** Definir tipo global
```typescript
declare global {
  interface Window {
    showToast?: (message: string, type: 'success' | 'error') => void;
  }
}

if (window.showToast) {
  window.showToast('message', 'error');
}
```

---

## ERRORES ALTOS (Deben corregirse antes de siguiente release)

### 9. INCONSISTENT ERROR HANDLING - docente layout
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/docente/layout.tsx`  
**Línea:** 97-100  
**Tipo:** Error - Manejo de errores  
**Severidad:** ALTA

```typescript
catch (error: any) {  // any!!
  router.push('/login');
}
```

**Problema:** Usa `any` para error. No distingue entre timeout, network error, etc.

---

### 10. UNVALIDATED API RESPONSE - clases.store
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/store/clases.store.ts`  
**Línea:** 116-123  
**Tipo:** Error - Validación  
**Severidad:** ALTA

```typescript
const clasesActualizadas = clases.map((clase) =>
  clase.id === claseId
    ? { ...clase, cupo_disponible: clase.cupo_disponible - 1 }
    : clase
);
```

**Problema:** Asume que `cupo_disponible` existe y es number. Sin validación previa.

---

### 11. MISSING VALIDATION IN FORM - admin/usuarios create admin
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/usuarios/page.tsx`  
**Línea:** 621-738  
**Tipo:** Error - Validación  
**Severidad:** ALTA

```typescript
<input
  type="email"
  value={adminForm.email}
  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
  className="w-full px-4 py-2.5 border-2 border-emerald-500/20 bg-emerald-500/[0.08]/60 text-white rounded-xl..."
  required  // HTML5 validation no es suficiente
/>
```

**Problema:** Solo validación HTML5. Debería validar:
- Email formato válido
- Contraseña requisitos (uppercase, numbers, etc)
- DNI formato

---

### 12. UNSAFE OBJECT DESTRUCTURING - admin dashboard
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/dashboard/page.tsx`  
**Línea:** 13-20  
**Tipo:** Error - Tipado  
**Severidad:** ALTA

```typescript
const statCards = [
  { label: 'Usuarios Totales', value: stats?.totalUsuarios || 0, ... },
  // ...
];
```

**Problema:** Si `stats` es null/undefined, todos los valores son 0. Sin indicación de estado de loading real.

---

### 13. DUPLICATED MODAL LOGIC - usuarios page
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/usuarios/page.tsx`  
**Línea:** 470-738  
**Tipo:** Deuda técnica - Código duplicado  
**Severidad:** ALTA

**Problema:** El modal de crear/editar usuario se repite en multiple páginas admin. No centralizado.

---

### 14. INSUFFICIENT LOADING STATES - admin clases
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/clases/page.tsx`  
**Línea:** 276-280  
**Tipo:** Error - UX  
**Severidad:** ALTA

```typescript
{isLoading ? (
  <div className="text-center py-12">
    <div className="inline-block animate-spin..."></div>
    <p className="mt-4 text-white/60">Cargando clases...</p>
  </div>
) : ...}
```

**Problema:** Solo un `isLoading` general. No distingue entre:
- First load vs refetch
- Individual item loading
- Partial state updates

---

### 15. XSS VULNERABILITY - Unescaped HTML
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/clases/page.tsx`  
**Línea:** 324, 327, 330  
**Tipo:** Seguridad - XSS  
**Severidad:** ALTA

```typescript
<div className="text-base font-bold text-white">
  {clase.nombre || clase.ruta_curricular?.nombre || 'Sin nombre'}
</div>
<div className="text-sm text-white/60 mt-1">
  👨‍🏫 {clase.docente?.user?.nombre || clase.docente?.nombre || 'N/A'} {clase.docente?.user?.apellido || clase.docente?.apellido || ''}
</div>
```

**Problema:** Si `clase.nombre` viene de user input (API), puede contener HTML/JS malicioso.

**Solución:** Sanitizar o usar librería como `DOMPurify`

---

### 16. PROP DRILLING EXCESSIVE - dashboard components
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/docente/mis-clases/page.tsx`  
**Línea:** 110-175  
**Tipo:** Deuda técnica - Coupling  
**Severidad:** ALTA

```typescript
<ClasesList
  title="Hoy"
  icon="🔥"
  clases={clasesAgrupadas.hoy}
  viewMode={viewMode}
  onIniciarClase={handleIniciarClase}
  onEnviarRecordatorio={handleEnviarRecordatorio}
  onCancelar={(id) => setClaseACancelar(id)}
  puedeCancelar={puedeCancelar}
  puedeRegistrarAsistencia={puedeRegistrarAsistencia}
  getEstadoColor={getEstadoColor}
  formatFecha={formatFecha}
/>
```

**Problema:** 11 props! Debería usar context o estado compartido.

---

### 17. INCONSISTENT STATE MANAGEMENT - stores mixing
**Archivo:** Múltiples stores  
**Tipo:** Deuda técnica - Inconsistencia  
**Severidad:** ALTA

**Problema:** Mix de Zustand stores + React Query. Inconsistencia en cómo se maneja estado:
- `useAuthStore` usa Zustand + persist
- `useAdminStore` usa Zustand sin persist
- Algunos componentes usan `apiClient` directamente

---

### 18. MISSING CLEANUP IN INTERVALS - docente dashboard
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/docente/dashboard/page.tsx`  
**Línea:** 75-80  
**Tipo:** Error - Memory leak  
**Severidad:** ALTA

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // setNow(new Date());
  }, 60000);
  return () => clearInterval(interval);  // OK, pero código comentado?
}, []);
```

**Problema:** Si código se descomenta, los 3 dashboards (admin, docente, estudiante) tienen intervalos activos.

---

### 19. MISSING PAGINATION - admin tables
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/usuarios/page.tsx`  
**Línea:** 374-466  
**Tipo:** Error - Scalability  
**Severidad:** ALTA

**Problema:** Si hay 10k usuarios, carga TODOS en memoria. No hay pagination/virtualization.

---

### 20. UNSAFE SESSION STORAGE - login page
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/login/page.tsx`  
**Línea:** 145, 209  
**Tipo:** Seguridad  
**Severidad:** ALTA

```typescript
const hasRedirectedRef = useRef(false);
// y también:
sessionStorage.setItem('welcomeShown', 'true');
```

**Problema:** SessionStorage es vulnerable. User puede manipular. También hardcoded strings.

---

### 21. UNCONTROLLED FORM INPUTS - admin clases
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/clases/page.tsx`  
**Línea:** 428-541  
**Tipo:** Error - React best practices  
**Severidad:** ALTA

```typescript
<input
  type="text"
  value={formData.nombre}
  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
  // ...
/>
```

**Problema:** Si hay muchos campos, cada onChange recrea objeto. Ineficiente. Debería usar useReducer.

---

### 22. BLOCKING RENDER - admin layout validation
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/admin/layout.tsx`  
**Línea:** 53-107  
**Tipo:** Error - Performance  
**Severidad:** ALTA

```typescript
useEffect(() => {
  const validateAuth = async () => {
    // Este useEffect BLOQUEA TODO hasta completarse
    // ...
  };
  validateAuth();
}, [user, router, checkAuth]);
```

**Problema:** En SSR/hydration, esto puede causar waterfall of fetches.

---

### 23. MEMORY LEAK IN FLOATING PARTICLES - login
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/login/page.tsx`  
**Línea:** 77-92  
**Tipo:** Error - Memory leak  
**Severidad:** ALTA

```typescript
function FloatingParticle({ delay = 0, left = 50 }: ...) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
```

**Problema:** Renderiza 15 `FloatingParticle` que cada uno tiene su propio useState + useEffect. En cada logout/login se crean nuevos.

---

### 24. ESLINT-DISABLE WITHOUT REASON
**Archivo:** `/home/alexis/Documentos/Mateatletas-Ecosystem/apps/web/src/app/docente/mis-clases/hooks/useMisClases.ts`  
**Línea:** 35  
**Tipo:** Error - Code Quality  
**Severidad:** ALTA

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
```

**Problema:** Sin comentario explicativo. Oculta problemas legítimos.

---

## DEUDA TÉCNICA MEDIA

### 25. MAGIC NUMBERS EVERYWHERE
**Severidad:** MEDIA  
**Ejemplos:**
- `timeout: 10000` en axios
- `minutosParaInicio <= 15`
- `Math.floor((inicio - now) / (60 * 1000))`

**Solución:** Constantes nombradas
```typescript
const AXIOS_TIMEOUT_MS = 10000;
const CLASS_REMINDER_MINUTES = 15;
const MILLIS_PER_MINUTE = 60 * 1000;
```

---

### 26. INCONSISTENT NAMING
**Severidad:** MEDIA  
**Ejemplos:**
- `clase` vs `claseId` vs `claseACancelar`
- `formatFecha` vs `getEstadoColor`
- `handleCancelar` vs `onCancelar`

---

### 27. COMPONENTS >200 LINES
**Severidad:** MEDIA  
**Ejemplos:**
- `admin/usuarios/page.tsx` - 742 líneas
- `admin/clases/page.tsx` - 786 líneas
- `docente/dashboard/page.tsx` - 445 líneas
- `app/login/page.tsx` - 607 líneas

---

### 28. MISSING UNIT TESTS
**Severidad:** MEDIA  
**Archivos:** Ningún test encontrado en src/

---

### 29. MISSING .env VALIDATION
**Severidad:** MEDIA  
**Problema:** No valida que `NEXT_PUBLIC_API_URL` existe

```typescript
// Mejor
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida');
}
```

---

### 30. INCONSISTENT ERROR MESSAGES
**Severidad:** MEDIA  
**Ejemplos:**
- "Error loading dashboard" vs "Error al cargar clases"
- Algunos en español, otros en inglés

---

### 31. TODO COMMENTS
**Severidad:** MEDIA  
**Encontrados:**
- `// TODO: Agregar endpoint para estudiantes` (line 59, usuarios.page.tsx)
- `// TODO: Implementar envío real de notificaciones` (line 119, useMisClases.ts)
- `// TODO: Conectar con backend real` (line 91, docente/dashboard/page.tsx)
- `// TODO: Implementar lógica real` (line 150, docente/dashboard/page.tsx)

---

### 32. UNUSED VARIABLES
**Severidad:** MEDIA  
**Ejemplos:**
- `isRedirecting` en login.page.tsx nunca se usa para mostrar UI
- `previousLevel` en estudiante/dashboard resets constantemente

---

### 33. HARDCODED STRINGS
**Severidad:** MEDIA  
**Ejemplos:**
- "Tutor/Padre" vs "Estudiante" strings en 50+ lugares
- "Cargando..." en 20+ componentes diferentes

---

### 34. MISSING TYPESCRIPT STRICT MODE
**Severidad:** MEDIA  
**Problema:** Muchos `any` castings

---

### 35. MISSING ACCESSIBILITY (a11y)
**Severidad:** MEDIA  
**Ejemplos:**
- Botones sin `aria-label`
- Modales sin `role="dialog"`
- Inputs sin `aria-describedby`

---

## VIOLACIONES SOLID

### 36. SINGLE RESPONSIBILITY VIOLATION
**Severidad:** MEDIA  
**Ejemplos:**
- `admin/usuarios/page.tsx`: Filtra usuarios, maneja 4 modales diferentes, exporta datos, gestiona roleS
- `docente/dashboard/page.tsx`: Fetch data, formateo, business logic, rendering, animations

---

### 37. OPEN/CLOSED PRINCIPLE VIOLATION
**Severidad:** MEDIA  
**Ejemplo:** Agregar nueva tabla admin requiere modificar el componente principa. Debería ser component-based.

---

### 38. DEPENDENCY INVERSION
**Severidad:** MEDIA  
**Problema:** Componentes acoplados a Zustand stores específicas
```typescript
// Malo
const { users, fetchUsers } = useAdminStore();

// Mejor
interface UserRepository {
  getUsers(): Promise<User[]>;
}
```

---

### 39. SEPARATION OF CONCERNS
**Severidad:** MEDIA  
**Problema:** UI mezclada con lógica de negocio en páginas
```typescript
// Malo
export default function Page() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    // fetch users
    // filter users
    // sort users
    // format users
  }, []);
  
  return (
    // UI que usa los usuarios
  );
}
```

---

## PROBLEMAS BAJOS (Polish)

### 40. MISSING LOADING SKELETONS
**Severidad:** BAJA  
**Problema:** Usa spinner genérico. Debería usar skeleton loaders.

---

### 41. HARDCODED COLORES
**Severidad:** BAJA  
**Problema:** `linear-gradient(135deg, #10b981 0%, #059669 100%)` repetido múltiples veces

---

### 42. MISSING ERROR BOUNDARIES
**Severidad:** BAJA  
**Problema:** No hay Error Boundaries en los layouts

---

## RESUMEN EJECUTIVO

| Categoría | Crítica | Alta | Media | Baja | Total |
|-----------|---------|------|-------|------|-------|
| Errores | 8 | 15 | 0 | 0 | 23 |
| Deuda Técnica | 0 | 0 | 12 | 7 | 19 |
| SOLID | 0 | 0 | 4 | 0 | 4 |
| **TOTAL** | **8** | **15** | **16** | **7** | **46** |

## RECOMENDACIONES DE PRIORIDAD

### Phase 1 (ASAP - Antes de Producción)
1. Arreglar missing dependencies en useEffect hooks
2. Agregar abort signals en useEffect async
3. Implementar proper error handling en todos los catch blocks
4. Sanitizar inputs en formas
5. Agregar type guards en lugar de `any` castings

### Phase 2 (Próxima 2 semanas)
6. Refactorizar pages >200 líneas en componentes menores
7. Centralizar estado con Context API o reducer
8. Agregar validación de formularios real
9. Implementar pagination en tablas admin
10. Agregar error boundaries

### Phase 3 (Sprint siguiente)
11. Escribir unit tests
12. Implementar E2E tests con Playwright
13. Agregar skeleton loaders
14. Refactorizar para SOLID principles
15. Agregar análisis de accesibilidad

---

## ARCHIVO CRÍTICO DE CONFIGURACIÓN FALTANTE

Se recomienda crear `.eslintrc.strict.js`:
```javascript
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/explicit-function-return-types': 'warn',
  },
};
```

---

**Fin del reporte**
