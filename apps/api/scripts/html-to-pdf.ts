/**
 * Script para convertir HTML a PDF usando PDFKit
 *
 * Uso:
 * 1. Modificar la variable htmlContent con tu HTML
 * 2. Ejecutar: npx tsx scripts/html-to-pdf.ts
 * 3. El PDF se genera en: pdfs-output/documento.pdf
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════
// PEGÁ TU HTML ACÁ
// ═══════════════════════════════════════════════════════
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Mi Documento</title>
</head>
<body>
  <h1>Título del Documento</h1>
  <p>Este es un párrafo de ejemplo.</p>
</body>
</html>
`;

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════
const outputFileName = 'documento.pdf'; // Cambiá el nombre si querés

function generarPDF(outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Colores Mateatletas (personalizables)
      const primaryColor = '#F97316'; // Orange-500
      const textColor = '#1F2937'; // Gray-800

      // ═══════════════════════════════════════════════════════
      // PARSING BÁSICO DEL HTML (para títulos, párrafos)
      // ═══════════════════════════════════════════════════════

      // Extraer títulos <h1>
      const h1Matches = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/gi);
      if (h1Matches) {
        h1Matches.forEach((h1) => {
          const text = h1.replace(/<\/?h1[^>]*>/gi, '').trim();
          doc
            .fontSize(24)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text(text, { align: 'left' });
          doc.moveDown(0.5);
        });
      }

      // Extraer títulos <h2>
      const h2Matches = htmlContent.match(/<h2[^>]*>(.*?)<\/h2>/gi);
      if (h2Matches) {
        h2Matches.forEach((h2) => {
          const text = h2.replace(/<\/?h2[^>]*>/gi, '').trim();
          doc
            .fontSize(18)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text(text, { align: 'left' });
          doc.moveDown(0.3);
        });
      }

      // Extraer títulos <h3>
      const h3Matches = htmlContent.match(/<h3[^>]*>(.*?)<\/h3>/gi);
      if (h3Matches) {
        h3Matches.forEach((h3) => {
          const text = h3.replace(/<\/?h3[^>]*>/gi, '').trim();
          doc
            .fontSize(14)
            .fillColor(textColor)
            .font('Helvetica-Bold')
            .text(text, { align: 'left' });
          doc.moveDown(0.3);
        });
      }

      // Extraer párrafos <p>
      const pMatches = htmlContent.match(/<p[^>]*>(.*?)<\/p>/gi);
      if (pMatches) {
        pMatches.forEach((p) => {
          const text = p.replace(/<\/?p[^>]*>/gi, '').trim();
          doc
            .fontSize(11)
            .fillColor(textColor)
            .font('Helvetica')
            .text(text, { align: 'left', lineGap: 4 });
          doc.moveDown(0.5);
        });
      }

      // Extraer listas <ul> <li>
      const ulMatches = htmlContent.match(/<ul[^>]*>(.*?)<\/ul>/gis);
      if (ulMatches) {
        ulMatches.forEach((ul) => {
          const liMatches = ul.match(/<li[^>]*>(.*?)<\/li>/gi);
          if (liMatches) {
            liMatches.forEach((li) => {
              const text = li.replace(/<\/?li[^>]*>/gi, '').trim();
              doc
                .fontSize(11)
                .fillColor(textColor)
                .font('Helvetica')
                .text(`• ${text}`, { indent: 20, lineGap: 4 });
            });
            doc.moveDown(0.5);
          }
        });
      }

      // Extraer listas ordenadas <ol> <li>
      const olMatches = htmlContent.match(/<ol[^>]*>(.*?)<\/ol>/gis);
      if (olMatches) {
        olMatches.forEach((ol) => {
          const liMatches = ol.match(/<li[^>]*>(.*?)<\/li>/gi);
          if (liMatches) {
            liMatches.forEach((li, index) => {
              const text = li.replace(/<\/?li[^>]*>/gi, '').trim();
              doc
                .fontSize(11)
                .fillColor(textColor)
                .font('Helvetica')
                .text(`${index + 1}. ${text}`, { indent: 20, lineGap: 4 });
            });
            doc.moveDown(0.5);
          }
        });
      }

      // Extraer negritas <strong> o <b>
      const strongMatches = htmlContent.match(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi);
      if (strongMatches) {
        strongMatches.forEach((strong) => {
          const text = strong.replace(/<\/?(?:strong|b)[^>]*>/gi, '').trim();
          doc
            .fontSize(11)
            .fillColor(textColor)
            .font('Helvetica-Bold')
            .text(text);
          doc.moveDown(0.3);
        });
      }

      // ═══════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════
      doc
        .fontSize(8)
        .fillColor('#9CA3AF')
        .font('Helvetica')
        .text(
          'Documento generado automáticamente por Mateatletas',
          50,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();

      stream.on('finish', () => {
        console.log(`✅ PDF generado exitosamente: ${outputPath}`);
        resolve();
      });

      stream.on('error', (error) => {
        console.error(`❌ Error al generar PDF: ${outputPath}`, error);
        reject(error);
      });
    } catch (error) {
      console.error(`❌ Error en generarPDF:`, error);
      reject(error);
    }
  });
}

async function main() {
  console.log('🚀 Convirtiendo HTML a PDF...\n');

  try {
    // Crear directorio de salida
    const outputDir = path.join(process.cwd(), 'pdfs-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Directorio creado: ${outputDir}\n`);
    }

    const filePath = path.join(outputDir, outputFileName);
    await generarPDF(filePath);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ CONVERSIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`📄 Archivo: ${filePath}`);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('💡 Para descargar, buscá el archivo en:');
    console.log(`   ${filePath}`);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

main();
