import {
  BookOpen,
  Target,
  Terminal,
  Video,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Types
export interface CodeLine {
  text: string;
  color: string;
  isKeyword?: boolean;
  rest?: string;
  restColor?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface FloatingCard {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: string;
  suffix: string;
}

export interface AdmissionStep {
  step: string;
  title: string;
  description: string;
}

// Navigation
export const navigationItems: NavItem[] = [
  { label: 'Programa', href: '#programa' },
  { label: 'Método', href: '#metodo' },
  { label: 'Docentes', href: '#docentes' },
  { label: 'Admisión', href: '#admision' },
];

// Hero Section
export const heroHeadline = 'El entrenamiento que tu hijo necesita';
export const heroHeadlineHighlight = 'pero la escuela no ofrece';
export const heroSubheadline = 'Matemáticas avanzadas, programación y pensamiento científico.';
export const heroCTA = 'Conocer el Programa';

export const heroStats: HeroStat[] = [
  { value: '500+', label: 'Alumnos activos' },
  { value: '8-17', label: 'Años de edad' },
];

export const heroFloatingCards: FloatingCard[] = [
  {
    icon: Video,
    title: 'En vivo',
    subtitle: '2-3x semana',
  },
  {
    icon: Users,
    title: 'Máx 8 alumnos',
    subtitle: 'Grupos reducidos',
  },
];

// Code Lines for Terminal Animation
export const codeLines: CodeLine[] = [
  { text: 'def', color: 'text-blue-400', isKeyword: true, rest: ' calcular_progreso(estudiante, dias):' },
  { text: '    progreso = estudiante.nivel_inicial', color: 'text-white/90' },
  { text: '    mejora_diaria = ', color: 'text-white/90', rest: '0.05', restColor: 'text-orange-400' },
  { text: '    ', color: 'text-white' },
  { text: '    for', color: 'text-orange-400', isKeyword: true, rest: ' dia in range(dias):' },
  { text: '        if', color: 'text-orange-400', isKeyword: true, rest: ' estudiante.asistio(dia):' },
  { text: '            progreso *= (', color: 'text-white/90', rest: '1', restColor: 'text-orange-400' },
  { text: '        else', color: 'text-orange-400', isKeyword: true, rest: ':' },
  { text: '            progreso *= ', color: 'text-white/90', rest: '0.98', restColor: 'text-orange-400' },
  { text: '    ', color: 'text-white' },
  { text: '    return', color: 'text-pink-400', isKeyword: true, rest: ' round(progreso, 2)' },
  { text: '', color: 'text-white' },
  { text: '', color: 'text-white' },
  { text: 'class', color: 'text-purple-400', isKeyword: true, rest: ' SistemaEntrenamiento:' },
  { text: '    ', color: 'text-white' },
  { text: '    def', color: 'text-blue-400', isKeyword: true, rest: ' evaluar_estudiante(self, respuestas):' },
  { text: '        correctas = ', color: 'text-white/90', rest: '0', restColor: 'text-orange-400' },
  { text: '        ', color: 'text-white' },
  { text: '        for', color: 'text-orange-400', isKeyword: true, rest: ' pregunta, respuesta in respuestas.items():' },
  { text: '            if', color: 'text-orange-400', isKeyword: true, rest: ' self.validar(pregunta, respuesta):' },
  { text: '                correctas += ', color: 'text-white/90', rest: '1', restColor: 'text-orange-400' },
  { text: '        ', color: 'text-white' },
  { text: '        porcentaje = (correctas / len(respuestas)) * ', color: 'text-white/90', rest: '100', restColor: 'text-orange-400' },
  { text: '        return', color: 'text-pink-400', isKeyword: true, rest: ' porcentaje >= 75' },
];

// Features Section
export const featuresTitle = 'Cómo funciona';
export const featuresSubtitle = 'Un método estructurado con seguimiento individual';

export const features: Feature[] = [
  {
    title: 'Sesiones en vivo',
    description: '2-3 veces por semana. No son videos pregrabados. Docentes especializados en tiempo real.',
  },
  {
    title: 'Grupos reducidos',
    description: 'Máximo 8 alumnos por grupo. Atención personalizada. Tu hijo no es un número.',
  },
  {
    title: 'Seguimiento individual',
    description: 'Evaluaciones mensuales. Sabrás exactamente cómo avanza tu hijo.',
  },
];

// Benefits Section
export const benefitsTitle = 'Qué incluye el programa';
export const benefitsSubtitle = 'Un método estructurado para desarrollar habilidades que la escuela tradicional no enseña';

export const benefits: Benefit[] = [
  {
    icon: BookOpen,
    title: 'Matemáticas Avanzadas',
    description: 'Álgebra, geometría, cálculo y lógica matemática. Aplicados a problemas reales, no solo ejercicios de libro.',
  },
  {
    icon: Terminal,
    title: 'Programación',
    description: 'Python y JavaScript desde cero. Crean programas funcionales, no solo siguen tutoriales.',
  },
  {
    icon: Target,
    title: 'Pensamiento Científico',
    description: 'Física, química y método científico. Aprenden a hacer preguntas y diseñar experimentos.',
  },
];

// Stats Section
export const stats: Stat[] = [
  { label: 'Alumnos activos', value: '500', suffix: '+' },
  { label: 'Horas de clase semanales', value: '3', suffix: '' },
  { label: 'Alumnos por grupo', value: '8', suffix: '' },
  { label: 'Satisfacción', value: '4.9', suffix: '/5' },
];

// Admission Section
export const admissionTitle = 'Proceso de admisión';
export const admissionSubtitle = 'Cuatro pasos para comenzar';

export const admissionSteps: AdmissionStep[] = [
  {
    step: '1',
    title: 'Evaluación inicial',
    description: 'Entrevista con uno de nuestros docentes para entender el nivel actual y objetivos de tu hijo.',
  },
  {
    step: '2',
    title: 'Asignación de grupo',
    description: 'Ubicamos a tu hijo en el grupo adecuado según su nivel y edad. Grupos de máximo 8 estudiantes.',
  },
  {
    step: '3',
    title: 'Inicio del programa',
    description: 'Comienza con 2-3 sesiones semanales de 1 hora. Cada sesión es en vivo con docente especializado.',
  },
  {
    step: '4',
    title: 'Seguimiento mensual',
    description: 'Evaluación del progreso cada mes. Recibes un reporte detallado de avances y áreas a mejorar.',
  },
];

// CTA Section
export const ctaTitle = '¿Tu hijo está listo para el siguiente nivel?';
export const ctaSubtitle = 'Solicita información sobre el programa.';
export const ctaButton = 'Conocer el Programa';
export const ctaDisclaimer = 'Respuesta en menos de 24 horas';

// Footer
export const footerLinks = [
  { label: 'Programa', href: '#programa' },
  { label: 'Método', href: '#metodo' },
  { label: 'Docentes', href: '#docentes' },
  { label: 'Contacto', href: 'mailto:contacto@mateatletas.com', text: 'contacto@mateatletas.com' },
];

export const footerCopyright = '© 2025 Mateatletas. Todos los derechos reservados.';
