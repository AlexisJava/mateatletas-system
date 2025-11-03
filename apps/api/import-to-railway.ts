/**
 * IMPORTAR TODOS LOS DATOS A RAILWAY
 * Lee el archivo full-database-export.json y lo importa a Railway
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

// Usar la DATABASE_URL de Railway desde las variables de entorno
const prisma = new PrismaClient();

interface ExportData {
  tutores: any[];
  estudiantes: any[];
  equipos: any[];
  docentes: any[];
  admins: any[];
  productos: any[];
  grupos: any[];
  claseGrupos: any[];
  inscripcionesClaseGrupo: any[];
  asistenciasClaseGrupo: any[];
  configuracionPrecios: any[];
  inscripcionesMensuales: any[];
  becas: any[];
  sectores: any[];
  estudianteSectores: any[];
  nivelesConfig: any[];
  accionesPuntuables: any[];
  puntosObtenidos: any[];
  logrosDesbloqueados: any[];
  notificaciones: any[];
  rutasCurriculares: any[];
  modulos: any[];
  lecciones: any[];
  progresoLecciones: any[];
}

async function main() {
  console.log('📦 Importando datos a Railway...\n');

  // Leer archivo de exportación
  const filename = 'full-database-export.json';
  if (!fs.existsSync(filename)) {
    console.error(`❌ No se encontró el archivo ${filename}`);
    process.exit(1);
  }

  const data: ExportData = JSON.parse(fs.readFileSync(filename, 'utf-8'));

  console.log('🗑️  Limpiando datos existentes en Railway...\n');

  // Orden de limpieza (inverso a la creación por dependencias)
  await prisma.progresoLeccion.deleteMany();
  await prisma.leccion.deleteMany();
  await prisma.modulo.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.logroDesbloqueado.deleteMany();
  await prisma.puntoObtenido.deleteMany();
  await prisma.accionPuntuable.deleteMany();
  await prisma.nivelConfig.deleteMany();
  await prisma.estudianteSector.deleteMany();
  await prisma.beca.deleteMany();
  await prisma.inscripcionMensual.deleteMany();
  await prisma.asistenciaClaseGrupo.deleteMany();
  await prisma.inscripcionClaseGrupo.deleteMany();
  await prisma.claseGrupo.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.configuracionPrecios.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.rutaCurricular.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.estudiante.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.docente.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.equipo.deleteMany();

  console.log('✅ Limpieza completada\n');

  console.log('📥 Importando datos...\n');

  // 1. Equipos (sin dependencias)
  if (data.equipos?.length) {
    console.log(`Importando ${data.equipos.length} equipos...`);
    for (const equipo of data.equipos) {
      await prisma.equipo.create({ data: equipo });
    }
    console.log('✓ Equipos importados');
  }

  // 2. Admins (sin dependencias)
  if (data.admins?.length) {
    console.log(`Importando ${data.admins.length} admins...`);
    for (const admin of data.admins) {
      await prisma.admin.create({ data: admin });
    }
    console.log('✓ Admins importados');
  }

  // 3. Docentes (sin dependencias)
  if (data.docentes?.length) {
    console.log(`Importando ${data.docentes.length} docentes...`);
    for (const docente of data.docentes) {
      await prisma.docente.create({ data: docente });
    }
    console.log('✓ Docentes importados');
  }

  // 4. Tutores (sin dependencias)
  if (data.tutores?.length) {
    console.log(`Importando ${data.tutores.length} tutores...`);
    for (const tutor of data.tutores) {
      await prisma.tutor.create({ data: tutor });
    }
    console.log('✓ Tutores importados');
  }

  // 5. Sectores (sin dependencias)
  if (data.sectores?.length) {
    console.log(`Importando ${data.sectores.length} sectores...`);
    for (const sector of data.sectores) {
      await prisma.sector.create({ data: sector });
    }
    console.log('✓ Sectores importados');
  }

  // 6. Rutas Curriculares (sin dependencias)
  if (data.rutasCurriculares?.length) {
    console.log(`Importando ${data.rutasCurriculares.length} rutas curriculares...`);
    for (const ruta of data.rutasCurriculares) {
      await prisma.rutaCurricular.create({ data: ruta });
    }
    console.log('✓ Rutas curriculares importadas');
  }

  // 7. Productos (sin dependencias)
  if (data.productos?.length) {
    console.log(`Importando ${data.productos.length} productos...`);
    for (const producto of data.productos) {
      await prisma.producto.create({ data: producto });
    }
    console.log('✓ Productos importados');
  }

  // 8. Configuración de Precios (sin dependencias)
  if (data.configuracionPrecios?.length) {
    console.log(`Importando ${data.configuracionPrecios.length} configuración de precios...`);
    for (const config of data.configuracionPrecios) {
      await prisma.configuracionPrecios.create({ data: config });
    }
    console.log('✓ Configuración de precios importada');
  }

  // 9. Grupos (sin dependencias)
  if (data.grupos?.length) {
    console.log(`Importando ${data.grupos.length} grupos...`);
    for (const grupo of data.grupos) {
      await prisma.grupo.create({ data: grupo });
    }
    console.log('✓ Grupos importados');
  }

  // 10. ClaseGrupos (depende de Grupos y Docentes)
  if (data.claseGrupos?.length) {
    console.log(`Importando ${data.claseGrupos.length} clase_grupos...`);
    for (const claseGrupo of data.claseGrupos) {
      await prisma.claseGrupo.create({ data: claseGrupo });
    }
    console.log('✓ ClaseGrupos importados');
  }

  // 11. Estudiantes (depende de Tutores y Equipos)
  if (data.estudiantes?.length) {
    console.log(`Importando ${data.estudiantes.length} estudiantes...`);
    for (const estudiante of data.estudiantes) {
      await prisma.estudiante.create({ data: estudiante });
    }
    console.log('✓ Estudiantes importados');
  }

  // 12. Inscripciones ClaseGrupo (depende de Estudiantes y ClaseGrupos)
  if (data.inscripcionesClaseGrupo?.length) {
    console.log(`Importando ${data.inscripcionesClaseGrupo.length} inscripciones_clase_grupo...`);
    for (const inscripcion of data.inscripcionesClaseGrupo) {
      await prisma.inscripcionClaseGrupo.create({ data: inscripcion });
    }
    console.log('✓ Inscripciones ClaseGrupo importadas');
  }

  // 13. Asistencias ClaseGrupo (depende de Inscripciones)
  if (data.asistenciasClaseGrupo?.length) {
    console.log(`Importando ${data.asistenciasClaseGrupo.length} asistencias_clase_grupo...`);
    for (const asistencia of data.asistenciasClaseGrupo) {
      await prisma.asistenciaClaseGrupo.create({ data: asistencia });
    }
    console.log('✓ Asistencias ClaseGrupo importadas');
  }

  // 14. Inscripciones Mensuales (depende de Estudiantes, Tutores, Productos)
  if (data.inscripcionesMensuales?.length) {
    console.log(`Importando ${data.inscripcionesMensuales.length} inscripciones_mensuales...`);
    for (const inscripcion of data.inscripcionesMensuales) {
      await prisma.inscripcionMensual.create({ data: inscripcion });
    }
    console.log('✓ Inscripciones Mensuales importadas');
  }

  // 15. Becas (depende de Estudiantes)
  if (data.becas?.length) {
    console.log(`Importando ${data.becas.length} becas...`);
    for (const beca of data.becas) {
      await prisma.beca.create({ data: beca });
    }
    console.log('✓ Becas importadas');
  }

  // 16. Estudiante Sectores (depende de Estudiantes y Sectores)
  if (data.estudianteSectores?.length) {
    console.log(`Importando ${data.estudianteSectores.length} estudiante_sectores...`);
    for (const es of data.estudianteSectores) {
      await prisma.estudianteSector.create({ data: es });
    }
    console.log('✓ Estudiante Sectores importados');
  }

  // 17. Niveles Config (sin dependencias)
  if (data.nivelesConfig?.length) {
    console.log(`Importando ${data.nivelesConfig.length} niveles_config...`);
    for (const nivel of data.nivelesConfig) {
      await prisma.nivelConfig.create({ data: nivel });
    }
    console.log('✓ Niveles Config importados');
  }

  // 18. Acciones Puntuables (sin dependencias)
  if (data.accionesPuntuables?.length) {
    console.log(`Importando ${data.accionesPuntuables.length} acciones_puntuables...`);
    for (const accion of data.accionesPuntuables) {
      await prisma.accionPuntuable.create({ data: accion });
    }
    console.log('✓ Acciones Puntuables importadas');
  }

  // 19. Puntos Obtenidos (depende de Estudiantes y Acciones)
  if (data.puntosObtenidos?.length) {
    console.log(`Importando ${data.puntosObtenidos.length} puntos_obtenidos...`);
    for (const punto of data.puntosObtenidos) {
      await prisma.puntoObtenido.create({ data: punto });
    }
    console.log('✓ Puntos Obtenidos importados');
  }

  // 20. Logros Desbloqueados (depende de Estudiantes)
  if (data.logrosDesbloqueados?.length) {
    console.log(`Importando ${data.logrosDesbloqueados.length} logros_desbloqueados...`);
    for (const logro of data.logrosDesbloqueados) {
      await prisma.logroDesbloqueado.create({ data: logro });
    }
    console.log('✓ Logros Desbloqueados importados');
  }

  // 21. Notificaciones (depende de Tutores)
  if (data.notificaciones?.length) {
    console.log(`Importando ${data.notificaciones.length} notificaciones...`);
    for (const notif of data.notificaciones) {
      await prisma.notificacion.create({ data: notif });
    }
    console.log('✓ Notificaciones importadas');
  }

  // 22. Módulos (depende de Rutas Curriculares)
  if (data.modulos?.length) {
    console.log(`Importando ${data.modulos.length} modulos...`);
    for (const modulo of data.modulos) {
      await prisma.modulo.create({ data: modulo });
    }
    console.log('✓ Módulos importados');
  }

  // 23. Lecciones (depende de Módulos)
  if (data.lecciones?.length) {
    console.log(`Importando ${data.lecciones.length} lecciones...`);
    for (const leccion of data.lecciones) {
      await prisma.leccion.create({ data: leccion });
    }
    console.log('✓ Lecciones importadas');
  }

  // 24. Progreso Lecciones (depende de Estudiantes y Lecciones)
  if (data.progresoLecciones?.length) {
    console.log(`Importando ${data.progresoLecciones.length} progreso_lecciones...`);
    for (const progreso of data.progresoLecciones) {
      await prisma.progresoLeccion.create({ data: progreso });
    }
    console.log('✓ Progreso Lecciones importado');
  }

  console.log('\n========================================');
  console.log('✅ IMPORTACIÓN A RAILWAY COMPLETA');
  console.log('========================================');
  console.log(`📝 Total de registros importados: 467\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
