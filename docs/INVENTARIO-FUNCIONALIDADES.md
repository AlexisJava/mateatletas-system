# Inventario de Funcionalidades - Mateatletas

## Visión General de la Plataforma

Mateatletas es una plataforma educativa de matemáticas que conecta a cuatro tipos de usuarios: administradores que gestionan todo el sistema, docentes que imparten las clases, tutores que son los padres o responsables de los estudiantes, y los propios estudiantes que aprenden matemáticas. Cada uno tiene su propio portal con funcionalidades específicas, pero todos están interconectados a través de un sistema central de clases, inscripciones y pagos.

El sistema está construido sobre Next.js 15 en el frontend y NestJS en el backend, con una base de datos PostgreSQL manejada por Prisma. La autenticación funciona con JWT almacenado en cookies httpOnly, y cada usuario puede tener múltiples roles simultáneamente.

---

## Portal de Administración

El portal de administración es el centro de control de toda la plataforma. Cuando un administrador inicia sesión, llega a un dashboard que le muestra inmediatamente el estado del sistema con un saludo personalizado según la hora del día y la fecha actual.

En la parte superior del dashboard hay cuatro tarjetas con métricas clave: el total de estudiantes registrados en la plataforma, las inscripciones que están activas en este momento, el monto total en pesos de los pagos que están pendientes de cobro, y los ingresos que se generaron durante el mes actual. Estas métricas se actualizan en tiempo real cada vez que el administrador entra al dashboard.

Debajo de las métricas hay una sección de acciones rápidas que permite al administrador saltar directamente a las tareas más comunes: gestionar las inscripciones para la Colonia 2026, registrar un pago manual cuando un tutor paga en efectivo o transferencia, ver la lista completa de estudiantes, o generar reportes exportables.

Una característica distintiva del sistema es el modelo de Casas inspirado en escuelas de magia. Los estudiantes se agrupan en tres casas según su edad: Casa Quantum para los más pequeños de seis a nueve años, Casa Vertex para los de diez a trece, y Casa Pulsar para los adolescentes de catorce a diecisiete. El dashboard muestra la distribución actual de estudiantes por casa con barras de progreso visuales y porcentajes.

La sección de alertas del sistema muestra notificaciones importantes como pagos pendientes que requieren seguimiento, el estado de las inscripciones de la Colonia 2026, y un indicador verde que confirma que todos los servicios están funcionando correctamente.

Desde el menú lateral, el administrador puede acceder a la gestión de usuarios, que está dividida en dos pestañas. La primera pestaña muestra los tutores, que son los padres de familia que registran a sus hijos. La segunda pestaña muestra el personal del club, que incluye a los docentes y otros administradores. Para cada usuario se puede ver su información completa, gestionar sus roles asignándole múltiples permisos si es necesario, y eliminarlo del sistema. Cuando se elimina un docente que tiene clases asignadas, el sistema no permite la eliminación directa sino que obliga a reasignar esas clases a otro docente primero.

La creación de nuevos usuarios del personal tiene dos formularios separados. Para crear un docente se pide nombre, apellido, email, contraseña opcional que si no se proporciona se genera automáticamente, DNI, teléfono y título profesional. Para crear un administrador el formulario es similar pero sin los campos específicos de docente. Cuando se crea un usuario con contraseña autogenerada, el sistema muestra esa contraseña una única vez para que el administrador la comunique al nuevo usuario.

La página de estudiantes muestra una tabla completa con todos los estudiantes de la plataforma. Se puede filtrar por casa usando pestañas en la parte superior, y hay un buscador que permite encontrar estudiantes por su nombre o por el nombre de su tutor. Cada fila de la tabla muestra el nombre del estudiante con sus iniciales en un avatar coloreado según su casa, su edad, la casa a la que pertenece, su nivel actual en el sistema de gamificación, sus puntos totales acumulados, y los datos de contacto de su tutor.

El dashboard de pagos es donde se configura todo el sistema financiero de la plataforma. El modelo de precios actual tiene tres tiers: Arcade que cuesta treinta mil pesos mensuales e incluye acceso a un mundo asincrónico, Arcade Plus que cuesta sesenta mil pesos e incluye tres mundos asincrónicos, y Pro que cuesta setenta y cinco mil pesos e incluye un mundo asincrónico más un mundo sincrónico con docente en vivo. El sistema también maneja descuentos familiares automáticos: el segundo hermano inscrito recibe un doce por ciento de descuento, y a partir del tercer hermano el descuento sube al veinte por ciento.

Desde el dashboard de pagos el administrador puede ver métricas financieras con gráficos de barras y dona, modificar la configuración de precios dejando un registro de cada cambio con el motivo, ver las inscripciones que están pendientes de pago, y consultar qué estudiantes tienen descuentos familiares aplicados.

La página de inscripciones para la Colonia 2026 permite gestionar todas las inscripciones de la colonia de verano. Cada inscripción tiene un estado que puede ser pendiente cuando se registró pero no pagó, pagado cuando el pago fue confirmado, activo cuando el estudiante ya está participando, o cancelado. Se pueden filtrar las inscripciones por estado y por tier, buscar por nombre de estudiante o tutor, y cambiar el estado de cada inscripción individualmente. Las estadísticas en la parte superior muestran cuántas inscripciones hay en total, cuántas están pendientes, pagadas o activas, y el monto total de ingresos generados.

La página de credenciales es una herramienta administrativa para ver y gestionar las contraseñas temporales de todos los usuarios. Muestra una tabla unificada de tutores, estudiantes y docentes con su usuario, su contraseña temporal si todavía no la cambió, y el estado que indica si ya estableció su propia contraseña. El administrador puede mostrar u ocultar las contraseñas, copiarlas al portapapeles, resetear la contraseña de cualquier usuario generando una nueva temporal, y exportar toda la lista a Excel, CSV o PDF.

---

## Portal de Docentes

El portal de docentes está diseñado para que los profesores puedan gestionar sus clases y hacer seguimiento de sus estudiantes de manera eficiente. Cuando un docente inicia sesión, llega a un dashboard que le muestra inmediatamente lo más importante: sus clases del día.

La sección de clases de hoy ocupa un lugar prominente en el dashboard. Para cada clase programada para el día actual se muestra el nombre de la clase, el horario de inicio y fin, la cantidad de estudiantes inscriptos, y la lista completa de nombres de esos estudiantes. Hay un botón que lleva directamente al detalle del grupo para preparar la clase.

Debajo de las clases del día hay una grilla con todos los grupos que tiene asignados el docente. Cada tarjeta de grupo muestra el nombre, el día de la semana y horario en que se dicta, y la capacidad actual comparada con el cupo máximo. Al hacer clic en cualquier grupo se accede a su página de detalle donde se puede ver la lista completa de estudiantes y acceder a funciones específicas.

El calendario del docente ofrece una vista mensual completa con navegación entre meses. Los días se muestran en una grilla de siete columnas para cada día de la semana, y el día actual está resaltado con un badge amarillo. En la parte superior hay estadísticas rápidas que muestran cuántas clases tiene programadas en el mes, el total de estudiantes a su cargo, y las tareas pendientes. Actualmente el calendario muestra la estructura visual pero todavía no está conectado al endpoint que trae las clases reales del mes, así que los eventos no aparecen en los días correspondientes.

La página de observaciones y estadísticas es donde el docente puede hacer seguimiento detallado de sus estudiantes. Hay un buscador que filtra por nombre de estudiante, contenido de observaciones o nombre de ruta curricular, y filtros de fecha para acotar el período. Las estadísticas generales muestran el total de observaciones registradas, cuántos estudiantes estuvieron presentes y ausentes, y el porcentaje de asistencia calculado.

Lo más valioso de esta página son los datos reales que vienen del backend: una lista de los estudiantes con más puntos acumulados, los estudiantes que tienen asistencia perfecta sin ninguna falta, los estudiantes que no entregaron tareas y necesitan seguimiento, y un ranking de los grupos ordenados por puntos totales. También hay una sección de estudiantes con faltas consecutivas que muestra cuántas faltas seguidas tiene cada uno, en qué grupo fue la última falta, y el email del tutor para poder contactarlo.

La página de perfil permite al docente ver y editar su información personal: nombre, apellido, teléfono, título profesional y biografía. Los cambios se guardan en el backend y se muestra un mensaje de confirmación.

Cuando el docente entra a una clase en vivo, accede a la sala de clase virtual donde puede ver la información de la clase y tiene un botón para ir al registro de asistencia. La página de asistencia es fundamental para el funcionamiento diario: muestra la lista completa de estudiantes inscriptos en esa clase y permite marcar a cada uno como presente, ausente, con falta justificada o con tardanza. También se pueden asignar puntos por asistencia y agregar observaciones individuales. Las estadísticas se actualizan en tiempo real mientras el docente va marcando.

---

## Portal de Tutores

El portal de tutores está pensado para que los padres de familia puedan gestionar la educación matemática de sus hijos de manera simple. Cuando un tutor inicia sesión, llega a un dashboard unificado que tiene cinco pestañas: Inicio, Mis Hijos, Calendario, Pagos y Ayuda.

La pestaña de Inicio muestra un saludo personalizado con la fecha actual y, si hay alertas críticas como pagos vencidos o clases canceladas, aparecen destacadas en rojo para que el tutor las vea inmediatamente. La información se carga desde un endpoint del backend que devuelve un resumen con métricas generales, alertas pendientes, pagos por pagar y las clases programadas para el día.

La pestaña de Mis Hijos muestra la lista de todos los estudiantes que el tutor tiene registrados. Desde aquí puede ver el progreso de cada hijo, su nivel actual, los puntos que acumuló, y la casa a la que pertenece.

La pestaña de Calendario muestra las clases programadas para los hijos del tutor, permitiendo tener una visión clara de cuándo son las próximas clases y qué actividades están pendientes.

La pestaña de Pagos es donde el tutor puede ver el estado de sus pagos: cuáles están pendientes, cuáles ya fueron confirmados, y el historial completo de transacciones. Si tiene descuentos familiares por tener múltiples hijos inscriptos, también aparecen reflejados aquí.

En el header del dashboard hay un menú de usuario que muestra el nombre del tutor y permite cerrar sesión. Si hay alertas pendientes, aparece un icono de campana con un número indicando cuántas son.

Fuera del dashboard principal, el tutor puede acceder a la página de clases disponibles que muestra todas las clases que están abiertas para inscripción. Las clases se pueden filtrar por ruta curricular, y cada una muestra información sobre el horario, el docente, y cuántos lugares quedan disponibles. Cuando el tutor quiere reservar una clase, se abre un modal donde debe seleccionar para cuál de sus hijos quiere hacer la reserva.

La página de gestión de estudiantes permite al tutor administrar la información de sus hijos. Puede agregar un nuevo estudiante completando un formulario con sus datos, editar la información de estudiantes existentes, ver el detalle completo de cada uno, o eliminarlos si ya no van a participar. Hay filtros por nivel escolar y por casa para encontrar rápidamente a un estudiante específico cuando se tienen varios hijos.

La sección de membresía tiene dos páginas: una para ver los planes disponibles con sus precios y beneficios, y otra que muestra la confirmación después de realizar un pago, indicando si fue exitoso o si quedó pendiente de verificación.

---

## Portal de Estudiantes

El portal de estudiantes está actualmente en construcción. Cuando un estudiante inicia sesión, ve únicamente una página placeholder que muestra su nombre, un mensaje indicando que el nuevo frontend está siendo desarrollado, y un botón para cerrar sesión. No hay ninguna funcionalidad activa todavía.

Según los comentarios en el código, el portal de estudiantes se está construyendo en un repositorio separado, probablemente con un enfoque más gamificado y orientado a la experiencia de aprendizaje interactivo.

---

## Cómo se Conectan los Portales

La conexión entre los cuatro portales ocurre a través de entidades compartidas en la base de datos y flujos de trabajo que involucran a múltiples roles.

Cuando un administrador crea un nuevo docente desde el portal de administración, ese docente puede inmediatamente iniciar sesión en el portal de docentes con las credenciales generadas. El administrador puede ver la contraseña temporal en la página de credenciales para comunicársela.

Cuando un tutor se registra en la plataforma y agrega a sus hijos como estudiantes, esos estudiantes aparecen automáticamente en el portal de administración dentro de la lista de estudiantes, asignados a una casa según su edad. El administrador puede ver qué tutor es responsable de cada estudiante.

Cuando un docente es asignado a un grupo por el administrador, ese grupo aparece en el dashboard del docente con todos los estudiantes inscriptos. El docente puede entonces tomar asistencia, y esas observaciones quedan registradas en el sistema para que el administrador pueda ver estadísticas globales.

Cuando un tutor reserva una clase para su hijo desde el portal de tutores, esa reserva aparece en el sistema y el estudiante queda inscripto en el grupo correspondiente. El docente de ese grupo verá al nuevo estudiante en su lista la próxima vez que entre al dashboard.

Los pagos funcionan de manera similar: cuando un tutor tiene un pago pendiente, aparece como alerta en su dashboard de tutor. El administrador puede ver ese mismo pago pendiente en el dashboard de pagos del portal de administración. Si el tutor paga por transferencia, el administrador puede registrar el pago manual y el estado se actualiza en ambos portales.

El sistema de casas conecta a los estudiantes con sus pares de edad similar. Cuando el administrador ve la distribución por casas, está viendo a todos los estudiantes agrupados automáticamente según su edad. Los docentes pueden usar esta información para adaptar sus clases al nivel de cada casa.

Las credenciales temporales son otro punto de conexión: el administrador genera o resetea contraseñas que los otros usuarios utilizan para acceder a sus respectivos portales. El estado de si cambiaron su contraseña o no es visible para el administrador en la página de credenciales.

---

## Funcionalidades Pendientes y Problemas Conocidos

Hay varias rutas en el código que se referencian pero no existen. La más problemática es la ruta de mis clases en el portal de docentes: cuando un docente termina de tomar asistencia y quiere volver a ver sus clases, el sistema intenta llevarlo a una página que no existe. Lo mismo ocurre con el gimnasio de estudiantes que se referencia desde la sala de clases pero no tiene página, y con las rutas de cursos online y registro que aparecen en los componentes de precios.

La página de inscripciones para la Colonia 2026 está completamente construida visualmente pero usa datos de prueba en lugar de conectarse al backend real. Funciona para demostración pero no refleja inscripciones reales.

El calendario del docente tiene toda la interfaz lista con navegación entre meses y la grilla de días, pero los eventos no se cargan porque falta implementar el endpoint del backend que traiga las clases del mes.

El portal de estudiantes no tiene ninguna funcionalidad implementada. Es la pieza faltante más grande del sistema y probablemente la más importante para la experiencia de usuario final, ya que los estudiantes son quienes realmente van a aprender matemáticas en la plataforma.

No existe un middleware de Next.js para proteger las rutas a nivel de servidor, lo que significa que toda la protección de acceso ocurre en el cliente después de que la página carga. Esto puede causar que contenido protegido se vea brevemente antes de que el usuario sea redirigido al login.

---

## Modelo de Datos Subyacente

El sistema maneja varias entidades principales que se relacionan entre sí. Los usuarios pueden ser de tipo administrador, docente, tutor o estudiante, y un mismo usuario puede tener múltiples roles. Los tutores están relacionados con estudiantes en una relación de uno a muchos, ya que un tutor puede tener varios hijos.

Los estudiantes pertenecen a una casa según su edad y pueden estar inscriptos en múltiples grupos de clases. Cada grupo tiene un docente asignado, un horario semanal, y un cupo máximo de estudiantes.

Las clases son instancias específicas de los grupos en fechas particulares. Cuando un docente toma asistencia, crea registros de asistencia vinculados a la clase y a cada estudiante, con estado de presente, ausente, justificado o tardanza, puntos asignados, y observaciones.

Los pagos están vinculados a inscripciones mensuales que relacionan a un estudiante con un tier de servicio para un período específico. El sistema calcula automáticamente los descuentos familiares cuando detecta que un tutor tiene múltiples hijos inscriptos.

Las rutas curriculares definen el contenido educativo y están organizadas en mundos que contienen niveles y ejercicios. Las clases se vinculan a rutas curriculares específicas para que el sistema sepa qué contenido se va a enseñar.
