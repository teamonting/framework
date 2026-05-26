/// <reference types="../env.d.ts" />

import { v7 } from 'uuid';
import { ROOT_MESSAGE_PORT } from '../constant.ts';
import type { MessagePortFacility, SerializedMessage } from '../types.js';

const portMap = new Map<string, MessagePort>();
const idMap = new Map<MessagePort, string>();
const queue: SerializedMessage[] = [];

function flushAll(): readonly SerializedMessage[] {
  return Object.freeze(queue.splice(0));
}

function createMessagePort(id: string): MessagePort {
  if (portMap.has(id)) {
    throw new Error(`MessagePort with id "${id}" is already registered, cannot register again`);
  }

  const { port1, port2 } = new MessageChannel();

  registerMessagePort(port1, id);

  return port2;
}

function registerMessagePort(port: MessagePort, id: string): void {
  if (portMap.has(id)) {
    throw new Error(`MessagePort with id "${id}" is already registered, cannot register again`);
  }

  portMap.set(id, port);
  idMap.set(port, id);

  port.addEventListener('message', ({ data, ports }) => {
    const portIds = ports.map(port => {
      const id = idMap.get(port);

      if (typeof id === 'undefined') {
        const id = v7();

        registerMessagePort(port, id);

        return id;
      }

      return id;
    });

    queue.push(Object.freeze({ id, data, portIds }));
  });

  port.start();
}

function sendToBrowser(id: string, data: any, portIds: readonly string[]): void {
  const port = portMap.get(id);

  if (!port) {
    return console.warn(`Host should not send to unbound port ${id}`);
  }

  port.postMessage(
    data,
    portIds.map(portId => portMap.get(portId) ?? createMessagePort(portId))
  );
}

globalThis.__messagePortFacility = Object.freeze({
  flushAll,
  sendToBrowser
} satisfies MessagePortFacility);

Object.defineProperty(window.navigator, 'webdriverMessagePort', {
  configurable: false,
  enumerable: true,
  writable: false,
  value: createMessagePort(ROOT_MESSAGE_PORT)
});
