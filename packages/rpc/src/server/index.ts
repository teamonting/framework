import { messagePortRPC as rpc } from 'message-port-rpc';
import type { WebDriver } from 'selenium-webdriver';
import type { HandshakeFunction } from '../types';

function listen(_webDriver: WebDriver, messagePort: MessagePort) {
  rpc<HandshakeFunction>(messagePort, () => {
    const { port1: getTimestampPort1, port2: getTimestampPort2 } = new MessageChannel();

    rpc(getTimestampPort1, () => `Hello, World! ${new Date().toLocaleString()}`);

    return {
      getTimestampPort: getTimestampPort2
    };
  });
}

export { listen };
