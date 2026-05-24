import { ROOT_MESSAGE_PORT } from '../constant.ts';

export default function getMessagePort(): MessagePort {
  if (!globalThis.__messagePortFacility) {
    throw new Error('The page does not have test harness installed');
  }

  return globalThis.__messagePortFacility.getMessagePort(ROOT_MESSAGE_PORT);
}
