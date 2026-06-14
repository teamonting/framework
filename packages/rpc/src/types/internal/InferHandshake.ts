import type { StubImplementation } from '../StubImplementation.ts';

type InferHandshake<S extends StubImplementation> = Record<keyof S, MessagePort>;

export type { InferHandshake };
