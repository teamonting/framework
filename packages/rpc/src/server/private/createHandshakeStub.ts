import { messagePortRPC as rpc } from 'message-port-rpc';
import type { InferHandshake } from '../../types/InferHandshake.ts';
import type { StubDeclaration, StubEnvironment, StubImplementation } from '../../types/StubDeclaration.ts';

function createHandshakeStub<T extends StubDeclaration<StubImplementation>>(
  stubDeclaration: T,
  stubEnvironment: StubEnvironment
): {
  readonly fn: () => InferHandshake<T>;
  readonly teardown: () => void;
} {
  const stub = stubDeclaration.implement(stubEnvironment);
  const openedPorts = new Set<MessagePort>();

  return {
    fn() {
      const handshakeResultMap = new Map<string, MessagePort>();

      // Prefer StubDeclaration.keys over Object.getOwnPropertyNames(stubDeclaration).
      for (const key of stubDeclaration.keys) {
        const value = stub[key];

        // Handle discrepancies between key and implementation.
        // TODO: Add console.warn() about discrepancies.
        if (value) {
          const { port1, port2 } = new MessageChannel();

          rpc(port1, value);
          handshakeResultMap.set(key, port2);

          openedPorts.add(port1);
        }
      }

      return Object.fromEntries(handshakeResultMap.entries()) satisfies Record<
        string,
        MessagePort
      > as InferHandshake<T>;
    },
    teardown() {
      for (const port of openedPorts) {
        port.close();
      }
    }
  };
}

export default createHandshakeStub;
