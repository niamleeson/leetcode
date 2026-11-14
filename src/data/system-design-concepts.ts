// Highlight architecture components only. A component's role determines its color.
// Keep commands, fields, algorithms, protocols, and operational properties plain.
export const conceptCategories = {
  storage: {
    label: 'Data & storage',
    examples: 'Databases and caches, including PostgreSQL and Redis.',
    color: 'bg-sky-400/15 text-sky-200 light:bg-sky-100 light:text-sky-950',
  },
  routing: {
    label: 'Traffic & routing',
    examples: 'API gateways, load balancers, and CDNs.',
    color: 'bg-violet-400/20 text-violet-200 light:bg-violet-100 light:text-violet-950',
  },
  processing: {
    label: 'Servers & services',
    examples: 'The Primary Server, Read Service, Write Service, and application servers.',
    color: 'bg-emerald-400/15 text-emerald-200 light:bg-emerald-100 light:text-emerald-950',
  },
  coordination: {
    label: 'Coordination',
    examples: 'Shared counters and ID allocators.',
    color: 'bg-amber-400/15 text-amber-200 light:bg-amber-100 light:text-amber-950',
  },
  client: {
    label: 'Clients',
    examples: 'The client application or browser.',
    color: 'bg-slate-400/15 text-slate-200 light:bg-slate-200 light:text-slate-900',
  },
} as const;

export const systemDesignConcepts = [
  { key: 'cache', category: 'storage', terms: ['cache', 'caches'] },
  { key: 'database', category: 'storage', terms: ['database', 'databases', 'PostgreSQL', 'primary database', 'database server', 'database servers'] },
  { key: 'redis', category: 'storage', terms: ['Redis'] },
  { key: 'cdn', category: 'routing', terms: ['content delivery network', 'CDN'] },
  { key: 'gateway', category: 'routing', terms: ['API gateway'] },
  { key: 'load-balancer', category: 'routing', terms: ['load balancer', 'load balancers'] },
  { key: 'client', category: 'client', terms: ['client', 'browser'] },
  { key: 'counter', category: 'coordination', terms: ['global counter', 'counter', 'counters', 'ID allocator', 'allocator'] },
  { key: 'service', category: 'processing', terms: ['primary server', 'read service', 'write service', 'creation service', 'redirect service', 'creation server', 'application server', 'application servers', 'stateless application servers'] },
] satisfies { key: string; category: keyof typeof conceptCategories; terms: string[] }[];
