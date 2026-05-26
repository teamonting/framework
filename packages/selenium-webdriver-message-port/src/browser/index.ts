/// <reference types="../env.d.ts" />

import { v7 } from 'uuid';
import { ROOT_MESSAGE_PORT } from '../constant.ts';
import type { MessagePortFacility, SerializedMessage } from '../types.js';

const portMap = new Map<string, MessagePort>();
const portIdMap = new Map<MessagePort, string>();
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

function registerMessagePort(port: MessagePort, portId: string): void {
  if (portMap.has(portId)) {
    throw new Error(`MessagePort with id "${portId}" is already registered, cannot register again`);
  }

  portMap.set(portId, port);
  portIdMap.set(port, portId);

  port.addEventListener('message', ({ data, ports }) => {
    const transferPortIds = ports.map(port => {
      const id = portIdMap.get(port);

      if (typeof id === 'undefined') {
        const id = v7();

        registerMessagePort(port, id);

        return id;
      }

      return id;
    });

    queue.push(Object.freeze({ data, portId, transferPortIds }));
  });

  port.start();
}

function sendToBrowser(message: SerializedMessage): void {
  const { data, portId, transferPortIds } = message;

  const port = portMap.get(portId);

  if (!port) {
    return console.warn(`Host should not send to unbound port ${portId}`);
  }

  port.postMessage(
    data,
    transferPortIds.map(transferPortId => portMap.get(transferPortId) ?? createMessagePort(transferPortId))
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
