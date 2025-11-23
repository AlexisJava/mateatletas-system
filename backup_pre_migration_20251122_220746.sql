--
-- PostgreSQL database dump
--

\restrict uXLGgAZhQIXSVJ8NTXhawXY5j8qKvc5EeMr5sfu4Eu9pqNvlQ0BawGtJCWwsCpZ

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoAsistencia; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public."EstadoAsistencia" AS ENUM (
    'Presente',
    'Ausente',
    'Justificado'
);


ALTER TYPE public."EstadoAsistencia" OWNER TO mateatletas;

--
-- Name: EstadoClase; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public."EstadoClase" AS ENUM (
    'Programada',
    'Cancelada'
);


ALTER TYPE public."EstadoClase" OWNER TO mateatletas;

--
-- Name: EstadoInscripcionCurso; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public."EstadoInscripcionCurso" AS ENUM (
    'PreInscrito',
    'Activo',
    'Finalizado'
);


ALTER TYPE public."EstadoInscripcionCurso" OWNER TO mateatletas;

--
-- Name: EstadoMembresia; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public."EstadoMembresia" AS ENUM (
    'Pendiente',
    'Activa',
    'Atrasada',
    'Cancelada'
);


ALTER TYPE public."EstadoMembresia" OWNER TO mateatletas;

--
-- Name: TipoContenido; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public."TipoContenido" AS ENUM (
    'Video',
    'Texto',
    'Quiz',
    'Tarea',
    'JuegoInteractivo',
    'Lectura',
    'Practica'
);


ALTER TYPE public."TipoContenido" OWNER TO mateatletas;

--
-- Name: TipoProducto; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public."TipoProducto" AS ENUM (
    'Suscripcion',
    'Curso',
    'RecursoDigital'
);


ALTER TYPE public."TipoProducto" OWNER TO mateatletas;

--
-- Name: descuento_beca_tipo; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.descuento_beca_tipo AS ENUM (
    'PORCENTAJE',
    'MONTO_FIJO'
);


ALTER TYPE public.descuento_beca_tipo OWNER TO mateatletas;

--
-- Name: dia_semana; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.dia_semana AS ENUM (
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO'
);


ALTER TYPE public.dia_semana OWNER TO mateatletas;

--
-- Name: estado_asignacion; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.estado_asignacion AS ENUM (
    'ACTIVA',
    'PAUSADA',
    'FINALIZADA',
    'CANCELADA'
);


ALTER TYPE public.estado_asignacion OWNER TO mateatletas;

--
-- Name: estado_pago; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.estado_pago AS ENUM (
    'Pendiente',
    'Pagado',
    'Vencido',
    'Parcial',
    'Becado'
);


ALTER TYPE public.estado_pago OWNER TO mateatletas;

--
-- Name: estado_planificacion; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.estado_planificacion AS ENUM (
    'BORRADOR',
    'PUBLICADA',
    'ARCHIVADA'
);


ALTER TYPE public.estado_planificacion OWNER TO mateatletas;

--
-- Name: estado_planificacion_simple; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.estado_planificacion_simple AS ENUM (
    'DETECTADA',
    'ASIGNADA',
    'ARCHIVADA'
);


ALTER TYPE public.estado_planificacion_simple OWNER TO mateatletas;

--
-- Name: estado_tarea; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.estado_tarea AS ENUM (
    'PENDIENTE',
    'EN_PROGRESO',
    'COMPLETADA',
    'CANCELADA'
);


ALTER TYPE public.estado_tarea OWNER TO mateatletas;

--
-- Name: nivel_dificultad; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.nivel_dificultad AS ENUM (
    'BASICO',
    'INTERMEDIO',
    'AVANZADO',
    'OLIMPICO'
);


ALTER TYPE public.nivel_dificultad OWNER TO mateatletas;

--
-- Name: prioridad_tarea; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.prioridad_tarea AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'URGENTE'
);


ALTER TYPE public.prioridad_tarea OWNER TO mateatletas;

--
-- Name: rareza_item; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.rareza_item AS ENUM (
    'COMUN',
    'RARO',
    'EPICO',
    'LEGENDARIO'
);


ALTER TYPE public.rareza_item OWNER TO mateatletas;

--
-- Name: tipo_clase_grupo; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.tipo_clase_grupo AS ENUM (
    'GRUPO_REGULAR',
    'CURSO_TEMPORAL'
);


ALTER TYPE public.tipo_clase_grupo OWNER TO mateatletas;

--
-- Name: tipo_descuento; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.tipo_descuento AS ENUM (
    'NINGUNO',
    'MULTIPLE_ACTIVIDADES',
    'HERMANOS_BASICO',
    'HERMANOS_MULTIPLE',
    'AACREA',
    'BECA'
);


ALTER TYPE public.tipo_descuento OWNER TO mateatletas;

--
-- Name: tipo_evento; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.tipo_evento AS ENUM (
    'CLASE',
    'TAREA',
    'RECORDATORIO',
    'NOTA'
);


ALTER TYPE public.tipo_evento OWNER TO mateatletas;

--
-- Name: tipo_item; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.tipo_item AS ENUM (
    'AVATAR',
    'SKIN',
    'ACCESORIO',
    'POWERUP',
    'COSMETICO',
    'TITULO',
    'EMOJI',
    'FONDO',
    'MARCO'
);


ALTER TYPE public.tipo_item OWNER TO mateatletas;

--
-- Name: tipo_notificacion; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.tipo_notificacion AS ENUM (
    'ClaseProxima',
    'AsistenciaPendiente',
    'EstudianteAlerta',
    'ClaseCancelada',
    'LogroEstudiante',
    'Recordatorio',
    'General'
);


ALTER TYPE public.tipo_notificacion OWNER TO mateatletas;

--
-- Name: tipo_recurso; Type: TYPE; Schema: public; Owner: mateatletas
--

CREATE TYPE public.tipo_recurso AS ENUM (
    'XP',
    'MONEDAS'
);


ALTER TYPE public.tipo_recurso OWNER TO mateatletas;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO mateatletas;

--
-- Name: acciones_puntuables; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.acciones_puntuables (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    puntos integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.acciones_puntuables OWNER TO mateatletas;

--
-- Name: actividades_semanales; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.actividades_semanales (
    id text NOT NULL,
    planificacion_id text NOT NULL,
    semana_numero integer NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    componente_nombre text NOT NULL,
    componente_props jsonb NOT NULL,
    nivel_dificultad public.nivel_dificultad NOT NULL,
    tiempo_estimado_minutos integer NOT NULL,
    puntos_gamificacion integer NOT NULL,
    instrucciones_docente text NOT NULL,
    instrucciones_estudiante text NOT NULL,
    recursos_url jsonb,
    orden integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.actividades_semanales OWNER TO mateatletas;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    password_temporal text,
    debe_cambiar_password boolean DEFAULT true NOT NULL,
    fecha_ultimo_cambio timestamp(3) without time zone,
    nombre text NOT NULL,
    apellido text NOT NULL,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    dni text,
    roles jsonb DEFAULT '["admin"]'::jsonb NOT NULL,
    telefono text,
    mfa_backup_codes text[] DEFAULT ARRAY[]::text[],
    mfa_enabled boolean DEFAULT false NOT NULL,
    mfa_secret text
);


ALTER TABLE public.admins OWNER TO mateatletas;

--
-- Name: alertas; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.alertas (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    clase_id text NOT NULL,
    descripcion text NOT NULL,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resuelta boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.alertas OWNER TO mateatletas;

--
-- Name: asignaciones_actividad_estudiante; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.asignaciones_actividad_estudiante (
    id text NOT NULL,
    asignacion_docente_id text CONSTRAINT asignaciones_actividad_estudiant_asignacion_docente_id_not_null NOT NULL,
    actividad_id text NOT NULL,
    clase_grupo_id text NOT NULL,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone,
    estado public.estado_asignacion DEFAULT 'ACTIVA'::public.estado_asignacion NOT NULL,
    mensaje_semana text,
    notificado_estudiantes boolean DEFAULT false CONSTRAINT asignaciones_actividad_estudian_notificado_estudiantes_not_null NOT NULL,
    fecha_notificacion_estudiantes timestamp(3) without time zone,
    notificado_tutores boolean DEFAULT false NOT NULL,
    fecha_notificacion_tutores timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asignaciones_actividad_estudiante OWNER TO mateatletas;

--
-- Name: asignaciones_docente; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.asignaciones_docente (
    id text NOT NULL,
    planificacion_id text NOT NULL,
    clase_grupo_id text NOT NULL,
    docente_id text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    mensaje_docente text,
    fecha_inicio_custom timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asignaciones_docente OWNER TO mateatletas;

--
-- Name: asignaciones_planificacion; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.asignaciones_planificacion (
    id text NOT NULL,
    planificacion_id text NOT NULL,
    docente_id text NOT NULL,
    clase_grupo_id text NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asignaciones_planificacion OWNER TO mateatletas;

--
-- Name: asistencias; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.asistencias (
    id text NOT NULL,
    clase_id text NOT NULL,
    estudiante_id text NOT NULL,
    estado public."EstadoAsistencia" NOT NULL,
    observaciones text,
    puntos_otorgados integer DEFAULT 0 NOT NULL,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asistencias OWNER TO mateatletas;

--
-- Name: asistencias_clase_grupo; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.asistencias_clase_grupo (
    id text NOT NULL,
    clase_grupo_id text NOT NULL,
    estudiante_id text NOT NULL,
    fecha timestamp(3) without time zone NOT NULL,
    estado public."EstadoAsistencia" NOT NULL,
    observaciones text,
    feedback text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asistencias_clase_grupo OWNER TO mateatletas;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id text,
    user_type text,
    user_email text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    description text NOT NULL,
    changes jsonb,
    metadata jsonb,
    severity text DEFAULT 'info'::text NOT NULL,
    category text NOT NULL,
    ip_address text,
    user_agent text,
    request_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO mateatletas;

--
-- Name: becas; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.becas (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    tipo_beca text NOT NULL,
    descuento_tipo public.descuento_beca_tipo NOT NULL,
    descuento_valor numeric(10,2) NOT NULL,
    productos_aplica jsonb NOT NULL,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    motivo_beca text,
    aprobada_por_admin_id text,
    observaciones text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.becas OWNER TO mateatletas;

--
-- Name: canjes_padres; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.canjes_padres (
    id text NOT NULL,
    tutor_id text NOT NULL,
    premio_id text NOT NULL,
    puntos_padre_id text NOT NULL,
    puntos_usados integer NOT NULL,
    estado text DEFAULT 'completado'::text NOT NULL,
    fecha_canje timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.canjes_padres OWNER TO mateatletas;

--
-- Name: categorias_item; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.categorias_item (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    icono text NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categorias_item OWNER TO mateatletas;

--
-- Name: ciclo_mundos_seleccionados_2026; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.ciclo_mundos_seleccionados_2026 (
    id text NOT NULL,
    estudiante_inscripcion_id text CONSTRAINT ciclo_mundos_seleccionados_2_estudiante_inscripcion_id_not_null NOT NULL,
    mundo text NOT NULL,
    dia_semana text,
    horario text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ciclo_mundos_seleccionados_2026 OWNER TO mateatletas;

--
-- Name: clase_grupos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.clase_grupos (
    id text NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    tipo public.tipo_clase_grupo DEFAULT 'GRUPO_REGULAR'::public.tipo_clase_grupo NOT NULL,
    dia_semana public.dia_semana NOT NULL,
    hora_inicio text NOT NULL,
    hora_fin text NOT NULL,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone NOT NULL,
    anio_lectivo integer NOT NULL,
    cupo_maximo integer DEFAULT 15 NOT NULL,
    grupo_id text NOT NULL,
    docente_id text NOT NULL,
    ruta_curricular_id text,
    sector_id text,
    nivel text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clase_grupos OWNER TO mateatletas;

--
-- Name: clases; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.clases (
    id text NOT NULL,
    ruta_curricular_id text,
    docente_id text NOT NULL,
    fecha_hora_inicio timestamp(3) without time zone NOT NULL,
    duracion_minutos integer NOT NULL,
    estado public."EstadoClase" DEFAULT 'Programada'::public."EstadoClase" NOT NULL,
    cupos_maximo integer NOT NULL,
    cupos_ocupados integer DEFAULT 0 NOT NULL,
    producto_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    descripcion text,
    nombre text NOT NULL,
    sector_id text
);


ALTER TABLE public.clases OWNER TO mateatletas;

--
-- Name: colonia_cursos_seleccionados_2026; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.colonia_cursos_seleccionados_2026 (
    id text NOT NULL,
    estudiante_inscripcion_id text CONSTRAINT colonia_cursos_seleccionados_estudiante_inscripcion_id_not_null NOT NULL,
    course_id text NOT NULL,
    course_name text NOT NULL,
    course_area text NOT NULL,
    instructor text NOT NULL,
    day_of_week text NOT NULL,
    time_slot text NOT NULL,
    precio_base integer NOT NULL,
    precio_con_descuento integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.colonia_cursos_seleccionados_2026 OWNER TO mateatletas;

--
-- Name: colonia_estudiante_cursos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.colonia_estudiante_cursos (
    id text NOT NULL,
    colonia_estudiante_id text NOT NULL,
    course_id text NOT NULL,
    course_name text NOT NULL,
    course_area text NOT NULL,
    instructor text NOT NULL,
    day_of_week text NOT NULL,
    time_slot text NOT NULL,
    precio_base integer NOT NULL,
    precio_con_descuento integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.colonia_estudiante_cursos OWNER TO mateatletas;

--
-- Name: colonia_estudiantes; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.colonia_estudiantes (
    id text NOT NULL,
    inscripcion_id text NOT NULL,
    estudiante_id text NOT NULL,
    nombre text NOT NULL,
    edad integer NOT NULL,
    pin text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.colonia_estudiantes OWNER TO mateatletas;

--
-- Name: colonia_inscripciones; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.colonia_inscripciones (
    id text NOT NULL,
    tutor_id text NOT NULL,
    estado text DEFAULT 'active'::text NOT NULL,
    descuento_aplicado integer NOT NULL,
    total_mensual integer NOT NULL,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.colonia_inscripciones OWNER TO mateatletas;

--
-- Name: colonia_pagos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.colonia_pagos (
    id text NOT NULL,
    inscripcion_id text NOT NULL,
    mes text NOT NULL,
    anio integer NOT NULL,
    monto integer NOT NULL,
    estado text DEFAULT 'pending'::text NOT NULL,
    mercadopago_preference_id text,
    mercadopago_payment_id text,
    fecha_vencimiento timestamp(3) without time zone NOT NULL,
    fecha_pago timestamp(3) without time zone,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    processed_at timestamp(3) without time zone
);


ALTER TABLE public.colonia_pagos OWNER TO mateatletas;

--
-- Name: compras_item; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.compras_item (
    id text NOT NULL,
    recursos_estudiante_id text NOT NULL,
    item_id text NOT NULL,
    monedas_gastadas integer DEFAULT 0 NOT NULL,
    gemas_gastadas integer DEFAULT 0 NOT NULL,
    fecha_compra timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.compras_item OWNER TO mateatletas;

--
-- Name: configuracion_precios; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.configuracion_precios (
    id text DEFAULT 'singleton'::text NOT NULL,
    precio_club_matematicas numeric(10,2) DEFAULT 50000 NOT NULL,
    precio_cursos_especializados numeric(10,2) DEFAULT 55000 NOT NULL,
    precio_multiple_actividades numeric(10,2) DEFAULT 44000 NOT NULL,
    precio_hermanos_basico numeric(10,2) DEFAULT 44000 NOT NULL,
    precio_hermanos_multiple numeric(10,2) DEFAULT 38000 NOT NULL,
    descuento_aacrea_porcentaje numeric(5,2) DEFAULT 20 NOT NULL,
    descuento_aacrea_activo boolean DEFAULT true NOT NULL,
    dia_vencimiento integer DEFAULT 15 NOT NULL,
    dias_antes_recordatorio integer DEFAULT 5 NOT NULL,
    notificaciones_activas boolean DEFAULT true NOT NULL,
    actualizado_por_admin_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.configuracion_precios OWNER TO mateatletas;

--
-- Name: cursos_catalogo; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.cursos_catalogo (
    id text NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
    subcategoria text,
    duracion_clases integer NOT NULL,
    nivel_requerido integer DEFAULT 1 NOT NULL,
    contenido jsonb,
    precio_usd numeric(10,2) NOT NULL,
    precio_monedas integer NOT NULL,
    imagen_url text,
    video_preview_url text,
    destacado boolean DEFAULT false NOT NULL,
    nuevo boolean DEFAULT false NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    total_canjes integer DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cursos_catalogo OWNER TO mateatletas;

--
-- Name: cursos_estudiantes; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.cursos_estudiantes (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    curso_id text NOT NULL,
    progreso integer DEFAULT 0 NOT NULL,
    completado boolean DEFAULT false NOT NULL,
    fecha_inicio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_completado timestamp(3) without time zone
);


ALTER TABLE public.cursos_estudiantes OWNER TO mateatletas;

--
-- Name: docentes; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.docentes (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    password_temporal text,
    nombre text NOT NULL,
    apellido text NOT NULL,
    titulo text,
    bio text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    disponibilidad_horaria jsonb,
    especialidades jsonb,
    estado text DEFAULT 'activo'::text NOT NULL,
    experiencia_anos integer,
    nivel_educativo jsonb,
    roles jsonb DEFAULT '["docente"]'::jsonb NOT NULL,
    telefono text,
    debe_cambiar_password boolean DEFAULT true NOT NULL,
    fecha_ultimo_cambio timestamp(3) without time zone
);


ALTER TABLE public.docentes OWNER TO mateatletas;

--
-- Name: docentes_rutas; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.docentes_rutas (
    id text NOT NULL,
    "docenteId" text NOT NULL,
    "rutaId" text NOT NULL,
    "sectorId" text NOT NULL,
    "asignadoEn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.docentes_rutas OWNER TO mateatletas;

--
-- Name: equipos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.equipos (
    id text NOT NULL,
    nombre text NOT NULL,
    color_primario text NOT NULL,
    color_secundario text NOT NULL,
    icono_url text,
    puntos_totales integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.equipos OWNER TO mateatletas;

--
-- Name: estudiante_sectores; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.estudiante_sectores (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    sector_id text NOT NULL,
    es_principal boolean DEFAULT false NOT NULL,
    fecha_inicio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_fin timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.estudiante_sectores OWNER TO mateatletas;

--
-- Name: estudiantes; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.estudiantes (
    id text NOT NULL,
    username text NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    nivel_escolar text NOT NULL,
    avatar_url text,
    animacion_idle_url text,
    foto_url text,
    tutor_id text NOT NULL,
    equipo_id text,
    puntos_totales integer DEFAULT 0 NOT NULL,
    nivel_actual integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar_gradient integer DEFAULT 0 NOT NULL,
    edad integer NOT NULL,
    email text,
    password_hash text,
    password_temporal text,
    debe_cambiar_password boolean DEFAULT true NOT NULL,
    fecha_ultimo_cambio timestamp(3) without time zone,
    roles jsonb DEFAULT '["estudiante"]'::jsonb NOT NULL,
    sector_id text
);


ALTER TABLE public.estudiantes OWNER TO mateatletas;

--
-- Name: estudiantes_inscripciones_2026; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.estudiantes_inscripciones_2026 (
    id text NOT NULL,
    inscripcion_id text NOT NULL,
    estudiante_id text NOT NULL,
    nombre text NOT NULL,
    edad integer NOT NULL,
    dni text,
    pin text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.estudiantes_inscripciones_2026 OWNER TO mateatletas;

--
-- Name: eventos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.eventos (
    id text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    tipo public.tipo_evento NOT NULL,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone NOT NULL,
    es_todo_el_dia boolean DEFAULT false NOT NULL,
    docente_id text NOT NULL,
    clase_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.eventos OWNER TO mateatletas;

--
-- Name: grupos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.grupos (
    id text NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    edad_minima integer,
    edad_maxima integer,
    sector_id text,
    link_meet text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.grupos OWNER TO mateatletas;

--
-- Name: historial_cambio_precios; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.historial_cambio_precios (
    id text NOT NULL,
    configuracion_id text NOT NULL,
    valores_anteriores jsonb NOT NULL,
    valores_nuevos jsonb NOT NULL,
    motivo_cambio text,
    admin_id text NOT NULL,
    fecha_cambio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.historial_cambio_precios OWNER TO mateatletas;

--
-- Name: historial_estado_inscripciones_2026; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.historial_estado_inscripciones_2026 (
    id text NOT NULL,
    inscripcion_id text NOT NULL,
    estado_anterior text NOT NULL,
    estado_nuevo text NOT NULL,
    razon text NOT NULL,
    realizado_por text DEFAULT 'system'::text NOT NULL,
    fecha_cambio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.historial_estado_inscripciones_2026 OWNER TO mateatletas;

--
-- Name: inscripciones_2026; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.inscripciones_2026 (
    id text NOT NULL,
    tutor_id text NOT NULL,
    tipo_inscripcion text NOT NULL,
    estado text DEFAULT 'pending'::text NOT NULL,
    inscripcion_pagada integer NOT NULL,
    descuento_aplicado integer DEFAULT 0 NOT NULL,
    total_mensual_actual integer NOT NULL,
    origen_inscripcion text,
    ciudad text,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_inicio timestamp(3) without time zone,
    fecha_fin timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inscripciones_2026 OWNER TO mateatletas;

--
-- Name: inscripciones_clase; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.inscripciones_clase (
    id text NOT NULL,
    clase_id text NOT NULL,
    estudiante_id text NOT NULL,
    tutor_id text NOT NULL,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observaciones text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inscripciones_clase OWNER TO mateatletas;

--
-- Name: inscripciones_clase_grupo; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.inscripciones_clase_grupo (
    id text NOT NULL,
    clase_grupo_id text NOT NULL,
    estudiante_id text NOT NULL,
    tutor_id text NOT NULL,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_baja timestamp(3) without time zone,
    observaciones text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inscripciones_clase_grupo OWNER TO mateatletas;

--
-- Name: inscripciones_curso; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.inscripciones_curso (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    producto_id text NOT NULL,
    estado public."EstadoInscripcionCurso" DEFAULT 'PreInscrito'::public."EstadoInscripcionCurso" NOT NULL,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    preferencia_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inscripciones_curso OWNER TO mateatletas;

--
-- Name: inscripciones_mensuales; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.inscripciones_mensuales (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    producto_id text NOT NULL,
    tutor_id text NOT NULL,
    anio integer NOT NULL,
    mes integer NOT NULL,
    periodo text NOT NULL,
    precio_base numeric(10,2) NOT NULL,
    descuento_aplicado numeric(10,2) DEFAULT 0 NOT NULL,
    precio_final numeric(10,2) NOT NULL,
    tipo_descuento public.tipo_descuento NOT NULL,
    detalle_calculo text NOT NULL,
    estado_pago public.estado_pago DEFAULT 'Pendiente'::public.estado_pago NOT NULL,
    fecha_vencimiento timestamp(3) without time zone,
    fecha_pago timestamp(3) without time zone,
    metodo_pago text,
    comprobante_url text,
    observaciones text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inscripciones_mensuales OWNER TO mateatletas;

--
-- Name: items_obtenidos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.items_obtenidos (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    item_id text NOT NULL,
    fecha_obtencion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    equipado boolean DEFAULT false NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.items_obtenidos OWNER TO mateatletas;

--
-- Name: items_tienda; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.items_tienda (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    categoria_id text NOT NULL,
    tipo_item public.tipo_item NOT NULL,
    precio_monedas integer DEFAULT 0 NOT NULL,
    precio_gemas integer DEFAULT 0 NOT NULL,
    imagen_url text,
    rareza public.rareza_item DEFAULT 'COMUN'::public.rareza_item NOT NULL,
    edicion_limitada boolean DEFAULT false NOT NULL,
    fecha_inicio timestamp(3) without time zone,
    fecha_fin timestamp(3) without time zone,
    nivel_minimo_requerido integer DEFAULT 1 NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    veces_comprado integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.items_tienda OWNER TO mateatletas;

--
-- Name: lecciones; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.lecciones (
    id text NOT NULL,
    modulo_id text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    tipo_contenido public."TipoContenido" NOT NULL,
    contenido text NOT NULL,
    orden integer NOT NULL,
    puntos_por_completar integer DEFAULT 10 NOT NULL,
    logro_desbloqueable_id text,
    duracion_estimada_minutos integer,
    activo boolean DEFAULT true NOT NULL,
    recursos_adicionales text,
    leccion_prerequisito_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.lecciones OWNER TO mateatletas;

--
-- Name: logros_cursos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.logros_cursos (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    icono text NOT NULL,
    puntos integer DEFAULT 0 NOT NULL,
    imagen_url text,
    requisito text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.logros_cursos OWNER TO mateatletas;

--
-- Name: logros_desbloqueados; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.logros_desbloqueados (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    logro_id text NOT NULL,
    docente_id text,
    fecha_obtenido timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    contexto text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.logros_desbloqueados OWNER TO mateatletas;

--
-- Name: logros_estudiantes_gamificacion; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.logros_estudiantes_gamificacion (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    logro_id text NOT NULL,
    fecha_desbloqueo timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visto boolean DEFAULT false NOT NULL
);


ALTER TABLE public.logros_estudiantes_gamificacion OWNER TO mateatletas;

--
-- Name: logros_gamificacion; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.logros_gamificacion (
    id text NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
    monedas_recompensa integer NOT NULL,
    xp_recompensa integer NOT NULL,
    criterio_tipo text NOT NULL,
    criterio_valor text NOT NULL,
    icono text NOT NULL,
    rareza text NOT NULL,
    secreto boolean DEFAULT false NOT NULL,
    animacion text,
    titulo text,
    badge text,
    mensaje_desbloqueo text,
    extras jsonb,
    orden integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.logros_gamificacion OWNER TO mateatletas;

--
-- Name: membresias; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.membresias (
    id text NOT NULL,
    tutor_id text NOT NULL,
    producto_id text NOT NULL,
    estado public."EstadoMembresia" DEFAULT 'Pendiente'::public."EstadoMembresia" NOT NULL,
    fecha_inicio timestamp(3) without time zone,
    fecha_proximo_pago timestamp(3) without time zone,
    preferencia_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    mercadopago_payment_id text
);


ALTER TABLE public.membresias OWNER TO mateatletas;

--
-- Name: modulos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.modulos (
    id text NOT NULL,
    producto_id text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    orden integer NOT NULL,
    duracion_estimada_minutos integer DEFAULT 0 NOT NULL,
    puntos_totales integer DEFAULT 0 NOT NULL,
    publicado boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.modulos OWNER TO mateatletas;

--
-- Name: niveles_config; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.niveles_config (
    nivel integer NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    puntos_minimos integer NOT NULL,
    puntos_maximos integer NOT NULL,
    color text DEFAULT '#6366F1'::text NOT NULL,
    icono text DEFAULT '🌟'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.niveles_config OWNER TO mateatletas;

--
-- Name: notas; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.notas (
    id text NOT NULL,
    evento_id text NOT NULL,
    contenido text NOT NULL,
    categoria text,
    color text DEFAULT '#8b5cf6'::text NOT NULL
);


ALTER TABLE public.notas OWNER TO mateatletas;

--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.notificaciones (
    id text NOT NULL,
    tipo public.tipo_notificacion NOT NULL,
    titulo text NOT NULL,
    mensaje text NOT NULL,
    leida boolean DEFAULT false NOT NULL,
    docente_id text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notificaciones OWNER TO mateatletas;

--
-- Name: pagos_inscripciones_2026; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.pagos_inscripciones_2026 (
    id text NOT NULL,
    inscripcion_id text NOT NULL,
    tipo text NOT NULL,
    mes text,
    anio integer,
    monto integer NOT NULL,
    estado text DEFAULT 'pending'::text NOT NULL,
    mercadopago_preference_id text,
    mercadopago_payment_id text,
    fecha_vencimiento timestamp(3) without time zone,
    fecha_pago timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    processed_at timestamp(3) without time zone
);


ALTER TABLE public.pagos_inscripciones_2026 OWNER TO mateatletas;

--
-- Name: planificaciones_mensuales; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.planificaciones_mensuales (
    id text NOT NULL,
    grupo_id text NOT NULL,
    mes integer NOT NULL,
    anio integer NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    tematica_principal text NOT NULL,
    objetivos_aprendizaje text[],
    estado public.estado_planificacion DEFAULT 'BORRADOR'::public.estado_planificacion NOT NULL,
    fecha_publicacion timestamp(3) without time zone,
    notas_docentes text,
    created_by_admin_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.planificaciones_mensuales OWNER TO mateatletas;

--
-- Name: planificaciones_simples; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.planificaciones_simples (
    id text NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    grupo_codigo text NOT NULL,
    mes integer,
    anio integer NOT NULL,
    semanas_total integer NOT NULL,
    archivo_path text NOT NULL,
    estado public.estado_planificacion_simple DEFAULT 'DETECTADA'::public.estado_planificacion_simple NOT NULL,
    auto_detectada boolean DEFAULT true NOT NULL,
    fecha_deteccion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ultima_actualizacion timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.planificaciones_simples OWNER TO mateatletas;

--
-- Name: premios_padres; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.premios_padres (
    id text NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
    puntos_requeridos integer NOT NULL,
    costo_real_usd numeric(10,2),
    icono text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.premios_padres OWNER TO mateatletas;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.productos (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    tipo public."TipoProducto" NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_inicio timestamp(3) without time zone,
    fecha_fin timestamp(3) without time zone,
    cupo_maximo integer,
    duracion_meses integer DEFAULT 1,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.productos OWNER TO mateatletas;

--
-- Name: progreso_estudiante_actividad; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.progreso_estudiante_actividad (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    actividad_id text NOT NULL,
    asignacion_id text NOT NULL,
    iniciado boolean DEFAULT false NOT NULL,
    fecha_inicio timestamp(3) without time zone,
    completado boolean DEFAULT false NOT NULL,
    fecha_completado timestamp(3) without time zone,
    puntos_obtenidos integer DEFAULT 0 NOT NULL,
    tiempo_total_minutos integer DEFAULT 0 NOT NULL,
    intentos integer DEFAULT 0 NOT NULL,
    mejor_puntaje integer DEFAULT 0 NOT NULL,
    estado_juego jsonb,
    respuestas_detalle jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.progreso_estudiante_actividad OWNER TO mateatletas;

--
-- Name: progreso_estudiante_planificacion; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.progreso_estudiante_planificacion (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    planificacion_id text NOT NULL,
    semana_actual integer DEFAULT 1 NOT NULL,
    ultima_actividad timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado_guardado jsonb,
    tiempo_total_minutos integer DEFAULT 0 NOT NULL,
    puntos_totales integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.progreso_estudiante_planificacion OWNER TO mateatletas;

--
-- Name: progreso_lecciones; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.progreso_lecciones (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    leccion_id text NOT NULL,
    completada boolean DEFAULT false NOT NULL,
    progreso integer DEFAULT 0 NOT NULL,
    fecha_inicio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_completada timestamp(3) without time zone,
    tiempo_invertido_minutos integer,
    calificacion integer,
    intentos integer DEFAULT 0 NOT NULL,
    notas_estudiante text,
    ultima_respuesta text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.progreso_lecciones OWNER TO mateatletas;

--
-- Name: puntos_obtenidos; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.puntos_obtenidos (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    docente_id text NOT NULL,
    accion_id text NOT NULL,
    clase_id text,
    puntos integer NOT NULL,
    contexto text,
    fecha_otorgado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.puntos_obtenidos OWNER TO mateatletas;

--
-- Name: puntos_padres; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.puntos_padres (
    id text NOT NULL,
    tutor_id text NOT NULL,
    puntos_total integer DEFAULT 0 NOT NULL,
    xp_total integer DEFAULT 0 NOT NULL,
    pagos_puntuales_consecutivos integer DEFAULT 0 NOT NULL,
    total_referidos_activos integer DEFAULT 0 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.puntos_padres OWNER TO mateatletas;

--
-- Name: rachas_estudiantes; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.rachas_estudiantes (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    racha_actual integer DEFAULT 0 NOT NULL,
    racha_maxima integer DEFAULT 0 NOT NULL,
    ultima_actividad timestamp(3) without time zone,
    inicio_racha_actual timestamp(3) without time zone,
    total_dias_activos integer DEFAULT 0 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rachas_estudiantes OWNER TO mateatletas;

--
-- Name: recordatorios; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.recordatorios (
    id text NOT NULL,
    evento_id text NOT NULL,
    completado boolean DEFAULT false NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL
);


ALTER TABLE public.recordatorios OWNER TO mateatletas;

--
-- Name: recursos_estudiante; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.recursos_estudiante (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    xp_total integer DEFAULT 0 NOT NULL,
    monedas_total integer DEFAULT 0 NOT NULL,
    ultima_actualizacion timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recursos_estudiante OWNER TO mateatletas;

--
-- Name: rutas_curriculares; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.rutas_curriculares (
    id text NOT NULL,
    nombre text NOT NULL,
    color text,
    descripcion text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rutas_curriculares OWNER TO mateatletas;

--
-- Name: rutas_especialidad; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.rutas_especialidad (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    "sectorId" text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rutas_especialidad OWNER TO mateatletas;

--
-- Name: secret_rotations; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.secret_rotations (
    id text NOT NULL,
    secret_type text NOT NULL,
    version integer NOT NULL,
    secret_hash text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    rotated_at timestamp(3) without time zone,
    rotated_by text,
    metadata jsonb
);


ALTER TABLE public.secret_rotations OWNER TO mateatletas;

--
-- Name: sectores; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.sectores (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    color text DEFAULT '#6366F1'::text NOT NULL,
    icono text DEFAULT '📚'::text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sectores OWNER TO mateatletas;

--
-- Name: semanas_activas; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.semanas_activas (
    id text NOT NULL,
    asignacion_id text NOT NULL,
    numero_semana integer NOT NULL,
    activa boolean DEFAULT false NOT NULL,
    fecha_activacion timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.semanas_activas OWNER TO mateatletas;

--
-- Name: solicitudes_canje; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.solicitudes_canje (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    tutor_id text NOT NULL,
    curso_id text NOT NULL,
    monedas_usadas integer NOT NULL,
    estado text NOT NULL,
    fecha_decision timestamp(3) without time zone,
    opcion_pago text,
    monto_padre numeric(10,2),
    mensaje_padre text,
    fecha_solicitud timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_expiracion timestamp(3) without time zone
);


ALTER TABLE public.solicitudes_canje OWNER TO mateatletas;

--
-- Name: tareas; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.tareas (
    id text NOT NULL,
    evento_id text NOT NULL,
    estado public.estado_tarea DEFAULT 'PENDIENTE'::public.estado_tarea NOT NULL,
    prioridad public.prioridad_tarea DEFAULT 'MEDIA'::public.prioridad_tarea NOT NULL,
    porcentaje_completado integer DEFAULT 0 NOT NULL,
    categoria text,
    etiquetas text[],
    subtareas jsonb DEFAULT '[]'::jsonb NOT NULL,
    archivos jsonb DEFAULT '[]'::jsonb NOT NULL,
    clase_relacionada_id text,
    estudiante_relacionado_id text,
    tiempo_estimado_minutos integer,
    tiempo_real_minutos integer,
    recurrencia jsonb,
    recordatorios jsonb DEFAULT '[]'::jsonb NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public.tareas OWNER TO mateatletas;

--
-- Name: transacciones_puntos_padres; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.transacciones_puntos_padres (
    id text NOT NULL,
    puntos_padre_id text NOT NULL,
    tipo_recurso text NOT NULL,
    cantidad integer NOT NULL,
    razon text NOT NULL,
    metadata jsonb,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transacciones_puntos_padres OWNER TO mateatletas;

--
-- Name: transacciones_recurso; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.transacciones_recurso (
    id text NOT NULL,
    recursos_estudiante_id text NOT NULL,
    tipo_recurso public.tipo_recurso NOT NULL,
    cantidad integer NOT NULL,
    razon text NOT NULL,
    metadata jsonb,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transacciones_recurso OWNER TO mateatletas;

--
-- Name: tutores; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.tutores (
    id text NOT NULL,
    username text,
    email text,
    password_hash text NOT NULL,
    password_temporal text,
    debe_cambiar_password boolean DEFAULT true NOT NULL,
    debe_completar_perfil boolean DEFAULT false NOT NULL,
    fecha_ultimo_cambio timestamp(3) without time zone,
    nombre text NOT NULL,
    apellido text NOT NULL,
    dni text,
    cuil text,
    telefono text,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ha_completado_onboarding boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    roles jsonb DEFAULT '["tutor"]'::jsonb NOT NULL
);


ALTER TABLE public.tutores OWNER TO mateatletas;

--
-- Name: webhooks_processed; Type: TABLE; Schema: public; Owner: mateatletas
--

CREATE TABLE public.webhooks_processed (
    id text NOT NULL,
    payment_id text NOT NULL,
    webhook_type text NOT NULL,
    status text NOT NULL,
    external_reference text NOT NULL,
    processed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.webhooks_processed OWNER TO mateatletas;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fe750225-edc2-4770-88a2-d47655e077c0	b45dd446ff01573eb3154c0e84c87d2fadf87860b276ca140e33af304392e37a	2025-11-18 13:27:33.890348-03	20251118132555_add_processed_at_to_pagos		\N	2025-11-18 13:27:33.890348-03	0
f652e28d-d24e-43c0-9ba9-e2e6796052f3	bdbfc7455bafa1873485dc6048231ff5a9348c9e312ca6842b30548ff2ff7270	\N	20250110_add_colonia_verano_2026	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250110_add_colonia_verano_2026\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "colonia_inscripciones" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"colonia_inscripciones\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1177), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250110_add_colonia_verano_2026"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250110_add_colonia_verano_2026"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	\N	2025-11-21 11:10:10.616373-03	0
\.


--
-- Data for Name: acciones_puntuables; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.acciones_puntuables (id, nombre, descripcion, puntos, activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: actividades_semanales; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.actividades_semanales (id, planificacion_id, semana_numero, titulo, descripcion, componente_nombre, componente_props, nivel_dificultad, tiempo_estimado_minutos, puntos_gamificacion, instrucciones_docente, instrucciones_estudiante, recursos_url, orden, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.admins (id, email, password_hash, password_temporal, debe_cambiar_password, fecha_ultimo_cambio, nombre, apellido, fecha_registro, "createdAt", "updatedAt", dni, roles, telefono, mfa_backup_codes, mfa_enabled, mfa_secret) FROM stdin;
\.


--
-- Data for Name: alertas; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.alertas (id, estudiante_id, clase_id, descripcion, fecha, resuelta, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asignaciones_actividad_estudiante; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.asignaciones_actividad_estudiante (id, asignacion_docente_id, actividad_id, clase_grupo_id, fecha_inicio, fecha_fin, estado, mensaje_semana, notificado_estudiantes, fecha_notificacion_estudiantes, notificado_tutores, fecha_notificacion_tutores, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asignaciones_docente; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.asignaciones_docente (id, planificacion_id, clase_grupo_id, docente_id, activo, fecha_asignacion, mensaje_docente, fecha_inicio_custom, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asignaciones_planificacion; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.asignaciones_planificacion (id, planificacion_id, docente_id, clase_grupo_id, fecha_asignacion, activa, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.asistencias (id, clase_id, estudiante_id, estado, observaciones, puntos_otorgados, fecha_registro, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asistencias_clase_grupo; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.asistencias_clase_grupo (id, clase_grupo_id, estudiante_id, fecha, estado, observaciones, feedback, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.audit_logs (id, "timestamp", user_id, user_type, user_email, action, entity_type, entity_id, description, changes, metadata, severity, category, ip_address, user_agent, request_id, created_at) FROM stdin;
\.


--
-- Data for Name: becas; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.becas (id, estudiante_id, tipo_beca, descuento_tipo, descuento_valor, productos_aplica, fecha_inicio, fecha_fin, activa, motivo_beca, aprobada_por_admin_id, observaciones, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: canjes_padres; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.canjes_padres (id, tutor_id, premio_id, puntos_padre_id, puntos_usados, estado, fecha_canje) FROM stdin;
\.


--
-- Data for Name: categorias_item; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.categorias_item (id, nombre, descripcion, icono, orden, activa, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ciclo_mundos_seleccionados_2026; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.ciclo_mundos_seleccionados_2026 (id, estudiante_inscripcion_id, mundo, dia_semana, horario, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: clase_grupos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.clase_grupos (id, codigo, nombre, tipo, dia_semana, hora_inicio, hora_fin, fecha_inicio, fecha_fin, anio_lectivo, cupo_maximo, grupo_id, docente_id, ruta_curricular_id, sector_id, nivel, activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: clases; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.clases (id, ruta_curricular_id, docente_id, fecha_hora_inicio, duracion_minutos, estado, cupos_maximo, cupos_ocupados, producto_id, "createdAt", "updatedAt", descripcion, nombre, sector_id) FROM stdin;
\.


--
-- Data for Name: colonia_cursos_seleccionados_2026; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.colonia_cursos_seleccionados_2026 (id, estudiante_inscripcion_id, course_id, course_name, course_area, instructor, day_of_week, time_slot, precio_base, precio_con_descuento, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_estudiante_cursos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.colonia_estudiante_cursos (id, colonia_estudiante_id, course_id, course_name, course_area, instructor, day_of_week, time_slot, precio_base, precio_con_descuento, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_estudiantes; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.colonia_estudiantes (id, inscripcion_id, estudiante_id, nombre, edad, pin, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_inscripciones; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.colonia_inscripciones (id, tutor_id, estado, descuento_aplicado, total_mensual, fecha_inscripcion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_pagos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.colonia_pagos (id, inscripcion_id, mes, anio, monto, estado, mercadopago_preference_id, mercadopago_payment_id, fecha_vencimiento, fecha_pago, fecha_creacion, "createdAt", "updatedAt", processed_at) FROM stdin;
\.


--
-- Data for Name: compras_item; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.compras_item (id, recursos_estudiante_id, item_id, monedas_gastadas, gemas_gastadas, fecha_compra, "createdAt") FROM stdin;
\.


--
-- Data for Name: configuracion_precios; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.configuracion_precios (id, precio_club_matematicas, precio_cursos_especializados, precio_multiple_actividades, precio_hermanos_basico, precio_hermanos_multiple, descuento_aacrea_porcentaje, descuento_aacrea_activo, dia_vencimiento, dias_antes_recordatorio, notificaciones_activas, actualizado_por_admin_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cursos_catalogo; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.cursos_catalogo (id, codigo, titulo, descripcion, categoria, subcategoria, duracion_clases, nivel_requerido, contenido, precio_usd, precio_monedas, imagen_url, video_preview_url, destacado, nuevo, activo, orden, total_canjes, rating, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cursos_estudiantes; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.cursos_estudiantes (id, estudiante_id, curso_id, progreso, completado, fecha_inicio, fecha_completado) FROM stdin;
\.


--
-- Data for Name: docentes; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.docentes (id, email, password_hash, password_temporal, nombre, apellido, titulo, bio, "createdAt", "updatedAt", disponibilidad_horaria, especialidades, estado, experiencia_anos, nivel_educativo, roles, telefono, debe_cambiar_password, fecha_ultimo_cambio) FROM stdin;
\.


--
-- Data for Name: docentes_rutas; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.docentes_rutas (id, "docenteId", "rutaId", "sectorId", "asignadoEn") FROM stdin;
\.


--
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.equipos (id, nombre, color_primario, color_secundario, icono_url, puntos_totales, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: estudiante_sectores; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.estudiante_sectores (id, estudiante_id, sector_id, es_principal, fecha_inicio, fecha_fin, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: estudiantes; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.estudiantes (id, username, nombre, apellido, nivel_escolar, avatar_url, animacion_idle_url, foto_url, tutor_id, equipo_id, puntos_totales, nivel_actual, "createdAt", "updatedAt", avatar_gradient, edad, email, password_hash, password_temporal, debe_cambiar_password, fecha_ultimo_cambio, roles, sector_id) FROM stdin;
\.


--
-- Data for Name: estudiantes_inscripciones_2026; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.estudiantes_inscripciones_2026 (id, inscripcion_id, estudiante_id, nombre, edad, dni, pin, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.eventos (id, titulo, descripcion, tipo, fecha_inicio, fecha_fin, es_todo_el_dia, docente_id, clase_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: grupos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.grupos (id, codigo, nombre, descripcion, edad_minima, edad_maxima, sector_id, link_meet, activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: historial_cambio_precios; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.historial_cambio_precios (id, configuracion_id, valores_anteriores, valores_nuevos, motivo_cambio, admin_id, fecha_cambio) FROM stdin;
\.


--
-- Data for Name: historial_estado_inscripciones_2026; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.historial_estado_inscripciones_2026 (id, inscripcion_id, estado_anterior, estado_nuevo, razon, realizado_por, fecha_cambio) FROM stdin;
\.


--
-- Data for Name: inscripciones_2026; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.inscripciones_2026 (id, tutor_id, tipo_inscripcion, estado, inscripcion_pagada, descuento_aplicado, total_mensual_actual, origen_inscripcion, ciudad, fecha_inscripcion, fecha_inicio, fecha_fin, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inscripciones_clase; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.inscripciones_clase (id, clase_id, estudiante_id, tutor_id, fecha_inscripcion, observaciones, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inscripciones_clase_grupo; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.inscripciones_clase_grupo (id, clase_grupo_id, estudiante_id, tutor_id, fecha_inscripcion, fecha_baja, observaciones, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inscripciones_curso; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.inscripciones_curso (id, estudiante_id, producto_id, estado, fecha_inscripcion, preferencia_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inscripciones_mensuales; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.inscripciones_mensuales (id, estudiante_id, producto_id, tutor_id, anio, mes, periodo, precio_base, descuento_aplicado, precio_final, tipo_descuento, detalle_calculo, estado_pago, fecha_vencimiento, fecha_pago, metodo_pago, comprobante_url, observaciones, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: items_obtenidos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.items_obtenidos (id, estudiante_id, item_id, fecha_obtencion, equipado, cantidad, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: items_tienda; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.items_tienda (id, nombre, descripcion, categoria_id, tipo_item, precio_monedas, precio_gemas, imagen_url, rareza, edicion_limitada, fecha_inicio, fecha_fin, nivel_minimo_requerido, disponible, veces_comprado, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lecciones; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.lecciones (id, modulo_id, titulo, descripcion, tipo_contenido, contenido, orden, puntos_por_completar, logro_desbloqueable_id, duracion_estimada_minutos, activo, recursos_adicionales, leccion_prerequisito_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: logros_cursos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.logros_cursos (id, nombre, descripcion, icono, puntos, imagen_url, requisito, activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: logros_desbloqueados; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.logros_desbloqueados (id, estudiante_id, logro_id, docente_id, fecha_obtenido, contexto, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: logros_estudiantes_gamificacion; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.logros_estudiantes_gamificacion (id, estudiante_id, logro_id, fecha_desbloqueo, visto) FROM stdin;
\.


--
-- Data for Name: logros_gamificacion; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.logros_gamificacion (id, codigo, nombre, descripcion, categoria, monedas_recompensa, xp_recompensa, criterio_tipo, criterio_valor, icono, rareza, secreto, animacion, titulo, badge, mensaje_desbloqueo, extras, orden, activo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: membresias; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.membresias (id, tutor_id, producto_id, estado, fecha_inicio, fecha_proximo_pago, preferencia_id, "createdAt", "updatedAt", mercadopago_payment_id) FROM stdin;
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.modulos (id, producto_id, titulo, descripcion, orden, duracion_estimada_minutos, puntos_totales, publicado, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: niveles_config; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.niveles_config (nivel, nombre, descripcion, puntos_minimos, puntos_maximos, color, icono, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notas; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.notas (id, evento_id, contenido, categoria, color) FROM stdin;
\.


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.notificaciones (id, tipo, titulo, mensaje, leida, docente_id, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: pagos_inscripciones_2026; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.pagos_inscripciones_2026 (id, inscripcion_id, tipo, mes, anio, monto, estado, mercadopago_preference_id, mercadopago_payment_id, fecha_vencimiento, fecha_pago, "createdAt", "updatedAt", processed_at) FROM stdin;
\.


--
-- Data for Name: planificaciones_mensuales; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.planificaciones_mensuales (id, grupo_id, mes, anio, titulo, descripcion, tematica_principal, objetivos_aprendizaje, estado, fecha_publicacion, notas_docentes, created_by_admin_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: planificaciones_simples; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.planificaciones_simples (id, codigo, titulo, grupo_codigo, mes, anio, semanas_total, archivo_path, estado, auto_detectada, fecha_deteccion, ultima_actualizacion) FROM stdin;
cmi4w0hqk00008jgu1oxe6v42	2025-11-mes-ciencia-astronomia	Mes de la Ciencia - Semana 2: Observatorio Galáctico	TODOS	11	2025	4	2025-11-mes-ciencia-astronomia/index.tsx	DETECTADA	t	2025-11-18 18:08:47.564	2025-11-18 18:38:10.361
cmi4w0hqo00018jguanvbvjt8	2025-11-mes-ciencia-fisica	Mes de la Ciencia - Semana 3: Laboratorio de Física	TODOS	11	2025	4	2025-11-mes-ciencia-fisica/index.tsx	DETECTADA	t	2025-11-18 18:08:47.569	2025-11-18 18:38:10.368
cmi4w0hqr00028jguc15hy0si	2025-11-mes-ciencia-informatica	Mes de la Ciencia - Semana 4: Ciberseguridad	TODOS	11	2025	4	2025-11-mes-ciencia-informatica/index.tsx	DETECTADA	t	2025-11-18 18:08:47.572	2025-11-18 18:38:10.371
cmi4w0hqu00038jgulkmmzt4b	2025-11-mes-ciencia-quimica	Mes de la Ciencia - Semana 1: Laboratorio Químico	TODOS	11	2025	4	2025-11-mes-ciencia-quimica/index.tsx	DETECTADA	t	2025-11-18 18:08:47.575	2025-11-18 18:38:10.373
cmi4w0hqx00048jguyiwtlwur	ejemplo-minimo	Ejemplo Mínimo - Planificación de Prueba	B1	11	2025	2	ejemplo-minimo.tsx	DETECTADA	t	2025-11-18 18:08:47.577	2025-11-18 18:38:10.376
\.


--
-- Data for Name: premios_padres; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.premios_padres (id, codigo, titulo, descripcion, categoria, puntos_requeridos, costo_real_usd, icono, activo, orden, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.productos (id, nombre, descripcion, precio, tipo, activo, fecha_inicio, fecha_fin, cupo_maximo, duracion_meses, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: progreso_estudiante_actividad; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.progreso_estudiante_actividad (id, estudiante_id, actividad_id, asignacion_id, iniciado, fecha_inicio, completado, fecha_completado, puntos_obtenidos, tiempo_total_minutos, intentos, mejor_puntaje, estado_juego, respuestas_detalle, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progreso_estudiante_planificacion; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.progreso_estudiante_planificacion (id, estudiante_id, planificacion_id, semana_actual, ultima_actividad, estado_guardado, tiempo_total_minutos, puntos_totales, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: progreso_lecciones; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.progreso_lecciones (id, estudiante_id, leccion_id, completada, progreso, fecha_inicio, fecha_completada, tiempo_invertido_minutos, calificacion, intentos, notas_estudiante, ultima_respuesta, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: puntos_obtenidos; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.puntos_obtenidos (id, estudiante_id, docente_id, accion_id, clase_id, puntos, contexto, fecha_otorgado, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: puntos_padres; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.puntos_padres (id, tutor_id, puntos_total, xp_total, pagos_puntuales_consecutivos, total_referidos_activos, updated_at) FROM stdin;
\.


--
-- Data for Name: rachas_estudiantes; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.rachas_estudiantes (id, estudiante_id, racha_actual, racha_maxima, ultima_actividad, inicio_racha_actual, total_dias_activos, updated_at) FROM stdin;
\.


--
-- Data for Name: recordatorios; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.recordatorios (id, evento_id, completado, color) FROM stdin;
\.


--
-- Data for Name: recursos_estudiante; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.recursos_estudiante (id, estudiante_id, xp_total, monedas_total, ultima_actualizacion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rutas_curriculares; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.rutas_curriculares (id, nombre, color, descripcion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: rutas_especialidad; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.rutas_especialidad (id, nombre, descripcion, "sectorId", activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: secret_rotations; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.secret_rotations (id, secret_type, version, secret_hash, status, created_at, expires_at, rotated_at, rotated_by, metadata) FROM stdin;
cmia9h7be00008jbzw79594u9	JWT_SECRET	1	d3467e955fd61f4635246850c8980b918b153e5c5115fb0d3b0e0191b208cc7f	active	2025-11-22 12:24:33.097	2026-02-20 12:24:33.097	\N	\N	\N
cmia9h7bg00018jbza6c6qzru	WEBHOOK_SECRET	1	890ecf2afd53817aef613d4866b433545fdc2132a90f1001f921d58b94fac4af	active	2025-11-22 12:24:33.1	2026-02-20 12:24:33.1	\N	\N	\N
\.


--
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.sectores (id, nombre, descripcion, color, icono, activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: semanas_activas; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.semanas_activas (id, asignacion_id, numero_semana, activa, fecha_activacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: solicitudes_canje; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.solicitudes_canje (id, estudiante_id, tutor_id, curso_id, monedas_usadas, estado, fecha_decision, opcion_pago, monto_padre, mensaje_padre, fecha_solicitud, fecha_expiracion) FROM stdin;
\.


--
-- Data for Name: tareas; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.tareas (id, evento_id, estado, prioridad, porcentaje_completado, categoria, etiquetas, subtareas, archivos, clase_relacionada_id, estudiante_relacionado_id, tiempo_estimado_minutos, tiempo_real_minutos, recurrencia, recordatorios, "completedAt") FROM stdin;
\.


--
-- Data for Name: transacciones_puntos_padres; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.transacciones_puntos_padres (id, puntos_padre_id, tipo_recurso, cantidad, razon, metadata, fecha) FROM stdin;
\.


--
-- Data for Name: transacciones_recurso; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.transacciones_recurso (id, recursos_estudiante_id, tipo_recurso, cantidad, razon, metadata, fecha, "createdAt") FROM stdin;
\.


--
-- Data for Name: tutores; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.tutores (id, username, email, password_hash, password_temporal, debe_cambiar_password, debe_completar_perfil, fecha_ultimo_cambio, nombre, apellido, dni, cuil, telefono, fecha_registro, ha_completado_onboarding, "createdAt", "updatedAt", roles) FROM stdin;
\.


--
-- Data for Name: webhooks_processed; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.webhooks_processed (id, payment_id, webhook_type, status, external_reference, processed_at, created_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: acciones_puntuables acciones_puntuables_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.acciones_puntuables
    ADD CONSTRAINT acciones_puntuables_pkey PRIMARY KEY (id);


--
-- Name: actividades_semanales actividades_semanales_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.actividades_semanales
    ADD CONSTRAINT actividades_semanales_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: alertas alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_actividad_estudiante asignaciones_actividad_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_actividad_estudiante
    ADD CONSTRAINT asignaciones_actividad_estudiante_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_docente asignaciones_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_docente
    ADD CONSTRAINT asignaciones_docente_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_planificacion asignaciones_planificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_pkey PRIMARY KEY (id);


--
-- Name: asistencias_clase_grupo asistencias_clase_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asistencias_clase_grupo
    ADD CONSTRAINT asistencias_clase_grupo_pkey PRIMARY KEY (id);


--
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: becas becas_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.becas
    ADD CONSTRAINT becas_pkey PRIMARY KEY (id);


--
-- Name: canjes_padres canjes_padres_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.canjes_padres
    ADD CONSTRAINT canjes_padres_pkey PRIMARY KEY (id);


--
-- Name: categorias_item categorias_item_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.categorias_item
    ADD CONSTRAINT categorias_item_pkey PRIMARY KEY (id);


--
-- Name: ciclo_mundos_seleccionados_2026 ciclo_mundos_seleccionados_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.ciclo_mundos_seleccionados_2026
    ADD CONSTRAINT ciclo_mundos_seleccionados_2026_pkey PRIMARY KEY (id);


--
-- Name: clase_grupos clase_grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_pkey PRIMARY KEY (id);


--
-- Name: clases clases_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_pkey PRIMARY KEY (id);


--
-- Name: colonia_cursos_seleccionados_2026 colonia_cursos_seleccionados_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_cursos_seleccionados_2026
    ADD CONSTRAINT colonia_cursos_seleccionados_2026_pkey PRIMARY KEY (id);


--
-- Name: colonia_estudiante_cursos colonia_estudiante_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_estudiante_cursos
    ADD CONSTRAINT colonia_estudiante_cursos_pkey PRIMARY KEY (id);


--
-- Name: colonia_estudiantes colonia_estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_estudiantes
    ADD CONSTRAINT colonia_estudiantes_pkey PRIMARY KEY (id);


--
-- Name: colonia_inscripciones colonia_inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_inscripciones
    ADD CONSTRAINT colonia_inscripciones_pkey PRIMARY KEY (id);


--
-- Name: colonia_pagos colonia_pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_pagos
    ADD CONSTRAINT colonia_pagos_pkey PRIMARY KEY (id);


--
-- Name: compras_item compras_item_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.compras_item
    ADD CONSTRAINT compras_item_pkey PRIMARY KEY (id);


--
-- Name: configuracion_precios configuracion_precios_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.configuracion_precios
    ADD CONSTRAINT configuracion_precios_pkey PRIMARY KEY (id);


--
-- Name: cursos_catalogo cursos_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.cursos_catalogo
    ADD CONSTRAINT cursos_catalogo_pkey PRIMARY KEY (id);


--
-- Name: cursos_estudiantes cursos_estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.cursos_estudiantes
    ADD CONSTRAINT cursos_estudiantes_pkey PRIMARY KEY (id);


--
-- Name: docentes docentes_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.docentes
    ADD CONSTRAINT docentes_pkey PRIMARY KEY (id);


--
-- Name: docentes_rutas docentes_rutas_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT docentes_rutas_pkey PRIMARY KEY (id);


--
-- Name: equipos equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_pkey PRIMARY KEY (id);


--
-- Name: estudiante_sectores estudiante_sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiante_sectores
    ADD CONSTRAINT estudiante_sectores_pkey PRIMARY KEY (id);


--
-- Name: estudiantes_inscripciones_2026 estudiantes_inscripciones_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes_inscripciones_2026
    ADD CONSTRAINT estudiantes_inscripciones_2026_pkey PRIMARY KEY (id);


--
-- Name: estudiantes estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_pkey PRIMARY KEY (id);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- Name: grupos grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_pkey PRIMARY KEY (id);


--
-- Name: historial_cambio_precios historial_cambio_precios_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.historial_cambio_precios
    ADD CONSTRAINT historial_cambio_precios_pkey PRIMARY KEY (id);


--
-- Name: historial_estado_inscripciones_2026 historial_estado_inscripciones_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.historial_estado_inscripciones_2026
    ADD CONSTRAINT historial_estado_inscripciones_2026_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_2026 inscripciones_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_2026
    ADD CONSTRAINT inscripciones_2026_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_clase inscripciones_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_curso inscripciones_curso_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_curso
    ADD CONSTRAINT inscripciones_curso_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_mensuales inscripciones_mensuales_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_pkey PRIMARY KEY (id);


--
-- Name: items_obtenidos items_obtenidos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.items_obtenidos
    ADD CONSTRAINT items_obtenidos_pkey PRIMARY KEY (id);


--
-- Name: items_tienda items_tienda_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.items_tienda
    ADD CONSTRAINT items_tienda_pkey PRIMARY KEY (id);


--
-- Name: lecciones lecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.lecciones
    ADD CONSTRAINT lecciones_pkey PRIMARY KEY (id);


--
-- Name: logros_cursos logros_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_cursos
    ADD CONSTRAINT logros_cursos_pkey PRIMARY KEY (id);


--
-- Name: logros_desbloqueados logros_desbloqueados_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_desbloqueados
    ADD CONSTRAINT logros_desbloqueados_pkey PRIMARY KEY (id);


--
-- Name: logros_estudiantes_gamificacion logros_estudiantes_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_estudiantes_gamificacion
    ADD CONSTRAINT logros_estudiantes_gamificacion_pkey PRIMARY KEY (id);


--
-- Name: logros_gamificacion logros_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_gamificacion
    ADD CONSTRAINT logros_gamificacion_pkey PRIMARY KEY (id);


--
-- Name: membresias membresias_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_pkey PRIMARY KEY (id);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (id);


--
-- Name: niveles_config niveles_config_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.niveles_config
    ADD CONSTRAINT niveles_config_pkey PRIMARY KEY (nivel);


--
-- Name: notas notas_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.notas
    ADD CONSTRAINT notas_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: pagos_inscripciones_2026 pagos_inscripciones_2026_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.pagos_inscripciones_2026
    ADD CONSTRAINT pagos_inscripciones_2026_pkey PRIMARY KEY (id);


--
-- Name: planificaciones_mensuales planificaciones_mensuales_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.planificaciones_mensuales
    ADD CONSTRAINT planificaciones_mensuales_pkey PRIMARY KEY (id);


--
-- Name: planificaciones_simples planificaciones_simples_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.planificaciones_simples
    ADD CONSTRAINT planificaciones_simples_pkey PRIMARY KEY (id);


--
-- Name: premios_padres premios_padres_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.premios_padres
    ADD CONSTRAINT premios_padres_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: progreso_estudiante_actividad progreso_estudiante_actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_actividad
    ADD CONSTRAINT progreso_estudiante_actividad_pkey PRIMARY KEY (id);


--
-- Name: progreso_estudiante_planificacion progreso_estudiante_planificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_planificacion
    ADD CONSTRAINT progreso_estudiante_planificacion_pkey PRIMARY KEY (id);


--
-- Name: progreso_lecciones progreso_lecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_lecciones
    ADD CONSTRAINT progreso_lecciones_pkey PRIMARY KEY (id);


--
-- Name: puntos_obtenidos puntos_obtenidos_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_pkey PRIMARY KEY (id);


--
-- Name: puntos_padres puntos_padres_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_padres
    ADD CONSTRAINT puntos_padres_pkey PRIMARY KEY (id);


--
-- Name: rachas_estudiantes rachas_estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.rachas_estudiantes
    ADD CONSTRAINT rachas_estudiantes_pkey PRIMARY KEY (id);


--
-- Name: recordatorios recordatorios_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_pkey PRIMARY KEY (id);


--
-- Name: recursos_estudiante recursos_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.recursos_estudiante
    ADD CONSTRAINT recursos_estudiante_pkey PRIMARY KEY (id);


--
-- Name: rutas_curriculares rutas_curriculares_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.rutas_curriculares
    ADD CONSTRAINT rutas_curriculares_pkey PRIMARY KEY (id);


--
-- Name: rutas_especialidad rutas_especialidad_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.rutas_especialidad
    ADD CONSTRAINT rutas_especialidad_pkey PRIMARY KEY (id);


--
-- Name: secret_rotations secret_rotations_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.secret_rotations
    ADD CONSTRAINT secret_rotations_pkey PRIMARY KEY (id);


--
-- Name: sectores sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_pkey PRIMARY KEY (id);


--
-- Name: semanas_activas semanas_activas_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.semanas_activas
    ADD CONSTRAINT semanas_activas_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_canje solicitudes_canje_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.solicitudes_canje
    ADD CONSTRAINT solicitudes_canje_pkey PRIMARY KEY (id);


--
-- Name: tareas tareas_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_pkey PRIMARY KEY (id);


--
-- Name: transacciones_puntos_padres transacciones_puntos_padres_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.transacciones_puntos_padres
    ADD CONSTRAINT transacciones_puntos_padres_pkey PRIMARY KEY (id);


--
-- Name: transacciones_recurso transacciones_recurso_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.transacciones_recurso
    ADD CONSTRAINT transacciones_recurso_pkey PRIMARY KEY (id);


--
-- Name: tutores tutores_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.tutores
    ADD CONSTRAINT tutores_pkey PRIMARY KEY (id);


--
-- Name: webhooks_processed webhooks_processed_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.webhooks_processed
    ADD CONSTRAINT webhooks_processed_pkey PRIMARY KEY (id);


--
-- Name: acciones_puntuables_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX acciones_puntuables_nombre_key ON public.acciones_puntuables USING btree (nombre);


--
-- Name: actividades_semanales_planificacion_id_semana_numero_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX actividades_semanales_planificacion_id_semana_numero_idx ON public.actividades_semanales USING btree (planificacion_id, semana_numero);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: alertas_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX alertas_estudiante_id_idx ON public.alertas USING btree (estudiante_id);


--
-- Name: alertas_fecha_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX alertas_fecha_idx ON public.alertas USING btree (fecha);


--
-- Name: alertas_resuelta_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX alertas_resuelta_idx ON public.alertas USING btree (resuelta);


--
-- Name: asignaciones_actividad_estudiante_asignacion_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asignaciones_actividad_estudiante_asignacion_docente_id_idx ON public.asignaciones_actividad_estudiante USING btree (asignacion_docente_id);


--
-- Name: asignaciones_actividad_estudiante_clase_grupo_id_fecha_inic_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asignaciones_actividad_estudiante_clase_grupo_id_fecha_inic_idx ON public.asignaciones_actividad_estudiante USING btree (clase_grupo_id, fecha_inicio);


--
-- Name: asignaciones_docente_clase_grupo_id_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asignaciones_docente_clase_grupo_id_docente_id_idx ON public.asignaciones_docente USING btree (clase_grupo_id, docente_id);


--
-- Name: asignaciones_docente_planificacion_id_clase_grupo_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX asignaciones_docente_planificacion_id_clase_grupo_id_key ON public.asignaciones_docente USING btree (planificacion_id, clase_grupo_id);


--
-- Name: asignaciones_planificacion_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asignaciones_planificacion_docente_id_idx ON public.asignaciones_planificacion USING btree (docente_id);


--
-- Name: asignaciones_planificacion_planificacion_id_clase_grupo_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX asignaciones_planificacion_planificacion_id_clase_grupo_id_key ON public.asignaciones_planificacion USING btree (planificacion_id, clase_grupo_id);


--
-- Name: asistencias_clase_grupo_clase_grupo_id_estudiante_id_fecha_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX asistencias_clase_grupo_clase_grupo_id_estudiante_id_fecha_key ON public.asistencias_clase_grupo USING btree (clase_grupo_id, estudiante_id, fecha);


--
-- Name: asistencias_clase_grupo_clase_grupo_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asistencias_clase_grupo_clase_grupo_id_idx ON public.asistencias_clase_grupo USING btree (clase_grupo_id);


--
-- Name: asistencias_clase_grupo_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asistencias_clase_grupo_estudiante_id_idx ON public.asistencias_clase_grupo USING btree (estudiante_id);


--
-- Name: asistencias_clase_grupo_fecha_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asistencias_clase_grupo_fecha_idx ON public.asistencias_clase_grupo USING btree (fecha);


--
-- Name: asistencias_clase_id_estudiante_id_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asistencias_clase_id_estudiante_id_estado_idx ON public.asistencias USING btree (clase_id, estudiante_id, estado);


--
-- Name: asistencias_clase_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX asistencias_clase_id_estudiante_id_key ON public.asistencias USING btree (clase_id, estudiante_id);


--
-- Name: asistencias_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asistencias_estado_idx ON public.asistencias USING btree (estado);


--
-- Name: asistencias_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asistencias_estudiante_id_idx ON public.asistencias USING btree (estudiante_id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_category_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_category_idx ON public.audit_logs USING btree (category);


--
-- Name: audit_logs_entity_type_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_entity_type_idx ON public.audit_logs USING btree (entity_type);


--
-- Name: audit_logs_severity_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_severity_idx ON public.audit_logs USING btree (severity);


--
-- Name: audit_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_timestamp_idx ON public.audit_logs USING btree ("timestamp");


--
-- Name: audit_logs_user_email_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_user_email_idx ON public.audit_logs USING btree (user_email);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: becas_activa_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX becas_activa_idx ON public.becas USING btree (activa);


--
-- Name: becas_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX becas_estudiante_id_idx ON public.becas USING btree (estudiante_id);


--
-- Name: canjes_padres_fecha_canje_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX canjes_padres_fecha_canje_idx ON public.canjes_padres USING btree (fecha_canje);


--
-- Name: canjes_padres_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX canjes_padres_tutor_id_idx ON public.canjes_padres USING btree (tutor_id);


--
-- Name: categorias_item_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX categorias_item_nombre_key ON public.categorias_item USING btree (nombre);


--
-- Name: ciclo_mundos_seleccionados_2026_estudiante_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX ciclo_mundos_seleccionados_2026_estudiante_inscripcion_id_idx ON public.ciclo_mundos_seleccionados_2026 USING btree (estudiante_inscripcion_id);


--
-- Name: ciclo_mundos_seleccionados_2026_mundo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX ciclo_mundos_seleccionados_2026_mundo_idx ON public.ciclo_mundos_seleccionados_2026 USING btree (mundo);


--
-- Name: clase_grupos_activo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clase_grupos_activo_idx ON public.clase_grupos USING btree (activo);


--
-- Name: clase_grupos_anio_lectivo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clase_grupos_anio_lectivo_idx ON public.clase_grupos USING btree (anio_lectivo);


--
-- Name: clase_grupos_dia_semana_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clase_grupos_dia_semana_idx ON public.clase_grupos USING btree (dia_semana);


--
-- Name: clase_grupos_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clase_grupos_docente_id_idx ON public.clase_grupos USING btree (docente_id);


--
-- Name: clase_grupos_fecha_inicio_fecha_fin_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clase_grupos_fecha_inicio_fecha_fin_idx ON public.clase_grupos USING btree (fecha_inicio, fecha_fin);


--
-- Name: clase_grupos_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX clase_grupos_nombre_key ON public.clase_grupos USING btree (nombre);


--
-- Name: clases_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clases_docente_id_idx ON public.clases USING btree (docente_id);


--
-- Name: clases_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clases_estado_idx ON public.clases USING btree (estado);


--
-- Name: clases_fecha_hora_inicio_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clases_fecha_hora_inicio_idx ON public.clases USING btree (fecha_hora_inicio);


--
-- Name: clases_producto_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX clases_producto_id_idx ON public.clases USING btree (producto_id);


--
-- Name: colonia_cursos_seleccionados_2026_course_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_cursos_seleccionados_2026_course_id_idx ON public.colonia_cursos_seleccionados_2026 USING btree (course_id);


--
-- Name: colonia_cursos_seleccionados_2026_estudiante_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_cursos_seleccionados_2026_estudiante_inscripcion_id_idx ON public.colonia_cursos_seleccionados_2026 USING btree (estudiante_inscripcion_id);


--
-- Name: colonia_estudiante_cursos_colonia_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_estudiante_cursos_colonia_estudiante_id_idx ON public.colonia_estudiante_cursos USING btree (colonia_estudiante_id);


--
-- Name: colonia_estudiante_cursos_course_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_estudiante_cursos_course_id_idx ON public.colonia_estudiante_cursos USING btree (course_id);


--
-- Name: colonia_estudiantes_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_estudiantes_estudiante_id_idx ON public.colonia_estudiantes USING btree (estudiante_id);


--
-- Name: colonia_estudiantes_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_estudiantes_inscripcion_id_idx ON public.colonia_estudiantes USING btree (inscripcion_id);


--
-- Name: colonia_estudiantes_pin_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_estudiantes_pin_idx ON public.colonia_estudiantes USING btree (pin);


--
-- Name: colonia_estudiantes_pin_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX colonia_estudiantes_pin_key ON public.colonia_estudiantes USING btree (pin);


--
-- Name: colonia_inscripciones_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_inscripciones_estado_idx ON public.colonia_inscripciones USING btree (estado);


--
-- Name: colonia_inscripciones_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_inscripciones_tutor_id_idx ON public.colonia_inscripciones USING btree (tutor_id);


--
-- Name: colonia_pagos_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_pagos_estado_idx ON public.colonia_pagos USING btree (estado);


--
-- Name: colonia_pagos_fecha_vencimiento_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_pagos_fecha_vencimiento_idx ON public.colonia_pagos USING btree (fecha_vencimiento);


--
-- Name: colonia_pagos_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_pagos_inscripcion_id_idx ON public.colonia_pagos USING btree (inscripcion_id);


--
-- Name: colonia_pagos_mercadopago_preference_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_pagos_mercadopago_preference_id_idx ON public.colonia_pagos USING btree (mercadopago_preference_id);


--
-- Name: colonia_pagos_processed_at_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX colonia_pagos_processed_at_idx ON public.colonia_pagos USING btree (processed_at);


--
-- Name: compras_item_fecha_compra_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX compras_item_fecha_compra_idx ON public.compras_item USING btree (fecha_compra);


--
-- Name: compras_item_item_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX compras_item_item_id_idx ON public.compras_item USING btree (item_id);


--
-- Name: compras_item_recursos_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX compras_item_recursos_estudiante_id_idx ON public.compras_item USING btree (recursos_estudiante_id);


--
-- Name: cursos_catalogo_activo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX cursos_catalogo_activo_idx ON public.cursos_catalogo USING btree (activo);


--
-- Name: cursos_catalogo_categoria_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX cursos_catalogo_categoria_idx ON public.cursos_catalogo USING btree (categoria);


--
-- Name: cursos_catalogo_codigo_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX cursos_catalogo_codigo_key ON public.cursos_catalogo USING btree (codigo);


--
-- Name: cursos_catalogo_destacado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX cursos_catalogo_destacado_idx ON public.cursos_catalogo USING btree (destacado);


--
-- Name: cursos_estudiantes_completado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX cursos_estudiantes_completado_idx ON public.cursos_estudiantes USING btree (completado);


--
-- Name: cursos_estudiantes_estudiante_id_curso_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX cursos_estudiantes_estudiante_id_curso_id_key ON public.cursos_estudiantes USING btree (estudiante_id, curso_id);


--
-- Name: cursos_estudiantes_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX cursos_estudiantes_estudiante_id_idx ON public.cursos_estudiantes USING btree (estudiante_id);


--
-- Name: docentes_email_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX docentes_email_key ON public.docentes USING btree (email);


--
-- Name: docentes_rutas_docenteId_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX "docentes_rutas_docenteId_idx" ON public.docentes_rutas USING btree ("docenteId");


--
-- Name: docentes_rutas_docenteId_rutaId_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX "docentes_rutas_docenteId_rutaId_key" ON public.docentes_rutas USING btree ("docenteId", "rutaId");


--
-- Name: docentes_rutas_rutaId_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX "docentes_rutas_rutaId_idx" ON public.docentes_rutas USING btree ("rutaId");


--
-- Name: docentes_rutas_sectorId_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX "docentes_rutas_sectorId_idx" ON public.docentes_rutas USING btree ("sectorId");


--
-- Name: equipos_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX equipos_nombre_key ON public.equipos USING btree (nombre);


--
-- Name: estudiante_sectores_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX estudiante_sectores_estudiante_id_idx ON public.estudiante_sectores USING btree (estudiante_id);


--
-- Name: estudiante_sectores_estudiante_id_sector_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX estudiante_sectores_estudiante_id_sector_id_key ON public.estudiante_sectores USING btree (estudiante_id, sector_id);


--
-- Name: estudiante_sectores_sector_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX estudiante_sectores_sector_id_idx ON public.estudiante_sectores USING btree (sector_id);


--
-- Name: estudiantes_email_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX estudiantes_email_key ON public.estudiantes USING btree (email);


--
-- Name: estudiantes_inscripciones_2026_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX estudiantes_inscripciones_2026_estudiante_id_idx ON public.estudiantes_inscripciones_2026 USING btree (estudiante_id);


--
-- Name: estudiantes_inscripciones_2026_inscripcion_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX estudiantes_inscripciones_2026_inscripcion_id_estudiante_id_key ON public.estudiantes_inscripciones_2026 USING btree (inscripcion_id, estudiante_id);


--
-- Name: estudiantes_inscripciones_2026_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX estudiantes_inscripciones_2026_inscripcion_id_idx ON public.estudiantes_inscripciones_2026 USING btree (inscripcion_id);


--
-- Name: estudiantes_username_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX estudiantes_username_key ON public.estudiantes USING btree (username);


--
-- Name: eventos_clase_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX eventos_clase_id_idx ON public.eventos USING btree (clase_id);


--
-- Name: eventos_docente_id_fecha_inicio_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX eventos_docente_id_fecha_inicio_idx ON public.eventos USING btree (docente_id, fecha_inicio);


--
-- Name: eventos_docente_id_tipo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX eventos_docente_id_tipo_idx ON public.eventos USING btree (docente_id, tipo);


--
-- Name: eventos_tipo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX eventos_tipo_idx ON public.eventos USING btree (tipo);


--
-- Name: grupos_activo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX grupos_activo_idx ON public.grupos USING btree (activo);


--
-- Name: grupos_codigo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX grupos_codigo_idx ON public.grupos USING btree (codigo);


--
-- Name: grupos_codigo_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX grupos_codigo_key ON public.grupos USING btree (codigo);


--
-- Name: historial_cambio_precios_configuracion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX historial_cambio_precios_configuracion_id_idx ON public.historial_cambio_precios USING btree (configuracion_id);


--
-- Name: historial_cambio_precios_fecha_cambio_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX historial_cambio_precios_fecha_cambio_idx ON public.historial_cambio_precios USING btree (fecha_cambio);


--
-- Name: historial_estado_inscripciones_2026_fecha_cambio_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX historial_estado_inscripciones_2026_fecha_cambio_idx ON public.historial_estado_inscripciones_2026 USING btree (fecha_cambio);


--
-- Name: historial_estado_inscripciones_2026_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX historial_estado_inscripciones_2026_inscripcion_id_idx ON public.historial_estado_inscripciones_2026 USING btree (inscripcion_id);


--
-- Name: inscripciones_2026_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_2026_estado_idx ON public.inscripciones_2026 USING btree (estado);


--
-- Name: inscripciones_2026_fecha_inscripcion_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_2026_fecha_inscripcion_idx ON public.inscripciones_2026 USING btree (fecha_inscripcion);


--
-- Name: inscripciones_2026_tipo_inscripcion_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_2026_tipo_inscripcion_idx ON public.inscripciones_2026 USING btree (tipo_inscripcion);


--
-- Name: inscripciones_2026_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_2026_tutor_id_idx ON public.inscripciones_2026 USING btree (tutor_id);


--
-- Name: inscripciones_clase_clase_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX inscripciones_clase_clase_id_estudiante_id_key ON public.inscripciones_clase USING btree (clase_id, estudiante_id);


--
-- Name: inscripciones_clase_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_clase_estudiante_id_idx ON public.inscripciones_clase USING btree (estudiante_id);


--
-- Name: inscripciones_clase_grupo_clase_grupo_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX inscripciones_clase_grupo_clase_grupo_id_estudiante_id_key ON public.inscripciones_clase_grupo USING btree (clase_grupo_id, estudiante_id);


--
-- Name: inscripciones_clase_grupo_clase_grupo_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_clase_grupo_clase_grupo_id_idx ON public.inscripciones_clase_grupo USING btree (clase_grupo_id);


--
-- Name: inscripciones_clase_grupo_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_clase_grupo_estudiante_id_idx ON public.inscripciones_clase_grupo USING btree (estudiante_id);


--
-- Name: inscripciones_clase_grupo_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_clase_grupo_tutor_id_idx ON public.inscripciones_clase_grupo USING btree (tutor_id);


--
-- Name: inscripciones_clase_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_clase_tutor_id_idx ON public.inscripciones_clase USING btree (tutor_id);


--
-- Name: inscripciones_curso_estudiante_id_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_curso_estudiante_id_estado_idx ON public.inscripciones_curso USING btree (estudiante_id, estado);


--
-- Name: inscripciones_curso_estudiante_id_producto_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX inscripciones_curso_estudiante_id_producto_id_key ON public.inscripciones_curso USING btree (estudiante_id, producto_id);


--
-- Name: inscripciones_curso_preferencia_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_curso_preferencia_id_idx ON public.inscripciones_curso USING btree (preferencia_id);


--
-- Name: inscripciones_mensuales_estado_pago_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_mensuales_estado_pago_idx ON public.inscripciones_mensuales USING btree (estado_pago);


--
-- Name: inscripciones_mensuales_estudiante_id_producto_id_periodo_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX inscripciones_mensuales_estudiante_id_producto_id_periodo_key ON public.inscripciones_mensuales USING btree (estudiante_id, producto_id, periodo);


--
-- Name: inscripciones_mensuales_periodo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_mensuales_periodo_idx ON public.inscripciones_mensuales USING btree (periodo);


--
-- Name: inscripciones_mensuales_tutor_id_periodo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX inscripciones_mensuales_tutor_id_periodo_idx ON public.inscripciones_mensuales USING btree (tutor_id, periodo);


--
-- Name: items_obtenidos_equipado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_obtenidos_equipado_idx ON public.items_obtenidos USING btree (equipado);


--
-- Name: items_obtenidos_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_obtenidos_estudiante_id_idx ON public.items_obtenidos USING btree (estudiante_id);


--
-- Name: items_obtenidos_estudiante_id_item_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX items_obtenidos_estudiante_id_item_id_key ON public.items_obtenidos USING btree (estudiante_id, item_id);


--
-- Name: items_obtenidos_item_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_obtenidos_item_id_idx ON public.items_obtenidos USING btree (item_id);


--
-- Name: items_tienda_categoria_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_tienda_categoria_id_idx ON public.items_tienda USING btree (categoria_id);


--
-- Name: items_tienda_disponible_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_tienda_disponible_idx ON public.items_tienda USING btree (disponible);


--
-- Name: items_tienda_rareza_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_tienda_rareza_idx ON public.items_tienda USING btree (rareza);


--
-- Name: items_tienda_tipo_item_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX items_tienda_tipo_item_idx ON public.items_tienda USING btree (tipo_item);


--
-- Name: lecciones_modulo_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX lecciones_modulo_id_idx ON public.lecciones USING btree (modulo_id);


--
-- Name: lecciones_modulo_id_orden_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX lecciones_modulo_id_orden_idx ON public.lecciones USING btree (modulo_id, orden);


--
-- Name: lecciones_tipo_contenido_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX lecciones_tipo_contenido_idx ON public.lecciones USING btree (tipo_contenido);


--
-- Name: logros_cursos_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX logros_cursos_nombre_key ON public.logros_cursos USING btree (nombre);


--
-- Name: logros_desbloqueados_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX logros_desbloqueados_estudiante_id_idx ON public.logros_desbloqueados USING btree (estudiante_id);


--
-- Name: logros_desbloqueados_estudiante_id_logro_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX logros_desbloqueados_estudiante_id_logro_id_key ON public.logros_desbloqueados USING btree (estudiante_id, logro_id);


--
-- Name: logros_desbloqueados_fecha_obtenido_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX logros_desbloqueados_fecha_obtenido_idx ON public.logros_desbloqueados USING btree (fecha_obtenido);


--
-- Name: logros_desbloqueados_logro_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX logros_desbloqueados_logro_id_idx ON public.logros_desbloqueados USING btree (logro_id);


--
-- Name: logros_estudiantes_gamificacion_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX logros_estudiantes_gamificacion_estudiante_id_idx ON public.logros_estudiantes_gamificacion USING btree (estudiante_id);


--
-- Name: logros_estudiantes_gamificacion_estudiante_id_logro_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX logros_estudiantes_gamificacion_estudiante_id_logro_id_key ON public.logros_estudiantes_gamificacion USING btree (estudiante_id, logro_id);


--
-- Name: logros_estudiantes_gamificacion_logro_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX logros_estudiantes_gamificacion_logro_id_idx ON public.logros_estudiantes_gamificacion USING btree (logro_id);


--
-- Name: logros_estudiantes_gamificacion_visto_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX logros_estudiantes_gamificacion_visto_idx ON public.logros_estudiantes_gamificacion USING btree (visto);


--
-- Name: logros_gamificacion_codigo_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX logros_gamificacion_codigo_key ON public.logros_gamificacion USING btree (codigo);


--
-- Name: membresias_preferencia_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX membresias_preferencia_id_idx ON public.membresias USING btree (preferencia_id);


--
-- Name: membresias_tutor_id_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX membresias_tutor_id_estado_idx ON public.membresias USING btree (tutor_id, estado);


--
-- Name: modulos_producto_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX modulos_producto_id_idx ON public.modulos USING btree (producto_id);


--
-- Name: modulos_producto_id_orden_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX modulos_producto_id_orden_idx ON public.modulos USING btree (producto_id, orden);


--
-- Name: notas_categoria_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX notas_categoria_idx ON public.notas USING btree (categoria);


--
-- Name: notas_evento_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX notas_evento_id_key ON public.notas USING btree (evento_id);


--
-- Name: notificaciones_docente_id_createdAt_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX "notificaciones_docente_id_createdAt_idx" ON public.notificaciones USING btree (docente_id, "createdAt");


--
-- Name: notificaciones_docente_id_leida_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX notificaciones_docente_id_leida_idx ON public.notificaciones USING btree (docente_id, leida);


--
-- Name: pagos_inscripciones_2026_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_estado_idx ON public.pagos_inscripciones_2026 USING btree (estado);


--
-- Name: pagos_inscripciones_2026_fecha_vencimiento_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_fecha_vencimiento_idx ON public.pagos_inscripciones_2026 USING btree (fecha_vencimiento);


--
-- Name: pagos_inscripciones_2026_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_inscripcion_id_idx ON public.pagos_inscripciones_2026 USING btree (inscripcion_id);


--
-- Name: pagos_inscripciones_2026_mercadopago_payment_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_mercadopago_payment_id_idx ON public.pagos_inscripciones_2026 USING btree (mercadopago_payment_id);


--
-- Name: pagos_inscripciones_2026_mercadopago_payment_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX pagos_inscripciones_2026_mercadopago_payment_id_key ON public.pagos_inscripciones_2026 USING btree (mercadopago_payment_id);


--
-- Name: pagos_inscripciones_2026_mercadopago_preference_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_mercadopago_preference_id_idx ON public.pagos_inscripciones_2026 USING btree (mercadopago_preference_id);


--
-- Name: pagos_inscripciones_2026_processed_at_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_processed_at_idx ON public.pagos_inscripciones_2026 USING btree (processed_at);


--
-- Name: pagos_inscripciones_2026_tipo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX pagos_inscripciones_2026_tipo_idx ON public.pagos_inscripciones_2026 USING btree (tipo);


--
-- Name: planificaciones_mensuales_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX planificaciones_mensuales_estado_idx ON public.planificaciones_mensuales USING btree (estado);


--
-- Name: planificaciones_mensuales_grupo_id_mes_anio_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX planificaciones_mensuales_grupo_id_mes_anio_idx ON public.planificaciones_mensuales USING btree (grupo_id, mes, anio);


--
-- Name: planificaciones_mensuales_grupo_id_mes_anio_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX planificaciones_mensuales_grupo_id_mes_anio_key ON public.planificaciones_mensuales USING btree (grupo_id, mes, anio);


--
-- Name: planificaciones_simples_codigo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX planificaciones_simples_codigo_idx ON public.planificaciones_simples USING btree (codigo);


--
-- Name: planificaciones_simples_codigo_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX planificaciones_simples_codigo_key ON public.planificaciones_simples USING btree (codigo);


--
-- Name: planificaciones_simples_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX planificaciones_simples_estado_idx ON public.planificaciones_simples USING btree (estado);


--
-- Name: planificaciones_simples_grupo_codigo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX planificaciones_simples_grupo_codigo_idx ON public.planificaciones_simples USING btree (grupo_codigo);


--
-- Name: premios_padres_activo_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX premios_padres_activo_idx ON public.premios_padres USING btree (activo);


--
-- Name: premios_padres_categoria_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX premios_padres_categoria_idx ON public.premios_padres USING btree (categoria);


--
-- Name: premios_padres_codigo_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX premios_padres_codigo_key ON public.premios_padres USING btree (codigo);


--
-- Name: progreso_estudiante_actividad_actividad_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_estudiante_actividad_actividad_id_idx ON public.progreso_estudiante_actividad USING btree (actividad_id);


--
-- Name: progreso_estudiante_actividad_asignacion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_estudiante_actividad_asignacion_id_idx ON public.progreso_estudiante_actividad USING btree (asignacion_id);


--
-- Name: progreso_estudiante_actividad_estudiante_id_actividad_id_as_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX progreso_estudiante_actividad_estudiante_id_actividad_id_as_key ON public.progreso_estudiante_actividad USING btree (estudiante_id, actividad_id, asignacion_id);


--
-- Name: progreso_estudiante_actividad_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_estudiante_actividad_estudiante_id_idx ON public.progreso_estudiante_actividad USING btree (estudiante_id);


--
-- Name: progreso_estudiante_planificacion_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_estudiante_planificacion_estudiante_id_idx ON public.progreso_estudiante_planificacion USING btree (estudiante_id);


--
-- Name: progreso_estudiante_planificacion_estudiante_id_planificaci_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX progreso_estudiante_planificacion_estudiante_id_planificaci_key ON public.progreso_estudiante_planificacion USING btree (estudiante_id, planificacion_id);


--
-- Name: progreso_lecciones_estudiante_id_completada_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_lecciones_estudiante_id_completada_idx ON public.progreso_lecciones USING btree (estudiante_id, completada);


--
-- Name: progreso_lecciones_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_lecciones_estudiante_id_idx ON public.progreso_lecciones USING btree (estudiante_id);


--
-- Name: progreso_lecciones_estudiante_id_leccion_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX progreso_lecciones_estudiante_id_leccion_id_key ON public.progreso_lecciones USING btree (estudiante_id, leccion_id);


--
-- Name: progreso_lecciones_leccion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_lecciones_leccion_id_idx ON public.progreso_lecciones USING btree (leccion_id);


--
-- Name: puntos_obtenidos_accion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX puntos_obtenidos_accion_id_idx ON public.puntos_obtenidos USING btree (accion_id);


--
-- Name: puntos_obtenidos_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX puntos_obtenidos_docente_id_idx ON public.puntos_obtenidos USING btree (docente_id);


--
-- Name: puntos_obtenidos_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX puntos_obtenidos_estudiante_id_idx ON public.puntos_obtenidos USING btree (estudiante_id);


--
-- Name: puntos_obtenidos_fecha_otorgado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX puntos_obtenidos_fecha_otorgado_idx ON public.puntos_obtenidos USING btree (fecha_otorgado);


--
-- Name: puntos_padres_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX puntos_padres_tutor_id_idx ON public.puntos_padres USING btree (tutor_id);


--
-- Name: puntos_padres_tutor_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX puntos_padres_tutor_id_key ON public.puntos_padres USING btree (tutor_id);


--
-- Name: rachas_estudiantes_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX rachas_estudiantes_estudiante_id_idx ON public.rachas_estudiantes USING btree (estudiante_id);


--
-- Name: rachas_estudiantes_estudiante_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX rachas_estudiantes_estudiante_id_key ON public.rachas_estudiantes USING btree (estudiante_id);


--
-- Name: rachas_estudiantes_ultima_actividad_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX rachas_estudiantes_ultima_actividad_idx ON public.rachas_estudiantes USING btree (ultima_actividad);


--
-- Name: recordatorios_evento_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX recordatorios_evento_id_key ON public.recordatorios USING btree (evento_id);


--
-- Name: recursos_estudiante_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX recursos_estudiante_estudiante_id_idx ON public.recursos_estudiante USING btree (estudiante_id);


--
-- Name: recursos_estudiante_estudiante_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX recursos_estudiante_estudiante_id_key ON public.recursos_estudiante USING btree (estudiante_id);


--
-- Name: rutas_curriculares_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX rutas_curriculares_nombre_key ON public.rutas_curriculares USING btree (nombre);


--
-- Name: rutas_especialidad_sectorId_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX "rutas_especialidad_sectorId_idx" ON public.rutas_especialidad USING btree ("sectorId");


--
-- Name: rutas_especialidad_sectorId_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX "rutas_especialidad_sectorId_nombre_key" ON public.rutas_especialidad USING btree ("sectorId", nombre);


--
-- Name: secret_rotations_expires_at_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX secret_rotations_expires_at_idx ON public.secret_rotations USING btree (expires_at);


--
-- Name: secret_rotations_secret_type_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX secret_rotations_secret_type_idx ON public.secret_rotations USING btree (secret_type);


--
-- Name: secret_rotations_secret_type_version_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX secret_rotations_secret_type_version_key ON public.secret_rotations USING btree (secret_type, version);


--
-- Name: secret_rotations_status_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX secret_rotations_status_idx ON public.secret_rotations USING btree (status);


--
-- Name: secret_rotations_version_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX secret_rotations_version_idx ON public.secret_rotations USING btree (version);


--
-- Name: sectores_nombre_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX sectores_nombre_key ON public.sectores USING btree (nombre);


--
-- Name: semanas_activas_activa_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX semanas_activas_activa_idx ON public.semanas_activas USING btree (activa);


--
-- Name: semanas_activas_asignacion_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX semanas_activas_asignacion_id_idx ON public.semanas_activas USING btree (asignacion_id);


--
-- Name: semanas_activas_asignacion_id_numero_semana_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX semanas_activas_asignacion_id_numero_semana_key ON public.semanas_activas USING btree (asignacion_id, numero_semana);


--
-- Name: solicitudes_canje_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX solicitudes_canje_estado_idx ON public.solicitudes_canje USING btree (estado);


--
-- Name: solicitudes_canje_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX solicitudes_canje_estudiante_id_idx ON public.solicitudes_canje USING btree (estudiante_id);


--
-- Name: solicitudes_canje_fecha_solicitud_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX solicitudes_canje_fecha_solicitud_idx ON public.solicitudes_canje USING btree (fecha_solicitud);


--
-- Name: solicitudes_canje_tutor_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX solicitudes_canje_tutor_id_idx ON public.solicitudes_canje USING btree (tutor_id);


--
-- Name: tareas_categoria_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX tareas_categoria_idx ON public.tareas USING btree (categoria);


--
-- Name: tareas_estado_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX tareas_estado_idx ON public.tareas USING btree (estado);


--
-- Name: tareas_evento_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX tareas_evento_id_key ON public.tareas USING btree (evento_id);


--
-- Name: tareas_prioridad_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX tareas_prioridad_idx ON public.tareas USING btree (prioridad);


--
-- Name: transacciones_puntos_padres_fecha_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX transacciones_puntos_padres_fecha_idx ON public.transacciones_puntos_padres USING btree (fecha);


--
-- Name: transacciones_puntos_padres_puntos_padre_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX transacciones_puntos_padres_puntos_padre_id_idx ON public.transacciones_puntos_padres USING btree (puntos_padre_id);


--
-- Name: transacciones_puntos_padres_tipo_recurso_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX transacciones_puntos_padres_tipo_recurso_idx ON public.transacciones_puntos_padres USING btree (tipo_recurso);


--
-- Name: transacciones_recurso_fecha_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX transacciones_recurso_fecha_idx ON public.transacciones_recurso USING btree (fecha);


--
-- Name: transacciones_recurso_recursos_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX transacciones_recurso_recursos_estudiante_id_idx ON public.transacciones_recurso USING btree (recursos_estudiante_id);


--
-- Name: transacciones_recurso_tipo_recurso_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX transacciones_recurso_tipo_recurso_idx ON public.transacciones_recurso USING btree (tipo_recurso);


--
-- Name: tutores_email_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX tutores_email_key ON public.tutores USING btree (email);


--
-- Name: tutores_username_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX tutores_username_key ON public.tutores USING btree (username);


--
-- Name: webhooks_processed_payment_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX webhooks_processed_payment_id_idx ON public.webhooks_processed USING btree (payment_id);


--
-- Name: webhooks_processed_payment_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX webhooks_processed_payment_id_key ON public.webhooks_processed USING btree (payment_id);


--
-- Name: webhooks_processed_processed_at_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX webhooks_processed_processed_at_idx ON public.webhooks_processed USING btree (processed_at);


--
-- Name: webhooks_processed_webhook_type_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX webhooks_processed_webhook_type_idx ON public.webhooks_processed USING btree (webhook_type);


--
-- Name: actividades_semanales actividades_semanales_planificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.actividades_semanales
    ADD CONSTRAINT actividades_semanales_planificacion_id_fkey FOREIGN KEY (planificacion_id) REFERENCES public.planificaciones_mensuales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alertas alertas_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alertas alertas_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asignaciones_actividad_estudiante asignaciones_actividad_estudiante_actividad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_actividad_estudiante
    ADD CONSTRAINT asignaciones_actividad_estudiante_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.actividades_semanales(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_actividad_estudiante asignaciones_actividad_estudiante_asignacion_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_actividad_estudiante
    ADD CONSTRAINT asignaciones_actividad_estudiante_asignacion_docente_id_fkey FOREIGN KEY (asignacion_docente_id) REFERENCES public.asignaciones_docente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asignaciones_actividad_estudiante asignaciones_actividad_estudiante_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_actividad_estudiante
    ADD CONSTRAINT asignaciones_actividad_estudiante_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_docente asignaciones_docente_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_docente
    ADD CONSTRAINT asignaciones_docente_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_docente asignaciones_docente_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_docente
    ADD CONSTRAINT asignaciones_docente_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_docente asignaciones_docente_planificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_docente
    ADD CONSTRAINT asignaciones_docente_planificacion_id_fkey FOREIGN KEY (planificacion_id) REFERENCES public.planificaciones_mensuales(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_planificacion asignaciones_planificacion_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_planificacion asignaciones_planificacion_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_planificacion asignaciones_planificacion_planificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_planificacion_id_fkey FOREIGN KEY (planificacion_id) REFERENCES public.planificaciones_simples(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias_clase_grupo asistencias_clase_grupo_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asistencias_clase_grupo
    ADD CONSTRAINT asistencias_clase_grupo_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias_clase_grupo asistencias_clase_grupo_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asistencias_clase_grupo
    ADD CONSTRAINT asistencias_clase_grupo_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias asistencias_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias asistencias_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: becas becas_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.becas
    ADD CONSTRAINT becas_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: canjes_padres canjes_padres_premio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.canjes_padres
    ADD CONSTRAINT canjes_padres_premio_id_fkey FOREIGN KEY (premio_id) REFERENCES public.premios_padres(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: canjes_padres canjes_padres_puntos_padre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.canjes_padres
    ADD CONSTRAINT canjes_padres_puntos_padre_id_fkey FOREIGN KEY (puntos_padre_id) REFERENCES public.puntos_padres(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: canjes_padres canjes_padres_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.canjes_padres
    ADD CONSTRAINT canjes_padres_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ciclo_mundos_seleccionados_2026 ciclo_mundos_seleccionados_2026_estudiante_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.ciclo_mundos_seleccionados_2026
    ADD CONSTRAINT ciclo_mundos_seleccionados_2026_estudiante_inscripcion_id_fkey FOREIGN KEY (estudiante_inscripcion_id) REFERENCES public.estudiantes_inscripciones_2026(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clase_grupos clase_grupos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clase_grupos clase_grupos_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clase_grupos clase_grupos_ruta_curricular_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_ruta_curricular_id_fkey FOREIGN KEY (ruta_curricular_id) REFERENCES public.rutas_curriculares(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clase_grupos clase_grupos_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clases clases_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clases clases_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clases clases_ruta_curricular_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_ruta_curricular_id_fkey FOREIGN KEY (ruta_curricular_id) REFERENCES public.rutas_curriculares(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clases clases_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: colonia_cursos_seleccionados_2026 colonia_cursos_seleccionados_2026_estudiante_inscripcion_i_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_cursos_seleccionados_2026
    ADD CONSTRAINT colonia_cursos_seleccionados_2026_estudiante_inscripcion_i_fkey FOREIGN KEY (estudiante_inscripcion_id) REFERENCES public.estudiantes_inscripciones_2026(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_estudiante_cursos colonia_estudiante_cursos_colonia_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_estudiante_cursos
    ADD CONSTRAINT colonia_estudiante_cursos_colonia_estudiante_id_fkey FOREIGN KEY (colonia_estudiante_id) REFERENCES public.colonia_estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_estudiantes colonia_estudiantes_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_estudiantes
    ADD CONSTRAINT colonia_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_estudiantes colonia_estudiantes_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_estudiantes
    ADD CONSTRAINT colonia_estudiantes_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.colonia_inscripciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_inscripciones colonia_inscripciones_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_inscripciones
    ADD CONSTRAINT colonia_inscripciones_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_pagos colonia_pagos_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.colonia_pagos
    ADD CONSTRAINT colonia_pagos_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.colonia_inscripciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: compras_item compras_item_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.compras_item
    ADD CONSTRAINT compras_item_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items_tienda(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: compras_item compras_item_recursos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.compras_item
    ADD CONSTRAINT compras_item_recursos_estudiante_id_fkey FOREIGN KEY (recursos_estudiante_id) REFERENCES public.recursos_estudiante(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cursos_estudiantes cursos_estudiantes_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.cursos_estudiantes
    ADD CONSTRAINT cursos_estudiantes_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos_catalogo(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cursos_estudiantes cursos_estudiantes_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.cursos_estudiantes
    ADD CONSTRAINT cursos_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_rutas docentes_rutas_docenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT "docentes_rutas_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_rutas docentes_rutas_rutaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT "docentes_rutas_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES public.rutas_especialidad(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_rutas docentes_rutas_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT "docentes_rutas_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estudiante_sectores estudiante_sectores_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiante_sectores
    ADD CONSTRAINT estudiante_sectores_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estudiante_sectores estudiante_sectores_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiante_sectores
    ADD CONSTRAINT estudiante_sectores_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estudiantes estudiantes_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estudiantes_inscripciones_2026 estudiantes_inscripciones_2026_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes_inscripciones_2026
    ADD CONSTRAINT estudiantes_inscripciones_2026_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estudiantes_inscripciones_2026 estudiantes_inscripciones_2026_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes_inscripciones_2026
    ADD CONSTRAINT estudiantes_inscripciones_2026_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.inscripciones_2026(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estudiantes estudiantes_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estudiantes estudiantes_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: eventos eventos_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: eventos eventos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grupos grupos_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: historial_cambio_precios historial_cambio_precios_configuracion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.historial_cambio_precios
    ADD CONSTRAINT historial_cambio_precios_configuracion_id_fkey FOREIGN KEY (configuracion_id) REFERENCES public.configuracion_precios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: historial_estado_inscripciones_2026 historial_estado_inscripciones_2026_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.historial_estado_inscripciones_2026
    ADD CONSTRAINT historial_estado_inscripciones_2026_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.inscripciones_2026(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_2026 inscripciones_2026_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_2026
    ADD CONSTRAINT inscripciones_2026_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase inscripciones_clase_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase inscripciones_clase_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_clase inscripciones_clase_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_curso inscripciones_curso_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_curso
    ADD CONSTRAINT inscripciones_curso_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_curso inscripciones_curso_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_curso
    ADD CONSTRAINT inscripciones_curso_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_mensuales inscripciones_mensuales_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_mensuales inscripciones_mensuales_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_mensuales inscripciones_mensuales_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: items_obtenidos items_obtenidos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.items_obtenidos
    ADD CONSTRAINT items_obtenidos_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: items_obtenidos items_obtenidos_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.items_obtenidos
    ADD CONSTRAINT items_obtenidos_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items_tienda(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: items_tienda items_tienda_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.items_tienda
    ADD CONSTRAINT items_tienda_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_item(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lecciones lecciones_leccion_prerequisito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.lecciones
    ADD CONSTRAINT lecciones_leccion_prerequisito_id_fkey FOREIGN KEY (leccion_prerequisito_id) REFERENCES public.lecciones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lecciones lecciones_logro_desbloqueable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.lecciones
    ADD CONSTRAINT lecciones_logro_desbloqueable_id_fkey FOREIGN KEY (logro_desbloqueable_id) REFERENCES public.logros_cursos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lecciones lecciones_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.lecciones
    ADD CONSTRAINT lecciones_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logros_desbloqueados logros_desbloqueados_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_desbloqueados
    ADD CONSTRAINT logros_desbloqueados_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: logros_desbloqueados logros_desbloqueados_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_desbloqueados
    ADD CONSTRAINT logros_desbloqueados_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logros_desbloqueados logros_desbloqueados_logro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_desbloqueados
    ADD CONSTRAINT logros_desbloqueados_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros_cursos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: logros_estudiantes_gamificacion logros_estudiantes_gamificacion_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_estudiantes_gamificacion
    ADD CONSTRAINT logros_estudiantes_gamificacion_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logros_estudiantes_gamificacion logros_estudiantes_gamificacion_logro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.logros_estudiantes_gamificacion
    ADD CONSTRAINT logros_estudiantes_gamificacion_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros_gamificacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: membresias membresias_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: membresias membresias_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: modulos modulos_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notas notas_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.notas
    ADD CONSTRAINT notas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notificaciones notificaciones_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pagos_inscripciones_2026 pagos_inscripciones_2026_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.pagos_inscripciones_2026
    ADD CONSTRAINT pagos_inscripciones_2026_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.inscripciones_2026(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: planificaciones_mensuales planificaciones_mensuales_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.planificaciones_mensuales
    ADD CONSTRAINT planificaciones_mensuales_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: progreso_estudiante_actividad progreso_estudiante_actividad_actividad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_actividad
    ADD CONSTRAINT progreso_estudiante_actividad_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.actividades_semanales(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: progreso_estudiante_actividad progreso_estudiante_actividad_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_actividad
    ADD CONSTRAINT progreso_estudiante_actividad_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.asignaciones_actividad_estudiante(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_estudiante_actividad progreso_estudiante_actividad_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_actividad
    ADD CONSTRAINT progreso_estudiante_actividad_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_estudiante_planificacion progreso_estudiante_planificacion_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_planificacion
    ADD CONSTRAINT progreso_estudiante_planificacion_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_estudiante_planificacion progreso_estudiante_planificacion_planificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_planificacion
    ADD CONSTRAINT progreso_estudiante_planificacion_planificacion_id_fkey FOREIGN KEY (planificacion_id) REFERENCES public.planificaciones_simples(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: progreso_lecciones progreso_lecciones_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_lecciones
    ADD CONSTRAINT progreso_lecciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_lecciones progreso_lecciones_leccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_lecciones
    ADD CONSTRAINT progreso_lecciones_leccion_id_fkey FOREIGN KEY (leccion_id) REFERENCES public.lecciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: puntos_obtenidos puntos_obtenidos_accion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_accion_id_fkey FOREIGN KEY (accion_id) REFERENCES public.acciones_puntuables(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: puntos_obtenidos puntos_obtenidos_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: puntos_obtenidos puntos_obtenidos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: puntos_obtenidos puntos_obtenidos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: puntos_padres puntos_padres_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.puntos_padres
    ADD CONSTRAINT puntos_padres_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rachas_estudiantes rachas_estudiantes_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.rachas_estudiantes
    ADD CONSTRAINT rachas_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recordatorios recordatorios_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recursos_estudiante recursos_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.recursos_estudiante
    ADD CONSTRAINT recursos_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rutas_especialidad rutas_especialidad_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.rutas_especialidad
    ADD CONSTRAINT "rutas_especialidad_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: semanas_activas semanas_activas_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.semanas_activas
    ADD CONSTRAINT semanas_activas_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.asignaciones_planificacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: solicitudes_canje solicitudes_canje_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.solicitudes_canje
    ADD CONSTRAINT solicitudes_canje_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos_catalogo(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: solicitudes_canje solicitudes_canje_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.solicitudes_canje
    ADD CONSTRAINT solicitudes_canje_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: solicitudes_canje solicitudes_canje_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.solicitudes_canje
    ADD CONSTRAINT solicitudes_canje_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tareas tareas_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transacciones_puntos_padres transacciones_puntos_padres_puntos_padre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.transacciones_puntos_padres
    ADD CONSTRAINT transacciones_puntos_padres_puntos_padre_id_fkey FOREIGN KEY (puntos_padre_id) REFERENCES public.puntos_padres(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transacciones_recurso transacciones_recurso_recursos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.transacciones_recurso
    ADD CONSTRAINT transacciones_recurso_recursos_estudiante_id_fkey FOREIGN KEY (recursos_estudiante_id) REFERENCES public.recursos_estudiante(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO mateatletas;


--
-- PostgreSQL database dump complete
--

\unrestrict uXLGgAZhQIXSVJ8NTXhawXY5j8qKvc5EeMr5sfu4Eu9pqNvlQ0BawGtJCWwsCpZ

