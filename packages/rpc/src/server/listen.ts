import { messagePortRPC as rpc } from 'message-port-rpc';
import type { WebDriver } from 'selenium-webdriver';
import type { BrowsingContext } from '../types/BrowsingContext.ts';
import createHandshakeStub from './private/createHandshakeStub.ts';

function listen(webDriver: WebDriver, browsingContext: BrowsingContext, messagePort: MessagePort): () => void {
  const { fn, teardown } = createHandshakeStub(webDriver, browsingContext);

  rpc(messagePort, fn);

  return teardown;
}

export default listen;
