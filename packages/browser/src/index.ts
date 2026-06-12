/// <reference types="node" />

import { listen } from '@onting/rpc/server.js';
import { viaBiDi } from '@onting/selenium-webdriver-message-port/host.js';
import { Browser, Builder, error as SeleniumWebDriverError } from 'selenium-webdriver';
import getScriptManagerInstance from 'selenium-webdriver/bidi/scriptManager.js';
import { Options, ServiceBuilder } from 'selenium-webdriver/chrome.js';
import createSequencer from './private/createSequencer.ts';
import delta from './private/delta.ts';
import findChromeDriverBin from './private/findChromeDriverBin.ts';
import findHostIP from './private/findHostIP.ts';
import findLocalIP from './private/findLocalIP.ts';

const hostIP = await findHostIP();
const localIP = await findLocalIP();

const serviceBuilder = new ServiceBuilder(await findChromeDriverBin())
  .addArguments('--allowed-ips', localIP)
  .setHostname(hostIP);

const service = await serviceBuilder.build();

const options = new Options();

options.enableBidi();

const webDriver = await new Builder()
  .forBrowser(Browser.CHROME)
  .setChromeOptions(options)
  .usingServer(await service.start())
  .build();

// Patch WebSocket so to handle large amount of ScriptManager.
const { socket } = await webDriver.getBidi();

'setMaxListeners' in socket && typeof socket.setMaxListeners === 'function' && socket.setMaxListeners(100);

type RealmInfo = {
  readonly browsingContext: string;
  readonly origin: string;
  readonly realmId: string;
  readonly realmType: string;
};

type ScriptManager = {
  close(): Promise<void>;
  getAllRealms(): Promise<readonly RealmInfo[]>;
  onRealmCreated(callback: () => void): Promise<string>;
  onRealmDestroyed(callback: () => void): Promise<string>;
};

type ActiveRealmContextReadWrite = {
  messagePortPromise: Promise<MessagePort>;
  realmInfo: RealmInfo;
  scriptManagerPromise: Promise<ScriptManager>;

  abort(): void;
};

type ActiveRealmContext = Readonly<ActiveRealmContextReadWrite>;

function shortenRealmId(value: string): string {
  if (value.length > 8) {
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  return value;
}

async function attachRealm(realmInfo: RealmInfo): Promise<void> {
  const { realmId } = realmInfo;

  if (activeRealms.has(realmId)) {
    throw new Error(`Realm "${realmId}" has already attached`);
  }

  console.log(
    `[${shortenRealmId(realmId)}] Attach "${realmInfo.realmType}" realm of browsing context "${realmInfo.browsingContext}" at ${realmInfo.origin}`
  );

  const abortController = new AbortController();

  const scriptManagerPromise = getScriptManagerInstance(
    realmInfo.browsingContext,
    webDriver as any
  ) as unknown as Promise<ScriptManager>;

  const messagePortPromise = scriptManagerPromise
    .then(scriptManager => {
      if (abortController.signal.aborted) {
        throw new Error('Aborted');
      }

      return viaBiDi(scriptManager, { realmId });
    })
    .then(({ messagePort }) => messagePort);

  const entry: ActiveRealmContextReadWrite = {
    abort: abortController.abort.bind(abortController),
    messagePortPromise,
    realmInfo,
    // TODO: It seems `selenium-webdriver@4.44.0` is bugged.
    //       If we use a shared `ScriptManager`, we will receive channel messages more than once.
    //       It seems if `onMessage()` is called twice, `selenium-webdriver` will call every `onMessage()` twice as well (4 times in total).
    scriptManagerPromise
  };

  activeRealms.set(realmId, entry);

  const teardown = listen(webDriver, await entry.messagePortPromise);

  abortController.signal.addEventListener('abort', () => {
    (async () => {
      try {
        (await entry.messagePortPromise).close();
      } catch {}
    })();

    (async () => {
      try {
        (await entry.scriptManagerPromise).close();
      } catch {}
    })();

    try {
      teardown();
    } catch {}
  });
}

async function detachRealm(realmInfo: RealmInfo): Promise<void> {
  const { realmId } = realmInfo;

  const realmContext = activeRealms.get(realmId);

  if (!realmContext) {
    throw new Error(`Realm "${realmId}" has already detached`);
  }

  console.log(
    `[${shortenRealmId(realmId)}] Detach "${realmInfo.realmType}" realm of browsing context "${realmInfo.browsingContext}" at ${realmInfo.origin}`
  );

  realmContext.abort();

  activeRealms.delete(realmId);
}

async function reconcileRealms(): Promise<void> {
  const realms = (await scriptManager.getAllRealms()) as readonly RealmInfo[];

  const realmMap = new Map<string, RealmInfo>(realms.map(realm => [realm.realmId, realm]));

  const [added, _, deleted] = delta<string>(new Set(realmMap.keys()), new Set(activeRealms.keys()));

  for (const realmId of deleted.values()) {
    await detachRealm(activeRealms.get(realmId)!.realmInfo);
  }

  for (const realmId of added.values()) {
    await attachRealm(realmMap.get(realmId)!);
  }
}

const activeRealms: Map<string, ActiveRealmContext> = new Map();
const scriptManager = (await getScriptManagerInstance(null as any, webDriver as any)) as unknown as ScriptManager;

const sequenceReconcileRealmsCall = createSequencer();

const reconcileRealmsInSequence: typeof reconcileRealms = (...args) => {
  return sequenceReconcileRealmsCall(async () => {
    try {
      return await reconcileRealms(...args);
    } catch {}
  });
};

await reconcileRealmsInSequence();

scriptManager.onRealmCreated(() => void reconcileRealmsInSequence());
scriptManager.onRealmDestroyed(() => void reconcileRealmsInSequence());

for (;;) {
  try {
    // Detects when user closed the browser manually.
    await webDriver.getAllWindowHandles();
  } catch (error) {
    if (error instanceof SeleniumWebDriverError.NoSuchSessionError) {
      break;
    }

    throw error;
  }

  // WebDriver.getAllWindowHandles() is not event-driven, we need to call it once every second or so.
  await new Promise(resolve => setTimeout(resolve, 1_000));
}

console.log('Shutting down');

try {
  await scriptManager.close();
} catch {}

for (const realmContext of activeRealms.values()) {
  realmContext.abort();
}
