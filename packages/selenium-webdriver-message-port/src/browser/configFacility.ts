import type { MessagePortFacility, SerializedMessage } from '../types.js';

const channelMap = new Map<string, MessageChannel>();
const port2ToIdMap = new Map<MessagePort, string>();
const queue: SerializedMessage[] = [];

function flushAll(): readonly SerializedMessage[] {
  return Object.freeze(queue.splice(0));
}

function getMessagePort(id: string): MessagePort {
  const existingPort = channelMap.get(id)?.port2;

  if (existingPort) {
    return existingPort;
  }

  const channel = new MessageChannel();

  channelMap.set(id, channel);
  port2ToIdMap.set(channel.port2, id);

  channel.port1.addEventListener('message', ({ data, ports }) => {
    const portIds = ports.map(port => {
      const id = port2ToIdMap.get(port);

      if (typeof id === 'undefined') {
        const id = crypto.randomUUID();

        const bridgingPort = getMessagePort(id);

        port.addEventListener('message', ({ data, ports }) => bridgingPort.postMessage(data, [...ports]));
        bridgingPort.addEventListener('message', ({ data, ports }) => port.postMessage(data, [...ports]));

        bridgingPort.start();

        return id;
      }

      return id;
    });

    queue.push(Object.freeze({ id, data, portIds }));
  });

  channel.port1.start();

  return channel.port2;
}

function sendToBrowser(id: string, data: any, portIds: readonly string[]): void {
  const channel = channelMap.get(id);

  if (!channel) {
    return console.warn(`Host should not send to unbound port ${id}`);
  }

  const ports = portIds.map(portId => getMessagePort(portId));

  channel.port1.postMessage(data, ports);
}

globalThis.__messagePortFacility = Object.freeze({
  flushAll,
  getMessagePort,
  sendToBrowser
} satisfies MessagePortFacility);
