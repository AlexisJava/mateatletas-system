/**
 * MOTOR QUÍMICO - Sistema de simulación de reacciones
 * ====================================================
 *
 * Motor que calcula reacciones químicas para el simulador de cohetes.
 * Define combustibles, propulsores, y sus interacciones.
 */

// --- TIPOS ---

export type CombustibleTipo = 'vinagre' | 'limon' | 'cola';
export type PropulsorTipo = 'bicarbonato' | 'menthos' | 'levadura';

export interface Ingrediente {
  id: string;
  nombre: string;
  emoji: string;
  precio: number;
  potencia: number;
  descripcion: string;
  datoCurioso: string;
}

export interface CombustibleConfig extends Ingrediente {
  id: CombustibleTipo;
  tipo: 'combustible';
}

export interface PropulsorConfig extends Ingrediente {
  id: PropulsorTipo;
  tipo: 'propulsor';
}

export interface ReaccionInput {
  combustible: {
    tipo: CombustibleTipo;
    cantidad: number;
  };
  propulsor: {
    tipo: PropulsorTipo;
    cantidad: number;
  };
}

export interface ResultadoReaccion {
  alturaAlcanzada: number;
  intensidadVisual: 'baja' | 'media' | 'alta' | 'explosiva';
  mensaje: string;
  exito: boolean;
}

export interface EstimacionAltura {
  alturaEstimada: number;
  confianza: 'baja' | 'media' | 'alta';
}

// --- DATOS ---

export const COMBUSTIBLES: Record<CombustibleTipo, CombustibleConfig> = {
  vinagre: {
    id: 'vinagre',
    tipo: 'combustible',
    nombre: 'Vinagre',
    emoji: '🫗',
    precio: 5,
    potencia: 6,
    descripcion: 'Ácido acético diluido. Reacciona muy bien con bases.',
    datoCurioso: 'El vinagre se usa desde hace 10,000 años, ¡más viejo que la escritura!',
  },
  limon: {
    id: 'limon',
    tipo: 'combustible',
    nombre: 'Jugo de Limón',
    emoji: '🍋',
    precio: 8,
    potencia: 7,
    descripcion: 'Ácido cítrico natural. Más potente que el vinagre.',
    datoCurioso: 'Los marineros comían limones para evitar el escorbuto en viajes largos.',
  },
  cola: {
    id: 'cola',
    tipo: 'combustible',
    nombre: 'Coca-Cola',
    emoji: '🥤',
    precio: 10,
    potencia: 8,
    descripcion: 'Bebida carbonatada con ácido fosfórico.',
    datoCurioso: 'La Coca-Cola fue inventada por un farmacéutico en 1886.',
  },
};

export const PROPULSORES: Record<PropulsorTipo, PropulsorConfig> = {
  bicarbonato: {
    id: 'bicarbonato',
    tipo: 'propulsor',
    nombre: 'Bicarbonato',
    emoji: '⚪',
    precio: 3,
    potencia: 6,
    descripcion: 'Bicarbonato de sodio. La base clásica para experimentos.',
    datoCurioso: 'Se usa para hacer pan, limpiar y hasta apagar fuegos pequeños.',
  },
  menthos: {
    id: 'menthos',
    tipo: 'propulsor',
    nombre: 'Mentos',
    emoji: '🍬',
    precio: 7,
    potencia: 9,
    descripcion: 'Caramelos con superficie porosa que nuclean burbujas.',
    datoCurioso: 'La reacción con cola es tan famosa que se llama "Mentos Geyser".',
  },
  levadura: {
    id: 'levadura',
    tipo: 'propulsor',
    nombre: 'Levadura',
    emoji: '🧫',
    precio: 5,
    potencia: 5,
    descripcion: 'Microorganismos que producen CO2 lentamente.',
    datoCurioso: 'La levadura está viva y "respira" produciendo burbujas.',
  },
};

// --- MATRIZ DE COMPATIBILIDAD ---

const COMPATIBILIDAD: Record<CombustibleTipo, Record<PropulsorTipo, number>> = {
  vinagre: {
    bicarbonato: 1.0, // Clásico, funciona muy bien
    menthos: 0.3, // No funciona bien
    levadura: 0.5, // Funciona moderadamente
  },
  limon: {
    bicarbonato: 0.9, // Muy bueno
    menthos: 0.2, // Malo
    levadura: 0.6, // Moderado
  },
  cola: {
    bicarbonato: 0.4, // Regular
    menthos: 1.2, // ¡Explosivo!
    levadura: 0.3, // Malo
  },
};

// --- FUNCIONES ---

/**
 * Calcula el resultado de una reacción química
 */
export function calcularReaccion(input: ReaccionInput): ResultadoReaccion {
  const combustible = COMBUSTIBLES[input.combustible.tipo];
  const propulsor = PROPULSORES[input.propulsor.tipo];
  const compatibilidad = COMPATIBILIDAD[input.combustible.tipo][input.propulsor.tipo];

  // Fórmula base: (potencia_comb + potencia_prop) * compatibilidad * cantidad_promedio
  const potenciaBase = (combustible.potencia + propulsor.potencia) / 2;
  const cantidadPromedio = (input.combustible.cantidad + input.propulsor.cantidad) / 2;

  // La altura crece logarítmicamente con la cantidad para evitar números absurdos
  const factorCantidad = Math.log2(cantidadPromedio + 1) + 1;

  const alturaBase = potenciaBase * compatibilidad * factorCantidad;

  // Añadir algo de variación (±10%)
  const variacion = 0.9 + Math.random() * 0.2;
  const alturaFinal = Math.round(alturaBase * variacion);

  // Determinar intensidad visual
  let intensidadVisual: ResultadoReaccion['intensidadVisual'];
  if (alturaFinal > 50) intensidadVisual = 'explosiva';
  else if (alturaFinal > 30) intensidadVisual = 'alta';
  else if (alturaFinal > 15) intensidadVisual = 'media';
  else intensidadVisual = 'baja';

  // Generar mensaje
  let mensaje: string;
  if (compatibilidad >= 1.0) {
    mensaje = '¡Reacción perfecta! Los ingredientes combinan muy bien.';
  } else if (compatibilidad >= 0.7) {
    mensaje = 'Buena reacción. Los ingredientes funcionan bien juntos.';
  } else if (compatibilidad >= 0.4) {
    mensaje = 'Reacción moderada. Podrías probar otra combinación.';
  } else {
    mensaje = 'Reacción débil. Estos ingredientes no combinan bien.';
  }

  return {
    alturaAlcanzada: alturaFinal,
    intensidadVisual,
    mensaje,
    exito: alturaFinal > 10,
  };
}

/**
 * Estima la altura sin variación (para predicciones)
 */
export function estimarAltura(input: ReaccionInput): EstimacionAltura {
  const combustible = COMBUSTIBLES[input.combustible.tipo];
  const propulsor = PROPULSORES[input.propulsor.tipo];
  const compatibilidad = COMPATIBILIDAD[input.combustible.tipo][input.propulsor.tipo];

  const potenciaBase = (combustible.potencia + propulsor.potencia) / 2;
  const cantidadPromedio = (input.combustible.cantidad + input.propulsor.cantidad) / 2;
  const factorCantidad = Math.log2(cantidadPromedio + 1) + 1;

  const alturaEstimada = Math.round(potenciaBase * compatibilidad * factorCantidad);

  // La confianza depende de la compatibilidad
  let confianza: EstimacionAltura['confianza'];
  if (compatibilidad >= 0.8) confianza = 'alta';
  else if (compatibilidad >= 0.5) confianza = 'media';
  else confianza = 'baja';

  return {
    alturaEstimada,
    confianza,
  };
}
