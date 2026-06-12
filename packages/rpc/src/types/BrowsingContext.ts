import type { BrowsingContext as BrowsingContextConstructor } from 'selenium-webdriver';

type BrowsingContext = Awaited<ReturnType<typeof BrowsingContextConstructor>>;

export type { BrowsingContext };
