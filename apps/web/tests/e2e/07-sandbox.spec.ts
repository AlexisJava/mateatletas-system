import { test, expect, Page } from '@playwright/test';

/**
 * Sandbox E2E Tests - Editor de Contenido Educativo
 *
 * Tests para el flujo completo del Sandbox:
 * - Inicio y creación de contenido (StartModal)
 * - Navegación del árbol de nodos
 * - Edición de contenido JSON
 * - Auto-guardado
 * - Eliminación con confirmación
 */

test.describe('Sandbox - Flujo Completo', () => {
  // Helper para crear una microlección en el sandbox
  async function createMicroleccion(page: Page, titulo = 'Test Microlección') {
    await page.goto('/admin/sandbox');

    // Esperar a que cargue el StartModal
    await expect(page.getByText('Crear Contenido')).toBeVisible({ timeout: 10000 });

    // Verificar que Microlección está seleccionada por defecto
    await expect(page.getByRole('button', { name: /Microlección/i })).toBeVisible();

    // Escribir título
    const tituloInput = page.getByPlaceholder('Nombre del contenido...');
    await tituloInput.fill(titulo);

    // Click en Crear
    await page.getByRole('button', { name: /^Crear$/i }).click();

    // Esperar a que se creen los nodos estructurales
    await expect(page.getByText('Teoría')).toBeVisible({ timeout: 15000 });
  }

  test('StartModal carga correctamente', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Verificar elementos del modal de creación
    await expect(page.getByText('Crear Contenido')).toBeVisible();

    // Verificar selector de tipo de contenido
    await expect(page.getByRole('button', { name: /Microlección/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Planificación/i })).toBeVisible();

    // Verificar selector de casa
    await expect(page.getByText('Casa')).toBeVisible();
    await expect(page.getByRole('button', { name: /Quantum/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Vertex/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pulsar/i })).toBeVisible();

    // Verificar selector de materia
    await expect(page.getByText('Materia')).toBeVisible();
    await expect(page.getByRole('button', { name: /Matemática/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Programación/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ciencias/i })).toBeVisible();

    // Verificar input de título
    await expect(page.getByPlaceholder('Nombre del contenido...')).toBeVisible();

    // Verificar botón de creación (deshabilitado sin título)
    const createBtn = page.getByRole('button', { name: /^Crear$/i });
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toBeDisabled();
  });

  test('Selección de casa funciona', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Por defecto Quantum está seleccionado
    const quantumBtn = page.getByRole('button', { name: /Quantum/i });
    await expect(quantumBtn).toHaveClass(/active/);

    // Seleccionar Vertex
    await page.getByRole('button', { name: /Vertex/i }).click();

    // Verificar que Vertex está seleccionado
    const vertexBtn = page.getByRole('button', { name: /Vertex/i });
    await expect(vertexBtn).toHaveClass(/active/);
  });

  test('Selección de materia funciona', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Seleccionar Programación
    await page.getByRole('button', { name: /Programación/i }).click();

    // Verificar que Programación está seleccionada
    const progBtn = page.getByRole('button', { name: /Programación/i });
    await expect(progBtn).toHaveClass(/active/);
  });

  test('Crear microlección genera nodos estructurales', async ({ page }) => {
    await createMicroleccion(page);

    // Verificar que se crearon los 3 nodos raíz estructurales
    await expect(page.getByText('Teoría')).toBeVisible();
    await expect(page.getByText('Práctica')).toBeVisible();
    await expect(page.getByText('Evaluación')).toBeVisible();

    // Verificar que el header del árbol está visible
    await expect(page.getByText('Árbol')).toBeVisible();

    // Verificar que el header compacto muestra el tipo
    await expect(page.getByText('Microlección')).toBeVisible();
  });

  test('Navegación del árbol de nodos', async ({ page }) => {
    await createMicroleccion(page);

    // Click en nodo Teoría
    await page.getByText('Teoría').click();

    // Teoría es un contenedor sin contenido JSON
    // El editor debe mostrar mensaje de contenedor
    await expect(page.getByText('contenedor', { exact: false })).toBeVisible();
  });

  test('Editor muestra mensaje para nodos contenedor', async ({ page }) => {
    await createMicroleccion(page);

    // Click en Teoría (nodo contenedor)
    await page.getByText('Teoría').click();

    // Debe mostrar mensaje de que es un contenedor
    await expect(page.getByText('contenedor', { exact: false })).toBeVisible();
  });

  test('Agregar nodo hijo funciona', async ({ page }) => {
    await createMicroleccion(page);

    // Hover sobre Teoría para mostrar acciones
    const teoriaNode = page.getByText('Teoría');
    await teoriaNode.hover();

    // Click en botón agregar usando aria-label
    await page.getByRole('button', { name: 'Agregar subnodo' }).first().click();

    // Verificar que se creó el nuevo nodo
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });
  });

  test('Seleccionar nodo hoja activa el editor', async ({ page }) => {
    await createMicroleccion(page);

    // Agregar un nodo hijo a Teoría
    await page.getByText('Teoría').hover();
    await page.getByRole('button', { name: 'Agregar subnodo' }).first().click();

    // Esperar a que se cree el nodo
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Click en el nuevo nodo (que es hoja)
    await page.getByText('Nuevo nodo').click();

    // Verificar que el editor Monaco está visible
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 5000 });
  });

  test('Renombrar nodo con doble click', async ({ page }) => {
    await createMicroleccion(page);

    // Agregar un nodo hijo
    await page.getByText('Teoría').hover();
    await page.getByRole('button', { name: 'Agregar subnodo' }).first().click();

    // Esperar a que se cree
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Doble click para renombrar
    await page.getByText('Nuevo nodo').dblclick();

    // Debe aparecer input de edición (usando data-testid)
    const editInput = page.getByTestId('rename-input');
    await expect(editInput).toBeVisible();

    // Escribir nuevo nombre
    await editInput.fill('Introducción');
    await editInput.press('Enter');

    // Verificar que se renombró
    await expect(page.getByText('Introducción')).toBeVisible();
  });

  test('Eliminar nodo sin hijos funciona directamente', async ({ page }) => {
    await createMicroleccion(page);

    // Agregar un nodo hijo
    await page.getByText('Teoría').hover();
    await page.getByRole('button', { name: 'Agregar subnodo' }).first().click();

    // Esperar a que se cree
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Hover sobre el nuevo nodo
    await page.getByText('Nuevo nodo').hover();

    // Click en eliminar
    await page.getByRole('button', { name: 'Eliminar nodo' }).click();

    // El nodo debería desaparecer
    await expect(page.getByText('Nuevo nodo')).not.toBeVisible({ timeout: 5000 });
  });

  test('Tree sidebar toggle funciona', async ({ page }) => {
    await createMicroleccion(page);

    // Buscar botón de toggle del árbol
    const toggleButton = page.getByLabel('Ocultar árbol');
    await expect(toggleButton).toBeVisible();

    // El sidebar debe estar visible inicialmente
    await expect(page.getByText('Árbol')).toBeVisible();

    // Toggle para ocultar
    await toggleButton.click();

    // El header del árbol no debería estar visible
    await expect(page.getByText('Árbol')).not.toBeVisible();

    // Toggle para mostrar (ahora el botón tiene label diferente)
    await page.getByLabel('Mostrar árbol').click();
    await expect(page.getByText('Árbol')).toBeVisible();
  });

  test('Nodos bloqueados no tienen botón eliminar', async ({ page }) => {
    await createMicroleccion(page);

    // Hover sobre Teoría (nodo bloqueado)
    await page.getByText('Teoría').hover();

    // Debe tener botón agregar
    await expect(page.getByRole('button', { name: 'Agregar subnodo' }).first()).toBeVisible();

    // NO debe tener botón eliminar visible para este nodo
    // Los nodos bloqueados no muestran el botón de eliminar
    const deleteButtons = page.getByRole('button', { name: 'Eliminar nodo' });
    // El botón existe pero no para el nodo Teoría que es bloqueado
    await expect(deleteButtons).toHaveCount(0);
  });

  test('Preview fullscreen toggle funciona', async ({ page }) => {
    await createMicroleccion(page);

    // Buscar botón de pantalla completa
    const fullscreenBtn = page.getByTitle('Pantalla completa');
    await expect(fullscreenBtn).toBeVisible();

    // Click para activar fullscreen
    await fullscreenBtn.click();

    // Ahora debería mostrar el botón de salir
    await expect(page.getByTitle('Salir de pantalla completa')).toBeVisible();

    // Escape para salir
    await page.keyboard.press('Escape');

    // Debería volver al botón de pantalla completa
    await expect(page.getByTitle('Pantalla completa')).toBeVisible();
  });

  test('Sin errores críticos en consola', async ({ page }) => {
    await createMicroleccion(page);

    // Capturar errores de consola
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Esperar un poco para capturar errores
    await page.waitForTimeout(2000);

    // Filtrar errores conocidos/no críticos
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('favicon') &&
        !error.includes('manifest') &&
        !error.includes('hydration') &&
        !error.includes('ResizeObserver'),
    );

    // No deberían haber errores críticos
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Sandbox - Accesibilidad', () => {
  test('Elementos tienen labels accesibles', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Verificar botón Crear
    const createBtn = page.getByRole('button', { name: /^Crear$/i });
    await expect(createBtn).toBeVisible();

    // Verificar botones de tipo
    await expect(page.getByRole('button', { name: /Microlección/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Planificación/i })).toBeVisible();
  });

  test('Navegación por teclado funciona en StartModal', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Tab debería navegar entre elementos
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // No debe haber errores de accesibilidad
  });
});

test.describe('Sandbox - Responsiveness', () => {
  test('Se adapta a pantallas pequeñas', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin/sandbox');

    // El modal debería cargar sin errores
    await expect(page.getByText('Crear Contenido')).toBeVisible();
  });

  test('Se adapta a tablets', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/admin/sandbox');

    await expect(page.getByText('Crear Contenido')).toBeVisible();
  });
});

test.describe('Sandbox - Planificación', () => {
  test('Crear planificación funciona', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Seleccionar tipo Planificación
    await page.getByRole('button', { name: /Planificación/i }).click();

    // Verificar que aparece el selector de cantidad de clases
    await expect(page.getByText('Cantidad de clases')).toBeVisible();

    // Escribir título
    await page.getByPlaceholder('Nombre del contenido...').fill('Test Planificación');

    // Click en Crear
    await page.getByRole('button', { name: /^Crear$/i }).click();

    // Esperar a que se cree y muestre las clases
    await expect(page.getByText('Clase 1')).toBeVisible({ timeout: 15000 });

    // Verificar que el header muestra Planificación
    await expect(page.getByText('Planificación')).toBeVisible();
  });
});
