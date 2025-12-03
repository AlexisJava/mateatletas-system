import { ComponentType } from 'react';
import { BloqueMetadata, BloqueCategoria } from '../../blocks/types';

/**
 * Tipo base para datos de ejemplo - permite cualquier estructura
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExampleData = Record<string, any>;

/**
 * Props para el componente de preview de un bloque
 * Cada preview recibe datos de ejemplo y renderiza el componente
 */
export interface PreviewComponentProps {
  /** Datos de configuración de ejemplo para el preview */
  exampleData: ExampleData;
  /** Si el preview está en modo interactivo (permite interacción) */
  interactive: boolean;
}

/**
 * Definición de un preview en el registry
 */
export interface PreviewDefinition {
  /** Componente React que renderiza el preview */
  component: ComponentType<PreviewComponentProps>;
  /** Datos de ejemplo para mostrar en el preview */
  exampleData: ExampleData;
  /** Descripción de las props disponibles */
  propsDocumentation: PropDocumentation[];
}

/**
 * Documentación de una prop del componente
 */
export interface PropDocumentation {
  /** Nombre de la prop */
  name: string;
  /** Tipo de dato (string, number, boolean, array, object) */
  type: PropType;
  /** Descripción de la prop */
  description: string;
  /** Si es requerida */
  required: boolean;
  /** Valor por defecto si existe */
  defaultValue?: string;
}

/**
 * Tipos de datos soportados para props
 */
export type PropType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';

/**
 * Estado del modal de preview
 */
export interface PreviewModalState {
  isOpen: boolean;
  componente: BloqueMetadata | null;
}

/**
 * Props para el modal de preview
 */
export interface ComponentePreviewModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
  /** Metadata del componente a previsualizar */
  componente: BloqueMetadata | null;
  /** Callback para toggle de habilitado */
  onToggle?: (tipo: string, habilitado: boolean) => void;
  /** Si está en proceso de toggle */
  isToggling?: boolean;
}

/**
 * Props para el contenedor del preview
 */
export interface PreviewContainerProps {
  /** Tipo del componente */
  tipo: string;
  /** Si está implementado */
  implementado: boolean;
  /** Nombre para mostrar */
  nombre: string;
}

/**
 * Props para el panel de documentación
 */
export interface PropsDocumentationPanelProps {
  /** Lista de props documentadas */
  props: PropDocumentation[];
}

/**
 * Props para el header del modal
 */
export interface PreviewModalHeaderProps {
  /** Metadata del componente */
  componente: BloqueMetadata;
  /** Callback para cerrar */
  onClose: () => void;
}

/**
 * Props para el footer del modal
 */
export interface PreviewModalFooterProps {
  /** Metadata del componente */
  componente: BloqueMetadata;
  /** Callback para toggle */
  onToggle?: (tipo: string, habilitado: boolean) => void;
  /** Si está en proceso de toggle */
  isToggling?: boolean;
}

/**
 * Colores por categoría para el modal
 */
export interface CategoryColors {
  bg: string;
  border: string;
  text: string;
  gradient: string;
}

/**
 * Mapa de colores por categoría
 */
export type CategoryColorsMap = Record<BloqueCategoria, CategoryColors>;

/**
 * Resultado del hook usePreviewModal
 */
export interface UsePreviewModalResult {
  /** Estado del modal */
  state: PreviewModalState;
  /** Abrir modal con un componente */
  openModal: (componente: BloqueMetadata) => void;
  /** Cerrar modal */
  closeModal: () => void;
}

/**
 * Tipo para el placeholder de componentes no implementados
 */
export interface NotImplementedPlaceholderProps {
  /** Nombre del componente */
  nombre: string;
  /** Descripción del componente */
  descripcion: string;
  /** Icono del componente */
  icono: string;
  /** Categoría */
  categoria: BloqueCategoria;
}

/**
 * Elemento de la lista de props
 */
export interface PropListItemProps {
  /** Prop a renderizar */
  prop: PropDocumentation;
}

/**
 * Badge de tipo de prop
 */
export interface PropTypeBadgeProps {
  /** Tipo de la prop */
  type: PropType;
}
