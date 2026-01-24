# Migración Portal Estudiante

> Documento de análisis para la migración/refactor del portal de estudiantes

---

## Estado Actual

### Estructura de Carpetas

```
apps/web/src/app/estudiante/
├── aula/
│   ├── [asignacionId]/
│   │   ├── clase/
│   │   │   └── [claseId]/
│   │   │       └── [tipo]/
│   │   │           └── page.tsx      # Vista de clase específica (teoría/práctica)
│   │   └── page.tsx                  # Vista de asignación específica
│   ├── page.tsx                      # Lista de aulas/asignaciones
│   └── tareas/
│       └── page.tsx                  # Vista de tareas
├── clase-en-vivo/
│   └── page.tsx                      # Vista de clase en vivo (videoconferencia)
├── clases/
│   ├── components/
│   │   ├── ActividadEquipo.tsx       # Ranking/actividad de compañeros
│   │   ├── CanalComunicacion.tsx     # Chat/comunicación
│   │   ├── PerfilEstudiante.tsx      # Sidebar perfil
│   │   ├── ProximaClaseHero.tsx      # Hero con próxima clase
│   │   └── TareasActivas.tsx         # Lista de tareas pendientes
│   └── page.tsx                      # Dashboard de clases (3 columnas)
├── explorar/
│   ├── [categoriaId]/
│   │   ├── [cursoId]/
│   │   │   ├── [leccionId]/
│   │   │   │   └── page.tsx          # Vista de lección
│   │   │   └── page.tsx              # Vista de curso
│   │   └── page.tsx                  # Vista de categoría
│   └── page.tsx                      # Explorador de contenido
├── jugar/
│   └── page.tsx                      # Arcade/minijuegos
├── progreso/
│   └── page.tsx                      # Progreso del estudiante
├── layout.tsx                        # Layout principal con auth guard
└── page.tsx                          # Dashboard home (Bento Grid)

apps/web/src/components/estudiante/
├── live/
│   ├── JoinClassButton.tsx           # Botón unirse a clase
│   ├── RaiseHandButton.tsx           # Botón levantar mano
│   └── __tests__/
│       ├── JoinClassButton.spec.tsx
│       └── RaiseHandButton.spec.tsx
├── ActivityFeed.tsx                  # Feed de actividad
├── ModalFelicitacion.tsx             # Modal de logros/felicitación
└── RankingCasa.tsx                   # Ranking por casa

apps/web/src/components/estudiantes/  # (inconsistencia: plural)
└── ModalResumenClase.tsx             # Modal resumen post-clase
```

### Componentes Existentes

#### Layout Principal (`layout.tsx`)

- **Auth Guard**: Valida rol `estudiante`, redirige según rol
- **Hook de acceso**: `useAccesoEstudiante()` - verifica suscripción activa
- **Tema dinámico**: `useCasaTheme()` - CSS variables según casa
- **Header Candy**: Stats (nivel, XP, racha) + logout
- **Estados de carga**: Loading, error, sin acceso

#### Dashboard Home (`page.tsx`)

- **FloatingLines**: Background animado
- **Header duplicado**: (redundante con layout)
- **Bento Grid**:
  - Fila 1: Explorar | Jugar | Mi Progreso (3 cards)
  - Fila 2: RankingCasa | Clases (2 cards)
- **LiveBanner**: Banner clase en vivo
- **CandyPill**: Stats compactos
- **CandyCard**: Cards navegación con gradientes
- **ClasesCard**: Card con estado bloqueado/desbloqueado

#### Dashboard Clases (`clases/page.tsx`)

- Layout 3 columnas (12 grid):
  - Col 1 (3): PerfilEstudiante + TareasActivas
  - Col 2 (6): ProximaClaseHero + CanalComunicacion
  - Col 3 (3): ActividadEquipo

### Rutas Actuales

| Ruta                                           | Descripción             | Estado       |
| ---------------------------------------------- | ----------------------- | ------------ |
| `/estudiante`                                  | Dashboard home          | ✅ Funcional |
| `/estudiante/explorar`                         | Explorador de contenido | ✅ Funcional |
| `/estudiante/explorar/[cat]/[curso]/[leccion]` | Vista lección           | ✅ Funcional |
| `/estudiante/jugar`                            | Arcade minijuegos       | ✅ Funcional |
| `/estudiante/progreso`                         | Mi progreso             | ✅ Funcional |
| `/estudiante/clases`                           | Dashboard clases        | ✅ Funcional |
| `/estudiante/clase-en-vivo`                    | Videoconferencia        | ✅ Funcional |
| `/estudiante/aula`                             | Lista de aulas          | ✅ Funcional |
| `/estudiante/aula/[id]`                        | Aula específica         | ✅ Funcional |
| `/estudiante/aula/[id]/clase/[claseId]/[tipo]` | Clase teoría/práctica   | ✅ Funcional |
| `/estudiante/aula/tareas`                      | Tareas                  | ✅ Funcional |
| `/estudiante-login`                            | Login estudiantes       | ✅ Funcional |

### Problemas Identificados

1. **Inconsistencia de naming**: `estudiante/` vs `estudiantes/` en components
2. **Header duplicado**: El layout y el dashboard home tienen headers similares
3. **Componentes inline**: `CandyPill`, `CandyCard`, `LiveBanner`, `ClasesCard` están definidos dentro de `page.tsx` (586 líneas)
4. **Estilos hardcodeados**: Gradientes y colores repetidos en múltiples archivos
5. **Sin design tokens centralizados**: Cada componente define sus propios colores

### Dependencias Clave

- `useAuthStore` - Estado de autenticación
- `useAccesoEstudiante` - Verificación de suscripción
- `useCasaTheme` - Tema según casa (Quantum/Vertex/Pulsar)
- `gamificacionApi` - Stats del estudiante
- `estudiantesApi` - Datos de clases, plan, compañeros
- `FloatingLines` - Background animado

---

## Estado Deseado

<!-- Completar después: arquitectura objetivo, nueva estructura de componentes, design system, etc. -->

---

## Plan de Migración

<!-- Completar después: pasos específicos, orden de migración, breaking changes, etc. -->
