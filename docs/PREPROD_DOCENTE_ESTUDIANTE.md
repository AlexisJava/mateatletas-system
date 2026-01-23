# Plan Pre-Producción: Portal Docente + Estudiante

> **Estado**: EN PROGRESO
> **Fecha**: 2026-01-20
> **Enfoque**: 100% Portal Docente-Estudiante

---

## BUGS ACTUALES (Prioridad Máxima)

### BUG-001: Asignar Puntos No Funciona

| Campo          | Valor                                               |
| -------------- | --------------------------------------------------- |
| **Severidad**  | 🔴 CRÍTICO                                          |
| **Ubicación**  | Portal Docente → Mis Grupos → Estudiante → Estrella |
| **Causa Raíz** | DTO mismatch entre frontend y backend               |
| **Estado**     | 🔄 EN PROGRESO                                      |

**Problema**:

- Backend retorna: `{ tipo: 'PARTICIPACION', puntos: 5 }`
- Frontend espera: `{ id, nombre, descripcion, puntos, activo }`
- Frontend envía: `{ estudianteId, accionId, contexto }`
- Backend espera: `{ estudianteId, tipoAccion: 'PARTICIPACION', contexto }`

**Archivos a modificar**:

- `apps/web/src/lib/api/gamificacion.api.ts` - Adaptar tipos
- `apps/web/src/components/docente/StudentList.tsx` - Usar `tipoAccion` en lugar de `accionId`
- `packages/contracts/src/schemas/gamificacion.schema.ts` - Actualizar schemas

**Solución**:

1. [ ] Adaptar frontend para usar `tipoAccion` (string) en lugar de `accionId` (UUID)
2. [ ] Mapear respuesta del backend al formato esperado por UI
3. [ ] Verificar en browser

---

### BUG-002: Observaciones No Funciona

| Campo          | Valor                                           |
| -------------- | ----------------------------------------------- |
| **Severidad**  | 🟡 MEDIO                                        |
| **Ubicación**  | Portal Docente → Mis Grupos → Tab Observaciones |
| **Causa Raíz** | Por investigar                                  |
| **Estado**     | ⏳ PENDIENTE                                    |

**Archivos relevantes**:

- `apps/api/src/observaciones/observaciones.controller.ts`
- `apps/api/src/observaciones/observaciones.service.ts`
- `apps/web/src/lib/api/observaciones.api.ts`
- `apps/web/src/components/docente/StudentList.tsx` - Tab Observaciones

**Pasos**:

1. [ ] Verificar que el endpoint `POST /observaciones` funciona (Postman/curl)
2. [ ] Verificar que el frontend envía el payload correcto
3. [ ] Revisar si hay errores en consola del browser
4. [ ] Corregir según hallazgos

---

### BUG-003: Inconsistencia XP Otorgados vs Top Estudiantes

| Campo          | Valor                                                      |
| -------------- | ---------------------------------------------------------- |
| **Severidad**  | 🟡 MEDIO                                                   |
| **Ubicación**  | Portal Docente → Dashboard → Cards de métricas             |
| **Síntoma**    | Muestra "0 XP Otorgados" pero Top Estudiante tiene 3779 XP |
| **Causa Raíz** | Por investigar                                             |
| **Estado**     | ⏳ PENDIENTE                                               |

**Posibles causas**:

- "XP Otorgados" cuenta solo puntos otorgados por el docente actual en la sesión
- "Top Estudiantes" muestra XP total acumulado (de todas las fuentes)
- El cálculo de "XP Otorgados" podría estar mal implementado

**Archivos a revisar**:

- `apps/web/src/components/docente/views/HoyView.tsx` - Donde se muestra la métrica
- `apps/api/src/docentes/services/docente-stats.service.ts` - Cálculo de stats
- Endpoint que retorna stats del docente

**Pasos**:

1. [ ] Identificar de dónde viene el dato "XP Otorgados"
2. [ ] Verificar query SQL/Prisma
3. [ ] Determinar si es bug o comportamiento esperado
4. [ ] Corregir o clarificar el label

---

## AULA VIVA - FUNCIONALIDADES WEBSOCKET

> **Prioridad**: P0 CRÍTICO
> **Estado**: EN PLANIFICACIÓN
> **Dependencias**: Módulo `aula-viva` existente con chat y presencia

### Contexto Actual

El módulo `aula-viva` ya tiene implementado:

- ✅ Chat en tiempo real (`enviar-mensaje`, `nuevo-mensaje`)
- ✅ Sistema de presencia (`unirse-sala`, `salir-sala`, `participante-entro`, `participante-salio`)
- ✅ Toggle de chat por docente (`toggle-chat`, `chat-toggle`)
- ✅ Autenticación JWT vía middleware WebSocket
- ✅ 16 tests pasando

**Archivos existentes**:

```
apps/api/src/aula-viva/
├── aula-viva.module.ts
├── aula-viva.gateway.ts         # 305 líneas - handlers principales
├── aula-viva.controller.ts
├── services/
│   └── presencia.service.ts     # 215 líneas - estado en memoria
├── dto/
│   ├── unirse-sala.dto.ts
│   ├── enviar-mensaje.dto.ts
│   └── toggle-chat.dto.ts
├── interfaces/
│   └── authenticated-socket.interface.ts
├── middleware/
│   └── ws-jwt.middleware.ts
└── __tests__/
    └── presencia.service.spec.ts
```

---

### Mejores Prácticas WebSocket 2025/2026

> Fuentes: [VideoSDK](https://www.videosdk.live/developer-hub/websocket/nest-js-websocket), [NestJS Docs](https://docs.nestjs.com/websockets/gateways), [DEV Community](https://dev.to/jfrancai/demystifying-nestjs-websocket-gateways-a-step-by-step-guide-to-effective-testing-1a1f)

**Arquitectura**:

- Usar `@WebSocketGateway()` con namespace específico (`/aula-viva`)
- Implementar lifecycle hooks: `OnGatewayInit`, `OnGatewayConnection`, `OnGatewayDisconnect`
- `@WebSocketServer()` para acceder a `Server` de Socket.IO
- `@SubscribeMessage()` para handlers de eventos

**Rooms y Broadcasting**:

- `client.join(salaId)` - unirse a room
- `client.to(salaId).emit()` - broadcast excluyendo sender
- `this.server.to(salaId).emit()` - broadcast a todos en room
- Teams can improve scalability by segmenting clients into dynamic rooms – cutting down unnecessary message overhead by up to 30%

**Rate Limiting** (fuente: [NestJS Throttler](https://github.com/nestjs/throttler)):

- Usar `@nestjs/throttler` con custom `WsThrottlerGuard`
- Override `handleRequest` para extraer `client._socket.remoteAddress`
- Para multi-instancia: usar `@nest-lab/throttler-storage-redis`

**Testing** (fuente: [Moldstud](https://moldstud.com/articles/p-effective-strategies-for-testing-websockets-in-nestjs-e2e-insights-and-best-practices)):

- `socket.io-client` como dev dependency
- Testear lifecycle: handshake, message exchange, disconnection
- Usar `supertest-ws` con Jest para reducir flaky tests 30%
- Parallel socket sessions para detectar race conditions

**Escalabilidad**:

- Para multi-servidor: Redis adapter (`socket.io-redis`)
- Redis Pub/Sub para sincronizar mensajes entre instancias

---

### SPRINT 1: Control de Clase

#### 1.1 Levantar la Mano

| Campo           | Valor                                      |
| --------------- | ------------------------------------------ |
| **Prioridad**   | P0 CRÍTICO                                 |
| **Complejidad** | 🟢 FÁCIL                                   |
| **Archivos**    | `manos.service.ts`, `levantar-mano.dto.ts` |

**Eventos**:

| Evento             | Dirección      | Payload                         | Roles      |
| ------------------ | -------------- | ------------------------------- | ---------- |
| `levantar-mano`    | Client→Server  | `{ salaId }`                    | ESTUDIANTE |
| `bajar-mano`       | Client→Server  | `{ salaId }`                    | ESTUDIANTE |
| `mano-levantada`   | Server→Clients | `{ odooId, nombre, timestamp }` | Broadcast  |
| `mano-bajada`      | Server→Clients | `{ odooId }`                    | Broadcast  |
| `dar-palabra`      | Client→Server  | `{ salaId, odooIdEstudiante }`  | DOCENTE    |
| `palabra-otorgada` | Server→Clients | `{ odooId, nombre }`            | Broadcast  |

**Reglas**:

- Solo 1 mano levantada por estudiante a la vez
- Docente ve lista ordenada por timestamp (FIFO)
- Al dar palabra, la mano baja automáticamente

**Implementación**:

```typescript
// manos.service.ts
interface ManoLevantada {
  odooId: string;
  nombre: string;
  salaId: string;
  timestamp: Date;
}

@Injectable()
export class ManosService {
  private manosLevantadas: Map<string, Map<string, ManoLevantada>> = new Map();
  // salaId -> Map<odooId, ManoLevantada>

  levantarMano(salaId: string, odooId: string, nombre: string): ManoLevantada;
  bajarMano(salaId: string, odooId: string): void;
  getManosLevantadas(salaId: string): ManoLevantada[]; // ordenadas por timestamp
  darPalabra(salaId: string, odooId: string): void; // baja mano automáticamente
}
```

**Checklist TDD**:

- [ ] Test: levantar mano agrega a lista
- [ ] Test: solo 1 mano por estudiante
- [ ] Test: bajar mano remueve de lista
- [ ] Test: dar palabra baja mano automáticamente
- [ ] Test: lista ordenada por FIFO
- [ ] Implementar `ManosService`
- [ ] Implementar handlers en gateway
- [ ] Crear DTOs con class-validator

---

#### 1.2 Control de Moderación (Mutear/Expulsar)

| Campo           | Valor                                        |
| --------------- | -------------------------------------------- |
| **Prioridad**   | P0 CRÍTICO                                   |
| **Complejidad** | 🟡 MEDIO                                     |
| **Archivos**    | `moderacion.service.ts`, `moderacion.dto.ts` |

**Eventos Muteo**:

| Evento                    | Dirección      | Payload                              | Roles     |
| ------------------------- | -------------- | ------------------------------------ | --------- |
| `mutear-participante`     | Client→Server  | `{ salaId, odooIdEstudiante, tipo }` | DOCENTE   |
| `desmutear-participante`  | Client→Server  | `{ salaId, odooIdEstudiante, tipo }` | DOCENTE   |
| `participante-muteado`    | Server→Clients | `{ odooId, tipo }`                   | Broadcast |
| `participante-desmuteado` | Server→Clients | `{ odooId, tipo }`                   | Broadcast |
| `mutear-todos`            | Client→Server  | `{ salaId, tipo }`                   | DOCENTE   |
| `todos-muteados`          | Server→Clients | `{ tipo, excepto: odooId[] }`        | Broadcast |

**Eventos Expulsión**:

| Evento                   | Dirección      | Payload                                 | Roles                  |
| ------------------------ | -------------- | --------------------------------------- | ---------------------- |
| `expulsar-participante`  | Client→Server  | `{ salaId, odooIdEstudiante, motivo? }` | DOCENTE                |
| `participante-expulsado` | Server→Client  | `{ motivo }`                            | Solo al expulsado      |
| `alguien-expulsado`      | Server→Clients | `{ odooId, nombre }`                    | Broadcast (sin motivo) |

**Tipos**:

```typescript
type TipoMuteo = 'chat' | 'audio' | 'ambos';
```

**Reglas**:

- Solo DOCENTE puede mutear/expulsar
- El expulsado se desconecta forzosamente con `socket.disconnect()`
- Expulsado no puede volver a unirse a esa sala por 24hs
- `mutear-todos` tiene lista de excepciones (ej: el docente)

**Implementación**:

```typescript
// moderacion.service.ts
interface EstadoModeracion {
  muteados: Map<string, TipoMuteo>; // odooId -> tipo
  expulsados: Map<string, Date>; // odooId -> fechaExpulsion
}

@Injectable()
export class ModeracionService {
  private estadoPorSala: Map<string, EstadoModeracion> = new Map();

  mutear(salaId: string, odooId: string, tipo: TipoMuteo): void;
  desmutear(salaId: string, odooId: string): void;
  mutearTodos(salaId: string, tipo: TipoMuteo, excepto: string[]): void;
  expulsar(salaId: string, odooId: string, motivo?: string): void;
  estaExpulsado(salaId: string, odooId: string): boolean;
  estaMuteado(salaId: string, odooId: string): TipoMuteo | null;
}
```

**Checklist TDD**:

- [ ] Test: mutear agrega a lista muteados
- [ ] Test: desmutear remueve de lista
- [ ] Test: mutear-todos excepto docente
- [ ] Test: expulsar marca como expulsado
- [ ] Test: expulsado no puede unirse 24hs
- [ ] Test: solo DOCENTE puede mutear/expulsar
- [ ] Implementar `ModeracionService`
- [ ] Implementar handlers en gateway
- [ ] Crear DTOs

---

#### 1.3 Indicador "Está Hablando"

| Campo           | Valor                      |
| --------------- | -------------------------- |
| **Prioridad**   | P1 ALTO                    |
| **Complejidad** | 🟢 FÁCIL                   |
| **Archivos**    | Handler directo en gateway |

**Eventos**:

| Evento             | Dirección      | Payload                       | Roles     |
| ------------------ | -------------- | ----------------------------- | --------- |
| `hablando`         | Client→Server  | `{ salaId, activo: boolean }` | Todos     |
| `usuario-hablando` | Server→Clients | `{ odooId, activo }`          | Broadcast |

**Integración**: Se conecta con VAD (Voice Activity Detection) de LiveKit en el frontend.

**Checklist TDD**:

- [ ] Test: evento hablando true se broadcast
- [ ] Test: evento hablando false se broadcast
- [ ] Implementar handler en gateway

---

### SPRINT 2: Interactividad

#### 2.1 Reacciones en Tiempo Real

| Campo           | Valor                                      |
| --------------- | ------------------------------------------ |
| **Prioridad**   | P1 ALTO                                    |
| **Complejidad** | 🟢 FÁCIL                                   |
| **Archivos**    | `reacciones.service.ts`, `reaccion.dto.ts` |

**Eventos**:

| Evento            | Dirección      | Payload                               | Roles     |
| ----------------- | -------------- | ------------------------------------- | --------- |
| `enviar-reaccion` | Client→Server  | `{ salaId, tipo }`                    | Todos     |
| `nueva-reaccion`  | Server→Clients | `{ odooId, nombre, tipo, timestamp }` | Broadcast |

**Tipos de reacción**:

```typescript
type TipoReaccion = '👏' | '❤️' | '😂' | '🤔' | '🎉' | '👍' | '🔥' | '💡';
```

**Reglas**:

- Rate limit: máximo 1 reacción por usuario cada 2 segundos
- Las reacciones flotan y desaparecen (no se persisten en DB)

**Implementación**:

```typescript
// reacciones.service.ts
@Injectable()
export class ReaccionesService {
  private ultimaReaccion: Map<string, Date> = new Map(); // odooId -> timestamp

  puedeReaccionar(odooId: string): boolean; // check rate limit
  registrarReaccion(odooId: string): void;
}
```

**Checklist TDD**:

- [ ] Test: reacción se broadcast a sala
- [ ] Test: rate limit 2 segundos
- [ ] Test: tipos válidos de reacción
- [ ] Implementar `ReaccionesService`
- [ ] Implementar handler con rate limit

---

#### 2.2 "¿Están Siguiendo?" (Pulso de Atención)

| Campo           | Valor                                    |
| --------------- | ---------------------------------------- |
| **Prioridad**   | P1 ALTO                                  |
| **Complejidad** | 🟡 MEDIO                                 |
| **Archivos**    | `atencion.service.ts`, `atencion.dto.ts` |

**Eventos**:

| Evento                | Dirección      | Payload                                      | Roles        |
| --------------------- | -------------- | -------------------------------------------- | ------------ |
| `pedir-atencion`      | Client→Server  | `{ salaId, pregunta? }`                      | DOCENTE      |
| `atencion-solicitada` | Server→Clients | `{ pregunta }`                               | Broadcast    |
| `responder-atencion`  | Client→Server  | `{ salaId, respuesta }`                      | ESTUDIANTE   |
| `atencion-resultado`  | Server→Client  | `{ si, no, masOMenos, total, porcentajeSi }` | Solo DOCENTE |

**Respuestas posibles**: `'si'` | `'no'` | `'mas-o-menos'`

**Implementación**:

```typescript
// atencion.service.ts
interface PulsoAtencion {
  pregunta?: string;
  respuestas: Map<string, 'si' | 'no' | 'mas-o-menos'>; // odooId -> respuesta
  timestamp: Date;
}

@Injectable()
export class AtencionService {
  private pulsoActivo: Map<string, PulsoAtencion> = new Map(); // salaId -> pulso

  iniciarPulso(salaId: string, pregunta?: string): void;
  registrarRespuesta(salaId: string, odooId: string, respuesta: string): void;
  getResultados(salaId: string): { si: number; no: number; masOMenos: number; total: number };
  cerrarPulso(salaId: string): void;
}
```

**Checklist TDD**:

- [ ] Test: solo docente puede iniciar pulso
- [ ] Test: estudiantes pueden responder
- [ ] Test: cada estudiante responde 1 vez
- [ ] Test: resultados calculados correctamente
- [ ] Implementar `AtencionService`
- [ ] Implementar handlers

---

#### 2.3 Selector Aleatorio

| Campo           | Valor                                    |
| --------------- | ---------------------------------------- |
| **Prioridad**   | P2 MEDIO                                 |
| **Complejidad** | 🟢 FÁCIL                                 |
| **Archivos**    | `selector.service.ts`, `selector.dto.ts` |

**Eventos**:

| Evento                  | Dirección      | Payload                              | Roles                |
| ----------------------- | -------------- | ------------------------------------ | -------------------- |
| `seleccionar-aleatorio` | Client→Server  | `{ salaId, excluir?: odooId[] }`     | DOCENTE              |
| `seleccion-animacion`   | Server→Clients | `{ candidatos: {odooId, nombre}[] }` | Broadcast            |
| `seleccion-resultado`   | Server→Clients | `{ odooId, nombre }`                 | Broadcast (delay 2s) |

**Implementación**:

```typescript
// selector.service.ts
@Injectable()
export class SelectorService {
  constructor(private presenciaService: PresenciaService) {}

  seleccionarAleatorio(salaId: string, excluir: string[]): { odooId: string; nombre: string };
  getCandidatos(salaId: string, excluir: string[]): Array<{ odooId: string; nombre: string }>;
}
```

**Checklist TDD**:

- [ ] Test: selección aleatoria de participantes
- [ ] Test: excluir lista funciona
- [ ] Test: solo DOCENTE puede seleccionar
- [ ] Implementar `SelectorService`
- [ ] Implementar handlers con delay para animación

---

### SPRINT 3: Gamificación Live

#### 3.1 Quiz en Vivo

> Inspirado en: [Vevox](https://www.vevox.com/), [AhaSlides](https://ahaslides.com/blog/classroom-polling/), [Kahoot](https://www.classpoint.io/blog/gamified-learning-platforms)

| Campo           | Valor                            |
| --------------- | -------------------------------- |
| **Prioridad**   | P0 CRÍTICO                       |
| **Complejidad** | 🔴 DIFÍCIL                       |
| **Archivos**    | `quiz.service.ts`, `quiz.dto.ts` |

**Eventos**:

| Evento                    | Dirección      | Payload                                                       | Roles                 |
| ------------------------- | -------------- | ------------------------------------------------------------- | --------------------- |
| `lanzar-quiz`             | Client→Server  | `{ salaId, pregunta, opciones[], tiempoSeg, tipo }`           | DOCENTE               |
| `quiz-iniciado`           | Server→Clients | `{ quizId, pregunta, opciones[], tiempoSeg, tipo }`           | Broadcast             |
| `responder-quiz`          | Client→Server  | `{ salaId, quizId, respuesta }`                               | ESTUDIANTE            |
| `quiz-respuesta-recibida` | Server→Client  | `{ recibida: true }`                                          | Solo al que respondió |
| `quiz-progreso`           | Server→Client  | `{ respondieron, total }`                                     | Solo DOCENTE          |
| `cerrar-quiz`             | Client→Server  | `{ salaId, quizId }`                                          | DOCENTE               |
| `quiz-resultados`         | Server→Clients | `{ respuestas: {opcion, cantidad, porcentaje}[], correcta? }` | Broadcast             |

**Tipos de quiz**:

```typescript
type TipoQuiz = 'opcion-multiple' | 'verdadero-falso' | 'respuesta-corta' | 'ordenar';
```

**Implementación**:

```typescript
// quiz.service.ts
interface Quiz {
  id: string;
  salaId: string;
  pregunta: string;
  opciones: string[];
  tipo: TipoQuiz;
  tiempoSeg: number;
  respuestaCorrecta?: string | number;
  respuestas: Map<string, string | number>; // odooId -> respuesta
  iniciadoEn: Date;
  activo: boolean;
}

@Injectable()
export class QuizService {
  private quizzes: Map<string, Quiz> = new Map(); // quizId -> Quiz
  private quizActivoPorSala: Map<string, string> = new Map(); // salaId -> quizId

  crearQuiz(salaId: string, data: CreateQuizDto): Quiz;
  responder(quizId: string, odooId: string, respuesta: string | number): boolean;
  getProgreso(quizId: string): { respondieron: number; total: number };
  cerrarQuiz(quizId: string): QuizResultados;
  getResultados(quizId: string): QuizResultados;
}
```

**Checklist TDD**:

- [ ] Test: crear quiz genera ID único
- [ ] Test: solo 1 quiz activo por sala
- [ ] Test: estudiante responde 1 vez
- [ ] Test: progreso se actualiza en tiempo real
- [ ] Test: cerrar quiz calcula resultados
- [ ] Test: timer auto-cierra quiz
- [ ] Implementar `QuizService`
- [ ] Implementar handlers
- [ ] Crear DTOs con validación

---

#### 3.2 Contador Compartido

| Campo           | Valor                                    |
| --------------- | ---------------------------------------- |
| **Prioridad**   | P1 ALTO                                  |
| **Complejidad** | 🟡 MEDIO                                 |
| **Archivos**    | `contador.service.ts`, `contador.dto.ts` |

**Eventos**:

| Evento               | Dirección      | Payload                                  | Roles     |
| -------------------- | -------------- | ---------------------------------------- | --------- |
| `iniciar-contador`   | Client→Server  | `{ salaId, segundos, mensaje? }`         | DOCENTE   |
| `contador-iniciado`  | Server→Clients | `{ segundos, mensaje, timestampInicio }` | Broadcast |
| `pausar-contador`    | Client→Server  | `{ salaId }`                             | DOCENTE   |
| `contador-pausado`   | Server→Clients | `{ segundosRestantes }`                  | Broadcast |
| `contador-terminado` | Server→Clients | `{}`                                     | Broadcast |

**Implementación**:

```typescript
// contador.service.ts
interface Contador {
  salaId: string;
  segundosTotal: number;
  segundosRestantes: number;
  mensaje?: string;
  timestampInicio: Date;
  pausado: boolean;
  timeoutId?: NodeJS.Timeout;
}

@Injectable()
export class ContadorService {
  private contadores: Map<string, Contador> = new Map(); // salaId -> Contador

  iniciar(salaId: string, segundos: number, mensaje?: string, onTerminado: () => void): Contador;
  pausar(salaId: string): number; // retorna segundos restantes
  reanudar(salaId: string, onTerminado: () => void): void;
  cancelar(salaId: string): void;
  getContador(salaId: string): Contador | undefined;
}
```

**Checklist TDD**:

- [ ] Test: iniciar contador
- [ ] Test: pausar guarda segundos restantes
- [ ] Test: reanudar continúa desde donde pausó
- [ ] Test: terminado emite evento
- [ ] Implementar `ContadorService`
- [ ] Implementar handlers

---

#### 3.3 Ranking en Vivo

| Campo           | Valor                                  |
| --------------- | -------------------------------------- |
| **Prioridad**   | P1 ALTO                                |
| **Complejidad** | 🟡 MEDIO                               |
| **Archivos**    | `ranking.service.ts`, `ranking.dto.ts` |

**Eventos**:

| Evento                | Dirección      | Payload                                                 | Roles          |
| --------------------- | -------------- | ------------------------------------------------------- | -------------- |
| `actualizar-puntos`   | Client→Server  | `{ salaId, odooIdEstudiante, puntos, motivo }`          | DOCENTE        |
| `puntos-actualizados` | Server→Clients | `{ odooId, nombre, puntosSesion, puntosTotal, motivo }` | Broadcast      |
| `solicitar-ranking`   | Client→Server  | `{ salaId }`                                            | Todos          |
| `ranking-actual`      | Server→Client  | `{ ranking: {odooId, nombre, puntos}[] }`               | Al solicitante |

**Implementación**:

```typescript
// ranking.service.ts
interface PuntosSesion {
  odooId: string;
  nombre: string;
  puntos: number;
}

@Injectable()
export class RankingService {
  private puntosPorSala: Map<string, Map<string, PuntosSesion>> = new Map();

  agregarPuntos(salaId: string, odooId: string, nombre: string, puntos: number): PuntosSesion;
  getRanking(salaId: string): PuntosSesion[]; // ordenado desc
  getPuntos(salaId: string, odooId: string): number;
}
```

**Checklist TDD**:

- [ ] Test: agregar puntos acumula
- [ ] Test: ranking ordenado descendente
- [ ] Test: solo docente puede dar puntos
- [ ] Implementar `RankingService`
- [ ] Implementar handlers

---

#### 3.4 XP y Logros en Vivo (Gamificación)

| Campo           | Valor                          |
| --------------- | ------------------------------ |
| **Prioridad**   | P0 CRÍTICO                     |
| **Complejidad** | 🔴 DIFÍCIL                     |
| **Archivos**    | `gamificacion-live.service.ts` |

**Eventos**:

| Evento               | Dirección      | Payload                                          | Roles              |
| -------------------- | -------------- | ------------------------------------------------ | ------------------ |
| `otorgar-xp`         | Client→Server  | `{ salaId, odooIdEstudiante, cantidad, motivo }` | DOCENTE            |
| `xp-ganado`          | Server→Clients | `{ odooId, nombre, cantidad, motivo, xpTotal }`  | Broadcast          |
| `logro-desbloqueado` | Server→Clients | `{ odooId, nombre, logro: {id, titulo, icono} }` | Broadcast          |
| `racha-actualizada`  | Server→Client  | `{ racha, esNuevoRecord }`                       | Solo al estudiante |

**Integración con sistema existente**:

- Usa `RecursosService.agregarXP()` para persistir
- Usa `LogrosService` para verificar desbloqueos
- Emite eventos WebSocket en tiempo real

**Implementación**:

```typescript
// gamificacion-live.service.ts
@Injectable()
export class GamificacionLiveService {
  constructor(
    private recursosService: RecursosService,
    private logrosService: LogrosService,
    private server: Server, // inyectado desde gateway
  ) {}

  async otorgarXP(
    salaId: string,
    odooIdEstudiante: string,
    cantidad: number,
    motivo: string,
    docenteId: string,
  ): Promise<{ xpTotal: number; logrosDesbloqueados: Logro[] }>;
}
```

**Checklist TDD**:

- [x] Test: XP se persiste en DB
- [x] Test: evento XP se broadcast (20 E2E tests Sprint 3.3-3.5)
- [x] Test: logro desbloqueado se notifica
- [x] Test: racha se actualiza
- [x] Implementar `GamificacionLiveService` (GamificacionRealtimeService)
- [x] Implementar handlers (GamificacionRealtimeListener)

---

#### 3.5 Puntos de Casa en Vivo

| Campo           | Valor                             |
| --------------- | --------------------------------- |
| **Prioridad**   | P2 MEDIO                          |
| **Complejidad** | 🟡 MEDIO                          |
| **Archivos**    | Extensión de `ranking.service.ts` |

**Eventos**:

| Evento                     | Dirección      | Payload                                       | Roles          |
| -------------------------- | -------------- | --------------------------------------------- | -------------- |
| `puntos-casa`              | Client→Server  | `{ salaId, casa, puntos, motivo }`            | DOCENTE        |
| `casa-puntos-actualizados` | Server→Clients | `{ casa, puntosNuevos, puntosTotal, motivo }` | Broadcast      |
| `solicitar-ranking-casas`  | Client→Server  | `{ salaId }`                                  | Todos          |
| `ranking-casas`            | Server→Client  | `{ ranking: {casa, puntos}[] }`               | Al solicitante |

**Casas**: `QUANTUM` (cyan), `VERTEX` (magenta), `PULSAR` (amber)

**Checklist TDD**:

- [ ] Test: puntos por casa se acumulan
- [ ] Test: ranking de casas ordenado
- [ ] Implementar handlers

---

### Sprint 4: Contenido Sincronizado y Analytics

#### 4.1 Compartir Teoría (Contenido Sincronizado)

| Campo           | Valor                    |
| --------------- | ------------------------ |
| **Prioridad**   | P0 CRÍTICO               |
| **Complejidad** | 🔴 DIFÍCIL               |
| **Archivos**    | `teoria-sync.service.ts` |

**Propósito:** Docente comparte contenido teórico y todos ven lo mismo en tiempo real

**Eventos**:

| Evento                | Dirección      | Payload                                | Roles     |
| --------------------- | -------------- | -------------------------------------- | --------- |
| `compartir-teoria`    | Client→Server  | `{ salaId, contenidoId, titulo }`      | DOCENTE   |
| `teoria-compartida`   | Server→Clients | `{ contenidoId, titulo, tipo, datos }` | Broadcast |
| `cambiar-slide`       | Client→Server  | `{ salaId, slideIndex }`               | DOCENTE   |
| `slide-cambiado`      | Server→Clients | `{ slideIndex }`                       | Broadcast |
| `scroll-teoria`       | Client→Server  | `{ salaId, scrollPosition }`           | DOCENTE   |
| `scroll-sincronizado` | Server→Clients | `{ scrollPosition }`                   | Broadcast |
| `cerrar-teoria`       | Client→Server  | `{ salaId }`                           | DOCENTE   |
| `teoria-cerrada`      | Server→Clients | `{}`                                   | Broadcast |

**Tipos de contenido teórico**:

```typescript
type TipoTeoria = 'slides' | 'video' | 'documento' | 'interactivo' | 'pizarra';

interface ContenidoTeoria {
  id: string;
  tipo: TipoTeoria;
  titulo: string;
  datos: SlideData[] | VideoData | DocumentoData | InteractivoData | PizarraData;
}

interface SlideData {
  index: number;
  contenido: string; // markdown o HTML
  imagenUrl?: string;
  notas?: string; // solo visible para docente
}

interface VideoData {
  url: string;
  duracionSeg: number;
  timestampActual?: number;
}
```

**Reglas de negocio**:

- Solo un contenido teórico activo a la vez
- Scroll/slide sincronizado opcional (docente puede activar/desactivar)
- Estudiantes pueden tener "vista libre" si docente lo permite
- El contenido se carga desde el sistema de planificaciones

**Checklist TDD**:

- [ ] Test: compartir teoría inicia sincronización
- [ ] Test: cambio de slide se broadcast
- [ ] Test: scroll se sincroniza con throttle
- [ ] Test: cerrar teoría limpia estado
- [ ] Implementar `TeoriaSyncService`
- [ ] Implementar handlers en gateway

---

#### 4.2 Práctica en Vivo (Ejercicios Sincronizados)

| Campo           | Valor                      |
| --------------- | -------------------------- |
| **Prioridad**   | P0 CRÍTICO                 |
| **Complejidad** | 🔴 MUY DIFÍCIL             |
| **Archivos**    | `practica-live.service.ts` |

**Propósito:** Docente habilita ejercicios y ve progreso en tiempo real

**Eventos**:

| Evento                   | Dirección      | Payload                                                 | Roles              |
| ------------------------ | -------------- | ------------------------------------------------------- | ------------------ |
| `habilitar-practica`     | Client→Server  | `{ salaId, practicaId, tiempoLimiteSeg? }`              | DOCENTE            |
| `practica-habilitada`    | Server→Clients | `{ practicaId, titulo, preguntas[], tiempoLimiteSeg? }` | Broadcast          |
| `responder-pregunta`     | Client→Server  | `{ salaId, practicaId, preguntaIndex, respuesta }`      | ESTUDIANTE         |
| `respuesta-registrada`   | Server→Client  | `{ correcta, feedback?, puntosGanados }`                | Solo al estudiante |
| `progreso-estudiante`    | Server→Client  | `{ odooId, preguntaActual, correctas, tiempo }`         | Solo DOCENTE       |
| `estudiante-completo`    | Server→Client  | `{ odooId, nombre, puntaje, tiempo, ranking }`          | Solo DOCENTE       |
| `pausar-practica`        | Client→Server  | `{ salaId, practicaId }`                                | DOCENTE            |
| `practica-pausada`       | Server→Clients | `{ tiempoRestante }`                                    | Broadcast          |
| `reanudar-practica`      | Client→Server  | `{ salaId, practicaId }`                                | DOCENTE            |
| `practica-reanudada`     | Server→Clients | `{}`                                                    | Broadcast          |
| `cerrar-practica`        | Client→Server  | `{ salaId, practicaId, mostrarResultados }`             | DOCENTE            |
| `practica-cerrada`       | Server→Clients | `{ resultadosGrupo?: ResultadoGrupo }`                  | Broadcast          |
| `ver-detalle-estudiante` | Client→Server  | `{ salaId, odooIdEstudiante, practicaId }`              | DOCENTE            |
| `detalle-estudiante`     | Server→Client  | `{ respuestas[], tiempos[], intentos[] }`               | Solo DOCENTE       |

**Estructura de práctica**:

```typescript
interface Practica {
  id: string;
  titulo: string;
  preguntas: Pregunta[];
  tiempoLimiteSeg?: number; // null = sin límite
  mostrarFeedbackInmediato: boolean;
  permitirReintentos: boolean;
  maxReintentos?: number;
}

interface Pregunta {
  index: number;
  tipo: 'opcion-multiple' | 'verdadero-falso' | 'respuesta-corta' | 'ordenar' | 'completar';
  enunciado: string;
  opciones?: string[];
  respuestaCorrecta: string | string[];
  puntaje: number;
  pista?: string;
}

interface RespuestaEstudiante {
  odooId: string;
  practicaId: string;
  preguntaIndex: number;
  respuesta: string | string[];
  correcta: boolean;
  tiempoSeg: number;
  intentos: number;
  timestamp: Date;
}

interface ResultadoGrupo {
  promedioCorrectas: number;
  tiempoPromedio: number;
  preguntaMasFallada: number;
  ranking: { odooId: string; nombre: string; puntaje: number; tiempo: number }[];
}
```

**Vista docente en tiempo real (Dashboard de práctica)**:

```typescript
interface DashboardPractica {
  practicaId: string;
  estudiantesTotal: number;
  estudiantesActivos: number;
  completaron: number;
  progreso: {
    odooId: string;
    nombre: string;
    estado: 'resolviendo' | 'completado' | 'trabado' | 'inactivo';
    preguntaActual: number;
    correctas: number;
    tiempoTranscurrido: number;
    ultimaActividad: Date;
  }[];
}
```

**Reglas de negocio**:

- Solo una práctica activa a la vez por sala
- El docente ve progreso en tiempo real de TODOS los estudiantes
- Feedback inmediato configurable
- Reintentos configurables por práctica
- Las prácticas vienen del sistema de planificaciones

**Checklist TDD**:

- [ ] Test: habilitar práctica crea sesión
- [ ] Test: respuesta se registra y evalúa
- [ ] Test: progreso se envía solo al docente
- [ ] Test: pausar/reanudar funciona con timer
- [ ] Test: cerrar práctica calcula resultados
- [ ] Test: detalle estudiante muestra historial
- [ ] Implementar `PracticaLiveService`
- [ ] Implementar handlers en gateway

---

#### 4.3 Analytics en Vivo

| Campo           | Valor                       |
| --------------- | --------------------------- |
| **Prioridad**   | P1 ALTO                     |
| **Complejidad** | 🟡 MEDIO                    |
| **Archivos**    | `analytics-live.service.ts` |

**Propósito:** Docente ve métricas de la clase en tiempo real

**Eventos**:

| Evento                | Dirección     | Payload        | Roles        |
| --------------------- | ------------- | -------------- | ------------ |
| `solicitar-analytics` | Client→Server | `{ salaId }`   | DOCENTE      |
| `analytics-clase`     | Server→Client | `{ metricas }` | Solo DOCENTE |

**Métricas disponibles**:

```typescript
interface AnalyticsClase {
  asistencia: {
    presentes: number;
    ausentes: number; // basado en inscripción
    llegaronTarde: number;
    seRetiraron: number;
  };
  participacion: {
    mensajesChat: number;
    manosLevantadas: number;
    reacciones: number;
    participantesMasActivos: { odooId: string; nombre: string; acciones: number }[];
  };
  practicas: {
    completadas: number;
    promedioCorrectas: number;
    tiempoPromedio: number;
    estudiantesTrabados: { odooId: string; nombre: string; enPregunta: number }[];
  };
  atencion: {
    ultimoPulso: { si: number; no: number; masOMenos: number };
    tendencia: 'subiendo' | 'estable' | 'bajando';
  };
  tiempoClase: {
    duracionMinutos: number;
    tiempoTeoria: number;
    tiempoPractica: number;
    tiempoInteraccion: number;
  };
}
```

**Integración**:

- Consume datos de todos los otros servicios (presencia, manos, reacciones, práctica, atención)
- Se puede solicitar en cualquier momento
- Auto-update cada 30 segundos si está activo

**Checklist TDD**:

- [ ] Test: analytics agrega datos de múltiples fuentes
- [ ] Test: métricas de asistencia correctas
- [ ] Test: participación cuenta acciones
- [ ] Test: tendencia de atención se calcula
- [ ] Implementar `AnalyticsLiveService`
- [ ] Implementar handler en gateway

---

**NOTA IMPORTANTE**: Las funcionalidades de Compartir Teoría y Práctica en Vivo requieren integración con el sistema de **Planificaciones** del backend. Esto se documentará en `PLAN_CONSOLIDADO_PREPROD.md` una vez completado el MVP de Aula Viva.

---

## Estructura de Archivos Final

```
apps/api/src/aula-viva/
├── aula-viva.module.ts
├── aula-viva.gateway.ts (existente - agregar handlers)
├── aula-viva.controller.ts
├── services/
│   ├── presencia.service.ts (existente)
│   ├── manos.service.ts (NUEVO)
│   ├── reacciones.service.ts (NUEVO)
│   ├── moderacion.service.ts (NUEVO)
│   ├── quiz.service.ts (NUEVO)
│   ├── contador.service.ts (NUEVO)
│   ├── ranking.service.ts (NUEVO)
│   ├── atencion.service.ts (NUEVO)
│   ├── selector.service.ts (NUEVO)
│   ├── gamificacion-live.service.ts (NUEVO)
│   ├── teoria-sync.service.ts (NUEVO - Sprint 4)
│   ├── practica-live.service.ts (NUEVO - Sprint 4)
│   └── analytics-live.service.ts (NUEVO - Sprint 4)
├── dto/
│   ├── index.ts (existente - agregar exports)
│   ├── unirse-sala.dto.ts (existente)
│   ├── enviar-mensaje.dto.ts (existente)
│   ├── toggle-chat.dto.ts (existente)
│   ├── levantar-mano.dto.ts (NUEVO)
│   ├── reaccion.dto.ts (NUEVO)
│   ├── moderacion.dto.ts (NUEVO)
│   ├── quiz.dto.ts (NUEVO)
│   ├── contador.dto.ts (NUEVO)
│   ├── ranking.dto.ts (NUEVO)
│   ├── atencion.dto.ts (NUEVO)
│   ├── selector.dto.ts (NUEVO)
│   ├── teoria.dto.ts (NUEVO - Sprint 4)
│   ├── practica.dto.ts (NUEVO - Sprint 4)
│   └── analytics.dto.ts (NUEVO - Sprint 4)
├── interfaces/
│   ├── index.ts (existente)
│   ├── authenticated-socket.interface.ts (existente)
│   └── websocket-events.interface.ts (NUEVO - todos los tipos)
├── middleware/
│   └── ws-jwt.middleware.ts (existente)
└── __tests__/
    ├── presencia.service.spec.ts (existente)
    ├── manos.service.spec.ts (NUEVO)
    ├── reacciones.service.spec.ts (NUEVO)
    ├── moderacion.service.spec.ts (NUEVO)
    ├── quiz.service.spec.ts (NUEVO)
    ├── contador.service.spec.ts (NUEVO)
    ├── ranking.service.spec.ts (NUEVO)
    ├── atencion.service.spec.ts (NUEVO)
    ├── selector.service.spec.ts (NUEVO)
    ├── teoria-sync.service.spec.ts (NUEVO - Sprint 4)
    ├── practica-live.service.spec.ts (NUEVO - Sprint 4)
    ├── analytics-live.service.spec.ts (NUEVO - Sprint 4)
    └── aula-viva.e2e.spec.ts (NUEVO)
```

---

## UX/UI FRONTEND - Clase en Vivo

> **CRÍTICO**: Cada feature WebSocket afecta AMBOS portales. El docente **controla**, el estudiante **participa**.

### Estado Actual del Frontend

**Archivos existentes**:

```
apps/web/src/
├── app/
│   ├── docente/clase-en-vivo/page.tsx    # Página docente (LiveKit + WebSocket)
│   └── estudiante/clase-en-vivo/page.tsx # Página estudiante (viewer mode)
├── components/docente/live/
│   ├── ClassRoom.tsx        # Layout principal (261 líneas)
│   ├── ControlBar.tsx       # Barra de controles (251 líneas)
│   ├── ChatPanel.tsx        # Panel de chat
│   ├── ParticipantsList.tsx # Lista de participantes
│   ├── PreClassView.tsx     # Vista pre-clase
│   └── types.ts             # Tipos compartidos
├── hooks/
│   └── useAulaVivaChat.ts   # Hook WebSocket chat (347 líneas)
└── lib/api/
    └── aula-viva.api.ts     # API client
```

**Ya implementado en frontend**:

- ✅ Video/Audio con LiveKit (`LiveKitRoom`, `useTracks`)
- ✅ Chat en tiempo real (WebSocket)
- ✅ Levantar mano (básico, via LiveKit Data Channel)
- ✅ Indicador "En Vivo" + Timer
- ✅ Contador de participantes
- ✅ Toggle chat (docente)
- ✅ Mode student/teacher en `ControlBar`

---

### Componentes a Crear/Modificar por Feature

#### Sprint 1: Control de Clase

##### 1.1 Levantar la Mano - UI

**Portal Estudiante** (`ControlBar.tsx` mode='student'):

```tsx
// Estado actual: botón Hand que envía via LiveKit DataChannel
// MODIFICAR: usar WebSocket en lugar de DataChannel para mejor tracking

<button onClick={handleRaiseHand} className={handRaised ? 'bg-amber-500 animate-pulse' : ''}>
  <Hand className={handRaised ? 'animate-bounce' : ''} />
  {handRaised ? '¡Mano levantada!' : 'Levantar mano'}
</button>
```

**Portal Docente** (`ClassRoom.tsx`):

```tsx
// CREAR: HandRaisedQueue component
// Ubicación: Sidebar izquierdo, debajo de ParticipantsList

<HandRaisedQueue
  manos={manosLevantadas} // Array ordenado FIFO
  onDarPalabra={(odooId) => {}} // Callback cuando docente da palabra
  onBajarMano={(odooId) => {}} // Forzar bajar mano
/>
```

**Nuevo componente** `HandRaisedQueue.tsx`:

```tsx
interface HandRaisedQueueProps {
  manos: Array<{ odooId: string; nombre: string; timestamp: Date }>;
  onDarPalabra: (odooId: string) => void;
  onBajarMano: (odooId: string) => void;
}

export const HandRaisedQueue: React.FC<HandRaisedQueueProps> = ({
  manos,
  onDarPalabra,
  onBajarMano,
}) => (
  <div className="bg-slate-900/50 rounded-xl p-4 border border-amber-500/30">
    <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-3">
      <Hand size={18} /> Manos Levantadas ({manos.length})
    </h3>
    {manos.map((mano, idx) => (
      <div
        key={mano.odooId}
        className="flex items-center justify-between py-2 border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">#{idx + 1}</span>
          <span className="text-white">{mano.nombre}</span>
          <span className="text-slate-500 text-xs">{formatTimeAgo(mano.timestamp)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDarPalabra(mano.odooId)}
            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm"
          >
            Dar palabra
          </button>
          <button
            onClick={() => onBajarMano(mano.odooId)}
            className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-sm"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    ))}
    {manos.length === 0 && (
      <p className="text-slate-500 text-sm text-center py-4">Nadie ha levantado la mano</p>
    )}
  </div>
);
```

##### 1.2 Control de Moderación - UI

**Portal Docente** (`ParticipantsList.tsx`):

```tsx
// MODIFICAR: Agregar menú contextual por participante

<ParticipantCard
  participante={p}
  onMutear={(tipo) => mutearParticipante(p.odooId, tipo)}
  onDesmutear={() => desmutearParticipante(p.odooId)}
  onExpulsar={() => setExpulsarModal(p)}
  estaMuteado={muteados.has(p.odooId)}
/>;

// Estado visual del participante
{
  estaMuteado && <MicOff className="text-red-400" size={14} />;
}
{
  tienePalabra && <Volume2 className="text-emerald-400 animate-pulse" size={14} />;
}
```

**Nuevo componente** `ModerationControls.tsx`:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <MoreVertical size={16} />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => onMutear('chat')}>
      <MessageSquareOff size={14} /> Silenciar chat
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onMutear('audio')}>
      <MicOff size={14} /> Silenciar audio
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onMutear('ambos')}>
      <VolumeX size={14} /> Silenciar todo
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onExpulsar} className="text-red-400">
      <UserX size={14} /> Expulsar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Portal Estudiante** - Estado cuando es muteado:

```tsx
// MOSTRAR: Banner cuando el estudiante es muteado
{
  estaMuteado && (
    <div className="fixed top-0 left-0 right-0 bg-red-500/20 border-b border-red-500/50 p-2 text-center z-50">
      <span className="text-red-400 text-sm flex items-center justify-center gap-2">
        <MicOff size={14} /> El docente ha silenciado tu {tipoMuteo}
      </span>
    </div>
  );
}
```

##### 1.3 Indicador "Está Hablando" - UI

**Ambos portales** (`ParticipantsList.tsx` y `ClassRoom.tsx`):

```tsx
// AGREGAR: Indicador visual cuando alguien habla

<div className={`relative ${estaHablando ? 'ring-2 ring-emerald-500' : ''}`}>
  <Avatar src={p.avatar} alt={p.nombre} />
  {estaHablando && (
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
      <Volume2 size={10} className="text-white animate-pulse" />
    </div>
  )}
</div>
```

---

#### Sprint 2: Interactividad

##### 2.1 Reacciones en Tiempo Real - UI

**Ambos portales** - Nuevo componente `ReactionsOverlay.tsx`:

```tsx
// Reacciones flotantes que aparecen y desaparecen
// Posición: Overlay sobre el video principal

interface Reaccion {
  id: string;
  tipo: '👏' | '❤️' | '😂' | '🤔' | '🎉' | '👍' | '🔥' | '💡';
  nombre: string;
  timestamp: number;
}

export const ReactionsOverlay: React.FC<{ reacciones: Reaccion[] }> = ({ reacciones }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {reacciones.map((r) => (
      <motion.div
        key={r.id}
        initial={{ y: '100%', x: `${Math.random() * 80 + 10}%`, opacity: 1 }}
        animate={{ y: '-100%', opacity: 0 }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute text-4xl"
      >
        {r.tipo}
      </motion.div>
    ))}
  </div>
);
```

**Portal Estudiante** - Barra de reacciones rápidas:

```tsx
// AGREGAR: en ControlBar.tsx (mode='student')

<div className="flex gap-1 bg-slate-800/80 rounded-xl p-1">
  {['👏', '❤️', '😂', '🤔', '🎉', '👍', '🔥', '💡'].map((emoji) => (
    <button
      key={emoji}
      onClick={() => enviarReaccion(emoji)}
      disabled={cooldown > 0}
      className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
    >
      {emoji}
    </button>
  ))}
</div>;
{
  cooldown > 0 && <span className="text-xs text-slate-500">{cooldown}s</span>;
}
```

##### 2.2 Pulso de Atención - UI

**Portal Docente** - Botón para iniciar:

```tsx
// AGREGAR: en ClassRoom.tsx toolbar

<button onClick={() => setPulsoModal(true)} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
  <HelpCircle size={18} /> ¿Están siguiendo?
</button>

// Modal para personalizar pregunta
<PulsoAtencionModal
  open={pulsoModal}
  onClose={() => setPulsoModal(false)}
  onEnviar={(pregunta) => iniciarPulso(pregunta)}
/>
```

**Portal Estudiante** - Modal de respuesta:

```tsx
// CREAR: PulsoRespuestaModal.tsx
// Aparece cuando docente inicia pulso

<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
>
  <div className="bg-slate-900 rounded-2xl p-8 max-w-md text-center border border-indigo-500/30">
    <h2 className="text-2xl font-bold text-white mb-2">¿Están siguiendo?</h2>
    {pregunta && <p className="text-slate-400 mb-6">{pregunta}</p>}
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => responder('si')}
        className="px-6 py-4 bg-emerald-500/20 text-emerald-400 rounded-xl text-xl"
      >
        ✅ Sí
      </button>
      <button
        onClick={() => responder('mas-o-menos')}
        className="px-6 py-4 bg-amber-500/20 text-amber-400 rounded-xl text-xl"
      >
        🤔 Más o menos
      </button>
      <button
        onClick={() => responder('no')}
        className="px-6 py-4 bg-red-500/20 text-red-400 rounded-xl text-xl"
      >
        ❌ No
      </button>
    </div>
  </div>
</motion.div>
```

**Portal Docente** - Visualización de resultados:

```tsx
// CREAR: PulsoResultados.tsx (muestra en tiempo real)

<div className="bg-slate-900 rounded-xl p-4 border border-indigo-500/30">
  <h3 className="text-indigo-400 font-bold mb-4">Resultados en vivo</h3>
  <div className="space-y-3">
    <ProgressBar label="Sí ✅" value={resultado.si} total={resultado.total} color="emerald" />
    <ProgressBar
      label="Más o menos 🤔"
      value={resultado.masOMenos}
      total={resultado.total}
      color="amber"
    />
    <ProgressBar label="No ❌" value={resultado.no} total={resultado.total} color="red" />
  </div>
  <p className="text-slate-500 text-sm mt-4">{resultado.total} respuestas</p>
</div>
```

##### 2.3 Selector Aleatorio - UI

**Portal Docente** - Botón y animación:

```tsx
// AGREGAR: en toolbar

<button
  onClick={seleccionarAleatorio}
  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl"
>
  <Shuffle size={18} /> Elegir al azar
</button>
```

**Ambos portales** - Animación de ruleta:

```tsx
// CREAR: SelectorAnimacion.tsx
// Muestra nombres girando antes de selección final

<motion.div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
  <div className="text-center">
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="text-6xl mb-8"
    >
      🎲
    </motion.div>
    <motion.div
      key={candidatoActual.odooId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold text-white"
    >
      {candidatoActual.nombre}
    </motion.div>
    {seleccionFinal && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mt-8 text-2xl text-emerald-400"
      >
        🎉 ¡Seleccionado!
      </motion.div>
    )}
  </div>
</motion.div>
```

---

#### Sprint 3: Gamificación Live

##### 3.1 Quiz en Vivo - UI

**Portal Docente** - Creador de quiz:

```tsx
// CREAR: QuizCreator.tsx

<Dialog open={quizModal}>
  <DialogContent className="bg-slate-900 border-indigo-500/30 max-w-2xl">
    <DialogTitle>Crear Quiz Rápido</DialogTitle>
    <form onSubmit={lanzarQuiz}>
      <input placeholder="Pregunta..." className="w-full bg-slate-800 rounded-xl p-4 mb-4" />

      <div className="flex gap-2 mb-4">
        {['opcion-multiple', 'verdadero-falso', 'respuesta-corta'].map((tipo) => (
          <button
            type="button"
            onClick={() => setTipoQuiz(tipo)}
            className={tipoQuiz === tipo ? 'bg-indigo-500' : 'bg-slate-800'}
          >
            {tipo}
          </button>
        ))}
      </div>

      {tipoQuiz === 'opcion-multiple' && (
        <div className="space-y-2">
          {opciones.map((op, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={`Opción ${i + 1}`}
                value={op}
                onChange={(e) => updateOpcion(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => setCorrecta(i)}
                className={correcta === i ? 'bg-emerald-500' : 'bg-slate-700'}
              >
                ✓
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <select value={tiempoSeg} onChange={(e) => setTiempoSeg(e.target.value)}>
          <option value={15}>15 seg</option>
          <option value={30}>30 seg</option>
          <option value={60}>60 seg</option>
        </select>
        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
          🚀 Lanzar Quiz
        </button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

**Portal Estudiante** - Vista de quiz:

```tsx
// CREAR: QuizStudent.tsx

<motion.div
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
>
  <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full mx-4 border-2 border-indigo-500">
    {/* Timer circular */}
    <div className="absolute top-4 right-4">
      <CircularProgress value={(tiempoRestante / tiempoTotal) * 100} size={60}>
        <span className="text-2xl font-bold">{tiempoRestante}</span>
      </CircularProgress>
    </div>

    <h2 className="text-3xl font-bold text-white mb-8">{quiz.pregunta}</h2>

    <div className="grid grid-cols-2 gap-4">
      {quiz.opciones.map((opcion, i) => (
        <button
          key={i}
          onClick={() => responderQuiz(i)}
          disabled={yaRespondio}
          className={`p-6 rounded-2xl text-xl font-bold transition-all ${
            yaRespondio && seleccion === i
              ? 'bg-indigo-600 text-white scale-105'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          {opcion}
        </button>
      ))}
    </div>

    {yaRespondio && (
      <p className="text-center text-emerald-400 mt-6">
        ✓ Respuesta enviada - esperando resultados...
      </p>
    )}
  </div>
</motion.div>
```

**Ambos portales** - Resultados del quiz:

```tsx
// CREAR: QuizResultados.tsx

<div className="space-y-4">
  {resultados.respuestas.map((r, i) => (
    <div key={i} className="relative">
      <div className="flex justify-between mb-1">
        <span className={correcta === i ? 'text-emerald-400' : 'text-white'}>
          {correcta === i && '✓ '}
          {quiz.opciones[i]}
        </span>
        <span className="text-slate-400">{r.porcentaje}%</span>
      </div>
      <div className="h-8 bg-slate-800 rounded-lg overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${r.porcentaje}%` }}
          className={`h-full ${correcta === i ? 'bg-emerald-500' : 'bg-indigo-500'}`}
        />
      </div>
      <span className="text-xs text-slate-500">{r.cantidad} respuestas</span>
    </div>
  ))}
</div>
```

##### 3.2 Contador Compartido - UI

**Ambos portales** - Componente contador:

```tsx
// CREAR: ContadorCompartido.tsx

<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none"
>
  <div className="text-center">
    {mensaje && <p className="text-2xl text-white mb-4">{mensaje}</p>}
    <motion.div
      key={segundosRestantes}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-[200px] font-bold text-white tabular-nums"
    >
      {formatTime(segundosRestantes)}
    </motion.div>
    {isDocente && (
      <div className="flex gap-4 justify-center mt-8 pointer-events-auto">
        <button onClick={pausar} className="px-6 py-3 bg-amber-500/20 text-amber-400 rounded-xl">
          {pausado ? <Play /> : <Pause />} {pausado ? 'Reanudar' : 'Pausar'}
        </button>
        <button onClick={cancelar} className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl">
          <X /> Cancelar
        </button>
      </div>
    )}
  </div>
</motion.div>
```

##### 3.3 Ranking en Vivo - UI

**Ambos portales** - Leaderboard:

```tsx
// CREAR: RankingLive.tsx
// Ubicación: Sidebar o overlay activable

<div className="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30">
  <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-4">
    <Trophy size={18} /> Ranking de la Clase
  </h3>
  <div className="space-y-2">
    {ranking.map((estudiante, i) => (
      <motion.div
        key={estudiante.odooId}
        layout
        className={`flex items-center gap-3 p-3 rounded-xl ${
          i === 0
            ? 'bg-amber-500/20'
            : i === 1
              ? 'bg-slate-500/20'
              : i === 2
                ? 'bg-orange-900/20'
                : 'bg-slate-800/50'
        }`}
      >
        <span className="text-2xl w-8 text-center">
          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
        </span>
        <Avatar src={estudiante.avatar} size="sm" />
        <span className="flex-1 text-white font-medium">{estudiante.nombre}</span>
        <span className="text-amber-400 font-bold">{estudiante.puntos} pts</span>
      </motion.div>
    ))}
  </div>
</div>
```

##### 3.4 XP y Logros en Vivo - UI

**Portal Estudiante** - Toast de XP ganado:

```tsx
// CREAR: XPToast.tsx (integrar con sistema de toasts)

const XPToast: React.FC<{ xp: number; motivo: string }> = ({ xp, motivo }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 shadow-lg"
  >
    <div className="text-3xl">⭐</div>
    <div>
      <p className="text-white font-bold">+{xp} XP</p>
      <p className="text-purple-200 text-sm">{motivo}</p>
    </div>
  </motion.div>
);
```

**Portal Estudiante** - Modal de logro desbloqueado:

```tsx
// CREAR: LogroDesbloqueadoModal.tsx

<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
>
  <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="text-center">
    <motion.div
      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
      transition={{ repeat: 3 }}
      className="text-[150px] mb-4"
    >
      {logro.icono}
    </motion.div>
    <h2 className="text-4xl font-bold text-white mb-2">¡Logro Desbloqueado!</h2>
    <p className="text-2xl text-amber-400 font-bold">{logro.titulo}</p>
    <p className="text-slate-400 mt-2">{logro.descripcion}</p>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{ delay: 2, duration: 0.5 }}
      className="mt-8"
    >
      <Confetti active={true} />
    </motion.div>
  </motion.div>
</motion.div>
```

##### 3.5 Puntos de Casa - UI

**Ambos portales** - Banner de casas:

```tsx
// CREAR: CasasRanking.tsx

const CASAS = {
  QUANTUM: { color: 'cyan', gradient: 'from-cyan-500 to-blue-500' },
  VERTEX: { color: 'magenta', gradient: 'from-fuchsia-500 to-purple-500' },
  PULSAR: { color: 'amber', gradient: 'from-amber-500 to-orange-500' },
};

<div className="flex gap-4 justify-center">
  {ranking.map((casa, i) => (
    <motion.div
      key={casa.nombre}
      layout
      className={`flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b ${CASAS[casa.nombre].gradient} bg-opacity-20`}
    >
      <span className="text-3xl">{i === 0 ? '👑' : ''}</span>
      <span className="text-2xl font-bold text-white">{casa.nombre}</span>
      <span className="text-4xl font-bold text-white">{casa.puntos}</span>
      <span className="text-sm text-white/80">puntos</span>
    </motion.div>
  ))}
</div>;
```

---

### Hook Principal: `useAulaVivaWebSocket`

```tsx
// CREAR: hooks/useAulaVivaWebSocket.ts
// Extiende useAulaVivaChat con todos los nuevos eventos

interface UseAulaVivaWebSocketOptions {
  claseGrupoId?: string;
  comisionId?: string;
  rol: 'DOCENTE' | 'ESTUDIANTE';
}

interface UseAulaVivaWebSocketReturn {
  // Chat (existente)
  mensajes: MensajeChat[];
  enviarMensaje: (contenido: string) => Promise<void>;

  // Manos
  manosLevantadas: ManoLevantada[];
  levantarMano: () => Promise<void>;
  bajarMano: () => Promise<void>;
  darPalabra: (odooId: string) => Promise<void>;

  // Moderación
  muteados: Map<string, TipoMuteo>;
  mutear: (odooId: string, tipo: TipoMuteo) => Promise<void>;
  expulsar: (odooId: string, motivo?: string) => Promise<void>;

  // Reacciones
  reacciones: Reaccion[];
  enviarReaccion: (tipo: TipoReaccion) => Promise<void>;

  // Pulso atención
  pulsoActivo: PulsoAtencion | null;
  iniciarPulso: (pregunta?: string) => Promise<void>;
  responderPulso: (respuesta: 'si' | 'no' | 'mas-o-menos') => Promise<void>;
  resultadosPulso: PulsoResultado | null;

  // Quiz
  quizActivo: Quiz | null;
  lanzarQuiz: (data: CreateQuizDto) => Promise<void>;
  responderQuiz: (respuesta: string | number) => Promise<void>;
  cerrarQuiz: () => Promise<void>;
  resultadosQuiz: QuizResultados | null;

  // Contador
  contadorActivo: Contador | null;
  iniciarContador: (segundos: number, mensaje?: string) => Promise<void>;
  pausarContador: () => Promise<void>;

  // Ranking
  ranking: PuntosSesion[];
  otorgarPuntos: (odooId: string, puntos: number, motivo: string) => Promise<void>;

  // XP/Logros
  xpEventos: XPEvento[];
  logrosEventos: LogroEvento[];
  otorgarXP: (odooId: string, cantidad: number, motivo: string) => Promise<void>;

  // Casas
  rankingCasas: CasaPuntos[];
  otorgarPuntosCasa: (casa: Casa, puntos: number, motivo: string) => Promise<void>;

  // Estado
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
}
```

---

### Estructura de Archivos Frontend (Final)

```
apps/web/src/
├── app/
│   ├── docente/clase-en-vivo/page.tsx    # MODIFICAR
│   └── estudiante/clase-en-vivo/page.tsx # MODIFICAR
├── components/
│   ├── docente/live/
│   │   ├── ClassRoom.tsx                 # MODIFICAR - integrar nuevos componentes
│   │   ├── ControlBar.tsx                # MODIFICAR - agregar botones docente
│   │   ├── ChatPanel.tsx                 # existente
│   │   ├── ParticipantsList.tsx          # MODIFICAR - agregar moderación
│   │   ├── HandRaisedQueue.tsx           # NUEVO
│   │   ├── ModerationControls.tsx        # NUEVO
│   │   ├── QuizCreator.tsx               # NUEVO
│   │   ├── PulsoAtencionModal.tsx        # NUEVO
│   │   ├── ContadorControls.tsx          # NUEVO
│   │   └── types.ts                      # MODIFICAR
│   ├── estudiante/live/
│   │   ├── StudentControlBar.tsx         # NUEVO (refactor de ControlBar student mode)
│   │   ├── QuizStudent.tsx               # NUEVO
│   │   ├── PulsoRespuestaModal.tsx       # NUEVO
│   │   └── types.ts                      # NUEVO
│   └── shared/live/
│       ├── ReactionsOverlay.tsx          # NUEVO
│       ├── ReactionsBar.tsx              # NUEVO
│       ├── SelectorAnimacion.tsx         # NUEVO
│       ├── QuizResultados.tsx            # NUEVO
│       ├── ContadorCompartido.tsx        # NUEVO
│       ├── RankingLive.tsx               # NUEVO
│       ├── XPToast.tsx                   # NUEVO
│       ├── LogroDesbloqueadoModal.tsx    # NUEVO
│       └── CasasRanking.tsx              # NUEVO
├── hooks/
│   ├── useAulaVivaChat.ts                # existente
│   └── useAulaVivaWebSocket.ts           # NUEVO - hook unificado
└── lib/api/
    └── aula-viva.api.ts                  # MODIFICAR - agregar endpoints
```

---

## PORTAL DOCENTE - Pendientes del Plan

### 4.2 Compartir Pantalla en Clases en Vivo ✅

> Ya implementado en `ControlBar.tsx`

---

### 4.3 Historial Detallado de Asistencia ✅

> Implementado en `StudentList.tsx` tab Asistencia

---

### 4.4 Reportes Gráficos de Asistencia ✅

> Implementado junto con 4.3

---

### 4.5 Historial de Puntos Otorgados ✅

> Implementado en `StudentList.tsx` tab Puntos + endpoint backend

---

### NUEVO: Sistema de Anuncios Docente → Grupo

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **Prioridad**    | P1 ALTO                                    |
| **Complejidad**  | 🔴 DIFÍCIL                                 |
| **Dependencias** | Ninguna                                    |
| **Descripción**  | Docente puede publicar anuncios a su grupo |

**Funcionalidad**:

- Docente escribe anuncio desde portal
- Estudiantes y tutores del grupo reciben notificación
- Historial de anuncios visible en el grupo

**Pasos**:

1. [ ] Crear modelo `AnuncioGrupo` en Prisma
2. [ ] Crear endpoint `POST /docentes/me/comisiones/:id/anuncios`
3. [ ] Crear endpoint `GET /docentes/me/comisiones/:id/anuncios`
4. [ ] Crear UI en portal docente (botón + modal de creación)
5. [ ] Crear vista de anuncios en portal estudiante
6. [ ] Crear notificación para tutores

---

## PORTAL ESTUDIANTE - Pendientes del Plan

### 6.1 Recuperación de Contraseña ✅

> Implementado con mensaje "Contactá a tu tutor"

---

### 6.2 Restricción por Tier (MODELO 2026) ✅

> Backend `AccesoEstudianteService` + Frontend lock visual ya implementados

---

### 6.3 Animación de Logro Desbloqueado

| Campo            | Valor                                    |
| ---------------- | ---------------------------------------- |
| **Prioridad**    | P2 MEDIO                                 |
| **Complejidad**  | 🟡 MEDIO                                 |
| **Dependencias** | WebSocket Aula Viva (Sprint 3.4)         |
| **Descripción**  | Toast animado cuando se desbloquea logro |

**Pasos**:

1. [ ] Usar evento `logro-desbloqueado` de WebSocket
2. [ ] Crear componente `LogroUnlockedToast.tsx` animado
3. [ ] Integrar en layout de portal estudiante
4. [ ] (Opcional) Agregar sonido de celebración

---

### 6.4 Intent de Juegos Phaser

| Campo            | Valor                                       |
| ---------------- | ------------------------------------------- |
| **Prioridad**    | P2 MEDIO                                    |
| **Complejidad**  | 🔴 DIFÍCIL                                  |
| **Dependencias** | `@mateatletas/game-engine`                  |
| **Descripción**  | Intent `gamification:game` en lesson-engine |

**Pasos**:

1. [ ] Crear intent `gamification:game` en lesson-engine
2. [ ] Definir schema de configuración del juego
3. [ ] Renderizar `GameRunner` de game-engine
4. [ ] Capturar resultado del juego como progreso
5. [ ] Otorgar XP según score

---

## CROSS-PORTAL: Gamificación Docente-Estudiante

### Flujo de Puntos/XP

```
Docente otorga puntos → PuntoObtenido (registro)
                      → RecursosEstudiante.xp_total (incremento)
                      → WebSocket: xp-ganado (broadcast)
                      → Estudiante ve XP actualizado en tiempo real
                      → Si alcanza threshold → Logro desbloqueado
                      → WebSocket: logro-desbloqueado (broadcast)
```

### Intents de Gamificación en Lecciones

| Intent                     | Estado | Descripción                  |
| -------------------------- | ------ | ---------------------------- |
| `gamification:achievement` | ✅     | Mostrar logro desbloqueado   |
| `gamification:progress`    | ✅     | Barra de progreso            |
| `gamification:levelUp`     | ✅     | Animación de subida de nivel |
| `gamification:game`        | ⏳     | Minijuego Phaser interactivo |

---

## Checklist de Progreso

### Bugs Actuales

- [x] BUG-001: Asignar Puntos (DTO mismatch) ✅
- [x] BUG-002: Observaciones ✅
- [x] BUG-003: Inconsistencia XP ✅

### WebSocket Aula Viva

#### Sprint 1: Control de Clase ✅

- [x] 1.1 Levantar la mano
- [x] 1.2 Control de moderación (mutear/expulsar)
- [x] 1.3 Indicador "está hablando"

#### Sprint 2: Interactividad ✅

- [x] 2.1 Reacciones en tiempo real
- [x] 2.2 "¿Están siguiendo?" (pulso atención)
- [x] 2.3 Selector aleatorio

#### Sprint 3: Gamificación Live ✅ (20 E2E tests passing)

- [x] 3.1 Quiz en vivo ✅
- [x] 3.2 Contador compartido ✅
- [x] 3.3 Notificación de puntos (solo privado, sin ranking público) ✅ (6 tests)
- [x] 3.4 XP y logros en vivo ✅ (6 tests)
- [x] 3.5 Puntos de casa en vivo ✅ (5 tests + 3 edge cases)

#### Sprint 4: Contenido Sincronizado ✅ (17 E2E tests passing)

- [x] 4.1 Compartir Teoría (slides sincronizados) ✅ (7 tests)
- [x] 4.2 Práctica en Vivo (ejercicios sincronizados) ✅ (10 tests)
- [ ] ~~4.3 Analytics en Vivo~~ (pospuesto - posible implementación futura)

### Portal Docente

- [x] 5.1 Recuperación de contraseña
- [x] 5.2 Compartir pantalla
- [x] 5.3 Historial de asistencia
- [x] 5.4 Reportes de asistencia
- [x] 5.5 Historial de puntos
- [ ] 5.6 Sistema de Anuncios → Grupo

### Portal Estudiante

- [x] 6.1 Recuperación de contraseña
- [x] 6.2 Restricción por tier
- [ ] 6.3 Animación de logro desbloqueado
- [ ] 6.4 Intent de juegos Phaser

---

## Orden de Ejecución

```
INMEDIATO (Bugs): ✅ COMPLETADO
  └── BUG-001: Asignar Puntos ✅
  └── BUG-002: Observaciones ✅
  └── BUG-003: Inconsistencia XP ✅

WEBSOCKET SPRINT 1 (Control de Clase): ✅ COMPLETADO
  └── 1.1 Levantar la mano ✅
  └── 1.2 Moderación (mutear/expulsar) ✅
  └── 1.3 Indicador hablando ✅

WEBSOCKET SPRINT 2 (Interactividad): ✅ COMPLETADO
  └── 2.1 Reacciones ✅
  └── 2.2 Pulso atención ✅
  └── 2.3 Selector aleatorio ✅

WEBSOCKET SPRINT 3 (Gamificación Live): ✅ COMPLETADO
  └── 3.1 Quiz en vivo ✅
  └── 3.2 Contador compartido ✅
  └── 3.3 Notificación de puntos (privado) ✅
  └── 3.4 XP/Logros live ✅
  └── 3.5 Puntos de casa ✅

WEBSOCKET SPRINT 4 (Contenido Sincronizado): ✅ COMPLETADO
  └── 4.1 Compartir Teoría ✅
  └── 4.2 Práctica en Vivo ✅
  └── 4.3 Analytics en Vivo (pospuesto)

POST-WEBSOCKET:
  └── Sistema de Anuncios Docente → Grupo
  └── 6.3 Animación logro desbloqueado
  └── 6.4 Intent juegos Phaser

OPTIMIZACIÓN Y NOTIFICACIONES:
  └── Performance (lazy loading, code splitting)
  └── Notificaciones Push
  └── Integración lesson-engine con portal estudiante
```

---

## OPTIMIZACIÓN DE PERFORMANCE

> **Prioridad**: P1 ALTO
> **Objetivo**: Reducir Time to Interactive (TTI) y mejorar Core Web Vitals

### 7.1 Lazy Loading y Code Splitting

| Campo           | Valor                                      |
| --------------- | ------------------------------------------ |
| **Prioridad**   | P1 ALTO                                    |
| **Complejidad** | 🟡 MEDIO                                   |
| **Archivos**    | Todos los `page.tsx` y componentes pesados |

**Estrategia**:

```tsx
// 1. Dynamic imports para páginas pesadas
const ClaseEnVivo = dynamic(() => import('@/components/docente/live/ClassRoom'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // LiveKit no funciona en SSR
});

// 2. Lazy load de componentes modales
const QuizCreator = dynamic(() => import('./QuizCreator'));
const LogroDesbloqueadoModal = dynamic(() => import('./LogroDesbloqueadoModal'));

// 3. Route-based code splitting (Next.js lo hace automático por página)
// Verificar que cada página sea un chunk separado
```

**Componentes a lazy-loadear**:

| Componente               | Razón                             | Chunk estimado |
| ------------------------ | --------------------------------- | -------------- |
| `ClassRoom`              | LiveKit + WebSocket pesado        | ~150KB         |
| `QuizCreator`            | Solo usado cuando docente lo abre | ~30KB          |
| `LogroDesbloqueadoModal` | Solo cuando se desbloquea logro   | ~20KB          |
| `LessonRenderer`         | Motor de lecciones completo       | ~100KB         |
| `GameRunner`             | Phaser.js es muy pesado           | ~500KB         |
| `ReactionsOverlay`       | Framer Motion animations          | ~25KB          |

**Checklist**:

- [ ] Auditar bundle con `next build && npx @next/bundle-analyzer`
- [ ] Identificar chunks > 100KB
- [ ] Aplicar dynamic imports a componentes identificados
- [ ] Agregar loading skeletons apropiados
- [ ] Verificar que SSR está deshabilitado para componentes client-only

### 7.2 Optimización de Imágenes y Assets

```tsx
// next.config.js - ya configurado pero verificar
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

// Uso correcto de next/image
import Image from 'next/image';
<Image
  src={avatar}
  alt={nombre}
  width={40}
  height={40}
  placeholder="blur"
  blurDataURL={BLUR_PLACEHOLDER}
/>;
```

### 7.3 Prefetching Inteligente

```tsx
// Prefetch de rutas probables
import { useRouter } from 'next/navigation';

// En dashboard del docente, prefetch clase-en-vivo
useEffect(() => {
  router.prefetch('/docente/clase-en-vivo');
}, []);

// En lista de lecciones, prefetch la primera lección
useEffect(() => {
  if (lecciones.length > 0) {
    router.prefetch(`/estudiante/aula/${asignacionId}/clase/${lecciones[0].id}/leccion`);
  }
}, [lecciones]);
```

### 7.4 Memoización y Re-renders

```tsx
// Componentes que DEBEN usar memo
const ParticipantCard = memo(({ participante, onMutear }) => { ... });
const MensajeChat = memo(({ mensaje }) => { ... });
const RankingItem = memo(({ estudiante, posicion }) => { ... });

// useMemo para cálculos costosos
const rankingOrdenado = useMemo(
  () => [...ranking].sort((a, b) => b.puntos - a.puntos),
  [ranking]
);

// useCallback para handlers pasados a children
const handleMutear = useCallback((odooId: string, tipo: TipoMuteo) => {
  mutear(odooId, tipo);
}, [mutear]);
```

**Checklist Performance**:

- [ ] Instalar React DevTools Profiler
- [ ] Identificar componentes con re-renders innecesarios
- [ ] Aplicar memo/useMemo/useCallback donde corresponda
- [ ] Verificar que listas usan keys estables (no índices)
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## NOTIFICACIONES PUSH

> **Prioridad**: P1 ALTO
> **Tecnología**: Web Push API + Service Worker + Backend queue

### 8.1 Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │   Push Service  │
│   (Next.js)     │     │   (NestJS)      │     │   (FCM/VAPID)   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Service Worker  │◄────│ NotificacionesModule │◄───│ Firebase/VAPID │
│ Push Manager    │     │ BullMQ Queue    │     │                 │
│ IndexedDB cache │     │ Prisma (subs)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 8.2 Backend - Módulo de Notificaciones

```typescript
// apps/api/src/notificaciones/notificaciones.module.ts
@Module({
  imports: [BullModule.registerQueue({ name: 'notificaciones' }), AuthModule],
  controllers: [NotificacionesController],
  providers: [
    NotificacionesService,
    NotificacionesProcessor, // BullMQ processor
    PushService, // Web Push sender
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
```

```typescript
// notificaciones.service.ts
@Injectable()
export class NotificacionesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notificaciones') private queue: Queue,
  ) {}

  /** Registrar suscripción push de un dispositivo */
  async registrarSuscripcion(
    userId: string,
    tipoUsuario: 'ESTUDIANTE' | 'TUTOR' | 'DOCENTE',
    subscription: PushSubscription,
  ): Promise<void>;

  /** Enviar notificación a un usuario específico */
  async enviarAUsuario(
    userId: string,
    tipoUsuario: string,
    notificacion: NotificacionPayload,
  ): Promise<void>;

  /** Enviar notificación a todos los estudiantes de una comisión */
  async enviarAComision(comisionId: string, notificacion: NotificacionPayload): Promise<void>;

  /** Enviar notificación a tutores de estudiantes de una comisión */
  async enviarATutoresDeComision(
    comisionId: string,
    notificacion: NotificacionPayload,
  ): Promise<void>;
}

interface NotificacionPayload {
  titulo: string;
  cuerpo: string;
  icono?: string;
  url?: string; // URL a abrir al hacer click
  data?: Record<string, unknown>;
  prioridad?: 'alta' | 'normal';
}
```

### 8.3 Modelo Prisma

```prisma
model SuscripcionPush {
  id              String   @id @default(uuid())

  // Polimórfico: puede ser estudiante, tutor o docente
  estudianteId    String?  @map("estudiante_id")
  tutorId         String?  @map("tutor_id")
  docenteId       String?  @map("docente_id")

  endpoint        String   @unique
  p256dh          String   // Public key
  auth            String   // Auth secret

  userAgent       String?  @map("user_agent")
  createdAt       DateTime @default(now()) @map("created_at")
  lastUsedAt      DateTime @default(now()) @map("last_used_at")

  estudiante      Estudiante? @relation(fields: [estudianteId], references: [id])
  tutor           Tutor?      @relation(fields: [tutorId], references: [id])
  docente         Docente?    @relation(fields: [docenteId], references: [id])

  @@map("suscripciones_push")
}

model NotificacionEnviada {
  id              String   @id @default(uuid())

  estudianteId    String?  @map("estudiante_id")
  tutorId         String?  @map("tutor_id")
  docenteId       String?  @map("docente_id")

  titulo          String
  cuerpo          String
  url             String?

  enviadaAt       DateTime @default(now()) @map("enviada_at")
  leidaAt         DateTime? @map("leida_at")
  clickeadaAt     DateTime? @map("clickeada_at")

  @@map("notificaciones_enviadas")
}
```

### 8.4 Frontend - Service Worker

```typescript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.cuerpo,
    icon: data.icono || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      ...data.data,
    },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.titulo, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
```

### 8.5 Frontend - Hook de Suscripción

```typescript
// hooks/usePushNotifications.ts
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const solicitarPermiso = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Push notifications no soportadas');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await suscribir();
      return true;
    }
    return false;
  };

  const suscribir = async () => {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });

    // Enviar suscripción al backend
    await notificacionesApi.registrarSuscripcion(subscription);
    setIsSubscribed(true);
  };

  return { permission, isSubscribed, solicitarPermiso };
}
```

### 8.6 Casos de Uso de Notificaciones

| Evento                   | Destinatarios       | Prioridad | Ejemplo                                |
| ------------------------ | ------------------- | --------- | -------------------------------------- |
| Clase en vivo iniciada   | Estudiantes         | Alta      | "¡Tu clase de Matemáticas comenzó!"    |
| Clase en 15 minutos      | Estudiantes         | Normal    | "Tu clase empieza en 15 min"           |
| Logro desbloqueado       | Estudiante          | Normal    | "🏆 Desbloqueaste: Explorador Curioso" |
| Anuncio del docente      | Estudiantes+Tutores | Alta      | "Nuevo anuncio de Prof. García"        |
| Tarea asignada           | Estudiantes         | Normal    | "Nueva tarea: Ejercicios Cap. 5"       |
| Hijo ganó XP             | Tutor               | Normal    | "Juan ganó 50 XP en Matemáticas"       |
| Observación agregada     | Tutor               | Alta      | "Nueva observación sobre María"        |
| Recordatorio inactividad | Estudiante          | Normal    | "¡Te extrañamos! Vuelve a practicar"   |

### 8.7 Checklist Notificaciones Push

- [ ] Generar VAPID keys (`npx web-push generate-vapid-keys`)
- [ ] Crear migración para `SuscripcionPush` y `NotificacionEnviada`
- [ ] Implementar `NotificacionesModule` en backend
- [ ] Implementar `PushService` con web-push library
- [ ] Crear Service Worker en frontend
- [ ] Implementar hook `usePushNotifications`
- [ ] Agregar prompt de permiso en onboarding
- [ ] Integrar con eventos existentes (clase iniciada, logro, etc.)
- [ ] Tests de integración

---

## INTEGRACIÓN LESSON-ENGINE CON PORTAL ESTUDIANTE

> **Prioridad**: P0 CRÍTICO
> **Objetivo**: Que las lecciones se rendericen dentro del portal estudiante

### 9.1 Arquitectura de Integración

```
Portal Estudiante                    Lesson Engine Package
┌─────────────────────────┐         ┌─────────────────────────┐
│ /estudiante/aula/       │         │ @mateatletas/           │
│   [asignacionId]/       │         │   lesson-engine         │
│     clase/[claseId]/    │         ├─────────────────────────┤
│       [tipo]/page.tsx   │────────►│ LessonRenderer          │
│                         │         │ SlideContainer          │
│ Provee:                 │         │ IntentRegistry          │
│ - Auth context          │         │ LessonContext           │
│ - XP callbacks          │         │                         │
│ - Progress tracking     │         │ Recibe:                 │
│ - Navigation            │         │ - lessonData (JSON)     │
└─────────────────────────┘         │ - onComplete callback   │
                                    │ - onXPGained callback   │
                                    └─────────────────────────┘
```

### 9.2 Página de Lección en Portal Estudiante

```tsx
// apps/web/src/app/estudiante/aula/[asignacionId]/clase/[claseId]/leccion/page.tsx

'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clasesApi } from '@/lib/api/clases.api';
import { progresoApi } from '@/lib/api/progreso.api';
import { LoadingSkeleton } from '@/components/ui';

// Lazy load del lesson engine (es pesado)
const LessonRenderer = dynamic(
  () => import('@mateatletas/lesson-engine').then((mod) => mod.LessonRenderer),
  {
    loading: () => <LoadingSkeleton variant="lesson" />,
    ssr: false,
  },
);

export default function LeccionPage() {
  const params = useParams();
  const { asignacionId, claseId } = params as { asignacionId: string; claseId: string };

  // Cargar datos de la lección
  const { data: leccion, isLoading } = useQuery({
    queryKey: ['leccion', claseId],
    queryFn: () => clasesApi.getLeccion(claseId),
  });

  // Mutation para guardar progreso
  const guardarProgreso = useMutation({
    mutationFn: (data: { slideIndex: number; completed: boolean }) =>
      progresoApi.guardarProgresoLeccion(asignacionId, claseId, data),
  });

  // Mutation para otorgar XP
  const otorgarXP = useMutation({
    mutationFn: (data: { cantidad: number; motivo: string }) =>
      progresoApi.otorgarXPLeccion(asignacionId, claseId, data),
  });

  const handleSlideChange = (slideIndex: number) => {
    guardarProgreso.mutate({ slideIndex, completed: false });
  };

  const handleComplete = async () => {
    await guardarProgreso.mutateAsync({ slideIndex: -1, completed: true });
    // Navegar de vuelta al aula
    router.push(`/estudiante/aula/${asignacionId}`);
  };

  const handleXPGained = (cantidad: number, motivo: string) => {
    otorgarXP.mutate({ cantidad, motivo });
  };

  if (isLoading) return <LoadingSkeleton variant="lesson" />;
  if (!leccion) return <ErrorState message="Lección no encontrada" />;

  return (
    <div className="h-screen bg-slate-950">
      <LessonRenderer
        lessonData={leccion.contenido}
        studentInfo={{
          nombre: user.nombre,
          casa: user.casa,
          xpTotal: user.xpTotal,
        }}
        onSlideChange={handleSlideChange}
        onComplete={handleComplete}
        onXPGained={handleXPGained}
        initialSlide={leccion.progresoActual?.slideIndex ?? 0}
        theme="dark" // Usar tema oscuro del portal
      />
    </div>
  );
}
```

### 9.3 Props del LessonRenderer

```typescript
// packages/lesson-engine/src/renderer/LessonRenderer.tsx

interface LessonRendererProps {
  /** Datos de la lección en formato JSON */
  lessonData: LessonData;

  /** Info del estudiante para personalización */
  studentInfo: {
    nombre: string;
    casa: 'QUANTUM' | 'VERTEX' | 'PULSAR';
    xpTotal: number;
  };

  /** Callbacks */
  onSlideChange?: (slideIndex: number) => void;
  onComplete?: () => void | Promise<void>;
  onXPGained?: (cantidad: number, motivo: string) => void;
  onAchievementUnlocked?: (logro: Logro) => void;

  /** Estado inicial */
  initialSlide?: number;

  /** Tema visual */
  theme?: 'dark' | 'light';

  /** Para debugging */
  debug?: boolean;
}
```

### 9.4 Intents Pendientes de Implementar

| Intent              | Estado | Prioridad | Descripción                   |
| ------------------- | ------ | --------- | ----------------------------- |
| `interaction:quiz`  | ⏳     | P0        | Quiz interactivo con feedback |
| `interaction:match` | ⏳     | P1        | Conectar pares                |
| `interaction:sort`  | ⏳     | P1        | Ordenar elementos             |
| `gamification:game` | ⏳     | P2        | Minijuego Phaser embebido     |
| `narrative:mascot`  | ⏳     | P1        | Mascota animada con diálogos  |
| `layout:bento`      | ⏳     | P2        | Layout estilo bento grid      |

### 9.5 Estructura de Archivos Lesson Engine

```
packages/lesson-engine/src/
├── renderer/
│   ├── LessonRenderer.tsx       # Componente principal
│   ├── SlideContainer.tsx       # Container 100vh
│   └── IntentRegistry.ts        # Registro de componentes
├── context/
│   └── LessonContext.tsx        # Estado global de lección
├── intents/
│   ├── presentation/            # hero, define, explain
│   ├── interaction/             # quiz, match, sort (PENDIENTES)
│   ├── gamification/            # achievement, progress, game
│   ├── narrative/               # mascot, conversation (PENDIENTES)
│   └── layout/                  # split, bento
└── hooks/
    ├── useLesson.ts
    ├── useSlideNavigation.ts
    └── useXPTracking.ts
```

### 9.6 Checklist Integración

- [ ] Verificar que `@mateatletas/lesson-engine` está en dependencies de web
- [ ] Crear página `/estudiante/aula/[asignacionId]/clase/[claseId]/leccion`
- [ ] Implementar endpoints de progreso en backend
- [ ] Implementar intent `interaction:quiz`
- [ ] Implementar intent `interaction:match`
- [ ] Implementar intent `narrative:mascot`
- [ ] Conectar XP ganado con sistema de gamificación existente
- [ ] Tests E2E de flujo completo de lección

---

## Checklist de Progreso (Actualizado)

### Bugs Actuales

- [x] BUG-001: Asignar Puntos (DTO mismatch) ✅
- [x] BUG-002: Observaciones ✅
- [x] BUG-003: Inconsistencia XP ✅

### WebSocket Aula Viva

#### Sprint 1: Control de Clase ✅

- [x] 1.1 Levantar la mano
- [x] 1.2 Control de moderación (mutear/expulsar)
- [x] 1.3 Indicador "está hablando"

#### Sprint 2: Interactividad ✅

- [x] 2.1 Reacciones en tiempo real
- [x] 2.2 "¿Están siguiendo?" (pulso atención)
- [x] 2.3 Selector aleatorio

#### Sprint 3: Gamificación Live ✅ (20 E2E tests passing)

- [x] 3.1 Quiz en vivo ✅
- [x] 3.2 Contador compartido ✅
- [x] 3.3 Notificación de puntos (solo privado, sin ranking público) ✅ (6 tests)
- [x] 3.4 XP y logros en vivo ✅ (6 tests)
- [x] 3.5 Puntos de casa en vivo ✅ (5 tests + 3 edge cases)

#### Sprint 4: Contenido Sincronizado ✅ (17 E2E tests passing)

- [x] 4.1 Compartir Teoría (slides sincronizados) ✅ (7 tests)
- [x] 4.2 Práctica en Vivo (ejercicios sincronizados) ✅ (10 tests)
- [ ] ~~4.3 Analytics en Vivo~~ (pospuesto - posible implementación futura)

### Portal Docente

- [x] 5.1 Recuperación de contraseña
- [x] 5.2 Compartir pantalla
- [x] 5.3 Historial de asistencia
- [x] 5.4 Reportes de asistencia
- [x] 5.5 Historial de puntos
- [ ] 5.6 Sistema de Anuncios → Grupo

### Portal Estudiante

- [x] 6.1 Recuperación de contraseña
- [x] 6.2 Restricción por tier
- [ ] 6.3 Animación de logro desbloqueado
- [ ] 6.4 Intent de juegos Phaser

### Performance y Notificaciones

- [ ] 7.1 Lazy loading y code splitting
- [ ] 7.2 Optimización de imágenes
- [ ] 7.3 Prefetching inteligente
- [ ] 7.4 Memoización y re-renders
- [ ] 8.1-8.7 Notificaciones Push (completo)
- [ ] 9.1-9.6 Integración lesson-engine (completo)

---

## Reglas Innegociables

- ❌ Cero `any`
- ❌ Cero `@ts-ignore`
- ✅ Tipos explícitos en todo
- ✅ TDD: test falla → implementar → test pasa
- ✅ Archivos < 200 líneas
- ✅ Services con responsabilidad única
- ✅ DTOs con class-validator
- ✅ 80%+ coverage en tests
- ✅ 0 errores TypeScript/ESLint

---

## Verificación Final por Feature

```bash
yarn build      # 0 errores
yarn lint       # 0 errores
yarn test       # todos pasan
```

---

## Referencias

- [NestJS WebSocket Gateways](https://docs.nestjs.com/websockets/gateways)
- [VideoSDK - NestJS WebSocket 2025](https://www.videosdk.live/developer-hub/websocket/nest-js-websocket)
- [NestJS Throttler](https://github.com/nestjs/throttler)
- [Socket.IO Rooms](https://socket.io/docs/v3/rooms/)
- [Testing WebSockets E2E](https://moldstud.com/articles/p-effective-strategies-for-testing-websockets-in-nestjs-e2e-insights-and-best-practices)
- [Classroom Polling Tools 2025](https://ahaslides.com/blog/classroom-polling/)
- [ClassPoint Gamification](https://www.classpoint.io/blog/gamified-learning-platforms)

---

## Historial de Cambios

| Fecha      | Cambio                                                                          | Autor  |
| ---------- | ------------------------------------------------------------------------------- | ------ |
| 2026-01-20 | Creación del documento                                                          | Claude |
| 2026-01-20 | Documentados 3 bugs actuales                                                    | Claude |
| 2026-01-20 | Agregado plan completo WebSocket Aula Viva (backend)                            | Claude |
| 2026-01-20 | Investigación mejores prácticas 2025/2026                                       | Claude |
| 2026-01-20 | Agregada sección UX/UI Frontend completa                                        | Claude |
| 2026-01-20 | Especificados componentes React para ambos portales                             | Claude |
| 2026-01-20 | Definido hook `useAulaVivaWebSocket` unificado                                  | Claude |
| 2026-01-20 | Agregada sección Optimización de Performance                                    | Claude |
| 2026-01-20 | Agregada sección Notificaciones Push completa                                   | Claude |
| 2026-01-20 | Agregada sección Integración Lesson-Engine                                      | Claude |
| 2026-01-20 | Actualizado checklist con todos los ítems nuevos                                | Claude |
| 2026-01-20 | Agregado Sprint 4: Compartir Teoría, Práctica, Analytics                        | Claude |
| 2026-01-20 | NOTA: Sprint 4 requiere integración con Planificaciones                         | Claude |
| 2026-01-23 | Fix: Tests E2E Sprint 3.2 Contador - CUIDs 25 chars, DTO validadores a handler  | Claude |
| 2026-01-23 | Sprint 3.3-3.5: Gamificación WebSocket - Notificaciones puntos, XP/logros, casa | Claude |
| 2026-01-23 | Tests E2E Sprint 3.3-3.5: 20 tests gamificación realtime (100% passing)         | Claude |
| 2026-01-23 | Fix typo puntosToales → puntosTotales en contracts y backend                    | Claude |
| 2026-01-23 | Agregado WsBadRequestFilter + WsErrorInterceptor para manejo errores WebSocket  | Claude |
| 2026-01-23 | Documentada regla CUID (25 chars) en CLAUDE.md                                  | Claude |
| 2026-01-23 | Sprint 4.1-4.2: Teoría Sincronizada y Práctica en Vivo - 17 E2E tests passing   | Claude |
| 2026-01-23 | Fix: clearAll() en servicios para limpieza de estado entre tests E2E            | Claude |
| 2026-01-23 | Sprint 4.3 Analytics pospuesto (posible implementación futura)                  | Claude |
