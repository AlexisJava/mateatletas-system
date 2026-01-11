--
-- PostgreSQL database dump
--

\restrict sWIb1vkGJizT1UsY01nAXvkujN5v5YWEfrpe132vVOXyghC0773yZ6Cp8wdf5CP

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
-- Name: EstadoAccesoEstudiante; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoAccesoEstudiante" AS ENUM (
    'ACTIVO',
    'SUSPENDIDO',
    'VENCIDO',
    'BECA'
);


ALTER TYPE public."EstadoAccesoEstudiante" OWNER TO postgres;

--
-- Name: EstadoAsistencia; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoAsistencia" AS ENUM (
    'Presente',
    'Ausente',
    'Justificado'
);


ALTER TYPE public."EstadoAsistencia" OWNER TO postgres;

--
-- Name: EstadoInscripcionComision; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoInscripcionComision" AS ENUM (
    'Pendiente',
    'Confirmada',
    'Cancelada',
    'ListaEspera'
);


ALTER TYPE public."EstadoInscripcionComision" OWNER TO postgres;

--
-- Name: EstadoSuscripcion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoSuscripcion" AS ENUM (
    'PENDIENTE',
    'ACTIVA',
    'EN_GRACIA',
    'MOROSA',
    'PAUSADA',
    'CANCELADA'
);


ALTER TYPE public."EstadoSuscripcion" OWNER TO postgres;

--
-- Name: IntervaloSuscripcion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IntervaloSuscripcion" AS ENUM (
    'DIARIO',
    'SEMANAL',
    'MENSUAL',
    'ANUAL'
);


ALTER TYPE public."IntervaloSuscripcion" OWNER TO postgres;

--
-- Name: TipoActividadFeed; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoActividadFeed" AS ENUM (
    'LECCION_COMPLETADA',
    'CLASE_COMPLETADA',
    'TAREA_COMPLETADA',
    'TAREA_PERFECTA',
    'PLANIFICACION_COMPLETADA',
    'LOGRO_DESBLOQUEADO',
    'NIVEL_SUBIDO',
    'RACHA_EXTENDIDA'
);


ALTER TYPE public."TipoActividadFeed" OWNER TO postgres;

--
-- Name: TipoProducto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoProducto" AS ENUM (
    'Evento',
    'Digital',
    'Fisico',
    'Curso',
    'Servicio',
    'Bundle',
    'Certificacion'
);


ALTER TYPE public."TipoProducto" OWNER TO postgres;

--
-- Name: casa_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.casa_tipo AS ENUM (
    'QUANTUM',
    'VERTEX',
    'PULSAR'
);


ALTER TYPE public.casa_tipo OWNER TO postgres;

--
-- Name: dia_semana; Type: TYPE; Schema: public; Owner: postgres
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


ALTER TYPE public.dia_semana OWNER TO postgres;

--
-- Name: estado_clase; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_clase AS ENUM (
    'Programada',
    'EnVivo',
    'Finalizada',
    'Cancelada'
);


ALTER TYPE public.estado_clase OWNER TO postgres;

--
-- Name: estado_contenido; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_contenido AS ENUM (
    'BORRADOR',
    'PUBLICADO',
    'ARCHIVADO'
);


ALTER TYPE public.estado_contenido OWNER TO postgres;

--
-- Name: estado_observacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_observacion AS ENUM (
    'Abierta',
    'EnSeguimiento',
    'Resuelta',
    'Cerrada'
);


ALTER TYPE public.estado_observacion OWNER TO postgres;

--
-- Name: estado_pago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pago AS ENUM (
    'Pendiente',
    'Pagado',
    'Vencido',
    'Parcial'
);


ALTER TYPE public.estado_pago OWNER TO postgres;

--
-- Name: estado_tarea; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_tarea AS ENUM (
    'PENDIENTE',
    'EN_PROGRESO',
    'COMPLETADA',
    'CANCELADA',
    'VENCIDA'
);


ALTER TYPE public.estado_tarea OWNER TO postgres;

--
-- Name: mundo_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mundo_tipo AS ENUM (
    'MATEMATICA',
    'PROGRAMACION',
    'CIENCIAS'
);


ALTER TYPE public.mundo_tipo OWNER TO postgres;

--
-- Name: onboarding_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.onboarding_estado AS ENUM (
    'PENDIENTE',
    'SELECCION_MUNDOS',
    'TEST_UBICACION',
    'CONFIRMACION_CASA',
    'CREACION_AVATAR',
    'COMPLETADO'
);


ALTER TYPE public.onboarding_estado OWNER TO postgres;

--
-- Name: prioridad_observacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.prioridad_observacion AS ENUM (
    'Baja',
    'Media',
    'Alta',
    'Urgente'
);


ALTER TYPE public.prioridad_observacion OWNER TO postgres;

--
-- Name: prioridad_tarea; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.prioridad_tarea AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'URGENTE'
);


ALTER TYPE public.prioridad_tarea OWNER TO postgres;

--
-- Name: tier_nombre; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tier_nombre AS ENUM (
    'STEAM_LIBROS',
    'STEAM_ASINCRONICO',
    'STEAM_SINCRONICO'
);


ALTER TYPE public.tier_nombre OWNER TO postgres;

--
-- Name: tipo_acceso_inscripcion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_acceso_inscripcion AS ENUM (
    'SINCRONICO',
    'ASINCRONICO'
);


ALTER TYPE public.tipo_acceso_inscripcion OWNER TO postgres;

--
-- Name: tipo_asignacion_docente; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_asignacion_docente AS ENUM (
    'CLASE_GRUPOS',
    'COMISIONES',
    'AMBOS'
);


ALTER TYPE public.tipo_asignacion_docente OWNER TO postgres;

--
-- Name: tipo_autor_seguimiento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_autor_seguimiento AS ENUM (
    'Docente',
    'Admin'
);


ALTER TYPE public.tipo_autor_seguimiento OWNER TO postgres;

--
-- Name: tipo_clase_grupo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_clase_grupo AS ENUM (
    'GRUPO_REGULAR',
    'CURSO_TEMPORAL'
);


ALTER TYPE public.tipo_clase_grupo OWNER TO postgres;

--
-- Name: tipo_contenido; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_contenido AS ENUM (
    'LECCION',
    'TAREA',
    'MICROLECCION',
    'EVALUACION',
    'JUEGO',
    'SIMULACION',
    'RECURSO'
);


ALTER TYPE public.tipo_contenido OWNER TO postgres;

--
-- Name: tipo_descuento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_descuento AS ENUM (
    'NINGUNO',
    'HERMANO_2',
    'HERMANO_3_MAS'
);


ALTER TYPE public.tipo_descuento OWNER TO postgres;

--
-- Name: tipo_evento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_evento AS ENUM (
    'CLASE',
    'TAREA',
    'RECORDATORIO',
    'NOTA'
);


ALTER TYPE public.tipo_evento OWNER TO postgres;

--
-- Name: tipo_notificacion; Type: TYPE; Schema: public; Owner: postgres
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


ALTER TYPE public.tipo_notificacion OWNER TO postgres;

--
-- Name: tipo_observacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_observacion AS ENUM (
    'Academica',
    'Conductual',
    'Asistencia',
    'Logro',
    'Incidente'
);


ALTER TYPE public.tipo_observacion OWNER TO postgres;

--
-- Name: tipo_recurso; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_recurso AS ENUM (
    'XP'
);


ALTER TYPE public.tipo_recurso OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: actividad_feed; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividad_feed (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    tipo public."TipoActividadFeed" NOT NULL,
    mensaje text NOT NULL,
    xp_ganado integer DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    casa_id text
);


ALTER TABLE public.actividad_feed OWNER TO postgres;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    fecha_ultimo_cambio timestamp(3) without time zone,
    nombre text NOT NULL,
    apellido text NOT NULL,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    dni text,
    roles jsonb DEFAULT '["admin"]'::jsonb NOT NULL,
    telefono text,
    mfa_secret text,
    mfa_enabled boolean DEFAULT false NOT NULL,
    mfa_backup_codes text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: alertas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.alertas OWNER TO postgres;

--
-- Name: asignaciones_planificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignaciones_planificacion (
    id text NOT NULL,
    planificacion_id text NOT NULL,
    clase_grupo_id text NOT NULL,
    docente_id text NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_inicio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asignaciones_planificacion OWNER TO postgres;

--
-- Name: asistencia_comision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencia_comision (
    id text NOT NULL,
    comision_id text NOT NULL,
    estudiante_id text NOT NULL,
    fecha date NOT NULL,
    estado public."EstadoAsistencia" NOT NULL,
    observacion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.asistencia_comision OWNER TO postgres;

--
-- Name: asistencias; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.asistencias OWNER TO postgres;

--
-- Name: asistencias_clase_grupo; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.asistencias_clase_grupo OWNER TO postgres;

--
-- Name: asistencias_live; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias_live (
    id text NOT NULL,
    clase_grupo_id text NOT NULL,
    estudiante_id text NOT NULL,
    entro_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    salio_en timestamp(3) without time zone,
    duracion_minutos integer DEFAULT 0 NOT NULL,
    levanta_mano boolean DEFAULT false NOT NULL,
    esta_muteado boolean DEFAULT false NOT NULL,
    camara_encendida boolean DEFAULT false NOT NULL,
    compartiendo_pantalla boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.asistencias_live OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: casas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.casas (
    id text NOT NULL,
    tipo public.casa_tipo NOT NULL,
    nombre text NOT NULL,
    emoji text NOT NULL,
    slogan text,
    edad_minima integer NOT NULL,
    edad_maxima integer NOT NULL,
    color_primary text NOT NULL,
    color_secondary text NOT NULL,
    color_accent text NOT NULL,
    color_dark text NOT NULL,
    gradiente text NOT NULL,
    puntos_totales integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.casas OWNER TO postgres;

--
-- Name: clase_grupos; Type: TABLE; Schema: public; Owner: postgres
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
    sector_id text,
    nivel text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    estado_clase public.estado_clase DEFAULT 'Programada'::public.estado_clase NOT NULL,
    finalizada_en timestamp(3) without time zone,
    iniciada_en timestamp(3) without time zone,
    livekit_room_name text
);


ALTER TABLE public.clase_grupos OWNER TO postgres;

--
-- Name: clases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clases (
    id text NOT NULL,
    docente_id text NOT NULL,
    fecha_hora_inicio timestamp(3) without time zone NOT NULL,
    duracion_minutos integer NOT NULL,
    cupos_maximo integer NOT NULL,
    cupos_ocupados integer DEFAULT 0 NOT NULL,
    producto_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    descripcion text,
    nombre text NOT NULL,
    sector_id text,
    estado public.estado_clase DEFAULT 'Programada'::public.estado_clase NOT NULL
);


ALTER TABLE public.clases OWNER TO postgres;

--
-- Name: clases_planificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clases_planificacion (
    id text NOT NULL,
    planificacion_id text NOT NULL,
    numero integer NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    teoria_id text NOT NULL,
    practica_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clases_planificacion OWNER TO postgres;

--
-- Name: colonia_estudiante_cursos; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.colonia_estudiante_cursos OWNER TO postgres;

--
-- Name: colonia_estudiantes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.colonia_estudiantes OWNER TO postgres;

--
-- Name: colonia_inscripciones; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.colonia_inscripciones OWNER TO postgres;

--
-- Name: colonia_pagos; Type: TABLE; Schema: public; Owner: postgres
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
    processed_at timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.colonia_pagos OWNER TO postgres;

--
-- Name: comisiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comisiones (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    producto_id text NOT NULL,
    casa_id text,
    docente_id text,
    cupo_maximo integer,
    horario text,
    fecha_inicio timestamp(3) without time zone,
    fecha_fin timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    estado_clase public.estado_clase DEFAULT 'Programada'::public.estado_clase NOT NULL,
    finalizada_en timestamp(3) without time zone,
    iniciada_en timestamp(3) without time zone,
    livekit_room_name text,
    grupo_id text
);


ALTER TABLE public.comisiones OWNER TO postgres;

--
-- Name: configuracion_precios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_precios (
    id text DEFAULT 'singleton'::text NOT NULL,
    precio_steam_libros numeric(10,2) DEFAULT 40000 NOT NULL,
    precio_steam_asincronico numeric(10,2) DEFAULT 65000 NOT NULL,
    precio_steam_sincronico numeric(10,2) DEFAULT 95000 NOT NULL,
    descuento_segundo_hermano numeric(5,2) DEFAULT 10 NOT NULL,
    dia_vencimiento integer DEFAULT 15 NOT NULL,
    dias_antes_recordatorio integer DEFAULT 5 NOT NULL,
    notificaciones_activas boolean DEFAULT true NOT NULL,
    actualizado_por_admin_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.configuracion_precios OWNER TO postgres;

--
-- Name: contenidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contenidos (
    id text NOT NULL,
    titulo text NOT NULL,
    casa_tipo public.casa_tipo NOT NULL,
    mundo_tipo public.mundo_tipo NOT NULL,
    estado public.estado_contenido DEFAULT 'BORRADOR'::public.estado_contenido NOT NULL,
    creador_id text,
    descripcion text,
    imagen_portada text,
    orden integer DEFAULT 0 NOT NULL,
    duracion_minutos integer,
    fecha_publicacion timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    juego_codigo text,
    tipo public.tipo_contenido DEFAULT 'MICROLECCION'::public.tipo_contenido NOT NULL
);


ALTER TABLE public.contenidos OWNER TO postgres;

--
-- Name: docentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docentes (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
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
    fecha_ultimo_cambio timestamp(3) without time zone,
    must_change_password boolean DEFAULT true NOT NULL,
    tipo_asignacion public.tipo_asignacion_docente DEFAULT 'CLASE_GRUPOS'::public.tipo_asignacion_docente NOT NULL
);


ALTER TABLE public.docentes OWNER TO postgres;

--
-- Name: docentes_casas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docentes_casas (
    id text NOT NULL,
    docente_id text NOT NULL,
    casa_tipo public.casa_tipo NOT NULL,
    asignado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.docentes_casas OWNER TO postgres;

--
-- Name: docentes_mundos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docentes_mundos (
    id text NOT NULL,
    docente_id text NOT NULL,
    mundo_tipo public.mundo_tipo NOT NULL,
    asignado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.docentes_mundos OWNER TO postgres;

--
-- Name: docentes_rutas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.docentes_rutas (
    id text NOT NULL,
    "docenteId" text NOT NULL,
    "rutaId" text NOT NULL,
    "sectorId" text NOT NULL,
    "asignadoEn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.docentes_rutas OWNER TO postgres;

--
-- Name: estados_clase_grupo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estados_clase_grupo (
    id text NOT NULL,
    asignacion_id text NOT NULL,
    clase_id text NOT NULL,
    teoria_activa boolean DEFAULT false NOT NULL,
    practica_activa boolean DEFAULT false NOT NULL,
    activada_en timestamp(3) without time zone,
    completada_en timestamp(3) without time zone
);


ALTER TABLE public.estados_clase_grupo OWNER TO postgres;

--
-- Name: estudiantes; Type: TABLE; Schema: public; Owner: postgres
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
    casa_id text,
    nivel_actual integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar_gradient integer DEFAULT 0 NOT NULL,
    edad integer NOT NULL,
    email text,
    password_hash text,
    fecha_ultimo_cambio timestamp(3) without time zone,
    roles jsonb DEFAULT '["estudiante"]'::jsonb NOT NULL,
    sector_id text,
    estado_acceso public."EstadoAccesoEstudiante" DEFAULT 'ACTIVO'::public."EstadoAccesoEstudiante" NOT NULL,
    fecha_vencimiento_plan timestamp(3) without time zone,
    notas_plan text,
    plan_id text,
    acceso_override boolean DEFAULT false NOT NULL,
    acceso_override_hasta timestamp(3) without time zone,
    acceso_override_motivo text
);


ALTER TABLE public.estudiantes OWNER TO postgres;

--
-- Name: eventos; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.eventos OWNER TO postgres;

--
-- Name: grupos; Type: TABLE; Schema: public; Owner: postgres
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    casa_tipo public.casa_tipo,
    mundo_tipo public.mundo_tipo
);


ALTER TABLE public.grupos OWNER TO postgres;

--
-- Name: historial_acceso_estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_acceso_estudiante (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accion text NOT NULL,
    origen text NOT NULL,
    origen_id text,
    estado_anterior jsonb,
    estado_nuevo jsonb,
    ejecutado_por text,
    metadata jsonb
);


ALTER TABLE public.historial_acceso_estudiante OWNER TO postgres;

--
-- Name: historial_cambio_precios; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.historial_cambio_precios OWNER TO postgres;

--
-- Name: historial_estado_suscripcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_estado_suscripcion (
    id text NOT NULL,
    suscripcion_id text NOT NULL,
    estado_anterior public."EstadoSuscripcion",
    estado_nuevo public."EstadoSuscripcion" NOT NULL,
    motivo text,
    realizado_por text,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.historial_estado_suscripcion OWNER TO postgres;

--
-- Name: inscripciones_clase; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.inscripciones_clase OWNER TO postgres;

--
-- Name: inscripciones_clase_grupo; Type: TABLE; Schema: public; Owner: postgres
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    tipo_acceso public.tipo_acceso_inscripcion DEFAULT 'SINCRONICO'::public.tipo_acceso_inscripcion NOT NULL
);


ALTER TABLE public.inscripciones_clase_grupo OWNER TO postgres;

--
-- Name: inscripciones_comision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inscripciones_comision (
    id text NOT NULL,
    comision_id text NOT NULL,
    estudiante_id text NOT NULL,
    estado public."EstadoInscripcionComision" DEFAULT 'Pendiente'::public."EstadoInscripcionComision" NOT NULL,
    fecha_inscripcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notas text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inscripciones_comision OWNER TO postgres;

--
-- Name: inscripciones_mensuales; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.inscripciones_mensuales OWNER TO postgres;

--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    ip character varying(45) NOT NULL,
    success boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.login_attempts OWNER TO postgres;

--
-- Name: logros_estudiantes_gamificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logros_estudiantes_gamificacion (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    logro_id text NOT NULL,
    fecha_desbloqueo timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    visto boolean DEFAULT false NOT NULL
);


ALTER TABLE public.logros_estudiantes_gamificacion OWNER TO postgres;

--
-- Name: logros_gamificacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logros_gamificacion (
    id text NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
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


ALTER TABLE public.logros_gamificacion OWNER TO postgres;

--
-- Name: mundos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mundos (
    id text NOT NULL,
    tipo public.mundo_tipo NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    icono text NOT NULL,
    color_primary text NOT NULL,
    color_secondary text NOT NULL,
    color_accent text NOT NULL,
    gradiente text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.mundos OWNER TO postgres;

--
-- Name: nodos_contenido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nodos_contenido (
    id text NOT NULL,
    contenido_id text NOT NULL,
    parent_id text,
    titulo text NOT NULL,
    bloqueado boolean DEFAULT false NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    contenido_json text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.nodos_contenido OWNER TO postgres;

--
-- Name: notas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas (
    id text NOT NULL,
    evento_id text NOT NULL,
    contenido text NOT NULL,
    categoria text,
    color text DEFAULT '#8b5cf6'::text NOT NULL
);


ALTER TABLE public.notas OWNER TO postgres;

--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- Name: observaciones_docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.observaciones_docente (
    id text NOT NULL,
    docente_id text NOT NULL,
    comision_id text,
    contenido text NOT NULL,
    fecha_evento timestamp(3) without time zone NOT NULL,
    tipo public.tipo_observacion NOT NULL,
    prioridad public.prioridad_observacion DEFAULT 'Baja'::public.prioridad_observacion NOT NULL,
    requiere_seguimiento boolean DEFAULT false NOT NULL,
    notificar_admin boolean DEFAULT false NOT NULL,
    notificar_pedagogia boolean DEFAULT false NOT NULL,
    estado public.estado_observacion DEFAULT 'Abierta'::public.estado_observacion NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.observaciones_docente OWNER TO postgres;

--
-- Name: observaciones_estudiantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.observaciones_estudiantes (
    observacion_id text NOT NULL,
    estudiante_id text NOT NULL
);


ALTER TABLE public.observaciones_estudiantes OWNER TO postgres;

--
-- Name: pagos_suscripcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos_suscripcion (
    id text NOT NULL,
    suscripcion_id text NOT NULL,
    mp_payment_id text NOT NULL,
    mp_status text NOT NULL,
    mp_status_detail text,
    monto numeric(10,2) NOT NULL,
    moneda text DEFAULT 'ARS'::text NOT NULL,
    periodo_inicio timestamp(3) without time zone NOT NULL,
    periodo_fin timestamp(3) without time zone NOT NULL,
    intento_numero integer DEFAULT 1 NOT NULL,
    error_code text,
    error_message text,
    fecha_cobro timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pagos_suscripcion OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    user_type character varying(20) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: planes_suscripcion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planes_suscripcion (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    precio_base numeric(10,2) NOT NULL,
    moneda text DEFAULT 'ARS'::text NOT NULL,
    intervalo public."IntervaloSuscripcion" DEFAULT 'MENSUAL'::public."IntervaloSuscripcion" NOT NULL,
    intervalo_cantidad integer DEFAULT 1 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.planes_suscripcion OWNER TO postgres;

--
-- Name: planificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planificaciones (
    id text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    cantidad_clases integer NOT NULL,
    casa_tipo public.casa_tipo NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duracion_clase_dias integer DEFAULT 7 NOT NULL,
    estado public.estado_contenido DEFAULT 'BORRADOR'::public.estado_contenido NOT NULL,
    mundo_tipo public.mundo_tipo NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.planificaciones OWNER TO postgres;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    subcategoria text,
    imagen_portada text
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: progreso_contenidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progreso_contenidos (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    contenido_id text NOT NULL,
    completado boolean DEFAULT false NOT NULL,
    tiempo_total_segundos integer DEFAULT 0 NOT NULL,
    fecha_inicio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ultima_actividad timestamp(3) without time zone NOT NULL,
    fecha_completitud timestamp(3) without time zone,
    nodo_actual_id text
);


ALTER TABLE public.progreso_contenidos OWNER TO postgres;

--
-- Name: progresos_clase_estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progresos_clase_estudiante (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    clase_id text NOT NULL,
    teoria_completada boolean DEFAULT false NOT NULL,
    teoria_completada_en timestamp(3) without time zone,
    practica_completada boolean DEFAULT false NOT NULL,
    practica_completada_en timestamp(3) without time zone,
    tiempo_teoria_segundos integer DEFAULT 0 NOT NULL,
    tiempo_practica_segundos integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.progresos_clase_estudiante OWNER TO postgres;

--
-- Name: progresos_tarea_estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progresos_tarea_estudiante (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    tarea_asignada_id text NOT NULL,
    estado public.estado_tarea DEFAULT 'PENDIENTE'::public.estado_tarea NOT NULL,
    iniciada_en timestamp(3) without time zone,
    completada_en timestamp(3) without time zone,
    tiempo_total_segundos integer DEFAULT 0 NOT NULL,
    intentos integer DEFAULT 0 NOT NULL,
    calificacion double precision
);


ALTER TABLE public.progresos_tarea_estudiante OWNER TO postgres;

--
-- Name: puntos_obtenidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntos_obtenidos (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    docente_id text NOT NULL,
    clase_id text,
    puntos integer NOT NULL,
    contexto text,
    fecha_otorgado timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    tipo_accion text DEFAULT 'ASISTENCIA'::text NOT NULL
);


ALTER TABLE public.puntos_obtenidos OWNER TO postgres;

--
-- Name: rachas_estudiantes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.rachas_estudiantes OWNER TO postgres;

--
-- Name: reacciones_feed; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reacciones_feed (
    id text NOT NULL,
    actividad_id text NOT NULL,
    estudiante_id text NOT NULL,
    emoji text NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reacciones_feed OWNER TO postgres;

--
-- Name: recordatorios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recordatorios (
    id text NOT NULL,
    evento_id text NOT NULL,
    completado boolean DEFAULT false NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL
);


ALTER TABLE public.recordatorios OWNER TO postgres;

--
-- Name: recursos_estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recursos_estudiante (
    id text NOT NULL,
    estudiante_id text NOT NULL,
    xp_total integer DEFAULT 0 NOT NULL,
    ultima_actualizacion timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.recursos_estudiante OWNER TO postgres;

--
-- Name: refresh_token_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_token_sessions (
    id character varying(36) NOT NULL,
    user_type character varying(20) NOT NULL,
    ip_address character varying(45),
    user_agent character varying(500),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_used_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    revoked_reason character varying(50),
    user_id character varying(30) NOT NULL
);


ALTER TABLE public.refresh_token_sessions OWNER TO postgres;

--
-- Name: rutas_especialidad; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.rutas_especialidad OWNER TO postgres;

--
-- Name: secret_rotations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.secret_rotations OWNER TO postgres;

--
-- Name: sectores; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.sectores OWNER TO postgres;

--
-- Name: seguimientos_observacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seguimientos_observacion (
    id text NOT NULL,
    observacion_id text NOT NULL,
    autor_id text NOT NULL,
    autor_tipo public.tipo_autor_seguimiento NOT NULL,
    contenido text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.seguimientos_observacion OWNER TO postgres;

--
-- Name: suscripciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suscripciones (
    id text NOT NULL,
    tutor_id text NOT NULL,
    plan_id text NOT NULL,
    mp_preapproval_id text,
    mp_status text,
    estado public."EstadoSuscripcion" DEFAULT 'PENDIENTE'::public."EstadoSuscripcion" NOT NULL,
    fecha_inicio timestamp(3) without time zone,
    fecha_proximo_cobro timestamp(3) without time zone,
    fecha_cancelacion timestamp(3) without time zone,
    fecha_pausa timestamp(3) without time zone,
    fecha_fin_pausa timestamp(3) without time zone,
    dias_gracia_usados integer DEFAULT 0 NOT NULL,
    fecha_inicio_gracia timestamp(3) without time zone,
    descuento_porcentaje integer DEFAULT 0 NOT NULL,
    precio_final numeric(10,2) NOT NULL,
    motivo_cancelacion text,
    cancelado_por text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    version integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.suscripciones OWNER TO postgres;

--
-- Name: tareas; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.tareas OWNER TO postgres;

--
-- Name: tareas_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tareas_admin (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    priority public.prioridad_tarea DEFAULT 'MEDIA'::public.prioridad_tarea NOT NULL,
    status public.estado_tarea DEFAULT 'PENDIENTE'::public.estado_tarea NOT NULL,
    "dueDate" timestamp(3) without time zone,
    assignee text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tareas_admin OWNER TO postgres;

--
-- Name: tareas_asignadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tareas_asignadas (
    id text NOT NULL,
    asignacion_id text NOT NULL,
    tarea_clase_id text NOT NULL,
    fecha_asignacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_limite timestamp(3) without time zone,
    activa boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tareas_asignadas OWNER TO postgres;

--
-- Name: tareas_clase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tareas_clase (
    id text NOT NULL,
    clase_id text NOT NULL,
    contenido_id text NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    obligatoria boolean DEFAULT false NOT NULL
);


ALTER TABLE public.tareas_clase OWNER TO postgres;

--
-- Name: tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tiers (
    id text NOT NULL,
    nombre public.tier_nombre NOT NULL,
    precio_mensual integer NOT NULL,
    mundos_async integer NOT NULL,
    mundos_sync integer NOT NULL,
    tiene_docente boolean DEFAULT false NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tiers OWNER TO postgres;

--
-- Name: transacciones_recurso; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.transacciones_recurso OWNER TO postgres;

--
-- Name: tutores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tutores (
    id text NOT NULL,
    username text,
    email text,
    password_hash text NOT NULL,
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


ALTER TABLE public.tutores OWNER TO postgres;

--
-- Name: webhooks_processed; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.webhooks_processed OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d231c044-7348-4058-a3e6-ddd58cea4b94	2518b58a5f892259f46cd95ef819617f2f8c9a49d2177dc0f7218f38f40a15ac	2026-01-06 00:03:55.339359-03	0_init		\N	2026-01-06 00:03:55.339359-03	0
23d7348c-4085-4100-b10c-2dd00fa8896a	1fb3a7a74c82f4b5f94b3a3cf245826bb209ad476bc2fc72121919f79978d4eb	2026-01-06 18:02:53.668539-03	20260106_add_livekit_to_comision	\N	\N	2026-01-06 18:02:53.655043-03	1
5f0aaa34-c1bb-4595-80c8-e74131559a43	4ffd2079415845bf0c2e66a12b8e6d4ae9f8e688ace3e9366c4d20d8592ddb4c	2026-01-07 17:34:17.607123-03	20260107203358_add_planificaciones_system	\N	\N	2026-01-07 17:34:17.565407-03	1
fa2dbc9c-5076-44c0-af68-155d13ce9727	e60046c3ad97d447cd42129025e96b68585372af4728604784278976a7b2af40	2026-01-08 09:26:20.839922-03	20260108122620_add_actividad_feed	\N	\N	2026-01-08 09:26:20.816135-03	1
dac941ec-6f35-4c4e-b882-ff80c80c6ebe	d33480650b43155563ecb6d4ef033ec0b67570468e82e914535fe5b6459ed63c	2026-01-09 20:41:55.474438-03	20260109233547_fix_contenido_creador_nullable	\N	\N	2026-01-09 20:41:55.461391-03	1
28d1d89f-45cf-48f1-adc2-3ce3b1ca4934	4529433ecad2d2ced7e3c524eb863a961f1b430ef5e479a581a9a72a985a5e3e	2026-01-10 07:19:57.874571-03	20260110101957_sistema_casa_mundo_2026	\N	\N	2026-01-10 07:19:57.85888-03	1
\.


--
-- Data for Name: actividad_feed; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actividad_feed (id, estudiante_id, tipo, mensaje, xp_ganado, metadata, creado_en, casa_id) FROM stdin;
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, email, password_hash, fecha_ultimo_cambio, nombre, apellido, fecha_registro, "createdAt", "updatedAt", dni, roles, telefono, mfa_secret, mfa_enabled, mfa_backup_codes) FROM stdin;
cmk8js7df00008jbqbr0qt8z6	admin@test.com	$2b$12$aC7QCBHI1dIWSpACeYSEPOfyOVK8DlIKmGhVJvIIS2xQvfRuQq.hW	\N	Admin	Test	2026-01-10 16:56:54.864	2026-01-10 16:56:54.864	2026-01-10 16:57:16.371	\N	["admin"]	\N	\N	f	{}
cmk8m0akw00038jwnjpx8necd	admin-i9y43de3c48fa4u3sjb4oim6@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.505	2026-01-10 17:59:11.505	2026-01-10 17:59:11.505	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0alc00058jwnlmrv8cpu	admin-rwn4rtfiypca42krt9tygzh0@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.52	2026-01-10 17:59:11.52	2026-01-10 17:59:11.52	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0aln00078jwn3dy5hmmb	admin-k5ffq82kds8nmfzxvs2bs4q7@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.531	2026-01-10 17:59:11.531	2026-01-10 17:59:11.531	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0alz00098jwnehcnijx7	admin-ltkg3k3ukkcj1z0myfsujy1b@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.543	2026-01-10 17:59:11.543	2026-01-10 17:59:11.543	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0ama000b8jwnbprhi82y	admin-cpv7ahksalcv9wbfx2v55zns@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.554	2026-01-10 17:59:11.554	2026-01-10 17:59:11.554	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0amo000d8jwn9xwkp8av	admin-l647uxws1eax8ee8m6478l8w@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.568	2026-01-10 17:59:11.568	2026-01-10 17:59:11.568	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0an5000f8jwnm6hoql33	admin-w9mjfkafwq7iaos0y5mb947g@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.586	2026-01-10 17:59:11.586	2026-01-10 17:59:11.586	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0ang000h8jwn7a52y2al	admin-c9tipllwgq48eq446dzf0ded@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.596	2026-01-10 17:59:11.596	2026-01-10 17:59:11.596	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0anx000j8jwnr76npx8p	admin-njxclvcb0uvstwt27n5qobi8@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.613	2026-01-10 17:59:11.613	2026-01-10 17:59:11.613	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0ao7000l8jwnotiw0y1b	admin-fgbip31n8evu3x74n3n9mk1q@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.623	2026-01-10 17:59:11.623	2026-01-10 17:59:11.623	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0aow000n8jwnjzofqs1e	admin-g4c71uiubx3pjch8bc2okk2c@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.649	2026-01-10 17:59:11.649	2026-01-10 17:59:11.649	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0apc000p8jwn8bq40k2n	admin-uyvgcl119lqgttwhbjcz6fpv@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.664	2026-01-10 17:59:11.664	2026-01-10 17:59:11.664	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0apn000r8jwnlas5mukf	admin-c1gctobu83ivo0n4o5lnsg6i@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.675	2026-01-10 17:59:11.675	2026-01-10 17:59:11.675	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0aqv000t8jwny4rvly0u	admin-qlhu9rury7iy2eb8rmtpdiov@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.72	2026-01-10 17:59:11.72	2026-01-10 17:59:11.72	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0ar5000v8jwnup50sipp	admin-yu9qpdtragz1sxbqtyugckrb@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.729	2026-01-10 17:59:11.729	2026-01-10 17:59:11.729	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0ark000x8jwnzklkc6g4	admin-echqatgf9ygepf7pipsl72za@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.745	2026-01-10 17:59:11.745	2026-01-10 17:59:11.745	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0arw000z8jwnv1qofpmm	admin-smq711s50zzcsfyj1co3m59z@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.756	2026-01-10 17:59:11.756	2026-01-10 17:59:11.756	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0asl00118jwnv5sxd35z	admin-rq38vrv7fym2b2bugpzioldv@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.782	2026-01-10 17:59:11.782	2026-01-10 17:59:11.782	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0at100138jwnjoexcjbg	admin-mh1kzs52o4lv7kxoiuu1rx4b@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.797	2026-01-10 17:59:11.797	2026-01-10 17:59:11.797	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0atq00158jwn9rm1ptzi	admin-odajo6n038jf7lat4vtjscoy@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.823	2026-01-10 17:59:11.823	2026-01-10 17:59:11.823	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0aua00178jwnme4va4fg	admin-o7968j2yeeva92234mkblyfu@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.843	2026-01-10 17:59:11.843	2026-01-10 17:59:11.843	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0auk00198jwnr2igo623	admin-vdconwql7d2s8drlzzlq4q4s@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.853	2026-01-10 17:59:11.853	2026-01-10 17:59:11.853	\N	"[\\"admin\\"]"	\N	\N	f	{}
cmk8m0av0001b8jwn8lb7i37x	admin-ki7gs0vtcprjsw0nojos4ve2@test.com	hash-admin-123	\N	Admin	Test	2026-01-10 17:59:11.869	2026-01-10 17:59:11.869	2026-01-10 17:59:11.869	\N	"[\\"admin\\"]"	\N	\N	f	{}
\.


--
-- Data for Name: alertas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alertas (id, estudiante_id, clase_id, descripcion, fecha, resuelta, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asignaciones_planificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignaciones_planificacion (id, planificacion_id, clase_grupo_id, docente_id, activa, created_at, fecha_inicio, updated_at) FROM stdin;
\.


--
-- Data for Name: asistencia_comision; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencia_comision (id, comision_id, estudiante_id, fecha, estado, observacion, created_at) FROM stdin;
\.


--
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias (id, clase_id, estudiante_id, estado, observaciones, puntos_otorgados, fecha_registro, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asistencias_clase_grupo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias_clase_grupo (id, clase_grupo_id, estudiante_id, fecha, estado, observaciones, feedback, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asistencias_live; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias_live (id, clase_grupo_id, estudiante_id, entro_en, salio_en, duracion_minutos, levanta_mano, esta_muteado, camara_encendida, compartiendo_pantalla, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "timestamp", user_id, user_type, user_email, action, entity_type, entity_id, description, changes, metadata, severity, category, ip_address, user_agent, request_id, created_at) FROM stdin;
cmjghx2za00008jzes36zxr9n	2025-12-22 01:47:10.293	cmjghf0s700058jk6du26h0d9	tutor	juan.perez@docente.com	login	Auth	\N	Usuario juan.perez@docente.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-22 01:47:10.294
cmjgi058300018jze8psruspe	2025-12-22 01:49:33.171	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	curl/8.17.0	\N	2025-12-22 01:49:33.172
cmjgi4g5300028jze7yd26v4v	2025-12-22 01:52:53.942	cmjghf0s700058jk6du26h0d9	tutor	juan.perez@docente.com	login	Auth	\N	Usuario juan.perez@docente.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	curl/8.17.0	\N	2025-12-22 01:52:53.943
cmjgi4ggp00038jzebb7p4qw8	2025-12-22 01:52:54.359	cmjghf0u200068jk6zf135klb	tutor	maria.garcia@tutor.com	login	Auth	\N	Usuario maria.garcia@tutor.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	curl/8.17.0	\N	2025-12-22 01:52:54.361
cmjj2s97c00008jgnrypwfqgc	2025-12-23 21:06:49.364	cmjghf0u200068jk6zf135klb	tutor	maria.garcia@tutor.com	login	Auth	\N	Usuario maria.garcia@tutor.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 21:06:49.368
cmjj2sshb00018jgn2kbt26j2	2025-12-23 21:07:14.348	cmjghf0u200068jk6zf135klb	TUTOR	maria.garcia@tutor.com	logout	Auth	\N	Usuario maria.garcia@tutor.com (TUTOR) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 21:07:14.351
cmjj2t0aj00028jgnzerbefoc	2025-12-23 21:07:24.475	cmjghf0s700058jk6du26h0d9	tutor	juan.perez@docente.com	login	Auth	\N	Usuario juan.perez@docente.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 21:07:24.476
cmjj2wefi00038jgn6w09od85	2025-12-23 21:10:02.765	cmjghf0s700058jk6du26h0d9	tutor	juan.perez@docente.com	login	Auth	\N	Usuario juan.perez@docente.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 21:10:02.766
cmjj32fny00048jgnyoteja65	2025-12-23 21:14:44.301	cmjghf0s700058jk6du26h0d9	tutor	juan.perez@docente.com	login	Auth	\N	Usuario juan.perez@docente.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 21:14:44.302
cmjj53twu00008j1xms47zrav	2025-12-23 22:11:48.653	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 22:11:48.655
cmjj5ene300008jnfle1gbwj8	2025-12-23 22:20:13.418	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 22:20:13.42
cmjj5ez4100018jnffznbpwrs	2025-12-23 22:20:28.608	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 22:20:28.609
cmjj5h4mp00008jflsxvp50lw	2025-12-23 22:22:09.072	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 22:22:09.073
cmjj5mpv700018jflp3h7jqqv	2025-12-23 22:26:29.871	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-23 22:26:29.875
cmjjdqd8n00008jath6gtns7o	2025-12-24 02:13:17.058	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-24 02:13:17.063
cmjjexl1n00008jplvjk8jofg	2025-12-24 02:46:53.386	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-24 02:46:53.387
cmjpsxlf400008jahbyuehkqx	2025-12-28 14:05:25.551	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-28 14:05:25.552
cmjpxhee100008js34om5qo44	2025-12-28 16:12:48.023	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-28 16:12:48.025
cmjpxvish000b8js3rv0myek7	2025-12-28 16:23:46.913	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-28 16:23:46.914
cmjpyew9200008jfl405ow7xa	2025-12-28 16:38:50.821	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-28 16:38:50.823
cmjpzm5ts00008jtomkihabkn	2025-12-28 17:12:29.439	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-28 17:12:29.44
cmjrzaxy500008j662kghrcv9	2025-12-30 02:39:18.364	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	curl/8.17.0	\N	2025-12-30 02:39:18.365
cmjrzd6jo00018j66f1f6xpn9	2025-12-30 02:41:02.819	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 02:41:02.82
cmjsiwpia00008jwppbott0pk	2025-12-30 11:48:06.559	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 11:48:06.56
cmjsj1y7000018jwpk2ktlmum	2025-12-30 11:52:11.1	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 11:52:11.101
cmjsjtgqf00028jwpv9sf61vk	2025-12-30 12:13:34.838	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 12:13:34.84
cmjsjwx4p00038jwpbbvdym40	2025-12-30 12:16:16.056	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 12:16:16.058
cmjskix4m00048jwpk7argyl9	2025-12-30 12:33:22.481	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 12:33:22.486
cmjskp07i00058jwplya8nx7g	2025-12-30 12:38:06.411	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 12:38:06.414
cmjskpn7x00068jwphchyhnpx	2025-12-30 12:38:36.235	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 12:38:36.237
cmjsp1dkw00078jwpc0gug70d	2025-12-30 14:39:42.079	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 14:39:42.081
cmjsren9g00088jwpka5a5hqb	2025-12-30 15:46:00.387	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 15:46:00.389
cmjsrmeyl00098jwp9e8d1u7x	2025-12-30 15:52:02.877	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 15:52:02.878
cmjsrpqh100008j0ea44glapw	2025-12-30 15:54:37.765	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 15:54:37.765
cmjssb06c00008jrm7u6ndmrg	2025-12-30 16:11:10.115	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:11:10.116
cmjsse9ha00008joayfdd8tfz	2025-12-30 16:13:42.141	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:13:42.142
cmjssi4ap00008jry7xwookxr	2025-12-30 16:16:42.048	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:16:42.049
cmjsskpi300008j7p74yd6x3k	2025-12-30 16:18:42.841	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:18:42.843
cmjssp3m300008je6ljqdw5xo	2025-12-30 16:22:07.754	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:22:07.755
cmjssv1zx00018je6v04l21ir	2025-12-30 16:26:45.595	cmjghf0vz00088jk6crkslc8e	ESTUDIANTE	lucas.garcia@email.com	logout	Auth	\N	Usuario lucas.garcia@email.com (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:26:45.597
cmjssv5f400028je62gs8xoyc	2025-12-30 16:26:50.031	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:26:50.032
cmjstb5p600038je6pqt40ik8	2025-12-30 16:39:16.889	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 16:39:16.89
cmjsy1x9k00048je66e4y5eea	2025-12-30 18:52:04.135	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 18:52:04.136
cmjsy2icv00058je60btrmsz1	2025-12-30 18:52:31.471	demo-estudiante	estudiante	demo@estudiante.com	login	Auth	\N	Usuario demo@estudiante.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 18:52:31.472
cmjt1450v000a8je67b4bpwv6	2025-12-30 20:17:46.349	cmjghf0vz00088jk6crkslc8e	estudiante	lucas.garcia@email.com	login	Auth	\N	Usuario lucas.garcia@email.com (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-30 20:17:46.351
cmjt9ulpx00008jv0tkwyuogk	2025-12-31 00:22:17.972	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 00:22:17.973
cmjt9uody00018jv0edy76ygv	2025-12-31 00:22:21.429	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 00:22:21.43
cmjt9zwk500078jv0fzm98nyf	2025-12-31 00:26:25.3	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 00:26:25.301
cmjtaggyg00088jv0m7tb6a5s	2025-12-31 00:39:18.231	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 00:39:18.232
cmjtajzvv00008j00a3pfob10	2025-12-31 00:42:02.729	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 00:42:02.732
cmjtbhk2d00018j00d5kdpnwt	2025-12-31 01:08:08.533	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 01:08:08.534
cmjtbkdv800078j00ocy3recw	2025-12-31 01:10:20.466	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 01:10:20.469
cmjtbmqg6000d8j0011k5ypi7	2025-12-31 01:12:10.085	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 01:12:10.086
cmju08na400008j5etjjb9ib1	2025-12-31 12:41:03.195	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 12:41:03.196
cmjuhamez00008jkg4os66prq	2025-12-31 20:38:28.858	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 20:38:28.859
cmjuoc5tp00008j2evr3886ul	2025-12-31 23:55:37.981	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2025-12-31 23:55:37.982
cmjuoj8lp00008jviitflzvz3	2026-01-01 00:01:08.171	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-01 00:01:08.172
cmjuowr0j00008j3272q89hqp	2026-01-01 00:11:38.559	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-01 00:11:38.562
cmjuq5q3l00008jm1lzt4t2fk	2026-01-01 00:46:36.897	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-01 00:46:36.898
cmjuq5urp00018jm12sg19qm1	2026-01-01 00:46:42.948	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-01 00:46:42.95
cmjv07kcs00008jmbfgaxyaue	2026-01-01 05:27:58.924	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-01 05:27:58.925
cmjwxnk9s00008j1n1zl8pdft	2026-01-02 13:51:58.815	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 13:51:58.816
cmjwybsdq00008jnxla2jzfvz	2026-01-02 14:10:49.067	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:10:49.07
cmjwyccr000018jnx5zzwq0dg	2026-01-02 14:11:15.467	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:11:15.468
cmjwynyj600008j3987fsgx2d	2026-01-02 14:20:16.913	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:20:16.915
cmjwyqlsy00008jduh8gsjpif	2026-01-02 14:22:20.385	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:22:20.386
cmjwzad7z000r8jduzvs8okof	2026-01-02 14:37:42.383	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:37:42.384
cmjwzaofc000s8jdu552aa80q	2026-01-02 14:37:56.903	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:37:56.904
cmjwzmpep000t8jduy8qolngx	2026-01-02 14:47:18.049	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 14:47:18.049
cmjx153qr000x8jduuo4ej9iz	2026-01-02 15:29:36.05	cmjghf0p500008jk6d9daxbk2	ADMIN	admin@mateatletas.com	logout	Auth	\N	Usuario admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:29:36.051
cmjx1ho9900008jdlykp0anl0	2026-01-02 15:39:22.507	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:39:22.509
cmjx1i5f000058jdlrx0wor2l	2026-01-02 15:39:44.746	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:39:44.748
cmjx1if2m00068jdlx3y2zyjp	2026-01-02 15:39:57.262	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:39:57.263
cmjx1ks0f00078jdlu3ywsub5	2026-01-02 15:41:47.342	cmjx14p2g000w8jduzlmwotg6	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:41:47.343
cmjx1ky2y00088jdl3w9switg	2026-01-02 15:41:55.21	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:41:55.211
cmjx1lis800098jdl2oa80ram	2026-01-02 15:42:22.039	cmjghf0p500008jk6d9daxbk2	ADMIN	admin@mateatletas.com	logout	Auth	\N	Usuario admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:42:22.04
cmjx1lnsq000a8jdl7ah361nh	2026-01-02 15:42:28.537	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:42:28.538
cmjx25r3s00008jl9163s60tx	2026-01-02 15:58:05.943	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 15:58:05.944
cmjx2af8o00008j4w24ef6uqu	2026-01-02 16:01:43.847	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:01:43.849
cmjx2b1f5000d8j4wvqwovape	2026-01-02 16:02:12.593	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:02:12.594
cmjx2doxx00128j4wvfmkg2bx	2026-01-02 16:04:16.388	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:04:16.389
cmjx2qhby002l8j4wd06nx6kd	2026-01-02 16:14:13.054	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:14:13.055
cmjx37hub00328j4wuh1h3ew7	2026-01-02 16:27:26.867	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:27:26.868
cmjx3hy5e003n8j4w1e1id2uu	2026-01-02 16:35:34.561	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:35:34.563
cmjx3lvuz00448j4w5ctev5oo	2026-01-02 16:38:38.218	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 16:38:38.219
cmjx4eprn004h8j4woycs8asj	2026-01-02 17:01:03.347	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 17:01:03.348
cmjx6yzqo004y8j4w4e1oh0wv	2026-01-02 18:12:48.623	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 18:12:48.625
cmjx725s8005d8j4wko2hls64	2026-01-02 18:15:16.424	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 18:15:16.425
cmjx7b2k200748j4ws1neui6t	2026-01-02 18:22:12.146	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 18:22:12.147
cmjx9662q008b8j4wt4f5pmme	2026-01-02 19:14:22.657	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:14:22.658
cmjx97vkd008c8j4wj6knvsi5	2026-01-02 19:15:42.349	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:15:42.349
cmjx9evs0008d8j4waql0uv09	2026-01-02 19:21:09.216	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:21:09.217
cmjx9qn1l008e8j4wk98uhan8	2026-01-02 19:30:17.768	cmjx14p2g000w8jduzlmwotg6	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:30:17.769
cmjx9qq47008f8j4wr917gyfg	2026-01-02 19:30:21.751	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:30:21.752
cmjxaebt9008g8j4wp41v7zfo	2026-01-02 19:48:42.955	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:48:42.956
cmjxapmre00008j7ftko4qlkf	2026-01-02 19:57:30.359	cmjx14p2g000w8jduzlmwotg6	estudiante	alexis.alexis	login	Auth	\N	Usuario alexis.alexis (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 19:57:30.362
cmjxec6iv00008jk9u7gaewve	2026-01-02 21:39:01.253	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 21:39:01.255
cmjxec95w00018jk9tvek2cye	2026-01-02 21:39:04.674	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 21:39:04.677
cmjxecaor00028jk9ct54cqat	2026-01-02 21:39:06.647	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 21:39:06.651
cmjxf47ak00008j9n4dmcz2oi	2026-01-02 22:00:48.619	cmjghf0p500008jk6d9daxbk2	ADMIN	admin@mateatletas.com	logout	Auth	\N	Usuario admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:00:48.62
cmjxf4dc400018j9n7wfqke87	2026-01-02 22:00:56.451	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:00:56.452
cmjxf4nel00028j9nu3wt48e8	2026-01-02 22:01:09.501	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:01:09.502
cmjxf6v6i00038j9n98qckbz4	2026-01-02 22:02:52.89	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:02:52.89
cmjxfblpf00048j9nybkuq6i2	2026-01-02 22:06:33.891	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:06:33.891
cmjxfclx200058j9ni4d9hyaw	2026-01-02 22:07:20.822	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:07:20.823
cmjxftma500068j9nmv0229db	2026-01-02 22:20:34.442	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:20:34.445
cmjxfuk7s00078j9nx065z49d	2026-01-02 22:21:18.423	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:21:18.424
cmjxg8lbp00088j9nkctwshqa	2026-01-02 22:32:13.044	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 22:32:13.045
cmjxh8w0a00008jpkfu4xwu4c	2026-01-02 23:00:26.505	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 23:00:26.506
cmjxi28ob00008jsqj0xsdaib	2026-01-02 23:23:15.946	cmjxf0g7000008juu6sexq6ax	DOCENTE	alexis.figueroa@mateatletas.com	logout	Auth	\N	Usuario alexis.figueroa@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 23:23:15.947
cmjxi2c8l00018jsq21uu9ae4	2026-01-02 23:23:20.565	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 23:23:20.566
cmjxi2fda00028jsqdol0nhb3	2026-01-02 23:23:24.621	cmjghf0p500008jk6d9daxbk2	tutor	admin@mateatletas.com	login	Auth	\N	Usuario admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 23:23:24.622
cmjxinvav00098jcmuec65xnc	2026-01-02 23:40:05.046	cmjghf0p500008jk6d9daxbk2	ADMIN	admin@mateatletas.com	logout	Auth	\N	Usuario admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 23:40:05.048
cmjxiny8r000a8jcmuzzwx7pt	2026-01-02 23:40:08.859	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-02 23:40:08.86
cmjxnxcoy00008jai0fgpsgs9	2026-01-03 02:07:25.57	cmjxf0g7000008juu6sexq6ax	tutor	alexis.figueroa@mateatletas.com	login	Auth	\N	Usuario alexis.figueroa@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 02:07:25.571
cmjybqtwz00018je9gd1ajbbz	2026-01-03 13:14:12.083	cmjybqtig00008je9czpove2h	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-03 13:14:12.084
cmjybqv1p00058je9ebqsyjnz	2026-01-03 13:14:13.549	cmjybquti00048je9nrq8gi9w	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-03 13:14:13.55
cmjybv4hn00018jf2ortnaeyl	2026-01-03 13:17:32.411	cmjybv42k00008jf2c6ixdmdz	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-03 13:17:32.412
cmjybv5nx00058jf2cp9ykj5x	2026-01-03 13:17:33.932	cmjybv5es00048jf2zh0eq53x	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-03 13:17:33.933
cmjyotgkm00008jdvsyhwtchv	2026-01-03 19:20:09.765	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:20:09.766
cmjyotmqa00018jdvbmj2do8e	2026-01-03 19:20:17.745	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:20:17.746
cmjypbi3000018jb6b7dgrj32	2026-01-03 19:34:11.531	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:34:11.532
cmjypbvep00028jb6voikoj00	2026-01-03 19:34:28.8	cmjypaa0600008jb6csn93sm4	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:34:28.802
cmjypiezj00038jb60ng0xa4z	2026-01-03 19:39:34.111	cmjypaa0600008jb6csn93sm4	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:39:34.111
cmjypiikr00048jb6qs3tks0o	2026-01-03 19:39:38.762	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:39:38.763
cmjypjfvz00068jb6163ygh3q	2026-01-03 19:40:21.934	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:40:21.935
cmjypjq7300078jb6p1hjgciy	2026-01-03 19:40:35.294	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:40:35.295
cmjypr7km00008j0y8flbkkrt	2026-01-03 19:46:24.404	cmjypj8a000058jb6fljslplj	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:46:24.406
cmjypre0e00018j0y28be9k2c	2026-01-03 19:46:32.75	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:46:32.751
cmjypsa5j00028j0ywj7gw6n5	2026-01-03 19:47:14.406	cmjypj8a000058jb6fljslplj	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:47:14.407
cmjypscw400038j0yb1s3t41y	2026-01-03 19:47:17.955	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:47:17.956
cmjypwia0000c8j0yqhxxzv65	2026-01-03 19:50:31.559	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:50:31.56
cmjypwkqn000d8j0ychfykc4o	2026-01-03 19:50:34.75	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:50:34.751
cmjypxm9k000e8j0ylik1uc4r	2026-01-03 19:51:23.383	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:51:23.385
cmjyq04or00008jfjujm349m6	2026-01-03 19:53:20.571	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:53:20.572
cmjyq0uxf00018jfjxg02g50i	2026-01-03 19:53:54.578	cmjypj8a000058jb6fljslplj	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:53:54.579
cmjyq0wxp00028jfjl064jyjx	2026-01-03 19:53:57.18	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 19:53:57.181
cmjyw6knj00038jfjqt74q9i0	2026-01-03 22:46:18.889	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 22:46:18.895
cmjyyn58l00048jfjmtn5jeqb	2026-01-03 23:55:11.301	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-03 23:55:11.302
cmjz0j9g800008jneex0o05oa	2026-01-04 00:48:09.367	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 00:48:09.369
cmjz0jcwo00018jney7ioxnz5	2026-01-04 00:48:13.847	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 00:48:13.848
cmjz7f9bw00008jxyonnkzyq1	2026-01-04 04:00:59.899	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 04:00:59.901
cmjz9g71800008jnzxou1i4nq	2026-01-04 04:57:42.811	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 04:57:42.812
cmjzaauw700008j0nx9m6kgfc	2026-01-04 05:21:33.414	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 05:21:33.415
cmjzbkzjw00008jkew0omjcv1	2026-01-04 05:57:25.628	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 05:57:25.629
cmjzc285l00008j36e0xftgo0	2026-01-04 06:10:49.927	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 06:10:49.929
cmjzor5qm00008jzmbqkdt703	2026-01-04 12:06:08.59	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 12:06:08.591
cmjzp2eyq00008jpjpvkp4mq1	2026-01-04 12:14:53.761	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 12:14:53.762
cmjzp2hbn00018jpjeh82y4hi	2026-01-04 12:14:56.818	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 12:14:56.82
cmjzplmfp00008js9g290zky3	2026-01-04 12:29:49.908	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 12:29:49.91
cmjzpm1c500018js9qeujnnyp	2026-01-04 12:30:09.219	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 12:30:09.221
cmk01nker00008jsahfowjqwm	2026-01-04 18:07:15.985	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:07:15.987
cmk01omef00018jsas1214ono	2026-01-04 18:08:05.222	cmjypj8a000058jb6fljslplj	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:08:05.223
cmk01or5500028jsa62g6uwlz	2026-01-04 18:08:11.369	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:08:11.37
cmk01ryh400058jsaenpq8x5s	2026-01-04 18:10:40.837	cmjypj8a000058jb6fljslplj	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:10:40.84
cmk01s0ad00068jsahgoxlwip	2026-01-04 18:10:43.188	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:10:43.189
cmk01ugbe000c8jsa2k7jnyop	2026-01-04 18:12:37.273	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:12:37.275
cmk01uj4e000d8jsawxz6m7cq	2026-01-04 18:12:40.909	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 18:12:40.91
cmk0azuza00008jomlzgn8g7t	2026-01-04 22:28:46.1	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-04 22:28:46.102
cmk0eq8jd00008js7hj15ty8d	2026-01-05 00:13:15.575	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 00:13:15.578
cmk0eqfc200018js7ywriam08	2026-01-05 00:13:24.384	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 00:13:24.386
cmk0hhxre00028js7yjowjjbj	2026-01-05 01:30:47.209	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 01:30:47.21
cmk0j4h8y00008js56h8ychzo	2026-01-05 02:16:18.513	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 02:16:18.514
cmk0kghv200008ja4ctgpwn6g	2026-01-05 02:53:38.797	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 02:53:38.798
cmk15sthq00008jow51gd8g7t	2026-01-05 12:51:05.677	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 12:51:05.679
cmk15syj200018jowp84qvezi	2026-01-05 12:51:12.205	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 12:51:12.206
cmk15tizj00028jowriqk0hxl	2026-01-05 12:51:38.718	cmjypj8a000058jb6fljslplj	DOCENTE	alexis.docente@mateatletas.com	logout	Auth	\N	Usuario alexis.docente@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 12:51:38.719
cmk15tl1600038jowx1mbocea	2026-01-05 12:51:41.37	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 12:51:41.371
cmk15zdzb00048jowvke4gdzp	2026-01-05 12:56:12.166	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 12:56:12.167
cmk15zklt00058jowx4prgqqk	2026-01-05 12:56:20.752	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 12:56:20.753
cmk192ysk00008jgckw2zfrrh	2026-01-05 14:22:57.955	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 14:22:57.956
cmk1cwl0u00018jgcbs5pmau0	2026-01-05 16:09:58.637	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:09:58.638
cmk1dskgs00008jva24jh4376	2026-01-05 16:34:50.907	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:34:50.909
cmk1duk7f00008j0tsis8po65	2026-01-05 16:36:23.882	cmjypvyfv00098j0yvyovebpw	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:36:23.884
cmk1dv41400018j0tn827vabw	2026-01-05 16:36:49.576	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:36:49.577
cmk1dx1hb00028j0tv999if5n	2026-01-05 16:38:19.583	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:38:19.584
cmk1dx52e00038j0toojih0ro	2026-01-05 16:38:24.228	cmjypvyfv00098j0yvyovebpw	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:38:24.23
cmk1dx7vk00048j0tf45xq49y	2026-01-05 16:38:27.871	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:38:27.873
cmk1dxau200058j0t9fy6zyrv	2026-01-05 16:38:31.705	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:38:31.706
cmk1e3dlw00008jdyg6irwzme	2026-01-05 16:43:15.234	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:43:15.236
cmk1e3j2100018jdy1yuhn3os	2026-01-05 16:43:22.297	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:43:22.298
cmk1e5sx900008jqebyhux311	2026-01-05 16:45:08.396	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:45:08.397
cmk1e6tp600008j88wyecdgva	2026-01-05 16:45:56.057	cmjypvyfv00098j0yvyovebpw	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:45:56.058
cmk1e6z5d00018j884nrjprgg	2026-01-05 16:46:03.121	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:46:03.122
cmk1ee4ph00028j88y6uf8v3j	2026-01-05 16:51:36.916	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 16:51:36.917
cmk1ept7m00038j88gmcipus9	2026-01-05 17:00:41.89	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 17:00:41.891
cmk1er6jv00008j2nysbwuq53	2026-01-05 17:01:45.834	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 17:01:45.835
cmk1erdmu00018j2njpbedw4k	2026-01-05 17:01:55.013	cmjypj8a000058jb6fljslplj	tutor	alexis.docente@mateatletas.com	login	Auth	\N	Usuario alexis.docente@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 17:01:55.014
cmk1etiio00028j2n0bp9c566	2026-01-05 17:03:34.655	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 17:03:34.656
cmk1gy2m100008j8ky3wl9ja0	2026-01-05 18:03:06.551	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 18:03:06.553
cmk1gze9f00018j8k1eobmg6m	2026-01-05 18:04:08.306	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 18:04:08.307
cmk1h05bb00028j8k0xalv1sl	2026-01-05 18:04:43.366	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 18:04:43.367
cmk1h4nx000008jnpuuzw0qj9	2026-01-05 18:08:14.1	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 18:08:14.101
cmk1ok4il00008ju65lv9seg6	2026-01-05 21:36:12.763	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 21:36:12.766
cmk1okud100018ju60ane63l7	2026-01-05 21:36:46.259	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 21:36:46.261
cmk1rsqnh00028ju6cy8xpet6	2026-01-05 23:06:53.548	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 23:06:53.549
cmk1s5fxl00038ju6t9if7tny	2026-01-05 23:16:46.184	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 23:16:46.185
cmk1slv6g00008jm0ezzd8k6i	2026-01-05 23:29:32.439	cmjypvyfv00098j0yvyovebpw	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 23:29:32.44
cmk1sm04600018jm0foibb8vi	2026-01-05 23:29:38.838	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-05 23:29:38.839
cmk1ui12m00028jm0yi4srv4g	2026-01-06 00:22:32.685	cmjypvyfv00098j0yvyovebpw	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 00:22:32.687
cmk1uijt400038jm0rm7dud1a	2026-01-06 00:22:56.967	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 00:22:56.969
cmk1uink200048jm0sb7h5xei	2026-01-06 00:23:01.825	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 00:23:01.826
cmk1xuzp900008j7kd0ihgglr	2026-01-06 01:56:36.284	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 01:56:36.285
cmk1xwb8u00018j7knqsbr5rg	2026-01-06 01:57:37.901	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 01:57:37.903
cmk1xwhfa00028j7kt24tw2wr	2026-01-06 01:57:45.909	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 01:57:45.91
cmk1xxdgo00038j7kanp0opk5	2026-01-06 01:58:27.43	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 01:58:27.431
cmk1yo48400048j7klm6qblmc	2026-01-06 02:19:15.171	cmjypvyfv00098j0yvyovebpw	estudiante	ayelen.yanez.8ubv	login	Auth	\N	Usuario ayelen.yanez.8ubv (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 02:19:15.172
cmk2n24ns00008jsdj64qpwth	2026-01-06 13:41:59.703	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 13:41:59.704
cmk2o7c2100008jeci9qm1ktn	2026-01-06 14:14:02.183	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:14:02.185
cmk2o9a7l00058jeckx0gzujo	2026-01-06 14:15:33.104	cmk2n7tmr00028jdq7ztusxri	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:15:33.105
cmk2o9coz00068jecy1xjx3rm	2026-01-06 14:15:36.321	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:15:36.324
cmk2ot4c5000d8jecbsv60dd6	2026-01-06 14:30:58.612	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:30:58.613
cmk2ou8l900008jb746vkimzf	2026-01-06 14:31:50.78	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:31:50.781
cmk2ov0i200018jb77zqkq2l4	2026-01-06 14:32:26.953	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:32:26.954
cmk2ovd4t00028jb74l2fz9a0	2026-01-06 14:32:43.324	cmk2n7tmr00028jdq7ztusxri	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:32:43.325
cmk2ovm4h00038jb7ip3zohjp	2026-01-06 14:32:54.977	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:32:54.977
cmk2p0in700008jo39b5ml3n0	2026-01-06 14:36:43.746	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:36:43.747
cmk2p5zxc00008jdhw6sn04sp	2026-01-06 14:40:59.424	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:40:59.425
cmk2p8e4x00008jhahbb97xxz	2026-01-06 14:42:51.152	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 14:42:51.153
cmk2t47v600008jil3bxz7fco	2026-01-06 16:31:34.865	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:31:34.866
cmk2t5y1o00008j8e5c4c0g2r	2026-01-06 16:32:55.409	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:32:55.452
cmk4dxzgn000a8jte6w5pskqi	2026-01-07 19:02:22.151	cmk4dxz7o00098jteg2rzlt74	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:02:22.152
cmk2telrf00008jry1g8vithx	2026-01-06 16:39:39.431	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:39:39.435
cmk2tesvj00018jrypdz2imu2	2026-01-06 16:39:48.655	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:39:48.656
cmk2tflcw00028jryk0n5sg80	2026-01-06 16:40:25.568	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:40:25.569
cmk2tv6as00038jryjvi95dhe	2026-01-06 16:52:32.548	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:52:32.549
cmk2tx72g00048jryqy8d00pm	2026-01-06 16:54:06.856	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:54:06.856
cmk2txcxb00058jryo948jvue	2026-01-06 16:54:14.446	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:54:14.447
cmk2u28r100068jryljxyouky	2026-01-06 16:58:02.316	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 16:58:02.318
cmk2wm27x00098jryobq1lq32	2026-01-06 18:09:26.204	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 18:09:26.206
cmk2woabr00008jgfr0eq1m4m	2026-01-06 18:11:10.022	cmjyonfck00008j4sehe8xoib	tutor	alexis.admin@mateatletas.com	login	Auth	\N	Usuario alexis.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 18:11:10.024
cmk2wom7a00018jgfvghdon6h	2026-01-06 18:11:25.414	cmjyonfck00008j4sehe8xoib	ADMIN	alexis.admin@mateatletas.com	logout	Auth	\N	Usuario alexis.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 18:11:25.415
cmk2wopkg00028jgfrdltybgk	2026-01-06 18:11:29.775	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 18:11:29.776
cmk2woxlk00038jgf86viejj5	2026-01-06 18:11:40.182	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 18:11:40.185
cmk329nyp00008jsgdraptvlr	2026-01-06 20:47:45.552	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 20:47:45.553
cmk32a6yf00018jsgrcfp8c16	2026-01-06 20:48:10.167	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 20:48:10.168
cmk339fdx00008jul8wmg7m41	2026-01-06 21:15:34.05	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 21:15:34.054
cmk339yct00018julpmlg8ati	2026-01-06 21:15:58.635	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-06 21:15:58.637
cmk39ry0g00008jm2e3r32p4g	2026-01-07 00:17:55.694	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:17:55.696
cmk39s4ge00018jm2na59l5ov	2026-01-07 00:18:04.045	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:18:04.046
cmk39w2ey00008je2ou00xoxd	2026-01-07 00:21:08.024	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:21:08.026
cmk3a1x8t00008j2dqja9fivm	2026-01-07 00:25:41.259	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:25:41.261
cmk3a4zk700008jq6a4giqeyq	2026-01-07 00:28:04.229	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:28:04.232
cmk3a58b900018jq6t0vcygsf	2026-01-07 00:28:15.573	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:28:15.573
cmk3a91tb00028jq6bodtfjjf	2026-01-07 00:31:13.773	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:31:13.775
cmk3aps1900008jsyrel20uau	2026-01-07 00:44:14.252	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:44:14.254
cmk3b5pb700018jsy9011637n	2026-01-07 00:56:37.215	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 00:56:37.219
cmk3euge300008jpb8cmquvud	2026-01-07 02:39:50.905	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 02:39:50.906
cmk3euwt000018jpbo6g7jzj9	2026-01-07 02:40:12.18	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 02:40:12.181
cmk3evb2q00028jpb230k9j8u	2026-01-07 02:40:30.672	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 02:40:30.674
cmk3gm7ju00008jlmfhwzjjeb	2026-01-07 03:29:25.433	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:29:25.435
cmk3gnsyk00018jlmaifetazb	2026-01-07 03:30:39.835	cmk2onkxq00088jeciqxn4ulm	DOCENTE	alexis.profe@mateatletas.com	logout	Auth	\N	Usuario alexis.profe@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:30:39.836
cmk3goz3g00028jlmxbots5li	2026-01-07 03:31:34.443	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:31:34.444
cmk3gpes900038jlmns7k8jvi	2026-01-07 03:31:54.776	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:31:54.777
cmk3gpl9p00048jlmxxgk6u2k	2026-01-07 03:32:03.181	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:32:03.182
cmk3ha6fe00008j667ihjcfum	2026-01-07 03:48:03.721	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:48:03.723
cmk3hbjgr00018j668jy62cl3	2026-01-07 03:49:07.274	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 03:49:07.275
cmk3iemyn00008j9wv6o0n6ym	2026-01-07 04:19:31.391	cmk2onkxq00088jeciqxn4ulm	DOCENTE	alexis.profe@mateatletas.com	logout	Auth	\N	Usuario alexis.profe@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 04:19:31.392
cmk3ifjyg00018j9wurz11cx5	2026-01-07 04:20:14.151	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 04:20:14.152
cmk3ifmat00028j9wiw1rpo3o	2026-01-07 04:20:17.188	cmk2onkxq00088jeciqxn4ulm	tutor	alexis.profe@mateatletas.com	login	Auth	\N	Usuario alexis.profe@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 04:20:17.189
cmk3irv5f00038j9wx4g1dteb	2026-01-07 04:29:48.53	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 04:29:48.531
cmk3zv70600048j9wl2gjp6eq	2026-01-07 12:28:17.332	cmk2n7tmr00028jdq7ztusxri	estudiante	emmaisabella.figueroayanez	login	Auth	\N	Usuario emmaisabella.figueroayanez (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-07 12:28:17.334
cmk49zbpf00018jmwrlhyiy8n	2026-01-07 17:11:26.21	cmk49zbfu00008jmwkclu5bpl	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:11:26.211
cmk49zc1e00068jmwr70gwnex	2026-01-07 17:11:26.642	cmk49zbsp00058jmw3z9rruk3	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:11:26.643
cmk49zcg300088jmwl6pmoprj	2026-01-07 17:11:27.171	cmk49zc8v00078jmwgvr8j0ns	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:11:27.172
cmk49zcqx000a8jmwrnushw6k	2026-01-07 17:11:27.561	cmk49zci600098jmwngygnlfz	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:11:27.562
cmk49zd1t000f8jmw6080x8s0	2026-01-07 17:11:27.953	cmk49zctb000e8jmws4lrncmn	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:11:27.954
cmk4a0tpa00fn8jmwmxmjbwdp	2026-01-07 17:12:36.19	cmk4a0thx00fm8jmw7325fnt8	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:12:36.191
cmk4a0uo200fr8jmwkw39aik2	2026-01-07 17:12:37.442	cmk4a0uh000fq8jmw4wkltja4	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 17:12:37.443
cmk4dxyf200018jte68n8gmqv	2026-01-07 19:02:20.797	cmk4dxy5300008jtevnb0h80m	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:02:20.798
cmk4dxyr000068jte0gb1e0vt	2026-01-07 19:02:21.227	cmk4dxyig00058jtejwobjgj2	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:02:21.228
cmk4dxz5h00088jte3eutv24c	2026-01-07 19:02:21.749	cmk4dxyye00078jtenlcdwfww	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:02:21.75
cmk4dxzrp000f8jtebtswhfm1	2026-01-07 19:02:22.548	cmk4dxzj3000e8jter7p87dhy	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:02:22.549
cmk4dzevl007r8jtegkuzrtcj	2026-01-07 19:03:28.784	cmk4dzenz007q8jtehzk0f6se	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:03:28.786
cmk4dzfxw007v8jteggye69hy	2026-01-07 19:03:30.164	cmk4dzfqk007u8jteayog5co1	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:03:30.164
cmk4e49ga00018ji6loxqitb9	2026-01-07 19:07:15.033	cmk4e495i00008ji6ma5j6o9o	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:07:15.034
cmk4e49uz00068ji66nlxgc2o	2026-01-07 19:07:15.562	cmk4e49jz00058ji6arozeugb	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:07:15.563
cmk4e4abq00088ji6cvnacmnn	2026-01-07 19:07:16.166	cmk4e4a3d00078ji6y4ywb5us	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:07:16.167
cmk4e4ao0000a8ji6rv6aenb1	2026-01-07 19:07:16.608	cmk4e4ae500098ji6ab8frhw7	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:07:16.608
cmk4e4b0x000f8ji6j3sv3eo5	2026-01-07 19:07:17.072	cmk4e4aqx000e8ji6xyrs5dk0	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:07:17.073
cmk4e5p04005b8ji61az41lev	2026-01-07 19:08:21.844	cmk4e5os1005a8ji6744ne8l8	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:08:21.845
cmk4e5q31005f8ji67upeshds	2026-01-07 19:08:23.244	cmk4e5pv7005e8ji6cpzxbrk9	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-07 19:08:23.245
cmk4w75bd00008j0aajc6fxpz	2026-01-08 03:33:22.728	cmk4vyyi600008j4mbtjgwe0j	tutor	alex.admin@mateatletas.com	login	Auth	\N	Usuario alex.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 03:33:22.729
cmk5dsxxp00008jvws5n4ox8e	2026-01-08 11:46:13.067	cmk4vyyi600008j4mbtjgwe0j	tutor	alex.admin@mateatletas.com	login	Auth	\N	Usuario alex.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 11:46:13.069
cmk5sw1pj00008jdn4mdza6o2	2026-01-08 18:48:32.166	cmk4vyyi600008j4mbtjgwe0j	tutor	alex.admin@mateatletas.com	login	Auth	\N	Usuario alex.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 18:48:32.168
cmk5sw98a00008jufijhoa542	2026-01-08 18:48:41.913	cmk4vyyi600008j4mbtjgwe0j	tutor	alex.admin@mateatletas.com	login	Auth	\N	Usuario alex.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 18:48:41.914
cmk5tgyx6000i8j8a64akepdk	2026-01-08 19:04:48.329	cmk5tdgv900008j8aqcljzvwp	tutor	profe_prueba@mateatletas.com	login	Auth	\N	Usuario profe_prueba@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:04:48.33
cmk5th5s3000j8j8a1sqwqe0f	2026-01-08 19:04:57.218	cmk5tdgv900008j8aqcljzvwp	tutor	profe_prueba@mateatletas.com	login	Auth	\N	Usuario profe_prueba@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:04:57.22
cmk5tjr9f000k8j8ae6clr5qt	2026-01-08 19:06:58.37	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:06:58.371
cmk5tl4xg000r8j8axw6u80p7	2026-01-08 19:08:02.74	cmk5tght1000f8j8a0auxlftc	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:08:02.741
cmk5tlg5h000s8j8aul60fxf9	2026-01-08 19:08:17.284	cmk5tdgv900008j8aqcljzvwp	tutor	profe_prueba@mateatletas.com	login	Auth	\N	Usuario profe_prueba@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:08:17.285
cmk5tm632000t8j8aezty6njd	2026-01-08 19:08:50.894	cmk4vyyi600008j4mbtjgwe0j	ADMIN	alex.admin@mateatletas.com	logout	Auth	\N	Usuario alex.admin@mateatletas.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:08:50.895
cmk5tmmpz000u8j8aggx7lkf4	2026-01-08 19:09:12.452	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 19:09:12.454
cmk5z96c9000v8j8a2lgtwql2	2026-01-08 21:46:42.392	cmk5tdgv900008j8aqcljzvwp	tutor	profe_prueba@mateatletas.com	login	Auth	\N	Usuario profe_prueba@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 21:46:42.393
cmk5zaa80000w8j8aswstu6l3	2026-01-08 21:47:34.079	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 21:47:34.081
cmk5zyxwm00008jh1i5hbw1u4	2026-01-08 22:06:44.517	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:06:44.518
cmk606n0x00018jh11wufii9j	2026-01-08 22:12:43.664	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:12:43.665
cmk60e6rr00028jh10cov1lgq	2026-01-08 22:18:35.846	cmk5tght1000f8j8a0auxlftc	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:18:35.848
cmk60ykc100008jpoj0q4uic6	2026-01-08 22:34:26.544	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:34:26.545
cmk618xy400008jqr8mkssb0o	2026-01-08 22:42:30.746	cmk5tdgv900008j8aqcljzvwp	DOCENTE	profe_prueba@mateatletas.com	logout	Auth	\N	Usuario profe_prueba@mateatletas.com (DOCENTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:42:30.748
cmk619dan00018jqr496wncni	2026-01-08 22:42:50.638	cmk4vyyi600008j4mbtjgwe0j	tutor	alex.admin@mateatletas.com	login	Auth	\N	Usuario alex.admin@mateatletas.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:42:50.639
cmk61oexl00008jujspqnfits	2026-01-08 22:54:32.6	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-08 22:54:32.601
cmk66qt3800018jujdmdh5vop	2026-01-09 01:16:22.339	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-09 01:16:22.341
cmk68vk0100028jujcgfax5b6	2026-01-09 02:16:03.072	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-09 02:16:03.073
cmk68z9of00008jmxjuhzim6p	2026-01-09 02:18:56.316	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-09 02:18:56.319
cmk6941fy00018jmx9nmtpc5k	2026-01-09 02:22:38.925	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-09 02:22:38.926
cmk69727x00028jmxhk3aj5qw	2026-01-09 02:24:59.9	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-09 02:24:59.901
cmk69pvzk00008jns09i2pryt	2026-01-09 02:39:38.287	cmk5tght1000f8j8a0auxlftc	estudiante	pablo.escobar.v1gw	login	Auth	\N	Usuario pablo.escobar.v1gw (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-09 02:39:38.289
cmk6r4far001g8j5hzy7k1dqj	2026-01-09 10:46:49.97	cmk6r4f0k001b8j5hvmd07mdk	estudiante	test_1767955609603_a9x60	login	Auth	\N	Usuario test_1767955609603_a9x60 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 10:46:49.971
cmk6r4fp3001o8j5huvldu570	2026-01-09 10:46:50.486	cmk6r4ff4001j8j5hsuadkzgw	estudiante	test_1767955610127_vhw2i	login	Auth	\N	Usuario test_1767955610127_vhw2i (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 10:46:50.487
cmk6r4g3a001z8j5hzqsjha82	2026-01-09 10:46:50.997	cmk6r4fti001u8j5hktklwmkt	estudiante	test_1767955610645_70ste	login	Auth	\N	Usuario test_1767955610645_70ste (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 10:46:50.998
cmk6r4ghv00278j5h6c20dbvm	2026-01-09 10:46:51.523	cmk6r4g7q00228j5hle255j82	estudiante	test_1767955611157_5h341	login	Auth	\N	Usuario test_1767955611157_5h341 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 10:46:51.524
cmk6r4gvx002i8j5hiokgzyut	2026-01-09 10:46:52.029	cmk6r4gm6002d8j5hrn95lakl	estudiante	test_1767955611677_bbytd	login	Auth	\N	Usuario test_1767955611677_bbytd (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 10:46:52.03
cmk6r4i7v002k8j5h9v3189lh	2026-01-09 10:46:53.754	cmk6r4hy3002j8j5h5z0jocvj	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:46:53.755
cmk6r4ikh002p8j5hl2wbxupz	2026-01-09 10:46:54.208	cmk6r4ias002o8j5hgsid8c6g	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:46:54.209
cmk6r4j0f002r8j5hkoyrvyf8	2026-01-09 10:46:54.783	cmk6r4isk002q8j5h1gwoqzus	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:46:54.783
cmk6r4jc9002t8j5hh8tsi8z1	2026-01-09 10:46:55.209	cmk6r4j2o002s8j5h5y2biogh	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:46:55.21
cmk6r4job002y8j5h389kphaa	2026-01-09 10:46:55.643	cmk6r4jer002x8j5hvuggxgmn	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:46:55.644
cmk6r6gkh00qm8j5hqv2eva8v	2026-01-09 10:48:24.929	cmk6r6gc200ql8j5h6btcz1xy	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:48:24.93
cmk6r6ho800qq8j5hc56dz3to	2026-01-09 10:48:26.359	cmk6r6hgd00qp8j5hybm13khz	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:48:26.36
cmk6r7o2d00018jai9algaqq1	2026-01-09 10:49:21.3	cmk6r7nrj00008jaiilczo1b1	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:49:21.301
cmk6r921y001u8jainpqwqsh8	2026-01-09 10:50:26.086	cmk6r91rq001p8jail30nrinh	estudiante	test_1767955825717_d25rb	login	Auth	\N	Usuario test_1767955825717_d25rb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 10:50:26.087
cmk6r92ge00228jairz99bwwn	2026-01-09 10:50:26.605	cmk6r926d001x8jaib9o53vxl	estudiante	test_1767955826244_v4y5g	login	Auth	\N	Usuario test_1767955826244_v4y5g (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 10:50:26.606
cmk6r92vd002d8jaip267wsfr	2026-01-09 10:50:27.144	cmk6r92le00288jaiuf4tg2wm	estudiante	test_1767955826786_jegdb	login	Auth	\N	Usuario test_1767955826786_jegdb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 10:50:27.145
cmk6r939z002l8jaiwcv912mp	2026-01-09 10:50:27.67	cmk6r92zu002g8jaiw9v1230f	estudiante	test_1767955827305_u0erb	login	Auth	\N	Usuario test_1767955827305_u0erb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 10:50:27.671
cmk6r93oj002w8jaii3rvrodv	2026-01-09 10:50:28.194	cmk6r93eg002r8jaivqrjmgyp	estudiante	test_1767955827831_br9li	login	Auth	\N	Usuario test_1767955827831_br9li (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 10:50:28.195
cmk6r9r8600qv8jaigvue0bd0	2026-01-09 10:50:58.709	cmk6r9r0000qu8jai05sghm0n	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:50:58.71
cmk6r9sc700qz8jaif0rfx3j5	2026-01-09 10:51:00.15	cmk6r9s4600qy8jaij5zovnwu	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:51:00.151
cmk6re4df00018jnemr3mt6rg	2026-01-09 10:54:22.37	cmk6re43t00008jnegumhwls8	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:54:22.371
cmk6re4pj00068jnesnafb3dq	2026-01-09 10:54:22.806	cmk6re4hb00058jne0y3ikziq	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:54:22.807
cmk6re53z00088jne085arftj	2026-01-09 10:54:23.326	cmk6re4x000078jnefwwiwdzu	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:54:23.327
cmk6re5f0000a8jneoqpxrktw	2026-01-09 10:54:23.724	cmk6re56500098jne5us3h1q4	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:54:23.725
cmk6re5pj000f8jneojg0shk8	2026-01-09 10:54:24.103	cmk6re5hb000e8jnecrkaboxl	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:54:24.103
cmk6rfrsy00dj8jnegjf5z4gw	2026-01-09 10:55:39.394	cmk6rfrjh00de8jne47kpi2g5	estudiante	test_1767956139053_sja2m	login	Auth	\N	Usuario test_1767956139053_sja2m (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 10:55:39.395
cmk6rfs7a00dr8jnekhi6pft5	2026-01-09 10:55:39.909	cmk6rfrxc00dm8jnen2rzthpn	estudiante	test_1767956139551_695go	login	Auth	\N	Usuario test_1767956139551_695go (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 10:55:39.911
cmk6rfsl700e28jneswooc6kb	2026-01-09 10:55:40.41	cmk6rfsbj00dx8jneql548w7q	estudiante	test_1767956140062_8cp66	login	Auth	\N	Usuario test_1767956140062_8cp66 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 10:55:40.411
cmk6rfszk00ea8jnek7i9z9gf	2026-01-09 10:55:40.927	cmk6rfspl00e58jnej5nkv0tt	estudiante	test_1767956140568_79bsv	login	Auth	\N	Usuario test_1767956140568_79bsv (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 10:55:40.928
cmk6rftdi00el8jneu5uvlfd7	2026-01-09 10:55:41.43	cmk6rft4b00eg8jnexy2ti7y3	estudiante	test_1767956141098_7o3jl	login	Auth	\N	Usuario test_1767956141098_7o3jl (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 10:55:41.431
cmk6rg5k400qm8jnepeqixqe4	2026-01-09 10:55:57.219	cmk6rg5cv00ql8jnephsjpf48	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:55:57.22
cmk6rg6hw00qq8jnenvxchgsu	2026-01-09 10:55:58.436	cmk6rg6b400qp8jne69a52gmz	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 10:55:58.437
cmk6rnss200018jk91ohm7zuf	2026-01-09 11:01:53.905	cmk6rnsh800008jk98wea4sk5	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 11:01:53.906
cmk6rnt6200068jk9rv0nducz	2026-01-09 11:01:54.41	cmk6rnsw700058jk974bvhlvp	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 11:01:54.411
cmk6rntn400088jk945zchc7q	2026-01-09 11:01:55.024	cmk6rntew00078jk96ikunn2y	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 11:01:55.025
cmk6rntzc000a8jk970ra95ws	2026-01-09 11:01:55.463	cmk6rntpg00098jk9mm1pgkak	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 11:01:55.464
cmk6rnuc6000f8jk90fliqd6j	2026-01-09 11:01:55.925	cmk6rnu28000e8jk9zwh6lzhx	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 11:01:55.926
cmk6rq5so006x8jyycb87kgo6	2026-01-09 11:03:44.088	cmk6rq5hx006q8jyysdlqup7x	estudiante	test_1767956623700_shknw	login	Auth	\N	Usuario test_1767956623700_shknw (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 11:03:44.089
cmk6rq6c9007g8jyytlxgs1sk	2026-01-09 11:03:44.792	cmk6rq61h00798jyy0eb0jag3	estudiante	test_1767956624404_4u8ot	login	Auth	\N	Usuario test_1767956624404_4u8ot (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 11:03:44.794
cmk6rq6tb007z8jyydx6irgry	2026-01-09 11:03:45.407	cmk6rq6j3007s8jyyz3h0lp1j	estudiante	test_1767956625039_bt94o	login	Auth	\N	Usuario test_1767956625039_bt94o (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 11:03:45.408
cmk6rq71y00808jyys4dqp0jj	2026-01-09 11:03:45.717	cmk6rq6j3007s8jyyz3h0lp1j	estudiante	test_1767956625039_bt94o	login	Auth	\N	Usuario test_1767956625039_bt94o (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 11:03:45.718
cmk6rq8ns00ab8jyyxmio3liy	2026-01-09 11:03:47.8	cmk6rq8dv00a68jyy4p6gsjle	estudiante	test_1767956627443_hemma	login	Auth	\N	Usuario test_1767956627443_hemma (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 11:03:47.801
cmk6rq91w00aj8jyy37qex8l2	2026-01-09 11:03:48.307	cmk6rq8sa00ae8jyytd71v5cc	estudiante	test_1767956627961_pud5f	login	Auth	\N	Usuario test_1767956627961_pud5f (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 11:03:48.308
cmk6rq9gr00au8jyyq43sqp82	2026-01-09 11:03:48.843	cmk6rq96e00ap8jyyqzpjoywv	estudiante	test_1767956628469_of3j9	login	Auth	\N	Usuario test_1767956628469_of3j9 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 11:03:48.843
cmk6rq9v200b28jyyw3na1rdu	2026-01-09 11:03:49.356	cmk6rq9l700ax8jyyrfwpaooy	estudiante	test_1767956629002_bkoo5	login	Auth	\N	Usuario test_1767956629002_bkoo5 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 11:03:49.358
cmk6rqaaj00bd8jyyrowmcira	2026-01-09 11:03:49.915	cmk6rqa0000b88jyyo6kfmzsg	estudiante	test_1767956629536_fqrge	login	Auth	\N	Usuario test_1767956629536_fqrge (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-09 11:03:49.916
cmk6rqsvg00wy8jyy5rbtddwg	2026-01-09 11:04:13.996	cmk6rqskp00wr8jyyli0n9494	estudiante	test_1767956653609_1fq21	login	Auth	\N	Usuario test_1767956653609_1fq21 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 11:04:13.997
cmk6rqt3u00wz8jyydyc512fz	2026-01-09 11:04:14.297	cmk6rqskp00wr8jyyli0n9494	estudiante	test_1767956653609_1fq21	login	Auth	\N	Usuario test_1767956653609_1fq21 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 11:04:14.298
cmk6rqtce00x08jyyugu4j6h7	2026-01-09 11:04:14.605	cmk6rqskp00wr8jyyli0n9494	estudiante	test_1767956653609_1fq21	login	Auth	\N	Usuario test_1767956653609_1fq21 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 11:04:14.606
cmk6rqtkg00x18jyyu1d1xrel	2026-01-09 11:04:14.895	cmk6rqskp00wr8jyyli0n9494	estudiante	test_1767956653609_1fq21	login	Auth	\N	Usuario test_1767956653609_1fq21 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 11:04:14.896
cmk6rqtsc00x28jyyd6086mni	2026-01-09 11:04:15.18	cmk6rqskp00wr8jyyli0n9494	estudiante	test_1767956653609_1fq21	login	Auth	\N	Usuario test_1767956653609_1fq21 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 11:04:15.18
cmk6rqui000y38jyy9cssjqt8	2026-01-09 11:04:16.104	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.1	\N	\N	2026-01-09 11:04:16.105
cmk6rquq300y48jyy5l093fk0	2026-01-09 11:04:16.395	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.2	\N	\N	2026-01-09 11:04:16.396
cmk6rquy400y58jyyjl2dchae	2026-01-09 11:04:16.684	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.3	\N	\N	2026-01-09 11:04:16.685
cmk6rqv6600y68jyy6uge8iua	2026-01-09 11:04:16.974	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.4	\N	\N	2026-01-09 11:04:16.975
cmk6rqvdy00y78jyy06wp0vyn	2026-01-09 11:04:17.254	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.5	\N	\N	2026-01-09 11:04:17.255
cmk6rqvm600y88jyyyh5dy6mv	2026-01-09 11:04:17.55	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.6	\N	\N	2026-01-09 11:04:17.55
cmk6rqvub00y98jyyurjw76au	2026-01-09 11:04:17.843	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.7	\N	\N	2026-01-09 11:04:17.844
cmk6rqw2g00ya8jyyzipe2u60	2026-01-09 11:04:18.135	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.8	\N	\N	2026-01-09 11:04:18.136
cmk6rqwa900yb8jyywo2onwrz	2026-01-09 11:04:18.416	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.9	\N	\N	2026-01-09 11:04:18.417
cmk6rqwi900yc8jyy8lesaang	2026-01-09 11:04:18.705	cmk6rqu7t00xw8jyy2s8yduly	estudiante	test_1767956655736_rywo4	login	Auth	\N	Usuario test_1767956655736_rywo4 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.10	\N	\N	2026-01-09 11:04:18.706
cmk6rqwz000yv8jyy3bwfaqsq	2026-01-09 11:04:19.307	cmk6rqwoz00yo8jyygbu5xzch	estudiante	test_1767956658946_wd6mn	login	Auth	\N	Usuario test_1767956658946_wd6mn (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 11:04:19.308
cmk6rqx7400yw8jyyceepofhl	2026-01-09 11:04:19.6	cmk6rqwoz00yo8jyygbu5xzch	estudiante	test_1767956658946_wd6mn	login	Auth	\N	Usuario test_1767956658946_wd6mn (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 11:04:19.6
cmk6rqxf700yx8jyyyc68s2e5	2026-01-09 11:04:19.891	cmk6rqwoz00yo8jyygbu5xzch	estudiante	test_1767956658946_wd6mn	login	Auth	\N	Usuario test_1767956658946_wd6mn (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 11:04:19.892
cmk6rqxoc00yy8jyyp7kna6e7	2026-01-09 11:04:20.219	cmk6rqwoz00yo8jyygbu5xzch	estudiante	test_1767956658946_wd6mn	login	Auth	\N	Usuario test_1767956658946_wd6mn (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 11:04:20.22
cmk6rqy3n00yz8jyyraljeb0d	2026-01-09 11:04:20.77	cmk6rqwoz00yo8jyygbu5xzch	estudiante	test_1767956658946_wd6mn	login	Auth	\N	Usuario test_1767956658946_wd6mn (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 11:04:20.772
cmk6rqyhh00z08jyy2738gjm0	2026-01-09 11:04:21.269	cmk6rqwoz00yo8jyygbu5xzch	estudiante	test_1767956658946_wd6mn	login	Auth	\N	Usuario test_1767956658946_wd6mn (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.2	\N	\N	2026-01-09 11:04:21.269
cmk6ua4my00018j3vqmfqflrf	2026-01-09 12:15:14.937	cmk6ua4e000008j3vld58xoe3	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:14.938
cmk6ua5r000058j3vhtrc25gd	2026-01-09 12:15:16.38	cmk6ua5jb00048j3v7h834la4	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:16.381
cmk6ua7gt000o8j3vcjtku412	2026-01-09 12:15:18.605	cmk6ua74r000h8j3vrx20w11a	estudiante	test_1767960918170_ijmjp	login	Auth	\N	Usuario test_1767960918170_ijmjp (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 12:15:18.606
cmk6ua7yo000z8j3v5bplvkq7	2026-01-09 12:15:19.247	cmk6ua7nz000u8j3vk8wl7lnf	estudiante	test_1767960918862_eorp6	login	Auth	\N	Usuario test_1767960918862_eorp6 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 12:15:19.248
cmk6ua8ee001a8j3vf8g1ag8b	2026-01-09 12:15:19.814	cmk6ua84g00158j3v0w7zpmq8	estudiante	test_1767960919455_zr0rx	login	Auth	\N	Usuario test_1767960919455_zr0rx (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 12:15:19.815
cmk6ua8v2001i8j3v8db9dgsf	2026-01-09 12:15:20.414	cmk6ua8jj001d8j3vank9cvgl	estudiante	test_1767960919998_njbkk	login	Auth	\N	Usuario test_1767960919998_njbkk (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 12:15:20.415
cmk6ua9bi001t8j3vgmowrv8h	2026-01-09 12:15:21.006	cmk6ua919001o8j3vcjuhiigv	estudiante	test_1767960920636_ndzs0	login	Auth	\N	Usuario test_1767960920636_ndzs0 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 12:15:21.007
cmk6ua9qf00248j3v71x16k1q	2026-01-09 12:15:21.539	cmk6ua9gg001z8j3vtppdbdge	estudiante	test_1767960921183_heiuh	login	Auth	\N	Usuario test_1767960921183_heiuh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 12:15:21.54
cmk6uaa75002c8j3vqa280q4n	2026-01-09 12:15:22.143	cmk6ua9vy00278j3v15ff1fhg	estudiante	test_1767960921741_iyit1	login	Auth	\N	Usuario test_1767960921741_iyit1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 12:15:22.145
cmk6uab7o002v8j3v76c071ap	2026-01-09 12:15:23.46	cmk6uaawr002q8j3vendsp33c	estudiante	test_1767960923065_jmdi5	login	Auth	\N	Usuario test_1767960923065_jmdi5 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 12:15:23.461
cmk6uabpg003c8j3vrhouofgz	2026-01-09 12:15:24.1	cmk6uabf100358j3vqwzp9a83	estudiante	test_1767960923724_60err	login	Auth	\N	Usuario test_1767960923724_60err (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 12:15:24.101
cmk6uac45003n8j3vnzfkkp9m	2026-01-09 12:15:24.629	cmk6uabua003i8j3v1ehh9j5q	estudiante	test_1767960924273_p6c6p	login	Auth	\N	Usuario test_1767960924273_p6c6p (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 12:15:24.63
cmk6uacmm00468j3vhk4lh4uo	2026-01-09 12:15:25.294	cmk6uac8i003p8j3vj79ukabn	tutor	tutor_1767960924785_jt5l0@test.com	login	Auth	\N	Usuario tutor_1767960924785_jt5l0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 12:15:25.295
cmk6uadnz00588j3v0a2x15lo	2026-01-09 12:15:26.639	cmk6uaddf00518j3vvcsmvria	estudiante	test_1767960926258_tj9y0	login	Auth	\N	Usuario test_1767960926258_tj9y0 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 12:15:26.64
cmk6uaeku006e8j3vmjzjsahs	2026-01-09 12:15:27.821	cmk6uaeac005x8j3v4iur84eu	estudiante	test_1767960927444_naz7i	login	Auth	\N	Usuario test_1767960927444_naz7i (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 12:15:27.822
cmk6uaf0x007f8j3vv2kho4lr	2026-01-09 12:15:28.4	cmk6uaeqa006k8j3vgq8xii1f	estudiante	test_1767960928017_ufm3x	login	Auth	\N	Usuario test_1767960928017_ufm3x (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 12:15:28.401
cmk6uaapk002k8j3v9fyprx3y	2026-01-09 12:15:22.807	cmk6uaaec002f8j3vm4yd9tlm	estudiante	test_1767960922402_iq5bx	login	Auth	\N	Usuario test_1767960922402_iq5bx (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 12:15:22.809
cmk6uad5u004p8j3vdwyou5q6	2026-01-09 12:15:25.986	cmk6uacvs004i8j3v0aacjifi	estudiante	test_1767960925623_o9duz	login	Auth	\N	Usuario test_1767960925623_o9duz (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 12:15:25.987
cmk6uae55005r8j3v4ysz7so9	2026-01-09 12:15:27.256	cmk6uadv4005k8j3v9796sblo	estudiante	test_1767960926896_1i4gm	login	Auth	\N	Usuario test_1767960926896_1i4gm (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 12:15:27.258
cmk6uagl6007h8j3vlqyzx2pa	2026-01-09 12:15:30.425	cmk6uagb5007g8j3vio1rn803	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:30.426
cmk6uagyd007m8j3v5cm6yseh	2026-01-09 12:15:30.901	cmk6uagob007l8j3vaztjrgpt	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:30.902
cmk6uahfx007o8j3v6f2hsfw7	2026-01-09 12:15:31.533	cmk6uah7m007n8j3v6oe99ovj	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:31.534
cmk6uahsm007q8j3v3353h0bf	2026-01-09 12:15:31.989	cmk6uahir007p8j3va7cfne30	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:31.99
cmk6uai5g007v8j3veb68rw2g	2026-01-09 12:15:32.452	cmk6uahvk007u8j3vrgw6b1jq	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:32.453
cmk6uaijp00858j3vlgu5ybqm	2026-01-09 12:15:32.965	cmk6uai9400848j3vvf4p42fs	tutor	docente-prod@example.com	login	Auth	\N	Usuario docente-prod@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:32.965
cmk6uaixv008a8j3vs3f7f596	2026-01-09 12:15:33.475	cmk6uainu00898j3vevc7eljn	tutor	docente-noexiste@example.com	login	Auth	\N	Usuario docente-noexiste@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:33.476
cmk6uajbn008c8j3vm9jl299k	2026-01-09 12:15:33.971	cmk6uaj1i008b8j3vxv6c6lah	tutor	docente1-ownership@example.com	login	Auth	\N	Usuario docente1-ownership@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:33.972
cmk6uajzw008j8j3vyauqtms6	2026-01-09 12:15:34.844	cmk6uajq7008i8j3vgybcdu90	tutor	docente-filter@example.com	login	Auth	\N	Usuario docente-filter@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:15:34.845
cmk6ubw11009c8j3vttqm3rgo	2026-01-09 12:16:37.093	cmk6ubvqn00958j3vbjuhbijp	estudiante	test_1767960996719_7vfig	login	Auth	\N	Usuario test_1767960996719_7vfig (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:16:37.094
cmk6ubw93009d8j3ve6jejjbb	2026-01-09 12:16:37.382	cmk6ubvqn00958j3vbjuhbijp	estudiante	test_1767960996719_7vfig	login	Auth	\N	Usuario test_1767960996719_7vfig (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:16:37.383
cmk6ubwhb009e8j3vwhrgjudx	2026-01-09 12:16:37.678	cmk6ubvqn00958j3vbjuhbijp	estudiante	test_1767960996719_7vfig	login	Auth	\N	Usuario test_1767960996719_7vfig (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:16:37.679
cmk6ubwpg009f8j3vnre4c78m	2026-01-09 12:16:37.971	cmk6ubvqn00958j3vbjuhbijp	estudiante	test_1767960996719_7vfig	login	Auth	\N	Usuario test_1767960996719_7vfig (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:16:37.972
cmk6ubwxk009g8j3vdqrz84kf	2026-01-09 12:16:38.264	cmk6ubvqn00958j3vbjuhbijp	estudiante	test_1767960996719_7vfig	login	Auth	\N	Usuario test_1767960996719_7vfig (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:16:38.265
cmk6ubxmg00ah8j3v00mi5npt	2026-01-09 12:16:39.16	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.1	\N	\N	2026-01-09 12:16:39.16
cmk6ubxuc00ai8j3vkoi4k1u6	2026-01-09 12:16:39.443	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.2	\N	\N	2026-01-09 12:16:39.444
cmk6uby2b00aj8j3v1nnlgga0	2026-01-09 12:16:39.73	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.3	\N	\N	2026-01-09 12:16:39.731
cmk6ubyab00ak8j3vnd4sdbvl	2026-01-09 12:16:40.018	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.4	\N	\N	2026-01-09 12:16:40.019
cmk6ubyi500al8j3viejgdbdl	2026-01-09 12:16:40.301	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.5	\N	\N	2026-01-09 12:16:40.302
cmk6ubypu00am8j3va8bwlcp0	2026-01-09 12:16:40.577	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.6	\N	\N	2026-01-09 12:16:40.578
cmk6ubyxo00an8j3vzuxkhswz	2026-01-09 12:16:40.86	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.7	\N	\N	2026-01-09 12:16:40.86
cmk6ubz5p00ao8j3vknqcgsv1	2026-01-09 12:16:41.148	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.8	\N	\N	2026-01-09 12:16:41.149
cmk6ubzdi00ap8j3vv5shsled	2026-01-09 12:16:41.429	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.9	\N	\N	2026-01-09 12:16:41.43
cmk6ubzl900aq8j3v496d3e1q	2026-01-09 12:16:41.708	cmk6ubxcj00aa8j3v3byqhml4	estudiante	test_1767960998802_ydp2a	login	Auth	\N	Usuario test_1767960998802_ydp2a (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.10	\N	\N	2026-01-09 12:16:41.709
cmk6uc01o00b98j3vnd2uzlsk	2026-01-09 12:16:42.298	cmk6ubzrq00b28j3vu7sll4lz	estudiante	test_1767961001942_fw9qj	login	Auth	\N	Usuario test_1767961001942_fw9qj (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:16:42.3
cmk6uc09t00ba8j3vln9h6qh9	2026-01-09 12:16:42.593	cmk6ubzrq00b28j3vu7sll4lz	estudiante	test_1767961001942_fw9qj	login	Auth	\N	Usuario test_1767961001942_fw9qj (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:16:42.594
cmk6uc0hy00bb8j3vdowuvld7	2026-01-09 12:16:42.886	cmk6ubzrq00b28j3vu7sll4lz	estudiante	test_1767961001942_fw9qj	login	Auth	\N	Usuario test_1767961001942_fw9qj (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:16:42.886
cmk6uc0pt00bc8j3v5dj5trim	2026-01-09 12:16:43.168	cmk6ubzrq00b28j3vu7sll4lz	estudiante	test_1767961001942_fw9qj	login	Auth	\N	Usuario test_1767961001942_fw9qj (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:16:43.169
cmk6uc16100be8j3vcp3y9toe	2026-01-09 12:16:43.752	cmk6ubzrq00b28j3vu7sll4lz	estudiante	test_1767961001942_fw9qj	login	Auth	\N	Usuario test_1767961001942_fw9qj (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.2	\N	\N	2026-01-09 12:16:43.753
cmk6uc0xq00bd8j3vtv99acgy	2026-01-09 12:16:43.453	cmk6ubzrq00b28j3vu7sll4lz	estudiante	test_1767961001942_fw9qj	login	Auth	\N	Usuario test_1767961001942_fw9qj (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:16:43.455
cmk6uc2qa00bx8j3vngpd3ss5	2026-01-09 12:16:45.778	cmk6uc2g000bq8j3vo3f5hshv	estudiante	test_1767961005407_89ymh	login	Auth	\N	Usuario test_1767961005407_89ymh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 12:16:45.779
cmk6uc37h00cg8j3vvy10r5lc	2026-01-09 12:16:46.397	cmk6uc2xg00c98j3voran910g	estudiante	test_1767961006035_6e7qh	login	Auth	\N	Usuario test_1767961006035_6e7qh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 12:16:46.398
cmk6uc3o400cz8j3v2ft1in9c	2026-01-09 12:16:46.995	cmk6uc3e500cs8j3vbptjlggz	estudiante	test_1767961006637_cbs4i	login	Auth	\N	Usuario test_1767961006637_cbs4i (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 12:16:46.996
cmk6uc3w500d08j3v4jilyvdo	2026-01-09 12:16:47.285	cmk6uc3e500cs8j3vbptjlggz	estudiante	test_1767961006637_cbs4i	login	Auth	\N	Usuario test_1767961006637_cbs4i (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 12:16:47.286
cmk6uc5ed00fb8j3v9oiunkc3	2026-01-09 12:16:49.237	cmk6uc54d00f68j3vcs9xqz9i	estudiante	test_1767961008876_lttsn	login	Auth	\N	Usuario test_1767961008876_lttsn (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 12:16:49.238
cmk6uc5st00fj8j3vlxzorhj0	2026-01-09 12:16:49.757	cmk6uc5iw00fe8j3vsaevgz7m	estudiante	test_1767961009399_uz03v	login	Auth	\N	Usuario test_1767961009399_uz03v (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 12:16:49.758
cmk6uc66s00fu8j3v59a2l545	2026-01-09 12:16:50.26	cmk6uc5x400fp8j3v3zqcwhot	estudiante	test_1767961009911_nd59p	login	Auth	\N	Usuario test_1767961009911_nd59p (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 12:16:50.261
cmk6uc6l000g28j3v3e568k8b	2026-01-09 12:16:50.771	cmk6uc6b200fx8j3vgcxiq4wx	estudiante	test_1767961010413_4jhbz	login	Auth	\N	Usuario test_1767961010413_4jhbz (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 12:16:50.772
cmk6uc6z600gd8j3vcu4zq70s	2026-01-09 12:16:51.282	cmk6uc6pe00g88j3vegu4ejf6	estudiante	test_1767961010929_yfxz2	login	Auth	\N	Usuario test_1767961010929_yfxz2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-09 12:16:51.283
cmk6uce4500px8j3vigw41ixe	2026-01-09 12:17:00.533	cmk6ucdu100pw8j3vkzhr9abq	tutor	login-test@example.com	login	Auth	\N	Usuario login-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:17:00.534
cmk6uceko00qg8j3vyt5u160h	2026-01-09 12:17:01.127	cmk6uceaj00q98j3vn8mxdhae	estudiante	test_1767961020763_4glu4	login	Auth	\N	Usuario test_1767961020763_4glu4 (estudiante) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:17:01.128
cmk6ugn6700018jwxgytevys4	2026-01-09 12:20:18.895	cmk6ugmwm00008jwxd0rs5p40	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:18.896
cmk6ugnio00068jwx0c6h2i57	2026-01-09 12:20:19.343	cmk6ugn9x00058jwx0sfixku1	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:19.344
cmk6ugny100088jwxslztbbwx	2026-01-09 12:20:19.897	cmk6ugnqo00078jwxmdo22zzz	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:19.898
cmk6ugo97000a8jwxx4wj3n7j	2026-01-09 12:20:20.298	cmk6ugo0d00098jwxqitnjj7m	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:20.299
cmk6ugokq000f8jwxovxlya19	2026-01-09 12:20:20.714	cmk6ugobv000e8jwx8ks47rzb	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:20.715
cmk6ugowb000p8jwxa16enimc	2026-01-09 12:20:21.131	cmk6ugonm000o8jwxnag5kkjc	tutor	docente-prod@example.com	login	Auth	\N	Usuario docente-prod@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:21.132
cmk6ugp7z000u8jwxrwvcx6nb	2026-01-09 12:20:21.551	cmk6ugoza000t8jwxvzi12cyi	tutor	docente-noexiste@example.com	login	Auth	\N	Usuario docente-noexiste@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:21.552
cmk6ugpjk000w8jwxf8g4a5ur	2026-01-09 12:20:21.968	cmk6ugpau000v8jwxngdanddp	tutor	docente1-ownership@example.com	login	Auth	\N	Usuario docente1-ownership@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:21.969
cmk6ugq0h00128jwxy7023zxy	2026-01-09 12:20:22.576	cmk6ugptd00118jwx1mi3aqcz	tutor	tutor-comision-forbidden@example.com	login	Auth	\N	Usuario tutor-comision-forbidden@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:22.577
cmk6ugqbe00148jwxua8ksh38	2026-01-09 12:20:22.969	cmk6ugq2r00138jwxm88lv0sd	tutor	docente-filter@example.com	login	Auth	\N	Usuario docente-filter@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:22.97
cmk6ugrno001x8jwxonzghyf7	2026-01-09 12:20:24.708	cmk6ugrdo001q8jwxi4jkut3b	estudiante	test_1767961224347_ts56p	login	Auth	\N	Usuario test_1767961224347_ts56p (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 12:20:24.709
cmk6ugs1s00288jwxpjjbzbgm	2026-01-09 12:20:25.216	cmk6ugrsn00238jwxrdf8us3i	estudiante	test_1767961224886_0jfyr	login	Auth	\N	Usuario test_1767961224886_0jfyr (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 12:20:25.217
cmk6ugsfm002j8jwxmy4rg0ge	2026-01-09 12:20:25.713	cmk6ugs6d002e8jwxac463ffh	estudiante	test_1767961225380_5uz34	login	Auth	\N	Usuario test_1767961225380_5uz34 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 12:20:25.714
cmk6ugst1002r8jwxoay56lj1	2026-01-09 12:20:26.197	cmk6ugsk2002m8jwx2lald6mx	estudiante	test_1767961225874_j7rbn	login	Auth	\N	Usuario test_1767961225874_j7rbn (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 12:20:26.197
cmk6ugt6l00328jwxotq9d188	2026-01-09 12:20:26.685	cmk6ugsxl002x8jwxvv136hrr	estudiante	test_1767961226360_y8ywq	login	Auth	\N	Usuario test_1767961226360_y8ywq (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 12:20:26.685
cmk6ugtk4003d8jwxjc79ypf7	2026-01-09 12:20:27.171	cmk6ugtb300388jwxuy2z5xqo	estudiante	test_1767961226846_o3n6j	login	Auth	\N	Usuario test_1767961226846_o3n6j (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 12:20:27.172
cmk6ugtxn003l8jwxbqepo1yr	2026-01-09 12:20:27.659	cmk6ugtoj003g8jwxe64u23qs	estudiante	test_1767961227330_jaxz6	login	Auth	\N	Usuario test_1767961227330_jaxz6 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 12:20:27.66
cmk6uguax003t8jwxoaxa1pd9	2026-01-09 12:20:28.137	cmk6ugu24003o8jwx5zwzck5d	estudiante	test_1767961227819_anccr	login	Auth	\N	Usuario test_1767961227819_anccr (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 12:20:28.138
cmk6ugxn8007n8jwx57z2fcv7	2026-01-09 12:20:32.468	cmk6ugxe300768jwxke1hy9h3	estudiante	test_1767961232138_r3yqh	login	Auth	\N	Usuario test_1767961232138_r3yqh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 12:20:32.469
cmk6uguoa00448jwxrkhg7ylu	2026-01-09 12:20:28.617	cmk6ugufc003z8jwxuyul5a9p	estudiante	test_1767961228295_fccu6	login	Auth	\N	Usuario test_1767961228295_fccu6 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 12:20:28.618
cmk6ugv3n004l8jwxn472798g	2026-01-09 12:20:29.17	cmk6uguun004e8jwx270ze6r7	estudiante	test_1767961228846_crwv2	login	Auth	\N	Usuario test_1767961228846_crwv2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 12:20:29.171
cmk6ugvhf004w8jwx23o9sim1	2026-01-09 12:20:29.666	cmk6ugv88004r8jwxyf656fb9	estudiante	test_1767961229335_d6uoh	login	Auth	\N	Usuario test_1767961229335_d6uoh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 12:20:29.667
cmk6ugvxy005f8jwx4rwpo7b4	2026-01-09 12:20:30.262	cmk6ugvkk004y8jwx0jqaq293	tutor	tutor_1767961229779_ptvta@test.com	login	Auth	\N	Usuario tutor_1767961229779_ptvta@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 12:20:30.263
cmk6ugwdj005y8jwxfweq02v9	2026-01-09 12:20:30.823	cmk6ugw4e005r8jwxup2gfn0o	estudiante	test_1767961230493_mx9ik	login	Auth	\N	Usuario test_1767961230493_mx9ik (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 12:20:30.824
cmk6ugwt9006h8jwxak6xbudt	2026-01-09 12:20:31.389	cmk6ugwk2006a8jwx6mw06330	estudiante	test_1767961231057_nzsl8	login	Auth	\N	Usuario test_1767961231057_nzsl8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 12:20:31.39
cmk6ugx8s00708jwxu7e2ylgh	2026-01-09 12:20:31.948	cmk6ugwzs006t8jwxxcml588u	estudiante	test_1767961231622_he06q	login	Auth	\N	Usuario test_1767961231622_he06q (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 12:20:31.949
cmk6ugy2p008o8jwxamrj212g	2026-01-09 12:20:33.024	cmk6ugxsa007t8jwx5zgajdbd	estudiante	test_1767961232649_g6d3t	login	Auth	\N	Usuario test_1767961232649_g6d3t (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 12:20:33.025
cmk6ugzgn00978jwxmjve18f4	2026-01-09 12:20:34.822	cmk6ugz7600908jwxehjfcoav	estudiante	test_1767961234481_rzd73	login	Auth	\N	Usuario test_1767961234481_rzd73 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:20:34.824
cmk6ugzoq00988jwx9adjbpjv	2026-01-09 12:20:35.113	cmk6ugz7600908jwxehjfcoav	estudiante	test_1767961234481_rzd73	login	Auth	\N	Usuario test_1767961234481_rzd73 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:20:35.114
cmk6ugzwv00998jwxohgsvlqc	2026-01-09 12:20:35.407	cmk6ugz7600908jwxehjfcoav	estudiante	test_1767961234481_rzd73	login	Auth	\N	Usuario test_1767961234481_rzd73 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:20:35.407
cmk6uh04h009a8jwx6mxxt3xt	2026-01-09 12:20:35.68	cmk6ugz7600908jwxehjfcoav	estudiante	test_1767961234481_rzd73	login	Auth	\N	Usuario test_1767961234481_rzd73 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:20:35.681
cmk6uh0c2009b8jwxvxg6vg5b	2026-01-09 12:20:35.953	cmk6ugz7600908jwxehjfcoav	estudiante	test_1767961234481_rzd73	login	Auth	\N	Usuario test_1767961234481_rzd73 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:20:35.954
cmk6uh0yn00ac8jwx18tgm7ti	2026-01-09 12:20:36.766	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.1	\N	\N	2026-01-09 12:20:36.767
cmk6uh15y00ad8jwxilg8q0bb	2026-01-09 12:20:37.029	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.2	\N	\N	2026-01-09 12:20:37.03
cmk6uh1d900ae8jwx92lkqeb9	2026-01-09 12:20:37.293	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.3	\N	\N	2026-01-09 12:20:37.294
cmk6uh1ki00af8jwxnaek7y35	2026-01-09 12:20:37.554	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.4	\N	\N	2026-01-09 12:20:37.555
cmk6uh1rs00ag8jwxunaz3qb9	2026-01-09 12:20:37.815	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.5	\N	\N	2026-01-09 12:20:37.816
cmk6uh1z100ah8jwx0pe8q7bg	2026-01-09 12:20:38.077	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.6	\N	\N	2026-01-09 12:20:38.078
cmk6uh26a00ai8jwxydibuwp3	2026-01-09 12:20:38.337	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.7	\N	\N	2026-01-09 12:20:38.338
cmk6uh2dg00aj8jwx5slltw6u	2026-01-09 12:20:38.596	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.8	\N	\N	2026-01-09 12:20:38.597
cmk6uh2kq00ak8jwxhw1y54r2	2026-01-09 12:20:38.858	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.9	\N	\N	2026-01-09 12:20:38.859
cmk6uh2rz00al8jwx8iuyqqp6	2026-01-09 12:20:39.119	cmk6uh0pd00a58jwx09nabe33	estudiante	test_1767961236432_ff1ua	login	Auth	\N	Usuario test_1767961236432_ff1ua (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.10	\N	\N	2026-01-09 12:20:39.119
cmk6uh37500b48jwx7yi5ehl1	2026-01-09 12:20:39.664	cmk6uh2y000ax8jwxnsozqmtq	estudiante	test_1767961239336_5q01t	login	Auth	\N	Usuario test_1767961239336_5q01t (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:20:39.665
cmk6uh3ev00b58jwxlxguz9h0	2026-01-09 12:20:39.943	cmk6uh2y000ax8jwxnsozqmtq	estudiante	test_1767961239336_5q01t	login	Auth	\N	Usuario test_1767961239336_5q01t (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:20:39.944
cmk6uh3nb00b68jwx678ar9d1	2026-01-09 12:20:40.247	cmk6uh2y000ax8jwxnsozqmtq	estudiante	test_1767961239336_5q01t	login	Auth	\N	Usuario test_1767961239336_5q01t (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:20:40.248
cmk6uh3ut00b78jwxpdmnhcmx	2026-01-09 12:20:40.517	cmk6uh2y000ax8jwxnsozqmtq	estudiante	test_1767961239336_5q01t	login	Auth	\N	Usuario test_1767961239336_5q01t (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:20:40.518
cmk6uh42g00b88jwxzw54m7vi	2026-01-09 12:20:40.792	cmk6uh2y000ax8jwxnsozqmtq	estudiante	test_1767961239336_5q01t	login	Auth	\N	Usuario test_1767961239336_5q01t (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:20:40.793
cmk6uh49w00b98jwx1vmzp2dz	2026-01-09 12:20:41.06	cmk6uh2y000ax8jwxnsozqmtq	estudiante	test_1767961239336_5q01t	login	Auth	\N	Usuario test_1767961239336_5q01t (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.2	\N	\N	2026-01-09 12:20:41.061
cmk6uh5pm00bs8jwxvozzkubo	2026-01-09 12:20:42.921	cmk6uh5fw00bl8jwx6o96818n	estudiante	test_1767961242571_f5pdg	login	Auth	\N	Usuario test_1767961242571_f5pdg (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 12:20:42.922
cmk6uh65j00cb8jwxbzlqkl31	2026-01-09 12:20:43.494	cmk6uh5w200c48jwxh0nrn8s9	estudiante	test_1767961243153_9orla	login	Auth	\N	Usuario test_1767961243153_9orla (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 12:20:43.495
cmk6uh6l100cu8jwxfl2lpfit	2026-01-09 12:20:44.053	cmk6uh6bx00cn8jwxfbjoqo2i	estudiante	test_1767961243724_1hop1	login	Auth	\N	Usuario test_1767961243724_1hop1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 12:20:44.054
cmk6uh6sf00cv8jwxkl3aaidz	2026-01-09 12:20:44.319	cmk6uh6bx00cn8jwxfbjoqo2i	estudiante	test_1767961243724_1hop1	login	Auth	\N	Usuario test_1767961243724_1hop1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 12:20:44.32
cmk6uh86c00f68jwxjjxt9ii4	2026-01-09 12:20:46.116	cmk6uh7x800f18jwx7en49ml6	estudiante	test_1767961245787_xi5gv	login	Auth	\N	Usuario test_1767961245787_xi5gv (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 12:20:46.116
cmk6uh8ks00fe8jwxniq367hc	2026-01-09 12:20:46.635	cmk6uh8av00f98jwx5za6nj3k	estudiante	test_1767961246278_314kw	login	Auth	\N	Usuario test_1767961246278_314kw (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 12:20:46.636
cmk6uh8zq00fp8jwxpdwcmok1	2026-01-09 12:20:47.173	cmk6uh8pi00fk8jwxa4uvpiqp	estudiante	test_1767961246806_goi8e	login	Auth	\N	Usuario test_1767961246806_goi8e (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 12:20:47.174
cmk6uh9ew00fx8jwxny1vcdmc	2026-01-09 12:20:47.719	cmk6uh94f00fs8jwxmiuuncz7	estudiante	test_1767961247342_kdbdk	login	Auth	\N	Usuario test_1767961247342_kdbdk (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 12:20:47.72
cmk6uh9u000g88jwxq4z6vdwj	2026-01-09 12:20:48.264	cmk6uh9jd00g38jwxp18d29nw	estudiante	test_1767961247880_jm2u0	login	Auth	\N	Usuario test_1767961247880_jm2u0 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-09 12:20:48.265
cmk6uhfaz00m78jwxmkfmpqzs	2026-01-09 12:20:55.355	cmk6uhf2j00m68jwxo1qwcg26	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:20:55.356
cmk6ui69b00px8jwx759od71i	2026-01-09 12:21:30.286	cmk6ui5zn00pw8jwx1sqyy4hq	tutor	login-test@example.com	login	Auth	\N	Usuario login-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:21:30.287
cmk6ui6om00qg8jwx1har9ix0	2026-01-09 12:21:30.838	cmk6ui6fh00q98jwx9gk2zhjz	estudiante	test_1767961290508_3oarc	login	Auth	\N	Usuario test_1767961290508_3oarc (estudiante) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:21:30.839
cmk6uv6br00018jsedrvybpc4	2026-01-09 12:31:36.903	cmk6uv63m00008jse3kxk8yg8	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:36.904
cmk6uv7ck00058jseh3ti9zk3	2026-01-09 12:31:38.228	cmk6uv75800048jseb3022l90	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:38.228
cmk6uv8oy000o8jsem68hdlkg	2026-01-09 12:31:39.969	cmk6uv8f7000h8jsegbjm4uvx	estudiante	test_1767961899618_tmzhx	login	Auth	\N	Usuario test_1767961899618_tmzhx (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 12:31:39.97
cmk6uv93e000z8jse4jb2nfb6	2026-01-09 12:31:40.49	cmk6uv8u9000u8jseusm7ntqu	estudiante	test_1767961900160_qi1ja	login	Auth	\N	Usuario test_1767961900160_qi1ja (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 12:31:40.491
cmk6uv9gz001a8jset6lh5g97	2026-01-09 12:31:40.978	cmk6uv98000158jse8dbprc4q	estudiante	test_1767961900655_zmfp3	login	Auth	\N	Usuario test_1767961900655_zmfp3 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 12:31:40.979
cmk6uv9ug001i8jsey8bux5vd	2026-01-09 12:31:41.463	cmk6uv9lh001d8jsehjztcvbh	estudiante	test_1767961901140_n523p	login	Auth	\N	Usuario test_1767961901140_n523p (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 12:31:41.464
cmk6uva7s001t8jse5a11b2l4	2026-01-09 12:31:41.944	cmk6uv9yu001o8jse50yrsd22	estudiante	test_1767961901622_rv2j4	login	Auth	\N	Usuario test_1767961901622_rv2j4 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 12:31:41.945
cmk6uvala00248jse6m7hsr2y	2026-01-09 12:31:42.43	cmk6uvac8001z8jset2aen145	estudiante	test_1767961902104_ywlp2	login	Auth	\N	Usuario test_1767961902104_ywlp2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 12:31:42.431
cmk6uvayn002c8jsepmdbtc1i	2026-01-09 12:31:42.911	cmk6uvapq00278jsei3yctn1i	estudiante	test_1767961902589_px7r4	login	Auth	\N	Usuario test_1767961902589_px7r4 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 12:31:42.911
cmk6uvbc8002k8jsetegyt5j5	2026-01-09 12:31:43.398	cmk6uvb2x002f8jsecoiy5yng	estudiante	test_1767961903064_z7smo	login	Auth	\N	Usuario test_1767961903064_z7smo (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 12:31:43.399
cmk6uvbq8002v8jseif59rop0	2026-01-09 12:31:43.903	cmk6uvbh9002q8jseeqgrvz6t	estudiante	test_1767961903580_5ngmp	login	Auth	\N	Usuario test_1767961903580_5ngmp (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 12:31:43.904
cmk6uvc62003c8jseoxpbndx1	2026-01-09 12:31:44.474	cmk6uvbwk00358jsei35kfj6r	estudiante	test_1767961904131_ea6x2	login	Auth	\N	Usuario test_1767961904131_ea6x2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 12:31:44.475
cmk6uvcjy003n8jseitjxs1u9	2026-01-09 12:31:44.974	cmk6uvcay003i8jseyjd6xk1k	estudiante	test_1767961904649_20929	login	Auth	\N	Usuario test_1767961904649_20929 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 12:31:44.975
cmk6uvczt00468jsehktgdxyd	2026-01-09 12:31:45.544	cmk6uvcn3003p8jsekrkren1g	tutor	tutor_1767961905087_rvynf@test.com	login	Auth	\N	Usuario tutor_1767961905087_rvynf@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 12:31:45.545
cmk6uvdez004p8jsexiy5c5r8	2026-01-09 12:31:46.091	cmk6uvd65004i8jse35w3twic	estudiante	test_1767961905772_co1wh	login	Auth	\N	Usuario test_1767961905772_co1wh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 12:31:46.091
cmk6uvduk00588jsebmay6als	2026-01-09 12:31:46.651	cmk6uvdli00518jseiljcetrz	estudiante	test_1767961906326_83r60	login	Auth	\N	Usuario test_1767961906326_83r60 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 12:31:46.652
cmk6uvea6005r8jse538o5o3d	2026-01-09 12:31:47.214	cmk6uve0w005k8jse7ncp8bih	estudiante	test_1767961906880_0e35g	login	Auth	\N	Usuario test_1767961906880_0e35g (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 12:31:47.214
cmk6uvenx006e8jseht73vuo4	2026-01-09 12:31:47.709	cmk6uveep005x8jseejt9oncl	estudiante	test_1767961907377_hywmb	login	Auth	\N	Usuario test_1767961907377_hywmb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 12:31:47.71
cmk6uvf2n007f8jseicxzgqsp	2026-01-09 12:31:48.238	cmk6uvesv006k8jse8g0t7zpe	estudiante	test_1767961907887_yx8gi	login	Auth	\N	Usuario test_1767961907887_yx8gi (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 12:31:48.239
cmk6uvgaw007h8jseht7kzt53	2026-01-09 12:31:49.831	cmk6uvg1w007g8jse9t89bvxv	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:49.832
cmk6uvgmr007m8jse8n2f15jr	2026-01-09 12:31:50.259	cmk6uvgdo007l8jsegtjr4lsk	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:50.26
cmk6uvh1l007o8jsebrsgkbzd	2026-01-09 12:31:50.792	cmk6uvguf007n8jsemdpz35fm	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:50.793
cmk6uvhct007q8jse0jcpzukx	2026-01-09 12:31:51.197	cmk6uvh3t007p8jse34eakcvd	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:51.198
cmk6uvhoc007v8jseldrv14y0	2026-01-09 12:31:51.612	cmk6uvhfe007u8jsevqnsh26y	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:51.612
cmk6uvhzt00858jsezqo84n3s	2026-01-09 12:31:52.025	cmk6uvhr600848jsej1ldv5cw	tutor	docente-prod@example.com	login	Auth	\N	Usuario docente-prod@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:52.025
cmk6uvibt008a8jsedpi9g77f	2026-01-09 12:31:52.456	cmk6uvi2k00898jsenem91t6o	tutor	docente-noexiste@example.com	login	Auth	\N	Usuario docente-noexiste@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:52.458
cmk6uvio5008c8jsesndm8d3a	2026-01-09 12:31:52.9	cmk6uvieu008b8jsez1e99abz	tutor	docente1-ownership@example.com	login	Auth	\N	Usuario docente1-ownership@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:52.901
cmk6uvj9f008j8jsegzmk8boi	2026-01-09 12:31:53.667	cmk6uvj0c008i8jse4yc6qe13	tutor	docente-filter@example.com	login	Auth	\N	Usuario docente-filter@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:31:53.668
cmk6uwv4f009c8jsel9xfm8ip	2026-01-09 12:32:55.694	cmk6uwuuq00958jsesj5vutqv	estudiante	test_1767961975345_blk6f	login	Auth	\N	Usuario test_1767961975345_blk6f (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:32:55.695
cmk6uwvc8009d8jse73d0aapm	2026-01-09 12:32:55.976	cmk6uwuuq00958jsesj5vutqv	estudiante	test_1767961975345_blk6f	login	Auth	\N	Usuario test_1767961975345_blk6f (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:32:55.977
cmk6uwvjt009e8jsevh7dk6c7	2026-01-09 12:32:56.249	cmk6uwuuq00958jsesj5vutqv	estudiante	test_1767961975345_blk6f	login	Auth	\N	Usuario test_1767961975345_blk6f (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:32:56.249
cmk6uwvrc009f8jsel3ccpeyx	2026-01-09 12:32:56.519	cmk6uwuuq00958jsesj5vutqv	estudiante	test_1767961975345_blk6f	login	Auth	\N	Usuario test_1767961975345_blk6f (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:32:56.52
cmk6uwvyw009g8jseau3kxwnu	2026-01-09 12:32:56.792	cmk6uwuuq00958jsesj5vutqv	estudiante	test_1767961975345_blk6f	login	Auth	\N	Usuario test_1767961975345_blk6f (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 12:32:56.793
cmk6uwwok00ah8jsedk42brs2	2026-01-09 12:32:57.715	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.1	\N	\N	2026-01-09 12:32:57.716
cmk6uwwwf00ai8jsen13ada0y	2026-01-09 12:32:57.998	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.2	\N	\N	2026-01-09 12:32:57.999
cmk6uwx4z00aj8jse7vawxq0o	2026-01-09 12:32:58.306	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.3	\N	\N	2026-01-09 12:32:58.308
cmk6uwxcx00ak8jse6ojop2wb	2026-01-09 12:32:58.592	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.4	\N	\N	2026-01-09 12:32:58.593
cmk6uwxnj00al8jse9cgynyjm	2026-01-09 12:32:58.975	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.5	\N	\N	2026-01-09 12:32:58.975
cmk6uwxvt00am8jsexmm3hdpu	2026-01-09 12:32:59.272	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.6	\N	\N	2026-01-09 12:32:59.273
cmk6uwy4400an8jsedy9nn3s6	2026-01-09 12:32:59.571	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.7	\N	\N	2026-01-09 12:32:59.572
cmk6uwybu00ao8jsepb61jrdu	2026-01-09 12:32:59.85	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.8	\N	\N	2026-01-09 12:32:59.851
cmk6uwyju00ap8jse6xztevjm	2026-01-09 12:33:00.135	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.9	\N	\N	2026-01-09 12:33:00.138
cmk6uwyse00aq8jsem33x4m5m	2026-01-09 12:33:00.446	cmk6uwweq00aa8jse95f8oods	estudiante	test_1767961977361_mv56i	login	Auth	\N	Usuario test_1767961977361_mv56i (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.10	\N	\N	2026-01-09 12:33:00.447
cmk6uwzaf00b98jsecj9aek0z	2026-01-09 12:33:01.094	cmk6uwz0l00b28jsebqakp6y0	estudiante	test_1767961980739_v495m	login	Auth	\N	Usuario test_1767961980739_v495m (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:33:01.095
cmk6uwzi100ba8jsec0kwuwsn	2026-01-09 12:33:01.368	cmk6uwz0l00b28jsebqakp6y0	estudiante	test_1767961980739_v495m	login	Auth	\N	Usuario test_1767961980739_v495m (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:33:01.369
cmk6uwzq600bb8jse5sfqtxb1	2026-01-09 12:33:01.662	cmk6uwz0l00b28jsebqakp6y0	estudiante	test_1767961980739_v495m	login	Auth	\N	Usuario test_1767961980739_v495m (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:33:01.662
cmk6uwzxr00bc8jsetfgbpdlq	2026-01-09 12:33:01.934	cmk6uwz0l00b28jsebqakp6y0	estudiante	test_1767961980739_v495m	login	Auth	\N	Usuario test_1767961980739_v495m (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:33:01.935
cmk6ux05o00bd8jseh19gavav	2026-01-09 12:33:02.22	cmk6uwz0l00b28jsebqakp6y0	estudiante	test_1767961980739_v495m	login	Auth	\N	Usuario test_1767961980739_v495m (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 12:33:02.221
cmk6ux0do00be8jsejsqnrshp	2026-01-09 12:33:02.507	cmk6uwz0l00b28jsebqakp6y0	estudiante	test_1767961980739_v495m	login	Auth	\N	Usuario test_1767961980739_v495m (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.2	\N	\N	2026-01-09 12:33:02.508
cmk6ux1xw00bx8jse4hpvafj1	2026-01-09 12:33:04.532	cmk6ux1o200bq8jse2ss8vrc7	estudiante	test_1767961984177_q36q8	login	Auth	\N	Usuario test_1767961984177_q36q8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 12:33:04.533
cmk6ux2fg00cg8jse6lclsmpm	2026-01-09 12:33:05.163	cmk6ux24h00c98jsen89c43nt	estudiante	test_1767961984768_reohw	login	Auth	\N	Usuario test_1767961984768_reohw (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 12:33:05.164
cmk6ux2v600cz8jse1mgj6thc	2026-01-09 12:33:05.729	cmk6ux2lt00cs8jse8fr03i4g	estudiante	test_1767961985392_b97ln	login	Auth	\N	Usuario test_1767961985392_b97ln (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 12:33:05.73
cmk6ux32i00d08jseaywm0biv	2026-01-09 12:33:05.993	cmk6ux2lt00cs8jse8fr03i4g	estudiante	test_1767961985392_b97ln	login	Auth	\N	Usuario test_1767961985392_b97ln (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 12:33:05.994
cmk6ux4mu00fb8jseu1a78hj8	2026-01-09 12:33:08.02	cmk6ux4cx00f68jsewo45ca09	estudiante	test_1767961987664_tsxq1	login	Auth	\N	Usuario test_1767961987664_tsxq1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 12:33:08.022
cmk6ux53800fj8jsei3pqmtli	2026-01-09 12:33:08.611	cmk6ux4rt00fe8jseu0scu0v0	estudiante	test_1767961988200_vsn77	login	Auth	\N	Usuario test_1767961988200_vsn77 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 12:33:08.612
cmk6ux5i700fu8jsehxbdds3d	2026-01-09 12:33:09.15	cmk6ux58f00fp8jsemmgpch6q	estudiante	test_1767961988798_zlycs	login	Auth	\N	Usuario test_1767961988798_zlycs (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 12:33:09.151
cmk6ux5vw00g28jsekmxylo85	2026-01-09 12:33:09.644	cmk6ux5mh00fx8jsec6uziq35	estudiante	test_1767961989304_x887g	login	Auth	\N	Usuario test_1767961989304_x887g (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 12:33:09.645
cmk6ux69t00gd8jseekx9fuvw	2026-01-09 12:33:10.145	cmk6ux60600g88jsepjij0cgc	estudiante	test_1767961989797_hq37o	login	Auth	\N	Usuario test_1767961989797_hq37o (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-09 12:33:10.146
cmk6uxdhc00pt8jsejhn3ws93	2026-01-09 12:33:19.488	cmk6uxd8200ps8jsexfgw8wyz	tutor	login-test@example.com	login	Auth	\N	Usuario login-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:33:19.488
cmk6uxdx800qc8jser2kzm5jh	2026-01-09 12:33:20.059	cmk6uxdnh00q58jse9lz6fgjn	estudiante	test_1767961999708_vd9ba	login	Auth	\N	Usuario test_1767961999708_vd9ba (estudiante) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 12:33:20.06
cmk6vzca8003m8j3l356rzw8x	2026-01-09 13:02:50.862	cmk6vzbx4003l8j3l80k0ecny	tutor	login-test@example.com	login	Auth	\N	Usuario login-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 13:02:50.864
cmk6vzct400458j3lj5qypx0d	2026-01-09 13:02:51.543	cmk6vzcib003y8j3lj6w0fydo	estudiante	test_1767963771154_p6ha1	login	Auth	\N	Usuario test_1767963771154_p6ha1 (estudiante) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 13:02:51.544
cmk6vzr6p000i8jpzlgzm6r4n	2026-01-09 13:03:10.176	cmk6vzqvb000b8jpztnu3ibch	estudiante	test_1767963789766_shwqa	login	Auth	\N	Usuario test_1767963789766_shwqa (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 13:03:10.177
cmk6vzrnd000t8jpzm5jjw60c	2026-01-09 13:03:10.776	cmk6vzrck000o8jpz2ovkqb6a	estudiante	test_1767963790387_n9ldc	login	Auth	\N	Usuario test_1767963790387_n9ldc (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 13:03:10.777
cmk6vzs2h00148jpzx009r3jk	2026-01-09 13:03:11.321	cmk6vzrsr000z8jpz0ktfve0m	estudiante	test_1767963790970_ik0pg	login	Auth	\N	Usuario test_1767963790970_ik0pg (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 13:03:11.322
cmk6vzsj9001c8jpzrld3lmne	2026-01-09 13:03:11.924	cmk6vzs8200178jpz3na7yy2o	estudiante	test_1767963791520_wdtdd	login	Auth	\N	Usuario test_1767963791520_wdtdd (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 13:03:11.925
cmk6vzsy2001n8jpz0k26vcjj	2026-01-09 13:03:12.458	cmk6vzso3001i8jpzywkrukom	estudiante	test_1767963792098_r5zxt	login	Auth	\N	Usuario test_1767963792098_r5zxt (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 13:03:12.459
cmk6vztct001y8jpzcpqb88mj	2026-01-09 13:03:12.989	cmk6vzt31001t8jpzl87hg7lb	estudiante	test_1767963792636_7nrdi	login	Auth	\N	Usuario test_1767963792636_7nrdi (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 13:03:12.99
cmk6vztrm00268jpz318v2bad	2026-01-09 13:03:13.521	cmk6vzthk00218jpzky9bl1ym	estudiante	test_1767963793159_7yyug	login	Auth	\N	Usuario test_1767963793159_7yyug (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 13:03:13.522
cmk6vzu7i002e8jpzsl561cye	2026-01-09 13:03:14.093	cmk6vztww00298jpz6bpgc247	estudiante	test_1767963793711_l3b9s	login	Auth	\N	Usuario test_1767963793711_l3b9s (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 13:03:14.094
cmk6vzunc002p8jpzd5pzymg6	2026-01-09 13:03:14.663	cmk6vzucx002k8jpzldpwky4f	estudiante	test_1767963794288_rsx06	login	Auth	\N	Usuario test_1767963794288_rsx06 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 13:03:14.664
cmk6vzv5000368jpz4814gegm	2026-01-09 13:03:15.3	cmk6vzuun002z8jpzdgeb4gcj	estudiante	test_1767963794926_o9bxe	login	Auth	\N	Usuario test_1767963794926_o9bxe (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 13:03:15.301
cmk6vzvk7003h8jpz518utzq2	2026-01-09 13:03:15.846	cmk6vzva8003c8jpzbw0l9bmq	estudiante	test_1767963795487_rwotr	login	Auth	\N	Usuario test_1767963795487_rwotr (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 13:03:15.847
cmk6vzw2400408jpz82ncwwpt	2026-01-09 13:03:16.488	cmk6vzvnr003j8jpziu3bklsc	tutor	tutor_1767963795975_gbbrj@test.com	login	Auth	\N	Usuario tutor_1767963795975_gbbrj@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 13:03:16.492
cmk6vzwoe004j8jpzb9pjqah5	2026-01-09 13:03:17.292	cmk6vzwai004c8jpzqyhgpi2l	estudiante	test_1767963796791_65hfg	login	Auth	\N	Usuario test_1767963796791_65hfg (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 13:03:17.295
cmk6vzx7x00528jpzezvpm4lp	2026-01-09 13:03:17.997	cmk6vzwy0004v8jpzj3vyz67d	estudiante	test_1767963797639_d9hrk	login	Auth	\N	Usuario test_1767963797639_d9hrk (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 13:03:17.998
cmk6vzxpa005l8jpzud9mj8fo	2026-01-09 13:03:18.622	cmk6vzxew005e8jpzslk71cti	estudiante	test_1767963798247_hupyh	login	Auth	\N	Usuario test_1767963798247_hupyh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 13:03:18.623
cmk6vzy4l00688jpz6earlojb	2026-01-09 13:03:19.173	cmk6vzxuf005r8jpz08gt7fgq	estudiante	test_1767963798806_48jgs	login	Auth	\N	Usuario test_1767963798806_48jgs (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 13:03:19.174
cmk6vzyky00798jpz9zq871me	2026-01-09 13:03:19.762	cmk6vzy9z006e8jpzxvw0opvu	estudiante	test_1767963799366_kyzdp	login	Auth	\N	Usuario test_1767963799366_kyzdp (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 13:03:19.763
cmk6wlbh9000i8jx76lbb7ysq	2026-01-09 13:19:56.253	cmk6wlb5m000b8jx7h5orduza	estudiante	test_1767964795834_n53g0	login	Auth	\N	Usuario test_1767964795834_n53g0 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 13:19:56.254
cmk6wlbzj000t8jx7wee8g4lk	2026-01-09 13:19:56.91	cmk6wlbob000o8jx7mu63epm0	estudiante	test_1767964796506_x2gz3	login	Auth	\N	Usuario test_1767964796506_x2gz3 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 13:19:56.911
cmk6wlcf500148jx71lukmzya	2026-01-09 13:19:57.472	cmk6wlc5a000z8jx7azaganxc	estudiante	test_1767964797117_0fdrf	login	Auth	\N	Usuario test_1767964797117_0fdrf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 13:19:57.473
cmk6wlcu2001c8jx77wwptrow	2026-01-09 13:19:58.01	cmk6wlcjx00178jx7fstuyg8c	estudiante	test_1767964797644_0rfjj	login	Auth	\N	Usuario test_1767964797644_0rfjj (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 13:19:58.011
cmk6wld94001n8jx7n8l5f8a3	2026-01-09 13:19:58.551	cmk6wlcz1001i8jx7xaqbq98n	estudiante	test_1767964798188_s9vmy	login	Auth	\N	Usuario test_1767964798188_s9vmy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 13:19:58.552
cmk6wldos001y8jx7l1vaxc4l	2026-01-09 13:19:59.116	cmk6wldej001t8jx7vd7iulhv	estudiante	test_1767964798746_gqjfk	login	Auth	\N	Usuario test_1767964798746_gqjfk (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 13:19:59.117
cmk6wle4000268jx75qnm740b	2026-01-09 13:19:59.664	cmk6wldtm00218jx79rijoy0z	estudiante	test_1767964799290_tgzy8	login	Auth	\N	Usuario test_1767964799290_tgzy8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 13:19:59.665
cmk6wlejv002e8jx7fc5c4pn9	2026-01-09 13:20:00.234	cmk6wle9t00298jx7r3d5him3	estudiante	test_1767964799871_kteas	login	Auth	\N	Usuario test_1767964799871_kteas (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 13:20:00.235
cmk6wlezw002p8jx7mm0x6rv0	2026-01-09 13:20:00.811	cmk6wlep3002k8jx7v76xp2yy	estudiante	test_1767964800422_205xu	login	Auth	\N	Usuario test_1767964800422_205xu (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 13:20:00.812
cmk6wlfiv00368jx7k1m81l11	2026-01-09 13:20:01.494	cmk6wlf82002z8jx7qi3ejuaw	estudiante	test_1767964801105_9orcz	login	Auth	\N	Usuario test_1767964801105_9orcz (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 13:20:01.496
cmk6wlfyh003h8jx7h9ii5ehd	2026-01-09 13:20:02.056	cmk6wlfoh003c8jx7oqemqdsy	estudiante	test_1767964801696_xzvsh	login	Auth	\N	Usuario test_1767964801696_xzvsh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 13:20:02.057
cmk6wlggq00408jx7p6993419	2026-01-09 13:20:02.713	cmk6wlg28003j8jx74dh2a0d0	tutor	tutor_1767964802192_dabau@test.com	login	Auth	\N	Usuario tutor_1767964802192_dabau@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 13:20:02.714
cmk6wlgy7004j8jx7ivyktm4q	2026-01-09 13:20:03.343	cmk6wlgnp004c8jx740q3pvzm	estudiante	test_1767964802964_bz6j6	login	Auth	\N	Usuario test_1767964802964_bz6j6 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 13:20:03.344
cmk6wlhfo00528jx7i7jzmgqr	2026-01-09 13:20:03.972	cmk6wlh5c004v8jx7daxds5qb	estudiante	test_1767964803599_w5b5p	login	Auth	\N	Usuario test_1767964803599_w5b5p (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 13:20:03.972
cmk6wlhwg005l8jx7pwcycqn6	2026-01-09 13:20:04.576	cmk6wlhmj005e8jx7f9lp43bv	estudiante	test_1767964804218_4nlsx	login	Auth	\N	Usuario test_1767964804218_4nlsx (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 13:20:04.577
cmk6wlibs00688jx7vrlm8887	2026-01-09 13:20:05.127	cmk6wli1b005r8jx74pd0dfrh	estudiante	test_1767964804750_52icy	login	Auth	\N	Usuario test_1767964804750_52icy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 13:20:05.128
cmk6wlirn00798jx7z2tz76zt	2026-01-09 13:20:05.698	cmk6wlih7006e8jx7003zx3mp	estudiante	test_1767964805322_gkp3n	login	Auth	\N	Usuario test_1767964805322_gkp3n (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 13:20:05.699
cmk6wltot000i8jmgyd7ug1w4	2026-01-09 13:20:19.852	cmk6wltdf000b8jmgw6tda0sj	estudiante	test_1767964819442_f7z16	login	Auth	\N	Usuario test_1767964819442_f7z16 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 13:20:19.853
cmk6wlu4o000t8jmgqypnhadl	2026-01-09 13:20:20.424	cmk6wltum000o8jmgtlg2ia3b	estudiante	test_1767964820061_wkyh7	login	Auth	\N	Usuario test_1767964820061_wkyh7 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 13:20:20.425
cmk6wlujh00148jmgrbsfi8f7	2026-01-09 13:20:20.957	cmk6wlu9n000z8jmgwtwycq9i	estudiante	test_1767964820602_6mecm	login	Auth	\N	Usuario test_1767964820602_6mecm (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 13:20:20.957
cmk6wluy1001c8jmg7t087iuk	2026-01-09 13:20:21.481	cmk6wluo700178jmgbfe4jg90	estudiante	test_1767964821126_co2hu	login	Auth	\N	Usuario test_1767964821126_co2hu (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 13:20:21.482
cmk6wlvcn001n8jmg4b1ijg1y	2026-01-09 13:20:22.006	cmk6wlv2r001i8jmg1z4xacqd	estudiante	test_1767964821651_1n8xu	login	Auth	\N	Usuario test_1767964821651_1n8xu (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 13:20:22.007
cmk6wlvr5001y8jmg3avbn4v0	2026-01-09 13:20:22.528	cmk6wlvhe001t8jmgks12v368	estudiante	test_1767964822178_ykmkb	login	Auth	\N	Usuario test_1767964822178_ykmkb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 13:20:22.529
cmk6wlw5f00268jmgbgvdmfew	2026-01-09 13:20:23.042	cmk6wlvvn00218jmgd9pcjxzm	estudiante	test_1767964822691_t49wl	login	Auth	\N	Usuario test_1767964822691_t49wl (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 13:20:23.043
cmk6wlwju002e8jmga8udchlp	2026-01-09 13:20:23.561	cmk6wlwa200298jmgmr9wo1cy	estudiante	test_1767964823209_l9rsx	login	Auth	\N	Usuario test_1767964823209_l9rsx (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 13:20:23.562
cmk6wlwyb002p8jmgzo4allf8	2026-01-09 13:20:24.082	cmk6wlwok002k8jmgbkzvgm3a	estudiante	test_1767964823731_jdf8c	login	Auth	\N	Usuario test_1767964823731_jdf8c (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 13:20:24.083
cmk6wlxev00368jmg9rz6qzth	2026-01-09 13:20:24.679	cmk6wlx4y002z8jmgfup14f4l	estudiante	test_1767964824321_m4npr	login	Auth	\N	Usuario test_1767964824321_m4npr (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 13:20:24.68
cmk6wlxtk003h8jmgi5fyl1jc	2026-01-09 13:20:25.207	cmk6wlxjr003c8jmgtciecegb	estudiante	test_1767964824854_z2wxt	login	Auth	\N	Usuario test_1767964824854_z2wxt (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 13:20:25.208
cmk6wlyau00408jmg4ofjgp39	2026-01-09 13:20:25.83	cmk6wlxwx003j8jmgwlj2rknv	tutor	tutor_1767964825328_v5cou@test.com	login	Auth	\N	Usuario tutor_1767964825328_v5cou@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 13:20:25.831
cmk6wlzs2005l8jmg7pgvn77d	2026-01-09 13:20:27.745	cmk6wlzhg005e8jmg8wzc5gwc	estudiante	test_1767964827364_up734	login	Auth	\N	Usuario test_1767964827364_up734 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 13:20:27.746
cmk6wm08r00688jmg2neyd53j	2026-01-09 13:20:28.347	cmk6wlzxl005r8jmgnkhkf4ys	estudiante	test_1767964827944_o29df	login	Auth	\N	Usuario test_1767964827944_o29df (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 13:20:28.347
cmk6wm0os00798jmg0lcvf3di	2026-01-09 13:20:28.923	cmk6wm0ec006e8jmgtjft8a95	estudiante	test_1767964828547_5xz0e	login	Auth	\N	Usuario test_1767964828547_5xz0e (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 13:20:28.924
cmk6wlyrg004j8jmg58j8v8k7	2026-01-09 13:20:26.428	cmk6wlyhl004c8jmgkirsd19c	estudiante	test_1767964826072_jxjwk	login	Auth	\N	Usuario test_1767964826072_jxjwk (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 13:20:26.429
cmk6wlz9m00528jmg3seffolf	2026-01-09 13:20:27.082	cmk6wlyz0004v8jmgw1xa421r	estudiante	test_1767964826698_pz971	login	Auth	\N	Usuario test_1767964826698_pz971 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 13:20:27.083
cmk7icszh003m8jmpbaw2bqwc	2026-01-09 23:29:10.588	cmk7icsof003l8jmpzectvt9s	tutor	login-test@example.com	login	Auth	\N	Usuario login-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 23:29:10.589
cmk7ictgt00458jmp397j3223	2026-01-09 23:29:11.212	cmk7ict6p003y8jmpsuss0mp7	estudiante	test_1768001350849_c6sxo	login	Auth	\N	Usuario test_1768001350849_c6sxo (estudiante) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 23:29:11.213
cmk7icv99005h8jmpn10f0ruk	2026-01-09 23:29:13.533	cmk7icuyo005a8jmpmqfxzw9c	estudiante	test_1768001353151_8qk9b	login	Auth	\N	Usuario test_1768001353151_8qk9b (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:29:13.534
cmk7icvw300678jmpqu82bbdq	2026-01-09 23:29:14.354	cmk7icvm500628jmp620yobgh	estudiante	test_1768001353996_qhilf	login	Auth	\N	Usuario test_1768001353996_qhilf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:29:14.355
cmk7icwf3006r8jmpnyvyctbg	2026-01-09 23:29:15.039	cmk7icvz300688jmpbushr40u	tutor	docente_1768001354463_n50yu@test.com	login	Auth	\N	Usuario docente_1768001354463_n50yu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:29:15.04
cmk7icwwg007a8jmpigw0ldrq	2026-01-09 23:29:15.663	cmk7icwm500738jmpuo8xp60h	estudiante	test_1768001355292_gutqd	login	Auth	\N	Usuario test_1768001355292_gutqd (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:29:15.664
cmk7icxd8007t8jmppglspdxl	2026-01-09 23:29:16.267	cmk7icx3f007m8jmp3tzhntac	estudiante	test_1768001355914_inco3	login	Auth	\N	Usuario test_1768001355914_inco3 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:29:16.269
cmk7icxu1008c8jmpy1fnnha8	2026-01-09 23:29:16.873	cmk7icxk900858jmps1wrdk9a	estudiante	test_1768001356520_3q06q	login	Auth	\N	Usuario test_1768001356520_3q06q (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:29:16.873
cmk7icyb8008v8jmplqiib2dg	2026-01-09 23:29:17.491	cmk7icy13008o8jmph6zfb2hd	estudiante	test_1768001357126_0ihwx	login	Auth	\N	Usuario test_1768001357126_0ihwx (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:29:17.492
cmk7iczvr009p8jmp814dscif	2026-01-09 23:29:19.526	cmk7iczh400978jmpxju0gimc	estudiante	test_1768001358999_u1cgg	login	Auth	\N	Usuario test_1768001358999_u1cgg (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:29:19.527
cmk7id0d700aa8jmp0h1dpoke	2026-01-09 23:29:20.154	cmk7id03700a18jmpyplcf7w3	estudiante	test_1768001359794_be0zb	login	Auth	\N	Usuario test_1768001359794_be0zb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:29:20.155
cmk7id0y500b68jmphcnlo2fa	2026-01-09 23:29:20.909	cmk7id0k900am8jmpg3gj1jfk	estudiante	test_1768001360408_lbfjf	login	Auth	\N	Usuario test_1768001360408_lbfjf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:29:20.91
cmk7id1br00b88jmpxuglp810	2026-01-09 23:29:21.399	cmk7id11o00b78jmpj90esm1p	tutor	docente_1768001361036_51s3z@test.com	login	Auth	\N	Usuario docente_1768001361036_51s3z@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:29:21.4
cmk7id1pz00bg8jmp8diaxnis	2026-01-09 23:29:21.911	cmk7id1g600bb8jmpr9h746dw	estudiante	test_1768001361557_o6wy8	login	Auth	\N	Usuario test_1768001361557_o6wy8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:29:21.912
cmk7id26w00bz8jmpd967ze0o	2026-01-09 23:29:22.519	cmk7id1wx00bs8jmpcdi4v6er	estudiante	test_1768001362160_rrcg2	login	Auth	\N	Usuario test_1768001362160_rrcg2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:29:22.52
cmk7id2t400d18jmpzlefqjep	2026-01-09 23:29:23.32	cmk7id2dy00cb8jmpgmzw9mjn	estudiante	test_1768001362773_cyuwd	login	Auth	\N	Usuario test_1768001362773_cyuwd (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:29:23.321
cmk7id3e300dz8jmpdyp4v5hi	2026-01-09 23:29:24.075	cmk7id30500dd8jmp5feff6f5	estudiante	test_1768001363573_5zlnf	login	Auth	\N	Usuario test_1768001363573_5zlnf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:29:24.075
cmk7id4xb00ew8jmpj6ri7dtc	2026-01-09 23:29:26.062	cmk7id4ma00e98jmptv6umc0o	estudiante	test_1768001365665_8fotc	login	Auth	\N	Usuario test_1768001365665_8fotc (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:29:26.063
cmk7id5h700ft8jmp1f54j8yz	2026-01-09 23:29:26.778	cmk7id56o00f68jmpstnguzl4	estudiante	test_1768001366400_4g45d	login	Auth	\N	Usuario test_1768001366400_4g45d (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:29:26.779
cmk7id60q00gx8jmp3z8mr4mh	2026-01-09 23:29:27.481	cmk7id5q800g38jmpcttb7ltc	estudiante	test_1768001367104_boyqt	login	Auth	\N	Usuario test_1768001367104_boyqt (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:29:27.482
cmk7id6fk00h58jmpftqs2myu	2026-01-09 23:29:28.015	cmk7id65u00h08jmp08bwpe8t	estudiante	test_1768001367666_wf6qv	login	Auth	\N	Usuario test_1768001367666_wf6qv (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:29:28.016
cmk7id6wi00hl8jmpscqizduk	2026-01-09 23:29:28.626	cmk7id6mi00he8jmpooe6dbaa	estudiante	test_1768001368266_mefo3	login	Auth	\N	Usuario test_1768001368266_mefo3 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:29:28.626
cmk7id7fr00ig8jmpryc4k0cq	2026-01-09 23:29:29.318	cmk7id75d00hv8jmpjzv49air	estudiante	test_1768001368944_j31z7	login	Auth	\N	Usuario test_1768001368944_j31z7 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:29:29.319
cmk7id7t000ii8jmpj98qoje4	2026-01-09 23:29:29.795	cmk7id7j200ih8jmpyaskzjtx	tutor	docente_1768001369437_q7b2v@test.com	login	Auth	\N	Usuario docente_1768001369437_q7b2v@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:29:29.796
cmk7id9ag00iq8jmp11lwqqpn	2026-01-09 23:29:31.719	cmk7id90600il8jmpnk1y19py	estudiante	test_1768001371349_cvyze	login	Auth	\N	Usuario test_1768001371349_cvyze (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:29:31.72
cmk7id9pp00iy8jmpykexy694	2026-01-09 23:29:32.268	cmk7id9fr00it8jmpnobswsfx	estudiante	test_1768001371910_9jbhf	login	Auth	\N	Usuario test_1768001371910_9jbhf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:29:32.269
cmk7ida4t00jc8jmphl1s0h6i	2026-01-09 23:29:32.813	cmk7id9uj00j18jmpgj6567cc	estudiante	test_1768001372442_h23p1	login	Auth	\N	Usuario test_1768001372442_h23p1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:29:32.814
cmk7idake00k58jmp2qp3bdpv	2026-01-09 23:29:33.374	cmk7ida9l00jf8jmpaw2g5qch	estudiante	test_1768001372984_gmiht	login	Auth	\N	Usuario test_1768001372984_gmiht (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:29:33.375
cmk7idaz500kh8jmpdnbnfuzf	2026-01-09 23:29:33.905	cmk7idap700k88jmp533q2fqo	estudiante	test_1768001373547_6asw1	login	Auth	\N	Usuario test_1768001373547_6asw1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:29:33.906
cmk7idbr300ll8jmpo7tjgfmu	2026-01-09 23:29:34.911	cmk7idbhc00lk8jmpv2s1o7eb	tutor	docente_1768001374559_gkmhj@test.com	login	Auth	\N	Usuario docente_1768001374559_gkmhj@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:29:34.912
cmk7idbe900lj8jmpww9lu3te	2026-01-09 23:29:34.449	cmk7idb3u00kk8jmptotywdhe	estudiante	test_1768001374074_bfszf	login	Auth	\N	Usuario test_1768001374074_bfszf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:29:34.45
cmk7idc5k00lt8jmpf5elked4	2026-01-09 23:29:35.431	cmk7idbvk00lo8jmprx4ifpyu	estudiante	test_1768001375071_6a0ky	login	Auth	\N	Usuario test_1768001375071_6a0ky (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:29:35.433
cmk7idcki00m18jmp9wkxi1v4	2026-01-09 23:29:35.97	cmk7idcae00lw8jmp3dlyk7xx	estudiante	test_1768001375605_wtz5g	login	Auth	\N	Usuario test_1768001375605_wtz5g (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:29:35.971
cmk7ide3w00mk8jmp1zgxkd30	2026-01-09 23:29:37.963	cmk7iddtc00md8jmpp6vdafi0	estudiante	test_1768001377583_qbtpe	login	Auth	\N	Usuario test_1768001377583_qbtpe (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:29:37.965
cmk7ideo800n58jmpk6ri7fp4	2026-01-09 23:29:38.696	cmk7ideeb00n08jmppseqjew7	estudiante	test_1768001378338_8io7f	login	Auth	\N	Usuario test_1768001378338_8io7f (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:29:38.697
cmk7idf3100nd8jmp6mbffvt8	2026-01-09 23:29:39.229	cmk7idet500n88jmpo8nn92dr	estudiante	test_1768001378871_4fmjb	login	Auth	\N	Usuario test_1768001378871_4fmjb (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:29:39.23
cmk7idfhk00no8jmpq0nw92c8	2026-01-09 23:29:39.752	cmk7idf7u00nj8jmpp0id1bur	estudiante	test_1768001379401_hgr2r	login	Auth	\N	Usuario test_1768001379401_hgr2r (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:29:39.753
cmk7idfwh00nz8jmpyxegye8e	2026-01-09 23:29:40.289	cmk7idfmg00nu8jmpfivx5gie	estudiante	test_1768001379927_tv2r7	login	Auth	\N	Usuario test_1768001379927_tv2r7 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:29:40.29
cmk7idgb400o78jmpvwz91o6l	2026-01-09 23:29:40.815	cmk7idg1b00o28jmp5yfa8di7	estudiante	test_1768001380462_qtpa6	login	Auth	\N	Usuario test_1768001380462_qtpa6 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:29:40.816
cmk7idgpm00of8jmpwl7pwwfr	2026-01-09 23:29:41.338	cmk7idgfr00oa8jmppl7wqs5k	estudiante	test_1768001380982_mxxoa	login	Auth	\N	Usuario test_1768001380982_mxxoa (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:29:41.338
cmk7idh4900oq8jmp2fyewedt	2026-01-09 23:29:41.864	cmk7idgug00ol8jmp5iyvzv7g	estudiante	test_1768001381511_9j5gh	login	Auth	\N	Usuario test_1768001381511_9j5gh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:29:41.865
cmk7idhla00p78jmp1x6blmgr	2026-01-09 23:29:42.477	cmk7idhb300p08jmpldqkfffd	estudiante	test_1768001382110_zep2u	login	Auth	\N	Usuario test_1768001382110_zep2u (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 23:29:42.478
cmk7idi0500pi8jmp0othggyk	2026-01-09 23:29:43.013	cmk7idhq900pd8jmptdmma4yl	estudiante	test_1768001382656_30ffm	login	Auth	\N	Usuario test_1768001382656_30ffm (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 23:29:43.014
cmk7idihq00q18jmpdnspd4x1	2026-01-09 23:29:43.646	cmk7idi3q00pk8jmpcz5zibzx	tutor	tutor_1768001383141_s40ce@test.com	login	Auth	\N	Usuario tutor_1768001383141_s40ce@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 23:29:43.647
cmk7idiyf00qk8jmpbq3mivuv	2026-01-09 23:29:44.247	cmk7idiok00qd8jmphlxjwba9	estudiante	test_1768001383890_6snbg	login	Auth	\N	Usuario test_1768001383890_6snbg (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 23:29:44.248
cmk7idjfb00r38jmpenyrrv8f	2026-01-09 23:29:44.854	cmk7idj5f00qw8jmp25gixzad	estudiante	test_1768001384498_e6xe2	login	Auth	\N	Usuario test_1768001384498_e6xe2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 23:29:44.855
cmk7idjwa00rm8jmpcwsrucn7	2026-01-09 23:29:45.466	cmk7idjmf00rf8jmp8l3mjcwr	estudiante	test_1768001385110_h5lg6	login	Auth	\N	Usuario test_1768001385110_h5lg6 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 23:29:45.466
cmk7idkbk00s98jmph7jjrzqq	2026-01-09 23:29:46.016	cmk7idk1900rs8jmprhrv9sl9	estudiante	test_1768001385644_7nvee	login	Auth	\N	Usuario test_1768001385644_7nvee (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 23:29:46.017
cmk7idkrk00ta8jmp6lesnmh1	2026-01-09 23:29:46.591	cmk7idkgz00sf8jmp5q4cjj8k	estudiante	test_1768001386210_nr710	login	Auth	\N	Usuario test_1768001386210_nr710 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 23:29:46.592
cmk7idmwa00vz8jmp6mpj9a26	2026-01-09 23:29:49.353	cmk7idmlc00vc8jmpni5o4gf1	estudiante	test_1768001388959_l7o4e	login	Auth	\N	Usuario test_1768001388959_l7o4e (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:29:49.354
cmk7idng700wy8jmptx9p9dd4	2026-01-09 23:29:50.07	cmk7idn5u00wb8jmpm68p6bm6	estudiante	test_1768001389697_mydox	login	Auth	\N	Usuario test_1768001389697_mydox (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:29:50.071
cmk7idob700y68jmpg7lzlanq	2026-01-09 23:29:51.187	cmk7ido1d00y58jmp3lwb2ssx	tutor	docente_1768001390833_32s4v@test.com	login	Auth	\N	Usuario docente_1768001390833_32s4v@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:29:51.188
cmk7idopf00ye8jmpjkem18gd	2026-01-09 23:29:51.699	cmk7idofk00y98jmpjguwey82	estudiante	test_1768001391343_bnj26	login	Auth	\N	Usuario test_1768001391343_bnj26 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:29:51.7
cmk7idp8f00z98jmpp8swke5l	2026-01-09 23:29:52.382	cmk7idoy500yo8jmp04ryvepl	estudiante	test_1768001392012_fo93q	login	Auth	\N	Usuario test_1768001392012_fo93q (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:29:52.383
cmk7idprk01068jmpksfx4r1s	2026-01-09 23:29:53.071	cmk7idphc00zj8jmpff4xoxm5	estudiante	test_1768001392703_jz8ps	login	Auth	\N	Usuario test_1768001392703_jz8ps (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:29:53.072
cmk7idqel011a8jmpuz38orev	2026-01-09 23:29:53.9	cmk7idq4q01158jmpfiyar4o2	estudiante	test_1768001393545_rf3qy	login	Auth	\N	Usuario test_1768001393545_rf3qy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 23:29:53.901
cmk7idqxi01278jmpsnea5wt3	2026-01-09 23:29:54.582	cmk7idqnd011k8jmp22f4ljli	estudiante	test_1768001394216_ffnc8	login	Auth	\N	Usuario test_1768001394216_ffnc8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 23:29:54.583
cmk7ieghv014j8jmpr94pfbck	2026-01-09 23:30:27.714	cmk7ieg7301418jmpzg7yk0q8	estudiante	test_1768001427326_0xkf4	login	Auth	\N	Usuario test_1768001427326_0xkf4 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:30:27.715
cmk7iehbi015f8jmp4cl9ouka	2026-01-09 23:30:28.781	cmk7iegxk014x8jmp96uqdf9l	estudiante	test_1768001428279_vyw8y	login	Auth	\N	Usuario test_1768001428279_vyw8y (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:30:28.782
cmk7ieikm017m8jmpdhoczfdn	2026-01-09 23:30:30.406	cmk7iei29016m8jmp9r65z56x	estudiante	test_1768001429744_t32gy	login	Auth	\N	Usuario test_1768001429744_t32gy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:30:30.407
cmk7ieiui017n8jmp2wn1lb3u	2026-01-09 23:30:30.761	cmk7iei6g01768jmp15fzl90y	estudiante	test_1768001429895_rwpa5	login	Auth	\N	Usuario test_1768001429895_rwpa5 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:30:30.762
cmk7iej47017o8jmp0clm7lsb	2026-01-09 23:30:31.111	cmk7ieiaj017f8jmpublhtb9s	estudiante	test_1768001430042_yn8e3	login	Auth	\N	Usuario test_1768001430042_yn8e3 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:30:31.112
cmk7iejqa01908jmpmrvk4d25	2026-01-09 23:30:31.906	cmk7iejbz01868jmpfeyg1kym	estudiante	test_1768001431390_198c1	login	Auth	\N	Usuario test_1768001431390_198c1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:30:31.907
cmk7iekj501as8jmpl00ob2ih	2026-01-09 23:30:32.944	cmk7iek4i019y8jmp7ui4dnyo	estudiante	test_1768001432417_f2286	login	Auth	\N	Usuario test_1768001432417_f2286 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 23:30:32.945
cmk7iel3q01bl8jmpssxfz8j5	2026-01-09 23:30:33.686	cmk7iektc01be8jmp8oejhy0k	estudiante	test_1768001433311_114cj	login	Auth	\N	Usuario test_1768001433311_114cj (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 23:30:33.686
cmk7iel3s01bm8jmpdmx3fo55	2026-01-09 23:30:33.687	cmk7iektc01be8jmp8oejhy0k	estudiante	test_1768001433311_114cj	login	Auth	\N	Usuario test_1768001433311_114cj (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 23:30:33.688
cmk7iel4901bn8jmphttrx4nn	2026-01-09 23:30:33.704	cmk7iektc01be8jmp8oejhy0k	estudiante	test_1768001433311_114cj	login	Auth	\N	Usuario test_1768001433311_114cj (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-09 23:30:33.705
cmk7ifax501ef8jmp77iz56ne	2026-01-09 23:31:07.144	cmk7ifaih01dz8jmpjalod88t	estudiante	test_1768001466617_0yx1u	login	Auth	\N	Usuario test_1768001466617_0yx1u (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:31:07.145
cmk7ifblk01f98jmpu2tphlso	2026-01-09 23:31:08.023	cmk7ifb6x01et8jmpapbcidzi	estudiante	test_1768001467496_ji2oo	login	Auth	\N	Usuario test_1768001467496_ji2oo (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:31:08.024
cmk7ifc7d01g38jmpn1zvniem	2026-01-09 23:31:08.808	cmk7ifbt001fp8jmphyovskay	estudiante	test_1768001468290_qco5c	login	Auth	\N	Usuario test_1768001468290_qco5c (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:31:08.809
cmk7ifcy201hd8jmpu2l2znpr	2026-01-09 23:31:09.769	cmk7ifchw01gz8jmp97eb1nao	estudiante	test_1768001469187_rkezu	login	Auth	\N	Usuario test_1768001469187_rkezu (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:31:09.77
cmk7ifdjq01ik8jmplzifg0e0	2026-01-09 23:31:10.549	cmk7ifd9l01ib8jmp31tmw3q4	estudiante	test_1768001470184_is9on	login	Auth	\N	Usuario test_1768001470184_is9on (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:31:10.55
cmk7ifdx001im8jmp1bxozmyz	2026-01-09 23:31:11.027	cmk7ifdn201il8jmpb9bzrxjg	tutor	docente_1768001470669_2bcex@test.com	login	Auth	\N	Usuario docente_1768001470669_2bcex@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:31:11.028
cmk7ifei901je8jmpe0ijgpld	2026-01-09 23:31:11.792	cmk7ife3q01iy8jmpzp9oteek	estudiante	test_1768001471269_k8vav	login	Auth	\N	Usuario test_1768001471269_k8vav (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-09 23:31:11.793
cmk7iff1901jx8jmptkg90y79	2026-01-09 23:31:12.476	cmk7ifer201jq8jmpohmvb8bs	estudiante	test_1768001472109_g8xr7	login	Auth	\N	Usuario test_1768001472109_g8xr7 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 23:31:12.477
cmk7iffma01kp8jmp6wzftn1d	2026-01-09 23:31:13.234	cmk7iff8d01k98jmpx17n1zj5	estudiante	test_1768001472732_mldcf	login	Auth	\N	Usuario test_1768001472732_mldcf (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 23:31:13.235
cmk7ig4hr01la8jmp9pakzj2y	2026-01-09 23:31:45.47	cmk7ig47c01l38jmpeopty91a	estudiante	test_1768001505096_xbis6	login	Auth	\N	Usuario test_1768001505096_xbis6 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 23:31:45.471
cmk7ig4q701lb8jmp9pwe2dt0	2026-01-09 23:31:45.775	cmk7ig47c01l38jmpeopty91a	estudiante	test_1768001505096_xbis6	login	Auth	\N	Usuario test_1768001505096_xbis6 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 23:31:45.776
cmk7ig4yb01lc8jmpm6manwnl	2026-01-09 23:31:46.066	cmk7ig47c01l38jmpeopty91a	estudiante	test_1768001505096_xbis6	login	Auth	\N	Usuario test_1768001505096_xbis6 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 23:31:46.067
cmk7ig56l01ld8jmp5fhvs2jp	2026-01-09 23:31:46.365	cmk7ig47c01l38jmpeopty91a	estudiante	test_1768001505096_xbis6	login	Auth	\N	Usuario test_1768001505096_xbis6 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 23:31:46.366
cmk7ig5em01le8jmpx858d911	2026-01-09 23:31:46.653	cmk7ig47c01l38jmpeopty91a	estudiante	test_1768001505096_xbis6	login	Auth	\N	Usuario test_1768001505096_xbis6 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.100.100	\N	\N	2026-01-09 23:31:46.654
cmk7ig64e01mf8jmpp6mdotvm	2026-01-09 23:31:47.582	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.1	\N	\N	2026-01-09 23:31:47.582
cmk7ig6cc01mg8jmpyndoxmug	2026-01-09 23:31:47.867	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.2	\N	\N	2026-01-09 23:31:47.868
cmk7ig6ke01mh8jmprpoxnsow	2026-01-09 23:31:48.158	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.3	\N	\N	2026-01-09 23:31:48.158
cmk7ig6sc01mi8jmpqy5sgcc3	2026-01-09 23:31:48.443	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.4	\N	\N	2026-01-09 23:31:48.444
cmk7ig70401mj8jmphk16aud9	2026-01-09 23:31:48.723	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.5	\N	\N	2026-01-09 23:31:48.724
cmk7ig78101mk8jmpp4ez4gae	2026-01-09 23:31:49.008	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.6	\N	\N	2026-01-09 23:31:49.009
cmk7ig7fv01ml8jmpimukexxs	2026-01-09 23:31:49.291	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.7	\N	\N	2026-01-09 23:31:49.292
cmk7ig7np01mm8jmpod7n3ob0	2026-01-09 23:31:49.573	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.8	\N	\N	2026-01-09 23:31:49.574
cmk7ig7vj01mn8jmpo32l1a7k	2026-01-09 23:31:49.855	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.9	\N	\N	2026-01-09 23:31:49.856
cmk7ig83i01mo8jmp7mxc3y64	2026-01-09 23:31:50.142	cmk7ig5u501m88jmp47x2jf2r	estudiante	test_1768001507212_n7hzs	login	Auth	\N	Usuario test_1768001507212_n7hzs (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.200.10	\N	\N	2026-01-09 23:31:50.143
cmk7ig8ln01n78jmpqe4w980n	2026-01-09 23:31:50.795	cmk7ig8ag01n08jmpu4f0zivw	estudiante	test_1768001510391_w2jo2	login	Auth	\N	Usuario test_1768001510391_w2jo2 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 23:31:50.796
cmk7ig8u201n88jmp49lcim16	2026-01-09 23:31:51.098	cmk7ig8ag01n08jmpu4f0zivw	estudiante	test_1768001510391_w2jo2	login	Auth	\N	Usuario test_1768001510391_w2jo2 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 23:31:51.099
cmk7ig92s01n98jmpn1dzzmh6	2026-01-09 23:31:51.41	cmk7ig8ag01n08jmpu4f0zivw	estudiante	test_1768001510391_w2jo2	login	Auth	\N	Usuario test_1768001510391_w2jo2 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 23:31:51.412
cmk7ig9nr01nb8jmpdqej4ubi	2026-01-09 23:31:52.166	cmk7ig8ag01n08jmpu4f0zivw	estudiante	test_1768001510391_w2jo2	login	Auth	\N	Usuario test_1768001510391_w2jo2 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 23:31:52.167
cmk7ig9fb01na8jmplk9cnvnd	2026-01-09 23:31:51.862	cmk7ig8ag01n08jmpu4f0zivw	estudiante	test_1768001510391_w2jo2	login	Auth	\N	Usuario test_1768001510391_w2jo2 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.1	\N	\N	2026-01-09 23:31:51.863
cmk7ig9xe01nc8jmprmtwwfo1	2026-01-09 23:31:52.514	cmk7ig8ag01n08jmpu4f0zivw	estudiante	test_1768001510391_w2jo2	login	Auth	\N	Usuario test_1768001510391_w2jo2 (estudiante) inició sesión exitosamente	null	null	info	auth	192.168.50.2	\N	\N	2026-01-09 23:31:52.514
cmk7igdal01ov8jmptfmxk8ld	2026-01-09 23:31:56.877	cmk7igcsi01oo8jmpd4htfulf	estudiante	test_1768001516225_bfyvm	login	Auth	\N	Usuario test_1768001516225_bfyvm (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:31:56.878
cmk7igdmo01ow8jmpwkkr98tc	2026-01-09 23:31:57.311	cmk7igcsi01oo8jmpd4htfulf	estudiante	test_1768001516225_bfyvm	login	Auth	\N	Usuario test_1768001516225_bfyvm (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:31:57.312
cmk7igg9v01r78jmpb23peeyf	2026-01-09 23:32:00.737	cmk7igfxt01r28jmp4tb0u94f	estudiante	test_1768001520302_75v2x	login	Auth	\N	Usuario test_1768001520302_75v2x (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-09 23:32:00.739
cmk7iggpn01rf8jmpsjvoi63y	2026-01-09 23:32:01.306	cmk7iggf101ra8jmp7dl4iula	estudiante	test_1768001520925_sgm01	login	Auth	\N	Usuario test_1768001520925_sgm01 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-09 23:32:01.307
cmk7igh6i01rq8jmp4w6utlwt	2026-01-09 23:32:01.913	cmk7iggv301rl8jmpprnh2pja	estudiante	test_1768001521502_25noc	login	Auth	\N	Usuario test_1768001521502_25noc (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-09 23:32:01.914
cmk7ighnm01ry8jmppratv4i6	2026-01-09 23:32:02.53	cmk7ighc001rt8jmpiwx1zvwg	estudiante	test_1768001522111_jk2tq	login	Auth	\N	Usuario test_1768001522111_jk2tq (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-09 23:32:02.53
cmk7igi4201s98jmp0dp1nb6b	2026-01-09 23:32:03.121	cmk7ighsv01s48jmpedgyjx95	estudiante	test_1768001522718_u0wgt	login	Auth	\N	Usuario test_1768001522718_u0wgt (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-09 23:32:03.122
cmk7igk0o01sb8jmp3u50crh1	2026-01-09 23:32:05.591	cmk7igjps01sa8jmpa59hfq2w	tutor	docente-test@example.com	login	Auth	\N	Usuario docente-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:32:05.592
cmk7igken01sg8jmpggc7r1qo	2026-01-09 23:32:06.095	cmk7igk4l01sf8jmp4grvug0d	tutor	docente-sin-clases@example.com	login	Auth	\N	Usuario docente-sin-clases@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:32:06.096
cmk7igkx501si8jmplosfforw	2026-01-09 23:32:06.76	cmk7igkoz01sh8jmpl47n1jmy	tutor	tutor-proxima@example.com	login	Auth	\N	Usuario tutor-proxima@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:32:06.761
cmk7iglab01sk8jmp8z1bm5pd	2026-01-09 23:32:07.234	cmk7igl0501sj8jmpa1uivrxj	tutor	docente-inactivo@example.com	login	Auth	\N	Usuario docente-inactivo@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:32:07.235
cmk7iglpb01sp8jmpzlrdfno5	2026-01-09 23:32:07.775	cmk7iglei01so8jmpv1qck1vk	tutor	docente-comision@example.com	login	Auth	\N	Usuario docente-comision@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:32:07.776
cmk7igm3301sz8jmplvl5dpfg	2026-01-09 23:32:08.27	cmk7iglsy01sy8jmp8ooi3fmc	tutor	docente-prod@example.com	login	Auth	\N	Usuario docente-prod@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:32:08.271
cmk7igmhk01t48jmpnnhzm6hl	2026-01-09 23:32:08.791	cmk7igm6q01t38jmpjbw5r8dt	tutor	docente-noexiste@example.com	login	Auth	\N	Usuario docente-noexiste@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:32:08.792
cmk7igmvt01t68jmplfptmb2h	2026-01-09 23:32:09.304	cmk7igmlm01t58jmp9qnkg1m5	tutor	docente1-ownership@example.com	login	Auth	\N	Usuario docente1-ownership@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:32:09.305
cmk7igni801tc8jmpr85lk4si	2026-01-09 23:32:10.111	cmk7ign8v01tb8jmpq5sl5tqg	tutor	tutor-comision-forbidden@example.com	login	Auth	\N	Usuario tutor-comision-forbidden@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-09 23:32:10.112
cmk7ignv301te8jmp3zrk9y0d	2026-01-09 23:32:10.575	cmk7ignkz01td8jmpmcamcgsg	tutor	docente-filter@example.com	login	Auth	\N	Usuario docente-filter@example.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-09 23:32:10.576
cmk7ih0n7027j8jmpr59feclh	2026-01-09 23:32:27.139	cmk7ih0es027i8jmp2sks0zdk	tutor	integration-test@example.com	login	Auth	\N	Usuario integration-test@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 23:32:27.14
cmk7ih1u1027n8jmpg9w4gpk4	2026-01-09 23:32:28.681	cmk7ih1lr027m8jmpd8xugwv7	tutor	protected@example.com	login	Auth	\N	Usuario protected@example.com (tutor) inició sesión exitosamente	null	null	info	auth	::ffff:127.0.0.1	\N	\N	2026-01-09 23:32:28.682
cmk7ir1ba00078j1ahrjy1s4w	2026-01-09 23:40:14.566	cmk7ir11b00028j1azl6svjpc	estudiante	test_1768002014207_98tnv	login	Auth	\N	Usuario test_1768002014207_98tnv (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:40:14.566
cmk7ir1p6000f8j1apnn58z5u	2026-01-09 23:40:15.066	cmk7ir1g9000a8j1a4zz0urgh	estudiante	test_1768002014745_k7l7j	login	Auth	\N	Usuario test_1768002014745_k7l7j (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:40:15.067
cmk7ir22y000t8j1adpfpcq1a	2026-01-09 23:40:15.561	cmk7ir1tr000i8j1ajqr29kir	estudiante	test_1768002015230_vubc1	login	Auth	\N	Usuario test_1768002015230_vubc1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:40:15.562
cmk7ir2h6001m8j1adpuarv4y	2026-01-09 23:40:16.073	cmk7ir27n000w8j1ai38qmsxy	estudiante	test_1768002015730_0276z	login	Auth	\N	Usuario test_1768002015730_0276z (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:40:16.074
cmk7ir2un001y8j1aiw05h6f3	2026-01-09 23:40:16.559	cmk7ir2ll001p8j1axzh418em	estudiante	test_1768002016232_w14h3	login	Auth	\N	Usuario test_1768002016232_w14h3 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:40:16.559
cmk7ir38s00308j1acjei3esu	2026-01-09 23:40:17.068	cmk7ir2z200218j1a6z6w1nyr	estudiante	test_1768002016717_38757	login	Auth	\N	Usuario test_1768002016717_38757 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:40:17.068
cmk7ir3ky00328j1adtonapq1	2026-01-09 23:40:17.506	cmk7ir3bw00318j1atehi3qnq	tutor	docente_1768002017180_afupe@test.com	login	Auth	\N	Usuario docente_1768002017180_afupe@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:40:17.507
cmk7ir3xz003a8j1al67ywucn	2026-01-09 23:40:17.974	cmk7ir3p400358j1abdmixwni	estudiante	test_1768002017655_0u0jh	login	Auth	\N	Usuario test_1768002017655_0u0jh (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:40:17.975
cmk7ir4ba003i8j1a0s42tyle	2026-01-09 23:40:18.454	cmk7ir42d003d8j1akrio2f3v	estudiante	test_1768002018133_9zwe8	login	Auth	\N	Usuario test_1768002018133_9zwe8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:40:18.454
cmk7iri5600078j9xn1l7n6d6	2026-01-09 23:40:36.378	cmk7irhuz00028j9xa6v767yb	estudiante	test_1768002036010_phdfi	login	Auth	\N	Usuario test_1768002036010_phdfi (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-09 23:40:36.379
cmk7irijc000f8j9xvcqzqewv	2026-01-09 23:40:36.888	cmk7iriaa000a8j9xi2fojqzd	estudiante	test_1768002036562_kfd1a	login	Auth	\N	Usuario test_1768002036562_kfd1a (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-09 23:40:36.889
cmk7irixa000t8j9x5oro1zkq	2026-01-09 23:40:37.389	cmk7irinw000i8j9xxxppd8vs	estudiante	test_1768002037051_9h5vj	login	Auth	\N	Usuario test_1768002037051_9h5vj (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-09 23:40:37.39
cmk7irjbi001m8j9x31i1ba17	2026-01-09 23:40:37.901	cmk7irj1s000w8j9x52ukphax	estudiante	test_1768002037551_eprpo	login	Auth	\N	Usuario test_1768002037551_eprpo (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-09 23:40:37.902
cmk7irjp0001y8j9x78yh6kik	2026-01-09 23:40:38.387	cmk7irjfu001p8j9xmpy3iios	estudiante	test_1768002038057_ot441	login	Auth	\N	Usuario test_1768002038057_ot441 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-09 23:40:38.388
cmk7irk3a00308j9xo6jr86va	2026-01-09 23:40:38.901	cmk7irjtj00218j9xelt70bxk	estudiante	test_1768002038550_154ce	login	Auth	\N	Usuario test_1768002038550_154ce (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-09 23:40:38.902
cmk7irkfe00328j9xxbap9xyn	2026-01-09 23:40:39.338	cmk7irk6e00318j9xsh347mr2	tutor	docente_1768002039013_7lvcx@test.com	login	Auth	\N	Usuario docente_1768002039013_7lvcx@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-09 23:40:39.339
cmk7irkss003a8j9xylxnaeh7	2026-01-09 23:40:39.819	cmk7irkjr00358j9xfhtf2w6n	estudiante	test_1768002039494_5m3wi	login	Auth	\N	Usuario test_1768002039494_5m3wi (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-09 23:40:39.82
cmk7irl6d003i8j9xlmprtcbc	2026-01-09 23:40:40.309	cmk7irkx6003d8j9xko08phm0	estudiante	test_1768002039977_h7xo2	login	Auth	\N	Usuario test_1768002039977_h7xo2 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-09 23:40:40.31
cmk7q5v4200018jn6g6550pwh	2026-01-10 03:07:43.682	cmk7q5utj00008jn6m6lmt9x8	tutor	tutor_1768014463302_g0m7s@test.com	login	Auth	\N	Usuario tutor_1768014463302_g0m7s@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:07:43.683
cmk7q5vj800098jn6ccr0wguz	2026-01-10 03:07:44.227	cmk7q5v9200048jn62ljvclsf	estudiante	test_1768014463787_7u823	login	Auth	\N	Usuario test_1768014463787_7u823 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:07:44.228
cmk7q5vw9000b8jn6ggwub6av	2026-01-10 03:07:44.696	cmk7q5vm9000a8jn6312t3ta2	tutor	docente_1768014464336_s9cax@test.com	login	Auth	\N	Usuario docente_1768014464336_s9cax@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:07:44.697
cmk7q5w8y000d8jn6at4oo1qs	2026-01-10 03:07:45.153	cmk7q5vz2000c8jn6qhw6hy63	tutor	docente_1768014464798_v8hqi@test.com	login	Auth	\N	Usuario docente_1768014464798_v8hqi@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:07:45.154
cmk7q5wo1000z8jn6nf84mm1e	2026-01-10 03:07:45.697	cmk7q5wbl000e8jn651soawd9	tutor	docente_1768014465249_f42bd@test.com	login	Auth	\N	Usuario docente_1768014465249_f42bd@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:07:45.698
cmk7q5x3t001x8jn6akmb7x9z	2026-01-10 03:07:46.264	cmk7q5wr800108jn6wsr9o1eg	tutor	docente_1768014465811_gjpk7@test.com	login	Auth	\N	Usuario docente_1768014465811_gjpk7@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:07:46.265
cmk7q5xjc002s8jn6joyt4ozw	2026-01-10 03:07:46.823	cmk7q5x6t001y8jn6dmyt7c89	tutor	docente_1768014466373_xjhvt@test.com	login	Auth	\N	Usuario docente_1768014466373_xjhvt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:07:46.824
cmk7q5y0g003l8jn62p11m0cp	2026-01-10 03:07:47.44	cmk7q5xm7002t8jn67amct7vv	tutor	docente_1768014466927_8epeo@test.com	login	Auth	\N	Usuario docente_1768014466927_8epeo@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:07:47.441
cmk7q5yfw004l8jn6vke61oas	2026-01-10 03:07:47.996	cmk7q5y3a003m8jn6hnakagok	tutor	docente_1768014467542_77qrt@test.com	login	Auth	\N	Usuario docente_1768014467542_77qrt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:07:47.997
cmk7q5yvs00578jn643lor8a7	2026-01-10 03:07:48.568	cmk7q5yjk004m8jn65f99sk5q	tutor	docente_1768014468128_mfnwk@test.com	login	Auth	\N	Usuario docente_1768014468128_mfnwk@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:07:48.569
cmk7q5z8h005h8jn6dka3jiaq	2026-01-10 03:07:49.025	cmk7q5yyn00588jn61m4o2sib	tutor	docente_1768014468670_2mqya@test.com	login	Auth	\N	Usuario docente_1768014468670_2mqya@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:07:49.025
cmk7q5znf00638jn6as1wxbt6	2026-01-10 03:07:49.562	cmk7q5zbb005i8jn61kcurush	tutor	docente_1768014469127_fzfeb@test.com	login	Auth	\N	Usuario docente_1768014469127_fzfeb@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:07:49.563
cmk7qctz300018juy7to71ig7	2026-01-10 03:13:08.798	cmk7qctor00008juykurjsgwa	tutor	tutor_1768014788426_ucudp@test.com	login	Auth	\N	Usuario tutor_1768014788426_ucudp@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:13:08.799
cmk7qcuds00098juys6r5vfr9	2026-01-10 03:13:09.327	cmk7qcu3y00048juydkha2the	estudiante	test_1768014788904_4httc	login	Auth	\N	Usuario test_1768014788904_4httc (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:13:09.328
cmk7qcute00108juy94byu6au	2026-01-10 03:13:09.89	cmk7qcugy000a8juy7jwqmgsj	tutor	docente_1768014789441_3fx5s@test.com	login	Auth	\N	Usuario docente_1768014789441_3fx5s@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:13:09.891
cmk7qcv8s001r8juybzciikiy	2026-01-10 03:13:10.443	cmk7qcuwk00118juy3neagkl7	tutor	docente_1768014790004_hb7a6@test.com	login	Auth	\N	Usuario docente_1768014790004_hb7a6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:13:10.444
cmk7qcvnk002i8juydo3w3msa	2026-01-10 03:13:10.976	cmk7qcvbg001s8juy5e7vquog	tutor	docente_1768014790540_z1o0t@test.com	login	Auth	\N	Usuario docente_1768014790540_z1o0t@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:13:10.977
cmk7qcvzy002k8juy6rjkk4wv	2026-01-10 03:13:11.422	cmk7qcvq9002j8juynabr2zhq	tutor	docente_1768014791072_f0d4p@test.com	login	Auth	\N	Usuario docente_1768014791072_f0d4p@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:13:11.422
cmk7qcwek003b8juy8rd23icw	2026-01-10 03:13:11.948	cmk7qcw2i002l8juy2dc8km9f	tutor	docente_1768014791514_ph9b3@test.com	login	Auth	\N	Usuario docente_1768014791514_ph9b3@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:13:11.949
cmk7qcwvy004a8juy3rdrx6zy	2026-01-10 03:13:12.574	cmk7qcwme00498juyehcsvile	tutor	docente_1768014792229_thids@test.com	login	Auth	\N	Usuario docente_1768014792229_thids@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:13:12.575
cmk7qcxb000518juyw1zjedg2	2026-01-10 03:13:13.116	cmk7qcwz1004b8juyt0gr5hui	tutor	docente_1768014792684_onzc7@test.com	login	Auth	\N	Usuario docente_1768014792684_onzc7@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:13:13.117
cmk7qcxpp005s8juy24g2aofp	2026-01-10 03:13:13.645	cmk7qcxds00528juy3nyyj2fl	tutor	docente_1768014793215_i8r78@test.com	login	Auth	\N	Usuario docente_1768014793215_i8r78@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:13:13.645
cmk7qcy4b006j8juykc214ee9	2026-01-10 03:13:14.17	cmk7qcxsc005t8juyedu4q0wr	tutor	docente_1768014793739_5per4@test.com	login	Auth	\N	Usuario docente_1768014793739_5per4@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:13:14.171
cmk7qcyo7007a8juyo3di7u60	2026-01-10 03:13:14.887	cmk7qcyc5006k8juyrl51h9xr	tutor	docente_1768014794453_fbb0t@test.com	login	Auth	\N	Usuario docente_1768014794453_fbb0t@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:13:14.888
cmk7qcz2n00838juyab6x7nxf	2026-01-10 03:13:15.406	cmk7qcyqs007d8juy10byget7	tutor	docente_1768014794980_m2tqh@test.com	login	Auth	\N	Usuario docente_1768014794980_m2tqh@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:13:15.407
cmk7qczh7008u8juy6218tpxc	2026-01-10 03:13:15.931	cmk7qcz5c00848juyqtmoagvk	tutor	docente_1768014795503_3w4qc@test.com	login	Auth	\N	Usuario docente_1768014795503_3w4qc@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:13:15.932
cmk7qczvy009l8juy1ssyy4ov	2026-01-10 03:13:16.461	cmk7qczk3008v8juyo63f4985	tutor	docente_1768014796034_7fmg6@test.com	login	Auth	\N	Usuario docente_1768014796034_7fmg6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:13:16.462
cmk7qd0bp00ac8juygqwg6opd	2026-01-10 03:13:17.028	cmk7qczzr009m8juygtdg76gu	tutor	docente_1768014796598_bwhdo@test.com	login	Auth	\N	Usuario docente_1768014796598_bwhdo@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:13:17.029
cmk7qd0qy00b58juykmnudx0j	2026-01-10 03:13:17.577	cmk7qd0e600af8juyywonf427	tutor	docente_1768014797118_8w16q@test.com	login	Auth	\N	Usuario docente_1768014797118_8w16q@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:13:17.578
cmk7qd16400bz8juy4u2y403x	2026-01-10 03:13:18.123	cmk7qd0tr00b88juyye09dze9	tutor	docente_1768014797678_3yqsn@test.com	login	Auth	\N	Usuario docente_1768014797678_3yqsn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 03:13:18.124
cmk7qd1kr00cq8juyr5z78jld	2026-01-10 03:13:18.65	cmk7qd18u00c08juyyjh3jwlf	tutor	docente_1768014798221_7u5jm@test.com	login	Auth	\N	Usuario docente_1768014798221_7u5jm@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 03:13:18.651
cmk7qh69c00018jfn88ncgxk7	2026-01-10 03:16:31.344	cmk7qh5yt00008jfn3jpaakdo	tutor	tutor_1768014990964_afpil@test.com	login	Auth	\N	Usuario tutor_1768014990964_afpil@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:16:31.345
cmk7qh6o300098jfnyljlm3lo	2026-01-10 03:16:31.874	cmk7qh6e200048jfnge2qjoey	estudiante	test_1768014991443_348ey	login	Auth	\N	Usuario test_1768014991443_348ey (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:16:31.875
cmk7qh73x00108jfnkf08anvx	2026-01-10 03:16:32.444	cmk7qh6rh000a8jfnard3u7ud	tutor	docente_1768014991996_2l81v@test.com	login	Auth	\N	Usuario docente_1768014991996_2l81v@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:16:32.445
cmk7qh7gp00148jfnzm71mtf5	2026-01-10 03:16:32.905	cmk7qh77600138jfnkj65tfh3	tutor	docente_1768014992561_dqqxh@test.com	login	Auth	\N	Usuario docente_1768014992561_dqqxh@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:16:32.906
cmk7qh7vh001v8jfnamexq17d	2026-01-10 03:16:33.436	cmk7qh7jd00158jfntljt58bj	tutor	docente_1768014993000_abqge@test.com	login	Auth	\N	Usuario docente_1768014993000_abqge@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:16:33.437
cmk7qh8dc002u8jfniz9qmp1s	2026-01-10 03:16:34.079	cmk7qh83r002t8jfnnci2j2u2	tutor	docente_1768014993734_x75kl@test.com	login	Auth	\N	Usuario docente_1768014993734_x75kl@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:16:34.08
cmk7qh8sa003l8jfntnhacoi5	2026-01-10 03:16:34.618	cmk7qh8g4002v8jfnhp2ah76c	tutor	docente_1768014994179_rteum@test.com	login	Auth	\N	Usuario docente_1768014994179_rteum@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:16:34.619
cmk7qh97a004e8jfns8x5hrxn	2026-01-10 03:16:35.157	cmk7qh8v5003o8jfny8ny89u3	tutor	docente_1768014994721_5esfs@test.com	login	Auth	\N	Usuario docente_1768014994721_5esfs@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:16:35.158
cmk7qh9ma00578jfn99xyrry7	2026-01-10 03:16:35.697	cmk7qh9a9004h8jfnv1tfal2x	tutor	docente_1768014995265_wx1em@test.com	login	Auth	\N	Usuario docente_1768014995265_wx1em@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:16:35.698
cmk7qha1600608jfnqfppw6d7	2026-01-10 03:16:36.234	cmk7qh9pd005a8jfnmvn74paa	tutor	docente_1768014995809_jcg7k@test.com	login	Auth	\N	Usuario docente_1768014995809_jcg7k@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:16:36.235
cmk7qhag8006v8jfnzmy4k4lf	2026-01-10 03:16:36.775	cmk7qha4f00658jfni5mbc4kw	tutor	docente_1768014996351_mhnos@test.com	login	Auth	\N	Usuario docente_1768014996351_mhnos@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:16:36.776
cmk7qhavr007s8jfn531zhjz5	2026-01-10 03:16:37.335	cmk7qhaju00728jfn9ufjswps	tutor	docente_1768014996906_d5ktt@test.com	login	Auth	\N	Usuario docente_1768014996906_d5ktt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:16:37.336
cmk7qhbbc008n8jfna6l4f7mh	2026-01-10 03:16:37.895	cmk7qhazc007x8jfnhl305yei	tutor	docente_1768014997463_nqndt@test.com	login	Auth	\N	Usuario docente_1768014997463_nqndt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:16:37.896
cmk7qhbrv009i8jfnktqcqbfa	2026-01-10 03:16:38.491	cmk7qhbfx008s8jfnnok10zdb	tutor	docente_1768014998060_5qpif@test.com	login	Auth	\N	Usuario docente_1768014998060_5qpif@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:16:38.492
cmk7qhc6r00ad8jfnu86nk5w7	2026-01-10 03:16:39.026	cmk7qhbus009n8jfn9f124ene	tutor	docente_1768014998595_zjwzt@test.com	login	Auth	\N	Usuario docente_1768014998595_zjwzt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:16:39.027
cmk7qhcma00b98jfn0ob7gq5o	2026-01-10 03:16:39.586	cmk7qhca600ai8jfnw1cbffik	tutor	docente_1768014999149_nuumn@test.com	login	Auth	\N	Usuario docente_1768014999149_nuumn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:16:39.586
cmk7qhd1000c28jfnqb58z7e2	2026-01-10 03:16:40.115	cmk7qhcp400bc8jfncygi9vgq	tutor	docente_1768014999687_9pz85@test.com	login	Auth	\N	Usuario docente_1768014999687_9pz85@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:16:40.116
cmk7qp8wi00018j30ki6if72h	2026-01-10 03:22:48.018	cmk7qp8mw00008j30udwdcrfp	tutor	tutor_1768015367671_570xe@test.com	login	Auth	\N	Usuario tutor_1768015367671_570xe@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:22:48.019
cmk7qp9an00098j306gdg8irn	2026-01-10 03:22:48.527	cmk7qp91700048j30ftr7ev1z	estudiante	test_1768015368120_q4ny1	login	Auth	\N	Usuario test_1768015368120_q4ny1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:22:48.527
cmk7qp9ps00108j30uyf7e2wo	2026-01-10 03:22:49.071	cmk7qp9dn000a8j30kf2voosu	tutor	docente_1768015368634_hrwdf@test.com	login	Auth	\N	Usuario docente_1768015368634_hrwdf@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:22:49.072
cmk7qpa1h00168j300aob3zhz	2026-01-10 03:22:49.492	cmk7qp9sk00158j30wqapfasw	tutor	docente_1768015369171_zk6qq@test.com	login	Auth	\N	Usuario docente_1768015369171_zk6qq@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:22:49.493
cmk7qpahu00208j30yvru7zdc	2026-01-10 03:22:50.082	cmk7qpa86001z8j30vz3c71hh	tutor	docente_1768015369733_tx12a@test.com	login	Auth	\N	Usuario docente_1768015369733_tx12a@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:22:50.082
cmk7qpavu002r8j30enbkiw8x	2026-01-10 03:22:50.585	cmk7qpakm00218j30vwdty033	tutor	docente_1768015370181_1i7ee@test.com	login	Auth	\N	Usuario docente_1768015370181_1i7ee@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:22:50.586
cmk7qpb9r003m8j30tsgb3qc2	2026-01-10 03:22:51.087	cmk7qpayk002w8j30n5ybkaba	tutor	docente_1768015370684_rh66w@test.com	login	Auth	\N	Usuario docente_1768015370684_rh66w@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:22:51.088
cmk7qpbnu004h8j30h8x4h8wu	2026-01-10 03:22:51.593	cmk7qpbcj003r8j3024imob47	tutor	docente_1768015371186_gbom9@test.com	login	Auth	\N	Usuario docente_1768015371186_gbom9@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:22:51.594
cmk7qpc2n005a8j302410gbnb	2026-01-10 03:22:52.126	cmk7qpbqt004k8j30m6uusuu2	tutor	docente_1768015371700_lx4vc@test.com	login	Auth	\N	Usuario docente_1768015371700_lx4vc@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:22:52.127
cmk7qpci500658j30i5qib6sk	2026-01-10 03:22:52.685	cmk7qpc6c005f8j30hcjktqrm	tutor	docente_1768015372259_i9hg4@test.com	login	Auth	\N	Usuario docente_1768015372259_i9hg4@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:22:52.685
cmk7qpcx100788j30bk135wtu	2026-01-10 03:22:53.221	cmk7qpclg006i8j30uryqw1oe	tutor	docente_1768015372803_5mpoe@test.com	login	Auth	\N	Usuario docente_1768015372803_5mpoe@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:22:53.222
cmk7qpdbf00858j30jageqzmb	2026-01-10 03:22:53.739	cmk7qpd05007f8j30j54xue4p	tutor	docente_1768015373332_o0x45@test.com	login	Auth	\N	Usuario docente_1768015373332_o0x45@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:22:53.74
cmk7qpdpl00928j30ljgcffpw	2026-01-10 03:22:54.249	cmk7qpdek008c8j30i6nd5qpb	tutor	docente_1768015373852_ziww5@test.com	login	Auth	\N	Usuario docente_1768015373852_ziww5@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:22:54.249
cmk7qpe4i009x8j30erna9hd8	2026-01-10 03:22:54.786	cmk7qpdsg00978j30enntkwk2	tutor	docente_1768015374351_5t3mq@test.com	login	Auth	\N	Usuario docente_1768015374351_5t3mq@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:22:54.787
cmk7qpejj00at8j300l1guq5s	2026-01-10 03:22:55.326	cmk7qpe7900a28j30xc26tyvu	tutor	docente_1768015374884_tlpa3@test.com	login	Auth	\N	Usuario docente_1768015374884_tlpa3@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:22:55.327
cmk7qpexq00bq8j30tujgimsm	2026-01-10 03:22:55.838	cmk7qpemc00b08j30nm3tm3d9	tutor	docente_1768015375427_9801w@test.com	login	Auth	\N	Usuario docente_1768015375427_9801w@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:22:55.839
cmk7qpfci00cp8j30emett5wu	2026-01-10 03:22:56.37	cmk7qpf0m00bz8j30gkv2l8nv	tutor	docente_1768015375942_hm188@test.com	login	Auth	\N	Usuario docente_1768015375942_hm188@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:22:56.371
cmk7quurn00018jw5gdincd8i	2026-01-10 03:27:09.634	cmk7quui400008jw5vc133adp	tutor	tutor_1768015629291_r46ex@test.com	login	Auth	\N	Usuario tutor_1768015629291_r46ex@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:27:09.635
cmk7quv5j00098jw512iok0lr	2026-01-10 03:27:10.134	cmk7quuwc00048jw5voryllwa	estudiante	test_1768015629732_vyyfy	login	Auth	\N	Usuario test_1768015629732_vyyfy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:27:10.135
cmk7quvi0000b8jw54ibc1vtl	2026-01-10 03:27:10.583	cmk7quv8g000a8jw5v0oq4qly	tutor	docente_1768015630239_fd6na@test.com	login	Auth	\N	Usuario docente_1768015630239_fd6na@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:27:10.584
cmk7quvvz00128jw57ec98lwz	2026-01-10 03:27:11.086	cmk7quvkj000c8jw5t0001tg3	tutor	docente_1768015630674_a59ni@test.com	login	Auth	\N	Usuario docente_1768015630674_a59ni@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:27:11.087
cmk7quwc500218jw5ff0s1jen	2026-01-10 03:27:11.668	cmk7quw3000208jw5xr1nysr5	tutor	docente_1768015631339_z2619@test.com	login	Auth	\N	Usuario docente_1768015631339_z2619@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:27:11.669
cmk7quwq0002s8jw56e4chu9l	2026-01-10 03:27:12.168	cmk7quweq00228jw5l9sevmue	tutor	docente_1768015631762_k3zrm@test.com	login	Auth	\N	Usuario docente_1768015631762_k3zrm@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:27:12.168
cmk7qux46003l8jw5h4hpg2tl	2026-01-10 03:27:12.678	cmk7quwsx002v8jw57r9dlo8o	tutor	docente_1768015632272_tr3vu@test.com	login	Auth	\N	Usuario docente_1768015632272_tr3vu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:27:12.679
cmk7quxir004g8jw5c9j45tvd	2026-01-10 03:27:13.203	cmk7qux6x003q8jw5ttg8y2uf	tutor	docente_1768015632777_y4d4s@test.com	login	Auth	\N	Usuario docente_1768015632777_y4d4s@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:27:13.203
cmk7quxv1004m8jw562b9xklf	2026-01-10 03:27:13.645	cmk7quxm6004l8jw5r4uu12z1	tutor	tutor_1768015633325_5qn5t@test.com	login	Auth	\N	Usuario tutor_1768015633325_5qn5t@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:27:13.646
cmk7quy6g004o8jw5mcevontk	2026-01-10 03:27:14.056	cmk7quxxg004n8jw5tdl1j12d	tutor	docente_1768015633732_ztsqu@test.com	login	Auth	\N	Usuario docente_1768015633732_ztsqu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:27:14.056
cmk7quyk4005f8jw51d10rumt	2026-01-10 03:27:14.548	cmk7quy8w004p8jw5jx6vjp4l	tutor	docente_1768015634143_y7vxw@test.com	login	Auth	\N	Usuario docente_1768015634143_y7vxw@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:27:14.549
cmk7quyy1006a8jw500a6atfu	2026-01-10 03:27:15.049	cmk7quymv005k8jw5pw3qjq9i	tutor	docente_1768015634646_g2dda@test.com	login	Auth	\N	Usuario docente_1768015634646_g2dda@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:27:15.05
cmk7quzbs00758jw5i172dmiv	2026-01-10 03:27:15.544	cmk7quz0m006f8jw5jb0tno5v	tutor	docente_1768015635142_ri56b@test.com	login	Auth	\N	Usuario docente_1768015635142_ri56b@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:27:15.545
cmk7quznl00798jw5lwca8fsi	2026-01-10 03:27:15.968	cmk7quzep00788jw5jxcyhjhe	tutor	tutor_1768015635649_bbeeg@test.com	login	Auth	\N	Usuario tutor_1768015635649_bbeeg@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:27:15.969
cmk7qv00j007h8jw5m6g6nosi	2026-01-10 03:27:16.435	cmk7quzrk007c8jw5dvglhmcg	estudiante	test_1768015636049_9zavp	login	Auth	\N	Usuario test_1768015636049_9zavp (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:27:16.436
cmk7qv0c3007j8jw5u2rd7ldp	2026-01-10 03:27:16.851	cmk7qv02z007i8jw5ew65msc5	tutor	docente_1768015636522_agcol@test.com	login	Auth	\N	Usuario docente_1768015636522_agcol@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:27:16.852
cmk7qv0qr008a8jw53ruy68p3	2026-01-10 03:27:17.378	cmk7qv0fg007k8jw5skcjpf4f	tutor	docente_1768015636971_rant5@test.com	login	Auth	\N	Usuario docente_1768015636971_rant5@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:27:17.379
cmk7qv17600998jw5x8rgivhp	2026-01-10 03:27:17.969	cmk7qv0y200988jw51nntgcn3	tutor	docente_1768015637642_2uuai@test.com	login	Auth	\N	Usuario docente_1768015637642_2uuai@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 03:27:17.97
cmk7qv1ku00a08jw5cgxkfgs4	2026-01-10 03:27:18.462	cmk7qv19p009a8jw5ci5kfz8g	tutor	docente_1768015638061_mqc2h@test.com	login	Auth	\N	Usuario docente_1768015638061_mqc2h@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 03:27:18.463
cmk7qv1yl00at8jw5j92cf8o8	2026-01-10 03:27:18.956	cmk7qv1nj00a38jw5vqu7z63q	tutor	docente_1768015638559_oaim8@test.com	login	Auth	\N	Usuario docente_1768015638559_oaim8@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 03:27:18.957
cmk7qv2ch00bo8jw5noejptcd	2026-01-10 03:27:19.457	cmk7qv21c00ay8jw5rcmmz07e	tutor	docente_1768015639055_aa60k@test.com	login	Auth	\N	Usuario docente_1768015639055_aa60k@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.21	\N	\N	2026-01-10 03:27:19.458
cmk7qv2oi00bu8jw55zqd7p9v	2026-01-10 03:27:19.89	cmk7qv2fo00bt8jw5i6582vwc	tutor	tutor_1768015639572_v62uu@test.com	login	Auth	\N	Usuario tutor_1768015639572_v62uu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.22	\N	\N	2026-01-10 03:27:19.891
cmk7qv2zo00bw8jw5ki89r0ym	2026-01-10 03:27:20.292	cmk7qv2qu00bv8jw5rn6rbr0f	tutor	docente_1768015639973_cetx2@test.com	login	Auth	\N	Usuario docente_1768015639973_cetx2@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.23	\N	\N	2026-01-10 03:27:20.292
cmk7qv3d100cn8jw5r0z6ybtf	2026-01-10 03:27:20.773	cmk7qv32000bx8jw5c4df9pbq	tutor	docente_1768015640375_ya5ph@test.com	login	Auth	\N	Usuario docente_1768015640375_ya5ph@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.24	\N	\N	2026-01-10 03:27:20.774
cmk7qv3qt00di8jw57syp87qt	2026-01-10 03:27:21.269	cmk7qv3fp00cs8jw5xarnqa8s	tutor	docente_1768015640868_ebvo6@test.com	login	Auth	\N	Usuario docente_1768015640868_ebvo6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.25	\N	\N	2026-01-10 03:27:21.27
cmk7qv44m00ed8jw5abaz2arw	2026-01-10 03:27:21.766	cmk7qv3tf00dn8jw5qyv6w91k	tutor	docente_1768015641363_yi7op@test.com	login	Auth	\N	Usuario docente_1768015641363_yi7op@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.26	\N	\N	2026-01-10 03:27:21.767
cmk7qv4ii00f68jw58sjawuj8	2026-01-10 03:27:22.266	cmk7qv47b00eg8jw5z5e2s30i	tutor	docente_1768015641862_p1h6p@test.com	login	Auth	\N	Usuario docente_1768015641862_p1h6p@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.27	\N	\N	2026-01-10 03:27:22.266
cmk7qv4wi00g18jw5meo2omwe	2026-01-10 03:27:22.769	cmk7qv4lg00fb8jw58614z1o8	tutor	docente_1768015642371_2ev6n@test.com	login	Auth	\N	Usuario docente_1768015642371_2ev6n@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.28	\N	\N	2026-01-10 03:27:22.77
cmk7qv5at00gy8jw5r3yg2gh5	2026-01-10 03:27:23.285	cmk7qv4zj00g88jw5fk5c5dbn	tutor	docente_1768015642879_hliv0@test.com	login	Auth	\N	Usuario docente_1768015642879_hliv0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.29	\N	\N	2026-01-10 03:27:23.286
cmk7qv5pg00hx8jw5ln6sppz6	2026-01-10 03:27:23.812	cmk7qv5eb00h78jw5hb8nbjr4	tutor	docente_1768015643411_71wa9@test.com	login	Auth	\N	Usuario docente_1768015643411_71wa9@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.30	\N	\N	2026-01-10 03:27:23.813
cmk7r8jl900018jo2vsxwm32q	2026-01-10 03:37:48.333	cmk7r8jaw00008jo2q1gmxr2l	tutor	tutor_1768016267959_6canc@test.com	login	Auth	\N	Usuario tutor_1768016267959_6canc@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:37:48.334
cmk7r8k0700098jo2kft5j2d7	2026-01-10 03:37:48.871	cmk7r8jq900048jo25tvavqpf	estudiante	test_1768016268443_q25qc	login	Auth	\N	Usuario test_1768016268443_q25qc (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:37:48.871
cmk7r8kf800108jo2w9ltmbnu	2026-01-10 03:37:49.411	cmk7r8k2y000a8jo2lmqhmchh	tutor	docente_1768016268969_plxy7@test.com	login	Auth	\N	Usuario docente_1768016268969_plxy7@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:37:49.412
cmk7r8kr700128jo2t8gxl437	2026-01-10 03:37:49.843	cmk7r8ki400118jo2xaib77e9	tutor	docente_1768016269516_lek9y@test.com	login	Auth	\N	Usuario docente_1768016269516_lek9y@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:37:49.843
cmk7r8l6r001u8jo2azazqifv	2026-01-10 03:37:50.403	cmk7r8kxt001t8jo2x5pfdk69	tutor	docente_1768016270081_a4kau@test.com	login	Auth	\N	Usuario docente_1768016270081_a4kau@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:37:50.404
cmk7r8lky002l8jo2q0jp1zxw	2026-01-10 03:37:50.913	cmk7r8l9e001v8jo289a4d4pn	tutor	docente_1768016270497_75uhu@test.com	login	Auth	\N	Usuario docente_1768016270497_75uhu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:37:50.914
cmk7r8lz5003c8jo2yp009tn0	2026-01-10 03:37:51.425	cmk7r8lno002m8jo2u09jpu74	tutor	docente_1768016271012_gp4ze@test.com	login	Auth	\N	Usuario docente_1768016271012_gp4ze@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:37:51.426
cmk7r8mhb004c8jo2fe4kd2in	2026-01-10 03:37:52.078	cmk7r8m1z003d8jo2bintds3h	tutor	docente_1768016271526_dpaup@test.com	login	Auth	\N	Usuario docente_1768016271526_dpaup@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:37:52.079
cmk7r8n09005e8jo2omccozwj	2026-01-10 03:37:52.761	cmk7r8mkt004d8jo2iosk2ei0	tutor	docente_1768016272204_1srjn@test.com	login	Auth	\N	Usuario docente_1768016272204_1srjn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:37:52.762
cmk7r8nnr006r8jo24itn9p4d	2026-01-10 03:37:53.607	cmk7r8n34005f8jo2c07oo420	tutor	docente_1768016272864_17mjn@test.com	login	Auth	\N	Usuario docente_1768016272864_17mjn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:37:53.608
cmk7r8o6q007x8jo2wtbl8wfa	2026-01-10 03:37:54.289	cmk7r8nr3006s8jo20d31kalc	tutor	docente_1768016273726_oq1ai@test.com	login	Auth	\N	Usuario docente_1768016273726_oq1ai@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:37:54.29
cmk7r8op7008z8jo26a7yow0m	2026-01-10 03:37:54.955	cmk7r8o9k007y8jo2r4aozghz	tutor	docente_1768016274391_uqip4@test.com	login	Auth	\N	Usuario docente_1768016274391_uqip4@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:37:54.956
cmk7r8p7p00a18jo2q92v3pzv	2026-01-10 03:37:55.62	cmk7r8os000908jo2v3f66t1p	tutor	docente_1768016275055_19fyl@test.com	login	Auth	\N	Usuario docente_1768016275055_19fyl@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:37:55.621
cmk7r8pwv00bj8jo2zos8wzvn	2026-01-10 03:37:56.527	cmk7r8pb200a28jo2nnpv5zzy	tutor	docente_1768016275741_rl5uk@test.com	login	Auth	\N	Usuario docente_1768016275741_rl5uk@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:37:56.527
cmk7r8qgt00cz8jo2irjsdf5u	2026-01-10 03:37:57.244	cmk7r8pzz00bk8jo23ue2942d	tutor	docente_1768016276639_r41op@test.com	login	Auth	\N	Usuario docente_1768016276639_r41op@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:37:57.245
cmk7r8qzh00e18jo2fcpokb7y	2026-01-10 03:37:57.916	cmk7r8qjs00d08jo22fexpnk3	tutor	docente_1768016277351_oplxr@test.com	login	Auth	\N	Usuario docente_1768016277351_oplxr@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:37:57.917
cmk7r8rin00f78jo2zc0igxov	2026-01-10 03:37:58.607	cmk7r8r2h00e28jo2a9kmw6lx	tutor	docente_1768016278024_ka8na@test.com	login	Auth	\N	Usuario docente_1768016278024_ka8na@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:37:58.607
cmk7r8t0j00ff8jo2ox40ke4c	2026-01-10 03:38:00.545	cmk7r8sps00fa8jo2dt7o3eu6	estudiante	test_1768016280159_chsar	login	Auth	\N	Usuario test_1768016280159_chsar (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:38:00.547
cmk7r8thg00fn8jo2yviasfme	2026-01-10 03:38:01.156	cmk7r8t6j00fi8jo2ky0kmb7f	estudiante	test_1768016280763_9cxif	login	Auth	\N	Usuario test_1768016280763_9cxif (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:38:01.157
cmk7r8txm00g18jo26hb94pd8	2026-01-10 03:38:01.738	cmk7r8tnk00fq8jo2jh81tdhi	estudiante	test_1768016281375_z3c48	login	Auth	\N	Usuario test_1768016281375_z3c48 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:38:01.738
cmk7r8ucz00gu8jo22dru28x7	2026-01-10 03:38:02.291	cmk7r8u2f00g48jo2xnw5oc4w	estudiante	test_1768016281911_onqyr	login	Auth	\N	Usuario test_1768016281911_onqyr (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:38:02.292
cmk7r8urq00h68jo27ezllojw	2026-01-10 03:38:02.822	cmk7r8uho00gx8jo2hijz5w9t	estudiante	test_1768016282460_c4jqe	login	Auth	\N	Usuario test_1768016282460_c4jqe (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:38:02.823
cmk7r8v6400i88jo2ig8zo2mr	2026-01-10 03:38:03.339	cmk7r8uwc00h98jo23478jhf2	estudiante	test_1768016282987_nklfy	login	Auth	\N	Usuario test_1768016282987_nklfy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:38:03.34
cmk7r8vi300ia8jo28xhep00a	2026-01-10 03:38:03.77	cmk7r8v9200i98jo2yboz2me4	tutor	docente_1768016283445_qno18@test.com	login	Auth	\N	Usuario docente_1768016283445_qno18@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:38:03.771
cmk7r8vv900ii8jo27vsgwo6z	2026-01-10 03:38:04.244	cmk7r8vma00id8jo2f85drcxd	estudiante	test_1768016283921_hurqy	login	Auth	\N	Usuario test_1768016283921_hurqy (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:38:04.245
cmk7r8w8u00iq8jo2psf2uqr9	2026-01-10 03:38:04.734	cmk7r8vzl00il8jo2tuae6ey7	estudiante	test_1768016284401_yf0ac	login	Auth	\N	Usuario test_1768016284401_yf0ac (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:38:04.735
cmk7rhqbw00018jog768gulg1	2026-01-10 03:44:56.971	cmk7rhq2400008jogiga0mucd	tutor	tutor_1768016696619_wi8pi@test.com	login	Auth	\N	Usuario tutor_1768016696619_wi8pi@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:44:56.972
cmk7rhqpx00098jogmpofau04	2026-01-10 03:44:57.476	cmk7rhqgs00048jogczsamepx	estudiante	test_1768016697078_7fe0a	login	Auth	\N	Usuario test_1768016697078_7fe0a (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:44:57.477
cmk7rhr2i000b8jog989dmlci	2026-01-10 03:44:57.929	cmk7rhqt2000a8jogc6azzx3l	tutor	docente_1768016697590_ajd84@test.com	login	Auth	\N	Usuario docente_1768016697590_ajd84@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:44:57.93
cmk7rhrgt000x8jogypy8qrzr	2026-01-10 03:44:58.445	cmk7rhr5d000c8jogs7cdjrwm	tutor	docente_1768016698033_l6f75@test.com	login	Auth	\N	Usuario docente_1768016698033_l6f75@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:44:58.445
cmk7rhsr3004t8jogf3jacnaf	2026-01-10 03:45:00.111	cmk7rhsi0004s8jog1frpx3f6	tutor	tutor_1768016699784_5v1z5@test.com	login	Auth	\N	Usuario tutor_1768016699784_5v1z5@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:45:00.112
cmk7rht4800518jogzqbmvyuc	2026-01-10 03:45:00.583	cmk7rhsv9004w8jogs0obtior	estudiante	test_1768016700195_vzkh5	login	Auth	\N	Usuario test_1768016700195_vzkh5 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:45:00.584
cmk7rhtfg00538jog8w6556ee	2026-01-10 03:45:00.987	cmk7rht6n00528jogadwp9xy9	tutor	docente_1768016700670_oz6ws@test.com	login	Auth	\N	Usuario docente_1768016700670_oz6ws@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:45:00.988
cmk7rmcqf00018jowdiua7wr6	2026-01-10 03:48:32.63	cmk7rmcfi00008jowffwmvxxt	tutor	tutor_1768016912236_k7n30@test.com	login	Auth	\N	Usuario tutor_1768016912236_k7n30@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:48:32.631
cmk7rmdb100098jowuuz0c7e3	2026-01-10 03:48:33.373	cmk7rmd0500048jowb6d4sz3c	estudiante	test_1768016912905_kw90c	login	Auth	\N	Usuario test_1768016912905_kw90c (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:48:33.374
cmk7rmdp3000b8jowhovktl7h	2026-01-10 03:48:33.877	cmk7rmdeu000a8jow2u5htiuu	tutor	docente_1768016913509_440lh@test.com	login	Auth	\N	Usuario docente_1768016913509_440lh@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:48:33.879
cmk7rme5b000x8jow34qhe7ol	2026-01-10 03:48:34.462	cmk7rmdsn000c8jowma9uowqq	tutor	docente_1768016914006_e60wg@test.com	login	Auth	\N	Usuario docente_1768016914006_e60wg@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:48:34.463
cmk7rmena001n8joww6sgpkna	2026-01-10 03:48:35.109	cmk7rmedd001m8jow0jm961af	tutor	docente_1768016914752_5e969@test.com	login	Auth	\N	Usuario docente_1768016914752_5e969@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:48:35.11
cmk7rmf2z002c8jow84rr5wxw	2026-01-10 03:48:35.675	cmk7rmeqb001o8jow4n5bk7ny	tutor	docente_1768016915218_ggzo1@test.com	login	Auth	\N	Usuario docente_1768016915218_ggzo1@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:48:35.676
cmk7rmfih00318jowxufc3ssm	2026-01-10 03:48:36.233	cmk7rmf60002d8jowxsycgc1e	tutor	docente_1768016915783_j4q2s@test.com	login	Auth	\N	Usuario docente_1768016915783_j4q2s@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:48:36.233
cmk7rmfys003v8jowqsumexch	2026-01-10 03:48:36.819	cmk7rmfm800348jow0xcfcvvj	tutor	docente_1768016916366_4o65t@test.com	login	Auth	\N	Usuario docente_1768016916366_4o65t@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:48:36.82
cmk7rmges004k8jowxol14vo2	2026-01-10 03:48:37.396	cmk7rmg20003w8jowv6v4vzpr	tutor	docente_1768016916936_noqdm@test.com	login	Auth	\N	Usuario docente_1768016916936_noqdm@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:48:37.397
cmk7rmgui005g8jowfdf6krjg	2026-01-10 03:48:37.961	cmk7rmghq004l8jowegn6adl5	tutor	docente_1768016917502_kh9ld@test.com	login	Auth	\N	Usuario docente_1768016917502_kh9ld@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:48:37.962
cmk7rmh88005i8jowfcu81ed1	2026-01-10 03:48:38.456	cmk7rmgxv005h8jow1jvqiuo2	tutor	tutor_1768016918082_ba0mo@test.com	login	Auth	\N	Usuario tutor_1768016918082_ba0mo@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:48:38.457
cmk7rmhn5005q8jowqtvonn1i	2026-01-10 03:48:38.992	cmk7rmhcz005l8jowytdksj3s	estudiante	test_1768016918552_thxfe	login	Auth	\N	Usuario test_1768016918552_thxfe (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:48:38.993
cmk7rmi01005s8jow4ou6a1zi	2026-01-10 03:48:39.456	cmk7rmhpu005r8jow0gz1b6n6	tutor	docente_1768016919089_jkmd6@test.com	login	Auth	\N	Usuario docente_1768016919089_jkmd6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:48:39.457
cmk7rmif9006h8jow147yo1gl	2026-01-10 03:48:40.004	cmk7rmi2q005t8jow5as4u7v6	tutor	docente_1768016919554_rzl79@test.com	login	Auth	\N	Usuario docente_1768016919554_rzl79@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:48:40.005
cmk7rmit0006j8joweg55qtt5	2026-01-10 03:48:40.499	cmk7rmiix006i8jow0b3veglk	tutor	docente_1768016920132_8ek5z@test.com	login	Auth	\N	Usuario docente_1768016920132_8ek5z@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:48:40.5
cmk7rmj8s00788jow2suv1d97	2026-01-10 03:48:41.068	cmk7rmiwb006k8jows0pc93d0	tutor	docente_1768016920618_mt53u@test.com	login	Auth	\N	Usuario docente_1768016920618_mt53u@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:48:41.069
cmk7rmjoo007x8jow27lgct6a	2026-01-10 03:48:41.64	cmk7rmjc500798jowdj8sp8gc	tutor	docente_1768016921188_403ie@test.com	login	Auth	\N	Usuario docente_1768016921188_403ie@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:48:41.641
cmk7rmk41008m8jowik5n3fhy	2026-01-10 03:48:42.193	cmk7rmjrl007y8jowyec39nxl	tutor	docente_1768016921745_9spyu@test.com	login	Auth	\N	Usuario docente_1768016921745_9spyu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 03:48:42.194
cmk7rmkk9009i8jowvghevv2s	2026-01-10 03:48:42.777	cmk7rmk7l008n8jow3w83qali	tutor	docente_1768016922320_40bmu@test.com	login	Auth	\N	Usuario docente_1768016922320_40bmu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 03:48:42.778
cmk7rml0r00a78jow1aqvmi8u	2026-01-10 03:48:43.371	cmk7rmknw009j8jow4xbiivkj	tutor	docente_1768016922907_0l7ik@test.com	login	Auth	\N	Usuario docente_1768016922907_0l7ik@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 03:48:43.372
cmk7rw3bv00018jl1n4jnwl35	2026-01-10 03:56:07.002	cmk7rw30v00008jl1o8os4mf5	tutor	tutor_1768017366606_jwj2j@test.com	login	Auth	\N	Usuario tutor_1768017366606_jwj2j@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 03:56:07.004
cmk7rw3rr00098jl1xnskd5be	2026-01-10 03:56:07.575	cmk7rw3hl00048jl1dai7k72w	estudiante	test_1768017367134_0e7av	login	Auth	\N	Usuario test_1768017367134_0e7av (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 03:56:07.575
cmk7rw456000b8jl1p08gxdgn	2026-01-10 03:56:08.058	cmk7rw3v4000a8jl1qlgdxg9y	tutor	docente_1768017367696_4c8gn@test.com	login	Auth	\N	Usuario docente_1768017367696_4c8gn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 03:56:08.059
cmk7rw4ko000x8jl151rkea6u	2026-01-10 03:56:08.616	cmk7rw482000c8jl1lymcq5iy	tutor	docente_1768017368161_5v8hl@test.com	login	Auth	\N	Usuario docente_1768017368161_5v8hl@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 03:56:08.617
cmk7rw52c001n8jl11ye8jrg6	2026-01-10 03:56:09.252	cmk7rw4sd001m8jl1h3emtgs2	tutor	docente_1768017368892_kkm34@test.com	login	Auth	\N	Usuario docente_1768017368892_kkm34@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 03:56:09.253
cmk7rw5ie002c8jl12q9fcfn7	2026-01-10 03:56:09.829	cmk7rw55l001o8jl1ktr0tylm	tutor	docente_1768017369368_aokpm@test.com	login	Auth	\N	Usuario docente_1768017369368_aokpm@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 03:56:09.83
cmk7rw60k00338jl100pngnez	2026-01-10 03:56:10.484	cmk7rw5mu002f8jl1ew4rnuaz	tutor	docente_1768017369989_tg92z@test.com	login	Auth	\N	Usuario docente_1768017369989_tg92z@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 03:56:10.485
cmk7rw6gz003x8jl1ijo6j8ij	2026-01-10 03:56:11.075	cmk7rw63r00368jl1osuc17zl	tutor	docente_1768017370598_q13lv@test.com	login	Auth	\N	Usuario docente_1768017370598_q13lv@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 03:56:11.075
cmk7rw6wu004q8jl18jnoorlg	2026-01-10 03:56:11.645	cmk7rw6ka00428jl1dvlmjbku	tutor	docente_1768017371194_8jmfd@test.com	login	Auth	\N	Usuario docente_1768017371194_8jmfd@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 03:56:11.646
cmk7rw7dg005q8jl1in3nxln0	2026-01-10 03:56:12.244	cmk7rw70p004v8jl1q3xijs9g	tutor	docente_1768017371785_qay63@test.com	login	Auth	\N	Usuario docente_1768017371785_qay63@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 03:56:12.244
cmk7rw7qu005u8jl1nnd2wtle	2026-01-10 03:56:12.725	cmk7rw7h2005t8jl1prcj7v8n	tutor	tutor_1768017372374_wiutq@test.com	login	Auth	\N	Usuario tutor_1768017372374_wiutq@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 03:56:12.726
cmk7rw85w00628jl12rmzafzt	2026-01-10 03:56:13.268	cmk7rw7vx005x8jl1skhzfxki	estudiante	test_1768017372835_2d7z1	login	Auth	\N	Usuario test_1768017372835_2d7z1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 03:56:13.269
cmk7rw8ic00648jl1ov2bt1h1	2026-01-10 03:56:13.716	cmk7rw88j00638jl12q65hn34	tutor	docente_1768017373362_56ase@test.com	login	Auth	\N	Usuario docente_1768017373362_56ase@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 03:56:13.717
cmk7rw8xp006t8jl191k4jsne	2026-01-10 03:56:14.269	cmk7rw8l700658jl1cfbeccu1	tutor	docente_1768017373819_udq11@test.com	login	Auth	\N	Usuario docente_1768017373819_udq11@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 03:56:14.27
cmk7rw9a5006x8jl13on8ht5a	2026-01-10 03:56:14.717	cmk7rw901006w8jl18jo9owra	tutor	docente_1768017374352_0pmw7@test.com	login	Auth	\N	Usuario docente_1768017374352_0pmw7@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 03:56:14.717
cmk7rw9p6007m8jl10vi01w4y	2026-01-10 03:56:15.257	cmk7rw9cw006y8jl103w7n3xl	tutor	docente_1768017374815_eycid@test.com	login	Auth	\N	Usuario docente_1768017374815_eycid@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 03:56:15.258
cmk7rwa4l008d8jl17gi18nf5	2026-01-10 03:56:15.813	cmk7rw9sa007p8jl1r657guwd	tutor	docente_1768017375369_mpw7b@test.com	login	Auth	\N	Usuario docente_1768017375369_mpw7b@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 03:56:15.814
cmk7rwakw00928jl1dl2zpwcp	2026-01-10 03:56:16.4	cmk7rwa8p008e8jl135s01kyk	tutor	docente_1768017375960_0oswf@test.com	login	Auth	\N	Usuario docente_1768017375960_0oswf@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 03:56:16.401
cmk7rwb0u00a08jl14aeoxy2g	2026-01-10 03:56:16.974	cmk7rwaob00958jl12a1gbmc3	tutor	docente_1768017376523_ow3wn@test.com	login	Auth	\N	Usuario docente_1768017376523_ow3wn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 03:56:16.974
cmk7rwbgr00at8jl1vezvki01	2026-01-10 03:56:17.547	cmk7rwb4j00a58jl1p1k78wgp	tutor	docente_1768017377107_dvcba@test.com	login	Auth	\N	Usuario docente_1768017377107_dvcba@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 03:56:17.548
cmk7s2tgn00018jhrrg1xjwed	2026-01-10 04:01:20.805	cmk7s2t5v00008jhr4shs5kea	tutor	tutor_1768017680417_f6yrx@test.com	login	Auth	\N	Usuario tutor_1768017680417_f6yrx@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 04:01:20.807
cmk7s2twn00098jhrp9opm5i5	2026-01-10 04:01:21.382	cmk7s2tlx00048jhr610tn3p9	estudiante	test_1768017680925_man5e	login	Auth	\N	Usuario test_1768017680925_man5e (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 04:01:21.383
cmk7s2uad000b8jhr2t763age	2026-01-10 04:01:21.876	cmk7s2u0g000a8jhreprqhvyq	tutor	docente_1768017681520_br07j@test.com	login	Auth	\N	Usuario docente_1768017681520_br07j@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 04:01:21.877
cmk7s2upv000x8jhrn0n8mi0h	2026-01-10 04:01:22.435	cmk7s2udc000c8jhrkcr0cmrn	tutor	docente_1768017681983_xq7hz@test.com	login	Auth	\N	Usuario docente_1768017681983_xq7hz@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 04:01:22.436
cmk7s2v70001n8jhrwc2xua20	2026-01-10 04:01:23.051	cmk7s2uxb001m8jhrs2za6xij	tutor	docente_1768017682702_yy422@test.com	login	Auth	\N	Usuario docente_1768017682702_yy422@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 04:01:23.052
cmk7s2vmh002c8jhrtaeb5mpb	2026-01-10 04:01:23.609	cmk7s2v9y001o8jhrtrc47wcz	tutor	docente_1768017683157_l7u7c@test.com	login	Auth	\N	Usuario docente_1768017683157_l7u7c@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 04:01:23.609
cmk7s2w2800338jhrk842mvlx	2026-01-10 04:01:24.175	cmk7s2vpp002f8jhrvm75rtga	tutor	docente_1768017683725_hznff@test.com	login	Auth	\N	Usuario docente_1768017683725_hznff@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 04:01:24.176
cmk7s2wj3003x8jhrfpkfby13	2026-01-10 04:01:24.782	cmk7s2w5u00368jhr5cv4c86z	tutor	docente_1768017684306_nn54j@test.com	login	Auth	\N	Usuario docente_1768017684306_nn54j@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 04:01:24.783
cmk7s2wzc004q8jhres9aho2d	2026-01-10 04:01:25.368	cmk7s2wmq00428jhr3uo9e3s9	tutor	docente_1768017684913_hop3a@test.com	login	Auth	\N	Usuario docente_1768017684913_hop3a@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 04:01:25.369
cmk7s2xfj005q8jhrf4im3wxh	2026-01-10 04:01:25.951	cmk7s2x2t004v8jhrmhy9lq41	tutor	docente_1768017685493_qwggx@test.com	login	Auth	\N	Usuario docente_1768017685493_qwggx@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 04:01:25.952
cmk7s2xtm005u8jhrjevw8s9v	2026-01-10 04:01:26.458	cmk7s2xje005t8jhriofb9ll8	tutor	tutor_1768017686089_z4eeg@test.com	login	Auth	\N	Usuario tutor_1768017686089_z4eeg@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 04:01:26.459
cmk7s2y8p00628jhrfb5v1pab	2026-01-10 04:01:27	cmk7s2xye005x8jhr9x9jgxjd	estudiante	test_1768017686559_4ytb4	login	Auth	\N	Usuario test_1768017686559_4ytb4 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 04:01:27.001
cmk7s2yll00648jhruephl4lw	2026-01-10 04:01:27.465	cmk7s2ybo00638jhr6uka37b1	tutor	docente_1768017687107_06cki@test.com	login	Auth	\N	Usuario docente_1768017687107_06cki@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 04:01:27.466
cmk7s2z1c006t8jhrrls0rhu0	2026-01-10 04:01:28.031	cmk7s2yoa00658jhrhzb7at1u	tutor	docente_1768017687561_coyl0@test.com	login	Auth	\N	Usuario docente_1768017687561_coyl0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 04:01:28.033
cmk7s2zg2006x8jhrx7yg79dg	2026-01-10 04:01:28.561	cmk7s2z66006w8jhr7t98vadt	tutor	docente_1768017688205_1360g@test.com	login	Auth	\N	Usuario docente_1768017688205_1360g@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 04:01:28.563
cmk7s2zwp007m8jhr9r7fufo8	2026-01-10 04:01:29.161	cmk7s2ziu006y8jhrrmhp8jrj	tutor	docente_1768017688661_otuve@test.com	login	Auth	\N	Usuario docente_1768017688661_otuve@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 04:01:29.162
cmk7s30cr008d8jhrkt5ucwvg	2026-01-10 04:01:29.739	cmk7s3008007p8jhricn1asxk	tutor	docente_1768017689288_uazyk@test.com	login	Auth	\N	Usuario docente_1768017689288_uazyk@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 04:01:29.74
cmk7s30s600928jhrjvjtr0i8	2026-01-10 04:01:30.293	cmk7s30fl008e8jhr6nk36gnr	tutor	docente_1768017689840_9fbq4@test.com	login	Auth	\N	Usuario docente_1768017689840_9fbq4@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 04:01:30.294
cmk7s318a00a08jhr5mvfodw3	2026-01-10 04:01:30.873	cmk7s30vm00958jhrcwy5nlhy	tutor	docente_1768017690418_bn5xt@test.com	login	Auth	\N	Usuario docente_1768017690418_bn5xt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 04:01:30.874
cmk7s31or00at8jhrpkbs1cf3	2026-01-10 04:01:31.465	cmk7s31c400a58jhrzspjur0m	tutor	docente_1768017691012_x1ff8@test.com	login	Auth	\N	Usuario docente_1768017691012_x1ff8@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 04:01:31.467
cmk7tfj0c00078jjyn8c2menl	2026-01-10 04:39:13.404	cmk7tfiqn00028jjyly9rm5i1	estudiante	test_1768019952982_x2qm8	login	Auth	\N	Usuario test_1768019952982_x2qm8 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 04:39:13.405
cmk7tfjd7000f8jjyav6nq0j3	2026-01-10 04:39:13.867	cmk7tfj2v00088jjyeeq3b7uc	tutor	tutor_1768019953494_w2fgp@test.com	login	Auth	\N	Usuario tutor_1768019953494_w2fgp@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 04:39:13.868
cmk7tfjvu00138jjy53htrztj	2026-01-10 04:39:14.537	cmk7tfjft000g8jjywagirluu	tutor	docente_1768019953961_uf3q0@test.com	login	Auth	\N	Usuario docente_1768019953961_uf3q0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 04:39:14.538
cmk7tfkcv001r8jjyh9dki5sz	2026-01-10 04:39:15.15	cmk7tfk3d001c8jjyyfsi8h47	tutor	admin_1768019954752_bvs1h@test.com	login	Auth	\N	Usuario admin_1768019954752_bvs1h@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 04:39:15.151
cmk7tfkui002f8jjyv5nz66ma	2026-01-10 04:39:15.786	cmk7tfkfu001s8jjyxh7r93rx	tutor	docente_1768019955257_gru2k@test.com	login	Auth	\N	Usuario docente_1768019955257_gru2k@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 04:39:15.786
cmk7tflby00338jjy8pctyieo	2026-01-10 04:39:16.413	cmk7tfkx2002g8jjyc71u2omt	tutor	docente_1768019955878_rsq6s@test.com	login	Auth	\N	Usuario docente_1768019955878_rsq6s@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 04:39:16.414
cmk7tflsx003r8jjyht8ofqvb	2026-01-10 04:39:17.025	cmk7tflek00348jjy9y8lb7wc	tutor	docente_1768019956507_7ywnh@test.com	login	Auth	\N	Usuario docente_1768019956507_7ywnh@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 04:39:17.025
cmk7tfmar004f8jjyogbvlqmu	2026-01-10 04:39:17.667	cmk7tflvm003s8jjyw3n379ni	tutor	docente_1768019957122_94qr2@test.com	login	Auth	\N	Usuario docente_1768019957122_94qr2@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 04:39:17.668
cmk7tfmrz00538jjyl29wp3c0	2026-01-10 04:39:18.287	cmk7tfmdc004g8jjy506kzrfu	tutor	docente_1768019957760_h7a3l@test.com	login	Auth	\N	Usuario docente_1768019957760_h7a3l@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 04:39:18.288
cmk7tfn91005r8jjyvx2mqbpt	2026-01-10 04:39:18.901	cmk7tfmug00548jjyvnylwdpw	tutor	docente_1768019958376_og194@test.com	login	Auth	\N	Usuario docente_1768019958376_og194@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 04:39:18.902
cmk7tfnqa006f8jjyld3iebot	2026-01-10 04:39:19.522	cmk7tfnbj005s8jjyqm35a05z	tutor	docente_1768019958990_xq1qa@test.com	login	Auth	\N	Usuario docente_1768019958990_xq1qa@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 04:39:19.523
cmk7tfo7500738jjyy5jiok18	2026-01-10 04:39:20.128	cmk7tfnsm006g8jjyidzymhdj	tutor	docente_1768019959606_u8xkh@test.com	login	Auth	\N	Usuario docente_1768019959606_u8xkh@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 04:39:20.129
cmk7tfooq007r8jjyippp4bpo	2026-01-10 04:39:20.762	cmk7tfo9l00748jjyiauua71t	tutor	docente_1768019960217_fq4ic@test.com	login	Auth	\N	Usuario docente_1768019960217_fq4ic@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 04:39:20.762
cmk7tfp5d008f8jjymbss1jf6	2026-01-10 04:39:21.361	cmk7tfor7007s8jjyzwbff8rx	tutor	docente_1768019960851_odeto@test.com	login	Auth	\N	Usuario docente_1768019960851_odeto@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 04:39:21.362
cmk7tfpmg00938jjyk28zhjn2	2026-01-10 04:39:21.976	cmk7tfp7x008g8jjymmyi26tm	tutor	docente_1768019961453_9wjeh@test.com	login	Auth	\N	Usuario docente_1768019961453_9wjeh@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 04:39:21.977
cmk7tfq3d009r8jjydzg8dexy	2026-01-10 04:39:22.584	cmk7tfpoz00948jjyqd9i9bmj	tutor	docente_1768019962066_z4htl@test.com	login	Auth	\N	Usuario docente_1768019962066_z4htl@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 04:39:22.585
cmk7tfql600af8jjybzvikbz4	2026-01-10 04:39:23.226	cmk7tfq6b009s8jjyfit0lw7e	tutor	docente_1768019962691_i5k30@test.com	login	Auth	\N	Usuario docente_1768019962691_i5k30@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 04:39:23.227
cmk7tfr2p00b38jjy5fm7xaz1	2026-01-10 04:39:23.857	cmk7tfqny00ag8jjyyqg8n0dd	tutor	docente_1768019963326_ma2ev@test.com	login	Auth	\N	Usuario docente_1768019963326_ma2ev@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 04:39:23.857
cmk7tfrju00br8jjydqj956e1	2026-01-10 04:39:24.474	cmk7tfr5600b48jjyt1ea9syj	tutor	docente_1768019963945_hjwaf@test.com	login	Auth	\N	Usuario docente_1768019963945_hjwaf@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 04:39:24.475
cmk7tfs4m00cm8jjyori0ugz9	2026-01-10 04:39:25.221	cmk7tfrmd00bs8jjyxu6n3j99	tutor	docente_1768019964564_itcpk@test.com	login	Auth	\N	Usuario docente_1768019964564_itcpk@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 04:39:25.222
cmk7thnml00078je7gseci24g	2026-01-10 04:40:52.7	cmk7thndl00028je7a1zf6fb0	estudiante	test_1768020052315_j1g0f	login	Auth	\N	Usuario test_1768020052315_j1g0f (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 04:40:52.701
cmk7tho01000f8je7o249kj5k	2026-01-10 04:40:53.185	cmk7thnpj00088je71x2c61bu	tutor	tutor_1768020052807_hkhdr@test.com	login	Auth	\N	Usuario tutor_1768020052807_hkhdr@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 04:40:53.186
cmk7thogd00138je7oeu4o1l9	2026-01-10 04:40:53.773	cmk7tho2e000g8je7452o1qph	tutor	docente_1768020053270_aphxk@test.com	login	Auth	\N	Usuario docente_1768020053270_aphxk@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 04:40:53.774
cmk7thoxg001r8je75v5k3219	2026-01-10 04:40:54.388	cmk7thoom001c8je71v87p21f	tutor	admin_1768020054012_drhoy@test.com	login	Auth	\N	Usuario admin_1768020054012_drhoy@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 04:40:54.388
cmk7thpe1002f8je7z1wcss33	2026-01-10 04:40:54.985	cmk7thp09001s8je74fnm0r1x	tutor	docente_1768020054488_fi7iv@test.com	login	Auth	\N	Usuario docente_1768020054488_fi7iv@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 04:40:54.985
cmk7thpug00338je7uk9rl43y	2026-01-10 04:40:55.576	cmk7thpgo002g8je7duvs8beb	tutor	docente_1768020055079_xbl4p@test.com	login	Auth	\N	Usuario docente_1768020055079_xbl4p@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 04:40:55.577
cmk7thqaw003r8je7aafkxs70	2026-01-10 04:40:56.168	cmk7thpx200348je7h2gd0znu	tutor	docente_1768020055669_4zj2j@test.com	login	Auth	\N	Usuario docente_1768020055669_4zj2j@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 04:40:56.169
cmk7thqrh004f8je7aloq05yb	2026-01-10 04:40:56.764	cmk7thqdg003s8je71pip8bqz	tutor	docente_1768020056260_sclny@test.com	login	Auth	\N	Usuario docente_1768020056260_sclny@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 04:40:56.765
cmk7thr7u00538je768kbut0w	2026-01-10 04:40:57.354	cmk7thqtz004g8je78xqo2wnh	tutor	docente_1768020056854_1d18h@test.com	login	Auth	\N	Usuario docente_1768020056854_1d18h@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 04:40:57.355
cmk7thro3005r8je7f93rvaj2	2026-01-10 04:40:57.939	cmk7thrac00548je7e3coko5o	tutor	docente_1768020057444_jsbou@test.com	login	Auth	\N	Usuario docente_1768020057444_jsbou@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 04:40:57.94
cmk7ths4s006f8je71jml2yra	2026-01-10 04:40:58.54	cmk7thrqr005s8je7nqdxgytm	tutor	docente_1768020058035_0q4mp@test.com	login	Auth	\N	Usuario docente_1768020058035_0q4mp@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 04:40:58.541
cmk7thskx00738je7f8up4154	2026-01-10 04:40:59.12	cmk7ths7a006g8je7uopwyb12	tutor	docente_1768020058629_ebxri@test.com	login	Auth	\N	Usuario docente_1768020058629_ebxri@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 04:40:59.121
cmk7tht1d007r8je7spd2897g	2026-01-10 04:40:59.713	cmk7thsnd00748je7bwomibmi	tutor	docente_1768020059208_bfhc7@test.com	login	Auth	\N	Usuario docente_1768020059208_bfhc7@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 04:40:59.714
cmk7thti9008f8je7szw40l0d	2026-01-10 04:41:00.321	cmk7tht46007s8je71wpxil8k	tutor	docente_1768020059813_sax1b@test.com	login	Auth	\N	Usuario docente_1768020059813_sax1b@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 04:41:00.322
cmk7thtyp00938je775pv8pch	2026-01-10 04:41:00.913	cmk7thtkx008g8je7rdot6vp5	tutor	docente_1768020060416_f90q2@test.com	login	Auth	\N	Usuario docente_1768020060416_f90q2@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 04:41:00.914
cmk7thuew009r8je7f3s2uwcw	2026-01-10 04:41:01.495	cmk7thu1c00948je7tlzscecy	tutor	docente_1768020061008_m8im1@test.com	login	Auth	\N	Usuario docente_1768020061008_m8im1@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 04:41:01.496
cmk7thuv800af8je7gltd2gtt	2026-01-10 04:41:02.084	cmk7thuhg009s8je7jqx8m2xg	tutor	docente_1768020061588_alpif@test.com	login	Auth	\N	Usuario docente_1768020061588_alpif@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 04:41:02.085
cmk7thvbu00b38je78qlitu6f	2026-01-10 04:41:02.681	cmk7thuxz00ag8je7uujk7r8h	tutor	docente_1768020062183_bi7pq@test.com	login	Auth	\N	Usuario docente_1768020062183_bi7pq@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 04:41:02.682
cmk7thvsj00br8je7uq36y9om	2026-01-10 04:41:03.283	cmk7thvej00b48je72gae34n4	tutor	docente_1768020062778_uy9oo@test.com	login	Auth	\N	Usuario docente_1768020062778_uy9oo@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 04:41:03.284
cmk7thwc700cm8je74046j8a9	2026-01-10 04:41:03.991	cmk7thvv400bs8je7z21bmvzg	tutor	docente_1768020063376_jdde6@test.com	login	Auth	\N	Usuario docente_1768020063376_jdde6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 04:41:03.992
cmk7tvd7600078jjlx9gec4i6	2026-01-10 04:51:32.369	cmk7tvcw500028jjlwur7ebb5	estudiante	test_1768020691898_nq6vr	login	Auth	\N	Usuario test_1768020691898_nq6vr (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 04:51:32.37
cmk7tvdmk000f8jjliagmz2xn	2026-01-10 04:51:32.923	cmk7tvdam00088jjlu996e69i	tutor	tutor_1768020692493_st7ro@test.com	login	Auth	\N	Usuario tutor_1768020692493_st7ro@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 04:51:32.924
cmk7tve5v000r8jjlmd16uc6s	2026-01-10 04:51:33.618	cmk7tvdpk000g8jjlizg0kgu9	tutor	docente_1768020693032_vp43q@test.com	login	Auth	\N	Usuario docente_1768020693032_vp43q@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 04:51:33.619
cmk7tvep100178jjlspm6y5c3	2026-01-10 04:51:34.308	cmk7tvef600148jjldny5x5am	tutor	admin_1768020693888_z049t@test.com	login	Auth	\N	Usuario admin_1768020693888_z049t@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 04:51:34.309
cmk7tvf8q001j8jjldgbpwhb5	2026-01-10 04:51:35.017	cmk7tvesr00188jjlgf5te9w3	tutor	docente_1768020694443_k0qkg@test.com	login	Auth	\N	Usuario docente_1768020694443_k0qkg@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 04:51:35.018
cmk7tvfrg001v8jjlh0bxrfuh	2026-01-10 04:51:35.691	cmk7tvfbu001k8jjlrluuydwn	tutor	docente_1768020695129_37dpe@test.com	login	Auth	\N	Usuario docente_1768020695129_37dpe@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 04:51:35.693
cmk7tvgac002b8jjlez9qod78	2026-01-10 04:51:36.372	cmk7tvfuj00208jjl9skfqlju	tutor	docente_1768020695803_n8lqy@test.com	login	Auth	\N	Usuario docente_1768020695803_n8lqy@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 04:51:36.373
cmk7tvgsv002n8jjlpirh0xh2	2026-01-10 04:51:37.038	cmk7tvgde002c8jjl7yhyrpvy	tutor	docente_1768020696481_jjfx0@test.com	login	Auth	\N	Usuario docente_1768020696481_jjfx0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 04:51:37.039
cmk7tvhb9002z8jjl9qrsas7p	2026-01-10 04:51:37.701	cmk7tvgvj002o8jjlyb0vmyw3	tutor	docente_1768020697134_yz4f8@test.com	login	Auth	\N	Usuario docente_1768020697134_yz4f8@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 04:51:37.702
cmk7tvhtf003b8jjlruxiconp	2026-01-10 04:51:38.354	cmk7tvhdv00308jjlzudluf4z	tutor	docente_1768020697794_qzrw0@test.com	login	Auth	\N	Usuario docente_1768020697794_qzrw0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 04:51:38.355
cmk7tviby003r8jjluszzsoe2	2026-01-10 04:51:39.021	cmk7tvhwc003g8jjlwt2zr56k	tutor	docente_1768020698459_mbn0m@test.com	login	Auth	\N	Usuario docente_1768020698459_mbn0m@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 04:51:39.022
cmk7tvius00438jjl3dyhcb82	2026-01-10 04:51:39.699	cmk7tviei003s8jjl5v56445k	tutor	docente_1768020699114_efj04@test.com	login	Auth	\N	Usuario docente_1768020699114_efj04@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 04:51:39.7
cmk7tvjdj004f8jjl7gofcqae	2026-01-10 04:51:40.375	cmk7tvixg00448jjl0fnpyai3	tutor	docente_1768020699795_w0wp1@test.com	login	Auth	\N	Usuario docente_1768020699795_w0wp1@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 04:51:40.376
cmk7tvjw7004x8jjlpd1ujd8y	2026-01-10 04:51:41.047	cmk7tvjgo004m8jjl65lx2dd6	tutor	docente_1768020700488_waae9@test.com	login	Auth	\N	Usuario docente_1768020700488_waae9@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 04:51:41.047
cmk7tvken00598jjli7z0chrl	2026-01-10 04:51:41.71	cmk7tvjyw004y8jjl2xfluk5l	tutor	docente_1768020701144_1cly5@test.com	login	Auth	\N	Usuario docente_1768020701144_1cly5@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 04:51:41.711
cmk7tvkx0005l8jjl3hdiax4o	2026-01-10 04:51:42.372	cmk7tvkhd005a8jjlur09zftj	tutor	docente_1768020701809_ek8en@test.com	login	Auth	\N	Usuario docente_1768020701809_ek8en@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 04:51:42.373
cmk7tvlfg00618jjl31y0kqmx	2026-01-10 04:51:43.035	cmk7tvkzy005q8jjlxyfc1rm2	tutor	docente_1768020702478_h4ebz@test.com	login	Auth	\N	Usuario docente_1768020702478_h4ebz@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 04:51:43.036
cmk7tvly2006h8jjloho1685j	2026-01-10 04:51:43.706	cmk7tvlib00668jjluuboa7u8	tutor	docente_1768020703139_hv85t@test.com	login	Auth	\N	Usuario docente_1768020703139_hv85t@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 04:51:43.707
cmk7tvmgo006x8jjlko3prg93	2026-01-10 04:51:44.376	cmk7tvm0y006m8jjlrb9jf7nd	tutor	docente_1768020703809_85ugb@test.com	login	Auth	\N	Usuario docente_1768020703809_85ugb@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 04:51:44.377
cmk7tvmzl007h8jjl0r68me5d	2026-01-10 04:51:45.056	cmk7tvmk300768jjl00gk9g92	tutor	docente_1768020704498_etyuv@test.com	login	Auth	\N	Usuario docente_1768020704498_etyuv@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 04:51:45.057
cmk7tvnmv008c8jjl0xli13vl	2026-01-10 04:51:45.895	cmk7tvn39007u8jjlu6hol8gz	tutor	docente_1768020705189_rvegb@test.com	login	Auth	\N	Usuario docente_1768020705189_rvegb@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.21	\N	\N	2026-01-10 04:51:45.896
cmk7tzet200078jexl8ee9xav	2026-01-10 04:54:41.077	cmk7tzeir00028jex7qvvuk3r	estudiante	test_1768020880632_7bn55	login	Auth	\N	Usuario test_1768020880632_7bn55 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 04:54:41.078
cmk7tzf80000f8jexb45g02uh	2026-01-10 04:54:41.615	cmk7tzew700088jexpzczqcvb	tutor	tutor_1768020881190_butq6@test.com	login	Auth	\N	Usuario tutor_1768020881190_butq6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 04:54:41.616
cmk7tzfqe000r8jexlg61obr8	2026-01-10 04:54:42.277	cmk7tzfap000g8jexmx5uehwg	tutor	docente_1768020881712_bv6kc@test.com	login	Auth	\N	Usuario docente_1768020881712_bv6kc@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 04:54:42.278
cmk7tzg9c00178jexjaemkcek	2026-01-10 04:54:42.959	cmk7tzfzg00148jexbaiz9fsu	tutor	admin_1768020882537_x5bwa@test.com	login	Auth	\N	Usuario admin_1768020882537_x5bwa@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 04:54:42.96
cmk7tzgs8001j8jexq9pqmpqs	2026-01-10 04:54:43.64	cmk7tzgce00188jex7awwnuw9	tutor	docente_1768020883069_luyid@test.com	login	Auth	\N	Usuario docente_1768020883069_luyid@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 04:54:43.641
cmk7tzhag001v8jexidi7xcdi	2026-01-10 04:54:44.296	cmk7tzguz001k8jexzkqd6cd6	tutor	docente_1768020883738_jkktu@test.com	login	Auth	\N	Usuario docente_1768020883738_jkktu@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 04:54:44.297
cmk7tzht7002b8jexy6cq8fe1	2026-01-10 04:54:44.97	cmk7tzhdj00208jexdb0aagys	tutor	docente_1768020884406_ahjyc@test.com	login	Auth	\N	Usuario docente_1768020884406_ahjyc@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 04:54:44.971
cmk7tzicp002n8jexjj9e022n	2026-01-10 04:54:45.673	cmk7tzhw1002c8jexymvgnbvs	tutor	docente_1768020885072_slelb@test.com	login	Auth	\N	Usuario docente_1768020885072_slelb@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 04:54:45.674
cmk7tziv1002z8jexnh7cfefr	2026-01-10 04:54:46.333	cmk7tzife002o8jex0jev83jp	tutor	docente_1768020885770_8dudj@test.com	login	Auth	\N	Usuario docente_1768020885770_8dudj@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 04:54:46.334
cmk7tzje2003b8jexuzqz91ho	2026-01-10 04:54:47.018	cmk7tzixp00308jexgqbfbs7i	tutor	docente_1768020886429_bt8ft@test.com	login	Auth	\N	Usuario docente_1768020886429_bt8ft@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 04:54:47.019
cmk7tzjzh003r8jexru8xz4e9	2026-01-10 04:54:47.789	cmk7tzjhl003g8jex9et6uvpl	tutor	docente_1768020887144_2t9ee@test.com	login	Auth	\N	Usuario docente_1768020887144_2t9ee@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 04:54:47.79
cmk7tzkiu00438jex89xljtk2	2026-01-10 04:54:48.485	cmk7tzk2h003s8jex7fbdlnf7	tutor	docente_1768020887897_sollm@test.com	login	Auth	\N	Usuario docente_1768020887897_sollm@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 04:54:48.486
cmk7tzl28004f8jexcmdj7eyg	2026-01-10 04:54:49.184	cmk7tzklh00448jexw29na4l0	tutor	docente_1768020888581_1sihf@test.com	login	Auth	\N	Usuario docente_1768020888581_1sihf@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 04:54:49.185
cmk7tzllf004x8jexs5w771dq	2026-01-10 04:54:49.875	cmk7tzl5x004m8jex84acbscu	tutor	docente_1768020889316_86ww6@test.com	login	Auth	\N	Usuario docente_1768020889316_86ww6@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 04:54:49.876
cmk7tzm3p00598jex0cd9hkwg	2026-01-10 04:54:50.532	cmk7tzlo5004y8jex9rkgmyi3	tutor	docente_1768020889972_a4qzj@test.com	login	Auth	\N	Usuario docente_1768020889972_a4qzj@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 04:54:50.533
cmk7tzmm8005l8jexn6j1w5r9	2026-01-10 04:54:51.199	cmk7tzm6p005a8jexut3y8sfh	tutor	docente_1768020890640_zzjya@test.com	login	Auth	\N	Usuario docente_1768020890640_zzjya@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 04:54:51.2
cmk7tzn4s00618jexke7gmrvt	2026-01-10 04:54:51.868	cmk7tzmp9005q8jexjn4n5jps	tutor	docente_1768020891308_d17zj@test.com	login	Auth	\N	Usuario docente_1768020891308_d17zj@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 04:54:51.869
cmk7tznqa006h8jexqr5fbgy0	2026-01-10 04:54:52.641	cmk7tzn7p00668jexmumcno8f	tutor	docente_1768020891973_26ig2@test.com	login	Auth	\N	Usuario docente_1768020891973_26ig2@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 04:54:52.642
cmk7tzo9q006x8jex21pnxuxi	2026-01-10 04:54:53.341	cmk7tznt6006m8jexkv6yf52q	tutor	docente_1768020892746_mhvxn@test.com	login	Auth	\N	Usuario docente_1768020892746_mhvxn@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 04:54:53.342
cmk7tzou3007h8jex1j4t4lyd	2026-01-10 04:54:54.074	cmk7tzods00768jexza25vmoa	tutor	docente_1768020893487_oev45@test.com	login	Auth	\N	Usuario docente_1768020893487_oev45@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 04:54:54.075
cmk7tzph9008c8jexg78n39kd	2026-01-10 04:54:54.908	cmk7tzoxz007u8jexciywf2fm	tutor	docente_1768020894215_3xna4@test.com	login	Auth	\N	Usuario docente_1768020894215_3xna4@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.21	\N	\N	2026-01-10 04:54:54.909
cmk7u2uco00078j6i0yylsilz	2026-01-10 04:57:21.191	cmk7u2u1y00028j6ic3shhrgn	estudiante	test_1768021040732_udsn1	login	Auth	\N	Usuario test_1768021040732_udsn1 (estudiante) inició sesión exitosamente	null	null	info	auth	10.0.0.1	\N	\N	2026-01-10 04:57:21.192
cmk7u2ur8000f8j6i3kdqlzse	2026-01-10 04:57:21.716	cmk7u2ufh00088j6iga7mqdlj	tutor	tutor_1768021041293_3vj25@test.com	login	Auth	\N	Usuario tutor_1768021041293_3vj25@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.2	\N	\N	2026-01-10 04:57:21.717
cmk7u2v9r000r8j6i9c5shv3h	2026-01-10 04:57:22.383	cmk7u2utx000g8j6imo93bvf2	tutor	docente_1768021041813_t6ykc@test.com	login	Auth	\N	Usuario docente_1768021041813_t6ykc@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.3	\N	\N	2026-01-10 04:57:22.384
cmk7u2vss00178j6ies6s8e2s	2026-01-10 04:57:23.068	cmk7u2vir00148j6il6titueo	tutor	admin_1768021042641_6w702@test.com	login	Auth	\N	Usuario admin_1768021042641_6w702@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.4	\N	\N	2026-01-10 04:57:23.069
cmk7u2wbi001j8j6ikktl5lyo	2026-01-10 04:57:23.742	cmk7u2vvo00188j6ibd5rpa77	tutor	docente_1768021043171_24kql@test.com	login	Auth	\N	Usuario docente_1768021043171_24kql@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.5	\N	\N	2026-01-10 04:57:23.743
cmk7u2wtr001v8j6ipe8cmxee	2026-01-10 04:57:24.399	cmk7u2wec001k8j6ia6qfn4o9	tutor	docente_1768021043844_4yn22@test.com	login	Auth	\N	Usuario docente_1768021043844_4yn22@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.6	\N	\N	2026-01-10 04:57:24.399
cmk7u2xcf002b8j6i186iu488	2026-01-10 04:57:25.07	cmk7u2wws00208j6inmxsphrl	tutor	docente_1768021044507_rweda@test.com	login	Auth	\N	Usuario docente_1768021044507_rweda@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.7	\N	\N	2026-01-10 04:57:25.071
cmk7u2xum002n8j6igsveujam	2026-01-10 04:57:25.726	cmk7u2xf3002c8j6isrzuyceu	tutor	docente_1768021045167_3nm9i@test.com	login	Auth	\N	Usuario docente_1768021045167_3nm9i@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.8	\N	\N	2026-01-10 04:57:25.727
cmk7u2ycq002z8j6i23x3i637	2026-01-10 04:57:26.377	cmk7u2xx6002o8j6ijp7ba224	tutor	docente_1768021045817_ca1at@test.com	login	Auth	\N	Usuario docente_1768021045817_ca1at@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.9	\N	\N	2026-01-10 04:57:26.378
cmk7u2yuw003b8j6iheboux6b	2026-01-10 04:57:27.031	cmk7u2yfb00308j6ifl6gslfi	tutor	docente_1768021046470_rqrvt@test.com	login	Auth	\N	Usuario docente_1768021046470_rqrvt@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.10	\N	\N	2026-01-10 04:57:27.032
cmk7u2zd7003r8j6ii1m4pyqd	2026-01-10 04:57:27.691	cmk7u2yxr003g8j6idsta2ykt	tutor	docente_1768021047134_psjlm@test.com	login	Auth	\N	Usuario docente_1768021047134_psjlm@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.11	\N	\N	2026-01-10 04:57:27.692
cmk7u2zvh00438j6i9rcm7wzo	2026-01-10 04:57:28.348	cmk7u2zft003s8j6i4lysv1v1	tutor	docente_1768021047784_yz5cg@test.com	login	Auth	\N	Usuario docente_1768021047784_yz5cg@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.12	\N	\N	2026-01-10 04:57:28.349
cmk7u30dx004f8j6igj98bv1n	2026-01-10 04:57:29.013	cmk7u2zyc00448j6io00hraey	tutor	docente_1768021048452_y34zw@test.com	login	Auth	\N	Usuario docente_1768021048452_y34zw@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.13	\N	\N	2026-01-10 04:57:29.014
cmk7u30y4004x8j6i4mmc95jb	2026-01-10 04:57:29.74	cmk7u30io004m8j6icrplsevc	tutor	docente_1768021049183_b20e9@test.com	login	Auth	\N	Usuario docente_1768021049183_b20e9@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.14	\N	\N	2026-01-10 04:57:29.741
cmk7u31ga00598j6i9o8uxoz4	2026-01-10 04:57:30.394	cmk7u310q004y8j6ifq7jmyco	tutor	docente_1768021049834_z31o1@test.com	login	Auth	\N	Usuario docente_1768021049834_z31o1@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.15	\N	\N	2026-01-10 04:57:30.394
cmk7u31yl005l8j6iqtneupxn	2026-01-10 04:57:31.052	cmk7u31ix005a8j6i568dt84h	tutor	docente_1768021050488_nhl1p@test.com	login	Auth	\N	Usuario docente_1768021050488_nhl1p@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.16	\N	\N	2026-01-10 04:57:31.053
cmk7u32hg00618j6i2ns4u2ci	2026-01-10 04:57:31.732	cmk7u321j005q8j6id0l2p8wc	tutor	docente_1768021051159_qfq3l@test.com	login	Auth	\N	Usuario docente_1768021051159_qfq3l@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.17	\N	\N	2026-01-10 04:57:31.733
cmk7u3301006h8j6idfryxcie	2026-01-10 04:57:32.401	cmk7u32kh00668j6ip6apn8nm	tutor	docente_1768021051841_h9lm7@test.com	login	Auth	\N	Usuario docente_1768021051841_h9lm7@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.18	\N	\N	2026-01-10 04:57:32.401
cmk7u33iw006x8j6i35tfo1jr	2026-01-10 04:57:33.08	cmk7u333b006m8j6iyi3fgtcp	tutor	docente_1768021052518_237j8@test.com	login	Auth	\N	Usuario docente_1768021052518_237j8@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.19	\N	\N	2026-01-10 04:57:33.081
cmk7u3420007h8j6img9knc1g	2026-01-10 04:57:33.768	cmk7u33m700768j6ib3uqro48	tutor	docente_1768021053199_q1grd@test.com	login	Auth	\N	Usuario docente_1768021053199_q1grd@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.20	\N	\N	2026-01-10 04:57:33.768
cmk7u34pn008c8j6io4r7i8ku	2026-01-10 04:57:34.619	cmk7u3465007u8j6ig4crqpbr	tutor	docente_1768021053917_komw0@test.com	login	Auth	\N	Usuario docente_1768021053917_komw0@test.com (tutor) inició sesión exitosamente	null	null	info	auth	10.0.0.21	\N	\N	2026-01-10 04:57:34.619
cmk8jsnzb00008jekaqzemka7	2026-01-10 16:57:16.39	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 16:57:16.392
cmk8jzs4o00068jek1d1nifo9	2026-01-10 17:02:48.36	cmk8js7df00008jbqbr0qt8z6	ADMIN	admin@test.com	logout	Auth	\N	Usuario admin@test.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:02:48.361
cmk8k0q5f00078jekx6u6vdkg	2026-01-10 17:03:32.451	cmk8jyqmo00038jeke4jxgcs9	estudiante	alexis.figueroa	login	Auth	\N	Usuario alexis.figueroa (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:03:32.451
cmk8k17vl000c8jek3qdm4pra	2026-01-10 17:03:55.425	cmk8jyqmo00038jeke4jxgcs9	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:03:55.425
cmk8k1gb8000d8jekwiffaard	2026-01-10 17:04:06.355	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:04:06.356
cmk8k1l2k000e8jek45277w1i	2026-01-10 17:04:12.523	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:04:12.524
cmk8k5m64000f8jekj3p06l75	2026-01-10 17:07:20.571	cmk8js7df00008jbqbr0qt8z6	ADMIN	admin@test.com	logout	Auth	\N	Usuario admin@test.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:07:20.572
cmk8k628y000g8jekhfhch580	2026-01-10 17:07:41.408	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:07:41.41
cmk8k69q4000h8jekxlbo61p8	2026-01-10 17:07:51.1	cmk8js7df00008jbqbr0qt8z6	ADMIN	admin@test.com	logout	Auth	\N	Usuario admin@test.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:07:51.101
cmk8k7em9000i8jekwzflvhjo	2026-01-10 17:08:44.096	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:08:44.098
cmk8k85hz000j8jekl3ihdhjh	2026-01-10 17:09:18.933	cmk8js7df00008jbqbr0qt8z6	ADMIN	admin@test.com	logout	Auth	\N	Usuario admin@test.com (ADMIN) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:09:18.935
cmk8k8bi0000k8jekg1edxv58	2026-01-10 17:09:26.711	cmk8jyqmo00038jeke4jxgcs9	estudiante	alexis.figueroa	login	Auth	\N	Usuario alexis.figueroa (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:09:26.712
cmk8kaby6000l8jekf2iilwj1	2026-01-10 17:11:00.605	cmk8jyqmo00038jeke4jxgcs9	ESTUDIANTE	\N	logout	Auth	\N	Usuario null (ESTUDIANTE) cerró sesión	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:11:00.606
cmk8kahiz000m8jek6lgpcq1o	2026-01-10 17:11:07.834	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:11:07.835
cmk8kdk9n000n8jeku1z5swfc	2026-01-10 17:13:31.354	cmk8jyqmo00038jeke4jxgcs9	estudiante	alexis.figueroa	login	Auth	\N	Usuario alexis.figueroa (estudiante) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-10 17:13:31.355
cmk934zqw00008jkjizjuzvrl	2026-01-11 01:58:44.215	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-11 01:58:44.216
cmk96hk8p00008j1xdcu0e4n8	2026-01-11 03:32:29.496	cmk8js7df00008jbqbr0qt8z6	tutor	admin@test.com	login	Auth	\N	Usuario admin@test.com (tutor) inició sesión exitosamente	null	null	info	auth	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	\N	2026-01-11 03:32:29.497
\.


--
-- Data for Name: casas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.casas (id, tipo, nombre, emoji, slogan, edad_minima, edad_maxima, color_primary, color_secondary, color_accent, color_dark, gradiente, puntos_totales, "createdAt", "updatedAt") FROM stdin;
cmjghf0y4000b8jk6y9fxe28e	QUANTUM	Quantum	🌟	Exploradores del Conocimiento	6	9	#F472B6	#EC4899	#FBCFE8	#DB2777	from-pink-400 to-pink-600	0	2025-12-22 01:33:07.853	2026-01-06 13:41:07.69
cmjghf0y8000c8jk6migqpgge	VERTEX	Vertex	🚀	Constructores del Futuro	10	12	#38BDF8	#0EA5E9	#BAE6FD	#0284C7	from-sky-400 to-sky-600	0	2025-12-22 01:33:07.856	2026-01-06 13:41:07.693
cmjghf0ya000d8jk6tndqgsru	PULSAR	Pulsar	⚡	Dominadores de la Lógica	13	17	#6366F1	#4F46E5	#C7D2FE	#4338CA	from-indigo-400 to-indigo-600	0	2025-12-22 01:33:07.858	2026-01-06 13:41:07.695
\.


--
-- Data for Name: clase_grupos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clase_grupos (id, codigo, nombre, tipo, dia_semana, hora_inicio, hora_fin, fecha_inicio, fecha_fin, anio_lectivo, cupo_maximo, grupo_id, docente_id, sector_id, nivel, activo, "createdAt", "updatedAt", estado_clase, finalizada_en, iniciada_en, livekit_room_name) FROM stdin;
\.


--
-- Data for Name: clases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clases (id, docente_id, fecha_hora_inicio, duracion_minutos, cupos_maximo, cupos_ocupados, producto_id, "createdAt", "updatedAt", descripcion, nombre, sector_id, estado) FROM stdin;
\.


--
-- Data for Name: clases_planificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clases_planificacion (id, planificacion_id, numero, titulo, descripcion, teoria_id, practica_id, created_at, updated_at) FROM stdin;
cmk93j8ek00178jkjl7rdg1k1	cmk93j8ek00158jkjkjf2azeq	1	Clase 1	\N	cmk93j8do00028jkjz8k1ehgh	cmk93j8du00078jkjsuukex5y	2026-01-11 02:09:48.621	2026-01-11 02:09:48.621
cmk93j8ek00188jkj0lgivr8q	cmk93j8ek00158jkjkjf2azeq	2	Clase 2	\N	cmk93j8dy000c8jkjg8qctkus	cmk93j8e1000h8jkj4y9bkioj	2026-01-11 02:09:48.621	2026-01-11 02:09:48.621
cmk93j8ek00198jkjytw21uye	cmk93j8ek00158jkjkjf2azeq	3	Clase 3	\N	cmk93j8e3000m8jkjosao2zfy	cmk93j8e7000r8jkjqbltcath	2026-01-11 02:09:48.621	2026-01-11 02:09:48.621
cmk93j8ek001a8jkjej21fkru	cmk93j8ek00158jkjkjf2azeq	4	Clase 4	\N	cmk93j8eb000w8jkjzi84e1m3	cmk93j8ee00118jkjez1yo7ge	2026-01-11 02:09:48.621	2026-01-11 02:09:48.621
\.


--
-- Data for Name: colonia_estudiante_cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colonia_estudiante_cursos (id, colonia_estudiante_id, course_id, course_name, course_area, instructor, day_of_week, time_slot, precio_base, precio_con_descuento, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_estudiantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colonia_estudiantes (id, inscripcion_id, estudiante_id, nombre, edad, pin, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_inscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colonia_inscripciones (id, tutor_id, estado, descuento_aplicado, total_mensual, fecha_inscripcion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: colonia_pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colonia_pagos (id, inscripcion_id, mes, anio, monto, estado, mercadopago_preference_id, mercadopago_payment_id, fecha_vencimiento, fecha_pago, fecha_creacion, processed_at, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: comisiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comisiones (id, nombre, descripcion, producto_id, casa_id, docente_id, cupo_maximo, horario, fecha_inicio, fecha_fin, activo, "createdAt", "updatedAt", estado_clase, finalizada_en, iniciada_en, livekit_room_name, grupo_id) FROM stdin;
\.


--
-- Data for Name: configuracion_precios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_precios (id, precio_steam_libros, precio_steam_asincronico, precio_steam_sincronico, descuento_segundo_hermano, dia_vencimiento, dias_antes_recordatorio, notificaciones_activas, actualizado_por_admin_id, "createdAt", "updatedAt") FROM stdin;
singleton	40000.00	65000.00	95000.00	10.00	15	5	t	\N	2025-12-22 01:33:07.543	2026-01-06 13:41:07.227
\.


--
-- Data for Name: contenidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contenidos (id, titulo, casa_tipo, mundo_tipo, estado, creador_id, descripcion, imagen_portada, orden, duracion_minutos, fecha_publicacion, "createdAt", "updatedAt", juego_codigo, tipo) FROM stdin;
cmk93j8do00028jkjz8k1ehgh	Nueva Planificación - Clase 1 (Teoría)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.589	2026-01-11 02:09:48.589	\N	LECCION
cmk93j8du00078jkjsuukex5y	Nueva Planificación - Clase 1 (Práctica)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.595	2026-01-11 02:09:48.595	\N	TAREA
cmk93j8dy000c8jkjg8qctkus	Nueva Planificación - Clase 2 (Teoría)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.599	2026-01-11 02:09:48.599	\N	LECCION
cmk93j8e1000h8jkj4y9bkioj	Nueva Planificación - Clase 2 (Práctica)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.601	2026-01-11 02:09:48.601	\N	TAREA
cmk93j8e3000m8jkjosao2zfy	Nueva Planificación - Clase 3 (Teoría)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.604	2026-01-11 02:09:48.604	\N	LECCION
cmk93j8e7000r8jkjqbltcath	Nueva Planificación - Clase 3 (Práctica)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.607	2026-01-11 02:09:48.607	\N	TAREA
cmk93j8eb000w8jkjzi84e1m3	Nueva Planificación - Clase 4 (Teoría)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.612	2026-01-11 02:09:48.612	\N	LECCION
cmk93j8ee00118jkjez1yo7ge	Nueva Planificación - Clase 4 (Práctica)	PULSAR	MATEMATICA	BORRADOR	cmk8js7df00008jbqbr0qt8z6	\N	\N	0	\N	\N	2026-01-11 02:09:48.614	2026-01-11 02:09:48.614	\N	TAREA
\.


--
-- Data for Name: docentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docentes (id, email, password_hash, nombre, apellido, titulo, bio, "createdAt", "updatedAt", disponibilidad_horaria, especialidades, estado, experiencia_anos, nivel_educativo, roles, telefono, fecha_ultimo_cambio, must_change_password, tipo_asignacion) FROM stdin;
cmk8m0akz00048jwnyys99bwe	docente-mtja6cf8xlgy4maamzjf9dr0@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.507	2026-01-10 17:59:11.507	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0ale00068jwn97jtcfdc	docente-f3rmc7fzdw5vj4crnp6zw010@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.522	2026-01-10 17:59:11.522	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0alp00088jwngjf8xbvd	docente-e7cn5ls2kr5qdv390b717gcz@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.533	2026-01-10 17:59:11.533	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0am1000a8jwn8doxjngc	docente-nph7q273ujhf3m7ojcplcia6@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.545	2026-01-10 17:59:11.545	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0amb000c8jwnfzkqyfhv	docente-sq7ujubys1igc74hif67q644@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.556	2026-01-10 17:59:11.556	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0amq000e8jwni8w9jax3	docente-oljg0317as7rrs5lh9k4bnm4@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.57	2026-01-10 17:59:11.57	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0an7000g8jwnmxinyga9	docente-qcunqksit5em0a19g5ieuw2h@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.587	2026-01-10 17:59:11.587	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0anh000i8jwnql7nl55v	docente-y493raeo5ktycwz03auw11cp@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.598	2026-01-10 17:59:11.598	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0any000k8jwnwywcooh9	docente-hratlsss0x3ttg1uuxbpzb2y@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.615	2026-01-10 17:59:11.615	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0ao9000m8jwn72r3r07z	docente-vzx1rnh4wybmxyxob6i9wym7@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.625	2026-01-10 17:59:11.625	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0aoz000o8jwnwbny0yby	docente-pngwuz46602jfu88lqah64z8@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.651	2026-01-10 17:59:11.651	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0ape000q8jwnd992tby1	docente-x6nmxp0cnq1q0y9445wt2koe@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.666	2026-01-10 17:59:11.666	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0app000s8jwn633m0kld	docente-qbf0km7xq81pcdrj1cbtcdlr@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.677	2026-01-10 17:59:11.677	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0aqx000u8jwnv54stwtn	docente-p9w254ela7t1ys5ew4plsnb5@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.721	2026-01-10 17:59:11.721	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0ar7000w8jwnb9xq6a8w	docente-ab0az8iws1sk3nxzbcbhgjql@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.731	2026-01-10 17:59:11.731	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0arm000y8jwnmif7i0pu	docente-rzhaul7rr5zlchhsu8l880g5@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.746	2026-01-10 17:59:11.746	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0arx00108jwnx8x8ary1	docente-iycq4rnmmji6g4u2qxcf6g1c@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.757	2026-01-10 17:59:11.757	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0asn00128jwncomlnrwg	docente-vtduwm28pq5cygmm5vz17cs4@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.783	2026-01-10 17:59:11.783	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0at300148jwnalx2n2rb	docente-g5l3lrbhkf7opxsnr6w92l42@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.799	2026-01-10 17:59:11.799	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0att00168jwnd13x4y2s	docente-quf4e1zl4h77bmuysov3ygy4@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.825	2026-01-10 17:59:11.825	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0auc00188jwngplehk0r	docente-iaj4cxh5zpnzesh7wh8ag16v@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.845	2026-01-10 17:59:11.845	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0aum001a8jwn39i96enl	docente-pfybp2g12pvl74f8oeixbnm8@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.855	2026-01-10 17:59:11.855	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk8m0av2001c8jwnld43dy5c	docente-zcz8h3za2ql3oq5ou6kxdacl@test.com	hash-docente-123	Docente	Test	\N	\N	2026-01-10 17:59:11.87	2026-01-10 17:59:11.87	\N	\N	activo	\N	\N	["docente"]	\N	\N	t	CLASE_GRUPOS
cmk7u3465007u8j6ig4crqpbr	docente_1768021053917_komw0@test.com	$2b$12$FoqGXuSolSQpzu2QL49T2O01DZOPnv9ayXjtcbVjMRl6zXJE3jHXq	Docente	Test	\N	\N	2026-01-10 04:57:33.918	2026-01-10 04:57:34.611	\N	\N	activo	\N	\N	["docente"]	\N	\N	f	CLASE_GRUPOS
\.


--
-- Data for Name: docentes_casas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docentes_casas (id, docente_id, casa_tipo, asignado_en) FROM stdin;
cmk8kobx1000r8jek5s9wmu1y	cmk7u3465007u8j6ig4crqpbr	QUANTUM	2026-01-10 17:21:53.749
\.


--
-- Data for Name: docentes_mundos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docentes_mundos (id, docente_id, mundo_tipo, asignado_en) FROM stdin;
cmk8ko9jl000p8jekszdetu7d	cmk7u3465007u8j6ig4crqpbr	PROGRAMACION	2026-01-10 17:21:50.674
\.


--
-- Data for Name: docentes_rutas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docentes_rutas (id, "docenteId", "rutaId", "sectorId", "asignadoEn") FROM stdin;
\.


--
-- Data for Name: estados_clase_grupo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estados_clase_grupo (id, asignacion_id, clase_id, teoria_activa, practica_activa, activada_en, completada_en) FROM stdin;
\.


--
-- Data for Name: estudiantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estudiantes (id, username, nombre, apellido, nivel_escolar, avatar_url, animacion_idle_url, foto_url, tutor_id, casa_id, nivel_actual, "createdAt", "updatedAt", avatar_gradient, edad, email, password_hash, fecha_ultimo_cambio, roles, sector_id, estado_acceso, fecha_vencimiento_plan, notas_plan, plan_id, acceso_override, acceso_override_hasta, acceso_override_motivo) FROM stdin;
cmk8m0aiw00028jwnm33h5mba	est-solo-otk43tbv6qdwd7gl77tdjrbw	Sin	Grupo	Primaria	\N	\N	\N	cmk8m0ai200008jwnqibjagga	\N	1	2026-01-10 17:59:11.432	2026-01-10 17:59:11.432	0	8	est-solo-otk43tbv6qdwd7gl77tdjrbw@test.com	hash	\N	["estudiante"]	\N	ACTIVO	\N	\N	\N	f	\N	\N
est_test_001	lucas.test	Lucas	Martínez Test	Primaria	\N	\N	\N	tutor_test_001	\N	1	2026-01-11 00:36:35.551	2026-01-11 00:36:35.551	0	10	\N	$2b$10$abcdefghijklmnopqrstuv	\N	["estudiante"]	\N	ACTIVO	\N	\N	\N	f	\N	\N
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eventos (id, titulo, descripcion, tipo, fecha_inicio, fecha_fin, es_todo_el_dia, docente_id, clase_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: grupos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grupos (id, codigo, nombre, descripcion, edad_minima, edad_maxima, sector_id, link_meet, activo, "createdAt", "updatedAt", casa_tipo, mundo_tipo) FROM stdin;
\.


--
-- Data for Name: historial_acceso_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_acceso_estudiante (id, estudiante_id, fecha, accion, origen, origen_id, estado_anterior, estado_nuevo, ejecutado_por, metadata) FROM stdin;
\.


--
-- Data for Name: historial_cambio_precios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_cambio_precios (id, configuracion_id, valores_anteriores, valores_nuevos, motivo_cambio, admin_id, fecha_cambio) FROM stdin;
\.


--
-- Data for Name: historial_estado_suscripcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_estado_suscripcion (id, suscripcion_id, estado_anterior, estado_nuevo, motivo, realizado_por, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: inscripciones_clase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones_clase (id, clase_id, estudiante_id, tutor_id, fecha_inscripcion, observaciones, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inscripciones_clase_grupo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones_clase_grupo (id, clase_grupo_id, estudiante_id, tutor_id, fecha_inscripcion, fecha_baja, observaciones, "createdAt", "updatedAt", tipo_acceso) FROM stdin;
\.


--
-- Data for Name: inscripciones_comision; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones_comision (id, comision_id, estudiante_id, estado, fecha_inscripcion, notas, "updatedAt") FROM stdin;
\.


--
-- Data for Name: inscripciones_mensuales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inscripciones_mensuales (id, estudiante_id, producto_id, tutor_id, anio, mes, periodo, precio_base, descuento_aplicado, precio_final, tipo_descuento, detalle_calculo, estado_pago, fecha_vencimiento, fecha_pago, metodo_pago, comprobante_url, observaciones, "createdAt", "updatedAt") FROM stdin;
ins_test_001	est_test_001	prod_test_001	tutor_test_001	2026	1	2026-01	15000.00	0.00	15000.00	NINGUNO	Sin descuento aplicado	Pagado	2026-01-15 00:00:00	2026-01-11 03:39:14.605	MercadoPago	\N	\N	2026-01-11 00:38:24.985	2026-01-11 03:39:14.606
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_attempts (id, email, ip, success, created_at) FROM stdin;
\.


--
-- Data for Name: logros_estudiantes_gamificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logros_estudiantes_gamificacion (id, estudiante_id, logro_id, fecha_desbloqueo, visto) FROM stdin;
\.


--
-- Data for Name: logros_gamificacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logros_gamificacion (id, codigo, nombre, descripcion, categoria, xp_recompensa, criterio_tipo, criterio_valor, icono, rareza, secreto, animacion, titulo, badge, mensaje_desbloqueo, extras, orden, activo, created_at, updated_at) FROM stdin;
cmk6uvef000688jse9m6mzs1p	primera_leccion	Primera Lección	Logro de prueba	PARTICIPACION	25	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:31:47.389	2026-01-09 12:31:47.389
cmk6uvef000698jse62x6atjf	racha_5	Racha de 5 días	Logro de prueba	RACHA	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:31:47.389	2026-01-09 12:31:47.389
cmk6uvetf007a8jseje0nokg7	maestro_matematicas	Maestro de Matemáticas	Logro de prueba	MAESTRIA	500	manual	{}	🎯	EPICO	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:31:47.907	2026-01-09 12:31:47.907
cmk6uvetf00798jsehomxy20n	racha_100	Racha de 100 días	Logro de prueba	RACHA	1000	manual	{}	🎯	LEGENDARIO	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:31:47.907	2026-01-09 12:31:47.907
cmk6uxfav00r98jseq641g2wr	PRIMER_PASO	Primer Paso	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:21.848	2026-01-09 12:33:21.848
cmk6uxfgn00rl8jse67q0am4i	TEST_LOGRO	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.056	2026-01-09 12:33:22.056
cmk6uxfm600rx8jsejjjrunt6	XP_LOGRO	Test Logro	Logro de prueba	PARTICIPACION	100	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.254	2026-01-09 12:33:22.254
cmk6uxfqr00s98jsewyaa6uyc	MEGA_XP	Test Logro	Logro de prueba	PARTICIPACION	150	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.419	2026-01-09 12:33:22.419
cmk6uxfv200sl8jsec0cmt06x	UNICO	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.574	2026-01-09 12:33:22.574
cmk6uxfzn00sx8jseqfsqcp1b	NO_DUPLICAR_XP	Test Logro	Logro de prueba	PARTICIPACION	100	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.739	2026-01-09 12:33:22.739
cmk6uxg4500t98jsekfa9li3w	LOGRO_1	Primer Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.901	2026-01-09 12:33:22.901
cmk6uxg4600ta8jse2ytezrdk	LOGRO_2	Segundo Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:22.903	2026-01-09 12:33:22.903
cmk6uxgdl00tx8jse7t2je2vt	L1	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.242	2026-01-09 12:33:23.242
cmk6uxgdn00ty8jse7g70f28x	L2	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.243	2026-01-09 12:33:23.243
cmk6uxgdo00tz8jseqrl4kq8o	L3	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.245	2026-01-09 12:33:23.245
cmk6uxgdq00u08jse4ybtmicb	L4	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.247	2026-01-09 12:33:23.247
cmk6uxgj400ug8jsew8h04mf4	NORMAL_1	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.44	2026-01-09 12:33:23.44
cmk6uxgj500uh8jselb9huwyu	NORMAL_2	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.442	2026-01-09 12:33:23.442
cmk6uxgj700ui8jsecs4qzx2d	SECRETO	Secreto	Logro secreto	ESPECIAL	500	manual	{}	🔒	LEGENDARIO	t	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.443	2026-01-09 12:33:23.443
cmk6uxgnu00uu8jsetesz64fa	PARA_VER	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.61	2026-01-09 12:33:23.61
cmk6uxgsf00v68jse0tjs9yjc	VISTO	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.775	2026-01-09 12:33:23.775
cmk6uxgsg00v78jse705xlyoc	NO_VISTO	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:23.777	2026-01-09 12:33:23.777
cmk6uxh1c00vu8jserelqy9ln	SIN_XP	Test Logro	Logro de prueba	PARTICIPACION	0	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 12:33:24.096	2026-01-09 12:33:24.096
cmk6vyux5002v8jgza39njb6a	L1_CALC	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.361	2026-01-09 13:02:28.361
cmk6vyux8002w8jgzryigle6q	L2_CALC	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.365	2026-01-09 13:02:28.365
cmk6vyuxc002x8jgz4kmazta4	L3_CALC	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.368	2026-01-09 13:02:28.368
cmk6vyuxe002y8jgzhfguxclv	L4_CALC	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.371	2026-01-09 13:02:28.371
cmk6vyv2p003e8jgzard0urbo	NORMAL_SEC_1	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.561	2026-01-09 13:02:28.561
cmk6vyv2s003f8jgz6vwq1al0	NORMAL_SEC_2	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.564	2026-01-09 13:02:28.564
cmk6vyv2v003g8jgzp6y6z6on	SECRETO_1767963748566	Secreto	Logro secreto	ESPECIAL	500	manual	{}	🔒	LEGENDARIO	t	\N	\N	\N	\N	\N	0	t	2026-01-09 13:02:28.567	2026-01-09 13:02:28.567
cmk7id9up00j68jmp1nim08iy	test_logro_1	Primer Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:32.45	2026-01-09 23:29:32.45
cmk7id9uu00j78jmp8scj4506	test_logro_2	Segundo Logro	Logro de prueba	PARTICIPACION	100	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:32.454	2026-01-09 23:29:32.454
cmk7ida9x00jq8jmpldykq3ed	test_logro_3	Logro 3	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:32.998	2026-01-09 23:29:32.998
cmk7idaa200jt8jmpno2g94r4	test_logro_4	Logro 4	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:33.002	2026-01-09 23:29:33.002
cmk7idaa600jw8jmptvvt1ugy	test_logro_5	Logro 5	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:33.007	2026-01-09 23:29:33.007
cmk7idaab00jz8jmp9pwdo1ov	test_logro_6	Logro 6	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:33.011	2026-01-09 23:29:33.011
cmk7idaae00k28jmp8qf0kjha	test_logro_7	Logro 7	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:29:33.015	2026-01-09 23:29:33.015
cmk7igy28025g8jmp2i961bsk	L1_CALC_1768001543791	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:23.792	2026-01-09 23:32:23.792
cmk7igy2c025h8jmpptyeqlce	L2_CALC_1768001543791	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:23.796	2026-01-09 23:32:23.796
cmk7igy2f025i8jmp1m4afh68	L3_CALC_1768001543791	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:23.799	2026-01-09 23:32:23.799
cmk7igy2k025j8jmp8boulyzl	L4_CALC_1768001543791	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:23.804	2026-01-09 23:32:23.804
cmk7igy7x025z8jmpppppqtlp	NORMAL_SEC_1_1768001543997	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:23.998	2026-01-09 23:32:23.998
cmk7igy7z02608jmpy98rpovy	NORMAL_SEC_2_1768001543997	Test Logro	Logro de prueba	PARTICIPACION	50	manual	{}	🎯	COMUN	f	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:24	2026-01-09 23:32:24
cmk7igy8502618jmpdjf0486u	SECRETO_1768001543997	Secreto	Logro secreto	ESPECIAL	500	manual	{}	🔒	LEGENDARIO	t	\N	\N	\N	\N	\N	0	t	2026-01-09 23:32:24.005	2026-01-09 23:32:24.005
\.


--
-- Data for Name: mundos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mundos (id, tipo, nombre, descripcion, icono, color_primary, color_secondary, color_accent, gradiente, activo, orden, "createdAt", "updatedAt") FROM stdin;
cmjghf0yd000e8jk6ohy71wjy	MATEMATICA	Matematica	Numeros, algebra, geometria y razonamiento logico-matematico	🔢	#F59E0B	#D97706	#FDE68A	from-amber-400 to-orange-500	t	1	2025-12-22 01:33:07.861	2026-01-06 13:41:07.697
cmjghf0yg000f8jk6wqm3myc6	PROGRAMACION	Programacion	Codigo, algoritmos, estructuras de datos y pensamiento computacional	💻	#10B981	#059669	#A7F3D0	from-emerald-400 to-green-500	t	2	2025-12-22 01:33:07.864	2026-01-06 13:41:07.7
cmjghf0yi000g8jk6r0jelvf6	CIENCIAS	Ciencias	Fisica, quimica, biologia y metodo cientifico	🔬	#3B82F6	#2563EB	#BFDBFE	from-blue-400 to-blue-600	t	3	2025-12-22 01:33:07.866	2026-01-06 13:41:07.702
\.


--
-- Data for Name: nodos_contenido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nodos_contenido (id, contenido_id, parent_id, titulo, bloqueado, orden, contenido_json, "createdAt", "updatedAt") FROM stdin;
cmk93j8ds00038jkj8swy3ocr	cmk93j8do00028jkjz8k1ehgh	\N	Teoría	t	0	\N	2026-01-11 02:09:48.592	2026-01-11 02:09:48.592
cmk93j8ds00048jkjfsl2xvs6	cmk93j8do00028jkjz8k1ehgh	\N	Práctica	t	1	\N	2026-01-11 02:09:48.592	2026-01-11 02:09:48.592
cmk93j8ds00058jkj9sinn4m0	cmk93j8do00028jkjz8k1ehgh	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.592	2026-01-11 02:09:48.592
cmk93j8dx00088jkjjdsopip1	cmk93j8du00078jkjsuukex5y	\N	Teoría	t	0	\N	2026-01-11 02:09:48.597	2026-01-11 02:09:48.597
cmk93j8dx00098jkj467huh5b	cmk93j8du00078jkjsuukex5y	\N	Práctica	t	1	\N	2026-01-11 02:09:48.597	2026-01-11 02:09:48.597
cmk93j8dx000a8jkj9oasmheg	cmk93j8du00078jkjsuukex5y	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.597	2026-01-11 02:09:48.597
cmk93j8e0000d8jkjaql8r1sz	cmk93j8dy000c8jkjg8qctkus	\N	Teoría	t	0	\N	2026-01-11 02:09:48.6	2026-01-11 02:09:48.6
cmk93j8e0000e8jkjxgvwgc6k	cmk93j8dy000c8jkjg8qctkus	\N	Práctica	t	1	\N	2026-01-11 02:09:48.6	2026-01-11 02:09:48.6
cmk93j8e0000f8jkjavvgrnyq	cmk93j8dy000c8jkjg8qctkus	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.6	2026-01-11 02:09:48.6
cmk93j8e2000i8jkjyr13fbcd	cmk93j8e1000h8jkj4y9bkioj	\N	Teoría	t	0	\N	2026-01-11 02:09:48.603	2026-01-11 02:09:48.603
cmk93j8e2000j8jkjjq1h0lr7	cmk93j8e1000h8jkj4y9bkioj	\N	Práctica	t	1	\N	2026-01-11 02:09:48.603	2026-01-11 02:09:48.603
cmk93j8e2000k8jkj9n1t39t3	cmk93j8e1000h8jkj4y9bkioj	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.603	2026-01-11 02:09:48.603
cmk93j8e5000n8jkj0pmebqbx	cmk93j8e3000m8jkjosao2zfy	\N	Teoría	t	0	\N	2026-01-11 02:09:48.606	2026-01-11 02:09:48.606
cmk93j8e5000o8jkjzfi3i2gx	cmk93j8e3000m8jkjosao2zfy	\N	Práctica	t	1	\N	2026-01-11 02:09:48.606	2026-01-11 02:09:48.606
cmk93j8e5000p8jkjayfhawic	cmk93j8e3000m8jkjosao2zfy	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.606	2026-01-11 02:09:48.606
cmk93j8ea000s8jkj8fp64nsx	cmk93j8e7000r8jkjqbltcath	\N	Teoría	t	0	\N	2026-01-11 02:09:48.611	2026-01-11 02:09:48.611
cmk93j8ea000t8jkj5sunm33k	cmk93j8e7000r8jkjqbltcath	\N	Práctica	t	1	\N	2026-01-11 02:09:48.611	2026-01-11 02:09:48.611
cmk93j8ea000u8jkjjfdwmdr3	cmk93j8e7000r8jkjqbltcath	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.611	2026-01-11 02:09:48.611
cmk93j8ed000x8jkj1x30jmbe	cmk93j8eb000w8jkjzi84e1m3	\N	Teoría	t	0	\N	2026-01-11 02:09:48.613	2026-01-11 02:09:48.613
cmk93j8ed000y8jkjba9dmhvy	cmk93j8eb000w8jkjzi84e1m3	\N	Práctica	t	1	\N	2026-01-11 02:09:48.613	2026-01-11 02:09:48.613
cmk93j8ed000z8jkjawdl3tjv	cmk93j8eb000w8jkjzi84e1m3	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.613	2026-01-11 02:09:48.613
cmk93j8ef00128jkjata4wnez	cmk93j8ee00118jkjez1yo7ge	\N	Teoría	t	0	\N	2026-01-11 02:09:48.616	2026-01-11 02:09:48.616
cmk93j8ef00138jkjbtce2sff	cmk93j8ee00118jkjez1yo7ge	\N	Práctica	t	1	\N	2026-01-11 02:09:48.616	2026-01-11 02:09:48.616
cmk93j8ef00148jkjblp1r6o4	cmk93j8ee00118jkjez1yo7ge	\N	Evaluación	t	2	\N	2026-01-11 02:09:48.616	2026-01-11 02:09:48.616
\.


--
-- Data for Name: notas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notas (id, evento_id, contenido, categoria, color) FROM stdin;
\.


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificaciones (id, tipo, titulo, mensaje, leida, docente_id, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: observaciones_docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.observaciones_docente (id, docente_id, comision_id, contenido, fecha_evento, tipo, prioridad, requiere_seguimiento, notificar_admin, notificar_pedagogia, estado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: observaciones_estudiantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.observaciones_estudiantes (observacion_id, estudiante_id) FROM stdin;
\.


--
-- Data for Name: pagos_suscripcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos_suscripcion (id, suscripcion_id, mp_payment_id, mp_status, mp_status_detail, monto, moneda, periodo_inicio, periodo_fin, intento_numero, error_code, error_message, fecha_cobro, created_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, email, token, user_type, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: planes_suscripcion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planes_suscripcion (id, nombre, descripcion, precio_base, moneda, intervalo, intervalo_cantidad, activo, created_at, updated_at) FROM stdin;
cmk8k4txx00008jkze2lggv7r	STEAM_LIBROS	Acceso a libros y contenido asincrónico básico	5000.00	ARS	MENSUAL	1	t	2026-01-10 17:06:43.99	2026-01-10 17:06:43.99
cmk8k4tyb00018jkzgplc1oc7	STEAM_ASINCRONICO	Acceso a todo el contenido asincrónico (libros, videos, ejercicios)	10000.00	ARS	MENSUAL	1	t	2026-01-10 17:06:44.003	2026-01-10 17:06:44.003
cmk8k4tyd00028jkz3oznd63v	STEAM_SINCRONICO	Acceso completo + clases en vivo con docentes	20000.00	ARS	MENSUAL	1	t	2026-01-10 17:06:44.006	2026-01-10 17:06:44.006
\.


--
-- Data for Name: planificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planificaciones (id, titulo, descripcion, cantidad_clases, casa_tipo, created_at, duracion_clase_dias, estado, mundo_tipo, updated_at) FROM stdin;
cmk93j8ek00158jkjkjf2azeq	Nueva Planificación	\N	4	PULSAR	2026-01-11 02:09:48.621	7	BORRADOR	MATEMATICA	2026-01-11 02:09:48.621
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, nombre, descripcion, precio, tipo, activo, fecha_inicio, fecha_fin, cupo_maximo, duracion_meses, "createdAt", "updatedAt", subcategoria, imagen_portada) FROM stdin;
prod_test_001	Membresía Mensual	Acceso completo por un mes	15000.00	Servicio	t	\N	\N	\N	1	2026-01-11 00:35:54.908	2026-01-11 00:35:54.908	\N	\N
\.


--
-- Data for Name: progreso_contenidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progreso_contenidos (id, estudiante_id, contenido_id, completado, tiempo_total_segundos, fecha_inicio, ultima_actividad, fecha_completitud, nodo_actual_id) FROM stdin;
\.


--
-- Data for Name: progresos_clase_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progresos_clase_estudiante (id, estudiante_id, clase_id, teoria_completada, teoria_completada_en, practica_completada, practica_completada_en, tiempo_teoria_segundos, tiempo_practica_segundos) FROM stdin;
\.


--
-- Data for Name: progresos_tarea_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progresos_tarea_estudiante (id, estudiante_id, tarea_asignada_id, estado, iniciada_en, completada_en, tiempo_total_segundos, intentos, calificacion) FROM stdin;
\.


--
-- Data for Name: puntos_obtenidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puntos_obtenidos (id, estudiante_id, docente_id, clase_id, puntos, contexto, fecha_otorgado, "createdAt", "updatedAt", tipo_accion) FROM stdin;
\.


--
-- Data for Name: rachas_estudiantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rachas_estudiantes (id, estudiante_id, racha_actual, racha_maxima, ultima_actividad, inicio_racha_actual, total_dias_activos, updated_at) FROM stdin;
\.


--
-- Data for Name: reacciones_feed; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reacciones_feed (id, actividad_id, estudiante_id, emoji, creado_en) FROM stdin;
\.


--
-- Data for Name: recordatorios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recordatorios (id, evento_id, completado, color) FROM stdin;
\.


--
-- Data for Name: recursos_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recursos_estudiante (id, estudiante_id, xp_total, ultima_actualizacion, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: refresh_token_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_token_sessions (id, user_type, ip_address, user_agent, created_at, last_used_at, expires_at, revoked, revoked_reason, user_id) FROM stdin;
5ee83059-1a77-40b2-891b-bd76170b16db	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:20:09.763-03	2026-01-03 16:20:09.762-03	2026-01-10 16:20:09.761-03	f	\N	cmjyonfck00008j4sehe8xoib
68d1e769-a9ce-42d3-9bd2-eaf7c8c8645a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:20:17.742-03	2026-01-03 16:20:17.74-03	2026-01-10 16:20:17.739-03	t	user_logout	cmjyonfck00008j4sehe8xoib
6ac77386-451e-4442-8018-ea08ec3c9cc5	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:34:28.796-03	2026-01-03 16:34:28.795-03	2026-01-10 16:34:28.794-03	t	user_logout	cmjypaa0600008jb6csn93sm4
4aa76cc8-ffb4-428f-ad98-f7c0661d8c28	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:39:38.76-03	2026-01-03 16:39:38.759-03	2026-01-10 16:39:38.759-03	t	user_logout	cmjyonfck00008j4sehe8xoib
0bacfbb1-86f7-4b25-bfa0-e43a83b25e4a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:40:35.293-03	2026-01-03 16:40:35.292-03	2026-01-10 16:40:35.292-03	t	user_logout	cmjypj8a000058jb6fljslplj
cad257f2-54b8-46ad-8f69-2a6fd97bc24a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:46:32.748-03	2026-01-03 16:46:32.747-03	2026-01-10 16:46:32.747-03	t	user_logout	cmjypj8a000058jb6fljslplj
591bb118-61e6-4b4d-a5f2-deb7fc82ce1e	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:47:17.953-03	2026-01-03 16:47:17.953-03	2026-01-10 16:47:17.953-03	t	user_logout	cmjyonfck00008j4sehe8xoib
f3776828-136d-4c10-841c-fd3f9ffc8715	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:50:34.748-03	2026-01-03 16:50:34.747-03	2026-01-10 16:50:34.747-03	f	\N	cmjypj8a000058jb6fljslplj
745fb367-152d-4b71-ba5c-38785c4f3d7d	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:51:23.381-03	2026-01-03 16:51:23.38-03	2026-01-10 16:51:23.38-03	f	\N	cmjypj8a000058jb6fljslplj
c2c0ffcd-2c8e-46c5-b9bc-f843d869e4a7	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:53:20.568-03	2026-01-03 16:53:20.567-03	2026-01-10 16:53:20.566-03	t	user_logout	cmjypj8a000058jb6fljslplj
c00e7c38-f851-47b3-b8ac-d9951e84c93f	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 16:53:57.179-03	2026-01-03 16:53:57.178-03	2026-01-10 16:53:57.178-03	f	\N	cmjypj8a000058jb6fljslplj
ca254a9e-e0bd-41ae-a212-b44dcba2d972	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 19:46:18.886-03	2026-01-03 19:46:18.885-03	2026-01-10 19:46:18.885-03	f	\N	cmjypj8a000058jb6fljslplj
32b5c279-ce78-4c1e-a2cb-8214a3675eaf	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 20:55:11.299-03	2026-01-03 20:55:11.298-03	2026-01-10 20:55:11.298-03	f	\N	cmjypj8a000058jb6fljslplj
fe55aa5b-bd85-4b94-876f-06599c989080	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 21:48:09.362-03	2026-01-03 21:48:09.36-03	2026-01-10 21:48:09.36-03	f	\N	cmjypj8a000058jb6fljslplj
6e9d34cd-3030-4e2b-9b12-8e5c7762715e	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-03 21:48:13.845-03	2026-01-03 21:48:13.844-03	2026-01-10 21:48:13.844-03	f	\N	cmjypj8a000058jb6fljslplj
37d7334d-416b-4315-a7d3-6f6d37517f9b	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 01:00:59.896-03	2026-01-04 01:00:59.894-03	2026-01-11 01:00:59.894-03	f	\N	cmjypj8a000058jb6fljslplj
0da72172-6bcb-476d-a27d-7ee93367a232	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 01:57:42.809-03	2026-01-04 01:57:42.808-03	2026-01-11 01:57:42.808-03	f	\N	cmjypj8a000058jb6fljslplj
feb1a6fa-9f5c-4738-b21e-ce1321670cf1	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 02:21:33.411-03	2026-01-04 02:21:33.41-03	2026-01-11 02:21:33.409-03	f	\N	cmjypj8a000058jb6fljslplj
2124a9ee-4574-40ea-ac08-736daa5f00be	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 02:57:25.626-03	2026-01-04 02:57:25.625-03	2026-01-11 02:57:25.625-03	f	\N	cmjypj8a000058jb6fljslplj
7e5b8be0-cad5-40a4-beb7-55d7dffb816f	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 03:10:49.924-03	2026-01-04 03:10:49.922-03	2026-01-11 03:10:49.921-03	f	\N	cmjypj8a000058jb6fljslplj
357ba3ff-938c-456c-81b4-096f27d855fb	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 09:06:08.586-03	2026-01-04 09:06:08.584-03	2026-01-11 09:06:08.584-03	t	user_logout	cmjyonfck00008j4sehe8xoib
bca3fe76-0754-4e04-98d9-1ee5bbc5e0b6	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 09:14:56.816-03	2026-01-04 09:14:56.815-03	2026-01-11 09:14:56.815-03	f	\N	cmjypj8a000058jb6fljslplj
b75bdc9a-1a76-40a9-8e1e-f92eab0da2a4	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 09:29:49.905-03	2026-01-04 09:29:49.904-03	2026-01-11 09:29:49.904-03	f	\N	cmjypj8a000058jb6fljslplj
c9ba243a-0118-4c7d-b979-9bbb7f1e271e	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 09:30:09.217-03	2026-01-04 09:30:09.213-03	2026-01-11 09:30:09.213-03	f	\N	cmjypj8a000058jb6fljslplj
2ddfefb2-a4b8-4424-a900-ad5b32b94b58	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 15:07:15.982-03	2026-01-04 15:07:15.981-03	2026-01-11 15:07:15.98-03	t	user_logout	cmjypj8a000058jb6fljslplj
174726ea-0d96-457f-900e-efcd112e3005	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 15:08:11.367-03	2026-01-04 15:08:11.366-03	2026-01-11 15:08:11.366-03	t	user_logout	cmjypj8a000058jb6fljslplj
f8af7bc7-f779-4421-9597-5081fc7ed362	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 15:10:43.186-03	2026-01-04 15:10:43.185-03	2026-01-11 15:10:43.185-03	t	user_logout	cmjyonfck00008j4sehe8xoib
7e0deaf0-2895-4e0a-98ad-0844a4877a8d	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 15:12:40.907-03	2026-01-04 15:12:40.906-03	2026-01-11 15:12:40.906-03	f	\N	cmjypj8a000058jb6fljslplj
8c869cf8-2d55-4307-a1ba-c81b982de001	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 19:28:46.098-03	2026-01-04 19:28:46.097-03	2026-01-11 19:28:46.097-03	f	\N	cmjypj8a000058jb6fljslplj
0db86899-f080-4260-a67b-1f88c90402a2	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 21:13:15.57-03	2026-01-04 21:13:15.567-03	2026-01-11 21:13:15.566-03	f	\N	cmjypj8a000058jb6fljslplj
555745a9-8f7d-4e47-8711-6d8d12dce2f9	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 21:13:24.382-03	2026-01-04 21:13:24.379-03	2026-01-11 21:13:24.379-03	f	\N	cmjypj8a000058jb6fljslplj
e5951d31-936d-4796-aab6-251692b9f5dc	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 22:30:47.207-03	2026-01-04 22:30:47.207-03	2026-01-11 22:30:47.206-03	f	\N	cmjypj8a000058jb6fljslplj
907a6833-700f-4c8c-a31a-5d27051cad71	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 23:16:18.509-03	2026-01-04 23:16:18.508-03	2026-01-11 23:16:18.508-03	f	\N	cmjypj8a000058jb6fljslplj
ffa03fca-4a16-4239-8d05-45ac63a525b2	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-04 23:53:38.795-03	2026-01-04 23:53:38.794-03	2026-01-11 23:53:38.794-03	f	\N	cmjypj8a000058jb6fljslplj
a0387b50-8660-48f5-9196-b4d0c4e9fcda	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 09:51:05.671-03	2026-01-05 09:51:05.669-03	2026-01-12 09:51:05.668-03	f	\N	cmjypj8a000058jb6fljslplj
b1d50942-e1ab-47cc-86cc-1b80648f7734	estudiante	10.0.0.9	\N	2026-01-09 07:55:40.926-03	2026-01-09 07:55:40.925-03	2026-01-16 07:55:40.925-03	f	\N	cmk6rfspl00e58jnej5nkv0tt
b61ecd26-b739-4be6-8abc-59b79df942c5	estudiante	10.0.0.10	\N	2026-01-09 07:55:41.429-03	2026-01-09 07:55:41.428-03	2026-01-16 07:55:41.428-03	f	\N	cmk6rft4b00eg8jnexy2ti7y3
29585cca-ac15-4775-92d3-edf9f01c4f33	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:55:57.218-03	2026-01-09 07:55:57.217-03	2026-01-16 07:55:57.217-03	f	\N	cmk6rg5cv00ql8jnephsjpf48
d705ce11-f2c6-421c-be27-b954e99af39e	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 09:51:12.199-03	2026-01-05 09:51:12.198-03	2026-01-12 09:51:12.197-03	t	user_logout	cmjypj8a000058jb6fljslplj
3d8b181c-ba12-4fe6-bad4-a8769cf47f07	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 09:51:41.368-03	2026-01-05 09:51:41.366-03	2026-01-12 09:51:41.366-03	t	user_logout	cmjyonfck00008j4sehe8xoib
abaf64fd-b3bc-4377-95b8-3c5a8be0b6ee	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 09:56:20.746-03	2026-01-05 09:56:20.745-03	2026-01-12 09:56:20.745-03	f	\N	cmjypvyfv00098j0yvyovebpw
0454e7b5-6cbc-4f44-a390-b1bb88704a71	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 11:22:57.951-03	2026-01-05 11:22:57.949-03	2026-01-12 11:22:57.949-03	f	\N	cmjypvyfv00098j0yvyovebpw
94f9ed83-43ed-4f02-bc2c-3b0bf97bd35a	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:09:58.633-03	2026-01-05 13:09:58.63-03	2026-01-12 13:09:58.63-03	f	\N	cmjypvyfv00098j0yvyovebpw
ee8d255d-d478-4a86-9c48-179e8804021e	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:34:50.905-03	2026-01-05 13:34:50.903-03	2026-01-12 13:34:50.903-03	t	user_logout	cmjypvyfv00098j0yvyovebpw
d8df256d-c172-47e9-a299-13a996a352be	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:36:49.573-03	2026-01-05 13:36:49.572-03	2026-01-12 13:36:49.572-03	f	\N	cmjyonfck00008j4sehe8xoib
e2b4c837-fa72-4bea-9397-f36267c0a38b	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:38:19.563-03	2026-01-05 13:38:19.562-03	2026-01-12 13:38:19.562-03	t	user_logout	cmjypvyfv00098j0yvyovebpw
f3b83aac-4b4e-41f6-90ec-f0d6f44ebbc1	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:38:27.87-03	2026-01-05 13:38:27.869-03	2026-01-12 13:38:27.869-03	f	\N	cmjypj8a000058jb6fljslplj
6be85977-1ed0-4739-b364-35e5ee1e706b	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:38:31.703-03	2026-01-05 13:38:31.702-03	2026-01-12 13:38:31.702-03	f	\N	cmjypj8a000058jb6fljslplj
b09c48ba-fc3f-4b64-a64e-b20ff0f1a2f1	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:43:15.227-03	2026-01-05 13:43:15.225-03	2026-01-12 13:43:15.225-03	f	\N	cmjypvyfv00098j0yvyovebpw
c31511d0-2026-46d2-bf37-9fc063f6f0fe	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:43:22.294-03	2026-01-05 13:43:22.293-03	2026-01-12 13:43:22.293-03	f	\N	cmjypj8a000058jb6fljslplj
60de5069-5a13-4ba4-bb8a-50c6ff4552c2	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:45:08.392-03	2026-01-05 13:45:08.39-03	2026-01-12 13:45:08.389-03	t	user_logout	cmjypvyfv00098j0yvyovebpw
240e82eb-a2a3-4d3e-b03e-29bef84c2bb5	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:46:03.119-03	2026-01-05 13:46:03.119-03	2026-01-12 13:46:03.118-03	f	\N	cmjypj8a000058jb6fljslplj
83c6d1fc-362a-4853-b230-c39e94d8c7b1	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 13:51:36.909-03	2026-01-05 13:51:36.908-03	2026-01-12 13:51:36.908-03	f	\N	cmjypvyfv00098j0yvyovebpw
0c62441a-cb5f-40fd-9c49-684a2c38288a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 14:00:41.888-03	2026-01-05 14:00:41.886-03	2026-01-12 14:00:41.886-03	f	\N	cmjypj8a000058jb6fljslplj
cec60f97-cdea-49f8-af3e-c4ae9e73860a	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 14:01:45.83-03	2026-01-05 14:01:45.828-03	2026-01-12 14:01:45.827-03	f	\N	cmjypvyfv00098j0yvyovebpw
62e235d9-0176-46ee-9bad-5b9f7abc8215	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 14:01:55.01-03	2026-01-05 14:01:55.009-03	2026-01-12 14:01:55.009-03	f	\N	cmjypj8a000058jb6fljslplj
a8f3d723-cfa6-4a92-b314-4dc91c286316	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 14:03:34.652-03	2026-01-05 14:03:34.651-03	2026-01-12 14:03:34.651-03	f	\N	cmjypvyfv00098j0yvyovebpw
417ff5df-f34f-41c2-9afe-59dc0ae4d798	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 15:03:06.537-03	2026-01-05 15:03:06.536-03	2026-01-12 15:03:06.536-03	f	\N	cmjypvyfv00098j0yvyovebpw
5552edff-dd0d-4bfe-a60f-2095de56878c	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 15:04:08.304-03	2026-01-05 15:04:08.302-03	2026-01-12 15:04:08.302-03	f	\N	cmjypvyfv00098j0yvyovebpw
a8ba1b9a-68dc-471e-978f-6ad917223430	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 15:04:43.364-03	2026-01-05 15:04:43.363-03	2026-01-12 15:04:43.363-03	f	\N	cmjyonfck00008j4sehe8xoib
6bceb453-f55b-4fa7-bbd4-4a293e46af20	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 15:08:14.09-03	2026-01-05 15:08:14.089-03	2026-01-12 15:08:14.089-03	f	\N	cmjypvyfv00098j0yvyovebpw
c0fc3e0d-fd1a-4d82-903b-b0308f5448ed	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 18:36:12.752-03	2026-01-05 18:36:12.751-03	2026-01-12 18:36:12.751-03	f	\N	cmjypvyfv00098j0yvyovebpw
b98373f7-c6dc-42c3-a29e-01140092aed0	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 18:36:46.257-03	2026-01-05 18:36:46.256-03	2026-01-12 18:36:46.256-03	f	\N	cmjypvyfv00098j0yvyovebpw
31193a68-ce02-4223-a73d-c87655ca9b64	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 20:06:53.54-03	2026-01-05 20:06:53.539-03	2026-01-12 20:06:53.539-03	f	\N	cmjypvyfv00098j0yvyovebpw
3af9a393-de6a-4cde-8bf6-b685de1c1f68	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 20:16:46.177-03	2026-01-05 20:16:46.176-03	2026-01-12 20:16:46.176-03	t	user_logout	cmjypvyfv00098j0yvyovebpw
e6c7496f-e023-42b8-bea8-92008e0cd34a	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 20:29:38.833-03	2026-01-05 20:29:38.833-03	2026-01-12 20:29:38.832-03	t	user_logout	cmjypvyfv00098j0yvyovebpw
246e7a5f-72ac-43a5-bd18-f2617542f96e	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 21:22:56.965-03	2026-01-05 21:22:56.963-03	2026-01-12 21:22:56.963-03	f	\N	cmjyonfck00008j4sehe8xoib
934464a3-4799-42e2-8bd2-d813bb19b057	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 21:23:01.824-03	2026-01-05 21:23:01.823-03	2026-01-12 21:23:01.823-03	f	\N	cmjyonfck00008j4sehe8xoib
bb6017b1-d25f-43bf-a5b1-f60baea9d1c5	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 22:56:36.28-03	2026-01-05 22:56:36.279-03	2026-01-12 22:56:36.278-03	t	user_logout	cmjyonfck00008j4sehe8xoib
425748c8-ad26-4dfd-a3d9-52755711b1a6	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 22:57:45.9-03	2026-01-05 22:57:45.897-03	2026-01-12 22:57:45.897-03	f	\N	cmjypvyfv00098j0yvyovebpw
e8813119-9aa8-4e92-bd8b-4704810d8d8c	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 22:58:27.422-03	2026-01-05 22:58:27.422-03	2026-01-12 22:58:27.421-03	f	\N	cmjypvyfv00098j0yvyovebpw
05df55da-6f2c-454c-a0ec-483ef8018753	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-05 23:19:15.167-03	2026-01-05 23:19:15.166-03	2026-01-12 23:19:15.166-03	f	\N	cmjypvyfv00098j0yvyovebpw
11da0ba2-717d-409c-8e1a-cd18f7159159	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 10:41:59.7-03	2026-01-06 10:41:59.699-03	2026-01-13 10:41:59.698-03	f	\N	cmjyonfck00008j4sehe8xoib
7466549b-ebe2-460e-adfa-0ad0f8070929	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:14:02.177-03	2026-01-06 11:14:02.177-03	2026-01-13 11:14:02.176-03	t	user_logout	cmk2n7tmr00028jdq7ztusxri
6c470fee-f2f2-4497-96a2-3bdd797dacb9	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:15:36.319-03	2026-01-06 11:15:36.318-03	2026-01-13 11:15:36.318-03	t	user_logout	cmjyonfck00008j4sehe8xoib
1b516070-1726-4654-b6bd-35f6d0a9008b	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:31:50.778-03	2026-01-06 11:31:50.776-03	2026-01-13 11:31:50.776-03	f	\N	cmjyonfck00008j4sehe8xoib
faa197d7-3348-4f1a-bb29-5956097a4df0	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:32:26.952-03	2026-01-06 11:32:26.951-03	2026-01-13 11:32:26.951-03	t	user_logout	cmk2n7tmr00028jdq7ztusxri
41ae6c76-42f0-4fb2-9bd8-945cad1aa810	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:32:54.975-03	2026-01-06 11:32:54.974-03	2026-01-13 11:32:54.974-03	f	\N	cmjyonfck00008j4sehe8xoib
1874b75c-c93f-49d3-b27a-4203b6d7face	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:36:43.723-03	2026-01-06 11:36:43.722-03	2026-01-13 11:36:43.721-03	f	\N	cmk2n7tmr00028jdq7ztusxri
dd0c36e5-123a-46b3-8b1a-15573738b732	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:40:59.422-03	2026-01-06 11:40:59.42-03	2026-01-13 11:40:59.42-03	f	\N	cmk2n7tmr00028jdq7ztusxri
11917a22-50fa-4929-8baf-3e719f32d881	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 11:42:51.15-03	2026-01-06 11:42:51.149-03	2026-01-13 11:42:51.149-03	f	\N	cmjyonfck00008j4sehe8xoib
9d85e13f-7845-4712-ac66-8ccba014a297	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:31:34.863-03	2026-01-06 13:31:34.862-03	2026-01-13 13:31:34.862-03	f	\N	cmjyonfck00008j4sehe8xoib
60508093-a8d0-4b6f-9b5c-e1e4810265d1	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:32:55.394-03	2026-01-06 13:32:55.393-03	2026-01-13 13:32:55.393-03	f	\N	cmk2n7tmr00028jdq7ztusxri
f067fd77-5d96-4e5d-818a-a2371b1906b6	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:39:39.417-03	2026-01-06 13:39:39.415-03	2026-01-13 13:39:39.415-03	f	\N	cmk2n7tmr00028jdq7ztusxri
1b62cf4d-71ca-497d-8ff5-5ed69e36a5f3	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:39:48.652-03	2026-01-06 13:39:48.651-03	2026-01-13 13:39:48.651-03	t	user_logout	cmjyonfck00008j4sehe8xoib
c4807e9a-eede-448f-a26a-3506c7a1925b	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:52:32.546-03	2026-01-06 13:52:32.545-03	2026-01-13 13:52:32.545-03	t	user_logout	cmjyonfck00008j4sehe8xoib
fce58075-fb40-491d-a08a-e20b40f15839	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:54:14.445-03	2026-01-06 13:54:14.444-03	2026-01-13 13:54:14.444-03	f	\N	cmk2onkxq00088jeciqxn4ulm
cce5fe7a-d2cd-498f-a6df-12555505afe1	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 13:58:02.311-03	2026-01-06 13:58:02.308-03	2026-01-13 13:58:02.308-03	f	\N	cmk2n7tmr00028jdq7ztusxri
9acc37c5-9049-4863-a90f-d0e6404dfb51	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 15:09:26.202-03	2026-01-06 15:09:26.201-03	2026-01-13 15:09:26.201-03	f	\N	cmjyonfck00008j4sehe8xoib
eefcc2f7-0a6b-48dd-bdcf-31c3f8beab19	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 15:11:10.019-03	2026-01-06 15:11:10.018-03	2026-01-13 15:11:10.017-03	t	user_logout	cmjyonfck00008j4sehe8xoib
2260357e-fd77-4fd9-92b1-764ea2bbb4db	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 15:11:29.771-03	2026-01-06 15:11:29.77-03	2026-01-13 15:11:29.77-03	f	\N	cmk2onkxq00088jeciqxn4ulm
fc6ad041-d529-4c0c-809f-f0cbc7a2a47a	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 15:11:40.172-03	2026-01-06 15:11:40.171-03	2026-01-13 15:11:40.17-03	f	\N	cmk2n7tmr00028jdq7ztusxri
47d76d99-b747-45a2-a7bf-cbb35e3aa401	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 17:47:45.549-03	2026-01-06 17:47:45.548-03	2026-01-13 17:47:45.548-03	f	\N	cmk2onkxq00088jeciqxn4ulm
5096465e-4919-4e5b-8c83-777551253330	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 17:48:10.165-03	2026-01-06 17:48:10.164-03	2026-01-13 17:48:10.164-03	f	\N	cmk2n7tmr00028jdq7ztusxri
838aa735-30e0-4c12-923a-76cc6d61f3e3	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 18:15:34.043-03	2026-01-06 18:15:34.041-03	2026-01-13 18:15:34.037-03	f	\N	cmk2n7tmr00028jdq7ztusxri
787a135b-7fc0-4eaa-ad9e-4e1e72ea8a2a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 18:15:58.631-03	2026-01-06 18:15:58.63-03	2026-01-13 18:15:58.63-03	f	\N	cmk2onkxq00088jeciqxn4ulm
e45d7b93-3002-4ab9-a232-e82ee3a71981	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:17:55.681-03	2026-01-06 21:17:55.679-03	2026-01-13 21:17:55.678-03	f	\N	cmk2n7tmr00028jdq7ztusxri
4ecfe795-3c79-4fd2-9a1c-6f29f3397ef5	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:18:04.043-03	2026-01-06 21:18:04.042-03	2026-01-13 21:18:04.042-03	f	\N	cmk2onkxq00088jeciqxn4ulm
41253c9e-09cb-44bd-bd27-ab220722109d	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:21:08.022-03	2026-01-06 21:21:08.021-03	2026-01-13 21:21:08.02-03	f	\N	cmk2n7tmr00028jdq7ztusxri
e50f5c76-631f-4f72-a9c8-0d13fa16465c	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:25:41.252-03	2026-01-06 21:25:41.249-03	2026-01-13 21:25:41.248-03	f	\N	cmk2n7tmr00028jdq7ztusxri
70867361-5867-4701-9fa0-ee6c438fb689	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:28:04.224-03	2026-01-06 21:28:04.223-03	2026-01-13 21:28:04.223-03	f	\N	cmk2n7tmr00028jdq7ztusxri
19d61742-047d-4d2a-a628-60f17b88d107	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:28:15.57-03	2026-01-06 21:28:15.569-03	2026-01-13 21:28:15.569-03	f	\N	cmk2n7tmr00028jdq7ztusxri
e43f4850-a2b0-4a4c-874f-15226900b01f	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:31:13.77-03	2026-01-06 21:31:13.769-03	2026-01-13 21:31:13.769-03	f	\N	cmk2n7tmr00028jdq7ztusxri
146fcdb0-9521-4f5a-ba79-e65b68c55757	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:44:14.24-03	2026-01-06 21:44:14.233-03	2026-01-13 21:44:14.232-03	f	\N	cmk2n7tmr00028jdq7ztusxri
b16b16de-d52d-48df-aabb-11cb844c3fd9	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 21:56:37.212-03	2026-01-06 21:56:37.21-03	2026-01-13 21:56:37.21-03	f	\N	cmk2n7tmr00028jdq7ztusxri
c58fdcfb-e1d0-48e9-89e8-6dd67f5edf23	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 23:39:50.898-03	2026-01-06 23:39:50.896-03	2026-01-13 23:39:50.896-03	f	\N	cmk2n7tmr00028jdq7ztusxri
837b7aa8-19f6-4a7d-8915-57474698037f	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 23:40:30.668-03	2026-01-06 23:40:30.664-03	2026-01-13 23:40:30.664-03	f	\N	cmk2n7tmr00028jdq7ztusxri
7f089b31-13e6-4ca0-9d17-15dbbe8e357d	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 00:29:25.426-03	2026-01-07 00:29:25.425-03	2026-01-14 00:29:25.425-03	f	\N	cmk2n7tmr00028jdq7ztusxri
5ab1b3db-8859-4496-9913-04815be4b460	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-06 23:40:12.178-03	2026-01-06 23:40:12.177-03	2026-01-13 23:40:12.177-03	t	user_logout	cmk2onkxq00088jeciqxn4ulm
132444f7-12be-4708-b0a0-42917ee42525	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 00:31:34.439-03	2026-01-07 00:31:34.437-03	2026-01-14 00:31:34.437-03	f	\N	cmk2n7tmr00028jdq7ztusxri
890c4728-4359-4960-acf1-046cac737e05	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 00:31:54.775-03	2026-01-07 00:31:54.774-03	2026-01-14 00:31:54.774-03	f	\N	cmk2onkxq00088jeciqxn4ulm
a1dedecd-f5eb-4e86-ab6c-38a6e183f5cb	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 00:32:03.18-03	2026-01-07 00:32:03.179-03	2026-01-14 00:32:03.179-03	f	\N	cmk2onkxq00088jeciqxn4ulm
faf695db-8e57-4d93-9742-30067a768297	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 00:49:07.259-03	2026-01-07 00:49:07.257-03	2026-01-14 00:49:07.257-03	f	\N	cmk2n7tmr00028jdq7ztusxri
ae9340fb-d0d4-4d69-8c55-5ca9ece0e78a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 00:48:03.719-03	2026-01-07 00:48:03.718-03	2026-01-14 00:48:03.716-03	t	user_logout	cmk2onkxq00088jeciqxn4ulm
f0da971f-dbe2-4e55-b734-95691ef4e010	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 01:20:14.122-03	2026-01-07 01:20:14.12-03	2026-01-14 01:20:14.119-03	f	\N	cmk2n7tmr00028jdq7ztusxri
28a52377-5a80-4a49-9275-0df10cf18eb2	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 01:20:17.186-03	2026-01-07 01:20:17.186-03	2026-01-14 01:20:17.186-03	f	\N	cmk2onkxq00088jeciqxn4ulm
82bfb3bf-0e1c-4234-9c91-963f86573212	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 01:29:48.528-03	2026-01-07 01:29:48.525-03	2026-01-14 01:29:48.525-03	f	\N	cmk2n7tmr00028jdq7ztusxri
6214af90-8ec0-442e-9a47-40ffdc40341c	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-07 09:28:17.314-03	2026-01-07 09:28:17.313-03	2026-01-14 09:28:17.313-03	f	\N	cmk2n7tmr00028jdq7ztusxri
1f4e7585-ebb3-420a-bb65-9c717b03594d	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:11:26.209-03	2026-01-07 14:11:26.208-03	2026-01-14 14:11:26.208-03	f	\N	cmk49zbfu00008jmwkclu5bpl
f113aa5e-8a65-493a-b872-f711b268d93c	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:11:26.641-03	2026-01-07 14:11:26.64-03	2026-01-14 14:11:26.64-03	f	\N	cmk49zbsp00058jmw3z9rruk3
5d9568fa-f74e-4f24-b9e7-14a07efc12ac	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:11:27.17-03	2026-01-07 14:11:27.169-03	2026-01-14 14:11:27.169-03	f	\N	cmk49zc8v00078jmwgvr8j0ns
2fd7db87-a9f6-4bfb-bdcd-ef5aed7d5442	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:11:27.56-03	2026-01-07 14:11:27.559-03	2026-01-14 14:11:27.559-03	f	\N	cmk49zci600098jmwngygnlfz
d9acb1c2-e574-464d-82de-f9d3ed1fef64	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:11:27.952-03	2026-01-07 14:11:27.952-03	2026-01-14 14:11:27.952-03	f	\N	cmk49zctb000e8jmws4lrncmn
e647fed0-c8f5-4ec4-91d4-15a0afc7147d	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:12:36.189-03	2026-01-07 14:12:36.188-03	2026-01-14 14:12:36.188-03	f	\N	cmk4a0thx00fm8jmw7325fnt8
30895ceb-b091-4e7c-b500-34bc893cb1ba	tutor	::ffff:127.0.0.1	\N	2026-01-07 14:12:37.441-03	2026-01-07 14:12:37.44-03	2026-01-14 14:12:37.44-03	f	\N	cmk4a0uh000fq8jmw4wkltja4
27c3dfae-9c23-42b6-b777-381561681772	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:02:20.795-03	2026-01-07 16:02:20.794-03	2026-01-14 16:02:20.794-03	f	\N	cmk4dxy5300008jtevnb0h80m
3f4de8cb-b94f-4098-893b-ee989cf56a21	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:02:21.226-03	2026-01-07 16:02:21.226-03	2026-01-14 16:02:21.226-03	f	\N	cmk4dxyig00058jtejwobjgj2
20b12d67-dea2-4d6b-a6b8-5f89e3bc0984	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:02:21.748-03	2026-01-07 16:02:21.747-03	2026-01-14 16:02:21.747-03	f	\N	cmk4dxyye00078jtenlcdwfww
90efdc3f-53b9-4b33-a0a6-32c8d4061a06	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:02:22.15-03	2026-01-07 16:02:22.149-03	2026-01-14 16:02:22.149-03	f	\N	cmk4dxz7o00098jteg2rzlt74
7de19ca3-295d-49bf-a49f-b0555512619a	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:02:22.547-03	2026-01-07 16:02:22.546-03	2026-01-14 16:02:22.546-03	f	\N	cmk4dxzj3000e8jter7p87dhy
0371cff6-cd9d-4794-bc33-e54fba3e794f	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:03:28.783-03	2026-01-07 16:03:28.782-03	2026-01-14 16:03:28.782-03	f	\N	cmk4dzenz007q8jtehzk0f6se
0f149134-69db-4f58-b094-16e7b51492dc	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:03:30.163-03	2026-01-07 16:03:30.162-03	2026-01-14 16:03:30.162-03	f	\N	cmk4dzfqk007u8jteayog5co1
9d3cdff9-8d66-4911-9757-95d6afcc5793	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:07:15.031-03	2026-01-07 16:07:15.03-03	2026-01-14 16:07:15.03-03	f	\N	cmk4e495i00008ji6ma5j6o9o
e31510c1-4668-40a1-bb89-3b2edfbcb94b	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:07:15.561-03	2026-01-07 16:07:15.56-03	2026-01-14 16:07:15.56-03	f	\N	cmk4e49jz00058ji6arozeugb
a5491be3-0b3e-454b-9832-530071e1f743	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:07:16.165-03	2026-01-07 16:07:16.164-03	2026-01-14 16:07:16.164-03	f	\N	cmk4e4a3d00078ji6y4ywb5us
0877eda9-c585-4062-b1b9-0332e4d3c29f	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:07:16.607-03	2026-01-07 16:07:16.606-03	2026-01-14 16:07:16.606-03	f	\N	cmk4e4ae500098ji6ab8frhw7
4575f1bb-34d1-4bd0-8323-01a5bb07c49d	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:07:17.071-03	2026-01-07 16:07:17.07-03	2026-01-14 16:07:17.07-03	f	\N	cmk4e4aqx000e8ji6xyrs5dk0
53350933-5173-4b41-9040-dd19f8516dcf	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:08:21.842-03	2026-01-07 16:08:21.841-03	2026-01-14 16:08:21.841-03	f	\N	cmk4e5os1005a8ji6744ne8l8
ec3ea191-a34e-4a16-b3f9-d4b1492ca96e	tutor	::ffff:127.0.0.1	\N	2026-01-07 16:08:23.243-03	2026-01-07 16:08:23.242-03	2026-01-14 16:08:23.242-03	f	\N	cmk4e5pv7005e8ji6cpzxbrk9
1f94d617-27ae-479a-8765-2e61ae55a786	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 00:33:22.723-03	2026-01-08 00:33:22.721-03	2026-01-15 00:33:22.721-03	f	\N	cmk4vyyi600008j4mbtjgwe0j
10b24b94-2fe3-4413-b71c-70cc5bc0c06a	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 08:46:13.062-03	2026-01-08 08:46:13.061-03	2026-01-15 08:46:13.061-03	f	\N	cmk4vyyi600008j4mbtjgwe0j
44ed878f-76a3-4785-b81e-58e5060a2ec4	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 15:48:32.162-03	2026-01-08 15:48:32.16-03	2026-01-15 15:48:32.16-03	f	\N	cmk4vyyi600008j4mbtjgwe0j
846c1042-2c60-41d8-b600-cfcbd65fe5f6	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 16:04:48.327-03	2026-01-08 16:04:48.326-03	2026-01-15 16:04:48.326-03	f	\N	cmk5tdgv900008j8aqcljzvwp
4289944a-8100-4c76-9090-060a4c008f78	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 16:04:57.215-03	2026-01-08 16:04:57.214-03	2026-01-15 16:04:57.214-03	f	\N	cmk5tdgv900008j8aqcljzvwp
e90deb27-f226-4536-af19-9988bc60c992	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 16:06:58.367-03	2026-01-08 16:06:58.367-03	2026-01-15 16:06:58.366-03	t	user_logout	cmk5tght1000f8j8a0auxlftc
830580bc-4dd8-4914-913c-39bdfc734b1b	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 15:48:41.911-03	2026-01-08 15:48:41.91-03	2026-01-15 15:48:41.91-03	t	user_logout	cmk4vyyi600008j4mbtjgwe0j
72076f07-32c3-46ff-966a-5ecfcc05e4f8	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 16:08:17.278-03	2026-01-08 16:08:17.277-03	2026-01-15 16:08:17.276-03	f	\N	cmk5tdgv900008j8aqcljzvwp
f156e02a-6486-45ac-9702-0829e0f8dfeb	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 16:09:12.444-03	2026-01-08 16:09:12.442-03	2026-01-15 16:09:12.442-03	f	\N	cmk5tght1000f8j8a0auxlftc
e99d05b9-7b2d-4982-93eb-62ca9007f8c8	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 18:47:34.077-03	2026-01-08 18:47:34.076-03	2026-01-15 18:47:34.076-03	f	\N	cmk5tght1000f8j8a0auxlftc
a9e034d8-3c5f-41d4-b4ef-0f63f9c0c5f4	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 19:06:44.513-03	2026-01-08 19:06:44.511-03	2026-01-15 19:06:44.511-03	f	\N	cmk5tght1000f8j8a0auxlftc
ae01d26a-704b-4621-a311-68294a629669	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 19:12:43.661-03	2026-01-08 19:12:43.66-03	2026-01-15 19:12:43.66-03	t	user_logout	cmk5tght1000f8j8a0auxlftc
e2529e74-53cc-4500-99d6-741202916c90	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 19:34:26.531-03	2026-01-08 19:34:26.528-03	2026-01-15 19:34:26.528-03	f	\N	cmk5tght1000f8j8a0auxlftc
4fb72726-7692-4731-a848-4bcb3b6d4e7c	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 18:46:42.39-03	2026-01-08 18:46:42.39-03	2026-01-15 18:46:42.389-03	t	user_logout	cmk5tdgv900008j8aqcljzvwp
dd1f2c6b-35e7-48ae-aff8-a7dedaa20d38	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 19:42:50.637-03	2026-01-08 19:42:50.636-03	2026-01-15 19:42:50.636-03	f	\N	cmk4vyyi600008j4mbtjgwe0j
c87f1d03-0b16-4aa8-8506-f4b16f779f25	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 19:54:32.598-03	2026-01-08 19:54:32.596-03	2026-01-15 19:54:32.596-03	f	\N	cmk5tght1000f8j8a0auxlftc
afa4de2d-38b9-43d7-bb10-35d45a516533	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 22:16:22.331-03	2026-01-08 22:16:22.33-03	2026-01-15 22:16:22.33-03	f	\N	cmk5tght1000f8j8a0auxlftc
884e9fc8-c0ed-4889-b443-a7c9b2b7aaa7	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 23:16:03.07-03	2026-01-08 23:16:03.069-03	2026-01-15 23:16:03.069-03	f	\N	cmk5tght1000f8j8a0auxlftc
704da7f9-3196-4032-bc91-30ab0d0cd20f	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 23:18:56.3-03	2026-01-08 23:18:56.289-03	2026-01-15 23:18:56.288-03	f	\N	cmk5tght1000f8j8a0auxlftc
7c4a4baa-f4e1-41ab-8598-ffdf888c3cda	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 23:22:38.924-03	2026-01-08 23:22:38.923-03	2026-01-15 23:22:38.923-03	f	\N	cmk5tght1000f8j8a0auxlftc
0e2546a5-5062-480b-8438-4a4bdb13dc50	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 23:24:59.898-03	2026-01-08 23:24:59.897-03	2026-01-15 23:24:59.897-03	f	\N	cmk5tght1000f8j8a0auxlftc
e035af16-59c1-4c4a-bf8c-47fe0b58d995	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 23:39:38.281-03	2026-01-08 23:39:38.28-03	2026-01-15 23:39:38.279-03	f	\N	cmk5tght1000f8j8a0auxlftc
bc67066d-d1b7-44f7-8608-310490c057de	estudiante	10.0.0.6	\N	2026-01-09 07:46:49.963-03	2026-01-09 07:46:49.962-03	2026-01-16 07:46:49.962-03	f	\N	cmk6r4f0k001b8j5hvmd07mdk
9cbbc7f1-860e-4aeb-8ede-59f7eb655ccf	estudiante	10.0.0.7	\N	2026-01-09 07:46:50.483-03	2026-01-09 07:46:50.482-03	2026-01-16 07:46:50.482-03	f	\N	cmk6r4ff4001j8j5hsuadkzgw
2d3137c7-b5ef-470d-85cd-d02df895c7d6	estudiante	10.0.0.8	\N	2026-01-09 07:46:50.996-03	2026-01-09 07:46:50.996-03	2026-01-16 07:46:50.996-03	f	\N	cmk6r4fti001u8j5hktklwmkt
bd6b3d49-f534-449d-8d9a-80a95e53f2a6	estudiante	10.0.0.9	\N	2026-01-09 07:46:51.522-03	2026-01-09 07:46:51.521-03	2026-01-16 07:46:51.521-03	f	\N	cmk6r4g7q00228j5hle255j82
fc1d2d28-d220-4b6d-87bf-509847b33dd7	estudiante	10.0.0.10	\N	2026-01-09 07:46:52.028-03	2026-01-09 07:46:52.027-03	2026-01-16 07:46:52.027-03	f	\N	cmk6r4gm6002d8j5hrn95lakl
b9c18ad7-32a1-4bf8-9080-874a87219e06	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:46:53.753-03	2026-01-09 07:46:53.752-03	2026-01-16 07:46:53.752-03	f	\N	cmk6r4hy3002j8j5h5z0jocvj
a43ef8c7-3392-42ed-a339-c5778e83b863	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:46:54.208-03	2026-01-09 07:46:54.207-03	2026-01-16 07:46:54.207-03	f	\N	cmk6r4ias002o8j5hgsid8c6g
88e32575-ee30-46eb-b2d0-32bb00919955	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:46:54.782-03	2026-01-09 07:46:54.781-03	2026-01-16 07:46:54.781-03	f	\N	cmk6r4isk002q8j5h1gwoqzus
c544fe50-6eb6-4af4-9a81-1eac0e949c8c	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:46:55.208-03	2026-01-09 07:46:55.207-03	2026-01-16 07:46:55.207-03	f	\N	cmk6r4j2o002s8j5h5y2biogh
6111ade0-391f-4c31-9465-b5c43e7d63e3	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:46:55.642-03	2026-01-09 07:46:55.641-03	2026-01-16 07:46:55.641-03	f	\N	cmk6r4jer002x8j5hvuggxgmn
2fad72a7-adc6-429e-9c0b-6dd8400c60a3	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:48:24.928-03	2026-01-09 07:48:24.927-03	2026-01-16 07:48:24.927-03	f	\N	cmk6r6gc200ql8j5h6btcz1xy
329fe774-e244-4d8d-961c-c9bbb18ebabe	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:48:26.358-03	2026-01-09 07:48:26.357-03	2026-01-16 07:48:26.357-03	f	\N	cmk6r6hgd00qp8j5hybm13khz
84bd228b-97cd-4802-a2f8-3891f615820d	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:49:21.298-03	2026-01-09 07:49:21.297-03	2026-01-16 07:49:21.297-03	f	\N	cmk6r7nrj00008jaiilczo1b1
ecc2ac43-a07f-433c-b6df-33525d834d54	estudiante	10.0.0.6	\N	2026-01-09 07:50:26.077-03	2026-01-09 07:50:26.076-03	2026-01-16 07:50:26.076-03	f	\N	cmk6r91rq001p8jail30nrinh
c062ded2-bfb4-41dc-9bfb-a0f4197653be	estudiante	10.0.0.7	\N	2026-01-09 07:50:26.603-03	2026-01-09 07:50:26.602-03	2026-01-16 07:50:26.601-03	f	\N	cmk6r926d001x8jaib9o53vxl
fc221953-d50b-4445-87c9-17d448887577	estudiante	10.0.0.8	\N	2026-01-09 07:50:27.142-03	2026-01-09 07:50:27.141-03	2026-01-16 07:50:27.141-03	f	\N	cmk6r92le00288jaiuf4tg2wm
e19f918e-3429-44cf-af18-76ebda0acbe5	estudiante	10.0.0.9	\N	2026-01-09 07:50:27.668-03	2026-01-09 07:50:27.667-03	2026-01-16 07:50:27.667-03	f	\N	cmk6r92zu002g8jaiw9v1230f
a3476d67-0bf0-4712-ac46-09b67ab5139b	estudiante	10.0.0.10	\N	2026-01-09 07:50:28.193-03	2026-01-09 07:50:28.192-03	2026-01-16 07:50:28.192-03	f	\N	cmk6r93eg002r8jaivqrjmgyp
271a14d6-9cc6-4157-b581-afd5e47b77ce	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:50:58.707-03	2026-01-09 07:50:58.706-03	2026-01-16 07:50:58.706-03	f	\N	cmk6r9r0000qu8jai05sghm0n
84877ac5-c539-4741-b2f8-656e1c0ec28b	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:51:00.15-03	2026-01-09 07:51:00.149-03	2026-01-16 07:51:00.149-03	f	\N	cmk6r9s4600qy8jaij5zovnwu
9839c16c-7e5d-4227-a0b9-a77c90752548	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:54:22.368-03	2026-01-09 07:54:22.367-03	2026-01-16 07:54:22.366-03	f	\N	cmk6re43t00008jnegumhwls8
acea3964-8c42-479e-990c-1dc1254b24fd	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:54:22.805-03	2026-01-09 07:54:22.804-03	2026-01-16 07:54:22.804-03	f	\N	cmk6re4hb00058jne0y3ikziq
b6160409-bccc-46c9-b05a-11e442b6c9f4	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:54:23.325-03	2026-01-09 07:54:23.324-03	2026-01-16 07:54:23.324-03	f	\N	cmk6re4x000078jnefwwiwdzu
a1a1fab5-74ca-4c1f-8ad1-1ac4a48695ee	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:54:23.723-03	2026-01-09 07:54:23.722-03	2026-01-16 07:54:23.722-03	f	\N	cmk6re56500098jne5us3h1q4
35d6ab63-45cc-45e2-b9b1-6a1ada8c326b	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:54:24.102-03	2026-01-09 07:54:24.101-03	2026-01-16 07:54:24.101-03	f	\N	cmk6re5hb000e8jnecrkaboxl
96e56722-db39-4638-8e76-4c895d8bed81	estudiante	10.0.0.6	\N	2026-01-09 07:55:39.386-03	2026-01-09 07:55:39.385-03	2026-01-16 07:55:39.385-03	f	\N	cmk6rfrjh00de8jne47kpi2g5
15a5aa09-8f18-4576-a303-7b69a022b399	estudiante	10.0.0.7	\N	2026-01-09 07:55:39.907-03	2026-01-09 07:55:39.906-03	2026-01-16 07:55:39.906-03	f	\N	cmk6rfrxc00dm8jnen2rzthpn
410c4304-9af1-438c-a1ee-60fee0488079	estudiante	10.0.0.8	\N	2026-01-09 07:55:40.409-03	2026-01-09 07:55:40.408-03	2026-01-16 07:55:40.408-03	f	\N	cmk6rfsbj00dx8jneql548w7q
b89c5dce-373d-4009-bd25-1bd70a918e5f	tutor	::ffff:127.0.0.1	\N	2026-01-09 07:55:58.435-03	2026-01-09 07:55:58.434-03	2026-01-16 07:55:58.434-03	f	\N	cmk6rg6b400qp8jne69a52gmz
0fb02afa-85e6-4d18-b748-274c675ebefd	tutor	::ffff:127.0.0.1	\N	2026-01-09 08:01:53.904-03	2026-01-09 08:01:53.903-03	2026-01-16 08:01:53.902-03	f	\N	cmk6rnsh800008jk98wea4sk5
31a52674-5070-459e-be43-01188ab8dfaf	tutor	::ffff:127.0.0.1	\N	2026-01-09 08:01:54.409-03	2026-01-09 08:01:54.408-03	2026-01-16 08:01:54.408-03	f	\N	cmk6rnsw700058jk974bvhlvp
190c7cdb-f198-4143-8a6e-fe1ed1831c36	tutor	::ffff:127.0.0.1	\N	2026-01-09 08:01:55.023-03	2026-01-09 08:01:55.021-03	2026-01-16 08:01:55.021-03	f	\N	cmk6rntew00078jk96ikunn2y
15eac191-d5a7-4241-86f6-a63ccb04f578	tutor	::ffff:127.0.0.1	\N	2026-01-09 08:01:55.463-03	2026-01-09 08:01:55.462-03	2026-01-16 08:01:55.462-03	f	\N	cmk6rntpg00098jk9mm1pgkak
7a1f05c1-f526-4231-b13f-08b057eb961e	tutor	::ffff:127.0.0.1	\N	2026-01-09 08:01:55.924-03	2026-01-09 08:01:55.923-03	2026-01-16 08:01:55.923-03	f	\N	cmk6rnu28000e8jk9zwh6lzhx
5c4b885e-2c41-4cb1-8050-e0aa02fa353c	estudiante	10.0.0.1	\N	2026-01-09 08:03:44.086-03	2026-01-09 08:03:44.085-03	2026-01-16 08:03:44.084-03	f	\N	cmk6rq5hx006q8jyysdlqup7x
b96a3701-0de7-4421-b1ec-df07612bbb0b	estudiante	10.0.0.2	\N	2026-01-09 08:03:44.789-03	2026-01-09 08:03:44.786-03	2026-01-16 08:03:44.786-03	f	\N	cmk6rq61h00798jyy0eb0jag3
167e9b36-84be-4851-afb0-811df384bc25	estudiante	10.0.0.3	\N	2026-01-09 08:03:45.404-03	2026-01-09 08:03:45.403-03	2026-01-16 08:03:45.403-03	f	\N	cmk6rq6j3007s8jyyz3h0lp1j
c5acc54e-6876-46b6-90c1-3a0fa9dd99fc	estudiante	10.0.0.4	\N	2026-01-09 08:03:45.705-03	2026-01-09 08:03:45.704-03	2026-01-16 08:03:45.704-03	f	\N	cmk6rq6j3007s8jyyz3h0lp1j
7c0016c7-e69f-43b5-8416-1d5f36340c77	estudiante	10.0.0.14	\N	2026-01-09 08:03:47.798-03	2026-01-09 08:03:47.796-03	2026-01-16 08:03:47.796-03	f	\N	cmk6rq8dv00a68jyy4p6gsjle
35718907-d47c-4893-8a4e-7fc19fcf65ee	estudiante	10.0.0.15	\N	2026-01-09 08:03:48.307-03	2026-01-09 08:03:48.306-03	2026-01-16 08:03:48.306-03	f	\N	cmk6rq8sa00ae8jyytd71v5cc
2c019efc-0ae3-4ced-9f17-a2645d3ae0fb	estudiante	10.0.0.16	\N	2026-01-09 08:03:48.842-03	2026-01-09 08:03:48.841-03	2026-01-16 08:03:48.841-03	f	\N	cmk6rq96e00ap8jyyqzpjoywv
29d6bc46-cc2d-4bc8-993f-6d3339d33956	estudiante	10.0.0.17	\N	2026-01-09 08:03:49.355-03	2026-01-09 08:03:49.354-03	2026-01-16 08:03:49.354-03	f	\N	cmk6rq9l700ax8jyyrfwpaooy
6b6e04ae-f66f-44b9-a8d4-0d42d1d4e394	estudiante	10.0.0.18	\N	2026-01-09 08:03:49.913-03	2026-01-09 08:03:49.912-03	2026-01-16 08:03:49.912-03	f	\N	cmk6rqa0000b88jyyo6kfmzsg
9c4c60e0-6225-423f-bc52-9493ba9675b4	estudiante	192.168.100.100	\N	2026-01-09 08:04:13.984-03	2026-01-09 08:04:13.983-03	2026-01-16 08:04:13.983-03	f	\N	cmk6rqskp00wr8jyyli0n9494
2cf33d88-6ad2-402c-b2dd-49a8fe569488	estudiante	192.168.100.100	\N	2026-01-09 08:04:14.295-03	2026-01-09 08:04:14.293-03	2026-01-16 08:04:14.293-03	f	\N	cmk6rqskp00wr8jyyli0n9494
ae6b7bba-e8ca-479a-9c22-b762979fa4ab	estudiante	192.168.100.100	\N	2026-01-09 08:04:14.603-03	2026-01-09 08:04:14.601-03	2026-01-16 08:04:14.601-03	f	\N	cmk6rqskp00wr8jyyli0n9494
3ff4a34f-67b6-473a-abef-2725ef78add0	estudiante	192.168.100.100	\N	2026-01-09 08:04:14.895-03	2026-01-09 08:04:14.894-03	2026-01-16 08:04:14.894-03	f	\N	cmk6rqskp00wr8jyyli0n9494
4042977e-a168-431b-aba8-5b67bd8e9cb0	estudiante	192.168.100.100	\N	2026-01-09 08:04:15.179-03	2026-01-09 08:04:15.178-03	2026-01-16 08:04:15.178-03	f	\N	cmk6rqskp00wr8jyyli0n9494
c087f952-cf81-44fc-a9a2-e44ee959e984	estudiante	192.168.200.1	\N	2026-01-09 08:04:16.102-03	2026-01-09 08:04:16.101-03	2026-01-16 08:04:16.101-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
82730033-6229-4d19-a916-6646461e4145	estudiante	192.168.200.2	\N	2026-01-09 08:04:16.394-03	2026-01-09 08:04:16.393-03	2026-01-16 08:04:16.393-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
9f0bcf45-5d13-423f-9014-23ce271119de	estudiante	192.168.200.3	\N	2026-01-09 08:04:16.682-03	2026-01-09 08:04:16.681-03	2026-01-16 08:04:16.681-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
55b59628-3a3e-491d-a31a-ddca9c57a366	estudiante	192.168.200.4	\N	2026-01-09 08:04:16.973-03	2026-01-09 08:04:16.972-03	2026-01-16 08:04:16.972-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
a835f29e-abab-417b-8be7-f65a9c45a50a	estudiante	192.168.200.5	\N	2026-01-09 08:04:17.253-03	2026-01-09 08:04:17.253-03	2026-01-16 08:04:17.253-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
979d3975-49fe-4610-80e2-b99c902f4bdc	estudiante	192.168.200.6	\N	2026-01-09 08:04:17.549-03	2026-01-09 08:04:17.548-03	2026-01-16 08:04:17.548-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
b0e065f3-96c3-435c-aae8-ce4aae6009f5	estudiante	192.168.200.7	\N	2026-01-09 08:04:17.842-03	2026-01-09 08:04:17.84-03	2026-01-16 08:04:17.84-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
0701b26e-a907-478a-b436-8ce7898735a8	estudiante	192.168.200.8	\N	2026-01-09 08:04:18.135-03	2026-01-09 08:04:18.134-03	2026-01-16 08:04:18.134-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
7723d790-4fba-43cd-8d27-e5c6a5f25c9f	estudiante	192.168.200.9	\N	2026-01-09 08:04:18.416-03	2026-01-09 08:04:18.415-03	2026-01-16 08:04:18.415-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
e321978f-88ee-4d4a-9d5f-50a00f44b24f	estudiante	192.168.200.10	\N	2026-01-09 08:04:18.704-03	2026-01-09 08:04:18.703-03	2026-01-16 08:04:18.703-03	f	\N	cmk6rqu7t00xw8jyy2s8yduly
edda075c-5234-4c89-a0d9-ca6ca7a8bf55	estudiante	192.168.50.1	\N	2026-01-09 08:04:19.306-03	2026-01-09 08:04:19.305-03	2026-01-16 08:04:19.305-03	f	\N	cmk6rqwoz00yo8jyygbu5xzch
baed2e15-ce20-4945-8199-af86a05b129d	estudiante	192.168.50.1	\N	2026-01-09 08:04:19.599-03	2026-01-09 08:04:19.598-03	2026-01-16 08:04:19.598-03	f	\N	cmk6rqwoz00yo8jyygbu5xzch
29cb4576-7474-4d97-9d90-22a5d0ceca24	estudiante	192.168.50.1	\N	2026-01-09 08:04:19.882-03	2026-01-09 08:04:19.881-03	2026-01-16 08:04:19.881-03	f	\N	cmk6rqwoz00yo8jyygbu5xzch
a3d90ef0-e75c-46ef-af04-e58dcbc02be8	estudiante	192.168.50.1	\N	2026-01-09 08:04:20.218-03	2026-01-09 08:04:20.206-03	2026-01-16 08:04:20.206-03	f	\N	cmk6rqwoz00yo8jyygbu5xzch
f462637a-686f-4656-a854-51387847fd8e	estudiante	192.168.50.1	\N	2026-01-09 08:04:20.759-03	2026-01-09 08:04:20.757-03	2026-01-16 08:04:20.757-03	f	\N	cmk6rqwoz00yo8jyygbu5xzch
a73e3f50-e0f2-49db-b547-3fafc10ad302	estudiante	192.168.50.2	\N	2026-01-09 08:04:21.268-03	2026-01-09 08:04:21.267-03	2026-01-16 08:04:21.267-03	f	\N	cmk6rqwoz00yo8jyygbu5xzch
99cb8b96-9a18-4b67-b08c-30abc969b6fe	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:14.935-03	2026-01-09 09:15:14.934-03	2026-01-16 09:15:14.934-03	f	\N	cmk6ua4e000008j3vld58xoe3
e41a81f9-f661-49a2-b19e-43583f0c79ef	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:16.379-03	2026-01-09 09:15:16.378-03	2026-01-16 09:15:16.378-03	f	\N	cmk6ua5jb00048j3v7h834la4
2381048a-ee39-43a3-9efd-2838feeb0b4e	estudiante	10.0.0.1	\N	2026-01-09 09:15:18.596-03	2026-01-09 09:15:18.595-03	2026-01-16 09:15:18.595-03	f	\N	cmk6ua74r000h8j3vrx20w11a
da500c90-509c-43bb-b6ef-bb4166b27e9e	estudiante	10.0.0.2	\N	2026-01-09 09:15:19.242-03	2026-01-09 09:15:19.241-03	2026-01-16 09:15:19.241-03	f	\N	cmk6ua7nz000u8j3vk8wl7lnf
295d5e1e-684b-4657-9363-fc2960bdc1ff	estudiante	10.0.0.3	\N	2026-01-09 09:15:19.813-03	2026-01-09 09:15:19.812-03	2026-01-16 09:15:19.812-03	f	\N	cmk6ua84g00158j3v0w7zpmq8
be17eb70-3deb-4d18-b75c-6817e343cfbc	estudiante	10.0.0.4	\N	2026-01-09 09:15:20.41-03	2026-01-09 09:15:20.409-03	2026-01-16 09:15:20.409-03	f	\N	cmk6ua8jj001d8j3vank9cvgl
b312d34c-1aee-4297-afa6-9ca34c1259e4	estudiante	10.0.0.5	\N	2026-01-09 09:15:21.005-03	2026-01-09 09:15:21.003-03	2026-01-16 09:15:21.003-03	f	\N	cmk6ua919001o8j3vcjuhiigv
05d2e98f-0d5b-4e17-806b-837919db6d48	estudiante	10.0.0.6	\N	2026-01-09 09:15:21.539-03	2026-01-09 09:15:21.538-03	2026-01-16 09:15:21.538-03	f	\N	cmk6ua9gg001z8j3vtppdbdge
42a438cc-0ed5-4620-8106-4d9810038b72	estudiante	10.0.0.7	\N	2026-01-09 09:15:22.139-03	2026-01-09 09:15:22.138-03	2026-01-16 09:15:22.138-03	f	\N	cmk6ua9vy00278j3v15ff1fhg
298ff700-c67b-4509-8406-608c825ac52c	estudiante	10.0.0.8	\N	2026-01-09 09:15:22.804-03	2026-01-09 09:15:22.801-03	2026-01-16 09:15:22.801-03	f	\N	cmk6uaaec002f8j3vm4yd9tlm
3f085233-eafb-44b6-9e9f-2fc6492f2a92	estudiante	10.0.0.9	\N	2026-01-09 09:15:23.459-03	2026-01-09 09:15:23.458-03	2026-01-16 09:15:23.457-03	f	\N	cmk6uaawr002q8j3vendsp33c
659d8271-e52b-4313-bcd7-c1fdcf30229c	estudiante	10.0.0.10	\N	2026-01-09 09:15:24.099-03	2026-01-09 09:15:24.098-03	2026-01-16 09:15:24.098-03	f	\N	cmk6uabf100358j3vqwzp9a83
477c2cb7-bdf3-4e94-8fbf-2a583608df01	estudiante	10.0.0.11	\N	2026-01-09 09:15:24.627-03	2026-01-09 09:15:24.626-03	2026-01-16 09:15:24.626-03	f	\N	cmk6uabua003i8j3v1ehh9j5q
e05e03b5-aa8e-49f1-a464-e193f43036bb	tutor	10.0.0.12	\N	2026-01-09 09:15:25.292-03	2026-01-09 09:15:25.291-03	2026-01-16 09:15:25.291-03	f	\N	cmk6uac8i003p8j3vj79ukabn
4f523827-8a7a-4989-974d-5ea8d7c3657e	estudiante	10.0.0.13	\N	2026-01-09 09:15:25.984-03	2026-01-09 09:15:25.983-03	2026-01-16 09:15:25.983-03	f	\N	cmk6uacvs004i8j3v0aacjifi
b53398b4-f8a1-41b5-a951-dfe28794a4ff	estudiante	10.0.0.14	\N	2026-01-09 09:15:26.637-03	2026-01-09 09:15:26.637-03	2026-01-16 09:15:26.637-03	f	\N	cmk6uaddf00518j3vvcsmvria
a2d081d2-8a82-4b58-bc78-82fd41366f05	estudiante	10.0.0.15	\N	2026-01-09 09:15:27.255-03	2026-01-09 09:15:27.254-03	2026-01-16 09:15:27.254-03	f	\N	cmk6uadv4005k8j3v9796sblo
45e7c7d7-29a1-4725-82a4-68e6a3bf5ba9	estudiante	10.0.0.16	\N	2026-01-09 09:15:27.82-03	2026-01-09 09:15:27.82-03	2026-01-16 09:15:27.82-03	f	\N	cmk6uaeac005x8j3v4iur84eu
eaf0fb51-e0e3-4391-917f-422ddae396c0	estudiante	10.0.0.17	\N	2026-01-09 09:15:28.4-03	2026-01-09 09:15:28.399-03	2026-01-16 09:15:28.399-03	f	\N	cmk6uaeqa006k8j3vgq8xii1f
43b7445e-015e-443d-8d9b-25c7b2d09d4c	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:30.424-03	2026-01-09 09:15:30.423-03	2026-01-16 09:15:30.423-03	f	\N	cmk6uagb5007g8j3vio1rn803
a0a3d1fe-97e2-4d3b-9ed8-573db90e345a	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:30.9-03	2026-01-09 09:15:30.899-03	2026-01-16 09:15:30.899-03	f	\N	cmk6uagob007l8j3vaztjrgpt
9fb632e0-bfb2-43c0-bed0-f3cdcf066673	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:31.532-03	2026-01-09 09:15:31.531-03	2026-01-16 09:15:31.531-03	f	\N	cmk6uah7m007n8j3v6oe99ovj
42152d62-0349-438b-a98c-a2df9cbed6de	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:31.988-03	2026-01-09 09:15:31.987-03	2026-01-16 09:15:31.987-03	f	\N	cmk6uahir007p8j3va7cfne30
35aaa7e5-c7c3-4567-b649-0f5ca1483b2f	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:32.451-03	2026-01-09 09:15:32.45-03	2026-01-16 09:15:32.45-03	f	\N	cmk6uahvk007u8j3vrgw6b1jq
8f1c257e-a533-4f27-bc14-a6f0e5f49307	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:32.964-03	2026-01-09 09:15:32.963-03	2026-01-16 09:15:32.963-03	f	\N	cmk6uai9400848j3vvf4p42fs
f0579391-4bfc-40b7-822a-aecb5123721f	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:33.473-03	2026-01-09 09:15:33.472-03	2026-01-16 09:15:33.471-03	f	\N	cmk6uainu00898j3vevc7eljn
53a7b4d8-0945-426d-ab5a-d83d87582da9	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:33.97-03	2026-01-09 09:15:33.969-03	2026-01-16 09:15:33.969-03	f	\N	cmk6uaj1i008b8j3vxv6c6lah
fcb94e77-507b-4eeb-9490-9295df9d6240	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:15:34.843-03	2026-01-09 09:15:34.842-03	2026-01-16 09:15:34.842-03	f	\N	cmk6uajq7008i8j3vgybcdu90
10f5064c-4319-4790-8125-a4d3628c104a	estudiante	192.168.100.100	\N	2026-01-09 09:16:37.082-03	2026-01-09 09:16:37.081-03	2026-01-16 09:16:37.081-03	f	\N	cmk6ubvqn00958j3vbjuhbijp
a7b0a070-6ede-4482-985a-782248ba18ee	estudiante	192.168.100.100	\N	2026-01-09 09:16:37.381-03	2026-01-09 09:16:37.38-03	2026-01-16 09:16:37.38-03	f	\N	cmk6ubvqn00958j3vbjuhbijp
caca58f3-d8ba-416b-82b2-0bb0d1f72954	estudiante	192.168.100.100	\N	2026-01-09 09:16:37.677-03	2026-01-09 09:16:37.676-03	2026-01-16 09:16:37.676-03	f	\N	cmk6ubvqn00958j3vbjuhbijp
fedd91da-998d-4a3e-af20-5dadc545e504	estudiante	192.168.100.100	\N	2026-01-09 09:16:37.97-03	2026-01-09 09:16:37.969-03	2026-01-16 09:16:37.969-03	f	\N	cmk6ubvqn00958j3vbjuhbijp
b72c740b-ecec-4a99-a443-1658d55df1e8	estudiante	192.168.100.100	\N	2026-01-09 09:16:38.263-03	2026-01-09 09:16:38.262-03	2026-01-16 09:16:38.262-03	f	\N	cmk6ubvqn00958j3vbjuhbijp
f0941653-b680-484a-9eee-bec340da3713	estudiante	192.168.200.1	\N	2026-01-09 09:16:39.159-03	2026-01-09 09:16:39.158-03	2026-01-16 09:16:39.158-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
bf358ce2-244b-456d-a4cb-35c0c1720bd9	estudiante	192.168.200.2	\N	2026-01-09 09:16:39.442-03	2026-01-09 09:16:39.441-03	2026-01-16 09:16:39.441-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
cf900397-c749-4b5f-9a9d-45975ae4539e	estudiante	192.168.200.3	\N	2026-01-09 09:16:39.729-03	2026-01-09 09:16:39.728-03	2026-01-16 09:16:39.728-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
90f7ed5a-d0cd-4942-913f-0eaab0adb6e7	estudiante	192.168.200.4	\N	2026-01-09 09:16:40.017-03	2026-01-09 09:16:40.017-03	2026-01-16 09:16:40.017-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
b39009b9-a97a-4560-b8df-1396868eb5da	estudiante	192.168.200.5	\N	2026-01-09 09:16:40.3-03	2026-01-09 09:16:40.299-03	2026-01-16 09:16:40.299-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
330c0027-4ce1-4e37-86fe-6f2f8f442b07	estudiante	192.168.200.6	\N	2026-01-09 09:16:40.577-03	2026-01-09 09:16:40.576-03	2026-01-16 09:16:40.576-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
39773d86-d580-474f-affb-800a4ec4d1e3	estudiante	192.168.200.7	\N	2026-01-09 09:16:40.859-03	2026-01-09 09:16:40.858-03	2026-01-16 09:16:40.858-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
c828eb5f-7bb0-41c5-96cd-113ba7cf1ae5	estudiante	192.168.200.8	\N	2026-01-09 09:16:41.148-03	2026-01-09 09:16:41.147-03	2026-01-16 09:16:41.147-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
e742bc6d-db24-4a70-88a3-4a98f55e8ad7	estudiante	192.168.200.9	\N	2026-01-09 09:16:41.428-03	2026-01-09 09:16:41.427-03	2026-01-16 09:16:41.427-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
fdd869ac-2ec4-4b7d-a3c3-7f0daee6f703	estudiante	192.168.200.10	\N	2026-01-09 09:16:41.708-03	2026-01-09 09:16:41.707-03	2026-01-16 09:16:41.707-03	f	\N	cmk6ubxcj00aa8j3v3byqhml4
ed6f2944-cd6e-4d5e-8d10-3f94bae30177	estudiante	192.168.50.1	\N	2026-01-09 09:16:42.296-03	2026-01-09 09:16:42.295-03	2026-01-16 09:16:42.295-03	f	\N	cmk6ubzrq00b28j3vu7sll4lz
f2acac0c-67ec-47a0-8630-bda132d5bd7d	estudiante	192.168.50.1	\N	2026-01-09 09:16:42.591-03	2026-01-09 09:16:42.59-03	2026-01-16 09:16:42.59-03	f	\N	cmk6ubzrq00b28j3vu7sll4lz
2284c7fb-05d7-4a7a-b8f6-7e54f6f27ec8	estudiante	192.168.50.1	\N	2026-01-09 09:16:42.884-03	2026-01-09 09:16:42.883-03	2026-01-16 09:16:42.883-03	f	\N	cmk6ubzrq00b28j3vu7sll4lz
77b47866-2d0e-4d0b-9a15-e8d2af8f635c	estudiante	192.168.50.1	\N	2026-01-09 09:16:43.168-03	2026-01-09 09:16:43.167-03	2026-01-16 09:16:43.167-03	f	\N	cmk6ubzrq00b28j3vu7sll4lz
e154d6ca-9416-401e-ad89-07b5537b955f	estudiante	192.168.50.1	\N	2026-01-09 09:16:43.453-03	2026-01-09 09:16:43.452-03	2026-01-16 09:16:43.452-03	f	\N	cmk6ubzrq00b28j3vu7sll4lz
bd013cff-9162-4a56-9a14-ba516f10a9f7	estudiante	192.168.50.2	\N	2026-01-09 09:16:43.751-03	2026-01-09 09:16:43.75-03	2026-01-16 09:16:43.75-03	f	\N	cmk6ubzrq00b28j3vu7sll4lz
3c7560bb-3512-4b21-b08b-16c6ece53982	estudiante	10.0.0.1	\N	2026-01-09 09:16:45.775-03	2026-01-09 09:16:45.774-03	2026-01-16 09:16:45.774-03	f	\N	cmk6uc2g000bq8j3vo3f5hshv
5d922328-86fb-4f5b-89b5-4cd89d3352b2	estudiante	10.0.0.2	\N	2026-01-09 09:16:46.396-03	2026-01-09 09:16:46.395-03	2026-01-16 09:16:46.395-03	f	\N	cmk6uc2xg00c98j3voran910g
c67e690b-dac9-49c3-b275-9f778285457d	estudiante	10.0.0.3	\N	2026-01-09 09:16:46.994-03	2026-01-09 09:16:46.993-03	2026-01-16 09:16:46.993-03	f	\N	cmk6uc3e500cs8j3vbptjlggz
8d3b9b6f-c63d-4582-8395-e4957b59c649	estudiante	10.0.0.4	\N	2026-01-09 09:16:47.284-03	2026-01-09 09:16:47.283-03	2026-01-16 09:16:47.283-03	f	\N	cmk6uc3e500cs8j3vbptjlggz
5b1c3b31-c484-4977-85e7-d24e013d4051	estudiante	10.0.0.14	\N	2026-01-09 09:16:49.236-03	2026-01-09 09:16:49.235-03	2026-01-16 09:16:49.235-03	f	\N	cmk6uc54d00f68j3vcs9xqz9i
44db8d5a-8375-4650-aaed-eea903485341	estudiante	10.0.0.15	\N	2026-01-09 09:16:49.756-03	2026-01-09 09:16:49.755-03	2026-01-16 09:16:49.755-03	f	\N	cmk6uc5iw00fe8j3vsaevgz7m
b882a2c4-68b4-492a-aba5-9848a088b983	estudiante	10.0.0.16	\N	2026-01-09 09:16:50.259-03	2026-01-09 09:16:50.258-03	2026-01-16 09:16:50.258-03	f	\N	cmk6uc5x400fp8j3v3zqcwhot
96fb70d7-1eaa-456c-a4d2-3684cc614b3a	estudiante	10.0.0.17	\N	2026-01-09 09:16:50.771-03	2026-01-09 09:16:50.77-03	2026-01-16 09:16:50.77-03	f	\N	cmk6uc6b200fx8j3vgcxiq4wx
2f8f30e8-c080-44b8-93a6-48174510f5a6	estudiante	10.0.0.18	\N	2026-01-09 09:16:51.281-03	2026-01-09 09:16:51.28-03	2026-01-16 09:16:51.28-03	f	\N	cmk6uc6pe00g88j3vegu4ejf6
fec6b2ef-fd6b-4565-b3b1-7b1866f7929e	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:17:00.531-03	2026-01-09 09:17:00.531-03	2026-01-16 09:17:00.531-03	f	\N	cmk6ucdu100pw8j3vkzhr9abq
8c290784-03d1-42bf-b476-8eb991d5be20	estudiante	::ffff:127.0.0.1	\N	2026-01-09 09:17:01.12-03	2026-01-09 09:17:01.119-03	2026-01-16 09:17:01.119-03	f	\N	cmk6uceaj00q98j3vn8mxdhae
be75adc4-b4f8-4366-b8bd-32a45f5ad562	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:18.893-03	2026-01-09 09:20:18.892-03	2026-01-16 09:20:18.892-03	f	\N	cmk6ugmwm00008jwxd0rs5p40
9001e3a3-53df-4d59-aed7-1ead8d6d429d	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:19.342-03	2026-01-09 09:20:19.341-03	2026-01-16 09:20:19.341-03	f	\N	cmk6ugn9x00058jwx0sfixku1
55303cbd-ba26-48af-9925-771026c4c489	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:19.896-03	2026-01-09 09:20:19.895-03	2026-01-16 09:20:19.895-03	f	\N	cmk6ugnqo00078jwxmdo22zzz
0700cc0f-8edb-4e6a-a3fd-c68613db942b	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:20.297-03	2026-01-09 09:20:20.296-03	2026-01-16 09:20:20.296-03	f	\N	cmk6ugo0d00098jwxqitnjj7m
d1c15f01-5a76-433a-898c-def800c6aefc	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:20.713-03	2026-01-09 09:20:20.712-03	2026-01-16 09:20:20.712-03	f	\N	cmk6ugobv000e8jwx8ks47rzb
40c0c9c1-c847-4d64-b9da-791efe7c1153	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:21.13-03	2026-01-09 09:20:21.129-03	2026-01-16 09:20:21.129-03	f	\N	cmk6ugonm000o8jwxnag5kkjc
a021376c-367a-41b6-af42-5fca3ff1024e	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:21.55-03	2026-01-09 09:20:21.549-03	2026-01-16 09:20:21.549-03	f	\N	cmk6ugoza000t8jwxvzi12cyi
d113c720-6106-4166-aaae-f450c863cb7a	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:21.967-03	2026-01-09 09:20:21.966-03	2026-01-16 09:20:21.966-03	f	\N	cmk6ugpau000v8jwxngdanddp
003fa9df-fb52-4068-8557-8053fd8d7615	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:22.576-03	2026-01-09 09:20:22.575-03	2026-01-16 09:20:22.575-03	f	\N	cmk6ugptd00118jwx1mi3aqcz
81381a8d-61c1-4676-8b59-67a330588acc	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:22.968-03	2026-01-09 09:20:22.967-03	2026-01-16 09:20:22.967-03	f	\N	cmk6ugq2r00138jwxm88lv0sd
838e31d7-f32f-4735-b95a-5cd460bd95d5	estudiante	10.0.0.1	\N	2026-01-09 09:20:24.701-03	2026-01-09 09:20:24.7-03	2026-01-16 09:20:24.7-03	f	\N	cmk6ugrdo001q8jwxi4jkut3b
a857b119-fe4e-4d40-835b-c65963b5980a	estudiante	10.0.0.2	\N	2026-01-09 09:20:25.215-03	2026-01-09 09:20:25.214-03	2026-01-16 09:20:25.214-03	f	\N	cmk6ugrsn00238jwxrdf8us3i
f0827477-8895-4e85-8dd1-062d7f0bcd78	estudiante	10.0.0.3	\N	2026-01-09 09:20:25.712-03	2026-01-09 09:20:25.712-03	2026-01-16 09:20:25.711-03	f	\N	cmk6ugs6d002e8jwxac463ffh
6c92b72a-d0ae-4086-bf13-167e407477a7	estudiante	10.0.0.4	\N	2026-01-09 09:20:26.196-03	2026-01-09 09:20:26.195-03	2026-01-16 09:20:26.195-03	f	\N	cmk6ugsk2002m8jwx2lald6mx
39ed2d3e-8da9-4497-b1c4-80d84bd696f7	estudiante	10.0.0.5	\N	2026-01-09 09:20:26.684-03	2026-01-09 09:20:26.683-03	2026-01-16 09:20:26.683-03	f	\N	cmk6ugsxl002x8jwxvv136hrr
9895d8db-b841-4b03-98b7-8dc614ccf5bf	estudiante	10.0.0.6	\N	2026-01-09 09:20:27.17-03	2026-01-09 09:20:27.17-03	2026-01-16 09:20:27.17-03	f	\N	cmk6ugtb300388jwxuy2z5xqo
987cd580-15ee-40a2-896a-b153fd404990	estudiante	10.0.0.7	\N	2026-01-09 09:20:27.658-03	2026-01-09 09:20:27.657-03	2026-01-16 09:20:27.657-03	f	\N	cmk6ugtoj003g8jwxe64u23qs
2b8a8634-2666-412b-b451-a68df7a7d03f	estudiante	10.0.0.8	\N	2026-01-09 09:20:28.136-03	2026-01-09 09:20:28.135-03	2026-01-16 09:20:28.135-03	f	\N	cmk6ugu24003o8jwx5zwzck5d
f4020161-e612-4d64-8f64-c3c3acd2f3eb	estudiante	10.0.0.9	\N	2026-01-09 09:20:28.617-03	2026-01-09 09:20:28.616-03	2026-01-16 09:20:28.616-03	f	\N	cmk6ugufc003z8jwxuyul5a9p
e84bdfdf-8235-407b-885d-454cbc60df80	estudiante	10.0.0.10	\N	2026-01-09 09:20:29.17-03	2026-01-09 09:20:29.169-03	2026-01-16 09:20:29.169-03	f	\N	cmk6uguun004e8jwx270ze6r7
c36b1a5d-4f12-44eb-8d94-ef883cc6d6f0	estudiante	10.0.0.11	\N	2026-01-09 09:20:29.665-03	2026-01-09 09:20:29.665-03	2026-01-16 09:20:29.665-03	f	\N	cmk6ugv88004r8jwxyf656fb9
15211cd2-5da9-4a69-b19b-2b794279a2da	tutor	10.0.0.12	\N	2026-01-09 09:20:30.261-03	2026-01-09 09:20:30.261-03	2026-01-16 09:20:30.261-03	f	\N	cmk6ugvkk004y8jwx0jqaq293
7c4ea5d5-cf34-4896-b5f0-d6dec7351770	estudiante	10.0.0.13	\N	2026-01-09 09:20:30.822-03	2026-01-09 09:20:30.821-03	2026-01-16 09:20:30.821-03	f	\N	cmk6ugw4e005r8jwxup2gfn0o
69fb5d91-4ef0-450e-9ed2-2ef0a3a60c77	estudiante	10.0.0.14	\N	2026-01-09 09:20:31.388-03	2026-01-09 09:20:31.388-03	2026-01-16 09:20:31.387-03	f	\N	cmk6ugwk2006a8jwx6mw06330
79788d22-4d7f-4624-a1b4-2a0208164cce	estudiante	10.0.0.15	\N	2026-01-09 09:20:31.947-03	2026-01-09 09:20:31.946-03	2026-01-16 09:20:31.946-03	f	\N	cmk6ugwzs006t8jwxxcml588u
88d62a99-fdd9-4ee2-91c4-a7acb9670a6f	estudiante	10.0.0.16	\N	2026-01-09 09:20:32.467-03	2026-01-09 09:20:32.466-03	2026-01-16 09:20:32.466-03	f	\N	cmk6ugxe300768jwxke1hy9h3
8745ac9e-1983-49bc-97db-9716f7b562c0	estudiante	10.0.0.17	\N	2026-01-09 09:20:33.023-03	2026-01-09 09:20:33.022-03	2026-01-16 09:20:33.022-03	f	\N	cmk6ugxsa007t8jwx5zgajdbd
daac6953-9f7e-49f0-9271-156377b8edef	estudiante	192.168.100.100	\N	2026-01-09 09:20:34.82-03	2026-01-09 09:20:34.819-03	2026-01-16 09:20:34.819-03	f	\N	cmk6ugz7600908jwxehjfcoav
4c376ae5-3591-4b2f-859f-7a20204b3aef	estudiante	192.168.100.100	\N	2026-01-09 09:20:35.112-03	2026-01-09 09:20:35.111-03	2026-01-16 09:20:35.111-03	f	\N	cmk6ugz7600908jwxehjfcoav
7575041a-0857-4ab1-9752-37103a5ebe2d	estudiante	192.168.100.100	\N	2026-01-09 09:20:35.406-03	2026-01-09 09:20:35.405-03	2026-01-16 09:20:35.405-03	f	\N	cmk6ugz7600908jwxehjfcoav
e63b9ec2-cc93-4135-8c2e-da0a4f7530bb	estudiante	192.168.100.100	\N	2026-01-09 09:20:35.68-03	2026-01-09 09:20:35.679-03	2026-01-16 09:20:35.679-03	f	\N	cmk6ugz7600908jwxehjfcoav
ce0d932f-63e8-421c-9f55-bc52abf6364b	estudiante	192.168.100.100	\N	2026-01-09 09:20:35.952-03	2026-01-09 09:20:35.952-03	2026-01-16 09:20:35.952-03	f	\N	cmk6ugz7600908jwxehjfcoav
952e85f7-d1af-4704-a20f-adf411d56f74	estudiante	192.168.200.1	\N	2026-01-09 09:20:36.765-03	2026-01-09 09:20:36.765-03	2026-01-16 09:20:36.765-03	f	\N	cmk6uh0pd00a58jwx09nabe33
8b8cd57b-280c-44b2-9cc7-9ef279ae0a04	estudiante	192.168.200.2	\N	2026-01-09 09:20:37.028-03	2026-01-09 09:20:37.028-03	2026-01-16 09:20:37.028-03	f	\N	cmk6uh0pd00a58jwx09nabe33
445e11a8-138d-45bb-8f3d-afc32f4de709	estudiante	192.168.200.3	\N	2026-01-09 09:20:37.292-03	2026-01-09 09:20:37.291-03	2026-01-16 09:20:37.291-03	f	\N	cmk6uh0pd00a58jwx09nabe33
0c7686c2-5048-429d-b51e-87bc9eb0a7b7	estudiante	192.168.200.4	\N	2026-01-09 09:20:37.553-03	2026-01-09 09:20:37.552-03	2026-01-16 09:20:37.552-03	f	\N	cmk6uh0pd00a58jwx09nabe33
dca7ce26-c579-4853-a610-12f78a73ca08	estudiante	192.168.200.5	\N	2026-01-09 09:20:37.814-03	2026-01-09 09:20:37.814-03	2026-01-16 09:20:37.814-03	f	\N	cmk6uh0pd00a58jwx09nabe33
984d20d3-5597-44b8-ada7-58d11f19f6d9	estudiante	192.168.200.6	\N	2026-01-09 09:20:38.076-03	2026-01-09 09:20:38.075-03	2026-01-16 09:20:38.075-03	f	\N	cmk6uh0pd00a58jwx09nabe33
d68c4eba-b63b-4336-8584-d153fe66b1f2	estudiante	192.168.200.7	\N	2026-01-09 09:20:38.337-03	2026-01-09 09:20:38.336-03	2026-01-16 09:20:38.336-03	f	\N	cmk6uh0pd00a58jwx09nabe33
a7ef1600-a8bb-4ff1-b1f5-d2d5c4ccba93	estudiante	192.168.200.8	\N	2026-01-09 09:20:38.595-03	2026-01-09 09:20:38.594-03	2026-01-16 09:20:38.594-03	f	\N	cmk6uh0pd00a58jwx09nabe33
3610e15a-40fb-492b-a2c9-bbe705c0f33e	estudiante	192.168.200.9	\N	2026-01-09 09:20:38.857-03	2026-01-09 09:20:38.856-03	2026-01-16 09:20:38.856-03	f	\N	cmk6uh0pd00a58jwx09nabe33
a9811524-103c-4053-b677-2dae28f589d6	estudiante	192.168.200.10	\N	2026-01-09 09:20:39.118-03	2026-01-09 09:20:39.117-03	2026-01-16 09:20:39.117-03	f	\N	cmk6uh0pd00a58jwx09nabe33
4d20cbd2-a836-4b91-b5be-a06cdacabb02	estudiante	192.168.50.1	\N	2026-01-09 09:20:39.664-03	2026-01-09 09:20:39.663-03	2026-01-16 09:20:39.663-03	f	\N	cmk6uh2y000ax8jwxnsozqmtq
c5e2c6ed-c60b-4699-be65-85b673a66083	estudiante	192.168.50.1	\N	2026-01-09 09:20:39.942-03	2026-01-09 09:20:39.941-03	2026-01-16 09:20:39.941-03	f	\N	cmk6uh2y000ax8jwxnsozqmtq
62caf591-9179-49c8-b5a3-4e4583ec64fa	estudiante	192.168.50.1	\N	2026-01-09 09:20:40.246-03	2026-01-09 09:20:40.245-03	2026-01-16 09:20:40.245-03	f	\N	cmk6uh2y000ax8jwxnsozqmtq
49f1dfed-b1e7-4424-8b00-d33430aba95c	estudiante	192.168.50.1	\N	2026-01-09 09:20:40.516-03	2026-01-09 09:20:40.515-03	2026-01-16 09:20:40.515-03	f	\N	cmk6uh2y000ax8jwxnsozqmtq
f0ba7b98-30f5-411c-b43d-318c16c8bc96	estudiante	192.168.50.1	\N	2026-01-09 09:20:40.79-03	2026-01-09 09:20:40.789-03	2026-01-16 09:20:40.789-03	f	\N	cmk6uh2y000ax8jwxnsozqmtq
f3d7148e-05d9-40fa-98a7-a5ff1e76407b	estudiante	192.168.50.2	\N	2026-01-09 09:20:41.059-03	2026-01-09 09:20:41.058-03	2026-01-16 09:20:41.058-03	f	\N	cmk6uh2y000ax8jwxnsozqmtq
eb7f5254-0ac0-4b28-87f3-a1140dd11d6c	estudiante	10.0.0.1	\N	2026-01-09 09:20:42.911-03	2026-01-09 09:20:42.911-03	2026-01-16 09:20:42.91-03	f	\N	cmk6uh5fw00bl8jwx6o96818n
91905652-4933-48d7-ac7b-7beb5bd4b307	estudiante	10.0.0.2	\N	2026-01-09 09:20:43.493-03	2026-01-09 09:20:43.493-03	2026-01-16 09:20:43.493-03	f	\N	cmk6uh5w200c48jwxh0nrn8s9
06f7caa3-9093-4c7a-845a-e22229c5b613	estudiante	10.0.0.3	\N	2026-01-09 09:20:44.051-03	2026-01-09 09:20:44.05-03	2026-01-16 09:20:44.05-03	f	\N	cmk6uh6bx00cn8jwxfbjoqo2i
f4e73ef9-483d-44df-8865-0cdee939bcff	estudiante	10.0.0.4	\N	2026-01-09 09:20:44.318-03	2026-01-09 09:20:44.317-03	2026-01-16 09:20:44.317-03	f	\N	cmk6uh6bx00cn8jwxfbjoqo2i
6d0ac8ce-0612-4ba4-9df5-c221d3b3a2ab	estudiante	10.0.0.14	\N	2026-01-09 09:20:46.114-03	2026-01-09 09:20:46.114-03	2026-01-16 09:20:46.114-03	f	\N	cmk6uh7x800f18jwx7en49ml6
97748c0f-c5e3-4d55-bf5a-06d3562eb324	estudiante	10.0.0.15	\N	2026-01-09 09:20:46.634-03	2026-01-09 09:20:46.633-03	2026-01-16 09:20:46.633-03	f	\N	cmk6uh8av00f98jwx5za6nj3k
af081bfd-b165-4e57-aa37-b6f5a968d96e	estudiante	10.0.0.16	\N	2026-01-09 09:20:47.173-03	2026-01-09 09:20:47.171-03	2026-01-16 09:20:47.171-03	f	\N	cmk6uh8pi00fk8jwxa4uvpiqp
ae93907b-238a-4110-bf6a-27e81698b828	estudiante	10.0.0.17	\N	2026-01-09 09:20:47.718-03	2026-01-09 09:20:47.716-03	2026-01-16 09:20:47.716-03	f	\N	cmk6uh94f00fs8jwxmiuuncz7
6f07fb6c-1dae-4a94-a08e-3a7e9f3cca0a	estudiante	10.0.0.18	\N	2026-01-09 09:20:48.261-03	2026-01-09 09:20:48.26-03	2026-01-16 09:20:48.26-03	f	\N	cmk6uh9jd00g38jwxp18d29nw
147d1530-0d2f-4ae4-aeb5-54af43a5d0fa	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:20:55.353-03	2026-01-09 09:20:55.352-03	2026-01-16 09:20:55.352-03	f	\N	cmk6uhf2j00m68jwxo1qwcg26
163c3fa7-e3e2-4b11-9f8c-49c2f914a166	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:21:30.285-03	2026-01-09 09:21:30.284-03	2026-01-16 09:21:30.284-03	f	\N	cmk6ui5zn00pw8jwx1sqyy4hq
31c4bd9e-0800-4850-aa27-0593eefda982	estudiante	::ffff:127.0.0.1	\N	2026-01-09 09:21:30.837-03	2026-01-09 09:21:30.836-03	2026-01-16 09:21:30.836-03	f	\N	cmk6ui6fh00q98jwx9gk2zhjz
c1f5e688-509f-47b4-9d47-35326cf819a4	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:36.901-03	2026-01-09 09:31:36.9-03	2026-01-16 09:31:36.9-03	f	\N	cmk6uv63m00008jse3kxk8yg8
b0b9bd93-1410-42d2-bebb-6a4daff8aa7d	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:38.227-03	2026-01-09 09:31:38.226-03	2026-01-16 09:31:38.226-03	f	\N	cmk6uv75800048jseb3022l90
c12a5d6c-f5d2-4770-8396-eff343029c66	estudiante	10.0.0.1	\N	2026-01-09 09:31:39.968-03	2026-01-09 09:31:39.967-03	2026-01-16 09:31:39.967-03	f	\N	cmk6uv8f7000h8jsegbjm4uvx
89ca7ce8-e5d7-43ca-be93-1026d1602065	estudiante	10.0.0.2	\N	2026-01-09 09:31:40.489-03	2026-01-09 09:31:40.488-03	2026-01-16 09:31:40.488-03	f	\N	cmk6uv8u9000u8jseusm7ntqu
ad06f340-2034-4904-a3f9-8ca2ab21f4c1	estudiante	10.0.0.3	\N	2026-01-09 09:31:40.977-03	2026-01-09 09:31:40.977-03	2026-01-16 09:31:40.977-03	f	\N	cmk6uv98000158jse8dbprc4q
8a98bd3c-3ba8-4642-9661-6617e9f974eb	estudiante	10.0.0.4	\N	2026-01-09 09:31:41.462-03	2026-01-09 09:31:41.461-03	2026-01-16 09:31:41.461-03	f	\N	cmk6uv9lh001d8jsehjztcvbh
cbb58174-ac46-4db6-9f9a-0ccd9d20da91	estudiante	10.0.0.5	\N	2026-01-09 09:31:41.943-03	2026-01-09 09:31:41.942-03	2026-01-16 09:31:41.942-03	f	\N	cmk6uv9yu001o8jse50yrsd22
9dfd03fc-7bd0-4fd8-a80a-12cacb56d68b	estudiante	10.0.0.6	\N	2026-01-09 09:31:42.429-03	2026-01-09 09:31:42.428-03	2026-01-16 09:31:42.428-03	f	\N	cmk6uvac8001z8jset2aen145
6b27d449-f9f4-4b3c-a53a-b31093348a75	estudiante	10.0.0.7	\N	2026-01-09 09:31:42.91-03	2026-01-09 09:31:42.909-03	2026-01-16 09:31:42.909-03	f	\N	cmk6uvapq00278jsei3yctn1i
a799d35f-3c67-4e65-86d4-4e2d76127449	estudiante	10.0.0.8	\N	2026-01-09 09:31:43.389-03	2026-01-09 09:31:43.388-03	2026-01-16 09:31:43.388-03	f	\N	cmk6uvb2x002f8jsecoiy5yng
db5098b1-3212-4ca1-af64-bedf701c6d93	estudiante	10.0.0.9	\N	2026-01-09 09:31:43.903-03	2026-01-09 09:31:43.902-03	2026-01-16 09:31:43.902-03	f	\N	cmk6uvbh9002q8jseeqgrvz6t
d858827b-2472-4c49-9a5e-c3943d63114b	estudiante	10.0.0.10	\N	2026-01-09 09:31:44.473-03	2026-01-09 09:31:44.471-03	2026-01-16 09:31:44.471-03	f	\N	cmk6uvbwk00358jsei35kfj6r
28131e49-5323-4248-90d0-f97bdeb442a0	estudiante	10.0.0.11	\N	2026-01-09 09:31:44.973-03	2026-01-09 09:31:44.972-03	2026-01-16 09:31:44.972-03	f	\N	cmk6uvcay003i8jseyjd6xk1k
66d574e8-14b0-4405-96d5-c1591a056ead	tutor	10.0.0.12	\N	2026-01-09 09:31:45.543-03	2026-01-09 09:31:45.542-03	2026-01-16 09:31:45.542-03	f	\N	cmk6uvcn3003p8jsekrkren1g
a5729d57-c8ce-4b26-adc0-6de637569f6c	estudiante	10.0.0.13	\N	2026-01-09 09:31:46.09-03	2026-01-09 09:31:46.089-03	2026-01-16 09:31:46.089-03	f	\N	cmk6uvd65004i8jse35w3twic
590501d0-589d-4d76-84e2-fc17ee654772	estudiante	10.0.0.14	\N	2026-01-09 09:31:46.65-03	2026-01-09 09:31:46.649-03	2026-01-16 09:31:46.649-03	f	\N	cmk6uvdli00518jseiljcetrz
e5461f47-23e2-432a-a308-457fe609b0a9	estudiante	10.0.0.15	\N	2026-01-09 09:31:47.213-03	2026-01-09 09:31:47.212-03	2026-01-16 09:31:47.212-03	f	\N	cmk6uve0w005k8jse7ncp8bih
887488bf-5805-4b9b-83ed-8f45bbb84b6e	estudiante	10.0.0.16	\N	2026-01-09 09:31:47.708-03	2026-01-09 09:31:47.708-03	2026-01-16 09:31:47.708-03	f	\N	cmk6uveep005x8jseejt9oncl
bc91108c-2e98-4e67-91b4-a10c5d15dfe0	estudiante	10.0.0.17	\N	2026-01-09 09:31:48.238-03	2026-01-09 09:31:48.237-03	2026-01-16 09:31:48.237-03	f	\N	cmk6uvesv006k8jse8g0t7zpe
337d6c16-db8e-443a-997a-a7eefa9b8ca2	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:49.83-03	2026-01-09 09:31:49.829-03	2026-01-16 09:31:49.829-03	f	\N	cmk6uvg1w007g8jse9t89bvxv
15bdc28b-9ddb-42fe-884d-fb06c7b53121	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:50.258-03	2026-01-09 09:31:50.257-03	2026-01-16 09:31:50.257-03	f	\N	cmk6uvgdo007l8jsegtjr4lsk
f7beb110-e269-473f-9035-2d5dc376ffe4	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:50.791-03	2026-01-09 09:31:50.79-03	2026-01-16 09:31:50.79-03	f	\N	cmk6uvguf007n8jsemdpz35fm
9e360a48-3429-4d32-8894-b6b747def8a3	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:51.196-03	2026-01-09 09:31:51.195-03	2026-01-16 09:31:51.195-03	f	\N	cmk6uvh3t007p8jse34eakcvd
05836c26-3798-426f-a12e-0efa66f8c13e	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:51.611-03	2026-01-09 09:31:51.61-03	2026-01-16 09:31:51.61-03	f	\N	cmk6uvhfe007u8jsevqnsh26y
cc03bacb-3431-42fc-9832-9ffc53d7d9d9	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:52.024-03	2026-01-09 09:31:52.023-03	2026-01-16 09:31:52.023-03	f	\N	cmk6uvhr600848jsej1ldv5cw
0746ee5b-e7e9-4178-9bc9-65ac12bb66d6	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:52.455-03	2026-01-09 09:31:52.454-03	2026-01-16 09:31:52.454-03	f	\N	cmk6uvi2k00898jsenem91t6o
9bcba842-26c2-4c45-81df-c7b8acc8fd1f	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:52.9-03	2026-01-09 09:31:52.899-03	2026-01-16 09:31:52.899-03	f	\N	cmk6uvieu008b8jsez1e99abz
0d5e52ad-064e-4da5-b308-61459310a7a8	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:31:53.666-03	2026-01-09 09:31:53.665-03	2026-01-16 09:31:53.665-03	f	\N	cmk6uvj0c008i8jse4yc6qe13
fe7988d7-a8b9-421e-bacd-43c76da317ad	estudiante	192.168.100.100	\N	2026-01-09 09:32:55.692-03	2026-01-09 09:32:55.692-03	2026-01-16 09:32:55.691-03	f	\N	cmk6uwuuq00958jsesj5vutqv
64a44d8a-539d-4e4a-993e-8b73b50ac5a1	estudiante	192.168.100.100	\N	2026-01-09 09:32:55.975-03	2026-01-09 09:32:55.974-03	2026-01-16 09:32:55.974-03	f	\N	cmk6uwuuq00958jsesj5vutqv
4609939b-7828-4fcf-b066-2692d52d13c2	estudiante	192.168.100.100	\N	2026-01-09 09:32:56.248-03	2026-01-09 09:32:56.247-03	2026-01-16 09:32:56.247-03	f	\N	cmk6uwuuq00958jsesj5vutqv
8a1b9a0f-b9f1-498c-b60d-48da77c3e236	estudiante	192.168.100.100	\N	2026-01-09 09:32:56.519-03	2026-01-09 09:32:56.518-03	2026-01-16 09:32:56.518-03	f	\N	cmk6uwuuq00958jsesj5vutqv
eba8f722-2814-4c13-acd1-a0e43be25d7e	estudiante	192.168.100.100	\N	2026-01-09 09:32:56.791-03	2026-01-09 09:32:56.79-03	2026-01-16 09:32:56.79-03	f	\N	cmk6uwuuq00958jsesj5vutqv
2fbd1ef4-bda6-40b3-bc0a-df86df96038a	estudiante	192.168.200.1	\N	2026-01-09 09:32:57.715-03	2026-01-09 09:32:57.713-03	2026-01-16 09:32:57.713-03	f	\N	cmk6uwweq00aa8jse95f8oods
6173e38b-5c21-44e5-bea3-df61596c0d26	estudiante	192.168.200.2	\N	2026-01-09 09:32:57.997-03	2026-01-09 09:32:57.995-03	2026-01-16 09:32:57.995-03	f	\N	cmk6uwweq00aa8jse95f8oods
7c61bdea-a36c-43c4-9277-61264af05520	estudiante	192.168.200.3	\N	2026-01-09 09:32:58.304-03	2026-01-09 09:32:58.303-03	2026-01-16 09:32:58.303-03	f	\N	cmk6uwweq00aa8jse95f8oods
4a74efac-2aed-4ce7-9332-0ef8e0d25ff3	estudiante	192.168.200.4	\N	2026-01-09 09:32:58.591-03	2026-01-09 09:32:58.59-03	2026-01-16 09:32:58.59-03	f	\N	cmk6uwweq00aa8jse95f8oods
17a90d14-947f-488b-b06b-efdc2408a982	estudiante	192.168.200.5	\N	2026-01-09 09:32:58.974-03	2026-01-09 09:32:58.973-03	2026-01-16 09:32:58.973-03	f	\N	cmk6uwweq00aa8jse95f8oods
947b8fcb-729f-403c-b41e-0fe41a5d1fc0	estudiante	192.168.200.6	\N	2026-01-09 09:32:59.27-03	2026-01-09 09:32:59.268-03	2026-01-16 09:32:59.268-03	f	\N	cmk6uwweq00aa8jse95f8oods
65928c48-7dd5-40e3-8938-f2ceb12e0bcd	estudiante	192.168.200.7	\N	2026-01-09 09:32:59.57-03	2026-01-09 09:32:59.57-03	2026-01-16 09:32:59.569-03	f	\N	cmk6uwweq00aa8jse95f8oods
ddef6482-214c-42c2-92c9-90f917481e4a	estudiante	192.168.200.8	\N	2026-01-09 09:32:59.849-03	2026-01-09 09:32:59.848-03	2026-01-16 09:32:59.848-03	f	\N	cmk6uwweq00aa8jse95f8oods
a99a6d2a-99c0-497f-9b86-b01a24a685da	estudiante	192.168.200.9	\N	2026-01-09 09:33:00.134-03	2026-01-09 09:33:00.133-03	2026-01-16 09:33:00.133-03	f	\N	cmk6uwweq00aa8jse95f8oods
112619b7-64ad-4d62-9be2-525656ca7425	estudiante	192.168.200.10	\N	2026-01-09 09:33:00.443-03	2026-01-09 09:33:00.442-03	2026-01-16 09:33:00.442-03	f	\N	cmk6uwweq00aa8jse95f8oods
a3ec7157-17c3-4174-932b-d27d5cbad194	estudiante	192.168.50.1	\N	2026-01-09 09:33:01.093-03	2026-01-09 09:33:01.092-03	2026-01-16 09:33:01.092-03	f	\N	cmk6uwz0l00b28jsebqakp6y0
c98384cd-50ca-45f5-9db6-043ee4b4c6c5	estudiante	192.168.50.1	\N	2026-01-09 09:33:01.367-03	2026-01-09 09:33:01.366-03	2026-01-16 09:33:01.366-03	f	\N	cmk6uwz0l00b28jsebqakp6y0
2dafc9bf-efdb-4eae-9512-0cea67e0b77b	estudiante	192.168.50.1	\N	2026-01-09 09:33:01.661-03	2026-01-09 09:33:01.66-03	2026-01-16 09:33:01.66-03	f	\N	cmk6uwz0l00b28jsebqakp6y0
af18e9b0-9cee-4139-96c0-29243e72ced8	estudiante	192.168.50.1	\N	2026-01-09 09:33:01.933-03	2026-01-09 09:33:01.931-03	2026-01-16 09:33:01.931-03	f	\N	cmk6uwz0l00b28jsebqakp6y0
ee8b2622-ff30-400c-9cb5-8ca12e980d91	estudiante	192.168.50.1	\N	2026-01-09 09:33:02.219-03	2026-01-09 09:33:02.218-03	2026-01-16 09:33:02.218-03	f	\N	cmk6uwz0l00b28jsebqakp6y0
3eff535d-5ab5-48af-9417-dd4ca161e81c	estudiante	192.168.50.2	\N	2026-01-09 09:33:02.506-03	2026-01-09 09:33:02.505-03	2026-01-16 09:33:02.505-03	f	\N	cmk6uwz0l00b28jsebqakp6y0
7569d3ab-cf6d-4720-95af-0d038af251a5	estudiante	10.0.0.1	\N	2026-01-09 09:33:04.522-03	2026-01-09 09:33:04.521-03	2026-01-16 09:33:04.521-03	f	\N	cmk6ux1o200bq8jse2ss8vrc7
ddd83335-ac2b-4a30-97be-08c0a09ab131	estudiante	10.0.0.2	\N	2026-01-09 09:33:05.162-03	2026-01-09 09:33:05.16-03	2026-01-16 09:33:05.16-03	f	\N	cmk6ux24h00c98jsen89c43nt
36448892-dc5c-4b5c-9536-6cfa62c568a7	estudiante	10.0.0.3	\N	2026-01-09 09:33:05.728-03	2026-01-09 09:33:05.728-03	2026-01-16 09:33:05.728-03	f	\N	cmk6ux2lt00cs8jse8fr03i4g
e59d83ab-db7b-4680-a842-6a10e0c99c41	estudiante	10.0.0.4	\N	2026-01-09 09:33:05.992-03	2026-01-09 09:33:05.991-03	2026-01-16 09:33:05.991-03	f	\N	cmk6ux2lt00cs8jse8fr03i4g
96fbcfb1-2aab-412b-a15b-649524a12b0a	estudiante	10.0.0.14	\N	2026-01-09 09:33:08.019-03	2026-01-09 09:33:08.018-03	2026-01-16 09:33:08.018-03	f	\N	cmk6ux4cx00f68jsewo45ca09
8bfc4136-9ca5-4da9-a4ba-7f627178b13e	estudiante	10.0.0.15	\N	2026-01-09 09:33:08.61-03	2026-01-09 09:33:08.609-03	2026-01-16 09:33:08.608-03	f	\N	cmk6ux4rt00fe8jseu0scu0v0
19ebfbc6-ec63-46e4-bb62-148525092594	estudiante	10.0.0.17	\N	2026-01-09 09:33:09.643-03	2026-01-09 09:33:09.642-03	2026-01-16 09:33:09.642-03	f	\N	cmk6ux5mh00fx8jsec6uziq35
c88adae1-6f19-440f-be05-4b0534e10afd	estudiante	10.0.0.18	\N	2026-01-09 09:33:10.144-03	2026-01-09 09:33:10.144-03	2026-01-16 09:33:10.144-03	f	\N	cmk6ux60600g88jsepjij0cgc
3f1ef1c0-a023-4b7e-8591-c25d322b5691	estudiante	10.0.0.16	\N	2026-01-09 09:33:09.149-03	2026-01-09 09:33:09.149-03	2026-01-16 09:33:09.149-03	f	\N	cmk6ux58f00fp8jsemmgpch6q
63f80d0f-1eca-48de-8a70-07fd0df9df95	tutor	::ffff:127.0.0.1	\N	2026-01-09 09:33:19.486-03	2026-01-09 09:33:19.485-03	2026-01-16 09:33:19.485-03	f	\N	cmk6uxd8200ps8jsexfgw8wyz
68490aa1-766c-42ee-acf1-cfeeff8d6e22	estudiante	::ffff:127.0.0.1	\N	2026-01-09 09:33:20.051-03	2026-01-09 09:33:20.048-03	2026-01-16 09:33:20.048-03	f	\N	cmk6uxdnh00q58jse9lz6fgjn
afe672cd-803c-47af-8845-55c251665e28	tutor	::ffff:127.0.0.1	\N	2026-01-09 10:02:50.858-03	2026-01-09 10:02:50.857-03	2026-01-16 10:02:50.857-03	f	\N	cmk6vzbx4003l8j3l80k0ecny
cc1625ec-65ca-4fa5-85b5-2989547a9391	estudiante	::ffff:127.0.0.1	\N	2026-01-09 10:02:51.533-03	2026-01-09 10:02:51.531-03	2026-01-16 10:02:51.531-03	f	\N	cmk6vzcib003y8j3lj6w0fydo
3d9c880c-bc1e-481c-a916-f0b99be78654	estudiante	10.0.0.1	\N	2026-01-09 10:03:10.175-03	2026-01-09 10:03:10.174-03	2026-01-16 10:03:10.174-03	f	\N	cmk6vzqvb000b8jpztnu3ibch
d2062ee2-cfcc-41d0-9421-05ad7aa85149	estudiante	10.0.0.2	\N	2026-01-09 10:03:10.774-03	2026-01-09 10:03:10.773-03	2026-01-16 10:03:10.773-03	f	\N	cmk6vzrck000o8jpz2ovkqb6a
239f380e-9a2e-4169-a4c7-cfd653a889e6	estudiante	10.0.0.3	\N	2026-01-09 10:03:11.32-03	2026-01-09 10:03:11.318-03	2026-01-16 10:03:11.318-03	f	\N	cmk6vzrsr000z8jpz0ktfve0m
94009b18-4bce-4bc9-aa3e-0a7f0df5faf0	estudiante	10.0.0.4	\N	2026-01-09 10:03:11.923-03	2026-01-09 10:03:11.922-03	2026-01-16 10:03:11.922-03	f	\N	cmk6vzs8200178jpz3na7yy2o
2d944e8d-583f-49d7-b995-1bed87288dcc	estudiante	10.0.0.5	\N	2026-01-09 10:03:12.457-03	2026-01-09 10:03:12.456-03	2026-01-16 10:03:12.456-03	f	\N	cmk6vzso3001i8jpzywkrukom
d5a8409a-a4c2-44ce-8527-5f533c6c0a99	estudiante	10.0.0.6	\N	2026-01-09 10:03:12.987-03	2026-01-09 10:03:12.986-03	2026-01-16 10:03:12.986-03	f	\N	cmk6vzt31001t8jpzl87hg7lb
da54cb77-cd04-498a-a94a-130eb71d5973	estudiante	10.0.0.7	\N	2026-01-09 10:03:13.519-03	2026-01-09 10:03:13.518-03	2026-01-16 10:03:13.518-03	f	\N	cmk6vzthk00218jpzky9bl1ym
55679279-6ab1-4fce-9d48-b9b0b5fa3bf4	estudiante	10.0.0.8	\N	2026-01-09 10:03:14.093-03	2026-01-09 10:03:14.091-03	2026-01-16 10:03:14.091-03	f	\N	cmk6vztww00298jpz6bpgc247
d43a7ad9-11c4-4fb7-bfd6-58c07acf09ed	estudiante	10.0.0.9	\N	2026-01-09 10:03:14.661-03	2026-01-09 10:03:14.659-03	2026-01-16 10:03:14.659-03	f	\N	cmk6vzucx002k8jpzldpwky4f
8e6afdbf-889a-4c23-8882-48f9dc7a5031	estudiante	10.0.0.10	\N	2026-01-09 10:03:15.299-03	2026-01-09 10:03:15.298-03	2026-01-16 10:03:15.298-03	f	\N	cmk6vzuun002z8jpzdgeb4gcj
3e79b20d-5545-4efe-8b8b-91d17e408927	estudiante	10.0.0.11	\N	2026-01-09 10:03:15.845-03	2026-01-09 10:03:15.844-03	2026-01-16 10:03:15.844-03	f	\N	cmk6vzva8003c8jpzbw0l9bmq
95263002-a334-485f-ac49-3db30f225ba7	tutor	10.0.0.12	\N	2026-01-09 10:03:16.487-03	2026-01-09 10:03:16.486-03	2026-01-16 10:03:16.486-03	f	\N	cmk6vzvnr003j8jpziu3bklsc
a906ca42-52da-4cf8-ac9c-03729f12e018	estudiante	10.0.0.13	\N	2026-01-09 10:03:17.29-03	2026-01-09 10:03:17.29-03	2026-01-16 10:03:17.29-03	f	\N	cmk6vzwai004c8jpzqyhgpi2l
b8cdb505-56fb-4aef-8b4c-80ca296b9226	estudiante	10.0.0.14	\N	2026-01-09 10:03:17.996-03	2026-01-09 10:03:17.995-03	2026-01-16 10:03:17.995-03	f	\N	cmk6vzwy0004v8jpzj3vyz67d
5f166304-38a6-44a2-897c-424fa0735e8b	estudiante	10.0.0.15	\N	2026-01-09 10:03:18.621-03	2026-01-09 10:03:18.62-03	2026-01-16 10:03:18.62-03	f	\N	cmk6vzxew005e8jpzslk71cti
b9b7fa54-af4a-4791-8e0c-8765e8feb1fb	estudiante	10.0.0.16	\N	2026-01-09 10:03:19.172-03	2026-01-09 10:03:19.171-03	2026-01-16 10:03:19.171-03	f	\N	cmk6vzxuf005r8jpz08gt7fgq
10b5ef62-f80d-4696-8273-9e4ac0b2d604	estudiante	10.0.0.17	\N	2026-01-09 10:03:19.761-03	2026-01-09 10:03:19.759-03	2026-01-16 10:03:19.759-03	f	\N	cmk6vzy9z006e8jpzxvw0opvu
8bfbcdff-602c-45a0-92f3-85912e937c1f	estudiante	10.0.0.1	\N	2026-01-09 10:19:56.251-03	2026-01-09 10:19:56.25-03	2026-01-16 10:19:56.25-03	f	\N	cmk6wlb5m000b8jx7h5orduza
b3052fe7-65ce-428e-b2ea-36cc5c6c19b3	estudiante	10.0.0.2	\N	2026-01-09 10:19:56.909-03	2026-01-09 10:19:56.897-03	2026-01-16 10:19:56.897-03	f	\N	cmk6wlbob000o8jx7mu63epm0
0edb3bc0-f3f8-4d67-844a-a14708d451ec	estudiante	10.0.0.3	\N	2026-01-09 10:19:57.471-03	2026-01-09 10:19:57.47-03	2026-01-16 10:19:57.47-03	f	\N	cmk6wlc5a000z8jx7azaganxc
c2978eb4-1c00-41f1-8c1f-916f0521b8cb	estudiante	10.0.0.4	\N	2026-01-09 10:19:58.009-03	2026-01-09 10:19:58.008-03	2026-01-16 10:19:58.008-03	f	\N	cmk6wlcjx00178jx7fstuyg8c
8defe9a8-b752-40ec-9e6f-17a722d564fc	estudiante	10.0.0.5	\N	2026-01-09 10:19:58.55-03	2026-01-09 10:19:58.549-03	2026-01-16 10:19:58.549-03	f	\N	cmk6wlcz1001i8jx7xaqbq98n
d6de74ed-952d-40c3-ad69-ec492f50c62e	estudiante	10.0.0.6	\N	2026-01-09 10:19:59.115-03	2026-01-09 10:19:59.114-03	2026-01-16 10:19:59.114-03	f	\N	cmk6wldej001t8jx7vd7iulhv
b5138e9c-aa23-4a74-87ba-a7c1f8df05ea	estudiante	10.0.0.7	\N	2026-01-09 10:19:59.646-03	2026-01-09 10:19:59.645-03	2026-01-16 10:19:59.645-03	f	\N	cmk6wldtm00218jx79rijoy0z
79521485-a211-4dd2-b1c7-bd217d5fea30	estudiante	10.0.0.8	\N	2026-01-09 10:20:00.233-03	2026-01-09 10:20:00.232-03	2026-01-16 10:20:00.232-03	f	\N	cmk6wle9t00298jx7r3d5him3
8253af3e-a0e0-4a69-968a-0af9c2dc55f0	estudiante	10.0.0.9	\N	2026-01-09 10:20:00.808-03	2026-01-09 10:20:00.807-03	2026-01-16 10:20:00.807-03	f	\N	cmk6wlep3002k8jx7v76xp2yy
7119e1c2-be12-4129-a669-09b7667901d3	estudiante	10.0.0.10	\N	2026-01-09 10:20:01.494-03	2026-01-09 10:20:01.493-03	2026-01-16 10:20:01.493-03	f	\N	cmk6wlf82002z8jx7qi3ejuaw
8a95a391-341c-4f41-b644-af7f023aab0a	estudiante	10.0.0.11	\N	2026-01-09 10:20:02.055-03	2026-01-09 10:20:02.054-03	2026-01-16 10:20:02.054-03	f	\N	cmk6wlfoh003c8jx7oqemqdsy
32ec802d-781d-4e21-a37f-cdf27a2804ff	tutor	10.0.0.12	\N	2026-01-09 10:20:02.711-03	2026-01-09 10:20:02.71-03	2026-01-16 10:20:02.71-03	f	\N	cmk6wlg28003j8jx74dh2a0d0
7f328433-9bc3-4a58-879e-b4211ff63700	estudiante	10.0.0.13	\N	2026-01-09 10:20:03.339-03	2026-01-09 10:20:03.337-03	2026-01-16 10:20:03.337-03	f	\N	cmk6wlgnp004c8jx740q3pvzm
b65228e8-c1ef-48ca-92a7-dc40af96b597	estudiante	10.0.0.14	\N	2026-01-09 10:20:03.97-03	2026-01-09 10:20:03.969-03	2026-01-16 10:20:03.968-03	f	\N	cmk6wlh5c004v8jx7daxds5qb
0114b874-c51b-4de3-8c37-cd756f7b06dc	estudiante	10.0.0.15	\N	2026-01-09 10:20:04.575-03	2026-01-09 10:20:04.574-03	2026-01-16 10:20:04.574-03	f	\N	cmk6wlhmj005e8jx7f9lp43bv
e210ba4a-b0d7-4627-93d6-63a18fbb2351	estudiante	10.0.0.16	\N	2026-01-09 10:20:05.127-03	2026-01-09 10:20:05.126-03	2026-01-16 10:20:05.126-03	f	\N	cmk6wli1b005r8jx74pd0dfrh
6b816141-7c56-4280-b2f3-141ffb1065f4	estudiante	10.0.0.17	\N	2026-01-09 10:20:05.698-03	2026-01-09 10:20:05.697-03	2026-01-16 10:20:05.697-03	f	\N	cmk6wlih7006e8jx7003zx3mp
15d10530-5470-4c0e-8327-a898e4408730	estudiante	10.0.0.1	\N	2026-01-09 10:20:19.845-03	2026-01-09 10:20:19.844-03	2026-01-16 10:20:19.844-03	f	\N	cmk6wltdf000b8jmgw6tda0sj
d14395c1-c1ec-47a3-bce3-3a19ab9194e1	estudiante	10.0.0.2	\N	2026-01-09 10:20:20.423-03	2026-01-09 10:20:20.422-03	2026-01-16 10:20:20.422-03	f	\N	cmk6wltum000o8jmgtlg2ia3b
381e83d9-517e-4b9c-9cd8-40385d61a302	estudiante	10.0.0.3	\N	2026-01-09 10:20:20.956-03	2026-01-09 10:20:20.955-03	2026-01-16 10:20:20.955-03	f	\N	cmk6wlu9n000z8jmgwtwycq9i
5eeda3ec-ff5e-45ca-a4bd-16ec5bedcf5b	estudiante	10.0.0.4	\N	2026-01-09 10:20:21.48-03	2026-01-09 10:20:21.48-03	2026-01-16 10:20:21.479-03	f	\N	cmk6wluo700178jmgbfe4jg90
fe877cfe-471a-4fcc-920e-88a67a9c11b9	estudiante	10.0.0.5	\N	2026-01-09 10:20:22.006-03	2026-01-09 10:20:22.005-03	2026-01-16 10:20:22.005-03	f	\N	cmk6wlv2r001i8jmg1z4xacqd
b732b7e4-fe0b-4804-8318-aee2425e7bd7	estudiante	10.0.0.6	\N	2026-01-09 10:20:22.527-03	2026-01-09 10:20:22.526-03	2026-01-16 10:20:22.526-03	f	\N	cmk6wlvhe001t8jmgks12v368
02117e6b-d49f-49c1-afc7-aa070c5eb72a	estudiante	10.0.0.7	\N	2026-01-09 10:20:23.041-03	2026-01-09 10:20:23.04-03	2026-01-16 10:20:23.04-03	f	\N	cmk6wlvvn00218jmgd9pcjxzm
59608b6a-f14f-44b2-8597-082a72038c9d	estudiante	10.0.0.8	\N	2026-01-09 10:20:23.56-03	2026-01-09 10:20:23.559-03	2026-01-16 10:20:23.559-03	f	\N	cmk6wlwa200298jmgmr9wo1cy
99efc7ac-cb0b-4b15-9160-fe09897b8d60	estudiante	10.0.0.9	\N	2026-01-09 10:20:24.081-03	2026-01-09 10:20:24.08-03	2026-01-16 10:20:24.08-03	f	\N	cmk6wlwok002k8jmgbkzvgm3a
d42c2f57-46ec-4410-92c6-01f5ddfd42bd	estudiante	10.0.0.10	\N	2026-01-09 10:20:24.678-03	2026-01-09 10:20:24.677-03	2026-01-16 10:20:24.677-03	f	\N	cmk6wlx4y002z8jmgfup14f4l
63ebbd31-ab81-4f6a-ba2e-42007eda89c2	estudiante	10.0.0.11	\N	2026-01-09 10:20:25.206-03	2026-01-09 10:20:25.206-03	2026-01-16 10:20:25.206-03	f	\N	cmk6wlxjr003c8jmgtciecegb
8ed3c887-f042-4eb6-bd85-a952a83f0cdd	tutor	10.0.0.12	\N	2026-01-09 10:20:25.829-03	2026-01-09 10:20:25.828-03	2026-01-16 10:20:25.828-03	f	\N	cmk6wlxwx003j8jmgwlj2rknv
5f835cf2-055d-4259-a8bd-23b16c92654b	estudiante	10.0.0.13	\N	2026-01-09 10:20:26.427-03	2026-01-09 10:20:26.426-03	2026-01-16 10:20:26.426-03	f	\N	cmk6wlyhl004c8jmgkirsd19c
073b589b-35a9-4eff-acf3-1b921ad4d732	estudiante	10.0.0.14	\N	2026-01-09 10:20:27.081-03	2026-01-09 10:20:27.08-03	2026-01-16 10:20:27.08-03	f	\N	cmk6wlyz0004v8jmgw1xa421r
df33e3ac-cc67-4f91-b74b-7cb2ef1bbced	estudiante	10.0.0.15	\N	2026-01-09 10:20:27.743-03	2026-01-09 10:20:27.742-03	2026-01-16 10:20:27.742-03	f	\N	cmk6wlzhg005e8jmg8wzc5gwc
5ad3c494-e915-4e5e-b43d-2a7ab92fe0ac	estudiante	10.0.0.16	\N	2026-01-09 10:20:28.346-03	2026-01-09 10:20:28.344-03	2026-01-16 10:20:28.344-03	f	\N	cmk6wlzxl005r8jmgnkhkf4ys
921772f9-47ea-404d-80bb-f89570ef1f9b	estudiante	10.0.0.17	\N	2026-01-09 10:20:28.923-03	2026-01-09 10:20:28.922-03	2026-01-16 10:20:28.922-03	f	\N	cmk6wm0ec006e8jmgtjft8a95
5ea12e63-c206-4e33-a0ad-1ae43fb51cb4	tutor	::ffff:127.0.0.1	\N	2026-01-09 20:29:10.587-03	2026-01-09 20:29:10.586-03	2026-01-16 20:29:10.586-03	f	\N	cmk7icsof003l8jmpzectvt9s
1190b914-e287-41c2-bd24-e3c817de66ed	estudiante	::ffff:127.0.0.1	\N	2026-01-09 20:29:11.211-03	2026-01-09 20:29:11.21-03	2026-01-16 20:29:11.21-03	f	\N	cmk7ict6p003y8jmpsuss0mp7
f869d044-17b2-40c3-b45f-d2a48fb8d464	estudiante	10.0.0.1	\N	2026-01-09 20:29:13.523-03	2026-01-09 20:29:13.522-03	2026-01-16 20:29:13.522-03	f	\N	cmk7icuyo005a8jmpmqfxzw9c
7f53b860-ad0d-4600-923b-dd0732e7cd3c	estudiante	10.0.0.2	\N	2026-01-09 20:29:14.353-03	2026-01-09 20:29:14.352-03	2026-01-16 20:29:14.352-03	f	\N	cmk7icvm500628jmp620yobgh
750b4d64-1ed7-49ae-944b-8bf879bfac5f	tutor	10.0.0.3	\N	2026-01-09 20:29:15.038-03	2026-01-09 20:29:15.037-03	2026-01-16 20:29:15.037-03	f	\N	cmk7icvz300688jmpbushr40u
631465ba-f6e4-420b-91ed-ec4248da6c32	estudiante	10.0.0.4	\N	2026-01-09 20:29:15.663-03	2026-01-09 20:29:15.662-03	2026-01-16 20:29:15.662-03	f	\N	cmk7icwm500738jmpuo8xp60h
a7a7f12f-d390-4955-937a-e4459ab627d2	estudiante	10.0.0.5	\N	2026-01-09 20:29:16.267-03	2026-01-09 20:29:16.266-03	2026-01-16 20:29:16.266-03	f	\N	cmk7icx3f007m8jmp3tzhntac
464ae010-272f-4df6-8f1c-ca0622f72c13	estudiante	10.0.0.6	\N	2026-01-09 20:29:16.871-03	2026-01-09 20:29:16.871-03	2026-01-16 20:29:16.871-03	f	\N	cmk7icxk900858jmps1wrdk9a
a255c35d-4133-4d5c-a329-6853d57cd634	estudiante	10.0.0.7	\N	2026-01-09 20:29:17.49-03	2026-01-09 20:29:17.489-03	2026-01-16 20:29:17.489-03	f	\N	cmk7icy13008o8jmph6zfb2hd
58e56f63-aa0e-49b5-9aba-6c4d9dc27bb7	estudiante	10.0.0.1	\N	2026-01-09 20:29:19.516-03	2026-01-09 20:29:19.515-03	2026-01-16 20:29:19.515-03	f	\N	cmk7iczh400978jmpxju0gimc
53e28698-e4bc-4819-bf63-b084a879b198	estudiante	10.0.0.2	\N	2026-01-09 20:29:20.153-03	2026-01-09 20:29:20.152-03	2026-01-16 20:29:20.152-03	f	\N	cmk7id03700a18jmpyplcf7w3
f7f69cf2-7d17-455a-a560-a9295a06fa95	estudiante	10.0.0.3	\N	2026-01-09 20:29:20.907-03	2026-01-09 20:29:20.906-03	2026-01-16 20:29:20.906-03	f	\N	cmk7id0k900am8jmpg3gj1jfk
6af99109-989a-458f-9d58-aa0f45461fcb	tutor	10.0.0.4	\N	2026-01-09 20:29:21.398-03	2026-01-09 20:29:21.397-03	2026-01-16 20:29:21.397-03	f	\N	cmk7id11o00b78jmpj90esm1p
35bd1b75-1ca0-413b-91a1-6cf79ae58a47	estudiante	10.0.0.5	\N	2026-01-09 20:29:21.91-03	2026-01-09 20:29:21.909-03	2026-01-16 20:29:21.909-03	f	\N	cmk7id1g600bb8jmpr9h746dw
4903239c-7f7e-47fb-a926-60bac9b23b1a	estudiante	10.0.0.6	\N	2026-01-09 20:29:22.519-03	2026-01-09 20:29:22.518-03	2026-01-16 20:29:22.518-03	f	\N	cmk7id1wx00bs8jmpcdi4v6er
a1266a07-cacb-4e35-9c78-3e1ce8d5077a	estudiante	10.0.0.7	\N	2026-01-09 20:29:23.319-03	2026-01-09 20:29:23.318-03	2026-01-16 20:29:23.318-03	f	\N	cmk7id2dy00cb8jmpgmzw9mjn
779c07fa-7fd8-4a5e-a449-3a4b0e58254c	estudiante	10.0.0.8	\N	2026-01-09 20:29:24.074-03	2026-01-09 20:29:24.073-03	2026-01-16 20:29:24.073-03	f	\N	cmk7id30500dd8jmp5feff6f5
41d7bcc6-88f6-4cee-b151-bfa5d9febce5	estudiante	10.0.0.1	\N	2026-01-09 20:29:26.051-03	2026-01-09 20:29:26.05-03	2026-01-16 20:29:26.05-03	f	\N	cmk7id4ma00e98jmptv6umc0o
c9676715-bfa0-48f4-adbe-6b0ffb24f065	estudiante	10.0.0.2	\N	2026-01-09 20:29:26.776-03	2026-01-09 20:29:26.774-03	2026-01-16 20:29:26.774-03	f	\N	cmk7id56o00f68jmpstnguzl4
47721256-d5f7-4013-9d55-da28128b44c3	estudiante	10.0.0.3	\N	2026-01-09 20:29:27.48-03	2026-01-09 20:29:27.479-03	2026-01-16 20:29:27.479-03	f	\N	cmk7id5q800g38jmpcttb7ltc
c0f7bd30-8dfd-4b22-b3fc-b0094e638f44	estudiante	10.0.0.4	\N	2026-01-09 20:29:28.014-03	2026-01-09 20:29:28.013-03	2026-01-16 20:29:28.013-03	f	\N	cmk7id65u00h08jmp08bwpe8t
2b3f5e10-86d9-4864-ac21-bafb1511bbef	estudiante	10.0.0.5	\N	2026-01-09 20:29:28.625-03	2026-01-09 20:29:28.624-03	2026-01-16 20:29:28.624-03	f	\N	cmk7id6mi00he8jmpooe6dbaa
a00dd508-a324-4c09-85ba-f25bc4b1a393	estudiante	10.0.0.6	\N	2026-01-09 20:29:29.318-03	2026-01-09 20:29:29.317-03	2026-01-16 20:29:29.317-03	f	\N	cmk7id75d00hv8jmpjzv49air
3a531a15-869c-4b0c-a4f6-e523750c484c	tutor	10.0.0.7	\N	2026-01-09 20:29:29.794-03	2026-01-09 20:29:29.793-03	2026-01-16 20:29:29.793-03	f	\N	cmk7id7j200ih8jmpyaskzjtx
6f1ad7d0-9c28-474e-ad95-79efed89b763	estudiante	10.0.0.1	\N	2026-01-09 20:29:31.718-03	2026-01-09 20:29:31.717-03	2026-01-16 20:29:31.717-03	f	\N	cmk7id90600il8jmpnk1y19py
583b10f9-4ed9-46af-a1e3-5f84d6740c50	estudiante	10.0.0.2	\N	2026-01-09 20:29:32.267-03	2026-01-09 20:29:32.266-03	2026-01-16 20:29:32.266-03	f	\N	cmk7id9fr00it8jmpnobswsfx
e5d5995d-5d44-48c9-99a6-9cabc28c0620	estudiante	10.0.0.3	\N	2026-01-09 20:29:32.811-03	2026-01-09 20:29:32.811-03	2026-01-16 20:29:32.811-03	f	\N	cmk7id9uj00j18jmpgj6567cc
2d1318bc-2bd8-4da6-a387-de29d919dd57	estudiante	10.0.0.4	\N	2026-01-09 20:29:33.373-03	2026-01-09 20:29:33.372-03	2026-01-16 20:29:33.372-03	f	\N	cmk7ida9l00jf8jmpaw2g5qch
1fc683f5-adce-4b8b-87a8-11a8962ac4de	estudiante	10.0.0.5	\N	2026-01-09 20:29:33.904-03	2026-01-09 20:29:33.903-03	2026-01-16 20:29:33.903-03	f	\N	cmk7idap700k88jmp533q2fqo
ade9ea7a-35fb-4f8e-9927-5a510f2ff4b0	estudiante	10.0.0.6	\N	2026-01-09 20:29:34.448-03	2026-01-09 20:29:34.447-03	2026-01-16 20:29:34.447-03	f	\N	cmk7idb3u00kk8jmptotywdhe
0d8ff73f-aacb-4df4-a778-6a38cda860c3	tutor	10.0.0.7	\N	2026-01-09 20:29:34.91-03	2026-01-09 20:29:34.91-03	2026-01-16 20:29:34.91-03	f	\N	cmk7idbhc00lk8jmpv2s1o7eb
f4e8fa94-2c09-44df-8632-46ec4b68697e	estudiante	10.0.0.8	\N	2026-01-09 20:29:35.429-03	2026-01-09 20:29:35.429-03	2026-01-16 20:29:35.429-03	f	\N	cmk7idbvk00lo8jmprx4ifpyu
6d211af1-6460-4305-9c62-3c3a2e927981	estudiante	10.0.0.9	\N	2026-01-09 20:29:35.969-03	2026-01-09 20:29:35.968-03	2026-01-16 20:29:35.968-03	f	\N	cmk7idcae00lw8jmp3dlyk7xx
49c3675d-0970-4de3-83ad-253324ddbc1a	estudiante	10.0.0.1	\N	2026-01-09 20:29:37.962-03	2026-01-09 20:29:37.961-03	2026-01-16 20:29:37.961-03	f	\N	cmk7iddtc00md8jmpp6vdafi0
fbdd3e5c-27a1-4e55-89b9-9051120bae31	estudiante	10.0.0.3	\N	2026-01-09 20:29:38.695-03	2026-01-09 20:29:38.694-03	2026-01-16 20:29:38.694-03	f	\N	cmk7ideeb00n08jmppseqjew7
ea945e5c-c437-40f2-b78f-949ab7b13efd	estudiante	10.0.0.4	\N	2026-01-09 20:29:39.228-03	2026-01-09 20:29:39.227-03	2026-01-16 20:29:39.227-03	f	\N	cmk7idet500n88jmpo8nn92dr
4ee17769-9ded-43a4-99bd-e326db465209	estudiante	10.0.0.5	\N	2026-01-09 20:29:39.751-03	2026-01-09 20:29:39.75-03	2026-01-16 20:29:39.75-03	f	\N	cmk7idf7u00nj8jmpp0id1bur
1652d353-2436-49a6-b31c-43c51715f87f	estudiante	10.0.0.6	\N	2026-01-09 20:29:40.288-03	2026-01-09 20:29:40.286-03	2026-01-16 20:29:40.286-03	f	\N	cmk7idfmg00nu8jmpfivx5gie
c1518cf0-a2a2-4ab6-848e-815882026abd	estudiante	10.0.0.7	\N	2026-01-09 20:29:40.814-03	2026-01-09 20:29:40.814-03	2026-01-16 20:29:40.814-03	f	\N	cmk7idg1b00o28jmp5yfa8di7
d8d3c77c-6a73-48af-90ff-bcaaf90b85fc	estudiante	10.0.0.8	\N	2026-01-09 20:29:41.337-03	2026-01-09 20:29:41.336-03	2026-01-16 20:29:41.336-03	f	\N	cmk7idgfr00oa8jmppl7wqs5k
d36c7c4a-88af-4654-afdd-c655ef7cad1a	estudiante	10.0.0.9	\N	2026-01-09 20:29:41.863-03	2026-01-09 20:29:41.863-03	2026-01-16 20:29:41.863-03	f	\N	cmk7idgug00ol8jmp5iyvzv7g
22a5ad03-8cda-42de-9134-351f330a2110	estudiante	10.0.0.10	\N	2026-01-09 20:29:42.477-03	2026-01-09 20:29:42.476-03	2026-01-16 20:29:42.476-03	f	\N	cmk7idhb300p08jmpldqkfffd
7911406d-a137-489f-a601-c2ee5560d10c	estudiante	10.0.0.11	\N	2026-01-09 20:29:43.012-03	2026-01-09 20:29:43.011-03	2026-01-16 20:29:43.011-03	f	\N	cmk7idhq900pd8jmptdmma4yl
0f87e0a0-65a3-4db6-8fe7-865f2c7f52fb	tutor	10.0.0.12	\N	2026-01-09 20:29:43.645-03	2026-01-09 20:29:43.644-03	2026-01-16 20:29:43.644-03	f	\N	cmk7idi3q00pk8jmpcz5zibzx
4c0a7eb1-c32b-440a-a953-487dd0d69676	estudiante	10.0.0.13	\N	2026-01-09 20:29:44.246-03	2026-01-09 20:29:44.245-03	2026-01-16 20:29:44.245-03	f	\N	cmk7idiok00qd8jmphlxjwba9
f4bce416-acc3-4fce-9d5d-46d12f3f1e9e	estudiante	10.0.0.14	\N	2026-01-09 20:29:44.853-03	2026-01-09 20:29:44.852-03	2026-01-16 20:29:44.852-03	f	\N	cmk7idj5f00qw8jmp25gixzad
24e9ca68-b91b-4073-a29c-e5534cc209b3	estudiante	10.0.0.15	\N	2026-01-09 20:29:45.465-03	2026-01-09 20:29:45.464-03	2026-01-16 20:29:45.464-03	f	\N	cmk7idjmf00rf8jmp8l3mjcwr
df5cd987-c5d9-4412-ad54-6822e12646c2	estudiante	10.0.0.16	\N	2026-01-09 20:29:46.015-03	2026-01-09 20:29:46.014-03	2026-01-16 20:29:46.014-03	f	\N	cmk7idk1900rs8jmprhrv9sl9
b861cb14-32e7-4750-a566-9cbf99c7a8d9	estudiante	10.0.0.17	\N	2026-01-09 20:29:46.591-03	2026-01-09 20:29:46.59-03	2026-01-16 20:29:46.59-03	f	\N	cmk7idkgz00sf8jmp5q4cjj8k
d04de546-072d-40b3-86e1-1eef0985c05b	estudiante	10.0.0.3	\N	2026-01-09 20:29:49.342-03	2026-01-09 20:29:49.341-03	2026-01-16 20:29:49.341-03	f	\N	cmk7idmlc00vc8jmpni5o4gf1
eab79396-b7d0-42cd-b1d2-221a711c70de	estudiante	10.0.0.4	\N	2026-01-09 20:29:50.069-03	2026-01-09 20:29:50.068-03	2026-01-16 20:29:50.068-03	f	\N	cmk7idn5u00wb8jmpm68p6bm6
73c4f715-c420-44e4-b237-cbd5431a42e1	tutor	10.0.0.6	\N	2026-01-09 20:29:51.185-03	2026-01-09 20:29:51.185-03	2026-01-16 20:29:51.185-03	f	\N	cmk7ido1d00y58jmp3lwb2ssx
5e62ee04-f013-4f6e-a42a-9fb123abb3e0	estudiante	10.0.0.7	\N	2026-01-09 20:29:51.698-03	2026-01-09 20:29:51.697-03	2026-01-16 20:29:51.697-03	f	\N	cmk7idofk00y98jmpjguwey82
e69fd7b5-318f-43cb-83ef-3ce4358aed54	estudiante	10.0.0.8	\N	2026-01-09 20:29:52.381-03	2026-01-09 20:29:52.381-03	2026-01-16 20:29:52.381-03	f	\N	cmk7idoy500yo8jmp04ryvepl
80663c9a-1b76-45e3-bd80-3edaebddb838	estudiante	10.0.0.9	\N	2026-01-09 20:29:53.071-03	2026-01-09 20:29:53.07-03	2026-01-16 20:29:53.07-03	f	\N	cmk7idphc00zj8jmpff4xoxm5
c41bebae-ae4a-483a-be3c-a6cf04449833	estudiante	10.0.0.10	\N	2026-01-09 20:29:53.9-03	2026-01-09 20:29:53.899-03	2026-01-16 20:29:53.899-03	f	\N	cmk7idq4q01158jmpfiyar4o2
51aaecb1-d0ab-4af0-ab46-99a3794759c9	estudiante	10.0.0.11	\N	2026-01-09 20:29:54.581-03	2026-01-09 20:29:54.58-03	2026-01-16 20:29:54.58-03	f	\N	cmk7idqnd011k8jmp22f4ljli
1d04faa5-6db6-4af4-80aa-a9939edd9ef9	estudiante	10.0.0.3	\N	2026-01-09 20:30:27.702-03	2026-01-09 20:30:27.702-03	2026-01-16 20:30:27.701-03	f	\N	cmk7ieg7301418jmpzg7yk0q8
fad7daaf-63d0-4202-86a4-05515b129df8	estudiante	10.0.0.4	\N	2026-01-09 20:30:28.78-03	2026-01-09 20:30:28.779-03	2026-01-16 20:30:28.779-03	f	\N	cmk7iegxk014x8jmp96uqdf9l
e3a410d5-9a63-4383-9892-a7af60e80fae	estudiante	10.0.0.6	\N	2026-01-09 20:30:30.404-03	2026-01-09 20:30:30.404-03	2026-01-16 20:30:30.404-03	f	\N	cmk7iei29016m8jmp9r65z56x
6d70085b-6cf1-4d36-bac8-9b80f4338a0b	estudiante	10.0.0.7	\N	2026-01-09 20:30:30.76-03	2026-01-09 20:30:30.759-03	2026-01-16 20:30:30.759-03	f	\N	cmk7iei6g01768jmp15fzl90y
be7798ed-1769-4778-ac58-8d4447b6e45d	estudiante	10.0.0.8	\N	2026-01-09 20:30:31.11-03	2026-01-09 20:30:31.108-03	2026-01-16 20:30:31.108-03	f	\N	cmk7ieiaj017f8jmpublhtb9s
1f9535b9-e7cc-4f04-8c1a-a595682d99df	estudiante	10.0.0.9	\N	2026-01-09 20:30:31.904-03	2026-01-09 20:30:31.904-03	2026-01-16 20:30:31.904-03	f	\N	cmk7iejbz01868jmpfeyg1kym
28ee0ce3-6b80-45e1-8ea4-4f5e98524fcb	estudiante	10.0.0.10	\N	2026-01-09 20:30:32.943-03	2026-01-09 20:30:32.942-03	2026-01-16 20:30:32.942-03	f	\N	cmk7iek4i019y8jmp7ui4dnyo
943f8ada-f0df-4f3d-a1a4-156527863096	estudiante	10.0.0.12	\N	2026-01-09 20:30:33.682-03	2026-01-09 20:30:33.678-03	2026-01-16 20:30:33.678-03	f	\N	cmk7iektc01be8jmp8oejhy0k
e594fd58-b00d-4e2b-8da0-a47ae8de1cc4	estudiante	10.0.0.11	\N	2026-01-09 20:30:33.685-03	2026-01-09 20:30:33.681-03	2026-01-16 20:30:33.681-03	f	\N	cmk7iektc01be8jmp8oejhy0k
26480d2a-6a9e-48c7-9a6e-8bdfd1f6d774	estudiante	10.0.0.13	\N	2026-01-09 20:30:33.703-03	2026-01-09 20:30:33.702-03	2026-01-16 20:30:33.702-03	f	\N	cmk7iektc01be8jmp8oejhy0k
d6c2de90-039b-494e-be01-ca59df1c0403	estudiante	10.0.0.3	\N	2026-01-09 20:31:07.133-03	2026-01-09 20:31:07.131-03	2026-01-16 20:31:07.131-03	f	\N	cmk7ifaih01dz8jmpjalod88t
bae15e75-a458-4860-bde8-9b00ef8be375	estudiante	10.0.0.4	\N	2026-01-09 20:31:08.022-03	2026-01-09 20:31:08.021-03	2026-01-16 20:31:08.021-03	f	\N	cmk7ifb6x01et8jmpapbcidzi
6f538bd2-6afb-467f-af6d-138bd156287c	estudiante	10.0.0.6	\N	2026-01-09 20:31:08.807-03	2026-01-09 20:31:08.805-03	2026-01-16 20:31:08.805-03	f	\N	cmk7ifbt001fp8jmphyovskay
33b58804-838f-4900-8194-9f19648fe056	estudiante	10.0.0.7	\N	2026-01-09 20:31:09.768-03	2026-01-09 20:31:09.767-03	2026-01-16 20:31:09.767-03	f	\N	cmk7ifchw01gz8jmp97eb1nao
eaa7e837-7636-422d-9317-43e32abadb5c	estudiante	10.0.0.8	\N	2026-01-09 20:31:10.548-03	2026-01-09 20:31:10.547-03	2026-01-16 20:31:10.547-03	f	\N	cmk7ifd9l01ib8jmp31tmw3q4
9f012bde-91a1-4e6d-ae1e-3a1834bbc4db	tutor	10.0.0.9	\N	2026-01-09 20:31:11.026-03	2026-01-09 20:31:11.026-03	2026-01-16 20:31:11.026-03	f	\N	cmk7ifdn201il8jmpb9bzrxjg
71b89eb6-8c2b-4387-ab33-d5636376f99a	estudiante	10.0.0.10	\N	2026-01-09 20:31:11.791-03	2026-01-09 20:31:11.79-03	2026-01-16 20:31:11.79-03	f	\N	cmk7ife3q01iy8jmpzp9oteek
0aa8247f-35e8-47e2-82a1-6d4858e6f5e8	estudiante	10.0.0.11	\N	2026-01-09 20:31:12.475-03	2026-01-09 20:31:12.474-03	2026-01-16 20:31:12.474-03	f	\N	cmk7ifer201jq8jmpohmvb8bs
99e736e6-c08f-4c15-9a0a-77fb59f64bf5	estudiante	10.0.0.12	\N	2026-01-09 20:31:13.233-03	2026-01-09 20:31:13.232-03	2026-01-16 20:31:13.232-03	f	\N	cmk7iff8d01k98jmpx17n1zj5
d18344ff-2808-4aeb-8ccf-1a10e7cfbb18	estudiante	192.168.100.100	\N	2026-01-09 20:31:45.468-03	2026-01-09 20:31:45.467-03	2026-01-16 20:31:45.467-03	f	\N	cmk7ig47c01l38jmpeopty91a
2e5ae209-9e79-4fc2-9a5b-09620d3af97c	estudiante	192.168.100.100	\N	2026-01-09 20:31:45.774-03	2026-01-09 20:31:45.773-03	2026-01-16 20:31:45.773-03	f	\N	cmk7ig47c01l38jmpeopty91a
392561ed-fafe-48b4-b0fa-8cf70136e0d4	estudiante	192.168.100.100	\N	2026-01-09 20:31:46.064-03	2026-01-09 20:31:46.063-03	2026-01-16 20:31:46.063-03	f	\N	cmk7ig47c01l38jmpeopty91a
c4ade239-e766-4299-a348-5ab78d291510	estudiante	192.168.100.100	\N	2026-01-09 20:31:46.364-03	2026-01-09 20:31:46.363-03	2026-01-16 20:31:46.363-03	f	\N	cmk7ig47c01l38jmpeopty91a
624eec43-3172-4bb8-9064-fe8214d65c68	estudiante	192.168.100.100	\N	2026-01-09 20:31:46.652-03	2026-01-09 20:31:46.651-03	2026-01-16 20:31:46.651-03	f	\N	cmk7ig47c01l38jmpeopty91a
d29ec855-6a79-4aa6-9433-e5a7782bcd6a	estudiante	192.168.200.1	\N	2026-01-09 20:31:47.579-03	2026-01-09 20:31:47.579-03	2026-01-16 20:31:47.579-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
2ef37cff-4341-483d-8c83-286a8b8b6295	estudiante	192.168.200.2	\N	2026-01-09 20:31:47.866-03	2026-01-09 20:31:47.865-03	2026-01-16 20:31:47.865-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
003922f9-0d63-4b52-bc40-901eeb590953	estudiante	192.168.200.3	\N	2026-01-09 20:31:48.155-03	2026-01-09 20:31:48.154-03	2026-01-16 20:31:48.154-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
cccded0c-796e-4979-8c6d-f9529d74e10e	estudiante	192.168.200.4	\N	2026-01-09 20:31:48.443-03	2026-01-09 20:31:48.442-03	2026-01-16 20:31:48.442-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
014e8c7e-aedd-4e57-8b7f-45319ab18fdc	estudiante	192.168.200.5	\N	2026-01-09 20:31:48.722-03	2026-01-09 20:31:48.721-03	2026-01-16 20:31:48.721-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
74b5e88a-5ed6-4d69-92cb-414d22c3cd6e	estudiante	192.168.200.6	\N	2026-01-09 20:31:49.008-03	2026-01-09 20:31:49.007-03	2026-01-16 20:31:49.007-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
0673b162-be9d-4509-a6c9-915778d2c24e	estudiante	192.168.200.7	\N	2026-01-09 20:31:49.29-03	2026-01-09 20:31:49.29-03	2026-01-16 20:31:49.29-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
d695ad42-ae0b-4b95-9652-42cb895834a6	estudiante	192.168.200.8	\N	2026-01-09 20:31:49.572-03	2026-01-09 20:31:49.57-03	2026-01-16 20:31:49.57-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
e43d8b05-6b4d-4356-92d7-ae5655b2656d	estudiante	192.168.200.9	\N	2026-01-09 20:31:49.853-03	2026-01-09 20:31:49.852-03	2026-01-16 20:31:49.852-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
c1340088-0da8-4234-9be0-415f703449f2	estudiante	192.168.200.10	\N	2026-01-09 20:31:50.14-03	2026-01-09 20:31:50.139-03	2026-01-16 20:31:50.139-03	f	\N	cmk7ig5u501m88jmp47x2jf2r
69209dfa-8528-468d-891f-491221a5fdd1	estudiante	192.168.50.1	\N	2026-01-09 20:31:50.793-03	2026-01-09 20:31:50.793-03	2026-01-16 20:31:50.792-03	f	\N	cmk7ig8ag01n08jmpu4f0zivw
49666d52-61c7-4b0a-ba43-611a346800c7	estudiante	192.168.50.1	\N	2026-01-09 20:31:51.097-03	2026-01-09 20:31:51.096-03	2026-01-16 20:31:51.096-03	f	\N	cmk7ig8ag01n08jmpu4f0zivw
f54ba562-a3a7-44f0-bf9c-fe86869b1c83	estudiante	192.168.50.1	\N	2026-01-09 20:31:51.409-03	2026-01-09 20:31:51.407-03	2026-01-16 20:31:51.407-03	f	\N	cmk7ig8ag01n08jmpu4f0zivw
a1ca3217-85d7-4333-b11c-9c1cf7de5526	estudiante	192.168.50.1	\N	2026-01-09 20:31:51.861-03	2026-01-09 20:31:51.86-03	2026-01-16 20:31:51.86-03	f	\N	cmk7ig8ag01n08jmpu4f0zivw
960b37b1-79a4-4923-9cff-4c7710dc8ea5	estudiante	192.168.50.1	\N	2026-01-09 20:31:52.163-03	2026-01-09 20:31:52.161-03	2026-01-16 20:31:52.161-03	f	\N	cmk7ig8ag01n08jmpu4f0zivw
11f065ca-0a52-4598-a867-fc52c9fe8175	estudiante	192.168.50.2	\N	2026-01-09 20:31:52.512-03	2026-01-09 20:31:52.509-03	2026-01-16 20:31:52.509-03	f	\N	cmk7ig8ag01n08jmpu4f0zivw
0a25930e-c4df-4e8e-aa83-79d57dcc9e25	estudiante	10.0.0.3	\N	2026-01-09 20:31:56.864-03	2026-01-09 20:31:56.86-03	2026-01-16 20:31:56.859-03	f	\N	cmk7igcsi01oo8jmpd4htfulf
a543d646-83d8-446a-b876-eaf8ffdbc0e2	estudiante	10.0.0.4	\N	2026-01-09 20:31:57.306-03	2026-01-09 20:31:57.301-03	2026-01-16 20:31:57.301-03	f	\N	cmk7igcsi01oo8jmpd4htfulf
31787b0b-5efc-4733-a76d-f744de7ce6ec	estudiante	10.0.0.14	\N	2026-01-09 20:32:00.735-03	2026-01-09 20:32:00.733-03	2026-01-16 20:32:00.733-03	f	\N	cmk7igfxt01r28jmp4tb0u94f
66d04902-c1d1-4628-a989-458be482ae2c	estudiante	10.0.0.15	\N	2026-01-09 20:32:01.305-03	2026-01-09 20:32:01.303-03	2026-01-16 20:32:01.303-03	f	\N	cmk7iggf101ra8jmp7dl4iula
2f923dfe-118a-4c78-8ed3-ebad177c057b	estudiante	10.0.0.16	\N	2026-01-09 20:32:01.912-03	2026-01-09 20:32:01.91-03	2026-01-16 20:32:01.91-03	f	\N	cmk7iggv301rl8jmpprnh2pja
7c5430ca-cf37-425c-bb07-680f50261b5b	estudiante	10.0.0.17	\N	2026-01-09 20:32:02.528-03	2026-01-09 20:32:02.527-03	2026-01-16 20:32:02.527-03	f	\N	cmk7ighc001rt8jmpiwx1zvwg
0726350b-3d47-4928-ad7e-b1b9685e5488	estudiante	10.0.0.18	\N	2026-01-09 20:32:03.121-03	2026-01-09 20:32:03.119-03	2026-01-16 20:32:03.119-03	f	\N	cmk7ighsv01s48jmpedgyjx95
2c6afa80-7de9-4a0f-87c2-2e187d48a3a1	tutor	10.0.0.1	\N	2026-01-09 20:32:05.589-03	2026-01-09 20:32:05.588-03	2026-01-16 20:32:05.588-03	f	\N	cmk7igjps01sa8jmpa59hfq2w
7b26def2-3ce8-4b7b-9cad-39ddf9bcbefa	tutor	10.0.0.2	\N	2026-01-09 20:32:06.094-03	2026-01-09 20:32:06.093-03	2026-01-16 20:32:06.093-03	f	\N	cmk7igk4l01sf8jmp4grvug0d
b2292508-8da6-46c1-8229-3cc11aaac5d2	tutor	10.0.0.4	\N	2026-01-09 20:32:06.759-03	2026-01-09 20:32:06.756-03	2026-01-16 20:32:06.756-03	f	\N	cmk7igkoz01sh8jmpl47n1jmy
622b69fa-9667-43b7-9f4d-76f93cab7118	tutor	10.0.0.5	\N	2026-01-09 20:32:07.233-03	2026-01-09 20:32:07.232-03	2026-01-16 20:32:07.232-03	f	\N	cmk7igl0501sj8jmpa1uivrxj
4e028f33-8b75-4aa2-9156-06cd63fea59d	tutor	10.0.0.6	\N	2026-01-09 20:32:07.774-03	2026-01-09 20:32:07.773-03	2026-01-16 20:32:07.773-03	f	\N	cmk7iglei01so8jmpv1qck1vk
03ab301c-0167-46e5-8f03-b2c3e8cde2f6	tutor	10.0.0.7	\N	2026-01-09 20:32:08.27-03	2026-01-09 20:32:08.269-03	2026-01-16 20:32:08.269-03	f	\N	cmk7iglsy01sy8jmp8ooi3fmc
da47eb87-bc7f-4709-a4fa-f4544e064a14	tutor	10.0.0.8	\N	2026-01-09 20:32:08.791-03	2026-01-09 20:32:08.79-03	2026-01-16 20:32:08.79-03	f	\N	cmk7igm6q01t38jmpjbw5r8dt
c52ec294-cd8b-48d0-9868-db27604137f0	tutor	10.0.0.9	\N	2026-01-09 20:32:09.303-03	2026-01-09 20:32:09.301-03	2026-01-16 20:32:09.301-03	f	\N	cmk7igmlm01t58jmp9qnkg1m5
fadbfdb7-3839-4952-bb08-ed8743122ac5	tutor	10.0.0.11	\N	2026-01-09 20:32:10.109-03	2026-01-09 20:32:10.109-03	2026-01-16 20:32:10.109-03	f	\N	cmk7ign8v01tb8jmpq5sl5tqg
934eff0b-9ee8-4c0e-85d8-bfae20a01042	tutor	10.0.0.12	\N	2026-01-09 20:32:10.574-03	2026-01-09 20:32:10.572-03	2026-01-16 20:32:10.572-03	f	\N	cmk7ignkz01td8jmpmcamcgsg
2f9fa224-4a7e-4d04-a42e-e1d80d244751	tutor	::ffff:127.0.0.1	\N	2026-01-09 20:32:27.137-03	2026-01-09 20:32:27.136-03	2026-01-16 20:32:27.136-03	f	\N	cmk7ih0es027i8jmp2sks0zdk
60c9cfba-41ae-49fb-bd81-cb97925d0dff	tutor	::ffff:127.0.0.1	\N	2026-01-09 20:32:28.68-03	2026-01-09 20:32:28.679-03	2026-01-16 20:32:28.679-03	f	\N	cmk7ih1lr027m8jmpd8xugwv7
db0cd736-8c44-4be8-ac49-b021f963fbec	estudiante	10.0.0.1	\N	2026-01-09 20:40:14.553-03	2026-01-09 20:40:14.552-03	2026-01-16 20:40:14.552-03	f	\N	cmk7ir11b00028j1azl6svjpc
a26df0d1-7242-481e-a1a3-8cc224bf42d0	estudiante	10.0.0.2	\N	2026-01-09 20:40:15.065-03	2026-01-09 20:40:15.064-03	2026-01-16 20:40:15.064-03	f	\N	cmk7ir1g9000a8j1a4zz0urgh
81d82fb4-cb40-41ca-9918-c3b51a09b727	estudiante	10.0.0.3	\N	2026-01-09 20:40:15.56-03	2026-01-09 20:40:15.559-03	2026-01-16 20:40:15.559-03	f	\N	cmk7ir1tr000i8j1ajqr29kir
13380491-4971-435a-970d-089e54a0d82e	estudiante	10.0.0.4	\N	2026-01-09 20:40:16.072-03	2026-01-09 20:40:16.071-03	2026-01-16 20:40:16.071-03	f	\N	cmk7ir27n000w8j1ai38qmsxy
890673b1-41e4-418c-b1c9-39555a082d7e	estudiante	10.0.0.5	\N	2026-01-09 20:40:16.557-03	2026-01-09 20:40:16.557-03	2026-01-16 20:40:16.557-03	f	\N	cmk7ir2ll001p8j1axzh418em
98d7410e-3946-43e0-b8fb-61158dda425c	estudiante	10.0.0.6	\N	2026-01-09 20:40:17.067-03	2026-01-09 20:40:17.066-03	2026-01-16 20:40:17.066-03	f	\N	cmk7ir2z200218j1a6z6w1nyr
d5e580b3-fb63-4d9d-ab49-82ad5ffc508e	tutor	10.0.0.7	\N	2026-01-09 20:40:17.505-03	2026-01-09 20:40:17.504-03	2026-01-16 20:40:17.504-03	f	\N	cmk7ir3bw00318j1atehi3qnq
c456f6bb-00ec-420f-bb78-6a3ae0d97f75	estudiante	10.0.0.8	\N	2026-01-09 20:40:17.973-03	2026-01-09 20:40:17.973-03	2026-01-16 20:40:17.973-03	f	\N	cmk7ir3p400358j1abdmixwni
67f63599-051a-42dc-8091-6883bc26d278	estudiante	10.0.0.9	\N	2026-01-09 20:40:18.453-03	2026-01-09 20:40:18.452-03	2026-01-16 20:40:18.452-03	f	\N	cmk7ir42d003d8j1akrio2f3v
7e37edfe-d6df-4daa-a2c7-853b6719f7db	estudiante	10.0.0.1	\N	2026-01-09 20:40:36.367-03	2026-01-09 20:40:36.366-03	2026-01-16 20:40:36.366-03	f	\N	cmk7irhuz00028j9xa6v767yb
fa05a03a-2bc5-4c36-b9ec-6e7b6a03ab6c	estudiante	10.0.0.2	\N	2026-01-09 20:40:36.887-03	2026-01-09 20:40:36.886-03	2026-01-16 20:40:36.886-03	f	\N	cmk7iriaa000a8j9xi2fojqzd
f58744b3-ec99-421f-89c7-266473edfd6f	estudiante	10.0.0.3	\N	2026-01-09 20:40:37.388-03	2026-01-09 20:40:37.387-03	2026-01-16 20:40:37.387-03	f	\N	cmk7irinw000i8j9xxxppd8vs
2dae3600-0de2-48e0-a026-bf88a7ba0ad0	estudiante	10.0.0.4	\N	2026-01-09 20:40:37.9-03	2026-01-09 20:40:37.899-03	2026-01-16 20:40:37.899-03	f	\N	cmk7irj1s000w8j9x52ukphax
0cac7bd8-ec24-4690-b2dd-e3fcb2bf748e	estudiante	10.0.0.5	\N	2026-01-09 20:40:38.386-03	2026-01-09 20:40:38.385-03	2026-01-16 20:40:38.385-03	f	\N	cmk7irjfu001p8j9xmpy3iios
7c379671-bdda-4245-a64e-efb6cb6528f0	estudiante	10.0.0.6	\N	2026-01-09 20:40:38.901-03	2026-01-09 20:40:38.9-03	2026-01-16 20:40:38.9-03	f	\N	cmk7irjtj00218j9xelt70bxk
3a9db80f-dc5b-479a-b7d5-0bc4b7f2a616	tutor	10.0.0.7	\N	2026-01-09 20:40:39.337-03	2026-01-09 20:40:39.336-03	2026-01-16 20:40:39.336-03	f	\N	cmk7irk6e00318j9xsh347mr2
9e862e6d-6efb-452f-bb68-606561a31632	estudiante	10.0.0.8	\N	2026-01-09 20:40:39.818-03	2026-01-09 20:40:39.818-03	2026-01-16 20:40:39.818-03	f	\N	cmk7irkjr00358j9xfhtf2w6n
c1ec8223-61a6-4c7c-9673-b6e742db3c8c	estudiante	10.0.0.9	\N	2026-01-09 20:40:40.307-03	2026-01-09 20:40:40.306-03	2026-01-16 20:40:40.306-03	f	\N	cmk7irkx6003d8j9xko08phm0
19029f0e-c779-4c11-a2d3-f089d741086d	tutor	10.0.0.1	\N	2026-01-10 00:07:43.679-03	2026-01-10 00:07:43.678-03	2026-01-17 00:07:43.678-03	f	\N	cmk7q5utj00008jn6m6lmt9x8
9afd0e02-7c6b-43ab-a19f-28eefee91d9a	estudiante	10.0.0.2	\N	2026-01-10 00:07:44.225-03	2026-01-10 00:07:44.225-03	2026-01-17 00:07:44.225-03	f	\N	cmk7q5v9200048jn62ljvclsf
d09e37d6-86a8-4aeb-8a4f-109db4129ebc	tutor	10.0.0.3	\N	2026-01-10 00:07:44.694-03	2026-01-10 00:07:44.693-03	2026-01-17 00:07:44.693-03	f	\N	cmk7q5vm9000a8jn6312t3ta2
c456040e-a0ba-487d-9f13-7e63c0466e84	tutor	10.0.0.4	\N	2026-01-10 00:07:45.152-03	2026-01-10 00:07:45.152-03	2026-01-17 00:07:45.152-03	f	\N	cmk7q5vz2000c8jn6qhw6hy63
b4ad1967-4309-48f5-b1a5-1c6675a12776	tutor	10.0.0.5	\N	2026-01-10 00:07:45.696-03	2026-01-10 00:07:45.695-03	2026-01-17 00:07:45.695-03	f	\N	cmk7q5wbl000e8jn651soawd9
1f32456e-2fa3-4406-9395-bb3eb7b44581	tutor	10.0.0.6	\N	2026-01-10 00:07:46.264-03	2026-01-10 00:07:46.263-03	2026-01-17 00:07:46.263-03	f	\N	cmk7q5wr800108jn6wsr9o1eg
03df83d1-5b9c-42d4-a613-afe4d6ba98bd	tutor	10.0.0.7	\N	2026-01-10 00:07:46.822-03	2026-01-10 00:07:46.822-03	2026-01-17 00:07:46.821-03	f	\N	cmk7q5x6t001y8jn6dmyt7c89
3239488a-514b-4e2d-95a4-00024a144b6f	tutor	10.0.0.8	\N	2026-01-10 00:07:47.439-03	2026-01-10 00:07:47.438-03	2026-01-17 00:07:47.438-03	f	\N	cmk7q5xm7002t8jn67amct7vv
e07283a7-9677-4227-9da1-85ca9caba6f6	tutor	10.0.0.9	\N	2026-01-10 00:07:47.995-03	2026-01-10 00:07:47.994-03	2026-01-17 00:07:47.994-03	f	\N	cmk7q5y3a003m8jn6hnakagok
79ee2a7b-3c75-49dc-849a-0e2ad09b10de	tutor	10.0.0.10	\N	2026-01-10 00:07:48.567-03	2026-01-10 00:07:48.566-03	2026-01-17 00:07:48.566-03	f	\N	cmk7q5yjk004m8jn65f99sk5q
45ce89ba-bd70-4b2a-86d9-57a7ab989b20	tutor	10.0.0.11	\N	2026-01-10 00:07:49.024-03	2026-01-10 00:07:49.023-03	2026-01-17 00:07:49.023-03	f	\N	cmk7q5yyn00588jn61m4o2sib
1bb2ec48-2ff3-45b6-8801-1bc242f06659	tutor	10.0.0.12	\N	2026-01-10 00:07:49.561-03	2026-01-10 00:07:49.56-03	2026-01-17 00:07:49.56-03	f	\N	cmk7q5zbb005i8jn61kcurush
29929097-793b-45af-924f-69291d6c01da	tutor	10.0.0.1	\N	2026-01-10 00:13:08.797-03	2026-01-10 00:13:08.796-03	2026-01-17 00:13:08.795-03	f	\N	cmk7qctor00008juykurjsgwa
6dc4a8fe-d94c-48e2-bb03-d56a483b2dcd	estudiante	10.0.0.2	\N	2026-01-10 00:13:09.326-03	2026-01-10 00:13:09.325-03	2026-01-17 00:13:09.325-03	f	\N	cmk7qcu3y00048juydkha2the
d4f6a07e-7382-46ee-b54b-4d5d71bea0d7	tutor	10.0.0.3	\N	2026-01-10 00:13:09.889-03	2026-01-10 00:13:09.888-03	2026-01-17 00:13:09.888-03	f	\N	cmk7qcugy000a8juy7jwqmgsj
b5213380-3383-494d-8f09-25f1ff339502	tutor	10.0.0.4	\N	2026-01-10 00:13:10.442-03	2026-01-10 00:13:10.442-03	2026-01-17 00:13:10.442-03	f	\N	cmk7qcuwk00118juy3neagkl7
f1750d89-6ed7-4823-8877-bd73a04a3cba	tutor	10.0.0.5	\N	2026-01-10 00:13:10.975-03	2026-01-10 00:13:10.974-03	2026-01-17 00:13:10.974-03	f	\N	cmk7qcvbg001s8juy5e7vquog
1fc1a191-4c6c-48dc-bc09-5e29a1564a55	tutor	10.0.0.6	\N	2026-01-10 00:13:11.421-03	2026-01-10 00:13:11.42-03	2026-01-17 00:13:11.42-03	f	\N	cmk7qcvq9002j8juynabr2zhq
4bef7379-ee13-4777-88be-cb82f68d1118	tutor	10.0.0.7	\N	2026-01-10 00:13:11.947-03	2026-01-10 00:13:11.946-03	2026-01-17 00:13:11.946-03	f	\N	cmk7qcw2i002l8juy2dc8km9f
8df706fc-6e3a-48a6-92d9-c5a155f50776	tutor	10.0.0.8	\N	2026-01-10 00:13:12.573-03	2026-01-10 00:13:12.573-03	2026-01-17 00:13:12.573-03	f	\N	cmk7qcwme00498juyehcsvile
130533ab-0eb7-431c-94d8-3ef7e74380aa	tutor	10.0.0.9	\N	2026-01-10 00:13:13.115-03	2026-01-10 00:13:13.114-03	2026-01-17 00:13:13.114-03	f	\N	cmk7qcwz1004b8juyt0gr5hui
e11a12d3-dd94-4b0c-aa8f-9ea0a202ed5e	tutor	10.0.0.10	\N	2026-01-10 00:13:13.644-03	2026-01-10 00:13:13.643-03	2026-01-17 00:13:13.643-03	f	\N	cmk7qcxds00528juy3nyyj2fl
831630f2-d8c1-4c98-895f-5817be1fe239	tutor	10.0.0.11	\N	2026-01-10 00:13:14.169-03	2026-01-10 00:13:14.168-03	2026-01-17 00:13:14.168-03	f	\N	cmk7qcxsc005t8juyedu4q0wr
b1cc0147-0e16-4ce5-8629-2b31e7649d02	tutor	10.0.0.12	\N	2026-01-10 00:13:14.886-03	2026-01-10 00:13:14.886-03	2026-01-17 00:13:14.885-03	f	\N	cmk7qcyc5006k8juyrl51h9xr
ede46cf4-0b66-41ed-a55a-19cbdaa9f027	tutor	10.0.0.13	\N	2026-01-10 00:13:15.405-03	2026-01-10 00:13:15.405-03	2026-01-17 00:13:15.405-03	f	\N	cmk7qcyqs007d8juy10byget7
8f7d730d-76d3-472f-a4ca-a0b13e22df81	tutor	10.0.0.14	\N	2026-01-10 00:13:15.93-03	2026-01-10 00:13:15.929-03	2026-01-17 00:13:15.929-03	f	\N	cmk7qcz5c00848juyqtmoagvk
a1f2d0c6-02eb-499b-b7bc-d80b1bcfe31b	tutor	10.0.0.15	\N	2026-01-10 00:13:16.46-03	2026-01-10 00:13:16.46-03	2026-01-17 00:13:16.46-03	f	\N	cmk7qczk3008v8juyo63f4985
365692e9-9074-4894-a951-5d24fc37f853	tutor	10.0.0.16	\N	2026-01-10 00:13:17.027-03	2026-01-10 00:13:17.026-03	2026-01-17 00:13:17.026-03	f	\N	cmk7qczzr009m8juygtdg76gu
dbdf9596-f0cc-44dd-9d0c-f8290edaeada	tutor	10.0.0.17	\N	2026-01-10 00:13:17.576-03	2026-01-10 00:13:17.575-03	2026-01-17 00:13:17.575-03	f	\N	cmk7qd0e600af8juyywonf427
727eb8cf-29fe-4165-94d6-2c982ddcef6c	tutor	10.0.0.18	\N	2026-01-10 00:13:18.123-03	2026-01-10 00:13:18.122-03	2026-01-17 00:13:18.122-03	f	\N	cmk7qd0tr00b88juyye09dze9
c641db50-16fa-4d91-9753-908746e92ada	tutor	10.0.0.19	\N	2026-01-10 00:13:18.649-03	2026-01-10 00:13:18.649-03	2026-01-17 00:13:18.649-03	f	\N	cmk7qd18u00c08juyyjh3jwlf
c4e5ca6a-ea49-461c-9f23-f67a605302e8	tutor	10.0.0.1	\N	2026-01-10 00:16:31.342-03	2026-01-10 00:16:31.341-03	2026-01-17 00:16:31.341-03	f	\N	cmk7qh5yt00008jfn3jpaakdo
13d4ae88-c435-488d-bed1-c0bbad64e461	estudiante	10.0.0.2	\N	2026-01-10 00:16:31.873-03	2026-01-10 00:16:31.872-03	2026-01-17 00:16:31.872-03	f	\N	cmk7qh6e200048jfnge2qjoey
3bc0f58f-2fd4-48d7-b2e9-8491417274bf	tutor	10.0.0.3	\N	2026-01-10 00:16:32.443-03	2026-01-10 00:16:32.442-03	2026-01-17 00:16:32.442-03	f	\N	cmk7qh6rh000a8jfnard3u7ud
1f594548-8bd6-4805-aecd-b75f81446135	tutor	10.0.0.4	\N	2026-01-10 00:16:32.904-03	2026-01-10 00:16:32.903-03	2026-01-17 00:16:32.903-03	f	\N	cmk7qh77600138jfnkj65tfh3
5519c37a-9d0e-4d02-aaee-80b59fd6078b	tutor	10.0.0.5	\N	2026-01-10 00:16:33.436-03	2026-01-10 00:16:33.435-03	2026-01-17 00:16:33.435-03	f	\N	cmk7qh7jd00158jfntljt58bj
72a0ad84-e360-4921-888a-e135539d18c0	tutor	10.0.0.6	\N	2026-01-10 00:16:34.078-03	2026-01-10 00:16:34.077-03	2026-01-17 00:16:34.077-03	f	\N	cmk7qh83r002t8jfnnci2j2u2
8be80df6-c76c-404e-9388-53a820d76def	tutor	10.0.0.7	\N	2026-01-10 00:16:34.617-03	2026-01-10 00:16:34.616-03	2026-01-17 00:16:34.616-03	f	\N	cmk7qh8g4002v8jfnhp2ah76c
25cd85ac-c9de-4460-9535-a2ba675d695a	tutor	10.0.0.8	\N	2026-01-10 00:16:35.157-03	2026-01-10 00:16:35.156-03	2026-01-17 00:16:35.156-03	f	\N	cmk7qh8v5003o8jfny8ny89u3
cf39aa5b-d8d0-45a0-9c94-0e29eb164b37	tutor	10.0.0.9	\N	2026-01-10 00:16:35.696-03	2026-01-10 00:16:35.696-03	2026-01-17 00:16:35.696-03	f	\N	cmk7qh9a9004h8jfnv1tfal2x
dfe36030-8736-4712-9fbe-25dbe0122ad1	tutor	10.0.0.10	\N	2026-01-10 00:16:36.233-03	2026-01-10 00:16:36.232-03	2026-01-17 00:16:36.232-03	f	\N	cmk7qh9pd005a8jfnmvn74paa
eb820341-2a04-4e4e-a5d5-1271220ad830	tutor	10.0.0.11	\N	2026-01-10 00:16:36.774-03	2026-01-10 00:16:36.773-03	2026-01-17 00:16:36.773-03	f	\N	cmk7qha4f00658jfni5mbc4kw
dca83a70-1ec9-45c0-b63f-3af69c443158	tutor	10.0.0.12	\N	2026-01-10 00:16:37.334-03	2026-01-10 00:16:37.333-03	2026-01-17 00:16:37.333-03	f	\N	cmk7qhaju00728jfn9ufjswps
53390be7-4b00-4075-963d-7232af05d876	tutor	10.0.0.13	\N	2026-01-10 00:16:37.893-03	2026-01-10 00:16:37.892-03	2026-01-17 00:16:37.892-03	f	\N	cmk7qhazc007x8jfnhl305yei
8363477f-c89a-496a-b625-016ad63595a2	tutor	10.0.0.14	\N	2026-01-10 00:16:38.49-03	2026-01-10 00:16:38.487-03	2026-01-17 00:16:38.487-03	f	\N	cmk7qhbfx008s8jfnnok10zdb
f2d19ab2-caf3-4528-bb3f-64324e80c62a	tutor	10.0.0.15	\N	2026-01-10 00:16:39.025-03	2026-01-10 00:16:39.025-03	2026-01-17 00:16:39.025-03	f	\N	cmk7qhbus009n8jfn9f124ene
24c10bec-d9dd-4760-b05c-fbe8d30a8b7b	tutor	10.0.0.16	\N	2026-01-10 00:16:39.585-03	2026-01-10 00:16:39.584-03	2026-01-17 00:16:39.584-03	f	\N	cmk7qhca600ai8jfnw1cbffik
e8956395-cbfc-41dd-b052-db3b4d206b96	tutor	10.0.0.17	\N	2026-01-10 00:16:40.114-03	2026-01-10 00:16:40.113-03	2026-01-17 00:16:40.113-03	f	\N	cmk7qhcp400bc8jfncygi9vgq
d5579626-523d-44ee-bc5f-673aa16fcace	tutor	10.0.0.1	\N	2026-01-10 00:22:48.016-03	2026-01-10 00:22:48.015-03	2026-01-17 00:22:48.015-03	f	\N	cmk7qp8mw00008j30udwdcrfp
159527de-a5de-4049-ba55-a0399550da3f	estudiante	10.0.0.2	\N	2026-01-10 00:22:48.526-03	2026-01-10 00:22:48.525-03	2026-01-17 00:22:48.525-03	f	\N	cmk7qp91700048j30ftr7ev1z
750a7db9-0878-4620-8516-c3d7da06a3c8	tutor	10.0.0.3	\N	2026-01-10 00:22:49.07-03	2026-01-10 00:22:49.069-03	2026-01-17 00:22:49.069-03	f	\N	cmk7qp9dn000a8j30kf2voosu
f0367aa8-0b8f-44f4-80d6-91d6216948e8	tutor	10.0.0.4	\N	2026-01-10 00:22:49.491-03	2026-01-10 00:22:49.491-03	2026-01-17 00:22:49.491-03	f	\N	cmk7qp9sk00158j30wqapfasw
adecbcef-9f48-4ef9-a31c-6a1febcbc072	tutor	10.0.0.5	\N	2026-01-10 00:22:50.081-03	2026-01-10 00:22:50.08-03	2026-01-17 00:22:50.08-03	f	\N	cmk7qpa86001z8j30vz3c71hh
1851b384-ad87-4386-9c12-42e5d0363062	tutor	10.0.0.6	\N	2026-01-10 00:22:50.584-03	2026-01-10 00:22:50.584-03	2026-01-17 00:22:50.583-03	f	\N	cmk7qpakm00218j30vwdty033
fda0cd30-70f1-4f02-b899-778f57380e5b	tutor	10.0.0.7	\N	2026-01-10 00:22:51.086-03	2026-01-10 00:22:51.085-03	2026-01-17 00:22:51.085-03	f	\N	cmk7qpayk002w8j30n5ybkaba
0619d663-ce61-4d78-a9cc-543dd5b6bba9	tutor	10.0.0.8	\N	2026-01-10 00:22:51.592-03	2026-01-10 00:22:51.591-03	2026-01-17 00:22:51.591-03	f	\N	cmk7qpbcj003r8j3024imob47
6a286869-c7b2-4cf9-9078-8886c886830f	tutor	10.0.0.9	\N	2026-01-10 00:22:52.125-03	2026-01-10 00:22:52.125-03	2026-01-17 00:22:52.125-03	f	\N	cmk7qpbqt004k8j30m6uusuu2
b762cdd0-ffc9-4b71-9e2a-193239677236	tutor	10.0.0.10	\N	2026-01-10 00:22:52.684-03	2026-01-10 00:22:52.683-03	2026-01-17 00:22:52.683-03	f	\N	cmk7qpc6c005f8j30hcjktqrm
b92bd7a8-5460-43eb-a8c4-805f48532929	tutor	10.0.0.11	\N	2026-01-10 00:22:53.22-03	2026-01-10 00:22:53.219-03	2026-01-17 00:22:53.219-03	f	\N	cmk7qpclg006i8j30uryqw1oe
d13eff0a-6bdb-4946-b417-d5518fb0bcfc	tutor	10.0.0.12	\N	2026-01-10 00:22:53.738-03	2026-01-10 00:22:53.737-03	2026-01-17 00:22:53.737-03	f	\N	cmk7qpd05007f8j30j54xue4p
0191a097-7180-4556-a57d-caa2b1863ffc	tutor	10.0.0.13	\N	2026-01-10 00:22:54.248-03	2026-01-10 00:22:54.247-03	2026-01-17 00:22:54.247-03	f	\N	cmk7qpdek008c8j30i6nd5qpb
bdd200ac-f2b4-4c34-96a6-08b08f7ec992	tutor	10.0.0.14	\N	2026-01-10 00:22:54.785-03	2026-01-10 00:22:54.784-03	2026-01-17 00:22:54.784-03	f	\N	cmk7qpdsg00978j30enntkwk2
ecf05c3d-95e9-47c8-8b01-8fc65e1d14ce	tutor	10.0.0.15	\N	2026-01-10 00:22:55.325-03	2026-01-10 00:22:55.324-03	2026-01-17 00:22:55.324-03	f	\N	cmk7qpe7900a28j30xc26tyvu
ebe3b949-7da9-4e82-9ab9-4669e3109d42	tutor	10.0.0.16	\N	2026-01-10 00:22:55.837-03	2026-01-10 00:22:55.836-03	2026-01-17 00:22:55.836-03	f	\N	cmk7qpemc00b08j30nm3tm3d9
ae8c98fd-03f8-4640-8eab-817bf2053778	tutor	10.0.0.17	\N	2026-01-10 00:22:56.369-03	2026-01-10 00:22:56.368-03	2026-01-17 00:22:56.368-03	f	\N	cmk7qpf0m00bz8j30gkv2l8nv
77f0011d-84eb-4d95-b1ae-17038ecd4983	tutor	10.0.0.1	\N	2026-01-10 00:27:09.632-03	2026-01-10 00:27:09.632-03	2026-01-17 00:27:09.631-03	f	\N	cmk7quui400008jw5vc133adp
7aec9f32-5f0e-4115-880f-0ad645b5a014	estudiante	10.0.0.2	\N	2026-01-10 00:27:10.134-03	2026-01-10 00:27:10.133-03	2026-01-17 00:27:10.133-03	f	\N	cmk7quuwc00048jw5voryllwa
5d0c9d34-fe08-4ac9-8578-ae34b79ab7bf	tutor	10.0.0.3	\N	2026-01-10 00:27:10.582-03	2026-01-10 00:27:10.581-03	2026-01-17 00:27:10.581-03	f	\N	cmk7quv8g000a8jw5v0oq4qly
b6943b4c-18e0-47c1-a5db-73478dbe4fb5	tutor	10.0.0.4	\N	2026-01-10 00:27:11.085-03	2026-01-10 00:27:11.085-03	2026-01-17 00:27:11.085-03	f	\N	cmk7quvkj000c8jw5t0001tg3
7bdad6e4-4f1f-445f-a731-cb73265a97a7	tutor	10.0.0.5	\N	2026-01-10 00:27:11.668-03	2026-01-10 00:27:11.667-03	2026-01-17 00:27:11.667-03	f	\N	cmk7quw3000208jw5xr1nysr5
9e07c53f-8a36-4b79-b47c-34b516275696	tutor	10.0.0.6	\N	2026-01-10 00:27:12.167-03	2026-01-10 00:27:12.166-03	2026-01-17 00:27:12.166-03	f	\N	cmk7quweq00228jw5l9sevmue
77b58e13-4b42-441b-9e23-27c46337b266	tutor	10.0.0.7	\N	2026-01-10 00:27:12.677-03	2026-01-10 00:27:12.676-03	2026-01-17 00:27:12.676-03	f	\N	cmk7quwsx002v8jw57r9dlo8o
704ce7a1-997f-4211-b667-1c3dea29694f	tutor	10.0.0.8	\N	2026-01-10 00:27:13.202-03	2026-01-10 00:27:13.201-03	2026-01-17 00:27:13.201-03	f	\N	cmk7qux6x003q8jw5ttg8y2uf
e7f2e02b-4571-430a-9d45-41c59a39d390	tutor	10.0.0.9	\N	2026-01-10 00:27:13.644-03	2026-01-10 00:27:13.643-03	2026-01-17 00:27:13.643-03	f	\N	cmk7quxm6004l8jw5r4uu12z1
493ef2bc-9525-4bc8-8a02-009f32dd9d46	tutor	10.0.0.10	\N	2026-01-10 00:27:14.055-03	2026-01-10 00:27:14.054-03	2026-01-17 00:27:14.054-03	f	\N	cmk7quxxg004n8jw5tdl1j12d
3da7d912-01b4-4953-85fc-ebb1ae284a7d	tutor	10.0.0.11	\N	2026-01-10 00:27:14.547-03	2026-01-10 00:27:14.546-03	2026-01-17 00:27:14.546-03	f	\N	cmk7quy8w004p8jw5jx6vjp4l
2d2e7987-e4f2-4175-832d-d1f3747a93bb	tutor	10.0.0.12	\N	2026-01-10 00:27:15.048-03	2026-01-10 00:27:15.047-03	2026-01-17 00:27:15.047-03	f	\N	cmk7quymv005k8jw5pw3qjq9i
c10aca6d-150b-4611-897e-da06ab3e912e	tutor	10.0.0.13	\N	2026-01-10 00:27:15.543-03	2026-01-10 00:27:15.542-03	2026-01-17 00:27:15.542-03	f	\N	cmk7quz0m006f8jw5jb0tno5v
29c2e5ce-78e8-4b5a-b077-0918ea76f97d	tutor	10.0.0.14	\N	2026-01-10 00:27:15.967-03	2026-01-10 00:27:15.967-03	2026-01-17 00:27:15.967-03	f	\N	cmk7quzep00788jw5jxcyhjhe
953b1257-c8d7-43a8-b628-deb2032f06bf	estudiante	10.0.0.15	\N	2026-01-10 00:27:16.434-03	2026-01-10 00:27:16.433-03	2026-01-17 00:27:16.433-03	f	\N	cmk7quzrk007c8jw5dvglhmcg
3be0fb56-b317-42dc-ac0c-55ea2e76de6e	tutor	10.0.0.16	\N	2026-01-10 00:27:16.85-03	2026-01-10 00:27:16.849-03	2026-01-17 00:27:16.849-03	f	\N	cmk7qv02z007i8jw5ew65msc5
d2d2596d-87c4-4fe2-9f0b-b31d5c84baaf	tutor	10.0.0.17	\N	2026-01-10 00:27:17.378-03	2026-01-10 00:27:17.377-03	2026-01-17 00:27:17.377-03	f	\N	cmk7qv0fg007k8jw5skcjpf4f
8f577cfb-3d17-41f7-9ceb-659d040ff19b	tutor	10.0.0.18	\N	2026-01-10 00:27:17.968-03	2026-01-10 00:27:17.967-03	2026-01-17 00:27:17.967-03	f	\N	cmk7qv0y200988jw51nntgcn3
f208279c-9325-4cfc-b4c8-27e077e81621	tutor	10.0.0.19	\N	2026-01-10 00:27:18.461-03	2026-01-10 00:27:18.46-03	2026-01-17 00:27:18.46-03	f	\N	cmk7qv19p009a8jw5ci5kfz8g
e372aa3f-e418-4c9a-b871-4a73676fd195	tutor	10.0.0.20	\N	2026-01-10 00:27:18.955-03	2026-01-10 00:27:18.954-03	2026-01-17 00:27:18.954-03	f	\N	cmk7qv1nj00a38jw5vqu7z63q
bd4d2bf4-ded4-44e7-b986-4b1f64295c86	tutor	10.0.0.21	\N	2026-01-10 00:27:19.456-03	2026-01-10 00:27:19.455-03	2026-01-17 00:27:19.455-03	f	\N	cmk7qv21c00ay8jw5rcmmz07e
b925cc5d-32ec-488b-a7ec-36c1135ca75c	tutor	10.0.0.22	\N	2026-01-10 00:27:19.889-03	2026-01-10 00:27:19.888-03	2026-01-17 00:27:19.888-03	f	\N	cmk7qv2fo00bt8jw5i6582vwc
f8bcefd7-b74c-4d26-8140-52bbc6bf8d9e	tutor	10.0.0.23	\N	2026-01-10 00:27:20.291-03	2026-01-10 00:27:20.29-03	2026-01-17 00:27:20.29-03	f	\N	cmk7qv2qu00bv8jw5rn6rbr0f
0c2a5e98-e74f-4be5-b05b-61e8142dc1f6	tutor	10.0.0.24	\N	2026-01-10 00:27:20.772-03	2026-01-10 00:27:20.771-03	2026-01-17 00:27:20.771-03	f	\N	cmk7qv32000bx8jw5c4df9pbq
d1941018-cb64-411d-adce-18ee6977f09d	tutor	10.0.0.25	\N	2026-01-10 00:27:21.267-03	2026-01-10 00:27:21.267-03	2026-01-17 00:27:21.267-03	f	\N	cmk7qv3fp00cs8jw5xarnqa8s
7b8d34dc-9867-4ee5-b9f8-931c66de927a	tutor	10.0.0.26	\N	2026-01-10 00:27:21.765-03	2026-01-10 00:27:21.764-03	2026-01-17 00:27:21.764-03	f	\N	cmk7qv3tf00dn8jw5qyv6w91k
c104e13c-d63e-4f21-af1c-46ea3fbc26cf	tutor	10.0.0.27	\N	2026-01-10 00:27:22.265-03	2026-01-10 00:27:22.264-03	2026-01-17 00:27:22.264-03	f	\N	cmk7qv47b00eg8jw5z5e2s30i
6776752d-d64d-491f-9f12-daabc60af177	tutor	10.0.0.28	\N	2026-01-10 00:27:22.768-03	2026-01-10 00:27:22.767-03	2026-01-17 00:27:22.767-03	f	\N	cmk7qv4lg00fb8jw58614z1o8
98e302fd-9430-4ff8-9339-1b76f72f41b0	tutor	10.0.0.29	\N	2026-01-10 00:27:23.284-03	2026-01-10 00:27:23.283-03	2026-01-17 00:27:23.283-03	f	\N	cmk7qv4zj00g88jw5fk5c5dbn
b81e2b57-a13c-43f0-8deb-55e8fc33ee3b	tutor	10.0.0.30	\N	2026-01-10 00:27:23.811-03	2026-01-10 00:27:23.81-03	2026-01-17 00:27:23.81-03	f	\N	cmk7qv5eb00h78jw5hb8nbjr4
c8a2d76f-f98a-4676-bbb4-123f568104d1	tutor	10.0.0.1	\N	2026-01-10 00:37:48.331-03	2026-01-10 00:37:48.33-03	2026-01-17 00:37:48.33-03	f	\N	cmk7r8jaw00008jo2q1gmxr2l
0b26e246-0c47-41f0-aecf-c98b92b6910c	estudiante	10.0.0.2	\N	2026-01-10 00:37:48.86-03	2026-01-10 00:37:48.859-03	2026-01-17 00:37:48.859-03	f	\N	cmk7r8jq900048jo25tvavqpf
bb03fa5d-0da2-46b7-94a0-24901fd796d5	tutor	10.0.0.3	\N	2026-01-10 00:37:49.41-03	2026-01-10 00:37:49.409-03	2026-01-17 00:37:49.409-03	f	\N	cmk7r8k2y000a8jo2lmqhmchh
1af0f592-cc20-440b-accb-162fef4e2d66	tutor	10.0.0.4	\N	2026-01-10 00:37:49.842-03	2026-01-10 00:37:49.841-03	2026-01-17 00:37:49.841-03	f	\N	cmk7r8ki400118jo2xaib77e9
ebb619ca-c761-4adb-9a92-46a6190eaeec	tutor	10.0.0.5	\N	2026-01-10 00:37:50.402-03	2026-01-10 00:37:50.401-03	2026-01-17 00:37:50.401-03	f	\N	cmk7r8kxt001t8jo2x5pfdk69
014db310-7f75-47a9-91c0-43c4b9e87b59	tutor	10.0.0.6	\N	2026-01-10 00:37:50.912-03	2026-01-10 00:37:50.911-03	2026-01-17 00:37:50.911-03	f	\N	cmk7r8l9e001v8jo289a4d4pn
3d6e8bfa-022a-4816-805b-60ea1ede96d4	tutor	10.0.0.7	\N	2026-01-10 00:37:51.424-03	2026-01-10 00:37:51.423-03	2026-01-17 00:37:51.423-03	f	\N	cmk7r8lno002m8jo2u09jpu74
56cc119a-50fd-480e-be3d-976db62f9347	tutor	10.0.0.8	\N	2026-01-10 00:37:52.077-03	2026-01-10 00:37:52.076-03	2026-01-17 00:37:52.076-03	f	\N	cmk7r8m1z003d8jo2bintds3h
7a5679b1-6843-422a-893e-ac90e20388ad	tutor	10.0.0.9	\N	2026-01-10 00:37:52.76-03	2026-01-10 00:37:52.759-03	2026-01-17 00:37:52.759-03	f	\N	cmk7r8mkt004d8jo2iosk2ei0
bbdd7c95-eeff-4682-b94f-96ef31865b18	tutor	10.0.0.10	\N	2026-01-10 00:37:53.606-03	2026-01-10 00:37:53.605-03	2026-01-17 00:37:53.605-03	f	\N	cmk7r8n34005f8jo2c07oo420
96c3c540-c297-4e3f-99f8-265386989ff4	tutor	10.0.0.11	\N	2026-01-10 00:37:54.289-03	2026-01-10 00:37:54.288-03	2026-01-17 00:37:54.288-03	f	\N	cmk7r8nr3006s8jo20d31kalc
bf7888bd-85cf-49ce-9910-513d71bc629c	tutor	10.0.0.12	\N	2026-01-10 00:37:54.954-03	2026-01-10 00:37:54.953-03	2026-01-17 00:37:54.953-03	f	\N	cmk7r8o9k007y8jo2r4aozghz
01eb5a15-03c3-4e31-a440-9cd0222a35d8	tutor	10.0.0.13	\N	2026-01-10 00:37:55.619-03	2026-01-10 00:37:55.618-03	2026-01-17 00:37:55.618-03	f	\N	cmk7r8os000908jo2v3f66t1p
d15ebd27-78a9-4f57-a1e6-d4752eba0ae1	tutor	10.0.0.14	\N	2026-01-10 00:37:56.526-03	2026-01-10 00:37:56.525-03	2026-01-17 00:37:56.525-03	f	\N	cmk7r8pb200a28jo2nnpv5zzy
a7c982a6-698c-49f0-a634-b5dff448d200	tutor	10.0.0.15	\N	2026-01-10 00:37:57.244-03	2026-01-10 00:37:57.243-03	2026-01-17 00:37:57.243-03	f	\N	cmk7r8pzz00bk8jo23ue2942d
b8d69949-f211-4b82-997a-3870a7a8f4b1	tutor	10.0.0.16	\N	2026-01-10 00:37:57.916-03	2026-01-10 00:37:57.915-03	2026-01-17 00:37:57.915-03	f	\N	cmk7r8qjs00d08jo22fexpnk3
a3cffcaf-601e-46a6-b40b-8708d7cedc08	tutor	10.0.0.17	\N	2026-01-10 00:37:58.606-03	2026-01-10 00:37:58.605-03	2026-01-17 00:37:58.605-03	f	\N	cmk7r8r2h00e28jo2a9kmw6lx
e611de06-340d-4e4d-bc8a-cfcb4ad32222	estudiante	10.0.0.1	\N	2026-01-10 00:38:00.511-03	2026-01-10 00:38:00.509-03	2026-01-17 00:38:00.509-03	f	\N	cmk7r8sps00fa8jo2dt7o3eu6
64bdb5df-a7d1-4c54-a7d6-a9f6b0de8e32	estudiante	10.0.0.2	\N	2026-01-10 00:38:01.139-03	2026-01-10 00:38:01.138-03	2026-01-17 00:38:01.138-03	f	\N	cmk7r8t6j00fi8jo2ky0kmb7f
c60709ca-5abe-4d13-99b2-086d9e0a1e1e	estudiante	10.0.0.3	\N	2026-01-10 00:38:01.737-03	2026-01-10 00:38:01.736-03	2026-01-17 00:38:01.736-03	f	\N	cmk7r8tnk00fq8jo2jh81tdhi
a032c575-92ad-4d6e-a3e4-e3689d7da6c6	estudiante	10.0.0.4	\N	2026-01-10 00:38:02.289-03	2026-01-10 00:38:02.289-03	2026-01-17 00:38:02.289-03	f	\N	cmk7r8u2f00g48jo2xnw5oc4w
7daf80a0-97ae-4030-8036-5da7e2dc0638	estudiante	10.0.0.5	\N	2026-01-10 00:38:02.82-03	2026-01-10 00:38:02.819-03	2026-01-17 00:38:02.819-03	f	\N	cmk7r8uho00gx8jo2hijz5w9t
6b7f8d78-4316-4dba-8182-7f4fdb5988fb	estudiante	10.0.0.6	\N	2026-01-10 00:38:03.338-03	2026-01-10 00:38:03.337-03	2026-01-17 00:38:03.337-03	f	\N	cmk7r8uwc00h98jo23478jhf2
947c2803-bf1c-4777-b586-5d681944fffb	tutor	10.0.0.7	\N	2026-01-10 00:38:03.769-03	2026-01-10 00:38:03.768-03	2026-01-17 00:38:03.768-03	f	\N	cmk7r8v9200i98jo2yboz2me4
61f2f536-f36e-425b-ad28-d8d658150f08	estudiante	10.0.0.8	\N	2026-01-10 00:38:04.243-03	2026-01-10 00:38:04.242-03	2026-01-17 00:38:04.242-03	f	\N	cmk7r8vma00id8jo2f85drcxd
bd4d469b-9eb0-489f-9933-a14274b5c053	estudiante	10.0.0.9	\N	2026-01-10 00:38:04.733-03	2026-01-10 00:38:04.732-03	2026-01-17 00:38:04.732-03	f	\N	cmk7r8vzl00il8jo2tuae6ey7
8482e27b-0e89-45e5-a411-c54c203307e8	tutor	10.0.0.1	\N	2026-01-10 00:44:56.97-03	2026-01-10 00:44:56.969-03	2026-01-17 00:44:56.969-03	f	\N	cmk7rhq2400008jogiga0mucd
866cbc42-cd01-4b53-b8f9-4d46ff285529	estudiante	10.0.0.2	\N	2026-01-10 00:44:57.475-03	2026-01-10 00:44:57.475-03	2026-01-17 00:44:57.475-03	f	\N	cmk7rhqgs00048jogczsamepx
50ff8249-bcc8-45bf-af68-866682b0859d	tutor	10.0.0.3	\N	2026-01-10 00:44:57.928-03	2026-01-10 00:44:57.927-03	2026-01-17 00:44:57.927-03	f	\N	cmk7rhqt2000a8jogc6azzx3l
9429e42a-fcd5-4525-aedf-8d1a0f386686	tutor	10.0.0.4	\N	2026-01-10 00:44:58.444-03	2026-01-10 00:44:58.443-03	2026-01-17 00:44:58.443-03	f	\N	cmk7rhr5d000c8jogs7cdjrwm
e124b5ab-3655-4d81-a11f-ff5c9484dac0	tutor	10.0.0.5	\N	2026-01-10 00:45:00.11-03	2026-01-10 00:45:00.109-03	2026-01-17 00:45:00.109-03	f	\N	cmk7rhsi0004s8jog1frpx3f6
93c7d53e-07e3-4ccc-9a98-2c257f6732d5	estudiante	10.0.0.6	\N	2026-01-10 00:45:00.582-03	2026-01-10 00:45:00.582-03	2026-01-17 00:45:00.582-03	f	\N	cmk7rhsv9004w8jogs0obtior
390a9ff0-3481-48d4-b0ed-35c12c15b55d	tutor	10.0.0.7	\N	2026-01-10 00:45:00.987-03	2026-01-10 00:45:00.986-03	2026-01-17 00:45:00.986-03	f	\N	cmk7rht6n00528jogadwp9xy9
10bcb6b4-002b-4de5-ad27-e797115989df	tutor	10.0.0.1	\N	2026-01-10 00:48:32.627-03	2026-01-10 00:48:32.626-03	2026-01-17 00:48:32.626-03	f	\N	cmk7rmcfi00008jowffwmvxxt
a15673ab-d4c7-4feb-9c2d-23453e59f83d	estudiante	10.0.0.2	\N	2026-01-10 00:48:33.354-03	2026-01-10 00:48:33.352-03	2026-01-17 00:48:33.351-03	f	\N	cmk7rmd0500048jowb6d4sz3c
0849e5ca-f8c7-426a-84c5-abf76cf6e532	tutor	10.0.0.3	\N	2026-01-10 00:48:33.876-03	2026-01-10 00:48:33.875-03	2026-01-17 00:48:33.875-03	f	\N	cmk7rmdeu000a8jow2u5htiuu
8b657c7f-644b-4a13-8f74-fa804cebeb8e	tutor	10.0.0.4	\N	2026-01-10 00:48:34.461-03	2026-01-10 00:48:34.46-03	2026-01-17 00:48:34.46-03	f	\N	cmk7rmdsn000c8jowma9uowqq
a0e7ff53-59b8-48d2-8b0e-75ed6fbd67cf	tutor	10.0.0.5	\N	2026-01-10 00:48:35.108-03	2026-01-10 00:48:35.108-03	2026-01-17 00:48:35.107-03	f	\N	cmk7rmedd001m8jow0jm961af
fcb3821f-3251-4dcb-9b23-65c43b9a1fb7	tutor	10.0.0.6	\N	2026-01-10 00:48:35.674-03	2026-01-10 00:48:35.673-03	2026-01-17 00:48:35.673-03	f	\N	cmk7rmeqb001o8jow4n5bk7ny
0f6c9642-0633-43ee-a1a1-ea788c3fbe60	tutor	10.0.0.7	\N	2026-01-10 00:48:36.232-03	2026-01-10 00:48:36.231-03	2026-01-17 00:48:36.231-03	f	\N	cmk7rmf60002d8jowxsycgc1e
1123ed8e-2186-4b6c-b737-a95f78c8c3f8	tutor	10.0.0.8	\N	2026-01-10 00:48:36.819-03	2026-01-10 00:48:36.818-03	2026-01-17 00:48:36.818-03	f	\N	cmk7rmfm800348jow0xcfcvvj
f5c14d77-799f-484b-9b7b-3a84c07da9da	tutor	10.0.0.9	\N	2026-01-10 00:48:37.395-03	2026-01-10 00:48:37.394-03	2026-01-17 00:48:37.394-03	f	\N	cmk7rmg20003w8jowv6v4vzpr
50f8e4c3-4ecd-4826-821e-f3106a186f3d	tutor	10.0.0.10	\N	2026-01-10 00:48:37.96-03	2026-01-10 00:48:37.96-03	2026-01-17 00:48:37.96-03	f	\N	cmk7rmghq004l8jowegn6adl5
b54cca70-e50e-4fa5-9302-696eda2964e5	tutor	10.0.0.11	\N	2026-01-10 00:48:38.455-03	2026-01-10 00:48:38.454-03	2026-01-17 00:48:38.454-03	f	\N	cmk7rmgxv005h8jow1jvqiuo2
0fa10fbd-76a2-40e8-aa87-38dfe9f98819	estudiante	10.0.0.12	\N	2026-01-10 00:48:38.991-03	2026-01-10 00:48:38.99-03	2026-01-17 00:48:38.99-03	f	\N	cmk7rmhcz005l8jowytdksj3s
f1adc6db-9246-41db-b65a-c0443c92c8e4	tutor	10.0.0.13	\N	2026-01-10 00:48:39.456-03	2026-01-10 00:48:39.455-03	2026-01-17 00:48:39.455-03	f	\N	cmk7rmhpu005r8jow0gz1b6n6
20b972b9-e01d-46e2-ba05-fcadb1382b4d	tutor	10.0.0.14	\N	2026-01-10 00:48:40.003-03	2026-01-10 00:48:40.003-03	2026-01-17 00:48:40.002-03	f	\N	cmk7rmi2q005t8jow5as4u7v6
2925762c-6e64-456a-b0c7-c1a463c6ce1f	tutor	10.0.0.15	\N	2026-01-10 00:48:40.499-03	2026-01-10 00:48:40.498-03	2026-01-17 00:48:40.498-03	f	\N	cmk7rmiix006i8jow0b3veglk
e550e935-e8aa-46e1-9313-82184ab8d77c	tutor	10.0.0.16	\N	2026-01-10 00:48:41.067-03	2026-01-10 00:48:41.066-03	2026-01-17 00:48:41.066-03	f	\N	cmk7rmiwb006k8jows0pc93d0
0d2b8b93-a48d-4d5f-9a6d-09af13775db4	tutor	10.0.0.17	\N	2026-01-10 00:48:41.639-03	2026-01-10 00:48:41.638-03	2026-01-17 00:48:41.638-03	f	\N	cmk7rmjc500798jowdj8sp8gc
2fe5c31a-091f-473d-aaaf-eb6ad361b2de	tutor	10.0.0.18	\N	2026-01-10 00:48:42.192-03	2026-01-10 00:48:42.191-03	2026-01-17 00:48:42.191-03	f	\N	cmk7rmjrl007y8jowyec39nxl
a3d98241-8b83-47a0-81c4-afe12c90fe81	tutor	10.0.0.19	\N	2026-01-10 00:48:42.776-03	2026-01-10 00:48:42.775-03	2026-01-17 00:48:42.775-03	f	\N	cmk7rmk7l008n8jow3w83qali
6a93a141-fe02-439a-b8fa-82559bbc83ad	tutor	10.0.0.20	\N	2026-01-10 00:48:43.37-03	2026-01-10 00:48:43.369-03	2026-01-17 00:48:43.369-03	f	\N	cmk7rmknw009j8jow4xbiivkj
b1c5346f-6453-495d-a901-a01e45e19a6b	tutor	10.0.0.1	\N	2026-01-10 00:56:07-03	2026-01-10 00:56:06.999-03	2026-01-17 00:56:06.999-03	f	\N	cmk7rw30v00008jl1o8os4mf5
ca6bd832-00d2-4a61-b808-87a79e8cce63	estudiante	10.0.0.2	\N	2026-01-10 00:56:07.574-03	2026-01-10 00:56:07.573-03	2026-01-17 00:56:07.573-03	f	\N	cmk7rw3hl00048jl1dai7k72w
87031ed9-7a4b-4d4e-916d-aa8fc67b2463	tutor	10.0.0.3	\N	2026-01-10 00:56:08.056-03	2026-01-10 00:56:08.055-03	2026-01-17 00:56:08.055-03	f	\N	cmk7rw3v4000a8jl1qlgdxg9y
7da4962d-fa77-43ea-a0aa-7ad2e7ec3c66	tutor	10.0.0.4	\N	2026-01-10 00:56:08.615-03	2026-01-10 00:56:08.614-03	2026-01-17 00:56:08.614-03	f	\N	cmk7rw482000c8jl1lymcq5iy
cd2efdc9-4e84-4b7e-a099-2a02ba9cb8f3	tutor	10.0.0.5	\N	2026-01-10 00:56:09.251-03	2026-01-10 00:56:09.25-03	2026-01-17 00:56:09.25-03	f	\N	cmk7rw4sd001m8jl1h3emtgs2
534cad79-1476-4d59-81cc-5859286ad8b7	tutor	10.0.0.6	\N	2026-01-10 00:56:09.827-03	2026-01-10 00:56:09.826-03	2026-01-17 00:56:09.826-03	f	\N	cmk7rw55l001o8jl1ktr0tylm
f8b078bb-64ae-4d6b-a27f-b10534ae11c8	tutor	10.0.0.7	\N	2026-01-10 00:56:10.481-03	2026-01-10 00:56:10.481-03	2026-01-17 00:56:10.48-03	f	\N	cmk7rw5mu002f8jl1ew4rnuaz
0b4b455e-e259-48c2-a13e-e1ec817232db	tutor	10.0.0.8	\N	2026-01-10 00:56:11.074-03	2026-01-10 00:56:11.073-03	2026-01-17 00:56:11.073-03	f	\N	cmk7rw63r00368jl1osuc17zl
5ca1a6fa-64b9-4bb4-9e2c-694e728f67c1	tutor	10.0.0.9	\N	2026-01-10 00:56:11.644-03	2026-01-10 00:56:11.644-03	2026-01-17 00:56:11.644-03	f	\N	cmk7rw6ka00428jl1dvlmjbku
d13d6116-83c5-470a-8461-8cfdefb69f46	tutor	10.0.0.10	\N	2026-01-10 00:56:12.243-03	2026-01-10 00:56:12.242-03	2026-01-17 00:56:12.242-03	f	\N	cmk7rw70p004v8jl1q3xijs9g
75a580d3-7ae6-485d-a979-4e5f0ddb6bb6	tutor	10.0.0.11	\N	2026-01-10 00:56:12.724-03	2026-01-10 00:56:12.723-03	2026-01-17 00:56:12.723-03	f	\N	cmk7rw7h2005t8jl1prcj7v8n
dfeb3ac7-a976-4e5e-a6ea-67d045eace76	estudiante	10.0.0.12	\N	2026-01-10 00:56:13.266-03	2026-01-10 00:56:13.265-03	2026-01-17 00:56:13.265-03	f	\N	cmk7rw7vx005x8jl1skhzfxki
40ecb1a0-a5c0-45a8-9795-efaf498fcd59	tutor	10.0.0.13	\N	2026-01-10 00:56:13.715-03	2026-01-10 00:56:13.714-03	2026-01-17 00:56:13.714-03	f	\N	cmk7rw88j00638jl12q65hn34
ec1b8f5b-a599-4347-a098-891fdcad1837	tutor	10.0.0.14	\N	2026-01-10 00:56:14.267-03	2026-01-10 00:56:14.266-03	2026-01-17 00:56:14.266-03	f	\N	cmk7rw8l700658jl1cfbeccu1
c054067c-340b-4eec-a7f0-3e7660af3006	tutor	10.0.0.15	\N	2026-01-10 00:56:14.716-03	2026-01-10 00:56:14.715-03	2026-01-17 00:56:14.715-03	f	\N	cmk7rw901006w8jl18jo9owra
4bb25ed5-9a04-44f6-97a4-905ff1104431	tutor	10.0.0.16	\N	2026-01-10 00:56:15.257-03	2026-01-10 00:56:15.256-03	2026-01-17 00:56:15.256-03	f	\N	cmk7rw9cw006y8jl103w7n3xl
906afdc9-37ba-4f56-8707-fee3f545706f	tutor	10.0.0.17	\N	2026-01-10 00:56:15.812-03	2026-01-10 00:56:15.811-03	2026-01-17 00:56:15.811-03	f	\N	cmk7rw9sa007p8jl1r657guwd
ecfeee18-db9d-42bd-a2c9-0f6733292099	tutor	10.0.0.18	\N	2026-01-10 00:56:16.399-03	2026-01-10 00:56:16.398-03	2026-01-17 00:56:16.397-03	f	\N	cmk7rwa8p008e8jl135s01kyk
a623f624-2c33-4155-bc5e-fe91f78980db	tutor	10.0.0.19	\N	2026-01-10 00:56:16.973-03	2026-01-10 00:56:16.972-03	2026-01-17 00:56:16.972-03	f	\N	cmk7rwaob00958jl12a1gbmc3
8773166d-5240-4c0c-abf9-199347d3f813	tutor	10.0.0.20	\N	2026-01-10 00:56:17.546-03	2026-01-10 00:56:17.545-03	2026-01-17 00:56:17.545-03	f	\N	cmk7rwb4j00a58jl1p1k78wgp
3260794f-8e2e-409b-8040-4f2f9fffb697	tutor	10.0.0.1	\N	2026-01-10 01:01:20.804-03	2026-01-10 01:01:20.803-03	2026-01-17 01:01:20.803-03	f	\N	cmk7s2t5v00008jhr4shs5kea
d0e1f1bb-5926-4b3f-ac02-6c1844ccea5f	estudiante	10.0.0.2	\N	2026-01-10 01:01:21.369-03	2026-01-10 01:01:21.368-03	2026-01-17 01:01:21.368-03	f	\N	cmk7s2tlx00048jhr610tn3p9
20d22649-9a11-486d-91cf-5e8a5dddb24b	tutor	10.0.0.3	\N	2026-01-10 01:01:21.875-03	2026-01-10 01:01:21.874-03	2026-01-17 01:01:21.874-03	f	\N	cmk7s2u0g000a8jhreprqhvyq
caa6a717-7fb5-4928-8cf0-d471f8355152	tutor	10.0.0.4	\N	2026-01-10 01:01:22.434-03	2026-01-10 01:01:22.433-03	2026-01-17 01:01:22.433-03	f	\N	cmk7s2udc000c8jhrkcr0cmrn
e23d3153-1299-4e01-8d6a-9ea272dad864	tutor	10.0.0.5	\N	2026-01-10 01:01:23.05-03	2026-01-10 01:01:23.049-03	2026-01-17 01:01:23.049-03	f	\N	cmk7s2uxb001m8jhrs2za6xij
a84b3b9c-a840-4d46-b1c9-436a5bb9ced2	tutor	10.0.0.6	\N	2026-01-10 01:01:23.608-03	2026-01-10 01:01:23.607-03	2026-01-17 01:01:23.607-03	f	\N	cmk7s2v9y001o8jhrtrc47wcz
69f245be-094b-470a-b24a-0a048d3226f0	tutor	10.0.0.7	\N	2026-01-10 01:01:24.174-03	2026-01-10 01:01:24.174-03	2026-01-17 01:01:24.174-03	f	\N	cmk7s2vpp002f8jhrvm75rtga
ce59f444-559d-4652-8835-114f81195448	tutor	10.0.0.8	\N	2026-01-10 01:01:24.781-03	2026-01-10 01:01:24.78-03	2026-01-17 01:01:24.78-03	f	\N	cmk7s2w5u00368jhr5cv4c86z
bdbe656a-c3bc-4a1b-94fa-e420f2fa6c2c	tutor	10.0.0.9	\N	2026-01-10 01:01:25.367-03	2026-01-10 01:01:25.367-03	2026-01-17 01:01:25.367-03	f	\N	cmk7s2wmq00428jhr3uo9e3s9
22df3af5-3f48-415a-ba37-9147aeb91d8e	tutor	10.0.0.10	\N	2026-01-10 01:01:25.949-03	2026-01-10 01:01:25.948-03	2026-01-17 01:01:25.948-03	f	\N	cmk7s2x2t004v8jhrmhy9lq41
c3b647da-1743-42d1-af25-a763c6a6c41d	tutor	10.0.0.11	\N	2026-01-10 01:01:26.457-03	2026-01-10 01:01:26.456-03	2026-01-17 01:01:26.456-03	f	\N	cmk7s2xje005t8jhriofb9ll8
8669beed-4a55-47cd-990d-49d402180ed2	estudiante	10.0.0.12	\N	2026-01-10 01:01:26.998-03	2026-01-10 01:01:26.997-03	2026-01-17 01:01:26.997-03	f	\N	cmk7s2xye005x8jhr9x9jgxjd
11cf58d2-f4c7-4a03-9468-eba68fb3b54a	tutor	10.0.0.13	\N	2026-01-10 01:01:27.464-03	2026-01-10 01:01:27.463-03	2026-01-17 01:01:27.463-03	f	\N	cmk7s2ybo00638jhr6uka37b1
2658b73d-d99f-462b-aac6-0a4d0d0ed3a1	tutor	10.0.0.14	\N	2026-01-10 01:01:28.026-03	2026-01-10 01:01:28.025-03	2026-01-17 01:01:28.025-03	f	\N	cmk7s2yoa00658jhrhzb7at1u
d5b9f5de-40a6-4e1b-9a49-aac50c0f40d3	tutor	10.0.0.15	\N	2026-01-10 01:01:28.56-03	2026-01-10 01:01:28.559-03	2026-01-17 01:01:28.559-03	f	\N	cmk7s2z66006w8jhr7t98vadt
21a9d0ec-9532-4f7e-bd54-22b675c5c36f	tutor	10.0.0.16	\N	2026-01-10 01:01:29.159-03	2026-01-10 01:01:29.159-03	2026-01-17 01:01:29.159-03	f	\N	cmk7s2ziu006y8jhrrmhp8jrj
a1fb4f56-10d5-4a2a-a03c-e60bfa30f053	tutor	10.0.0.17	\N	2026-01-10 01:01:29.737-03	2026-01-10 01:01:29.736-03	2026-01-17 01:01:29.736-03	f	\N	cmk7s3008007p8jhricn1asxk
fddad0af-7e2c-446b-83f2-4bdbabd7a8b3	tutor	10.0.0.18	\N	2026-01-10 01:01:30.292-03	2026-01-10 01:01:30.291-03	2026-01-17 01:01:30.291-03	f	\N	cmk7s30fl008e8jhr6nk36gnr
8a4b794e-b6d3-4a31-9c1d-274de0c05e6b	tutor	10.0.0.19	\N	2026-01-10 01:01:30.872-03	2026-01-10 01:01:30.871-03	2026-01-17 01:01:30.871-03	f	\N	cmk7s30vm00958jhrcwy5nlhy
ff22222c-ef74-4978-b359-66f7e4341353	tutor	10.0.0.20	\N	2026-01-10 01:01:31.464-03	2026-01-10 01:01:31.463-03	2026-01-17 01:01:31.463-03	f	\N	cmk7s31c400a58jhrzspjur0m
dbc1c01f-2667-41df-8bac-074437cdc125	estudiante	10.0.0.1	\N	2026-01-10 01:39:13.397-03	2026-01-10 01:39:13.396-03	2026-01-17 01:39:13.396-03	f	\N	cmk7tfiqn00028jjyly9rm5i1
565461cb-c0da-48bf-9173-0652d9329d89	tutor	10.0.0.2	\N	2026-01-10 01:39:13.866-03	2026-01-10 01:39:13.865-03	2026-01-17 01:39:13.865-03	f	\N	cmk7tfj2v00088jjyeeq3b7uc
7812e855-c524-44ec-8cf3-c7d3ce5f418f	tutor	10.0.0.3	\N	2026-01-10 01:39:14.536-03	2026-01-10 01:39:14.535-03	2026-01-17 01:39:14.535-03	f	\N	cmk7tfjft000g8jjywagirluu
9b62237b-dcf4-4084-b2ea-7ef07d807bf8	tutor	10.0.0.4	\N	2026-01-10 01:39:15.149-03	2026-01-10 01:39:15.148-03	2026-01-17 01:39:15.148-03	f	\N	cmk7tfk3d001c8jjyyfsi8h47
8c0c63b5-cb3e-4d89-a3d1-697dbf48378f	tutor	10.0.0.5	\N	2026-01-10 01:39:15.785-03	2026-01-10 01:39:15.784-03	2026-01-17 01:39:15.784-03	f	\N	cmk7tfkfu001s8jjyxh7r93rx
a7ab101f-0a89-4e9d-bcdd-450bc5fe40f6	tutor	10.0.0.6	\N	2026-01-10 01:39:16.412-03	2026-01-10 01:39:16.411-03	2026-01-17 01:39:16.411-03	f	\N	cmk7tfkx2002g8jjyc71u2omt
08af77f4-0825-4cd7-bdd2-16f5a8bf081d	tutor	10.0.0.7	\N	2026-01-10 01:39:17.024-03	2026-01-10 01:39:17.023-03	2026-01-17 01:39:17.023-03	f	\N	cmk7tflek00348jjy9y8lb7wc
e02c1ffa-e915-46a7-9172-0001b145bcf1	tutor	10.0.0.8	\N	2026-01-10 01:39:17.666-03	2026-01-10 01:39:17.665-03	2026-01-17 01:39:17.665-03	f	\N	cmk7tflvm003s8jjyw3n379ni
bc566c6e-af91-4fb3-8f24-98ff837ace28	tutor	10.0.0.9	\N	2026-01-10 01:39:18.286-03	2026-01-10 01:39:18.285-03	2026-01-17 01:39:18.285-03	f	\N	cmk7tfmdc004g8jjy506kzrfu
f31e960e-3969-4a72-bb4c-08c16f891555	tutor	10.0.0.10	\N	2026-01-10 01:39:18.9-03	2026-01-10 01:39:18.899-03	2026-01-17 01:39:18.899-03	f	\N	cmk7tfmug00548jjyvnylwdpw
3eff0bea-686d-49c5-aafb-f6761689f113	tutor	10.0.0.11	\N	2026-01-10 01:39:19.521-03	2026-01-10 01:39:19.52-03	2026-01-17 01:39:19.52-03	f	\N	cmk7tfnbj005s8jjyqm35a05z
409679e3-7be1-4f40-ac4c-0de101ca1455	tutor	10.0.0.12	\N	2026-01-10 01:39:20.127-03	2026-01-10 01:39:20.126-03	2026-01-17 01:39:20.126-03	f	\N	cmk7tfnsm006g8jjyidzymhdj
5ee3ecd1-b6ec-4b3e-9d13-5a0002cd184c	tutor	10.0.0.13	\N	2026-01-10 01:39:20.761-03	2026-01-10 01:39:20.76-03	2026-01-17 01:39:20.76-03	f	\N	cmk7tfo9l00748jjyiauua71t
18cab847-69da-456e-815f-25b6ad39b3ac	tutor	10.0.0.14	\N	2026-01-10 01:39:21.36-03	2026-01-10 01:39:21.359-03	2026-01-17 01:39:21.359-03	f	\N	cmk7tfor7007s8jjyzwbff8rx
a54e5770-513b-430f-b3de-320fcb26f681	tutor	10.0.0.15	\N	2026-01-10 01:39:21.975-03	2026-01-10 01:39:21.974-03	2026-01-17 01:39:21.974-03	f	\N	cmk7tfp7x008g8jjymmyi26tm
59b72721-4d54-4db9-8a98-57565da7e762	tutor	10.0.0.16	\N	2026-01-10 01:39:22.584-03	2026-01-10 01:39:22.583-03	2026-01-17 01:39:22.583-03	f	\N	cmk7tfpoz00948jjyqd9i9bmj
20f683d9-8fcd-4568-bb2e-6af1478b366d	tutor	10.0.0.17	\N	2026-01-10 01:39:23.225-03	2026-01-10 01:39:23.224-03	2026-01-17 01:39:23.224-03	f	\N	cmk7tfq6b009s8jjyfit0lw7e
06c90b15-0da1-4836-85ec-32652bdc516e	tutor	10.0.0.18	\N	2026-01-10 01:39:23.856-03	2026-01-10 01:39:23.855-03	2026-01-17 01:39:23.855-03	f	\N	cmk7tfqny00ag8jjyyqg8n0dd
ef7d51b6-76d1-410f-96ac-db0950e5534e	tutor	10.0.0.19	\N	2026-01-10 01:39:24.473-03	2026-01-10 01:39:24.472-03	2026-01-17 01:39:24.472-03	f	\N	cmk7tfr5600b48jjyt1ea9syj
7b40fc6a-9083-4ae4-bb0d-0089df192b3d	tutor	10.0.0.20	\N	2026-01-10 01:39:25.22-03	2026-01-10 01:39:25.219-03	2026-01-17 01:39:25.219-03	f	\N	cmk7tfrmd00bs8jjyxu6n3j99
1209c36f-289f-40e4-b639-6af5a4704742	estudiante	10.0.0.1	\N	2026-01-10 01:40:52.699-03	2026-01-10 01:40:52.698-03	2026-01-17 01:40:52.698-03	f	\N	cmk7thndl00028je7a1zf6fb0
7e6f2e21-8e5e-48a9-86c9-7869f96c94af	tutor	10.0.0.2	\N	2026-01-10 01:40:53.184-03	2026-01-10 01:40:53.183-03	2026-01-17 01:40:53.183-03	f	\N	cmk7thnpj00088je71x2c61bu
640a7fd1-0012-4415-bfb4-fed4a1da2806	tutor	10.0.0.3	\N	2026-01-10 01:40:53.772-03	2026-01-10 01:40:53.771-03	2026-01-17 01:40:53.771-03	f	\N	cmk7tho2e000g8je7452o1qph
39a8b88f-8e21-4aef-a4f4-47c9b1de0ccf	tutor	10.0.0.4	\N	2026-01-10 01:40:54.387-03	2026-01-10 01:40:54.386-03	2026-01-17 01:40:54.386-03	f	\N	cmk7thoom001c8je71v87p21f
327c2264-62be-4220-9d80-1c9b5bd69618	tutor	10.0.0.5	\N	2026-01-10 01:40:54.984-03	2026-01-10 01:40:54.983-03	2026-01-17 01:40:54.983-03	f	\N	cmk7thp09001s8je74fnm0r1x
c68571c3-81d3-4dc9-bf75-d70837c3b4b3	tutor	10.0.0.6	\N	2026-01-10 01:40:55.575-03	2026-01-10 01:40:55.574-03	2026-01-17 01:40:55.574-03	f	\N	cmk7thpgo002g8je7duvs8beb
9b401c8b-0667-4cb2-a041-604352c3f573	tutor	10.0.0.7	\N	2026-01-10 01:40:56.167-03	2026-01-10 01:40:56.166-03	2026-01-17 01:40:56.166-03	f	\N	cmk7thpx200348je7h2gd0znu
2be9268b-f9e4-426e-a131-19729c3bcbe8	tutor	10.0.0.8	\N	2026-01-10 01:40:56.764-03	2026-01-10 01:40:56.763-03	2026-01-17 01:40:56.763-03	f	\N	cmk7thqdg003s8je71pip8bqz
08207ecc-3a32-47c9-9b10-6afc15732260	tutor	10.0.0.9	\N	2026-01-10 01:40:57.353-03	2026-01-10 01:40:57.352-03	2026-01-17 01:40:57.352-03	f	\N	cmk7thqtz004g8je78xqo2wnh
3fae19ce-a3a2-4f09-899d-ae48210ac922	tutor	10.0.0.10	\N	2026-01-10 01:40:57.938-03	2026-01-10 01:40:57.937-03	2026-01-17 01:40:57.937-03	f	\N	cmk7thrac00548je7e3coko5o
d81f4b77-a3d1-4a72-9ff3-44ce180b54b1	tutor	10.0.0.11	\N	2026-01-10 01:40:58.539-03	2026-01-10 01:40:58.538-03	2026-01-17 01:40:58.538-03	f	\N	cmk7thrqr005s8je7nqdxgytm
c675941d-e847-445f-9954-dcd576b2a696	tutor	10.0.0.12	\N	2026-01-10 01:40:59.119-03	2026-01-10 01:40:59.118-03	2026-01-17 01:40:59.118-03	f	\N	cmk7ths7a006g8je7uopwyb12
cfbf2a74-b516-4353-84f3-c7b4a225b910	tutor	10.0.0.13	\N	2026-01-10 01:40:59.712-03	2026-01-10 01:40:59.711-03	2026-01-17 01:40:59.711-03	f	\N	cmk7thsnd00748je7bwomibmi
b8050ab0-b07d-4852-b445-dbd1046609df	tutor	10.0.0.14	\N	2026-01-10 01:41:00.32-03	2026-01-10 01:41:00.319-03	2026-01-17 01:41:00.319-03	f	\N	cmk7tht46007s8je71wpxil8k
7d137bc7-5bbe-4a8d-bb68-e307f6641ed6	tutor	10.0.0.15	\N	2026-01-10 01:41:00.912-03	2026-01-10 01:41:00.911-03	2026-01-17 01:41:00.911-03	f	\N	cmk7thtkx008g8je7rdot6vp5
5ed19287-a454-43b8-a421-f493a55bc899	tutor	10.0.0.16	\N	2026-01-10 01:41:01.495-03	2026-01-10 01:41:01.494-03	2026-01-17 01:41:01.494-03	f	\N	cmk7thu1c00948je7tlzscecy
19e1aa51-8cfa-4992-9ebf-ecad022a7f5b	tutor	10.0.0.17	\N	2026-01-10 01:41:02.083-03	2026-01-10 01:41:02.082-03	2026-01-17 01:41:02.082-03	f	\N	cmk7thuhg009s8je7jqx8m2xg
0f75b151-d78f-4828-9f43-ef5ad142938b	tutor	10.0.0.18	\N	2026-01-10 01:41:02.68-03	2026-01-10 01:41:02.68-03	2026-01-17 01:41:02.68-03	f	\N	cmk7thuxz00ag8je7uujk7r8h
a1e7d91d-2e1b-4c00-a0f3-21f6bcac93fd	tutor	10.0.0.19	\N	2026-01-10 01:41:03.282-03	2026-01-10 01:41:03.281-03	2026-01-17 01:41:03.281-03	f	\N	cmk7thvej00b48je72gae34n4
c85ba705-92d1-4d74-92ba-2208c3bf2f25	tutor	10.0.0.20	\N	2026-01-10 01:41:03.99-03	2026-01-10 01:41:03.989-03	2026-01-17 01:41:03.989-03	f	\N	cmk7thvv400bs8je7z21bmvzg
ed9fadf9-e379-4267-9bcd-665a46094012	estudiante	10.0.0.1	\N	2026-01-10 01:51:32.354-03	2026-01-10 01:51:32.353-03	2026-01-17 01:51:32.353-03	f	\N	cmk7tvcw500028jjlwur7ebb5
f540e5a6-caae-42db-85af-2d8d0d3bb1d1	tutor	10.0.0.2	\N	2026-01-10 01:51:32.922-03	2026-01-10 01:51:32.921-03	2026-01-17 01:51:32.921-03	f	\N	cmk7tvdam00088jjlu996e69i
6a5c3560-fb94-4d0a-b0b8-8b6165c4cca9	tutor	10.0.0.3	\N	2026-01-10 01:51:33.617-03	2026-01-10 01:51:33.615-03	2026-01-17 01:51:33.615-03	f	\N	cmk7tvdpk000g8jjlizg0kgu9
56fab50f-f82f-4672-b0ae-85c06b86c22a	tutor	10.0.0.4	\N	2026-01-10 01:51:34.307-03	2026-01-10 01:51:34.307-03	2026-01-17 01:51:34.307-03	f	\N	cmk7tvef600148jjldny5x5am
0532bceb-26c4-4546-9825-b8499afc1a0e	tutor	10.0.0.5	\N	2026-01-10 01:51:35.017-03	2026-01-10 01:51:35.015-03	2026-01-17 01:51:35.015-03	f	\N	cmk7tvesr00188jjlgf5te9w3
02bb028f-b196-4963-b8e6-dc271dcd34ca	tutor	10.0.0.6	\N	2026-01-10 01:51:35.691-03	2026-01-10 01:51:35.69-03	2026-01-17 01:51:35.69-03	f	\N	cmk7tvfbu001k8jjlrluuydwn
b151a2ad-3b1d-4f5a-b9eb-dab5cb7551ce	tutor	10.0.0.7	\N	2026-01-10 01:51:36.371-03	2026-01-10 01:51:36.37-03	2026-01-17 01:51:36.37-03	f	\N	cmk7tvfuj00208jjl9skfqlju
14826986-b36f-406f-b8c0-e8411c73ae8f	tutor	10.0.0.8	\N	2026-01-10 01:51:37.037-03	2026-01-10 01:51:37.036-03	2026-01-17 01:51:37.036-03	f	\N	cmk7tvgde002c8jjl7yhyrpvy
2b5643e6-63a2-4e06-9866-13ece91ef5fa	tutor	10.0.0.9	\N	2026-01-10 01:51:37.7-03	2026-01-10 01:51:37.699-03	2026-01-17 01:51:37.699-03	f	\N	cmk7tvgvj002o8jjlyb0vmyw3
ef7fafd7-5fcc-415e-9c9c-571fd1424388	tutor	10.0.0.10	\N	2026-01-10 01:51:38.354-03	2026-01-10 01:51:38.353-03	2026-01-17 01:51:38.353-03	f	\N	cmk7tvhdv00308jjlzudluf4z
daa27e21-9d67-41ae-bfaa-b0a862ac46a5	tutor	10.0.0.11	\N	2026-01-10 01:51:39.02-03	2026-01-10 01:51:39.02-03	2026-01-17 01:51:39.02-03	f	\N	cmk7tvhwc003g8jjlwt2zr56k
8028e49c-60ed-4a69-b211-cf7eaa10cdf7	tutor	10.0.0.12	\N	2026-01-10 01:51:39.698-03	2026-01-10 01:51:39.698-03	2026-01-17 01:51:39.698-03	f	\N	cmk7tviei003s8jjl5v56445k
d05b5236-df74-4a66-8d94-1c4750e75997	tutor	10.0.0.13	\N	2026-01-10 01:51:40.374-03	2026-01-10 01:51:40.373-03	2026-01-17 01:51:40.373-03	f	\N	cmk7tvixg00448jjl0fnpyai3
abb88261-96f1-42d1-8740-bea7889d9005	tutor	10.0.0.14	\N	2026-01-10 01:51:41.046-03	2026-01-10 01:51:41.045-03	2026-01-17 01:51:41.045-03	f	\N	cmk7tvjgo004m8jjl65lx2dd6
fcaf1529-ae46-438f-a8e8-cb596be68f25	tutor	10.0.0.15	\N	2026-01-10 01:51:41.71-03	2026-01-10 01:51:41.709-03	2026-01-17 01:51:41.709-03	f	\N	cmk7tvjyw004y8jjl2xfluk5l
5366a76e-f855-4696-991f-50adbda00e72	tutor	10.0.0.16	\N	2026-01-10 01:51:42.371-03	2026-01-10 01:51:42.37-03	2026-01-17 01:51:42.37-03	f	\N	cmk7tvkhd005a8jjlur09zftj
c92f0bd5-e811-40f7-96b6-aafcf4a49a8d	tutor	10.0.0.17	\N	2026-01-10 01:51:43.035-03	2026-01-10 01:51:43.034-03	2026-01-17 01:51:43.034-03	f	\N	cmk7tvkzy005q8jjlxyfc1rm2
517ac762-0cff-4906-bee9-03e795eacf0e	tutor	10.0.0.18	\N	2026-01-10 01:51:43.705-03	2026-01-10 01:51:43.704-03	2026-01-17 01:51:43.704-03	f	\N	cmk7tvlib00668jjluuboa7u8
99391166-efe8-4da4-b2ac-432616c95607	tutor	10.0.0.19	\N	2026-01-10 01:51:44.375-03	2026-01-10 01:51:44.374-03	2026-01-17 01:51:44.374-03	f	\N	cmk7tvm0y006m8jjlrb9jf7nd
e3f40318-847c-4bd2-8541-c8f773e78e53	tutor	10.0.0.20	\N	2026-01-10 01:51:45.056-03	2026-01-10 01:51:45.055-03	2026-01-17 01:51:45.055-03	f	\N	cmk7tvmk300768jjl00gk9g92
b11c8072-8d65-4efe-bef0-92837a6403ac	tutor	10.0.0.21	\N	2026-01-10 01:51:45.894-03	2026-01-10 01:51:45.893-03	2026-01-17 01:51:45.893-03	f	\N	cmk7tvn39007u8jjlu6hol8gz
21150f03-d269-4204-ab0a-bba5db76d950	estudiante	10.0.0.1	\N	2026-01-10 01:54:41.076-03	2026-01-10 01:54:41.075-03	2026-01-17 01:54:41.075-03	f	\N	cmk7tzeir00028jex7qvvuk3r
dcb9ad5b-138c-4cad-a9dd-2d8b45a92746	tutor	10.0.0.2	\N	2026-01-10 01:54:41.614-03	2026-01-10 01:54:41.613-03	2026-01-17 01:54:41.613-03	f	\N	cmk7tzew700088jexpzczqcvb
7ae392ca-5c14-4dcc-9920-9192713d824e	tutor	10.0.0.3	\N	2026-01-10 01:54:42.276-03	2026-01-10 01:54:42.275-03	2026-01-17 01:54:42.275-03	f	\N	cmk7tzfap000g8jexmx5uehwg
ca4bdc1c-f6d7-4f35-82b3-9bb54c87f01e	tutor	10.0.0.4	\N	2026-01-10 01:54:42.959-03	2026-01-10 01:54:42.958-03	2026-01-17 01:54:42.958-03	f	\N	cmk7tzfzg00148jexbaiz9fsu
4f700a83-fde1-4f6c-8fad-6be0b3a9bd0b	tutor	10.0.0.5	\N	2026-01-10 01:54:43.639-03	2026-01-10 01:54:43.638-03	2026-01-17 01:54:43.638-03	f	\N	cmk7tzgce00188jex7awwnuw9
96a760d4-7533-4c6f-b8a1-bb097cfe7d2f	tutor	10.0.0.6	\N	2026-01-10 01:54:44.295-03	2026-01-10 01:54:44.294-03	2026-01-17 01:54:44.294-03	f	\N	cmk7tzguz001k8jexzkqd6cd6
cb9289da-4401-4a4b-b448-ac68cdb6cb70	tutor	10.0.0.7	\N	2026-01-10 01:54:44.969-03	2026-01-10 01:54:44.968-03	2026-01-17 01:54:44.968-03	f	\N	cmk7tzhdj00208jexdb0aagys
f6adc6a4-b658-480f-a54d-88d68eeaf81f	tutor	10.0.0.8	\N	2026-01-10 01:54:45.672-03	2026-01-10 01:54:45.672-03	2026-01-17 01:54:45.671-03	f	\N	cmk7tzhw1002c8jexymvgnbvs
ec82cf38-8cc4-4063-9467-757612bff779	tutor	10.0.0.9	\N	2026-01-10 01:54:46.332-03	2026-01-10 01:54:46.331-03	2026-01-17 01:54:46.331-03	f	\N	cmk7tzife002o8jex0jev83jp
3362084a-de5a-48dc-9c4f-6da0ccee3e7f	tutor	10.0.0.10	\N	2026-01-10 01:54:47.017-03	2026-01-10 01:54:47.016-03	2026-01-17 01:54:47.016-03	f	\N	cmk7tzixp00308jexgqbfbs7i
2c3dae03-9378-4b52-84a0-8ce3fcd24065	tutor	10.0.0.11	\N	2026-01-10 01:54:47.788-03	2026-01-10 01:54:47.787-03	2026-01-17 01:54:47.787-03	f	\N	cmk7tzjhl003g8jex9et6uvpl
4518bce3-3c76-4ad3-ac1c-594e6f6fc74c	tutor	10.0.0.12	\N	2026-01-10 01:54:48.484-03	2026-01-10 01:54:48.484-03	2026-01-17 01:54:48.484-03	f	\N	cmk7tzk2h003s8jex7fbdlnf7
d5511e8e-656c-4bc1-8398-afe85ddaf38a	tutor	10.0.0.13	\N	2026-01-10 01:54:49.182-03	2026-01-10 01:54:49.181-03	2026-01-17 01:54:49.181-03	f	\N	cmk7tzklh00448jexw29na4l0
514af942-1fc5-4ca2-b00a-212765432b65	tutor	10.0.0.14	\N	2026-01-10 01:54:49.874-03	2026-01-10 01:54:49.873-03	2026-01-17 01:54:49.873-03	f	\N	cmk7tzl5x004m8jex84acbscu
5f5e5f05-813b-4ce8-b11a-2f57f6eab1c7	tutor	10.0.0.15	\N	2026-01-10 01:54:50.531-03	2026-01-10 01:54:50.53-03	2026-01-17 01:54:50.53-03	f	\N	cmk7tzlo5004y8jex9rkgmyi3
5b8b64f3-ef26-4264-993b-813777a306c6	tutor	10.0.0.16	\N	2026-01-10 01:54:51.199-03	2026-01-10 01:54:51.198-03	2026-01-17 01:54:51.198-03	f	\N	cmk7tzm6p005a8jexut3y8sfh
924dadcb-a489-44a5-92a4-9b8430f1576c	tutor	10.0.0.17	\N	2026-01-10 01:54:51.867-03	2026-01-10 01:54:51.866-03	2026-01-17 01:54:51.866-03	f	\N	cmk7tzmp9005q8jexjn4n5jps
05fb47cf-e131-4ab1-9b55-020ab2f8688a	tutor	10.0.0.18	\N	2026-01-10 01:54:52.64-03	2026-01-10 01:54:52.64-03	2026-01-17 01:54:52.64-03	f	\N	cmk7tzn7p00668jexmumcno8f
76508b42-2a8e-491d-b526-74d4a9698ca7	tutor	10.0.0.19	\N	2026-01-10 01:54:53.34-03	2026-01-10 01:54:53.339-03	2026-01-17 01:54:53.339-03	f	\N	cmk7tznt6006m8jexkv6yf52q
0a8f7041-ca50-42d9-9f30-8461fdc51588	tutor	10.0.0.20	\N	2026-01-10 01:54:54.073-03	2026-01-10 01:54:54.072-03	2026-01-17 01:54:54.072-03	f	\N	cmk7tzods00768jexza25vmoa
b8a0162d-535f-42a4-9123-1d83fd0cb23c	tutor	10.0.0.21	\N	2026-01-10 01:54:54.908-03	2026-01-10 01:54:54.907-03	2026-01-17 01:54:54.907-03	f	\N	cmk7tzoxz007u8jexciywf2fm
16f95f06-8a7d-4e82-8e1d-b7b365821095	estudiante	10.0.0.1	\N	2026-01-10 01:57:21.178-03	2026-01-10 01:57:21.177-03	2026-01-17 01:57:21.177-03	f	\N	cmk7u2u1y00028j6ic3shhrgn
bda7a41a-32a9-41d4-9b5c-b05e840f627d	tutor	10.0.0.2	\N	2026-01-10 01:57:21.714-03	2026-01-10 01:57:21.714-03	2026-01-17 01:57:21.714-03	f	\N	cmk7u2ufh00088j6iga7mqdlj
061ed77c-032b-4ce7-8278-8201804ecf94	tutor	10.0.0.3	\N	2026-01-10 01:57:22.382-03	2026-01-10 01:57:22.381-03	2026-01-17 01:57:22.381-03	f	\N	cmk7u2utx000g8j6imo93bvf2
2ea1488a-0237-4357-a8ba-01c52e8dc6a5	tutor	10.0.0.4	\N	2026-01-10 01:57:23.067-03	2026-01-10 01:57:23.066-03	2026-01-17 01:57:23.066-03	f	\N	cmk7u2vir00148j6il6titueo
41a56c74-045d-4801-81d7-765cd091c582	tutor	10.0.0.5	\N	2026-01-10 01:57:23.741-03	2026-01-10 01:57:23.74-03	2026-01-17 01:57:23.74-03	f	\N	cmk7u2vvo00188j6ibd5rpa77
3d6e00c8-d26f-4b31-b2ea-3cd5735ed659	tutor	10.0.0.6	\N	2026-01-10 01:57:24.398-03	2026-01-10 01:57:24.397-03	2026-01-17 01:57:24.397-03	f	\N	cmk7u2wec001k8j6ia6qfn4o9
5d9decc7-e712-44f0-ba37-b6df0254e1b0	tutor	10.0.0.7	\N	2026-01-10 01:57:25.069-03	2026-01-10 01:57:25.069-03	2026-01-17 01:57:25.069-03	f	\N	cmk7u2wws00208j6inmxsphrl
f205074f-ac7b-4ba2-9257-a54b70a7820d	tutor	10.0.0.8	\N	2026-01-10 01:57:25.725-03	2026-01-10 01:57:25.724-03	2026-01-17 01:57:25.724-03	f	\N	cmk7u2xf3002c8j6isrzuyceu
e65ceb33-4020-40c5-9d6a-9ccbcce650fa	tutor	10.0.0.9	\N	2026-01-10 01:57:26.376-03	2026-01-10 01:57:26.376-03	2026-01-17 01:57:26.376-03	f	\N	cmk7u2xx6002o8j6ijp7ba224
52859c30-38fc-4d8e-b083-888e0169ce55	tutor	10.0.0.10	\N	2026-01-10 01:57:27.031-03	2026-01-10 01:57:27.03-03	2026-01-17 01:57:27.03-03	f	\N	cmk7u2yfb00308j6ifl6gslfi
6cb4cb46-6e27-4416-b69f-676cd4909a37	tutor	10.0.0.11	\N	2026-01-10 01:57:27.69-03	2026-01-10 01:57:27.689-03	2026-01-17 01:57:27.689-03	f	\N	cmk7u2yxr003g8j6idsta2ykt
a159dcf2-7093-4211-a83c-e6d48966a8ca	tutor	10.0.0.12	\N	2026-01-10 01:57:28.347-03	2026-01-10 01:57:28.346-03	2026-01-17 01:57:28.346-03	f	\N	cmk7u2zft003s8j6i4lysv1v1
bbb1d2be-6f9c-4740-a932-5fd1e4c2a6ff	tutor	10.0.0.13	\N	2026-01-10 01:57:29.012-03	2026-01-10 01:57:29.011-03	2026-01-17 01:57:29.011-03	f	\N	cmk7u2zyc00448j6io00hraey
d6ce1f48-f2b0-4f3e-b6ef-d1295235bf10	tutor	10.0.0.14	\N	2026-01-10 01:57:29.739-03	2026-01-10 01:57:29.738-03	2026-01-17 01:57:29.738-03	f	\N	cmk7u30io004m8j6icrplsevc
26dcde17-4fd2-4b20-87ef-57bc7235c395	tutor	10.0.0.15	\N	2026-01-10 01:57:30.393-03	2026-01-10 01:57:30.392-03	2026-01-17 01:57:30.392-03	f	\N	cmk7u310q004y8j6ifq7jmyco
3efca678-5469-4109-becd-1169b25d8976	tutor	10.0.0.16	\N	2026-01-10 01:57:31.052-03	2026-01-10 01:57:31.051-03	2026-01-17 01:57:31.051-03	f	\N	cmk7u31ix005a8j6i568dt84h
09b5073a-0b32-4060-9937-26d892faae71	tutor	10.0.0.17	\N	2026-01-10 01:57:31.731-03	2026-01-10 01:57:31.73-03	2026-01-17 01:57:31.73-03	f	\N	cmk7u321j005q8j6id0l2p8wc
c24b07d0-db01-434c-9b5d-17876fe64a41	tutor	10.0.0.18	\N	2026-01-10 01:57:32.4-03	2026-01-10 01:57:32.399-03	2026-01-17 01:57:32.399-03	f	\N	cmk7u32kh00668j6ip6apn8nm
f69a1ce1-233a-474c-9c8e-32dca6c89961	tutor	10.0.0.19	\N	2026-01-10 01:57:33.079-03	2026-01-10 01:57:33.078-03	2026-01-17 01:57:33.078-03	f	\N	cmk7u333b006m8j6iyi3fgtcp
053b051e-c9f7-403b-8e21-128952306ceb	tutor	10.0.0.20	\N	2026-01-10 01:57:33.767-03	2026-01-10 01:57:33.766-03	2026-01-17 01:57:33.766-03	f	\N	cmk7u33m700768j6ib3uqro48
8ca883ae-5eb7-4dbd-9a52-0da8236807ef	tutor	10.0.0.21	\N	2026-01-10 01:57:34.618-03	2026-01-10 01:57:34.617-03	2026-01-17 01:57:34.617-03	f	\N	cmk7u3465007u8j6ig4crqpbr
a4051c54-7433-427e-a37b-437946064c09	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 13:57:16.388-03	2026-01-10 13:57:16.387-03	2026-01-17 13:57:16.387-03	t	user_logout	cmk8js7df00008jbqbr0qt8z6
2c35769b-c93c-4db0-bc2f-84a2405362a0	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:03:32.442-03	2026-01-10 14:03:32.441-03	2026-01-17 14:03:32.44-03	t	user_logout	cmk8jyqmo00038jeke4jxgcs9
2691065e-06a9-4b8a-bfb1-e8bb579e6e32	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:04:06.352-03	2026-01-10 14:04:06.351-03	2026-01-17 14:04:06.351-03	f	\N	cmk8js7df00008jbqbr0qt8z6
608c0b4e-a9b0-4575-8e3d-00a2dc2ebbab	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:04:12.522-03	2026-01-10 14:04:12.521-03	2026-01-17 14:04:12.521-03	t	user_logout	cmk8js7df00008jbqbr0qt8z6
53f73073-220e-4f12-a8fa-9b417de4f6a3	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:07:41.404-03	2026-01-10 14:07:41.403-03	2026-01-17 14:07:41.403-03	t	user_logout	cmk8js7df00008jbqbr0qt8z6
d5b822ab-aadb-460e-88aa-a081b3b87d24	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:08:44.095-03	2026-01-10 14:08:44.094-03	2026-01-17 14:08:44.094-03	t	user_logout	cmk8js7df00008jbqbr0qt8z6
a45f892b-30eb-441c-8605-48ca7cecff3f	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:09:26.705-03	2026-01-10 14:09:26.703-03	2026-01-17 14:09:26.703-03	t	user_logout	cmk8jyqmo00038jeke4jxgcs9
7d03e023-0a7f-4187-b333-70dc2b93a341	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:11:07.83-03	2026-01-10 14:11:07.829-03	2026-01-17 14:11:07.829-03	f	\N	cmk8js7df00008jbqbr0qt8z6
d959f404-2192-4291-a9f1-b92d0521717d	estudiante	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 14:13:31.35-03	2026-01-10 14:13:31.349-03	2026-01-17 14:13:31.349-03	f	\N	cmk8jyqmo00038jeke4jxgcs9
b8cfeaf3-74a4-4600-9a44-b58893bb5101	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-10 22:58:44.212-03	2026-01-10 22:58:44.211-03	2026-01-17 22:58:44.211-03	f	\N	cmk8js7df00008jbqbr0qt8z6
66fb18e5-48cd-4ee5-b388-a253354da1de	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-11 00:32:29.49-03	2026-01-11 00:32:29.488-03	2026-01-18 00:32:29.488-03	f	\N	cmk8js7df00008jbqbr0qt8z6
\.


--
-- Data for Name: rutas_especialidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rutas_especialidad (id, nombre, descripcion, "sectorId", activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: secret_rotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secret_rotations (id, secret_type, version, secret_hash, status, created_at, expires_at, rotated_at, rotated_by, metadata) FROM stdin;
cmk8mghho00008j3by8nskqne	JWT_SECRET	1	9caf06bb4436cdbfa20af9121a626bc1093c4f54b31c0fa937957856135345b6	active	2026-01-10 18:11:46.955	2026-04-10 18:11:46.955	\N	\N	\N
cmk8mghhu00018j3bgg5uhilc	WEBHOOK_SECRET	1	d4d0f3c54b0f3c0b500bf62607b52f14d91882a1fa855c210f36e649cc32430c	active	2026-01-10 18:11:46.961	2026-04-10 18:11:46.961	\N	\N	\N
\.


--
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sectores (id, nombre, descripcion, color, icono, activo, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: seguimientos_observacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seguimientos_observacion (id, observacion_id, autor_id, autor_tipo, contenido, created_at) FROM stdin;
\.


--
-- Data for Name: suscripciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suscripciones (id, tutor_id, plan_id, mp_preapproval_id, mp_status, estado, fecha_inicio, fecha_proximo_cobro, fecha_cancelacion, fecha_pausa, fecha_fin_pausa, dias_gracia_usados, fecha_inicio_gracia, descuento_porcentaje, precio_final, motivo_cancelacion, cancelado_por, created_at, updated_at, version) FROM stdin;
\.


--
-- Data for Name: tareas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tareas (id, evento_id, estado, prioridad, porcentaje_completado, categoria, etiquetas, subtareas, archivos, clase_relacionada_id, estudiante_relacionado_id, tiempo_estimado_minutos, tiempo_real_minutos, recurrencia, recordatorios, "completedAt") FROM stdin;
\.


--
-- Data for Name: tareas_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tareas_admin (id, title, description, priority, status, "dueDate", assignee, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tareas_asignadas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tareas_asignadas (id, asignacion_id, tarea_clase_id, fecha_asignacion, fecha_limite, activa) FROM stdin;
\.


--
-- Data for Name: tareas_clase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tareas_clase (id, clase_id, contenido_id, orden, obligatoria) FROM stdin;
\.


--
-- Data for Name: tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tiers (id, nombre, precio_mensual, mundos_async, mundos_sync, tiene_docente, descripcion, activo, orden, "createdAt", "updatedAt") FROM stdin;
cmjghf0ym000h8jk6k185hdax	STEAM_LIBROS	40000	3	0	f	Plataforma completa STEAM: Matemáticas + Programación + Ciencias	t	1	2025-12-22 01:33:07.87	2026-01-06 13:41:07.704
cmjghf0yo000i8jk6kngbs797	STEAM_ASINCRONICO	65000	3	0	f	STEAM completo + clases grabadas asincrónicas	t	2	2025-12-22 01:33:07.873	2026-01-06 13:41:07.707
cmjghf0yq000j8jk6309ccdtv	STEAM_SINCRONICO	95000	3	1	t	STEAM completo + clases en vivo con docente	t	3	2025-12-22 01:33:07.875	2026-01-06 13:41:07.708
\.


--
-- Data for Name: transacciones_recurso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transacciones_recurso (id, recursos_estudiante_id, tipo_recurso, cantidad, razon, metadata, fecha, "createdAt") FROM stdin;
\.


--
-- Data for Name: tutores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tutores (id, username, email, password_hash, debe_completar_perfil, fecha_ultimo_cambio, nombre, apellido, dni, cuil, telefono, fecha_registro, ha_completado_onboarding, "createdAt", "updatedAt", roles) FROM stdin;
cmk8m0ai200008jwnqibjagga	\N	tutor-solo-otk43tbv6qdwd7gl77tdjrbw@test.com	hash	f	\N	Tutor	Solo	\N	\N	\N	2026-01-10 17:59:11.402	f	2026-01-10 17:59:11.402	2026-01-10 17:59:11.402	["tutor"]
tutor_test_001	\N	maria.test@example.com	$2b$10$abcdefghijklmnopqrstuv	f	\N	María	González Test	\N	\N	\N	2026-01-11 00:34:56.122	f	2026-01-11 00:34:56.122	2026-01-11 00:34:56.122	["tutor"]
\.


--
-- Data for Name: webhooks_processed; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhooks_processed (id, payment_id, webhook_type, status, external_reference, processed_at, created_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: actividad_feed actividad_feed_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad_feed
    ADD CONSTRAINT actividad_feed_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: alertas alertas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_planificacion asignaciones_planificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_pkey PRIMARY KEY (id);


--
-- Name: asistencia_comision asistencia_comision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_comision
    ADD CONSTRAINT asistencia_comision_pkey PRIMARY KEY (id);


--
-- Name: asistencias_clase_grupo asistencias_clase_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_clase_grupo
    ADD CONSTRAINT asistencias_clase_grupo_pkey PRIMARY KEY (id);


--
-- Name: asistencias_live asistencias_live_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_live
    ADD CONSTRAINT asistencias_live_pkey PRIMARY KEY (id);


--
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: casas casas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casas
    ADD CONSTRAINT casas_pkey PRIMARY KEY (id);


--
-- Name: clase_grupos clase_grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_pkey PRIMARY KEY (id);


--
-- Name: clases clases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_pkey PRIMARY KEY (id);


--
-- Name: clases_planificacion clases_planificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases_planificacion
    ADD CONSTRAINT clases_planificacion_pkey PRIMARY KEY (id);


--
-- Name: colonia_estudiante_cursos colonia_estudiante_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_estudiante_cursos
    ADD CONSTRAINT colonia_estudiante_cursos_pkey PRIMARY KEY (id);


--
-- Name: colonia_estudiantes colonia_estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_estudiantes
    ADD CONSTRAINT colonia_estudiantes_pkey PRIMARY KEY (id);


--
-- Name: colonia_inscripciones colonia_inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_inscripciones
    ADD CONSTRAINT colonia_inscripciones_pkey PRIMARY KEY (id);


--
-- Name: colonia_pagos colonia_pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_pagos
    ADD CONSTRAINT colonia_pagos_pkey PRIMARY KEY (id);


--
-- Name: comisiones comisiones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_pkey PRIMARY KEY (id);


--
-- Name: configuracion_precios configuracion_precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_precios
    ADD CONSTRAINT configuracion_precios_pkey PRIMARY KEY (id);


--
-- Name: contenidos contenidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contenidos
    ADD CONSTRAINT contenidos_pkey PRIMARY KEY (id);


--
-- Name: docentes_casas docentes_casas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_casas
    ADD CONSTRAINT docentes_casas_pkey PRIMARY KEY (id);


--
-- Name: docentes_mundos docentes_mundos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_mundos
    ADD CONSTRAINT docentes_mundos_pkey PRIMARY KEY (id);


--
-- Name: docentes docentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes
    ADD CONSTRAINT docentes_pkey PRIMARY KEY (id);


--
-- Name: docentes_rutas docentes_rutas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT docentes_rutas_pkey PRIMARY KEY (id);


--
-- Name: estados_clase_grupo estados_clase_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_clase_grupo
    ADD CONSTRAINT estados_clase_grupo_pkey PRIMARY KEY (id);


--
-- Name: estudiantes estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_pkey PRIMARY KEY (id);


--
-- Name: eventos eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_pkey PRIMARY KEY (id);


--
-- Name: grupos grupos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_pkey PRIMARY KEY (id);


--
-- Name: historial_acceso_estudiante historial_acceso_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso_estudiante
    ADD CONSTRAINT historial_acceso_estudiante_pkey PRIMARY KEY (id);


--
-- Name: historial_cambio_precios historial_cambio_precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cambio_precios
    ADD CONSTRAINT historial_cambio_precios_pkey PRIMARY KEY (id);


--
-- Name: historial_estado_suscripcion historial_estado_suscripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_estado_suscripcion
    ADD CONSTRAINT historial_estado_suscripcion_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_clase inscripciones_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_comision inscripciones_comision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_comision
    ADD CONSTRAINT inscripciones_comision_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_mensuales inscripciones_mensuales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_pkey PRIMARY KEY (id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- Name: logros_estudiantes_gamificacion logros_estudiantes_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_estudiantes_gamificacion
    ADD CONSTRAINT logros_estudiantes_gamificacion_pkey PRIMARY KEY (id);


--
-- Name: logros_gamificacion logros_gamificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_gamificacion
    ADD CONSTRAINT logros_gamificacion_pkey PRIMARY KEY (id);


--
-- Name: mundos mundos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mundos
    ADD CONSTRAINT mundos_pkey PRIMARY KEY (id);


--
-- Name: nodos_contenido nodos_contenido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nodos_contenido
    ADD CONSTRAINT nodos_contenido_pkey PRIMARY KEY (id);


--
-- Name: notas notas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas
    ADD CONSTRAINT notas_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: observaciones_docente observaciones_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_docente
    ADD CONSTRAINT observaciones_docente_pkey PRIMARY KEY (id);


--
-- Name: observaciones_estudiantes observaciones_estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_estudiantes
    ADD CONSTRAINT observaciones_estudiantes_pkey PRIMARY KEY (observacion_id, estudiante_id);


--
-- Name: pagos_suscripcion pagos_suscripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_suscripcion
    ADD CONSTRAINT pagos_suscripcion_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: planes_suscripcion planes_suscripcion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planes_suscripcion
    ADD CONSTRAINT planes_suscripcion_pkey PRIMARY KEY (id);


--
-- Name: planificaciones planificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planificaciones
    ADD CONSTRAINT planificaciones_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: progreso_contenidos progreso_contenidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_contenidos
    ADD CONSTRAINT progreso_contenidos_pkey PRIMARY KEY (id);


--
-- Name: progresos_clase_estudiante progresos_clase_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresos_clase_estudiante
    ADD CONSTRAINT progresos_clase_estudiante_pkey PRIMARY KEY (id);


--
-- Name: progresos_tarea_estudiante progresos_tarea_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresos_tarea_estudiante
    ADD CONSTRAINT progresos_tarea_estudiante_pkey PRIMARY KEY (id);


--
-- Name: puntos_obtenidos puntos_obtenidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_pkey PRIMARY KEY (id);


--
-- Name: rachas_estudiantes rachas_estudiantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rachas_estudiantes
    ADD CONSTRAINT rachas_estudiantes_pkey PRIMARY KEY (id);


--
-- Name: reacciones_feed reacciones_feed_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reacciones_feed
    ADD CONSTRAINT reacciones_feed_pkey PRIMARY KEY (id);


--
-- Name: recordatorios recordatorios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_pkey PRIMARY KEY (id);


--
-- Name: recursos_estudiante recursos_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recursos_estudiante
    ADD CONSTRAINT recursos_estudiante_pkey PRIMARY KEY (id);


--
-- Name: refresh_token_sessions refresh_token_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_token_sessions
    ADD CONSTRAINT refresh_token_sessions_pkey PRIMARY KEY (id);


--
-- Name: rutas_especialidad rutas_especialidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rutas_especialidad
    ADD CONSTRAINT rutas_especialidad_pkey PRIMARY KEY (id);


--
-- Name: secret_rotations secret_rotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secret_rotations
    ADD CONSTRAINT secret_rotations_pkey PRIMARY KEY (id);


--
-- Name: sectores sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_pkey PRIMARY KEY (id);


--
-- Name: seguimientos_observacion seguimientos_observacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguimientos_observacion
    ADD CONSTRAINT seguimientos_observacion_pkey PRIMARY KEY (id);


--
-- Name: suscripciones suscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones
    ADD CONSTRAINT suscripciones_pkey PRIMARY KEY (id);


--
-- Name: tareas_admin tareas_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_admin
    ADD CONSTRAINT tareas_admin_pkey PRIMARY KEY (id);


--
-- Name: tareas_asignadas tareas_asignadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_asignadas
    ADD CONSTRAINT tareas_asignadas_pkey PRIMARY KEY (id);


--
-- Name: tareas_clase tareas_clase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_clase
    ADD CONSTRAINT tareas_clase_pkey PRIMARY KEY (id);


--
-- Name: tareas tareas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_pkey PRIMARY KEY (id);


--
-- Name: tiers tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tiers
    ADD CONSTRAINT tiers_pkey PRIMARY KEY (id);


--
-- Name: transacciones_recurso transacciones_recurso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones_recurso
    ADD CONSTRAINT transacciones_recurso_pkey PRIMARY KEY (id);


--
-- Name: tutores tutores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tutores
    ADD CONSTRAINT tutores_pkey PRIMARY KEY (id);


--
-- Name: webhooks_processed webhooks_processed_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks_processed
    ADD CONSTRAINT webhooks_processed_pkey PRIMARY KEY (id);


--
-- Name: actividad_feed_casa_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX actividad_feed_casa_id_idx ON public.actividad_feed USING btree (casa_id);


--
-- Name: actividad_feed_creado_en_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX actividad_feed_creado_en_idx ON public.actividad_feed USING btree (creado_en);


--
-- Name: actividad_feed_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX actividad_feed_estudiante_id_idx ON public.actividad_feed USING btree (estudiante_id);


--
-- Name: actividad_feed_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX actividad_feed_tipo_idx ON public.actividad_feed USING btree (tipo);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: alertas_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX alertas_estudiante_id_idx ON public.alertas USING btree (estudiante_id);


--
-- Name: alertas_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX alertas_fecha_idx ON public.alertas USING btree (fecha);


--
-- Name: alertas_resuelta_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX alertas_resuelta_idx ON public.alertas USING btree (resuelta);


--
-- Name: asignaciones_planificacion_clase_grupo_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asignaciones_planificacion_clase_grupo_id_idx ON public.asignaciones_planificacion USING btree (clase_grupo_id);


--
-- Name: asignaciones_planificacion_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asignaciones_planificacion_docente_id_idx ON public.asignaciones_planificacion USING btree (docente_id);


--
-- Name: asignaciones_planificacion_planificacion_id_clase_grupo_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX asignaciones_planificacion_planificacion_id_clase_grupo_id_key ON public.asignaciones_planificacion USING btree (planificacion_id, clase_grupo_id);


--
-- Name: asistencia_comision_comision_id_estudiante_id_fecha_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX asistencia_comision_comision_id_estudiante_id_fecha_key ON public.asistencia_comision USING btree (comision_id, estudiante_id, fecha);


--
-- Name: asistencia_comision_comision_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencia_comision_comision_id_idx ON public.asistencia_comision USING btree (comision_id);


--
-- Name: asistencia_comision_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencia_comision_estudiante_id_idx ON public.asistencia_comision USING btree (estudiante_id);


--
-- Name: asistencia_comision_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencia_comision_fecha_idx ON public.asistencia_comision USING btree (fecha);


--
-- Name: asistencias_clase_grupo_clase_grupo_id_estudiante_id_fecha_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX asistencias_clase_grupo_clase_grupo_id_estudiante_id_fecha_key ON public.asistencias_clase_grupo USING btree (clase_grupo_id, estudiante_id, fecha);


--
-- Name: asistencias_clase_grupo_clase_grupo_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_clase_grupo_clase_grupo_id_idx ON public.asistencias_clase_grupo USING btree (clase_grupo_id);


--
-- Name: asistencias_clase_grupo_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_clase_grupo_estudiante_id_idx ON public.asistencias_clase_grupo USING btree (estudiante_id);


--
-- Name: asistencias_clase_grupo_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_clase_grupo_fecha_idx ON public.asistencias_clase_grupo USING btree (fecha);


--
-- Name: asistencias_clase_id_estudiante_id_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_clase_id_estudiante_id_estado_idx ON public.asistencias USING btree (clase_id, estudiante_id, estado);


--
-- Name: asistencias_clase_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX asistencias_clase_id_estudiante_id_key ON public.asistencias USING btree (clase_id, estudiante_id);


--
-- Name: asistencias_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_estado_idx ON public.asistencias USING btree (estado);


--
-- Name: asistencias_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_estudiante_id_idx ON public.asistencias USING btree (estudiante_id);


--
-- Name: asistencias_live_clase_grupo_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX asistencias_live_clase_grupo_id_estudiante_id_key ON public.asistencias_live USING btree (clase_grupo_id, estudiante_id);


--
-- Name: asistencias_live_clase_grupo_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_live_clase_grupo_id_idx ON public.asistencias_live USING btree (clase_grupo_id);


--
-- Name: asistencias_live_entro_en_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_live_entro_en_idx ON public.asistencias_live USING btree (entro_en);


--
-- Name: asistencias_live_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX asistencias_live_estudiante_id_idx ON public.asistencias_live USING btree (estudiante_id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_category_idx ON public.audit_logs USING btree (category);


--
-- Name: audit_logs_entity_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_type_idx ON public.audit_logs USING btree (entity_type);


--
-- Name: audit_logs_severity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_severity_idx ON public.audit_logs USING btree (severity);


--
-- Name: audit_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_timestamp_idx ON public.audit_logs USING btree ("timestamp");


--
-- Name: audit_logs_user_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_email_idx ON public.audit_logs USING btree (user_email);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: casas_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX casas_nombre_key ON public.casas USING btree (nombre);


--
-- Name: casas_tipo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX casas_tipo_key ON public.casas USING btree (tipo);


--
-- Name: clase_grupos_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_activo_idx ON public.clase_grupos USING btree (activo);


--
-- Name: clase_grupos_anio_lectivo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_anio_lectivo_idx ON public.clase_grupos USING btree (anio_lectivo);


--
-- Name: clase_grupos_dia_semana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_dia_semana_idx ON public.clase_grupos USING btree (dia_semana);


--
-- Name: clase_grupos_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_docente_id_idx ON public.clase_grupos USING btree (docente_id);


--
-- Name: clase_grupos_estado_clase_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_estado_clase_idx ON public.clase_grupos USING btree (estado_clase);


--
-- Name: clase_grupos_fecha_inicio_fecha_fin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_fecha_inicio_fecha_fin_idx ON public.clase_grupos USING btree (fecha_inicio, fecha_fin);


--
-- Name: clase_grupos_livekit_room_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clase_grupos_livekit_room_name_idx ON public.clase_grupos USING btree (livekit_room_name);


--
-- Name: clase_grupos_livekit_room_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clase_grupos_livekit_room_name_key ON public.clase_grupos USING btree (livekit_room_name);


--
-- Name: clase_grupos_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clase_grupos_nombre_key ON public.clase_grupos USING btree (nombre);


--
-- Name: clases_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clases_docente_id_idx ON public.clases USING btree (docente_id);


--
-- Name: clases_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clases_estado_idx ON public.clases USING btree (estado);


--
-- Name: clases_fecha_hora_inicio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clases_fecha_hora_inicio_idx ON public.clases USING btree (fecha_hora_inicio);


--
-- Name: clases_planificacion_planificacion_id_numero_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clases_planificacion_planificacion_id_numero_key ON public.clases_planificacion USING btree (planificacion_id, numero);


--
-- Name: clases_planificacion_practica_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clases_planificacion_practica_id_idx ON public.clases_planificacion USING btree (practica_id);


--
-- Name: clases_planificacion_teoria_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clases_planificacion_teoria_id_idx ON public.clases_planificacion USING btree (teoria_id);


--
-- Name: clases_producto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clases_producto_id_idx ON public.clases USING btree (producto_id);


--
-- Name: colonia_estudiante_cursos_colonia_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_estudiante_cursos_colonia_estudiante_id_idx ON public.colonia_estudiante_cursos USING btree (colonia_estudiante_id);


--
-- Name: colonia_estudiante_cursos_course_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_estudiante_cursos_course_id_idx ON public.colonia_estudiante_cursos USING btree (course_id);


--
-- Name: colonia_estudiantes_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_estudiantes_estudiante_id_idx ON public.colonia_estudiantes USING btree (estudiante_id);


--
-- Name: colonia_estudiantes_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_estudiantes_inscripcion_id_idx ON public.colonia_estudiantes USING btree (inscripcion_id);


--
-- Name: colonia_estudiantes_pin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_estudiantes_pin_idx ON public.colonia_estudiantes USING btree (pin);


--
-- Name: colonia_estudiantes_pin_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX colonia_estudiantes_pin_key ON public.colonia_estudiantes USING btree (pin);


--
-- Name: colonia_inscripciones_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_inscripciones_estado_idx ON public.colonia_inscripciones USING btree (estado);


--
-- Name: colonia_inscripciones_tutor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_inscripciones_tutor_id_idx ON public.colonia_inscripciones USING btree (tutor_id);


--
-- Name: colonia_pagos_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_pagos_estado_idx ON public.colonia_pagos USING btree (estado);


--
-- Name: colonia_pagos_fecha_vencimiento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_pagos_fecha_vencimiento_idx ON public.colonia_pagos USING btree (fecha_vencimiento);


--
-- Name: colonia_pagos_inscripcion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_pagos_inscripcion_id_idx ON public.colonia_pagos USING btree (inscripcion_id);


--
-- Name: colonia_pagos_mercadopago_preference_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_pagos_mercadopago_preference_id_idx ON public.colonia_pagos USING btree (mercadopago_preference_id);


--
-- Name: colonia_pagos_processed_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX colonia_pagos_processed_at_idx ON public.colonia_pagos USING btree (processed_at);


--
-- Name: comisiones_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_activo_idx ON public.comisiones USING btree (activo);


--
-- Name: comisiones_casa_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_casa_id_idx ON public.comisiones USING btree (casa_id);


--
-- Name: comisiones_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_docente_id_idx ON public.comisiones USING btree (docente_id);


--
-- Name: comisiones_estado_clase_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_estado_clase_idx ON public.comisiones USING btree (estado_clase);


--
-- Name: comisiones_grupo_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_grupo_id_idx ON public.comisiones USING btree (grupo_id);


--
-- Name: comisiones_livekit_room_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_livekit_room_name_idx ON public.comisiones USING btree (livekit_room_name);


--
-- Name: comisiones_livekit_room_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX comisiones_livekit_room_name_key ON public.comisiones USING btree (livekit_room_name);


--
-- Name: comisiones_producto_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX comisiones_producto_id_idx ON public.comisiones USING btree (producto_id);


--
-- Name: docentes_casas_casa_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX docentes_casas_casa_tipo_idx ON public.docentes_casas USING btree (casa_tipo);


--
-- Name: docentes_casas_docente_id_casa_tipo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX docentes_casas_docente_id_casa_tipo_key ON public.docentes_casas USING btree (docente_id, casa_tipo);


--
-- Name: docentes_casas_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX docentes_casas_docente_id_idx ON public.docentes_casas USING btree (docente_id);


--
-- Name: docentes_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX docentes_email_key ON public.docentes USING btree (email);


--
-- Name: docentes_mundos_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX docentes_mundos_docente_id_idx ON public.docentes_mundos USING btree (docente_id);


--
-- Name: docentes_mundos_docente_id_mundo_tipo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX docentes_mundos_docente_id_mundo_tipo_key ON public.docentes_mundos USING btree (docente_id, mundo_tipo);


--
-- Name: docentes_mundos_mundo_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX docentes_mundos_mundo_tipo_idx ON public.docentes_mundos USING btree (mundo_tipo);


--
-- Name: docentes_rutas_docenteId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "docentes_rutas_docenteId_idx" ON public.docentes_rutas USING btree ("docenteId");


--
-- Name: docentes_rutas_docenteId_rutaId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "docentes_rutas_docenteId_rutaId_key" ON public.docentes_rutas USING btree ("docenteId", "rutaId");


--
-- Name: docentes_rutas_rutaId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "docentes_rutas_rutaId_idx" ON public.docentes_rutas USING btree ("rutaId");


--
-- Name: docentes_rutas_sectorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "docentes_rutas_sectorId_idx" ON public.docentes_rutas USING btree ("sectorId");


--
-- Name: estados_clase_grupo_asignacion_id_clase_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX estados_clase_grupo_asignacion_id_clase_id_key ON public.estados_clase_grupo USING btree (asignacion_id, clase_id);


--
-- Name: estados_clase_grupo_clase_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX estados_clase_grupo_clase_id_idx ON public.estados_clase_grupo USING btree (clase_id);


--
-- Name: estudiantes_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX estudiantes_email_key ON public.estudiantes USING btree (email);


--
-- Name: estudiantes_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX estudiantes_username_key ON public.estudiantes USING btree (username);


--
-- Name: eventos_clase_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_clase_id_idx ON public.eventos USING btree (clase_id);


--
-- Name: eventos_docente_id_fecha_inicio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_docente_id_fecha_inicio_idx ON public.eventos USING btree (docente_id, fecha_inicio);


--
-- Name: eventos_docente_id_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_docente_id_tipo_idx ON public.eventos USING btree (docente_id, tipo);


--
-- Name: eventos_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_tipo_idx ON public.eventos USING btree (tipo);


--
-- Name: grupos_activo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grupos_activo_idx ON public.grupos USING btree (activo);


--
-- Name: grupos_casa_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grupos_casa_tipo_idx ON public.grupos USING btree (casa_tipo);


--
-- Name: grupos_codigo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grupos_codigo_idx ON public.grupos USING btree (codigo);


--
-- Name: grupos_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX grupos_codigo_key ON public.grupos USING btree (codigo);


--
-- Name: grupos_mundo_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grupos_mundo_tipo_idx ON public.grupos USING btree (mundo_tipo);


--
-- Name: historial_acceso_estudiante_accion_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_acceso_estudiante_accion_fecha_idx ON public.historial_acceso_estudiante USING btree (accion, fecha);


--
-- Name: historial_acceso_estudiante_estudiante_id_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_acceso_estudiante_estudiante_id_fecha_idx ON public.historial_acceso_estudiante USING btree (estudiante_id, fecha);


--
-- Name: historial_cambio_precios_configuracion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_cambio_precios_configuracion_id_idx ON public.historial_cambio_precios USING btree (configuracion_id);


--
-- Name: historial_cambio_precios_fecha_cambio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_cambio_precios_fecha_cambio_idx ON public.historial_cambio_precios USING btree (fecha_cambio);


--
-- Name: historial_estado_suscripcion_suscripcion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_estado_suscripcion_suscripcion_id_idx ON public.historial_estado_suscripcion USING btree (suscripcion_id);


--
-- Name: idx_asistencias_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asistencias_estado ON public.asistencias_clase_grupo USING btree (estado);


--
-- Name: idx_contenidos_casa_mundo_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contenidos_casa_mundo_estado ON public.contenidos USING btree (casa_tipo, mundo_tipo, estado);


--
-- Name: idx_contenidos_creador; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contenidos_creador ON public.contenidos USING btree (creador_id);


--
-- Name: idx_contenidos_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contenidos_estado ON public.contenidos USING btree (estado);


--
-- Name: idx_contenidos_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contenidos_tipo ON public.contenidos USING btree (tipo);


--
-- Name: idx_estudiantes_tutor_listado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_estudiantes_tutor_listado ON public.estudiantes USING btree (tutor_id, apellido);


--
-- Name: idx_login_attempts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_login_attempts_created_at ON public.login_attempts USING btree (created_at);


--
-- Name: idx_login_attempts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_login_attempts_email ON public.login_attempts USING btree (email);


--
-- Name: idx_logros_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logros_activo ON public.logros_gamificacion USING btree (activo);


--
-- Name: idx_logros_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logros_categoria ON public.logros_gamificacion USING btree (categoria);


--
-- Name: idx_logros_rareza; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logros_rareza ON public.logros_gamificacion USING btree (rareza);


--
-- Name: idx_mundos_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mundos_activo ON public.mundos USING btree (activo);


--
-- Name: idx_nodos_contenido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nodos_contenido ON public.nodos_contenido USING btree (contenido_id);


--
-- Name: idx_nodos_orden; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nodos_orden ON public.nodos_contenido USING btree (orden);


--
-- Name: idx_nodos_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nodos_parent ON public.nodos_contenido USING btree (parent_id);


--
-- Name: idx_password_reset_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_email ON public.password_reset_tokens USING btree (email);


--
-- Name: idx_password_reset_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_expires ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_password_reset_token ON public.password_reset_tokens USING btree (token);


--
-- Name: idx_progreso_contenido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progreso_contenido ON public.progreso_contenidos USING btree (contenido_id);


--
-- Name: idx_progreso_estudiante; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progreso_estudiante ON public.progreso_contenidos USING btree (estudiante_id);


--
-- Name: idx_progreso_nodo_actual; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progreso_nodo_actual ON public.progreso_contenidos USING btree (nodo_actual_id);


--
-- Name: idx_refresh_session_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_session_expires ON public.refresh_token_sessions USING btree (expires_at);


--
-- Name: idx_refresh_session_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_session_user ON public.refresh_token_sessions USING btree (user_id);


--
-- Name: inscripciones_clase_clase_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inscripciones_clase_clase_id_estudiante_id_key ON public.inscripciones_clase USING btree (clase_id, estudiante_id);


--
-- Name: inscripciones_clase_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_clase_estudiante_id_idx ON public.inscripciones_clase USING btree (estudiante_id);


--
-- Name: inscripciones_clase_grupo_clase_grupo_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inscripciones_clase_grupo_clase_grupo_id_estudiante_id_key ON public.inscripciones_clase_grupo USING btree (clase_grupo_id, estudiante_id);


--
-- Name: inscripciones_clase_grupo_clase_grupo_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_clase_grupo_clase_grupo_id_idx ON public.inscripciones_clase_grupo USING btree (clase_grupo_id);


--
-- Name: inscripciones_clase_grupo_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_clase_grupo_estudiante_id_idx ON public.inscripciones_clase_grupo USING btree (estudiante_id);


--
-- Name: inscripciones_clase_grupo_tipo_acceso_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_clase_grupo_tipo_acceso_idx ON public.inscripciones_clase_grupo USING btree (tipo_acceso);


--
-- Name: inscripciones_clase_grupo_tutor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_clase_grupo_tutor_id_idx ON public.inscripciones_clase_grupo USING btree (tutor_id);


--
-- Name: inscripciones_clase_tutor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_clase_tutor_id_idx ON public.inscripciones_clase USING btree (tutor_id);


--
-- Name: inscripciones_comision_comision_id_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inscripciones_comision_comision_id_estudiante_id_key ON public.inscripciones_comision USING btree (comision_id, estudiante_id);


--
-- Name: inscripciones_comision_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_comision_estado_idx ON public.inscripciones_comision USING btree (estado);


--
-- Name: inscripciones_comision_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_comision_estudiante_id_idx ON public.inscripciones_comision USING btree (estudiante_id);


--
-- Name: inscripciones_mensuales_estado_pago_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_mensuales_estado_pago_idx ON public.inscripciones_mensuales USING btree (estado_pago);


--
-- Name: inscripciones_mensuales_estudiante_id_producto_id_periodo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX inscripciones_mensuales_estudiante_id_producto_id_periodo_key ON public.inscripciones_mensuales USING btree (estudiante_id, producto_id, periodo);


--
-- Name: inscripciones_mensuales_periodo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_mensuales_periodo_idx ON public.inscripciones_mensuales USING btree (periodo);


--
-- Name: inscripciones_mensuales_tutor_id_periodo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inscripciones_mensuales_tutor_id_periodo_idx ON public.inscripciones_mensuales USING btree (tutor_id, periodo);


--
-- Name: logros_estudiantes_gamificacion_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX logros_estudiantes_gamificacion_estudiante_id_idx ON public.logros_estudiantes_gamificacion USING btree (estudiante_id);


--
-- Name: logros_estudiantes_gamificacion_estudiante_id_logro_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX logros_estudiantes_gamificacion_estudiante_id_logro_id_key ON public.logros_estudiantes_gamificacion USING btree (estudiante_id, logro_id);


--
-- Name: logros_estudiantes_gamificacion_logro_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX logros_estudiantes_gamificacion_logro_id_idx ON public.logros_estudiantes_gamificacion USING btree (logro_id);


--
-- Name: logros_estudiantes_gamificacion_visto_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX logros_estudiantes_gamificacion_visto_idx ON public.logros_estudiantes_gamificacion USING btree (visto);


--
-- Name: logros_gamificacion_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX logros_gamificacion_codigo_key ON public.logros_gamificacion USING btree (codigo);


--
-- Name: mundos_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mundos_nombre_key ON public.mundos USING btree (nombre);


--
-- Name: mundos_tipo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mundos_tipo_key ON public.mundos USING btree (tipo);


--
-- Name: notas_categoria_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notas_categoria_idx ON public.notas USING btree (categoria);


--
-- Name: notas_evento_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX notas_evento_id_key ON public.notas USING btree (evento_id);


--
-- Name: notificaciones_docente_id_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notificaciones_docente_id_createdAt_idx" ON public.notificaciones USING btree (docente_id, "createdAt");


--
-- Name: notificaciones_docente_id_leida_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificaciones_docente_id_leida_idx ON public.notificaciones USING btree (docente_id, leida);


--
-- Name: observaciones_docente_comision_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_comision_id_idx ON public.observaciones_docente USING btree (comision_id);


--
-- Name: observaciones_docente_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_created_at_idx ON public.observaciones_docente USING btree (created_at);


--
-- Name: observaciones_docente_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_docente_id_idx ON public.observaciones_docente USING btree (docente_id);


--
-- Name: observaciones_docente_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_estado_idx ON public.observaciones_docente USING btree (estado);


--
-- Name: observaciones_docente_fecha_evento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_fecha_evento_idx ON public.observaciones_docente USING btree (fecha_evento);


--
-- Name: observaciones_docente_prioridad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_prioridad_idx ON public.observaciones_docente USING btree (prioridad);


--
-- Name: observaciones_docente_requiere_seguimiento_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_requiere_seguimiento_estado_idx ON public.observaciones_docente USING btree (requiere_seguimiento, estado);


--
-- Name: observaciones_docente_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_docente_tipo_idx ON public.observaciones_docente USING btree (tipo);


--
-- Name: observaciones_estudiantes_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observaciones_estudiantes_estudiante_id_idx ON public.observaciones_estudiantes USING btree (estudiante_id);


--
-- Name: pagos_suscripcion_mp_payment_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pagos_suscripcion_mp_payment_id_key ON public.pagos_suscripcion USING btree (mp_payment_id);


--
-- Name: pagos_suscripcion_suscripcion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pagos_suscripcion_suscripcion_id_idx ON public.pagos_suscripcion USING btree (suscripcion_id);


--
-- Name: planificaciones_casa_tipo_mundo_tipo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX planificaciones_casa_tipo_mundo_tipo_idx ON public.planificaciones USING btree (casa_tipo, mundo_tipo);


--
-- Name: planificaciones_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX planificaciones_estado_idx ON public.planificaciones USING btree (estado);


--
-- Name: progreso_contenidos_estudiante_id_contenido_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX progreso_contenidos_estudiante_id_contenido_id_key ON public.progreso_contenidos USING btree (estudiante_id, contenido_id);


--
-- Name: progresos_clase_estudiante_clase_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX progresos_clase_estudiante_clase_id_idx ON public.progresos_clase_estudiante USING btree (clase_id);


--
-- Name: progresos_clase_estudiante_estudiante_id_clase_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX progresos_clase_estudiante_estudiante_id_clase_id_key ON public.progresos_clase_estudiante USING btree (estudiante_id, clase_id);


--
-- Name: progresos_tarea_estudiante_estudiante_id_tarea_asignada_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX progresos_tarea_estudiante_estudiante_id_tarea_asignada_id_key ON public.progresos_tarea_estudiante USING btree (estudiante_id, tarea_asignada_id);


--
-- Name: progresos_tarea_estudiante_tarea_asignada_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX progresos_tarea_estudiante_tarea_asignada_id_idx ON public.progresos_tarea_estudiante USING btree (tarea_asignada_id);


--
-- Name: puntos_obtenidos_docente_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX puntos_obtenidos_docente_id_idx ON public.puntos_obtenidos USING btree (docente_id);


--
-- Name: puntos_obtenidos_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX puntos_obtenidos_estudiante_id_idx ON public.puntos_obtenidos USING btree (estudiante_id);


--
-- Name: puntos_obtenidos_fecha_otorgado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX puntos_obtenidos_fecha_otorgado_idx ON public.puntos_obtenidos USING btree (fecha_otorgado);


--
-- Name: puntos_obtenidos_tipo_accion_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX puntos_obtenidos_tipo_accion_idx ON public.puntos_obtenidos USING btree (tipo_accion);


--
-- Name: rachas_estudiantes_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rachas_estudiantes_estudiante_id_idx ON public.rachas_estudiantes USING btree (estudiante_id);


--
-- Name: rachas_estudiantes_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rachas_estudiantes_estudiante_id_key ON public.rachas_estudiantes USING btree (estudiante_id);


--
-- Name: rachas_estudiantes_ultima_actividad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rachas_estudiantes_ultima_actividad_idx ON public.rachas_estudiantes USING btree (ultima_actividad);


--
-- Name: reacciones_feed_actividad_id_estudiante_id_emoji_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reacciones_feed_actividad_id_estudiante_id_emoji_key ON public.reacciones_feed USING btree (actividad_id, estudiante_id, emoji);


--
-- Name: reacciones_feed_actividad_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reacciones_feed_actividad_id_idx ON public.reacciones_feed USING btree (actividad_id);


--
-- Name: reacciones_feed_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reacciones_feed_estudiante_id_idx ON public.reacciones_feed USING btree (estudiante_id);


--
-- Name: recordatorios_evento_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX recordatorios_evento_id_key ON public.recordatorios USING btree (evento_id);


--
-- Name: recursos_estudiante_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recursos_estudiante_estudiante_id_idx ON public.recursos_estudiante USING btree (estudiante_id);


--
-- Name: recursos_estudiante_estudiante_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX recursos_estudiante_estudiante_id_key ON public.recursos_estudiante USING btree (estudiante_id);


--
-- Name: rutas_especialidad_sectorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rutas_especialidad_sectorId_idx" ON public.rutas_especialidad USING btree ("sectorId");


--
-- Name: rutas_especialidad_sectorId_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "rutas_especialidad_sectorId_nombre_key" ON public.rutas_especialidad USING btree ("sectorId", nombre);


--
-- Name: secret_rotations_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX secret_rotations_expires_at_idx ON public.secret_rotations USING btree (expires_at);


--
-- Name: secret_rotations_secret_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX secret_rotations_secret_type_idx ON public.secret_rotations USING btree (secret_type);


--
-- Name: secret_rotations_secret_type_version_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX secret_rotations_secret_type_version_key ON public.secret_rotations USING btree (secret_type, version);


--
-- Name: secret_rotations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX secret_rotations_status_idx ON public.secret_rotations USING btree (status);


--
-- Name: secret_rotations_version_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX secret_rotations_version_idx ON public.secret_rotations USING btree (version);


--
-- Name: sectores_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sectores_nombre_key ON public.sectores USING btree (nombre);


--
-- Name: seguimientos_observacion_autor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seguimientos_observacion_autor_id_idx ON public.seguimientos_observacion USING btree (autor_id);


--
-- Name: seguimientos_observacion_observacion_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seguimientos_observacion_observacion_id_idx ON public.seguimientos_observacion USING btree (observacion_id);


--
-- Name: suscripciones_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suscripciones_estado_idx ON public.suscripciones USING btree (estado);


--
-- Name: suscripciones_mp_preapproval_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suscripciones_mp_preapproval_id_idx ON public.suscripciones USING btree (mp_preapproval_id);


--
-- Name: suscripciones_mp_preapproval_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX suscripciones_mp_preapproval_id_key ON public.suscripciones USING btree (mp_preapproval_id);


--
-- Name: suscripciones_tutor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suscripciones_tutor_id_idx ON public.suscripciones USING btree (tutor_id);


--
-- Name: tareas_admin_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tareas_admin_dueDate_idx" ON public.tareas_admin USING btree ("dueDate");


--
-- Name: tareas_admin_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_admin_priority_idx ON public.tareas_admin USING btree (priority);


--
-- Name: tareas_admin_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_admin_status_idx ON public.tareas_admin USING btree (status);


--
-- Name: tareas_asignadas_asignacion_id_tarea_clase_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tareas_asignadas_asignacion_id_tarea_clase_id_key ON public.tareas_asignadas USING btree (asignacion_id, tarea_clase_id);


--
-- Name: tareas_asignadas_tarea_clase_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_asignadas_tarea_clase_id_idx ON public.tareas_asignadas USING btree (tarea_clase_id);


--
-- Name: tareas_categoria_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_categoria_idx ON public.tareas USING btree (categoria);


--
-- Name: tareas_clase_clase_id_contenido_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tareas_clase_clase_id_contenido_id_key ON public.tareas_clase USING btree (clase_id, contenido_id);


--
-- Name: tareas_clase_contenido_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_clase_contenido_id_idx ON public.tareas_clase USING btree (contenido_id);


--
-- Name: tareas_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_estado_idx ON public.tareas USING btree (estado);


--
-- Name: tareas_evento_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tareas_evento_id_key ON public.tareas USING btree (evento_id);


--
-- Name: tareas_prioridad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tareas_prioridad_idx ON public.tareas USING btree (prioridad);


--
-- Name: tiers_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tiers_nombre_key ON public.tiers USING btree (nombre);


--
-- Name: transacciones_recurso_fecha_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transacciones_recurso_fecha_idx ON public.transacciones_recurso USING btree (fecha);


--
-- Name: transacciones_recurso_recursos_estudiante_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transacciones_recurso_recursos_estudiante_id_idx ON public.transacciones_recurso USING btree (recursos_estudiante_id);


--
-- Name: transacciones_recurso_tipo_recurso_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transacciones_recurso_tipo_recurso_idx ON public.transacciones_recurso USING btree (tipo_recurso);


--
-- Name: tutores_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tutores_email_key ON public.tutores USING btree (email);


--
-- Name: tutores_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tutores_username_key ON public.tutores USING btree (username);


--
-- Name: webhooks_processed_payment_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX webhooks_processed_payment_id_idx ON public.webhooks_processed USING btree (payment_id);


--
-- Name: webhooks_processed_payment_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX webhooks_processed_payment_id_key ON public.webhooks_processed USING btree (payment_id);


--
-- Name: webhooks_processed_processed_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX webhooks_processed_processed_at_idx ON public.webhooks_processed USING btree (processed_at);


--
-- Name: webhooks_processed_webhook_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX webhooks_processed_webhook_type_idx ON public.webhooks_processed USING btree (webhook_type);


--
-- Name: actividad_feed actividad_feed_casa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad_feed
    ADD CONSTRAINT actividad_feed_casa_id_fkey FOREIGN KEY (casa_id) REFERENCES public.casas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: actividad_feed actividad_feed_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad_feed
    ADD CONSTRAINT actividad_feed_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alertas alertas_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: alertas alertas_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT alertas_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asignaciones_planificacion asignaciones_planificacion_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_planificacion asignaciones_planificacion_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asignaciones_planificacion asignaciones_planificacion_planificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_planificacion_id_fkey FOREIGN KEY (planificacion_id) REFERENCES public.planificaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asistencia_comision asistencia_comision_comision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_comision
    ADD CONSTRAINT asistencia_comision_comision_id_fkey FOREIGN KEY (comision_id) REFERENCES public.comisiones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencia_comision asistencia_comision_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_comision
    ADD CONSTRAINT asistencia_comision_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias_clase_grupo asistencias_clase_grupo_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_clase_grupo
    ADD CONSTRAINT asistencias_clase_grupo_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias_clase_grupo asistencias_clase_grupo_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_clase_grupo
    ADD CONSTRAINT asistencias_clase_grupo_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias asistencias_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias asistencias_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias_live asistencias_live_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_live
    ADD CONSTRAINT asistencias_live_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asistencias_live asistencias_live_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias_live
    ADD CONSTRAINT asistencias_live_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clase_grupos clase_grupos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clase_grupos clase_grupos_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clase_grupos clase_grupos_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clase_grupos
    ADD CONSTRAINT clase_grupos_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clases clases_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clases_planificacion clases_planificacion_planificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases_planificacion
    ADD CONSTRAINT clases_planificacion_planificacion_id_fkey FOREIGN KEY (planificacion_id) REFERENCES public.planificaciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clases_planificacion clases_planificacion_practica_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases_planificacion
    ADD CONSTRAINT clases_planificacion_practica_id_fkey FOREIGN KEY (practica_id) REFERENCES public.contenidos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clases_planificacion clases_planificacion_teoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases_planificacion
    ADD CONSTRAINT clases_planificacion_teoria_id_fkey FOREIGN KEY (teoria_id) REFERENCES public.contenidos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clases clases_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clases clases_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clases
    ADD CONSTRAINT clases_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: colonia_estudiante_cursos colonia_estudiante_cursos_colonia_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_estudiante_cursos
    ADD CONSTRAINT colonia_estudiante_cursos_colonia_estudiante_id_fkey FOREIGN KEY (colonia_estudiante_id) REFERENCES public.colonia_estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_estudiantes colonia_estudiantes_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_estudiantes
    ADD CONSTRAINT colonia_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_estudiantes colonia_estudiantes_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_estudiantes
    ADD CONSTRAINT colonia_estudiantes_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.colonia_inscripciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_inscripciones colonia_inscripciones_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_inscripciones
    ADD CONSTRAINT colonia_inscripciones_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: colonia_pagos colonia_pagos_inscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia_pagos
    ADD CONSTRAINT colonia_pagos_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.colonia_inscripciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comisiones comisiones_casa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_casa_id_fkey FOREIGN KEY (casa_id) REFERENCES public.casas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comisiones comisiones_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comisiones comisiones_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comisiones comisiones_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contenidos contenidos_creador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contenidos
    ADD CONSTRAINT contenidos_creador_id_fkey FOREIGN KEY (creador_id) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: docentes_casas docentes_casas_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_casas
    ADD CONSTRAINT docentes_casas_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_mundos docentes_mundos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_mundos
    ADD CONSTRAINT docentes_mundos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_rutas docentes_rutas_docenteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT "docentes_rutas_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_rutas docentes_rutas_rutaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT "docentes_rutas_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES public.rutas_especialidad(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: docentes_rutas docentes_rutas_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.docentes_rutas
    ADD CONSTRAINT "docentes_rutas_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estados_clase_grupo estados_clase_grupo_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_clase_grupo
    ADD CONSTRAINT estados_clase_grupo_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.asignaciones_planificacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: estados_clase_grupo estados_clase_grupo_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estados_clase_grupo
    ADD CONSTRAINT estados_clase_grupo_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases_planificacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: estudiantes estudiantes_casa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_casa_id_fkey FOREIGN KEY (casa_id) REFERENCES public.casas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estudiantes estudiantes_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.planes_suscripcion(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estudiantes estudiantes_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: estudiantes estudiantes_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiantes
    ADD CONSTRAINT estudiantes_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: eventos eventos_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: eventos eventos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos
    ADD CONSTRAINT eventos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: grupos grupos_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grupos
    ADD CONSTRAINT grupos_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: historial_acceso_estudiante historial_acceso_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso_estudiante
    ADD CONSTRAINT historial_acceso_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: historial_cambio_precios historial_cambio_precios_configuracion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_cambio_precios
    ADD CONSTRAINT historial_cambio_precios_configuracion_id_fkey FOREIGN KEY (configuracion_id) REFERENCES public.configuracion_precios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: historial_estado_suscripcion historial_estado_suscripcion_suscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_estado_suscripcion
    ADD CONSTRAINT historial_estado_suscripcion_suscripcion_id_fkey FOREIGN KEY (suscripcion_id) REFERENCES public.suscripciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase inscripciones_clase_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase inscripciones_clase_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_clase_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_clase_grupo_id_fkey FOREIGN KEY (clase_grupo_id) REFERENCES public.clase_grupos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_clase_grupo inscripciones_clase_grupo_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase_grupo
    ADD CONSTRAINT inscripciones_clase_grupo_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_clase inscripciones_clase_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_clase
    ADD CONSTRAINT inscripciones_clase_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_comision inscripciones_comision_comision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_comision
    ADD CONSTRAINT inscripciones_comision_comision_id_fkey FOREIGN KEY (comision_id) REFERENCES public.comisiones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_comision inscripciones_comision_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_comision
    ADD CONSTRAINT inscripciones_comision_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_mensuales inscripciones_mensuales_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inscripciones_mensuales inscripciones_mensuales_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inscripciones_mensuales inscripciones_mensuales_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inscripciones_mensuales
    ADD CONSTRAINT inscripciones_mensuales_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: logros_estudiantes_gamificacion logros_estudiantes_gamificacion_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_estudiantes_gamificacion
    ADD CONSTRAINT logros_estudiantes_gamificacion_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logros_estudiantes_gamificacion logros_estudiantes_gamificacion_logro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logros_estudiantes_gamificacion
    ADD CONSTRAINT logros_estudiantes_gamificacion_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logros_gamificacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: nodos_contenido nodos_contenido_contenido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nodos_contenido
    ADD CONSTRAINT nodos_contenido_contenido_id_fkey FOREIGN KEY (contenido_id) REFERENCES public.contenidos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nodos_contenido nodos_contenido_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nodos_contenido
    ADD CONSTRAINT nodos_contenido_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.nodos_contenido(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notas notas_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas
    ADD CONSTRAINT notas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notificaciones notificaciones_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: observaciones_docente observaciones_docente_comision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_docente
    ADD CONSTRAINT observaciones_docente_comision_id_fkey FOREIGN KEY (comision_id) REFERENCES public.comisiones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: observaciones_docente observaciones_docente_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_docente
    ADD CONSTRAINT observaciones_docente_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: observaciones_estudiantes observaciones_estudiantes_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_estudiantes
    ADD CONSTRAINT observaciones_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: observaciones_estudiantes observaciones_estudiantes_observacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observaciones_estudiantes
    ADD CONSTRAINT observaciones_estudiantes_observacion_id_fkey FOREIGN KEY (observacion_id) REFERENCES public.observaciones_docente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pagos_suscripcion pagos_suscripcion_suscripcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos_suscripcion
    ADD CONSTRAINT pagos_suscripcion_suscripcion_id_fkey FOREIGN KEY (suscripcion_id) REFERENCES public.suscripciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_contenidos progreso_contenidos_contenido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_contenidos
    ADD CONSTRAINT progreso_contenidos_contenido_id_fkey FOREIGN KEY (contenido_id) REFERENCES public.contenidos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_contenidos progreso_contenidos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_contenidos
    ADD CONSTRAINT progreso_contenidos_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progreso_contenidos progreso_contenidos_nodo_actual_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progreso_contenidos
    ADD CONSTRAINT progreso_contenidos_nodo_actual_id_fkey FOREIGN KEY (nodo_actual_id) REFERENCES public.nodos_contenido(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: progresos_clase_estudiante progresos_clase_estudiante_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresos_clase_estudiante
    ADD CONSTRAINT progresos_clase_estudiante_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases_planificacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: progresos_clase_estudiante progresos_clase_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresos_clase_estudiante
    ADD CONSTRAINT progresos_clase_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progresos_tarea_estudiante progresos_tarea_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresos_tarea_estudiante
    ADD CONSTRAINT progresos_tarea_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: progresos_tarea_estudiante progresos_tarea_estudiante_tarea_asignada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresos_tarea_estudiante
    ADD CONSTRAINT progresos_tarea_estudiante_tarea_asignada_id_fkey FOREIGN KEY (tarea_asignada_id) REFERENCES public.tareas_asignadas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: puntos_obtenidos puntos_obtenidos_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: puntos_obtenidos puntos_obtenidos_docente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: puntos_obtenidos puntos_obtenidos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_obtenidos
    ADD CONSTRAINT puntos_obtenidos_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rachas_estudiantes rachas_estudiantes_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rachas_estudiantes
    ADD CONSTRAINT rachas_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reacciones_feed reacciones_feed_actividad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reacciones_feed
    ADD CONSTRAINT reacciones_feed_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.actividad_feed(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reacciones_feed reacciones_feed_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reacciones_feed
    ADD CONSTRAINT reacciones_feed_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recordatorios recordatorios_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recordatorios
    ADD CONSTRAINT recordatorios_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recursos_estudiante recursos_estudiante_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recursos_estudiante
    ADD CONSTRAINT recursos_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rutas_especialidad rutas_especialidad_sectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rutas_especialidad
    ADD CONSTRAINT "rutas_especialidad_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES public.sectores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seguimientos_observacion seguimientos_observacion_observacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguimientos_observacion
    ADD CONSTRAINT seguimientos_observacion_observacion_id_fkey FOREIGN KEY (observacion_id) REFERENCES public.observaciones_docente(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: suscripciones suscripciones_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones
    ADD CONSTRAINT suscripciones_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.planes_suscripcion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: suscripciones suscripciones_tutor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suscripciones
    ADD CONSTRAINT suscripciones_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tareas_asignadas tareas_asignadas_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_asignadas
    ADD CONSTRAINT tareas_asignadas_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.asignaciones_planificacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tareas_asignadas tareas_asignadas_tarea_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_asignadas
    ADD CONSTRAINT tareas_asignadas_tarea_clase_id_fkey FOREIGN KEY (tarea_clase_id) REFERENCES public.tareas_clase(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tareas_clase tareas_clase_clase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_clase
    ADD CONSTRAINT tareas_clase_clase_id_fkey FOREIGN KEY (clase_id) REFERENCES public.clases_planificacion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tareas_clase tareas_clase_contenido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas_clase
    ADD CONSTRAINT tareas_clase_contenido_id_fkey FOREIGN KEY (contenido_id) REFERENCES public.contenidos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tareas tareas_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tareas
    ADD CONSTRAINT tareas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transacciones_recurso transacciones_recurso_recursos_estudiante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones_recurso
    ADD CONSTRAINT transacciones_recurso_recursos_estudiante_id_fkey FOREIGN KEY (recursos_estudiante_id) REFERENCES public.recursos_estudiante(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sWIb1vkGJizT1UsY01nAXvkujN5v5YWEfrpe132vVOXyghC0773yZ6Cp8wdf5CP

