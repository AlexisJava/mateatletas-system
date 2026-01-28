'use client';

/**
 * GlowText - Texto con efectos de glow, gradiente y shadow
 *
 * Extraído del diseño Pencil (portal_estudiante.pen):
 *
 * === "HOLA, MATEO" (Main Menu - Center Area - mainTitle) ===
 * font: Inter 64px weight 900, letter-spacing: 4
 * fill: linear-gradient(180deg, #FFFFFF 0%, #F0E6FF 40%, #C4B5FD 70%, #A78BFA 100%)
 * shadow: blur 30px #A78BFACC, blur 60px #7C3AED80, blur 100px #FFFFFF30
 *
 * === "¡BIENVENIDO DE VUELTA!" (Main Menu - Center Area - welcomeText) ===
 * font: Inter 12px weight 600, letter-spacing: 3
 * fill: #DDD6FE
 * shadow: blur 15px #A78BFA40
 *
 * === "MUNDOS" (Selección de Mundos - mainTitle) ===
 * font: Inter 38px weight 900
 * fill: #FFFFFF
 * shadow: blur 20px #A78BFA60, offset-y: 4
 *
 * === "MATEMÁTICAS" (Hover Card - title) ===
 * font: Inter 52px weight 900, text-align: center
 * fill: #FFFFFF
 * shadow: blur 30px #A78BFA60
 *
 * === World titles in cards (e.g., "MATEMÁTICAS" in portal card) ===
 * font: Inter 18px weight 900, text-align: center
 * fill: #FFFFFF
 * shadow: blur 8px #A78BFA80
 */

type GlowTextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

interface GlowTextProps {
  children: React.ReactNode;
  /** Tag HTML (default: span) */
  as?: GlowTextTag;
  /** Font size en px */
  fontSize: number;
  /** Font weight (default: 900) */
  fontWeight?: number;
  /** Letter spacing en px */
  letterSpacing?: number;
  /** Color sólido del texto */
  color?: string;
  /** Gradiente CSS para texto (usa background-clip: text) */
  gradient?: string;
  /** Text shadow CSS (acepta múltiples sombras separadas por coma) */
  glow?: string;
  /** Alineación del texto */
  textAlign?: 'left' | 'center' | 'right';
  /** Line height */
  lineHeight?: number;
  className?: string;
}

export function GlowText({
  children,
  as: Tag = 'span',
  fontSize,
  fontWeight = 900,
  letterSpacing,
  color,
  gradient,
  glow,
  textAlign,
  lineHeight,
  className = '',
}: GlowTextProps): React.JSX.Element {
  const isGradient = !!gradient;

  return (
    <Tag
      className={`font-[Inter] ${className}`}
      style={{
        fontSize,
        fontWeight,
        letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
        textAlign,
        lineHeight,
        // Gradient text via background-clip
        ...(isGradient
          ? {
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }
          : {
              color: color ?? '#FFFFFF',
            }),
        // Glow/shadow - para gradient text usamos filter en vez de text-shadow
        ...(glow
          ? isGradient
            ? { filter: `drop-shadow(${glow.split(',')[0]?.trim() ?? glow})` }
            : { textShadow: glow }
          : {}),
      }}
    >
      {children}
    </Tag>
  );
}
