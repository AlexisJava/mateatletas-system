# 🎭 Animaciones Ready Player Me - Documentación Completa

**Proyecto:** Mateatletas Ecosystem
**Fecha:** 2025-10-30
**Status:** ✅ PRODUCTIVO

---

## 📊 Resumen Ejecutivo

Se han configurado exitosamente **30 animaciones 3D** de Ready Player Me, almacenadas en Vercel Blob Storage y listas para usar en la plataforma educativa Mateatletas.

### Métricas Clave

- **Total animaciones:** 30 archivos GLB
- **Storage usado:** ~50-80 MB de 1 GB disponible
- **Plan:** Vercel Blob Hobby (Gratis)
- **URLs:** Públicas con CORS habilitado
- **CDN:** Global (baja latencia mundial)

---

## 🗂️ Estructura de Animaciones

### Por Categoría

| Categoría            | Cantidad | Puntos Requeridos | Descripción                           |
| -------------------- | -------- | ----------------- | ------------------------------------- |
| 🕺 **Bailes**        | 10       | 100 pts           | Celebraciones y bailes festivos       |
| 😊 **Expresiones**   | 10       | 75 pts            | Expresiones faciales y gestos         |
| 🧍 **Espera (Idle)** | 6        | 50 pts            | Animaciones de reposo (desbloqueadas) |
| 🏃 **Movimiento**    | 4        | 150 pts           | Caminar y correr                      |

### Por Género

| Género       | Cantidad |
| ------------ | -------- |
| ♂️ Masculino | 15       |
| ♀️ Femenino  | 15       |

---

## 📁 Archivos y Ubicaciones

### Configuración

```
apps/web/public/animations-config.json    # Configuración principal con URLs
~/rpm-animations/animation-library/       # Repositorio clonado (local)
scripts/upload-animations.mjs             # Script de subida
.env.local                                # Token de Vercel Blob (NO subir a git)
```

### Vercel Blob Storage

```
Proyecto: mateatletas-ecosystem
Store: mateatletas-animations
Region: iad1 (USA Este)
```

---

## 💻 Uso en la Aplicación

### 1. Importar la configuración

```typescript
import animationsConfig from '@/public/animations-config.json';

// Ver todas las animaciones
console.log(animationsConfig.animations);

// Ver resumen
console.log(`Total: ${animationsConfig.totalAnimations}`);
console.log(`Bailes: ${animationsConfig.categories.dance}`);
```

### 2. Buscar animación específica

```typescript
// Por ID
const animation = animationsConfig.animations.find((a) => a.id === 'masculine-dance-m_dances_001');

// Por categoría
const dances = animationsConfig.animations.filter((a) => a.category === 'dance');

// Por género
const femaleAnims = animationsConfig.animations.filter((a) => a.gender === 'feminine');

// Desbloqueadas por defecto
const unlockedAnims = animationsConfig.animations.filter((a) => a.unlocked === true);
```

### 3. Usar con tu sistema de avatares

```typescript
// Ejemplo con @react-three/drei
import { useGLTF, useAnimations } from '@react-three/drei';
import animationsConfig from '@/public/animations-config.json';

function Avatar({ animationId }: { animationId: string }) {
  const animation = animationsConfig.animations.find(a => a.id === animationId);

  if (!animation) return null;

  const { scene, animations } = useGLTF(animation.url);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && animations.length > 0) {
      const action = actions[animations[0].name];
      action?.play();
    }
  }, [actions, animations]);

  return <primitive object={scene} />;
}
```

### 4. Sistema de desbloqueo por puntos

```typescript
interface StudentProgress {
  points: number;
  unlockedAnimations: string[];
}

function getAvailableAnimations(studentProgress: StudentProgress) {
  return animationsConfig.animations.filter((animation) => {
    // Ya desbloqueada manualmente
    if (studentProgress.unlockedAnimations.includes(animation.id)) {
      return true;
    }

    // Desbloqueada por defecto (idle animations)
    if (animation.unlocked) {
      return true;
    }

    // Tiene suficientes puntos
    if (studentProgress.points >= animation.requiredPoints) {
      return true;
    }

    return false;
  });
}
```

---

## 🔗 URLs de Ejemplo

Todas las URLs siguen este patrón:

```
https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/{gender}/{category}/{filename}
```

### Ejemplos reales:

**Baile masculino:**

```
https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_001.glb
```

**Expresión femenina:**

```
https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/expression/F_Talking_Variations_001.glb
```

**Idle masculino:**

```
https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_001.glb
```

**Movimiento femenino:**

```
https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/locomotion/F_Walk_002.glb
```

---

## 🛠️ Mantenimiento

### Agregar más animaciones

1. Agregar rutas al archivo `selected-animations.txt`:

   ```bash
   echo "masculine/glb/dance/M_Dances_010.glb" >> ~/rpm-animations/animation-library/selected-animations.txt
   ```

2. Ejecutar script de subida:

   ```bash
   npm run upload-animations
   ```

3. El archivo `animations-config.json` se actualizará automáticamente

### Ver animaciones en Vercel Blob

```bash
# Listar todos los blobs
vercel blob ls

# Ver detalles de un blob específico
vercel blob get <blob-url>
```

### Eliminar animación

```bash
# Eliminar de Vercel Blob
vercel blob rm <blob-url>

# Actualizar animations-config.json manualmente o re-ejecutar el script
```

---

## 📈 Performance y Límites

### Plan Hobby (Actual)

- **Storage:** 1 GB (usado: ~50-80 MB)
- **Bandwidth:** 10 GB/mes
- **Estimación:** ~120-150 usuarios activos/mes pueden descargar todas las animaciones

### Optimizaciones

- ✅ CORS habilitado globalmente
- ✅ CDN global (baja latencia)
- ✅ Cache-Control: `max-age=2592000` (30 días)
- ✅ Compresión GLB nativa (archivos ya optimizados)

### Monitoreo

Dashboard de Vercel:

```
https://vercel.com/alexis-figueroas-projects-d4fb75f1/mateatletas-ecosystem/stores
```

---

## 🎮 Listado Completo de Animaciones

### Bailes (10)

| ID                             | Nombre       | Género    | Puntos | URL                                                                                                        |
| ------------------------------ | ------------ | --------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `masculine-dance-m_dances_001` | M Dances 001 | Masculino | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_001.glb) |
| `masculine-dance-m_dances_003` | M Dances 003 | Masculino | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_003.glb) |
| `masculine-dance-m_dances_005` | M Dances 005 | Masculino | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_005.glb) |
| `masculine-dance-m_dances_007` | M Dances 007 | Masculino | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_007.glb) |
| `masculine-dance-m_dances_009` | M Dances 009 | Masculino | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_009.glb) |
| `feminine-dance-f_dances_001`  | F Dances 001 | Femenino  | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/dance/F_Dances_001.glb)  |
| `feminine-dance-f_dances_004`  | F Dances 004 | Femenino  | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/dance/F_Dances_004.glb)  |
| `feminine-dance-f_dances_005`  | F Dances 005 | Femenino  | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/dance/F_Dances_005.glb)  |
| `feminine-dance-f_dances_006`  | F Dances 006 | Femenino  | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/dance/F_Dances_006.glb)  |
| `feminine-dance-f_dances_007`  | F Dances 007 | Femenino  | 100    | [Ver](https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/feminine/dance/F_Dances_007.glb)  |

### Expresiones (10)

| ID                                                | Nombre                     | Género    | Puntos |
| ------------------------------------------------- | -------------------------- | --------- | ------ |
| `masculine-expression-m_standing_expressions_001` | M Standing Expressions 001 | Masculino | 75     |
| `masculine-expression-m_standing_expressions_005` | M Standing Expressions 005 | Masculino | 75     |
| `masculine-expression-m_standing_expressions_008` | M Standing Expressions 008 | Masculino | 75     |
| `masculine-expression-m_standing_expressions_011` | M Standing Expressions 011 | Masculino | 75     |
| `masculine-expression-m_standing_expressions_014` | M Standing Expressions 014 | Masculino | 75     |
| `feminine-expression-f_talking_variations_001`    | F Talking Variations 001   | Femenino  | 75     |
| `feminine-expression-f_talking_variations_003`    | F Talking Variations 003   | Femenino  | 75     |
| `feminine-expression-f_talking_variations_004`    | F Talking Variations 004   | Femenino  | 75     |
| `feminine-expression-f_talking_variations_005`    | F Talking Variations 005   | Femenino  | 75     |
| `feminine-expression-f_talking_variations_006`    | F Talking Variations 006   | Femenino  | 75     |

### Idle / Espera (6) - ✅ Desbloqueadas

| ID                                              | Nombre                         | Género    | Puntos |
| ----------------------------------------------- | ------------------------------ | --------- | ------ |
| `masculine-idle-m_standing_idle_001`            | M Standing Idle 001            | Masculino | 50     |
| `masculine-idle-m_standing_idle_variations_002` | M Standing Idle Variations 002 | Masculino | 50     |
| `masculine-idle-m_standing_idle_variations_005` | M Standing Idle Variations 005 | Masculino | 50     |
| `feminine-idle-f_standing_idle_001`             | F Standing Idle 001            | Femenino  | 50     |
| `feminine-idle-f_standing_idle_variations_003`  | F Standing Idle Variations 003 | Femenino  | 50     |
| `feminine-idle-f_standing_idle_variations_007`  | F Standing Idle Variations 007 | Femenino  | 50     |

### Movimiento / Locomotion (4)

| ID                                | Nombre     | Género    | Puntos |
| --------------------------------- | ---------- | --------- | ------ |
| `masculine-locomotion-m_walk_001` | M Walk 001 | Masculino | 150    |
| `masculine-locomotion-m_jog_001`  | M Jog 001  | Masculino | 150    |
| `feminine-locomotion-f_walk_002`  | F Walk 002 | Femenino  | 150    |
| `feminine-locomotion-f_jog_001`   | F Jog 001  | Femenino  | 150    |

---

## 🚨 Troubleshooting

### Problema: Animación no carga

**Síntomas:** Error 404 o archivo no encontrado

**Soluciones:**

1. Verificar que la URL está en `animations-config.json`
2. Probar URL directamente en el navegador
3. Verificar CORS headers con: `curl -I <url>`

### Problema: Performance lenta

**Síntomas:** Animaciones tardan en cargar

**Soluciones:**

1. Implementar lazy loading (cargar bajo demanda)
2. Pre-cargar animaciones más usadas
3. Usar cache del navegador
4. Considerar actualizar a plan Pro si se exceden límites

### Problema: Token expirado

**Síntomas:** Error 403 Forbidden

**Soluciones:**

```bash
# Re-generar token desde Vercel Dashboard
vercel env pull .env.local

# Re-ejecutar script
npm run upload-animations
```

---

## 📚 Referencias

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Ready Player Me Animations](https://github.com/readyplayerme/animation-library)
- [GLB Format Specification](https://www.khronos.org/gltf/)
- [Three.js / React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

---

## ✅ Checklist de Implementación

- [x] Repositorio de animaciones clonado
- [x] 30 animaciones seleccionadas y curadas
- [x] Vercel Blob Storage configurado
- [x] Script de subida funcional
- [x] Todas las animaciones subidas (30/30)
- [x] `animations-config.json` generado
- [x] URLs verificadas como públicas
- [x] CORS habilitado
- [x] Documentación completa
- [ ] Integración con componente Avatar en la app
- [ ] Sistema de desbloqueo por puntos implementado
- [ ] Tests de performance

---

**Última actualización:** 2025-10-30
**Mantenido por:** Equipo Mateatletas
