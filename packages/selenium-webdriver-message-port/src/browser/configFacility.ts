import type { MessagePortFacility, SerializedMessage } from '../types.js';

class BrowserMessagePortFacility implements MessagePortFacility {
  #channelMap = new Map<string, MessageChannel>();
  #port2ToIdMap = new Map<MessagePort, string>();
  #queue: SerializedMessage[] = [];

  getMessagePort(id: string): MessagePort {
    const existingPort = this.#channelMap.get(id)?.port2;

    if (existingPort) {
      return existingPort;
    }

    const channel = new MessageChannel();

    this.#channelMap.set(id, channel);
    this.#port2ToIdMap.set(channel.port2, id);

    channel.port1.addEventListener('message', ({ data, ports }) => {
      const portIds = ports.map(port => {
        const id = this.#port2ToIdMap.get(port);

        if (typeof id === 'undefined') {
          const id = crypto.randomUUID();

          const bridgingPort = this.getMessagePort(id);

          port.addEventListener('message', ({ data, ports }) => bridgingPort.postMessage(data, [...ports]));
          bridgingPort.addEventListener('message', ({ data, ports }) => port.postMessage(data, [...ports]));

          bridgingPort.start();

          return id;
        }

        return id;
      });

      this.#queue.push(Object.freeze({ id, data, portIds }));
    });

    channel.port1.start();

    return channel.port2;
  }

  sendToBrowser(id: string, data: any, portIds: readonly string[]): void {
    const channel = this.#channelMap.get(id);

    if (!channel) {
      return console.warn(`Host should not send to unbound port ${id}`);
    }

    const ports = portIds.map(portId => this.getMessagePort(portId));

    channel.port1.postMessage(data, ports);
  }

  flushAll(): readonly SerializedMessage[] {
    return Object.freeze(this.#queue.splice(0));
  }
}

globalThis.__messagePortFacility = new BrowserMessagePortFacility();
