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

\`\`\`
+----------+       +-----------------+       +--------------------+
| Client   |------>| Load Balancer   |------>| Trie Serving Nodes |
| (Browser)|<------| (L7 / CDN)     |<------| (In-Memory Trie)   |
+----------+  JSON +-----------------+       +---------+----------+
                                                       |
                          Trie built offline            |
                   +-----------------------------------+
                   |
          +--------v---------+     +--------------------+
          | Trie Builder     |---->| Blob Storage       |
          | (MapReduce Job)  |     | (S3 / GCS)         |
          |                  |     | Serialized trie     |
          | Aggregate freqs  |     | snapshots           |
          | Build trie       |     +----------+---------+
          +--------+---------+                |
                   |                          | download
          +--------v---------+     +----------v----------+
          | Search Log       |     | Trie Serving Nodes  |
          | Aggregation      |     | Load new snapshot   |
          | (Kafka + Spark)  |     | Hot-swap in memory  |
          +------------------+     +---------------------+
\`\`\`

## Query Flow (Prefix Lookup)

\`\`\`
Client           LB / CDN        Trie Server
  |                 |                 |
  | GET ?prefix=ho  |                 |
  |---------------->|                 |
  |                 |  Route by hash  |
  |                 |---------------->|
  |                 |                 | Traverse trie
  |                 |                 | to node "ho"
  |                 |                 | Return pre-computed
  |                 |                 | top-k at that node
  |                 |  [hotel, home,  |
  |                 |   honda, hot..] |
  |                 |<----------------|
  | suggestions     |                 |
  |<----------------|                 |
\`\`\`

## Trie Update Flow (Offline)

\`\`\`
Search Logs     Kafka       Spark Aggregation     Trie Builder     Serving Nodes
    |              |               |                   |                 |
    | user search  |               |                   |                 |
    |------------->|               |                   |                 |
    |              | batch (hourly)|                   |                 |
    |              |-------------->|                   |                 |
    |              |               | aggregate counts  |                 |
    |              |               | apply time-decay  |                 |
    |              |               |------------------>|                 |
    |              |               |                   | build new trie  |
    |              |               |                   | serialize to S3 |
    |              |               |                   |------>          |
    |              |               |                   |       download  |
    |              |               |                   |  notification   |
    |              |               |                   |---------------->|
    |              |               |                   |                 | hot-swap
\`\`\`
`,
    jsCode: `## Deep Dive: Trie Design with Pre-Computed Top-K

The trie stores pre-computed top-k results at every node, eliminating query-time sorting.

\`\`\`
Root
 |
 +-- h (top5: [hotel, home, honda, how, hello])
 |   |
 |   +-- o (top5: [hotel, home, honda, how, house])
 |   |   |
 |   |   +-- t (top5: [hotel, hot, hotdog, hotmail, hotspot])
 |   |   |   |
 |   |   |   +-- e (top5: [hotel, hotels, hotel.com, ...])
 |   |   |   +-- d (top5: [hotdog, hotdogs, ...])
 |   |   |
 |   |   +-- m (top5: [home, homegoods, homework, ...])
 |   |   +-- n (top5: [honda, honesty, honey, ...])
 |   |
 |   +-- e (top5: [hello, help, health, heart, heat])
 |
 +-- w (top5: [weather, walmart, wiki, ...])
\`\`\`

**Building top-k at each node**: During trie construction, propagate the top-k results upward. Each leaf has its own frequency. Each internal node merges the top-k lists from its children, keeping only the highest-k. This is a bottom-up O(N * k) pass over the trie.

**Compressed trie (Patricia trie)**: Collapse single-child chains into one node. "hot" becomes a single node instead of h->o->t. Reduces node count by ~60%, saving memory and traversal time.

\`\`\`
Before compression:          After compression:

  h                            h
  |                            |
  o                           "ot" (single node)
  |                            |
  t                           +--"el" -> hotel
  |                           +--"dog" -> hotdog
  e
  |
  l -> hotel
\`\`\`

---

## Deep Dive: Sharding Strategy

\`\`\`
+---------------------------------------------------+
| Shard Assignment (by prefix range)                 |
|                                                    |
|  +----------+  +----------+  +----------+          |
|  | Shard 0  |  | Shard 1  |  | Shard 2  |   ...   |
|  | a-f      |  | g-n      |  | o-z      |          |
|  |          |  |          |  |          |          |
|  | Replicas:|  | Replicas:|  | Replicas:|          |
|  |  R1, R2  |  |  R1, R2  |  |  R1, R2  |          |
|  +----------+  +----------+  +----------+          |
+---------------------------------------------------+

Client prefix "ho..." -> first char 'h' -> Shard 1
Client prefix "we..." -> first char 'w' -> Shard 2
\`\`\`

**Why prefix-range sharding, not hash sharding?**
- Hash sharding would split "hotel" and "hot" to different shards
- Prefix-range keeps all completions for a prefix on one shard
- Single shard lookup per query (no scatter-gather)

**Hot shard mitigation**: Prefix "s" has 3x more terms than "z". Split hot prefixes further (e.g., "sa-sm", "sn-sz"). Monitor per-shard QPS and rebalance.

---

## Deep Dive: Frequency Aggregation with Time Decay

\`\`\`
+------------------------------------------------------+
| Time-Weighted Frequency Calculation                   |
|                                                       |
|  Raw search logs:                                     |
|  [hotel: 50K/hr, home: 30K/hr, honda: 10K/hr]        |
|                                                       |
|  Time decay formula:                                  |
|  score = SUM(count_i * decay^(hours_since_search_i))  |
|  decay = 0.99 (per hour)                              |
|                                                       |
|  +------------------------------------------------+   |
|  | Hour ago | "hotel" count | weight | contribution|  |
|  |----------|---------------|--------|-------------|  |
|  |    0     |    50,000     | 1.00   |   50,000    |  |
|  |    1     |    48,000     | 0.99   |   47,520    |  |
|  |    2     |    45,000     | 0.98   |   44,100    |  |
|  |   24     |    40,000     | 0.79   |   31,450    |  |
|  |  168     |    35,000     | 0.18   |    6,380    |  |
|  +------------------------------------------------+   |
|                                                       |
|  Recent searches matter more -> trending terms rise   |
+------------------------------------------------------+
\`\`\`
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

\`\`\`
+----------+       +-----------------+       +-------------------+
| Clients  |------>| API Gateway     |------>| Scheduler Service |
| (Apps)   |<------| (Rate Limit)    |<------| (Stateless)       |
+----------+       +-----------------+       +--------+----------+
                                                      |
                                             +--------v----------+
                                             | Task Store         |
                                             | (Partitioned DB)   |
                                             | Indexed by         |
                                             | execute_at + prio  |
                                             +--------+----------+
                                                      |
                                             +--------v----------+
                                             | Dispatcher         |
                                             | (Leader-elected)   |
                                             | Scans for due      |
                                             | tasks per second   |
                                             +--------+----------+
                                                      |
                          +---------------------------+---------------------------+
                          |                           |                           |
                 +--------v--------+        +---------v-------+        +---------v-------+
                 | Priority Queue  |        | Priority Queue  |        | Priority Queue  |
                 | CRITICAL / HIGH |        | NORMAL          |        | LOW             |
                 | (Kafka topic)   |        | (Kafka topic)   |        | (Kafka topic)   |
                 +--------+--------+        +---------+-------+        +---------+-------+
                          |                           |                           |
                 +--------v--------+        +---------v-------+        +---------v-------+
                 | Worker Pool     |        | Worker Pool     |        | Worker Pool     |
                 | (High Priority) |        | (Normal)        |        | (Low Priority)  |
                 +-----------------+        +-----------------+        +-----------------+
\`\`\`

## Task Lifecycle Flow

\`\`\`
Client          Scheduler       Task Store      Dispatcher      Queue       Worker
  |                |                |               |              |           |
  | POST /tasks    |                |               |              |           |
  |--------------->|                |               |              |           |
  |                | persist task   |               |              |           |
  |                |--------------->|               |              |           |
  |                |    ACK         |               |              |           |
  |  { task_id }   |<--------------|               |              |           |
  |<---------------|                |               |              |           |
  |                |                |               |              |           |
  |                |                | scan due tasks|              |           |
  |                |                |<--------------|              |           |
  |                |                | [task1,task2] |              |           |
  |                |                |-------------->|              |           |
  |                |                |               | enqueue      |           |
  |                |                |               |------------->|           |
  |                |                |               |              | dequeue   |
  |                |                |               |              |---------->|
  |                |                |               |              |           | execute
  |                |                |               |              |           |
  |                |                | update status |              |  result   |
  |                |                |<---------------------------------|
\`\`\`

## Lease-Based Failure Recovery

\`\`\`
Worker A         Task Store        Dispatcher       Worker B
  |                  |                  |                |
  | acquire lease    |                  |                |
  | (5 min timeout)  |                  |                |
  |----------------->|                  |                |
  |                  |                  |                |
  | executing...     |                  |                |
  |                  |                  |                |
  | CRASH! (no ack)  |                  |                |
  X                  |                  |                |
  |                  | lease expired    |                |
  |                  |<----- scan ------|                |
  |                  |                  |                |
  |                  | re-dispatch      |                |
  |                  |------ task ----->|                |
  |                  |                  | assign to B    |
  |                  |                  |--------------->|
  |                  |                  |                | execute
  |                  |  complete + ack  |                |
  |                  |<---------------------------------|
\`\`\`
`,
    jsCode: `## Deep Dive: Time-Indexed Task Scanning

The dispatcher must efficiently find tasks that are due for execution every second.

\`\`\`
+-------------------------------------------------------------+
| Task Store (Partitioned by time bucket)                      |
|                                                              |
| Partition: 2024-01-15 14:00                                  |
| +----------------------------------------------------------+ |
| | execute_at          | priority | task_id  | status       | |
| |---------------------|----------|----------|-------------- | |
| | 2024-01-15 14:00:01 | 0 (crit) | task-a1  | pending      | |
| | 2024-01-15 14:00:01 | 2 (norm) | task-b3  | pending      | |
| | 2024-01-15 14:00:02 | 1 (high) | task-c7  | pending      | |
| | 2024-01-15 14:00:03 | 0 (crit) | task-d2  | pending      | |
| | ...                 | ...      | ...      | ...          | |
| +----------------------------------------------------------+ |
|                                                              |
| Partition: 2024-01-15 14:01                                  |
| +----------------------------------------------------------+ |
| | (next minute's tasks)                                    | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+

Dispatcher query (every second):
  SELECT * FROM tasks
  WHERE execute_at <= NOW()
    AND status = 'pending'
  ORDER BY priority ASC, execute_at ASC
  LIMIT 1000
  FOR UPDATE SKIP LOCKED
\`\`\`

**Why time-bucket partitioning?**
- Each partition covers a fixed time range (e.g., 1 hour)
- Dispatcher only scans the current partition (small working set)
- Old partitions are archived/dropped efficiently
- \`FOR UPDATE SKIP LOCKED\` allows multiple dispatchers to work concurrently without conflicts

---

## Deep Dive: Cron Schedule Evaluation

\`\`\`
+------------------------------------------------------+
| Cron Evaluation Service                               |
|                                                       |
| Active cron schedules: 10M                            |
|                                                       |
| +--------------------------------------------------+ |
| | Cron entry:                                      | |
| | schedule_id: cron-123                            | |
| | expression: "0 */5 * * *" (every 5 min)          | |
| | timezone: "America/New_York"                      | |
| | next_fire_at: 2024-01-15 14:05:00 UTC            | |
| +--------------------------------------------------+ |
|                                                       |
| Evaluation loop (every 30 seconds):                   |
|                                                       |
|   1. Query: next_fire_at <= NOW() + 60s               |
|   2. For each due schedule:                           |
|      a. Create concrete task with execute_at           |
|      b. Compute and store next_fire_at                 |
|      c. Insert task into Task Store                    |
|                                                       |
| +--------------------------------------------------+ |
| | Sharding: 10M crons / 100 evaluator instances    | |
| | = 100K crons per evaluator                       | |
| | Each evaluator owns a hash range of schedule_ids | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
\`\`\`

**Idempotent cron expansion**: Each cron firing is identified by (schedule_id, fire_time). If two evaluators try to create the same task, the unique constraint on (schedule_id, fire_time) prevents duplicates.

---

## Deep Dive: Worker Heartbeat and Lease Management

\`\`\`
+------------------------------------------------------+
| Lease State Machine                                   |
|                                                       |
|  +----------+   dispatch  +------------+              |
|  | PENDING  |------------>| DISPATCHED |              |
|  +----------+             +------+-----+              |
|                                  |                    |
|                          worker picks up              |
|                                  |                    |
|                           +------v-----+              |
|                           | RUNNING    |              |
|                           | lease: 5m  |              |
|                           +--+----+----+              |
|                              |    |                   |
|              heartbeat       |    | complete/fail     |
|              extends lease   |    |                   |
|              +------+        |    |                   |
|              |      |        |    |                   |
|              v      |        |    v                   |
|           +--+------+-+   +--+----------+             |
|           | RUNNING   |   | COMPLETED / |             |
|           | lease+=5m |   | FAILED      |             |
|           +-----------+   +------+------+             |
|                                  |                    |
|           lease expires          | retries exhausted  |
|           (no heartbeat)         |                    |
|                                  v                    |
|           +------------+   +----------+               |
|           | RE-DISPATCH|   |   DEAD   |               |
|           | (attempt+1)|   | (DLQ)    |               |
|           +------------+   +----------+               |
+------------------------------------------------------+
\`\`\`
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

\`\`\`
+-------------+
| Seed URLs   |
+------+------+
       |
+------v------------------+       +---------------------+
| URL Frontier             |       | Robots.txt Cache    |
|                          |<----->| (Per-domain rules)  |
| +------+ +------+       |       +---------------------+
| |Domain| |Domain|  ...  |
| |Queue | |Queue |       |       +---------------------+
| |aaa.  | |bbb.  |       |       | DNS Resolver Cache  |
| |com   | |org   |       |       | (Local + shared)    |
| +--+---+ +--+---+       |       +---------------------+
|    |        |            |
| Priority ordering within |
| each domain queue        |
+------+------------------+
       |
       | next URL (respecting rate limits)
       |
+------v------------------+
| Fetcher Workers          |
| (Distributed pool)       |
|                          |
| - HTTP GET with timeout  |
| - Follow redirects       |
| - Respect crawl-delay    |
+------+------------------+
       |
       | raw HTML + headers
       |
+------v------------------+       +---------------------+
| Content Processor        |------>| Blob Storage (S3)   |
|                          |       | Raw HTML archive    |
| - Parse HTML             |       +---------------------+
| - Extract links          |
| - Compute content hash   |       +---------------------+
| - Detect language        |------>| Content Dedup       |
+------+------------------+       | (Bloom filter +     |
       |                          |  SimHash for near-   |
       | discovered URLs          |  duplicates)         |
       |                          +---------------------+
+------v------------------+
| URL Filter               |
|                          |
| - Normalize URL          |
| - Check robots.txt       |
| - URL dedup (Bloom)      |
| - Domain blocklist       |
| - Depth limit check      |
+------+------------------+
       |
       | new URLs
       |
       +-----> back to URL Frontier
\`\`\`

## Crawl Flow (Single Page)

\`\`\`
Frontier     Fetcher      DNS Cache    Web Server    Processor    URL Filter
   |            |             |             |             |            |
   | next URL   |             |             |             |            |
   |----------->|             |             |             |            |
   |            | resolve DNS |             |             |            |
   |            |------------>|             |             |            |
   |            | IP address  |             |             |            |
   |            |<------------|             |             |            |
   |            |             |             |             |            |
   |            | HTTP GET    |             |             |            |
   |            |---------------------------->             |            |
   |            |             |  HTML resp  |             |            |
   |            |<----------------------------|             |            |
   |            |             |             |             |            |
   |            | raw HTML    |             |             |            |
   |            |------------------------------------->|            |
   |            |             |             |  extract links          |
   |            |             |             |  store HTML  |            |
   |            |             |             |             | new URLs   |
   |            |             |             |             |----------->|
   |            |             |             |             |            | filter
   |            |             |             |             |            | dedup
   | enqueue    |             |             |             |            |
   |<----------------------------------------------------------------|
\`\`\`
`,
    jsCode: `## Deep Dive: URL Frontier Architecture

The frontier is the heart of the crawler -- it determines what gets crawled and in what order.

\`\`\`
+--------------------------------------------------------------+
| URL Frontier                                                  |
|                                                               |
| Front Queues (Priority-based)                                 |
| +----------------------------------------------------------+ |
| | Priority 0 (Critical):  [cnn.com/..., bbc.com/...]      | |
| | Priority 1 (High):      [github.com/..., wiki/...]      | |
| | Priority 2 (Normal):    [blog.example.com/...]           | |
| | Priority 3 (Low):       [archive.example.com/...]       | |
| +---------------------------+------------------------------+ |
|                             |                                 |
|                    select by priority                         |
|                    (weighted random)                          |
|                             |                                 |
| Back Queues (Domain-based)  v                                 |
| +----------------------------------------------------------+ |
| | cnn.com:    [/page1, /page2, /page3] last_fetch: 14:00  | |
| | bbc.com:    [/news, /sport, /world]  last_fetch: 14:01  | |
| | github.com: [/repo1, /repo2]         last_fetch: 13:59  | |
| | wiki...:    [/article1, /article2]   last_fetch: 14:00  | |
| +---------------------------+------------------------------+ |
|                             |                                 |
|                    select domain where                        |
|                    now - last_fetch >= crawl_delay            |
|                             |                                 |
|                             v                                 |
|                       Next URL to fetch                       |
+--------------------------------------------------------------+
\`\`\`

**Two-level queue design**:
1. **Front queues** (priority): Prioritize important/fresh pages
2. **Back queues** (domain): Enforce per-domain rate limits

A URL enters through the front queue (by priority), then is routed to the appropriate domain back queue. The fetcher selects from back queues that are "ready" (enough time since last fetch).

---

## Deep Dive: URL Deduplication at Scale

\`\`\`
+--------------------------------------------------------------+
| URL Dedup Pipeline                                            |
|                                                               |
| Stage 1: URL Normalization                                    |
| +----------------------------------------------------------+ |
| | Input:  HTTP://WWW.Example.Com:80/path?b=2&a=1#frag      | |
| | Step 1: Lowercase scheme + host -> http://www.example...  | |
| | Step 2: Remove default port :80 -> http://www.example...  | |
| | Step 3: Remove fragment #frag -> http://www.example.../   | |
| | Step 4: Sort query params -> ?a=1&b=2                     | |
| | Step 5: Remove trailing slash if no path                  | |
| | Output: http://www.example.com/path?a=1&b=2              | |
| +----------------------------------------------------------+ |
|                                                               |
| Stage 2: Bloom Filter (fast probabilistic check)              |
| +----------------------------------------------------------+ |
| | 10B URLs, 0.1% false positive rate                       | |
| | Size: ~12 GB (10 bits per URL * 10B)                     | |
| |                                                           | |
| | URL hash -> check bloom filter                            | |
| |   "probably seen" -> skip (or verify in DB)              | |
| |   "definitely new" -> add to frontier + bloom            | |
| +----------------------------------------------------------+ |
|                                                               |
| Stage 3: Content Dedup (SimHash for near-duplicates)          |
| +----------------------------------------------------------+ |
| | After fetching, compute SimHash of page content           | |
| |                                                           | |
| | SimHash: 64-bit fingerprint where similar content         | |
| | produces fingerprints with small Hamming distance         | |
| |                                                           | |
| | If Hamming distance(new_hash, existing_hash) < 3:         | |
| |   -> Near-duplicate, skip storing                        | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
\`\`\`

---

## Deep Dive: Politeness and Rate Limiting

\`\`\`
+--------------------------------------------------------------+
| Per-Domain Politeness Engine                                  |
|                                                               |
| +----------------------------------------------------------+ |
| | Domain: example.com                                      | |
| |                                                           | |
| | robots.txt rules:                                        | |
| |   User-agent: *                                          | |
| |   Disallow: /private/                                    | |
| |   Crawl-delay: 2                                         | |
| |                                                           | |
| | Enforced rate: 1 request / 2 seconds                     | |
| | Last fetch: 14:00:03                                     | |
| | Next allowed: 14:00:05                                   | |
| +----------------------------------------------------------+ |
|                                                               |
| Rate Limiter (Token Bucket per domain):                       |
| +----------------------------------------------------------+ |
| | Domain      | Tokens | Rate      | Last Refill            | |
| |-------------|--------|-----------|------------------------| |
| | cnn.com     | 3      | 5/sec     | 14:00:04               | |
| | example.com | 0      | 0.5/sec   | 14:00:03               | |
| | github.com  | 1      | 1/sec     | 14:00:04               | |
| +----------------------------------------------------------+ |
|                                                               |
| Default: 1 req/sec per domain if no robots.txt crawl-delay   |
| Max: 10 req/sec even for domains that allow it               |
+--------------------------------------------------------------+
\`\`\`
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

\`\`\`
+----------+     DNS/Anycast      +-------------------+
| Users    |--------------------->| Global Routing    |
| (Global) |                      | (GeoDNS/Anycast)  |
+----------+                      +--------+----------+
                                           |
                    route to nearest PoP   |
          +--------------------------------+--------------------------------+
          |                                |                                |
+---------v---------+            +---------v---------+            +---------v---------+
| Edge PoP (US-East)|            | Edge PoP (EU-West)|            | Edge PoP (APAC)   |
|                   |            |                   |            |                   |
| +---------------+ |            | +---------------+ |            | +---------------+ |
| | SSD Hot Cache | |            | | SSD Hot Cache | |            | | SSD Hot Cache | |
| | (Top 20%)     | |            | | (Top 20%)     | |            | | (Top 20%)     | |
| +-------+-------+ |            | +-------+-------+ |            | +-------+-------+ |
| | HDD Warm Cache| |            | | HDD Warm Cache| |            | | HDD Warm Cache| |
| | (Long tail)   | |            | | (Long tail)   | |            | | (Long tail)   | |
| +-------+-------+ |            | +-------+-------+ |            | +-------+-------+ |
+---------+---------+            +---------+---------+            +---------+---------+
          |                                |                                |
          | cache miss                     | cache miss                     |
          +--------------------------------+--------------------------------+
                                           |
                                  +--------v----------+
                                  | Origin Shield     |
                                  | (Regional, 3-5    |
                                  |  locations)        |
                                  |                   |
                                  | Aggregates misses |
                                  | from nearby PoPs  |
                                  +--------+----------+
                                           |
                                           | shield miss
                                           |
                                  +--------v----------+
                                  | Origin Server(s)  |
                                  | (Customer infra)  |
                                  +-------------------+
\`\`\`

## Request Flow (Cache Hit vs Miss)

\`\`\`
Client         Edge PoP       Origin Shield    Origin
  |               |                |              |
  | GET /img.jpg  |                |              |
  |-------------->|                |              |
  |               |                |              |
  |  [CACHE HIT]  |                |              |
  |  content      |                |              |
  |<--------------|                |              |
  |               |                |              |
  |  [CACHE MISS] |                |              |
  |               | GET /img.jpg   |              |
  |               |--------------->|              |
  |               |                |              |
  |               | [SHIELD HIT]   |              |
  |               | content        |              |
  |               |<---------------|              |
  |               |                |              |
  |               | [SHIELD MISS]  |              |
  |               |                | GET /img.jpg |
  |               |                |------------->|
  |               |                | content      |
  |               |                |<-------------|
  |               |  content       |              |
  |               |<---------------|              |
  |  content      |                |              |
  |<--------------|                |              |
\`\`\`

## Cache Invalidation Flow

\`\`\`
Admin           Control Plane     PoP US-East    PoP EU-West    PoP APAC
  |                  |                |              |              |
  | POST /purge      |                |              |              |
  | {urls:[/img.jpg]}|                |              |              |
  |----------------->|                |              |              |
  |                  | invalidate     |              |              |
  |                  |--------------->|              |              |
  |                  |----------------------------->|              |
  |                  |----------------------------------------------->|
  |                  |                |              |              |
  |                  |  ACK           |  ACK         |  ACK         |
  |                  |<---------------|              |              |
  |                  |<-----------------------------|              |
  |                  |<-----------------------------------------------|
  |  { purged: 3 }   |                |              |              |
  |<-----------------|                |              |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Cache Key Design and Vary Headers

Correct cache key construction is critical -- serving the wrong cached variant breaks user experience.

\`\`\`
+--------------------------------------------------------------+
| Cache Key Construction                                        |
|                                                               |
| Request:                                                      |
|   URL: https://cdn.example.com/api/products?page=2            |
|   Accept-Encoding: gzip                                       |
|   Accept-Language: en-US                                      |
|   Cookie: session=abc123                                      |
|                                                               |
| Origin Response Headers:                                      |
|   Vary: Accept-Encoding, Accept-Language                      |
|   Cache-Control: max-age=3600                                 |
|   Surrogate-Key: product-list page-2                          |
|                                                               |
| Cache Key = hash(                                             |
|   URL: /api/products?page=2                                   |
|   + Accept-Encoding: gzip                                     |
|   + Accept-Language: en-US                                    |
|   // Cookie NOT included (not in Vary)                        |
| )                                                             |
|                                                               |
| Result: cache_key = "a3f8b2c1..."                             |
| Multiple variants stored per URL (one per Vary combination)   |
+--------------------------------------------------------------+
\`\`\`

**Cache key pitfalls**:
- Including too many headers -> low hit rate (too many variants)
- Missing a Vary header -> serving wrong content to users
- Query parameter ordering -> normalize and sort before hashing

---

## Deep Dive: Origin Shield and Collapse

\`\`\`
Without Origin Shield:              With Origin Shield:

200 PoPs, all miss at once          200 PoPs miss -> 5 shields

  PoP 1 ---+                          PoP 1 --+
  PoP 2 ---+                          PoP 2 --+--> Shield US --+
  PoP 3 ---+--> Origin (200 req!)     PoP 3 --+               |
  ...      |                          ...                      +--> Origin
  PoP 200--+                          PoP 198-+               |     (5 req!)
                                      PoP 199-+--> Shield AP -+
                                      PoP 200-+
\`\`\`

**Request Collapsing** (coalescing) at the shield:

\`\`\`
+--------------------------------------------------------------+
| Origin Shield - Request Collapsing                            |
|                                                               |
| Time 0ms:  PoP-1 requests /img.jpg                           |
|            -> Shield starts fetch from origin                 |
|            -> Marks /img.jpg as "in-flight"                   |
|                                                               |
| Time 5ms:  PoP-2 requests /img.jpg                           |
|            -> Shield sees "in-flight" flag                    |
|            -> PoP-2 added to wait list (no origin request)    |
|                                                               |
| Time 8ms:  PoP-3 requests /img.jpg                           |
|            -> Also added to wait list                         |
|                                                               |
| Time 50ms: Origin responds to original request               |
|            -> Shield caches response                          |
|            -> Responds to PoP-1, PoP-2, PoP-3 simultaneously |
|                                                               |
| Result: 3 edge requests, but only 1 origin request           |
+--------------------------------------------------------------+
\`\`\`

---

## Deep Dive: Cache Eviction Strategy

\`\`\`
+--------------------------------------------------------------+
| Two-Tier Cache with Promotion/Demotion                        |
|                                                               |
| +----------------------------------------------------------+ |
| | SSD Tier (Hot) - 20% of storage                          | |
| |                                                           | |
| | Eviction: LRU with frequency boost                       | |
| | Objects accessed > 3 times stay longer (LFU hybrid)      | |
| |                                                           | |
| | PROMOTE from HDD when access count > threshold           | |
| +----------------------------+-----------------------------+ |
|                              |                               |
|                    demote when SSD full                       |
|                    (least recently + least frequently used)   |
|                              |                               |
| +----------------------------v-----------------------------+ |
| | HDD Tier (Warm) - 80% of storage                        | |
| |                                                           | |
| | Eviction: Pure LRU (large capacity, simpler policy)      | |
| |                                                           | |
| | Objects evicted entirely when HDD is full                | |
| +----------------------------------------------------------+ |
|                                                               |
| Admission policy: Objects must be requested at least twice    |
| before being cached (avoids caching one-hit wonders)          |
+--------------------------------------------------------------+
\`\`\`
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

\`\`\`
+-----------+  +-----------+  +-----------+
| Host      |  | Host      |  | Host      |   (500K hosts)
| Agent     |  | Agent     |  | Agent     |
+-----+-----+  +-----+-----+  +-----+-----+
      |              |              |
      | batch (10s)  |              |
      +--------------+--------------+
                     |
            +--------v---------+
            | Intake Servers   |
            | (Stateless, LB)  |
            | Validate + route |
            +--------+---------+
                     |
            +--------v---------+
            | Kafka Cluster    |
            | (Durable buffer) |
            | 100+ partitions  |
            +--+----------+----+
               |          |
    +----------v--+  +----v-----------+
    | TSDB Writers |  | Alert Evaluator|
    | (Consumers)  |  | (Consumers)    |
    |              |  |                |
    | Gorilla      |  | Threshold      |
    | compress     |  | checks on      |
    | + write      |  | live stream    |
    +------+-------+  +-------+--------+
           |                  |
    +------v-------+   +------v--------+
    | TSDB Cluster |   | Notification  |
    | (Sharded)    |   | Service       |
    |              |   | (Slack/Page/  |
    | Chunk-based  |   |  Email)       |
    | storage      |   +---------------+
    +------+-------+
           |
    +------v-------+
    | Query Engine |
    | Scatter-     |
    | gather       |
    +------+-------+
           |
    +------v-------+
    | Dashboard UI |
    | (Grafana)    |
    +--------------+
\`\`\`

## Ingestion Flow

\`\`\`
Agent          Intake         Kafka          TSDB Writer      TSDB
  |               |              |               |              |
  | batch of      |              |               |              |
  | 200 metrics   |              |               |              |
  | (10s window)  |              |               |              |
  |-------------->|              |               |              |
  |               | validate     |               |              |
  |               | partition by |               |              |
  |               | series_id    |               |              |
  |               |------------->|               |              |
  |               |              | consume batch |              |
  |               |              |-------------->|              |
  |               |              |               | compress     |
  |               |              |               | (Gorilla)    |
  |               |              |               | append to    |
  |               |              |               | chunk        |
  |               |              |               |------------->|
  |               |              |               |   ACK        |
  |               |              |               |<-------------|
\`\`\`

## Query Flow (Dashboard)

\`\`\`
Dashboard      Query Engine     TSDB Shard 1    TSDB Shard 2    TSDB Shard 3
    |               |               |               |               |
    | cpu.usage     |               |               |               |
    | region=us     |               |               |               |
    | last 1 hour   |               |               |               |
    |-------------->|               |               |               |
    |               | scatter       |               |               |
    |               |-------------->|               |               |
    |               |----------------------------->|               |
    |               |----------------------------------------------->|
    |               |               |               |               |
    |               | partial result|               |               |
    |               |<--------------|               |               |
    |               |<-----------------------------|               |
    |               |<-----------------------------------------------|
    |               |               |               |               |
    |               | merge + aggregate             |               |
    |  time-series  |               |               |               |
    |  data points  |               |               |               |
    |<--------------|               |               |               |
\`\`\`
`,
    jsCode: `## Deep Dive: Gorilla Compression for Time-Series Data

Gorilla compression exploits the properties of time-series data: timestamps are regular and values change slowly.

\`\`\`
+--------------------------------------------------------------+
| Gorilla Compression (from Facebook's paper)                   |
|                                                               |
| Timestamp Compression (Delta-of-Delta):                       |
| +----------------------------------------------------------+ |
| | Raw timestamps:   1000, 1010, 1020, 1030, 1040           | |
| | Deltas:                  10,   10,   10,   10            | |
| | Delta-of-deltas:               0,    0,    0             | |
| |                                                           | |
| | Encoding: delta-of-delta = 0 -> store as 1 bit ("0")    | |
| | Regular intervals compress to ~1 bit per timestamp!       | |
| +----------------------------------------------------------+ |
|                                                               |
| Value Compression (XOR-based):                                |
| +----------------------------------------------------------+ |
| | Raw values:   72.5,  72.8,  72.6,  73.1,  72.9           | |
| | XOR with prev: --,  bits1, bits2, bits3, bits4           | |
| |                                                           | |
| | Similar values produce XOR with mostly zero bits          | |
| | Store only the position + length of meaningful bits       | |
| | Typical: 1-3 bytes per value instead of 8 bytes           | |
| +----------------------------------------------------------+ |
|                                                               |
| Compression Result:                                           |
| +----------------------------------------------------------+ |
| | Uncompressed: 24 bytes/point (8B ts + 8B val + 8B meta)  | |
| | Compressed:   ~2 bytes/point (12x compression ratio)      | |
| |                                                           | |
| | 2-hour chunk of 720 points (10s interval):                | |
| | Uncompressed: 17,280 bytes                                | |
| | Compressed:   ~1,440 bytes                                | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
\`\`\`

---

## Deep Dive: Inverted Index for Tag-Based Queries

\`\`\`
+--------------------------------------------------------------+
| Tag Inverted Index                                            |
|                                                               |
| How do we find all series matching:                           |
|   cpu.usage WHERE region=us-east AND service=api              |
|                                                               |
| Inverted Index:                                               |
| +----------------------------------------------------------+ |
| | Tag                    | Series IDs (posting list)       | |
| |------------------------|----------------------------------| |
| | metric=cpu.usage       | {1, 2, 3, 5, 8, 13, 21, ...}  | |
| | region=us-east         | {1, 3, 5, 7, 9, 11, 13, ...}  | |
| | region=eu-west         | {2, 4, 6, 8, 10, 12, ...}     | |
| | service=api            | {1, 2, 5, 9, 13, ...}         | |
| | service=web            | {3, 7, 8, 11, 21, ...}        | |
| | host=web-01            | {1, 5, ...}                    | |
| +----------------------------------------------------------+ |
|                                                               |
| Query resolution:                                             |
|   metric=cpu.usage  -> {1, 2, 3, 5, 8, 13, 21}              |
|   region=us-east    -> {1, 3, 5, 7, 9, 11, 13}              |
|   service=api       -> {1, 2, 5, 9, 13}                     |
|                                                               |
|   INTERSECT all three -> {1, 5, 13}                           |
|                                                               |
|   Result: 3 matching series (out of millions)                 |
|   Now fetch data only for series {1, 5, 13} in time range    |
+--------------------------------------------------------------+
\`\`\`

---

## Deep Dive: Multi-Resolution Rollup Storage

\`\`\`
+--------------------------------------------------------------+
| Data Retention Tiers                                          |
|                                                               |
| Tier 1: Raw Data (10-second resolution)                       |
| Retention: 15 days                                            |
| +----------------------------------------------------------+ |
| | ts         | series_id | value                            | |
| |------------|-----------|----------------------------------| |
| | 14:00:00   | 42        | 72.5                             | |
| | 14:00:10   | 42        | 72.8                             | |
| | 14:00:20   | 42        | 72.6                             | |
| | ...        | ...       | ...                              | |
| +----------------------------------------------------------+ |
|                                                               |
| Tier 2: Minute Rollups                                        |
| Retention: 90 days                                            |
| +----------------------------------------------------------+ |
| | ts         | series_id | avg  | min  | max  | sum  | cnt | |
| |------------|-----------|------|------|------|------|-----| |
| | 14:00      | 42        | 72.6 | 71.2 | 74.1 | 436  | 6   | |
| | 14:01      | 42        | 73.1 | 72.0 | 74.8 | 439  | 6   | |
| +----------------------------------------------------------+ |
|                                                               |
| Tier 3: Hour Rollups                                          |
| Retention: 1+ year                                            |
| +----------------------------------------------------------+ |
| | ts         | series_id | avg  | min  | max  | sum  | cnt | |
| |------------|-----------|------|------|------|------|-----| |
| | 14:00      | 42        | 72.9 | 70.1 | 76.3 | 26244| 360 | |
| | 15:00      | 42        | 74.2 | 71.5 | 78.0 | 26712| 360 | |
| +----------------------------------------------------------+ |
|                                                               |
| Query auto-resolution:                                        |
|   Last 1 hour   -> raw data (10s points)                     |
|   Last 7 days   -> minute rollups                            |
|   Last 90 days  -> hour rollups                              |
+--------------------------------------------------------------+

Why store avg, min, max, sum, AND count?
  avg-of-averages is WRONG when groups have different counts!
  Correct: total_avg = SUM(sums) / SUM(counts)
\`\`\`
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
