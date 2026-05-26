import { scenario } from '@testduet/given-when-then';
import { waitFor } from '@testduet/wait-for';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { logging } from 'selenium-webdriver';
import setup from '../../../../src/host/setup.ts';
import buildAndNavigate from '../../../shared/buildAndNavigate.ts';
import getBrowserLogs from '../../../shared/getBrowserLogs.ts';

scenario(
  'hostToBrowser/withTransferable/hostToBrowser',
  bdd => {
    bdd
      .given(
        'browser loading withTransferable/hostToBrowser.html',
        async () => ({ webDriver: await buildAndNavigate('hostToBrowser/withTransferable/hostToBrowser.html') }),
        ({ webDriver }) => webDriver.quit()
      )
      .and(
        'its associated MessagePort',
        precondition => ({ ...precondition, ...setup(precondition.webDriver) }),
        ({ messagePort }) => messagePort.close()
      )
      .when(
        'a message is posted on the root port followed by the sub port',
        async ({ messagePort }) => {
          const { port1, port2 } = new MessageChannel();

          messagePort.postMessage('Hello, World!', [port2]);
          port1.postMessage('Aloha!');

          return port1;
        },
        (_, subMessagePort) => subMessagePort.close()
      )
      .then('should have logged root message to console', async ({ webDriver }) => {
        await waitFor(async () => {
          expect(await getBrowserLogs(webDriver)).toContainEqual(
            expect.objectContaining({
              level: logging.Level.INFO,
              message: expect.stringContaining(JSON.stringify('Hello, World!'))
            })
          );
        });
      })
      .and('should have logged sub message to console', async ({ webDriver }) => {
        await waitFor(async () => {
          expect(await getBrowserLogs(webDriver)).toContainEqual(
            expect.objectContaining({
              level: logging.Level.INFO,
              message: expect.stringContaining(JSON.stringify('Aloha!'))
            })
          );
        });
      });
  },
  NodeTest
);
