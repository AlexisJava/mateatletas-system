-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('Suscripcion', 'Curso', 'RecursoDigital');

-- CreateEnum
CREATE TYPE "casa_tipo" AS ENUM ('QUANTUM', 'VERTEX', 'PULSAR');

-- CreateEnum
CREATE TYPE "mundo_tipo" AS ENUM ('MATEMATICA', 'PROGRAMACION', 'CIENCIAS');

-- CreateEnum
CREATE TYPE "nivel_interno" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO', 'OLIMPICO');

-- CreateEnum
CREATE TYPE "onboarding_estado" AS ENUM ('PENDIENTE', 'SELECCION_MUNDOS', 'TEST_UBICACION', 'CONFIRMACION_CASA', 'CREACION_AVATAR', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "tier_nombre" AS ENUM ('ARCADE', 'ARCADE_PLUS', 'PRO');

-- CreateEnum
CREATE TYPE "EstadoMembresia" AS ENUM ('Pendiente', 'Activa', 'Atrasada', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoInscripcionCurso" AS ENUM ('PreInscrito', 'Activo', 'Finalizado');

-- CreateEnum
CREATE TYPE "EstadoClase" AS ENUM ('Programada', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('Presente', 'Ausente', 'Justificado');

-- CreateEnum
CREATE TYPE "TipoContenido" AS ENUM ('Video', 'Texto', 'Quiz', 'Tarea', 'JuegoInteractivo', 'Lectura', 'Practica');

-- CreateEnum
CREATE TYPE "tipo_notificacion" AS ENUM ('ClaseProxima', 'AsistenciaPendiente', 'EstudianteAlerta', 'ClaseCancelada', 'LogroEstudiante', 'Recordatorio', 'General');

-- CreateEnum
CREATE TYPE "tipo_evento" AS ENUM ('CLASE', 'TAREA', 'RECORDATORIO', 'NOTA');

-- CreateEnum
CREATE TYPE "estado_tarea" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "prioridad_tarea" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "tipo_descuento" AS ENUM ('NINGUNO', 'MULTIPLE_ACTIVIDADES', 'HERMANOS_BASICO', 'HERMANOS_MULTIPLE', 'AACREA', 'BECA');

-- CreateEnum
CREATE TYPE "estado_pago" AS ENUM ('Pendiente', 'Pagado', 'Vencido', 'Parcial', 'Becado');

-- CreateEnum
CREATE TYPE "descuento_beca_tipo" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- CreateEnum
CREATE TYPE "tipo_clase_grupo" AS ENUM ('GRUPO_REGULAR', 'CURSO_TEMPORAL');

-- CreateEnum
CREATE TYPE "dia_semana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateEnum
CREATE TYPE "estado_planificacion" AS ENUM ('BORRADOR', 'PUBLICADA', 'ARCHIVADA');

-- CreateEnum
CREATE TYPE "nivel_dificultad" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO', 'OLIMPICO');

-- CreateEnum
CREATE TYPE "estado_asignacion" AS ENUM ('ACTIVA', 'PAUSADA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_recurso" AS ENUM ('XP', 'MONEDAS');

-- CreateEnum
CREATE TYPE "tipo_item" AS ENUM ('AVATAR', 'SKIN', 'ACCESORIO', 'POWERUP', 'COSMETICO', 'TITULO', 'EMOJI', 'FONDO', 'MARCO');

-- CreateEnum
CREATE TYPE "rareza_item" AS ENUM ('COMUN', 'RARO', 'EPICO', 'LEGENDARIO');

-- CreateEnum
CREATE TYPE "categoria_studio" AS ENUM ('EXPERIENCIA', 'CURRICULAR');

-- CreateEnum
CREATE TYPE "tipo_experiencia_studio" AS ENUM ('NARRATIVO', 'EXPEDICION', 'LABORATORIO', 'SIMULACION', 'PROYECTO', 'DESAFIO');

-- CreateEnum
CREATE TYPE "materia_studio" AS ENUM ('MATEMATICA_ESCOLAR', 'FISICA', 'QUIMICA', 'PROGRAMACION');

-- CreateEnum
CREATE TYPE "estado_curso_studio" AS ENUM ('DRAFT', 'EN_PROGRESO', 'EN_REVISION', 'PUBLICADO');

-- CreateEnum
CREATE TYPE "estado_semana_studio" AS ENUM ('VACIA', 'COMPLETA');

-- CreateEnum
CREATE TYPE "tipo_recurso_studio" AS ENUM ('IMAGEN', 'AUDIO', 'VIDEO', 'DOCUMENTO');

-- CreateEnum
CREATE TYPE "categoria_componente" AS ENUM ('INTERACTIVO', 'CONTENIDO', 'EDITOR_CODIGO', 'MULTIMEDIA', 'GAMIFICACION', 'EVALUACION');

-- CreateTable
CREATE TABLE "tutores" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "password_temporal" TEXT,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
    "debe_completar_perfil" BOOLEAN NOT NULL DEFAULT false,
    "fecha_ultimo_cambio" TIMESTAMP(3),
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT,
    "cuil" TEXT,
    "telefono" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ha_completado_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roles" JSONB NOT NULL DEFAULT '["tutor"]',

    CONSTRAINT "tutores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "nivel_escolar" TEXT NOT NULL,
    "avatar_url" TEXT,
    "animacion_idle_url" TEXT,
    "foto_url" TEXT,
    "tutor_id" TEXT NOT NULL,
    "casa_id" TEXT,
    "puntos_totales" INTEGER NOT NULL DEFAULT 0,
    "nivel_actual" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatar_gradient" INTEGER NOT NULL DEFAULT 0,
    "edad" INTEGER NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "password_temporal" TEXT,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
    "fecha_ultimo_cambio" TIMESTAMP(3),
    "roles" JSONB NOT NULL DEFAULT '["estudiante"]',
    "sector_id" TEXT,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiante_sectores" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "sector_id" TEXT NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiante_sectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casas" (
    "id" TEXT NOT NULL,
    "tipo" "casa_tipo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "slogan" TEXT,
    "edad_minima" INTEGER NOT NULL,
    "edad_maxima" INTEGER NOT NULL,
    "color_primary" TEXT NOT NULL,
    "color_secondary" TEXT NOT NULL,
    "color_accent" TEXT NOT NULL,
    "color_dark" TEXT NOT NULL,
    "gradiente" TEXT NOT NULL,
    "puntos_totales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mundos" (
    "id" TEXT NOT NULL,
    "tipo" "mundo_tipo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT NOT NULL,
    "color_primary" TEXT NOT NULL,
    "color_secondary" TEXT NOT NULL,
    "color_accent" TEXT NOT NULL,
    "gradiente" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mundos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiers" (
    "id" TEXT NOT NULL,
    "nombre" "tier_nombre" NOT NULL,
    "precio_mensual" INTEGER NOT NULL,
    "mundos_async" INTEGER NOT NULL,
    "mundos_sync" INTEGER NOT NULL,
    "tiene_docente" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambios_tier_pendientes" (
    "id" TEXT NOT NULL,
    "estudiante_inscripcion_id" TEXT NOT NULL,
    "tier_actual_id" TEXT NOT NULL,
    "tier_nuevo_id" TEXT NOT NULL,
    "tipo_cambio" TEXT NOT NULL,
    "fecha_efectiva" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "aplicacion_inmediata" BOOLEAN NOT NULL DEFAULT false,
    "aplicado_en" TIMESTAMP(3),
    "cancelado_en" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cambios_tier_pendientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiante_mundo_niveles" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "mundo_id" TEXT NOT NULL,
    "nivel_interno" "nivel_interno" NOT NULL DEFAULT 'BASICO',
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiante_mundo_niveles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_ubicacion_resultados" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "mundo_id" TEXT NOT NULL,
    "preguntas_total" INTEGER NOT NULL,
    "respuestas_correctas" INTEGER NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "nivel_asignado" "nivel_interno" NOT NULL,
    "casa_original_id" TEXT,
    "casa_asignada_id" TEXT,
    "bajo_de_casa" BOOLEAN NOT NULL DEFAULT false,
    "fecha_completado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_ubicacion_resultados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_temporal" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "titulo" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disponibilidad_horaria" JSONB,
    "especialidades" JSONB,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "experiencia_anos" INTEGER,
    "nivel_educativo" JSONB,
    "roles" JSONB NOT NULL DEFAULT '["docente"]',
    "telefono" TEXT,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
    "fecha_ultimo_cambio" TIMESTAMP(3),

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_temporal" TEXT,
    "debe_cambiar_password" BOOLEAN NOT NULL DEFAULT true,
    "fecha_ultimo_cambio" TIMESTAMP(3),
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dni" TEXT,
    "roles" JSONB NOT NULL DEFAULT '["admin"]',
    "telefono" TEXT,
    "mfa_secret" TEXT,
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "cupo_maximo" INTEGER,
    "duracion_meses" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'Pendiente',
    "fecha_inicio" TIMESTAMP(3),
    "fecha_proximo_pago" TIMESTAMP(3),
    "preferencia_id" TEXT,
    "mercadopago_payment_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_curso" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "estado" "EstadoInscripcionCurso" NOT NULL DEFAULT 'PreInscrito',
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferencia_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutas_curriculares" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rutas_curriculares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clases" (
    "id" TEXT NOT NULL,
    "ruta_curricular_id" TEXT,
    "docente_id" TEXT NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "estado" "EstadoClase" NOT NULL DEFAULT 'Programada',
    "cupos_maximo" INTEGER NOT NULL,
    "cupos_ocupados" INTEGER NOT NULL DEFAULT 0,
    "producto_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "nombre" TEXT NOT NULL,
    "sector_id" TEXT,

    CONSTRAINT "clases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "edad_minima" INTEGER,
    "edad_maxima" INTEGER,
    "sector_id" TEXT,
    "link_meet" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clase_grupos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "tipo_clase_grupo" NOT NULL DEFAULT 'GRUPO_REGULAR',
    "dia_semana" "dia_semana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "anio_lectivo" INTEGER NOT NULL,
    "cupo_maximo" INTEGER NOT NULL DEFAULT 15,
    "grupo_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "ruta_curricular_id" TEXT,
    "sector_id" TEXT,
    "nivel" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clase_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_clase_grupo" (
    "id" TEXT NOT NULL,
    "clase_grupo_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_clase_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias_clase_grupo" (
    "id" TEXT NOT NULL,
    "clase_grupo_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observaciones" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_clase_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_clase" (
    "id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_clase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observaciones" TEXT,
    "puntos_otorgados" INTEGER NOT NULL DEFAULT 0,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "clase_id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acciones_puntuables" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acciones_puntuables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_obtenidos" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "accion_id" TEXT NOT NULL,
    "clase_id" TEXT,
    "puntos" INTEGER NOT NULL,
    "contexto" TEXT,
    "fecha_otorgado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_obtenidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulos" (
    "id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "duracion_estimada_minutos" INTEGER NOT NULL DEFAULT 0,
    "puntos_totales" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecciones" (
    "id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_contenido" "TipoContenido" NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "puntos_por_completar" INTEGER NOT NULL DEFAULT 10,
    "duracion_estimada_minutos" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "recursos_adicionales" TEXT,
    "leccion_prerequisito_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_lecciones" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "leccion_id" TEXT NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_completada" TIMESTAMP(3),
    "tiempo_invertido_minutos" INTEGER,
    "calificacion" INTEGER,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "notas_estudiante" TEXT,
    "ultima_respuesta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progreso_lecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "tipo" "tipo_notificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "docente_id" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "tipo_evento" NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "es_todo_el_dia" BOOLEAN NOT NULL DEFAULT false,
    "docente_id" TEXT NOT NULL,
    "clase_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "estado" "estado_tarea" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "prioridad_tarea" NOT NULL DEFAULT 'MEDIA',
    "porcentaje_completado" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "etiquetas" TEXT[],
    "subtareas" JSONB NOT NULL DEFAULT '[]',
    "archivos" JSONB NOT NULL DEFAULT '[]',
    "clase_relacionada_id" TEXT,
    "estudiante_relacionado_id" TEXT,
    "tiempo_estimado_minutos" INTEGER,
    "tiempo_real_minutos" INTEGER,
    "recurrencia" JSONB,
    "recordatorios" JSONB NOT NULL DEFAULT '[]',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#6366f1',

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" TEXT,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveles_config" (
    "nivel" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puntos_minimos" INTEGER NOT NULL,
    "puntos_maximos" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "icono" TEXT NOT NULL DEFAULT '🌟',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "niveles_config_pkey" PRIMARY KEY ("nivel")
);

-- CreateTable
CREATE TABLE "sectores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "icono" TEXT NOT NULL DEFAULT '📚',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutas_especialidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "sectorId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rutas_especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docentes_rutas" (
    "id" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "rutaId" TEXT NOT NULL,
    "sectorId" TEXT NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docentes_rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_precios" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "precio_club_matematicas" DECIMAL(10,2) NOT NULL DEFAULT 50000,
    "precio_cursos_especializados" DECIMAL(10,2) NOT NULL DEFAULT 55000,
    "precio_multiple_actividades" DECIMAL(10,2) NOT NULL DEFAULT 44000,
    "precio_hermanos_basico" DECIMAL(10,2) NOT NULL DEFAULT 44000,
    "precio_hermanos_multiple" DECIMAL(10,2) NOT NULL DEFAULT 38000,
    "descuento_aacrea_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "descuento_aacrea_activo" BOOLEAN NOT NULL DEFAULT true,
    "dia_vencimiento" INTEGER NOT NULL DEFAULT 15,
    "dias_antes_recordatorio" INTEGER NOT NULL DEFAULT 5,
    "notificaciones_activas" BOOLEAN NOT NULL DEFAULT true,
    "actualizado_por_admin_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_cambio_precios" (
    "id" TEXT NOT NULL,
    "configuracion_id" TEXT NOT NULL,
    "valores_anteriores" JSONB NOT NULL,
    "valores_nuevos" JSONB NOT NULL,
    "motivo_cambio" TEXT,
    "admin_id" TEXT NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_cambio_precios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_mensuales" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "descuento_aplicado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_final" DECIMAL(10,2) NOT NULL,
    "tipo_descuento" "tipo_descuento" NOT NULL,
    "detalle_calculo" TEXT NOT NULL,
    "estado_pago" "estado_pago" NOT NULL DEFAULT 'Pendiente',
    "fecha_vencimiento" TIMESTAMP(3),
    "fecha_pago" TIMESTAMP(3),
    "metodo_pago" TEXT,
    "comprobante_url" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "becas" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tipo_beca" TEXT NOT NULL,
    "descuento_tipo" "descuento_beca_tipo" NOT NULL,
    "descuento_valor" DECIMAL(10,2) NOT NULL,
    "productos_aplica" JSONB NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "motivo_beca" TEXT,
    "aprobada_por_admin_id" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "becas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planificaciones_mensuales" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tematica_principal" TEXT NOT NULL,
    "objetivos_aprendizaje" TEXT[],
    "estado" "estado_planificacion" NOT NULL DEFAULT 'BORRADOR',
    "fecha_publicacion" TIMESTAMP(3),
    "notas_docentes" TEXT,
    "created_by_admin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planificaciones_mensuales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades_semanales" (
    "id" TEXT NOT NULL,
    "planificacion_id" TEXT NOT NULL,
    "semana_numero" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "componente_nombre" TEXT NOT NULL,
    "componente_props" JSONB NOT NULL,
    "nivel_dificultad" "nivel_dificultad" NOT NULL,
    "tiempo_estimado_minutos" INTEGER NOT NULL,
    "puntos_gamificacion" INTEGER NOT NULL,
    "instrucciones_docente" TEXT NOT NULL,
    "instrucciones_estudiante" TEXT NOT NULL,
    "recursos_url" JSONB,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_semanales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_docente" (
    "id" TEXT NOT NULL,
    "planificacion_id" TEXT NOT NULL,
    "clase_grupo_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensaje_docente" TEXT,
    "fecha_inicio_custom" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_actividad_estudiante" (
    "id" TEXT NOT NULL,
    "asignacion_docente_id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "clase_grupo_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado" "estado_asignacion" NOT NULL DEFAULT 'ACTIVA',
    "mensaje_semana" TEXT,
    "notificado_estudiantes" BOOLEAN NOT NULL DEFAULT false,
    "fecha_notificacion_estudiantes" TIMESTAMP(3),
    "notificado_tutores" BOOLEAN NOT NULL DEFAULT false,
    "fecha_notificacion_tutores" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_actividad_estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_estudiante_actividad" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "asignacion_id" TEXT NOT NULL,
    "iniciado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_inicio" TIMESTAMP(3),
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_completado" TIMESTAMP(3),
    "puntos_obtenidos" INTEGER NOT NULL DEFAULT 0,
    "tiempo_total_minutos" INTEGER NOT NULL DEFAULT 0,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "mejor_puntaje" INTEGER NOT NULL DEFAULT 0,
    "estado_juego" JSONB,
    "respuestas_detalle" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progreso_estudiante_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos_estudiante" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "monedas_total" INTEGER NOT NULL DEFAULT 0,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recursos_estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones_recurso" (
    "id" TEXT NOT NULL,
    "recursos_estudiante_id" TEXT NOT NULL,
    "tipo_recurso" "tipo_recurso" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "razon" TEXT NOT NULL,
    "metadata" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_recurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_item" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_tienda" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria_id" TEXT NOT NULL,
    "tipo_item" "tipo_item" NOT NULL,
    "precio_monedas" INTEGER NOT NULL DEFAULT 0,
    "precio_gemas" INTEGER NOT NULL DEFAULT 0,
    "imagen_url" TEXT,
    "rareza" "rareza_item" NOT NULL DEFAULT 'COMUN',
    "edicion_limitada" BOOLEAN NOT NULL DEFAULT false,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "nivel_minimo_requerido" INTEGER NOT NULL DEFAULT 1,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "veces_comprado" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_tienda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_obtenidos" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "fecha_obtencion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipado" BOOLEAN NOT NULL DEFAULT false,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_obtenidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_item" (
    "id" TEXT NOT NULL,
    "recursos_estudiante_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "monedas_gastadas" INTEGER NOT NULL DEFAULT 0,
    "gemas_gastadas" INTEGER NOT NULL DEFAULT 0,
    "fecha_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compras_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logros_gamificacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "monedas_recompensa" INTEGER NOT NULL,
    "xp_recompensa" INTEGER NOT NULL,
    "criterio_tipo" TEXT NOT NULL,
    "criterio_valor" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "rareza" TEXT NOT NULL,
    "secreto" BOOLEAN NOT NULL DEFAULT false,
    "animacion" TEXT,
    "titulo" TEXT,
    "badge" TEXT,
    "mensaje_desbloqueo" TEXT,
    "extras" JSONB,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logros_gamificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logros_estudiantes_gamificacion" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "logro_id" TEXT NOT NULL,
    "fecha_desbloqueo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visto" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "logros_estudiantes_gamificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rachas_estudiantes" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "racha_actual" INTEGER NOT NULL DEFAULT 0,
    "racha_maxima" INTEGER NOT NULL DEFAULT 0,
    "ultima_actividad" TIMESTAMP(3),
    "inicio_racha_actual" TIMESTAMP(3),
    "total_dias_activos" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rachas_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos_catalogo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "duracion_clases" INTEGER NOT NULL,
    "nivel_requerido" INTEGER NOT NULL DEFAULT 1,
    "contenido" JSONB,
    "precio_usd" DECIMAL(10,2) NOT NULL,
    "precio_monedas" INTEGER NOT NULL,
    "imagen_url" TEXT,
    "video_preview_url" TEXT,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "nuevo" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "total_canjes" INTEGER NOT NULL DEFAULT 0,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_canje" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "monedas_usadas" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_decision" TIMESTAMP(3),
    "opcion_pago" TEXT,
    "monto_padre" DECIMAL(10,2),
    "mensaje_padre" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3),

    CONSTRAINT "solicitudes_canje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos_estudiantes" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_completado" TIMESTAMP(3),

    CONSTRAINT "cursos_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_padres" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "puntos_total" INTEGER NOT NULL DEFAULT 0,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "pagos_puntuales_consecutivos" INTEGER NOT NULL DEFAULT 0,
    "total_referidos_activos" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_padres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones_puntos_padres" (
    "id" TEXT NOT NULL,
    "puntos_padre_id" TEXT NOT NULL,
    "tipo_recurso" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "razon" TEXT NOT NULL,
    "metadata" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_puntos_padres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premios_padres" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "puntos_requeridos" INTEGER NOT NULL,
    "costo_real_usd" DECIMAL(10,2),
    "icono" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premios_padres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canjes_padres" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "premio_id" TEXT NOT NULL,
    "puntos_padre_id" TEXT NOT NULL,
    "puntos_usados" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'completado',
    "fecha_canje" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canjes_padres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_inscripciones" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'active',
    "descuento_aplicado" INTEGER NOT NULL,
    "total_mensual" INTEGER NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_estudiantes" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "pin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_estudiante_cursos" (
    "id" TEXT NOT NULL,
    "colonia_estudiante_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "course_area" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "time_slot" TEXT NOT NULL,
    "precio_base" INTEGER NOT NULL,
    "precio_con_descuento" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_estudiante_cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_pagos" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "mercadopago_preference_id" TEXT,
    "mercadopago_payment_id" TEXT,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones_2026" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "tipo_inscripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "inscripcion_pagada" INTEGER NOT NULL,
    "descuento_aplicado" INTEGER NOT NULL DEFAULT 0,
    "total_mensual_actual" INTEGER NOT NULL,
    "origen_inscripcion" TEXT,
    "ciudad" TEXT,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiantes_inscripciones_2026" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "dni" TEXT,
    "pin" TEXT NOT NULL,
    "tier_id" TEXT,
    "onboarding_estado" "onboarding_estado" NOT NULL DEFAULT 'PENDIENTE',
    "onboarding_completado_at" TIMESTAMP(3),
    "avatar_config" JSONB,
    "mundos_seleccionados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estudiantes_inscripciones_2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colonia_cursos_seleccionados_2026" (
    "id" TEXT NOT NULL,
    "estudiante_inscripcion_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "course_area" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "time_slot" TEXT NOT NULL,
    "precio_base" INTEGER NOT NULL,
    "precio_con_descuento" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colonia_cursos_seleccionados_2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciclo_mundos_seleccionados_2026" (
    "id" TEXT NOT NULL,
    "estudiante_inscripcion_id" TEXT NOT NULL,
    "mundo" "mundo_tipo" NOT NULL,
    "dia_semana" TEXT,
    "horario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ciclo_mundos_seleccionados_2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_inscripciones_2026" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mes" TEXT,
    "anio" INTEGER,
    "monto" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "mercadopago_preference_id" TEXT,
    "mercadopago_payment_id" TEXT,
    "fecha_vencimiento" TIMESTAMP(3),
    "fecha_pago" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_inscripciones_2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estado_inscripciones_2026" (
    "id" TEXT NOT NULL,
    "inscripcion_id" TEXT NOT NULL,
    "estado_anterior" TEXT NOT NULL,
    "estado_nuevo" TEXT NOT NULL,
    "razon" TEXT NOT NULL,
    "realizado_por" TEXT NOT NULL DEFAULT 'system',
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estado_inscripciones_2026_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks_processed" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "webhook_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "external_reference" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_processed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "user_type" TEXT,
    "user_email" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "description" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "category" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret_rotations" (
    "id" TEXT NOT NULL,
    "secret_type" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "secret_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "rotated_at" TIMESTAMP(3),
    "rotated_by" TEXT,
    "metadata" JSONB,

    CONSTRAINT "secret_rotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos_studio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "categoria_studio" NOT NULL,
    "mundo" "mundo_tipo" NOT NULL,
    "casa" "casa_tipo" NOT NULL,
    "tier_minimo" "tier_nombre" NOT NULL,
    "tipo_experiencia" "tipo_experiencia_studio",
    "materia" "materia_studio",
    "estetica_base" TEXT NOT NULL,
    "estetica_variante" TEXT,
    "cantidad_semanas" INTEGER NOT NULL,
    "actividades_por_semana" INTEGER NOT NULL,
    "estado" "estado_curso_studio" NOT NULL DEFAULT 'DRAFT',
    "landing_mundo" BOOLEAN NOT NULL DEFAULT false,
    "landing_home" BOOLEAN NOT NULL DEFAULT false,
    "catalogo_interno" BOOLEAN NOT NULL DEFAULT false,
    "notificar_upgrade" BOOLEAN NOT NULL DEFAULT false,
    "fecha_venta" TIMESTAMP(3),
    "fecha_disponible" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursos_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semanas_studio" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT,
    "descripcion" TEXT,
    "contenido" JSONB,
    "estado" "estado_semana_studio" NOT NULL DEFAULT 'VACIA',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semanas_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos_studio" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT NOT NULL,
    "tipo" "tipo_recurso_studio" NOT NULL,
    "nombre" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "tamanio_bytes" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recursos_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges_custom_studio" (
    "id" TEXT NOT NULL,
    "curso_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "en_biblioteca" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_custom_studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "componentes_catalogo" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "categoria_componente" NOT NULL,
    "icono" TEXT NOT NULL,
    "configSchema" JSONB NOT NULL,
    "ejemploConfig" JSONB NOT NULL,
    "propiedades" JSONB,
    "implementado" BOOLEAN NOT NULL DEFAULT false,
    "habilitado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "componentes_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutores_username_key" ON "tutores"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tutores_email_key" ON "tutores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_username_key" ON "estudiantes"("username");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_email_key" ON "estudiantes"("email");

-- CreateIndex
CREATE INDEX "estudiante_sectores_estudiante_id_idx" ON "estudiante_sectores"("estudiante_id");

-- CreateIndex
CREATE INDEX "estudiante_sectores_sector_id_idx" ON "estudiante_sectores"("sector_id");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_sectores_estudiante_id_sector_id_key" ON "estudiante_sectores"("estudiante_id", "sector_id");

-- CreateIndex
CREATE UNIQUE INDEX "casas_tipo_key" ON "casas"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "casas_nombre_key" ON "casas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "mundos_tipo_key" ON "mundos"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "mundos_nombre_key" ON "mundos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tiers_nombre_key" ON "tiers"("nombre");

-- CreateIndex
CREATE INDEX "cambios_tier_pendientes_estudiante_inscripcion_id_idx" ON "cambios_tier_pendientes"("estudiante_inscripcion_id");

-- CreateIndex
CREATE INDEX "cambios_tier_pendientes_estado_idx" ON "cambios_tier_pendientes"("estado");

-- CreateIndex
CREATE INDEX "cambios_tier_pendientes_fecha_efectiva_idx" ON "cambios_tier_pendientes"("fecha_efectiva");

-- CreateIndex
CREATE INDEX "estudiante_mundo_niveles_estudiante_id_idx" ON "estudiante_mundo_niveles"("estudiante_id");

-- CreateIndex
CREATE INDEX "estudiante_mundo_niveles_mundo_id_idx" ON "estudiante_mundo_niveles"("mundo_id");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_mundo_niveles_estudiante_id_mundo_id_key" ON "estudiante_mundo_niveles"("estudiante_id", "mundo_id");

-- CreateIndex
CREATE INDEX "test_ubicacion_resultados_estudiante_id_idx" ON "test_ubicacion_resultados"("estudiante_id");

-- CreateIndex
CREATE INDEX "test_ubicacion_resultados_mundo_id_idx" ON "test_ubicacion_resultados"("mundo_id");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_email_key" ON "docentes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "membresias_tutor_id_estado_idx" ON "membresias"("tutor_id", "estado");

-- CreateIndex
CREATE INDEX "membresias_preferencia_id_idx" ON "membresias"("preferencia_id");

-- CreateIndex
CREATE INDEX "inscripciones_curso_estudiante_id_estado_idx" ON "inscripciones_curso"("estudiante_id", "estado");

-- CreateIndex
CREATE INDEX "inscripciones_curso_preferencia_id_idx" ON "inscripciones_curso"("preferencia_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_curso_estudiante_id_producto_id_key" ON "inscripciones_curso"("estudiante_id", "producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "rutas_curriculares_nombre_key" ON "rutas_curriculares"("nombre");

-- CreateIndex
CREATE INDEX "clases_docente_id_idx" ON "clases"("docente_id");

-- CreateIndex
CREATE INDEX "clases_fecha_hora_inicio_idx" ON "clases"("fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "clases_estado_idx" ON "clases"("estado");

-- CreateIndex
CREATE INDEX "clases_producto_id_idx" ON "clases"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_codigo_key" ON "grupos"("codigo");

-- CreateIndex
CREATE INDEX "grupos_codigo_idx" ON "grupos"("codigo");

-- CreateIndex
CREATE INDEX "grupos_activo_idx" ON "grupos"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "clase_grupos_nombre_key" ON "clase_grupos"("nombre");

-- CreateIndex
CREATE INDEX "clase_grupos_docente_id_idx" ON "clase_grupos"("docente_id");

-- CreateIndex
CREATE INDEX "clase_grupos_dia_semana_idx" ON "clase_grupos"("dia_semana");

-- CreateIndex
CREATE INDEX "clase_grupos_fecha_inicio_fecha_fin_idx" ON "clase_grupos"("fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "clase_grupos_anio_lectivo_idx" ON "clase_grupos"("anio_lectivo");

-- CreateIndex
CREATE INDEX "clase_grupos_activo_idx" ON "clase_grupos"("activo");

-- CreateIndex
CREATE INDEX "inscripciones_clase_grupo_estudiante_id_idx" ON "inscripciones_clase_grupo"("estudiante_id");

-- CreateIndex
CREATE INDEX "inscripciones_clase_grupo_tutor_id_idx" ON "inscripciones_clase_grupo"("tutor_id");

-- CreateIndex
CREATE INDEX "inscripciones_clase_grupo_clase_grupo_id_idx" ON "inscripciones_clase_grupo"("clase_grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_clase_grupo_clase_grupo_id_estudiante_id_key" ON "inscripciones_clase_grupo"("clase_grupo_id", "estudiante_id");

-- CreateIndex
CREATE INDEX "asistencias_clase_grupo_clase_grupo_id_idx" ON "asistencias_clase_grupo"("clase_grupo_id");

-- CreateIndex
CREATE INDEX "asistencias_clase_grupo_estudiante_id_idx" ON "asistencias_clase_grupo"("estudiante_id");

-- CreateIndex
CREATE INDEX "asistencias_clase_grupo_fecha_idx" ON "asistencias_clase_grupo"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_clase_grupo_clase_grupo_id_estudiante_id_fecha_key" ON "asistencias_clase_grupo"("clase_grupo_id", "estudiante_id", "fecha");

-- CreateIndex
CREATE INDEX "inscripciones_clase_estudiante_id_idx" ON "inscripciones_clase"("estudiante_id");

-- CreateIndex
CREATE INDEX "inscripciones_clase_tutor_id_idx" ON "inscripciones_clase"("tutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_clase_clase_id_estudiante_id_key" ON "inscripciones_clase"("clase_id", "estudiante_id");

-- CreateIndex
CREATE INDEX "asistencias_estudiante_id_idx" ON "asistencias"("estudiante_id");

-- CreateIndex
CREATE INDEX "asistencias_estado_idx" ON "asistencias"("estado");

-- CreateIndex
CREATE INDEX "asistencias_clase_id_estudiante_id_estado_idx" ON "asistencias"("clase_id", "estudiante_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_clase_id_estudiante_id_key" ON "asistencias"("clase_id", "estudiante_id");

-- CreateIndex
CREATE INDEX "alertas_estudiante_id_idx" ON "alertas"("estudiante_id");

-- CreateIndex
CREATE INDEX "alertas_resuelta_idx" ON "alertas"("resuelta");

-- CreateIndex
CREATE INDEX "alertas_fecha_idx" ON "alertas"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "acciones_puntuables_nombre_key" ON "acciones_puntuables"("nombre");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_estudiante_id_idx" ON "puntos_obtenidos"("estudiante_id");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_docente_id_idx" ON "puntos_obtenidos"("docente_id");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_accion_id_idx" ON "puntos_obtenidos"("accion_id");

-- CreateIndex
CREATE INDEX "puntos_obtenidos_fecha_otorgado_idx" ON "puntos_obtenidos"("fecha_otorgado");

-- CreateIndex
CREATE INDEX "modulos_producto_id_orden_idx" ON "modulos"("producto_id", "orden");

-- CreateIndex
CREATE INDEX "modulos_producto_id_idx" ON "modulos"("producto_id");

-- CreateIndex
CREATE INDEX "lecciones_modulo_id_orden_idx" ON "lecciones"("modulo_id", "orden");

-- CreateIndex
CREATE INDEX "lecciones_modulo_id_idx" ON "lecciones"("modulo_id");

-- CreateIndex
CREATE INDEX "lecciones_tipo_contenido_idx" ON "lecciones"("tipo_contenido");

-- CreateIndex
CREATE INDEX "progreso_lecciones_estudiante_id_idx" ON "progreso_lecciones"("estudiante_id");

-- CreateIndex
CREATE INDEX "progreso_lecciones_leccion_id_idx" ON "progreso_lecciones"("leccion_id");

-- CreateIndex
CREATE INDEX "progreso_lecciones_estudiante_id_completada_idx" ON "progreso_lecciones"("estudiante_id", "completada");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_lecciones_estudiante_id_leccion_id_key" ON "progreso_lecciones"("estudiante_id", "leccion_id");

-- CreateIndex
CREATE INDEX "notificaciones_docente_id_leida_idx" ON "notificaciones"("docente_id", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_docente_id_createdAt_idx" ON "notificaciones"("docente_id", "createdAt");

-- CreateIndex
CREATE INDEX "eventos_docente_id_fecha_inicio_idx" ON "eventos"("docente_id", "fecha_inicio");

-- CreateIndex
CREATE INDEX "eventos_tipo_idx" ON "eventos"("tipo");

-- CreateIndex
CREATE INDEX "eventos_docente_id_tipo_idx" ON "eventos"("docente_id", "tipo");

-- CreateIndex
CREATE INDEX "eventos_clase_id_idx" ON "eventos"("clase_id");

-- CreateIndex
CREATE UNIQUE INDEX "tareas_evento_id_key" ON "tareas"("evento_id");

-- CreateIndex
CREATE INDEX "tareas_estado_idx" ON "tareas"("estado");

-- CreateIndex
CREATE INDEX "tareas_prioridad_idx" ON "tareas"("prioridad");

-- CreateIndex
CREATE INDEX "tareas_categoria_idx" ON "tareas"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "recordatorios_evento_id_key" ON "recordatorios"("evento_id");

-- CreateIndex
CREATE UNIQUE INDEX "notas_evento_id_key" ON "notas"("evento_id");

-- CreateIndex
CREATE INDEX "notas_categoria_idx" ON "notas"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "sectores_nombre_key" ON "sectores"("nombre");

-- CreateIndex
CREATE INDEX "rutas_especialidad_sectorId_idx" ON "rutas_especialidad"("sectorId");

-- CreateIndex
CREATE UNIQUE INDEX "rutas_especialidad_sectorId_nombre_key" ON "rutas_especialidad"("sectorId", "nombre");

-- CreateIndex
CREATE INDEX "docentes_rutas_docenteId_idx" ON "docentes_rutas"("docenteId");

-- CreateIndex
CREATE INDEX "docentes_rutas_rutaId_idx" ON "docentes_rutas"("rutaId");

-- CreateIndex
CREATE INDEX "docentes_rutas_sectorId_idx" ON "docentes_rutas"("sectorId");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_rutas_docenteId_rutaId_key" ON "docentes_rutas"("docenteId", "rutaId");

-- CreateIndex
CREATE INDEX "historial_cambio_precios_configuracion_id_idx" ON "historial_cambio_precios"("configuracion_id");

-- CreateIndex
CREATE INDEX "historial_cambio_precios_fecha_cambio_idx" ON "historial_cambio_precios"("fecha_cambio");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_tutor_id_periodo_idx" ON "inscripciones_mensuales"("tutor_id", "periodo");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_estado_pago_idx" ON "inscripciones_mensuales"("estado_pago");

-- CreateIndex
CREATE INDEX "inscripciones_mensuales_periodo_idx" ON "inscripciones_mensuales"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_mensuales_estudiante_id_producto_id_periodo_key" ON "inscripciones_mensuales"("estudiante_id", "producto_id", "periodo");

-- CreateIndex
CREATE INDEX "becas_estudiante_id_idx" ON "becas"("estudiante_id");

-- CreateIndex
CREATE INDEX "becas_activa_idx" ON "becas"("activa");

-- CreateIndex
CREATE INDEX "planificaciones_mensuales_grupo_id_mes_anio_idx" ON "planificaciones_mensuales"("grupo_id", "mes", "anio");

-- CreateIndex
CREATE INDEX "planificaciones_mensuales_estado_idx" ON "planificaciones_mensuales"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "planificaciones_mensuales_grupo_id_mes_anio_key" ON "planificaciones_mensuales"("grupo_id", "mes", "anio");

-- CreateIndex
CREATE INDEX "actividades_semanales_planificacion_id_semana_numero_idx" ON "actividades_semanales"("planificacion_id", "semana_numero");

-- CreateIndex
CREATE INDEX "asignaciones_docente_clase_grupo_id_docente_id_idx" ON "asignaciones_docente"("clase_grupo_id", "docente_id");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_docente_planificacion_id_clase_grupo_id_key" ON "asignaciones_docente"("planificacion_id", "clase_grupo_id");

-- CreateIndex
CREATE INDEX "asignaciones_actividad_estudiante_clase_grupo_id_fecha_inic_idx" ON "asignaciones_actividad_estudiante"("clase_grupo_id", "fecha_inicio");

-- CreateIndex
CREATE INDEX "asignaciones_actividad_estudiante_asignacion_docente_id_idx" ON "asignaciones_actividad_estudiante"("asignacion_docente_id");

-- CreateIndex
CREATE INDEX "progreso_estudiante_actividad_estudiante_id_idx" ON "progreso_estudiante_actividad"("estudiante_id");

-- CreateIndex
CREATE INDEX "progreso_estudiante_actividad_actividad_id_idx" ON "progreso_estudiante_actividad"("actividad_id");

-- CreateIndex
CREATE INDEX "progreso_estudiante_actividad_asignacion_id_idx" ON "progreso_estudiante_actividad"("asignacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_estudiante_actividad_estudiante_id_actividad_id_as_key" ON "progreso_estudiante_actividad"("estudiante_id", "actividad_id", "asignacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "recursos_estudiante_estudiante_id_key" ON "recursos_estudiante"("estudiante_id");

-- CreateIndex
CREATE INDEX "recursos_estudiante_estudiante_id_idx" ON "recursos_estudiante"("estudiante_id");

-- CreateIndex
CREATE INDEX "transacciones_recurso_recursos_estudiante_id_idx" ON "transacciones_recurso"("recursos_estudiante_id");

-- CreateIndex
CREATE INDEX "transacciones_recurso_tipo_recurso_idx" ON "transacciones_recurso"("tipo_recurso");

-- CreateIndex
CREATE INDEX "transacciones_recurso_fecha_idx" ON "transacciones_recurso"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_item_nombre_key" ON "categorias_item"("nombre");

-- CreateIndex
CREATE INDEX "items_tienda_categoria_id_idx" ON "items_tienda"("categoria_id");

-- CreateIndex
CREATE INDEX "items_tienda_tipo_item_idx" ON "items_tienda"("tipo_item");

-- CreateIndex
CREATE INDEX "items_tienda_rareza_idx" ON "items_tienda"("rareza");

-- CreateIndex
CREATE INDEX "items_tienda_disponible_idx" ON "items_tienda"("disponible");

-- CreateIndex
CREATE INDEX "items_obtenidos_estudiante_id_idx" ON "items_obtenidos"("estudiante_id");

-- CreateIndex
CREATE INDEX "items_obtenidos_item_id_idx" ON "items_obtenidos"("item_id");

-- CreateIndex
CREATE INDEX "items_obtenidos_equipado_idx" ON "items_obtenidos"("equipado");

-- CreateIndex
CREATE UNIQUE INDEX "items_obtenidos_estudiante_id_item_id_key" ON "items_obtenidos"("estudiante_id", "item_id");

-- CreateIndex
CREATE INDEX "compras_item_recursos_estudiante_id_idx" ON "compras_item"("recursos_estudiante_id");

-- CreateIndex
CREATE INDEX "compras_item_item_id_idx" ON "compras_item"("item_id");

-- CreateIndex
CREATE INDEX "compras_item_fecha_compra_idx" ON "compras_item"("fecha_compra");

-- CreateIndex
CREATE UNIQUE INDEX "logros_gamificacion_codigo_key" ON "logros_gamificacion"("codigo");

-- CreateIndex
CREATE INDEX "logros_estudiantes_gamificacion_estudiante_id_idx" ON "logros_estudiantes_gamificacion"("estudiante_id");

-- CreateIndex
CREATE INDEX "logros_estudiantes_gamificacion_logro_id_idx" ON "logros_estudiantes_gamificacion"("logro_id");

-- CreateIndex
CREATE INDEX "logros_estudiantes_gamificacion_visto_idx" ON "logros_estudiantes_gamificacion"("visto");

-- CreateIndex
CREATE UNIQUE INDEX "logros_estudiantes_gamificacion_estudiante_id_logro_id_key" ON "logros_estudiantes_gamificacion"("estudiante_id", "logro_id");

-- CreateIndex
CREATE UNIQUE INDEX "rachas_estudiantes_estudiante_id_key" ON "rachas_estudiantes"("estudiante_id");

-- CreateIndex
CREATE INDEX "rachas_estudiantes_estudiante_id_idx" ON "rachas_estudiantes"("estudiante_id");

-- CreateIndex
CREATE INDEX "rachas_estudiantes_ultima_actividad_idx" ON "rachas_estudiantes"("ultima_actividad");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_catalogo_codigo_key" ON "cursos_catalogo"("codigo");

-- CreateIndex
CREATE INDEX "cursos_catalogo_categoria_idx" ON "cursos_catalogo"("categoria");

-- CreateIndex
CREATE INDEX "cursos_catalogo_destacado_idx" ON "cursos_catalogo"("destacado");

-- CreateIndex
CREATE INDEX "cursos_catalogo_activo_idx" ON "cursos_catalogo"("activo");

-- CreateIndex
CREATE INDEX "solicitudes_canje_estudiante_id_idx" ON "solicitudes_canje"("estudiante_id");

-- CreateIndex
CREATE INDEX "solicitudes_canje_tutor_id_idx" ON "solicitudes_canje"("tutor_id");

-- CreateIndex
CREATE INDEX "solicitudes_canje_estado_idx" ON "solicitudes_canje"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_canje_fecha_solicitud_idx" ON "solicitudes_canje"("fecha_solicitud");

-- CreateIndex
CREATE INDEX "cursos_estudiantes_estudiante_id_idx" ON "cursos_estudiantes"("estudiante_id");

-- CreateIndex
CREATE INDEX "cursos_estudiantes_completado_idx" ON "cursos_estudiantes"("completado");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_estudiantes_estudiante_id_curso_id_key" ON "cursos_estudiantes"("estudiante_id", "curso_id");

-- CreateIndex
CREATE UNIQUE INDEX "puntos_padres_tutor_id_key" ON "puntos_padres"("tutor_id");

-- CreateIndex
CREATE INDEX "puntos_padres_tutor_id_idx" ON "puntos_padres"("tutor_id");

-- CreateIndex
CREATE INDEX "transacciones_puntos_padres_puntos_padre_id_idx" ON "transacciones_puntos_padres"("puntos_padre_id");

-- CreateIndex
CREATE INDEX "transacciones_puntos_padres_tipo_recurso_idx" ON "transacciones_puntos_padres"("tipo_recurso");

-- CreateIndex
CREATE INDEX "transacciones_puntos_padres_fecha_idx" ON "transacciones_puntos_padres"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "premios_padres_codigo_key" ON "premios_padres"("codigo");

-- CreateIndex
CREATE INDEX "premios_padres_categoria_idx" ON "premios_padres"("categoria");

-- CreateIndex
CREATE INDEX "premios_padres_activo_idx" ON "premios_padres"("activo");

-- CreateIndex
CREATE INDEX "canjes_padres_tutor_id_idx" ON "canjes_padres"("tutor_id");

-- CreateIndex
CREATE INDEX "canjes_padres_fecha_canje_idx" ON "canjes_padres"("fecha_canje");

-- CreateIndex
CREATE INDEX "colonia_inscripciones_tutor_id_idx" ON "colonia_inscripciones"("tutor_id");

-- CreateIndex
CREATE INDEX "colonia_inscripciones_estado_idx" ON "colonia_inscripciones"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "colonia_estudiantes_pin_key" ON "colonia_estudiantes"("pin");

-- CreateIndex
CREATE INDEX "colonia_estudiantes_inscripcion_id_idx" ON "colonia_estudiantes"("inscripcion_id");

-- CreateIndex
CREATE INDEX "colonia_estudiantes_estudiante_id_idx" ON "colonia_estudiantes"("estudiante_id");

-- CreateIndex
CREATE INDEX "colonia_estudiantes_pin_idx" ON "colonia_estudiantes"("pin");

-- CreateIndex
CREATE INDEX "colonia_estudiante_cursos_colonia_estudiante_id_idx" ON "colonia_estudiante_cursos"("colonia_estudiante_id");

-- CreateIndex
CREATE INDEX "colonia_estudiante_cursos_course_id_idx" ON "colonia_estudiante_cursos"("course_id");

-- CreateIndex
CREATE INDEX "colonia_pagos_inscripcion_id_idx" ON "colonia_pagos"("inscripcion_id");

-- CreateIndex
CREATE INDEX "colonia_pagos_estado_idx" ON "colonia_pagos"("estado");

-- CreateIndex
CREATE INDEX "colonia_pagos_fecha_vencimiento_idx" ON "colonia_pagos"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "colonia_pagos_mercadopago_preference_id_idx" ON "colonia_pagos"("mercadopago_preference_id");

-- CreateIndex
CREATE INDEX "colonia_pagos_processed_at_idx" ON "colonia_pagos"("processed_at");

-- CreateIndex
CREATE INDEX "inscripciones_2026_tutor_id_idx" ON "inscripciones_2026"("tutor_id");

-- CreateIndex
CREATE INDEX "inscripciones_2026_tipo_inscripcion_idx" ON "inscripciones_2026"("tipo_inscripcion");

-- CreateIndex
CREATE INDEX "inscripciones_2026_estado_idx" ON "inscripciones_2026"("estado");

-- CreateIndex
CREATE INDEX "inscripciones_2026_fecha_inscripcion_idx" ON "inscripciones_2026"("fecha_inscripcion");

-- CreateIndex
CREATE INDEX "estudiantes_inscripciones_2026_inscripcion_id_idx" ON "estudiantes_inscripciones_2026"("inscripcion_id");

-- CreateIndex
CREATE INDEX "estudiantes_inscripciones_2026_estudiante_id_idx" ON "estudiantes_inscripciones_2026"("estudiante_id");

-- CreateIndex
CREATE INDEX "estudiantes_inscripciones_2026_pin_idx" ON "estudiantes_inscripciones_2026"("pin");

-- CreateIndex
CREATE INDEX "estudiantes_inscripciones_2026_tier_id_idx" ON "estudiantes_inscripciones_2026"("tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_inscripciones_2026_inscripcion_id_estudiante_id_key" ON "estudiantes_inscripciones_2026"("inscripcion_id", "estudiante_id");

-- CreateIndex
CREATE INDEX "colonia_cursos_seleccionados_2026_estudiante_inscripcion_id_idx" ON "colonia_cursos_seleccionados_2026"("estudiante_inscripcion_id");

-- CreateIndex
CREATE INDEX "colonia_cursos_seleccionados_2026_course_id_idx" ON "colonia_cursos_seleccionados_2026"("course_id");

-- CreateIndex
CREATE INDEX "ciclo_mundos_seleccionados_2026_estudiante_inscripcion_id_idx" ON "ciclo_mundos_seleccionados_2026"("estudiante_inscripcion_id");

-- CreateIndex
CREATE INDEX "ciclo_mundos_seleccionados_2026_mundo_idx" ON "ciclo_mundos_seleccionados_2026"("mundo");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_inscripciones_2026_mercadopago_payment_id_key" ON "pagos_inscripciones_2026"("mercadopago_payment_id");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_inscripcion_id_idx" ON "pagos_inscripciones_2026"("inscripcion_id");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_tipo_idx" ON "pagos_inscripciones_2026"("tipo");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_estado_idx" ON "pagos_inscripciones_2026"("estado");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_fecha_vencimiento_idx" ON "pagos_inscripciones_2026"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_mercadopago_preference_id_idx" ON "pagos_inscripciones_2026"("mercadopago_preference_id");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_mercadopago_payment_id_idx" ON "pagos_inscripciones_2026"("mercadopago_payment_id");

-- CreateIndex
CREATE INDEX "pagos_inscripciones_2026_processed_at_idx" ON "pagos_inscripciones_2026"("processed_at");

-- CreateIndex
CREATE INDEX "historial_estado_inscripciones_2026_inscripcion_id_idx" ON "historial_estado_inscripciones_2026"("inscripcion_id");

-- CreateIndex
CREATE INDEX "historial_estado_inscripciones_2026_fecha_cambio_idx" ON "historial_estado_inscripciones_2026"("fecha_cambio");

-- CreateIndex
CREATE UNIQUE INDEX "webhooks_processed_payment_id_key" ON "webhooks_processed"("payment_id");

-- CreateIndex
CREATE INDEX "webhooks_processed_payment_id_idx" ON "webhooks_processed"("payment_id");

-- CreateIndex
CREATE INDEX "webhooks_processed_processed_at_idx" ON "webhooks_processed"("processed_at");

-- CreateIndex
CREATE INDEX "webhooks_processed_webhook_type_idx" ON "webhooks_processed"("webhook_type");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_category_idx" ON "audit_logs"("category");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- CreateIndex
CREATE INDEX "audit_logs_user_email_idx" ON "audit_logs"("user_email");

-- CreateIndex
CREATE INDEX "secret_rotations_secret_type_idx" ON "secret_rotations"("secret_type");

-- CreateIndex
CREATE INDEX "secret_rotations_status_idx" ON "secret_rotations"("status");

-- CreateIndex
CREATE INDEX "secret_rotations_expires_at_idx" ON "secret_rotations"("expires_at");

-- CreateIndex
CREATE INDEX "secret_rotations_version_idx" ON "secret_rotations"("version");

-- CreateIndex
CREATE UNIQUE INDEX "secret_rotations_secret_type_version_key" ON "secret_rotations"("secret_type", "version");

-- CreateIndex
CREATE INDEX "cursos_studio_categoria_idx" ON "cursos_studio"("categoria");

-- CreateIndex
CREATE INDEX "cursos_studio_mundo_idx" ON "cursos_studio"("mundo");

-- CreateIndex
CREATE INDEX "cursos_studio_casa_idx" ON "cursos_studio"("casa");

-- CreateIndex
CREATE INDEX "cursos_studio_estado_idx" ON "cursos_studio"("estado");

-- CreateIndex
CREATE INDEX "semanas_studio_curso_id_idx" ON "semanas_studio"("curso_id");

-- CreateIndex
CREATE INDEX "semanas_studio_estado_idx" ON "semanas_studio"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "semanas_studio_curso_id_numero_key" ON "semanas_studio"("curso_id", "numero");

-- CreateIndex
CREATE INDEX "recursos_studio_curso_id_idx" ON "recursos_studio"("curso_id");

-- CreateIndex
CREATE INDEX "recursos_studio_tipo_idx" ON "recursos_studio"("tipo");

-- CreateIndex
CREATE INDEX "badges_custom_studio_curso_id_idx" ON "badges_custom_studio"("curso_id");

-- CreateIndex
CREATE INDEX "badges_custom_studio_en_biblioteca_idx" ON "badges_custom_studio"("en_biblioteca");

-- CreateIndex
CREATE UNIQUE INDEX "componentes_catalogo_tipo_key" ON "componentes_catalogo"("tipo");

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_casa_id_fkey" FOREIGN KEY ("casa_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante_sectores" ADD CONSTRAINT "estudiante_sectores_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante_sectores" ADD CONSTRAINT "estudiante_sectores_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_tier_pendientes" ADD CONSTRAINT "cambios_tier_pendientes_estudiante_inscripcion_id_fkey" FOREIGN KEY ("estudiante_inscripcion_id") REFERENCES "estudiantes_inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_tier_pendientes" ADD CONSTRAINT "cambios_tier_pendientes_tier_actual_id_fkey" FOREIGN KEY ("tier_actual_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_tier_pendientes" ADD CONSTRAINT "cambios_tier_pendientes_tier_nuevo_id_fkey" FOREIGN KEY ("tier_nuevo_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante_mundo_niveles" ADD CONSTRAINT "estudiante_mundo_niveles_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante_mundo_niveles" ADD CONSTRAINT "estudiante_mundo_niveles_mundo_id_fkey" FOREIGN KEY ("mundo_id") REFERENCES "mundos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_mundo_id_fkey" FOREIGN KEY ("mundo_id") REFERENCES "mundos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_casa_original_id_fkey" FOREIGN KEY ("casa_original_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_ubicacion_resultados" ADD CONSTRAINT "test_ubicacion_resultados_casa_asignada_id_fkey" FOREIGN KEY ("casa_asignada_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_curso" ADD CONSTRAINT "inscripciones_curso_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_curso" ADD CONSTRAINT "inscripciones_curso_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_ruta_curricular_id_fkey" FOREIGN KEY ("ruta_curricular_id") REFERENCES "rutas_curriculares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_ruta_curricular_id_fkey" FOREIGN KEY ("ruta_curricular_id") REFERENCES "rutas_curriculares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase_grupo" ADD CONSTRAINT "inscripciones_clase_grupo_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase_grupo" ADD CONSTRAINT "inscripciones_clase_grupo_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase_grupo" ADD CONSTRAINT "inscripciones_clase_grupo_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_clase_grupo" ADD CONSTRAINT "asistencias_clase_grupo_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias_clase_grupo" ADD CONSTRAINT "asistencias_clase_grupo_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase" ADD CONSTRAINT "inscripciones_clase_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase" ADD CONSTRAINT "inscripciones_clase_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_clase" ADD CONSTRAINT "inscripciones_clase_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_accion_id_fkey" FOREIGN KEY ("accion_id") REFERENCES "acciones_puntuables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulos" ADD CONSTRAINT "modulos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_leccion_prerequisito_id_fkey" FOREIGN KEY ("leccion_prerequisito_id") REFERENCES "lecciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecciones" ADD CONSTRAINT "lecciones_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_lecciones" ADD CONSTRAINT "progreso_lecciones_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_lecciones" ADD CONSTRAINT "progreso_lecciones_leccion_id_fkey" FOREIGN KEY ("leccion_id") REFERENCES "lecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas_especialidad" ADD CONSTRAINT "rutas_especialidad_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_rutas" ADD CONSTRAINT "docentes_rutas_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_rutas" ADD CONSTRAINT "docentes_rutas_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "rutas_especialidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docentes_rutas" ADD CONSTRAINT "docentes_rutas_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_cambio_precios" ADD CONSTRAINT "historial_cambio_precios_configuracion_id_fkey" FOREIGN KEY ("configuracion_id") REFERENCES "configuracion_precios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mensuales" ADD CONSTRAINT "inscripciones_mensuales_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mensuales" ADD CONSTRAINT "inscripciones_mensuales_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_mensuales" ADD CONSTRAINT "inscripciones_mensuales_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "becas" ADD CONSTRAINT "becas_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planificaciones_mensuales" ADD CONSTRAINT "planificaciones_mensuales_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades_semanales" ADD CONSTRAINT "actividades_semanales_planificacion_id_fkey" FOREIGN KEY ("planificacion_id") REFERENCES "planificaciones_mensuales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_planificacion_id_fkey" FOREIGN KEY ("planificacion_id") REFERENCES "planificaciones_mensuales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad_estudiante" ADD CONSTRAINT "asignaciones_actividad_estudiante_asignacion_docente_id_fkey" FOREIGN KEY ("asignacion_docente_id") REFERENCES "asignaciones_docente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad_estudiante" ADD CONSTRAINT "asignaciones_actividad_estudiante_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades_semanales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad_estudiante" ADD CONSTRAINT "asignaciones_actividad_estudiante_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_estudiante_actividad" ADD CONSTRAINT "progreso_estudiante_actividad_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_estudiante_actividad" ADD CONSTRAINT "progreso_estudiante_actividad_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades_semanales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_estudiante_actividad" ADD CONSTRAINT "progreso_estudiante_actividad_asignacion_id_fkey" FOREIGN KEY ("asignacion_id") REFERENCES "asignaciones_actividad_estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos_estudiante" ADD CONSTRAINT "recursos_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones_recurso" ADD CONSTRAINT "transacciones_recurso_recursos_estudiante_id_fkey" FOREIGN KEY ("recursos_estudiante_id") REFERENCES "recursos_estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_tienda" ADD CONSTRAINT "items_tienda_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_obtenidos" ADD CONSTRAINT "items_obtenidos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_obtenidos" ADD CONSTRAINT "items_obtenidos_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items_tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_item" ADD CONSTRAINT "compras_item_recursos_estudiante_id_fkey" FOREIGN KEY ("recursos_estudiante_id") REFERENCES "recursos_estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_item" ADD CONSTRAINT "compras_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items_tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logros_estudiantes_gamificacion" ADD CONSTRAINT "logros_estudiantes_gamificacion_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logros_estudiantes_gamificacion" ADD CONSTRAINT "logros_estudiantes_gamificacion_logro_id_fkey" FOREIGN KEY ("logro_id") REFERENCES "logros_gamificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rachas_estudiantes" ADD CONSTRAINT "rachas_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_canje" ADD CONSTRAINT "solicitudes_canje_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_canje" ADD CONSTRAINT "solicitudes_canje_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_canje" ADD CONSTRAINT "solicitudes_canje_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos_catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_estudiantes" ADD CONSTRAINT "cursos_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_estudiantes" ADD CONSTRAINT "cursos_estudiantes_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos_catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_padres" ADD CONSTRAINT "puntos_padres_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones_puntos_padres" ADD CONSTRAINT "transacciones_puntos_padres_puntos_padre_id_fkey" FOREIGN KEY ("puntos_padre_id") REFERENCES "puntos_padres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canjes_padres" ADD CONSTRAINT "canjes_padres_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canjes_padres" ADD CONSTRAINT "canjes_padres_premio_id_fkey" FOREIGN KEY ("premio_id") REFERENCES "premios_padres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canjes_padres" ADD CONSTRAINT "canjes_padres_puntos_padre_id_fkey" FOREIGN KEY ("puntos_padre_id") REFERENCES "puntos_padres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_inscripciones" ADD CONSTRAINT "colonia_inscripciones_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_estudiantes" ADD CONSTRAINT "colonia_estudiantes_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "colonia_inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_estudiantes" ADD CONSTRAINT "colonia_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_estudiante_cursos" ADD CONSTRAINT "colonia_estudiante_cursos_colonia_estudiante_id_fkey" FOREIGN KEY ("colonia_estudiante_id") REFERENCES "colonia_estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_pagos" ADD CONSTRAINT "colonia_pagos_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "colonia_inscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones_2026" ADD CONSTRAINT "inscripciones_2026_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes_inscripciones_2026" ADD CONSTRAINT "estudiantes_inscripciones_2026_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes_inscripciones_2026" ADD CONSTRAINT "estudiantes_inscripciones_2026_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiantes_inscripciones_2026" ADD CONSTRAINT "estudiantes_inscripciones_2026_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colonia_cursos_seleccionados_2026" ADD CONSTRAINT "colonia_cursos_seleccionados_2026_estudiante_inscripcion_i_fkey" FOREIGN KEY ("estudiante_inscripcion_id") REFERENCES "estudiantes_inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciclo_mundos_seleccionados_2026" ADD CONSTRAINT "ciclo_mundos_seleccionados_2026_estudiante_inscripcion_id_fkey" FOREIGN KEY ("estudiante_inscripcion_id") REFERENCES "estudiantes_inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_inscripciones_2026" ADD CONSTRAINT "pagos_inscripciones_2026_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_inscripciones_2026" ADD CONSTRAINT "historial_estado_inscripciones_2026_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones_2026"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semanas_studio" ADD CONSTRAINT "semanas_studio_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos_studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos_studio" ADD CONSTRAINT "recursos_studio_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos_studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

