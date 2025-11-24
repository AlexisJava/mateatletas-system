-- Verificar datos antes de eliminar planificaciones
SELECT 'planificaciones_simples' as tabla, COUNT(*) as total FROM planificaciones_simples
UNION ALL
SELECT 'progreso_estudiante_planificacion', COUNT(*) FROM progreso_estudiante_planificacion
UNION ALL
SELECT 'asignacion_planificacion', COUNT(*) FROM asignacion_planificacion;

-- Ver detalle si hay datos
SELECT 'PLANIFICACIONES:' as info, codigo, titulo, grupo_codigo FROM planificaciones_simples LIMIT 5;
SELECT 'PROGRESOS:' as info, estudiante_id, planificacion_codigo, semana_actual FROM progreso_estudiante_planificacion LIMIT 5;
SELECT 'ASIGNACIONES:' as info, docente_id, clase_grupo_id, planificacion_codigo FROM asignacion_planificacion LIMIT 5;
