'use client';

/**
 * SuscripcionSkeleton - Skeleton loader para SuscripcionDashboard
 *
 * Coincide con el layout exacto del dashboard de suscripción.
 */

interface SuscripcionSkeletonProps {
  userName?: string;
}

export function SuscripcionSkeleton({ userName = 'Tutor' }: SuscripcionSkeletonProps) {
  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-9 h-9 rounded-xl" />
          <div>
            <SkeletonBox className="w-40 h-5 mb-1" />
            <SkeletonBox className="w-24 h-3" />
          </div>
        </div>
        <span className="text-slate-400 text-sm hidden sm:block">{userName}</span>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Estado Card Skeleton */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-12 h-12 rounded-xl" />
                <div>
                  <SkeletonBox className="w-32 h-6 mb-2" />
                  <SkeletonBox className="w-24 h-5 rounded-full" />
                </div>
              </div>
              <SkeletonBox className="w-24 h-8" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>

          {/* Inscripciones Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <SkeletonBox className="w-10 h-10 rounded-xl" />
                <SkeletonBox className="w-40 h-6" />
                <SkeletonBox className="w-6 h-6 rounded-full" />
              </div>
              <SkeletonBox className="w-36 h-9 rounded-xl" />
            </div>

            {/* Inscripcion Cards */}
            <div className="space-y-3">
              <InscripcionCardSkeleton />
              <InscripcionCardSkeleton />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionSkeleton />
            <QuickActionSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Base skeleton box with shimmer animation
 */
function SkeletonBox({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-slate-800/50 rounded animate-pulse ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

/**
 * Stat card skeleton
 */
function StatCardSkeleton() {
  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-16 h-4" />
      </div>
      <SkeletonBox className="w-20 h-6" />
    </div>
  );
}

/**
 * Inscripcion card skeleton
 */
function InscripcionCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
      <SkeletonBox className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <SkeletonBox className="w-40 h-5 mb-2" />
        <SkeletonBox className="w-24 h-4 mb-1" />
        <SkeletonBox className="w-20 h-4 rounded-full" />
      </div>
      <div className="text-right shrink-0">
        <SkeletonBox className="w-20 h-5 mb-1" />
        <SkeletonBox className="w-16 h-4" />
      </div>
    </div>
  );
}

/**
 * Quick action skeleton
 */
function QuickActionSkeleton() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <SkeletonBox className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1">
          <SkeletonBox className="w-32 h-5 mb-2" />
          <SkeletonBox className="w-48 h-4" />
        </div>
        <SkeletonBox className="w-5 h-5 rounded shrink-0" />
      </div>
    </div>
  );
}

// Add shimmer keyframes
if (typeof document !== 'undefined') {
  const styleId = 'skeleton-shimmer-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default SuscripcionSkeleton;
