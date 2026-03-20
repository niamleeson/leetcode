import { ProblemSolution } from './types';

export const solutionsM1: ProblemSolution[] = [
  {
    id: 9001,
    description: `Design a URL Shortener (TinyURL)

FUNCTIONAL REQUIREMENTS:
- Shorten a long URL to a unique 7-character base62 code (e.g., https://tiny.url/aB3x9Kz)
- Redirect short URLs to the original destination with minimal latency (<50ms p99)
- Support custom aliases (user-chosen short codes)
- Support link expiration (TTL-based, default 5 years)
- Analytics dashboard: click count, referrers, geographic distribution, device breakdown
- API access for programmatic URL creation and stats retrieval

NON-FUNCTIONAL REQUIREMENTS:
- High availability (99.99% uptime)
- Low latency redirects (<10ms for cache hits, <50ms for cache misses)
- Eventual consistency acceptable (analytics can lag by seconds)
- Short codes must be unpredictable (no sequential enumeration)
- System must handle 100M+ stored URLs

CAPACITY ESTIMATION:
- Write QPS: 100M new URLs/month = ~40 URLs/sec (average), ~400/sec (peak)
- Read QPS: 10:1 read-to-write ratio = 400 reads/sec (average), 4,000/sec (peak)
- Storage per URL: short_code(7B) + long_url(avg 200B) + metadata(100B) = ~307B per record
- Storage for 5 years: 100M/month * 60 months * 307B = ~1.84 TB
- Cache: 20% of URLs drive 80% of traffic. Cache top 20% of daily reads: 400 reads/sec * 86400 * 0.2 * 307B = ~2.1 GB (fits in single Redis instance)
- Bandwidth: 400 reads/sec * 307B = ~120 KB/s outbound (negligible)
- Base62 with 7 chars: 62^7 = 3.5 trillion possible codes (far exceeds 100M URLs)

DATABASE SCHEMA:
\\\`\\\`\\\`
urls_table:
  short_code  VARCHAR(7)   PRIMARY KEY
  long_url    TEXT         NOT NULL
  user_id     BIGINT       INDEX
  created_at  TIMESTAMP    DEFAULT NOW()
  expires_at  TIMESTAMP    INDEX (for TTL cleanup)
  custom      BOOLEAN      DEFAULT FALSE

analytics_table:
  id          BIGINT       AUTO_INCREMENT PRIMARY KEY
  short_code  VARCHAR(7)   INDEX
  timestamp   TIMESTAMP
  referrer    VARCHAR(255)
  user_agent  VARCHAR(255)
  ip_address  VARCHAR(45)
  country     VARCHAR(2)
\\\`\\\`\\\`

API ENDPOINTS:
- POST /api/v1/urls { long_url, custom_alias?, expires_in? } => { short_url, short_code }
- GET /:short_code => 302 Redirect to long_url
- GET /api/v1/urls/:short_code/stats => { clicks, referrers, countries, ... }
- DELETE /api/v1/urls/:short_code => 204 No Content`,

    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Step 1 - Traffic Estimation:
  New URLs created: 100M per month
  Write QPS = 100M / (30 days * 24 hours * 3600 sec) = ~38.6 writes/sec
  Peak write QPS (10x burst): ~400 writes/sec
  Read-to-write ratio: 10:1
  Read QPS = 38.6 * 10 = ~386 reads/sec
  Peak read QPS: ~4,000 reads/sec

Step 2 - Storage Estimation:
  Each URL record: 7 (code) + 200 (avg URL) + 8 (user_id) + 8 (created_at) + 8 (expires_at) + 1 (custom flag) + overhead = ~300 bytes
  Monthly storage: 100M * 300B = 30 GB/month
  5-year storage: 30 GB * 60 = 1.8 TB total
  With replication factor 3: 5.4 TB across the cluster

Step 3 - Cache Estimation:
  Following the 80-20 rule, 20% of URLs generate 80% of traffic
  Daily read requests: 386 * 86400 = ~33.4M reads/day
  Cache 20% of daily unique URLs: 33.4M * 0.2 = 6.68M entries
  Cache memory: 6.68M * 300B = ~2 GB (single Redis instance handles this easily)
  Expected cache hit ratio: 85-95%

Step 4 - Bandwidth Estimation:
  Incoming (write): 400 writes/sec * 300B = 120 KB/s
  Outgoing (read/redirect): 4000 reads/sec * 300B = 1.2 MB/s
  Negligible bandwidth - not a bottleneck

API DESIGN EXAMPLE:

// Create short URL
POST /api/v1/urls
Request:
{
  "long_url": "https://example.com/very/long/path?param=value",
  "custom_alias": "my-link",   // optional
  "expires_in": 86400          // optional, seconds
}
Response (201 Created):
{
  "short_code": "my-link",
  "short_url": "https://tiny.url/my-link",
  "long_url": "https://example.com/very/long/path?param=value",
  "expires_at": "2026-03-21T12:00:00Z",
  "created_at": "2026-03-20T12:00:00Z"
}

// Redirect
GET /aB3x9Kz
Response: 302 Found
Location: https://example.com/very/long/path?param=value

// Get Analytics
GET /api/v1/urls/aB3x9Kz/stats?range=7d
Response (200):
{
  "short_code": "aB3x9Kz",
  "total_clicks": 15234,
  "unique_visitors": 8921,
  "clicks_by_day": [{"date": "2026-03-14", "count": 2100}, ...],
  "top_referrers": [{"source": "twitter.com", "count": 5000}, ...],
  "countries": [{"code": "US", "count": 7000}, {"code": "GB", "count": 3000}]
}`,

    intuition: `A URL shortener is fundamentally a distributed bijective function: it maps long URLs to short codes and back. Think of it as a massive lookup table with two core operations - INSERT and LOOKUP - that must be extremely fast and globally unique.

THE KEY INSIGHT: The entire problem reduces to two challenges:
1. How do you generate a globally unique 7-character code without coordination between servers?
2. How do you look up the original URL from that code in under 10ms?

WHY BASE62? With 7 characters from [a-zA-Z0-9] (62 chars), you get 62^7 = 3.52 trillion unique codes. Even at 100M URLs/month for 100 years, you would only use 120 billion codes - less than 4% of the keyspace. This gives enormous headroom and makes collision probability negligible.

THE ID GENERATION DILEMMA: There are three main approaches, each with trade-offs:

1. AUTO-INCREMENT + BASE62: Simple, guaranteed unique, but sequential (predictable). A counter service (like Twitter Snowflake) generates IDs, and you encode them to base62. The downside: if someone gets code "aB3x9K0", they can guess that "aB3x9K1" exists. Solution: use a random offset or shuffle.

2. PRE-GENERATED KEY SERVICE (KGS): Generate millions of random 7-char codes offline, store in a database with "used/unused" status. When a server needs a code, it grabs a batch (say 1000) from the unused pool. Advantages: no real-time coordination, no collision risk, codes are random. Disadvantage: requires managing the key pool, and if a server crashes after taking keys but before using them, those keys are "wasted" (acceptable given 3.5T keyspace).

3. HASH + COLLISION CHECK: MD5/SHA256 the long URL, take first 7 base62 chars. Check for collision, if found, append a counter and re-hash. Simple but requires a collision check on every write, which is a database round-trip.

The KGS approach is the industry best practice because it separates the uniqueness problem from the serving path, making the write path a simple key-value insert with no coordination.

ANALOGY: Think of it like a coat check at a fancy restaurant. The KGS is like pre-printing numbered tickets. When a guest arrives (new URL), you hand them the next ticket (pre-generated code) and hang their coat (store the mapping). When they return (redirect request), you look up their ticket number and return their coat. The ticket numbers are random so one guest cannot guess another guest's number.

WHY 302 NOT 301? This is a subtle but critical decision:
- 301 (Permanent Redirect): Browser caches the redirect and never hits your server again. Great for reducing load, but you lose ALL analytics for repeat visits.
- 302 (Temporary Redirect): Browser always hits your server first. Slightly more load, but you get complete analytics data.
- Most URL shorteners use 302 because analytics is a key feature. If analytics are not needed, 301 reduces server load by 80%+.

THE CACHING STRATEGY: URL access follows a power-law distribution - a tiny fraction of URLs get the vast majority of traffic. A single Redis node with 2GB can cache the hottest URLs and serve 85-95% of read requests without touching the database. This is why the system can handle 4000+ reads/sec with just a few servers.`,

    approach: `COMPLETE ARCHITECTURE:

HIGH-LEVEL COMPONENTS:
1. Load Balancer (Nginx/AWS ALB) - distributes traffic across API servers
2. API Servers (stateless, horizontally scalable) - handle create/redirect/stats
3. Key Generation Service (KGS) - pre-generates unique short codes
4. Cache Layer (Redis Cluster) - caches hot URL mappings
5. Primary Database (DynamoDB or Cassandra) - stores all URL mappings
6. Analytics Pipeline (Kafka + ClickHouse) - processes click events asynchronously
7. CDN (CloudFront) - caches redirects at the edge for geographic performance

WRITE PATH (Creating a Short URL):
1. Client sends POST /api/v1/urls with long_url
2. Load balancer routes to an API server
3. API server validates the URL (format check, DNS resolution, blocklist check)
4. If custom alias requested: check database for uniqueness, reject if taken
5. If no custom alias: API server takes next code from its local batch (pre-fetched from KGS)
6. API server writes {short_code -> long_url} to the database
7. API server writes to Redis cache (write-through)
8. Returns the short URL to the client

READ PATH (Redirecting):
1. Client browser requests GET /aB3x9Kz
2. CDN checks edge cache - if hit, return 302 immediately (p99 < 5ms)
3. If CDN miss: load balancer routes to an API server
4. API server checks Redis cache - if hit, return 302 (p99 < 10ms)
5. If cache miss: query database for the long_url (p99 < 50ms)
6. Populate Redis cache with the result (cache-aside pattern)
7. Check if URL is expired - if so, return 404
8. Asynchronously publish click event to Kafka for analytics
9. Return 302 redirect with Location header

KEY GENERATION SERVICE (KGS):
- Background workers continuously generate random 7-char base62 codes
- Store in a database table: keys_pool (key VARCHAR(7) PRIMARY KEY, status ENUM('available','allocated','used'))
- API servers request batches of 1000 keys at a time
- KGS marks them as 'allocated' atomically (SELECT FOR UPDATE or optimistic locking)
- Each API server has a local in-memory buffer of ~1000 unused keys
- If an API server crashes, those allocated keys are simply lost (acceptable with 3.5T keyspace)
- KGS runs as multiple replicas for availability

DATABASE DESIGN:
- Primary store: DynamoDB (or Cassandra) for its key-value access pattern
- Partition key: short_code (perfect for even distribution since codes are random)
- DynamoDB handles 4000 reads/sec easily with on-demand capacity
- Enable TTL on expires_at column for automatic cleanup of expired URLs
- Secondary index on user_id for "my URLs" dashboard queries

CACHING STRATEGY:
- Cache-aside pattern: check cache first, on miss read from DB and populate cache
- Write-through on create: write to cache when creating a new URL
- Redis TTL matches URL expiration (or 24h for non-expiring URLs, re-cache on next access)
- Eviction policy: allkeys-lru (evict least recently used keys when memory is full)
- Single Redis node with 2GB handles 85-95% of reads

ANALYTICS PIPELINE:
1. On each redirect, API server publishes a click event to Kafka topic "url_clicks"
2. Event contains: short_code, timestamp, IP, user_agent, referrer
3. Stream processor (Flink or Kafka Streams) enriches events with geo-IP data
4. Enriched events are written to ClickHouse (columnar DB optimized for analytics)
5. Analytics API queries ClickHouse for dashboards and stats endpoints
6. Pre-aggregate hourly/daily counts in materialized views for fast dashboard loading

CLEANUP SERVICE:
- Background job runs every hour
- Queries for URLs where expires_at < NOW()
- Deletes from database and invalidates cache
- Alternatively, use DynamoDB TTL for automatic deletion`,

    code: `// =============================================
// URL Shortener - Core Components Implementation
// =============================================

// --- Base62 Encoder/Decoder ---
class Base62 {
  constructor() {
    this.chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.base = 62;
    this.charToIndex = {};
    for (let i = 0; i < this.chars.length; i++) {
      this.charToIndex[this.chars[i]] = i;
    }
  }

  encode(num) {
    if (num === 0) return this.chars[0].padStart(7, this.chars[0]);
    let result = "";
    let n = num;
    while (n > 0) {
      result = this.chars[n % this.base] + result;
      n = Math.floor(n / this.base);
    }
    return result.padStart(7, this.chars[0]);
  }

  decode(str) {
    let result = 0;
    for (const ch of str) {
      result = result * this.base + this.charToIndex[ch];
    }
    return result;
  }
}

// --- Consistent Hashing Ring for Cache Distribution ---
const crypto = require("crypto");

class ConsistentHashRing {
  constructor(virtualNodesPerServer = 150) {
    this.virtualNodesPerServer = virtualNodesPerServer;
    this.ring = new Map();
    this.sortedKeys = [];
    this.servers = new Set();
  }

  _hash(key) {
    return parseInt(
      crypto.createHash("md5").update(key).digest("hex").substring(0, 8),
      16
    );
  }

  addServer(server) {
    this.servers.add(server);
    for (let i = 0; i < this.virtualNodesPerServer; i++) {
      const virtualKey = server + "#vn" + i;
      const hash = this._hash(virtualKey);
      this.ring.set(hash, server);
      this.sortedKeys.push(hash);
    }
    this.sortedKeys.sort((a, b) => a - b);
  }

  removeServer(server) {
    this.servers.delete(server);
    const newSorted = [];
    for (const hash of this.sortedKeys) {
      if (this.ring.get(hash) === server) {
        this.ring.delete(hash);
      } else {
        newSorted.push(hash);
      }
    }
    this.sortedKeys = newSorted;
  }

  getServer(key) {
    if (this.sortedKeys.length === 0) return null;
    const hash = this._hash(key);
    let lo = 0, hi = this.sortedKeys.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.sortedKeys[mid] < hash) lo = mid + 1;
      else hi = mid;
    }
    const idx = this.sortedKeys[lo] >= hash ? lo : 0;
    return this.ring.get(this.sortedKeys[idx]);
  }
}

// --- URL Shortener Service ---
class URLShortenerService {
  constructor() {
    this.base62 = new Base62();
    this.cacheRing = new ConsistentHashRing(150);
    this.urlStore = new Map();
    this.cacheStore = new Map();
    this.keyPool = [];
    this.analytics = new Map();
    this._prefillKeyPool(5000);
  }

  _prefillKeyPool(count) {
    const used = new Set(this.urlStore.keys());
    while (this.keyPool.length < count) {
      const randNum = Math.floor(Math.random() * 3.5e12);
      const code = this.base62.encode(randNum);
      if (!used.has(code) && !this.keyPool.includes(code)) {
        this.keyPool.push(code);
      }
    }
  }

  createShortURL(longURL, customAlias = null, ttlSeconds = 157680000) {
    if (customAlias) {
      if (this.urlStore.has(customAlias)) {
        throw new Error("Custom alias already taken");
      }
      const code = customAlias;
      this._storeURL(code, longURL, ttlSeconds);
      return code;
    }
    if (this.keyPool.length < 100) this._prefillKeyPool(5000);
    const code = this.keyPool.pop();
    this._storeURL(code, longURL, ttlSeconds);
    return code;
  }

  _storeURL(code, longURL, ttlSeconds) {
    const record = {
      longURL,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
      clicks: 0,
    };
    this.urlStore.set(code, record);
    this.cacheStore.set(code, record);
  }

  redirect(shortCode) {
    let record = this.cacheStore.get(shortCode);
    if (!record) {
      record = this.urlStore.get(shortCode);
      if (record) this.cacheStore.set(shortCode, record);
    }
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      this.urlStore.delete(shortCode);
      this.cacheStore.delete(shortCode);
      return null;
    }
    record.clicks++;
    this._recordAnalytics(shortCode);
    return record.longURL;
  }

  _recordAnalytics(code) {
    if (!this.analytics.has(code)) this.analytics.set(code, []);
    this.analytics.get(code).push({ timestamp: Date.now(), referrer: "direct" });
  }

  getStats(shortCode) {
    const record = this.urlStore.get(shortCode);
    if (!record) return null;
    const events = this.analytics.get(shortCode) || [];
    const now = Date.now();
    const last24h = events.filter((e) => now - e.timestamp < 86400000).length;
    return {
      shortCode,
      longURL: record.longURL,
      totalClicks: record.clicks,
      clicksLast24h: last24h,
      createdAt: new Date(record.createdAt).toISOString(),
      expiresAt: new Date(record.expiresAt).toISOString(),
    };
  }
}

// --- Demo ---
const service = new URLShortenerService();
const code1 = service.createShortURL("https://example.com/very/long/path");
const code2 = service.createShortURL("https://another.com/page", "my-link");
console.log("Generated:", code1, "Custom:", code2);
console.log("Redirect:", service.redirect(code1));
console.log("Redirect custom:", service.redirect("my-link"));
service.redirect(code1);
service.redirect(code1);
console.log("Stats:", service.getStats(code1));`,

    jsCode: `// =============================================
// URL Shortener - LRU Cache & Analytics Pipeline
// =============================================

// --- LRU Cache for Hot URL Lookups ---
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, val: null, prev: null, next: null };
    this.tail = { key: null, val: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return null;
    const node = this.map.get(key);
    this._remove(node);
    this._addToFront(node);
    return node.val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.val = value;
      this._remove(node);
      this._addToFront(node);
    } else {
      if (this.map.size >= this.capacity) {
        const evicted = this.tail.prev;
        this._remove(evicted);
        this.map.delete(evicted.key);
      }
      const node = { key, val: value, prev: null, next: null };
      this._addToFront(node);
      this.map.set(key, node);
    }
  }
}

// --- Analytics Aggregator (simulates Kafka consumer + ClickHouse writer) ---
class AnalyticsPipeline {
  constructor() {
    this.eventBuffer = [];
    this.hourlyAggregates = new Map();
    this.geoAggregates = new Map();
    this.flushInterval = null;
  }

  ingestClickEvent(event) {
    this.eventBuffer.push({
      shortCode: event.shortCode,
      timestamp: event.timestamp || Date.now(),
      ip: event.ip || "0.0.0.0",
      userAgent: event.userAgent || "unknown",
      referrer: event.referrer || "direct",
      country: event.country || "US",
    });
    if (this.eventBuffer.length >= 100) this.flush();
  }

  flush() {
    const batch = this.eventBuffer.splice(0, this.eventBuffer.length);
    for (const event of batch) {
      const hourKey = event.shortCode + ":" +
        new Date(event.timestamp).toISOString().substring(0, 13);
      this.hourlyAggregates.set(
        hourKey,
        (this.hourlyAggregates.get(hourKey) || 0) + 1
      );
      const geoKey = event.shortCode + ":" + event.country;
      this.geoAggregates.set(
        geoKey,
        (this.geoAggregates.get(geoKey) || 0) + 1
      );
    }
  }

  getHourlyStats(shortCode, hours = 24) {
    this.flush();
    const now = new Date();
    const stats = [];
    for (let i = 0; i < hours; i++) {
      const d = new Date(now.getTime() - i * 3600000);
      const hourKey = shortCode + ":" + d.toISOString().substring(0, 13);
      stats.push({
        hour: d.toISOString().substring(0, 13),
        clicks: this.hourlyAggregates.get(hourKey) || 0,
      });
    }
    return stats;
  }

  getGeoStats(shortCode) {
    this.flush();
    const results = [];
    for (const [key, count] of this.geoAggregates) {
      if (key.startsWith(shortCode + ":")) {
        results.push({ country: key.split(":")[1], clicks: count });
      }
    }
    return results.sort((a, b) => b.clicks - a.clicks);
  }
}

// --- URL Redirect Handler with Cache + Analytics Integration ---
class RedirectHandler {
  constructor(dbStore, cacheCapacity = 10000) {
    this.db = dbStore;
    this.cache = new LRUCache(cacheCapacity);
    this.analytics = new AnalyticsPipeline();
  }

  handleRedirect(shortCode, requestMeta = {}) {
    let record = this.cache.get(shortCode);
    if (!record) {
      record = this.db.get(shortCode);
      if (!record) return { status: 404, body: "Not Found" };
      this.cache.put(shortCode, record);
    }
    if (record.expiresAt && Date.now() > record.expiresAt) {
      this.db.delete(shortCode);
      return { status: 410, body: "Gone - URL has expired" };
    }
    this.analytics.ingestClickEvent({
      shortCode,
      ip: requestMeta.ip,
      userAgent: requestMeta.userAgent,
      referrer: requestMeta.referrer,
      country: requestMeta.country,
    });
    return { status: 302, headers: { Location: record.longURL } };
  }
}

// --- Demo ---
const db = new Map();
db.set("aB3x9Kz", {
  longURL: "https://example.com/article/12345",
  expiresAt: Date.now() + 86400000 * 365,
});
const handler = new RedirectHandler(db);
console.log(handler.handleRedirect("aB3x9Kz", { ip: "1.2.3.4", country: "US" }));
console.log(handler.handleRedirect("aB3x9Kz", { ip: "5.6.7.8", country: "GB" }));
console.log(handler.handleRedirect("notfound"));
console.log("Geo stats:", handler.analytics.getGeoStats("aB3x9Kz"));`,

    explanation: `SCALING ANALYSIS:

HORIZONTAL SCALING:
- API servers are stateless - add more behind the load balancer as QPS grows
- Each server holds a local batch of pre-generated keys from KGS (no coordination needed)
- Database is partitioned by short_code hash - random codes ensure even distribution
- Redis cache can be sharded using consistent hashing across multiple nodes
- CDN handles geographic distribution of redirect traffic

BOTTLENECK IDENTIFICATION:
1. KGS is a potential bottleneck: if it goes down, servers run out of keys
   Mitigation: Each server holds 1000+ keys locally; KGS runs as multiple replicas
2. Database writes during peak: 400 writes/sec is low for DynamoDB/Cassandra
   Not a real bottleneck at this scale, but shard if needed
3. Hot URLs: A viral link could get millions of hits/sec
   Mitigation: Multi-tier caching (CDN edge + Redis + local), consistent hashing prevents single-node overload
4. Analytics pipeline: High-volume click events could overwhelm the analytics DB
   Mitigation: Kafka buffers events, batch writes to ClickHouse, pre-aggregate counters

FAILURE MODES:
1. API server crash: Load balancer detects via health check (5s), routes to healthy servers. Pre-allocated keys on crashed server are lost (negligible).
2. Redis failure: Cache miss, all reads go to database. Auto-failover to Redis replica in <30s. Database can handle the temporary load increase at this scale.
3. Database failure: Use multi-AZ replication. Failover to replica in <60s. During outage, writes fail but reads served from cache still work.
4. KGS failure: Servers continue using their local key batch. If batch runs out, fall back to random generation with collision check.

MONITORING STRATEGY:
- Cache hit ratio: Alert if drops below 80% (indicates cache sizing issue or access pattern change)
- Redirect latency p50/p95/p99: Alert if p99 > 100ms
- KGS key pool size: Alert if available keys drop below 1M
- Database read/write latency: Alert if p99 > 50ms
- Error rate: Alert if 5xx rate > 0.1%
- Expired URL cleanup lag: Alert if backlog exceeds 1M expired URLs

TRADE-OFFS:
1. SEQUENTIAL vs RANDOM CODES:
   Sequential: Simple, no collisions, but predictable (users can enumerate URLs).
   Random: Unpredictable but needs collision handling or pre-generation.
   Decision: Use KGS with random pre-generated codes for security.

2. 301 vs 302 REDIRECT:
   301 (Permanent): Browser caches redirect, reduces server load by 80%+, but no analytics.
   302 (Temporary): Every click hits server, full analytics, but more load.
   Decision: Default to 302 for analytics. Allow 301 via API flag for users who do not need tracking.

3. SQL vs NoSQL:
   SQL: ACID transactions, easy joins for analytics, but harder to scale horizontally.
   NoSQL (DynamoDB): Simple key-value lookup is the perfect access pattern, auto-scaling, but no joins.
   Decision: NoSQL for URL storage (key-value is the exact access pattern), columnar DB (ClickHouse) for analytics.

4. CACHE INVALIDATION:
   Write-through: Update cache on every write. Simple but cache may hold rarely-accessed URLs.
   Cache-aside with TTL: Cache on read miss, expire after TTL. Slightly stale but memory-efficient.
   Decision: Write-through for new URLs (they are often accessed immediately after creation), cache-aside for redirects with 24h TTL.

5. CUSTOM ALIAS HANDLING:
   Allow any string: Maximum flexibility, but risk of offensive words and namespace exhaustion.
   Restricted charset + length: Safer namespace management.
   Decision: Allow alphanumeric + hyphens, 3-30 chars, run against blocklist of offensive terms.`,

    timeComplexity: `PERFORMANCE CHARACTERISTICS:
- Write (create short URL): ~5ms (fetch from local key pool + single DB write)
- Read (redirect, cache hit): ~2ms (Redis lookup + async analytics publish)
- Read (redirect, cache miss): ~20ms (DB read + cache populate + async analytics)
- Read (redirect, CDN hit): <5ms (served from edge, no origin contact)
- Analytics query: ~100-500ms (ClickHouse aggregation over columnar data)
- KGS batch fetch: ~50ms per 1000 keys (infrequent, amortized over 1000 URLs)
- Peak read QPS: 4,000/sec per API server (limited by Redis connection pool)
- Peak write QPS: 400/sec per API server (limited by DB write throughput)
- Estimated cluster: 2-3 API servers handle full peak load with headroom`,

    spaceComplexity: `STORAGE & MEMORY REQUIREMENTS:
- URL Database: ~300 bytes per record
  - 100M URLs/month * 60 months = 6B records over 5 years
  - Total: 6B * 300B = 1.8 TB (with DynamoDB compression: ~1.2 TB)
  - With 3x replication: ~3.6 TB across the cluster
- Redis Cache: 2-4 GB per node
  - Caches ~6-7M hot URL records
  - Expected hit ratio: 85-95%
- Analytics (ClickHouse): ~50 bytes per click event (compressed)
  - 400 reads/sec * 86400 * 365 = ~12.6B events/year
  - Storage: 12.6B * 50B = 630 GB/year (with columnar compression: ~150 GB/year)
- KGS Key Pool: ~7 bytes per key * 10M pre-generated = 70 MB (negligible)
- Per API Server Memory: ~512 MB (application) + 7 KB (local key buffer of 1000 keys)
- Total Infrastructure: 3 API servers + 1 Redis node + DynamoDB (managed) + 1 ClickHouse node + 1 KGS service`,

    hints: [
      `Base62 encoding maps numeric IDs to short strings using characters [0-9a-zA-Z]. With 7 characters, you get 62^7 = 3.52 trillion unique codes. Always pad to exactly 7 characters (e.g., encode(0) = "0000000") to maintain consistent URL length. Implement both encode() and decode() since you need bidirectional mapping. In interviews, write this from scratch - it is a simple modular arithmetic loop that interviewers expect you to code live.`,
      `The Key Generation Service (KGS) is the most elegant solution to the uniqueness problem. Pre-generate millions of random 7-char codes offline, store them in a two-table system (unused_keys and used_keys). API servers fetch batches of 1000 keys at a time. This eliminates real-time coordination, collision checking, and the predictability problem of sequential IDs. In the interview, explain that "wasted" keys from crashed servers are acceptable because 3.5T >> 6B total keys needed.`,
      `Always discuss the 301 vs 302 redirect trade-off - this is a classic interview differentiator. 301 (permanent) means the browser caches the redirect and never contacts your server again, which is great for performance but destroys analytics. 302 (temporary) means every click hits your server, enabling full analytics but increasing load. Most URL shorteners use 302 because analytics is a premium feature. Mention that you can offer both: 302 by default, 301 opt-in via API.`,
      `Cache strategy is critical: use the 80/20 rule. 20% of URLs generate 80% of traffic. Calculate that caching the top 20% of daily unique URLs requires only ~2 GB of Redis memory. With a cache-aside pattern and 24-hour TTL, you achieve 85-95% cache hit ratio. Always mention the thundering herd problem: when a popular URL's cache entry expires, thousands of simultaneous requests hit the database. Solution: use Redis SETNX to let only one request fetch from DB while others wait.`,
      `For the analytics pipeline, never process click events synchronously in the redirect path. Publish events to Kafka asynchronously, then consume with a stream processor that enriches events (geo-IP lookup, device parsing) and writes to a columnar database like ClickHouse. Pre-aggregate hourly/daily counts in materialized views. This keeps redirect latency under 10ms while still capturing complete analytics data.`,
      `Consistent hashing is essential for cache distribution. Without it, adding or removing a Redis node invalidates ALL cache entries (modulo-based mapping). With consistent hashing and 150 virtual nodes per server, adding a node only remaps ~1/N of keys. In the interview, draw the hash ring, show virtual nodes, and explain how binary search finds the correct server for a given key.`,
      `Common interview pitfall: forgetting about URL validation and security. You must validate that the long URL is a real URL (not javascript: or data: URIs), check against a blocklist of malicious domains, and rate-limit URL creation per user/IP to prevent abuse. Also discuss what happens when a short URL is used in a phishing attack - you need a reporting mechanism and the ability to disable URLs.`,
      `When discussing database choice, always justify it with the access pattern. URL shortener's primary pattern is point lookups by short_code - this is the perfect use case for a key-value store like DynamoDB. SQL databases work but add unnecessary overhead for this simple access pattern. However, for analytics (joins, aggregations, time-range queries), you need a different store - this is why the system uses two databases, not one.`
    ],
  },
  {
    id: 9002,
    description: `Design a Rate Limiter

FUNCTIONAL REQUIREMENTS:
- Limit requests per user, IP address, or API key within configurable time windows
- Support multiple algorithms: fixed window, sliding window log, sliding window counter, token bucket, leaky bucket
- Return HTTP 429 (Too Many Requests) with Retry-After header when limits are exceeded
- Support different rate limits per API endpoint, user tier (free/premium), and action type
- Provide real-time rate limit status in response headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Allow whitelisting and blacklisting of specific clients

NON-FUNCTIONAL REQUIREMENTS:
- Ultra-low latency: rate limiting check must complete in <1ms to avoid becoming the bottleneck
- Distributed: must work consistently across multiple API servers
- Fault-tolerant: if the rate limiter is down, fail open (allow traffic) rather than blocking all requests
- Accurate: minimize both false positives (blocking legitimate traffic) and false negatives (allowing excess traffic)

CAPACITY ESTIMATION:
- Assume 10M active users, 1000 requests/day per user average
- Total QPS: 10M * 1000 / 86400 = ~115,000 requests/sec to check
- Redis memory per user: user_id(8B) + counter(8B) + expiry(8B) + overhead(50B) = ~74B
- Total Redis memory: 10M * 74B = ~740 MB (single Redis instance)
- With sliding window log (storing timestamps): 10M users * 100 timestamps * 16B = ~16 GB (need Redis Cluster)
- Network: 115K requests/sec * 100B per Redis round-trip = ~11.5 MB/s

API HEADERS (per response):
\\\`\\\`\\\`
X-RateLimit-Limit: 100         // max requests allowed in window
X-RateLimit-Remaining: 67      // requests remaining in current window
X-RateLimit-Reset: 1679529600  // Unix timestamp when window resets
Retry-After: 30                // seconds until client should retry (only on 429)
\\\`\\\`\\\`

RATE LIMIT RULES CONFIGURATION:
\\\`\\\`\\\`
rules:
  - endpoint: "/api/v1/messages"
    limits:
      - tier: "free"
        max_requests: 100
        window_seconds: 3600
        algorithm: "sliding_window"
      - tier: "premium"
        max_requests: 10000
        window_seconds: 3600
        algorithm: "token_bucket"
  - endpoint: "/api/v1/auth/login"
    limits:
      - key: "ip"
        max_requests: 5
        window_seconds: 300
        algorithm: "fixed_window"
\\\`\\\`\\\``,

    examples: `ALGORITHM COMPARISON:

1. FIXED WINDOW COUNTER:
   Window: 1 minute starting at :00
   Limit: 100 requests
   User sends 90 requests at 12:00:50, then 90 requests at 12:01:10
   Problem: 180 requests in 20 seconds! The boundary between windows allows burst.
   Pros: O(1) memory per user, simple Redis INCR
   Cons: Boundary burst problem (up to 2x the limit in a short period)

2. SLIDING WINDOW LOG:
   Store timestamp of every request in a sorted set
   For each new request: remove timestamps older than window, count remaining
   User sends request at 12:01:15 with 1-minute window:
     Remove all timestamps before 12:00:15
     Count remaining: if < 100, allow and add timestamp
   Pros: Perfectly accurate, no boundary issues
   Cons: O(n) memory per user (stores every timestamp)

3. SLIDING WINDOW COUNTER (hybrid):
   Combine current window count with weighted previous window count
   Current window (12:01:00 - 12:02:00): 30 requests so far
   Previous window (12:00:00 - 12:01:00): 80 requests total
   Time position: 12:01:15 (25% into current window)
   Weighted count: 80 * 0.75 + 30 = 90
   If limit is 100: 90 < 100, ALLOW
   Pros: O(1) memory, no boundary burst, good approximation
   Cons: Approximate (not exact), slightly complex logic

4. TOKEN BUCKET:
   Bucket capacity: 10 tokens, refill rate: 1 token/second
   At t=0: bucket has 10 tokens
   Burst of 10 requests instantly: all allowed, bucket now at 0
   At t=5: bucket has 5 tokens (refilled), 5 requests allowed
   Pros: Allows controlled bursts, smooth rate limiting
   Cons: Slightly more state per user (tokens + last_refill_time)

5. LEAKY BUCKET:
   Queue capacity: 10 requests, processing rate: 1 request/second
   Burst of 15 requests: 10 queued, 5 rejected (queue full)
   Requests drain from queue at steady 1/sec rate
   Pros: Perfectly smooth output rate, good for APIs with strict rate requirements
   Cons: No burst tolerance, adds latency (requests wait in queue)

REDIS LUA SCRIPT EXAMPLE (atomic sliding window):
// This Lua script runs atomically on Redis
// KEYS[1] = rate limit key, ARGV = [now, window, limit]
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
-- Remove expired entries
redis.call("ZREMRANGEBYSCORE", key, 0, now - window)
-- Count current entries
local count = redis.call("ZCARD", key)
if count < limit then
  redis.call("ZADD", key, now, now .. ":" .. math.random())
  redis.call("EXPIRE", key, window)
  return {1, limit - count - 1}  -- allowed, remaining
end
return {0, 0}  -- rejected, 0 remaining`,

    intuition: `A rate limiter is a traffic cop that stands at the entrance of your system and decides in microseconds whether each request should be allowed through or turned away. It protects your backend from overload, prevents abuse, and ensures fair resource sharing.

THE KEY INSIGHT: Rate limiting is fundamentally a counting problem with a time dimension. You are asking: "Has this client made more than N requests in the last T seconds?" The challenge is doing this counting accurately, cheaply, and consistently across distributed servers.

WHY IS THIS HARD IN A DISTRIBUTED SYSTEM?
Imagine you have 10 API servers. A user with a 100 req/min limit sends requests rapidly, hitting different servers via the load balancer. If each server keeps its own counter, the user could make 100 * 10 = 1000 requests before any single server thinks they have hit the limit. You MUST use a centralized counter store (Redis).

ANALOGY - THE NIGHTCLUB BOUNCER:
Think of rate limiting like a bouncer at a nightclub with different algorithms:
- Fixed Window: "I let in 100 people per hour, starting on the hour." Problem: 100 people arrive at 11:59, 100 more at 12:01 - 200 people in 2 minutes!
- Sliding Window: "I count the last 60 minutes from right now." Always accurate, but the bouncer needs a long memory (stores every entry time).
- Token Bucket: "I have a bucket of 10 VIP passes that refills at 1/minute. You need a pass to enter." Allows bursts (take all 10 at once) but rate-limits over time.
- Leaky Bucket: "There is a queue. I let one person in every 6 seconds regardless of how many are waiting." Perfectly smooth flow, but long waits.

THE TOKEN BUCKET IS THE INDUSTRY STANDARD because it provides the best balance:
1. It allows controlled bursts (users can use their full allocation at once)
2. It enforces a long-term average rate
3. It requires only 2 values per user: current token count and last refill timestamp
4. It is trivially atomic: "if tokens > 0, decrement tokens, else reject"
5. AWS, Google Cloud, and Stripe all use token bucket variants

WHY REDIS? Rate limiting requires sub-millisecond decisions on every request. A database query would add 5-20ms, making the rate limiter itself the bottleneck. Redis provides:
- Sub-millisecond operations (INCR, ZADD, ZRANGEBYSCORE)
- Atomic operations via Lua scripts (eliminates race conditions)
- Built-in TTL for automatic cleanup
- Cluster mode for sharding across multiple nodes

THE FAIL-OPEN PRINCIPLE: If Redis goes down, should you block ALL traffic or allow ALL traffic? Almost always: fail open (allow traffic). A brief period without rate limiting is far less damaging than blocking all legitimate users. Your system should have other protections (circuit breakers, auto-scaling) that handle the temporary surge.`,

    approach: `COMPLETE ARCHITECTURE:

HIGH-LEVEL COMPONENTS:
1. Rate Limiter Middleware - intercepts every request before it reaches the application
2. Rules Engine - loads and caches rate limit configurations per endpoint/tier
3. Redis Counter Store - centralized atomic counter storage
4. Response Handler - formats 429 responses with proper headers
5. Monitoring - tracks allow/reject rates, Redis latency, rule violations

REQUEST FLOW:
1. Request arrives at API Gateway / Load Balancer
2. Rate limiter middleware intercepts the request
3. Extract rate limit key: user_id, API key, IP address, or combination
4. Look up applicable rules: which endpoint, what tier, what limits
5. Execute rate check against Redis (single round-trip):
   a. Token Bucket: check tokens, refill based on elapsed time, try to consume
   b. Sliding Window: ZREMRANGEBYSCORE + ZCARD + ZADD (Lua script for atomicity)
   c. Fixed Window: INCR + TTL
6. If allowed: add rate limit headers, forward to application
7. If rejected: return 429 with Retry-After header, log the event

RULES ENGINE:
- Rate limit rules stored in a config database (or YAML config file)
- Rules cached in-memory on each API server (refresh every 30 seconds)
- Rule matching priority: specific endpoint > general endpoint > default
- Rule structure: { key_type, endpoint_pattern, tier, algorithm, max_requests, window_seconds }
- Support wildcards: /api/v1/* matches all v1 endpoints

DISTRIBUTED RATE LIMITING WITH REDIS:
- All API servers share the same Redis cluster for counter storage
- Lua scripts ensure atomic check-and-increment (no race conditions)
- Key format: "rl:{user_id}:{endpoint}:{window_start}" for fixed window
- Key format: "rl:{user_id}:{endpoint}" (sorted set) for sliding window
- Redis Cluster shards keys by user_id for even distribution

MULTI-TIER RATE LIMITING:
Layer 1: IP-based rate limiting at the API Gateway (protects against DDoS)
Layer 2: User/API-key rate limiting at the application level (enforces plan limits)
Layer 3: Endpoint-specific rate limiting (protects expensive operations)

Each layer can use a different algorithm:
- Layer 1: Fixed window (simple, fast, handles millions of IPs)
- Layer 2: Token bucket (allows bursts, smooth experience)
- Layer 3: Sliding window (accurate, prevents abuse of expensive endpoints)

FAILOVER STRATEGY:
1. Primary: Redis Cluster with replicas
2. If Redis is unreachable (detected in <100ms via circuit breaker):
   - Switch to local in-memory counters per API server
   - Divide the rate limit by the number of servers (approximate)
   - Log degraded mode for alerting
3. When Redis recovers, sync local counters and resume centralized mode

RESPONSE FORMAT:
On success (200, etc.):
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 897
  X-RateLimit-Reset: 1679529600

On rate limit exceeded (429):
  HTTP/1.1 429 Too Many Requests
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1679529600
  Retry-After: 30
  Content-Type: application/json
  {"error": "rate_limit_exceeded", "message": "Too many requests", "retry_after": 30}`,

    code: `// =============================================
// Rate Limiter - Core Algorithms Implementation
// =============================================

// --- Token Bucket Algorithm ---
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate; // tokens per second
    this.buckets = new Map();
  }

  _getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, { tokens: this.capacity, lastRefill: Date.now() });
    }
    return this.buckets.get(key);
  }

  tryConsume(key, tokensNeeded = 1) {
    const bucket = this._getBucket(key);
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + elapsed * this.refillRate
    );
    bucket.lastRefill = now;
    if (bucket.tokens >= tokensNeeded) {
      bucket.tokens -= tokensNeeded;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        retryAfter: 0,
      };
    }
    const waitTime = (tokensNeeded - bucket.tokens) / this.refillRate;
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil(waitTime),
    };
  }
}

// --- Sliding Window Log Algorithm ---
class SlidingWindowLog {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.logs = new Map(); // key -> sorted array of timestamps
  }

  tryAllow(key) {
    const now = Date.now();
    if (!this.logs.has(key)) this.logs.set(key, []);
    const timestamps = this.logs.get(key);
    const windowStart = now - this.windowMs;
    let left = 0;
    while (left < timestamps.length && timestamps[left] <= windowStart) left++;
    const validTimestamps = timestamps.slice(left);
    this.logs.set(key, validTimestamps);
    if (validTimestamps.length < this.maxRequests) {
      validTimestamps.push(now);
      return {
        allowed: true,
        remaining: this.maxRequests - validTimestamps.length,
        resetAt: validTimestamps[0] + this.windowMs,
      };
    }
    const oldestValid = validTimestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((oldestValid + this.windowMs - now) / 1000),
    };
  }
}

// --- Sliding Window Counter (Hybrid) ---
class SlidingWindowCounter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.windows = new Map(); // key -> { prevCount, currCount, currStart }
  }

  tryAllow(key) {
    const now = Date.now();
    if (!this.windows.has(key)) {
      this.windows.set(key, {
        prevCount: 0,
        currCount: 0,
        currStart: now - (now % this.windowMs),
      });
    }
    const w = this.windows.get(key);
    const currWindowStart = now - (now % this.windowMs);
    if (currWindowStart !== w.currStart) {
      if (currWindowStart - w.currStart >= 2 * this.windowMs) {
        w.prevCount = 0;
      } else {
        w.prevCount = w.currCount;
      }
      w.currCount = 0;
      w.currStart = currWindowStart;
    }
    const elapsedRatio = (now - currWindowStart) / this.windowMs;
    const weight = 1 - elapsedRatio;
    const estimatedCount = w.prevCount * weight + w.currCount;
    if (estimatedCount < this.maxRequests) {
      w.currCount++;
      return {
        allowed: true,
        remaining: Math.floor(this.maxRequests - estimatedCount - 1),
        resetAt: currWindowStart + this.windowMs,
      };
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((currWindowStart + this.windowMs - now) / 1000),
    };
  }
}

// --- Distributed Rate Limiter (simulates Redis Lua atomicity) ---
class DistributedRateLimiter {
  constructor(redisClient) {
    this.redis = redisClient || new Map(); // simulated Redis store
    this.rules = new Map();
  }

  addRule(endpoint, tier, algorithm, maxReq, windowSec) {
    const ruleKey = endpoint + ":" + tier;
    this.rules.set(ruleKey, { algorithm, maxReq, windowSec });
  }

  _getAlgorithm(rule) {
    switch (rule.algorithm) {
      case "token_bucket":
        return new TokenBucket(rule.maxReq, rule.maxReq / rule.windowSec);
      case "sliding_log":
        return new SlidingWindowLog(rule.maxReq, rule.windowSec * 1000);
      case "sliding_counter":
        return new SlidingWindowCounter(rule.maxReq, rule.windowSec * 1000);
      default:
        return new TokenBucket(rule.maxReq, rule.maxReq / rule.windowSec);
    }
  }

  checkLimit(userId, endpoint, tier = "free") {
    const ruleKey = endpoint + ":" + tier;
    const rule = this.rules.get(ruleKey);
    if (!rule) return { allowed: true, remaining: -1, retryAfter: 0 };
    const algoKey = ruleKey + ":" + userId;
    if (!this.redis.has(algoKey)) {
      this.redis.set(algoKey, this._getAlgorithm(rule));
    }
    const algo = this.redis.get(algoKey);
    if (algo instanceof TokenBucket) return algo.tryConsume(userId);
    return algo.tryAllow(userId);
  }

  middleware() {
    return (req) => {
      const result = this.checkLimit(req.userId, req.endpoint, req.tier);
      if (result.allowed) {
        return {
          proceed: true,
          headers: {
            "X-RateLimit-Remaining": result.remaining,
          },
        };
      }
      return {
        proceed: false,
        status: 429,
        headers: {
          "Retry-After": result.retryAfter,
          "X-RateLimit-Remaining": 0,
        },
        body: { error: "rate_limit_exceeded", retry_after: result.retryAfter },
      };
    };
  }
}

// --- Demo ---
const limiter = new DistributedRateLimiter();
limiter.addRule("/api/messages", "free", "token_bucket", 5, 60);
limiter.addRule("/api/messages", "premium", "sliding_counter", 1000, 60);

const mw = limiter.middleware();
for (let i = 0; i < 8; i++) {
  const res = mw({ userId: "user1", endpoint: "/api/messages", tier: "free" });
  console.log("Request " + (i + 1) + ":", res.proceed ? "ALLOWED" : "BLOCKED",
    "remaining:", res.headers["X-RateLimit-Remaining"]);
}`,

    jsCode: `// =============================================
// Rate Limiter - Leaky Bucket & Redis Lua Simulation
// =============================================

// --- Leaky Bucket Algorithm ---
class LeakyBucket {
  constructor(capacity, leakRate) {
    this.capacity = capacity;     // max queue size
    this.leakRate = leakRate;     // requests drained per second
    this.buckets = new Map();
  }

  _getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, { water: 0, lastLeak: Date.now() });
    }
    return this.buckets.get(key);
  }

  tryAdd(key) {
    const bucket = this._getBucket(key);
    const now = Date.now();
    const elapsed = (now - bucket.lastLeak) / 1000;
    const leaked = elapsed * this.leakRate;
    bucket.water = Math.max(0, bucket.water - leaked);
    bucket.lastLeak = now;
    if (bucket.water < this.capacity) {
      bucket.water += 1;
      return {
        allowed: true,
        queuePosition: Math.ceil(bucket.water),
        estimatedWait: Math.ceil(bucket.water / this.leakRate),
      };
    }
    return {
      allowed: false,
      retryAfter: Math.ceil(1 / this.leakRate),
    };
  }
}

// --- Redis Lua Script Simulator (Atomic Sliding Window) ---
class RedisLuaSlidingWindow {
  constructor() {
    this.store = new Map(); // simulates Redis sorted sets
  }

  // Simulates the atomic Lua script execution
  evalSlidingWindow(key, now, windowMs, limit) {
    if (!this.store.has(key)) this.store.set(key, []);
    const entries = this.store.get(key);

    // ZREMRANGEBYSCORE: remove entries outside the window
    const cutoff = now - windowMs;
    const filtered = entries.filter((e) => e.score > cutoff);
    this.store.set(key, filtered);

    // ZCARD: count entries in window
    if (filtered.length < limit) {
      // ZADD: add new entry with score = current timestamp
      const member = now + ":" + Math.random().toString(36).substring(2, 8);
      filtered.push({ score: now, member });
      // EXPIRE: set TTL on the key
      return {
        allowed: true,
        remaining: limit - filtered.length,
        count: filtered.length,
      };
    }

    // Find when the oldest entry will expire
    const oldest = filtered.reduce((min, e) => Math.min(min, e.score), Infinity);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((oldest + windowMs - now) / 1000),
      count: filtered.length,
    };
  }
}

// --- Multi-Strategy Rate Limiter with Fallback ---
class ResilientRateLimiter {
  constructor(config) {
    this.primary = config.primary || "redis";
    this.redisAvailable = true;
    this.redisLua = new RedisLuaSlidingWindow();
    this.localFallback = new Map();
    this.serverCount = config.serverCount || 4;
    this.circuitBreaker = {
      failures: 0,
      threshold: 3,
      resetAfter: 30000,
      lastFailure: 0,
    };
  }

  _checkCircuitBreaker() {
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      if (Date.now() - this.circuitBreaker.lastFailure > this.circuitBreaker.resetAfter) {
        this.circuitBreaker.failures = 0;
        this.redisAvailable = true;
        return true;
      }
      return false;
    }
    return true;
  }

  _redisCheck(key, now, windowMs, limit) {
    if (!this._checkCircuitBreaker()) return null;
    try {
      // Simulate potential Redis failure
      if (!this.redisAvailable) throw new Error("Redis unavailable");
      return this.redisLua.evalSlidingWindow(key, now, windowMs, limit);
    } catch (err) {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailure = Date.now();
      this.redisAvailable = false;
      return null;
    }
  }

  _localCheck(key, limit, windowMs) {
    // Degraded mode: divide limit by number of servers
    const localLimit = Math.ceil(limit / this.serverCount);
    if (!this.localFallback.has(key)) {
      this.localFallback.set(key, { count: 0, windowStart: Date.now() });
    }
    const entry = this.localFallback.get(key);
    if (Date.now() - entry.windowStart > windowMs) {
      entry.count = 0;
      entry.windowStart = Date.now();
    }
    entry.count++;
    return {
      allowed: entry.count <= localLimit,
      remaining: Math.max(0, localLimit - entry.count),
      degraded: true,
    };
  }

  checkLimit(key, limit, windowMs) {
    const now = Date.now();
    const result = this._redisCheck(key, now, windowMs, limit);
    if (result !== null) return result;
    console.log("Redis unavailable, using local fallback for:", key);
    return this._localCheck(key, limit, windowMs);
  }

  simulateRedisFailure() {
    this.redisAvailable = false;
  }

  simulateRedisRecovery() {
    this.redisAvailable = true;
    this.circuitBreaker.failures = 0;
  }
}

// --- Demo ---
const leaky = new LeakyBucket(5, 2);
console.log("=== Leaky Bucket ===");
for (let i = 0; i < 8; i++) {
  console.log("Request " + (i + 1) + ":", leaky.tryAdd("user1"));
}

console.log("\\n=== Redis Lua Sliding Window ===");
const redis = new RedisLuaSlidingWindow();
const baseTime = Date.now();
for (let i = 0; i < 6; i++) {
  const r = redis.evalSlidingWindow("u1:/api", baseTime + i * 100, 60000, 5);
  console.log("Request " + (i + 1) + ":", r.allowed ? "ALLOWED" : "BLOCKED",
    "count:", r.count);
}

console.log("\\n=== Resilient Rate Limiter with Failover ===");
const resilient = new ResilientRateLimiter({ serverCount: 4 });
console.log("Normal:", resilient.checkLimit("user1:/api", 100, 60000));
resilient.simulateRedisFailure();
console.log("Degraded:", resilient.checkLimit("user1:/api", 100, 60000));
resilient.simulateRedisRecovery();
console.log("Recovered:", resilient.checkLimit("user1:/api", 100, 60000));`,

    explanation: `SCALING ANALYSIS:

HORIZONTAL SCALING:
- Rate limiter middleware runs on every API server (no separate deployment needed)
- Redis Cluster handles counter storage, sharded by user/key hash
- Rules engine is cached locally on each API server, refreshed periodically
- Adding more API servers does not affect rate limiting accuracy (centralized Redis counters)

BOTTLENECK IDENTIFICATION:
1. Redis is the primary bottleneck: 115K checks/sec is well within a single Redis node's capability (~100K-300K ops/sec), but at higher scale you need Redis Cluster
2. Network latency to Redis: typically 0.1-0.5ms in same data center. Cross-region would be 10-50ms (unacceptable). Solution: deploy Redis in each region with local rate limiting
3. Lua script execution time: sorted set operations are O(log N) per user. With 1000 entries per window, this is microseconds. Not a bottleneck.
4. Rule lookup: local cache, O(1) hash map lookup. Not a bottleneck.

FAILURE MODES:
1. Redis node failure: Circuit breaker detects in <100ms, switches to local in-memory counters. Divide limit by server count for approximate enforcement. Auto-failover to Redis replica.
2. Network partition: API servers on one side of the partition fall back to local counters. Brief period of slightly relaxed limits, but system continues serving traffic.
3. Configuration error: Rate limit rule is too restrictive and blocks all users. Mitigation: canary deployment of rule changes, immediate rollback capability, admin override endpoint.
4. Clock skew: Servers with different system times compute different windows. Mitigation: use Redis server time (TIME command) instead of local time.

MONITORING STRATEGY:
- Request allow/reject ratio per endpoint per tier (Alert if reject ratio > 10% for any tier)
- Redis operation latency p50/p95/p99 (Alert if p99 > 2ms)
- Circuit breaker state changes (Alert on any transition to OPEN state)
- Rate limit rule change events (audit log for all configuration changes)
- Top rate-limited users/IPs (identify abuse patterns)
- Local fallback activation events (indicates Redis issues)

TRADE-OFFS:

1. CENTRALIZED vs LOCAL RATE LIMITING:
   Centralized (Redis): Accurate across all servers, but adds 0.1-0.5ms latency per request and Redis becomes a dependency.
   Local (in-memory per server): Zero latency, no external dependency, but inaccurate (limit is effectively multiplied by server count).
   Decision: Centralized for accuracy, with local fallback for availability.

2. FIXED WINDOW vs SLIDING WINDOW vs TOKEN BUCKET:
   Fixed Window: O(1) memory, simple INCR, but allows 2x burst at boundaries.
   Sliding Window Log: Perfectly accurate, but O(N) memory per user (stores every timestamp).
   Sliding Window Counter: O(1) memory, good approximation, slight complexity.
   Token Bucket: O(1) memory, allows controlled bursts, industry standard.
   Decision: Token bucket for most use cases. Sliding window counter for strict accuracy requirements.

3. FAIL OPEN vs FAIL CLOSED:
   Fail Open: Allow all traffic when rate limiter is unavailable. Risk: brief period of no protection.
   Fail Closed: Block all traffic when rate limiter is unavailable. Risk: complete service outage.
   Decision: Fail open for user-facing APIs (availability > protection). Fail closed for billing/payment APIs where overuse has direct cost.

4. PER-USER vs GLOBAL RATE LIMITS:
   Per-user: Fair allocation, prevents single user abuse, but requires state per user.
   Global (per endpoint): Simple, protects against DDoS, but unfair to individual users during high traffic.
   Decision: Both. Global limits protect the system, per-user limits ensure fairness.

5. SYNCHRONOUS vs ASYNCHRONOUS CHECK:
   Synchronous: Accurate, request waits for check result, adds latency.
   Asynchronous: Fire-and-forget check, no latency added, but allows some excess traffic.
   Decision: Synchronous for accuracy. The <1ms overhead is acceptable for most APIs.`,

    timeComplexity: `PERFORMANCE CHARACTERISTICS:
- Rate limit check latency (Redis, same DC): 0.1-0.5ms (p50: 0.2ms, p99: 1ms)
- Rate limit check latency (local fallback): <0.01ms (in-memory)
- Token Bucket: O(1) per check (read 2 values, compute, write 2 values)
- Sliding Window Log: O(log N) per check where N = requests in window (sorted set ops)
- Sliding Window Counter: O(1) per check (read 2 counters, compute weighted sum)
- Fixed Window: O(1) per check (single INCR + TTL)
- Redis throughput: 100K-300K ops/sec per node (single-threaded)
- Peak check QPS: 115,000 checks/sec (requires Redis Cluster if above 200K/sec)
- Lua script execution: <0.1ms for sliding window operations
- Rule cache refresh: every 30 seconds, O(R) where R = number of rules`,

    spaceComplexity: `STORAGE & MEMORY REQUIREMENTS:
- Token Bucket per user: 16 bytes (8B tokens float + 8B lastRefill timestamp)
  10M users * 16B = 160 MB
- Sliding Window Log per user: 8 bytes per timestamp * max 1000 timestamps = 8 KB
  10M users * 8 KB = 80 GB (too much for single Redis - need Cluster or use counter instead)
- Sliding Window Counter per user: 24 bytes (8B prevCount + 8B currCount + 8B windowStart)
  10M users * 24B = 240 MB
- Fixed Window per user: 16 bytes (8B counter + 8B TTL)
  10M users * 16B = 160 MB
- Redis overhead: ~50 bytes per key for metadata
  10M keys * 50B = 500 MB overhead
- Rules cache per API server: ~10 KB for 100 rules (negligible)
- Recommended: 2-4 GB Redis instance handles 10M users with token bucket or sliding window counter
- For sliding window log at scale: Redis Cluster with 4-8 nodes, 8 GB each`,

    hints: [
      `The token bucket algorithm is the industry standard for API rate limiting (used by AWS, Google Cloud, Stripe). It stores only 2 values per user: current token count and last refill timestamp. On each request: calculate elapsed time, add tokens at refill rate (capped at bucket capacity), try to consume one token. This provides controlled bursts up to bucket capacity while enforcing a long-term average rate. Code this in the interview - it is only ~20 lines.`,
      `Always discuss the distributed consistency problem. With multiple API servers, each checking a centralized Redis counter, there is a race condition: two servers read count=99 simultaneously, both increment to 100, but the actual count is 101. Solution: use Redis Lua scripts for atomic check-and-increment. The entire operation (read count, check limit, increment, set TTL) executes as a single atomic step in Redis. This is the single most important implementation detail.`,
      `The sliding window counter is a clever O(1) approximation that eliminates the boundary burst problem of fixed windows. It weights the previous window's count by the percentage of the current window that overlaps with it. For example, at 25% into the current window, the estimated count = 0.75 * prevWindowCount + currWindowCount. This is 99.9% accurate in practice and uses only 3 values per user. Know how to derive and code this formula.`,
      `Fail-open vs fail-closed is a critical design decision that interviewers specifically ask about. If Redis goes down, should you block all traffic (fail closed, protecting the backend but causing an outage) or allow all traffic (fail open, risking overload but maintaining availability)? The answer depends on the use case: fail open for user-facing APIs, fail closed for billing/payment. Implement a circuit breaker that detects Redis failures in <100ms and switches to a local in-memory fallback.`,
      `Multi-tier rate limiting is what separates a junior answer from a senior one. Layer 1: IP-based limits at the API gateway (stops DDoS, 10K req/sec per IP). Layer 2: user/API-key limits at the application layer (enforces plan limits, 100 req/min for free tier). Layer 3: endpoint-specific limits (5 login attempts/5min, 10 file uploads/hour). Each layer can use a different algorithm optimized for its purpose.`,
      `Always include the HTTP response headers in your design: X-RateLimit-Limit (total allowed), X-RateLimit-Remaining (requests left in window), X-RateLimit-Reset (UTC epoch when window resets), and Retry-After (seconds to wait, only on 429). These headers let well-behaved clients self-throttle and reduce unnecessary rejected requests. Many candidates forget these headers, which are part of RFC 6585 and industry standard practice.`,
      `Common interview pitfall: not considering the memory implications of sliding window log. It stores the timestamp of every request in the window. With 10M users and 1000 requests/hour each, that is 10B timestamps * 8 bytes = 80 GB. This does not fit in a single Redis instance. Either use Redis Cluster (expensive) or switch to the sliding window counter which uses O(1) memory per user. Always calculate memory requirements during the interview.`,
      `Race conditions in distributed rate limiting go beyond simple read-modify-write. Consider: a user sends 10 concurrent requests to 10 different servers. Without atomic operations, all 10 servers might read the same counter value and all allow the request. The Redis Lua script solution ensures atomicity, but there is still a TOCTOU (time-of-check-time-of-use) issue between the rate limit check and the actual request processing. For critical systems, reserve the token atomically and release it if the request fails.`
    ],
  },
  {
    id: 9003,
    description: `Design a Notification Service

FUNCTIONAL REQUIREMENTS:
- Support multiple channels: push notifications (iOS APNs, Android FCM), SMS (Twilio), email (SendGrid), and in-app notifications
- Handle millions of notifications per day (target: 10M notifications/day, peaks at 100K/min during campaigns)
- At-least-once delivery guarantee for all channels
- User preference management: opt-in/out per channel, quiet hours, frequency caps
- Template engine with variable substitution and localization (i18n)
- Scheduling: send immediately or at a scheduled time, timezone-aware
- Priority levels: critical (OTP/2FA, <5s delivery), high (order updates, <30s), normal (marketing, best-effort)
- Delivery tracking: sent, delivered, opened, clicked, bounced, failed
- Idempotent processing: same notification event must not produce duplicate deliveries

NON-FUNCTIONAL REQUIREMENTS:
- High availability (99.99% for critical notifications like OTP)
- Scalable to 100M+ notifications/day
- Latency: critical notifications delivered within 5 seconds end-to-end
- Fault-tolerant: provider failures must not block the entire pipeline
- Auditable: full delivery audit trail for compliance

CAPACITY ESTIMATION:
- Daily volume: 10M notifications (5M push, 3M email, 1.5M SMS, 500K in-app)
- Average QPS: 10M / 86400 = ~116 notifications/sec
- Peak QPS (campaign blast): 100K/min = ~1,667/sec (10x burst)
- Message size: ~1 KB (metadata + rendered content)
- Kafka throughput: 1,667 messages/sec * 1 KB = 1.67 MB/sec (well within Kafka's capacity)
- Storage (delivery logs, 90 days): 10M/day * 90 * 500B = ~450 GB
- Redis (deduplication cache, 24h window): 10M * 32B (hash) = ~320 MB

DATABASE SCHEMA:
\\\`\\\`\\\`
notifications:
  id              UUID PRIMARY KEY
  user_id         BIGINT INDEX
  template_id     VARCHAR(64)
  channel         ENUM('push','sms','email','in_app')
  priority        ENUM('critical','high','normal')
  status          ENUM('pending','sent','delivered','failed','bounced')
  payload         JSONB
  scheduled_at    TIMESTAMP
  sent_at         TIMESTAMP
  created_at      TIMESTAMP

user_preferences:
  user_id         BIGINT PRIMARY KEY
  push_enabled    BOOLEAN DEFAULT TRUE
  email_enabled   BOOLEAN DEFAULT TRUE
  sms_enabled     BOOLEAN DEFAULT TRUE
  quiet_start     TIME  (e.g., 22:00)
  quiet_end       TIME  (e.g., 08:00)
  timezone        VARCHAR(50) DEFAULT 'UTC'
  frequency_cap   INT DEFAULT 10  (max per hour)

templates:
  template_id     VARCHAR(64) PRIMARY KEY
  channel         ENUM('push','sms','email','in_app')
  locale          VARCHAR(10) DEFAULT 'en'
  subject         TEXT
  body            TEXT  (with {{variable}} placeholders)
  version         INT
\\\`\\\`\\\``,

    examples: `NOTIFICATION LIFECYCLE WALKTHROUGH:

Scenario: User places an order, system sends order confirmation across multiple channels.

Step 1 - Trigger Event:
  Order service publishes event: { type: "order_confirmed", user_id: 12345, order_id: "ORD-789", total: "$49.99" }

Step 2 - Notification API receives request:
  POST /api/v1/notifications
  {
    "user_id": 12345,
    "template_id": "order_confirmed",
    "channels": ["push", "email"],
    "priority": "high",
    "variables": { "order_id": "ORD-789", "total": "$49.99", "items": "3 items" },
    "idempotency_key": "order-confirmed-ORD-789"
  }

Step 3 - API processes the request:
  a. Check idempotency key in Redis -> not found, proceed
  b. Store idempotency key with 24h TTL
  c. Fetch user preferences: push=true, email=true, quiet_hours=22:00-08:00 UTC, timezone=America/New_York
  d. Current time in user's timezone: 14:30 -> outside quiet hours, proceed
  e. Check frequency cap: 3 notifications sent in last hour, cap is 10 -> OK
  f. Publish to Kafka topic "notifications.high" (one message per channel)

Step 4 - Push Worker consumes from Kafka:
  a. Fetch template "order_confirmed" for channel "push", locale "en"
  b. Template: "Your order {{order_id}} for {{total}} is confirmed!"
  c. Render: "Your order ORD-789 for $49.99 is confirmed!"
  d. Fetch user's device tokens from device registry
  e. Send to FCM/APNs via provider adapter
  f. Receive delivery receipt from provider
  g. Update notification status: "delivered"
  h. Publish delivery event to "notifications.tracking" topic

Step 5 - Email Worker consumes from Kafka:
  a. Fetch email template (HTML with variables)
  b. Render with variables + user's name
  c. Send via SendGrid API
  d. Handle response: 202 Accepted
  e. Webhook later receives: delivered/opened/clicked events

PRIORITY QUEUE EXAMPLE:
  Critical queue: OTP code for login -> processed immediately, <5s delivery
  High queue: Order confirmation -> processed within 30s
  Normal queue: Weekly newsletter -> processed within minutes

  During a marketing campaign blast (100K normal-priority emails):
  - Normal queue backs up to 50K messages
  - Critical OTP notification arrives
  - OTP goes to dedicated critical queue with reserved worker capacity
  - OTP delivered in 3 seconds despite 50K backlog in normal queue

TEMPLATE RENDERING EXAMPLE:
  Template (email, en):
    Subject: "Order {{order_id}} Confirmed"
    Body: "Hi {{user_name}}, your order {{order_id}} for {{total}} ({{item_count}} items) has shipped!"

  Template (email, es):
    Subject: "Pedido {{order_id}} Confirmado"
    Body: "Hola {{user_name}}, tu pedido {{order_id}} por {{total}} ({{item_count}} articulos) ha sido enviado!"

  Variables: { order_id: "ORD-789", user_name: "Jay", total: "$49.99", item_count: 3 }
  Rendered (en): "Hi Jay, your order ORD-789 for $49.99 (3 items) has shipped!"`,

    intuition: `A notification service is an event-driven pipeline that transforms a business event (like "order confirmed") into concrete deliveries across multiple channels while respecting every user's individual preferences. Think of it as a postal service with multiple delivery methods.

THE KEY INSIGHT: The core challenge is NOT sending notifications - third-party providers handle the actual delivery. The challenge is building a reliable, scalable pipeline that:
1. Never drops a notification (at-least-once delivery)
2. Never sends duplicates (idempotent processing)
3. Never delays critical messages (priority isolation)
4. Never annoys users (preferences, frequency caps, quiet hours)

These four requirements are in tension with each other, and the architecture must balance all of them.

ANALOGY - THE MAIL SORTING CENTER:
Imagine a massive mail sorting facility:
- Letters arrive at the intake desk (API gateway)
- Each letter is stamped with priority (critical/high/normal) and checked against "do not mail" lists (user preferences)
- Letters are sorted into priority bins on a conveyor belt (Kafka topics)
- Specialized workers at the end of each belt handle different delivery methods: one team handles courier delivery (push), another team handles postal mail (email), another handles telegrams (SMS)
- Each team has its own pace and capacity limits (provider rate limits)
- A tracking system records when each letter was sent and delivered (delivery tracking)

WHY KAFKA (NOT A SIMPLE QUEUE)?
1. Durability: Messages are persisted to disk. If a worker crashes mid-processing, the message is NOT lost - it will be re-consumed.
2. Ordering: Messages within a partition maintain order (important for sequences like "order confirmed" then "order shipped").
3. Consumer groups: Multiple worker instances consume from the same topic with automatic load balancing.
4. Replay: If you discover a bug in your email renderer, you can replay all messages from the last hour and re-send.
5. Throughput: Kafka handles millions of messages/sec with minimal latency.

WHY SEPARATE QUEUES BY PRIORITY?
This is the single most important architectural decision. If you use one queue, a marketing blast of 1M emails will create a 1M-message backlog. A critical OTP notification arriving during this blast would wait behind 1M marketing emails. With separate queues and dedicated workers, the OTP bypasses the backlog entirely.

THE IDEMPOTENCY CHALLENGE:
At-least-once delivery means a message might be processed twice (if a worker crashes after sending but before acknowledging). Without idempotency, the user gets duplicate notifications. Solution: generate a unique notification_id per event, check it in Redis before processing. If the ID exists, skip the notification. The Redis entry expires after 24 hours (notifications older than 24h are unlikely to be reprocessed).`,

    approach: `COMPLETE ARCHITECTURE:

HIGH-LEVEL COMPONENTS:
1. Notification API (REST) - accepts notification requests, validates, enqueues
2. Kafka Message Broker - durable message queues with priority topics
3. Channel Workers (push/email/SMS/in-app) - consume from Kafka, render templates, deliver via providers
4. Preference Service - manages user notification preferences and frequency caps
5. Template Engine - renders notification content with variable substitution and i18n
6. Provider Adapters - abstractions over FCM, APNs, Twilio, SendGrid with circuit breakers
7. Delivery Tracker - records delivery status, handles webhooks from providers
8. Scheduler - manages delayed/scheduled notifications

WRITE PATH (Sending a Notification):
1. Business service calls POST /api/v1/notifications with user_id, template_id, channels, priority, variables
2. API server validates the request
3. Idempotency check: look up idempotency_key in Redis. If exists, return cached response.
4. Fetch user preferences from Preference Service (cached in Redis)
5. Filter channels: remove channels user has opted out of
6. Check quiet hours: if in quiet hours and priority != critical, schedule for quiet hours end
7. Check frequency cap: if exceeded and priority != critical, drop with "frequency_capped" status
8. For each remaining channel, publish a message to the appropriate Kafka topic:
   - notifications.critical (dedicated high-throughput consumers)
   - notifications.high
   - notifications.normal
9. Store notification record in database with status "pending"
10. Store idempotency_key in Redis with 24h TTL
11. Return notification_id to caller

READ PATH (Worker Processing):
1. Channel worker (e.g., PushWorker) consumes message from Kafka
2. Idempotency check: verify notification_id has not been delivered
3. Fetch template from Template Service (cached locally)
4. Render template with provided variables
5. Fetch delivery targets (device tokens for push, email address for email, phone for SMS)
6. Call provider adapter (FCM, SendGrid, Twilio)
7. Handle provider response:
   - Success: update status to "sent", publish to tracking topic
   - Transient failure (429, 503): re-enqueue with exponential backoff
   - Permanent failure (invalid token, bounced email): update status to "failed", clean up bad token
8. Acknowledge Kafka message (commit offset)

PROVIDER ADAPTER PATTERN:
Each provider is wrapped in an adapter with:
- Circuit breaker: if provider fails 5 times in 30s, open circuit, try fallback provider
- Rate limiter: respect provider's rate limits (e.g., FCM: 1000/sec)
- Retry logic: exponential backoff with jitter for transient failures
- Fallback: primary FCM -> secondary FCM project -> fallback to APNs-style push

SCHEDULING SERVICE:
- Scheduled notifications stored in a database table with scheduled_at timestamp
- Background job runs every second, queries for notifications where scheduled_at <= NOW()
- Fetched notifications are published to the appropriate Kafka priority topic
- Supports timezone-aware scheduling: "send at 9 AM user's local time"

DELIVERY TRACKING:
- Each notification state change is recorded: pending -> sent -> delivered -> opened -> clicked
- Provider webhooks (SendGrid delivery events, FCM delivery receipts) update status
- Tracking data stored in a time-series database for analytics dashboards
- Aggregated metrics: delivery rate, open rate, click rate per template per channel`,

    code: `// =============================================
// Notification Service - Core Components
// =============================================

// --- Priority Queue Dispatcher ---
class PriorityDispatcher {
  constructor() {
    this.queues = { critical: [], high: [], normal: [] };
    this.workers = { critical: 4, high: 2, normal: 1 };
    this.processing = { critical: 0, high: 0, normal: 0 };
  }

  enqueue(notification) {
    const p = notification.priority || "normal";
    this.queues[p].push(notification);
    return { queued: true, priority: p, position: this.queues[p].length };
  }

  dequeue() {
    for (const priority of ["critical", "high", "normal"]) {
      if (this.queues[priority].length > 0 &&
          this.processing[priority] < this.workers[priority]) {
        this.processing[priority]++;
        return { priority, notification: this.queues[priority].shift() };
      }
    }
    return null;
  }

  complete(priority) {
    this.processing[priority] = Math.max(0, this.processing[priority] - 1);
  }

  getStats() {
    const stats = {};
    for (const p of ["critical", "high", "normal"]) {
      stats[p] = { queued: this.queues[p].length, processing: this.processing[p] };
    }
    return stats;
  }
}

// --- Template Renderer with i18n ---
class TemplateRenderer {
  constructor() {
    this.templates = new Map();
  }

  register(templateId, channel, locale, subject, body) {
    const key = templateId + ":" + channel + ":" + locale;
    this.templates.set(key, { subject, body });
  }

  render(templateId, channel, locale, variables) {
    let key = templateId + ":" + channel + ":" + locale;
    let template = this.templates.get(key);
    if (!template) {
      key = templateId + ":" + channel + ":en";
      template = this.templates.get(key);
    }
    if (!template) throw new Error("Template not found: " + key);
    const renderStr = (str) =>
      str.replace(/\\{\\{(\\w+)\\}\\}/g, (match, varName) =>
        variables[varName] !== undefined ? String(variables[varName]) : match
      );
    return { subject: renderStr(template.subject), body: renderStr(template.body) };
  }
}

// --- Idempotent Delivery Handler ---
class IdempotentDeliveryHandler {
  constructor(ttlMs = 86400000) {
    this.processedIds = new Map();
    this.ttlMs = ttlMs;
  }

  isDuplicate(notificationId) {
    this._cleanup();
    return this.processedIds.has(notificationId);
  }

  markProcessed(notificationId, result) {
    this.processedIds.set(notificationId, { result, timestamp: Date.now() });
  }

  _cleanup() {
    const cutoff = Date.now() - this.ttlMs;
    for (const [id, entry] of this.processedIds) {
      if (entry.timestamp < cutoff) this.processedIds.delete(id);
    }
  }
}

// --- Notification Router (Orchestrator) ---
class NotificationRouter {
  constructor() {
    this.dispatcher = new PriorityDispatcher();
    this.renderer = new TemplateRenderer();
    this.dedup = new IdempotentDeliveryHandler();
    this.preferences = new Map();
    this.providers = new Map();
    this.deliveryLog = [];
  }

  setUserPreferences(userId, prefs) {
    this.preferences.set(userId, {
      push: prefs.push !== false,
      email: prefs.email !== false,
      sms: prefs.sms !== false,
      quietStart: prefs.quietStart || 22,
      quietEnd: prefs.quietEnd || 8,
      timezone: prefs.timezone || "UTC",
      frequencyCap: prefs.frequencyCap || 10,
    });
  }

  registerProvider(channel, providerFn) {
    this.providers.set(channel, providerFn);
  }

  _isQuietHours(prefs) {
    const hour = new Date().getUTCHours();
    if (prefs.quietStart > prefs.quietEnd) {
      return hour >= prefs.quietStart || hour < prefs.quietEnd;
    }
    return hour >= prefs.quietStart && hour < prefs.quietEnd;
  }

  _getRecentCount(userId, windowMs = 3600000) {
    const cutoff = Date.now() - windowMs;
    return this.deliveryLog.filter(
      (e) => e.userId === userId && e.timestamp > cutoff
    ).length;
  }

  send(notification) {
    const { userId, templateId, channels, priority, variables, idempotencyKey } = notification;
    const nid = idempotencyKey || userId + ":" + templateId + ":" + Date.now();
    if (this.dedup.isDuplicate(nid)) {
      return { status: "duplicate", notificationId: nid };
    }
    const prefs = this.preferences.get(userId) || {};
    const results = [];
    for (const channel of channels) {
      if (prefs[channel] === false) {
        results.push({ channel, status: "opted_out" });
        continue;
      }
      if (priority !== "critical" && this._isQuietHours(prefs)) {
        results.push({ channel, status: "quiet_hours_deferred" });
        continue;
      }
      if (priority !== "critical" &&
          this._getRecentCount(userId) >= (prefs.frequencyCap || 10)) {
        results.push({ channel, status: "frequency_capped" });
        continue;
      }
      let rendered;
      try {
        rendered = this.renderer.render(templateId, channel, "en", variables);
      } catch (err) {
        results.push({ channel, status: "template_error", error: err.message });
        continue;
      }
      this.dispatcher.enqueue({
        notificationId: nid,
        userId,
        channel,
        priority: priority || "normal",
        content: rendered,
      });
      results.push({ channel, status: "queued", priority: priority || "normal" });
    }
    this.dedup.markProcessed(nid, results);
    return { notificationId: nid, results };
  }

  processNext() {
    const item = this.dispatcher.dequeue();
    if (!item) return null;
    const { priority, notification } = item;
    const provider = this.providers.get(notification.channel);
    let deliveryResult;
    if (provider) {
      try {
        deliveryResult = provider(notification);
      } catch (err) {
        deliveryResult = { status: "failed", error: err.message };
      }
    } else {
      deliveryResult = { status: "no_provider" };
    }
    this.deliveryLog.push({
      userId: notification.userId,
      channel: notification.channel,
      status: deliveryResult.status,
      timestamp: Date.now(),
    });
    this.dispatcher.complete(priority);
    return { notification: notification.notificationId, ...deliveryResult };
  }
}

// --- Demo ---
const router = new NotificationRouter();
router.renderer.register("order_confirmed", "push", "en",
  "Order {{orderId}} Confirmed",
  "Hi {{userName}}, your order {{orderId}} for {{total}} is confirmed!");
router.renderer.register("order_confirmed", "email", "en",
  "Order {{orderId}} Confirmed",
  "Dear {{userName}}, your order {{orderId}} totaling {{total}} has been confirmed.");
router.setUserPreferences("user1", { push: true, email: true, sms: false });
router.registerProvider("push", (n) => ({ status: "delivered", provider: "FCM" }));
router.registerProvider("email", (n) => ({ status: "sent", provider: "SendGrid" }));

const result = router.send({
  userId: "user1", templateId: "order_confirmed",
  channels: ["push", "email", "sms"], priority: "high",
  variables: { orderId: "ORD-789", userName: "Jay", total: "$49.99" },
  idempotencyKey: "order-ORD-789",
});
console.log("Send result:", JSON.stringify(result, null, 2));
console.log("Process 1:", router.processNext());
console.log("Process 2:", router.processNext());
console.log("Duplicate check:", router.send({
  userId: "user1", templateId: "order_confirmed",
  channels: ["push"], priority: "high", variables: {},
  idempotencyKey: "order-ORD-789",
}));`,

    jsCode: `// =============================================
// Notification Service - Provider Adapters & Retry Logic
// =============================================

// --- Circuit Breaker for Provider Adapters ---
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
  }

  canExecute() {
    if (this.state === "CLOSED") return true;
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN allows one request through
  }

  recordSuccess() {
    if (this.state === "HALF_OPEN") {
      this.state = "CLOSED";
      this.failureCount = 0;
    }
    this.successCount++;
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return { name: this.name, state: this.state, failures: this.failureCount };
  }
}

// --- Provider Adapter with Retry + Circuit Breaker ---
class ProviderAdapter {
  constructor(name, sendFn, options = {}) {
    this.name = name;
    this.sendFn = sendFn;
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.circuitBreaker = new CircuitBreaker(name, options);
    this.rateLimiter = { tokens: options.rateLimit || 100, lastRefill: Date.now(),
      rate: options.rateLimit || 100 };
  }

  _refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.rateLimiter.lastRefill) / 1000;
    this.rateLimiter.tokens = Math.min(
      this.rateLimiter.rate,
      this.rateLimiter.tokens + elapsed * this.rateLimiter.rate
    );
    this.rateLimiter.lastRefill = now;
  }

  async send(notification) {
    if (!this.circuitBreaker.canExecute()) {
      return { status: "circuit_open", provider: this.name };
    }
    this._refillTokens();
    if (this.rateLimiter.tokens < 1) {
      return { status: "rate_limited", provider: this.name, retryAfter: 1 };
    }
    this.rateLimiter.tokens--;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.sendFn(notification);
        this.circuitBreaker.recordSuccess();
        return { status: "sent", provider: this.name, attempt: attempt + 1, ...result };
      } catch (err) {
        this.circuitBreaker.recordFailure();
        if (err.permanent) {
          return { status: "permanent_failure", provider: this.name, error: err.message };
        }
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt) *
            (0.5 + Math.random() * 0.5);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    return { status: "max_retries_exceeded", provider: this.name };
  }
}

// --- Multi-Channel Dispatcher with Fallback ---
class MultiChannelDispatcher {
  constructor() {
    this.channels = new Map();
  }

  registerChannel(channel, primaryAdapter, fallbackAdapter) {
    this.channels.set(channel, { primary: primaryAdapter, fallback: fallbackAdapter });
  }

  async dispatch(notification) {
    const channel = this.channels.get(notification.channel);
    if (!channel) return { status: "unknown_channel" };

    let result = await channel.primary.send(notification);
    if (result.status === "sent") return result;

    if (channel.fallback) {
      console.log("Primary failed for " + notification.channel +
        ", trying fallback. Reason: " + result.status);
      result = await channel.fallback.send(notification);
      if (result.status === "sent") return { ...result, usedFallback: true };
    }

    return { status: "all_providers_failed", lastResult: result };
  }
}

// --- Scheduled Notification Manager ---
class ScheduledNotificationManager {
  constructor(dispatchFn) {
    this.scheduled = [];
    this.dispatchFn = dispatchFn;
    this.timers = new Map();
  }

  schedule(notification, sendAt) {
    const id = "sched_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const entry = { id, notification, sendAt, status: "scheduled" };
    this.scheduled.push(entry);
    const delay = Math.max(0, sendAt - Date.now());
    const timer = setTimeout(() => {
      entry.status = "dispatched";
      this.dispatchFn(notification);
    }, delay);
    this.timers.set(id, timer);
    return { scheduleId: id, sendAt: new Date(sendAt).toISOString() };
  }

  cancel(scheduleId) {
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
      const entry = this.scheduled.find((s) => s.id === scheduleId);
      if (entry) entry.status = "cancelled";
      return { status: "cancelled" };
    }
    return { status: "not_found" };
  }

  getScheduled() {
    return this.scheduled.filter((s) => s.status === "scheduled").map((s) => ({
      id: s.id,
      sendAt: new Date(s.sendAt).toISOString(),
      channel: s.notification.channel,
    }));
  }
}

// --- Demo ---
async function demo() {
  let callCount = 0;
  const fcmAdapter = new ProviderAdapter("FCM", async (n) => {
    callCount++;
    if (callCount <= 2) throw { message: "Timeout", permanent: false };
    return { messageId: "fcm_" + Date.now() };
  }, { maxRetries: 3, baseDelay: 100 });

  const apnsAdapter = new ProviderAdapter("APNs", async (n) => {
    return { messageId: "apns_" + Date.now() };
  }, { maxRetries: 2, baseDelay: 100 });

  const dispatcher = new MultiChannelDispatcher();
  dispatcher.registerChannel("push", fcmAdapter, apnsAdapter);

  console.log("=== Dispatch with retry (FCM fails twice, then succeeds) ===");
  const r1 = await dispatcher.dispatch({
    channel: "push", userId: "user1",
    content: { title: "Order Confirmed", body: "Your order is ready!" },
  });
  console.log("Result:", JSON.stringify(r1, null, 2));

  console.log("\\n=== Circuit Breaker State ===");
  console.log("FCM:", fcmAdapter.circuitBreaker.getState());

  console.log("\\n=== Scheduled Notification ===");
  const scheduler = new ScheduledNotificationManager((n) => {
    console.log("Scheduled notification dispatched:", n.channel);
  });
  const s1 = scheduler.schedule(
    { channel: "email", userId: "user1", content: { subject: "Reminder" } },
    Date.now() + 2000
  );
  console.log("Scheduled:", s1);
  console.log("Pending:", scheduler.getScheduled());
}

demo();`,

    explanation: `SCALING ANALYSIS:

HORIZONTAL SCALING:
- API servers are stateless, scale horizontally behind a load balancer
- Kafka consumers (workers) scale by adding more instances to the consumer group (up to partition count)
- Each channel has independent worker pools: scale push workers and email workers independently
- Kafka topics partitioned by priority: 8 partitions for critical, 16 for high, 32 for normal
- Template and preference services are read-heavy, cache aggressively in Redis

BOTTLENECK IDENTIFICATION:
1. Third-party provider rate limits: FCM allows ~1000 messages/sec per project, SendGrid varies by plan
   Mitigation: Provider adapter with rate limiter, multiple provider accounts, request batching
2. Kafka consumer lag: If workers cannot keep up with message production rate
   Mitigation: Monitor consumer lag, auto-scale worker count, separate topic per priority
3. Database writes for delivery tracking: 10M writes/day = ~116/sec (easily handled by PostgreSQL)
   At higher scale: use time-series DB (TimescaleDB) or batch writes
4. Redis for idempotency: 10M lookups/day = ~116/sec (negligible for Redis)

FAILURE MODES:
1. Provider outage (FCM down): Circuit breaker opens after 5 failures, traffic routes to fallback provider (APNs). If all providers down, messages stay in Kafka with consumer lag growing. When provider recovers, messages are processed from the backlog.
2. Kafka broker failure: Kafka replication factor 3 ensures no message loss. Producers retry on send failure. Consumer offsets stored in Kafka's internal topic.
3. Worker crash: Kafka consumer group rebalances partitions to surviving workers. Uncommitted messages are reprocessed (idempotent handler prevents duplicates).
4. Preference service unavailable: Use cached preferences (stale for up to 30 minutes). Default to "send on all channels" for critical notifications.

MONITORING STRATEGY:
- End-to-end delivery latency per priority per channel (Critical: alert if p99 > 5s)
- Kafka consumer lag per topic (Alert if lag > 10K messages for critical topic)
- Provider success/failure rates per provider (Alert if failure rate > 5%)
- Circuit breaker state changes (Alert on any OPEN transition)
- Duplicate detection rate (High rate may indicate processing issues)
- User complaint rate (bounces, unsubscribes) per template

TRADE-OFFS:

1. AT-LEAST-ONCE vs EXACTLY-ONCE DELIVERY:
   At-least-once: Simple, just retry on failure. User might get duplicates.
   Exactly-once: Requires distributed transactions or idempotent processing. Complex but better UX.
   Decision: At-least-once with idempotent handler (check notification ID before processing). This gives effective exactly-once semantics without distributed transaction overhead.

2. PUSH vs PULL FOR WORKERS:
   Push (Kafka assigns messages to consumers): Simple, automatic load balancing.
   Pull (workers request messages): Workers control their own pace, better for rate-limited providers.
   Decision: Kafka's pull-based consumer model naturally handles this. Workers consume at their own pace.

3. SINGLE QUEUE vs PRIORITY QUEUES:
   Single queue: Simpler infrastructure, but critical OTPs delayed behind marketing blasts.
   Separate queues per priority: More Kafka topics to manage, but guaranteed SLA per priority level.
   Decision: Separate topics per priority with dedicated worker pools. Critical path must never be affected by normal traffic volume.

4. SYNCHRONOUS vs ASYNCHRONOUS DELIVERY:
   Synchronous: API waits for provider delivery confirmation. High latency, but caller knows delivery status.
   Asynchronous: API enqueues and returns immediately. Low latency, but caller must poll for status.
   Decision: Asynchronous for all channels. Provide webhook or polling endpoint for delivery status. Exception: OTP via SMS may warrant synchronous for critical login flows.

5. TEMPLATE RENDERING - SERVER vs CLIENT:
   Server-side rendering: Full control over content, consistent across channels, supports i18n.
   Client-side rendering: Flexible, dynamic content, but inconsistent across platforms.
   Decision: Server-side rendering with pre-compiled templates for performance. Support variable substitution with escaping to prevent injection.`,

    timeComplexity: `PERFORMANCE CHARACTERISTICS:
- API request handling (enqueue): ~5ms p50, ~20ms p99 (validate + Redis idempotency check + Kafka publish)
- Critical notification end-to-end: <5 seconds (dedicated workers, no queue backlog)
- High priority notification end-to-end: <30 seconds
- Normal priority notification end-to-end: <5 minutes (may have queue backlog)
- Template rendering: <1ms (pre-compiled templates with variable substitution)
- Preference lookup (Redis cache hit): <1ms
- Provider API call (push/email/SMS): 50-500ms depending on provider
- Kafka publish latency: <5ms (acknowledged write to partition leader)
- Kafka consumer processing: throughput of 5,000-10,000 messages/sec per worker
- Peak throughput: 100K notifications/min = 1,667/sec (achievable with 4 workers per channel)`,

    spaceComplexity: `STORAGE & MEMORY REQUIREMENTS:
- Kafka storage: 10M messages/day * 1 KB * 7 days retention = 70 GB
  With 3x replication: 210 GB across the Kafka cluster
- Notification database (PostgreSQL): 10M rows/day * 500B * 90 days = 450 GB
  With indexes: ~600 GB total
- Delivery tracking (time-series): 50M events/day * 200B * 90 days = 900 GB
  With columnar compression: ~200 GB
- Redis (idempotency + preferences + templates):
  Idempotency: 10M keys * 32B = 320 MB (24h TTL, auto-expires)
  Preferences: 10M users * 100B = 1 GB
  Templates: 1000 templates * 5 KB = 5 MB
  Total Redis: ~1.5 GB (single instance)
- Worker memory: ~256 MB per worker instance
  With 4 workers per channel * 4 channels = 16 workers * 256 MB = 4 GB total
- Template cache per worker: ~50 MB (all templates loaded in memory)
- Total infrastructure: API servers (2-4) + Kafka cluster (3 brokers) + PostgreSQL + Redis + 16 workers`,

    hints: [
      `Priority isolation is the most critical design decision. Never put OTP/2FA notifications in the same queue as marketing emails. Use separate Kafka topics per priority level with dedicated consumer groups. Reserve minimum worker capacity for critical notifications that is never borrowed by lower priorities. In the interview, calculate: if a marketing blast sends 1M emails and each takes 100ms to process, a single-queue worker pool of 10 would take 10,000 seconds (2.8 hours) to clear - an OTP arriving during this blast would be delayed by hours.`,
      `Idempotent delivery is essential for at-least-once systems. Generate a deterministic notification ID from the event (e.g., hash of user_id + event_type + event_id). Before processing, check if this ID exists in Redis (O(1) lookup). If it exists, skip processing. If not, process and store the ID with a 24h TTL. This gives you effective exactly-once delivery without distributed transactions. In the interview, explain the window: 24h TTL means a crash-and-replay within 24h is deduplicated, but a replay after 24h could cause a duplicate (acceptable trade-off).`,
      `The circuit breaker pattern is essential for provider adapters. Without it, if FCM goes down, all push notification workers block on timeouts, creating a cascading failure. Implement three states: CLOSED (normal), OPEN (all calls fail-fast), HALF-OPEN (allow one test call). Transition from CLOSED to OPEN after 5 failures in 30 seconds. Transition from OPEN to HALF-OPEN after a 30-second cooldown. One successful call in HALF-OPEN returns to CLOSED. Always have a fallback provider configured.`,
      `Template rendering with variable substitution seems simple but has important security implications. Always escape user-provided variables to prevent XSS in email HTML templates and injection in SMS messages. Use a template engine that auto-escapes by default. Support i18n by storing templates per locale with a fallback chain: user's locale -> user's language -> English. Pre-compile templates at startup for sub-millisecond rendering.`,
      `Frequency capping prevents notification fatigue. Track the number of notifications sent to each user in the last hour/day using Redis sorted sets (ZADD with timestamp score, ZCOUNT for the window). If the count exceeds the cap (e.g., 10/hour for normal priority), silently drop the notification. Critical notifications (OTP, security alerts) always bypass frequency caps. This is a feature that separates a production notification system from a toy implementation.`,
      `Provider rate limiting requires careful design. SMS providers like Twilio typically allow 100-400 messages/second. Email providers like SendGrid have tier-based limits. Implement a token bucket per provider that matches their rate limit. When the bucket is empty, buffer messages in a local queue and drain at the provider's rate. This prevents 429 errors and wasted API calls. Batch sending (SendGrid supports up to 1000 recipients per API call) dramatically improves throughput for campaigns.`,
      `Webhook handling for delivery tracking is often overlooked but critical. Email providers send webhooks for delivered/bounced/opened/clicked events. You need an idempotent webhook endpoint that processes these events and updates notification status. Webhooks can arrive out of order (opened before delivered) or be duplicated. Use a state machine with valid transitions: pending -> sent -> delivered -> opened -> clicked, and ignore invalid transitions. Store the full webhook payload for debugging.`,
      `Common interview pitfall: not discussing what happens when notifications fail permanently. If a device token is invalid (user uninstalled the app), you must remove it from the device registry to prevent repeated failures. If an email bounces (hard bounce), mark the email as invalid and stop sending. Implement a dead letter queue for notifications that fail after all retries. Alert the operations team if the dead letter queue grows beyond a threshold, indicating a systemic issue.`
    ],
  },
  {
    id: 9004,
    description: `Design a Chat System (WhatsApp)

FUNCTIONAL REQUIREMENTS:
- 1:1 messaging between users with real-time delivery (<500ms)
- Group messaging supporting up to 256 members (standard) and 1024 (broadcast lists)
- Online/offline/last-seen status for contacts
- Read receipts (single check: sent, double check: delivered, blue: read)
- Typing indicators for 1:1 chats
- Message history sync across devices (phone, web, desktop)
- Media sharing: images, videos, documents (up to 100MB per file)
- Push notifications for offline users
- End-to-end encryption (Signal Protocol)

NON-FUNCTIONAL REQUIREMENTS:
- Ultra-low latency: messages delivered in <500ms for online users
- Massive scale: 2 billion users, 100 billion messages/day
- Reliability: zero message loss (at-least-once delivery, idempotent processing)
- Availability: 99.99% uptime (chat is a critical communication channel)
- Ordered delivery: messages within a conversation maintain order

CAPACITY ESTIMATION:
- Users: 2 billion registered, 500 million daily active (DAU)
- Messages per day: 100 billion (average 200 messages per active user)
- QPS: 100B / 86400 = ~1.16 million messages/sec average
- Peak QPS: 3x average = ~3.5 million messages/sec
- Message size: average 100 bytes text, max 1 KB with metadata
- Daily storage (text): 100B * 100B = 10 TB/day
- Daily storage (media): assume 5% of messages have media, avg 500KB
  5B * 500KB = 2.5 PB/day (!)
- Concurrent WebSocket connections: 500M DAU * 50% online at any time = 250M connections
- Each connection ~10 KB memory: 250M * 10 KB = 2.5 TB RAM (need ~25,000 servers at 100GB each)
- Bandwidth: 3.5M messages/sec * 200B = 700 MB/sec = 5.6 Gbps

DATABASE SCHEMA:
\\\`\\\`\\\`
messages:
  message_id      BIGINT PRIMARY KEY (Snowflake ID - encodes timestamp)
  conversation_id BIGINT INDEX (hash of sorted user IDs for 1:1, group ID for groups)
  sender_id       BIGINT
  content         BLOB (encrypted)
  content_type    ENUM('text','image','video','document','audio')
  media_url       VARCHAR(500)
  status          ENUM('sent','delivered','read')
  created_at      TIMESTAMP
  PARTITION KEY: conversation_id (co-locate messages in same conversation)

conversations:
  conversation_id BIGINT PRIMARY KEY
  type            ENUM('direct','group')
  participants    BIGINT[] (array of user IDs)
  last_message_id BIGINT
  updated_at      TIMESTAMP

user_status:
  user_id         BIGINT PRIMARY KEY
  status          ENUM('online','offline')
  last_seen       TIMESTAMP
  server_id       VARCHAR(64)  (which WebSocket server they are connected to)

devices:
  user_id         BIGINT
  device_id       VARCHAR(64)
  platform        ENUM('ios','android','web','desktop')
  push_token      VARCHAR(256)
  last_active     TIMESTAMP
  PRIMARY KEY (user_id, device_id)
\\\`\\\`\\\``,

    examples: `MESSAGE DELIVERY WALKTHROUGH:

Scenario: Alice (online, on Server A) sends "Hello!" to Bob (online, on Server C)

Step 1 - Alice's client sends message via WebSocket:
  {
    "type": "message",
    "message_id": "msg_7891234567890",
    "conversation_id": "conv_alice_bob",
    "recipient_id": "bob",
    "content": "encrypted_base64_content...",
    "content_type": "text",
    "client_seq": 42
  }

Step 2 - Server A (Alice's WebSocket server) processes:
  a. Validate message (auth, rate limit, size check)
  b. Assign server timestamp and message_id (if client didn't provide one)
  c. Persist message to messages table (Cassandra, partitioned by conversation_id)
  d. Send ACK back to Alice: { type: "ack", message_id: "msg_789...", status: "sent", server_seq: 1001 }
  e. Alice's client shows single check mark (sent)

Step 3 - Route to Bob's server:
  a. Query connection manager (Redis): "Which server is Bob connected to?"
  b. Redis returns: bob -> server_c
  c. Server A publishes to internal message bus: { to: "server_c", message: {...} }
  d. Message routed via Kafka topic "chat.messages.server_c"

Step 4 - Server C delivers to Bob:
  a. Server C consumes message from Kafka
  b. Finds Bob's WebSocket connection in local connection map
  c. Sends message to Bob's client via WebSocket
  d. Bob's client sends delivery ACK: { type: "ack", message_id: "msg_789...", status: "delivered" }
  e. Server C forwards delivery receipt back to Server A -> Alice
  f. Alice's client shows double check marks (delivered)

Step 5 - Bob reads the message:
  a. Bob's client sends: { type: "read", message_id: "msg_789...", conversation_id: "conv_alice_bob" }
  b. Server C forwards to Server A -> Alice
  c. Alice's client shows blue check marks (read)

OFFLINE SCENARIO: If Bob is offline at Step 3:
  a. Redis returns: bob -> null (not connected)
  b. Message is stored in Bob's offline queue (Cassandra table: pending_messages)
  c. Push notification sent via FCM/APNs: "Alice: Hello!"
  d. When Bob comes online (connects WebSocket), his client sends: { type: "sync", last_seq: 980 }
  e. Server sends all messages with server_seq > 980 for Bob's conversations

GROUP MESSAGE FANOUT:

Scenario: Alice sends a message to a group of 50 members.

For small groups (< 100 members) - Fan-out on write:
  1. Alice sends message to Server A
  2. Server A persists one copy in messages table (partitioned by group conversation_id)
  3. Server A queries group membership: [bob, charlie, dave, ..., 49 others]
  4. For each member:
     a. Look up their connection server in Redis
     b. If online: route message to their server for WebSocket delivery
     c. If offline: add to their pending queue + send push notification
  5. Total writes: 1 (message) + 50 (delivery routing) = 51 operations

MESSAGE SYNC PROTOCOL:
  Each conversation has a monotonically increasing sequence number.
  Client tracks: { conversation_id -> last_received_seq }

  On reconnection:
  Client: { type: "sync", conversations: { "conv_1": 450, "conv_2": 1200, "conv_3": 89 } }
  Server: sends all messages with seq > client's seq for each conversation
  If gap is too large (> 1000 messages): paginate, send first 50, client fetches more on scroll`,

    intuition: `A chat system is a real-time message routing network. At its core, it solves one problem: given a message from User A, deliver it to User B's device in under 500 milliseconds. Everything else (groups, read receipts, media, sync) is built on top of this fundamental routing capability.

THE KEY INSIGHT: Chat is a STATEFUL system in a world of stateless architectures. Each user maintains a persistent WebSocket connection to a specific server. This creates two fundamental challenges:
1. CONNECTION ROUTING: When Alice sends a message to Bob, how does Alice's server know WHICH server Bob is connected to?
2. FAILOVER: When a WebSocket server crashes, how do you reconnect 100K users without losing messages?

THE CONNECTION MANAGER PATTERN:
Think of it like a phone switchboard in the 1950s. When Bob connects to Server C, an entry is made in a global directory (Redis): "Bob is on Server C." When Alice wants to reach Bob, her server looks up the directory, finds "Server C," and routes the message there. Redis is perfect for this because:
- Sub-millisecond lookups
- Can handle millions of connection entries
- SET/GET is atomic
- TTL-based cleanup for crashed connections

WHY WEBSOCKETS? HTTP is request-response: the server cannot push data to the client without the client asking. For chat, we need the server to push messages instantly when they arrive. WebSocket provides a persistent, bidirectional TCP connection. Once established, either side can send data at any time with <1ms overhead (vs ~100ms for HTTP request overhead).

THE STORE-AND-FORWARD PRINCIPLE:
This is the most important reliability pattern in messaging. NEVER assume the recipient is online. Always:
1. STORE the message to durable storage first
2. FORWARD to the recipient if they are online
3. If offline, the message waits in storage until the recipient connects and syncs

This is why chat systems persist EVERY message to the database BEFORE attempting delivery. If the server crashes between storage and delivery, the message is safe and will be delivered on reconnection.

THE SEQUENCE NUMBER PROTOCOL:
Each conversation maintains a monotonically increasing sequence number. When a message is stored, it gets the next sequence number for that conversation. The client tracks the last sequence number it received per conversation. On reconnection, the client sends its last known sequence numbers, and the server sends all messages with higher sequence numbers. This is identical to how TCP works - and for the same reason: it provides reliable, ordered delivery over an unreliable network.

ANALOGY - THE POST OFFICE:
- WebSocket servers are local post offices (where you drop off and receive mail)
- Redis connection manager is the address directory (which post office serves each person)
- Kafka is the inter-office mail system (routes messages between post offices)
- Cassandra is the archive (stores all messages permanently)
- Offline queue is the mailbox (holds messages until you pick them up)

WHY FAN-OUT ON WRITE FOR SMALL GROUPS?
For a group of 50 members, when a message is sent, the server immediately routes it to all 50 recipients' servers. This is fast for reads (each user just receives the message) but expensive for writes (50 routing operations). For very large groups (10K+ members like a broadcast channel), fan-out on write would mean 10K routing operations per message - too slow. Instead, large groups use fan-out on read: store one message, and when each member opens the group, they fetch recent messages. WhatsApp caps groups at 1024 specifically to keep fan-out on write practical.`,

    approach: `COMPLETE ARCHITECTURE:

HIGH-LEVEL COMPONENTS:
1. WebSocket Gateway (fleet of servers, each handling ~100K connections)
2. Connection Manager (Redis Cluster - maps user_id to WebSocket server)
3. Message Service (processes, validates, persists, routes messages)
4. Group Service (manages group membership, handles group fanout)
5. Presence Service (online/offline status, last seen, typing indicators)
6. Sync Service (handles reconnection and message history sync)
7. Media Service (upload, compression, thumbnail generation, CDN)
8. Push Notification Service (delivers notifications to offline users)
9. Message Storage (Cassandra - partitioned by conversation_id)
10. Kafka (message bus between WebSocket servers and services)

WEBSOCKET CONNECTION LIFECYCLE:
1. Client connects to WebSocket Gateway via TLS
2. Client sends auth token (JWT) for authentication
3. Gateway validates token, registers connection in local connection map
4. Gateway publishes to Redis: SET user:{user_id} = {server_id, connection_time} with TTL=5min
5. Gateway starts heartbeat: client pings every 30 seconds, gateway renews Redis TTL
6. If heartbeat missed for 2 minutes: mark user offline, close connection, remove Redis entry
7. On disconnect: remove from local map, update Redis, publish offline status event

MESSAGE ROUTING PATH:
1. Sender's client -> Sender's WebSocket Server (via WebSocket)
2. Sender's Server -> Message Service (persist to Cassandra)
3. Message Service -> Sender's Server: send ACK (single check)
4. Message Service -> Connection Manager (Redis): lookup recipient's server
5. If online: Message Service -> Recipient's Server (via Kafka) -> Recipient's Client (via WebSocket)
6. Recipient's Client -> Recipient's Server: delivery ACK (double check)
7. Recipient's Server -> Sender's Server -> Sender's Client: delivery receipt
8. If offline: Message Service -> Offline Queue (Cassandra) + Push Notification Service

GROUP MESSAGE HANDLING:
1. Sender sends message to group conversation_id
2. Message Service persists ONE copy of the message
3. Group Service fetches membership list from cache (Redis) or database
4. For each member (excluding sender):
   a. Check connection manager: online or offline?
   b. Online: route message to their WebSocket server
   c. Offline: queue for sync + optional push notification
5. Delivery receipts are aggregated per member (not fan-out back to all members)

PRESENCE SERVICE:
- Online/offline status: event-driven via WebSocket connect/disconnect
- Last seen: updated on disconnect or when user switches to background
- Typing indicators: ephemeral events, NOT persisted, only delivered if recipient is online
  - Client sends: { type: "typing", conversation_id: "..." }
  - Server routes to the other participant(s) via their WebSocket
  - Client-side: show "typing..." for 3 seconds, reset on new typing event
  - Typing indicators for groups: only show to users who have the chat open (client tells server)

MEDIA HANDLING:
1. Client requests a pre-signed upload URL from Media Service
2. Client uploads media directly to object storage (S3) via the pre-signed URL
3. Client sends a message with media_url pointing to the uploaded object
4. Media Service asynchronously generates thumbnails and compressed versions
5. Recipient's client downloads thumbnail first, then full media on tap
6. CDN caches popular media for faster delivery
7. Media storage lifecycle: hot (S3 Standard) -> warm (S3 IA after 30 days) -> cold (Glacier after 1 year)

DATABASE DESIGN (Cassandra):
- messages table: partition key = conversation_id, clustering key = message_id (TimeUUID for ordering)
  This co-locates all messages in a conversation on the same partition for efficient sequential reads
- Each partition holds ~10K messages before splitting (good for most conversations)
- For very active groups, use bucketed partitions: partition key = (conversation_id, year_month)
- offline_messages table: partition key = user_id, clustering key = message_id
  When user syncs, read all rows for their user_id, deliver, then delete

MULTI-DEVICE SYNC:
- Each device has a device_id and tracks its own last_synced_seq per conversation
- When a message is sent from Device A, other devices of the same user receive it too
- On device reconnection: sync protocol fetches messages from the device's last known seq
- Conflict resolution: if two devices send to the same conversation simultaneously, message_ids (Snowflake) ensure global ordering`,

    code: `// =============================================
// Chat System - Core Components Implementation
// =============================================

// --- WebSocket Message Router ---
class WebSocketRouter {
  constructor() {
    this.connections = new Map(); // userId -> { ws, server, connectedAt }
    this.connectionManager = new Map(); // userId -> serverId (simulates Redis)
    this.serverId = "server_" + Math.random().toString(36).substring(2, 6);
    this.messageStore = new Map(); // conversationId -> [messages]
    this.offlineQueue = new Map(); // userId -> [messages]
    this.seqCounters = new Map(); // conversationId -> lastSeq
    this.listeners = new Map(); // serverId -> handler (simulates inter-server routing)
  }

  connect(userId, wsConnection) {
    this.connections.set(userId, {
      ws: wsConnection,
      server: this.serverId,
      connectedAt: Date.now(),
    });
    this.connectionManager.set(userId, this.serverId);
    this._deliverOfflineMessages(userId);
    return { status: "connected", server: this.serverId };
  }

  disconnect(userId) {
    this.connections.delete(userId);
    this.connectionManager.delete(userId);
    return { status: "disconnected", lastSeen: Date.now() };
  }

  _nextSeq(conversationId) {
    const seq = (this.seqCounters.get(conversationId) || 0) + 1;
    this.seqCounters.set(conversationId, seq);
    return seq;
  }

  _persistMessage(message) {
    const convId = message.conversationId;
    if (!this.messageStore.has(convId)) this.messageStore.set(convId, []);
    this.messageStore.get(convId).push(message);
  }

  sendMessage(senderId, recipientId, content, contentType = "text") {
    const conversationId = [senderId, recipientId].sort().join("_");
    const seq = this._nextSeq(conversationId);
    const message = {
      messageId: "msg_" + Date.now() + "_" + seq,
      conversationId,
      senderId,
      recipientId,
      content,
      contentType,
      seq,
      timestamp: Date.now(),
      status: "sent",
    };
    this._persistMessage(message);
    const senderConn = this.connections.get(senderId);
    if (senderConn && senderConn.ws) {
      senderConn.ws({ type: "ack", messageId: message.messageId, status: "sent", seq });
    }
    const recipientServer = this.connectionManager.get(recipientId);
    if (recipientServer) {
      const recipientConn = this.connections.get(recipientId);
      if (recipientConn && recipientConn.ws) {
        recipientConn.ws({ type: "message", ...message });
        message.status = "delivered";
        if (senderConn && senderConn.ws) {
          senderConn.ws({ type: "receipt", messageId: message.messageId, status: "delivered" });
        }
      }
    } else {
      if (!this.offlineQueue.has(recipientId)) this.offlineQueue.set(recipientId, []);
      this.offlineQueue.get(recipientId).push(message);
    }
    return message;
  }

  _deliverOfflineMessages(userId) {
    const pending = this.offlineQueue.get(userId) || [];
    const conn = this.connections.get(userId);
    if (conn && conn.ws && pending.length > 0) {
      for (const msg of pending) {
        conn.ws({ type: "message", ...msg });
        msg.status = "delivered";
      }
      this.offlineQueue.delete(userId);
    }
    return pending.length;
  }

  markRead(userId, conversationId, upToMessageId) {
    const messages = this.messageStore.get(conversationId) || [];
    let found = false;
    for (const msg of messages) {
      if (msg.recipientId === userId && msg.status !== "read") {
        msg.status = "read";
        const senderConn = this.connections.get(msg.senderId);
        if (senderConn && senderConn.ws) {
          senderConn.ws({ type: "receipt", messageId: msg.messageId, status: "read" });
        }
      }
      if (msg.messageId === upToMessageId) { found = true; break; }
    }
    return { marked: found };
  }

  syncMessages(userId, lastSeqs) {
    const result = {};
    for (const [convId, lastSeq] of Object.entries(lastSeqs)) {
      const messages = this.messageStore.get(convId) || [];
      const missed = messages.filter((m) => m.seq > lastSeq);
      if (missed.length > 0) {
        result[convId] = missed.length > 50 ? missed.slice(0, 50) : missed;
      }
    }
    return result;
  }
}

// --- Group Fanout Handler ---
class GroupFanoutHandler {
  constructor(router) {
    this.router = router;
    this.groups = new Map(); // groupId -> { members, name, createdBy }
  }

  createGroup(groupId, name, creatorId, memberIds) {
    this.groups.set(groupId, {
      name,
      createdBy: creatorId,
      members: new Set([creatorId, ...memberIds]),
      createdAt: Date.now(),
    });
    return { groupId, memberCount: memberIds.length + 1 };
  }

  sendGroupMessage(groupId, senderId, content) {
    const group = this.groups.get(groupId);
    if (!group) return { error: "Group not found" };
    if (!group.members.has(senderId)) return { error: "Not a member" };
    const seq = this.router._nextSeq(groupId);
    const message = {
      messageId: "gmsg_" + Date.now() + "_" + seq,
      conversationId: groupId,
      senderId,
      content,
      contentType: "text",
      seq,
      timestamp: Date.now(),
      isGroup: true,
      groupName: group.name,
    };
    this.router._persistMessage(message);
    const deliveryResults = [];
    for (const memberId of group.members) {
      if (memberId === senderId) continue;
      const memberServer = this.router.connectionManager.get(memberId);
      if (memberServer) {
        const conn = this.router.connections.get(memberId);
        if (conn && conn.ws) {
          conn.ws({ type: "group_message", ...message });
          deliveryResults.push({ memberId, status: "delivered" });
        }
      } else {
        if (!this.router.offlineQueue.has(memberId)) {
          this.router.offlineQueue.set(memberId, []);
        }
        this.router.offlineQueue.get(memberId).push(message);
        deliveryResults.push({ memberId, status: "queued_offline" });
      }
    }
    return { messageId: message.messageId, deliveryResults };
  }
}

// --- Demo ---
const router = new WebSocketRouter();
const aliceMessages = [];
const bobMessages = [];
router.connect("alice", (msg) => aliceMessages.push(msg));
router.connect("bob", (msg) => bobMessages.push(msg));

console.log("=== 1:1 Messaging ===");
const m1 = router.sendMessage("alice", "bob", "Hey Bob!");
console.log("Sent:", m1.messageId, "Status:", m1.status);
console.log("Alice received:", aliceMessages.map((m) => m.type + ":" + m.status));
console.log("Bob received:", bobMessages.length, "messages");

router.markRead("bob", "alice_bob", m1.messageId);
console.log("After read:", aliceMessages[aliceMessages.length - 1]);

console.log("\\n=== Offline Messages ===");
router.disconnect("bob");
router.sendMessage("alice", "bob", "Are you there?");
router.sendMessage("alice", "bob", "Hello?");
console.log("Offline queue:", router.offlineQueue.get("bob")?.length, "messages");
const bobMessages2 = [];
router.connect("bob", (msg) => bobMessages2.push(msg));
console.log("Bob received on reconnect:", bobMessages2.length, "messages");

console.log("\\n=== Group Messaging ===");
const groupHandler = new GroupFanoutHandler(router);
groupHandler.createGroup("grp1", "Team Chat", "alice", ["bob", "charlie"]);
router.connect("charlie", (msg) => console.log("Charlie got:", msg.type));
const gm = groupHandler.sendGroupMessage("grp1", "alice", "Team meeting at 3pm");
console.log("Group delivery:", JSON.stringify(gm.deliveryResults));

console.log("\\n=== Message Sync ===");
const synced = router.syncMessages("bob", { "alice_bob": 0 });
console.log("Synced messages:", Object.keys(synced).length, "conversations");`,

    jsCode: `// =============================================
// Chat System - Presence Service & Typing Indicators
// =============================================

// --- Presence Manager ---
class PresenceManager {
  constructor() {
    this.presenceStore = new Map(); // userId -> { status, lastSeen, serverId }
    this.subscribers = new Map(); // userId -> Set of userIds watching their status
    this.heartbeatTimers = new Map();
    this.heartbeatTimeout = 60000; // 60 seconds
    this.statusCallbacks = new Map(); // userId -> callback function
  }

  goOnline(userId, serverId, callback) {
    const prev = this.presenceStore.get(userId);
    this.presenceStore.set(userId, {
      status: "online",
      lastSeen: Date.now(),
      serverId,
    });
    if (callback) this.statusCallbacks.set(userId, callback);
    this._resetHeartbeat(userId);
    if (!prev || prev.status !== "online") {
      this._notifySubscribers(userId, "online");
    }
  }

  goOffline(userId) {
    const entry = this.presenceStore.get(userId);
    if (entry) {
      entry.status = "offline";
      entry.lastSeen = Date.now();
    }
    this.statusCallbacks.delete(userId);
    const timer = this.heartbeatTimers.get(userId);
    if (timer) clearTimeout(timer);
    this.heartbeatTimers.delete(userId);
    this._notifySubscribers(userId, "offline");
  }

  heartbeat(userId) {
    const entry = this.presenceStore.get(userId);
    if (entry) {
      entry.lastSeen = Date.now();
      this._resetHeartbeat(userId);
    }
  }

  _resetHeartbeat(userId) {
    const existing = this.heartbeatTimers.get(userId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      console.log("Heartbeat timeout for:", userId);
      this.goOffline(userId);
    }, this.heartbeatTimeout);
    this.heartbeatTimers.set(userId, timer);
  }

  subscribe(watcherId, targetId) {
    if (!this.subscribers.has(targetId)) {
      this.subscribers.set(targetId, new Set());
    }
    this.subscribers.get(targetId).add(watcherId);
    const target = this.presenceStore.get(targetId);
    return {
      userId: targetId,
      status: target ? target.status : "offline",
      lastSeen: target ? target.lastSeen : null,
    };
  }

  unsubscribe(watcherId, targetId) {
    const subs = this.subscribers.get(targetId);
    if (subs) subs.delete(watcherId);
  }

  _notifySubscribers(userId, newStatus) {
    const subs = this.subscribers.get(userId);
    if (!subs) return;
    for (const watcherId of subs) {
      const callback = this.statusCallbacks.get(watcherId);
      if (callback) {
        callback({
          type: "presence_update",
          userId,
          status: newStatus,
          lastSeen: Date.now(),
        });
      }
    }
  }

  getStatus(userId) {
    const entry = this.presenceStore.get(userId);
    if (!entry) return { status: "offline", lastSeen: null };
    return { status: entry.status, lastSeen: entry.lastSeen };
  }

  getMultipleStatuses(userIds) {
    return userIds.map((id) => ({ userId: id, ...this.getStatus(id) }));
  }
}

// --- Typing Indicator Service ---
class TypingIndicatorService {
  constructor() {
    this.typingState = new Map(); // conversationId:userId -> timer
    this.typingTimeout = 3000; // 3 seconds
    this.deliveryCallbacks = new Map();
  }

  registerCallback(userId, callback) {
    this.deliveryCallbacks.set(userId, callback);
  }

  startTyping(userId, conversationId, recipientIds) {
    const key = conversationId + ":" + userId;
    const existing = this.typingState.get(key);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.typingState.delete(key);
      this._notifyTypingStopped(userId, conversationId, recipientIds);
    }, this.typingTimeout);
    this.typingState.set(key, timer);
    for (const recipientId of recipientIds) {
      const callback = this.deliveryCallbacks.get(recipientId);
      if (callback) {
        callback({
          type: "typing",
          userId,
          conversationId,
          isTyping: true,
        });
      }
    }
  }

  stopTyping(userId, conversationId, recipientIds) {
    const key = conversationId + ":" + userId;
    const timer = this.typingState.get(key);
    if (timer) clearTimeout(timer);
    this.typingState.delete(key);
    this._notifyTypingStopped(userId, conversationId, recipientIds);
  }

  _notifyTypingStopped(userId, conversationId, recipientIds) {
    for (const recipientId of recipientIds) {
      const callback = this.deliveryCallbacks.get(recipientId);
      if (callback) {
        callback({
          type: "typing",
          userId,
          conversationId,
          isTyping: false,
        });
      }
    }
  }

  isTyping(userId, conversationId) {
    return this.typingState.has(conversationId + ":" + userId);
  }
}

// --- Message Sequence Sync Protocol ---
class MessageSyncProtocol {
  constructor() {
    this.messageStore = new Map(); // conversationId -> [messages ordered by seq]
    this.clientState = new Map(); // clientId -> { conversationId -> lastSeq }
  }

  appendMessage(conversationId, message) {
    if (!this.messageStore.has(conversationId)) {
      this.messageStore.set(conversationId, []);
    }
    const messages = this.messageStore.get(conversationId);
    const seq = messages.length + 1;
    messages.push({ ...message, seq });
    return seq;
  }

  registerClient(clientId, conversationSeqs) {
    this.clientState.set(clientId, { ...conversationSeqs });
  }

  sync(clientId, maxPerConversation = 50) {
    const clientSeqs = this.clientState.get(clientId) || {};
    const result = { conversations: {}, totalMissed: 0 };
    for (const [convId, messages] of this.messageStore) {
      const lastSeq = clientSeqs[convId] || 0;
      const missed = messages.filter((m) => m.seq > lastSeq);
      if (missed.length === 0) continue;
      const page = missed.slice(0, maxPerConversation);
      result.conversations[convId] = {
        messages: page,
        hasMore: missed.length > maxPerConversation,
        totalMissed: missed.length,
        latestSeq: messages[messages.length - 1].seq,
      };
      result.totalMissed += missed.length;
    }
    return result;
  }

  acknowledge(clientId, conversationId, seq) {
    if (!this.clientState.has(clientId)) this.clientState.set(clientId, {});
    this.clientState.get(clientId)[conversationId] = seq;
  }
}

// --- Demo ---
console.log("=== Presence Manager ===");
const presence = new PresenceManager();
const aliceUpdates = [];
presence.goOnline("alice", "s1", (e) => aliceUpdates.push(e));
presence.goOnline("bob", "s2", null);
const bobStatus = presence.subscribe("alice", "bob");
console.log("Bob status for Alice:", bobStatus);
presence.goOffline("bob");
console.log("Alice received updates:", aliceUpdates);
console.log("Bob status after offline:", presence.getStatus("bob"));

console.log("\\n=== Typing Indicators ===");
const typing = new TypingIndicatorService();
const bobTypingEvents = [];
typing.registerCallback("bob", (e) => bobTypingEvents.push(e));
typing.startTyping("alice", "conv_alice_bob", ["bob"]);
console.log("Bob sees typing:", bobTypingEvents);
console.log("Alice is typing:", typing.isTyping("alice", "conv_alice_bob"));

console.log("\\n=== Message Sync Protocol ===");
const sync = new MessageSyncProtocol();
sync.appendMessage("conv1", { from: "alice", content: "Hello" });
sync.appendMessage("conv1", { from: "bob", content: "Hi!" });
sync.appendMessage("conv1", { from: "alice", content: "How are you?" });
sync.appendMessage("conv2", { from: "charlie", content: "Meeting at 3" });
sync.registerClient("bob_phone", { conv1: 1, conv2: 0 });
const syncResult = sync.sync("bob_phone");
console.log("Sync result:", JSON.stringify(syncResult, null, 2));
sync.acknowledge("bob_phone", "conv1", 3);
console.log("After ack, sync:", sync.sync("bob_phone"));`,

    explanation: `SCALING ANALYSIS:

HORIZONTAL SCALING:
- WebSocket servers: each handles ~100K concurrent connections. For 250M concurrent users, need ~2,500 WebSocket servers.
- Redis (Connection Manager): clustered, sharded by user_id hash. 250M entries * 100B = 25 GB across the cluster.
- Cassandra (Messages): partitioned by conversation_id. Each partition holds ~10K messages. With 1B conversations, need ~100 nodes (10 TB per node with replication factor 3).
- Kafka (Inter-server routing): partitioned by recipient's server_id. Add partitions as WebSocket servers scale.

BOTTLENECK IDENTIFICATION:
1. WebSocket server memory: 100K connections * 10 KB = 1 GB per server. CPU is the bottleneck for message serialization/deserialization, not memory.
2. Redis connection manager: 250M entries. Even at 3.5M lookups/sec, Redis Cluster with 10 nodes handles this easily (each node handles 350K/sec).
3. Cassandra writes: 1.16M messages/sec. With 100 Cassandra nodes and RF=3, each node handles ~35K writes/sec (within Cassandra's capacity).
4. Group fanout: A 256-member group message requires 255 Redis lookups + 255 message deliveries. Batch the Redis lookups (MGET) and parallelize deliveries.
5. Hot conversations: A celebrity's 1:1 chat or a very active group could overwhelm a single Cassandra partition. Bucket partitions by time (conversation_id, month) to spread the load.

FAILURE MODES:
1. WebSocket server crash: 100K users disconnected simultaneously. Connection Manager TTLs expire (or crash is detected via health check). Users reconnect to different servers and sync missed messages via the sync protocol. Messages already persisted in Cassandra are safe.
2. Redis (Connection Manager) failure: Cannot route messages to online recipients. Fail open: persist messages to offline queue, deliver on next sync. Use Redis Sentinel for auto-failover (<30 seconds).
3. Cassandra node failure: With RF=3, one node failure has no data loss. Read/write consistency level of QUORUM (2 of 3) continues without interruption.
4. Network partition between data centers: Users on each side can still message each other (local WebSocket + local Cassandra replica). Cross-partition messages are queued in Kafka and delivered when partition heals.

MONITORING STRATEGY:
- WebSocket connection count per server (Alert if > 120K, threshold for horizontal scaling)
- Message delivery latency p50/p95/p99 (Alert if p99 > 2 seconds)
- Offline queue depth per user (Alert if any user has > 10K queued messages - potential spam)
- Cassandra read/write latency per partition (Alert if p99 > 50ms)
- Kafka consumer lag per partition (Alert if lag > 100K messages)
- Redis connection manager hit rate (Alert if miss rate > 5% - users not being found)
- Group fanout time per message (Alert if > 500ms for groups of 256 members)

TRADE-OFFS:

1. WEBSOCKET vs LONG POLLING vs SERVER-SENT EVENTS:
   WebSocket: Bidirectional, lowest latency (<10ms), but stateful (connection affinity required).
   Long Polling: Simpler, works through proxies, but higher latency (seconds) and more overhead.
   SSE: Server-to-client only, insufficient for chat (need bidirectional).
   Decision: WebSocket for primary clients. Long polling as fallback for restricted networks.

2. FAN-OUT ON WRITE vs FAN-OUT ON READ FOR GROUPS:
   Write fanout: On message send, push to all members' connections/offline queues. Fast reads.
   Read fanout: Store one copy, each member fetches on open. Slow reads but efficient writes.
   Decision: Write fanout for groups < 256 (WhatsApp's limit). For broadcast lists > 1024, use read fanout.

3. CASSANDRA vs MYSQL FOR MESSAGE STORAGE:
   Cassandra: Excellent write throughput, partition-based access (ideal for conversation-based queries), no single point of failure. But no secondary indexes, no joins.
   MySQL: ACID transactions, flexible queries, but hard to scale writes beyond 100K/sec.
   Decision: Cassandra for messages (write-heavy, partition-key access pattern). MySQL for user profiles and group metadata (read-heavy, need joins).

4. PUSH EVERY MESSAGE vs BATCH NOTIFICATIONS:
   Push each: User gets immediate notification for every message. Annoying if 50 messages arrive while offline.
   Batch: Aggregate and send one push notification every N messages or T seconds. Better UX.
   Decision: Push immediately for 1:1 messages. For groups, batch: "5 new messages in Team Chat".

5. MESSAGE PERSISTENCE DURATION:
   Keep forever: Full history, but storage grows unboundedly (10 TB/day).
   TTL-based: Delete after 30 days. Saves storage but users lose history.
   Decision: Keep text messages indefinitely (10 TB/day is manageable with Cassandra). Media: hot storage for 30 days, then move to cold storage (S3 Glacier). Offer message export.`,

    timeComplexity: `PERFORMANCE CHARACTERISTICS:
- Message send (online recipient): <500ms end-to-end (target: <200ms)
  - WebSocket to server: <10ms
  - Cassandra persist: <10ms (async, write-ahead log)
  - Redis lookup (recipient's server): <1ms
  - Kafka produce + consume: <20ms
  - WebSocket to recipient: <10ms
  - Total: ~50ms typical, <200ms p99
- Message send (offline recipient): <50ms (persist + offline queue)
- Group message fanout (256 members): <500ms
  - Redis MGET for 255 member locations: <5ms
  - Parallel delivery to online members: <50ms
  - Offline queue writes: <20ms
- Message sync on reconnect (100 missed messages): <200ms
- Presence status update propagation: <100ms to all subscribers
- Typing indicator delivery: <100ms (ephemeral, no persistence)
- Media upload (10 MB image): 2-5 seconds (direct to S3, pre-signed URL)
- Read receipt propagation: <200ms
- Peak throughput: 3.5M messages/sec (across 2,500 WebSocket servers + 100 Cassandra nodes)`,

    spaceComplexity: `STORAGE & MEMORY REQUIREMENTS:
- Message storage (Cassandra):
  Text messages: 100B messages/day * 200B avg = 20 TB/day
  With RF=3: 60 TB/day, 21.9 PB/year
  Media metadata: 5B media messages/day * 1 KB = 5 TB/day
- Media storage (S3):
  5B media/day * 500 KB avg = 2.5 PB/day (!)
  With lifecycle policies (30d hot, 1y warm, then cold): manageable
- Redis (Connection Manager):
  250M online users * 100B = 25 GB
  With Redis Cluster (10 nodes): 2.5 GB per node
- Redis (Group membership cache):
  100M groups * 256 members * 8B = 205 GB (across Redis Cluster)
- WebSocket server memory:
  100K connections * 10 KB per connection = 1 GB per server
  2,500 servers * 1 GB = 2.5 TB total RAM for connections
- Kafka:
  Message throughput: 3.5M/sec * 200B = 700 MB/sec
  Retention: 7 days * 700 MB/sec * 86400 = 423 TB
  With RF=3 and 3 brokers: 141 TB per broker
- Offline queues (Cassandra):
  Avg 10 offline messages per user * 500M daily users = 5B entries
  5B * 200B = 1 TB (cleaned up on sync, so steady-state is much lower)`,

    hints: [
      `The WebSocket connection manager (Redis) is the most critical component. When Alice sends a message to Bob, Alice's server must know WHICH of 2,500 WebSocket servers Bob is connected to. This is a simple Redis key-value: SET user:bob server_c. The key insight is that this lookup must be sub-millisecond because it happens for EVERY message. Use Redis Pipeline or MGET for group messages (batch lookup of 255 members in one round-trip). Always set a TTL on connection entries and refresh via heartbeat to handle crashed servers.`,
      `The message sync protocol with sequence numbers is essential for reliability. Each conversation maintains a monotonically increasing sequence counter. Client tracks its last received sequence per conversation. On reconnection: client sends {conv_1: 450, conv_2: 1200}, server returns all messages with seq > 450 for conv_1 and seq > 1200 for conv_2. If the gap is > 1000 messages, paginate (send first 50, client fetches more on scroll). This is identical to Kafka's consumer offset pattern - and for the same reason: reliable, ordered delivery over an unreliable connection.`,
      `For group messaging, always discuss the fanout trade-off with concrete numbers. A 256-member group with write fanout: 1 Cassandra write + 255 Redis lookups (batched via MGET = 1 round-trip) + 255 message deliveries = ~500ms total. Acceptable. A 10K-member broadcast channel with write fanout: 1 write + 10K lookups + 10K deliveries = potentially seconds, unacceptable. Solution: for large channels, use read fanout (store once, members pull on open) and push notifications only for the "summary" notification.`,
      `Read receipts create quadratic traffic in group chats if naively implemented. In a 256-member group, if every member sends a read receipt for every message, one message generates 255 * 255 = 65K receipt deliveries. Solution: aggregate read receipts. Instead of "Bob read message 42," batch to "Bob read up to message 50." Send receipt updates only to the message sender (not all group members). In WhatsApp, you tap a message to see individual read times - this is a separate pull-based query, not pushed.`,
      `Typing indicators must NEVER be persisted to a database. They are ephemeral events that are only meaningful in real-time. If the recipient is offline, discard the typing event entirely (do not queue it). Implement with a client-side 3-second timeout: when "typing" event arrives, show the indicator for 3 seconds. If no new "typing" event arrives within 3 seconds, hide it. This handles the case where the user stops typing without sending a "stopped typing" event (e.g., app crash).`,
      `Media handling is a common interview pitfall. NEVER route media through your chat servers. Instead: (1) client requests a pre-signed upload URL from your media service, (2) client uploads directly to S3 using the pre-signed URL, (3) client sends a chat message with the S3 URL. This keeps your WebSocket servers free from large file transfers. On the recipient side: send a thumbnail URL (pre-generated by a Lambda trigger on S3 upload) for instant preview, and the full-resolution URL for download on tap.`,
      `End-to-end encryption (E2EE) is expected in WhatsApp-style designs. The Signal Protocol uses the Double Ratchet algorithm: each message is encrypted with a unique key derived from a shared secret. Your server NEVER sees plaintext - it stores and forwards encrypted blobs. This has architectural implications: server-side search is impossible (the server cannot read messages), push notification content must be generic ("You have a new message" instead of showing the text), and key management (device registration, key exchange) becomes a critical component.`,
      `When designing for multiple devices (phone + web + desktop), the sync protocol becomes significantly more complex. Each device has its own sequence tracker. When Alice sends a message from her phone, it must also appear on her web client. Solution: treat "Alice's web client" as another recipient. The sender's other devices are included in the fanout list. For delivery receipts: mark as "read" when ANY device reads it (not when all devices read it). WhatsApp's approach: primary device (phone) is the source of truth, web/desktop clients proxy through it.`
    ],
  },
  {
    id: 9005,
    description: `Design a News Feed (Twitter/Instagram)

FUNCTIONAL REQUIREMENTS:
- Users create posts (text, images, video) that appear in their followers' feeds
- Home feed shows a personalized, ranked timeline of posts from followed accounts
- Support following/unfollowing users
- Celebrity accounts with millions of followers must not cause system bottlenecks
- Like, comment, share interactions on posts
- Real-time feed updates (new posts appear without page refresh)
- Feed pagination with infinite scroll
- Content types: text (280 chars), images (up to 10), video (up to 60s), links with preview

NON-FUNCTIONAL REQUIREMENTS:
- Feed generation must complete in <500ms (p99)
- Support 500M DAU, each user loads feed ~10 times/day
- Handle celebrity posts (accounts with 10M+ followers) efficiently
- Eventually consistent: a new post appearing in feeds within 5 seconds is acceptable
- Ranked feed provides better engagement than pure chronological

CAPACITY ESTIMATION:
- DAU: 500M users
- Posts per day: 500M users * 2 posts/day average (most users post less, power users post more) = 1B posts/day
- Feed reads per day: 500M users * 10 feed loads/day = 5B feed reads/day
- Read QPS: 5B / 86400 = ~57,800 reads/sec (peak: ~175,000/sec)
- Write QPS: 1B / 86400 = ~11,600 posts/sec (peak: ~35,000/sec)
- Average followers per user: 200 (median, long-tail distribution)
- Celebrity followers: up to 100M (e.g., top 0.01% of users)
- Storage per post: text(500B) + metadata(200B) + media_refs(100B) = ~800B
- Daily storage: 1B posts * 800B = 800 GB/day = ~292 TB/year
- Feed cache per user: 500 post IDs * 8 bytes = 4 KB
- Total feed cache: 500M users * 4 KB = 2 TB (Redis Cluster)
- Fanout for average post: 200 followers = 200 cache updates
- Fanout for celebrity post: SKIP (read-time merge instead)

FEED ASSEMBLY FORMULA:
\\\`\\\`\\\`
For each user's feed request:
  1. Fetch pre-computed feed from cache (post IDs from normal users they follow)
  2. Fetch recent posts from followed celebrities (on-demand query)
  3. Merge the two lists
  4. Apply ranking model to combined list
  5. Return top N posts with hydrated content
\\\`\\\`\\\`

DATABASE SCHEMA:
\\\`\\\`\\\`
posts:
  post_id         BIGINT PRIMARY KEY (Snowflake ID)
  author_id       BIGINT INDEX
  content         TEXT
  media_urls      TEXT[]
  content_type    ENUM('text','image','video','link')
  like_count      INT DEFAULT 0
  comment_count   INT DEFAULT 0
  share_count     INT DEFAULT 0
  created_at      TIMESTAMP

follows:
  follower_id     BIGINT
  followee_id     BIGINT
  created_at      TIMESTAMP
  PRIMARY KEY (follower_id, followee_id)
  INDEX (followee_id, follower_id)

feed_cache (Redis Sorted Set per user):
  Key: feed:{user_id}
  Members: post_id
  Scores: ranking_score (float, higher = more relevant)

user_profiles:
  user_id         BIGINT PRIMARY KEY
  username        VARCHAR(64) UNIQUE
  follower_count  INT
  is_celebrity    BOOLEAN (follower_count > 10,000)
\\\`\\\`\\\``,

    examples: `HYBRID FANOUT WALKTHROUGH:

Scenario 1: Regular user (500 followers) publishes a post.
  1. Post service stores the post in the database
  2. Post event published to Kafka topic "posts.created"
  3. Fanout service consumes the event
  4. Fanout service checks: author has 500 followers (< 10K threshold) -> fan-out on write
  5. Fetch follower list from follows table (or Redis cache)
  6. For each of the 500 followers:
     a. ZADD feed:{follower_id} ranking_score post_id
     b. ZREMRANGEBYRANK feed:{follower_id} 0 -(MAX_FEED_SIZE+1) [trim to 800 entries]
  7. Total time: 500 Redis writes * 0.1ms = ~50ms (pipelined)
  8. Result: post immediately appears in all 500 followers' cached feeds

Scenario 2: Celebrity (50M followers) publishes a post.
  1. Post service stores the post in the database
  2. Post event published to Kafka topic "posts.created"
  3. Fanout service consumes the event
  4. Fanout service checks: author has 50M followers (> 10K threshold) -> SKIP fan-out on write
  5. Post is only stored in the posts table and the celebrity's own post list
  6. When a follower loads their feed:
     a. Fetch pre-computed feed from Redis (posts from regular followees)
     b. Query celebrity post lists for all followed celebrities (Redis or DB)
     c. Merge celebrity posts into the feed
     d. Apply ranking algorithm
     e. Return top N posts
  7. Extra latency for celebrity posts: ~20ms (acceptable within 500ms budget)

FEED ASSEMBLY EXAMPLE:

User follows: alice (regular, 500 followers), bob (regular, 200 followers), taylor (celebrity, 50M followers)

Step 1 - Pre-computed feed from Redis:
  ZREVRANGE feed:user123 0 49 WITHSCORES
  Returns: [(post_A, 0.95), (post_B, 0.87), (post_C, 0.82), ...] (from alice and bob)

Step 2 - Celebrity posts fetch:
  User follows celebrities: [taylor]
  For each celebrity: ZREVRANGE celebrity_posts:taylor 0 19
  Returns: [(post_X, timestamp_1), (post_Y, timestamp_2)]

Step 3 - Merge:
  Combined = pre-computed posts + celebrity posts
  = [(post_A, 0.95), (post_B, 0.87), (post_X, ?), (post_Y, ?), (post_C, 0.82), ...]

Step 4 - Ranking:
  For celebrity posts, compute ranking score:
  score(post_X) = time_decay(0.9^hours_old) * engagement(likes*0.3 + comments*0.5 + shares*0.7)
                  * relationship(interaction_frequency_with_taylor)
  post_X score = 0.85 * 1.2 * 0.7 = 0.714

Step 5 - Sort by score, return top 20:
  [(post_A, 0.95), (post_B, 0.87), (post_C, 0.82), (post_X, 0.714), ...]

RANKING FORMULA:
  base_score = engagement_score * time_decay * relationship_strength * content_type_preference

  engagement_score = (likes * 0.3 + comments * 0.5 + shares * 0.7 + saves * 1.0) / (age_hours + 2)
  time_decay = exp(-0.1 * age_hours)  // exponential decay, half-life ~7 hours
  relationship_strength = interactions_with_author_last_30d / max_interactions
  content_type_preference = user's historical engagement rate with this content type

  final_score = base_score * (1 + is_original * 0.1) * (1 - is_seen * 0.9)`,

    intuition: `A news feed is a content distribution system that must solve the "write amplification vs read latency" trade-off. When a user publishes a post, should you immediately push it to all followers' feeds (fast reads, expensive writes) or let each follower pull it when they open the app (cheap writes, slow reads)?

THE KEY INSIGHT - HYBRID FANOUT:
Neither pure push nor pure pull works at scale. The breakthrough is the hybrid approach:
- For 99.99% of users (those with <10K followers): fan-out on WRITE. When they post, immediately push the post ID to all followers' feed caches. This makes feed reads instant (just read from cache).
- For the top 0.01% (celebrities with 10K+ followers): fan-out on READ. Do NOT push to millions of caches on write. Instead, when a follower opens their feed, merge in celebrity posts on-demand.

WHY THIS WORKS:
- A user with 500 followers: 500 Redis writes on post creation. At 11,600 posts/sec from regular users, that is 5.8M Redis writes/sec for fanout. Redis Cluster handles this.
- A celebrity with 50M followers: if we fanned out on write, a single post would require 50M Redis writes. At 35 celebrity posts/sec, that is 1.75 BILLION Redis writes/sec just for celebrities. Impossible. Instead, the celebrity post is stored once, and the ~100 celebrities a user follows are merged at read time (~20ms).

ANALOGY - THE NEWSPAPER:
Think of the feed system as running a personalized newspaper:
- Fan-out on write = printing each subscriber a custom newspaper every time any reporter publishes an article. For a neighborhood newsletter with 500 subscribers, this is fine. For the New York Times with 10M subscribers, you cannot reprint 10M newspapers for every article.
- Fan-out on read = subscribers come to the newsstand and the clerk assembles their personalized edition from today's papers on the spot. Fast for assembly (just pick and arrange), but requires work at read time.
- Hybrid = pre-print newspapers for small publications (push their articles into each subscriber's stack). For the NYT, keep a stack of their articles at the newsstand and merge them in when the subscriber picks up their paper.

WHY RANKING MATTERS:
Chronological feeds seem fair but hurt engagement. Studies show that ranked feeds increase engagement by 30-50% because:
1. Users do not scroll through hundreds of posts to find good content
2. High-quality posts get amplified, incentivizing better content creation
3. Time-sensitive content (breaking news) gets boosted
4. Stale content gets suppressed even if from close friends

The ranking model is typically a lightweight ML model (logistic regression or a small neural network) that predicts: "Given this user and this post, what is the probability the user will engage (like, comment, share, spend >2 seconds viewing)?"

THE COLD START PROBLEM:
New posts have zero engagement signals. How do you rank them? Use the author's historical engagement rate as a prior. If Alice's posts typically get 5% engagement, a new post from Alice starts with a predicted score of 0.05. This score is updated as real engagement data arrives (first few minutes are critical).`,

    approach: `COMPLETE ARCHITECTURE:

HIGH-LEVEL COMPONENTS:
1. Post Service - CRUD operations for posts, media upload
2. Fanout Service - pushes post IDs to follower feed caches (for regular users)
3. Feed Cache (Redis Cluster) - pre-computed feed per user as sorted sets
4. Feed Service - assembles final feed by merging cache + celebrity posts + ranking
5. Ranking Service - scores and orders posts for personalized feed
6. Follow Service - manages follow/unfollow relationships
7. Social Graph (Redis/Graph DB) - stores follow relationships for fast lookup
8. Kafka - event bus for post creation events and fanout coordination
9. CDN - serves media content (images, videos)

WRITE PATH (Publishing a Post):
1. User creates a post via POST /api/v1/posts
2. Post service validates content, stores in posts database (PostgreSQL/Cassandra)
3. If media attached: upload to S3, generate CDN URLs, store references
4. Publish event to Kafka topic "posts.created": { post_id, author_id, created_at }
5. Fanout service consumes the event:
   a. Check author's follower count (cached in Redis)
   b. If followers < CELEBRITY_THRESHOLD (10,000):
      - Fetch all follower IDs (from social graph cache or DB)
      - For each follower, ZADD feed:{follower_id} score post_id (pipelined)
      - Trim each feed to MAX_FEED_SIZE (800) entries
   c. If followers >= CELEBRITY_THRESHOLD:
      - ZADD celebrity_posts:{author_id} timestamp post_id
      - Trim to last 200 posts
      - Do NOT fan out to followers
6. Return success to the user

READ PATH (Loading the Feed):
1. User requests GET /api/v1/feed?cursor=abc&limit=20
2. Feed Service handles the request:
   a. Fetch pre-computed feed from Redis: ZREVRANGEBYSCORE feed:{user_id} +inf cursor LIMIT 0 20
   b. Fetch list of followed celebrities from social graph
   c. For each celebrity, fetch recent posts: ZREVRANGE celebrity_posts:{celeb_id} 0 19
   d. Merge pre-computed posts with celebrity posts
   e. Hydrate post IDs into full post objects (batch query to posts DB, cached in Redis)
   f. Apply ranking model to merged list
   g. Return top 20 posts with cursor for next page
3. Total latency budget:
   - Cache fetch: 2ms
   - Celebrity posts fetch: 5ms (parallel, 3-5 celebrities typical)
   - Merge: 1ms
   - Hydration: 10ms (batch, cached)
   - Ranking: 5ms
   - Total: ~25ms typical, <100ms p99

RANKING SERVICE:
1. Lightweight model that scores each post for a specific user
2. Features used:
   - Post features: age, engagement count (likes, comments, shares), content type, media count
   - Author features: follower count, average engagement rate, post frequency
   - User-author features: interaction history, follow recency, DM history
   - User features: content type preferences, active hours, engagement history
3. Model: gradient boosted trees (XGBoost) or small neural network
4. Scores are pre-computed for cached posts during fanout (using author's avg engagement as initial score)
5. Scores are refined at read time for celebrity posts and reranking

REAL-TIME UPDATES:
1. User has feed open on their client
2. New post created by someone they follow
3. Fanout pushes post_id to their feed cache
4. Two options for client notification:
   a. Polling: client checks for new posts every 30 seconds
   b. WebSocket/SSE: server pushes "new posts available" notification
5. Client shows "3 new posts" banner; user taps to load
6. Prevents jarring content shifts (content does not move while user is reading)

SOCIAL GRAPH SERVICE:
- Stores follow relationships in a graph-optimized store
- Redis sorted sets for quick follower/following lists: followers:{user_id}, following:{user_id}
- For each user, cache their celebrity followees separately: celeb_following:{user_id}
- Follower count maintained as a counter (Redis INCR/DECR on follow/unfollow)
- Graph queries: "Get all followers of user X" (for fanout), "Get all followees of user X" (for feed assembly)`,

    code: `// =============================================
// News Feed - Core Components Implementation
// =============================================

// --- Hybrid Fanout Service ---
class HybridFanoutService {
  constructor(celebrityThreshold = 10000) {
    this.celebrityThreshold = celebrityThreshold;
    this.feedCache = new Map(); // userId -> sorted array of { postId, score }
    this.celebrityPosts = new Map(); // celebrityId -> sorted array of { postId, timestamp }
    this.followers = new Map(); // userId -> Set of follower IDs
    this.followerCounts = new Map(); // userId -> count
    this.maxFeedSize = 800;
    this.maxCelebrityPosts = 200;
  }

  setFollowers(userId, followerIds) {
    this.followers.set(userId, new Set(followerIds));
    this.followerCounts.set(userId, followerIds.length);
  }

  _isCelebrity(userId) {
    return (this.followerCounts.get(userId) || 0) >= this.celebrityThreshold;
  }

  fanout(postId, authorId, initialScore, timestamp) {
    if (this._isCelebrity(authorId)) {
      if (!this.celebrityPosts.has(authorId)) {
        this.celebrityPosts.set(authorId, []);
      }
      const posts = this.celebrityPosts.get(authorId);
      posts.push({ postId, timestamp, score: initialScore });
      posts.sort((a, b) => b.timestamp - a.timestamp);
      if (posts.length > this.maxCelebrityPosts) posts.length = this.maxCelebrityPosts;
      return {
        strategy: "celebrity_store",
        author: authorId,
        followerCount: this.followerCounts.get(authorId),
      };
    }

    const followerIds = this.followers.get(authorId) || new Set();
    let pushed = 0;
    for (const followerId of followerIds) {
      if (!this.feedCache.has(followerId)) {
        this.feedCache.set(followerId, []);
      }
      const feed = this.feedCache.get(followerId);
      feed.push({ postId, score: initialScore });
      feed.sort((a, b) => b.score - a.score);
      if (feed.length > this.maxFeedSize) feed.length = this.maxFeedSize;
      pushed++;
    }
    return { strategy: "write_fanout", author: authorId, pushedTo: pushed };
  }

  getFeed(userId) {
    return (this.feedCache.get(userId) || []).slice();
  }

  getCelebrityPosts(celebrityId, limit = 20) {
    return (this.celebrityPosts.get(celebrityId) || []).slice(0, limit);
  }
}

// --- Ranking Scorer with Time Decay ---
class RankingScorer {
  constructor() {
    this.userInteractions = new Map(); // "userId:authorId" -> interaction count
    this.userPreferences = new Map();  // userId -> { image: 0.8, video: 1.2, text: 0.6 }
  }

  setInteraction(userId, authorId, count) {
    this.userInteractions.set(userId + ":" + authorId, count);
  }

  setPreferences(userId, prefs) {
    this.userPreferences.set(userId, prefs);
  }

  scorePost(userId, post) {
    const ageHours = (Date.now() - post.createdAt) / 3600000;
    const timeDec = Math.exp(-0.1 * ageHours);
    const engagement = (
      (post.likes || 0) * 0.3 +
      (post.comments || 0) * 0.5 +
      (post.shares || 0) * 0.7 +
      (post.saves || 0) * 1.0
    ) / (ageHours + 2);
    const interactionKey = userId + ":" + post.authorId;
    const rawInteraction = this.userInteractions.get(interactionKey) || 0;
    const relationship = Math.min(1, rawInteraction / 50);
    const prefs = this.userPreferences.get(userId) || {};
    const contentPref = prefs[post.contentType] || 1.0;
    const isOriginal = post.isRepost ? 0.9 : 1.1;
    const isSeen = post.seen ? 0.1 : 1.0;
    const score = timeDec * engagement * (0.3 + 0.7 * relationship) *
                  contentPref * isOriginal * isSeen;
    return Math.round(score * 10000) / 10000;
  }
}

// --- Feed Assembly Service ---
class FeedAssemblyService {
  constructor(fanoutService, rankingScorer) {
    this.fanout = fanoutService;
    this.scorer = rankingScorer;
    this.postStore = new Map();
    this.following = new Map(); // userId -> Set of followee IDs
    this.pageSize = 20;
  }

  addPost(post) {
    this.postStore.set(post.postId, post);
  }

  setFollowing(userId, followeeIds) {
    this.following.set(userId, new Set(followeeIds));
  }

  assembleFeed(userId, cursor = 0) {
    // Step 1: Get pre-computed feed entries (from regular users)
    const cachedEntries = this.fanout.getFeed(userId);

    // Step 2: Get celebrity posts from followed celebrities
    const followees = this.following.get(userId) || new Set();
    const celebrityEntries = [];
    for (const followeeId of followees) {
      if (this.fanout._isCelebrity(followeeId)) {
        const posts = this.fanout.getCelebrityPosts(followeeId, 20);
        celebrityEntries.push(...posts);
      }
    }

    // Step 3: Merge all post IDs
    const allPostIds = new Set();
    const mergedPosts = [];
    for (const entry of [...cachedEntries, ...celebrityEntries]) {
      if (!allPostIds.has(entry.postId)) {
        allPostIds.add(entry.postId);
        const post = this.postStore.get(entry.postId);
        if (post) mergedPosts.push(post);
      }
    }

    // Step 4: Score and rank
    const scored = mergedPosts.map((post) => ({
      post,
      score: this.scorer.scorePost(userId, post),
    }));
    scored.sort((a, b) => b.score - a.score);

    // Step 5: Paginate
    const page = scored.slice(cursor, cursor + this.pageSize);
    return {
      posts: page.map((s) => ({ ...s.post, rankScore: s.score })),
      nextCursor: cursor + this.pageSize < scored.length ? cursor + this.pageSize : null,
      totalPosts: scored.length,
    };
  }
}

// --- Demo ---
const fanout = new HybridFanoutService(100); // low threshold for demo
const scorer = new RankingScorer();
const feedService = new FeedAssemblyService(fanout, scorer);

// Setup social graph
fanout.setFollowers("alice", ["user1", "user2", "user3"]);
fanout.setFollowers("celebrity1", Array.from({ length: 150 }, (_, i) => "user" + i));
feedService.setFollowing("user1", new Set(["alice", "celebrity1"]));
scorer.setInteraction("user1", "alice", 30);
scorer.setInteraction("user1", "celebrity1", 5);
scorer.setPreferences("user1", { text: 0.7, image: 1.3, video: 1.0 });

// Create posts
const now = Date.now();
const posts = [
  { postId: "p1", authorId: "alice", content: "Hello world!", contentType: "text",
    likes: 10, comments: 3, shares: 1, saves: 0, createdAt: now - 3600000 },
  { postId: "p2", authorId: "alice", content: "Check this out", contentType: "image",
    likes: 50, comments: 15, shares: 8, saves: 3, createdAt: now - 7200000 },
  { postId: "p3", authorId: "celebrity1", content: "Big announcement!", contentType: "text",
    likes: 50000, comments: 2000, shares: 5000, saves: 1000, createdAt: now - 1800000 },
  { postId: "p4", authorId: "celebrity1", content: "Concert photo", contentType: "image",
    likes: 100000, comments: 5000, shares: 10000, saves: 2000, createdAt: now - 600000 },
];

for (const post of posts) {
  feedService.addPost(post);
  const initialScore = scorer.scorePost("user1", post);
  const result = fanout.fanout(post.postId, post.authorId, initialScore, post.createdAt);
  console.log("Fanout:", post.postId, "->", result.strategy,
    result.pushedTo ? "(pushed to " + result.pushedTo + ")" : "");
}

console.log("\\n=== user1's Feed ===");
const feed = feedService.assembleFeed("user1");
for (const post of feed.posts) {
  console.log(post.postId + " by " + post.authorId +
    " | score: " + post.rankScore + " | " + post.contentType +
    " | likes: " + post.likes);
}
console.log("Next cursor:", feed.nextCursor, "Total:", feed.totalPosts);`,

    jsCode: `// =============================================
// News Feed - Feed Cache Manager & Social Graph
// =============================================

// --- Feed Cache Manager (simulates Redis Sorted Sets) ---
class FeedCacheManager {
  constructor(maxSize = 800) {
    this.maxSize = maxSize;
    this.caches = new Map(); // userId -> [{ postId, score }] sorted by score desc
    this.stats = { hits: 0, misses: 0, evictions: 0, writes: 0 };
  }

  push(userId, postId, score) {
    if (!this.caches.has(userId)) this.caches.set(userId, []);
    const feed = this.caches.get(userId);
    const existing = feed.findIndex((e) => e.postId === postId);
    if (existing >= 0) {
      feed[existing].score = score;
    } else {
      feed.push({ postId, score });
      this.stats.writes++;
    }
    feed.sort((a, b) => b.score - a.score);
    if (feed.length > this.maxSize) {
      feed.length = this.maxSize;
      this.stats.evictions++;
    }
  }

  getRange(userId, start, count) {
    const feed = this.caches.get(userId);
    if (!feed) { this.stats.misses++; return []; }
    this.stats.hits++;
    return feed.slice(start, start + count);
  }

  remove(userId, postId) {
    const feed = this.caches.get(userId);
    if (!feed) return false;
    const idx = feed.findIndex((e) => e.postId === postId);
    if (idx >= 0) { feed.splice(idx, 1); return true; }
    return false;
  }

  invalidateUser(userId) {
    return this.caches.delete(userId);
  }

  getCacheSize(userId) {
    return (this.caches.get(userId) || []).length;
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1)
      : 0;
    return { ...this.stats, hitRate: hitRate + "%" };
  }
}

// --- Social Graph with Celebrity Detection ---
class SocialGraph {
  constructor(celebrityThreshold = 10000) {
    this.celebrityThreshold = celebrityThreshold;
    this.following = new Map(); // userId -> Set of followee IDs
    this.followers = new Map(); // userId -> Set of follower IDs
  }

  follow(followerId, followeeId) {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    if (!this.followers.has(followeeId)) this.followers.set(followeeId, new Set());
    this.following.get(followerId).add(followeeId);
    this.followers.get(followeeId).add(followerId);
    return {
      following: this.following.get(followerId).size,
      followeeFollowers: this.followers.get(followeeId).size,
    };
  }

  unfollow(followerId, followeeId) {
    const fg = this.following.get(followerId);
    const fr = this.followers.get(followeeId);
    if (fg) fg.delete(followeeId);
    if (fr) fr.delete(followerId);
  }

  getFollowers(userId) {
    return Array.from(this.followers.get(userId) || []);
  }

  getFollowing(userId) {
    return Array.from(this.following.get(userId) || []);
  }

  isCelebrity(userId) {
    return (this.followers.get(userId) || new Set()).size >= this.celebrityThreshold;
  }

  getCelebrityFollowees(userId) {
    const followees = this.following.get(userId) || new Set();
    return Array.from(followees).filter((id) => this.isCelebrity(id));
  }

  getRegularFollowees(userId) {
    const followees = this.following.get(userId) || new Set();
    return Array.from(followees).filter((id) => !this.isCelebrity(id));
  }

  getMutualFollows(userId1, userId2) {
    const following1 = this.following.get(userId1) || new Set();
    const following2 = this.following.get(userId2) || new Set();
    return following1.has(userId2) && following2.has(userId1);
  }
}

// --- Feed Refresh Coordinator ---
class FeedRefreshCoordinator {
  constructor(cache, graph, celebrityThreshold = 100) {
    this.cache = cache;
    this.graph = graph;
    this.postDB = new Map();
    this.celebrityPosts = new Map();
    this.celebrityThreshold = celebrityThreshold;
  }

  publishPost(post) {
    this.postDB.set(post.postId, post);
    const authorId = post.authorId;
    if (this.graph.isCelebrity(authorId)) {
      if (!this.celebrityPosts.has(authorId)) {
        this.celebrityPosts.set(authorId, []);
      }
      this.celebrityPosts.get(authorId).unshift(post);
      if (this.celebrityPosts.get(authorId).length > 200) {
        this.celebrityPosts.get(authorId).length = 200;
      }
      return { type: "celebrity", fanout: 0 };
    }
    const followers = this.graph.getFollowers(authorId);
    const initialScore = this._quickScore(post);
    let count = 0;
    for (const followerId of followers) {
      this.cache.push(followerId, post.postId, initialScore);
      count++;
    }
    return { type: "regular", fanout: count };
  }

  _quickScore(post) {
    const age = (Date.now() - post.createdAt) / 3600000;
    return Math.exp(-0.1 * age) * 10;
  }

  getFeed(userId, page = 0, pageSize = 20) {
    const start = page * pageSize;
    const cached = this.cache.getRange(userId, start, pageSize + 20);
    const celebFollowees = this.graph.getCelebrityFollowees(userId);
    const celebPosts = [];
    for (const celebId of celebFollowees) {
      const posts = (this.celebrityPosts.get(celebId) || []).slice(0, 20);
      celebPosts.push(...posts);
    }
    const celebScored = celebPosts.map((p) => ({
      postId: p.postId,
      score: this._quickScore(p),
    }));
    const merged = new Map();
    for (const entry of cached) merged.set(entry.postId, entry.score);
    for (const entry of celebScored) {
      if (!merged.has(entry.postId)) merged.set(entry.postId, entry.score);
    }
    const sorted = Array.from(merged.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, pageSize);
    return sorted.map(([postId, score]) => {
      const post = this.postDB.get(postId);
      return post ? { ...post, feedScore: Math.round(score * 1000) / 1000 } : null;
    }).filter(Boolean);
  }

  deletePost(postId) {
    const post = this.postDB.get(postId);
    if (!post) return;
    this.postDB.delete(postId);
    const followers = this.graph.getFollowers(post.authorId);
    for (const fid of followers) this.cache.remove(fid, postId);
    const celebPosts = this.celebrityPosts.get(post.authorId);
    if (celebPosts) {
      const idx = celebPosts.findIndex((p) => p.postId === postId);
      if (idx >= 0) celebPosts.splice(idx, 1);
    }
  }
}

// --- Demo ---
const cache = new FeedCacheManager(800);
const graph = new SocialGraph(100);
const coordinator = new FeedRefreshCoordinator(cache, graph, 100);

// Build social graph
for (let i = 1; i <= 5; i++) graph.follow("viewer", "regular" + i);
for (let i = 0; i < 150; i++) graph.follow("fan" + i, "celeb1");
graph.follow("viewer", "celeb1");

console.log("=== Social Graph ===");
console.log("celeb1 is celebrity:", graph.isCelebrity("celeb1"));
console.log("viewer celebrity followees:", graph.getCelebrityFollowees("viewer"));
console.log("viewer regular followees:", graph.getRegularFollowees("viewer"));

// Publish posts
const now = Date.now();
const publishResults = [];
for (let i = 1; i <= 3; i++) {
  const r = coordinator.publishPost({
    postId: "reg_" + i, authorId: "regular" + i,
    content: "Regular post " + i, contentType: "text",
    likes: i * 10, comments: i * 2, createdAt: now - i * 1800000,
  });
  publishResults.push({ post: "reg_" + i, ...r });
}
const cr = coordinator.publishPost({
  postId: "celeb_1", authorId: "celeb1",
  content: "Celebrity post!", contentType: "image",
  likes: 50000, comments: 2000, createdAt: now - 600000,
});
publishResults.push({ post: "celeb_1", ...cr });

console.log("\\n=== Publish Results ===");
publishResults.forEach((r) => console.log(r.post + ":", r.type, "fanout:", r.fanout));

console.log("\\n=== Viewer Feed ===");
const feed = coordinator.getFeed("viewer");
feed.forEach((p) =>
  console.log(p.postId + " by " + p.authorId +
    " | score: " + p.feedScore + " | " + p.contentType)
);

console.log("\\n=== Cache Stats ===");
console.log(cache.getStats());`,

    explanation: `SCALING ANALYSIS:

HORIZONTAL SCALING:
- Post Service: stateless, scale horizontally behind LB. At 35K posts/sec peak, 10 servers handle this.
- Fanout Service: the heaviest component. Each post from a regular user (avg 200 followers) generates 200 Redis writes. At 11.6K regular posts/sec, that is 2.32M Redis writes/sec. Redis Cluster with 10 nodes handles this (each node: 232K writes/sec).
- Feed Cache (Redis Cluster): 500M users * 4 KB = 2 TB. With 20 Redis nodes at 100 GB each = 2 TB capacity.
- Feed Service: stateless, read-heavy. At 175K feed reads/sec peak, need ~50 servers (3,500 QPS per server).
- Ranking Service: CPU-intensive ML inference. Co-located with Feed Service or as a sidecar. Use model caching.

BOTTLENECK IDENTIFICATION:
1. Fanout for popular (but not celebrity) users: A user with 9,999 followers (just below celebrity threshold) triggers 9,999 Redis writes per post. If they post 10 times/day, that is 100K writes/day from one user. At scale, need to monitor users near the threshold and consider dynamic threshold adjustment.
2. Feed assembly for users following many celebrities: If a user follows 100 celebrities, feed read requires 100 Redis queries for celebrity posts. Solution: parallelize and limit to top 50 most-interacted-with celebrities.
3. Social graph changes: When a user with 1M followers is unfollowed, their posts should eventually be removed from the unfollower's cache. This is low-priority and handled by a background cleanup job, not real-time.
4. Hot posts: A viral post may need engagement counts updated millions of times. Use Redis counters with periodic flush to database. Do not update the database on every like.

FAILURE MODES:
1. Redis (feed cache) node failure: Feeds served from that shard become empty (cache miss). Feed Service falls back to database query to build feed on-the-fly. Slower (~200ms) but functional. Redis auto-failover to replica restores normal operation.
2. Fanout Service lag: If fanout falls behind (Kafka consumer lag), new posts are delayed in appearing in feeds. This is acceptable (feeds are eventually consistent). Monitor lag and auto-scale consumers.
3. Ranking Service failure: Fall back to chronological ordering (sort by timestamp). Engagement drops but feed still works.
4. Post database failure: New posts cannot be created or hydrated. Cached feeds still work for existing posts. This is the most critical failure - use multi-AZ PostgreSQL with read replicas.

MONITORING STRATEGY:
- Feed generation latency p50/p95/p99 (Target: p99 < 500ms, Alert if p99 > 700ms)
- Fanout lag (Kafka consumer group lag for fanout topic, Alert if > 100K messages)
- Cache hit ratio for feed reads (Target: > 95%, Alert if < 90%)
- Redis memory utilization per node (Alert if > 80%)
- Ranking model inference latency (Alert if p99 > 50ms)
- Posts per second (write throughput, capacity planning)
- Celebrity post read latency (separate metric since it is a different code path)

TRADE-OFFS:

1. FAN-OUT ON WRITE vs FAN-OUT ON READ:
   Write: O(followers) work per post. Fast reads (O(1) cache lookup). Expensive for popular accounts.
   Read: O(following) work per feed load. Cheap writes (O(1) post store). Slow for users following many accounts.
   Decision: Hybrid. Write-fanout for regular users (<10K followers), read-fanout for celebrities.

2. CHRONOLOGICAL vs RANKED FEED:
   Chronological: Simple, predictable, users see everything. But: endless scrolling through low-quality content.
   Ranked: Better engagement (30-50% improvement), surfaces best content. But: ML complexity, "filter bubble" risk, users feel manipulated.
   Decision: Ranked by default with "Latest" toggle for chronological. Use lightweight ranking model for fast inference.

3. FEED CACHE SIZE:
   Small cache (200 posts): Less memory, but more cache misses and database fallbacks.
   Large cache (2000 posts): Higher memory but complete feed history. 500M * 16KB = 8 TB Redis - expensive.
   Decision: 800 posts per user (4 KB). Covers ~3 days of content for most users. Older content fetched from database on deep scroll.

4. REAL-TIME vs POLLING FOR FEED UPDATES:
   Real-time (WebSocket/SSE): Instant updates, but requires persistent connections for 500M users (expensive infrastructure).
   Polling: Simpler, stateless servers, but 30-second delay. At 500M users polling every 30s = 16.7M requests/sec (huge).
   Decision: Pull-to-refresh on mobile (user-initiated). Background fetch every 5 minutes. WebSocket only for web clients that are actively viewing the feed.

5. ENGAGEMENT COUNTERS - REAL-TIME vs APPROXIMATE:
   Real-time: Every like immediately updates the counter. Requires atomic increment, potential hot key issue for viral posts.
   Approximate: Buffer likes in Redis, flush to database every 5 seconds. Counter may lag by a few seconds.
   Decision: Approximate. Use Redis INCR for real-time display, batch flush to database. Viral post with 1M likes/hour would be 277 Redis INCRs/sec for that key alone (manageable).`,

    timeComplexity: `PERFORMANCE CHARACTERISTICS:
- Feed read (cache hit, no celebrity merge): ~25ms p50, ~100ms p99
  - Redis sorted set read: 2ms
  - Post hydration (batch, cached): 10ms
  - Ranking: 5ms
  - Serialization: 3ms
- Feed read (with celebrity merge): ~50ms p50, ~200ms p99
  - Pre-computed feed fetch: 2ms
  - Celebrity posts fetch (parallel, 5-10 celebrities): 10ms
  - Merge algorithm: 2ms
  - Post hydration: 15ms
  - Ranking: 10ms
- Post publish (regular user, 200 followers): ~100ms total
  - Database write: 10ms
  - Kafka publish: 5ms
  - Fanout (200 Redis writes, pipelined): 20ms
- Post publish (celebrity, 50M followers): ~15ms total
  - Database write: 10ms
  - Kafka publish: 5ms
  - Celebrity post list update: 1ms
  - NO fanout (zero Redis writes to follower feeds)
- Follow/unfollow: ~10ms (graph update + optional feed cache update)
- Like/comment: ~5ms (Redis counter increment)
- Peak read throughput: 175,000 feed reads/sec
- Peak write throughput: 35,000 posts/sec + 7M fanout writes/sec`,

    spaceComplexity: `STORAGE & MEMORY REQUIREMENTS:
- Post database (PostgreSQL / Cassandra):
  1B posts/day * 800B = 800 GB/day
  With indexes and overhead: ~1.2 TB/day
  1-year retention: 438 TB (sharded across ~50 database nodes)
- Media storage (S3 + CDN):
  30% of posts have images: 300M * 2 MB avg = 600 TB/day
  10% of posts have video: 100M * 50 MB avg = 5 PB/day
  CDN caches top 10% of content at edge locations
- Feed cache (Redis Cluster):
  500M users * 800 entries * 8B (post_id) per entry = 3.2 TB
  With Redis overhead (~3x raw data): ~9.6 TB
  Cluster: 50 nodes * 200 GB each = 10 TB capacity
- Celebrity post lists (Redis):
  100K celebrities * 200 posts * 8B = 160 MB (negligible)
- Social graph (Redis):
  Following: 500M users * 200 avg followees * 8B = 800 GB
  Followers: reverse index, same size = 800 GB
  Total: 1.6 TB across Redis Cluster
- Kafka:
  Post events: 35K/sec * 500B * 86400 * 3 days retention = 4.5 TB
  With RF=3: 13.5 TB across the Kafka cluster
- Ranking model:
  Model size: ~100 MB per instance (gradient boosted trees)
  Feature store: ~500 GB (user preferences, interaction histories)`,

    hints: [
      `The hybrid fanout model is THE key insight that makes social media feeds scale. In the interview, always present both pure-push and pure-pull first, explain why each fails at scale, then introduce hybrid as the solution. Calculate: a celebrity with 50M followers posting once would require 50M Redis writes taking ~50 seconds. During those 50 seconds, the system cannot process any other fanout. This is why you MUST skip write-fanout for celebrities and merge their posts at read time instead.`,
      `The ranking algorithm is a critical differentiator between a junior and senior answer. At minimum, implement time decay (exponential: e^(-0.1 * age_hours) gives a half-life of ~7 hours), engagement normalization (likes*0.3 + comments*0.5 + shares*0.7 divided by age to get engagement rate, not raw count), and relationship strength (how often the viewer interacts with the author). In production, this is an ML model (XGBoost or neural network) trained on click/engagement prediction, but in the interview, a well-reasoned formula demonstrates you understand the principles.`,
      `Feed cache management is subtle. Each user's feed is a Redis sorted set limited to 800 entries. When a new post is fanned out, it is added with its ranking score. When the set exceeds 800, the lowest-scored entries are trimmed (ZREMRANGEBYRANK). This means inactive users whose cached feeds are full will only see new posts if they score higher than the lowest entry. For users who have not opened the app in weeks, their entire cached feed may be stale. Solution: on first open after a long absence, rebuild the feed from scratch using the database.`,
      `Post deletion and feed consistency is a common interview follow-up. When a user deletes a post, you need to remove it from all followers' feed caches. For a regular user with 500 followers, this is 500 Redis ZREM operations (fast). For a celebrity post, it only needs to be removed from the celebrity_posts list (1 operation) since it was never fanned out. But what about feeds that have already been loaded by clients? Clients should fetch post data by ID, and the post service returns 404 for deleted posts. Client-side: filter out 404 posts from the displayed feed.`,
      `Infinite scroll pagination requires a cursor-based approach, not offset-based. Use the ranking score as the cursor: "Give me the next 20 posts with score lower than X." This is stable even when new posts are inserted (which would shift offsets). In Redis sorted sets: ZREVRANGEBYSCORE feed:{userId} (cursor_score) -inf LIMIT 0 20. The client sends the last post's score as the cursor for the next page. Edge case: two posts with the same score need a tiebreaker (use post_id as secondary sort).`,
      `The social graph is often stored in Redis for fast access during fanout. Use sorted sets: followers:{userId} stores all follower IDs with follow-time as score, following:{userId} stores all followee IDs. When user A follows user B: ZADD following:A timestamp B + ZADD followers:B timestamp A (two Redis writes, use a pipeline). For fanout, ZRANGE followers:{authorId} 0 -1 gets all followers. At 200 avg followers, this returns quickly. For celebrities with 50M followers, you never query their follower list (because you skip write-fanout for them).`,
      `Real-time feed updates are tricky to implement efficiently. The naive approach (WebSocket push for every new post) does not scale - you would need to maintain 250M persistent connections. Instead, use a "new posts available" signal: when fanout adds posts to a user's feed cache, increment a counter. Client polls this counter every 30 seconds (lightweight GET request). If counter changed, client shows "New posts available" banner. User taps to load. This gives near-real-time feel without the infrastructure cost of persistent connections for every user.`,
      `Common interview pitfall: not discussing what happens to feed caches when a user follows or unfollows someone. On FOLLOW: you need to backfill the new followee's recent posts into the follower's feed cache. Fetch the followee's last 50 posts, score them, and ZADD to the follower's feed. On UNFOLLOW: you need to remove the unfollowed user's posts from the feed cache. This is expensive (scan the entire feed for matching author_id). In practice, do this lazily: mark the posts as "from unfollowed user" and filter them out at read time, then clean up in a background job.`
    ],
  },
];
