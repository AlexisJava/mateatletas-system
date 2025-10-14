# 📋 ISSUES Y TODOs CONSOLIDADO - Mateatletas Ecosystem

**Fecha:** 14 de Octubre de 2025
**Estado del Proyecto:** 94% Completado (16/17 slices)
**Preparado por:** Claude Code

---

## 🎯 RESUMEN EJECUTIVO

Este documento consolida todos los issues conocidos, deuda técnica y TODOs pendientes del proyecto Mateatletas, organizados por prioridad y categoría.

---

## 🔴 PRIORIDAD ALTA (Bloqueantes para Producción)

### 1. MercadoPago - Configuración de Producción

**Slice:** #6 (Pagos)
**Estado:** ⚠️ Mock Mode Activo
**Impacto:** 🔴 CRÍTICO - Sin esto no hay pagos reales

#### Descripción
Actualmente el sistema de pagos funciona en modo mock para desarrollo. Antes de producción se debe configurar con credenciales reales de MercadoPago.

#### TODOs
```bash
[ ] Obtener credenciales reales de MercadoPago
[ ] Configurar ACCESS_TOKEN en production
[ ] Configurar PUBLIC_KEY en production
[ ] Configurar WEBHOOK_SECRET en production
[ ] Configurar webhook URL público (dominio o ngrok)
[ ] Testing en sandbox de MercadoPago
[ ] Validar flujo completo: pago → webhook → activación
[ ] Remover código mock mode de producción
```

#### Archivos Afectados
- `apps/api/src/pagos/pagos.service.ts`
- `.env.production`

#### Tiempo Estimado
- **Setup:** 2-3 horas
- **Testing:** 2-3 horas
- **Total:** 4-6 horas

---

### 2. HTTPS y Certificados SSL

**Estado:** ⏳ Pendiente
**Impacto:** 🔴 CRÍTICO - Requerido por MercadoPago y seguridad

#### Descripción
El proyecto necesita HTTPS configurado para:
- Webhooks de MercadoPago (requerimiento)
- Seguridad de credenciales
- JWT tokens seguros
- Cookies seguras

#### TODOs
```bash
[ ] Adquirir dominio (si no existe)
[ ] Configurar DNS
[ ] Obtener certificado SSL (Let's Encrypt recomendado)
[ ] Configurar Nginx/Apache con SSL
[ ] Actualizar NEXT_PUBLIC_API_URL a HTTPS
[ ] Actualizar CORS origins
[ ] Testing de todos los endpoints en HTTPS
```

#### Tiempo Estimado
- **Configuración:** 3-4 horas
- **Testing:** 1-2 horas
- **Total:** 4-6 horas

---

### 3. Environment Variables Sensibles

**Estado:** ⚠️ Riesgo de Seguridad
**Impacto:** 🔴 ALTO

#### Descripción
Las variables de entorno contienen secretos sensibles y deben ser manejadas correctamente en producción.

#### TODOs
```bash
[ ] Verificar que .env no esté en git (revisar .gitignore)
[ ] Crear .env.example sin valores reales
[ ] Usar secrets manager (AWS Secrets Manager, Vault, etc.)
[ ] Rotar JWT_SECRET para producción
[ ] Usar diferentes secrets por ambiente (dev/staging/prod)
[ ] Documentar proceso de rotación de secrets
[ ] Implementar encriptación de variables sensibles
```

#### Variables Críticas
```env
JWT_SECRET
MERCADOPAGO_ACCESS_TOKEN
MERCADOPAGO_WEBHOOK_SECRET
DATABASE_URL
```

#### Tiempo Estimado
- 3-4 horas

---

## 🟠 PRIORIDAD MEDIA (Importante pero no bloquean te)

### 4. TypeScript `any` Types Cleanup

**Estado:** ⚠️ ~50 ocurrencias
**Impacto:** 🟠 MEDIO - Code quality

#### Descripción
Hay aproximadamente 50 usos de `any` que deberían ser reemplazados con tipos específicos para mejorar la seguridad de tipos.

#### Ubicaciones Principales
```typescript
// Relaciones de Prisma en services
const asistencias = await prisma.asistencia.findMany({
  include: { estudiante: true, clase: true }
});
// asistencias tiene tipo 'any' en vez de tipo específico

// Request objects en controllers
async handler(@Request() req: any)
// Debería ser: RequestWithUser

// Responses de API externa
const response = await api.get(url);
// response.data es 'any'
```

#### TODOs
```bash
[ ] Crear types para modelos Prisma con includes
[ ] Crear interface RequestWithUser extendiendo Express.Request
[ ] Tipar responses de APIs externas (MercadoPago, etc.)
[ ] Crear utility types para relaciones comunes
[ ] Actualizar controllers con tipos específicos
[ ] Actualizar services con tipos específicos
[ ] Ejecutar tsc --noImplicitAny para verificar
```

#### Ejemplo de Solución
```typescript
// ANTES
const estudiante = await prisma.estudiante.findUnique({
  where: { id },
  include: { equipo: true, tutor: true }
}) as any;

// DESPUÉS
type EstudianteConRelaciones = Prisma.EstudianteGetPayload<{
  include: { equipo: true; tutor: true };
}>;

const estudiante: EstudianteConRelaciones | null =
  await prisma.estudiante.findUnique({
    where: { id },
    include: { equipo: true, tutor: true }
  });
```

#### Tiempo Estimado
- 4-6 horas

---

### 5. Swagger/OpenAPI Documentation

**Estado:** ⏳ No implementado
**Impacto:** 🟠 MEDIO - Developer experience

#### Descripción
El proyecto no tiene documentación interactiva de API (Swagger). Actualmente solo hay documentación manual en Markdown.

#### Beneficios
- Documentación auto-generada
- Testing interactivo de endpoints
- Generación automática de clientes
- Mejor onboarding de devs

#### TODOs
```bash
[ ] Instalar @nestjs/swagger
[ ] Configurar Swagger module en main.ts
[ ] Agregar decoradores @ApiTags a controllers
[ ] Agregar @ApiOperation a endpoints
[ ] Agregar @ApiResponse con ejemplos
[ ] Agregar @ApiProperty a DTOs
[ ] Configurar authentication (JWT bearer)
[ ] Agregar ejemplos de requests/responses
[ ] Configurar servidor de docs (Swagger UI)
[ ] Generar documentación estática para deploy
```

#### Ejemplo de Implementación
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Mateatletas API')
  .setDescription('API de la plataforma educativa Mateatletas')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

// Controller
@ApiTags('estudiantes')
@Controller('estudiantes')
export class EstudiantesController {

  @Get()
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes' })
  findAll() { }
}
```

#### Tiempo Estimado
- 3-4 horas

---

### 6. Testing Unitario

**Estado:** ⏳ Solo E2E disponible
**Impacto:** 🟠 MEDIO - Calidad de código

#### Descripción
El proyecto tiene excelente cobertura E2E (~245 tests) pero no tiene tests unitarios para services y funciones individuales.

#### TODOs
```bash
[ ] Configurar Jest para testing unitario
[ ] Crear mocks de PrismaService
[ ] Tests unitarios para AuthService (10 tests)
[ ] Tests unitarios para EstudiantesService (15 tests)
[ ] Tests unitarios para GamificacionService (20 tests)
[ ] Tests unitarios para CursosService (25 tests)
[ ] Tests unitarios para AsistenciaService (15 tests)
[ ] Tests unitarios para ClasesService (15 tests)
[ ] Tests unitarios para helpers/utilities
[ ] Configurar coverage mínimo (80%)
[ ] Integrar con CI/CD
```

#### Ejemplo de Test Unitario
```typescript
describe('GamificacionService', () => {
  let service: GamificacionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GamificacionService,
        {
          provide: PrismaService,
          useValue: {
            logro: { findMany: jest.fn() },
            logroObtenido: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<GamificacionService>(GamificacionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return all logros', async () => {
    const mockLogros = [{ id: '1', nombre: 'Primera Clase' }];
    jest.spyOn(prisma.logro, 'findMany').mockResolvedValue(mockLogros);

    const result = await service.getAllLogros();
    expect(result).toEqual(mockLogros);
  });
});
```

#### Tiempo Estimado
- 8-10 horas (setup + tests críticos)
- 20-30 horas (cobertura completa)

---

### 7. Frontend para SLICE #16 (Cursos)

**Estado:** ⏳ Backend completo, Frontend pendiente
**Impacto:** 🟠 MEDIO - Feature incompleta

#### Descripción
El backend de cursos está 100% implementado con 12/12 tests passing, pero falta la interfaz de usuario.

#### TODOs - Admin Panel
```bash
[ ] Crear página /admin/cursos
[ ] Lista de productos tipo "Curso"
[ ] Botón "Gestionar Contenido" por curso
[ ] Modal/página de edición de módulos
[ ] CRUD de módulos (inline editing)
[ ] CRUD de lecciones (inline editing)
[ ] Drag & drop para reordenar módulos
[ ] Drag & drop para reordenar lecciones
[ ] Vista previa de lecciones
[ ] Editor de contenido por tipo:
    [ ] Video: Input URL + preview
    [ ] Texto: Markdown editor
    [ ] Quiz: Editor de preguntas
    [ ] Tarea: Editor de ejercicios
[ ] Upload de recursos adicionales
[ ] Toggle publicado/activo
```

#### TODOs - Portal Estudiante
```bash
[ ] Crear página /estudiante/cursos
[ ] Lista de cursos inscritos
[ ] Botón "Continuar Aprendiendo"
[ ] Crear página /estudiante/cursos/[id]
[ ] Sidebar con estructura del curso
    [ ] Módulos colapsables
    [ ] Lecciones con iconos por tipo
    [ ] Checkmarks en completadas
    [ ] Lock icon en bloqueadas (prerequisito)
[ ] Área principal con contenido de lección
[ ] Componente LeccionViewer (multi-modal):
    [ ] VideoPlayer para tipo Video
    [ ] MarkdownRenderer para tipo Texto
    [ ] QuizPlayer para tipo Quiz
    [ ] TareaViewer para tipo Tarea
[ ] Progress bar por módulo
[ ] Progress bar general del curso
[ ] Botón "Marcar como Completada"
[ ] Navegación Anterior/Siguiente
[ ] Modal de confirmación al completar
[ ] Celebración con confetti al ganar puntos
[ ] Toast con logros desbloqueados
```

#### Componentes Necesarios (8)
```bash
[ ] CursoEditor.tsx (Admin)
[ ] ModuloEditor.tsx (Admin)
[ ] LeccionEditor.tsx (Admin)
[ ] DragDropList.tsx (Admin - utility)
[ ] LeccionViewer.tsx (Estudiante)
[ ] VideoPlayer.tsx (Estudiante)
[ ] MarkdownRenderer.tsx (Estudiante)
[ ] QuizPlayer.tsx (Estudiante)
```

#### API Helpers
```typescript
// apps/web/src/lib/api/cursos.api.ts
export const cursosApi = {
  // Admin
  getModulos: (productoId: string) => { },
  createModulo: (productoId: string, data: CreateModuloDto) => { },
  updateModulo: (id: string, data: UpdateModuloDto) => { },
  deleteModulo: (id: string) => { },
  reordenarModulos: (productoId: string, orden: string[]) => { },

  getLecciones: (moduloId: string) => { },
  createLeccion: (moduloId: string, data: CreateLeccionDto) => { },
  updateLeccion: (id: string, data: UpdateLeccionDto) => { },
  deleteLeccion: (id: string) => { },
  reordenarLecciones: (moduloId: string, orden: string[]) => { },

  // Estudiante
  getLeccion: (id: string) => { },
  completarLeccion: (id: string, data: CompletarLeccionDto) => { },
  getProgreso: (productoId: string) => { },
  getSiguienteLeccion: (productoId: string) => { },
};
```

#### Tiempo Estimado
- **Admin Panel:** 6-8 horas
- **Portal Estudiante:** 8-10 horas
- **Components:** 4-6 horas
- **Total:** 18-24 horas

---

## 🟡 PRIORIDAD BAJA (Nice to Have)

### 8. SLICE #17: Jitsi Meet Integration

**Estado:** ⏳ Pendiente (opcional para MVP)
**Impacto:** 🟡 BAJO - Feature adicional

#### Descripción
Integración de videollamadas Jitsi Meet para clases en vivo dentro de la plataforma.

#### TODOs
```bash
[ ] Instalar Jitsi External API
[ ] Generar URLs únicas por clase
[ ] Configurar JWT Jitsi (opcional)
[ ] Crear componente JitsiMeet React
[ ] Endpoint GET /clases/:id/sala
[ ] Agregar campo enlace_sala_virtual a Clase
[ ] Botón "Unirse a Clase" en portales
[ ] Validar horario de clase (solo durante clase)
[ ] Testing con 2+ usuarios simultáneos
```

#### Componente React
```typescript
// apps/web/src/components/JitsiMeet.tsx
interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  email: string;
  onReady?: () => void;
  onLeave?: () => void;
}

export function JitsiMeet(props: JitsiMeetProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initJitsi();
    document.body.appendChild(script);
  }, []);

  // Implementación...
}
```

#### Tiempo Estimado
- 3-4 horas

---

### 9. Rate Limiting

**Estado:** ⏳ No implementado
**Impacto:** 🟡 BAJO - Protección DoS

#### Descripción
Implementar rate limiting para proteger API de abuse y ataques DoS.

#### TODOs
```bash
[ ] Instalar @nestjs/throttler
[ ] Configurar ThrottlerModule
[ ] Aplicar @Throttle a endpoints sensibles
[ ] Configurar límites por endpoint:
    [ ] Login: 5 intentos/min
    [ ] Register: 3 intentos/min
    [ ] Pagos: 10 requests/min
    [ ] Normal endpoints: 100 requests/min
[ ] Storage backend (Redis recomendado)
[ ] Mensajes de error informativos
[ ] Testing de límites
```

#### Ejemplo
```typescript
// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
  ],
})
export class AppModule {}

// Controller
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests por 60 segundos
@Post('login')
async login() { }
```

#### Tiempo Estimado
- 2-3 horas

---

### 10. Logging Estructurado (Winston)

**Estado:** ⏳ Solo console.log
**Impacto:** 🟡 BAJO - Debugging

#### Descripción
Reemplazar console.log con sistema de logging profesional (Winston).

#### TODOs
```bash
[ ] Instalar winston + nest-winston
[ ] Configurar WinstonModule
[ ] Crear formato de log consistente
[ ] Niveles de log (error, warn, info, debug)
[ ] Logs por ambiente (dev vs prod)
[ ] Rotation de archivos de log
[ ] Integración con ELK stack (opcional)
[ ] Remover todos los console.log
```

#### Ejemplo
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Usage
this.logger.log('User logged in', { userId: '123' });
this.logger.error('Payment failed', { error, orderId });
```

#### Tiempo Estimado
- 3-4 horas

---

### 11. Error Tracking (Sentry)

**Estado:** ⏳ No implementado
**Impacto:** 🟡 BAJO - Monitoring

#### Descripción
Integrar Sentry para capturar y reportar errores en producción.

#### TODOs
```bash
[ ] Crear cuenta Sentry
[ ] Instalar @sentry/node (backend)
[ ] Instalar @sentry/nextjs (frontend)
[ ] Configurar Sentry.init()
[ ] Capturar errores automáticamente
[ ] Agregar contexto (user, request, etc.)
[ ] Configurar alerts por email/Slack
[ ] Testing de error tracking
[ ] Dashboard de monitoreo
```

#### Tiempo Estimado
- 2-3 horas

---

### 12. CI/CD Pipeline

**Estado:** ⏳ No implementado
**Impacto:** 🟡 BAJO - DevOps

#### Descripción
Automatizar testing, build y deployment con GitHub Actions.

#### TODOs
```bash
[ ] Crear .github/workflows/ci.yml
[ ] Job: Linting (ESLint)
[ ] Job: Type checking (tsc)
[ ] Job: Unit tests (Jest)
[ ] Job: E2E tests (scripts)
[ ] Job: Build backend
[ ] Job: Build frontend
[ ] Job: Deploy to staging (auto en push a main)
[ ] Job: Deploy to production (manual approval)
[ ] Configurar secrets en GitHub
[ ] Notificaciones de Slack
```

#### Ejemplo Workflow
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy:staging

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: npm run deploy:production
```

#### Tiempo Estimado
- 4-6 horas

---

## 🐛 BUGS CONOCIDOS (Resueltos)

### ✅ Bug #1: AsistenciaService Query Error

**Estado:** ✅ RESUELTO
**Fecha:** Octubre 14, 2025
**Slice:** #14 (Portal Docente)

#### Descripción
El método `obtenerObservacionesDocente()` intentaba filtrar por `docente_id` directamente en el modelo `Asistencia`, pero este campo no existe.

#### Error
```typescript
// ❌ ANTES
where: {
  docente_id: docenteId,
  observaciones: { not: null }
}

// Error: Unknown argument `docente_id`
```

#### Solución
```typescript
// ✅ DESPUÉS
where: {
  clase: {
    docente_id: docenteId
  },
  observaciones: { not: null }
}
```

#### Archivos Modificados
- `apps/api/src/asistencia/asistencia.service.ts:487`

---

### ✅ Bug #2: PuntoObtenido Schema Mismatch

**Estado:** ✅ RESUELTO
**Fecha:** Octubre 14, 2025
**Slice:** #16 (Cursos)

#### Descripción
El código intentaba crear registros de `PuntoObtenido` con campos que no existen en el schema (`razon`, `fuente`, `fuente_id`).

#### Error
```typescript
// ❌ ANTES
await prisma.puntoObtenido.create({
  data: {
    estudiante_id,
    puntos,
    razon: `Completó lección: ${leccion.titulo}`,
    fuente: 'Leccion',
    fuente_id: leccionId,
  }
});

// Error: Unknown fields razon, fuente, fuente_id
```

#### Solución
Simplificado a actualización directa de `estudiante.puntos_totales` con TODO para futura integración con GamificacionService.

```typescript
// ✅ DESPUÉS
// TODO: Integrar con GamificacionService
if (puntosGanados > 0) {
  await prisma.estudiante.update({
    where: { id: estudianteId },
    data: {
      puntos_totales: {
        increment: puntosGanados
      }
    }
  });
}
```

#### Archivos Modificados
- `apps/api/src/cursos/cursos.service.ts:428-440`

---

## 📊 RESUMEN POR CATEGORÍA

### Seguridad (4 items)
- 🔴 MercadoPago Production Setup
- 🔴 HTTPS y SSL
- 🔴 Environment Variables Management
- 🟡 Rate Limiting

### Code Quality (3 items)
- 🟠 TypeScript `any` Cleanup
- 🟠 Testing Unitario
- 🟡 Logging Estructurado

### Developer Experience (2 items)
- 🟠 Swagger/OpenAPI Docs
- 🟡 CI/CD Pipeline

### Features (2 items)
- 🟠 Frontend para SLICE #16 (Cursos)
- 🟡 SLICE #17 (Jitsi Meet)

### Monitoring (1 item)
- 🟡 Error Tracking (Sentry)

---

## ⏰ TIEMPO TOTAL ESTIMADO

### Prioridad Alta (Bloqueantes)
- MercadoPago Setup: 4-6 horas
- HTTPS Config: 4-6 horas
- Environment Variables: 3-4 horas
- **Total Alta:** 11-16 horas

### Prioridad Media (Importantes)
- TypeScript Cleanup: 4-6 horas
- Swagger Docs: 3-4 horas
- Testing Unitario: 8-10 horas
- Frontend Cursos: 18-24 horas
- **Total Media:** 33-44 horas

### Prioridad Baja (Nice to Have)
- Jitsi Meet: 3-4 horas
- Rate Limiting: 2-3 horas
- Winston Logging: 3-4 horas
- Sentry: 2-3 horas
- CI/CD: 4-6 horas
- **Total Baja:** 14-20 horas

### GRAN TOTAL
**58-80 horas** de trabajo pendiente

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Pre-Producción (3-4 días)
1. MercadoPago Production Setup
2. HTTPS Configuration
3. Environment Variables Management
4. Testing completo del flujo de pagos

### Fase 2: Code Quality (1 semana)
1. TypeScript any cleanup
2. Swagger documentation
3. Testing unitario básico (servicios críticos)

### Fase 3: Features Pendientes (2-3 semanas)
1. Frontend para Cursos (Admin + Estudiante)
2. Testing E2E del flujo completo de cursos
3. Jitsi Meet integration (opcional)

### Fase 4: Infraestructura (1 semana)
1. CI/CD Pipeline
2. Error tracking (Sentry)
3. Logging estructurado (Winston)
4. Rate limiting

---

## 📞 SOPORTE

**Para reportar nuevos issues:**
- GitHub Issues: [URL del repositorio]
- Email: [email del equipo]
- Slack: #mateatletas-dev

**Para consultar sobre TODOs:**
- Ver documentación en `/docs`
- Revisar este documento
- Contactar al lead developer

---

**Documento actualizado:** 14 de Octubre de 2025
**Próxima revisión:** Después de completar Fase 1

---

FIN DEL DOCUMENTO ✅
