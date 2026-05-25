import { scenario } from '@testduet/given-when-then';
import { waitFor } from '@testduet/wait-for';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { Browser, Builder, logging } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import setup from '../src/host/setup.ts';

scenario(
  'simple',
  bdd => {
    bdd
      .given(
        'browser loading simple.html',
        async () => {
          const loggingPrefs = new logging.Preferences();

          loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

          const options = new Options();

          options.setLoggingPrefs(loggingPrefs);

          const webDriver = await new Builder()
            .forBrowser(Browser.CHROME)
            .setChromeOptions(options)
            .usingServer('http://localhost:4444/wd/hub/')
            .build();

          await webDriver.navigate().to('http://web:3000/public/simple.html');

          return webDriver;
        },
        webDriver => webDriver.quit()
      )
      .when(
        'a message is sent',
        async webDriver => {
          const { messagePort } = setup(webDriver);

          messagePort.postMessage('Hello, World!');

          return messagePort;
        },
        (_, messagePort) => messagePort.close()
      )
      .then('should log the message', async webDriver => {
        await waitFor(async () => {
          const logs = await webDriver.manage().logs().get(logging.Type.BROWSER);

          expect(logs).toContainEqual(
            expect.objectContaining({
              level: logging.Level.INFO,
              message: expect.stringContaining(JSON.stringify('Hello, World!'))
            })
          );
        });
      });
  },
  NodeTest
);
