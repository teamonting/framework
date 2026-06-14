import type { Promisify } from './Promisify.ts';

type InferClient<T extends Record<string, (...args: unknown[]) => unknown>> = {
  readonly [P in keyof T]: (...args: Parameters<T[P]>) => Promisify<ReturnType<T[P]>>;
};

export type { InferClient };
