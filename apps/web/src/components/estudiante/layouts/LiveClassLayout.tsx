'use client';

import { LiveClassTopBar } from '../organisms/LiveClassTopBar';

/**
 * LiveClassLayout - Layout para clases en vivo (portal_estudiante.pen)
 *
 * Extraído de "13. Clase en Vivo" (xloNE):
 *
 * Estructura vertical:
 * - Top Bar (52px): breadcrumb, live badge, class info, timer, XP
 * - Main Content (flex-1): 2-column layout
 *   - Left Column (fill): video area + action bar
 *   - Right Column (280px): students videos + chat
 *
 * Background: #030014
 * Content padding: 16px
 * Column gap: 16px
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
  isIcon?: boolean;
}

interface LiveClassLayoutProps {
  /** Breadcrumb navigation */
  breadcrumbs: BreadcrumbItem[];
  /** Class title */
  classTitle: string;
  /** Teacher name */
  teacherName: string;
  /** Timer display */
  timer: string;
  /** XP points text */
  xpText: string;
  /** Main video area content */
  videoArea: React.ReactNode;
  /** Action bar below video (mic, camera, etc.) */
  actionBar?: React.ReactNode;
  /** Students video grid */
  studentsVideos?: React.ReactNode;
  /** Chat panel */
  chatPanel?: React.ReactNode;
  className?: string;
}

export function LiveClassLayout({
  breadcrumbs,
  classTitle,
  teacherName,
  timer,
  xpText,
  videoArea,
  actionBar,
  studentsVideos,
  chatPanel,
  className = '',
}: LiveClassLayoutProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-col w-full h-screen ${className}`}
      style={{ backgroundColor: '#030014' }}
    >
      {/* Top Bar - 52px */}
      <LiveClassTopBar
        breadcrumbs={breadcrumbs}
        classTitle={classTitle}
        teacherName={teacherName}
        timer={timer}
        xpText={xpText}
      />

      {/* Main Content - 2 columns */}
      <main className="flex flex-1 min-h-0" style={{ padding: 16, gap: 16 }}>
        {/* Left Column - Video Area + Action Bar */}
        <section className="flex flex-col flex-1 gap-3">
          {/* Video Area */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              borderRadius: 16,
              backgroundColor: '#0F172A',
              border: '2px solid #60A5FA',
              boxShadow: '0 0 20px rgba(96,165,250,0.25)',
            }}
          >
            {videoArea}
          </div>

          {/* Action Bar */}
          {actionBar && (
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                height: 56,
                borderRadius: '16px 16px 0 0',
                background: 'linear-gradient(180deg, #1E1B4B 0%, #030014 100%)',
                padding: '0 12px',
                gap: 16,
              }}
            >
              {actionBar}
            </div>
          )}
        </section>

        {/* Right Column - Students + Chat */}
        <aside className="flex flex-col gap-2.5 shrink-0" style={{ width: 280 }}>
          {/* Students Videos */}
          {studentsVideos && (
            <div
              className="flex flex-col flex-1 overflow-hidden"
              style={{
                borderRadius: 16,
                backgroundColor: '#1E1B4B',
                border: '2px solid #374151',
                padding: 8,
                gap: 6,
              }}
            >
              {studentsVideos}
            </div>
          )}

          {/* Chat Panel */}
          {chatPanel && (
            <div
              className="flex flex-col flex-1 overflow-hidden"
              style={{
                borderRadius: 16,
                backgroundColor: '#1E1B4B',
                border: '2px solid #374151',
              }}
            >
              {chatPanel}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
