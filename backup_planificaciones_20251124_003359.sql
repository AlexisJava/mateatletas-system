--
-- PostgreSQL database dump
--

\restrict PLc10f5HUMNVbGwC8pL13xKbXAUR1hhQ7JmNvBzEjScsY4DW8k8cWatOyfSNe8b

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Data for Name: asignaciones_planificacion; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.asignaciones_planificacion (id, planificacion_id, docente_id, clase_grupo_id, fecha_asignacion, activa, created_at, updated_at) FROM stdin;
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
-- Data for Name: progreso_estudiante_planificacion; Type: TABLE DATA; Schema: public; Owner: mateatletas
--

COPY public.progreso_estudiante_planificacion (id, estudiante_id, planificacion_id, semana_actual, ultima_actividad, estado_guardado, tiempo_total_minutos, puntos_totales, created_at, updated_at) FROM stdin;
\.


--
-- Name: asignaciones_planificacion asignaciones_planificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.asignaciones_planificacion
    ADD CONSTRAINT asignaciones_planificacion_pkey PRIMARY KEY (id);


--
-- Name: planificaciones_simples planificaciones_simples_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.planificaciones_simples
    ADD CONSTRAINT planificaciones_simples_pkey PRIMARY KEY (id);


--
-- Name: progreso_estudiante_planificacion progreso_estudiante_planificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: mateatletas
--

ALTER TABLE ONLY public.progreso_estudiante_planificacion
    ADD CONSTRAINT progreso_estudiante_planificacion_pkey PRIMARY KEY (id);


--
-- Name: asignaciones_planificacion_docente_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX asignaciones_planificacion_docente_id_idx ON public.asignaciones_planificacion USING btree (docente_id);


--
-- Name: asignaciones_planificacion_planificacion_id_clase_grupo_id_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX asignaciones_planificacion_planificacion_id_clase_grupo_id_key ON public.asignaciones_planificacion USING btree (planificacion_id, clase_grupo_id);


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
-- Name: progreso_estudiante_planificacion_estudiante_id_idx; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE INDEX progreso_estudiante_planificacion_estudiante_id_idx ON public.progreso_estudiante_planificacion USING btree (estudiante_id);


--
-- Name: progreso_estudiante_planificacion_estudiante_id_planificaci_key; Type: INDEX; Schema: public; Owner: mateatletas
--

CREATE UNIQUE INDEX progreso_estudiante_planificacion_estudiante_id_planificaci_key ON public.progreso_estudiante_planificacion USING btree (estudiante_id, planificacion_id);


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
-- PostgreSQL database dump complete
--

\unrestrict PLc10f5HUMNVbGwC8pL13xKbXAUR1hhQ7JmNvBzEjScsY4DW8k8cWatOyfSNe8b

