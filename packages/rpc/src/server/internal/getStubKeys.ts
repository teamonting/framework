import type { WebDriver } from 'selenium-webdriver';
import type { Stub } from '../../types/Stub.ts';
import createServerStub from '../private/createServerStub.ts';

const FAKE_WEB_DRIVER = {} as WebDriver;

function getStubKeys(): (keyof Stub)[] {
  const keySet = new Set<keyof Stub>();
  const keys = Object.getOwnPropertyNames(createServerStub(FAKE_WEB_DRIVER));

  for (const key of keys) {
    keySet.add(key satisfies string as keyof Stub);
  }

  return Array.from(keySet);
}

export default getStubKeys;
