# Sección 1: Stack Tecnológico y Arquitectura Frontend

## 1.1. Filosofía y Objetivos

El propósito de este documento es establecer la base tecnológica sobre la cual construiremos la totalidad de la experiencia de usuario de Mateatletas. La selección de cada herramienta responde a tres objetivos clave:

1. **Velocidad de Desarrollo:** Utilizar un ecosistema cohesivo que nos permita traducir rápidamente el detallado Sistema de Diseño v1.0 y la API v1.0 en una aplicación funcional y robusta.

2. **Experiencia de Usuario Superior:** Construir una interfaz que se sienta instantáneamente reactiva, rápida y viva, cumpliendo con los principios de "Energía Táctil" y "Tecno-Jungla".

3. **Mantenibilidad a Largo Plazo:** Crear una base de código limpia, organizada y fuertemente tipada que pueda crecer y evolucionar a través de las 4 fases del proyecto sin acumular deuda técnica.

## 1.2. Stack Tecnológico Detallado

A continuación, se detalla cada componente de nuestro stack frontend.

### Framework Principal: Next.js (App Router)

Next.js será el esqueleto de nuestra aplicación. Su arquitectura híbrida es perfecta para el modelo de negocio de Mateatletas.

- **Renderizado en el Servidor (SSR) para Captación:** Para las páginas públicas y de marketing, como la Landing Page del Torneo Anual (Fase 2) o la Página de Ventas de la Colonia de Verano (Fase 3), usaremos SSR. Esto significa que el HTML se genera en el servidor, lo que nos da dos ventajas cruciales:
  - **SEO Óptimo:** Los motores de búsqueda pueden indexar nuestro contenido fácilmente, maximizando la visibilidad.
  - **Performance Percibida:** Los nuevos clientes verán el contenido de la página casi al instante, reduciendo la tasa de rebote.

- **Renderizado en el Cliente (CSR) para Interacción:** Para los ecosistemas de usuario logueado —el Dashboard del Estudiante, el Panel del Tutor y el Panel del Docente—, usaremos una estrategia de renderizado en el cliente. Aquí la prioridad es una interactividad máxima y una sensación de "aplicación de escritorio", donde los cambios en la UI son instantáneos.

### Lenguaje: TypeScript

TypeScript es el pegamento que une nuestro frontend con el backend de forma segura. Su rol es innegociable.

- **Contrato de Tipos:** La API del backend ha sido meticulosamente definida con DTOs (Data Transfer Objects). Nosotros crearemos interfaces y tipos de TypeScript que serán un espejo exacto de cada una de esas estructuras de datos.

- **Seguridad de Extremo a Extremo:** Al hacer una llamada a POST /api/inscripciones, TypeScript nos forzará a enviar un objeto con clase_id: number y estudiante_id: number. Si intentamos enviar un string o un campo con otro nombre, el error será detectado durante el desarrollo, no en producción. Esto elimina una categoría entera de bugs.

- **Autocompletado Inteligente:** Al recibir la respuesta de GET /api/productos, nuestro editor de código sabrá que cada producto tiene campos como nombre, precio_base y modelo_cobro, acelerando el desarrollo y reduciendo errores de tipeo.

### Estilado: Tailwind CSS

Continuaremos con la base ya establecida en los archivos globals.css y layout.tsx. Tailwind CSS es la herramienta perfecta para implementar nuestro sistema de diseño de manera sistemática.

- **Implementación del "Sistema de Diseño v1.0":** En lugar de escribir CSS personalizado para cada componente, encapsularemos la estética de Mateatletas directamente en la configuración de Tailwind.
  - **Contenedor Unificado:** Crearemos una clase de componente (ej: .card-mateatletas) que aplique automáticamente el borde grueso, el color de fondo y, más importante, la sombra "chunky" no difuminada que define nuestra marca.
  - **Interruptor de Energía:** Definiremos variantes personalizadas para los botones que apliquen los estilos de los estados hover (elevación) y active (hundimiento), haciendo que el principio de "Energía Táctil" sea reutilizable con una sola clase.
  - **Tipografía:** Configuraremos Lilita One como la fuente para títulos (font-heading) y Geist Sans para el cuerpo (font-body), respetando la dualidad definida en el manual de marca.

### Gestión de Datos del Servidor: TanStack Query (React Query)

Esta es la pieza central para nuestra comunicación con la API. Manejará toda la complejidad del fetching, cacheo y actualización de datos del servidor.

- **Fetching Declarativo:** Para obtener el catálogo de cursos, en lugar de manejar manualmente estados de isLoading, error y data, simplemente usaremos el hook useQuery.

- **Cacheo Inteligente:** Cuando un tutor navegue al calendario de clases (GET /api/clases), los datos se guardarán en caché. Si navega a otra sección y vuelve, el calendario aparecerá instantáneamente mientras TanStack Query revalida los datos en segundo plano. Esto hará que la plataforma se sienta extremadamente rápida.

- **Mutaciones Simplificadas:** Acciones como inscribir un estudiante (POST /api/inscripciones) o registrar feedback (PATCH /api/inscripciones/{id}) se gestionarán con el hook useMutation. Este nos proveerá estados para deshabilitar el botón mientras la petición está en curso y mostrar notificaciones de éxito o error de forma trivial.

### Gestión de Estado del Cliente: Zustand

Para el estado que es puramente del lado del cliente y no se persiste en el backend, usaremos Zustand.

- **Propósito Definido:** Su principal y casi única responsabilidad será gestionar la sesión del usuario. Crearemos un store de autenticación que contendrá el token JWT, el perfil del usuario logueado (id, nombre, rol, etc.) y el estado de ha_completado_onboarding.

- **Mínima Complejidad:** Elegimos Zustand por su simplicidad. Nos permite crear un store global accesible desde cualquier componente sin la complejidad o el boilerplate de otras librerías, lo cual es perfecto para nuestras necesidades bien acotadas.

### Cliente HTTP: Axios

Para realizar las peticiones HTTP, usaremos Axios. Su principal ventaja es la capacidad de crear una instancia centralizada y configurarla con "interceptores".

- **Instancia Única de API:** Crearemos un único cliente de Axios que apunte a la URL base de nuestra API.

- **Interceptor de Peticiones (Request Interceptor):** Este interceptor se ejecutará antes de cada petición. Su única tarea será leer el token JWT de nuestro store de Zustand y adjuntarlo automáticamente en la cabecera Authorization: Bearer <TOKEN>. Esto nos ahorra tener que añadir el token manualmente en cada llamada a la API.

- **Interceptor de Respuestas (Response Interceptor):** Este interceptor se ejecutará después de recibir una respuesta. Lo usaremos para manejar errores de forma global. Si la API devuelve un error 401 Unauthorized (token inválido o expirado), el interceptor lo capturará, borrará la sesión del usuario del store de Zustand y lo redirigirá a la pantalla de login.

---

# Sección 2: Estructura del Proyecto Frontend

## 2.1. Filosofía de Organización: Modularidad por Dominio

Nuestra arquitectura de carpetas se basará en un principio simple: alta cohesión y bajo acoplamiento.

- **Alta Cohesión:** El código que pertenece a una misma funcionalidad o "dominio" de negocio (como la autenticación, el catálogo de productos o el calendario académico) debe vivir junto.

- **Bajo Acoplamiento:** Los módulos deben ser lo más independientes posible. El módulo del calendario no debería depender directamente de cómo funciona el módulo de gamificación, por ejemplo.

Esto nos da una estructura predecible. Si necesitamos corregir un bug en el flujo de inscripción, sabremos exactamente a qué carpeta ir, en lugar de buscar archivos dispersos por todo el proyecto.

## 2.2. Estructura de Carpetas Raíz (/)

A continuación se detalla la estructura de directorios que utilizaremos dentro de la carpeta src/. Cada carpeta tiene un propósito claro e inconfundible.

```
/
├── public/                    # Archivos estáticos (imágenes, fuentes, etc.)
├── src/
│   ├── app/                   # Rutas, páginas y layouts (Next.js App Router)
│   │   ├── (auth)/            # Grupo de rutas para login, registro, etc.
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (app)/             # Grupo de rutas protegidas (dashboards)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx     # Layout principal para la app (con header, sidebar)
│   │   │   └── ...
│   │   ├── layout.tsx         # Layout raíz de la aplicación
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/            # El corazón de nuestra UI reutilizable
│   │   ├── ui/                # Componentes base, "átomos" de nuestro diseño
│   │   ├── features/          # Componentes complejos, ligados a una funcionalidad
│   │   └── layout/            # Componentes de estructura (Header, Sidebar)
│   │
│   ├── lib/                   # Lógica y configuraciones transversales
│   │   └── axios.ts           # Configuración centralizada del cliente HTTP
│   │
│   ├── hooks/                 # Custom Hooks de React reutilizables
│   │   └── useAuth.ts         # Hook para acceder a la sesión del usuario
│   │
│   ├── store/                 # Gestión de estado del cliente (Zustand)
│   │   └── auth.store.ts      # Store para la sesión de usuario
│   │
│   ├── types/                 # Definiciones de TypeScript
│   │   ├── api/               # Tipos que espejan la respuesta de la API
│   │   └── index.ts
│   │
│   └── constants/             # Constantes de la aplicación (rutas, claves, etc.)
│
├── tailwind.config.ts         # Configuración de Tailwind CSS
├── tsconfig.json              # Configuración de TypeScript
└── ...
```

## 2.3. Anatomía de la Carpeta /components (Diseño Atómico)

Esta es la carpeta más importante para la implementación de la UI. La organizaremos siguiendo los principios de Diseño Atómico para máxima reutilización.

### /components/ui/ (Los Átomos)

Aquí vivirán nuestros componentes de UI más básicos y genéricos. No tienen lógica de negocio, solo reciben propiedades y se renderizan. Son la traducción directa del Manual de Marca y Sistema de Diseño v1.0 a código.

- **Button.tsx:** Implementará la familia de botones "Interruptor de Energía". Aceptará variantes para los colores primario (Naranja), secundario (Azul), etc.

- **Card.tsx:** Implementará el "Contenedor Unificado". Será la base para todos los paneles y tarjetas, aplicando el borde grueso y la sombra "chunky" característica.

- **ProgressBar.tsx:** La "Barra de Energía" Oficial. Un componente que recibirá un porcentaje y mostrará el progreso con el relleno amarillo vibrante.

- **Badge.tsx, Input.tsx, Modal.tsx, etc.**

### /components/features/ (Las Moléculas y Organismos)

Aquí construiremos componentes más complejos que resuelven una necesidad específica de una funcionalidad. Estos componentes importan y ensamblan los átomos de /ui.

- **/features/dashboard/CompetitionPortalCard.tsx:** La tarjeta del portal de competición. Este componente usará <Card>, <Button> y otros átomos para construir la interfaz completa de esa consola. Contendrá la lógica para manejar el estado hover y la animación de pulse del portal.

- **/features/clases/ClassCard.tsx:** La tarjeta que representa una clase disponible en el calendario del tutor.

- **/features/gamification/AchievementModal.tsx:** El modal de "Logro Desbloqueado", con la animación de confeti y la presentación de la "Gema" 3D.

### /components/layout/ (La Estructura)

Componentes dedicados a la maquetación principal de la aplicación.

- **Header.tsx:** La cabecera principal, que probablemente mostrará el perfil del usuario y el contador de "Wumpa Coins".

- **Sidebar.tsx:** La barra de navegación lateral para los dashboards.

## 2.4. Flujo de Trabajo: Un Ejemplo Práctico

Imaginemos que construimos el Dashboard del Estudiante.

1. **Construir los Átomos:** En /components/ui/, crearíamos los componentes base: Card.tsx para el contenedor y Button.tsx para el botón "¡A LA ARENA!".

2. **Ensamblar la Feature:** En /components/features/dashboard/, crearíamos el componente CompetitionPortalCard.tsx. Este importaría Card y Button y los ensamblaría, añadiendo los textos, el ícono del portal y la lógica específica.

3. **Crear la Página:** Finalmente, en la ruta /app/(app)/dashboard/page.tsx, importaríamos CompetitionPortalCard y otros componentes de feature (como WeeklyRoadmapCard, TrophyVaultCard, etc.) y los dispondríamos en la cuadrícula 2x2 definida en la arquitectura.

Esta estructura nos asegura que la lógica y la presentación están desacopladas, que nuestros componentes son reutilizables y que el proyecto es intuitivo para cualquier desarrollador que se incorpore al equipo.

---

# Sección 3: Configuración del Cliente de API y Manejo de Errores

## 3.1. Objetivo: Un Único Punto de Contacto

El propósito de esta sección es definir la creación de un cliente HTTP centralizado. Toda la comunicación entre nuestro frontend y la API v1.0 de Mateatletas pasará por este único punto. Esto nos otorga un control inmenso y simplifica drásticamente el resto de la aplicación.

Utilizaremos Axios por su robusta capacidad para configurar "interceptores", que son funciones que "vigilan" cada petición que sale y cada respuesta que llega, permitiéndonos actuar sobre ellas de forma global.

## 3.2. Creación del Cliente de API

Toda nuestra configuración vivirá en un único archivo, siguiendo la estructura que definimos.

- **Ubicación del Archivo:** src/lib/axios.ts

Primero, crearemos una instancia de Axios y la configuraremos con la URL base de nuestro backend. Esta URL se cargará desde las variables de entorno para mayor seguridad y flexibilidad entre entornos de desarrollo y producción.

```typescript
// src/lib/axios.ts
import axios from 'axios';

// 1. Creación de la instancia de Axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api', // Reemplazar con la URL real del backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

## 3.3. Interceptor de Peticiones: Autenticación Automática

Nuestra primera pieza de inteligencia. En lugar de añadir manualmente el token de autenticación en cada llamada a la API, el interceptor lo hará por nosotros.

### El Flujo:

1. Antes de que una petición sea enviada (ej. GET /api/clases), este interceptor se activa.
2. Accede a nuestro store de Zustand (useAuthStore) para obtener el token JWT del usuario logueado.
3. Si el token existe, lo inyecta en la cabecera Authorization.
4. La petición continúa su camino, ahora autenticada.

Esto desacopla completamente la lógica de autenticación de nuestros componentes. Los componentes solo piden datos; no necesitan saber cómo se autentica la petición.

```typescript
// src/lib/axios.ts (continuación)
import { useAuthStore } from '@/store/auth.store'; // Importamos nuestro futuro store de Zustand

// 2. Interceptor de Peticiones (Request Interceptor)
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token del estado de Zustand
    const token = useAuthStore.getState().token;

    // Si el token existe, lo añadimos a la cabecera de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // En caso de un error de configuración, lo rechazamos
    return Promise.reject(error);
  },
);
```

## 3.4. Interceptor de Respuestas: Manejo Global de Errores

La segunda pieza de inteligencia. Este interceptor vigilará las respuestas del servidor, especialmente los errores. Su función más crítica es manejar la expiración de la sesión.

### El Flujo:

1. El frontend hace una petición, pero el token JWT ha expirado.
2. La API de NestJS, protegida por JwtAuthGuard, devuelve una respuesta de error 401 Unauthorized.
3. Nuestro interceptor de respuestas captura este error 401.
4. Al detectarlo, entiende que la sesión ya no es válida. Procede a llamar a la función logout de nuestro store de Zustand (que borrará el token y el perfil de usuario) y redirige al usuario a la página de login.

Esto garantiza que la aplicación nunca se quede en un estado inconsistente con un usuario "parcialmente" deslogueado.

```typescript
// src/lib/axios.ts (continuación)

// 3. Interceptor de Respuestas (Response Interceptor)
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (2xx), simplemente la devolvemos
    return response;
  },
  (error) => {
    // Si el error es una respuesta del servidor (no un error de red)
    if (error.response) {
      // Caso específico: El token es inválido o ha expirado
      if (error.response.status === 401) {
        // Llamamos a la acción de logout de nuestro store para limpiar la sesión
        useAuthStore.getState().logout();

        // Redirigimos al usuario a la página de login
        // Usamos window.location para forzar una recarga completa y limpiar cualquier estado residual.
        window.location.href = '/login';
      }
    }

    // Para cualquier otro error, simplemente lo propagamos
    return Promise.reject(error);
  },
);
```

## 3.5. Resumen y Beneficios

Con este único archivo (src/lib/axios.ts), hemos logrado:

- Un cliente de API centralizado y reutilizable para toda la aplicación.
- **Autenticación transparente:** Los componentes y hooks de TanStack Query usarán este cliente sin preocuparse por la gestión de tokens.
- **Manejo de errores de sesión robusto:** Un token expirado es manejado de forma consistente en toda la plataforma, mejorando la seguridad y la experiencia del usuario.

El código en nuestros componentes ahora será increíblemente limpio. Una llamada para obtener el perfil del usuario se verá así de simple:

```typescript
// Ejemplo en un componente
import apiClient from '@/lib/axios';

const fetchUserProfile = async () => {
  const { data } = await apiClient.get('/perfiles/me');
  return data;
};
```

Sin cabeceras, sin try/catch para errores 401. Solo la lógica de negocio.

---

# Sección 4: Flujo de Autenticación y Rutas Protegidas

## 4.1. Objetivo: Gestionar la Sesión y Proteger el Acceso

El objetivo de esta sección es definir el ciclo de vida completo de la sesión de un usuario: cómo inicia sesión, cómo la aplicación "recuerda" quién es y cómo le damos acceso a las áreas que le corresponden, protegiendo las rutas que no debería ver.

## 4.2. El Almacén de Sesión (Zustand Store)

Primero, crearemos nuestro "almacén" (store) de estado global con Zustand. Este será el único lugar en toda la aplicación que contendrá la información del usuario autenticado.

- **Ubicación del Archivo:** src/store/auth.store.ts

Este store tendrá tres partes clave:

1. **state:** Los datos que almacenamos (token y perfil del usuario).
2. **actions:** Las funciones que modifican esos datos (login, logout).
3. **persistence:** Lo configuraremos para que guarde el estado en el localStorage del navegador. Esto es crucial para que la sesión del usuario persista incluso si cierra la pestaña o recarga la página.

```typescript
// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/api'; // Suponiendo que hemos definido este tipo

// 1. Definimos la forma del estado y las acciones
interface AuthState {
  token: string | null;
  profile: UserProfile | null;
  login: (token: string, profile: UserProfile) => void;
  logout: () => void;
}

// 2. Creamos el store con persistencia
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      token: null,
      profile: null,

      // Acción para iniciar sesión
      login: (token, profile) => set({ token, profile }),

      // Acción para cerrar sesión
      logout: () => set({ token: null, profile: null }),
    }),
    {
      // Nombre de la clave en localStorage
      name: 'mateatletas-auth',
    },
  ),
);
```

## 4.3. El Flujo de Inicio de Sesión

La página de Login será la encargada de orquestar el inicio de sesión.

- **Ubicación del Componente:** src/app/(auth)/login/page.tsx

### El Proceso:

1. El usuario introduce su email y contraseña en un formulario.
2. Al enviar el formulario, llamamos directamente al endpoint de Supabase POST /auth/v1/token?grant_type=password usando nuestro apiClient de Axios. La especificación de la API indica que este endpoint es público y gestionado por Supabase.
3. Si las credenciales son correctas, la API nos devolverá el access_token y los datos del perfil del usuario.
4. Con esta respuesta, llamamos a la acción login() de nuestro useAuthStore, guardando el token y el perfil en el estado global (y en localStorage).
5. Finalmente, redirigimos al usuario a su dashboard principal.

```typescript
// src/app/(auth)/login/page.tsx (Ejemplo simplificado)
'use client';

import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // 2. Llamamos al endpoint de Supabase (a través de nuestro backend si se prefiere)
      const { data } = await apiClient.post('/auth/v1/token?grant_type=password', {
        email,
        password,
      });

      // 4. Guardamos la sesión en el store de Zustand
      // Asumimos que la API devuelve { access_token, user_profile }
      login(data.access_token, data.user_profile);

      // 5. Redirigimos al dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Aquí mostraríamos un mensaje de error al usuario
    }
  };

  // ... JSX del formulario
}
```

## 4.4. Rutas Protegidas y Control de Acceso

Ahora, debemos crear el "guardián" que proteja rutas como /dashboard. Un usuario no logueado no debería poder acceder. Lo haremos de una manera elegante usando un componente Layout para nuestras rutas protegidas.

- **Ubicación del Layout:** src/app/(app)/layout.tsx

### El Mecanismo:

1. Este layout envolverá todas las páginas dentro del grupo (app).
2. Usará un useEffect para comprobar, en el lado del cliente, si existe un token en el useAuthStore.
3. Si no hay token, redirigirá inmediatamente al usuario a /login.
4. Si hay un token, permitirá que se renderice la página solicitada (el children).

```typescript
// src/app/(app)/layout.tsx
"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    // Si no hay token, lo redirigimos a la página de login.
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  // Si no hay token, podemos mostrar un loader para evitar un parpadeo.
  if (!token) {
    return <div>Cargando...</div>;
  }

  // Si el token existe, renderizamos la página protegida.
  return (
    <div>
      {/* Aquí irían el Header y Sidebar comunes para la app */}
      <main>{children}</main>
    </div>
  );
}
```

## 4.5. Control de Roles (Visual)

Si bien la API y las políticas RLS de la base de datos son la única fuente de verdad para la seguridad, podemos mejorar la experiencia de usuario ocultando elementos de la UI a los que no tienen acceso.

Podemos crear un custom hook para acceder fácilmente al perfil del usuario y a su rol.

- **Ubicación del Hook:** src/hooks/useAuth.ts

```typescript
// src/hooks/useAuth.ts
import { useAuthStore } from "@/store/auth.store";

export const useAuth = () => {
  const profile = useAuthStore((state) => state.profile);

  return {
    profile,
    // Podríamos añadir helpers como isAdmin, isTutor, etc.
    isTutor: profile?.rol === 'Tutor',
    isAdmin: profile?.rol === 'SuperAdmin', // Basado en el rol de la tabla 'administradores'
  };
};

// Ejemplo de uso en un componente de navegación
function Sidebar() {
  const { isTutor, isAdmin } = useAuth();

  return (
    <nav>
      {isTutor && <a href="/mis-hijos">Mis Hijos</a>}
      {isAdmin && <a href="/admin/panel">Panel de Admin</a>}
    </nav>
  );
}
```

Con esto, el ciclo está completo. Hemos definido cómo un usuario entra, cómo persistimos su sesión de forma segura y cómo protegemos las áreas de la aplicación, todo de una manera centralizada y mantenible.

---

# Sección 5 (Versión Corregida): Estrategia de Componentes y Sistema de Diseño

## 5.1. Objetivo: Sistematizar la Implementación Existente

El objetivo de esta sección es tomar los componentes ya construidos en brand-manual.tsx y la configuración de globals.css para establecer una biblioteca de componentes de React formal, documentada y reutilizable. No crearemos nada desde cero; extraeremos, refinaremos y organizaremos el excelente trabajo que ya se ha hecho.

## 5.2. El Fundamento: Las Variables de Tema en globals.css

Tu archivo globals.css ya establece un sistema de diseño basado en variables CSS (tokens de diseño). Este es el enfoque correcto y lo adoptaremos por completo.

- **Fuente Única de Verdad para Estilos:** En lugar de "hardcodear" valores de color (ej. #FF6B35), usaremos las clases de Tailwind que se conectan a estas variables. Por ejemplo, en lugar de un color arbitrario, usaremos bg-primary, text-foreground, border-border, etc..

- **Soporte Nativo para Temas:** Tu archivo ya define a la perfección un tema claro (:root) y uno oscuro (.dark). Al usar estas variables, cualquier componente que construyamos será compatible con el cambio de tema de forma automática y sin esfuerzo adicional.

- **Consistencia Garantizada:** Si en el futuro decidimos ajustar un color, solo tendremos que cambiarlo en un lugar (globals.css) y toda la aplicación se actualizará instantáneamente.

## 5.3. Los Átomos: Extrayendo Componentes de brand-manual.tsx

Ahora, vamos a convertir las implementaciones del manual de marca en componentes atómicos y reutilizables dentro de nuestra estructura de carpetas src/components/ui.

### Átomo 1: El Button - "Interruptor de Energía"

Tomaremos como referencia directa el componente ButtonState de tu manual.

- **Ubicación:** src/components/ui/Button.tsx
- **Lógica de Estilos:** Usaremos cva (Class Variance Authority) para replicar exactamente los colores y sombras que definiste.
- **Colores y Sombras:** Las sombras no serán genéricas. Serán exactamente las que especificaste: una sombra sólida principal y una secundaria semitransparente para dar profundidad donde aplique. Los colores (bg-orange-500, bg-blue-500) serán referenciados y, para una mejor práctica, los mapearemos en tailwind.config.ts a nombres semánticos como brand-primary y brand-secondary.

```typescript
// src/components/ui/Button.tsx (Implementación corregida y alineada)
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Definimos las variantes basándonos EXACTAMENTE en brand-manual.tsx
const buttonVariants = cva(
  "font-sans font-bold text-white rounded-lg w-full transition-transform duration-200",
  {
    variants: {
      variant: {
        // Variante Naranja (Primaria)
        primary: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
        // Variante Azul (Secundaria)
        secondary: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
      },
      // Estados de interacción que controlan la sombra y la posición
      state: {
        normal: "shadow-[0px_6px_0px_rgba(0,0,0,1)]",
        hover: "shadow-[0px_8px_0px_rgba(0,0,0,1),_0px_10px_0px_rgba(0,0,0,0.3)] -translate-y-[2px]",
        pressed: "shadow-[0px_2px_0px_rgba(0,0,0,1)] translate-y-[4px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      state: "normal",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // Simplificamos, el estado se manejará internamente
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    const [currentState, setCurrentState] = React.useState<"normal" | "hover" | "pressed">("normal");

    return (
      <button
        className={cn(buttonVariants({ variant, state: currentState, className }))}
        ref={ref}
        onMouseEnter={() => setCurrentState("hover")}
        onMouseLeave={() => setCurrentState("normal")}
        onMouseDown={() => setCurrentState("pressed")}
        onMouseUp={() => setCurrentState("hover")}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
```

### Átomo 2: La Card - "Contenedor Unificado"

Extraeremos el estilo de las tarjetas que usas en el manual para crear un componente base. La Tarjeta Básica y la Tarjeta Destacada serán variantes del mismo átomo.

- **Ubicación:** src/components/ui/Card.tsx
- **Lógica de Estilos:** Definiremos las sombras exactas como variantes. La sombra md (0px 5px 0px...) y la lg (0px 8px 0px...).

```typescript
// src/components/ui/Card.tsx (Implementación corregida)
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "bg-white rounded-lg", // Estilos base
  {
    variants: {
      shadow: {
        // Sombras exactas del Manual de Marca
        md: "shadow-[0px_5px_0px_rgba(0,0,0,1),_0px_7px_0px_rgba(0,0,0,0.3)]",
        lg: "shadow-[0px_8px_0px_rgba(0,0,0,1),_0px_12px_0px_rgba(0,0,0,0.3)]",
      },
    },
    defaultVariants: {
      shadow: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ shadow, className }))}
      {...props}
    />
  )
);

Card.displayName = "Card";

// Exportamos también los componentes de Card de shadcn/ui si los usamos
// como CardHeader, CardContent, etc., pero con nuestros estilos aplicados.
export { Card };
```

## 5.4. El Taller de Componentes: Storybook (Ahora sí, sobre lo construido)

La propuesta de usar Storybook sigue siendo fundamental, pero su rol cambia: no es para crear los componentes, sino para documentar y probar los componentes que acabamos de extraer.

### Beneficios Reenfocados:

1. **Documentación Viva:** Crearemos una "historia" para el Button. En ella, podremos ver y jugar con las variantes primary y secondary y verificar visualmente que las animaciones de hover y pressed funcionan tal como en el brand-manual.tsx.

2. **Validación de Diseño:** El diseñador podrá abrir Storybook y confirmar que el Card con shadow="lg" se ve exactamente como lo diseñó, sin necesidad de navegar por la aplicación.

3. **Desarrollo Eficiente:** Cuando un desarrollador necesite un botón, irá a Storybook, verá las opciones disponibles y copiará el código. Cero ambigüedad.

### Plan de Acción Inmediato:

1. **Centralizar Estilos:** Refactorizar tailwind.config.ts para añadir las sombras "chunky" (shadow-md-crash, shadow-lg-crash) y los colores de marca (orange-crash, blue-crash) como utilidades personalizadas.

2. **Extraer Componentes:** Mover las implementaciones de ButtonState, Card, ProgressBar, etc., desde brand-manual.tsx a sus propios archivos dentro de src/components/ui, adaptándolos para que usen las nuevas utilidades de Tailwind.

3. **Implementar Storybook:** Instalar Storybook y crear las primeras historias para los componentes extraídos, empezando por Button.stories.tsx y Card.stories.tsx.

---

# Sección 6: Implementación de Flujos Críticos

## 6.1. Objetivo: Del Diseño a la Realidad Interactiva

El objetivo de esta sección es proporcionar una guía práctica y detallada para construir una vista de usuario completa. Utilizaremos el Dashboard del Estudiante (Fase 1) como nuestro caso de estudio principal. Este flujo es ideal porque requiere:

- Múltiples fuentes de datos de la API.
- Lógica condicional (ej. mostrar el botón "¡A LA ARENA!" solo si hay una clase próxima).
- El ensamblaje de varios componentes de "feature" que a su vez utilizan nuestros "átomos" de UI.

## 6.2. El Plan de Batalla: El Dashboard del Estudiante (Fase 1)

Recordemos la estructura del dashboard definida en el documento de UX/UI: una cabecera con la información del estudiante y una cuadrícula modular 2x2 con las consolas principales.

### Paso 1: Identificación de Datos (El Contrato con la API)

Antes de escribir una sola línea de UI, identificamos qué información necesita la página. Basándonos en la especificación de la API y el diseño, el dashboard necesita:

1. **Datos del Perfil del Estudiante:** Para la cabecera (nombre, equipo, puntos totales y nivel actual para la "Barra de Energía"). Esto lo obtenemos de GET /api/perfiles/me.

2. **La Próxima Clase:** Para la consola del "Portal de Competición". Necesitamos un endpoint como GET /api/estudiantes/me/proxima-clase.

3. **El Calendario Semanal:** Para la consola "Mapa de Ruta Semanal". Endpoint: GET /api/estudiantes/me/clases-semana.

4. **Logros/Trofeos:** Para la "Bóveda de Trofeos". Endpoint: GET /api/estudiantes/me/logros.

### Paso 2: Estrategia de Fetching (El Hook Inteligente con TanStack Query)

En lugar de hacer estas cuatro llamadas a la API directamente en el componente de la página, crearemos un custom hook que encapsule toda esta lógica. Esto mantiene nuestro componente de página limpio y centrado en la presentación.

- **Ubicación del Hook:** src/hooks/useStudentDashboard.ts
- **Tecnología:** Usaremos useQuery de TanStack Query para cada petición. Esto nos da de forma gratuita el manejo de estados de carga, errores y cacheo.

```typescript
// src/hooks/useStudentDashboard.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import { UserProfile, NextClass, WeeklySchedule, Achievement } from '@/types/api';

// Funciones de fetching individuales
const fetchProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get('/perfiles/me');
  return data;
};

const fetchNextClass = async (): Promise<NextClass> => {
  const { data } = await apiClient.get('/estudiantes/me/proxima-clase');
  return data;
};

// ... (funciones similares para fetchWeeklySchedule y fetchAchievements)

// El custom hook que combina todo
export const useStudentDashboard = () => {
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['studentProfile'], // Clave de caché para el perfil
    queryFn: fetchProfile,
  });

  const { data: nextClass, isLoading: isNextClassLoader } = useQuery({
    queryKey: ['nextClass'],
    queryFn: fetchNextClass,
  });

  // ... (useQuery para schedule y achievements)

  return {
    profile,
    nextClass,
    // schedule,
    // achievements,
    isLoading: isProfileLoading || isNextClassLoader, // Estado de carga combinado
  };
};
```

### Paso 3: Ensamblaje de la Página (El Arquitecto)

Ahora, el componente de la página se vuelve increíblemente simple y declarativo. Su única responsabilidad es llamar a nuestro hook y renderizar los componentes de feature, pasándoles los datos correspondientes.

- **Ubicación de la Página:** src/app/(app)/dashboard/page.tsx

```typescript
// src/app/(app)/dashboard/page.tsx
"use client";

import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { CompetitionPortalCard } from "@/components/features/dashboard/CompetitionPortalCard";
import { CircuitStartCard } from "@/components/features/dashboard/CircuitStartCard";
// ... (otros imports)

export default function DashboardPage() {
  const { profile, nextClass, isLoading } = useStudentDashboard();

  if (isLoading) {
    // Mostramos un loader mientras se cargan los datos
    return <div>Cargando tu centro de mando...</div>;
  }

  return (
    <div>
      {/* Cabecera con la Barra de Energía */}
      <DashboardHeader profile={profile} />

      {/* La cuadrícula 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Arriba Izquierda: Portal de Competición */}
        <CompetitionPortalCard nextClass={nextClass} />

        {/* Arriba Derecha: Inicio de Circuito */}
        <CircuitStartCard />

        {/* Abajo Izquierda: Mapa de Ruta Semanal */}
        {/* <WeeklyRoadmapCard schedule={schedule} /> */}

        {/* Abajo Derecha: Bóveda de Trofeos */}
        {/* <TrophyVaultCard achievements={achievements} /> */}
      </div>
    </div>
  );
}
```

### Paso 4: Componentes en Acción (Los Especialistas)

Finalmente, cada componente de feature (como CompetitionPortalCard) recibe los datos como props y utiliza nuestros átomos de UI (Card, Button) para renderizar la interfaz.

- **Ubicación del Componente:** src/components/features/dashboard/CompetitionPortalCard.tsx

Este componente es el que contiene la lógica de presentación específica. Por ejemplo, decidirá si el botón "¡A LA ARENA!" debe estar activo y pulsando basado en la fecha de nextClass.

```typescript
// src/components/features/dashboard/CompetitionPortalCard.tsx (Ejemplo simplificado)
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NextClass } from "@/types/api";

interface Props {
  nextClass?: NextClass;
}

export const CompetitionPortalCard = ({ nextClass }: Props) => {
  const isClassSoon = nextClass && new Date(nextClass.fecha_hora_inicio) <= new Date();

  return (
    <Card shadow="lg">
      <h2 className="font-lilita text-2xl">Portal de Competición</h2>
      {nextClass ? (
        <div>
          <p>Tu próxima clase es: {nextClass.titulo}</p>
          <Button variant="secondary" disabled={!isClassSoon}>
            {isClassSoon ? "¡A LA ARENA!" : "ESPERANDO..."}
          </Button>
        </div>
      ) : (
        <p>No tienes clases programadas pronto.</p>
      )}
    </Card>
  );
};
```

Con este flujo, hemos creado una estructura clara, donde cada pieza tiene una responsabilidad única: el hook busca datos, la página organiza la estructura y los componentes de feature se encargan de la presentación.

---

# Sección 7: Estrategia de Pruebas (Testing)

## 7.1. Objetivo: Construir con Confianza y Calidad

La escritura de pruebas no es una fase final ni un extra; es una parte integral del proceso de desarrollo. El objetivo de esta estrategia es garantizar la calidad, prevenir regresiones (es decir, evitar que nuevos cambios rompan funcionalidades existentes) y permitirnos refactorizar y añadir nuevas características con la seguridad de que la aplicación sigue siendo estable.

Adoptaremos el modelo probado de la Pirámide de Pruebas, alineándonos con la misma filosofía del equipo de backend para una estrategia de calidad cohesiva.

## 7.2. La Pirámide de Pruebas en el Frontend

Nuestra estrategia se divide en tres niveles:

1. **Pruebas Unitarias (Base de la Pirámide):** Muchas pruebas rápidas y aisladas.
2. **Pruebas de Integración (Medio de la Pirámide):** Menos pruebas que verifican cómo colaboran varias piezas.
3. **Pruebas End-to-End (Cima de la Pirámide):** Muy pocas pruebas que simulan a un usuario real en toda la aplicación.

### Nivel 1: Pruebas Unitarias (Unit Tests)

#### ¿Qué probamos?

Los "átomos" de nuestro sistema en completo aislamiento:

- **Componentes de UI (/components/ui):** Verificamos que un componente se renderice correctamente según las props que recibe. Por ejemplo, que nuestro Button muestre el texto correcto y tenga los estilos de la variante primary.

- **Funciones de Lógica Pura y Hooks:** Probamos la lógica de negocio contenida en nuestros custom hooks sin necesidad de renderizar un componente.

#### Herramientas:

Jest (el framework de pruebas) y React Testing Library (para renderizar componentes en un entorno de prueba y simular interacciones).

#### Ejemplo Práctico: Probar el Button "Interruptor de Energía"

- **Caso de Prueba 1:** "Debe renderizar correctamente con el texto proporcionado".
- **Caso de Prueba 2:** "Debe aplicar las clases de Tailwind correctas para la variante secondary".
- **Caso de Prueba 3:** "Debe llamar a la función onClick cuando el usuario hace clic en él".

Estas pruebas son nuestra primera línea de defensa. Son extremadamente rápidas y nos dan feedback inmediato mientras desarrollamos.

### Nivel 2: Pruebas de Integración (Integration Tests)

#### ¿Qué probamos?

Cómo colaboran varios componentes para formar una funcionalidad completa. Probamos una "feature" o una página entera, pero simulando (mocking) las llamadas a la API.

#### Herramientas:

Jest y React Testing Library.

#### Ejemplo Práctico: Probar el CompetitionPortalCard

1. **Preparación del Escenario:** Renderizamos el componente CompetitionPortalCard en nuestro entorno de prueba.

2. **Simulación de la API:**
   - **Caso 1 (Clase Disponible):** Le pasamos una prop nextClass con una fecha y hora inminentes.
   - **Caso 2 (Sin Clases):** Le pasamos la prop nextClass como null.

3. **Aserciones (Verificaciones):**
   - **En el Caso 1:** Verificamos que el título de la clase se muestre correctamente y que el botón "¡A LA ARENA!" esté habilitado y visible.
   - **En el Caso 2:** Verificamos que se muestre el mensaje "No tienes clases programadas pronto" y que el botón principal no esté presente o esté deshabilitado.

Estas pruebas nos aseguran que la UI reacciona correctamente a los diferentes estados de los datos que provienen del backend.

### Nivel 3: Pruebas End-to-End (E2E Tests)

#### ¿Qué probamos?

Flujos de usuario completos y críticos, desde el inicio hasta el fin, interactuando con la aplicación real y el backend real en un entorno de pruebas. Estas pruebas simulan a un usuario real haciendo clic, escribiendo y navegando.

#### Herramienta:

Cypress. Es una herramienta moderna que nos permite escribir pruebas E2E de forma muy intuitiva, visualizando cada paso que el "robot" realiza en el navegador.

#### Ejemplo Práctico: Probar el "Flujo de Reserva de Clase del Tutor"

1. **Login:** Cypress abre el navegador, navega a /login, llena el formulario con credenciales de un tutor de prueba y hace clic en "Iniciar Sesión".

2. **Navegación:** Verifica que se redirige al dashboard del tutor y luego navega al calendario de clases.

3. **Interacción:** Busca una clase específica en el calendario, hace clic en ella para abrir el modal de reserva.

4. **Acción:** Selecciona a uno de sus hijos de un menú desplegable y hace clic en el botón "Confirmar Reserva".

5. **Verificación Final:** Comprueba que aparece una notificación de "Reserva exitosa" y que el estado de la clase en el calendario cambia a "Reservada".

Estas pruebas son las más lentas y costosas de mantener, pero nos dan la máxima confianza de que los flujos de negocio más importantes de Mateatletas funcionan de principio a fin.
