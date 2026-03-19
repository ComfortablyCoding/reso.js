import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/middleware/index.ts'],
  dts: {
    tsgo: true,
  },
  deps: {
    neverBundle: 'p-ratelimit',
  },
  exports: true,
  format: ['esm'],
});
