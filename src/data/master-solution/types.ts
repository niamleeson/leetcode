export interface MasterVariant {
  key: string;
  problemId: number;
  title: string;
  name: string;
  variant?: string;
  units: string[];
  rule: string;
  entryPoints: string[];
  exampleCount: number;
  sourceHash: string;
}
export interface MasterProblem {
  id: number;
  title: string;
  topic: string;
  url: string;
  overlap: string[];
  sourceNotes: string;
  variants: MasterVariant[];
}
export interface MasterUnit {
  id: string;
  chapter: string;
  name: string;
  task: string;
  remember: string;
  watchFor: string;
  problemIds: number[];
  variantKeys: string[];
}
export interface MasterCatalog {
  units: MasterUnit[];
  problems: MasterProblem[];
  chapters: { name: string; story: string; unitIds: string[] }[];
  totals: { problems: number; variants: number; units: number; examples: number };
  dailyExample: { input: unknown; result: unknown; stages: { unit: string; problemId: number; task: string }[] };
}
