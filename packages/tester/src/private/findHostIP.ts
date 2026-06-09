/// <reference types="node" />

import { exec } from 'node:child_process';
import isUnderWSL2 from './isUnderWSL2.ts';

const LOOPBACK_IP = '127.0.0.1';

export default async function findHostIP(): Promise<string> {
  if (await isUnderWSL2()) {
    return new Promise((resolve, reject) => {
      exec('ip route show default', (error, stdout) => {
        if (error) {
          return reject(error);
        }

        resolve(stdout.split(' ')?.[2] || LOOPBACK_IP);
      });
    });
  }

  return LOOPBACK_IP;
}
