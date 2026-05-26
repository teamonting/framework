import { scenario } from '@testduet/given-when-then';
import { waitFor } from '@testduet/wait-for';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { logging } from 'selenium-webdriver';
import setup from '../../../../src/host/setup.ts';
import buildAndNavigate from '../../../shared/buildAndNavigate.ts';
import getBrowserLogs from '../../../shared/getBrowserLogs.ts';

scenario(
  'hostToBrowser/withTransferable/browserToHost',
  bdd => {
    bdd
      .given(
        'browser loading withTransferable/browserToHost.html',
        async () => ({ webDriver: await buildAndNavigate('hostToBrowser/withTransferable/browserToHost.html') }),
        ({ webDriver }) => webDriver.quit()
      )
      .and(
        'its associated MessagePort',
        precondition => ({ ...precondition, ...setup(precondition.webDriver) }),
        ({ messagePort }) => messagePort.close()
      )
      .when(
        'a message is posted',
        async ({ messagePort }) => {
          const { port1, port2 } = new MessageChannel();
          const subMessageEvents: MessageEvent[] = [];

          port1.addEventListener('message', event => subMessageEvents.push(event), { once: true });
          port1.start();

          messagePort.postMessage('Hello, World!', [port2]);

          return { subMessageEvents, subMessagePort: port1 };
        },
        (_, { subMessagePort }) => subMessagePort.close()
      )
      .then('should have logged the message to console', ({ webDriver }) =>
        waitFor(async () => {
          expect(await getBrowserLogs(webDriver)).toContainEqual(
            expect.objectContaining({
              level: logging.Level.INFO,
              message: expect.stringContaining(JSON.stringify('Hello, World!'))
            })
          );
        })
      )
      .and('should receive the message from sub-MessagePort', async ({ poll }, { subMessageEvents }) => {
        await waitFor(async () => {
          await poll();

          expect(subMessageEvents).toEqual([
            expect.objectContaining({
              data: 'Aloha!',
              ports: []
            })
          ]);
        });
      });
  },
  NodeTest
);
