import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/components/logic/**/*.test.ts', 'src/components/logic/**/*.test.tsx', 'src/data/logic/**/*.test.ts', 'src/data/solutions/complexity-variables.test.ts', 'src/hooks/useProgrammingLanguage.test.tsx'],
  },
});
