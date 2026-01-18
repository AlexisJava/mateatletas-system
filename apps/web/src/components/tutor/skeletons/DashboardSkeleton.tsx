'use client';

/**
 * DashboardSkeleton - Skeleton loader para TutorDashboard
 *
 * Coincide con el layout exacto del dashboard para evitar layout shift.
 * Usa el mismo grid system y dimensiones que el componente real.
 */
export function DashboardSkeleton() {
  return (
    <div className="h-full flex flex-col bg-[#0a0a12] overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Skeleton */}
      <header className="h-16 shrink-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-10 h-10 rounded-xl" />
          <div>
            <SkeletonBox className="w-24 h-4 mb-1" />
            <SkeletonBox className="w-16 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-32 h-4 hidden sm:block" />
          <SkeletonBox className="w-28 h-9 rounded-xl" />
          <SkeletonBox className="w-20 h-9 rounded-xl" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-auto p-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Row 1: Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Row 2: Hijos + Clases */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Mis Hijos Skeleton */}
            <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <SkeletonBox className="w-10 h-10 rounded-xl" />
                <SkeletonBox className="w-24 h-6" />
                <SkeletonBox className="w-8 h-6 rounded-full" />
                <SkeletonBox className="w-32 h-9 rounded-xl ml-auto" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <HijoCardSkeleton />
                <HijoCardSkeleton />
              </div>
            </div>

            {/* Próximas Clases Skeleton */}
            <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <SkeletonBox className="w-10 h-10 rounded-xl" />
                <SkeletonBox className="w-32 h-6" />
              </div>
              <div className="space-y-3">
                <ClaseItemSkeleton />
                <ClaseItemSkeleton />
                <ClaseItemSkeleton />
                <ClaseItemSkeleton />
              </div>
            </div>
          </div>

          {/* Row 3: Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionSkeleton />
            <QuickActionSkeleton />
            <QuickActionSkeleton />
          </div>
        </div>
      </main>
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
 * Stat card skeleton matching the 4-column grid
 */
function StatCardSkeleton() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-16 h-4" />
      </div>
      <SkeletonBox className="w-24 h-8 mb-1" />
      <SkeletonBox className="w-12 h-3" />
    </div>
  );
}

/**
 * Hijo card skeleton matching the grid items
 */
function HijoCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
      <SkeletonBox className="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <SkeletonBox className="w-32 h-5 mb-2" />
        <div className="flex items-center gap-4">
          <SkeletonBox className="w-12 h-4" />
          <SkeletonBox className="w-12 h-4" />
        </div>
      </div>
      <SkeletonBox className="w-5 h-5 rounded shrink-0" />
    </div>
  );
}

/**
 * Clase item skeleton matching the list items
 */
function ClaseItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
      <SkeletonBox className="w-16 h-10 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0">
        <SkeletonBox className="w-24 h-4 mb-1" />
        <SkeletonBox className="w-32 h-3" />
      </div>
    </div>
  );
}

/**
 * Quick action button skeleton
 */
function QuickActionSkeleton() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1">
          <SkeletonBox className="w-28 h-5 mb-1" />
          <SkeletonBox className="w-40 h-3" />
        </div>
        <SkeletonBox className="w-5 h-5 rounded shrink-0" />
      </div>
    </div>
  );
}

// Add shimmer keyframes via style tag (will be deduped by React)
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

export default DashboardSkeleton;
