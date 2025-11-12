// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA DE RESULTADOS DEL QUIZ
// La página MÁS IMPORTANTE del funnel - donde se decide la compra
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizResponses, ResultadoRecomendacion, Curso } from '@/types/courses';
import HeaderResultado from '@/components/resultado/HeaderResultado';
import CaminoAprendizaje from '@/components/resultado/CaminoAprendizaje';
import OpcionesPago from '@/components/resultado/OpcionesPago';
import DescuentoMultipleHijo from '@/components/resultado/DescuentoMultipleHijo';
import RutasAlternativas from '@/components/resultado/RutasAlternativas';
import GarantiaSection from '@/components/resultado/GarantiaSection';
import FAQSection from '@/components/resultado/FAQSection';
import StickyCTAMobile from '@/components/resultado/StickyCTAMobile';
import { trackResultadoPageView, trackScrollDepth } from '@/lib/analytics/trackEvents';

// Mock de cursos (en producción esto vendría de los IDs de la ruta)
const MOCK_CURSOS: Record<string, Curso> = {
  'scratch-basico': {
    id: 'scratch-basico',
    nombre: 'Scratch Básico',
    emoji: '🎮',
    descripcion: 'Aprende los fundamentos de programación creando juegos divertidos',
    nivel: 'Principiante',
    duracion_semanas: 6,
    total_clases: 12,
    modalidad: 'Asincrónico',
    skills_principales: ['Pensamiento lógico', 'Secuencias', 'Eventos', 'Variables básicas'],
    resultado_esperado: 'Crear juegos interactivos básicos con personajes, movimientos y lógica simple',
    proyecto_final: 'Un juego de plataformas completo con niveles, puntos y enemigos'
  },
  'scratch-avanzado': {
    id: 'scratch-avanzado',
    nombre: 'Scratch Avanzado',
    emoji: '🚀',
    descripcion: 'Proyectos más complejos con física, IA y multiplayer',
    nivel: 'Intermedio',
    duracion_semanas: 8,
    total_clases: 16,
    modalidad: 'Asincrónico',
    skills_principales: ['Clones', 'Listas', 'Operadores avanzados', 'Física de juegos'],
    resultado_esperado: 'Desarrollar juegos complejos con múltiples niveles, enemigos inteligentes y mecánicas avanzadas',
    proyecto_final: 'Un RPG con inventario, combate por turnos y sistema de guardado'
  },
  'roblox-studio': {
    id: 'roblox-studio',
    nombre: 'Roblox Studio',
    emoji: '🎨',
    descripcion: 'Diseña mundos 3D y crea experiencias en Roblox',
    nivel: 'Intermedio',
    duracion_semanas: 10,
    total_clases: 18,
    modalidad: 'Asincrónico',
    skills_principales: ['Modelado 3D', 'Terrenos', 'Iluminación', 'UI/UX'],
    resultado_esperado: 'Crear mundos 3D completos con escenarios, objetos coleccionables y desafíos',
    proyecto_final: 'Un obby (carrera de obstáculos) 3D publicado en Roblox'
  },
  'scripting-luau': {
    id: 'scripting-luau',
    nombre: 'Scripting con Luau',
    emoji: '⚡',
    descripcion: 'Programa la lógica de tus juegos de Roblox con código real',
    nivel: 'Avanzado',
    duracion_semanas: 12,
    total_clases: 20,
    modalidad: 'Asincrónico',
    skills_principales: ['Luau/Lua', 'Functions', 'Remote Events', 'DataStore'],
    resultado_esperado: 'Programar mecánicas avanzadas de juego con código profesional',
    proyecto_final: 'Un juego multijugador completo con sistema de puntos y rankings'
  },
  'python-basico': {
    id: 'python-basico',
    nombre: 'Python Básico',
    emoji: '🐍',
    descripcion: 'Tu primer lenguaje de programación profesional',
    nivel: 'Principiante',
    duracion_semanas: 8,
    total_clases: 16,
    modalidad: 'Asincrónico',
    skills_principales: ['Sintaxis Python', 'Variables', 'Loops', 'Funciones'],
    resultado_esperado: 'Escribir programas básicos que resuelvan problemas reales',
    proyecto_final: 'Una calculadora interactiva y un juego de adivinanza'
  },
  'python-intermedio': {
    id: 'python-intermedio',
    nombre: 'Python Intermedio',
    emoji: '💻',
    descripcion: 'POO, archivos y estructuras de datos',
    nivel: 'Intermedio',
    duracion_semanas: 10,
    total_clases: 18,
    modalidad: 'Asincrónico',
    skills_principales: ['Clases y Objetos', 'Listas', 'Diccionarios', 'Manejo de archivos'],
    resultado_esperado: 'Crear aplicaciones más complejas con almacenamiento de datos',
    proyecto_final: 'Sistema de gestión de biblioteca con CRUD completo'
  }
};

export default function ResultadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<{
    respuestas: QuizResponses;
    recomendacion: ResultadoRecomendacion;
  } | null>(null);
  const [moneda, setMoneda] = useState<'USD' | 'ARS'>('USD');

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGAR RESULTADO DESDE SESSIONSTORAGE
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('quiz_resultado');

      if (!stored) {
        // Si no hay resultado guardado, redirigir al quiz
        router.push('/cursos-online/asincronicos');
        return;
      }

      const parsed = JSON.parse(stored);
      setResultado(parsed);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar resultado:', error);
      router.push('/cursos-online/asincronicos');
    }
  }, [router]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS TRACKING
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (resultado) {
      trackResultadoPageView(
        resultado.recomendacion.ruta_principal.id,
        resultado.recomendacion.ruta_principal.nombre
      );
    }
  }, [resultado]);

  // Track scroll depth
  useEffect(() => {
    let scrollDepthTracked = {
      '25': false,
      '50': false,
      '75': false,
      '100': false
    };

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const scrollPercentage = Math.round((scrolled / documentHeight) * 100);

      // Track at 25%, 50%, 75%, 100%
      if (scrollPercentage >= 25 && !scrollDepthTracked['25']) {
        trackScrollDepth(25);
        scrollDepthTracked['25'] = true;
      }
      if (scrollPercentage >= 50 && !scrollDepthTracked['50']) {
        trackScrollDepth(50);
        scrollDepthTracked['50'] = true;
      }
      if (scrollPercentage >= 75 && !scrollDepthTracked['75']) {
        trackScrollDepth(75);
        scrollDepthTracked['75'] = true;
      }
      if (scrollPercentage >= 95 && !scrollDepthTracked['100']) {
        trackScrollDepth(100);
        scrollDepthTracked['100'] = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (loading || !resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">🚀</div>
          <div className="text-2xl font-bold text-white mb-2">
            Analizando el perfil...
          </div>
          <div className="text-slate-400">
            Preparando la ruta perfecta
          </div>
        </div>
      </div>
    );
  }

  const { respuestas, recomendacion } = resultado;
  const { ruta_principal, alternativas, mensaje_personalizado } = recomendacion;

  // Obtener cursos mockeados (en producción cargar desde API)
  const cursosMock: Curso[] = ruta_principal.cursos.map((cursoId) =>
    MOCK_CURSOS[cursoId] || {
      id: cursoId,
      nombre: cursoId,
      emoji: '📚',
      descripcion: 'Curso de programación',
      nivel: 'Intermedio',
      duracion_semanas: 8,
      total_clases: 16,
      modalidad: 'Asincrónico',
      skills_principales: ['Skill 1', 'Skill 2'],
      resultado_esperado: 'Aprender conceptos fundamentales',
      proyecto_final: 'Proyecto final práctico'
    }
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background pattern decorativo */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(30 41 59 / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(30 41 59 / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Gradiente radial sutil */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15)_0%,transparent_50%)] pointer-events-none" />

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* PARTE 1: Header con confirmación */}
        <HeaderResultado
          nombreEstudiante={respuestas.nombre_estudiante}
          edad={respuestas.edad}
          respuestas={respuestas}
          mensaje={mensaje_personalizado}
        />

        {/* PARTE 2: Camino de aprendizaje (Timeline) */}
        <CaminoAprendizaje cursos={cursosMock} />

        {/* PARTE 3: Opciones de pago (MUY IMPORTANTE) */}
        <div id="opciones-pago">
          <OpcionesPago
            ruta={ruta_principal}
            nombreEstudiante={respuestas.nombre_estudiante}
          />
        </div>

        {/* PARTE 4: Descuento múltiple hijo */}
        <DescuentoMultipleHijo
          precioBase={moneda === 'USD' ? ruta_principal.precio_usd : ruta_principal.precio_ars}
          moneda={moneda}
          nombreEstudiante={respuestas.nombre_estudiante}
        />

        {/* PARTE 5: Rutas alternativas */}
        <RutasAlternativas rutasAlternativas={alternativas} />

        {/* PARTE 6: Garantía y social proof */}
        <GarantiaSection />

        {/* PARTE 7: FAQs */}
        <FAQSection />

        {/* CTA Final Desktop */}
        <div className="hidden md:block max-w-4xl mx-auto mb-20">
          <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border-2 border-emerald-500/50 rounded-3xl p-10 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              ¿Listo para empezar?
            </h3>
            <p className="text-slate-300 text-lg mb-6">
              Inscribí a {respuestas.nombre_estudiante} hoy y comenzá su camino hacia el futuro
            </p>
            <button
              onClick={() => {
                const paymentSection = document.getElementById('opciones-pago');
                if (paymentSection) {
                  paymentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="px-12 py-5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 hover:from-emerald-400 hover:via-cyan-400 hover:to-purple-400 text-white font-black text-xl rounded-xl shadow-2xl shadow-emerald-500/30 transition-all inline-flex items-center gap-3"
            >
              Inscribir a {respuestas.nombre_estudiante}
              <span className="text-3xl">🚀</span>
            </button>
          </div>
        </div>
      </div>

      {/* PARTE 8: Sticky CTA Mobile */}
      <StickyCTAMobile
        nombreEstudiante={respuestas.nombre_estudiante}
        precio={moneda === 'USD' ? ruta_principal.precio_usd : ruta_principal.precio_ars}
        moneda={moneda}
      />
    </main>
  );
}
