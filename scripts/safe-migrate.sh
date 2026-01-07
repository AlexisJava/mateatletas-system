#!/bin/bash
# safe-migrate.sh - Script para migraciones seguras de Prisma
# Uso: ./scripts/safe-migrate.sh nombre_migracion

set -e

if [ -z "$1" ]; then
    echo "Error: Debes proporcionar un nombre para la migración"
    echo "Uso: ./scripts/safe-migrate.sh nombre_migracion"
    exit 1
fi

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pre_migrate_${TIMESTAMP}.sql"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo "MIGRACIÓN SEGURA - Mateatletas"
echo "=========================================="
echo ""

# 1. Hacer backup
echo "[1/3] Haciendo backup de la base de datos..."
pg_dump -U postgres mateatletas_dev > "$BACKUP_FILE"
echo "      Backup guardado en: $BACKUP_FILE"
echo ""

# 2. Ejecutar migración
echo "[2/3] Ejecutando migración: $1"
cd apps/api
npx prisma migrate dev --name "$1"
cd ../..
echo ""

# 3. Confirmar éxito
echo "[3/3] Migración completada"
echo ""
echo "=========================================="
echo "RESUMEN"
echo "=========================================="
echo "Backup: $BACKUP_FILE"
echo "Migración: $1"
echo ""
echo "Si algo salió mal, restaurá con:"
echo "  psql -U postgres mateatletas_dev < $BACKUP_FILE"
echo "=========================================="
