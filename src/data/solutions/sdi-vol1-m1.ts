import { ProblemSolution } from './types';

export const sdiVol1M1: ProblemSolution[] = [
  {
    id: 9101,
    description: `## Clarifying Questions to Ask
- What is the **expected user base**? Are we designing for thousands, millions, or billions?
- What are the **traffic patterns**? Is it read-heavy, write-heavy, or balanced?
- What **latency** is acceptable? Sub-100ms for page loads?
- What **availability** target? 99.9%? 99.99%?
- Is the data **relational** or can we use NoSQL?
- Do we need to support **multiple geographic regions**?
- What is the **growth rate**? How fast do we expect to scale?

## The Core Challenge
Design a web application architecture that gracefully evolves from serving a single user on one machine to handling millions of concurrent users. At each stage of growth, different bottlenecks emerge and require different solutions.

## Bottleneck Progression

| Scale | Primary Bottleneck | Solution |
|-------|-------------------|----------|
| 1-100 users | None (single server works) | Monolith on one box |
| 1K users | Database contention | Separate web and DB tiers |
| 10K users | Web server CPU/memory | Load balancer + multiple servers |
| 100K users | Database reads | Read replicas + caching layer |
| 1M users | Static content delivery | CDN for assets |
| 10M users | Session state management | Stateless web tier |
| 100M+ users | Single region limitations | Multi-datacenter + DB sharding |

## Non-Functional Requirements
- **Scalability**: System must grow horizontally without redesign
- **Availability**: No single point of failure at any tier
- **Performance**: Response times stay consistent as load grows
- **Maintainability**: Each component can be deployed and scaled independently
`,
    examples: `## Follow-Up Discussion Points
- **When should you choose SQL vs NoSQL?** SQL when you need ACID transactions, complex joins, and structured data with well-defined schemas (e-commerce orders, banking). NoSQL when you need flexible schemas, massive write throughput, or horizontal scaling out of the box (user activity logs, social feeds, IoT data).
- **How would you handle a sudden traffic spike (e.g., viral event)?** Auto-scaling groups with pre-warmed instances. Over-provision the cache layer since it's cheap. Use a CDN to absorb static traffic. Have circuit breakers to gracefully degrade non-critical features.
- **What are the trade-offs of microservices vs monolith at different scales?** Start monolithic — it's simpler to develop, deploy, and debug. Split into services only when team size or deployment frequency demands it. Premature microservices add network latency, operational complexity, and distributed system failure modes.
- **How do you decide what to cache?** Cache data that is read frequently but written infrequently (high read-to-write ratio). Cache expensive computation results. Never cache data that must be real-time consistent (account balances during transactions).
- **Database sharding: when is it truly necessary?** Only when a single database instance cannot handle the write volume or data size even after vertical scaling and read replicas. Sharding adds enormous complexity — try read replicas, caching, and query optimization first.`,
    intuition: `Scaling is not a single leap — it's a **progressive journey** where you identify the current bottleneck, apply the simplest fix, and repeat. The fundamental pattern is: **separate concerns into independent tiers** (web, cache, database, static assets, async processing), then **scale each tier horizontally** behind load balancers. Every architectural decision at scale is a trade-off between complexity, cost, consistency, and availability.`,
    approach: `## The Progressive Scaling Journey

### Stage 1: Single Server
Everything runs on one machine — the web application, database, and file storage. This works for development and tiny user bases. The first thing to break is usually the database competing with the web server for CPU and memory.

### Stage 2: Separate Web and Data Tiers
Move the database to its own dedicated server. This lets you scale each independently — a beefier machine for the DB, and the web server gets all its resources back. This is **vertical scaling** and it has hard limits.

### Stage 3: Load Balancer + Multiple Web Servers
A load balancer (Nginx, HAProxy, or cloud ALB) distributes requests across multiple web servers. Users connect to the load balancer's public IP. Web servers sit in a private subnet. If one server dies, traffic routes to the others automatically. This eliminates the web tier as a single point of failure.

### Stage 4: Database Replication
Set up **primary-replica** (master-slave) replication. All writes go to the primary. Reads are distributed across replicas. This handles read-heavy workloads (most web apps are 90%+ reads). If a replica dies, reads go to other replicas. If the primary dies, a replica gets promoted.

### Stage 5: Cache Layer
Add an in-memory cache (Redis or Memcached) between the web tier and the database. Use the **cache-aside** pattern: check cache first, if miss then query DB and populate cache. This dramatically reduces database load and cuts response times from milliseconds to microseconds for cached data.

### Stage 6: CDN for Static Assets
Offload images, CSS, JavaScript, and video to a Content Delivery Network. CDN edge servers are geographically distributed, so users get static content from a nearby server. This reduces load on your origin servers and improves page load times globally.

### Stage 7: Stateless Web Tier
Move all session state out of web servers and into a shared store (Redis, Memcached, or a dedicated session DB). Now any web server can handle any request — no sticky sessions needed. This makes horizontal scaling trivial: just add more servers behind the load balancer.

### Stage 8: Multiple Data Centers
Deploy the full stack in 2+ geographic regions. Use GeoDNS to route users to the nearest data center. This improves latency for global users and provides disaster recovery. The hard problem here is **data synchronization** across data centers.

### Stage 9: Message Queues
Decouple time-consuming tasks (sending emails, generating thumbnails, processing payments) from the request path. Producers push tasks to a queue (Kafka, RabbitMQ, SQS). Workers consume and process them asynchronously. This keeps response times fast and lets you scale processing independently.

### Stage 10: Database Sharding
When a single database can't handle the data volume or write throughput, split the data across multiple database instances. Each shard holds a subset of the data. This is the most complex step and should be done last.
`,
    code: `## Architecture Diagrams

### Stage 1: Single Server Setup

\`\`\`mermaid
graph TD
    N0["Single Server IP: 1.2.3.4"]
    N1["Web App (Nginx + Node.js)"]
    N2["Users"]
    N2 --> N0
    N0 --> N1
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

### Stage 2: Load Balanced Architecture with DB Replication

\`\`\`mermaid
graph TD
    N0["Load Balancer"]
    N1["Web Srv #1"]
    N2["Cache (Redis)"]
    N3[("Primary DB")]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

### Stage 3: Full Production Architecture

\`\`\`mermaid
graph TD
    N0["Users (Region A)"]
    N1["GeoDNS"]
    N2["Users (Region B)"]
    N3["Load Balancer (Region A)"]
    N4["Load Balancer (Region B)"]
    N5["W1"]
    N6["W2"]
    N7["W3"]
    N8["W4"]
    N9["Redis Cache (Cluster)"]
    N10[("DB Primary + Replicas")]
    N11["+ Replicas"]
    N12["Message Queue (Kafka)"]
    N13["Email Worker"]
    N14["Thumbnail Worker"]
    N15["Analytics Worker"]
    N0 --> N1
    N2 --> N1
    N1 --> N3
    N1 --> N4
    N3 --> N5
    N3 --> N6
    N4 --> N7
    N4 --> N8
    N5 --> N9
    N6 --> N9
    N7 --> N9
    N8 --> N9
    N5 --> N10
    N6 --> N10
    N7 --> N10
    N8 --> N10
    N9 --> N10
    N10 --> N11
    N5 --> N12
    N6 --> N12
    N7 --> N12
    N8 --> N12
    N12 --> N13
    N12 --> N14
    N12 --> N15
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N10 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N11 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N12 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N13 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N14 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N15 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`
`,
    jsCode: `## Vertical vs Horizontal Scaling

**Vertical scaling** (scale up) means adding more CPU, RAM, or disk to a single machine. It's simple but has hard limits — you can't buy a server with infinite resources. There's also a single point of failure: if that one powerful machine goes down, everything goes down.

**Horizontal scaling** (scale out) means adding more machines to the pool. It's theoretically unlimited and provides redundancy, but it introduces complexity: load balancing, data consistency, and distributed system challenges. For web-scale systems, horizontal scaling is the only viable path.

## Database Replication Deep Dive

### Primary-Replica (Master-Slave)
- **One primary** handles all writes. **Multiple replicas** handle reads.
- Replication is typically **asynchronous** — there's a small lag (milliseconds to seconds) between a write on the primary and its appearance on replicas.
- **Replication lag** can cause stale reads. Solutions: read-your-own-writes consistency (route user's reads to primary right after their write), or use semi-synchronous replication for critical reads.
- **Failover**: If the primary dies, promote a replica. This can be manual or automated (using tools like orchestrator, ProxySQL, or cloud-managed failover). Risk: if the promoted replica was behind, you may lose recent writes.

### Primary-Primary (Multi-Master)
- Both nodes accept writes. Useful for multi-datacenter setups.
- **Conflict resolution** is the major challenge: what if both primaries write to the same row? Strategies include last-writer-wins (LWW), application-level merge, or avoiding conflicts by partitioning write responsibility.
- More complex to set up and debug. Most systems avoid this unless geographic distribution demands it.

## Cache Strategies In Detail

### Cache-Aside (Lazy Loading)
1. Application checks cache first
2. On **cache miss**: query the database, store result in cache, return to client
3. On **cache hit**: return cached data directly

**Pros**: Only requested data gets cached. Cache failures don't break the system (just slower).
**Cons**: First request for any data is always slow (cache miss). Data can become stale if the DB is updated without invalidating cache.

### Write-Through
1. Application writes to cache **and** database simultaneously
2. Reads always come from cache

**Pros**: Cache is always consistent with DB. No stale data.
**Cons**: Higher write latency (two writes per operation). Cache may fill with data that's never read.

### Write-Behind (Write-Back)
1. Application writes to cache only
2. Cache **asynchronously** flushes to database in batches

**Pros**: Lowest write latency. Batching reduces DB load.
**Cons**: Risk of data loss if cache node fails before flushing. More complex to implement correctly.

### Cache Eviction
- **TTL (Time-To-Live)**: Set expiration on cached items. Simple but blunt.
- **LRU (Least Recently Used)**: Evict the item that hasn't been accessed in the longest time. Good default policy.
- **LFU (Least Frequently Used)**: Evict the item accessed the fewest times. Better for skewed access patterns.

## CDN Deep Dive

### Pull CDN
- CDN fetches content from your origin server **on first request**
- Subsequent requests are served from CDN edge cache
- **Pros**: Zero setup overhead — just point DNS. Only caches content that users actually request.
- **Cons**: First user in each region gets a slow response (cache miss). TTL management is critical.

### Push CDN
- You **upload content directly** to the CDN ahead of time
- **Pros**: No cache miss latency. Full control over what's cached.
- **Cons**: More operational work. Risk of serving stale content if you forget to update. Higher storage costs.

For most web applications, **pull CDN** is the right choice. Push CDN makes sense for large media files or content you can prepare in advance.

## Stateless vs Stateful Architecture

### Stateful Web Servers
Each server stores user session data in memory. A user must always be routed to the **same server** (sticky sessions). Problems: uneven load distribution, lost sessions on server failure, can't add/remove servers freely.

### Stateless Web Servers
Session data is stored in a **shared external store** (Redis, Memcached, DynamoDB). Any server can handle any request. Benefits: trivial horizontal scaling, graceful server failures, easy rolling deployments.

The transition from stateful to stateless is one of the most impactful scaling improvements. It decouples your web tier from user identity entirely.

## Database Sharding Strategies

### Hash-Based Sharding
Apply a hash function to the shard key (e.g., \`user_id % num_shards\`). Data is distributed evenly. **Problem**: adding or removing shards requires rehashing and massive data migration. Solution: use **consistent hashing** to minimize data movement.

### Range-Based Sharding
Partition by ranges of the shard key (e.g., user IDs 1-1M on shard 1, 1M-2M on shard 2). **Problem**: hot spots — if one range is much more active, that shard becomes overloaded. Works well when access patterns are roughly uniform across ranges.

### Directory-Based Sharding
A lookup service maps each shard key to its shard location. Most flexible — you can move data between shards without changing the sharding logic. **Problem**: the lookup service becomes a single point of failure and a potential bottleneck. Needs to be cached and replicated.

### Common Sharding Challenges
- **Cross-shard joins**: Queries spanning multiple shards are expensive. Denormalize data to avoid them.
- **Resharding**: When a shard gets too large or too hot. Consistent hashing helps minimize data movement.
- **Celebrity problem (hotspot)**: A single shard key (e.g., a celebrity user) gets disproportionate traffic. Solutions: further partition that key's data, or add a cache layer specifically for hot keys.
- **Referential integrity**: Foreign key constraints don't work across shards. The application must enforce consistency.
`,
    explanation: `## The Scaling Journey — Key Takeaways

The path from zero to millions of users follows a predictable pattern:

1. **Start simple** — a single server is fine for prototyping and early users
2. **Separate concerns** — split web and database tiers so each can scale independently
3. **Eliminate single points of failure** — load balancers, DB replication, redundant servers
4. **Reduce database load** — add caching (Redis/Memcached) for frequently accessed data
5. **Offload static content** — use a CDN for images, CSS, JS, and media files
6. **Go stateless** — move session state to external stores for effortless horizontal scaling
7. **Think globally** — multiple data centers for latency and disaster recovery
8. **Decouple processing** — message queues for async work that doesn't need to block the user
9. **Shard when necessary** — partition the database only when all other options are exhausted

The golden rule: **don't over-engineer**. Apply each technique only when the current bottleneck demands it. Premature optimization adds complexity without benefit.
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Don\'t jump straight to sharding or microservices — interviewers want to see you build up incrementally from a simple design',
      'Forgetting to address single points of failure at every tier (what happens if the load balancer itself goes down? Answer: redundant LB pair with failover)',
      'Not distinguishing between read and write scaling — adding read replicas helps reads but does nothing for write throughput',
      'Ignoring the consistency implications of caching and replication — always discuss how stale data is handled'
    ]
  },
  {
    id: 9102,
    description: `## Why Estimation Matters
Back-of-the-envelope estimation is not about getting the exact right answer. It's about demonstrating that you can **think analytically**, identify the right dimensions to estimate, and arrive at a reasonable order of magnitude. Interviewers use these to evaluate whether you can reason about system constraints before diving into design.

## Clarifying Questions to Ask
- What is the **user base size**? (DAU, MAU)
- What **actions** does each user perform per day on average?
- What is the **data size** per action? (text post vs image vs video)
- What is the expected **read-to-write ratio**?
- What **retention period** do we need? (store data for 5 years? Forever?)
- Are there **peak traffic** patterns? (time of day, events)

## The Goal
Given vague requirements, produce reasonable estimates for:
- **QPS** (Queries Per Second) — average and peak
- **Storage** — how much disk space over time
- **Bandwidth** — network throughput needed
- **Memory** — how much cache do we need

## Key Principle
Round aggressively. Use powers of 2 and powers of 10. The goal is the right **order of magnitude**, not precision. Being off by 2x is fine; being off by 100x means your architecture is wrong.
`,
    examples: `## Tips for Estimation in Interviews

- **Write down your assumptions** — say them out loud so the interviewer can correct you if needed. This turns estimation into a collaborative exercise.
- **Round aggressively** — use 10M instead of 9.7M, 100 instead of 86,400/1000. Precision doesn't matter; getting the right ballpark does.
- **Label your units** — always write KB, MB, GB, QPS, etc. It's easy to lose track of whether you're counting bytes or kilobytes.
- **Sanity-check your result** — if you calculate that Twitter needs 50 PB of RAM, something went wrong. Compare against known systems.
- **Use reference points** — a single MySQL server handles ~10K QPS for simple queries. A Redis instance handles ~100K QPS. A single server has ~64-256 GB RAM. These anchors help you estimate how many machines you need.
- **Convert DAU to QPS early** — this is the foundation for every other estimate. Get this number first, then derive storage, bandwidth, and memory from it.
- **Account for peak traffic** — peak QPS is typically 2x to 5x average. Design your system for peak, not average, or you'll have outages during traffic spikes.
- **Don't forget replication and redundancy** — if you need 10 TB of storage, you actually need 30 TB (3x replication). Cache memory estimates should account for multiple replicas too.`,
    intuition: `Back-of-the-envelope estimation is about building a **quantitative intuition** for system scale. The ability to quickly determine whether a problem requires 1 server or 1,000 servers, 1 GB or 1 PB of storage, shapes every design decision that follows. Master the conversions (DAU → QPS → storage → bandwidth) and you can sanity-check any system design on the fly.`,
    approach: `## Powers of 2 — The Foundation

Every engineer should have these memorized:

| Power | Exact Value | Approximate | Unit |
|-------|------------|-------------|------|
| 2^10 | 1,024 | ~1 Thousand | 1 KB |
| 2^20 | 1,048,576 | ~1 Million | 1 MB |
| 2^30 | 1,073,741,824 | ~1 Billion | 1 GB |
| 2^40 | 1,099,511,627,776 | ~1 Trillion | 1 TB |
| 2^50 | — | ~1 Quadrillion | 1 PB |

## Latency Numbers Every Programmer Should Know

These are approximate and vary by hardware, but the **relative magnitudes** are what matter:

| Operation | Latency | Notes |
|-----------|---------|-------|
| L1 cache reference | 0.5 ns | On-chip, fastest possible |
| L2 cache reference | 7 ns | Still on-chip |
| Main memory (RAM) reference | 100 ns | Off-chip, much slower |
| SSD random read | 150 μs | ~1,000x slower than RAM |
| HDD sequential read (1 MB) | 20 ms | Disk is slow |
| HDD disk seek | 10 ms | Physical arm movement |
| Send packet CA → Netherlands → CA | 150 ms | Speed of light limit |
| OS mutex lock/unlock | 25 ns | Kernel overhead |
| Compress 1K bytes (Snappy) | 3 μs | Cheap compression |
| Send 2K bytes over commodity network | 44 ns | Within datacenter |
| Read 1 MB sequentially from memory | 250 μs | |
| Read 1 MB sequentially from SSD | 1 ms | |
| Read 1 MB sequentially from HDD | 20 ms | |

## Key Takeaways from Latency Numbers
1. **Memory is fast, disk is slow** — always cache hot data in memory
2. **SSD is 10-100x faster than HDD** for random access — use SSDs for databases
3. **Network round trips are expensive** — minimize cross-datacenter calls
4. **Sequential reads are much faster than random reads** on both SSD and HDD
5. **Compression is cheap** — compress data before sending over the network

## Common Estimation Formulas

### QPS from DAU
\`\`\`
Average QPS = DAU × (avg actions per user per day) / 86,400
Peak QPS = Average QPS × peak multiplier (2x to 5x)
\`\`\`

### Storage
\`\`\`
Daily storage = DAU × (% who create content) × (avg content size)
Yearly storage = Daily storage × 365
Total storage (with replication) = Yearly storage × retention years × replication factor
\`\`\`

### Bandwidth
\`\`\`
Bandwidth = QPS × average response size
\`\`\`

### Memory (Cache)
\`\`\`
Cache memory = QPS × avg response size × cache_duration_seconds
Or: Cache the top 20% of hot data: 0.2 × (daily requests) × avg_size
\`\`\`
`,
    code: `## Latency Comparison Visual

\`\`\`
Latency Scale (log scale, approximate)

0.5 ns  ██ L1 cache ref
  7 ns  ████ L2 cache ref
 25 ns  █████ Mutex lock/unlock
100 ns  ████████ Main memory ref
                                        ← 200x gap →
 3 μs   ██████████████ Compress 1KB
150 μs  ████████████████████████████████ SSD random read
                                        ← 100x gap →
 1 ms   █████████████████████████████████████████████ Read 1MB from SSD
10 ms   █████████████████████████████████████████████████████ HDD seek
20 ms   ██████████████████████████████████████████████████████████ Read 1MB HDD
150 ms  ████████████████████████████████████████████████████████████████ CA→NL→CA
\`\`\`

## Example: Twitter QPS Estimation

\`\`\`
Given:
  - 300M Monthly Active Users (MAU)
  - 50% use the platform daily → 150M DAU
  - Each user views ~20 tweets/day, posts ~0.5 tweets/day

Read QPS:
  150M × 20 / 86,400
  = 3,000,000,000 / 86,400
  ≈ 3B / 100K
  ≈ 30,000 QPS (average)
  Peak ≈ 30K × 3 = ~100K QPS

Write QPS:
  150M × 0.5 / 86,400
  ≈ 75,000,000 / 86,400
  ≈ 870 QPS (average)
  Peak ≈ 870 × 3 = ~2,600 QPS
\`\`\`

## Example: Storage Estimation for a Photo Sharing App

\`\`\`
Given:
  - 50M DAU
  - 10% upload photos daily → 5M uploads/day
  - Average photo size: 2 MB

Daily storage:
  5M × 2 MB = 10 TB/day

Yearly storage:
  10 TB × 365 = 3.65 PB/year

With 3x replication:
  3.65 PB × 3 ≈ 11 PB/year

5-year retention:
  11 PB × 5 = 55 PB total
\`\`\`

## Quick Reference Anchors

**Single Server Capacity Guide**

| Resource | Capacity |
|----------|----------|
| CPU | 64+ cores |
| Memory | 256-512 GB RAM |
| Disk | 10-20 TB SSD |
| Network | 10 Gbps |
| QPS (web) | ~10K-50K |
| QPS (cache) | ~100K-1M |
| Connections | ~10K-50K concurrent |
`,
    jsCode: `## Worked Estimation Examples

### Example 1: Twitter QPS and Storage

**Step 1: Establish DAU**
- 300M MAU, assume 50% are daily active → **150M DAU**

**Step 2: Calculate QPS**
- Average user makes 20 read requests and 0.5 write requests per day
- Read QPS: 150M × 20 / 86,400 ≈ **35,000 QPS**
- Write QPS: 150M × 0.5 / 86,400 ≈ **870 QPS**
- Peak Read QPS: 35K × 3 ≈ **105K QPS** (use 3x as typical peak multiplier)
- Peak Write QPS: 870 × 3 ≈ **2,600 QPS**

**Step 3: Calculate storage**
- Each tweet: 140 chars = ~280 bytes text + 200 bytes metadata ≈ 500 bytes
- 10% of tweets include a photo (avg 500 KB), 1% include video (avg 5 MB)
- Daily tweets: 150M × 0.5 = 75M tweets/day
- Text storage: 75M × 500 B = 37.5 GB/day
- Photo storage: 75M × 0.1 × 500 KB = 3.75 TB/day
- Video storage: 75M × 0.01 × 5 MB = 3.75 TB/day
- **Total daily storage: ~7.5 TB/day** (media dominates)

**Step 4: Bandwidth**
- Incoming (write): 7.5 TB / 86,400 ≈ 87 MB/s ≈ **700 Mbps**
- Outgoing (read): assume 10x read-to-write ratio → **7 Gbps**

### Example 2: Chat Application (WhatsApp-like)

**Step 1: Establish scale**
- 500M DAU
- Each user sends 40 messages/day on average
- Average message size: 100 bytes

**Step 2: QPS**
- Messages per day: 500M × 40 = 20B messages/day
- QPS: 20B / 86,400 ≈ **230K QPS**
- Peak: 230K × 5 ≈ **1.15M QPS** (chat has spiky patterns)

**Step 3: Storage**
- Daily text: 20B × 100 bytes = 2 TB/day
- With 15% media messages (avg 200 KB): 20B × 0.15 × 200 KB = 600 TB/day
- Yearly (text + media): ~220 PB/year
- 5-year retention with 3x replication: **~3.3 EB** (this is why WhatsApp compresses aggressively and limits media retention)

**Step 4: Cache**
- Cache recent conversations (last 30 days of active chats)
- ~200M active conversations × 50 messages × 100 bytes ≈ 1 TB of text cache
- Spread across Redis cluster: ~10 Redis nodes with 128 GB each

### The DAU → QPS Conversion Formula

This is the single most important formula for estimation:

\`\`\`
QPS = DAU × actions_per_user_per_day / 86,400
\`\`\`

To simplify mental math, note that **86,400 ≈ 10^5** (it's actually ~86K, close enough). So:

\`\`\`
QPS ≈ DAU × actions / 100,000
\`\`\`

**Examples:**
- 10M DAU × 10 actions = 100M / 100K = **1,000 QPS**
- 100M DAU × 5 actions = 500M / 100K = **5,000 QPS**
- 500M DAU × 40 actions = 20B / 100K = **200,000 QPS**

### Peak QPS Estimation

Peak traffic is always higher than average. The multiplier depends on the application:

| Application Type | Peak Multiplier | Reasoning |
|-----------------|----------------|-----------|
| Social media | 2x-3x | Usage spikes during evening hours |
| E-commerce | 3x-5x | Flash sales, holidays |
| Chat / messaging | 3x-5x | Event-driven spikes |
| Streaming | 2x-3x | Evening prime time |
| Search engine | 2x | Fairly uniform across waking hours |

### Memory Estimation for Caching

**The 80/20 rule**: 80% of traffic accesses 20% of the data. So cache the top 20% of frequently accessed data.

\`\`\`
Cache memory = 0.2 × (daily requests) × (avg response size)
\`\`\`

Example for URL shortener:
- 1B redirects/day
- Each URL mapping ≈ 500 bytes
- Cache: 0.2 × 1B × 500 B = 100 GB
- A few Redis nodes with 64 GB RAM can handle this easily
`,
    explanation: `## Summary

Back-of-the-envelope estimation is a **structured skill**, not guesswork. The framework is:

1. **Start with DAU** — get the user base number and daily active percentage
2. **Convert to QPS** — multiply by actions per user, divide by 86,400
3. **Estimate peak** — multiply average QPS by 2x-5x depending on application type
4. **Derive storage** — QPS × data size per action × time period
5. **Derive bandwidth** — QPS × response size
6. **Derive memory** — cache the top 20% of hot data

Always **round to powers of 10** for quick math. Show your work step by step. The interviewer cares about your reasoning process, not the final number.

Memorize the key reference numbers: latency hierarchy (L1 → RAM → SSD → HDD → network), powers of 2 (KB/MB/GB/TB/PB), and single-server capacity limits (~10K QPS for a DB, ~100K for Redis).
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Forgetting to convert between units — mixing up MB and GB, or seconds and days, leads to estimates that are off by 1000x',
      'Not accounting for peak traffic — designing for average QPS means your system crashes during traffic spikes',
      'Ignoring the storage cost of replication — if you need 10 TB, you actually need 30 TB with 3x replication across nodes',
      'Being too precise — spending 5 minutes calculating exact numbers defeats the purpose; round aggressively and move on'
    ]
  },
  {
    id: 9103,
    description: `## What Interviewers Are Really Looking For

A system design interview is **not a test of memorized architectures**. Interviewers evaluate:

- **Problem-solving approach**: Can you break down ambiguous problems into structured, manageable pieces?
- **Communication skills**: Can you articulate your thinking clearly and lead the discussion?
- **Trade-off analysis**: Can you identify alternatives and reason about their pros and cons?
- **Technical depth**: Do you understand the systems you propose, not just their names?
- **Collaboration**: Can you incorporate feedback and adjust your design?

## Red Flags (What Gets You Rejected)
- Jumping straight into a solution without asking clarifying questions
- Designing in silence for 10 minutes, then presenting a finished diagram
- Over-engineering from the start (mentioning Kubernetes and microservices for a prototype)
- Being unable to explain **why** you chose a particular component
- Refusing to acknowledge trade-offs or limitations in your design
- Getting defensive when the interviewer challenges a decision

## Green Flags (What Gets You Hired)
- Asking thoughtful, targeted questions before designing anything
- Thinking out loud so the interviewer can follow your reasoning
- Starting simple and adding complexity only when justified
- Proactively discussing trade-offs without being prompted
- Adapting the design when the interviewer adds new constraints
- Being honest about what you don't know ("I'm less familiar with X, but here's how I'd approach it...")

## The Meta-Skill
The interview is a **simulated working session**, not an exam. The interviewer wants to see what it's like to work with you on a real design problem. Treat them as a collaborator, not an evaluator.
`,
    examples: `## Do's and Don'ts

### Do's
- **Do ask clarifying questions** before designing anything. Spend 3-5 minutes understanding the problem scope. This is not wasted time — it prevents you from solving the wrong problem.
- **Do start with the highest-level diagram** (client → load balancer → servers → database) and refine from there. Top-down design shows structured thinking.
- **Do quantify things** — estimate QPS, storage, bandwidth. Numbers ground your design in reality and help justify component choices.
- **Do discuss trade-offs explicitly** — "We could use SQL for strong consistency, or NoSQL for easier horizontal scaling. Given our read-heavy workload with eventual consistency tolerance, I'd choose NoSQL here because..."
- **Do address failure scenarios** — what happens when a server goes down, a database fails, or the network partitions?
- **Do manage your time** — if you spend 20 minutes on step 1, you won't have time for the deep dive where you demonstrate real expertise.
- **Do use concrete numbers for capacity** — "A single MySQL instance handles about 10K QPS for simple queries, so with 50K QPS we need at least 5 read replicas plus caching."

### Don'ts
- **Don't try to cover everything** — depth on 2-3 key components beats surface coverage of 10 components. The interviewer will guide you to what they care about.
- **Don't name-drop technologies without understanding them** — saying "we'll use Kafka" without knowing why message ordering matters or how consumer groups work will backfire.
- **Don't ignore the interviewer's hints** — if they ask "what about consistency?", they're telling you your design has a consistency issue. Address it.
- **Don't present only one option** — always show you considered alternatives. "We could do X or Y. I prefer X because... but Y would be better if..."
- **Don't forget about data models** — a system design without a clear data model is incomplete. Define your key entities and their relationships.
- **Don't panic if you don't know the "right" answer** — there is no single right answer. Reason through the problem from first principles.`,
    intuition: `A system design interview is a **structured conversation**, not a presentation. The 4-step framework (scope → high-level design → deep dive → wrap up) gives you a reliable skeleton for any problem. Your goal is not to produce a perfect architecture — it's to demonstrate clear thinking, good trade-off analysis, and the ability to collaborate on ambiguous problems. The interviewer is your teammate, not your adversary.`,
    approach: `## The 4-Step Framework

Every system design interview, regardless of the specific problem, should follow this structure. It gives you a predictable rhythm and ensures you allocate time appropriately.

### Step 1: Understand the Problem & Establish Design Scope (3-10 minutes)

**Purpose**: Narrow the infinite problem space into something you can design in 35 minutes.

Ask questions in these categories:
- **Users**: Who are the users? How many? Geographic distribution?
- **Features**: What are the core features to design? What's out of scope?
- **Scale**: What's the expected traffic? Data volume?
- **Performance**: What latency is acceptable? What's the SLA?
- **Constraints**: Any existing infrastructure we must integrate with?

**Output**: A short list of functional requirements, non-functional requirements, and back-of-the-envelope estimates.

### Step 2: Propose High-Level Design & Get Buy-In (10-15 minutes)

**Purpose**: Sketch the major components and their interactions. Get the interviewer to agree with your approach before going deep.

- Draw a **block diagram** with the main components (clients, API gateway, services, databases, caches, queues)
- Define the **API** for key operations (endpoints, request/response format)
- Walk through the **data flow** for 1-2 core use cases
- Define the **data model** (key tables/collections, their fields, relationships)
- Get explicit buy-in: "Does this high-level approach look reasonable? Any concerns before I go deeper?"

### Step 3: Design Deep Dive (10-25 minutes)

**Purpose**: Demonstrate technical depth on the most interesting or challenging parts of the system.

- The interviewer will usually signal which area to dive into
- Common deep-dive topics: data partitioning, caching strategy, consistency model, specific algorithm, failure handling
- Show mastery of **one or two components** rather than shallow knowledge of many
- Discuss **alternatives considered** and why you chose your approach
- Address **edge cases** and **failure modes**

### Step 4: Wrap Up (3-5 minutes)

**Purpose**: Show you can zoom back out and think about the system holistically.

- Summarize the design and its key trade-offs
- Discuss **potential bottlenecks** you identified but didn't have time to solve
- Propose **future improvements** (e.g., "if we had more time, I'd add metrics/monitoring, rate limiting, and a circuit breaker pattern")
- Mention **operational concerns**: monitoring, alerting, deployment strategy
- Error handling at scale: how does the system degrade gracefully?
`,
    code: `## Interview Time Allocation

**45-Minute System Design Interview**

| Phase | Time | Focus |
|-------|------|-------|
| Step 1: Understand & Scope | 5-10 min | Clarify requirements, constraints, scale |
| Step 2: High-Level Design | 10-15 min | API design, data model, architecture diagram |
| Step 3: Deep Dive | 15-20 min | Detailed design of critical components |
| Step 4: Wrap Up | 5 min | Bottlenecks, improvements, trade-offs |

## Question Framework for Step 1

**SCOPE QUESTIONS CHECKLIST**

- What are the most important features to build?
- How many users? DAU / MAU?
- What is the expected read/write ratio?
- What scale do we need to handle? (QPS, storage, bandwidth)
- Are there latency requirements? (p99 < X ms)
- Is strong consistency required or is eventual consistency OK?
- What is the expected growth rate over 3-5 years?
- Any existing infrastructure or tech stack constraints?

## High-Level Design Template (Step 2)

\`\`\`mermaid
graph TD
    N0["Client (Web / Mobile)"]
    N1["API GW / Load Balancer"]
    N2["Service Layer"]
    N3["Cache (Redis)"]
    N4["Message Queue"]
    N5["Data Layer (SQL / NoSQL / Blob)"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N2 --> N4
    N2 --> N5
    N3 --> N5
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`
`,
    jsCode: `## Deep Dive: Mastering Each Step

### Step 1 Deep Dive: The Art of Scoping

The most common mistake in system design interviews is **insufficient scoping**. Candidates dive into designing a full-featured system when the interviewer only wanted to focus on one aspect.

**Good scoping example — "Design Twitter":**
- "Should I focus on the tweet posting and timeline generation, or also cover DMs, search, trending, and notifications?"
- "Is this a Twitter-scale system (500M tweets/day) or a smaller social platform?"
- "Should I prioritize the home timeline (fan-out) or the user profile timeline?"
- "Do we need real-time updates (WebSocket) or is polling acceptable?"

After scoping, **state your assumptions explicitly**:
> "I'll focus on posting tweets and generating the home timeline for 200M DAU. I'll assume an average of 5 tweets per user per day and that users check their timeline 20 times per day. I'll target eventual consistency with a latency goal of under 200ms for timeline reads."

### Step 2 Deep Dive: Building the High-Level Design

**Start with the data flow, not the components.** Think about what happens when:
1. A user creates content → Where does it go? How is it stored?
2. A user reads content → Where does it come from? How is it assembled?

Then place components along the data path as needed.

**Common anti-patterns in Step 2:**
- Drawing 15 microservices on the whiteboard before explaining any of them
- Mentioning "Kubernetes" and "service mesh" before explaining basic data flow
- Skipping the data model entirely (the interviewer will ask, so define it proactively)
- Not defining API endpoints (the API is the contract between client and server)

**The buy-in checkpoint is critical.** Explicitly pause and ask: "Does this direction make sense? Would you like me to adjust anything before I go deeper?" This shows collaboration and prevents you from spending 20 minutes on a design the interviewer wanted to redirect.

### Step 3 Deep Dive: Showing Technical Mastery

This is where senior candidates separate themselves. The interviewer will pick 1-2 areas to probe. Common deep-dive topics and what to cover:

**If asked about data storage:**
- SQL vs NoSQL trade-offs for this specific use case
- Schema design, indexing strategy
- Partitioning / sharding key selection
- Replication strategy and consistency model
- How to handle data that outgrows a single machine

**If asked about caching:**
- What to cache and what not to cache
- Cache invalidation strategy (TTL, event-driven, write-through)
- Cache stampede / thundering herd protection
- Eviction policy (LRU, LFU)
- Cache warming strategy

**If asked about reliability:**
- What happens when each component fails?
- Retry logic with exponential backoff and jitter
- Circuit breaker pattern to prevent cascade failures
- Idempotency for safe retries
- Graceful degradation (serve stale data, disable non-critical features)

**If asked about scalability:**
- Which component becomes the bottleneck first?
- How to shard the data (key selection, rebalancing)
- Read vs write scaling strategies
- Async processing to decouple components
- Rate limiting to protect the system

### Step 4 Deep Dive: The Strong Finish

Most candidates rush through the wrap-up or skip it entirely. This is a missed opportunity. A strong finish includes:

1. **Bottleneck identification**: "The biggest risk in this design is the fan-out for users who follow 10K+ accounts. We'd mitigate this with a hybrid push/pull approach for celebrity accounts."

2. **Monitoring and observability**: "I'd instrument key metrics — p99 latency for timeline reads, queue depth for the fan-out workers, cache hit rate, and DB replication lag."

3. **Future evolution**: "If we needed to add search, I'd introduce Elasticsearch alongside the primary data store, with a change-data-capture pipeline to keep them in sync."

4. **Honest reflection**: "One thing I'd want to revisit is the consistency model for the like count — the current design could show slightly stale counts, and I'd want to evaluate whether users find that acceptable."
`,
    explanation: `## Summary

The 4-step framework is your **safety net** for any system design interview:

| Step | Time | Goal | Key Action |
|------|------|------|------------|
| 1. Scope | 3-10 min | Define what to build | Ask questions, state assumptions |
| 2. High-Level | 10-15 min | Architecture sketch | Draw components, define APIs, get buy-in |
| 3. Deep Dive | 10-25 min | Show expertise | Go deep on 1-2 components |
| 4. Wrap Up | 3-5 min | Demonstrate maturity | Identify gaps, discuss monitoring |

The framework works because it mirrors how real system design happens: you start with requirements, sketch an architecture, iterate on the hard parts, and then think about operations and future evolution.

**The single most important thing**: Treat the interview as a **collaborative design session**. Think out loud. Explain your reasoning. Acknowledge trade-offs. Ask for input. The interviewer is evaluating how you think, not what you memorize.
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Spending too little time on Step 1 (scoping) — designing the wrong system perfectly is still a failure; invest 3-10 minutes upfront to align on requirements',
      'Monologuing for 10+ minutes without checking in with the interviewer — pause frequently and ask if the direction makes sense',
      'Going too broad instead of too deep — interviewers want to see mastery of 1-2 components, not a surface-level tour of 10 technologies',
      'Skipping the data model — every system design needs clear entities, relationships, and access patterns; define them in Step 2'
    ]
  }
];
