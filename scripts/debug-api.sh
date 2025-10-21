#!/bin/bash
# Script para debugging de la API con logs claros

echo "🚀 Iniciando API en modo DEBUG..."
echo "📋 Los logs aparecerán aquí abajo"
echo "════════════════════════════════════════════════════════"
echo ""

cd apps/api
npm run start:dev
