import { catalogProblems } from './metadata';
import { catalogManifest } from './manifest';

export { catalogProblems, catalogManifest };
export type { CatalogDocument, CatalogSolution, CatalogSource } from './types';

const catalogIds = new Set(catalogProblems.map(problem => problem.id));

export function hasCatalogProblem(id: number): boolean {
  return catalogIds.has(id);
}

export function catalogDocumentUrl(id: number): string {
  if (!hasCatalogProblem(id)) throw new Error(`No catalog entry for problem ${id}`);
  return `${import.meta.env.BASE_URL}${catalogManifest.contentBase}/${id}.json`;
}
