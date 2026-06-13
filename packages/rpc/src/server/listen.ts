import { messagePortRPC as rpc } from 'message-port-rpc';
import type { StubDeclaration } from '../types/StubDeclaration.ts';
import type { StubEnvironment } from '../types/StubEnvironment.ts';
import type { StubImplementation } from '../types/StubImplementation.ts';
import createHandshakeStub from './private/createHandshakeStub.ts';

function listen<T extends StubDeclaration<StubImplementation>>(
  stubDeclaration: T,
  stubEnvironment: StubEnvironment,
  messagePort: MessagePort
): () => void {
  const { fn, teardown } = createHandshakeStub(stubDeclaration, stubEnvironment);

  rpc(messagePort, fn);

  return teardown;
}

export default listen;
