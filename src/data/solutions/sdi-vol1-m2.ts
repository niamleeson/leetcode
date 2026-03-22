import { ProblemSolution } from './types';

export const sdiVol1M2: ProblemSolution[] = [
  {
    id: 9104,
    description: `## Clarifying Questions to Ask
- Where should the rate limiter live — **client-side, server-side, or as middleware**?
- Are we rate limiting by **user ID, IP address, or API endpoint**?
- What is the expected **scale** — how many requests per second across the fleet?
- Is the system **distributed** across multiple data centers?
- Do we need a **hard limit** (strictly enforce) or **soft limit** (allow brief bursts)?
- Should rejected users get a **meaningful error response** with retry information?

## Functional Requirements
- **Throttle excessive requests** that exceed a configurable threshold
- Return proper **HTTP 429 (Too Many Requests)** responses when limit is breached
- Provide **rate limit headers** so clients can self-regulate
- Support **multiple limiting rules** (e.g., 5 requests/sec AND 500 requests/day for the same user)
- Handle **distributed environments** — rate limits must be consistent across multiple servers
- **High fault tolerance** — if the rate limiter goes down, API traffic should still flow (fail open)

## Non-Functional Requirements
- **Minimal latency overhead** — the rate limiter sits on the hot path for every single request; it must add < 1ms
- **Memory efficient** — storing counters for millions of users must not blow up memory
- **Accurate counting** even at massive concurrency (no over-counting or under-counting)
- **Scalable** to millions of users and tens of thousands of API servers

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Active users | 100M |
| Peak QPS (total) | 1M requests/sec |
| Rate limit rules | ~5 rules per API endpoint, ~200 endpoints = **1,000 rules** |
| Counter storage per user-rule | ~20 bytes (user hash + counter + timestamp) |
| Total counter memory | 100M users × 5 active rules × 20B ≈ **10 GB** (fits in Redis cluster) |
| Rate limiter latency budget | < **1 ms** per check |
| Redis INCR throughput | ~100K ops/sec per shard → need **10+ shards** for 1M QPS |
`,
    examples: `## Follow-Up Discussion Points
- **Hard vs. soft rate limiting**: Hard limiting strictly refuses requests above the threshold. Soft limiting allows a small percentage of burst over the limit (e.g., allow up to 110% of limit). Soft limiting is friendlier to users experiencing temporary spikes.
- **Rate limiting at different OSI layers**: Layer 3 (IP-based using iptables), Layer 4 (connection-level limiting), Layer 7 (application-level with user context). Layer 7 is the most flexible because you can apply different rules per user tier, per endpoint, or per resource.
- **Client-side vs. server-side**: Client-side rate limiting is unreliable since malicious clients can bypass it. It should be used as a best-effort optimization to reduce unnecessary requests, never as a security mechanism.
- **How to avoid rate limiting your own internal services?** → Use separate rate limit pools for internal vs. external traffic. Whitelist internal service accounts or use different authentication tokens that map to higher limits.
- **What happens during Redis failover?** → Implement a local in-memory fallback with a shorter time window. Accept slight inaccuracy during the failover period (a few seconds). Once Redis recovers, the system self-corrects.
- **How would you A/B test different rate limits?** → Use feature flags to assign users to different limit tiers. Monitor 429 rates, latency percentiles, and user complaint rates per cohort.`,
    intuition: `A rate limiter controls the rate of traffic sent by clients to protect backend services from being overwhelmed. It is essential for **preventing abuse** (brute-force attacks, scraping), **controlling operational costs** (each request costs CPU, memory, and bandwidth), and ensuring **fair resource allocation** among users. The core design challenge is twofold: (1) choosing the right **counting algorithm** that balances accuracy, memory, and burst handling, and (2) making it work correctly in a **distributed environment** where multiple API servers must share consistent counters without introducing a latency bottleneck.`,
    approach: `## Component Overview

A **rate limiter middleware** intercepts every incoming request before it reaches the API servers. It checks counters stored in a **centralized Redis cluster** to decide whether to allow or reject the request. A **rules engine** loads rate limiting configurations from disk or a config service. Rejected requests receive an **HTTP 429** response with informative headers.

## API Design

| Header | Description |
|--------|-------------|
| \`X-Ratelimit-Limit\` | The maximum number of allowed requests in the current window |
| \`X-Ratelimit-Remaining\` | How many requests the client has left in the current window |
| \`X-Ratelimit-Retry-After\` | Number of seconds until the client can retry (only sent with 429 responses) |

| Response | Status Code | When |
|----------|-------------|------|
| Normal response | 200/2xx | Request is within rate limit |
| Rate limited | **429 Too Many Requests** | Request exceeds the configured threshold |

## Rate Limiting Algorithms

### 1. Token Bucket
A bucket holds up to **B tokens**. Tokens are added at a fixed rate of **R tokens/sec**. Each request consumes one token. If the bucket is empty, the request is rejected.
- **Pros**: Allows controlled bursts (up to B requests), simple to implement, memory efficient (2 values per bucket: token count + last refill timestamp)
- **Cons**: Two parameters (bucket size and refill rate) to tune per rule — getting them right requires experimentation

### 2. Leaking Bucket
Requests enter a **FIFO queue** of fixed size. The queue is processed at a constant outflow rate. If the queue is full, new requests are dropped.
- **Pros**: Produces a perfectly smooth outflow rate, predictable for downstream services
- **Cons**: Bursts of traffic fill the queue and cause newer requests to be dropped even if the system could handle them; a burst of old requests may starve newer ones

### 3. Fixed Window Counter
Time is divided into **fixed windows** (e.g., every 60 seconds). A counter increments for each request in the current window. If the counter exceeds the limit, requests are rejected until the next window starts.
- **Pros**: Extremely simple, memory efficient (one counter + window timestamp per key)
- **Cons**: **Boundary burst problem** — a user can send the maximum number of requests at the end of one window AND the beginning of the next, effectively doubling the allowed rate for a short period

### 4. Sliding Window Log
Store the **timestamp of every request** in a sorted set. When a new request comes in, remove all entries older than the window, count the remaining entries, and compare to the limit.
- **Pros**: Perfectly accurate — no boundary burst issue
- **Cons**: **Memory intensive** — storing every timestamp can be prohibitive for high-volume APIs. For 1M users with 100 req/min each, that is 100M timestamps in memory.

### 5. Sliding Window Counter (Hybrid)
Combines fixed window counter with the previous window's count, weighted by the overlap. Formula: \`count = current_window_count + previous_window_count × overlap_percentage\`.
- **Pros**: Smooths out the boundary burst problem, very memory efficient (only two counters)
- **Cons**: Approximate — assumes requests were evenly distributed in the previous window, which may not hold. In practice, the approximation is very close (within 0.003% of actual according to Cloudflare experiments).

## Where to Put the Rate Limiter

| Location | Pros | Cons |
|----------|------|------|
| **Client-side** | Reduces unnecessary network calls | Easily bypassed; unreliable |
| **Server-side** | Full control and context | Tightly coupled to application code |
| **Middleware / API Gateway** | Decoupled from app logic; centralized config; works across all services | Additional network hop; single point of failure if not replicated |

**Recommendation**: Use middleware or API gateway (e.g., Kong, Envoy, AWS API Gateway) for most use cases. It keeps rate limiting logic separate from business logic and is easier to update rules without redeploying services.
`,
    code: `## Architecture Diagram

\`\`\`
┌──────────┐       ┌─────────────────────────────┐       ┌──────────────┐
│  Client   │──────▶│    Load Balancer / CDN       │──────▶│  API Gateway │
│ (Browser/ │       │                               │       │  + Rate      │
│  Mobile)  │       └─────────────────────────────┘       │  Limiter     │
└──────────┘                                              │  Middleware  │
                                                           └──────┬───────┘
                                                                  │
                                         ┌────────────────────────┼────────────────────┐
                                         │                        │                    │
                                    ┌────▼─────┐           ┌─────▼────┐         ┌─────▼────┐
                                    │ API Srv 1│           │ API Srv 2│         │ API Srv N│
                                    └──────────┘           └──────────┘         └──────────┘
                                         ▲                        ▲                    ▲
                                         │                        │                    │
                                    ┌────┴────────────────────────┴────────────────────┘
                                    │
                              ┌─────▼──────┐          ┌──────────────────┐
                              │   Redis     │◀────────│  Rules Config    │
                              │   Cluster   │          │  (YAML / DB)    │
                              │  (Counters) │          └──────────────────┘
                              └─────┬──────┘
                                    │
                         ┌──────────┼──────────┐
                         │          │          │
                    ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐
                    │ Shard 1│ │ Shard 2│ │ Shard N│
                    └────────┘ └────────┘ └────────┘
\`\`\`

## Rate Limiter Request Flow

\`\`\`
Client Request
      │
      ▼
┌──────────────────┐
│  Rate Limiter    │
│  Middleware      │
│                  │
│  1. Extract key  │──── key = "user:1234:POST:/api/order"
│     (user+API)   │
│                  │
│  2. Fetch rules  │──── rules: { limit: 10, window: 60s }
│     from config  │
│                  │
│  3. Check Redis  │──── INCR key → current_count
│     counter      │     EXPIRE key 60  (set TTL if new)
│                  │
│  4. Compare      │
│     count vs     │
│     limit        │
└────────┬─────────┘
         │
    ┌────┴─────┐
    │          │
 count ≤ 10  count > 10
    │          │
    ▼          ▼
 Forward    Return HTTP 429
 to API     {
 Server       "error": "Rate limit exceeded",
              "retry_after": 42
            }
            Headers:
              X-Ratelimit-Limit: 10
              X-Ratelimit-Remaining: 0
              X-Ratelimit-Retry-After: 42
\`\`\`

## Token Bucket Algorithm Visualization

\`\`\`
Bucket capacity: 4 tokens
Refill rate: 1 token/sec

Time 0s:  [●][●][●][●]  4 tokens — full
           Request → consume 1 → [●][●][●][ ]  3 tokens

Time 0.5s: [●][●][●][ ]  3 tokens (no refill yet)
           Request → consume 1 → [●][●][ ][ ]  2 tokens
           Request → consume 1 → [●][ ][ ][ ]  1 token
           Request → consume 1 → [ ][ ][ ][ ]  0 tokens

Time 0.8s: [ ][ ][ ][ ]  0 tokens
           Request → REJECTED (429) ✗

Time 1.0s: [●][ ][ ][ ]  1 token refilled
           Request → consume 1 → [ ][ ][ ][ ]  0 tokens ✓
\`\`\`
`,
    jsCode: `## Deep Dive: Distributed Rate Limiting

### Race Condition Problem

When multiple API servers concurrently read and update the same counter in Redis, a classic **read-modify-write race condition** occurs:

1. Server A reads counter = 9 (limit is 10)
2. Server B reads counter = 9
3. Server A increments → writes 10 → allows request
4. Server B increments → writes 10 → allows request
5. **Result**: 11 requests allowed when limit was 10

### Solution 1: Lua Script in Redis (Recommended)

Redis executes Lua scripts **atomically** — no other command runs between read and write:

\`\`\`
-- rate_limit.lua (runs atomically in Redis)
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = tonumber(redis.call("GET", key) or "0")
if current >= limit then
    return 0  -- rejected
end

if current == 0 then
    redis.call("SET", key, 1, "EX", window)
else
    redis.call("INCR", key)
end
return 1  -- allowed
\`\`\`

This eliminates the race because the entire check-and-increment happens in a single atomic operation inside Redis.

### Solution 2: Redis Sorted Sets for Sliding Window Log

\`\`\`
-- Use a sorted set where score = timestamp
ZADD  user:1234:rate  <current_timestamp>  <unique_request_id>
ZREMRANGEBYSCORE user:1234:rate  0  <current_timestamp - window>
ZCARD user:1234:rate  → current count
\`\`\`

This naturally implements the sliding window log algorithm and is also atomic when wrapped in a MULTI/EXEC transaction.

### Distributed Synchronization Across Data Centers

When rate limiting spans multiple data centers, two strategies are common:

**Strategy 1: Centralized Redis**
- All data centers talk to a single Redis cluster
- **Pro**: Perfect accuracy
- **Con**: Cross-region latency (50–200ms) on every request — often unacceptable

**Strategy 2: Local Counters with Eventual Consistency**
- Each data center maintains its own Redis cluster
- A background synchronization process merges counts periodically (e.g., every 1–5 seconds)
- **Pro**: Local reads are fast (< 1ms)
- **Con**: The rate limit is approximate during the sync window — a user could slightly exceed the limit

**Strategy 3: Split the Quota**
- Divide the total rate limit among data centers (e.g., 100 req/min total → 50 per DC if 2 DCs)
- **Pro**: No cross-DC communication needed
- **Con**: Uneven traffic distribution wastes quota; a user hitting only one DC has a lower effective limit

### Rate Limiting Rules Configuration

Rules are typically stored in YAML or a configuration database and hot-reloaded:

\`\`\`
domain: messaging
descriptors:
  - key: message_type
    value: marketing
    rate_limit:
      requests_per_unit: 5
      unit: day

  - key: auth
    value: login
    rate_limit:
      requests_per_unit: 5
      unit: minute
\`\`\`

Multiple rules can apply to a single request (e.g., per-user AND per-IP AND per-endpoint). The request is rejected if **any** rule is exceeded.

### Performance Optimization

1. **Pipelining**: Batch multiple Redis commands (rule checks) into a single round trip using Redis pipelines
2. **Local cache**: Cache the rules config locally; only fetch from the config service every 30 seconds
3. **Approximate counting**: Use the sliding window counter (hybrid) algorithm to reduce Redis operations to a single INCR per request instead of sorted set operations
4. **Connection pooling**: Maintain persistent connections to Redis to avoid TCP handshake overhead on every request

### Monitoring and Alerting

- Track the **429 rate** (percentage of rejected requests) per endpoint and per user tier
- Alert if the 429 rate spikes unexpectedly — this could indicate a DDoS attack or a misconfigured rule
- Monitor **Redis latency percentiles** (p50, p99) — if Redis slows down, the rate limiter becomes the bottleneck for all API traffic
- Log rate-limited requests with enough context (user ID, IP, endpoint, rule matched) for debugging
- Dashboard showing top rate-limited users/IPs helps identify abuse patterns
`,
    explanation: `## Wrap Up

### Key Design Decisions

1. **Algorithm choice**: The **token bucket** is the most commonly used algorithm in production (used by Amazon and Stripe). It balances simplicity, memory efficiency, and burst tolerance. The **sliding window counter** is the best alternative when you need smoother rate enforcement without the memory cost of the sliding window log.

2. **Redis as the counter store**: Redis is the industry standard for rate limiting counters because it provides sub-millisecond latency, atomic operations via Lua scripts, built-in key expiration (TTL), and easy horizontal scaling through sharding.

3. **Middleware placement**: Placing the rate limiter as middleware (or in an API gateway) decouples it from business logic. This makes it possible to update rules, change algorithms, or bypass rate limiting for internal services without touching application code.

4. **Fail-open policy**: If Redis is temporarily unreachable, the rate limiter should **allow requests through** rather than blocking all traffic. A brief period of unthrottled traffic is far less damaging than a complete service outage.

### Trade-Offs Summary

| Dimension | Decision | Trade-off |
|-----------|----------|-----------|
| Accuracy vs. latency | Eventual consistency across DCs | Slight over-admission during sync gaps |
| Memory vs. precision | Sliding window counter vs. log | ~0.003% inaccuracy but 100x less memory |
| Complexity vs. features | Simple INCR vs. Lua scripts | Lua adds complexity but eliminates race conditions |
| Availability vs. correctness | Fail-open on Redis failure | May allow burst of unthrottled traffic |
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Don\'t forget the race condition — naive GET-then-SET in Redis allows double-counting under concurrency. Use atomic Lua scripts or INCR with EXPIRE.',
      'The fixed window counter boundary burst problem is a classic interview trap. Always mention it and explain why sliding window counter fixes it.',
      'Rate limiting must fail open — if the limiter crashes or Redis is down, you should let traffic through. A short burst of unthrottled traffic is better than a full outage.',
      'Remember to discuss HTTP response headers (429, X-Ratelimit-*). Interviewers expect you to show awareness of client-facing API design, not just backend architecture.',
    ],
  },
  {
    id: 9105,
    description: `## The Rehashing Problem

In a typical distributed system, you distribute data across **N servers** using:

\`\`\`
server_index = hash(key) % N
\`\`\`

This works perfectly until **N changes**. If you add or remove a server, the modulus changes and **almost every key maps to a different server**. For a cache cluster, this means nearly all cached data becomes invalid simultaneously — a **cache avalanche** that can bring down the entire system.

### Example: Why Modular Hashing Fails

| Key | hash(key) | N=4: hash%4 | N=5: hash%5 |
|-----|-----------|-------------|-------------|
| "user:1001" | 78234 | 2 | 4 |
| "user:1002" | 11987 | 3 | 2 |
| "user:1003" | 45621 | 1 | 1 |
| "user:1004" | 99100 | 0 | 0 |
| "user:1005" | 33456 | 0 | 1 |
| "user:1006" | 67899 | 3 | 4 |
| "user:1007" | 22345 | 1 | 0 |
| "user:1008" | 55678 | 2 | 3 |

When N goes from 4 to 5, **6 out of 8 keys** (75%) move to a different server. At scale with billions of keys, this causes a massive thundering herd to the database.

## Requirements
- **Minimal redistribution**: When a server is added or removed, only **K/N keys** should move on average (K = total keys, N = total servers)
- **Balanced load**: Keys should be distributed roughly evenly across all servers
- **Scalable**: Support adding/removing servers without downtime
- **Fast lookups**: Determining which server owns a key should be O(log N) or better
`,
    examples: `## Follow-Up Discussion Points
- **Alternatives to consistent hashing**: **Rendezvous hashing** (highest random weight) — hash each key with every server, pick the server with the highest hash. Simple but O(N) per lookup. **Jump consistent hash** — Google's algorithm that is O(1) memory and perfectly balanced, but only supports sequential server numbering (no arbitrary addition/removal).
- **When NOT to use consistent hashing**: If your server fleet is very stable (rarely changes), simple modular hashing with a planned migration is simpler. Consistent hashing adds complexity that isn't justified if you only scale once a year.
- **How many virtual nodes in practice?** Systems like Cassandra use 256 virtual nodes per physical server by default. This gives a very even distribution while keeping the ring metadata under a few MB. More virtual nodes = better balance but more memory and slower ring operations.
- **What about heterogeneous servers?** Assign more virtual nodes to more powerful servers. A machine with 2x the memory gets 2x the virtual nodes, naturally receiving ~2x the keys.
- **Rebalancing during server addition**: Only keys in the affected range need to move. The system can do this gradually (background transfer) to avoid load spikes. During transfer, the old server can still serve reads while writes go to the new server.`,
    intuition: `Consistent hashing solves the **rehashing catastrophe** that occurs with modular hashing. Instead of using \`hash(key) % N\`, both servers and keys are mapped to positions on a **circular hash ring**. Each key is assigned to the nearest server in the clockwise direction. When a server is added or removed, only the keys in the affected arc of the ring need to move — on average just **K/N keys** instead of almost all of them. **Virtual nodes** further improve this by giving each physical server multiple positions on the ring, ensuring an even distribution of keys even with a small number of servers.`,
    approach: `## How Consistent Hashing Works

### Step 1: The Hash Ring

Imagine the output space of a hash function (e.g., 0 to 2^32 - 1) bent into a **circle** (ring). Both **server identifiers** and **data keys** are hashed onto positions on this ring using the same hash function.

### Step 2: Key Assignment

To determine which server owns a key:
1. Hash the key to get its position on the ring
2. Walk **clockwise** from that position
3. The **first server** you encounter owns that key

### Step 3: Server Addition

When a new server is added at some position on the ring:
- Only the keys between the **new server** and the **previous server** (counter-clockwise) need to be reassigned
- All other keys stay where they are
- On average, only **K/N keys** are redistributed

### Step 4: Server Removal

When a server is removed:
- Its keys are redistributed to the **next server clockwise**
- All other key assignments remain unchanged

## Virtual Nodes

With only a few physical servers, the ring distribution can be highly uneven. Virtual nodes solve this by assigning **multiple positions** on the ring to each physical server.

| Configuration | Servers | Ring Positions | Key Distribution Std Dev |
|--------------|---------|----------------|-------------------------|
| No virtual nodes | 4 | 4 | ~40% of mean |
| 100 virtual nodes each | 4 | 400 | ~10% of mean |
| 200 virtual nodes each | 4 | 800 | ~5% of mean |

### Hash Function Considerations

| Hash Function | Speed | Distribution | Use Case |
|--------------|-------|-------------|----------|
| MD5 | Moderate | Excellent | General purpose |
| SHA-1 | Moderate | Excellent | When cryptographic quality needed |
| MurmurHash3 | Fast | Very Good | High performance non-crypto use |
| xxHash | Very Fast | Very Good | Extreme throughput needs |

**Recommendation**: Use MurmurHash3 or xxHash for consistent hashing. Cryptographic hash functions (MD5, SHA-1) are unnecessarily slow since we don't need collision resistance — we just need uniform distribution.
`,
    code: `## Hash Ring Diagram

\`\`\`
                        0 / 2^32
                          │
                    ┌─────┴─────┐
               S4 ●─┘           └─● S1
              /                       \\
             /     Hash Ring            \\
            │                            │
            │       k1 ○──────▶ S1       │
     2^32 ──┤                            ├── 2^32
     × 0.75 │       k2 ○──┐             │   × 0.25
            │             │             │
             \\            ▼            /
              \\        S2 ●          /
               S3 ●──┘           └──┘
                    └─────┬─────┘
                          │
                      2^32 × 0.5

    Key Assignment (clockwise):
    k1 → walks clockwise → first server is S1
    k2 → walks clockwise → first server is S2
\`\`\`

## Adding a New Server

\`\`\`
    Before (3 servers):              After adding S_new:

         S1                               S1
        / \\                              / \\
       /   \\                            /   \\
      /     \\                          /     \\
    S3──────S2                  S3────S_new───S2

    Keys in this arc ─────▶    Only THESE keys move
    all belonged to S2         from S2 to S_new

    ┌──────────────────────────────────────────────┐
    │  Before: k5, k8, k12, k3 → all on S2        │
    │  After:  k5, k8 → S_new    k12, k3 → S2     │
    │                                              │
    │  k1, k7, k9 on S1 → UNCHANGED               │
    │  k2, k4, k6 on S3 → UNCHANGED               │
    └──────────────────────────────────────────────┘
\`\`\`

## Virtual Nodes Diagram

\`\`\`
    Physical servers: A, B, C

    Without virtual nodes:        With virtual nodes (3 each):

         A                           A2      B1
        / \\                         / \\    / \\
       /   \\                       /   \\  /   \\
      /     \\                    C1     A1     C3
    C───────B                    / \\          / \\
                                /   \\        /   \\
    Uneven distribution!      B3     C2────B2

                              Much more even distribution!

    Ring positions:
    ┌────────────────────────────────────────────┐
    │ Position:  A2  B1  C1  A1  C3  B3  C2  B2 │
    │ Maps to:   A   B   C   A   C   B   C   B  │
    │                                            │
    │ Server A owns: 2/8 of ring = 25%           │
    │ Server B owns: 3/8 of ring = 37.5%         │
    │ Server C owns: 3/8 of ring = 37.5%         │
    │                                            │
    │ With more virtual nodes (100+), each       │
    │ server converges to exactly 33.3%          │
    └────────────────────────────────────────────┘
\`\`\`

## Lookup Algorithm

\`\`\`
    find_server(key):
    ┌─────────────────────────────┐
    │ 1. hash = hash_func(key)    │
    │                             │
    │ 2. Binary search the sorted │
    │    ring for the first node  │
    │    with position ≥ hash     │
    │                             │
    │ 3. If no node found (hash   │
    │    is past the last node),  │
    │    wrap around to the first │
    │    node in the ring         │
    │                             │
    │ 4. Map virtual node back    │
    │    to physical server       │
    └─────────────────────────────┘

    Ring (sorted array): [1200, 3500, 5800, 7100, 8900, 9600]
    Virtual→Physical:     A1     B1     C1     A2     B2     C2

    hash("user:42") = 6000
    Binary search → first position ≥ 6000 → 7100 → A2 → Server A

    Time complexity: O(log V) where V = total virtual nodes
\`\`\`
`,
    jsCode: `## Deep Dive: Implementation Details

### Data Structure for the Ring

The ring is implemented as a **sorted array** (or balanced BST / skip list) of virtual node positions. Each position maps back to a physical server.

\`\`\`
class ConsistentHashRing {
    sorted_positions: number[]          // sorted ring positions
    position_to_server: Map<number, string>  // virtual node → physical server
    server_to_positions: Map<string, number[]> // physical server → its virtual nodes
    num_virtual_nodes: number           // virtual nodes per server
}

add_server(server_id):
    for i in 0..num_virtual_nodes:
        position = hash(server_id + "#" + i)
        sorted_positions.insert_sorted(position)
        position_to_server[position] = server_id
        server_to_positions[server_id].append(position)

remove_server(server_id):
    for position in server_to_positions[server_id]:
        sorted_positions.remove(position)
        position_to_server.delete(position)
    server_to_positions.delete(server_id)

get_server(key):
    position = hash(key)
    index = binary_search_ceiling(sorted_positions, position)
    if index >= sorted_positions.length:
        index = 0  // wrap around
    return position_to_server[sorted_positions[index]]
\`\`\`

### Virtual Node Count Trade-offs

| Virtual Nodes per Server | Memory per Server | Lookup Time | Load Std Dev |
|--------------------------|-------------------|-------------|-------------|
| 1 (no virtual nodes) | ~40 bytes | O(log N) | ~50-80% |
| 100 | ~4 KB | O(log 100N) | ~10% |
| 200 | ~8 KB | O(log 200N) | ~5-7% |
| 500 | ~20 KB | O(log 500N) | ~3-4% |
| 1000 | ~40 KB | O(log 1000N) | ~2% |

For a 100-server cluster with 200 virtual nodes each, the ring has 20,000 entries — about 800 KB of memory. The binary search takes at most 15 comparisons. Both are negligible.

### Real-World Usage

**Amazon DynamoDB**: Uses consistent hashing to partition data across storage nodes. Each node is responsible for a range on the ring. When nodes join or leave, only neighboring ranges are affected.

**Apache Cassandra**: Uses a variant called **virtual node (vnode) partitioning**. Each node owns many small token ranges instead of one large range. Default is 256 vnodes per physical node. This makes rebalancing faster and more even when nodes join.

**Discord**: Uses consistent hashing to route messages to the correct guild (server) process. When they scale up, only a fraction of guilds need to be rebalanced to new processes.

**Akamai CDN**: One of the earliest large-scale users of consistent hashing. Used to determine which edge server should cache a particular piece of content. When edge servers fail, their content is redistributed to neighboring servers on the ring.

### Handling Server Failures

When consistent hashing is used for **replicated data** (not just caching), each key is stored on N consecutive servers clockwise on the ring. If the primary server fails:

1. The next server clockwise already has a replica
2. Reads can immediately be served from the replica
3. A new replica is created on the N+1th server to maintain the replication factor

This is how Cassandra and DynamoDB achieve high availability with consistent hashing.

### Comparison with Alternatives

| Approach | Lookup | Add/Remove Server | Memory | Uniformity |
|----------|--------|-------------------|--------|------------|
| Modular hash (key%N) | O(1) | O(K) — all keys move | O(1) | Perfect |
| Consistent hashing | O(log V) | O(K/N) keys move | O(V) | Good with vnodes |
| Rendezvous hashing | O(N) | O(K/N) keys move | O(N) | Perfect |
| Jump consistent hash | O(1) | O(K/N) keys move | O(1) | Perfect |

Jump consistent hash is theoretically superior but requires servers to be numbered 0..N-1 sequentially, making it impractical for heterogeneous or dynamically named servers.
`,
    explanation: `## Wrap Up

### Why Consistent Hashing Matters

Consistent hashing is a **foundational building block** in distributed systems. It appears in virtually every system that needs to partition data or route requests across a dynamic set of servers. The key insight is moving from a scheme where changing the server count invalidates nearly everything to one where only a small fraction of keys need to move.

### Summary of Properties

| Property | Modular Hashing | Consistent Hashing |
|----------|-----------------|-------------------|
| Keys redistributed on server change | ~100% of keys | ~K/N keys (only affected range) |
| Load balance | Perfect | Good with virtual nodes |
| Server addition cost | Full rehash | Move keys from one neighbor |
| Server removal cost | Full rehash | Move keys to next neighbor |
| Lookup complexity | O(1) | O(log V) where V = virtual nodes |
| Implementation complexity | Trivial | Moderate |

### When to Use Consistent Hashing

- **Distributed caches** (Memcached, Redis cluster) — avoid cache avalanche when scaling
- **Database sharding** — route queries to the correct shard without a central lookup table
- **CDN routing** — map content to edge servers
- **Load balancing** — sticky sessions without a centralized session store
- **Distributed storage** — DynamoDB, Cassandra, and similar systems use it as a core primitive

### Key Takeaway

The algorithm elegantly trades a small amount of lookup overhead (binary search on the ring) for a massive reduction in data movement during scaling events. Combined with virtual nodes for even distribution, it is the de facto standard for data partitioning in distributed systems.
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Always discuss the rehashing problem first — it motivates WHY consistent hashing exists. Show the concrete example of keys moving when N changes.',
      'Virtual nodes are not optional — without them, a small number of servers leads to highly uneven key distribution. Always mention them.',
      'Know the trade-off: more virtual nodes = better balance but more memory and slightly slower lookups. In practice, 100-200 virtual nodes per server is a good starting point.',
      'Be prepared to discuss alternatives like rendezvous hashing and jump consistent hashing, and explain when consistent hashing is preferable (dynamic, heterogeneous server sets).',
    ],
  },
  {
    id: 9106,
    description: `## Clarifying Questions to Ask
- What is the **size of key-value pairs**? (Assume < 10 KB)
- Do we need to support **range queries** or only point lookups (get/put)?
- What **consistency model** does the application need — strong consistency or eventual consistency?
- What is the expected **read/write ratio**?
- Should the system support **automatic scaling** when traffic increases?
- What is the **latency requirement** for reads and writes?

## Functional Requirements
- \`put(key, value)\` — insert or update a key-value pair
- \`get(key)\` → return the value associated with the key, or null
- Support storing **large datasets** that do not fit on a single machine
- **Automatic scaling** — add/remove nodes based on load
- **Tunable consistency** — let the application choose the consistency level per operation

## Non-Functional Requirements
- **High availability** — the system should always be writable and readable (favor AP in most configurations)
- **High scalability** — handle petabytes of data across thousands of nodes
- **Low latency** — single-digit millisecond reads and writes
- **Fault tolerant** — handle server, rack, and data center failures gracefully

## CAP Theorem

You **cannot** simultaneously guarantee all three:
- **Consistency (C)**: Every read receives the most recent write or an error
- **Availability (A)**: Every request receives a response (no errors, no timeouts)
- **Partition Tolerance (P)**: The system continues to operate despite network partitions between nodes

Since **network partitions are unavoidable** in distributed systems, the real choice is between **CP** and **AP**:

| Choice | Behavior During Partition | Example Systems |
|--------|--------------------------|-----------------|
| **CP** | Reject writes (or reads) to guarantee consistency | HBase, MongoDB (default), Zookeeper |
| **AP** | Accept writes on both sides; reconcile later | Cassandra, DynamoDB, CouchDB |

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total data | 10 TB initially, growing to 100+ TB |
| Average KV pair size | 1 KB |
| Write QPS | 50,000 |
| Read QPS | 200,000 |
| Replication factor | 3 |
| Total storage with replication | 10 TB × 3 = **30 TB** |
| Nodes (4 TB usable each) | 30 TB / 4 TB ≈ **8 nodes** minimum |
| Memory for bloom filters | ~10 bits per key × 10B keys ≈ **12 GB** cluster-wide |
`,
    examples: `## Follow-Up Discussion Points
- **Tunable consistency in practice**: Cassandra lets you set W and R per query. For a user-facing profile read: R=1, W=2 (fast reads, durable writes). For a financial transaction: R=2, W=2 (strong consistency). This flexibility is extremely powerful.
- **Vector clocks vs. last-write-wins (LWW)**: Vector clocks preserve all conflicting versions and let the application resolve them (Amazon's shopping cart famously does this). LWW is simpler — the latest timestamp wins — but can silently drop writes. Most systems default to LWW for simplicity.
- **How does this compare to real systems?**
  - **DynamoDB**: AP system, uses consistent hashing, vector clocks (originally, now LWW), sloppy quorum, hinted handoff, Merkle trees
  - **Cassandra**: AP by default, tunable consistency via quorum, uses gossip protocol, consistent hashing with vnodes, LSM-tree storage
  - **BigTable/HBase**: CP system, uses a master for coordination, stores data in SSTables, strong consistency via single-master-per-region
- **Write amplification**: LSM-trees trade write amplification (due to compaction) for excellent write throughput. In write-heavy workloads this is acceptable. For read-heavy workloads, consider B-tree based storage (like InnoDB) which has better read performance at the cost of slower writes.`,
    intuition: `A distributed key-value store is built on a handful of fundamental distributed systems concepts working together: **consistent hashing** for partitioning data across nodes, **replication** for fault tolerance, **quorum consensus** for tunable consistency, **vector clocks** for conflict resolution, **gossip protocol** for failure detection, and **LSM-trees** for efficient storage. The central design tension is the **CAP theorem** — since network partitions are inevitable, you must choose between consistency and availability, and this choice ripples through every design decision.`,
    approach: `## Component Overview

A **coordinator node** receives client requests and routes them to the correct replica nodes using consistent hashing. Data is **replicated** across N nodes for fault tolerance. Reads and writes use **quorum consensus** (configurable W and R values) to balance consistency and availability. A **gossip protocol** detects node failures. The storage engine uses an **LSM-tree** (Log-Structured Merge Tree) for high write throughput.

## API Design

| Operation | Description | Consistency Parameter |
|-----------|-------------|----------------------|
| \`put(key, value, context)\` | Store or update a KV pair. Context contains vector clock metadata. | W = number of write acknowledgments required |
| \`get(key)\` | Retrieve value(s) for a key. May return multiple conflicting versions. | R = number of read responses required |

## Data Partitioning

Uses **consistent hashing** with virtual nodes (see Chapter 5). Each key is assigned to a position on the hash ring and stored on the first N nodes clockwise from that position (where N is the replication factor).

## Replication

For a replication factor of N=3, after finding the first node on the ring:
- Walk clockwise and select the next N-1 **unique physical nodes** (skip virtual nodes belonging to the same physical server)
- The first node in the list is the **coordinator** for that key
- All N nodes store a full replica of the data

## Quorum Consensus

Configure three values: **N** (replicas), **W** (write quorum), **R** (read quorum).

| Configuration | W | R | Guarantee | Use Case |
|--------------|---|---|-----------|----------|
| Strong consistency | N/2+1 | N/2+1 | W + R > N → guaranteed overlap | Financial data |
| Fast reads | 1 | N | All replicas respond to reads | Read-heavy analytics |
| Fast writes | N | 1 | All replicas written synchronously | Write-heavy logging |
| Eventual consistency | 1 | 1 | W + R ≤ N → may read stale data | Social media feeds |

**Typical default**: N=3, W=2, R=2 → strong consistency since W+R=4 > 3=N.
`,
    code: `## Distributed KV Store Architecture

\`\`\`
┌──────────┐          ┌──────────────────────────────────────────┐
│  Client   │─────────▶│           Coordinator Node               │
│           │◀─────────│  (any node can be coordinator)           │
└──────────┘          │                                          │
                       │  1. Hash key → find ring position        │
                       │  2. Identify N replica nodes             │
                       │  3. Send read/write to replicas          │
                       │  4. Wait for W or R acknowledgments      │
                       └──────────────────┬───────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
              ┌─────▼──────┐       ┌─────▼──────┐       ┌─────▼──────┐
              │  Node A     │       │  Node B     │       │  Node C     │
              │  (Replica 1)│       │  (Replica 2)│       │  (Replica 3)│
              │             │       │             │       │             │
              │ ┌─────────┐ │       │ ┌─────────┐ │       │ ┌─────────┐ │
              │ │MemTable │ │       │ │MemTable │ │       │ │MemTable │ │
              │ └────┬────┘ │       │ └────┬────┘ │       │ └────┬────┘ │
              │      │      │       │      │      │       │      │      │
              │ ┌────▼────┐ │       │ ┌────▼────┐ │       │ ┌────▼────┐ │
              │ │SSTable  │ │       │ │SSTable  │ │       │ │SSTable  │ │
              │ │ Files   │ │       │ │ Files   │ │       │ │ Files   │ │
              │ └─────────┘ │       │ └─────────┘ │       │ └─────────┘ │
              └─────────────┘       └─────────────┘       └─────────────┘
                    ▲                     ▲                     ▲
                    │                     │                     │
                    └─────── Gossip Protocol (failure detection)─┘
\`\`\`

## Write Path (LSM-Tree)

\`\`\`
Client: put("user:42", "{name: Jay}")
              │
              ▼
┌─────────────────────────┐
│ 1. Write to COMMIT LOG  │ ◀── Append-only, sequential I/O (fast)
│    (Write-Ahead Log)    │     Survives crashes — replay on restart
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 2. Write to MEMTABLE    │ ◀── In-memory sorted tree (Red-Black or
│    (in-memory)          │     Skip List). Serves recent reads.
└────────────┬────────────┘
             │
             │  When MemTable reaches size threshold (e.g., 64 MB):
             ▼
┌─────────────────────────┐
│ 3. Flush to SSTABLE     │ ◀── Sorted String Table on disk
│    (immutable on disk)  │     Immutable once written.
└────────────┬────────────┘
             │
             │  Background process:
             ▼
┌─────────────────────────┐
│ 4. COMPACTION            │ ◀── Merge multiple SSTables:
│    (merge SSTables)      │     - Remove deleted keys (tombstones)
│                          │     - Merge duplicates (keep latest)
│                          │     - Reduce read amplification
└──────────────────────────┘
\`\`\`

## Read Path

\`\`\`
Client: get("user:42")
              │
              ▼
┌─────────────────────────┐
│ 1. Check MEMTABLE       │──── Found? → Return immediately
└────────────┬────────────┘
             │ Not found
             ▼
┌─────────────────────────┐
│ 2. Check BLOOM FILTER   │──── "Definitely not here" → skip SSTable
│    for each SSTable     │     "Possibly here" → check SSTable
└────────────┬────────────┘
             │ Bloom filter says "maybe"
             ▼
┌─────────────────────────┐
│ 3. Check SSTable        │──── Use sparse index to find block,
│    (newest first)       │     decompress block, binary search
└────────────┬────────────┘
             │
             ▼
         Return value (or null if not found in any SSTable)
\`\`\`

## Consistent Hashing Ring with Replication

\`\`\`
    Replication factor N = 3

              N1
             /│\\
            / │ \\
           /  │  \\
         N6   │   N2     Key K hashed to position X
          │   │   │      Walk clockwise: N2, N3, N4
          │   │   │      K is stored on: N2, N3, N4
          │   │   │
         N5   │   N3  ◀── K's primary replica
           \\  │  /
            \\ │ /
             \\│/
              N4

    If N3 goes down:
    - Reads: served by N2 or N4 (still 2 replicas available)
    - Writes: sloppy quorum → temporarily write to N5
              (hinted handoff: N5 stores it with a hint
               "this belongs to N3, send it when N3 recovers")
\`\`\`
`,
    jsCode: `## Deep Dive: Distributed Systems Techniques

### Vector Clocks for Conflict Resolution

A **vector clock** is a list of (node, counter) pairs that tracks the causal history of a value. Each node increments its own counter on every write.

\`\`\`
Initial: D1 = {} (empty)

1. Server Sx handles put(K, V1)
   D1([Sx, 1]) → value = V1

2. Server Sx handles put(K, V2)  (update by same server)
   D2([Sx, 2]) → value = V2

3. Servers Sy and Sz both read D2 and update concurrently:
   Sy: D3([Sx, 2], [Sy, 1]) → value = V3
   Sz: D4([Sx, 2], [Sz, 1]) → value = V4

4. D3 and D4 are CONCURRENT (neither dominates the other)
   Neither [Sy,1] nor [Sz,1] supersedes the other
   → CONFLICT DETECTED → return both to client for resolution

5. Client resolves: picks V3 (or merges V3+V4)
   Writes back: D5([Sx, 2], [Sy, 1], [Sz, 1]) → value = resolved
\`\`\`

**Rule**: Version A supersedes Version B if every counter in A is ≥ the corresponding counter in B. If neither dominates, they are concurrent (conflict).

**Downside**: Vector clocks grow with the number of servers that touch a key. In practice, systems set a maximum length and prune the oldest entries (which can lose some causal information but prevents unbounded growth).

### Gossip Protocol for Failure Detection

Each node maintains a **membership list** with heartbeat counters for every other node:

\`\`\`
Node A's membership table:
┌────────┬───────────┬──────────────────┐
│ Node   │ Heartbeat │ Last Updated     │
├────────┼───────────┼──────────────────┤
│ A      │ 1042      │ current          │
│ B      │ 987       │ 2 seconds ago    │
│ C      │ 1155      │ 1 second ago     │
│ D      │ 876       │ 45 seconds ago   │ ◀── Possibly down!
│ E      │ 1201      │ 3 seconds ago    │
└────────┴───────────┴──────────────────┘
\`\`\`

**How it works:**
1. Each node periodically increments its own heartbeat counter
2. Each node randomly selects a few peers and sends its entire membership table
3. When a node receives a gossip message, it merges the table (keeping higher heartbeat values)
4. If a node's heartbeat hasn't increased for a configured timeout (e.g., 30 seconds), it is marked as **suspected down**
5. After further confirmation from other nodes, it is marked as **permanently down**

**Advantage**: No single point of failure (unlike a centralized health checker). Every node monitors every other node through the gossip dissemination.

### Sloppy Quorum and Hinted Handoff

Standard quorum requires W responses from the N designated replicas. But what if some of those N replicas are temporarily unreachable?

**Sloppy quorum**: Instead of requiring responses from the N "correct" replicas, accept responses from the first W **healthy** nodes encountered walking clockwise on the ring. Some of these may not be the designated replicas.

**Hinted handoff**: When a non-designated node temporarily stores data for a downed node:
1. It saves the data locally with a **hint** indicating the intended recipient
2. It periodically checks if the intended node has recovered
3. Once recovered, it forwards the data and deletes the local copy

This dramatically improves write availability during partial failures.

### Anti-Entropy with Merkle Trees

When a replica has been down for a while and comes back, how do you efficiently find which keys are out of sync?

**Naive approach**: Compare every key — O(K) comparisons over the network. Prohibitive for billions of keys.

**Merkle tree approach**:
1. Each replica builds a **hash tree** over its key range
2. Leaf nodes contain hashes of individual keys (or small ranges)
3. Parent nodes contain the hash of their children
4. Two replicas compare trees **top-down**: if the root hashes match, the entire dataset is in sync

\`\`\`
Comparing replicas A and B:

        Root                Root
       hash:X              hash:Y         ← Different! Go deeper
      /      \\            /      \\
   hash:M   hash:N     hash:M   hash:P   ← Right subtree differs
   /   \\    /   \\      /   \\    /   \\
  h1   h2  h3   h4    h1   h2  h3'  h4   ← h3 differs → sync that range

Only the keys in h3's range need to be synchronized!
\`\`\`

This reduces synchronization from O(K) to O(log K) comparisons in the typical case.

### Compaction Strategies

**Size-tiered compaction**: Merge SSTables of similar size. Good for write-heavy workloads. Can temporarily use up to 2x disk space during compaction.

**Leveled compaction**: SSTables are organized into levels with increasing size. Each level has non-overlapping key ranges. Better read performance (fewer SSTables to check) but higher write amplification.

| Strategy | Write Amp | Read Amp | Space Amp | Best For |
|----------|-----------|----------|-----------|----------|
| Size-tiered | Low | High | High (2x) | Write-heavy |
| Leveled | High | Low | Low (1.1x) | Read-heavy / balanced |
`,
    explanation: `## Wrap Up

### Summary of Distributed KV Store Techniques

| Problem | Technique | How It Works |
|---------|-----------|-------------|
| Data partitioning | Consistent hashing | Keys mapped to ring positions; each node owns a range |
| High availability (reads) | Replication | Each key stored on N nodes |
| High availability (writes) | Sloppy quorum + hinted handoff | Accept writes on healthy alternatives; forward later |
| Consistency | Quorum consensus (W + R > N) | Overlapping read/write sets guarantee freshness |
| Conflict resolution | Vector clocks | Detect concurrent writes; application or LWW resolves |
| Failure detection | Gossip protocol | Decentralized heartbeat propagation |
| Replica repair | Merkle trees | Efficient tree comparison to find diverged keys |
| Storage engine | LSM-tree (commit log → memtable → SSTable) | High write throughput via sequential I/O |
| Read optimization | Bloom filters | Probabilistically skip SSTables that don't contain the key |

### Key Design Decisions

1. **CAP choice**: This design favors **AP** (availability + partition tolerance) with tunable consistency. Applications that need strong consistency can set W+R > N per request.

2. **Conflict resolution strategy**: Vector clocks detect conflicts but push resolution to the application. This is the most flexible approach but adds complexity. Many systems (Cassandra) default to **last-write-wins** for simplicity, accepting the rare silent data loss.

3. **Storage engine**: LSM-tree is chosen for high write throughput. The trade-off is read amplification (potentially checking multiple SSTables), mitigated by bloom filters and caching.

4. **Decentralized architecture**: No master node. Every node can coordinate reads and writes. This eliminates single points of failure and simplifies scaling — just add nodes to the hash ring.
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Always start with the CAP theorem and ask the interviewer whether the system should favor CP or AP. This choice drives every subsequent design decision.',
      'Don\'t just say "we use quorum" — explain the math: W + R > N guarantees at least one overlapping node has the latest write. Show specific configurations (N=3, W=2, R=2).',
      'The write path (commit log → memtable → SSTable → compaction) is critical to explain clearly. Interviewers want to see that you understand WHY each step exists, not just what it is.',
      'Merkle trees and gossip protocol are what separate a good answer from a great one. These show you understand how to handle the messy realities of partial failures and replica divergence.',
    ],
  },
  {
    id: 9107,
    description: `## Clarifying Questions to Ask
- Must the IDs be **globally unique** across all servers with zero coordination?
- Must IDs be **numerical only** (no UUIDs with letters)?
- Must IDs be **64-bit** (fit in a long/bigint)?
- Must IDs be **sortable by time** (roughly ordered by creation time)?
- What is the required **throughput** — how many IDs per second?
- Do IDs need to be **contiguous** (no gaps), or just unique and roughly ordered?

## Functional Requirements
- Generate IDs that are **globally unique** (no duplicates ever)
- IDs must be **numerical values only** (64-bit integers)
- IDs must be **sortable by date** — IDs generated later should be larger
- Must support generating **10,000+ IDs per second** across the system

## Non-Functional Requirements
- **Low latency**: ID generation must be fast (< 1ms)
- **High availability**: The ID generator must not be a single point of failure
- **Scalable**: Support increasing throughput by adding machines

## High-Level Options

| Approach | Unique? | 64-bit? | Sortable? | Throughput | Coordination? |
|----------|---------|---------|-----------|------------|--------------|
| Multi-master auto-increment | Yes | Yes | Partial | Moderate | Per-DB |
| UUID | Yes | No (128-bit) | No | Very High | None |
| Ticket server (centralized) | Yes | Yes | Yes | High | Single point |
| **Snowflake (distributed)** | Yes | Yes | Yes | Very High | **None** |

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Required throughput | 10,000 IDs/sec (normal), 100,000 IDs/sec (peak) |
| Machines needed | At 4,096 IDs/ms/machine, a single machine handles 4M IDs/sec — **1 machine is sufficient for throughput** |
| ID space (41-bit timestamp) | 2^41 ms ≈ 69.7 years from epoch — sufficient |
| Datacenter capacity | 5 bits = 32 datacenters |
| Machine capacity | 5 bits = 32 machines per datacenter → **1,024 machines total** |
`,
    examples: `## Follow-Up Discussion Points
- **Clock synchronization issues**: If a machine's clock jumps backward (e.g., NTP correction), Snowflake could generate duplicate IDs (same timestamp + same sequence). Solutions: (1) refuse to generate IDs until the clock catches up, (2) use a monotonic clock source, (3) keep track of the last timestamp and wait if the clock goes backward.
- **What if you need more than 1,024 machines?** Reduce the timestamp bits and/or increase the machine ID bits. For example, 39-bit timestamp (17 years) + 12-bit machine ID (4,096 machines) + 12-bit sequence. The epoch can be reset by migrating to a new epoch when the timestamp runs out.
- **What if IDs must be truly sequential (no gaps)?** Snowflake can't guarantee this since different machines generate IDs independently. You'd need a centralized ticket server (Flickr's approach) or database sequences, accepting the single point of failure or reduced throughput.
- **Can this work across multiple data centers?** Yes — the datacenter ID bits ensure uniqueness across regions without any cross-region communication. Each datacenter independently generates IDs in its own partition of the ID space.
- **What about security?** Snowflake IDs leak information: you can infer the creation time, which datacenter generated it, and the approximate generation rate. If this is a concern, encrypt or obfuscate the ID before exposing it to users (but this breaks sortability externally).
- **Comparison of all approaches in depth**:
  - *Multi-master*: Easy to implement but hard to scale across data centers; auto_increment by K means adding a new DB server requires changing the step on all existing servers.
  - *UUID*: Zero coordination is great, but 128 bits waste index space, and V4 UUIDs are random (terrible for B-tree index locality). UUIDv7 (time-ordered) fixes sortability but is still 128 bits.
  - *Ticket server*: Flickr used a single MySQL with auto-increment as a ticket dispenser. Simple but is a single point of failure; mitigated with two servers (one for odd IDs, one for even).
  - *Snowflake*: Best balance of all requirements for most use cases.`,
    intuition: `Auto-incrementing a single database column doesn't work in distributed systems because it creates a **single point of failure** and a **coordination bottleneck**. We need IDs that are unique across thousands of machines without any server talking to another. The **Snowflake approach** (pioneered by Twitter) solves this by embedding the timestamp, machine identity, and a sequence counter into a single 64-bit integer. Each machine can independently generate unique, time-sorted IDs at up to 4,096 per millisecond with **zero coordination**.`,
    approach: `## Approach 1: Multi-Master Replication

Use database auto-increment but set each server's increment step to K (the number of servers).

- Server 1 generates: 1, 3, 5, 7, ...
- Server 2 generates: 2, 4, 6, 8, ...
- Server K generates: K, 2K, 3K, ...

| Pros | Cons |
|------|------|
| Simple to implement | Doesn't scale well across data centers |
| Uses existing DB infrastructure | Adding servers means changing K everywhere |
| IDs are roughly ordered | IDs from different servers aren't time-sortable relative to each other |

## Approach 2: UUID (Universally Unique Identifier)

Generate a 128-bit random identifier on each server independently. Collision probability is astronomically low (~1 in 2^61 after 1 billion UUIDs).

| Pros | Cons |
|------|------|
| Zero coordination between servers | 128 bits — doesn't fit in 64-bit integer |
| Simple and fast to generate | Not sortable by time (V4 UUIDs are random) |
| Scales infinitely | Poor database index performance (random = bad B-tree locality) |

## Approach 3: Ticket Server (Flickr)

A dedicated database server with a single auto-increment column serves as a centralized ID dispenser. Services request IDs in batches.

| Pros | Cons |
|------|------|
| Numeric, 64-bit, sortable | Single point of failure |
| Simple to understand | Network round trip for every batch |
| Easy to implement | Can become a throughput bottleneck |

Flickr ran two ticket servers (one for odd, one for even) for redundancy.

## Approach 4: Snowflake (Recommended)

Divide a 64-bit ID into sections, each encoding different information. No coordination needed — each machine generates IDs independently.

## Snowflake ID Bit Layout

| Section | Bits | Range | Purpose |
|---------|------|-------|---------|
| Sign bit | 1 | Always 0 | Ensures IDs are positive |
| Timestamp | 41 | 0 to 2^41-1 ms | Milliseconds since custom epoch (~69 years) |
| Datacenter ID | 5 | 0 to 31 | Identifies which datacenter |
| Machine ID | 5 | 0 to 31 | Identifies which machine within a datacenter |
| Sequence | 12 | 0 to 4095 | Counter for IDs generated in the same millisecond |

### Key Properties
- **Total capacity**: 32 datacenters × 32 machines × 4,096 IDs/ms = **4,194,304 IDs/ms** system-wide
- **Per-machine throughput**: 4,096 IDs/ms = **4,096,000 IDs/sec** per machine
- **Lifespan**: 2^41 ms = ~69.7 years from the custom epoch
- **Sortability**: Since timestamp occupies the most significant bits, IDs are naturally sorted by creation time

## API Design

| Operation | Description |
|-----------|-------------|
| \`generateId()\` | Returns a unique 64-bit ID. No parameters needed — the machine knows its own datacenter and machine ID. |
| \`extractTimestamp(id)\` | Right-shift by 22 bits, add epoch → original creation time |
| \`extractDatacenter(id)\` | Right-shift by 17 bits, mask lower 5 bits |
| \`extractMachineId(id)\` | Right-shift by 12 bits, mask lower 5 bits |
`,
    code: `## Snowflake ID Bit Layout

\`\`\`
64-bit ID Structure:

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─────────────────────────────────────────────────────────────────┤
│0│                    41-bit Timestamp (ms)                        │
├─┼───────────────────────────────────────┬─────┬─────┬─────────────┤
│ │               (continued)             │DC ID│MC ID│  Sequence   │
│ │                                       │5 bit│5 bit│   12 bit    │
└─┴───────────────────────────────────────┴─────┴─────┴─────────────┘

 ◀──── 1 ────▶◀────────── 41 ──────────▶◀─ 5 ─▶◀─ 5 ─▶◀── 12 ──▶

Example ID:  0 | 10110010101....(41 bits) | 00101 | 01100 | 000000000001
             ↓         ↓                     ↓       ↓          ↓
           sign    timestamp=1639852800000  DC=5   MC=12     seq=1
\`\`\`

## ID Generation Flow

\`\`\`
┌──────────────────────────────────────────────────┐
│                Snowflake ID Generator             │
│                                                  │
│  Config: datacenter_id = 5, machine_id = 12      │
│  State:  last_timestamp = 0, sequence = 0        │
│                                                  │
│  generate_id():                                  │
│  ┌────────────────────────────────────────┐      │
│  │ 1. current_ts = now() - CUSTOM_EPOCH   │      │
│  │                                        │      │
│  │ 2. if current_ts == last_timestamp:    │      │
│  │       sequence = (sequence + 1) & 4095 │      │
│  │       if sequence == 0:                │      │
│  │           wait until next millisecond  │      │
│  │    else:                               │      │
│  │       sequence = 0                     │      │
│  │                                        │      │
│  │ 3. last_timestamp = current_ts         │      │
│  │                                        │      │
│  │ 4. return:                             │      │
│  │    (current_ts << 22)                  │      │
│  │    | (datacenter_id << 17)             │      │
│  │    | (machine_id << 12)               │      │
│  │    | sequence                          │      │
│  └────────────────────────────────────────┘      │
└──────────────────────────────────────────────────┘
\`\`\`

## System Architecture

\`\`\`
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Service A   │   │  Service B   │   │  Service C   │
│  (Orders)    │   │  (Messages)  │   │  (Events)    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │  generateId()    │  generateId()    │  generateId()
       │                  │                  │
┌──────▼───────┐   ┌──────▼───────┐   ┌──────▼───────┐
│ ID Generator │   │ ID Generator │   │ ID Generator │
│ DC=1, MC=1   │   │ DC=1, MC=2   │   │ DC=2, MC=1   │
│              │   │              │   │              │
│ In-process   │   │ In-process   │   │ In-process   │
│ library      │   │ library      │   │ library      │
│ (no network  │   │ (no network  │   │ (no network  │
│  call!)      │   │  call!)      │   │  call!)      │
└──────────────┘   └──────────────┘   └──────────────┘

Each service has its own embedded ID generator.
No network calls. No coordination.
Uniqueness guaranteed by distinct (datacenter_id, machine_id) pairs.
\`\`\`

## Clock Skew Handling

\`\`\`
Normal: time moves forward
  t=1000ms → t=1001ms → t=1002ms
  IDs:  [1000|DC|MC|0] [1001|DC|MC|0] [1002|DC|MC|0]
  ✓ Monotonically increasing

NTP correction: clock jumps backward!
  t=1002ms → t=1001ms  (NTP adjusted -1ms)

  Strategy 1: REFUSE to generate IDs
  ┌─────────────────────────────────┐
  │ if current_ts < last_timestamp: │
  │   throw ClockMovedBackward      │
  │   // wait it out or alert       │
  └─────────────────────────────────┘

  Strategy 2: USE last_timestamp + exhaust sequence
  ┌──────────────────────────────────────┐
  │ if current_ts < last_timestamp:      │
  │   current_ts = last_timestamp        │
  │   sequence++                         │
  │   // effectively "borrow" from       │
  │   // the future until clock catches  │
  │   // up                              │
  └──────────────────────────────────────┘
\`\`\`
`,
    jsCode: `## Deep Dive: Snowflake Implementation Details

### Why Snowflake Wins

1. **Zero coordination**: Each machine generates IDs independently using only its local clock and a counter. No network calls, no locks across machines, no central authority.

2. **Time-sortable**: Since the 41-bit timestamp occupies the most significant bits, any ID generated later has a higher numerical value (within the same datacenter/machine). This makes IDs ideal for database primary keys — inserts are always at the end of B-tree indexes (no random insertions).

3. **Information-dense**: A single 64-bit integer encodes the creation time, the originating datacenter and machine, and a sequence number. You can extract any of these fields with simple bit operations.

4. **Extremely fast**: Just a few bitwise operations and a comparison — no I/O, no network, no disk. A single machine can generate millions of IDs per second.

### Timestamp: 41 Bits = ~69 Years

The timestamp is milliseconds since a **custom epoch** (not Unix epoch). By choosing a recent epoch (e.g., 2020-01-01), you maximize the usable lifespan.

\`\`\`
Unix epoch:    1970-01-01
Custom epoch:  2020-01-01
Lifespan:      2^41 ms = 2,199,023,255,552 ms ≈ 69.7 years
Expiry:        2020 + 69.7 = ~2089

vs. using Unix epoch:
Expiry:        1970 + 69.7 = ~2039 (only 13 years from now!)
\`\`\`

Always use a custom epoch that is close to the present day to maximize the ID system's useful lifespan.

### Datacenter + Machine: 10 Bits = 1,024 Machines

The 10-bit machine identifier is split into:
- **5 bits for datacenter ID**: 0–31 (32 datacenters)
- **5 bits for machine ID**: 0–31 (32 machines per datacenter)

Machine IDs can be assigned via:
1. **Configuration file**: Manually assign during deployment (simplest)
2. **Zookeeper / etcd**: Lease a unique machine ID from a coordination service at startup
3. **Cloud metadata**: Use the last 10 bits of the instance's private IP address (risk of collision with certain CIDR ranges)

### Sequence Number: 12 Bits = 4,096 per Millisecond

The sequence counter resets to 0 at each new millisecond. If a machine generates more than 4,096 IDs in a single millisecond:
- **Spin-wait** until the next millisecond (the simplest and most common approach)
- This caps per-machine throughput at 4,096,000 IDs/sec, which is more than enough for virtually all use cases

### Section Length Tuning

The default 41-5-5-12 split is a starting point. You can customize it based on your requirements:

| Scenario | Timestamp | DC | Machine | Sequence | Trade-off |
|----------|-----------|-----|---------|----------|-----------|
| Default | 41 bits | 5 | 5 | 12 | Balanced |
| More machines | 39 bits | 6 | 8 | 10 | 17 years lifespan, 16K machines, 1K IDs/ms |
| Higher throughput | 41 bits | 3 | 3 | 16 | 64 machines, 65K IDs/ms per machine |
| Longer lifespan | 43 bits | 4 | 4 | 12 | ~278 years, 256 machines |

The total must always sum to 63 (plus 1 sign bit = 64).

### Clock Synchronization (NTP)

Snowflake depends on each machine's local clock being **reasonably accurate**. If a machine's clock is significantly wrong:
- It generates IDs with incorrect timestamps
- IDs are no longer globally time-sorted

**NTP (Network Time Protocol)** keeps clocks synchronized within a few milliseconds. However, NTP corrections can cause the clock to **jump backward**, which is dangerous:

1. **Detection**: Always compare current timestamp with the last used timestamp. If current < last, the clock went backward.
2. **Tolerance**: Allow a small backward jump (e.g., 5ms) by continuing to use the last timestamp and incrementing the sequence.
3. **Rejection**: For large backward jumps (e.g., > 5ms), refuse to generate IDs and raise an alert. The machine should be taken out of rotation until its clock is fixed.

Google's **TrueTime** API (used in Spanner) provides bounded clock uncertainty, but this requires specialized hardware (GPS receivers and atomic clocks in every datacenter).

### Real-World Variants

- **Twitter Snowflake**: The original. Open-sourced in 2010. Used Thrift RPC as a service.
- **Instagram's approach**: Similar structure but with 13 bits for shard ID (8,192 shards in PostgreSQL) and 10 bits for sequence.
- **Discord**: Uses Snowflake IDs for messages, with the epoch set to the first second of 2015.
- **Sony's Sonyflake**: Uses a different split — 39 bits for timestamp (in units of 10ms, giving 174 years), 8 bits for sequence (256 per 10ms), and 16 bits for machine ID (65,536 machines).
`,
    explanation: `## Wrap Up

### Comparison of All Approaches

| Criteria | Multi-Master | UUID | Ticket Server | Snowflake |
|----------|-------------|------|--------------|-----------|
| Uniqueness | Yes (with correct step) | Yes (probabilistic) | Yes | Yes (deterministic) |
| 64-bit | Yes | No (128-bit) | Yes | Yes |
| Time-sortable | No (across servers) | No (V4) / Yes (V7) | Yes | Yes |
| No coordination | No (need aligned step) | Yes | No (centralized) | Yes |
| Throughput | Moderate | Very high | High (batched) | Very high |
| Availability | DB-dependent | Very high | SPOF risk | Very high |
| Complexity | Low | Very low | Low | Moderate |

### When to Use Each Approach

- **Multi-master**: Legacy systems where databases already have auto-increment and you can't change the ID format
- **UUID**: When you don't need 64-bit IDs or time-sorting, and want zero infrastructure (UUIDv7 if sorting is needed)
- **Ticket server**: When you need simple sequential IDs and can tolerate a centralized dependency (with redundancy)
- **Snowflake**: The best general-purpose solution when you need unique, 64-bit, time-sortable IDs at scale

### Key Design Decisions

1. **Custom epoch**: Always use a recent date as the epoch to maximize the 41-bit timestamp lifespan. Using Unix epoch wastes 50+ years of the timestamp space.

2. **In-process library vs. network service**: Snowflake is best deployed as an **in-process library** embedded in each service, not as a separate network service. This eliminates a network round trip and a potential point of failure.

3. **Machine ID assignment**: Use Zookeeper or etcd to assign machine IDs if you have dynamic infrastructure. For static fleets, configuration files work fine.

4. **Clock skew handling**: This is the Achilles' heel of Snowflake. Always monitor NTP drift and have a strategy for backward clock jumps. In the worst case, reject ID generation rather than risk duplicates.
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Don\'t jump straight to Snowflake — walk through all four approaches (multi-master, UUID, ticket server, Snowflake) and explain the trade-offs. This shows breadth of knowledge.',
      'The bit layout is the centerpiece — draw it out and explain each section. Be ready to discuss how you\'d adjust the bit allocation for different requirements (more machines vs. longer lifespan vs. higher throughput).',
      'Clock synchronization is the hardest part of Snowflake. Always mention NTP, clock skew, and what happens when the clock jumps backward. This shows you understand the real-world operational challenges.',
      'Remember that Snowflake IDs are only roughly sorted by time across machines — two IDs generated at the same millisecond on different machines are ordered by datacenter and machine ID, not by sub-millisecond timing.',
    ],
  },
];
