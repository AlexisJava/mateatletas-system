# Guía de Contribución - Mateatletas

Gracias por tu interés en contribuir a Mateatletas! Esta guía te ayudará a empezar.

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas un
ambiente respetuoso y profesional.

## Cómo Contribuir

### Reportar Bugs

Si encuentras un bug:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es relevante
   - Versión de Node.js y sistema operativo

### Proponer Features

Para proponer nuevas características:

1. Crea un issue con el tag `enhancement`
2. Describe claramente:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas

## Flujo de Trabajo con Git

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/TU-USUARIO/mateatletas.git
cd mateatletas
```

### 2. Configurar Remote

```bash
git remote add upstream https://github.com/REPO-ORIGINAL/mateatletas.git
```

### 3. Crear Branch

Siempre crea un branch desde `develop`:

```bash
git checkout develop
git pull upstream develop
git checkout -b tipo/nombre-descriptivo
```

**Tipos de branches**:

- `feature/` - Nuevas características
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Agregar o modificar tests
- `chore/` - Mantenimiento, dependencias, etc.

**Ejemplos**:

```bash
git checkout -b feature/login-de-tutor
git checkout -b fix/validacion-email
git checkout -b docs/actualizar-readme
```

### 4. Hacer Cambios

Realiza tus cambios siguiendo las guías de estilo del proyecto.

## Convenciones de Commits

Usamos commits semánticos (Conventional Commits):

```
<tipo>: <descripción corta>

<descripción detallada opcional>

<footer opcional>
```

**Tipos**:

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (sin afectar el código)
- `refactor`: Refactorización (sin cambiar funcionalidad)
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento, configuración, dependencias

**Ejemplos**:

```bash
git commit -m "feat: agregar login de tutor"
git commit -m "fix: corregir validación de email en registro"
git commit -m "docs: actualizar guía de instalación en README"
git commit -m "refactor: simplificar lógica de autenticación"
git commit -m "chore: actualizar dependencias de NestJS"
```

## Antes de Hacer Push

Ejecuta estas verificaciones localmente:

```bash
# 1. Verificar tipos
npm run type-check

# 2. Verificar linting
npm run lint

# 3. Formatear código
npm run format

# 4. Ejecutar tests (cuando estén disponibles)
npm run test

# 5. Verificar que el build funciona
npm run build
```

## Crear Pull Request

### 1. Push tu Branch

```bash
git push origin tipo/nombre-descriptivo
```

### 2. Abrir PR en GitHub

- Ve a GitHub y crea un Pull Request
- Base branch: `develop` (NO `main`)
- Completa el template del PR
- Espera review y CI checks

### 3. Code Review

- Responde a comentarios constructivamente
- Realiza cambios solicitados
- Push de cambios adicionales al mismo branch

### 4. Merge

Una vez aprobado y pasando CI, un maintainer mergeará tu PR.

## Estructura de Branches

```
main            # Producción (protegida)
  └─ develop    # Desarrollo (default, protegida)
       ├─ feature/nombre
       ├─ fix/nombre
       └─ refactor/nombre
```

### Protección de Branches

- **main**: Solo merges desde `develop` via PR
- **develop**: PRs requieren:
  - Code review aprobado
  - CI passing
  - Conflictos resueltos

## Guías de Código

### TypeScript

- Usa TypeScript estricto
- Evita `any`, usa tipos específicos
- Documenta funciones complejas
- Usa nombres descriptivos

```typescript
// ❌ Malo
function f(x: any) {
  return x + 1;
}

// ✅ Bueno
/**
 * Incrementa un número en 1
 * @param value - El número a incrementar
 * @returns El número incrementado
 */
function incrementNumber(value: number): number {
  return value + 1;
}
```

### React/Next.js

- Usa componentes funcionales con hooks
- Usa TypeScript para props
- Separa lógica de presentación

```typescript
// ✅ Bueno
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

### NestJS

- Usa decoradores apropiadamente
- Separa lógica en servicios
- Usa DTOs para validación
- Documenta endpoints con comentarios

```typescript
// ✅ Bueno
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }
}
```

### Prisma

- Usa nombres consistentes
- Documenta modelos
- Usa relaciones apropiadamente

```prisma
/// Usuario del sistema
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

## Tests

### Escribir Tests

```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    const user = await service.create({ email: 'test@test.com', name: 'Test' });
    expect(user.email).toBe('test@test.com');
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests en watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Recursos

- [Documentación del Proyecto](./README.md)
- [Guía de Desarrollo](./DEVELOPMENT.md)
- [Configuración de Prisma](./apps/api/PRISMA_SETUP.md)
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)

## ¿Necesitas Ayuda?

- Crea un issue con la etiqueta `question`
- Revisa issues existentes
- Lee la documentación del proyecto

## Agradecimientos

¡Gracias por contribuir a Mateatletas! Cada contribución, grande o pequeña, es valiosa.
