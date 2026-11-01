import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: [
      'src/data/hackerrank-react/*.test.tsx',
      'src/components/HackerRankReact.test.tsx',
    ],
  },
});
