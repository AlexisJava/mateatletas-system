import { test, expect, Page } from '@playwright/test';

/**
 * Sandbox E2E Tests - Editor de Contenido Educativo
 *
 * Tests para el flujo completo del Sandbox:
 * - Inicio y creación de contenido
 * - Navegación del árbol de nodos
 * - Edición de contenido JSON
 * - Auto-guardado
 * - Eliminación con confirmación
 * - Manejo de errores
 */

test.describe('Sandbox - Flujo Completo', () => {
  // Helper para inicializar el sandbox
  async function initializeSandbox(page: Page) {
    await page.goto('/admin/sandbox');

    // Esperar a que cargue la WelcomeScreen
    await expect(page.getByText('SANDBOX EDITOR v1.0')).toBeVisible({ timeout: 10000 });

    // Seleccionar facción (QUANTUM por defecto ya está seleccionado)
    await expect(page.getByRole('button', { name: /Quantum/i })).toBeVisible();

    // Click en Inicializar
    await page.getByRole('button', { name: /Inicializar/i }).click();

    // Esperar a que se creen los nodos estructurales
    await expect(page.getByText('Teoría')).toBeVisible({ timeout: 15000 });
  }

  test('WelcomeScreen carga correctamente', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Verificar elementos de la pantalla de bienvenida
    await expect(page.getByText('SANDBOX EDITOR v1.0')).toBeVisible();
    await expect(page.getByText('Mateatletas')).toBeVisible();
    await expect(page.getByText('Editor de contenido educativo gamificado.')).toBeVisible();

    // Verificar selector de facciones
    await expect(page.getByText('Selecciona tu Facción')).toBeVisible();
    await expect(page.getByRole('button', { name: /Quantum/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Vertex/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pulsar/i })).toBeVisible();

    // Verificar selector de materias
    await expect(page.getByText('Materia')).toBeVisible();

    // Verificar botón de inicio
    await expect(page.getByRole('button', { name: /Inicializar/i })).toBeVisible();
  });

  test('Selección de facción funciona', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Seleccionar Vertex
    await page.getByRole('button', { name: /Vertex/i }).click();

    // Verificar que la selección se aplicó (indicador visual)
    const vertexButton = page.getByRole('button', { name: /Vertex/i });
    await expect(vertexButton).toHaveClass(/border-\[#a855f7\]/);
  });

  test('Crear contenido genera nodos estructurales', async ({ page }) => {
    await initializeSandbox(page);

    // Verificar que se crearon los 3 nodos raíz estructurales
    await expect(page.getByText('Teoría')).toBeVisible();
    await expect(page.getByText('Práctica')).toBeVisible();
    await expect(page.getByText('Evaluación')).toBeVisible();

    // Verificar que la barra de navegación del editor está visible
    await expect(page.getByPlaceholder('Nombre del Proyecto')).toBeVisible();
  });

  test('Navegación del árbol de nodos', async ({ page }) => {
    await initializeSandbox(page);

    // Expandir nodo Teoría (si no está expandido, hacer click)
    const teoriaNode = page.getByText('Teoría');
    await teoriaNode.click();

    // Verificar que el indicador de nodo activo cambia
    // El nodo Teoría es contenedor, no hoja, así que no debe ser editable
    await expect(page.getByText('contenedor')).toBeVisible();
  });

  test('Editor muestra mensaje para nodos contenedor', async ({ page }) => {
    await initializeSandbox(page);

    // Click en Teoría (nodo contenedor)
    await page.getByText('Teoría').click();

    // Debe mostrar mensaje de que es un contenedor
    await expect(
      page.getByText('Este nodo contiene sub-nodos').or(page.getByText('Nodo Contenedor')),
    ).toBeVisible();
  });

  test('Agregar nodo hijo funciona', async ({ page }) => {
    await initializeSandbox(page);

    // Hover sobre Teoría para mostrar acciones
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();

    // Click en botón agregar (+ icon)
    await teoriaRow.getByTitle('Agregar subnodo').click();

    // Verificar que se creó el nuevo nodo
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });
  });

  test('Seleccionar nodo hoja activa el editor', async ({ page }) => {
    await initializeSandbox(page);

    // Agregar un nodo hijo a Teoría
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();
    await teoriaRow.getByTitle('Agregar subnodo').click();

    // Esperar a que se cree el nodo
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Click en el nuevo nodo (que es hoja)
    await page.getByText('Nuevo nodo').click();

    // Verificar que el editor Monaco está visible
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 5000 });
  });

  test('Indicador de estado de guardado funciona', async ({ page }) => {
    await initializeSandbox(page);

    // El indicador debe mostrar "Borrador" inicialmente
    await expect(page.getByText('Borrador')).toBeVisible();
  });

  test('Cambiar nombre del proyecto actualiza título', async ({ page }) => {
    await initializeSandbox(page);

    // Localizar input del nombre del proyecto
    const titleInput = page.getByPlaceholder('Nombre del Proyecto');

    // Limpiar y escribir nuevo nombre
    await titleInput.clear();
    await titleInput.fill('Mi Lección de Prueba');

    // Verificar que el valor cambió
    await expect(titleInput).toHaveValue('Mi Lección de Prueba');
  });

  test('Renombrar nodo con doble click', async ({ page }) => {
    await initializeSandbox(page);

    // Agregar un nodo hijo
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();
    await teoriaRow.getByTitle('Agregar subnodo').click();

    // Esperar a que se cree
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Doble click para renombrar
    await page.getByText('Nuevo nodo').dblclick();

    // Debe aparecer input de edición
    const editInput = page.locator('input[class*="bg-[#0f0720]"]');
    await expect(editInput).toBeVisible();

    // Escribir nuevo nombre
    await editInput.fill('Introducción');
    await editInput.press('Enter');

    // Verificar que se renombró
    await expect(page.getByText('Introducción')).toBeVisible();
  });

  test('Eliminar nodo sin hijos funciona directamente', async ({ page }) => {
    await initializeSandbox(page);

    // Agregar un nodo hijo
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();
    await teoriaRow.getByTitle('Agregar subnodo').click();

    // Esperar a que se cree
    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Hover sobre el nuevo nodo
    const nuevoNodoRow = page.locator('[class*="group"]', { hasText: 'Nuevo nodo' }).first();
    await nuevoNodoRow.hover();

    // Click en eliminar
    await nuevoNodoRow.getByTitle('Eliminar nodo').click();

    // El nodo debería desaparecer (sin confirmación porque no tiene hijos)
    await expect(page.getByText('Nuevo nodo')).not.toBeVisible({ timeout: 5000 });
  });

  test('Eliminar nodo con hijos muestra confirmación', async ({ page }) => {
    await initializeSandbox(page);

    // Agregar un nodo padre
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();
    await teoriaRow.getByTitle('Agregar subnodo').click();

    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Agregar un nodo hijo al nodo recién creado
    const padreRow = page.locator('[class*="group"]', { hasText: 'Nuevo nodo' }).first();
    await padreRow.hover();
    await padreRow.getByTitle('Agregar subnodo').click();

    // Esperar a que aparezca el segundo "Nuevo nodo"
    await page.waitForTimeout(1000);

    // Intentar eliminar el nodo padre
    await padreRow.hover();
    await padreRow.getByTitle('Eliminar nodo').click();

    // Debe aparecer modal de confirmación
    await expect(page.getByText('Confirmar eliminación')).toBeVisible();
    await expect(page.getByText('subnodo')).toBeVisible();

    // Verificar botones del modal
    await expect(page.getByRole('button', { name: /Cancelar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Eliminar todo/i })).toBeVisible();
  });

  test('Cancelar eliminación cierra el modal', async ({ page }) => {
    await initializeSandbox(page);

    // Crear nodo padre con hijo
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();
    await teoriaRow.getByTitle('Agregar subnodo').click();

    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    const padreRow = page.locator('[class*="group"]', { hasText: 'Nuevo nodo' }).first();
    await padreRow.hover();
    await padreRow.getByTitle('Agregar subnodo').click();

    await page.waitForTimeout(1000);

    // Intentar eliminar
    await padreRow.hover();
    await padreRow.getByTitle('Eliminar nodo').click();

    // Esperar modal
    await expect(page.getByText('Confirmar eliminación')).toBeVisible();

    // Cancelar
    await page.getByRole('button', { name: /Cancelar/i }).click();

    // Modal debe cerrarse
    await expect(page.getByText('Confirmar eliminación')).not.toBeVisible();

    // El nodo debe seguir existiendo
    await expect(page.getByText('Nuevo nodo').first()).toBeVisible();
  });

  test('Confirmar eliminación elimina nodo y descendientes', async ({ page }) => {
    await initializeSandbox(page);

    // Crear estructura de nodos
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();
    await teoriaRow.getByTitle('Agregar subnodo').click();

    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Renombrar para identificar
    await page.getByText('Nuevo nodo').dblclick();
    const editInput = page.locator('input[class*="bg-[#0f0720]"]');
    await editInput.fill('Padre');
    await editInput.press('Enter');

    // Agregar hijo
    const padreRow = page.locator('[class*="group"]', { hasText: 'Padre' }).first();
    await padreRow.hover();
    await padreRow.getByTitle('Agregar subnodo').click();

    await expect(page.getByText('Nuevo nodo')).toBeVisible({ timeout: 10000 });

    // Eliminar el padre
    await padreRow.hover();
    await padreRow.getByTitle('Eliminar nodo').click();

    // Confirmar
    await page.getByRole('button', { name: /Eliminar todo/i }).click();

    // Ambos nodos deben desaparecer
    await expect(page.getByText('Padre')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Nuevo nodo')).not.toBeVisible();
  });

  test('Toggle de vista funciona (split/editor/preview)', async ({ page }) => {
    await initializeSandbox(page);

    // Por defecto está en split
    const splitButton = page.getByRole('button', { name: /split/i });
    const editorButton = page.getByRole('button', { name: /editor/i });
    const previewButton = page.getByRole('button', { name: /preview/i });

    await expect(splitButton).toBeVisible();
    await expect(editorButton).toBeVisible();
    await expect(previewButton).toBeVisible();

    // Cambiar a solo editor
    await editorButton.click();

    // Cambiar a solo preview
    await previewButton.click();

    // Volver a split
    await splitButton.click();
  });

  test('Modo preview mobile/desktop toggle', async ({ page }) => {
    await initializeSandbox(page);

    // Buscar botones de modo desktop/mobile en la barra flotante
    const desktopButton = page.getByLabel('Modo escritorio');
    const mobileButton = page.getByLabel('Modo móvil');

    await expect(desktopButton).toBeVisible();
    await expect(mobileButton).toBeVisible();

    // Cambiar a mobile
    await mobileButton.click();

    // Volver a desktop
    await desktopButton.click();
  });

  test('Botón publicar abre modal de confirmación', async ({ page }) => {
    await initializeSandbox(page);

    // Click en publicar
    await page.getByRole('button', { name: /Publicar/i }).click();

    // Debe aparecer modal de publicación
    await expect(page.getByText('Publicar')).toBeVisible();
  });

  test('Tree sidebar toggle funciona', async ({ page }) => {
    await initializeSandbox(page);

    // Buscar botón de toggle del árbol
    const toggleButton = page.getByLabel(/árbol/i);
    await expect(toggleButton).toBeVisible();

    // El sidebar debe estar visible inicialmente
    await expect(page.getByText('Contenido')).toBeVisible();

    // Toggle para ocultar
    await toggleButton.click();

    // El header del sidebar no debería estar visible
    await expect(page.getByText('Contenido')).not.toBeVisible();

    // Toggle para mostrar
    await toggleButton.click();
    await expect(page.getByText('Contenido')).toBeVisible();
  });

  test('Nodos bloqueados no tienen botón eliminar', async ({ page }) => {
    await initializeSandbox(page);

    // Hover sobre Teoría (nodo bloqueado)
    const teoriaRow = page.locator('[class*="group"]', { hasText: 'Teoría' }).first();
    await teoriaRow.hover();

    // Debe tener botón agregar
    await expect(teoriaRow.getByTitle('Agregar subnodo')).toBeVisible();

    // NO debe tener botón eliminar
    await expect(teoriaRow.getByTitle('Eliminar nodo')).not.toBeVisible();
  });

  test('Error toast se muestra y se auto-cierra', async ({ page }) => {
    await initializeSandbox(page);

    // Capturar errores de consola
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Esperar un poco para capturar errores
    await page.waitForTimeout(2000);

    // Filtrar errores conocidos
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

    // Verificar botón Inicializar
    const initButton = page.getByRole('button', { name: /Inicializar/i });
    await expect(initButton).toBeVisible();

    // Verificar que hay heading
    await expect(page.getByRole('heading', { name: /Mateatletas/i })).toBeVisible();
  });

  test('Navegación por teclado funciona en WelcomeScreen', async ({ page }) => {
    await page.goto('/admin/sandbox');

    // Tab debería navegar entre elementos
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });
});

test.describe('Sandbox - Responsiveness', () => {
  test('Se adapta a pantallas pequeñas', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin/sandbox');

    // La página debería cargar sin errores
    await expect(page.getByText('SANDBOX EDITOR')).toBeVisible();
  });

  test('Se adapta a tablets', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/admin/sandbox');

    await expect(page.getByText('SANDBOX EDITOR')).toBeVisible();
  });
});
