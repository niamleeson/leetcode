import { ProblemSolution } from './types';

export const solutionsM2: ProblemSolution[] = [
  {
    id: 9006,
    description: `Design a File Storage System (Dropbox)\n\n**Functional Requirements:**\n- Upload and download files of any size (up to 10GB)\n- Synchronize files across multiple devices in near real-time\n- Support resumable uploads for large files\n- Delta sync: only transfer changed portions of a file\n- File versioning with ability to restore previous versions\n- Share files/folders with other users via links or direct access\n- Conflict resolution when the same file is edited on multiple devices simultaneously\n\n**Non-Functional Requirements:**\n- High durability: 99.9999999% (eleven 9s) — no data loss ever\n- Availability: 99.9% uptime\n- Consistency: strong consistency for metadata, eventual consistency for file content propagation\n- Sync latency: file changes should appear on other devices within 5 seconds on average\n- Support 500M registered users, 100M DAU\n\n**Capacity Estimation:**\n- 100M DAU, each syncing ~200 files/day on average (most automated small delta syncs)\n- Write QPS: 100M * 200 / 86400 = ~230K file sync operations/sec\n- Average file size: 500KB (many small docs, some large media)\n- New storage per day: 100M users * 2 files changed * 500KB = 100TB/day\n- Total storage (5 years): ~180PB raw, with 3x replication = 540PB\n- Metadata per file: ~1KB (path, chunks, versions) * 100B files = 100TB metadata\n- Bandwidth: peak upload 230K * 500KB = 115GB/s; with delta sync reducing to ~10% = 11.5GB/s\n- Chunk deduplication saves 30-50% storage across users sharing common files`,
    examples: `**Capacity Estimation Walkthrough:**\n\nStep 1 — Storage Growth:\n- 100M DAU, avg 2 new/modified files per day\n- Average chunk size after dedup: 4MB per file, 6 chunks per large file\n- Daily new chunks: 100M * 2 * 6 = 1.2B chunks = 4.8PB raw\n- With dedup ratio 3:1 = 1.6PB actual new storage/day\n- 5-year projection: 1.6PB * 365 * 5 = ~2.9EB before replication\n\nStep 2 — API Design:\n\`\`\`\nPOST /api/v1/files/upload/init\n  Body: { fileName, fileSize, parentFolderId, contentHash }\n  Response: { uploadId, presignedChunkUrls[], existingChunks[] }\n\nPUT /api/v1/files/upload/chunk\n  Body: binary chunk data\n  Headers: X-Upload-Id, X-Chunk-Index, X-Chunk-Hash\n  Response: { chunkId, status }\n\nPOST /api/v1/files/upload/complete\n  Body: { uploadId, chunkHashes[] }\n  Response: { fileId, version, syncToken }\n\nGET /api/v1/files/{fileId}/download\n  Query: ?version=N\n  Response: 302 redirect to CDN with signed URL\n\nGET /api/v1/sync/changes\n  Query: ?cursor=<lastSyncToken>&deviceId=<id>\n  Response: { changes[], newCursor, hasMore }\n\nPOST /api/v1/files/{fileId}/share\n  Body: { email, permission: "view"|"edit", expiry }\n  Response: { shareLink, shareId }\n\`\`\`\n\nStep 3 — Database Schema:\n- files: (file_id, user_id, path, current_version, is_deleted, created_at, updated_at)\n- file_versions: (version_id, file_id, version_num, chunk_list_json, size, checksum, created_by_device)\n- chunks: (chunk_hash, size, storage_url, ref_count, created_at)\n- sync_events: (event_id, user_id, file_id, event_type, version, timestamp, device_id)`,
    intuition: `The fundamental insight behind a file storage system is that files are NOT atomic blobs — they are ordered sequences of chunks, and this chunking is what enables every major feature: resumable uploads, delta sync, deduplication, and bandwidth optimization.\n\nThink of it like a book: instead of shipping the entire book every time you fix a typo, you only ship the changed page. Content-defined chunking (using Rabin fingerprinting) is even smarter — it finds natural "cut points" in the data based on content, so inserting bytes at the beginning of a file does NOT shift all chunk boundaries (unlike fixed-size chunking).\n\nThe rolling hash slides a window over the file. When the hash modulo a target value equals zero, you cut a chunk. Because the hash only depends on the local content in the window, insertions far away do not affect other chunk boundaries. This means editing the middle of a 1GB file might only invalidate 1-2 chunks out of 250.\n\n**Why version vectors for conflicts?** When device A and device B both edit the same file offline, simple version numbers cannot tell you "both sides changed" — they just see the same version. A version vector (a map of device-to-counter) lets each device track its own counter independently. If neither vector dominates the other (neither is a subset), you have a conflict. This is the same technique used in Amazon Dynamo and CRDTs.\n\n**Why long polling / WebSocket for notifications?** Polling wastes bandwidth and adds latency. Long polling holds the connection open until there is a change, giving near-real-time push with HTTP compatibility. WebSockets are better for devices with persistent connections (desktop client), while long polling works better for mobile devices that sleep.`,
    approach: `**Architecture Overview:**\n\nThe system has five major components that work together:\n\n**1. Sync Agent (Client-Side Daemon)**\n- Watches the local filesystem for changes using OS-level file watchers (inotify on Linux, FSEvents on macOS)\n- Computes content-defined chunks using Rabin fingerprinting\n- Maintains a local SQLite database of file metadata, chunk hashes, and sync state\n- Communicates with the metadata service to determine which chunks are new\n- Uploads only new/changed chunks to block storage\n- Receives notifications of remote changes and downloads missing chunks\n\n**2. Chunking Service**\n- Content-defined chunking using Rabin fingerprinting with a sliding window\n- Target chunk size: 4MB (min 1MB, max 8MB) — larger chunks reduce metadata overhead, smaller chunks improve dedup and delta efficiency\n- The rolling hash uses a polynomial over a 48-byte sliding window\n- A chunk boundary is declared when (hash % targetSize) == 0\n- Each chunk is identified by its SHA-256 hash for deduplication\n\n**3. Metadata Service**\n- Stores the file tree, version history, chunk manifests, and sharing permissions\n- Backed by a relational database (MySQL/PostgreSQL) sharded by user_id\n- Each file version is a list of chunk hashes in order\n- Provides the sync API: given a cursor, return all changes since that point\n- Uses optimistic concurrency control with version vectors for conflict detection\n\n**4. Block Storage (S3)**\n- Stores raw chunk data, keyed by chunk hash (SHA-256)\n- Reference counting tracks how many file versions reference each chunk\n- Chunks are immutable and content-addressed — perfect for deduplication\n- Cross-user dedup: if two users upload the same file, only one copy of each chunk is stored\n- 3x replication across availability zones for durability\n\n**5. Notification Service**\n- Maintains long-polling connections from all online clients\n- When a file change is committed to metadata, publishes an event\n- Clients receive the event and pull the latest changes via the sync API\n- For desktop clients, upgrades to WebSocket for lower latency\n- Falls back to periodic polling for unreliable connections\n\n**Data Flow — File Upload (Write Path):**\n1. Client detects file change via filesystem watcher\n2. Sync agent chunks the file using Rabin fingerprinting\n3. Agent computes SHA-256 hash for each chunk\n4. Agent sends chunk hash list to metadata service, which returns "needed" hashes (chunks not already stored)\n5. Agent uploads only the needed chunks to S3 via presigned URLs\n6. Agent commits the new file version (ordered chunk list) to metadata service\n7. Metadata service writes a sync event and notifies other devices via notification service\n\n**Data Flow — File Download (Read Path):**\n1. Client receives notification of remote change\n2. Client queries sync API for changes since last cursor\n3. For each changed file, client gets the chunk list for the new version\n4. Client checks local chunk cache — only downloads missing chunks\n5. Client reassembles the file from chunks and writes to local filesystem\n6. Client updates local sync cursor\n\n**Conflict Resolution:**\n- Each device maintains a version vector: { deviceA: 5, deviceB: 3 }\n- On sync, compare the local and remote version vectors\n- If local vector dominates remote: local is newer, push changes\n- If remote vector dominates local: remote is newer, pull changes\n- If neither dominates: CONFLICT — save both versions as "file.txt" and "file (conflict copy from DeviceB).txt"\n- User manually resolves by keeping one version`,
    code: `// Content-Defined Chunking with Rolling Hash (Rabin Fingerprint)
// and File Sync Protocol with Delta Detection

class RabinChunker {
  constructor(targetSize = 4 * 1024 * 1024, minSize = 1024 * 1024, maxSize = 8 * 1024 * 1024) {
    this.targetSize = targetSize;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.windowSize = 48;
    this.prime = 31;
    this.modulus = (1 << 24) - 1; // mask for fast modulo
    this.breakpointMask = targetSize - 1; // works when targetSize is power of 2
    // Precompute prime^windowSize for sliding window removal
    this.primePower = 1;
    for (let i = 0; i < this.windowSize; i++) {
      this.primePower = (this.primePower * this.prime) & this.modulus;
    }
  }

  chunkBuffer(buffer) {
    const chunks = [];
    let start = 0;
    let hash = 0;
    const window = new Array(this.windowSize).fill(0);
    let windowIdx = 0;

    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      const outgoing = window[windowIdx];
      window[windowIdx] = byte;
      windowIdx = (windowIdx + 1) % this.windowSize;

      // Rolling hash: remove outgoing byte, add incoming byte
      hash = ((hash * this.prime) + byte - outgoing * this.primePower) & this.modulus;
      if (hash < 0) hash += this.modulus + 1;

      const chunkLen = i - start + 1;
      const isBoundary = chunkLen >= this.minSize && (hash & this.breakpointMask) === 0;
      const isMax = chunkLen >= this.maxSize;
      const isEnd = i === buffer.length - 1;

      if (isBoundary || isMax || isEnd) {
        const chunkData = buffer.slice(start, i + 1);
        const chunkHash = this.sha256Hex(chunkData);
        chunks.push({ offset: start, length: chunkData.length, hash: chunkHash, data: chunkData });
        start = i + 1;
        hash = 0;
        window.fill(0);
        windowIdx = 0;
      }
    }
    return chunks;
  }

  sha256Hex(data) {
    // Simplified hash for demonstration — in production use crypto.createHash('sha256')
    let h = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      h ^= data[i];
      h = (h * 0x01000193) & 0xffffffff;
    }
    return h.toString(16).padStart(8, '0');
  }
}

// Version Vector for conflict detection
class VersionVector {
  constructor(entries = {}) {
    this.entries = { ...entries }; // { deviceId: counter }
  }

  increment(deviceId) {
    this.entries[deviceId] = (this.entries[deviceId] || 0) + 1;
    return this;
  }

  merge(other) {
    const merged = new VersionVector(this.entries);
    for (const [device, counter] of Object.entries(other.entries)) {
      merged.entries[device] = Math.max(merged.entries[device] || 0, counter);
    }
    return merged;
  }

  dominates(other) {
    for (const [device, counter] of Object.entries(other.entries)) {
      if ((this.entries[device] || 0) < counter) return false;
    }
    return Object.keys(this.entries).length > 0;
  }

  compare(other) {
    const thisDominates = this.dominates(other);
    const otherDominates = other.dominates(this);
    if (thisDominates && !otherDominates) return 'AHEAD';
    if (otherDominates && !thisDominates) return 'BEHIND';
    if (thisDominates && otherDominates) return 'EQUAL';
    return 'CONFLICT';
  }
}

// File Sync Protocol with Delta Detection
class FileSyncAgent {
  constructor(deviceId) {
    this.deviceId = deviceId;
    this.chunker = new RabinChunker();
    this.localFiles = new Map(); // path -> { version, chunkHashes[], versionVector }
    this.chunkStore = new Map(); // hash -> data (local cache)
  }

  indexFile(path, buffer) {
    const chunks = this.chunker.chunkBuffer(buffer);
    const chunkHashes = chunks.map(c => c.hash);
    chunks.forEach(c => this.chunkStore.set(c.hash, c.data));

    const existing = this.localFiles.get(path);
    const vv = existing ? existing.versionVector.increment(this.deviceId)
                        : new VersionVector().increment(this.deviceId);

    this.localFiles.set(path, {
      version: (existing?.version || 0) + 1,
      chunkHashes,
      versionVector: vv,
    });
    return { path, chunkHashes, versionVector: vv };
  }

  computeDelta(path, remoteChunkHashes) {
    const localEntry = this.localFiles.get(path);
    if (!localEntry) return { needChunks: remoteChunkHashes, removeChunks: [] };

    const localSet = new Set(localEntry.chunkHashes);
    const remoteSet = new Set(remoteChunkHashes);
    const needChunks = remoteChunkHashes.filter(h => !localSet.has(h));
    const removeChunks = localEntry.chunkHashes.filter(h => !remoteSet.has(h));
    return { needChunks, removeChunks };
  }

  sync(path, remoteEntry) {
    const localEntry = this.localFiles.get(path);
    if (!localEntry) {
      return { action: 'PULL', delta: this.computeDelta(path, remoteEntry.chunkHashes) };
    }

    const comparison = localEntry.versionVector.compare(remoteEntry.versionVector);
    switch (comparison) {
      case 'AHEAD':
        return { action: 'PUSH', delta: this.computeDelta(path, localEntry.chunkHashes) };
      case 'BEHIND':
        return { action: 'PULL', delta: this.computeDelta(path, remoteEntry.chunkHashes) };
      case 'EQUAL':
        return { action: 'NONE', delta: { needChunks: [], removeChunks: [] } };
      case 'CONFLICT':
        return {
          action: 'CONFLICT',
          localVersion: localEntry,
          remoteVersion: remoteEntry,
          resolution: \`Save both: "\${path}" and "\${path} (conflict from \${this.deviceId})"\`,
        };
    }
  }
}

// --- Demo ---
const agent = new FileSyncAgent('laptop-001');
const fileData = Buffer.from('A'.repeat(2 * 1024 * 1024) + 'B'.repeat(1024 * 1024));
const indexed = agent.indexFile('/docs/report.pdf', fileData);
console.log(\`Indexed \${indexed.chunkHashes.length} chunks\`);

const agent2 = new FileSyncAgent('phone-002');
const remoteEntry = { chunkHashes: indexed.chunkHashes.slice(0, -1).concat(['newchunk123']),
  versionVector: new VersionVector({ 'phone-002': 1 }) };
const result = agent.sync('/docs/report.pdf', remoteEntry);
console.log('Sync result:', result.action, '| Chunks to fetch:', result.delta?.needChunks?.length);`,
    jsCode: `// Block Storage Server with Deduplication and Resumable Upload Manager

class BlockStorageServer {
  constructor() {
    this.chunks = new Map();      // chunkHash -> { data, refCount, createdAt }
    this.uploads = new Map();     // uploadId -> { fileName, expectedChunks, receivedChunks, expiresAt }
    this.fileManifests = new Map(); // fileId -> [{ version, chunkHashes[], createdAt }]
  }

  initUpload(fileName, expectedChunkHashes) {
    const uploadId = 'upload_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const alreadyStored = expectedChunkHashes.filter(h => this.chunks.has(h));
    const needed = expectedChunkHashes.filter(h => !this.chunks.has(h));

    this.uploads.set(uploadId, {
      fileName,
      expectedChunks: new Set(expectedChunkHashes),
      receivedChunks: new Set(alreadyStored),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h expiry
    });

    // Increment ref count for already-stored chunks (dedup)
    alreadyStored.forEach(h => { this.chunks.get(h).refCount++; });
    return { uploadId, neededChunks: needed, skippedChunks: alreadyStored.length };
  }

  uploadChunk(uploadId, chunkHash, data) {
    const upload = this.uploads.get(uploadId);
    if (!upload) throw new Error('Upload not found or expired');
    if (!upload.expectedChunks.has(chunkHash)) throw new Error('Unexpected chunk');
    if (upload.receivedChunks.has(chunkHash)) return { status: 'duplicate', progress: this.getProgress(upload) };

    if (!this.chunks.has(chunkHash)) {
      this.chunks.set(chunkHash, { data, refCount: 1, createdAt: Date.now() });
    } else {
      this.chunks.get(chunkHash).refCount++;
    }
    upload.receivedChunks.add(chunkHash);
    return { status: 'ok', progress: this.getProgress(upload) };
  }

  getProgress(upload) {
    return { received: upload.receivedChunks.size, total: upload.expectedChunks.size,
      percent: Math.round((upload.receivedChunks.size / upload.expectedChunks.size) * 100) };
  }

  completeUpload(uploadId, fileId) {
    const upload = this.uploads.get(uploadId);
    if (!upload) throw new Error('Upload not found');
    if (upload.receivedChunks.size !== upload.expectedChunks.size) {
      const missing = [...upload.expectedChunks].filter(h => !upload.receivedChunks.has(h));
      throw new Error(\`Missing \${missing.length} chunks: \${missing.slice(0, 3).join(', ')}...\`);
    }

    const chunkHashes = [...upload.expectedChunks];
    const versions = this.fileManifests.get(fileId) || [];
    const newVersion = { version: versions.length + 1, chunkHashes, createdAt: Date.now() };
    versions.push(newVersion);
    this.fileManifests.set(fileId, versions);
    this.uploads.delete(uploadId);
    return { fileId, version: newVersion.version, chunks: chunkHashes.length };
  }

  downloadFile(fileId, version = null) {
    const versions = this.fileManifests.get(fileId);
    if (!versions || versions.length === 0) throw new Error('File not found');
    const target = version ? versions.find(v => v.version === version) : versions[versions.length - 1];
    if (!target) throw new Error('Version not found');

    const assembledData = [];
    for (const hash of target.chunkHashes) {
      const chunk = this.chunks.get(hash);
      if (!chunk) throw new Error(\`Chunk \${hash} missing — data corruption\`);
      assembledData.push(chunk.data);
    }
    return { version: target.version, totalChunks: target.chunkHashes.length,
      totalSize: assembledData.reduce((sum, d) => sum + d.length, 0), data: Buffer.concat(assembledData) };
  }

  deleteVersion(fileId, version) {
    const versions = this.fileManifests.get(fileId);
    if (!versions) return;
    const idx = versions.findIndex(v => v.version === version);
    if (idx === -1) return;

    const removed = versions.splice(idx, 1)[0];
    const activeHashes = new Set(versions.flatMap(v => v.chunkHashes));
    let freedChunks = 0;
    for (const hash of removed.chunkHashes) {
      if (!activeHashes.has(hash)) {
        const chunk = this.chunks.get(hash);
        if (chunk) {
          chunk.refCount--;
          if (chunk.refCount <= 0) { this.chunks.delete(hash); freedChunks++; }
        }
      }
    }
    return { deletedVersion: version, freedChunks };
  }

  getStats() {
    let totalSize = 0;
    this.chunks.forEach(c => { totalSize += c.data.length; });
    return { totalChunks: this.chunks.size, totalSizeBytes: totalSize,
      totalFiles: this.fileManifests.size, activeUploads: this.uploads.size };
  }
}

// --- Demo ---
const server = new BlockStorageServer();
const chunkHashes = ['aaa111', 'bbb222', 'ccc333'];
const init = server.initUpload('report.pdf', chunkHashes);
console.log('Init upload:', init);

server.uploadChunk(init.uploadId, 'aaa111', Buffer.from('chunk1data'));
server.uploadChunk(init.uploadId, 'bbb222', Buffer.from('chunk2data'));
const r3 = server.uploadChunk(init.uploadId, 'ccc333', Buffer.from('chunk3data'));
console.log('Upload progress:', r3.progress);

const complete = server.completeUpload(init.uploadId, 'file-001');
console.log('Completed:', complete);

// Second upload shares chunks (dedup)
const init2 = server.initUpload('report-copy.pdf', ['aaa111', 'bbb222', 'ddd444']);
console.log('Dedup skipped:', init2.skippedChunks, 'chunks');
console.log('Stats:', server.getStats());`,
    explanation: `**Scaling Analysis:**\n\n1. **Metadata Service Scaling:**\n   - Shard by user_id (hash-based) across 100+ MySQL instances\n   - Each shard holds ~1M users' file trees\n   - Read replicas for sync queries (read-heavy: 10:1 read-to-write)\n   - Connection pooling with PgBouncer/ProxySQL to handle 230K QPS\n\n2. **Block Storage Scaling:**\n   - S3 handles unlimited scale natively\n   - Use S3 Transfer Acceleration for cross-region uploads\n   - Content-addressed chunks enable trivial horizontal scaling — any storage node can serve any chunk\n   - Cross-user dedup reduces storage by 30-50% (many users share common libraries, templates, etc.)\n\n3. **Notification Service Scaling:**\n   - Each server holds ~100K long-polling connections\n   - 100M DAU / 100K per server = 1,000 notification servers\n   - Use consistent hashing to route users to specific notification servers\n   - Pub/sub backbone (Redis Pub/Sub or Kafka) to distribute events to the right server\n\n**Failure Modes and Mitigations:**\n- **Chunk storage corruption:** SHA-256 verification on every read; background scrubbing compares stored vs computed hashes\n- **Metadata service failure:** Multi-AZ replicas with automatic failover; sync agents retry with exponential backoff\n- **Split-brain on sync:** Version vectors detect conflicts deterministically — no data is silently lost\n- **Client crash mid-upload:** Resumable uploads tracked server-side; client resumes by querying which chunks were received\n- **Notification service failure:** Clients fall back to periodic polling (every 30 seconds) if long-poll connection drops\n\n**Bottleneck Identification:**\n- Primary bottleneck: metadata database writes during peak sync hours\n- Mitigation: batch sync events, use write-ahead log with async commit, shard aggressively\n- Secondary bottleneck: chunk upload bandwidth during initial backup of large file collections\n- Mitigation: client-side bandwidth throttling, progressive upload with priority queue (recent files first)\n\n**Monitoring Strategy:**\n- Track: sync latency p50/p99, chunk upload success rate, dedup ratio, conflict rate, notification delivery latency\n- Alert on: sync latency p99 > 10s, chunk integrity check failures, metadata replication lag > 5s\n\n**Key Trade-offs:**\n- **Fixed vs. content-defined chunking:** Fixed is simpler and faster to compute, but a single insertion at the beginning of a file invalidates all chunks. Content-defined adds CPU cost (~20% more) but reduces bandwidth by 60-80% for typical edits\n- **Strong vs. eventual consistency for metadata:** Strong ensures no sync conflicts are missed but adds latency. We use strong consistency with leader-based writes and read-your-own-writes guarantee\n- **Inline vs. reference dedup:** Inline dedup checks hashes before upload (saves bandwidth) but adds latency to every write. We do inline dedup because bandwidth savings outweigh the hash-check cost\n- **Version retention:** Keeping all versions forever provides maximum safety but costs storage. Default to 30 days with configurable retention per plan tier`,
    timeComplexity: `**Capacity and Performance Targets:**\n- Chunk computation: O(n) where n is file size — single pass with rolling hash\n- Delta detection: O(c) where c is number of chunks — set comparison\n- Sync API response: < 200ms for typical delta query\n- File upload throughput: limited by network; chunk parallelism (4 concurrent uploads) maximizes bandwidth utilization\n- Metadata writes: 230K QPS across shards, < 10ms per write\n- Notification delivery: < 500ms from metadata commit to client notification\n- Conflict detection: O(d) where d is number of devices — version vector comparison`,
    spaceComplexity: `**Storage and Memory Requirements:**\n- Chunk storage: ~180PB over 5 years (before dedup), ~90PB after cross-user dedup, ~270PB with 3x replication\n- Metadata storage: ~1KB per file version * 100B file versions = 100TB, sharded across 100+ MySQL instances\n- Client-side chunk cache: 1-10GB configurable per device for recently accessed chunks\n- Notification server memory: ~10KB per long-poll connection * 100K connections = 1GB per server\n- Sync event log: 230K events/sec * 200 bytes * 86400 sec = ~4TB/day, retained for 7 days = 28TB\n- Upload state tracking: ~500 bytes per active upload * 1M concurrent uploads = 500MB in Redis`,
    hints: [
      `Content-defined chunking with Rabin fingerprinting is critical for delta sync efficiency. The rolling hash examines a sliding window over the file and declares a chunk boundary when the hash meets a condition (e.g., hash mod 2^22 == 0 for ~4MB average chunks). Because boundaries depend only on local content, inserting bytes at one location does not cascade boundary changes across the entire file. This is the single most important optimization in the system — without it, a 1-byte edit to a 1GB file would require re-uploading the entire file.`,
      `Implement resumable uploads by tracking received chunks server-side keyed by upload ID. When a client reconnects after a failure, it queries the server for which chunks were already received and only uploads the remaining ones. Set a 24-hour expiration on incomplete uploads to reclaim resources. The upload ID should be deterministic (e.g., hash of file path + modification time) so the client can resume even after a crash without storing state locally.`,
      `Use version vectors (not simple version numbers) for conflict detection across devices. A version vector maps each device ID to a counter. When device A edits, it increments its own counter. Conflict exists when neither vector dominates the other (e.g., {A:2, B:1} vs {A:1, B:2}). This is strictly more powerful than a single version number, which cannot distinguish "A updated after B" from "A and B updated independently."`,
      `The notification service is the backbone of real-time sync. Implement it with long polling as the baseline (compatible with all HTTP clients) and upgrade to WebSocket for desktop sync agents. Key design point: the notification only carries "something changed for user X" — the client then queries the sync API for details. This separation means the notification channel can be lightweight and lossy without risking data inconsistency.`,
      `Deduplication happens at two levels: (1) within a user's files (file versioning — unchanged chunks are shared across versions), and (2) across users (if 1000 users upload the same PDF, only one copy of each chunk is stored). Implement reference counting on chunks and only garbage-collect when refcount reaches zero. Be careful with race conditions — use atomic decrement-and-delete to prevent deleting a chunk that is being referenced by a concurrent upload.`,
      `For the interview, always discuss the sync protocol in terms of the "sync cursor" pattern: each client maintains a cursor (opaque token representing a position in the server's event log). On sync, the client sends its cursor and receives all changes since that point. This is the same pattern used by Dropbox, Google Drive, and OneDrive. It handles offline periods gracefully — the client just sends its last cursor, no matter how long it has been offline.`,
      `Common interview pitfall: forgetting about large file handling. A 10GB video file cannot be chunked in memory. The chunking algorithm must operate in streaming mode, processing the file in a single sequential pass with constant memory usage (just the sliding window buffer). Similarly, the upload must be chunked and parallelized — uploading a 10GB file as a single HTTP request is fragile and slow.`,
      `Another pitfall: not addressing the "thundering herd" problem when a user with many devices edits a file rapidly. If 5 devices all receive a notification and simultaneously try to sync, they create redundant load. Solution: add jitter to sync timing, use device priority (the device that made the change does not need to download it), and implement request deduplication at the metadata service layer.`,
    ],
  },
  {
    id: 9007,
    description: `Design a Video Streaming Platform (YouTube)\n\n**Functional Requirements:**\n- Upload videos of any length (up to 12 hours) and any format\n- Transcode uploaded videos into multiple resolutions (240p, 360p, 480p, 720p, 1080p, 4K) and formats (H.264, VP9, AV1)\n- Stream video with adaptive bitrate (HLS/DASH) that adjusts quality based on network conditions\n- Search videos by title, description, tags, and content\n- Recommend videos based on watch history, engagement, and content similarity\n- Support comments, likes, subscriptions, and watch history\n\n**Non-Functional Requirements:**\n- Startup latency: video should begin playing within 2 seconds\n- Rebuffering ratio: < 1% of playback time\n- Availability: 99.99% for video playback\n- Upload-to-playable latency: < 10 minutes for first resolution (720p), full transcoding within 1 hour\n- Support 1B daily active users, 500M videos\n\n**Capacity Estimation:**\n- 1B DAU, average 5 videos watched per day = 5B video views/day\n- Video view QPS: 5B / 86400 = ~58K views/sec, peak 3x = 174K/sec\n- Uploads: 500K new videos/day = ~6 uploads/sec\n- Average video length: 7 minutes, average file size 500MB\n- Daily upload storage: 500K * 500MB = 250TB raw\n- After transcoding to 6 resolutions: 250TB * 3 (avg multiplier) = 750TB/day\n- CDN bandwidth: 5B views * 7 min * 5Mbps avg bitrate = ~2.6PB/day = ~240Gbps sustained\n- Metadata per video: ~5KB * 500M videos = 2.5TB total`,
    examples: `**Capacity Estimation Walkthrough:**\n\nStep 1 — Transcoding Compute:\n- 500K videos/day, 7 min average, 6 resolutions = 3M transcoding jobs/day\n- Each job: ~2x real-time on modern GPU = 3.5 min per resolution\n- Total compute: 3M * 3.5 min = 10.5M GPU-minutes/day = 7,291 GPU-hours/day\n- At 80% utilization: ~380 GPUs needed continuously\n\nStep 2 — API Design:\n\`\`\`\nPOST /api/v1/videos/upload\n  Body: multipart { title, description, tags[], file }\n  Response: { videoId, uploadUrl (presigned), status: "processing" }\n\nGET /api/v1/videos/{videoId}/manifest.m3u8\n  Query: ?deviceType=mobile&maxResolution=1080p\n  Response: HLS master playlist with available quality levels\n\nGET /api/v1/videos/{videoId}/segments/{resolution}/{segmentNum}.ts\n  Response: Binary video segment (2-10 second chunk)\n\nGET /api/v1/videos/{videoId}\n  Response: { title, description, views, likes, channel, recommendations[] }\n\nGET /api/v1/search?q=keyword&page=1&sort=relevance\n  Response: { results: [{ videoId, title, thumbnail, duration, views }], totalCount }\n\nGET /api/v1/recommendations?userId=X&count=20\n  Response: { videos: [{ videoId, title, thumbnail, score, reason }] }\n\`\`\`\n\nStep 3 — HLS Manifest Example:\n\`\`\`\n#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n/api/v1/videos/abc123/playlist_360p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1280x720\n/api/v1/videos/abc123/playlist_720p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n/api/v1/videos/abc123/playlist_1080p.m3u8\n\`\`\``,
    intuition: `A video streaming platform is fundamentally a content transformation and distribution pipeline. The raw upload is just the beginning — the real work is converting it into dozens of renditions optimized for different devices and network conditions, then serving those renditions from locations as close to viewers as possible.\n\nThe key insight behind adaptive bitrate streaming (ABR) is that the video is split into small segments (2-10 seconds each), and the client can independently choose the quality level for EACH segment. This means quality can adapt every few seconds as network conditions change, without interrupting playback. The client maintains a buffer and uses a feedback loop: if the buffer is filling up (download speed > playback speed), switch to higher quality; if the buffer is draining, switch down immediately.\n\nThink of the transcoding pipeline as a factory assembly line organized as a DAG (Directed Acyclic Graph). The raw video enters, gets split into segments, each segment branches out to multiple resolution encoding paths that run in parallel, and the results converge to generate the final manifest files. This DAG structure means you can parallelize aggressively and retry individual failed tasks without redoing the entire pipeline.\n\nThe CDN is not just a cache — it is a fundamental part of the architecture. Without it, a viral video with 10M concurrent viewers at 5Mbps each would require 50Tbps from origin servers. The CDN absorbs 95%+ of this traffic by caching video segments at edge locations. The popularity-based preloading strategy ensures that trending videos are cached before the demand spike hits.`,
    approach: `**Architecture Overview:**\n\n**1. Upload Service**\n- Accepts video uploads via presigned URLs to S3 (bypasses application servers for large files)\n- Validates format, size, and content (basic safety check)\n- Generates a unique video ID and creates a metadata record in status "processing"\n- Publishes an "upload complete" event to the transcoding queue\n- Supports resumable uploads using the TUS protocol for large files\n\n**2. Transcoding Pipeline (DAG-based)**\n- Task DAG: Video Split -> [Transcode 240p, 360p, 480p, 720p, 1080p, 4K] -> Generate Thumbnails -> Create Manifests -> Mark Ready\n- A DAG scheduler dispatches tasks to a pool of GPU-enabled workers\n- Each resolution is transcoded independently and in parallel\n- Segments within a resolution can also be parallelized (split video into 10s chunks, transcode each, concatenate)\n- Priority: 720p is transcoded first to minimize time-to-first-playable\n- Worker failures are handled by retrying individual DAG tasks, not the entire pipeline\n- Output: HLS segments (.ts files) + master playlist (.m3u8) stored in S3\n\n**3. CDN (Content Delivery Network)**\n- Multi-tier: Edge PoPs (200+ locations) -> Regional shields -> Origin (S3)\n- Edge caches popular video segments; cache hit rate target: 95%+\n- Origin shielding: a mid-tier cache prevents thundering herd on cache miss\n- Popularity-based preloading: trending videos are proactively pushed to edge PoPs before demand spikes\n- Request coalescing: if 1000 concurrent requests hit an uncached segment, only 1 request goes to origin\n\n**4. Streaming Service**\n- Serves the master playlist (manifest file) which lists available quality levels\n- The client (player) downloads the manifest, selects a quality level, and begins downloading segments\n- ABR algorithm on the client adapts quality per-segment based on throughput and buffer level\n- Preloads the next 2-3 segments while the current one plays to hide network jitter\n\n**5. Recommendation Engine**\n- Two-stage: candidate generation (retrieve 1000 candidates) -> ranking (score and sort top 20)\n- Candidate sources: collaborative filtering (users who watched X also watched Y), content similarity (embeddings), subscriptions, trending\n- Ranking model: deep neural network trained on engagement signals (click-through rate, watch time, likes)\n- Served from a feature store with precomputed user and video embeddings\n\n**Data Flow — Video Upload:**\n1. Client requests presigned URL -> uploads directly to S3\n2. S3 event triggers upload service -> creates metadata record\n3. Transcoding DAG is scheduled -> workers transcode in parallel\n4. First resolution (720p) completes -> video status set to "playable"\n5. Remaining resolutions complete -> full manifest updated\n6. CDN pre-warms if video is from a popular channel\n\n**Data Flow — Video Playback:**\n1. Client requests video page -> metadata service returns video info\n2. Client requests master manifest -> streaming service returns .m3u8 with quality options\n3. Client ABR algorithm selects initial quality based on estimated bandwidth\n4. Client downloads segments from CDN edge PoP\n5. ABR algorithm continuously adjusts quality based on download speed and buffer level\n6. View event published to analytics pipeline for recommendation model training`,
    code: `// Adaptive Bitrate Selection Algorithm and Transcoding DAG Pipeline

// ABR Algorithm — Buffer-Based with Throughput Estimation (similar to BOLA/MPC)
class AdaptiveBitrateSelector {
  constructor(qualityLevels) {
    // qualityLevels: [{ name, bitrate, resolution }] sorted by bitrate ascending
    this.levels = qualityLevels.sort((a, b) => a.bitrate - b.bitrate);
    this.throughputHistory = []; // recent download speeds in bps
    this.maxHistorySize = 10;
    this.bufferTarget = 30;     // seconds of buffer we aim to maintain
    this.bufferMin = 5;         // panic threshold — drop quality immediately
    this.currentLevelIdx = 0;   // start at lowest quality for fast startup
    this.segmentDuration = 4;   // seconds per segment
  }

  recordThroughput(segmentBytes, downloadTimeMs) {
    const bps = (segmentBytes * 8 * 1000) / downloadTimeMs;
    this.throughputHistory.push(bps);
    if (this.throughputHistory.length > this.maxHistorySize) this.throughputHistory.shift();
  }

  getHarmonicMeanThroughput() {
    if (this.throughputHistory.length === 0) return this.levels[0].bitrate;
    const reciprocalSum = this.throughputHistory.reduce((s, t) => s + (1 / t), 0);
    return this.throughputHistory.length / reciprocalSum;
  }

  selectQuality(bufferLevelSec) {
    const throughput = this.getHarmonicMeanThroughput();
    const safetyFactor = 0.85; // leave 15% headroom
    const effectiveBandwidth = throughput * safetyFactor;

    // Emergency: buffer critically low — drop to lowest immediately
    if (bufferLevelSec < this.bufferMin) {
      this.currentLevelIdx = 0;
      return this.levels[0];
    }

    // Find the highest quality that fits within available bandwidth
    let maxFeasibleIdx = 0;
    for (let i = 0; i < this.levels.length; i++) {
      if (this.levels[i].bitrate <= effectiveBandwidth) maxFeasibleIdx = i;
    }

    // Buffer-based adjustment: if buffer is healthy, allow stepping up
    const bufferRatio = Math.min(bufferLevelSec / this.bufferTarget, 1.0);
    const bufferAdjustedIdx = Math.round(maxFeasibleIdx * bufferRatio);

    // Smooth transitions: only step up by 1 level at a time, but can drop multiple
    if (bufferAdjustedIdx > this.currentLevelIdx) {
      this.currentLevelIdx = Math.min(this.currentLevelIdx + 1, maxFeasibleIdx);
    } else if (bufferAdjustedIdx < this.currentLevelIdx) {
      this.currentLevelIdx = bufferAdjustedIdx; // drop fast
    }

    return this.levels[this.currentLevelIdx];
  }
}

// Transcoding DAG Pipeline Executor
class TranscodingDAG {
  constructor() {
    this.tasks = new Map();   // taskId -> { deps[], status, result, handler }
    this.completed = new Set();
  }

  addTask(taskId, dependencies, handler) {
    this.tasks.set(taskId, { deps: dependencies, status: 'pending', result: null, handler });
  }

  isReady(taskId) {
    const task = this.tasks.get(taskId);
    return task.status === 'pending' && task.deps.every(d => this.completed.has(d));
  }

  async executeTask(taskId) {
    const task = this.tasks.get(taskId);
    task.status = 'running';
    try {
      task.result = await task.handler(this.getDependencyResults(taskId));
      task.status = 'completed';
      this.completed.add(taskId);
      return { taskId, status: 'completed', result: task.result };
    } catch (err) {
      task.status = 'failed';
      return { taskId, status: 'failed', error: err.message };
    }
  }

  getDependencyResults(taskId) {
    const task = this.tasks.get(taskId);
    const results = {};
    for (const dep of task.deps) {
      results[dep] = this.tasks.get(dep).result;
    }
    return results;
  }

  async runAll(maxConcurrency = 4) {
    const results = [];
    while (this.completed.size < this.tasks.size) {
      const ready = [...this.tasks.keys()].filter(id => this.isReady(id));
      if (ready.length === 0 && this.completed.size < this.tasks.size) {
        const stuck = [...this.tasks.entries()].filter(([, t]) => t.status === 'failed');
        if (stuck.length > 0) throw new Error(\`Pipeline stuck: \${stuck.map(([id]) => id).join(', ')} failed\`);
        await new Promise(r => setTimeout(r, 50));
        continue;
      }
      const batch = ready.slice(0, maxConcurrency);
      const batchResults = await Promise.all(batch.map(id => this.executeTask(id)));
      results.push(...batchResults);
    }
    return results;
  }
}

// Video Segment Cache with Popularity-Based Preloading
class VideoSegmentCache {
  constructor(maxSizeMB = 1000) {
    this.maxSize = maxSizeMB * 1024 * 1024;
    this.currentSize = 0;
    this.cache = new Map(); // key -> { data, size, accessCount, lastAccess, popularity }
    this.accessLog = [];    // for popularity tracking
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    entry.accessCount++;
    entry.lastAccess = Date.now();
    return entry.data;
  }

  put(key, data, popularity = 1.0) {
    const size = data.length;
    if (size > this.maxSize * 0.1) return false; // single item > 10% of cache
    while (this.currentSize + size > this.maxSize) {
      this.evictLeastValuable();
    }
    this.cache.set(key, { data, size, accessCount: 1, lastAccess: Date.now(), popularity });
    this.currentSize += size;
    return true;
  }

  evictLeastValuable() {
    let minScore = Infinity;
    let evictKey = null;
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      const ageHours = (now - entry.lastAccess) / 3600000;
      const score = (entry.accessCount * entry.popularity) / (1 + ageHours);
      if (score < minScore) { minScore = score; evictKey = key; }
    }
    if (evictKey) {
      this.currentSize -= this.cache.get(evictKey).size;
      this.cache.delete(evictKey);
    }
  }

  preloadTrending(trendingVideos, segmentFetcher) {
    const preloaded = [];
    for (const video of trendingVideos) {
      for (let seg = 0; seg < Math.min(video.segments, 5); seg++) {
        const key = \`\${video.id}/\${video.topResolution}/\${seg}\`;
        if (!this.cache.has(key)) {
          const data = segmentFetcher(key);
          if (data) { this.put(key, data, video.popularity); preloaded.push(key); }
        }
      }
    }
    return preloaded;
  }

  getStats() {
    return { entries: this.cache.size, usedMB: Math.round(this.currentSize / (1024 * 1024)),
      maxMB: Math.round(this.maxSize / (1024 * 1024)),
      hitRate: this.cache.size > 0 ? 'tracked per request' : 'empty cache' };
  }
}

// --- Demo ---
const abr = new AdaptiveBitrateSelector([
  { name: '240p', bitrate: 400000, resolution: '426x240' },
  { name: '360p', bitrate: 800000, resolution: '640x360' },
  { name: '720p', bitrate: 2400000, resolution: '1280x720' },
  { name: '1080p', bitrate: 5000000, resolution: '1920x1080' },
  { name: '4K', bitrate: 15000000, resolution: '3840x2160' },
]);

// Simulate segment downloads with varying throughput
const scenarios = [
  { bytes: 200000, timeMs: 400, buffer: 3 },   // slow start
  { bytes: 400000, timeMs: 300, buffer: 8 },   // improving
  { bytes: 800000, timeMs: 250, buffer: 15 },  // good connection
  { bytes: 1200000, timeMs: 200, buffer: 25 }, // excellent
  { bytes: 100000, timeMs: 800, buffer: 4 },   // sudden drop
];
for (const s of scenarios) {
  abr.recordThroughput(s.bytes, s.timeMs);
  const selected = abr.selectQuality(s.buffer);
  console.log(\`Buffer: \${s.buffer}s | Selected: \${selected.name} (\${(selected.bitrate/1e6).toFixed(1)}Mbps)\`);
}`,
    jsCode: `// Transcoding DAG Pipeline — Full Working Example with Simulated Video Processing

class VideoTranscodingPipeline {
  constructor(videoId, inputUrl) {
    this.videoId = videoId;
    this.inputUrl = inputUrl;
    this.dag = new Map(); // taskId -> { deps, handler, status, result, retries }
    this.completed = new Set();
    this.maxRetries = 2;
    this.listeners = [];
  }

  onProgress(fn) { this.listeners.push(fn); }
  emit(event) { this.listeners.forEach(fn => fn(event)); }

  buildPipeline() {
    // Stage 1: Validate and analyze input
    this.addTask('validate', [], async () => {
      const metadata = { duration: 420, width: 3840, height: 2160, codec: 'h264', fps: 30 };
      return metadata;
    });

    // Stage 2: Split into segments (parallel processing preparation)
    this.addTask('split', ['validate'], async (deps) => {
      const { duration } = deps.validate;
      const segmentDuration = 4; // seconds
      const segments = Math.ceil(duration / segmentDuration);
      return { segments, segmentDuration, segmentIds: Array.from({ length: segments }, (_, i) => i) };
    });

    // Stage 3: Transcode to each resolution (parallel)
    const resolutions = [
      { name: '240p', width: 426, height: 240, bitrate: '400k', priority: 5 },
      { name: '360p', width: 640, height: 360, bitrate: '800k', priority: 4 },
      { name: '480p', width: 854, height: 480, bitrate: '1500k', priority: 3 },
      { name: '720p', width: 1280, height: 720, bitrate: '2500k', priority: 1 },
      { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', priority: 2 },
      { name: '4K', width: 3840, height: 2160, bitrate: '15000k', priority: 6 },
    ];

    for (const res of resolutions) {
      this.addTask(\`transcode_\${res.name}\`, ['split'], async (deps) => {
        const { segments } = deps.split;
        // Simulate transcoding time proportional to resolution
        const timePerSegment = (res.width * res.height) / 1000000; // ms simulation
        await new Promise(r => setTimeout(r, timePerSegment));
        return {
          resolution: res.name, segments, bitrate: res.bitrate,
          outputPath: \`/transcoded/\${this.videoId}/\${res.name}/\`,
          sizeEstimateMB: segments * parseInt(res.bitrate) * 4 / 8000,
        };
      });
    }

    // Stage 4: Generate thumbnails (parallel with transcoding)
    this.addTask('thumbnails', ['validate'], async (deps) => {
      const { duration } = deps.validate;
      const count = Math.min(Math.floor(duration / 30), 20);
      const timestamps = Array.from({ length: count }, (_, i) => Math.floor((i + 0.5) * duration / count));
      return { thumbnailCount: count, timestamps, format: 'webp', sizes: ['120x90', '320x180', '480x360'] };
    });

    // Stage 5: Generate sprite sheet for seek preview
    this.addTask('sprites', ['thumbnails'], async (deps) => {
      const { thumbnailCount } = deps.thumbnails;
      return { spriteSheet: \`\${this.videoId}_sprites.webp\`, frames: thumbnailCount, gridSize: '5x4' };
    });

    // Stage 6: Generate HLS manifest (after all transcoding completes)
    const transcodeDeps = resolutions.map(r => \`transcode_\${r.name}\`);
    this.addTask('manifest', transcodeDeps, async (deps) => {
      const streams = resolutions.map(res => {
        const result = deps[\`transcode_\${res.name}\`];
        return \`#EXT-X-STREAM-INF:BANDWIDTH=\${parseInt(result.bitrate) * 1000},RESOLUTION=\${res.width}x\${res.height}\\n\` +
               \`/videos/\${this.videoId}/\${res.name}/playlist.m3u8\`;
      });
      const masterPlaylist = '#EXTM3U\\n' + streams.join('\\n');
      return { masterPlaylist, qualityLevels: resolutions.length };
    });

    // Stage 7: Final — mark video as ready
    this.addTask('finalize', ['manifest', 'sprites'], async (deps) => {
      return {
        videoId: this.videoId, status: 'ready',
        qualities: resolutions.map(r => r.name),
        manifestUrl: \`/videos/\${this.videoId}/master.m3u8\`,
        thumbnailUrl: \`/videos/\${this.videoId}/thumb_320x180.webp\`,
      };
    });
  }

  addTask(id, deps, handler) {
    this.dag.set(id, { deps, handler, status: 'pending', result: null, retries: 0 });
  }

  getReadyTasks() {
    const ready = [];
    for (const [id, task] of this.dag) {
      if (task.status === 'pending' && task.deps.every(d => this.completed.has(d))) {
        ready.push(id);
      }
    }
    return ready;
  }

  getDepsResults(taskId) {
    const task = this.dag.get(taskId);
    const results = {};
    for (const dep of task.deps) results[dep] = this.dag.get(dep).result;
    return results;
  }

  async runTask(taskId) {
    const task = this.dag.get(taskId);
    task.status = 'running';
    this.emit({ type: 'task_start', taskId, timestamp: Date.now() });
    try {
      task.result = await task.handler(this.getDepsResults(taskId));
      task.status = 'completed';
      this.completed.add(taskId);
      this.emit({ type: 'task_complete', taskId, result: task.result });
      return true;
    } catch (err) {
      task.retries++;
      if (task.retries <= this.maxRetries) {
        task.status = 'pending'; // retry
        this.emit({ type: 'task_retry', taskId, attempt: task.retries, error: err.message });
        return false;
      }
      task.status = 'failed';
      this.emit({ type: 'task_failed', taskId, error: err.message });
      throw err;
    }
  }

  async execute(concurrency = 6) {
    this.buildPipeline();
    const totalTasks = this.dag.size;

    while (this.completed.size < totalTasks) {
      const ready = this.getReadyTasks();
      if (ready.length === 0) {
        const failed = [...this.dag.entries()].filter(([, t]) => t.status === 'failed');
        if (failed.length > 0) throw new Error(\`Pipeline failed at: \${failed.map(([id]) => id).join(', ')}\`);
        await new Promise(r => setTimeout(r, 10));
        continue;
      }

      const batch = ready.slice(0, concurrency);
      await Promise.allSettled(batch.map(id => this.runTask(id)));

      this.emit({
        type: 'progress',
        completed: this.completed.size,
        total: totalTasks,
        percent: Math.round((this.completed.size / totalTasks) * 100),
      });
    }

    return this.dag.get('finalize').result;
  }
}

// --- Demo ---
async function main() {
  const pipeline = new VideoTranscodingPipeline('vid_abc123', 's3://uploads/raw/vid_abc123.mp4');
  pipeline.onProgress(event => {
    if (event.type === 'progress') {
      console.log(\`Pipeline progress: \${event.percent}% (\${event.completed}/\${event.total})\`);
    } else if (event.type === 'task_complete') {
      console.log(\`  Completed: \${event.taskId}\`);
    }
  });

  const result = await pipeline.execute(6);
  console.log('Pipeline finished:', JSON.stringify(result, null, 2));
}
main().catch(console.error);`,
    explanation: `**Scaling Analysis:**\n\n1. **Upload Service Scaling:**\n   - Direct-to-S3 uploads via presigned URLs bypass application servers entirely\n   - Upload service only handles metadata creation: lightweight, horizontally scalable\n   - Rate limit uploads per user to prevent abuse (e.g., 50 uploads/day free tier)\n\n2. **Transcoding Pipeline Scaling:**\n   - Stateless GPU workers pull tasks from a queue (SQS/Kafka)\n   - Auto-scale worker pool based on queue depth\n   - Spot/preemptible GPU instances reduce cost by 60-70% (tasks are retryable)\n   - Priority queue: 720p first for fast time-to-first-playable, then popular channel uploads\n   - DAG-based execution enables fine-grained parallelism and targeted retries\n\n3. **CDN Scaling:**\n   - 200+ PoPs worldwide, each with terabytes of SSD cache\n   - Multi-tier: Edge -> Shield -> Origin prevents thundering herd\n   - Request coalescing: only 1 origin request per unique segment regardless of concurrent viewers\n   - Popularity-based preloading: top 1% of videos (which serve 80%+ of views) are proactively pushed to edges\n\n4. **Recommendation Engine Scaling:**\n   - Precompute candidate lists per user offline (hourly batch job)\n   - Online ranking uses a lightweight model with pre-fetched features\n   - Feature store (Redis) holds user/video embeddings for real-time scoring\n   - A/B testing framework to evaluate model changes on engagement metrics\n\n**Failure Modes:**\n- **Transcoding worker crash:** Task is re-queued after visibility timeout expires. DAG tracks completed stages so only the failed task is retried, not the full pipeline\n- **CDN PoP failure:** DNS/Anycast automatically routes to next-nearest PoP. Origin shield absorbs the temporary traffic increase\n- **Viral video surge:** CDN request coalescing prevents origin overload. If CDN capacity is exceeded, return lower-resolution segments (graceful degradation)\n- **Corrupt video segment:** Client detects via CRC check and requests re-download. If persistent, fall back to a different CDN PoP\n\n**Monitoring Strategy:**\n- Track: startup latency p50/p99, rebuffering ratio, ABR quality distribution, CDN cache hit ratio, transcoding queue depth and latency\n- Alert on: rebuffering ratio > 2%, startup latency p99 > 5s, transcoding queue depth > 10K, CDN origin traffic > threshold\n\n**Key Trade-offs:**\n- **Number of transcoding profiles:** More profiles (resolutions, codecs) cover more devices and network conditions but multiply storage (6 resolutions * 3 codecs = 18x) and compute costs. Most platforms start with 5-6 resolutions and 1-2 codecs.\n- **Segment duration:** Shorter segments (2s) enable faster quality adaptation but increase manifest size and HTTP request overhead. Longer segments (10s) reduce overhead but react slowly to bandwidth changes. 4-6 seconds is the sweet spot.\n- **Pre-transcoding vs. just-in-time:** Pre-transcoding all resolutions ensures instant playback at any quality but wastes compute on rarely-watched videos. JIT transcoding saves compute but adds latency on first request. Solution: pre-transcode 720p and on-demand for other resolutions.\n- **CDN push vs. pull:** Push (proactively populate CDN) guarantees zero cache misses for known popular content but wastes bandwidth and storage for unpopular content. Pull (cache on first request) is efficient but creates a cold-start latency spike.`,
    timeComplexity: `**Capacity and Performance Targets:**\n- Video upload processing: < 10 minutes to first playable resolution (720p)\n- Full transcoding (all 6 resolutions): < 1 hour for a 1-hour video\n- Streaming startup latency: < 2 seconds (first segment should begin downloading within 500ms)\n- ABR quality switch: adapts within 1-2 segments (4-8 seconds) of bandwidth change\n- Search query latency: < 200ms p99 over video metadata index\n- Recommendation generation: < 100ms for online ranking of pre-fetched candidates\n- CDN cache hit ratio: > 95% for video segments\n- View event processing: 58K events/sec sustained, 174K peak — Kafka + Flink pipeline`,
    spaceComplexity: `**Storage and Memory Requirements:**\n- Raw video storage: 250TB/day, 91PB/year, stored in S3 Glacier after 30 days\n- Transcoded video storage: 750TB/day (3x multiplier for multi-resolution), 274PB/year in S3\n- CDN edge cache: 10-50TB SSD per PoP * 200 PoPs = 2-10PB total edge cache\n- Video metadata: 5KB per video * 500M videos = 2.5TB in database (MySQL + Elasticsearch)\n- User engagement data: 1KB per user * 1B users = 1TB\n- Recommendation feature store: 256-dim embedding * 4 bytes * 500M videos = 512GB in Redis\n- Transcoding queue state: negligible (task metadata only)\n- ABR client buffer: 30 seconds * 5Mbps = ~19MB per active viewer`,
    hints: [
      `The ABR (Adaptive Bitrate) algorithm is the most important client-side component. The key insight is to use harmonic mean (not arithmetic mean) for throughput estimation because it is more conservative and handles outliers better. A single slow download should immediately trigger quality reduction, but quality increases should be gradual (step up one level at a time). This asymmetry prevents oscillation — rapidly switching between high and low quality is worse than staying at a stable medium quality.`,
      `Design the transcoding pipeline as a DAG, not a linear sequence. This enables: (1) parallel transcoding of different resolutions, (2) parallel processing of video segments within a resolution, (3) independent retry of failed tasks without redoing completed work. The DAG scheduler should respect priority — always complete 720p first so the video becomes playable quickly, even if 4K transcoding takes hours.`,
      `CDN design is critical — it serves 95%+ of all traffic. The three key techniques are: (1) Origin shielding — a mid-tier cache layer that collapses thousands of edge cache misses into a single origin request. (2) Request coalescing — when multiple concurrent requests hit an uncached segment, only one fetches from upstream while others wait. (3) Popularity-based preloading — proactively push the first N segments of trending videos to edge PoPs before the traffic spike arrives.`,
      `For the interview, distinguish between the master manifest and media playlists. The master manifest lists available quality levels (resolutions and bitrates). Each quality level has its own media playlist listing the individual segments. The client first fetches the master manifest, picks a quality, then fetches that quality's media playlist, then downloads segments sequentially. This two-level structure enables the ABR algorithm to switch quality levels seamlessly.`,
      `Handle the "viral video" scenario explicitly. A video going from 0 to 10M concurrent viewers in minutes means: (1) CDN cache is cold — use request coalescing and origin shielding to prevent origin overload, (2) recommendation system suddenly needs to serve this video to everyone — use a "trending" bypass that injects viral videos directly, (3) comments/likes system gets hammered — use write-behind caching and eventual consistency for engagement counters.`,
      `Common pitfall: not discussing cost optimization. Video storage and CDN bandwidth are the largest costs. Key optimizations: (1) Use newer codecs like AV1 that achieve 30-50% better compression than H.264 at the same quality, reducing storage and bandwidth. (2) Only transcode less popular videos to 3 resolutions instead of 6. (3) Move raw uploads to cold storage after transcoding. (4) Use spot instances for transcoding. (5) Negotiate CDN committed-use contracts for volume discounts.`,
      `Another pitfall: ignoring the "long tail" of content. The top 1% of videos get 80% of views (cache-friendly), but 500M videos means 495M rarely-watched videos. These still need to be playable. Strategy: keep all resolutions of popular videos on SSD-backed CDN edge. For long-tail videos, keep only 720p cached and transcode other resolutions on-demand from a cheaper storage tier.`,
      `Discuss live streaming briefly as an extension. Live streaming changes the architecture significantly: no pre-transcoding (must transcode in real-time), no CDN cache warm-up (segments are generated just-in-time), and low-latency requirements (< 5 seconds end-to-end for live events). The key technique is "low-latency HLS" with partial segments and push-based CDN updates using HTTP/2 server push.`,
    ],
  },
  {
    id: 9008,
    description: `Design a Key-Value Store (Redis/DynamoDB)\n\n**Functional Requirements:**\n- GET(key) -> value: retrieve value for a given key\n- PUT(key, value): store or update a key-value pair\n- DELETE(key): remove a key-value pair\n- Support keys up to 256 bytes and values up to 1MB\n- Tunable consistency: configurable per-request (strong or eventual)\n- Automatic data partitioning across nodes with rebalancing\n- Replication for fault tolerance with configurable replication factor\n\n**Non-Functional Requirements:**\n- Read latency: < 5ms p99 for eventual consistency, < 10ms p99 for strong consistency\n- Write latency: < 10ms p99\n- Availability: 99.99% (< 52 minutes downtime/year)\n- Durability: 99.999999999% (eleven 9s) — no data loss\n- Scale to billions of key-value pairs across hundreds of nodes\n\n**Capacity Estimation:**\n- 1B keys, average key size 100 bytes, average value size 1KB\n- Total data: 1B * (100B + 1KB) = ~1.1TB per partition set\n- With replication factor 3: 3.3TB total\n- Read QPS: 500K/sec, Write QPS: 50K/sec (10:1 read-to-write ratio)\n- With 100 nodes: 5K reads/sec and 500 writes/sec per node\n- Network bandwidth per node: 5K * 1KB = 5MB/s read + replication overhead\n- Memory per node for hash index: 1B/100 * (100B key + 16B pointer) = ~1.16GB\n- Total cluster memory for hot data: 100 nodes * 32GB = 3.2TB (sufficient for full dataset in memory)`,
    examples: `**Capacity Estimation Walkthrough:**\n\nStep 1 — Node Sizing:\n- 1B keys across 100 physical nodes = 10M keys per node\n- Each node stores: 10M * 1.1KB = 11GB data\n- With 3x replication, each node holds ~33GB data\n- RAM per node: 64GB (data + index + OS)\n\nStep 2 — Consistent Hashing Calculation:\n- Hash ring: 2^32 positions (0 to 4,294,967,295)\n- 100 physical nodes * 150 virtual nodes = 15,000 virtual nodes\n- Expected keys per virtual node: 1B / 15,000 = ~66,667 keys\n- When adding 1 node (150 virtual nodes): ~1% of keys move = 10M keys\n- Rebalancing time: 10M * 1KB / 100MB/s network = ~100 seconds\n\nStep 3 — Quorum Configuration:\n- N=3 (replication factor), W=2, R=2 -> strong consistency (W+R=4 > N=3)\n- N=3, W=1, R=1 -> eventual consistency (fast but may read stale)\n- N=3, W=3, R=1 -> fast reads, slow writes, strong read consistency\n\nStep 4 — API Design:\n\`\`\`\nPUT /api/v1/kv/{key}\n  Body: { value, consistency: "strong"|"eventual", ttl?: seconds }\n  Headers: X-Client-Id, X-Vector-Clock (optional, for conflict resolution)\n  Response: { version, vectorClock, writtenTo: ["node1", "node2"] }\n\nGET /api/v1/kv/{key}\n  Query: ?consistency=strong|eventual\n  Response: { value, version, vectorClock, servedFrom: "node1" }\n\nDELETE /api/v1/kv/{key}\n  Response: { deleted: true, version }\n\nGET /api/v1/cluster/status\n  Response: { nodes: [{ id, status, load, keyCount }], ringVersion }\n\`\`\``,
    intuition: `A distributed key-value store is conceptually a giant hash map that is too large for one machine, so it is split across many machines using consistent hashing. The brilliance of consistent hashing is that adding or removing a node only moves O(K/N) keys (where K is total keys and N is total nodes), compared to O(K) for simple modular hashing.\n\nThe fundamental trade-off is captured by the CAP theorem: you cannot have all three of Consistency, Availability, and Partition tolerance. Since network partitions are inevitable in distributed systems, you must choose between C and A during a partition. The quorum protocol (W + R > N) gives you a tuning knob: by adjusting W and R per request, you let the caller decide where they fall on the consistency-availability spectrum.\n\nVector clocks are the mechanism that makes "tunable consistency" possible. They track causal relationships between writes across replicas. If vector clock A dominates B (every component is >= and at least one is >), then A happened after B — no conflict. If neither dominates, the writes are concurrent and there is a genuine conflict that needs resolution (last-writer-wins, or return both to the client like DynamoDB).\n\nMerkle trees are the anti-entropy mechanism. Each node builds a hash tree over its key-value data. To check if two replicas are in sync, you only need to compare the root hashes. If they differ, traverse down the tree to find exactly which key ranges are out of sync. This reduces the data transferred during synchronization from O(N) to O(log N) for the detection phase.\n\nThe gossip protocol is how nodes learn about each other. Every second, each node picks a random peer and exchanges its membership table. Information propagates exponentially — within O(log N) rounds, all N nodes know about a change. It is robust to failures because there is no single point of coordination.`,
    approach: `**Architecture Overview:**\n\n**1. Consistent Hash Ring with Virtual Nodes**\n- The hash space is a ring from 0 to 2^32-1\n- Each physical node is assigned 150 virtual nodes (tokens) spread across the ring\n- A key is hashed (MD5 or MurmurHash) and placed on the ring; it is assigned to the first virtual node found clockwise\n- Virtual nodes ensure even distribution even with heterogeneous hardware\n- When a node joins/leaves, only keys in the affected range are moved\n\n**2. Replication Manager**\n- Each key is replicated to N nodes (default N=3)\n- Replicas are the next N-1 distinct physical nodes clockwise on the ring (skip virtual nodes belonging to the same physical node)\n- The first replica is the coordinator for that key\n- Writes go to the coordinator, which forwards to replicas\n- Hinted handoff: if a replica is down, write to a temporary stand-in and transfer when the replica recovers\n\n**3. Quorum Protocol**\n- For each read/write, the coordinator contacts all N replicas\n- Write succeeds when W replicas acknowledge (W is configurable per request)\n- Read succeeds when R replicas respond; return the value with the highest version\n- W + R > N guarantees that reads see the latest write (strong consistency)\n- W=1, R=1 provides eventual consistency with lowest latency\n- Sloppy quorum: during partition, use any available node to meet quorum (improves availability, weakens consistency)\n\n**4. Gossip Protocol for Failure Detection**\n- Every second, each node selects a random peer and exchanges heartbeat data\n- Each node maintains a membership list with heartbeat counters and timestamps\n- If a node's heartbeat is not incremented for T seconds, it is suspected as failed\n- After 2T seconds without heartbeat, the node is marked as permanently failed and its data is re-replicated\n- Membership changes propagate to all nodes within O(log N) gossip rounds\n\n**5. Merkle Trees for Anti-Entropy**\n- Each node maintains a Merkle tree per key range (virtual node)\n- Leaf nodes are hashes of individual key-value pairs\n- Internal nodes are hashes of their children\n- To synchronize two replicas: compare root hashes; if different, recursively compare children to find the diverging leaves\n- Only the differing key-value pairs are transferred, minimizing synchronization bandwidth\n\n**Write Path:**\n1. Client sends PUT to any node (the contacted node becomes the coordinator)\n2. Coordinator hashes the key to find the responsible node on the ring\n3. If this node is not the coordinator, forward the request\n4. Coordinator writes locally and forwards to N-1 replicas in parallel\n5. Wait for W acknowledgments, then respond to client\n6. If a replica is down, write to a hinted handoff node\n7. Attach a vector clock to the write for conflict tracking\n\n**Read Path:**\n1. Client sends GET to any node\n2. Coordinator forwards read to all N replicas in parallel\n3. Wait for R responses\n4. Compare vector clocks to determine the latest version\n5. If there are conflicting versions, either resolve (LWW) or return all versions to client\n6. Read repair: if any replica returned a stale version, send it the latest version in the background`,
    code: `// Consistent Hash Ring with Virtual Nodes
class ConsistentHashRing {
  constructor(replicationFactor = 3, virtualNodesPerNode = 150) {
    this.replicationFactor = replicationFactor;
    this.vnodeCount = virtualNodesPerNode;
    this.ring = []; // sorted array of { hash, nodeId, physicalNode }
    this.nodes = new Map(); // physicalNode -> { id, status, vnodes[] }
  }

  hash(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    }
    return h >>> 0; // unsigned 32-bit
  }

  addNode(nodeId) {
    const vnodes = [];
    for (let i = 0; i < this.vnodeCount; i++) {
      const vnodeKey = \`\${nodeId}#vnode\${i}\`;
      const h = this.hash(vnodeKey);
      const entry = { hash: h, nodeId: vnodeKey, physicalNode: nodeId };
      vnodes.push(entry);
      this.ring.push(entry);
    }
    this.ring.sort((a, b) => a.hash - b.hash);
    this.nodes.set(nodeId, { id: nodeId, status: 'active', vnodes });
    return { nodeId, vnodeCount: vnodes.length };
  }

  removeNode(nodeId) {
    this.ring = this.ring.filter(e => e.physicalNode !== nodeId);
    this.nodes.delete(nodeId);
  }

  getNode(key) {
    if (this.ring.length === 0) return null;
    const h = this.hash(key);
    for (const entry of this.ring) {
      if (entry.hash >= h) return entry.physicalNode;
    }
    return this.ring[0].physicalNode; // wrap around
  }

  getReplicaNodes(key) {
    if (this.ring.length === 0) return [];
    const h = this.hash(key);
    const replicas = [];
    const seen = new Set();
    let startIdx = 0;
    for (let i = 0; i < this.ring.length; i++) {
      if (this.ring[i].hash >= h) { startIdx = i; break; }
    }
    for (let i = 0; i < this.ring.length && replicas.length < this.replicationFactor; i++) {
      const idx = (startIdx + i) % this.ring.length;
      const node = this.ring[idx].physicalNode;
      if (!seen.has(node)) { seen.add(node); replicas.push(node); }
    }
    return replicas;
  }

  getDistribution() {
    const counts = {};
    for (let i = 0; i < 10000; i++) {
      const node = this.getNode(\`test-key-\${i}\`);
      counts[node] = (counts[node] || 0) + 1;
    }
    return counts;
  }
}

// Vector Clock for Conflict Detection
class VectorClock {
  constructor(entries = {}) { this.clock = { ...entries }; }

  increment(nodeId) {
    this.clock[nodeId] = (this.clock[nodeId] || 0) + 1;
    return this;
  }

  merge(other) {
    const merged = new VectorClock(this.clock);
    for (const [node, count] of Object.entries(other.clock)) {
      merged.clock[node] = Math.max(merged.clock[node] || 0, count);
    }
    return merged;
  }

  compare(other) {
    let thisGt = false, otherGt = false;
    const allKeys = new Set([...Object.keys(this.clock), ...Object.keys(other.clock)]);
    for (const key of allKeys) {
      const a = this.clock[key] || 0;
      const b = other.clock[key] || 0;
      if (a > b) thisGt = true;
      if (b > a) otherGt = true;
    }
    if (thisGt && !otherGt) return 'AFTER';  // this happened after other
    if (otherGt && !thisGt) return 'BEFORE'; // this happened before other
    if (!thisGt && !otherGt) return 'EQUAL';
    return 'CONCURRENT'; // conflict!
  }
}

// Quorum Read/Write Coordinator
class QuorumCoordinator {
  constructor(ring, N = 3, defaultW = 2, defaultR = 2) {
    this.ring = ring;
    this.N = N;
    this.defaultW = defaultW;
    this.defaultR = defaultR;
    this.storage = new Map(); // nodeId -> Map(key -> { value, vectorClock })
  }

  initNodeStorage(nodeId) {
    if (!this.storage.has(nodeId)) this.storage.set(nodeId, new Map());
  }

  async put(key, value, W = this.defaultW) {
    const replicas = this.ring.getReplicaNodes(key);
    const coordinator = replicas[0];
    const vc = new VectorClock();
    vc.increment(coordinator);

    // Read existing vector clock and merge
    const existing = this.readFromNode(coordinator, key);
    const newVc = existing ? existing.vectorClock.merge(vc) : vc;
    newVc.increment(coordinator);

    let acks = 0;
    const writeResults = [];
    for (const node of replicas) {
      try {
        this.writeToNode(node, key, value, newVc);
        acks++;
        writeResults.push({ node, status: 'ok' });
      } catch (e) {
        writeResults.push({ node, status: 'failed', error: e.message });
      }
    }

    if (acks < W) throw new Error(\`Write quorum not met: \${acks}/\${W} acks from \${replicas.join(',')}\`);
    return { success: true, acks, vectorClock: newVc.clock, replicas: writeResults };
  }

  async get(key, R = this.defaultR) {
    const replicas = this.ring.getReplicaNodes(key);
    const responses = [];
    for (const node of replicas) {
      try {
        const data = this.readFromNode(node, key);
        if (data) responses.push({ node, ...data });
      } catch (e) { /* node unavailable */ }
    }

    if (responses.length < R) throw new Error(\`Read quorum not met: \${responses.length}/\${R}\`);

    // Find the latest version using vector clocks
    let latest = responses[0];
    for (let i = 1; i < responses.length; i++) {
      const cmp = responses[i].vectorClock.compare(latest.vectorClock);
      if (cmp === 'AFTER') latest = responses[i];
      else if (cmp === 'CONCURRENT') {
        return { value: [latest.value, responses[i].value], conflict: true,
          message: 'Concurrent writes detected — client must resolve' };
      }
    }

    // Read repair: update stale replicas in background
    for (const resp of responses) {
      if (resp.vectorClock.compare(latest.vectorClock) === 'BEFORE') {
        this.writeToNode(resp.node, key, latest.value, latest.vectorClock);
      }
    }
    return { value: latest.value, conflict: false, vectorClock: latest.vectorClock.clock };
  }

  writeToNode(nodeId, key, value, vectorClock) {
    this.initNodeStorage(nodeId);
    this.storage.get(nodeId).set(key, { value, vectorClock });
  }

  readFromNode(nodeId, key) {
    this.initNodeStorage(nodeId);
    return this.storage.get(nodeId).get(key) || null;
  }
}

// --- Demo ---
const ring = new ConsistentHashRing(3, 150);
['node-A', 'node-B', 'node-C', 'node-D', 'node-E'].forEach(n => ring.addNode(n));
console.log('Distribution:', ring.getDistribution());
console.log('Replicas for "user:123":', ring.getReplicaNodes('user:123'));

const coord = new QuorumCoordinator(ring, 3, 2, 2);
coord.put('user:123', '{"name":"Alice"}', 2).then(r => console.log('Write:', r));
coord.get('user:123', 2).then(r => console.log('Read:', r));`,
    jsCode: `// Merkle Tree for Anti-Entropy Replica Synchronization

class MerkleTree {
  constructor(data = {}) {
    this.leaves = new Map(); // key -> hash(value)
    this.tree = [];          // array of levels, level 0 = leaves
    this.bucketCount = 256;  // number of leaf buckets
    this.buckets = new Array(this.bucketCount).fill(null).map(() => new Map());

    for (const [key, value] of Object.entries(data)) {
      this.insert(key, value);
    }
    this.rebuild();
  }

  hashStr(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  getBucket(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = ((h << 5) - h + key.charCodeAt(i)) | 0;
    return (h >>> 0) % this.bucketCount;
  }

  insert(key, value) {
    const bucket = this.getBucket(key);
    const valueHash = this.hashStr(String(value));
    this.buckets[bucket].set(key, valueHash);
    this.leaves.set(key, valueHash);
  }

  remove(key) {
    const bucket = this.getBucket(key);
    this.buckets[bucket].delete(key);
    this.leaves.delete(key);
  }

  rebuild() {
    // Level 0: hash each bucket
    let currentLevel = [];
    for (let i = 0; i < this.bucketCount; i++) {
      const entries = [...this.buckets[i].entries()].sort((a, b) => a[0].localeCompare(b[0]));
      const combined = entries.map(([k, v]) => k + ':' + v).join('|');
      currentLevel.push(combined ? this.hashStr(combined) : '00000000');
    }
    this.tree = [currentLevel];

    // Build up the tree
    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : '00000000';
        nextLevel.push(this.hashStr(left + right));
      }
      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }
  }

  getRootHash() {
    return this.tree.length > 0 ? this.tree[this.tree.length - 1][0] : '00000000';
  }

  // Find differing bucket ranges between two Merkle trees
  static findDifferences(treeA, treeB) {
    if (treeA.getRootHash() === treeB.getRootHash()) return [];

    const differences = [];
    const topLevel = Math.min(treeA.tree.length, treeB.tree.length) - 1;

    function traverse(level, index) {
      if (level === 0) {
        // Leaf level — this bucket differs
        differences.push(index);
        return;
      }
      const leftIdx = index * 2;
      const rightIdx = index * 2 + 1;
      const aLevel = treeA.tree[level - 1];
      const bLevel = treeB.tree[level - 1];

      if (leftIdx < aLevel.length && leftIdx < bLevel.length) {
        if (aLevel[leftIdx] !== bLevel[leftIdx]) traverse(level - 1, leftIdx);
      }
      if (rightIdx < aLevel.length && rightIdx < bLevel.length) {
        if (aLevel[rightIdx] !== bLevel[rightIdx]) traverse(level - 1, rightIdx);
      }
    }

    traverse(topLevel, 0);
    return differences;
  }

  // Get all key-value hashes in a specific bucket
  getBucketContents(bucketIdx) {
    return Object.fromEntries(this.buckets[bucketIdx]);
  }
}

// Gossip Protocol for Cluster Membership
class GossipNode {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.membershipList = new Map(); // nodeId -> { heartbeat, timestamp, status }
    this.membershipList.set(nodeId, { heartbeat: 0, timestamp: Date.now(), status: 'alive' });
    this.failureTimeout = 10000;     // 10s without heartbeat = suspected
    this.cleanupTimeout = 30000;     // 30s without heartbeat = confirmed dead
  }

  incrementHeartbeat() {
    const self = this.membershipList.get(this.nodeId);
    self.heartbeat++;
    self.timestamp = Date.now();
  }

  // Exchange membership info with a peer
  gossipWith(peer) {
    // Send our list to peer, receive theirs
    const theirList = peer.receiveMembershipList(this.getMembershipSnapshot());
    this.mergeMembershipList(theirList);
  }

  getMembershipSnapshot() {
    const snapshot = {};
    for (const [id, info] of this.membershipList) {
      snapshot[id] = { ...info };
    }
    return snapshot;
  }

  receiveMembershipList(remoteList) {
    this.mergeMembershipList(remoteList);
    return this.getMembershipSnapshot();
  }

  mergeMembershipList(remoteList) {
    for (const [nodeId, remoteInfo] of Object.entries(remoteList)) {
      const local = this.membershipList.get(nodeId);
      if (!local || remoteInfo.heartbeat > local.heartbeat) {
        this.membershipList.set(nodeId, {
          heartbeat: remoteInfo.heartbeat,
          timestamp: Date.now(),
          status: remoteInfo.status === 'dead' ? 'dead' : 'alive',
        });
      }
    }
  }

  detectFailures() {
    const now = Date.now();
    const results = { suspected: [], dead: [] };
    for (const [nodeId, info] of this.membershipList) {
      if (nodeId === this.nodeId) continue;
      const elapsed = now - info.timestamp;
      if (info.status === 'alive' && elapsed > this.failureTimeout) {
        info.status = 'suspected';
        results.suspected.push(nodeId);
      } else if (info.status === 'suspected' && elapsed > this.cleanupTimeout) {
        info.status = 'dead';
        results.dead.push(nodeId);
      }
    }
    return results;
  }

  getAliveNodes() {
    return [...this.membershipList.entries()]
      .filter(([, info]) => info.status === 'alive')
      .map(([id]) => id);
  }
}

// --- Demo ---
// Merkle tree comparison
const dataA = { 'user:1': 'Alice', 'user:2': 'Bob', 'user:3': 'Charlie', 'user:4': 'Diana' };
const dataB = { 'user:1': 'Alice', 'user:2': 'Bobby', 'user:3': 'Charlie', 'user:4': 'Diana' };
const treeA = new MerkleTree(dataA);
const treeB = new MerkleTree(dataB);
console.log('Root A:', treeA.getRootHash());
console.log('Root B:', treeB.getRootHash());
console.log('Same?', treeA.getRootHash() === treeB.getRootHash());
const diffs = MerkleTree.findDifferences(treeA, treeB);
console.log('Differing buckets:', diffs);
for (const bucket of diffs) {
  console.log(\`  Bucket \${bucket} - A:\`, treeA.getBucketContents(bucket));
  console.log(\`  Bucket \${bucket} - B:\`, treeB.getBucketContents(bucket));
}

// Gossip protocol
const nodes = [new GossipNode('n1'), new GossipNode('n2'), new GossipNode('n3')];
nodes[0].incrementHeartbeat();
nodes[1].incrementHeartbeat();
nodes[2].incrementHeartbeat();
nodes[0].gossipWith(nodes[1]);
nodes[1].gossipWith(nodes[2]);
nodes[2].gossipWith(nodes[0]);
console.log('Node 0 knows about:', nodes[0].getAliveNodes());
console.log('Node 2 knows about:', nodes[2].getAliveNodes());`,
    explanation: `**Scaling Analysis:**\n\n1. **Horizontal Scaling with Consistent Hashing:**\n   - Adding a node: only ~1/N of keys are redistributed (with virtual nodes, the redistribution is from multiple existing nodes, not just one)\n   - 150 virtual nodes per physical node ensures < 5% standard deviation in load distribution\n   - Heterogeneous hardware: assign more virtual nodes to more powerful machines\n   - Rebalancing is background process — no downtime during node additions\n\n2. **Read Path Optimization:**\n   - For eventual consistency (R=1): single node read, < 1ms latency\n   - For strong consistency (R=2): parallel reads to 2 nodes, wait for both, < 5ms\n   - Read repair runs in background to fix stale replicas without adding to read latency\n   - Hot keys: use client-side caching with short TTL or a separate caching layer\n\n3. **Write Path Optimization:**\n   - Coordinator writes locally and forwards to replicas in parallel\n   - W=1: fastest writes, risk of data loss if coordinator fails before replication\n   - W=2: balanced durability and latency\n   - W=3: maximum durability but higher latency and lower availability during failures\n   - Write-ahead log (WAL) on each node ensures durability even for W=1\n\n**Failure Modes:**\n- **Single node failure:** Gossip protocol detects within 10-20 seconds. Hinted handoff ensures writes during the outage are replayed when the node recovers. If node does not recover within cleanup timeout, data is re-replicated to a new node.\n- **Network partition:** Sloppy quorum allows reads/writes to continue using any available nodes. After partition heals, anti-entropy (Merkle trees) synchronizes diverged replicas. May produce conflicting versions — vector clocks detect and surface these.\n- **Split brain:** Two sides of a partition both accept writes for the same key. Vector clocks capture this as a CONCURRENT relationship. Application must resolve: DynamoDB returns both versions; Cassandra uses last-write-wins.\n- **Cascading failure:** One node failure increases load on remaining nodes. Virtual nodes spread this load across multiple nodes rather than concentrating it on one neighbor.\n\n**Monitoring Strategy:**\n- Track: read/write latency p50/p95/p99 per node, quorum failure rate, gossip convergence time, Merkle tree sync frequency and bytes transferred, key distribution standard deviation\n- Alert on: p99 latency > SLA, quorum failure rate > 0.1%, any node marked dead, replication lag > 1 minute\n\n**Key Trade-offs:**\n- **W+R>N (strong) vs W=1 R=1 (eventual):** Strong consistency guarantees reading your own writes but increases latency (must wait for multiple nodes) and reduces availability during failures (need more nodes alive)\n- **Virtual nodes count:** More virtual nodes = better distribution but larger ring metadata and slower node join/leave operations. 150 per node is a practical sweet spot.\n- **Last-write-wins vs. semantic resolution:** LWW is simple but loses data when concurrent writes genuinely both matter. Semantic resolution (returning both values) is correct but pushes complexity to the application.\n- **LSM tree vs. B-tree for storage engine:** LSM trees (like LevelDB, RocksDB) optimize writes with sequential I/O but reads may check multiple levels. B-trees optimize reads but have write amplification.`,
    timeComplexity: `**Capacity and Performance Characteristics:**\n- PUT latency: 2-5ms for W=2 (parallel writes to 2 nodes + local write)\n- GET latency: 1-3ms for R=1 (single node read), 3-8ms for R=2 (parallel reads)\n- Consistent hash lookup: O(log V) where V is total virtual nodes (binary search on sorted ring)\n- Key redistribution on node add/remove: O(K/N) keys moved, where K=total keys, N=total nodes\n- Gossip convergence: O(log N) rounds for membership change to reach all N nodes\n- Merkle tree comparison: O(log B) where B is number of leaf buckets — only diverging branches are traversed\n- Vector clock comparison: O(D) where D is number of participating devices/nodes\n- Anti-entropy sync: runs every 10 minutes per key range; transfers only diverging keys`,
    spaceComplexity: `**Storage and Memory Requirements:**\n- Data per node: total_data / N * replication_factor = 1.1TB / 100 * 3 = 33GB per node\n- In-memory hash index: 10M keys * 116 bytes (key + pointer + metadata) = 1.16GB per node\n- Bloom filters (for SSTable lookups): 10 bits per key * 10M keys = ~12MB per node\n- Merkle tree per key range: 256 buckets * 8 bytes per hash * log(256) levels = ~16KB per range, ~2.4MB per node (150 ranges)\n- Gossip membership table: N nodes * 32 bytes = ~3.2KB for 100 nodes — negligible\n- Vector clocks: ~16 bytes per node entry per key — for active keys with 3 replicas = 48 bytes overhead per key\n- Write-ahead log: sized for recovery window (e.g., 256MB per node)\n- Total RAM per node: ~4GB for index + bloom filters + metadata, remaining for OS cache and data serving\n- Disk per node: 64-128GB SSD recommended for 33GB data with compaction headroom`,
    hints: [
      `The consistent hash ring is the foundation of the entire system. Implement it with virtual nodes (also called "tokens") — each physical node gets 100-200 positions on the ring. Without virtual nodes, adding a node only relieves one neighbor; with virtual nodes, it absorbs load from many nodes evenly. When implementing, use a sorted array and binary search for O(log V) lookup, where V is the total number of virtual nodes.`,
      `The quorum formula W + R > N is the key to tunable consistency. Walk through this example: with N=3, W=2, R=2, any read must overlap with any write (pigeonhole principle). But W=1, R=1 means reads and writes might hit different non-overlapping replicas, so you may read stale data. In the interview, always state what W, R, and N you would use and WHY — there is no universally correct answer; it depends on the application's consistency vs latency requirements.`,
      `Vector clocks are essential for detecting concurrent writes. The common mistake is confusing them with Lamport timestamps. A Lamport timestamp is a single integer that provides a total order but cannot detect concurrency. A vector clock is a map of {node: counter} that can distinguish "A happened before B" from "A and B are concurrent." This distinction is critical because concurrent writes indicate a real conflict that must be resolved, not just a stale replica.`,
      `Merkle trees enable efficient anti-entropy synchronization between replicas. The key optimization is that comparing two Merkle trees takes O(log N) hash comparisons (traversing down only the branches that differ) rather than comparing all N key-value pairs. In practice, use 256 or 1024 leaf buckets and rebuild the tree periodically (e.g., every 10 minutes). The comparison identifies exactly which buckets contain differences, and only those key-value pairs are transferred.`,
      `The gossip protocol is critical for maintaining cluster membership without a single point of failure. Each node pings a random peer every second and exchanges its membership table. Key implementation detail: use heartbeat counters (not timestamps) because clocks across nodes may not be synchronized. If a node's heartbeat counter hasn't increased in T seconds, mark it as suspected. After 2T seconds, mark it as dead and trigger re-replication of its data.`,
      `Hinted handoff is the mechanism that maintains write availability when a replica node is temporarily down. When the coordinator cannot reach a replica, it writes the data to another live node with a "hint" indicating the intended recipient. When the original node recovers, the hint is replayed. This is crucial for achieving high availability but weakens the consistency guarantee — the hint node might fail before replay, losing the write. For this reason, hinted handoff is used with sloppy quorums, and Merkle tree anti-entropy provides a backstop.`,
      `Common interview pitfall: forgetting about hot keys. If one key receives 100K reads/sec (e.g., a viral social media post), consistent hashing concentrates all that load on one node. Solutions: (1) Read replicas — serve reads from any of the N replicas, not just the coordinator. (2) Client-side caching with short TTL. (3) Key-level replication — replicate hot keys to additional nodes beyond the normal N. (4) Key splitting — internally split the hot key into sub-keys distributed across nodes.`,
      `Another pitfall: not discussing the storage engine. A distributed KV store needs a local storage engine on each node. The two main options are LSM trees (LevelDB/RocksDB) and B-trees. LSM trees batch writes in memory (memtable) and flush to sorted disk files (SSTables), giving excellent write throughput. Reads may need to check multiple SSTables, mitigated by Bloom filters. B-trees provide balanced read/write performance but have write amplification. Most modern distributed KV stores (Cassandra, ScyllaDB, CockroachDB) use LSM trees.`,
    ],
  },
  {
    id: 9009,
    description: `Design a Search Engine (Google)\n\n**Functional Requirements:**\n- Crawl billions of web pages and build a searchable index\n- Accept keyword queries and return ranked results in under 200ms\n- Rank results by relevance combining link analysis (PageRank) and content signals (TF-IDF, freshness, quality)\n- Handle typos (fuzzy matching), synonyms, and natural language queries\n- Support boolean operators (AND, OR, NOT), phrase matching ("exact phrase"), and field-specific search (site:example.com)\n- Continuously update the index as web content changes\n\n**Non-Functional Requirements:**\n- Query latency: < 200ms p99 for the top 10 results\n- Freshness: new/updated pages indexed within 24 hours (breaking news within minutes)\n- Scale: 100B+ indexed pages, 100K queries/sec\n- Availability: 99.99%\n\n**Capacity Estimation:**\n- Index size: 100B pages * 20KB average text per page = 2PB raw text\n- Inverted index: ~500B unique terms, each with posting lists averaging 10K documents = 5TB compressed index\n- PageRank scores: 100B pages * 8 bytes = 800GB\n- Query volume: 100K queries/sec, peak 300K/sec\n- Index serving: 100K QPS / 1000 QPS per server = 100 index servers per replica\n- With 3 replicas for availability: 300 index servers\n- Crawl rate: 100B pages recrawled every 30 days = ~38,580 pages/sec\n- Crawl bandwidth: 38,580 pages/sec * 100KB avg page = 3.86 GB/sec`,
    examples: `**Capacity Estimation Walkthrough:**\n\nStep 1 — Inverted Index Size:\n- 100B web pages, average 2000 unique terms per page\n- Total term-document pairs: 100B * 2000 = 200T (but many duplicates)\n- Unique terms: ~500M after stemming and stop-word removal\n- Average posting list length: 200T / 500M = 400K entries\n- Each posting entry: (docId: 4B + termFreq: 2B + position: 4B) = 10B per entry\n- Total: 200T * 10B = 2PB uncompressed\n- With variable-byte encoding and delta compression: ~200TB compressed\n- Sharded across 1000 index servers: 200GB per server\n\nStep 2 — API Design:\n\`\`\`\nGET /api/v1/search\n  Query: ?q=distributed+systems&page=1&lang=en&safeSearch=on\n  Response: {\n    results: [{\n      url, title, snippet, favicon, sitelinks[],\n      cachedUrl, publishDate, relevanceScore\n    }],\n    totalResults, searchTimeMs,\n    relatedSearches[], spellingSuggestion\n  }\n\nGET /api/v1/suggest\n  Query: ?q=distrib&lang=en\n  Response: { suggestions: ["distributed systems", "distributed computing", ...] }\n\nPOST /api/v1/index/submit\n  Body: { url, priority: "high"|"normal" }\n  Response: { accepted: true, estimatedCrawlTime }\n\`\`\`\n\nStep 3 — Query Processing Pipeline:\n1. Parse query: "distributed systems" -database site:edu\n2. Spell check: no corrections needed\n3. Tokenize: ["distributed", "systems"] NOT ["database"] SITE ["edu"]\n4. Expand: add synonyms ["distributed", "decentralized"] ["systems", "architectures"]\n5. Fan-out to all index shards\n6. Each shard: look up posting lists, intersect, score top-K per shard\n7. Merge results from all shards, re-rank top 100 globally\n8. Generate snippets, return top 10`,
    intuition: `A search engine is a pipeline that transforms the unstructured web into a highly structured inverted index, then uses that index to answer queries in milliseconds by avoiding full scans. The inverted index is the single most important data structure — it maps every word to the list of documents containing it, enabling O(1) lookup per term instead of scanning billions of documents.\n\nTF-IDF captures the intuition that a term is important to a document if it appears frequently in that document (TF — term frequency) but rarely across all documents (IDF — inverse document frequency). The word "the" has high TF in every document but near-zero IDF because it appears everywhere. The word "kubernetes" has moderate TF in relevant documents but high IDF because it appears in few documents, making it a strong signal.\n\nPageRank captures a completely different signal: the authority of a page based on the link structure of the web. A page linked by many high-authority pages is itself authoritative. It is computed iteratively: start with equal scores, then repeatedly distribute each page's score equally among its outgoing links, with a damping factor (0.85) that models the probability of a random surfer following links vs. jumping to a random page. After ~50-100 iterations, scores converge.\n\nThe combination of content relevance (TF-IDF) and page authority (PageRank) is what makes modern search work. A page can be highly relevant to "Python tutorial" (high TF-IDF) but if no other pages link to it, it might be low quality. Conversely, a highly linked page about Python might not specifically address "tutorial." The ranking function combines both signals (and hundreds more in production) to surface the best results.`,
    approach: `**Architecture Overview:**\n\n**1. Web Crawler**\n- Distributed crawler with thousands of worker processes\n- URL Frontier: priority queue that determines which URLs to crawl next\n  - Priority factors: PageRank, freshness (time since last crawl), change frequency\n  - Politeness: per-domain rate limiting (respect robots.txt crawl-delay)\n  - Per-host queues ensure no single domain is overwhelmed\n- DNS resolution cache to avoid repeated lookups\n- Content deduplication using SimHash fingerprints\n- Discovery: extract links from crawled pages, normalize URLs, add to frontier\n\n**2. Document Processor**\n- Extract text content from HTML (strip tags, scripts, styles)\n- Tokenization: split text into words, handle CJK character segmentation\n- Normalization: lowercase, remove accents, Unicode normalization\n- Stop-word removal: filter out "the", "is", "and" etc.\n- Stemming/Lemmatization: "running" -> "run", "better" -> "good"\n- Extract metadata: title, meta description, headings, anchor text from incoming links\n\n**3. Inverted Index**\n- Maps each term to a posting list: sorted list of (docId, termFrequency, [positions])\n- Positions enable phrase matching and proximity queries\n- Stored using delta encoding (store gaps between docIds instead of absolute values)\n- Variable-byte encoding compresses gaps efficiently (most gaps are small)\n- Sharded by document ID (each shard contains the full vocabulary for its documents)\n- Replicated 3x for availability and parallel query serving\n\n**4. Query Parser and Processor**\n- Parse query string into structured query tree\n- Handle operators: AND (implicit between words), OR, NOT (-), phrase ("..."), site:, filetype:\n- Spell correction: edit distance + language model\n- Synonym expansion: WordNet or learned synonym pairs\n- Query rewriting: add related terms to improve recall\n\n**5. Ranking Engine**\n- Stage 1 — Retrieval: for each query term, fetch posting lists from index shards\n- Stage 2 — Intersection: AND terms by intersecting posting lists\n- Stage 3 — Scoring: compute TF-IDF + PageRank + 200+ other signals per document\n- Stage 4 — Top-K selection: each shard returns its top-K results\n- Stage 5 — Global merge: merge top-K from all shards, re-rank, return top 10\n- Snippet generation: extract the most relevant text fragment from the document\n\n**Query Data Flow:**\n1. User submits query -> query parser extracts terms and operators\n2. Spell check and synonym expansion\n3. Fan-out query to all index shards (document-partitioned)\n4. Each shard: intersect posting lists for query terms, score top-1000 candidates, return top-100\n5. Aggregator: merge results from all shards, globally re-rank top-1000, select top-10\n6. Generate snippets by loading document text and extracting relevant fragments\n7. Return results with total count, latency, spelling suggestions, and related queries`,
    code: `// Inverted Index with Positional Indexing, TF-IDF Scorer, and PageRank

class InvertedIndex {
  constructor() {
    this.index = new Map();         // term -> Map(docId -> { tf, positions[] })
    this.docLengths = new Map();    // docId -> total terms count
    this.docCount = 0;
    this.avgDocLength = 0;
    this.docMetadata = new Map();   // docId -> { url, title }
  }

  addDocument(docId, text, metadata = {}) {
    const tokens = this.tokenize(text);
    this.docLengths.set(docId, tokens.length);
    this.docMetadata.set(docId, metadata);
    this.docCount++;
    this.avgDocLength = [...this.docLengths.values()].reduce((a, b) => a + b, 0) / this.docCount;

    const termPositions = new Map();
    tokens.forEach((token, pos) => {
      if (!termPositions.has(token)) termPositions.set(token, []);
      termPositions.get(token).push(pos);
    });

    for (const [term, positions] of termPositions) {
      if (!this.index.has(term)) this.index.set(term, new Map());
      this.index.get(term).set(docId, { tf: positions.length, positions });
    }
  }

  tokenize(text) {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'to', 'of', 'for', 'it']);
    return text.toLowerCase().replace(/[^a-z0-9\\s]/g, '').split(/\\s+/)
      .filter(t => t.length > 1 && !stopWords.has(t))
      .map(t => this.stem(t));
  }

  stem(word) {
    // Simplified Porter stemmer — handles common suffixes
    if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
    if (word.endsWith('tion') && word.length > 6) return word.slice(0, -4);
    if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);
    if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
    if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
    if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
    return word;
  }

  // BM25 scoring (improved TF-IDF)
  scoreBM25(term, docId, k1 = 1.5, b = 0.75) {
    const posting = this.index.get(term);
    if (!posting || !posting.has(docId)) return 0;
    const { tf } = posting.get(docId);
    const df = posting.size;
    const idf = Math.log((this.docCount - df + 0.5) / (df + 0.5) + 1);
    const docLen = this.docLengths.get(docId);
    const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / this.avgDocLength)));
    return idf * tfNorm;
  }

  search(query, topK = 10) {
    const terms = this.tokenize(query);
    const candidates = new Map(); // docId -> score

    for (const term of terms) {
      const posting = this.index.get(term);
      if (!posting) continue;
      for (const [docId] of posting) {
        const score = this.scoreBM25(term, docId);
        candidates.set(docId, (candidates.get(docId) || 0) + score);
      }
    }

    return [...candidates.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([docId, score]) => ({
        docId, score: Math.round(score * 1000) / 1000,
        ...this.docMetadata.get(docId),
      }));
  }

  // Phrase search using positional index
  phraseSearch(phrase) {
    const terms = this.tokenize(phrase);
    if (terms.length < 2) return this.search(phrase);

    // Get posting lists for all terms
    const postings = terms.map(t => this.index.get(t));
    if (postings.some(p => !p)) return [];

    // Find documents containing all terms
    const commonDocs = [...postings[0].keys()].filter(docId =>
      postings.every(p => p.has(docId))
    );

    const results = [];
    for (const docId of commonDocs) {
      const positionLists = terms.map(t => this.index.get(t).get(docId).positions);
      // Check if positions form a consecutive sequence
      for (const startPos of positionLists[0]) {
        let isPhrase = true;
        for (let i = 1; i < positionLists.length; i++) {
          if (!positionLists[i].includes(startPos + i)) { isPhrase = false; break; }
        }
        if (isPhrase) {
          results.push({ docId, position: startPos, ...this.docMetadata.get(docId) });
          break;
        }
      }
    }
    return results;
  }
}

// Simplified PageRank Algorithm
class PageRank {
  constructor(dampingFactor = 0.85, maxIterations = 100, convergenceThreshold = 0.0001) {
    this.damping = dampingFactor;
    this.maxIter = maxIterations;
    this.threshold = convergenceThreshold;
    this.graph = new Map();   // pageId -> Set of outgoing links
    this.inLinks = new Map(); // pageId -> Set of incoming links
  }

  addLink(fromPage, toPage) {
    if (!this.graph.has(fromPage)) this.graph.set(fromPage, new Set());
    if (!this.graph.has(toPage)) this.graph.set(toPage, new Set());
    if (!this.inLinks.has(toPage)) this.inLinks.set(toPage, new Set());
    if (!this.inLinks.has(fromPage)) this.inLinks.set(fromPage, new Set());
    this.graph.get(fromPage).add(toPage);
    this.inLinks.get(toPage).add(fromPage);
  }

  compute() {
    const pages = [...this.graph.keys()];
    const N = pages.length;
    let scores = new Map();
    pages.forEach(p => scores.set(p, 1.0 / N));

    for (let iter = 0; iter < this.maxIter; iter++) {
      const newScores = new Map();
      let maxDelta = 0;

      // Handle dangling nodes (no outgoing links) — distribute their rank evenly
      let danglingSum = 0;
      for (const page of pages) {
        if (this.graph.get(page).size === 0) danglingSum += scores.get(page);
      }

      for (const page of pages) {
        let rank = (1 - this.damping) / N; // random jump component
        rank += this.damping * danglingSum / N; // dangling node contribution

        const incoming = this.inLinks.get(page) || new Set();
        for (const src of incoming) {
          const outDegree = this.graph.get(src).size;
          if (outDegree > 0) rank += this.damping * scores.get(src) / outDegree;
        }

        newScores.set(page, rank);
        maxDelta = Math.max(maxDelta, Math.abs(rank - scores.get(page)));
      }

      scores = newScores;
      if (maxDelta < this.threshold) {
        return { scores: Object.fromEntries(scores), iterations: iter + 1, converged: true };
      }
    }
    return { scores: Object.fromEntries(scores), iterations: this.maxIter, converged: false };
  }
}

// Query Parser with Boolean Operators
class QueryParser {
  parse(queryString) {
    const tokens = queryString.match(/"[^"]+"|\\S+/g) || [];
    const must = [], mustNot = [], should = [], phrases = [];

    for (const token of tokens) {
      if (token.startsWith('"') && token.endsWith('"')) {
        phrases.push(token.slice(1, -1));
      } else if (token.startsWith('-')) {
        mustNot.push(token.slice(1).toLowerCase());
      } else if (token.toUpperCase() === 'OR') {
        // Next token is a should (optional) term
        continue; // handled by context
      } else {
        must.push(token.toLowerCase());
      }
    }
    return { must, mustNot, phrases, raw: queryString };
  }
}

// --- Demo ---
const idx = new InvertedIndex();
idx.addDocument('d1', 'Distributed systems design patterns for building scalable applications', { url: 'http://example.com/1', title: 'Distributed Systems' });
idx.addDocument('d2', 'Building scalable web applications with microservices architecture', { url: 'http://example.com/2', title: 'Microservices' });
idx.addDocument('d3', 'Introduction to distributed computing and distributed systems fundamentals', { url: 'http://example.com/3', title: 'Distributed Computing' });
idx.addDocument('d4', 'Database design patterns for high performance systems', { url: 'http://example.com/4', title: 'Database Design' });
idx.addDocument('d5', 'Scalable distributed systems with consistent hashing and replication', { url: 'http://example.com/5', title: 'Consistent Hashing' });

console.log('Search "distributed systems":', idx.search('distributed systems', 3));
console.log('Phrase "distributed systems":', idx.phraseSearch('distributed systems'));

const pr = new PageRank();
pr.addLink('A', 'B'); pr.addLink('A', 'C'); pr.addLink('B', 'C');
pr.addLink('C', 'A'); pr.addLink('D', 'C');
const ranks = pr.compute();
console.log('PageRank:', ranks);

const parser = new QueryParser();
console.log('Parsed:', parser.parse('"distributed systems" -database scalable'));`,
    jsCode: `// Web Crawler URL Frontier with Priority and Politeness, and Spell Checker

class URLFrontier {
  constructor() {
    this.priorityQueues = [[], [], []]; // high(0), medium(1), low(2)
    this.hostQueues = new Map();        // hostname -> { queue, lastCrawlTime, crawlDelay }
    this.seen = new Set();              // URL dedup using normalized URLs
    this.robotsCache = new Map();       // hostname -> { rules, expiry }
    this.maxQueueSize = 1000000;
  }

  normalizeUrl(url) {
    try {
      let normalized = url.toLowerCase().trim();
      normalized = normalized.replace(/\\/+$/, '');             // remove trailing slashes
      normalized = normalized.replace(/#.*$/, '');               // remove fragments
      normalized = normalized.replace(/\\?utm_[^&]*&?/g, '?');   // remove tracking params
      normalized = normalized.replace(/\\?$/, '');
      return normalized;
    } catch { return url; }
  }

  getHostname(url) {
    const match = url.match(/^https?:\\/\\/([^/]+)/);
    return match ? match[1] : 'unknown';
  }

  addUrl(url, priority = 1, pageRankScore = 0) {
    const normalized = this.normalizeUrl(url);
    if (this.seen.has(normalized)) return false;
    if (this.seen.size >= this.maxQueueSize) return false;

    this.seen.add(normalized);
    const hostname = this.getHostname(normalized);

    if (!this.hostQueues.has(hostname)) {
      this.hostQueues.set(hostname, { queue: [], lastCrawlTime: 0, crawlDelay: 1000 });
    }

    const entry = { url: normalized, priority, pageRankScore, addedAt: Date.now() };
    this.hostQueues.get(hostname).queue.push(entry);
    this.priorityQueues[Math.min(priority, 2)].push(entry);
    return true;
  }

  getNextUrl() {
    const now = Date.now();

    for (const queue of this.priorityQueues) {
      // Sort by pageRank within same priority
      queue.sort((a, b) => b.pageRankScore - a.pageRankScore);

      for (let i = 0; i < queue.length; i++) {
        const entry = queue[i];
        const hostname = this.getHostname(entry.url);
        const hostInfo = this.hostQueues.get(hostname);

        if (now - hostInfo.lastCrawlTime >= hostInfo.crawlDelay) {
          queue.splice(i, 1);
          hostInfo.lastCrawlTime = now;
          // Remove from host queue too
          const hIdx = hostInfo.queue.findIndex(e => e.url === entry.url);
          if (hIdx !== -1) hostInfo.queue.splice(hIdx, 1);
          return entry;
        }
      }
    }
    return null; // all URLs are rate-limited
  }

  setRobotsRules(hostname, crawlDelay) {
    if (this.hostQueues.has(hostname)) {
      this.hostQueues.get(hostname).crawlDelay = Math.max(crawlDelay * 1000, 1000);
    }
  }

  getStats() {
    const totalQueued = this.priorityQueues.reduce((s, q) => s + q.length, 0);
    return { totalSeen: this.seen.size, totalQueued, hosts: this.hostQueues.size,
      byPriority: this.priorityQueues.map(q => q.length) };
  }
}

// Spell Checker using Edit Distance and Frequency
class SpellChecker {
  constructor() {
    this.vocabulary = new Map(); // word -> frequency
    this.maxEditDistance = 2;
  }

  train(corpus) {
    const words = corpus.toLowerCase().match(/[a-z]+/g) || [];
    for (const word of words) {
      this.vocabulary.set(word, (this.vocabulary.get(word) || 0) + 1);
    }
  }

  editDistance(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1];
        else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
    return dp[m][n];
  }

  // Generate candidates within edit distance 1
  edits1(word) {
    const results = new Set();
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    // Deletions
    for (let i = 0; i < word.length; i++) results.add(word.slice(0, i) + word.slice(i + 1));
    // Transpositions
    for (let i = 0; i < word.length - 1; i++)
      results.add(word.slice(0, i) + word[i+1] + word[i] + word.slice(i + 2));
    // Replacements
    for (let i = 0; i < word.length; i++)
      for (const c of alpha) results.add(word.slice(0, i) + c + word.slice(i + 1));
    // Insertions
    for (let i = 0; i <= word.length; i++)
      for (const c of alpha) results.add(word.slice(0, i) + c + word.slice(i));
    return results;
  }

  correct(word) {
    word = word.toLowerCase();
    if (this.vocabulary.has(word)) return { word, correction: word, distance: 0 };

    // Edit distance 1
    const e1 = this.edits1(word);
    let bestMatch = null, bestFreq = 0, bestDist = Infinity;
    for (const candidate of e1) {
      const freq = this.vocabulary.get(candidate) || 0;
      if (freq > bestFreq) { bestMatch = candidate; bestFreq = freq; bestDist = 1; }
    }

    // Edit distance 2 if nothing found at distance 1
    if (!bestMatch) {
      for (const e1word of e1) {
        for (const candidate of this.edits1(e1word)) {
          const freq = this.vocabulary.get(candidate) || 0;
          if (freq > bestFreq) { bestMatch = candidate; bestFreq = freq; bestDist = 2; }
        }
      }
    }

    return bestMatch ? { word, correction: bestMatch, distance: bestDist, frequency: bestFreq }
                     : { word, correction: word, distance: 0, noSuggestion: true };
  }

  correctQuery(query) {
    const words = query.toLowerCase().split(/\\s+/);
    const corrections = words.map(w => this.correct(w));
    const corrected = corrections.map(c => c.correction).join(' ');
    const hasCorrections = corrections.some(c => c.distance > 0);
    return { original: query, corrected, hasCorrections, details: corrections };
  }
}

// --- Demo ---
const frontier = new URLFrontier();
frontier.addUrl('https://example.com/page1', 0, 0.9);
frontier.addUrl('https://example.com/page2', 0, 0.5);
frontier.addUrl('https://other.com/article', 1, 0.3);
frontier.addUrl('https://example.com/page1#section', 0, 0.2); // duplicate — filtered
console.log('Frontier stats:', frontier.getStats());

const next1 = frontier.getNextUrl();
console.log('Next URL:', next1?.url, 'PR:', next1?.pageRankScore);
const next2 = frontier.getNextUrl(); // different host (example.com is rate-limited)
console.log('Next URL:', next2?.url);

const speller = new SpellChecker();
speller.train('distributed systems are designed for scalability and reliability ' +
  'system design patterns for building distributed applications ' +
  'database systems and distributed computing fundamentals ' +
  'consistent hashing replication and fault tolerance in distributed systems');

console.log(speller.correct('distribted'));     // -> distributed
console.log(speller.correct('systms'));         // -> systems
console.log(speller.correctQuery('distribted systms desing'));`,
    explanation: `**Scaling Analysis:**\n\n1. **Index Serving:**\n   - Document-partitioned: index is sharded by document ID across 1000+ servers\n   - Each shard holds ~100M documents and can serve ~1000 QPS\n   - Every query fans out to ALL shards (each shard might have relevant documents)\n   - Results are merged by an aggregator layer that selects the global top-K\n   - 3x replication for availability and load distribution\n\n2. **Crawler Scaling:**\n   - Distributed across thousands of workers, partitioned by hostname\n   - Each worker is responsible for a set of hostnames (consistent hashing)\n   - This ensures politeness: only one worker crawls a given host\n   - URL frontier is distributed (e.g., in Redis or Kafka) for coordination\n   - Prioritized recrawling: popular/frequently changing pages crawled more often\n\n3. **Query Processing Optimization:**\n   - Term-at-a-time vs. Document-at-a-time evaluation strategies\n   - Early termination: skip low-scoring documents using static quality scores (PageRank)\n   - Tiered index: Tier 1 (top 1% of pages by PageRank) searched first; Tier 2 only if not enough results\n   - Caching: 30-40% of queries are repeated; cache complete result pages for popular queries\n\n**Failure Modes:**\n- **Index shard failure:** Replicas automatically serve traffic. Re-index from crawl store if all replicas fail.\n- **Crawler getting trapped:** Spider traps (infinite URL generation) detected by URL depth limits, URL normalization, and per-host URL count limits. Crawl scheduler blacklists known trap patterns.\n- **Stale index:** Real-time crawl stream for breaking news pages. Websub/PubSubHubbub for sites that support push notifications of changes.\n- **Query of death:** Extremely broad queries (e.g., "the") that match billions of documents. Handled by early termination and tiered indexing — only search Tier 1 and return results quickly.\n\n**Monitoring Strategy:**\n- Track: query latency p50/p95/p99, index freshness (avg age of indexed version), crawl throughput (pages/sec), cache hit rate, query-level error rate\n- Alert on: p99 latency > 500ms, crawl throughput drop > 20%, index shard replication lag > 1 hour\n\n**Key Trade-offs:**\n- **Document-partitioned vs. term-partitioned index:** Document-partitioned means every query hits every shard (high fan-out) but each shard independently scores and ranks. Term-partitioned means queries only hit shards containing query terms (low fan-out) but scoring requires gathering data from multiple shards. Document-partitioned is simpler and used by most search engines.\n- **Index freshness vs. resource cost:** Crawling more frequently keeps the index fresh but increases bandwidth, compute, and storage costs. Most pages change rarely; focus frequent crawling on news sites and rapidly changing content.\n- **BM25 vs. neural ranking:** BM25 (improved TF-IDF) is fast and interpretable but misses semantic similarity (e.g., "car" vs "automobile"). Neural rankers (BERT-based) capture semantics but are 100-1000x more expensive to evaluate. Solution: use BM25 for initial retrieval (top 1000) and neural re-ranking for final top 10.\n- **Complete vs. tiered index:** Searching the complete index ensures no relevant result is missed but is slow for broad queries. Tiered indexing (search important pages first) is faster but may miss relevant long-tail pages.`,
    timeComplexity: `**Capacity and Performance Characteristics:**\n- Query latency breakdown: query parsing (1ms) + fan-out to shards (5ms network) + per-shard retrieval (50-100ms) + result merging (10ms) + snippet generation (20ms) = ~100-150ms total\n- Per-shard retrieval: posting list lookup O(1), intersection of k posting lists O(k * L) where L is average list length, top-K selection O(L * log K)\n- PageRank computation: O(iterations * edges) — for 100B pages with avg 10 links each, ~50 iterations = 50 * 1T = 50T operations per full recomputation (runs offline in distributed batch job)\n- Index build: O(total_terms) — single pass over all documents to build inverted index\n- Spell correction: O(26 * word_length) for edit distance 1 candidates, O(26^2 * word_length^2) for distance 2\n- Crawl throughput: 38,580 pages/sec across the full crawler fleet`,
    spaceComplexity: `**Storage and Memory Requirements:**\n- Inverted index: ~200TB compressed (delta + variable-byte encoding) across 1000 index servers = 200GB per server\n- Per-server memory for index: 64-128GB RAM to hold hot portions of index, with SSD for cold segments\n- Document store (for snippet generation): 2PB raw text, stored in distributed blob store\n- PageRank scores: 100B pages * 8 bytes = 800GB, replicated across query servers\n- URL frontier: 10B URLs * 200 bytes = 2TB, distributed across frontier servers\n- Crawl store (raw HTML): 100B pages * 100KB avg = 10PB, in cold storage (S3/HDFS) with compression\n- Query cache: 10M cached queries * 5KB avg result = 50GB in Redis cluster\n- Spell checker dictionary: 5M words * 100 bytes = 500MB per query server`,
    hints: [
      `The inverted index is the most important data structure in a search engine. Implement it with positional information — not just which documents contain a term, but WHERE in the document the term appears. This enables phrase queries ("exact match"), proximity scoring (terms appearing close together rank higher), and field-specific boosting (terms in the title are weighted higher than terms in the body). Without positional indexing, you lose most of the query expressiveness that users expect.`,
      `BM25 is a better scoring function than raw TF-IDF. The key improvement is saturation: in TF-IDF, a term appearing 100 times scores 10x higher than one appearing 10 times. In BM25, the tf component has a parameter k1 that causes saturation — beyond a certain frequency, additional occurrences contribute diminishing returns. This is more aligned with reality: a page that mentions "python" 100 times is not 10x more relevant than one mentioning it 10 times. The b parameter controls document length normalization.`,
      `PageRank must handle two edge cases: (1) Dangling nodes (pages with no outgoing links) — their rank would be lost if not redistributed. Solution: distribute dangling node rank equally to all pages. (2) Spider traps (groups of pages that link only to each other) — they accumulate all the rank. The damping factor (0.85) prevents this by giving each page a baseline "random jump" probability.`,
      `For the interview, always discuss the query processing pipeline in stages: parse -> spell correct -> tokenize -> expand (synonyms) -> retrieve (posting list intersection) -> score (BM25 + PageRank + signals) -> merge (across shards) -> snippet generation -> return. Each stage is a potential bottleneck and optimization opportunity. The key insight is that you never score all documents — you use the inverted index to narrow down to a small candidate set, then score only those.`,
      `Document-partitioned sharding (each shard holds all terms for a subset of documents) is the standard approach. Every query must fan out to all shards, but each shard independently scores its top-K. The aggregator merges and selects the global top-K. This is simpler than term-partitioned sharding and allows each shard to maintain complete TF-IDF statistics for its documents. The fan-out is manageable because each shard's response is small (top 100 docIds + scores).`,
      `Tiered indexing is a critical optimization. Tier 1 contains the top 1% of pages by quality (PageRank + engagement signals) and serves most queries. Tier 2 contains the full index and is only consulted when Tier 1 does not have enough relevant results. This dramatically reduces query latency for common queries because Tier 1 fits in memory. Google uses a variant of this with multiple tiers.`,
      `Common pitfall: not discussing how the index is updated. The index cannot be rebuilt from scratch every time a page changes — that would take days. Solution: maintain a real-time index for recently crawled/changed pages and periodically merge it into the main index. Queries search both the main index and the real-time index, merging results. This is similar to how LSM trees handle writes — buffer in memory, periodically flush to disk.`,
      `Another pitfall: ignoring internationalization. Non-English languages require different tokenization (CJK languages have no spaces between words), different stemming algorithms, and different ranking signals. Search engines maintain separate indices per language and use language detection on both documents and queries to route to the correct index. This is a significant architectural consideration when discussing sharding and replication.`,
    ],
  },
  {
    id: 9010,
    description: `Design a Distributed Cache (Memcached)\n\n**Functional Requirements:**\n- GET(key) -> value: retrieve cached data by key\n- SET(key, value, TTL): store data with an optional time-to-live\n- DELETE(key): explicitly remove cached data\n- Support arbitrary binary keys (up to 250 bytes) and values (up to 1MB)\n- Consistent hashing across cache nodes for data distribution\n- Graceful handling of node failures without cascading database load\n\n**Non-Functional Requirements:**\n- GET/SET latency: < 1ms p99 within the same datacenter\n- Throughput: 100K+ operations/sec per cache node\n- Availability: 99.99% (cache misses are acceptable, but cache should be reachable)\n- Memory efficiency: > 90% of allocated memory used for actual data\n- Horizontal scaling: add nodes with minimal disruption\n\n**Capacity Estimation:**\n- 100 cache nodes, each with 64GB RAM\n- Total cache capacity: 6.4TB\n- Average value size: 500 bytes, average key size: 50 bytes\n- Items per node: 64GB / 550 bytes = ~116M items per node\n- Total items: 11.6B cached items across the cluster\n- Read QPS: 10M/sec across cluster = 100K/sec per node\n- Write QPS: 1M/sec across cluster = 10K/sec per node (10:1 read-to-write)\n- Network bandwidth per node: 100K * 500B = 50MB/s read + 10K * 500B = 5MB/s write = 55MB/s\n- Cache hit ratio target: > 95%\n- Memory overhead per item: key (50B) + value (500B) + metadata (56B: pointers, TTL, flags) = 606B total -> 91% efficiency`,
    examples: `**Capacity Estimation Walkthrough:**\n\nStep 1 — Memory Layout per Node:\n- 64GB total RAM, 60GB usable (4GB for OS, hash table overhead)\n- Slab classes: 16 size classes from 64B to 1MB (powers of 2 with intermediate steps)\n- Hash table: 116M items * 8B pointer = ~928MB (< 2% of total memory)\n- LRU list pointers: 116M * 16B (prev + next) = ~1.86GB\n- Net data capacity: ~57GB for actual key-value data\n\nStep 2 — Consistent Hashing:\n- 100 physical nodes * 150 virtual nodes = 15,000 points on hash ring\n- Adding 1 node: 150 new virtual nodes absorb ~1% of keyspace from existing nodes\n- With 15,000 virtual nodes, std deviation of load per node: ~2.6%\n- Without virtual nodes (100 points): std deviation would be ~10%\n\nStep 3 — API Design:\n\`\`\`\n// Client Library API\nclass CacheClient {\n  constructor(servers: string[])   // list of host:port\n  get(key: string): Buffer | null\n  set(key: string, value: Buffer, ttl?: number): boolean\n  delete(key: string): boolean\n  getMulti(keys: string[]): Map<string, Buffer>  // batch get\n  incr(key: string, delta: number): number       // atomic increment\n  decr(key: string, delta: number): number       // atomic decrement\n}\n\n// Wire Protocol (text-based, like Memcached):\n// SET <key> <flags> <exptime> <bytes>\\r\\n<data>\\r\\n\n// GET <key>\\r\\n\n// VALUE <key> <flags> <bytes>\\r\\n<data>\\r\\nEND\\r\\n\n// DELETE <key>\\r\\n\n\`\`\`\n\nStep 4 — Cache Stampede Scenario:\n- A popular key expires (e.g., homepage data cached for 60s)\n- 10,000 concurrent requests arrive for this key within 100ms\n- Without protection: all 10,000 hit the database simultaneously\n- With mutex protection: 1 request fetches from DB, 9,999 wait ~50ms for cache refill\n- With probabilistic early refresh: cache is refreshed before TTL expires, avoiding the thundering herd entirely`,
    intuition: `A distributed cache is a partitioned in-memory hash table that trades durability for speed. It sits between the application and the database, serving as a shock absorber that handles the vast majority of read traffic. The key insight is that most applications have heavily skewed access patterns (Zipf distribution) — a small fraction of data accounts for the majority of reads, making caching extremely effective.\n\nThe LRU (Least Recently Used) eviction policy works because of temporal locality: data accessed recently is likely to be accessed again soon. By maintaining a doubly-linked list ordered by access time (most recent at head, least recent at tail), eviction becomes O(1) — just remove the tail. Combined with a hash map for O(1) lookups, the entire LRU cache operates in constant time for all operations.\n\nConsistent hashing is what makes the cache distributed. Each cache node is responsible for a range of the hash space. When a node fails, only its keys are redistributed to the next node on the ring — not the entire cache. Virtual nodes (multiple positions per physical node) ensure even distribution. Without them, adding a node would only relieve one neighbor; with 150 virtual nodes, it absorbs keys from many neighbors evenly.\n\nThe most dangerous failure mode is the cache stampede (also called thundering herd). When a popular key expires, thousands of concurrent requests simultaneously miss the cache and hit the database. The database, which was happily serving 100 QPS while the cache handled the other 99,900, suddenly gets 100,000 QPS and collapses. Mutex-based protection (only one request fetches while others wait) and probabilistic early refresh (refresh before TTL expires) are the two complementary defenses.`,
    approach: `**Architecture Overview:**\n\n**1. Client Library (Fat Client)**\n- Implements consistent hashing with virtual nodes locally\n- No central coordinator — the client directly computes which cache node to contact\n- Connection pooling: maintains persistent TCP connections to all cache nodes\n- Supports pipelining: batch multiple operations over a single connection\n- Failover: on node failure, marks node as down and redistributes keys to next node on ring\n- Serialization: client handles serialization/deserialization of application objects\n\n**2. Cache Node — Hash Table**\n- Open-addressing or chained hash table mapping keys to value pointers\n- Load factor maintained at 0.75 — resizing doubles the table\n- Lock striping: hash table divided into segments, each with its own lock for concurrent access\n- Hash function: MurmurHash3 for uniform distribution and speed\n\n**3. Cache Node — LRU Doubly-Linked List**\n- All items are linked in a doubly-linked list ordered by access time\n- GET: move accessed item to head of list — O(1)\n- SET: insert at head — O(1)\n- Eviction: remove tail of list — O(1)\n- Each item has prev/next pointers (16 bytes overhead)\n\n**4. Cache Node — Slab Allocator**\n- Memory pre-allocated into pages (1MB each)\n- Pages assigned to slab classes (size buckets: 64B, 128B, 256B, 512B, 1KB, ..., 1MB)\n- Each slab class manages its own pool of fixed-size slots\n- Eliminates fragmentation: items always stored in the smallest fitting slab class\n- Trade-off: some internal fragmentation (a 65B item uses a 128B slot = 49% waste for that item)\n\n**5. TTL Manager**\n- Lazy expiration: check TTL on every GET; if expired, treat as miss and delete\n- Background sweep: periodic scan deletes expired items (1% of items per second)\n- Lazy + background hybrid avoids both the cost of eager expiration and the risk of serving stale data\n\n**Cache Stampede Protection (Mutex Pattern):**\n1. Request arrives for key X, cache miss\n2. Try to acquire lock for key X (SET lock:X 1 NX EX 10 — set if not exists, 10s TTL)\n3. If lock acquired: fetch from database, SET result in cache, release lock\n4. If lock not acquired: another request is already fetching — wait 50ms and retry GET\n5. Alternative: probabilistic early refresh — each GET extends the TTL if it is within a "refresh window" (e.g., last 10% of TTL), randomly triggering one request to refresh the cache before actual expiration\n\n**Data Flow — Cache Read:**\n1. Application calls cacheClient.get(key)\n2. Client hashes key -> finds responsible cache node on hash ring\n3. Client sends GET command over persistent TCP connection to that node\n4. Cache node looks up key in hash table -> follows pointer to value\n5. If found and not expired: move to LRU head, return value\n6. If not found or expired: return miss\n7. On miss: application fetches from database, calls cacheClient.set(key, value, ttl)\n\n**Data Flow — Cache Write:**\n1. Application calls cacheClient.set(key, value, 300)\n2. Client hashes key -> finds cache node\n3. Cache node: find appropriate slab class for the value size\n4. If slab has free slots: allocate slot, store value\n5. If slab is full: evict LRU tail item from this slab class to free a slot\n6. Insert key into hash table pointing to the slab slot\n7. Insert item at LRU list head\n8. Set TTL = now + 300 seconds`,
    code: `// LRU Cache with O(1) Operations, Consistent Hashing Client, and Stampede Protection

class LRUNode {
  constructor(key, value, ttl = 0) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : 0;
    this.size = key.length + (typeof value === 'string' ? value.length : JSON.stringify(value).length);
  }
  isExpired() { return this.expiresAt > 0 && Date.now() > this.expiresAt; }
}

class LRUCache {
  constructor(maxItems = 1000, maxMemoryBytes = 64 * 1024 * 1024) {
    this.maxItems = maxItems;
    this.maxMemory = maxMemoryBytes;
    this.currentMemory = 0;
    this.map = new Map();         // key -> LRUNode
    this.head = new LRUNode('', ''); // sentinel head (most recent)
    this.tail = new LRUNode('', ''); // sentinel tail (least recent)
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.stats = { hits: 0, misses: 0, evictions: 0, sets: 0 };
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  _addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addToHead(node);
  }

  _evictTail() {
    const victim = this.tail.prev;
    if (victim === this.head) return null;
    this._removeNode(victim);
    this.map.delete(victim.key);
    this.currentMemory -= victim.size;
    this.stats.evictions++;
    return victim.key;
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) { this.stats.misses++; return null; }
    if (node.isExpired()) {
      this._removeNode(node);
      this.map.delete(key);
      this.currentMemory -= node.size;
      this.stats.misses++;
      return null;
    }
    this._moveToHead(node);
    this.stats.hits++;
    return node.value;
  }

  set(key, value, ttl = 0) {
    this.stats.sets++;
    const existingNode = this.map.get(key);
    if (existingNode) {
      this.currentMemory -= existingNode.size;
      existingNode.value = value;
      existingNode.expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : 0;
      existingNode.size = key.length + (typeof value === 'string' ? value.length : JSON.stringify(value).length);
      this.currentMemory += existingNode.size;
      this._moveToHead(existingNode);
      return true;
    }

    const node = new LRUNode(key, value, ttl);
    while (this.map.size >= this.maxItems || this.currentMemory + node.size > this.maxMemory) {
      if (this.tail.prev === this.head) break;
      this._evictTail();
    }

    this.map.set(key, node);
    this._addToHead(node);
    this.currentMemory += node.size;
    return true;
  }

  delete(key) {
    const node = this.map.get(key);
    if (!node) return false;
    this._removeNode(node);
    this.map.delete(key);
    this.currentMemory -= node.size;
    return true;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return { ...this.stats, items: this.map.size, memoryUsed: this.currentMemory,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 10000) / 100 + '%' : 'N/A' };
  }

  // Background TTL cleanup — run periodically
  cleanupExpired(sampleSize = 100) {
    let cleaned = 0;
    const keys = [...this.map.keys()];
    const sample = keys.sort(() => Math.random() - 0.5).slice(0, sampleSize);
    for (const key of sample) {
      const node = this.map.get(key);
      if (node && node.isExpired()) {
        this._removeNode(node);
        this.map.delete(key);
        this.currentMemory -= node.size;
        cleaned++;
      }
    }
    return cleaned;
  }
}

// Consistent Hashing Client for Distributed Cache
class CacheClient {
  constructor(nodes) {
    this.vnodeCount = 150;
    this.ring = [];          // sorted { hash, nodeId }
    this.nodeConnections = new Map(); // nodeId -> LRUCache (simulating connections)
    this.deadNodes = new Set();

    for (const node of nodes) {
      const cache = new LRUCache(50000, 64 * 1024 * 1024);
      this.nodeConnections.set(node, cache);
      for (let i = 0; i < this.vnodeCount; i++) {
        this.ring.push({ hash: this._hash(\`\${node}#\${i}\`), nodeId: node });
      }
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  _hash(key) {
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  _getNode(key) {
    const h = this._hash(key);
    for (const entry of this.ring) {
      if (entry.hash >= h && !this.deadNodes.has(entry.nodeId)) return entry.nodeId;
    }
    // Wrap around, skip dead nodes
    for (const entry of this.ring) {
      if (!this.deadNodes.has(entry.nodeId)) return entry.nodeId;
    }
    return null;
  }

  get(key) {
    const node = this._getNode(key);
    if (!node) return null;
    return this.nodeConnections.get(node).get(key);
  }

  set(key, value, ttl = 0) {
    const node = this._getNode(key);
    if (!node) return false;
    return this.nodeConnections.get(node).set(key, value, ttl);
  }

  delete(key) {
    const node = this._getNode(key);
    if (!node) return false;
    return this.nodeConnections.get(node).delete(key);
  }

  markNodeDead(nodeId) { this.deadNodes.add(nodeId); }
  markNodeAlive(nodeId) { this.deadNodes.delete(nodeId); }

  getClusterStats() {
    const stats = {};
    for (const [nodeId, cache] of this.nodeConnections) {
      stats[nodeId] = { ...cache.getStats(), alive: !this.deadNodes.has(nodeId) };
    }
    return stats;
  }
}

// Cache Stampede Protection with Mutex
class StampedeProtectedCache {
  constructor(cacheClient) {
    this.cache = cacheClient;
    this.locks = new Map();       // key -> { promise, expiresAt }
    this.earlyRefreshRatio = 0.1; // refresh in last 10% of TTL
  }

  async getOrFetch(key, fetchFn, ttl = 300) {
    // Try cache first
    const cached = this.cache.get(key);
    if (cached !== null) return { value: cached, source: 'cache' };

    // Check if someone is already fetching this key
    const existingLock = this.locks.get(key);
    if (existingLock && Date.now() < existingLock.expiresAt) {
      // Wait for the existing fetch to complete
      const value = await existingLock.promise;
      return { value, source: 'waited' };
    }

    // Acquire the fetch lock
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    this.locks.set(key, { promise, expiresAt: Date.now() + 10000 });

    try {
      const value = await fetchFn();
      this.cache.set(key, value, ttl);
      resolve(value);
      return { value, source: 'fetched' };
    } finally {
      this.locks.delete(key);
    }
  }
}

// --- Demo ---
const client = new CacheClient(['cache-01', 'cache-02', 'cache-03']);
for (let i = 0; i < 1000; i++) {
  client.set(\`user:\${i}\`, \`{"name":"User\${i}","score":\${Math.random()}}\`, 300);
}
console.log('Cluster stats:', client.getClusterStats());

// Simulate node failure
client.markNodeDead('cache-02');
console.log('After cache-02 failure, get user:42:', client.get('user:42'));
console.log('Keys redistributed to alive nodes');

// Stampede protection demo
const protectedCache = new StampedeProtectedCache(client);
async function simulateStampede() {
  const fetcher = () => new Promise(r => setTimeout(() => r('expensive-db-result'), 100));
  const results = await Promise.all([
    protectedCache.getOrFetch('hot-key', fetcher, 60),
    protectedCache.getOrFetch('hot-key', fetcher, 60),
    protectedCache.getOrFetch('hot-key', fetcher, 60),
  ]);
  console.log('Stampede results:', results.map(r => r.source));
  // Expected: ['fetched', 'waited', 'waited'] — only 1 DB call
}
simulateStampede();`,
    jsCode: `// Slab Allocator, TTL Manager, and Cache Warming Strategy

class SlabAllocator {
  constructor(totalMemoryMB = 64) {
    this.totalMemory = totalMemoryMB * 1024 * 1024;
    this.pageSize = 1024 * 1024; // 1MB pages
    this.totalPages = Math.floor(this.totalMemory / this.pageSize);
    // Slab classes: powers of 2 from 64B to 1MB
    this.slabClasses = [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
                        32768, 65536, 131072, 262144, 524288, 1048576];
    this.slabs = new Map(); // slabSize -> { pages[], freeSlots[], usedSlots, totalSlots }
    this.allocatedPages = 0;

    for (const size of this.slabClasses) {
      this.slabs.set(size, { pages: [], freeSlots: [], usedSlots: 0, totalSlots: 0, itemSize: size });
    }
  }

  getSlabClass(itemSize) {
    for (const size of this.slabClasses) {
      if (size >= itemSize) return size;
    }
    return null; // item too large
  }

  allocate(itemSize) {
    const slabSize = this.getSlabClass(itemSize);
    if (!slabSize) return { error: 'Item too large', maxSize: this.slabClasses[this.slabClasses.length - 1] };

    const slab = this.slabs.get(slabSize);

    if (slab.freeSlots.length === 0) {
      // Need a new page for this slab class
      if (this.allocatedPages >= this.totalPages) {
        return { error: 'Out of memory', allocated: this.allocatedPages, total: this.totalPages };
      }
      const slotsPerPage = Math.floor(this.pageSize / slabSize);
      const pageId = this.allocatedPages++;
      slab.pages.push(pageId);
      for (let i = 0; i < slotsPerPage; i++) {
        slab.freeSlots.push({ pageId, slotIndex: i });
      }
      slab.totalSlots += slotsPerPage;
    }

    const slot = slab.freeSlots.pop();
    slab.usedSlots++;
    return {
      slabSize, slot, wasteBytes: slabSize - itemSize,
      wastePercent: Math.round(((slabSize - itemSize) / slabSize) * 100),
    };
  }

  free(slabSize, slot) {
    const slab = this.slabs.get(slabSize);
    if (!slab) return false;
    slab.freeSlots.push(slot);
    slab.usedSlots--;
    return true;
  }

  getStats() {
    const stats = [];
    for (const [size, slab] of this.slabs) {
      if (slab.totalSlots > 0) {
        stats.push({
          slabSize: size, pages: slab.pages.length,
          totalSlots: slab.totalSlots, usedSlots: slab.usedSlots,
          freeSlots: slab.freeSlots.length,
          utilization: Math.round((slab.usedSlots / slab.totalSlots) * 100) + '%',
        });
      }
    }
    return { allocatedPages: this.allocatedPages, totalPages: this.totalPages,
      memoryUsed: Math.round((this.allocatedPages / this.totalPages) * 100) + '%', slabs: stats };
  }
}

// TTL Manager with Lazy + Active Expiration
class TTLManager {
  constructor() {
    this.items = new Map();       // key -> { expiresAt, bucket }
    this.buckets = new Map();     // bucketId (second) -> Set of keys
    this.cleanupInterval = null;
  }

  setTTL(key, ttlSeconds) {
    if (ttlSeconds <= 0) return;
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    const bucketId = expiresAt;

    // Remove from old bucket if exists
    const old = this.items.get(key);
    if (old && this.buckets.has(old.bucket)) {
      this.buckets.get(old.bucket).delete(key);
    }

    this.items.set(key, { expiresAt, bucket: bucketId });
    if (!this.buckets.has(bucketId)) this.buckets.set(bucketId, new Set());
    this.buckets.get(bucketId).add(key);
  }

  isExpired(key) {
    const item = this.items.get(key);
    if (!item) return false;
    return Math.floor(Date.now() / 1000) >= item.expiresAt;
  }

  // Active expiration: clean up expired buckets
  cleanupExpired() {
    const now = Math.floor(Date.now() / 1000);
    const expiredKeys = [];

    for (const [bucketId, keys] of this.buckets) {
      if (bucketId <= now) {
        for (const key of keys) expiredKeys.push(key);
        this.buckets.delete(bucketId);
      }
    }

    for (const key of expiredKeys) this.items.delete(key);
    return expiredKeys;
  }

  startBackgroundCleanup(intervalMs = 1000) {
    this.cleanupInterval = setInterval(() => {
      const expired = this.cleanupExpired();
      if (expired.length > 0) {
        // In production, these keys would be deleted from the actual cache
      }
    }, intervalMs);
  }

  stop() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }

  getStats() {
    return { trackedKeys: this.items.size, activeBuckets: this.buckets.size };
  }
}

// Cache Warming Strategy
class CacheWarmer {
  constructor(cacheClient, dbClient) {
    this.cache = cacheClient;
    this.db = dbClient;
  }

  // Warm cache from access logs before node goes live
  async warmFromAccessLog(accessLog, maxKeys = 10000) {
    // Count access frequency per key
    const frequency = new Map();
    for (const entry of accessLog) {
      frequency.set(entry.key, (frequency.get(entry.key) || 0) + 1);
    }

    // Sort by frequency descending
    const sorted = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
    const topKeys = sorted.slice(0, maxKeys);

    let warmed = 0, failed = 0;
    for (const [key, freq] of topKeys) {
      try {
        const value = await this.db.get(key);
        if (value !== null) {
          // TTL proportional to popularity
          const ttl = Math.min(300 + freq * 10, 3600);
          this.cache.set(key, value, ttl);
          warmed++;
        }
      } catch {
        failed++;
      }
    }

    return { warmed, failed, totalCandidates: topKeys.length,
      topKeysSample: topKeys.slice(0, 5).map(([k, f]) => ({ key: k, frequency: f })) };
  }

  // Progressive warm-up: add keys in batches to avoid overwhelming the DB
  async progressiveWarm(keyGenerator, batchSize = 100, delayBetweenBatchesMs = 100) {
    let batch = [];
    let totalWarmed = 0;

    for await (const key of keyGenerator) {
      batch.push(key);
      if (batch.length >= batchSize) {
        const values = await Promise.all(batch.map(k => this.db.get(k).catch(() => null)));
        for (let i = 0; i < batch.length; i++) {
          if (values[i] !== null) { this.cache.set(batch[i], values[i], 300); totalWarmed++; }
        }
        batch = [];
        await new Promise(r => setTimeout(r, delayBetweenBatchesMs));
      }
    }

    // Process remaining
    if (batch.length > 0) {
      const values = await Promise.all(batch.map(k => this.db.get(k).catch(() => null)));
      for (let i = 0; i < batch.length; i++) {
        if (values[i] !== null) { this.cache.set(batch[i], values[i], 300); totalWarmed++; }
      }
    }
    return { totalWarmed };
  }
}

// --- Demo ---
const slab = new SlabAllocator(64);
console.log('Allocate 100B item:', slab.allocate(100));
console.log('Allocate 500B item:', slab.allocate(500));
console.log('Allocate 5000B item:', slab.allocate(5000));
for (let i = 0; i < 1000; i++) slab.allocate(200);
console.log('Slab stats:', JSON.stringify(slab.getStats(), null, 2));

const ttl = new TTLManager();
ttl.setTTL('key1', 1); // expires in 1 second
ttl.setTTL('key2', 300);
console.log('key1 expired?', ttl.isExpired('key1'));
console.log('TTL stats:', ttl.getStats());

// Simulate cache warming
const mockDB = { get: (key) => Promise.resolve(\`value-for-\${key}\`) };
const mockCache = { set: (k, v, ttl) => true };
const warmer = new CacheWarmer(mockCache, mockDB);
const accessLog = Array.from({ length: 1000 }, (_, i) => ({
  key: \`product:\${Math.floor(Math.pow(Math.random(), 2) * 100)}\`, // Zipf-like distribution
}));
warmer.warmFromAccessLog(accessLog, 50).then(r => console.log('Warm result:', r));`,
    explanation: `**Scaling Analysis:**\n\n1. **Horizontal Scaling:**\n   - Add cache nodes to increase total capacity\n   - Consistent hashing with 150 virtual nodes per physical node ensures ~1% of keys move when adding/removing a node\n   - No central coordinator — client library handles routing directly\n   - Adding a node: keys gradually migrate as they are accessed (lazy migration) or proactively via background transfer\n\n2. **Node-Level Performance:**\n   - Lock striping: hash table divided into 64 segments, each with its own mutex — enables 64x concurrent access\n   - Slab allocator: eliminates memory fragmentation; pre-allocated fixed-size slots mean no malloc/free calls per operation\n   - Zero-copy: use sendfile() or io_uring for large value transfers to avoid copying between kernel and user space\n   - Event-driven I/O: epoll/kqueue handles 100K+ concurrent connections per node with few threads\n\n3. **Client-Side Optimization:**\n   - Connection pooling: reuse TCP connections instead of establishing new ones per request\n   - Pipelining: send multiple GET/SET commands over one connection without waiting for individual responses\n   - getMulti: batch multiple GETs into a single round-trip per cache node (group keys by node, parallel fetch)\n   - Local in-process cache (L1): keep a small LRU cache in the application process for ultra-hot keys\n\n**Failure Modes and Mitigations:**\n- **Single node failure:** Consistent hashing redirects that node's keys to the next node on the ring. The next node experiences a temporary increase in cache misses (cold cache for those keys). These misses hit the database, which must be provisioned to handle the temporary spike. Cache warming from access logs reduces the impact.\n- **Cache stampede / thundering herd:** A popular key expires and thousands of requests simultaneously hit the database. Mitigated by: (1) mutex pattern — only one request fetches from DB while others wait, (2) probabilistic early refresh — refresh before TTL expires so the cache is never actually empty, (3) stale-while-revalidate — serve the expired value while refreshing in the background.\n- **Hot key:** A single key receives disproportionate traffic (e.g., celebrity profile during an event). The assigned cache node becomes a bottleneck. Solutions: (1) replicate hot keys to multiple nodes, (2) client-side L1 cache, (3) key-splitting (user:123:shard1, user:123:shard2) to distribute across nodes.\n- **Memory exhaustion:** All slab classes are full, every SET triggers an eviction. Monitor the eviction rate — if consistently high, the cache is undersized. Add nodes or increase memory per node.\n\n**Monitoring Strategy:**\n- Track: hit rate per node and globally (target >95%), latency p50/p95/p99, eviction rate, connection count, memory utilization per slab class\n- Alert on: hit rate drops below 90%, p99 latency > 5ms, eviction rate > 1000/sec per node, any node unreachable\n- Dashboard: cluster topology (ring visualization), per-node load distribution, slab utilization breakdown\n\n**Key Trade-offs:**\n- **No replication (Memcached style) vs. replicated cache (Redis Cluster style):** No replication means a node failure loses that entire shard's cached data — simple and memory-efficient but causes a temporary cache miss storm. Replication doubles (or triples) memory usage but survives node failures without cache misses. Choice depends on whether the database can handle temporary miss spikes.\n- **LRU vs. LFU eviction:** LRU evicts the least recently accessed item, which is great for temporal locality but can be fooled by scans (a one-time batch job accessing many keys pushes out frequently used items). LFU (Least Frequently Used) is better for workloads with stable popularity but slow to adapt to changing patterns. Redis 4.0+ uses an approximation of LFU (LFU with decay) that balances both.\n- **Slab allocator vs. jemalloc/general allocator:** Slab allocator eliminates fragmentation but wastes some memory due to rounding up to the nearest slab class. A general allocator like jemalloc is more space-efficient but may fragment over time with varied allocation patterns. Memcached uses slab allocation; Redis uses jemalloc.\n- **Eager vs. lazy TTL expiration:** Eager expiration (delete immediately at expiry) frees memory promptly but requires a timer per item (expensive at 100M items). Lazy expiration (check on access) never wastes CPU on items that are never requested again but delays memory reclamation. The hybrid approach (lazy check on access + periodic random sampling) is the practical choice used by both Memcached and Redis.`,
    timeComplexity: `**Capacity and Performance Characteristics:**\n- GET latency: < 1ms p99 within datacenter (hash lookup + pointer follow + network RTT)\n- SET latency: < 1ms p99 (slab allocation + hash table insert + LRU update + network RTT)\n- DELETE latency: < 1ms p99 (hash table remove + LRU remove + slab free)\n- Consistent hash ring lookup: O(log V) where V = total virtual nodes (binary search), typically < 0.01ms\n- LRU operations: all O(1) — move-to-head, evict-tail, insert-at-head\n- Hash table operations: O(1) amortized with good hash function (MurmurHash3)\n- Background TTL cleanup: O(S) where S is sample size per sweep (typically 20-100 items)\n- Throughput per node: 100K-200K operations/sec (memory and CPU bound, not disk)\n- getMulti: latency = max(per-node latency) since requests to different nodes run in parallel`,
    spaceComplexity: `**Storage and Memory Requirements:**\n- Total cluster memory: 100 nodes * 64GB = 6.4TB\n- Per-node breakdown:\n  - Data storage: ~57GB (90% of usable memory)\n  - Hash table: ~928MB for 116M items (8B pointers)\n  - LRU list pointers: ~1.86GB (16B per item: prev + next)\n  - Slab metadata: ~10MB per slab class * 16 classes = 160MB\n  - OS and runtime: ~4GB\n- Slab allocation overhead: 10-30% internal fragmentation depending on value size distribution\n- Client library memory: ~5MB per application instance (hash ring + connection pool)\n- Connection overhead: ~10KB per TCP connection * 10K connections per node = 100MB\n- Hot key replication: for top 100 hot keys replicated to 5 extra nodes each = negligible storage, but reduces load on primary node by 5x`,
    hints: [
      `The LRU cache implementation is the most commonly asked data structure question in system design interviews. The key is combining a HashMap (for O(1) key lookup) with a doubly-linked list (for O(1) move-to-head and evict-tail). Always use sentinel head and tail nodes to simplify edge cases — you never need to check for null in insert/remove operations. The sentinel pattern eliminates 90% of the bugs in linked list code.`,
      `Consistent hashing with virtual nodes is the second most important concept. Without virtual nodes, adding a server only relieves ONE neighbor, creating imbalanced load. With 150 virtual nodes per physical node, adding a server absorbs keys from ~150 ranges distributed around the ring, creating a smooth rebalancing. The standard deviation of keys per node drops from ~10% (no virtual nodes) to ~2.6% (150 virtual nodes). Always explain this quantitative difference in the interview.`,
      `Cache stampede (thundering herd) protection is the most important production concern. The mutex pattern works: when a key is missing, acquire a lock (with TTL to prevent deadlocks), fetch from DB, populate cache, release lock. Other concurrent requesters for the same key wait briefly and retry. A more elegant solution is probabilistic early refresh: when a GET finds a key with < 10% remaining TTL, it has a random chance of triggering a background refresh while returning the current (soon-to-expire) value. This prevents the cache from ever being empty for hot keys.`,
      `The slab allocator is what makes Memcached memory-efficient. Pre-allocating memory in fixed-size classes (64B, 128B, 256B, ..., 1MB) eliminates fragmentation that would otherwise cause "memory is full but cannot allocate" failures. The trade-off is internal fragmentation: a 65B value stored in a 128B slab wastes 49% of the slot. In practice, most values cluster around a few sizes, so waste is typically 10-20%. The key interview insight is explaining WHY general-purpose allocators fail for caches (long-running processes with varied allocation patterns fragment badly over time).`,
      `For the interview, always discuss the cache-aside pattern vs. read-through/write-through. Cache-aside: the application checks the cache, on miss fetches from DB and populates cache. The application manages cache consistency. Read-through: the cache itself fetches from DB on miss. Write-through: the cache writes to DB on every SET. Write-behind: the cache batches writes to DB asynchronously. Cache-aside is the most common (and what Memcached supports), but discuss when the others are appropriate.`,
      `Node failure handling deserves detailed discussion. When a cache node dies: (1) Consistent hashing ensures only ~1/N of total keys are affected. (2) Those keys' requests become cache misses hitting the database. (3) If the database cannot handle the sudden spike, implement a "cache miss rate limiter" that queues excess DB requests. (4) A warm-up strategy pre-populates the replacement node using access logs from the previous hour. (5) Consider a "buddy" system where each node has a designated failover partner that keeps a partial copy of hot keys.`,
      `Common pitfall: not discussing the network as a bottleneck. With 100K operations/sec per node and 500B average values, each node handles 50MB/s of data transfer. This is modest for a 10Gbps NIC. But during bulk warming or node failure redistribution, traffic can spike to 1GB/s+. Always mention: (1) jumbo frames to reduce packet overhead, (2) kernel bypass (DPDK/io_uring) for ultra-low latency, (3) compression for large values (LZ4 adds < 0.1ms but can reduce value sizes by 60-80%).`,
      `Another pitfall: treating the cache as a source of truth. A cache is ephemeral — any item can be evicted or the node can crash. The application must ALWAYS handle cache misses gracefully by falling back to the database. Never store data ONLY in the cache unless it is truly disposable. For semi-persistent data (like session tokens), use a replicated cache (Redis with AOF persistence) rather than a pure in-memory cache (Memcached). Clearly distinguish these two use cases in the interview.`,
    ],
  },
];
