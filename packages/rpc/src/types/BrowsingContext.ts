import type { BrowsingContext as browsingContextConstructor } from 'selenium-webdriver';

type BrowsingContext = Awaited<ReturnType<typeof browsingContextConstructor>>;

export type { BrowsingContext };
