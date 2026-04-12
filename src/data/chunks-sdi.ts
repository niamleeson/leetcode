/**
 * SDI study chunks. One chunk per chapter of Alex Xu Vol 1 + Vol 2.
 *
 * Chunks reference `solutionMap[problemId]` for all long-form content (intuition,
 * approach, code, diagrams). The per-chapter metadata below only holds what is
 * *not* derivable from the chapter text: trigger signals, discriminators, palace
 * probes, and the "must-say" key points for free-recall grading.
 *
 * Chapters with no metadata entry still get a usable chunk — defaults are
 * synthesized from solution.intuition and solution.hints in buildSdiChunks().
 */

import { solutionMap } from './solutions';
import { sdiVol1Problems } from './problems-sdi-vol1';
import { sdiVol2Problems } from './problems-sdi-vol2';

export interface Discriminator {
  /** Chunk id this is commonly confused with. */
  vs: string;
  /** One-sentence rule for telling them apart. */
  how: string;
}

export interface SdiChunkMeta {
  /** Short trigger phrases. If the interviewer prompt contains any of these,
   *  this chunk is probably the right answer. */
  triggerSignals: string[];
  /** 3-6 bullet points you must cover in free-recall to count as "Good". */
  keyPoints: string[];
  /** Pairs of "easy to confuse with X → here's the tell". */
  discriminators: Discriminator[];
  /** Probes to ask yourself when walking the memory palace. */
  palaceProbes: string[];
  /** Short tags for interleaving constraint (avoid two consecutive chunks
   *  sharing a tag when the queue is long enough). */
  tags: string[];
}

export interface SdiChunk {
  id: string;              // "sdi-9104"
  problemId: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  volume: 'vol1' | 'vol2';
  category: string;
  oneLiner: string;        // Derived from solution.intuition first sentence.
  meta: SdiChunkMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-chapter metadata. Partial — missing chapters fall back to defaults.
// ─────────────────────────────────────────────────────────────────────────────

const META: Record<number, Partial<SdiChunkMeta>> = {
  9101: {
    triggerSignals: [
      'scale from zero',
      'millions of users',
      'progressive scaling',
      'how would you evolve this architecture',
    ],
    keyPoints: [
      'Separate web and DB tiers before anything else',
      'Load balancer + multiple stateless web servers',
      'Read replicas for read-heavy; cache-aside for hot reads',
      'CDN for static assets; stateless session state in Redis',
      'Message queues to decouple slow tasks',
      'Sharding only when vertical scaling and replication are exhausted',
    ],
    discriminators: [
      {
        vs: 'sdi-9106',
        how: 'Vol1 Ch1 is a *journey* across scale stages; Ch6 is the *internals* of a single KV store (quorum, Merkle trees, gossip).',
      },
    ],
    palaceProbes: [
      'At 1M users, what fails first and why?',
      'Which stages are reversible mistakes vs. one-way doors?',
      'When would you NOT add a cache?',
    ],
    tags: ['foundations', 'scaling-story'],
  },

  9102: {
    triggerSignals: [
      'estimate',
      'how many',
      'back of envelope',
      'qps',
      'storage per year',
    ],
    keyPoints: [
      'Power-of-2 table: 2^10≈1KB, 2^20≈1MB, 2^30≈1GB, 2^40≈1TB',
      'Latency table: L1≈1ns, RAM≈100ns, SSD≈100µs, disk seek≈10ms, cross-country≈150ms',
      '1 day ≈ 86,400 sec ≈ 10^5 sec',
      'DAU × actions/day ÷ 86,400 = average QPS; ×2–3 for peak',
      'Always write assumptions on the board before computing',
    ],
    discriminators: [],
    palaceProbes: [
      'What is the typical 80/20 read:write ratio you assume?',
      'What does 100M DAU × 1 write/day come out to in QPS?',
    ],
    tags: ['foundations', 'estimation'],
  },

  9103: {
    triggerSignals: [
      'interview framework',
      '4 step',
      'how do I approach',
      'what do I say first',
    ],
    keyPoints: [
      'Step 1 (3–10 min): clarify scope, functional + non-functional, back-of-envelope',
      'Step 2 (10–15 min): high-level boxes, API contract, data model, get buy-in',
      'Step 3 (10–25 min): deep dive on what the interviewer cares about; drill bottlenecks',
      'Step 4 (3–5 min): recap, name trade-offs, next scale curve, failure modes',
    ],
    discriminators: [],
    palaceProbes: [
      'What is the single most common failure mode in Step 2?',
      'When should you resist going deeper in Step 3?',
    ],
    tags: ['foundations', 'meta'],
  },

  9104: {
    triggerSignals: [
      'rate limit',
      'throttle',
      'requests per second per user',
      'api quota',
      'prevent abuse',
    ],
    keyPoints: [
      'Token bucket: simple, allows bursts up to bucket size',
      'Leaky bucket: smooths output rate; queue-based',
      'Fixed window counter: simple but boundary spike problem',
      'Sliding window log: exact but memory-expensive',
      'Sliding window counter: approximate, cheap, production default',
      'Store in Redis with atomic INCR + EXPIRE, not local memory',
      'Return 429 with Retry-After and X-RateLimit-* headers',
    ],
    discriminators: [
      {
        vs: 'sdi-9204',
        how: 'Rate limiter drops/delays excess *requests*. A distributed queue *always* accepts but defers work.',
      },
    ],
    palaceProbes: [
      'What is the boundary spike bug in fixed-window and how does sliding-window-counter kill it?',
      'Why do you need a distributed Redis instead of per-server memory?',
      'What happens if Redis is down — fail open or fail closed?',
    ],
    tags: ['core-infra', 'throttling'],
  },

  9105: {
    triggerSignals: [
      'consistent hashing',
      'hash ring',
      'node joins or leaves',
      'minimize reshuffle',
      'sharding key distribution',
    ],
    keyPoints: [
      'Naive hash mod N: adding a node reshuffles ~all keys',
      'Ring of [0, 2^n); keys and nodes hashed to same space',
      'Walk clockwise to first node ≥ hash(key)',
      'Virtual nodes solve uneven distribution and hot spots',
      'Adding/removing a node only moves K/N keys on average',
    ],
    discriminators: [
      {
        vs: 'sdi-9107',
        how: 'Consistent hashing is about *where data lives*. Unique-ID generation is about *giving each write a globally-unique label*.',
      },
    ],
    palaceProbes: [
      'Why do virtual nodes help, and what is the trade-off?',
      'What breaks if two keys hash to the exact same point?',
    ],
    tags: ['core-infra', 'hashing'],
  },

  9106: {
    triggerSignals: [
      'key-value store',
      'distributed kv',
      'dynamo',
      'cassandra',
      'how does a nosql store work internally',
    ],
    keyPoints: [
      'CAP: pick 2 of Consistency, Availability, Partition tolerance (partitions always possible → really C vs A)',
      'Consistent hashing for partitioning',
      'Replication factor N; quorum reads R + writes W, with R + W > N for strong consistency',
      'Vector clocks / version vectors for conflict detection',
      'Merkle trees for anti-entropy between replicas',
      'Gossip protocol for membership',
      'SSTable + LSM tree for on-disk storage',
      'Bloom filter to skip SSTables on negative lookups',
    ],
    discriminators: [
      {
        vs: 'sdi-9115',
        how: 'KV store is a primitive for small, hot values. Google Drive / S3 is a *file* store — chunked, cold, metadata+blob split.',
      },
    ],
    palaceProbes: [
      'R=1, W=N — what does that give you and what does it cost?',
      'Why is the Bloom filter in front of SSTables, not behind?',
      'What does a node death during a quorum write look like?',
    ],
    tags: ['core-infra', 'storage'],
  },

  9107: {
    triggerSignals: [
      'unique id',
      'snowflake',
      'distributed id',
      'monotonic id',
      'no collisions across nodes',
    ],
    keyPoints: [
      'Requirements: unique, sortable by time, 64-bit, high throughput',
      'Snowflake layout: 1 sign + 41 timestamp + 10 machine + 12 sequence',
      'Timestamp is ms since custom epoch',
      'Clock skew / NTP rollback is the failure mode — detect and wait',
      'Alternatives: UUIDv7 (time-ordered UUID), DB ticket servers, ZooKeeper sequencers',
    ],
    discriminators: [
      {
        vs: 'sdi-9105',
        how: 'Snowflake gives each *row* a unique label. Consistent hashing decides which *node* stores a row.',
      },
    ],
    palaceProbes: [
      'Why 41 bits of time, not 32 or 64?',
      'What happens if two machines share a machine ID?',
    ],
    tags: ['core-infra', 'ids'],
  },

  9108: {
    triggerSignals: [
      'url shortener',
      'tinyurl',
      'bit.ly',
      'short link',
    ],
    keyPoints: [
      'API: POST /shorten → {longUrl} returns shortUrl; GET /:key returns 301',
      'Key = base62 of a numeric id (snowflake or counter)',
      '~7 chars of base62 gives ~3.5 trillion keys',
      'Cache reads heavily — URL lookups are 100:1 read-heavy',
      'Use 301 (permanent) for cache-friendliness, 302 if you want click analytics',
    ],
    discriminators: [
      {
        vs: 'sdi-9113',
        how: 'URL shortener is *exact lookup* by key. Autocomplete is *prefix search* across a trie.',
      },
    ],
    palaceProbes: [
      'Why base62 and not base64?',
      'Why 301 not 302 — what do you lose?',
    ],
    tags: ['web', 'lookup'],
  },

  9109: {
    triggerSignals: [
      'web crawler',
      'googlebot',
      'crawl the web',
      'fetch many pages',
    ],
    keyPoints: [
      'Seed URLs → frontier queue → fetcher → parser → URL extractor → back to frontier',
      'robots.txt and politeness per host (delay between requests to same host)',
      'URL dedup: Bloom filter + exact hash set',
      'Content dedup: SimHash / MinHash on shingles',
      'DNS resolver cache is critical or DNS becomes the bottleneck',
      'Priority queue for crawl-worthiness (PageRank-style)',
    ],
    discriminators: [
      {
        vs: 'sdi-9113',
        how: 'Crawler *discovers* pages by following links. Autocomplete *indexes* a fixed query corpus for prefix search.',
      },
    ],
    palaceProbes: [
      'What goes wrong if you forget politeness?',
      'Why SimHash instead of exact hashing for content dedup?',
    ],
    tags: ['web', 'pipelines'],
  },

  9110: {
    triggerSignals: [
      'notification',
      'push notification',
      'send at scale',
      'fanout of alerts',
    ],
    keyPoints: [
      'Multiple channels: iOS (APNs), Android (FCM), SMS, email',
      'Per-channel rate limits and retries with exponential backoff',
      'Producer → notification service → per-channel queue → worker → 3rd-party gateway',
      'Dedup key so retries do not double-send',
      'User preferences + do-not-disturb checked before enqueue',
      'Analytics / click-tracking pipeline is separate',
    ],
    discriminators: [
      {
        vs: 'sdi-9111',
        how: 'Notifications are *outbound alerts* keyed by user+event. News feed is *ranked timeline* computed per user.',
      },
    ],
    palaceProbes: [
      'What fails first when APNs goes down for 5 minutes?',
      'How do you prevent a retry storm?',
    ],
    tags: ['web', 'fanout'],
  },

  9111: {
    triggerSignals: [
      'news feed',
      'timeline',
      'feed generation',
      'twitter feed',
      'instagram feed',
    ],
    keyPoints: [
      'Fanout-on-write (push): cheap read, expensive for celebrities',
      'Fanout-on-read (pull): expensive read, cheap write',
      'Hybrid: push for normal users, pull for celebrity follows',
      'Feed cache per user stores post IDs, not full posts',
      'Post store is shared; timeline ranking happens at read time',
    ],
    discriminators: [
      {
        vs: 'sdi-9112',
        how: 'News feed = *one-to-many, high-fanout, ranked*. Chat = *few-to-few, low-latency, ordered delivery*.',
      },
    ],
    palaceProbes: [
      'Why does push break for celebrity accounts?',
      'What is a "feed cache miss" and how do you serve it?',
    ],
    tags: ['web', 'fanout', 'ranking'],
  },

  9112: {
    triggerSignals: [
      'chat',
      'messenger',
      'whatsapp',
      'real-time messaging',
      'delivery receipt',
    ],
    keyPoints: [
      'Persistent connection: WebSocket or long-poll',
      'Chat service holds connection state; message service persists and forwards',
      'Per-user inbox sharded by user_id',
      'Message ordering via local sequence number per chat',
      'Online presence is its own subsystem (heartbeats, TTL)',
      'End-to-end encryption shifts key management to clients',
    ],
    discriminators: [
      {
        vs: 'sdi-9111',
        how: 'Chat needs *ordered delivery and low latency*; news feed needs *high fanout and ranking*.',
      },
    ],
    palaceProbes: [
      'What happens to messages when the recipient is offline?',
      'Why WebSocket not long-poll at scale?',
    ],
    tags: ['comm', 'realtime'],
  },

  9113: {
    triggerSignals: [
      'autocomplete',
      'typeahead',
      'search suggest',
      'prefix search',
    ],
    keyPoints: [
      'Trie with top-K suggestions precomputed at each node',
      'Weight = query frequency, updated offline from logs',
      'Two-service split: Data Gathering (batch, builds trie) and Query (serves trie)',
      'Trie too big for one machine → shard by first letters',
      'Debounce client requests; respond in <100ms for feel',
    ],
    discriminators: [
      {
        vs: 'sdi-9108',
        how: 'Autocomplete = *prefix search with ranking*; URL shortener = *exact lookup by key*.',
      },
    ],
    palaceProbes: [
      'Why precompute top-K at each node instead of traversing subtree per query?',
      'Why shard by first letter(s) instead of by hash?',
    ],
    tags: ['search', 'trie'],
  },

  9114: {
    triggerSignals: [
      'youtube',
      'video streaming',
      'upload video',
      'transcode',
    ],
    keyPoints: [
      'Upload path: client → upload service → blob store → transcode queue',
      'Transcoder produces multiple resolutions (1080p/720p/480p/240p)',
      'Adaptive bitrate streaming via HLS/DASH manifest',
      'CDN for hot videos; origin for cold',
      'Metadata DB is separate from blob store',
      'Copyright detection runs async on upload',
    ],
    discriminators: [
      {
        vs: 'sdi-9115',
        how: 'YouTube is *streaming media* with transcoding. Google Drive is *general-purpose file sync*.',
      },
    ],
    palaceProbes: [
      'Why transcode to multiple bitrates instead of one high-quality?',
      'What is the difference between HLS and DASH?',
    ],
    tags: ['storage', 'media'],
  },

  9115: {
    triggerSignals: [
      'google drive',
      'dropbox',
      'file sync',
      'cloud storage ui',
    ],
    keyPoints: [
      'Files are chunked (~4MB) and deduped by content hash',
      'Metadata DB stores {file_id, user_id, chunks[], versions}',
      'Chunks live in a blob store (S3-like)',
      'Delta sync: only changed chunks upload',
      'Notification service for multi-device sync',
    ],
    discriminators: [
      {
        vs: 'sdi-9209',
        how: 'Google Drive is *end-user file UI* over an object store. S3-like storage is the *object store primitive itself*.',
      },
    ],
    palaceProbes: [
      'How does chunking + dedup handle a 1-byte edit on a 1GB file?',
      'What does the client do if the metadata DB is reachable but the blob store is not?',
    ],
    tags: ['storage', 'sync'],
  },

  // ── Vol 2 ──
  9201: {
    triggerSignals: ['proximity', 'nearby places', 'geo search', 'restaurants near me'],
    keyPoints: [
      'Geohash or quadtree index for spatial lookup',
      'Geohash: encode lat/lng into a string; shared prefix = nearby',
      'Quadtree: dynamic, rebalancing, better for uneven density',
      'Read-heavy: cache hot cells in Redis',
    ],
    discriminators: [],
    palaceProbes: [
      'When is geohash better than quadtree and vice versa?',
      'What happens at cell boundaries (place sits on an edge)?',
    ],
    tags: ['location', 'spatial-index'],
  },
  9204: {
    triggerSignals: ['kafka', 'message queue', 'pub sub', 'distributed log'],
    keyPoints: [
      'Partitioned log, each partition an append-only file',
      'Consumer offsets tracked per consumer group',
      'Replication factor N with ISR (in-sync replicas) set',
      'At-least-once default; exactly-once needs idempotent producer + transactions',
    ],
    discriminators: [
      {
        vs: 'sdi-9104',
        how: 'Message queue accepts all work and defers it. Rate limiter *rejects* excess work at the front door.',
      },
    ],
    palaceProbes: [
      'What breaks if you set ISR=1?',
      'Why are partitions the unit of parallelism, not messages?',
    ],
    tags: ['infra', 'pub-sub'],
  },
  9205: {
    triggerSignals: ['metrics', 'prometheus', 'monitoring', 'alerting'],
    keyPoints: [
      'Time-series DB (push or pull scrape)',
      'Downsample and roll up old data',
      'Alertmanager with dedup + silencing + routing',
      'Cardinality is the silent killer',
    ],
    discriminators: [],
    palaceProbes: ['Why is cardinality the enemy?'],
    tags: ['infra', 'observability'],
  },
  9206: {
    triggerSignals: ['ad click', 'event aggregation', 'streaming pipeline'],
    keyPoints: [
      'Ingest via Kafka; process via stream processor',
      'Tumbling or sliding windows; watermarks for late events',
      'Dedup by event_id with short-TTL Bloom filter',
      'Exactly-once via idempotent writes',
    ],
    discriminators: [],
    palaceProbes: ['How do you handle events that arrive 10 minutes late?'],
    tags: ['infra', 'streaming'],
  },
  9209: {
    triggerSignals: ['s3', 'object storage', 'blob store'],
    keyPoints: [
      'Flat namespace: bucket/key',
      'Metadata service separate from data service',
      'Erasure coding (e.g., 10+4) for durability without 3× replication cost',
      'Multipart upload for large objects',
    ],
    discriminators: [
      {
        vs: 'sdi-9115',
        how: 'Object storage is the *primitive*; Drive/Dropbox are user-facing products built on top.',
      },
    ],
    palaceProbes: ['Why erasure coding instead of 3× replication?'],
    tags: ['storage', 'primitive'],
  },
  9211: {
    triggerSignals: ['payment', 'charge card', 'stripe'],
    keyPoints: [
      'Idempotency keys on every request',
      'Double-entry ledger (debit + credit, always balanced)',
      'Saga / outbox for distributed transactions',
      'PCI compliance = tokens not card numbers',
      'Reconcile with external processor nightly',
    ],
    discriminators: [
      {
        vs: 'sdi-9212',
        how: 'Payment system = *one-way transfer to a merchant*. Digital wallet = *accounts holding balances with transfers between them*.',
      },
    ],
    palaceProbes: [
      'What happens if the user clicks pay twice?',
      'Why double-entry instead of a single amount column?',
    ],
    tags: ['finance', 'correctness'],
  },
  9213: {
    triggerSignals: ['stock exchange', 'matching engine', 'order book'],
    keyPoints: [
      'In-memory order book per symbol (price-time priority)',
      'Matching engine single-threaded per symbol for determinism',
      'Sequencer assigns monotonic IDs',
      'Market data feed fanout is separate from order entry',
      'Every message is append-only logged for replay',
    ],
    discriminators: [],
    palaceProbes: [
      'Why single-threaded per symbol and not parallel?',
      'What does replay from the log buy you?',
    ],
    tags: ['finance', 'realtime'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default metadata synthesis for chapters without explicit entries.
// ─────────────────────────────────────────────────────────────────────────────

function firstSentence(text: string): string {
  const stripped = text.replace(/[*_`#>\n]/g, ' ').trim();
  const m = stripped.match(/^(.*?[.!?])(\s|$)/);
  return (m ? m[1] : stripped.slice(0, 160)).trim();
}

function deriveDefaultMeta(problemId: number): SdiChunkMeta {
  const sol = solutionMap[problemId];
  const titleFallback = sol ? firstSentence(sol.intuition || '') : '';
  return {
    triggerSignals: titleFallback
      ? [titleFallback.toLowerCase().split(' ').slice(0, 6).join(' ')]
      : [],
    keyPoints: (sol?.hints ?? []).slice(0, 6),
    discriminators: [],
    palaceProbes: sol?.hints?.slice(0, 2) ?? [],
    tags: ['sdi'],
  };
}

function mergeMeta(
  problemId: number,
  partial: Partial<SdiChunkMeta> | undefined,
): SdiChunkMeta {
  const base = deriveDefaultMeta(problemId);
  if (!partial) return base;
  return {
    triggerSignals: partial.triggerSignals ?? base.triggerSignals,
    keyPoints:
      partial.keyPoints && partial.keyPoints.length > 0
        ? partial.keyPoints
        : base.keyPoints,
    discriminators: partial.discriminators ?? base.discriminators,
    palaceProbes:
      partial.palaceProbes && partial.palaceProbes.length > 0
        ? partial.palaceProbes
        : base.palaceProbes,
    tags: partial.tags ?? base.tags,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Category assignment mirrors the reference page layout.
// ─────────────────────────────────────────────────────────────────────────────

const VOL1_CATEGORIES: Record<string, number[]> = {
  'Foundational Concepts': [9101, 9102, 9103],
  'Core Infrastructure': [9104, 9105, 9106, 9107],
  'Web & Data Systems': [9108, 9109, 9110, 9111],
  'Communication, Search & Storage': [9112, 9113, 9114, 9115],
};

const VOL2_CATEGORIES: Record<string, number[]> = {
  'Location & Maps': [9201, 9202, 9203],
  'Infrastructure & Data Processing': [9204, 9205, 9206],
  'Booking, Email & Storage': [9207, 9208, 9209],
  'Gaming, Payments & Finance': [9210, 9211, 9212, 9213],
};

function categoryOf(problemId: number): string {
  for (const [name, ids] of Object.entries({
    ...VOL1_CATEGORIES,
    ...VOL2_CATEGORIES,
  })) {
    if (ids.includes(problemId)) return name;
  }
  return 'Uncategorized';
}

// ─────────────────────────────────────────────────────────────────────────────
// Build.
// ─────────────────────────────────────────────────────────────────────────────

export function buildSdiChunks(): SdiChunk[] {
  const all = [
    ...sdiVol1Problems.map((p) => ({ ...p, volume: 'vol1' as const })),
    ...sdiVol2Problems.map((p) => ({ ...p, volume: 'vol2' as const })),
  ];

  return all
    .filter((p) => solutionMap[p.id])
    .map((p) => {
      const sol = solutionMap[p.id];
      return {
        id: `sdi-${p.id}`,
        problemId: p.id,
        title: p.title,
        difficulty: p.difficulty,
        volume: p.volume,
        category: categoryOf(p.id),
        oneLiner: firstSentence(sol.intuition || sol.description || p.title),
        meta: mergeMeta(p.id, META[p.id]),
      };
    });
}

export const sdiChunks: SdiChunk[] = buildSdiChunks();

export function getSdiChunk(id: string): SdiChunk | undefined {
  return sdiChunks.find((c) => c.id === id);
}

/**
 * Filter chunks based on a URL scope string.
 *   "all"             → everything
 *   "vol1" / "vol2"   → one volume
 *   "cat:<Name>"      → one category (URL-encoded)
 *   "ch:9104"         → single chapter
 */
export function filterChunksByScope(scope: string): SdiChunk[] {
  if (!scope || scope === 'all') return sdiChunks;
  if (scope === 'vol1') return sdiChunks.filter((c) => c.volume === 'vol1');
  if (scope === 'vol2') return sdiChunks.filter((c) => c.volume === 'vol2');
  if (scope.startsWith('cat:')) {
    const name = decodeURIComponent(scope.slice(4));
    return sdiChunks.filter((c) => c.category === name);
  }
  if (scope.startsWith('ch:')) {
    const id = Number(scope.slice(3));
    return sdiChunks.filter((c) => c.problemId === id);
  }
  return sdiChunks;
}
