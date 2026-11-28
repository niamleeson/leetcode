import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/components/CopyableBlock.test.tsx', 'src/components/MarkdownCodeBlock.test.tsx', 'src/components/ArticleCodeCopies.test.tsx', 'src/components/CatalogProblemContent.test.tsx', 'src/components/CatalogNavigation.test.tsx', 'src/components/StudySolution.test.tsx', 'src/data/solutions/lazy.test.ts'],
  },
});
