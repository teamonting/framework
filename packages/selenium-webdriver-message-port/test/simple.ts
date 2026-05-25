import { scenario } from '@testduet/given-when-then';
import * as TestFacility from 'node:test';
import { Browser, Builder } from 'selenium-webdriver';
import setup from '../src/host/setup.ts';

scenario(
  'simple',
  bdd => {
    bdd
      .given('browser loading simple.html', async () => {
        const builder = new Builder();

        const webDriver = await builder
          .forBrowser(Browser.CHROME)
          .usingServer('http://localhost:4444/wd/hub')
          // .setChromeService(new ServiceBuilder(path.join(process.cwd(), 'chromedriver.exe')))
          .build();

        await webDriver.navigate().to('http://web:8080/public/simple.html');

        return webDriver;
      })
      .when('a message is sent', async driver => {
        const { messagePort, poll } = setup(driver);

        messagePort.postMessage('Hello, World!');
      })
      .then('should log the message', async driver => {
        const logs = driver.manage().logs();

        console.log(logs.getAvailableLogTypes());
      });
  },
  TestFacility
);
