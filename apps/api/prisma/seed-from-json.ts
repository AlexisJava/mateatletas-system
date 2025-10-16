import { PrismaClient, TipoProducto, EstadoMembresia, EstadoInscripcionCurso, EstadoClase, EstadoAsistencia, TipoNotificacion, TipoEvento } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Script para cargar datos desde un archivo JSON
 * Lee el archivo test-data.json y carga todos los datos en orden
 */

interface TestData {
  admin?: any;
  docentes?: any[];
  tutores?: any[];
  equipos?: any[];
  rutasCurriculares?: string[];
  productos?: any[];
  estudiantes?: any[];
  membresias?: any[];
  inscripciones_cursos?: any[];
  clases?: any[];
  inscripciones_clases?: any[];
  asistencias?: any[];
  pagos?: any[];
  notificaciones?: any[];
  eventos?: any[];
}

// Mapas para IDs temporales -> IDs reales
const idMaps = {
  tutores: new Map<number, string>(),
  docentes: new Map<number, string>(),
  estudiantes: new Map<number, string>(),
  equipos: new Map<number, string>(),
  productos: new Map<number, string>(),
  clases: new Map<number, string>(),
  rutas: new Map<string, string>(),
};

async function loadFromJSON() {
  console.log('📥 CARGANDO DATOS DESDE JSON...\n');

  // Leer archivo JSON
  const jsonPath = path.join(__dirname, 'test-data.json');

  if (!fs.existsSync(jsonPath)) {
    console.error('❌ Error: No se encontró el archivo test-data.json');
    console.log('📄 Crea el archivo en: apps/api/prisma/test-data.json');
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data: TestData = JSON.parse(rawData);

  console.log('✅ Archivo JSON leído correctamente\n');

  try {
    // PASO 1: Equipos
    if (data.equipos && data.equipos.length > 0) {
      console.log(`🛡️  Creando ${data.equipos.length} equipos...`);
      for (const equipo of data.equipos) {
        const colores = {
          'rojo': { primario: '#FF6B35', secundario: '#F7B801' },
          'azul': { primario: '#2196F3', secundario: '#00BCD4' },
          'naranja': { primario: '#FF9800', secundario: '#FFC107' },
          'verde': { primario: '#4CAF50', secundario: '#8BC34A' },
        };

        const colorData = colores[equipo.color as keyof typeof colores] || { primario: '#000000', secundario: '#FFFFFF' };

        const equipoCreado = await prisma.equipo.create({
          data: {
            nombre: equipo.nombre,
            color_primario: colorData.primario,
            color_secundario: colorData.secundario,
          },
        });

        idMaps.equipos.set(equipo.id, equipoCreado.id);
        console.log(`   • ${equipo.nombre} → ${equipoCreado.id}`);
      }
    }

    // PASO 2: Rutas Curriculares
    if (data.rutasCurriculares && data.rutasCurriculares.length > 0) {
      console.log(`\n🧭 Creando ${data.rutasCurriculares.length} rutas curriculares...`);

      const coloresRutas = {
        'Álgebra': '#3B82F6',
        'Geometría': '#10B981',
        'Lógica': '#8B5CF6',
        'Trigonometría': '#F59E0B',
        'Cálculo': '#6366F1',
        'Estadística': '#EF4444',
      };

      for (const nombreRuta of data.rutasCurriculares) {
        const rutaCreada = await prisma.rutaCurricular.create({
          data: {
            nombre: nombreRuta,
            color: coloresRutas[nombreRuta as keyof typeof coloresRutas] || '#000000',
            descripcion: `Ruta curricular de ${nombreRuta}`,
          },
        });

        idMaps.rutas.set(nombreRuta, rutaCreada.id);
        console.log(`   • ${nombreRuta} → ${rutaCreada.id}`);
      }
    }

    // PASO 3: Productos
    if (data.productos && data.productos.length > 0) {
      console.log(`\n🛒 Creando ${data.productos.length} productos...`);
      for (const producto of data.productos) {
        const tipoMap = {
          'membresía': TipoProducto.Suscripcion,
          'curso': TipoProducto.Curso,
          'recurso': TipoProducto.RecursoDigital,
        };

        const productoData: any = {
          nombre: producto.nombre,
          descripcion: producto.nombre,
          precio: producto.precio,
          tipo: tipoMap[producto.tipo as keyof typeof tipoMap],
          activo: true,
        };

        // Si es suscripción, agregar duración
        if (producto.tipo === 'membresía') {
          productoData.duracion_meses = producto.nombre.includes('Anual') ? 12 : 1;
        }

        // Si es curso, agregar fechas y cupo
        if (producto.tipo === 'curso' && producto.fecha_inicio) {
          productoData.fecha_inicio = new Date(producto.fecha_inicio);
          productoData.fecha_fin = new Date(producto.fecha_fin);
          productoData.cupo_maximo = producto.cupo;
        }

        const productoCreado = await prisma.producto.create({
          data: productoData,
        });

        idMaps.productos.set(producto.id, productoCreado.id);
        console.log(`   • ${producto.nombre} → ${productoCreado.id}`);
      }
    }

    // PASO 4: Admin
    if (data.admin) {
      console.log(`\n👑 Creando administrador...`);
      const admin = data.admin;

      const passwordHash = await bcrypt.hash(admin.password, 10);

      await prisma.admin.create({
        data: {
          email: admin.email,
          password_hash: passwordHash,
          nombre: admin.nombre,
          apellido: admin.apellido,
        },
      });

      console.log(`   • ${admin.email}`);
    }

    // PASO 5: Docentes
    if (data.docentes && data.docentes.length > 0) {
      console.log(`\n👨‍🏫 Creando ${data.docentes.length} docentes...`);
      for (const docente of data.docentes) {
        const passwordHash = await bcrypt.hash(docente.password, 10);

        const docenteCreado = await prisma.docente.create({
          data: {
            email: docente.email,
            password_hash: passwordHash,
            nombre: docente.nombre.split(' ')[0],
            apellido: docente.nombre.split(' ').slice(1).join(' '),
            titulo: docente.titulo,
            bio: docente.bio,
          },
        });

        idMaps.docentes.set(docente.id, docenteCreado.id);
        console.log(`   • ${docente.email} → ${docenteCreado.id}`);
      }
    }

    // PASO 6: Tutores
    if (data.tutores && data.tutores.length > 0) {
      console.log(`\n👨‍👩‍👧 Creando ${data.tutores.length} tutores...`);
      for (const tutor of data.tutores) {
        const passwordHash = await bcrypt.hash(tutor.password, 10);

        const tutorCreado = await prisma.tutor.create({
          data: {
            email: tutor.email,
            password_hash: passwordHash,
            nombre: tutor.nombre.split(' ')[0],
            apellido: tutor.nombre.split(' ').slice(1).join(' '),
            dni: tutor.dni || null,
            telefono: tutor.telefono || null,
            ha_completado_onboarding: tutor.ha_completado_onboarding,
          },
        });

        idMaps.tutores.set(tutor.id, tutorCreado.id);
        console.log(`   • ${tutor.email} → ${tutorCreado.id}`);
      }
    }

    // PASO 7: Estudiantes
    if (data.estudiantes && data.estudiantes.length > 0) {
      console.log(`\n👦 Creando ${data.estudiantes.length} estudiantes...`);
      for (const estudiante of data.estudiantes) {
        const passwordHash = await bcrypt.hash(estudiante.password, 10);

        // Calcular fecha de nacimiento basada en edad
        const fechaNacimiento = new Date();
        fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - estudiante.edad);

        // Determinar nivel escolar
        let nivelEscolar = 'Primaria';
        if (estudiante.edad >= 13 && estudiante.edad <= 17) {
          nivelEscolar = 'Secundaria';
        } else if (estudiante.edad >= 18) {
          nivelEscolar = 'Universidad';
        }

        const estudianteCreado = await prisma.estudiante.create({
          data: {
            email: estudiante.email,
            password_hash: passwordHash,
            nombre: estudiante.nombre.split(' ')[0],
            apellido: estudiante.nombre.split(' ').slice(1).join(' '),
            fecha_nacimiento: fechaNacimiento,
            nivel_escolar: nivelEscolar,
            tutor_id: idMaps.tutores.get(estudiante.tutor_id)!,
            equipo_id: idMaps.equipos.get(estudiante.equipo_id) || null,
            puntos_totales: estudiante.puntos,
            nivel_actual: estudiante.nivel,
          },
        });

        idMaps.estudiantes.set(estudiante.id, estudianteCreado.id);
        console.log(`   • ${estudiante.nombre} → ${estudianteCreado.id}`);
      }
    }

    // PASO 8: Membresías
    if (data.membresias && data.membresias.length > 0) {
      console.log(`\n💰 Creando ${data.membresias.length} membresías...`);
      for (const membresia of data.membresias) {
        const estadoMap = {
          'activa': EstadoMembresia.Activa,
          'atrasada': EstadoMembresia.Atrasada,
          'pendiente': EstadoMembresia.Pendiente,
          'cancelada': EstadoMembresia.Cancelada,
        };

        await prisma.membresia.create({
          data: {
            tutor_id: idMaps.tutores.get(membresia.tutor_id)!,
            producto_id: idMaps.productos.get(membresia.producto_id)!,
            estado: estadoMap[membresia.estado as keyof typeof estadoMap],
            fecha_inicio: new Date(membresia.fecha_inicio),
            fecha_proximo_pago: new Date(membresia.proximo_pago),
            preferencia_id: membresia.preferencia_mp,
          },
        });

        console.log(`   • Tutor ${membresia.tutor_id} - ${membresia.estado}`);
      }
    }

    // PASO 9: Inscripciones a Cursos
    if (data.inscripciones_cursos && data.inscripciones_cursos.length > 0) {
      console.log(`\n🎓 Creando ${data.inscripciones_cursos.length} inscripciones a cursos...`);
      for (const inscripcion of data.inscripciones_cursos) {
        const estadoMap = {
          'activo': EstadoInscripcionCurso.Activo,
          'finalizado': EstadoInscripcionCurso.Finalizado,
          'preinscrito': EstadoInscripcionCurso.PreInscrito,
        };

        await prisma.inscripcionCurso.create({
          data: {
            estudiante_id: idMaps.estudiantes.get(inscripcion.estudiante_id)!,
            producto_id: idMaps.productos.get(inscripcion.curso_id)!,
            estado: estadoMap[inscripcion.estado as keyof typeof estadoMap],
            fecha_inscripcion: new Date(inscripcion.fecha_inscripcion),
          },
        });

        console.log(`   • Estudiante ${inscripcion.estudiante_id} → Curso ${inscripcion.curso_id}`);
      }
    }

    // PASO 10: Clases
    if (data.clases && data.clases.length > 0) {
      console.log(`\n📅 Creando ${data.clases.length} clases...`);
      for (const clase of data.clases) {
        // Extraer ruta del título (primera palabra)
        const rutaNombre = clase.titulo.split(' ')[0];
        const rutaId = idMaps.rutas.get(rutaNombre) || idMaps.rutas.get('Álgebra')!;

        // Crear fecha y hora (10:00 AM por defecto)
        const fechaClase = new Date(clase.fecha);
        fechaClase.setHours(10, 0, 0, 0);

        const claseCreada = await prisma.clase.create({
          data: {
            ruta_curricular_id: rutaId,
            docente_id: idMaps.docentes.get(clase.docente_id)!,
            fecha_hora_inicio: fechaClase,
            duracion_minutos: 60,
            estado: EstadoClase.Programada,
            cupos_maximo: 10,
            cupos_ocupados: clase.estudiantes.length,
          },
        });

        idMaps.clases.set(clase.id, claseCreada.id);
        console.log(`   • ${clase.titulo} (${clase.fecha}) → ${claseCreada.id}`);
      }
    }

    // PASO 11: Inscripciones a Clases
    if (data.inscripciones_clases && data.inscripciones_clases.length > 0) {
      console.log(`\n🎫 Creando ${data.inscripciones_clases.length} inscripciones a clases...`);
      for (const inscripcion of data.inscripciones_clases) {
        const estudianteId = idMaps.estudiantes.get(inscripcion.estudiante_id)!;
        const claseId = idMaps.clases.get(inscripcion.clase_id)!;

        // Buscar el tutor del estudiante
        const estudiante = await prisma.estudiante.findUnique({
          where: { id: estudianteId },
        });

        await prisma.inscripcionClase.create({
          data: {
            estudiante_id: estudianteId,
            clase_id: claseId,
            tutor_id: estudiante!.tutor_id,
            fecha_inscripcion: new Date(),
          },
        });

        console.log(`   • Estudiante ${inscripcion.estudiante_id} → Clase ${inscripcion.clase_id}`);
      }
    }

    // PASO 12: Asistencias
    if (data.asistencias && data.asistencias.length > 0) {
      console.log(`\n📝 Creando ${data.asistencias.length} registros de asistencia...`);
      for (const asistencia of data.asistencias) {
        const estadoMap = {
          'Presente': EstadoAsistencia.Presente,
          'Ausente': EstadoAsistencia.Ausente,
          'Justificado': EstadoAsistencia.Justificado,
        };

        await prisma.asistencia.create({
          data: {
            estudiante_id: idMaps.estudiantes.get(asistencia.estudiante_id)!,
            clase_id: idMaps.clases.get(asistencia.clase_id)!,
            estado: estadoMap[asistencia.estado as keyof typeof estadoMap],
            observaciones: asistencia.comentario,
            puntos_otorgados: asistencia.puntos,
            fecha_registro: new Date(),
          },
        });

        console.log(`   • Clase ${asistencia.clase_id} - Estudiante ${asistencia.estudiante_id} - ${asistencia.estado}`);
      }
    }

    // PASO 13: Pagos (OMITIDO - El modelo Pago no existe aún en el schema)
    if (data.pagos && data.pagos.length > 0) {
      console.log(`\n💳 Omitiendo ${data.pagos.length} pagos (modelo Pago no implementado)...`);
    }

    // PASO 14: Notificaciones
    if (data.notificaciones && data.notificaciones.length > 0) {
      console.log(`\n🔔 Creando ${data.notificaciones.length} notificaciones...`);
      for (const notif of data.notificaciones) {
        const docenteId = idMaps.docentes.get(notif.docente_id);
        if (!docenteId) {
          console.log(`   ⚠️  Advertencia: Docente ${notif.docente_id} no encontrado, omitiendo notificación`);
          continue;
        }

        await prisma.notificacion.create({
          data: {
            tipo: notif.tipo as TipoNotificacion,
            titulo: notif.titulo,
            mensaje: notif.mensaje,
            leida: notif.leida || false,
            docente_id: docenteId,
            metadata: notif.metadata || {},
          },
        });
        console.log(`   • ${notif.tipo}: ${notif.titulo}`);
      }
    }

    // PASO 15: Eventos
    if (data.eventos && data.eventos.length > 0) {
      console.log(`\n📅 Creando ${data.eventos.length} eventos...`);
      for (const evento of data.eventos) {
        const docenteId = idMaps.docentes.get(evento.docente_id);
        if (!docenteId) {
          console.log(`   ⚠️  Advertencia: Docente ${evento.docente_id} no encontrado, omitiendo evento`);
          continue;
        }

        await prisma.evento.create({
          data: {
            titulo: evento.titulo,
            descripcion: evento.descripcion,
            fecha_inicio: new Date(evento.fecha_inicio),
            fecha_fin: evento.fecha_fin ? new Date(evento.fecha_fin) : null,
            todo_el_dia: evento.todo_el_dia || false,
            tipo: evento.tipo as TipoEvento,
            color: evento.color || '#6366F1',
            recordatorio: evento.recordatorio || false,
            minutos_antes: evento.minutos_antes,
            docente_id: docenteId,
          },
        });
        console.log(`   • ${evento.tipo}: ${evento.titulo}`);
      }
    }

    console.log('\n✅ DATOS CARGADOS EXITOSAMENTE!');
    console.log('🎉 Base de datos de prueba lista para usar\n');

    // Mostrar resumen
    console.log('📊 RESUMEN:');
    console.log(`   • ${idMaps.tutores.size} tutores`);
    console.log(`   • ${idMaps.docentes.size} docentes`);
    console.log(`   • ${idMaps.estudiantes.size} estudiantes`);
    console.log(`   • ${idMaps.equipos.size} equipos`);
    console.log(`   • ${idMaps.productos.size} productos`);
    console.log(`   • ${idMaps.clases.size} clases`);
    console.log(`   • ${data.membresias?.length || 0} membresías`);
    console.log(`   • ${data.inscripciones_clases?.length || 0} inscripciones a clases`);
    console.log(`   • ${data.asistencias?.length || 0} asistencias`);
    console.log(`   • ${data.notificaciones?.length || 0} notificaciones`);
    console.log(`   • ${data.eventos?.length || 0} eventos\n`);

  } catch (error) {
    console.error('\n❌ Error cargando datos:', error);
    throw error;
  }
}

// Ejecutar
loadFromJSON()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
