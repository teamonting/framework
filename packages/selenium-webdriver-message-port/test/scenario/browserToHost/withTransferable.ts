import { scenario } from '@testduet/given-when-then';
import { waitFor } from '@testduet/wait-for';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { logging } from 'selenium-webdriver';
import setup from '../../../src/host/setup.ts';
import buildAndNavigate from '../../shared/buildAndNavigate.ts';
import getBrowserLogs from '../../shared/getBrowserLogs.ts';
import timeout from '../../shared/timeout.ts';

scenario(
  'browserToHost/withTransferable',
  bdd => {
    bdd
      .given(
        'browser loading withTransferable.html',
        async () => ({ webDriver: await buildAndNavigate('browserToHost/withTransferable.html') }),
        ({ webDriver }) => webDriver.quit()
      )
      .and('its associated MessagePort', precondition => ({ ...precondition, ...setup(precondition.webDriver) }))
      .and(
        'listening to "message" event once',
        precondition => ({
          ...precondition,
          messagePromise: new Promise<{ readonly data: string; ports: readonly MessagePort[] }>(resolve => {
            precondition.messagePort.addEventListener('message', ({ data, ports }) => resolve({ data, ports }), {
              once: true
            });

            precondition.messagePort.start();
          })
        }),
        ({ messagePort }) => messagePort.close()
      )
      .when(
        'poll() is called and message is received within 2 seconds',
        ({ messagePromise, poll }) => {
          poll();

          return Promise.race([
            messagePromise,
            timeout(2_000, new Error('Timed out while waiting for "message" event'))
          ]);
        },
        // Once poll() is called, the ports[].start() could have been called, we need to close them during teardown.
        (_, { ports }) => ports.forEach(port => port.close())
      )
      .then('should receive "Hello, World!" and a sub-MessagePort', (_, message) => {
        expect(message).toEqual({
          data: 'Hello, World!',
          ports: [expect.any(MessagePort)]
        });
      })
      .when('sending a message via the sub-MessagePort', async (_, message) => message.ports[0].postMessage('Aloha!'))
      .then('should have logged the message to console', async ({ webDriver }) => {
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
