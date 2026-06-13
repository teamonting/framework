import type { StubDeclaration } from './StubDeclaration';
import type { StubImplementation } from './StubImplementation';

type InferImplementation<T extends StubDeclaration<StubImplementation>> =
  T extends StubDeclaration<infer S> ? S : never;

export type { InferImplementation };
