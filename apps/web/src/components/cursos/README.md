# Componentes de Cursos

Este directorio contiene componentes migrados desde `ciudad-mateatleta` para el contenido educativo interactivo.

## Estructura

```
cursos/
├── core/           # Componentes base (Quiz, DragDrop, Matching games)
├── ui/             # UI específica para juegos (GameCard, ProgressBar, Canvas)
├── slides/         # Sistema de presentaciones/slides
├── editores/       # Editores de código (Luau, Chemistry)
├── simulaciones/   # Simulaciones físicas con matter.js
│   ├── fisica/     # Gravedad, fricción, colisiones, etc.
│   └── quimica/    # Experimentos químicos
├── juegos/         # Juegos educativos interactivos
│   ├── engine/     # Motor de quiz genérico
│   ├── matematicas/# Juegos de finanzas, cambio, etc.
│   ├── quimica/    # Misión espacial, etc.
│   └── astronomia/ # Construir átomo, anomalías
└── roblox/         # Componentes específicos Roblox/Luau
```

## Origen

Migrado desde: `ciudad-mateatleta/apps/web/components/`

Ver: [MIGRACION-CIUDAD-WEB.md](../../../../docs/MIGRACION-CIUDAD-WEB.md)
