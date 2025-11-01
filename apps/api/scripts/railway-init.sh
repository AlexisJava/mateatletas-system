#!/bin/bash
# Railway Initialization Script
# Este script se ejecuta antes de iniciar la aplicación en Railway

set -e  # Detener en caso de error

echo "🚀 Iniciando configuración de Railway para Mateatletas API..."

# Verificar que las variables de entorno críticas estén configuradas
echo "📋 Verificando variables de entorno..."
required_vars=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ Error: Faltan las siguientes variables de entorno:"
  printf '   - %s\n' "${missing_vars[@]}"
  echo ""
  echo "Por favor, configura estas variables en Railway antes de continuar."
  exit 1
fi

echo "✅ Variables de entorno críticas configuradas correctamente"

# Generar cliente de Prisma
echo "🔨 Generando cliente de Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# Verificar si la base de datos necesita seed inicial
echo "🌱 Verificando si se necesita seed inicial..."
# Solo hacer seed en primera ejecución o si está vacío
if npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | grep -q "0"; then
  echo "📦 Base de datos vacía, ejecutando seed..."
  npm run db:seed:prod
else
  echo "✅ Base de datos ya tiene datos, omitiendo seed"
fi

echo "✨ Inicialización completada exitosamente"
