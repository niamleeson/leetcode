import { ProblemSolution } from './types';

export const sdiVol1M4: ProblemSolution[] = [
  {
    id: 9112,
    description: `## Clarifying Questions to Ask
- Is this **1-on-1 messaging** only, or do we also need **group chat**?
- What platforms do we support — **mobile**, **web**, or both?
- What is the expected **daily active user** (DAU) count?
- What is the **maximum group size**?
- Do we support only **text messages**, or also **media** (images, files, video)?
- Do we need **end-to-end encryption**?
- Is there a **message history** retention requirement?
- Do we need **push notifications** for offline users?
- Should the system support **multi-device** access (same account on phone + laptop)?

## Functional Requirements
1. **One-on-one chat** — real-time text messaging between two users
2. **Group chat** — up to 100 members per group
3. **Online presence** — show whether a user is online, offline, or away
4. **Multi-device support** — messages sync across all logged-in devices
5. **Push notifications** — notify offline users of new messages

## Non-Functional Requirements
- **Low latency** — messages delivered within 100ms for online users
- **High availability** — system remains operational even during partial failures
- **Message ordering** — messages appear in the correct chronological order within a conversation
- **At-least-once delivery** — no messages are silently lost; duplicates can be handled at the application layer
- **Data durability** — messages persist and survive server crashes

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| DAU | 50M |
| Messages/day | 2B |
| Avg message size | ~100 bytes |
| Write QPS | ~23K (2B / 86400) |
| Peak QPS | ~46K (2x average) |
| Daily storage | ~200 GB (2B × 100 bytes) |
| Annual storage | ~73 TB |
| WebSocket connections | ~5M concurrent (10% of DAU online) |
`,
    examples: `## Follow-Up Discussion Points

### Read Receipts
Introduce a \`message_status\` table or embed status within the message record: \`sent\`, \`delivered\`, \`read\`. When the recipient's client renders a message, it sends an ack back to the server, which updates the status and notifies the sender. For group chats, track per-member read status. This can generate significant write traffic in large groups — consider batching status updates.

### @Mentions in Group Chat
Parse message text on the server for \`@username\` patterns. When a mention is detected, treat it like a high-priority notification — send a push notification even if the user has muted the group. Store mention references in a \`mentions\` table indexed by \`user_id\` for quick lookup.

### Message Search
Full-text search across message history requires a dedicated search index (Elasticsearch). Index messages asynchronously — when a new message is written to the KV store, publish an event to a Kafka topic consumed by an indexing service. Keep the search index eventually consistent with the primary store.

### Scaling to Very Large Groups (10K+ Members)
At this scale, per-member fanout becomes expensive. Switch to a **pull-based model**: instead of pushing messages to each member's queue, write the message once to the group's message stream. Clients poll or subscribe to the group stream. Use a shared cursor so each client knows where it left off.

### Typing Indicators
Typing indicators are ephemeral — they don't need to be persisted. When a user starts typing, their client sends a lightweight event through the WebSocket. The chat server broadcasts this to the other participant(s) in the conversation. Use a short TTL (3-5 seconds) — if no refresh signal arrives, the indicator disappears.
`,
    intuition: `The fundamental challenge of a chat system is maintaining **persistent, bidirectional connections** between clients and servers for instant message delivery. HTTP's request-response model introduces unacceptable latency for real-time chat, so we rely on **WebSockets** for the messaging path while keeping HTTP for non-real-time operations (login, profile updates, group management). The core architectural decisions revolve around: (1) mapping users to their connected chat servers via a **service discovery** layer, (2) handling **offline users** by queuing messages and triggering push notifications, (3) ensuring **message ordering** with server-generated sequential IDs, and (4) managing **group fanout** — delivering a single group message to all members efficiently.`,
    approach: `## High-Level Design

### Communication Protocol Selection
Not all operations need the same protocol:
- **HTTP** for stateless operations: login, signup, profile updates, group management, friend list retrieval. These are infrequent, request-response interactions where HTTP works perfectly.
- **WebSocket** for real-time messaging: after an initial HTTP handshake, the connection upgrades to a persistent, full-duplex WebSocket. Both client and server can push data at any time. Each client maintains one WebSocket connection to a chat server.

### Stateful Chat Servers
Unlike stateless web servers, chat servers are **stateful** — each server maintains a set of active WebSocket connections. This means the system needs to know which chat server a given user is connected to. We use a **service discovery** component (ZooKeeper or etcd) that maintains a mapping of \`user_id → chat_server_id\`. When a message needs to be delivered, the system looks up which server holds the recipient's connection.

### API Design

| API | Method | Description |
|-----|--------|-------------|
| /api/messages/send | POST (over WS) | Send a message to a user or group |
| /api/messages/fetch | GET | Fetch message history for a conversation |
| /api/groups/create | POST | Create a new group chat |
| /api/groups/:id/members | POST/DELETE | Add or remove group members |
| /api/presence/:userId | GET | Get a user's online status |
| /api/users/profile | GET/PUT | Read or update user profile |

### Data Model

**1-on-1 Message Table** (partitioned by \`conversation_id\`)

| Column | Type | Description |
|--------|------|-------------|
| conversation_id | UUID | Hash of sorted(sender_id, recipient_id) |
| message_id | Snowflake ID | Time-ordered unique ID |
| sender_id | UUID | Who sent the message |
| content | Text | Message body |
| type | Enum | text, image, file |
| created_at | Timestamp | Server receive time |

**Group Message Table** (partitioned by \`group_id\`)

| Column | Type | Description |
|--------|------|-------------|
| group_id | UUID | Group identifier |
| message_id | Snowflake ID | Time-ordered unique ID |
| sender_id | UUID | Who sent the message |
| content | Text | Message body |
| type | Enum | text, image, file |
| created_at | Timestamp | Server receive time |

### Database Choice
We choose a **wide-column store** like Apache Cassandra or HBase. The access pattern is write-heavy and sequential — messages are appended in time order and read in time-range queries within a conversation. Cassandra's log-structured merge tree is optimized for exactly this pattern. It also provides excellent horizontal scalability and tunable consistency. We do NOT need complex joins or transactions for message data.
`,
    code: `## Architecture Diagrams

### Overall System Architecture

\`\`\`mermaid
graph TD
    N0["Client (App)"]
    N1["Client (Web)"]
    N2["Load Balancer (L4 / Sticky)"]
    N3["Chat Server"]
    N4["Message Queue (Kafka)"]
    N5[("KV Store")]
    N6["ZooKeeper (Service Discovery)"]
    N7["Push Notification"]
    N0 --> N2
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N3 --> N5
    N3 --> N6
    N3 --> N7
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Client (App) / Client (Web)** — The end-user devices (mobile app or browser) that establish WebSocket connections for real-time messaging and HTTP connections for non-real-time operations.
- **Load Balancer (L4 / Sticky)** — Distributes incoming connections across chat servers using sticky sessions so that a user's WebSocket remains bound to the same server for the duration of the session.
- **Chat Server** — A stateful server that maintains active WebSocket connections and routes messages between users. It is the core of the real-time messaging path.
- **Message Queue (Kafka)** — Buffers and persists messages for reliable delivery, enabling per-user message queues and decoupling senders from receivers.
- **KV Store** — A wide-column store (Cassandra) optimized for write-heavy, time-ordered message storage and retrieval by conversation.
- **ZooKeeper (Service Discovery)** — Maintains the mapping of which user is connected to which chat server, enabling accurate message routing across the server fleet.
- **Push Notification** — Delivers messages to offline users via platform-specific push services (APNs, FCM) when WebSocket delivery is not possible.

### 1-on-1 Message Delivery Sequence

\`\`\`mermaid
graph TD
    N0["Browser / Mobile App"]
    N1["API Gateway / CDN Edge"]
    N2["Query Service"]
    N3["Trie Cache"]
    N4["Server Cache"]
    N5["Data Gathering Service"]
    N6["Analytics Logs"]
    N7["Trie Builder (weekly)"]
    N8[("Trie Storage (S3)")]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N2 --> N4
    N5 --> N6
    N6 --> N7
    N7 --> N8
    N8 --> N3
    N8 --> N4
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Browser / Mobile App** — The client device that sends prefix queries as the user types and renders the autocomplete suggestions.
- **API Gateway / CDN Edge** — Entry point that caches frequent autocomplete responses at the edge, reducing latency and offloading traffic from backend servers.
- **Query Service** — Receives prefix queries and looks up the top-k suggestions from the in-memory trie or server cache.
- **Trie Cache** — An in-memory copy of the pre-built trie on each query server, enabling O(prefix_length) lookups without any disk I/O.
- **Server Cache** — A Redis layer that caches recent query results to avoid repeated trie traversals for popular prefixes.
- **Data Gathering Service** — The offline pipeline that collects search queries, aggregates frequencies, and orchestrates the trie rebuild process.
- **Analytics Logs** — Raw search query logs that feed into the aggregation pipeline to compute query frequencies.
- **Trie Builder (weekly)** — A batch job that reads aggregated frequency data and constructs a new trie with pre-computed top-k results at every node.
- **Trie Storage (S3)** — Durable storage for serialized trie snapshots, from which query servers load new tries during blue-green swaps.

### 1-on-1: User B is Offline

\`\`\`mermaid
graph TD
    N0["Desktop Client"]
    N1["File Watcher"]
    N2["API Gateway / LB"]
    N3["Block Servers"]
    N4["Metadata Service"]
    N5["Notification Service"]
    N6[("Cloud Storage")]
    N7[("Metadata Database")]
    N0 --> N1
    N0 --> N2
    N2 --> N3
    N2 --> N4
    N2 --> N5
    N3 --> N6
    N4 --> N7
    N5 --> N0
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Desktop Client** — The user's local application that monitors files and communicates with the server for uploads, downloads, and sync operations.
- **File Watcher** — An OS-level component that monitors the sync folder for file system events (create, modify, delete) and triggers the sync process.
- **API Gateway / LB** — Routes client requests to the appropriate backend service and distributes load across server instances.
- **Block Servers** — Receive uploaded file blocks, verify integrity via hash checks, and store them in cloud object storage.
- **Metadata Service** — Manages file metadata (paths, versions, block lists, permissions) backed by a relational database for ACID guarantees.
- **Notification Service** — Pushes change notifications to other connected devices via long polling or WebSocket so they can pull updated files.
- **Cloud Storage** — Durable object storage (S3) where encrypted, compressed file blocks are persisted using content-addressed keys.
- **Metadata Database** — A relational store (PostgreSQL) holding file metadata, version history, and sharing records with strong consistency.

### Group Message Fanout

\`\`\`mermaid
sequenceDiagram
    participant S as Sender
    participant CS as Chat Server
    participant MQ as Message Queues
    participant UB as User B (online)
    participant UC as User C (online)
    participant UD as User D (offline)

    S->>CS: Send to group_123
    CS->>MQ: Persist msg to group table
    CS->>MQ: Fan out to each member's queue
    MQ->>UB: Deliver via queue_B
    MQ->>UC: Deliver via queue_C
    MQ->>UD: Deliver via queue_D (→ push notification)
\`\`\`
`,
    jsCode: `## Deep Dive

### Message Synchronization Across Devices
Each device tracks its position in the message stream using a \`last_seen_message_id\`. When a device reconnects (app foregrounded, network restored, new login), it sends its \`last_seen_message_id\` to the server and receives all messages with IDs greater than that value. This is efficient because message IDs (Snowflake IDs) are monotonically increasing — the query becomes a simple range scan in Cassandra.

For multi-device sync, each device for the same user maintains its own cursor. When User A has both a phone and laptop connected, the server delivers messages to BOTH devices via their respective WebSocket connections. The per-device \`last_seen_message_id\` ensures that if the phone was offline, it catches up independently without affecting the laptop.

### Online Presence System
Presence is tracked through a **heartbeat mechanism**:
1. When a user logs in and establishes a WebSocket, the server marks them as \`online\` in a presence KV store (Redis) with a TTL of 30 seconds.
2. The client sends a heartbeat every 5 seconds. Each heartbeat refreshes the TTL.
3. If no heartbeat arrives within 30 seconds, the TTL expires and the user is automatically marked \`offline\`.
4. On explicit logout or WebSocket disconnect, the server immediately sets status to \`offline\`.

This approach is robust against network hiccups (a missed heartbeat doesn't instantly mark the user offline) and doesn't require explicit disconnect handling for every failure scenario.

### Presence Fanout Strategy
Broadcasting presence changes to all of a user's contacts is expensive at scale. The strategy differs by context:

**Small groups (under 100 members):** When a member's status changes, the server broadcasts the update to all other members who are currently online. This is acceptable because the fanout is bounded.

**Large friend lists / channels:** Switch to an **on-demand pull model**. Don't push presence updates proactively. Instead, when a user opens a conversation or views their contact list, the client fetches the current presence status of the visible users. This avoids a presence storm when a popular user logs in.

### Group Chat Delivery in Detail
When a message is sent to a group:
1. The chat server writes the message to the group message table (keyed by \`group_id\`, sorted by \`message_id\`).
2. The server looks up the group's member list from the metadata store.
3. For each member, the server pushes the message to that member's per-user message queue.
4. Each member's connected chat server dequeues the message and delivers it over WebSocket.
5. For offline members, the push notification service is triggered instead.

For groups up to 100 members, this write-amplification (one message becomes 100 queue writes) is manageable. For larger groups, you'd switch to a shared group stream model.

### Message Ordering with Snowflake IDs
We cannot rely on client timestamps (clocks drift, devices lie). Instead, we generate **Snowflake IDs** on the server side — 64-bit IDs composed of:
- 41 bits: millisecond timestamp
- 10 bits: machine/datacenter ID
- 13 bits: sequence number within the millisecond

These IDs are globally unique, roughly time-ordered, and sortable. Within a single conversation, messages are ordered by their Snowflake ID. This provides a consistent ordering that all clients agree on, regardless of network delays.

### Media Message Handling
Text messages flow through chat servers, but media (images, files, videos) should NOT pass through them — they'd choke the WebSocket connections. Instead:
1. The client requests a **pre-signed upload URL** from the API server.
2. The client uploads the file directly to **object storage** (S3).
3. Once the upload completes, the client sends a chat message containing the media URL and metadata (thumbnail URL, file size, MIME type).
4. The recipient's client downloads the media from object storage (via CDN) when rendering the message.

This keeps the chat server path lightweight — it only handles small JSON payloads, never large binary files.

### End-to-End Encryption Overview
For E2E encryption, each user generates a **public/private key pair** on their device. The public key is registered with the server. When User A wants to message User B:
1. User A fetches User B's public key from the server.
2. User A encrypts the message with User B's public key.
3. The encrypted message flows through the chat servers — which cannot decrypt it.
4. User B decrypts the message with their private key.

For group chats, E2E encryption is more complex — typically using a shared group key that is rotated when members join or leave (Signal Protocol's "Sender Keys" approach).

### Multi-Device Sync Deep Dive
With E2E encryption and multi-device support, each device has its own key pair. When User A has 3 devices, a message from User B must be encrypted separately for each device's public key (or use a key-wrapping scheme). The server delivers the appropriately encrypted copy to each device. This is why some messaging apps require "linking" a new device — it's registering a new public key.
`,
    explanation: `## Wrap Up

### Scaling Strategies
- **Horizontal chat server scaling**: Add more chat servers behind the load balancer. ZooKeeper tracks which users are connected where, so routing remains accurate.
- **Message queue partitioning**: Partition Kafka topics by user_id so each user's message queue lands on a consistent partition. This preserves ordering within a conversation.
- **KV store sharding**: Cassandra naturally shards across nodes using consistent hashing on the partition key (\`conversation_id\` or \`group_id\`).
- **Presence store scaling**: Redis Cluster for the presence data, sharded by user_id. Presence data is ephemeral, so losing a shard temporarily is tolerable.

### Trade-Offs

| Decision | Trade-Off |
|----------|-----------|
| WebSocket for messaging | Persistent connections consume server resources, but HTTP polling introduces unacceptable latency |
| Per-user message queues | Higher storage cost and write amplification for groups, but guarantees per-user delivery and ordering |
| Cassandra for messages | Excellent write throughput and sequential read, but no complex queries (search requires a separate index) |
| Heartbeat-based presence | Simple and fault-tolerant, but has a 30-second staleness window for offline detection |
| Snowflake IDs for ordering | Globally unique and sortable, but requires a dedicated ID generation service |
| Client-side media upload | Keeps chat servers lightweight, but requires pre-signed URL infrastructure and CDN |

### What We Covered
1. WebSocket-based real-time messaging with HTTP for non-real-time operations
2. Stateful chat servers with ZooKeeper for service discovery
3. Per-user message queues for reliable delivery
4. Cassandra for write-optimized, time-ordered message storage
5. Heartbeat-based presence with smart fanout strategies
6. Snowflake ID generation for consistent message ordering
7. Media handling via pre-signed URLs and object storage
8. Multi-device sync using per-device cursors
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Do not send media files through WebSocket connections or chat servers — use pre-signed URLs for direct upload to object storage, then send only the URL as a message.',
      'Presence fanout for popular users can create thundering-herd problems. Use on-demand presence queries for large contact lists instead of broadcasting every status change.',
      'Message ordering must use server-generated IDs (like Snowflake), not client timestamps. Client clocks are unreliable and can be manipulated.',
      'For group chat, per-member fanout (copying the message to each member queue) works for groups up to ~100, but becomes prohibitively expensive for larger groups — switch to a shared stream model.',
    ],
  },
  {
    id: 9113,
    description: `## Clarifying Questions to Ask
- Do we match only on **prefix** (what the user has typed so far), or also substring/fuzzy matching?
- How many suggestions should we return? (Assume **5**)
- How do we **rank** suggestions — by frequency, recency, personalization, or some combination?
- Do we need to support **multiple languages** and character sets?
- What is the expected **DAU** and query volume?
- Should suggestions update in **real-time** (trending queries) or is a periodic rebuild acceptable?
- Do we need to **filter** harmful, offensive, or NSFW suggestions?
- Should results be **personalized** per user?

## Functional Requirements
1. Given a prefix string typed by the user, return the **top 5 most frequently searched** queries matching that prefix
2. Results must appear within **100ms** of each keystroke
3. Suggestions are ranked primarily by **search frequency**

## Non-Functional Requirements
- **Low latency** — sub-100ms response for every keystroke
- **High availability** — autocomplete is a UX feature, so degradation is tolerable but outages are not
- **Scalability** — handle millions of concurrent users
- **Eventual consistency** — frequency data can be slightly stale; real-time accuracy is not critical

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| DAU | 10M |
| Searches per user per day | 8 |
| Total searches/day | 80M |
| Avg characters per query | 20 |
| Autocomplete requests/search | ~10 (one per keystroke, optimized) |
| Total autocomplete QPS | ~9,200 (80M × 10 / 86400) |
| Peak QPS | ~18,400 (2x average) |
| Unique query terms | ~100M |
| Avg query length | ~30 bytes |
| Trie storage (with metadata) | ~5 GB |
`,
    examples: `## Follow-Up Discussion Points

### Real-Time Trending Queries
For breaking news or viral events, the weekly trie rebuild is too slow. Add a **short-term trending layer**: maintain a separate small trie built from the last 1-2 hours of search data. At query time, merge results from the main trie and the trending trie, giving trending results a ranking boost. The trending trie is rebuilt every few minutes and is small enough to construct quickly.

### Personalized Autocomplete
Layer personalization on top of global frequency. Maintain a lightweight per-user search history (last 1000 queries). At query time, check the user's local history first, then merge with global results. Personal results can be ranked higher. Store per-user data in a fast KV store keyed by user_id. This adds minimal latency since the personal data set is small.

### Multi-Language Support
Different languages have different tokenization rules. CJK languages (Chinese, Japanese, Korean) don't use spaces between words, requiring specialized segmentation. Store a separate trie per language or locale. Detect the user's language from their input method or browser locale and route to the appropriate trie.

### Deletion and Privacy
Users should be able to delete their search history. This requires: (1) removing entries from the per-user history immediately, (2) decrementing the global frequency counter (which takes effect at the next trie rebuild). For regulatory compliance (GDPR), ensure that personal data can be purged from all systems including analytics logs.

### Handling Misspellings
Autocomplete can incorporate a lightweight spell-correction layer. For each prefix, also check common misspelling variants (edit distance 1-2) and suggest the corrected query. This can be pre-computed during the trie build phase or handled by a real-time spell-check service alongside the trie lookup.
`,
    intuition: `The core data structure is a **Trie** (prefix tree) where each node stores a character and a reference to its children. The naive approach — traversing the subtree at the prefix node and sorting all matching queries by frequency — is far too slow. The key optimization is to **pre-compute and cache the top-k most frequent queries at every node** in the trie. This turns a potentially expensive traversal into an O(prefix_length) lookup: walk down the trie following the prefix characters, and the answer is already waiting at the final node. The second major insight is that trie updates should happen **offline** through a batch rebuild pipeline, not in real-time, because serving and updating the same data structure simultaneously introduces complexity and lock contention.`,
    approach: `## High-Level Design

### Two Independent Services
The system cleanly separates into two services that operate at different timescales:

**1. Data Gathering Service (Offline)**
Collects raw search queries from analytics logs, aggregates frequencies, and builds a new trie periodically (weekly or daily). This service is batch-oriented and latency-insensitive.

**2. Query Service (Online)**
Receives prefix queries from users and looks up the top-k suggestions from the pre-built trie. This service is latency-critical and must respond within 100ms.

### Trie Optimization: Top-K at Every Node
In a basic trie, finding the top 5 queries for a prefix requires traversing the entire subtree — potentially millions of nodes. Instead, each trie node stores a pre-computed list of the top-k (k=5) most frequent queries in its subtree. At build time, we propagate frequency data upward so every node already knows its best suggestions.

### Trie Node Structure

| Field | Description |
|-------|-------------|
| children | Map of character → child node |
| top_queries | List of (query_string, frequency) — max 5 |
| is_end | Boolean — marks end of a complete query |

With this optimization, answering a query is simply: walk the trie character by character for the input prefix, then return the \`top_queries\` list at the final node. Time complexity: O(p) where p is the prefix length.
`,
    code: `## Architecture Diagrams

### Overall System Architecture

\`\`\`mermaid
graph TD
    APP["Browser / Mobile App"]
    GW["API Gateway / CDN Edge"]
    QS["Query Service"]
    TC["Trie Cache (in-mem)"]
    SC["Server Cache (Redis)"]
    DGS["Data Gathering Service"]
    LOGS["Analytics Logs"]
    MR["MapReduce / Spark Job"]
    TBuild["Trie Builder (weekly)"]
    TS["Trie Storage (S3 / DB)"]

    APP -->|"GET /autocomplete?prefix=..."| GW
    GW --> QS
    SC --> TC
    QS --- TC
    QS --- SC
    TS -->|"Periodic trie swap (blue-green)"| QS
    LOGS --> MR
    MR --> TBuild
    TBuild --> TS
    DGS --- LOGS
    DGS --- MR
    DGS --- TBuild
    DGS --- TS

    style APP fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style QS fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style TC fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style SC fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style DGS fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style LOGS fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style MR fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style TBuild fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style TS fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Browser / Mobile App** — The client that sends autocomplete requests on each keystroke (with debouncing) and displays the returned suggestions.
- **API Gateway / CDN Edge** — Serves cached autocomplete responses from edge locations, absorbing the majority of read traffic before it reaches backend servers.
- **Query Service** — The latency-critical online service that walks the trie to find top-k suggestions for a given prefix.
- **Trie Cache (in-mem)** — The full trie loaded into each query server's memory for sub-millisecond lookups without network hops to external caches.
- **Server Cache (Redis)** — A shared cache layer that stores recently queried prefix results, reducing redundant trie lookups across query server instances.
- **Data Gathering Service** — The offline subsystem encompassing log ingestion, frequency aggregation, and trie construction.
- **Analytics Logs** — Raw search query events streamed to Kafka, serving as the source of truth for query frequency computation.
- **MapReduce / Spark Job** — Batch aggregation job that groups raw queries by string and computes frequency counts with optional time-decay weighting.
- **Trie Builder (weekly)** — Reads the aggregated frequency table and constructs a new trie with pre-computed top-k lists at every node.
- **Trie Storage (S3 / DB)** — Persistent storage for serialized trie snapshots, enabling blue-green deployment swaps on query servers.

### Trie Node Structure

\`\`\`mermaid
graph TD
    ROOT["(root)"]
    ROOT --> B["b"]
    ROOT --> C["c"]
    ROOT --> T["t"]
    B --> E["e"]
    C --> A["a"]
    T --> R["r"]
    E --> E2["e → beer"]
    E --> S["s → best"]
    A --> R2["r → cars"]
    R --> E3["e → tree"]
    R --> I["i → trip"]

    subgraph NodeBE["Node 'be'"]
        INFO["children: e, s | is_end: false"]
        Q1["1. best buy (50K)"]
        Q2["2. best movies (42K)"]
        Q3["3. beer near me (38K)"]
        Q4["4. beats (35K)"]
        Q5["5. best pizza (31K)"]
    end

    style ROOT fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style B fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style C fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style T fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style E fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style A fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style R fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style E2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style S fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style R2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style E3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style I fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style INFO fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Q1 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Q2 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Q3 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Q4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Q5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **(root)** — The root node of the trie, representing the empty prefix. All queries begin their traversal here.
- **Character nodes (b, c, t, e, a, r, etc.)** — Each node represents a single character along a prefix path. Traversing from root through a sequence of nodes spells out the prefix being searched.
- **Leaf nodes (beer, best, cars, tree, trip)** — Terminal nodes marking the end of a complete query string stored in the trie.
- **Node 'be' subgraph** — Illustrates the key optimization: each node stores a pre-computed list of the top-k most frequent queries in its subtree, eliminating the need to traverse the entire subtree at query time.

### Data Gathering Pipeline

\`\`\`mermaid
graph TD
    N0["Log Stream (Kafka)"]
    N1["Aggregation (Spark)"]
    N2[("Frequency Table (DB)")]
    N3["Trie Cache"]
    N4["Trie Swap (Blue-Green)"]
    N5["Weekly Build Job"]
    N0 --> N1
    N1 --> N2
    N2 --> N5
    N5 --> N3
    N5 --> N4
    style N0 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Log Stream (Kafka)** — Ingests raw search query events in real-time from application servers, providing a durable event stream for downstream processing.
- **Aggregation (Spark)** — A batch job that reads query logs, groups by query string, and computes frequency counts with time-decay weighting.
- **Frequency Table (DB)** — A persistent table storing each unique query string and its aggregated frequency, serving as input to the trie builder.
- **Weekly Build Job** — A scheduled job that reads the frequency table and constructs a new trie with pre-computed top-k results at every node.
- **Trie Cache** — The in-memory trie on query servers that gets replaced with the newly built trie via an atomic swap.
- **Trie Swap (Blue-Green)** — The deployment mechanism that loads the new trie onto a standby fleet and atomically switches traffic, ensuring zero downtime and instant rollback capability.

### Query Flow with Caching Layers

\`\`\`mermaid
graph TD
    N0["Browser Cache"]
    N1["Return cached"]
    N2["CDN Edge Cache"]
    N3["Server Redis Cache"]
    N4["Trie (in-mem)"]
    N0 --> N1
    N0 --> N2
    N2 --> N3
    N3 --> N4
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Browser Cache** — The first layer of caching, storing recent autocomplete results locally in the browser so repeated prefixes are served instantly without any network request.
- **Return cached** — Represents the fast path where a cache hit in the browser returns results immediately to the user with zero latency.
- **CDN Edge Cache** — The second caching layer at geographically distributed edge servers, serving autocomplete results close to the user when the browser cache misses.
- **Server Redis Cache** — A shared cache on the backend that stores recently computed prefix results, reducing redundant trie lookups across multiple query servers.
- **Trie (in-mem)** — The final fallback: the full pre-built trie loaded in query server memory, used only when all upstream caches miss.
`,
    jsCode: `## Deep Dive

### Why Pre-Compute Top-K at Every Node
Without pre-computation, for the prefix "be", the system must traverse the entire subtree rooted at "be" — potentially hundreds of thousands of nodes — collect all complete queries, sort by frequency, and return the top 5. This could take seconds. With pre-computation, the top-5 list is already stored at the "be" node, making the lookup instant (O(prefix_length) to walk down, O(1) to read the list).

The trade-off is increased memory and build time. Each node stores up to k query strings plus their frequencies. For a trie with 100M nodes and k=5, this adds significant memory. To mitigate this, we limit the trie to a maximum depth (e.g., 50 characters) — very few searches exceed that length.

### Data Gathering Pipeline in Detail
1. **Raw logs**: Every search query is logged with a timestamp to a Kafka topic.
2. **Aggregation**: A Spark job runs weekly (or daily). It reads all queries from the log, groups by query string, and sums frequencies. It may apply time-decay weighting — recent queries count more than older ones.
3. **Frequency table**: The aggregated results are written to a database table: \`(query_string, frequency)\`.
4. **Trie build**: A separate job reads the frequency table and constructs a new trie in memory. For each query, it inserts the characters into the trie and updates the top-k lists at every node along the path.
5. **Serialization**: The completed trie is serialized to a compact binary format and stored in S3 or a distributed file system.

### Why Not Update the Trie in Real-Time?
Updating a trie in real-time as queries arrive seems appealing but introduces serious problems:
- **Lock contention**: Concurrent reads and writes on the trie require synchronization, killing throughput.
- **Top-k recomputation**: When a query's frequency changes, the top-k lists at every ancestor node potentially need updating — this cascading update is expensive.
- **Memory safety**: Modifying a live data structure while readers are traversing it requires copy-on-write or lock-free data structures, adding complexity.

The batch rebuild approach avoids all of these issues. Autocomplete suggestions being slightly stale (hours or days) is perfectly acceptable.

### Atomic Trie Swap (Blue-Green Deployment)
When a new trie is built, we don't update the live trie in place. Instead:
1. Build the new trie and load it into a **standby** set of query servers (the "green" fleet).
2. Run health checks and validation on the green fleet.
3. Atomically switch the load balancer to route traffic from the "blue" (old) fleet to the "green" (new) fleet.
4. Keep the blue fleet around briefly for rollback if needed, then decommission it.

This provides zero-downtime trie updates with instant rollback capability.

### Query Optimization: Client-Side Techniques
To reduce the number of requests hitting the server:

**Browser caching**: Autocomplete results for a given prefix don't change frequently. Set aggressive \`Cache-Control\` headers (e.g., 1 hour TTL). The browser caches results, so typing "tre" a second time doesn't hit the server.

**Debouncing**: Don't send a request on every keystroke. Wait 100-200ms after the user stops typing. Fast typists entering "travel" would generate only 1-2 requests instead of 6.

**Prefix reuse**: If the client already has results for "tr" and the user types "tre", the client can filter locally from the "tr" results without a new server request. Only fetch from the server if the local filter yields fewer than 5 results.

### Filter Layer for Harmful Content
Some queries are hateful, violent, or otherwise inappropriate and should never appear as suggestions. Implement a filter layer:
1. Maintain a **blocklist** of banned query strings and patterns (regex).
2. During trie build, exclude any query matching the blocklist.
3. For real-time protection (new harmful queries emerging), add a post-lookup filter that checks results against the blocklist before returning them to the client.
4. Flag queries for human review if they appear in the blocklist — some may be false positives.

### Trie Sharding for Scale
A single trie may not fit in one server's memory at extreme scale. Shard the trie by the first character (or first two characters) of the prefix:
- Shard 1: prefixes starting with "a"
- Shard 2: prefixes starting with "b"
- ...and so on.

This is unbalanced (more queries start with certain letters), so use query frequency analysis to assign multiple low-frequency letter ranges to a single shard while giving high-frequency ranges their own dedicated shards.

### Multi-Language Considerations
Different languages require different trie configurations:
- **CJK**: Character-based tries work, but the alphabet is much larger (thousands of characters). Consider using a compressed trie (radix tree) or Pinyin-based input for Chinese.
- **Arabic/Hebrew**: Right-to-left languages need correct string handling in the trie.
- **Unicode normalization**: Ensure consistent normalization (NFC) of all query strings before insertion and lookup to avoid duplicate entries for visually identical text.
`,
    explanation: `## Wrap Up

### Scaling Strategies
- **Trie sharding** across multiple servers by prefix range for horizontal scaling
- **Multiple caching layers** (browser, CDN, Redis, in-memory) to absorb the majority of requests before they reach the trie
- **Periodic offline rebuilds** eliminate the complexity of real-time trie mutation
- **Blue-green deployment** for zero-downtime trie swaps
- **Client-side optimizations** (debouncing, local filtering, caching) reduce server load by 5-10x

### Trade-Offs

| Decision | Trade-Off |
|----------|-----------|
| Pre-computed top-k at each node | More memory per node, but O(prefix_length) query time instead of O(subtree_size) |
| Offline batch rebuild | Suggestions can be hours/days stale, but avoids real-time update complexity |
| Blue-green trie swap | Requires 2x server capacity during transitions, but provides zero-downtime and instant rollback |
| Browser caching with 1hr TTL | Trending queries may take up to 1 hour to surface, but dramatically reduces server load |
| Trie depth limit (50 chars) | Extremely long queries won't autocomplete, but keeps memory bounded |
| Sharding by first character | Uneven distribution, but simple to implement and reason about |

### What We Covered
1. Trie data structure with pre-computed top-k suggestions at every node
2. Offline data gathering pipeline (logs → Spark → frequency table → trie build)
3. Blue-green deployment for atomic trie swap
4. Multi-layer caching strategy (browser, CDN, Redis, in-memory)
5. Client-side optimizations (debouncing, prefix reuse)
6. Filter layer for harmful content
7. Trie sharding strategies for horizontal scaling
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Always pre-compute the top-k results at every trie node during build time. Traversing the subtree at query time is far too slow for sub-100ms latency requirements.',
      'Rebuild the trie offline in batches rather than updating it in real-time. Real-time mutation introduces lock contention and cascading top-k recomputations that destroy serving performance.',
      'Leverage aggressive client-side caching and debouncing to reduce server load by an order of magnitude. Most autocomplete results are stable enough to cache for an hour.',
      'Always include a filter layer to suppress harmful or offensive suggestions. Without it, the system will surface inappropriate content and create PR disasters.',
    ],
  },
  {
    id: 9114,
    description: `## Clarifying Questions to Ask
- Are we designing both the **upload** and **streaming** paths?
- What platforms must we support — **web, mobile, smart TVs**?
- What **video quality** levels do we need (360p, 720p, 1080p, 4K)?
- Do we need **DRM** (Digital Rights Management) for content protection?
- What is the **maximum file size** for uploads?
- Can we leverage **existing cloud infrastructure** (AWS, GCP) or must we build from scratch?
- Do we support **user-generated content** or only studio content?

## Functional Requirements
1. **Upload videos** — creators can upload videos of various formats and sizes
2. **Stream videos** — viewers can watch videos with adaptive quality based on bandwidth
3. **Video processing** — uploaded videos are transcoded into multiple resolutions and formats
4. **Search and discovery** — users can search for and browse videos (out of scope for deep dive)

## Non-Functional Requirements
- **Reliability** — uploaded videos must never be lost
- **Scalability** — handle millions of concurrent viewers
- **Low latency** — video playback starts within 2 seconds
- **Cost efficiency** — video storage and CDN bandwidth are the dominant costs

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| DAU (viewers) | 5M |
| Average videos watched/day/user | 5 |
| Video views/day | 25M |
| Uploads/day | 500K |
| Average video duration | 5 minutes |
| Average raw upload size | 300 MB |
| Daily upload storage | 150 TB (500K × 300 MB) |
| Annual storage | ~55 PB |
| Average transcoded size (all qualities) | ~1 GB per video |
| CDN cost/day | ~$150K (at $0.02/GB for 7.5 PB egress) |
`,
    examples: `## Follow-Up Discussion Points

### CDN Cost Optimization
CDN bandwidth is the single largest cost. Strategies to reduce it:
- **Tiered CDN**: Use premium CDN (Akamai, CloudFront) only for popular videos. Serve long-tail content from cheaper origin servers or a secondary CDN.
- **Popularity-based caching**: Keep the top 20% of videos (which account for 80% of views) hot in CDN edge caches. Let unpopular videos fall out of cache.
- **Compression**: Use modern codecs (AV1, VP9) that achieve better quality at lower bitrates, reducing bytes transferred.
- **Regional origin servers**: Place origin servers in multiple regions so CDN misses don't cross continents.

### Copyright Detection (Content ID)
Build an automated content identification system:
1. When a video is uploaded, extract a **perceptual fingerprint** (audio + visual).
2. Compare the fingerprint against a database of copyrighted reference content.
3. If a match is found, apply the copyright owner's policy: block, monetize (show ads with revenue to the owner), or allow with tracking.
This runs as an asynchronous step in the transcoding pipeline.

### Live Streaming Extension
Live streaming requires a fundamentally different architecture from VOD (video on demand). Instead of uploading a complete file and transcoding it, the broadcaster streams segments in real-time:
1. Broadcaster sends live video via RTMP to an ingestion server.
2. The server transcodes into multiple qualities in real-time.
3. Segments (2-6 seconds each) are pushed to CDN edge servers.
4. Viewers pull segments via HLS/DASH, with a typical 5-15 second latency from the live edge.
For lower latency, use WebRTC (sub-second) or LL-HLS (2-3 seconds).

### Handling Viral Videos
When a video suddenly goes viral, CDN edge caches warm up quickly for popular regions, but less popular regions experience cache misses that hammer the origin. Mitigate with: (1) proactive CDN pre-warming when view velocity exceeds a threshold, (2) mid-tier CDN caches between edge and origin, (3) rate limiting origin requests.

### 4K and 8K Support
Higher resolutions require significantly more storage and bandwidth. A 4K stream at 20 Mbps uses 4x the bandwidth of 1080p. Strategies: only transcode to 4K if the source is 4K or higher, use AV1 codec for better compression, and restrict 4K delivery to users on high-bandwidth connections.
`,
    intuition: `A video platform has two fundamentally different flows with different requirements: the **upload/processing pipeline** (offline, throughput-oriented, latency-tolerant) and the **streaming path** (online, latency-sensitive, bandwidth-intensive). The upload pipeline is essentially a **DAG (Directed Acyclic Graph) of processing tasks** — splitting, transcoding to multiple resolutions, thumbnail generation, watermarking — executed by a distributed task queue. The streaming path is dominated by **CDN architecture** — getting pre-transcoded video segments as close to viewers as possible. The biggest challenge is **cost** — video storage and CDN bandwidth dwarf compute costs, so every optimization in codec efficiency and cache hit rates directly impacts the bottom line.`,
    approach: `## High-Level Design

### Two Distinct Flows

**Upload Pipeline**: Client uploads raw video → video is transcoded into multiple resolutions and formats → transcoded segments are distributed to CDN → metadata is stored in the database.

**Streaming Path**: Client requests a video → metadata service returns a manifest file (HLS/DASH) listing available qualities → client's player fetches video segments from the nearest CDN edge → player dynamically adjusts quality based on bandwidth.

### API Design

| API | Method | Description |
|-----|--------|-------------|
| /api/upload/url | POST | Request a pre-signed upload URL |
| /api/videos | POST | Register video metadata after upload |
| /api/videos/:id | GET | Get video metadata and streaming manifest URL |
| /api/videos/:id/stream | GET | Get HLS/DASH manifest |
| /api/videos/search | GET | Search videos by title, tags, etc. |

### Data Model

**Video Metadata Table**

| Column | Type | Description |
|--------|------|-------------|
| video_id | UUID | Unique identifier |
| title | String | Video title |
| description | Text | Video description |
| uploader_id | UUID | Creator's user ID |
| status | Enum | uploading, processing, ready, failed |
| duration | Integer | Duration in seconds |
| upload_url | String | Original file location in S3 |
| created_at | Timestamp | Upload time |

**Transcoded Video Table**

| Column | Type | Description |
|--------|------|-------------|
| video_id | UUID | Foreign key to video metadata |
| resolution | String | e.g., 360p, 720p, 1080p, 4K |
| codec | String | H.264, VP9, AV1 |
| bitrate | Integer | Kilobits per second |
| segment_urls | JSON | List of CDN URLs for HLS/DASH segments |
| manifest_url | String | HLS/DASH manifest for this quality |
`,
    code: `## Architecture Diagrams

### Upload Pipeline

\`\`\`mermaid
sequenceDiagram
    participant CR as Creator
    participant API as API Server
    participant S3 as Object Storage (S3)
    participant TP as Transcoding Pipeline (DAG)
    participant CDN as CDN Distribution

    CR->>API: POST /upload/url
    API->>S3: Generate pre-signed upload URL
    API-->>CR: Pre-signed URL
    CR->>S3: PUT raw video (direct upload)
    S3-->>API: Upload complete (S3 event trigger)
    API->>TP: Start transcoding pipeline
    TP->>S3: Store transcoded files + thumbnails
    TP->>CDN: Push to edge locations
\`\`\`

### Streaming Architecture

\`\`\`mermaid
sequenceDiagram
    participant V as Viewer
    participant Edge as CDN Edge
    participant Origin as CDN Origin
    participant S3 as S3 Origin

    V->>Edge: GET manifest
    Edge-->>V: m3u8/mpd (cache HIT)
    V->>Edge: GET segment_001
    Edge-->>V: video data (cache HIT)
    V->>Edge: GET segment_002
    Edge->>Origin: cache MISS
    Origin->>S3: Fetch from storage
    S3-->>Origin: video data
    Origin-->>Edge: video data
    Edge-->>V: video data (+ cache for next)
\`\`\`

### DAG-Based Transcoding Pipeline

\`\`\`mermaid
graph TD
    N0["Splitter"]
    N2["Transcode 360p"]
    N3["Transcode 720p"]
    N4["Transcode 1080p"]
    N5["Thumbnail Generator"]
    N6["Watermark"]
    N7["Manifest Generator"]
    N8[("Upload to S3 + CDN")]
    N0 --> N2
    N0 --> N3
    N0 --> N4
    N0 --> N5
    N2 --> N6
    N3 --> N6
    N4 --> N6
    N6 --> N7
    N2 --> N8
    N3 --> N8
    N4 --> N8
    N5 --> N8
    N7 --> N8
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Splitter** — Splits the raw uploaded video into small segments (e.g., 10-second chunks) to enable parallel transcoding across a worker fleet.
- **Transcode 360p / 720p / 1080p** — Independent transcoding tasks that encode the video segments at different resolutions, running in parallel to minimize total processing time.
- **Thumbnail Generator** — Extracts representative frames at regular intervals for use as video previews, scrub bar thumbnails, and poster images.
- **Watermark** — Overlays a creator or platform watermark onto each transcoded resolution variant before final output.
- **Manifest Generator** — Creates HLS (.m3u8) and DASH (.mpd) manifest files that list all available quality levels and their segment URLs for adaptive bitrate streaming.
- **Upload to S3 + CDN** — The final stage that stores all transcoded segments, thumbnails, and manifests in object storage and distributes them to CDN edge locations for low-latency viewer access.

### Pre-Signed Upload Sequence

\`\`\`mermaid
sequenceDiagram
    participant CR as Creator
    participant API as API Server
    participant Auth as Auth Service
    participant S3 as S3

    CR->>API: Request upload (title, format)
    API->>Auth: Verify auth
    Auth-->>API: Authorized
    API->>S3: Generate pre-signed URL (1hr)
    API-->>CR: Upload URL
    CR->>S3: PUT video file (direct to S3)
    S3-->>API: S3 event (upload complete)
    API->>API: Trigger DAG pipeline
\`\`\`
`,
    jsCode: `## Deep Dive

### Video Transcoding: Codecs and Formats
Transcoding converts a raw video file into multiple optimized versions:

**H.264 (AVC)**: The most widely supported codec. Excellent compatibility across all browsers and devices. Decent compression but not the most efficient. Used as the baseline for all videos.

**VP9**: Google's open-source codec. ~30-50% better compression than H.264 at equivalent quality. Supported in Chrome, Firefox, and Android. Not supported in Safari (older versions). Good choice for YouTube-like platforms.

**AV1**: Next-generation codec. ~30% better compression than VP9. But encoding is 10-100x slower than H.264. Cost-effective only for very popular videos where the CDN bandwidth savings justify the encoding cost.

The strategy: transcode ALL videos to H.264 (universal compatibility). Transcode popular videos additionally to VP9 and AV1 to save bandwidth on high-view content.

### DAG Model for Video Processing
The transcoding pipeline is modeled as a **Directed Acyclic Graph** where each node is a processing task and edges represent dependencies:

1. **Split**: The raw video is split into chunks (e.g., 10-second segments). This enables parallel processing.
2. **Transcode (per resolution, per codec)**: Each chunk is transcoded independently into 360p, 720p, 1080p, etc. These tasks run in parallel across a worker fleet.
3. **Thumbnail generation**: Extract frames at regular intervals for video previews and scrub bar thumbnails.
4. **Watermark**: Optionally overlay a creator watermark or platform branding.
5. **Manifest generation**: Create HLS (.m3u8) and DASH (.mpd) manifest files listing all available qualities and segment URLs.
6. **Quality check**: Automated validation — check for encoding errors, black frames, audio sync issues.

### Transcoding Architecture: Task Queue + Workers
The DAG is executed by a task orchestration system:
1. A **DAG scheduler** (similar to Apache Airflow) breaks the video processing into individual tasks.
2. Each task is placed in a **priority queue** (SQS, Kafka). Premium creators or time-sensitive uploads get higher priority.
3. A fleet of **transcoding workers** (GPU instances for hardware-accelerated encoding) pulls tasks from the queue.
4. Workers process tasks and report completion back to the scheduler.
5. The scheduler tracks task dependencies — a watermark task won't start until its corresponding transcode task completes.
6. If a worker fails, the task is retried on another worker (tasks are idempotent).

### Adaptive Bitrate Streaming (ABR)
Viewers have varying bandwidth — a user on fiber optic can handle 4K while a user on 3G needs 360p. **Adaptive bitrate streaming** solves this:

**HLS (HTTP Live Streaming)**: Apple's protocol, the de facto standard. The video is split into small segments (2-10 seconds). A master manifest lists all available quality levels. Each quality has its own playlist of segment URLs. The player downloads one segment at a time, measuring throughput after each download. If bandwidth drops, the player switches to a lower quality for the next segment. If bandwidth increases, it switches up.

**DASH (Dynamic Adaptive Streaming over HTTP)**: An open standard alternative to HLS. Functionally similar — manifest + segments + adaptive quality switching. Better for DRM integration via CENC (Common Encryption).

### Pre-Signed Upload URLs
Large video files (hundreds of MB to several GB) should NOT be uploaded through our API servers — they'd consume bandwidth, memory, and processing time. Instead:
1. The client requests a pre-signed upload URL from the API server.
2. The API server generates a time-limited (1 hour) pre-signed S3 URL with PUT permissions.
3. The client uploads directly to S3 using the pre-signed URL.
4. S3 fires an event notification (Lambda or SNS) when the upload completes.
5. The event triggers the transcoding pipeline.

This keeps our API servers stateless and lightweight — they never touch the video bytes.

### Cost Optimization Strategies
Video infrastructure costs are dominated by storage and CDN bandwidth:

**Tiered CDN strategy**: Not all videos deserve premium CDN placement. The top 1% of videos by view count generate ~50% of all views. Place these on expensive premium CDN edges (Akamai, CloudFront). Serve the long tail from cheaper CDN tiers or directly from regional origin servers.

**Encoding optimization**: Spend more compute on encoding popular videos with AV1, which produces smaller files. The CDN savings outweigh the encoding cost for videos with millions of views.

**Storage tiering**: Move videos with zero views in the last 90 days to cold storage (S3 Glacier). If requested, transcode on-demand from the cold-stored original with a brief delay.

### Resumable Uploads
For large files over unreliable networks, support **resumable uploads**:
1. The client initiates a multi-part upload and receives an upload ID.
2. The client splits the file into chunks (e.g., 5 MB each) and uploads each chunk independently.
3. If a chunk fails, only that chunk is retried — not the entire file.
4. After all chunks are uploaded, the client sends a completion request that assembles the chunks into the final object.
S3's multi-part upload API provides this natively.

### Video Deduplication
Users often upload the same video (re-uploads, reposts, slightly modified copies). Detect duplicates using **perceptual hashing**:
1. Extract a visual fingerprint from the video (frame-based hashing, like pHash or CNN-based embeddings).
2. Compare against existing fingerprints using a nearest-neighbor index.
3. If a near-exact match is found, skip transcoding and point the new video metadata to the existing transcoded segments.
This saves enormous storage and compute costs.
`,
    explanation: `## Wrap Up

### Key Bottlenecks
- **CDN bandwidth cost** is the dominant expense — optimize with tiered CDN, better codecs, and popularity-based caching
- **Transcoding throughput** during peak upload hours — scale the worker fleet with auto-scaling groups and use spot/preemptible instances for cost savings
- **Storage growth** is relentless at 150 TB/day — must implement storage tiering and deduplication

### Trade-Offs

| Decision | Trade-Off |
|----------|-----------|
| Pre-signed upload URLs | Clients upload directly to S3, bypassing API servers; requires trust in client + URL expiration |
| DAG-based transcoding | Flexible and parallelizable, but adds orchestration complexity (scheduler, dependency tracking) |
| Adaptive bitrate streaming (HLS/DASH) | Seamless quality adaptation for viewers, but requires storing multiple copies of every video |
| H.264 as baseline codec | Universal device compatibility, but larger file sizes than VP9/AV1 |
| AV1 for popular videos only | Best compression, but encoding is 10-100x slower — only cost-effective for high-view content |
| Multi-part resumable uploads | Reliable over poor networks, but adds client-side complexity |
| Perceptual hashing for dedup | Saves storage and compute, but has false positive risk and adds processing latency to upload path |

### What We Covered
1. Separation of upload pipeline (offline, throughput-oriented) and streaming path (online, latency-sensitive)
2. Pre-signed URLs for direct-to-S3 upload without loading API servers
3. DAG-based transcoding pipeline with parallel task execution
4. Adaptive bitrate streaming via HLS/DASH for dynamic quality adjustment
5. CDN architecture with tiered caching based on video popularity
6. Cost optimization through codec selection, storage tiering, and deduplication
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Never route video file uploads through your API servers. Use pre-signed URLs to let clients upload directly to object storage (S3), keeping your servers stateless and lightweight.',
      'Model the transcoding pipeline as a DAG (Directed Acyclic Graph) of independent tasks rather than a linear sequence. This enables parallel processing of different resolutions and codecs, dramatically reducing total processing time.',
      'Always implement adaptive bitrate streaming (HLS or DASH). Serving a single fixed quality wastes bandwidth for low-connectivity users and delivers poor quality for high-bandwidth users.',
      'CDN bandwidth is your largest cost by far. Implement tiered CDN strategies — premium CDN for popular videos, cheaper alternatives for long-tail content — and invest in better codecs (VP9/AV1) for high-view videos.',
    ],
  },
  {
    id: 9115,
    description: `## Clarifying Questions to Ask
- Do we need to support both **upload and download**, or also **real-time sync** across devices?
- What **file types** do we support? Any file, or specific types (docs, images, etc.)?
- What **platforms** — web, desktop (Windows, Mac, Linux), mobile?
- Do we need **end-to-end encryption**?
- Is there a **maximum file size** limit?
- How many **total users** and **DAU**?
- What is the **free storage quota** per user?
- Do we need to support **file sharing** and **collaboration**?

## Functional Requirements
1. **Upload files** — add files from any device
2. **Download files** — retrieve files on any device
3. **Automatic sync** — when a file changes on one device, all other devices see the update
4. **File versioning** — support viewing and restoring previous versions
5. **Sharing** — share files or folders with other users
6. **Offline support** — users can work offline; changes sync when connectivity returns

## Non-Functional Requirements
- **Reliability** — files must never be lost (strong durability guarantees)
- **Consistency** — all devices must eventually converge to the same file state
- **Low bandwidth usage** — transfer only what changed, not entire files
- **Scalability** — support 50M registered users

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Registered users | 50M |
| Free storage per user | 10 GB |
| Total provisioned storage | 500 PB |
| DAU | 10M |
| Avg files per user | 500 |
| Avg file size | 200 KB |
| Avg syncs per user per day | 2 |
| QPS | ~230 (10M × 2 / 86400) |
| Peak QPS | ~460 |
| Daily upload volume | ~10 TB |
`,
    examples: `## Follow-Up Discussion Points

### Real-Time Collaboration (Google Docs Style)
File sync handles sequential edits well — User A saves, the change propagates to User B. But real-time collaboration (multiple cursors editing the same document simultaneously) requires a fundamentally different approach:

**Operational Transformation (OT)**: Each edit is represented as an operation (insert character at position X, delete range Y-Z). When concurrent operations arrive, a transformation function adjusts their positions to produce a consistent result. Google Docs uses OT. Complex to implement correctly, especially for rich text.

**CRDTs (Conflict-free Replicated Data Types)**: Data structures that mathematically guarantee convergence without coordination. Each character has a unique position ID that's preserved across operations. More predictable than OT but can have higher memory overhead. Used by newer collaborative editors like Figma.

Both approaches are out of scope for basic file sync but represent the natural evolution.

### Large File Handling
For very large files (10 GB+):
- **Streaming upload**: Use chunked transfer encoding so the client doesn't need to buffer the entire file in memory.
- **Background sync**: Large file uploads should happen in the background with a progress indicator, not block the user.
- **Differential sync for large files**: Particularly important — re-uploading a 10 GB file for a small change is wasteful. Block-level delta sync is essential.
- **Storage quota management**: Large files consume quota quickly. Provide clear warnings before upload if it would exceed the quota.

### Trash / Recycle Bin
Deleted files aren't immediately purged. Move them to a "trash" folder that retains files for 30 days. The client can restore trashed files within this window. After 30 days, a background job permanently deletes the file blocks and frees the storage quota. This protects against accidental deletion.

### Mobile Optimization
Mobile clients have unique constraints — limited bandwidth, battery, and storage. Strategies:
- **Selective sync**: Don't sync all files to the mobile device. Let users choose which folders to keep offline.
- **Thumbnail/preview only**: For images and documents, download a lightweight preview first. Full content downloads only on explicit request.
- **Wi-Fi only sync**: Option to sync large files only when connected to Wi-Fi to save cellular data.
- **Compression**: More aggressive compression for mobile transfers.

### GDPR Compliance
Users in the EU have the right to data portability and erasure:
- **Data export**: Provide a tool to download all stored files in a standard format.
- **Right to erasure**: Delete all user data (files, metadata, version history) upon request. Must also purge from backups within a reasonable timeframe.
- **Data residency**: Some regulations require data to remain within specific geographic regions. Support region-locked storage buckets.
`,
    intuition: `The central challenge of a cloud file storage system is **efficient synchronization**. The naive approach of re-uploading entire files on every change is prohibitively wasteful — imagine changing 2 KB in a 100 MB file and re-transferring all 100 MB. The key insight is **block-level deduplication and delta sync**: split every file into fixed-size blocks (e.g., 4 MB), hash each block with SHA-256, and only transfer blocks that have actually changed. A 100 MB file becomes ~25 blocks; changing 2 KB means only 1 block (4 MB) is transferred instead of 100 MB. Furthermore, identical blocks across different files or versions are stored only once (**content-addressed storage**), dramatically reducing storage costs for a system with millions of users who share common files.`,
    approach: `## High-Level Design

### Client-Side Components
The desktop client runs three key modules:

**File Watcher**: Monitors the sync folder for file system events (create, modify, delete, rename). On detection, it triggers the sync process. Uses OS-level file system notifications (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows).

**Block Engine**: Splits modified files into fixed-size blocks (4 MB), computes SHA-256 hash per block, compresses each block (gzip or LZ4), and encrypts each block (AES-256). Only blocks whose hashes differ from the server's record are uploaded.

**Sync Manager**: Coordinates the upload/download process. Maintains a local database of file metadata and block hashes. Resolves conflicts when the same file is modified on two devices simultaneously.

### Server-Side Components

**Block Servers**: Receive uploaded blocks, verify integrity (hash check), and store them in cloud object storage (S3). Also serve block downloads.

**Cloud Storage (S3)**: Stores the actual file blocks. Each block is stored with its hash as the key (**content-addressed storage**). If two files share identical blocks, the block is stored once.

**Metadata Database (PostgreSQL)**: Stores file metadata (file paths, versions, block lists, permissions, sharing info). Uses a relational database for strong consistency — we need ACID transactions for operations like "move file" or "share folder" that touch multiple records atomically.

**Notification Service**: Tells other devices when a file changes so they can pull the updates. Uses long polling for broad compatibility or WebSockets for more responsive sync.

### API Design

| API | Method | Description |
|-----|--------|-------------|
| /api/files/upload | POST | Upload file blocks and update metadata |
| /api/files/download/:id | GET | Download file blocks for a given file |
| /api/files/metadata/:id | GET | Get file metadata including block list |
| /api/files/changes | GET | Long-poll for changes since last sync |
| /api/files/versions/:id | GET | List version history for a file |
| /api/files/share | POST | Share a file or folder with another user |

### Data Model

**File Metadata Table**

| Column | Type | Description |
|--------|------|-------------|
| file_id | UUID | Unique file identifier |
| user_id | UUID | Owner |
| file_name | String | Name of the file |
| file_path | String | Full path within the user's drive |
| file_size | BigInt | Total size in bytes |
| version | Integer | Current version number |
| is_directory | Boolean | Whether this is a folder |
| last_modified | Timestamp | Last modification time |
| checksum | String | SHA-256 hash of entire file |

**Block Metadata Table**

| Column | Type | Description |
|--------|------|-------------|
| file_id | UUID | Foreign key to file metadata |
| version | Integer | File version this block belongs to |
| block_index | Integer | Position of block in the file (0, 1, 2, ...) |
| block_hash | String | SHA-256 hash of the block content |
| block_size | Integer | Size of this block in bytes |

**Sharing Table**

| Column | Type | Description |
|--------|------|-------------|
| file_id | UUID | Shared file or folder |
| owner_id | UUID | User who owns the file |
| shared_with | UUID | User the file is shared with |
| permission | Enum | view, edit |
| created_at | Timestamp | When sharing was created |

### Database Choice
We use **PostgreSQL** for metadata because:
- File operations (rename, move, share) require **ACID transactions** — moving a folder with 100 files must be atomic
- Hierarchical file paths benefit from **B-tree indexes** for prefix queries
- Versioning and sharing require **referential integrity** (foreign keys)
- The metadata workload is moderate in volume (~230 QPS) — a relational database handles this comfortably
`,
    code: `## Architecture Diagrams

### Overall System Architecture

\`\`\`mermaid
graph TD
    subgraph Client["Desktop Client"]
        FW["File Watcher (inotify/FSEvents)"]
        BE["Block Engine (split/hash/compress/encrypt)"]
        SM["Sync Manager (upload/download/conflict)"]
        FW --> BE
        BE --> SM
    end
    GW["API Gateway / LB"]
    BS["Block Servers"]
    MS["Metadata Service"]
    NS["Notification Service (long poll / WebSocket)"]
    S3["Cloud Storage (S3)"]
    DB["Metadata Database (PostgreSQL)"]

    SM -->|HTTPS| GW
    GW --> BS
    GW --> MS
    GW --> NS
    BS --> S3
    MS --> DB

    style FW fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style BE fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style SM fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style BS fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style MS fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style NS fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style S3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style DB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **File Watcher (inotify/FSEvents)** — A client-side module that monitors the sync folder using OS-level file system notifications to detect creates, modifies, deletes, and renames in real time.
- **Block Engine (split/hash/compress/encrypt)** — Splits modified files into 4 MB blocks, computes SHA-256 hashes for delta detection, compresses with LZ4, and encrypts with AES-256 before upload.
- **Sync Manager (upload/download/conflict)** — Coordinates the sync process by comparing local and remote block lists, uploading only changed blocks, downloading new blocks from other devices, and resolving conflicts.
- **API Gateway / LB** — Routes and load-balances client requests to the appropriate backend service (block servers, metadata, or notifications).
- **Block Servers** — Stateless servers that receive uploaded blocks, verify integrity via hash checks, and write them to cloud storage. They also serve block downloads.
- **Metadata Service** — Manages all file metadata operations (create, move, rename, version, share) backed by PostgreSQL for ACID transaction support.
- **Notification Service (long poll / WebSocket)** — Notifies other connected devices when files change so they can pull updates, using long polling for broad compatibility.
- **Cloud Storage (S3)** — Durable object storage where encrypted file blocks are stored using content-addressed keys (SHA-256 hash) for automatic deduplication.
- **Metadata Database (PostgreSQL)** — Stores file paths, version histories, block lists, sharing permissions, and user data with strong consistency and referential integrity.

### File Upload Flow (Block-Level Delta Sync)

\`\`\`mermaid
graph TD
    N0["Block Engine: Split into 4MB blocks"]
    N1["Compress (LZ4) + Encrypt (AES)"]
    N2[("Upload to S3")]
    N3["Update metadata (new version)"]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Block Engine: Split into 4MB blocks** — Divides the modified file into fixed-size blocks and computes SHA-256 hashes to identify which blocks have changed since the last sync.
- **Compress (LZ4) + Encrypt (AES)** — Prepares changed blocks for upload by compressing them for bandwidth efficiency and encrypting them so the server never sees plaintext data.
- **Upload to S3** — Writes the compressed and encrypted blocks to cloud object storage using content-addressed keys for automatic deduplication across files and versions.
- **Update metadata (new version)** — Creates a new version record in the metadata database listing the updated block hash list, enabling version history and rollback.

### File Download / Sync Flow

\`\`\`mermaid
graph TD
    N0["Fetch new block list"]
    N1[("Download from S3 + Decrypt")]
    N2["Reconstruct file"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**Component Breakdown:**
- **Fetch new block list** — The client queries the metadata service for the latest version's block list and compares it against its local block inventory to determine which blocks need downloading.
- **Download from S3 + Decrypt** — Retrieves only the missing or updated blocks from cloud storage and decrypts them using the user's key to restore the original content.
- **Reconstruct file** — Assembles the complete file from its ordered block list by concatenating the decrypted, decompressed blocks in sequence.

### Conflict Resolution

\`\`\`mermaid
sequenceDiagram
    participant DA as Device A
    participant S as Server
    participant DB as Device B

    Note over DA: Offline edit file.txt
    Note over DB: Offline edit file.txt
    DA->>S: Upload v2
    S-->>DA: ACK v2 (first wins)
    DB->>S: Upload v2
    Note over S: CONFLICT DETECTED (server already at v2 from Device A)
    S->>DB: Save as conflict copy: file.txt (conflict).txt
    S->>DB: Notify "merge manually"
    S->>DA: Sync conflict copy (Device A also sees it)
\`\`\`
`,
    jsCode: `## Deep Dive

### Why Block-Level Sync Instead of File-Level
Consider a user editing a 100 MB PowerPoint file, changing a single slide (roughly 2 KB of actual data change). With file-level sync, the entire 100 MB file is re-uploaded. With block-level sync (4 MB blocks), only the single block containing the changed bytes (4 MB) is transferred. That is a **25x reduction** in bandwidth.

At scale, this matters enormously. If 10M daily active users each sync 2 files per day averaging 50 MB, file-level sync would transfer 1 PB/day. Block-level sync with a typical 5% change ratio transfers ~50 TB/day — a 20x bandwidth reduction.

### Block Splitting and Hashing
Each file is split into fixed-size blocks (4 MB is a common choice — small enough for efficient delta detection, large enough to avoid excessive metadata overhead). For each block:
1. Compute a **SHA-256 hash** of the block content. This hash uniquely identifies the block's content.
2. Compare the hash against the server's stored block list for this file.
3. If the hash matches, the block is unchanged — skip it.
4. If the hash differs, this block needs to be uploaded.

An alternative to fixed-size blocks is **content-defined chunking** (using Rabin fingerprinting to find natural split points). This handles insertions better — inserting 1 byte at the start of a file with fixed blocks shifts ALL block boundaries, causing every block to appear changed. Content-defined chunking keeps most boundaries stable. However, it adds complexity and is not always necessary.

### Compression and Encryption Per Block
Before uploading, each changed block goes through:
1. **Compression (LZ4 or gzip)**: LZ4 is preferred for its speed — it compresses/decompresses at ~700 MB/s while still achieving decent compression ratios. gzip gives better compression but is slower.
2. **Encryption (AES-256)**: Each block is encrypted with a key derived from the user's credentials. The server stores only ciphertext and cannot read the data. For sharing, the file encryption key is wrapped with the recipient's public key.

### Content-Addressed Storage and Deduplication
Blocks are stored in S3 using their SHA-256 hash as the key. This means:
- **Cross-file deduplication**: If User A and User B both upload the same PDF, the blocks are identical and stored only once. The metadata records for each user point to the same block hashes.
- **Cross-version deduplication**: When a file is edited, only changed blocks get new hashes. Unchanged blocks are shared between versions. A file with 25 blocks and a single-block edit stores 26 unique blocks across 2 versions, not 50.
- **Storage savings**: Studies show that content-addressed storage typically reduces total storage by 40-60% through deduplication alone.

### Notification Service: Long Polling vs WebSocket
When a file changes, other devices need to know. Two approaches:

**Long Polling**: The client sends a request to the server asking "anything changed since timestamp T?" If nothing has changed, the server holds the connection open (up to 60 seconds) rather than responding immediately. As soon as a change occurs, the server responds immediately. The client then reconnects. Advantages: works through all proxies and firewalls, simple server implementation. Disadvantage: slightly higher latency than WebSocket, connection overhead from reconnecting.

**WebSocket**: Persistent bidirectional connection. The server pushes notifications instantly. Lower latency, more efficient for frequent updates. Disadvantage: more complex infrastructure (sticky sessions, connection state management).

For a file sync system, **long polling is preferred** because sync events are relatively infrequent (seconds to minutes apart, not milliseconds) and reliability matters more than latency. Long polling is also simpler to implement reliably across diverse network environments (corporate firewalls, mobile networks).

### Offline Support
The client maintains a **local change log** — an ordered list of all file operations performed while offline:
1. When offline, the File Watcher continues monitoring and the Block Engine continues hashing. Operations are appended to the local change log.
2. When connectivity returns, the Sync Manager replays the change log against the server, one operation at a time.
3. For each operation, the server checks for conflicts (has the file been modified by another device since the client went offline?).
4. Conflict-free operations are applied normally. Conflicting operations generate a conflict copy.
5. After all operations are replayed, the client performs a full sync to catch up on changes made by other devices.

### File Versioning
Each file version is simply a list of block references:
- Version 1: [h1, h2, h3, h4, h5] (5 blocks)
- Version 2: [h1, h2, h3_new, h4, h5] (block 3 changed — 1 new block stored)
- Version 3: [h1, h2, h3_new, h4_new, h5] (block 4 changed — 1 new block stored)

Total unique blocks stored across 3 versions: 7 (not 15). The version metadata itself is tiny — just a list of hashes. This makes versioning extremely cheap in terms of storage. The system retains the last N versions (e.g., 30) or all versions within a time window (e.g., 60 days).

Restoring a previous version is simply: look up that version's block list, download any blocks the client doesn't already have locally, and reconstruct the file.

### Storage Reliability
File blocks must never be lost. Multiple layers of protection:

**Cross-region replication**: Every block is replicated to at least 3 geographic regions. If an entire data center is destroyed, the data survives.

**Erasure coding**: Instead of storing 3 full copies (3x storage overhead), use erasure coding (e.g., Reed-Solomon) to split each block into N data fragments and M parity fragments. Any N out of N+M fragments can reconstruct the original. This achieves the same durability as 3x replication at ~1.5x storage overhead.

**Checksum verification**: Every read operation verifies the SHA-256 hash of the returned block against the stored hash. If they don't match, the block is read from a different replica or reconstructed from erasure-coded fragments.

### Cold Storage Migration
Not all files are accessed frequently. Migration strategy:
- **Hot tier (S3 Standard)**: Files accessed within the last 30 days
- **Warm tier (S3 Infrequent Access)**: Files accessed within the last 90 days
- **Cold tier (S3 Glacier)**: Files not accessed in 90+ days

A background job monitors access patterns and migrates blocks between tiers. When a user requests a cold-stored file, the first access has higher latency (minutes for Glacier retrieval), but the file is automatically promoted back to the hot tier.
`,
    explanation: `## Wrap Up

### Key Bottlenecks
- **Metadata database** can become a bottleneck if many users sync simultaneously — mitigate with read replicas and caching
- **Block server throughput** during peak sync hours — scale horizontally, as block servers are stateless
- **Notification service fan-out** when a shared folder with many collaborators is updated

### Trade-Offs

| Decision | Trade-Off |
|----------|-----------|
| Block-level sync (4 MB blocks) | Dramatically reduces bandwidth but adds client-side complexity (splitting, hashing, block management) |
| Fixed-size blocks vs content-defined | Fixed-size is simpler but handles insertions poorly; content-defined is better for insertions but adds algorithmic complexity |
| PostgreSQL for metadata | Strong consistency and ACID transactions, but limited horizontal scalability — may need sharding at extreme scale |
| Content-addressed storage | Excellent deduplication, but requires garbage collection when blocks are no longer referenced by any file version |
| Long polling for notifications | Reliable across all networks, but slightly higher latency and connection overhead compared to WebSocket |
| First-writer-wins conflict resolution | Simple and predictable, but users must manually merge conflict copies |
| AES-256 per-block encryption | Strong security, but key management adds complexity (sharing requires key wrapping) |
| Erasure coding for durability | Storage-efficient durability (1.5x vs 3x), but higher compute cost for encoding/decoding fragments |

### What We Covered
1. Block-level delta sync with SHA-256 hashing to minimize bandwidth
2. Content-addressed storage for cross-file and cross-version deduplication
3. Per-block compression (LZ4) and encryption (AES-256)
4. PostgreSQL for metadata with ACID guarantees for file operations
5. Long polling notification service for change propagation
6. Conflict resolution via first-writer-wins with conflict copies
7. Offline support through local change log replay
8. File versioning as cheap block list references
9. Storage reliability through erasure coding and cross-region replication
10. Cold storage migration for cost optimization
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Always implement block-level sync rather than file-level sync. Transferring entire files on every change wastes enormous bandwidth — split files into 4 MB blocks and only transfer blocks whose hash has changed.',
      'Use a relational database (PostgreSQL) for file metadata, not NoSQL. File operations like move, rename, and share require ACID transactions and referential integrity that NoSQL databases cannot easily provide.',
      'Design an explicit conflict resolution strategy from the start. First-writer-wins with automatic conflict copy creation is the simplest approach. Do not attempt automatic merging for arbitrary file types — it leads to data corruption.',
      'Choose long polling over WebSocket for the notification service unless sync frequency is very high. Long polling works reliably through corporate firewalls and proxies, is simpler to implement, and file sync events are infrequent enough that WebSocket overhead is not justified.',
    ],
  },
];
