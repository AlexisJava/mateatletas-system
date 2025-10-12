# Prisma Setup - Mateatletas API

Documentación de la configuración de Prisma ORM para la API de Mateatletas.

## Configuración

### Base de datos

PostgreSQL 16 corriendo en Docker en el puerto 5433:

```bash
docker ps | grep postgres
```

### Conexión

Variables de entorno en `.env`:

```env
DATABASE_URL="postgresql://mateatletas:mateatletas123@localhost:5433/mateatletas?schema=public"
```

## Estructura

```
apps/api/
├── prisma/
│   ├── schema.prisma           # Schema de Prisma
│   └── migrations/             # Migraciones aplicadas
│       └── 20251012132133_init/
│           └── migration.sql
└── src/
    └── core/
        └── database/
            ├── prisma.service.ts    # Servicio de Prisma
            └── database.module.ts   # Módulo global de DB
```

## Comandos Útiles

### Migraciones

```bash
# Crear nueva migración (desarrollo)
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes (producción)
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (CUIDADO: borra todos los datos)
npx prisma migrate reset
```

### Cliente Prisma

```bash
# Generar cliente Prisma después de cambios en schema
npx prisma generate

# Regenerar cliente sin migración
npx prisma generate --force
```

### Prisma Studio

```bash
# Abrir interfaz visual de la base de datos
npx prisma studio
```

## Modelo de Ejemplo

Schema actual en `prisma/schema.prisma`:

```prisma
model TestModel {
  id         String   @id @default(uuid())
  name       String
  created_at DateTime @default(now())

  @@map("test_models")
}
```

## Uso en el Código

### Inyectar PrismaService

```typescript
import { PrismaService } from './core/database/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db-test')
  async testDatabase() {
    const count = await this.prisma.testModel.count();
    return { status: 'Database connected', test_models_count: count };
  }
}
```

### Operaciones CRUD

```typescript
// Crear
await this.prisma.testModel.create({
  data: { name: 'Test' },
});

// Leer
const all = await this.prisma.testModel.findMany();
const one = await this.prisma.testModel.findUnique({
  where: { id: 'uuid' },
});

// Actualizar
await this.prisma.testModel.update({
  where: { id: 'uuid' },
  data: { name: 'Updated' },
});

// Eliminar
await this.prisma.testModel.delete({
  where: { id: 'uuid' },
});
```

## Endpoints de Prueba

### Health Check

```bash
GET http://localhost:3001/api/health
```

### DB Test

```bash
GET http://localhost:3001/api/db-test
# Response: {"status":"Database connected","test_models_count":0}
```

## Próximos Pasos

1. Definir modelos de entidades (User, Athlete, Coach, etc.)
2. Crear relaciones entre modelos
3. Implementar seeds para datos de prueba
4. Configurar índices para optimización
5. Implementar soft deletes si es necesario

## Troubleshooting

### Error: Can't reach database server

Verifica que PostgreSQL esté corriendo:

```bash
docker ps | grep postgres
```

Si no está corriendo, inícialo:

```bash
docker start mateatletas-postgres
```

### Error: Schema out of sync

Regenera el cliente:

```bash
npx prisma generate
```

O crea una nueva migración:

```bash
npx prisma migrate dev
```

### Docker PostgreSQL

Crear contenedor (si no existe):

```bash
docker run --name mateatletas-postgres \
  -e POSTGRES_USER=mateatletas \
  -e POSTGRES_PASSWORD=mateatletas123 \
  -e POSTGRES_DB=mateatletas \
  -p 5433:5432 \
  -d postgres:16
```

Detener/Iniciar:

```bash
docker stop mateatletas-postgres
docker start mateatletas-postgres
```

Ver logs:

```bash
docker logs mateatletas-postgres
```
