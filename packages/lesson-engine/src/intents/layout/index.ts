/**
 * Layout Intents
 *
 * Intents for organizing content structure:
 * - SplitIntent: Two-column layout with configurable ratios
 * - BentoIntent: Apple-style grid layout with varied cell sizes
 * - TabsIntent: Tabbed content navigation
 * - CarouselIntent: Horizontal slide carousel with navigation
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 */

export { SplitIntent, type SplitIntentProps, type SplitRatio } from './SplitIntent';
export { BentoIntent, type BentoIntentProps, type BentoCell } from './BentoIntent';
export { TabsIntent, type TabsIntentProps, type TabItem } from './TabsIntent';
export { CarouselIntent, type CarouselIntentProps, type CarouselSlide } from './CarouselIntent';
