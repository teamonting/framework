import { messagePortRPC as rpc } from 'message-port-rpc';
import getStubKeys from '../server/internal/getStubKeys.ts';
import type { HandshakeReturnValue } from '../types/HandshakeReturnValue.ts';
import type { InferClient } from '../types/InferClient.ts';
import type { Stub } from '../types/Stub.ts';

function lazyStub<TArgs extends unknown[], TSyncReturn extends unknown>(
  fnFactory: () => Promise<(...args: TArgs) => Promise<TSyncReturn>>
): (...args: TArgs) => Promise<TSyncReturn> {
  let fnPromise: Promise<(...args: TArgs) => Promise<TSyncReturn>> | undefined;

  return async (...args) => (await (fnPromise ?? (fnPromise = fnFactory())))(...args);
}

function createStub(messagePort: MessagePort): InferClient<Stub> {
  const clientStubMap = new Map<string, (...args: unknown[]) => unknown>();
  const handshakePromise = rpc<() => HandshakeReturnValue>(messagePort)();

  for (const key of getStubKeys()) {
    clientStubMap.set(
      key,
      lazyStub(async () => rpc((await handshakePromise)[key satisfies string as keyof InferClient<Stub>]))
    );
  }

  return Object.fromEntries(clientStubMap.entries()) satisfies Record<
    string,
    (...args: unknown[]) => unknown
  > as InferClient<Stub>;
}

export default createStub;
