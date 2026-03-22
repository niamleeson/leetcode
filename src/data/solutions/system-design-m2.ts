import { ProblemSolution } from './types';

export const solutionsM2: ProblemSolution[] = [
  {
    id: 9006,
    description: `## Clarifying Questions to Ask
- What is the **maximum file size** we need to support? (e.g., 10GB videos?)
- Do we need **real-time collaboration** (Google Docs style) or just sync across devices?
- What **platforms** must be supported? (Desktop, mobile, web?)
- Should we support **selective sync** (choose which folders sync to each device)?
- Do we need **cross-user deduplication** or only per-user dedup?

## Functional Requirements
- Upload and download files up to **10GB** with resumable transfers
- **Delta sync**: only transfer changed portions of modified files
- **File versioning**: maintain history and allow restoring previous versions
- Share files/folders via **links or direct access** with permissions
- **Conflict resolution** when the same file is edited on multiple devices

## Non-Functional Requirements
- **Durability**: 99.9999999% (eleven 9s) -- no data loss
- **Sync latency**: changes appear on other devices within **5 seconds**
- **Availability**: 99.9% uptime
- Strong consistency for **metadata**, eventual consistency for file content

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Registered users | 500M |
| Daily active users | 100M |
| File syncs / day | 100M x 200 = **20B operations** |
| Write QPS | 20B / 86,400 = **~230K QPS** |
| Average file size | 500KB |
| New storage / day | 100M x 2 files x 500KB = **100 TB/day** |
| 5-year raw storage | ~180 PB (540 PB with 3x replication) |
| Metadata storage | ~1KB/file x 100B files = **100 TB** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle a 10GB video upload on a flaky mobile connection?** -> Chunk the file into 4MB pieces with resumable upload. Track completed chunks server-side. On reconnect, client queries which chunks are missing and resumes from there. Presigned URLs allow direct-to-S3 upload bypassing the app server.
- **How does delta sync actually reduce bandwidth?** -> Content-defined chunking with Rabin fingerprinting finds natural cut points in the file. Editing the middle of a 1GB file only invalidates 1-2 chunks out of ~250. Only those changed chunks are uploaded, reducing bandwidth by 99%.
- **What happens when two users edit the same file simultaneously?** -> Version vectors track each device's edit counter. If neither vector dominates the other, it is a conflict. Save both versions as "file.txt" and "file (conflict copy from DeviceB).txt" and let the user resolve manually.
- **How would you implement cross-user deduplication?** -> Chunks are keyed by SHA-256 hash. When uploading, the server checks if a chunk hash already exists in block storage. If it does, increment the reference count instead of storing a duplicate. This can save 30-50% storage.
- **How would you handle a thundering herd when a popular shared folder updates?** -> Fan-out notifications through a pub/sub system. Batch sync responses. Use exponential backoff with jitter on the client side to stagger sync requests.`,
    intuition: `A file storage system is fundamentally about treating files as **ordered sequences of content-defined chunks** rather than atomic blobs. This chunking strategy enables every major feature: resumable uploads (retry individual chunks), delta sync (upload only changed chunks), and deduplication (identical chunks stored once). The core design challenge is building a metadata layer that tracks chunk-to-file mappings with strong consistency while the actual chunk storage can be eventually consistent across regions.`,
    approach: `## Component Overview

A **sync agent** on each client watches the local filesystem and performs content-defined chunking. A **metadata service** (sharded by user_id) stores file trees, version histories, and chunk manifests. **Block storage** (S3) holds the actual chunk data keyed by SHA-256 hash. A **notification service** pushes change events to connected clients via long-polling or WebSockets.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/files/upload/init\` | Create | Body: \`{ fileName, fileSize, parentId, contentHash }\` -> Returns \`{ uploadId, presignedUrls[], existingChunks[] }\` |
| \`PUT /api/v1/files/upload/chunk\` | Upload | Binary chunk data with X-Upload-Id, X-Chunk-Index headers -> \`{ chunkId, status }\` |
| \`POST /api/v1/files/upload/complete\` | Commit | Body: \`{ uploadId, chunkHashes[] }\` -> \`{ fileId, version }\` |
| \`GET /api/v1/files/:id/download\` | Download | Query: \`?version=N\` -> 302 redirect to CDN signed URL |
| \`GET /api/v1/sync/changes\` | Sync | Query: \`?cursor=<token>\` -> \`{ changes[], newCursor }\` |

## Data Model

| Table | Columns | Notes |
|-------|---------|-------|
| files | file_id (PK), user_id, path, current_version, is_deleted | Sharded by user_id |
| file_versions | version_id (PK), file_id (FK), version_num, chunk_list, size, checksum | Append-only for history |
| chunks | chunk_hash (PK), size, storage_url, ref_count | Content-addressed, deduplicated |
| sync_events | event_id (PK), user_id, file_id, event_type, version, timestamp | Cursor-based pagination |
`,
    code: `## Architecture Diagram

\`\`\`
+------------------+          +-------------------+
| Client Device    |          | Client Device     |
| +----------+     |          |     +----------+  |
| |File Watch |     |          |     |File Watch|  |
| |+ Chunker  |     |          |     |+ Chunker |  |
| +-----+----+     |          |     +----+-----+  |
+-------|----------+          +----------|--------+
        |                                |
        v                                v
+------------------------------------------------+
| Load Balancer (Nginx / ALB)                     |
+---------------------+--------------------------+
                      |
         +------------v-----------+
         | API Servers (Stateless) |
         | - Upload / Download     |
         | - Sync / Share          |
         +---+--------+-------+---+
             |        |       |
   +---------v--+ +---v----+  +--v-----------+
   | Metadata   | | Notif  |  | Block Storage |
   | Service    | | Service|  | (S3)          |
   | (MySQL     | | (Long  |  |               |
   |  sharded)  | |  Poll/ |  | Chunks keyed  |
   |            | |  WS)   |  | by SHA-256    |
   | files,     | |        |  | 3x replicated |
   | versions,  | +--------+  +---------------+
   | chunks     |
   +------------+
\`\`\`

## Write Flow (File Upload)

\`\`\`
Client            API Server       Metadata Svc      S3 Storage
  |                   |                |                 |
  | Upload init       |                |                 |
  |------------------>|                |                 |
  |                   | Check chunks   |                 |
  |                   |--------------->|                 |
  |                   | Needed chunks  |                 |
  |                   |<---------------|                 |
  | Presigned URLs    |                |                 |
  |<------------------|                |                 |
  |                   |                |                 |
  | PUT chunks directly to S3 ----------------------->  |
  |                   |                |                 |
  | Upload complete   |                |                 |
  |------------------>|                |                 |
  |                   | Commit version |                 |
  |                   |--------------->|                 |
  |                   |    ACK         |                 |
  |                   |<---------------|                 |
  | { fileId, ver }   |                |                 |
  |<------------------|                |                 |
\`\`\`

## Read Flow (File Sync)

\`\`\`
Client            API Server       Metadata Svc      S3 / CDN
  |                   |                |                 |
  | GET /sync/changes |                |                 |
  |------------------>|                |                 |
  |                   | Query events   |                 |
  |                   |--------------->|                 |
  |                   | Changed files  |                 |
  |                   |<---------------|                 |
  | { changes[] }     |                |                 |
  |<------------------|                |                 |
  |                   |                |                 |
  | GET chunk from CDN ------------------------------>  |
  | <-- chunk data ----------------------------------- |
  |                   |                |                 |
  | (reassemble file locally)         |                 |
\`\`\`
`,
    jsCode: `## Deep Dive: Content-Defined Chunking

Content-defined chunking uses a **Rabin fingerprint** (rolling hash) to find natural cut points in a file based on content, not fixed offsets. This is the key to efficient delta sync.

\`\`\`
+-------- File bytes stream --------+
| byte byte byte byte byte byte ... |
+---+---+---+---+---+---+---+------+
    |<-- 48-byte sliding window -->|
    |       Rolling Hash           |
    +----------+-------------------+
               |
               v
    hash % TARGET_SIZE == 0 ?
         |           |
        YES          NO
         |           |
    CUT HERE     CONTINUE
         |
         v
+--------+--------+---------+
| Chunk 1| Chunk 2| Chunk 3 |
| SHA-256| SHA-256| SHA-256  |
+--------+--------+---------+
\`\`\`

- Sliding window of 48 bytes computes a polynomial hash
- When \`hash % targetSize == 0\`, declare a chunk boundary
- Target 4MB chunks (min 1MB, max 8MB)
- Insertions at one point do NOT shift boundaries elsewhere
- Each chunk is identified by its SHA-256 hash for dedup

---

## Deep Dive: Conflict Resolution with Version Vectors

\`\`\`
Device A                    Server                  Device B
  |                           |                        |
  | Edit file (v=1)           |                        |
  | VA={A:2, B:1}             |                        |
  |-------------------------->|                        |
  |                           | Store VA={A:2, B:1}    |
  |                           |                        |
  |                           |     Edit file (v=1)    |
  |                           |     VB={A:1, B:2}      |
  |                           |<-----------------------|
  |                           |                        |
  |                    Compare vectors:                 |
  |                    VA={A:2,B:1} vs VB={A:1,B:2}    |
  |                    Neither dominates -> CONFLICT    |
  |                           |                        |
  |   Save both versions:     |                        |
  |   "file.txt"              |                        |
  |   "file (conflict).txt"   |                        |
\`\`\`

- Each device maintains a map of \`{ deviceId: counter }\`
- On each edit, device increments its own counter
- **VA dominates VB** if every entry in VA >= corresponding entry in VB
- If neither dominates, both versions are kept for user resolution
- Same technique used in Amazon Dynamo and CRDTs

---

## Deep Dive: Notification and Sync Protocol

\`\`\`
+----------------------------------------------+
| Notification Service                          |
|                                               |
|  +------------------+  +------------------+   |
|  | Long-Poll Pool   |  | WebSocket Pool   |   |
|  | (Mobile/Web)     |  | (Desktop)        |   |
|  |                  |  |                   |   |
|  | Hold connection  |  | Persistent conn   |   |
|  | until change or  |  | Push immediately  |   |
|  | 30s timeout      |  | on change event   |   |
|  +--------+---------+  +--------+---------+   |
|           |                      |             |
|  +--------v----------------------v---------+   |
|  | Event Bus (Kafka / Redis Pub/Sub)       |   |
|  | Topic per user_id                       |   |
|  +-----------------------------------------+   |
+----------------------------------------------+
\`\`\`

- Desktop clients use **WebSockets** for lowest latency push
- Mobile/web clients use **long polling** (30s timeout, reconnect)
- Events are published per-user to a message bus
- Client receives notification, then pulls changes via sync API with cursor
- Cursor-based sync ensures no events are missed even if client disconnects
`,
    explanation: `## Bottlenecks & Improvements
- **Metadata DB as bottleneck** -> Shard by user_id. Use read replicas for sync queries. Hot users (shared folders with 1000s of collaborators) may need dedicated shards
- **S3 upload latency for small files** -> Batch small chunks into a single upload. Use regional S3 endpoints. Client-side LAN sync (peer-to-peer) for devices on the same network
- **Notification fan-out for shared folders** -> A folder shared with 1000 users means 1000 notifications per edit. Use a fan-out service with rate limiting to prevent thundering herd
- **Cold storage costs** -> Tier old file versions to cheaper storage (S3 Glacier) after 90 days. Only keep the latest N versions in hot storage

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Content-defined vs fixed-size chunking | More CPU on client for chunking, but boundaries survive insertions -- much better delta sync |
| Version vectors over simple version numbers | More metadata per file, but correctly detects concurrent edits across devices |
| Long-polling over WebSocket for mobile | Higher latency than WS, but better for devices that sleep/wake frequently |
| Client-side chunking over server-side | More client complexity, but reduces upload bandwidth and server CPU |
| Cursor-based sync over timestamp-based | Slightly more complex, but guarantees no missed events |

## Monitoring & Alerting
- **Sync latency**: p50, p95, p99 time from file change to appearance on second device
- **Chunk dedup ratio**: Track storage savings; alert if ratio drops (indicates changed workload)
- **Upload failure rate**: Track chunk upload retries and failures
- **Notification delivery latency**: Time from metadata commit to client notification
`,
    timeComplexity: "Upload: O(file_size) for chunking + O(changed_chunks) for transfer. Download: O(missing_chunks) for retrieval. Sync check: O(1) cursor-based query.",
    spaceComplexity: "~100 TB/day new storage with dedup. ~100 TB metadata. Grows linearly with users and file count. 3x replication for durability.",
    hints: [
      "Start by explaining content-defined chunking -- it is the foundation for resumable uploads, delta sync, and deduplication. Without it, you are stuck transferring entire files on every change.",
      "Version vectors are essential for conflict detection in multi-device sync. Simple version numbers cannot distinguish 'I am newer' from 'we both edited independently'. Draw the vector comparison on the whiteboard.",
      "Do not forget the notification service. Without push notifications, clients must poll, adding latency and wasted bandwidth. Long-polling is the practical middle ground between polling and WebSockets.",
      "A common pitfall is ignoring the client-side architecture. The sync agent, local SQLite DB, filesystem watcher, and chunk cache are critical components that interviewers expect you to discuss."
    ],
  },
  {
    id: 9007,
    description: `## Clarifying Questions to Ask
- What is the **target audience size**? Global or regional?
- Do we need to support **live streaming** or only on-demand video?
- What **video quality levels** should we support? (360p to 4K?)
- Should we support **user-generated content** or curated/licensed content only?
- Do we need a **recommendation engine**, or just search and browse?

## Functional Requirements
- Users can **upload videos** of any length (up to 12 hours)
- System **transcodes** videos into multiple resolutions and formats
- Viewers can **stream** videos with adaptive bitrate based on network conditions
- Support **search** by title, description, tags, and captions
- Track **view counts, likes, comments** per video

## Non-Functional Requirements
- **Low startup latency**: video begins playing in < 2 seconds
- **No buffering**: adaptive bitrate keeps playback smooth on varying networks
- **Global reach**: serve content from edge locations near users
- **Scalability**: support 1B daily video views

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily active users | 200M |
| Video views / day | 1B |
| Videos uploaded / day | 500K |
| Average video length | 5 minutes |
| Average raw upload size | 500 MB (1080p) |
| Storage per video (all formats) | ~2 GB (after transcoding to 5 resolutions) |
| New storage / day | 500K x 2 GB = **1 PB/day** |
| Peak streaming bandwidth | 1B views x 10 MB avg / 86,400 = **~115 GB/s** |
| CDN cache hit ratio target | > 95% |
`,
    examples: `## Follow-Up Discussion Points
- **How does adaptive bitrate streaming work?** -> The video is split into small segments (2-10 seconds each). Each segment is encoded at multiple quality levels. The player monitors download speed and buffer level, then requests the appropriate quality for the next segment. HLS and DASH are the two main protocols.
- **How would you handle a viral video that suddenly gets millions of views?** -> CDN edge caches absorb most traffic. If a video is not yet cached at an edge, the origin shield (mid-tier cache) prevents thundering herd to origin storage. Pre-warm popular videos to edge locations based on trending signals.
- **How would you reduce transcoding costs?** -> Use a priority queue: transcode the most popular resolutions first (720p, 1080p), defer 4K and 360p. Use spot/preemptible instances for the transcoding workers. Skip transcoding for videos that never get watched (lazy transcode on first view).
- **How would you handle copyright detection?** -> Compute audio/video fingerprints during upload. Compare against a database of copyrighted content (like YouTube Content ID). Block or flag matches before the video goes live. Use perceptual hashing for visual similarity.
- **How would you support live streaming on this platform?** -> Replace the upload-transcode pipeline with an ingest server that receives RTMP streams. Transcode in real-time to HLS/DASH segments. Push segments to CDN with very short TTLs (2-4 seconds). The player polls for new segments continuously.`,
    intuition: `A video streaming platform is fundamentally a **pipeline problem**: raw video enters, gets transformed through a multi-stage transcoding pipeline, and is served as small adaptive-bitrate segments through a global CDN. The core design challenge is building a transcoding system that can process 500K videos/day while keeping storage costs manageable, paired with a CDN strategy that ensures sub-2-second startup time for a billion daily views.`,
    approach: `## Component Overview

An **upload service** accepts raw video and stores it in blob storage. A **transcoding pipeline** (distributed task queue) converts each video into multiple resolutions and segment formats. A **video metadata service** stores titles, descriptions, and processing status. A **CDN** with origin shield serves video segments globally. A **streaming API** provides manifest files that players use for adaptive bitrate selection.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/videos/upload\` | Upload | Multipart upload -> \`{ videoId, uploadUrl }\` |
| \`GET /api/v1/videos/:id\` | Metadata | Returns title, description, status, thumbnail URL |
| \`GET /api/v1/videos/:id/manifest\` | Stream | Returns HLS/DASH manifest with quality variants |
| \`GET /api/v1/search\` | Search | Query: \`?q=term&page=N\` -> \`{ results[], total }\` |
| \`POST /api/v1/videos/:id/like\` | Engage | Increment like counter |

## Data Model

| Table | Columns | Notes |
|-------|---------|-------|
| videos | video_id (PK), user_id, title, description, status, duration, upload_time | Status: uploaded, processing, ready, failed |
| video_formats | format_id (PK), video_id (FK), resolution, bitrate, codec, segment_count, storage_url | One row per resolution per video |
| video_segments | segment_id, video_id, format_id, segment_number, duration, byte_size, cdn_url | Enables random access seeking |
| video_stats | video_id (PK), view_count, like_count, comment_count | Updated via async counters |
`,
    code: `## Architecture Diagram

\`\`\`
+-----------+       +-------------------+       +-----------------+
| Creator   |------>| Upload Service    |------>| Blob Storage    |
| (Browser) |       | (Presigned URL)   |       | (S3 - raw video)|
+-----------+       +-------------------+       +--------+--------+
                                                         |
                                                         v
                                                +-----------------+
                                                | Message Queue   |
                                                | (SQS / Kafka)   |
                                                +--------+--------+
                                                         |
                              +------------+-------------+----------+
                              |            |             |           |
                              v            v             v           v
                        +----------+ +----------+ +----------+ +----------+
                        |Transcoder| |Transcoder| |Transcoder| |Transcoder|
                        |Worker 360| |Worker 720| |Worker1080| |Worker 4K |
                        +-----+----+ +-----+----+ +-----+----+ +-----+----+
                              |            |             |           |
                              v            v             v           v
                        +--------------------------------------------------+
                        | Transcoded Storage (S3)                           |
                        | /video_id/720p/segment_001.ts                    |
                        | /video_id/720p/segment_002.ts                    |
                        | /video_id/1080p/segment_001.ts ...               |
                        +-------------------------+------------------------+
                                                  |
                                                  v
+-----------+       +------------------+    +-----+-------+
| Viewer    |<----->| CDN Edge PoPs    |<-->| Origin      |
| (Player)  |       | (CloudFront/     |    | Shield      |
|           |       |  Akamai)         |    | (Mid-tier   |
| Adaptive  |       |                  |    |  cache)     |
| Bitrate   |       | Cache segments   |    +-------------+
+-----------+       +------------------+
\`\`\`

## Write Flow (Video Upload + Transcode)

\`\`\`
Creator        Upload Svc      Blob Store     Queue        Transcoder
  |                |               |             |              |
  | Init upload    |               |             |              |
  |--------------->|               |             |              |
  | Presigned URL  |               |             |              |
  |<---------------|               |             |              |
  |                |               |             |              |
  | PUT raw video  |               |             |              |
  |------------------------------->|             |              |
  |                |               |             |              |
  | Complete       |               |             |              |
  |--------------->|               |             |              |
  |                | Enqueue job   |             |              |
  |                |----------------------------->|              |
  |                |               |             | Dequeue      |
  |                |               |             |------------->|
  |                |               | Fetch raw   |              |
  |                |               |<---------------------------|
  |                |               |             |              |
  |                |               | Store segments             |
  |                |               |<---------------------------|
  |                |               |             |    Done      |
  |                | Update status |             |<-------------|
  |                |<--------------------------------------|    |
\`\`\`

## Read Flow (Video Streaming)

\`\`\`
Viewer          CDN Edge        Origin Shield    S3 Storage
  |                |                |                |
  | GET manifest   |                |                |
  |--------------->|                |                |
  |  (cache miss)  |                |                |
  |                |--------------->|                |
  |                |  manifest      |                |
  |                |<---------------|                |
  | manifest       |                |                |
  |<---------------|                |                |
  |                |                |                |
  | GET segment_1  |                |                |
  | (720p)         |                |                |
  |--------------->|                |                |
  | [HIT] segment  |                |                |
  |<---------------|                |                |
  |                |                |                |
  | GET segment_2  |                |                |
  | (1080p - BW up)|                |                |
  |--------------->|                |                |
  |  (cache miss)  |--------------->|                |
  |                |  (miss)        |--------------->|
  |                |                | segment        |
  |                |                |<---------------|
  |                | segment        |                |
  |                |<---------------|                |
  | segment        |                |                |
  |<---------------|                |                |
\`\`\`
`,
    jsCode: `## Deep Dive: Transcoding Pipeline

The transcoding pipeline is the most compute-intensive component. Each uploaded video must be converted into multiple resolution/bitrate combinations and segmented for adaptive streaming.

\`\`\`
+----------------------------------------------------+
| Transcoding Pipeline                                |
|                                                     |
|  Raw Video (1080p, 2GB)                             |
|       |                                             |
|       v                                             |
|  +----------------+                                 |
|  | Split into     |                                 |
|  | GOP-aligned    | (Group of Pictures boundary)    |
|  | chunks         |                                 |
|  +---+----+---+---+                                 |
|      |    |   |                                     |
|      v    v   v                                     |
|  +------+------+------+                             |
|  |Chunk1|Chunk2|Chunk3|  (parallel transcode)       |
|  +--+---+--+---+--+---+                             |
|     |      |      |                                 |
|     v      v      v                                 |
|  +------+------+------+------+------+               |
|  | 360p | 480p | 720p |1080p | 4K   |              |
|  | 400k | 800k | 2.5M | 5M   | 15M  | (bitrates)  |
|  +------+------+------+------+------+               |
|     |      |      |      |      |                   |
|     v      v      v      v      v                   |
|  +--------------------------------------------+     |
|  | Segment into 4-second .ts files             |     |
|  | Generate HLS playlist (.m3u8) per quality   |     |
|  | Generate master playlist (all qualities)    |     |
|  +--------------------------------------------+     |
+----------------------------------------------------+
\`\`\`

- Split raw video at **GOP boundaries** so chunks can be transcoded independently
- Transcode each chunk in **parallel** across worker fleet (100s of machines)
- Each resolution has its own bitrate ladder rung
- Segment into 4-second \`.ts\` files for HLS (or \`.m4s\` for DASH)
- Generate **master manifest** listing all quality variants

---

## Deep Dive: Adaptive Bitrate Streaming (ABR)

\`\`\`
+----------------------------------------------+
| Client-Side ABR Algorithm                     |
|                                               |
|  +------------------+                         |
|  | Buffer Monitor   |                         |
|  | Current: 12 sec  |                         |
|  +--------+---------+                         |
|           |                                   |
|  +--------v---------+                         |
|  | Bandwidth Est.   |                         |
|  | Last 5 segments: |                         |
|  | 8, 10, 6, 9, 7   |                         |
|  | Avg: 8 Mbps      |                         |
|  +--------+---------+                         |
|           |                                   |
|  +--------v---------+                         |
|  | Quality Selector |                         |
|  |                  |                         |
|  | BW=8M > 5M(1080) |  -> Pick 1080p         |
|  | BW=8M < 15M(4K)  |  -> Skip 4K            |
|  |                  |                         |
|  | Buffer < 5s?     |  -> Drop to 720p       |
|  | Buffer > 20s?    |  -> Try upgrade         |
|  +--------+---------+                         |
|           |                                   |
|  +--------v---------+                         |
|  | Request next     |                         |
|  | segment at       |                         |
|  | chosen quality   |                         |
|  +------------------+                         |
+----------------------------------------------+
\`\`\`

- Player estimates bandwidth from **last N segment download times**
- Compares against the **bitrate ladder** in the manifest
- Picks the highest quality where bitrate < estimated bandwidth
- Buffer level acts as a safety valve: low buffer forces quality drop
- Quality switches happen at segment boundaries (every 4 seconds)

---

## Deep Dive: CDN and Caching Strategy

\`\`\`
+--------------------------------------------------+
| CDN Architecture (3-Tier)                         |
|                                                   |
|  +---------------------------------------------+ |
|  | Tier 1: Edge PoPs (200+ locations)           | |
|  | - Cache popular segments                     | |
|  | - TTL: 24 hours for segments                 | |
|  | - 95%+ hit ratio for trending videos         | |
|  +---------------------+-----------------------+ |
|                        | miss                     |
|  +---------------------v-----------------------+ |
|  | Tier 2: Origin Shield (5-10 locations)       | |
|  | - Regional mid-tier cache                    | |
|  | - Collapses duplicate requests from edges    | |
|  | - Prevents thundering herd on origin         | |
|  +---------------------+-----------------------+ |
|                        | miss                     |
|  +---------------------v-----------------------+ |
|  | Tier 3: Origin (S3 in 3 regions)             | |
|  | - Source of truth for all segments           | |
|  | - Only ~1% of requests reach here            | |
|  +---------------------------------------------+ |
+--------------------------------------------------+
\`\`\`

- **Hot videos** (top 1%) are pre-warmed to edge PoPs based on trending signals
- **Long-tail videos** are served from origin shield on first request, then cached
- Segments near the **beginning of a video** have much higher cache hit rates
- Use **consistent hashing** to route requests for the same segment to the same edge server
`,
    explanation: `## Bottlenecks & Improvements
- **Transcoding backlog** -> Use priority queues: popular creators and short videos first. Auto-scale transcoding workers. Defer 4K transcoding until first viewer requests it
- **Storage cost** -> Only keep popular resolutions (720p, 1080p) permanently. Lazy-transcode 360p and 4K on demand. Delete raw uploads after transcoding completes
- **CDN cost for long-tail content** -> Use tiered caching with origin shield. Compress segments with modern codecs (AV1 saves 30% over H.264). Move rarely-watched videos to cheaper storage
- **Upload processing latency** -> Start transcoding as chunks arrive (streaming transcode). Show a lower-quality version quickly while higher qualities process in background

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| HLS over DASH | Less flexible but universal iOS support; DASH is technically superior |
| 4-second segments over 2-second | Higher latency for quality switches, but fewer HTTP requests and better compression |
| GOP-aligned splitting | Requires two-pass or keyframe detection, but enables parallel transcoding |
| Pre-transcoding all resolutions | Higher upfront cost, but guaranteed instant playback at any quality |
| Origin shield layer | Extra infrastructure cost, but prevents thundering herd on viral videos |

## Monitoring & Alerting
- **Rebuffer rate**: Percentage of playback sessions with buffering events (target < 1%)
- **Startup latency**: p50, p95, p99 time to first frame
- **Transcoding queue depth**: Alert if jobs wait > 30 minutes
- **CDN hit ratio**: Alert if drops below 90% (indicates cache misconfiguration)
- **Error rate**: 4xx/5xx on segment requests
`,
    timeComplexity: "Upload: O(video_duration) for transcoding, parallelized across workers. Streaming: O(1) per segment request via CDN. Search: O(log N) with inverted index.",
    spaceComplexity: "~1 PB/day new storage across all resolutions. CDN caches ~5% of total library (hot content). Grows linearly with video uploads.",
    hints: [
      "Start with the transcoding pipeline -- it is the most unique and complex part of video streaming. Explain GOP-aligned splitting for parallel transcoding and the bitrate ladder for adaptive streaming.",
      "Always mention the origin shield pattern for CDN. Without it, a viral video causes a thundering herd of cache misses from hundreds of edge PoPs all hitting your origin simultaneously.",
      "Adaptive bitrate is a client-side algorithm, not server-side. The server just provides segments at multiple qualities. The player decides which quality to request based on bandwidth estimation and buffer level.",
      "Do not forget the upload experience. Large video uploads need resumable chunked uploads with presigned URLs. Show the user a progress bar and start transcoding before the full upload completes."
    ],
  },
  {
    id: 9008,
    description: `## Clarifying Questions to Ask
- What is the **read-to-write ratio**? Is this read-heavy, write-heavy, or balanced?
- What **consistency level** is required? Strong consistency or eventual?
- What is the expected **data size per key-value pair**? (KBs or MBs?)
- Do we need **range queries** or only point lookups by key?
- What are the **durability requirements**? Can we lose data on crash?

## Functional Requirements
- **PUT(key, value)**: Store a key-value pair with optional TTL
- **GET(key)**: Retrieve value by key with single-digit millisecond latency
- **DELETE(key)**: Remove a key-value pair
- Support **tunable consistency**: allow clients to choose consistency per request
- Automatic **data partitioning** across nodes as data grows

## Non-Functional Requirements
- **Low latency**: < 10ms for reads and writes at p99
- **High availability**: 99.99% uptime (favor AP or CP based on config)
- **Scalability**: handle millions of operations per second
- **Durability**: no data loss after acknowledged writes

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total data size | 100 TB |
| Average key size | 128 bytes |
| Average value size | 1 KB |
| Total records | ~100 billion |
| Read QPS | 5M |
| Write QPS | 500K |
| Replication factor | 3 |
| Total storage (with replication) | 300 TB |
| Nodes (10 TB each) | 30+ nodes |
`,
    examples: `## Follow-Up Discussion Points
- **How do you handle a node failure?** -> With consistent hashing, the next node in the ring takes over the failed node's key range. Hinted handoff stores writes temporarily on a neighboring node. When the failed node recovers, hints are replayed to bring it up to date. If it never recovers, the remaining replicas re-replicate to maintain the replication factor.
- **How would you support range queries?** -> Consistent hashing does not preserve key ordering. To support range queries, use a partitioning scheme that preserves order (like DynamoDB's sort key within a partition). Alternatively, use an LSM-tree storage engine that keeps data sorted within each node.
- **What happens during a network partition?** -> With quorum reads/writes (W + R > N), the system can still serve requests as long as a quorum of replicas is reachable. If you choose AP (like Dynamo), serve stale data and reconcile later. If you choose CP (like HBase), reject requests to the unreachable partition.
- **How would you implement transactions across multiple keys?** -> Single-key operations are straightforward with quorum. Multi-key transactions require coordination (2PC or Paxos). Most KV stores avoid this for performance. DynamoDB supports transactions with a coordinator that locks involved items.
- **How would you detect and repair stale replicas?** -> Use read repair: on every quorum read, compare replica responses. If they diverge, update the stale ones. Background anti-entropy uses Merkle trees: each node builds a hash tree of its key ranges and compares with replica nodes to find divergence efficiently.`,
    intuition: `A distributed key-value store is fundamentally about **partitioning data across nodes while maintaining copies for fault tolerance and tuning the trade-off between consistency and availability**. Consistent hashing determines WHERE data lives, quorum protocols determine HOW MANY nodes must agree on reads/writes, and vector clocks determine WHICH version wins when replicas diverge. The elegance of this design is that every parameter (N, R, W) is tunable per request.`,
    approach: `## Component Overview

A **coordinator node** receives client requests and routes them to the correct replicas using consistent hashing. Each **storage node** owns a range on the hash ring and stores data in an **LSM-tree** (Log-Structured Merge-tree) for fast writes. A **gossip protocol** maintains cluster membership and failure detection. **Quorum parameters** (N replicas, W write quorum, R read quorum) provide tunable consistency.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`PUT /api/v1/kv/:key\` | Write | Body: \`{ value, ttl?, consistency: "one"/"quorum"/"all" }\` -> \`{ version }\` |
| \`GET /api/v1/kv/:key\` | Read | Query: \`?consistency=quorum\` -> \`{ value, version, metadata }\` |
| \`DELETE /api/v1/kv/:key\` | Delete | Tombstone write replicated to quorum -> \`{ status }\` |

## Data Model

| Component | Structure | Notes |
|-----------|-----------|-------|
| Key | Byte array (up to 256B) | Hashed with MD5/murmur3 for ring placement |
| Value | Byte array (up to 1MB) | Opaque to the store |
| Metadata | version_clock, timestamp, ttl | Vector clock for conflict resolution |
| Storage | LSM-tree per node | Memtable -> SSTable flush -> compaction |
`,
    code: `## Architecture Diagram

\`\`\`
+------------+       +--------------------+
| Client SDK |------>| Coordinator Node   |
| (Any node  |       | (routes by key)    |
|  can be    |       |                    |
|  coord.)   |       | 1. Hash(key)       |
+------------+       | 2. Find N replicas |
                     | 3. Send to quorum  |
                     +----+----------+----+
                          |          |
              +-----------v--+  +---v-----------+
              | Hash Ring     |  |               |
              |               |  |               |
              |    N1---N2    |  |               |
              |   /       \\   |  |               |
              |  N6       N3  |  |               |
              |   \\       /   |  |               |
              |    N5---N4    |  |               |
              |               |  |               |
              | Virtual nodes |  | Gossip Proto  |
              | for balance   |  | (membership,  |
              +--------------+  |  failure det.) |
                                +---------------+
                    |
     +--------------+--------------+
     |              |              |
+----v-----+  +----v-----+  +----v-----+
| Node A   |  | Node B   |  | Node C   |
| (Replica)|  | (Replica)|  | (Replica)|
|          |  |          |  |          |
| LSM-Tree |  | LSM-Tree |  | LSM-Tree |
| Memtable |  | Memtable |  | Memtable |
| SSTables |  | SSTables |  | SSTables |
+----------+  +----------+  +----------+
\`\`\`

## Write Flow (Quorum Write)

\`\`\`
Client          Coordinator       Node A         Node B        Node C
  |                  |               |              |              |
  | PUT(key, val)    |               |              |              |
  |----------------->|               |              |              |
  |                  | Hash(key)     |              |              |
  |                  | Replicas:A,B,C|              |              |
  |                  |               |              |              |
  |                  | Write ------->|              |              |
  |                  | Write ---------------------->|              |
  |                  | Write -------------------------------------->|
  |                  |               |              |              |
  |                  | ACK <---------|              |              |
  |                  | ACK <-----------------------|              |
  |                  |               |              |   (slow)     |
  |   W=2 met        |               |              |              |
  |   { version }   |               |              |              |
  |<-----------------|               |              |              |
  |                  |               |              |   ACK        |
  |                  |               |              |<-------------|
  |                  | (3rd ACK, already responded) |              |
\`\`\`

## Read Flow (Quorum Read + Repair)

\`\`\`
Client          Coordinator       Node A         Node B        Node C
  |                  |               |              |              |
  | GET(key)         |               |              |              |
  |----------------->|               |              |              |
  |                  | Read -------->|              |              |
  |                  | Read ----------------------->|              |
  |                  | Read ------------------------------------->|
  |                  |               |              |              |
  |                  | v=5 <---------|              |              |
  |                  | v=5 <-----------------------|              |
  |                  | v=3 <-------------------------------------|
  |                  |               |              |              |
  |   R=2 met        |               |              |              |
  |   { val, v=5 }  |               |              |              |
  |<-----------------|               |              |              |
  |                  |               |              |              |
  |                  | Read repair: send v=5 ------------------>  |
  |                  |               |              |  (async)     |
\`\`\`
`,
    jsCode: `## Deep Dive: Consistent Hashing with Virtual Nodes

Consistent hashing maps both keys and nodes to positions on a ring. Each key is stored on the first N nodes clockwise from its position. Virtual nodes (vnodes) ensure even distribution.

\`\`\`
              Hash Ring (0 to 2^128)

                   0
                   |
            N1-v1--+--N3-v2
           /                \\
         /                    \\
       N2-v3                N1-v2
       |                       |
       |    Key "user:42"      |
       |    hash = 0x7A...     |
       |        *              |
       N3-v1                N2-v1
         \\                    /
           \\                /
            N1-v3--+--N2-v2
                   |
                  2^64

Replicas for "user:42": N1, N3, N2
(walk clockwise, pick next 3 distinct nodes)
\`\`\`

- Each physical node owns **100-200 virtual nodes** spread around the ring
- Adding a node only moves ~1/N of keys (not 1/2 as with modular hashing)
- **Heterogeneous hardware**: give more vnodes to more powerful machines
- When a node fails, its load is spread across all remaining nodes (not just one)

---

## Deep Dive: LSM-Tree Storage Engine

\`\`\`
+---------------------------------------------+
| LSM-Tree (per node)                          |
|                                              |
|  +-------------------+                       |
|  | Write-Ahead Log   | (durability)          |
|  | (append-only)     |                       |
|  +---------+---------+                       |
|            |                                 |
|  +---------v---------+                       |
|  | Memtable (sorted) | (in-memory, red-black |
|  | key1: val1        |  tree or skip list)   |
|  | key2: val2        |                       |
|  | key3: val3        | Flush when > 64MB     |
|  +---------+---------+                       |
|            | flush                           |
|  +---------v---------+                       |
|  | Level 0 SSTables  | (immutable, sorted)   |
|  | [SST1] [SST2]     | May have overlapping  |
|  +---------+---------+ key ranges            |
|            | compaction                       |
|  +---------v---------+                       |
|  | Level 1 SSTables  | (non-overlapping      |
|  | [SST-A] [SST-B]   |  key ranges)          |
|  +---------+---------+                       |
|            | compaction                       |
|  +---------v---------+                       |
|  | Level 2+ SSTables | (10x size each level) |
|  | [SST-X] [SST-Y]   |                       |
|  +-------------------+                       |
+---------------------------------------------+
\`\`\`

- **Writes**: Append to WAL, insert into memtable -> O(log N), very fast
- **Reads**: Check memtable -> L0 SSTables -> L1 -> L2 (use bloom filters to skip)
- **Compaction**: Merge overlapping SSTables, discard old versions and tombstones
- **Bloom filters**: 10 bits/key, ~1% false positive rate, avoids unnecessary disk reads

---

## Deep Dive: Conflict Resolution

\`\`\`
+------------------------------------------+
| Vector Clock Conflict Detection           |
|                                           |
| Write 1 on Node A: VC = {A:1}            |
|       |                                   |
|       v                                   |
| Write 2 on Node A: VC = {A:2}            |
|       |                                   |
|       +-------+                           |
|       |       |                           |
|       v       v                           |
| Node A     Node B                         |
| {A:3}      {A:2, B:1}                    |
|       |       |                           |
|       v       v                           |
|  Neither dominates -> CONFLICT            |
|  Return both versions to client           |
|  Client resolves (e.g., merge, LWW)      |
+------------------------------------------+
\`\`\`

- **Vector clock**: Map of node -> counter. Each write increments the writer's counter
- **Dominates**: VC1 dominates VC2 if all entries in VC1 >= VC2
- **Conflict**: Neither dominates the other -> concurrent writes detected
- **Resolution strategies**: Last-Writer-Wins (DynamoDB), application-level merge (Riak), CRDTs
- **Clock pruning**: Truncate old entries to prevent unbounded growth
`,
    explanation: `## Bottlenecks & Improvements
- **Hot key problem** -> A single key receiving millions of QPS overwhelms one partition. Solution: client-side caching, read replicas for hot keys, or key splitting (append random suffix and aggregate on read)
- **Compaction storms** -> LSM compaction is I/O intensive and can cause latency spikes. Use rate-limited compaction, leveled compaction strategy, and dedicated I/O threads
- **Gossip protocol convergence** -> Large clusters (1000+ nodes) take longer to propagate membership changes. Use hierarchical gossip or a seed-based protocol to speed convergence
- **Rebalancing on node add/remove** -> Moving data between nodes consumes bandwidth. Throttle data transfer, prioritize serving reads, and use virtual nodes to spread the load

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Consistent hashing over range partitioning | No natural ordering (no range queries), but even distribution and minimal reshuffling |
| LSM-tree over B-tree | Slower reads (multiple levels to check), but much faster writes (sequential I/O only) |
| Quorum (W+R>N) over consensus (Paxos/Raft) | Less strict consistency guarantees, but lower latency and no leader bottleneck |
| Vector clocks over last-writer-wins | More complex client logic, but preserves concurrent writes for application-level resolution |
| Gossip over centralized membership | Slower convergence, but no single point of failure for cluster membership |

## Monitoring & Alerting
- **Read/write latency**: p50, p95, p99 per node and per key
- **Compaction lag**: Pending compaction bytes; alert if it grows continuously
- **Gossip convergence time**: How fast membership changes propagate
- **Data skew**: Key count per node; alert if any node has 2x average
- **Hinted handoff queue**: Size and age of pending hints
`,
    timeComplexity: "Write: O(1) amortized (WAL append + memtable insert). Read: O(log N) per SSTable level with bloom filter optimization. Consistent hashing lookup: O(log V) where V = virtual nodes.",
    spaceComplexity: "300 TB total with 3x replication across 30+ nodes. Bloom filters add ~1% memory overhead. Vector clocks: O(N) per key where N = replica count.",
    hints: [
      "Draw the consistent hashing ring first -- it is the foundation of the entire system. Show virtual nodes, explain why they matter for load balancing, and walk through what happens when a node joins or leaves.",
      "The quorum formula W + R > N is the key to tunable consistency. W=1 R=3 gives fast writes. W=3 R=1 gives fast reads. W=2 R=2 is balanced. Let the interviewer see you reason about these trade-offs.",
      "Do not skip the storage engine. LSM-trees are chosen for write-heavy workloads because all writes are sequential (append WAL, flush memtable). B-trees are better for read-heavy workloads. Explain why.",
      "Read repair and anti-entropy (Merkle trees) are how the system self-heals. Without them, replicas silently diverge over time. Mention both the eager (read repair) and lazy (anti-entropy) approaches."
    ],
  },
  {
    id: 9009,
    description: `## Clarifying Questions to Ask
- What is the **scale of the web** we need to index? (Billions of pages?)
- Do we need **real-time** indexing or is a delay of hours acceptable?
- Should we support **advanced queries** (phrases, boolean operators, filters)?
- Do we need **personalized results** or the same results for everyone?
- What **freshness requirements** exist? (News must be minutes-fresh, Wikipedia can be days-old)

## Functional Requirements
- **Crawl** the web and discover new/updated pages continuously
- Build and maintain an **inverted index** for full-text search
- **Rank** results by relevance using signals like PageRank, text relevance, freshness
- Return the top K results for a query in **< 500ms**
- Support **spell correction** and query suggestions

## Non-Functional Requirements
- **Scale**: index 10B+ web pages
- **Freshness**: important pages re-crawled within hours, long-tail within weeks
- **Low latency**: p99 search response < 1 second
- **High availability**: 99.99% uptime for the search API

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Pages indexed | 10 billion |
| Average page size (compressed) | 50 KB |
| Raw crawl storage | 10B x 50KB = **500 TB** |
| Inverted index size | ~10% of raw = **50 TB** |
| Unique terms | ~1 billion |
| Search QPS | 100K |
| Crawl rate | 1B pages/day = **~12K pages/sec** |
| Index update latency | Minutes for hot pages, days for cold |
`,
    examples: `## Follow-Up Discussion Points
- **How does PageRank work at a high level?** -> Model the web as a directed graph where pages are nodes and hyperlinks are edges. A page's rank is proportional to the sum of ranks of pages linking to it, divided by their out-degree. Computed iteratively: start with equal rank for all pages, then repeatedly update until convergence (typically 50-100 iterations over the entire web graph).
- **How would you handle duplicate content across different URLs?** -> Compute a fingerprint (SimHash or MinHash) of each page's content. Group pages with similar fingerprints. Keep only the canonical URL (usually the one with the most inbound links) in the search index. Redirect duplicate URLs to the canonical version.
- **How would you support phrase queries like "machine learning"?** -> The inverted index stores not just document IDs but also word positions within each document. For a phrase query, find documents containing all words, then check that the positions are consecutive. This is called a positional inverted index.
- **How would you handle query spikes (e.g., breaking news)?** -> Cache recent query results aggressively (TTL of seconds to minutes). Use a trending queries detector to pre-warm caches. Scale the serving tier horizontally. The index itself does not change; only the serving layer needs to handle the load spike.
- **How would you personalize search results?** -> Maintain a user profile of interests, search history, and location. Re-rank the top K results using the profile as additional signals. Keep personalization in a separate re-ranking layer so the core index remains user-agnostic and cacheable.`,
    intuition: `A search engine is fundamentally a **three-stage pipeline**: crawl the web to discover content, build an inverted index to make it searchable, and rank results using multiple signals (text relevance, PageRank, freshness). The core design challenge is building an inverted index over billions of documents that can answer arbitrary keyword queries in milliseconds while continuously updating as the web changes.`,
    approach: `## Component Overview

A **distributed crawler** fetches web pages respecting robots.txt and politeness policies. A **document processor** extracts text, computes fingerprints for dedup, and builds the inverted index. The **inverted index** maps terms to sorted posting lists of document IDs. A **query serving layer** parses queries, retrieves posting lists, computes intersections, and ranks results. **PageRank** is computed offline as a batch job over the web graph.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/search\` | Query | Params: \`?q=term&page=1&count=10\` -> \`{ results[], total, spellCorrection? }\` |
| \`GET /api/v1/suggest\` | Autocomplete | Params: \`?prefix=mac\` -> \`{ suggestions[] }\` |
| \`POST /api/v1/crawl/seed\` | Admin | Body: \`{ urls[] }\` -> Enqueue URLs for crawling |

## Data Model

| Component | Structure | Notes |
|-----------|-----------|-------|
| Document store | doc_id, url, title, snippet, crawl_time, pagerank | Compressed, sharded by doc_id |
| Inverted index | term -> [(doc_id, tf, positions[])] | Sorted posting lists, sharded by term hash |
| Web graph | source_url -> [outgoing_urls] | Adjacency list for PageRank computation |
| URL frontier | url, priority, last_crawl, domain | Priority queue for crawler scheduling |
`,
    code: `## Architecture Diagram

\`\`\`
+------------------------------------------------------+
| Crawling Layer                                        |
|                                                       |
| +----------+    +---------+    +-------------------+  |
| | URL       |--->| Crawler |    | DNS Resolver      |  |
| | Frontier  |    | Workers |<-->| (local cache)     |  |
| | (Priority |    | (1000s) |    +-------------------+  |
| |  Queue)   |<---| Respect |    +-------------------+  |
| +----------+    | robots  |--->| Raw Page Store     |  |
|                 +---------+    | (Distributed FS)   |  |
+------------------------------------------------------+
                       |
                       v
+------------------------------------------------------+
| Indexing Layer                                         |
|                                                       |
| +--------------+  +-----------+  +-----------------+  |
| | Doc Processor|  | Dedup     |  | Index Builder   |  |
| | - Parse HTML |  | (SimHash) |  | - Tokenize      |  |
| | - Extract    |  | - Detect  |  | - Build posting |  |
| |   text       |  |   near-   |  |   lists         |  |
| | - Extract    |  |   dupes   |  | - Compute TF-IDF|  |
| |   links      |  +-----------+  +---------+-------+  |
| +--------------+                           |          |
+------------------------------------------------------+
                       |
                       v
+------------------------------------------------------+
| Serving Layer                                         |
|                                                       |
|  +----------+     +----------------+    +-----------+ |
|  | Query    |---->| Index Servers  |--->| Ranker    | |
|  | Parser   |     | (Sharded by    |    | (PageRank | |
|  | - Spell  |     |  term hash)    |    |  + TF-IDF | |
|  |   check  |     |                |    |  + fresh- | |
|  | - Expand |     | Posting list   |    |   ness)   | |
|  |   query  |     | intersection   |    +-----------+ |
|  +----------+     +----------------+                  |
+------------------------------------------------------+
\`\`\`

## Write Flow (Crawl + Index)

\`\`\`
URL Frontier     Crawler       Doc Processor    Index Builder
    |               |               |                |
    | Next URL      |               |                |
    |-------------->|               |                |
    |               | Fetch page    |                |
    |               |---+           |                |
    |               |   | HTTP GET  |                |
    |               |<--+           |                |
    |               |               |                |
    |               | Raw HTML      |                |
    |               |-------------->|                |
    |               |               | Parse, extract |
    |               |               | text + links   |
    | New URLs      |               |                |
    |<------------------------------|                |
    |               |               | Tokens + meta  |
    |               |               |--------------->|
    |               |               |                | Update
    |               |               |                | posting
    |               |               |                | lists
\`\`\`

## Read Flow (Search Query)

\`\`\`
User             Query Parser    Index Servers     Ranker
  |                  |               |                |
  | "best laptops"   |               |                |
  |----------------->|               |                |
  |                  | Tokenize,     |                |
  |                  | spell check   |                |
  |                  |               |                |
  |                  | Get postings  |                |
  |                  | for "best"    |                |
  |                  |-------------->|                |
  |                  | Get postings  |                |
  |                  | for "laptops" |                |
  |                  |-------------->|                |
  |                  |               |                |
  |                  | Intersect     |                |
  |                  | posting lists |                |
  |                  |<--------------|                |
  |                  |               |                |
  |                  | Rank results  |                |
  |                  |------------------------------>|
  |                  |               |  Top K sorted  |
  |                  |               |<--------------|
  | Results[]        |               |                |
  |<-----------------|               |                |
\`\`\`
`,
    jsCode: `## Deep Dive: Inverted Index Structure

The inverted index is the core data structure that makes search fast. It maps every unique term to a sorted list of documents containing that term.

\`\`\`
+----------------------------------------------------+
| Inverted Index                                      |
|                                                     |
| Term          Posting List                          |
| --------      --------------------------------      |
| "apple"  -->  [(doc1, tf=3, pos=[5,12,99]),         |
|                (doc7, tf=1, pos=[42]),               |
|                (doc15, tf=5, pos=[1,8,15,22,30])]   |
|                                                     |
| "laptop" -->  [(doc1, tf=2, pos=[6,100]),            |
|                (doc3, tf=4, pos=[1,5,9,20]),         |
|                (doc7, tf=1, pos=[43])]               |
|                                                     |
| Phrase query "apple laptop":                        |
|   1. Intersect doc lists: {doc1, doc7}              |
|   2. Check positions: doc1 pos 5,6 -> consecutive!  |
|   3. doc7 pos 42,43 -> consecutive!                 |
|   4. Both match the phrase                          |
+----------------------------------------------------+
\`\`\`

- Each posting stores **document ID, term frequency, and positions**
- Posting lists are **sorted by doc_id** for efficient intersection
- Intersection of two lists: O(N+M) with two-pointer merge
- **Positions** enable phrase queries and proximity scoring
- Lists are compressed with **variable-byte encoding** (delta-encode doc IDs)

---

## Deep Dive: PageRank Computation

\`\`\`
+----------------------------------------------------+
| Web Graph -> PageRank                               |
|                                                     |
|     Page A (3 outlinks)                             |
|     PR = 0.5                                        |
|       |   |   |                                     |
|       v   v   v                                     |
|      B    C    D                                    |
|                                                     |
|   Page B receives:                                  |
|     PR(A)/3 from A                                  |
|     PR(E)/2 from E                                  |
|     PR(F)/1 from F                                  |
|                                                     |
|   PR(B) = 0.15 + 0.85 * (PR(A)/3 + PR(E)/2        |
|                          + PR(F)/1)                 |
|                                                     |
| Iterate 50-100 times until convergence              |
+----------------------------------------------------+

MapReduce Implementation:
+-------------------+     +-------------------+
| MAP               |     | REDUCE            |
|                   |     |                   |
| For each page P:  |     | For each page P:  |
|   For each link L:|     |   Sum incoming    |
|     emit(L,       |     |   contributions   |
|      PR(P)/out(P))|     |   Apply damping:  |
+-------------------+     |   0.15+0.85*sum   |
                          +-------------------+
\`\`\`

- **Damping factor** (0.85): probability of following a link vs. random jump
- Computed as a **batch job** (MapReduce/Spark) over the entire web graph
- Run weekly or daily; does not need to be real-time
- Result is a single float per page, stored alongside the document metadata
- Used as one signal among many in the final ranking formula

---

## Deep Dive: Distributed Crawler Architecture

\`\`\`
+----------------------------------------------+
| URL Frontier (Priority Queue)                 |
|                                               |
| +--------------------+  +------------------+  |
| | Back Queue         |  | Front Queue      |  |
| | (per-domain)       |  | (priority-based) |  |
| |                    |  |                   |  |
| | google.com: [...] |  | Priority 1: [...]  |  |
| | amazon.com: [...] |  | Priority 2: [...]  |  |
| | blog.xyz:   [...] |  | Priority 3: [...]  |  |
| +--------+-----------+  +--------+----------+  |
|          |                        |             |
|   Politeness              Importance            |
|   (1 req/sec per          (PageRank, freshness, |
|    domain)                 change frequency)    |
+----------------------------------------------+

Politeness enforcement:
+---------+     +---------+     +---------+
| Worker 1|     | Worker 2|     | Worker 3|
| owns:   |     | owns:   |     | owns:   |
| *.com   |     | *.org   |     | *.net   |
| domains |     | domains |     | domains |
+---------+     +---------+     +---------+
\`\`\`

- **Front queue**: prioritizes URLs by importance (PageRank, freshness needs)
- **Back queue**: per-domain queues enforce politeness (max 1 request/second/domain)
- Workers are assigned domain ranges to prevent multiple workers hitting the same domain
- Respect \`robots.txt\`: cache per domain, check before each fetch
- Re-crawl frequency based on page change rate (news: hourly, static: monthly)
`,
    explanation: `## Bottlenecks & Improvements
- **Crawler politeness vs speed** -> Must balance fast crawling with not overwhelming target servers. Use per-domain rate limits, distributed coordination, and prioritize high-value pages
- **Index freshness** -> Real-time indexing for news/trending content. Batch re-indexing for the long tail. Maintain a "fresh index" (recent changes) merged with the "main index" at query time
- **Query latency for rare terms** -> Long posting lists for common terms need pruning. Use early termination: stop after finding enough high-quality candidates. Skip list structures for fast intersection
- **Storage growth** -> The web grows faster than you can index it. Focus on quality: use PageRank and domain authority to decide what to crawl and keep

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Inverted index over forward index | Must rebuild index on document change, but queries are O(posting list) instead of O(all docs) |
| Batch PageRank over real-time | Ranks may be hours stale, but computation is tractable (one MapReduce job vs. continuous graph updates) |
| Sharding index by term vs by document | Cross-shard queries for multi-term searches, but each shard is smaller and fits in memory |
| SimHash dedup over exact matching | May miss some duplicates, but O(1) comparison vs O(N) pairwise |
| Positional index over basic index | 3x larger index, but enables phrase queries and proximity scoring |

## Monitoring & Alerting
- **Crawl rate**: Pages crawled per second; alert if it drops (indicates infrastructure issue or mass blocking)
- **Index freshness**: Age of the oldest un-indexed page; alert if > threshold
- **Query latency**: p50, p95, p99; alert if p99 > 1 second
- **Result quality**: Click-through rate on top results; track over time for degradation
- **Crawler error rate**: HTTP 5xx, timeouts, robots.txt blocks
`,
    timeComplexity: "Search: O(L1 + L2) for posting list intersection where L = list length. Ranking top K: O(N log K) with a min-heap. Crawling: O(1) per page fetch. PageRank: O(iterations x edges) per batch.",
    spaceComplexity: "~500 TB raw crawl data. ~50 TB inverted index (compressed). ~10 TB web graph for PageRank. Index grows linearly with pages indexed.",
    hints: [
      "Structure your answer around the three stages: crawl, index, serve. Each stage is a separate distributed system with its own scaling challenges. Do not try to design all three in equal depth -- focus on the inverted index and ranking.",
      "The inverted index is just a hash map from term to sorted list of doc IDs. The magic is in compression (delta encoding, variable-byte), sharding (by term hash), and intersection algorithms (two-pointer merge, skip lists).",
      "PageRank is computed offline as a batch job -- do not try to compute it in real-time. It is just one signal among many (TF-IDF, freshness, domain authority, user signals). Spend 2 minutes explaining it, not 10.",
      "The crawler's politeness policy is a common pitfall. Without per-domain rate limiting, you will get blocked and potentially cause legal issues. The URL frontier with front and back queues is the standard design."
    ],
  },
  {
    id: 9010,
    description: `## Clarifying Questions to Ask
- What is the **expected data size** per cache entry? (Small objects < 1MB?)
- Do we need **persistence** or is this a pure in-memory volatile cache?
- What **consistency guarantees** are needed between cache and database?
- Should the cache support **multi-tenant** isolation?
- What **eviction policy** should be the default? (LRU, LFU, TTL?)

## Functional Requirements
- **GET(key)**: Retrieve cached value with < 1ms latency
- **SET(key, value, ttl)**: Store a key-value pair with optional expiration
- **DELETE(key)**: Explicitly invalidate a cached entry
- Support **multiple eviction policies**: LRU, LFU, and TTL-based
- **Distributed** across multiple nodes with automatic partitioning

## Non-Functional Requirements
- **Ultra-low latency**: p99 < 1ms for reads
- **High throughput**: 1M+ operations per second per node
- **Availability**: cache misses fall back to database, so partial failures are tolerable
- **Memory efficiency**: minimize fragmentation and overhead per entry

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total cache size | 10 TB across cluster |
| Average entry size | 500 bytes |
| Total entries | ~20 billion |
| Read QPS (total) | 10M |
| Write QPS (total) | 1M |
| Nodes (128 GB RAM each) | ~80 nodes |
| Cache hit ratio target | > 95% |
| Network bandwidth per node | 1-2 Gbps |
`,
    examples: `## Follow-Up Discussion Points
- **What happens when a cache node dies?** -> With consistent hashing, only ~1/N of keys are affected. Those requests become cache misses hitting the database. Implement a miss rate limiter to prevent DB overload. The replacement node starts cold and warms up organically from misses. Optionally, use a buddy system where a partner node keeps a copy of hot keys.
- **How do you prevent cache stampede (thundering herd)?** -> When a popular key expires, thousands of requests simultaneously miss the cache and hit the database. Solutions: (1) Lock the key so only one request fetches from DB while others wait. (2) Probabilistic early expiration: refresh before TTL with some randomness. (3) Never expire hot keys -- refresh them asynchronously in the background.
- **Cache-aside vs read-through vs write-through?** -> Cache-aside: application manages cache (check cache, on miss fetch from DB, populate cache). Read-through: cache itself fetches from DB on miss. Write-through: cache writes to DB synchronously on every SET. Write-behind: cache batches writes to DB asynchronously. Each has different consistency and performance characteristics.
- **How would you handle hot keys?** -> A single key receiving millions of QPS can overwhelm one cache node. Solutions: replicate hot keys across multiple nodes, use client-side local caching (L1 cache), or split the key into N sub-keys with random selection and aggregate on read.
- **How would you ensure cache consistency with the database?** -> The fundamental problem is that cache and DB are two separate systems with no transactional guarantee. Common patterns: (1) Cache-aside with TTL as a safety net. (2) Change Data Capture (CDC) from DB to invalidate cache entries. (3) Write-through cache for strong consistency at the cost of write latency.`,
    intuition: `A distributed cache is fundamentally about **putting frequently accessed data in fast memory close to the application to avoid slow database round-trips**. The core design challenges are: (1) partitioning data across nodes with consistent hashing so that adding/removing nodes minimally disrupts the cache, (2) choosing the right eviction policy to maximize hit ratio within fixed memory, and (3) maintaining acceptable consistency between the cache and the source of truth (database).`,
    approach: `## Component Overview

A **client library** hashes keys to determine which cache node to contact. **Cache nodes** store key-value pairs in memory using a hash table with an LRU/LFU eviction structure. **Consistent hashing** distributes keys across nodes. A **configuration service** (ZooKeeper/etcd) tracks cluster membership. There is no replication by default -- cache misses simply fall through to the database.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /cache/:key\` | Read | Returns \`{ value, ttl_remaining }\` or 404 on miss |
| \`SET /cache/:key\` | Write | Body: \`{ value, ttl_seconds }\` -> \`{ status: "OK" }\` |
| \`DELETE /cache/:key\` | Invalidate | Removes entry -> \`{ status: "OK" }\` |
| \`FLUSH /cache\` | Admin | Clears all entries on a node |

## Data Model

| Component | Structure | Notes |
|-----------|-----------|-------|
| Hash table | key -> (value, metadata) | Open addressing or chaining, load factor < 0.75 |
| LRU list | Doubly-linked list + hash map | O(1) access and eviction |
| TTL wheel | Hierarchical timing wheel | Efficient expiration of millions of keys |
| Slab allocator | Fixed-size memory classes | 64B, 128B, 256B, ... 1MB to reduce fragmentation |
`,
    code: `## Architecture Diagram

\`\`\`
+------------+    +------------+    +------------+
| App Server |    | App Server |    | App Server |
| +--------+ |    | +--------+ |    | +--------+ |
| |Client  | |    | |Client  | |    | |Client  | |
| |Library | |    | |Library | |    | |Library | |
| |        | |    | |        | |    | |        | |
| |Hash key| |    | |Hash key| |    | |Hash key| |
| |-> node | |    | |-> node | |    | |-> node | |
| +---+----+ |    | +---+----+ |    | +---+----+ |
+-----|------+    +-----|------+    +-----|------+
      |                 |                 |
      v                 v                 v
+------------------------------------------------+
| Consistent Hash Ring                            |
|                                                 |
|         N1---N2                                 |
|        /       \\                                |
|      N6         N3                              |
|        \\       /                                |
|         N5---N4                                 |
|                                                 |
+-----+-------+-------+-------+-------+---------+
      |       |       |       |       |
+-----v-+ +--v----+ +v------+ +v-----+ +--------+
| Node 1| | Node 2| | Node 3| |Node 4| | Node N |
| 128GB | | 128GB | | 128GB | |128GB | | 128GB  |
|       | |       | |       | |      | |        |
| Hash  | | Hash  | | Hash  | |Hash  | | Hash   |
| Table | | Table | | Table | |Table | | Table  |
| + LRU | | + LRU | | + LRU | |+ LRU| | + LRU  |
+-------+ +-------+ +-------+ +------+ +--------+

+--------------------------------------------------+
| Config Service (ZooKeeper / etcd)                 |
| - Cluster membership                              |
| - Node health monitoring                          |
| - Consistent hash ring updates                    |
+--------------------------------------------------+
\`\`\`

## Write Flow (Cache SET)

\`\`\`
App Server        Client Lib       Cache Node
  |                   |                |
  | SET(key, val)     |                |
  |------------------>|                |
  |                   | Hash(key)      |
  |                   | -> Node 3      |
  |                   |                |
  |                   | SET to Node 3  |
  |                   |--------------->|
  |                   |                | Store in hash
  |                   |                | table, update
  |                   |                | LRU position,
  |                   |                | set TTL in
  |                   |                | timing wheel
  |                   |                |
  |                   |                | If memory full:
  |                   |                | evict LRU tail
  |                   |                |
  |                   |    OK          |
  |                   |<---------------|
  |   OK              |                |
  |<------------------|                |
\`\`\`

## Read Flow (Cache GET)

\`\`\`
App Server        Client Lib       Cache Node       Database
  |                   |                |                |
  | GET(key)          |                |                |
  |------------------>|                |                |
  |                   | Hash(key)      |                |
  |                   | -> Node 3      |                |
  |                   |                |                |
  |                   | GET from Node 3|                |
  |                   |--------------->|                |
  |                   |                |                |
  |                   | [HIT] value    |                |
  |                   |<---------------|                |
  |   value           |                |                |
  |<------------------|                |                |
  |                   |                |                |
  |   --- OR (MISS) ---|                |                |
  |                   |                |                |
  |                   | [MISS] null    |                |
  |                   |<---------------|                |
  |                   |                |                |
  | Fetch from DB  ---------------------------------------->|
  | <-- value ------------------------------------------- |
  |                   |                |                |
  | SET(key, val)     |                |                |
  |------------------>| (populate cache)               |
  |                   |--------------->|                |
  |   value           |                |                |
  |<------------------|                |                |
\`\`\`
`,
    jsCode: `## Deep Dive: LRU Eviction with O(1) Operations

The LRU cache combines a hash table with a doubly-linked list to achieve O(1) for all operations: get, set, and eviction.

\`\`\`
+----------------------------------------------+
| LRU Cache (per node)                          |
|                                               |
| Hash Table:                                   |
| +--------+-----------+                        |
| | key    | list_node |                        |
| +--------+-----------+                        |
| | "usr1" | -------+  |                        |
| | "usr2" | ----+  |  |                        |
| | "usr3" | -+  |  |  |                        |
| +--------+-|--|--|--+                         |
|            |  |  |                            |
| Doubly-Linked List (most recent at head):     |
|                                               |
| HEAD                                  TAIL    |
|  |                                      |     |
|  v                                      v     |
| +------+   +------+   +------+   +------+    |
| | usr3 |<->| usr2 |<->| usr1 |<->| usr0 |    |
| | val3 |   | val2 |   | val1 |   | val0 |    |
| +------+   +------+   +------+   +------+    |
|  (newest)                          (oldest)   |
|                                    ^ evict    |
|                                      this     |
+----------------------------------------------+
\`\`\`

- **GET**: Hash lookup O(1), move node to head O(1)
- **SET**: Hash insert O(1), add node at head O(1)
- **Eviction**: Remove tail node O(1), delete from hash O(1)
- Total memory overhead: ~48 bytes per entry (two pointers + hash entry)

---

## Deep Dive: Memory Management with Slab Allocator

\`\`\`
+----------------------------------------------+
| Slab Allocator                                |
|                                               |
| Memory is pre-divided into slab classes:      |
|                                               |
| +------------+  +------------+  +----------+  |
| | Class 1    |  | Class 2    |  | Class 3  |  |
| | 64 bytes   |  | 128 bytes  |  | 256 bytes|  |
| |            |  |            |  |          |  |
| | [slot]     |  | [slot]     |  | [slot]   |  |
| | [slot]     |  | [slot]     |  | [slot]   |  |
| | [slot]     |  | [slot]     |  | [slot]   |  |
| | [USED]     |  | [USED]     |  | [USED]   |  |
| | [slot]     |  | [USED]     |  | [slot]   |  |
| +------------+  +------------+  +----------+  |
|                                               |
| A 100-byte value goes into Class 2 (128B)     |
| Wastes 28 bytes but eliminates fragmentation  |
|                                               |
| Classes: 64, 128, 256, 512, 1K, 2K, 4K, 8K,  |
|          16K, 32K, 64K, 128K, 256K, 512K, 1M  |
+----------------------------------------------+
\`\`\`

- Pre-allocate memory in **fixed-size classes** (power-of-2 progression)
- Allocating a value: find the smallest class that fits, take a free slot
- **No external fragmentation**: all slots in a class are the same size
- **Internal fragmentation**: a 65-byte value in a 128-byte slot wastes 49%
- In practice, most workloads cluster around a few sizes, so waste is 10-20%

---

## Deep Dive: Cache Consistency Patterns

\`\`\`
+----------------------------------------------+
| Pattern 1: Cache-Aside (most common)          |
|                                               |
|  App ----GET----> Cache                       |
|   |                 |                         |
|   |   MISS          |                         |
|   |<----------------|                         |
|   |                                           |
|   |----GET----> Database                      |
|   |<---value-------|                          |
|   |                                           |
|   |----SET----> Cache (populate)              |
+----------------------------------------------+

+----------------------------------------------+
| Pattern 2: Write-Through                      |
|                                               |
|  App ----SET----> Cache ----SET----> Database  |
|   |                 |                  |      |
|   |<----ACK---------|<-----ACK---------|      |
|   |                                           |
|   | Strong consistency but higher write        |
|   | latency (2 writes per operation)          |
+----------------------------------------------+

+----------------------------------------------+
| Pattern 3: Write-Behind (Async)               |
|                                               |
|  App ----SET----> Cache                       |
|   |                 |                         |
|   |<----ACK---------|                         |
|   |                 |                         |
|   |                 |---(async batch)----->DB  |
|   |                                           |
|   | Fast writes but risk of data loss if      |
|   | cache node crashes before flush           |
+----------------------------------------------+
\`\`\`

- **Cache-aside**: Most common. Application controls cache population. Simple but risk of stale data
- **Write-through**: Strong consistency. Every write goes to both cache and DB. Higher latency
- **Write-behind**: Fastest writes. Cache batches and flushes to DB. Risk of data loss on crash
- **Cache invalidation via CDC**: Database change events trigger cache deletes. Best eventual consistency
`,
    explanation: `## Bottlenecks & Improvements
- **Hot key problem** -> A single popular key (e.g., celebrity profile) can overwhelm one node. Replicate hot keys to multiple nodes, use client-side L1 caching, or split into sub-keys with random routing
- **Cache stampede on expiration** -> When a popular key expires, all requests miss simultaneously. Use probabilistic early refresh, locking (only one miss fetches from DB), or never-expire with background refresh
- **Node failure and cold start** -> Losing a node means 1/N of requests become misses. Implement a miss rate limiter to protect the database. Optionally warm the replacement node from access logs
- **Memory fragmentation over time** -> Without a slab allocator, long-running processes fragment memory badly. The slab allocator trades internal fragmentation for zero external fragmentation

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| No replication (by default) | Simpler, higher throughput, but node failure causes cache misses (acceptable since DB is the source of truth) |
| Consistent hashing over modular hashing | Slightly more complex routing, but adding/removing nodes moves only ~1/N of keys |
| LRU over LFU eviction | May evict a frequently accessed item after one cold period, but simpler and lower overhead than LFU |
| Slab allocator over malloc | Internal fragmentation (10-20% waste), but eliminates external fragmentation and OOM failures |
| Client-side hashing over proxy | No single point of failure, lower latency, but clients must know cluster topology |

## Monitoring & Alerting
- **Hit ratio**: The single most important metric; alert if drops below 90%
- **Eviction rate**: High eviction means cache is too small or TTL too short
- **Memory utilization**: Per-node and per-slab-class usage
- **Latency**: p50, p95, p99 per operation type (GET, SET, DELETE)
- **Connection count**: Too many connections can exhaust file descriptors
`,
    timeComplexity: "GET/SET/DELETE: O(1) average via hash table. LRU eviction: O(1) via doubly-linked list. Consistent hash ring lookup: O(log V) where V = virtual nodes.",
    spaceComplexity: "10 TB total across ~80 nodes. ~48 bytes overhead per entry for LRU metadata. Slab allocator wastes 10-20% for internal fragmentation. No replication by default.",
    hints: [
      "Start with the cache-aside pattern -- it is the most common and what interviewers expect. Draw the read flow (check cache, miss, fetch DB, populate cache) and write flow (write DB, invalidate cache) clearly.",
      "The LRU data structure (hash table + doubly-linked list) is a classic interview question on its own. Be ready to explain why both structures are needed and how they give O(1) for all operations.",
      "Consistent hashing is shared with the key-value store design. Here, the difference is that cache nodes are ephemeral -- losing a node just causes misses, not data loss. This simplifies the design significantly compared to a durable store.",
      "Cache stampede prevention is the most common follow-up. Have three solutions ready: locking (one request fetches, others wait), probabilistic early refresh (refresh before TTL), and never-expire with background refresh."
    ],
  },
];
