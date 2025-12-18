export type CourseTheme = 'programacion' | 'matematicas' | 'ciencias';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryHover: string;

  // Accent color
  accent: string;

  // Gradients
  gradients: {
    title: string;
    header: string;
    button: string;
    card: string;
    background: string;
  };

  // Borders
  borders: {
    primary: string;
    card: string;
  };

  // Shadows
  shadows: {
    primary: string;
    card: string;
  };
}

export const programacionTheme: ThemeColors = {
  primary: 'indigo-500',
  primaryHover: 'indigo-600',
  primaryLight: 'indigo-300',
  primaryDark: 'indigo-700',

  secondary: 'purple-500',
  secondaryHover: 'purple-600',

  accent: 'pink-400',

  gradients: {
    title: 'from-indigo-300 via-purple-300 to-pink-300',
    header: 'from-indigo-600 to-purple-600',
    button: 'from-indigo-500 to-purple-500',
    card: 'from-indigo-900/30 via-purple-900/30 to-pink-900/30',
    background: 'from-slate-900 via-indigo-950 to-slate-900',
  },

  borders: {
    primary: 'border-indigo-500/20',
    card: 'border-indigo-500/30',
  },

  shadows: {
    primary: 'shadow-indigo-500/20',
    card: 'shadow-indigo-500/10',
  },
};

export const matematicasTheme: ThemeColors = {
  primary: 'orange-500',
  primaryHover: 'orange-600',
  primaryLight: 'orange-300',
  primaryDark: 'orange-700',

  secondary: 'amber-500',
  secondaryHover: 'amber-600',

  accent: 'yellow-400',

  gradients: {
    title: 'from-orange-300 via-amber-300 to-yellow-300',
    header: 'from-orange-600 to-amber-600',
    button: 'from-orange-500 to-amber-500',
    card: 'from-orange-900/30 via-amber-900/30 to-yellow-900/30',
    background: 'from-slate-900 via-slate-800 to-slate-900',
  },

  borders: {
    primary: 'border-orange-500/20',
    card: 'border-orange-500/30',
  },

  shadows: {
    primary: 'shadow-orange-500/20',
    card: 'shadow-orange-500/10',
  },
};

export const cienciasTheme: ThemeColors = {
  primary: 'emerald-500',
  primaryHover: 'emerald-600',
  primaryLight: 'emerald-300',
  primaryDark: 'emerald-700',

  secondary: 'teal-500',
  secondaryHover: 'teal-600',

  accent: 'cyan-400',

  gradients: {
    title: 'from-emerald-300 via-teal-300 to-cyan-300',
    header: 'from-emerald-600 to-teal-600',
    button: 'from-emerald-500 to-teal-500',
    card: 'from-emerald-900/30 via-teal-900/30 to-cyan-900/30',
    background: 'from-slate-900 via-slate-800 to-slate-900',
  },

  borders: {
    primary: 'border-emerald-500/20',
    card: 'border-emerald-500/30',
  },

  shadows: {
    primary: 'shadow-emerald-500/20',
    card: 'shadow-emerald-500/10',
  },
};

export const courseThemes = {
  programacion: programacionTheme,
  matematicas: matematicasTheme,
  ciencias: cienciasTheme,
};

export function getCourseTheme(theme: CourseTheme): ThemeColors {
  return courseThemes[theme];
}
