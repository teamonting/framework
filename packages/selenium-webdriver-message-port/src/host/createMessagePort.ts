/// <reference types="../env.d.ts" />

import type { WebDriver } from 'selenium-webdriver';

function createMessagePort<T = any>(
  driver: WebDriver,
  key: string
): {
  readonly messagePort: MessagePort;
  readonly poll: () => Promise<void>;
} {
  const { port1, port2 } = new MessageChannel();

  port1.addEventListener('message', event => {
    driver.executeScript(
      (key: string, job: T) => {
        if (!globalThis.__messagePortFacility) {
          throw new Error('Test harness must be set up on the page before calling createMessagePort()');
        }

        globalThis.__messagePortFacility.get(key).sendToBrowser(job);
      },
      key,
      event.data
    );
  });

  port1.start();

  return Object.freeze({
    messagePort: port2,
    poll: async () => {
      const jobs = (await driver.executeScript((key: string) => {
        if (!globalThis.__messagePortFacility) {
          throw new Error('Test harness must be set up on the page before calling createMessagePort()');
        }

        return globalThis.__messagePortFacility.get(key).flushHostMessages();
      }, key)) satisfies readonly T[];

      for (const job of jobs) {
        port1.postMessage(job);
      }
    }
  });
}

export default createMessagePort;
