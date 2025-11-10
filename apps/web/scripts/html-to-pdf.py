#!/usr/bin/env python3
"""
Script para convertir HTML a PDF usando WeasyPrint
Uso: python html-to-pdf.py <archivo.html> [archivo-salida.pdf]
"""

import sys
import os
from pathlib import Path

try:
    from weasyprint import HTML, CSS
except ImportError:
    print("Error: WeasyPrint no está instalado.")
    print("Instalalo con: pip install weasyprint")
    sys.exit(1)


def convert_html_to_pdf(html_path, pdf_path=None):
    """
    Convierte un archivo HTML a PDF

    Args:
        html_path: Ruta al archivo HTML
        pdf_path: Ruta de salida del PDF (opcional)
    """
    # Verificar que el archivo HTML existe
    if not os.path.exists(html_path):
        print(f"Error: El archivo {html_path} no existe")
        sys.exit(1)

    # Si no se especifica PDF de salida, usar el mismo nombre
    if pdf_path is None:
        pdf_path = Path(html_path).with_suffix('.pdf')

    print(f"Convirtiendo {html_path} a {pdf_path}...")

    try:
        # Convertir HTML a PDF
        HTML(filename=html_path).write_pdf(pdf_path)
        print(f"✅ PDF generado exitosamente: {pdf_path}")
        print(f"📄 Tamaño: {os.path.getsize(pdf_path) / 1024:.2f} KB")
    except Exception as e:
        print(f"❌ Error al convertir: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python html-to-pdf.py <archivo.html> [archivo-salida.pdf]")
        print("\nEjemplo:")
        print("  python html-to-pdf.py colonia-directiva-docentes-2026.html")
        print("  python html-to-pdf.py input.html output.pdf")
        sys.exit(1)

    html_file = sys.argv[1]
    pdf_file = sys.argv[2] if len(sys.argv) > 2 else None

    convert_html_to_pdf(html_file, pdf_file)
