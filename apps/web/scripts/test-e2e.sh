#!/bin/bash

# Script de ayuda para ejecutar tests E2E de Playwright
# Uso: ./scripts/test-e2e.sh [comando]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

cd "$PROJECT_ROOT"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de ayuda
show_help() {
  echo -e "${BLUE}Tests E2E - Colonia de Verano Landing Page${NC}"
  echo ""
  echo "Uso: ./scripts/test-e2e.sh [comando]"
  echo ""
  echo "Comandos disponibles:"
  echo "  run            Ejecutar todos los tests (default)"
  echo "  ui             Abrir interfaz visual de Playwright"
  echo "  headed         Ejecutar tests con navegador visible"
  echo "  report         Ver reporte HTML de últimos resultados"
  echo "  list           Listar todos los tests"
  echo "  smoke          Ejecutar solo tests de smoke"
  echo "  landing        Ejecutar solo tests de landing page"
  echo "  catalog        Ejecutar solo tests de catálogo"
  echo "  form           Ejecutar solo tests de formulario"
  echo "  e2e            Ejecutar solo tests de flujo completo"
  echo "  install        Instalar dependencias y navegadores"
  echo "  help           Mostrar esta ayuda"
  echo ""
  echo "Ejemplos:"
  echo "  ./scripts/test-e2e.sh run"
  echo "  ./scripts/test-e2e.sh ui"
  echo "  ./scripts/test-e2e.sh smoke"
}

# Función para verificar instalación
check_installation() {
  if ! command -v yarn &> /dev/null; then
    echo -e "${YELLOW}⚠️  Yarn no está instalado. Instalando...${NC}"
    npm install -g yarn
  fi

  if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}⚠️  Playwright no está instalado. Instalando...${NC}"
    yarn install
  fi
}

# Parsear comando
COMMAND="${1:-run}"

case "$COMMAND" in
  run)
    echo -e "${GREEN}▶️  Ejecutando todos los tests E2E...${NC}"
    check_installation
    yarn workspace web test:e2e
    ;;

  ui)
    echo -e "${GREEN}🎨 Abriendo interfaz visual de Playwright...${NC}"
    check_installation
    yarn workspace web test:e2e:ui
    ;;

  headed)
    echo -e "${GREEN}👀 Ejecutando tests con navegador visible...${NC}"
    check_installation
    yarn workspace web test:e2e:headed
    ;;

  report)
    echo -e "${GREEN}📊 Abriendo reporte HTML...${NC}"
    yarn workspace web test:e2e:report
    ;;

  list)
    echo -e "${GREEN}📋 Listando todos los tests...${NC}"
    check_installation
    yarn workspace web test:e2e --list
    ;;

  smoke)
    echo -e "${GREEN}🔥 Ejecutando tests de smoke...${NC}"
    check_installation
    yarn workspace web test:e2e tests/e2e/01-smoke.spec.ts
    ;;

  landing)
    echo -e "${GREEN}🏖️  Ejecutando tests de landing page...${NC}"
    check_installation
    yarn workspace web test:e2e tests/e2e/02-colonia-landing.spec.ts
    ;;

  catalog)
    echo -e "${GREEN}📚 Ejecutando tests de catálogo...${NC}"
    check_installation
    yarn workspace web test:e2e tests/e2e/03-colonia-catalog.spec.ts
    ;;

  form)
    echo -e "${GREEN}📝 Ejecutando tests de formulario...${NC}"
    check_installation
    yarn workspace web test:e2e tests/e2e/04-colonia-inscription-form.spec.ts
    ;;

  e2e)
    echo -e "${GREEN}🎯 Ejecutando tests de flujo completo...${NC}"
    check_installation
    yarn workspace web test:e2e tests/e2e/05-colonia-e2e-flow.spec.ts
    ;;

  install)
    echo -e "${GREEN}📦 Instalando dependencias y navegadores...${NC}"
    yarn install
    cd apps/web && npx playwright install chromium
    echo -e "${GREEN}✅ Instalación completa${NC}"
    ;;

  help|--help|-h)
    show_help
    ;;

  *)
    echo -e "${YELLOW}⚠️  Comando desconocido: $COMMAND${NC}"
    echo ""
    show_help
    exit 1
    ;;
esac
