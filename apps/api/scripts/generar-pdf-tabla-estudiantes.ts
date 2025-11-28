/**
 * Script para generar UN SOLO PDF con TABLA de credenciales de TODOS los estudiantes
 *
 * Genera una tabla simple con:
 * - N° (número de orden)
 * - Nombre completo
 * - Usuario (formato nombre.apellido)
 * - PIN de 4 dígitos
 *
 * Uso: npx tsx scripts/generar-pdf-tabla-estudiantes.ts
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EstudianteCredencial {
  nombre: string;
  apellido: string;
  username: string;
  pin: string;
}

async function obtenerTodosLosEstudiantes(): Promise<EstudianteCredencial[]> {
  const estudiantes = await prisma.estudiante.findMany({
    select: {
      nombre: true,
      apellido: true,
      password_temporal: true,
    },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
  });

  return estudiantes.map((est) => {
    // Tomar solo el PRIMER nombre y el PRIMER apellido
    const primerNombre = est.nombre.trim().split(/\s+/)[0];
    const primerApellido = est.apellido.trim().split(/\s+/)[0];

    // Generar username como nombre.apellido (lowercase, sin acentos)
    const nombreLimpio = primerNombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const apellidoLimpio = primerApellido
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const username = `${nombreLimpio}.${apellidoLimpio}`;

    return {
      nombre: est.nombre,
      apellido: est.apellido,
      username: username,
      pin: est.password_temporal || 'N/A',
    };
  });
}

function generarPDFTabla(
  estudiantes: EstudianteCredencial[],
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Crear documento PDF en formato LANDSCAPE (horizontal)
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Colores Mateatletas
      const primaryColor = '#F97316'; // Orange-500
      const textColor = '#1F2937'; // Gray-800
      const headerBg = '#FEF3C7'; // Yellow-100
      const rowAltBg = '#F9FAFB'; // Gray-50

      // ═══════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════
      doc.rect(0, 0, doc.page.width, 70).fill(primaryColor);

      doc
        .fontSize(24)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('MATEATLETAS - CREDENCIALES DE ACCESO', 40, 20);

      doc
        .fontSize(11)
        .fillColor('#FFFFFF')
        .font('Helvetica')
        .text('Lista completa de estudiantes con usuario y PIN', 40, 48);

      // ═══════════════════════════════════════════════════════
      // TABLA
      // ═══════════════════════════════════════════════════════
      let yPos = 90;
      const startX = 40;
      const cols = {
        num: 35,
        nombre: 250,
        usuario: 200,
        pin: 80,
      };
      const totalWidth = cols.num + cols.nombre + cols.usuario + cols.pin;
      const rowHeight = 18;

      // Función helper para dibujar header de tabla
      function drawTableHeader() {
        // Fondo amarillo
        doc.rect(startX, yPos, totalWidth, 22).fill(headerBg);

        // Textos del header
        doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold');

        let xPos = startX;
        doc.text('N°', xPos + 8, yPos + 6, {
          width: cols.num - 10,
          align: 'center',
        });
        xPos += cols.num;
        doc.text('NOMBRE COMPLETO', xPos + 5, yPos + 6, {
          width: cols.nombre - 10,
        });
        xPos += cols.nombre;
        doc.text('USUARIO', xPos + 5, yPos + 6, { width: cols.usuario - 10 });
        xPos += cols.usuario;
        doc.text('PIN', xPos + 5, yPos + 6, {
          width: cols.pin - 10,
          align: 'center',
        });

        yPos += 22;

        // Línea separadora
        doc.strokeColor(primaryColor).lineWidth(1.5);
        doc
          .moveTo(startX, yPos)
          .lineTo(startX + totalWidth, yPos)
          .stroke();

        yPos += 3;
      }

      // Dibujar header inicial
      drawTableHeader();

      // Filas de estudiantes
      doc.fontSize(8).font('Helvetica');

      estudiantes.forEach((estudiante, index) => {
        // Verificar si hay espacio para una nueva fila
        if (yPos > doc.page.height - 60) {
          doc.addPage({ layout: 'landscape' });
          yPos = 50;
          drawTableHeader(); // Redibujar header en nueva página
        }

        // Alternar color de fondo (filas pares)
        if (index % 2 === 0) {
          doc.rect(startX, yPos, totalWidth, rowHeight).fill(rowAltBg);
        }

        // Contenido de la fila
        doc.fillColor(textColor);

        let xPos = startX;

        // N°
        doc.text((index + 1).toString(), xPos + 8, yPos + 5, {
          width: cols.num - 10,
          align: 'center',
        });
        xPos += cols.num;

        // Nombre completo
        doc.text(
          `${estudiante.apellido}, ${estudiante.nombre}`,
          xPos + 5,
          yPos + 5,
          { width: cols.nombre - 10, ellipsis: true },
        );
        xPos += cols.nombre;

        // Usuario
        doc.text(estudiante.username, xPos + 5, yPos + 5, {
          width: cols.usuario - 10,
          ellipsis: true,
        });
        xPos += cols.usuario;

        // PIN (destacado en naranja)
        doc.fillColor(primaryColor).font('Helvetica-Bold');
        doc.text(estudiante.pin, xPos + 5, yPos + 5, {
          width: cols.pin - 10,
          align: 'center',
        });
        doc.font('Helvetica');

        yPos += rowHeight;
      });

      // ═══════════════════════════════════════════════════════
      // FOOTER con instrucciones
      // ═══════════════════════════════════════════════════════
      const footerY = doc.page.height - 30;

      doc
        .fontSize(7)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(
          'Instrucciones: Ingresar a https://app.mateatletas.com → Seleccionar "Estudiante" → Ingresar USUARIO y PIN',
          40,
          footerY,
          { width: doc.page.width - 80, align: 'center' },
        );

      // Finalizar documento
      doc.end();

      stream.on('finish', () => {
        console.log(`✅ PDF generado: ${outputPath}`);
        resolve();
      });

      stream.on('error', (error) => {
        console.error(`❌ Error al generar PDF: ${outputPath}`, error);
        reject(error);
      });
    } catch (error) {
      console.error(`❌ Error en generarPDFTabla:`, error);
      reject(error);
    }
  });
}

async function main() {
  console.log('🚀 Iniciando generación de PDF con tabla de credenciales...\n');

  try {
    const estudiantes = await obtenerTodosLosEstudiantes();
    console.log(`📊 Total de estudiantes: ${estudiantes.length}\n`);

    const outputDir = path.join(process.cwd(), 'pdfs-credenciales-estudiantes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = 'Credenciales_TODOS_LOS_ESTUDIANTES.pdf';
    const filePath = path.join(outputDir, fileName);

    await generarPDFTabla(estudiantes, filePath);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ PDF GENERADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🎓 Estudiantes: ${estudiantes.length}`);
    console.log(`📁 Ubicación: ${filePath}`);
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
