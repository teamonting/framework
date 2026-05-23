import path from 'node:path';
import { Browser, Builder } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { createMessagePort } from '@onting/selenium-webdriver-message-port/host.js';

const builder = new Builder();

const webDriver = await builder
  .forBrowser(Browser.CHROME)
  .setChromeService(new ServiceBuilder(path.join(process.cwd(), 'chromedriver.exe')))
  .build();

await webDriver.navigate().to('http://localhost:3000');

// console.log('Hello, World!' satisfies string);

const { messagePort, poll } = createMessagePort(webDriver, 'one');

messagePort.addEventListener('message', ({ data }: { data: any }) => console.log(`HOST RECEIVE: ${data}`));

messagePort.postMessage('Hello, World!');

for (let index = 0; index < 60; index++) {
  poll();

  await new Promise(resolve => setTimeout(resolve, 1_000));
}

webDriver.close();
