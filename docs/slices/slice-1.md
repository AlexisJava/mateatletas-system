import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const SliceDocumentation = () => {
  const [expandedSections, setExpandedSections] = useState({
    vision: true,
    architecture: false,
    subslices: false,
    prompts: false,
    checklist: false
  });
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const subSlices = [
    { id: 1, title: "Modelo Tutor en Prisma", duration: "10 min", dependencies: [] },
    { id: 2, title: "Módulo Auth - Estructura Base", duration: "15 min", dependencies: [1] },
    { id: 3, title: "AuthService - Lógica de Negocio", duration: "20 min", dependencies: [2] },
    { id: 4, title: "JWT Strategy y Guards", duration: "15 min", dependencies: [3] },
    { id: 5, title: "AuthController - Endpoints", duration: "15 min", dependencies: [4] },
    { id: 6, title: "Configuración Axios + Interceptores", duration: "15 min", dependencies: [5] },
    { id: 7, title: "Zustand Store de Autenticación", duration: "20 min", dependencies: [6] },
    { id: 8, title: "Componentes UI Base", duration: "25 min", dependencies: [] },
    { id: 9, title: "Página de Registro", duration: "25 min", dependencies: [7, 8] },
    { id: 10, title: "Página de Login", duration: "20 min", dependencies: [7, 8] },
    { id: 11, title: "Protected Layout", duration: "20 min", dependencies: [7] },
    { id: 12, title: "Dashboard del Tutor", duration: "25 min", dependencies: [11] },
    { id: 13, title: "Testing E2E del Flujo Completo", duration: "30 min", dependencies: [12] }
  ];

  const prompts = [
    {
      id: "prompt-1",
      title: "Sub-Slice 1: Modelo Tutor en Prisma",
      prompt: `# Tarea
Crea el modelo 'Tutor' en el schema de Prisma con los siguientes requisitos:

## Campos requeridos:
- id: String (cuid)
- email: String (único, para login)
- password_hash: String (nunca se envía al frontend)
- nombre: String
- apellido: String
- dni: String (opcional)
- telefono: String (opcional)
- fecha_registro: DateTime (default: now)
- ha_completado_onboarding: Boolean (default: false)
- createdAt: DateTime
- updatedAt: DateTime

## Consideraciones:
- El email debe ser único e indexado
- Agrega comentarios explicativos en el schema
- No crear relaciones aún (se harán en slices posteriores)

## Entregables:
1. Schema actualizado en 'apps/api/prisma/schema.prisma'
2. Comando de migración: 'pnpm --filter api prisma migrate dev --name create-tutor-model'
3. Regenerar cliente: 'pnpm --filter api prisma generate'

# Ruta del archivo
apps/api/prisma/schema.prisma`
    },
    {
      id: "prompt-2",
      title: "Sub-Slice 2: Módulo Auth - Estructura Base",
      prompt: `# Contexto
Continuamos con el Slice #1 de Tutores. Ya tenemos el modelo Tutor en Prisma.

# Tarea
Crea el módulo de autenticación en NestJS con la estructura base.

## Estructura de carpetas esperada:
\`\`\`
apps/api/src/auth/
├── auth.module.ts
├── auth.service.ts
├── auth.controller.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── get-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── register.dto.ts
    └── login.dto.ts
\`\`\`

## Requisitos:
1. **auth.module.ts**: 
   - Importar PassportModule
   - Importar JwtModule con configuración desde .env
   - Importar PrismaModule
   - Registrar AuthService y AuthController

2. **DTOs de validación**:
   - RegisterDto: email, password, nombre, apellido, dni?, telefono?
   - LoginDto: email, password
   - Usar class-validator para validaciones

3. **Instalar dependencias**:
   - @nestjs/jwt
   - @nestjs/passport
   - passport-jwt
   - bcrypt
   - class-validator
   - class-transformer

## Variables de entorno necesarias (.env):
\`\`\`
JWT_SECRET=tu-super-secreto-cambiar-en-produccion
JWT_EXPIRATION=7d
\`\`\`

## Comando de instalación:
\`\`\`bash
cd apps/api
pnpm add @nestjs/jwt @nestjs/passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
\`\`\`

# Nota
Solo crea la estructura, los servicios pueden estar vacíos (con comentarios TODO). Los implementaremos en el siguiente sub-slice.`
    },
    {
      id: "prompt-3",
      title: "Sub-Slice 3: AuthService - Lógica de Negocio",
      prompt: `# Contexto
Ya tenemos el módulo Auth estructurado. Ahora implementaremos la lógica de negocio.

# Tarea
Implementa el AuthService con todos los métodos necesarios para autenticación.

## Métodos requeridos:

### 1. register(registerDto: RegisterDto)
- Validar que el email no exista (lanzar ConflictException si existe)
- Hashear password con bcrypt (10 rounds)
- Crear tutor en BD con Prisma
- Retornar: { id, email, nombre, apellido } (sin password_hash)

### 2. login(loginDto: LoginDto)
- Buscar tutor por email
- Si no existe, lanzar UnauthorizedException
- Comparar password con bcrypt
- Si no coincide, lanzar UnauthorizedException
- Generar JWT con payload: { sub: tutor.id, email: tutor.email, role: 'tutor' }
- Retornar: { access_token, user: { id, email, nombre, apellido } }

### 3. validateUser(email: string, password: string)
- Método auxiliar usado por JWT Strategy
- Retornar tutor si válido, null si inválido

### 4. getProfile(userId: string)
- Buscar tutor por ID
- Retornar datos del tutor (sin password_hash)
- Si no existe, lanzar NotFoundException

## Consideraciones de seguridad:
- NUNCA retornar password_hash al frontend
- Usar 'select' de Prisma para excluir campos sensibles
- Logs genéricos en caso de error (no revelar si email existe)

## Ejemplo de uso de bcrypt:
\`\`\`typescript
import * as bcrypt from 'bcrypt';

// Hashear
const hash = await bcrypt.hash(plainPassword, 10);

// Comparar
const isMatch = await bcrypt.compare(plainPassword, hash);
\`\`\`

# Ruta del archivo
apps/api/src/auth/auth.service.ts`
    },
    {
      id: "prompt-4",
      title: "Sub-Slice 4: JWT Strategy y Guards",
      prompt: `# Contexto
El AuthService ya tiene la lógica. Ahora implementaremos la estrategia JWT de Passport y los guards.

# Tarea
Implementa la autenticación JWT con Passport.

## 1. JWT Strategy (apps/api/src/auth/strategies/jwt.strategy.ts)

### Requisitos:
- Extender PassportStrategy(Strategy)
- Configurar para extraer JWT del header Authorization (Bearer token)
- Inyectar AuthService
- Método validate(payload): retornar datos del usuario desde payload
- Usar secreto desde process.env.JWT_SECRET

### Ejemplo de estructura:
\`\`\`typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // payload contiene: { sub, email, role }
    // Retornar objeto que se adjuntará a request.user
  }
}
\`\`\`

## 2. JWT Auth Guard (apps/api/src/auth/guards/jwt-auth.guard.ts)
- Extender AuthGuard('jwt')
- Este guard protege rutas que requieren autenticación
- Uso: @UseGuards(JwtAuthGuard)

## 3. Roles Guard (apps/api/src/auth/guards/roles.guard.ts)
- Implementar CanActivate
- Leer roles requeridos desde metadata (decorador @Roles)
- Verificar que request.user.role coincida
- Uso: @UseGuards(JwtAuthGuard, RolesGuard)

## 4. Decoradores

### @GetUser (apps/api/src/auth/decorators/get-user.decorator.ts)
\`\`\`typescript
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Viene de JWT Strategy
  },
);
\`\`\`

### @Roles (apps/api/src/auth/decorators/roles.decorator.ts)
\`\`\`typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
\`\`\`

## 5. Actualizar auth.module.ts
- Agregar JwtStrategy a providers
- Exportar JwtStrategy y guards si es necesario

# Nota
Asegúrate de que JWT_SECRET esté en .env y nunca en el código.`
    },
    {
      id: "prompt-5",
      title: "Sub-Slice 5: AuthController - Endpoints",
      prompt: `# Contexto
Ya tenemos toda la lógica del backend implementada. Ahora expondremos los endpoints HTTP.

# Tarea
Crea el AuthController con todos los endpoints públicos y protegidos.

## Endpoints requeridos:

### 1. POST /auth/register (público)
- Body: RegisterDto
- LLama a authService.register()
- Retorna: 201 Created con usuario creado (sin password)
- En caso de email duplicado: 409 Conflict

### 2. POST /auth/login (público)
- Body: LoginDto
- Llama a authService.login()
- Retorna: 200 OK con { access_token, user }
- En caso de credenciales inválidas: 401 Unauthorized

### 3. GET /auth/profile (protegido)
- Requiere: @UseGuards(JwtAuthGuard)
- Obtiene userId desde: @GetUser() decorator
- Llama a authService.getProfile(userId)
- Retorna: 200 OK con datos del tutor

### 4. POST /auth/logout (protegido - opcional)
- Por ahora solo retorna { message: 'Logout successful' }
- El frontend eliminará el token de localStorage
- En el futuro: invalidar token con blacklist

## Ejemplo de estructura:

\`\`\`typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return this.authService.getProfile(user.sub);
  }
}
\`\`\`

## Consideraciones:
- Usa ValidationPipe global para validar DTOs automáticamente
- Maneja excepciones con filtros de NestJS
- Documenta con @ApiTags, @ApiOperation (Swagger) si lo tienes configurado

## Testing manual con cURL:
\`\`\`bash
# Registro
curl -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"tutor@test.com","password":"Pass123!","nombre":"Juan","apellido":"Pérez"}'

# Login
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"tutor@test.com","password":"Pass123!"}'

# Perfil (reemplaza TOKEN con el JWT recibido)
curl -X GET http://localhost:3001/auth/profile \\
  -H "Authorization: Bearer TOKEN"
\`\`\`

# Ruta del archivo
apps/api/src/auth/auth.controller.ts`
    },
    {
      id: "prompt-6",
      title: "Sub-Slice 6: Configuración Axios + Interceptores",
      prompt: `# Contexto
Backend completado. Comenzamos con el frontend. Necesitamos configurar Axios para comunicarnos con la API.

# Tarea
Configura Axios con interceptores que adjunten automáticamente el JWT a cada request.

## Estructura de archivos:
\`\`\`
apps/web/src/lib/
├── axios.ts          # Cliente configurado
└── api/
    └── auth.api.ts   # Funciones específicas de auth
\`\`\`

## 1. Cliente Axios (apps/web/src/lib/axios.ts)

### Requisitos:
- Base URL desde variable de entorno: NEXT_PUBLIC_API_URL
- Timeout: 10000ms
- Headers por defecto: Content-Type: application/json

### Interceptor de Request:
- Leer token desde localStorage (key: 'auth-token')
- Si existe, adjuntar header: Authorization: Bearer {token}

### Interceptor de Response:
- Si response es exitoso (2xx): retornar data directamente
- Si es 401 Unauthorized: eliminar token y redirigir a /login
- Otros errores: propagar para manejo en componentes

### Ejemplo de estructura:
\`\`\`typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
\`\`\`

## 2. API de Auth (apps/web/src/lib/api/auth.api.ts)

### Funciones requeridas:
\`\`\`typescript
export const authApi = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: (data: LoginData) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout'),
};
\`\`\`

## 3. Variables de entorno (.env.local):
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

## Instalación de dependencias:
\`\`\`bash
cd apps/web
pnpm add axios
\`\`\`

# Nota
Este cliente se usará en el Zustand store y en toda la app para comunicarse con el backend.`
    },
    {
      id: "prompt-7",
      title: "Sub-Slice 7: Zustand Store de Autenticación",
      prompt: `# Contexto
Axios ya está configurado. Ahora creamos el store global de autenticación con Zustand.

# Tarea
Implementa el store de autenticación con persistencia en localStorage.

## Ruta del archivo:
apps/web/src/store/auth.store.ts

## Requisitos del store:

### Estado:
\`\`\`typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
\`\`\`

### Acciones:
1. **login(email, password)**
   - Llamar a authApi.login()
   - Guardar token en localStorage y en state
   - Guardar user en state
   - Marcar isAuthenticated = true
   - Manejar errores y setear isLoading

2. **register(data)**
   - Llamar a authApi.register()
   - Automáticamente hacer login después
   - Manejar errores

3. **logout()**
   - Eliminar token de localStorage
   - Limpiar state (user = null, token = null, isAuthenticated = false)
   - Opcional: llamar a authApi.logout()

4. **checkAuth()**
   - Leer token de localStorage al cargar app
   - Si existe, llamar a authApi.getProfile()
   - Restaurar estado de autenticación
   - Si falla, limpiar token

5. **setUser(user)**
   - Actualizar user en state

### Persistencia:
- Usar middleware de Zustand: persist
- Persistir en localStorage solo: { token, user }
- NO persistir: isLoading

### Ejemplo de estructura:
\`\`\`typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/auth.api';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          localStorage.setItem('auth-token', response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ... resto de acciones
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
\`\`\`

## Instalación de dependencias:
\`\`\`bash
cd apps/web
pnpm add zustand
\`\`\`

## Uso en componentes:
\`\`\`typescript
const { user, login, logout, isAuthenticated } = useAuthStore();
\`\`\`

# Nota
Este store será el único punto de verdad para el estado de autenticación en toda la app.`
    },
    {
      id: "prompt-8",
      title: "Sub-Slice 8: Componentes UI Base",
      prompt: `# Contexto
Necesitamos componentes UI reutilizables con estilo Crash Bandicoot (chunky, vibrante, divertido).

# Tarea
Crea los componentes base: Button, Input y Card con Tailwind v4.

## Paleta de colores Crash Bandicoot:
\`\`\`css
--primary: #ff6b35 (naranja vibrante)
--secondary: #f7b801 (amarillo dorado)
--accent: #00d9ff (cyan brillante)
--success: #4caf50
--danger: #f44336
--dark: #2a1a5e (morado oscuro)
--light: #fff9e6 (beige claro)
\`\`\`

## Estructura de carpetas:
\`\`\`
apps/web/src/components/ui/
├── Button.tsx
├── Input.tsx
├── Card.tsx
└── index.ts (exportar todos)
\`\`\`

## 1. Button Component

### Variantes:
- primary: naranja con hover effect
- secondary: amarillo con hover effect
- outline: borde con fondo transparente
- ghost: sin fondo, solo texto

### Props:
\`\`\`typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
\`\`\`

### Estilo chunky:
- Bordes redondeados (rounded-lg)
- Sombra pronunciada (shadow-lg)
- Transform en hover (scale-105)
- Transición suave
- Font bold

## 2. Input Component

### Props:
\`\`\`typescript
interface InputProps {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
\`\`\`

### Características:
- Label flotante o arriba del input
- Borde que cambia de color en focus (cyan brillante)
- Mensaje de error en rojo debajo
- Icono de error si hay error
- Padding generoso
- Bordes redondeados

## 3. Card Component

### Props:
\`\`\`typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  hoverable?: boolean;
}
\`\`\`

### Características:
- Fondo blanco o beige claro
- Sombra suave
- Bordes redondeados
- Padding generoso
- Si hoverable: efecto lift en hover
- Título con fuente bold

## Ejemplo de Button:
\`\`\`typescript
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-lg shadow-lg transition-all duration-200 transform';
  
  const variants = {
    primary: 'bg-[#ff6b35] hover:bg-[#ff5722] text-white hover:scale-105',
    secondary: 'bg-[#f7b801] hover:bg-[#ffc107] text-[#2a1a5e] hover:scale-105',
    outline: 'border-2 border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white',
    ghost: 'text-[#ff6b35] hover:bg-[#ff6b35]/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className} disabled:opacity-50 disabled:cursor-not-allowed\`}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  );
}
\`\`\`

## Instalación de @tailwindcss/forms (opcional):
\`\`\`bash
cd apps/web
pnpm add @tailwindcss/forms
\`\`\`

# Nota
Estos componentes se usarán en TODA la app, así que hazlos accesibles y reutilizables.`
    },
    {
      id: "prompt-9",
      title: "Sub-Slice 9: Página de Registro",
      prompt: `# Contexto
Ya tenemos los componentes UI base y el store de autenticación. Ahora creamos la página de registro.

# Tarea
Implementa la página de registro completa con validaciones y UX fluida.

## Ruta del archivo:
apps/web/app/register/page.tsx

## Requisitos:

### Formulario con campos:
1. Email (required, validación de formato)
2. Password (required, mínimo 8 caracteres, al menos 1 mayúscula, 1 número)
3. Confirmar Password (debe coincidir)
4. Nombre (required)
5. Apellido (required)
6. DNI (opcional)
7. Teléfono (opcional)

### Validaciones en tiempo real:
- Validar formato de email al perder foco
- Mostrar fuerza de contraseña (débil/media/fuerte)
- Validar que passwords coincidan
- Deshabilitar botón submit si hay errores

### Flujo:
1. Usuario completa formulario
2. Click en "Registrarse"
3. Llamar a authStore.register(data)
4. Si exitoso: redirigir a /dashboard
5. Si error: mostrar mensaje de error (ej: "Email ya registrado")

### UI/UX:
- Fondo con gradiente vibrante
- Card centrado con formulario
- Animación de entrada (fadeIn)
- Loading state en botón durante submit
- Link a /login: "¿Ya tienes cuenta? Inicia sesión"

### Ejemplo de estructura:
\`\`\`typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input, Card } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Error al registrarse' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#2a1a5e] mb-6">¡Únete a Mateatletas!</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          
          {/* Resto de inputs... */}
          
          <Button type="submit" isLoading={isLoading} className="w-full">
            Registrarse
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-[#ff6b35] font-bold hover:underline">
            Inicia sesión
          </a>
        </p>
      </Card>
    </div>
  );
}
\`\`\`

## Validación de contraseña fuerte:
\`\`\`typescript
const validatePassword = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasMinLength || !hasUpperCase || !hasNumber) {
    return 'Contraseña débil';
  }
  return null;
};
\`\`\`

# Nota
Asegúrate de que la experiencia sea fluida y los errores se muestren claramente.`
    },
    {
      id: "prompt-10",
      title: "Sub-Slice 10: Página de Login",
      prompt: `# Contexto
Ya tenemos registro funcionando. Ahora implementamos el login.

# Tarea
Crea la página de login con diseño similar al registro.

## Ruta del archivo:
apps/web/app/login/page.tsx

## Requisitos:

### Formulario simple:
1. Email
2. Password
3. Checkbox "Recordarme" (opcional, para futuro)

### Flujo:
1. Usuario ingresa credenciales
2. Click en "Iniciar sesión"
3. Llamar a authStore.login(email, password)
4. Si exitoso: redirigir a /dashboard
5. Si error: mostrar "Credenciales inválidas"

### UI/UX:
- Diseño consistente con /register
- Mismo fondo gradiente
- Card centrado
- Link a /register: "¿No tienes cuenta? Regístrate"
- Link a /forgot-password (placeholder por ahora)

### Manejo de errores:
- Credenciales incorrectas: "Email o contraseña incorrectos"
- Error de red: "Error de conexión, intenta nuevamente"
- Mostrar errores en un Alert component (puedes crear uno simple)

### Ejemplo de estructura:
\`\`\`typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.status === 401
        ? 'Email o contraseña incorrectos'
        : 'Error de conexión, intenta nuevamente';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#2a1a5e] mb-2">¡Bienvenido!</h1>
        <p className="text-[#2a1a5e]/70 mb-6">Inicia sesión para continuar</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
          
          <Input
            label="Contraseña"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a href="/forgot-password" className="text-sm text-[#2a1a5e]/70 hover:underline block">
            ¿Olvidaste tu contraseña?
          </a>
          
          <p className="text-sm">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-[#ff6b35] font-bold hover:underline">
              Regístrate
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
\`\`\`

## Mejoras opcionales:
- Animación de shake al fallar login
- Mostrar/ocultar contraseña con ícono de ojo
- Enter key para submit automático

# Nota
Esta es la puerta de entrada principal de los tutores, hazla intuitiva y confiable.`
    },
    {
      id: "prompt-11",
      title: "Sub-Slice 11: Protected Layout",
      prompt: `# Contexto
Necesitamos proteger rutas que requieren autenticación (dashboard, perfil, etc).

# Tarea
Crea un Layout protegido que valide autenticación y redirija si es necesario.

## Estructura de archivos:
\`\`\`
apps/web/app/(protected)/
├── layout.tsx         # Protected Layout
└── dashboard/
    └── page.tsx       # Dashboard (lo crearemos después)
\`\`\`

## Requisitos del Protected Layout:

### Validaciones:
1. Al montar: verificar si hay token en localStorage
2. Si no hay token: redirigir a /login
3. Si hay token pero es inválido: llamar a checkAuth() del store
4. Si checkAuth falla: redirigir a /login
5. Mientras valida: mostrar loading spinner

### Componentes del Layout:
- Header con:
  - Logo de Mateatletas
  - Nombre del usuario
  - Botón de logout
  - Navegación (opcional)
- Sidebar (opcional para este slice)
- Área de contenido (children)

### Ejemplo de estructura:
\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, logout, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await checkAuth();
        setIsValidating(false);
      } catch (error) {
        router.push('/login');
      }
    };

    validateAuth();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9e6]">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#ff6b35]">Mateatletas</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-[#2a1a5e]">
              Hola, <strong>{user?.nombre}</strong>
            </span>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
\`\`\`

## Mejoras opcionales:
- Breadcrumbs para navegación
- Sidebar con menú
- Notificaciones en el header
- Avatar del usuario

## Consideración de seguridad:
- Este layout debe ser la ÚNICA forma de acceder a rutas protegidas
- Todas las páginas dentro de (protected)/ heredan esta validación
- NO duplicar lógica de autenticación en cada página

# Nota
Este layout garantiza que solo usuarios autenticados accedan a contenido protegido.`
    },
    {
      id: "prompt-12",
      title: "Sub-Slice 12: Dashboard del Tutor",
      prompt: `# Contexto
Ya tenemos el Protected Layout funcionando. Ahora creamos el dashboard principal del tutor.

# Tarea
Implementa el dashboard con información básica del tutor y acciones rápidas.

## Ruta del archivo:
apps/web/app/(protected)/dashboard/page.tsx

## Contenido del Dashboard:

### Sección 1: Bienvenida personalizada
- Saludo con nombre del tutor
- Mensaje según hora del día (Buenos días/tardes/noches)
- Frase motivacional aleatoria

### Sección 2: Resumen de cuenta (cards)
- **Membresía**: Estado actual (Activa/Inactiva) con badge visual
- **Estudiantes**: Cantidad de hijos registrados
- **Próximas clases**: Cantidad de clases reservadas esta semana
- **Puntos del equipo**: Suma de puntos de todos sus estudiantes (placeholder por ahora)

### Sección 3: Acciones rápidas (botones grandes)
- "Agregar Estudiante" → /dashboard/estudiantes/new (placeholder)
- "Explorar Clases" → /clases (placeholder)
- "Ver Membresía" → /dashboard/membresia (placeholder)
- "Mi Perfil" → /dashboard/perfil (placeholder)

### Ejemplo de estructura:
\`\`\`typescript
'use client';

import { useAuthStore } from '@/store/auth.store';
import { Card, Button } from '@/components/ui';
import { Users, Calendar, Trophy, CreditCard } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-[#ff6b35] to-[#f7b801] rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          {greeting()}, {user?.nombre}! 👋
        </h1>
        <p className="text-lg opacity-90">
          ¡Listo para seguir aprendiendo y creciendo!
        </p>
      </div>

      {/* Resumen de cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<CreditCard className="w-8 h-8" />}
          title="Membresía"
          value="Inactiva"
          color="gray"
        />
        
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Estudiantes"
          value="0"
          color="blue"
        />
        
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Clases esta semana"
          value="0"
          color="green"
        />
        
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          title="Puntos del equipo"
          value="0"
          color="yellow"
        />
      </div>

      {/* Acciones rápidas */}
      <Card>
        <h2 className="text-2xl font-bold text-[#2a1a5e] mb-6">Acciones rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="primary" className="h-20 text-lg">
            Agregar Estudiante
          </Button>
          
          <Button variant="secondary" className="h-20 text-lg">
            Explorar Clases
          </Button>
          
          <Button variant="outline" className="h-20 text-lg">
            Ver Membresía
          </Button>
          
          <Button variant="outline" className="h-20 text-lg">
            Mi Perfil
          </Button>
        </div>
      </Card>

      {/* Call to action si no tiene membresía */}
      <Card className="bg-gradient-to-r from-[#00d9ff]/20 to-[#f7b801]/20 border-2 border-[#00d9ff]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#2a1a5e] mb-2">
              ¡Activa tu membresía!
            </h3>
            <p className="text-[#2a1a5e]/70">
              Accede a clases ilimitadas y contenido exclusivo.
            </p>
          </div>
          
          <Button variant="primary" size="lg">
            Ver planes
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Componente auxiliar para cards de estadísticas
function StatCard({ icon, title, value, color }: any) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <Card className="text-center">
      <div className={\`inline-flex p-3 rounded-full mb-4 \${colors[color]}\`}>
        {icon}
      </div>
      <p className="text-sm text-[#2a1a5e]/70 mb-1">{title}</p>
      <p className="text-3xl font-bold text-[#2a1a5e]">{value}</p>
    </Card>
  );
}
\`\`\`

## Datos dinámicos (próximos slices):
- Los valores de estadísticas se llenarán con datos reales en slices posteriores
- Por ahora, mostrar valores en 0 o placeholder

## Mejoras opcionales:
- Gráfico de progreso semanal
- Últimas notificaciones
- Tips educativos aleatorios

# Nota
Este dashboard es el hub central del tutor, debe ser informativo pero no abrumador.`
    },
    {
      id: "prompt-13",
      title: "Sub-Slice 13: Testing E2E del Flujo Completo",
      prompt: `# Contexto
Todo el Slice #1 está implementado. Ahora validamos el flujo completo con tests E2E.

# Tarea
Crea tests de extremo a extremo con Playwright que cubran el flujo de autenticación.

## Instalación de Playwright:
\`\`\`bash
cd apps/web
pnpm create playwright
# Seleccionar: TypeScript, tests en 'e2e/', no instalar browsers ahora
pnpm exec playwright install chromium
\`\`\`

## Estructura de tests:
\`\`\`
apps/web/e2e/
├── auth.spec.ts         # Tests de autenticación
└── helpers/
    └── test-helpers.ts  # Funciones auxiliares
\`\`\`

## Tests a implementar:

### 1. Test de Registro Exitoso
\`\`\`typescript
test('debería registrar un nuevo tutor exitosamente', async ({ page }) => {
  await page.goto('http://localhost:3000/register');
  
  // Generar email único
  const timestamp = Date.now();
  const email = \`tutor\${timestamp}@test.com\`;
  
  // Llenar formulario
  await page.fill('input[type="email"]', email);
  await page.fill('input[name="password"]', 'Test123!');
  await page.fill('input[name="confirmPassword"]', 'Test123!');
  await page.fill('input[name="nombre"]', 'Juan');
  await page.fill('input[name="apellido"]', 'Pérez');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verificar redirección a dashboard
  await page.waitForURL('**/dashboard');
  
  // Verificar que muestra el nombre del usuario
  await expect(page.locator('text=/Hola.*Juan/')).toBeVisible();
});
\`\`\`

### 2. Test de Registro con Email Duplicado
\`\`\`typescript
test('debería mostrar error si el email ya existe', async ({ page }) => {
  // Primer registro
  await registerUser(page, 'existing@test.com', 'Test123!', 'Juan', 'Pérez');
  await page.click('text=Cerrar sesión');
  
  // Intentar registrar mismo email
  await page.goto('http://localhost:3000/register');
  await page.fill('input[type="email"]', 'existing@test.com');
  await page.fill('input[name="password"]', 'Test123!');
  await page.fill('input[name="confirmPassword"]', 'Test123!');
  await page.fill('input[name="nombre"]', 'María');
  await page.fill('input[name="apellido"]', 'García');
  
  await page.click('button[type="submit"]');
  
  // Verificar mensaje de error
  await expect(page.locator('text=/Email ya registrado/')).toBeVisible();
});
\`\`\`

### 3. Test de Login Exitoso
\`\`\`typescript
test('debería hacer login correctamente', async ({ page }) => {
  // Crear usuario
  const email = \`tutor\${Date.now()}@test.com\`;
  await registerUser(page, email, 'Test123!', 'Ana', 'López');
  
  // Logout
  await page.click('text=Cerrar sesión');
  
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'Test123!');
  await page.click('button[type="submit"]');
  
  // Verificar dashboard
  await page.waitForURL('**/dashboard');
  await expect(page.locator('text=/Hola.*Ana/')).toBeVisible();
});
\`\`\`

### 4. Test de Login con Credenciales Inválidas
\`\`\`typescript
test('debería mostrar error con credenciales incorrectas', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[type="email"]', 'noexiste@test.com');
  await page.fill('input[type="password"]', 'WrongPass123!');
  await page.click('button[type="submit"]');
  
  // Verificar mensaje de error
  await expect(page.locator('text=/Email o contraseña incorrectos/')).toBeVisible();
});
\`\`\`

### 5. Test de Persistencia de Sesión
\`\`\`typescript
test('debería mantener la sesión después de recargar página', async ({ page, context }) => {
  // Registrar y verificar login
  const email = \`tutor\${Date.now()}@test.com\`;
  await registerUser(page, email, 'Test123!', 'Pedro', 'Martínez');
  
  // Recargar página
  await page.reload();
  
  // Verificar que sigue autenticado
  await expect(page.locator('text=/Hola.*Pedro/')).toBeVisible();
});
\`\`\`

### 6. Test de Logout
\`\`\`typescript
test('debería cerrar sesión correctamente', async ({ page }) => {
  // Login
  const email = \`tutor\${Date.now()}@test.com\`;
  await registerUser(page, email, 'Test123!', 'Laura', 'Gómez');
  
  // Logout
  await page.click('text=Cerrar sesión');
  
  // Verificar redirección a login
  await page.waitForURL('**/login');
  
  // Intentar acceder a dashboard sin estar autenticado
  await page.goto('http://localhost:3000/dashboard');
  
  // Debería redirigir a login
  await page.waitForURL('**/login');
});
\`\`\`

### 7. Test de Protección de Rutas
\`\`\`typescript
test('debería redirigir a login si intenta acceder a ruta protegida sin autenticación', async ({ page }) => {
  // Limpiar localStorage
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());
  
  // Intentar acceder a dashboard
  await page.goto('http://localhost:3000/dashboard');
  
  // Verificar redirección
  await page.waitForURL('**/login');
});
\`\`\`

## Helper functions (test-helpers.ts):
\`\`\`typescript
import { Page } from '@playwright/test';

export async function registerUser(
  page: Page,
  email: string,
  password: string,
  nombre: string,
  apellido: string
) {
  await page.goto('http://localhost:3000/register');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.fill('input[name="nombre"]', nombre);
  await page.fill('input[name="apellido"]', apellido);
  
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}
\`\`\`

## Configuración de Playwright (playwright.config.ts):
\`\`\`typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
\`\`\`

## Ejecutar tests:
\`\`\`bash
# Todos los tests
pnpm exec playwright test

# Con UI
pnpm exec playwright test --ui

# Solo auth tests
pnpm exec playwright test auth

# Ver reporte
pnpm exec playwright show-report
\`\`\`

# Nota
Los tests E2E deben correr antes de cada deploy para garantizar que el flujo crítico funciona.`
    }
  ];

  const checklistItems = [
    {
      category: "Backend - Base de Datos",
      items: [
        "Modelo Tutor creado en Prisma schema",
        "Migración ejecutada exitosamente",
        "Cliente Prisma regenerado",
        "Índice en campo email creado"
      ]
    },
    {
      category: "Backend - Auth Module",
      items: [
        "Módulo Auth creado con estructura completa",
        "DTOs con validaciones implementadas",
        "Dependencias instaladas (JWT, Passport, bcrypt)",
        "Variables de entorno configuradas"
      ]
    },
    {
      category: "Backend - Auth Service",
      items: [
        "Método register() funcional con hash de password",
        "Método login() con validación y generación de JWT",
        "Método validateUser() implementado",
        "Método getProfile() con exclusión de password_hash",
        "Manejo correcto de excepciones"
      ]
    },
    {
      category: "Backend - JWT y Guards",
      items: [
        "JWT Strategy configurada correctamente",
        "JwtAuthGuard funcional",
        "RolesGuard implementado",
        "Decorador @GetUser creado",
        "Decorador @Roles creado"
      ]
    },
    {
      category: "Backend - Controller",
      items: [
        "POST /auth/register funcional",
        "POST /auth/login retorna JWT",
        "GET /auth/profile protegido y funcional",
        "Respuestas con códigos HTTP correctos",
        "Manejo de errores apropiado"
      ]
    },
    {
      category: "Frontend - Configuración",
      items: [
        "Axios configurado con interceptores",
        "Interceptor adjunta JWT automáticamente",
        "Manejo de 401 con redirección",
        "API de auth con funciones CRUD"
      ]
    },
    {
      category: "Frontend - Zustand Store",
      items: [
        "Store de auth creado con estado completo",
        "Acción login() funcional",
        "Acción register() funcional",
        "Acción logout() limpia estado",
        "Acción checkAuth() valida token",
        "Persistencia en localStorage configurada"
      ]
    },
    {
      category: "Frontend - Componentes UI",
      items: [
        "Button con variantes y estados",
        "Input con label y validación de errores",
        "Card con estilos Crash Bandicoot",
        "Componentes exportados en index.ts"
      ]
    },
    {
      category: "Frontend - Páginas",
      items: [
        "Página /register con formulario completo",
        "Validación de passwords coinciden",
        "Página /login con manejo de errores",
        "Redirección post-login funcional",
        "Links entre login y register"
      ]
    },
    {
      category: "Frontend - Protected Layout",
      items: [
        "Layout verifica autenticación al montar",
        "Redirección a /login si no autenticado",
        "Header con nombre de usuario y logout",
        "Loading state mientras valida",
        "Rutas protegidas dentro de (protected)/"
      ]
    },
    {
      category: "Frontend - Dashboard",
      items: [
        "Dashboard muestra saludo personalizado",
        "Cards de estadísticas visibles",
        "Botones de acciones rápidas",
        "Call-to-action para membresía",
        "Diseño responsive"
      ]
    },
    {
      category: "Testing",
      items: [
        "Test de registro exitoso pasa",
        "Test de email duplicado pasa",
        "Test de login exitoso pasa",
        "Test de credenciales inválidas pasa",
        "Test de persistencia de sesión pasa",
        "Test de logout pasa",
        "Test de protección de rutas pasa"
      ]
    },
    {
      category: "Integración",
      items: [
        "Backend y frontend se comunican correctamente",
        "JWT se almacena en localStorage",
        "Sesión persiste al recargar página",
        "Logout elimina token y redirige",
        "Manejo de errores consistente en toda la app"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-cyan-500 rounded-2xl p-8 mb-8 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
            SLICE #1: TUTORES
          </h1>
          <p className="text-xl text-white/90 font-semibold">
            Sistema de Autenticación Completo
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
              13 Sub-Slices
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
              ~4-6 horas
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
              Backend + Frontend + Testing
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'vision', label: '🎯 Visión General' },
              { key: 'architecture', label: '🏗️ Arquitectura' },
              { key: 'subslices', label: '📦 Sub-Slices' },
              { key: 'prompts', label: '🤖 Prompts' },
              { key: 'checklist', label: '✅ Checklist' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  const newState = Object.keys(expandedSections).reduce((acc, key) => {
                    acc[key] = key === tab.key;
                    return acc;
                  }, {});
                  setExpandedSections(newState);
                }}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  expandedSections[tab.key]
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        
        {/* Vision General */}
        {expandedSections.vision && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Visión General del Slice</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Objetivo</h3>
                <p className="text-gray-700 leading-relaxed">
                  Implementar un sistema de autenticación completo que permita a los tutores:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Registrarse con sus datos personales</li>
                  <li>Iniciar sesión de forma segura</li>
                  <li>Acceder a un dashboard protegido</li>
                  <li>Mantener la sesión activa (persistencia)</li>
                  <li>Cerrar sesión</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Stack Tecnológico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <p className="font-bold text-purple-800 mb-2">Backend</p>
                    <p className="text-sm text-purple-700">NestJS 11 + Prisma + PostgreSQL + JWT + bcrypt</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="font-bold text-blue-800 mb-2">Frontend</p>
                    <p className="text-sm text-blue-700">Next.js 15 + Zustand + Axios + Tailwind v4</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Resultado Final</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                  <p className="font-bold text-green-800 mb-3">Flujo completo del usuario:</p>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <span>Visita <code className="bg-gray-200 px-2 py-1 rounded">/register</code> → completa formulario → cuenta creada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <span>Visita <code className="bg-gray-200 px-2 py-1 rounded">/login</code> → ingresa credenciales → obtiene JWT</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <span>Es redirigido a <code className="bg-gray-200 px-2 py-1 rounded">/dashboard</code> → ve su información personal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <span>Cierra el navegador y vuelve → sigue autenticado (token en localStorage)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                      <span>Click en "Cerrar sesión" → token eliminado → redirigido a <code className="bg-gray-200 px-2 py-1 rounded">/login</code></span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Architecture */}
        {expandedSections.architecture && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🏗️ Arquitectura y Flujo de Datos</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Diagrama de Flujo</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`┌─────────────┐
│   FRONTEND  │
│  (Next.js)  │
└──────┬──────┘
       │
       │ 1. POST /auth/register
       │    { email, password, nombre, ... }
       ↓
┌─────────────────────────┐
│   BACKEND (NestJS)      │
│                         │
│  ┌──────────────────┐  │
│  │  AuthController  │  │
│  └────────┬─────────┘  │
│           │             │
│           ↓             │
│  ┌──────────────────┐  │
│  │   AuthService    │  │
│  │  - hashPassword  │  │
│  │  - validateUser  │  │
│  │  - generateJWT   │  │
│  └────────┬─────────┘  │
│           │             │
│           ↓             │
│  ┌──────────────────┐  │
│  │  Prisma Client   │  │
│  │  (TutorModel)    │  │
│  └────────┬─────────┘  │
└───────────┼─────────────┘
            │
            ↓
    ┌───────────────┐
    │  PostgreSQL   │
    │   Database    │
    └───────────────┘`}
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Modelo de Datos: Tutor</h3>
                <pre className="bg-purple-900 text-purple-100 p-4 rounded-lg overflow-x-auto text-sm">
{`model Tutor {
  id                       String       @id @default(cuid())
  email                    String       @unique
  password_hash            String
  nombre                   String
  apellido                 String
  dni                      String?
  telefono                 String?
  fecha_registro           DateTime     @default(now())
  ha_completado_onboarding Boolean      @default(false)
  createdAt                DateTime     @default(now())
  updatedAt                DateTime     @updatedAt
  
  // Relaciones (para futuros slices)
  // estudiantes   Estudiante[]
  // membresias    Membresia[]
  // notificaciones Notificacion[]
  
  @@map("tutores")
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Estructura de Archivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <p className="font-bold text-purple-800 mb-2">📁 Backend (apps/api/src/)</p>
                    <pre className="text-xs text-purple-700 font-mono">
{`auth/
├── auth.module.ts
├── auth.service.ts
├── auth.controller.ts
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── get-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── register.dto.ts
    └── login.dto.ts`}
                    </pre>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="font-bold text-blue-800 mb-2">📁 Frontend (apps/web/src/)</p>
                    <pre className="text-xs text-blue-700 font-mono">
{`lib/
├── axios.ts
└── api/
    └── auth.api.ts
store/
└── auth.store.ts
components/
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Card.tsx
    └── index.ts
app/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
└── (protected)/
    ├── layout.tsx
    └── dashboard/
        └── page.tsx`}
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Flujo de Autenticación JWT</h3>
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-300">
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-bold">Usuario envía credenciales</p>
                        <p className="text-sm text-gray-600">POST /auth/login con email y password</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-bold">Backend valida credenciales</p>
                        <p className="text-sm text-gray-600">Compara password con bcrypt.compare()</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-bold">Backend genera JWT</p>
                        <p className="text-sm text-gray-600">Payload: {`{ sub: userId, email, role: 'tutor' }`}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <div>
                        <p className="font-bold">Frontend guarda token</p>
                        <p className="text-sm text-gray-600">localStorage.setItem('auth-token', token)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                      <div>
                        <p className="font-bold">Requests subsecuentes incluyen token</p>
                        <p className="text-sm text-gray-600">Header: Authorization: Bearer {`<token>`}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                      <div>
                        <p className="font-bold">Backend valida token en cada request</p>
                        <p className="text-sm text-gray-600">JwtStrategy extrae y verifica el token</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Slices */}
        {expandedSections.subslices && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📦 Sub-Slices y Orden de Implementación</h2>
            
            <div className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border-2 border-cyan-300">
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong> Los sub-slices están ordenados por dependencias. Cada uno debe completarse antes de pasar al siguiente.
              </p>
            </div>

            <div className="space-y-3">
              {subSlices.map((slice) => (
                <div
                  key={slice.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-300 hover:border-orange-400 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                        {slice.id}
                      </span>
                      <div>
                        <p className="font-bold text-gray-800">{slice.title}</p>
                        <p className="text-sm text-gray-600">Duración estimada: {slice.duration}</p>
                      </div>
                    </div>
                    {slice.dependencies.length > 0 && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                        Requiere: #{slice.dependencies.join(', #')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
              <h3 className="text-xl font-bold text-green-800 mb-3">📊 Resumen de Fases</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-purple-700 mb-2">Backend (Sub-slices 1-5)</p>
                  <p className="text-sm text-gray-600">~1.5 horas</p>
                  <p className="text-xs text-gray-500 mt-1">Prisma, Auth, JWT, Guards, Endpoints</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-blue-700 mb-2">Frontend (Sub-slices 6-12)</p>
                  <p className="text-sm text-gray-600">~2.5 horas</p>
                  <p className="text-xs text-gray-500 mt-1">Axios, Store, UI, Páginas, Dashboard</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-bold text-green-700 mb-2">Testing (Sub-slice 13)</p>
                  <p className="text-sm text-gray-600">~30 min</p>
                  <p className="text-xs text-gray-500 mt-1">E2E con Playwright</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompts */}
        {expandedSections.prompts && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🤖 Prompts para Claude Code</h2>
            
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-300">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Cómo usar estos prompts:</strong>
              </p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Copia el prompt completo</li>
                <li>Pégalo en Claude Code (terminal)</li>
                <li>Claude implementará el sub-slice automáticamente</li>
                <li>Revisa los archivos generados</li>
                <li>Ejecuta los comandos sugeridos</li>
                <li>Pasa al siguiente sub-slice</li>
              </ol>
            </div>

            <div className="space-y-6">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 flex items-center justify-between">
                    <h3 className="font-bold text-white text-lg">{prompt.title}</h3>
                    <button
                      onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all"
                    >
                      {copiedPrompt === prompt.id ? (
                        <><Check className="w-4 h-4" /> Copiado!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copiar</>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-6 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                      {prompt.prompt}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        {expandedSections.checklist && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">✅ Checklist de Validación</h2>
            
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
              <p className="text-sm text-gray-700">
                <strong>Marca cada ítem</strong> a medida que lo completes. Todos deben estar ✅ antes de considerar el Slice #1 terminado.
              </p>
            </div>

            <div className="space-y-6">
              {checklistItems.map((category, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 border-b-2 border-gray-200">
                    <h3 className="font-bold text-gray-800 text-lg">{category.category}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <label
                        key={itemIdx}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                        />
                        <span className="text-gray-700 flex-1">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
              <h3 className="text-xl font-bold text-yellow-800 mb-3">🎯 Criterios de Éxito</h3>
              <p className="text-gray-700 mb-3">El Slice #1 está completo cuando:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Un tutor puede registrarse exitosamente desde <code className="bg-gray-200 px-2 py-1 rounded">/register</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Un tutor puede hacer login desde <code className="bg-gray-200 px-2 py-1 rounded">/login</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>El dashboard muestra la información del tutor autenticado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>La sesión persiste al recargar la página</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>El logout funciona correctamente y redirige a login</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Las rutas protegidas redirigen a login si no hay autenticación</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Todos los tests E2E pasan exitosamente</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-cyan-500 rounded-2xl p-8 shadow-2xl text-center">
          <h2 className="text-3xl font-black text-white mb-3">
            ¿Listo para comenzar?
          </h2>
          <p className="text-white/90 text-lg mb-6">
            Copia el primer prompt y pégalo en Claude Code para empezar con el Sub-Slice #1
          </p>
          <button
            onClick={() => setExpandedSections({ ...expandedSections, prompts: true })}
            className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transform transition-all"
          >
            Ver Prompts 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default SliceDocumentation;
