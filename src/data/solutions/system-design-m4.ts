import { ProblemSolution } from './types';

export const solutionsM4: ProblemSolution[] = [
  {
    id: 9016,
    description: `Design Search Autocomplete System (Google)

FUNCTIONAL REQUIREMENTS:
- Return top-k (typically k=10) search suggestions as the user types each character
- Rank suggestions by a composite score: popularity (historical query frequency), freshness (recent trending queries weighted higher), and personalization (user's own search history)
- Support prefix matching: typing "sys" returns "system design interview", "system of a down", etc.
- Handle multi-language queries including CJK (Chinese-Japanese-Korean) with proper Unicode tokenization
- Inject trending/breaking queries in near real-time (within 60 seconds of trend detection)
- Support deletion of offensive or DMCA-flagged suggestions within seconds
- Provide spell-correction awareness: "deisgn" should still suggest "design patterns"

NON-FUNCTIONAL REQUIREMENTS:
- p99 latency < 100ms for autocomplete lookups (users perceive >200ms as sluggish)
- Handle 60,000 queries per second (QPS) at peak (5 billion queries/day, ~60K QPS avg, 3x peak = 180K QPS)
- High availability (99.99%) - autocomplete failing degrades search UX significantly
- Eventually consistent data is acceptable (a 30-second lag for new trending queries is fine)
- Graceful degradation: if ranking service is down, fall back to popularity-only ranking

CAPACITY ESTIMATION:
- 5 billion queries/day, average query length 20 chars, average 4 keystrokes before selection
- 5B * 4 = 20 billion autocomplete requests/day = ~230K QPS
- Unique queries: ~500 million (many queries repeat)
- Storage per query: 100 bytes (query text + metadata) => 50 GB for query corpus
- Trie size: ~15 GB in memory (compressed with shared prefixes)
- Each trie node stores top-10 suggestions: adds ~200 bytes/node => total trie with results ~50 GB per shard`,

    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Daily query volume: 5 billion queries/day
Average keystrokes per query before user selects: 4 keystrokes
Total autocomplete requests: 5B * 4 = 20B/day
QPS: 20B / 86400 = ~230,000 QPS (peak 3x = 700K QPS)

Storage calculation:
- 500M unique queries * 100 bytes avg = 50 GB raw query data
- Trie with 100M nodes * 150 bytes/node (pointers + top-k cache) = 15 GB
- Top-k cache per node: 10 results * 120 bytes = 1.2 KB/node
- Trie nodes with cached results: 100M * 1.2 KB = 120 GB total
- Shard across 20 machines => 6 GB/shard (fits comfortably in RAM)

API DESIGN:

GET /v1/autocomplete?q=sys&user_id=123&lang=en&limit=10
Response:
{
  "suggestions": [
    { "text": "system design interview", "score": 0.95, "type": "trending" },
    { "text": "system of a down", "score": 0.87, "type": "popular" },
    { "text": "system32 folder location", "score": 0.72, "type": "popular" }
  ],
  "request_id": "abc-123",
  "latency_ms": 12
}

POST /v1/admin/suppress
Body: { "query": "offensive term", "reason": "policy_violation", "ttl": -1 }

POST /v1/trending/inject
Body: { "query": "breaking news event", "boost_score": 0.9, "ttl_hours": 24 }`,

    intuition: `Think of autocomplete as a massive library's card catalog that has been pre-organized so that for every possible prefix of letters you might type, the top 10 most relevant cards are already stacked right at that position. Instead of searching through millions of cards each time you type a letter, you just reach into the pre-sorted stack at the current prefix position.

The key insight is PRE-COMPUTATION. If we computed top-k results at query time by scanning all matching queries, we'd need to examine millions of candidates per keystroke - far too slow. Instead, we pre-compute and cache the top-k results at every node in a trie (prefix tree). This turns each keystroke lookup into a simple O(L) trie traversal where L is the prefix length, followed by an O(1) lookup of pre-stored results.

The second critical insight is OFFLINE vs ONLINE paths. The online path (serving autocomplete) must be blazing fast - just trie lookups from memory. The offline path (updating frequencies, detecting trends, rebuilding tries) can be slower and runs asynchronously. New queries flow through a data collection pipeline (Kafka -> aggregation -> trie rebuild), and updated tries are atomically swapped into the serving layer.

The third insight is TRIE SHARDING. No single machine can hold all 500M+ queries. We shard the trie by first 2 characters of the prefix (e.g., "sy" goes to shard 7). With 26^2 = 676 possible 2-char prefixes (plus Unicode), we can distribute across ~50-100 machines with consistent hashing.`,

    approach: `ARCHITECTURE OVERVIEW:

1. DATA COLLECTION SERVICE (Offline Path):
   - Every search query is logged to Kafka with timestamp, user_id, query text, and result click data
   - A Spark/Flink streaming job aggregates query frequencies in tumbling windows (1 min, 1 hour, 1 day)
   - Aggregated counts are written to a query frequency store (Cassandra) partitioned by time bucket
   - A periodic job (every 15 min) reads frequency data and rebuilds trie segments

2. TRIE BUILDER SERVICE (Offline Path):
   - Reads aggregated query frequencies from the frequency store
   - Builds compressed tries where each node stores: character, children map, isEndOfWord flag, and pre-computed top-k results
   - Top-k at each node is computed bottom-up: merge children's top-k lists, add current node's query (if end-of-word), keep top 10
   - Serializes trie to a binary format and uploads to distributed storage (S3)
   - Trie servers receive notifications to download and hot-swap the new trie (blue-green deployment)

3. TRIE SERVING LAYER (Online Path):
   - Stateless trie servers load a shard of the trie into memory
   - Consistent hashing routes requests: hash(prefix[0:2]) -> shard
   - On query "sys": traverse trie s->y->s, return pre-computed top-10 from that node
   - A thin ranking layer re-ranks the top-10 based on user personalization and freshness
   - Response is cached at the edge (CDN) with short TTL (60s) for popular prefixes

4. TRENDING INJECTION SERVICE:
   - A real-time streaming pipeline (Flink) detects query volume spikes using z-score anomaly detection
   - Trending queries are pushed directly to trie servers via gRPC, bypassing the slow rebuild cycle
   - Trie servers maintain a small in-memory overlay of trending queries that is merged with trie results at query time
   - Trending entries have a TTL and decay factor - their boost score decreases over time

5. RANKING SERVICE:
   - Takes candidate suggestions from trie + trending overlay
   - Applies personalization: boost queries the user has searched before (stored in user profile cache)
   - Applies freshness weighting: score = base_score * time_decay_factor * personalization_boost
   - Filters suppressed/blocked queries

DATABASE SCHEMA:
   QueryFrequency: { query_text: string, time_bucket: timestamp, count: int, lang: string }
   UserQueryHistory: { user_id: string, query_text: string, last_searched: timestamp, search_count: int }
   SuppressedQueries: { query_text: string, reason: string, suppressed_at: timestamp }

API ENDPOINTS:
   GET  /v1/autocomplete?q=<prefix>&user_id=<id>&lang=<lang>&limit=<k>
   POST /v1/admin/suppress { query, reason }
   POST /v1/admin/unsuppress { query }
   GET  /v1/trending?lang=<lang>&limit=<k>
   POST /v1/data/ingest { queries: [{text, timestamp, user_id}] }`,

    code: `// =========================================================
// Search Autocomplete System - Core Implementation
// =========================================================

class TrieNode {
  constructor() {
    this.children = new Map();    // char -> TrieNode
    this.isEnd = false;
    this.frequency = 0;
    this.query = null;            // full query string if isEnd
    this.topK = [];               // pre-computed [{query, score}]
    this.trendingOverlay = [];    // injected trending results
  }
}

class AutocompleteTrie {
  constructor(k = 10) {
    this.root = new TrieNode();
    this.k = k;
    this.suppressedSet = new Set();
    this.trendingEntries = new Map(); // query -> {score, expiry}
  }

  insert(query, frequency) {
    let node = this.root;
    const lowerQuery = query.toLowerCase().trim();
    for (const char of lowerQuery) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEnd = true;
    node.frequency = frequency;
    node.query = lowerQuery;
  }

  // Bottom-up propagation of top-k results to every node
  buildTopK(node = this.root) {
    let candidates = [];
    if (node.isEnd && !this.suppressedSet.has(node.query)) {
      candidates.push({ query: node.query, score: node.frequency });
    }
    for (const [, child] of node.children) {
      this.buildTopK(child);
      candidates = candidates.concat(child.topK);
    }
    candidates.sort((a, b) => b.score - a.score);
    node.topK = candidates.slice(0, this.k);
  }

  // O(L) prefix lookup returning pre-computed top-k
  autocomplete(prefix, userId = null) {
    const lowerPrefix = prefix.toLowerCase().trim();
    let node = this.root;
    for (const char of lowerPrefix) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char);
    }
    // Merge trie top-k with trending overlay
    let results = [...node.topK];
    const trendingMatches = this.getTrendingForPrefix(lowerPrefix);
    results = this.mergeAndDedup(results, trendingMatches);
    // Filter suppressed queries
    results = results.filter(r => !this.suppressedSet.has(r.query));
    // Apply personalization boost if userId provided
    if (userId) {
      results = this.applyPersonalization(results, userId);
    }
    return results.slice(0, this.k);
  }

  // Inject trending query with TTL-based decay
  injectTrending(query, boostScore, ttlMs = 3600000) {
    const expiry = Date.now() + ttlMs;
    this.trendingEntries.set(query.toLowerCase(), {
      query: query.toLowerCase(),
      score: boostScore,
      expiry,
      injectedAt: Date.now(),
      ttlMs
    });
  }

  getTrendingForPrefix(prefix) {
    const now = Date.now();
    const matches = [];
    for (const [query, entry] of this.trendingEntries) {
      if (now > entry.expiry) {
        this.trendingEntries.delete(query);
        continue;
      }
      if (query.startsWith(prefix)) {
        // Apply time-decay: score decreases linearly as TTL expires
        const elapsed = now - entry.injectedAt;
        const decayFactor = Math.max(0, 1 - elapsed / entry.ttlMs);
        matches.push({ query, score: entry.score * decayFactor });
      }
    }
    return matches;
  }

  mergeAndDedup(trieResults, trendingResults) {
    const seen = new Map();
    for (const r of trieResults) seen.set(r.query, r);
    for (const r of trendingResults) {
      if (seen.has(r.query)) {
        seen.get(r.query).score = Math.max(seen.get(r.query).score, r.score);
      } else {
        seen.set(r.query, r);
      }
    }
    return Array.from(seen.values()).sort((a, b) => b.score - a.score);
  }

  applyPersonalization(results, userId) {
    // In production, fetch user history from Redis/cache
    const userHistory = this.getUserHistory(userId);
    return results.map(r => {
      const boost = userHistory.has(r.query) ? 1.5 : 1.0;
      return { ...r, score: r.score * boost };
    }).sort((a, b) => b.score - a.score);
  }

  getUserHistory(userId) {
    // Stub - in production this reads from a user profile cache
    return new Set();
  }

  suppress(query) {
    this.suppressedSet.add(query.toLowerCase());
  }

  unsuppress(query) {
    this.suppressedSet.delete(query.toLowerCase());
  }
}

// --- Consistent Hashing for Trie Sharding ---
class ConsistentHashRing {
  constructor(virtualNodes = 150) {
    this.ring = new Map();       // hash -> nodeId
    this.sortedHashes = [];
    this.virtualNodes = virtualNodes;
  }

  hash(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  addNode(nodeId) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const h = this.hash(nodeId + ":" + i);
      this.ring.set(h, nodeId);
      this.sortedHashes.push(h);
    }
    this.sortedHashes.sort((a, b) => a - b);
  }

  getNode(prefix) {
    const shardKey = prefix.substring(0, Math.min(2, prefix.length));
    const h = this.hash(shardKey);
    for (const ringHash of this.sortedHashes) {
      if (ringHash >= h) return this.ring.get(ringHash);
    }
    return this.ring.get(this.sortedHashes[0]);
  }
}

// --- Usage Example ---
const trie = new AutocompleteTrie(10);
const queries = [
  ["system design interview", 50000], ["system design primer", 30000],
  ["system of a down", 45000], ["system32", 20000],
  ["systematic review", 15000], ["systems thinking", 12000],
  ["systemic racism", 25000], ["system shock remake", 18000],
];
for (const [q, freq] of queries) trie.insert(q, freq);
trie.buildTopK();
trie.injectTrending("system outage aws", 60000, 7200000);
console.log("Results for 'sys':", trie.autocomplete("sys"));
console.log("Results for 'system d':", trie.autocomplete("system d"));`,

    jsCode: `// =========================================================
// Autocomplete Data Collection & Aggregation Pipeline
// =========================================================

class QueryAggregator {
  constructor(windowSizeMs = 60000) {
    this.windowSizeMs = windowSizeMs;
    this.currentWindow = new Map();   // query -> count in current window
    this.windowStart = Date.now();
    this.historicalFrequencies = new Map(); // query -> {total, windows:[]}
    this.trendDetector = new TrendDetector();
  }

  recordQuery(query, timestamp = Date.now()) {
    const normalized = query.toLowerCase().trim();
    // Aggregate into current time window
    this.currentWindow.set(normalized,
      (this.currentWindow.get(normalized) || 0) + 1
    );
    // Check if window has elapsed
    if (timestamp - this.windowStart >= this.windowSizeMs) {
      this.flushWindow();
    }
  }

  flushWindow() {
    const windowData = new Map(this.currentWindow);
    for (const [query, count] of windowData) {
      if (!this.historicalFrequencies.has(query)) {
        this.historicalFrequencies.set(query, { total: 0, windows: [] });
      }
      const entry = this.historicalFrequencies.get(query);
      entry.total += count;
      entry.windows.push({ timestamp: this.windowStart, count });
      // Keep only last 24 hours of window data
      const cutoff = Date.now() - 86400000;
      entry.windows = entry.windows.filter(w => w.timestamp > cutoff);
    }
    this.trendDetector.analyze(windowData, this.historicalFrequencies);
    this.currentWindow.clear();
    this.windowStart = Date.now();
  }

  getTopQueries(limit = 1000) {
    return Array.from(this.historicalFrequencies.entries())
      .map(([query, data]) => ({ query, frequency: data.total }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }
}

class TrendDetector {
  constructor(zScoreThreshold = 3.0) {
    this.zScoreThreshold = zScoreThreshold;
    this.detectedTrends = [];
  }

  analyze(currentWindowCounts, historicalData) {
    for (const [query, currentCount] of currentWindowCounts) {
      const history = historicalData.get(query);
      if (!history || history.windows.length < 5) continue;

      const counts = history.windows.map(w => w.count);
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((a, c) => a + (c - mean) ** 2, 0) / counts.length;
      const stdDev = Math.sqrt(variance) || 1;
      const zScore = (currentCount - mean) / stdDev;

      if (zScore > this.zScoreThreshold) {
        this.detectedTrends.push({
          query,
          zScore: Math.round(zScore * 100) / 100,
          currentCount,
          historicalMean: Math.round(mean * 100) / 100,
          detectedAt: Date.now()
        });
      }
    }
  }

  getRecentTrends(maxAgeMs = 3600000) {
    const cutoff = Date.now() - maxAgeMs;
    return this.detectedTrends
      .filter(t => t.detectedAt > cutoff)
      .sort((a, b) => b.zScore - a.zScore);
  }
}

// --- Robots.txt Aware Prefix Filter ---
class PrefixFilter {
  constructor() {
    this.blockedPrefixes = new Set();
    this.adultContentPatterns = [];
  }

  addBlockedPrefix(prefix) {
    this.blockedPrefixes.add(prefix.toLowerCase());
  }

  isAllowed(query) {
    const lower = query.toLowerCase();
    for (const blocked of this.blockedPrefixes) {
      if (lower.startsWith(blocked) || lower.includes(blocked)) {
        return false;
      }
    }
    return true;
  }

  filterResults(results) {
    return results.filter(r => this.isAllowed(r.query));
  }
}

// --- Demo ---
const aggregator = new QueryAggregator(1000);
const testQueries = [
  "system design", "system design", "system design",
  "system design interview", "machine learning",
  "system design", "system design", "breaking news event",
  "breaking news event", "breaking news event",
  "breaking news event", "breaking news event",
];
for (const q of testQueries) aggregator.recordQuery(q);
aggregator.flushWindow();
console.log("Top queries:", aggregator.getTopQueries(5));
console.log("Trends:", aggregator.trendDetector.getRecentTrends());`,

    explanation: `SCALING ANALYSIS:

1. READ PATH PERFORMANCE:
   - Trie traversal is O(L) where L = prefix length (avg 4-8 chars) - effectively O(1)
   - Top-k results are pre-computed at each node - no sorting at query time
   - With trie in memory, p99 latency is typically 5-15ms per server
   - Add network hop (1-5ms) and ranking (5-10ms) = total 15-30ms well under 100ms target
   - CDN caching of popular prefixes (top 1000) reduces server load by 30-40%

2. WRITE PATH (DATA COLLECTION):
   - Queries flow: Client -> API -> Kafka -> Flink Aggregation -> Frequency Store -> Trie Builder
   - End-to-end latency for new query to appear in autocomplete: 15-30 minutes (normal path)
   - Trending injection shortcut: 30-60 seconds via direct push to trie servers
   - Kafka handles 200K+ events/sec per partition; 50 partitions = 10M events/sec capacity

3. TRIE SHARDING STRATEGY:
   - Shard by first 2 characters of prefix using consistent hashing
   - 676 possible 2-char prefixes distributed across ~50 trie servers
   - Each server holds ~3-6 GB of trie data in RAM
   - Hot prefixes ("th", "wh", "ho") may need replication factor 3 for load distribution
   - Consistent hashing with virtual nodes ensures balanced distribution even when adding/removing servers

4. FAILURE MODES AND MITIGATIONS:
   - Trie server crash: Consistent hashing redirects to next server; replica takes over in <5 seconds
   - Kafka lag: Autocomplete continues serving from current trie; data freshness degrades gracefully
   - Trie rebuild failure: Serving layer keeps previous version; alerts fire to ops team
   - Trending injection service down: Trending results disappear but core autocomplete unaffected
   - Network partition between trie servers and ranking service: Fall back to pre-computed scores only

5. BOTTLENECK IDENTIFICATION:
   - HOT PREFIXES: "the", "how", "what" get disproportionate traffic. Mitigation: Replicate hot shards; cache hot prefix results at CDN layer with 60s TTL
   - TRIE REBUILD: Rebuilding a full trie with 500M queries takes 20-30 minutes. Mitigation: Incremental trie updates (delta application) instead of full rebuild
   - MEMORY PRESSURE: Top-k cache at every node is expensive. Mitigation: Only cache top-k at nodes above a frequency threshold; deeper nodes compute on demand
   - THUNDERING HERD: Celebrity tweet causes millions to search same trending term. Mitigation: Request coalescing at load balancer level

6. MONITORING:
   - Track p50/p95/p99 autocomplete latency per shard
   - Monitor trie memory usage and node count per server
   - Alert on Kafka consumer lag exceeding 5 minutes
   - Track cache hit ratio at CDN and trie server level
   - Monitor trending detection false positive rate

7. TRADE-OFFS:
   - Pre-computed top-k vs. on-demand computation: Pre-computed is faster but uses more memory and results can be stale
   - Full trie rebuild vs. incremental updates: Full rebuild is simpler but slower; incremental is complex but enables near-real-time updates
   - Aggressive caching vs. freshness: Longer TTLs reduce load but delay trending query appearance
   - Per-user personalization vs. global ranking: Personalization improves relevance but adds latency and complexity`,

    timeComplexity: `Autocomplete lookup: O(L) where L = prefix length, typically 4-8 characters.
Top-k retrieval: O(1) per node since results are pre-computed.
Trie insertion: O(L) per query.
Full trie rebuild: O(N * L * K log K) where N = number of unique queries, L = avg query length, K = top-k size.
Trending injection: O(1) per entry (hash map insert).
Trend detection (z-score): O(W) per query per window where W = number of historical windows.
Consistent hash lookup: O(log V) where V = number of virtual nodes per server.
End-to-end per keystroke: <30ms at p99 including network, trie lookup, ranking, and response serialization.`,

    spaceComplexity: `Trie structure: ~15 GB base trie for 500M unique queries with shared prefix compression.
Top-k cache per node: 10 results * 120 bytes = 1.2 KB/node, ~100M significant nodes = 120 GB total.
Per shard (50 shards): ~3 GB trie + top-k per machine, well within 16 GB RAM budget.
Trending overlay: Max 10,000 trending entries * 200 bytes = 2 MB per server (negligible).
Query frequency store (Cassandra): 500M queries * 200 bytes * 90 days of windows = ~1 TB.
Kafka retention: 7 days * 5B queries/day * 100 bytes = 3.5 TB.
CDN cache: Top 100K prefixes * 2 KB response = 200 MB per edge location.
User history cache (Redis): 100M active users * 50 recent queries * 80 bytes = 400 GB across Redis cluster.`,

    hints: [
      `Pre-compute top-k results at every trie node during the build phase. This trades O(N*K) extra memory for O(1) lookup at query time. Without pre-computation, you'd need to DFS the subtree at each keystroke, which is O(subtree_size * log K) and far too slow for the latency budget.`,
      `Use a two-path architecture: the FAST online path only does trie lookups and merges, while the SLOW offline path handles aggregation, trie building, and trend detection. Never let the offline path's latency affect the online path. The trie serving layer should be completely stateless - it loads a trie snapshot and serves from memory.`,
      `Implement trie sharding by hashing the first 2 characters of the prefix. This gives you up to 676 logical shards that you distribute across physical servers using consistent hashing. For hot prefixes like "th" or "wh", add extra replicas. The 2-character prefix ensures a request always goes to exactly one shard.`,
      `For real-time trending injection, maintain a small in-memory overlay map on each trie server that is merged with trie results at query time. Trending entries have a TTL and exponential decay on their boost score. This avoids rebuilding the entire trie for ephemeral trending events.`,
      `Use z-score anomaly detection for trend identification: compute mean and standard deviation of query frequency over historical windows, and flag queries where current frequency exceeds mean + 3*stddev. This catches genuine spikes while ignoring normal traffic fluctuations.`,
      `Cache popular prefix responses at the CDN edge with short TTLs (30-60 seconds). The top 1000 prefixes account for ~30% of all autocomplete traffic. A 60-second TTL is acceptable because autocomplete results don't need to be real-time for popular generic prefixes like "how to".`,
      `Handle the cold start problem for new/rare queries by maintaining a secondary index that stores recently-seen queries not yet incorporated into the main trie. At query time, merge results from the main trie and the secondary index. This provides freshness without the cost of continuous trie rebuilds.`,
      `Design for graceful degradation: if the personalization service is slow, return unpersonalized results. If a trie shard is down, return results from a stale replica. If trending injection fails, the core trie still serves. Each layer should have an independent fallback that preserves the user experience.`
    ]
  },
  {
    id: 9017,
    description: `Design a Distributed Task Scheduler

FUNCTIONAL REQUIREMENTS:
- Schedule one-time tasks to execute at a specific future time (e.g., "send reminder email at 2024-03-15 10:00 UTC")
- Schedule recurring tasks using cron expressions (e.g., "0 9 * * MON" = every Monday at 9 AM)
- Support task priorities (P0-critical through P3-low) with priority-based execution ordering
- Provide retry with configurable exponential backoff and max-retry limits
- Route failed tasks (after exhausting retries) to a dead-letter queue for manual inspection
- Support task cancellation, pausing, and resuming
- Provide at-least-once execution guarantee with distributed locking to prevent duplicate execution
- Allow task dependencies (task B runs only after task A succeeds)

NON-FUNCTIONAL REQUIREMENTS:
- Sub-second scheduling accuracy (task fires within 1 second of its scheduled time)
- Handle millions of scheduled tasks simultaneously
- Horizontally scalable dispatchers and executors
- 99.99% availability for the scheduling plane
- Survive individual node failures without losing or duplicating task executions
- Support multi-tenant isolation with per-tenant rate limiting

CAPACITY ESTIMATION:
- 10 million active scheduled tasks at any given time
- 100,000 tasks firing per minute at peak
- Average task payload: 2 KB
- Task metadata per record: 500 bytes
- Storage: 10M tasks * 2.5 KB = 25 GB for active tasks
- 50 million completed task records retained for 30 days = 125 GB historical storage`,

    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Active tasks: 10 million concurrently scheduled
Task firing rate: 100K/min peak = 1,667 tasks/second
Recurring tasks: 3M recurring (generate next occurrence on completion)
One-time tasks: 7M (cleared after execution)

Storage:
- Active task table: 10M * 2.5 KB = 25 GB (fits in sharded DB)
- Task history (30 days): 100K/min * 60 * 24 * 30 = 4.3B records * 500 bytes = 2.15 TB
- Dead-letter queue: 0.1% failure rate * 4.3B = 4.3M records * 5 KB = 21.5 GB

Executor pool sizing:
- Average task execution: 200ms
- Throughput needed: 1,667 tasks/sec
- Tasks per executor: 1000ms / 200ms = 5 tasks/sec/executor
- Executors needed: 1,667 / 5 = 334 executors (provision 500 for headroom)

API DESIGN:

POST /v1/tasks
{ "name": "send-reminder", "payload": { "user_id": "123", "template": "reminder" },
  "schedule_at": "2024-03-15T10:00:00Z", "priority": 1,
  "retry_policy": { "max_retries": 3, "backoff_base_ms": 1000, "backoff_multiplier": 2 },
  "callback_url": "https://api.myservice.com/webhooks/task-complete" }

POST /v1/tasks/recurring
{ "name": "daily-report", "cron": "0 9 * * *", "timezone": "America/New_York",
  "payload": { "report_type": "daily_summary" }, "priority": 2 }

DELETE /v1/tasks/:taskId
PATCH /v1/tasks/:taskId/pause
PATCH /v1/tasks/:taskId/resume
GET /v1/tasks/:taskId/status`,

    intuition: `Think of a distributed task scheduler as a massively parallel alarm clock system. Imagine a wall of millions of alarm clocks, each set to go off at a different time. You need multiple people (dispatchers) watching different sections of the wall, and when an alarm goes off, they hand the task to one of many workers (executors) to handle it. The critical challenge is: what happens when one of the watchers falls asleep (node failure)? Another watcher must take over their section WITHOUT causing the same alarm to be handled twice.

The key insight is TIME-BUCKETED DISPATCH. Instead of having dispatchers scan all 10 million tasks every second, we partition tasks into time buckets (e.g., 1-minute windows). A dispatcher only needs to load and process tasks in the current and next bucket - a much smaller working set. This turns the problem from "scan millions of tasks" into "process hundreds of tasks in the current time bucket."

The second insight is DISTRIBUTED LOCKING WITH FENCING TOKENS. When a dispatcher picks up a task, it acquires a lease (lock with expiry) and receives a monotonically increasing fencing token. The executor includes this token when writing results. If a lock expires and another dispatcher re-dispatches the same task, the storage layer rejects writes with stale fencing tokens, preventing duplicate side effects.

The third insight is SEPARATION OF SCHEDULING AND EXECUTION. The scheduler/dispatcher is the brain (lightweight, stateful coordination), while executors are the muscles (stateless, horizontally scalable workers). This separation allows you to scale execution capacity independently of scheduling capacity.`,

    approach: `ARCHITECTURE OVERVIEW:

1. TASK STORE (Persistent Storage):
   - Primary store: Sharded PostgreSQL or DynamoDB
   - Tasks table partitioned by fire_time bucket (1-minute granules)
   - Indexes: (status, fire_time_bucket) for dispatcher scans, (task_id) for lookups
   - Schema: task_id, name, payload, schedule_at, priority, status (PENDING/DISPATCHED/RUNNING/COMPLETED/FAILED/DEAD_LETTER), retry_count, max_retries, backoff_base_ms, cron_expression, created_at, updated_at, locked_by, lock_expiry, fencing_token

2. DISPATCHER SERVICE (Coordinator):
   - Multiple dispatcher instances, each responsible for a range of time buckets (sharded by bucket hash)
   - Uses leader election (via etcd/ZooKeeper) OR consistent hashing to assign bucket ranges
   - Every second, loads tasks from its assigned buckets where fire_time <= now AND status = PENDING
   - For each task: atomically sets status = DISPATCHED, assigns fencing_token, sets lock_expiry
   - Publishes task to execution queue (Kafka/SQS) partitioned by priority
   - Separate high-priority queue ensures P0 tasks are not blocked behind a backlog of P3 tasks

3. EXECUTOR POOL (Stateless Workers):
   - Stateless worker processes consuming from execution queues
   - Each worker: dequeues task, executes handler, reports result back to task store
   - On success: update status = COMPLETED; if recurring, compute next fire_time from cron and insert new task
   - On failure: increment retry_count; if retries remain, compute next fire_time with exponential backoff and set status = PENDING; if retries exhausted, set status = DEAD_LETTER
   - Workers send heartbeats; if a worker dies mid-execution, the lock expires and dispatcher re-dispatches

4. DEAD-LETTER QUEUE (DLQ):
   - Tasks that exhaust all retries are moved to a DLQ table
   - Admin UI for inspecting, replaying, or permanently discarding dead-letter tasks
   - Alerting when DLQ depth exceeds thresholds

5. CRON SCHEDULER:
   - A dedicated service that maintains cron task definitions
   - On each task completion (or at a leading edge), computes the next occurrence using cron expression
   - Inserts the next occurrence as a new one-time task in the task store
   - Handles timezone-aware scheduling including DST transitions

DATA FLOW:
   Client -> API -> Task Store (insert PENDING) -> Dispatcher scans bucket -> Kafka (priority queue) -> Executor dequeues -> Execute -> Report result -> Task Store (update status) -> If recurring: insert next occurrence`,

    code: `// =========================================================
// Distributed Task Scheduler - Core Implementation
// =========================================================

class Task {
  constructor(config) {
    this.id = config.id || crypto.randomUUID();
    this.name = config.name;
    this.payload = config.payload || {};
    this.scheduleAt = config.scheduleAt;   // epoch ms
    this.priority = config.priority || 2;  // 0=critical, 3=low
    this.status = "PENDING";               // PENDING|DISPATCHED|RUNNING|COMPLETED|FAILED|DEAD_LETTER
    this.retryCount = 0;
    this.maxRetries = config.maxRetries || 3;
    this.backoffBaseMs = config.backoffBaseMs || 1000;
    this.backoffMultiplier = config.backoffMultiplier || 2;
    this.cronExpression = config.cronExpression || null;
    this.fencingToken = 0;
    this.lockedBy = null;
    this.lockExpiry = 0;
    this.createdAt = Date.now();
    this.lastError = null;
  }
}

class TaskScheduler {
  constructor() {
    this.buckets = new Map();        // bucketKey -> Map<taskId, Task>
    this.taskIndex = new Map();      // taskId -> bucketKey
    this.deadLetterQueue = [];
    this.fencingCounter = 0;
    this.lockDurationMs = 30000;     // 30-second lock lease
    this.bucketSizeMs = 60000;       // 1-minute buckets
    this.executionQueue = [];        // priority queue of dispatched tasks
    this.handlers = new Map();       // taskName -> handler function
  }

  getBucketKey(timestampMs) {
    return Math.floor(timestampMs / this.bucketSizeMs) * this.bucketSizeMs;
  }

  scheduleTask(config) {
    const task = new Task(config);
    const bucketKey = this.getBucketKey(task.scheduleAt);
    if (!this.buckets.has(bucketKey)) {
      this.buckets.set(bucketKey, new Map());
    }
    this.buckets.get(bucketKey).set(task.id, task);
    this.taskIndex.set(task.id, bucketKey);
    return task.id;
  }

  scheduleRecurring(config) {
    const nextFire = this.getNextCronTime(config.cronExpression, Date.now());
    return this.scheduleTask({ ...config, scheduleAt: nextFire });
  }

  // Dispatcher: scan current time bucket and dispatch ready tasks
  dispatch(dispatcherId = "dispatcher-1") {
    const now = Date.now();
    const currentBucket = this.getBucketKey(now);
    const dispatched = [];

    // Check current and previous bucket (handles edge cases)
    for (const bucketKey of [currentBucket - this.bucketSizeMs, currentBucket]) {
      const bucket = this.buckets.get(bucketKey);
      if (!bucket) continue;
      for (const [taskId, task] of bucket) {
        if (task.status !== "PENDING" || task.scheduleAt > now) continue;
        // Acquire lock with fencing token
        task.fencingToken = ++this.fencingCounter;
        task.status = "DISPATCHED";
        task.lockedBy = dispatcherId;
        task.lockExpiry = now + this.lockDurationMs;
        // Insert into priority queue (lower number = higher priority)
        this.enqueueByPriority(task);
        dispatched.push(task.id);
      }
    }
    return dispatched;
  }

  enqueueByPriority(task) {
    let inserted = false;
    for (let i = 0; i < this.executionQueue.length; i++) {
      if (task.priority < this.executionQueue[i].priority) {
        this.executionQueue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    if (!inserted) this.executionQueue.push(task);
  }

  // Executor: pick next task and run it
  async executeNext() {
    if (this.executionQueue.length === 0) return null;
    const task = this.executionQueue.shift();
    // Validate fencing token (check lock hasn't been stolen)
    if (Date.now() > task.lockExpiry) {
      task.status = "PENDING"; // Lock expired, let dispatcher re-dispatch
      return { taskId: task.id, result: "LOCK_EXPIRED" };
    }
    task.status = "RUNNING";
    try {
      const handler = this.handlers.get(task.name);
      if (!handler) throw new Error("No handler for task: " + task.name);
      const result = await handler(task.payload);
      task.status = "COMPLETED";
      // If recurring, schedule next occurrence
      if (task.cronExpression) {
        this.scheduleTask({
          name: task.name, payload: task.payload,
          cronExpression: task.cronExpression, priority: task.priority,
          maxRetries: task.maxRetries, backoffBaseMs: task.backoffBaseMs,
          scheduleAt: this.getNextCronTime(task.cronExpression, Date.now())
        });
      }
      this.removeTask(task.id);
      return { taskId: task.id, result: "SUCCESS", data: result };
    } catch (error) {
      return this.handleFailure(task, error);
    }
  }

  handleFailure(task, error) {
    task.retryCount++;
    task.lastError = error.message;
    if (task.retryCount >= task.maxRetries) {
      task.status = "DEAD_LETTER";
      this.deadLetterQueue.push({ ...task, failedAt: Date.now() });
      this.removeTask(task.id);
      return { taskId: task.id, result: "DEAD_LETTER", error: error.message };
    }
    // Exponential backoff with jitter
    const backoff = task.backoffBaseMs *
      Math.pow(task.backoffMultiplier, task.retryCount - 1);
    const jitter = Math.random() * backoff * 0.3;
    const nextRetry = Date.now() + backoff + jitter;
    task.status = "PENDING";
    task.scheduleAt = nextRetry;
    task.lockedBy = null;
    // Move to correct time bucket
    const oldBucket = this.taskIndex.get(task.id);
    if (this.buckets.has(oldBucket)) this.buckets.get(oldBucket).delete(task.id);
    const newBucket = this.getBucketKey(nextRetry);
    if (!this.buckets.has(newBucket)) this.buckets.set(newBucket, new Map());
    this.buckets.get(newBucket).set(task.id, task);
    this.taskIndex.set(task.id, newBucket);
    return { taskId: task.id, result: "RETRY_SCHEDULED", retryAt: nextRetry,
      attempt: task.retryCount, error: error.message };
  }

  removeTask(taskId) {
    const bucketKey = this.taskIndex.get(taskId);
    if (bucketKey !== undefined && this.buckets.has(bucketKey)) {
      this.buckets.get(bucketKey).delete(taskId);
    }
    this.taskIndex.delete(taskId);
  }

  cancelTask(taskId) {
    const bucketKey = this.taskIndex.get(taskId);
    if (!bucketKey || !this.buckets.has(bucketKey)) return false;
    const task = this.buckets.get(bucketKey).get(taskId);
    if (!task || task.status === "RUNNING") return false;
    this.removeTask(taskId);
    return true;
  }

  registerHandler(taskName, handler) {
    this.handlers.set(taskName, handler);
  }

  // Simplified cron parser for: minute hour dayOfMonth month dayOfWeek
  getNextCronTime(cronExpr, afterMs) {
    const parts = cronExpr.split(" ");
    const [minExpr, hourExpr] = parts;
    const date = new Date(afterMs + 60000);
    date.setSeconds(0, 0);
    const targetMin = minExpr === "*" ? date.getMinutes() : parseInt(minExpr);
    const targetHour = hourExpr === "*" ? date.getHours() : parseInt(hourExpr);
    date.setHours(targetHour, targetMin, 0, 0);
    if (date.getTime() <= afterMs) date.setDate(date.getDate() + 1);
    return date.getTime();
  }
}

// --- Usage Example ---
const scheduler = new TaskScheduler();
scheduler.registerHandler("send-email", async (payload) => {
  console.log("Sending email to:", payload.to);
  if (Math.random() < 0.3) throw new Error("SMTP timeout");
  return { sent: true };
});
const taskId = scheduler.scheduleTask({
  name: "send-email", payload: { to: "user@example.com" },
  scheduleAt: Date.now() - 100, priority: 1, maxRetries: 3
});
console.log("Dispatched:", scheduler.dispatch());`,

    jsCode: `// =========================================================
// Distributed Lock Manager & Cron Expression Parser
// =========================================================

class DistributedLockManager {
  constructor() {
    this.locks = new Map();  // resourceId -> {owner, fencingToken, expiry}
    this.tokenCounter = 0;
  }

  // Acquire lock with automatic expiry and fencing token
  acquire(resourceId, ownerId, ttlMs = 30000) {
    const now = Date.now();
    const existing = this.locks.get(resourceId);
    // Check if lock exists and hasn't expired
    if (existing && existing.expiry > now && existing.owner !== ownerId) {
      return { acquired: false, holder: existing.owner,
        expiresIn: existing.expiry - now };
    }
    const fencingToken = ++this.tokenCounter;
    this.locks.set(resourceId, {
      owner: ownerId, fencingToken, expiry: now + ttlMs, acquiredAt: now
    });
    return { acquired: true, fencingToken, expiresAt: now + ttlMs };
  }

  release(resourceId, ownerId) {
    const lock = this.locks.get(resourceId);
    if (!lock || lock.owner !== ownerId) return false;
    this.locks.delete(resourceId);
    return true;
  }

  // Renew lease (heartbeat)
  renew(resourceId, ownerId, ttlMs = 30000) {
    const lock = this.locks.get(resourceId);
    if (!lock || lock.owner !== ownerId) return false;
    lock.expiry = Date.now() + ttlMs;
    return true;
  }

  // Validate fencing token for write operations
  validateFencingToken(resourceId, token) {
    const lock = this.locks.get(resourceId);
    if (!lock) return false;
    return lock.fencingToken === token && lock.expiry > Date.now();
  }

  // Garbage collect expired locks
  cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;
    for (const [resourceId, lock] of this.locks) {
      if (lock.expiry <= now) {
        this.locks.delete(resourceId);
        cleaned++;
      }
    }
    return cleaned;
  }
}

// --- Full Cron Expression Parser ---
class CronParser {
  // Parses: minute hour dayOfMonth month dayOfWeek
  // Supports: numbers, *, ranges (1-5), steps (*/15), lists (1,3,5)
  static parseField(expr, min, max) {
    const values = new Set();
    for (const part of expr.split(",")) {
      if (part === "*") {
        for (let i = min; i <= max; i++) values.add(i);
      } else if (part.includes("/")) {
        const [range, stepStr] = part.split("/");
        const step = parseInt(stepStr);
        const start = range === "*" ? min : parseInt(range);
        for (let i = start; i <= max; i += step) values.add(i);
      } else if (part.includes("-")) {
        const [lo, hi] = part.split("-").map(Number);
        for (let i = lo; i <= hi; i++) values.add(i);
      } else {
        values.add(parseInt(part));
      }
    }
    return Array.from(values).sort((a, b) => a - b);
  }

  static parse(cronExpr) {
    const parts = cronExpr.trim().split(/\\s+/);
    if (parts.length !== 5) throw new Error("Invalid cron: need 5 fields");
    return {
      minutes: this.parseField(parts[0], 0, 59),
      hours: this.parseField(parts[1], 0, 23),
      daysOfMonth: this.parseField(parts[2], 1, 31),
      months: this.parseField(parts[3], 1, 12),
      daysOfWeek: this.parseField(parts[4], 0, 6)  // 0=Sunday
    };
  }

  static getNextOccurrence(cronExpr, afterDate = new Date()) {
    const schedule = this.parse(cronExpr);
    const d = new Date(afterDate.getTime() + 60000); // start from next minute
    d.setSeconds(0, 0);

    // Iterate up to 366 days to find next match
    for (let attempts = 0; attempts < 527040; attempts++) {
      const monthMatch = schedule.months.includes(d.getMonth() + 1);
      const domMatch = schedule.daysOfMonth.includes(d.getDate());
      const dowMatch = schedule.daysOfWeek.includes(d.getDay());
      const hourMatch = schedule.hours.includes(d.getHours());
      const minMatch = schedule.minutes.includes(d.getMinutes());

      if (monthMatch && domMatch && dowMatch && hourMatch && minMatch) {
        return d;
      }
      // Advance by 1 minute
      d.setTime(d.getTime() + 60000);
    }
    throw new Error("No valid cron occurrence found within 366 days");
  }

  static getNextN(cronExpr, n, afterDate = new Date()) {
    const results = [];
    let current = afterDate;
    for (let i = 0; i < n; i++) {
      const next = this.getNextOccurrence(cronExpr, current);
      results.push(next);
      current = next;
    }
    return results;
  }
}

// --- Task Dependency DAG ---
class TaskDependencyGraph {
  constructor() {
    this.adjacency = new Map();  // taskId -> Set of dependent taskIds
    this.inDegree = new Map();   // taskId -> number of unresolved dependencies
  }

  addTask(taskId, dependencies = []) {
    if (!this.adjacency.has(taskId)) this.adjacency.set(taskId, new Set());
    this.inDegree.set(taskId, dependencies.length);
    for (const dep of dependencies) {
      if (!this.adjacency.has(dep)) this.adjacency.set(dep, new Set());
      this.adjacency.get(dep).add(taskId);
    }
  }

  getReadyTasks() {
    const ready = [];
    for (const [taskId, degree] of this.inDegree) {
      if (degree === 0) ready.push(taskId);
    }
    return ready;
  }

  markCompleted(taskId) {
    const dependents = this.adjacency.get(taskId) || new Set();
    const newlyReady = [];
    for (const dep of dependents) {
      const newDegree = (this.inDegree.get(dep) || 1) - 1;
      this.inDegree.set(dep, newDegree);
      if (newDegree === 0) newlyReady.push(dep);
    }
    this.adjacency.delete(taskId);
    this.inDegree.delete(taskId);
    return newlyReady;
  }
}

// --- Demo ---
const lockMgr = new DistributedLockManager();
console.log("Lock 1:", lockMgr.acquire("task-123", "worker-A", 5000));
console.log("Lock 2:", lockMgr.acquire("task-123", "worker-B", 5000));
console.log("Valid token:", lockMgr.validateFencingToken("task-123", 1));

const next5 = CronParser.getNextN("*/15 9-17 * * 1-5", 5);
console.log("Next 5 cron occurrences:", next5.map(d => d.toISOString()));

const dag = new TaskDependencyGraph();
dag.addTask("extract", []);
dag.addTask("transform", ["extract"]);
dag.addTask("validate", ["extract"]);
dag.addTask("load", ["transform", "validate"]);
console.log("Ready tasks:", dag.getReadyTasks());
console.log("After extract completes:", dag.markCompleted("extract"));`,

    explanation: `SCALING ANALYSIS:

1. TASK STORE PARTITIONING:
   - Partition by fire_time_bucket (1-minute granules): each bucket is a partition/shard
   - This ensures dispatchers only scan the current time range, not the full table
   - With 10M active tasks across 525,600 minutes/year, average bucket has ~19 tasks
   - Hot buckets (popular scheduling times like midnight, top of hour) may have 10,000+ tasks
   - Secondary index on task_id for cancel/pause operations

2. DISPATCHER SCALING:
   - Each dispatcher owns a range of time buckets via consistent hashing
   - If a dispatcher fails, its bucket range is redistributed to surviving dispatchers
   - Leader election (etcd lease) ensures exactly one dispatcher per bucket range
   - Dispatchers are lightweight (just scan and enqueue), so 3-5 instances handle millions of tasks
   - Each dispatcher runs a 1-second polling loop on its assigned buckets

3. EXECUTOR POOL SCALING:
   - Executors are stateless workers consuming from priority queues
   - Scale horizontally based on queue depth: if queue depth > threshold, auto-scale up
   - Separate queues per priority: P0 queue always has dedicated capacity
   - Workers report heartbeats; if missed, task lock expires and is re-dispatched
   - Average executor handles 5 tasks/second; 500 executors = 2,500 tasks/second throughput

4. FAILURE MODES AND MITIGATIONS:
   - DISPATCHER CRASH: Etcd lease expires in 10s, surviving dispatchers take over bucket ranges. Tasks in flight are re-dispatched after lock expiry (30s worst case). No task loss.
   - EXECUTOR CRASH MID-TASK: Lock expires after 30 seconds. Dispatcher re-dispatches. Task handler must be idempotent to handle re-execution safely.
   - DATABASE FAILURE: Task store should use synchronous replication (Postgres streaming replication or DynamoDB global tables). Failover adds 5-15 seconds of scheduling delay.
   - QUEUE FULL: Dispatchers pause dispatching and retry. Backpressure propagates up. Alert on queue depth.
   - CLOCK SKEW: Use NTP with tight sync (< 100ms). Fencing tokens (not clocks) determine lock ownership.

5. AT-LEAST-ONCE GUARANTEE:
   - Fencing tokens prevent split-brain: if two executors hold the same task, only the one with the higher token can write results
   - Task handlers MUST be idempotent: use idempotency keys in payload for external calls
   - On ambiguous failure (timeout, network error), the task is retried rather than marked complete

6. EXPONENTIAL BACKOFF WITH JITTER:
   - Retry delay = backoff_base * (multiplier ^ (attempt - 1)) + random_jitter
   - Jitter prevents thundering herd when many tasks fail simultaneously
   - Example: base=1s, multiplier=2: retries at 1s, 2s, 4s, 8s, 16s...
   - Cap max backoff at 1 hour to prevent tasks from being stuck indefinitely

7. MONITORING:
   - Track scheduling lag: time between fire_time and actual dispatch
   - Monitor DLQ depth per task type (alert if growing)
   - Track retry rate by task name (indicates buggy handlers)
   - Measure executor utilization and queue depths per priority
   - Alert on dispatcher failover events`,

    timeComplexity: `Dispatch scan per cycle: O(B) where B = tasks in current time bucket (avg ~20, peak ~10,000).
Task enqueue (priority insertion): O(Q) where Q = current queue depth (use heap for O(log Q)).
Lock acquire/release: O(1) with hash map.
Cron next-occurrence: O(D) where D = days to scan, typically O(1) for common schedules.
Dependency resolution: O(E) where E = edges from completed task.
Full dispatch cycle: O(B * log Q) per second per dispatcher.
End-to-end latency: scheduling accuracy within 1 second of fire_time at p99.`,

    spaceComplexity: `Active task store: 10M tasks * 2.5 KB = 25 GB (sharded across 5 DB nodes = 5 GB/node).
Task history (30 days): 4.3B records * 500 bytes = 2.15 TB (time-partitioned, old partitions archived to cold storage).
Dead-letter queue: ~4.3M records * 5 KB = 21.5 GB.
In-memory dispatcher state: current bucket tasks ~10,000 * 2.5 KB = 25 MB per dispatcher.
Execution queue (Kafka): 100K tasks * 2.5 KB = 250 MB per priority partition.
Lock manager (etcd): 10,000 active locks * 200 bytes = 2 MB.
Cron schedule definitions: 3M recurring tasks * 500 bytes = 1.5 GB.`,

    hints: [
      `Time-bucket your task store by fire_time in 1-minute granules. This is the single most important optimization. Without bucketing, dispatchers must scan millions of rows every second. With bucketing, they only scan the current minute's bucket (typically tens to hundreds of tasks), making the system O(bucket_size) instead of O(total_tasks).`,
      `Use fencing tokens (monotonically increasing integers) attached to every lock acquisition. When an executor writes task results, it includes the fencing token. The storage layer rejects writes with tokens lower than the current recorded token. This prevents the "zombie executor" problem where a slow executor completes after its lock was already re-assigned.`,
      `Implement exponential backoff with full jitter: delay = random(0, base * 2^attempt). Full jitter (randomizing the entire delay, not just adding jitter to a fixed delay) provides the best spread and fastest recovery in distributed systems. AWS published research showing full jitter outperforms equal jitter and decorrelated jitter in most scenarios.`,
      `Separate execution queues by priority level. P0 (critical) tasks like payment processing must never be blocked behind a million P3 (low) analytics tasks. Dedicate a minimum number of executors to the P0 queue that cannot be borrowed by lower priorities, even during low P0 volume.`,
      `For cron scheduling, compute the NEXT occurrence at task completion time (not at definition time). Store only the next occurrence as a one-time task. This avoids pre-generating thousands of future occurrences and handles cron expression changes gracefully - just update the definition and the next generated occurrence uses the new schedule.`,
      `Make task handlers idempotent by requiring an idempotency key in every task payload. External API calls should include this key. At-least-once delivery means handlers WILL be called multiple times during failures. Idempotency is not optional - it is a hard requirement for correctness.`,
      `Implement dead-letter queue analysis: track failure reasons and automatically categorize them (transient vs. permanent). Transient failures (timeouts, rate limits) should be retried with backoff. Permanent failures (invalid payload, deleted resource) should go to DLQ immediately without wasting retry attempts.`,
      `Design for multi-tenancy with per-tenant rate limiting at the dispatcher level. A single tenant scheduling 1 million tasks at the same fire_time should not starve other tenants. Use weighted fair queuing: each tenant gets a proportional share of dispatch capacity based on their tier.`
    ]
  },
  {
    id: 9018,
    description: `Design a Web Crawler (Google Scale)

FUNCTIONAL REQUIREMENTS:
- Crawl billions of web pages across the entire internet
- Respect robots.txt directives and per-domain crawl-delay politeness
- Detect and handle duplicate content (exact and near-duplicate)
- Follow redirect chains (301/302) but detect and break redirect loops and spider traps
- Prioritize URLs by importance (PageRank, domain authority, freshness requirements)
- Extract and store raw HTML, metadata (title, description, links), and structured data
- Re-crawl pages based on their change frequency (adaptive re-crawl scheduling)

NON-FUNCTIONAL REQUIREMENTS:
- Crawl rate: 1,000+ pages per second per crawler instance, 100,000+ pages/second total
- Storage: handle hundreds of TB of raw HTML
- URL frontier must handle billions of URLs without running out of memory
- Must not overload any single web server (politeness is mandatory)
- Recover gracefully from crawler crashes without losing state or re-crawling already-fetched pages
- Support incremental crawling (only fetch changed pages on re-crawl)

CAPACITY ESTIMATION:
- Target: 5 billion pages crawled per month
- Crawl rate: 5B / (30 * 86400) = ~1,930 pages/second
- With 50 crawler instances: ~39 pages/second each (network-bound, not CPU-bound)
- Average page size: 100 KB HTML
- Monthly storage: 5B * 100 KB = 500 TB raw HTML per month
- URL frontier: 10 billion discovered URLs * 200 bytes = 2 TB
- Metadata store: 5B pages * 500 bytes = 2.5 TB`,

    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Pages to crawl: 5 billion/month
Crawl rate: 5B / (30 days * 86400 sec) = 1,930 pages/sec
With overhead (retries, errors, politeness delays): target 3,000 fetches/sec

Network bandwidth:
- Average page: 100 KB
- Throughput: 3,000 * 100 KB = 300 MB/sec = 2.4 Gbps
- Per crawler (50 instances): 60 pages/sec, 6 MB/sec, ~50 Mbps each

Storage (monthly):
- Raw HTML: 5B * 100 KB = 500 TB
- Compressed (gzip ~5:1): 100 TB/month
- Metadata: 5B * 500 bytes = 2.5 TB/month
- URL frontier (in-memory + disk): 10B URLs * 200 bytes = 2 TB
- Content fingerprints (dedup): 5B * 8 bytes = 40 GB

DNS cache:
- Unique domains: ~100M
- DNS records: 100M * 100 bytes = 10 GB (fits in Redis)

API DESIGN (Internal):

POST /v1/crawl/seed
{ "urls": ["https://example.com", ...], "priority": "HIGH", "depth_limit": 5 }

GET /v1/frontier/next?crawler_id=worker-3&batch_size=100
Response: { "urls": [{"url": "...", "priority": 0.85, "depth": 2}] }

POST /v1/crawl/result
{ "url": "...", "status": 200, "html_ref": "s3://crawl-2024/abc.gz",
  "content_hash": "a1b2c3...", "links": ["..."], "fetch_time_ms": 450 }`,

    intuition: `Think of a web crawler as a systematic explorer of an enormous, ever-changing maze (the internet). The explorer has a notebook (URL frontier) listing all corridors to visit, prioritized by importance. At each corridor (page), they take a photo (store HTML), note all doors leading to new corridors (extract links), and add those doors to the notebook. But there are critical rules: never visit the same room twice (deduplication), don't rush through any building too fast (politeness), and some doors have "No Entry" signs (robots.txt).

The key insight is that the URL FRONTIER is the heart of the crawler. It's not just a queue - it's a sophisticated priority system with per-domain rate limiting. The frontier must be disk-backed because billions of URLs won't fit in memory, but the hot working set (next few thousand URLs to fetch) should be in memory for speed.

The second insight is the POLITENESS constraint transforms this from a simple BFS into a complex scheduling problem. You can't just dequeue the highest-priority URL - you must also check that the domain hasn't been accessed recently. This requires a two-level queue: front queues organized by priority, and back queues organized by domain with timestamps.

The third insight is CONTENT DEDUPLICATION via fingerprinting. Exact duplicates are easy (hash the content), but near-duplicates (same article with different ads/timestamps) require locality-sensitive hashing (SimHash or MinHash). SimHash converts a document into a 64-bit fingerprint where similar documents have fingerprints that differ by only a few bits.`,

    approach: `ARCHITECTURE OVERVIEW:

1. URL FRONTIER:
   - Two-tier queue architecture: front queues (priority-based) and back queues (domain-based)
   - Front queues: multiple priority levels (P0-P3), URL dequeued from highest non-empty priority
   - Back queues: one queue per active domain, each with a "next_allowed_fetch" timestamp
   - A router maps: front queue dequeues URL -> looks up domain -> routes to appropriate back queue
   - A selector picks from back queues: finds the back queue with the earliest "next_allowed_fetch" that has passed
   - Disk-backed (RocksDB or LevelDB) for the bulk, with in-memory buffer for hot URLs
   - Bloom filter for URL-seen check (10B URLs, 1% FPR = ~12 GB)

2. FETCHER WORKERS (Async HTTP):
   - Stateless worker pool (50-100 instances)
   - Each worker: requests batch of URLs from frontier, fetches via async HTTP
   - Resolves DNS (with local cache, TTL-aware), handles redirects (max 5 hops)
   - Respects robots.txt (fetched and cached per domain, refreshed every 24 hours)
   - Timeout: 30 seconds per page, circuit breaker for consistently failing domains
   - Stores raw HTML in blob storage (S3/GCS), metadata in document store

3. CONTENT PROCESSOR:
   - Receives fetched pages from Kafka topic
   - Computes SimHash fingerprint for near-duplicate detection
   - Extracts outgoing links, normalizes URLs (remove fragments, sort params, canonicalize)
   - Extracts metadata: title, meta description, language, content type
   - Detects spider traps: excessive depth, URL pattern repetition, infinite calendars
   - Publishes extracted URLs back to the frontier (with discovered depth incremented)

4. CONTENT DEDUPLICATOR:
   - Maintains a fingerprint store: 64-bit SimHash per crawled page
   - Exact duplicate: identical hash -> skip storage, keep reference to existing copy
   - Near duplicate: Hamming distance <= 3 bits -> flag as near-dup, store only if newer
   - Partitioned by hash prefix for distributed lookup

5. BLOB STORE & METADATA STORE:
   - Raw HTML stored in S3/GCS, partitioned by crawl date
   - Metadata in Elasticsearch or HBase: URL, content hash, title, links, crawl timestamp
   - Supports full-text search over crawled content for the indexing pipeline

6. ADAPTIVE RE-CRAWL SCHEDULER:
   - Tracks page change frequency (exponential moving average of change rate)
   - Frequently changing pages (news sites) re-crawled every hour
   - Rarely changing pages re-crawled every 30 days
   - Uses HTTP conditional requests (If-Modified-Since, ETag) to avoid re-downloading unchanged pages`,

    code: `// =========================================================
// Web Crawler - Core Implementation
// =========================================================

class URLFrontier {
  constructor(numPriorities = 4, politenessDelayMs = 1000) {
    this.frontQueues = Array.from({ length: numPriorities }, () => []);
    this.backQueues = new Map();  // domain -> { queue:[], nextAllowed: timestamp }
    this.seenUrls = new BloomFilter(10000000, 0.01);
    this.politenessDelayMs = politenessDelayMs;
    this.domainPriorityMap = new Map(); // domain -> current front queue assignment
  }

  addUrl(url, priority = 2, depth = 0) {
    if (this.seenUrls.has(url)) return false;
    if (depth > 10) return false; // depth limit to prevent spider traps
    this.seenUrls.add(url);
    const domain = this.extractDomain(url);
    const entry = { url, priority, depth, addedAt: Date.now() };
    // Add to front queue by priority
    this.frontQueues[Math.min(priority, this.frontQueues.length - 1)].push(entry);
    return true;
  }

  // Get next URL respecting both priority and politeness
  getNext() {
    // Find highest-priority non-empty front queue
    for (let p = 0; p < this.frontQueues.length; p++) {
      while (this.frontQueues[p].length > 0) {
        const entry = this.frontQueues[p].shift();
        const domain = this.extractDomain(entry.url);
        // Check politeness
        if (!this.backQueues.has(domain)) {
          this.backQueues.set(domain, { nextAllowed: 0 });
        }
        const backQueue = this.backQueues.get(domain);
        const now = Date.now();
        if (now >= backQueue.nextAllowed) {
          backQueue.nextAllowed = now + this.politenessDelayMs;
          return entry;
        }
        // Domain is rate-limited; re-enqueue at same priority
        this.frontQueues[p].push(entry);
        break; // Try next priority level
      }
    }
    return null; // No URL available respecting politeness
  }

  getBatch(batchSize = 50) {
    const batch = [];
    const skippedDomains = new Set();
    for (let p = 0; p < this.frontQueues.length && batch.length < batchSize; p++) {
      const requeue = [];
      while (this.frontQueues[p].length > 0 && batch.length < batchSize) {
        const entry = this.frontQueues[p].shift();
        const domain = this.extractDomain(entry.url);
        if (skippedDomains.has(domain)) { requeue.push(entry); continue; }
        if (!this.backQueues.has(domain)) {
          this.backQueues.set(domain, { nextAllowed: 0 });
        }
        const bq = this.backQueues.get(domain);
        const now = Date.now();
        if (now >= bq.nextAllowed) {
          bq.nextAllowed = now + this.politenessDelayMs;
          batch.push(entry);
          skippedDomains.add(domain); // one URL per domain per batch
        } else {
          requeue.push(entry);
          skippedDomains.add(domain);
        }
      }
      this.frontQueues[p].unshift(...requeue);
    }
    return batch;
  }

  extractDomain(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }

  size() {
    return this.frontQueues.reduce((sum, q) => sum + q.length, 0);
  }
}

// --- Bloom Filter for URL deduplication ---
class BloomFilter {
  constructor(expectedItems, fpRate) {
    this.size = Math.ceil(-expectedItems * Math.log(fpRate) / (Math.LN2 ** 2));
    this.hashCount = Math.ceil((this.size / expectedItems) * Math.LN2);
    this.bits = new Uint8Array(Math.ceil(this.size / 8));
  }
  _hashes(value) {
    let h1 = 0, h2 = 0;
    for (let i = 0; i < value.length; i++) {
      h1 = (h1 * 31 + value.charCodeAt(i)) | 0;
      h2 = (h2 * 37 + value.charCodeAt(i)) | 0;
    }
    const positions = [];
    for (let i = 0; i < this.hashCount; i++) {
      positions.push(Math.abs((h1 + i * h2) % this.size));
    }
    return positions;
  }
  add(value) {
    for (const pos of this._hashes(value)) {
      this.bits[pos >> 3] |= (1 << (pos & 7));
    }
  }
  has(value) {
    return this._hashes(value).every(pos =>
      (this.bits[pos >> 3] & (1 << (pos & 7))) !== 0
    );
  }
}

// --- SimHash for near-duplicate detection ---
class SimHash {
  static compute(text, hashBits = 64) {
    const tokens = text.toLowerCase().split(/\\s+/).filter(t => t.length > 0);
    const v = new Array(hashBits).fill(0);
    for (const token of tokens) {
      const hash = this.tokenHash(token, hashBits);
      for (let i = 0; i < hashBits; i++) {
        v[i] += (hash[i] === 1) ? 1 : -1;
      }
    }
    return v.map(x => (x > 0 ? 1 : 0));
  }

  static tokenHash(token, bits) {
    let h = 0;
    for (let i = 0; i < token.length; i++) {
      h = ((h << 5) - h + token.charCodeAt(i)) | 0;
    }
    const result = [];
    for (let i = 0; i < bits; i++) {
      result.push((h >>> (i % 32)) & 1);
      if (i % 32 === 31) h = (h * 2654435761) | 0;
    }
    return result;
  }

  static hammingDistance(hash1, hash2) {
    let dist = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) dist++;
    }
    return dist;
  }

  static isNearDuplicate(hash1, hash2, threshold = 3) {
    return this.hammingDistance(hash1, hash2) <= threshold;
  }
}

// --- Robots.txt Parser ---
class RobotsParser {
  constructor() { this.rules = new Map(); }
  parse(robotsTxt, domain) {
    const lines = robotsTxt.split("\\n");
    let currentAgent = null;
    const domainRules = { allowed: [], disallowed: [], crawlDelay: null };
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith("#") || line === "") continue;
      const [key, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      if (key.toLowerCase() === "user-agent") {
        currentAgent = value;
      } else if (currentAgent === "*" || currentAgent === "MyBot") {
        if (key.toLowerCase() === "disallow" && value) {
          domainRules.disallowed.push(value);
        } else if (key.toLowerCase() === "allow" && value) {
          domainRules.allowed.push(value);
        } else if (key.toLowerCase() === "crawl-delay") {
          domainRules.crawlDelay = parseFloat(value) * 1000;
        }
      }
    }
    this.rules.set(domain, domainRules);
    return domainRules;
  }
  isAllowed(url) {
    const domain = new URL(url).hostname;
    const path = new URL(url).pathname;
    const rules = this.rules.get(domain);
    if (!rules) return true;
    for (const allowed of rules.allowed) {
      if (path.startsWith(allowed)) return true;
    }
    for (const disallowed of rules.disallowed) {
      if (path.startsWith(disallowed)) return false;
    }
    return true;
  }
}

// --- Demo ---
const frontier = new URLFrontier(4, 500);
const urls = [
  "https://example.com/page1", "https://example.com/page2",
  "https://other.org/a", "https://news.site/article",
  "https://blog.dev/post1", "https://blog.dev/post2",
];
for (const u of urls) frontier.addUrl(u, 1);
console.log("Frontier size:", frontier.size());
console.log("Batch:", frontier.getBatch(3).map(e => e.url));

const h1 = SimHash.compute("the quick brown fox jumps over the lazy dog");
const h2 = SimHash.compute("the quick brown fox leaps over the lazy dog");
const h3 = SimHash.compute("completely different text about system design");
console.log("Near dup (fox):", SimHash.hammingDistance(h1, h2));
console.log("Not dup:", SimHash.hammingDistance(h1, h3));`,

    jsCode: `// =========================================================
// BFS Crawler with Depth Limiting & Spider Trap Detection
// =========================================================

class WebCrawler {
  constructor(config = {}) {
    this.frontier = new Map();   // url -> {priority, depth}
    this.visited = new Set();
    this.results = new Map();    // url -> {html, links, metadata}
    this.maxDepth = config.maxDepth || 5;
    this.maxPages = config.maxPages || 10000;
    this.pagesCrawled = 0;
    this.domainCounters = new Map(); // domain -> pages crawled from it
    this.maxPerDomain = config.maxPerDomain || 1000;
    this.spiderTrapDetector = new SpiderTrapDetector();
    this.robotsCache = new Map();    // domain -> {rules, fetchedAt}
    this.duplicateHashes = new Map(); // simhash -> url (first seen)
  }

  async crawl(seedUrls) {
    // Initialize frontier with seeds
    for (const url of seedUrls) {
      this.frontier.set(url, { priority: 0, depth: 0 });
    }
    while (this.frontier.size > 0 && this.pagesCrawled < this.maxPages) {
      // Pick highest priority URL
      const [url, meta] = this.pickBestUrl();
      this.frontier.delete(url);
      if (this.visited.has(url)) continue;
      if (meta.depth > this.maxDepth) continue;

      const domain = this.extractDomain(url);
      if ((this.domainCounters.get(domain) || 0) >= this.maxPerDomain) continue;
      if (this.spiderTrapDetector.isTrapped(url)) continue;

      // Simulate fetch
      const result = await this.fetchPage(url);
      if (!result) continue;

      this.visited.add(url);
      this.pagesCrawled++;
      this.domainCounters.set(domain, (this.domainCounters.get(domain) || 0) + 1);
      this.results.set(url, result);

      // Extract and enqueue links
      for (const link of result.links) {
        if (!this.visited.has(link) && !this.frontier.has(link)) {
          const linkPriority = this.computePriority(link, meta.depth + 1);
          this.frontier.set(link, {
            priority: linkPriority, depth: meta.depth + 1
          });
        }
      }
    }
    return { pagesCrawled: this.pagesCrawled, results: this.results };
  }

  pickBestUrl() {
    let best = null;
    let bestPriority = Infinity;
    for (const [url, meta] of this.frontier) {
      if (meta.priority < bestPriority) {
        bestPriority = meta.priority;
        best = [url, meta];
      }
    }
    return best;
  }

  computePriority(url, depth) {
    // Lower number = higher priority
    // Factor in: depth (prefer shallow), domain authority, path characteristics
    let score = depth * 10;
    if (url.includes("/search") || url.includes("/tag/")) score += 20;
    if (url.endsWith(".html") || url.endsWith("/")) score -= 5;
    if (url.includes("?")) score += 10; // query strings often less valuable
    return Math.max(0, score);
  }

  async fetchPage(url) {
    // Simulated fetch - in production this would be actual HTTP
    return {
      url,
      status: 200,
      html: "<html><body>Content of " + url + "</body></html>",
      links: this.generateMockLinks(url),
      fetchedAt: Date.now(),
      contentHash: this.simpleHash(url)
    };
  }

  generateMockLinks(url) {
    const domain = this.extractDomain(url);
    const links = [];
    for (let i = 0; i < 3; i++) {
      links.push("https://" + domain + "/page-" + Math.floor(Math.random() * 100));
    }
    if (Math.random() > 0.7) {
      links.push("https://external-" + Math.floor(Math.random() * 10) + ".com/");
    }
    return links;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash;
  }

  extractDomain(url) {
    try { return new URL(url).hostname; } catch { return "unknown"; }
  }

  getStats() {
    return {
      pagesCrawled: this.pagesCrawled,
      frontierSize: this.frontier.size,
      visitedCount: this.visited.size,
      domainsVisited: this.domainCounters.size,
      topDomains: Array.from(this.domainCounters.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
    };
  }
}

class SpiderTrapDetector {
  constructor() {
    this.urlPatterns = new Map();  // domain -> Map<pattern, count>
    this.maxPatternRepetitions = 50;
  }

  isTrapped(url) {
    try {
      const parsed = new URL(url);
      const domain = parsed.hostname;
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      // Check 1: Excessive path depth
      if (pathSegments.length > 15) return true;
      // Check 2: Repeating path patterns (infinite calendars, etc.)
      const pattern = this.extractPattern(pathSegments);
      if (!this.urlPatterns.has(domain)) {
        this.urlPatterns.set(domain, new Map());
      }
      const domainPatterns = this.urlPatterns.get(domain);
      const count = (domainPatterns.get(pattern) || 0) + 1;
      domainPatterns.set(pattern, count);
      if (count > this.maxPatternRepetitions) return true;
      // Check 3: URL contains session-like dynamic segments
      if (parsed.search.length > 200) return true;
      // Check 4: Repeating directory names
      const seen = new Set();
      for (const seg of pathSegments) {
        if (seen.has(seg) && seg.length > 3) return true;
        seen.add(seg);
      }
      return false;
    } catch {
      return true;
    }
  }

  extractPattern(segments) {
    return segments.map(seg => {
      if (/^\\d+$/.test(seg)) return "{NUM}";
      if (/^[a-f0-9]{8,}$/i.test(seg)) return "{HASH}";
      return seg;
    }).join("/");
  }
}

// --- Adaptive Re-crawl Scheduler ---
class RecrawlScheduler {
  constructor() {
    this.pageProfiles = new Map(); // url -> {changeHistory, avgInterval}
  }

  recordChange(url, changed, timestamp = Date.now()) {
    if (!this.pageProfiles.has(url)) {
      this.pageProfiles.set(url, {
        history: [], lastChecked: timestamp, changeCount: 0
      });
    }
    const profile = this.pageProfiles.get(url);
    profile.history.push({ timestamp, changed });
    if (changed) profile.changeCount++;
    if (profile.history.length > 20) profile.history.shift();
    profile.lastChecked = timestamp;
  }

  getRecrawlInterval(url) {
    const profile = this.pageProfiles.get(url);
    if (!profile || profile.history.length < 2) return 86400000; // default: 1 day
    const changeRate = profile.changeCount / profile.history.length;
    if (changeRate > 0.8) return 3600000;    // hourly
    if (changeRate > 0.5) return 21600000;   // 6 hours
    if (changeRate > 0.2) return 86400000;   // daily
    return 604800000;                         // weekly
  }
}

// --- Demo ---
const crawler = new WebCrawler({ maxDepth: 3, maxPages: 20 });
const trapDetector = new SpiderTrapDetector();
console.log("Spider trap (deep):",
  trapDetector.isTrapped("https://ex.com/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p"));
console.log("Spider trap (repeat):",
  trapDetector.isTrapped("https://ex.com/cat/cat/page"));
console.log("Normal URL:",
  trapDetector.isTrapped("https://example.com/blog/post-1"));`,

    explanation: `SCALING ANALYSIS:

1. URL FRONTIER MANAGEMENT:
   - 10 billion discovered URLs cannot fit in memory (~2 TB)
   - Use disk-backed priority queue (RocksDB) with in-memory buffer for top ~100K URLs
   - Bloom filter for URL-seen check: 10B URLs, 1% FPR = 12 GB (fits in RAM)
   - Partitioned frontier: each crawler instance owns a shard of domains (consistent hashing)
   - Frontier refill: background thread loads next batch from disk when in-memory buffer < 10K

2. POLITENESS ENFORCEMENT:
   - Per-domain rate limiting is the most critical constraint
   - Default: 1 request per domain per second (configurable via robots.txt Crawl-delay)
   - Back-queue per domain ensures only one request at a time per domain
   - With 100M+ active domains and 3000 fetches/sec, average domain is hit every ~33,000 seconds
   - Hot domains (news sites) need explicit crawl-delay configuration

3. DUPLICATE DETECTION:
   - Exact duplicates: SHA-256 hash of normalized HTML (strip dynamic elements like timestamps, ads)
   - Near-duplicates: SimHash with 64-bit fingerprint, Hamming distance <= 3 bits = near-dup
   - SimHash lookup: partition fingerprint store by first 16 bits, check candidates within each partition
   - False positive rate for SimHash near-dup: ~0.1% (acceptable, flagged for manual review)

4. FAILURE MODES AND MITIGATIONS:
   - CRAWLER NODE CRASH: Frontier state checkpointed to disk every 60 seconds. On restart, replay from checkpoint. URLs in-flight are re-discovered on next crawl cycle.
   - DNS RESOLUTION FAILURE: Local DNS cache with 24-hour TTL. Fallback to multiple DNS resolvers (Google, Cloudflare). Circuit breaker for domains with repeated DNS failures.
   - TARGET SERVER OVERLOAD: Politeness delay prevents this. If server returns 429 or 503, increase crawl-delay for that domain exponentially. Back off to 1 request/minute, then 1/hour.
   - SPIDER TRAPS: Detect via URL pattern analysis (repeated path segments, excessive depth, infinite calendars). Hard limit of 1000 pages per domain per crawl cycle. Path depth limit of 15.
   - REDIRECT LOOPS: Track redirect chain, break after 5 hops. Log and skip URLs involved in loops.

5. CONTENT PROCESSING PIPELINE:
   - Fetched pages flow through Kafka to content processors
   - Processors extract links, compute fingerprints, extract metadata in parallel
   - Link extraction uses DOM parsing (not regex) for accuracy
   - URL normalization: lowercase scheme/host, remove fragments, sort query params, resolve relative URLs
   - Extracted links are published back to frontier via Kafka

6. MONITORING AND OBSERVABILITY:
   - Crawl rate (pages/sec) per crawler instance and globally
   - Frontier depth and growth rate (should stabilize, not grow unboundedly)
   - Duplicate rate (what % of fetched pages are duplicates - indicates efficiency)
   - Error rate by type (DNS failure, timeout, 4xx, 5xx, robots.txt blocked)
   - Per-domain crawl stats for the top 1000 most-crawled domains
   - Spider trap detection rate (should be low; high rate indicates detector is too aggressive)

7. TRADE-OFFS:
   - BFS vs. DFS traversal: BFS provides broader coverage but uses more frontier memory; DFS goes deep on fewer domains
   - Politeness vs. thoroughness: Aggressive crawling gets more data but risks IP bans and overloading servers
   - Exact vs. near-duplicate detection: Exact is cheap and precise; near-dup catches more but has false positives
   - Fresh content vs. new discovery: Time spent re-crawling known pages is time not spent discovering new pages`,

    timeComplexity: `URL frontier enqueue: O(log N) with priority queue, O(1) amortized with bucketed queues.
Bloom filter lookup (URL seen check): O(K) where K = number of hash functions (~7 for 1% FPR).
SimHash computation: O(T) where T = number of tokens in document.
SimHash comparison (Hamming distance): O(B) where B = fingerprint bits (64).
Robots.txt check per URL: O(R) where R = number of rules (typically < 100).
Spider trap detection: O(S) where S = number of path segments.
Per-page processing (fetch + parse + extract links): ~200-500ms dominated by network I/O.
Full crawl of 5B pages: ~19 days with 3000 pages/sec throughput.`,

    spaceComplexity: `URL frontier (disk-backed): 10B URLs * 200 bytes = 2 TB on disk, 100K in-memory buffer = 20 MB.
Bloom filter for URL dedup: 10B items, 1% FPR = 12 GB RAM.
SimHash fingerprint store: 5B pages * 8 bytes = 40 GB (partitioned across cluster).
DNS cache: 100M domains * 100 bytes = 10 GB (Redis).
Robots.txt cache: 100M domains * 2 KB avg = 200 GB (disk, hot cache 10M = 20 GB RAM).
Raw HTML storage: 500 TB/month compressed to 100 TB/month (object storage, lifecycle policies archive after 90 days).
Metadata store: 5B pages * 500 bytes = 2.5 TB (HBase/Elasticsearch).
Per-crawler memory: ~2 GB (in-memory frontier buffer + DNS cache + robots.txt hot cache).`,

    hints: [
      `Design the URL frontier as a two-tier system: front queues prioritize by importance (PageRank, freshness), back queues enforce per-domain politeness. A URL is dequeued from the highest-priority front queue, then routed to the appropriate domain's back queue. The selector only picks from back queues whose politeness timer has expired. This separation cleanly decouples priority from rate limiting.`,
      `Use a Bloom filter for the URL-seen check instead of a hash set. At 10 billion URLs, a hash set would consume ~200 GB of RAM. A Bloom filter with 1% false positive rate uses only 12 GB. The cost of the 1% false positive rate (missing 1% of URLs) is negligible compared to the memory savings. Use a counting Bloom filter if you need URL deletion support.`,
      `Implement SimHash for near-duplicate detection. Convert each page to a set of word tokens, hash each token to a 64-bit value, and combine using weighted bit voting. Two pages with SimHash Hamming distance <= 3 are near-duplicates. This catches pages that are the same content with different ads, navigation, or timestamps - extremely common on the web.`,
      `Detect spider traps with three heuristics: (1) path depth > 15 segments, (2) repeating path patterns (same directory structure appearing multiple times), (3) per-domain page count exceeding a threshold (e.g., 1000 pages from a single domain in one crawl cycle). Infinite calendars, session ID URLs, and faceted search pages are the most common traps.`,
      `Implement adaptive re-crawl scheduling by tracking each page's change frequency. Use exponential moving average of the change rate. Pages that change frequently (news sites) get re-crawled hourly; stable pages get re-crawled monthly. Use HTTP conditional requests (If-Modified-Since, ETag) to avoid downloading unchanged content. This saves 40-60% of bandwidth on re-crawls.`,
      `Normalize URLs aggressively before adding to the frontier: lowercase the scheme and host, remove fragment identifiers, sort query parameters alphabetically, remove default ports (80/443), resolve relative URLs to absolute, remove trailing slashes. Without normalization, the same page gets crawled multiple times under different URL representations.`,
      `Use async I/O for HTTP fetching. Each crawler instance should maintain hundreds of concurrent connections across different domains (not multiple connections to the same domain). Node.js with undici or Python with aiohttp can handle 1000+ concurrent connections per process. The bottleneck is network I/O, not CPU, so maximize concurrent fetches.`,
      `Checkpoint frontier state to disk every 60 seconds using a write-ahead log (WAL) pattern. On crawler restart, replay the WAL to reconstruct frontier state. This limits data loss to at most 60 seconds of discovered URLs. Combine with Kafka-based link extraction output for additional durability - re-process the last Kafka offset on restart.`
    ]
  },
  {
    id: 9019,
    description: `Design a Content Delivery Network (CDN)

FUNCTIONAL REQUIREMENTS:
- Serve static and dynamic content from edge locations geographically closest to users
- Support cache invalidation (purge specific URLs or wildcard patterns)
- Support configurable TTL per content type (images: 30 days, HTML: 5 min, API: no-cache)
- Provide origin shielding to protect origin servers from thundering herd
- Handle TLS termination at edge locations for HTTPS traffic
- Support content compression (gzip, brotli) and image optimization at the edge
- DDoS mitigation and WAF (Web Application Firewall) at edge

NON-FUNCTIONAL REQUIREMENTS:
- p99 latency < 50ms for cached content (edge hit)
- p99 latency < 200ms for cache miss (shield hit or origin fetch)
- 99.99% availability (< 52 minutes downtime/year)
- Handle 10 million requests/second globally across all edge locations
- Support 50+ TB of cached content across the edge network
- Instant purge propagation (< 5 seconds global purge)

CAPACITY ESTIMATION:
- 10M requests/second globally
- 200 edge locations worldwide
- Average 50K RPS per edge location
- Cache hit ratio target: 95%
- Cache miss rate: 500K RPS hitting shield/origin
- Average object size: 100 KB
- Total bandwidth: 10M * 100KB = 1 TB/s
- Edge cache per location: 500 GB - 2 TB SSD
- Shield cache: 50 TB (10 shield locations * 5 TB each)`,

    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Global request volume: 10 million requests/second
Edge locations: 200 worldwide (30 in North America, 30 in Europe, etc.)
Per-edge RPS: 10M / 200 = 50,000 RPS per location

Cache performance:
- Cache hit ratio: 95% (industry standard for well-configured CDN)
- Edge hits: 9.5M RPS (served from edge SSD, <50ms)
- Edge misses: 500K RPS -> go to shield tier
- Shield hit ratio: 80% of edge misses
- Shield hits: 400K RPS (served from shield, <150ms)
- Origin fetches: 100K RPS (protected by coalescing, actual origin load ~20K RPS)

Storage per edge:
- Hot content (top 10K objects): 10K * 100KB = 1 GB (fits in RAM)
- Warm content (top 500K objects): 500K * 100KB = 50 GB SSD
- Total edge cache: 2 TB SSD per edge (covers long-tail)

Bandwidth:
- Total: 10M * 100KB = 1 TB/sec globally
- Per edge: 50K * 100KB = 5 GB/sec = 40 Gbps per location
- Requires 40 Gbps+ network capacity per edge (typically 100 Gbps provisioned)

API DESIGN:

GET /<origin-host>/<path>
Headers: Host, Accept-Encoding, If-None-Match, If-Modified-Since, CDN-Loop

POST /v1/purge
{ "urls": ["https://example.com/image.jpg"],
  "patterns": ["https://example.com/css/*"],
  "soft_purge": false }

GET /v1/analytics?domain=example.com&period=1h
Response: { "requests": 5000000, "bandwidth_gb": 450,
  "cache_hit_ratio": 0.94, "p50_ms": 12, "p99_ms": 48 }`,

    intuition: `Think of a CDN as a franchise restaurant chain. The origin server is the central kitchen where all recipes are created. Edge servers are local restaurants in every city. When a customer (user) orders a dish (requests content), they go to the nearest restaurant. If that restaurant has the dish ready (cache hit), it's served instantly. If not (cache miss), the restaurant calls the regional warehouse (shield cache) which may have it. Only if the warehouse doesn't have it does the central kitchen (origin) need to prepare it from scratch.

The key insight is TIERED CACHING. A single cache layer has a fundamental problem: with 200 edge locations, a cache miss at any edge sends a request to origin. If content is requested once at each edge, origin sees 200 requests for the same object. A shield tier (mid-level cache, ~10 locations) sits between edges and origin. Edge misses go to the nearest shield, and only shield misses hit origin. This reduces origin load by 80-90%.

The second insight is REQUEST COALESCING for thundering herd protection. When a popular cached object expires, all concurrent requests for it would simultaneously miss cache and hit origin. Instead, the first request triggers an origin fetch, and all subsequent requests for the same object WAIT for that single fetch to complete, then all get served from the fresh cache entry. This collapses N origin requests into 1.

The third insight is STALE-WHILE-REVALIDATE. When a cached object's TTL expires, instead of immediately removing it and forcing a synchronous origin fetch, continue serving the stale content while asynchronously refreshing it in the background. Users get fast responses (stale but usually acceptable), and the cache is updated without blocking.`,

    approach: `ARCHITECTURE OVERVIEW:

1. DNS/ANYCAST ROUTING:
   - User's DNS query for cdn.example.com resolves to an Anycast IP address
   - Anycast routing directs the packet to the nearest edge location via BGP
   - Alternative: GeoDNS returns the IP of the edge location closest to the user's resolver
   - Health checks remove unhealthy edges from DNS/Anycast within 30 seconds

2. EDGE CACHE SERVERS (200 locations):
   - Each edge location runs a cluster of cache servers (10-50 servers)
   - Two-tier local cache: RAM (hot objects, top 1%) + SSD (warm objects, top 20%)
   - LRU eviction within each tier; objects promoted from SSD to RAM on frequency threshold
   - TLS termination using shared certificates (wildcard certs for customer domains)
   - Compression: serve pre-compressed content if available, or compress on-the-fly
   - WAF rules evaluated before cache lookup (block malicious requests early)

3. SHIELD/MID-TIER CACHE (10 locations):
   - Regional cache that aggregates edge misses from 15-20 nearby edge locations
   - Larger cache capacity (5-10 TB per shield) covers the long tail
   - Request coalescing: deduplicates concurrent requests for the same object
   - Collapsed forwarding: only one request per unique cache key sent to origin

4. ORIGIN SHIELD -> ORIGIN:
   - Origin receives only shield misses (~100K RPS, reduced to ~20K with coalescing)
   - Origin can be: customer's web server, S3 bucket, or another CDN
   - Origin health monitoring: active probes every 5 seconds, automatic failover to backup origin
   - Connection pooling: keep-alive connections to origin, reuse TCP/TLS sessions

5. CONTROL PLANE:
   - Configuration management: customer cache rules, TTLs, custom headers, WAF rules
   - Purge system: propagates invalidation to all edges via pub/sub (Redis Streams or Kafka)
   - Analytics pipeline: edge servers emit access logs -> Kafka -> aggregation -> real-time dashboard
   - Certificate management: automated Let's Encrypt renewal and distribution

6. CACHE INVALIDATION:
   - Purge API: customer calls POST /purge with URL list or wildcard pattern
   - Control plane publishes purge event to all edge locations via pub/sub (<5 second propagation)
   - Soft purge: marks content as stale but keeps serving it while revalidating from origin
   - Hard purge: immediately removes content, next request fetches from origin
   - Tag-based purge: objects tagged with metadata, purge by tag (e.g., purge all images for user X)

DATABASE SCHEMA (Control Plane):
   CacheConfig: { domain, path_pattern, ttl_seconds, cache_key_rules, origin_url, shield_location }
   PurgeLog: { purge_id, domain, pattern, type (hard/soft), initiated_at, completed_at, edge_ack_count }
   OriginConfig: { domain, primary_origin, failover_origin, health_check_path, timeout_ms }`,

    code: `// =========================================================
// Content Delivery Network - Core Cache Implementation
// =========================================================

class CacheEntry {
  constructor(key, value, headers = {}) {
    this.key = key;
    this.value = value;
    this.headers = headers;
    this.createdAt = Date.now();
    this.lastAccessed = Date.now();
    this.accessCount = 1;
    this.size = typeof value === "string" ? value.length : 0;
    this.ttl = (headers["cache-control"]
      ? this.parseTTL(headers["cache-control"]) : 300) * 1000;
    this.stale = false;
  }
  parseTTL(cacheControl) {
    const match = cacheControl.match(/max-age=(\\d+)/);
    return match ? parseInt(match[1]) : 300;
  }
  isExpired() { return Date.now() > this.createdAt + this.ttl; }
  isFresh() { return !this.stale && !this.isExpired(); }
}

class TieredCache {
  constructor(config = {}) {
    this.edgeCache = new LRUCache(config.edgeCapacity || 10000);
    this.shieldCache = new LRUCache(config.shieldCapacity || 100000);
    this.inflightRequests = new Map(); // key -> Promise (request coalescing)
    this.originFetcher = config.originFetcher || this.defaultOriginFetch;
    this.stats = { edgeHits: 0, shieldHits: 0, originFetches: 0,
      coalescedRequests: 0, staleServed: 0 };
    this.purgeSubscribers = [];
    this.staleWhileRevalidate = config.staleWhileRevalidate !== false;
  }

  async get(key, options = {}) {
    // Layer 1: Edge cache lookup
    const edgeEntry = this.edgeCache.get(key);
    if (edgeEntry && edgeEntry.isFresh()) {
      this.stats.edgeHits++;
      return { data: edgeEntry.value, headers: edgeEntry.headers, source: "edge" };
    }

    // Stale-while-revalidate: serve stale, refresh in background
    if (edgeEntry && this.staleWhileRevalidate && !edgeEntry.stale) {
      edgeEntry.stale = true;
      this.stats.staleServed++;
      this.refreshInBackground(key, options);
      return { data: edgeEntry.value, headers: edgeEntry.headers, source: "edge-stale" };
    }

    // Layer 2: Shield cache lookup
    const shieldEntry = this.shieldCache.get(key);
    if (shieldEntry && shieldEntry.isFresh()) {
      this.stats.shieldHits++;
      // Promote to edge cache
      this.edgeCache.put(key, shieldEntry);
      return { data: shieldEntry.value, headers: shieldEntry.headers, source: "shield" };
    }

    // Layer 3: Origin fetch with request coalescing
    return this.fetchFromOriginCoalesced(key, options);
  }

  async fetchFromOriginCoalesced(key, options) {
    // Request coalescing: if another request is already fetching this key, wait for it
    if (this.inflightRequests.has(key)) {
      this.stats.coalescedRequests++;
      return this.inflightRequests.get(key);
    }

    const fetchPromise = this.fetchFromOrigin(key, options);
    this.inflightRequests.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.inflightRequests.delete(key);
    }
  }

  async fetchFromOrigin(key, options) {
    this.stats.originFetches++;
    const response = await this.originFetcher(key, options);
    const entry = new CacheEntry(key, response.data, response.headers);

    // Populate both shield and edge caches
    this.shieldCache.put(key, entry);
    this.edgeCache.put(key, new CacheEntry(key, response.data, response.headers));

    return { data: response.data, headers: response.headers, source: "origin" };
  }

  async refreshInBackground(key, options) {
    try {
      const response = await this.originFetcher(key, options);
      const entry = new CacheEntry(key, response.data, response.headers);
      this.edgeCache.put(key, entry);
      this.shieldCache.put(key, new CacheEntry(key, response.data, response.headers));
    } catch (err) {
      // Background refresh failed - stale content continues to be served
    }
  }

  // Cache invalidation via pub/sub
  purge(pattern, soft = false) {
    const purged = { edge: 0, shield: 0 };
    const isWildcard = pattern.includes("*");
    const regex = isWildcard
      ? new RegExp("^" + pattern.replace(/\\*/g, ".*") + "$") : null;

    const purgeFromCache = (cache, tier) => {
      if (isWildcard) {
        for (const key of cache.keys()) {
          if (regex.test(key)) {
            if (soft) {
              const entry = cache.get(key);
              if (entry) entry.stale = true;
            } else {
              cache.remove(key);
            }
            purged[tier]++;
          }
        }
      } else {
        if (soft) {
          const entry = cache.get(pattern);
          if (entry) { entry.stale = true; purged[tier]++; }
        } else {
          if (cache.remove(pattern)) purged[tier]++;
        }
      }
    };

    purgeFromCache(this.edgeCache, "edge");
    purgeFromCache(this.shieldCache, "shield");
    // Propagate to subscribers (other edge nodes)
    for (const sub of this.purgeSubscribers) sub(pattern, soft);
    return purged;
  }

  onPurge(callback) { this.purgeSubscribers.push(callback); }

  async defaultOriginFetch(key) {
    return {
      data: "Origin content for: " + key,
      headers: { "cache-control": "max-age=300", "content-type": "text/html" }
    };
  }

  getStats() {
    const total = this.stats.edgeHits + this.stats.shieldHits
      + this.stats.originFetches;
    return {
      ...this.stats, totalRequests: total,
      cacheHitRatio: total > 0 ? ((this.stats.edgeHits + this.stats.shieldHits)
        / total * 100).toFixed(2) + "%" : "0%",
      edgeCacheSize: this.edgeCache.size,
      shieldCacheSize: this.shieldCache.size
    };
  }
}

// --- LRU Cache ---
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return null;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val); // move to end (most recent)
    val.lastAccessed = Date.now();
    val.accessCount++;
    return val;
  }
  put(key, entry) {
    if (this.cache.has(key)) this.cache.delete(key);
    if (this.cache.size >= this.capacity) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, entry);
  }
  remove(key) {
    return this.cache.delete(key);
  }
  keys() { return this.cache.keys(); }
  get size() { return this.cache.size; }
}

// --- Demo ---
const cdn = new TieredCache({ edgeCapacity: 100, shieldCapacity: 1000 });
async function demo() {
  const r1 = await cdn.get("/images/logo.png");
  console.log("First fetch:", r1.source);
  const r2 = await cdn.get("/images/logo.png");
  console.log("Second fetch:", r2.source);
  // Concurrent requests - coalesced
  const [r3, r4, r5] = await Promise.all([
    cdn.get("/new-page.html"), cdn.get("/new-page.html"), cdn.get("/new-page.html")
  ]);
  console.log("Coalesced:", r3.source, r4.source, r5.source);
  console.log("Purge:", cdn.purge("/images/*"));
  console.log("Stats:", cdn.getStats());
}
demo();`,

    jsCode: `// =========================================================
// CDN Edge Router, DDoS Mitigation & Analytics
// =========================================================

class EdgeRouter {
  constructor() {
    this.edgeLocations = new Map(); // locationId -> {lat, lng, healthy, capacity}
    this.healthCheckInterval = 5000;
    this.geoIndex = [];  // sorted by region for fast lookup
  }

  addEdge(id, lat, lng, capacityGbps) {
    this.edgeLocations.set(id, {
      id, lat, lng, healthy: true, capacityGbps,
      currentLoadGbps: 0, lastHealthCheck: Date.now()
    });
    this.rebuildGeoIndex();
  }

  rebuildGeoIndex() {
    this.geoIndex = Array.from(this.edgeLocations.values())
      .filter(e => e.healthy);
  }

  // Find nearest healthy edge with available capacity
  route(clientLat, clientLng) {
    let bestEdge = null;
    let bestDistance = Infinity;
    for (const edge of this.geoIndex) {
      if (!edge.healthy) continue;
      if (edge.currentLoadGbps >= edge.capacityGbps * 0.9) continue;
      const dist = this.haversineDistance(clientLat, clientLng, edge.lat, edge.lng);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestEdge = edge;
      }
    }
    // Fallback: if all nearby edges are overloaded, find any healthy edge
    if (!bestEdge) {
      for (const edge of this.geoIndex) {
        if (edge.healthy) { bestEdge = edge; break; }
      }
    }
    return bestEdge ? { edgeId: bestEdge.id, distanceKm: Math.round(bestDistance) }
      : null;
  }

  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180)
      * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  markUnhealthy(edgeId) {
    const edge = this.edgeLocations.get(edgeId);
    if (edge) { edge.healthy = false; this.rebuildGeoIndex(); }
  }

  markHealthy(edgeId) {
    const edge = this.edgeLocations.get(edgeId);
    if (edge) { edge.healthy = true; this.rebuildGeoIndex(); }
  }
}

// --- DDoS Mitigation ---
class DDoSMitigator {
  constructor(config = {}) {
    this.ipCounters = new Map();    // ip -> {count, windowStart}
    this.windowMs = config.windowMs || 10000;
    this.thresholdPerWindow = config.threshold || 1000;
    this.blockedIPs = new Map();    // ip -> blockExpiry
    this.blockDurationMs = config.blockDuration || 300000;
    this.fingerprintCounters = new Map(); // request fingerprint -> count
  }

  shouldAllow(request) {
    const ip = request.ip;
    const now = Date.now();
    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      if (now < this.blockedIPs.get(ip)) return { allowed: false, reason: "IP_BLOCKED" };
      this.blockedIPs.delete(ip);
    }
    // Rate check per IP
    if (!this.ipCounters.has(ip)) {
      this.ipCounters.set(ip, { count: 0, windowStart: now });
    }
    const counter = this.ipCounters.get(ip);
    if (now - counter.windowStart > this.windowMs) {
      counter.count = 0;
      counter.windowStart = now;
    }
    counter.count++;
    if (counter.count > this.thresholdPerWindow) {
      this.blockedIPs.set(ip, now + this.blockDurationMs);
      return { allowed: false, reason: "RATE_EXCEEDED" };
    }
    // Check request fingerprint for L7 attack patterns
    const fingerprint = this.computeFingerprint(request);
    const fpCount = (this.fingerprintCounters.get(fingerprint) || 0) + 1;
    this.fingerprintCounters.set(fingerprint, fpCount);
    if (fpCount > this.thresholdPerWindow * 5) {
      return { allowed: false, reason: "ATTACK_PATTERN" };
    }
    return { allowed: true };
  }

  computeFingerprint(request) {
    return [request.method, request.path, request.userAgent || ""].join("|");
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, expiry] of this.blockedIPs) {
      if (now > expiry) this.blockedIPs.delete(ip);
    }
    this.fingerprintCounters.clear();
  }

  getBlockedIPs() {
    return Array.from(this.blockedIPs.entries())
      .map(([ip, expiry]) => ({ ip, expiresIn: expiry - Date.now() }));
  }
}

// --- CDN Analytics Pipeline ---
class CDNAnalytics {
  constructor(flushIntervalMs = 10000) {
    this.buffer = [];
    this.aggregates = new Map(); // minute-bucket -> stats
    this.flushInterval = flushIntervalMs;
    this.maxBufferSize = 10000;
  }

  record(event) {
    this.buffer.push({
      timestamp: Date.now(), url: event.url, status: event.status,
      cacheStatus: event.cacheStatus, latencyMs: event.latencyMs,
      bytesServed: event.bytesServed, edgeLocation: event.edgeLocation,
      country: event.country
    });
    if (this.buffer.length >= this.maxBufferSize) this.flush();
  }

  flush() {
    for (const event of this.buffer) {
      const bucket = Math.floor(event.timestamp / 60000) * 60000;
      if (!this.aggregates.has(bucket)) {
        this.aggregates.set(bucket, {
          requests: 0, bytesServed: 0, cacheHits: 0, cacheMisses: 0,
          latencies: [], errors: 0,
          byEdge: new Map(), byCountry: new Map(), byStatus: new Map()
        });
      }
      const agg = this.aggregates.get(bucket);
      agg.requests++;
      agg.bytesServed += event.bytesServed || 0;
      agg.latencies.push(event.latencyMs);
      if (event.cacheStatus === "HIT") agg.cacheHits++;
      else agg.cacheMisses++;
      if (event.status >= 500) agg.errors++;

      const edgeCount = agg.byEdge.get(event.edgeLocation) || 0;
      agg.byEdge.set(event.edgeLocation, edgeCount + 1);
      const countryCount = agg.byCountry.get(event.country) || 0;
      agg.byCountry.set(event.country, countryCount + 1);
      const statusCount = agg.byStatus.get(event.status) || 0;
      agg.byStatus.set(event.status, statusCount + 1);
    }
    this.buffer = [];
  }

  query(startTime, endTime) {
    this.flush();
    const result = { requests: 0, bytesServed: 0, cacheHitRatio: 0,
      p50Latency: 0, p95Latency: 0, p99Latency: 0, errorRate: 0 };
    const allLatencies = [];
    let totalHits = 0, totalMisses = 0, totalErrors = 0;

    for (const [bucket, agg] of this.aggregates) {
      if (bucket >= startTime && bucket <= endTime) {
        result.requests += agg.requests;
        result.bytesServed += agg.bytesServed;
        totalHits += agg.cacheHits;
        totalMisses += agg.cacheMisses;
        totalErrors += agg.errors;
        allLatencies.push(...agg.latencies);
      }
    }
    allLatencies.sort((a, b) => a - b);
    const pct = (p) => allLatencies[Math.floor(allLatencies.length * p)] || 0;
    result.p50Latency = pct(0.50);
    result.p95Latency = pct(0.95);
    result.p99Latency = pct(0.99);
    result.cacheHitRatio = totalHits + totalMisses > 0
      ? (totalHits / (totalHits + totalMisses) * 100).toFixed(2) + "%" : "N/A";
    result.errorRate = result.requests > 0
      ? (totalErrors / result.requests * 100).toFixed(2) + "%" : "0%";
    return result;
  }
}

// --- Demo ---
const router = new EdgeRouter();
router.addEdge("us-east-1", 39.0, -77.5, 100);
router.addEdge("eu-west-1", 53.3, -6.3, 80);
router.addEdge("ap-south-1", 19.1, 72.9, 60);
console.log("Route from NYC:", router.route(40.7, -74.0));
console.log("Route from London:", router.route(51.5, -0.1));
console.log("Route from Mumbai:", router.route(19.0, 72.8));

const ddos = new DDoSMitigator({ threshold: 5, windowMs: 1000 });
for (let i = 0; i < 7; i++) {
  console.log("Request " + i + ":",
    ddos.shouldAllow({ ip: "1.2.3.4", method: "GET", path: "/" }));
}`,

    explanation: `SCALING ANALYSIS:

1. EDGE CACHE PERFORMANCE:
   - Each edge serves 50K RPS from SSD/RAM cache
   - Hot objects (top 1% by access frequency) kept in RAM: ~1 GB, sub-millisecond access
   - Warm objects on NVMe SSD: ~2 TB, 0.1-1ms access
   - LRU eviction ensures cache contains the most-requested content
   - With 95% cache hit ratio, only 5% of requests propagate beyond the edge
   - Edge server hardware: 2x Intel Xeon, 256 GB RAM, 4x 2TB NVMe SSD, 2x 100 Gbps NIC

2. SHIELD TIER EFFECTIVENESS:
   - 10 shield locations aggregate misses from ~20 edges each
   - Without shield: origin sees 200 * miss_rate * RPS = 200 * 5% * 50K = 500K RPS
   - With shield (80% hit ratio): origin sees 200 * 5% * 20% * 50K = 100K RPS
   - Request coalescing at shield further reduces to ~20K RPS actual origin fetches
   - Shield is the single most impactful optimization for origin protection

3. REQUEST COALESCING (THUNDERING HERD):
   - When a popular object expires, N concurrent requests arrive simultaneously
   - Without coalescing: N requests all go to origin -> origin overload
   - With coalescing: first request fetches from origin, remaining N-1 wait and share the result
   - Implementation: in-flight request map keyed by cache key; subsequent requests join the pending promise
   - Critical for flash sales, breaking news, viral content scenarios

4. STALE-WHILE-REVALIDATE:
   - When TTL expires, serve stale content immediately (user gets fast response)
   - Trigger background async refresh to origin
   - User gets content in <50ms instead of waiting 100-200ms for origin response
   - Trade-off: content may be slightly out of date (acceptable for images, CSS, JS; not for real-time data)
   - Configurable per content type via Cache-Control headers

5. FAILURE MODES:
   - EDGE NODE FAILURE: Anycast/GeoDNS health checks detect within 30 seconds. Traffic rerouted to next-nearest edge. Users experience brief latency increase, not downtime.
   - SHIELD NODE FAILURE: Edge falls through to origin or alternate shield. Origin sees temporary load spike until replacement shield warms up.
   - ORIGIN FAILURE: CDN serves stale content (if available) and returns 503 for uncached content. Origin failover to backup triggers automatically.
   - NETWORK PARTITION: Edge serves from local cache (potentially stale). Purge propagation delayed until partition heals.
   - CACHE STAMPEDE AFTER PURGE: Request coalescing prevents N requests from hitting origin. Warm shield cache before purging edge.

6. CACHE INVALIDATION STRATEGIES:
   - HARD PURGE: Immediately removes content. Use for security issues, legal takedowns.
   - SOFT PURGE: Marks as stale, serves stale while revalidating. Use for routine content updates.
   - TAG-BASED PURGE: Purge all objects with a specific tag (e.g., "product-123"). Enables invalidating related content without knowing exact URLs.
   - TTL-BASED EXPIRY: Set appropriate TTLs per content type. Images: 30 days. HTML: 5 min. API responses: 0 (no-cache).
   - Propagation via pub/sub (Redis Streams/Kafka): <5 seconds to reach all 200 edge locations.

7. MONITORING:
   - Cache hit ratio per edge location (target: >90%, alert if <80%)
   - Origin request rate (should be stable; spikes indicate cache issues)
   - p50/p95/p99 latency per edge and globally
   - Bandwidth utilization per edge vs. provisioned capacity
   - Purge propagation latency (time from API call to last edge acknowledgment)
   - DDoS mitigation: blocked request rate, false positive rate`,

    timeComplexity: `Edge cache lookup (LRU): O(1) with hash map.
Shield cache lookup: O(1) with hash map.
Request coalescing check: O(1) hash map lookup.
GeoDNS routing decision: O(E) where E = number of edge locations (200), optimized to O(log E) with spatial index.
Purge propagation: O(E) to fan out to all edges, O(N) per edge where N = cached objects matching pattern.
Wildcard purge: O(C) where C = total cached objects per edge (scan required for pattern matching).
DDoS check per request: O(1) for IP rate limiting, O(K) for fingerprint computation where K = request fields.
Health check cycle: O(E) every 5 seconds.`,

    spaceComplexity: `Per edge location: 256 GB RAM (hot cache ~1 GB, OS/app ~4 GB, rest for warm objects) + 8 TB NVMe SSD.
Total edge storage: 200 edges * 8 TB = 1.6 PB total edge cache capacity.
Shield tier: 10 locations * 50 TB = 500 TB total shield cache.
DNS/routing tables: 200 edge locations * 100 bytes = 20 KB (negligible).
Purge propagation state: <1 MB per edge for pending purge queue.
DDoS mitigation state: 1M IP counters * 100 bytes = 100 MB per edge.
Analytics buffer: 10K events * 200 bytes = 2 MB per edge, flushed every 10 seconds.
Configuration store: 100K domains * 5 KB config = 500 MB (replicated to all edges).
TLS certificates: 100K certs * 4 KB = 400 MB per edge.`,

    hints: [
      `Implement tiered caching (edge -> shield -> origin) as the foundational architecture. The shield tier is what makes a CDN viable at scale. Without it, the origin server sees (number_of_edges * miss_rate * RPS) requests, which quickly overwhelms any origin. The shield collapses this to (number_of_shields * shield_miss_rate * aggregated_RPS), reducing origin load by 80-95%.`,
      `Request coalescing (also called collapsed forwarding) is essential for thundering herd protection. When multiple requests arrive for the same uncached object simultaneously, only the first request triggers an origin fetch. All subsequent requests wait for and share the result of that single fetch. Implement this with an in-flight request map: check if a fetch is already pending for the cache key before initiating a new one.`,
      `Implement stale-while-revalidate to eliminate the latency spike when cached objects expire. When a TTL expires, serve the stale content immediately (sub-millisecond) while triggering an async background refresh. The user never waits for an origin fetch. This is especially important for high-traffic objects where even a brief miss window causes a burst of origin requests.`,
      `Use Anycast for routing users to the nearest edge location. With Anycast, all edge locations advertise the same IP address, and BGP routing naturally directs packets to the nearest location. This is simpler and more resilient than GeoDNS (which requires maintaining a GeoIP database and has DNS TTL caching issues). Anycast also provides natural DDoS absorption by distributing attack traffic across all edges.`,
      `Design cache invalidation as a pub/sub system with at-least-once delivery. Each edge subscribes to a purge topic. When a purge is initiated, publish the event and wait for acknowledgments from all edges. Track purge propagation latency (target: <5 seconds globally). For soft purges, mark content as stale rather than deleting it - this avoids cache stampedes.`,
      `Implement tag-based cache invalidation alongside URL-based purging. When caching an object, attach metadata tags (e.g., "domain:example.com", "type:image", "product:123"). This enables purging all related content without knowing exact URLs. Critical for e-commerce (invalidate all images for a product) and CMS (invalidate all pages when a template changes).`,
      `Layer DDoS mitigation at the edge: (1) Anycast distributes volumetric attacks across all edges, (2) IP rate limiting blocks individual bad actors, (3) request fingerprinting detects L7 application-layer attacks, (4) challenge-response (CAPTCHA) for suspicious traffic. Each layer catches different attack types, and the edge's distributed nature means no single point absorbs the full attack volume.`,
      `Monitor cache hit ratio obsessively - it is the single most important CDN metric. A drop from 95% to 90% cache hit ratio doubles origin load (from 5% miss to 10% miss). Common causes of degraded hit ratio: poor cache key design (unnecessary variation), low TTLs, cache capacity too small for the working set, and frequent purges. Set up alerts for sustained drops below your target.`
    ]
  },
  {
    id: 9020,
    description: `Design a Metrics/Monitoring System (Datadog/Prometheus)

FUNCTIONAL REQUIREMENTS:
- Ingest millions of time-series data points per second from agents on thousands of hosts
- Support multi-dimensional tagging (e.g., metric: cpu.usage, host: web-01, region: us-east, service: api)
- Provide real-time dashboards with 1-second granularity for the most recent data
- Support alerting with threshold, anomaly, and composite conditions
- Retain high-resolution data (1-second) for 15 days, then downsample to 1-minute for 90 days, then 1-hour for 1+ year
- Query engine supports aggregation (avg, sum, max, min, percentiles) across multiple dimensions
- Support metric types: counter, gauge, histogram, and distribution

NON-FUNCTIONAL REQUIREMENTS:
- Ingestion throughput: 5 million data points/second sustained, 15M/s peak
- Query latency: <500ms for dashboards covering 1-hour windows, <5s for 30-day windows
- Alerting evaluation latency: <30 seconds from data ingestion to alert firing
- 99.9% availability for ingestion path (data loss is unacceptable during outages)
- 99.95% availability for query path
- Horizontal scalability for both ingestion and query paths independently

CAPACITY ESTIMATION:
- 5 million data points/second * 86400 seconds/day = 432 billion points/day
- Each data point: timestamp (8 bytes) + value (8 bytes) + series_id (8 bytes) = 24 bytes raw
- With compression (delta-of-delta + XOR): ~2 bytes/point average (Gorilla compression)
- Daily raw storage: 432B * 2 bytes = 864 GB/day compressed
- 15 days high-res: 864 GB * 15 = ~13 TB
- 90 days at 1-minute (60x compression): 13 TB / 60 * 90/15 = ~1.3 TB
- 1 year at 1-hour (3600x from original): ~88 GB
- Total: ~15 TB active storage`,

    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Ingestion volume:
- 10,000 hosts, each reporting 500 metrics every 10 seconds
- 10,000 * 500 / 10 = 500,000 data points/second (baseline)
- With application metrics, custom metrics, container metrics: 5M points/sec total
- Peak (deployments, incidents): 3x baseline = 15M points/sec

Unique time series (cardinality):
- 10,000 hosts * 500 base metrics = 5M base series
- With dimensional tags (service, region, endpoint): 5M * avg 10 tag combos = 50M unique series
- High cardinality warning: user_id as a tag would create billions of series (anti-pattern)

Storage:
- Raw data point: 24 bytes (timestamp + value + series_id)
- After Gorilla compression: ~2 bytes/point (12x compression)
- 5M points/sec * 2 bytes * 86400 = 864 GB/day compressed
- 15-day retention: 864 GB * 15 = 12.96 TB
- After rollup to 1-minute: 864 GB / 60 = 14.4 GB/day (90-day retention: 1.3 TB)
- After rollup to 1-hour: 864 GB / 3600 = 240 MB/day (365-day retention: 88 GB)
- Total active storage: ~15 TB

Kafka (ingestion buffer):
- 5M points/sec * 50 bytes (with tags) = 250 MB/sec
- 100 partitions, 3x replication, 24h retention = 250 MB * 3 * 86400 = ~65 TB

API DESIGN:

POST /v1/metrics/ingest
{ "series": [
    { "metric": "cpu.usage", "points": [[1710000000, 78.5], [1710000010, 82.1]],
      "tags": {"host": "web-01", "region": "us-east", "service": "api"}, "type": "gauge" },
    { "metric": "http.requests", "points": [[1710000000, 1523]],
      "tags": {"host": "web-01", "endpoint": "/api/users", "status": "200"}, "type": "counter" }
  ]}

GET /v1/query?metric=cpu.usage&agg=avg&by=service&from=-1h&to=now&filter=region:us-east
Response:
{ "series": [
    { "tags": {"service": "api"}, "points": [[1710000000, 72.3], [1710000060, 75.1], ...] },
    { "tags": {"service": "web"}, "points": [[1710000000, 45.8], [1710000060, 48.2], ...] }
  ], "resolution": "1m", "query_time_ms": 120 }

POST /v1/alerts
{ "name": "High CPU", "metric": "cpu.usage", "condition": "avg > 90",
  "by": ["host"], "window": "5m", "consecutive": 3,
  "notify": ["pagerduty://team-infra", "slack://#alerts"] }`,

    intuition: `Think of a metrics monitoring system as a massive distributed thermometer network. Thousands of thermometers (agents) take temperature readings (metrics) every few seconds and send them to a central nervous system (monitoring platform). The platform must store this firehose of data efficiently, let operators see real-time temperature maps (dashboards), and sound alarms when something gets too hot (alerting).

The key insight is TIME-SERIES DATABASE OPTIMIZATION. Regular databases are terrible at time-series data because they optimize for random access patterns. Time-series data has very specific properties: values arrive in chronological order, queries almost always filter by time range, and adjacent points for the same metric are numerically similar. Gorilla compression exploits this: it stores the delta-of-delta for timestamps (usually 0, stored in 1 bit) and XOR of consecutive values (usually few bits change, stored efficiently). This achieves 12x compression, making RAM-resident recent data feasible.

The second insight is ROLLUP/DOWNSAMPLING for multi-resolution storage. Nobody looks at 1-second data from 6 months ago. By pre-computing minute-level and hour-level aggregates (avg, min, max, count, sum), we reduce long-term storage by 3600x while preserving the ability to answer historical queries. This is done by a background rollup job that reads high-res data and writes rollups before the high-res data expires.

The third insight is DECOUPLING INGESTION FROM QUERY. The ingestion path (agents -> Kafka -> TSDB writers) must never slow down, even if queries are expensive. These two paths have fundamentally different resource profiles: ingestion is write-heavy and sequential, while queries are read-heavy and random. Kafka acts as a buffer between them, absorbing ingestion spikes.`,

    approach: `ARCHITECTURE OVERVIEW:

1. AGENT (Data Collection):
   - Lightweight agent installed on every host (like Datadog Agent or Prometheus Node Exporter)
   - Collects system metrics (CPU, memory, disk, network) and application metrics (custom counters, gauges)
   - Batches data points locally (every 10 seconds) to reduce network overhead
   - Compresses batch with gzip before sending to intake endpoint
   - Local buffer (disk-backed) for when intake is temporarily unavailable
   - Tags each metric with host, service, environment, region metadata

2. INTAKE / ROUTER (Kafka-based):
   - Stateless HTTP endpoints receive metric batches from agents
   - Validates, normalizes, and publishes to Kafka topic partitioned by metric name hash
   - Kafka provides durability (3x replication), backpressure handling, and decoupling
   - 100 Kafka partitions allow 100 parallel TSDB writers
   - Separate Kafka topic for alert evaluation (real-time path)

3. TSDB STORAGE ENGINE:
   - Custom time-series storage optimized for sequential writes and range reads
   - Data organized in time-partitioned chunks: each chunk covers 2 hours of data for a set of series
   - Within a chunk, data is compressed using Gorilla encoding (delta-of-delta timestamps, XOR values)
   - Series indexed by metric name + tag set -> series_id (inverted index)
   - Hot tier: last 2 hours in RAM (write buffer), flushed to SSD
   - Warm tier: 2 hours to 15 days on SSD (high-resolution)
   - Cold tier: 15 days to 1 year on HDD/object storage (downsampled)
   - Sharded by series_id hash across TSDB nodes

4. ROLLUP / DOWNSAMPLING SERVICE:
   - Background job that reads expired high-resolution data before it's deleted
   - Computes 1-minute aggregates: avg, min, max, sum, count (for computing avg later)
   - Computes 1-hour aggregates from 1-minute data
   - Writes rollups to separate storage tables/partitions
   - Runs continuously, processing data that's about to age out of the current tier

5. QUERY ENGINE:
   - Receives queries with metric name, tag filters, time range, aggregation function
   - Determines which resolution tier to read based on time range
   - Scatter-gather: routes sub-queries to relevant TSDB shards, merges results
   - Supports GROUP BY tags for dimensional aggregation
   - Query optimizer: pushes filters down to storage, uses inverted index for tag filtering

6. ALERT EVALUATOR:
   - Consumes from real-time Kafka topic (not from storage - for low latency)
   - Evaluates alert rules against incoming data points
   - Supports: threshold (value > X), window (avg over 5min > X), consecutive (3 consecutive windows)
   - Maintains alert state per rule: OK -> WARN -> ALERT -> RESOLVED
   - Sends notifications via integrations (PagerDuty, Slack, email, webhook)
   - Deduplication: suppress repeated alerts for the same condition within snooze window

DATABASE SCHEMA (Metadata):
   MetricDefinition: { metric_name, type (gauge/counter/histogram), description, unit }
   SeriesIndex: { series_id, metric_name, tag_set_hash, tags (JSON) }
   AlertRule: { rule_id, metric, condition, window, by_tags, notify_channels, enabled }
   AlertState: { rule_id, group_key, state, last_evaluated, last_triggered }`,

    code: `// =========================================================
// Metrics Monitoring System - Core Implementation
// =========================================================

class TimeSeriesStore {
  constructor(config = {}) {
    this.series = new Map();         // seriesId -> {metadata, chunks:[]}
    this.seriesIndex = new Map();    // metricName -> Map<tagHash, seriesId>
    this.rollups = new Map();        // seriesId -> {minute: [], hour: []}
    this.highResRetentionMs = (config.highResDays || 15) * 86400000;
    this.minuteRetentionMs = (config.minuteDays || 90) * 86400000;
    this.seriesCounter = 0;
  }

  // Resolve or create series ID from metric name + tags
  getOrCreateSeriesId(metric, tags) {
    const tagHash = this.hashTags(tags);
    if (!this.seriesIndex.has(metric)) {
      this.seriesIndex.set(metric, new Map());
    }
    const metricIndex = this.seriesIndex.get(metric);
    if (metricIndex.has(tagHash)) return metricIndex.get(tagHash);

    const seriesId = ++this.seriesCounter;
    metricIndex.set(tagHash, seriesId);
    this.series.set(seriesId, {
      metric, tags, points: [],        // high-resolution points
      lastValue: null, lastTimestamp: 0
    });
    this.rollups.set(seriesId, { minute: [], hour: [] });
    return seriesId;
  }

  hashTags(tags) {
    return Object.entries(tags).sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => k + "=" + v).join(",");
  }

  // Ingest a batch of data points
  ingest(metric, tags, points) {
    const seriesId = this.getOrCreateSeriesId(metric, tags);
    const series = this.series.get(seriesId);
    for (const [timestamp, value] of points) {
      // Delta encoding for compression simulation
      series.points.push({ t: timestamp, v: value });
      series.lastValue = value;
      series.lastTimestamp = timestamp;
    }
    // Trim points beyond retention
    const cutoff = Date.now() - this.highResRetentionMs;
    series.points = series.points.filter(p => p.t > cutoff);
  }

  // Query with filtering and aggregation
  query(metric, options = {}) {
    const { from = Date.now() - 3600000, to = Date.now(), agg = "avg",
      filterTags = {}, groupBy = [] } = options;

    // Determine resolution based on time range
    const rangeMs = to - from;
    const resolution = rangeMs > 86400000 * 7 ? "hour"
      : rangeMs > 86400000 ? "minute" : "raw";

    // Find matching series using inverted index
    const metricIndex = this.seriesIndex.get(metric);
    if (!metricIndex) return [];

    const matchingSeries = [];
    for (const [, seriesId] of metricIndex) {
      const series = this.series.get(seriesId);
      if (this.matchesTags(series.tags, filterTags)) {
        matchingSeries.push(series);
      }
    }

    // Group by specified tags
    const groups = new Map();
    for (const series of matchingSeries) {
      const groupKey = groupBy.length > 0
        ? groupBy.map(t => t + "=" + (series.tags[t] || "*")).join(",")
        : "__all__";
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(series);
    }

    // Aggregate within each group
    const results = [];
    for (const [groupKey, groupSeries] of groups) {
      const points = this.getPoints(groupSeries, from, to, resolution);
      const aggregated = this.aggregatePoints(points, agg, resolution);
      const groupTags = {};
      if (groupKey !== "__all__") {
        for (const kv of groupKey.split(",")) {
          const [k, v] = kv.split("=");
          groupTags[k] = v;
        }
      }
      results.push({ tags: groupTags, points: aggregated, resolution });
    }
    return results;
  }

  getPoints(seriesList, from, to, resolution) {
    if (resolution === "raw") {
      const allPoints = [];
      for (const s of seriesList) {
        for (const p of s.points) {
          if (p.t >= from && p.t <= to) allPoints.push(p);
        }
      }
      return allPoints.sort((a, b) => a.t - b.t);
    }
    // Use rollups for minute/hour resolution
    const allPoints = [];
    for (const s of seriesList) {
      const seriesId = this.getOrCreateSeriesId(s.metric, s.tags);
      const rollup = this.rollups.get(seriesId);
      const data = resolution === "minute" ? rollup.minute : rollup.hour;
      for (const p of data) {
        if (p.t >= from && p.t <= to) allPoints.push(p);
      }
    }
    return allPoints.sort((a, b) => a.t - b.t);
  }

  aggregatePoints(points, agg, resolution) {
    if (points.length === 0) return [];
    const bucketMs = resolution === "hour" ? 3600000
      : resolution === "minute" ? 60000 : 10000;
    const buckets = new Map();
    for (const p of points) {
      const bk = Math.floor(p.t / bucketMs) * bucketMs;
      if (!buckets.has(bk)) buckets.set(bk, []);
      buckets.get(bk).push(p.v);
    }
    const result = [];
    for (const [t, values] of Array.from(buckets.entries()).sort((a, b) => a[0] - b[0])) {
      let aggregated;
      switch (agg) {
        case "avg": aggregated = values.reduce((a, b) => a + b, 0) / values.length; break;
        case "sum": aggregated = values.reduce((a, b) => a + b, 0); break;
        case "max": aggregated = Math.max(...values); break;
        case "min": aggregated = Math.min(...values); break;
        case "count": aggregated = values.length; break;
        case "p95": {
          values.sort((a, b) => a - b);
          aggregated = values[Math.floor(values.length * 0.95)] || 0;
          break;
        }
        default: aggregated = values.reduce((a, b) => a + b, 0) / values.length;
      }
      result.push([t, Math.round(aggregated * 100) / 100]);
    }
    return result;
  }

  matchesTags(seriesTags, filterTags) {
    for (const [key, value] of Object.entries(filterTags)) {
      if (seriesTags[key] !== value) return false;
    }
    return true;
  }

  // Rollup: downsample raw data to minute and hour aggregates
  performRollup() {
    const now = Date.now();
    let rolledUp = 0;
    for (const [seriesId, series] of this.series) {
      const rollup = this.rollups.get(seriesId);
      // Create minute rollups from raw points
      const minuteBuckets = new Map();
      for (const p of series.points) {
        const bk = Math.floor(p.t / 60000) * 60000;
        if (!minuteBuckets.has(bk)) minuteBuckets.set(bk, []);
        minuteBuckets.get(bk).push(p.v);
      }
      for (const [t, values] of minuteBuckets) {
        const existing = rollup.minute.find(r => r.t === t);
        if (!existing) {
          rollup.minute.push({
            t, v: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values), max: Math.max(...values),
            sum: values.reduce((a, b) => a + b, 0), count: values.length
          });
          rolledUp++;
        }
      }
      // Trim old rollups
      const minuteCutoff = now - this.minuteRetentionMs;
      rollup.minute = rollup.minute.filter(r => r.t > minuteCutoff);
    }
    return rolledUp;
  }

  getStats() {
    return {
      totalSeries: this.series.size,
      totalMetrics: this.seriesIndex.size,
      totalRawPoints: Array.from(this.series.values())
        .reduce((sum, s) => sum + s.points.length, 0)
    };
  }
}

// --- Demo ---
const store = new TimeSeriesStore({ highResDays: 1 });
const now = Date.now();
for (let i = 0; i < 60; i++) {
  store.ingest("cpu.usage", { host: "web-01", region: "us-east" },
    [[now - (60 - i) * 10000, 50 + Math.random() * 40]]);
  store.ingest("cpu.usage", { host: "web-02", region: "us-east" },
    [[now - (60 - i) * 10000, 30 + Math.random() * 30]]);
  store.ingest("cpu.usage", { host: "api-01", region: "eu-west" },
    [[now - (60 - i) * 10000, 60 + Math.random() * 30]]);
}
store.performRollup();
console.log("Stats:", store.getStats());
const result = store.query("cpu.usage", {
  from: now - 600000, to: now, agg: "avg",
  filterTags: { region: "us-east" }, groupBy: ["host"]
});
console.log("Query result groups:", result.length);
for (const r of result) {
  console.log("  " + JSON.stringify(r.tags) + ": " + r.points.length + " points");
}`,

    jsCode: `// =========================================================
// Alert Evaluator & Metric Ingestion Pipeline
// =========================================================

class AlertEvaluator {
  constructor() {
    this.rules = new Map();     // ruleId -> AlertRule
    this.states = new Map();    // ruleId:groupKey -> AlertState
    this.notifications = [];    // emitted alerts
    this.windowBuffers = new Map(); // ruleId:groupKey -> sliding window of values
  }

  addRule(rule) {
    const ruleConfig = {
      id: rule.id, metric: rule.metric, condition: this.parseCondition(rule.condition),
      windowMs: (rule.windowMinutes || 5) * 60000,
      consecutiveWindows: rule.consecutive || 1,
      groupBy: rule.groupBy || [], notifyChannels: rule.notify || [],
      enabled: rule.enabled !== false
    };
    this.rules.set(rule.id, ruleConfig);
    return ruleConfig;
  }

  parseCondition(condStr) {
    // Parse: "avg > 90", "max >= 100", "p95 > 500", "count < 10"
    const match = condStr.match(/^(avg|max|min|sum|count|p95|p99)\\s*(>|>=|<|<=|==)\\s*([\\d.]+)$/);
    if (!match) throw new Error("Invalid condition: " + condStr);
    return { agg: match[1], operator: match[2], threshold: parseFloat(match[3]) };
  }

  // Evaluate all rules against incoming data point
  evaluate(metric, tags, timestamp, value) {
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled || rule.metric !== metric) continue;

      // Compute group key from tags
      const groupKey = rule.groupBy.length > 0
        ? rule.groupBy.map(t => tags[t] || "*").join(",") : "__all__";
      const stateKey = ruleId + ":" + groupKey;

      // Add value to sliding window buffer
      if (!this.windowBuffers.has(stateKey)) {
        this.windowBuffers.set(stateKey, []);
      }
      const buffer = this.windowBuffers.get(stateKey);
      buffer.push({ t: timestamp, v: value });

      // Trim buffer to window size
      const windowStart = timestamp - rule.windowMs;
      while (buffer.length > 0 && buffer[0].t < windowStart) buffer.shift();

      // Compute aggregate over window
      const values = buffer.map(p => p.v);
      if (values.length === 0) continue;

      const aggValue = this.computeAggregate(values, rule.condition.agg);
      const triggered = this.checkThreshold(aggValue, rule.condition.operator,
        rule.condition.threshold);

      // Update state with consecutive window logic
      if (!this.states.has(stateKey)) {
        this.states.set(stateKey, {
          state: "OK", consecutiveCount: 0, lastEvaluated: 0,
          lastTriggered: 0, lastValue: 0
        });
      }
      const state = this.states.get(stateKey);
      state.lastEvaluated = timestamp;
      state.lastValue = aggValue;

      if (triggered) {
        state.consecutiveCount++;
        if (state.consecutiveCount >= rule.consecutiveWindows && state.state !== "ALERT") {
          state.state = "ALERT";
          state.lastTriggered = timestamp;
          this.fireAlert(rule, groupKey, tags, aggValue, state);
        }
      } else {
        if (state.state === "ALERT") {
          state.state = "RESOLVED";
          this.fireResolution(rule, groupKey, tags, aggValue);
        }
        state.consecutiveCount = 0;
      }
    }
  }

  computeAggregate(values, agg) {
    switch (agg) {
      case "avg": return values.reduce((a, b) => a + b, 0) / values.length;
      case "max": return Math.max(...values);
      case "min": return Math.min(...values);
      case "sum": return values.reduce((a, b) => a + b, 0);
      case "count": return values.length;
      case "p95": {
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.95)] || 0;
      }
      case "p99": {
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.99)] || 0;
      }
      default: return values.reduce((a, b) => a + b, 0) / values.length;
    }
  }

  checkThreshold(value, operator, threshold) {
    switch (operator) {
      case ">": return value > threshold;
      case ">=": return value >= threshold;
      case "<": return value < threshold;
      case "<=": return value <= threshold;
      case "==": return Math.abs(value - threshold) < 0.001;
      default: return false;
    }
  }

  fireAlert(rule, groupKey, tags, value, state) {
    const alert = {
      type: "ALERT", ruleId: rule.id, metric: rule.metric,
      groupKey, tags, currentValue: Math.round(value * 100) / 100,
      threshold: rule.condition.threshold,
      condition: rule.condition.agg + " " + rule.condition.operator + " " + rule.condition.threshold,
      consecutiveWindows: state.consecutiveCount,
      channels: rule.notifyChannels, timestamp: Date.now()
    };
    this.notifications.push(alert);
    return alert;
  }

  fireResolution(rule, groupKey, tags, value) {
    const resolution = {
      type: "RESOLVED", ruleId: rule.id, metric: rule.metric,
      groupKey, tags, currentValue: Math.round(value * 100) / 100,
      channels: rule.notifyChannels, timestamp: Date.now()
    };
    this.notifications.push(resolution);
    return resolution;
  }

  getAlertStates() {
    const result = [];
    for (const [key, state] of this.states) {
      result.push({ key, ...state });
    }
    return result;
  }
}

// --- Metric Ingestion Pipeline with Batching ---
class IngestionPipeline {
  constructor(store, alertEvaluator, batchSize = 1000, flushIntervalMs = 1000) {
    this.store = store;
    this.alertEvaluator = alertEvaluator;
    this.buffer = [];
    this.batchSize = batchSize;
    this.flushIntervalMs = flushIntervalMs;
    this.stats = { received: 0, flushed: 0, errors: 0 };
    this.flushTimer = null;
  }

  receive(metric, tags, timestamp, value) {
    this.buffer.push({ metric, tags, timestamp, value });
    this.stats.received++;
    // Evaluate alerts in real-time (fast path)
    if (this.alertEvaluator) {
      this.alertEvaluator.evaluate(metric, tags, timestamp, value);
    }
    if (this.buffer.length >= this.batchSize) this.flush();
  }

  flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.batchSize);
    // Group by metric+tags for efficient batch insert
    const groups = new Map();
    for (const dp of batch) {
      const key = dp.metric + "|" + JSON.stringify(dp.tags);
      if (!groups.has(key)) {
        groups.set(key, { metric: dp.metric, tags: dp.tags, points: [] });
      }
      groups.get(key).points.push([dp.timestamp, dp.value]);
    }
    for (const [, group] of groups) {
      try {
        this.store.ingest(group.metric, group.tags, group.points);
        this.stats.flushed += group.points.length;
      } catch (err) {
        this.stats.errors += group.points.length;
      }
    }
  }

  getStats() { return { ...this.stats, bufferSize: this.buffer.length }; }
}

// --- Demo ---
// Simulated store (simplified)
const simStore = {
  data: [],
  ingest(metric, tags, points) {
    this.data.push({ metric, tags, points });
  }
};

const evaluator = new AlertEvaluator();
evaluator.addRule({
  id: "high-cpu", metric: "cpu.usage", condition: "avg > 80",
  windowMinutes: 1, consecutive: 3, groupBy: ["host"],
  notify: ["pagerduty://infra-team", "slack://#alerts"]
});
evaluator.addRule({
  id: "low-throughput", metric: "http.requests", condition: "sum < 100",
  windowMinutes: 5, consecutive: 2, groupBy: ["service"],
  notify: ["slack://#alerts"]
});

const pipeline = new IngestionPipeline(simStore, evaluator, 100);
const now2 = Date.now();

// Simulate high CPU
for (let i = 0; i < 200; i++) {
  const ts = now2 - (200 - i) * 1000;
  pipeline.receive("cpu.usage", { host: "web-01", region: "us-east" },
    ts, 85 + Math.random() * 10);
}
pipeline.flush();

console.log("Pipeline stats:", pipeline.getStats());
console.log("Alert states:", evaluator.getAlertStates());
console.log("Notifications:", evaluator.notifications.length,
  evaluator.notifications.map(n => n.type + " - " + n.ruleId + " (" + n.groupKey + ")"));`,

    explanation: `SCALING ANALYSIS:

1. INGESTION PATH SCALING:
   - Agents batch metrics locally (10-second windows) and compress before sending
   - Intake endpoints are stateless HTTP servers behind a load balancer (scale horizontally)
   - Kafka absorbs ingestion spikes: 5M points/sec sustained, buffers up to 15M/sec peaks
   - 100 Kafka partitions allow 100 parallel TSDB writer processes
   - Each TSDB writer handles 50K points/sec, writing to its assigned shard
   - Backpressure: if writers fall behind, Kafka consumer lag grows (alert on lag > 30 seconds)

2. TSDB STORAGE OPTIMIZATION:
   - Gorilla compression: consecutive timestamps stored as delta-of-delta (typically 0 = 1 bit). Consecutive values stored as XOR (similar values = few bits). Achieves 12x compression: 24 bytes/point -> ~2 bytes/point.
   - Data is organized in 2-hour chunks per series. Each chunk is a compressed block.
   - In-memory write buffer (memtable) for the current 2-hour chunk; flushed to disk on rotation
   - Inverted index maps tag combinations to series IDs for efficient filtered queries
   - Sharding by consistent hash of series_id across 20-50 TSDB nodes

3. QUERY PATH OPTIMIZATION:
   - Query engine uses scatter-gather: send sub-queries to relevant TSDB shards, merge results
   - Resolution auto-selection: 1-hour queries use raw data, 7-day queries use minute rollups, 30-day+ uses hour rollups
   - Pre-computed tag index makes tag filtering O(1) instead of scanning all series
   - Dashboard queries are heavily cacheable: cache query results with 10-second TTL for real-time dashboards
   - High-cardinality queries (GROUP BY across 50K unique values) are expensive; limit result set size

4. ALERT EVALUATION:
   - Real-time path: alert evaluator consumes from Kafka directly (not from storage) for <30-second latency
   - Each alert rule maintains a sliding window buffer per group key
   - Consecutive window logic: alert fires only after N consecutive windows breach threshold (reduces false positives)
   - Alert state machine: OK -> PENDING (first breach) -> ALERT (consecutive breaches) -> RESOLVED (below threshold)
   - Notification deduplication: don't send same alert repeatedly; snooze for configurable period after first notification

5. CARDINALITY MANAGEMENT (Critical Challenge):
   - Cardinality = number of unique time series = metric_name x unique_tag_combinations
   - 50M series is manageable; 500M+ series causes storage and query performance issues
   - Anti-pattern: using high-cardinality tags (user_id, request_id, trace_id) creates cardinality explosion
   - Mitigation: cardinality limiter at ingestion (reject new series beyond per-metric threshold)
   - Monitoring: track cardinality per metric; alert when a single metric exceeds 100K series

6. ROLLUP / DOWNSAMPLING:
   - Background job reads raw data about to expire and writes minute-level aggregates
   - For each series, each minute: compute avg, min, max, sum, count
   - Storing all 5 aggregates (not just avg) enables accurate re-aggregation at query time
   - Example: average of averages is wrong for unequal counts; average of sums/counts is correct
   - Rollup job must keep up with data production rate; if it falls behind, raw data may be deleted before rollup

7. FAILURE MODES:
   - AGENT FAILURE: Metrics stop arriving; detected by "no data" alert condition within 2 minutes
   - KAFKA BROKER FAILURE: 3x replication ensures no data loss; other brokers take over partitions
   - TSDB WRITER FAILURE: Consumer rebalance assigns partitions to other writers; brief ingestion delay
   - QUERY NODE FAILURE: Load balancer routes to other query nodes; scatter-gather retries failed sub-queries
   - ALERT EVALUATOR FAILURE: Stateless; restart and re-read from Kafka offset. May miss a window during restart.

8. MONITORING THE MONITORING (Meta-monitoring):
   - Track ingestion lag (Kafka consumer group lag)
   - Monitor query latency p50/p95/p99
   - Alert evaluator evaluation latency (target: <5 seconds per rule)
   - TSDB disk usage and compaction rates
   - Cardinality growth rate per metric`,

    timeComplexity: `Ingestion per data point: O(1) amortized (hash lookup for series_id, append to buffer).
Batch flush: O(B) where B = batch size (1000 typically).
Tag-based query (with inverted index): O(S + P) where S = matching series count, P = total points in time range.
Aggregation: O(P) for single series, O(S * P) for multi-series with GROUP BY.
Rollup computation: O(P) per series per rollup window.
Alert evaluation per data point: O(R * W) where R = matching rules, W = window buffer size.
Gorilla compression: O(1) per point (delta-of-delta and XOR are constant time).
Full dashboard query (10 panels, 1-hour range): typically <500ms with caching.`,

    spaceComplexity: `High-resolution storage (15 days): 5M points/sec * 2 bytes * 15 * 86400 = 12.96 TB compressed.
Minute rollups (90 days): 12.96 TB / 60 * 6 = 1.3 TB.
Hour rollups (365 days): 12.96 TB / 3600 * 24.3 = 88 GB.
Total active TSDB storage: ~14.4 TB across cluster (sharded to ~500 GB per node with 30 nodes).
Series index (inverted index): 50M series * 200 bytes = 10 GB.
Kafka retention (24 hours): 5M points * 50 bytes * 86400 = 21.6 TB (with 3x replication: 65 TB).
Alert evaluator state: 10,000 rules * 1000 group keys * 1 KB window buffer = 10 GB.
Agent memory per host: 50 MB (metric buffers + local cache).
Query result cache: 10 GB (covers most active dashboard queries with 10-second TTL).`,

    hints: [
      `Use Gorilla compression (from Facebook's Gorilla TSDB paper) for time-series storage. It exploits the fact that consecutive timestamps have predictable intervals (delta-of-delta is usually 0) and consecutive values are numerically similar (XOR has few set bits). This achieves 12x compression, making it feasible to keep 15 days of high-resolution data in a reasonable storage budget.`,
      `Decouple ingestion from querying using Kafka as an intermediate buffer. The ingestion path writes to Kafka and is never blocked by slow queries. TSDB writers consume from Kafka at their own pace. This prevents query-induced backpressure from causing data loss. Alert evaluators also consume from Kafka for the real-time path, bypassing TSDB entirely for low-latency alerting.`,
      `Implement multi-resolution storage with automatic rollup. Store raw data (1-second) for 15 days, minute aggregates for 90 days, hour aggregates for 1+ year. The rollup job must store avg, min, max, sum, AND count (not just avg) because average-of-averages is mathematically incorrect when groups have unequal counts. Queries automatically select the appropriate resolution based on the requested time range.`,
      `Design the alert evaluator with a consecutive-window requirement to reduce false positives. A "CPU > 90% for 5 minutes, 3 consecutive windows" rule means the CPU must breach the threshold for three consecutive 5-minute evaluation windows before alerting. A single brief spike does not trigger an alert. This dramatically reduces alert noise while still catching genuine sustained issues.`,
      `Guard against cardinality explosion by limiting the number of unique series per metric at the ingestion layer. A single metric like http.latency with tags for user_id (100M users) and endpoint (1000) would create 100 billion series - unstorable and unqueryable. Enforce a per-metric cardinality limit (e.g., 100K unique tag combinations) and reject new series beyond the limit with a clear error message.`,
      `Implement tag-based inverted indexing for efficient query filtering. Store a mapping from each tag key-value pair to the set of series IDs that have that tag. A query like "cpu.usage WHERE region=us-east AND service=api" intersects the series sets for both tag filters, yielding only the matching series. Without an inverted index, every query would scan all series for the metric.`,
      `Batch data points at every layer: agents batch locally (10-second windows), intake batches into Kafka (with linger.ms=5ms for latency-throughput trade-off), TSDB writers batch Kafka messages into bulk inserts. Batching amortizes per-operation overhead (network round-trips, disk seeks, index updates) across thousands of data points, which is essential at millions of points per second.`,
      `Build the alert evaluator as a stateless consumer that reads from Kafka. Each evaluator instance handles a shard of alert rules (partitioned by metric name hash). On failure, Kafka consumer rebalance assigns the shard to another instance. The only state is the sliding window buffer, which can be rebuilt by re-reading the last N minutes from Kafka. This makes the alerting layer horizontally scalable and fault-tolerant.`
    ]
  }
];
