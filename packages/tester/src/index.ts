import path from 'node:path';
import { Browser, Builder } from 'selenium-webdriver';
import { ServiceBuilder } from 'selenium-webdriver/chrome.js';
import { createBridge } from '@onting/selenium-webdriver-message-port/host.js';

const builder = new Builder();

const webDriver = await builder
  .forBrowser(Browser.CHROME)
  .setChromeService(new ServiceBuilder(path.join(process.cwd(), 'chromedriver.exe')))
  .build();

await webDriver.navigate().to('http://localhost:3000');

const bridge = createBridge(webDriver);
const messagePort = bridge.getMessagePort();

messagePort.addEventListener('message', ({ data, ports }: MessageEvent) => {
  console.log(`HOST RECEIVE (numPort=${ports.length}): ${data}`);

  ports[0]?.postMessage('Good day!');
});

const { port1, port2 } = new MessageChannel();

port1.addEventListener('message', ({ data }: MessageEvent) => {
  console.log(`HOST RECEIVE 2: ${data}`);
});

port1.start();

messagePort.postMessage('Hello, World!', [port2]);

for (let index = 0; index < 60; index++) {
  bridge.poll();

  await new Promise(resolve => setTimeout(resolve, 1_000));
}

webDriver.close();
