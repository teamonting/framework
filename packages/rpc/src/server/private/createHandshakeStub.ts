import { messagePortRPC as rpc } from 'message-port-rpc';
import type { WebDriver } from 'selenium-webdriver';
import type { BrowsingContext } from '../../types/BrowsingContext.ts';
import type { HandshakeReturnValue } from '../../types/HandshakeReturnValue.ts';
import type { Stub } from '../../types/Stub.ts';
import createServerStub from './createServerStub.ts';

function createHandshakeStub(webDriver: WebDriver, browsingContext: BrowsingContext): {
  readonly fn: () => HandshakeReturnValue;
  readonly teardown: () => void;
} {
  const stub = createServerStub(webDriver, browsingContext);
  const openedPorts = new Set<MessagePort>();

  return {
    fn() {
      const handshakeResultMap = new Map<string, MessagePort>();

      for (const key of Object.getOwnPropertyNames(stub)) {
        const value: (...args: unknown[]) => unknown = stub[key satisfies string as keyof Stub];

        const { port1, port2 } = new MessageChannel();

        rpc(port1, value);
        handshakeResultMap.set(key, port2);

        openedPorts.add(port1);
      }

      return Object.fromEntries(handshakeResultMap.entries()) satisfies Record<
        string,
        MessagePort
      > as HandshakeReturnValue;
    },
    teardown() {
      for (const port of openedPorts) {
        port.close();
      }
    }
  };
}

export default createHandshakeStub;
