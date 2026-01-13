'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Layers } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface TabItem {
  /** Unique identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Tab icon (optional) */
  icon?: React.ReactNode;
  /** Tab content */
  content: React.ReactNode;
}

export interface TabsIntentProps {
  /** Title above tabs */
  title?: string;
  /** Tab items */
  tabs: TabItem[];
  /** Default active tab ID */
  defaultTab?: string;
  /** Category badge */
  category?: string;
  /** Tab style */
  variant?: 'pills' | 'underline' | 'cards';
  /** Show continue button */
  showContinue?: boolean;
  /** CTA text */
  ctaText?: string;
  /** Called when continuing */
  onContinue?: () => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const contentVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: lessonSprings.card },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * TabsIntent - Tabbed content layout
 *
 * Organizes content into tabs that users can switch between.
 * Perfect for categorized information or step-by-step walkthroughs.
 *
 * @example
 * ```tsx
 * <TabsIntent
 *   title="Operaciones con Fracciones"
 *   tabs={[
 *     { id: 'sum', label: 'Suma', icon: <Plus />, content: <SumContent /> },
 *     { id: 'sub', label: 'Resta', icon: <Minus />, content: <SubContent /> },
 *     { id: 'mul', label: 'Multiplicación', content: <MulContent /> },
 *   ]}
 *   variant="pills"
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function TabsIntent({
  title,
  tabs,
  defaultTab,
  category = 'Explorar',
  variant = 'pills',
  showContinue = true,
  ctaText = 'Continuar',
  onContinue,
  className,
}: TabsIntentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <motion.div variants={itemVariants}>
          <Badge variant="level" className="inline-flex items-center gap-2 mb-3">
            <Layers className="w-3.5 h-3.5" />
            {category}
          </Badge>
        </motion.div>
        {title && (
          <motion.h1 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-white">
            {title}
          </motion.h1>
        )}
      </motion.div>

      {/* Tab navigation */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 mt-6"
      >
        <div
          className={clsx(
            'flex gap-2 overflow-x-auto pb-2 scrollbar-hide',
            variant === 'underline' && 'border-b border-white/10',
          )}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap',
                  // Pills variant
                  variant === 'pills' && [
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/[0.05]',
                  ],
                  // Underline variant
                  variant === 'underline' && [
                    'rounded-none rounded-t-lg',
                    isActive ? 'text-white' : 'text-white/50 hover:text-white',
                  ],
                  // Cards variant
                  variant === 'cards' && [
                    'px-5 py-3 rounded-xl',
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-white/50 hover:text-white bg-white/[0.02] border border-transparent',
                  ],
                )}
              >
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>

                {/* Underline indicator */}
                {variant === 'underline' && isActive && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--house-primary)]"
                    transition={lessonSprings.button}
                  />
                )}

                {/* Pills indicator */}
                {variant === 'pills' && isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                    transition={lessonSprings.button}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab content */}
      <div className="flex-1 relative z-10 px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentTab && (
            <motion.div
              key={currentTab.id}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full rounded-2xl overflow-hidden"
              style={{
                background: backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border: `1px solid ${borders.subtle}`,
              }}
            >
              <div className="h-full p-6 overflow-auto">{currentTab.content}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      {showContinue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...lessonSprings.button, delay: 0.3 }}
          className="relative z-10 px-6 pb-6 flex justify-center"
        >
          <Button variant="primary" size="lg" onClick={onContinue}>
            {ctaText}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

TabsIntent.displayName = 'TabsIntent';
