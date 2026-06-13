import type { WebDriver } from 'selenium-webdriver';
import type { BrowsingContext } from './BrowsingContext';

type StubEnvironment = {
  readonly browsingContext: BrowsingContext;
  readonly webDriver: WebDriver;
};

export type { StubEnvironment };
