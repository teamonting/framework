import { messagePortRPC as rpc } from 'message-port-rpc';
import type { InferClient } from '../types/internal/InferClient.ts';
import type { InferHandshake } from '../types/internal/InferHandshake.ts';
import type { StubDeclaration } from '../types/StubDeclaration.ts';
import type { StubImplementation } from '../types/StubImplementation.ts';

function lazyStub<TArgs extends unknown[], TSyncReturn extends unknown>(
  fnFactory: () => Promise<(...args: TArgs) => Promise<TSyncReturn>>
): (...args: TArgs) => Promise<TSyncReturn> {
  let fnPromise: Promise<(...args: TArgs) => Promise<TSyncReturn>> | undefined;

  return async (...args) => (await (fnPromise ?? (fnPromise = fnFactory())))(...args);
}

function createClientStub<T extends StubDeclaration<S>, S extends StubImplementation>(
  declaration: Pick<T, 'keys'>,
  messagePort: MessagePort
): InferClient<S> {
  type Handshake = InferHandshake<S>;

  const clientStubMap = new Map<keyof S, (...args: unknown[]) => Promise<unknown>>();
  const handshakePromise = rpc<() => Handshake>(messagePort)();

  for (const key of declaration.keys) {
    clientStubMap.set(
      key,
      lazyStub(async () => rpc((await handshakePromise)[key]))
    );
  }

  return Object.fromEntries(clientStubMap.entries()) satisfies Record<
    string,
    (...args: unknown[]) => Promise<unknown>
    // TODO: We should not use "as unknown".
  > as unknown as InferClient<S>;
}

export default createClientStub;
