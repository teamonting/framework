/// <reference types="node" />

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import findChromeDriverBin from './findChromeDriverBin.ts';

// https://docs.microsoft.com/en-us/windows/wsl/compare-versions#accessing-windows-networking-apps-from-linux-host-ip
async function shouldRunUnderWSL2_(): Promise<boolean> {
  if (basename(await findChromeDriverBin()).toLowerCase() === 'chromedriver') {
    // If no ChromeDriver for Windows found in path, do not run inside WSL2.
    return false;
  }

  try {
    const procVersion = await readFile('/proc/version', 'utf-8');

    return /WSL2/iu.test(procVersion);
  } catch (err) {
    return false;
  }
}

let promise: Promise<boolean>;

export default function shouldRunUnderWSL2(): Promise<boolean> {
  return promise || (promise = shouldRunUnderWSL2_());
}
