import { Builder, Browser } from 'selenium-webdriver';

const builder = new Builder();

const webDriver = await builder.forBrowser('chrome').build();

console.log('Hello, World!' satisfies string);

setTimeout(() => {
  webDriver.close();
}, 60_000);
