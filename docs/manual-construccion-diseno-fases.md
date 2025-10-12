# Manual de Construcción y Diseño por Fases: Mateatletas

**Documento Maestro:** Este documento sirve como la guía de ejecución definitiva para el diseño y desarrollo de la plataforma Mateatletas. Se divide en 4 fases, cada una con sus propios objetivos, alcance y especificaciones de diseño detalladas. Todas las fases se construirán utilizando el Manual de Marca y Sistema de Diseño v1.0 que hemos validado.

---

# FASE 1: "El Nuevo Centro de Mando" (Lanzamiento para la Comunidad Actual)

## 1. Objetivo Estratégico

El objetivo de esta fase es migrar a la comunidad existente de ~150 estudiantes a la nueva plataforma. Se debe reemplazar por completo el sistema "arcaico" (links por WhatsApp, grabaciones por correo) por una experiencia centralizada, funcional y motivadora. El éxito de esta fase se mide por la adopción exitosa y la mejora tangible en la experiencia del estudiante actual.

## 2. Alcance del Diseño y Ecosistemas

El foco de esta fase es 100% el Ecosistema del Estudiante. No se diseñarán interfaces para Tutores, Docentes o Administradores.

## 3. Pantallas a Diseñar y Construir

1. **Pantalla de Login:** Una pantalla simple pero coherente con la nueva identidad visual.

2. **Flujo de Onboarding para Veteranos:** Una secuencia única para el primer inicio de sesión de los estudiantes actuales, que incluye la "Sincronización de Legado" para validar su progreso del año.

3. **El Dashboard del Estudiante (La Pantalla Principal):** El nuevo centro de mando, diseñado con la cuadrícula modular 2x2.

4. **La Interfaz del Tutor IA:** La pantalla a la que se accede al presionar "¡VAMOS!".

5. **La Interfaz de la "Sala de Espera" de la Clase en Vivo:** La pantalla a la que se accede al presionar "¡A LA ARENA!".

## 4. Componentes Clave del Sistema de Diseño a Utilizar

Para construir estas pantallas, se utilizarán exclusivamente los componentes definidos en nuestro Manual de Marca y Sistema de Diseño v1.0.

- **Tipografía:** Lilita One para todos los títulos y elementos de UI, con su contorno negro característico. GeistSans para el texto de cuerpo.

- **Contenedores:** Todas las tarjetas y paneles seguirán la Regla de Contenedor Unificado (borde grueso y oscuro del color de la tarjeta, con una sombra dura negra debajo).

- **Botones:** Se utilizará la Familia de Botones "Interruptor de Energía", respetando la jerarquía de colores: Naranja (Primario), Azul (Secundario), etc.

- **Barras de Progreso:** Se implementará el diseño de la "Barra de Energía" Oficial (contenedor oscuro, relleno amarillo vibrante) para todo el seguimiento de XP y niveles.

## 5. Flujo de Usuario Detallado (User Journey) para la Fase 1

Esta es la narrativa paso a paso de la experiencia de un estudiante actual:

1. **El Acceso:** Alex, un estudiante veterano, recibe las nuevas credenciales o instrucciones para usar las actuales en la nueva URL. Ingresa a la Pantalla de Login, que ahora tiene un fondo vibrante y el logo de Mateatletas con la tipografía Lilita One.

2. **La Sincronización:** Tras el primer login exitoso, no ve el dashboard. En su lugar, se activa una animación a pantalla completa. Ve su progreso del año (puntos, logros) ser "absorbido" por la nueva interfaz, quizás como gemas y energía volando hacia su perfil. Un mensaje en pantalla dice: "¡BIENVENIDO DE VUELTA, ALEX! PREPÁRATE PARA LA SIGUIENTE TEMPORADA."

3. **El Aterrizaje - El Dashboard:** La animación termina y Alex aterriza en su Dashboard del Estudiante.
   - **Primer Vistazo (Cabecera):** Inmediatamente ve su nombre, su equipo "Fénix", y la "Barra de Energía" que no está en cero, sino que ya refleja su progreso migrado (ej. Nivel 7, 2450/3000 pts). Siente que su esfuerzo ha sido reconocido.
   - **El Foco (Cuadrícula 2x2):**
     - **Arriba a la Izquierda:** Su atención se dirige a la consola del "Portal de Competición". Es la más llamativa. Ve que su próxima clase es hoy y el botón "¡A LA ARENA!" (nuestro "Interruptor de Energía" primario en color Turquesa) está activo y pulsando sutilmente.
     - **Arriba a la Derecha:** Ve la consola de "Inicio de Circuito" con el botón "¡VAMOS!" (nuestro "Interruptor de Energía" secundario en Naranja), invitándolo a un desafío asíncrono.
     - **Abajo a la Izquierda:** Echa un vistazo al "Mapa de Ruta Semanal" y confirma sus clases de los próximos días. Ya no tiene que preguntar por WhatsApp.
     - **Abajo a la Derecha:** Explora la "Bóveda de Trofeos" y ve sus gemas/logros del año, ahora presentados en un formato 3D coleccionable.

4. **La Acción Principal:** Faltan 5 minutos para su clase. Alex hace clic en el interruptor "¡A LA ARENA!". El botón se hunde con un "CLUNK" satisfactorio, la consola del portal emite un destello, y es transportado a la Sala de Espera de la Clase en Vivo.

5. **La Acción Secundaria:** Más tarde ese día, vuelve al dashboard. Ya no hay una clase inminente. Ahora, el botón "¡VAMOS!" de la consola de "Inicio de Circuito" es lo que más le llama la atención. Lo presiona y es llevado a la Interfaz del Tutor IA para su desafío diario.

## 6. Especificaciones de Animación y "Alma"

- **Entrada de Componentes:** Todas las consolas del dashboard aparecen en pantalla con la animación bounceIn (cubic-bezier(0.68, -0.55, 0.265, 1.55)) para darles una sensación de peso y presencia.

- **Feedback Interactivo:** Cada botón y tarjeta reacciona al hover con elevación y brillo, y al click con una animación de "hundimiento" y efectos de partículas, haciendo que la interfaz se sienta viva y reactiva.

- **Sonido:** Se debe implementar un sistema de efectos de sonido cortos y satisfactorios para las interacciones clave: un "CLUNK" al presionar botones, un "SHING" al ganar un logro, un "ZUMBIDO" de energía al hacer hover sobre el portal.

---

# FASE 2: "El Evento Masivo" (Gran Torneo Anual - Diciembre 2025)

## 1. Objetivo Estratégico

El objetivo de esta fase es doble:

1. **Validación Comercial:** Probar el flujo completo de PagoUnico (pago único) a través de Mercado Pago, desde la venta hasta la confirmación, para un público masivo y nuevo.

2. **Prueba de Carga:** Someter la infraestructura a un evento de alta concurrencia para medir la escalabilidad del sistema de registro y acceso.

El éxito se mide por la cantidad de inscripciones exitosas, la ausencia de fricción en el proceso de pago y el engagement generado en la etapa pre-torneo.

## 2. Alcance del Diseño y Ecosistemas

Esta fase se centra en la creación del Ecosistema del Cliente Potencial. Diseñaremos la experiencia completa para un usuario que no conoce Mateatletas y decide inscribir a uno o más estudiantes en el torneo. También diseñaremos una versión limitada del Ecosistema del Estudiante ("La Sala de Espera") para gestionar la experiencia post-compra y pre-evento.

**Fuera de Alcance para esta Fase:** El dashboard completo del estudiante, paneles de tutor/docente/admin.

## 3. Pantallas a Diseñar y Construir

1. **Página de Ventas (Landing Page) del Torneo:** La cara visible del evento.

2. **Flujo de Inscripción y Pago:** La secuencia de pasos desde que el usuario decide comprar hasta que el pago es exitoso. Debe soportar inscripciones individuales y grupales.

3. **Modal de Confirmación:** La celebración post-compra.

4. **La "Sala de Espera" del Evento:** El hub de los participantes antes del inicio del torneo.

## 4. Componentes Clave del Sistema de Diseño a Utilizar

Todas las pantallas se construirán adhiriéndose estrictamente a las reglas de nuestro Manual de Marca y Sistema de Diseño v1.0.

- **Tipografía:** Lilita One con contorno negro para todos los títulos y llamadas a la acción.

- **Contenedores:** El estilo de contenedor unificado (borde grueso y oscuro, sombra "chunky") se aplicará a todos los formularios, tarjetas de información y modales.

- **Botones:** La Familia de Botones "Interruptor de Energía" será la única utilizada, respetando la jerarquía: Naranja para acciones primarias, Azul para secundarias, etc.

- **Estética General:** Se mantendrá la sensación de "Energía Táctil" y "Tecno-Jungla", con elementos 3D, texturas y animaciones de rebote.

## 5. Flujo de Usuario Detallado (User Journey) para la Fase 2

Esta es la experiencia de Laura, una madre que descubre el torneo y decide inscribir a su hijo Leo y a su sobrina.

1. **El Descubrimiento:** Laura ve un anuncio en redes sociales y aterriza en la Página de Ventas del Torneo.
   - **Diseño de la Pantalla:** No es una página corporativa. Es una explosión de energía. Un banner principal con una ilustración 3D de una de las "arenas" del torneo. El título, en Lilita One gigante, dice: "GRAN TORNEO MATEATLETAS: ¡LA COMPETENCIA MÁS DIVERTIDA DEL AÑO!". La página utiliza tarjetas con nuestro estilo "chunky" para explicar las reglas, los premios y las fechas. El botón principal de ¡INSCRIBIRME AHORA! es nuestro "Interruptor de Energía" Naranja, grande y prominente.

2. **El Inicio de la Inscripción:** Laura presiona ¡INSCRIBIRME AHORA!. No es enviada a un formulario aburrido. Aparece un Modal a pantalla completa que pregunta:
   - **Título:** "¿A CUÁNTOS ATLETAS VAS A INSCRIBIR?"
   - **Opciones:** Dos grandes botones "Interruptor de Energía".
     - Uno (Naranja): "UNO SOLO"
     - Otro (Azul): "UN EQUIPO (2 o más)"
   - Laura selecciona "UN EQUIPO".

3. **El Formulario de Inscripción Grupal:** Es transportada a una página de formulario que sigue nuestro estilo.
   - **Diseño de la Pantalla:** La página tiene un título claro: "REGISTRO DE EQUIPO".
   - **Sección 1:** "Datos del Tutor": Un formulario simple para los datos de Laura (nombre, email).
   - **Sección 2:** "Atletas del Equipo": Aquí está la clave. Hay una tarjeta inicial para el primer atleta (nombre, edad). Debajo, un botón + AÑADIR OTRO ATLETA. Al presionarlo, una nueva tarjeta de atleta aparece con una animación bounceIn. Laura añade los datos de Leo y luego los de su sobrina.
   - **Resumen Flotante:** Una tarjeta en el lateral de la pantalla se actualiza en tiempo real: "Total: 2 Atletas | Costo: $XX.XX".
   - **Botón Final:** Al final del formulario, un gran "Interruptor de Energía" Naranja dice "IR AL PAGO".

4. **La Confirmación y Celebración:** Tras completar el pago con Mercado Pago, Laura es redirigida a una página de éxito.
   - **Diseño de la Pantalla:** En lugar de un simple "Gracias", la pantalla explota con confeti digital. Aparece nuestro Modal de Logro Desbloqueado, pero con un texto personalizado:
     - **Título:** "¡EQUIPO INSCRITO!"
     - **Mensaje:** "¡Genial! Leo y su compañera están listos para la competencia. ¡Nos vemos en la arena!"
     - **Botón:** Un "Interruptor de Energía" Morado que dice "IR A LA SALA DE ESPERA".

5. **El Engagement: La Sala de Espera:** Al hacer clic, Laura es llevada a la Sala de Espera del Evento.
   - **Diseño de la Pantalla:** Es una página inmersiva, no un dashboard. El fondo es una ilustración de la entrada al estadio del torneo.
   - **Elemento Central:** Un Contador Regresivo Gigante con el estilo "chunky" y la tipografía Lilita One, mostrando los días, horas, minutos y segundos que faltan para el evento.
   - **Contenido Adicional:** Para mantener el engagement, hay pequeñas consolas (siguiendo nuestro estilo de tarjeta) con títulos como:
     - **"CIRCUITO DE CALENTAMIENTO":** Un mini-juego simple para practicar.
     - **"CONOCE LAS ARENAS":** Un carrusel de imágenes de los escenarios del torneo.
     - **"REGLAMENTO OFICIAL":** Las reglas del torneo presentadas de forma divertida y visual.

---

# FASE 3: "La Prueba Comercial" (Colonia de Verano - Verano 2026)

## 1. Objetivo Estratégico

El objetivo es validar el modelo comercial completo para productos de duración fija (ej. un curso de 8 semanas). Esto implica probar todo el ciclo de vida del cliente: la compra por parte del tutor, la experiencia de aprendizaje del estudiante a lo largo del tiempo, y la percepción de valor del tutor a través de herramientas de seguimiento de progreso. El éxito se mide por la tasa de conversión, el porcentaje de finalización del curso por parte de los estudiantes y la satisfacción del tutor.

## 2. Alcance del Diseño y Ecosistemas

Esta fase expande drásticamente el alcance, involucrando tres ecosistemas:

1. **Ecosistema del Cliente Potencial:** Adaptación del embudo de ventas de la Fase 2 para un producto de tipo "Curso".

2. **Ecosistema del Estudiante:** Diseño de la experiencia de aprendizaje dentro del curso, incluyendo la navegación por módulos y la interacción con las lecciones.

3. **Ecosistema del Tutor (¡NUEVO!):** Creación de un primer panel de control simple para que los padres/tutores puedan ver el progreso de sus hijos en el curso adquirido.

## 3. Pantallas a Diseñar y Construir

1. **Página de Ventas de la "Colonia de Verano":** Una landing page temática que explica el temario, la duración y los objetivos del curso.

2. **Dashboard del Estudiante (Versión "En Curso"):** Una evolución del dashboard de Fase 1 que ahora incluye un punto de entrada prominente al curso activo.

3. **El "Mapa del Circuito" (Vista de Módulos y Lecciones):** La pantalla principal dentro del curso, que visualiza el camino de aprendizaje.

4. **Vista de Lección:** La pantalla donde el estudiante consume el contenido (video, juego, texto).

5. **Dashboard del Tutor (v1.0):** El primer panel de control para padres, enfocado exclusivamente en el seguimiento del curso.

## 4. Componentes Clave del Sistema de Diseño a Utilizar

La consistencia es la ley. Todas las nuevas pantallas y ecosistemas se construirán utilizando exclusivamente las reglas de nuestro Manual de Marca y Sistema de Diseño v1.0.

- **Contenedores y Sombras:** Todas las tarjetas, tanto en la vista del estudiante como en la del tutor, seguirán la Regla de Contenedor Unificado (borde grueso y oscuro, sombra "chunky").

- **Tipografía y Botones:** Lilita One con contorno negro para todos los títulos y la Familia de Botones "Interruptor de Energía" para todas las acciones, garantizando una experiencia de usuario predecible y coherente.

- **Elementos de Progreso:** La "Barra de Energía" Oficial y las "Gemas" 3D serán los únicos indicadores de progreso y logros, tanto para el estudiante como para el tutor.

## 5. Flujo de Usuario Detallado (User Journey) para la Fase 3

Esta es la historia de cómo Laura y su hijo Leo experimentan la "Colonia de Verano de Robótica".

1. **La Compra (Laura):** Laura aterriza en la Página de Ventas de la Colonia de Verano. La página es vibrante, llena de ilustraciones 3D de robots y circuitos con nuestro estilo "Crash". El temario no es una lista aburrida, sino un "mapa de misiones" que muestra los proyectos que construirán. Utiliza el flujo de inscripción de la Fase 2 para comprar el curso para Leo.

2. **La Nueva Misión (Leo):** Leo inicia sesión en su dashboard. La estructura 2x2 es familiar, pero hay un cambio importante. La consola del "Portal de Competición" (arriba a la izquierda) ha sido reemplazada por una nueva consola, aún más grande y llamativa:
   - **Título:** "MISIÓN ACTIVA: COLONIA DE ROBÓTICA".
   - **Diseño:** Muestra un holograma 3D del robot que están construyendo en el curso.
   - **Progreso:** Incluye una mini "Barra de Energía" que muestra su progreso general en el curso (ej. "15% completado").
   - **Botón:** Un gran "Interruptor de Energía" Naranja que dice "CONTINUAR CIRCUITO".

3. **El Mapa del Circuito (Leo):** Al presionar el botón, Leo es transportado al corazón del curso. No ve una lista de lecciones. Ve un "Mapa del Circuito de Robótica".
   - **Diseño de la Pantalla:** Es un camino 3D que serpentea a través de un taller tecnológico-selvático. Cada "punto de control" en el camino es una lección.
   - **Estados Visuales:**
     1. **Lecciones Completadas:** Son puntos de control que brillan con un aura verde y tienen una marca de "check".
     2. **Próxima Lección:** Es el siguiente punto en el camino y está pulsando con una luz naranja, invitándolo a hacer clic.
     3. **Lecciones Bloqueadas:** Son puntos de control más adelante en el camino, representados como cajas o puertas con un candado, esperando ser desbloqueados.

4. **La Lección (Leo):** Leo hace clic en la próxima lección. Se abre la Vista de Lección.
   - **Diseño de la Pantalla:** Un modal o una vista a pantalla completa que mantiene la inmersión. Si es un video, se reproduce en un "monitor holográfico". Si es un juego, ocupa toda la pantalla.
   - **Finalización:** Al completar la lección, la pantalla explota con la animación del Modal de Logro Desbloqueado, mostrando la "Neuro-Energía" (XP) ganada y cualquier "Gema" obtenida. Luego, es devuelto al "Mapa del Circuito", donde ve que el camino luminoso ha avanzado un paso más.

5. **El Seguimiento del Valor (Laura - ¡NUEVO!):** Laura quiere saber si su inversión está valiendo la pena. Inicia sesión con su propia cuenta y accede al Dashboard del Tutor v1.0.
   - **Diseño de la Pantalla:** Es extremadamente simple y directo. No hay gamificación para ella, solo claridad.
   - **Contenido:** Ve una única y gran tarjeta con nuestro estilo "chunky" que dice "Progreso de Leo en: Colonia de Robótica". Dentro de esta tarjeta hay tres elementos clave:
     1. Una gran "Barra de Energía" oficial que muestra el progreso total de Leo en el curso: "Lección 8 de 30 completada".
     2. Una sección de "Últimos Trofeos Ganados" que muestra las últimas 3-4 gemas que Leo ha conseguido.
     3. Un mensaje de estado simple y positivo: "¡Leo está avanzando a un gran ritmo!".

---

# FASE 4: "La Plataforma Total" (Lanzamiento del Club House - Marzo 2026)

## 1. Objetivo Estratégico

Esta es la culminación del proyecto: el lanzamiento del modelo de negocio principal de Mateatletas, la suscripción mensual "all-you-can-learn". El objetivo es establecer la plataforma como un servicio continuo, flexible y de alto valor, moviéndonos de la venta de productos individuales a la gestión de membresías activas. El éxito se medirá por el número de suscriptores activos, la frecuencia de reserva de clases y la retención de clientes a largo plazo.

## 2. Alcance del Diseño y Ecosistemas

Esta fase implica la construcción o expansión de todos los ecosistemas para soportar el modelo de suscripción:

1. **Ecosistema del Tutor:** Se transforma de un simple panel de seguimiento a un centro de gestión completo para la membresía familiar y la reserva de clases.

2. **Ecosistema del Estudiante:** El dashboard evoluciona para integrar la nueva dinámica de clases flexibles.

3. **Ecosistema del Docente (¡NUEVO!):** Se construye desde cero el panel de control para que los profesores gestionen sus clases y proporcionen feedback a los estudiantes.

4. **Ecosistema del Administrador (¡NUEVO!):** Se implementa la primera versión del panel "Copiloto", enfocado en la gestión proactiva de la salud del ecosistema estudiantil.

## 3. Pantallas a Diseñar y Construir

1. **Página de Ventas del "Club House":** Una landing page permanente para el modelo de suscripción.

2. **Dashboard del Tutor v2.0 (Panel de Gestión Familiar):**
   - Vista principal con el estado de la membresía ("Activa", "Atrasada").
   - Gestión de la suscripción y facturación.
   - Selector de perfiles de hijos para gestionar sus agendas.

3. **El Calendario de Clases Flexibles (¡NUEVO y CRÍTICO!):** La interfaz principal para que los tutores exploren y reserven clases.

4. **Modal/Flujo de Reserva de Clase:** El proceso paso a paso para confirmar un lugar en una clase.

5. **Dashboard del Estudiante v3.0 (Modo Club House):** El dashboard se actualiza para mostrar la "próxima clase reservada" como la acción principal.

6. **Panel del Docente v1.0:**
   - Vista de "Mi Agenda" con sus próximas clases.
   - Vista de "Lista de Asistencia" para una clase específica.
   - Interfaz de Feedback para registrar asistencia, dejar observaciones y otorgar "Gemas" (puntos/logros) a los estudiantes.

7. **Panel del Administrador "Copiloto" v1.0:**
   - Dashboard principal con una lista de "Alertas de Estudiantes" generadas automáticamente.
   - Vista de detalle de una alerta, con el historial del estudiante y las sugerencias de la IA.

## 4. Componentes Clave del Sistema de Diseño a Utilizar

La consistencia de la marca a través de todos los ecosistemas es fundamental. A pesar de que los paneles de Docente y Admin son más funcionales, deben heredar la estética de "Energía Táctil" de nuestro Manual de Marca y Sistema de Diseño v1.0.

- **Contenedores y Sombras:** Incluso las tablas y listas de los paneles de gestión usarán el estilo de contenedor unificado y las sombras "chunky" para sentirse parte del mismo universo.

- **Tipografía y Botones:** Lilita One se usará para todos los títulos, y la Familia de Botones "Interruptor de Energía" para todas las acciones, garantizando una experiencia coherente sin importar el rol del usuario.

- **Adaptación de Estilo:** Para los paneles más "serios", se podrá reducir la cantidad de ilustraciones y texturas, pero se mantendrá la paleta de colores, la tipografía, las sombras y el diseño de los botones para no romper la identidad de la marca.

## 5. Flujos de Usuario Detallados (User Journeys) para la Fase 4

Esta fase conecta las experiencias de todos los roles.

1. **El Flujo de Valor (Laura, la Tutora):** Laura, satisfecha con la Colonia de Verano, decide suscribirse al "Club House". Compra la membresía a través de la nueva página de ventas. Ahora, en su Dashboard de Tutor, ve que su estado es "Membresía Activa". Entra al Calendario de Clases, una interfaz visual e interactiva que muestra la grilla de clases disponibles para la semana. Filtra por "Lógica" y encuentra una sesión el miércoles por la tarde. Con dos clics, abre el modal de reserva y confirma el lugar para Leo.

2. **La Experiencia Diaria (Leo, el Estudiante):** Leo inicia sesión. Su dashboard ahora se parece mucho al de la Fase 1, pero la consola del "Portal de Competición" es dinámica. Hoy muestra la "Sesión de Lógica de Obstáculos" que Laura le reservó, con el botón "¡A LA ARENA!" brillando en Turquesa. Sabe exactamente qué tiene que hacer.

3. **El Círculo de Feedback (Ana, la Docente):** La Profesora Ana termina la clase con Leo. Entra a su Panel de Docente, una interfaz limpia pero con el estilo "chunky" de Mateatletas. Selecciona la clase recién finalizada de su agenda. Se abre la Lista de Asistencia. Marca a Leo como "Asistió". En el campo de observaciones, escribe: "Mostró un razonamiento lateral brillante para resolver el último puzzle". Junto al nombre de Leo, presiona el botón + Otorgar Gema. Se abre un pequeño modal con las "Gemas" de habilidad. Selecciona la "Gema de la Lógica Creativa" (+50 XP). Con un clic, el feedback queda registrado.

4. **La Red de Seguridad (El Administrador):** En el Panel "Copiloto", el sistema de alertas detecta una observación negativa de otro docente sobre un estudiante diferente. Se genera una nueva entrada en la lista de Alertas. El administrador la ve, accede al detalle, lee la observación, el historial del estudiante y una sugerencia generada por IA sobre cómo abordar la situación.

---

# Manual de Marca y Sistema de Diseño v1.0: Mateatletas

## 1. Filosofía y Principios Fundamentales ("El Alma")

Este sistema de diseño se construye sobre dos pilares filosóficos que deben impregnar cada píxel de la plataforma. Cada decisión de diseño, desde la sombra de un botón hasta el flujo de una animación, debe responder a estos principios.

- **Principio de "Energía Táctil":** La interfaz no es una ventana de cristal. Es un campo de juego físico y reactivo. Cada elemento debe invitar a la interacción, responder con peso, sonido y energía, como si fuera un interruptor, una palanca o una gema real. El usuario no "hace clic", el usuario "activa", "presiona" y "colecciona". El objetivo es generar una respuesta satisfactoria a cada acción.

- **Principio de "Tecno-Jungla":** La estética visual fusiona elementos tecnológicos de alta energía (hologramas, circuitos, portales) con texturas y formas orgánicas y salvajes. Es un universo donde la tecnología no es fría ni estéril, sino vibrante, un poco caótica y llena de vida. Se busca una sensación constante de aventura y descubrimiento.

## 2. Identidad Visual (Los Ladrillos)

### 2.1. Tipografía: La Voz de la Marca

La tipografía es el vehículo principal de nuestra personalidad. Su uso dual está diseñado para ser enérgico y claro a la vez.

#### Títulos y UI (Lilita One):

- **Uso:** Exclusivamente para todos los títulos, etiquetas de consolas, textos de botones y cualquier elemento de interfaz que requiera jerarquía y personalidad.

- **Regla Inquebrantable:** Siempre debe llevar un contorno negro grueso y característico. Esto le da el peso y la sensación de "sticker" o "cómic" que define nuestra identidad. Sin el contorno, no es nuestra marca.

#### Cuerpo de Texto (GeistSans):

- **Uso:** Para párrafos, descripciones, y cualquier texto largo donde la legibilidad es la máxima prioridad.

- **Regla:** Su diseño limpio y neutro sirve para balancear la fuerte personalidad de Lilita One, asegurando que la interfaz sea enérgica pero nunca fatigante de leer.

### 2.2. Paleta de Colores: El Espectro de Energía

La paleta está diseñada para crear jerarquía visual y evocar emociones específicas. Su uso no es decorativo, es funcional.

#### Naranja (Primario - #FF7A00):

- **Significado:** Acción, Invitación, Comienzo.
- **Uso:** Es el color principal para las llamadas a la acción (CTAs) más importantes, como iniciar un desafío (¡VAMOS!) o comenzar un proceso de compra (¡INSCRIBIRME AHORA!).

#### Turquesa (Primario Contextual - #00C2D1):

- **Significado:** Urgencia, Evento en Vivo, El "Ahora".
- **Uso:** Reservado para la acción más importante y sensible al tiempo en el dashboard del estudiante: entrar a una clase en vivo (¡A LA ARENA!). Su uso limitado le da un poder especial.

#### Azul (Secundario - #007BFF):

- **Significado:** Opción, Elección Secundaria.
- **Uso:** Para acciones secundarias que presentan una alternativa a la ruta principal (ej. "Inscribir un Equipo" vs. "Uno Solo").

#### Amarillo (Energía - #FFD600):

- **Significado:** Progreso, Energía Acumulada, Poder.
- **Uso:** Exclusivamente para el relleno de la "Barra de Energía" (XP y niveles). Su brillo contrasta con el contenedor oscuro para una máxima visibilidad del progreso.

#### Morado (Acento / Celebración - #7F00FF):

- **Significado:** Recompensa, Logro, Siguiente Paso.
- **Uso:** Para botones en modales de éxito o confirmación, guiando al usuario al siguiente paso tras completar una acción importante (ej. "IR A LA SALA DE ESPERA" después de pagar).

#### Neutros (Base y Sombra):

- **Negro (#000000):** Sombras duras, contornos de tipografía, bordes de contenedores.
- **Gris Oscuro (#212529):** Fondos de contenedores, como la "Barra de Energía".
- **Blanco (#FFFFFF):** Texto principal sobre fondos de color.

## 3. Sistema de Componentes (El Arsenal de Construcción)

Estos son los elementos reutilizables y estandarizados para construir cualquier interfaz de Mateatletas. Su consistencia es la ley.

### 3.1. Contenedores: La Regla de Unificación

- **Nombre Oficial:** Contenedor Unificado.

- **Especificación:** Todo panel, tarjeta, formulario o modal debe seguir esta estructura precisa para crear el efecto "chunky" y táctil de la marca:
  1. **Fondo:** Un color sólido de la paleta.
  2. **Borde:** Un borde grueso (4px a 6px) de color negro (#000000).
  3. **Sombra:** Una sombra dura, no difuminada, de color negro (#000000), desplazada hacia abajo y a la derecha (ej. 8px 8px 0 #000).

- **Aplicación:** Universal. Desde la tarjeta de una clase en el calendario del tutor hasta una alerta en el panel del administrador.

### 3.2. Botones: La Familia "Interruptor de Energía"

- **Descripción:** No son botones planos. Son interruptores diseñados para ser presionados. Su diseño se deriva directamente del "Contenedor Unificado".

- **Jerarquía por Color:** Su uso sigue estrictamente la paleta de colores definida (Naranja = Primario, Azul = Secundario, etc.).

- **Estados de Interacción (Principio de "Energía Táctil"):**
  - **Reposo:** Estilo "chunky" estándar con su borde negro y sombra dura.
  - **Hover:** El botón se eleva. La transición `transform: translate(-4px, -4px)` mueve el botón, y la sombra se ajusta (`box-shadow: 12px 12px 0 #000`) para dar la sensación de que se acerca al usuario.
  - **Click/Activo:** El botón se "hunde". La transición `transform: translate(0px, 0px)` lo devuelve a su posición original y la sombra desaparece (`box-shadow: none`). Esta transición crea el efecto físico de haber sido presionado.

### 3.3. Elementos de Gamificación

#### La "Barra de Energía" Oficial:

- **Estructura:** Un "Contenedor Unificado" (Gris Oscuro) que contiene una barra de relleno Amarillo Vibrante. El texto del nivel y los puntos se superpone en Lilita One.

- **Uso:** El único indicador visual para el progreso de XP y niveles.

#### Las "Gemas" y la "Bóveda de Trofeos":

- **Concepto:** Los logros no son íconos 2D. Son "Gemas" o artefactos 3D coleccionables. Deben ser diseñados como objetos de valor.

- **Presentación:** Se muestran en la "Bóveda de Trofeos" en pedestales o nichos, dándoles un estatus de objeto preciado.

#### Modal de Logro Desbloqueado:

- **Función:** Una celebración a pantalla completa que interrumpe el flujo para magnificar el momento del logro.

- **Diseño:** Explosión de confeti digital, la Gema 3D aparece en el centro, y el título en Lilita One anuncia la recompensa.

## 4. Aplicación del Sistema por Ecosistema

Este sistema único se adapta para servir las necesidades de cada rol de usuario, manteniendo siempre la coherencia.

### Ecosistema del Estudiante:

- **Aplicación:** Máxima intensidad. Uso completo de todos los componentes, animaciones, sonidos e ilustraciones. La experiencia es 100% inmersiva y lúdica.

### Ecosistema del Cliente Potencial (Páginas de Venta/Inscripción):

- **Aplicación:** Alta intensidad. Utiliza la misma energía visual que el dashboard del estudiante para transmitir la promesa de la marca desde el primer contacto. El objetivo es que la compra se sienta como el primer paso de la aventura.

### Ecosistema del Tutor:

- **Aplicación:** Intensidad media. El foco es la claridad y la eficiencia con la identidad de la marca. Se utilizan los mismos componentes (Contenedores Unificados, Botones de Interruptor), pero en una disposición más informativa y menos lúdica. La "Barra de Energía" se usa para mostrar el progreso del hijo, no para gamificar al padre.

### Ecosistemas del Docente y Administrador:

- **Aplicación:** Intensidad baja. El foco es la funcionalidad y la productividad sin romper el universo visual. Se reduce drásticamente el uso de ilustraciones y texturas, pero se mantienen de forma estricta los componentes base: tipografía, colores, botones y contenedores. Un select o una tabla en el panel del admin debe sentirse inconfundiblemente "Mateatletas" gracias a su borde, sombra y tipografía.
