import { ProblemSolution } from './types';

export const solutionsM1: ProblemSolution[] = [
  {
    id: 9001,
    description: `## Clarifying Questions to Ask
- What is the **traffic volume**? How many URL shortenings per day?
- What is the **read-to-write ratio**? (Reads are typically 10:1 or higher)
- How long should shortened URLs last? Do they **expire**?
- Should users be able to pick **custom short links**?
- Do we need **analytics** (click counts, referrers, geo)?

## Functional Requirements
- Given a long URL, generate a **unique short URL** (e.g., \`tinyurl.com/abc123\`)
- Given a short URL, **redirect** to the original long URL
- Users can optionally set **custom aliases**
- Links expire after a **configurable TTL** (default: 5 years)

## Non-Functional Requirements
- **Low latency**: Redirect in < 10ms (read-heavy)
- **High availability**: The system should be always up (favor AP over CP)
- **Non-guessable**: Short codes should not be easily predictable

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| New URLs / day | 100M |
| Read:Write ratio | 10:1 → 1B redirects/day |
| Write QPS | 100M / 86,400 ≈ **1,160 QPS** |
| Read QPS (redirects) | **11,600 QPS** (peak: ~23K) |
| Storage per URL | ~500 bytes (short code + long URL + metadata) |
| Storage / year | 100M × 365 × 500B ≈ **18 TB/year** |
| Cache (20% hot URLs) | 1B × 0.2 × 500B ≈ **100 GB** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you support analytics?** → Async event pipeline (Kafka → analytics DB). Log click events with timestamp, referrer, geo, device. Don't block the redirect path.
- **How would you handle spam/abuse?** → Rate limiting on creation API. URL blacklist checking against known malicious domains. CAPTCHA for unauthenticated users.
- **What if we need to support 10x traffic?** → Add more cache nodes, DB read replicas, and API servers. The stateless tier scales horizontally. Consider moving to a globally distributed cache (Redis Cluster across regions).
- **How would you do A/B testing on redirect logic?** → Feature flags at the API layer. Route a percentage of traffic through new logic while monitoring latency and error rates.
- **301 vs 302 redirect?** → 301 (permanent) reduces server load since browsers cache it, but you lose analytics. 302 (temporary) keeps every request flowing through your servers for tracking.`,
    intuition: `A URL shortener is fundamentally a **distributed hash map** — it maps a short key to a long URL and retrieves it with single-digit millisecond latency. The two core design challenges are: (1) generating **globally unique short codes** at scale without coordination bottlenecks, and (2) serving **billions of redirects/day** with consistent low latency.`,
    approach: `## Component Overview

A **stateless API layer** behind a load balancer handles both creation and redirection. A **Key Generation Service (KGS)** pre-generates unique short codes to avoid collision at write time. A **NoSQL database** stores the URL mappings. A **distributed cache** (Redis) absorbs the read-heavy redirect traffic.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/urls\` | Create | Body: \`{ longUrl, customAlias?, expireAt? }\` → Returns \`{ shortUrl }\` |
| \`GET /:shortCode\` | Redirect | Returns **302** redirect to original URL |
| \`DELETE /api/v1/urls/:shortCode\` | Delete | Removes the URL mapping |

## Data Model

| Column | Type | Notes |
|--------|------|-------|
| short_code (PK) | VARCHAR(7) | Base62 encoded key |
| long_url | TEXT | Original URL |
| user_id | BIGINT | Creator (nullable for anonymous) |
| created_at | TIMESTAMP | Creation time |
| expires_at | TIMESTAMP | TTL expiration |
`,
    code: `## Architecture Diagram

\`\`\`
+------------+        +------------------+
|  Client    |------->| Load Balancer    |
|  (Browser) |<-------| (Nginx / ALB)    |
+------------+  302   +--------+---------+
                                |
                       +--------v---------+
                       | API Servers       |
                       | (Stateless)       |
                       |                   |
                       | POST /api/v1/urls |
                       | GET /:shortCode   |
                       +----+---------+----+
                            |         |
              +-------------v-+  +----v-----------+
              | Cache          |  | Key Gen         |
              | (Redis Cluster)|  | Service (KGS)   |
              |                |  |                  |
              | shortCode      |  | Pre-generated    |
              | -> longUrl     |  | unique keys      |
              +-------+--------+  +--------+---------+
                      |                    |
                      | miss               | allocate batch
              +-------v--------------------v---------+
              | Database (NoSQL)                      |
              | e.g., DynamoDB / Cassandra             |
              |                                       |
              | short_code -> long_url, metadata       |
              | Partitioned by short_code hash         |
              +---------------------------------------+
\`\`\`

## Write Flow (URL Creation)

\`\`\`
Client           API Server          KGS              DB
  |                  |                 |                |
  | POST /api/urls   |                 |                |
  |----------------->|                 |                |
  |                  | Get key batch   |                |
  |                  |---------------->|                |
  |                  | [key1,key2,..]  |                |
  |                  |<----------------|                |
  |                  |                 |                |
  |                  | Store key->url  |                |
  |                  |--------------------------------->|
  |                  |                 |     ACK        |
  |  { shortUrl }    |<---------------------------------|
  |<-----------------|                 |                |
\`\`\`

## Read Flow (Redirect)

\`\`\`
Client           API Server          Cache            DB
  |                  |                 |                |
  | GET /abc123      |                 |                |
  |----------------->|                 |                |
  |                  | Lookup abc123   |                |
  |                  |---------------->|                |
  |                  |                 |                |
  |                  | [HIT] longUrl   |                |
  |                  |<----------------|                |
  |                  |                 |                |
  |                  | [MISS]          |                |
  |                  | Query DB ----------------------->|
  |                  |<------------ return longUrl -----|
  |                  | Update cache    |                |
  |                  |---------------->|                |
  |                  |                 |                |
  | 302 Redirect     |                 |                |
  |<-----------------|                 |                |
\`\`\`
`,
    jsCode: `## Deep Dive: ID Generation Strategies

The most critical component — how do we generate unique short codes at scale?

### Option A: Base62 Encoding of Auto-Increment ID

\`\`\`
+--------------------+
| Auto-Increment     |
| ID Generator       |
| (Single DB seq)    |
+---------+----------+
          | ID: 11157
          v
+--------------------+
| Base62 Encode      |
| 11157 -> "2TX"     |
| chars: [0-9a-zA-Z] |
+--------------------+
\`\`\`

**Pros**: No collisions, simple, sortable by time
**Cons**: Predictable (security risk), single point of failure for ID gen

### Option B: Key Generation Service (KGS) — Recommended

\`\`\`
+------------------------------------------------+
| Key Generation Service                          |
|                                                 |
|  +---------------+    +---------------------+   |
|  | Used Keys     |    | Unused Keys         |   |
|  | DB Table      |    | DB Table            |   |
|  |               |    |                     |   |
|  | abc123  [x]   |    | xyz789  (available) |   |
|  | def456  [x]   |<---| qrs012  (available) |   |
|  | ghi789  [x]   |move| tuv345  (available) |   |
|  +---------------+    +----------+----------+   |
|                                  |              |
+----------------------------------+--------------+
                                   |
                                   | allocate batch
                    +--------------v--------------+
                    | API Server (in-memory)       |
                    | Local batch: [xyz789, qrs012]|
                    | Use one key per new URL      |
                    | Request new batch when low   |
                    +-----------------------------+
\`\`\`

**Pros**: No collisions, no coordination between servers, fast (in-memory keys)
**Cons**: Some keys wasted if server dies, slightly more complex

---

## Deep Dive: Database Partitioning

\`\`\`
                    Hash(shortCode)
                         |
           +-------------+-------------+
           |             |             |
           v             v             v
     +-----------+ +-----------+ +-----------+
     |Partition 0| |Partition 1| |Partition 2|
     |           | |           | |           |
     | a-f range | | g-p range | | q-z range |
     |           | |           | |           |
     | Replica 1 | | Replica 1 | | Replica 1 |
     | Replica 2 | | Replica 2 | | Replica 2 |
     | Replica 3 | | Replica 3 | | Replica 3 |
     +-----------+ +-----------+ +-----------+
\`\`\`

- **Partition key**: Hash of short_code for even distribution
- **Replication factor**: 3 for durability
- Why not partition by user_id? → Read path only has short_code, not user_id

---

## Deep Dive: Cache Strategy

\`\`\`
+----------------------------------------------+
| Cache Architecture                            |
|                                               |
| +-------------------------------------------+|
| | Tier 1: Local In-Memory (per server)      ||
| | - Top 1000 URLs per node                  ||
| | - ~0.1ms lookup                           ||
| +---------------------+---------------------+|
|                       | miss                  |
| +---------------------v---------------------+|
| | Tier 2: Redis Cluster (distributed)       ||
| | - 100GB across shards                     ||
| | - ~1ms lookup                             ||
| | - LRU eviction, 24h TTL                  ||
| +---------------------+---------------------+|
|                       | miss                  |
| +---------------------v---------------------+|
| | Tier 3: Database                          ||
| | - ~5-10ms lookup                          ||
| | - Populate cache on read                  ||
| +-------------------------------------------+|
+----------------------------------------------+
\`\`\`

- **Cache-aside pattern**: Check cache first, on miss read from DB and populate cache
- **Write-around**: Don't cache on write (most URLs are never accessed again)
- **Hot key protection**: Replicate extremely popular URLs across multiple cache shards
`,
    explanation: `## Bottlenecks & Improvements
- **Single KGS failure** → Run multiple KGS instances, each owning a key range. If one dies, its unused keys are lost (acceptable waste)
- **Database as bottleneck** → Read replicas + cache absorb 99%+ of reads. Writes are only ~1.2K QPS which a single primary handles easily
- **Cache thundering herd** → When a popular URL's cache expires, thousands of requests hit DB simultaneously. Use cache locking (only one request fetches from DB, others wait)
- **Global latency** → Deploy in multiple regions with geo-DNS routing. Each region has its own cache layer. DB replication across regions for reads

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| KGS over Base62 auto-increment | More complexity, but no single-point ID generation and non-predictable URLs |
| NoSQL over SQL | Lose ACID transactions, gain horizontal scaling and simpler key-value access |
| 302 over 301 redirect | Higher server load, but retain analytics and ability to update mappings |
| Cache-aside over write-through | Cold start on first access, but don't waste cache on URLs never visited |
| Eventual consistency | Short delay before URL is available in all regions, but higher availability |

## Monitoring & Alerting
- **Latency**: p50, p95, p99 for redirect response time
- **Error rate**: 404s (expired/missing URLs), 5xx from DB/cache failures
- **Cache hit ratio**: Should be > 95% — alert if drops below 90%
- **KGS key pool**: Alert when unused keys drop below threshold
`,
    timeComplexity: "Write: O(1) — single KGS key allocation + DB insert. Read: O(1) — cache lookup or single DB read.",
    spaceComplexity: "~18 TB/year for URL storage. ~100 GB for cache (20% hot URLs). Grows linearly with URL count.",
    hints: [
      "Always clarify the read-to-write ratio first — it determines your entire caching and scaling strategy. For URL shorteners, reads dominate 10:1 or higher.",
      "The KGS approach eliminates the hardest distributed systems problem (unique ID generation) by pre-computing keys. Each server holds a local batch — zero coordination at write time.",
      "Don't use MD5/SHA256 and truncate — collision probability is too high at scale. Base62 encoding of a unique ID or pre-generated keys are both better approaches.",
      "Consider the 301 vs 302 trade-off early — it affects whether you can do analytics and whether you can update/expire URLs. Most interviewers want to hear you reason about this."
    ],
  },
  {
    id: 9002,
    description: `## Clarifying Questions to Ask
- Is this an **API gateway-level** rate limiter or an application-level one?
- What **identifiers** do we limit on? (User ID, API key, IP address?)
- Do we need **different limits per endpoint** or user tier (free vs premium)?
- What should happen when the limiter is **unavailable**? Fail open or closed?
- Do we need to support **distributed** rate limiting across multiple servers?

## Functional Requirements
- Limit requests per user/IP/API-key within **configurable time windows**
- Support multiple algorithms: **token bucket**, sliding window, fixed window
- Return **HTTP 429** with \`Retry-After\` and \`X-RateLimit-Remaining\` headers
- Support **different rate limits** per endpoint and user tier

## Non-Functional Requirements
- **Ultra-low latency**: < 1ms per check (must not become the bottleneck)
- **Distributed**: consistent enforcement across all API servers
- **Fault-tolerant**: fail open if rate limiter is down (availability > protection)
- **Accurate**: minimize false positives (blocking legitimate traffic)

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Active users | 10M |
| Avg requests/user/day | 1,000 |
| Total QPS | 10M × 1000 / 86,400 ≈ **115K QPS** |
| Redis memory (token bucket) | 10M × ~74B ≈ **740 MB** |
| Redis memory (sliding window log) | 10M × 100 timestamps × 16B ≈ **16 GB** |
| Network to Redis | 115K × 100B ≈ **11.5 MB/s** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle a global rate limit** (e.g., 1M total requests/sec across all users)? → Use a global counter in Redis alongside per-user counters. Decrement atomically with Lua scripts.
- **How would you rate-limit WebSocket connections?** → Limit at connection establishment time + per-message rate limiting once connected. Track message rate per connection in local memory.
- **What about geo-distributed rate limiting?** → Deploy Redis in each region with local limits. Accept slight over-admission at region boundaries. Or use a "budget" system where each region gets a fraction of the global limit.
- **How would you handle rate limit rule changes?** → Canary deployment of rule changes. Admin override endpoint for emergencies. Audit log for all config changes.
- **How do you prevent abuse from distributed botnet IPs?** → Layer IP-based limits at the API gateway (Layer 1), combine with behavioral fingerprinting and CAPTCHA triggers.`,
    intuition: `A rate limiter is a **traffic cop** that decides in microseconds whether each request should pass or be rejected. The core challenge is a **distributed counting problem with a time dimension**: "Has this client made more than N requests in the last T seconds?" — and doing this accurately across multiple servers without adding latency.

The **token bucket** is the industry standard (used by AWS, Stripe, Google Cloud) because it balances burst tolerance with long-term rate enforcement using only 2 values per user.`,
    approach: `## Component Overview

A **rate limiter middleware** intercepts every request before it reaches the application. It extracts the client identity, looks up the applicable rules, and checks counters in **Redis** (centralized store). On rejection, it returns 429 with rate limit headers.

## API Headers

| Header | Description | Example |
|--------|-------------|---------|
| \`X-RateLimit-Limit\` | Max requests allowed in window | \`1000\` |
| \`X-RateLimit-Remaining\` | Requests remaining | \`897\` |
| \`X-RateLimit-Reset\` | UTC epoch when window resets | \`1679529600\` |
| \`Retry-After\` | Seconds to wait (only on 429) | \`30\` |

## Multi-Tier Rate Limiting

| Layer | Location | Limit By | Algorithm | Purpose |
|-------|----------|----------|-----------|---------|
| 1 | API Gateway | IP address | Fixed window | DDoS protection |
| 2 | Application | User / API key | Token bucket | Plan enforcement |
| 3 | Per-endpoint | User + endpoint | Sliding window | Protect expensive ops |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+      +----------------------+
| Client   |----->| API Gateway          |
+----------+      | (Layer 1: IP limits) |
                  +----------+-----------+
                             |
                  +----------v-----------+
                  | Load Balancer         |
                  +----+-------+----+----+
                       |       |    |
              +--------v-+ +---v--+ +-v--------+
              | API Srv 1 | |Srv 2| | API Srv 3|
              |           | |     | |          |
              | [Rate     | | [RL]| | [Rate    |
              |  Limiter  | |     | |  Limiter |
              |  Middle-  | |     | |  Middle- |
              |  ware]    | |     | |  ware]   |
              +-----+-----+ +--+--+ +----+----+
                    |          |          |
                    +----------+----------+
                               |
              +----------------v---------------+
              | Redis Cluster                   |
              |                                 |
              | +----------+ +--------------+   |
              | | Counters | | Rules Cache  |   |
              | | per user | | (refresh 30s)|   |
              | | per key  | |              |   |
              | +----------+ +--------------+   |
              |                                 |
              | Lua scripts for atomic ops      |
              +----------------+----------------+
                               |
              +----------------v----------------+
              | Rules Config DB                  |
              | (endpoint, tier, algorithm,      |
              |  max_requests, window_sec)       |
              +---------------------------------+
\`\`\`

## Request Flow

\`\`\`
Client           API Server          Redis            App
  |                  |                 |                |
  | GET /api/msgs    |                 |                |
  |----------------->|                 |                |
  |                  | Extract key:    |                |
  |                  | user123:/msgs   |                |
  |                  |                 |                |
  |                  | Lua: check+incr |                |
  |                  |---------------->|                |
  |                  | {allowed, rem}  |                |
  |                  |<----------------|                |
  |                  |                 |                |
  |                  | [ALLOWED]       |                |
  |                  | Forward + hdrs  |                |
  |                  |--------------------------------->|
  | 200 + headers    |<---------------------------------|
  |<-----------------|                 |                |
  |                  |                 |                |
  |                  | [REJECTED]      |                |
  | 429 Retry-After  |                 |                |
  |<-----------------|                 |                |
\`\`\``,
    jsCode: `## Deep Dive: Rate Limiting Algorithms

The choice of algorithm is the most important design decision. Here are the four main approaches:

### Algorithm 1: Fixed Window Counter

\`\`\`
  Window 1 (12:00-12:01)     Window 2 (12:01-12:02)
  +---------------------+    +---------------------+
  |  ########..  90     |    |  ########..  90     |
  |  limit: 100         |    |  limit: 100         |
  +---------------------+    +---------------------+
                        ^    ^
                  12:00:50  12:01:10
                        +--+-+
                  180 requests in 20 sec!
                  (boundary burst problem)
\`\`\`

**Redis**: \`INCR key\` + \`EXPIRE key window\`
**Pros**: O(1) memory, dead simple
**Cons**: Up to 2x burst at window boundaries

---

### Algorithm 2: Sliding Window Counter (Recommended for accuracy)

\`\`\`
  Previous window           Current window
  (12:00 - 12:01)          (12:01 - 12:02)
  Total: 80 requests        So far: 30 requests
  +--------------------+    +--------------------+
  |  ############      |    |  ######            |
  +--------------------+    +--------------------+
                                 ^
                            12:01:15 (25% into window)

  Weighted count = 80 x 0.75 + 30 = 90
  Limit: 100 -> 90 < 100 -> ALLOW
\`\`\`

**Redis**: 2 counters + 1 timestamp per user
**Pros**: O(1) memory, no boundary burst, 99.9% accurate
**Cons**: Approximate (not exact)

---

### Algorithm 3: Token Bucket (Industry Standard)

\`\`\`
  Bucket capacity: 10 tokens, Refill rate: 1 token/sec

  t=0       t=0(burst)   t=5          t=5(req)
  +------+  +------+     +------+     +------+
  |######|  |      |     |###   |     |##    |
  |######|  |      |     |###   |     |##    |
  |######|  |      |     |###   |     |##    |
  |######|  |      |     |###   |     |##    |
  |######|  |      |     |###   |     |##    |
  |10 tkn|  |0 tkn|     |5 tkn |     |4 tkn |
  +------+  +------+     +------+     +------+
  10 reqs   all OK    refill +5       1 used
\`\`\`

**Redis**: 2 values per user (\`tokens\` + \`last_refill\`)
**Pros**: Allows controlled bursts, smooth limiting, O(1)
**Cons**: Slightly more state than fixed window

---

### Algorithm 4: Leaky Bucket

\`\`\`
  Queue capacity: 5       Processing: 1 req/sec
  +-----+
  |  5  | <-- reject (queue full)
  |  4  |
  |  3  | -->  processed at steady rate
  |  2  |      regardless of input rate
  |  1  |
  +--+--+
     |
     v
  1 req/sec out
\`\`\`

**Pros**: Perfectly smooth output rate
**Cons**: No burst tolerance, adds latency (requests wait)

---

## Deep Dive: Distributed Consistency

The hardest problem — how to prevent race conditions across servers:

\`\`\`
  WITHOUT atomic operations:

  Server A           Redis            Server B
     |                 |                  |
     | READ count=99   |                  |
     |<----------------|  READ count=99   |
     |                 |----------------->|
     | count<100 ALLOW |                  |
     | INCR -> 100     |  count<100 ALLOW |
     |---------------->|  INCR -> 101 !!  |
     |                 |<-----------------|
     |                 |                  |
         !! Both allowed! Limit exceeded!

  WITH Lua script (atomic):

  Server A           Redis            Server B
     |                 |                  |
     | EVAL lua_script |                  |
     |---------------->|                  |
     | check+incr      |                  |
     | -> allowed,rm=0 |  EVAL lua_script |
     |<----------------|<-----------------|
     |                 |  check+incr      |
     |                 |  -> rejected!    |
     |                 |----------------->|
         OK -- Correctly enforced!
\`\`\`

---

## Deep Dive: Failover Strategy

\`\`\`
  +-------------------------------+
  |       Circuit Breaker         |
  |                               |
  |  CLOSED --> OPEN --> HALF-OPEN|
  |    |        3 fails           |
  |    |        <100ms            |
  |    v                          |
  |  Normal      Fallback         |
  |  (Redis)     (Local mem)      |
  +-------------------------------+

  Normal mode:
    All servers -> Redis Cluster (accurate, centralized)

  Degraded mode (Redis down):
    Each server -> local in-memory counters
    Local limit = global limit / server count
    e.g., 1000 req/min / 4 servers = 250/server

  Recovery:
    Circuit breaker half-opens after 30s
    Test single request to Redis
    If OK -> resume centralized mode
\`\`\`
`,
    explanation: `## Bottlenecks & Improvements
- **Redis as single dependency** → Redis Cluster with replicas for HA. Circuit breaker falls back to local counters within 100ms. Fail open for user-facing APIs.
- **Cross-region latency** → Deploy Redis in each region with local rate limits. Accept slight over-admission at boundaries rather than adding 50ms cross-region latency.
- **Memory with sliding window log** → At scale, storing every timestamp costs ~16 GB for 10M users. Switch to sliding window counter (O(1) per user, 99.9% accurate) or token bucket.
- **Rule configuration errors** → Canary deployment of rule changes. Admin override endpoint. Immediate rollback capability.

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Centralized (Redis) over local counters | Adds 0.1-0.5ms latency, but accurate across all servers |
| Token bucket over fixed window | Slightly more state per user, but allows controlled bursts and no boundary problem |
| Fail open over fail closed | Risk of brief unprotected period, but no service outage |
| Lua scripts over multi-step Redis | Slight Lua complexity, but eliminates race conditions entirely |
| Per-user + global limits | More rules to manage, but both fairness and system protection |

## Monitoring & Alerting
- **Allow/reject ratio** per endpoint per tier — alert if reject > 10%
- **Redis p99 latency** — alert if > 2ms
- **Circuit breaker state changes** — alert on any OPEN transition
- **Top rate-limited users** — identify abuse patterns
- **Local fallback activations** — indicates Redis issues
`,
    timeComplexity: "Token bucket: O(1) per check. Sliding window counter: O(1). Sliding window log: O(log N). Fixed window: O(1). Redis round-trip: 0.1-0.5ms same DC.",
    spaceComplexity: "Token bucket: ~160 MB for 10M users. Sliding window counter: ~240 MB. Sliding window log: ~16 GB (needs Redis Cluster). Recommended: 2-4 GB Redis handles 10M users.",
    hints: [
      "The token bucket is the industry standard — AWS, Stripe, and Google Cloud all use it. It stores only 2 values per user (tokens + last_refill_time). Know how to explain why it's preferred over fixed window.",
      "The distributed race condition is the #1 interview differentiator. Without atomic ops, N servers can all read the same counter and all allow — exceeding the limit by Nx. Redis Lua scripts make check-and-increment atomic in a single round-trip.",
      "Fail-open vs fail-closed is a critical decision interviewers specifically ask about. Fail open for user-facing APIs (availability > protection). Fail closed for billing/payment APIs where over-use has direct cost.",
      "Multi-tier rate limiting separates junior from senior answers: Layer 1 (IP at gateway) stops DDoS, Layer 2 (user at app) enforces plan limits, Layer 3 (per-endpoint) protects expensive operations. Each layer can use a different algorithm."
    ],
  },
  {
    id: 9003,
    description: `## Clarifying Questions to Ask
- What **channels** must we support? (Push, SMS, Email, In-app?)
- What is the **daily volume**? How many notifications per day?
- Do we need **priority levels**? (Critical OTP vs marketing emails?)
- Should users manage **preferences** (opt-out, quiet hours, frequency caps)?
- Do we need **scheduling** (send at a specific time, timezone-aware)?
- What **delivery guarantee**? At-least-once? Exactly-once?

## Functional Requirements
- Support multiple channels: **push** (FCM/APNs), **SMS** (Twilio), **email** (SendGrid), **in-app**
- User preference management: **opt-in/out** per channel, **quiet hours**, **frequency caps**
- Template engine with **variable substitution** and **localization** (i18n)
- **Priority levels**: critical (<5s), high (<30s), normal (best-effort)
- **Idempotent** processing — same event must not produce duplicate deliveries

## Non-Functional Requirements
- **High availability**: 99.99% for critical notifications (OTP/2FA)
- **Scalable**: 100M+ notifications/day
- **Low latency**: Critical notifications delivered within 5 seconds end-to-end
- **Fault-tolerant**: Provider failures must not block the pipeline

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily volume | 10M notifications (5M push, 3M email, 1.5M SMS, 500K in-app) |
| Average QPS | 10M / 86,400 ≈ **116/sec** |
| Peak QPS (campaign) | 100K/min ≈ **1,667/sec** (10x burst) |
| Message size | ~1 KB (metadata + rendered content) |
| Storage (logs, 90 days) | 10M/day x 90 x 500B ≈ **450 GB** |
| Redis (dedup cache, 24h) | 10M x 32B ≈ **320 MB** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle provider outages?** → Circuit breaker per provider. If FCM fails 5 times in 30s, open circuit and try fallback provider. Queue messages for retry when circuit closes. Critical notifications get a dedicated fallback path (e.g., SMS fallback for push).
- **How do you prevent notification fatigue?** → Frequency caps tracked in Redis sorted sets (ZADD with timestamp, ZCOUNT for the window). If cap exceeded for normal priority, silently drop. Critical notifications (OTP) always bypass caps. Aggregate similar notifications ("You have 5 new orders" instead of 5 separate notifications).
- **How would you support A/B testing on notification content?** → Template versioning with traffic splitting. Route a percentage of users to variant B template. Track open rates and click rates per variant. Use the analytics pipeline (Kafka -> analytics DB) to measure engagement.
- **What happens when notifications fail permanently?** → Dead letter queue for notifications that fail after all retries. If a device token is invalid (user uninstalled), remove it from device registry. Hard-bounced emails get marked invalid. Alert ops if DLQ grows beyond threshold.
- **How would you handle a 10x traffic spike from a marketing blast?** → Normal-priority queue absorbs the burst without affecting critical path. Auto-scale workers based on queue depth. Provider rate limiting with token bucket prevents 429 errors. Batch sending where providers support it (SendGrid: 1000 recipients per API call).`,
    intuition: `A notification service is fundamentally an **event-driven fan-out pipeline** — it transforms a single business event ("order confirmed") into concrete deliveries across multiple channels while respecting each user's preferences. The core challenge is NOT sending notifications (third-party providers handle delivery), but building a **reliable priority pipeline** that never drops critical messages, never sends duplicates, and never annoys users.`,
    approach: `## Component Overview

A **Notification API** receives requests and validates them against user preferences. **Kafka topics partitioned by priority** ensure critical messages (OTP) are never blocked by marketing blasts. **Channel workers** (push, email, SMS, in-app) consume from Kafka, render templates, and deliver via **provider adapters** with circuit breakers. A **preference service** manages opt-outs and frequency caps. A **delivery tracker** records the full lifecycle.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/notifications\` | Create | Body: \`{ userId, templateId, channels[], priority, variables, idempotencyKey }\` |
| \`GET /api/v1/notifications/:id\` | Status | Returns delivery status per channel |
| \`PUT /api/v1/preferences/:userId\` | Update | Body: \`{ pushEnabled, emailEnabled, quietStart, quietEnd, timezone }\` |
| \`POST /api/v1/templates\` | Create | Body: \`{ templateId, channel, locale, subject, body }\` |

## Data Model — notifications

| Column | Type | Notes |
|--------|------|-------|
| id (PK) | UUID | Unique notification ID |
| user_id | BIGINT | Target user (indexed) |
| template_id | VARCHAR(64) | Template reference |
| channel | ENUM | push, sms, email, in_app |
| priority | ENUM | critical, high, normal |
| status | ENUM | pending, sent, delivered, failed, bounced |
| payload | JSONB | Rendered content + variables |
| scheduled_at | TIMESTAMP | For delayed delivery |
| created_at | TIMESTAMP | Creation time |

## Data Model — user_preferences

| Column | Type | Notes |
|--------|------|-------|
| user_id (PK) | BIGINT | User reference |
| push_enabled | BOOLEAN | Default: true |
| email_enabled | BOOLEAN | Default: true |
| sms_enabled | BOOLEAN | Default: true |
| quiet_start | TIME | e.g., 22:00 |
| quiet_end | TIME | e.g., 08:00 |
| timezone | VARCHAR(50) | Default: UTC |
| frequency_cap | INT | Max per hour (default: 10) |
`,
    code: `## Architecture Diagram

\`\`\`
+------------------+     +------------------+
| Business Service |---->| Notification API |
| (Order, Auth..)  |     | (Validate +      |
+------------------+     |  Enqueue)        |
                          +--------+---------+
                                   |
                    +--------------+--------------+
                    |              |              |
              +-----v----+  +-----v----+  +------v-----+
              | Kafka     |  | Kafka     |  | Kafka       |
              | CRITICAL  |  | HIGH      |  | NORMAL      |
              | topic     |  | topic     |  | topic       |
              +-----+-----+ +-----+-----+ +------+------+
                    |              |              |
              +-----v----+  +-----v----+  +------v-----+
              | Workers   |  | Workers   |  | Workers     |
              | (4x)      |  | (2x)      |  | (1x)        |
              +-+---+---+-+  +-+---+---+-+  +-+---+---+--+
                |   |   |     |   |   |      |   |   |
              +-v-+ | +-v-+ +-v-+ | +-v-+  +-v-+ | +-v-+
              |FCM| | |SG | |FCM| | |Twl|  |SG | | |App|
              +---+ | +---+ +---+ | +---+  +---+ | +---+
                  +-v-+          +-v-+          +-v-+
                  |APNs|         |APNs|         |FCM|
                  +----+         +----+         +---+
\`\`\`

## Write Flow (Send Notification)

\`\`\`
Business Svc     API Server       Redis         Kafka          DB
  |                  |               |              |             |
  | POST /notify     |               |              |             |
  |----------------->|               |              |             |
  |                  | Check idemp.  |              |             |
  |                  | key           |              |             |
  |                  |-------------->|              |             |
  |                  | Not found     |              |             |
  |                  |<--------------|              |             |
  |                  |               |              |             |
  |                  | Check prefs   |              |             |
  |                  |-------------->|              |             |
  |                  | push=T,email=T|              |             |
  |                  |<--------------|              |             |
  |                  |               |              |             |
  |                  | Publish msg per channel      |             |
  |                  |----------------------------->|             |
  |                  |               |              |             |
  |                  | Store record  |              |             |
  |                  |---------------------------------------------->|
  |                  |               |              |             |
  |                  | Set idemp key |              |             |
  |                  |-------------->|              |             |
  |  { notif_id }   |               |              |             |
  |<-----------------|               |              |             |
\`\`\`

## Read Flow (Worker Processing)

\`\`\`
Kafka            Worker           Template Svc    Provider       DB
  |                  |               |              |             |
  | Consume msg      |               |              |             |
  |----------------->|               |              |             |
  |                  | Fetch template |              |             |
  |                  |-------------->|              |             |
  |                  | Rendered body  |              |             |
  |                  |<--------------|              |             |
  |                  |               |              |             |
  |                  | Send via adapter             |             |
  |                  |----------------------------->|             |
  |                  |               |    ACK       |             |
  |                  |<-----------------------------|             |
  |                  |               |              |             |
  |                  | Update status="sent"         |             |
  |                  |---------------------------------------------->|
  |                  |               |              |             |
  | Commit offset   |               |              |             |
  |<-----------------|               |              |             |
\`\`\`
`,
    jsCode: `## Deep Dive: Priority Isolation Architecture

The most critical design decision — ensuring OTP notifications are never blocked by marketing blasts.

### Separate Kafka Topics by Priority

\`\`\`
+--------------------------------------------------+
| Kafka Cluster                                     |
|                                                   |
| +----------------------------------------------+ |
| | Topic: notifications.critical                 | |
| | Partitions: 8 | Retention: 7d                | |
| | Dedicated consumer group: 4 workers           | |
| | Reserved capacity: always available           | |
| +----------------------------------------------+ |
|                                                   |
| +----------------------------------------------+ |
| | Topic: notifications.high                     | |
| | Partitions: 4 | Retention: 7d                | |
| | Consumer group: 2 workers                     | |
| +----------------------------------------------+ |
|                                                   |
| +----------------------------------------------+ |
| | Topic: notifications.normal                   | |
| | Partitions: 4 | Retention: 7d                | |
| | Consumer group: 1 worker (auto-scales)        | |
| +----------------------------------------------+ |
+--------------------------------------------------+
\`\`\`

**Why separate topics?** A marketing blast of 1M emails creates a 1M-message backlog. With one queue, a critical OTP would wait behind 1M messages. With separate topics and dedicated workers, the OTP bypasses the backlog entirely.

---

## Deep Dive: Provider Adapter with Circuit Breaker

\`\`\`
+-----------------------------------------------+
| Provider Adapter (e.g., FCM)                   |
|                                                |
|  +------------------------------------------+ |
|  | Circuit Breaker                           | |
|  |                                           | |
|  | State: CLOSED (normal)                    | |
|  |   |                                       | |
|  |   v  5 failures in 30s                    | |
|  | State: OPEN (reject all)                  | |
|  |   |                                       | |
|  |   v  after 60s cooldown                   | |
|  | State: HALF-OPEN (try 1 request)          | |
|  |   |           |                           | |
|  |   v success   v failure                   | |
|  | CLOSED      OPEN                          | |
|  +------------------------------------------+ |
|                                                |
|  +------------------------------------------+ |
|  | Rate Limiter (Token Bucket)               | |
|  | FCM: 1000 req/sec                         | |
|  | Twilio: 400 msg/sec                       | |
|  | SendGrid: tier-based                      | |
|  +------------------------------------------+ |
|                                                |
|  +------------------------------------------+ |
|  | Retry Policy                              | |
|  | Transient (429, 503): exponential backoff | |
|  | Permanent (invalid token): fail + cleanup | |
|  +------------------------------------------+ |
+-----------------------------------------------+
\`\`\`

---

## Deep Dive: Idempotency & Deduplication

\`\`\`
+---------------------------------------------------+
| Idempotency Flow                                   |
|                                                    |
|  Request arrives with idempotency_key              |
|         |                                          |
|         v                                          |
|  +----------------+                                |
|  | Redis Lookup   |                                |
|  | GET idemp:{key} |                                |
|  +-------+--------+                                |
|          |                                         |
|    +-----+------+                                  |
|    |            |                                  |
|    v            v                                  |
|  FOUND        NOT FOUND                            |
|  Return        Process notification                |
|  cached        SET idemp:{key} with 24h TTL        |
|  response      Continue pipeline                   |
|                                                    |
+---------------------------------------------------+
\`\`\`

At-least-once delivery means a worker might crash after sending but before committing the Kafka offset. On restart, it re-consumes the message. Without idempotency, the user gets a duplicate. The Redis check (sub-millisecond) prevents this.
`,
    explanation: `## Bottlenecks & Improvements
- **Single provider failure** → Circuit breaker per provider with automatic fallback. If FCM is down, buffer push notifications and retry. Critical notifications get a secondary channel fallback (e.g., SMS if push fails)
- **Campaign blast overwhelming normal queue** → Auto-scale normal-priority workers based on queue depth. Batch sending where providers support it (SendGrid: 1000 recipients/API call)
- **Webhook processing lag** → Separate webhook ingestion service with its own Kafka topic. Idempotent webhook processing (providers send duplicates). State machine validates transitions
- **Template rendering bottleneck** → Pre-compile templates at startup, cache compiled templates per worker. Sub-millisecond rendering for most templates

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Kafka over simple queue (SQS) | More operational complexity, but get durability, ordering, replay, and consumer groups |
| Separate topics per priority | More topics to manage, but guaranteed isolation between critical and normal traffic |
| At-least-once over exactly-once | Simpler delivery guarantee, but requires idempotency layer to prevent duplicates |
| Redis for dedup over DB | Lose durability (24h TTL), but sub-millisecond dedup checks don't slow the pipeline |
| Provider adapters over direct calls | More abstraction layers, but easy to swap providers and add circuit breakers |

## Monitoring & Alerting
- **Delivery latency**: p50, p95, p99 per channel per priority — alert if critical > 5s
- **Queue depth**: Per priority topic — alert if critical queue depth > 100 (should be near-zero)
- **Provider error rate**: Per provider — trigger circuit breaker alerts
- **Dedup hit rate**: High rate may indicate upstream retry storms
- **Delivery success rate**: Per channel — alert if drops below 95%
`,
    timeComplexity: "Send: O(1) per notification — Redis dedup check + Kafka publish. Worker processing: O(1) — template render + provider API call. End-to-end: <5s critical, <30s high.",
    spaceComplexity: "~450 GB for 90-day delivery logs. ~320 MB Redis for 24h dedup cache. Kafka retention: 7 days x ~1.67 MB/sec peak ≈ ~1 TB.",
    hints: [
      "Always separate queues by priority level. This is the single most important decision — a marketing blast must never delay an OTP code. Dedicated topics with dedicated worker pools ensure isolation.",
      "Idempotency is non-negotiable in at-least-once systems. Use a Redis-backed idempotency key with 24h TTL. Check before processing, set after enqueuing. This prevents duplicate notifications when workers crash and re-consume.",
      "Provider rate limiting requires a token bucket per provider. SMS providers like Twilio allow 100-400 msg/sec. When the bucket empties, buffer locally and drain at the provider's rate. Batch sending dramatically improves throughput.",
      "Don't forget quiet hours and frequency caps — they separate a production system from a toy. Track per-user notification counts in Redis sorted sets. Critical notifications (OTP, security) always bypass caps."
    ],
  },
  {
    id: 9004,
    description: `## Clarifying Questions to Ask
- Is this **1:1 messaging** only, or also **group chats**?
- What is the expected **scale**? (DAU, messages/day?)
- Do we need **read receipts** and **typing indicators**?
- Should messages support **media** (images, video, documents)?
- Do we need **end-to-end encryption**?
- How many **devices** per user? (Phone, web, desktop sync?)

## Functional Requirements
- **1:1 messaging** with real-time delivery (<500ms)
- **Group messaging** up to 256 members
- **Online/offline/last-seen** presence status
- **Read receipts**: single check (sent), double check (delivered), blue (read)
- **Media sharing**: images, video, documents (up to 100MB)
- **Message history** sync across multiple devices
- Push notifications for **offline users**

## Non-Functional Requirements
- **Ultra-low latency**: Messages delivered in <500ms for online users
- **Massive scale**: 500M DAU, 100B messages/day
- **Zero message loss**: At-least-once delivery with idempotent processing
- **High availability**: 99.99% uptime
- **Ordered delivery**: Messages within a conversation maintain order

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| DAU | 500M users |
| Messages/day | 100B (avg 200 per active user) |
| Average QPS | 100B / 86,400 ≈ **1.16M msg/sec** |
| Peak QPS | 3x average ≈ **3.5M msg/sec** |
| Message size | ~100 bytes text, ~1 KB with metadata |
| Daily storage (text) | 100B x 100B ≈ **10 TB/day** |
| Daily storage (media) | 5% have media, avg 500KB ≈ **2.5 PB/day** |
| Concurrent WebSocket connections | 250M (500M x 50% online) |
| WebSocket server RAM | 250M x 10KB ≈ **2.5 TB** (~25K servers) |
`,
    examples: `## Follow-Up Discussion Points
- **How do you handle read receipts in large groups?** → Aggregate receipts. Instead of "Bob read message 42," batch to "Bob read up to message 50." Only send receipts to the message sender, not all group members. Individual read times are fetched on-demand (pull, not push) when a user taps a message.
- **How do you handle typing indicators efficiently?** → Typing indicators are ephemeral — NEVER persist them. If the recipient is offline, discard entirely. Client-side 3-second timeout: show indicator for 3s, hide if no new typing event arrives. This handles app crashes gracefully without a "stopped typing" event.
- **How would you handle media messages at scale?** → Never route media through chat servers. Client gets a pre-signed upload URL from media service, uploads directly to S3, then sends a chat message with the S3 URL. Thumbnails are pre-generated by a Lambda trigger on upload for instant preview.
- **How does end-to-end encryption affect the architecture?** → Server never sees plaintext. Uses Signal Protocol (Double Ratchet). Implications: server-side search is impossible, push notifications must be generic ("New message"), key exchange becomes a critical component.
- **How do you sync across multiple devices?** → Each device has its own sequence tracker. When Alice sends from phone, her web client is included in the fanout list as another recipient. Read receipts: mark "read" when ANY device reads (not all). Primary device (phone) is source of truth.`,
    intuition: `A chat system is fundamentally a **real-time message routing problem** — millions of users connected via persistent WebSockets, and every message must be routed to the correct recipient(s) with sub-second latency. The two core challenges are: (1) maintaining **millions of concurrent persistent connections** across a server fleet, and (2) reliably delivering messages to **offline users** when they reconnect.`,
    approach: `## Component Overview

**Chat servers** maintain persistent **WebSocket connections** with clients. A **connection registry** (Redis) maps each online user to their chat server. When a message arrives, the chat server looks up the recipient's server and forwards the message. If the recipient is offline, the message is stored in an **offline message queue** (Cassandra) and a **push notification** is triggered. Messages are persisted to a **message store** (Cassandra, partitioned by conversation_id) for history sync.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`WS /ws/chat\` | WebSocket | Persistent connection for real-time messaging |
| \`POST /api/v1/messages/send\` | HTTP fallback | Send message if WebSocket unavailable |
| \`GET /api/v1/messages/:convId\` | Fetch | Paginated message history (cursor-based) |
| \`PUT /api/v1/presence/:userId\` | Update | Online/offline/last-seen status |
| \`POST /api/v1/groups\` | Create | Create group with member list |

## Data Model — messages

| Column | Type | Notes |
|--------|------|-------|
| message_id (PK) | BIGINT | Snowflake ID (encodes timestamp) |
| conversation_id | BIGINT | Hash of sorted user IDs (1:1) or group ID |
| sender_id | BIGINT | Author |
| content | BLOB | Encrypted message body |
| content_type | ENUM | text, image, video, document, audio |
| media_url | VARCHAR(500) | S3 URL for media |
| status | ENUM | sent, delivered, read |
| created_at | TIMESTAMP | Message timestamp |

## Data Model — conversations

| Column | Type | Notes |
|--------|------|-------|
| conversation_id (PK) | BIGINT | Unique ID |
| type | ENUM | one_on_one, group |
| participants | SET<BIGINT> | Member user IDs |
| last_message_id | BIGINT | For conversation list ordering |
| updated_at | TIMESTAMP | Last activity time |
`,
    code: `## Architecture Diagram

\`\`\`
+-----------+   WebSocket    +------------------+
|  Client   |<-------------->| Chat Server      |
|  (Phone,  |                | (Stateful WS)    |
|   Web)    |                +--------+---------+
+-----------+                         |
                                      |
                            +---------v----------+
                            | Connection Registry |
                            | (Redis)             |
                            | userId -> serverId  |
                            +----+-------+--------+
                                 |       |
                    +------------+       +------------+
                    |                                 |
              +-----v-------+                  +------v------+
              | Message      |                  | Presence     |
              | Store        |                  | Service      |
              | (Cassandra)  |                  | (Redis)      |
              |              |                  |              |
              | Partitioned  |                  | online/      |
              | by conv_id   |                  | offline/     |
              +--------------+                  | last_seen    |
                                                +--------------+
                    +------------------+
                    | Push Notification |
                    | Service           |
                    | (for offline)     |
                    +------------------+

              +------------------+
              | Media Service    |
              | (S3 + CDN)      |
              | Pre-signed URLs  |
              +------------------+
\`\`\`

## Write Flow (Send Message — 1:1)

\`\`\`
Sender           Chat Server A    Redis Registry   Chat Server B    Receiver
  |                  |                 |                |              |
  | WS: send msg     |                 |                |              |
  |----------------->|                 |                |              |
  |                  | Lookup receiver |                |              |
  |                  |---------------->|                |              |
  |                  | serverB         |                |              |
  |                  |<----------------|                |              |
  |                  |                 |                |              |
  |                  | Forward msg     |                |              |
  |                  |--------------------------------->|              |
  |                  |                 |                | WS: push msg |
  |                  |                 |                |------------->|
  |                  |                 |                |              |
  |                  |                 |                | ACK          |
  |                  |                 |                |<-------------|
  |                  | Delivery ACK    |                |              |
  |                  |<---------------------------------|              |
  | Status: delivered|                 |                |              |
  |<-----------------|                 |                |              |
\`\`\`

## Write Flow (Offline Recipient)

\`\`\`
Sender           Chat Server A    Redis Registry   Msg Store    Push Svc
  |                  |                 |              |             |
  | WS: send msg     |                 |              |             |
  |----------------->|                 |              |             |
  |                  | Lookup receiver |              |             |
  |                  |---------------->|              |             |
  |                  | NOT FOUND       |              |             |
  |                  |<----------------|              |             |
  |                  |                 |              |             |
  |                  | Store offline   |              |             |
  |                  |------------------------------>|             |
  |                  |                 |              |             |
  |                  | Trigger push    |              |             |
  |                  |-------------------------------------------->|
  |                  |                 |              |             |
  | Status: sent     |                 |              |             |
  |<-----------------|                 |              |             |
\`\`\`
`,
    jsCode: `## Deep Dive: WebSocket Connection Management

The hardest scaling challenge — maintaining 250 million concurrent persistent connections.

### Connection Architecture

\`\`\`
+----------------------------------------------------------+
| WebSocket Server Fleet (~25,000 servers)                  |
|                                                           |
|  +-------------------+  +-------------------+             |
|  | Chat Server 1     |  | Chat Server 2     |  ...        |
|  | 10K connections   |  | 10K connections   |             |
|  | ~100MB RAM        |  | ~100MB RAM        |             |
|  +---------+---------+  +---------+---------+             |
|            |                      |                       |
+----------------------------------------------------------+
             |                      |
    +--------v----------------------v--------+
    | Connection Registry (Redis Cluster)     |
    |                                         |
    | user:alice -> chat-server-1:ws-conn-42  |
    | user:bob   -> chat-server-2:ws-conn-17  |
    |                                         |
    | On connect: SET user:{id} server:{id}   |
    | On disconnect: DEL user:{id}            |
    | Heartbeat: EXPIRE user:{id} 30s         |
    +-----------------------------------------+
\`\`\`

Each server handles ~10K WebSocket connections. When a user connects, their mapping is registered in Redis. On disconnect (or heartbeat timeout), the mapping is removed. Messages are routed by looking up the recipient's server in Redis.

---

## Deep Dive: Message Ordering with Snowflake IDs

\`\`\`
+---------------------------------------------------+
| Snowflake ID Structure (64 bits)                   |
|                                                    |
| +----------+----------+---------+--------+         |
| | Sign (1) | Timestamp | DC ID  | Seq    |         |
| | 0        | (41 bits) | (5 bit)| (12bit)|         |
| |          | ms since  |        | 0-4095 |         |
| |          | epoch     |        | per ms |         |
| +----------+----------+---------+--------+         |
|                                                    |
| Properties:                                        |
| - Time-ordered: sort by ID = sort by time          |
| - Unique across data centers                       |
| - 4096 IDs per ms per machine                      |
| - No coordination needed between servers           |
+---------------------------------------------------+
\`\`\`

Messages are stored in Cassandra partitioned by conversation_id and clustered by message_id (Snowflake). This guarantees chronological ordering within each conversation without distributed coordination.

---

## Deep Dive: Group Message Fanout

\`\`\`
+------------------------------------------------------+
| Group Message Flow (256 members)                      |
|                                                       |
|  Sender sends to group G1                             |
|         |                                             |
|         v                                             |
|  +------------------+                                 |
|  | Chat Server      |                                 |
|  | 1. Store message  |                                |
|  |    in msg store   |                                |
|  | 2. Fetch group    |                                |
|  |    members (255)  |                                |
|  +--------+---------+                                 |
|           |                                           |
|     +-----+-----+-----+                               |
|     |     |     |     |                               |
|     v     v     v     v                               |
|   Online members:     Offline members:                |
|   Lookup server       Store in offline                |
|   in Redis,           queue + push                    |
|   forward via WS      notification                    |
|                                                       |
|  Optimization: Batch Redis lookups                    |
|  MGET user:m1 user:m2 ... user:m255                   |
|  Group by target server, send one batch per server    |
+------------------------------------------------------+
\`\`\`

For group messages, batch the Redis lookups (MGET), group recipients by their chat server, and send one batch per server instead of 255 individual forwards.
`,
    explanation: `## Bottlenecks & Improvements
- **WebSocket server failure** → When a server dies, 10K users lose their connection. Clients auto-reconnect to a different server. Connection registry TTL (30s heartbeat) ensures stale entries are cleaned up. Undelivered messages are in the message store — clients sync on reconnect
- **Hot conversation (viral group)** → A group with very active members can overload a single Cassandra partition. Solution: sub-partition large groups by time bucket (conversation_id + day)
- **Message ordering across devices** → Use Snowflake IDs (timestamp-based) so messages are globally time-ordered without coordination. Cassandra clustering key on message_id gives chronological reads
- **Connection registry as bottleneck** → Redis Cluster with multiple shards. Each lookup is O(1). For group fanout, use MGET to batch lookups

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| WebSocket over HTTP polling | More server complexity and state, but real-time delivery in <500ms |
| Cassandra over MySQL | Lose SQL queries and joins, gain horizontal scaling for massive write throughput |
| Snowflake IDs over auto-increment | More complex ID generation, but no single-point bottleneck and time-ordered |
| Push to offline queue over retry | More storage, but guarantees delivery when user reconnects |
| Server-side fanout for groups | Server does more work, but clients stay simple and battery-efficient |

## Monitoring & Alerting
- **WebSocket connection count**: Per server — alert if approaching 10K limit
- **Message delivery latency**: p50, p95, p99 — alert if p99 > 500ms
- **Offline queue depth**: Per user — alert if messages pile up (may indicate abandoned accounts)
- **Redis registry size**: Should match active WebSocket connections
- **Cassandra write latency**: Per partition — detect hot partitions
`,
    timeComplexity: "Send: O(1) for 1:1 (Redis lookup + forward). O(N) for group of N members (batch Redis MGET + fanout). History fetch: O(K) for K messages (Cassandra range query).",
    spaceComplexity: "~10 TB/day text messages. ~2.5 PB/day media (S3). ~2.5 TB RAM for 250M WebSocket connections. Redis registry: ~250M entries x 100B ≈ 25 GB.",
    hints: [
      "Start with 1:1 messaging before groups. The core flow is: sender -> chat server -> Redis lookup -> recipient's chat server -> recipient. Once this is solid, group messaging is a fan-out extension of the same pattern.",
      "The connection registry (userId -> serverId mapping in Redis) is the linchpin of the entire system. Without it, you cannot route messages to the correct server. Use heartbeats with TTL to handle ungraceful disconnects.",
      "Never route media through your chat servers — they are optimized for small text messages. Use pre-signed S3 URLs for upload/download. This keeps WebSocket servers free from large file transfers.",
      "Read receipts create quadratic traffic in groups if done naively. Aggregate them: 'Bob read up to message 50' instead of individual receipts. Only send to the message sender, not all members."
    ],
  },
  {
    id: 9005,
    description: `## Clarifying Questions to Ask
- Is the feed **chronological** or **ranked** (algorithmic)?
- What is the expected **scale**? (DAU, posts/day, feed reads/day?)
- How do we handle **celebrity accounts** with millions of followers?
- Do we need **real-time updates** (new posts appear without refresh)?
- What **content types**? (Text, images, video, links?)
- Do we need **like/comment/share** interactions?

## Functional Requirements
- Users create **posts** (text, images, video) visible to followers
- Home feed shows a **personalized, ranked timeline** from followed accounts
- Support **following/unfollowing** users
- **Celebrity accounts** (10M+ followers) must not cause system bottlenecks
- **Like, comment, share** interactions on posts
- **Feed pagination** with cursor-based infinite scroll

## Non-Functional Requirements
- **Feed generation** in <500ms (p99)
- **500M DAU**, each user loads feed ~10 times/day
- **Eventually consistent**: New post appearing within 5 seconds is acceptable
- **Ranked feed** provides better engagement than pure chronological

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| DAU | 500M users |
| Posts/day | 1B (avg 2 per active user) |
| Feed reads/day | 5B (500M x 10 loads) |
| Read QPS | 5B / 86,400 ≈ **57,800/sec** (peak: ~175K) |
| Write QPS | 1B / 86,400 ≈ **11,600/sec** (peak: ~35K) |
| Avg followers per user | 200 (median, long-tail distribution) |
| Celebrity followers | Up to 100M |
| Storage/post | ~800 bytes (text + metadata + media refs) |
| Daily storage | 1B x 800B ≈ **800 GB/day** (~292 TB/year) |
| Feed cache/user | 500 post IDs x 8B = 4 KB |
| Total feed cache | 500M x 4 KB = **2 TB** (Redis Cluster) |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle a user unfollowing someone?** → On unfollow, lazily filter the unfollowed user's posts from the feed cache at read time (mark as "from unfollowed"). Clean up in a background job. On follow, backfill the new followee's last 50 posts into the follower's feed cache with scoring.
- **How do you handle real-time feed updates?** → Don't use WebSocket push for every post (250M persistent connections is too expensive). Instead, increment a counter when fanout adds posts to a user's feed cache. Client polls every 30s. If counter changed, show "New posts available" banner. User taps to load.
- **How would you implement infinite scroll pagination?** → Cursor-based, not offset-based. Use the ranking score as cursor: "next 20 posts with score < X." Stable even when new posts are inserted (offsets would shift). In Redis: ZREVRANGEBYSCORE feed:{userId} (cursor) -inf LIMIT 0 20. Tiebreaker: post_id for same-score posts.
- **What if the social graph data is lost?** → Social graph is stored in both Redis (for fast fanout lookups) and a persistent store (MySQL/Cassandra). Redis is reconstructable from the persistent store. Use sorted sets: followers:{userId} and following:{userId} with follow-time as score.
- **How would you support content moderation?** → Async moderation pipeline. Posts go through automated checks (ML model for toxicity, image classification) before appearing in feeds. Flagged posts are held for human review. Remove from all feed caches via a "post deleted" fanout event.`,
    intuition: `A news feed is fundamentally a **fan-out problem** — when a user posts, how do you efficiently distribute that post to all their followers' feeds? The core tension is between **write-time fan-out** (pre-compute feeds, fast reads but expensive writes) and **read-time fan-out** (compute on read, cheap writes but slow reads). The key insight is to use a **hybrid approach**: fan-out-on-write for normal users, fan-out-on-read for celebrities.`,
    approach: `## Component Overview

A **Post Service** stores new posts. A **Fanout Service** distributes posts to followers' pre-computed feed caches (Redis sorted sets). For **celebrity accounts** (>10K followers), fanout is skipped — their posts are merged at read time. A **Feed Service** assembles the final feed by merging the pre-computed cache with on-demand celebrity post fetches, then applies a **Ranking Service** to score and order the results.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/posts\` | Create | Body: \`{ content, mediaUrls[], type }\` → Returns \`{ postId }\` |
| \`GET /api/v1/feed\` | Read | Query: \`?cursor=X&limit=20\` → Returns ranked posts |
| \`POST /api/v1/follow/:userId\` | Follow | Add to social graph, backfill feed |
| \`DELETE /api/v1/follow/:userId\` | Unfollow | Remove from social graph, lazy cleanup |
| \`POST /api/v1/posts/:id/like\` | Like | Increment like count |

## Data Model — posts

| Column | Type | Notes |
|--------|------|-------|
| post_id (PK) | BIGINT | Snowflake ID (time-ordered) |
| author_id | BIGINT | Creator user ID |
| content | TEXT | Post text (280 chars) |
| media_urls | JSON | Array of image/video URLs |
| type | ENUM | text, image, video, link |
| like_count | INT | Denormalized count |
| comment_count | INT | Denormalized count |
| created_at | TIMESTAMP | Post creation time |

## Data Model — social graph (Redis)

| Key Pattern | Type | Notes |
|-------------|------|-------|
| followers:{userId} | Sorted Set | All follower IDs, score = follow time |
| following:{userId} | Sorted Set | All followee IDs, score = follow time |
| feed:{userId} | Sorted Set | Pre-computed feed, score = ranking score |
| celebrity_posts:{userId} | Sorted Set | Recent posts by celebrity, score = timestamp |
`,
    code: `## Architecture Diagram

\`\`\`
+-----------+        +------------------+
|  Client   |------->| API Gateway /    |
|  (App)    |<-------| Load Balancer    |
+-----------+        +--------+---------+
                              |
                +-------------+-------------+
                |                           |
        +-------v--------+         +-------v--------+
        | Post Service    |         | Feed Service    |
        | (Write path)    |         | (Read path)     |
        +-------+--------+         +-------+--------+
                |                           |
                v                           |
        +----------------+                  |
        | Fanout Service  |                 |
        | (Async workers) |                 |
        +-------+--------+                 |
                |                           |
        +-------v-----------+       +-------v--------+
        | Feed Cache         |<------| Ranking        |
        | (Redis Cluster)    |       | Service        |
        | feed:{userId}      |       | (ML model)     |
        | = sorted set of    |       +----------------+
        |   post IDs + score |
        +--------------------+

        +--------------------+       +----------------+
        | Post Store          |       | Social Graph   |
        | (DB / Cassandra)    |       | (Redis + DB)   |
        | Full post content   |       | followers:{}   |
        +--------------------+       | following:{}   |
                                      +----------------+
\`\`\`

## Write Flow (New Post — Normal User)

\`\`\`
Author           Post Service     Fanout Service   Redis Cache      DB
  |                  |                 |              |              |
  | POST /posts      |                 |              |              |
  |----------------->|                 |              |              |
  |                  | Store post      |              |              |
  |                  |-------------------------------------------->|
  |                  |                 |              |              |
  |                  | Async fanout    |              |              |
  |                  |---------------->|              |              |
  | { postId }       |                 |              |              |
  |<-----------------|                 |              |              |
  |                  |                 | Get followers |              |
  |                  |                 |------------->|              |
  |                  |                 | [f1,f2..f200]|              |
  |                  |                 |<-------------|              |
  |                  |                 |              |              |
  |                  |                 | ZADD feed:f1 |              |
  |                  |                 | ZADD feed:f2 |              |
  |                  |                 | ... (200x)   |              |
  |                  |                 |------------->|              |
\`\`\`

## Read Flow (Load Feed)

\`\`\`
Reader           Feed Service     Redis Cache      Post Store    Ranking Svc
  |                  |                |               |              |
  | GET /feed        |                |               |              |
  |----------------->|                |               |              |
  |                  | Get cached feed|               |              |
  |                  |--------------->|               |              |
  |                  | [postIds]      |               |              |
  |                  |<---------------|               |              |
  |                  |                |               |              |
  |                  | Get celeb posts|               |              |
  |                  |--------------->|               |              |
  |                  | [celebPostIds] |               |              |
  |                  |<---------------|               |              |
  |                  |                |               |              |
  |                  | Merge + Rank   |               |              |
  |                  |---------------------------------------------->|
  |                  | Ranked IDs     |               |              |
  |                  |<----------------------------------------------|
  |                  |                |               |              |
  |                  | Hydrate posts  |               |              |
  |                  |------------------------------>|              |
  |                  | Full post data |               |              |
  |                  |<------------------------------|              |
  |                  |                |               |              |
  | Ranked feed      |                |               |              |
  |<-----------------|                |               |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Hybrid Fanout Strategy

The most critical design decision — balancing write cost vs read latency.

### Fan-out-on-Write vs Fan-out-on-Read

\`\`\`
+-------------------------------------------------------+
| Fan-out Decision Matrix                                |
|                                                        |
|  Author has < 10K followers?                           |
|       |                |                               |
|      YES               NO (Celebrity)                  |
|       |                |                               |
|       v                v                               |
|  WRITE FANOUT      READ FANOUT                         |
|  Push post ID      Store in                            |
|  to each           celebrity_posts:{id}                |
|  follower's        Merge at read time                  |
|  feed cache                                            |
|                                                        |
|  Cost: 200 Redis   Cost: 0 at write                    |
|  writes (fast)     ~10 Redis reads at                  |
|                    feed load time                       |
|                                                        |
|  If 10K+ followers:                                    |
|  10K Redis writes = too slow                           |
|  Celebrity with 50M followers =                        |
|  50M writes per post = IMPOSSIBLE                      |
+-------------------------------------------------------+
\`\`\`

**The threshold** (~10K followers) is tunable. Below it, write fanout keeps reads fast. Above it, read-time merge avoids the massive write amplification.

---

## Deep Dive: Feed Ranking

\`\`\`
+-------------------------------------------------------+
| Ranking Pipeline                                       |
|                                                        |
|  Input: merged post IDs (cache + celebrity)            |
|         |                                              |
|         v                                              |
|  +-------------------+                                 |
|  | Feature Extraction |                                |
|  | - Post age         |                                |
|  | - Author affinity  |                                |
|  |   (interaction     |                                |
|  |    frequency)      |                                |
|  | - Post engagement  |                                |
|  |   (likes/comments) |                                |
|  | - Content type     |                                |
|  |   preference       |                                |
|  +---------+---------+                                 |
|            |                                           |
|            v                                           |
|  +-------------------+                                 |
|  | Scoring Model     |                                 |
|  | score = 0.3*age   |                                 |
|  |   + 0.3*affinity  |                                 |
|  |   + 0.2*engage    |                                 |
|  |   + 0.1*type      |                                 |
|  |   + 0.1*diversity |                                 |
|  +---------+---------+                                 |
|            |                                           |
|            v                                           |
|  +-------------------+                                 |
|  | Re-ranking Rules  |                                 |
|  | - No 2 posts from |                                 |
|  |   same author     |                                 |
|  |   consecutively   |                                 |
|  | - Mix content      |                                 |
|  |   types            |                                 |
|  | - Boost unseen     |                                 |
|  +-------------------+                                 |
+-------------------------------------------------------+
\`\`\`

---

## Deep Dive: Feed Cache Structure

\`\`\`
+-------------------------------------------------------+
| Redis Sorted Sets for Feed Cache                       |
|                                                        |
|  Key: feed:{userId}                                    |
|  Score: ranking score (higher = more relevant)         |
|  Member: post_id                                       |
|                                                        |
|  +--------------------------------------------------+ |
|  | feed:alice                                        | |
|  |   post_9921  score: 0.95  (best friend, recent)  | |
|  |   post_8834  score: 0.87  (high engagement)      | |
|  |   post_7712  score: 0.82  (recent, liked author) | |
|  |   ...                                            | |
|  |   (max 500 entries, ZREMRANGEBYRANK to trim)      | |
|  +--------------------------------------------------+ |
|                                                        |
|  Key: celebrity_posts:{userId}                         |
|  Score: timestamp                                      |
|  Member: post_id                                       |
|                                                        |
|  +--------------------------------------------------+ |
|  | celebrity_posts:taylorswift                        | |
|  |   post_9950  score: 1711900000                    | |
|  |   post_9888  score: 1711800000                    | |
|  |   (max 100 entries, auto-trimmed)                 | |
|  +--------------------------------------------------+ |
+-------------------------------------------------------+
\`\`\`

On feed load: ZREVRANGEBYSCORE on feed:{userId} + ZREVRANGEBYSCORE on each followed celebrity's posts. Merge, rank, hydrate with full post content from Post Store.
`,
    explanation: `## Bottlenecks & Improvements
- **Celebrity post fanout skip causes read latency** → Cache the merged result. After first read, store the ranked feed with celebrity posts included. Invalidate on new celebrity post (increment counter, lazy refresh)
- **Fanout Service overload during viral moments** → Rate-limit fanout workers. Use priority queues: celebrity mentions and trending topics get higher fanout priority. Back-pressure to post service if queue depth exceeds threshold
- **Feed cache cold start (new user)** → Pre-compute feed on signup from the most popular accounts they follow. Warm the cache in background during onboarding flow
- **Stale feed cache** → TTL on feed entries. Background job refreshes feeds for active users. Inactive users get cache evicted and rebuilt on next login

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Hybrid fanout (write + read) | More complex than pure approach, but handles both normal users and celebrities efficiently |
| Redis sorted sets for feed | Limited to ~500 posts per user (memory), but O(log N) insert and range queries |
| Eventual consistency (5s delay) | Users don't see posts instantly, but dramatically simplifies fanout and reduces write amplification |
| Denormalized like/comment counts | Can drift from actual count, but avoids expensive COUNT queries on every feed load |
| Cursor-based pagination over offset | Slightly more complex client logic, but stable results when new posts are inserted |

## Monitoring & Alerting
- **Feed generation latency**: p50, p95, p99 — alert if p99 > 500ms
- **Fanout lag**: Time from post creation to last follower's cache update — alert if > 5s
- **Cache hit rate**: Should be > 90% — alert if drops (indicates cold start issues)
- **Fanout queue depth**: Alert if growing faster than workers can drain
- **Celebrity merge latency**: Track separately — alert if > 100ms
`,
    timeComplexity: "Post (write fanout): O(F) where F = follower count. Feed read: O(C + K) where C = followed celebrities, K = posts to rank. Celebrity post: O(1) write, merged at read time.",
    spaceComplexity: "~2 TB Redis for 500M user feed caches (4 KB each). ~292 TB/year post storage. Social graph: ~500M users x 200 avg followers x 16B ≈ 1.6 TB in Redis.",
    hints: [
      "The hybrid fanout approach is the key insight interviewers look for. Fan-out-on-write for normal users (fast reads), fan-out-on-read for celebrities (avoids 50M write amplification). The threshold (~10K followers) is tunable based on your latency vs cost trade-off.",
      "Feed ranking should be discussed even if not deeply implemented. Mention features: post age, author affinity (how often you interact), engagement signals (likes/comments), content type preference. A simple weighted formula is sufficient for the interview.",
      "Cursor-based pagination is essential for feeds. Never use offset-based — new posts shift everything. Use the ranking score as cursor with post_id as tiebreaker. Redis ZREVRANGEBYSCORE makes this natural.",
      "The social graph in Redis (sorted sets for followers/following) enables O(1) lookups during fanout. Store in both Redis and a persistent DB. Redis is the hot path; the persistent store is the source of truth for recovery."
    ],
  },
];
