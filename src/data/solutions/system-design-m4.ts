import { ProblemSolution } from './types';

export const solutionsM4: ProblemSolution[] = [
  {
    id: 9016,
    description: `## Clarifying Questions to Ask
- What is the **query volume**? How many search queries per second trigger autocomplete?
- What is the **acceptable latency**? Do results need to appear within 100ms of keystroke?
- How large is the **corpus**? How many unique search terms do we index?
- Should results be **personalized** per user, or globally ranked?
- Do we need to support **multi-language** queries and CJK (Chinese/Japanese/Korean) input?

## Functional Requirements
- Given a **prefix**, return the **top k** (e.g., 5-10) most relevant suggestions
- Suggestions ranked by **popularity** (search frequency), with recency weighting
- Update suggestion rankings as **new searches** occur (near real-time)
- Support **phrase suggestions**, not just single-word completions

## Non-Functional Requirements
- **Ultra-low latency**: < 50ms p99 for suggestion retrieval (users expect instant feedback)
- **High availability**: Autocomplete should never block the main search experience
- **Scalable**: Handle 100K+ queries per second across all users

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily active users | 500M |
| Avg queries per user/day | 6 |
| Avg keystrokes per query | 4 prefix lookups |
| Prefix lookup QPS | 500M x 6 x 4 / 86,400 = **139K QPS** |
| Peak QPS | ~280K QPS |
| Unique search terms | ~500M |
| Avg term size | 30 bytes |
| Trie storage (uncompressed) | ~15 GB per replica |
| Top-k cache | ~5 GB |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle offensive/sensitive suggestions?** -> Maintain a blocklist filter applied at serving time. ML-based content classifier flags new trending terms for review before they enter the suggestion pool.
- **How would you personalize results?** -> Blend global popularity with user-specific search history. Store a lightweight per-user frequency map in a fast KV store. Mix personal top-k with global top-k at a 30/70 ratio.
- **How would you handle trending/breaking queries?** -> Short-lived Kafka stream of recent queries feeds a "trending" trie with higher time-decay weights. Merge trending results with the main trie results at serving time.
- **What if a prefix returns too few results?** -> Fall back to fuzzy matching (edit distance 1-2) or word-level prefix matching. Pre-compute common misspelling corrections.
- **How would you support CJK languages?** -> CJK has no word boundaries, so use character-level n-gram prefixes. Pinyin input for Chinese maps phonetic prefixes to character suggestions.`,
    intuition: `Search autocomplete is fundamentally a **top-k retrieval problem on a prefix trie**. The core challenge is maintaining a massive trie (hundreds of millions of terms) with real-time popularity rankings, while serving prefix lookups in under 50ms for every keystroke. The key insight is separating the offline trie-building pipeline from the online serving layer, using pre-computed top-k lists at each trie node to avoid expensive sorting at query time.`,
    approach: `## Component Overview

A **Trie Serving Layer** holds the prefix trie in memory across sharded nodes. Each trie node stores pre-computed **top-k results** so lookups are a simple tree traversal with no sorting. An **offline aggregation pipeline** processes search logs, computes term frequencies with time-decay weighting, and periodically rebuilds the trie. A **Zookeeper-coordinated deployment** swaps in new trie versions without downtime.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /v1/suggestions?prefix=&limit=5\` | Read | Returns top-k suggestions for prefix |
| \`POST /v1/searches\` | Log | Body: \`{ query, userId, timestamp }\` logs completed search |
| \`PUT /v1/blocklist\` | Admin | Add/remove terms from suggestion blocklist |

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| term | VARCHAR(100) | The complete search term |
| frequency | BIGINT | Time-weighted search count |
| updated_at | TIMESTAMP | Last frequency update |
| language | VARCHAR(5) | Language code (en, zh, ja) |
| is_blocked | BOOLEAN | Filtered from suggestions |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Client"]
    N1["Load Balancer"]
    N2["Trie Serving Nodes"]
    N3["Trie Builder"]
    N4["Blob Storage"]
    N5["Serialized trie"]
    N6["Aggregate freqs"]
    N7["Build trie"]
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
- **Client** — The end user's browser or app sending keystrokes to the autocomplete service.
- **Load Balancer** — Distributes prefix lookup requests across trie serving nodes to balance traffic and provide failover.
- **Trie Serving Nodes** — Hold the in-memory prefix trie with pre-computed top-k results at each node for O(1) lookups per prefix.
- **Trie Builder** — Offline process that constructs new trie snapshots from aggregated search frequency data.
- **Blob Storage** — Stores serialized trie snapshots that serving nodes download during deployment or version swap.
- **Serialized trie** — The compact binary representation of the trie that can be efficiently loaded into memory by serving nodes.
- **Aggregate freqs** — Collects and sums search term frequencies with time-decay weighting from raw search logs.
- **Build trie** — Assembles the trie data structure from aggregated frequencies and computes top-k lists at each node.

## Query Flow (Prefix Lookup)

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as LB / CDN
    participant P2 as Trie Server
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
\`\`\`

## Trie Update Flow (Offline)

\`\`\`mermaid
sequenceDiagram
    participant P0 as Search Logs
    participant P1 as Kafka
    participant P2 as Spark Aggregation
    participant P3 as Trie Builder
    participant P4 as Serving Nodes
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
    jsCode: `## Deep Dive: Trie Design with Pre-Computed Top-K

The trie stores pre-computed top-k results at every node, eliminating query-time sorting.

\`\`\`mermaid
graph TD
    N0["Root"]
    N1["h (top5: [hotel, home, honda, how, hello])"]
    N2["o (top5: [hotel, home, honda, how, house])"]
    N3["t (top5: [hotel, hot, hotdog, hotmail, hotspot])"]
    N4["e (top5: [hotel, hotels, hotel.com, ...])"]
    N5["d (top5: [hotdog, hotdogs, ...])"]
    N6["m (top5: [home, homegoods, homework, ...])"]
    N7["n (top5: [honda, honesty, honey, ...])"]
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
- **Root**: The top-level entry point of the trie, from which all prefix paths originate.
- **h node**: Stores the top-5 most popular completions starting with "h", pre-computed to avoid query-time sorting.
- **o node**: Narrows to the "ho" prefix, updating the top-5 list to reflect completions like "hotel", "home", and "honda".
- **t node**: Represents the "hot" prefix, with top-5 results heavily skewed toward hotel and hotdog variants.
- **e node**: Represents the "hote" prefix, converging on "hotel" and its close variants.
- **d node**: Represents the "hotd" prefix path, leading to completions like "hotdog".
- **m node**: Represents the "hom" prefix path, leading to completions like "home" and "homegoods".
- **n node**: Represents the "hon" prefix path, leading to completions like "honda" and "honey".

**Building top-k at each node**: During trie construction, propagate the top-k results upward. Each leaf has its own frequency. Each internal node merges the top-k lists from its children, keeping only the highest-k. This is a bottom-up O(N * k) pass over the trie.

**Compressed trie (Patricia trie)**: Collapse single-child chains into one node. "hot" becomes a single node instead of h->o->t. Reduces node count by ~60%, saving memory and traversal time.

\`\`\`mermaid
graph TD
    N0["Before compression: After compression:"]
    N1["o 'ot' (single node)"]
    N2["t 'el' hotel"]
    N3["'dog' hotdog"]
    N4["l hotel"]
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
- **Before compression / After compression**: A header node illustrating the two trie representations side by side.
- **'ot' (single node)**: In the compressed trie, the single-child chain "o -> t" is collapsed into one node storing the string "ot", saving traversal steps.
- **'el' / hotel**: Represents the compressed suffix leading to the "hotel" leaf, collapsing intermediate single-child nodes.
- **'dog' / hotdog**: Represents the compressed suffix "dog" branching off from "hot", leading directly to the "hotdog" completion.
- **hotel (leaf)**: The final leaf node for the word "hotel" in the uncompressed path.

---

## Deep Dive: Sharding Strategy

\`\`\`mermaid
graph TD
    N0["Shard Assignment (by prefix range)"]
    N1["Shard 0"]
    N2["Shard 1"]
    N3["Shard 2"]
    N4["Replicas:"]
    N5["R1, R2"]
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

**Why prefix-range sharding, not hash sharding?**
- Hash sharding would split "hotel" and "hot" to different shards
- Prefix-range keeps all completions for a prefix on one shard
- Single shard lookup per query (no scatter-gather)

**Hot shard mitigation**: Prefix "s" has 3x more terms than "z". Split hot prefixes further (e.g., "sa-sm", "sn-sz"). Monitor per-shard QPS and rebalance.

---

## Deep Dive: Frequency Aggregation with Time Decay

\`\`\`mermaid
graph TD
    N0["Time-Weighted Frequency Calculation"]
    N1["Raw search logs:"]
    N2["Time decay formula:"]
    N3["Hour ago"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Time-Weighted Frequency Calculation** — The overall pipeline that converts raw search logs into popularity scores with recency bias.
- **Raw search logs** — The input stream of every completed search query with timestamps, used as the basis for frequency counting.
- **Time decay formula** — An exponential decay function (e.g., 0.99^hours_ago) that weights recent searches more heavily than older ones, so trending terms rise quickly.
- **Hour ago** — Represents the time granularity at which decay is applied, showing how each log entry's contribution diminishes over time.
`,
    explanation: `## Bottlenecks & Improvements
- **Trie memory limits** -> Use compressed (Patricia) tries to reduce node count by 60%. For very large corpora, two-level trie: first level in memory, second level on SSD with mmap
- **Stale suggestions** -> Decrease rebuild interval from hourly to 15 minutes for trending queries. Maintain a small "trending overlay" trie that merges with the main trie at query time
- **Hot prefixes (e.g., single characters)** -> Cache top-k for the most common 1000 prefixes in CDN/edge. These cover 80%+ of requests
- **Trie rebuild cost** -> Incremental trie updates instead of full rebuilds. Maintain a delta log and apply changes to the existing trie in-place during off-peak hours

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Pre-computed top-k at nodes vs. query-time sorting | Higher memory and rebuild cost, but O(1) lookup at serving time |
| Prefix-range sharding vs. hash sharding | Uneven shard sizes, but single-shard lookups (no scatter-gather) |
| Offline periodic rebuild vs. real-time updates | Suggestions lag by up to 1 hour, but simpler architecture and consistent serving |
| Global ranking vs. personalized | Simpler and more cacheable, but less relevant for individual users |
| Compressed trie vs. hash map of all prefixes | Less memory, but more complex implementation and traversal |

## Monitoring & Alerting
- **Suggestion latency**: p50/p95/p99 per shard -- alert if p99 > 50ms
- **Trie build duration**: Alert if rebuild takes > 30 minutes (stale data risk)
- **Shard QPS imbalance**: Alert if any shard exceeds 2x average QPS
- **Cache hit ratio**: CDN/edge cache should be > 90% for single-char prefixes
- **Empty result rate**: High empty-result rate suggests trie coverage gaps
`,
    timeComplexity: "Prefix lookup: O(L) where L is prefix length, then O(1) to return pre-computed top-k. Trie build: O(N * k) where N is total terms and k is top-k size.",
    spaceComplexity: "~15 GB per trie replica (500M terms, compressed Patricia trie). ~5 GB for CDN/edge prefix cache. Total with 3 replicas per shard: ~150 GB across cluster.",
    hints: [
      "Pre-compute top-k results at every trie node during offline build. This converts a potentially expensive query-time aggregation into a simple O(L) traversal followed by an O(1) list return.",
      "Use prefix-range sharding instead of hash sharding so all completions for a given prefix live on a single shard. This avoids scatter-gather fan-out on every keystroke.",
      "Apply time-decay weighting to search frequencies so trending terms rise quickly and stale terms fade. A simple exponential decay (e.g., 0.99 per hour) balances recency with long-term popularity.",
      "Serve autocomplete from CDN/edge for the most common short prefixes (1-2 characters). These cover the majority of requests and benefit enormously from caching since results change slowly."
    ],
  },
  {
    id: 9017,
    description: `## Clarifying Questions to Ask
- What is the **task volume**? How many tasks per second are scheduled?
- What **scheduling modes** are needed? Immediate, delayed, and recurring (cron)?
- What are the **delivery guarantees**? At-least-once or exactly-once?
- What is the **acceptable delay** for scheduled tasks? (e.g., within 1 second of scheduled time)
- Do tasks have **priorities**? Can high-priority tasks preempt lower ones?

## Functional Requirements
- Submit a task with an **execution time** (now, future timestamp, or cron expression)
- Guarantee **at-least-once execution** of every task
- Support task **priorities** (critical, high, normal, low)
- Provide **visibility** into task status (pending, running, completed, failed)
- Support **retry with backoff** for failed tasks (configurable max retries)

## Non-Functional Requirements
- **Reliability**: No task is lost, even during node failures (durability)
- **Scalability**: Handle 100K+ task submissions per second
- **Low jitter**: Tasks execute within 1 second of their scheduled time
- **Exactly-once semantics** where possible, at-least-once as minimum guarantee

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Task submissions / day | 5B |
| Avg submission QPS | 5B / 86,400 = **58K QPS** |
| Peak QPS | ~120K QPS |
| Concurrent in-flight tasks | ~2M |
| Avg task metadata size | 500 bytes |
| Active task storage | 2M x 500B = **1 GB** |
| Task history (30 days) | 5B x 30 x 500B = **75 TB** |
| Recurring tasks (cron) | ~10M active cron schedules |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle poison-pill tasks that always fail?** -> After max retries, move to a dead-letter queue. Alert operators. Provide a UI to inspect, modify, and replay dead-letter tasks. Track poison-pill rate per task type.
- **How would you support task dependencies (DAGs)?** -> Store a DAG of task IDs. A task becomes eligible only when all parent tasks complete. Use a DAG resolver service that listens for completion events and enqueues dependent tasks.
- **How would you handle timezone-aware cron schedules?** -> Store cron expressions with timezone. The cron evaluator converts to UTC for scheduling. Handle DST transitions carefully (a 2:30 AM task during spring-forward should not be skipped).
- **What if task execution takes longer than expected?** -> Implement execution timeouts with heartbeat. Workers send heartbeats every 30s. If no heartbeat for 2 minutes, the task is presumed dead and re-queued (with idempotency key to prevent duplicate effects).
- **How would you prioritize during overload?** -> Separate queues per priority level. Workers always drain critical and high before normal. Implement admission control: reject low-priority tasks when queue depth exceeds threshold.`,
    intuition: `A distributed task scheduler is fundamentally a **time-ordered priority queue** with durability guarantees. The core challenge is reliably executing millions of tasks at their exact scheduled time across a distributed fleet, while handling worker failures, task retries, and priority ordering. The key insight is separating the scheduling concern (when to execute) from the dispatching concern (who executes), using a persistent time-indexed store and lease-based worker assignment.`,
    approach: `## Component Overview

A **Scheduler Service** accepts task submissions and persists them to a **time-indexed durable store**. A **Dispatcher** continuously scans for tasks whose execution time has arrived and places them on **priority queues**. **Worker pools** consume from these queues, execute tasks, and report results. A **lease mechanism** ensures at-least-once delivery: if a worker fails to complete within the lease timeout, the task is re-dispatched.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /v1/tasks\` | Create | Body: \`{ type, payload, executeAt, priority, maxRetries }\` |
| \`POST /v1/tasks/cron\` | Create Recurring | Body: \`{ type, payload, cronExpr, timezone }\` |
| \`GET /v1/tasks/:id\` | Status | Returns task status, attempts, result |
| \`DELETE /v1/tasks/:id\` | Cancel | Cancels pending/scheduled task |
| \`GET /v1/tasks?status=&type=\` | List | Query tasks with filters |

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| task_id (PK) | UUID | Globally unique task identifier |
| type | VARCHAR(100) | Task type (determines handler) |
| payload | JSONB | Task-specific parameters |
| execute_at | TIMESTAMP | When to execute (indexed) |
| priority | INT | 0=critical, 1=high, 2=normal, 3=low |
| status | ENUM | pending, dispatched, running, completed, failed, dead |
| lease_owner | VARCHAR(100) | Worker holding the lease (nullable) |
| lease_expires_at | TIMESTAMP | When the lease expires |
| attempt_count | INT | Number of execution attempts |
| max_retries | INT | Max retry count before dead-lettering |
| idempotency_key | VARCHAR(100) | For exactly-once semantics |
| created_at | TIMESTAMP | Submission time |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Clients"]
    N1["API Gateway"]
    N2["Scheduler Service"]
    N3["Task Store"]
    N4["Indexed by"]
    N5["Dispatcher"]
    N6["Scans for due"]
    N7["Priority Queue"]
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
- **Clients** — External services or users that submit tasks to be executed at a specified time.
- **API Gateway** — Entry point that authenticates requests, applies rate limiting, and routes task submissions to the scheduler.
- **Scheduler Service** — Accepts task submissions, validates parameters, and persists tasks to the durable store with their scheduled execution time.
- **Task Store** — A durable, time-indexed database holding all task metadata, enabling efficient range scans for due tasks.
- **Indexed by** — Represents the composite index on (execute_at, priority) that makes dispatch scans efficient.
- **Dispatcher** — Continuously scans the task store for tasks whose execution time has arrived and moves them to the appropriate priority queue.
- **Scans for due** — The polling mechanism that checks for tasks ready to execute, using time-bucket partitioning for efficiency.
- **Priority Queue** — Kafka-backed queues separated by priority level (critical/high/normal/low) that feed worker pools.

## Task Lifecycle Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as Scheduler
    participant P2 as Task Store
    participant P3 as Dispatcher
    participant P4 as Queue
    participant P5 as Worker
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
    P4->>P5: request
    P5-->>P4: response
\`\`\`

## Lease-Based Failure Recovery

\`\`\`mermaid
sequenceDiagram
    participant P0 as Worker A
    participant P1 as Task Store
    participant P2 as Dispatcher
    participant P3 as Worker B
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
\`\`\`
`,
    jsCode: `## Deep Dive: Time-Indexed Task Scanning

The dispatcher must efficiently find tasks that are due for execution every second.

\`\`\`mermaid
graph TD
    N0["Task Store (Partitioned by time bucket)"]
    N1["Partition: 2024-01-15 14:00"]
    N2["Partition: 2024-01-15 14:01"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

**Why time-bucket partitioning?**
- Each partition covers a fixed time range (e.g., 1 hour)
- Dispatcher only scans the current partition (small working set)
- Old partitions are archived/dropped efficiently
- \`FOR UPDATE SKIP LOCKED\` allows multiple dispatchers to work concurrently without conflicts

---

## Deep Dive: Cron Schedule Evaluation

\`\`\`mermaid
graph TD
    N0["Cron Evaluation Service"]
    N1["Active cron schedules: 10M"]
    N2["Cron entry:"]
    N3["Evaluation loop (every 30 seconds):"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Cron Evaluation Service**: The central service responsible for periodically checking all registered cron schedules and generating tasks when they are due.
- **Active cron schedules: 10M**: Represents the total pool of registered cron expressions that the service must evaluate, highlighting the scale challenge.
- **Cron entry**: A single cron schedule record containing the cron expression, associated job metadata, and last-fire timestamp.
- **Evaluation loop (every 30 seconds)**: The recurring scan cycle where the service checks which cron schedules have a next-fire-time within the current window and creates corresponding tasks.

**Idempotent cron expansion**: Each cron firing is identified by (schedule_id, fire_time). If two evaluators try to create the same task, the unique constraint on (schedule_id, fire_time) prevents duplicates.

---

## Deep Dive: Worker Heartbeat and Lease Management

\`\`\`mermaid
graph TD
    N0["Lease State Machine"]
    N1["PENDING"]
    N2["DISPATCHED"]
    N3["RUNNING"]
    N4["COMPLETED /"]
    N5["FAILED"]
    N6["RE-DISPATCH"]
    N7["DEAD"]
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
- **Lease State Machine** — Governs the lifecycle of every task through well-defined states with clear transition rules.
- **PENDING** — Initial state when a task is submitted but its scheduled execution time has not yet arrived.
- **DISPATCHED** — The task's execution time has arrived and it has been placed on a priority queue, awaiting worker pickup.
- **RUNNING** — A worker has acquired a time-limited lease on the task and is actively executing it, sending periodic heartbeats.
- **COMPLETED / FAILED** — Terminal states indicating whether the task finished successfully or encountered an error.
- **RE-DISPATCH** — The task is returned to the queue because its lease expired (worker crash or timeout), enabling at-least-once delivery.
- **DEAD** — The task has exceeded its maximum retry count and is moved to the dead-letter queue for manual inspection.
`,
    explanation: `## Bottlenecks & Improvements
- **Dispatcher as bottleneck** -> Run multiple dispatcher instances with leader election. Each dispatcher owns a partition range. Use \`SKIP LOCKED\` for concurrent scanning without conflicts
- **Hot-second problem** -> Many tasks scheduled at round times (e.g., :00, :30). Pre-fetch tasks 60 seconds ahead and spread dispatch over the interval with jitter
- **Large task payloads** -> Store payload in blob storage, only keep a reference in the task table. Workers fetch payload on execution
- **At-least-once causing duplicates** -> Require task handlers to be idempotent. Provide idempotency_key in task metadata. Workers check a dedup store before executing side effects

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| At-least-once over exactly-once | Simpler failure recovery, but requires idempotent task handlers |
| Separate queues per priority | More infrastructure, but guaranteed priority isolation (low never starves high) |
| Lease-based over ack-based | Workers can hold tasks longer with heartbeats, but adds heartbeat protocol complexity |
| Time-bucket partitioning | Efficient range scans and partition drops, but requires careful partition management |
| Cron as separate service | Additional component, but cleanly separates recurring schedule logic from one-time dispatch |

## Monitoring & Alerting
- **Task dispatch latency**: Time between execute_at and actual dispatch -- alert if > 5 seconds
- **Queue depth per priority**: Alert if critical queue depth > 1000 (worker pool undersized)
- **Lease expiration rate**: High rate indicates worker crashes or overloaded workers
- **Dead-letter queue size**: Growing DLQ indicates systematic task failures needing investigation
- **Cron evaluation lag**: Alert if cron evaluator falls behind schedule by > 1 minute
`,
    timeComplexity: "Task submission: O(1) DB insert. Dispatch scan: O(B) per batch where B is batch size (1000). Worker execution: O(1) dequeue + task-specific time. Cron evaluation: O(C) where C is due cron schedules per interval.",
    spaceComplexity: "Active task store: ~1 GB for 2M in-flight tasks. Task history (30 days): ~75 TB. Cron schedule store: 10M x 200B = ~2 GB. Priority queues (Kafka): ~10 GB buffered. Dead-letter queue: ~1 GB (should stay small).",
    hints: [
      "Use time-bucket partitioning in the task store so the dispatcher only scans a small, current partition rather than the entire table. Combined with a composite index on (execute_at, priority), this makes the dispatch scan very efficient even with billions of historical tasks.",
      "Implement lease-based task assignment rather than simple dequeue. When a worker picks up a task, it acquires a time-limited lease. If the worker crashes, the lease expires and the dispatcher re-assigns the task. Workers extend leases via heartbeats during long-running execution.",
      "Separate priority queues (critical/high/normal/low) with dedicated worker pools guarantee that high-priority tasks are never blocked behind a backlog of low-priority ones. During overload, you can scale down low-priority workers to free resources for critical tasks.",
      "Make cron schedule expansion idempotent by using (schedule_id, fire_time) as a unique key. Even if multiple cron evaluators process the same schedule, only one concrete task is created. This lets you run redundant evaluators for reliability without duplicate task execution."
    ],
  },
  {
    id: 9018,
    description: `## Clarifying Questions to Ask
- What is the **scope**? How many pages do we need to crawl (millions, billions)?
- What **content types** do we handle? HTML only, or also PDFs, images, JavaScript-rendered pages?
- How **fresh** must the data be? Do we re-crawl pages periodically?
- Do we need to respect **robots.txt** and implement **politeness policies**?
- What is the **output**? Raw HTML storage, or do we also extract and index text?

## Functional Requirements
- Crawl the web starting from a set of **seed URLs**, discovering new URLs from links
- Respect **robots.txt** rules and per-domain **rate limits** (politeness)
- **Deduplicate** URLs and content to avoid redundant crawling
- Store **raw HTML** and metadata for downstream processing (indexing, analysis)
- Support **priority-based** crawling (important pages crawled first and more frequently)

## Non-Functional Requirements
- **Scalable**: Crawl billions of pages (target: 1B pages/day at full scale)
- **Polite**: Never overwhelm any single domain; respect crawl-delay directives
- **Fault-tolerant**: Node failures should not lose crawl progress or cause re-crawling
- **Extensible**: Pluggable modules for content extraction, link filtering, dedup

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Target crawl rate | 1B pages / day |
| Pages per second | 1B / 86,400 = **11,574 pages/sec** |
| Avg page size (compressed) | 50 KB |
| Storage per day | 1B x 50 KB = **50 TB/day** |
| Unique URLs discovered / day | ~5B (most already seen) |
| URL frontier size | ~10B URLs pending |
| Avg URLs per page (outlinks) | 50 |
| Bandwidth required | 50 TB / 86,400 = **580 MB/sec** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle JavaScript-rendered pages?** -> Use headless browsers (Puppeteer/Playwright) for a subset of URLs flagged as JS-heavy. This is 10-100x slower than simple HTTP fetch, so only apply it selectively. Maintain a list of domains that require JS rendering.
- **How would you detect and handle spider traps?** -> Limit URL depth (max path segments), detect infinite URL patterns (e.g., calendar pages generating endless dates), cap pages per domain per crawl cycle. Use URL signature normalization to detect near-duplicate URLs.
- **How would you re-crawl for freshness?** -> Assign recrawl priority based on page change frequency (learned from previous crawls). News sites might be recrawled hourly; static pages monthly. Use HTTP If-Modified-Since / ETag headers to skip unchanged pages.
- **How would you handle different content types?** -> Content-type-based routing. HTML goes to link extractor + text parser. PDFs to PDF parser. Images to image pipeline. Each type has its own processing module registered in a plugin system.
- **How would you distribute across multiple data centers?** -> Geo-partition the URL space by domain TLD or geo-IP. US crawler nodes handle .com/.net, EU nodes handle .de/.fr. Reduces latency and bandwidth costs for cross-continent fetching.`,
    intuition: `A web crawler is fundamentally a **massive BFS/priority traversal** of the web graph, constrained by politeness rules and deduplication. The core challenge is maintaining a URL frontier of billions of entries, fetching pages at high throughput while never overwhelming any single domain, and efficiently deduplicating both URLs and content. The key insight is that the frontier must be organized by domain (for politeness) and by priority (for importance), creating a two-dimensional scheduling problem.`,
    approach: `## Component Overview

A **URL Frontier** manages the queue of URLs to crawl, organized into per-domain queues with priority ordering. **Fetcher workers** pull URLs from the frontier, respecting per-domain rate limits. Fetched pages go to a **Content Processor** that extracts links, deduplicates content, and stores raw HTML. Discovered URLs pass through a **URL Filter** (robots.txt, dedup, normalization) before entering the frontier. A **DNS Resolver** with caching minimizes DNS lookup overhead.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /v1/crawl/seeds\` | Submit | Body: \`{ urls: [...], priority }\` -- add seed URLs |
| \`GET /v1/crawl/status\` | Monitor | Returns crawl rate, frontier size, errors |
| \`GET /v1/pages/:url_hash\` | Retrieve | Returns stored HTML + metadata for a URL |
| \`PUT /v1/crawl/config\` | Configure | Update politeness settings, domain blocklist |
| \`GET /v1/crawl/domains/:domain\` | Domain Info | Returns robots.txt rules, crawl stats for domain |

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| url_hash (PK) | CHAR(64) | SHA-256 of normalized URL |
| url | TEXT | Full URL |
| domain | VARCHAR(255) | Extracted domain for politeness grouping |
| content_hash | CHAR(64) | SHA-256 of page content (dedup) |
| status_code | INT | HTTP response code |
| last_crawled_at | TIMESTAMP | Last successful fetch time |
| content_type | VARCHAR(50) | text/html, application/pdf, etc. |
| priority | FLOAT | Crawl priority score |
| crawl_depth | INT | Hops from seed URL |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Seed URLs"]
    N1["URL Frontier"]
    N2["Robots.txt Cache"]
    N3["Domain"]
    N4["Queue"]
    N5["DNS Resolver Cache"]
    N6["Priority ordering within"]
    N7["Fetcher Workers"]
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
- **Seed URLs** — The initial set of known, high-quality URLs that bootstrap the crawl and expand outward through discovered links.
- **URL Frontier** — The central queue managing billions of pending URLs, organized by priority and domain for orderly crawling.
- **Robots.txt Cache** — Stores parsed robots.txt rules per domain so the crawler respects disallow directives and crawl-delay without re-fetching the file.
- **Domain Queue** — Per-domain sub-queues within the frontier that enforce rate limits, ensuring no single site is overwhelmed.
- **DNS Resolver Cache** — Caches DNS lookups locally to avoid repeated resolution overhead, which would otherwise bottleneck the fetch pipeline.
- **Priority ordering within** — The mechanism that ranks URLs by importance (e.g., PageRank, freshness) so high-value pages are crawled first.
- **Fetcher Workers** — Distributed HTTP clients that pull URLs from the frontier, download page content, and pass it to the processing pipeline.

## Crawl Flow (Single Page)

\`\`\`mermaid
sequenceDiagram
    participant P0 as Frontier
    participant P1 as Fetcher
    participant P2 as DNS Cache
    participant P3 as Web Server
    participant P4 as Processor
    participant P5 as URL Filter
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
    P4->>P5: request
    P5-->>P4: response
\`\`\`
`,
    jsCode: `## Deep Dive: URL Frontier Architecture

The frontier is the heart of the crawler -- it determines what gets crawled and in what order.

\`\`\`mermaid
graph TD
    N0["URL Frontier"]
    N1["Front Queues (Priority-based)"]
    N2["Back Queues (Domain-based) v"]
    N3["Next URL to fetch"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Two-level queue design**:
1. **Front queues** (priority): Prioritize important/fresh pages
2. **Back queues** (domain): Enforce per-domain rate limits

A URL enters through the front queue (by priority), then is routed to the appropriate domain back queue. The fetcher selects from back queues that are "ready" (enough time since last fetch).

---

## Deep Dive: URL Deduplication at Scale

\`\`\`mermaid
graph TD
    N0["URL Dedup Pipeline"]
    N1["Stage 1: URL Normalization"]
    N2["Step 4: Sort query params -> ?a=1&b=2"]
    N3["Step 5: Remove trailing slash if no path"]
    N4["Size: ~12 GB (10 bits per URL * 10B)"]
    N5["URL hash -> check bloom filter"]
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
- **URL Dedup Pipeline** — The multi-stage process that prevents the crawler from visiting the same content twice, saving bandwidth and compute.
- **Stage 1: URL Normalization** — Canonicalizes URLs by lowercasing, removing fragments, resolving relative paths, and standardizing encoding so equivalent URLs match.
- **Sort query params** — Reorders query parameters alphabetically so that \\\`?a=1&b=2\\\` and \\\`?b=2&a=1\\\` are recognized as the same URL.
- **Remove trailing slash** — Strips trailing slashes when there is no path to further reduce URL variants.
- **Size: ~12 GB (10 bits per URL * 10B)** — The Bloom filter's memory footprint, providing probabilistic dedup for 10 billion URLs with a 0.1% false positive rate.
- **URL hash -> check bloom filter** — Each normalized URL is hashed and checked against the Bloom filter; if present, the URL is skipped as already seen.

---

## Deep Dive: Politeness and Rate Limiting

\`\`\`mermaid
graph TD
    N0["Per-Domain Politeness Engine"]
    N1["Domain: example.com"]
    N2["User-agent: *"]
    N3["Disallow: /private/"]
    N4["Crawl-delay: 2"]
    N5["Enforced rate: 1 request / 2 seconds"]
    N6["Last fetch: 14:00:03"]
    N7["Next allowed: 14:00:05"]
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
- **Per-Domain Politeness Engine** — Enforces rate limits per domain to prevent overwhelming any single web server, maintaining ethical crawling behavior.
- **Domain: example.com** — Represents a specific domain whose robots.txt rules and crawl rate are tracked independently.
- **User-agent: *** — The robots.txt directive specifying which rules apply to all crawlers (or a specific bot user-agent).
- **Disallow: /private/** — A robots.txt rule telling the crawler not to access URLs under the /private/ path.
- **Crawl-delay: 2** — A robots.txt directive requesting a minimum 2-second interval between consecutive requests to this domain.
- **Enforced rate: 1 request / 2 seconds** — The token bucket rate derived from the crawl-delay directive, governing how frequently the fetcher can request from this domain.
- **Last fetch / Next allowed** — Tracks when the most recent request was made and calculates when the next request is permitted, ensuring compliance with the rate limit.
`,
    explanation: `## Bottlenecks & Improvements
- **DNS resolution bottleneck** -> Local DNS cache per crawler node + shared DNS cache (Redis). Batch DNS prefetching for URLs in the frontier. Custom DNS resolver that bypasses system resolver limits
- **Frontier memory limits** -> Disk-backed frontier (RocksDB/LevelDB) with in-memory hot layer for active domain queues. Only top-priority URLs per domain kept in memory
- **Duplicate content from different URLs** -> SimHash-based near-duplicate detection catches pages mirrored at different URLs. Content fingerprint stored alongside URL hash
- **Spider traps (infinite URLs)** -> Max depth limit (e.g., 15 hops from seed), max pages per domain per cycle, URL pattern detection (regex to catch calendar/session-ID traps)

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| BFS with priority over pure DFS | Broader coverage faster, but deeper pages take longer to discover |
| Bloom filter for URL dedup | Small memory footprint, but 0.1% false positives mean some URLs are wrongly skipped |
| Per-domain rate limiting | Polite and safe, but reduces throughput for large sites where we could safely fetch faster |
| Compressed storage (S3) | Cheap at scale, but higher latency to retrieve pages for reprocessing |
| Batch fetching over streaming | Higher throughput, but slightly higher latency for individual page processing |

## Monitoring & Alerting
- **Crawl rate**: Pages/second globally and per-domain -- alert if drops below 80% of target
- **Frontier growth rate**: Alert if frontier grows faster than drain rate (falling behind)
- **Error rate by domain**: Track 4xx/5xx rates per domain; auto-pause domains with > 50% error rate
- **Duplicate hit rate**: Bloom filter hit rate indicates recrawl overlap -- should be 60-80% for mature crawl
- **Politeness violations**: Alert on any domain exceeding its rate limit (bug in rate limiter)
`,
    timeComplexity: "URL frontier enqueue/dequeue: O(log N) with priority heap. URL dedup (Bloom filter): O(k) where k is number of hash functions (~7). DNS lookup: O(1) cached. HTML parsing and link extraction: O(P) where P is page size.",
    spaceComplexity: "URL frontier: ~10B URLs x 100 bytes = ~1 TB (disk-backed). Bloom filter: ~12 GB for 10B URLs at 0.1% FP rate. DNS cache: ~2 GB (50M domain entries). Raw page storage: ~50 TB/day. robots.txt cache: ~5 GB (10M domains).",
    hints: [
      "Design the URL frontier as a two-level queue: front queues for priority ordering and back queues for per-domain rate limiting. This separates the concerns of 'what is important' from 'what is polite', which is the fundamental tension in web crawling.",
      "Use a Bloom filter for URL deduplication at the frontier level. With 10B URLs, a hash set would require ~600 GB of memory, while a Bloom filter with 0.1% false positive rate needs only ~12 GB. The small miss rate from false positives is acceptable.",
      "Implement SimHash-based near-duplicate detection for page content. Many pages have identical or near-identical content at different URLs (mirrors, pagination, query parameter variants). SimHash produces a 64-bit fingerprint where similar content has small Hamming distance.",
      "Respect politeness constraints by maintaining a per-domain token bucket rate limiter. Parse robots.txt on first visit to each domain and cache the rules. Default to conservative rates (1 req/sec) when no crawl-delay is specified. This prevents getting blocked and is ethically responsible."
    ],
  },
  {
    id: 9019,
    description: `## Clarifying Questions to Ask
- What **content types** are served? Static files (images, CSS, JS), video streaming, or dynamic API responses?
- What is the **global distribution** of users? Which regions have the most traffic?
- What is the **cache invalidation** strategy? Time-based TTL, or instant purge on content update?
- How large is the **content catalog**? Millions of objects or billions?
- What **consistency model** is acceptable? Eventual consistency or strong consistency for certain content?

## Functional Requirements
- Cache and serve content from **edge locations** geographically close to users
- **Route requests** to the nearest/best-performing edge using DNS-based or anycast routing
- Support **cache invalidation** (purge by URL, prefix, or tag) within seconds
- Handle **cache misses** by fetching from origin, with optional **origin shield** layer
- Support **TLS termination** at the edge for HTTPS content

## Non-Functional Requirements
- **Low latency**: Cache hits served in < 10ms; cache misses < 100ms (via origin shield)
- **High availability**: 99.99% uptime; edge failures handled by failover to next-closest PoP
- **Massive throughput**: Handle millions of requests per second across all edges
- **Global scale**: 200+ Points of Presence (PoPs) worldwide

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total requests / day | 50B |
| Peak requests / second | 1M RPS (globally) |
| Avg response size | 100 KB |
| Peak bandwidth | 1M x 100 KB = **100 GB/sec** (800 Gbps) |
| Unique objects cached | 10B |
| Cache hit ratio (target) | > 95% |
| Edge storage per PoP | 50-200 TB (SSD + HDD tiered) |
| Total edge storage | 200 PoPs x 100 TB = **20 PB** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle video streaming?** -> Segment videos into small chunks (2-10 seconds, HLS/DASH). Cache popular segments at the edge. Use adaptive bitrate: client requests appropriate quality based on bandwidth. Pre-cache popular video chunks during off-peak hours.
- **How would you support dynamic content caching?** -> Cache API responses with short TTLs (1-10 seconds) using cache keys that include query parameters and headers. Vary header support for content negotiation. Stale-while-revalidate for near-instant responses during revalidation.
- **How would you handle DDoS attacks at the edge?** -> Rate limiting per client IP at each PoP. Anycast absorbs volumetric attacks across all PoPs. Web Application Firewall (WAF) rules at edge. Challenge-response (CAPTCHA) for suspicious traffic patterns.
- **How would you optimize for long-tail content?** -> Two-tier edge caching: hot content in SSD, warm content in HDD. Regional origin shields aggregate cache misses from nearby PoPs, reducing origin load. Probabilistic early expiration to prevent thundering herd.
- **How would you handle multi-CDN setups?** -> DNS-level traffic splitting between CDN providers. Real User Monitoring (RUM) data feeds a traffic manager that routes based on per-region CDN performance. Failover to backup CDN if primary reports errors.`,
    intuition: `A CDN is fundamentally a **globally distributed caching layer** that moves content physically closer to users. The core challenge is maintaining cache consistency across hundreds of edge locations while maximizing cache hit ratios and minimizing origin load. The key insight is the hierarchical cache architecture: edge PoPs handle the majority of requests, origin shields absorb cache misses from multiple edges, and the origin only serves truly unique requests -- each layer dramatically reduces load on the next.`,
    approach: `## Component Overview

**Edge PoPs** (Points of Presence) deployed in 200+ locations worldwide serve cached content directly to nearby users. A **global routing layer** (DNS or Anycast) directs users to the optimal PoP. Each PoP has a **tiered cache** (SSD hot tier + HDD warm tier). **Origin Shield** nodes sit between edges and the origin, aggregating cache misses to reduce origin load. A **Control Plane** manages configuration, invalidation, and health monitoring across all PoPs.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /*\` | Serve | Serve cached content or fetch from origin |
| \`POST /v1/purge\` | Invalidate | Body: \`{ urls: [...] }\` or \`{ prefix: "/images/*" }\` |
| \`POST /v1/purge/tag\` | Tag Purge | Body: \`{ tag: "product-123" }\` purges all objects with tag |
| \`PUT /v1/config/:domain\` | Configure | TTL rules, origin settings, cache key config |
| \`GET /v1/analytics/:domain\` | Analytics | Hit rate, bandwidth, latency per PoP |

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| cache_key (PK) | VARCHAR(512) | URL + Vary headers hash |
| content | BLOB | Cached response body |
| headers | JSON | Response headers to replay |
| origin_url | TEXT | Origin server URL |
| ttl_expires_at | TIMESTAMP | When cache entry expires |
| surrogate_tags | TEXT[] | Tags for group invalidation |
| content_length | INT | Size in bytes |
| tier | ENUM | hot (SSD) / warm (HDD) |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Users"]
    N1["Global Routing"]
    N2["Edge PoP (US-East)"]
    N3["Edge PoP (EU-West)"]
    N4["Edge PoP (APAC)"]
    N5["SSD Hot Cache"]
    N6["HDD Warm Cache"]
    N7["Origin Shield"]
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
- **Users** — End users worldwide making HTTP requests for static or dynamic content.
- **Global Routing** — DNS-based or Anycast routing layer that directs each user to the geographically nearest or best-performing edge PoP.
- **Edge PoP (US-East / EU-West / APAC)** — Points of Presence deployed in major regions, each serving cached content directly to nearby users with minimal latency.
- **SSD Hot Cache** — Fast storage tier holding the most frequently accessed objects for sub-millisecond cache hits.
- **HDD Warm Cache** — Higher-capacity, lower-cost storage tier for less popular objects that still avoids origin fetches.
- **Origin Shield** — An intermediate caching layer between edges and the origin server that aggregates cache misses from multiple PoPs, reducing origin load by up to 95%.

## Request Flow (Cache Hit vs Miss)

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as Edge PoP
    participant P2 as Origin Shield
    participant P3 as Origin
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
\`\`\`

## Cache Invalidation Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Admin
    participant P1 as Control Plane
    participant P2 as PoP US-East
    participant P3 as PoP EU-West
    participant P4 as PoP APAC
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
    jsCode: `## Deep Dive: Cache Key Design and Vary Headers

Correct cache key construction is critical -- serving the wrong cached variant breaks user experience.

\`\`\`mermaid
graph TD
    N0["Cache Key Construction"]
    N1["Request:"]
    N2["Accept-Encoding: gzip"]
    N3["Accept-Language: en-US"]
    N4["Cookie: session=abc123"]
    N5["Origin Response Headers:"]
    N6["Vary: Accept-Encoding, Accept-Language"]
    N7["Cache-Control: max-age=3600"]
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
- **Cache Key Construction**: The process of building a unique cache key from the request URL and relevant headers to correctly identify cached variants.
- **Request**: The incoming HTTP request whose attributes feed into the cache key.
- **Accept-Encoding: gzip**: A request header indicating the client supports gzip compression; included in the cache key when specified by Vary.
- **Accept-Language: en-US**: A request header specifying the preferred language; included in the cache key to serve locale-appropriate content.
- **Cookie: session=abc123**: A request header carrying session data; typically excluded from the cache key to avoid per-user cache fragmentation.
- **Origin Response Headers**: The headers returned by the origin server that instruct the CDN on caching behavior.
- **Vary: Accept-Encoding, Accept-Language**: Tells the CDN which request headers must be part of the cache key so different variants are stored separately.
- **Cache-Control: max-age=3600**: Specifies how long the response can be served from cache before it must be revalidated with the origin.

**Cache key pitfalls**:
- Including too many headers -> low hit rate (too many variants)
- Missing a Vary header -> serving wrong content to users
- Query parameter ordering -> normalize and sort before hashing

---

## Deep Dive: Origin Shield and Collapse

\`\`\`mermaid
graph TD
    N0["Without Origin Shield: With Origin Shield:"]
    N1["200 PoPs, all miss at once 200 PoPs miss 5 shields"]
    N2["PoP 1 PoP 1"]
    N3["PoP 2 PoP 2 Shield US"]
    N4["PoP 3 Origin (200 req!) PoP 3"]
    N5["... ... Origin"]
    N6["PoP 200 PoP 198 (5 req!)"]
    N7["PoP 199 Shield AP"]
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
- **Without Origin Shield / With Origin Shield**: A comparison header contrasting two CDN architectures side by side.
- **200 PoPs, all miss at once / 200 PoPs miss -> 5 shields**: Shows the thundering herd problem without a shield (200 requests hit origin) versus with a shield (only 5 requests reach origin).
- **PoP 1 through PoP 200**: Individual Points of Presence around the world that serve cached content to nearby users and forward cache misses upstream.
- **Shield US / Shield AP**: Regional shield nodes that aggregate cache misses from multiple PoPs, serving as an intermediate caching layer before the origin.
- **Origin (200 req!) / Origin (5 req!)**: The origin server, showing how the shield layer reduces origin load from 200 concurrent requests down to just 5.

**Request Collapsing** (coalescing) at the shield:

\`\`\`mermaid
graph TD
    N0["Origin Shield - Request Collapsing"]
    N1["Time 0ms: PoP-1 requests /img.jpg"]
    N2["Time 5ms: PoP-2 requests /img.jpg"]
    N3["Time 8ms: PoP-3 requests /img.jpg"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Origin Shield - Request Collapsing** — Demonstrates how the shield coalesces multiple simultaneous requests for the same object into a single origin fetch.
- **Time 0ms: PoP-1 requests /img.jpg** — The first edge PoP triggers a cache miss, and the shield initiates a fetch to the origin.
- **Time 5ms: PoP-2 requests /img.jpg** — A second PoP requests the same object; the shield queues this request instead of making another origin call.
- **Time 8ms: PoP-3 requests /img.jpg** — A third PoP also misses; the shield will fan out the single origin response to all three waiting PoPs.

---

## Deep Dive: Cache Eviction Strategy

\`\`\`mermaid
graph TD
    N0["Two-Tier Cache with Promotion/Demotion"]
    N1["SSD Tier (Hot) - 20% of storage"]
    N2["Eviction: LRU with frequency boost"]
    N3["HDD Tier (Warm) - 80% of storage"]
    N4["Objects evicted entirely when HDD is full"]
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
- **Two-Tier Cache with Promotion/Demotion** — A tiered storage strategy that balances performance and capacity by placing hot objects on fast media and warm objects on cheaper media.
- **SSD Tier (Hot) - 20% of storage** — Fast solid-state storage holding the most frequently accessed objects for the lowest latency cache hits.
- **Eviction: LRU with frequency boost** — The eviction policy that considers both recency and access frequency, preventing popular objects from being evicted by a burst of one-time requests.
- **HDD Tier (Warm) - 80% of storage** — High-capacity spinning disk storage for objects evicted from the SSD tier but still worth caching to avoid origin fetches.
- **Objects evicted entirely when HDD is full** — The final eviction stage where the least valuable objects are purged completely, forcing a cache miss on next access.
`,
    explanation: `## Bottlenecks & Improvements
- **Thundering herd on cache expiry** -> Implement stale-while-revalidate: serve stale content while fetching fresh version in background. Add jitter to TTLs to prevent simultaneous expiration across objects
- **Origin overload during purge storms** -> Rate-limit origin fetches after a mass purge. Use request collapsing at the shield to coalesce duplicate origin requests. Pre-warm cache after purge for known high-traffic objects
- **Long-tail content with low hit rate** -> Tiered caching (SSD/HDD) with admission control. Only cache objects on second request. Regional origin shields amortize misses across PoPs
- **Cache consistency across PoPs** -> Accept eventual consistency (objects may differ across PoPs for TTL duration). For instant consistency, implement push-based invalidation via control plane pub/sub

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Eventual consistency over strong | PoPs may serve slightly stale content, but much simpler and faster than distributed consensus |
| Origin shield layer | Additional hop on shield miss (latency), but reduces origin load by 95%+ |
| Two-tier SSD/HDD caching | More complex eviction logic, but 10x more storage capacity at reasonable cost |
| DNS-based routing over Anycast | Slower failover (DNS TTL), but more flexible routing policies and easier debugging |
| Surrogate-key tagging | Customers must add headers, but enables precise group invalidation without URL enumeration |

## Monitoring & Alerting
- **Cache hit ratio per PoP**: Alert if any PoP drops below 90% (possible misconfiguration or attack)
- **Origin request rate**: Alert if shield-to-origin traffic exceeds baseline by 3x (cache miss storm)
- **Purge propagation time**: Time from purge request to all PoPs confirmed -- alert if > 30 seconds
- **Edge error rate (5xx)**: Per-PoP 5xx rate -- alert if > 0.1% (origin down or edge misconfiguration)
- **Bandwidth per PoP**: Alert on unexpected spikes (possible abuse or viral content)
`,
    timeComplexity: "Cache hit: O(1) hash lookup. Cache miss (with shield): O(1) + network round-trip to shield (~20ms) or origin (~100ms). Purge: O(P) where P is number of PoPs (fan-out, but parallel). Cache key computation: O(H) where H is number of Vary headers.",
    spaceComplexity: "Per PoP: 50-200 TB (SSD + HDD tiered). Origin shield per region: ~20 TB. Total edge storage: ~20 PB across 200 PoPs. Metadata index per PoP: ~10 GB (10B objects x 1 byte entry in Bloom filter for existence check). Purge log: ~1 GB/day.",
    hints: [
      "Design the cache hierarchy in three tiers: edge PoPs for hot content, origin shields for warm aggregation, and origin as the source of truth. Each tier dramatically reduces load on the next -- 200 PoPs become 5 shield requests become 1 origin request through collapsing.",
      "Implement request collapsing (coalescing) at the origin shield layer. When multiple PoPs request the same uncached object simultaneously, the shield makes only one request to origin and fans out the response. This prevents origin overload during cache misses or after purges.",
      "Use surrogate keys (cache tags) for invalidation instead of URL-based purge. Tag objects at the origin (e.g., 'product-123'), then purge all objects with that tag in one API call. This is critical for content that generates many URL variants.",
      "Implement a two-tier admission policy: only cache objects after the second request. This prevents one-hit wonders (bots, crawlers, rare pages) from polluting the cache and evicting frequently-accessed content."
    ],
  },
  {
    id: 9020,
    description: `## Clarifying Questions to Ask
- What is the **data volume**? How many metrics per second are ingested?
- What is the **query pattern**? Real-time dashboards, ad-hoc queries, or both?
- What **retention periods** are needed? (e.g., raw data 15 days, rollups 1 year)
- How **granular** is the data? Per-second, per-minute, or per-event metrics?
- What **alerting capabilities** are needed? Threshold-based, anomaly detection, or both?

## Functional Requirements
- **Ingest** millions of time-series data points per second from agents on every host
- **Store** metrics with configurable retention (high-res short-term, rollups long-term)
- **Query** metrics with flexible tag-based filtering and aggregation (avg, sum, percentiles)
- **Alert** on metric thresholds with configurable conditions and notification channels
- **Dashboard** support with auto-refreshing charts at 10-second resolution

## Non-Functional Requirements
- **High write throughput**: Sustain 5M+ data points per second ingestion
- **Low query latency**: Dashboard queries return within 500ms
- **High availability**: Ingestion and alerting must survive node failures without data loss
- **Horizontal scalability**: Add nodes to handle 10x growth without redesign

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Monitored hosts | 500,000 |
| Metrics per host | 200 |
| Collection interval | 10 seconds |
| Ingestion rate | 500K x 200 / 10 = **10M points/sec** |
| Unique time series | ~50M (host x metric x tags) |
| Raw data point size | ~24 bytes (timestamp + value + series_id) |
| Compressed point size | ~2 bytes (Gorilla compression) |
| Raw storage (15 days) | 10M x 2B x 86,400 x 15 = **26 TB** |
| Minute rollups (90 days) | ~2.6 TB |
| Hour rollups (1 year) | ~180 GB |
`,
    examples: `## Follow-Up Discussion Points
- **How would you support percentile calculations (p50/p95/p99)?** -> Store histograms (bucketed counts) instead of raw values for percentile-capable metrics. Use t-digest or DDSketch data structures that merge across hosts while preserving accurate percentile estimates. Pre-aggregate at the agent level.
- **How would you handle cardinality explosion?** -> Enforce per-metric cardinality limits at ingestion. Reject new tag combinations beyond the limit. Monitor cardinality growth and alert when a metric exceeds thresholds. Provide tooling to identify high-cardinality tags (e.g., user_id in a metric tag).
- **How would you implement anomaly detection?** -> Train per-series models on historical patterns (seasonality, trend). Use statistical methods (Z-score, EWMA) for simple cases and ML models for complex patterns. Run anomaly detection as a parallel pipeline alongside threshold alerting.
- **How would you support distributed tracing alongside metrics?** -> Correlate trace IDs with metric timestamps. Exemplars: attach a sample trace ID to metric data points so users can jump from a metric spike to a specific trace. Store exemplars in a separate column alongside the metric value.
- **How would you handle metric relabeling and transformation?** -> Support relabeling rules at ingestion (drop, rename, aggregate tags). Provide a recording rules engine that pre-computes derived metrics (e.g., error_rate = errors / total). Store computed metrics alongside raw metrics.`,
    intuition: `A metrics monitoring system is fundamentally a **high-throughput time-series database** with a real-time alerting engine. The core challenge is ingesting millions of data points per second, storing them efficiently with compression, and querying them with low latency across flexible tag dimensions. The key insight is that time-series data has unique properties (append-only, temporally correlated values) that enable specialized compression (Gorilla encoding) achieving 12x compression, and that the alert evaluation path should read from the ingestion stream directly rather than from storage for minimal latency.`,
    approach: `## Component Overview

**Agents** on each host collect metrics and batch them locally before sending to **Intake Servers**. Intake servers write to **Kafka** as a durable buffer. **TSDB Writers** consume from Kafka and write to the **Time-Series Database** using Gorilla compression. A **Query Engine** serves dashboard and ad-hoc queries with scatter-gather across TSDB shards. An **Alert Evaluator** consumes directly from Kafka for real-time threshold evaluation with < 30-second latency.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /v1/metrics\` | Ingest | Body: \`{ series: [{ name, tags, points: [{ts, val}] }] }\` |
| \`GET /v1/query\` | Query | Params: \`metric, tags, from, to, aggregation, groupBy\` |
| \`POST /v1/alerts\` | Create Alert | Body: \`{ metric, condition, threshold, window, notify }\` |
| \`GET /v1/dashboards/:id\` | Dashboard | Returns dashboard config with panel queries |
| \`GET /v1/metadata/metrics\` | Catalog | List available metrics and their tag keys |

## Data Model

| Field | Type | Notes |
|-------|------|-------|
| series_id (PK) | BIGINT | Hash of (metric_name + sorted tags) |
| metric_name | VARCHAR(200) | e.g., cpu.usage, http.latency |
| tags | MAP<STRING,STRING> | e.g., host=web-01, region=us-east |
| timestamp | BIGINT | Unix epoch milliseconds |
| value | DOUBLE | Metric value |
| chunk_id | BIGINT | 2-hour chunk identifier |
| compression | ENUM | gorilla, raw |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Host"]
    N1["Agent"]
    N2["Intake Servers"]
    N3["Validate + route"]
    N4["Kafka Cluster"]
    N5["TSDB Writers"]
    N6["Alert Evaluator"]
    N7["Gorilla"]
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
- **Host** — A monitored server or container running application workloads that generates metrics data.
- **Agent** — A lightweight daemon on each host that collects system and application metrics, batches them locally, and forwards them to intake servers.
- **Intake Servers** — Stateless servers that receive metric batches from agents, validate the data, and route it into Kafka for durable buffering.
- **Validate + route** — The intake logic that checks metric format, enforces cardinality limits, and assigns each metric to the correct Kafka partition.
- **Kafka Cluster** — A durable message buffer that decouples ingestion from storage, absorbs traffic spikes, and feeds both the TSDB writers and alert evaluators.
- **TSDB Writers** — Consumer processes that read from Kafka and write compressed time-series data into the TSDB using Gorilla encoding.
- **Alert Evaluator** — A real-time stream processor that reads metrics directly from Kafka to evaluate alerting rules with sub-30-second latency, bypassing the TSDB.
- **Gorilla** — The compression encoding (delta-of-delta for timestamps, XOR for values) that achieves 12x space savings on time-series data.

## Ingestion Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Agent
    participant P1 as Intake
    participant P2 as Kafka
    participant P3 as TSDB Writer
    participant P4 as TSDB
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
\`\`\`

## Query Flow (Dashboard)

\`\`\`mermaid
sequenceDiagram
    participant P0 as Dashboard
    participant P1 as Query Engine
    participant P2 as TSDB Shard 1
    participant P3 as TSDB Shard 2
    participant P4 as TSDB Shard 3
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
    jsCode: `## Deep Dive: Gorilla Compression for Time-Series Data

Gorilla compression exploits the properties of time-series data: timestamps are regular and values change slowly.

\`\`\`mermaid
graph TD
    N0["Timestamp Compression (Delta-of-Delta):"]
    N1["Value Compression (XOR-based):"]
    N2["Compression Result:"]
    N3["Uncompressed: 17,280 bytes"]
    N4["Compressed: ~1,440 bytes"]
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
- **Timestamp Compression (Delta-of-Delta)** — Encodes timestamps by storing only the difference between consecutive deltas, which is typically zero for regular intervals and costs just 1 bit.
- **Value Compression (XOR-based)** — XORs consecutive metric values, exploiting the fact that nearby readings are similar, so the XOR result has mostly zero bits requiring few bits to encode.
- **Compression Result** — The output comparison showing the effectiveness of Gorilla encoding on a typical 2-hour data chunk.
- **Uncompressed: 17,280 bytes** — The raw storage cost for a 2-hour chunk at 10-second intervals (720 points x 24 bytes each).
- **Compressed: ~1,440 bytes** — The actual storage after Gorilla compression, achieving approximately 12x space reduction.

---

## Deep Dive: Inverted Index for Tag-Based Queries

\`\`\`mermaid
graph TD
    N0["Tag Inverted Index"]
    N1["How do we find all series matching:"]
    N2["Inverted Index:"]
    N3["Tag"]
    N4["Query resolution:"]
    N5["INTERSECT all three -> {1, 5, 13}"]
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
- **Tag Inverted Index** — A data structure mapping each tag key-value pair to a sorted list of series IDs, enabling fast set-intersection queries.
- **How do we find all series matching** — Frames the problem: given multiple tag filters, identify which time series to read without scanning all 50M series.
- **Inverted Index** — The core lookup structure where each tag value (e.g., region=us-east) maps to a posting list of matching series IDs.
- **Tag** — A key-value label attached to a metric (e.g., host=web-01, service=api) used for filtering and grouping in queries.
- **Query resolution** — The process of intersecting multiple posting lists to find series matching all specified tag filters.
- **INTERSECT all three** — The set intersection operation that combines posting lists from each tag filter, yielding only the series IDs present in all lists.

---

## Deep Dive: Multi-Resolution Rollup Storage

\`\`\`mermaid
graph TD
    N0["Data Retention Tiers"]
    N1["Tier 1: Raw Data (10-second resolution)"]
    N2["Retention: 15 days"]
    N3["Tier 2: Minute Rollups"]
    N4["Retention: 90 days"]
    N5["Tier 3: Hour Rollups"]
    N6["Retention: 1+ year"]
    N7["Query auto-resolution:"]
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
- **Data Retention Tiers** — The multi-resolution storage strategy that balances query performance, storage cost, and data retention duration.
- **Tier 1: Raw Data (10-second resolution)** — Full-fidelity data points at the original collection interval, used for recent debugging and detailed analysis.
- **Retention: 15 days** — Raw data is kept for only 15 days due to its large size (~26 TB), after which it is replaced by pre-computed rollups.
- **Tier 2: Minute Rollups** — Pre-aggregated data (avg, min, max, sum, count) at 1-minute granularity, reducing storage by 6x while preserving useful detail.
- **Retention: 90 days** — Minute-level data covers the medium-term window for capacity planning and trend analysis.
- **Tier 3: Hour Rollups** — Further aggregated to 1-hour granularity for long-term historical queries and year-over-year comparisons.
- **Retention: 1+ year** — Hourly rollups are compact enough (~180 GB) to retain indefinitely for long-range trend analysis.
- **Query auto-resolution** — The query engine automatically selects the appropriate tier based on the requested time range, using raw data for recent queries and rollups for longer spans.
`,
    explanation: `## Bottlenecks & Improvements
- **Ingestion spikes overwhelming writers** -> Kafka absorbs bursts as a buffer. Scale writers horizontally with consumer group rebalancing. Implement backpressure signaling to agents (slow down collection interval temporarily)
- **High-cardinality tag explosion** -> Enforce per-metric cardinality limits at intake. Track unique series count per metric. Reject new tag combinations beyond threshold with clear error. Provide tooling to identify problematic tags
- **Query performance on high-cardinality GROUP BY** -> Limit result set size (max 10K groups). Pre-compute common groupings as recording rules. Use approximate algorithms (HyperLogLog for unique counts, t-digest for percentiles)
- **Alert evaluator lag** -> Run alert evaluation on the Kafka stream directly, not from TSDB. Partition alert rules across evaluator instances by metric hash. Stateless evaluators rebuild sliding windows from Kafka on restart

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Gorilla compression over raw storage | Complex encode/decode logic, but 12x space savings makes in-memory chunk storage feasible |
| Kafka as intermediate buffer | Additional infrastructure and slight latency, but decouples ingestion from storage and prevents data loss |
| Inverted index for tags | Memory overhead (~10 GB), but O(1) tag filtering instead of full series scan |
| Multi-resolution rollups | Background job complexity and storage of 5 aggregates, but enables fast long-range queries |
| Alert from stream vs. storage | Duplicated read path, but < 30 second alert latency instead of minutes from query-based alerting |

## Monitoring & Alerting
- **Ingestion lag**: Kafka consumer group lag -- alert if > 30 seconds (writers falling behind)
- **Query latency**: p50/p95/p99 for dashboard queries -- alert if p95 > 2 seconds
- **Cardinality growth**: Per-metric series count -- alert if any metric exceeds 100K unique series
- **TSDB disk usage**: Per-node storage utilization -- alert if > 80% (scale or increase retention pressure)
- **Rollup job lag**: Alert if rollup falls behind by > 1 hour (risk of raw data deletion before rollup)
`,
    timeComplexity: "Ingestion: O(1) per data point (hash + append). Tag-based query: O(S + P) where S is matching series from index intersection and P is data points in time range. Rollup: O(P) per series per window. Alert evaluation: O(R * W) where R is matching rules and W is window size.",
    spaceComplexity: "Raw storage (15 days, compressed): ~26 TB. Minute rollups (90 days): ~2.6 TB. Hour rollups (1 year): ~180 GB. Inverted tag index: ~10 GB. Kafka buffer (24h): ~43 TB with 3x replication. Agent memory: ~50 MB per host. Query cache: ~10 GB.",
    hints: [
      "Use Gorilla compression (Facebook's TSDB paper) which exploits time-series properties: timestamps have regular intervals (delta-of-delta is usually 0 = 1 bit) and consecutive values are similar (XOR has few set bits). This achieves 12x compression, making it feasible to store 15 days of raw 10-second data.",
      "Decouple ingestion from querying with Kafka as a durable buffer. The ingestion path writes to Kafka and is never blocked by slow queries. Alert evaluators also consume from Kafka directly for real-time alerting with < 30-second latency, bypassing the TSDB entirely.",
      "Implement multi-resolution rollup storage: raw (15 days), minute aggregates (90 days), hour aggregates (1+ year). Store all five aggregates (avg, min, max, sum, count) because average-of-averages is mathematically incorrect when groups have unequal counts.",
      "Build an inverted index mapping tag key-value pairs to series IDs. A query like 'cpu.usage WHERE region=us-east AND service=api' intersects posting lists to find matching series in O(1) instead of scanning all 50M series."
    ],
  }
];
