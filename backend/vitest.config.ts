import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    hookTimeout: 300000,
    testTimeout: 300000,
    fileParallelism: false,
  },
});
