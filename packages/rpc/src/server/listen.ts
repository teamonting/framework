import { messagePortRPC as rpc } from 'message-port-rpc';
import type { StubDeclaration } from '../types/StubDeclaration.ts';
import type { StubEnvironment } from '../types/StubEnvironment.ts';
import type { StubImplementation } from '../types/StubImplementation.ts';
import createHandshakeStub from './private/createHandshakeStub.ts';
import verifyImplementation from './private/verifyImplementation.ts';

function listen<T extends StubDeclaration<S>, S extends StubImplementation>(
  declaration: T,
  environment: StubEnvironment,
  messagePort: MessagePort
): () => void {
  const implementation: S = declaration.implement(environment);

  verifyImplementation(declaration, implementation);

  const { fn, teardown } = createHandshakeStub(declaration, implementation);

  rpc(messagePort, fn);

  return teardown;
}

export default listen;
