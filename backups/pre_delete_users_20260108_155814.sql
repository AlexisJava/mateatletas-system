--
-- PostgreSQL database dump
--

\restrict 8Ie3qWH9WcifnKa3g9hXiGVDVan6N35UTlSywJvK5eKvlC3EdfZb8lU41LrdHKH

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
    livekit_room_name text
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
    creador_id text NOT NULL,
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
    must_change_password boolean DEFAULT true NOT NULL
);


ALTER TABLE public.docentes OWNER TO postgres;

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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL
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
cmk5rikgd006n8jcpjo5fpjp8	admin-doc-cvkuqbr2eekd45d7bs5enun9@test.com	hashed_password	\N	Admin cvkuqbr2eekd45d7bs5enun9	Test	2026-01-08 18:10:03.661	2026-01-08 18:10:03.661	2026-01-08 18:10:03.661	\N	["admin"]	\N	\N	f	{}
cmk4vyyi600008j4mbtjgwe0j	alex.admin@mateatletas.com	$2b$12$6nheXsBIOlSZQN3y.UclMuEfLnP8WzlNDsdnhBm/roPWZUJF7ZJ2S	\N	Alex	Admin	2026-01-08 03:27:00.653	2026-01-08 03:27:00.653	2026-01-08 03:33:22.708	\N	["admin"]	\N	\N	f	{}
cmk5rikmz007e8jcp99fczvcj	admin-doc-y3ce47hmlayyrbw2g0skspad@test.com	hashed_password	\N	Admin y3ce47hmlayyrbw2g0skspad	Test	2026-01-08 18:10:03.899	2026-01-08 18:10:03.899	2026-01-08 18:10:03.899	\N	["admin"]	\N	\N	f	{}
cmk5riknt007x8jcpvg5d3vwq	admin-doc-z5f3mqnobcaipjezvtalg8u3@test.com	hashed_password	\N	Admin z5f3mqnobcaipjezvtalg8u3	Test	2026-01-08 18:10:03.93	2026-01-08 18:10:03.93	2026-01-08 18:10:03.93	\N	["admin"]	\N	\N	f	{}
cmk5rikor008k8jcp9ouwuegn	admin-doc-kf9yxt0pu9u2minqkoljgwdz@test.com	hashed_password	\N	Admin kf9yxt0pu9u2minqkoljgwdz	Test	2026-01-08 18:10:03.963	2026-01-08 18:10:03.963	2026-01-08 18:10:03.963	\N	["admin"]	\N	\N	f	{}
cmk5rikpp00998jcpnfo0wrqj	admin-doc-j745gbvwfdnhy18kkiagnyeo@test.com	hashed_password	\N	Admin j745gbvwfdnhy18kkiagnyeo	Test	2026-01-08 18:10:03.997	2026-01-08 18:10:03.997	2026-01-08 18:10:03.997	\N	["admin"]	\N	\N	f	{}
cmk5rikqn009y8jcpfowgcx9u	admin-doc-wmbhb3bvhedwqmxdj0d9nsbk@test.com	hashed_password	\N	Admin wmbhb3bvhedwqmxdj0d9nsbk	Test	2026-01-08 18:10:04.031	2026-01-08 18:10:04.031	2026-01-08 18:10:04.031	\N	["admin"]	\N	\N	f	{}
cmk5rikrm00an8jcpvd21bv80	admin-doc-h7gw13sukpoclmcgbko6l9gr@test.com	hashed_password	\N	Admin h7gw13sukpoclmcgbko6l9gr	Test	2026-01-08 18:10:04.067	2026-01-08 18:10:04.067	2026-01-08 18:10:04.067	\N	["admin"]	\N	\N	f	{}
cmk5riksc00b68jcp9pdpe3yb	admin-doc-vwo9vyi4uvvk3nteyhctafb0@test.com	hashed_password	\N	Admin vwo9vyi4uvvk3nteyhctafb0	Test	2026-01-08 18:10:04.092	2026-01-08 18:10:04.092	2026-01-08 18:10:04.092	\N	["admin"]	\N	\N	f	{}
cmk5rikth00bv8jcpeivr32u6	admin-doc-g6l3owj38dr7tyso2w4dt09j@test.com	hashed_password	\N	Admin g6l3owj38dr7tyso2w4dt09j	Test	2026-01-08 18:10:04.133	2026-01-08 18:10:04.133	2026-01-08 18:10:04.133	\N	["admin"]	\N	\N	f	{}
cmk5rikuk00ck8jcpcagjr1la	admin-doc-yr409zu91bkkj4pm0zp94ujp@test.com	hashed_password	\N	Admin yr409zu91bkkj4pm0zp94ujp	Test	2026-01-08 18:10:04.173	2026-01-08 18:10:04.173	2026-01-08 18:10:04.173	\N	["admin"]	\N	\N	f	{}
cmk5rikvj00d38jcpb8b9lk3c	admin-doc-qde02gdvu7mqld7q1vux0pad@test.com	hashed_password	\N	Admin qde02gdvu7mqld7q1vux0pad	Test	2026-01-08 18:10:04.208	2026-01-08 18:10:04.208	2026-01-08 18:10:04.208	\N	["admin"]	\N	\N	f	{}
cmk5p4f4s00008j6mqbcn9ci2	admin-test-z2e9tq9wrp3pzt5hm8tyivmp@test.com	hashed_password	\N	Admin z2e9tq9wrp3pzt5hm8tyivmp	Test	2026-01-08 17:03:04.348	2026-01-08 17:03:04.348	2026-01-08 17:03:04.348	\N	["admin"]	\N	\N	f	{}
cmk5p4fbx00108j6mwsx1r2j8	admin-test-ni258oqcgxyc32lotp9ytptf@test.com	hashed_password	\N	Admin ni258oqcgxyc32lotp9ytptf	Test	2026-01-08 17:03:04.605	2026-01-08 17:03:04.605	2026-01-08 17:03:04.605	\N	["admin"]	\N	\N	f	{}
cmk5p4fcp001p8j6myvfdi285	admin-test-e3c3r68nf4qnc1q3eq9fdtxn@test.com	hashed_password	\N	Admin e3c3r68nf4qnc1q3eq9fdtxn	Test	2026-01-08 17:03:04.634	2026-01-08 17:03:04.634	2026-01-08 17:03:04.634	\N	["admin"]	\N	\N	f	{}
cmk5p4fd9002e8j6mvy0nsyvx	admin-test-r811rh4ayfbduouyv7v2rxmj@test.com	hashed_password	\N	Admin r811rh4ayfbduouyv7v2rxmj	Test	2026-01-08 17:03:04.654	2026-01-08 17:03:04.654	2026-01-08 17:03:04.654	\N	["admin"]	\N	\N	f	{}
cmk5p4fea00338j6m3swi4vkr	admin-test-vpcf58qxvocji9e30x63u8x2@test.com	hashed_password	\N	Admin vpcf58qxvocji9e30x63u8x2	Test	2026-01-08 17:03:04.691	2026-01-08 17:03:04.691	2026-01-08 17:03:04.691	\N	["admin"]	\N	\N	f	{}
cmk5p4ff4003u8j6mhwpdpulu	admin-test-dhgv8ltyv21r0qgs7m923966@test.com	hashed_password	\N	Admin dhgv8ltyv21r0qgs7m923966	Test	2026-01-08 17:03:04.721	2026-01-08 17:03:04.721	2026-01-08 17:03:04.721	\N	["admin"]	\N	\N	f	{}
cmk5p4ffr00488j6mm5s9gc42	admin-test-g723uxsqw1b0a1fpdj4wqc6m@test.com	hashed_password	\N	Admin g723uxsqw1b0a1fpdj4wqc6m	Test	2026-01-08 17:03:04.744	2026-01-08 17:03:04.744	2026-01-08 17:03:04.744	\N	["admin"]	\N	\N	f	{}
cmk5p4fg9004m8j6m75u49r4z	admin-test-yhh67zkvdmvwud4cc4tokq4z@test.com	hashed_password	\N	Admin yhh67zkvdmvwud4cc4tokq4z	Test	2026-01-08 17:03:04.761	2026-01-08 17:03:04.761	2026-01-08 17:03:04.761	\N	["admin"]	\N	\N	f	{}
cmk5p4fgx00508j6mqgwep6mi	admin-test-ieh1acbu2174f34nsywlqtc5@test.com	hashed_password	\N	Admin ieh1acbu2174f34nsywlqtc5	Test	2026-01-08 17:03:04.786	2026-01-08 17:03:04.786	2026-01-08 17:03:04.786	\N	["admin"]	\N	\N	f	{}
cmk5p4fhe005e8j6m0tbtszhu	admin-test-voazntygccrko7ozw6nxm3kk@test.com	hashed_password	\N	Admin voazntygccrko7ozw6nxm3kk	Test	2026-01-08 17:03:04.803	2026-01-08 17:03:04.803	2026-01-08 17:03:04.803	\N	["admin"]	\N	\N	f	{}
cmk5p4fi600638j6mi0oodaxd	admin-test-vgqple93hbk5q9ub3uf4qhcl@test.com	hashed_password	\N	Admin vgqple93hbk5q9ub3uf4qhcl	Test	2026-01-08 17:03:04.83	2026-01-08 17:03:04.83	2026-01-08 17:03:04.83	\N	["admin"]	\N	\N	f	{}
cmk5p4fim006h8j6m4s5gk2k7	admin-test-txrmeas6rfameeu5gc36eip4@test.com	hashed_password	\N	Admin txrmeas6rfameeu5gc36eip4	Test	2026-01-08 17:03:04.847	2026-01-08 17:03:04.847	2026-01-08 17:03:04.847	\N	["admin"]	\N	\N	f	{}
cmk5p4fjd006z8j6mxz8c7w5u	admin-test-hg53xxk5poeso6hyvofnfib0@test.com	hashed_password	\N	Admin hg53xxk5poeso6hyvofnfib0	Test	2026-01-08 17:03:04.874	2026-01-08 17:03:04.874	2026-01-08 17:03:04.874	\N	["admin"]	\N	\N	f	{}
cmk5p4fjt007d8j6mk8b8yjr2	admin-test-kdp8vt5m6458vap0xsgd60m7@test.com	hashed_password	\N	Admin kdp8vt5m6458vap0xsgd60m7	Test	2026-01-08 17:03:04.89	2026-01-08 17:03:04.89	2026-01-08 17:03:04.89	\N	["admin"]	\N	\N	f	{}
cmk5p4fkj007v8j6m6wsjxmw4	admin-test-mzz4a6uct19eijwm5ztdu9ix@test.com	hashed_password	\N	Admin mzz4a6uct19eijwm5ztdu9ix	Test	2026-01-08 17:03:04.916	2026-01-08 17:03:04.916	2026-01-08 17:03:04.916	\N	["admin"]	\N	\N	f	{}
cmk5p4flc008d8j6mjmi2z8x3	admin-test-yxhjvl866ht5aha8ahibrn7z@test.com	hashed_password	\N	Admin yxhjvl866ht5aha8ahibrn7z	Test	2026-01-08 17:03:04.944	2026-01-08 17:03:04.944	2026-01-08 17:03:04.944	\N	["admin"]	\N	\N	f	{}
cmk5p4flw008r8j6m3heaw6iz	admin-test-m2lhpea9zvsjobbekqgttjhj@test.com	hashed_password	\N	Admin m2lhpea9zvsjobbekqgttjhj	Test	2026-01-08 17:03:04.965	2026-01-08 17:03:04.965	2026-01-08 17:03:04.965	\N	["admin"]	\N	\N	f	{}
cmk5p4fmi00958j6mty4uv3n6	admin-test-ac6rze9j2azm5s3ys03fpdyl@test.com	hashed_password	\N	Admin ac6rze9j2azm5s3ys03fpdyl	Test	2026-01-08 17:03:04.986	2026-01-08 17:03:04.986	2026-01-08 17:03:04.986	\N	["admin"]	\N	\N	f	{}
cmk5p4fn1009j8j6mbl47idp7	admin-test-wn9jewmg2wco77sjaqjk6fcd@test.com	hashed_password	\N	Admin wn9jewmg2wco77sjaqjk6fcd	Test	2026-01-08 17:03:05.005	2026-01-08 17:03:05.005	2026-01-08 17:03:05.005	\N	["admin"]	\N	\N	f	{}
cmk5p4fnp009x8j6m16s9z5ej	admin-test-fo0kak6wgul9khao8sarvds5@test.com	hashed_password	\N	Admin fo0kak6wgul9khao8sarvds5	Test	2026-01-08 17:03:05.029	2026-01-08 17:03:05.029	2026-01-08 17:03:05.029	\N	["admin"]	\N	\N	f	{}
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
cmk5rikgj006r8jcp7e27vl2l	GT-h88eop48wbbbvu0l0jb7bgv3	Grupo Test h88eop48wbbbvu0l0jb7bgv3	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikgh006p8jcpjz3x6eh8	cmk5rikgf006o8jcp3l8brs8h	\N	\N	t	2026-01-08 18:10:03.667	2026-01-08 18:10:03.667	Programada	\N	\N	\N
cmk5rikn4007i8jcpfom8v0r9	GT-mxjflb6g2z57o2vc3il1uati	Grupo Test mxjflb6g2z57o2vc3il1uati	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikn2007g8jcpszbij119	cmk5rikn1007f8jcp4yd23vqz	\N	\N	t	2026-01-08 18:10:03.904	2026-01-08 18:10:03.904	Programada	\N	\N	\N
cmk5riknz00818jcpps3m8tzz	GT-zwar9gxxhk8hu7bbr7wyxcfz	Grupo Test zwar9gxxhk8hu7bbr7wyxcfz	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5riknx007z8jcpmsijgiq2	cmk5riknv007y8jcpjn47swzd	\N	\N	t	2026-01-08 18:10:03.935	2026-01-08 18:10:03.935	Programada	\N	\N	\N
cmk5rikov008o8jcpimg8inqd	GT-a0l5it1hhza3s0nckaxvdbua	Grupo Test a0l5it1hhza3s0nckaxvdbua	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikou008m8jcp7jkap4fr	cmk5rikos008l8jcpxwujwlk7	\N	\N	t	2026-01-08 18:10:03.967	2026-01-08 18:10:03.967	Programada	\N	\N	\N
cmk5rikpu009d8jcpbvkm7v3m	GT-pyff8z0gbw8nehhf2amku2bx	Grupo Test pyff8z0gbw8nehhf2amku2bx	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikps009b8jcpqjh4ltjj	cmk5rikpq009a8jcp99u948bp	\N	\N	t	2026-01-08 18:10:04.002	2026-01-08 18:10:04.002	Programada	\N	\N	\N
cmk5rikqr00a28jcpbnqf5z0m	GT-o00ibz75meldj69wf5jhppnm	Grupo Test o00ibz75meldj69wf5jhppnm	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikqq00a08jcpbrrbgyzf	cmk5rikqo009z8jcp4hiaphzc	\N	\N	t	2026-01-08 18:10:04.036	2026-01-08 18:10:04.036	Programada	\N	\N	\N
cmk5rikrr00ar8jcpa3d7nxf6	GT-rud1wt91n1tistbtu4wym4q2	Grupo Test rud1wt91n1tistbtu4wym4q2	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikrq00ap8jcpnta2ukh2	cmk5rikro00ao8jcpco8bg3y4	\N	\N	t	2026-01-08 18:10:04.072	2026-01-08 18:10:04.072	Programada	\N	\N	\N
cmk5riksh00ba8jcp1lqqnjyv	GT-panwxzriu8z3li6j1z4o8qiz	Grupo Test panwxzriu8z3li6j1z4o8qiz	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5riksg00b88jcp7xlgvwyg	cmk5rikse00b78jcp28wm6ytu	\N	\N	t	2026-01-08 18:10:04.097	2026-01-08 18:10:04.097	Programada	\N	\N	\N
cmk5riktn00bz8jcphqw04u3k	GT-qnwyrbsys09dy4e1g63h69jf	Grupo Test qnwyrbsys09dy4e1g63h69jf	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5riktl00bx8jcpq0lxs3i3	cmk5riktj00bw8jcpmowxyziz	\N	\N	t	2026-01-08 18:10:04.139	2026-01-08 18:10:04.139	Programada	\N	\N	\N
cmk5rikuq00co8jcpqs2xuxle	GT-bieqs6j0zfxn6xytld8mm5v6	Grupo Test bieqs6j0zfxn6xytld8mm5v6	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikup00cm8jcphqa19x4s	cmk5rikun00cl8jcp32yowfzh	\N	\N	t	2026-01-08 18:10:04.178	2026-01-08 18:10:04.178	Programada	\N	\N	\N
cmk5rikvp00d78jcp9izwyocz	GT-vnfes19kmo7302rzbc0n8way	Grupo Test vnfes19kmo7302rzbc0n8way	GRUPO_REGULAR	LUNES	15:00	16:30	2026-01-01 00:00:00	2026-12-15 00:00:00	2026	30	cmk5rikvo00d58jcpck2t2f7g	cmk5rikvl00d48jcpz1w8v8cm	\N	\N	t	2026-01-08 18:10:04.214	2026-01-08 18:10:04.214	Programada	\N	\N	\N
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
cmk5dt774003f8jvw0fvgnl69	cmk5dt774003d8jvw8627695y	1	Clase 1	\N	cmk5dt73p00028jvw7khokhzt	cmk5dt74800078jvwxi8yevav	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003g8jvw7j4u3hmg	cmk5dt774003d8jvw8627695y	2	Clase 2	\N	cmk5dt74s000c8jvwmi9gl1a6	cmk5dt750000h8jvwotssxztp	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003h8jvw9l62ckdg	cmk5dt774003d8jvw8627695y	3	Clase 3	\N	cmk5dt756000m8jvwv8zkpk8u	cmk5dt75m000r8jvwyzruntdr	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003i8jvw48o0c4e1	cmk5dt774003d8jvw8627695y	4	Clase 4	\N	cmk5dt760000w8jvwaxb9mj9h	cmk5dt76600118jvwj954a06w	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003j8jvwgqmdastz	cmk5dt774003d8jvw8627695y	5	Clase 5	\N	cmk5dt76800168jvwbcppx429	cmk5dt76a001b8jvwl7fj3dh0	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003k8jvwd264i2zd	cmk5dt774003d8jvw8627695y	6	Clase 6	\N	cmk5dt76c001g8jvwurshy8i9	cmk5dt76e001l8jvwmqlibosg	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003l8jvw7ejl2nyt	cmk5dt774003d8jvw8627695y	7	Clase 7	\N	cmk5dt76g001q8jvw9myjvwki	cmk5dt76j001v8jvwx3w7y1qz	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003m8jvwunm8nylp	cmk5dt774003d8jvw8627695y	8	Clase 8	\N	cmk5dt76l00208jvw75fvsxhi	cmk5dt76n00258jvwc86nq8xn	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003n8jvwb0jiv794	cmk5dt774003d8jvw8627695y	9	Clase 9	\N	cmk5dt76o002a8jvwu2snot6q	cmk5dt76q002f8jvwiznp3d2o	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003o8jvwf9iryrmq	cmk5dt774003d8jvw8627695y	10	Clase 10	\N	cmk5dt76s002k8jvw7n7gygi1	cmk5dt76t002p8jvws9a1e9f1	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003p8jvw87wcbv8d	cmk5dt774003d8jvw8627695y	11	Clase 11	\N	cmk5dt76v002u8jvwbjtviwiw	cmk5dt76x002z8jvwzjs4ty4b	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5dt774003q8jvwk88mbcm1	cmk5dt774003d8jvw8627695y	12	Clase 12	\N	cmk5dt77000348jvw28ggban7	cmk5dt77100398jvwp4lj0bx5	2026-01-08 11:46:25.072	2026-01-08 11:46:25.072
cmk5rikh000778jcpu3lwujwu	cmk5rikh000758jcpqj5usjau	1	Clase 1	\N	cmk5rikgt006y8jcp6yjzq29s	cmk5rikgv00708jcplurxci8u	2026-01-08 18:10:03.684	2026-01-08 18:10:03.684
cmk5rikh000788jcppmsqwi4e	cmk5rikh000758jcpqj5usjau	2	Clase 2	\N	cmk5rikgw00728jcpuv25x6hw	cmk5rikgy00748jcpmuhahob7	2026-01-08 18:10:03.684	2026-01-08 18:10:03.684
cmk5riknc007t8jcp3aq25xgh	cmk5riknc007r8jcpfcvqm3r1	1	Clase 1	\N	cmk5rikn6007k8jcp7yzhwpb2	cmk5rikn7007m8jcpmhfjtl86	2026-01-08 18:10:03.912	2026-01-08 18:10:03.912
cmk5riknc007u8jcpm6xk6ei5	cmk5riknc007r8jcpfcvqm3r1	2	Clase 2	\N	cmk5rikn9007o8jcph84vu185	cmk5rikna007q8jcps0z02dgb	2026-01-08 18:10:03.912	2026-01-08 18:10:03.912
cmk5riko8008c8jcp5ezrlyia	cmk5riko8008a8jcp85pw9cr5	1	Clase 1	\N	cmk5riko100838jcp3gmmakz0	cmk5riko300858jcpj9tinqfr	2026-01-08 18:10:03.944	2026-01-08 18:10:03.944
cmk5riko8008d8jcp2dq3dbnm	cmk5riko8008a8jcp85pw9cr5	2	Clase 2	\N	cmk5riko500878jcp8402soix	cmk5riko600898jcpyisobo6h	2026-01-08 18:10:03.944	2026-01-08 18:10:03.944
cmk5rikp5008z8jcprgojwika	cmk5rikp5008x8jcpla3z3aek	1	Clase 1	\N	cmk5rikox008q8jcpvbh15sag	cmk5rikoz008s8jcp4g9qxlfu	2026-01-08 18:10:03.977	2026-01-08 18:10:03.977
cmk5rikp500908jcpkdianj35	cmk5rikp5008x8jcpla3z3aek	2	Clase 2	\N	cmk5rikp1008u8jcphy9m9dei	cmk5rikp3008w8jcpi0cslv2t	2026-01-08 18:10:03.977	2026-01-08 18:10:03.977
cmk5rikq3009o8jcpub5snm0j	cmk5rikq2009m8jcpq68i7lo0	1	Clase 1	\N	cmk5rikpw009f8jcpks94ucpc	cmk5rikpx009h8jcpcxwx9asc	2026-01-08 18:10:04.011	2026-01-08 18:10:04.011
cmk5rikq3009p8jcphlykq2aw	cmk5rikq2009m8jcpq68i7lo0	2	Clase 2	\N	cmk5rikpz009j8jcp9qyjqdkq	cmk5rikq1009l8jcpczl0ft18	2026-01-08 18:10:04.011	2026-01-08 18:10:04.011
cmk5rikr100ad8jcpiz6tua6q	cmk5rikr100ab8jcprfgpqovb	1	Clase 1	\N	cmk5rikqt00a48jcpk4dsourr	cmk5rikqv00a68jcpy8mtvugl	2026-01-08 18:10:04.045	2026-01-08 18:10:04.045
cmk5rikr100ae8jcpqbzxj8dt	cmk5rikr100ab8jcprfgpqovb	2	Clase 2	\N	cmk5rikqx00a88jcpucwpzzrp	cmk5rikqz00aa8jcpn53dol9a	2026-01-08 18:10:04.045	2026-01-08 18:10:04.045
cmk5riks000b28jcpdxrjq7bv	cmk5riks000b08jcptr487m6s	1	Clase 1	\N	cmk5rikrt00at8jcpxcpg02k5	cmk5rikrv00av8jcp9z31ehgo	2026-01-08 18:10:04.08	2026-01-08 18:10:04.08
cmk5riks000b38jcp7brr0dhp	cmk5riks000b08jcptr487m6s	2	Clase 2	\N	cmk5rikrw00ax8jcpas2y2a30	cmk5rikry00az8jcp1fn5kows	2026-01-08 18:10:04.08	2026-01-08 18:10:04.08
cmk5riksr00bl8jcp25kr6mv2	cmk5riksq00bj8jcp387enjwd	1	Clase 1	\N	cmk5riksj00bc8jcpth5f57tl	cmk5riksk00be8jcpifoau9e4	2026-01-08 18:10:04.107	2026-01-08 18:10:04.107
cmk5riksr00bm8jcps84j0h19	cmk5riksq00bj8jcp387enjwd	2	Clase 2	\N	cmk5riksn00bg8jcprz8do7hp	cmk5riksp00bi8jcpho5xeoxw	2026-01-08 18:10:04.107	2026-01-08 18:10:04.107
cmk5riktx00ca8jcp0y1bba81	cmk5riktx00c88jcpdynx3mkd	1	Clase 1	\N	cmk5riktp00c18jcp2gewxdy6	cmk5riktr00c38jcpz7ta56v8	2026-01-08 18:10:04.149	2026-01-08 18:10:04.149
cmk5riktx00cb8jcpxsavpp0n	cmk5riktx00c88jcpdynx3mkd	2	Clase 2	\N	cmk5riktt00c58jcphgrvvdij	cmk5riktv00c78jcplm4ovra3	2026-01-08 18:10:04.149	2026-01-08 18:10:04.149
cmk5rikv100cz8jcpgi7r38qt	cmk5rikv100cx8jcpuj33az94	1	Clase 1	\N	cmk5rikus00cq8jcpwtyzyey2	cmk5rikut00cs8jcprn5cnxrc	2026-01-08 18:10:04.189	2026-01-08 18:10:04.189
cmk5rikv100d08jcpsuziggdy	cmk5rikv100cx8jcpuj33az94	2	Clase 2	\N	cmk5rikuv00cu8jcp8dgh00dl	cmk5rikuy00cw8jcplcw1qbrm	2026-01-08 18:10:04.189	2026-01-08 18:10:04.189
cmk5rikwb00dn8jcpnods79s5	cmk5rikwb00dl8jcpgoeoii5b	1	Clase 1	\N	cmk5rikvz00de8jcpdarae0ec	cmk5rikw100dg8jcpvb7ha336	2026-01-08 18:10:04.235	2026-01-08 18:10:04.235
cmk5rikwb00do8jcp2fwgjra5	cmk5rikwb00dl8jcpgoeoii5b	2	Clase 2	\N	cmk5rikw400di8jcpo8o8byh4	cmk5rikw800dk8jcpoux7qnlw	2026-01-08 18:10:04.235	2026-01-08 18:10:04.235
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

COPY public.comisiones (id, nombre, descripcion, producto_id, casa_id, docente_id, cupo_maximo, horario, fecha_inicio, fecha_fin, activo, "createdAt", "updatedAt", estado_clase, finalizada_en, iniciada_en, livekit_room_name) FROM stdin;
cmk4e4blx00128ji6lp4f661m	Comisión Filtro	\N	cmk4e4blu00108ji6is17a0hb	\N	\N	\N	\N	\N	\N	t	2026-01-07 19:07:17.829	2026-01-07 19:07:17.829	Programada	\N	\N	\N
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
cmk5p4f6b00028j6m2xphbj0j	Matemáticas Básicas - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4f4s00008j6mqbcn9ci2	\N	\N	0	\N	\N	2026-01-08 17:03:04.404	2026-01-08 17:03:04.404	\N	LECCION
cmk5p4f6g00078j6mj3c0v5qm	Matemáticas Básicas - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4f4s00008j6mqbcn9ci2	\N	\N	0	\N	\N	2026-01-08 17:03:04.409	2026-01-08 17:03:04.409	\N	TAREA
cmk5p4f6j000c8j6mkci890dr	Matemáticas Básicas - Clase 2 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4f4s00008j6mqbcn9ci2	\N	\N	0	\N	\N	2026-01-08 17:03:04.411	2026-01-08 17:03:04.411	\N	LECCION
cmk5p4f6l000h8j6m3jh4mnxs	Matemáticas Básicas - Clase 2 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4f4s00008j6mqbcn9ci2	\N	\N	0	\N	\N	2026-01-08 17:03:04.413	2026-01-08 17:03:04.413	\N	TAREA
cmk5p4f6n000m8j6mv37k2yxz	Matemáticas Básicas - Clase 3 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4f4s00008j6mqbcn9ci2	\N	\N	0	\N	\N	2026-01-08 17:03:04.416	2026-01-08 17:03:04.416	\N	LECCION
cmk5p4f6p000r8j6m8oas91ho	Matemáticas Básicas - Clase 3 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4f4s00008j6mqbcn9ci2	\N	\N	0	\N	\N	2026-01-08 17:03:04.418	2026-01-08 17:03:04.418	\N	TAREA
cmk5p4fc100128j6m9cxnx55p	Sin Descripción - Clase 1 (Teoría)	VERTEX	PROGRAMACION	BORRADOR	cmk5p4fbx00108j6mwsx1r2j8	\N	\N	0	\N	\N	2026-01-08 17:03:04.609	2026-01-08 17:03:04.609	\N	LECCION
cmk5p4fc500178j6mlaz197oi	Sin Descripción - Clase 1 (Práctica)	VERTEX	PROGRAMACION	BORRADOR	cmk5p4fbx00108j6mwsx1r2j8	\N	\N	0	\N	\N	2026-01-08 17:03:04.613	2026-01-08 17:03:04.613	\N	TAREA
cmk5p4fc8001c8j6m1sf9oxyw	Sin Descripción - Clase 2 (Teoría)	VERTEX	PROGRAMACION	BORRADOR	cmk5p4fbx00108j6mwsx1r2j8	\N	\N	0	\N	\N	2026-01-08 17:03:04.616	2026-01-08 17:03:04.616	\N	LECCION
cmk5p4fcb001h8j6m3vengw7l	Sin Descripción - Clase 2 (Práctica)	VERTEX	PROGRAMACION	BORRADOR	cmk5p4fbx00108j6mwsx1r2j8	\N	\N	0	\N	\N	2026-01-08 17:03:04.619	2026-01-08 17:03:04.619	\N	TAREA
cmk5p4fcr001r8j6mioohj7q1	Con Contenidos - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fcp001p8j6myvfdi285	\N	\N	0	\N	\N	2026-01-08 17:03:04.636	2026-01-08 17:03:04.636	\N	LECCION
cmk5p4fct001w8j6mcxkpxv4o	Con Contenidos - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fcp001p8j6myvfdi285	\N	\N	0	\N	\N	2026-01-08 17:03:04.638	2026-01-08 17:03:04.638	\N	TAREA
cmk5p4fcv00218j6mmk41a72j	Con Contenidos - Clase 2 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fcp001p8j6myvfdi285	\N	\N	0	\N	\N	2026-01-08 17:03:04.639	2026-01-08 17:03:04.639	\N	LECCION
cmk5p4fcx00268j6mticz7606	Con Contenidos - Clase 2 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fcp001p8j6myvfdi285	\N	\N	0	\N	\N	2026-01-08 17:03:04.641	2026-01-08 17:03:04.641	\N	TAREA
cmk5p4fdc002g8j6m5brhftdb	Para Obtener - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fd9002e8j6mvy0nsyvx	\N	\N	0	\N	\N	2026-01-08 17:03:04.656	2026-01-08 17:03:04.656	\N	LECCION
cmk5p4fde002l8j6mkvpaltvv	Para Obtener - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fd9002e8j6mvy0nsyvx	\N	\N	0	\N	\N	2026-01-08 17:03:04.658	2026-01-08 17:03:04.658	\N	TAREA
cmk5p4fdg002q8j6mqw5ize68	Para Obtener - Clase 2 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fd9002e8j6mvy0nsyvx	\N	\N	0	\N	\N	2026-01-08 17:03:04.661	2026-01-08 17:03:04.661	\N	LECCION
cmk5dt77000348jvw28ggban7	Nueva Planificación - Clase 12 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.068	2026-01-08 11:46:25.068	\N	LECCION
cmk5p4fdj002v8j6mwvi08ogw	Para Obtener - Clase 2 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fd9002e8j6mvy0nsyvx	\N	\N	0	\N	\N	2026-01-08 17:03:04.663	2026-01-08 17:03:04.663	\N	TAREA
cmk5p4fec00358j6ml9in6r8y	Lista 1 - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fea00338j6m3swi4vkr	\N	\N	0	\N	\N	2026-01-08 17:03:04.693	2026-01-08 17:03:04.693	\N	LECCION
cmk5p4fef003a8j6mxr8eizfk	Lista 1 - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fea00338j6m3swi4vkr	\N	\N	0	\N	\N	2026-01-08 17:03:04.695	2026-01-08 17:03:04.695	\N	TAREA
cmk5p4fel003i8j6ms03yjgjd	Lista 2 - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fea00338j6m3swi4vkr	\N	\N	0	\N	\N	2026-01-08 17:03:04.702	2026-01-08 17:03:04.702	\N	LECCION
cmk5p4fen003n8j6mefe048ir	Lista 2 - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fea00338j6m3swi4vkr	\N	\N	0	\N	\N	2026-01-08 17:03:04.704	2026-01-08 17:03:04.704	\N	TAREA
cmk5p4ff6003w8j6m0umd2y7k	Borrador - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4ff4003u8j6mhwpdpulu	\N	\N	0	\N	\N	2026-01-08 17:03:04.723	2026-01-08 17:03:04.723	\N	LECCION
cmk5dt73p00028jvw7khokhzt	Nueva Planificación - Clase 1 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:24.949	2026-01-08 11:46:24.949	\N	LECCION
cmk5dt74800078jvwxi8yevav	Nueva Planificación - Clase 1 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:24.969	2026-01-08 11:46:24.969	\N	TAREA
cmk5dt74s000c8jvwmi9gl1a6	Nueva Planificación - Clase 2 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:24.989	2026-01-08 11:46:24.989	\N	LECCION
cmk5dt750000h8jvwotssxztp	Nueva Planificación - Clase 2 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:24.996	2026-01-08 11:46:24.996	\N	TAREA
cmk5dt756000m8jvwv8zkpk8u	Nueva Planificación - Clase 3 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.002	2026-01-08 11:46:25.002	\N	LECCION
cmk5dt75m000r8jvwyzruntdr	Nueva Planificación - Clase 3 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.019	2026-01-08 11:46:25.019	\N	TAREA
cmk5dt760000w8jvwaxb9mj9h	Nueva Planificación - Clase 4 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.033	2026-01-08 11:46:25.033	\N	LECCION
cmk5dt76600118jvwj954a06w	Nueva Planificación - Clase 4 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.038	2026-01-08 11:46:25.038	\N	TAREA
cmk5dt76800168jvwbcppx429	Nueva Planificación - Clase 5 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.041	2026-01-08 11:46:25.041	\N	LECCION
cmk5dt76a001b8jvwl7fj3dh0	Nueva Planificación - Clase 5 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.043	2026-01-08 11:46:25.043	\N	TAREA
cmk5dt76c001g8jvwurshy8i9	Nueva Planificación - Clase 6 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.045	2026-01-08 11:46:25.045	\N	LECCION
cmk5dt76e001l8jvwmqlibosg	Nueva Planificación - Clase 6 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.046	2026-01-08 11:46:25.046	\N	TAREA
cmk5dt76g001q8jvw9myjvwki	Nueva Planificación - Clase 7 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.048	2026-01-08 11:46:25.048	\N	LECCION
cmk5dt76j001v8jvwx3w7y1qz	Nueva Planificación - Clase 7 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.051	2026-01-08 11:46:25.051	\N	TAREA
cmk5dt76l00208jvw75fvsxhi	Nueva Planificación - Clase 8 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.053	2026-01-08 11:46:25.053	\N	LECCION
cmk5dt76n00258jvwc86nq8xn	Nueva Planificación - Clase 8 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.055	2026-01-08 11:46:25.055	\N	TAREA
cmk5dt76o002a8jvwu2snot6q	Nueva Planificación - Clase 9 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.057	2026-01-08 11:46:25.057	\N	LECCION
cmk5dt76q002f8jvwiznp3d2o	Nueva Planificación - Clase 9 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.058	2026-01-08 11:46:25.058	\N	TAREA
cmk5dt76s002k8jvw7n7gygi1	Nueva Planificación - Clase 10 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.06	2026-01-08 11:46:25.06	\N	LECCION
cmk5dt76t002p8jvws9a1e9f1	Nueva Planificación - Clase 10 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.062	2026-01-08 11:46:25.062	\N	TAREA
cmk5dt76v002u8jvwbjtviwiw	Nueva Planificación - Clase 11 (Teoría)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.063	2026-01-08 11:46:25.063	\N	LECCION
cmk5dt76x002z8jvwzjs4ty4b	Nueva Planificación - Clase 11 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.066	2026-01-08 11:46:25.066	\N	TAREA
cmk5dt77100398jvwp4lj0bx5	Nueva Planificación - Clase 12 (Práctica)	VERTEX	CIENCIAS	BORRADOR	cmk4vyyi600008j4mbtjgwe0j	\N	\N	0	\N	\N	2026-01-08 11:46:25.07	2026-01-08 11:46:25.07	\N	TAREA
cmk5p4ffa00418j6mamm7hdno	Borrador - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4ff4003u8j6mhwpdpulu	\N	\N	0	\N	\N	2026-01-08 17:03:04.727	2026-01-08 17:03:04.727	\N	TAREA
cmk5p4ffu004a8j6m6boowwun	Vertex - Clase 1 (Teoría)	VERTEX	MATEMATICA	BORRADOR	cmk5p4ffr00488j6mm5s9gc42	\N	\N	0	\N	\N	2026-01-08 17:03:04.746	2026-01-08 17:03:04.746	\N	LECCION
cmk5p4ffw004f8j6mtx1m5wkq	Vertex - Clase 1 (Práctica)	VERTEX	MATEMATICA	BORRADOR	cmk5p4ffr00488j6mm5s9gc42	\N	\N	0	\N	\N	2026-01-08 17:03:04.748	2026-01-08 17:03:04.748	\N	TAREA
cmk5p4fgb004o8j6mcax0radf	Original - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fg9004m8j6m75u49r4z	\N	\N	0	\N	\N	2026-01-08 17:03:04.763	2026-01-08 17:03:04.763	\N	LECCION
cmk5p4fgd004t8j6mgsb6xni8	Original - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fg9004m8j6m75u49r4z	\N	\N	0	\N	\N	2026-01-08 17:03:04.765	2026-01-08 17:03:04.765	\N	TAREA
cmk5p4fgz00528j6mbaeiz4e5	Para Publicar - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fgx00508j6mqgwep6mi	\N	\N	0	\N	\N	2026-01-08 17:03:04.788	2026-01-08 17:03:04.788	\N	LECCION
cmk5p4fh100578j6mmf2483a3	Para Publicar - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fgx00508j6mqgwep6mi	\N	\N	0	\N	\N	2026-01-08 17:03:04.79	2026-01-08 17:03:04.79	\N	TAREA
cmk5p4fhg005g8j6mt4w0vkwx	Con Clases - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fhe005e8j6m0tbtszhu	\N	\N	0	\N	\N	2026-01-08 17:03:04.805	2026-01-08 17:03:04.805	\N	LECCION
cmk5p4fhi005l8j6m45eyipij	Con Clases - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fhe005e8j6m0tbtszhu	\N	\N	0	\N	\N	2026-01-08 17:03:04.806	2026-01-08 17:03:04.806	\N	TAREA
cmk5p4fhk005q8j6mwvizb47j	Con Clases - Clase 2 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fhe005e8j6m0tbtszhu	\N	\N	0	\N	\N	2026-01-08 17:03:04.808	2026-01-08 17:03:04.808	\N	LECCION
cmk5p4fhm005v8j6mtncycm52	Con Clases - Clase 2 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fhe005e8j6m0tbtszhu	\N	\N	0	\N	\N	2026-01-08 17:03:04.81	2026-01-08 17:03:04.81	\N	TAREA
cmk5p4fi800658j6mjsna8dnf	No Borrador - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fi600638j6mi0oodaxd	\N	\N	0	\N	\N	2026-01-08 17:03:04.832	2026-01-08 17:03:04.832	\N	LECCION
cmk5p4fi9006a8j6mumhvnd58	No Borrador - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fi600638j6mi0oodaxd	\N	\N	0	\N	\N	2026-01-08 17:03:04.834	2026-01-08 17:03:04.834	\N	TAREA
cmk5p4fip006j8j6mxljlm7la	Con Tareas - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fim006h8j6m4s5gk2k7	\N	\N	0	\N	\N	2026-01-08 17:03:04.849	2026-01-08 17:03:04.849	\N	LECCION
cmk5p4fir006o8j6m4ajeqttd	Con Tareas - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fim006h8j6m4s5gk2k7	\N	\N	0	\N	\N	2026-01-08 17:03:04.851	2026-01-08 17:03:04.851	\N	TAREA
cmk5p4fjf00718j6mmrie9472	Sin Contenido - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fjd006z8j6mxz8c7w5u	\N	\N	0	\N	\N	2026-01-08 17:03:04.875	2026-01-08 17:03:04.875	\N	LECCION
cmk5p4fjh00768j6mvvuw2vml	Sin Contenido - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fjd006z8j6mxz8c7w5u	\N	\N	0	\N	\N	2026-01-08 17:03:04.877	2026-01-08 17:03:04.877	\N	TAREA
cmk5p4fjv007f8j6m8ejy00f6	Duplicada - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fjt007d8j6mk8b8yjr2	\N	\N	0	\N	\N	2026-01-08 17:03:04.891	2026-01-08 17:03:04.891	\N	LECCION
cmk5p4fjx007k8j6m5xlfhl1e	Duplicada - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fjt007d8j6mk8b8yjr2	\N	\N	0	\N	\N	2026-01-08 17:03:04.894	2026-01-08 17:03:04.894	\N	TAREA
cmk5p4fkl007x8j6me70diks0	Eliminar Tarea - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fkj007v8j6m6wsjxmw4	\N	\N	0	\N	\N	2026-01-08 17:03:04.918	2026-01-08 17:03:04.918	\N	LECCION
cmk5p4fkn00828j6muovbnuld	Eliminar Tarea - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fkj007v8j6m6wsjxmw4	\N	\N	0	\N	\N	2026-01-08 17:03:04.92	2026-01-08 17:03:04.92	\N	TAREA
cmk5p4fle008f8j6mnm8wccxe	Sin Tarea - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4flc008d8j6mjmi2z8x3	\N	\N	0	\N	\N	2026-01-08 17:03:04.946	2026-01-08 17:03:04.946	\N	LECCION
cmk5p4flg008k8j6mejzcjelz	Sin Tarea - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4flc008d8j6mjmi2z8x3	\N	\N	0	\N	\N	2026-01-08 17:03:04.948	2026-01-08 17:03:04.948	\N	TAREA
cmk5p4fly008t8j6m8vzkkd55	Ya Publicada - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4flw008r8j6m3heaw6iz	\N	\N	0	\N	\N	2026-01-08 17:03:04.967	2026-01-08 17:03:04.967	\N	LECCION
cmk5p4fm0008y8j6m7nbn2w4l	Ya Publicada - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4flw008r8j6m3heaw6iz	\N	\N	0	\N	\N	2026-01-08 17:03:04.968	2026-01-08 17:03:04.968	\N	TAREA
cmk5p4fmk00978j6m6yvmtufh	Sin Contenido - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fmi00958j6mty4uv3n6	\N	\N	0	\N	\N	2026-01-08 17:03:04.988	2026-01-08 17:03:04.988	\N	LECCION
cmk5p4fmm009c8j6mvjsr5rnc	Sin Contenido - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fmi00958j6mty4uv3n6	\N	\N	0	\N	\N	2026-01-08 17:03:04.99	2026-01-08 17:03:04.99	\N	TAREA
cmk5p4fn3009l8j6mo9h6019z	Para Eliminar - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fn1009j8j6mbl47idp7	\N	\N	0	\N	\N	2026-01-08 17:03:05.007	2026-01-08 17:03:05.007	\N	LECCION
cmk5p4fn5009q8j6m2m4n5ol3	Para Eliminar - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fn1009j8j6mbl47idp7	\N	\N	0	\N	\N	2026-01-08 17:03:05.009	2026-01-08 17:03:05.009	\N	TAREA
cmk5p4fnr009z8j6m4s78m75d	Publicada - Clase 1 (Teoría)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fnp009x8j6m16s9z5ej	\N	\N	0	\N	\N	2026-01-08 17:03:05.031	2026-01-08 17:03:05.031	\N	LECCION
cmk5p4fnt00a48j6mw3qjuzii	Publicada - Clase 1 (Práctica)	QUANTUM	MATEMATICA	BORRADOR	cmk5p4fnp009x8j6m16s9z5ej	\N	\N	0	\N	\N	2026-01-08 17:03:05.033	2026-01-08 17:03:05.033	\N	TAREA
cmk5rikgt006y8jcp6yjzq29s	Teoría Clase 1 tptpbw5pbcwszju9y6l0wh5y	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikgd006n8jcpjo5fpjp8	\N	\N	0	\N	\N	2026-01-08 18:10:03.677	2026-01-08 18:10:03.677	\N	LECCION
cmk5rikgv00708jcplurxci8u	Práctica Clase 1 tptpbw5pbcwszju9y6l0wh5y	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikgd006n8jcpjo5fpjp8	\N	\N	0	\N	\N	2026-01-08 18:10:03.679	2026-01-08 18:10:03.679	\N	TAREA
cmk5rikgw00728jcpuv25x6hw	Teoría Clase 2 tptpbw5pbcwszju9y6l0wh5y	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikgd006n8jcpjo5fpjp8	\N	\N	0	\N	\N	2026-01-08 18:10:03.681	2026-01-08 18:10:03.681	\N	LECCION
cmk5rikgy00748jcpmuhahob7	Práctica Clase 2 tptpbw5pbcwszju9y6l0wh5y	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikgd006n8jcpjo5fpjp8	\N	\N	0	\N	\N	2026-01-08 18:10:03.682	2026-01-08 18:10:03.682	\N	TAREA
cmk5rikn6007k8jcp7yzhwpb2	Teoría Clase 1 stfmbrj24j1cpns14fx2xwjs	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikmz007e8jcp99fczvcj	\N	\N	0	\N	\N	2026-01-08 18:10:03.906	2026-01-08 18:10:03.906	\N	LECCION
cmk5rikn7007m8jcpmhfjtl86	Práctica Clase 1 stfmbrj24j1cpns14fx2xwjs	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikmz007e8jcp99fczvcj	\N	\N	0	\N	\N	2026-01-08 18:10:03.908	2026-01-08 18:10:03.908	\N	TAREA
cmk5rikn9007o8jcph84vu185	Teoría Clase 2 stfmbrj24j1cpns14fx2xwjs	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikmz007e8jcp99fczvcj	\N	\N	0	\N	\N	2026-01-08 18:10:03.909	2026-01-08 18:10:03.909	\N	LECCION
cmk5rikna007q8jcps0z02dgb	Práctica Clase 2 stfmbrj24j1cpns14fx2xwjs	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikmz007e8jcp99fczvcj	\N	\N	0	\N	\N	2026-01-08 18:10:03.911	2026-01-08 18:10:03.911	\N	TAREA
cmk5riko100838jcp3gmmakz0	Teoría Clase 1 b1ennjtwt25m0qavunvtxejz	QUANTUM	MATEMATICA	PUBLICADO	cmk5riknt007x8jcpvg5d3vwq	\N	\N	0	\N	\N	2026-01-08 18:10:03.938	2026-01-08 18:10:03.938	\N	LECCION
cmk5riko300858jcpj9tinqfr	Práctica Clase 1 b1ennjtwt25m0qavunvtxejz	QUANTUM	MATEMATICA	PUBLICADO	cmk5riknt007x8jcpvg5d3vwq	\N	\N	0	\N	\N	2026-01-08 18:10:03.939	2026-01-08 18:10:03.939	\N	TAREA
cmk5riko500878jcp8402soix	Teoría Clase 2 b1ennjtwt25m0qavunvtxejz	QUANTUM	MATEMATICA	PUBLICADO	cmk5riknt007x8jcpvg5d3vwq	\N	\N	0	\N	\N	2026-01-08 18:10:03.941	2026-01-08 18:10:03.941	\N	LECCION
cmk5riko600898jcpyisobo6h	Práctica Clase 2 b1ennjtwt25m0qavunvtxejz	QUANTUM	MATEMATICA	PUBLICADO	cmk5riknt007x8jcpvg5d3vwq	\N	\N	0	\N	\N	2026-01-08 18:10:03.943	2026-01-08 18:10:03.943	\N	TAREA
cmk5rikoc008h8jcpdyyx7yj5	Tarea plsm1j5mmqhuzl673qz8eurh	QUANTUM	MATEMATICA	PUBLICADO	cmk5riknt007x8jcpvg5d3vwq	\N	\N	0	\N	\N	2026-01-08 18:10:03.949	2026-01-08 18:10:03.949	\N	TAREA
cmk5rikox008q8jcpvbh15sag	Teoría Clase 1 a8g0av66jclaf1pv8omo5twj	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikor008k8jcp9ouwuegn	\N	\N	0	\N	\N	2026-01-08 18:10:03.969	2026-01-08 18:10:03.969	\N	LECCION
cmk5rikoz008s8jcp4g9qxlfu	Práctica Clase 1 a8g0av66jclaf1pv8omo5twj	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikor008k8jcp9ouwuegn	\N	\N	0	\N	\N	2026-01-08 18:10:03.971	2026-01-08 18:10:03.971	\N	TAREA
cmk5rikp1008u8jcphy9m9dei	Teoría Clase 2 a8g0av66jclaf1pv8omo5twj	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikor008k8jcp9ouwuegn	\N	\N	0	\N	\N	2026-01-08 18:10:03.973	2026-01-08 18:10:03.973	\N	LECCION
cmk5rikp3008w8jcpi0cslv2t	Práctica Clase 2 a8g0av66jclaf1pv8omo5twj	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikor008k8jcp9ouwuegn	\N	\N	0	\N	\N	2026-01-08 18:10:03.975	2026-01-08 18:10:03.975	\N	TAREA
cmk5rikp900948jcpthya0pf8	Tarea vcv51t63hafa3j60br27ctso	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikor008k8jcp9ouwuegn	\N	\N	0	\N	\N	2026-01-08 18:10:03.981	2026-01-08 18:10:03.981	\N	TAREA
cmk5rikpw009f8jcpks94ucpc	Teoría Clase 1 wxn2p5xuksugay6l7skte1ov	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikpp00998jcpnfo0wrqj	\N	\N	0	\N	\N	2026-01-08 18:10:04.004	2026-01-08 18:10:04.004	\N	LECCION
cmk5rikpx009h8jcpcxwx9asc	Práctica Clase 1 wxn2p5xuksugay6l7skte1ov	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikpp00998jcpnfo0wrqj	\N	\N	0	\N	\N	2026-01-08 18:10:04.006	2026-01-08 18:10:04.006	\N	TAREA
cmk5rikpz009j8jcp9qyjqdkq	Teoría Clase 2 wxn2p5xuksugay6l7skte1ov	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikpp00998jcpnfo0wrqj	\N	\N	0	\N	\N	2026-01-08 18:10:04.007	2026-01-08 18:10:04.007	\N	LECCION
cmk5rikq1009l8jcpczl0ft18	Práctica Clase 2 wxn2p5xuksugay6l7skte1ov	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikpp00998jcpnfo0wrqj	\N	\N	0	\N	\N	2026-01-08 18:10:04.009	2026-01-08 18:10:04.009	\N	TAREA
cmk5rikq7009t8jcpsdb2h3uc	Tarea a81u4hyv2rwbh3fyk212bcun	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikpp00998jcpnfo0wrqj	\N	\N	0	\N	\N	2026-01-08 18:10:04.016	2026-01-08 18:10:04.016	\N	TAREA
cmk5rikqt00a48jcpk4dsourr	Teoría Clase 1 veimcwgodtin2hbts5geb44i	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikqn009y8jcpfowgcx9u	\N	\N	0	\N	\N	2026-01-08 18:10:04.038	2026-01-08 18:10:04.038	\N	LECCION
cmk5rikqv00a68jcpy8mtvugl	Práctica Clase 1 veimcwgodtin2hbts5geb44i	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikqn009y8jcpfowgcx9u	\N	\N	0	\N	\N	2026-01-08 18:10:04.04	2026-01-08 18:10:04.04	\N	TAREA
cmk5rikqx00a88jcpucwpzzrp	Teoría Clase 2 veimcwgodtin2hbts5geb44i	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikqn009y8jcpfowgcx9u	\N	\N	0	\N	\N	2026-01-08 18:10:04.041	2026-01-08 18:10:04.041	\N	LECCION
cmk5rikqz00aa8jcpn53dol9a	Práctica Clase 2 veimcwgodtin2hbts5geb44i	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikqn009y8jcpfowgcx9u	\N	\N	0	\N	\N	2026-01-08 18:10:04.043	2026-01-08 18:10:04.043	\N	TAREA
cmk5rikr400ai8jcpliy42iw9	Tarea ro69zaywlnyq59xixnmi7uuq	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikqn009y8jcpfowgcx9u	\N	\N	0	\N	\N	2026-01-08 18:10:04.049	2026-01-08 18:10:04.049	\N	TAREA
cmk5rikrt00at8jcpxcpg02k5	Teoría Clase 1 gm9uqiq5mjhs2wrn0k6r61ck	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikrm00an8jcpvd21bv80	\N	\N	0	\N	\N	2026-01-08 18:10:04.074	2026-01-08 18:10:04.074	\N	LECCION
cmk5rikrv00av8jcp9z31ehgo	Práctica Clase 1 gm9uqiq5mjhs2wrn0k6r61ck	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikrm00an8jcpvd21bv80	\N	\N	0	\N	\N	2026-01-08 18:10:04.075	2026-01-08 18:10:04.075	\N	TAREA
cmk5rikrw00ax8jcpas2y2a30	Teoría Clase 2 gm9uqiq5mjhs2wrn0k6r61ck	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikrm00an8jcpvd21bv80	\N	\N	0	\N	\N	2026-01-08 18:10:04.077	2026-01-08 18:10:04.077	\N	LECCION
cmk5rikry00az8jcp1fn5kows	Práctica Clase 2 gm9uqiq5mjhs2wrn0k6r61ck	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikrm00an8jcpvd21bv80	\N	\N	0	\N	\N	2026-01-08 18:10:04.078	2026-01-08 18:10:04.078	\N	TAREA
cmk5riksj00bc8jcpth5f57tl	Teoría Clase 1 twiy7nwkxyzmagi4yw0iqh7j	QUANTUM	MATEMATICA	PUBLICADO	cmk5riksc00b68jcp9pdpe3yb	\N	\N	0	\N	\N	2026-01-08 18:10:04.099	2026-01-08 18:10:04.099	\N	LECCION
cmk5riksk00be8jcpifoau9e4	Práctica Clase 1 twiy7nwkxyzmagi4yw0iqh7j	QUANTUM	MATEMATICA	PUBLICADO	cmk5riksc00b68jcp9pdpe3yb	\N	\N	0	\N	\N	2026-01-08 18:10:04.101	2026-01-08 18:10:04.101	\N	TAREA
cmk5riksn00bg8jcprz8do7hp	Teoría Clase 2 twiy7nwkxyzmagi4yw0iqh7j	QUANTUM	MATEMATICA	PUBLICADO	cmk5riksc00b68jcp9pdpe3yb	\N	\N	0	\N	\N	2026-01-08 18:10:04.103	2026-01-08 18:10:04.103	\N	LECCION
cmk5riksp00bi8jcpho5xeoxw	Práctica Clase 2 twiy7nwkxyzmagi4yw0iqh7j	QUANTUM	MATEMATICA	PUBLICADO	cmk5riksc00b68jcp9pdpe3yb	\N	\N	0	\N	\N	2026-01-08 18:10:04.105	2026-01-08 18:10:04.105	\N	TAREA
cmk5riksv00bq8jcpf5u7q7gc	Tarea wrfd1t6eum1e1ff6laapo029	QUANTUM	MATEMATICA	PUBLICADO	cmk5riksc00b68jcp9pdpe3yb	\N	\N	0	\N	\N	2026-01-08 18:10:04.112	2026-01-08 18:10:04.112	\N	TAREA
cmk5riktp00c18jcp2gewxdy6	Teoría Clase 1 brmu4wbx3guy6ny5bbmaz0ce	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikth00bv8jcpeivr32u6	\N	\N	0	\N	\N	2026-01-08 18:10:04.141	2026-01-08 18:10:04.141	\N	LECCION
cmk5riktr00c38jcpz7ta56v8	Práctica Clase 1 brmu4wbx3guy6ny5bbmaz0ce	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikth00bv8jcpeivr32u6	\N	\N	0	\N	\N	2026-01-08 18:10:04.143	2026-01-08 18:10:04.143	\N	TAREA
cmk5riktt00c58jcphgrvvdij	Teoría Clase 2 brmu4wbx3guy6ny5bbmaz0ce	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikth00bv8jcpeivr32u6	\N	\N	0	\N	\N	2026-01-08 18:10:04.145	2026-01-08 18:10:04.145	\N	LECCION
cmk5riktv00c78jcplm4ovra3	Práctica Clase 2 brmu4wbx3guy6ny5bbmaz0ce	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikth00bv8jcpeivr32u6	\N	\N	0	\N	\N	2026-01-08 18:10:04.147	2026-01-08 18:10:04.147	\N	TAREA
cmk5riku100cf8jcp6cps97go	Tarea hwf7te0ytp84h93dqj1x33u5	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikth00bv8jcpeivr32u6	\N	\N	0	\N	\N	2026-01-08 18:10:04.154	2026-01-08 18:10:04.154	\N	TAREA
cmk5rikus00cq8jcpwtyzyey2	Teoría Clase 1 n02ltbgcy3j62fdm65zc8nvz	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikuk00ck8jcpcagjr1la	\N	\N	0	\N	\N	2026-01-08 18:10:04.18	2026-01-08 18:10:04.18	\N	LECCION
cmk5rikut00cs8jcprn5cnxrc	Práctica Clase 1 n02ltbgcy3j62fdm65zc8nvz	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikuk00ck8jcpcagjr1la	\N	\N	0	\N	\N	2026-01-08 18:10:04.182	2026-01-08 18:10:04.182	\N	TAREA
cmk5rikuv00cu8jcp8dgh00dl	Teoría Clase 2 n02ltbgcy3j62fdm65zc8nvz	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikuk00ck8jcpcagjr1la	\N	\N	0	\N	\N	2026-01-08 18:10:04.184	2026-01-08 18:10:04.184	\N	LECCION
cmk5rikuy00cw8jcplcw1qbrm	Práctica Clase 2 n02ltbgcy3j62fdm65zc8nvz	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikuk00ck8jcpcagjr1la	\N	\N	0	\N	\N	2026-01-08 18:10:04.187	2026-01-08 18:10:04.187	\N	TAREA
cmk5rikvz00de8jcpdarae0ec	Teoría Clase 1 buu2n5qwpcrjqdqdjajzeent	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikvj00d38jcpb8b9lk3c	\N	\N	0	\N	\N	2026-01-08 18:10:04.223	2026-01-08 18:10:04.223	\N	LECCION
cmk5rikw100dg8jcpvb7ha336	Práctica Clase 1 buu2n5qwpcrjqdqdjajzeent	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikvj00d38jcpb8b9lk3c	\N	\N	0	\N	\N	2026-01-08 18:10:04.225	2026-01-08 18:10:04.225	\N	TAREA
cmk5rikw400di8jcpo8o8byh4	Teoría Clase 2 buu2n5qwpcrjqdqdjajzeent	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikvj00d38jcpb8b9lk3c	\N	\N	0	\N	\N	2026-01-08 18:10:04.228	2026-01-08 18:10:04.228	\N	LECCION
cmk5rikw800dk8jcpoux7qnlw	Práctica Clase 2 buu2n5qwpcrjqdqdjajzeent	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikvj00d38jcpb8b9lk3c	\N	\N	0	\N	\N	2026-01-08 18:10:04.232	2026-01-08 18:10:04.232	\N	TAREA
cmk5rikwg00ds8jcpfi4uwx64	Tarea zt6l7lonpwarshtlah45tax2	QUANTUM	MATEMATICA	PUBLICADO	cmk5rikvj00d38jcpb8b9lk3c	\N	\N	0	\N	\N	2026-01-08 18:10:04.241	2026-01-08 18:10:04.241	\N	TAREA
\.


--
-- Data for Name: docentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.docentes (id, email, password_hash, nombre, apellido, titulo, bio, "createdAt", "updatedAt", disponibilidad_horaria, especialidades, estado, experiencia_anos, nivel_educativo, roles, telefono, fecha_ultimo_cambio, must_change_password) FROM stdin;
cmk5rikgf006o8jcp3l8brs8h	docente-gr3zcqyhcslxuecw9aqeifmv@test.com	hashed_password	Docente gr3zcqyhcslxuecw9aqeifmv	Test	\N	\N	2026-01-08 18:10:03.663	2026-01-08 18:10:03.663	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikmm007d8jcporg409ql	docente-hkqp3w605tlqv6fvlcszdduj@test.com	hashed_password	Docente hkqp3w605tlqv6fvlcszdduj	Test	\N	\N	2026-01-08 18:10:03.887	2026-01-08 18:10:03.887	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikn1007f8jcp4yd23vqz	docente-warjo36zh1r75abuneszmrre@test.com	hashed_password	Docente warjo36zh1r75abuneszmrre	Test	\N	\N	2026-01-08 18:10:03.901	2026-01-08 18:10:03.901	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5riknv007y8jcpjn47swzd	docente-hs1w5caq97fzngjylz5j16z5@test.com	hashed_password	Docente hs1w5caq97fzngjylz5j16z5	Test	\N	\N	2026-01-08 18:10:03.932	2026-01-08 18:10:03.932	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikos008l8jcpxwujwlk7	docente-q04zvat2dg4ttqitv7aobj5m@test.com	hashed_password	Docente q04zvat2dg4ttqitv7aobj5m	Test	\N	\N	2026-01-08 18:10:03.965	2026-01-08 18:10:03.965	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikpq009a8jcp99u948bp	docente-nask729nq3wbtvpente7ulpc@test.com	hashed_password	Docente nask729nq3wbtvpente7ulpc	Test	\N	\N	2026-01-08 18:10:03.999	2026-01-08 18:10:03.999	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikqo009z8jcp4hiaphzc	docente-z9o2urmrdthnvpemlpa1jaxm@test.com	hashed_password	Docente z9o2urmrdthnvpemlpa1jaxm	Test	\N	\N	2026-01-08 18:10:04.033	2026-01-08 18:10:04.033	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikro00ao8jcpco8bg3y4	docente-fwixmikh9iftpqye33a6wj4x@test.com	hashed_password	Docente fwixmikh9iftpqye33a6wj4x	Test	\N	\N	2026-01-08 18:10:04.068	2026-01-08 18:10:04.068	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikse00b78jcp28wm6ytu	docente-s44c4fjfew4otc8zurbm4nny@test.com	hashed_password	Docente s44c4fjfew4otc8zurbm4nny	Test	\N	\N	2026-01-08 18:10:04.094	2026-01-08 18:10:04.094	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5riktj00bw8jcpmowxyziz	docente-j4injstvzuqhhs3z6clqgn1q@test.com	hashed_password	Docente j4injstvzuqhhs3z6clqgn1q	Test	\N	\N	2026-01-08 18:10:04.135	2026-01-08 18:10:04.135	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikun00cl8jcp32yowfzh	docente-kdx97bz3jyqjjo8287d78u62@test.com	hashed_password	Docente kdx97bz3jyqjjo8287d78u62	Test	\N	\N	2026-01-08 18:10:04.175	2026-01-08 18:10:04.175	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikvl00d48jcpz1w8v8cm	docente-n211i0pfiep1v62ytc4q2d8q@test.com	hashed_password	Docente n211i0pfiep1v62ytc4q2d8q	Test	\N	\N	2026-01-08 18:10:04.21	2026-01-08 18:10:04.21	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
cmk5rikx300dz8jcpr54wdirk	docente-xso04jm77z4j32evbiem9yy5@test.com	hashed_password	Docente xso04jm77z4j32evbiem9yy5	Test	\N	\N	2026-01-08 18:10:04.263	2026-01-08 18:10:04.263	\N	\N	activo	\N	\N	["docente"]	\N	\N	t
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
\.


--
-- Data for Name: eventos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eventos (id, titulo, descripcion, tipo, fecha_inicio, fecha_fin, es_todo_el_dia, docente_id, clase_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: grupos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grupos (id, codigo, nombre, descripcion, edad_minima, edad_maxima, sector_id, link_meet, activo, "createdAt", "updatedAt") FROM stdin;
cmk5rikgh006p8jcpjz3x6eh8	GP-h88eop48wbbbvu0l0jb7bgv3	Grupo Padre h88eop48wbbbvu0l0jb7bgv3	\N	\N	\N	\N	\N	t	2026-01-08 18:10:03.666	2026-01-08 18:10:03.666
cmk5rikn2007g8jcpszbij119	GP-mxjflb6g2z57o2vc3il1uati	Grupo Padre mxjflb6g2z57o2vc3il1uati	\N	\N	\N	\N	\N	t	2026-01-08 18:10:03.903	2026-01-08 18:10:03.903
cmk5riknx007z8jcpmsijgiq2	GP-zwar9gxxhk8hu7bbr7wyxcfz	Grupo Padre zwar9gxxhk8hu7bbr7wyxcfz	\N	\N	\N	\N	\N	t	2026-01-08 18:10:03.933	2026-01-08 18:10:03.933
cmk5rikou008m8jcp7jkap4fr	GP-a0l5it1hhza3s0nckaxvdbua	Grupo Padre a0l5it1hhza3s0nckaxvdbua	\N	\N	\N	\N	\N	t	2026-01-08 18:10:03.966	2026-01-08 18:10:03.966
cmk5rikps009b8jcpqjh4ltjj	GP-pyff8z0gbw8nehhf2amku2bx	Grupo Padre pyff8z0gbw8nehhf2amku2bx	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.001	2026-01-08 18:10:04.001
cmk5rikqq00a08jcpbrrbgyzf	GP-o00ibz75meldj69wf5jhppnm	Grupo Padre o00ibz75meldj69wf5jhppnm	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.034	2026-01-08 18:10:04.034
cmk5rikrq00ap8jcpnta2ukh2	GP-rud1wt91n1tistbtu4wym4q2	Grupo Padre rud1wt91n1tistbtu4wym4q2	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.07	2026-01-08 18:10:04.07
cmk5riksg00b88jcp7xlgvwyg	GP-panwxzriu8z3li6j1z4o8qiz	Grupo Padre panwxzriu8z3li6j1z4o8qiz	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.096	2026-01-08 18:10:04.096
cmk5riktl00bx8jcpq0lxs3i3	GP-qnwyrbsys09dy4e1g63h69jf	Grupo Padre qnwyrbsys09dy4e1g63h69jf	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.137	2026-01-08 18:10:04.137
cmk5rikup00cm8jcphqa19x4s	GP-bieqs6j0zfxn6xytld8mm5v6	Grupo Padre bieqs6j0zfxn6xytld8mm5v6	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.177	2026-01-08 18:10:04.177
cmk5rikvo00d58jcpck2t2f7g	GP-vnfes19kmo7302rzbc0n8way	Grupo Padre vnfes19kmo7302rzbc0n8way	\N	\N	\N	\N	\N	t	2026-01-08 18:10:04.212	2026-01-08 18:10:04.212
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

COPY public.inscripciones_clase_grupo (id, clase_grupo_id, estudiante_id, tutor_id, fecha_inscripcion, fecha_baja, observaciones, "createdAt", "updatedAt") FROM stdin;
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
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_attempts (id, email, ip, success, created_at) FROM stdin;
4ed86799-73fa-4462-98da-2b2243a28b68	valid@example.com	::ffff:127.0.0.1	f	2026-01-03 10:14:12.952641-03
6af0e9ad-46f8-4ce4-b07b-1052d9794dd7	valid@example.com	::ffff:127.0.0.1	f	2026-01-03 10:17:33.286942-03
be3b3575-8c17-4549-a111-31f441380e41	figueroa.alexis93@gmail.com	::1	f	2026-01-06 21:50:56.950087-03
19082465-5798-4541-90e6-650f53323c37	dante.migani	::1	f	2025-12-29 23:08:54.766394-03
0335d403-ae8b-4802-9d85-4949994b3076	dante.migani	::1	f	2025-12-29 23:09:23.933327-03
1fa618c9-8161-441b-b120-02e141da38c1	dante.migani	::1	f	2025-12-29 23:11:13.489554-03
65cba43b-f46c-484f-a3cd-03148fa47671	dante.migani	::1	f	2025-12-29 23:11:50.749577-03
a825ac9d-1549-4cef-8fe5-ad95d8251676	dante.migani	::1	f	2025-12-29 23:12:46.046037-03
c87ffaa7-5b68-4dd9-bee4-9a5c10706d76	dante.migani	::1	f	2025-12-29 23:22:04.001775-03
d46b4d76-1a06-4bda-8b29-44e96cf2471e	dante.migani	::1	f	2025-12-29 23:24:57.196975-03
073d5be3-7a59-4e75-958e-412d6fc62de0	dante.migani	::1	f	2025-12-29 23:26:28.163452-03
58affe76-2e2d-407e-8a63-a52fe599a6d7	dante.migani	::1	f	2025-12-29 23:28:54.393861-03
e96e392c-d814-45ca-9086-cb29e15f81e9	dante.migani	::1	f	2025-12-29 23:30:02.59521-03
058eefd5-d74c-4834-81c7-7a19da14afb8	dante.migani	::1	f	2025-12-29 23:30:51.956437-03
86391b00-6dca-430e-9970-88fdfb1c62d2	dante.migani	::1	f	2025-12-29 23:31:17.844398-03
f1117c3b-02e3-419b-8015-cb8505bcf897	dante.migani	::1	f	2025-12-29 23:32:44.624513-03
187d87a5-b46f-41f5-a5dc-28443570701c	dante.migani	::1	f	2025-12-29 23:34:30.84447-03
9f180a34-b19e-4760-a5cd-d5ecd8d23fc6	estudiante1@test.com	::1	f	2025-12-29 23:37:56.632068-03
903c44b1-29fa-4414-ad91-b9bcc6d58150	lucas.garcia	::1	f	2025-12-29 23:40:42.929954-03
41d813d6-02a8-4415-bfb7-6a2acfd92cae	ayelen.yanez.8ubv	::1	f	2026-01-06 10:17:24.97415-03
e6464979-a0cc-4c61-9b9f-ef024b5f2f1f	ayelen.yanez.8ubv	::1	f	2026-01-06 10:17:27.053407-03
cd683e4a-c27c-45ff-9fd6-6a3ac5a2fe79	ayelen.yanez.8ubv	::1	f	2026-01-06 10:17:39.673004-03
3b59a98b-a7ea-459c-9f55-5f16889e1759	ayelen.yanez.8ubv	::1	f	2026-01-06 10:41:44.987157-03
aafb7926-1e17-4e96-bd00-422a17595ab7	ayelen.yanez.8ubv	::1	f	2026-01-06 10:41:49.687683-03
10acc4d3-3eed-4cc8-94aa-9423583bfa0a	juan.perez@docente.com	::1	f	2025-12-30 12:51:54.791215-03
74d66066-f1bf-444e-a81f-fcf758c077b1	demo	::1	f	2025-12-30 13:29:52.530186-03
f2d5d4ac-cdd3-44da-bbdd-9e182ab3939a	valid@example.com	::ffff:127.0.0.1	f	2026-01-07 14:12:36.936513-03
9e1e1601-b83a-493f-a02a-912fe8dc6aaa	valid@example.com	::ffff:127.0.0.1	f	2026-01-07 16:03:29.612076-03
d0603a03-eb3b-4d9e-822d-d732dc89869d	figueroa.alexis93@gmail.com	::1	f	2026-01-06 13:48:39.404106-03
a9d0b9f8-334a-43c5-bb3d-02103a05bbda	figueroa.alexis93@gmail.com	::1	f	2026-01-06 13:50:50.521499-03
8199767e-2715-4413-befb-cec4433c3247	figueroa.alexis93@gmail.com	::1	f	2026-01-06 13:51:58.581618-03
d5ee260b-07c6-4fc8-8467-e5109628ef08	valid@example.com	::ffff:127.0.0.1	f	2026-01-07 16:08:22.678464-03
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
cmk5dt74500038jvwz25gl2os	cmk5dt73p00028jvw7khokhzt	\N	Teoría	t	0	\N	2026-01-08 11:46:24.965	2026-01-08 11:46:24.965
cmk5dt74500048jvwqbqejkqh	cmk5dt73p00028jvw7khokhzt	\N	Práctica	t	1	\N	2026-01-08 11:46:24.965	2026-01-08 11:46:24.965
cmk5dt74500058jvwid2cfpp7	cmk5dt73p00028jvw7khokhzt	\N	Evaluación	t	2	\N	2026-01-08 11:46:24.965	2026-01-08 11:46:24.965
cmk5dt74i00088jvwmbwmaqef	cmk5dt74800078jvwxi8yevav	\N	Teoría	t	0	\N	2026-01-08 11:46:24.979	2026-01-08 11:46:24.979
cmk5dt74i00098jvwa2odhn9v	cmk5dt74800078jvwxi8yevav	\N	Práctica	t	1	\N	2026-01-08 11:46:24.979	2026-01-08 11:46:24.979
cmk5dt74i000a8jvwmt6yntpw	cmk5dt74800078jvwxi8yevav	\N	Evaluación	t	2	\N	2026-01-08 11:46:24.979	2026-01-08 11:46:24.979
cmk5dt74w000d8jvwy2rvq86w	cmk5dt74s000c8jvwmi9gl1a6	\N	Teoría	t	0	\N	2026-01-08 11:46:24.993	2026-01-08 11:46:24.993
cmk5dt74w000e8jvwtq08b06e	cmk5dt74s000c8jvwmi9gl1a6	\N	Práctica	t	1	\N	2026-01-08 11:46:24.993	2026-01-08 11:46:24.993
cmk5dt74w000f8jvwr5w9a0hd	cmk5dt74s000c8jvwmi9gl1a6	\N	Evaluación	t	2	\N	2026-01-08 11:46:24.993	2026-01-08 11:46:24.993
cmk5dt753000i8jvwdlaoah4q	cmk5dt750000h8jvwotssxztp	\N	Teoría	t	0	\N	2026-01-08 11:46:24.999	2026-01-08 11:46:24.999
cmk5dt753000j8jvw0m82q7jq	cmk5dt750000h8jvwotssxztp	\N	Práctica	t	1	\N	2026-01-08 11:46:24.999	2026-01-08 11:46:24.999
cmk5dt753000k8jvwgvsylqqh	cmk5dt750000h8jvwotssxztp	\N	Evaluación	t	2	\N	2026-01-08 11:46:24.999	2026-01-08 11:46:24.999
cmk5dt75j000n8jvw8qxc7r2g	cmk5dt756000m8jvwv8zkpk8u	\N	Teoría	t	0	\N	2026-01-08 11:46:25.015	2026-01-08 11:46:25.015
cmk5dt75j000o8jvwvsqpnyq2	cmk5dt756000m8jvwv8zkpk8u	\N	Práctica	t	1	\N	2026-01-08 11:46:25.015	2026-01-08 11:46:25.015
cmk5dt75j000p8jvw8is1ijt0	cmk5dt756000m8jvwv8zkpk8u	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.015	2026-01-08 11:46:25.015
cmk5dt75s000s8jvwhajlyha2	cmk5dt75m000r8jvwyzruntdr	\N	Teoría	t	0	\N	2026-01-08 11:46:25.024	2026-01-08 11:46:25.024
cmk5dt75s000t8jvw6ry4h92k	cmk5dt75m000r8jvwyzruntdr	\N	Práctica	t	1	\N	2026-01-08 11:46:25.024	2026-01-08 11:46:25.024
cmk5dt75s000u8jvwc4wvnnsi	cmk5dt75m000r8jvwyzruntdr	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.024	2026-01-08 11:46:25.024
cmk5dt762000x8jvwcylgwgwb	cmk5dt760000w8jvwaxb9mj9h	\N	Teoría	t	0	\N	2026-01-08 11:46:25.035	2026-01-08 11:46:25.035
cmk5dt762000y8jvwntnaw7h0	cmk5dt760000w8jvwaxb9mj9h	\N	Práctica	t	1	\N	2026-01-08 11:46:25.035	2026-01-08 11:46:25.035
cmk5dt762000z8jvwuauzd4gv	cmk5dt760000w8jvwaxb9mj9h	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.035	2026-01-08 11:46:25.035
cmk5dt76700128jvw7hwiazzj	cmk5dt76600118jvwj954a06w	\N	Teoría	t	0	\N	2026-01-08 11:46:25.04	2026-01-08 11:46:25.04
cmk5dt76700138jvwzysc2jig	cmk5dt76600118jvwj954a06w	\N	Práctica	t	1	\N	2026-01-08 11:46:25.04	2026-01-08 11:46:25.04
cmk5dt76700148jvwbibfd10a	cmk5dt76600118jvwj954a06w	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.04	2026-01-08 11:46:25.04
cmk5dt76900178jvwpwadu75r	cmk5dt76800168jvwbcppx429	\N	Teoría	t	0	\N	2026-01-08 11:46:25.042	2026-01-08 11:46:25.042
cmk5dt76900188jvw49mwqxl9	cmk5dt76800168jvwbcppx429	\N	Práctica	t	1	\N	2026-01-08 11:46:25.042	2026-01-08 11:46:25.042
cmk5dt76900198jvwj5roxcm3	cmk5dt76800168jvwbcppx429	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.042	2026-01-08 11:46:25.042
cmk5dt76b001c8jvwv4jctwmx	cmk5dt76a001b8jvwl7fj3dh0	\N	Teoría	t	0	\N	2026-01-08 11:46:25.044	2026-01-08 11:46:25.044
cmk5dt76b001d8jvwf3eosrn1	cmk5dt76a001b8jvwl7fj3dh0	\N	Práctica	t	1	\N	2026-01-08 11:46:25.044	2026-01-08 11:46:25.044
cmk5dt76b001e8jvwzbv0vz8k	cmk5dt76a001b8jvwl7fj3dh0	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.044	2026-01-08 11:46:25.044
cmk5dt76d001h8jvw0y3allt1	cmk5dt76c001g8jvwurshy8i9	\N	Teoría	t	0	\N	2026-01-08 11:46:25.045	2026-01-08 11:46:25.045
cmk5dt76d001i8jvwhzzbtbei	cmk5dt76c001g8jvwurshy8i9	\N	Práctica	t	1	\N	2026-01-08 11:46:25.045	2026-01-08 11:46:25.045
cmk5dt76d001j8jvwatvyq5cl	cmk5dt76c001g8jvwurshy8i9	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.045	2026-01-08 11:46:25.045
cmk5dt76f001m8jvwdzkmdws2	cmk5dt76e001l8jvwmqlibosg	\N	Teoría	t	0	\N	2026-01-08 11:46:25.047	2026-01-08 11:46:25.047
cmk5dt76f001n8jvw0wz6t21v	cmk5dt76e001l8jvwmqlibosg	\N	Práctica	t	1	\N	2026-01-08 11:46:25.047	2026-01-08 11:46:25.047
cmk5dt76f001o8jvwpb69dy0g	cmk5dt76e001l8jvwmqlibosg	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.047	2026-01-08 11:46:25.047
cmk5dt76h001r8jvwsxnbicoe	cmk5dt76g001q8jvw9myjvwki	\N	Teoría	t	0	\N	2026-01-08 11:46:25.05	2026-01-08 11:46:25.05
cmk5dt76h001s8jvwwltgtvul	cmk5dt76g001q8jvw9myjvwki	\N	Práctica	t	1	\N	2026-01-08 11:46:25.05	2026-01-08 11:46:25.05
cmk5dt76h001t8jvw9p24aah5	cmk5dt76g001q8jvw9myjvwki	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.05	2026-01-08 11:46:25.05
cmk5dt76k001w8jvw322gmhm6	cmk5dt76j001v8jvwx3w7y1qz	\N	Teoría	t	0	\N	2026-01-08 11:46:25.052	2026-01-08 11:46:25.052
cmk5dt76k001x8jvwb6a8e5wc	cmk5dt76j001v8jvwx3w7y1qz	\N	Práctica	t	1	\N	2026-01-08 11:46:25.052	2026-01-08 11:46:25.052
cmk5dt76k001y8jvwooo15dpv	cmk5dt76j001v8jvwx3w7y1qz	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.052	2026-01-08 11:46:25.052
cmk5dt76m00218jvwzq89u79y	cmk5dt76l00208jvw75fvsxhi	\N	Teoría	t	0	\N	2026-01-08 11:46:25.054	2026-01-08 11:46:25.054
cmk5dt76m00228jvwixfmacz1	cmk5dt76l00208jvw75fvsxhi	\N	Práctica	t	1	\N	2026-01-08 11:46:25.054	2026-01-08 11:46:25.054
cmk5dt76m00238jvwkq4854xs	cmk5dt76l00208jvw75fvsxhi	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.054	2026-01-08 11:46:25.054
cmk5dt76o00268jvwedahsa50	cmk5dt76n00258jvwc86nq8xn	\N	Teoría	t	0	\N	2026-01-08 11:46:25.056	2026-01-08 11:46:25.056
cmk5dt76o00278jvwvjsnom3v	cmk5dt76n00258jvwc86nq8xn	\N	Práctica	t	1	\N	2026-01-08 11:46:25.056	2026-01-08 11:46:25.056
cmk5dt76o00288jvwqlwm1bvq	cmk5dt76n00258jvwc86nq8xn	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.056	2026-01-08 11:46:25.056
cmk5dt76p002b8jvwhznuf5cj	cmk5dt76o002a8jvwu2snot6q	\N	Teoría	t	0	\N	2026-01-08 11:46:25.058	2026-01-08 11:46:25.058
cmk5dt76p002c8jvw8grggkee	cmk5dt76o002a8jvwu2snot6q	\N	Práctica	t	1	\N	2026-01-08 11:46:25.058	2026-01-08 11:46:25.058
cmk5dt76p002d8jvwsdv70w4u	cmk5dt76o002a8jvwu2snot6q	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.058	2026-01-08 11:46:25.058
cmk5dt76r002g8jvwu4bqcqti	cmk5dt76q002f8jvwiznp3d2o	\N	Teoría	t	0	\N	2026-01-08 11:46:25.059	2026-01-08 11:46:25.059
cmk5dt76r002h8jvwag3irybu	cmk5dt76q002f8jvwiznp3d2o	\N	Práctica	t	1	\N	2026-01-08 11:46:25.059	2026-01-08 11:46:25.059
cmk5dt76r002i8jvwfh1rr5t4	cmk5dt76q002f8jvwiznp3d2o	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.059	2026-01-08 11:46:25.059
cmk5dt76s002l8jvw3pey8a2c	cmk5dt76s002k8jvw7n7gygi1	\N	Teoría	t	0	\N	2026-01-08 11:46:25.061	2026-01-08 11:46:25.061
cmk5dt76t002m8jvwjb5ij7me	cmk5dt76s002k8jvw7n7gygi1	\N	Práctica	t	1	\N	2026-01-08 11:46:25.061	2026-01-08 11:46:25.061
cmk5dt76t002n8jvwr1br247o	cmk5dt76s002k8jvw7n7gygi1	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.061	2026-01-08 11:46:25.061
cmk5dt76u002q8jvwnwrssl6u	cmk5dt76t002p8jvws9a1e9f1	\N	Teoría	t	0	\N	2026-01-08 11:46:25.063	2026-01-08 11:46:25.063
cmk5dt76u002r8jvwygh1pj5e	cmk5dt76t002p8jvws9a1e9f1	\N	Práctica	t	1	\N	2026-01-08 11:46:25.063	2026-01-08 11:46:25.063
cmk5dt76u002s8jvwtbcnpe6j	cmk5dt76t002p8jvws9a1e9f1	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.063	2026-01-08 11:46:25.063
cmk5dt76w002v8jvwa8sx3srf	cmk5dt76v002u8jvwbjtviwiw	\N	Teoría	t	0	\N	2026-01-08 11:46:25.065	2026-01-08 11:46:25.065
cmk5dt76w002w8jvwrhehoiq3	cmk5dt76v002u8jvwbjtviwiw	\N	Práctica	t	1	\N	2026-01-08 11:46:25.065	2026-01-08 11:46:25.065
cmk5dt76w002x8jvw1uhqbz00	cmk5dt76v002u8jvwbjtviwiw	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.065	2026-01-08 11:46:25.065
cmk5dt76y00308jvw3902dha3	cmk5dt76x002z8jvwzjs4ty4b	\N	Teoría	t	0	\N	2026-01-08 11:46:25.067	2026-01-08 11:46:25.067
cmk5dt76y00318jvweiml2nx2	cmk5dt76x002z8jvwzjs4ty4b	\N	Práctica	t	1	\N	2026-01-08 11:46:25.067	2026-01-08 11:46:25.067
cmk5dt76y00328jvw919an2u4	cmk5dt76x002z8jvwzjs4ty4b	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.067	2026-01-08 11:46:25.067
cmk5dt77000358jvwgq59zpgl	cmk5dt77000348jvw28ggban7	\N	Teoría	t	0	\N	2026-01-08 11:46:25.069	2026-01-08 11:46:25.069
cmk5dt77100368jvw8i593jvc	cmk5dt77000348jvw28ggban7	\N	Práctica	t	1	\N	2026-01-08 11:46:25.069	2026-01-08 11:46:25.069
cmk5dt77100378jvwbwzn846o	cmk5dt77000348jvw28ggban7	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.069	2026-01-08 11:46:25.069
cmk5dt772003a8jvwpbz0a621	cmk5dt77100398jvwp4lj0bx5	\N	Teoría	t	0	\N	2026-01-08 11:46:25.071	2026-01-08 11:46:25.071
cmk5dt772003b8jvwrzc7oumw	cmk5dt77100398jvwp4lj0bx5	\N	Práctica	t	1	\N	2026-01-08 11:46:25.071	2026-01-08 11:46:25.071
cmk5dt772003c8jvwshf99085	cmk5dt77100398jvwp4lj0bx5	\N	Evaluación	t	2	\N	2026-01-08 11:46:25.071	2026-01-08 11:46:25.071
cmk5p4f6e00038j6m3p7zfcp0	cmk5p4f6b00028j6m2xphbj0j	\N	Teoría	t	0	\N	2026-01-08 17:03:04.407	2026-01-08 17:03:04.407
cmk5p4f6e00048j6mlmdh83b2	cmk5p4f6b00028j6m2xphbj0j	\N	Práctica	t	1	\N	2026-01-08 17:03:04.407	2026-01-08 17:03:04.407
cmk5p4f6e00058j6m3w47pedt	cmk5p4f6b00028j6m2xphbj0j	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.407	2026-01-08 17:03:04.407
cmk5p4f6i00088j6maumgbsg1	cmk5p4f6g00078j6mj3c0v5qm	\N	Teoría	t	0	\N	2026-01-08 17:03:04.41	2026-01-08 17:03:04.41
cmk5p4f6i00098j6mby8jwgki	cmk5p4f6g00078j6mj3c0v5qm	\N	Práctica	t	1	\N	2026-01-08 17:03:04.41	2026-01-08 17:03:04.41
cmk5p4f6i000a8j6mrntu5cbe	cmk5p4f6g00078j6mj3c0v5qm	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.41	2026-01-08 17:03:04.41
cmk5p4f6k000d8j6m6h8krel9	cmk5p4f6j000c8j6mkci890dr	\N	Teoría	t	0	\N	2026-01-08 17:03:04.412	2026-01-08 17:03:04.412
cmk5p4f6k000e8j6mdqjcmzj1	cmk5p4f6j000c8j6mkci890dr	\N	Práctica	t	1	\N	2026-01-08 17:03:04.412	2026-01-08 17:03:04.412
cmk5p4f6k000f8j6m2y97o5po	cmk5p4f6j000c8j6mkci890dr	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.412	2026-01-08 17:03:04.412
cmk5p4f6m000i8j6m4nt883r6	cmk5p4f6l000h8j6m3jh4mnxs	\N	Teoría	t	0	\N	2026-01-08 17:03:04.415	2026-01-08 17:03:04.415
cmk5p4f6m000j8j6mrt2v80j7	cmk5p4f6l000h8j6m3jh4mnxs	\N	Práctica	t	1	\N	2026-01-08 17:03:04.415	2026-01-08 17:03:04.415
cmk5p4f6m000k8j6muin719i6	cmk5p4f6l000h8j6m3jh4mnxs	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.415	2026-01-08 17:03:04.415
cmk5p4f6o000n8j6m730vszjd	cmk5p4f6n000m8j6mv37k2yxz	\N	Teoría	t	0	\N	2026-01-08 17:03:04.417	2026-01-08 17:03:04.417
cmk5p4f6o000o8j6mjrjayjwg	cmk5p4f6n000m8j6mv37k2yxz	\N	Práctica	t	1	\N	2026-01-08 17:03:04.417	2026-01-08 17:03:04.417
cmk5p4f6o000p8j6mh3rva22s	cmk5p4f6n000m8j6mv37k2yxz	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.417	2026-01-08 17:03:04.417
cmk5p4f6q000s8j6mdg1eqocj	cmk5p4f6p000r8j6m8oas91ho	\N	Teoría	t	0	\N	2026-01-08 17:03:04.419	2026-01-08 17:03:04.419
cmk5p4f6q000t8j6m8b4prhe9	cmk5p4f6p000r8j6m8oas91ho	\N	Práctica	t	1	\N	2026-01-08 17:03:04.419	2026-01-08 17:03:04.419
cmk5p4f6q000u8j6mms7bgoji	cmk5p4f6p000r8j6m8oas91ho	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.419	2026-01-08 17:03:04.419
cmk5p4fc300138j6m21gdcgqb	cmk5p4fc100128j6m9cxnx55p	\N	Teoría	t	0	\N	2026-01-08 17:03:04.612	2026-01-08 17:03:04.612
cmk5p4fc300148j6mgckn0m5j	cmk5p4fc100128j6m9cxnx55p	\N	Práctica	t	1	\N	2026-01-08 17:03:04.612	2026-01-08 17:03:04.612
cmk5p4fc300158j6ms6o4h81y	cmk5p4fc100128j6m9cxnx55p	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.612	2026-01-08 17:03:04.612
cmk5p4fc600188j6m4xl15zub	cmk5p4fc500178j6mlaz197oi	\N	Teoría	t	0	\N	2026-01-08 17:03:04.615	2026-01-08 17:03:04.615
cmk5p4fc600198j6myuxu21lf	cmk5p4fc500178j6mlaz197oi	\N	Práctica	t	1	\N	2026-01-08 17:03:04.615	2026-01-08 17:03:04.615
cmk5p4fc6001a8j6mlqnx97d9	cmk5p4fc500178j6mlaz197oi	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.615	2026-01-08 17:03:04.615
cmk5p4fc9001d8j6m1va2xsmt	cmk5p4fc8001c8j6m1sf9oxyw	\N	Teoría	t	0	\N	2026-01-08 17:03:04.618	2026-01-08 17:03:04.618
cmk5p4fc9001e8j6mtofixdji	cmk5p4fc8001c8j6m1sf9oxyw	\N	Práctica	t	1	\N	2026-01-08 17:03:04.618	2026-01-08 17:03:04.618
cmk5p4fc9001f8j6m8szn4kog	cmk5p4fc8001c8j6m1sf9oxyw	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.618	2026-01-08 17:03:04.618
cmk5p4fcc001i8j6mja7t1vy7	cmk5p4fcb001h8j6m3vengw7l	\N	Teoría	t	0	\N	2026-01-08 17:03:04.62	2026-01-08 17:03:04.62
cmk5p4fcc001j8j6m2404w653	cmk5p4fcb001h8j6m3vengw7l	\N	Práctica	t	1	\N	2026-01-08 17:03:04.62	2026-01-08 17:03:04.62
cmk5p4fcc001k8j6mzxqgkdkn	cmk5p4fcb001h8j6m3vengw7l	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.62	2026-01-08 17:03:04.62
cmk5p4fcs001s8j6mvxxywfim	cmk5p4fcr001r8j6mioohj7q1	\N	Teoría	t	0	\N	2026-01-08 17:03:04.637	2026-01-08 17:03:04.637
cmk5p4fcs001t8j6mq94jy1dz	cmk5p4fcr001r8j6mioohj7q1	\N	Práctica	t	1	\N	2026-01-08 17:03:04.637	2026-01-08 17:03:04.637
cmk5p4fcs001u8j6m887rkj9e	cmk5p4fcr001r8j6mioohj7q1	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.637	2026-01-08 17:03:04.637
cmk5p4fcu001x8j6m3lap9sxz	cmk5p4fct001w8j6mcxkpxv4o	\N	Teoría	t	0	\N	2026-01-08 17:03:04.639	2026-01-08 17:03:04.639
cmk5p4fcu001y8j6mjb70n0lu	cmk5p4fct001w8j6mcxkpxv4o	\N	Práctica	t	1	\N	2026-01-08 17:03:04.639	2026-01-08 17:03:04.639
cmk5p4fcu001z8j6m192iyp3z	cmk5p4fct001w8j6mcxkpxv4o	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.639	2026-01-08 17:03:04.639
cmk5p4fcw00228j6mt0ak2jds	cmk5p4fcv00218j6mmk41a72j	\N	Teoría	t	0	\N	2026-01-08 17:03:04.64	2026-01-08 17:03:04.64
cmk5p4fcw00238j6my1wj8kr2	cmk5p4fcv00218j6mmk41a72j	\N	Práctica	t	1	\N	2026-01-08 17:03:04.64	2026-01-08 17:03:04.64
cmk5p4fcw00248j6mgwfl0ejk	cmk5p4fcv00218j6mmk41a72j	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.64	2026-01-08 17:03:04.64
cmk5p4fcy00278j6mlom8igjz	cmk5p4fcx00268j6mticz7606	\N	Teoría	t	0	\N	2026-01-08 17:03:04.642	2026-01-08 17:03:04.642
cmk5p4fcy00288j6m0arqsrg3	cmk5p4fcx00268j6mticz7606	\N	Práctica	t	1	\N	2026-01-08 17:03:04.642	2026-01-08 17:03:04.642
cmk5p4fcy00298j6mz77nhb6b	cmk5p4fcx00268j6mticz7606	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.642	2026-01-08 17:03:04.642
cmk5p4fdd002h8j6m7b4xnqtd	cmk5p4fdc002g8j6m5brhftdb	\N	Teoría	t	0	\N	2026-01-08 17:03:04.657	2026-01-08 17:03:04.657
cmk5p4fdd002i8j6m8qieyuss	cmk5p4fdc002g8j6m5brhftdb	\N	Práctica	t	1	\N	2026-01-08 17:03:04.657	2026-01-08 17:03:04.657
cmk5p4fdd002j8j6m5i82fcfs	cmk5p4fdc002g8j6m5brhftdb	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.657	2026-01-08 17:03:04.657
cmk5p4fdf002m8j6m84m0w4g1	cmk5p4fde002l8j6mkvpaltvv	\N	Teoría	t	0	\N	2026-01-08 17:03:04.66	2026-01-08 17:03:04.66
cmk5p4fdf002n8j6mhxftui18	cmk5p4fde002l8j6mkvpaltvv	\N	Práctica	t	1	\N	2026-01-08 17:03:04.66	2026-01-08 17:03:04.66
cmk5p4fdf002o8j6m9q2ir5li	cmk5p4fde002l8j6mkvpaltvv	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.66	2026-01-08 17:03:04.66
cmk5p4fdi002r8j6m8rfirzwb	cmk5p4fdg002q8j6mqw5ize68	\N	Teoría	t	0	\N	2026-01-08 17:03:04.662	2026-01-08 17:03:04.662
cmk5p4fdi002s8j6meo94u04c	cmk5p4fdg002q8j6mqw5ize68	\N	Práctica	t	1	\N	2026-01-08 17:03:04.662	2026-01-08 17:03:04.662
cmk5p4fdi002t8j6mh8yo2lr4	cmk5p4fdg002q8j6mqw5ize68	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.662	2026-01-08 17:03:04.662
cmk5p4fdk002w8j6mq6u16ex9	cmk5p4fdj002v8j6mwvi08ogw	\N	Teoría	t	0	\N	2026-01-08 17:03:04.664	2026-01-08 17:03:04.664
cmk5p4fdk002x8j6mbq8ln2wl	cmk5p4fdj002v8j6mwvi08ogw	\N	Práctica	t	1	\N	2026-01-08 17:03:04.664	2026-01-08 17:03:04.664
cmk5p4fdk002y8j6mwhkqa097	cmk5p4fdj002v8j6mwvi08ogw	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.664	2026-01-08 17:03:04.664
cmk5p4fee00368j6mmbd50x9a	cmk5p4fec00358j6ml9in6r8y	\N	Teoría	t	0	\N	2026-01-08 17:03:04.694	2026-01-08 17:03:04.694
cmk5p4fee00378j6mvpl71kly	cmk5p4fec00358j6ml9in6r8y	\N	Práctica	t	1	\N	2026-01-08 17:03:04.694	2026-01-08 17:03:04.694
cmk5p4fee00388j6mrqo6jetr	cmk5p4fec00358j6ml9in6r8y	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.694	2026-01-08 17:03:04.694
cmk5p4feg003b8j6mae9dnqtf	cmk5p4fef003a8j6mxr8eizfk	\N	Teoría	t	0	\N	2026-01-08 17:03:04.696	2026-01-08 17:03:04.696
cmk5p4feg003c8j6m9g3cm57a	cmk5p4fef003a8j6mxr8eizfk	\N	Práctica	t	1	\N	2026-01-08 17:03:04.696	2026-01-08 17:03:04.696
cmk5p4feg003d8j6mvnaxe5m9	cmk5p4fef003a8j6mxr8eizfk	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.696	2026-01-08 17:03:04.696
cmk5p4fen003j8j6muo32fhys	cmk5p4fel003i8j6ms03yjgjd	\N	Teoría	t	0	\N	2026-01-08 17:03:04.703	2026-01-08 17:03:04.703
cmk5p4fen003k8j6m9vhle5kh	cmk5p4fel003i8j6ms03yjgjd	\N	Práctica	t	1	\N	2026-01-08 17:03:04.703	2026-01-08 17:03:04.703
cmk5p4fen003l8j6ml0pf0gk9	cmk5p4fel003i8j6ms03yjgjd	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.703	2026-01-08 17:03:04.703
cmk5p4feo003o8j6mcxea8lye	cmk5p4fen003n8j6mefe048ir	\N	Teoría	t	0	\N	2026-01-08 17:03:04.705	2026-01-08 17:03:04.705
cmk5p4feo003p8j6mgul1avot	cmk5p4fen003n8j6mefe048ir	\N	Práctica	t	1	\N	2026-01-08 17:03:04.705	2026-01-08 17:03:04.705
cmk5p4feo003q8j6molhgjl16	cmk5p4fen003n8j6mefe048ir	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.705	2026-01-08 17:03:04.705
cmk5p4ff9003x8j6mhx4c6trs	cmk5p4ff6003w8j6m0umd2y7k	\N	Teoría	t	0	\N	2026-01-08 17:03:04.725	2026-01-08 17:03:04.725
cmk5p4ff9003y8j6mvsmbyq9o	cmk5p4ff6003w8j6m0umd2y7k	\N	Práctica	t	1	\N	2026-01-08 17:03:04.725	2026-01-08 17:03:04.725
cmk5p4ff9003z8j6mcgw7frx0	cmk5p4ff6003w8j6m0umd2y7k	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.725	2026-01-08 17:03:04.725
cmk5p4ffb00428j6m4g3x1pg1	cmk5p4ffa00418j6mamm7hdno	\N	Teoría	t	0	\N	2026-01-08 17:03:04.728	2026-01-08 17:03:04.728
cmk5p4ffb00438j6mjkrpvd01	cmk5p4ffa00418j6mamm7hdno	\N	Práctica	t	1	\N	2026-01-08 17:03:04.728	2026-01-08 17:03:04.728
cmk5p4ffb00448j6mpuz6wz4f	cmk5p4ffa00418j6mamm7hdno	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.728	2026-01-08 17:03:04.728
cmk5p4ffv004b8j6mt0u1x40d	cmk5p4ffu004a8j6m6boowwun	\N	Teoría	t	0	\N	2026-01-08 17:03:04.747	2026-01-08 17:03:04.747
cmk5p4ffv004c8j6mjqwa352h	cmk5p4ffu004a8j6m6boowwun	\N	Práctica	t	1	\N	2026-01-08 17:03:04.747	2026-01-08 17:03:04.747
cmk5p4ffv004d8j6m7cipdq14	cmk5p4ffu004a8j6m6boowwun	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.747	2026-01-08 17:03:04.747
cmk5p4ffw004g8j6m9l9ibrib	cmk5p4ffw004f8j6mtx1m5wkq	\N	Teoría	t	0	\N	2026-01-08 17:03:04.749	2026-01-08 17:03:04.749
cmk5p4ffw004h8j6mrggo5k8z	cmk5p4ffw004f8j6mtx1m5wkq	\N	Práctica	t	1	\N	2026-01-08 17:03:04.749	2026-01-08 17:03:04.749
cmk5p4ffw004i8j6mpmfuwqt1	cmk5p4ffw004f8j6mtx1m5wkq	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.749	2026-01-08 17:03:04.749
cmk5p4fgc004p8j6mmecite5x	cmk5p4fgb004o8j6mcax0radf	\N	Teoría	t	0	\N	2026-01-08 17:03:04.764	2026-01-08 17:03:04.764
cmk5p4fgc004q8j6mstjr4ukq	cmk5p4fgb004o8j6mcax0radf	\N	Práctica	t	1	\N	2026-01-08 17:03:04.764	2026-01-08 17:03:04.764
cmk5p4fgc004r8j6mamuadeeq	cmk5p4fgb004o8j6mcax0radf	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.764	2026-01-08 17:03:04.764
cmk5p4fge004u8j6mamarkf5r	cmk5p4fgd004t8j6mgsb6xni8	\N	Teoría	t	0	\N	2026-01-08 17:03:04.766	2026-01-08 17:03:04.766
cmk5p4fge004v8j6m61a9cf9v	cmk5p4fgd004t8j6mgsb6xni8	\N	Práctica	t	1	\N	2026-01-08 17:03:04.766	2026-01-08 17:03:04.766
cmk5p4fge004w8j6mvz8d5qy3	cmk5p4fgd004t8j6mgsb6xni8	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.766	2026-01-08 17:03:04.766
cmk5p4fh000538j6m16d9xl52	cmk5p4fgz00528j6mbaeiz4e5	\N	Teoría	t	0	\N	2026-01-08 17:03:04.789	2026-01-08 17:03:04.789
cmk5p4fh000548j6m0ls5ppdk	cmk5p4fgz00528j6mbaeiz4e5	\N	Práctica	t	1	\N	2026-01-08 17:03:04.789	2026-01-08 17:03:04.789
cmk5p4fh000558j6mlgouojd0	cmk5p4fgz00528j6mbaeiz4e5	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.789	2026-01-08 17:03:04.789
cmk5p4fh200588j6mnv8sgdab	cmk5p4fh100578j6mmf2483a3	\N	Teoría	t	0	\N	2026-01-08 17:03:04.79	2026-01-08 17:03:04.79
cmk5p4fh200598j6mep8dibdz	cmk5p4fh100578j6mmf2483a3	\N	Práctica	t	1	\N	2026-01-08 17:03:04.79	2026-01-08 17:03:04.79
cmk5p4fh2005a8j6mmse3wjx9	cmk5p4fh100578j6mmf2483a3	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.79	2026-01-08 17:03:04.79
cmk5p4fhh005h8j6mlmkyu7g6	cmk5p4fhg005g8j6mt4w0vkwx	\N	Teoría	t	0	\N	2026-01-08 17:03:04.806	2026-01-08 17:03:04.806
cmk5p4fhh005i8j6mhffthgp9	cmk5p4fhg005g8j6mt4w0vkwx	\N	Práctica	t	1	\N	2026-01-08 17:03:04.806	2026-01-08 17:03:04.806
cmk5p4fhh005j8j6mttgrg2ib	cmk5p4fhg005g8j6mt4w0vkwx	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.806	2026-01-08 17:03:04.806
cmk5p4fhj005m8j6miv0hmwa8	cmk5p4fhi005l8j6m45eyipij	\N	Teoría	t	0	\N	2026-01-08 17:03:04.807	2026-01-08 17:03:04.807
cmk5p4fhj005n8j6m9pdhapzs	cmk5p4fhi005l8j6m45eyipij	\N	Práctica	t	1	\N	2026-01-08 17:03:04.807	2026-01-08 17:03:04.807
cmk5p4fhj005o8j6ma3ydlbut	cmk5p4fhi005l8j6m45eyipij	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.807	2026-01-08 17:03:04.807
cmk5p4fhk005r8j6mgce9rbky	cmk5p4fhk005q8j6mwvizb47j	\N	Teoría	t	0	\N	2026-01-08 17:03:04.809	2026-01-08 17:03:04.809
cmk5p4fhk005s8j6mwfvtqoy5	cmk5p4fhk005q8j6mwvizb47j	\N	Práctica	t	1	\N	2026-01-08 17:03:04.809	2026-01-08 17:03:04.809
cmk5p4fhk005t8j6mhc471lzn	cmk5p4fhk005q8j6mwvizb47j	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.809	2026-01-08 17:03:04.809
cmk5p4fhm005w8j6m5r96dnjs	cmk5p4fhm005v8j6mtncycm52	\N	Teoría	t	0	\N	2026-01-08 17:03:04.811	2026-01-08 17:03:04.811
cmk5p4fhm005x8j6mxajjp0qt	cmk5p4fhm005v8j6mtncycm52	\N	Práctica	t	1	\N	2026-01-08 17:03:04.811	2026-01-08 17:03:04.811
cmk5p4fhm005y8j6m1pd0cgqh	cmk5p4fhm005v8j6mtncycm52	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.811	2026-01-08 17:03:04.811
cmk5p4fi800668j6mi8bu5lg2	cmk5p4fi800658j6mjsna8dnf	\N	Teoría	t	0	\N	2026-01-08 17:03:04.833	2026-01-08 17:03:04.833
cmk5p4fi800678j6m6hycooau	cmk5p4fi800658j6mjsna8dnf	\N	Práctica	t	1	\N	2026-01-08 17:03:04.833	2026-01-08 17:03:04.833
cmk5p4fi800688j6mym879pl8	cmk5p4fi800658j6mjsna8dnf	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.833	2026-01-08 17:03:04.833
cmk5p4fia006b8j6m9j5p10na	cmk5p4fi9006a8j6mumhvnd58	\N	Teoría	t	0	\N	2026-01-08 17:03:04.835	2026-01-08 17:03:04.835
cmk5p4fia006c8j6mhamyfrm6	cmk5p4fi9006a8j6mumhvnd58	\N	Práctica	t	1	\N	2026-01-08 17:03:04.835	2026-01-08 17:03:04.835
cmk5p4fia006d8j6miqia6bbq	cmk5p4fi9006a8j6mumhvnd58	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.835	2026-01-08 17:03:04.835
cmk5p4fiq006k8j6mrvhgjs5r	cmk5p4fip006j8j6mxljlm7la	\N	Teoría	t	0	\N	2026-01-08 17:03:04.85	2026-01-08 17:03:04.85
cmk5p4fiq006l8j6mos3avr82	cmk5p4fip006j8j6mxljlm7la	\N	Práctica	t	1	\N	2026-01-08 17:03:04.85	2026-01-08 17:03:04.85
cmk5p4fiq006m8j6mg4szqjfy	cmk5p4fip006j8j6mxljlm7la	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.85	2026-01-08 17:03:04.85
cmk5p4fir006p8j6mjw4beht3	cmk5p4fir006o8j6m4ajeqttd	\N	Teoría	t	0	\N	2026-01-08 17:03:04.852	2026-01-08 17:03:04.852
cmk5p4fir006q8j6m5cw7fyv3	cmk5p4fir006o8j6m4ajeqttd	\N	Práctica	t	1	\N	2026-01-08 17:03:04.852	2026-01-08 17:03:04.852
cmk5p4fir006r8j6m5fdeix6v	cmk5p4fir006o8j6m4ajeqttd	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.852	2026-01-08 17:03:04.852
cmk5p4fjg00728j6mukxgxmpm	cmk5p4fjf00718j6mmrie9472	\N	Teoría	t	0	\N	2026-01-08 17:03:04.876	2026-01-08 17:03:04.876
cmk5p4fjg00738j6myg4cziw5	cmk5p4fjf00718j6mmrie9472	\N	Práctica	t	1	\N	2026-01-08 17:03:04.876	2026-01-08 17:03:04.876
cmk5p4fjg00748j6mj4b7fzhx	cmk5p4fjf00718j6mmrie9472	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.876	2026-01-08 17:03:04.876
cmk5p4fji00778j6m0li5gje5	cmk5p4fjh00768j6mvvuw2vml	\N	Teoría	t	0	\N	2026-01-08 17:03:04.878	2026-01-08 17:03:04.878
cmk5p4fji00788j6mch0oc2h0	cmk5p4fjh00768j6mvvuw2vml	\N	Práctica	t	1	\N	2026-01-08 17:03:04.878	2026-01-08 17:03:04.878
cmk5p4fji00798j6mygboan2v	cmk5p4fjh00768j6mvvuw2vml	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.878	2026-01-08 17:03:04.878
cmk5p4fjx007g8j6myi63nbfq	cmk5p4fjv007f8j6m8ejy00f6	\N	Teoría	t	0	\N	2026-01-08 17:03:04.893	2026-01-08 17:03:04.893
cmk5p4fjx007h8j6m0ozc4jt7	cmk5p4fjv007f8j6m8ejy00f6	\N	Práctica	t	1	\N	2026-01-08 17:03:04.893	2026-01-08 17:03:04.893
cmk5p4fjx007i8j6m3imj0hk2	cmk5p4fjv007f8j6m8ejy00f6	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.893	2026-01-08 17:03:04.893
cmk5p4fjy007l8j6mibo8qik7	cmk5p4fjx007k8j6m5xlfhl1e	\N	Teoría	t	0	\N	2026-01-08 17:03:04.895	2026-01-08 17:03:04.895
cmk5p4fjy007m8j6mfrhin6ev	cmk5p4fjx007k8j6m5xlfhl1e	\N	Práctica	t	1	\N	2026-01-08 17:03:04.895	2026-01-08 17:03:04.895
cmk5p4fjy007n8j6mmzyvwdyh	cmk5p4fjx007k8j6m5xlfhl1e	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.895	2026-01-08 17:03:04.895
cmk5p4fkm007y8j6m4tq76f1i	cmk5p4fkl007x8j6me70diks0	\N	Teoría	t	0	\N	2026-01-08 17:03:04.919	2026-01-08 17:03:04.919
cmk5p4fkm007z8j6m1wzjntn7	cmk5p4fkl007x8j6me70diks0	\N	Práctica	t	1	\N	2026-01-08 17:03:04.919	2026-01-08 17:03:04.919
cmk5p4fkm00808j6m4wrh9p1q	cmk5p4fkl007x8j6me70diks0	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.919	2026-01-08 17:03:04.919
cmk5p4fko00838j6m3m84mefy	cmk5p4fkn00828j6muovbnuld	\N	Teoría	t	0	\N	2026-01-08 17:03:04.92	2026-01-08 17:03:04.92
cmk5p4fko00848j6mwj6ts4ay	cmk5p4fkn00828j6muovbnuld	\N	Práctica	t	1	\N	2026-01-08 17:03:04.92	2026-01-08 17:03:04.92
cmk5p4fko00858j6mi9ni7nw9	cmk5p4fkn00828j6muovbnuld	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.92	2026-01-08 17:03:04.92
cmk5p4flf008g8j6mdozdcf8e	cmk5p4fle008f8j6mnm8wccxe	\N	Teoría	t	0	\N	2026-01-08 17:03:04.947	2026-01-08 17:03:04.947
cmk5p4flf008h8j6mufaxhafh	cmk5p4fle008f8j6mnm8wccxe	\N	Práctica	t	1	\N	2026-01-08 17:03:04.947	2026-01-08 17:03:04.947
cmk5p4flf008i8j6m97zciye4	cmk5p4fle008f8j6mnm8wccxe	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.947	2026-01-08 17:03:04.947
cmk5p4flg008l8j6mre76xilx	cmk5p4flg008k8j6mejzcjelz	\N	Teoría	t	0	\N	2026-01-08 17:03:04.949	2026-01-08 17:03:04.949
cmk5p4flg008m8j6ms36wemqw	cmk5p4flg008k8j6mejzcjelz	\N	Práctica	t	1	\N	2026-01-08 17:03:04.949	2026-01-08 17:03:04.949
cmk5p4flg008n8j6m7purl2x0	cmk5p4flg008k8j6mejzcjelz	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.949	2026-01-08 17:03:04.949
cmk5p4flz008u8j6m8h44rzve	cmk5p4fly008t8j6m8vzkkd55	\N	Teoría	t	0	\N	2026-01-08 17:03:04.968	2026-01-08 17:03:04.968
cmk5p4flz008v8j6m2zib7mek	cmk5p4fly008t8j6m8vzkkd55	\N	Práctica	t	1	\N	2026-01-08 17:03:04.968	2026-01-08 17:03:04.968
cmk5p4flz008w8j6mudz31fj1	cmk5p4fly008t8j6m8vzkkd55	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.968	2026-01-08 17:03:04.968
cmk5p4fm1008z8j6mddcoiavs	cmk5p4fm0008y8j6m7nbn2w4l	\N	Teoría	t	0	\N	2026-01-08 17:03:04.969	2026-01-08 17:03:04.969
cmk5p4fm100908j6mwuo395a2	cmk5p4fm0008y8j6m7nbn2w4l	\N	Práctica	t	1	\N	2026-01-08 17:03:04.969	2026-01-08 17:03:04.969
cmk5p4fm100918j6mvfffp4m0	cmk5p4fm0008y8j6m7nbn2w4l	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.969	2026-01-08 17:03:04.969
cmk5p4fml00988j6m3uh1wsoq	cmk5p4fmk00978j6m6yvmtufh	\N	Teoría	t	0	\N	2026-01-08 17:03:04.989	2026-01-08 17:03:04.989
cmk5p4fml00998j6m4gq96kdc	cmk5p4fmk00978j6m6yvmtufh	\N	Práctica	t	1	\N	2026-01-08 17:03:04.989	2026-01-08 17:03:04.989
cmk5p4fml009a8j6m016942mn	cmk5p4fmk00978j6m6yvmtufh	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.989	2026-01-08 17:03:04.989
cmk5p4fmn009d8j6mjdot35ny	cmk5p4fmm009c8j6mvjsr5rnc	\N	Teoría	t	0	\N	2026-01-08 17:03:04.991	2026-01-08 17:03:04.991
cmk5p4fmn009e8j6mfpr1yyi1	cmk5p4fmm009c8j6mvjsr5rnc	\N	Práctica	t	1	\N	2026-01-08 17:03:04.991	2026-01-08 17:03:04.991
cmk5p4fmn009f8j6mdz9xie8r	cmk5p4fmm009c8j6mvjsr5rnc	\N	Evaluación	t	2	\N	2026-01-08 17:03:04.991	2026-01-08 17:03:04.991
cmk5p4fn4009m8j6miuh8m2vw	cmk5p4fn3009l8j6mo9h6019z	\N	Teoría	t	0	\N	2026-01-08 17:03:05.008	2026-01-08 17:03:05.008
cmk5p4fn4009n8j6mlz6lzuep	cmk5p4fn3009l8j6mo9h6019z	\N	Práctica	t	1	\N	2026-01-08 17:03:05.008	2026-01-08 17:03:05.008
cmk5p4fn4009o8j6mjisvsf0n	cmk5p4fn3009l8j6mo9h6019z	\N	Evaluación	t	2	\N	2026-01-08 17:03:05.008	2026-01-08 17:03:05.008
cmk5p4fn5009r8j6m23ebcwnd	cmk5p4fn5009q8j6m2m4n5ol3	\N	Teoría	t	0	\N	2026-01-08 17:03:05.01	2026-01-08 17:03:05.01
cmk5p4fn5009s8j6mbt730433	cmk5p4fn5009q8j6m2m4n5ol3	\N	Práctica	t	1	\N	2026-01-08 17:03:05.01	2026-01-08 17:03:05.01
cmk5p4fn5009t8j6mf0n26wnn	cmk5p4fn5009q8j6m2m4n5ol3	\N	Evaluación	t	2	\N	2026-01-08 17:03:05.01	2026-01-08 17:03:05.01
cmk5p4fns00a08j6mwd9fsjxu	cmk5p4fnr009z8j6m4s78m75d	\N	Teoría	t	0	\N	2026-01-08 17:03:05.032	2026-01-08 17:03:05.032
cmk5p4fns00a18j6mjg2gqb52	cmk5p4fnr009z8j6m4s78m75d	\N	Práctica	t	1	\N	2026-01-08 17:03:05.032	2026-01-08 17:03:05.032
cmk5p4fns00a28j6mbwy91qwj	cmk5p4fnr009z8j6m4s78m75d	\N	Evaluación	t	2	\N	2026-01-08 17:03:05.032	2026-01-08 17:03:05.032
cmk5p4fnt00a58j6m7pme3wxq	cmk5p4fnt00a48j6mw3qjuzii	\N	Teoría	t	0	\N	2026-01-08 17:03:05.034	2026-01-08 17:03:05.034
cmk5p4fnt00a68j6mbrrqh0sm	cmk5p4fnt00a48j6mw3qjuzii	\N	Práctica	t	1	\N	2026-01-08 17:03:05.034	2026-01-08 17:03:05.034
cmk5p4fnt00a78j6m4a1aisas	cmk5p4fnt00a48j6mw3qjuzii	\N	Evaluación	t	2	\N	2026-01-08 17:03:05.034	2026-01-08 17:03:05.034
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
cmk2n10jj000m8j6ocshp6xf7	STEAM_LIBROS	Plataforma completa STEAM: Matemáticas + Programación + Ciencias. Acceso a todo el contenido asincrónico, ejercicios interactivos y progreso gamificado.	40000.00	ARS	MENSUAL	1	t	2026-01-06 13:41:07.711	2026-01-06 13:41:07.711
cmk2n10jm000n8j6oyzhhlhdn	STEAM_ASINCRONICO	Todo el contenido de STEAM Libros + clases grabadas premium, recursos descargables y material de apoyo exclusivo.	65000.00	ARS	MENSUAL	1	t	2026-01-06 13:41:07.714	2026-01-06 13:41:07.714
cmk2n10jo000o8j6okfik3qei	STEAM_SINCRONICO	Experiencia completa: Todo lo anterior + clases en vivo con docentes especializados, chat en tiempo real y seguimiento personalizado.	95000.00	ARS	MENSUAL	1	t	2026-01-06 13:41:07.716	2026-01-06 13:41:07.716
\.


--
-- Data for Name: planificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planificaciones (id, titulo, descripcion, cantidad_clases, casa_tipo, created_at, duracion_clase_dias, estado, mundo_tipo, updated_at) FROM stdin;
cmk5dt774003d8jvw8627695y	Nueva Planificación	\N	12	VERTEX	2026-01-08 11:46:25.072	7	BORRADOR	CIENCIAS	2026-01-08 11:46:25.072
cmk5rikh000758jcpqj5usjau	Planificación Test tptpbw5pbcwszju9y6l0wh5y	\N	2	QUANTUM	2026-01-08 18:10:03.684	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:03.684
cmk5riknc007r8jcpfcvqm3r1	Planificación Test stfmbrj24j1cpns14fx2xwjs	\N	2	QUANTUM	2026-01-08 18:10:03.912	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:03.912
cmk5riko8008a8jcp85pw9cr5	Planificación Test b1ennjtwt25m0qavunvtxejz	\N	2	QUANTUM	2026-01-08 18:10:03.944	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:03.944
cmk5rikp5008x8jcpla3z3aek	Planificación Test a8g0av66jclaf1pv8omo5twj	\N	2	QUANTUM	2026-01-08 18:10:03.977	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:03.977
cmk5rikq2009m8jcpq68i7lo0	Planificación Test wxn2p5xuksugay6l7skte1ov	\N	2	QUANTUM	2026-01-08 18:10:04.011	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.011
cmk5rikr100ab8jcprfgpqovb	Planificación Test veimcwgodtin2hbts5geb44i	\N	2	QUANTUM	2026-01-08 18:10:04.045	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.045
cmk5riks000b08jcptr487m6s	Planificación Test gm9uqiq5mjhs2wrn0k6r61ck	\N	2	QUANTUM	2026-01-08 18:10:04.08	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.08
cmk5riksq00bj8jcp387enjwd	Planificación Test twiy7nwkxyzmagi4yw0iqh7j	\N	2	QUANTUM	2026-01-08 18:10:04.107	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.107
cmk5riktx00c88jcpdynx3mkd	Planificación Test brmu4wbx3guy6ny5bbmaz0ce	\N	2	QUANTUM	2026-01-08 18:10:04.149	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.149
cmk5rikv100cx8jcpuj33az94	Planificación Test n02ltbgcy3j62fdm65zc8nvz	\N	2	QUANTUM	2026-01-08 18:10:04.189	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.189
cmk5rikwb00dl8jcpgoeoii5b	Planificación Test buu2n5qwpcrjqdqdjajzeent	\N	2	QUANTUM	2026-01-08 18:10:04.235	7	PUBLICADO	MATEMATICA	2026-01-08 18:10:04.235
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, nombre, descripcion, precio, tipo, activo, fecha_inicio, fecha_fin, cupo_maximo, duracion_meses, "createdAt", "updatedAt", subcategoria, imagen_portada) FROM stdin;
cmk4e4blu00108ji6is17a0hb	Curso de Matemáticas	\N	5000.00	Curso	f	\N	\N	\N	1	2026-01-07 19:07:17.827	2026-01-08 18:49:40.462	\N	\N
cmk5syj9u00008jfj69b1a7ne	Curso de prueba	Curso de prueba para probar funcionalidades	1.00	Curso	t	2026-08-01 00:00:00	2026-08-03 00:00:00	4	1	2026-01-08 18:50:28.242	2026-01-08 18:50:28.242	Curso de prueba	\N
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
830580bc-4dd8-4914-913c-39bdfc734b1b	tutor	::1	Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0	2026-01-08 15:48:41.911-03	2026-01-08 15:48:41.91-03	2026-01-15 15:48:41.91-03	f	\N	cmk4vyyi600008j4mbtjgwe0j
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
\.


--
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sectores (id, nombre, descripcion, color, icono, activo, "createdAt", "updatedAt") FROM stdin;
cmk2n106n00028j6odqlzumw1	Matemática	Sector de matemática	#3B82F6	📐	t	2026-01-06 13:41:07.248	2026-01-06 13:41:07.248
cmk2n106r00038j6ojccxd4wl	Programación	Sector de programación	#8B5CF6	💻	t	2026-01-06 13:41:07.251	2026-01-06 13:41:07.251
cmk2n106t00048j6o0kix0jui	Ciencias	Sector de ciencias naturales y exactas	#10B981	🔬	t	2026-01-06 13:41:07.253	2026-01-06 13:41:07.253
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
cmk5rikoe008j8jcpqain4yme	cmk5riko8008c8jcp5ezrlyia	cmk5rikoc008h8jcpdyyx7yj5	1	t
cmk5rikpa00968jcp1wnlz2ig	cmk5rikp5008z8jcprgojwika	cmk5rikp900948jcpthya0pf8	1	t
cmk5rikq9009v8jcpqst7clex	cmk5rikq3009o8jcpub5snm0j	cmk5rikq7009t8jcpsdb2h3uc	1	f
cmk5rikr600ak8jcp462p9gn4	cmk5rikr100ad8jcpiz6tua6q	cmk5rikr400ai8jcpliy42iw9	1	t
cmk5riksx00bs8jcphz80e10p	cmk5riksr00bl8jcp25kr6mv2	cmk5riksv00bq8jcpf5u7q7gc	1	t
cmk5riku300ch8jcpwd8ncfay	cmk5riktx00ca8jcp0y1bba81	cmk5riku100cf8jcp6cps97go	1	t
cmk5rikwj00du8jcpnrom3agk	cmk5rikwb00dn8jcpnods79s5	cmk5rikwg00ds8jcpfi4uwx64	1	t
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
-- Name: docentes_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX docentes_email_key ON public.docentes USING btree (email);


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
-- Name: grupos_codigo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX grupos_codigo_idx ON public.grupos USING btree (codigo);


--
-- Name: grupos_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX grupos_codigo_key ON public.grupos USING btree (codigo);


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
-- Name: comisiones comisiones_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comisiones
    ADD CONSTRAINT comisiones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contenidos contenidos_creador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contenidos
    ADD CONSTRAINT contenidos_creador_id_fkey FOREIGN KEY (creador_id) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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

\unrestrict 8Ie3qWH9WcifnKa3g9hXiGVDVan6N35UTlSywJvK5eKvlC3EdfZb8lU41LrdHKH

