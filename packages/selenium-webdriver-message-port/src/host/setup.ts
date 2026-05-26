/// <reference types="../env.d.ts" />

import type { WebDriver } from 'selenium-webdriver';
import { v7 } from 'uuid';
import { ROOT_MESSAGE_PORT } from '../constant.ts';

function setup(webDriver: WebDriver): {
  messagePort: MessagePort;
  poll(): void;
} {
  const portMap = new Map<string, MessageChannel>();

  const getMessagePort = (id: string): MessagePort => {
    const existingChannel = portMap.get(id);

    if (existingChannel) {
      return existingChannel.port2;
    }

    const channel = new MessageChannel();

    portMap.set(id, channel);

    channel.port1.addEventListener('message', ({ data, ports }) => {
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

          const bridgingPort = getMessagePort(id);

          port.addEventListener('message', ({ data, ports }) => bridgingPort.postMessage(data, [...ports]));
          bridgingPort.addEventListener('message', ({ data, ports }) => port.postMessage(data, [...ports]));

          return id;
        })
      );
    });

    channel.port1.start();

    return channel.port2;
  };

  const poll = async () => {
    const entries = await (webDriver.executeScript(() => {
      if (!globalThis.__messagePortFacility) {
        throw new Error('The page does not have harness installed');
      }

      return globalThis.__messagePortFacility.flushAll();
    }) as Promise<readonly { readonly id: string; readonly data: any; readonly portIds: readonly string[] }[]>);

    for (const { data, id, portIds } of entries) {
      const messagePort = portMap.get(id);

      if (!messagePort) {
        console.warn(`Browser should not send to unbound port ${id}`);

        continue;
      }

      messagePort.port1.postMessage(
        data,
        portIds.map(portId => getMessagePort(portId))
      );
    }
  };

  return Object.freeze({
    messagePort: getMessagePort(ROOT_MESSAGE_PORT),
    poll
  });
}

export default setup;
