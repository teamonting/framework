import type { WebDriver } from 'selenium-webdriver';
import type { BrowsingContext } from '../../types/BrowsingContext.ts';
import type { Stub } from '../../types/Stub.ts';
import createServerStub from '../private/createServerStub.ts';

function getStubKeys(): (keyof Stub)[] {
  const keySet = new Set<keyof Stub>();
  const keys = Object.getOwnPropertyNames(createServerStub({} as WebDriver, {} as BrowsingContext));

  for (const key of keys) {
    keySet.add(key satisfies string as keyof Stub);
  }

  return Array.from(keySet);
}

export default getStubKeys;
