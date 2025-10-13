# 📋 Slices Faltantes - Mateatletas

**Fecha:** Octubre 13, 2025
**Estado Actual:** 70% completado (10/10 slices backend + 40% frontend)
**Objetivo:** Llegar a 100% MVP-ready

---

## 🎯 Estrategia de Implementación

### Criterios de Priorización:
1. **CRÍTICO** 🔴 - Bloquea MVP, debe implementarse YA
2. **ALTA** 🟠 - Diferenciador clave, implementar pronto
3. **MEDIA** 🟡 - Mejora experiencia, puede esperar
4. **BAJA** 🟢 - Nice to have, post-MVP

---

## 🔴 SLICES CRÍTICOS (Para MVP)

---

### SLICE #11: Autenticación de Estudiantes
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 2-3 horas
**Complejidad:** Baja
**Bloqueante:** Sí (Portal estudiante no funciona sin esto)

#### Descripción:
Actualmente los estudiantes no pueden hacer login propio. Están manejados por tutores pero sin credenciales. Necesitamos agregar email/password para que accedan al portal.

#### Tareas Backend (1.5 horas):
1. **Modificar Prisma Schema** (15 min)
   ```prisma
   model Estudiante {
     // Campos existentes...
     email         String  @unique
     password_hash String
     // Resto igual...
   }
   ```

2. **Crear migración** (5 min)
   ```bash
   npx prisma migrate dev --name add_estudiante_auth
   ```

3. **Actualizar AuthService** (30 min)
   - Agregar método `loginEstudiante(email, password)`
   - Validar credenciales contra tabla `Estudiante`
   - Retornar JWT con rol 'estudiante'

4. **Actualizar AuthController** (15 min)
   - Endpoint: `POST /auth/estudiante/login`
   - Endpoint: `POST /auth/estudiante/register` (opcional, solo si tutores pueden crear)

5. **Actualizar JwtStrategy** (15 min)
   - Validar rol 'estudiante' en payload
   - Cargar datos de estudiante en request.user

6. **Seed con estudiantes** (10 min)
   ```typescript
   // Crear 3 estudiantes de prueba con credenciales
   estudiante1@test.com / password123
   estudiante2@test.com / password123
   estudiante3@test.com / password123
   ```

#### Tareas Frontend (1 hora):
1. **Remover mock bypass** (10 min)
   - Eliminar código de `FASE4_MOCK_MODE.md`
   - Restaurar auth guard real en `estudiante/layout.tsx`

2. **Página de login estudiante** (30 min)
   - Crear `/estudiante/login` o usar `/login` con toggle
   - Form con email/password
   - Llamar a `authApi.loginEstudiante()`

3. **Testing** (20 min)
   - Login con estudiante real
   - Verificar acceso a dashboard/logros/ranking
   - Verificar datos reales desde backend

#### Archivos a modificar:
```
Backend:
- apps/api/prisma/schema.prisma
- apps/api/src/auth/auth.service.ts
- apps/api/src/auth/auth.controller.ts
- apps/api/src/auth/strategies/jwt.strategy.ts
- apps/api/prisma/seed.ts

Frontend:
- apps/web/src/app/estudiante/layout.tsx
- apps/web/src/app/estudiante/login/page.tsx (nuevo)
- apps/web/src/lib/api/auth.api.ts
```

#### Testing:
```bash
# 1. Login estudiante
curl -X POST http://localhost:3001/auth/estudiante/login \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante1@test.com","password":"password123"}'

# 2. Verificar token
# 3. Acceder a portal estudiante
```

#### Criterio de éxito:
- ✅ Estudiante puede hacer login con email/password
- ✅ Recibe JWT con rol 'estudiante'
- ✅ Accede a portal estudiante con datos reales
- ✅ No puede acceder a rutas de otros roles

---

### SLICE #12: Sistema de Gamificación Completo
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 4-5 horas
**Complejidad:** Media
**Bloqueante:** Sí (Diferenciador clave del producto)

#### Descripción:
Actualmente la gamificación está simulada. Necesitamos las tablas transaccionales y la lógica real para otorgar puntos y logros.

#### Tareas Backend (3 horas):

##### 1. Modificar Schema (30 min)
```prisma
// Tabla de configuración de acciones
model AccionPuntuable {
  id          String   @id @default(cuid())
  nombre      String   // "Razonamiento destacado"
  descripcion String?
  puntos      Int      // +5
  activo      Boolean  @default(true)

  // Relación
  puntosObtenidos PuntoObtenido[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("acciones_puntuables")
}

// Tabla de configuración de logros
model Logro {
  id            String   @id @default(cuid())
  nombre        String   @unique // "Primera Clase"
  descripcion   String?
  icono         String   // emoji o URL
  puntos_extra  Int      @default(0)
  categoria     String   // "inicio", "asistencia", etc.
  requisito     String?  // JSON con condiciones
  activo        Boolean  @default(true)

  // Relación
  logrosObtenidos LogroObtenido[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("logros")
}

// Tabla transaccional de puntos
model PuntoObtenido {
  id                   String   @id @default(cuid())
  estudiante_id        String
  docente_id_otorgante String?
  accion_id            String
  clase_id             String?
  puntos_asignados     Int
  fecha_otorgado       DateTime @default(now())

  // Relaciones
  estudiante Estudiante       @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)
  docente    Docente?         @relation(fields: [docente_id_otorgante], references: [id])
  accion     AccionPuntuable  @relation(fields: [accion_id], references: [id])
  clase      Clase?           @relation(fields: [clase_id], references: [id])

  createdAt DateTime @default(now())

  @@map("puntos_obtenidos")
  @@index([estudiante_id])
  @@index([fecha_otorgado])
}

// Tabla transaccional de logros
model LogroObtenido {
  id                   String   @id @default(cuid())
  estudiante_id        String
  logro_id             String
  docente_id_otorgante String?
  fecha_obtenido       DateTime @default(now())

  // Relaciones
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)
  logro      Logro      @relation(fields: [logro_id], references: [id])
  docente    Docente?   @relation(fields: [docente_id_otorgante], references: [id])

  createdAt DateTime @default(now())

  @@unique([estudiante_id, logro_id]) // Un logro solo una vez
  @@map("logros_obtenidos")
  @@index([estudiante_id])
}
```

##### 2. Migración y Seeds (30 min)
```bash
npx prisma migrate dev --name add_gamification_tables
```

Seeds de acciones puntuables:
- Razonamiento destacado (+5)
- Superación personal (+5)
- Colaboración (+3)
- Intento valiente (+3)
- Participación activa (+2)

Seeds de 8 logros:
- Primera Clase (50 pts)
- Asistencia Perfecta (100 pts)
- 10 Clases (150 pts)
- Maestro Álgebra (200 pts)
- Ayudante (100 pts)
- Racha 7 días (150 pts)
- Racha 30 días (500 pts)
- MVP del Mes (300 pts)

##### 3. Actualizar GamificacionService (1 hora)
```typescript
// Métodos nuevos:
- async otorgarPuntos(estudianteId, accionId, docenteId, claseId?)
- async desbloquearLogro(estudianteId, logroId, docenteId?)
- async calcularPuntosTotales(estudianteId)
- async calcularNivel(puntosTotales)
- async verificarLogrosAutomaticos(estudianteId)
- async getHistorialPuntos(estudianteId)
```

##### 4. Triggers para actualizar puntos_totales (30 min)
```sql
-- Trigger que actualiza puntos_totales en Estudiante
-- cuando se inserta en puntos_obtenidos
CREATE OR REPLACE FUNCTION actualizar_puntos_estudiante()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE estudiantes
  SET puntos_totales = (
    SELECT COALESCE(SUM(puntos_asignados), 0)
    FROM puntos_obtenidos
    WHERE estudiante_id = NEW.estudiante_id
  )
  WHERE id = NEW.estudiante_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_puntos
AFTER INSERT ON puntos_obtenidos
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntos_estudiante();
```

##### 5. Nuevos Endpoints (30 min)
```typescript
// Controller
POST   /gamificacion/puntos/otorgar
POST   /gamificacion/logros/:logroId/desbloquear
GET    /gamificacion/acciones  // Lista de acciones para UI docente
GET    /gamificacion/historial/:estudianteId
```

#### Tareas Frontend (2 horas):

##### 1. UI para Docente - Otorgar Puntos (1 hora)
Crear modal en `/docente/clases/[id]/asistencia`:
- Botón "+Puntos" por cada estudiante
- Modal con lista de acciones puntuables
- Select acción + cantidad
- Llamar a `POST /gamificacion/puntos/otorgar`

##### 2. Actualizar Portal Estudiante (1 hora)
- Conectar dashboard con datos reales de `puntos_obtenidos`
- Mostrar historial de puntos recibidos
- Logros: obtener de `logros_obtenidos`
- Ranking: calcular desde `puntos_totales`

#### Archivos a modificar:
```
Backend:
- apps/api/prisma/schema.prisma (+4 modelos)
- apps/api/prisma/seed.ts (seeds de acciones y logros)
- apps/api/src/gamificacion/gamificacion.service.ts
- apps/api/src/gamificacion/gamificacion.controller.ts

Frontend:
- apps/web/src/app/docente/clases/[id]/asistencia/page.tsx
- apps/web/src/app/estudiante/dashboard/page.tsx
- apps/web/src/app/estudiante/logros/page.tsx
- apps/web/src/lib/api/gamificacion.api.ts
- apps/web/src/components/OtorgarPuntosModal.tsx (nuevo)
```

#### Testing:
```bash
# Test script
./tests/scripts/test-gamification.sh

# Manual:
# 1. Docente otorga 5 puntos a estudiante
# 2. Verificar trigger actualiza puntos_totales
# 3. Estudiante ve puntos en dashboard
# 4. Desbloquear logro "Primera Clase"
# 5. Verificar aparece en portal estudiante
```

#### Criterio de éxito:
- ✅ Docente puede otorgar puntos desde UI
- ✅ Puntos se reflejan inmediatamente en estudiante
- ✅ Logros se desbloquean y muestran confetti
- ✅ Ranking se calcula correctamente
- ✅ Trigger actualiza puntos_totales automáticamente

---

### SLICE #13: Webhook de MercadoPago Real
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 3-4 horas
**Complejidad:** Media-Alta
**Bloqueante:** Sí (No hay pagos reales sin esto)

#### Descripción:
Actualmente MercadoPago está en mock mode. Necesitamos implementar el webhook real para activar membresías automáticamente cuando llega el pago.

#### Tareas Backend (3.5 horas):

##### 1. Endpoint de Webhook (1 hora)
```typescript
// apps/api/src/pagos/pagos.controller.ts

@Post('webhook')
async handleWebhook(
  @Body() notification: any,
  @Headers('x-signature') signature: string,
  @Headers('x-request-id') requestId: string,
) {
  // 1. Validar firma HMAC
  const isValid = this.pagosService.validateSignature(
    notification,
    signature,
    requestId
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid signature');
  }

  // 2. Procesar según tipo
  const { type, data } = notification;

  if (type === 'payment') {
    await this.pagosService.procesarPago(data.id);
  }

  if (type === 'subscription_preapproval') {
    await this.pagosService.procesarSuscripcion(data.id);
  }

  return { status: 'ok' };
}
```

##### 2. Validación de Firma (45 min)
```typescript
// apps/api/src/pagos/pagos.service.ts

validateSignature(
  notification: any,
  signature: string,
  requestId: string
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  // Extraer ts y v1 de x-signature
  const parts = signature.split(',');
  const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
  const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];

  // Crear manifest
  const manifest = `id:${data.id};request-id:${requestId};ts:${ts};`;

  // Calcular HMAC
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return hmac === v1;
}
```

##### 3. Procesar Pago (1 hora)
```typescript
async procesarPago(paymentId: string) {
  // 1. Consultar estado real en MercadoPago
  const payment = await this.mercadopago.payment.get(paymentId);

  if (payment.status !== 'approved') {
    return; // Ignorar si no está aprobado
  }

  // 2. Buscar membresía o inscripción pendiente
  const { metadata } = payment;
  const { tipo, id } = metadata; // 'membresia' o 'curso'

  if (tipo === 'membresia') {
    // Activar membresía
    await this.prisma.membresia.update({
      where: { id },
      data: {
        estado: EstadoMembresia.Activa,
        fecha_inicio: new Date(),
        fecha_proximo_pago: addMonths(new Date(), 1),
      },
    });

    // Enviar notificación al tutor
    // ...
  }

  if (tipo === 'curso') {
    // Activar inscripción a curso
    await this.prisma.inscripcionCurso.update({
      where: { id },
      data: { estado: EstadoInscripcionCurso.Activo },
    });
  }

  // 3. Registrar pago en tabla de auditoría
  await this.prisma.pago.create({
    data: {
      mercadopago_id: paymentId,
      monto: payment.transaction_amount,
      estado: payment.status,
      metadata: payment.metadata,
    },
  });
}
```

##### 4. Testing con Sandbox (45 min)
```bash
# 1. Configurar ngrok para exponer webhook
ngrok http 3001

# 2. Configurar URL en MercadoPago
https://xxx.ngrok.io/pagos/webhook

# 3. Hacer pago de prueba con tarjeta de test
# 4. Verificar webhook recibido
# 5. Verificar membresía activada
```

#### Tareas Frontend (30 min):

##### 1. Página de Éxito Mejorada
- Mostrar mensaje de confirmación
- Poll cada 3 segundos para verificar activación
- Redirigir a dashboard cuando esté activa

#### Archivos a modificar:
```
Backend:
- apps/api/src/pagos/pagos.controller.ts
- apps/api/src/pagos/pagos.service.ts
- apps/api/prisma/schema.prisma (agregar tabla pagos para auditoría)

Frontend:
- apps/web/src/app/membresia/confirmacion/page.tsx
```

#### Environment Variables:
```env
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_de_webhook
MERCADOPAGO_PUBLIC_KEY=tu_public_key
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
```

#### Testing:
```bash
# Script de testing
./tests/scripts/test-webhook.sh

# Incluye:
# 1. Simular webhook con firma válida
# 2. Verificar activación de membresía
# 3. Simular webhook con firma inválida (debe rechazar)
```

#### Criterio de éxito:
- ✅ Webhook valida firma correctamente
- ✅ Rechaza webhooks con firma inválida
- ✅ Activa membresía cuando pago es approved
- ✅ Registra pago en tabla de auditoría
- ✅ Funciona en sandbox de MercadoPago

---

### SLICE #14: Portal Docente Completo
**Prioridad:** 🔴 CRÍTICA
**Tiempo estimado:** 4-5 horas
**Complejidad:** Media
**Bloqueante:** Parcial (docentes pueden operar pero con UX limitada)

#### Descripción:
Completar las funcionalidades faltantes del portal docente para que puedan operar de forma independiente y eficiente.

#### Tareas Frontend (4-5 horas):

##### 1. Página de Perfil Docente (1 hora)
**Ruta:** `/docente/perfil`

```tsx
// apps/web/src/app/docente/perfil/page.tsx

Features:
- Ver datos personales (nombre, email, teléfono)
- Editar título profesional
- Editar biografía (textarea)
- Ver especialidades (rutas curriculares)
- Botón guardar cambios
```

Endpoints:
- GET `/docentes/me` - Obtener perfil
- PATCH `/docentes/me` - Actualizar perfil

##### 2. Calendario Mensual (1.5 horas)
**Ruta:** `/docente/calendario`

```tsx
// apps/web/src/app/docente/calendario/page.tsx

Features:
- Vista de calendario mensual (usar date-fns)
- Mostrar clases del docente por día
- Color por ruta curricular
- Click en clase → Ver detalles
- Navegación mes anterior/siguiente
- Vista de lista como alternativa
```

Componentes:
- CalendarioMensual (grid 7x6)
- DiaCell (muestra clases del día)
- ClaseEnCalendario (mini card)

##### 3. Gestión de Observaciones (1 hora)
**Ruta:** `/docente/observaciones`

```tsx
// apps/web/src/app/docente/observaciones/page.tsx

Features:
- Lista de observaciones recientes (últimas 20)
- Filtrar por estudiante
- Filtrar por fecha
- Editar observación
- Ver historial completo por estudiante
```

Endpoints:
- GET `/asistencia/observaciones/me` - Observaciones del docente
- PATCH `/asistencia/:id` - Editar observación

##### 4. Reportes de Asistencia (1 hora)
**Ruta:** `/docente/reportes`

```tsx
// apps/web/src/app/docente/reportes/page.tsx

Features:
- Gráfico de asistencia semanal (Chart.js)
- Tabla de estudiantes frecuentes
- Tabla de estudiantes ausentes
- Promedio de asistencia por ruta
- Exportar a CSV (opcional)
```

Endpoints:
- GET `/asistencia/reportes/docente/:id`

##### 5. Mejorar UI de Asistencia Actual (30 min)
**Ruta:** `/docente/clases/[id]/asistencia`

Mejoras:
- Agregar fotos de estudiantes
- Botón rápido "Marcar todos presentes"
- Contador de cuántos faltan por marcar
- Validación antes de guardar
- Toast de confirmación

#### Archivos a crear/modificar:
```
Frontend (nuevo):
- apps/web/src/app/docente/perfil/page.tsx
- apps/web/src/app/docente/calendario/page.tsx
- apps/web/src/app/docente/observaciones/page.tsx
- apps/web/src/app/docente/reportes/page.tsx
- apps/web/src/components/CalendarioMensual.tsx
- apps/web/src/components/ReporteAsistenciaChart.tsx

Frontend (modificar):
- apps/web/src/app/docente/layout.tsx (agregar links en nav)
- apps/web/src/app/docente/clases/[id]/asistencia/page.tsx

Backend (si necesario):
- apps/api/src/docentes/docentes.controller.ts (+2 endpoints)
- apps/api/src/asistencia/asistencia.controller.ts (+1 endpoint)
```

#### Testing:
```bash
# Test manual:
# 1. Login como docente
# 2. Visitar cada página nueva
# 3. Editar perfil → Verificar guardado
# 4. Ver calendario → Verificar clases por día
# 5. Ver observaciones → Editar una
# 6. Ver reportes → Verificar gráficos
```

#### Criterio de éxito:
- ✅ Docente puede ver y editar su perfil completo
- ✅ Calendario mensual muestra todas sus clases
- ✅ Puede ver y editar todas sus observaciones
- ✅ Reportes muestran métricas útiles con gráficos
- ✅ UX fluida y profesional

---

## 🟠 SLICES DE ALTA PRIORIDAD

---

### SLICE #15: Clases en Vivo con Jitsi Meet
**Prioridad:** 🟠 ALTA
**Tiempo estimado:** 3-4 horas
**Complejidad:** Media
**Bloqueante:** No (pero es diferenciador clave)

#### Descripción:
Integrar Jitsi Meet para que las clases se realicen en vivo dentro de la plataforma.

#### Tareas Backend (1 hora):

##### 1. Generar URLs de Jitsi (30 min)
```typescript
// apps/api/src/clases/clases.service.ts

async generarEnlaceSala(claseId: string): Promise<string> {
  const clase = await this.prisma.clase.findUnique({
    where: { id: claseId },
    include: { rutaCurricular: true, docente: true },
  });

  // Generar nombre único de sala
  const roomName = `mateatletas-${clase.rutaCurricular.nombre}-${claseId}`;

  // URL de Jitsi (puede ser tu instancia o meet.jit.si)
  const jitsiDomain = process.env.JITSI_DOMAIN || 'meet.jit.si';
  const enlace = `https://${jitsiDomain}/${roomName}`;

  // Guardar enlace en BD
  await this.prisma.clase.update({
    where: { id: claseId },
    data: { enlace_sala_virtual: enlace },
  });

  return enlace;
}
```

##### 2. Endpoint para unirse (15 min)
```typescript
@Get(':id/sala')
@UseGuards(JwtAuthGuard)
async getSalaClase(@Param('id') id: string, @Request() req: any) {
  // Verificar que usuario puede acceder (inscrito o docente)
  const clase = await this.clasesService.findOne(id);

  // Generar o recuperar enlace
  let enlace = clase.enlace_sala_virtual;
  if (!enlace) {
    enlace = await this.clasesService.generarEnlaceSala(id);
  }

  return { enlace, nombre_sala: `Clase de ${clase.rutaCurricular.nombre}` };
}
```

##### 3. JWT de Jitsi (15 min - opcional)
Si usas instancia propia de Jitsi:
```typescript
// Generar JWT para autenticar usuario en Jitsi
const jitsiToken = jwt.sign(
  {
    context: {
      user: {
        id: req.user.id,
        name: `${req.user.nombre} ${req.user.apellido}`,
        email: req.user.email,
        avatar: req.user.avatar_url,
      },
    },
    room: roomName,
  },
  process.env.JITSI_SECRET,
  { algorithm: 'HS256', expiresIn: '2h' }
);
```

#### Tareas Frontend (2-3 horas):

##### 1. Componente JitsiMeet (1 hora)
```tsx
// apps/web/src/components/JitsiMeet.tsx

'use client';

import { useEffect, useRef } from 'react';

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  email: string;
  onReady?: () => void;
  onLeave?: () => void;
}

export function JitsiMeet({ roomName, displayName, email, onReady, onLeave }: JitsiMeetProps) {
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!jitsiContainer.current) return;

    // Cargar script de Jitsi
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initJitsi();
    document.body.appendChild(script);

    function initJitsi() {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainer.current,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'raisehand',
            'tileview'
          ],
        },
        userInfo: {
          displayName: displayName,
          email: email,
        },
      };

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      apiRef.current.addEventListener('videoConferenceJoined', () => {
        onReady?.();
      });

      apiRef.current.addEventListener('readyToClose', () => {
        onLeave?.();
      });
    }

    return () => {
      apiRef.current?.dispose();
    };
  }, [roomName]);

  return (
    <div
      ref={jitsiContainer}
      className="w-full h-full min-h-[600px] rounded-lg overflow-hidden"
    />
  );
}
```

##### 2. Página de Sala de Clase (1 hora)
```tsx
// apps/web/src/app/clases/[id]/sala/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JitsiMeet } from '@/components/JitsiMeet';
import { useAuthStore } from '@/store/auth.store';
import { clasesApi } from '@/lib/api/clases.api';

export default function SalaClasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [salaInfo, setSalaInfo] = useState<any>(null);

  useEffect(() => {
    // Obtener info de la sala
    clasesApi.getSala(params.id as string).then(setSalaInfo);
  }, [params.id]);

  const handleLeave = () => {
    router.push('/clases');
  };

  if (!salaInfo) {
    return <div>Cargando sala...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg p-4 mb-4">
          <h1 className="text-2xl font-bold">{salaInfo.nombre_sala}</h1>
        </div>

        <JitsiMeet
          roomName={salaInfo.enlace.split('/').pop()}
          displayName={`${user.nombre} ${user.apellido}`}
          email={user.email}
          onReady={() => console.log('Conectado a la sala')}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}
```

##### 3. Botón "Unirse a Clase" (30 min)
Agregar en:
- `/tutor/clases` - Card de clase
- `/tutor/mis-clases` - Lista de clases reservadas
- `/docente/dashboard` - Próximas clases

```tsx
{clase.estado === 'Programada' && dentroDeHorario(clase) && (
  <Button
    onClick={() => router.push(`/clases/${clase.id}/sala`)}
    variant="primary"
  >
    🎥 Unirse a Clase
  </Button>
)}
```

#### Archivos a crear/modificar:
```
Backend:
- apps/api/src/clases/clases.service.ts
- apps/api/src/clases/clases.controller.ts

Frontend:
- apps/web/src/components/JitsiMeet.tsx (nuevo)
- apps/web/src/app/clases/[id]/sala/page.tsx (nuevo)
- apps/web/src/app/tutor/clases/page.tsx (botón)
- apps/web/src/app/docente/dashboard/page.tsx (botón)
```

#### Testing:
```bash
# Manual:
# 1. Crear clase programada para HOY
# 2. Inscribir estudiante
# 3. Login como docente → Unirse a sala
# 4. Login como tutor → Unirse a sala
# 5. Verificar ambos en la misma sala
# 6. Probar audio/video/chat
```

#### Criterio de éxito:
- ✅ Sala de Jitsi se genera automáticamente
- ✅ Docente y estudiantes pueden unirse
- ✅ Audio y video funcionan correctamente
- ✅ Chat de Jitsi funciona
- ✅ Botón solo aparece en horario de clase

---

### SLICE #16: Estructura de Cursos y Lecciones
**Prioridad:** 🟠 ALTA
**Tiempo estimado:** 6-8 horas
**Complejidad:** Alta
**Bloqueante:** No (pero es core del producto educativo)

#### Descripción:
Implementar la estructura completa de Cursos → Módulos → Lecciones para contenido asincrónico.

#### Tareas Backend (4-5 horas):

##### 1. Schema y Migraciones (1 hora)
```prisma
model Modulo {
  id          String    @id @default(cuid())
  producto_id String
  titulo      String
  orden       Int       // 1, 2, 3...

  // Relaciones
  producto  Producto  @relation(fields: [producto_id], references: [id], onDelete: Cascade)
  lecciones Leccion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("modulos")
  @@index([producto_id, orden])
}

model Leccion {
  id                        String   @id @default(cuid())
  modulo_id                 String
  titulo                    String
  tipo_contenido            String   // Video, Texto, Tarea, Quiz, JuegoInteractivo
  contenido                 String   @db.Text
  orden                     Int
  puntos_por_completar      Int      @default(0)
  logro_desbloqueable_id    String?
  duracion_estimada_minutos Int?
  activo                    Boolean  @default(true)

  // Relaciones
  modulo              Modulo         @relation(fields: [modulo_id], references: [id], onDelete: Cascade)
  logro               Logro?         @relation(fields: [logro_desbloqueable_id], references: [id])
  progresos           ProgresoLeccion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("lecciones")
  @@index([modulo_id, orden])
}

model ProgresoLeccion {
  id            String   @id @default(cuid())
  estudiante_id String
  leccion_id    String
  completada    Boolean  @default(false)
  progreso      Int      @default(0) // 0-100%
  fecha_inicio  DateTime @default(now())
  fecha_completada DateTime?

  // Relaciones
  estudiante Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)
  leccion    Leccion    @relation(fields: [leccion_id], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([estudiante_id, leccion_id])
  @@map("progreso_lecciones")
  @@index([estudiante_id])
}
```

##### 2. CRUD de Módulos y Lecciones (2 horas)
```typescript
// apps/api/src/cursos/cursos.module.ts
// apps/api/src/cursos/cursos.controller.ts
// apps/api/src/cursos/cursos.service.ts

Endpoints:
GET    /productos/:id/modulos
POST   /productos/:id/modulos
PATCH  /modulos/:id
DELETE /modulos/:id

GET    /modulos/:id/lecciones
POST   /modulos/:id/lecciones
PATCH  /lecciones/:id
DELETE /lecciones/:id
GET    /lecciones/:id

POST   /lecciones/:id/completar
GET    /estudiantes/:id/progreso/:productoId
```

##### 3. Lógica de Completar Lección (1 hora)
```typescript
async completarLeccion(leccionId: string, estudianteId: string) {
  // 1. Obtener lección
  const leccion = await this.prisma.leccion.findUnique({
    where: { id: leccionId },
    include: { logro: true },
  });

  // 2. Actualizar progreso
  await this.prisma.progresoLeccion.upsert({
    where: {
      estudiante_id_leccion_id: {
        estudiante_id: estudianteId,
        leccion_id: leccionId,
      },
    },
    update: {
      completada: true,
      progreso: 100,
      fecha_completada: new Date(),
    },
    create: {
      estudiante_id: estudianteId,
      leccion_id: leccionId,
      completada: true,
      progreso: 100,
      fecha_completada: new Date(),
    },
  });

  // 3. Otorgar puntos automáticamente
  if (leccion.puntos_por_completar > 0) {
    await this.gamificacionService.otorgarPuntosAutomatico(
      estudianteId,
      leccion.puntos_por_completar,
      `Completó lección: ${leccion.titulo}`
    );
  }

  // 4. Desbloquear logro si existe
  if (leccion.logro_desbloqueable_id) {
    await this.gamificacionService.desbloquearLogro(
      estudianteId,
      leccion.logro_desbloqueable_id
    );
  }

  return {
    puntos_ganados: leccion.puntos_por_completar,
    logro: leccion.logro,
  };
}
```

##### 4. Seeds de Ejemplo (1 hora)
Crear un curso de ejemplo:
- Curso: "Fundamentos de Álgebra"
- Módulo 1: "Variables y Expresiones" (3 lecciones)
- Módulo 2: "Ecuaciones Lineales" (4 lecciones)
- Módulo 3: "Sistemas de Ecuaciones" (3 lecciones)

#### Tareas Frontend (3-4 horas):

##### 1. Panel Admin - Gestión de Cursos (2 horas)
```tsx
// apps/web/src/app/admin/cursos/page.tsx

Features:
- Lista de productos tipo "Curso"
- Botón "Gestionar Contenido"
- Vista de árbol: Curso → Módulos → Lecciones
- Drag and drop para reordenar
- CRUD inline de módulos y lecciones
- Vista previa de contenido
```

##### 2. Portal Estudiante - Vista de Curso (2 horas)
```tsx
// apps/web/src/app/estudiante/cursos/[id]/page.tsx

Features:
- Sidebar con estructura (módulos colapsables)
- Contenido de lección actual
- Botón "Marcar como completada"
- Progress bar por módulo
- Progress bar general del curso
- Navegación anterior/siguiente
- Tipos de contenido:
  - Video: Embedded player
  - Texto: Markdown renderer
  - Quiz: Componente interactivo
```

#### Archivos a crear:
```
Backend:
- apps/api/src/cursos/cursos.module.ts (nuevo)
- apps/api/src/cursos/cursos.controller.ts (nuevo)
- apps/api/src/cursos/cursos.service.ts (nuevo)
- apps/api/prisma/schema.prisma (+3 modelos)
- apps/api/prisma/seeds/cursos.seed.ts (nuevo)

Frontend:
- apps/web/src/app/admin/cursos/page.tsx (nuevo)
- apps/web/src/app/admin/cursos/[id]/editar/page.tsx (nuevo)
- apps/web/src/app/estudiante/cursos/[id]/page.tsx (nuevo)
- apps/web/src/components/ModuloEditor.tsx (nuevo)
- apps/web/src/components/LeccionViewer.tsx (nuevo)
- apps/web/src/components/MarkdownRenderer.tsx (nuevo)
```

#### Testing:
```bash
# Script de testing
./tests/scripts/test-cursos.sh

# Incluye:
# 1. Admin crea módulo
# 2. Admin crea 3 lecciones
# 3. Estudiante ve curso
# 4. Estudiante completa lección
# 5. Verificar puntos otorgados
# 6. Verificar progreso actualizado
```

#### Criterio de éxito:
- ✅ Admin puede crear estructura completa de curso
- ✅ Admin puede reordenar módulos y lecciones
- ✅ Estudiante ve estructura navegable
- ✅ Completar lección otorga puntos automáticamente
- ✅ Progress bars se actualizan correctamente
- ✅ Todos los tipos de contenido se renderizan

---

## 🟡 SLICES DE MEDIA PRIORIDAD

---

### SLICE #17: Sistema de Alertas Proactivas
**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 8-10 horas
**Complejidad:** Muy Alta
**Bloqueante:** No (feature premium, no MVP)

#### Descripción:
Sistema inteligente que analiza observaciones de docentes con NLP/IA para detectar estudiantes en riesgo y generar alertas para admin.

*[Detalle completo disponible si decides implementar]*

---

### SLICE #18: Chatbot IA Tutor 24/7
**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 10-15 horas
**Complejidad:** Muy Alta
**Bloqueante:** No (diferenciador pero no crítico para MVP)

#### Descripción:
Chatbot educativo con IA (OpenAI/Gemini) para responder dudas de estudiantes 24/7.

*[Detalle completo disponible si decides implementar]*

---

### SLICE #19: Juegos Interactivos
**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 15-20 horas
**Complejidad:** Muy Alta
**Bloqueante:** No (estrategia anti-Matific pero no MVP)

#### Descripción:
Motor de juegos educativos integrado en lecciones con puntuación y feedback.

*[Detalle completo disponible si decides implementar]*

---

## 🟢 SLICES DE BAJA PRIORIDAD

---

### SLICE #20: Sistema de Descuentos
**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 2-3 horas
**Complejidad:** Baja

#### Descripción:
Códigos promocionales y descuentos en checkout.

*[Detalle completo disponible si decides implementar]*

---

### SLICE #21: Sistema de Notificaciones
**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 3-5 horas
**Complejidad:** Media

#### Descripción:
Envío de notificaciones por email y push in-app.

*[Detalle completo disponible si decides implementar]*

---

### SLICE #22: Tickets de Soporte
**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 3-5 horas
**Complejidad:** Media

#### Descripción:
Sistema de tickets para soporte técnico.

*[Detalle completo disponible si decides implementar]*

---

## 📊 Plan de Implementación Recomendado

### 🎯 Sesión 1 (Esta Noche): SLICES CRÍTICOS (8-10 horas)
1. **SLICE #11:** Autenticación Estudiantes (2-3 horas) ✅
2. **SLICE #12:** Gamificación Completa (4-5 horas) ✅
3. **SLICE #13:** Webhook MercadoPago (3-4 horas) ✅

**Resultado:** MVP funcional con pagos reales y gamificación completa

---

### 🎯 Sesión 2: COMPLETAR CRÍTICOS (4-5 horas)
4. **SLICE #14:** Portal Docente Completo (4-5 horas) ✅

**Resultado:** Todos los roles operativos al 100%

---

### 🎯 Sesión 3: ALTA PRIORIDAD (10-12 horas)
5. **SLICE #15:** Jitsi Meet (3-4 horas) ✅
6. **SLICE #16:** Cursos y Lecciones (6-8 horas) ✅

**Resultado:** Plataforma educativa completa con clases en vivo + contenido asincrónico

---

### 🎯 Sesión 4+: DIFERENCIADORES (Opcional)
7. **SLICE #17:** Alertas Proactivas (8-10 horas)
8. **SLICE #18:** Chatbot IA (10-15 horas)
9. **SLICE #19:** Juegos Interactivos (15-20 horas)

**Resultado:** Producto premium diferenciado

---

## ✅ Checklist de Implementación

### Antes de Empezar:
- [ ] Backup de base de datos
- [ ] Crear rama git: `git checkout -b slices-11-to-16`
- [ ] Verificar backend corriendo
- [ ] Verificar frontend corriendo

### Por Cada Slice:
- [ ] Leer descripción completa
- [ ] Crear migración de BD (si aplica)
- [ ] Implementar backend
- [ ] Implementar frontend
- [ ] Testing manual
- [ ] Commit con mensaje descriptivo
- [ ] Actualizar documentación

### Al Finalizar Sesión:
- [ ] Correr tests de integración
- [ ] Push a GitHub
- [ ] Actualizar PROJECT_STATUS.md
- [ ] Marcar slices completados en este documento

---

## 📝 Notas Finales

**Tiempo Total Estimado:**
- Críticos (MVP): 15-18 horas
- Alta Prioridad: 10-12 horas
- **Total para Producto Completo:** ~60-80 horas

**Recomendación:**
Enfócate en los **4 slices críticos primero** (11-14). Eso te da un MVP sólido en 2-3 sesiones intensas. Los demás slices son mejoras que puedes agregar progresivamente.

**Tips de Productividad:**
1. Implementa slices en orden de prioridad
2. Haz commit por cada slice completado
3. Testing incremental (no dejes todo para el final)
4. Si te trabas >30 min, documenta y pasa al siguiente
5. Usa mock data cuando sea necesario para seguir avanzando

---

**Estado:** 📋 LISTO PARA IMPLEMENTAR
**Última actualización:** Octubre 13, 2025
**Next:** Implementar SLICE #11 (Autenticación Estudiantes)

---

🚀 **¡A CODEAR ESTA NOCHE!**
