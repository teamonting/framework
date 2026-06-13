import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      browser: './src/browser/index.ts'
    },
    format: 'esm',
    noExternal: ['message-port-rpc', '@onting/selenium-webdriver-message-port'],
    sourcemap: true,
    target: ['chrome148']
  }
]);
