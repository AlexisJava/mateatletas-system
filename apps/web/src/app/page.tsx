'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Users,
  Award,
  TrendingUp,
  Clock,
  Target,
  Shield,
  Sparkles,
  ArrowRight,
  Brain,
  Video,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Microscope,
  Palette,
  Zap,
  Rocket,
  Cpu,
  Globe,
  Lightbulb,
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Animation variants - RÁPIDAS
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const stats = [
    { number: '500+', label: 'Estudiantes Activos', icon: Users },
    { number: '100%', label: 'Online en Vivo', icon: Video },
    { number: '15+', label: 'Docentes Certificados', icon: Award },
    { number: '4.9/5', label: 'Calificación Promedio', icon: TrendingUp },
  ];

  const disciplines = [
    {
      icon: Brain,
      name: 'Matemáticas',
      description: 'Desde aritmética básica hasta cálculo avanzado. Álgebra, geometría, trigonometría y más.',
      topics: ['Álgebra', 'Geometría', 'Cálculo', 'Trigonometría', 'Estadística', 'Lógica Matemática'],
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Code,
      name: 'Programación',
      description: 'Aprende a crear software real. Python, JavaScript, algoritmos y estructuras de datos.',
      topics: ['Python', 'JavaScript', 'Algoritmos', 'Web Development', 'Data Structures', 'Git & GitHub'],
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Microscope,
      name: 'Ciencias',
      description: 'Física, química y método científico a través de simulaciones y experimentos digitales.',
      topics: ['Física Digital', 'Química Virtual', 'Método Científico', 'Experimentos Online', 'Laboratorios Virtuales'],
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: Palette,
      name: 'Arte Digital',
      description: 'Geometría fractal, programación visual, diseño generativo y visualización de datos.',
      topics: ['Arte Generativo', 'Fractales', 'Processing', 'Diseño Algorítmico', 'Data Visualization', 'Creative Coding'],
      gradient: 'from-pink-500 to-rose-600',
      bgGradient: 'from-pink-50 to-rose-100',
      iconColor: 'text-pink-600',
    },
    {
      icon: Cpu,
      name: 'Inteligencia Artificial',
      description: 'Introducción al machine learning, redes neuronales y aplicaciones prácticas de IA.',
      topics: ['Machine Learning Básico', 'Redes Neuronales', 'Python para IA', 'Proyectos con IA', 'Ética en IA'],
      gradient: 'from-cyan-500 to-teal-600',
      bgGradient: 'from-cyan-50 to-teal-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: Lightbulb,
      name: 'Pensamiento Crítico',
      description: 'Resolución de problemas, lógica avanzada y entrenamiento cognitivo interdisciplinario.',
      topics: ['Lógica Avanzada', 'Problem Solving', 'Pensamiento Computacional', 'Estrategia', 'Creatividad Científica'],
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-100',
      iconColor: 'text-orange-600',
    },
  ];

  const teachers = [
    {
      name: 'Prof. Ana García',
      specialty: 'Matemáticas & Ciencias',
      credentials: 'Lic. en Matemáticas, UNAM. MSc. Educación STEAM. 12 años de experiencia.',
      description: 'Especialista en conectar matemáticas con el mundo real. Líder de proyectos interdisciplinarios que combinan cálculo, física y programación.',
      experience: '12 años',
      students: '200+',
      expertise: ['Cálculo', 'Física', 'Python Científico'],
    },
    {
      name: 'Prof. Carlos Mendoza',
      specialty: 'Programación & IA',
      credentials: 'Ing. en Computación, ITESM. Maestría en IA. Ex-desarrollador en Google. 10 años enseñando.',
      description: 'Experto en enseñar programación desde cero hasta nivel avanzado. Sus estudiantes crean apps y juegos reales.',
      experience: '10 años',
      students: '180+',
      expertise: ['JavaScript', 'Python', 'Machine Learning'],
    },
    {
      name: 'Prof. María Rodríguez',
      specialty: 'Arte Digital & Algoritmos',
      credentials: 'Lic. en Matemáticas Aplicadas, IPN. Especialización en Creative Coding. 8 años de experiencia.',
      description: 'Fusiona arte y código. Sus clases de geometría fractal y diseño generativo son legendarias entre los estudiantes.',
      experience: '8 años',
      students: '150+',
      expertise: ['Processing', 'P5.js', 'Geometría Computacional'],
    },
  ];

  const methodology = [
    {
      step: 1,
      title: 'Diagnóstico STEAM',
      description: 'Evaluamos habilidades en matemáticas, lógica, programación y pensamiento científico con un test gamificado de 30 minutos.',
      duration: '30 minutos',
      icon: Target,
    },
    {
      step: 2,
      title: 'Ruta Personalizada con IA',
      description: 'Nuestra IA crea un plan de estudios único adaptado al nivel, intereses y objetivos de tu hijo.',
      duration: 'Generado por IA',
      icon: Cpu,
    },
    {
      step: 3,
      title: 'Clases en Vivo 100% Online',
      description: 'Sesiones interactivas por videoconferencia con docentes expertos. Máximo 8 estudiantes por grupo.',
      duration: '2-3 clases/semana',
      icon: Video,
    },
    {
      step: 4,
      title: 'Proyectos Interdisciplinarios',
      description: 'Tu hijo crea proyectos reales combinando matemáticas + código + ciencia. Portafolio digital incluido.',
      duration: '1 proyecto/mes',
      icon: Rocket,
    },
    {
      step: 5,
      title: 'Copiloto IA 24/7',
      description: 'Asistente inteligente disponible siempre para resolver dudas, sugerir ejercicios y motivar el progreso.',
      duration: 'Siempre disponible',
      icon: Zap,
    },
    {
      step: 6,
      title: 'Certificación & Portfolio',
      description: 'Certificados por cada disciplina dominada + portfolio digital con todos los proyectos creados.',
      duration: 'Al completar rutas',
      icon: Award,
    },
  ];

  const routes = [
    {
      name: 'Fundamentos STEAM',
      description: 'Base sólida en matemáticas, lógica y pensamiento computacional',
      disciplines: ['Matemáticas', 'Lógica', 'Introducción a Programación'],
      levels: '4 niveles',
      duration: '3-4 meses',
      age: '8-10 años',
      color: 'blue',
    },
    {
      name: 'Programador Junior',
      description: 'Aprende Python y JavaScript creando juegos, apps y sitios web',
      disciplines: ['Python', 'JavaScript', 'HTML/CSS', 'Git'],
      levels: '5 niveles',
      duration: '4-5 meses',
      age: '10-14 años',
      color: 'green',
    },
    {
      name: 'Científico Digital',
      description: 'Física, química y experimentos a través de simulaciones avanzadas',
      disciplines: ['Física Digital', 'Química Virtual', 'Método Científico'],
      levels: '4 niveles',
      duration: '3-4 meses',
      age: '11-15 años',
      color: 'purple',
    },
    {
      name: 'Matemático Avanzado',
      description: 'Cálculo, álgebra lineal y matemáticas universitarias',
      disciplines: ['Cálculo', 'Álgebra Lineal', 'Matemáticas Discretas'],
      levels: '5 niveles',
      duration: '5-6 meses',
      age: '13-17 años',
      color: 'orange',
    },
    {
      name: 'Artista Digital',
      description: 'Crea arte con código: fractales, diseño generativo y visualización',
      disciplines: ['Processing', 'P5.js', 'Arte Generativo', 'Three.js'],
      levels: '3 niveles',
      duration: '3 meses',
      age: '12-16 años',
      color: 'pink',
    },
    {
      name: 'IA & Machine Learning',
      description: 'Inteligencia artificial, redes neuronales y proyectos con ML',
      disciplines: ['Python para IA', 'TensorFlow', 'Proyectos ML', 'Ética IA'],
      levels: '4 niveles',
      duration: '4-5 meses',
      age: '14-17 años',
      color: 'cyan',
    },
  ];

  const successStories = [
    {
      name: 'Sofía Martínez',
      age: 12,
      grade: '1ro de secundaria',
      before: {
        description: 'Sofía odiaba las matemáticas y no tenía idea de qué era programar. Promedio de 6.5 y sin motivación.',
        problems: ['Miedo a las matemáticas', 'Cero conocimiento de programación', 'Sin dirección clara'],
      },
      after: {
        description: 'Después de 6 meses, Sofía creó su primera app web de calculadora científica y tiene promedio de 9.2.',
        achievements: ['Programó su primera app', 'Promedio 9.2', 'Ganó hackathon escolar', 'Portfolio con 5 proyectos'],
      },
      testimonial: 'Mi hija pasó de no saber qué era HTML a crear sitios web. Ahora quiere estudiar ingeniería en sistemas.',
      parent: 'Laura Martínez, madre de Sofía',
      timeframe: '6 meses',
    },
    {
      name: 'Diego Ramírez',
      age: 14,
      grade: '3ro de secundaria',
      before: {
        description: 'Diego era bueno en mates pero no veía aplicación práctica. Estaba aburrido y desmotivado.',
        problems: ['No veía utilidad real', 'Aburrimiento crónico', 'Falta de reto'],
      },
      after: {
        description: 'Ahora Diego programa en Python, creó un bot de Discord y está aprendiendo machine learning.',
        achievements: ['Domina Python', 'Bot funcional en Discord', 'Iniciando IA/ML', 'Proyecto en GitHub con 20 stars'],
      },
      testimonial: 'Encontró su pasión. Programa todos los días por voluntad propia. Es increíble verlo tan motivado.',
      parent: 'Roberto Ramírez, padre de Diego',
      timeframe: '8 meses',
    },
    {
      name: 'Ana López',
      age: 16,
      grade: '1ro de preparatoria',
      before: {
        description: 'Ana quería estudiar diseño gráfico pero sus padres querían algo "más seguro". Estaba confundida.',
        problems: ['Dilema vocacional', 'Creía que arte y ciencia eran opuestos', 'Inseguridad sobre futuro'],
      },
      after: {
        description: 'Descubrió el arte generativo. Ahora combina programación y diseño creando visualizaciones impresionantes.',
        achievements: ['Domina Processing y P5.js', 'Portfolio de arte digital', 'Vendió 3 piezas NFT', 'Aplicó a diseño computacional'],
      },
      testimonial: 'Mateatletas le mostró que puede fusionar arte y tecnología. Encontró su camino perfecto.',
      parent: 'Patricia López, madre de Ana',
      timeframe: '7 meses',
    },
  ];

  const platformFeatures = [
    {
      title: 'Copiloto IA Personal',
      description: 'Cada estudiante tiene un asistente de IA que adapta el contenido, sugiere ejercicios y responde dudas 24/7.',
      benefits: ['Ayuda instantánea', 'Aprendizaje adaptativo', 'Motivación personalizada'],
    },
    {
      title: 'Clases en Vivo',
      description: 'Videoconferencias interactivas con docentes certificados. Pizarra digital, screen sharing y colaboración en tiempo real.',
      benefits: ['Interacción humana real', 'Resolución de dudas en vivo', 'Networking con compañeros'],
    },
    {
      title: 'Laboratorios Virtuales',
      description: 'Simulaciones de física, química y matemáticas. Experimenta sin límites desde casa.',
      benefits: ['Experimentos ilimitados', 'Sin riesgo físico', 'Resultados instantáneos'],
    },
    {
      title: 'IDE Integrado',
      description: 'Editor de código profesional en el navegador. Escribe Python, JavaScript y más sin instalar nada.',
      benefits: ['Setup cero', 'Código desde cualquier dispositivo', 'Compartir proyectos fácil'],
    },
    {
      title: 'Portfolio Digital',
      description: 'Cada proyecto queda guardado en tu portfolio personal. Perfecto para aplicaciones universitarias.',
      benefits: ['CV técnico automático', 'Muestra tu trabajo', 'URL personalizada'],
    },
    {
      title: 'Gamificación & Ranking',
      description: 'Sistema de puntos, insignias, niveles y rankings. Competencias mensuales con premios reales.',
      benefits: ['Motivación constante', 'Competencia sana', 'Reconocimiento público'],
    },
  ];


  const faqs = [
    {
      question: '¿Mi hijo necesita conocimientos previos en programación?',
      answer: 'No. Empezamos desde cero. Nuestro diagnóstico inicial identifica su nivel en cada área (matemáticas, lógica, programación) y diseñamos una ruta personalizada. Tenemos estudiantes desde 8 años sin experiencia hasta adolescentes avanzados.',
    },
    {
      question: '¿Realmente es 100% online? ¿Cómo funcionan las clases?',
      answer: 'Sí, 100% online. Las clases son por videoconferencia en vivo con docentes reales. Usamos pizarra digital, compartimos pantallas, programamos en conjunto y resolvemos problemas en tiempo real. Es como estar en un aula, pero desde casa.',
    },
    {
      question: '¿Qué equipamiento necesita mi hijo?',
      answer: 'Solo una computadora (Windows, Mac o Linux) con conexión a internet estable, cámara y micrófono. Todo el software es en el navegador, no se instala nada. Para programación, usamos nuestro IDE integrado.',
    },
    {
      question: '¿Cuánto tiempo debe dedicar por semana?',
      answer: 'Recomendamos: 2-3 clases en vivo por semana (1 hora cada una) + 30-45 minutos diarios de práctica/proyectos. Total: 5-7 horas semanales. Es flexible y se puede ajustar según agenda familiar.',
    },
    {
      question: '¿En qué se diferencian de Smartick o Matific?',
      answer: 'Smartick y Matific son solo matemáticas con ejercicios automatizados. Nosotros somos STEAM completo: matemáticas + programación + ciencias + arte digital, con docentes reales en vivo, IA copiloto, y proyectos interdisciplinarios. Preparamos para el futuro digital, no solo para exámenes de mates.',
    },
    {
      question: '¿Mi hijo creará proyectos reales?',
      answer: 'Sí. Cada mes completa un proyecto: puede ser una app web, un juego, una simulación científica, arte generativo o un modelo de IA. Todo queda en su portfolio digital con URL propia que puede compartir.',
    },
    {
      question: '¿Cómo funciona el Copiloto IA?',
      answer: 'Es un asistente inteligente disponible 24/7 que: responde dudas, sugiere ejercicios personalizados, explica conceptos de diferentes formas, y motiva el progreso. Complementa a los docentes, no los reemplaza.',
    },
    {
      question: '¿Los grupos son del mismo nivel y edad?',
      answer: 'Sí. Agrupamos por nivel de habilidad y rango de edad. Máximo 8 estudiantes por grupo para garantizar atención personalizada. Si tu hijo avanza rápido, lo movemos a grupos más avanzados.',
    },
    {
      question: '¿Qué pasa si mi hijo se atrasa o pierde clases?',
      answer: 'No hay problema. Todas las clases quedan grabadas 24/7. Además, el Copiloto IA le hace un resumen personalizado y le sugiere qué repasar. Puede continuar a su ritmo.',
    },
    {
      question: '¿Ofrecen certificación?',
      answer: 'Sí. Al completar cada ruta, recibe un certificado digital verificable. Además, su portfolio con proyectos reales vale más que cualquier certificado en aplicaciones universitarias o laborales.',
    },
    {
      question: '¿Mi hijo puede especializarse en algo específico?',
      answer: 'Totalmente. Después de completar fundamentos, puede enfocarse en: desarrollo web, ciencia de datos, IA/ML, arte digital, física computacional, etc. Creamos rutas personalizadas según sus intereses.',
    },
    {
      question: '¿Hay garantía de satisfacción?',
      answer: 'Sí. Si después de 2 meses no ves progreso o tu hijo no está entusiasmado, te devolvemos el 100% de tu inversión. Sin preguntas. Pero esto casi nunca pasa (98% de satisfacción).',
    },
    {
      question: '¿Apoyan con tareas de la escuela?',
      answer: 'Sí. Durante las clases en vivo, los estudiantes pueden preguntar sobre tareas o temas de su escuela. Los docentes les ayudan a entender, no solo a resolver. Muchos padres reportan mejoras en todas las materias.',
    },
    {
      question: '¿Hay competencias o hackathons?',
      answer: 'Sí. Organizamos hackathons mensuales, competencias de código, olimpiadas de matemáticas online y challenges interdisciplinarios. Hay premios, reconocimientos y certificados especiales para ganadores.',
    },
    {
      question: '¿Cómo funciona la experiencia gratis?',
      answer: 'Regístrate, hacemos el diagnóstico (30 min), te mostramos la plataforma, y tu hijo puede explorar ejercicios, juegos y actividades STEAM sin compromiso. Después decides si continúas. Cero presión.',
    },
  ];

  const enrollmentSteps = [
    {
      step: 1,
      title: 'Registro Inicial',
      description: 'Crea tu cuenta en 2 minutos. Necesitamos: nombre, email, datos del estudiante.',
      duration: '2 minutos',
    },
    {
      step: 2,
      title: 'Diagnóstico STEAM',
      description: 'Tu hijo toma un test gamificado de 30 minutos que evalúa matemáticas, lógica y aptitud para programación.',
      duration: '30 minutos',
    },
    {
      step: 3,
      title: 'Ruta Personalizada con IA',
      description: 'Nuestra IA genera un plan de estudios único basado en sus resultados, edad e intereses.',
      duration: 'Instantáneo',
    },
    {
      step: 4,
      title: 'Selección de Plan',
      description: 'Elegimos juntos el plan que mejor se adapta a tu presupuesto y objetivos.',
      duration: '10 minutos',
    },
    {
      step: 5,
      title: 'Experiencia GRATIS',
      description: 'Tu hijo prueba la plataforma sin compromiso. Juega, explora y conoce lo que hacemos.',
      duration: '30-60 minutos',
    },
    {
      step: 6,
      title: '¡Comienza el Journey!',
      description: 'Si te convence, continúas. Tu hijo ya tiene acceso completo: clases, proyectos, IA copiloto y más.',
      duration: 'Continuo',
    },
  ];

  const guarantees = [
    {
      title: 'Garantía de Satisfacción',
      description: 'Si después de 2 meses no ves progreso o entusiasmo, te devolvemos el 100% de tu inversión.',
      icon: Shield,
    },
    {
      title: 'Experiencia Gratis',
      description: 'Prueba la plataforma sin compromiso. Si no te convence, no pagas nada. Sin letra pequeña.',
      icon: CheckCircle,
    },
    {
      title: 'Sin Permanencia Mínima',
      description: 'Puedes cancelar cuando quieras. Sin penalizaciones, sin explicaciones.',
      icon: XCircle,
    },
    {
      title: 'Docentes Certificados',
      description: 'Todos nuestros docentes tienen título universitario, certificaciones STEAM y mínimo 5 años de experiencia.',
      icon: Award,
    },
    {
      title: '100% Online & Seguro',
      description: 'Plataforma monitoreada, cero tolerancia al bullying, protección de datos garantizada.',
      icon: Globe,
    },
    {
      title: 'IA + Humanos',
      description: 'Lo mejor de ambos mundos: asistencia IA 24/7 + docentes expertos en vivo.',
      icon: Cpu,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mateatletas</h1>
                <p className="text-[10px] text-gray-600">Gimnasio Mental STEAM</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#steam" className="text-sm font-medium text-gray-700 hover:text-blue-600">STEAM</a>
              <a href="#metodologia" className="text-sm font-medium text-gray-700 hover:text-blue-600">Metodología</a>
              <a href="#docentes" className="text-sm font-medium text-gray-700 hover:text-blue-600">Docentes</a>
              <a href="#casos" className="text-sm font-medium text-gray-700 hover:text-blue-600">Casos de Éxito</a>
              <a href="#planes" className="text-sm font-medium text-gray-700 hover:text-blue-600">Planes</a>
              <Link href="/login">
                <button className="text-sm font-semibold text-blue-600">Iniciar Sesión</button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">
                  Probar Gratis
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium mb-6 border border-blue-200"
          >
            <Sparkles className="w-4 h-4" />
            100% Online • STEAM Completo • IA Integrada
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 leading-tight"
          >
            El Gimnasio Mental<br />del Siglo XXI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-2xl text-gray-600 mb-4 max-w-4xl mx-auto"
          >
            No solo matemáticas. <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">STEAM completo</span>: Matemáticas + Programación + Ciencias + Arte Digital + IA
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto"
          >
            Clases en vivo con docentes expertos • Copiloto IA 24/7 • Proyectos reales • Portfolio digital
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                Probar Experiencia Gratis <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Experiencia gratis
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              100% online
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Sin permanencia
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Garantía 100%
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  {stat.number}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STEAM Disciplines */}
      <section id="steam" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              STEAM Completo, No Solo Matemáticas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              6 disciplinas integradas para formar mentes brillantes y preparadas para el futuro
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {disciplines.map((discipline, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`bg-gradient-to-br ${discipline.bgGradient} rounded-xl p-6 border-2 border-transparent hover:border-gray-300 shadow-md hover:shadow-xl transition-all group`}
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 bg-gradient-to-br ${discipline.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                >
                  <discipline.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${discipline.gradient} bg-clip-text text-transparent mb-2`}>
                  {discipline.name}
                </h3>
                <p className="text-gray-700 mb-4">{discipline.description}</p>
                <div className="space-y-1">
                  {discipline.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 bg-gradient-to-r ${discipline.gradient} rounded-full`}></div>
                      {topic}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Metodología */}
      <section id="metodologia" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Metodología: IA + Docentes + Proyectos Reales
            </h2>
            <p className="text-xl text-gray-600">
              Combinamos lo mejor de la tecnología con el toque humano
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {methodology.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-700 mb-3">{item.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rutas STEAM */}
      <section id="rutas" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">6 Rutas de Especialización</h2>
            <p className="text-xl text-gray-600">Tu hijo puede especializarse según sus intereses</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes.map((route, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{route.name}</h3>
                <p className="text-gray-700 mb-4">{route.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-gray-900">Disciplinas:</p>
                  <div className="space-y-1">
                    {route.disciplines.map((disc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        {disc}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold">{route.levels}</p>
                    <p>{route.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{route.age}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Docentes */}
      <section id="docentes" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Conoce a Tus Docentes</h2>
            <p className="text-xl text-gray-600">Expertos STEAM con pasión por enseñar</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teachers.map((teacher, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {teacher.name.split(' ')[1].charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">{teacher.name}</h3>
                <p className="text-blue-600 font-semibold text-center mb-2">{teacher.specialty}</p>
                <p className="text-sm text-gray-600 text-center mb-4">{teacher.credentials}</p>
                <p className="text-gray-700 mb-4 text-center text-sm">{teacher.description}</p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {teacher.expertise.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center gap-8 pt-4 border-t border-gray-300">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{teacher.experience}</p>
                    <p className="text-xs text-gray-600">Experiencia</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{teacher.students}</p>
                    <p className="text-xs text-gray-600">Estudiantes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Casos de Éxito */}
      <section id="casos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50/30 to-indigo-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Historias de Transformación Real
            </h2>
            <p className="text-xl text-gray-600">De <span className="font-semibold text-red-600">cero conocimiento</span> a <span className="font-semibold text-green-600">crear proyectos reales</span></p>
          </motion.div>
          <div className="space-y-12">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{story.name}</h3>
                        <p className="text-gray-600">{story.age} años • {story.grade}</p>
                      </div>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4">
                      <p className="font-semibold text-red-900 mb-2">ANTES:</p>
                      <p className="text-gray-700">{story.before.description}</p>
                    </div>
                    <div className="space-y-2">
                      {story.before.problems.map((problem, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{problem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Después de</p>
                        <p className="text-xl font-bold text-green-600">{story.timeframe}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-4">
                      <p className="font-semibold text-green-900 mb-2">DESPUÉS:</p>
                      <p className="text-gray-700">{story.after.description}</p>
                    </div>
                    <div className="space-y-2">
                      {story.after.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-lg text-gray-700 italic mb-2">"{story.testimonial}"</p>
                  <p className="text-sm text-gray-600">— {story.parent}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="plataforma" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">La Plataforma Más Avanzada</h2>
            <p className="text-xl text-gray-600">IA + Clases en Vivo + Proyectos + Portfolio</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Process */}
      <section id="proceso" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Cómo Empezar?</h2>
            <p className="text-xl text-gray-600">6 pasos simples para transformar a tu hijo</p>
          </div>
          <div className="space-y-8">
            {enrollmentSteps.map((step, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-700 mb-3">{step.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{step.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/register">
              <button className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl text-lg">
                Comenzar Ahora - Es Gratis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Inversión en el Futuro Digital de Tu Hijo</h2>
            <p className="text-xl text-gray-600">Acceso completo a STEAM + IA + Docentes + Proyectos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Mensual</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-gray-900">$2,500</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>8 clases en vivo STEAM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Copiloto IA 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Acceso a plataforma completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>1 proyecto al mes</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl">Elegir Plan</button>
            </div>
            <div className="bg-blue-600 text-white rounded-2xl p-8 border-2 border-blue-600 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                Más Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Plan Trimestral</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold">$6,500</span>
                <span className="text-blue-100">/3 meses</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>24 clases en vivo STEAM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Copiloto IA Premium</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>3 proyectos + portfolio</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span>Hackathons mensuales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">15% descuento</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-white text-blue-600 font-semibold rounded-xl">Elegir Plan</button>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Anual</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-gray-900">$22,000</span>
                <span className="text-gray-600">/año</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>96 clases en vivo STEAM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>IA + Mentoría 1-a-1</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Portfolio completo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Certificación anual</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">30% descuento</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl">Elegir Plan</button>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section id="garantias" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestras Garantías</h2>
            <p className="text-xl text-gray-600">Tu tranquilidad es nuestra prioridad</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guarantees.map((guarantee, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <guarantee.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{guarantee.title}</h3>
                <p className="text-gray-700">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-gray-600">Todo lo que necesitas saber sobre Mateatletas</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
          >
            ¿Listo para Preparar a Tu Hijo para el Futuro Digital?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xl text-blue-100 mb-8"
          >
            No solo matemáticas. <span className="font-bold text-white">STEAM completo</span> + IA + Programación + Ciencias.<br />
            Experiencia gratis. Sin compromiso. Sin riesgo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: '0 30px 60px rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg shadow-2xl hover:bg-gray-50 transition-colors"
              >
                Probar Experiencia Gratis
              </motion.button>
            </Link>
            <a href="tel:+525512345678">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(29, 78, 216, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-blue-700/50 backdrop-blur-sm text-white font-bold rounded-xl text-lg border-2 border-white/30 transition-all"
              >
                Llamar: +52 55 1234 5678
              </motion.button>
            </a>
          </motion.div>
          <p className="text-blue-100 text-sm mt-6">
            Respuesta en menos de 24 horas • Lun-Vie 9:00-18:00 • Sáb 9:00-14:00
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">M</span>
                </div>
                <span className="text-white font-bold">Mateatletas</span>
              </div>
              <p className="text-sm">
                Gimnasio Mental STEAM. 100% online. Formando las mentes brillantes del mañana.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#steam" className="hover:text-white transition-colors">STEAM</a></li>
                <li><a href="#metodologia" className="hover:text-white transition-colors">Metodología</a></li>
                <li><a href="#docentes" className="hover:text-white transition-colors">Docentes</a></li>
                <li><a href="#casos" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="/terminos" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="/contacto" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li>contacto@mateatletas.com</li>
                <li>+52 55 1234 5678</li>
                <li>Lun-Vie: 9:00-18:00</li>
                <li>Sáb: 9:00-14:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Mateatletas Club. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
