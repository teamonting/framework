import { defineConfig } from 'tsup';

export default defineConfig([
  {
    dts: true,
    entry: {
      index: './src/index.ts'
    },
    format: 'esm',
    sourcemap: true,
    target: ['chrome148']
  }
]);
