import { messagePortRPC as rpc } from 'message-port-rpc';
import type { InferClient } from '../types/InferClient.ts';
import type { InferHandshake } from '../types/InferHandshake.ts';
import type { InferImplementation } from '../types/InferImplementation.ts';
import type { StubDeclaration } from '../types/StubDeclaration.ts';
import type { StubImplementation } from '../types/StubImplementation.ts';

function lazyStub<TArgs extends unknown[], TSyncReturn extends unknown>(
  fnFactory: () => Promise<(...args: TArgs) => Promise<TSyncReturn>>
): (...args: TArgs) => Promise<TSyncReturn> {
  let fnPromise: Promise<(...args: TArgs) => Promise<TSyncReturn>> | undefined;

  return async (...args) => (await (fnPromise ?? (fnPromise = fnFactory())))(...args);
}

function createClientStub<T extends StubDeclaration<StubImplementation>>(
  stubDeclaration: Pick<T, 'keys'>,
  messagePort: MessagePort
): InferClient<InferImplementation<T>> {
  type Handshake = InferHandshake<T>;

  const clientStubMap = new Map<string, (...args: unknown[]) => Promise<unknown>>();
  const handshakePromise = rpc<() => Handshake>(messagePort)();

  for (const key of stubDeclaration.keys) {
    clientStubMap.set(
      key,
      lazyStub(async () => {
        // TODO: Fix message-port-rpc to use `Awaited`.
        const result: Handshake = (await handshakePromise) as Handshake;

        return rpc(result[key satisfies string as keyof InferClient<InferImplementation<T>>]);
      })
    );
  }

  return Object.fromEntries(clientStubMap.entries()) satisfies Record<
    string,
    (...args: unknown[]) => Promise<unknown>
    // TODO: We should not use "as unknown".
  > as unknown as InferClient<InferImplementation<T>>;
}

export default createClientStub;
