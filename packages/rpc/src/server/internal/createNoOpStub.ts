import type { WebDriver } from 'selenium-webdriver';
import type { Stub } from '../../types/Stub.ts';
import createServerStub from '../private/createServerStub.ts';

const FAKE_WEB_DRIVER = {} as WebDriver;
const NO_OP = () => {};

function createNoOpStub(): Stub {
  const noOpStubMap = new Map<string, (...args: unknown[]) => unknown>();
  const keys = Object.getOwnPropertyNames(createServerStub(FAKE_WEB_DRIVER));

  for (const key of keys) {
    noOpStubMap.set(key, NO_OP);
  }

  return Object.fromEntries(noOpStubMap.entries()) satisfies Record<string, (...args: unknown[]) => unknown> as Stub;
}

export default createNoOpStub;
