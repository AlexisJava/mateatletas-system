/**
 * Script para generar PDFs con credenciales de acceso de ESTUDIANTES para familias
 *
 * Genera un PDF por cada tutor/familia conteniendo SOLO:
 * - Credenciales de todos sus estudiantes (email y PIN de 4 dígitos)
 *
 * Uso: npx tsx scripts/generar-pdfs-credenciales.ts
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TutorConEstudiantes {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estudiantes: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    password_temporal?: string | null;
  }[];
}

async function obtenerTutoresConEstudiantes(): Promise<TutorConEstudiantes[]> {
  const tutores = await prisma.tutor.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      estudiantes: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          password_temporal: true,
        },
        orderBy: {
          nombre: 'asc',
        },
      },
    },
    orderBy: {
      apellido: 'asc',
    },
  });

  return tutores;
}

function generarPDF(
  tutor: TutorConEstudiantes,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Crear el documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      // Pipe a un archivo
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Colores Mateatletas
      const primaryColor = '#F97316'; // Orange-500
      const secondaryColor = '#FBBF24'; // Yellow-400
      const textColor = '#1F2937'; // Gray-800
      const lightGray = '#F3F4F6'; // Gray-100

      // ═══════════════════════════════════════════════════════
      // HEADER - Logo y título
      // ═══════════════════════════════════════════════════════
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      doc
        .fontSize(32)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('MATEATLETAS', 50, 30);

      doc
        .fontSize(14)
        .fillColor('#FFFFFF')
        .font('Helvetica')
        .text('CLUB STEAM', 50, 70);

      doc
        .fontSize(10)
        .fillColor('#FFFFFF')
        .font('Helvetica')
        .text('Credenciales de Acceso - Estudiantes', 50, 92);

      // ═══════════════════════════════════════════════════════
      // INFORMACIÓN DE LA FAMILIA
      // ═══════════════════════════════════════════════════════
      doc
        .fontSize(20)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text(`Familia ${tutor.apellido}`, 50, 150);

      doc
        .fontSize(12)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(`Tutor/Padre: ${tutor.nombre} ${tutor.apellido}`, 50, 180);

      doc
        .fontSize(10)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(`Email: ${tutor.email}`, 50, 200);

      // ═══════════════════════════════════════════════════════
      // CREDENCIALES DE LOS ESTUDIANTES
      // ═══════════════════════════════════════════════════════
      let yPosition = 240;

      doc
        .fontSize(16)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text(
          `🎓 ACCESO ESTUDIANTES (${tutor.estudiantes.length})`,
          50,
          yPosition,
        );

      yPosition += 30;

      tutor.estudiantes.forEach((estudiante, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > doc.page.height - 150) {
          doc.addPage();
          yPosition = 50;
        }

        // Box del estudiante
        doc
          .roundedRect(50, yPosition, doc.page.width - 100, 120, 8)
          .fillAndStroke('#FEF3C7', secondaryColor);

        doc
          .fontSize(14)
          .fillColor(textColor)
          .font('Helvetica-Bold')
          .text(
            `${index + 1}. ${estudiante.nombre} ${estudiante.apellido}`,
            70,
            yPosition + 15,
          );

        // Email del estudiante
        doc
          .fontSize(10)
          .fillColor('#6B7280')
          .font('Helvetica-Bold')
          .text('Correo electrónico:', 70, yPosition + 40);

        doc
          .fontSize(11)
          .fillColor(textColor)
          .font('Helvetica')
          .text(estudiante.email, 70, yPosition + 54);

        // PIN del estudiante
        doc
          .fontSize(10)
          .fillColor('#6B7280')
          .font('Helvetica-Bold')
          .text('PIN de acceso (4 dígitos):', 70, yPosition + 74);

        const pinEstudiante = estudiante.password_temporal || 'No disponible';
        doc
          .fontSize(18)
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .text(pinEstudiante, 70, yPosition + 90);

        yPosition += 135;
      });

      // ═══════════════════════════════════════════════════════
      // INSTRUCCIONES DE ACCESO
      // ═══════════════════════════════════════════════════════
      if (yPosition > doc.page.height - 220) {
        doc.addPage();
        yPosition = 50;
      }

      yPosition += 20;

      doc
        .fontSize(14)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text('📋 INSTRUCCIONES DE ACCESO', 50, yPosition);

      yPosition += 25;

      doc
        .fontSize(10)
        .fillColor(textColor)
        .font('Helvetica')
        .text('1. Ingresar a: ', 50, yPosition, { continued: true })
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('https://app.mateatletas.com');

      yPosition += 20;

      doc
        .fillColor(textColor)
        .font('Helvetica')
        .text('2. Seleccionar tipo de usuario: "Estudiante"', 50, yPosition);

      yPosition += 20;

      doc
        .fillColor(textColor)
        .font('Helvetica')
        .text(
          '3. Ingresar el correo electrónico y el PIN de 4 dígitos',
          50,
          yPosition,
        );

      yPosition += 25;

      doc
        .fontSize(9)
        .fillColor('#DC2626')
        .font('Helvetica-Bold')
        .text('⚠️ IMPORTANTE:', 50, yPosition);

      yPosition += 15;

      doc
        .fontSize(9)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(
          '• Los estudiantes usan un PIN de 4 dígitos que NO cambia',
          50,
          yPosition,
        );

      yPosition += 12;

      doc
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(
          '• Este PIN es personal y único para cada estudiante',
          50,
          yPosition,
        );

      yPosition += 12;

      doc
        .fillColor('#6B7280')
        .font('Helvetica')
        .text('• Guarde este documento en un lugar seguro', 50, yPosition);

      yPosition += 12;

      doc
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(
          '• El portal de estudiantes funciona mejor en tablets o computadoras',
          50,
          yPosition,
        );

      // ═══════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════
      doc
        .fontSize(8)
        .fillColor('#9CA3AF')
        .font('Helvetica')
        .text(
          'Mateatletas Club STEAM - Documento generado automáticamente',
          50,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width - 100 },
        );

      // Finalizar el documento
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
      console.error(`❌ Error en generarPDF:`, error);
      reject(error);
    }
  });
}

async function main() {
  console.log(
    '🚀 Iniciando generación de PDFs de credenciales de ESTUDIANTES...\n',
  );

  try {
    // Obtener todos los tutores con sus estudiantes
    const tutores = await obtenerTutoresConEstudiantes();

    console.log(`📊 Total de familias encontradas: ${tutores.length}\n`);

    // Crear directorio de salida si no existe
    const outputDir = path.join(process.cwd(), 'pdfs-credenciales-estudiantes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Directorio creado: ${outputDir}\n`);
    }

    // Generar un PDF por cada tutor/familia
    let generados = 0;
    let errores = 0;
    let estudiantesTotal = 0;

    for (const tutor of tutores) {
      try {
        // Solo generar PDF si el tutor tiene estudiantes
        if (tutor.estudiantes.length === 0) {
          console.log(
            `⚠️ Familia ${tutor.apellido} no tiene estudiantes, omitiendo...`,
          );
          continue;
        }

        const fileName = `Credenciales_${tutor.apellido}_${tutor.nombre}.pdf`;
        const filePath = path.join(outputDir, fileName);

        await generarPDF(tutor, filePath);
        generados++;
        estudiantesTotal += tutor.estudiantes.length;
      } catch (error) {
        console.error(`❌ Error al generar PDF para ${tutor.apellido}:`, error);
        errores++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE GENERACIÓN');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ PDFs generados exitosamente: ${generados}`);
    console.log(`🎓 Total de estudiantes incluidos: ${estudiantesTotal}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📁 Ubicación: ${outputDir}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (generados > 0) {
      console.log(
        '🎉 ¡Proceso completado! Los PDFs están listos para enviar a las familias.',
      );
      console.log(
        '💡 Cada familia recibirá un PDF con las credenciales de sus estudiantes.',
      );
    }
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();
