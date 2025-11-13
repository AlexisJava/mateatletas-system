// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & TRACKING - Eventos para medir conversión
// Integración con Google Analytics y otras herramientas
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Track page view de la página de resultados
 */
export function trackResultadoPageView(rutaId: string, rutaNombre: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title: 'Resultado Quiz',
      page_path: '/cursos-online/asincronicos/resultado',
      ruta_id: rutaId,
      ruta_nombre: rutaNombre
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Resultado Page View:', {
      rutaId,
      rutaNombre
    });
  }
}

/**
 * Track cuando el usuario hace click en comprar
 */
export function trackComprarClick(
  opcion: 'ruta_completa' | 'individual',
  precio: number,
  moneda: 'USD' | 'ARS'
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'click_comprar', {
      opcion_elegida: opcion,
      precio: precio,
      moneda: moneda,
      event_category: 'conversion',
      event_label: `${opcion} - ${moneda} ${precio}`
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Click Comprar:', {
      opcion,
      precio,
      moneda
    });
  }
}

/**
 * Track scroll depth (profundidad de scroll)
 */
export function trackScrollDepth(percentage: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'scroll', {
      scroll_depth: percentage,
      event_category: 'engagement'
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Scroll Depth:', percentage);
  }
}

/**
 * Track cuando el usuario expande un curso en el timeline
 */
export function trackCursoExpand(cursoId: string, cursoNombre: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'curso_expand', {
      curso_id: cursoId,
      curso_nombre: cursoNombre,
      event_category: 'engagement'
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Curso Expandido:', {
      cursoId,
      cursoNombre
    });
  }
}

/**
 * Track cuando el usuario cambia la cantidad de hijos
 */
export function trackMultipleHijoChange(cantidad: number, precioTotal: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'multiple_hijo_change', {
      cantidad_hijos: cantidad,
      precio_total: precioTotal,
      event_category: 'engagement'
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Múltiple Hijo:', {
      cantidad,
      precioTotal
    });
  }
}

/**
 * Track cuando el usuario expande una FAQ
 */
export function trackFAQExpand(pregunta: string, index: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'faq_expand', {
      pregunta: pregunta,
      index: index,
      event_category: 'engagement'
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] FAQ Expandido:', {
      pregunta,
      index
    });
  }
}

/**
 * Track cuando el usuario ve una ruta alternativa
 */
export function trackRutaAlternativaClick(rutaId: string, rutaNombre: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ruta_alternativa_click', {
      ruta_id: rutaId,
      ruta_nombre: rutaNombre,
      event_category: 'engagement'
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Ruta Alternativa Click:', {
      rutaId,
      rutaNombre
    });
  }
}

/**
 * Track cuando el usuario cambia la moneda
 */
export function trackMonedaChange(moneda: 'USD' | 'ARS') {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'moneda_change', {
      moneda: moneda,
      event_category: 'engagement'
    });
  }

  // Log para development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Moneda Cambiada:', moneda);
  }
}
