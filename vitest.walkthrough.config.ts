import { defineConfig } from 'vitest/config';
export default defineConfig({test:{environment:'jsdom',globals:true,include:['src/components/walkthroughs/*.test.tsx','src/data/walkthroughs/*.test.ts','src/components/NeetCodeView.test.tsx','src/data/solutions/neetcode250-regressions.test.ts']}});
