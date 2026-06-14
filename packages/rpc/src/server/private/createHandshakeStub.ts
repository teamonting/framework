import { messagePortRPC as rpc } from 'message-port-rpc';
import type { InferHandshake } from '../../types/internal/InferHandshake.ts';
import type { StubDeclaration } from '../../types/StubDeclaration.ts';
import type { StubImplementation } from '../../types/StubImplementation.ts';

function createHandshakeStub<T extends StubDeclaration<S>, S extends StubImplementation>(
  declaration: T,
  implementation: S
): {
  readonly fn: () => InferHandshake<S>;
  readonly teardown: () => void;
} {
  const openedPorts = new Set<MessagePort>();

  return {
    fn() {
      const handshakeResultMap = new Map<keyof S, MessagePort>();

      // Prefer StubDeclaration.keys over Object.getOwnPropertyNames(stubDeclaration).
      for (const key of declaration.keys) {
        const value = implementation[key];

        // We already verified the implementation in `listen()`.
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
      > as InferHandshake<S>;
    },
    teardown() {
      for (const port of openedPorts) {
        port.close();
      }
    }
  };
}

export default createHandshakeStub;
