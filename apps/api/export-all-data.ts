/**
 * EXPORTAR TODOS LOS DATOS DE LA BASE DE DATOS LOCAL
 * Para transferir a Railway
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Exportando todos los datos de la base de datos local...\n');

  const data: any = {};

  // 1. Tutores
  console.log('Exportando tutores...');
  data.tutores = await prisma.tutor.findMany();
  console.log(`✓ ${data.tutores.length} tutores`);

  // 2. Estudiantes
  console.log('Exportando estudiantes...');
  data.estudiantes = await prisma.estudiante.findMany();
  console.log(`✓ ${data.estudiantes.length} estudiantes`);

  // 3. Equipos
  console.log('Exportando equipos...');
  data.equipos = await prisma.equipo.findMany();
  console.log(`✓ ${data.equipos.length} equipos`);

  // 4. Docentes
  console.log('Exportando docentes...');
  data.docentes = await prisma.docente.findMany();
  console.log(`✓ ${data.docentes.length} docentes`);

  // 5. Admins
  console.log('Exportando admins...');
  data.admins = await prisma.admin.findMany();
  console.log(`✓ ${data.admins.length} admins`);

  // 6. Productos
  console.log('Exportando productos...');
  data.productos = await prisma.producto.findMany();
  console.log(`✓ ${data.productos.length} productos`);

  // 7. Grupos
  console.log('Exportando grupos...');
  data.grupos = await prisma.grupo.findMany();
  console.log(`✓ ${data.grupos.length} grupos`);

  // 8. ClaseGrupos
  console.log('Exportando clase_grupos...');
  data.claseGrupos = await prisma.claseGrupo.findMany();
  console.log(`✓ ${data.claseGrupos.length} clase_grupos`);

  // 9. Inscripciones ClaseGrupo
  console.log('Exportando inscripciones_clase_grupo...');
  data.inscripcionesClaseGrupo = await prisma.inscripcionClaseGrupo.findMany();
  console.log(`✓ ${data.inscripcionesClaseGrupo.length} inscripciones_clase_grupo`);

  // 10. Asistencias ClaseGrupo
  console.log('Exportando asistencias_clase_grupo...');
  data.asistenciasClaseGrupo = await prisma.asistenciaClaseGrupo.findMany();
  console.log(`✓ ${data.asistenciasClaseGrupo.length} asistencias_clase_grupo`);

  // 11. Configuración de Precios
  console.log('Exportando configuracion_precios...');
  data.configuracionPrecios = await prisma.configuracionPrecios.findMany();
  console.log(`✓ ${data.configuracionPrecios.length} configuracion_precios`);

  // 12. Inscripciones Mensuales
  console.log('Exportando inscripciones_mensuales...');
  data.inscripcionesMensuales = await prisma.inscripcionMensual.findMany();
  console.log(`✓ ${data.inscripcionesMensuales.length} inscripciones_mensuales`);

  // 13. Becas
  console.log('Exportando becas...');
  data.becas = await prisma.beca.findMany();
  console.log(`✓ ${data.becas.length} becas`);

  // 14. Sectores
  console.log('Exportando sectores...');
  data.sectores = await prisma.sector.findMany();
  console.log(`✓ ${data.sectores.length} sectores`);

  // 15. Estudiante Sectores
  console.log('Exportando estudiante_sectores...');
  data.estudianteSectores = await prisma.estudianteSector.findMany();
  console.log(`✓ ${data.estudianteSectores.length} estudiante_sectores`);

  // 16. Niveles Config
  console.log('Exportando niveles_config...');
  data.nivelesConfig = await prisma.nivelConfig.findMany();
  console.log(`✓ ${data.nivelesConfig.length} niveles_config`);

  // 17. Acciones Puntuables
  console.log('Exportando acciones_puntuables...');
  data.accionesPuntuables = await prisma.accionPuntuable.findMany();
  console.log(`✓ ${data.accionesPuntuables.length} acciones_puntuables`);

  // 18. Puntos Obtenidos
  console.log('Exportando puntos_obtenidos...');
  data.puntosObtenidos = await prisma.puntoObtenido.findMany();
  console.log(`✓ ${data.puntosObtenidos.length} puntos_obtenidos`);

  // 19. Logros Desbloqueados
  console.log('Exportando logros_desbloqueados...');
  data.logrosDesbloqueados = await prisma.logroDesbloqueado.findMany();
  console.log(`✓ ${data.logrosDesbloqueados.length} logros_desbloqueados`);

  // 20. Notificaciones
  console.log('Exportando notificaciones...');
  data.notificaciones = await prisma.notificacion.findMany();
  console.log(`✓ ${data.notificaciones.length} notificaciones`);

  // 21. Rutas Curriculares
  console.log('Exportando rutas_curriculares...');
  data.rutasCurriculares = await prisma.rutaCurricular.findMany();
  console.log(`✓ ${data.rutasCurriculares.length} rutas_curriculares`);

  // 22. Módulos
  console.log('Exportando modulos...');
  data.modulos = await prisma.modulo.findMany();
  console.log(`✓ ${data.modulos.length} modulos`);

  // 23. Lecciones
  console.log('Exportando lecciones...');
  data.lecciones = await prisma.leccion.findMany();
  console.log(`✓ ${data.lecciones.length} lecciones`);

  // 24. Progreso Lecciones
  console.log('Exportando progreso_lecciones...');
  data.progresoLecciones = await prisma.progresoLeccion.findMany();
  console.log(`✓ ${data.progresoLecciones.length} progreso_lecciones`);

  // Guardar en archivo JSON
  const filename = 'full-database-export.json';
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));

  console.log('\n========================================');
  console.log('✅ EXPORTACIÓN COMPLETA');
  console.log('========================================');
  console.log(`📁 Archivo: ${filename}`);
  console.log(`📊 Total de colecciones: ${Object.keys(data).length}`);

  const totalRecords = Object.values(data).reduce((sum: number, arr: any) => sum + arr.length, 0);
  console.log(`📝 Total de registros: ${totalRecords}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
