import { messagePortRPC as rpc } from 'message-port-rpc';
import type { GetTimestampFunction, HandshakeFunction, Stub } from '../../types.ts';

function lazyStub<TArgs extends unknown[], TSyncReturn extends unknown>(
  fnFactory: () => Promise<(...args: TArgs) => Promise<TSyncReturn>>
): (...args: TArgs) => Promise<TSyncReturn> {
  let fnPromise: Promise<(...args: TArgs) => Promise<TSyncReturn>> | undefined;

  return async (...args) => (await (fnPromise ?? (fnPromise = fnFactory())))(...args);
}

function createStub(messagePort: MessagePort): Stub {
  const handshakePromise = rpc<HandshakeFunction>(messagePort)();

  return {
    getTimestamp: lazyStub(async () => rpc<GetTimestampFunction>((await handshakePromise).getTimestampPort))
  };
}

export default createStub;
