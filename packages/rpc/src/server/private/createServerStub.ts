import type { WebDriver } from 'selenium-webdriver';
import type { BrowsingContext } from '../../types/BrowsingContext.ts';
import type { Stub } from '../../types/Stub.ts';

function createServerStub(_webDriver: WebDriver, browsingContext: BrowsingContext): Stub {
  return {
    captureScreenshot(): Promise<string> {
      return browsingContext.captureScreenshot();
    },
    getTimestamp(): string {
      return `Hello, World! ${new Date().toLocaleString()}`;
    }
  } satisfies Record<string, (...args: unknown[]) => unknown>;
}

export default createServerStub;
