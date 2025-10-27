#!/bin/bash

echo "🔧 Arreglando errores TypeScript..."

# 1. Eliminar imports no usados (el que está rompiendo ahora)
echo "📦 Limpiando imports no usados..."

# Fix específico del error actual
sed -i 's/import { Calendar, Users, TrendingUp, Sparkles, Filter }/import { Calendar, TrendingUp, Sparkles, Filter }/' src/app/admin/planificaciones-simples/page.tsx

# 2. Fix de property mismatches más comunes
echo "🔄 Corrigiendo nombres de propiedades..."

# titulo -> nombre
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/clase\.titulo/clase.nombre/g'
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/\.titulo/\.nombre/g'

# cupo_maximo -> cupos_maximo  
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/cupo_maximo/cupos_maximo/g'

# ruta_curricular -> ruta_curricular_id
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/\.ruta_curricular[^_]/\.ruta_curricular_id/g'

# cupo_disponible -> cupos_ocupados (calcular la diferencia)
# Este es más complejo, lo dejamos para después

echo "✅ Fixes aplicados. Probá: npm run build"
