import { ProblemSolution } from './types';

export const sdiVol2M3: ProblemSolution[] = [
  {
    id: 9210,
    description: `## Clarifying Questions to Ask
- How many **total players** are in the game? (millions to hundreds of millions)
- How frequently do **scores update**? (every few seconds during gameplay?)
- Do we need a **global leaderboard** or per-region / per-game-mode?
- Should we show the **top N** players, a player's **exact rank**, or both?
- Are there **seasonal/time-bounded** leaderboards that reset periodically?
- Do we need **relative ranking** (e.g., "you are in the top 5%")?

## Functional Requirements
- **Update score**: When a player wins a match or earns points, update their leaderboard score
- **Top K**: Fetch the top 10 (or top N) players with their scores and ranks
- **Player rank**: Given a user ID, return their current rank and score
- **Relative rank**: Optionally show percentile ranking ("top 3%")

## Non-Functional Requirements
- **Real-time**: Score updates and rank lookups should reflect within seconds
- **Low latency**: Rank lookups in < 10ms, score updates in < 50ms
- **High throughput**: Handle millions of concurrent players with frequent updates
- **Scalability**: Support 10M to 100M+ players
- **Availability**: Favor availability over strict consistency (AP system)

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total players | 25M (5M DAU) |
| Score updates / day | 50M (avg 10 games/user/day) |
| Write QPS | 50M / 86,400 ≈ **580 QPS** (peak: ~2,500) |
| Read QPS (rank lookups) | ~5,000 QPS (peak: ~15,000) |
| Storage per player | ~100 bytes (user_id + score + metadata) |
| Total storage | 25M × 100B = **2.5 GB** (fits in memory) |
| Leaderboard data in Redis | **~2.5 GB** per sorted set |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle seasonal leaderboards?** Create a new Redis sorted set per season (e.g., \`leaderboard:season_42\`). When a season ends, persist the final sorted set to a database for historical queries, then delete or archive the Redis key. Use a configuration service to track which season is active.
- **How would you support multiple game modes?** Maintain separate sorted sets per mode (\`leaderboard:battle_royale\`, \`leaderboard:ranked\`). The API accepts a game mode parameter and routes to the appropriate sorted set.
- **What about cheating prevention?** Add a score validation layer between the game server and the leaderboard service. Flag statistical anomalies (score jumps beyond 3 standard deviations). Implement server-authoritative scoring where the game server calculates scores, not the client.
- **How would you display "top 5%" to a user?** Use ZCARD to get total players and ZREVRANK to get the player's rank. Percentile = (rank / total) * 100. Cache this computation for a few seconds since it changes slowly.
- **What if we need a friend leaderboard?** Fetch the friend list, then use ZSCORE for each friend to build a small in-memory sorted list. For users with many friends, this is still fast since ZSCORE is O(1).`,
    intuition: `A real-time leaderboard is fundamentally a **sorted set problem** — you need to maintain a dynamically updating collection where you can efficiently insert/update scores and query rank by position or by member. Redis Sorted Sets are purpose-built for this: they use a **skip list + hash table** internally, giving O(log N) for insertions, updates, and rank lookups. The key insight is that a leaderboard of even 25M players fits comfortably in memory (~2.5 GB), making an in-memory solution both feasible and optimal. The real design challenge emerges at 100M+ scale where a single Redis instance is no longer sufficient and you need sharding strategies.`,
    approach: `## Component Overview

The game server sends score updates to a **Leaderboard Service** which writes to **Redis Sorted Sets** as the primary data store. A **persistence layer** (MySQL/PostgreSQL) stores durable player records. Reads for top-K and rank lookups go directly to Redis. A **periodic sync job** reconciles Redis with the persistence DB.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/scores\` | Update | Body: \`{ userId, score, gameId }\` → Upserts score in leaderboard |
| \`GET /api/v1/leaderboard/top?limit=10\` | Read | Returns top N players with rank, score, and display name |
| \`GET /api/v1/leaderboard/rank/:userId\` | Read | Returns the player's rank, score, and surrounding players |
| \`GET /api/v1/leaderboard/percentile/:userId\` | Read | Returns percentile ranking |

## Data Model

**Redis Sorted Set** (primary leaderboard store):
- Key: \`leaderboard:global\`
- Member: \`user_id\` (string)
- Score: player's numeric score (float64)

**MySQL users table** (persistence):

| Column | Type | Notes |
|--------|------|-------|
| user_id (PK) | BIGINT | Unique player identifier |
| display_name | VARCHAR(64) | Shown on leaderboard |
| score | BIGINT | Current score (source of truth for recovery) |
| updated_at | TIMESTAMP | Last score update time |

## Core Redis Operations

| Operation | Command | Time Complexity |
|-----------|---------|-----------------|
| Set/update score | \`ZADD leaderboard:global <score> <userId>\` | O(log N) |
| Get rank (0-indexed, descending) | \`ZREVRANK leaderboard:global <userId>\` | O(log N) |
| Get top 10 | \`ZREVRANGE leaderboard:global 0 9 WITHSCORES\` | O(log N + K) |
| Get player's score | \`ZSCORE leaderboard:global <userId>\` | O(1) |
| Total players | \`ZCARD leaderboard:global\` | O(1) |
| Get surrounding players | \`ZREVRANGE leaderboard:global (rank-5) (rank+5) WITHSCORES\` | O(log N + K) |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Game Server (Score Event)"]
    N1["Load Balancer"]
    N2["Leaderboard Service"]
    N3["Redis Cluster (Sorted Sets)"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Game Server** — The source of score events, emitting updates whenever a player finishes a match or earns points.
- **Load Balancer** — Distributes incoming score update requests across multiple Leaderboard Service instances to handle peak traffic.
- **Leaderboard Service** — The application layer that processes score updates and rank queries, translating API calls into Redis commands.
- **Redis Cluster (Sorted Sets)** — The primary data store using sorted sets for O(log N) score updates and rank lookups, keeping the entire leaderboard in memory for sub-millisecond access.

## Score Update Flow

\`\`\`mermaid
graph TD
    N0["Client (Checkout)"]
    N1["API Gateway"]
    N2["Payment Service"]
    N3["Risk Engine"]
    N4["PSP Integration"]
    N5["Ledger Service"]
    N6["PSP (Stripe) External"]
    N7[("Ledger DB (Append-only)")]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N2 --> N4
    N2 --> N5
    N4 --> N6
    N5 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client (Checkout)** — The user-facing application initiating a payment during the checkout process.
- **API Gateway** — Handles authentication, TLS termination, and rate limiting before forwarding requests to internal services.
- **Payment Service** — The central orchestrator that coordinates fraud checks, PSP charges, and ledger recording for each payment.
- **Risk Engine** — Evaluates transactions for fraud using velocity checks, geo-mismatch detection, and ML-based scoring before authorizing the charge.
- **PSP Integration** — An adapter layer that communicates with external payment service providers, handling tokenization, charge APIs, and webhook callbacks.
- **Ledger Service** — Records every financial transaction using double-entry bookkeeping to maintain a complete, auditable trail of money movement.
- **PSP (Stripe) External** — The third-party payment service provider that actually processes the card charge and returns a transaction reference.
- **Ledger DB (Append-only)** — An immutable, append-only database storing all ledger entries, ensuring no financial record can be altered after creation.

## Rank Lookup Flow

\`\`\`mermaid
graph TD
    N0["Client"]
    N1["API Gateway (Auth, TLS)"]
    N2["Transfer API"]
    N3["Command Service"]
    N4[("Event Store (Append-only)")]
    N5["Event Processor"]
    N6["Balance View (Materialized)"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client** — The end user requesting a rank lookup or leaderboard view.
- **API Gateway (Auth, TLS)** — Authenticates the request and terminates TLS before routing to internal services.
- **Transfer API** — Validates the incoming rank query and deduplicates requests using idempotency keys.
- **Command Service** — Processes write commands by creating domain events and appending them to the event store.
- **Event Store (Append-only)** — An immutable log of all state-changing events, partitioned by entity ID for ordered replay and audit.
- **Event Processor** — Consumes events from the store and updates downstream materialized views to keep read models current.
- **Balance View (Materialized)** — A pre-computed, read-optimized projection of current state derived from replaying events, enabling fast O(1) lookups.
`,
    jsCode: `## Deep Dive: Redis Sorted Set Internals

Redis Sorted Sets are backed by two data structures working together:

\`\`\`mermaid
graph TD
    N0["Client A (Broker/HFT)"]
    N1["Gateway (Auth)"]
    N2["Sequencer"]
    N3["Client B (Retail)"]
    N4["Matching Engine (Single-threaded)"]
    N5["Market Data Publisher"]
    N6["Reporting"]
    N0 --> N1
    N3 --> N1
    N1 --> N2
    N2 --> N4
    N4 --> N5
    N4 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Skip list** provides sorted ordering for range queries and rank operations in O(log N). The **hash table** provides O(1) lookups from member to score (used by ZSCORE). This dual-structure design is why Redis sorted sets are ideal for leaderboards.

---

## Deep Dive: Sharding for 100M+ Players

When a single Redis instance cannot hold the entire leaderboard, we need to shard. There are two main approaches:

### Approach A: Score-Range Sharding

\`\`\`mermaid
graph TD
    R["Router"]
    S1["Shard 1: Scores 0-999"]
    S2["Shard 2: Scores 1000-4999"]
    S3["Shard 3: Scores 5000-9999"]
    S4["Shard 4: Scores 10000+"]
    R --> S1
    R --> S2
    R --> S3
    R --> S4
    style R fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style S1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style S2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style S3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style S4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Pros**: Global rank can be computed by summing counts from higher shards
**Cons**: Uneven data distribution if scores cluster; rebalancing is complex

### Approach B: Hash Partitioning + Segment Tree

\`\`\`mermaid
graph TD
    Root["Root: Total count"]
    L["Left: Scores 0-4999"]
    R["Right: Scores 5000-9999"]
    LL["0-2499"]
    LRng["2500-4999"]
    RLng["5000-7499"]
    RR["7500-9999"]
    Root --> L
    Root --> R
    L --> LL
    L --> LRng
    R --> RLng
    R --> RR
    style Root fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style L fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style R fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style LL fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style LRng fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style RLng fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style RR fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Pros**: Even distribution, efficient rank queries O(log S) where S = score range
**Cons**: More complex to implement; requires atomic count updates

---

## Deep Dive: Handling Ties and Score Composition

When two players have the same score, we need a tiebreaker. Common strategies:

\`\`\`
Composite Score = (actual_score * 10^10) + (MAX_TIMESTAMP - update_timestamp)

Example:
  Player A: score=5000, updated at T=1000  -> 50000009999999000
  Player B: score=5000, updated at T=1200  -> 50000009999998800

  Player A ranks higher (achieved score first)
\`\`\`

This encodes both the score and the tiebreaker into a single float64, keeping all operations as standard Redis sorted set commands.

---

## Deep Dive: Seasonal / Time-Bounded Leaderboards

\`\`\`mermaid
graph TD
    N0["Season Starts"]
    N1["Create new Redis sorted set"]
    N2["Players submit scores"]
    N3["Season Ends"]
    N4["Snapshot final rankings to DB"]
    N5["Archive Redis key"]
    N6["New season begins"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N1
    style N0 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Season Starts** — The trigger event that initiates a new competitive period, typically on a fixed schedule (e.g., monthly or quarterly).
- **Create new Redis sorted set** — Provisions a fresh sorted set key (e.g., \\\`leaderboard:season_42\\\`) so the new season starts with a clean slate.
- **Players submit scores** — The active gameplay phase where score updates flow into the current season's sorted set via ZADD.
- **Season Ends** — The cutoff event that freezes the leaderboard, preventing further score updates for this season.
- **Snapshot final rankings to DB** — Persists the complete sorted set to a durable database (MySQL/PostgreSQL) so historical rankings can be queried later.
- **Archive Redis key** — Deletes or expires the sorted set from Redis to free memory, since the data is now safely stored in the persistence layer.
- **New season begins** — Loops back to create a fresh sorted set, restarting the cycle for the next competitive period.
`,
    explanation: `## Bottlenecks & Improvements
- **Single Redis instance limit** → At ~25M members, a single sorted set works fine (~2.5 GB). Beyond 100M, use score-range sharding or a segment tree approach
- **Redis failover** → Use Redis Sentinel or Redis Cluster with replicas. On primary failure, a replica promotes automatically. Leaderboard can be rebuilt from the persistence DB if needed
- **Write amplification** → If a player's score updates multiple times per game, batch updates: accumulate locally on the game server and flush to the leaderboard service every N seconds
- **Hot partition in sharded setup** → If most players cluster around a common score range, that shard becomes hot. Monitor shard sizes and split/merge dynamically

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Redis Sorted Set over SQL ORDER BY | Lose ACID durability (mitigated by async persistence), gain O(log N) rank lookups vs O(N log N) SQL sorts |
| In-memory over disk-based | Limited by RAM size, but leaderboard data is small enough (~2.5 GB for 25M users) |
| Async DB persistence over sync writes | Small window where Redis and DB are inconsistent, but much lower write latency |
| Score-range sharding over hash sharding | More complex rebalancing, but enables global rank computation without scanning all shards |
| Composite score for tiebreaking over secondary sort | Slightly less readable scores, but avoids custom comparator logic |

## Monitoring & Alerting
- **Redis memory usage**: Alert if approaching instance memory limit
- **Sorted set cardinality**: Track ZCARD to detect abnormal growth
- **Command latency**: Monitor p99 latency of ZADD, ZREVRANK operations
- **Replication lag**: Alert if Redis replica falls behind primary
- **Score anomaly detection**: Flag users with statistically impossible score jumps
`,
    timeComplexity: "N/A",
    spaceComplexity: "N/A",
    hints: [
      "Redis Sorted Sets are the go-to data structure for leaderboards — mention ZADD, ZREVRANK, ZREVRANGE early to show you know the right tool. Avoid proposing SQL ORDER BY for real-time ranking at scale.",
      "A common mistake is ignoring tiebreaking. If two players have the same score, you need a deterministic secondary sort. Encoding the timestamp into a composite score is the cleanest approach.",
      "For scale beyond 100M players, do not just say 'shard Redis' — you need to explain how global rank is computed across shards. Score-range partitioning allows rank aggregation; hash partitioning does not.",
      "Do not forget persistence. Redis is in-memory and can lose data. Always pair it with an async write to a durable store (MySQL/PostgreSQL) so the leaderboard can be rebuilt after a failure."
    ],
  },
  {
    id: 9211,
    description: `## Clarifying Questions to Ask
- What **payment methods** do we support? (credit card, debit, bank transfer, digital wallets)
- What is the **transaction volume**? How many payments per second?
- Do we need to support **multiple currencies**?
- What are the **regulatory requirements**? (PCI DSS compliance, regional regulations)
- Do we need a **refund** flow?
- Are we building the PSP itself or **integrating with** existing PSPs (Stripe, PayPal)?

## Functional Requirements
- Accept a payment request from a buyer to pay a seller/merchant
- Process the payment through a **Payment Service Provider** (PSP) like Stripe
- Record every transaction in a **ledger** using double-entry bookkeeping
- Support **refunds** and payment status queries
- Guarantee **exactly-once** payment processing (no double charges)

## Non-Functional Requirements
- **Reliability**: Payments must never be lost — favor consistency over availability (CP system)
- **Exactly-once semantics**: Idempotency keys prevent duplicate charges even on retries
- **Auditability**: Complete audit trail for every money movement
- **Security**: PCI DSS compliance, encryption of card data, tokenization
- **Low latency**: Payment processing < 2 seconds end-to-end

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Transactions / day | 1M |
| Peak TPS | ~50 TPS (bursty during sales events, up to 500) |
| Average transaction size | $50 |
| Daily volume | $50M |
| Ledger entries / day | 2M (double-entry: 2 entries per transaction) |
| Storage per ledger entry | ~500 bytes |
| Ledger storage / year | 2M × 365 × 500B ≈ **365 GB/year** |
`,
    examples: `## Follow-Up Discussion Points
- **How do you handle partial failures?** If the PSP charges the card but our system crashes before recording it, the reconciliation process catches the discrepancy. The PSP settlement file shows the charge; our ledger does not. The reconciliation job flags it for manual review or auto-corrects.
- **How would you support multiple PSPs?** Use a PSP router/adapter pattern. Each PSP has an adapter implementing a common interface. The router selects the PSP based on payment method, currency, success rate, or cost. If one PSP is down, failover to another.
- **How do you handle currency conversion?** Integrate with a forex rate service. Lock the exchange rate at payment initiation time and store it with the transaction. Use the locked rate for the entire flow to avoid discrepancies.
- **What about PCI compliance?** Never store raw card numbers. Use PSP's hosted checkout page or tokenization API. Our servers never see card data — the client sends it directly to the PSP, which returns a token. We only store the token.
- **How do you prevent fraud?** Add a Risk Engine service between the payment API and PSP call. It runs rules (velocity checks, geo mismatch, amount anomaly) and ML models. High-risk payments require additional verification (3DS, OTP).`,
    intuition: `A payment system is an **orchestration engine** that coordinates money movement across multiple external services while maintaining an ironclad audit trail. The central design challenge is not throughput (payments are relatively low QPS compared to social media) but **correctness**: you must guarantee that every payment is processed exactly once, every dollar is accounted for, and the system can recover gracefully from any partial failure. The idempotency key is the linchpin — it transforms an unreliable network of services into a reliable payment pipeline.`,
    approach: `## Component Overview

A **Payment Service** acts as the orchestrator. It receives payment requests, validates them, calls a **Risk Engine** for fraud checks, delegates to a **PSP (Payment Service Provider)** for actual card charging, and records everything in a **Ledger Service** using double-entry bookkeeping. A **Wallet Service** optionally manages merchant balances. A **Reconciliation Service** compares internal records against PSP settlement files.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/payments\` | Create | Body: \`{ orderId, amount, currency, paymentMethod, idempotencyKey }\` → Initiates payment |
| \`GET /api/v1/payments/:paymentId\` | Read | Returns payment status and details |
| \`POST /api/v1/payments/:paymentId/refund\` | Refund | Body: \`{ amount?, reason }\` → Initiates full or partial refund |
| \`GET /api/v1/payments/:paymentId/status\` | Status | Returns current state in the payment state machine |

## Data Model

**payments table**:

| Column | Type | Notes |
|--------|------|-------|
| payment_id (PK) | UUID | Globally unique payment identifier |
| idempotency_key | VARCHAR(64) | UNIQUE — prevents duplicate processing |
| order_id | BIGINT | Reference to the order |
| buyer_id | BIGINT | Who is paying |
| amount | DECIMAL(19,4) | Payment amount (4 decimal places for precision) |
| currency | CHAR(3) | ISO 4217 currency code (USD, EUR) |
| status | ENUM | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED |
| psp_reference | VARCHAR(128) | PSP's transaction ID |
| created_at | TIMESTAMP | Payment initiation time |
| updated_at | TIMESTAMP | Last status change |

**ledger_entries table** (double-entry bookkeeping):

| Column | Type | Notes |
|--------|------|-------|
| entry_id (PK) | BIGINT | Auto-increment |
| payment_id (FK) | UUID | Links to payment |
| account_id | BIGINT | Debit or credit account |
| entry_type | ENUM | DEBIT or CREDIT |
| amount | DECIMAL(19,4) | Always positive |
| created_at | TIMESTAMP | Entry creation time |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    Client["Client (Checkout)"]
    GW["API Gateway (Auth, Rate Limit)"]
    Pay["Payment Service (Orchestrator)"]
    Risk["Risk Engine (Fraud checks)<br/>Velocity, Geo mismatch, ML scoring"]
    PSPInt["PSP Integration (Stripe/PayPal/Adyen)<br/>Hosted checkout, Tokenization, Charge API, Webhooks"]
    Ledger["Ledger Service (Double-entry bookkeeping)<br/>Every txn has a DEBIT and CREDIT entry"]
    PSP["PSP (Stripe, etc.) External service"]
    LedgerDB["Ledger DB (Append-only)"]

    Client --> GW
    GW --> Pay
    Pay --> Risk
    Pay --> PSPInt
    Pay --> Ledger
    PSPInt --> PSP
    Ledger --> LedgerDB

    style Client fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style Pay fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Risk fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style PSPInt fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Ledger fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style PSP fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style LedgerDB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client (Checkout)** — The buyer's application initiating a payment at checkout time.
- **API Gateway (Auth, Rate Limit)** — Authenticates requests, enforces rate limits, and routes traffic to the payment service.
- **Payment Service (Orchestrator)** — The central coordinator that drives the payment workflow: validates input, checks for fraud, charges via PSP, and records in the ledger.
- **Risk Engine** — Runs fraud detection rules (velocity checks, geo-mismatch, ML scoring) and approves or denies the transaction before any charge is made.
- **PSP Integration** — Abstracts communication with external payment providers, handling hosted checkout, tokenization, charge API calls, and webhook processing.
- **Ledger Service** — Writes double-entry bookkeeping records so every debit has a matching credit, ensuring the audit trail is always balanced.
- **PSP (Stripe, etc.)** — The external payment service provider that actually moves money by charging the card and returning a reference ID.
- **Ledger DB (Append-only)** — Stores immutable ledger entries that can never be modified or deleted, providing a tamper-proof financial record.

## Payment Processing Flow

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant PS as Payment Service
    participant RE as Risk Engine
    participant PSP as PSP
    participant L as Ledger

    C->>PS: POST /payments {idempotencyKey}
    Note over PS: Check idempotency key in DB<br/>(duplicate? return prev)
    PS->>RE: Risk check
    RE-->>PS: APPROVE / DENY
    PS->>PSP: Charge card
    PSP-->>PS: psp_ref: ch_abc123
    PS->>L: Record double-entry
    L-->>PS: ACK
    PS-->>C: {paymentId, status: OK}
\`\`\`

## Payment State Machine

\`\`\`mermaid
graph TD
    N0["PENDING"]
    N1["DENIED"]
    N2["COMPLETED"]
    N3["FAILED"]
    N4["REFUNDED"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N2 --> N4
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **PENDING** — The initial state when a payment request is received but processing has not yet begun.
- **DENIED** — The terminal state when the risk engine rejects the transaction due to fraud signals or policy violations.
- **COMPLETED** — The terminal state when the PSP successfully charges the card and the ledger records the transaction.
- **FAILED** — The terminal state when the PSP charge fails due to insufficient funds, expired card, or network errors.
- **REFUNDED** — The terminal state when a completed payment is reversed, either fully or partially, and the ledger records the reversal entries.
`,
    jsCode: `## Deep Dive: Idempotency Implementation

Idempotency is the most critical mechanism in the payment system. The client generates a unique idempotency key per payment attempt and sends it with the request. If the same key is sent again (due to retry, network timeout, user double-click), the system returns the original result without re-processing.

\`\`\`mermaid
graph TD
    N0["Client sends request with idempotency_key"]
    N1["Payment Service"]
    N2{"Key exists in DB?"}
    N3["Return cached result"]
    N4["Process payment"]
    N5["Store result with key"]
    N6["Return new result"]
    N0 --> N1
    N1 --> N2
    N2 -->|Yes| N3
    N2 -->|No| N4
    N4 --> N5
    N5 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client sends request with idempotency_key** — The client generates a unique key (typically a UUID) for each payment attempt and includes it in the request header or body.
- **Payment Service** — Receives the request and initiates the idempotency check before performing any side effects.
- **Key exists in DB?** — A decision point that queries the idempotency key store to determine whether this request has been processed before.
- **Return cached result** — If the key is found, the previously stored response is returned immediately without re-executing the payment, preventing double charges.
- **Process payment** — If the key is new, the full payment workflow (risk check, PSP charge, ledger entry) executes normally.
- **Store result with key** — After processing, the response is persisted alongside the idempotency key so future duplicates can be short-circuited.
- **Return new result** — The freshly computed payment result is sent back to the client.

---

## Deep Dive: Double-Entry Bookkeeping

Every payment creates exactly two ledger entries that must sum to zero. This is a fundamental accounting principle that makes errors detectable.

\`\`\`mermaid
graph TD
    N0["Double-Entry Ledger Example"]
    N1["entry_id"]
    N2["account"]
    N3["type"]
    N4["amount"]
    N5["1001 1002"]
    N6["buyer seller"]
    N7["DEBIT CREDIT"]
    N8["100.00 100.00"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N1 --> N5
    N2 --> N6
    N3 --> N7
    N4 --> N8
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Double-Entry Ledger Example** — The root node representing a single payment transaction recorded using double-entry bookkeeping principles.
- **entry_id** — The unique identifier column for each ledger row, enabling precise lookups and audit references.
- **account** — The column identifying which account (buyer or seller) is affected by the entry.
- **type** — The column indicating whether the entry is a DEBIT (money leaving an account) or CREDIT (money entering an account).
- **amount** — The column storing the monetary value, which must be identical for both the debit and credit entries to maintain the balanced ledger invariant.
- **1001 / 1002** — The actual entry IDs for this transaction, showing that one payment always produces exactly two ledger rows.
- **buyer / seller** — The accounts involved, where the buyer's account is debited and the seller's account is credited.
- **DEBIT / CREDIT** — The entry types that must always appear in pairs, ensuring every dollar debited from one account is credited to another.
- **100.00 / 100.00** — The matching amounts confirming the ledger is balanced: the sum of all debits equals the sum of all credits.

---

## Deep Dive: PSP Integration Patterns

\`\`\`mermaid
graph TD
    N0["PSP Integration Options"]
    N1["Client"]
    N2["PSP Page"]
    N3["PSP API"]
    N4["Our Payment Service"]
    N5["Client (JS SDK)"]
    N6["PSP (card data)"]
    N7["Token: tok_123"]
    N8["Our Payment Service uses token"]
    N0 --> N1
    N0 --> N5
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N5 --> N6
    N6 --> N7
    N7 --> N8
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **PSP Integration Options** — The root node representing the two primary approaches to integrating with a payment service provider.
- **Client** — In the hosted checkout flow, the client is redirected away from your site to the PSP's own payment page.
- **PSP Page** — The PSP's hosted checkout page where the user enters card details directly, keeping your servers out of PCI scope entirely.
- **PSP API** — The PSP's backend that processes the payment after collecting card details on the hosted page, then notifies your service via callback.
- **Our Payment Service** — In the hosted flow, your service receives a webhook or redirect callback from the PSP with the payment result.
- **Client (JS SDK)** — In the tokenization flow, the client uses the PSP's JavaScript SDK to capture card details in-browser without them touching your servers.
- **PSP (card data)** — The PSP receives raw card data directly from the client-side SDK for tokenization.
- **Token: tok_123** — The opaque token returned by the PSP representing the card, which can be safely stored and transmitted without PCI implications.
- **Our Payment Service uses token** — Your backend charges the card by sending the token (not raw card data) to the PSP's charge API.

---

## Deep Dive: Reconciliation Process

\`\`\`mermaid
graph TD
    N0["Daily Reconciliation"]
    N1["Internal Ledger"]
    N2["PSP Settlement File"]
    N3["Reconciliation Service"]
    N4["Match (OK)"]
    N5["Missing (Alert)"]
    N6["Mismatch (Review)"]
    N1 --> N3
    N2 --> N3
    N3 --> N4
    N3 --> N5
    N3 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Daily Reconciliation** — The scheduled batch process that runs (typically off-peak) to verify internal records match external PSP records.
- **Internal Ledger** — Our system's double-entry bookkeeping records of all processed payments.
- **PSP Settlement File** — The external file provided by the payment service provider listing all charges, refunds, and settlements they processed.
- **Reconciliation Service** — Compares each internal ledger entry against the PSP settlement file to detect discrepancies.
- **Match (OK)** — Entries that exist in both systems with identical amounts, confirming the payment was processed correctly.
- **Missing (Alert)** — Entries found in one system but not the other, indicating a lost payment or unrecorded charge that requires immediate investigation.
- **Mismatch (Review)** — Entries present in both systems but with differing amounts or statuses, flagged for manual review by the finance team.
`,
    explanation: `## Bottlenecks & Improvements
- **PSP as single point of failure** → Integrate with multiple PSPs. Route payments through a healthy PSP. Implement circuit breakers with automatic failover
- **Idempotency key storage growth** → Expire old idempotency records after 24-72 hours. Use a unique index on (idempotency_key) for efficient lookups
- **Ledger write throughput** → Ledger is append-only, which is naturally high-throughput. Partition by payment_id for parallelism. Consider a dedicated ledger database (e.g., Amazon QLDB)
- **Reconciliation at scale** → Run reconciliation as a batch job during off-peak hours. Use MapReduce or Spark for large settlement files. Flag exceptions for human review

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| CP over AP (consistency over availability) | Payments may fail/timeout rather than double-charge; this is the correct trade-off for money |
| Idempotency key at application level | Adds storage and lookup overhead per request, but prevents the catastrophic case of double charging |
| Double-entry bookkeeping over simple balance tracking | More storage (2x entries), but self-validating and auditable |
| Hosted checkout over direct card handling | Lose some UX control, but drastically simplify PCI compliance (SAQ-A vs SAQ-D) |
| Async reconciliation over real-time verification | Small window of inconsistency, but avoids blocking payment flow on settlement checks |

## Monitoring & Alerting
- **Payment success rate**: Alert if drops below 95% (indicates PSP issues or bugs)
- **Reconciliation mismatches**: Any non-zero count should trigger an alert
- **Ledger balance invariant**: Verify SUM(debits) = SUM(credits) continuously
- **PSP latency**: p99 of PSP API calls; alert if > 5 seconds
- **Idempotency key collisions**: Monitor for unexpected key reuse patterns (possible bug or attack)
`,
    timeComplexity: "N/A",
    spaceComplexity: "N/A",
    hints: [
      "Lead with the idempotency key — it is the single most important concept in payment system design. Without it, retries can double-charge users, which is the worst possible outcome.",
      "Always use double-entry bookkeeping for the ledger, not simple balance updates. Every credit must have a matching debit. This makes reconciliation trivial and errors self-evident.",
      "Never store raw credit card numbers on your servers. Use the PSP's tokenization or hosted checkout page. Mention PCI DSS compliance early — it shows you understand real-world payment constraints.",
      "Do not forget the reconciliation process. The PSP sends settlement files that must match your internal ledger. Discrepancies happen (network failures, race conditions) and must be detected and resolved."
    ],
  },
  {
    id: 9212,
    description: `## Clarifying Questions to Ask
- What **operations** does the wallet support? (deposit, withdraw, transfer between users)
- What is the **transaction volume**? How many transfers per second?
- Do we need to support **multiple currencies** within a single wallet?
- What is the **consistency requirement**? (zero tolerance for balance errors)
- Do we need a **complete audit trail** of every transaction?
- Is there a **maximum balance** or transaction limit?

## Functional Requirements
- **Deposit**: Add funds to a user's wallet from an external source
- **Withdraw**: Remove funds from a wallet to an external destination
- **Transfer**: Move money from one user's wallet to another user's wallet
- **Balance query**: Retrieve the current balance of a wallet
- **Transaction history**: View a list of all past transactions

## Non-Functional Requirements
- **Strong consistency**: Balance must never go negative; concurrent operations must produce correct results
- **Auditability**: Every balance change must be traceable and reproducible
- **High availability**: Wallet service should be available 99.99% of the time
- **Durability**: No transaction can be lost once confirmed
- **Low latency**: Balance queries < 5ms, transfers < 200ms

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total wallet accounts | 50M |
| Active wallets (DAU) | 5M |
| Transfers / day | 20M |
| Peak TPS | ~1,000 |
| Average transfer amount | $25 |
| Daily transfer volume | $500M |
| Event log entries / day | 40M (2 events per transfer: debit + credit) |
| Event storage per entry | ~200 bytes |
| Event storage / year | 40M × 365 × 200B ≈ **2.9 TB/year** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle concurrent transfers to the same wallet?** With event sourcing, all events are appended to an ordered log. The balance materialized view processes events sequentially per wallet, so concurrency is resolved by event ordering. With a traditional DB approach, use SELECT FOR UPDATE or optimistic locking with version numbers.
- **How do you reproduce a historical balance?** With event sourcing, replay all events up to the target timestamp. With periodic snapshots, find the nearest snapshot before the target time and replay events from there. This is one of event sourcing's biggest advantages.
- **What if the event store becomes a bottleneck?** Partition the event log by wallet_id. Each partition is an independent ordered log. Since transfers only affect two wallets, cross-partition coordination is minimal (use a saga or two-phase approach).
- **How do you handle failed transfers?** Use the Saga pattern: debit wallet A (compensating action: re-credit A), then credit wallet B. If the credit fails, execute the compensating action to reverse the debit. The saga coordinator tracks the state.
- **Should we use event sourcing or traditional CRUD?** Event sourcing gives you a perfect audit trail and ability to rebuild state, but adds complexity. For a digital wallet where auditability is a regulatory requirement, event sourcing is often worth the trade-off.`,
    intuition: `A digital wallet is fundamentally an **accounting system** where the balance is a derived value — it is the sum of all credits minus all debits. The deepest design insight is to use **event sourcing**: instead of storing a mutable balance field that gets updated, store an immutable, append-only log of every transaction event. The current balance is a materialized view computed by replaying these events. This approach gives you a perfect audit trail, the ability to reproduce any historical balance, and natural protection against data corruption — if the balance ever seems wrong, you can recompute it from the event log.`,
    approach: `## Component Overview

A **Transfer API** receives requests and validates them. A **Command Service** creates events and appends them to an **Event Store** (append-only log). An **Event Processor** consumes events and updates a **Balance Materialized View** for fast reads. A **Query Service** reads from the materialized view. This follows the **CQRS** (Command Query Responsibility Segregation) pattern.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/wallets/:id/deposit\` | Deposit | Body: \`{ amount, currency, source, idempotencyKey }\` |
| \`POST /api/v1/wallets/:id/withdraw\` | Withdraw | Body: \`{ amount, currency, destination, idempotencyKey }\` |
| \`POST /api/v1/transfers\` | Transfer | Body: \`{ fromWalletId, toWalletId, amount, currency, idempotencyKey }\` |
| \`GET /api/v1/wallets/:id/balance\` | Read | Returns current balance and last updated timestamp |
| \`GET /api/v1/wallets/:id/transactions\` | History | Paginated transaction history |

## Data Model

**Event Store** (append-only, immutable):

| Column | Type | Notes |
|--------|------|-------|
| event_id (PK) | BIGINT | Auto-increment, globally ordered |
| wallet_id | BIGINT | Partition key |
| event_type | ENUM | CREDIT, DEBIT |
| amount | DECIMAL(19,4) | Always positive |
| transfer_id | UUID | Groups debit + credit events of one transfer |
| idempotency_key | VARCHAR(64) | Prevents duplicate event creation |
| created_at | TIMESTAMP | Event timestamp |
| metadata | JSONB | Additional context (source, reason) |

**Balance Materialized View** (read-optimized):

| Column | Type | Notes |
|--------|------|-------|
| wallet_id (PK) | BIGINT | One row per wallet |
| balance | DECIMAL(19,4) | Current computed balance |
| last_event_id | BIGINT | Last processed event (for resumption) |
| version | BIGINT | Optimistic concurrency control |
| updated_at | TIMESTAMP | Last balance update |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    Client["Client"]
    GW["API Gateway (Auth, TLS)"]
    API["Transfer API (Validate, Dedup)"]
    Cmd["Command Service (Create events)"]
    Store["Event Store (Append-only log, partitioned by wallet_id)"]
    Proc["Event Processor (Consumes events, updates balance)"]
    Balance["Balance View (Materialized, wallet_id -> balance)"]
    Query["Query Service (Read balance, tx history)"]

    Client --> GW
    GW --> API
    API --> Cmd
    Cmd --> Store
    Store --> Proc
    Proc --> Balance
    Proc --> Query

    style Client fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style API fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Cmd fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Store fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Proc fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Balance fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Query fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client** — The end user initiating deposits, withdrawals, transfers, or balance queries.
- **API Gateway (Auth, TLS)** — Handles authentication, TLS termination, and request routing to protect internal services.
- **Transfer API (Validate, Dedup)** — Validates transfer requests and deduplicates using idempotency keys to prevent double-processing.
- **Command Service (Create events)** — Translates validated commands into domain events and appends them to the event store, enforcing business rules like sufficient balance.
- **Event Store (Append-only log)** — The immutable, append-only source of truth partitioned by wallet_id, storing every credit and debit event for full auditability and replay.
- **Event Processor** — Asynchronously consumes events from the store and updates the materialized balance view, decoupling writes from reads.
- **Balance View (Materialized)** — A read-optimized projection mapping wallet_id to current balance, enabling sub-millisecond balance lookups without replaying events.
- **Query Service** — Serves read requests (balance checks, transaction history) from the materialized view, scaled independently from the write path.

## Transfer Flow (Event Sourcing)

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant API as Transfer API
    participant Cmd as Command Service
    participant ES as Event Store
    participant EP as Event Processor
    participant BV as Balance View

    C->>API: POST /transfer {from, to, amt}
    API->>Cmd: Validate + check balance
    Cmd->>ES: Append DEBIT event (wallet A)
    Cmd->>ES: Append CREDIT event (wallet B)
    ES-->>Cmd: ACK
    ES->>EP: Process DEBIT
    EP->>BV: A.balance -= amt
    ES->>EP: Process CREDIT
    EP->>BV: B.balance += amt
    API-->>C: {transferId, status: OK}
\`\`\`

## Saga Pattern for Distributed Transfers

\`\`\`mermaid
graph TD
    N0["Saga: Transfer $50"]
    N1["saga_id"]
    N2["step"]
    N3["status"]
    N4["saga_001"]
    N5["DEBIT_A CREDIT_B"]
    N6["COMPLETED"]
    N7["COMPENSATING FAILED"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N1 --> N4
    N2 --> N5
    N3 --> N6
    N4 --> N7
    N5 --> N7
    N6 --> N7
    style N0 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Saga: Transfer $50** — The root node representing a distributed transfer orchestrated by the saga pattern, which breaks the operation into compensatable steps.
- **saga_id** — The unique identifier for this saga instance, used to track progress and enable recovery if the process fails midway.
- **step** — The column tracking which step of the saga is currently executing (e.g., DEBIT_A followed by CREDIT_B).
- **status** — The column recording the current state of the saga (COMPLETED if all steps succeed, COMPENSATING if a rollback is in progress).
- **saga_001** — The actual saga instance ID for this specific $50 transfer.
- **DEBIT_A / CREDIT_B** — The two ordered steps: first debit wallet A, then credit wallet B. If CREDIT_B fails, DEBIT_A is compensated by re-crediting wallet A.
- **COMPLETED** — The happy-path outcome indicating both the debit and credit steps finished successfully.
- **COMPENSATING / FAILED** — The failure-path outcomes where a step failed and the saga coordinator is executing compensating actions to undo partial changes.
`,
    jsCode: `## Deep Dive: Event Sourcing vs Traditional CRUD

\`\`\`mermaid
graph TD
    N0["Traditional CRUD"]
    N1["wallet_id"]
    N2["balance"]
    N3["A B"]
    N4["500 200"]
    N5["Event Sourcing"]
    N6["id"]
    N7["wallet"]
    N8["type"]
    N9["amount"]
    N10["1 2"]
    N11["CREDIT"]
    N12["1000 500"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N5 --> N6
    N5 --> N7
    N5 --> N8
    N5 --> N9
    N3 --> N10
    N8 --> N11
    N9 --> N12
    style N0 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N10 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N11 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N12 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Traditional CRUD** — The conventional approach where a mutable balance field is updated in place with each transaction, losing the history of how the balance was derived.
- **wallet_id / balance** — The CRUD schema columns, storing only the current state (wallet A has $500, wallet B has $200) with no record of past changes.
- **A / B and 500 / 200** — Example wallet data showing final balances, but providing no way to determine how those balances were reached.
- **Event Sourcing** — The alternative approach where every state change is stored as an immutable event, and the current balance is derived by replaying all events.
- **id / wallet / type / amount** — The event store schema columns, capturing every individual transaction with its context (which wallet, what type, how much).
- **CREDIT** — The event type indicating money was added to a wallet, with each event recorded as an immutable fact that can never be modified.
- **1000 / 500** — Example event amounts showing the full history: a $1000 credit followed by a $500 credit, which can be replayed to derive the current balance.

---

## Deep Dive: CQRS Pattern (Command Query Responsibility Segregation)

\`\`\`mermaid
graph TD
    N0["CQRS Architecture"]
    N1["Transfer Request"]
    N2["Balance Query"]
    N3["Command Service"]
    N4["Query Service"]
    N5[("Event Store")]
    N6["Materialized View"]
    N1 --> N3
    N2 --> N4
    N3 --> N5
    N5 --> N6
    N4 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Transfer Request** — A write operation (deposit, withdraw, or transfer) entering the system through the command side.
- **Balance Query** — A read operation requesting current balance or transaction history through the query side.
- **Command Service** — Handles all write operations by validating business rules and appending events to the event store, optimized for write throughput.
- **Query Service** — Handles all read operations by querying the materialized view, optimized for low-latency reads and scaled independently from writes.
- **Event Store** — The persistent, append-only log of all domain events that serves as the single source of truth for the system.
- **Materialized View** — A denormalized, read-optimized projection of current state (balances) derived from the event store, updated asynchronously by the event processor.

---

## Deep Dive: Handling Snapshots for Performance

Replaying all events from the beginning to compute balance is expensive. Use periodic snapshots to limit replay.

\`\`\`mermaid
graph TD
    N0["Snapshot at Event #1000"]
    N1["Balance: $500"]
    N2["Event #1001: +$50"]
    N3["Event #1002: -$20"]
    N4["Event #1003: +$100"]
    N5["Current Balance: $630"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    style N0 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Snapshot at Event #1000** — A checkpoint that captures the wallet's computed balance at a specific event, so future replays can start here instead of from event #1.
- **Balance: $500** — The snapshotted balance value at event #1000, serving as the starting point for incremental replay.
- **Event #1001: +$50** — The first event after the snapshot, applied incrementally to the snapshotted balance rather than replaying all 1001 events.
- **Event #1002: -$20** — A subsequent debit event applied on top of the running total.
- **Event #1003: +$100** — Another credit event, demonstrating that only 3 events need replaying instead of all 1003.
- **Current Balance: $630** — The final computed balance ($500 + $50 - $20 + $100), derived by replaying only the events since the last snapshot.

---

## Deep Dive: Concurrent Transfer Safety

\`\`\`mermaid
graph TD
    N0["Read balance: $500, version=5"]
    N1["Compute new balance: $400"]
    N2{"UPDATE WHERE version=5"}
    N3["Success: version=6"]
    N4["Conflict: 0 rows affected"]
    N5["Retry from read"]
    N0 --> N1
    N1 --> N2
    N2 -->|1 row affected| N3
    N2 -->|0 rows affected| N4
    N4 --> N5
    N5 --> N0
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Read balance: $500, version=5** — The first step of optimistic locking, where the current balance and its version number are read together.
- **Compute new balance: $400** — The application calculates the new balance locally (e.g., $500 - $100 transfer) without holding any database locks.
- **UPDATE WHERE version=5** — The conditional write that only succeeds if no other transaction has modified the row since the read, detected by the version number matching.
- **Success: version=6** — The happy path where the version matched, the balance is updated, and the version is incremented to 6 for future operations.
- **Conflict: 0 rows affected** — The contention path where another transaction updated the row first (version is now 6, not 5), so the WHERE clause matches zero rows.
- **Retry from read** — On conflict, the operation loops back to re-read the current balance and version, then retries the computation and conditional write.
`,
    explanation: `## Bottlenecks & Improvements
- **Event log growth** → Use periodic snapshots (every 1000 events per wallet) to limit replay cost. Archive old events to cold storage (S3) after snapshotting
- **Hot wallet problem** → A popular wallet (e.g., merchant account) receives thousands of concurrent transfers. Partition the wallet into sub-accounts and aggregate balances, or use a batching layer that groups small transfers
- **Read lag in CQRS** → The balance materialized view may lag behind the event store by milliseconds. For balance queries that must be up-to-date (e.g., before a withdrawal), read directly from the event store
- **Cross-partition transfers** → When wallets A and B are on different partitions, the saga pattern handles atomicity. The saga coordinator must be reliable (persist saga state to DB)

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Event sourcing over CRUD | More complex implementation, but perfect audit trail and time-travel capability — critical for financial systems |
| CQRS over single model | Separate read/write scaling, but introduces eventual consistency for reads |
| Saga over 2PC | No global locks (better availability), but temporarily inconsistent intermediate states and more complex failure handling |
| Append-only event log over mutable rows | Unbounded storage growth (mitigated by snapshots), but immutable data is easier to reason about and audit |
| Optimistic locking over pessimistic | Retries under contention, but no lock-waiting and better throughput for most workloads |

## Monitoring & Alerting
- **Balance invariant**: Total money in system (sum of all wallets) should equal total deposits minus total withdrawals. Alert on any drift
- **Event processing lag**: Monitor delay between event creation and materialized view update
- **Saga failure rate**: Alert on sagas stuck in COMPENSATING state
- **Snapshot freshness**: Alert if a wallet's latest snapshot is too old (>10K events behind)
- **Transfer latency**: p50, p95, p99 of end-to-end transfer time
`,
    timeComplexity: "N/A",
    spaceComplexity: "N/A",
    hints: [
      "Lead with event sourcing as the core pattern — storing an immutable log of transactions rather than mutable balances. This naturally provides the audit trail and reproducibility that financial regulators require.",
      "A common mistake is forgetting about the hot wallet problem. If one wallet (e.g., a popular merchant) receives thousands of concurrent transfers, even event sourcing needs a strategy — consider sub-accounts or write batching.",
      "Always explain how you handle the failure case in a transfer. If the debit succeeds but the credit fails, you need a compensation mechanism (saga pattern). Simply saying 'use a database transaction' only works within a single database.",
      "Do not skip the CQRS explanation. The write path (event store) and read path (balance view) have fundamentally different access patterns and consistency requirements — separating them is the right architectural choice."
    ],
  },
  {
    id: 9213,
    description: `## Clarifying Questions to Ask
- What **asset types** do we support? (stocks, options, futures, crypto)
- What **order types** must we handle? (market, limit, stop-loss)
- What is the **latency requirement**? (microseconds for matching, milliseconds for end-to-end)
- How many **symbols/tickers** are we supporting? (~10,000 for a major exchange)
- What is the peak **order volume**? (tens of thousands of orders per second)
- Do we need to support **pre-market and after-hours** trading?

## Functional Requirements
- **Place order**: Submit buy or sell orders (market or limit)
- **Cancel order**: Cancel an open/pending order
- **Match orders**: Automatically match buy and sell orders using price-time priority
- **Market data**: Publish real-time price quotes and trade executions
- **Account management**: Track positions, balances, and order history

## Non-Functional Requirements
- **Ultra-low latency**: Order matching in **microseconds** (not milliseconds)
- **High throughput**: Handle **tens of thousands of orders per second** per symbol
- **Deterministic**: Same input sequence must always produce the same output (for auditing and replay)
- **Fairness**: Strict price-time priority — earlier orders at the same price execute first
- **Fault tolerance**: System must recover without losing any orders
- **Regulatory compliance**: Complete audit trail, trade reporting

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Trading symbols | ~10,000 |
| Orders / day | ~100M |
| Peak orders / second | ~50,000 |
| Trades / day | ~30M (not every order matches) |
| Market data updates / second | ~500,000 (price changes across symbols) |
| Order message size | ~200 bytes |
| Daily order data | 100M × 200B = **20 GB/day** |
| Market data bandwidth | 500K × 100B = **50 MB/s** |
`,
    examples: `## Follow-Up Discussion Points
- **Why single-threaded matching?** Multi-threaded matching requires locks on the order book, which adds microseconds of latency per lock operation. A single-threaded design processes events sequentially, eliminating lock overhead entirely. Modern CPUs can process millions of simple operations per second on a single core.
- **How do you handle multiple symbols?** Each symbol has its own independent order book and matching engine instance. They can run in parallel on separate CPU cores since they share no state. A router/sequencer directs orders to the correct matching engine by symbol.
- **What about market data distribution?** Use a multicast network for L1/L2 data to institutional subscribers. Use WebSocket for retail clients. Market data is published after every trade execution and order book change. Different levels of detail: L1 (best bid/ask), L2 (top N price levels), L3 (full order book).
- **How do you achieve fault tolerance?** Event sourcing — every order and trade is logged to a sequenced journal. A hot-standby matching engine replays the same event sequence. If the primary fails, the standby has identical state and takes over with zero data loss.
- **How do you prevent market manipulation?** Circuit breakers halt trading if a price moves more than X% in Y seconds. Surveillance systems monitor for wash trading (trading with yourself), spoofing (placing and canceling orders to manipulate price), and layering. These run as offline analytics, not inline with matching.`,
    intuition: `A stock exchange is fundamentally different from typical web systems. While most systems optimize for throughput and horizontal scalability, an exchange optimizes for **deterministic, ultra-low-latency sequential processing**. The matching engine — the heart of the exchange — is deliberately **single-threaded** because the cost of lock contention exceeds the benefit of parallelism at microsecond timescales. The key architectural insight is the **sequencer**: by assigning a global sequence number to every event before it reaches the matching engine, you get deterministic replay, fault tolerance via event sourcing, and guaranteed fairness — all from a single design decision.`,
    approach: `## Component Overview

A **Gateway** handles client connections, authentication, and rate limiting. A **Sequencer** assigns monotonically increasing sequence numbers to every incoming order, creating a total ordering of events. The **Matching Engine** processes orders one at a time against an in-memory **Order Book**. After matching, results flow to a **Market Data Publisher** (for price feeds) and a **Reporter** (for trade confirmations and regulatory reporting).

## API Design

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| \`NewOrder\` | FIX/Binary | \`{ symbol, side(BUY/SELL), type(LIMIT/MARKET), price, quantity, clientOrderId }\` |
| \`CancelOrder\` | FIX/Binary | \`{ orderId, clientOrderId }\` |
| \`OrderStatus\` | FIX/Binary | Query current state of an order |
| \`MarketData\` | Multicast/WS | Subscribe to L1/L2/L3 book data for a symbol |

**Note**: Real exchanges use the FIX protocol or proprietary binary protocols, not REST/HTTP, because HTTP overhead is unacceptable at microsecond latencies.

## Data Model

**Order** (in-memory structure):

| Field | Type | Notes |
|-------|------|-------|
| order_id | LONG | Assigned by sequencer |
| client_order_id | STRING | Client's reference ID |
| symbol | STRING | Ticker (e.g., AAPL) |
| side | ENUM | BUY or SELL |
| type | ENUM | LIMIT or MARKET |
| price | LONG | Price in cents (avoid floating point) |
| quantity | LONG | Number of shares |
| remaining_qty | LONG | Unfilled quantity |
| timestamp | LONG | Sequencer-assigned timestamp (nanoseconds) |
| status | ENUM | NEW, PARTIALLY_FILLED, FILLED, CANCELED |

**Trade** (execution result):

| Field | Type | Notes |
|-------|------|-------|
| trade_id | LONG | Unique trade identifier |
| buy_order_id | LONG | Buyer's order |
| sell_order_id | LONG | Seller's order |
| symbol | STRING | Ticker |
| price | LONG | Execution price (in cents) |
| quantity | LONG | Executed quantity |
| timestamp | LONG | Execution time |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    CA["Client A (Broker/HFT)"]
    CB["Client B (Retail App)"]
    GW["Gateway (Auth, Validate, Rate Limit)"]
    Seq["Sequencer (Assigns global sequence #)<br/>Input: orders, Output: ordered event stream"]
    ME["Matching Engine (Single-threaded)<br/>Order Book per symbol<br/>Price-time priority match"]
    MD["Market Data Publisher (L1/L2/L3 multicast)"]
    Rep["Reporter (Trade confirms, regulatory reporting)"]

    CA --> GW
    CB --> GW
    GW --> Seq
    Seq --> ME
    ME --> MD
    ME --> Rep

    style CA fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style CB fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style Seq fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style ME fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style MD fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Rep fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client A (Broker/HFT)** — Institutional or high-frequency trading clients that require ultra-low-latency order submission via binary protocols.
- **Client B (Retail App)** — Retail investors connecting through consumer-facing applications with slightly relaxed latency requirements.
- **Gateway (Auth, Validate, Rate Limit)** — Authenticates clients, validates order parameters, and enforces rate limits to protect the matching engine from abuse.
- **Sequencer** — Assigns a monotonically increasing global sequence number to every order, establishing a total ordering that enables deterministic replay and guaranteed fairness.
- **Matching Engine (Single-threaded)** — Processes orders one at a time against in-memory order books using price-time priority, deliberately single-threaded to eliminate lock contention at microsecond latencies.
- **Market Data Publisher** — Broadcasts real-time price updates (L1/L2/L3) to all subscribers via multicast after every trade execution and order book change.
- **Reporter** — Generates trade confirmations for participants and regulatory trade reports required for compliance and audit.

## Order Matching Flow

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant GW as Gateway
    participant Seq as Sequencer
    participant ME as Matching Engine
    participant MD as Market Data

    C->>GW: New Limit BUY AAPL @150.00 x100
    GW->>Seq: Validate + authenticate
    Seq->>ME: Assign seq #42
    Note over ME: Check order book:<br/>Best ASK = 149.90<br/>BUY@150 >= ASK@149.90<br/>-> MATCH! Trade executes
    ME->>MD: Publish trade
    Note over MD: Broadcast to all subscribers
    ME-->>C: Execution report
\`\`\`

## Order Book Data Structure

**Order Book for AAPL**

\`\`\`
         BID (Buy)          |         ASK (Sell)
  Price    | Qty  | Orders  |  Price    | Qty  | Orders
-----------+------+---------+-----------+------+--------
  150.10   | 500  |   3     |  150.15   | 200  |   2
  150.00   | 1200 |   8     |  150.20   | 800  |   5
  149.95   | 300  |   2     |  150.25   | 450  |   3
  149.90   | 750  |   4     |  150.30   | 1000 |   6

  Spread: $0.05 (150.10 → 150.15)
\`\`\`

## Sequencer Architecture (Deterministic Replay)

\`\`\`mermaid
graph TD
    N0["Incoming orders"]
    N1["Sequencer"]
    N2["Matching Engine (Primary)"]
    N3["Matching Engine (Hot Standby)"]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Incoming orders** — The stream of new orders, cancellations, and modifications arriving from the gateway after authentication and validation.
- **Sequencer** — Assigns a global sequence number to each event and fans out the ordered stream to both the primary and hot standby, ensuring both process identical event sequences.
- **Matching Engine (Primary)** — The active engine processing all orders and generating trades, running single-threaded for deterministic behavior.
- **Matching Engine (Hot Standby)** — A replica that processes the same sequenced event stream in lockstep with the primary, ready to take over instantly if the primary fails with zero data loss.
`,
    jsCode: `## Deep Dive: Order Book Implementation

The order book is the most performance-critical data structure. It must support:
- Insert order: O(1) amortized
- Cancel order: O(1)
- Find best bid/ask: O(1)
- Match at a price level: O(1) per fill

\`\`\`mermaid
graph TD
    OB["Order Book"]
    BidTree["Bid Tree (Red-Black, descending)"]
    AT["Ask Tree (Red-Black, ascending)"]
    PL1["Price Level $150.10"]
    PL2["Price Level $150.00"]
    PL3["Price Level $150.15"]
    PL4["Price Level $150.20"]
    Q1["Order Queue (FIFO)"]
    Q2["Order Queue (FIFO)"]
    OB --> BidTree
    OB --> AT
    BidTree --> PL1
    BidTree --> PL2
    AT --> PL3
    AT --> PL4
    PL1 --> Q1
    PL3 --> Q2
    style OB fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style BidTree fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style AT fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style PL1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style PL2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style PL3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style PL4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Q1 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Q2 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Order Book** — The top-level data structure for a single symbol, containing both the bid and ask sides and providing O(1) access to the best bid/ask.
- **Bid Tree (Red-Black, descending)** — A self-balancing binary tree storing buy-side price levels in descending order so the highest bid (best buy price) is always accessible in O(1).
- **Ask Tree (Red-Black, ascending)** — A self-balancing binary tree storing sell-side price levels in ascending order so the lowest ask (best sell price) is always accessible in O(1).
- **Price Levels** — Individual nodes in the tree representing a specific price point, each containing aggregate quantity and a pointer to the order queue at that price.
- **Order Queues (FIFO)** — Doubly-linked lists of orders at the same price level, maintaining time priority so earlier orders execute first, with O(1) insertion and removal.

---

## Deep Dive: Matching Algorithm (Price-Time Priority)

\`\`\`mermaid
graph TD
    N0["New BUY LIMIT order arrives"]
    N1{"Buy price >= best ask?"}
    N2["Add to bid book (no match)"]
    N3["Match against best ask"]
    N4{"Order fully filled?"}
    N5["Remove from ask book"]
    N6["Partial fill: reduce ask qty"]
    N7{"More ask levels to match?"}
    N8["Remainder added to bid book"]
    N0 --> N1
    N1 -->|No| N2
    N1 -->|Yes| N3
    N3 --> N4
    N4 -->|Yes| N5
    N4 -->|No| N6
    N6 --> N7
    N7 -->|Yes| N3
    N7 -->|No| N8
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **New BUY LIMIT order arrives** — The entry point where a new buy limit order is submitted to the matching engine for processing.
- **Buy price >= best ask?** — The first decision: does the incoming buy price meet or exceed the lowest sell price? If not, no trade is possible.
- **Add to bid book (no match)** — When the buy price is below the best ask, the order is inserted into the bid side of the order book to await a future matching sell order.
- **Match against best ask** — When the buy price meets the best ask, a trade executes at the ask price, filling orders from the front of the ask queue (time priority).
- **Order fully filled?** — After matching, a check whether the incoming buy order's entire quantity has been satisfied.
- **Remove from ask book** — If the ask-side order is fully consumed by the match, it is removed from the order book entirely.
- **Partial fill: reduce ask qty** — If the buy order is fully filled but the ask order has remaining quantity, the ask order stays in the book with its quantity reduced.
- **More ask levels to match?** — If the buy order still has remaining quantity, the engine checks whether the next ask price level is still within the buy limit price.
- **Remainder added to bid book** — When no more ask levels can be matched (price exceeds the buy limit), the unfilled portion of the buy order rests on the bid side.

---

## Deep Dive: Market Data Levels

\`\`\`mermaid
graph TD
    N0["Market Data Distribution"]
    N1["Symbol"]
    N2["AAPL"]
    N3["(ask side)"]
    N4["Level"]
    N5["BidPx"]
    N6["BidQty"]
    N7["1 2"]
    N8["150.10 150.00"]
    N9["500 1200"]
    N0 --> N1
    N0 --> N3
    N0 --> N4
    N0 --> N5
    N0 --> N6
    N1 --> N2
    N4 --> N7
    N5 --> N8
    N6 --> N9
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Market Data Distribution** — The root node representing the structured market data feed published to subscribers after every order book change or trade.
- **Symbol** — The column identifying which ticker the data refers to (e.g., AAPL).
- **AAPL** — An example ticker, showing this market data snapshot is for Apple stock.
- **(ask side)** — Indicates that corresponding ask-side data (AskPx, AskQty) mirrors the bid-side structure shown here.
- **Level** — The depth level in the order book, where Level 1 is the best bid/ask and Level 2 is the next best.
- **BidPx** — The bid price column showing the highest prices buyers are willing to pay at each level.
- **BidQty** — The bid quantity column showing the total number of shares available at each bid price level.
- **1 / 2** — The level numbers, with Level 1 representing the national best bid and offer (NBBO) that most retail traders see.
- **150.10 / 150.00** — The bid prices at each level, showing the best bid is $150.10 and the next level is $150.00.
- **500 / 1200** — The aggregate quantities at each bid level, indicating market depth and liquidity at those price points.

---

## Deep Dive: Fault Tolerance via Event Sourcing

\`\`\`mermaid
graph TD
    N0["Fault Tolerance Architecture"]
    N1["Primary Matching Engine"]
    N2["Standby Matching Engine"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Fault Tolerance Architecture** — The overarching design ensuring the exchange can survive hardware failures without losing any orders or trades.
- **Primary Matching Engine** — The active engine processing all incoming orders and generating trades in real time.
- **Standby Matching Engine** — A hot replica consuming the same sequenced event stream as the primary, maintaining identical in-memory state so it can take over within sub-second failover time with zero data loss.

---

## Deep Dive: Hardware and Colocation Optimization

**Performance Optimization Stack**

| Layer | Technique | Latency Impact |
|-------|-----------|----------------|
| Network | Kernel bypass (DPDK/RDMA) | ~1-5 us |
| OS | CPU pinning, NUMA-aware allocation | ~2-10 us |
| Memory | Pre-allocated object pools, no GC | ~1-5 us |
| Data Structure | Lock-free queues, cache-line aligned | ~0.5-2 us |
| Protocol | Binary FIX (SBE), zero-copy | ~1-3 us |
| Colocation | Same datacenter as exchange | ~50-100 us RTT |
`,
    explanation: `## Bottlenecks & Improvements
- **Sequencer as single point of failure** → Use a primary-standby pair with shared journal (e.g., on a replicated SSD). Failover in sub-second. The sequencer is simple enough that failures are rare
- **Matching engine throughput per symbol** → Single-threaded is fast enough for even the busiest symbols (~100K orders/sec on modern hardware). For extreme cases, use a faster programming language (C++ over Java) or FPGA acceleration
- **Market data fan-out** → Publishing to thousands of subscribers is a bandwidth challenge. Use multicast for institutional clients and aggregation servers for retail WebSocket clients
- **Hot symbol concentration** → A few symbols (AAPL, TSLA) receive disproportionate order volume. Since each symbol has its own matching engine, this naturally isolates the load

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Single-threaded matching over multi-threaded | Cannot use multiple cores for one symbol, but eliminates all lock overhead — net faster at microsecond scale |
| FIX/binary protocol over REST/HTTP | Harder to integrate, but orders of magnitude lower latency and overhead |
| In-memory order book over disk-based | Lose durability (mitigated by event journal), but matching latency is sub-microsecond |
| Sequencer-based ordering over distributed consensus | Single point of coordination, but deterministic replay and simpler fault tolerance |
| Hot standby over cold recovery | Uses 2x resources, but failover is near-instant with zero data loss |

## Monitoring & Alerting
- **Matching latency**: p50, p99 per symbol — alert if p99 exceeds 100 microseconds
- **Sequencer gap detection**: Alert if sequence numbers have gaps (indicates lost events)
- **Order book depth**: Monitor for abnormally thin or thick books (potential manipulation)
- **Primary-standby divergence**: Compare outputs of primary and standby; alert on any mismatch
- **Circuit breaker triggers**: Log and alert every time a trading halt is triggered
`,
    timeComplexity: "N/A",
    spaceComplexity: "N/A",
    hints: [
      "Emphasize that the matching engine is single-threaded by design — this is counter-intuitive but correct. At microsecond latencies, lock contention costs more than the parallelism gains. Interviewers want to see you understand this trade-off.",
      "The sequencer is the unsung hero of the architecture. It provides global ordering, deterministic replay, fault tolerance, and fairness — all from one component. Explain how it enables hot-standby failover with zero data loss.",
      "Do not design this like a web application. There is no REST API, no HTTP, no load balancer distributing requests randomly. Use FIX protocol, binary serialization, and kernel-bypass networking. Show you understand this is a different category of system.",
      "The order book data structure matters: a sorted map of price levels (each containing a FIFO queue of orders) plus a hash map index for O(1) cancellations. Be ready to walk through a matching example step by step."
    ],
  },
];
