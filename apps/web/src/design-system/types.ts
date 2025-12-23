/**
 * Mateatletas Design System - Tipos compartidos
 * Plataforma educativa de programación, matemáticas y ciencias para niños 6-17 años
 */

// ============================================================================
// ÁREAS TEMÁTICAS
// ============================================================================

export type ThemeArea = 'programming' | 'math' | 'science';

export type ProgrammingThemeId = 'terminal' | 'retro' | 'cyber' | 'hacker' | 'scratch';
export type MathThemeId = 'industrial' | 'blueprint' | 'chalkboard' | 'minimal' | 'bunker';
export type ScienceThemeId = 'lab' | 'space' | 'nature' | 'electric' | 'robot';

export type ThemeId = ProgrammingThemeId | MathThemeId | ScienceThemeId;

// ============================================================================
// CONFIGURACIÓN DE TEMA
// ============================================================================

export interface ThemeColors {
  primary: string;
  primaryGlow: string;
  secondary: string;
  accent: string;
  bgMain: string;
  bgCard: string;
  textMain: string;
  textDim: string;
  textMuted: string;
  codeBg: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  xp: string;
}

export interface SyntaxColors {
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  variable: string;
  operator: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  glow?: string;
}

export interface ThemeEffects {
  glassmorphism?: boolean;
  scanlines?: boolean;
  glow?: boolean;
  glitch?: boolean;
  bouncy?: boolean;
  neon?: boolean;
  industrial?: boolean;
  blueprint?: boolean;
  chalkboard?: boolean;
  particles?: boolean;
}

export interface ThemeClasses {
  container: string;
  card: string;
  button: string;
  text: string;
}

export interface ThemeConfig {
  id: ThemeId;
  area: ThemeArea;
  name: string;
  emoji: string;
  description: string;

  colors: ThemeColors;
  syntax: SyntaxColors;

  borderRadius: string;
  borderWidth: string;

  shadows: ThemeShadows;
  effects: ThemeEffects;
  classes: ThemeClasses;
}

// ============================================================================
// COMPONENTES - PROPS COMUNES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  theme?: ThemeConfig;
}

export interface WithChildren {
  children?: React.ReactNode;
}

// ============================================================================
// MASCOTA BIT
// ============================================================================

export type MascotState = 'happy' | 'thinking' | 'alert' | 'excited' | 'sad' | 'celebrating';

export interface MascotProps extends BaseComponentProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

// ============================================================================
// POST-IT NOTE
// ============================================================================

export type PostItColor = 'yellow' | 'pink' | 'green' | 'blue' | 'orange' | 'purple';

export interface PostItNoteProps extends BaseComponentProps, WithChildren {
  color?: PostItColor;
  rotation?: number | 'random';
  pinStyle?: 'pin' | 'tape' | 'none';
  foldedCorner?: boolean;
  floating?: boolean;
  title?: string;
}

// ============================================================================
// QUIZ
// ============================================================================

export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

export type QuizState = 'unanswered' | 'correct' | 'incorrect';

export interface QuizBlockProps extends BaseComponentProps {
  question: string;
  code?: string;
  codeLanguage?: 'lua' | 'python' | 'javascript';
  options: string[];
  correctIndex: number;
  correctOptionId?: string;
  explanation?: string;
  onAnswer?: (isCorrect: boolean) => void;
  hint?: string;
  showFeedback?: boolean;
}

// ============================================================================
// CODE EDITOR
// ============================================================================

export type CodeLanguage = 'lua' | 'python' | 'javascript' | 'typescript' | 'html' | 'css';

export interface CodeEditorProps extends BaseComponentProps {
  code: string;
  language: CodeLanguage;
  showLineNumbers?: boolean;
  showHeader?: boolean;
  title?: string;
  editable?: boolean;
  onCodeChange?: (code: string) => void;
  onRun?: () => void;
  highlightedLines?: number[];
}

// ============================================================================
// PROGRESS
// ============================================================================

export interface ProgressBarProps extends BaseComponentProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  animated?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'xp' | 'striped' | 'gradient';
}

export interface XPCounterProps extends BaseComponentProps {
  currentXP: number;
  maxXP?: number;
  level?: number;
  showLevel?: boolean;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// CALLOUT
// ============================================================================

export type CalloutVariant = 'info' | 'success' | 'warning' | 'error' | 'tip' | 'note';

export interface CalloutBlockProps extends BaseComponentProps, WithChildren {
  variant?: CalloutVariant;
  title?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// ============================================================================
// BADGE
// ============================================================================

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends BaseComponentProps, WithChildren {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  pulse?: boolean;
}

// ============================================================================
// BUTTON
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends BaseComponentProps, WithChildren {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// ============================================================================
// INPUT
// ============================================================================

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'search';
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// ============================================================================
// DRAG AND DROP
// ============================================================================

export interface DraggableItem {
  id: string;
  content: string;
  type?: string;
}

export interface DragDropZoneProps extends BaseComponentProps, WithChildren {
  onDrop?: (e: React.DragEvent) => void;
  accepts?: string[];
  placeholder?: string;
  label?: string;
  isActive?: boolean;
  isValid?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

export interface DraggableChipProps extends BaseComponentProps, WithChildren {
  item?: DraggableItem;
  isDragging?: boolean;
  isPlaced?: boolean;
  isCorrect?: boolean;
  onDragStart?: (e?: React.DragEvent) => void;
  onDragEnd?: (e?: React.DragEvent) => void;
}

// ============================================================================
// ACHIEVEMENT
// ============================================================================

export interface AchievementPopupProps extends BaseComponentProps {
  title: string;
  description?: string;
  xpReward?: number;
  icon?: React.ReactNode | string;
  isVisible?: boolean;
  show?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoHideDuration?: number;
  autoCloseDelay?: number;
}

// ============================================================================
// CONCEPT CARD
// ============================================================================

export interface ConceptCardProps extends BaseComponentProps, WithChildren {
  title: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'interactive';
  onClick?: () => void;
}

// ============================================================================
// VARIABLE BADGE
// ============================================================================

export type VariableType = 'string' | 'number' | 'boolean' | 'table' | 'function' | 'nil';

export interface VariableBadgeProps extends BaseComponentProps {
  name: string;
  value: string;
  type: VariableType;
  showType?: boolean;
}

// ============================================================================
// LAYOUT
// ============================================================================

export interface CardProps extends BaseComponentProps, WithChildren {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

export interface ContainerProps extends BaseComponentProps, WithChildren {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

export interface DividerProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  label?: string;
}

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface HeaderBlockProps extends BaseComponentProps, WithChildren {
  level?: HeadingLevel;
  centered?: boolean;
  gradient?: boolean;
}

export interface TextBlockProps extends BaseComponentProps, WithChildren {
  size?: TextSize;
  weight?: TextWeight;
  muted?: boolean;
  centered?: boolean;
  as?: 'p' | 'span' | 'div';
}

// ============================================================================
// TOOLTIP
// ============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends BaseComponentProps, WithChildren {
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
}

// ============================================================================
// TERMINAL OUTPUT
// ============================================================================

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp?: Date;
}

export interface TerminalOutputProps extends BaseComponentProps {
  lines: TerminalLine[];
  showPrompt?: boolean;
  prompt?: string;
  promptSymbol?: string;
  maxHeight?: string;
  autoScroll?: boolean;
  animate?: boolean;
  title?: string;
}

// ============================================================================
// BIT SPEECH
// ============================================================================

export type MascotMood =
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'celebrating'
  | 'encouraging'
  | 'surprised'
  | 'proud'
  | 'confused';

export interface MascotBITProps extends BaseComponentProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showMessage?: boolean;
  customMessage?: string;
  onClick?: () => void;
}

export interface BitSpeechProps extends BaseComponentProps, WithChildren {
  position?: 'left' | 'right' | 'top' | 'bottom';
  mood?: MascotMood;
  variant?: 'speech' | 'thought';
  animate?: boolean;
  animated?: boolean;
}
