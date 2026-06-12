import type { Stub } from './Stub.ts';

type HandshakeReturnValue = {
  readonly [P in keyof Stub]: MessagePort;
};

export type { HandshakeReturnValue };
