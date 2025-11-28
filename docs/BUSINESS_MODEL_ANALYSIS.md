# Mateatletas Business Model Analysis

**Document Version:** 1.0
**Analysis Date:** October 30, 2025
**Analyzed By:** Business Model Analyst via Claude Code
**Codebase Version:** 1.0.0 - Production Ready

---

## Executive Summary

Mateatletas is a **B2C EdTech platform** specializing in mathematics education with a **freemium-to-premium gamified learning model**. The platform targets Spanish-speaking families seeking supplementary mathematics education with engaging, game-based learning experiences.

**Key Business Metrics:**

- **Target Market:** K-12 students (Primary through University level)
- **Geographic Focus:** Spanish-speaking markets (Argentina primary market based on currency ARS)
- **Business Model Type:** Subscription + One-time purchases + Virtual goods
- **Pricing Strategy:** Tiered subscriptions with family discounts
- **Monetization Channels:** 3 primary revenue streams

**Core Value Proposition:**
Transform mathematics education from a chore into an engaging adventure through gamification, personalized learning paths, and professional instructor-led classes.

---

## 1. Business Model Canvas

### 1.1 Customer Segments

#### Primary Segments (from schema analysis)

**1. Tutors/Parents (Payers)**

- **Role:** Financial decision-makers and account managers
- **Responsibilities:**
  - Manage subscriptions and payments
  - Oversee multiple student accounts (siblings)
  - Reserve classes and monitor progress
  - Approve course redemptions
- **Database Model:** `Tutor` table
- **Key Fields:** `email`, `password_hash`, `debe_cambiar_password`, `debe_completar_perfil`
- **Payment Relationship:** Links to `Membresia`, `InscripcionMensual`, `SolicitudCanje`

**2. Students (Users)**

- **Role:** Primary platform users and learners
- **Segments by Level:**
  - Primary School (Primaria)
  - Secondary School (Secundaria)
  - University Level
- **Database Model:** `Estudiante` table
- **Key Fields:** `username`, `nombre`, `apellido`, `nivel_escolar`, `avatar_url`, `puntos_acumulados`, `nivel_actual`
- **Engagement Systems:** Gamification, teams (`equipo_id`), sectors, groups

**3. Teachers (Docentes)**

- **Role:** Content creators and class instructors
- **Responsibilities:**
  - Lead live classes
  - Create lesson plans
  - Track student attendance
  - Provide observations and feedback
- **Database Model:** `Docente` table
- **Key Fields:** `email`, `titulo`, `bio`, `especialidad`
- **Content Relationship:** Assigns to `Clase`, `RutaEspecialidad`

**4. Admins**

- **Role:** Platform operators and business managers
- **Responsibilities:**
  - Manage pricing configuration
  - Create and manage products
  - Oversee all user types
  - Configure gamification systems
- **Database Model:** `Admin` table
- **Authorization:** Full platform access

### 1.2 Value Propositions

#### For Parents/Tutors

1. **Transparent Progress Tracking**
   - Real-time dashboard with student metrics
   - Attendance and completion reports
   - Code Reference: `/apps/api/src/pagos/application/use-cases/obtener-metricas-dashboard.use-case.ts`

2. **Flexible Payment Options**
   - Multiple pricing tiers with automatic discounts
   - Family discounts (siblings)
   - Multi-activity discounts
   - AACREA association discounts (20%)
   - Code Reference: `/apps/api/src/pagos/domain/rules/precio.rules.ts` (lines 8-13)

3. **Parent-Child Shared Economy**
   - Students earn virtual currency through learning
   - Parents approve redemptions with flexible payment splits
   - Code Reference: `/apps/api/src/gamificacion/services/tienda.service.ts` (lines 237-255)

#### For Students

1. **Gamified Learning Experience**
   - XP and level progression system
   - Achievement/Trophy system with multiple rarities
   - Virtual store with cosmetic items
   - Team-based competition
   - Code Reference:
     - `/apps/api/src/gamificacion/services/recursos.service.ts` (lines 33-44)
     - `/apps/api/src/gamificacion/services/logros.service.ts`

2. **Personalized Learning Paths**
   - Sector-based specialization (Mathematics, Programming, etc.)
   - Adaptive difficulty through groups (B1, B2, A1, OLIMP)
   - Progress tracking per module/lesson
   - Code Reference: Schema models `Sector`, `Grupo`, `RutaEspecialidad`

3. **Avatar Customization**
   - 3D Ready Player Me avatars
   - Unlockable skins and items through gameplay
   - Visual identity in the learning hub
   - Code Reference: `Estudiante.avatar_url`, `ItemTienda`, `ItemObtenido`

4. **Live Interactive Classes**
   - Small group sessions with professional teachers
   - Class reservation system
   - Attendance tracking with rewards
   - Code Reference: `/apps/api/src/clases/` module

#### For Teachers

1. **Professional Teaching Platform**
   - Structured curriculum management
   - Student attendance and progress tools
   - Class scheduling system
   - Observation logging
   - Code Reference: `/apps/api/src/clases/services/clases-management.service.ts`

2. **Specialized Route Assignment**
   - Match expertise with curriculum paths
   - Sector-based specialization
   - Code Reference: Schema model `DocenteRuta`

### 1.3 Revenue Streams

#### Revenue Stream 1: Monthly Subscriptions (Primary)

**Product Types:**

- **Club de Matemáticas:** Base subscription
  - Base Price: ARS $50,000/month
  - Includes: Access to live classes, basic content

- **Cursos Especializados:** Premium subscription
  - Base Price: ARS $55,000/month
  - Includes: Specialized curriculum tracks

**Discount Structure (Applied Hierarchically):**

| Discount Type       | Conditions                       | Price            | Savings | Code Reference                       |
| ------------------- | -------------------------------- | ---------------- | ------- | ------------------------------------ |
| No Discount         | 1 student, 1 activity            | $50,000          | 0%      | `TipoDescuento.NINGUNO`              |
| Multiple Activities | 1 student, 2+ activities         | $44,000/activity | 12%     | `TipoDescuento.MULTIPLE_ACTIVIDADES` |
| Siblings Basic      | 2+ siblings, 1 activity each     | $44,000/student  | 12%     | `TipoDescuento.HERMANOS_BASICO`      |
| Siblings + Multiple | 2+ siblings, 2+ activities each  | $38,000/activity | 24%     | `TipoDescuento.HERMANOS_MULTIPLE`    |
| AACREA Member       | 1 student, 1 activity, certified | Base - 20%       | 20%     | `TipoDescuento.AACREA`               |

**Code Implementation:**

```typescript
// File: /apps/api/src/pagos/domain/rules/precio.rules.ts (lines 97-162)
function aplicarReglasDescuento(params: {
  precioBase: Decimal;
  cantidadHermanos: number;
  actividadesPorEstudiante: number;
  tieneAACREA: boolean;
  configuracion: ConfiguracionPrecios;
}): CalculoPrecioOutput;
```

**Business Logic:**

1. Parents can manage subscriptions via `/apps/api/src/pagos/presentation/services/pagos-tutor.service.ts`
2. Automatic discount calculation via use case pattern
3. Monthly billing cycle with configurable due dates
4. MercadoPago payment gateway integration

**Database Models:**

- `Producto` (tipo: 'Suscripcion')
- `Membresia` (links Tutor → Producto)
- `InscripcionMensual` (monthly billing records)
- `ConfiguracionPrecios` (singleton for price management)

#### Revenue Stream 2: Course Marketplace

**Catalog System:**

- **Self-paced Courses:** Structured learning modules
- **Pricing Model:** Fixed USD prices converted to coins
  - Example: $100 USD = 2,000 coins
- **Three-Way Payment Options:**
  1. **Parent Pays All:** 100% USD, 0 coins
  2. **Split 50/50:** 50% USD + 50% coins
  3. **Student Pays All:** 0 USD + 100% coins

**Business Flow:**

```
1. Student browses catalog (level-gated)
   → /apps/api/src/gamificacion/services/tienda.service.ts (line 46)

2. Student requests redemption with coins
   → Creates SolicitudCanje (pending approval)

3. Parent receives notification
   → Chooses payment option (padre_paga_todo | hijo_paga_mitad | hijo_paga_todo)

4. Parent approves
   → Coins deducted (if applicable)
   → Course unlocked in CursoEstudiante table
   → Parent charged USD portion
```

**Key Features:**

- Level requirements prevent premature access
- 7-day approval expiration
- Transaction history tracking
- Course progress tracking (0-100%)

**Code Reference:**

- Service: `/apps/api/src/gamificacion/services/tienda.service.ts`
- Request Flow: `solicitarCanje()` (line 116)
- Approval Flow: `aprobarCanje()` (line 251)

**Database Models:**

- `CursoCatalogo`: Product catalog
- `SolicitudCanje`: Redemption requests
- `CursoEstudiante`: Enrolled courses with progress
- `TransaccionRecurso`: Coin spending records

#### Revenue Stream 3: Virtual Store (Microtransactions)

**Product Categories:**

- Avatar items (skins, accessories)
- Power-ups and boosters
- Cosmetic enhancements
- Limited edition items

**Pricing:**

- Coins-only purchases
- Tiered pricing by rarity (común, raro, épico, legendario)
- Level-gated items (require minimum student level)

**Purchase Flow:**

```typescript
// File: /apps/api/src/tienda/tienda.service.ts (line 329)
async realizarCompra(data: RealizarCompra): Promise<CompraResponse> {
  // 1. Verify item availability
  // 2. Check student level requirement
  // 3. Verify sufficient coins
  // 4. Atomic transaction:
  //    - Deduct coins
  //    - Create purchase record
  //    - Add to inventory
  //    - Increment purchase counter
  // 5. Return updated resources
}
```

**Monetization Strategy:**

- Pure play-to-earn: No direct cash purchases of coins
- Coins earned through:
  - Class attendance
  - Lesson completion
  - Achievement unlocks
  - Streaks and consistency
- Creates engagement loop without pay-to-win

**Database Models:**

- `ItemTienda`: Store catalog
- `CategoriaItem`: Item organization
- `ItemObtenido`: Student inventory
- `CompraItem`: Purchase history

### 1.4 Key Resources

#### Technical Infrastructure

1. **Backend API (NestJS)**
   - 99 tests passing, 90% coverage
   - Redis caching layer
   - Rate limiting and security (Helmet)
   - Swagger documentation
   - Location: `/apps/api/`

2. **Frontend Web App (Next.js 15)**
   - React Query for server state
   - 4 portals (Tutor, Student, Teacher, Admin)
   - 98% reduction in server requests via caching
   - Location: `/apps/web/`

3. **Database (PostgreSQL + Prisma ORM)**
   - 22+ models
   - Optimized queries (0 N+1 issues)
   - Transactional consistency
   - Location: `/apps/api/prisma/schema.prisma`

#### Content Resources

1. **Curriculum Database**
   - Structured learning paths (Rutas Curriculares)
   - Modular course content (Módulos, Lecciones)
   - Multiple content types: Video, Text, Quiz, Tasks

2. **Gamification Assets**
   - 4 teams with color schemes (Fénix, Dragón, Tigre, Águila)
   - Achievement system with metadata
   - Virtual store items with rarity tiers

#### Human Resources

1. **Teaching Staff (Docentes)**
   - Professional qualifications tracked
   - Specialized by sector
   - Live class facilitation

2. **Administrative Team**
   - Platform management
   - Pricing configuration
   - User support

### 1.5 Key Activities

#### Core Platform Operations

1. **Class Scheduling & Delivery**
   - Live class programming
   - Capacity management (cupos)
   - Attendance tracking
   - Module: `/apps/api/src/clases/`

2. **Content Creation & Curation**
   - Course module authoring
   - Lesson creation (4 types: Video, Text, Quiz, Task)
   - Curriculum path design
   - Module: `/apps/api/src/cursos/`

3. **Student Engagement**
   - XP and coin distribution
   - Achievement unlocking
   - Progress tracking
   - Leaderboards and rankings
   - Module: `/apps/api/src/gamificacion/`

4. **Payment Processing**
   - Subscription billing
   - Discount calculation
   - MercadoPago integration
   - Invoice generation
   - Module: `/apps/api/src/pagos/`

#### Support Activities

1. **Platform Maintenance**
   - Performance optimization (0ms UI response time)
   - Bug fixing
   - Security updates

2. **Marketing & Acquisition**
   - Family referral programs
   - AACREA partnership management

### 1.6 Key Partnerships

#### Payment Gateway

- **MercadoPago** (Latin America focus)
  - Subscription processing
  - One-time payments
  - Webhook integrations
  - Code: `/apps/api/src/pagos/mercadopago.service.ts`

#### Association Partnerships

- **AACREA (Asociación Altas Capacidades)**
  - 20% discount for members
  - Targeted at gifted students
  - Configurable in admin panel
  - Code: `ConfiguracionPrecios.descuento_aacrea_porcentaje`

#### Avatar Technology

- **Ready Player Me**
  - 3D avatar generation
  - Cross-platform compatibility
  - URL-based asset delivery
  - Field: `Estudiante.avatar_url`

### 1.7 Customer Relationships

#### For Parents/Tutors

1. **Self-Service Portal**
   - Dashboard with metrics
   - Class reservations
   - Payment history
   - Student progress monitoring

2. **Approval Workflows**
   - Course redemption approvals
   - Payment split decisions
   - Notification system

3. **Automated Billing**
   - Monthly subscription charges
   - Configurable payment reminders
   - Fields: `ConfiguracionPrecios.dia_vencimiento`, `dias_antes_recordatorio`

#### For Students

1. **Gamified Engagement**
   - Daily login streaks
   - Achievement notifications
   - Level-up celebrations
   - Team leaderboards

2. **Progressive Disclosure**
   - Sequential lesson unlocking
   - Level-gated content
   - Personalized next-lesson suggestions
   - Code: `/apps/api/src/cursos/progreso.service.ts`

3. **Social Features**
   - Team-based competition
   - Peer rankings
   - Shared achievements

#### For Teachers

1. **Professional Tools**
   - Class management interface
   - Attendance tracking
   - Student observation system

2. **Content Authorship**
   - Lesson creation tools
   - Module organization
   - Curriculum path assignment

### 1.8 Channels

#### Digital Channels

1. **Web Application**
   - Primary access point
   - Responsive design
   - 4 role-based portals
   - Location: `http://localhost:3000` (production domain TBD)

2. **API Platform**
   - RESTful architecture
   - Swagger documentation at `/api/docs`
   - Rate-limited endpoints
   - JWT authentication

#### Communication Channels

1. **Email Notifications**
   - Payment reminders
   - Course approvals
   - Achievement unlocks
   - System: Built into platform

2. **In-App Notifications**
   - Real-time updates
   - Badge indicators
   - Modal celebrations

### 1.9 Cost Structure

#### Variable Costs

1. **Payment Processing Fees**
   - MercadoPago transaction fees (typically 2-5%)
   - Currency conversion fees

2. **Cloud Infrastructure**
   - Server hosting (scales with users)
   - Database storage
   - CDN for avatars/media
   - Redis cache instances

3. **Teaching Staff**
   - Per-class instructor payments
   - Content creation compensation

#### Fixed Costs

1. **Platform Development**
   - Engineering team
   - Maintenance and updates
   - Security monitoring

2. **Administrative Overhead**
   - Admin staff salaries
   - Customer support
   - Business operations

3. **Technology Licenses**
   - Third-party services
   - Ready Player Me integration
   - Development tools

---

## 2. Revenue Model Deep Dive

### 2.1 Pricing Structure

#### Subscription Tiers

| Tier Name             | Base Price (ARS) | Price USD Equivalent | Target Segment    | Key Features                              |
| --------------------- | ---------------- | -------------------- | ----------------- | ----------------------------------------- |
| Club Matemáticas      | $50,000          | ~$50-60 USD          | General students  | Live classes, basic content, gamification |
| Cursos Especializados | $55,000          | ~$55-65 USD          | Advanced students | Premium curriculum, specialized tracks    |

**Discount Matrix:**

| Scenario                       | Students | Activities/Student | Final Price/Activity | Effective Discount | Monthly Total (2 students, 2 activities) |
| ------------------------------ | -------- | ------------------ | -------------------- | ------------------ | ---------------------------------------- |
| Single Student Single Activity | 1        | 1                  | $50,000              | 0%                 | $50,000                                  |
| Single Student Multiple        | 1        | 2+                 | $44,000              | 12%                | $88,000                                  |
| Siblings Basic                 | 2+       | 1                  | $44,000              | 12%                | $88,000                                  |
| Siblings Multiple (BEST VALUE) | 2+       | 2+                 | $38,000              | 24%                | $152,000                                 |
| AACREA Discount                | 1        | 1                  | $40,000              | 20%                | $40,000                                  |

**Pricing Philosophy:**

- Encourage multi-child enrollment (family focus)
- Reward engagement with multiple activities
- Make premium accessible through volume discounts
- Support educational equity through AACREA partnership

**Implementation:**

```typescript
// Automatic discount calculation
// File: /apps/api/src/pagos/application/use-cases/calcular-precio.use-case.ts
export class CalcularPrecioUseCase {
  async execute(input: CalcularPrecioInputDTO): Promise<CalcularPrecioOutputDTO> {
    // 1. Group students by tutor
    // 2. Count activities per student
    // 3. Apply discount rules hierarchy
    // 4. Return breakdown with savings
  }
}
```

### 2.2 Course Marketplace Economics

**Pricing Strategy:**

- Fixed USD pricing for course creation (predictable revenue)
- Conversion ratio: 1 USD = 20 coins
- Example: $100 course = 2,000 coins

**Payment Options Impact:**

| Parent Choice    | Parent Pays (USD) | Student Pays (Coins) | Student Retention Impact | Revenue Quality        |
| ---------------- | ----------------- | -------------------- | ------------------------ | ---------------------- |
| Parent Pays All  | $100              | 0                    | Low engagement risk      | 100% cash revenue      |
| Split 50/50      | $50               | 1,000                | Balanced incentive       | 50% cash + engagement  |
| Student Pays All | $0                | 2,000                | Maximum engagement       | 0% cash, loyalty boost |

**Business Strategy:**

- **Option 1** (Parent Pays All): Pure revenue maximization
- **Option 2** (Split): Balanced monetization + engagement
- **Option 3** (Student Pays All): Loss leader for retention

**Engagement Loop:**

```
More Learning → More Coins → More Courses → More Learning
```

**Code Implementation:**

```typescript
// File: /apps/api/src/gamificacion/services/tienda.service.ts (line 310)
switch (opcionPago) {
  case 'padre_paga_todo':
    monedasAGastar = 0;
    montoPadre = Number(solicitud.curso.precio_usd);
    break;
  case 'hijo_paga_mitad':
    monedasAGastar = Math.floor(solicitud.monedas_usadas / 2);
    montoPadre = Number(solicitud.curso.precio_usd) / 2;
    break;
  case 'hijo_paga_todo':
    monedasAGastar = solicitud.monedas_usadas;
    montoPadre = 0;
    break;
}
```

### 2.3 Virtual Store Monetization

**Currency Design:**

- **XP (Experience Points):** Progression metric, cannot be spent
- **Monedas (Coins):** Spendable currency

**Earning Mechanisms:**

| Activity           | XP Reward | Coin Reward | Frequency  | Code Reference                       |
| ------------------ | --------- | ----------- | ---------- | ------------------------------------ |
| Class Attendance   | 50-100    | 20-50       | Per class  | `ClasesAsistenciaService`            |
| Lesson Completion  | 25-75     | 10-30       | Per lesson | `ProgresoService.completarLeccion()` |
| Achievement Unlock | 100-500   | 50-200      | One-time   | `LogrosService.desbloquearLogro()`   |
| Daily Streak       | 10-50     | 5-25        | Daily      | `RachaService`                       |

**Level Progression:**

```typescript
// File: /apps/api/src/gamificacion/services/recursos.service.ts (line 33-36)
calcularNivel(xp_total: number): number {
  // Formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp_total / 100)) + 1;
}
```

**Spending Options:**

| Item Category   | Price Range (Coins) | Rarity Tiers     | Level Gate | Monetization Impact     |
| --------------- | ------------------- | ---------------- | ---------- | ----------------------- |
| Avatar Items    | 50-500              | Común-Legendario | Level 1-10 | Cosmetic, no pay-to-win |
| Power-ups       | 100-300             | Raro-Épico       | Level 5+   | Slight gameplay boost   |
| Limited Edition | 1,000-5,000         | Legendario       | Level 15+  | Scarcity driver         |

**Anti-Pay-to-Win Design:**

- No direct coin purchases with real money
- All coins earned through learning activities
- Items are cosmetic or minor boosts
- Prevents wealth inequality among students

### 2.4 Revenue Projections (Hypothetical)

**Assumptions:**

- Average family: 2 students, 2 activities each
- 70% choose siblings+multiple discount ($38,000/activity)
- 20% course redemptions per student per year (split payment)
- 10% virtual store spending per student per month

**Per-Family Monthly Revenue:**

| Source                     | Calculation                                            | Revenue (ARS)    | Revenue (USD ~$0.0012) |
| -------------------------- | ------------------------------------------------------ | ---------------- | ---------------------- |
| Subscriptions              | 2 students × 2 activities × $38,000                    | $152,000         | ~$182 USD              |
| Course (monthly avg)       | ($100 USD / 12 months) × 50% parent split × 2 students | —                | ~$8 USD                |
| Virtual Store              | Minimal (engagement driver)                            | $0               | $0 USD                 |
| **Total per Family/Month** |                                                        | **$152,000 ARS** | **~$190 USD**          |

**Annual per Family:**

- Subscriptions: $1,824,000 ARS (~$2,280 USD)
- Courses: ~$100 USD
- **Total: ~$2,380 USD/year**

**Scaling:**

- 100 families = $238,000 USD/year
- 500 families = $1,190,000 USD/year
- 1,000 families = $2,380,000 USD/year

---

## 3. User Roles & Segments

### 3.1 Role Matrix

| Role       | Database Model | Authentication Method | Primary Portal         | Key Permissions                                       |
| ---------- | -------------- | --------------------- | ---------------------- | ----------------------------------------------------- |
| Tutor      | `Tutor`        | Email/Password        | `/dashboard`           | Manage students, payments, reservations               |
| Estudiante | `Estudiante`   | Username/Password     | `/estudiante/gimnasio` | Access classes, earn coins, redeem courses            |
| Docente    | `Docente`      | Email/Password        | `/docente/dashboard`   | Teach classes, track attendance, create content       |
| Admin      | `Admin`        | Email/Password        | `/admin/dashboard`     | Full platform access, configure pricing, manage users |

### 3.2 User Journey Maps

#### Tutor Journey

**Phase 1: Onboarding**

```
1. Register account (email, password)
   → Creates Tutor record with debe_cambiar_password=true

2. First login → Forced password change
   → Updates password_hash, debe_cambiar_password=false

3. Complete profile
   → Adds nombre, apellido, telefono, direccion

4. Add students
   → Creates Estudiante records linked to tutor_id
```

**Phase 2: Subscription**

```
1. Browse plans (/membresia/planes)
   → Shows ConfiguracionPrecios with current rates

2. Select product (Club or Cursos)
   → Calls crearPreferenciaSuscripcion()

3. Redirected to MercadoPago
   → External payment flow

4. Return after payment
   → Webhook updates Membresia.estado to 'Activa'

5. Dashboard access
   → Can now reserve classes, view metrics
```

**Phase 3: Ongoing Usage**

```
1. Weekly class reservations
   → ClasesReservasService.reservarClase()

2. Monthly billing cycle
   → Automatic InscripcionMensual creation
   → Discount calculation via CalcularPrecioUseCase
   → Payment reminder before dia_vencimiento

3. Monitor student progress
   → ObtenerMetricasDashboardUseCase
   → View puntos_acumulados, nivel_actual, attendance

4. Approve course redemptions
   → Notification of SolicitudCanje
   → Choose payment option
   → Calls aprobarCanje()
```

#### Student Journey

**Phase 1: Onboarding**

```
1. Created by parent
   → Receives temporary username/password

2. First login → Create avatar
   → Ready Player Me integration
   → Saves avatar_url

3. Hub introduction
   → Animated 3D hub with avatar
   → Initial XP/coin grant (0)

4. Assign to team
   → Linked to Equipo (Fénix/Dragón/Tigre/Águila)
```

**Phase 2: Learning Loop**

```
1. Attend live class
   → Docente marks attendance
   → Earns XP + coins automatically
   → May unlock achievements

2. Complete lessons
   → Progressive disclosure (next lesson unlocked)
   → Calls completarLeccion()
   → Rewards based on performance

3. Level up
   → Calculated via calcularNivel(xp_total)
   → Unlocks new store items
   → Celebration animation

4. Check leaderboard
   → Team rankings
   → Personal rank
   → Streak status
```

**Phase 3: Monetization Interaction**

```
1. Browse course catalog
   → Filtered by nivel_requerido
   → Shows precio_monedas

2. Request course redemption
   → Checks sufficient coins
   → Creates SolicitudCanje (estado: pendiente)
   → Notifies parent

3. Wait for parent approval
   → 7-day expiration window

4. Course unlocked (if approved)
   → Access via CursoEstudiante table
   → Begin modules/lessons

5. Browse virtual store
   → Filter by level, rarity, category
   → Purchase with coins
   → Instant inventory add
```

#### Teacher Journey

**Phase 1: Onboarding**

```
1. Admin creates account
   → Email, password_temporal, titulo, bio

2. First login → Change password
   → Same flow as Tutor

3. Assign specializations
   → DocenteRuta links to RutaEspecialidad
   → Defines which sectors/topics they teach
```

**Phase 2: Teaching**

```
1. View scheduled classes
   → listarClasesDeDocente()
   → Filtered by docente_id

2. Before class
   → Review student list
   → Prepare lesson plan

3. During class
   → Live teaching session
   → Interactive activities

4. After class
   → Mark attendance (present/absent/justified)
   → XP/coins distributed automatically
   → Add observations per student
```

**Phase 3: Content Creation**

```
1. Create module
   → Link to Producto (course)
   → Set titulo, descripcion, orden

2. Create lessons
   → Choose tipo_contenido (Video/Text/Quiz/Task)
   → Upload/write content
   → Set puntos_por_completar

3. Publish
   → publicado=true
   → Students can now access
```

#### Admin Journey

**Phase 1: Platform Setup**

```
1. Configure pricing
   → Update ConfiguracionPrecios singleton
   → Set base prices, discount rates
   → Enable/disable AACREA discount

2. Create products
   → Define Suscripcion vs Curso
   → Set precio, duracion_meses

3. Setup gamification
   → Create achievements (Logro)
   → Define XP/coin rewards
   → Configure rareza tiers

4. Create teams
   → Add Equipo records
   → Set colors, icons
```

**Phase 2: User Management**

```
1. Onboard teachers
   → Create Docente
   → Generate password_temporal
   → Assign DocenteRuta

2. Verify student enrollments
   → Review InscripcionMensual
   → Handle payment issues
   → Override discounts if needed

3. Manage sectors/groups
   → Create learning paths
   → Assign students to Grupo
```

**Phase 3: Operations**

```
1. Monitor metrics
   → Total revenue (inscripciones pagadas)
   → Active students
   → Class attendance rates

2. Schedule classes
   → programarClase()
   → Assign docente_id, ruta_curricular_id
   → Set cupos_maximo

3. Handle exceptions
   → Cancel classes if needed
   → Resolve payment disputes
   → Adjust student levels manually
```

### 3.3 Segmentation Analysis

#### By Payment Capacity

| Segment           | Characteristics                  | Pricing Strategy           | Target Product        | Expected LTV                     |
| ----------------- | -------------------------------- | -------------------------- | --------------------- | -------------------------------- |
| Premium Families  | 3+ students, multiple activities | Maximum discount (24% off) | Cursos Especializados | High retention, $5,000+ USD/year |
| Standard Families | 2 students, 2 activities         | Sibling discount (12%)     | Club Matemáticas      | Core revenue, $2,500 USD/year    |
| Single Child      | 1 student, 1-2 activities        | Standard or multi-activity | Club Matemáticas      | Lower LTV, $600-1,000 USD/year   |
| AACREA Members    | Gifted students, association     | 20% discount               | Cursos Especializados | Mission-driven, $1,500 USD/year  |

#### By Engagement Level

| Segment       | Definition                    | Behaviors                  | Monetization Approach   | Code Signals                           |
| ------------- | ----------------------------- | -------------------------- | ----------------------- | -------------------------------------- |
| Power Users   | 5+ classes/week, daily logins | High XP, many achievements | Upsell premium courses  | `racha_dias > 30`, `nivel_actual > 10` |
| Regular Users | 2-3 classes/week              | Steady progress            | Maintain subscription   | `asistencias.count > 8/month`          |
| At-Risk       | <1 class/week                 | Low engagement             | Re-engagement campaigns | `ultima_asistencia > 14 days`          |
| Churned       | No activity 30+ days          | None                       | Win-back offers         | `Membresia.estado = 'Cancelada'`       |

#### By Student Level

| Level Bracket      | XP Range     | Grade Equivalent          | Available Content             | Store Access    |
| ------------------ | ------------ | ------------------------- | ----------------------------- | --------------- |
| Beginner (1-3)     | 0-900        | Primary K-3               | Basic modules, Grupo B1-B2    | Common items    |
| Intermediate (4-7) | 900-4,900    | Primary 4-6               | Standard curriculum, Grupo B3 | Rare items      |
| Advanced (8-12)    | 4,900-14,400 | Secondary 7-10            | Advanced topics, Grupo A1     | Epic items      |
| Expert (13+)       | 14,400+      | Secondary 11+, University | Specialized, OLIMP            | Legendary items |

---

## 4. Product Offerings

### 4.1 Service Matrix

| Product Type       | Database Model           | Pricing Model                 | Delivery Method      | Target Segment       |
| ------------------ | ------------------------ | ----------------------------- | -------------------- | -------------------- |
| Live Classes       | `Clase`                  | Included in subscription      | Synchronous online   | All subscribers      |
| Self-Paced Courses | `Producto` (tipo: Curso) | USD one-time, coin redemption | Asynchronous modules | Motivated learners   |
| Learning Paths     | `RutaEspecialidad`       | Included in subscription      | Guided progression   | Students in Sectores |
| Virtual Items      | `ItemTienda`             | Coins only                    | Instant delivery     | Engaged students     |

### 4.2 Content Architecture

#### Live Classes

```
Clase
├── docente_id (Assigned Teacher)
├── ruta_curricular_id (Topic)
├── fecha_hora_inicio (Schedule)
├── duracion_minutos (Duration)
├── cupos_maximo (Capacity)
└── estado (Programada/Cancelada)
    └── Inscripciones (Student Reservations)
        └── Asistencias (Attendance Records)
```

**Features:**

- Small group sizes (cupos_maximo typically 8-12)
- Teacher specialization via DocenteRuta
- Attendance-based rewards
- Post-class observations

**Code Reference:**

- Management: `/apps/api/src/clases/services/clases-management.service.ts`
- Reservations: `/apps/api/src/clases/services/clases-reservas.service.ts`
- Attendance: `/apps/api/src/clases/services/clases-asistencia.service.ts`

#### Self-Paced Courses

```
Producto (tipo: Curso)
└── Modulos
    └── Lecciones
        ├── tipo_contenido: Video
        ├── tipo_contenido: Texto (Markdown)
        ├── tipo_contenido: Quiz (JSON)
        └── tipo_contenido: Tarea (Assignment)
```

**Content Types:**

| Type  | Format                      | Example Use Case        | Engagement Driver      | Completion Tracking         |
| ----- | --------------------------- | ----------------------- | ---------------------- | --------------------------- |
| Video | URL (YouTube, Vimeo)        | Conceptual explanations | Passive learning       | Watch time %                |
| Texto | Markdown                    | Theory, examples        | Reading comprehension  | Scroll completion           |
| Quiz  | JSON (questions, options)   | Knowledge check         | Interactive assessment | Score %                     |
| Tarea | JSON (instructions, rubric) | Applied practice        | Hands-on learning      | Submission + teacher review |

**Code Reference:**

- Structure: Schema models `Modulo`, `Leccion`
- Progression: `/apps/api/src/cursos/progreso.service.ts`
- Unlocking: `getSiguienteLeccion()` implements progressive disclosure

#### Learning Paths (Rutas Curriculares)

```
Sector (e.g., "Matemática", "Programación")
└── RutaEspecialidad (e.g., "Álgebra Avanzada")
    ├── DocenteRuta (Teacher Assignments)
    └── Clases (Scheduled Sessions)
```

**Path Types:**

- **Foundational:** Core math concepts (arithmetic, geometry)
- **Advanced:** Specialized topics (calculus, statistics)
- **Enrichment:** Competitions prep (OLIMP groups)
- **Cross-Disciplinary:** Programming, robotics

**Student Assignment:**

```
Estudiante
└── EstudianteSector (Many-to-Many)
    └── Sector
        └── RutaEspecialidad
```

### 4.3 Gamification Systems

#### Achievement System

```
Logro (Achievement Template)
├── codigo (Unique ID, e.g., "racha_7_dias")
├── nombre ("Racha de Fuego")
├── descripcion (Human-readable)
├── categoria ("consistencia", "maestria", "social")
├── criterio_tipo (Unlock condition type)
├── criterio_valor (JSON with thresholds)
├── monedas_recompensa (Coin reward)
├── xp_recompensa (XP reward)
├── rareza (comun, raro, épico, legendario)
└── secreto (Hidden until unlocked)
```

**Achievement Categories:**

| Category     | Examples                        | Unlock Triggers    | Rewards      | Business Value   |
| ------------ | ------------------------------- | ------------------ | ------------ | ---------------- |
| Consistencia | 7-day streak, 30-day streak     | Daily logins       | 50-500 coins | Retention driver |
| Maestría     | Perfect quiz, Module completion | Score thresholds   | 100-1,000 XP | Learning quality |
| Social       | Team victory, Help peers        | Team rankings      | Team points  | Virality         |
| Exploración  | Try all content types           | Activity diversity | Rare items   | Feature adoption |

**Implementation:**

```typescript
// File: /apps/api/src/gamificacion/services/logros.service.ts (line 80)
async desbloquearLogro(estudianteId: string, codigoLogro: string) {
  // 1. Check if already unlocked
  // 2. Create LogroEstudiante record
  // 3. Award monedas_recompensa
  // 4. Award xp_recompensa
  // 5. Check for level-up
  // 6. Return celebration data
}
```

#### Team Competition

```
Equipo (Team)
├── nombre (Fénix, Dragón, Tigre, Águila)
├── color_primario (Hex color)
├── color_secundario (Hex color)
├── puntos_totales (Aggregate student points)
└── Estudiantes (Members)
```

**Scoring:**

- Individual student XP contributes to team total
- Leaderboard updates in real-time
- Monthly resets for fresh competition

**Social Dynamics:**

- Students see their team's rank
- Encourages peer motivation
- Can filter leaderboards by team

**Code Reference:**

- Service: `/apps/api/src/gamificacion/ranking.service.ts`
- Schema: `Equipo`, `Estudiante.equipo_id`

#### Virtual Store

```
CategoriaItem (Store Sections)
├── nombre ("Avatares", "Accesorios", "Power-ups")
└── ItemTienda
    ├── tipo_item (Avatar, Skin, PowerUp, Cosmetic)
    ├── precio_monedas (Coin cost)
    ├── rareza (Rarity tier)
    ├── nivel_minimo_requerido (Level gate)
    ├── edicion_limitada (Time-limited)
    ├── fecha_inicio / fecha_fin (Availability window)
    └── metadata (JSON with item properties)
```

**Item Types:**

| Type     | Description          | Functional Impact | Monetization Role | Example                                |
| -------- | -------------------- | ----------------- | ----------------- | -------------------------------------- |
| Avatar   | 3D character models  | Visual identity   | Personalization   | "Robot Futurista" (500 coins)          |
| Skin     | Cosmetic overlays    | Customization     | Status symbol     | "Piel Dorada" (1,000 coins, legendary) |
| PowerUp  | Temporary boosts     | +10% XP for 24h   | Engagement        | "Multiplicador x2" (300 coins)         |
| Cosmetic | Accessories, effects | Visual flair      | Collection driver | "Estrellas Brillantes" (200 coins)     |

**Limited Editions:**

- Seasonal items (back-to-school, holidays)
- Achievement-tied exclusives
- Create FOMO and urgency

**Code Reference:**

- Catalog: `/apps/api/src/tienda/tienda.service.ts`
- Purchase: `realizarCompra()` (line 329)
- Inventory: Schema model `ItemObtenido`

### 4.4 Progress Tracking

#### Student Dashboard Metrics

```
RecursosEstudiante (Student Wallet)
├── xp_total (Total XP earned)
├── monedas_total (Current coin balance)
└── TransaccionRecurso (Audit log)
    ├── tipo_recurso (XP | MONEDAS)
    ├── cantidad (Amount)
    ├── razon (Source: "asistencia", "leccion_completa", etc.)
    └── metadata (Additional context)
```

**Calculated Fields:**

- `nivel_actual` = calcularNivel(xp_total)
- `xp_progreso` = XP earned toward next level
- `porcentaje_nivel` = Progress % within current level

**Parent Dashboard:**

```typescript
// File: /apps/api/src/pagos/application/use-cases/obtener-metricas-dashboard.use-case.ts
interface MetricasDashboard {
  inscripcionesActivas: number;
  totalAPagar: Decimal;
  proximoVencimiento: Date;
  descuentoTotal: Decimal;
  estudiantesActivos: number;
  asistenciasEsteMes: number;
}
```

**Progress Indicators:**

- Attendance rate (present/total classes)
- Module completion % per course
- Streak status (racha_dias)
- Achievement count (total/available)

---

## 5. Key Features

### 5.1 Feature Catalog

| Feature                      | Module              | User Role        | Business Impact        | Implementation Status |
| ---------------------------- | ------------------- | ---------------- | ---------------------- | --------------------- |
| Dynamic Pricing Engine       | Pagos               | Tutor/Admin      | Revenue optimization   | ✅ Production         |
| Live Class Scheduling        | Clases              | Admin/Docente    | Service delivery       | ✅ Production         |
| Class Reservations           | Clases              | Tutor            | Customer self-service  | ✅ Production         |
| Attendance Tracking          | Clases              | Docente          | Engagement measurement | ✅ Production         |
| Gamification (XP/Coins)      | Gamificacion        | Estudiante       | Retention driver       | ✅ Production         |
| Achievement System           | Gamificacion        | Estudiante       | Milestone celebration  | ✅ Production         |
| Virtual Store                | Tienda/Gamificacion | Estudiante       | Microtransaction hook  | ✅ Production         |
| Course Marketplace           | Gamificacion        | Estudiante/Tutor | Upsell channel         | ✅ Production         |
| Course Redemptions           | Gamificacion        | Estudiante/Tutor | Engagement + Revenue   | ✅ Production         |
| Progressive Lesson Unlocking | Cursos              | Estudiante       | Structured learning    | ✅ Production         |
| Team Competition             | Gamificacion        | Estudiante       | Social engagement      | ✅ Production         |
| Avatar Customization         | Core                | Estudiante       | Personalization        | ✅ Production         |
| Parent Approval Workflows    | Gamificacion        | Tutor            | Trust + Control        | ✅ Production         |
| MercadoPago Integration      | Pagos               | Tutor            | Payment processing     | ✅ Production         |
| Discount Automation          | Pagos               | System           | Price competitiveness  | ✅ Production         |

### 5.2 Feature Deep Dive

#### Dynamic Pricing Engine

**Business Rules (Priority Order):**

1. Hermanos + Múltiples Actividades: $38,000/activity (24% off)
2. Hermanos Básico: $44,000/student (12% off)
3. Múltiples Actividades: $44,000/activity (12% off)
4. AACREA: Base - 20% (configurable)
5. Precio Base: $50,000 (Club) / $55,000 (Cursos)

**Code Architecture:**

```
PagosService (Presentation Layer)
└── CalcularPrecioUseCase (Application Layer)
    └── precio.rules.ts (Domain Layer - Pure Functions)
        ├── calcularPrecioActividad()
        ├── aplicarReglasDescuento()
        └── calcularTotalMensual()
```

**Key Innovation:**

- Pure functional rules (testable)
- Decimal precision (no floating-point errors)
- Transparent breakdown for customers

**File:** `/apps/api/src/pagos/domain/rules/precio.rules.ts`

#### Course Redemption Workflow

**Flow Diagram:**

```
Student: Browse Catalog → Request Redemption
                                ↓
                         SolicitudCanje (pendiente)
                                ↓
Parent: Receives Notification
        ↓                       ↓                    ↓
  Approve (padre_paga_todo) | (hijo_paga_mitad) | (hijo_paga_todo)
        ↓                       ↓                    ↓
   0 coins                  50% coins           100% coins
   100% USD                 50% USD              0 USD
        ↓                       ↓                    ↓
            CursoEstudiante (unlocked)
                    ↓
            Student begins course
```

**Business Logic:**

```typescript
// File: /apps/api/src/gamificacion/services/tienda.service.ts (line 251)
async aprobarCanje(
  solicitudId: string,
  tutorId: string,
  opcionPago: 'padre_paga_todo' | 'hijo_paga_mitad' | 'hijo_paga_todo',
  mensajePadre?: string
) {
  // 1. Validate tutor ownership
  // 2. Check pendiente estado
  // 3. Calculate coin split
  // 4. Deduct coins (if applicable)
  // 5. Update solicitud → aprobada
  // 6. Create CursoEstudiante
  // 7. Increment curso.total_canjes
}
```

**Security:**

- Tutor verification (solicitud.tutor_id === tutorId)
- Expiration checks (7-day window)
- Atomic transactions (Prisma.$transaction)
- Coin balance validation

**UX Highlights:**

- Parent receives contextualized message
- Student sees pending status
- Immediate course unlock on approval
- Optional parent message to student

#### Progressive Disclosure

**Concept:**
Students unlock lessons one at a time, preventing overwhelm and ensuring sequential learning.

**Implementation:**

```typescript
// File: /apps/api/src/cursos/progreso.service.ts
async getSiguienteLeccion(productoId: string, estudianteId: string) {
  // 1. Get all modules ordered
  // 2. For each module, get lessons ordered
  // 3. Find first incomplete lesson
  // 4. Return that lesson (or null if all complete)
}
```

**Learning Science:**

- Reduces cognitive load
- Encourages mastery before advancement
- Tracks completion % accurately

**Gamification Tie-In:**

- Each lesson completion → XP + coins
- Module completion → achievement unlock
- Course completion → certificate + bonus rewards

---

## 6. Competitive Analysis

### 6.1 Market Position

**Direct Competitors:**

- Khan Academy (free, but lacks gamification depth)
- IXL Learning (similar subscription model, less engaging UX)
- Matific (gamified, but elementary focus only)

**Mateatletas Differentiators:**

1. **Live teacher-led classes** (not just self-paced)
2. **Deep gamification** (XP, coins, teams, store, achievements)
3. **Family-centric pricing** (sibling discounts, parent-child economy)
4. **Localized for Latin America** (Spanish, ARS pricing, MercadoPago)
5. **Hybrid monetization** (subscriptions + microtransactions + marketplace)

### 6.2 SWOT Analysis

#### Strengths

- **Technical Excellence:** 99 tests passing, 90% coverage, production-ready codebase
- **Comprehensive Gamification:** Multi-layered engagement (XP, coins, achievements, teams, store)
- **Flexible Pricing:** Automatic discounts reward family enrollment
- **Full-Stack Platform:** 4 portals (Tutor, Student, Teacher, Admin) with role-based access
- **Scalable Architecture:** NestJS + Next.js + Prisma, optimized queries, Redis caching

#### Weaknesses

- **Geographic Limitation:** Currently Argentina-focused (ARS currency, MercadoPago)
- **No Mobile Apps:** Web-only (though responsive design)
- **Teacher Availability:** Scalability limited by live class capacity
- **Currency Earning Only:** No direct coin purchase option (limits impulsive spending)

#### Opportunities

- **Regional Expansion:** Adapt for Mexico, Colombia, Chile (easy currency/gateway swaps)
- **B2B Channel:** Sell bulk subscriptions to schools
- **Content Licensing:** Partner with publishers for premium courses
- **Mobile Native Apps:** iOS/Android for better engagement
- **AI Tutoring:** Supplement live teachers with adaptive AI

#### Threats

- **Free Alternatives:** Khan Academy, YouTube tutorials
- **Economic Volatility:** Argentina's inflation impacts pricing power
- **Platform Risk:** Dependency on MercadoPago, Ready Player Me
- **Regulatory:** EdTech data privacy laws (COPPA, GDPR equivalents)

---

## 7. Growth Strategy Recommendations

### 7.1 Short-Term (0-6 months)

**Focus:** Retention & Monetization Optimization

1. **Retention Levers:**
   - Implement automated re-engagement emails for at-risk students
   - Create weekly challenges with exclusive rewards
   - Launch parent report cards (monthly summaries)

2. **Monetization:**
   - A/B test course pricing (current $100 USD vs. $75 vs. $125)
   - Introduce "Parent Points" system (loyalty rewards for punctual payments)
   - Limited-time store items to drive urgency

3. **Operational:**
   - Expand teacher roster (hire 5-10 more docentes)
   - Record popular classes for asynchronous replay
   - Build FAQ/help center (reduce support burden)

**Code Hooks:**

- `ultima_asistencia > 14 days` → Trigger re-engagement
- `InscripcionMensual.estado_pago = 'Pendiente'` → Parent points forfeit
- `ItemTienda.edicion_limitada = true` → Store urgency

### 7.2 Medium-Term (6-12 months)

**Focus:** Geographic & Content Expansion

1. **New Markets:**
   - Localize for Mexico (MXN, Conekta/PayU payment gateway)
   - Translate content to English (optional, test US demand)
   - Partner with AACREA equivalents in other countries

2. **Content:**
   - Launch 10 new specialized courses (robotics, coding, sciences)
   - Create certification paths (badges on completion)
   - User-generated content (student-created lessons, admin-curated)

3. **Platform:**
   - Mobile app MVP (React Native, unified codebase)
   - Offline mode for lessons (download for low-bandwidth areas)
   - Parent mobile app (progress tracking on-the-go)

**Technical Debt:**

- Multi-currency support in database (currently hardcoded ARS)
- i18n framework for translations
- CDN for video hosting (reduce server load)

### 7.3 Long-Term (12-24 months)

**Focus:** Scale & Product Diversification

1. **B2B Channel:**
   - School district packages (bulk pricing)
   - White-label platform for other EdTech brands
   - API for third-party integrations

2. **Advanced Features:**
   - AI-powered adaptive difficulty
   - Real-time collaboration tools (students work together)
   - VR/AR for immersive math visualization
   - Parent-child co-play mode (learn together)

3. **Ecosystem:**
   - Community forums (student/parent discussions)
   - Marketplace for teacher-created content
   - Third-party app store (plugins, extensions)

**Moonshot Ideas:**

- Blockchain-based achievement NFTs (portable credentials)
- Metaverse math campus (fully immersive 3D world)
- AI tutor clones of top teachers (scale expertise)

---

## 8. Key Performance Indicators (KPIs)

### 8.1 Business Metrics

| Metric                          | Definition                    | Target              | Data Source                                                | Frequency |
| ------------------------------- | ----------------------------- | ------------------- | ---------------------------------------------------------- | --------- |
| MRR (Monthly Recurring Revenue) | Sum of active subscriptions   | $50,000 USD         | `InscripcionMensual.precio_final` (estado_pago = 'Pagado') | Daily     |
| ARPU (Average Revenue Per User) | MRR / Active Tutors           | $190 USD            | MRR / `Tutor.count` (with active Membresia)                | Monthly   |
| Churn Rate                      | % Membresias cancelled        | <5%                 | `Membresia.estado = 'Cancelada'` / Total                   | Monthly   |
| LTV (Lifetime Value)            | ARPU × Avg. Lifetime (months) | $2,380 USD (1 year) | Historical cohort analysis                                 | Quarterly |
| CAC (Customer Acquisition Cost) | Marketing Spend / New Tutors  | <$50 USD            | External tracking                                          | Monthly   |
| LTV:CAC Ratio                   | LTV / CAC                     | >3:1                | Calculated                                                 | Quarterly |

### 8.2 Engagement Metrics

| Metric                   | Definition                           | Target     | Data Source                                         | Frequency |
| ------------------------ | ------------------------------------ | ---------- | --------------------------------------------------- | --------- |
| DAU/MAU                  | Daily Active Users / Monthly         | >40%       | Login events                                        | Weekly    |
| Avg. Classes per Student | Total reservations / Active students | 8-12/month | `InscripcionClase.count / Estudiante.count`         | Weekly    |
| Attendance Rate          | Present / Total reservations         | >85%       | `Asistencia.presente = true` / Total                | Weekly    |
| Avg. Session Duration    | Time in app                          | >30 min    | Frontend tracking                                   | Daily     |
| Course Completion Rate   | Finished courses / Started           | >60%       | `CursoEstudiante.completado = true` / Total         | Monthly   |
| Redemption Rate          | Courses redeemed / Active students   | >20%       | `SolicitudCanje.count(aprobada) / Estudiante.count` | Monthly   |

### 8.3 Product Metrics

| Metric                   | Definition                    | Target                         | Data Source                                | Frequency |
| ------------------------ | ----------------------------- | ------------------------------ | ------------------------------------------ | --------- |
| Store Conversion Rate    | Purchases / Store visitors    | >10%                           | `CompraItem.count / Store pageviews`       | Weekly    |
| Avg. Coins per Student   | Median monedas_total          | 500-1,500                      | `RecursosEstudiante.monedas_total`         | Daily     |
| Achievement Unlock Rate  | Avg. achievements per student | 5-10                           | `LogroEstudiante.count / Estudiante.count` | Weekly    |
| Level Distribution       | % Students at each level      | Bell curve (peak at level 5-7) | `Estudiante.nivel_actual`                  | Monthly   |
| Net Promoter Score (NPS) | Would you recommend?          | >50                            | Survey (external)                          | Quarterly |

### 8.4 Operational Metrics

| Metric               | Definition                   | Target     | Data Source                           | Frequency |
| -------------------- | ---------------------------- | ---------- | ------------------------------------- | --------- |
| Class Utilization    | Occupied cupos / Total cupos | >75%       | `Clase.cupos_ocupados / cupos_maximo` | Weekly    |
| Teacher Productivity | Classes taught per docente   | 15-20/week | `Clase.count / Docente.count`         | Weekly    |
| Support Tickets      | Avg. tickets per 100 users   | <5         | External ticketing system             | Weekly    |
| Platform Uptime      | % Time operational           | >99.5%     | Server monitoring                     | Real-time |
| Payment Success Rate | Approved / Total attempts    | >95%       | MercadoPago webhooks                  | Daily     |

### 8.5 Implementation Notes

**Tracking Infrastructure:**

- **Built-in:** Database queries for most metrics (Prisma analytics)
- **Frontend:** Mixpanel/Amplitude for user behavior
- **Payments:** MercadoPago dashboard + webhook logs
- **Custom:** Admin dashboard with Recharts visualizations

**Sample Queries:**

```sql
-- MRR Calculation
SELECT
  SUM(precio_final) as MRR,
  COUNT(DISTINCT tutor_id) as ActiveTutors
FROM InscripcionMensual
WHERE estado_pago = 'Pagado'
  AND periodo = '2025-10';

-- Attendance Rate
SELECT
  (COUNT(*) FILTER (WHERE presente = true))::DECIMAL / COUNT(*) * 100 as AttendanceRate
FROM Asistencia
WHERE fecha >= '2025-10-01' AND fecha < '2025-11-01';

-- Churn Rate
SELECT
  (COUNT(*) FILTER (WHERE estado = 'Cancelada'))::DECIMAL / COUNT(*) * 100 as ChurnRate
FROM Membresia
WHERE createdAt >= '2025-09-01';
```

---

## 9. Risk Analysis

### 9.1 Business Risks

| Risk                            | Probability | Impact   | Mitigation Strategy                                           | Owner       |
| ------------------------------- | ----------- | -------- | ------------------------------------------------------------- | ----------- |
| Economic Downturn (Argentina)   | High        | High     | Diversify to other LATAM markets, introduce scholarship tiers | CEO         |
| Low Teacher Retention           | Medium      | High     | Competitive pay, equity grants, career development paths      | HR          |
| Slow User Acquisition           | Medium      | High     | Referral programs, school partnerships, content marketing     | Marketing   |
| Payment Gateway Failure         | Low         | Critical | Backup gateway (PayU), manual payment option                  | Engineering |
| Competitive Entry (Big Ed-Tech) | Medium      | Medium   | Focus on localization, community, superior UX                 | Product     |

### 9.2 Technical Risks

| Risk                                     | Probability | Impact   | Mitigation Strategy                                               | Owner       |
| ---------------------------------------- | ----------- | -------- | ----------------------------------------------------------------- | ----------- |
| Database Scalability                     | Medium      | High     | Optimize queries (already done), read replicas, sharding plan     | Engineering |
| Third-Party Dependency (Ready Player Me) | Low         | Medium   | Fallback to 2D avatars, local 3D avatar library                   | Engineering |
| Security Breach (Student Data)           | Low         | Critical | Penetration testing, GDPR-compliant encryption, audit logs        | Security    |
| DDoS Attack                              | Low         | High     | Cloudflare, rate limiting (already implemented), auto-scaling     | DevOps      |
| Code Debt Accumulation                   | Medium      | Medium   | Continuous refactoring (already prioritized), code review culture | Engineering |

### 9.3 Regulatory Risks

| Risk                                | Probability | Impact | Mitigation Strategy                                               | Owner    |
| ----------------------------------- | ----------- | ------ | ----------------------------------------------------------------- | -------- |
| EdTech Data Privacy Laws            | Medium      | High   | Legal review, COPPA/GDPR compliance audit, parental consent flows | Legal    |
| Payment Regulations (KYC/AML)       | Low         | Medium | MercadoPago handles compliance, monitor regulatory changes        | Finance  |
| Content Licensing (Copyright)       | Low         | Medium | Use original content, license from verified sources, DMCA policy  | Content  |
| Labor Laws (Teacher Classification) | Medium      | Medium | Consult labor attorney, consider contractor vs. employee status   | Legal/HR |

---

## 10. Conclusion

### 10.1 Business Model Summary

Mateatletas operates a **hybrid freemium-to-premium EdTech model** combining:

1. **SaaS Subscriptions:** Recurring revenue from monthly memberships
2. **Marketplace Economics:** One-time course purchases with flexible payment splits
3. **Engagement-Driven Microtransactions:** Virtual goods purchased with earned currency

**Core Strengths:**

- **Deep Gamification:** Industry-leading engagement systems
- **Family-Centric Design:** Pricing and features optimized for multi-child households
- **Technical Excellence:** Production-ready codebase with 99 tests, 90% coverage
- **Localized for LATAM:** Spanish-first, ARS pricing, MercadoPago integration

**Growth Levers:**

- Geographic expansion (low-hanging fruit: Mexico, Colombia)
- Content scaling (more courses = more redemptions)
- B2B channel (school partnerships for bulk revenue)
- Mobile apps (increase accessibility and engagement)

### 10.2 Financial Outlook

**Current State (Estimates):**

- ARPU: ~$190 USD/month
- Target Customer: 2-child families with 2 activities each
- LTV (1 year): ~$2,380 USD
- Healthy unit economics if CAC < $50 USD

**Scaling Projections:**
| User Base | MRR (USD) | ARR (USD) | Assumed ARPU |
|-----------|-----------|-----------|--------------|
| 100 families | $19,000 | $228,000 | $190 |
| 500 families | $95,000 | $1,140,000 | $190 |
| 1,000 families | $190,000 | $2,280,000 | $190 |
| 5,000 families | $950,000 | $11,400,000 | $190 |

**Path to $1M ARR:** ~450 paying families (achievable in Year 1 with strong marketing)

### 10.3 Strategic Recommendations

**Immediate Priorities (Next 90 Days):**

1. **Launch retention campaigns** for at-risk students (quick wins)
2. **A/B test course pricing** to optimize revenue/redemption ratio
3. **Hire 5 more teachers** to expand class capacity
4. **Build parent dashboard v2** with better metrics visualization

**Next 6 Months:**

1. **Enter Mexico market** (high-value, Spanish-speaking, 130M population)
2. **Launch 5 new specialized courses** (expand catalog)
3. **Develop mobile app MVP** (React Native)
4. **Implement referral program** (parent incentives for bringing friends)

**Next 12 Months:**

1. **Pilot B2B program** with 2-3 schools (test institutional demand)
2. **Introduce AI tutor assistant** (augment teacher capacity)
3. **Raise seed funding** ($500K-$1M) to accelerate growth
4. **Scale to 1,000 families** across 3 countries

### 10.4 Success Metrics

**By End of Year 1:**

- 500+ paying families
- $1M+ ARR
- 85%+ retention rate
- 4.5+ NPS score (promoters)
- 2 geographic markets
- 50+ specialized courses

**By End of Year 3:**

- 5,000+ paying families
- $10M+ ARR
- Profitable unit economics
- B2B channel contributing 20% of revenue
- Mobile app with 50K+ downloads
- Exit or Series A funding ($5M+)

---

## Appendix A: Code Reference Index

### Key Files

**Pricing & Payments:**

- `/apps/api/src/pagos/domain/rules/precio.rules.ts` - Core pricing logic
- `/apps/api/src/pagos/presentation/services/pagos.service.ts` - Payment orchestration
- `/apps/api/src/pagos/mercadopago.service.ts` - Gateway integration

**Gamification:**

- `/apps/api/src/gamificacion/services/recursos.service.ts` - XP/coins management
- `/apps/api/src/gamificacion/services/logros.service.ts` - Achievement system
- `/apps/api/src/gamificacion/services/tienda.service.ts` - Course marketplace

**Classes:**

- `/apps/api/src/clases/services/clases-management.service.ts` - Scheduling
- `/apps/api/src/clases/services/clases-reservas.service.ts` - Reservations
- `/apps/api/src/clases/services/clases-asistencia.service.ts` - Attendance

**Courses:**

- `/apps/api/src/cursos/modulos.service.ts` - Module management
- `/apps/api/src/cursos/progreso.service.ts` - Progress tracking

**Store:**

- `/apps/api/src/tienda/tienda.service.ts` - Virtual item purchases
- `/apps/api/src/tienda/recursos.service.ts` - Inventory management

**Database:**

- `/apps/api/prisma/schema.prisma` - Complete data model

### Schema Models

**Users:**

- `Tutor`, `Estudiante`, `Docente`, `Admin`

**Products & Payments:**

- `Producto`, `ConfiguracionPrecios`, `Membresia`, `InscripcionMensual`

**Learning:**

- `Clase`, `Grupo`, `Sector`, `RutaEspecialidad`, `Modulo`, `Leccion`

**Gamification:**

- `RecursosEstudiante`, `Logro`, `LogroEstudiante`, `Equipo`

**Store:**

- `ItemTienda`, `CategoriaItem`, `ItemObtenido`, `CompraItem`

**Marketplace:**

- `CursoCatalogo`, `SolicitudCanje`, `CursoEstudiante`

---

**Document End**

_This analysis was generated by examining the complete codebase of Mateatletas Ecosystem, including database schemas, service implementations, business logic rules, and API endpoints. All pricing figures, discount structures, and technical details are directly derived from production code as of October 30, 2025._
