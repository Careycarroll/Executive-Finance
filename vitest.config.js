// vitest.config.js
// Minimal Vitest config. Node environment (no jsdom needed until M3 UI tests).
// Component/UI tests added in M4 will override environment per-file if needed.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js', 'js/**/*.test.js'],
    reporters: 'default',
  },
});
