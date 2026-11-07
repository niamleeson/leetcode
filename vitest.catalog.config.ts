import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/components/CatalogProblemContent.test.tsx', 'src/components/CatalogNavigation.test.tsx', 'src/data/solutions/lazy.test.ts'],
  },
});
