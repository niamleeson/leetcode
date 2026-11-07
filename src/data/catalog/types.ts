export interface CatalogSource {
  id: string;
  name: string;
  url: string;
  license: string;
  licenseUrl: string;
  modifications?: string;
}

export interface CatalogSolution {
  language: string;
  label: string;
  code: string;
  sourceId: string;
}

export interface CatalogDocument {
  id: number;
  title: string;
  descriptionHtml: string;
  explanationMarkdown: string;
  approachTitle: string;
  implementationRelationship: 'matching' | 'alternative';
  solutions: CatalogSolution[];
  sources: CatalogSource[];
  originalUrl: string;
}
