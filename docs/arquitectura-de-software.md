# Informe Arquitectónico Exhaustivo: Ecosistema Mateatletas

**Propósito:** Servir como el plano conceptual definitivo para el diseño y desarrollo de la plataforma Mateatletas, detallando el modelo de negocio, la experiencia de usuario, la arquitectura tecnológica y el modelo de datos subyacente.

## Parte 1: Visión y Modelo de Negocio

Esta sección audita y resume la identidad estratégica del proyecto.

- **Identidad del Proyecto:** Mateatletas es una plataforma educativa en línea concebida como un "Club House" o "gimnasio mental". Su nombre fusiona "matemáticas" y "atleta", reflejando una filosofía de entrenamiento mental constante.

- **Misión y Visión:** La misión es revolucionar el aprendizaje de STEAM eliminando barreras como los horarios rígidos. La visión es consolidarse como un club en línea donde la tecnología permite una experiencia educativa flexible, colaborativa y adaptada a las familias modernas.

- **Público Objetivo:** El servicio está dirigido a niños y adolescentes (6 a 17 años) y sus familias. Los padres o tutores son los clientes que gestionan las suscripciones, mientras que los docentes y administradores son usuarios clave internos.

- **Propuesta de Valor:** La solución principal es la flexibilidad total de horarios, que resuelve la rigidez de los programas educativos tradicionales.

- **Modelo Comercial:**
  - La monetización se basa en un modelo de suscripción mensual "all-you-can-learn".
  - Se podrán ofrecer "Cursos" como productos de pago único con características definidas (fecha de inicio/fin, cupo).
  - La pasarela de pagos para Latinoamérica será Mercado Pago.
  - Decisión de negocio final: No se ofrecerán pruebas gratuitas. El acceso a los servicios requiere una compra activa.

## Parte 2: El Producto y la Experiencia de Usuario

Esta sección detalla los componentes que el usuario final experimenta.

### Componentes Clave del Servicio:

- **Clases en Vivo Flexibles:** Los miembros acceden a una grilla continua de clases grupales y pueden reservar las que mejor se adapten a su agenda.

- **Tutoría Inteligente 24/7:** Un chatbot educativo impulsado por IA (integrando tecnologías como GPT o Gemini) para practicar y resolver dudas en cualquier momento.

- **Comunidad y Colaboración:** Se fomenta la interacción a través de eventos grupales como los "Viernes Colaborativos" y comunidades externas para padres.

- **Retos y Eventos Especiales:** Actividades periódicas como hackathons matemáticos o talleres para mantener la motivación.

### Sistema de Gamificación Detallado:

Basado en el documento "Sistema de Puntos y Logros".

- **Puntos por Acción:** Los docentes otorgan puntos a los estudiantes por acciones pedagógicas específicas y predefinidas, como "Razonamiento destacado" (+5) o "Intento valiente" (+3).

- **Logros (Insignias):** Hitos únicos y no repetibles que un estudiante puede desbloquear al cumplir ciertos requisitos (ej. "Compañero Solidario"). Estos son asignados por el criterio del docente.

- **Niveles de Progreso:** Los estudiantes avanzan a través de 7 niveles acumulando puntos (Nivel 1 requiere 60 puntos, Nivel 5 requiere 500).

- **Equipos:** Los estudiantes pertenecen a equipos con nombre y escudo. Los puntos individuales que ganan también suman al puntaje total de su equipo.

## Parte 3: Arquitectura Tecnológica y Modelo de Datos

Esta sección constituye el plano técnico de la plataforma.

### Stack Tecnológico:

- **Base de Datos:** PostgreSQL.
- **Backend:** Node.js o Python.
- **Frontend:** React (aplicación web responsiva).
- **Integraciones:** Jitsi Meet para clases en vivo, APIs de OpenAI/Gemini para el Tutor IA, y Mercado Pago para los pagos.

### Diseño Exhaustivo de la Base de Datos:

#### Producto:

El catálogo central de ofertas. Atributos: nombre, descripcion, precio, tipo ('Suscripción', 'Curso', 'RecursoDigital'). Si el tipo es 'Curso', tendrá fecha_inicio, fecha_fin, cupo_maximo.

#### Usuarios:

- **Tutor:** nombre, apellido, dni, cuil, email, telefono, contraseña.
- **Estudiante:** nombre, apellido, fecha_nacimiento, email, contraseña. Tendrá su propio acceso y estará vinculado a un Tutor.
- **Docente:** Datos personales y profesionales.

#### Membresía:

Vincula a un Tutor con un Producto de tipo 'Suscripción'. Atributos clave: estado ('Activa', 'Atrasada', 'Cancelada'), fecha_proximo_pago.

#### InscripcionCurso:

Vincula a un Estudiante con un Producto de tipo 'Curso'. Atributos clave: estado ('Pre-Inscrito', 'Activo', 'Finalizado').

#### Contenido Académico:

- **RutaCurricular:** Las categorías temáticas (ej. "Lógica").
- **Clase:** Una sesión específica en el calendario. Vinculada a una RutaCurricular y un Docente. Atributos: fecha_hora_inicio, duracion, estado ('Programada', 'Cancelada').
- **Modulo y Leccion:** Estructura interna para los Productos de tipo 'Curso'.

#### Inscripción (Reserva de Clase):

Tabla que conecta a un Estudiante con una Clase. Almacena estado_asistencia ('Asistió', 'Ausente') y las observaciones_docente.

#### Gamificación:

- **Equipo:** nombre, color, escudo_url.
- **AccionPuntuable y Logro:** Tablas de configuración con los puntos y requisitos definidos.
- **PuntosObtenidos y LogrosObtenidos:** Registros transaccionales que vinculan a un Estudiante con los puntos o logros ganados en un contexto específico (una Clase o Leccion).

#### Gestión y Comunicaciones:

- **Descuento:** Para gestionar códigos promocionales y reglas de descuento.
- **Notificacion:** Un registro de todas las comunicaciones automáticas enviadas a los usuarios.

## Parte 4: Visión Administrativa y Escalabilidad

Esta sección describe las herramientas de gestión y el potencial de crecimiento del modelo.

### Panel de Control del Administrador ("Copiloto"):

El objetivo no es un simple panel de administración, sino un dashboard inteligente que vigile la "salud del ecosistema".

- **Indicadores Clave:** Visualización rápida del estado de los pagos, la actividad de las clases y las alertas de estudiantes.

- **Alertas Proactivas:** El sistema analizará automáticamente las observaciones de los docentes en busca de palabras clave negativas para generar alertas sobre estudiantes que puedan necesitar una intervención.

- **Sugerencias por IA:** Al revisar una alerta, el administrador recibirá sugerencias generadas por IA para abordar la situación de manera efectiva.

### Escalabilidad del Modelo:

- La creación de la entidad Producto como un catálogo central permite a Mateatletas evolucionar sin necesidad de reestructurar la base de datos.
- El modelo está preparado para expandirse a un marketplace donde se vendan Productos de tipo 'RecursoDigital' (guías, videos, etc.), tal como se conversó.

---

Este informe representa el plano conceptual completo y final. Cada decisión de negocio ha sido traducida a una estructura de datos lógica, robusta y preparada para el futuro.

---

# Diseño Lógico: Tablas de Usuarios

## Tabla administradores (Nueva Tabla Propuesta)

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                                                      |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------ |
| id               | UUID         | Clave Primaria (PK). Referencia directa a auth.users.id.                                   |
| nombre           | VARCHAR(100) | NOT NULL.                                                                                  |
| apellido         | VARCHAR(100) | NOT NULL.                                                                                  |
| rol_especifico   | VARCHAR(50)  | NOT NULL. Ej: 'SuperAdmin', 'SoporteNivel1'. Permite diferenciar tipos de administradores. |
| estado           | VARCHAR(50)  | NOT NULL, DEFAULT 'Activo'. Valores: 'Activo', 'Inactivo'.                                 |
| created_at       | TIMESTAMPTZ  | DEFAULT NOW().                                                                             |
| updated_at       | TIMESTAMPTZ  | DEFAULT NOW().                                                                             |

## Tabla tutores (Versión Final Robusta)

| Nombre del Campo         | Tipo de Dato | Restricciones / Notas                                                                                     |
| ------------------------ | ------------ | --------------------------------------------------------------------------------------------------------- |
| id                       | UUID         | MODIFICADO. Clave Primaria (PK). Referencia directa al id del usuario en la tabla auth.users de Supabase. |
| nombre                   | VARCHAR(100) | NOT NULL.                                                                                                 |
| apellido                 | VARCHAR(100) | NOT NULL.                                                                                                 |
| dni                      | VARCHAR(20)  | UNIQUE.                                                                                                   |
| cuil                     | VARCHAR(20)  | UNIQUE.                                                                                                   |
| telefono                 | VARCHAR(50)  | NULL.                                                                                                     |
| estado                   | VARCHAR(50)  | AÑADIDO. NOT NULL, DEFAULT 'Activo'. Valores: 'Activo', 'Inactivo', 'Bloqueado'.                          |
| mercado_pago_customer_id | VARCHAR(255) | AÑADIDO. UNIQUE, NULL. Para vincular al cliente en la pasarela de pago.                                   |
| ha_completado_onboarding | BOOLEAN      | AÑADIDO. NOT NULL, DEFAULT FALSE.                                                                         |
| created_at               | TIMESTAMPTZ  | DEFAULT NOW().                                                                                            |
| updated_at               | TIMESTAMPTZ  | DEFAULT NOW().                                                                                            |
| -                        | -            | ELIMINADO. Los campos email y contraseña_hash se gestionan en la tabla auth.users de Supabase.            |

### Resumen de los Cambios y Por Qué se Hicieron:

- **id (Modificado a UUID):** Este es un cambio crucial para la integración con Supabase Auth. Supabase identifica a cada usuario con un UUID (un identificador universal único). Al usar el mismo id en nuestra tabla tutores, creamos un vínculo directo y seguro entre la autenticación (quién es el usuario) y su perfil de negocio (los datos del tutor).

- **email y contraseña_hash (Eliminados):** Estos campos se eliminan de esta tabla por una razón fundamental de seguridad y buenas prácticas. La gestión de la identidad (email y contraseña) es responsabilidad exclusiva del sistema de autenticación de Supabase (auth.users). Nuestra tabla tutores solo debe contener datos del perfil del negocio. Esto separa las responsabilidades y hace tu sistema mucho más seguro.

- **estado (Añadido):** Este campo te da control administrativo total. Si un padre tiene un problema o necesitás suspender una cuenta temporalmente, simplemente cambiás su estado a 'Inactivo' o 'Bloqueado' sin necesidad de borrar sus datos, lo cual preserva la integridad del historial de pagos e inscripciones.

- **mercado_pago_customer_id (Añadido):** Es una práctica recomendada para sistemas de pago. Al guardar el ID de cliente de Mercado Pago aquí, es mucho más fácil y rápido asociar los pagos con los perfiles en tu plataforma, especialmente si necesitás gestionar reembolsos o consultar historiales.

- **ha_completado_onboarding (Añadido):** Como discutimos, este es el "interruptor" que le permite al sistema saber si debe mostrarle el tour guiado a un nuevo padre la primera vez que inicia sesión, asegurando una experiencia de bienvenida profesional.

## Tabla estudiantes (Versión Final Optimizada)

Esta tabla almacena la información de los niños y adolescentes que participan en el club, ahora optimizada para un acceso instantáneo a su progreso en el sistema de gamificación.

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                                                                                                    |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| id               | UUID         | Clave Primaria (PK). Referencia directa a auth.users.id.                                                                                 |
| tutor_id         | UUID         | Clave Foránea (FK) que referencia a tutores(id). NOT NULL.                                                                               |
| equipo_id        | BIGINT       | Clave Foránea (FK) a la tabla equipos(id). Puede ser NULL al inicio.                                                                     |
| nombre           | VARCHAR(100) | NOT NULL.                                                                                                                                |
| apellido         | VARCHAR(100) | NOT NULL.                                                                                                                                |
| fecha_nacimiento | DATE         | Almacena solo la fecha, sin la hora.                                                                                                     |
| puntos_totales   | INTEGER      | AÑADIDO. NOT NULL, DEFAULT 0. Almacena el total de puntos acumulados para lectura instantánea. Se actualiza automáticamente vía Trigger. |
| nivel_actual     | INTEGER      | AÑADIDO. NOT NULL, DEFAULT 1. Almacena el nivel de gamificación actual del estudiante. Se actualiza automáticamente vía Trigger.         |
| created_at       | TIMESTAMPTZ  | DEFAULT NOW().                                                                                                                           |
| updated_at       | TIMESTAMPTZ  | DEFAULT NOW().                                                                                                                           |

---

# Diseño Lógico: Tablas Comerciales

## Tabla productos (Versión Final Robusta)

| Nombre del Campo   | Tipo de Dato  | Restricciones / Notas                                                                                            |
| ------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| id                 | BIGSERIAL     | Clave Primaria (PK).                                                                                             |
| nombre             | VARCHAR(255)  | NOT NULL. Ej: "Club Lunes 17hs", "Curso Verano Robótica".                                                        |
| descripcion        | TEXT          | NULL. Descripción detallada que verán los padres.                                                                |
| modelo_cobro       | VARCHAR(50)   | AÑADIDO. NOT NULL. Valores: 'PagoUnico', 'Recurrente'.                                                           |
| modelo_servicio    | VARCHAR(50)   | AÑADIDO. NOT NULL. Valores: 'CursoFijo', 'AccesoFlexible'.                                                       |
| precio_base        | NUMERIC(10,2) | NOT NULL. El precio antes de cualquier descuento.                                                                |
| ruta_curricular_id | BIGINT        | AÑADIDO. Clave Foránea (FK) a rutas_curriculares(id). Define la categoría del producto (Lógica, Robótica, etc.). |
| fecha_inicio       | DATE          | NULL. Aplica principalmente a productos de modelo_servicio = 'CursoFijo'.                                        |
| fecha_fin          | DATE          | NULL. Aplica principalmente a productos de modelo_servicio = 'CursoFijo'.                                        |
| cupo_maximo        | INTEGER       | NULL. El cupo máximo de estudiantes para un 'CursoFijo'.                                                         |
| activo             | BOOLEAN       | AÑADIDO. DEFAULT TRUE. Te permite "archivar" o desactivar un producto sin borrarlo.                              |
| created_at         | TIMESTAMPTZ   | DEFAULT NOW().                                                                                                   |
| updated_at         | TIMESTAMPTZ   | DEFAULT NOW().                                                                                                   |
| -                  | -             | ELIMINADO. El campo tipo ha sido reemplazado por los dos nuevos modelos.                                         |

## 2. Tabla: membresías

Esta tabla gestiona las suscripciones activas de los tutores al "Club House". Cada fila es una suscripción familiar.

| Nombre del Campo   | Tipo de Dato  | Restricciones / Notas                                                                     |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------- |
| id                 | BIGSERIAL     | Clave Primaria (PK).                                                                      |
| tutor_id           | UUID          | Clave Foránea (FK) a tutores(id). Vincula la membresía al tutor que paga.                 |
| producto_id        | BIGINT        | Clave Foránea (FK) a productos(id). Vincula al producto de tipo 'Suscripción' contratado. |
| estado             | VARCHAR(50)   | NOT NULL. Valores controlados: 'Activa', 'Atrasada', 'Cancelada'.                         |
| fecha_inicio       | DATE          | NOT NULL. Fecha en que comenzó la suscripción.                                            |
| fecha_proximo_pago | DATE          | NOT NULL. La fecha clave para el ciclo de facturación y el control de acceso.             |
| costo_final        | NUMERIC(10,2) | NOT NULL. El costo real a cobrar, después de aplicar descuentos.                          |
| created_at         | TIMESTAMPTZ   | DEFAULT NOW().                                                                            |
| updated_at         | TIMESTAMPTZ   | DEFAULT NOW().                                                                            |

## 3. Tabla: inscripciones_cursos

Esta tabla registra la compra de un "Curso" (producto de pago único) para un estudiante específico.

| Nombre del Campo    | Tipo de Dato  | Restricciones / Notas                                                   |
| ------------------- | ------------- | ----------------------------------------------------------------------- |
| id                  | BIGSERIAL     | Clave Primaria (PK).                                                    |
| estudiante_id       | UUID          | Clave Foránea (FK) a estudiantes(id). El alumno que tomará el curso.    |
| producto_id         | BIGINT        | Clave Foránea (FK) a productos(id). El curso específico que se compró.  |
| tutor_id_comprador  | UUID          | Clave Foránea (FK) a tutores(id). Quién realizó la compra.              |
| estado              | VARCHAR(50)   | NOT NULL. Valores: 'Pre-Inscrito', 'Activo', 'Finalizado', 'Cancelado'. |
| precio_final_pagado | NUMERIC(10,2) | NOT NULL. El monto exacto que se pagó.                                  |
| fecha_compra        | TIMESTAMPTZ   | DEFAULT NOW().                                                          |
| created_at          | TIMESTAMPTZ   | DEFAULT NOW().                                                          |
| updated_at          | TIMESTAMPTZ   | DEFAULT NOW().                                                          |

---

# Diseño Lógico: Tablas de Operación Académica

## 1. Tabla: rutas_curriculares

Esta tabla define las grandes áreas temáticas o categorías de su oferta educativa.

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                                   |
| ---------------- | ------------ | ----------------------------------------------------------------------- |
| id               | BIGSERIAL    | Clave Primaria (PK).                                                    |
| nombre           | VARCHAR(100) | UNIQUE, NOT NULL. Ej: "Lógica", "Álgebra", "Geometría", "Programación". |
| descripcion      | TEXT         | NOT NULL. La descripción que verán los padres para entender el área.    |
| created_at       | TIMESTAMPTZ  | DEFAULT NOW().                                                          |
| updated_at       | TIMESTAMPTZ  | DEFAULT NOW().                                                          |

## Tabla clases (Versión Final Robusta)

| Nombre del Campo    | Tipo de Dato | Restricciones / Notas                                                                                |
| ------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| id                  | BIGSERIAL    | Clave Primaria (PK).                                                                                 |
| producto_id         | BIGINT       | AÑADIDO. Clave Foránea (FK) a productos(id). Vincula la clase al "grupo" o "curso" que se vendió.    |
| docente_id          | UUID         | Clave Foránea (FK) a docentes(id). NOT NULL. El profesor asignado.                                   |
| titulo              | VARCHAR(255) | NOT NULL. Ej: "Escape Room Matemático", "Introducción a Variables".                                  |
| temario             | TEXT         | AÑADIDO. NULL. Descripción detallada de los temas y actividades para esta sesión específica.         |
| fecha_hora_inicio   | TIMESTAMPTZ  | NOT NULL. Fecha y hora exactas de inicio.                                                            |
| duracion_minutos    | INTEGER      | NOT NULL. Duración en minutos.                                                                       |
| cupos_ocupados      | INTEGER      | AÑADIDO. NOT NULL, DEFAULT 0. Se actualiza automáticamente para un control de cupo en tiempo real.   |
| estado              | VARCHAR(50)  | NOT NULL. DEFAULT 'Programada'. Valores: 'Programada', 'Realizada', 'Cancelada'.                     |
| enlace_sala_virtual | VARCHAR(255) | NULL. El enlace a la sala de Jitsi Meet.                                                             |
| grabacion_url       | VARCHAR(255) | AÑADIDO. NULL. Para guardar el enlace a la grabación de la clase una vez finalizada.                 |
| created_at          | TIMESTAMPTZ  | AÑADIDO. DEFAULT NOW().                                                                              |
| updated_at          | TIMESTAMPTZ  | AÑADIDO. DEFAULT NOW().                                                                              |
| -                   | -            | ELIMINADO. El campo cupo_maximo se traslada a la tabla productos para definirlo a nivel del "grupo". |

### Resumen de los Cambios y Por Qué se Hicieron:

- **producto_id (Añadido):** Este es el vínculo más importante. Ahora cada clase "sabe" a qué grupo o curso pertenece. Esto permite la automatización: cuando un padre compra el producto "Club Lunes 17hs", el sistema sabe exactamente qué clases mostrarle y en cuáles inscribir a su hijo.

- **cupo_maximo (Eliminado de aquí):** Hemos movido esta lógica a la tabla productos. El cupo máximo no es de una clase individual, sino del grupo o curso en su totalidad. Esto simplifica tu gestión: defines el cupo una sola vez en el producto, en lugar de repetirlo en cada clase del mes.

- **cupos_ocupados (Añadido):** Este campo es para el rendimiento y la lógica en tiempo real. En lugar de contar las inscripciones cada vez que alguien mira el calendario (lo cual es lento), mantenemos un contador actualizado. Cuando alguien se inscribe, suma 1. Cuando cancela, resta 1. Esto hace que la plataforma sea mucho más rápida.

- **temario (Añadido):** Enriquece la experiencia. Te permite a vos (o al docente) detallar qué se hará en esa sesión específica, dando más claridad a los padres y estudiantes sobre el contenido de cada encuentro.

- **grabacion_url (Añadido):** Un campo con visión a futuro. Te permite ofrecer un valor agregado inmenso: la posibilidad de que los estudiantes que faltaron puedan ver la grabación de la clase, todo desde el mismo portal.

- **created_at y updated_at (Añadidos):** Campos estándar de auditoría, esenciales para el mantenimiento y la trazabilidad del sistema.

## 3. Tabla: inscripciones

Esta tabla es el "puente" que conecta a un Estudiante con una Clase. Cada fila es una reserva confirmada.

| Nombre del Campo      | Tipo de Dato | Restricciones / Notas                                                                                                                            |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                    | BIGSERIAL    | Clave Primaria (PK).                                                                                                                             |
| clase_id              | BIGINT       | Clave Foránea (FK) a clases(id). La clase a la que se inscribe.                                                                                  |
| estudiante_id         | UUID         | Clave Foránea (FK) a estudiantes(id). El alumno inscrito.                                                                                        |
| fecha_reserva         | TIMESTAMPTZ  | DEFAULT NOW(). Momento exacto en que se hizo la reserva.                                                                                         |
| estado_reserva        | VARCHAR(50)  | NOT NULL. Valores: 'Confirmada', 'Cancelada por Usuario'.                                                                                        |
| estado_asistencia     | VARCHAR(50)  | NULL. Se actualiza por el docente post-clase. Valores: 'Asistió', 'Ausente'.                                                                     |
| observaciones_docente | TEXT         | NULL. El feedback personalizado del docente para el alumno en esta clase.                                                                        |
| -                     | UNIQUE       | Se añadirá una restricción UNIQUE en la combinación (clase_id, estudiante_id) para evitar que un alumno se inscriba dos veces en la misma clase. |
| created_at            | TIMESTAMPTZ  | DEFAULT NOW().                                                                                                                                   |
| updated_at            | TIMESTAMPTZ  | DEFAULT NOW().                                                                                                                                   |

---

# Diseño Lógico: Tablas de Gamificación

## 1. Tabla: equipos

Almacena los equipos a los que pertenecen los estudiantes.

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                         |
| ---------------- | ------------ | --------------------------------------------- |
| id               | BIGSERIAL    | Clave Primaria (PK).                          |
| nombre           | VARCHAR(100) | UNIQUE, NOT NULL. Ej: "Los Multiplicadores".  |
| color            | VARCHAR(50)  | El color representativo del equipo.           |
| escudo_url       | VARCHAR(255) | La URL de la imagen del escudo personalizado. |
| created_at       | TIMESTAMPTZ  | DEFAULT NOW().                                |

## 2. Tabla: acciones_puntuables (Reglas de Puntos)

Esta tabla de configuración almacena las acciones por las cuales un docente puede otorgar puntos.

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                       |
| ---------------- | ------------ | ----------------------------------------------------------- |
| id               | BIGSERIAL    | Clave Primaria (PK).                                        |
| nombre           | VARCHAR(255) | NOT NULL. Ej: "Razonamiento destacado", "Intento valiente". |
| descripcion      | TEXT         | La explicación de por qué se otorga.                        |
| puntos           | INTEGER      | NOT NULL. La cantidad de puntos que otorga la acción.       |

## 3. Tabla: logros (Reglas de Insignias)

Esta tabla de configuración almacena los logros o insignias que los estudiantes pueden desbloquear.

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                        |
| ---------------- | ------------ | ------------------------------------------------------------ |
| id               | BIGSERIAL    | Clave Primaria (PK).                                         |
| nombre           | VARCHAR(255) | NOT NULL. Ej: "Compañero Solidario", "Valentía Intelectual". |
| descripcion      | TEXT         | La explicación de por qué se otorga.                         |
| puntos_extra     | INTEGER      | NOT NULL. Los puntos adicionales que se ganan con el logro.  |
| imagen_url       | VARCHAR(255) | La URL de la imagen de la insignia.                          |

## 4. Tabla: puntos_obtenidos (Registro de Puntos)

Esta es una tabla transaccional. Cada fila es un evento donde un estudiante ganó puntos.

| Nombre del Campo     | Tipo de Dato | Restricciones / Notas                                                                            |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| id                   | BIGSERIAL    | Clave Primaria (PK).                                                                             |
| estudiante_id        | UUID         | Clave Foránea (FK) a estudiantes(id).                                                            |
| docente_id_otorgante | UUID         | Clave Foránea (FK) a docentes(id). El profesor que dio los puntos.                               |
| accion_id            | BIGINT       | Clave Foránea (FK) a acciones_puntuables(id). La razón de los puntos.                            |
| inscripcion_id       | BIGINT       | Clave Foránea (FK) a inscripciones(id). Opcional, si los puntos se ganaron en una clase en vivo. |
| puntos_asignados     | INTEGER      | NOT NULL. Se guarda el valor para preservar el historial si la regla cambia.                     |
| fecha_otorgado       | TIMESTAMPTZ  | DEFAULT NOW().                                                                                   |

## 5. Tabla: logros_obtenidos (Registro de Insignias)

Tabla transaccional que registra cuándo un estudiante desbloquea un logro.

| Nombre del Campo     | Tipo de Dato | Restricciones / Notas                                                                            |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| id                   | BIGSERIAL    | Clave Primaria (PK).                                                                             |
| estudiante_id        | UUID         | Clave Foránea (FK) a estudiantes(id).                                                            |
| logro_id             | BIGINT       | Clave Foránea (FK) a logros(id).                                                                 |
| docente_id_otorgante | UUID         | Clave Foránea (FK) a docentes(id).                                                               |
| fecha_obtenido       | TIMESTAMPTZ  | DEFAULT NOW().                                                                                   |
| -                    | UNIQUE       | Restricción en (estudiante_id, logro_id) para asegurar que un logro no se pueda ganar dos veces. |

---

# Diseño Lógico: Tablas Finales de Soporte y Contenido

## 1. Docentes y Especialidades

Estas tablas definen formalmente a sus profesores y sus capacidades.

### Tabla: docentes

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                    |
| ---------------- | ------------ | -------------------------------------------------------- |
| id               | UUID         | Clave Primaria (PK). Referencia directa a auth.users.id. |
| nombre           | VARCHAR(100) | NOT NULL.                                                |
| apellido         | VARCHAR(100) | NOT NULL.                                                |
| biografia        | TEXT         | NULL.                                                    |
| created_at       | TIMESTAMPTZ  | DEFAULT NOW().                                           |

### Tabla: docente_especialidades (Tabla de Unión)

| Nombre del Campo   | Tipo de Dato | Restricciones / Notas                                                    |
| ------------------ | ------------ | ------------------------------------------------------------------------ |
| docente_id         | UUID         | Clave Foránea (FK) a docentes(id).                                       |
| ruta_curricular_id | BIGINT       | Clave Foránea (FK) a rutas_curriculares(id).                             |
| -                  | PRIMARY KEY  | La clave primaria es la combinación de (docente_id, ruta_curricular_id). |

## 2. Estructura de Cursos

Estas tablas permiten construir el contenido interno de los Productos de tipo 'Curso'.

### Tabla: modulos

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                                    |
| ---------------- | ------------ | ------------------------------------------------------------------------ |
| id               | BIGSERIAL    | Clave Primaria (PK).                                                     |
| producto_id      | BIGINT       | Clave Foránea (FK) a productos(id). El curso al que pertenece el módulo. |
| titulo           | VARCHAR(255) | NOT NULL. Ej: "Módulo 1: Fundamentos de Álgebra".                        |
| orden            | INTEGER      | NOT NULL. Para ordenar los módulos (1, 2, 3...).                         |

### Tabla lecciones (Versión Final Robusta)

| Nombre del Campo          | Tipo de Dato | Restricciones / Notas                                                                                            |
| ------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| id                        | BIGSERIAL    | Clave Primaria (PK).                                                                                             |
| modulo_id                 | BIGINT       | Clave Foránea (FK) a modulos(id). El módulo al que pertenece.                                                    |
| titulo                    | VARCHAR(255) | NOT NULL. Ej: "Lección 1.1: ¿Qué es una variable?".                                                              |
| tipo_contenido            | VARCHAR(50)  | MODIFICADO. NOT NULL. Valores: 'Video', 'Texto', 'Tarea', 'Quiz', 'JuegoInteractivo'.                            |
| contenido                 | TEXT         | NOT NULL. Puede ser un enlace a un video, texto en Markdown o un identificador para cargar el juego interactivo. |
| orden                     | INTEGER      | NOT NULL. Para ordenar las lecciones dentro de un módulo (1, 2, 3...).                                           |
| puntos_por_completar      | INTEGER      | AÑADIDO. DEFAULT 0. Puntos que se otorgan automáticamente al completar la lección.                               |
| logro_desbloqueable_id    | BIGINT       | AÑADIDO. Clave Foránea (FK) a logros(id). NULL. Opcional, si completar esta lección otorga una insignia.         |
| duracion_estimada_minutos | INTEGER      | AÑADIDO. NULL. Útil para mostrar al estudiante cuánto tiempo le tomará la lección.                               |
| activo                    | BOOLEAN      | AÑADIDO. DEFAULT TRUE. Para "publicar" o "despublicar" una lección sin borrarla.                                 |
| created_at                | TIMESTAMPTZ  | AÑADIDO. DEFAULT NOW().                                                                                          |
| updated_at                | TIMESTAMPTZ  | AÑADIDO. DEFAULT NOW().                                                                                          |

### Resumen de los Cambios y Por Qué se Hicieron:

- **tipo_contenido (Modificado):** Hemos añadido el valor 'JuegoInteractivo'. Este es el cambio que habilita tu estrategia "Anti-Matific", permitiendo que la plataforma cargue tus propios juegos como parte del contenido de un curso.

- **puntos_por_completar y logro_desbloqueable_id (Añadidos):** Estos campos son el corazón de la automatización. Ahora, la propia lección contiene las "reglas" de la gamificación. Cuando un estudiante marque una lección como completada, el sistema puede leer estos campos y otorgarle automáticamente los puntos y/o la insignia correspondiente, sin que un profesor tenga que intervenir.

- **duracion_estimada_minutos (Añadido):** Es un detalle de experiencia de usuario (UX) que aporta mucho valor. Permite al estudiante gestionar mejor su tiempo y saber qué esperar de cada lección.

- **activo, created_at, updated_at (Añadidos):** Son campos estándar de buena práctica. activo te da control total sobre la visibilidad del contenido, y los campos de fecha son indispensables para la auditoría y el mantenimiento del sistema a largo plazo.

## 3. Gestión y Comunicaciones

Las tablas administrativas finales que acordamos.

### Tabla: descuentos

| Nombre del Campo | Tipo de Dato  | Restricciones / Notas                                 |
| ---------------- | ------------- | ----------------------------------------------------- |
| id               | BIGSERIAL     | Clave Primaria (PK).                                  |
| codigo           | VARCHAR(50)   | UNIQUE, NOT NULL. Ej: "BIENVENIDA20".                 |
| tipo             | VARCHAR(50)   | NOT NULL. Valores: 'Porcentaje', 'MontoFijo'.         |
| valor            | NUMERIC(10,2) | NOT NULL. Ej: 20.00 (para 20%) o 500.00 (para $500).  |
| fecha_expiracion | DATE          | NULL. Fecha de vencimiento del código.                |
| activo           | BOOLEAN       | DEFAULT TRUE. Para activar o desactivar el descuento. |

### Tabla: notificaciones

| Nombre del Campo | Tipo de Dato | Restricciones / Notas                                  |
| ---------------- | ------------ | ------------------------------------------------------ |
| id               | BIGSERIAL    | Clave Primaria (PK).                                   |
| tutor_id         | UUID         | Clave Foránea (FK) a tutores(id). El destinatario.     |
| tipo             | VARCHAR(100) | NOT NULL. Ej: 'ConfirmacionClase', 'RecordatorioPago'. |
| contenido        | TEXT         | El cuerpo del mensaje enviado.                         |
| fecha_envio      | TIMESTAMPTZ  | DEFAULT NOW().                                         |
| estado           | VARCHAR(50)  | NOT NULL. Valores: 'Enviado', 'Fallido', 'Visto'.      |

### Tabla: alertas_estudiante (Nueva Tabla Propuesta)

| Nombre del Campo           | Tipo de Dato | Restricciones / Notas                                                                                |
| -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| id                         | BIGSERIAL    | Clave Primaria (PK). Identificador único de la alerta.                                               |
| estudiante_id              | UUID         | Clave Foránea (FK) a estudiantes(id). El estudiante que es sujeto de la alerta.                      |
| inscripcion_id             | BIGINT       | Clave Foránea (FK) a inscripciones(id). Contexto: En qué clase se originó la alerta.                 |
| docente_id_reporta         | UUID         | Clave Foránea (FK) a docentes(id). El docente que escribió la observación original.                  |
| admin_asignado_id          | UUID         | Clave Foránea (FK) a administradores(id). Responsable: Quién debe atender la alerta. Puede ser NULL. |
| texto_observacion_original | TEXT         | NOT NULL. El comentario exacto del docente que disparó la alerta.                                    |
| motivo_alerta              | VARCHAR(255) | NOT NULL. Razón de la creación (ej. "Palabra clave negativa detectada", "Reporte manual").           |
| sugerencia_ia              | TEXT         | NULL. Aquí se almacenarán las sugerencias generadas por la IA para el administrador.                 |

---

# Guía Arquitectónica Exhaustiva: Implementación de Mateatletas en el Ecosistema Supabase

## Parte 1: Filosofía y Arquitectura de la Solución

Este documento trasciende una simple guía de base de datos; es el manual estratégico para construir la plataforma Mateatletas como una aplicación moderna, segura y escalable, aprovechando al máximo cada componente del ecosistema Supabase. La elección de Supabase no es casual; se fundamenta en su capacidad para ofrecer una solución integral que reduce la complejidad del desarrollo y acelera la puesta en producción.

### Los Pilares de Supabase en Mateatletas:

- **Database (PostgreSQL):** No es solo un lugar para almacenar datos. Será el cerebro de nuestra lógica de negocio. Utilizaremos su poder no solo para guardar información, sino para automatizar procesos mediante Vistas, Funciones y Triggers, garantizando la integridad y el rendimiento de la plataforma.

- **Auth (Autenticación):** Es el guardián de la identidad. Supabase Auth gestionará de forma segura el registro, inicio de sesión y los roles de cada usuario (Tutor, Estudiante, Docente). Nuestro diseño, que vincula directamente los perfiles de negocio con el ID de autenticación (UUID), es la piedra angular de un sistema de permisos robusto.

- **Storage (Almacenamiento):** Servirá como nuestro sistema de archivos multimedia. Todos los activos visuales que dan vida a la plataforma, como los escudos de los equipos, las insignias de los logros y las imágenes de los cursos, se alojarán aquí de forma segura, con políticas de acceso que impiden el uso no autorizado.

- **Edge Functions (Lógica de Servidor):** Son nuestro backend seguro y escalable. Tareas críticas que no pueden bajo ninguna circunstancia ser expuestas al cliente se ejecutarán aquí. Esto incluye la validación de pagos, la comunicación con APIs de terceros (como la IA) y la ejecución de procesos automáticos complejos, garantizando que la lógica más sensible de tu negocio esté protegida.

## Parte 2: El Plano Maestro - Implementación del Esquema y Seguridad

Esta sección es la guía práctica para construir la estructura de la base de datos y, más importante aún, para fortificarla.

### 2.1. Scripts SQL para la Creación del Esquema Completo

A continuación se encuentran los scripts SQL para crear la totalidad de las tablas con las especificaciones robustas que definimos. Este código puede ser ejecutado directamente en el Editor de SQL de Supabase para levantar la infraestructura completa.

(Nota: Se presentan los scripts en el orden lógico de creación para respetar las dependencias de claves foráneas).

```sql
-- Ejecutar en orden

-- 1. TABLAS DE CONFIGURACIÓN Y CONTENIDO
CREATE TABLE public.rutas_curriculares (...);
CREATE TABLE public.productos (...);
CREATE TABLE public.modulos (...);
CREATE TABLE public.lecciones (...);

-- 2. TABLAS DE USUARIOS
CREATE TABLE public.tutores (...);
CREATE TABLE public.docentes (...);
CREATE TABLE public.equipos (...);
CREATE TABLE public.estudiantes (...);

-- 3. TABLAS DE OPERACIÓN Y TRANSACCIONES
CREATE TABLE public.clases (...);
CREATE TABLE public.inscripciones (...);
CREATE TABLE public.membresias (...);
CREATE TABLE public.inscripciones_cursos (...);

-- 4. TABLAS DE GAMIFICACIÓN
CREATE TABLE public.acciones_puntuables (...);
CREATE TABLE public.logros (...);
CREATE TABLE public.puntos_obtenidos (...);
CREATE TABLE public.logros_obtenidos (...);

-- 5. TABLAS DE CONTENIDO PROPIO (JUEGOS)
CREATE TABLE public.juegos (...);
CREATE TABLE public.intentos_juego (...);

-- 6. TABLAS DE GESTIÓN Y SOPORTE
CREATE TABLE public.descuentos (...);
CREATE TABLE public.notificaciones (...);
CREATE TABLE public.tickets_soporte (...);
CREATE TABLE public.mensajes_ticket (...);

-- 7. TABLAS DE UNIÓN
CREATE TABLE public.docente_especialidades (...);
```

### 2.2. Fortificación del Sistema: Row-Level Security (RLS)

Esto no es opcional; es la base de la seguridad de tu aplicación. Por defecto, una vez que habilites RLS en una tabla, nadie puede acceder a ella hasta que se cree una política que lo permita explícitamente.

**Principio Fundamental:** Por defecto, todo está prohibido.

A continuación, se presentan ejemplos de las políticas RLS críticas que deben ser implementadas para proteger los datos de tus usuarios.

#### Política para tutores: "Un tutor solo puede ver y modificar su propio perfil."

```sql
CREATE POLICY "Tutores pueden ver y modificar su propio perfil"
ON public.tutores FOR ALL
USING ( auth.uid() = id );
```

#### Política para estudiantes: "Un tutor puede ver los perfiles de sus hijos. Un estudiante puede ver su propio perfil."

```sql
CREATE POLICY "Tutores y estudiantes pueden ver perfiles autorizados"
ON public.estudiantes FOR SELECT
USING ( auth.uid() = tutor_id OR auth.uid() = id );
```

#### Política para inscripciones: "Un tutor solo puede crear inscripciones para sus propios hijos."

```sql
CREATE POLICY "Tutores pueden crear inscripciones para sus hijos"
ON public.inscripciones FOR INSERT
WITH CHECK ( (SELECT tutor_id FROM public.estudiantes WHERE id = estudiante_id) = auth.uid() );
```

## Parte 3: El Motor - Lógica Avanzada en la Base de Datos

Para optimizar el rendimiento y centralizar la lógica, crearemos funciones y vistas directamente en PostgreSQL.

### Función de Cálculo de Puntos (calcular_puntos_estudiante):

Crearemos una función que reciba un estudiante_id y devuelva la suma total de sus puntos desde la tabla puntos_obtenidos. Esto evita que el frontend tenga que hacer cálculos pesados.

```sql
CREATE FUNCTION public.calcular_puntos_estudiante(e_id BIGINT)
RETURNS INT AS $$
SELECT SUM(puntos_asignados) FROM public.puntos_obtenidos WHERE estudiante_id = e_id;
$$ LANGUAGE SQL;
```

### Vista de Progreso (vista_progreso_estudiante):

Crearemos una vista que actúe como una "tabla virtual" pre-calculada, uniendo la información del estudiante con su total de puntos y su nivel. Consultar esta vista será increíblemente rápido.

```sql
CREATE VIEW public.vista_progreso_estudiante AS
SELECT
  e.id,
  e.nombre,
  e.apellido,
  public.calcular_puntos_estudiante(e.id) AS total_puntos
  -- (Aquí se añadiría la lógica para determinar el nivel)
FROM public.estudiantes e;
```

## Parte 4: El Sistema Nervioso - API y Flujos de Datos

La API es el contrato que define toda la comunicación. A continuación, se detalla un ejemplo exhaustivo de un recurso.

### Recurso: Inscripciones (Expandido)

#### POST /api/inscripciones

- **Descripción:** Inscribe a un estudiante en una clase. Este endpoint es el guardián de la lógica de negocio.

- **Proceso Interno Detallado:**
  1. Verifica el token JWT para identificar al tutor.
  2. Consulta la membresia del tutor para asegurar que su estado sea 'Activa'.
  3. Obtiene el producto_id de la clase a la que se intenta inscribir.
  4. Consulta el cupo_maximo del producto y lo compara con los cupos_ocupados de la clase.
  5. Solo si todas las validaciones pasan, procede a insertar en la tabla inscripciones.
  6. Ejecuta un trigger que incrementa en 1 el campo cupos_ocupados de la clase.

- **Cuerpo:** `{ "clase_id": 123, "estudiante_id": 456 }`

- **Respuesta Exitosa (JSON):**

```json
{
  "id": 789,
  "clase_id": 123,
  "estudiante_id": 456,
  "fecha_reserva": "2025-10-11T03:00:00Z",
  "estado_reserva": "Confirmada"
}
```

## Parte 5: El Manual de Operaciones - Flujos de Usuario Detallados

Esta sección es el guion paso a paso para el equipo de desarrollo.

### Flujo 3: Asistencia a una Clase y Feedback del Docente (Detallado)

1. **Acción de Usuario:** El docente finaliza la clase y navega a la sección "Mis Clases" en su panel.

2. **Frontend Logic:** La aplicación muestra las clases del día. El docente hace clic en la clase recién terminada.

3. **API Call:** GET /api/clases/123/asistencia

4. **Backend Process:** El servidor consulta la base de datos, obteniendo todos los registros de la tabla inscripciones que coincidan con esa clase_id, y los une con los datos de la tabla estudiantes.

5. **Frontend Response Handling:** La interfaz muestra la lista de alumnos inscritos. Para cada alumno, hay botones para marcar "Asistió" / "Ausente", un campo de texto para observaciones, y un botón "+ Otorgar Puntos".

6. **Acción de Usuario:** El docente marca a "Lucas Pérez" como "Asistió", escribe "Mostró gran perseverancia" y hace clic en "+ Otorgar Puntos".

7. **Frontend Logic:** Se abre un modal que muestra las acciones_puntuables. El docente selecciona "Superación Personal (+5)".

8. **API Calls Secuenciales:**
   - Primero: POST /api/inscripciones/789/feedback con el cuerpo `{ "estado_asistencia": "Asistió", "observaciones_docente": "Mostró gran perseverancia" }`.
   - Segundo: POST /api/puntos con el cuerpo `{ "estudiante_id": 456, "accion_id": 4, "inscripcion_id": 789 }`.

9. **Backend Process:** El servidor procesa ambas solicitudes. La segunda llamada podría activar una notificación al tutor.

10. **Frontend Response Handling:** La interfaz del docente muestra una marca de "Feedback Completo" junto al nombre de Lucas, y el docente pasa al siguiente alumno.

---

# Especificación Exhaustiva de la API de Mateatletas v1.0

## Principios Generales:

- **Tecnología:** API RESTful.
- **Formato de Datos:** JSON para todas las solicitudes y respuestas.
- **Autenticación:** Todas las rutas (excepto las públicas de registro/login) requieren un Token JWT de Supabase válido, enviado en la cabecera `Authorization: Bearer <TOKEN>`.
- **Gestión de Roles:** La autorización (qué puede hacer cada usuario) es impuesta a nivel de base de datos mediante las políticas de Row-Level Security (RLS). La API confía en estas políticas para denegar el acceso no autorizado.

---

## Sección 1: Autenticación y Gestión de Perfiles (/auth, /perfiles)

Esta sección cubre cómo los usuarios entran y gestionan su identidad en la plataforma.

### Endpoint: POST /auth/v1/signup (Registro de Tutor)

- **Descripción:** Registra un nuevo Tutor. Este es un endpoint nativo de Supabase Auth, pero es crucial entender cómo lo usaremos. El proceso crea la identidad en auth.users y, mediante un trigger de base de datos, crea el perfil correspondiente en public.tutores.

- **Acceso:** Público.

- **Cuerpo de la Solicitud:**

| Campo         | Tipo   | Descripción                                                        |
| ------------- | ------ | ------------------------------------------------------------------ |
| email         | string | El correo electrónico del tutor.                                   |
| password      | string | La contraseña (mínimo 6 caracteres).                               |
| data          | object | Objeto con los datos adicionales para el perfil en public.tutores. |
| data.nombre   | string | Nombre del tutor.                                                  |
| data.apellido | string | Apellido del tutor.                                                |
| data.dni      | string | DNI del tutor.                                                     |
| data.telefono | string | Teléfono del tutor.                                                |

- **Respuesta Exitosa (200 OK):** Devuelve el objeto del usuario recién creado y su sesión (incluyendo el token JWT).

- **Respuestas de Error:** 422 Unprocessable Entity (si el email ya existe o la contraseña es débil).

### Endpoint: POST /auth/v1/token?grant_type=password (Inicio de Sesión)

- **Descripción:** Inicia sesión para cualquier rol (Tutor, Estudiante, Docente). Endpoint nativo de Supabase Auth.

- **Acceso:** Público.

- **Cuerpo de la Solicitud:**

| Campo    | Tipo   | Descripción            |
| -------- | ------ | ---------------------- |
| email    | string | El correo del usuario. |
| password | string | La contraseña.         |

- **Respuesta Exitosa (200 OK):** Devuelve el perfil del usuario y su sesión (incluyendo el token JWT).

- **Respuestas de Error:** 400 Bad Request (credenciales incorrectas).

### Endpoint: GET /api/perfiles/me (Obtener Perfil Propio)

- **Descripción:** Obtiene el perfil completo del usuario actualmente logueado (sea Tutor, Estudiante o Docente). La API determina el tipo de usuario y devuelve los datos de la tabla correspondiente.

- **Acceso:** Cualquier usuario autenticado.

- **Respuesta Exitosa (200 OK):** Un objeto JSON con los datos del perfil (ej. de un Tutor).

```json
{
  "id": "uuid-del-tutor",
  "nombre": "Alexis",
  "apellido": "Figueroa",
  "dni": "12345678",
  "email": "alexis@mateatletas.com",
  "ha_completado_onboarding": false,
  "rol": "Tutor"
}
```

---

## Sección 2: Catálogo y Compras (/productos, /membresias, /inscripciones-curso)

Esta sección define cómo los clientes exploran el catálogo de servicios de Mateatletas y cómo inician el proceso de compra de manera segura y predecible.

### Endpoint: GET /api/productos (Listar Productos del Catálogo)

- **Descripción:** Obtiene la lista de todos los productos activos que se pueden comprar. Es la fuente de datos principal para que los tutores vean la oferta comercial de la plataforma.

- **Acceso:** Cualquier usuario autenticado.

- **Parámetros de Query (Opcionales):**
  - **modelo_cobro:** Filtra los productos por su modelo de monetización. Valores: 'PagoUnico', 'Recurrente'.
  - **modelo_servicio:** Filtra los productos por el tipo de servicio ofrecido. Valores: 'CursoFijo', 'AccesoFlexible'.

- **Respuesta Exitosa (200 OK):** Devuelve un array de objetos Producto.

```json
[
  {
    "id": 1,
    "nombre": "Club Mateatletas - Acceso Total",
    "descripcion": "Acceso ilimitado a todas nuestras clases en vivo.",
    "precio_base": "50.00",
    "modelo_cobro": "Recurrente",
    "modelo_servicio": "AccesoFlexible"
  },
  {
    "id": 2,
    "nombre": "Curso de Verano de Robótica",
    "descripcion": "Un curso intensivo de 8 semanas para construir tu primer robot.",
    "precio_base": "120.00",
    "modelo_cobro": "PagoUnico",
    "modelo_servicio": "CursoFijo",
    "fecha_inicio": "2026-01-15",
    "cupo_maximo": 20
  }
]
```

### Endpoint: POST /api/membresias (Iniciar Compra de una Suscripción Recurrente)

- **Descripción:** Inicia el proceso de compra de un producto de tipo suscripción recurrente (ej. Club House) para el tutor logueado. Este endpoint crea un registro en la tabla membresias con estado "Pendiente" y genera una preferencia de pago en Mercado Pago.

- **Acceso:** Exclusivamente Tutores.

- **Cuerpo de la Solicitud:**

| Campo       | Tipo   | Descripción                                                  |
| ----------- | ------ | ------------------------------------------------------------ |
| producto_id | number | El ID del producto de tipo suscripción que se desea comprar. |

- **Proceso Interno Detallado:**
  - El sistema verifica la identidad del tutor a través del token JWT.
  - Valida que el producto_id proporcionado exista y corresponda a un producto con modelo_cobro = 'Recurrente'. Si no, devuelve un error.
  - Crea un nuevo registro en la tabla membresias asociándolo al tutor_id y al producto_id, estableciendo el estado inicial como 'Pendiente'.
  - Se comunica con la API de Mercado Pago para generar una preferencia de pago recurrente.

- **Respuesta Exitosa (200 OK):** Devuelve un objeto JSON que contiene la URL de checkout a la que el frontend debe redirigir al usuario.

```json
{
  "checkout_url": "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=..."
}
```

- **Respuestas de Error Comunes:**
  - 400 Bad Request: Si el producto_id no es de tipo 'Recurrente' o es inválido.
  - 403 Forbidden: Si un usuario que no es Tutor intenta realizar la acción.

### Endpoint: POST /api/inscripciones-curso (Comprar e Inscribir a un Curso de Pago Único)

- **Descripción:** Inicia el proceso de compra de un producto de pago único (ej. Curso de Verano) e inscribe a un estudiante específico. Este endpoint crea un registro en la tabla inscripciones_cursos con estado "Pendiente" y genera una preferencia de pago en Mercado Pago.

- **Acceso:** Exclusivamente Tutores.

- **Cuerpo de la Solicitud:**

| Campo         | Tipo   | Descripción                                            |
| ------------- | ------ | ------------------------------------------------------ |
| producto_id   | number | El ID del producto de tipo curso que se desea comprar. |
| estudiante_id | number | El ID del estudiante que tomará el curso.              |

- **Proceso Interno Detallado:**
  - El sistema verifica la identidad del tutor a través del token JWT.
  - Valida que el producto_id proporcionado exista y corresponda a un producto con modelo_cobro = 'PagoUnico'.
  - Verifica que el estudiante_id proporcionado exista y que su tutor_id coincida con el del tutor que realiza la compra.
  - Crea un nuevo registro en la tabla inscripciones_cursos con los IDs correspondientes y el estado inicial como 'Pendiente'.
  - Se comunica con la API de Mercado Pago para generar una preferencia de pago único.

- **Respuesta Exitosa (200 OK):** Devuelve un objeto JSON que contiene la URL de checkout a la que el frontend debe redirigir al usuario.

```json
{
  "checkout_url": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
}
```

- **Respuestas de Error Comunes:**
  - 400 Bad Request: Si el producto_id no es de tipo 'PagoUnico' o es inválido.
  - 403 Forbidden: Si el estudiante_id no pertenece al tutor que realiza la compra.
  - 409 Conflict: Si el curso ya no tiene cupo disponible.

---

## Sección 3: Operación Académica (/clases, /inscripciones)

El corazón del día a día: el calendario y las reservas.

### Endpoint: GET /api/clases (Obtener Calendario de Clases)

- **Descripción:** Obtiene las clases programadas en un rango de fechas. Es la fuente de datos para el calendario.

- **Acceso:** Tutores, Docentes.

- **Parámetros de Query:**
  - **fecha_desde (requerido):** YYYY-MM-DD
  - **fecha_hasta (requerido):** YYYY-MM-DD

- **Respuesta Exitosa (200 OK):** Un array de objetos Clase.

### Endpoint: POST /api/inscripciones (Inscribir a un Estudiante a una Clase - Solo para Club House)

- **Descripción:** Inscribe a un estudiante en una clase específica, validando que el tutor tenga una membresía de modelo_servicio='AccesoFlexible' activa y que haya cupo.

- **Acceso:** Tutores.

- **Cuerpo de la Solicitud:**

| Campo         | Tipo   | Descripción        |
| ------------- | ------ | ------------------ |
| clase_id      | number | ID de la clase.    |
| estudiante_id | number | ID del estudiante. |

- **Respuesta Exitosa (201 Created):** El objeto de la nueva Inscripcion.

- **Respuestas de Error:** 403 Forbidden (si no tiene membresía activa), 409 Conflict (si la clase no tiene cupo).

---

## Sección 4: Herramientas del Docente y Gamificación (/docentes, /puntos-otorgados)

Endpoints diseñados para el flujo de trabajo del profesorado.

### Endpoint: GET /api/docentes/me/clases (Obtener Agenda del Docente)

- **Descripción:** Obtiene las clases asignadas al docente logueado para un rango de fechas.

- **Acceso:** Docentes.

- **Parámetros de Query:** fecha_desde y fecha_hasta.

- **Respuesta Exitosa (200 OK):** Un array de objetos Clase.

### Endpoint: GET /api/clases/{id}/asistencia (Obtener Lista de Asistencia)

- **Descripción:** Obtiene la lista completa de los estudiantes inscritos en una clase específica, lista para que el docente pase lista y deje feedback.

- **Acceso:** Docente asignado a la clase, Administradores.

- **Respuesta Exitosa (200 OK):** Un array de objetos Inscripcion, cada uno con los datos del Estudiante.

### Endpoint: PATCH /api/inscripciones/{id} (Registrar Feedback de Clase)

- **Descripción:** Actualiza una inscripción para registrar la asistencia y las observaciones del docente.

- **Acceso:** Docente asignado, Administradores.

- **Cuerpo de la Solicitud:**

| Campo                 | Tipo   | Descripción              |
| --------------------- | ------ | ------------------------ |
| estado_asistencia     | string | 'Asistió' o 'Ausente'.   |
| observaciones_docente | string | El feedback cualitativo. |

- **Respuesta Exitosa (200 OK):** El objeto Inscripcion actualizado.

### Endpoint: POST /api/puntos-otorgados (Otorgar Puntos)

- **Descripción:** Registra la obtención de puntos por parte de un estudiante.

- **Acceso:** Docentes, Administradores.

- **Cuerpo de la Solicitud:**

| Campo          | Tipo   | Descripción                                                           |
| -------------- | ------ | --------------------------------------------------------------------- |
| estudiante_id  | number | A quién se le otorgan los puntos.                                     |
| accion_id      | number | El ID de la AccionPuntuable.                                          |
| inscripcion_id | number | (Opcional) El ID de la inscripción si los puntos se ganaron en clase. |

- **Respuesta Exitosa (201 Created):** El nuevo objeto de PuntosObtenidos.

---

## Sección 5: Contenido Interactivo y Automatización (/lecciones)

Endpoints para gestionar tu contenido propio y la gamificación automática.

### Endpoint: POST /api/lecciones/{id}/completar (Marcar Lección como Completada)

- **Descripción:** Endpoint clave para la automatización. Un estudiante notifica al sistema que ha completado una lección o un juego.

- **Acceso:** Estudiantes.

- **Proceso Interno (Edge Function):**
  1. Verifica que el estudiante esté inscrito en el curso al que pertenece la lección.
  2. Busca la lección en la base de datos para obtener puntos_por_completar y logro_desbloqueable_id.
  3. Si puntos_por_completar > 0, crea un nuevo registro en puntos_obtenidos.
  4. Si logro_desbloqueable_id no es nulo, crea un nuevo registro en logros_obtenidos.

- **Respuesta Exitosa (200 OK):** Un objeto que resume las recompensas obtenidas.

```json
{
  "puntos_ganados": 10,
  "logro_desbloqueado": {
    "id": 5,
    "nombre": "Primeros Pasos"
  }
}
```

---

## Sección 6: Gestión y Soporte (Copiloto)

Endpoints diseñados para el panel de control del administrador, permitiendo la gestión proactiva de la salud del ecosistema estudiantil.

### Endpoint: GET /api/alertas (Listar Alertas de Estudiantes)

- **Descripción:** Obtiene una lista de todas las alertas generadas sobre los estudiantes. Es la fuente de datos principal para el dashboard del "Copiloto".

- **Acceso:** Exclusivamente Administradores.

- **Parámetros de Query (Opcionales):**
  - **estado:** Filtra las alertas por su estado actual. Ej: 'Nueva', 'En Revision', 'Resuelta'.
  - **admin_id:** Filtra las alertas asignadas a un administrador específico.

- **Respuesta Exitosa (200 OK):** Devuelve un array de objetos Alerta, incluyendo información clave del estudiante y docente para dar contexto rápido.

```json
[
  {
    "id": 1,
    "estado": "Nueva",
    "motivo_alerta": "Palabra clave negativa detectada",
    "fecha_creacion": "2025-10-11T15:30:00Z",
    "estudiante": {
      "id": "uuid-del-estudiante",
      "nombre_completo": "Lucas Pérez"
    },
    "docente_reporta": {
      "id": "uuid-del-docente",
      "nombre_completo": "Ana Torres"
    }
  }
]
```

### Endpoint: PATCH /api/alertas/{id} (Gestionar una Alerta)

- **Descripción:** Permite a un administrador actualizar el estado de una alerta, asignársela a sí mismo o documentar su resolución.

- **Acceso:** Exclusivamente Administradores.

- **Cuerpo de la Solicitud:**

| Campo             | Tipo   | Descripción                                                             |
| ----------------- | ------ | ----------------------------------------------------------------------- |
| estado            | string | (Opcional) El nuevo estado de la alerta. Ej: 'En Revision', 'Resuelta'. |
| admin_asignado_id | string | (Opcional) El UUID del administrador que se hace cargo de la alerta.    |
| resolucion        | string | (Opcional) Las notas finales sobre cómo se resolvió el caso.            |

- **Respuesta Exitosa (200 OK):** Devuelve el objeto completo de la Alerta actualizado.

---

## Sección 7: Webhooks y Comunicaciones Externas

Endpoints diseñados para recibir notificaciones automáticas de servicios de terceros, permitiendo la automatización de procesos críticos del negocio.

### Endpoint: POST /api/webhooks/mercado-pago (Receptor de Notificaciones de Pago)

- **Descripción:** Este es un endpoint de backend-only que no es llamado por los usuarios, sino por los servidores de Mercado Pago. Su única función es recibir notificaciones sobre eventos de pago (pagos aprobados, rechazados, etc.), validar su autenticidad y actualizar el estado de la compra en la base de datos. Este es un componente crítico para la activación de servicios.

- **Acceso:** Público, pero protegido por un mecanismo de validación de firma.

- **Proceso Interno Detallado (Edge Function):**
  1. El endpoint recibe una notificación de Mercado Pago.
  2. **Validación de Seguridad (CRÍTICO):** El primer paso es verificar la firma (x-signature) enviada en las cabeceras de la solicitud. Esto garantiza que la notificación es genuina de Mercado Pago y no una falsificación. Si la firma no es válida, el proceso se detiene inmediatamente.
  3. Si la firma es válida, se extrae el ID del pago o la suscripción del cuerpo de la notificación.
  4. El sistema utiliza el SDK de Mercado Pago para consultar el estado completo y verificado de esa transacción.
  5. Se busca en la base de datos la membresia o inscripcion_curso que corresponda y que esté en estado 'Pendiente'.
  6. Si el pago fue aprobado (status: 'approved'), se actualiza el estado del registro en nuestra base de datos a 'Activa'.
  7. Se activa el acceso al servicio para el estudiante (esto ahora ocurrirá automáticamente gracias al cambio de estado).
  8. Opcionalmente, se puede disparar una notificación interna (ej. un email de bienvenida) al tutor confirmando la compra.
  9. Finalmente, se devuelve una respuesta 200 OK a Mercado Pago para confirmar que la notificación fue recibida y procesada correctamente.

- **Respuesta Exitosa (al servidor de Mercado Pago):** 204 No Content o 200 OK con cuerpo vacío.

---

## Conclusión Final

Y con esto, hemos completado el círculo. El modelo de datos y la API ahora son:

- **Seguros:** Con un sistema de autenticación unificado.
- **Claros:** Con endpoints de compra específicos y predecibles.
- **Inteligentes:** Con la estructura para un panel "Copiloto" proactivo.
- **Eficientes:** Con un sistema de gamificación optimizado para la velocidad.
- **Comercialmente Viables:** Con un flujo de pago completo y automatizado que garantiza que los clientes reciban lo que compraron al instante.
