import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import setup from '../../../src/host/setup.ts';
import buildAndNavigate from '../../shared/buildAndNavigate.ts';
import timeout from '../../shared/timeout.ts';

scenario(
  'browserToHost/simple',
  bdd => {
    bdd
      .given(
        'browser loading simple.html',
        async () => ({ webDriver: await buildAndNavigate('browserToHost/simple.html') }),
        ({ webDriver }) => webDriver.quit()
      )
      .and(
        'its associated MessagePort',
        precondition => ({ ...precondition, ...setup(precondition.webDriver) }),
        ({ messagePort }) => messagePort.close()
      )
      .and('listening to "message" event once', precondition => ({
        ...precondition,
        messagePromise: new Promise(resolve => {
          precondition.messagePort.addEventListener('message', ({ data }) => resolve(data), { once: true });
          precondition.messagePort.start();
        })
      }))
      .when('poll() is called', ({ messagePromise, poll }) => {
        poll();

        return messagePromise;
      })
      .then('should receive a message within 2 seconds', async (_, messagePromise) => {
        expect(
          await Promise.race([messagePromise, timeout(2_000, new Error('Timed out while waiting for "message" event'))])
        ).toBe('Hello, World!');
      });
  },
  NodeTest
);
