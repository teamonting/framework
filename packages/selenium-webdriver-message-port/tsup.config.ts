import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    browser: './src/browser/index.ts'
  },
  format: 'esm',
  noExternal: ['uuid', 'workthru']
});
