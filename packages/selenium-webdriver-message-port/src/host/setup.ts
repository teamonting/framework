/// <reference types="../env.d.ts" />

import type { WebDriver } from 'selenium-webdriver';
import { v7 } from 'uuid';
import { ROOT_MESSAGE_PORT } from '../constant.ts';

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

  const registerMessagePort = (port: MessagePort, id: string): void => {
    if (portMap.has(id)) {
      throw new Error(`MessagePort with id "${id}" is already registered, cannot register again`);
    }

    portMap.set(id, port);

    port.addEventListener('message', ({ data, ports }) => {
      webDriver.executeScript(
        (id: string, data: any, portIds: readonly string[]) => {
          if (!globalThis.__messagePortFacility) {
            throw new Error('The page does not have harness installed, cannot send message');
          }

          globalThis.__messagePortFacility.sendToBrowser(id, data, portIds);
        },
        id,
        data,
        ports.map(port => {
          const id = v7();

          registerMessagePort(port, id);

          return id;
        })
      );
    });

    port.start();
  };

  const poll = async () => {
    const entries = await (webDriver.executeScript(() => {
      if (!globalThis.__messagePortFacility) {
        throw new Error('The page does not have harness installed');
      }

      return globalThis.__messagePortFacility.flushAll();
    }) as Promise<readonly { readonly id: string; readonly data: any; readonly portIds: readonly string[] }[]>);

    for (const { data, id, portIds } of entries) {
      const port = portMap.get(id);

      if (!port) {
        console.warn(`Browser should not send to unbound port "${id}"`);

        continue;
      }

      port.postMessage(
        data,
        portIds.map(portId => portMap.get(portId) ?? createMessagePort(portId))
      );
    }
  };

  return Object.freeze({
    messagePort: createMessagePort(ROOT_MESSAGE_PORT),
    poll
  });
}

export default setup;
