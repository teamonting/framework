import { defineConfig } from 'tsup';

const CLIENT_TARGET = ['chrome148'];
const SERVER_TARGET = ['node24'];

export default defineConfig([
  {
    dts: true,
    entry: {
      client: './src/client/index.ts'
    },
    format: 'esm',
    noExternal: ['message-port-rpc'],
    sourcemap: true,
    target: CLIENT_TARGET
  },
  {
    dts: true,
    entry: {
      server: './src/server/index.ts'
    },
    format: 'esm',
    sourcemap: true,
    target: SERVER_TARGET
  },
  {
    dts: true,
    entry: {
      index: './src/index.ts'
    },
    format: 'esm',
    sourcemap: true,
    target: [...CLIENT_TARGET, ...SERVER_TARGET]
  }
]);
