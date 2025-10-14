# Mateatletas Web App

Aplicación frontend de Mateatletas construida con Next.js 15 y Tailwind CSS v4.

## Tecnologías

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS v4
- **Fuentes**: Lilita One (headings) + Geist Sans (body)

## Design System

### Colores

```css
--color-orange-primary: #ff8c00 --color-blue-primary: #1e90ff --color-yellow-energy: #ffd700
  --color-green-success: #00cc44 --color-red-error: #ff3333 --color-purple-special: #9933ff;
```

### Sombras Chunky

```css
--shadow-chunky-sm: 3px 3px 0px rgba(0, 0, 0, 1) --shadow-chunky-md: 5px 5px 0px rgba(0, 0, 0, 1)
  --shadow-chunky-lg: 8px 8px 0px rgba(0, 0, 0, 1);
```

### Tipografía

- **Headings**: Lilita One (font-lilita)
- **Body**: Geist Sans (font-geist)

## Scripts

```bash
# Desarrollo (con Turbopack)
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm run start

# Lint
npm run lint
```

## Estructura

```
src/
├── app/
│   ├── layout.tsx    # Layout principal con fuentes
│   ├── page.tsx      # Página de inicio
│   └── globals.css   # Estilos globales y design system
```

## Configuración TypeScript

TypeScript está configurado en modo **estricto** con las siguientes opciones:

- `strict`: true
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true

## Puerto de Desarrollo

La aplicación corre por defecto en http://localhost:3000

## Próximos Pasos

1. Definir estructura de rutas y páginas
2. Implementar componentes del design system
3. Conectar con la API de NestJS
4. Implementar autenticación
