# Mis Clases - Quick Start Guide

## For Developers

### Understanding the Structure

```
mis-clases/
├── page.tsx                    # Entry point - just renders components
├── hooks/useMisClases.ts      # All logic lives here
└── components/                 # UI components only
    ├── ClasesFilters.tsx      # Header + filters
    ├── ClasesList.tsx         # Groups classes
    ├── ClaseCard.tsx          # Individual card
    ├── ClaseRow.tsx           # Individual row
    └── CancelClaseModal.tsx   # Confirmation dialog
```

### Making Changes

#### Adding a new filter
1. Add state to `hooks/useMisClases.ts`:
   ```typescript
   const [newFilter, setNewFilter] = useState<string>('');
   ```
2. Add to return object
3. Pass to `ClasesFilters.tsx` as prop
4. Add UI in `ClasesFilters.tsx`

#### Adding a new action
1. Add handler to `hooks/useMisClases.ts`:
   ```typescript
   const handleNewAction = (claseId: string) => {
     // Your logic here
   };
   ```
2. Add to return object
3. Pass to `ClaseCard.tsx` or `ClaseRow.tsx`
4. Add button in component

#### Modifying display
- Edit `ClaseCard.tsx` for card view changes
- Edit `ClaseRow.tsx` for list view changes
- Both use same data from hook

### Common Tasks

#### Change a color
Look for Tailwind classes in components:
```typescript
// Example: Change purple to blue
'bg-purple-600' → 'bg-blue-600'
```

#### Add a new field
1. Ensure it's in `Clase` type
2. Display in `ClaseCard.tsx`:
   ```tsx
   <div className="flex items-center gap-2">
     <Icon className="w-4 h-4" />
     <span>{clase.newField}</span>
   </div>
   ```

#### Modify grouping logic
Edit `agruparClasesPorFecha` in `hooks/useMisClases.ts`:
```typescript
const agruparClasesPorFecha = (clases: Clase[]) => {
  // Modify grouping logic here
};
```

### File Sizes Reference
```
page.tsx              188 lines ← Main file
useMisClases.ts       210 lines ← All logic
ClasesFilters.tsx     114 lines ← Filters
ClasesList.tsx         79 lines ← List wrapper
ClaseCard.tsx         155 lines ← Card view
ClaseRow.tsx          127 lines ← List view
CancelClaseModal.tsx   70 lines ← Modal
```

### Import Patterns

```typescript
// In page.tsx
import { useMisClases } from './hooks/useMisClases';
import { ClasesFilters, ClasesList, CancelClaseModal } from './components';

// In components
import { Clase, EstadoClase } from '@/types/clases.types';
import { ViewMode } from '../hooks/useMisClases';
```

### TypeScript Tips

All estado types must match:
```typescript
EstadoClase | 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada'
```

### Testing Locally

```bash
# Type check
npm run type-check --workspace=apps/web

# Build
npm run build --workspace=apps/web

# Dev server
npm run dev --workspace=apps/web
```

### Debugging

1. Check `hooks/useMisClases.ts` for logic issues
2. Check components for UI issues
3. Use React DevTools to inspect props
4. Check browser console for errors

### Performance Tips

```typescript
// If re-renders are slow, memoize components
import { memo } from 'react';
export const ClaseCard = memo(ClaseCardComponent);

// If filtering is slow, memoize result
const clasesFiltradas = useMemo(
  () => misClases.filter(...),
  [misClases, filtroEstado]
);
```

## For Reviewers

### What to Check
- [ ] TypeScript compiles without errors
- [ ] All imports resolve correctly
- [ ] No console.log statements
- [ ] Animations work smoothly
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Filters work correctly
- [ ] Actions trigger correctly
- [ ] Modal opens/closes properly

### Architecture Checklist
- [ ] Logic in hook, not components
- [ ] Components focused on UI only
- [ ] Props properly typed
- [ ] No prop drilling (max 2 levels)
- [ ] Error handling present
- [ ] Loading states handled

### Style Guide
- [ ] Tailwind classes used
- [ ] Purple theme maintained
- [ ] Glassmorphism effects present
- [ ] Consistent spacing
- [ ] Responsive design
- [ ] Dark mode support

## Quick Reference

### Key Functions
```typescript
// Hook exports
const {
  clasesFiltradas,      // Filtered classes array
  clasesAgrupadas,      // Grouped by date
  handleCancelar,       // Cancel a class
  handleIniciarClase,   // Start a class
  getEstadoColor,       // Get badge color
  puedeCancelar,        // Check if can cancel
} = useMisClases();
```

### Component Props
```typescript
// ClaseCard
<ClaseCard
  clase={clase}
  onIniciarClase={handleIniciarClase}
  onCancelar={setClaseACancelar}
  puedeCancelar={puedeCancelar}
  puedeRegistrarAsistencia={puedeRegistrarAsistencia}
  getEstadoColor={getEstadoColor}
/>
```

### Estado Colors
```typescript
Programada  → bg-[#4caf50] (green)
EnCurso     → bg-[#f7b801] (yellow)
Finalizada  → bg-gray-400 (gray)
Cancelada   → bg-[#f44336] (red)
```

## Need Help?

1. Check `README.md` for architecture overview
2. Check `REFACTORING.md` for detailed documentation
3. Review the hook (`useMisClases.ts`) for all available functions
4. Check component props interfaces for usage

---

**Last Updated:** 2025-10-17
**Version:** 2.0.0
