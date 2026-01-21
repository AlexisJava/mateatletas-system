import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanForTesting() {
    console.log('🧹 Limpiando base de datos para testing...\n');

    const tablesToClean = [
        'cambios_inscripcion',
        'inscripciones_actividad',
        'suscripciones_familiares',
        'pagos_curso',
        'pagos_suscripcion',
        'historial_estado_suscripcion',
        'suscripciones',
        'seguimientos_observacion',
        'observaciones_estudiantes',
        'observaciones_docente',
        'progresos_tarea_estudiante',
        'progresos_clase_estudiante',
        'tareas_asignadas',
        'estados_clase_grupo',
        'asignaciones_planificacion',
        'tareas_clase',
        'clases_planificacion',
        'planificaciones',
        'inscripciones_comision',
        'asistencia_comision',
        'comisiones',
        'asistencias_live',
        'asistencias_clase_grupo',
        'inscripciones_clase_grupo',
        'clase_grupos',
        'inscripciones_mensuales',
        'recursos_estudiante',
        'rachas_estudiantes',
        'logros_estudiantes_gamificacion',
        'actividad_feed',
        'reacciones_feed',
        'historial_acceso_estudiante',
        'puntos_obtenidos',
        'alertas',
        'asistencias',
        'inscripciones_clase',
        'clases',
        'notificaciones',
        'colonia_pagos',
        'colonia_estudiante_cursos',
        'colonia_estudiantes',
        'colonia_inscripciones',
        'docentes_casas',
        'docentes_mundos',
        'docentes_rutas',
        'estudiantes',
        'tutores',
        'docentes',
        'productos',
    ];

    for (const table of tablesToClean) {
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
            console.log(`   ✓ ${table}`);
        } catch {
            // Ignorar si no existe
        }
    }

    console.log('\n✅ Limpieza completada\n');

    const admins = await prisma.admin.count();
    const casas = await prisma.casa.count();
    console.log(`   Admins preservados: ${admins}`);
    console.log(`   Casas preservadas: ${casas}`);
}

cleanForTesting()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
