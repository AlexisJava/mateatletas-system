'use client';

import { Globe, Gamepad2, Trophy, Video, Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { PortalLayout } from '@/components/estudiante/layouts/PortalLayout';
import { GlowText } from '@/components/estudiante/atoms/GlowText';
import { BentoCard, BENTO_THEMES, ExplorarMundosBottom } from '@/components/estudiante/organisms';
import { ProgressBar } from '@/components/estudiante/molecules/ProgressBar';
import { useEstudianteRequired } from '@/contexts/EstudianteContext';
import { useDashboardData, useMiAula } from '@/hooks/useEstudiantePortal';

/**
 * Main Menu - Portal Estudiante
 *
 * Conectado con backend:
 * - Nombre del estudiante (EstudianteContext)
 * - Logros/Trofeos (useMiProgreso)
 * - Clases de hoy (useMisClases)
 * - Última lección en progreso (useMiAula)
 *
 * TODO Backend:
 * - Tickets de arcade (no existe endpoint aún)
 * - Lecciones completadas (agregar a mi-progreso)
 */

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function MainMenuPage(): React.JSX.Element {
  const estudiante = useEstudianteRequired();
  const { progreso, clases, isLoading } = useDashboardData();
  const { data: aula } = useMiAula();

  // Contar clases de hoy
  const clasesHoy = useMemo(() => {
    if (!clases) return 0;
    return clases.filter((c) => isToday(c.fechaProxima)).length;
  }, [clases]);

  // Obtener última planificación en progreso
  const ultimaLeccion = useMemo(() => {
    if (!aula?.sectores) return null;

    for (const sector of aula.sectores) {
      for (const plan of sector.planificaciones) {
        if (plan.progreso.porcentaje > 0 && plan.progreso.porcentaje < 100) {
          return {
            nombre: plan.planificacion.titulo,
            porcentaje: plan.progreso.porcentaje,
            asignacionId: plan.asignacionId,
          };
        }
      }
    }
    return null;
  }, [aula]);

  // Datos de progreso
  const trofeos = progreso?.logros.desbloqueados ?? 0;
  // TODO: Agregar leccionesCompletadas al endpoint mi-progreso
  const lecciones =
    progreso?.actividadReciente.filter((a) => a.tipo === 'leccion_completada').length ?? 0;

  // Loading state mínimo para nombre (crítico)
  if (isLoading && !estudiante.nombre) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      {/* Center Area - Welcome text */}
      <div className="flex flex-col items-center gap-1.5" style={{ padding: '5px 0 0 0' }}>
        <GlowText
          as="p"
          fontSize={12}
          fontWeight={600}
          letterSpacing={3}
          color="#DDD6FE"
          glow="0 0 15px rgba(167,139,250,0.25)"
        >
          ¡BIENVENIDO DE VUELTA!
        </GlowText>

        <GlowText
          as="h1"
          fontSize={64}
          fontWeight={900}
          letterSpacing={4}
          gradient="linear-gradient(180deg, #FFFFFF 0%, #F0E6FF 40%, #C4B5FD 70%, #A78BFA 100%)"
          glow="0 0 30px rgba(167,139,250,0.8), 0 0 60px rgba(124,58,237,0.5), 0 0 100px rgba(255,255,255,0.19)"
        >
          HOLA, {estudiante.nombre.toUpperCase()}
        </GlowText>

        <GlowText as="p" fontSize={14} fontWeight={500} letterSpacing={0.5} color="#A1A1AA">
          ¿Qué vamos a aprender hoy?
        </GlowText>
      </div>

      {/* Main Grid - Bento Cards */}
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          width: 1200,
          height: 480,
          margin: '20px auto 0',
          padding: '0 40px',
        }}
      >
        {/* Left Column - Explorar Mundos (full height) */}
        <div className="row-span-2">
          <Link href="/estudiante/portal/mundos" className="block h-full">
            <BentoCard
              icon={Globe}
              title="Explorar Mundos"
              description="Matemáticas, Programación, Ciencias y Olimpiadas te esperan"
              theme={BENTO_THEMES.explorar}
              large
              bottomContent={<ExplorarMundosBottom />}
            />
          </Link>
        </div>

        {/* Center Column - Arcade + Progreso */}
        <div className="flex flex-col gap-4">
          <Link href="/estudiante/portal/juegos" className="flex-1">
            <BentoCard
              icon={Gamepad2}
              title="Arcade"
              description="Aprende jugando"
              theme={BENTO_THEMES.arcade}
              bottomContent={
                <div
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                  style={{ backgroundColor: 'rgba(251,191,36,0.13)' }}
                >
                  <span style={{ fontSize: 14, color: '#FBBF24' }}>🎫</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#FBBF24',
                    }}
                  >
                    {/* TODO: Endpoint para tickets del estudiante */}∞ tickets
                  </span>
                </div>
              }
            />
          </Link>

          <Link href="/estudiante/portal/progreso" className="flex-1">
            <BentoCard
              icon={Trophy}
              title="Mi Progreso"
              description="Stats y logros"
              theme={BENTO_THEMES.progreso}
              bottomContent={
                <div className="flex items-center gap-5">
                  <div className="flex flex-col gap-0.5">
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#FFFFFF',
                      }}
                    >
                      {lecciones}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 10,
                        fontWeight: 500,
                        color: '#6B7280',
                      }}
                    >
                      Lecciones
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#22C55E',
                      }}
                    >
                      {trofeos}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 10,
                        fontWeight: 500,
                        color: '#6B7280',
                      }}
                    >
                      Trofeos
                    </span>
                  </div>
                </div>
              }
            />
          </Link>
        </div>

        {/* Right Column - Clase en Vivo + Continuar */}
        <div className="flex flex-col gap-4">
          <Link href="/estudiante/portal/clase-en-vivo/demo" className="flex-1">
            <BentoCard
              icon={Video}
              title="Clase en Vivo"
              description="Conecta con tu profe"
              theme={BENTO_THEMES.claseEnVivo}
              bottomContent={
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                >
                  {clasesHoy > 0 ? (
                    <>
                      <div
                        className="rounded-full"
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: '#EF4444',
                          boxShadow: '0 0 12px #EF4444, 0 0 24px #EF4444',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#F87171',
                        }}
                      >
                        {clasesHoy} {clasesHoy === 1 ? 'clase' : 'clases'} hoy
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#6B7280',
                      }}
                    >
                      Sin clases hoy
                    </span>
                  )}
                </div>
              }
            />
          </Link>

          <Link
            href={
              ultimaLeccion
                ? `/estudiante/portal/leccion/${ultimaLeccion.asignacionId}`
                : '/estudiante/portal/mundos'
            }
            className="flex-1"
          >
            <BentoCard
              icon={Play}
              title="Continuar"
              description={ultimaLeccion?.nombre ?? 'Empezá una lección'}
              theme={BENTO_THEMES.continuar}
              bottomContent={
                ultimaLeccion ? (
                  <ProgressBar
                    percent={ultimaLeccion.porcentaje}
                    label={`${ultimaLeccion.porcentaje}% completado`}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#6B7280',
                    }}
                  >
                    Explorá los mundos para comenzar
                  </span>
                )
              }
            />
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
