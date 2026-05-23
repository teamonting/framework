import type { MessagePortFacility, MessagePortFacilitySlice } from '../types.js';

class BrowserMessagePortFacility implements MessagePortFacility {
  #slices = new Map<string, MessagePortFacilitySlice>();

  get<T = any>(key: string): MessagePortFacilitySlice {
    let slice = this.#slices.get(key);

    if (!slice) {
      slice = new BrowserMessagePortFacilitySlice<T>();

      this.#slices.set(key, slice);
    }

    return slice;
  }
}

class BrowserMessagePortFacilitySlice<T = any> implements MessagePortFacilitySlice<T> {
  #browserPort1: MessagePort;
  #browserPort2: MessagePort;
  #queue: T[] = [];

  constructor() {
    const { port1, port2 } = new MessageChannel();

    this.#browserPort1 = port1;
    this.#browserPort2 = port2;

    port1.addEventListener('message', ({ data }) => this.#queue.push(data));
    port1.start();
  }

  flushHostMessages(): readonly T[] {
    return this.#queue.splice(0);
  }

  getBrowserPort(): MessagePort {
    return this.#browserPort2;
  }

  sendToBrowser(message: T): void {
    this.#browserPort1.postMessage(message);
  }
}

globalThis.__messagePortFacility = new BrowserMessagePortFacility();
