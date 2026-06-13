import type { StubEnvironment } from './StubEnvironment';
import type { StubImplementation } from './StubImplementation';

type StubDeclaration<T extends StubImplementation> = {
  readonly keys: readonly (keyof T)[];

  implement(stubEnvironment: StubEnvironment): T;
};

export type { StubDeclaration };
