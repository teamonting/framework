import { messagePortRPC as rpc } from 'message-port-rpc';
import type { WebDriver } from 'selenium-webdriver';
import createHandshakeStub from './createHandshakeStub';

function listen(webDriver: WebDriver, messagePort: MessagePort): () => void {
  const { fn, teardown } = createHandshakeStub(webDriver);

  rpc(messagePort, fn);

  return teardown;
}

export default listen;
