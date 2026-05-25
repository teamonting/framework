import { scenario } from '@testduet/given-when-then';
import { waitFor } from '@testduet/wait-for';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { logging } from 'selenium-webdriver';
import setup from '../../../src/host/setup.ts';
import buildAndNavigate from '../../shared/buildAndNavigate.ts';
import getBrowserLogs from '../../shared/getBrowserLogs.ts';

scenario(
  'hostToBrowser/simple',
  bdd => {
    bdd
      .given(
        'browser loading simple.html',
        () => buildAndNavigate('hostToBrowser/simple.html'),
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
          expect(await getBrowserLogs(webDriver)).toContainEqual(
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
