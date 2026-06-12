import type { WebDriver } from 'selenium-webdriver';
import type { Stub } from '../../types/Stub.ts';

function createServerStub(_webDriver: WebDriver): Stub {
  return {
    getTimestamp: () => `Hello, World! ${new Date().toLocaleString()}`
  } satisfies Record<string, (...args: unknown[]) => unknown>;
}

export default createServerStub;
