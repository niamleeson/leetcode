import { ProblemSolution } from './types';

export const solutionsM5: ProblemSolution[] = [
  {
    id: 9021,
    description: `## Clarifying Questions to Ask
- Are relationships **symmetric** (mutual friends) or **asymmetric** (follower/following)?
- What is the **maximum degree** for a single node (e.g., celebrities with millions of followers)?
- Do we need **real-time** shortest path queries, or is a precomputed approximation acceptable?
- What is the **freshness** requirement for friend recommendations (PYMK)?
- Do we need to support **graph-wide analytics** (e.g., community detection, influencer ranking)?

## Functional Requirements
- Store user nodes and edges (friendships/follows) at **billion-node scale**
- Query a user's **friend list** with pagination
- Compute **mutual friends** between two users in real time
- Find **degrees of separation** (shortest path) up to 6 hops
- Generate **friend recommendations** (People You May Know) based on shared connections

## Non-Functional Requirements
- Graph traversals complete within **100ms** for up to 3 hops
- **99.99% availability** for friend list reads
- Handle **500K read QPS** for friend lookups
- Eventually consistent edge additions within **2 seconds**

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total users | 2 billion |
| Avg connections per user | 500 |
| Total directed edges | 500 billion |
| Storage per edge | 24 bytes (src + dst + metadata) |
| Raw edge storage | 500B x 24B = **12 TB** |
| With 3x replication | **36 TB** |
| Node metadata | 2B x 200B = **400 GB** |
| Friend list read QPS | **500K** |
| Write QPS (new edges) | **50K** |
| Mutual friend query QPS | **100K** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle celebrity nodes (50M+ followers)?** -> Shard their adjacency lists into chunks of 5,000. Serve from cache with async fan-out. Avoid full list scans by using precomputed bitmap indexes.
- **How would you detect communities or clusters?** -> Run offline graph partitioning (Louvain / Label Propagation) via batch MapReduce. Store cluster IDs as node metadata for real-time queries.
- **What if a user deletes their account?** -> Soft-delete the node, then async tombstone all edges. Propagate cache invalidations through the TAO layer. Full purge in a background GC job within 30 days.
- **How would you add real-time feed ranking on top of the graph?** -> Use edge weights (interaction frequency, recency) as input features to a feed ranking model. The graph service provides the social signal; a separate ranking service combines it with content signals.
- **How would you support "friends of friends who work at Google"?** -> Two-hop traversal filtered by attribute index. Maintain a secondary index on company/school/city so you intersect graph results with attribute lookups.`,
    intuition: `A social graph is a massive **distributed adjacency list** where the core challenges are power-law degree distribution and multi-hop traversal latency. Most users have hundreds of connections but celebrities have millions, so the system must handle extreme skew without degrading. The key algorithmic insight is **bidirectional BFS** for shortest path -- expanding from both ends reduces the search space from 500^3 (125M) to 2 x 500^1.5 (~22K), a 5,000x improvement.`,
    approach: `## Component Overview

A **TAO-like cache layer** sits in front of a sharded graph store (MySQL or RocksDB), optimized for the association query pattern: "get all edges from node X of type Y." A **Graph Query Service** handles traversals (BFS, mutual friends). A **Recommendation Pipeline** runs daily batch jobs to compute PYMK scores and stores results in a recommendation cache. All reads hit the two-tier cache first; writes go to the database and then invalidate/update caches.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /v1/friendships\` | Create | Body: \`{ user_id, target_id, type }\` -> Returns friendship status |
| \`GET /v1/users/:id/friends\` | Read | Paginated friend list with mutual count |
| \`GET /v1/users/:id/mutual-friends/:other\` | Read | Returns shared connections between two users |
| \`GET /v1/users/:id/separation/:other\` | Read | Degrees of separation and shortest path |
| \`GET /v1/users/:id/recommendations\` | Read | PYMK list with scores and reasons |

## Data Model

| Table | Columns | Notes |
|-------|---------|-------|
| users | user_id (PK), name, company, school, city | Node metadata |
| edges | source_id, dest_id, type, created_at | PK: source_id + dest_id. Both directions stored |
| adjacency_cache | user_id (PK), friend_ids (sorted list) | Denormalized for fast reads |
| recommendations | user_id (PK), candidates (JSON), generated_at | Precomputed PYMK results |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Client"]
    N1["Load Balancer"]
    N2["API Gateway"]
    N3["Graph Query Service"]
    N4["Recommendation"]
    N5["Search/Traversal"]
    N6["Service"]
    N7["Engine"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client** — The user-facing application that initiates friend list queries, mutual friend lookups, and graph traversal requests.
- **Load Balancer** — Distributes incoming traffic across API Gateway instances to ensure even load and high availability.
- **API Gateway** — Handles authentication, rate limiting, and routes requests to the appropriate backend service.
- **Graph Query Service** — Core service that processes graph traversals such as BFS, mutual friend computation, and shortest path queries.
- **Recommendation** — Generates People You May Know (PYMK) suggestions based on shared connections and graph proximity.
- **Search/Traversal** — Executes multi-hop graph traversals (e.g., bidirectional BFS) across the sharded graph store.
- **Service** — The TAO-like cache layer that serves association queries, reducing load on the underlying database.
- **Engine** — The sharded graph store (MySQL/RocksDB) that persists all nodes and edges as the source of truth.

## Mutual Friends Query Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as API Gateway
    participant P2 as Graph Service
    participant P3 as TAO Cache
    participant P4 as Graph Store
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
\`\`\`
`,
    jsCode: `## Deep Dive: Bidirectional BFS for Shortest Path

Standard BFS from one node expands exponentially: at 500 avg connections, 3 hops touches 125M nodes. Bidirectional BFS explores from **both** source and target, meeting in the middle.

\`\`\`
Unidirectional BFS (3 hops):        Bidirectional BFS (3 hops):
                                     Source side    Target side
hop 0:     1 node                    1 node         1 node
hop 1:   500 nodes                   500            500
hop 2: 250,000 nodes                 ~11,000        ~11,000
hop 3: 125,000,000 nodes             (meet in middle!)

Total explored: 125M               Total explored: ~22K
                                    Reduction: ~5,000x
\`\`\`

\`\`\`mermaid
graph TD
    N0["Source"]
    N1["Target"]
    N2["User"]
    N3["Frontier"]
    N4["Set A"]
    N5["Set B"]
    N6["Set A'"]
    N7["Set B'"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Source / Target** — The two endpoints of the shortest-path query. BFS expands outward from both simultaneously to meet in the middle.
- **User Frontier** — The current set of nodes being explored at each BFS level, expanding from both the source and target sides.
- **Set A / Set B** — The visited node sets from the source side and target side respectively, checked for overlap at each hop.
- **Set A' / Set B'** — The next-level frontier sets generated by expanding neighbors of the current frontier, growing the search boundary by one hop.

- Use **Bloom filters** at each hop for fast visited-set membership checks
- **Early termination** when the two frontiers share a node
- Depth limit of 6 (small-world property guarantees most pairs connect)

---

## Deep Dive: TAO Cache Architecture

Facebook's TAO (The Associations and Objects) is a write-through cache optimized for graph queries.

\`\`\`mermaid
graph TD
    N0["Leader Region"]
    N1["Any Region"]
    N2["L1 Cache"]
    N3["MySQL Primary"]
    N4["L2 Cache"]
    N5["MySQL Replicas"]
    N6["MySQL Replica"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Leader Region** — The primary datacenter region that owns all writes for a given shard, ensuring consistency before fanning out to followers.
- **Any Region** — A follower datacenter that serves local reads from its own cache and forwards writes to the leader region.
- **L1 Cache** — A per-region, high-throughput cache tier that handles the hottest read traffic and serves most queries without hitting L2.
- **MySQL Primary** — The authoritative write-through datastore that persists all graph mutations before they propagate to caches and replicas.
- **L2 Cache** — A shared, larger cache tier that absorbs L1 misses, reducing direct load on the MySQL layer.
- **MySQL Replicas** — Read replicas that serve cache-miss queries for follower regions, replicating asynchronously from the primary.
- **MySQL Replica** — An individual read replica instance within a follower region, handling local database reads.

- **Objects**: nodes (users). Cached by ID.
- **Associations**: edges (friendships). Cached as sorted lists per source node.
- **Write-through**: writes go DB first, then update L1, then async invalidate other regions
- **Thundering herd protection**: only one cache miss triggers a DB read; others wait

---

## Deep Dive: PYMK Recommendation Pipeline

\`\`\`mermaid
graph TD
    N0["Daily Batch Pipeline"]
    N1["For each"]
    N2["Scan friends"]
    N3["Score candidates"]
    N4["Scoring Formula:"]
    N5["Store top 200 candidates"]
    N6["Real-Time Boost Layer"]
    N7["When edge added: re-score"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Daily Batch Pipeline** — Scheduled job that runs once per day to compute PYMK candidates for every user by scanning their friends' connections.
- **For each / Scan friends** — Iterates through each user's friend list and collects their friends-of-friends as potential recommendation candidates.
- **Score candidates** — Ranks each candidate using a formula that weights mutual friend count, shared attributes (company, school), and interaction recency.
- **Scoring Formula** — The weighted combination of signals (e.g., mutual friends x 3 + same company x 2 + recent interaction x 1) that produces a final PYMK score.
- **Store top 200 candidates** — Persists the highest-scoring recommendations to a cache so they can be served instantly when a user requests suggestions.
- **Real-Time Boost Layer** — Supplements the daily batch by re-scoring candidates when new edges are added, keeping recommendations fresh between batch runs.
- **When edge added: re-score** — Triggered on new friendship events to immediately boost candidates connected to the newly added friend.
`,
    explanation: `## Bottlenecks & Improvements
- **Celebrity nodes (high degree)** -> Shard adjacency lists into chunks of 5,000. Use bitmap indexes for intersection. Cache aggressively with dedicated hot-key replicas
- **Cross-shard traversals** -> Multi-hop BFS may touch many shards. Mitigate with locality-aware partitioning (METIS) and replicate high-connectivity edges
- **Cache stampede on popular users** -> Request coalescing in the TAO layer: one miss triggers DB fetch, all concurrent requests wait for the same result
- **Stale PYMK recommendations** -> Run daily batch plus real-time boost on new edges. Accept staleness up to 24 hours for non-time-sensitive suggestions

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| TAO write-through cache | Higher write latency, but guaranteed cache consistency and sub-ms reads |
| Hash partitioning by user_id | Some cross-shard edges on traversals, but even data distribution |
| Bidirectional BFS over unidirectional | More complex implementation, but 5,000x fewer nodes explored |
| Batch PYMK over real-time | Up to 24h stale recommendations, but 1000x less compute vs real-time |
| Sorted adjacency lists | O(n+m) intersection cost, but simple and cache-friendly vs bitmap indexes |

## Monitoring & Alerting
- **Traversal latency**: p50, p95, p99 for BFS and mutual friend queries -- alert if p99 > 200ms
- **Cache hit ratio**: TAO L1 should be > 99% -- alert below 97%
- **Cross-shard fan-out**: track average shards touched per query -- alert if trending up
- **PYMK freshness**: monitor batch job completion time -- alert if > 6 hours behind
`,
    timeComplexity: "Friend list lookup: O(1) cache hit. Mutual friends: O(n+m) sorted intersection. Bidirectional BFS (k hops): O(d^(k/2)) where d is average degree.",
    spaceComplexity: "~36 TB for edges (3x replicated). ~400 GB for node metadata. ~100 GB TAO cache per region. Grows linearly with user and edge count.",
    hints: [
      "Social graphs follow a power-law distribution -- most nodes have few edges but celebrities have millions. Your design must handle this skew without degrading traversal latency.",
      "Bidirectional BFS is the key insight for shortest path. Expanding from both sides and meeting in the middle reduces explored nodes from 125M to ~22K for a 3-hop query.",
      "Facebook's TAO architecture is the gold standard: a write-through cache layer over sharded MySQL, optimized for the 'get all associations from node X' pattern.",
      "For PYMK, batch computation (daily) plus real-time boosting (on new edges) gives the best cost-to-freshness ratio. Pure real-time is prohibitively expensive at scale."
    ],
  },
  {
    id: 9022,
    description: `## Clarifying Questions to Ask
- What is the **geographic scope** -- single city, country, or global?
- How many **concurrent active drivers** are we matching at peak?
- What **latency** is acceptable from ride request to driver match?
- Do we need to support **ride pools** (shared rides) or only single-party trips?
- How should **surge pricing** work -- zone-based, real-time demand/supply ratio?

## Functional Requirements
- Riders can **request a ride** specifying pickup and dropoff locations
- The system **matches** the nearest available driver within a radius
- Compute **ETA** for driver arrival and trip duration
- Apply **dynamic (surge) pricing** based on demand/supply ratio
- Track **real-time driver location** during the trip

## Non-Functional Requirements
- Match rider to driver within **3 seconds** of request
- Handle **1M concurrent active drivers** sending location updates
- Location updates at **5-second intervals** (200K updates/sec)
- **99.9% availability** for ride matching

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Concurrent active drivers | 1M |
| Location update frequency | Every 5 seconds |
| Location update QPS | 1M / 5 = **200K QPS** |
| Ride requests per day | 20M |
| Ride request QPS (avg) | 20M / 86,400 = **230 QPS** (peak: ~2K) |
| Location record size | ~50 bytes (driver_id + lat + lng + timestamp) |
| Location storage / day | 200K x 86,400 x 50B = **860 GB/day** |
| Active driver index size | 1M x 50B = **50 MB** (fits in memory) |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle driver location updates at 200K QPS?** -> Write to an in-memory geospatial index (not disk DB). Use a ring buffer per driver -- only keep the latest location. Batch-write to persistent storage asynchronously for trip history.
- **How would you implement ride pooling (UberPool)?** -> Extend matching to consider existing in-progress trips. Check if a detour to pick up a new rider adds < X minutes. Use a shared-ride scoring function that optimizes total trip time across all passengers.
- **What happens if no drivers are nearby?** -> Expand search radius in increments (1km -> 3km -> 5km). If still no match after 30 seconds, notify the rider and offer to keep searching. Consider dispatching from adjacent geohash cells.
- **How would you prevent surge pricing abuse?** -> Smooth surge multiplier changes over time (no instant spikes). Cap maximum surge at 5x. Show estimated price before rider confirms. Implement cooldown periods between surge adjustments.
- **How would you support international expansion?** -> Region-specific deployments with local compliance (payment, regulations). Geo-DNS routing to nearest region. Separate driver pools per country but shared trip history for cross-border travel.`,
    intuition: `A ride-sharing service is fundamentally a **real-time geospatial matching engine** -- it must continuously index moving objects (drivers) and efficiently query "find the nearest available driver to point X." The core challenge is that the index is never static: 1M drivers update their positions every 5 seconds, so any spatial data structure must support extremely fast updates alongside queries. Geohashing converts the 2D matching problem into a 1D prefix search, making it cache-friendly and easy to shard.`,
    approach: `## Component Overview

A **Location Service** ingests driver GPS pings into an in-memory **geospatial index** (geohash-based grid). When a rider requests a trip, a **Matching Service** queries the index for nearby available drivers, ranks them by ETA, and dispatches the best match. A **Pricing Service** computes fares using a base rate plus a surge multiplier derived from the demand/supply ratio per zone. A **Trip Service** tracks ride state transitions and stores trip history.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`PUT /v1/drivers/:id/location\` | Update | Body: \`{ lat, lng, timestamp }\` -> Ack |
| \`POST /v1/rides\` | Create | Body: \`{ rider_id, pickup, dropoff }\` -> Returns \`{ ride_id, driver, eta, price }\` |
| \`GET /v1/rides/:id\` | Read | Returns ride status, driver location, ETA |
| \`POST /v1/rides/:id/complete\` | Update | Completes ride, triggers payment |
| \`GET /v1/pricing/estimate\` | Read | Query: \`pickup, dropoff\` -> Returns \`{ estimate, surge_multiplier }\` |

## Data Model

| Table | Columns | Notes |
|-------|---------|-------|
| drivers | driver_id (PK), name, vehicle, status, current_location | Status: available, on_trip, offline |
| rides | ride_id (PK), rider_id, driver_id, pickup, dropoff, status, fare | Status: requested, matched, in_progress, completed |
| location_history | driver_id, timestamp, lat, lng | Time-series data, TTL 30 days |
| surge_zones | zone_id (PK), geohash_prefix, multiplier, updated_at | Recalculated every 30 seconds |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Rider"]
    N1["Driver"]
    N2["App"]
    N3["Load Balancer / API Gateway"]
    N4["Matching"]
    N5["Location Service"]
    N6["Service"]
    N7["Geospatial Index"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Rider / Driver** — The two primary user types: riders request trips and drivers fulfill them by accepting dispatched matches.
- **App** — The mobile application used by both riders and drivers, handling location tracking, ride requests, and real-time trip updates.
- **Load Balancer / API Gateway** — Entry point that distributes requests, handles authentication, and routes traffic to backend microservices.
- **Matching** — Core service that finds the best available driver for a ride request by querying the geospatial index and ranking candidates by ETA.
- **Location Service** — Ingests driver GPS pings at 200K QPS and maintains the real-time geospatial index of all active driver positions.
- **Service** — The pricing service that computes fares using base rates plus surge multipliers derived from per-zone demand/supply ratios.
- **Geospatial Index** — In-memory geohash-based data structure that enables O(1) proximity lookups for nearby available drivers.

## Ride Matching Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Rider App
    participant P1 as Matching Svc
    participant P2 as Location Svc
    participant P3 as Geospatial Idx
    participant P4 as Driver App
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
\`\`\`
`,
    jsCode: `## Deep Dive: Geohash-Based Spatial Indexing

Geohashing converts a 2D coordinate (lat, lng) into a 1D string. Nearby locations share a common prefix, enabling spatial proximity queries with simple prefix lookups.

\`\`\`mermaid
graph TD
    N0["Chars"]
    N1["Use Case"]
    N2["Country zoom"]
    N3["City zone"]
    N4["Matching"]
    N5["Street level"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Chars / Use Case** — Shows the relationship between geohash precision (number of characters) and the corresponding geographic resolution it maps to.
- **Country zoom** — Low-precision geohashes (2-3 chars) covering large areas, useful for coarse regional grouping.
- **City zone** — Medium-precision geohashes (4-5 chars) covering city-level zones, used for surge pricing boundaries.
- **Matching** — Precision level (6 chars, ~1.2km cells) used for driver-rider matching, balancing cell size with query efficiency.
- **Street level** — High-precision geohashes (7+ chars) for pinpoint accuracy, used for final ETA and navigation purposes.

\`\`\`mermaid
graph TD
    N0["9q8yyk 9q8yym 9q8yyq"]
    N1["9q8yyh 9q8yyj 9q8yyn drier D1 in center cell"]
    N2["D3 D1 D2 query center 8 neighbors"]
    N3["to aoid edge effects"]
    N4["9q8yy5 9q8yy7 9q8yye"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **9q8yyk 9q8yym 9q8yyq** — The top row of neighboring geohash cells surrounding the query area, checked to avoid missing drivers near cell boundaries.
- **9q8yyh 9q8yyj 9q8yyn** — The middle row of geohash cells containing the center cell where driver D1 is located and from which the neighbor query originates.
- **D3 D1 D2 query center 8 neighbors** — The set of candidate drivers found across the center cell and its eight surrounding cells, illustrating the spatial query pattern.
- **to avoid edge effects** — Explains why all eight neighbors must be queried: a rider near a cell boundary could be closest to a driver in an adjacent cell.
- **9q8yy5 9q8yy7 9q8yye** — The bottom row of neighboring geohash cells, completing the 3x3 grid of cells searched for nearby drivers.

- **Index structure**: HashMap of geohash_6 -> list of (driver_id, lat, lng, status)
- **Query**: compute geohash of pickup, fetch center cell + 8 neighbors, filter by distance
- **Update**: on each driver ping, remove from old cell, insert into new cell -- O(1) per update
- **Memory**: 1M drivers x 50 bytes = 50 MB -- fits entirely in RAM

---

## Deep Dive: Surge Pricing Engine

\`\`\`mermaid
graph TD
    N0["Demand Counter"]
    N1["Supply Counter"]
    N0 --> N1
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

- Zones defined by geohash prefixes (level 5, ~5km cells)
- Demand = ride requests in zone in last 2 minutes
- Supply = available drivers in zone right now
- **Exponential smoothing** prevents abrupt spikes

---

## Deep Dive: ETA Calculation

\`\`\`mermaid
graph TD
    N0["Simple ETA"]
    N1["Enhanced ETA"]
    N2["Good enough for"]
    N3["Accurate but needs"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

- **Phase 1 (matching)**: Use haversine distance / avg speed for quick ranking
- **Phase 2 (display)**: Call routing service (OSRM/Valhalla) for actual road ETA
- Cache route ETAs for popular origin-destination pairs
`,
    explanation: `## Bottlenecks & Improvements
- **200K location updates/sec** -> Write to in-memory geospatial index only. Async batch-persist to time-series DB for history. Ring buffer per driver (keep only latest location)
- **Hot geohash cells (airport, downtown)** -> Replicate hot cells across multiple index nodes. Use consistent hashing to spread load across matching workers
- **Stale driver locations** -> Mark drivers with last_seen > 30s as possibly offline. Require heartbeat to maintain "available" status. Remove from index after 60s silence
- **Surge pricing accuracy** -> Zone boundaries can create unfair edges (one block apart, different surge). Use gradient smoothing across adjacent zones to soften boundaries

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Geohash over R-tree / QuadTree | Simpler, cache-friendly prefix queries, but edge effects at cell boundaries require neighbor lookups |
| In-memory index over database | Fast reads/writes at 200K QPS, but requires replication for fault tolerance |
| Haversine for initial matching | Fast but inaccurate for dense urban grids; refined with routing service after match |
| Zone-based surge over per-ride | Simpler to compute and explain, but less granular than individual demand modeling |
| 30-second surge recalculation | Smooth pricing experience, but may lag behind sudden demand spikes (concerts, weather) |

## Monitoring & Alerting
- **Match latency**: p50, p95, p99 for time from ride request to driver assignment -- alert if p99 > 5s
- **Driver index freshness**: percentage of drivers with location update < 10s old -- alert below 95%
- **Surge multiplier distribution**: track percentage of zones in surge -- alert if > 40% (possible system issue vs real demand)
- **Match success rate**: percentage of ride requests matched within 60s -- alert below 90%
`,
    timeComplexity: "Location update: O(1) geohash insert/remove. Ride matching: O(k) where k is drivers in nearby cells (~100-500). Surge calculation: O(z) per zone per cycle.",
    spaceComplexity: "In-memory index: ~50 MB for 1M drivers. Location history: ~860 GB/day (time-series, TTL 30 days). Surge config: negligible (Redis).",
    hints: [
      "Geohashing is the key spatial indexing technique -- it converts 2D proximity into 1D prefix matching. Always query the center cell plus its 8 neighbors to handle edge effects at cell boundaries.",
      "The driver location index must be in-memory to handle 200K updates/sec. Disk-based databases cannot sustain this write throughput with acceptable latency.",
      "Surge pricing should use exponential smoothing to prevent jarring price jumps. The formula: new_surge = 0.7 * old + 0.3 * calculated prevents abrupt spikes.",
      "Use a two-phase ETA: fast haversine estimate for matching/ranking, then accurate road-network routing for display. This balances speed with accuracy."
    ],
  },
  {
    id: 9023,
    description: `## Clarifying Questions to Ask
- Do we need to support **multiple languages** (Python, JavaScript, Go, etc.) or just one?
- Should code execution be **fully sandboxed** or can we share resources between users?
- Do we need **real-time collaboration** (multiple users editing the same file)?
- What is the **maximum execution time** allowed per run (e.g., 30 seconds, 5 minutes)?
- Should we support **file system access**, package installation, and network access within the sandbox?

## Functional Requirements
- Users can **create projects** with multiple files in a browser-based IDE
- **Execute code** in a secure sandboxed environment and return stdout/stderr
- Support **multiple programming languages** (at least Python, JavaScript, Go)
- **Real-time collaboration**: multiple users edit the same project simultaneously
- **Persist** projects and allow resuming sessions

## Non-Functional Requirements
- Code execution starts within **2 seconds** of clicking "Run"
- **Strong isolation** between user sandboxes (no cross-contamination)
- Handle **100K concurrent active editors** with execution
- **99.9% availability** for the editor; execution may have slightly lower SLA

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Concurrent active editors | 100K |
| Code executions per day | 10M |
| Execution QPS (avg) | 10M / 86,400 = **~115 QPS** (peak: ~1K) |
| Avg execution duration | 5 seconds |
| Concurrent running sandboxes | 1K x 5 = **5,000** |
| Project storage per user | ~10 MB avg |
| Total project storage | 5M users x 10 MB = **50 TB** |
| WebSocket connections (collab) | **100K concurrent** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you support package/dependency installation?** -> Pre-bake popular packages into base container images per language. For custom packages, run install in the sandbox with network access during a setup phase, then snapshot the filesystem. Cache installed dependency sets by hash of requirements file.
- **How would you handle long-running processes (servers, daemons)?** -> Assign a dedicated container with port forwarding. Use a reverse proxy to expose the user's server on a unique subdomain. Set a max lifetime (e.g., 1 hour) with option to extend. Kill idle processes after 15 minutes.
- **How would you prevent crypto mining or abuse?** -> CPU time limits per execution (30s default). Monitor CPU usage patterns; flag sustained 100% CPU. Require account verification for extended execution. Rate limit executions per user per hour.
- **How would you support debugging (breakpoints, step-through)?** -> Integrate DAP (Debug Adapter Protocol). Run the debugger inside the sandbox. Communicate breakpoint events over WebSocket to the frontend. Heavier resource allocation for debug sessions.
- **How would you reduce cold start latency?** -> Maintain a warm pool of pre-initialized containers per language. When a pool runs low, proactively spin up more. Use lightweight VMs (Firecracker) for faster boot (~125ms) vs Docker (~1-2s).`,
    intuition: `An online code editor is fundamentally a **remote execution platform with a real-time frontend**. The two hardest problems are: (1) executing untrusted code **safely** without letting users escape their sandbox or affect other users, and (2) delivering a **responsive editing experience** over the network that feels as fast as a local IDE. Lightweight VMs (Firecracker) or gVisor containers solve the isolation challenge by providing near-native speed with strong security boundaries, while warm pools eliminate cold start latency.`,
    approach: `## Component Overview

A **WebSocket Gateway** maintains persistent connections with browser-based editors for real-time collaboration and execution output streaming. An **Editor Service** manages project state (file tree, content) backed by object storage. An **Execution Service** orchestrates sandboxed containers -- pulling from a **Warm Pool** of pre-initialized VMs, attaching the user's code, running it, and streaming output back. A **Collaboration Service** handles OT/CRDT for multi-user editing.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /v1/projects\` | Create | Create a new project with language selection |
| \`GET /v1/projects/:id/files\` | Read | Retrieve file tree and contents |
| \`PUT /v1/projects/:id/files/:path\` | Update | Save file content (also sent via WebSocket) |
| \`POST /v1/projects/:id/execute\` | Execute | Run code, returns execution_id for streaming |
| \`WS /v1/projects/:id/collaborate\` | WebSocket | Real-time editing and execution output stream |

## Data Model

| Table | Columns | Notes |
|-------|---------|-------|
| projects | project_id (PK), owner_id, name, language, created_at | Project metadata |
| files | file_id (PK), project_id (FK), path, content_hash | Points to object storage |
| executions | exec_id (PK), project_id, status, started_at, duration, exit_code | Execution history |
| collaborators | project_id, user_id, permission, joined_at | Access control |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Browser"]
    N1["IDE (User)"]
    N2["WebSocket"]
    N3["WebSocket Gateway"]
    N4["Editor"]
    N5["Collaboration"]
    N6["Service"]
    N7["CRUD"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Browser IDE (User)** — The browser-based code editor where users write, edit, and run code with syntax highlighting and file management.
- **WebSocket** — Persistent bidirectional connection used for real-time collaboration updates and streaming execution output back to the browser.
- **WebSocket Gateway** — Manages thousands of concurrent WebSocket connections, routing messages between clients and backend services.
- **Editor Service** — Handles project CRUD operations including file creation, saving, and retrieval from object storage.
- **Collaboration** — Manages real-time multi-user editing using Operational Transformation to merge concurrent edits consistently.
- **Service** — The execution orchestrator that assigns sandboxed VMs from the warm pool, injects user code, and manages run lifecycle.
- **CRUD** — The persistence layer backed by object storage (S3) that stores project files, execution history, and user metadata.

## Code Execution Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Browser
    participant P1 as WS Gateway
    participant P2 as Execution Svc
    participant P3 as Warm Pool
    participant P4 as Sandbox VM
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
\`\`\`
`,
    jsCode: `## Deep Dive: Sandbox Isolation Strategies

Untrusted code execution is the highest-risk component. Three isolation approaches with increasing security:

\`\`\`mermaid
graph TD
    N0["Isolation Spectrum"]
    N1["Docker + seccomp"]
    N2["Firecracker"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Isolation Spectrum** — Represents the range of sandbox isolation strategies, ordered from lighter-weight (less secure) to heavier-weight (more secure).
- **Docker + seccomp** — Container-based isolation that uses Linux namespaces and seccomp syscall filtering; fast startup but shares the host kernel, leaving a larger attack surface.
- **Firecracker** — Lightweight microVM isolation that gives each sandbox its own kernel, providing near-bare-metal security with sub-200ms boot times.

**Recommended: Firecracker microVMs** (used by AWS Lambda, Fly.io)
- Each user gets a dedicated lightweight VM with its own kernel
- Boot in ~125ms from a pre-built snapshot
- Memory balloon driver allows dynamic sizing (128MB-2GB)
- Strict resource limits: CPU quota, memory cap, network isolation

Resource limits per sandbox:
\`\`\`mermaid
graph TD
    N0["Sandbox Resource Limits"]
    N1["CPU: 1 vCPU max"]
    N2["Memory: 512 MB default"]
    N3["Disk: 1 GB ephemeral"]
    N4["Network: egress filtered"]
    N5["Time: 30s execution max"]
    N6["PIDs: 100 max processes"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Sandbox Resource Limits** — The overarching enforcement policy applied to every user sandbox to prevent abuse and ensure fair resource sharing.
- **CPU: 1 vCPU max** — Caps compute to a single virtual CPU, preventing CPU-intensive workloads like crypto mining from starving other users.
- **Memory: 512 MB default** — Limits RAM to prevent runaway allocations; can be dynamically adjusted via Firecracker's memory balloon driver.
- **Disk: 1 GB ephemeral** — Provides temporary writable storage that is destroyed after execution, preventing persistent data accumulation.
- **Network: egress filtered** — Restricts outbound network access to approved endpoints only, blocking malicious traffic and data exfiltration.
- **Time: 30s execution max** — Hard timeout that kills long-running processes, protecting against infinite loops and resource hogging.
- **PIDs: 100 max processes** — Limits the number of spawnable processes to defend against fork bombs and excessive process creation.

---

## Deep Dive: Warm Pool Management

Cold-starting a VM for every execution is too slow. A warm pool keeps pre-initialized VMs ready.

\`\`\`mermaid
graph TD
    N0["Warm Pool Architecture"]
    N1["Pool State Machine (per language):"]
    N2["WARM"]
    N3["ACTIVE"]
    N4["RECYCLING"]
    N5["Pool Sizing:"]
    N6["Language"]
    N7["Min"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Warm Pool Architecture** — The overall system that maintains a fleet of pre-initialized VMs ready for instant assignment to user execution requests.
- **Pool State Machine (per language)** — Tracks each VM through its lifecycle stages, ensuring VMs are properly managed from creation to disposal.
- **WARM** — State for idle, pre-initialized VMs with the language runtime loaded, ready to accept user code within milliseconds.
- **ACTIVE** — State for VMs currently executing user code, with resource limits enforced and output being streamed back.
- **RECYCLING** — State for VMs being cleaned up after execution, where user data is wiped before returning the VM to the warm pool.
- **Pool Sizing** — The autoscaling policy that determines how many warm VMs to maintain per language based on demand patterns.
- **Language / Min** — Configuration specifying minimum pool sizes per language (e.g., Python: 200, JavaScript: 150, Go: 50) to handle baseline traffic.

---

## Deep Dive: Real-Time Output Streaming

\`\`\`mermaid
sequenceDiagram
    participant P0 as Sandbox VM
    participant P1 as Execution Service
    participant P2 as WS Gateway
    participant P3 as Browser
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
\`\`\`

- Buffer output in **50ms windows** or **4KB chunks** to reduce WS message count
- Flush immediately on process exit to minimize perceived latency
- Cap total output at **1 MB** to prevent memory exhaustion from infinite print loops
`,
    explanation: `## Bottlenecks & Improvements
- **Cold start latency** -> Maintain warm pools sized at 130% of predicted demand. Use Firecracker snapshots for ~125ms boot. Pre-load language runtimes and popular packages into base images
- **100K concurrent WebSocket connections** -> Horizontally scale WS Gateway nodes. Use sticky sessions (hash project_id) so all collaborators on a project connect to the same node. Shard by project, not by user
- **Resource abuse (fork bombs, infinite loops)** -> Set strict PID limits (100), CPU time limits (30s), and memory caps (512MB). Use cgroups v2 for enforcement. Monitor and kill runaway processes
- **Collaboration conflicts** -> Use OT (Operational Transformation) for real-time editing. Buffer operations client-side during brief disconnects. Server is the source of truth for operation ordering

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Firecracker over Docker | Stronger isolation and faster boot, but more operational complexity to manage VM fleet |
| Warm pool over cold start | 2-5x more idle resource cost, but guaranteed sub-2s execution start |
| WebSocket over HTTP polling | Persistent connections consume resources, but enable true real-time streaming |
| OT over CRDT for collaboration | Requires central server for ordering, but simpler to reason about and proven at scale (Google Docs) |
| 50ms output buffering | Slight delay in output appearance, but 20x fewer WebSocket messages |

## Monitoring & Alerting
- **Execution start latency**: p50, p95, p99 from request to first output -- alert if p99 > 3s
- **Warm pool utilization**: percentage of pool in use -- alert if > 80% (risk of pool exhaustion)
- **Sandbox escape attempts**: monitor for suspicious syscalls, network access -- alert immediately
- **WebSocket connection count**: per gateway node -- alert if > 80% of capacity
`,
    timeComplexity: "Code execution: O(user code). Matching to warm VM: O(1) from pool. File save: O(file_size) to object storage. Collaboration merge: O(op_length) per OT transform.",
    spaceComplexity: "~50 TB total project storage (S3). ~500 warm VMs x 512 MB = 250 GB RAM for warm pool. ~100K WebSocket connections at ~50 KB each = 5 GB gateway memory.",
    hints: [
      "Firecracker microVMs give you the best isolation-to-performance ratio for untrusted code execution. They boot in ~125ms from snapshots and provide full kernel-level isolation.",
      "A warm pool is essential to meet the 2-second execution start target. Size it at 130% of expected demand per language and autoscale based on utilization.",
      "Buffer stdout output in 50ms windows before sending over WebSocket. This reduces message count by 20x while keeping the experience feeling real-time.",
      "For collaboration, OT (Operational Transformation) is proven at Google-scale. The server maintains a single operation log as the source of truth, transforming concurrent edits to preserve intent."
    ],
  },
  {
    id: 9024,
    description: `## Clarifying Questions to Ask
- How many **concurrent editors** per document do we need to support?
- What is the **conflict resolution** strategy -- last-writer-wins, or intent-preserving merge?
- Do we need **offline editing** support with later sync?
- What **document types** -- plain text, rich text with formatting, or structured data?
- Should we support **version history** and the ability to revert to any prior state?

## Functional Requirements
- Multiple users **simultaneously edit** the same document in real time
- All users see a **consistent view** that converges within milliseconds
- Support **rich text** operations (insert, delete, format, comment)
- Maintain full **version history** with ability to view/restore any point
- Handle users going **offline** and syncing edits when they reconnect

## Non-Functional Requirements
- Local edits appear **instantly** (< 50ms perceived latency)
- Remote edits propagated to other users within **200ms**
- Support **50+ concurrent editors** per document
- **99.99% availability** for the collaboration service
- No data loss even during network partitions

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total documents | 1 billion |
| Active documents (daily) | 50M |
| Concurrent editors (peak) | 500K users across all docs |
| Avg operations per user per min | 30 (keystrokes + formatting) |
| Total operation throughput | 500K x 30 / 60 = **250K ops/sec** |
| Avg document size | 50 KB |
| Total document storage | 1B x 50 KB = **50 TB** |
| Operation log per document | ~10 KB/day active |
| Operation log storage | 50M x 10 KB = **500 GB/day** |
`,
    examples: `## Follow-Up Discussion Points
- **OT vs CRDT -- when would you choose each?** -> OT requires a central server to order operations (simpler, proven at Google-scale), but struggles with P2P. CRDTs work without coordination (great for offline/P2P), but use more memory for metadata and are harder to implement for rich text. Choose OT for server-mediated collab; CRDT for offline-first or P2P.
- **How would you implement presence (cursors, selections)?** -> Broadcast cursor position and selection range via a lightweight presence channel (separate from document ops). Use last-writer-wins for cursor state. Send at most 10 updates/sec per user to limit bandwidth.
- **How would you handle very large documents (100+ pages)?** -> Chunk the document into sections/paragraphs. Only load visible chunks into the editor. Apply operations to the relevant chunk. Lazy-load surrounding chunks as the user scrolls.
- **How would you support comments and suggestions mode?** -> Model comments as annotations anchored to character ranges. When text is edited, adjust anchor positions using the same OT/CRDT transforms. Suggestions are pending operations shown in a different color until accepted.
- **How would you handle a network partition mid-edit?** -> Buffer operations locally in an operation queue. On reconnect, send buffered ops to server. Server transforms them against any ops received from other clients during the partition. Converge to consistent state.`,
    intuition: `Real-time collaborative editing solves the hardest problem in distributed systems: **multiple writers updating shared mutable state without locks**. The key insight is that you cannot simply send diffs -- if two users type at the same position simultaneously, naive merging produces garbled text. **Operational Transformation (OT)** solves this by mathematically transforming concurrent operations so they can be applied in any order and still converge to the same result. Each operation carries enough context (position, document version) that the server can reorder and transform them to preserve every user's intent.`,
    approach: `## Component Overview

Each client runs a **local editor** that applies edits instantly for zero-latency UX. Edits are sent as **operations** (insert, delete, format) to a **Collaboration Server** that maintains the authoritative operation log. The server **transforms** concurrent operations using OT and broadcasts the transformed ops to all connected clients. A **Document Service** handles persistence, snapshotting, and version history. A **Presence Service** tracks cursor positions and active users per document.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /v1/documents\` | Create | Create a new document |
| \`GET /v1/documents/:id\` | Read | Fetch document content and metadata |
| \`WS /v1/documents/:id/collaborate\` | WebSocket | Real-time operation stream + presence |
| \`GET /v1/documents/:id/history\` | Read | List version snapshots with timestamps |
| \`POST /v1/documents/:id/restore/:version\` | Write | Restore document to a previous version |

## Data Model

| Table | Columns | Notes |
|-------|---------|-------|
| documents | doc_id (PK), title, owner_id, created_at, updated_at | Document metadata |
| snapshots | doc_id, version, content, created_at | Periodic full snapshots (every 100 ops) |
| operations | doc_id, seq_num, user_id, op_type, position, content, timestamp | Ordered operation log |
| presence | doc_id, user_id, cursor_pos, selection, last_seen | Ephemeral, in-memory |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Client A"]
    N1["Client B"]
    N2["Client C"]
    N3["WebSocket"]
    N4["WebSocket Gateway"]
    N5["Collaboration Server"]
    N6["Per-Document OT Engine"]
    N7["Document"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client A / Client B / Client C** — Concurrent users editing the same document, each running a local editor that applies changes instantly for zero-latency UX.
- **WebSocket** — Persistent bidirectional connection that streams operations between clients and the collaboration server with sub-200ms propagation.
- **WebSocket Gateway** — Manages thousands of concurrent connections, routing operations to the correct collaboration server based on document ID.
- **Collaboration Server** — Maintains the authoritative operation log for each document and transforms concurrent operations using OT to ensure convergence.
- **Per-Document OT Engine** — The core transformation logic that takes concurrent edits and mathematically adjusts positions so all clients converge to the same document state.
- **Document** — The persistence layer that stores document content, periodic snapshots, and the full operation log for version history and recovery.

## Operational Transformation Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client A
    participant P1 as Server
    participant P2 as Client B
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
\`\`\`
`,
    jsCode: `## Deep Dive: OT Transform Functions

The heart of OT is the **transform function** T(op1, op2) that takes two concurrent operations and returns transformed versions that can be applied in either order.

\`\`\`mermaid
graph TD
    N0["Transform rules for Insert s Insert:"]
    N1["op1 insert(pos1, text1)"]
    N2["op2 insert(pos2, text2)"]
    N3["if pos1 pos2:"]
    N4["op2' insert(pos2 len(text1), text2)"]
    N5["op1' op1 (unchanged)"]
    N6["op1' insert(pos1 len(text2), text1)"]
    N7["op2' op2 (unchanged)"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Transform rules for Insert vs Insert** — The core OT logic that handles the most common conflict: two users inserting text at or near the same position concurrently.
- **op1 insert(pos1, text1) / op2 insert(pos2, text2)** — The two concurrent insert operations from different clients, each carrying a position and the text to insert.
- **if pos1 < pos2** — The branching condition: when op1's insert is earlier in the document, op2's position must shift right to account for op1's added text.
- **op2' insert(pos2 + len(text1), text2)** — The transformed version of op2 whose position is adjusted forward by the length of op1's inserted text, preserving correct placement.
- **op1' op1 (unchanged)** — When op1 is earlier, it needs no adjustment since nothing was inserted before its position.
- **op1' insert(pos1 + len(text2), text1)** — The symmetric case: when op2 is earlier, op1's position shifts right by the length of op2's text.
- **op2' op2 (unchanged)** — When op2 is earlier, it requires no transformation since op1's insert comes after it.

---

## Deep Dive: Client-Side Buffering and State Machine

Each client maintains three states to handle the gap between local edits and server acknowledgment.

\`\`\`mermaid
graph TD
    N0["Client OT State Machine"]
    N1["SYNCHRONIZED"]
    N2["AWAITING_ACK"]
    N3["AWAITING_ACK +"]
    N4["BUFFER"]
    N5["On server ACK:"]
    N6["AWAITING -> SYNCHRONIZED (if no buffer)"]
    N7["On receiving remote op:"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client OT State Machine** — The state management system on each client that coordinates local edits with server acknowledgments to maintain consistency.
- **SYNCHRONIZED** — The idle state where the client's document matches the server's version, with no pending operations in flight.
- **AWAITING_ACK** — State entered after sending an operation to the server; the client waits for the server to acknowledge and assign a sequence number.
- **AWAITING_ACK + BUFFER** — State when the user makes additional edits while still waiting for a previous operation's acknowledgment, buffering new ops locally.
- **On server ACK** — The transition trigger when the server confirms receipt of the client's operation, allowing the client to send buffered ops or return to synchronized.
- **AWAITING -> SYNCHRONIZED (if no buffer)** — The transition back to the idle state when the server acknowledges the pending op and no further local edits are buffered.
- **On receiving remote op** — The trigger when another client's operation arrives; the client must transform it against any pending local ops before applying it to maintain consistency.

---

## Deep Dive: Snapshotting and Version History

\`\`\`mermaid
sequenceDiagram
    participant P0 as Operation Log:
    participant P1 as Snapshots:
    P0->>P1: request
    P1-->>P0: response
\`\`\`
`,
    explanation: `## Bottlenecks & Improvements
- **250K ops/sec throughput** -> Partition documents across collaboration server nodes (one doc = one node). Each node handles a few hundred active docs. Horizontal scaling by adding nodes
- **Hot documents (100+ editors)** -> Single-server bottleneck for OT ordering. Mitigate by batching ops (combine rapid keystrokes into compound ops), reducing per-op overhead 5-10x
- **Operation log growth** -> Periodic snapshotting (every 100 ops) allows compaction. Discard old ops between snapshots after retention period. Keep snapshots forever for version history
- **Offline sync complexity** -> Buffer all offline ops locally. On reconnect, send full buffer to server. Server transforms against all ops that happened during absence. May require rebasing hundreds of ops

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| OT over CRDT | Requires central server (no P2P), but simpler implementation and proven at Google Docs scale |
| Server-ordered ops | Single ordering point per document limits throughput, but guarantees convergence without complex vector clocks |
| Periodic snapshots (every 100 ops) | Storage overhead for snapshots, but enables fast document loading and version history without replaying all ops |
| Client-side buffering | More complex client state machine, but instant local edits with zero perceived latency |
| WebSocket over HTTP | Persistent connections per editor, but enables sub-200ms propagation and presence updates |

## Monitoring & Alerting
- **Operation propagation latency**: p50, p95 time from one client's edit to appearing on another client -- alert if p95 > 500ms
- **Transform queue depth**: operations waiting to be transformed per document -- alert if > 100 (sign of a hot document)
- **Snapshot lag**: time since last snapshot per active document -- alert if > 10 minutes
- **Client reconnection rate**: high reconnection rate may indicate network issues -- alert if > 5% of connections reconnect within 1 minute
`,
    timeComplexity: "Local edit: O(1) insert into local buffer. Server transform: O(n) where n is concurrent ops to transform against. Snapshot restore: O(k) where k is ops since last snapshot.",
    spaceComplexity: "~50 TB for document content. ~500 GB/day for operation logs (compacted after 30 days). Snapshots at ~50 KB each, created every 100 ops.",
    hints: [
      "Operational Transformation is the key algorithm: it mathematically transforms concurrent operations so they converge regardless of application order. The transform function T(op1, op2) is the heart of the system.",
      "The client state machine has three states: synchronized, awaiting-ack, and awaiting-ack-with-buffer. This ensures local edits feel instant while maintaining consistency with the server.",
      "Periodic snapshotting (every 100 ops) is essential for fast document loading and version history. Without snapshots, opening a document requires replaying its entire operation history.",
      "Partition documents across collaboration servers (one doc per server) for horizontal scaling. The bottleneck is the single ordering point per document, not total system throughput."
    ],
  },
];
