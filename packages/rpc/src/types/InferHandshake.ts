import type { InferImplementation } from './InferImplementation';
import type { StubDeclaration } from './StubDeclaration';
import type { StubImplementation } from './StubImplementation';

type InferHandshake<T extends StubDeclaration<StubImplementation>> = Record<keyof InferImplementation<T>, MessagePort>;

export type { InferHandshake };
