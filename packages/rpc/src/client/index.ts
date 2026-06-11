import { messagePortRPC as rpc } from 'message-port-rpc';
import type { GetTimestampFunction, HandshakeFunction, Stub } from '../types.ts';

function lazyStub<TArgs extends unknown[], TSyncReturn extends unknown>(
  fnFactory: () => Promise<(...args: TArgs) => Promise<TSyncReturn>>
): (...args: TArgs) => Promise<TSyncReturn> {
  let fnPromise: Promise<(...args: TArgs) => Promise<TSyncReturn>> | undefined;

  return async (...args) => (await (fnPromise ?? (fnPromise = fnFactory())))(...args);
}

function createStubFactory(): (messagePort: MessagePort) => Stub {
  let stubPromise: Stub;

  function createStub(messagePort: MessagePort): Stub {
    if (!stubPromise) {
      const handshakePromise = rpc<HandshakeFunction>(messagePort)();

      stubPromise = {
        getTimestamp: lazyStub(async () => rpc<GetTimestampFunction>((await handshakePromise).getTimestampPort))
      };
    }

    return stubPromise;
  }

  return createStub;
}

export { createStubFactory };
