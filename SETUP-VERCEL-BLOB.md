# 🎯 Configurar Vercel Blob Storage para Mateatletas Ecosystem

## ✅ Lo que ya está hecho:
- ✅ Proyecto `mateatletas-ecosystem` creado en Vercel
- ✅ Directorio vinculado al proyecto
- ✅ Script de subida listo en `scripts/upload-animations.mjs`
- ✅ 30 animaciones seleccionadas en `~/rpm-animations/animation-library/selected-animations.txt`
- ✅ SDK @vercel/blob instalado

## 📋 Paso 1: Configurar Blob Storage en Vercel Dashboard

1. **Abre el dashboard de Vercel:**
   https://vercel.com/alexis-figueroas-projects-d4fb75f1/mateatletas-ecosystem

2. **Ve a la pestaña "Storage"** (en el menú lateral izquierdo)

3. **Click en "Create Database"** → Selecciona **"Blob"**

4. **Configuración del Blob Store:**
   - **Name:** `mateatletas-animations`
   - **Plan:** `Hobby (Free)` - 1GB storage, 10GB bandwidth/mes
   - **Region:** Selecciona la más cercana (ej: `iad1` para USA Este)

5. **Click en "Create"**

6. **Copiar el token:**
   - Verás una variable `BLOB_READ_WRITE_TOKEN`
   - El formato es: `vercel_blob_rw_XXXXXXXXXXXXXXXXXX`
   - **NO cierres esta ventana aún**, necesitas el token

## 📋 Paso 2: Agregar el token localmente

Opción A (manual):
```bash
echo "BLOB_READ_WRITE_TOKEN=vercel_blob_rw_AQUI_TU_TOKEN" >> .env.local
```

Opción B (automático - solo si la variable ya está en Vercel):
```bash
vercel env pull .env.local
```

## 📋 Paso 3: Verificar configuración

```bash
# Ejecutar script de verificación
bash scripts/check-vercel-setup.sh
```

Deberías ver:
```
✅ Archivo .env.local encontrado
✅ BLOB_READ_WRITE_TOKEN configurado
🎉 ¡Todo listo! Puedes ejecutar:
   npm run upload-animations
```

## 📋 Paso 4: Subir las animaciones

```bash
npm run upload-animations
```

Esto va a:
1. Leer las 30 animaciones seleccionadas
2. Subirlas a Vercel Blob con estructura organizada
3. Generar `apps/web/public/animations-config.json` con todas las URLs

## 🎉 Resultado esperado

```
============================================================
✅ PROCESO COMPLETADO!
============================================================
📊 Total subidas exitosas: 30 de 30
📄 Configuración guardada en: /home/alexis/.../apps/web/public/animations-config.json

📈 Resumen por categoría:
   🕺 Bailes: 10
   😊 Expresiones: 10
   🧍 Espera: 6
   🏃 Movimiento: 4

👥 Resumen por género:
   ♂️  Masculino: 15
   ♀️  Femenino: 15

🎉 ¡Listo para usar en tu aplicación!
============================================================
```

## 📊 Métricas de Storage

- **30 archivos GLB** ≈ 50-150 MB (dependiendo del tamaño promedio)
- **Plan Hobby:** 1 GB disponible
- **Bandwidth:** 10 GB/mes (suficiente para ~120 usuarios activos)

## 🔗 URLs generadas

Las URLs tendrán este formato:
```
https://[hash].public.blob.vercel-storage.com/animations/masculine/dance/M_Dances_001.glb
```

Todas son **públicas** y accesibles sin autenticación.

## 💡 Uso en tu aplicación

```typescript
import animationsConfig from '@/public/animations-config.json';

// Obtener animación por ID
const animation = animationsConfig.animations.find(
  a => a.id === 'masculine-dance-m_dances_001'
);

// Usar con tu componente Avatar
<Avatar
  modelSrc={avatarUrl}
  animationSrc={animation.url}
/>
```

## ❓ Troubleshooting

**Error: BLOB_READ_WRITE_TOKEN no configurado**
→ Asegúrate de haber completado el Paso 2

**Error: Archivo no encontrado**
→ Verifica que `~/rpm-animations/animation-library` existe

**Error 403 Forbidden**
→ Token inválido o expirado, genera uno nuevo en Vercel Dashboard

---

**Proyecto:** mateatletas-ecosystem
**Owner:** alexis-figueroas-projects-d4fb75f1
**Creado:** 2025-10-30
