/// <reference types="../env.d.ts" />

function createMessagePort<T = any>(key: string): { readonly messagePort: MessagePort } {
  if (!globalThis.__messagePortFacility) {
    throw new Error('Test harness must be set up on the page before calling createMessagePort()');
  }

  const slice = globalThis.__messagePortFacility.get<T>(key);

  return Object.freeze({ messagePort: slice.getBrowserPort() });
}

export default createMessagePort;
