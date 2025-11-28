declare module '@testing-library/dom' {
  export type Queries = Record<string, unknown>;
  export type BoundFunction<T> = (...args: unknown[]) => unknown;
  export type Config = Record<string, unknown>;
  export type ConfigFn = (existing: Config) => Partial<Config>;

  export const screen: any;
  export const fireEvent: any;
  export function waitFor<T>(
    callback: () => T | Promise<T>,
    options?: { timeout?: number; interval?: number },
  ): Promise<T>;
  export function within(container: Element | Document): typeof screen;
  export function configure(configDelta: ConfigFn | Partial<Config>): void;
  export function getConfig(): Config;
  export function cleanup(): Promise<void> | void;
}
