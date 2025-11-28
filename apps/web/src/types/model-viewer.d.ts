declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerElement &
      React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

interface ModelViewerElement {
  src: string;
  alt?: string;
  'auto-rotate'?: boolean;
  'camera-controls'?: boolean;
  'camera-orbit'?: string;
  'camera-target'?: string;
  'field-of-view'?: string;
  'min-camera-orbit'?: string;
  'max-camera-orbit'?: string;
  'shadow-intensity'?: string;
  'shadow-softness'?: string;
  exposure?: string;
  'environment-image'?: string;
  'skybox-image'?: string;
  poster?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'interaction' | 'manual';
  'interaction-prompt'?: 'auto' | 'when-focused' | 'none';
  'interaction-prompt-threshold'?: string;
  ar?: boolean;
  'ar-modes'?: string;
  autoplay?: boolean;
  'animation-name'?: string;
  'animation-crossfade-duration'?: string;
  style?: React.CSSProperties;
}
