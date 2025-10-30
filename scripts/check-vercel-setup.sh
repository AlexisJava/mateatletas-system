#!/bin/bash

# Script para verificar la configuración de Vercel Blob

echo "============================================================"
echo "🔍 VERIFICACIÓN DE CONFIGURACIÓN VERCEL BLOB"
echo "============================================================"
echo ""

# Verificar si existe .env.local
if [ -f ".env.local" ]; then
    echo "✅ Archivo .env.local encontrado"

    # Verificar si contiene BLOB_READ_WRITE_TOKEN
    if grep -q "BLOB_READ_WRITE_TOKEN" .env.local; then
        if grep "BLOB_READ_WRITE_TOKEN" .env.local | grep -q "vercel_blob"; then
            echo "✅ BLOB_READ_WRITE_TOKEN configurado"
            echo ""
            echo "🎉 ¡Todo listo! Puedes ejecutar:"
            echo "   npm run upload-animations"
            echo ""
        else
            echo "⚠️  BLOB_READ_WRITE_TOKEN existe pero parece incompleto"
            echo ""
            echo "📝 Asegúrate de que tenga este formato:"
            echo "   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX"
            echo ""
        fi
    else
        echo "❌ BLOB_READ_WRITE_TOKEN no encontrado en .env.local"
        echo ""
        echo "📝 Agrega esta línea a tu archivo .env.local:"
        echo "   BLOB_READ_WRITE_TOKEN=tu_token_aqui"
        echo ""
    fi
else
    echo "❌ Archivo .env.local no encontrado"
    echo ""
    echo "============================================================"
    echo "📋 INSTRUCCIONES PARA CONFIGURAR VERCEL BLOB"
    echo "============================================================"
    echo ""
    echo "1. Ve a: https://vercel.com/dashboard"
    echo ""
    echo "2. Selecciona tu proyecto 'proyecto-completo'"
    echo ""
    echo "3. Ve a: Settings → Storage"
    echo ""
    echo "4. Crea un nuevo Blob Store:"
    echo "   - Nombre: mateatletas-animations"
    echo "   - Plan: Hobby (Gratis - 1GB)"
    echo ""
    echo "5. Copia el token BLOB_READ_WRITE_TOKEN que aparece"
    echo ""
    echo "6. Crea el archivo .env.local en la raíz del proyecto:"
    echo "   cat > .env.local << 'EOF'"
    echo "   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX"
    echo "   EOF"
    echo ""
    echo "7. Ejecuta de nuevo este script para verificar:"
    echo "   bash scripts/check-vercel-setup.sh"
    echo ""
fi

echo "============================================================"
echo ""
