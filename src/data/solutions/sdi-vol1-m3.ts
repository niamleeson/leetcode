import { ProblemSolution } from './types';

export const sdiVol1M3: ProblemSolution[] = [
  {
    id: 9108,
    description: `## Clarifying Questions to Ask
- What is the **traffic volume** — how many new URLs are shortened per day?
- What is the expected **read-to-write ratio** — how many redirects per new URL created?
- How long should shortened URLs **persist** — do they expire or live forever?
- Should users be able to specify **custom short aliases** (e.g., \`bit.ly/my-brand\`)?
- Do we need **analytics** — click counts, geographic data, referrer tracking?
- What is the **maximum acceptable length** for the short URL?

## Functional Requirements
- Given a long URL, generate a **unique short URL** (e.g., \`https://tinyurl.com/a7Bk3Xq\`)
- When a user visits the short URL, **redirect** them to the original long URL
- Users can optionally choose a **custom alias** for their short URL
- URLs can have an **expiration time** set by the user (default: no expiration)
- The system must be **highly available** — if the service goes down, billions of existing links break

## Non-Functional Requirements
- **Low latency redirects** — redirect resolution should complete in under 10 ms (excluding network round-trip)
- **High availability** — 99.99% uptime since dead links degrade trust across the entire internet
- **Scalable** — handle billions of redirects per day and hundreds of millions of new URLs per day
- **Not guessable** — short codes should not be easily predicted or sequentially enumerable

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| New URLs/day | 100M |
| Read:Write ratio | 10:1 → **1B redirects/day** |
| Write QPS | 100M / 86,400 ≈ **1,160 writes/sec** |
| Read QPS | 1B / 86,400 ≈ **11,600 reads/sec** |
| URL record size | ~500 bytes (short code + long URL + metadata) |
| Storage/year | 100M × 365 × 500B ≈ **18 TB/year** |
| 5-year storage | **~90 TB** |
| Cache (20% hot URLs) | 1B daily × 20% × 500B ≈ **100 GB** (fits in memory) |
`,
    examples: `## Follow-Up Discussion Points

### 301 vs 302 Redirects
- **301 (Moved Permanently)**: The browser caches the redirect and will never hit our server again for this URL. This reduces server load but makes analytics impossible since we never see repeat visits.
- **302 (Found / Temporary Redirect)**: The browser always hits our server first, giving us the chance to log every click. Use 302 if analytics matter, 301 if pure performance matters.
- **Recommendation**: Default to 302 for analytics, but allow power users to opt into 301 for performance-critical links.

### Analytics Pipeline
- Log every redirect event to a Kafka topic with timestamp, short code, referrer, geo-IP, user-agent, and device type.
- A stream processor (Flink or Spark Streaming) aggregates these events into per-URL counters (hourly, daily, weekly) and stores them in a time-series database like ClickHouse.
- Serve analytics dashboards via a read-only API backed by pre-aggregated materialized views.

### Spam and Abuse Prevention
- Run every submitted long URL through a **URL reputation service** (Google Safe Browsing API, PhishTank) before accepting it.
- Implement **rate limiting** per user and per IP to prevent link-bombing attacks.
- Add a **preview page** option (e.g., \`tinyurl.com/a7Bk3Xq+\`) that shows the destination before redirecting, so users can verify the link is safe.
- Maintain a **blocklist** of known malicious domains and reject any URLs matching them.

### Scaling to 10x Traffic
- Move from a single database to a **sharded cluster** partitioned by consistent hashing on the short code.
- Add a **multi-tier caching** layer: L1 (local in-memory on each API server, 1 GB) → L2 (distributed Redis cluster, 100 GB) → L3 (database).
- Deploy API servers across multiple **geographic regions** with DNS-based routing so users hit the nearest data center.
- Pre-warm caches with the top 1% of URLs (which likely account for 80%+ of traffic).`,
    intuition: `A URL shortener maps short alphanumeric keys to long URLs, enabling compact link sharing. The core engineering challenges are: (1) **generating unique short codes** at massive scale without collisions or coordination bottlenecks, and (2) **serving billions of redirects per day** with sub-10ms latency. Since reads dominate writes by 10:1 or more, the architecture is heavily read-optimized with aggressive caching. The key design decision is choosing between **hash-based generation** (hash the long URL and handle collisions) versus **counter-based generation** (use a globally unique ID and encode it in Base-62). Each approach has distinct trade-offs in collision handling, ID predictability, and coordination complexity.`,
    approach: `## API Design

| Endpoint | Method | Parameters | Response |
|----------|--------|------------|----------|
| \`/api/v1/shorten\` | POST | \`{ long_url, custom_alias?, expiry? }\` | \`{ short_url }\` (201 Created) |
| \`/{shortCode}\` | GET | Path param: \`shortCode\` | 301/302 Redirect to long URL |
| \`/api/v1/stats/{shortCode}\` | GET | Path param: \`shortCode\` | \`{ clicks, created_at, long_url }\` |

## Short Code Generation: Two Approaches

### Approach 1: Hash + Collision Resolution
1. Take the long URL and compute a hash (e.g., CRC32, MD5, SHA-256).
2. Take the first 7 characters of the Base-62-encoded hash as the short code.
3. Check the database — if the code already exists, append an incrementing suffix and re-hash until a unique code is found.

### Approach 2: Base-62 Encoding of Unique ID
1. Generate a globally unique numeric ID (using a distributed ID generator like Snowflake or a dedicated auto-increment service).
2. Convert the numeric ID to a Base-62 string (characters: \`[0-9a-zA-Z]\`).
3. The result is guaranteed unique since the input ID is unique — no collision check needed.

### Comparison Table

| Criteria | Hash + Collision | Base-62 of Unique ID |
|----------|-----------------|---------------------|
| Collision handling | Must detect and resolve collisions (DB read before write) | **No collisions** — IDs are unique by construction |
| Same URL → same code? | Yes (deterministic hash) | No (different IDs each time unless you add a dedup lookup) |
| Code predictability | Hard to guess | Sequential IDs are guessable (mitigate with ID scrambling) |
| Write latency | Higher (collision loops) | Lower (single write) |
| Dependency | None beyond DB | Requires a **unique ID generator** (single point of failure if not designed carefully) |

**Recommendation**: Use Base-62 encoding with a distributed unique ID generator (Twitter Snowflake pattern) for predictable performance and zero collision overhead.

## Data Model

| Column | Type | Description |
|--------|------|-------------|
| \`short_code\` | VARCHAR(7) PK | The Base-62 encoded short code |
| \`long_url\` | TEXT | The original destination URL |
| \`user_id\` | BIGINT | Creator of the link (nullable for anonymous) |
| \`created_at\` | TIMESTAMP | When the link was created |
| \`expires_at\` | TIMESTAMP | Optional expiration time |
| \`click_count\` | BIGINT | Running total of redirect hits |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Client (Browser)"]
    N1["App 1"]
    N2["App 2"]
    N3["App N"]
    N4["Redis Cache Cluster"]
    N5[("Database (Sharded)")]
    N6[("Shard 1")]
    N7[("Shard 2")]
    N8[("Shard 3")]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N1 --> N4
    N2 --> N4
    N3 --> N4
    N1 --> N5
    N2 --> N5
    N3 --> N5
    N4 --> N5
    N5 --> N6
    N5 --> N7
    N5 --> N8
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client (Browser)** — The end user who submits long URLs for shortening and follows short URLs for redirection. All traffic originates here.
- **App 1 / App 2 / App N** — Horizontally scaled API servers that handle both URL creation and redirect requests. Multiple instances ensure high availability and distribute load.
- **Redis Cache Cluster** — An in-memory cache storing the most frequently accessed short-code-to-long-URL mappings. Serves the majority of redirect lookups without hitting the database.
- **Database (Sharded)** — The persistent source of truth for all URL mappings, partitioned across multiple shards to handle 90+ TB of data over 5 years.
- **Shard 1 / Shard 2 / Shard 3** — Individual database partitions divided by consistent hashing on the short code, each holding a roughly equal fraction of the keyspace for balanced load.

## Write Flow (URL Shortening)

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant ID as ID Generator
    participant DB as Database
    participant Cache as Cache

    C->>API: POST /api/v1/shorten { long_url }
    API->>ID: Request unique ID
    ID-->>API: Return ID: 294713
    Note over API: Base62(294713) = "a7Bk3Xq"
    API->>DB: INSERT (a7Bk3Xq, long_url, ...)
    DB-->>API: OK
    API->>Cache: SET a7Bk3Xq → long_url (warm cache)
    API-->>C: 201: { short_url }
\`\`\`

## Read Flow (Redirect)

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant Cache as Cache
    participant DB as Database

    C->>API: GET /a7Bk3Xq
    API->>Cache: GET a7Bk3Xq
    alt Cache HIT
        Cache-->>API: long_url
    else Cache MISS
        API->>DB: SELECT long_url WHERE short_code = 'a7Bk3Xq'
        DB-->>API: long_url
        API->>Cache: SET cache
    end
    API-->>C: 302 Redirect (Location: long_url)
\`\`\`

## Base-62 Encoding Example

\`\`\`
Characters: 0-9 (10) + a-z (26) + A-Z (26) = 62 characters

Short code length: 7 characters
Total combinations: 62^7 = 3,521,614,606,208 ≈ 3.5 TRILLION unique URLs

Example conversion:
  Unique ID:  11157 (decimal)
  11157 / 62 = 179 remainder 59 → 59 = 'X'
  179   / 62 = 2   remainder 55 → 55 = 'T'
  2     / 62 = 0   remainder 2  → 2  = '2'
  Result: "2TX"

Reverse:
  "2TX" → 2×62² + 55×62¹ + 59×62⁰
        = 7688 + 3410 + 59
        = 11157 ✓
\`\`\`
`,
    jsCode: `## Deep Dive: Hash Collision Resolution

When using a hash-based approach (Approach 1), collisions are inevitable because we truncate the hash output. Here is how to handle them:

1. Compute \`hash = CRC32(long_url)\` and take the first 43 bits (enough for 7 Base-62 characters).
2. Check the database for the resulting short code.
3. If it already exists and maps to a **different** long URL, append a predefined salt and re-hash: \`hash = CRC32(long_url + salt_counter)\`.
4. Repeat until an unused code is found. To avoid repeated DB lookups, use a **Bloom filter** as a fast pre-check (false positives are fine — they just trigger an unnecessary DB check).

The downside is that under high load, collision loops add **unpredictable write latency**. This is why the Base-62 approach is generally preferred.

## Deep Dive: Base-62 Encoding Math

With 7 characters from a 62-symbol alphabet:
- **62^7 = 3,521,614,606,208** unique codes (3.5 trillion)
- At 100M new URLs/day, this lasts **96 years** before exhaustion
- Even at 1B URLs/day, it lasts **9.6 years**

To avoid sequential/predictable codes, apply a **bijective scrambling function** (e.g., multiply the ID by a large prime modulo 62^7, or use a Feistel cipher) before Base-62 encoding. This makes codes appear random while remaining collision-free.

## Deep Dive: Database Partitioning

Since we have 18 TB/year of data, a single database server cannot hold everything. Partition using **consistent hashing on the short code**:

- Hash the short code to determine which shard stores it.
- Each shard handles a roughly equal fraction of the keyspace.
- Adding a new shard requires minimal data migration (only keys adjacent in the hash ring move).
- Replicate each shard with one leader and two followers for fault tolerance.

**Why not partition by user_id?** Because the redirect path (read) only has the short code — it does not know the user. Partitioning by short code makes reads a single-shard lookup.

## Deep Dive: Cache-Aside Pattern with Tiered Caching

The read path dominates (10:1 ratio), so caching is critical. Use a two-tier cache:

**Tier 1: Local In-Memory Cache (per API server)**
- Size: ~1 GB per server (holds ~2M URL mappings)
- TTL: 60 seconds (short to avoid stale data)
- Hit rate: ~50% (absorbs repeated requests for viral URLs)

**Tier 2: Distributed Redis Cluster**
- Size: ~100 GB across the cluster
- TTL: 24 hours (URLs rarely change once created)
- Hit rate: ~95% (most URLs are cached after first access)

**Tier 3: Database (source of truth)**
- Only reached for ~5% of requests (cold URLs or expired cache entries)

Flow: Check Tier 1 → miss → Check Tier 2 → miss → Query DB → populate both Tier 2 and Tier 1.

## Deep Dive: Rate Limiting

Protect the write endpoint (\`POST /api/v1/shorten\`) against abuse:
- **Per-user limit**: 100 new URLs per hour for free users, 10,000 for premium.
- **Per-IP limit**: 50 new URLs per hour for anonymous users.
- Use a **sliding window counter** in Redis to track creation rates.

## Deep Dive: Analytics Pipeline

For tracking click statistics without slowing down redirects:
1. The redirect endpoint fires an asynchronous event to a **Kafka topic** (non-blocking).
2. A Kafka consumer writes raw events to a **data warehouse** (e.g., ClickHouse, BigQuery).
3. A batch job aggregates hourly/daily click counts and updates the \`click_count\` column.
4. Real-time dashboards query the warehouse directly for detailed breakdowns (geo, device, referrer).

This decouples analytics from the critical redirect path — even if the analytics pipeline falls behind, redirects continue at full speed.`,
    explanation: `## Trade-Offs Summary

| Decision | Choice A | Choice B | Recommendation |
|----------|----------|----------|----------------|
| Short code generation | Hash + collision | Base-62 of unique ID | **Base-62** — no collisions, predictable latency |
| Redirect type | 301 (permanent) | 302 (temporary) | **302** — enables analytics; 301 for perf-critical |
| Database | SQL (MySQL/Postgres) | NoSQL (DynamoDB/Cassandra) | **Either works** — simple key-value access pattern suits NoSQL, but SQL is fine with proper indexing |
| Caching strategy | Write-through | Cache-aside (lazy) | **Cache-aside** — simpler, only caches what is actually read |
| ID generator | Single auto-increment DB | Distributed Snowflake | **Snowflake** — no single point of failure |

## Monitoring Points

- **Redirect latency P99**: Alert if > 50 ms (indicates cache miss rate is too high)
- **Cache hit ratio**: Should stay above 90%; dropping below suggests cache is undersized or TTLs are too aggressive
- **Write QPS**: Monitor for sudden spikes that may indicate bot abuse
- **Database replication lag**: Alert if followers fall more than 1 second behind the leader
- **Short code space utilization**: Track how many of the 3.5T codes have been consumed — plan capacity expansion well before exhaustion
- **Error rate on redirects**: 404s (expired or deleted URLs) should stay below 0.1%
- **ID generator availability**: If the Snowflake service goes down, no new URLs can be created`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'The system is extremely read-heavy (10:1 read-to-write ratio) — make sure your design emphasizes caching and read optimization rather than write optimization.',
      'Base-62 encoding with a unique ID generator avoids collisions entirely, while hash-based approaches require collision detection and resolution loops that add unpredictable write latency.',
      'Using MD5 or SHA-256 and truncating to 7 characters does NOT guarantee uniqueness — birthday paradox means collisions become likely much sooner than you might expect (at ~2M URLs for a 7-char hash space of 62^7, collision probability exceeds 50%).',
      'Choosing 301 (permanent) vs 302 (temporary) redirect has major implications: 301 makes the browser cache the redirect forever, which eliminates your ability to collect click analytics or change the destination URL later.',
    ],
  },
  {
    id: 9109,
    description: `## Clarifying Questions to Ask
- What is the **purpose** of the crawl — search engine indexing, data mining, or archival?
- How many **pages per month** do we need to crawl?
- What **content types** should we handle — HTML only, or also PDFs, images, and videos?
- Do we need to **re-crawl** pages periodically to detect updates, and if so, how fresh must the data be?
- Must we respect **robots.txt** and **crawl-delay** directives?
- Do we need to handle **JavaScript-rendered pages** (SPAs), or is static HTML sufficient?

## Functional Requirements
- Starting from a set of **seed URLs**, discover and download web pages by following hyperlinks (BFS traversal)
- Respect **robots.txt** rules and politeness policies (crawl delays, request limits per domain)
- **Deduplicate content** — avoid storing the same page twice even if reachable from multiple URLs
- **Deduplicate URLs** — never enqueue the same URL twice
- The system must be **extensible** — easy to add support for new content types (images, PDFs) or new processing modules

## Non-Functional Requirements
- **Scalable** to billions of pages per month
- **Robust** against spider traps, infinite loops, and malformed HTML
- **Polite** — do not overwhelm any single web server
- **Prioritized** — crawl high-value pages (news sites, popular domains) before low-value pages

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Pages/month | 1B |
| Pages/second | 1B / (30 × 86,400) ≈ **~400 pages/sec** |
| Average page size | ~500 KB (HTML + headers) |
| Storage/month (raw) | 1B × 500 KB = **~500 TB/month** |
| Storage/month (compressed) | ~500 TB × 0.3 = **~150 TB/month** |
| Metadata per URL | ~500 bytes (URL + timestamps + status) |
| URL metadata storage | 1B × 500B = **~500 GB/month** |
| DNS lookups/sec | ~400 (one per page, heavily cached) |
`,
    examples: `## Follow-Up Discussion Points

### Extensibility via Module Pipeline
Design the crawler as a **pipeline of pluggable modules**, each implementing a common interface:
1. **URL Filter** → decides whether to crawl a URL (blocklist, domain restrictions, URL pattern rules)
2. **HTML Downloader** → fetches the page (can swap in a headless browser for JS-rendered pages)
3. **Content Parser** → extracts text, links, and metadata (pluggable parsers for HTML, PDF, DOCX)
4. **Content Processor** → runs additional logic (sentiment analysis, entity extraction, indexing)
5. **URL Extractor** → pulls hyperlinks from parsed content
6. **Storage Writer** → writes to the appropriate storage backend (WARC files, HDFS, S3)

Adding support for a new content type means writing a new parser module without touching the rest of the system.

### JavaScript-Rendered Pages
Many modern websites (SPAs built with React, Angular, Vue) serve an empty HTML shell and load content via JavaScript. A traditional HTTP client sees nothing useful. Solutions:
- **Headless browser rendering** (Puppeteer, Playwright): spawn a headless Chrome instance, wait for JS execution, then extract the rendered DOM. This is 10-50x slower than plain HTTP fetching.
- **Selective rendering**: only use headless rendering for domains known to require it (maintain a registry). For all other domains, use fast HTTP fetching.
- **Pre-rendering services**: some sites offer server-side rendered versions for crawlers (detected via User-Agent). Check for this before resorting to headless rendering.

### Image and Media Crawling
- Treat images/videos as separate content types with their own download queue and storage pipeline.
- Extract image URLs from \`<img>\` tags, CSS \`background-image\`, and Open Graph meta tags.
- Store media files in blob storage (S3) with content-addressable naming (hash of content) to deduplicate.

### Geo-Distributed Crawling
- Deploy crawler nodes in multiple geographic regions (US, EU, Asia).
- Route URLs to the nearest crawler node based on the target domain's geographic location (inferred from DNS or GeoIP of the domain's server).
- This reduces network latency and bandwidth costs, and helps with legal compliance (some regions restrict data transfer).

### Incremental / Continuous Crawling
- Instead of a one-time crawl, maintain a **re-crawl schedule** for each URL based on its change frequency.
- Use HTTP \`If-Modified-Since\` and \`ETag\` headers to avoid re-downloading unchanged pages.
- Prioritize re-crawling for pages that change frequently (news sites) over static pages (legal disclaimers).`,
    intuition: `A web crawler is essentially a **large-scale distributed BFS traversal** of the internet graph, where web pages are nodes and hyperlinks are edges. Starting from a set of seed URLs, the crawler repeatedly dequeues a URL, fetches the page, extracts new URLs from the HTML, and enqueues them for future crawling. The key engineering challenges are: (1) **politeness** — not overwhelming any single web server with too many requests, (2) **deduplication** — avoiding redundant work when the same page is reachable from thousands of different URLs, (3) **spider trap detection** — handling infinitely deep or dynamically generated URL spaces that can consume all crawler resources, and (4) **priority** — crawling the most important pages first when you cannot crawl everything.`,
    approach: `## Crawl Pipeline Components

| Component | Responsibility |
|-----------|---------------|
| **Seed URLs** | Initial set of high-quality starting URLs (e.g., top 10K domains from Alexa ranking) |
| **URL Frontier** | Priority queue + politeness queue that decides which URL to crawl next |
| **HTML Downloader** | Fetches pages via HTTP, handles timeouts, retries, and redirects |
| **DNS Resolver** | Resolves domain names to IP addresses (with aggressive caching) |
| **Content Parser** | Extracts text, metadata, and structured data from raw HTML |
| **Content Dedup** | Detects near-duplicate pages using fingerprinting (simhash) |
| **URL Extractor** | Pulls all hyperlinks from parsed HTML and normalizes them |
| **URL Filter** | Removes unwanted URLs (blocked domains, non-HTTP schemes, file extensions like .zip) |
| **URL Dedup** | Checks if a URL has already been seen using a Bloom filter or hash set |
| **Storage** | Persists crawled content in compressed WARC format on distributed storage |

## Politeness Policy

| Rule | Implementation |
|------|---------------|
| Respect \`robots.txt\` | Fetch and cache \`robots.txt\` for each domain before crawling; obey Disallow and Crawl-delay directives |
| Per-host rate limit | Never send more than 1 request per second to the same host (configurable) |
| Per-host queue | Maintain a separate FIFO queue for each host — only one request from each queue is active at a time |
| Backoff on errors | If a host returns 5xx or times out, exponentially back off (1s → 2s → 4s → ... up to 1 hour) |
| Identify yourself | Set a descriptive \`User-Agent\` header with a contact URL so site owners can reach you |

## Priority Signals

| Signal | Description | Weight |
|--------|-------------|--------|
| **PageRank** | Pages linked from many other important pages are more valuable | High |
| **Domain authority** | Pages from authoritative domains (e.g., wikipedia.org) rank higher | High |
| **Freshness** | Pages that change frequently should be re-crawled sooner | Medium |
| **Depth** | Pages closer to the seed URLs (fewer hops) are generally more important | Medium |
| **Content type** | HTML pages are prioritized over images, PDFs, etc. | Low |
`,
    code: `## Full Crawl Loop Architecture

\`\`\`mermaid
graph TD
    N0["URL Frontier"]
    N2["HTML Downloader"]
    N3["Content Parser"]
    N4[("Storage (WARC/HDFS)")]
    N5["URL Extractor"]
    N6["URL Filter"]
    N7["URL Dedup (Bloom filter)"]
    N0 --> N2
    N2 --> N3
    N3 --> N4
    N3 --> N5
    N5 --> N6
    N6 --> N7
    N7 --> N0
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **URL Frontier** — A priority queue combined with politeness constraints that determines which URL to crawl next. It balances crawl importance against per-host rate limits.
- **HTML Downloader** — Fetches web pages over HTTP, handling timeouts, retries, redirects, and robots.txt compliance. This is the component that actually makes network requests.
- **Content Parser** — Extracts structured text, metadata, and links from raw HTML. Feeds parsed content to both storage and the URL extraction pipeline.
- **Storage (WARC/HDFS)** — Persists crawled page content in compressed WARC format on distributed storage for later indexing or analysis.
- **URL Extractor** — Pulls all hyperlinks from parsed HTML and normalizes them into canonical form (resolving relative paths, removing fragments).
- **URL Filter** — Removes unwanted URLs such as blocked domains, non-HTTP schemes, and file extensions like .zip or .exe that are outside the crawl scope.
- **URL Dedup (Bloom filter)** — A space-efficient probabilistic data structure that tracks which URLs have already been seen, preventing the same URL from being enqueued twice.

## URL Frontier Internal Structure

\`\`\`mermaid
graph TD
    N0["URL FRONTIER"]
    N1["PRIORITIZER (Front Queue)"]
    N2["Priority Queue 1"]
    N3["Priority Queue 2"]
    N4["Priority Queue N"]
    N5["POLITENESS ROUTER (Back Queue)"]
    N6["cnn.com Queue"]
    N7["bbc.com Queue"]
    N8["blog.xyz Queue"]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    N1 --> N4
    N2 --> N5
    N3 --> N5
    N4 --> N5
    N5 --> N6
    N5 --> N7
    N5 --> N8
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **URL FRONTIER** — The top-level entry point that receives newly discovered URLs and feeds them into the two-layer prioritization and politeness system.
- **PRIORITIZER (Front Queue)** — Assigns each URL a priority score based on PageRank, domain authority, freshness, and crawl depth, then routes it to the appropriate priority queue.
- **Priority Queue 1 / 2 / N** — Multiple priority tiers (e.g., high, medium, low) that hold URLs sorted by importance. A weighted selector draws from higher-priority queues more frequently.
- **POLITENESS ROUTER (Back Queue)** — Routes prioritized URLs to per-host FIFO queues, ensuring that URLs for the same domain are grouped together for rate-limited fetching.
- **cnn.com Queue / bbc.com Queue / blog.xyz Queue** — Per-host queues that enforce crawl-delay politeness. Only one request from each host queue is active at a time to avoid overwhelming any single server.

## Distributed Multi-Region Setup

\`\`\`mermaid
graph TD
    N0["US Region Crawlers x50"]
    N1[("Central Storage (HDFS / S3)")]
    N0 --> N1
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **US Region Crawlers x50** — A fleet of 50 crawler machines deployed in the US region, working in parallel to maximize crawl throughput while staying geographically close to US-hosted sites.
- **Central Storage (HDFS / S3)** — A centralized distributed file system where all crawled content from every region is persisted in WARC format for later retrieval and indexing.
`,
    jsCode: `## Deep Dive: URL Frontier (Priority + Politeness)

The URL frontier is the most complex component. It has two layers:

**Layer 1 — Prioritizer (Front Queues)**
- Incoming URLs are assigned a priority score based on PageRank, domain authority, freshness, and crawl depth.
- URLs are placed into one of N priority queues (e.g., high, medium, low). A weighted random selector picks from these queues, favoring high-priority queues but not starving low-priority ones.

**Layer 2 — Politeness Router (Back Queues)**
- URLs selected from the front queues are routed to per-host FIFO queues. Each host (e.g., \`cnn.com\`) has exactly one queue.
- A **heap-based scheduler** tracks the earliest allowed fetch time for each host queue. The scheduler pops the host with the earliest fetch time, dequeues one URL from that host's queue, and sets the next allowed fetch time to \`now + crawl_delay\` (from robots.txt, or a default of 1 second).
- This guarantees that no single host is hit more than once per \`crawl_delay\` interval, regardless of how many URLs from that host are in the frontier.

## Deep Dive: Content Deduplication with Simhash

Many pages on the web are near-duplicates (e.g., printer-friendly versions, pages with slightly different ads or timestamps). Exact checksum matching (MD5) catches only byte-identical copies. **Simhash** detects near-duplicates:

1. Tokenize the page content into shingles (e.g., 3-word sliding windows).
2. Hash each shingle to a 64-bit value.
3. For each bit position, sum +1 if the bit is 1 and -1 if it is 0 across all shingle hashes.
4. The final simhash is the 64-bit fingerprint where each bit is 1 if the sum for that position is positive.

Two pages are near-duplicates if their simhash values differ in **3 or fewer bit positions** (Hamming distance ≤ 3). This can be checked efficiently using a lookup table partitioned by simhash prefixes.

## Deep Dive: URL Deduplication with Bloom Filters

With billions of URLs, storing every seen URL in a hash set is expensive (~100 bytes per URL × 10B URLs = 1 TB). A **Bloom filter** provides a space-efficient probabilistic solution:

- A Bloom filter with 10B entries and 1% false positive rate requires only **~12 GB** of memory.
- False positives mean occasionally skipping a URL we have not actually seen — this is acceptable because the impact is just missing one page out of billions.
- False negatives never occur — we never crawl a page we have already seen.
- For even lower false positive rates, use a **counting Bloom filter** or **cuckoo filter** that also supports deletion.

## Deep Dive: Spider Trap Detection

Spider traps are pages that generate an infinite number of URLs to waste crawler resources. Common patterns:
- **Infinite calendar pages**: \`/calendar/2025/01/01\`, \`/calendar/2025/01/02\`, ... forever
- **Session ID in URL**: \`/page?sid=abc123\` — each visit gets a new session ID, making every URL appear unique
- **Symbolic link loops**: Directory structures where \`/a/b/c/a/b/c/...\` repeats infinitely

Detection and mitigation strategies:
1. **Maximum URL length**: Reject URLs longer than 2048 characters.
2. **Maximum crawl depth**: Stop following links beyond depth 100 from any seed URL.
3. **URL pattern detection**: If a domain generates more than 10,000 URLs matching a repetitive pattern (regex), flag it for manual review and throttle crawling.
4. **Path repetition detection**: If the same path component appears more than 3 times in a URL (e.g., \`/a/b/a/b/a/b\`), discard it.
5. **Manual blocklist**: Maintain a curated list of known spider trap domains.

## Deep Dive: DNS Caching

DNS resolution is a major bottleneck for crawlers. Each page fetch requires a DNS lookup, and at 400 pages/sec, that is 400 lookups/sec. Standard DNS servers may not handle this gracefully.

Solutions:
- **Local DNS cache** on each crawler machine with a TTL of 1 hour (most DNS records do not change faster than this).
- **Pre-fetching DNS records** in bulk for all domains in the URL frontier, so lookups are served from cache when the actual crawl request happens.
- **Dedicated DNS infrastructure**: Run your own caching DNS resolver (e.g., Unbound) to avoid rate limits from public DNS servers.

## Deep Dive: robots.txt Handling

Before crawling any page on a domain, the crawler must fetch and parse \`/robots.txt\`:
- Cache the parsed rules per domain with a TTL of 24 hours.
- Respect \`Disallow\` directives for your User-Agent.
- Respect \`Crawl-delay\` if specified (use it as the minimum inter-request delay for that host).
- If \`robots.txt\` returns 5xx, assume the site is temporarily down and retry later. If it returns 404, assume all pages are allowed.

## Deep Dive: WARC Storage Format

Crawled pages are stored in **WARC (Web ARChive)** format, the industry standard used by the Internet Archive:
- Each WARC file is a container holding multiple records (request headers, response headers, response body, metadata).
- Files are typically 1 GB each, compressed with gzip, achieving ~3:1 compression on HTML.
- WARC files are stored on distributed file systems (HDFS, S3) and indexed by URL and crawl timestamp for later retrieval.`,
    explanation: `## Bottlenecks and Scaling

The primary bottleneck in a web crawler shifts as you scale:

1. **DNS resolution** is the first bottleneck — solved with aggressive local caching and dedicated DNS infrastructure.
2. **Network bandwidth** becomes the limit once DNS is solved — at 400 pages/sec × 500 KB = 200 MB/sec, you need substantial egress bandwidth. Distribute across regions to parallelize.
3. **URL frontier coordination** — with multiple crawler machines, the frontier must be distributed (e.g., partition by domain hash so each machine owns a subset of domains).
4. **Storage I/O** — writing 500 TB/month requires high-throughput distributed storage. Use HDFS or S3 with parallel uploads.

## Trade-Offs Summary

| Decision | Choice A | Choice B | Recommendation |
|----------|----------|----------|----------------|
| BFS vs DFS traversal | BFS (explore broadly) | DFS (explore deeply) | **BFS** — avoids getting stuck in deep spider traps |
| URL dedup | Hash set (exact) | Bloom filter (probabilistic) | **Bloom filter** — 100x less memory at the cost of rare false positives |
| Content dedup | MD5 checksum (exact) | Simhash (near-duplicate) | **Simhash** — catches near-duplicates that MD5 misses |
| Page fetching | Plain HTTP | Headless browser | **Plain HTTP** for 95% of pages, headless browser only when needed |
| Storage format | Raw HTML files | WARC containers | **WARC** — industry standard, self-describing, efficient |
| Crawl scheduling | One-time batch | Continuous with re-crawl | **Continuous** — keeps data fresh without full re-crawls |`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'The URL frontier is not a simple queue — it must balance priority (crawl important pages first) with politeness (do not overwhelm any single host). Describe both layers explicitly: front queues for priority, back queues for per-host rate limiting.',
      'DNS resolution is a hidden bottleneck that many candidates overlook. At hundreds of pages per second, you need a dedicated caching DNS resolver — relying on the system default DNS will throttle your entire crawler.',
      'Spider traps (infinite calendars, session IDs in URLs, symbolic link loops) can consume all your crawler resources. You must have explicit defenses: max URL length, max crawl depth, path repetition detection, and a manual blocklist.',
      'Content deduplication and URL deduplication are two different problems. URL dedup prevents enqueuing the same URL twice (solved with Bloom filters). Content dedup prevents storing the same page content twice even when reached via different URLs (solved with simhash fingerprinting).',
    ],
  },
  {
    id: 9110,
    description: `## Clarifying Questions to Ask
- What **notification channels** must we support — push notifications, SMS, email, or all three?
- What is the expected **daily volume** for each channel?
- Is this a **real-time** system or can notifications be delayed by seconds or minutes?
- Do users need fine-grained **preference controls** (e.g., opt out of marketing emails but keep security alerts)?
- Do we need to guarantee **at-least-once delivery**, or is best-effort acceptable?
- Should the system support **scheduled notifications** (e.g., send at 9 AM in the user's timezone)?
- Do we need **template management** for consistent formatting across notifications?

## Functional Requirements
- Send **push notifications** (iOS via APNs, Android via FCM) to user devices
- Send **SMS** messages via third-party providers (Twilio, Vonage)
- Send **emails** via third-party providers (SendGrid, Amazon SES)
- Users can **manage notification preferences** — opt in/out per channel and per notification type
- Support **notification templates** with variable substitution for consistent messaging
- Provide a **notification log** so users can view their notification history

## Non-Functional Requirements
- **No lost notifications** — every notification that enters the system must eventually be delivered (at-least-once guarantee)
- **Soft real-time** — most notifications delivered within 5 seconds of being triggered
- **Scalable** to tens of millions of notifications per day across all channels
- **Extensible** — adding a new channel (e.g., Slack, WhatsApp) should not require redesigning the system

## Third-Party Providers

| Channel | Providers | Characteristics |
|---------|-----------|----------------|
| iOS Push | **APNs** (Apple Push Notification Service) | Requires device token, SSL certificate, payload ≤ 4 KB |
| Android Push | **FCM** (Firebase Cloud Messaging) | Requires registration token, payload ≤ 4 KB |
| SMS | **Twilio**, Vonage, Plivo | Per-message cost ($0.01-0.05), character limits, carrier filtering |
| Email | **SendGrid**, Amazon SES, Mailgun | Bulk-friendly, spam score concerns, bounce handling required |

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Push notifications/day | 10M |
| SMS/day | 1M |
| Emails/day | 5M |
| Total notifications/day | **16M** |
| Peak QPS (assuming 3x average) | 16M / 86,400 × 3 ≈ **555/sec** |
| Notification record size | ~1 KB (payload + metadata) |
| Daily storage (logs) | 16M × 1 KB = **~16 GB/day** |
| Monthly storage (logs) | **~480 GB/month** |
`,
    examples: `## Follow-Up Discussion Points

### Guaranteeing No Notification Loss
The critical path for reliability:
1. When a notification request arrives, **persist it to the notification log** (database) with status \`PENDING\` before doing anything else.
2. Then enqueue it to the message queue. If the service crashes between step 1 and step 2, a background reconciliation job detects \`PENDING\` entries older than 30 seconds and re-enqueues them.
3. Workers consume from the queue and attempt delivery. On success, update status to \`DELIVERED\`. On failure, the message returns to the queue (either via explicit NACK or visibility timeout).
4. After N retries, move the notification to a **dead letter queue (DLQ)** and update status to \`FAILED\`. Alert the operations team.

This combination of **persistent logging + message queue + retry + DLQ** ensures no notification is silently dropped.

### Preventing Duplicate Notifications
Duplicate delivery can annoy users (imagine receiving the same SMS 3 times). Prevention mechanisms:
- Assign a globally unique **event_id** to each notification at creation time.
- Before enqueuing, check if this event_id already exists in a Redis dedup cache (TTL: 1 hour). If it does, skip it.
- Workers also check the event_id in the notification log before delivery — if status is already \`DELIVERED\`, skip.
- This provides **idempotent processing** even if the same event is published multiple times (e.g., due to upstream retries).

### Handling Provider Outages
Third-party providers (APNs, Twilio, SendGrid) have their own outages:
- Maintain **multiple providers per channel** (e.g., Twilio as primary SMS, Vonage as fallback).
- Implement a **circuit breaker** pattern: if a provider fails 5 consecutive requests, trip the circuit and route to the fallback provider for 60 seconds before retrying the primary.
- For email, maintain separate IP pools so a bounce/spam issue with one provider does not affect deliverability on the other.

### Template Management
- Store notification templates in a **template service** with versioning (e.g., \`welcome_email_v3\`).
- Templates support variable interpolation: \`"Hello {{user.name}}, your order {{order.id}} has shipped."\`
- Before sending, the notification worker renders the template by substituting variables from the event payload.
- This decouples content from code — product managers can update notification text without deploying new code.

### Adding a New Channel (e.g., Slack)
The extensibility test of any good notification system design:
1. Create a new \`SlackWorker\` that reads from a new \`slack_queue\`.
2. Register the Slack channel in the preference management system so users can opt in.
3. Add a Slack case to the queue router logic.
4. No changes needed to the intake layer, dedup logic, or notification log — the core system is channel-agnostic.`,
    intuition: `A notification system is a **high-throughput message routing engine** that accepts notification requests from internal services and delivers them to users via the appropriate channel (push, SMS, or email). The core design challenges are: (1) **reliability** — no notification should be silently lost, which requires persistent logging, message queues with retry semantics, and dead letter queues; (2) **user preference management** — users must have fine-grained control over what they receive and on which channels; and (3) **channel-specific characteristics** — each delivery channel (APNs, FCM, Twilio, SendGrid) has different payload formats, rate limits, failure modes, and cost structures, so the system must abstract these differences behind a common interface.`,
    approach: `## Three-Layer Architecture

The system is organized into three layers:
1. **Intake Layer**: Receives notification requests from internal services via API or message queue. Validates, deduplicates, and persists the request.
2. **Routing Layer**: Looks up user preferences and device information, applies rate limiting, renders templates, and routes to the correct channel queue.
3. **Delivery Layer**: Channel-specific workers consume from their respective queues and deliver via third-party providers with retry logic.

## API Design

| Endpoint | Method | Parameters | Response |
|----------|--------|------------|----------|
| \`/api/v1/notifications/send\` | POST | \`{ user_id, type, channel?, payload, scheduled_at? }\` | \`{ notification_id }\` (202 Accepted) |
| \`/api/v1/notifications/{id}\` | GET | Path param: \`notification_id\` | \`{ status, channel, sent_at, delivered_at }\` |
| \`/api/v1/users/{id}/preferences\` | GET | Path param: \`user_id\` | \`{ preferences: [...] }\` |
| \`/api/v1/users/{id}/preferences\` | PUT | \`{ channel, type, enabled }\` | \`{ updated: true }\` |

## Data Model

### User Devices Table

| Column | Type | Description |
|--------|------|-------------|
| \`user_id\` | BIGINT | Foreign key to users table |
| \`device_token\` | VARCHAR(255) | APNs or FCM device token |
| \`platform\` | ENUM('ios', 'android') | Device platform |
| \`last_active_at\` | TIMESTAMP | Last time this device was active |
| \`is_active\` | BOOLEAN | Whether to send push to this device |

### Notification Preferences Table

| Column | Type | Description |
|--------|------|-------------|
| \`user_id\` | BIGINT | Foreign key to users table |
| \`channel\` | ENUM('push', 'sms', 'email') | Notification channel |
| \`notification_type\` | VARCHAR(50) | e.g., 'marketing', 'transactional', 'security' |
| \`enabled\` | BOOLEAN | Whether the user has opted in |

### Notification Log Table

| Column | Type | Description |
|--------|------|-------------|
| \`notification_id\` | UUID PK | Globally unique identifier |
| \`event_id\` | VARCHAR(64) UNIQUE | Deduplication key from the source event |
| \`user_id\` | BIGINT | Target user |
| \`channel\` | VARCHAR(20) | Delivery channel used |
| \`status\` | ENUM('pending', 'queued', 'sent', 'delivered', 'failed') | Current lifecycle state |
| \`payload\` | JSON | The notification content |
| \`created_at\` | TIMESTAMP | When the request was received |
| \`sent_at\` | TIMESTAMP | When it was handed to the provider |
| \`retry_count\` | INT | Number of delivery attempts |

## Message Queue Configuration

| Queue | Consumer | Purpose |
|-------|----------|---------|
| \`push_ios_queue\` | APNs Worker Pool | iOS push notifications |
| \`push_android_queue\` | FCM Worker Pool | Android push notifications |
| \`sms_queue\` | Twilio Worker Pool | SMS messages |
| \`email_queue\` | SendGrid Worker Pool | Email messages |
| \`dead_letter_queue\` | Alert / Manual Review | Failed after max retries |
`,
    code: `## Full Notification Flow

\`\`\`mermaid
graph TD
    N0["Service A (Orders)"]
    N1["Service B (Auth)"]
    N2["Service C (Marketing)"]
    N3["Notification Service (API)"]
    N4["Queue Router"]
    N5["iOS Push Queue"]
    N6["Android Push Q"]
    N7["SMS Queue"]
    N8["Email Queue"]
    N9["APNs Workers"]
    N10["FCM Workers"]
    N11["Twilio Workers"]
    N12["SendGrid Workers"]
    N13["Apple APNs"]
    N14["Google FCM"]
    N15["Twilio"]
    N16["SendGrid"]
    N0 --> N3
    N1 --> N3
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N4 --> N6
    N4 --> N7
    N4 --> N8
    N5 --> N9
    N6 --> N10
    N7 --> N11
    N8 --> N12
    N9 --> N13
    N10 --> N14
    N11 --> N15
    N12 --> N16
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N10 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N11 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N12 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N13 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N14 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N15 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N16 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Service A (Orders) / Service B (Auth) / Service C (Marketing)** — Internal microservices that trigger notifications based on business events such as order confirmations, login alerts, or promotional campaigns.
- **Notification Service (API)** — The central intake layer that receives notification requests, validates them, deduplicates by event_id, and persists them to the notification log before routing.
- **Queue Router** — Inspects the notification's target channel and user preferences, then routes the message to the appropriate channel-specific queue.
- **iOS Push Queue / Android Push Q / SMS Queue / Email Queue** — Channel-specific message queues that buffer notifications and decouple the intake layer from the delivery layer, allowing independent scaling per channel.
- **APNs Workers / FCM Workers / Twilio Workers / SendGrid Workers** — Consumer pools that read from their respective queues and handle delivery logic including retries, exponential backoff, and circuit breaking.
- **Apple APNs / Google FCM / Twilio / SendGrid** — Third-party provider APIs that perform the actual delivery of notifications to end-user devices, phone numbers, or email inboxes.

## Internal Processing Pipeline

\`\`\`mermaid
graph TD
    N0["NOTIFICATION SERVICE"]
    N1["Rate Limiter"]
    N2["Dedup Check"]
    N3["Preference Check"]
    N4["Device Lookup"]
    N5["Template Renderer"]
    N6[("Notification Log (DB)")]
    N7["Queue Router"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N5 --> N7
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **NOTIFICATION SERVICE** — The entry point that receives an incoming notification request and kicks off the internal processing pipeline.
- **Rate Limiter** — Enforces per-user and per-channel rate limits (e.g., max 10 SMS/hour) to prevent notification flooding from upstream bugs or abuse.
- **Dedup Check** — Looks up the event_id in a Redis cache to reject duplicate notification requests, ensuring idempotent processing.
- **Preference Check** — Queries the user's notification preferences to determine if they have opted in to this channel and notification type. Mandatory notifications (security alerts) bypass this check.
- **Device Lookup** — Fetches the user's registered device tokens (for push) or contact info (phone, email) from the user devices table.
- **Template Renderer** — Loads the notification template and substitutes variables from the event payload to produce the final message content.
- **Notification Log (DB)** — The persistent record of every notification with its lifecycle status, serving as the source of truth for reliability and audit trails.
- **Queue Router** — Routes the rendered notification to the correct channel-specific message queue based on the delivery channel.

## Retry Flow

\`\`\`mermaid
graph TD
    N0["Worker attempts delivery"]
    N1{"Delivery successful?"}
    N2["Mark as DELIVERED"]
    N3{"Retries < max?"}
    N4["Wait with exponential backoff"]
    N5["Move to Dead Letter Queue"]
    N0 --> N1
    N1 -->|Yes| N2
    N1 -->|No| N3
    N3 -->|Yes| N4
    N4 --> N0
    N3 -->|No| N5
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Worker attempts delivery** — The channel-specific worker that picks up a notification from the queue and tries to deliver it via the third-party provider.
- **Delivery successful?** — A decision point that checks the provider's response to determine if delivery succeeded or failed.
- **Mark as DELIVERED** — On success, the notification log is updated to DELIVERED status, completing the notification lifecycle.
- **Retries < max?** — A decision point that checks whether the retry count has been exhausted (typically 3-5 attempts) before giving up.
- **Wait with exponential backoff** — On retriable failure, the worker waits an increasing interval (1s, 2s, 4s, ...) before re-attempting delivery to avoid hammering a struggling provider.
- **Move to Dead Letter Queue** — After exhausting all retries, the notification is moved to a DLQ for manual investigation, and its status is set to FAILED.

## Event Tracking Pipeline

\`\`\`mermaid
graph TD
    N0["Kafka Topic"]
    N1["Stream Processor"]
    N2["Analytics Dashboard"]
    N3[("Metrics DB (ClickHouse)")]
    N0 --> N1
    N1 --> N3
    N3 --> N2
    style N0 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Kafka Topic** — A durable message log that captures every notification delivery event (sent, delivered, failed, clicked) for downstream analytics processing.
- **Stream Processor** — A real-time processing engine (e.g., Flink or Spark Streaming) that aggregates raw notification events into per-channel and per-type metrics.
- **Metrics DB (ClickHouse)** — A columnar time-series database optimized for fast analytical queries over large volumes of notification delivery metrics.
- **Analytics Dashboard** — A read-only UI that displays delivery rates, failure rates, latency distributions, and channel health, enabling operations teams to monitor system performance.
`,
    jsCode: `## Deep Dive: Reliability with Persistent Notification Log

The notification log is the backbone of reliability. Every notification that enters the system gets a row in the database before it is enqueued to any message queue. This ensures that even if the message queue loses data (unlikely but possible), we have a persistent record of what needs to be sent.

**Reconciliation Process:**
- A background job runs every 30 seconds and queries for notifications with status \`PENDING\` and \`created_at\` older than 30 seconds.
- For each stale pending notification, it re-enqueues the message to the appropriate channel queue.
- This handles edge cases like: the notification service crashes after writing the log but before publishing to the queue; or the queue briefly becomes unavailable.

**Status State Machine:**
\`\`\`
PENDING → QUEUED → SENT → DELIVERED
                    ↓
                  FAILED (after max retries)
\`\`\`

Each transition is logged with a timestamp, creating a full audit trail for debugging delivery issues.

## Deep Dive: Deduplication with event_id in Redis

Upstream services may accidentally send the same notification event multiple times (e.g., due to retries after a timeout). Without dedup, users receive duplicate messages.

**Implementation:**
- Every incoming notification request must include an \`event_id\` (a unique identifier generated by the source service, e.g., \`order_shipped_12345\`).
- On receipt, the notification service executes \`SET event_id NX EX 3600\` in Redis. If the key already exists (SET returns null), the request is a duplicate and is immediately dropped with a 200 OK response (idempotent).
- The 1-hour TTL is sufficient because source services rarely retry after more than a few minutes.
- For defense-in-depth, the notification log table also has a UNIQUE constraint on \`event_id\`, so even if Redis is unavailable, the database rejects duplicates.

## Deep Dive: User Preference Management

Preferences are stored as a matrix of (user, channel, notification_type) → enabled/disabled:

**User 1234 Preferences:**

| Notification Type | Email | SMS | Push |
|-------------------|-------|-----|------|
| Security (2FA, password) | Always ON | Always ON | Always ON |
| Transactional (orders) | ON | OFF | ON |
| Social (likes, follows) | OFF | OFF | ON |
| Marketing (promos) | OFF | OFF | OFF |

**Rules:**
- Security notifications (password reset, 2FA) are always sent regardless of preferences — these are mandatory.
- Marketing and social notifications respect user opt-in/opt-out settings.
- If a user has no preference record for a given (channel, type) pair, apply the **system default** (opt-in for transactional, opt-out for marketing).
- Preference checks are cached in Redis with a 5-minute TTL to avoid database lookups on every notification.

## Deep Dive: Rate Limiting Per User

Without rate limiting, a bug in an upstream service could flood a user with hundreds of notifications in seconds:

- **Per-user, per-channel limit**: Max 100 push, 10 SMS, 50 emails per hour per user.
- **Global per-channel limit**: Max 10M push/day, 1M SMS/day (aligned with provider contracts and budgets).
- **Implementation**: Sliding window counter in Redis keyed by \`ratelimit:{user_id}:{channel}:{hour_bucket}\`.
- When a user exceeds their limit, the notification is not dropped — it is **deferred** to the next hour window or downgraded to a lower-priority queue. Only marketing notifications are dropped; transactional notifications are always delivered.

## Deep Dive: Priority Queues

Not all notifications are equally urgent:

| Priority | Examples | SLA |
|----------|----------|-----|
| **Critical** | 2FA codes, security alerts, payment confirmations | < 1 second |
| **High** | Order updates, shipping notifications | < 5 seconds |
| **Medium** | Social interactions (likes, comments, follows) | < 30 seconds |
| **Low** | Marketing emails, weekly digests, product updates | < 5 minutes |

**Implementation:**
- Each channel has multiple queues at different priority levels (e.g., \`sms_critical\`, \`sms_high\`, \`sms_medium\`, \`sms_low\`).
- Workers always drain higher-priority queues first using a weighted consumption strategy (e.g., for every 10 messages, consume 5 critical, 3 high, 1 medium, 1 low).
- This ensures that a marketing email blast does not delay a 2FA code.`,
    explanation: `## Trade-Offs Summary

| Decision | Choice A | Choice B | Recommendation |
|----------|----------|----------|----------------|
| Delivery guarantee | At-most-once (fire and forget) | At-least-once (persist + retry) | **At-least-once** with dedup to approximate exactly-once |
| Queue per channel vs single queue | Separate queues per channel | One unified queue | **Separate queues** — different channels have different throughput and failure characteristics |
| Template storage | Inline in code | External template service | **External service** — allows content changes without deployments |
| Provider strategy | Single provider per channel | Multiple with failover | **Multiple** — circuit breaker pattern for resilience |
| Rate limiting behavior | Drop excess notifications | Defer to next window | **Defer** for transactional, **drop** for marketing |

## Monitoring Points

- **End-to-end delivery latency** (P50, P95, P99): Time from request receipt to provider confirmation. Alert if P99 exceeds 10 seconds.
- **Queue depth per channel**: If a queue is growing faster than workers can drain it, scale up workers or investigate provider issues.
- **Provider error rate**: Track 4xx and 5xx responses from each provider. Trip circuit breaker at 5 consecutive failures.
- **Dedup hit rate**: If suddenly high, investigate which upstream service is sending duplicate events.
- **DLQ size**: Any messages in the dead letter queue need manual investigation. Alert if DLQ grows above 100 messages.
- **Preference opt-out rate**: Sudden spikes in opt-outs may indicate notification fatigue or a bug sending too many messages.
- **Bounce rate (email)**: High bounce rate damages sender reputation and email deliverability. Alert if above 2%.`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'The most common mistake is treating notification delivery as a synchronous operation. Always use message queues to decouple the intake layer from the delivery layer — this provides buffering during traffic spikes and isolation when a specific provider goes down.',
      'Deduplication must happen at two levels: (1) at the intake layer using event_id to prevent the same event from being processed twice, and (2) at the worker layer by checking the notification log status before delivering, in case the same message was enqueued twice due to a race condition.',
      'Do not design a single monolithic queue for all channels. Each channel (push, SMS, email) has vastly different throughput, latency, and failure characteristics. Separate queues allow independent scaling and prevent a slow channel from blocking a fast one.',
      'User preference management is not optional — it is legally required in many jurisdictions (CAN-SPAM, GDPR). Design it as a first-class component with caching, not as an afterthought bolted on later.',
    ],
  },
  {
    id: 9111,
    description: `## Clarifying Questions to Ask
- Is this a **mobile app, web app, or both**?
- What types of content can appear in the feed — **text, images, videos, links**?
- How is the feed **sorted** — chronological, ranked by relevance, or a mix?
- What is the maximum number of **friends/followers** a user can have?
- How many **daily active users** does the system need to support?
- Should the feed include posts from **pages, groups, and advertisers**, or just friends?

## Functional Requirements
- A user can **publish a post** (text, images, video links) that appears in friends' feeds
- A user can **retrieve their news feed** — an aggregated, sorted list of posts from people they follow
- The feed supports **pagination** — users scroll through content incrementally
- Posts can be **sorted by recency** (chronological) or **ranked by relevance** (algorithmic)

## Non-Functional Requirements
- **Low latency feed retrieval** — feed page should load in under 200 ms
- **High availability** — the feed is the core product; downtime directly impacts user engagement
- Support **10M+ DAU** with feeds refreshed frequently throughout the day
- **Eventually consistent** — a new post may take a few seconds to appear in all followers' feeds, but must appear eventually

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily Active Users (DAU) | 10M |
| Average friends per user | 300 |
| Posts per user per day | 2 |
| Total new posts/day | 10M × 2 = **20M** |
| Feed fetches per user/day | ~10 |
| Feed fetch QPS | 10M × 10 / 86,400 ≈ **1,160/sec** |
| Peak feed fetch QPS (5x) | **~5,800/sec** |
| Average post size | ~1 KB (text + metadata, media stored separately) |
| Post storage/day | 20M × 1 KB = **~20 GB/day** |
| Feed cache per user | Top 200 post IDs × 8 bytes ≈ **1.6 KB** |
| Total feed cache | 10M × 1.6 KB = **~16 GB** (fits in memory) |
`,
    examples: `## Follow-Up Discussion Points

### The Celebrity Problem in Depth
A celebrity with 10M followers posting once triggers 10M fan-out writes if using push model. This is not just slow — it can cause:
- **Queue backup**: The fanout worker queue grows to millions of entries, delaying feed updates for all users.
- **Hot partition**: If the celebrity's follower list is on one shard, that shard becomes a bottleneck.
- **Wasted writes**: Many followers are inactive and will never read the feed — those writes are wasted.

**Solution**: Classify users as "normal" (< 10K followers) or "celebrity" (>= 10K followers). Use push for normal users and pull for celebrities. When a user fetches their feed, the system merges the pre-computed feed (from push) with real-time lookups of celebrity posts (from pull).

### Cache Invalidation Challenges
- When a user **deletes a post**, it must be removed from the feeds of all followers. With push model, this means updating millions of cached feeds. Instead, mark the post as deleted in the post store and filter it out at read time.
- When a user **unfollows someone**, their feed should no longer include that person's posts. Rather than cleaning up cached feeds, apply the filter during feed retrieval.
- When a user's **account is suspended**, all their posts must be hidden. Again, handle at read time with a user status check.

### Feed Ranking (EdgeRank-style)
Facebook's original EdgeRank formula:
\`\`\`
Score = Affinity × Weight × Decay
\`\`\`
- **Affinity**: How close the viewer is to the post author (based on interaction history — likes, comments, profile visits, message frequency).
- **Weight**: Type of interaction (comments > likes > views; photos > text-only posts).
- **Decay**: How old the post is (newer posts score higher).

Modern ranking uses ML models with hundreds of features, but the core signals remain: relationship strength, content type, and recency.

### Pagination Approaches
- **Offset-based** (\`GET /feed?page=2&size=20\`): Simple but unreliable for feeds — new posts shift existing posts, causing duplicates or missed items when paginating.
- **Cursor-based** (\`GET /feed?cursor=post_id_123&size=20\`): The cursor points to the last post the user saw. The server returns the next 20 posts after that cursor. This is stable even as new posts are added.
- **Recommendation**: Always use cursor-based pagination for feeds. The cursor can be a post ID or a timestamp.

### Content Moderation
- Posts flagged by automated systems (hate speech, spam, nudity detection) are either removed or hidden pending human review.
- The feed retrieval pipeline includes a moderation filter that checks each post's status before including it in the feed.
- Time-sensitive: a viral post containing misinformation must be suppressed within minutes, not hours.`,
    intuition: `A news feed aggregates posts from all the entities a user follows into a single sorted timeline. The core architectural decision is **fanout-on-write (push model)** versus **fanout-on-read (pull model)**. In the push model, when a user publishes a post, the system immediately writes that post's ID into the feed cache of every follower — making feed retrieval instant but writes expensive. In the pull model, the feed is computed on demand by fetching recent posts from all followed users and merging them — making writes cheap but reads expensive. Most production systems use a **hybrid approach**: push for normal users (fast feed reads for the common case) and pull for celebrities (avoids millions of fan-out writes per post). This balances write amplification against read latency.`,
    approach: `## Two Core APIs

| Endpoint | Method | Parameters | Response |
|----------|--------|------------|----------|
| \`/api/v1/feed/publish\` | POST | \`{ user_id, content, media_ids[], type }\` | \`{ post_id }\` (201 Created) |
| \`/api/v1/feed\` | GET | \`{ user_id, cursor?, size=20 }\` | \`{ posts: [...], next_cursor }\` |

## Fanout-on-Write vs Fanout-on-Read

| Criteria | Fanout-on-Write (Push) | Fanout-on-Read (Pull) |
|----------|----------------------|---------------------|
| **Write cost** | High — one write per follower | Low — single write to post store |
| **Read cost** | Low — feed is pre-computed, just read from cache | High — must query N friends' post lists and merge |
| **Read latency** | **Very low** (< 10 ms, cache read) | Higher (proportional to number of followed users) |
| **Celebrity problem** | Severe — 10M followers = 10M writes per post | No issue — celebrity posts are fetched on demand |
| **Data freshness** | Posts appear in feed within seconds of publishing | Posts appear instantly (computed at read time) |
| **Resource usage** | More storage (duplicated post IDs in every follower's feed cache) | More compute (merge + sort on every read) |

## Hybrid Approach (Recommended)

Combine both strategies based on the post author's follower count:
- **Normal users** (< 10K followers): Use **fanout-on-write**. When they post, push the post ID into each follower's feed cache. Feed reads are instant cache lookups.
- **Celebrities** (>= 10K followers): Use **fanout-on-read**. Their posts are NOT pushed. When a follower fetches their feed, the system also pulls recent posts from any celebrity they follow and merges them with the pre-computed feed.

This gives the best of both worlds: fast reads for 99%+ of the feed (pre-computed) with a small on-demand merge for celebrity posts.

## Data Model

### Posts Table

| Column | Type | Description |
|--------|------|-------------|
| \`post_id\` | BIGINT PK | Snowflake-generated unique ID (encodes timestamp) |
| \`user_id\` | BIGINT | Author of the post |
| \`content\` | TEXT | Post text content |
| \`media_ids\` | JSON | Array of media asset IDs (stored in CDN) |
| \`created_at\` | TIMESTAMP | Post creation time |
| \`is_deleted\` | BOOLEAN | Soft delete flag |

### Feed Cache (Redis Sorted Set per user)

| Key | Score | Member |
|-----|-------|--------|
| \`feed:{user_id}\` | post timestamp | post_id |

Each user's feed cache holds the top 200-500 post IDs sorted by time/rank. The actual post content is stored separately and fetched by ID.
`,
    code: `## Feed Publishing Flow

\`\`\`mermaid
graph TD
    N0["Post Service"]
    N1["Fanout Service"]
    N2["(pull at read time)"]
    N0 --> N1
    N0 --> N2
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Post Service** — Receives new post submissions, persists them to the post database, and triggers the fanout process for normal users.
- **Fanout Service** — For non-celebrity authors, pushes the new post ID into each follower's Redis feed cache asynchronously via message queue workers.
- **(pull at read time)** — Represents the pull path for celebrity posts. Instead of fanning out to millions of followers, celebrity posts are fetched on demand when a follower requests their feed.

## Feed Retrieval Flow

\`\`\`mermaid
graph TD
    N0["User requests feed"]
    N1["Feed Service"]
    N2[("Redis Feed Cache")]
    N3{"Cache hit?"}
    N4["Return cached feed"]
    N5["Query Social Graph + Posts DB"]
    N6["Rank and assemble feed"]
    N7["Cache result in Redis"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 -->|Yes| N4
    N3 -->|No| N5
    N5 --> N6
    N6 --> N7
    N7 --> N4
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **User requests feed** — The client-side trigger when a user opens their app or scrolls to refresh, initiating a feed fetch request.
- **Feed Service** — The backend service responsible for assembling a personalized feed by coordinating cache lookups, database queries, and ranking logic.
- **Redis Feed Cache** — A Redis sorted set per user containing pre-computed post IDs from the fanout-on-write pipeline, enabling sub-10ms feed reads for the common case.
- **Cache hit?** — A decision point that determines whether the user's feed is available in the Redis cache or needs to be computed from scratch.
- **Return cached feed** — The fast path that returns the pre-computed feed directly from Redis, which handles the majority of feed requests.
- **Query Social Graph + Posts DB** — The slow path on cache miss, which fetches the user's follow list and recent posts from the database to build the feed from scratch.
- **Rank and assemble feed** — Applies the ranking algorithm (affinity x weight x decay) to sort candidate posts by predicted engagement rather than pure chronological order.
- **Cache result in Redis** — Writes the newly computed feed back to Redis so subsequent requests from this user hit the cache.

## Fanout Service Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant PS as Post Service
    participant MQ as Message Queue
    participant FW as Fanout Workers
    participant R as Redis (Feed Cache)

    PS->>MQ: Publish event {post_id, user_id}
    MQ->>FW: Consume event
    FW->>R: Get followers of user_id
    R-->>FW: [follower_1, ..., follower_N]
    loop For each follower
        FW->>R: ZADD feed:{fid} timestamp post_id
        FW->>R: ZREMRANGEBYRANK (keep top 200)
    end
    FW-->>MQ: ACK
\`\`\`

## Overall System Architecture

\`\`\`mermaid
graph TD
    N0["CDN"]
    N1["LB"]
    N2["Post Service"]
    N3["Feed Service"]
    N4["User Service"]
    N5[("Post DB (MySQL)")]
    N6["Feed Cache (Redis Cluster)"]
    N7["Post Cache"]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    N1 --> N4
    N2 --> N5
    N2 --> N7
    N3 --> N6
    N3 --> N7
    N4 --> N5
    style N0 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **CDN** — A content delivery network that serves static assets (images, videos, JavaScript bundles) from edge locations worldwide, reducing latency for media-heavy feed content.
- **LB** — A load balancer that distributes incoming requests across multiple service instances, providing high availability and even traffic distribution.
- **Post Service** — Handles post creation, updates, and deletion. Writes to the post database and triggers the fanout pipeline for feed distribution.
- **Feed Service** — Assembles personalized feeds by reading from the Redis feed cache, merging celebrity posts via pull, and applying ranking algorithms.
- **User Service** — Manages user profiles, follow/unfollow relationships, and the social graph. Provides follower lists needed by the fanout service.
- **Post DB (MySQL)** — The persistent relational database storing all post data, sharded by user_id for efficient per-author queries.
- **Feed Cache (Redis Cluster)** — A distributed Redis cluster holding per-user sorted sets of post IDs, enabling instant feed retrieval for the push model.
- **Post Cache** — A separate Redis cache storing full post content (text, metadata, media IDs) to avoid database reads during feed hydration.
`,
    jsCode: `## Deep Dive: Push Model (Fanout-on-Write)

When a user publishes a post, the fanout service executes the following steps:

1. **Fetch the follower list** for the author from the social graph service (cached in Redis).
2. **For each follower**, execute \`ZADD feed:{follower_id} {timestamp} {post_id}\` in Redis. The sorted set score is the post's timestamp, ensuring chronological ordering.
3. **Trim the sorted set** to keep only the most recent 200 entries: \`ZREMRANGEBYRANK feed:{follower_id} 0 -201\`. This caps memory usage per user.
4. The fanout is done **asynchronously** via message queue workers (not in the request path). The user sees a successful post confirmation immediately without waiting for fanout to complete.

**Performance math:** A user with 300 followers triggers 300 Redis ZADD operations. At 20M posts/day with 300 avg followers, that is 6B Redis writes/day or ~70K writes/sec. A Redis cluster with 10 shards handles this comfortably (each shard does ~7K writes/sec).

## Deep Dive: Pull Model (Fanout-on-Read)

When a user requests their feed:

1. Fetch the list of all users they follow (e.g., 300 users).
2. For each followed user, fetch their N most recent post IDs from the post cache.
3. Merge all these post lists using a **k-way merge** (similar to merging K sorted arrays) and take the top 20 by timestamp or rank.
4. Hydrate the top 20 post IDs with full content from the post cache.

**Performance concern:** For a user following 300 people, this requires 300 cache lookups + a merge operation. At ~1ms per cache lookup, sequential reads would take 300ms — too slow. The solution is to **batch the lookups** using Redis MGET or pipeline, bringing the total to ~10-20ms. The merge itself is O(K × N × log K) using a min-heap and takes < 1ms.

## Deep Dive: Hybrid Model Implementation

The hybrid combines push and pull based on author follower count:

**On post publish:**
\`\`\`
if author.follower_count < CELEBRITY_THRESHOLD (10,000):
    enqueue_fanout(post_id, author_id)  // push to all followers
else:
    // do nothing — celebrity posts are pulled at read time
    store_in_celebrity_post_cache(post_id, author_id)
\`\`\`

**On feed read:**
\`\`\`
1. pre_computed = ZREVRANGE feed:{user_id} cursor 20
2. celebrity_ids = get_followed_celebrities(user_id)
3. celeb_posts = for each cid in celebrity_ids:
       fetch_recent_posts(cid, since=24_hours_ago)
4. merged = merge_and_rank(pre_computed + celeb_posts)
5. return top 20 from merged
\`\`\`

Since most users follow only 0-5 celebrities, step 3 adds minimal latency (5 cache lookups ≈ 5ms).

## Deep Dive: Feed Cache Design with Redis Sorted Sets

Each user has a sorted set in Redis:
- **Key**: \`feed:{user_id}\`
- **Members**: post_id values (8 bytes each)
- **Scores**: timestamps (or ranking scores)

**Operations:**
- \`ZADD feed:123 1679900000 post_456\` — add a post to user 123's feed
- \`ZREVRANGE feed:123 0 19\` — get the top 20 most recent posts
- \`ZREVRANGEBYSCORE feed:123 cursor_score -inf LIMIT 0 20\` — cursor-based pagination
- \`ZREMRANGEBYRANK feed:123 0 -201\` — trim to 200 entries

**Memory estimation:** 200 entries × (8 bytes member + 8 bytes score) = 3.2 KB per user. For 10M users: 32 GB total — easily fits in a Redis cluster.

## Deep Dive: Post and User Caches

Separate from the feed cache, two additional caches store the actual content:

**Post Cache (Redis hash):**
- Key: \`post:{post_id}\`
- Fields: content, user_id, media_ids, created_at, like_count, comment_count
- TTL: 48 hours (posts older than this are fetched from DB on demand)

**User Cache (Redis hash):**
- Key: \`user:{user_id}\`
- Fields: name, avatar_url, is_celebrity, follower_count
- TTL: 1 hour (profile info changes infrequently)

When hydrating a feed, the service does a batched MGET for all post_ids and user_ids, typically completing in < 5ms.

## Deep Dive: Media Delivery via CDN

Posts with images or videos do not store the media in the database. Instead:
1. The client uploads media to an **upload service** that stores it in object storage (S3).
2. The upload service returns a **media_id** and a **CDN URL**.
3. The post stores only the media_id. When the feed is rendered, the client receives CDN URLs and loads media directly from the CDN.
4. The CDN caches media at edge locations worldwide, ensuring fast loading regardless of the user's geographic location.

## Deep Dive: Feed Ranking (EdgeRank)

Instead of pure chronological ordering, rank posts by predicted engagement:

**Score = Affinity x Weight x Decay**

- **Affinity** (0-1): How close is the viewer to the post author? Measured by interaction frequency — if user A frequently likes, comments on, or messages user B, affinity is high. Stored as a precomputed value in the social graph service, updated daily.
- **Weight** (1-10): What type of post is it? Videos score highest (8-10), then photos (5-7), then links (3-5), then text-only (1-3). Comments on a post also boost its weight.
- **Decay** (0-1): How old is the post? An exponential decay function: \`decay = e^(-lambda * hours_since_post)\` where lambda controls how fast posts age out. A 24-hour-old post might have a decay of 0.3.

The ranking is computed during feed retrieval (step 3 of the hybrid model) and adds < 5ms of latency since all inputs are pre-cached.

## Deep Dive: Cursor-Based Pagination

For stable pagination in a constantly changing feed:

1. The first request returns the top 20 posts and a cursor: \`{ posts: [...], next_cursor: "ts:1679900000:id:456" }\`.
2. The cursor encodes the timestamp and post_id of the last item returned.
3. The next request sends this cursor. The server queries: \`ZREVRANGEBYSCORE feed:{uid} (1679900000 -inf LIMIT 0 20\` and filters out post_id 456 to avoid duplicates at the boundary.
4. This approach is stable even if new posts are added between page requests — the user sees a consistent stream without duplicates or gaps.`,
    explanation: `## Scaling Considerations

- **Database sharding**: Shard the posts table by \`user_id\` so all of a user's posts are on the same shard. This makes "fetch all posts by user X" a single-shard query. Use consistent hashing with virtual nodes for even distribution.
- **Feed cache sharding**: Shard Redis by \`user_id\` hash. Each Redis shard handles ~1M users' feed caches.
- **Fanout worker scaling**: The fanout service is the most resource-intensive component. Scale workers horizontally based on the message queue depth. During peak hours (mornings, evenings), auto-scale to 2-3x the baseline.
- **Read replicas**: Use read replicas for the post database to handle feed hydration queries. The primary handles writes only.

## Hot Celebrity Handling

The hybrid model handles most celebrity issues, but additional optimizations:
- **Pre-compute celebrity post lists**: Maintain a sorted set of each celebrity's recent posts, updated on publish. This makes the pull step for celebrity posts a single Redis read instead of a database query.
- **Celebrity post broadcast**: For extremely popular celebrities (> 1M followers), their posts can be added to a global "trending" cache that all feed services can access, avoiding per-user lookups entirely.

## Content Ranking Evolution

As the system matures, replace the simple EdgeRank formula with a **machine learning model**:
1. Collect training data: for each (user, post) pair, record whether the user engaged (liked, commented, shared, clicked, or spent > 3 seconds viewing).
2. Train a model (gradient-boosted trees or neural network) with features: user demographics, post type, author relationship, time of day, device type, past engagement history.
3. At serving time, score each candidate post in the feed and sort by predicted engagement probability.
4. Use an **exploration/exploitation** strategy: 90% of the feed is ranked by the model, 10% is randomly sampled to collect training data for new content.`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'The celebrity/influencer problem is the most important edge case. A naive fanout-on-write approach breaks down when a user with 10M followers posts — it generates 10M write operations that can take minutes and clog the fanout pipeline. Always discuss the hybrid approach (push for normal users, pull for celebrities).',
      'Cache invalidation in feeds is tricky. When a post is deleted, do not try to remove it from millions of cached feeds — instead, mark it as deleted in the post store and filter it out during feed hydration at read time. This is much simpler and faster.',
      'Feed ranking is not optional for a production news feed. Pure chronological feeds lead to low engagement because users see irrelevant posts. Discuss at least a simple ranking formula (affinity x weight x decay) even if you do not build a full ML pipeline.',
      'Offset-based pagination (page=1, page=2) is fundamentally broken for news feeds because new posts shift existing content. Always use cursor-based pagination where the cursor is a timestamp or post ID, ensuring stable results even as the feed changes.',
    ],
  },
];
