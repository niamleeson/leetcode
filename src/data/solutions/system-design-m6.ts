import { ProblemSolution } from './types';

export const solutionsM6: ProblemSolution[] = [
  {
    id: 9025,
    description: `## Clarifying Questions to Ask
- What is the **message throughput** we need to support? (messages/sec, message size)
- What **delivery guarantees** are required? (at-least-once, exactly-once, at-most-once)
- Do messages need to be **strictly ordered**? Globally or per-partition?
- How long should messages be **retained**? Time-based or size-based?
- Do we need **replay** capability for consumers to re-read old messages?

## Functional Requirements
- Producers publish messages to **named topics** divided into partitions
- Consumers subscribe via **consumer groups** with each partition assigned to one consumer per group
- Messages within a partition are **strictly ordered** by sequential offset
- Support **at-least-once** delivery with consumer-driven offset commits
- Consumers can **replay** messages by seeking to any offset

## Non-Functional Requirements
- **High throughput**: Sustain 2M messages/sec writes and 5M reads across the cluster
- **Low latency**: p99 publish < 10ms, p99 consume < 5ms
- **Durability**: Zero message loss for acknowledged writes (replication factor >= 3)
- **Availability**: Tolerate loss of any single broker without downtime

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Average message size | 1 KB |
| Write throughput | 2M msgs/sec x 1 KB = **2 GB/sec** |
| With replication (3x) | **6 GB/sec** total disk writes |
| 7-day retention | 2 GB/sec x 604,800 = **~1.2 PB** |
| Partition count | 50,000 across 200 brokers |
| Per broker | 250 partitions, 18 TB SSD, 64 GB RAM |
`,
    intuition: `A distributed message queue is fundamentally a **distributed commit log** — an append-only sequence of immutable records, split into independent partitions across machines. The core design challenge is achieving millions of messages/sec throughput while guaranteeing strict ordering within partitions and zero data loss through replication.`,
    approach: `## Component Overview

A **broker cluster** stores partitions as append-only segment files on local SSDs. A **controller** (via KRaft/ZooKeeper) manages cluster metadata and leader election. **Producers** hash message keys to determine target partitions. **Consumer group coordinators** assign partitions to consumers and track offsets in a compacted internal topic.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /topics/{topic}/messages\` | Produce | Body: \`{ key, value, headers }\` -> Returns \`{ partition, offset }\` |
| \`GET /topics/{topic}/partitions/{id}/messages\` | Consume | Query: \`offset, limit\` -> Returns messages + nextOffset |
| \`POST /consumers/{group}/subscribe\` | Subscribe | Body: \`{ topics }\` -> Returns member ID + assignments |
| \`POST /consumers/{group}/offsets\` | Commit | Body: \`{ offsets: [{topic, partition, offset}] }\` |

## Data Model

| Entity | Key | Fields |
|--------|-----|--------|
| Segment File | baseOffset | Append-only binary log, 1 GB max per segment |
| Index File | offset | Sparse offset-to-file-position mapping (memory-mapped) |
| Consumer Offset | (group, topic, partition) | Stored in compacted __consumer_offsets topic |
| Cluster Metadata | brokerId | Broker list, topic configs, ISR sets (in KRaft/ZK) |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Producer A"]
    N1["Controller"]
    N2["Load"]
    N3["Balancer"]
    N4["Producer B"]
    N5["Broker 1"]
    N6["Broker 2"]
    N7["Broker 3"]
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

## Produce Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Producer
    participant P1 as Leader Broker
    participant P2 as Follower 1
    participant P3 as Follower 2
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
\`\`\`

## Consume Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Consumer
    participant P1 as Leader Broker
    participant P2 as Page Cache
    participant P3 as Disk
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
\`\`\`
`,
    jsCode: `## Deep Dive: Partition Replication & ISR

The **In-Sync Replica (ISR)** set tracks which replicas are caught up with the leader. Only ISR members can be elected leader, preventing data loss.

\`\`\`mermaid
graph TD
    N0["Partition 0 Replication"]
    N1["Leader (Broker 1) LEO: 1000"]
    N2["Follower A (Broker 2) LEO: 998"]
    N3["Status: IN-SYNC (lag=2, within threshold)"]
    N4["Follower B (Broker 3) LEO: 850"]
    N5["Status: OUT-OF-SYNC (lag=150 > threshold)"]
    N6["High Watermark = min(ISR LEOs) = 998"]
    N7["Consumers can only read up to HW"]
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

- **High watermark** only advances to the minimum offset across all ISR members
- Followers that fall behind the configurable lag threshold are removed from ISR
- Consumers only see messages up to the high watermark (committed messages)

---

## Deep Dive: Consumer Group Rebalancing

When consumers join or leave a group, partitions must be reassigned. Modern Kafka uses **cooperative sticky rebalancing** to minimize disruption.

\`\`\`mermaid
graph TD
    N0["P0, P1"]
    N1["P4, P5"]
    N2["P0,P1,P4"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

---

## Deep Dive: Zero-Copy & Sequential I/O

Kafka achieves millions of messages/sec by exploiting OS-level optimizations.

\`\`\`mermaid
graph TD
    N0["Disk"]
    N1["Kernel"]
    N2["User"]
    N3["NIC"]
    N4["Buffer"]
    N5["Space"]
    N6["Socket"]
    N7["Page"]
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

- **Sequential I/O**: Append-only writes and sequential reads maximize SSD throughput
- **Page cache**: OS caches recently written segments; consumers reading near the tail hit cache
- **Batching**: Producers batch messages; broker writes batches in single disk ops
`,
    explanation: `## Bottlenecks & Improvements
- **Controller as SPOF** -> KRaft replaces ZooKeeper with built-in Raft consensus among brokers, eliminating the external dependency
- **Rebalance storms** -> Cooperative sticky rebalancing minimizes partition movement. Static group membership eliminates rebalances on transient consumer restarts
- **Hot partitions** -> If one key is extremely popular, its partition becomes a bottleneck. Monitor partition lag and consider splitting hot topics or using a sub-partitioning strategy
- **Disk I/O saturation** -> Tiered storage moves old segments to object storage (S3), keeping only recent data on fast local SSDs

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Append-only log over mutable queue | Cannot delete individual messages, but enables sequential I/O and replay |
| Consumer-pull over broker-push | Consumers control their pace (natural backpressure), but adds poll latency |
| At-least-once over exactly-once | Simpler implementation, but consumers must handle idempotency |
| Partitioning over global ordering | Enables parallelism, but ordering only guaranteed within a partition |
| ISR-based replication over quorum | Tighter consistency within ISR, but ISR shrinkage can stall writes |

## Monitoring & Alerting
- **Consumer lag**: Offset difference between log end and consumer position per partition
- **ISR shrink rate**: Alert when replicas fall out of sync frequently
- **Under-replicated partitions**: Any partition with ISR < replication factor
- **Disk usage per broker**: Alert before reaching capacity to trigger data migration
`,
    timeComplexity: "Produce: O(1) append per message + O(replication_factor) network hops. Consume: O(1) offset lookup + sequential read.",
    spaceComplexity: "~1.2 PB for 7-day retention at 2 GB/sec ingestion. 3x replication = ~3.6 PB total. Scales linearly with throughput and retention.",
    examples: `## Follow-Up Discussion Points
- **How would you implement exactly-once semantics?** -> Idempotent producers with sequence numbers per partition + transactional writes that atomically commit offsets and output messages. Consumers use read-committed isolation level.
- **How would you handle a hot partition?** -> Monitor per-partition throughput and lag. Options: increase partition count and re-key, use a compound key to spread load, or implement sub-partitioning within a single logical partition.
- **How would you support multi-datacenter replication?** -> Async cross-DC replication (MirrorMaker 2) with offset translation. Accept higher latency for cross-DC consumers. Use active-passive for strong ordering or active-active with conflict resolution.
- **What if a consumer group needs to reprocess all messages?** -> Seek all partitions to offset 0 or a specific timestamp. The append-only log makes this trivial since no messages are deleted within the retention window.
- **How would you implement tiered storage?** -> Move sealed segments older than a threshold to object storage (S3). Maintain a metadata index mapping offsets to storage tier. Fetch from remote storage on cache miss for old offsets.`,
    hints: [
      "Start by explaining the append-only log abstraction — it is the foundation of everything. Each partition is an independent ordered log, and this is what enables both parallelism and ordering guarantees.",
      "The ISR (In-Sync Replica) mechanism is the key to balancing durability and availability. Explain how the high watermark only advances when all ISR members acknowledge, and why out-of-sync replicas are excluded from leader election.",
      "Zero-copy (sendfile) and sequential I/O are what differentiate Kafka from traditional message queues. Explain the 4-copy vs 2-copy path and why page cache makes consumer reads near the tail essentially memory reads.",
      "Consumer group rebalancing is the most operationally painful aspect. Discuss eager vs cooperative sticky rebalancing and why static group membership helps avoid unnecessary rebalances."
    ],
  },
  {
    id: 9026,
    description: `## Clarifying Questions to Ask
- How many **active users** do we need to support? What is the email volume per day?
- Do we need to support both **sending and receiving** via SMTP/IMAP?
- How important is **full-text search** across email body, subject, and attachments?
- What level of **spam filtering** is expected? Basic SPF/DKIM or ML-based classification?
- Do we need **real-time push notifications** for new email arrival?

## Functional Requirements
- Send and receive emails via **SMTP** protocol with IMAP for client retrieval
- Store emails in **per-user mailboxes** with labels, folders, and threading
- **Full-text search** across email body, subject, sender, and attachments
- **Spam filtering** using SPF, DKIM verification, and ML-based content classification
- Support **attachments** up to 25 MB with larger files via cloud storage links

## Non-Functional Requirements
- **Low latency**: Inbox load < 200ms, search < 500ms, send < 2 seconds
- **High availability**: 99.99% uptime (< 53 min downtime/year)
- **Durability**: Zero email loss once accepted by SMTP gateway
- **Scalability**: Handle 500K emails/sec during peak including spam

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily active users | 500M |
| Emails handled/day | 50 billion |
| Average email size | 75 KB (headers + body) |
| New storage/day | 50B x 75 KB = **3.75 PB/day** |
| Attachment storage/day | 5B emails x 2 MB avg = **10 PB/day** |
| Search index growth/day | ~30% of body = **~1.1 PB/day** |
| Peak email throughput | **~1.5M emails/sec** |
`,
    intuition: `An email service is a combination of a **postal system and a search engine**, operating per-user. The SMTP gateway receives mail, checks for fraud (spam filtering), and routes it to the recipient's mailbox. The critical architectural insight is **per-user partitioning**: since users almost exclusively access their own email, you can partition everything — storage, search index, metadata — by user ID for natural data locality.`,
    approach: `## Component Overview

An **SMTP gateway** accepts inbound connections and performs SPF/DKIM/DMARC checks. A **spam filter pipeline** progressively filters messages from cheap checks to expensive ML classification. A **mail store** (per-user partitioned Bigtable-like store) holds email bodies, while **object storage** handles attachments. A **per-user inverted index** powers full-text search. A **notification service** pushes alerts via WebSocket/FCM/APNs.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/send\` | Send | Body: \`{ to, cc, subject, body, attachments, threadId? }\` -> \`{ messageId, status }\` |
| \`GET /api/v1/mailbox/{label}\` | List | Query: \`page, limit\` -> Returns threads with snippets |
| \`GET /api/v1/search\` | Search | Query: \`q, after, before\` -> Returns matching messages with highlights |
| \`PUT /api/v1/messages/{id}/labels\` | Update | Body: \`{ add: [...], remove: [...] }\` |

## Data Model

| Entity | Key | Fields |
|--------|-----|--------|
| User | userId (PK) | email, quotaUsed, quotaLimit, settings |
| Message | (userId, messageId) | threadId, from, to, cc, subject, bodyRef, timestamp, labels[], isRead, spamScore |
| Thread | (userId, threadId) | subject, participants[], lastTimestamp, messageCount |
| Attachment | attachmentId | messageId, filename, size, storageUrl, contentType |
| Search Index | (userId, token) | posting list: [messageId, position, field] |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Sender"]
    N1["SMTP Gateway"]
    N2["Spam Filter"]
    N3["SMTP"]
    N4["Pipeline"]
    N5["Mail Delivery"]
    N6["Service"]
    N7["Mail Store"]
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

## Email Receive Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Sender MTA
    participant P1 as SMTP Gateway
    participant P2 as Spam Filter
    participant P3 as Mail Store
    participant P4 as Search
    participant P5 as Notify
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

## Email Send Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as API Gateway
    participant P2 as Outbound Queue
    participant P3 as SMTP Sender
    participant P4 as Recipient MTA
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
    jsCode: `## Deep Dive: Spam Filtering Pipeline

Spam filtering uses a **funnel approach** — cheap checks first, expensive ML last. This rejects 80%+ of spam at the cheapest stage.

\`\`\`mermaid
graph TD
    N0["Stage 1: IP Rep"]
    N1["Block known spam"]
    N2["IPs (blacklist)"]
    N3["Stage 2: SPF/"]
    N4["DKIM/DMARC"]
    N5["Authentication"]
    N6["Stage 3: Header"]
    N7["Anomaly Detection"]
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

---

## Deep Dive: Email Threading

Emails form a DAG via In-Reply-To and References headers. Threading reconstructs conversations.

\`\`\`mermaid
graph TD
    N0["Email A (root)"]
    N1["Email B (reply)"]
    N2["Email C (reply)"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

---

## Deep Dive: Per-User Search Index

Each user has their own inverted index for fast, isolated search.

\`\`\`mermaid
graph TD
    N0["Token"]
    N1["User 'alice' Search Index:"]
    N2["Token Posting List"]
    N3["'inoice' [msg42:subject:0, msg99:body:15]"]
    N4["'quarterly' [msg42:subject:1, msg42:body:8]"]
    N5["'from:bob' [msg42, msg55, msg61]"]
    N6["'has:attach' [msg42, msg78]"]
    N7["'label:inbox' [msg42, msg99, msg101, ...]"]
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
`,
    explanation: `## Bottlenecks & Improvements
- **SMTP gateway overload** -> Horizontally scale SMTP servers behind DNS round-robin. Rate limit per sender IP. Use connection pooling for outbound delivery
- **Search index size** -> Per-user sharding keeps indices manageable. Use tiered indexing: recent emails in fast storage, older emails in cold storage with slower search
- **Spam filter latency** -> Async ML classification for borderline cases. Deliver immediately with provisional inbox placement, reclassify in background
- **Attachment storage costs** -> Deduplicate identical attachments via content-hash. Compress and tier to cold storage after 90 days

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Per-user partitioning over global index | Cannot efficiently search across users, but perfect data locality for individual users |
| Async send over synchronous SMTP | User gets fast response, but delivery failures need async notification (bounce emails) |
| Separate body and attachment storage | Extra hop to fetch attachments, but dramatically reduces primary store size |
| Funnel spam filtering over single ML pass | More pipeline stages to maintain, but 80% of spam rejected cheaply before expensive ML |
| Per-user search index over global search | Higher per-user storage overhead, but search latency is independent of total system size |

## Monitoring & Alerting
- **Delivery latency**: Time from SMTP accept to mailbox delivery (p50, p99)
- **Spam false positive rate**: Legitimate emails marked as spam (target < 0.1%)
- **Search latency**: p95 search response time per user percentile
- **Queue depth**: Outbound SMTP queue size — alert if growing, indicates delivery issues
`,
    timeComplexity: "Send: O(1) enqueue + async SMTP delivery. Receive: O(spam_stages) filtering + O(tokens) indexing. Search: O(query_terms) posting list intersection.",
    spaceComplexity: "~3.75 PB/day for email bodies. ~10 PB/day for attachments. ~1.1 PB/day for search indices. Per-user quota (10 GB default) bounds individual growth.",
    examples: `## Follow-Up Discussion Points
- **How would you handle email attachments at scale?** -> Store in object storage (S3/GCS) with content-hash deduplication. Serve via CDN for downloads. Virus-scan asynchronously before making available. Use pre-signed URLs with expiry for access control.
- **How would you implement email threading for forwarded messages?** -> Forwarded emails break the References chain. Use subject-line matching with prefix stripping as fallback. Allow users to manually split/merge threads. Store thread membership as a mutable label.
- **How would you ensure deliverability for outbound emails?** -> Warm up new IP addresses gradually. Implement feedback loops with major providers. Monitor bounce rates and automatically throttle to domains returning 4xx. Maintain separate IP pools for transactional vs marketing email.
- **How would you handle a spam attack flooding a single user?** -> Per-user rate limiting on inbound delivery. Adaptive spam thresholds that tighten during volume spikes. Queue overflow protection that defers low-priority delivery during attacks.
- **How would you support offline access?** -> Sync protocol (like IMAP IDLE + periodic FETCH) that downloads headers and bodies for recent emails. Delta sync for efficient updates. Conflict resolution for label changes made offline.`,
    hints: [
      "Start with per-user partitioning — it is the single most important architectural decision. Since users only access their own email, this gives you natural isolation, locality, and independent scaling.",
      "The spam filtering funnel is critical for handling 500K emails/sec. Order stages by cost: IP reputation (0.1ms) before SPF/DKIM (1ms) before ML classification (50ms). Reject early and cheap.",
      "Email threading via References headers seems simple but has edge cases: forwarded messages, subject line changes, cross-client compatibility. Discuss the fallback strategies.",
      "Separate email body storage from attachment storage early in the design. Attachments are 100x larger and have different access patterns — they need object storage, not your primary database."
    ],
  },
  {
    id: 9027,
    description: `## Clarifying Questions to Ask
- What is the **log volume**? How many events per second and average event size?
- Do we need **real-time** processing or is batch (minutes/hours delay) acceptable?
- What types of **queries** will analysts run? Ad-hoc SQL? Pre-built dashboards?
- How long must logs be **retained**? Do we need hot/warm/cold tiering?
- Do we need **exactly-once** processing guarantees or is at-least-once acceptable?

## Functional Requirements
- **Ingest** structured and unstructured log events from thousands of services
- **Process** events in near-real-time with transformations, enrichment, and aggregation
- **Store** events durably with configurable retention (30 days hot, 1 year warm, 7 years cold)
- **Query** logs via ad-hoc SQL, pre-built dashboards, and alerting rules
- Support **alerting** on patterns, thresholds, and anomalies

## Non-Functional Requirements
- **High throughput**: Ingest 5M events/sec at peak
- **Low query latency**: Dashboard queries < 2 seconds, ad-hoc < 30 seconds
- **Durability**: No log loss once acknowledged by ingestion layer
- **Cost-efficient**: Tiered storage to minimize costs for aging data

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Average event size | 500 bytes |
| Ingestion rate | 5M events/sec = **2.5 GB/sec** |
| Daily volume | 2.5 GB/sec x 86,400 = **216 TB/day** |
| Hot storage (30 days) | 216 TB x 30 = **6.5 PB** |
| Warm storage (1 year) | 216 TB x 365 = **79 PB** (compressed ~20 PB) |
| Query concurrency | 500 concurrent dashboard queries + 50 ad-hoc |
`,
    intuition: `A logging pipeline is fundamentally a **real-time ETL system** with append-heavy writes and analytical reads. The core challenge is bridging the impedance mismatch between high-throughput event ingestion (millions/sec, sub-second latency) and complex analytical queries (aggregations over billions of rows). The solution is a **lambda-like architecture** that separates the write path (streaming) from the read path (columnar storage).`,
    approach: `## Component Overview

An **ingestion layer** (fleet of collectors behind load balancers) accepts events over HTTP/gRPC and writes to a **message queue** (Kafka) for durability and decoupling. A **stream processor** (Flink/Spark Streaming) consumes from Kafka to transform, enrich, and route events. Processed events land in **columnar storage** (ClickHouse/Parquet on S3) for fast analytical queries. A **query engine** serves dashboards and ad-hoc SQL. An **alerting engine** monitors streams for threshold breaches.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/ingest\` | Ingest | Body: \`{ events: [{timestamp, service, level, message, metadata}] }\` batch up to 1000 |
| \`POST /api/v1/ingest/stream\` | Stream | gRPC streaming endpoint for high-throughput services |
| \`POST /api/v1/query\` | Query | Body: \`{ sql, timeRange, limit }\` -> Returns rows + metadata |
| \`POST /api/v1/alerts\` | Alert | Body: \`{ query, threshold, window, channels }\` -> Creates alert rule |

## Data Model

| Entity | Storage | Fields |
|--------|---------|--------|
| Raw Event | Kafka topic | timestamp, service, level, message, traceId, spanId, metadata |
| Processed Event | ClickHouse / Parquet | Columnar: timestamp, service, level, message (indexed), metadata (map) |
| Alert Rule | PostgreSQL | ruleId, query, threshold, window, channels[], enabled |
| Dashboard | PostgreSQL | dashId, panels[], filters[], refreshInterval |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Service"]
    N1["Collector"]
    N2["Fleet (HTTP/"]
    N3["Fleet (gRPC)"]
    N4["Message Queue (Kafka)"]
    N5["Partitioned by service_name"]
    N6["Stream"]
    N7["Processor"]
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

## Event Ingestion Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Service
    participant P1 as Collector
    participant P2 as Kafka
    participant P3 as Flink
    participant P4 as ClickHouse
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
    jsCode: `## Deep Dive: Tiered Storage Architecture

Logs have dramatically different access patterns over time. Tiered storage optimizes cost without sacrificing query capability.

\`\`\`mermaid
graph TD
    N0["Storage Tier Architecture"]
    N1["HOT TIER (0-30 days) - ClickHouse on SSD"]
    N2["Columnar format, fully indexed"]
    N3["Query latency: < 2 sec"]
    N4["Cost: $$$"]
    N5["Partitioned by (date, service)"]
    N6["WARM TIER (30d-1yr) - Parquet on S3"]
    N7["Compressed columnar (Parquet/ORC)"]
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

---

## Deep Dive: Stream Processing & Enrichment

The Flink pipeline transforms raw events into queryable, enriched records.

\`\`\`mermaid
graph TD
    N0["Parse"]
    N1["Normal-"]
    N2["Enrich"]
    N3["Route"]
    N4["Window"]
    N5["Agg"]
    N6["Alert Engine"]
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

---

## Deep Dive: Query Optimization for Log Analytics

\`\`\`mermaid
graph TD
    N0["Scan all rows for last 24h"]
    N1["Filter level = 'ERROR'"]
    N2["Group by service"]
    N3["Time: 45 seconds (200B rows)"]
    N4["Time: 0.3 seconds"]
    N5["ERROR"]
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
`,
    explanation: `## Bottlenecks & Improvements
- **Ingestion spikes** -> Buffer in Kafka with auto-scaling consumer groups. Collectors apply backpressure via HTTP 429 when Kafka lag exceeds threshold. Pre-size partitions for 3x expected peak
- **Query performance on cold data** -> Maintain a metadata catalog (like Hive Metastore) for partition pruning. Pre-compute common aggregations as materialized views. Cache frequent query results
- **Cost of hot storage** -> Aggressively tier data. Apply columnar compression (Parquet/ORC achieves 4-10x compression). Sample old data for dashboards instead of keeping full resolution
- **Flink processing lag** -> Auto-scale Flink task managers based on Kafka consumer lag. Use event-time windowing to handle late-arriving events correctly

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Kafka buffer over direct ingestion | Added latency (ms), but decouples ingestion from processing and provides replay |
| Columnar over row storage | Slower single-event lookups, but 10-100x faster analytical aggregations |
| Tiered storage over single tier | Complex data lifecycle management, but 10x cost reduction for aging data |
| Materialized views over raw queries | Storage overhead and staleness, but sub-second dashboard queries |
| At-least-once over exactly-once | Simpler pipeline, but must handle duplicate events in queries (use approximate counts) |

## Monitoring & Alerting
- **Ingestion lag**: Time between event generation and storage availability
- **Kafka consumer lag**: Per-partition offset delta — alert if growing
- **Query latency by tier**: p50/p99 for hot, warm, and cold storage queries
- **Storage growth rate**: Track daily growth vs capacity to plan ahead
`,
    timeComplexity: "Ingest: O(1) per event append to Kafka + O(enrichment_rules) processing. Query: O(partitions_scanned x rows_per_partition) with partition pruning.",
    spaceComplexity: "~216 TB/day raw ingestion. Hot tier: ~6.5 PB (30 days). Warm tier: ~20 PB compressed (1 year). Columnar compression yields 4-10x reduction.",
    examples: `## Follow-Up Discussion Points
- **How would you handle log format heterogeneity?** -> Schema registry for structured logs. Pattern-matching parsers (Grok) for unstructured logs. A normalization stage in the Flink pipeline that maps all formats to a common schema. Support for custom parsers per service.
- **How would you implement distributed tracing correlation?** -> Require traceId and spanId in all log events. Join logs with trace data in the query layer. Build a trace-to-logs index for fast lookup. Integrate with OpenTelemetry for standardized instrumentation.
- **How would you handle a logging storm from a misbehaving service?** -> Per-service rate limiting at the collector layer. Adaptive sampling that increases during volume spikes. Circuit breaker that drops logs from services exceeding their quota. Alert the owning team.
- **How would you support real-time anomaly detection?** -> Flink windowed aggregations computing baseline metrics (error rate, latency percentiles). Statistical anomaly detection (z-score, EWMA) on the streaming aggregates. ML models for complex pattern detection on sampled data.
- **How would you migrate from an existing logging system?** -> Dual-write during migration: send logs to both old and new systems. Validate by comparing query results. Gradually shift dashboards and alerts. Keep old system in read-only mode until retention expires.`,
    hints: [
      "Start with the ingestion challenge — 5M events/sec is the hardest constraint. A Kafka buffer between collectors and processors is essential for decoupling and backpressure handling.",
      "Tiered storage is the key to cost efficiency. Hot data on SSDs for fast queries, warm data as compressed Parquet on S3, cold data in Glacier. The tier boundaries depend on access patterns.",
      "Materialized views are what make dashboards fast. Pre-aggregate common dimensions (service, level, region) at 1-minute granularity. Dashboard queries sum pre-computed buckets instead of scanning raw data.",
      "Schema evolution is a hidden complexity. Log formats change as services evolve. Use a schema registry and backward-compatible evolution rules to prevent breaking downstream consumers."
    ],
  },
  {
    id: 9028,
    description: `## Clarifying Questions to Ask
- What **types of items** are we recommending? (products, videos, articles, people)
- How many **users and items** are in the system? What is the interaction volume?
- Do we need **real-time** recommendations or can we update periodically (hourly/daily)?
- What **signals** are available? (clicks, purchases, ratings, watch time, etc.)
- How important is **explainability**? Do users need to know why items are recommended?

## Functional Requirements
- Generate **personalized recommendations** for each user based on their behavior
- Support **multiple recommendation types**: "For You", "Similar Items", "Trending"
- Incorporate **real-time signals** (recent clicks/views) within seconds
- Support **content-based** and **collaborative filtering** approaches
- Provide **fallback** recommendations for new users (cold start problem)

## Non-Functional Requirements
- **Low latency**: Recommendations served in < 100ms at p99
- **High throughput**: Serve 500K recommendation requests/sec
- **Freshness**: Incorporate user actions within 5 minutes
- **Scalability**: Support 500M users and 100M items

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Users | 500M total, 100M DAU |
| Items | 100M catalog items |
| User interactions/day | 10B (views, clicks, purchases) |
| Recommendation requests/sec | **500K QPS** (peak: 1M) |
| Feature store size | 500M users x 1 KB = **500 GB** user features |
| Item embeddings | 100M x 256 floats x 4B = **100 GB** |
| Model size | ~10 GB per model instance |
`,
    intuition: `A recommendation engine is fundamentally a **relevance scoring system** — given a user and a catalog of millions of items, score and rank items by predicted relevance. The core challenge is doing this in < 100ms when the item space is too large to score exhaustively. The solution is a **two-stage architecture**: a fast candidate generation stage that narrows millions of items to hundreds, followed by a precise ranking stage that scores those candidates with rich features.`,
    approach: `## Component Overview

An **event ingestion pipeline** captures user interactions in real-time. **Offline training pipelines** build collaborative filtering models and item embeddings on batch data. A **feature store** provides low-latency access to user and item features. A **candidate generation** service retrieves top-N candidates using approximate nearest neighbor search. A **ranking service** scores candidates using a trained ML model. An **API layer** orchestrates the pipeline and applies business rules (diversity, freshness, filtering).

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/recommendations/{userId}\` | Get Recs | Query: \`type, count, context\` -> Returns ranked item list with scores |
| \`GET /api/v1/similar/{itemId}\` | Similar | Query: \`count\` -> Returns similar items |
| \`POST /api/v1/events\` | Track | Body: \`{ userId, itemId, action, timestamp, context }\` |
| \`GET /api/v1/trending\` | Trending | Query: \`category, timeWindow\` -> Returns trending items |

## Data Model

| Entity | Storage | Fields |
|--------|---------|--------|
| User Profile | Feature Store (Redis) | userId, embedding[256], preferences, demographics, recent_actions[50] |
| Item Profile | Feature Store (Redis) | itemId, embedding[256], category, tags, popularity_score, freshness |
| Interaction | Kafka + Data Lake | userId, itemId, action, timestamp, context, sessionId |
| Model | Model Registry (S3) | modelId, version, weights, hyperparams, metrics |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Client"]
    N1["API Gateway /"]
    N2["Recommendation"]
    N3["Load Balancer"]
    N4["API Service"]
    N5["Candidate"]
    N6["Ranking"]
    N7["Business"]
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

## Recommendation Request Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as API Service
    participant P2 as Candidate Gen
    participant P3 as Ranking
    participant P4 as Feature Store
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
    jsCode: `## Deep Dive: Two-Stage Retrieval Architecture

The two-stage approach solves the "score millions of items in 100ms" problem by narrowing the candidate set quickly.

\`\`\`mermaid
graph TD
    N0["Source A: Collaborative Filtering"]
    N1["Source B: Content-Based"]
    N2["Source C: Popularity / Trending"]
    N3["Features per (user, item) pair:"]
    N4["Output: relevance score per candidate"]
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

---

## Deep Dive: Collaborative Filtering with Embeddings

User and item embeddings are learned from interaction data, then used for fast similarity search.

\`\`\`mermaid
graph TD
    N0["Interaction Matrix"]
    N1["Users x Items (sparse)"]
    N2["User1: [0,1,0,0,1,0,1,0,...]"]
    N3["User2: [1,0,1,0,0,0,0,1,...]"]
    N4["User Embeddings"]
    N5["Indexed in FAISS"]
    N6["User Embedding"]
    N7["FAISS ANN Index"]
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

---

## Deep Dive: Handling Cold Start

New users and new items lack interaction history. Multiple fallback strategies address this.

\`\`\`mermaid
graph TD
    N0["Strategy 1: Popularity-based"]
    N1["Strategy 3: Session-based"]
    N2["Strategy 1: Content-based features"]
    N3["Strategy 2: Exploration boost"]
    N4["Strategy 3: Bandit exploration"]
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
`,
    explanation: `## Bottlenecks & Improvements
- **Feature store latency** -> Co-locate feature store with ranking service. Pre-compute and cache user features on session start. Use Redis Cluster with read replicas in each availability zone
- **Model serving at 500K QPS** -> Batch scoring requests. Use ONNX Runtime or TensorRT for optimized inference. Model sharding across GPU instances for large models
- **Stale recommendations** -> Near-real-time feature updates via Kafka streaming. Session-based re-ranking that incorporates in-session actions without full model inference
- **Feedback loops** -> Recommendations bias future training data. Inject random exploration (epsilon-greedy) and monitor recommendation diversity metrics

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Two-stage over single-stage | Added complexity, but scales to 100M items (can't score all in 100ms) |
| ANN over exact nearest neighbor | ~95% recall, but 100x faster than exact search over 100M vectors |
| Batch model training over online | Recommendations may lag behind latest behavior, but stable and reproducible |
| Multiple candidate sources over one | More candidates to rank, but covers more recommendation scenarios (serendipity) |
| Pre-computed embeddings over real-time | Stale for very recent behavior, but O(1) lookup vs O(n) computation |

## Monitoring & Alerting
- **Click-through rate (CTR)**: Primary metric — alert on significant drops
- **Recommendation latency**: p50, p99 for end-to-end recommendation generation
- **Coverage**: Percentage of catalog items ever recommended (avoid popularity bias)
- **Diversity score**: Intra-list diversity of categories in recommendations
`,
    timeComplexity: "Candidate generation: O(1) ANN lookup (~10ms). Ranking: O(candidates x features) ML inference (~20ms). Total: < 100ms p99.",
    spaceComplexity: "~500 GB user features + ~100 GB item embeddings + ~10 GB model weights. ANN index: ~50 GB (quantized). Feature store: ~1 TB with redundancy.",
    examples: `## Follow-Up Discussion Points
- **How would you A/B test recommendation algorithms?** -> Traffic splitting at the API layer. Each user is deterministically assigned to a variant (hash userId % buckets). Track CTR, conversion, engagement per variant. Use statistical significance testing before declaring a winner.
- **How would you handle the filter bubble problem?** -> Inject serendipity by mixing in items from underexplored categories. Epsilon-greedy exploration shows random items to a small percentage of requests. Monitor diversity metrics alongside engagement.
- **How would you add explainability?** -> Track which candidate source and features contributed most to each recommendation. For collaborative filtering: "Users similar to you liked X." For content-based: "Because you watched Y." Store explanation metadata alongside recommendations.
- **How would you handle real-time context?** -> Session-aware re-ranking that adjusts scores based on in-session behavior (clicked items, search queries). Stream session events to the ranking service for immediate incorporation without retraining.
- **How would you scale the offline training pipeline?** -> Distributed training on Spark + parameter servers for matrix factorization. GPU clusters for deep learning models. Incremental training on new data rather than full retraining. Model versioning and canary deployment.`,
    hints: [
      "The two-stage architecture (candidate generation + ranking) is the key insight. You cannot score 100M items with a complex model in 100ms, so you must narrow the candidate set first with a fast, approximate method.",
      "Collaborative filtering captures 'users like you bought X' patterns. Content-based captures 'items similar to what you liked.' Using both together covers more scenarios and provides fallbacks.",
      "Cold start is always a follow-up question. Have strategies ready for both new users (popularity, onboarding, session-based) and new items (content features, exploration boost, bandit methods).",
      "Feature freshness is a hidden challenge. The feature store must reflect recent user actions within minutes, not just daily batch updates. A streaming pipeline from Kafka to the feature store handles this."
    ],
  },
  {
    id: 9029,
    description: `## Clarifying Questions to Ask
- How many **concurrent builds** do we need to support across all users?
- What **languages and environments** must runners support? (Docker, VMs, bare metal)
- How large are typical **build artifacts**? Do we need artifact caching across builds?
- What **security isolation** is required between different users' builds?
- Do we need **self-hosted runners** in addition to cloud-hosted?

## Functional Requirements
- Execute **pipeline definitions** (YAML-based) triggered by git events (push, PR, tag)
- Support **parallel job execution** with dependency graphs (DAG-based)
- Provide **ephemeral runners** with configurable environments (Docker containers)
- Cache and share **build artifacts** between jobs and across builds
- Display **real-time build logs** streamed to the UI

## Non-Functional Requirements
- **Fast start time**: Runner provisioning < 30 seconds
- **Scalability**: Support 100K concurrent builds across the platform
- **Isolation**: Complete security isolation between different users' builds
- **Reliability**: No silent failures — every step succeeds or fails explicitly

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total users/repos | 10M repositories |
| Builds triggered/day | 5M builds/day |
| Peak concurrent builds | **100K** |
| Average build duration | 8 minutes |
| Average build log size | 2 MB |
| Average artifact size | 500 MB per build |
| Artifact storage | 5M x 500 MB = **2.5 PB/day** (with 30-day retention) |
`,
    intuition: `A CI/CD pipeline system is fundamentally a **distributed job scheduler with DAG execution** — it takes a declarative pipeline definition, resolves dependencies between jobs, and orchestrates their parallel execution on ephemeral compute. The core design challenges are: (1) provisioning isolated runners fast enough that builds don't wait, and (2) efficiently sharing artifacts and caches between jobs without compromising security isolation.`,
    approach: `## Component Overview

A **webhook receiver** listens for git events and enqueues build requests. A **pipeline parser** reads YAML definitions and builds a DAG of jobs. A **scheduler** assigns jobs to runners based on resource requirements and availability. A **runner pool manager** maintains warm pools of ephemeral containers/VMs. A **log streaming service** captures and serves real-time build output. An **artifact store** handles caching and sharing of build outputs.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/webhooks/github\` | Trigger | Receives git push/PR events, triggers pipeline |
| \`GET /api/v1/runs/{runId}\` | Status | Returns pipeline status, job statuses, durations |
| \`GET /api/v1/runs/{runId}/jobs/{jobId}/logs\` | Logs | SSE stream of real-time build logs |
| \`POST /api/v1/artifacts/{runId}\` | Upload | Uploads build artifacts from runner |
| \`GET /api/v1/artifacts/{runId}/{name}\` | Download | Downloads artifact for dependent job or user |

## Data Model

| Entity | Storage | Fields |
|--------|---------|--------|
| Pipeline Def | Git repo (.yaml) | trigger, jobs[], env, secrets, caches |
| Pipeline Run | PostgreSQL | runId, repoId, commit, status, triggeredBy, startedAt, finishedAt |
| Job | PostgreSQL | jobId, runId, name, status, runnerId, dependsOn[], steps[] |
| Artifact | S3 + metadata DB | artifactId, runId, jobId, name, path, size, hash, expiresAt |
| Runner | PostgreSQL | runnerId, type, status, labels[], currentJobId, provisionedAt |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["GitHub"]
    N1["Webhook"]
    N2["Pipeline Parser"]
    N3["POST"]
    N4["PR)"]
    N5["Scheduler"]
    N6["Runner Pool"]
    N7["Manager"]
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

## Build Execution Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as GitHub
    participant P1 as Webhook Rcvr
    participant P2 as Parser
    participant P3 as Scheduler
    participant P4 as Runner
    participant P5 as Artifact Store
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
    jsCode: `## Deep Dive: DAG-Based Job Scheduling

Pipeline jobs form a directed acyclic graph. The scheduler must execute jobs respecting dependencies while maximizing parallelism.

\`\`\`mermaid
graph TD
    N0["Pipeline YAML:"]
    N1["jobs:"]
    N2["build: { steps: [...] }"]
    N3["testunit: { needs: [build] }"]
    N4["teste2e: { needs: [build] }"]
    N5["lint: { steps: [...] } # no dependencies"]
    N6["deploy: { needs: [testunit, teste2e, lint] }"]
    N7["DAG Visualization:"]
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

Scheduling Algorithm:
1. Build dependency graph from YAML
2. Topological sort to determine execution order
3. Find all jobs with zero unmet dependencies -> run in parallel
4. As each job completes, check dependents and enqueue newly ready jobs
5. Continue until all jobs complete or one fails

---

## Deep Dive: Runner Pool Management

Maintaining warm runner pools balances fast start times against cost.

\`\`\`mermaid
graph TD
    N0["Cold Pool"]
    N1["Warm Pool"]
    N2["Active"]
    N3["Cleanup"]
    N4["Time of Day"]
    N5["Reason"]
    N6["Low traffic"]
    N7["Ramp up"]
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

---

## Deep Dive: Artifact Caching Strategy

Caching build dependencies (node_modules, .m2, pip cache) dramatically speeds up builds.

\`\`\`mermaid
graph TD
    N0["Layer 1: Runner-local (fastest)"]
    N1["Scope: Same runner, same repo"]
    N2["Hit rate: ~30% (runner reuse)"]
    N3["Latency: 0ms (local disk)"]
    N4["Layer 2: Shared cache (S3 + CDN)"]
    N5["Scope: Same repo, any runner"]
    N6["Hit rate: ~85% (across all builds)"]
    N7["Latency: 2-5 sec download"]
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
`,
    explanation: `## Bottlenecks & Improvements
- **Runner provisioning latency** -> Warm pool of pre-booted containers. Predictive scaling based on historical webhook patterns. Firecracker microVMs for < 5 second cold starts
- **Artifact transfer bottleneck** -> CDN-backed artifact store. Delta transfers for incremental artifacts. Compression before upload. Co-locate artifact cache with runner regions
- **Log streaming at scale** -> Buffer logs in runner, flush every 1 second. Use Server-Sent Events (SSE) for real-time streaming. Store completed logs in object storage, not database
- **Scheduler as bottleneck** -> Partition scheduler by organization/repo. Each partition handles its own job queue independently. Shard state across multiple scheduler instances

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Ephemeral runners over persistent | Higher provisioning cost, but perfect isolation and clean state every build |
| DAG over linear pipeline | More scheduling complexity, but significantly faster builds through parallelism |
| S3 artifacts over runner-local | Network transfer overhead, but enables artifact sharing across runners and regions |
| YAML config over UI-based | Steeper learning curve, but version-controlled, reviewable, and composable pipelines |
| Warm pool over on-demand only | Higher idle cost, but sub-second job start times during peak hours |

## Monitoring & Alerting
- **Queue wait time**: Time from job enqueue to runner assignment — alert if > 30 seconds
- **Build success rate**: Per-repo and platform-wide — alert on sudden drops
- **Runner utilization**: Active/total ratio — scale up if > 80%, scale down if < 30%
- **Artifact cache hit rate**: Should be > 80% — investigate if dropping
`,
    timeComplexity: "Pipeline parse: O(jobs) for DAG construction. Scheduling: O(jobs x log(runners)) for assignment. Total build time bounded by critical path through DAG.",
    spaceComplexity: "~2.5 PB/day artifacts with 30-day retention = ~75 PB. Log storage: 5M builds x 2 MB = 10 TB/day. Runner pool: 100K containers x 4 GB RAM = 400 TB RAM.",
    examples: `## Follow-Up Discussion Points
- **How would you support matrix builds?** -> Expand matrix dimensions (OS x language version x test suite) into individual jobs at parse time. Each combination becomes a node in the DAG. Use a fan-out/fan-in pattern: matrix jobs run in parallel, a summary job waits for all.
- **How would you handle secrets management?** -> Secrets encrypted at rest with per-repo encryption keys. Injected as environment variables at runner start time, never written to logs. Mask secret values in log output. Rotate encryption keys regularly. Audit access logs.
- **How would you implement build caching beyond dependencies?** -> Content-addressable cache keyed on input file hashes. Cache intermediate build artifacts (compiled objects, Docker layers). Use Merkle tree of source files to determine cache validity. Share caches across branches with same dependency tree.
- **How would you support self-hosted runners?** -> Runner agent that polls for jobs (pull model, not push). Agent authenticates via long-lived token scoped to org/repo. Self-hosted runners join a separate pool with custom labels. Security: assume self-hosted runners are less trusted, limit secret exposure.
- **How would you handle flaky tests?** -> Track test result history per test case. Auto-retry failed tests up to N times. Flag tests with > X% flake rate. Quarantine persistently flaky tests to a non-blocking job. Report flake metrics on PRs.`,
    hints: [
      "Start with the DAG execution model — it determines the scheduler design. Jobs form a dependency graph, and the scheduler must maximize parallelism while respecting dependencies. Topological sort is the key algorithm.",
      "Runner provisioning speed is critical to user experience. A warm pool of pre-booted containers (or Firecracker microVMs) provides < 1 second start times. The trade-off is idle cost vs wait time.",
      "Artifact caching is what makes builds fast in practice. A content-addressed cache keyed on lockfile hashes can skip dependency installation entirely. Layer the cache: runner-local, shared S3, and CDN-backed.",
      "Security isolation between builds is non-negotiable. Each build runs in an ephemeral container that is destroyed after use. Secrets are injected at runtime and masked in logs. Network policies prevent cross-build communication."
    ],
  },
  {
    id: 9030,
    description: `## Clarifying Questions to Ask
- How many **tenants** do we need to support? What is the size distribution (SMB vs enterprise)?
- What level of **data isolation** is required? Shared DB, schema-per-tenant, or DB-per-tenant?
- Do tenants need **customization** capabilities? (branding, workflows, custom fields)
- What **billing model** are we using? (per-seat, usage-based, tiered plans)
- Do we need to support **data residency** requirements (GDPR, regional compliance)?

## Functional Requirements
- **Tenant onboarding**: Self-service signup with instant provisioning
- **Data isolation**: Each tenant's data is logically or physically separated
- **Customization**: Per-tenant branding, custom fields, and configurable workflows
- **Billing**: Usage metering, plan management, and automated invoicing
- **Admin console**: Tenant admins manage users, roles, and settings

## Non-Functional Requirements
- **Multi-region**: Support tenants in multiple geographic regions for compliance
- **Noisy neighbor prevention**: One tenant's load cannot degrade another's experience
- **Scalability**: Support 100K tenants from 10-user startups to 50K-user enterprises
- **Availability**: 99.95% uptime with per-tenant SLAs for enterprise tier

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total tenants | 100K (90K small, 9K medium, 1K enterprise) |
| Total users | 10M across all tenants |
| API requests/sec | **200K QPS** (peak: 500K) |
| Storage per tenant | Small: 1 GB, Medium: 50 GB, Enterprise: 5 TB |
| Total storage | 90K x 1 GB + 9K x 50 GB + 1K x 5 TB = **5.5 PB** |
| Billing events/day | 50M metering events |
`,
    intuition: `A multi-tenant SaaS platform is fundamentally an **isolation vs efficiency trade-off**. Full isolation (dedicated infrastructure per tenant) provides the strongest guarantees but is cost-prohibitive for small tenants. Shared infrastructure is efficient but creates noisy-neighbor risks and data leakage concerns. The key insight is a **tiered isolation model**: shared pools for small tenants, dedicated resources for enterprise tenants, with the tenant context threaded through every layer of the stack.`,
    approach: `## Component Overview

An **API gateway** routes requests with tenant context (from JWT or subdomain). **Application servers** are stateless and tenant-aware, resolving tenant configuration from a **config service**. A **data layer** provides tiered isolation: shared database with row-level security for small tenants, schema-per-tenant for medium, and dedicated databases for enterprise. A **billing service** meters usage and manages subscriptions. A **provisioning service** handles tenant onboarding and resource allocation.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/tenants\` | Onboard | Body: \`{ name, plan, region, admin }\` -> Creates tenant + admin user |
| \`GET /api/v1/tenants/{id}/settings\` | Config | Returns tenant configuration, branding, feature flags |
| \`PUT /api/v1/tenants/{id}/plan\` | Billing | Body: \`{ plan, seats }\` -> Upgrades/downgrades plan |
| \`GET /api/v1/admin/usage\` | Usage | Query: \`tenantId, period\` -> Returns metered usage |

## Data Model

| Entity | Storage | Fields |
|--------|---------|--------|
| Tenant | Control Plane DB | tenantId, name, plan, region, status, createdAt, config |
| User | Tenant Data DB | userId, tenantId, email, role, permissions, lastLogin |
| Plan | Control Plane DB | planId, name, limits (seats, storage, API calls), price |
| Usage Event | Kafka + TimescaleDB | tenantId, metric, value, timestamp |
| Invoice | Billing DB | invoiceId, tenantId, period, lineItems[], total, status |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Tenant A"]
    N1["Tenant Config"]
    N2["JWT"]
    N3["Service"]
    N4["Tenant B"]
    N5["Application Tier"]
    N6["Tenant context"]
    N7["Shared DB"]
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

## Request Flow with Tenant Context

\`\`\`mermaid
sequenceDiagram
    participant P0 as Client
    participant P1 as API Gateway
    participant P2 as Config Svc
    participant P3 as App Server
    participant P4 as Database
    P0->>P1: request
    P1-->>P0: response
    P1->>P2: request
    P2-->>P1: response
    P2->>P3: request
    P3-->>P2: response
    P3->>P4: request
    P4-->>P3: response
\`\`\`

## Tenant Onboarding Flow

\`\`\`mermaid
sequenceDiagram
    participant P0 as Admin
    participant P1 as API
    participant P2 as Provisioning
    participant P3 as DB
    participant P4 as Billing
    participant P5 as Config
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
    jsCode: `## Deep Dive: Tiered Data Isolation

The isolation strategy depends on tenant size, compliance needs, and willingness to pay.

\`\`\`mermaid
graph TD
    N0["Shared PostgreSQL Cluster"]
    N1["CREATE POLICY tenant_isolation ON orders"]
    N2["USING (tenant_id = current_setting("]
    N3["Every query automatically filtered:"]
    N4["SELECT * FROM orders"]
    N5["Pros: Cost-efficient, simple management"]
    N6["Pros: Better isolation, per-tenant backup"]
    N7["DB: tenant_xyz"]
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

---

## Deep Dive: Noisy Neighbor Prevention

Preventing one tenant from degrading others requires multi-layer resource controls.

\`\`\`mermaid
graph TD
    N0["Plan-based limits:"]
    N1["Plan"]
    N2["Burst"]
    N3["Starter"]
    N4["Professional"]
    N5["Enterprise"]
    N6["Per-tenant limits:"]
    N7["Shared DB tenants:"]
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

---

## Deep Dive: Usage Metering & Billing

Accurate usage metering is critical for usage-based billing.

\`\`\`mermaid
graph TD
    N0["API"]
    N1["Kafka"]
    N2["Metering"]
    N3["Timeseries"]
    N4["Gateway"]
    N5["Topic"]
    N6["Aggregator"]
    N7["Hourly +"]
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
`,
    explanation: `## Bottlenecks & Improvements
- **Tenant config resolution latency** -> Cache tenant config in API gateway with short TTL (60s). Use consistent hashing to route same tenant to same gateway node for warm cache. Pre-load config for active tenants
- **Database connection exhaustion** -> Per-tenant connection pooling via PgBouncer. Shared pool tenants get a limited slice. Enterprise tenants get dedicated connection pools. Monitor and alert on pool saturation
- **Billing accuracy** -> Idempotent metering events with unique eventIds for deduplication. Reconciliation job compares metered usage against actual resource consumption. Double-entry bookkeeping for financial accuracy
- **Tenant migration between tiers** -> Background migration job that copies data from shared to dedicated DB. Use CDC (Change Data Capture) to keep both in sync during migration. Switch routing atomically when caught up

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Tiered isolation over uniform | More operational complexity, but optimal cost/isolation balance per tenant size |
| Row-level security over app-level filtering | Harder to debug queries, but impossible to accidentally leak data across tenants |
| Usage-based billing over flat rate | Complex metering pipeline, but fairer pricing and better unit economics |
| Subdomain routing over path-based | More DNS/TLS management, but cleaner tenant isolation and custom branding |
| Shared app tier over dedicated | Noisy neighbor risk, but dramatically lower cost for thousands of small tenants |

## Monitoring & Alerting
- **Per-tenant latency**: p50/p99 latency per tenant — detect noisy neighbors early
- **Quota utilization**: Percentage of plan limits consumed — warn tenants approaching limits
- **Billing pipeline lag**: Time from event to aggregated usage — alert if metering falls behind
- **Tenant health score**: Composite metric of error rate, latency, and resource usage per tenant
`,
    timeComplexity: "Request routing: O(1) tenant resolution + O(1) config lookup (cached). Database: O(query) with RLS filter added transparently. Billing aggregation: O(events) per metering window.",
    spaceComplexity: "~5.5 PB total storage across tiers. Per-tenant overhead: ~1 KB config + connection pool. Metering events: ~50M/day x 200 bytes = ~10 GB/day.",
    examples: `## Follow-Up Discussion Points
- **How would you handle tenant data migration between isolation tiers?** -> CDC-based migration: replicate data from shared DB to dedicated DB in real-time. Once caught up (lag < 1 second), perform atomic cutover by updating the routing table. Rollback by reverting the route. Keep source data for 7 days as safety net.
- **How would you implement per-tenant feature flags?** -> Tenant config includes a feature flag map. The config service evaluates flags based on tenant plan, region, and custom overrides. Flags cached at the app tier. LaunchDarkly-style SDK for gradual rollouts to specific tenant percentages.
- **How would you handle a tenant requesting data deletion (GDPR)?** -> Enumerate all storage systems containing tenant data (DB, search index, logs, backups, analytics). Execute deletion in each system with verification. For shared DBs, delete rows. For dedicated DBs, drop the instance. Generate a deletion certificate with audit trail.
- **How would you support white-label/custom domains?** -> Tenant config includes custom domain + TLS certificate. API gateway maps custom domain to tenantId via a domain lookup table. Use Let's Encrypt for automated certificate provisioning. CDN layer handles TLS termination for custom domains.
- **How would you handle plan upgrades mid-billing-cycle?** -> Prorate charges based on days remaining in the cycle. Immediately apply new plan limits (higher API quotas, more storage). Generate a credit for unused portion of old plan and a charge for remaining portion at new plan rate. Idempotent upgrade operation to handle retries.`,
    hints: [
      "Start with the isolation model — it is the most important architectural decision. Explain the spectrum from shared DB (cheap, risky) to dedicated DB (expensive, isolated) and why a tiered approach matches tenant size to isolation level.",
      "Row-level security (RLS) in PostgreSQL is the strongest defense against data leakage in shared databases. Every query is automatically filtered by tenant_id, making it impossible for application bugs to expose other tenants' data.",
      "Noisy neighbor prevention requires multi-layer defense: rate limiting at the gateway, connection pool limits at the database, and query timeouts at the application. No single layer is sufficient.",
      "Usage metering must be idempotent and eventually consistent. Use unique event IDs for deduplication, async aggregation for efficiency, and periodic reconciliation to catch discrepancies before invoicing."
    ],
  },
];
