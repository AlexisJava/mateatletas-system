'use client';

/**
 * Skeleton - Componentes de loading placeholder para el Portal Estudiante
 *
 * Usa el estilo glassmorphism del portal con animación shimmer
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Base skeleton con animación shimmer */
export function Skeleton({ className = '', style }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        ...style,
      }}
    />
  );
}

/** Skeleton para texto de una línea */
export function SkeletonText({
  width = '100%',
  height = 16,
}: {
  width?: string | number;
  height?: number;
}): React.JSX.Element {
  return <Skeleton style={{ width, height, borderRadius: 4 }} />;
}

/** Skeleton para stat cards del Main Menu */
export function SkeletonStatCard(): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-4 flex-1 h-full rounded-2xl p-5 animate-pulse"
      style={{
        backgroundColor: 'rgba(15,23,42,0.5)',
        border: '1px solid #334155',
      }}
    >
      <Skeleton style={{ width: 44, height: 44, borderRadius: 12 }} />
      <div className="flex flex-col gap-2">
        <Skeleton style={{ width: 60, height: 24, borderRadius: 4 }} />
        <Skeleton style={{ width: 80, height: 12, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/** Skeleton para Bento cards del Main Menu */
export function SkeletonBentoCard({ large = false }: { large?: boolean }): React.JSX.Element {
  return (
    <div
      className="rounded-[28px] p-6 animate-pulse"
      style={{
        height: large ? '100%' : 200,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex flex-col gap-3">
        <Skeleton style={{ width: 48, height: 48, borderRadius: 16 }} />
        <Skeleton style={{ width: '60%', height: 24, borderRadius: 4 }} />
        <Skeleton style={{ width: '80%', height: 14, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/** Skeleton para World Portal cards */
export function SkeletonWorldCard(): React.JSX.Element {
  return (
    <div
      className="rounded-[32px] animate-pulse"
      style={{
        width: 220,
        height: 300,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '2px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex flex-col items-center gap-4 p-6 pt-12">
        <Skeleton style={{ width: 80, height: 80, borderRadius: 24 }} />
        <Skeleton style={{ width: 120, height: 20, borderRadius: 4 }} />
        <div className="flex gap-3 mt-4">
          <Skeleton style={{ width: 50, height: 24, borderRadius: 12 }} />
          <Skeleton style={{ width: 50, height: 24, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton para lesson cards en Mi Progreso */
export function SkeletonLessonCard(): React.JSX.Element {
  return (
    <div
      className="rounded-xl p-4 animate-pulse"
      style={{
        width: 280,
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid #334155',
      }}
    >
      <div className="flex flex-col gap-3">
        <Skeleton style={{ width: '70%', height: 16, borderRadius: 4 }} />
        <Skeleton style={{ width: '100%', height: 6, borderRadius: 3, marginTop: 40 }} />
        <Skeleton style={{ width: '40%', height: 12, borderRadius: 4 }} />
      </div>
    </div>
  );
}

/** Skeleton para el Main Menu completo */
export function SkeletonMainMenu(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Welcome text */}
      <div className="flex flex-col items-center gap-2">
        <Skeleton style={{ width: 160, height: 12, borderRadius: 4 }} />
        <Skeleton style={{ width: 280, height: 48, borderRadius: 8 }} />
        <Skeleton style={{ width: 200, height: 14, borderRadius: 4 }} />
      </div>

      {/* Bento Grid */}
      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          width: 1200,
          height: 480,
          padding: '0 40px',
        }}
      >
        <div className="row-span-2">
          <SkeletonBentoCard large />
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonBentoCard />
          <SkeletonBentoCard />
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonBentoCard />
          <SkeletonBentoCard />
        </div>
      </div>
    </div>
  );
}

/** Skeleton para Mi Progreso */
export function SkeletonMiProgreso(): React.JSX.Element {
  return (
    <div
      className="flex flex-col gap-6"
      style={{ width: 1184, margin: '0 auto', padding: '0 48px' }}
    >
      {/* Stats Row */}
      <div className="flex gap-6" style={{ height: 80 }}>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton style={{ width: 120, height: 16, borderRadius: 4 }} />
              <Skeleton style={{ width: 80, height: 14, borderRadius: 4 }} />
            </div>
            <div className="flex gap-4">
              <SkeletonLessonCard />
              <SkeletonLessonCard />
              <SkeletonLessonCard />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
