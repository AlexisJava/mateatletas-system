const { PrismaClient } = require('@prisma/client');
const { writeFileSync } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function exportEstudiantes() {
  try {
    // Obtener todos los grupos con sus estudiantes
    const grupos = await prisma.claseGrupo.findMany({
      select: {
        nombre: true,
        inscripciones: {
          select: {
            estudiante: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    // Mapeo de grupos a categorías
    const categorias = {
      B1: [],
      B2: [],
      B3: [],
    };

    // Procesar cada grupo
    grupos.forEach((grupo) => {
      const estudiantes = grupo.inscripciones.map(
        (insc) => `${insc.estudiante.nombre} ${insc.estudiante.apellido}`,
      );

      // Clasificar según las reglas
      if (
        grupo.nombre.includes('Arduino') &&
        grupo.nombre.includes('LUNES 18:00')
      ) {
        // Arduino Nivel 1 → B1
        categorias['B1'].push(...estudiantes);
      } else if (grupo.nombre.includes('Matemáticas + Scratch')) {
        // Matemáticas + Scratch → B1
        categorias['B1'].push(...estudiantes);
      } else if (
        grupo.nombre.includes('Arduino') &&
        grupo.nombre.includes('LUNES 19:30')
      ) {
        // Arduino Nivel 2 → B2
        categorias['B2'].push(...estudiantes);
      } else if (grupo.nombre.includes('Roblox')) {
        // Roblox → B2
        categorias['B2'].push(...estudiantes);
      } else if (grupo.nombre.startsWith('B1')) {
        categorias['B1'].push(...estudiantes);
      } else if (grupo.nombre.startsWith('B2')) {
        categorias['B2'].push(...estudiantes);
      } else if (
        grupo.nombre.startsWith('B3') ||
        grupo.nombre.startsWith('L1') ||
        grupo.nombre.startsWith('L2') ||
        grupo.nombre.startsWith('L3') ||
        grupo.nombre.startsWith('L4') ||
        grupo.nombre.includes('Astronomía') ||
        grupo.nombre.includes('Matemática Financiera') ||
        grupo.nombre.includes('Programación de Videojuegos')
      ) {
        // B3, L1, L2, L3, L4, Astronomía, Mate Financiera, Prog Videojuegos → B3
        categorias['B3'].push(...estudiantes);
      }
    });

    // Normalizar función para remover acentos
    const normalizar = (str) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    // Eliminar duplicados (ignorando acentos) y ordenar
    const estudiantesPorGrupo = Object.entries(categorias)
      .map(([grupo, estudiantes]) => {
        // Eliminar duplicados ignorando acentos
        const unicos = [];
        const vistos = new Set();

        estudiantes.forEach((est) => {
          const normalizado = normalizar(est);
          if (!vistos.has(normalizado)) {
            vistos.add(normalizado);
            unicos.push(est);
          }
        });

        return {
          grupo,
          estudiantes: unicos.sort((a, b) => a.localeCompare(b)),
        };
      })
      .filter((g) => g.estudiantes.length > 0);

    const outputPath = join(process.cwd(), 'estudiantes-por-grupo.json');
    writeFileSync(
      outputPath,
      JSON.stringify(estudiantesPorGrupo, null, 2),
      'utf-8',
    );

    const totalEstudiantes = estudiantesPorGrupo.reduce(
      (sum, g) => sum + g.estudiantes.length,
      0,
    );

    console.log(
      `✅ Exportados ${totalEstudiantes} estudiantes en ${grupos.length} grupos`,
    );
    console.log(`📁 Archivo: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error al exportar estudiantes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportEstudiantes();
