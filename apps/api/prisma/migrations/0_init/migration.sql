-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('Evento', 'Digital', 'Fisico', 'Curso', 'Servicio', 'Bundle', 'Certificacion');
-- CreateEnum
CREATE TYPE "casa_tipo" AS ENUM ('QUANTUM', 'VERTEX', 'PULSAR');
-- CreateEnum
CREATE TYPE "mundo_tipo" AS ENUM ('MATEMATICA', 'PROGRAMACION', 'CIENCIAS');
-- CreateEnum
CREATE TYPE "estado_contenido" AS ENUM ('BORRADOR', 'PUBLICADO', 'ARCHIVADO');
-- CreateEnum
CREATE TYPE "onboarding_estado" AS ENUM ('PENDIENTE', 'SELECCION_MUNDOS', 'TEST_UBICACION', 'CONFIRMACION_CASA', 'CREACION_AVATAR', 'COMPLETADO');
-- CreateEnum
CREATE TYPE "tier_nombre" AS ENUM ('STEAM_LIBROS', 'STEAM_ASINCRONICO', 'STEAM_SINCRONICO');
-- CreateEnum
CREATE TYPE "estado_clase" AS ENUM ('Programada', 'EnVivo', 'Finalizada', 'Cancelada');
-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('Presente', 'Ausente', 'Justificado');
-- CreateEnum
CREATE TYPE "tipo_notificacion" AS ENUM ('ClaseProxima', 'AsistenciaPendiente', 'EstudianteAlerta', 'ClaseCancelada', 'LogroEstudiante', 'Recordatorio', 'General');
-- CreateEnum
CREATE TYPE "tipo_evento" AS ENUM ('CLASE', 'TAREA', 'RECORDATORIO', 'NOTA');
-- CreateEnum
CREATE TYPE "estado_tarea" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA');
-- CreateEnum
CREATE TYPE "prioridad_tarea" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');
-- CreateEnum
CREATE TYPE "tipo_descuento" AS ENUM ('NINGUNO', 'HERMANO_2', 'HERMANO_3_MAS');
-- CreateEnum
CREATE TYPE "estado_pago" AS ENUM ('Pendiente', 'Pagado', 'Vencido', 'Parcial');
-- CreateEnum
CREATE TYPE "tipo_clase_grupo" AS ENUM ('GRUPO_REGULAR', 'CURSO_TEMPORAL');
-- CreateEnum
CREATE TYPE "dia_semana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');
-- CreateEnum
CREATE TYPE "tipo_recurso" AS ENUM ('XP');
-- CreateEnum
CREATE TYPE "IntervaloSuscripcion" AS ENUM ('DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL');
-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('PENDIENTE', 'ACTIVA', 'EN_GRACIA', 'MOROSA', 'PAUSADA', 'CANCELADA');
-- CreateEnum
CREATE TYPE "EstadoAccesoEstudiante" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'VENCIDO', 'BECA');
-- CreateEnum
CREATE TYPE "EstadoInscripcionComision" AS ENUM ('Pendiente', 'Confirmada', 'Cancelada', 'ListaEspera');
-- CreateEnum
CREATE TYPE "tipo_observacion" AS ENUM ('Academica', 'Conductual', 'Asistencia', 'Logro', 'Incidente');
-- CreateEnum
CREATE TYPE "prioridad_observacion" AS ENUM ('Baja', 'Media', 'Alta', 'Urgente');
-- CreateEnum
CREATE TYPE "estado_observacion" AS ENUM ('Abierta', 'EnSeguimiento', 'Resuelta', 'Cerrada');
-- CreateEnum
CREATE TYPE "tipo_autor_seguimiento" AS ENUM ('Docente', 'Admin');
-- CreateTable
CREATE TABLE "tutores" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
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
    "nivel_actual" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avatar_gradient" INTEGER NOT NULL DEFAULT 0,
    "edad" INTEGER NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "fecha_ultimo_cambio" TIMESTAMP(3),
    "roles" JSONB NOT NULL DEFAULT '["estudiante"]',
    "sector_id" TEXT,
    "plan_id" TEXT,
    "estado_acceso" "EstadoAccesoEstudiante" NOT NULL DEFAULT 'ACTIVO',
    "fecha_vencimiento_plan" TIMESTAMP(3),
    "notas_plan" TEXT,
    "acceso_override" BOOLEAN NOT NULL DEFAULT false,
    "acceso_override_hasta" TIMESTAMP(3),
    "acceso_override_motivo" TEXT,
    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "historial_acceso_estudiante" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accion" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "origen_id" TEXT,
    "estado_anterior" JSONB,
    "estado_nuevo" JSONB,
    "ejecutado_por" TEXT,
    "metadata" JSONB,
    CONSTRAINT "historial_acceso_estudiante_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "contenidos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "casa_tipo" "casa_tipo" NOT NULL,
    "mundo_tipo" "mundo_tipo" NOT NULL,
    "estado" "estado_contenido" NOT NULL DEFAULT 'BORRADOR',
    "creador_id" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_portada" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "duracion_minutos" INTEGER,
    "fecha_publicacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contenidos_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "nodos_contenido" (
    "id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "titulo" TEXT NOT NULL,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "contenido_json" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "nodos_contenido_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "progreso_contenidos" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "nodo_actual_id" TEXT,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "tiempo_total_segundos" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actividad" TIMESTAMP(3) NOT NULL,
    "fecha_completitud" TIMESTAMP(3),
    CONSTRAINT "progreso_contenidos_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "docentes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
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
    "fecha_ultimo_cambio" TIMESTAMP(3),
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
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
CREATE TABLE "login_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "user_type" VARCHAR(20) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "refresh_token_sessions" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "user_type" VARCHAR(20) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_reason" VARCHAR(50),
    CONSTRAINT "refresh_token_sessions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "subcategoria" TEXT,
    "imagen_portada" TEXT,
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
CREATE TABLE "clases" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "estado" "estado_clase" NOT NULL DEFAULT 'Programada',
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
    "sector_id" TEXT,
    "nivel" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "livekit_room_name" TEXT,
    "estado_clase" "estado_clase" NOT NULL DEFAULT 'Programada',
    "iniciada_en" TIMESTAMP(3),
    "finalizada_en" TIMESTAMP(3),
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
CREATE TABLE "asistencias_live" (
    "id" TEXT NOT NULL,
    "clase_grupo_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "entro_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salio_en" TIMESTAMP(3),
    "duracion_minutos" INTEGER NOT NULL DEFAULT 0,
    "levanta_mano" BOOLEAN NOT NULL DEFAULT false,
    "esta_muteado" BOOLEAN NOT NULL DEFAULT false,
    "camara_encendida" BOOLEAN NOT NULL DEFAULT false,
    "compartiendo_pantalla" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asistencias_live_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "puntos_obtenidos" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "tipo_accion" TEXT NOT NULL DEFAULT 'ASISTENCIA',
    "clase_id" TEXT,
    "puntos" INTEGER NOT NULL,
    "contexto" TEXT,
    "fecha_otorgado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "puntos_obtenidos_pkey" PRIMARY KEY ("id")
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
    "precio_steam_libros" DECIMAL(10,2) NOT NULL DEFAULT 40000,
    "precio_steam_asincronico" DECIMAL(10,2) NOT NULL DEFAULT 65000,
    "precio_steam_sincronico" DECIMAL(10,2) NOT NULL DEFAULT 95000,
    "descuento_segundo_hermano" DECIMAL(5,2) NOT NULL DEFAULT 10,
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
CREATE TABLE "recursos_estudiante" (
    "id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
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
CREATE TABLE "logros_gamificacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
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
CREATE TABLE "planes_suscripcion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "intervalo" "IntervaloSuscripcion" NOT NULL DEFAULT 'MENSUAL',
    "intervalo_cantidad" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "planes_suscripcion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "suscripciones" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "mp_preapproval_id" TEXT,
    "mp_status" TEXT,
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_inicio" TIMESTAMP(3),
    "fecha_proximo_cobro" TIMESTAMP(3),
    "fecha_cancelacion" TIMESTAMP(3),
    "fecha_pausa" TIMESTAMP(3),
    "fecha_fin_pausa" TIMESTAMP(3),
    "dias_gracia_usados" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio_gracia" TIMESTAMP(3),
    "descuento_porcentaje" INTEGER NOT NULL DEFAULT 0,
    "precio_final" DECIMAL(10,2) NOT NULL,
    "motivo_cancelacion" TEXT,
    "cancelado_por" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "pagos_suscripcion" (
    "id" TEXT NOT NULL,
    "suscripcion_id" TEXT NOT NULL,
    "mp_payment_id" TEXT NOT NULL,
    "mp_status" TEXT NOT NULL,
    "mp_status_detail" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'ARS',
    "periodo_inicio" TIMESTAMP(3) NOT NULL,
    "periodo_fin" TIMESTAMP(3) NOT NULL,
    "intento_numero" INTEGER NOT NULL DEFAULT 1,
    "error_code" TEXT,
    "error_message" TEXT,
    "fecha_cobro" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pagos_suscripcion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "historial_estado_suscripcion" (
    "id" TEXT NOT NULL,
    "suscripcion_id" TEXT NOT NULL,
    "estado_anterior" "EstadoSuscripcion",
    "estado_nuevo" "EstadoSuscripcion" NOT NULL,
    "motivo" TEXT,
    "realizado_por" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_estado_suscripcion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "comisiones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "producto_id" TEXT NOT NULL,
    "casa_id" TEXT,
    "docente_id" TEXT,
    "cupo_maximo" INTEGER,
    "horario" TEXT,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "comisiones_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "inscripciones_comision" (
    "id" TEXT NOT NULL,
    "comision_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "estado" "EstadoInscripcionComision" NOT NULL DEFAULT 'Pendiente',
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inscripciones_comision_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "asistencia_comision" (
    "id" TEXT NOT NULL,
    "comision_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asistencia_comision_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "tareas_admin" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "prioridad_tarea" NOT NULL DEFAULT 'MEDIA',
    "status" "estado_tarea" NOT NULL DEFAULT 'PENDIENTE',
    "dueDate" TIMESTAMP(3),
    "assignee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tareas_admin_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "planificaciones" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "semanas_total" INTEGER NOT NULL DEFAULT 12,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "planificaciones_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "asignaciones_planificacion" (
    "id" TEXT NOT NULL,
    "planificacion_id" TEXT NOT NULL,
    "clase_grupo_id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asignaciones_planificacion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "semanas_activas_planificacion" (
    "id" TEXT NOT NULL,
    "asignacion_id" TEXT NOT NULL,
    "semana_numero" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "activada_en" TIMESTAMP(3),
    CONSTRAINT "semanas_activas_planificacion_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "progresos_semanales_estudiante" (
    "id" TEXT NOT NULL,
    "asignacion_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    "semana_actual" INTEGER NOT NULL DEFAULT 1,
    "tiempo_total_min" INTEGER NOT NULL DEFAULT 0,
    "puntos_totales" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "progresos_semanales_estudiante_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "observaciones_docente" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "comision_id" TEXT,
    "contenido" TEXT NOT NULL,
    "fecha_evento" TIMESTAMP(3) NOT NULL,
    "tipo" "tipo_observacion" NOT NULL,
    "prioridad" "prioridad_observacion" NOT NULL DEFAULT 'Baja',
    "requiere_seguimiento" BOOLEAN NOT NULL DEFAULT false,
    "notificar_admin" BOOLEAN NOT NULL DEFAULT false,
    "notificar_pedagogia" BOOLEAN NOT NULL DEFAULT false,
    "estado" "estado_observacion" NOT NULL DEFAULT 'Abierta',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "observaciones_docente_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "observaciones_estudiantes" (
    "observacion_id" TEXT NOT NULL,
    "estudiante_id" TEXT NOT NULL,
    CONSTRAINT "observaciones_estudiantes_pkey" PRIMARY KEY ("observacion_id","estudiante_id")
);
-- CreateTable
CREATE TABLE "seguimientos_observacion" (
    "id" TEXT NOT NULL,
    "observacion_id" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "autor_tipo" "tipo_autor_seguimiento" NOT NULL,
    "contenido" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seguimientos_observacion_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "idx_estudiantes_tutor_listado" ON "estudiantes"("tutor_id", "apellido");
-- CreateIndex
CREATE INDEX "historial_acceso_estudiante_estudiante_id_fecha_idx" ON "historial_acceso_estudiante"("estudiante_id", "fecha");
-- CreateIndex
CREATE INDEX "historial_acceso_estudiante_accion_fecha_idx" ON "historial_acceso_estudiante"("accion", "fecha");
-- CreateIndex
CREATE UNIQUE INDEX "casas_tipo_key" ON "casas"("tipo");
-- CreateIndex
CREATE UNIQUE INDEX "casas_nombre_key" ON "casas"("nombre");
-- CreateIndex
CREATE UNIQUE INDEX "mundos_tipo_key" ON "mundos"("tipo");
-- CreateIndex
CREATE UNIQUE INDEX "mundos_nombre_key" ON "mundos"("nombre");
-- CreateIndex
CREATE INDEX "idx_mundos_activo" ON "mundos"("activo");
-- CreateIndex
CREATE INDEX "idx_contenidos_casa_mundo_estado" ON "contenidos"("casa_tipo", "mundo_tipo", "estado");
-- CreateIndex
CREATE INDEX "idx_contenidos_creador" ON "contenidos"("creador_id");
-- CreateIndex
CREATE INDEX "idx_contenidos_estado" ON "contenidos"("estado");
-- CreateIndex
CREATE INDEX "idx_nodos_contenido" ON "nodos_contenido"("contenido_id");
-- CreateIndex
CREATE INDEX "idx_nodos_parent" ON "nodos_contenido"("parent_id");
-- CreateIndex
CREATE INDEX "idx_nodos_orden" ON "nodos_contenido"("orden");
-- CreateIndex
CREATE INDEX "idx_progreso_estudiante" ON "progreso_contenidos"("estudiante_id");
-- CreateIndex
CREATE INDEX "idx_progreso_contenido" ON "progreso_contenidos"("contenido_id");
-- CreateIndex
CREATE INDEX "idx_progreso_nodo_actual" ON "progreso_contenidos"("nodo_actual_id");
-- CreateIndex
CREATE UNIQUE INDEX "progreso_contenidos_estudiante_id_contenido_id_key" ON "progreso_contenidos"("estudiante_id", "contenido_id");
-- CreateIndex
CREATE UNIQUE INDEX "tiers_nombre_key" ON "tiers"("nombre");
-- CreateIndex
CREATE UNIQUE INDEX "docentes_email_key" ON "docentes"("email");
-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
-- CreateIndex
CREATE INDEX "idx_login_attempts_email" ON "login_attempts"("email");
-- CreateIndex
CREATE INDEX "idx_login_attempts_created_at" ON "login_attempts"("created_at");
-- CreateIndex
CREATE INDEX "idx_password_reset_email" ON "password_reset_tokens"("email");
-- CreateIndex
CREATE INDEX "idx_password_reset_token" ON "password_reset_tokens"("token");
-- CreateIndex
CREATE INDEX "idx_password_reset_expires" ON "password_reset_tokens"("expires_at");
-- CreateIndex
CREATE INDEX "idx_refresh_session_user" ON "refresh_token_sessions"("user_id");
-- CreateIndex
CREATE INDEX "idx_refresh_session_expires" ON "refresh_token_sessions"("expires_at");
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
CREATE UNIQUE INDEX "clase_grupos_livekit_room_name_key" ON "clase_grupos"("livekit_room_name");
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
CREATE INDEX "clase_grupos_estado_clase_idx" ON "clase_grupos"("estado_clase");
-- CreateIndex
CREATE INDEX "clase_grupos_livekit_room_name_idx" ON "clase_grupos"("livekit_room_name");
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
CREATE INDEX "idx_asistencias_estado" ON "asistencias_clase_grupo"("estado");
-- CreateIndex
CREATE UNIQUE INDEX "asistencias_clase_grupo_clase_grupo_id_estudiante_id_fecha_key" ON "asistencias_clase_grupo"("clase_grupo_id", "estudiante_id", "fecha");
-- CreateIndex
CREATE INDEX "asistencias_live_clase_grupo_id_idx" ON "asistencias_live"("clase_grupo_id");
-- CreateIndex
CREATE INDEX "asistencias_live_estudiante_id_idx" ON "asistencias_live"("estudiante_id");
-- CreateIndex
CREATE INDEX "asistencias_live_entro_en_idx" ON "asistencias_live"("entro_en");
-- CreateIndex
CREATE UNIQUE INDEX "asistencias_live_clase_grupo_id_estudiante_id_key" ON "asistencias_live"("clase_grupo_id", "estudiante_id");
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
CREATE INDEX "puntos_obtenidos_estudiante_id_idx" ON "puntos_obtenidos"("estudiante_id");
-- CreateIndex
CREATE INDEX "puntos_obtenidos_docente_id_idx" ON "puntos_obtenidos"("docente_id");
-- CreateIndex
CREATE INDEX "puntos_obtenidos_tipo_accion_idx" ON "puntos_obtenidos"("tipo_accion");
-- CreateIndex
CREATE INDEX "puntos_obtenidos_fecha_otorgado_idx" ON "puntos_obtenidos"("fecha_otorgado");
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
CREATE UNIQUE INDEX "logros_gamificacion_codigo_key" ON "logros_gamificacion"("codigo");
-- CreateIndex
CREATE INDEX "idx_logros_categoria" ON "logros_gamificacion"("categoria");
-- CreateIndex
CREATE INDEX "idx_logros_rareza" ON "logros_gamificacion"("rareza");
-- CreateIndex
CREATE INDEX "idx_logros_activo" ON "logros_gamificacion"("activo");
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
CREATE UNIQUE INDEX "suscripciones_mp_preapproval_id_key" ON "suscripciones"("mp_preapproval_id");
-- CreateIndex
CREATE INDEX "suscripciones_tutor_id_idx" ON "suscripciones"("tutor_id");
-- CreateIndex
CREATE INDEX "suscripciones_estado_idx" ON "suscripciones"("estado");
-- CreateIndex
CREATE INDEX "suscripciones_mp_preapproval_id_idx" ON "suscripciones"("mp_preapproval_id");
-- CreateIndex
CREATE UNIQUE INDEX "pagos_suscripcion_mp_payment_id_key" ON "pagos_suscripcion"("mp_payment_id");
-- CreateIndex
CREATE INDEX "pagos_suscripcion_suscripcion_id_idx" ON "pagos_suscripcion"("suscripcion_id");
-- CreateIndex
CREATE INDEX "historial_estado_suscripcion_suscripcion_id_idx" ON "historial_estado_suscripcion"("suscripcion_id");
-- CreateIndex
CREATE INDEX "comisiones_producto_id_idx" ON "comisiones"("producto_id");
-- CreateIndex
CREATE INDEX "comisiones_docente_id_idx" ON "comisiones"("docente_id");
-- CreateIndex
CREATE INDEX "comisiones_casa_id_idx" ON "comisiones"("casa_id");
-- CreateIndex
CREATE INDEX "comisiones_activo_idx" ON "comisiones"("activo");
-- CreateIndex
CREATE INDEX "inscripciones_comision_estudiante_id_idx" ON "inscripciones_comision"("estudiante_id");
-- CreateIndex
CREATE INDEX "inscripciones_comision_estado_idx" ON "inscripciones_comision"("estado");
-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_comision_comision_id_estudiante_id_key" ON "inscripciones_comision"("comision_id", "estudiante_id");
-- CreateIndex
CREATE INDEX "asistencia_comision_comision_id_idx" ON "asistencia_comision"("comision_id");
-- CreateIndex
CREATE INDEX "asistencia_comision_estudiante_id_idx" ON "asistencia_comision"("estudiante_id");
-- CreateIndex
CREATE INDEX "asistencia_comision_fecha_idx" ON "asistencia_comision"("fecha");
-- CreateIndex
CREATE UNIQUE INDEX "asistencia_comision_comision_id_estudiante_id_fecha_key" ON "asistencia_comision"("comision_id", "estudiante_id", "fecha");
-- CreateIndex
CREATE INDEX "tareas_admin_status_idx" ON "tareas_admin"("status");
-- CreateIndex
CREATE INDEX "tareas_admin_priority_idx" ON "tareas_admin"("priority");
-- CreateIndex
CREATE INDEX "tareas_admin_dueDate_idx" ON "tareas_admin"("dueDate");
-- CreateIndex
CREATE INDEX "asignaciones_planificacion_docente_id_idx" ON "asignaciones_planificacion"("docente_id");
-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_planificacion_planificacion_id_clase_grupo_id_key" ON "asignaciones_planificacion"("planificacion_id", "clase_grupo_id");
-- CreateIndex
CREATE UNIQUE INDEX "semanas_activas_planificacion_asignacion_id_semana_numero_key" ON "semanas_activas_planificacion"("asignacion_id", "semana_numero");
-- CreateIndex
CREATE INDEX "progresos_semanales_estudiante_estudiante_id_idx" ON "progresos_semanales_estudiante"("estudiante_id");
-- CreateIndex
CREATE UNIQUE INDEX "progresos_semanales_estudiante_asignacion_id_estudiante_id_key" ON "progresos_semanales_estudiante"("asignacion_id", "estudiante_id");
-- CreateIndex
CREATE INDEX "observaciones_docente_docente_id_idx" ON "observaciones_docente"("docente_id");
-- CreateIndex
CREATE INDEX "observaciones_docente_comision_id_idx" ON "observaciones_docente"("comision_id");
-- CreateIndex
CREATE INDEX "observaciones_docente_tipo_idx" ON "observaciones_docente"("tipo");
-- CreateIndex
CREATE INDEX "observaciones_docente_prioridad_idx" ON "observaciones_docente"("prioridad");
-- CreateIndex
CREATE INDEX "observaciones_docente_estado_idx" ON "observaciones_docente"("estado");
-- CreateIndex
CREATE INDEX "observaciones_docente_requiere_seguimiento_estado_idx" ON "observaciones_docente"("requiere_seguimiento", "estado");
-- CreateIndex
CREATE INDEX "observaciones_docente_fecha_evento_idx" ON "observaciones_docente"("fecha_evento");
-- CreateIndex
CREATE INDEX "observaciones_docente_created_at_idx" ON "observaciones_docente"("created_at");
-- CreateIndex
CREATE INDEX "observaciones_estudiantes_estudiante_id_idx" ON "observaciones_estudiantes"("estudiante_id");
-- CreateIndex
CREATE INDEX "seguimientos_observacion_observacion_id_idx" ON "seguimientos_observacion"("observacion_id");
-- CreateIndex
CREATE INDEX "seguimientos_observacion_autor_id_idx" ON "seguimientos_observacion"("autor_id");
-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_suscripcion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_casa_id_fkey" FOREIGN KEY ("casa_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "historial_acceso_estudiante" ADD CONSTRAINT "historial_acceso_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "contenidos" ADD CONSTRAINT "contenidos_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "nodos_contenido" ADD CONSTRAINT "nodos_contenido_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "nodos_contenido" ADD CONSTRAINT "nodos_contenido_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "nodos_contenido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "progreso_contenidos" ADD CONSTRAINT "progreso_contenidos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "progreso_contenidos" ADD CONSTRAINT "progreso_contenidos_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "progreso_contenidos" ADD CONSTRAINT "progreso_contenidos_nodo_actual_id_fkey" FOREIGN KEY ("nodo_actual_id") REFERENCES "nodos_contenido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "clases" ADD CONSTRAINT "clases_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "clase_grupos" ADD CONSTRAINT "clase_grupos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
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
ALTER TABLE "asistencias_live" ADD CONSTRAINT "asistencias_live_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asistencias_live" ADD CONSTRAINT "asistencias_live_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_clase_id_fkey" FOREIGN KEY ("clase_id") REFERENCES "clases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "puntos_obtenidos" ADD CONSTRAINT "puntos_obtenidos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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
ALTER TABLE "recursos_estudiante" ADD CONSTRAINT "recursos_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "transacciones_recurso" ADD CONSTRAINT "transacciones_recurso_recursos_estudiante_id_fkey" FOREIGN KEY ("recursos_estudiante_id") REFERENCES "recursos_estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "logros_estudiantes_gamificacion" ADD CONSTRAINT "logros_estudiantes_gamificacion_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "logros_estudiantes_gamificacion" ADD CONSTRAINT "logros_estudiantes_gamificacion_logro_id_fkey" FOREIGN KEY ("logro_id") REFERENCES "logros_gamificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "rachas_estudiantes" ADD CONSTRAINT "rachas_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
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
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_suscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "pagos_suscripcion" ADD CONSTRAINT "pagos_suscripcion_suscripcion_id_fkey" FOREIGN KEY ("suscripcion_id") REFERENCES "suscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "historial_estado_suscripcion" ADD CONSTRAINT "historial_estado_suscripcion_suscripcion_id_fkey" FOREIGN KEY ("suscripcion_id") REFERENCES "suscripciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_casa_id_fkey" FOREIGN KEY ("casa_id") REFERENCES "casas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "comisiones" ADD CONSTRAINT "comisiones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "inscripciones_comision" ADD CONSTRAINT "inscripciones_comision_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "inscripciones_comision" ADD CONSTRAINT "inscripciones_comision_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asistencia_comision" ADD CONSTRAINT "asistencia_comision_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asistencia_comision" ADD CONSTRAINT "asistencia_comision_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asignaciones_planificacion" ADD CONSTRAINT "asignaciones_planificacion_planificacion_id_fkey" FOREIGN KEY ("planificacion_id") REFERENCES "planificaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asignaciones_planificacion" ADD CONSTRAINT "asignaciones_planificacion_clase_grupo_id_fkey" FOREIGN KEY ("clase_grupo_id") REFERENCES "clase_grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "asignaciones_planificacion" ADD CONSTRAINT "asignaciones_planificacion_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "semanas_activas_planificacion" ADD CONSTRAINT "semanas_activas_planificacion_asignacion_id_fkey" FOREIGN KEY ("asignacion_id") REFERENCES "asignaciones_planificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "progresos_semanales_estudiante" ADD CONSTRAINT "progresos_semanales_estudiante_asignacion_id_fkey" FOREIGN KEY ("asignacion_id") REFERENCES "asignaciones_planificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "progresos_semanales_estudiante" ADD CONSTRAINT "progresos_semanales_estudiante_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "observaciones_docente" ADD CONSTRAINT "observaciones_docente_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "observaciones_docente" ADD CONSTRAINT "observaciones_docente_comision_id_fkey" FOREIGN KEY ("comision_id") REFERENCES "comisiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "observaciones_estudiantes" ADD CONSTRAINT "observaciones_estudiantes_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones_docente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "observaciones_estudiantes" ADD CONSTRAINT "observaciones_estudiantes_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "seguimientos_observacion" ADD CONSTRAINT "seguimientos_observacion_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "observaciones_docente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
