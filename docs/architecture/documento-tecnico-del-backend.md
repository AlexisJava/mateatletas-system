# Documento de Diseño Técnico del Backend: Mateatletas

## Sección 1: Stack Tecnológico Detallado y Justificación

El objetivo de esta sección es definir el conjunto preciso de herramientas, lenguajes y librerías que conformarán el "motor" de Mateatletas. Cada elección está fundamentada en los requisitos del proyecto: una plataforma robusta, segura, mantenible a largo plazo y capaz de escalar.

El informe arquitectónico nos da una base: Node.js o Python para el backend y PostgreSQL como base de datos. A continuación, detallamos y justificamos la selección final para maximizar la eficiencia del desarrollo.

### 1.1. Runtime y Lenguaje de Programación

● **Runtime: Node.js**
○ **Justificación:** Node.js es ideal para una API como la nuestra. Su naturaleza asíncrona y orientada a eventos le permite manejar una gran cantidad de conexiones simultáneas (miles de padres consultando el calendario, docentes actualizando asistencia, etc.) con un consumo de recursos muy eficiente. Además, al usar JavaScript en el backend, se alinea con el lenguaje del frontend (React), lo que puede facilitar la colaboración y el intercambio de lógica de validación en el futuro.

● **Lenguaje: TypeScript**
○ **Justificación:** Esta es nuestra primera gran decisión para garantizar la calidad. TypeScript es un superconjunto de JavaScript que añade tipado estático. ¿Qué significa esto para Mateatletas?
■ **Menos Errores en Producción:** El 90% de los errores comunes (como enviar un texto donde se esperaba un número) son detectados durante el desarrollo, no por tus clientes.
■ **Código Más Claro y Mantenible:** Al definir explícitamente la "forma" de nuestros datos (qué campos tiene un Estudiante, un Producto, etc.), el código se vuelve auto-documentado. Un nuevo programador podrá entender la estructura mucho más rápido.
■ **Escalabilidad Segura:** A medida que la plataforma crezca, cambiar o añadir funcionalidades será mucho más seguro, ya que el compilador de TypeScript nos avisará si un cambio rompe otra parte del sistema.

### 1.2. Framework de Backend

● **Framework: NestJS**
○ **Justificación:** Si Node.js es el motor, NestJS es el chasis de alto rendimiento que le da estructura y potencia. Aunque podríamos usar frameworks más minimalistas como Express.js, NestJS nos ofrece una ventaja estratégica decisiva para un proyecto de la envergadura de Mateatletas.
○ **Comparativa con Express.js:** Express es como una caja de herramientas vacía: es potente y flexible, pero exige que el equipo construya toda la arquitectura desde cero. Esto puede llevar a inconsistencias y desorden a medida que el proyecto crece.
○ **¿Por qué NestJS es la elección correcta?**
■ **Arquitectura Modular:** NestJS nos "obliga" a organizar el código en módulos (AuthModule, ProductosModule, GamificacionModule). Esto se alinea perfectamente con los principios de Arquitectura Limpia y hace que el proyecto sea increíblemente ordenado y fácil de navegar.
■ **Basado en TypeScript:** Fue construido desde cero con TypeScript, por lo que la integración es perfecta y natural.
■ **Inyección de Dependencias:** Incorpora un sistema que facilita enormemente la escritura de código desacoplado y, sobre todo, fácil de probar (testing).
■ **Ecosistema Robusto:** Provee soluciones integradas para tareas comunes como la validación de datos de entrada (DTOs), la configuración y la comunicación con la base de datos, acelerando el desarrollo.

### 1.3. Capa de Acceso a Datos (ORM)

● **ORM (Object-Relational Mapper): Prisma**
○ **Justificación:** Necesitamos una forma segura y eficiente de comunicarnos con nuestra base de datos PostgreSQL. Escribir consultas SQL a mano es propenso a errores y a vulnerabilidades de seguridad (SQL Injection). Un ORM traduce nuestro código TypeScript a consultas SQL seguras.
○ **Comparativa con Sequelize/TypeORM:** Son ORMs muy potentes y maduros, pero su configuración puede ser compleja y a veces la "magia" que hacen para gestionar las relaciones es difícil de depurar.
○ **¿Por qué Prisma es la elección correcta?**
■ **Seguridad de Tipos de Extremo a Extremo:** Prisma lee el esquema de tu base de datos y genera automáticamente tipos de TypeScript. Esto significa que si intentas consultar un campo que no existe, tu editor de código te avisará al instante. Es un nivel de seguridad y autocompletado que otros ORMs no pueden igualar.
■ **Schema como Única Fuente de Verdad:** Se define la estructura de la base de datos en un único archivo (schema.prisma), lo que simplifica enormemente la gestión de cambios (migraciones) y la comprensión del modelo de datos.
■ **API de Consultas Intuitiva:** La forma de escribir consultas con Prisma es muy legible y potente, lo que reduce la curva de aprendizaje para el equipo de desarrollo.

### Resumen del Stack Tecnológico del Backend

| Componente | Herramienta Seleccionada | Razón Principal                                                                        |
| ---------- | ------------------------ | -------------------------------------------------------------------------------------- |
| Runtime    | Node.js                  | Alto rendimiento para APIs y alineación con el ecosistema JavaScript.                  |
| Lenguaje   | TypeScript               | Seguridad, mantenibilidad y escalabilidad a través del tipado estático.                |
| Framework  | NestJS                   | Estructura modular, orden y herramientas para un desarrollo rápido y de calidad.       |
| ORM        | Prisma                   | Máxima seguridad de tipos para interactuar con PostgreSQL de forma segura y eficiente. |

Con este stack, no solo estamos eligiendo tecnologías modernas, sino un ecosistema cohesivo donde cada pieza potencia a las demás. Proporcionaremos a tu equipo de desarrollo las mejores herramientas para construir Mateatletas de manera eficiente, segura y preparada para el futuro.

## Sección 2: Arquitectura del Software y Estructura del Proyecto

Esta sección define el esqueleto de nuestra aplicación. La arquitectura elegida es una Arquitectura Modular por Dominios, fuertemente influenciada por los principios de la Arquitectura Limpia (Clean Architecture). El objetivo es simple: máxima organización para máxima escalabilidad y mantenibilidad.

### Principios Fundamentales:

1. **Separación de Intereses (Separation of Concerns):** Cada parte del código tiene una única y clara responsabilidad. Un archivo que maneja peticiones web no debe contener lógica de negocio. Un archivo que contiene lógica de negocio no debe saber cómo se guardan los datos en la base de datos.

2. **Alta Cohesión, Bajo Acoplamiento:** El código relacionado con una misma funcionalidad (ej. "Gamificación") debe vivir junto (alta cohesión). Los diferentes módulos deben depender lo menos posible unos de otros (bajo acoplamiento).

3. **La Lógica de Negocio es el Rey:** El corazón de Mateatletas (cómo se inscribe un alumno, cómo se otorgan puntos) debe ser independiente del framework (NestJS) y de la base de datos (PostgreSQL/Prisma). Esto hace que el sistema sea más resiliente al cambio y mucho más fácil de probar.

### 2.1. Estructura de Carpetas Raíz (/src)

La carpeta src contendrá todo nuestro código fuente. Estará organizada de la siguiente manera, donde cada carpeta tiene un propósito inconfundible:

```
/
├── prisma/
│   ├── schema.prisma      # Nuestra única fuente de verdad para el modelo de datos.
│   └── migrations/        # Historial de cambios de la base de datos.
├── src/
│   ├── core/              # Módulos y lógica TRANSVERSALES a toda la aplicación.
│   │   ├── config/        # Gestión de variables de entorno y configuración.
│   │   ├── database/      # Configuración del cliente de Prisma.
│   │   ├── security/      # Guards, strategies para JWT, decoradores de roles.
│   │   └── common/        # Clases base, interceptors, filtros de excepciones.
│   │
│   ├── modules/           # El CORAZÓN de la aplicación, separado por DOMINIOS de negocio.
│   │   ├── auth/          # Registro, login, gestión de sesión.
│   │   ├── usuarios/      # Gestión de perfiles: Tutores, Estudiantes, Docentes.
│   │   ├── catalogo/      # Gestión de Productos (Cursos, Suscripciones).
│   │   ├── academico/     # Operación diaria: Clases, Inscripciones, Asistencia.
│   │   ├── gamificacion/  # Puntos, Logros, Equipos, Niveles.
│   │   ├── pagos/         # Integración con Mercado Pago, gestión de Membresías.
│   │   └── admin/         # Lógica del panel "Copiloto", Alertas.
│   │
│   ├── main.ts            # Punto de entrada de la aplicación. Configura e inicia el servidor.
│   └── app.module.ts      # Módulo raíz que importa todos los demás módulos.
│
├── test/                  # Pruebas End-to-End y de integración.
├── .env                   # Variables de entorno (NUNCA subir a Git).
├── .eslintrc.js           # Reglas de formato y calidad de código.
├── nest-cli.json          # Configuración del CLI de NestJS.
├── package.json           # Dependencias y scripts del proyecto.
└── tsconfig.json          # Configuración del compilador de TypeScript.
```

### 2.2. Anatomía de un Módulo de Dominio (Ejemplo Exhaustivo: academico)

Para eliminar cualquier "zona gris", vamos a diseccionar un módulo complejo. El módulo academico es perfecto porque contiene varias responsabilidades interconectadas: la gestión de Clases y la gestión de Inscripciones. Así es como se verá por dentro:

```
src/modules/academico/
│
├── academico.module.ts    # Importa y exporta los sub-módulos de Clases e Inscripciones.
│
├── clases/
│   ├── clases.module.ts         # Define el módulo de Clases. Declara el controller y el service.
│   ├── clases.controller.ts     # **Capa de API:** Maneja las rutas /api/clases.
│   ├── clases.service.ts        # **Capa de Lógica de Negocio:** Implementa los casos de uso.
│   ├── dtos/
│   │   └── get-calendario.dto.ts # **DTO:** Define y valida los datos de entrada para el calendario.
│   └── entities/
│       └── clase.entity.ts      # Define la entidad 'Clase' en el dominio del código.
│
└── inscripciones/
    ├── inscripciones.module.ts      # Define el módulo de Inscripciones.
    ├── inscripciones.controller.ts  # **Capa de API:** Maneja rutas como /api/inscripciones.
    ├── inscripciones.service.ts     # **Capa de Lógica de Negocio:** Lógica CRÍTICA de inscripción.
    ├── dtos/
    │   ├── crear-inscripcion.dto.ts # Valida los datos para inscribir un alumno.
    │   └── registrar-feedback.dto.ts # Valida los datos para el feedback del docente.
    └── entities/
        └── inscripcion.entity.ts    # Define la entidad 'Inscripción' en el código.
```

### 2.3. Las Responsabilidades de Cada Archivo (El Flujo de una Petición)

Imaginemos que un tutor quiere inscribir a su hijo en una clase. La petición es POST /api/inscripciones. Este es el viaje que realiza a través de nuestra arquitectura:

1. **main.ts -> NestJS Core:** La petición llega a la aplicación. NestJS la enruta al controlador correcto basado en la URL y el método HTTP.

2. **inscripciones.controller.ts (La Capa de API - El Portero):**
   ○ Su única misión es gestionar la comunicación HTTP.
   ○ Usa un DTO (crear-inscripcion.dto.ts) para validar automáticamente que el cuerpo de la petición contiene clase_id y estudiante_id y que son del tipo correcto. Si no, devuelve un error 400 Bad Request sin que tengamos que escribir un solo if.
   ○ No contiene lógica de negocio. No sabe si hay cupo o si la membresía está activa.
   ○ Llama al método correspondiente en el servicio: this.inscripcionesService.crearInscripcion(dto, usuarioLogueado).
   ○ Recibe la respuesta del servicio y la devuelve al cliente con el código de estado HTTP apropiado (ej. 201 Created).

3. **Ejemplo de código en el controlador:**

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Tutor')
crearInscripcion(
  @Body() crearInscripcionDto: CrearInscripcionDto,
  @GetUser() tutor: Tutor, // Decorador personalizado que extrae el usuario del token
) {
  return this.inscripcionesService.crear(crearInscripcionDto, tutor);
}
```

4. **inscripciones.service.ts (La Capa de Lógica de Negocio - El Cerebro):**
   ○ Aquí reside la inteligencia. Este archivo no sabe nada de HTTP. Podría ser llamado desde una petición web, un proceso automático o una prueba unitaria.
   ○ Implementa el caso de uso "Inscribir Estudiante".
   ○ Ejecuta todos los pasos de validación de negocio descritos en la especificación de la API:
   1. Verifica que el estudiante_id pertenece al tutor que hace la petición.
   2. Consulta la membresia del tutor para asegurar que su estado sea 'Activa'.
   3. Consulta la clase para obtener el producto_id asociado.
   4. Consulta el producto para obtener el cupo_maximo.
   5. Compara el cupo_maximo con los cupos_ocupados de la clase.
   6. Si todas las validaciones pasan, procede a insertar en la tabla inscripciones usando el cliente de Prisma.
   7. Dispara un trigger (o actualiza en el mismo servicio) que incrementa cupos_ocupados en la tabla de clases.
      ○ Si una validación falla, lanza una excepción específica (ej. ForbiddenException, ConflictException), que será capturada por un filtro global para devolver el error HTTP correcto (403, 409).

5. **prisma/schema.prisma y Prisma Client (La Capa de Acceso a Datos - Las Manos):**
   ○ El servicio inscripciones.service.ts usa el cliente de Prisma para interactuar con la base de datos.
   ○ Las consultas son escritas en TypeScript de forma segura. Prisma se encarga de generar el SQL optimizado y seguro.
   ○ Toda la definición de las tablas como inscripciones, clases, productos vive en el schema.prisma.

Esta arquitectura nos da un sistema predecible. Cuando un desarrollador necesite arreglar un bug o añadir una funcionalidad, sabrá exactamente a qué carpeta y archivo dirigirse. Si el bug es sobre una validación de entrada, irá al dto. Si es sobre una regla de negocio, irá al service. Si es sobre la ruta de la API, irá al controller.

## Sección 3: Capa de Acceso a Datos (Data Access Layer)

El objetivo de esta sección es definir el mecanismo exacto y único a través del cual nuestra aplicación interactuará con la base de datos PostgreSQL de Supabase. Utilizaremos Prisma como nuestro ORM (Object-Relational Mapper), no solo como una herramienta de consulta, sino como el pilar de nuestra estrategia de datos.

### 3.1. El schema.prisma: Nuestra Única Fuente de Verdad

El archivo prisma/schema.prisma es el corazón de nuestra capa de datos. No habrá otra fuente de verdad. Este archivo contendrá:

1. La configuración de la conexión a la base de datos.
2. La configuración del generador del cliente de Prisma.
3. La definición de todos nuestros modelos de datos, que son una representación directa de las tablas de la base de datos.

Este enfoque nos da una claridad absoluta. Para entender la estructura de los datos de Mateatletas, un desarrollador solo necesita leer este archivo.

**Fragmento de código:**

```prisma
// Fichero: /prisma/schema.prisma

// 1. Configuración del Datasource (Conexión a la BD)
// Le dice a Prisma cómo conectarse a nuestra base de datos Supabase.
// La URL se carga de forma segura desde el archivo .env
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 2. Configuración del Generator (Cliente de Prisma)
// Le dice a Prisma que genere un cliente de TypeScript optimizado para nuestro código.
generator client {
  provider = "prisma-client-js"
}

// 3. Definición de Modelos (Las Tablas)
// A continuación, se definen los modelos que representan cada tabla.
```

### 3.2. Traducción de Tablas a Modelos Prisma (Ejemplos Concretos)

Aquí es donde materializamos el diseño lógico de la base de datos en código. Prisma utiliza una sintaxis clara para definir campos, tipos, relaciones y restricciones.

**Ejemplo 1: Modelo Tutor**

Este modelo traduce la Tabla tutores (Versión Final Robusta).

```prisma
// Fichero: /prisma/schema.prisma

model Tutor {
  // --- CAMPOS DE LA TABLA ---
  id                         String       @id @default(uuid()) // Mapea a UUID, clave primaria. Referencia directa a auth.users.id
  nombre                     String       @db.VarChar(100)
  apellido                   String       @db.VarChar(100)
  dni                        String?      @unique @db.VarChar(20) // Opcional pero único si existe
  cuil                       String?      @unique @db.VarChar(20) // Opcional pero único si existe
  telefono                   String?      @db.VarChar(50)
  estado                     String       @default("Activo") @db.VarChar(50) // Añadido para control administrativo
  mercado_pago_customer_id   String?      @unique @db.VarChar(255) // Para vincular con la pasarela de pago
  ha_completado_onboarding   Boolean      @default(false) // Para la experiencia de bienvenida
  created_at                 DateTime     @default(now()) @db.Timestamptz
  updated_at                 DateTime     @updatedAt @db.Timestamptz

  // --- RELACIONES CON OTRAS TABLAS ---
  // Un Tutor puede tener muchos Estudiantes.
  estudiantes         Estudiante[]
  // Un Tutor puede tener muchas Membresías.
  membresias          Membresia[]
  // Un Tutor puede realizar muchas compras de Cursos.
  compras_cursos      InscripcionCurso[]
  // Un Tutor puede recibir muchas Notificaciones.
  notificaciones      Notificacion[]

  @@map("tutores") // Mapea este modelo a la tabla 'tutores' en la base de datos.
}
```

**Ejemplo 2: Modelo Producto y sus Relaciones**

Este modelo traduce la Tabla productos (Versión Final Robusta) y demuestra cómo se definen las relaciones.

```prisma
// Fichero: /prisma/schema.prisma

model Producto {
  // --- CAMPOS DE LA TABLA ---
  id                BigInt     @id @default(autoincrement())
  nombre            String     @db.VarChar(255)
  descripcion       String?    @db.Text
  modelo_cobro      String     @db.VarChar(50) // 'PagoUnico' o 'Recurrente'
  modelo_servicio   String     @db.VarChar(50) // 'CursoFijo' o 'AccesoFlexible'
  precio_base       Decimal    @db.Decimal(10, 2)
  fecha_inicio      DateTime?  @db.Date
  fecha_fin         DateTime?  @db.Date
  cupo_maximo       Int?
  activo            Boolean    @default(true)

  // --- RELACIONES ---
  // Relación con RutaCurricular
  ruta_curricular_id BigInt?
  ruta_curricular    RutaCurricular? @relation(fields: [ruta_curricular_id], references: [id])

  // Un Producto (ej. "Club Lunes") puede tener muchas Clases asociadas.
  clases             Clase[]
  // Un Producto (ej. suscripción) puede ser parte de muchas Membresías.
  membresias         Membresia[]
  // Un Producto (ej. curso de verano) puede ser comprado muchas veces.
  inscripciones_curso InscripcionCurso[]
  // Un Producto (ej. curso) puede tener muchos Módulos.
  modulos            Modulo[]

  @@map("productos")
}

model RutaCurricular {
  id          BigInt      @id @default(autoincrement())
  nombre      String      @unique @db.VarChar(100)
  descripcion String      @db.Text
  productos   Producto[]

  @@map("rutas_curriculares")
}
```

### 3.3. El Flujo de Trabajo con Migraciones (El Control de Cambios)

Nadie tocará la base de datos de Supabase directamente. Todo cambio en la estructura de la base de datos seguirá este proceso riguroso y controlado:

1. **Modificación:** El desarrollador edita el archivo schema.prisma para reflejar el nuevo cambio (ej. añadir un nuevo campo a la tabla estudiantes).

2. **Generación de la Migración:** El desarrollador ejecuta un único comando en su terminal:

   ```
   npx prisma migrate dev --name <nombre-descriptivo-del-cambio>
   ```

   Por ejemplo: `npx prisma migrate dev --name add_nickname_to_estudiantes`

3. **Acción de Prisma:** Prisma realiza dos acciones críticas:
   a. Compara el schema.prisma con el estado actual de la base de datos y genera un nuevo archivo SQL con los cambios precisos en la carpeta prisma/migrations. Este archivo se añade al control de versiones (Git).
   b. Aplica este archivo SQL a la base de datos de desarrollo.

4. **Despliegue:** Cuando el código se despliegue a producción, el sistema de CI/CD ejecutará `npx prisma migrate deploy` para aplicar de forma segura todas las migraciones pendientes.

Este flujo garantiza que la estructura de la base de datos evolucione de forma ordenada, auditable y sin riesgos.

### 3.4. El PrismaService: Un Conector Centralizado y Reutilizable

Para evitar instanciar el cliente de Prisma en cada servicio, crearemos un servicio centralizado en NestJS.

● **Ubicación:** src/core/database/prisma.service.ts
● **Responsabilidad:** Este servicio se encargará de instanciar el PrismaClient, conectarse a la base de datos al iniciar la aplicación y desconectarse de forma segura al detenerla.
● **Implementación:** Se configurará como un servicio Injectable de NestJS, lo que permitirá que cualquier otro servicio (como inscripciones.service.ts) lo reciba a través de la inyección de dependencias, simplemente declarándolo en su constructor.

**Ejemplo de código en PrismaService:**

```typescript
// Fichero: src/core/database/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

Con esta sección, hemos definido de manera exhaustiva y sin ambigüedades cómo Mateatletas gestionará su capa de persistencia. Tu equipo de desarrollo tiene ahora una guía clara sobre cómo definir modelos, evolucionar la base de datos y acceder a los datos de forma segura y consistente.

## Sección 4: Capa de Lógica de Negocio (Business Logic Layer)

Esta capa es el cerebro de la aplicación. Su única responsabilidad es ejecutar los procesos y reglas de negocio de Mateatletas. No sabe nada sobre peticiones web (HTTP) ni sobre cómo se guarda la información en la base de datos (SQL). Simplemente orquesta las operaciones, toma decisiones y garantiza que las reglas se cumplan.

Implementaremos esta lógica dentro de los Servicios de NestJS (\*.service.ts), que vivirán dentro de cada módulo de dominio como definimos en la arquitectura.

### 4.1. El Caso de Uso: El Corazón de un Servicio

Cada función pública dentro de un servicio representará un "Caso de Uso" del sistema. Un caso de uso es una acción de negocio específica, como "Registrar un Tutor", "Comprar un Curso" o "Inscribir un Estudiante a una Clase".

Para ilustrar esto de forma exhaustiva, vamos a desglosar uno de los casos de uso más críticos y complejos de la plataforma.

**Caso de Uso de Ejemplo: Inscribir a un Estudiante en una Clase del "Club House"**

● **Endpoint de API asociado:** POST /api/inscripciones
● **Archivo responsable:** src/modules/academico/inscripciones/inscripciones.service.ts
● **Objetivo de negocio:** Permitir que un tutor con una membresía activa reserve un lugar para uno de sus hijos en una clase con cupo disponible.

El método crearInscripcion dentro de inscripciones.service.ts implementará la siguiente lógica de negocio, paso a paso:

1. **Recepción de Datos:** El método recibirá los datos validados por el DTO (clase_id, estudiante_id) y el objeto del tutor que está realizando la acción (extraído del token JWT).

2. **Validación de Propiedad (Regla de Seguridad):** El primer paso es una verificación de seguridad fundamental. El servicio debe consultar la base de datos para confirmar que el estudiante_id proporcionado tiene un tutor_id que coincide con el id del tutor que realiza la petición. Esto es una doble capa de seguridad sobre el RLS de la base de datos. Si no coincide, se lanzará una excepción ForbiddenException ('No tienes permiso para inscribir a este estudiante').

3. **Validación de Acceso (Regla de Negocio):** El servicio debe verificar que el tutor tiene derecho a acceder al servicio.
   ○ Se consultará la tabla membresias para encontrar una membresía asociada al tutor_id.
   ○ Se comprobará que el estado de esa membresía sea 'Activa'. Si no es activa, se lanzará una ForbiddenException ('Tu membresía no se encuentra activa para realizar inscripciones.').

4. **Validación de Disponibilidad (Regla de Negocio):** El servicio debe asegurarse de que haya lugar en la clase. Este es un proceso de múltiples pasos que debe ser atómico (realizarse como una única operación para evitar que dos personas tomen el último lugar al mismo tiempo).
   ○ Se consultará la clase usando clase_id para obtener su producto_id y su contador cupos_ocupados.
   ○ Se consultará el producto asociado para obtener su cupo_maximo.
   ○ Se compararán ambos valores. Si cupos_ocupados >= cupo_maximo, se lanzará una ConflictException ('Esta clase ya no tiene cupos disponibles.').

5. **Ejecución de la Transacción (Acción de Escritura):** Solo si todas las validaciones anteriores son exitosas, el servicio procederá a modificar los datos. Para garantizar la integridad de los datos, estas dos operaciones se ejecutarán dentro de una transacción de base de datos ($transaction de Prisma).
   a. **Crear la Inscripción:** Se insertará un nuevo registro en la tabla inscripciones con el clase_id, estudiante_id y el estado 'Confirmada'.
   b. **Actualizar el Contador:** Se incrementará en 1 el campo cupos_ocupados en la tabla clases.

6. **Respuesta Exitosa:** El método devolverá el objeto de la inscripción recién creada. El controlador se encargará de enviarlo como respuesta al cliente.

**Ejemplo de código en inscripciones.service.ts:**

```typescript
// Fichero: src/modules/academico/inscripciones/inscripciones.service.ts

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearInscripcionDto, tutor: Tutor): Promise<Inscripcion> {
    // Aquí irían las validaciones de propiedad y membresía activa...

    const clase = await this.prisma.clase.findUnique({
      where: { id: dto.clase_id },
      include: { producto: true }, // Incluimos el producto para obtener el cupo_maximo
    });

    if (!clase || !clase.producto.cupo_maximo) {
      throw new NotFoundException('La clase o el producto asociado no existe.');
    }

    if (clase.cupos_ocupados >= clase.producto.cupo_maximo) {
      throw new ConflictException('Esta clase ya no tiene cupos disponibles.');
    }

    // Ejecutamos la creación y la actualización en una transacción
    const [nuevaInscripcion] = await this.prisma.$transaction([
      this.prisma.inscripcion.create({
        data: {
          estudiante_id: dto.estudiante_id,
          clase_id: dto.clase_id,
          estado_reserva: 'Confirmada',
        },
      }),
      this.prisma.clase.update({
        where: { id: dto.clase_id },
        data: { cupos_ocupados: { increment: 1 } },
      }),
    ]);

    return nuevaInscripcion;
  }
}
```

### 4.2. Lógica de Automatización: El Servicio "Inteligente"

No toda la lógica de negocio es iniciada por una acción directa del usuario. Un excelente ejemplo es la automatización de la gamificación.

**Caso de Uso de Ejemplo: Completar una Lección y Otorgar Recompensas**

● **Endpoint de API asociado:** POST /api/lecciones/{id}/completar
● **Archivo responsable:** src/modules/academico/lecciones/lecciones.service.ts
● **Objetivo de negocio:** Permitir que un estudiante marque una lección como completada y que el sistema, automáticamente, le otorgue los puntos y/o logros definidos para esa lección.

El método completarLeccion en lecciones.service.ts implementará esta lógica:

1. **Validar Permisos:** Se verificará que el estudiante esté inscrito en el curso al que pertenece la lección.
2. **Obtener Reglas de Gamificación:** Se buscará la lección en la base de datos para leer los campos puntos_por_completar y logro_desbloqueable_id.
3. **Otorgar Puntos:** Si puntos_por_completar es mayor que 0, el servicio creará un nuevo registro en la tabla puntos_obtenidos. Para mantener el código limpio, podría llamar a un GamificacionService para encapsular esta lógica.
4. **Desbloquear Logro:** Si logro_desbloqueable_id no es nulo, se creará un nuevo registro en logros_obtenidos, asegurándose de que el estudiante no lo haya ganado antes.
5. **Devolver Resumen:** El servicio devolverá un objeto que resuma las recompensas obtenidas, tal como se especifica en la API.

## Sección 5: Capa de API (Controllers y DTOs)

La capa de API es el punto de entrada a nuestro backend. Su responsabilidad es gestionar la comunicación HTTP. Se compone de dos elementos fundamentales: los Controladores, que actúan como directores de tráfico, y los DTOs (Data Transfer Objects), que son nuestros guardias de seguridad en la puerta, validando toda la información que entra.

### 5.1. El Rol del Controlador (\*.controller.ts)

Un controlador es una clase de NestJS que está "escuchando" en una ruta específica (un endpoint). Su trabajo es exclusivamente:

1. **Recibir Peticiones (Requests):** Captura las solicitudes entrantes para una URL específica (ej. POST /api/inscripciones).

2. **Validar y Extraer Datos:** Utiliza DTOs para validar automáticamente los datos del cuerpo (body), los parámetros de la URL (params) o las consultas (query). También extrae información crucial, como los datos del usuario autenticado a partir del token JWT.

3. **Delegar la Lógica de Negocio:** Una vez que los datos son válidos, llama al método apropiado en el servicio correspondiente para que este haga el trabajo pesado. Un controlador NUNCA debe contener lógica de negocio.

4. **Enviar Respuestas (Responses):** Toma el resultado del servicio y lo empaqueta en una respuesta HTTP, asegurándose de que el código de estado (ej. 200 OK, 201 Created, 403 Forbidden) sea el correcto.

### 5.2. El DTO (Data Transfer Object): El Guardia de Seguridad

Un DTO es una clase simple que define la "forma" de los datos que esperamos recibir. Usando librerías como class-validator y class-transformer (integradas en NestJS), los DTOs se convierten en una herramienta de validación automática y declarativa.

**Beneficios de usar DTOs:**

● **Código Limpio:** Elimina la necesidad de escribir bloques if-else interminables en los controladores para verificar si un campo existe o si es del tipo correcto.
● **Seguridad:** Protege nuestra lógica de negocio de recibir datos malformados o inesperados, previniendo errores y posibles vulnerabilidades.
● **Fuente Única de Verdad:** El DTO es la definición explícita de lo que la API espera, sirviendo como una documentación viva y precisa.

### 5.3. Ejemplo Exhaustivo: El Flujo de POST /api/inscripciones

Vamos a materializar el flujo completo para el caso de uso de inscribir a un estudiante.

**1. El DTO de Creación (crear-inscripcion.dto.ts)**

Primero, definimos la forma exacta de los datos que el cuerpo de la solicitud debe tener.

● **Ubicación:** src/modules/academico/inscripciones/dtos/crear-inscripcion.dto.ts

```typescript
// Fichero: src/modules/academico/inscripciones/dtos/crear-inscripcion.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

// Esta clase define la estructura y las reglas de validación
// para el cuerpo de la petición POST /api/inscripciones.
export class CrearInscripcionDto {
  @IsNumber({}, { message: 'El campo clase_id debe ser un número.' })
  @IsNotEmpty({ message: 'El campo clase_id es requerido.' })
  clase_id: number;

  @IsNumber({}, { message: 'El campo estudiante_id debe ser un número.' })
  @IsNotEmpty({ message: 'El campo estudiante_id es requerido.' })
  estudiante_id: number;
}
```

**Análisis del DTO:**
○ @IsNumber(): Asegura que el valor proporcionado sea un número. Si se envía un texto, la petición será rechazada automáticamente.
○ @IsNotEmpty(): Asegura que el campo no esté vacío o ausente.
○ message: Permite definir mensajes de error personalizados y claros para el frontend.

**2. El Controlador (inscripciones.controller.ts)**

Ahora, el controlador utiliza este DTO para proteger el endpoint.

● **Ubicación:** src/modules/academico/inscripciones/inscripciones.controller.ts

```typescript
// Fichero: src/modules/academico/inscripciones/inscripciones.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CrearInscripcionDto } from './dtos/crear-inscripcion.dto';
import { JwtAuthGuard } from 'src/core/security/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/security/guards/roles.guard';
import { Roles } from 'src/core/security/decorators/roles.decorator';
import { GetUser } from 'src/core/security/decorators/get-user.decorator';
import { Tutor } from '@prisma/client'; // Asumiendo que Prisma genera este tipo

@Controller('inscripciones') // Define la ruta base para este controlador: /api/inscripciones
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post() // Escucha en el método POST para la ruta /api/inscripciones
  @HttpCode(HttpStatus.CREATED) // Establece el código de estado de éxito a 201 Created
  @UseGuards(JwtAuthGuard, RolesGuard) // Aplica los 'guards' de seguridad
  @Roles('Tutor') // Define que solo los usuarios con el rol 'Tutor' pueden acceder
  async crearInscripcion(
    @Body() crearInscripcionDto: CrearInscripcionDto, // Valida el cuerpo con el DTO
    @GetUser() tutor: Tutor, // Decorador personalizado para extraer al tutor del token
  ) {
    // 1. La validación del DTO ya ocurrió automáticamente gracias a NestJS.
    // 2. La autenticación (JwtAuthGuard) y autorización (RolesGuard) ya ocurrieron.
    // 3. Delega TODA la lógica de negocio al servicio.
    const nuevaInscripcion = await this.inscripcionesService.crear(crearInscripcionDto, tutor);

    // 4. Devuelve el resultado. NestJS lo convertirá a JSON y lo enviará.
    return nuevaInscripcion;
  }
}
```

**Análisis del Controlador:**
○ @Controller('inscripciones'): Le dice a NestJS que esta clase manejará las rutas que comiencen con /inscripciones.
○ @Post(): Especifica que el siguiente método manejará las peticiones POST.
○ @UseGuards(...) y @Roles(...): Aplican nuestra capa de seguridad. JwtAuthGuard asegura que el usuario esté logueado. RolesGuard verifica que el usuario tenga el rol de 'Tutor'. Veremos esto en la siguiente sección.
○ @Body() crearInscripcionDto: CrearInscripcionDto: Este es el punto clave. NestJS intercepta el cuerpo de la petición, lo instancia como CrearInscripcionDto y ejecuta las validaciones definidas. Si alguna falla, el código del método crearInscripcion nunca se ejecuta.
○ @GetUser(): Es un decorador personalizado (que definiremos) que simplifica la extracción de los datos del usuario del objeto de la petición.

Hemos definido de manera inequívoca cómo la capa de API actúa como una barrera de validación robusta y un punto de delegación claro hacia la lógica de negocio. El equipo de desarrollo tiene ahora un patrón limpio y repetible para construir cada uno de los endpoints especificados en la API v1.0.

## Sección 6: Estrategia de Seguridad y Middlewares

Esta sección define el perímetro de seguridad de nuestra API. Nuestra estrategia se basa en un enfoque de defensa por capas, utilizando estándares de la industria para la autenticación y un sistema de control de acceso granular y declarativo para la autorización.

### 6.1. Autenticación: ¿Quién Eres?

El principio es simple: Supabase Auth es la única fuente de verdad para la identidad del usuario. Nuestro backend no gestionará contraseñas; delega esa responsabilidad crítica a Supabase, lo que aumenta drásticamente la seguridad del sistema.

**El Flujo de Autenticación:**

1. **Inicio de Sesión:** El usuario (tutor, estudiante, etc.) interactúa con el frontend para iniciar sesión. El frontend se comunica directamente con los endpoints de Supabase Auth (/auth/v1/token?grant_type=password).

2. **Obtención del Token:** Si las credenciales son correctas, Supabase genera un JSON Web Token (JWT) y se lo devuelve al frontend. Este token es una credencial digital segura que contiene información sobre el usuario (como su ID único o UUID) y está firmado criptográficamente por Supabase.

3. **Comunicación con nuestra API:** Para cada solicitud posterior a nuestra API de NestJS (ej. GET /api/clases), el frontend debe incluir este JWT en la cabecera de la petición:
   ```
   Authorization: Bearer <EL_TOKEN_JWT_DE_SUPABASE>
   ```

**Implementación en NestJS: La JwtStrategy**

Nuestro backend necesita validar cada token que recibe. Para esto, usaremos el módulo @nestjs/passport junto con la librería passport-jwt. Crearemos una Estrategia de JWT.

● **Ubicación:** src/core/security/strategies/jwt.strategy.ts
● **Responsabilidad:**
○ Extraer el token JWT de la cabecera Authorization.
○ Verificar la firma del token usando el secreto JWT de nuestro proyecto de Supabase. Esto garantiza que el token no ha sido alterado y que fue emitido por una fuente de confianza (nuestro Supabase).
○ Una vez validado, extraer el payload del token. El dato más importante aquí es el sub (subject), que corresponde al id (UUID) del usuario en la tabla auth.users de Supabase.
○ Usar ese id para buscar el perfil completo del usuario en nuestra propia base de datos (en las tablas tutores, docentes, etc.). Esto nos permite saber no solo quién es, sino qué rol tiene y sus datos de perfil.
○ Adjuntar el objeto de perfil del usuario al objeto request de la petición. Este es un paso crucial que hace que los datos del usuario estén disponibles para las siguientes capas de seguridad y controladores.

### 6.2. Autorización: ¿Qué Tienes Permiso de Hacer?

Una vez que hemos autenticado al usuario y sabemos quién es, necesitamos controlar a qué endpoints puede acceder. Esto lo lograremos con Guards de NestJS. Los Guards son clases que se ejecutan antes que un controlador y deciden si la petición puede continuar o no.

**1. El JwtAuthGuard (El Portero Principal)**

● **Ubicación:** src/core/security/guards/jwt-auth.guard.ts
● **Responsabilidad:** Este es el guard más fundamental. Su única misión es activar la JwtStrategy. Si la estrategia valida el token con éxito, la petición continúa. Si no hay token o este es inválido, el guard detiene la petición inmediatamente y devuelve una respuesta 401 Unauthorized.
● **Uso:** Se aplicará a todos los endpoints que requieran que un usuario esté logueado.

**2. El RolesGuard y el Decorador @Roles (El Guardia de Zonas VIP)**

Necesitamos un control más fino. No basta con saber que el usuario está logueado; debemos saber si es un Tutor, un Docente o un Administrador.

● **Implementación:**
a. **Decorador @Roles:** Crearemos un decorador personalizado (src/core/security/decorators/roles.decorator.ts) que nos permitirá especificar los roles permitidos directamente sobre el endpoint en el controlador. Ejemplo: @Roles('Tutor', 'Admin').
b. **Guard RolesGuard:** (src/core/security/guards/roles.guard.ts). Este guard se activa después del JwtAuthGuard. Su lógica es: 1. Obtiene los roles permitidos del decorador @Roles. 2. Mira el perfil del usuario que fue adjuntado a la request por la JwtStrategy. 3. Compara el rol del usuario con la lista de roles permitidos. 4. Si hay una coincidencia, la petición continúa. Si no, el guard la detiene y devuelve una respuesta 403 Forbidden.

### 6.3. Poniendo Todo Junto: Anatomía de un Endpoint Seguro

Revisitemos nuestro controlador de inscripciones para ver cómo estas piezas encajan a la perfección.

```typescript
// Fichero: src/modules/academico/inscripciones/inscripciones.controller.ts
// ... (imports)

@Controller('inscripciones')
export class InscripcionesController {
  // ... (constructor)

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- CAPA DE SEGURIDAD
  @Roles('Tutor') // <-- REGLA DE AUTORIZACIÓN
  async crearInscripcion(
    @Body() crearInscripcionDto: CrearInscripcionDto,
    @GetUser() tutor: Tutor, // <-- DECORADOR DE CONVENIENCIA
  ) {
    // ...
  }
}
```

**Análisis del Flujo de Seguridad:**

1. Llega una petición a POST /api/inscripciones.
2. @UseGuards se activa. Primero ejecuta JwtAuthGuard.
3. JwtAuthGuard invoca la JwtStrategy. La estrategia valida el token JWT. Si es válido, adjunta el perfil del tutor a la request y cede el control. Si no, la petición muere aquí con un 401.
4. El control pasa al RolesGuard.
5. RolesGuard ve el decorador @Roles('Tutor'). Mira el perfil del usuario en la request y comprueba si su rol es 'Tutor'. Si lo es, la petición continúa. Si no (ej. es un 'Docente'), la petición muere aquí con un 403.
6. Solo si ambos guards pasan, el código dentro del método crearInscripcion se ejecuta.
7. El decorador @GetUser() (otro decorador personalizado que crearemos) extrae de forma limpia el perfil del tutor de la request para que podamos usarlo fácilmente.

Esta arquitectura nos proporciona un sistema de seguridad que es a la vez robusto, centralizado y extremadamente legible. Un desarrollador puede entender las reglas de acceso a un endpoint con solo mirar sus decoradores.

Hemos fortificado nuestra API. Sabemos quién puede entrar y a qué habitaciones tiene acceso. El siguiente paso es definir cómo manejaremos las situaciones en las que las cosas no salen como se esperaba.

## Sección 7: Gestión de Errores Centralizada

El objetivo de esta sección es definir una estrategia global y unificada para manejar todos los errores que puedan ocurrir en la aplicación. Una API robusta no es aquella que nunca falla, sino aquella que falla de manera predecible, consistente y segura. Nunca expondremos detalles internos del sistema (como trazas de código o mensajes de error de la base de datos) a los clientes.

### 7.1. El Problema: Errores Inconsistentes y Poco Seguros

Si no gestionamos los errores de forma centralizada, cada error (un cupo lleno, un ID no encontrado, una falla de conexión a la base de datos) podría devolver una respuesta con un formato diferente. Peor aún, un error inesperado podría filtrar información sensible del servidor (un "stack trace"), lo que representa una vulnerabilidad de seguridad y una mala experiencia para el desarrollador del frontend.

### 7.2. La Solución: Un Filtro Global de Excepciones (Exception Filter)

NestJS nos proporciona un mecanismo poderoso para solucionar esto: los Filtros de Excepciones. Crearemos un único filtro, un AllExceptionsFilter, que actuará como una red de seguridad para toda la aplicación. Cualquier excepción que no sea controlada explícitamente en algún punto del código será capturada por este filtro.

● **Ubicación:** src/core/common/filters/all-exceptions.filter.ts
● **Responsabilidad:**

1. Atrapar cualquier tipo de excepción lanzada en la aplicación.
2. Identificar el tipo de error.
3. Establecer el código de estado HTTP apropiado.
4. Construir una respuesta JSON con un formato consistente y seguro.
5. Registrar (Loggear) el error completo en la consola del servidor para fines de depuración, especialmente en caso de errores inesperados.

### 7.3. Anatomía del Filtro de Excepciones

Nuestro filtro manejará principalmente tres categorías de errores:

1. **Excepciones HTTP (HttpException):** Son los errores "esperados" que lanzamos nosotros mismos desde nuestros servicios (ej. new NotFoundException('Clase no encontrada'), new ConflictException('Clase sin cupo'), new ForbiddenException('Membresía no activa')). El filtro simplemente tomará el mensaje y el código de estado de estas excepciones y les dará nuestro formato estándar.

2. **Errores de Base de Datos (Prisma):** A veces, Prisma lanzará un error si violamos una restricción de la base de datos (ej. intentar crear un usuario con un dni que ya existe, lo cual viola una restricción UNIQUE). Estos errores (ej. PrismaClientKnownRequestError con código P2002) son crípticos. Nuestro filtro los traducirá a una HttpException comprensible, como un 409 Conflict.

3. **Errores Inesperados (Error Genérico):** Cualquier otro error que no sea de los tipos anteriores (un bug en el código, una librería externa que falla). Para estos, el filtro siempre devolverá un código 500 Internal Server Error con un mensaje genérico como "Ha ocurrido un error inesperado en el servidor". Es CRÍTICO que en este caso no filtremos ningún detalle del error al cliente, pero sí registremos la traza completa en nuestros logs para poder investigarlo.

### 7.4. El Formato de Respuesta de Error Unificado

Toda respuesta de error de la API de Mateatletas seguirá esta estructura JSON exacta. Esto le da al equipo de frontend una forma predecible de manejar cualquier problema.

```json
{
  "statusCode": 403,
  "message": "Tu membresía no se encuentra activa para realizar inscripciones.",
  "error": "Forbidden",
  "timestamp": "2025-10-11T04:05:12.345Z",
  "path": "/api/inscripciones"
}
```

● **statusCode:** El código de estado HTTP.
● **message:** Un mensaje claro y legible para el humano (y potencialmente mostrable al usuario final).
● **error:** Una descripción corta del tipo de error HTTP (ej. "Not Found", "Conflict", "Unauthorized").
● **timestamp:** La fecha y hora en que ocurrió el error.
● **path:** La ruta de la API que fue invocada.

### 7.5. Activación Global

Para que nuestro filtro se aplique a toda la aplicación, lo registraremos en el punto de entrada de la aplicación.

● **Ubicación de la activación:** src/main.ts

```typescript
// Fichero: src/main.ts
// ... (imports)
import { AllExceptionsFilter } from './core/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ... (otras configuraciones como validación global de DTOs)

  // Activamos nuestro filtro de excepciones para toda la aplicación.
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();
```

Con esta sección, hemos completado el blindaje de nuestra API. Tu equipo de desarrollo ahora tiene un plan claro para asegurar que la aplicación no solo funcione bien en el "camino feliz", sino que se comporte de manera robusta, segura y profesional cuando enfrente problemas.

## Sección 8: Plan de Pruebas (Testing Strategy)

El objetivo de esta sección es definir la estrategia que seguirá el equipo de desarrollo para verificar la calidad y la correctitud del código. La escritura de pruebas no es una fase opcional ni un "extra"; es una parte integral del proceso de desarrollo. Nuestro enfoque se basará en el modelo clásico y probado de la Pirámide de Pruebas.

### 8.1. Pruebas Unitarias (Unit Tests): El Fundamento

● 🎯 **¿Qué probamos?** La lógica de negocio dentro de nuestros Servicios (\*.service.ts), en completo aislamiento. Cada función o método de un servicio será probado de forma individual. Por ejemplo, probaremos la función crearInscripcion sin necesidad de un controlador o una base de datos real.

● ⚙️ **¿Cómo lo probamos?** Utilizaremos la técnica de "Mocking" (simulación). Crearemos una versión falsa de dependencias como el PrismaService. Esto nos permite controlar exactamente qué devuelven las llamadas a la "base de datos" y verificar que nuestro servicio se comporta como esperamos en cada escenario posible (éxito, cupo lleno, membresía inactiva, etc.).

● 🛠 **Herramientas:** Jest, el framework de pruebas que viene por defecto con NestJS.

● ✅ **Ejemplo de Casos de Prueba para InscripcionesService:**
○ Debería crear una inscripción exitosamente si todas las condiciones son válidas.
○ Debería lanzar una ForbiddenException si el estudiante no pertenece al tutor.
○ Debería lanzar una ForbiddenException si la membresía del tutor no está activa.
○ Debería lanzar una ConflictException si el cupo_maximo de la clase ha sido alcanzado.

Estas pruebas son extremadamente rápidas (milisegundos) y nos dan una confianza inmediata sobre la lógica central de la aplicación.

### 8.2. Pruebas de Integración (Integration Tests): Conectando las Piezas

● 🎯 **¿Qué probamos?** Probamos cómo colaboran las diferentes unidades de nuestro código. Específicamente, verificamos el flujo completo desde el Controlador hasta la Base de Datos. Una prueba de integración simula una petición HTTP real y comprueba que el resultado en la base de datos es el correcto.

● ⚙️ **¿Cómo lo probamos?** Usaremos una base de datos de pruebas separada. Cada vez que se ejecuten las pruebas, esta base de datos se creará, se llenará con los datos necesarios para la prueba y se limpiará al finalizar. Esto garantiza que las pruebas no interfieran entre sí y no toquen los datos de desarrollo.

● 🛠 **Herramientas:** Supertest (integrado en NestJS para simular peticiones HTTP) y Prisma para gestionar la base de datos de pruebas.

● ✅ **Ejemplo de Caso de Prueba para POST /api/inscripciones:**

1. **Preparación (Arrange):** En la base de datos de pruebas, crear un tutor, un estudiante, un producto y una clase con cupo_maximo de 1 y cupos_ocupados de 0.
2. **Actuación (Act):** Realizar una petición POST real al endpoint /api/inscripciones con el token de autenticación del tutor y los IDs correctos.
3. **Aserción (Assert):**
   ■ Verificar que la respuesta HTTP tenga un código de estado 201 Created.
   ■ Verificar que el cuerpo de la respuesta contenga los datos de la nueva inscripción.
   ■ Consultar directamente la base de datos de pruebas para confirmar que el cupos_ocupados de la clase ahora es 1.

### 8.3. Pruebas de Extremo a Extremo (End-to-End, E2E Tests): La Simulación Real

● 🎯 **¿Qué probamos?** El sistema completo, desde la perspectiva del cliente (el frontend). Estas pruebas verifican flujos de usuario completos que involucran múltiples endpoints de la API.

● ⚙️ **¿Cómo lo probamos?** De manera muy similar a las pruebas de integración, pero cubriendo un escenario de negocio completo. Se ejecutan contra un entorno que es una réplica lo más fiel posible al de producción.

● 🛠 **Herramientas:** Supertest.

● ✅ **Ejemplo de Caso de Prueba de "Flujo de Feedback del Docente":**

1. Simular el login de un docente para obtener un token (POST /auth/v1/token).
2. Con ese token, obtener su lista de clases (GET /api/docentes/me/clases).
3. Tomar una clase y obtener su lista de asistencia (GET /api/clases/{id}/asistencia).
4. Tomar una inscripción y registrar la asistencia y observaciones (PATCH /api/inscripciones/{id}).
5. Otorgarle puntos a ese estudiante por su participación (POST /api/puntos-otorgados).
6. Verificar que el estado final en la base de datos para todas las entidades involucradas sea el correcto.

## Guía de Construcción del Backend: Mateatletas v1.0

Este documento es el plano de ejecución definitivo para la construcción del servidor de la plataforma Mateatletas, basado en el Documento de Diseño Técnico.

### Fase 0: Configuración del Entorno y Cimientos del Proyecto

**Objetivo:** Preparar un esqueleto de proyecto limpio, funcional y listo para escalar.

1. **Inicializar el Proyecto NestJS:**
   ○ Usa el NestJS CLI para crear el proyecto: `nest new mateatletas-backend`.
   ○ Elige npm, yarn o pnpm como gestor de paquetes.
   ○ El proyecto se creará con la estructura básica y TypeScript ya configurado.

2. **Instalar Dependencias Clave:**
   ○ Prisma (ORM): `npm install prisma --save-dev` y `npm install @prisma/client`.
   ○ Seguridad (Passport): `npm install @nestjs/passport passport passport-jwt` y `npm install --save-dev @types/passport-jwt`.
   ○ Validación (DTOs): `npm install class-validator class-transformer`.
   ○ Configuración: `npm install @nestjs/config`.

3. **Estructurar el Proyecto:**
   ○ Dentro de la carpeta /src, crea la estructura de directorios exacta definida en la Sección 2: Arquitectura del Software.
   ○ Crea las carpetas core, modules.
   ○ Dentro de core, crea config, database, security, common.
   ○ Dentro de modules, crea las carpetas para cada dominio: auth, usuarios, catalogo, academico, etc.

4. **Configurar Prisma y la Base de Datos:**
   ○ Inicia Prisma en el proyecto: `npx prisma init`. Esto creará la carpeta /prisma con el archivo schema.prisma.
   ○ Configura el datasource db en schema.prisma para que apunte a tu base de datos PostgreSQL de Supabase. La URL de conexión debe ser gestionada a través de una variable de entorno DATABASE_URL en un archivo .env.

5. **Activar Validaciones y Filtros Globales en main.ts:**
   ○ Configura la aplicación para que use ValidationPipe de forma global. Esto activará automáticamente la validación de todos los DTOs en toda la API.
   ○ Crea el archivo del filtro de excepciones global en src/core/common/filters/all-exceptions.filter.ts.
   ○ Regístralo globalmente en main.ts con `app.useGlobalFilters(new AllExceptionsFilter())`.

### Fase 1: Esquema de Datos y Módulo Core

**Objetivo:** Traducir todo el modelo de datos a código y establecer la conexión central a la base de datos.

1. **Modelar en schema.prisma:**
   ○ Abre prisma/schema.prisma.
   ○ Traduce cada tabla del diseño lógico de la base de datos a un modelo de Prisma. Define todos los campos, tipos y, fundamentalmente, las relaciones (@relation) entre los modelos. Presta especial atención a los campos UUID que se vinculan con auth.users de Supabase.

2. **Ejecutar la Primera Migración:**
   ○ Una vez que el esquema esté completo, ejecuta la primera migración para crear toda la estructura de tablas en tu base de datos de Supabase:

   ```
   npx prisma migrate dev --name "initial-schema"
   ```

   ○ Verifica en el panel de Supabase que todas las tablas y relaciones se hayan creado correctamente.

3. **Implementar el PrismaService:**
   ○ Crea el servicio src/core/database/prisma.service.ts.
   ○ Este servicio extenderá PrismaClient y manejará el ciclo de vida de la conexión.
   ○ Crea un DatabaseModule y exporta el PrismaService para que esté disponible en toda la aplicación a través de la inyección de dependencias.

### Fase 2: Implementación de la Seguridad y Autenticación

**Objetivo:** Blindar la API. Ningún endpoint de negocio se construye hasta que la seguridad esté implementada y probada.

1. **Configurar Módulo de Autenticación (auth):**
   ○ Configura el AuthModule e importa PassportModule y JwtModule.
   ○ En la configuración de JwtModule.register, usa el JWT_SECRET de tu proyecto de Supabase, cargado de forma segura a través de un servicio de configuración (ConfigService).

2. **Implementar la Estrategia JWT:**
   ○ Crea la JwtStrategy en src/core/security/strategies/jwt.strategy.ts.
   ○ Su lógica debe validar el token y usar el id (UUID) del payload para buscar el perfil del usuario en tu base de datos y adjuntarlo a la petición.

3. **Crear los Guards de Seguridad:**
   ○ Implementa el JwtAuthGuard (src/core/security/guards/jwt-auth.guard.ts).
   ○ Implementa el decorador @Roles y el RolesGuard (src/core/security/guards/roles.guard.ts) para la autorización basada en roles.

4. **Crear Decoradores de Conveniencia:**
   ○ Implementa el decorador @GetUser (src/core/security/decorators/get-user.decorator.ts) para extraer fácilmente el usuario de la petición en los controladores.

5. **Configurar Trigger de Creación de Perfil en Supabase:**
   ○ Dentro de Supabase, crea una función y un trigger en la tabla auth.users. Este trigger se disparará con cada nuevo registro y su función será insertar una nueva fila en tu tabla public.tutores (o docentes, etc.), vinculando el id de auth.users con el id de tu tabla de perfil.

### Fase 3: Construcción de Módulos Fundamentales (Lectura)

**Objetivo:** Implementar los endpoints de lectura que son la base para la funcionalidad de la plataforma.

1. **Módulo Usuarios:**
   ○ Crea el UsuariosModule, UsuariosController y UsuariosService.
   ○ Implementa el endpoint GET /api/perfiles/me. El controlador usará @UseGuards(JwtAuthGuard) y @GetUser. El servicio recibirá el objeto de usuario y devolverá su perfil completo.

2. **Módulo Catalogo:**
   ○ Crea el CatalogoModule, CatalogoController y CatalogoService.
   ○ Implementa el endpoint GET /api/productos. El servicio usará PrismaService para buscar todos los productos activos. El controlador manejará los parámetros de query opcionales (modelo_cobro, modelo_servicio) para filtrar los resultados.

### Fase 4: Lógica de Negocio Crítica (Escritura y Pagos)

**Objetivo:** Implementar los flujos de negocio más complejos que involucran escritura de datos y comunicación con servicios de terceros.

1. **Módulo Pagos:**
   ○ Implementa los endpoints POST /api/membresias y POST /api/inscripciones-curso.
   ○ El servicio correspondiente creará un registro en la base de datos con estado 'Pendiente'.
   ○ Integrará el SDK de Mercado Pago para generar una preferencia de pago y devolverá la checkout_url.
   ○ **Implementa el Webhook:** Crea el endpoint POST /api/webhooks/mercado-pago. Este es un componente crítico. Debe:
   ■ Ser una Edge Function para máxima fiabilidad.
   ■ Validar la firma de la petición para asegurar que proviene de Mercado Pago.
   ■ Actualizar el estado del registro de 'Pendiente' a 'Activa' si el pago fue aprobado.

2. **Módulo Academico (Sub-módulo Inscripciones):**
   ○ Implementa el endpoint POST /api/inscripciones.
   ○ El InscripcionesService debe ejecutar toda la lógica de validación detallada en el diseño: verificar membresía activa, propiedad del estudiante y cupo disponible.
   ○ La operación de escritura debe usar una transacción de Prisma ($transaction) para crear el registro en inscripciones y actualizar el contador cupos_ocupados en clases como una única operación atómica.

### Fase 5: Implementación de Herramientas de Roles y Gamificación

**Objetivo:** Construir las funcionalidades específicas para los docentes y el sistema de motivación para los estudiantes.

1. **Endpoints del Docente (en AcademicoModule):**
   ○ Implementa GET /api/clases/{id}/asistencia. El guard de este endpoint debe ser más complejo, asegurando no solo que el usuario es un 'Docente', sino que es el docente asignado a esa clase específica.
   ○ Implementa PATCH /api/inscripciones/{id} para registrar feedback.

2. **Módulo Gamificacion:**
   ○ Implementa POST /api/puntos-otorgados. El servicio creará el registro en puntos_obtenidos.
   ○ **Configurar Trigger de Puntos en Supabase:** Crea un trigger en la tabla puntos_obtenidos. Tras cada INSERT, este trigger debe calcular la suma total de puntos para el estudiante_id y actualizar el campo puntos_totales en la tabla estudiantes. Esto mantiene los totales pre-calculados para un rendimiento óptimo, como se especifica en el diseño.
   ○ Implementa el endpoint POST /api/lecciones/{id}/completar. El servicio ejecutará la lógica de automatización para otorgar puntos y logros basándose en los campos de la lección (puntos_por_completar, logro_desbloqueable_id).

### Fase 6: Pruebas, Despliegue y Mantenimiento

**Objetivo:** Garantizar la calidad del código y poner la aplicación en producción.

1. **Ejecutar el Plan de Pruebas:**
   ○ A lo largo de todo el desarrollo, el equipo debe escribir pruebas unitarias para cada método de servicio, simulando sus dependencias.
   ○ Para cada endpoint, se deben escribir pruebas de integración que involucren una base de datos de prueba para verificar el flujo completo.

2. **Preparar para Producción:**
   ○ Configurar las variables de entorno de producción en el entorno de despliegue (ej. Vercel, Render, AWS).
   ○ Asegurarse de que el DATABASE_URL y el JWT_SECRET sean los de producción.

3. **Despliegue Continuo (CI/CD):**
   ○ Configurar un pipeline de despliegue simple que:
   1. Instale las dependencias (npm install).
   2. Ejecute las pruebas (npm test).
   3. Si las pruebas pasan, aplique las migraciones de la base de datos: `npx prisma migrate deploy`.
   4. Construya la aplicación (npm run build).
   5. Despliegue el resultado en el servidor de producción.
