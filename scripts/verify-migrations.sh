#!/bin/bash

# ============================================
# SCRIPT DE VERIFICACIÓN DE MIGRACIONES
# ============================================
# Valida que las migraciones de Prisma estén en orden cronológico correcto
# y detecta problemas que podrían romper el deploy en Railway.
# ============================================

set -e

MIGRATIONS_DIR="apps/api/prisma/migrations"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando orden de migraciones de Prisma..."

# Verificar que el directorio de migraciones existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo -e "${RED}❌ ERROR: No se encontró el directorio de migraciones en $MIGRATIONS_DIR${NC}"
  exit 1
fi

# Obtener todas las migraciones (carpetas que empiezan con timestamp)
migrations=$(find "$MIGRATIONS_DIR" -maxdepth 1 -type d -name "2*" | sort)

if [ -z "$migrations" ]; then
  echo -e "${YELLOW}⚠️  No se encontraron migraciones${NC}"
  exit 0
fi

# Array para almacenar timestamps y nombres
declare -a timestamps=()
declare -a names=()

echo ""
echo "📋 Migraciones encontradas:"
echo ""

# Extraer timestamps y nombres
while IFS= read -r migration; do
  basename=$(basename "$migration")
  # Extraer timestamp (primeros 14 dígitos)
  timestamp=${basename:0:14}
  timestamps+=("$timestamp")
  names+=("$basename")

  # Formatear timestamp para mostrar
  year=${timestamp:0:4}
  month=${timestamp:4:2}
  day=${timestamp:6:2}
  hour=${timestamp:8:2}
  min=${timestamp:10:2}
  sec=${timestamp:12:2}

  echo "  📅 $year-$month-$day $hour:$min:$sec - $basename"
done <<< "$migrations"

echo ""
echo "🔎 Verificando orden cronológico..."
echo ""

# Verificar orden cronológico
prev_timestamp=""
prev_name=""
errors=0

for i in "${!timestamps[@]}"; do
  current_timestamp="${timestamps[$i]}"
  current_name="${names[$i]}"

  if [ -n "$prev_timestamp" ]; then
    # Comparar timestamps como números
    if [ "$current_timestamp" -lt "$prev_timestamp" ]; then
      echo -e "${RED}❌ ERROR: Migraciones fuera de orden detectadas${NC}"
      echo ""
      echo "  Migración anterior: $prev_name"
      echo "    Timestamp: $prev_timestamp"
      echo ""
      echo "  Migración actual: $current_name"
      echo "    Timestamp: $current_timestamp"
      echo ""
      echo -e "${YELLOW}La migración '$current_name' tiene un timestamp ANTERIOR a '$prev_name'${NC}"
      echo ""
      echo "💡 Solución:"
      echo "  1. Renombra la migración problemática con un timestamp más reciente"
      echo "  2. Usa: npx prisma migrate dev --name nombre_descriptivo"
      echo "  3. O renombra manualmente la carpeta con un timestamp posterior"
      echo ""
      errors=$((errors + 1))
    fi

    # Verificar duplicados
    if [ "$current_timestamp" -eq "$prev_timestamp" ]; then
      echo -e "${RED}❌ ERROR: Timestamps duplicados detectados${NC}"
      echo ""
      echo "  Migración 1: $prev_name"
      echo "  Migración 2: $current_name"
      echo "  Ambas tienen timestamp: $current_timestamp"
      echo ""
      echo "💡 Solución: Una de estas migraciones debe ser renombrada con un timestamp único"
      echo ""
      errors=$((errors + 1))
    fi
  fi

  prev_timestamp="$current_timestamp"
  prev_name="$current_name"
done

# Verificar gaps sospechosos (diferencia de más de 1 año)
if [ ${#timestamps[@]} -gt 1 ]; then
  for i in $(seq 1 $((${#timestamps[@]} - 1))); do
    prev_ts="${timestamps[$((i - 1))]}"
    curr_ts="${timestamps[$i]}"

    prev_year="${prev_ts:0:4}"
    curr_year="${curr_ts:0:4}"

    diff=$((curr_year - prev_year))

    if [ $diff -lt 0 ]; then
      echo -e "${RED}❌ ERROR: Salto temporal sospechoso detectado${NC}"
      echo ""
      echo "  ${names[$((i - 1))]} (año $prev_year)"
      echo "  ${names[$i]} (año $curr_year)"
      echo ""
      echo "Una migración de año $curr_year NO puede estar después de una de año $prev_year"
      echo ""
      errors=$((errors + 1))
    elif [ $diff -gt 1 ]; then
      echo -e "${YELLOW}⚠️  ADVERTENCIA: Gap temporal grande detectado${NC}"
      echo ""
      echo "  ${names[$((i - 1))]} (año $prev_year)"
      echo "  ${names[$i]} (año $curr_year)"
      echo ""
      echo "Hay ${diff} años de diferencia. Verifica que esto sea intencional."
      echo ""
    fi
  done
fi

# Verificar que no haya archivos temporales o de debug
temp_files=$(find "$MIGRATIONS_DIR" -type f -name "*temp*" -o -name "*debug*" -o -name "*test*" -o -name "*backup*" 2>/dev/null || true)
if [ -n "$temp_files" ]; then
  echo -e "${YELLOW}⚠️  ADVERTENCIA: Archivos temporales encontrados en migraciones:${NC}"
  echo "$temp_files"
  echo ""
fi

echo ""
if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✅ Todas las migraciones están en orden cronológico correcto${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Se encontraron $errors error(es) en las migraciones${NC}"
  echo ""
  echo "Por favor corrige estos problemas antes de hacer deploy."
  echo ""
  exit 1
fi
