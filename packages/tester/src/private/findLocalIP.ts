/// <reference types="node" />

import { exec } from 'node:child_process';
import shouldRunUnderWSL2 from './shouldRunUnderWSL2.ts';

const LOOPBACK_IP = '127.0.0.1';

export default async function findLocalIP(): Promise<string> {
  if (await shouldRunUnderWSL2()) {
    return new Promise((resolve, reject) => {
      exec('hostname -I', (error, stdout) => {
        if (error) {
          return reject(error);
        }

        resolve(stdout.split(' ')?.[0] || LOOPBACK_IP);
      });
    });
  }

  return LOOPBACK_IP;
}
