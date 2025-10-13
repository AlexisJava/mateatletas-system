import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

const Slice2Documentation = () => {
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
    { id: 1, title: "Modelo Estudiante y Equipo en Prisma", duration: "15 min", dependencies: [] },
    { id: 2, title: "Módulo Estudiantes - Estructura Base", duration: "15 min", dependencies: [1] },
    { id: 3, title: "EstudiantesService - Lógica CRUD", duration: "25 min", dependencies: [2] },
    { id: 4, title: "Guards de Autorización", duration: "20 min", dependencies: [3] },
    { id: 5, title: "EstudiantesController - Endpoints", duration: "20 min", dependencies: [4] },
    { id: 6, title: "API Client Frontend", duration: "15 min", dependencies: [5] },
    { id: 7, title: "Zustand Store de Estudiantes", duration: "20 min", dependencies: [6] },
    { id: 8, title: "Componentes UI Adicionales", duration: "25 min", dependencies: [] },
    { id: 9, title: "Página de Gestión de Estudiantes", duration: "30 min", dependencies: [7, 8] },
    { id: 10, title: "Modal de Agregar/Editar Estudiante", duration: "25 min", dependencies: [8, 9] },
    { id: 11, title: "Vista de Perfil de Estudiante", duration: "25 min", dependencies: [9] },
    { id: 12, title: "Integración en Dashboard Principal", duration: "20 min", dependencies: [9] },
    { id: 13, title: "Testing E2E del Flujo Completo", duration: "35 min", dependencies: [12] }
  ];

  const prompts = [
    {
      id: "prompt-1",
      title: "Sub-Slice 1: Modelo Estudiante y Equipo en Prisma",
      prompt: `# Contexto
Continuamos con el Slice #2 de Estudiantes. Ya tenemos el modelo Tutor funcionando del Slice #1.

# Tarea
Crea los modelos 'Estudiante' y 'Equipo' en el schema de Prisma, con relaciones apropiadas.

## Modelos requeridos:

### 1. Modelo Estudiante
\`\`\`prisma
model Estudiante {
  id                    String       @id @default(cuid())
  nombre                String
  apellido              String
  fecha_nacimiento      DateTime
  nivel_escolar         String       // "Primaria", "Secundaria", "Universidad"
  foto_url              String?
  
  // Relación con Tutor
  tutor_id              String
  tutor                 Tutor        @relation(fields: [tutor_id], references: [id], onDelete: Cascade)
  
  // Relación con Equipo (gamificación)
  equipo_id             String?
  equipo                Equipo?      @relation(fields: [equipo_id], references: [id], onDelete: SetNull)
  
  // Gamificación básica
  puntos_totales        Int          @default(0)
  nivel_actual          Int          @default(1)
  
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  @@map("estudiantes")
}
\`\`\`

### 2. Modelo Equipo
\`\`\`prisma
model Equipo {
  id                    String       @id @default(cuid())
  nombre                String       @unique  // "Fénix", "Dragón", "Tigre"
  color_primario        String       // Hex color
  color_secundario      String       // Hex color
  icono_url             String?
  puntos_totales        Int          @default(0)
  
  estudiantes           Estudiante[]
  
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  
  @@map("equipos")
}
\`\`\`

### 3. Actualizar modelo Tutor
Agregar la relación:
\`\`\`prisma
model Tutor {
  // ... campos existentes ...
  
  estudiantes           Estudiante[]
  
  // ... resto igual ...
}
\`\`\`

## Consideraciones:
- onDelete: Cascade → Si se elimina tutor, se eliminan sus estudiantes
- onDelete: SetNull → Si se elimina equipo, estudiante queda sin equipo
- Índices en campos de relación para optimizar queries
- foto_url opcional (puede agregarse después)

## Seed de Equipos (opcional)
Crear 4 equipos predefinidos:
1. Fénix (Naranja #FF6B35 / Amarillo #F7B801)
2. Dragón (Rojo #F44336 / Morado #9C27B0)
3. Tigre (Azul #2196F3 / Cyan #00BCD4)
4. Águila (Verde #4CAF50 / Lima #8BC34A)

## Entregables:
1. Schema actualizado en 'apps/api/prisma/schema.prisma'
2. Migración: 'pnpm --filter api prisma migrate dev --name create-estudiante-equipo'
3. Regenerar cliente: 'pnpm --filter api prisma generate'
4. Opcional: Seed con equipos predefinidos

# Ruta del archivo
apps/api/prisma/schema.prisma`
    },
    {
      id: "prompt-2",
      title: "Sub-Slice 2: Módulo Estudiantes - Estructura Base",
      prompt: `# Contexto
Ya tenemos los modelos Estudiante y Equipo en Prisma. Ahora creamos el módulo de estudiantes en NestJS.

# Tarea
Crea el módulo de estudiantes con la estructura completa.

## Estructura de carpetas esperada:
\`\`\`
apps/api/src/estudiantes/
├── estudiantes.module.ts
├── estudiantes.service.ts
├── estudiantes.controller.ts
├── guards/
│   └── estudiante-ownership.guard.ts
├── dto/
│   ├── create-estudiante.dto.ts
│   ├── update-estudiante.dto.ts
│   └── query-estudiantes.dto.ts
└── entities/
    └── estudiante.entity.ts
\`\`\`

## Requisitos:

### 1. estudiantes.module.ts
- Importar PrismaModule
- Importar AuthModule (para guards)
- Registrar EstudiantesService y EstudiantesController

### 2. DTOs de validación

**CreateEstudianteDto:**
\`\`\`typescript
export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsString()
  @IsIn(['Primaria', 'Secundaria', 'Universidad'])
  nivel_escolar: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  foto_url?: string;

  @IsString()
  @IsOptional()
  equipo_id?: string;
}
\`\`\`

**UpdateEstudianteDto:**
\`\`\`typescript
export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {}
\`\`\`

**QueryEstudiantesDto:**
\`\`\`typescript
export class QueryEstudiantesDto {
  @IsOptional()
  @IsString()
  equipo_id?: string;

  @IsOptional()
  @IsString()
  nivel_escolar?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
\`\`\`

### 3. Entity (Interfaz TypeScript)
\`\`\`typescript
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  nivel_escolar: string;
  foto_url?: string;
  tutor_id: string;
  equipo_id?: string;
  puntos_totales: number;
  nivel_actual: number;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

## Instalación de dependencias (si necesitas):
\`\`\`bash
cd apps/api
pnpm add class-validator class-transformer
pnpm add @nestjs/mapped-types
\`\`\`

# Nota
Solo crea la estructura y DTOs. El service y controller los implementaremos en los siguientes sub-slices.`
    },
    {
      id: "prompt-3",
      title: "Sub-Slice 3: EstudiantesService - Lógica CRUD",
      prompt: `# Contexto
Ya tenemos el módulo Estudiantes estructurado. Ahora implementamos la lógica de negocio en el service.

# Tarea
Implementa el EstudiantesService con todos los métodos CRUD y validaciones de negocio.

## Métodos requeridos:

### 1. create(tutorId: string, createDto: CreateEstudianteDto)
- Validar que el tutor existe
- Validar que el equipo existe (si se proporciona equipo_id)
- Calcular edad desde fecha_nacimiento
- Validar edad (mínimo 5 años, máximo 25)
- Crear estudiante asociado al tutor
- Retornar estudiante con relación a equipo (si aplica)

### 2. findAllByTutor(tutorId: string, query?: QueryEstudiantesDto)
- Obtener todos los estudiantes del tutor
- Aplicar filtros (equipo_id, nivel_escolar)
- Implementar paginación
- Incluir información del equipo
- Retornar con metadata (total, page, totalPages)

### 3. findOne(id: string, tutorId: string)
- Buscar estudiante por ID
- Verificar que pertenece al tutor (ownership)
- Incluir información completa (equipo, tutor)
- Si no existe o no pertenece, lanzar NotFoundException

### 4. update(id: string, tutorId: string, updateDto: UpdateEstudianteDto)
- Verificar ownership
- Si se cambia equipo_id, validar que el nuevo equipo existe
- Validar fecha_nacimiento si se actualiza
- Actualizar estudiante
- Retornar estudiante actualizado con relaciones

### 5. remove(id: string, tutorId: string)
- Verificar ownership
- Eliminar estudiante (cascada automática con Prisma)
- Retornar confirmación

### 6. countByTutor(tutorId: string)
- Contar total de estudiantes del tutor
- Útil para dashboard

### 7. getEstadisticas(tutorId: string)
- Retornar estadísticas agregadas:
  - Total de estudiantes
  - Distribución por nivel escolar
  - Distribución por equipo
  - Suma de puntos totales

## Ejemplo de estructura:

\`\`\`typescript
@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  async create(tutorId: string, createDto: CreateEstudianteDto) {
    // Validar tutor existe
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });
    
    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // Validar equipo si se proporciona
    if (createDto.equipo_id) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id: createDto.equipo_id },
      });
      
      if (!equipo) {
        throw new NotFoundException('Equipo no encontrado');
      }
    }

    // Calcular edad
    const fechaNac = new Date(createDto.fecha_nacimiento);
    const edad = this.calcularEdad(fechaNac);
    
    if (edad < 5 || edad > 25) {
      throw new BadRequestException('La edad debe estar entre 5 y 25 años');
    }

    // Crear estudiante
    const estudiante = await this.prisma.estudiante.create({
      data: {
        ...createDto,
        tutor_id: tutorId,
        fecha_nacimiento: new Date(createDto.fecha_nacimiento),
      },
      include: {
        equipo: true,
      },
    });

    return estudiante;
  }

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  // ... resto de métodos
}
\`\`\`

## Consideraciones de negocio:
- Solo el tutor dueño puede ver/editar/eliminar sus estudiantes
- Un estudiante puede estar sin equipo (equipo_id = null)
- La edad se calcula automáticamente desde fecha_nacimiento
- Los puntos y nivel son solo lectura (se actualizan por otros servicios)

# Ruta del archivo
apps/api/src/estudiantes/estudiantes.service.ts`
    },
    {
      id: "prompt-4",
      title: "Sub-Slice 4: Guards de Autorización",
      prompt: `# Contexto
El EstudiantesService ya tiene la lógica. Ahora necesitamos proteger los endpoints para que un tutor solo pueda acceder a sus propios estudiantes.

# Tarea
Implementa el EstudianteOwnershipGuard que verifica que el estudiante pertenece al tutor autenticado.

## Guard: EstudianteOwnershipGuard

### Funcionalidad:
1. Extraer estudiante_id del parámetro de ruta
2. Obtener tutor_id del usuario autenticado (request.user)
3. Verificar en BD que el estudiante pertenece al tutor
4. Si pertenece → permitir acceso
5. Si no pertenece → lanzar ForbiddenException

### Ejemplo de implementación:

\`\`\`typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class EstudianteOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tutorId = request.user?.sub; // Del JWT
    const estudianteId = request.params.id; // De la URL

    if (!tutorId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!estudianteId) {
      // Si no hay ID en la ruta, permitir (ej: GET /estudiantes)
      return true;
    }

    // Verificar que el estudiante existe y pertenece al tutor
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { tutor_id: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este estudiante',
      );
    }

    return true;
  }
}
\`\`\`

## Uso del Guard

En el controller:
\`\`\`typescript
@UseGuards(JwtAuthGuard, EstudianteOwnershipGuard)
@Get(':id')
async findOne(@Param('id') id: string, @GetUser() user: any) {
  // Solo se ejecuta si el guard permite el acceso
  return this.estudiantesService.findOne(id, user.sub);
}
\`\`\`

## Consideraciones:
- Este guard debe aplicarse a todas las rutas con :id
- Para la ruta POST (crear) no se necesita este guard
- Para GET sin :id (listar todos) tampoco se necesita
- Siempre usar junto con JwtAuthGuard

## Casos de prueba mental:
1. ✅ Tutor A intenta ver estudiante de Tutor A → Permitido
2. ❌ Tutor A intenta ver estudiante de Tutor B → Forbidden
3. ❌ Usuario no autenticado → 401 (JwtAuthGuard)
4. ❌ Estudiante no existe → 404

# Ruta del archivo
apps/api/src/estudiantes/guards/estudiante-ownership.guard.ts`
    },
    {
      id: "prompt-5",
      title: "Sub-Slice 5: EstudiantesController - Endpoints",
      prompt: `# Contexto
Ya tenemos service y guards. Ahora exponemos los endpoints HTTP del módulo de estudiantes.

# Tarea
Crea el EstudiantesController con todos los endpoints RESTful protegidos.

## Endpoints requeridos:

### 1. POST /estudiantes (Crear estudiante)
- Auth: JwtAuthGuard
- Body: CreateEstudianteDto
- Lógica: Extrae tutorId del token, llama a service.create()
- Response: 201 Created

### 2. GET /estudiantes (Listar estudiantes del tutor)
- Auth: JwtAuthGuard
- Query: QueryEstudiantesDto (filtros, paginación)
- Lógica: Retorna todos los estudiantes del tutor autenticado
- Response: 200 OK con array y metadata

### 3. GET /estudiantes/:id (Ver un estudiante)
- Auth: JwtAuthGuard + EstudianteOwnershipGuard
- Params: id
- Lógica: Verifica ownership, retorna estudiante completo
- Response: 200 OK

### 4. PATCH /estudiantes/:id (Actualizar estudiante)
- Auth: JwtAuthGuard + EstudianteOwnershipGuard
- Params: id
- Body: UpdateEstudianteDto
- Response: 200 OK con estudiante actualizado

### 5. DELETE /estudiantes/:id (Eliminar estudiante)
- Auth: JwtAuthGuard + EstudianteOwnershipGuard
- Params: id
- Response: 200 OK con mensaje de confirmación

### 6. GET /estudiantes/count (Contar estudiantes)
- Auth: JwtAuthGuard
- Response: { count: number }

### 7. GET /estudiantes/estadisticas (Estadísticas)
- Auth: JwtAuthGuard
- Response: Objeto con estadísticas agregadas

## Ejemplo de estructura:

\`\`\`typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { EstudianteOwnershipGuard } from './guards/estudiante-ownership.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';

@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Post()
  async create(
    @Body() createDto: CreateEstudianteDto,
    @GetUser() user: any,
  ) {
    return this.estudiantesService.create(user.sub, createDto);
  }

  @Get()
  async findAll(
    @Query() query: QueryEstudiantesDto,
    @GetUser() user: any,
  ) {
    return this.estudiantesService.findAllByTutor(user.sub, query);
  }

  @Get('count')
  async count(@GetUser() user: any) {
    const count = await this.estudiantesService.countByTutor(user.sub);
    return { count };
  }

  @Get('estadisticas')
  async getEstadisticas(@GetUser() user: any) {
    return this.estudiantesService.getEstadisticas(user.sub);
  }

  @Get(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.estudiantesService.findOne(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEstudianteDto,
    @GetUser() user: any,
  ) {
    return this.estudiantesService.update(id, user.sub, updateDto);
  }

  @Delete(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.estudiantesService.remove(id, user.sub);
    return {
      message: 'Estudiante eliminado exitosamente',
    };
  }
}
\`\`\`

## Testing manual con cURL:

\`\`\`bash
# Crear estudiante
curl -X POST http://localhost:3001/estudiantes \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nombre": "María",
    "apellido": "González",
    "fecha_nacimiento": "2015-03-20",
    "nivel_escolar": "Primaria"
  }'

# Listar estudiantes
curl -X GET http://localhost:3001/estudiantes \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Ver un estudiante
curl -X GET http://localhost:3001/estudiantes/{ID} \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Actualizar
curl -X PATCH http://localhost:3001/estudiantes/{ID} \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"nivel_escolar": "Secundaria"}'

# Eliminar
curl -X DELETE http://localhost:3001/estudiantes/{ID} \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

## Documentación Swagger (opcional):
\`\`\`typescript
@ApiTags('Estudiantes')
@ApiBearerAuth()
export class EstudiantesController {
  // ... decoradores @ApiOperation, @ApiResponse, etc.
}
\`\`\`

# Ruta del archivo
apps/api/src/estudiantes/estudiantes.controller.ts`
    },
    {
      id: "prompt-6",
      title: "Sub-Slice 6: API Client Frontend",
      prompt: `# Contexto
Backend de estudiantes completo. Ahora creamos las funciones del cliente API en el frontend.

# Tarea
Crea el módulo de API para estudiantes en el frontend.

## Estructura de archivos:
\`\`\`
apps/web/src/lib/api/
├── auth.api.ts           (ya existe)
└── estudiantes.api.ts    (nuevo)
\`\`\`

## API de Estudiantes

### Tipos TypeScript:

\`\`\`typescript
// apps/web/src/types/estudiante.ts
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
  foto_url?: string;
  tutor_id: string;
  equipo_id?: string;
  puntos_totales: number;
  nivel_actual: number;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  equipo?: Equipo;
}

export interface Equipo {
  id: string;
  nombre: string;
  color_primario: string;
  color_secundario: string;
  icono_url?: string;
  puntos_totales: number;
}

export interface CreateEstudianteData {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // ISO format
  nivel_escolar: 'Primaria' | 'Secundaria' | 'Universidad';
  foto_url?: string;
  equipo_id?: string;
}

export interface UpdateEstudianteData extends Partial<CreateEstudianteData> {}

export interface QueryEstudiantesParams {
  equipo_id?: string;
  nivel_escolar?: string;
  page?: number;
  limit?: number;
}

export interface EstudiantesResponse {
  data: Estudiante[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EstadisticasEstudiantes {
  total: number;
  por_nivel: Record<string, number>;
  por_equipo: Record<string, number>;
  puntos_totales: number;
}
\`\`\`

### Cliente API:

\`\`\`typescript
// apps/web/src/lib/api/estudiantes.api.ts
import apiClient from '../axios';
import type {
  Estudiante,
  CreateEstudianteData,
  UpdateEstudianteData,
  QueryEstudiantesParams,
  EstudiantesResponse,
  EstadisticasEstudiantes,
  Equipo,
} from '@/types/estudiante';

export const estudiantesApi = {
  // Crear estudiante
  create: (data: CreateEstudianteData): Promise<Estudiante> => 
    apiClient.post('/estudiantes', data),

  // Listar estudiantes (con filtros y paginación)
  getAll: (params?: QueryEstudiantesParams): Promise<EstudiantesResponse> => 
    apiClient.get('/estudiantes', { params }),

  // Obtener un estudiante por ID
  getById: (id: string): Promise<Estudiante> => 
    apiClient.get(\`/estudiantes/\${id}\`),

  // Actualizar estudiante
  update: (id: string, data: UpdateEstudianteData): Promise<Estudiante> => 
    apiClient.patch(\`/estudiantes/\${id}\`, data),

  // Eliminar estudiante
  delete: (id: string): Promise<{ message: string }> => 
    apiClient.delete(\`/estudiantes/\${id}\`),

  // Contar estudiantes
  count: (): Promise<{ count: number }> => 
    apiClient.get('/estudiantes/count'),

  // Obtener estadísticas
  getEstadisticas: (): Promise<EstadisticasEstudiantes> => 
    apiClient.get('/estudiantes/estadisticas'),

  // Listar equipos disponibles
  getEquipos: (): Promise<Equipo[]> => 
    apiClient.get('/equipos'),
};
\`\`\`

## Consideraciones:
- Todas las peticiones usan el cliente Axios configurado (con JWT auto-adjunto)
- Los tipos TypeScript garantizan type-safety en toda la app
- Las funciones retornan Promises que pueden usarse con async/await
- El cliente maneja errores automáticamente (via interceptores)

## Uso en componentes:

\`\`\`typescript
import { estudiantesApi } from '@/lib/api/estudiantes.api';

// Ejemplo en un componente
const handleCreate = async (data: CreateEstudianteData) => {
  try {
    const nuevoEstudiante = await estudiantesApi.create(data);
    console.log('Estudiante creado:', nuevoEstudiante);
  } catch (error) {
    console.error('Error al crear:', error);
  }
};
\`\`\`

# Rutas de archivos
apps/web/src/types/estudiante.ts
apps/web/src/lib/api/estudiantes.api.ts`
    },
    {
      id: "prompt-7",
      title: "Sub-Slice 7: Zustand Store de Estudiantes",
      prompt: `# Contexto
Ya tenemos la API client. Ahora creamos el store global de Zustand para gestionar el estado de estudiantes en el frontend.

# Tarea
Implementa el store de estudiantes con todas las operaciones CRUD y estado derivado.

## Ruta del archivo:
apps/web/src/store/estudiantes.store.ts

## Requisitos del store:

### Estado:
\`\`\`typescript
interface EstudiantesState {
  // Datos
  estudiantes: Estudiante[];
  estudianteActual: Estudiante | null;
  equipos: Equipo[];
  
  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Metadata
  total: number;
  page: number;
  limit: number;
  
  // Acciones
  fetchEstudiantes: (params?: QueryEstudiantesParams) => Promise<void>;
  fetchEstudianteById: (id: string) => Promise<void>;
  createEstudiante: (data: CreateEstudianteData) => Promise<Estudiante>;
  updateEstudiante: (id: string, data: UpdateEstudianteData) => Promise<void>;
  deleteEstudiante: (id: string) => Promise<void>;
  fetchEquipos: () => Promise<void>;
  clearError: () => void;
  setEstudianteActual: (estudiante: Estudiante | null) => void;
}
\`\`\`

### Ejemplo de implementación:

\`\`\`typescript
import { create } from 'zustand';
import { estudiantesApi } from '@/lib/api/estudiantes.api';
import type {
  Estudiante,
  CreateEstudianteData,
  UpdateEstudianteData,
  QueryEstudiantesParams,
  Equipo,
} from '@/types/estudiante';

interface EstudiantesState {
  estudiantes: Estudiante[];
  estudianteActual: Estudiante | null;
  equipos: Equipo[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;

  fetchEstudiantes: (params?: QueryEstudiantesParams) => Promise<void>;
  fetchEstudianteById: (id: string) => Promise<void>;
  createEstudiante: (data: CreateEstudianteData) => Promise<Estudiante>;
  updateEstudiante: (id: string, data: UpdateEstudianteData) => Promise<void>;
  deleteEstudiante: (id: string) => Promise<void>;
  fetchEquipos: () => Promise<void>;
  clearError: () => void;
  setEstudianteActual: (estudiante: Estudiante | null) => void;
}

export const useEstudiantesStore = create<EstudiantesState>((set, get) => ({
  // Estado inicial
  estudiantes: [],
  estudianteActual: null,
  equipos: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  // Fetch todos los estudiantes
  fetchEstudiantes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await estudiantesApi.getAll(params);
      set({
        estudiantes: response.data,
        total: response.metadata.total,
        page: response.metadata.page,
        limit: response.metadata.limit,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar estudiantes',
        isLoading: false,
      });
    }
  },

  // Fetch un estudiante por ID
  fetchEstudianteById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const estudiante = await estudiantesApi.getById(id);
      set({
        estudianteActual: estudiante,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar estudiante',
        isLoading: false,
      });
    }
  },

  // Crear estudiante
  createEstudiante: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const nuevoEstudiante = await estudiantesApi.create(data);
      
      // Agregar a la lista local
      set((state) => ({
        estudiantes: [...state.estudiantes, nuevoEstudiante],
        total: state.total + 1,
        isCreating: false,
      }));
      
      return nuevoEstudiante;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear estudiante',
        isCreating: false,
      });
      throw error;
    }
  },

  // Actualizar estudiante
  updateEstudiante: async (id, data) => {
    set({ isUpdating: true, error: null });
    try {
      const estudianteActualizado = await estudiantesApi.update(id, data);
      
      // Actualizar en la lista local
      set((state) => ({
        estudiantes: state.estudiantes.map((e) =>
          e.id === id ? estudianteActualizado : e
        ),
        estudianteActual:
          state.estudianteActual?.id === id
            ? estudianteActualizado
            : state.estudianteActual,
        isUpdating: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al actualizar estudiante',
        isUpdating: false,
      });
      throw error;
    }
  },

  // Eliminar estudiante
  deleteEstudiante: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await estudiantesApi.delete(id);
      
      // Remover de la lista local
      set((state) => ({
        estudiantes: state.estudiantes.filter((e) => e.id !== id),
        total: state.total - 1,
        estudianteActual:
          state.estudianteActual?.id === id ? null : state.estudianteActual,
        isDeleting: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al eliminar estudiante',
        isDeleting: false,
      });
      throw error;
    }
  },

  // Fetch equipos
  fetchEquipos: async () => {
    try {
      const equipos = await estudiantesApi.getEquipos();
      set({ equipos });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar equipos',
      });
    }
  },

  // Limpiar error
  clearError: () => set({ error: null }),

  // Establecer estudiante actual
  setEstudianteActual: (estudiante) => set({ estudianteActual: estudiante }),
}));
\`\`\`

## Uso en componentes:

\`\`\`typescript
import { useEstudiantesStore } from '@/store/estudiantes.store';

function MisEstudiantes() {
  const {
    estudiantes,
    isLoading,
    fetchEstudiantes,
    deleteEstudiante,
  } = useEstudiantesStore();

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar estudiante?')) {
      await deleteEstudiante(id);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      {estudiantes.map((estudiante) => (
        <EstudianteCard
          key={estudiante.id}
          estudiante={estudiante}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
\`\`\`

## Características:
- Estado centralizado para toda la app
- Loading states específicos por operación
- Manejo de errores con mensajes claros
- Actualización optimista del estado local
- No requiere persistencia (se recarga del servidor)

# Ruta del archivo
apps/web/src/store/estudiantes.store.ts`
    },
    {
      id: "prompt-8",
      title: "Sub-Slice 8: Componentes UI Adicionales",
      prompt: `# Contexto
Necesitamos componentes UI adicionales específicos para la gestión de estudiantes, manteniendo el estilo Crash Bandicoot.

# Tarea
Crea componentes UI reutilizables: Modal, Avatar, Badge de Nivel, y EstudianteCard.

## Estructura de archivos:
\`\`\`
apps/web/src/components/ui/
├── Button.tsx          (ya existe)
├── Input.tsx           (ya existe)
├── Card.tsx            (ya existe)
├── Modal.tsx           (nuevo)
├── Avatar.tsx          (nuevo)
├── Badge.tsx           (nuevo)
└── Select.tsx          (nuevo)
\`\`\`

## 1. Modal Component

\`\`\`typescript
// apps/web/src/components/ui/Modal.tsx
'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={\`relative bg-white rounded-2xl shadow-[12px_12px_0px_rgba(0,0,0,1)] border-4 border-black w-full \${sizes[size]} animate-scale-in\`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-gradient-to-r from-[#ff6b35] to-[#f7b801]">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
\`\`\`

## 2. Avatar Component

\`\`\`typescript
// apps/web/src/components/ui/Avatar.tsx
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export function Avatar({ src, alt, size = 'md', fallback }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getFallbackText = () => {
    if (fallback) return fallback;
    return alt.charAt(0).toUpperCase();
  };

  return (
    <div
      className={\`\${sizes[size]} rounded-full border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#ff6b35] to-[#f7b801] text-white font-bold\`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{getFallbackText()}</span>
      )}
    </div>
  );
}
\`\`\`

## 3. Badge Component

\`\`\`typescript
// apps/web/src/components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={\`inline-flex items-center font-bold rounded-full border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] \${variants[variant]} \${sizes[size]}\`}
    >
      {children}
    </span>
  );
}
\`\`\`

## 4. Select Component

\`\`\`typescript
// apps/web/src/components/ui/Select.tsx
interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  disabled = false,
  required = false,
  className = '',
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-[#2a1a5e] mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={\`w-full px-4 py-3 bg-white border-3 border-black rounded-lg shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all duration-200 focus:outline-none focus:border-[#00d9ff] focus:shadow-[5px_5px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed \${
          error ? 'border-red-500' : ''
        } \${className}\`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
\`\`\`

## 5. Actualizar index.ts

\`\`\`typescript
// apps/web/src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Modal } from './Modal';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
export { Select } from './Select';
\`\`\`

## Uso de estos componentes:

\`\`\`typescript
import { Modal, Avatar, Badge, Select } from '@/components/ui';

// Modal
<Modal isOpen={isOpen} onClose={handleClose} title="Agregar Estudiante">
  <form>...</form>
</Modal>

// Avatar
<Avatar src={estudiante.foto_url} alt={estudiante.nombre} size="lg" />

// Badge
<Badge variant="success">Nivel {estudiante.nivel_actual}</Badge>

// Select
<Select
  label="Nivel Escolar"
  options={[
    { value: 'Primaria', label: 'Primaria' },
    { value: 'Secundaria', label: 'Secundaria' },
  ]}
  value={nivelEscolar}
  onChange={(e) => setNivelEscolar(e.target.value)}
/>
\`\`\`

# Rutas de archivos
apps/web/src/components/ui/Modal.tsx
apps/web/src/components/ui/Avatar.tsx
apps/web/src/components/ui/Badge.tsx
apps/web/src/components/ui/Select.tsx
apps/web/src/components/ui/index.ts`
    },
    {
      id: "prompt-9",
      title: "Sub-Slice 9: Página de Gestión de Estudiantes",
      prompt: `# Contexto
Ya tenemos todos los componentes UI y el store de estudiantes. Ahora creamos la página principal de gestión.

# Tarea
Crea la página de gestión de estudiantes con vista de lista/grid y acciones CRUD.

## Ruta del archivo:
apps/web/app/(protected)/estudiantes/page.tsx

## Características de la página:

### Layout:
1. Header con título "Mis Estudiantes" y botón "Agregar Estudiante"
2. Filtros: por nivel escolar y por equipo
3. Vista de cards en grid responsive
4. Empty state si no hay estudiantes
5. Loading state mientras carga

### EstudianteCard Component:

\`\`\`typescript
// apps/web/src/components/estudiantes/EstudianteCard.tsx
'use client';

import { Avatar, Badge, Button } from '@/components/ui';
import { Edit, Trash2, Eye } from 'lucide-react';
import type { Estudiante } from '@/types/estudiante';

interface EstudianteCardProps {
  estudiante: Estudiante;
  onEdit: (estudiante: Estudiante) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export function EstudianteCard({
  estudiante,
  onEdit,
  onDelete,
  onView,
}: EstudianteCardProps) {
  const calcularEdad = () => {
    const hoy = new Date();
    const nacimiento = new Date(estudiante.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-200">
      {/* Avatar y nombre */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar
          src={estudiante.foto_url}
          alt={\`\${estudiante.nombre} \${estudiante.apellido}\`}
          size="lg"
          fallback={\`\${estudiante.nombre.charAt(0)}\${estudiante.apellido.charAt(0)}\`}
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#2a1a5e]">
            {estudiante.nombre} {estudiante.apellido}
          </h3>
          <p className="text-sm text-gray-600">{calcularEdad()} años</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nivel:</span>
          <Badge variant="info">{estudiante.nivel_escolar}</Badge>
        </div>
        
        {estudiante.equipo && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Equipo:</span>
            <Badge
              variant="default"
              style={{
                backgroundColor: estudiante.equipo.color_primario + '20',
                color: estudiante.equipo.color_primario,
              }}
            >
              {estudiante.equipo.nombre}
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nivel:</span>
          <Badge variant="warning">Nivel {estudiante.nivel_actual}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Puntos:</span>
          <span className="font-bold text-[#f7b801]">
            {estudiante.puntos_totales} pts
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(estudiante.id)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(estudiante)}
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(estudiante.id)}
          className="text-red-600 hover:bg-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
\`\`\`

### Página principal:

\`\`\`typescript
// apps/web/app/(protected)/estudiantes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import { Button, Select } from '@/components/ui';
import { EstudianteCard } from '@/components/estudiantes/EstudianteCard';
import { Plus, Users } from 'lucide-react';
import type { Estudiante } from '@/types/estudiante';

export default function EstudiantesPage() {
  const router = useRouter();
  const {
    estudiantes,
    isLoading,
    equipos,
    fetchEstudiantes,
    fetchEquipos,
    deleteEstudiante,
  } = useEstudiantesStore();

  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [estudianteEdit, setEstudianteEdit] = useState<Estudiante | null>(null);

  useEffect(() => {
    fetchEstudiantes();
    fetchEquipos();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        await deleteEstudiante(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleEdit = (estudiante: Estudiante) => {
    setEstudianteEdit(estudiante);
    setShowModal(true);
  };

  const handleView = (id: string) => {
    router.push(\`/estudiantes/\${id}\`);
  };

  const handleAddNew = () => {
    setEstudianteEdit(null);
    setShowModal(true);
  };

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter((e) => {
    if (filtroNivel && e.nivel_escolar !== filtroNivel) return false;
    if (filtroEquipo && e.equipo_id !== filtroEquipo) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#2a1a5e]">Mis Estudiantes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona a tus estudiantes y su progreso
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleAddNew}>
          <Plus className="w-5 h-5 mr-2" />
          Agregar Estudiante
        </Button>
      </div>

      {/* Filtros */}
      {estudiantes.length > 0 && (
        <div className="bg-white rounded-xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filtrar por nivel"
              options={[
                { value: '', label: 'Todos los niveles' },
                { value: 'Primaria', label: 'Primaria' },
                { value: 'Secundaria', label: 'Secundaria' },
                { value: 'Universidad', label: 'Universidad' },
              ]}
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
            />
            <Select
              label="Filtrar por equipo"
              options={[
                { value: '', label: 'Todos los equipos' },
                ...equipos.map((eq) => ({
                  value: eq.id,
                  label: eq.nombre,
                })),
              ]}
              value={filtroEquipo}
              onChange={(e) => setFiltroEquipo(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {estudiantesFiltrados.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            {estudiantes.length === 0
              ? '¡Aún no tienes estudiantes!'
              : 'No hay estudiantes con estos filtros'}
          </h3>
          <p className="text-gray-600 mb-6">
            {estudiantes.length === 0
              ? 'Agrega tu primer estudiante para comenzar'
              : 'Intenta cambiar los filtros'}
          </p>
          {estudiantes.length === 0 && (
            <Button variant="primary" size="lg" onClick={handleAddNew}>
              <Plus className="w-5 h-5 mr-2" />
              Agregar Primer Estudiante
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estudiantesFiltrados.map((estudiante) => (
            <EstudianteCard
              key={estudiante.id}
              estudiante={estudiante}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal (lo crearemos en el próximo sub-slice) */}
      {showModal && (
        <div>TODO: Modal de agregar/editar</div>
      )}
    </div>
  );
}
\`\`\`

## Características:
- Vista responsive en grid
- Filtros funcionales
- Empty state atractivo
- Loading state
- Acciones CRUD en cada card
- Diseño Crash Bandicoot

# Rutas de archivos
apps/web/src/components/estudiantes/EstudianteCard.tsx
apps/web/app/(protected)/estudiantes/page.tsx`
    },
    {
      id: "prompt-10",
      title: "Sub-Slice 10: Modal de Agregar/Editar Estudiante",
      prompt: `# Contexto
Ya tenemos la página de gestión. Ahora creamos el modal con formulario para agregar/editar estudiantes.

# Tarea
Implementa el modal con formulario completo, validaciones y manejo de estados.

## Componente: EstudianteFormModal

\`\`\`typescript
// apps/web/src/components/estudiantes/EstudianteFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@/components/ui';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import type { Estudiante, CreateEstudianteData } from '@/types/estudiante';

interface EstudianteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante?: Estudiante | null; // Si existe, es edición
  onSuccess?: () => void;
}

export function EstudianteFormModal({
  isOpen,
  onClose,
  estudiante,
  onSuccess,
}: EstudianteFormModalProps) {
  const { createEstudiante, updateEstudiante, equipos, isCreating, isUpdating } =
    useEstudiantesStore();

  const isEdit = !!estudiante;
  const isLoading = isCreating || isUpdating;

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    nivel_escolar: '',
    foto_url: '',
    equipo_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos si es edición
  useEffect(() => {
    if (estudiante) {
      setFormData({
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        fecha_nacimiento: estudiante.fecha_nacimiento.split('T')[0],
        nivel_escolar: estudiante.nivel_escolar,
        foto_url: estudiante.foto_url || '',
        equipo_id: estudiante.equipo_id || '',
      });
    } else {
      // Reset form para nuevo estudiante
      setFormData({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        nivel_escolar: '',
        foto_url: '',
        equipo_id: '',
      });
    }
    setErrors({});
  }, [estudiante, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      // Validar edad (5-25 años)
      const hoy = new Date();
      const nacimiento = new Date(formData.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const m = hoy.getMonth() - nacimiento.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }

      if (edad < 5) {
        newErrors.fecha_nacimiento = 'Debe tener al menos 5 años';
      } else if (edad > 25) {
        newErrors.fecha_nacimiento = 'Debe tener máximo 25 años';
      }
    }

    if (!formData.nivel_escolar) {
      newErrors.nivel_escolar = 'El nivel escolar es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data: CreateEstudianteData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        nivel_escolar: formData.nivel_escolar as any,
        foto_url: formData.foto_url.trim() || undefined,
        equipo_id: formData.equipo_id || undefined,
      };

      if (isEdit) {
        await updateEstudiante(estudiante.id, data);
      } else {
        await createEstudiante(data);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      setErrors({
        general: error.response?.data?.message || 'Error al guardar estudiante',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Estudiante' : 'Agregar Estudiante'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
            placeholder="Ej: María"
          />

          <Input
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            error={errors.apellido}
            required
            placeholder="Ej: González"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            error={errors.fecha_nacimiento}
            required
          />

          <Select
            label="Nivel Escolar"
            options={[
              { value: 'Primaria', label: 'Primaria' },
              { value: 'Secundaria', label: 'Secundaria' },
              { value: 'Universidad', label: 'Universidad' },
            ]}
            value={formData.nivel_escolar}
            onChange={handleChange}
            error={errors.nivel_escolar}
            required
          />
        </div>

        <Select
          label="Equipo (Opcional)"
          options={equipos.map((eq) => ({
            value: eq.id,
            label: eq.nombre,
          }))}
          value={formData.equipo_id}
          onChange={handleChange}
          placeholder="Sin equipo"
        />

        <Input
          label="Foto URL (Opcional)"
          name="foto_url"
          type="url"
          value={formData.foto_url}
          onChange={handleChange}
          placeholder="https://ejemplo.com/foto.jpg"
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            {isEdit ? 'Guardar Cambios' : 'Agregar Estudiante'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
\`\`\`

## Integración en la página:

\`\`\`typescript
// Actualizar apps/web/app/(protected)/estudiantes/page.tsx

// Importar el modal
import { EstudianteFormModal } from '@/components/estudiantes/EstudianteFormModal';

// En el componente, reemplazar:
{showModal && (
  <div>TODO: Modal de agregar/editar</div>
)}

// Por:
<EstudianteFormModal
  isOpen={showModal}
  onClose={() => {
    setShowModal(false);
    setEstudianteEdit(null);
  }}
  estudiante={estudianteEdit}
  onSuccess={() => {
    fetchEstudiantes(); // Recargar lista
  }}
/>
\`\`\`

## Características del formulario:
- Validación en tiempo real
- Cálculo de edad automático
- Validación de rango de edad (5-25)
- Manejo de errores del servidor
- Estados de loading
- Campos opcionales (foto_url, equipo_id)
- Diseño responsive

# Ruta del archivo
apps/web/src/components/estudiantes/EstudianteFormModal.tsx`
    }
  ];

  const checklistItems = [
    {
      category: "Backend - Base de Datos",
      items: [
        "Modelos Estudiante y Equipo creados en Prisma",
        "Relación Tutor 1:N Estudiantes configurada",
        "Relación Estudiante N:1 Equipo configurada",
        "Migración ejecutada exitosamente",
        "Seed de equipos predefinidos (opcional)",
        "Cliente Prisma regenerado"
      ]
    },
    {
      category: "Backend - Módulo Estudiantes",
      items: [
        "Módulo Estudiantes creado con estructura completa",
        "DTOs con validaciones implementadas",
        "Entity interfaces definidas",
        "Módulo importa PrismaModule y AuthModule"
      ]
    },
    {
      category: "Backend - EstudiantesService",
      items: [
        "Método create() con validaciones de edad",
        "Método findAllByTutor() con paginación",
        "Método findOne() con verificación de ownership",
        "Método update() funcional",
        "Método remove() funcional",
        "Método countByTutor() implementado",
        "Método getEstadisticas() con agregaciones",
        "Validación de equipos existe"
      ]
    },
    {
      category: "Backend - Guards y Seguridad",
      items: [
        "EstudianteOwnershipGuard implementado",
        "Guard verifica que estudiante pertenece al tutor",
        "Manejo correcto de errores 403 y 404",
        "Guard se aplica a rutas con :id"
      ]
    },
    {
      category: "Backend - Controller",
      items: [
        "POST /estudiantes funcional",
        "GET /estudiantes con filtros y paginación",
        "GET /estudiantes/:id protegido",
        "PATCH /estudiantes/:id funcional",
        "DELETE /estudiantes/:id funcional",
        "GET /estudiantes/count funcional",
        "GET /estudiantes/estadisticas funcional",
        "Respuestas con códigos HTTP correctos"
      ]
    },
    {
      category: "Frontend - API y Tipos",
      items: [
        "Interfaces TypeScript definidas",
        "Cliente API estudiantes.api.ts creado",
        "Todas las operaciones CRUD implementadas",
        "Tipos compartidos entre frontend y backend"
      ]
    },
    {
      category: "Frontend - Zustand Store",
      items: [
        "Store de estudiantes creado",
        "Acción fetchEstudiantes() funcional",
        "Acción createEstudiante() funcional",
        "Acción updateEstudiante() funcional",
        "Acción deleteEstudiante() funcional",
        "Estados de loading específicos",
        "Manejo de errores centralizado"
      ]
    },
    {
      category: "Frontend - Componentes UI",
      items: [
        "Modal component creado",
        "Avatar component creado",
        "Badge component creado",
        "Select component creado",
        "Componentes exportados en index.ts",
        "Estilo Crash Bandicoot consistente"
      ]
    },
    {
      category: "Frontend - Página de Gestión",
      items: [
        "Página /estudiantes creada",
        "EstudianteCard component funcional",
        "Vista en grid responsive",
        "Filtros por nivel y equipo funcionan",
        "Empty state atractivo",
        "Loading state visible",
        "Navegación a perfil funcional"
      ]
    },
    {
      category: "Frontend - Formulario",
      items: [
        "EstudianteFormModal creado",
        "Validaciones de formulario funcionan",
        "Validación de edad (5-25 años)",
        "Modo crear y editar funcionan",
        "Manejo de errores del servidor",
        "Estados de loading en submit",
        "Integración con página principal"
      ]
    },
    {
      category: "Integración",
      items: [
        "Backend y frontend se comunican",
        "CRUD completo funciona end-to-end",
        "Ownership verification funciona",
        "Filtros y paginación funcionan",
        "Manejo de errores consistente"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-cyan-500 rounded-2xl p-8 mb-8 shadow-2xl">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
            SLICE #2: ESTUDIANTES
          </h1>
          <p className="text-xl text-white/90 font-semibold">
            Sistema Completo de Gestión de Estudiantes
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
              13 Sub-Slices
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold text-sm">
              ~5-7 horas
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
              { key: 'architecture', label: '🗃️ Arquitectura' },
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
                  Implementar un sistema completo que permita a los tutores:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Agregar estudiantes (sus hijos) a su cuenta</li>
                  <li>Ver lista de todos sus estudiantes en cards visuales</li>
                  <li>Editar información de estudiantes</li>
                  <li>Eliminar estudiantes</li>
                  <li>Ver perfil detallado de cada estudiante</li>
                  <li>Asociar estudiantes a equipos (preparación para gamificación)</li>
                  <li>Filtrar estudiantes por nivel escolar y equipo</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Stack Tecnológico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <p className="font-bold text-purple-800 mb-2">Backend</p>
                    <p className="text-sm text-purple-700">NestJS + Prisma + PostgreSQL + Guards de Autorización</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="font-bold text-blue-800 mb-2">Frontend</p>
                    <p className="text-sm text-blue-700">Next.js 15 + Zustand + Modal + Formularios + Cards</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3">Resultado Final</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-300">
                  <p className="font-bold text-green-800 mb-3">Flujo completo del tutor:</p>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <span>Login exitoso → Ve su dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <span>Click en "Agregar Estudiante" → Abre modal con formulario</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <span>Completa datos (nombre, fecha nacimiento, nivel) → Estudiante creado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <span>Ve lista de estudiantes en cards con foto, nivel, equipo y puntos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                      <span>Puede filtrar por nivel escolar o equipo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                      <span>Click en estudiante → Ve perfil completo con estadísticas</span>
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
          </div>
        )}

        {/* Prompts - Continuará en próxima respuesta */}
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
                  <div className="bg-gray-900 p-6 overflow-x-auto max-h-96">
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
                <strong>Marca cada ítem</strong> a medida que lo completes. Todos deben estar ✅ antes de considerar el Slice #2 terminado.
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

export default Slice2Documentation;
