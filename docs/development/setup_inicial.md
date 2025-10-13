# Setup Inicial - Mateatletas

## Propósito
Configuración inicial del sistema para preparar la base de datos con datos esenciales y crear el usuario administrador. Este documento explica cómo ejecutar los seeds necesarios antes del primer despliegue.

---

## 1. Variables de Entorno Requeridas

### Backend (NestJS)

Crear archivo `.env` en la carpeta `apps/api/`:

```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/mateatletas?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN="TEST-123456789..." # Sandbox para desarrollo
MERCADOPAGO_PUBLIC_KEY="TEST-abc..."
MERCADOPAGO_WEBHOOK_SECRET="optional-webhook-secret"
BASE_URL="http://localhost:3001" # URL del backend para webhooks

# OpenAI (para IA Tutor y sugerencias admin)
OPENAI_API_KEY="sk-..."

# Frontend URL (para redirects de pago)
FRONTEND_URL="http://localhost:3000"

# Admin inicial
ADMIN_EMAIL="admin@mateatletas.com"
ADMIN_PASSWORD="Admin123!ChangeMe"
ADMIN_NOMBRE="Administrador"
ADMIN_APELLIDO="Sistema"

# Emails (opcional para futuras notificaciones)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="..."
# SMTP_PASSWORD="..."
```

### Frontend (Next.js)

Crear archivo `.env.local` en la carpeta `apps/web/`:

```bash
# API Backend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# MercadoPago (para frontend checkout)
NEXT_PUBLIC_MP_PUBLIC_KEY="TEST-abc..."

# Modo desarrollo
NODE_ENV="development"
```

---

## 2. Configuración de MercadoPago para Desarrollo

### Obtener credenciales de prueba

1. Ir a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Crear cuenta de desarrollador
3. Ir a **Tus aplicaciones** → Crear aplicación
4. Copiar:
   - `Access Token` (para backend) → `MERCADOPAGO_ACCESS_TOKEN`
   - `Public Key` (para frontend) → `NEXT_PUBLIC_MP_PUBLIC_KEY`

### Configurar Webhooks localmente

Para recibir webhooks en desarrollo local, usar **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer el puerto del backend (3001)
ngrok http 3001

# Copiar la URL pública (ej: https://abc123.ngrok.io)
# Actualizar .env:
BASE_URL="https://abc123.ngrok.io"
```

Luego configurar la URL de notificación en MercadoPago:
- Panel → Aplicación → Webhooks
- URL: `https://abc123.ngrok.io/api/pagos/webhook`

---

## 3. Ejecutar Migraciones y Seeds

### Paso 1: Migrar Base de Datos

```bash
cd apps/api

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name initial_setup

# Verificar que se crearon todas las tablas
npx prisma studio
```

### Paso 2: Ejecutar Seeds

Crear archivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Crear usuario Admin
  await seedAdmin();

  // 2. Crear Rutas Curriculares
  await seedRutasCurriculares();

  // 3. Crear Productos iniciales
  await seedProductos();

  // 4. Crear Logros iniciales
  await seedLogros();

  // 5. Crear Equipos iniciales
  await seedEquipos();

  console.log('✅ Seed completado exitosamente');
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mateatletas.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  // Verificar si ya existe
  const exists = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (exists) {
    console.log('⚠️  Admin ya existe, saltando...');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.create({
    data: {
      nombre: process.env.ADMIN_NOMBRE || 'Administrador',
      apellido: process.env.ADMIN_APELLIDO || 'Sistema',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin'
    }
  });

  console.log(`✅ Admin creado: ${adminEmail}`);
}

async function seedRutasCurriculares() {
  const rutas = [
    { nombre: 'Lógica' },
    { nombre: 'Álgebra' },
    { nombre: 'Geometría' },
    { nombre: 'Aritmética' },
    { nombre: 'Probabilidad y Estadística' },
    { nombre: 'Cálculo' },
  ];

  for (const ruta of rutas) {
    await prisma.rutaCurricular.upsert({
      where: { nombre: ruta.nombre },
      update: {},
      create: ruta
    });
  }

  console.log(`✅ ${rutas.length} Rutas Curriculares creadas`);
}

async function seedProductos() {
  const productos = [
    {
      nombre: 'Membresía Mensual',
      descripcion: 'Acceso ilimitado a todas las clases en vivo durante un mes',
      precio: 4999.99, // $4999.99 ARS
      tipo: 'Suscripcion',
    },
    {
      nombre: 'Curso Intensivo de Olimpíadas',
      descripcion: 'Preparación especializada para olimpíadas matemáticas (8 semanas)',
      precio: 15999.99,
      tipo: 'Curso',
      fechaInicio: new Date('2025-02-01'),
      fechaFin: new Date('2025-03-30'),
      cupoMaximo: 20
    }
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { nombre: producto.nombre },
      update: {},
      create: producto
    });
  }

  console.log(`✅ ${productos.length} Productos creados`);
}

async function seedLogros() {
  const logros = [
    {
      nombre: "Primer Paso",
      descripcion: "Obtén tus primeros 10 puntos",
      icono: "🌟",
      puntosRequeridos: 10,
      categoria: "Participacion"
    },
    {
      nombre: "Participante Activo",
      descripcion: "Acumula 50 puntos",
      icono: "⭐",
      puntosRequeridos: 50,
      categoria: "Participacion"
    },
    {
      nombre: "Matemático Junior",
      descripcion: "Alcanza los 100 puntos",
      icono: "🎯",
      puntosRequeridos: 100,
      categoria: "Desafios"
    },
    {
      nombre: "Asistencia Perfecta",
      descripcion: "Asiste a 10 clases seguidas",
      icono: "📚",
      puntosRequeridos: 150,
      categoria: "Asistencia"
    },
    {
      nombre: "Genio en Entrenamiento",
      descripcion: "Consigue 200 puntos",
      icono: "🧠",
      puntosRequeridos: 200,
      categoria: "Desafios"
    },
    {
      nombre: "Maestro de la Lógica",
      descripcion: "Alcanza los 500 puntos",
      icono: "🏆",
      puntosRequeridos: 500,
      categoria: "Desafios"
    },
    {
      nombre: "Leyenda Matemática",
      descripcion: "Supera los 1000 puntos",
      icono: "👑",
      puntosRequeridos: 1000,
      categoria: "Especial"
    }
  ];

  for (const logro of logros) {
    await prisma.logro.upsert({
      where: { nombre: logro.nombre },
      update: {},
      create: logro
    });
  }

  console.log(`✅ ${logros.length} Logros creados`);
}

async function seedEquipos() {
  const equipos = [
    { nombre: 'Los Algoritmos', color: '#3B82F6' },   // Azul
    { nombre: 'Los Fractales', color: '#10B981' },     // Verde
    { nombre: 'Los Teoremas', color: '#F59E0B' },      // Naranja
    { nombre: 'Los Números Primos', color: '#EF4444' }, // Rojo
    { nombre: 'Las Ecuaciones', color: '#8B5CF6' },    // Púrpura
  ];

  for (const equipo of equipos) {
    await prisma.equipo.upsert({
      where: { nombre: equipo.nombre },
      update: {},
      create: equipo
    });
  }

  console.log(`✅ ${equipos.length} Equipos creados`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Configurar script en package.json

Agregar en `apps/api/package.json`:

```json
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Ejecutar el seed

```bash
npm run seed

# O automáticamente después de migrar:
npx prisma migrate dev
```

---

## 4. Modelo Admin en Prisma

Agregar modelo Admin al schema (faltaba en los slices):

```prisma
// prisma/schema.prisma

model Admin {
  id        Int      @id @default(autoincrement())
  nombre    String
  apellido  String
  email     String   @unique
  password  String
  role      String   @default("Admin") // Siempre "Admin"
  creadoEn  DateTime @default(now())
  actualizadoEn DateTime @updatedAt
}
```

---

## 5. Login del Admin

### Backend: Modificar AuthService

Agregar búsqueda de Admin en `validateUser`:

```typescript
// auth.service.ts
async validateUser(email: string, password: string) {
  // 1. Buscar en Tutor
  let user = await this.prisma.tutor.findUnique({ where: { email } });
  let role = 'Tutor';

  // 2. Si no existe, buscar en Docente
  if (!user) {
    user = await this.prisma.docente.findUnique({ where: { email } });
    role = 'Docente';
  }

  // 3. Si no existe, buscar en Estudiante
  if (!user) {
    user = await this.prisma.estudiante.findUnique({ where: { email } });
    role = 'Estudiante';
  }

  // 4. Si no existe, buscar en Admin ⬅️ NUEVO
  if (!user) {
    user = await this.prisma.admin.findUnique({ where: { email } });
    role = 'Admin';
  }

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    role
  };
}
```

---

## 6. Verificación Post-Setup

### Checklist

- [ ] Base de datos migrada correctamente
- [ ] Admin creado (verificar con `npx prisma studio`)
- [ ] 6 Rutas Curriculares creadas
- [ ] 2 Productos creados (Membresía + Curso ejemplo)
- [ ] 7 Logros creados
- [ ] 5 Equipos creados
- [ ] Variables de entorno configuradas
- [ ] Backend inicia sin errores: `npm run dev`
- [ ] Frontend inicia sin errores: `cd ../web && npm run dev`

### Testing del Admin

```bash
# 1. Login como Admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mateatletas.com",
    "password": "Admin123!ChangeMe"
  }'

# Respuesta esperada:
# {
#   "accessToken": "eyJhbGc...",
#   "user": {
#     "id": 1,
#     "email": "admin@mateatletas.com",
#     "role": "Admin"
#   }
# }

# 2. Acceder a endpoint protegido (Admin)
curl http://localhost:3001/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGc..."

# Debería retornar datos del dashboard
```

---

## 7. Datos de Prueba (Opcional)

Para facilitar testing, crear algunos datos de prueba:

```typescript
// prisma/seed-test-data.ts
async function seedTestData(prisma: PrismaClient) {
  // 1. Crear un Tutor de prueba
  const tutor = await prisma.tutor.create({
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@example.com',
      password: await bcrypt.hash('password123', 10),
      telefono: '+5491112345678'
    }
  });

  // 2. Crear Estudiantes hijos del tutor
  const estudiante1 = await prisma.estudiante.create({
    data: {
      nombre: 'María',
      apellido: 'Pérez',
      email: 'maria.perez@example.com',
      password: await bcrypt.hash('password123', 10),
      fechaNacimiento: new Date('2012-05-15'),
      tutorId: tutor.id,
      equipoId: 1 // Los Algoritmos
    }
  });

  const estudiante2 = await prisma.estudiante.create({
    data: {
      nombre: 'Pedro',
      apellido: 'Pérez',
      fechaNacimiento: new Date('2014-08-20'),
      tutorId: tutor.id,
      equipoId: 2 // Los Fractales
    }
  });

  // 3. Crear Membresía activa para el tutor
  await prisma.membresia.create({
    data: {
      tutorId: tutor.id,
      productoId: 1, // Membresía Mensual
      estado: 'Activa',
      fechaInicio: new Date(),
      fechaProximoPago: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 días
    }
  });

  // 4. Crear un Docente
  const docente = await prisma.docente.create({
    data: {
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana.garcia@mateatletas.com',
      password: await bcrypt.hash('password123', 10),
      titulo: 'Profesora de Matemática'
    }
  });

  // 5. Crear una Clase
  const clase = await prisma.clase.create({
    data: {
      rutaCurricularId: 1, // Lógica
      docenteId: docente.id,
      fechaHoraInicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
      duracionMinutos: 60,
      estado: 'Programada',
      cuposMaximo: 10,
      cuposOcupados: 0
    }
  });

  console.log('✅ Datos de prueba creados');
  console.log(`   Tutor: ${tutor.email} / password123`);
  console.log(`   Estudiante: ${estudiante1.email} / password123`);
  console.log(`   Docente: ${docente.email} / password123`);
  console.log(`   Admin: admin@mateatletas.com / Admin123!ChangeMe`);
}
```

Ejecutar:
```bash
npm run seed:test-data
```

---

## 8. Resumen de Credenciales

| Rol | Email | Password | Descripción |
|-----|-------|----------|-------------|
| **Admin** | admin@mateatletas.com | Admin123!ChangeMe | Usuario administrador del sistema |
| Tutor | juan.perez@example.com | password123 | Tutor de prueba con membresía activa |
| Estudiante | maria.perez@example.com | password123 | Estudiante hijo de Juan |
| Docente | ana.garcia@mateatletas.com | password123 | Docente de prueba |

**⚠️ IMPORTANTE**: Cambiar todas las contraseñas en producción.

---

## 9. Comandos Útiles

```bash
# Ver base de datos con interfaz visual
npx prisma studio

# Resetear base de datos (elimina todos los datos)
npx prisma migrate reset

# Generar tipos TypeScript de Prisma
npx prisma generate

# Ver logs de Prisma durante desarrollo
DEBUG=prisma* npm run dev

# Verificar conexión a base de datos
npx prisma db pull
```

---

## 10. Troubleshooting

### Error: "Can't reach database server"
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# O con Docker:
docker ps | grep postgres
```

### Error: "Invalid JWT secret"
```bash
# Generar un secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar el output a JWT_SECRET en .env
```

### Error: "MercadoPago credentials invalid"
```bash
# Verificar que usás credenciales de TEST (sandbox)
# No usar credenciales de producción en desarrollo
```

### Webhooks no llegan en desarrollo local
```bash
# Asegurar que ngrok está corriendo
ngrok http 3001

# Actualizar BASE_URL en .env con la URL de ngrok
# Configurar la URL en el panel de MercadoPago
```

---

## Próximos Pasos

Después del setup inicial:

1. ✅ Acceder a `http://localhost:3000/login`
2. ✅ Login como Admin
3. ✅ Crear Docentes desde `/admin/docentes`
4. ✅ Programar Clases desde `/admin/clases`
5. ✅ Registrar un Tutor de prueba
6. ✅ Comprar Membresía
7. ✅ Reservar Clase
8. ✅ Docente marca Asistencia y otorga Puntos

---

**¡Setup Completo!** 🎉

El sistema ahora tiene todo lo necesario para comenzar a funcionar.
