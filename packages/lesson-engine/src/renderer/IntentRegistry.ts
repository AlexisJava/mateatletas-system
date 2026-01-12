import type { ComponentType } from 'react';

export interface IntentProps {
  props: Record<string, unknown>;
  onComplete?: (result?: unknown) => void;
}

type IntentComponent = ComponentType<IntentProps>;

const registry = new Map<string, IntentComponent>();

export const IntentRegistry = {
  register(intent: string, component: IntentComponent): void {
    registry.set(intent, component);
  },
  get(intent: string): IntentComponent | undefined {
    return registry.get(intent);
  },
  has(intent: string): boolean {
    return registry.has(intent);
  },
  list(): string[] {
    return Array.from(registry.keys());
  },
} as const;
