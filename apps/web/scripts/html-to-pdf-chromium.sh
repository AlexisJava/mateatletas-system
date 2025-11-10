#!/bin/bash
# Script para convertir HTML a PDF usando Chromium/Chrome
# Uso: ./html-to-pdf-chromium.sh <archivo.html> [archivo-salida.pdf]

if [ $# -lt 1 ]; then
    echo "Uso: $0 <archivo.html> [archivo-salida.pdf]"
    echo ""
    echo "Ejemplo:"
    echo "  $0 colonia-directiva-docentes-2026.html"
    echo "  $0 input.html output.pdf"
    exit 1
fi

HTML_FILE="$1"
PDF_FILE="${2:-${HTML_FILE%.html}.pdf}"

# Verificar que el archivo HTML existe
if [ ! -f "$HTML_FILE" ]; then
    echo "❌ Error: El archivo $HTML_FILE no existe"
    exit 1
fi

# Buscar chromium o chrome
CHROME=""
if command -v chromium &> /dev/null; then
    CHROME="chromium"
elif command -v google-chrome &> /dev/null; then
    CHROME="google-chrome"
elif command -v google-chrome-stable &> /dev/null; then
    CHROME="google-chrome-stable"
else
    echo "❌ Error: No se encontró Chromium ni Chrome"
    echo "Instala con: sudo pacman -S chromium"
    exit 1
fi

echo "🌐 Usando: $CHROME"
echo "📄 Convirtiendo $HTML_FILE a $PDF_FILE..."

# Convertir HTML a PDF
"$CHROME" --headless --disable-gpu --print-to-pdf="$PDF_FILE" --print-to-pdf-no-header "file://$(realpath "$HTML_FILE")" 2>/dev/null

if [ -f "$PDF_FILE" ]; then
    SIZE=$(du -h "$PDF_FILE" | cut -f1)
    echo "✅ PDF generado exitosamente: $PDF_FILE"
    echo "📊 Tamaño: $SIZE"
else
    echo "❌ Error al generar el PDF"
    exit 1
fi
