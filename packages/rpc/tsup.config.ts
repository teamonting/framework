import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      client: './src/client/index.ts'
    },
    format: 'esm',
    noExternal: ['message-port-rpc'],
    sourcemap: true,
    target: ['chrome148']
  },
  {
    dts: true,
    entry: {
      server: './src/server/index.ts'
    },
    format: 'esm',
    sourcemap: true,
    target: ['node24']
  }
]);
