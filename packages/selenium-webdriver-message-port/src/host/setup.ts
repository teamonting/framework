/// <reference types="../env.d.ts" />

import type { WebDriver } from 'selenium-webdriver';
import { v7 } from 'uuid';
import { ROOT_MESSAGE_PORT } from '../constant.ts';
import type { SerializedMessage } from '../types.ts';

function setup(webDriver: WebDriver): {
  messagePort: MessagePort;
  poll(): Promise<void>;
} {
  const portMap = new Map<string, MessagePort>();

  const createMessagePort = (id: string): MessagePort => {
    if (portMap.has(id)) {
      throw new Error(`MessagePort with id "${id}" is already registered, cannot register again`);
    }

    const { port1, port2 } = new MessageChannel();

    registerMessagePort(port1, id);

    return port2;
  };

  const registerMessagePort = (port: MessagePort, portId: string): void => {
    if (portMap.has(portId)) {
      throw new Error(`MessagePort with id "${portId}" is already registered, cannot register again`);
    }

    portMap.set(portId, port);

    port.addEventListener('message', ({ data, ports }) => {
      webDriver.executeScript(
        (message: SerializedMessage) => {
          if (!globalThis.__messagePortFacility) {
            throw new Error('The page does not have harness installed, cannot send message');
          }

          globalThis.__messagePortFacility.sendToBrowser(message);
        },
        {
          data,
          portId,
          transferPortIds: ports.map(port => {
            const id = v7();

            registerMessagePort(port, id);

            return id;
          })
        } satisfies SerializedMessage
      );
    });

    port.start();
  };

  const poll = async () => {
    const entries = await webDriver.executeScript<SerializedMessage[]>(() => {
      if (!globalThis.__messagePortFacility) {
        throw new Error('The page does not have harness installed');
      }

      return globalThis.__messagePortFacility.flushAll();
    });

    for (const { data, portId, transferPortIds } of entries) {
      const port = portMap.get(portId);

      if (!port) {
        console.warn(`Browser should not send to unbound port "${portId}"`);

        continue;
      }

      port.postMessage(
        data,
        transferPortIds.map(transferPortId => portMap.get(transferPortId) ?? createMessagePort(transferPortId))
      );
    }
  };

  return Object.freeze({
    messagePort: createMessagePort(ROOT_MESSAGE_PORT),
    poll
  });
}

export default setup;
