import type { StubEnvironment } from './StubEnvironment.ts';
import type { StubImplementation } from './StubImplementation.ts';

type StubDeclaration<T extends StubImplementation> = {
  readonly keys: readonly (keyof T)[];

  implement(environment: StubEnvironment): T;
};

export type { StubDeclaration };
