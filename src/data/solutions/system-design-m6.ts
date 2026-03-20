import { ProblemSolution } from './types';

export const solutionsM6: ProblemSolution[] = [
  {
    id: 9025,
    description: `Design a Distributed Message Queue (Kafka-like)\n\n**Functional Requirements:**\n- Producers publish messages to named topics\n- Topics are divided into partitions for parallelism\n- Consumers subscribe to topics via consumer groups; each partition is assigned to exactly one consumer in a group\n- Messages within a partition are strictly ordered by sequential offsets\n- Support at-least-once delivery semantics with consumer-driven offset commits\n- Consumers can replay messages by seeking to any committed offset\n- Configurable retention by time (e.g., 7 days) or size (e.g., 1 TB per partition)\n\n**Non-Functional Requirements:**\n- Throughput: Sustain 2 million messages/sec writes and 5 million messages/sec reads across the cluster\n- Latency: p99 publish latency < 10 ms; p99 consume latency < 5 ms\n- Durability: Zero message loss for acknowledged writes (replication factor >= 3)\n- Availability: Tolerate loss of any single broker without downtime\n- Scalability: Add brokers and partitions online without rebalancing existing data\n\n**Capacity Estimation:**\n- Average message size: 1 KB\n- Write throughput: 2M msgs/sec x 1 KB = 2 GB/sec raw ingestion\n- Replication factor 3: 6 GB/sec total disk write bandwidth\n- 7-day retention: 2 GB/sec x 86400 x 7 = ~1.2 PB raw storage (before replication = 3.6 PB)\n- Partition count: 50,000 partitions across 200 brokers (250 partitions/broker)\n- Each broker: 18 TB SSD, 64 GB RAM (page cache), 10 Gbps NIC`,
    examples: `**Capacity Walkthrough:**\nSuppose we have 10,000 microservices each producing 200 msgs/sec at 1 KB average:\n- Total ingestion = 10,000 x 200 = 2M msgs/sec = 2 GB/sec\n- With replication factor 3, each message is written to 3 brokers = 6 GB/sec cluster-wide\n- 7-day retention: 2 GB/sec x 604,800 sec = 1.21 PB\n- With 200 brokers, each stores 1.21 PB / 200 = ~6 TB of data per broker (before replicas)\n- Each broker handles 2M / 200 = 10,000 msgs/sec writes + followers fetching = ~30,000 msgs/sec total\n\n**API Design:**\n\`\`\`\nPOST /topics/{topic}/messages\n  Body: { key: "user-123", value: "...", headers: {...} }\n  Response: { partition: 7, offset: 984321 }\n\nGET /topics/{topic}/partitions/{partition}/messages?offset=984000&limit=100\n  Response: { messages: [...], nextOffset: 984100 }\n\nPOST /consumers/{group}/subscribe\n  Body: { topics: ["orders", "payments"] }\n  Response: { memberId: "m-abc", assignments: [{topic, partition}...] }\n\nPOST /consumers/{group}/members/{memberId}/offsets\n  Body: { offsets: [{topic, partition, offset}...] }\n\`\`\``,
    intuition: `Think of a distributed message queue as a distributed commit log — essentially an append-only linked list of immutable records, split into independent partitions that can live on different machines.\n\nThe key mental model is a **library of numbered notebooks**: each topic is a shelf, each partition is a notebook on that shelf. Writers only ever append to the last page. Readers each have their own bookmark (offset) so they can read at their own pace, go back, or skip ahead. Multiple reading clubs (consumer groups) each get their own set of bookmarks.\n\nThe critical insight is **sequential I/O plus zero-copy**: by only ever appending to the end of a file and reading sequentially, you turn random disk I/O into sequential I/O, which on modern SSDs can saturate 500 MB/s per drive. Zero-copy (sendfile syscall) means data goes from disk page cache directly to the NIC buffer without ever entering user space — this is why Kafka can sustain millions of messages/sec per broker.\n\nAnother key insight is **consumer-driven pull**: unlike traditional message queues where the broker pushes messages, consumers pull at their own rate. This naturally handles back-pressure — a slow consumer just falls behind rather than overwhelming the broker.`,
    approach: `**Architecture Overview:**\n\n1. **Broker Cluster**: Stateless message servers. Each broker owns a set of partition replicas. One broker is elected as the Controller via ZooKeeper/KRaft for cluster metadata management.\n\n2. **Partition Log**: Each partition is an append-only log stored as a sequence of segment files (default 1 GB each). Each segment has an index file mapping offsets to physical file positions. Old segments are deleted or compacted based on retention policy.\n\n3. **Producer Flow**: Producer hashes the message key to determine the target partition (or round-robin if no key). The producer sends a batch of messages to the partition leader. The leader appends to its log and waits for ISR (in-sync replicas) acknowledgment before responding.\n\n4. **Consumer Group Coordinator**: One broker serves as the group coordinator for each consumer group. It manages: (a) member registration via heartbeats, (b) partition assignment using strategies like Range or RoundRobin, (c) offset storage in a compacted internal topic (__consumer_offsets), (d) rebalancing when members join/leave.\n\n5. **Replication Manager**: Each partition has one leader and N-1 followers. Followers continuously fetch from the leader. The ISR (In-Sync Replica) set tracks followers that are caught up within a configurable lag threshold. Only ISR members can be elected leader. If a follower falls out of ISR, it is removed and must catch up before rejoining.\n\n6. **Zero-Copy Transfer**: When a consumer fetches messages, the broker uses the sendfile() syscall to transfer data directly from the OS page cache to the network socket, bypassing user-space memory copies.\n\n**Database / Storage:**\n- Segment files: Binary log files on local SSD (not a traditional DB)\n- Index files: Sparse offset-to-position mappings (memory-mapped)\n- __consumer_offsets topic: Compacted topic storing latest offset per (group, topic, partition)\n- Cluster metadata: KRaft (Raft-based) or ZooKeeper for broker list, topic configs, ISR sets\n\n**Data Flow for Produce:**\nProducer -> Leader Broker -> Append to segment file -> Replicate to ISR followers -> All ISR ack -> Respond to producer\n\n**Data Flow for Consume:**\nConsumer -> Send fetch(offset, maxBytes) to leader -> Leader reads from page cache (or disk) -> sendfile() to consumer -> Consumer processes -> Commit offset`,
    code: `// ============================================================
// Distributed Message Queue: Core Component Implementations
// ============================================================

class SegmentFile {
  constructor(baseOffset, maxSize = 1024 * 1024 * 1024) {
    this.baseOffset = baseOffset;
    this.maxSize = maxSize;
    this.data = [];
    this.index = new Map(); // offset -> position in data array
    this.currentSize = 0;
    this.nextOffset = baseOffset;
  }

  append(message) {
    const offset = this.nextOffset++;
    const record = { offset, timestamp: Date.now(), key: message.key, value: message.value };
    const recordSize = JSON.stringify(record).length;
    this.index.set(offset, this.data.length);
    this.data.push(record);
    this.currentSize += recordSize;
    return { offset, isFull: this.currentSize >= this.maxSize };
  }

  read(offset, maxRecords = 100) {
    const pos = this.index.get(offset);
    if (pos === undefined) return [];
    return this.data.slice(pos, pos + maxRecords);
  }

  containsOffset(offset) {
    return offset >= this.baseOffset && offset < this.nextOffset;
  }
}

class PartitionLog {
  constructor(topic, partitionId, retentionMs = 7 * 24 * 3600 * 1000) {
    this.topic = topic;
    this.partitionId = partitionId;
    this.retentionMs = retentionMs;
    this.segments = [new SegmentFile(0)];
    this.highWatermark = 0; // last committed offset (replicated to all ISR)
  }

  append(message) {
    let activeSegment = this.segments[this.segments.length - 1];
    const { offset, isFull } = activeSegment.append(message);
    if (isFull) {
      const newSegment = new SegmentFile(activeSegment.nextOffset);
      this.segments.push(newSegment);
    }
    return offset;
  }

  read(offset, maxRecords = 100) {
    const safeMax = Math.min(offset + maxRecords, this.highWatermark + 1);
    for (let i = this.segments.length - 1; i >= 0; i--) {
      if (this.segments[i].containsOffset(offset)) {
        const records = this.segments[i].read(offset, safeMax - offset);
        return records.filter(r => r.offset <= this.highWatermark);
      }
    }
    return [];
  }

  advanceHighWatermark(offset) {
    this.highWatermark = Math.max(this.highWatermark, offset);
  }

  enforceRetention() {
    const cutoff = Date.now() - this.retentionMs;
    while (this.segments.length > 1) {
      const oldest = this.segments[0];
      const lastRecord = oldest.data[oldest.data.length - 1];
      if (lastRecord && lastRecord.timestamp < cutoff) {
        this.segments.shift();
      } else break;
    }
  }

  getLogEndOffset() {
    const active = this.segments[this.segments.length - 1];
    return active.nextOffset;
  }
}

class ConsumerGroup {
  constructor(groupId) {
    this.groupId = groupId;
    this.members = new Map(); // memberId -> { topics, lastHeartbeat }
    this.assignments = new Map(); // memberId -> [{topic, partition}]
    this.committedOffsets = new Map(); // "topic-partition" -> offset
    this.generation = 0;
  }

  join(memberId, subscribedTopics) {
    this.members.set(memberId, { topics: subscribedTopics, lastHeartbeat: Date.now() });
    return this.generation;
  }

  leave(memberId) {
    this.members.delete(memberId);
    this.assignments.delete(memberId);
  }

  rebalance(topicPartitions) {
    this.generation++;
    this.assignments.clear();
    const memberIds = [...this.members.keys()];
    if (memberIds.length === 0) return;

    // Round-robin assignment strategy
    const allPartitions = [];
    for (const [topic, count] of Object.entries(topicPartitions)) {
      const subscribedMembers = memberIds.filter(
        m => this.members.get(m).topics.includes(topic)
      );
      if (subscribedMembers.length === 0) continue;
      for (let p = 0; p < count; p++) {
        allPartitions.push({ topic, partition: p, candidates: subscribedMembers });
      }
    }
    for (const memberId of memberIds) {
      this.assignments.set(memberId, []);
    }
    allPartitions.forEach((tp, idx) => {
      const assigned = tp.candidates[idx % tp.candidates.length];
      this.assignments.get(assigned).push({ topic: tp.topic, partition: tp.partition });
    });
    return { generation: this.generation, assignments: Object.fromEntries(this.assignments) };
  }

  commitOffset(topic, partition, offset) {
    this.committedOffsets.set(\`\${topic}-\${partition}\`, offset);
  }

  getCommittedOffset(topic, partition) {
    return this.committedOffsets.get(\`\${topic}-\${partition}\`) || 0;
  }

  heartbeat(memberId) {
    const member = this.members.get(memberId);
    if (!member) return false;
    member.lastHeartbeat = Date.now();
    return true;
  }

  expireMembers(sessionTimeoutMs = 10000) {
    const now = Date.now();
    let expired = false;
    for (const [memberId, info] of this.members) {
      if (now - info.lastHeartbeat > sessionTimeoutMs) {
        this.leave(memberId);
        expired = true;
      }
    }
    return expired;
  }
}

class MessageProducer {
  constructor(brokerPartitions) {
    this.partitions = brokerPartitions; // Map<"topic-partition", PartitionLog>
    this.topicPartitionCounts = new Map();
    this.roundRobinCounters = new Map();
  }

  registerTopic(topic, numPartitions) {
    this.topicPartitionCounts.set(topic, numPartitions);
    this.roundRobinCounters.set(topic, 0);
    for (let i = 0; i < numPartitions; i++) {
      this.partitions.set(\`\${topic}-\${i}\`, new PartitionLog(topic, i));
    }
  }

  send(topic, key, value) {
    const numPartitions = this.topicPartitionCounts.get(topic);
    if (!numPartitions) throw new Error(\`Topic \${topic} not found\`);

    let partition;
    if (key !== null && key !== undefined) {
      partition = this.hashKey(key) % numPartitions;
    } else {
      const counter = this.roundRobinCounters.get(topic);
      partition = counter % numPartitions;
      this.roundRobinCounters.set(topic, counter + 1);
    }

    const log = this.partitions.get(\`\${topic}-\${partition}\`);
    const offset = log.append({ key, value });
    return { topic, partition, offset };
  }

  hashKey(key) {
    let hash = 0;
    const str = String(key);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}

class ReplicationCoordinator {
  constructor() {
    this.partitionLogs = new Map(); // "topic-partition" -> { leader, followers, isr }
  }

  registerPartition(topic, partition, leader, followers) {
    const key = \`\${topic}-\${partition}\`;
    this.partitionLogs.set(key, {
      leader, followers: new Set(followers),
      isr: new Set([leader, ...followers]),
      followerOffsets: new Map(followers.map(f => [f, 0]))
    });
  }

  replicateTo(topic, partition, followerId, leaderLog) {
    const key = \`\${topic}-\${partition}\`;
    const meta = this.partitionLogs.get(key);
    if (!meta) return null;

    const followerOffset = meta.followerOffsets.get(followerId) || 0;
    const records = leaderLog.read(followerOffset, 500);
    if (records.length > 0) {
      const newOffset = records[records.length - 1].offset + 1;
      meta.followerOffsets.set(followerId, newOffset);
    }
    this.updateISR(key, meta, leaderLog.getLogEndOffset());
    return records;
  }

  updateISR(key, meta, logEndOffset) {
    const maxLag = 1000;
    for (const [followerId, offset] of meta.followerOffsets) {
      if (logEndOffset - offset > maxLag) {
        meta.isr.delete(followerId);
      } else {
        meta.isr.add(followerId);
      }
    }
    const minISROffset = Math.min(...[...meta.isr].map(id =>
      id === meta.leader ? logEndOffset : (meta.followerOffsets.get(id) || 0)
    ));
    return minISROffset;
  }

  electLeader(topic, partition) {
    const key = \`\${topic}-\${partition}\`;
    const meta = this.partitionLogs.get(key);
    if (!meta) return null;
    const candidates = [...meta.isr].filter(id => id !== meta.leader);
    if (candidates.length === 0) return null;
    meta.leader = candidates[0];
    return meta.leader;
  }
}`,
    jsCode: `// ============================================================
// Batch Producer with Linger & Compression + Fetch Session
// ============================================================

class BatchProducer {
  constructor(producer, options = {}) {
    this.producer = producer;
    this.lingerMs = options.lingerMs || 5;
    this.batchSize = options.batchSize || 16384;
    this.batches = new Map(); // "topic-partition" -> { messages: [], size: 0, timer: null }
    this.acks = options.acks || 'all'; // 0, 1, or 'all'
    this.retries = options.retries || 3;
    this.inFlightPerPartition = options.maxInFlight || 5;
    this.inFlightCounts = new Map();
  }

  async send(topic, key, value) {
    const numPartitions = this.producer.topicPartitionCounts.get(topic);
    const partition = key != null
      ? this.producer.hashKey(key) % numPartitions
      : this.producer.roundRobinCounters.get(topic) % numPartitions;

    const batchKey = \`\${topic}-\${partition}\`;
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, { messages: [], size: 0, timer: null });
    }
    const batch = this.batches.get(batchKey);
    const msgSize = JSON.stringify({ key, value }).length;

    batch.messages.push({ key, value });
    batch.size += msgSize;

    if (batch.size >= this.batchSize) {
      return this.flush(topic, partition, batchKey);
    }
    if (!batch.timer) {
      batch.timer = setTimeout(() => this.flush(topic, partition, batchKey), this.lingerMs);
    }
    return { topic, partition, status: 'batched' };
  }

  flush(topic, partition, batchKey) {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.messages.length === 0) return;

    if (batch.timer) { clearTimeout(batch.timer); batch.timer = null; }

    const messages = [...batch.messages];
    batch.messages = [];
    batch.size = 0;

    const results = [];
    for (const msg of messages) {
      let lastError = null;
      for (let attempt = 0; attempt <= this.retries; attempt++) {
        try {
          const result = this.producer.send(topic, msg.key, msg.value);
          results.push(result);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (lastError) results.push({ error: lastError.message });
    }
    return results;
  }
}

class FetchSession {
  constructor(partitionLogs, consumerGroup) {
    this.partitionLogs = partitionLogs;
    this.consumerGroup = consumerGroup;
    this.sessionId = Math.random().toString(36).slice(2);
    this.cachedPositions = new Map();
    this.maxWaitMs = 500;
    this.minBytes = 1;
    this.maxBytes = 1048576;
  }

  fetch(memberId, maxWaitMs = this.maxWaitMs) {
    const assignments = this.consumerGroup.assignments.get(memberId) || [];
    const results = {};
    let totalBytes = 0;

    for (const { topic, partition } of assignments) {
      const key = \`\${topic}-\${partition}\`;
      const log = this.partitionLogs.get(key);
      if (!log) continue;

      const committedOffset = this.consumerGroup.getCommittedOffset(topic, partition);
      const cachedPos = this.cachedPositions.get(key) || committedOffset;
      const startOffset = Math.max(cachedPos, committedOffset);

      const records = log.read(startOffset, 100);
      if (records.length > 0) {
        results[key] = records;
        const newPos = records[records.length - 1].offset + 1;
        this.cachedPositions.set(key, newPos);
        totalBytes += JSON.stringify(records).length;
      }
      if (totalBytes >= this.maxBytes) break;
    }
    return { sessionId: this.sessionId, data: results, totalBytes };
  }

  commitAndFetch(memberId, offsets) {
    for (const { topic, partition, offset } of offsets) {
      this.consumerGroup.commitOffset(topic, partition, offset);
    }
    return this.fetch(memberId);
  }
}

class PartitionRebalancer {
  static stickyAssign(members, topicPartitions, previousAssignment) {
    const allPartitions = [];
    for (const [topic, count] of Object.entries(topicPartitions)) {
      for (let p = 0; p < count; p++) allPartitions.push({ topic, partition: p });
    }

    const memberIds = [...members.keys()];
    const targetSize = Math.ceil(allPartitions.length / memberIds.length);
    const newAssignment = new Map(memberIds.map(m => [m, []]));
    const assigned = new Set();

    // Phase 1: Keep previous assignments where possible
    if (previousAssignment) {
      for (const [memberId, partitions] of previousAssignment) {
        if (!newAssignment.has(memberId)) continue;
        for (const tp of partitions) {
          const key = \`\${tp.topic}-\${tp.partition}\`;
          if (!assigned.has(key) && newAssignment.get(memberId).length < targetSize) {
            newAssignment.get(memberId).push(tp);
            assigned.add(key);
          }
        }
      }
    }

    // Phase 2: Assign unassigned partitions round-robin
    let mIdx = 0;
    for (const tp of allPartitions) {
      const key = \`\${tp.topic}-\${tp.partition}\`;
      if (assigned.has(key)) continue;
      while (newAssignment.get(memberIds[mIdx]).length >= targetSize) {
        mIdx = (mIdx + 1) % memberIds.length;
      }
      newAssignment.get(memberIds[mIdx]).push(tp);
      assigned.add(key);
      mIdx = (mIdx + 1) % memberIds.length;
    }
    return newAssignment;
  }
}`,
    explanation: `**Scaling Analysis:**\n- **Horizontal scaling**: Add brokers and reassign partition leaders. New brokers get new partitions; existing data stays put. Use partition reassignment tool for rebalancing.\n- **Partition count**: More partitions = more parallelism but more file handles, memory for index, and longer leader election. Sweet spot: 10-20 partitions per topic for most workloads.\n- **Consumer scaling**: Add consumers up to partition count. Beyond that, extra consumers sit idle. For higher parallelism, increase partitions.\n\n**Failure Modes:**\n1. **Broker failure**: Controller detects via heartbeat timeout. For each partition where the failed broker was leader, elect new leader from ISR. Consumers re-fetch from new leader. No data loss if ISR had caught up.\n2. **Consumer failure**: Group coordinator detects missed heartbeat. Triggers rebalance, reassigning orphaned partitions to surviving consumers. Messages since last committed offset are redelivered (at-least-once).\n3. **Network partition**: Split-brain risk if controller cannot reach brokers. ISR shrinks to reachable replicas. Producers with acks=all may block if ISR < min.insync.replicas.\n4. **Disk failure**: Broker goes offline. Partition replicas on other brokers serve reads. Failed broker rejoins and catches up from leader.\n\n**Bottleneck Identification:**\n- **Disk I/O**: Primary bottleneck for writes. Mitigate with sequential writes, OS page cache, and SSD.\n- **Network**: Replication multiplies bandwidth by replication factor. Use compression (LZ4/Snappy) at producer.\n- **Memory**: Page cache is critical for consumer read performance. Consumers reading recent data hit cache; consumers far behind cause disk reads.\n- **Controller**: Single controller manages all metadata. Use KRaft (Raft-based) for faster failover vs ZooKeeper.\n\n**Monitoring:**\n- Under-replicated partitions (ISR < replication factor)\n- Consumer group lag (difference between log end offset and committed offset)\n- Request latency percentiles (produce, fetch, metadata)\n- Disk utilization and I/O wait per broker\n- Network throughput in/out per broker\n\n**Trade-offs:**\n- **acks=0 vs acks=1 vs acks=all**: Speed vs durability. acks=all is safest but adds latency for ISR sync.\n- **More partitions vs fewer**: Higher parallelism but more overhead and longer rebalances.\n- **Compaction vs deletion**: Compaction keeps latest per key (good for changelogs); deletion is simpler.\n- **Push vs pull consumers**: Pull gives backpressure control; push can deliver faster but risks overwhelming slow consumers.`,
    timeComplexity: `**Performance Characteristics:**\n- Produce: O(1) append per message (sequential write). Batching amortizes network overhead.\n- Consume: O(1) seek by offset using sparse index, then sequential read. Zero-copy delivers ~2 GB/sec per broker.\n- Replication: O(batch_size) per fetch from leader. ISR ack latency depends on slowest ISR member.\n- Rebalance: O(P) where P = total partitions in subscribed topics. Cooperative rebalancing reduces stop-the-world pauses.\n- Retention enforcement: O(S) where S = number of segments to check per partition.`,
    spaceComplexity: `**Storage Requirements:**\n- Per message: 1 KB payload + ~70 bytes overhead (offset, timestamp, CRC, headers) = ~1.07 KB\n- Per partition: Segment files (1 GB each) + index files (~10 MB per segment) + time index (~10 MB)\n- 50,000 partitions x 3 replicas x average 120 GB per partition (7-day retention at uniform load) = 18 PB total cluster storage\n- Page cache: 64 GB RAM per broker, serving recent reads entirely from memory\n- Consumer offset storage: ~100 bytes per (group, topic, partition) tuple. 10,000 groups x 50,000 partitions = ~5 GB in __consumer_offsets`,
    hints: [
      `Implement a PartitionLog class that manages segment rotation: when the active segment exceeds its size limit, create a new segment with baseOffset set to the next available offset. Provide read(offset, maxRecords) that finds the correct segment and reads sequentially.`,
      `Build a ConsumerGroup coordinator that tracks members via heartbeats, performs round-robin partition assignment on rebalance, and stores committed offsets in a map keyed by topic-partition. Trigger rebalance on join/leave/heartbeat-expiry.`,
      `Use consistent hashing (or murmur2 hash of the key modulo partition count) in the producer to ensure messages with the same key always go to the same partition. This guarantees per-key ordering.`,
      `Implement an ISR (In-Sync Replica) tracker: followers report their fetch offset. If a follower falls more than replica.lag.max.messages behind the leader's log end offset, remove it from ISR. The high watermark advances only to the minimum offset across all ISR members.`,
      `For zero-copy optimization in production, use the sendfile() syscall (or fs.createReadStream piped to the socket in Node.js) to transfer segment data directly from the OS page cache to the network buffer without copying into application memory.`,
      `Implement cooperative sticky rebalancing: instead of revoking all partitions and reassigning, only move the minimum number of partitions needed to achieve balance. This avoids the stop-the-world pause of eager rebalancing.`,
      `Add backpressure handling in the producer: maintain an in-flight request count per partition. If it exceeds max.in.flight.requests.per.connection, buffer locally and apply linger.ms batching to coalesce small messages into larger network requests.`,
      `For retention enforcement, run a background task that periodically scans each partition's segments. Delete segments whose newest record timestamp is older than retention.ms. For compacted topics, merge segments and keep only the latest record per key.`
    ]
  },
  {
    id: 9026,
    description: `Design an Email Service (Gmail-like)\n\n**Functional Requirements:**\n- Send and receive emails via SMTP protocol (with IMAP/POP3 for client retrieval)\n- Store billions of emails with per-user mailboxes\n- Full-text search across email body, subject, sender, and attachments\n- Spam filtering using SPF, DKIM verification, and ML-based content classification\n- Labels, folders, starred, and threaded conversation views\n- Push notifications for new email arrival (WebSocket or push)\n- Attachment support up to 25 MB; larger via cloud storage links\n\n**Non-Functional Requirements:**\n- Storage: Support 2 billion users with average 10 GB mailbox = 20 EB total\n- Latency: Inbox load < 200 ms; search results < 500 ms; send < 2 seconds\n- Availability: 99.99% uptime (< 53 min downtime/year)\n- Throughput: Handle 500,000 emails/sec during peak (including spam)\n- Durability: Zero email loss once accepted by SMTP gateway\n\n**Capacity Estimation:**\n- Active users: 500M daily active\n- Emails sent/received: 300 billion/day globally; our service handles 50 billion/day\n- Average email size: 75 KB (including headers, body, small inline images)\n- New storage per day: 50B x 75 KB = 3.75 PB/day\n- Attachment storage: 10% of emails have 2 MB avg attachment = 5B x 2 MB = 10 PB/day\n- Search index: ~30% of email body size = ~1.1 PB/day for index growth\n- SMTP connections: 500K concurrent inbound + 200K outbound`,
    examples: `**Capacity Walkthrough:**\n50 billion emails/day = ~580,000 emails/sec average, ~1.5M/sec peak\nEach email: 75 KB body + metadata = ~75 KB storage\nDaily storage growth: 50B x 75 KB = 3.75 PB\nAnnual: 3.75 PB x 365 = 1.37 EB/year (before dedup/compression)\nWith 3x replication: 4.1 EB/year\n\nSearch index: per-user inverted index averages 30% of mailbox size\n500M active users x 10 GB avg = 5 EB mailbox data\nSearch indices: ~1.5 EB\n\n**API Design:**\n\`\`\`\nPOST /api/v1/send\n  Body: { to: [...], cc: [...], subject, body, attachments: [fileIds], threadId? }\n  Response: { messageId: "msg-abc123", status: "queued" }\n\nGET /api/v1/mailbox/{label}?page=1&limit=50\n  Response: { threads: [{ threadId, subject, snippet, participants, lastDate, unread }] }\n\nGET /api/v1/search?q="invoice+from:alice"&after=2025-01-01\n  Response: { results: [{ messageId, threadId, snippet, highlights }], total: 342 }\n\nPUT /api/v1/messages/{messageId}/labels\n  Body: { add: ["starred"], remove: ["inbox"] }\n\`\`\``,
    intuition: `Think of an email service as a combination of a postal system and a search engine, operating per-user. The SMTP gateway is the post office that receives mail, checks for fraud (spam filtering), and routes it to the recipient's mailbox. The mailbox is a per-user document store optimized for chronological retrieval and full-text search.\n\nThe key insight for threading is that emails form a directed acyclic graph via In-Reply-To and References headers — you can reconstruct conversation threads by following this chain. Gmail's threading algorithm groups messages with the same subject line AND overlapping References headers into a single conversation.\n\nThe critical architectural insight is **per-user partitioning**: since users almost exclusively access their own email, you can partition everything (storage, search index, metadata) by user ID. This gives you natural data locality and isolation — a heavy user's mailbox doesn't affect others.\n\nSpam filtering is a multi-stage pipeline: cheap checks first (SPF/DKIM/IP reputation), then progressively more expensive analysis (content ML classifier, link analysis). This funnel approach handles 500K emails/sec by rejecting 80% of spam at the cheapest stage.`,
    approach: `**Architecture Overview:**\n\n1. **SMTP Gateway**: Accepts inbound SMTP connections. Performs initial checks: SPF (sender IP authorized), DKIM (signature valid), DMARC (policy check). Rejects obvious spam at connection level. Enqueues accepted emails to processing pipeline.\n\n2. **Spam Filter Pipeline**: Multi-stage: (a) IP reputation check, (b) SPF/DKIM/DMARC verification, (c) Header anomaly detection, (d) Content-based ML classifier (Naive Bayes + deep learning ensemble), (e) Link/URL analysis, (f) User-specific Bayesian filter trained on their spam/not-spam actions.\n\n3. **Mail Store**: Per-user partitioned storage. Each user's emails stored in a distributed blob store (like Bigtable) with row key = userId + timestamp. Email body and attachments stored separately — body in the mail store, attachments in object storage (GCS/S3) with CDN for download.\n\n4. **Thread Engine**: Groups emails into conversations using References and In-Reply-To headers. Fallback: subject-line matching with prefix stripping (Re:, Fwd:). Each thread has a thread ID; new emails matching an existing thread are linked.\n\n5. **Search Index**: Per-user inverted index. When an email is delivered, tokenize subject + body + sender + attachment names. Store posting lists keyed by (userId, term). Support boolean queries, phrase matching, and field-scoped search (from:, to:, subject:, has:attachment).\n\n6. **Notification Service**: On new email delivery, push notification via WebSocket (if online), FCM/APNs (if mobile), or increment unread badge count.\n\n**Database Schema:**\n- Users table: userId, email, quotaUsed, quotaLimit, settings\n- Messages table: messageId, userId, threadId, from, to, cc, subject, bodyRef, timestamp, labels[], isRead, isStarred, spamScore\n- Threads table: threadId, userId, subject, participantIds[], lastMessageTimestamp, messageCount\n- Attachments table: attachmentId, messageId, filename, size, storageUrl, contentType\n- Search index: (userId, token) -> [messageId, position, field]`,
    code: `// ============================================================
// Email Service: Core Component Implementations
// ============================================================

class EmailThreadGrouper {
  constructor() {
    this.threadsByMessageId = new Map(); // messageId -> threadId
    this.threads = new Map(); // threadId -> { messages: [], subject, participants }
    this.nextThreadId = 1;
  }

  addEmail(email) {
    // email: { messageId, inReplyTo, references: [], subject, from, to, date }
    let threadId = this.findThread(email);

    if (!threadId) {
      threadId = \`thread-\${this.nextThreadId++}\`;
      this.threads.set(threadId, {
        subject: this.normalizeSubject(email.subject),
        messages: [],
        participants: new Set()
      });
    }

    this.threadsByMessageId.set(email.messageId, threadId);
    const thread = this.threads.get(threadId);
    thread.messages.push(email);
    thread.messages.sort((a, b) => new Date(a.date) - new Date(b.date));
    thread.participants.add(email.from);
    email.to.forEach(addr => thread.participants.add(addr));

    return threadId;
  }

  findThread(email) {
    // Strategy 1: Check In-Reply-To header
    if (email.inReplyTo && this.threadsByMessageId.has(email.inReplyTo)) {
      return this.threadsByMessageId.get(email.inReplyTo);
    }
    // Strategy 2: Walk References headers (newest first)
    if (email.references && email.references.length > 0) {
      for (let i = email.references.length - 1; i >= 0; i--) {
        const ref = email.references[i];
        if (this.threadsByMessageId.has(ref)) {
          return this.threadsByMessageId.get(ref);
        }
      }
    }
    // Strategy 3: Subject-based matching (fallback)
    const normalizedSubject = this.normalizeSubject(email.subject);
    for (const [tid, thread] of this.threads) {
      if (thread.subject === normalizedSubject &&
          thread.participants.has(email.from)) {
        return tid;
      }
    }
    return null;
  }

  normalizeSubject(subject) {
    return subject.replace(/^(Re|Fwd|Fw|RE|FW):\\s*/gi, '').trim().toLowerCase();
  }
}

class NaiveBayesSpamClassifier {
  constructor() {
    this.spamWordCounts = new Map();
    this.hamWordCounts = new Map();
    this.spamTotal = 0;
    this.hamTotal = 0;
    this.spamDocs = 0;
    this.hamDocs = 0;
    this.vocabulary = new Set();
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\\s]/g, '')
      .split(/\\s+/)
      .filter(w => w.length > 2 && w.length < 25);
  }

  train(text, isSpam) {
    const tokens = this.tokenize(text);
    const countMap = isSpam ? this.spamWordCounts : this.hamWordCounts;

    if (isSpam) { this.spamDocs++; } else { this.hamDocs++; }

    for (const token of tokens) {
      this.vocabulary.add(token);
      countMap.set(token, (countMap.get(token) || 0) + 1);
      if (isSpam) { this.spamTotal++; } else { this.hamTotal++; }
    }
  }

  classify(text) {
    const tokens = this.tokenize(text);
    const totalDocs = this.spamDocs + this.hamDocs;
    if (totalDocs === 0) return { label: 'ham', score: 0 };

    let logSpam = Math.log(this.spamDocs / totalDocs);
    let logHam = Math.log(this.hamDocs / totalDocs);
    const vocabSize = this.vocabulary.size;

    for (const token of tokens) {
      const spamCount = this.spamWordCounts.get(token) || 0;
      const hamCount = this.hamWordCounts.get(token) || 0;
      // Laplace smoothing
      logSpam += Math.log((spamCount + 1) / (this.spamTotal + vocabSize));
      logHam += Math.log((hamCount + 1) / (this.hamTotal + vocabSize));
    }

    const maxLog = Math.max(logSpam, logHam);
    const probSpam = Math.exp(logSpam - maxLog);
    const probHam = Math.exp(logHam - maxLog);
    const score = probSpam / (probSpam + probHam);

    return { label: score > 0.5 ? 'spam' : 'ham', score };
  }
}

class PerUserSearchIndex {
  constructor() {
    this.indices = new Map(); // userId -> Map<token, Set<{messageId, field}>>
  }

  indexEmail(userId, email) {
    if (!this.indices.has(userId)) {
      this.indices.set(userId, new Map());
    }
    const index = this.indices.get(userId);
    const fields = {
      subject: email.subject || '',
      body: email.body || '',
      from: email.from || '',
      to: (email.to || []).join(' ')
    };

    for (const [field, text] of Object.entries(fields)) {
      const tokens = this.tokenize(text);
      for (const token of tokens) {
        if (!index.has(token)) index.set(token, []);
        index.get(token).push({ messageId: email.messageId, field });
      }
    }
  }

  search(userId, query) {
    const index = this.indices.get(userId);
    if (!index) return [];

    const { terms, fieldFilters } = this.parseQuery(query);
    let resultSets = [];

    for (const term of terms) {
      const postings = index.get(term.toLowerCase()) || [];
      resultSets.push(new Set(postings.map(p => p.messageId)));
    }

    for (const { field, value } of fieldFilters) {
      const token = value.toLowerCase();
      const postings = (index.get(token) || []).filter(p => p.field === field);
      resultSets.push(new Set(postings.map(p => p.messageId)));
    }

    if (resultSets.length === 0) return [];
    let intersection = resultSets[0];
    for (let i = 1; i < resultSets.length; i++) {
      intersection = new Set([...intersection].filter(id => resultSets[i].has(id)));
    }
    return [...intersection];
  }

  parseQuery(query) {
    const terms = [];
    const fieldFilters = [];
    const parts = query.match(/\\S+/g) || [];

    for (const part of parts) {
      const fieldMatch = part.match(/^(from|to|subject|has):(.+)$/i);
      if (fieldMatch) {
        fieldFilters.push({ field: fieldMatch[1].toLowerCase(), value: fieldMatch[2] });
      } else {
        terms.push(part);
      }
    }
    return { terms, fieldFilters };
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9@.\\s]/g, ' ')
      .split(/\\s+/)
      .filter(w => w.length > 1);
  }
}

class SMTPEnvelopeParser {
  parse(rawEmail) {
    const lines = rawEmail.split('\\n');
    const headers = {};
    let bodyStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') { bodyStart = i + 1; break; }

      if (line.match(/^\\s/) && Object.keys(headers).length > 0) {
        const lastKey = Object.keys(headers).pop();
        headers[lastKey] += ' ' + line.trim();
        continue;
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();
        headers[key] = value;
      }
    }

    const body = lines.slice(bodyStart).join('\\n').trim();
    const parseAddressList = (str) => {
      if (!str) return [];
      return str.split(',').map(a => {
        const match = a.match(/<([^>]+)>/);
        return match ? match[1].trim() : a.trim();
      }).filter(Boolean);
    };

    return {
      messageId: headers['message-id'] || \`<\${Date.now()}@generated>\`,
      from: parseAddressList(headers['from'])[0] || '',
      to: parseAddressList(headers['to']),
      cc: parseAddressList(headers['cc']),
      subject: headers['subject'] || '(no subject)',
      date: headers['date'] || new Date().toISOString(),
      inReplyTo: headers['in-reply-to'] || null,
      references: (headers['references'] || '').split(/\\s+/).filter(Boolean),
      contentType: headers['content-type'] || 'text/plain',
      body,
      headers
    };
  }

  verifySPF(senderDomain, connectingIP, spfRecord) {
    if (!spfRecord) return { result: 'none', reason: 'No SPF record found' };
    const mechanisms = spfRecord.replace('v=spf1 ', '').split(' ');

    for (const mech of mechanisms) {
      if (mech.startsWith('ip4:')) {
        const allowedIP = mech.substring(4);
        if (this.ipInRange(connectingIP, allowedIP)) {
          return { result: 'pass', mechanism: mech };
        }
      } else if (mech === '+all' || mech === 'all') {
        return { result: 'pass', mechanism: 'all' };
      } else if (mech === '-all') {
        return { result: 'fail', reason: 'IP not in SPF record' };
      } else if (mech === '~all') {
        return { result: 'softfail', reason: 'IP not in SPF record (softfail)' };
      }
    }
    return { result: 'neutral' };
  }

  ipInRange(ip, cidr) {
    if (!cidr.includes('/')) return ip === cidr;
    const [rangeIP, bits] = cidr.split('/');
    const ipNum = ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0);
    const rangeNum = rangeIP.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0);
    const mask = -1 << (32 - parseInt(bits));
    return (ipNum & mask) === (rangeNum & mask);
  }
}`,
    jsCode: `// ============================================================
// Spam Filter Pipeline + Mail Delivery Agent
// ============================================================

class SpamFilterPipeline {
  constructor() {
    this.classifier = null; // NaiveBayesSpamClassifier instance
    this.ipReputationCache = new Map();
    this.urlBlacklist = new Set();
    this.thresholds = { spamScore: 0.7, suspiciousScore: 0.4 };
  }

  setClassifier(classifier) { this.classifier = classifier; }

  async processEmail(email, metadata) {
    const result = { passed: true, score: 0, checks: [], action: 'deliver' };

    // Stage 1: IP Reputation (cheapest check first)
    const ipScore = this.checkIPReputation(metadata.senderIP);
    result.checks.push({ stage: 'ip_reputation', score: ipScore });
    result.score += ipScore * 0.2;
    if (ipScore > 0.9) {
      result.passed = false;
      result.action = 'reject';
      result.reason = 'Blocked IP';
      return result;
    }

    // Stage 2: Authentication (SPF/DKIM/DMARC)
    const authScore = this.checkAuthentication(metadata);
    result.checks.push({ stage: 'authentication', score: authScore });
    result.score += authScore * 0.15;

    // Stage 3: Header analysis
    const headerScore = this.analyzeHeaders(email);
    result.checks.push({ stage: 'headers', score: headerScore });
    result.score += headerScore * 0.15;

    // Stage 4: Content classification (most expensive)
    if (this.classifier) {
      const fullText = \`\${email.subject} \${email.body}\`;
      const classification = this.classifier.classify(fullText);
      result.checks.push({ stage: 'content_ml', score: classification.score });
      result.score += classification.score * 0.3;
    }

    // Stage 5: URL analysis
    const urlScore = this.analyzeURLs(email.body);
    result.checks.push({ stage: 'url_analysis', score: urlScore });
    result.score += urlScore * 0.2;

    if (result.score > this.thresholds.spamScore) {
      result.action = 'spam_folder';
      result.passed = false;
    } else if (result.score > this.thresholds.suspiciousScore) {
      result.action = 'deliver_with_warning';
    }

    return result;
  }

  checkIPReputation(ip) {
    if (this.ipReputationCache.has(ip)) return this.ipReputationCache.get(ip);
    return 0.1; // default low risk for unknown IPs
  }

  checkAuthentication(metadata) {
    let score = 0;
    if (!metadata.spfPass) score += 0.4;
    if (!metadata.dkimPass) score += 0.4;
    if (!metadata.dmarcPass) score += 0.2;
    return score;
  }

  analyzeHeaders(email) {
    let score = 0;
    if (!email.messageId) score += 0.3;
    if (email.from && email.from.includes('noreply') && !email.headers['list-unsubscribe']) {
      score += 0.2;
    }
    const receivedHeaders = Object.keys(email.headers)
      .filter(h => h === 'received').length;
    if (receivedHeaders > 15) score += 0.3;
    if (email.subject && /[A-Z]{5,}/.test(email.subject)) score += 0.2;
    return Math.min(score, 1.0);
  }

  analyzeURLs(body) {
    const urlRegex = /https?:\\/\\/[^\\s<>]+/gi;
    const urls = body.match(urlRegex) || [];
    if (urls.length === 0) return 0;

    let score = 0;
    for (const url of urls) {
      try {
        const domain = new URL(url).hostname;
        if (this.urlBlacklist.has(domain)) score += 0.5;
        if (domain.length > 40) score += 0.1;
        if (/\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/.test(domain)) score += 0.3;
      } catch (e) { score += 0.1; }
    }
    return Math.min(score / urls.length, 1.0);
  }

  updateIPReputation(ip, isSpam) {
    const current = this.ipReputationCache.get(ip) || 0.1;
    const updated = isSpam
      ? Math.min(current + 0.1, 1.0)
      : Math.max(current - 0.05, 0.0);
    this.ipReputationCache.set(ip, updated);
  }
}

class MailDeliveryAgent {
  constructor() {
    this.mailboxes = new Map(); // userId -> { messages: [], labels: Map, threads: Map }
    this.threadGrouper = null; // EmailThreadGrouper per user
  }

  createMailbox(userId) {
    this.mailboxes.set(userId, {
      messages: new Map(),
      labels: new Map([
        ['inbox', new Set()], ['sent', new Set()], ['spam', new Set()],
        ['trash', new Set()], ['drafts', new Set()], ['starred', new Set()]
      ]),
      unreadCount: 0,
      quotaUsed: 0,
      quotaLimit: 15 * 1024 * 1024 * 1024 // 15 GB
    });
  }

  deliver(userId, email, label = 'inbox') {
    const mailbox = this.mailboxes.get(userId);
    if (!mailbox) return { error: 'Mailbox not found' };

    const emailSize = JSON.stringify(email).length;
    if (mailbox.quotaUsed + emailSize > mailbox.quotaLimit) {
      return { error: 'Quota exceeded', quotaUsed: mailbox.quotaUsed };
    }

    const storedEmail = {
      ...email,
      internalDate: Date.now(),
      isRead: false,
      labels: new Set([label]),
      size: emailSize
    };

    mailbox.messages.set(email.messageId, storedEmail);
    mailbox.labels.get(label).add(email.messageId);
    mailbox.unreadCount++;
    mailbox.quotaUsed += emailSize;

    return { delivered: true, messageId: email.messageId, label };
  }

  getInbox(userId, page = 1, limit = 50) {
    const mailbox = this.mailboxes.get(userId);
    if (!mailbox) return [];

    const inboxIds = [...mailbox.labels.get('inbox')];
    const messages = inboxIds
      .map(id => mailbox.messages.get(id))
      .filter(Boolean)
      .sort((a, b) => b.internalDate - a.internalDate);

    const start = (page - 1) * limit;
    return {
      messages: messages.slice(start, start + limit),
      total: messages.length,
      page,
      totalPages: Math.ceil(messages.length / limit)
    };
  }

  applyLabel(userId, messageId, label) {
    const mailbox = this.mailboxes.get(userId);
    if (!mailbox) return false;
    const msg = mailbox.messages.get(messageId);
    if (!msg) return false;

    if (!mailbox.labels.has(label)) mailbox.labels.set(label, new Set());
    mailbox.labels.get(label).add(messageId);
    msg.labels.add(label);
    return true;
  }

  removeLabel(userId, messageId, label) {
    const mailbox = this.mailboxes.get(userId);
    if (!mailbox) return false;
    const msg = mailbox.messages.get(messageId);
    if (!msg) return false;

    if (mailbox.labels.has(label)) mailbox.labels.get(label).delete(messageId);
    msg.labels.delete(label);
    return true;
  }
}`,
    explanation: `**Scaling Analysis:**\n- **Per-user partitioning** is the cornerstone: shard by userId hash. Each shard handles ~10M users. User's mailbox, search index, and metadata co-located on the same shard for data locality.\n- **SMTP Gateway**: Horizontally scalable stateless servers behind a load balancer. Use connection pooling for outbound SMTP. Rate limit per sender domain to prevent abuse.\n- **Search**: Per-user inverted index means search never crosses shard boundaries. Index updates are async (email searchable within 1-2 seconds of delivery). Use Lucene-based engine per shard.\n- **Attachments**: Stored separately in object storage with CDN. Deduplication by content hash saves 30-40% storage.\n\n**Failure Modes:**\n1. **SMTP Gateway crash**: Connection drops; sending MTA retries automatically (SMTP spec requires retry for 4xx errors). Stateless, so any gateway can handle the retry.\n2. **Mail store shard failure**: Replica shard takes over. Emails delivered during failover queued in Kafka and replayed to new primary.\n3. **Search index corruption**: Rebuild from mail store. Keep search as a derived view, not source of truth.\n4. **Spam classifier false positives**: Allow user to mark "not spam" which retrains per-user Bayesian filter and sends feedback to global model.\n\n**Bottleneck Identification:**\n- **Spam filtering at ingest**: 80% of inbound email is spam. Filter pipeline must handle 400K spam emails/sec. Solution: reject at SMTP level before full processing.\n- **Search indexing**: Building inverted index for every email. Batch index updates and use write-behind pattern.\n- **Large mailboxes**: Power users with 500K+ emails. Pagination and lazy loading of thread summaries.\n\n**Monitoring:**\n- SMTP queue depth and delivery latency\n- Spam false positive/negative rates\n- Search index lag (time from delivery to searchable)\n- Storage utilization per shard and quota alerts\n- Bounce rates and sender reputation scores\n\n**Trade-offs:**\n- **Per-user vs global search index**: Per-user is simpler, scales naturally, but no cross-user search (fine for email). Global index needed for compliance/legal search.\n- **Push vs pull for new mail**: Push (WebSocket) gives instant notification but requires persistent connections for 500M users. Solution: push for active sessions, poll/push notification for mobile.\n- **Threaded vs flat view**: Threading requires References header parsing and subject matching heuristics, adding complexity but greatly improving UX.`,
    timeComplexity: `**Performance Characteristics:**\n- Email send: O(R) where R = number of recipients for fanout delivery. Each delivery is O(1) append.\n- Inbox load: O(K) where K = page size. Index on (userId, label, timestamp) for sorted retrieval.\n- Search: O(T * P) where T = number of query terms, P = average posting list length. Intersection of posting lists.\n- Thread grouping: O(R) where R = number of References headers to check (typically < 20).\n- Spam classification: O(N) where N = number of tokens in email body. Naive Bayes is linear in document length.`,
    spaceComplexity: `**Storage Requirements:**\n- Email body storage: 75 KB avg x 50B emails/day = 3.75 PB/day new data\n- With compression (LZ4): ~50% reduction = 1.9 PB/day\n- Attachment storage: 10 PB/day (separate object store, deduplicated)\n- Per-user search index: ~3 GB per user with 10 GB mailbox (~30% of mailbox size)\n- Metadata DB: ~500 bytes per email x 50B/day = 25 TB/day\n- Total cluster: ~20 EB across all users (with 3x replication = 60 EB)\n- RAM per mail store shard: 128 GB (hot metadata cache + recent message cache)`,
    hints: [
      `Implement an EmailThreadGrouper that uses In-Reply-To and References headers to find existing threads. Walk References from newest to oldest. Fallback to normalized subject matching (strip Re:/Fwd: prefixes) when headers are missing.`,
      `Build a Naive Bayes spam classifier with Laplace smoothing. Maintain separate word frequency maps for spam and ham. Calculate log-probabilities to avoid floating-point underflow. Train on user feedback (mark spam/not spam) for per-user personalization.`,
      `Create a per-user inverted index that tokenizes email fields (subject, body, from, to) separately. Support field-scoped queries like "from:alice" by storing field metadata in posting list entries. Use AND semantics for multi-term queries.`,
      `Implement SMTP envelope parsing that handles folded headers (continuation lines starting with whitespace), extracts email addresses from both bare and angle-bracket formats, and correctly separates headers from body at the first blank line.`,
      `For SPF verification, parse the SPF TXT record and check mechanisms in order: ip4/ip6 ranges, include (recursive lookup), a/mx records, and the all mechanism. Return pass/fail/softfail/neutral.`,
      `Design the spam filter as a pipeline with early rejection: IP reputation check (O(1) lookup) rejects 50% of spam, authentication checks reject another 20%, and only 30% reaches the expensive ML classifier. This funnel approach keeps p99 latency under 50ms.`,
      `Store attachments by content hash (SHA-256) in object storage for deduplication. The same attachment forwarded to 100 users is stored once. Metadata links messageId to attachment hash.`,
      `For push notifications, maintain a presence service tracking online users (WebSocket connected). For online users, push instantly. For offline users, batch notifications and send via FCM/APNs with a coalescing window (e.g., "3 new emails from Alice").`
    ]
  },
  {
    id: 9027,
    description: `Design a Logging/Analytics Pipeline (ELK-like)\n\n**Functional Requirements:**\n- Ingest structured and unstructured logs from thousands of microservices\n- Support multiple log formats (JSON, syslog, plain text) with schema evolution\n- Near real-time search: logs searchable within 30 seconds of emission\n- Support complex queries: full-text search, field filtering, aggregations, time-range filtering\n- Configurable retention: hot (0-7 days, fast search), warm (7-30 days, slower search), cold (30-90 days, archival)\n- Dashboard and alerting integration\n\n**Non-Functional Requirements:**\n- Throughput: Ingest 5 TB of raw logs per day (peak 150 GB/hour)\n- Latency: Logs searchable within 30 seconds of emission (p99)\n- Query latency: Simple queries < 500 ms; aggregation queries < 5 seconds\n- Availability: 99.9% for ingestion; 99.5% for search (search can degrade gracefully)\n- Durability: Zero log loss for acknowledged writes\n\n**Capacity Estimation:**\n- 2000 microservices producing logs\n- Average log line: 500 bytes\n- 5 TB/day = 5,000 GB / 86,400 sec = ~58 MB/sec sustained, 150 MB/sec peak\n- ~10 billion log lines per day\n- Search index overhead: ~1.5x raw data = 7.5 TB/day for hot tier\n- Hot tier (7 days): 52.5 TB indexed data\n- Warm tier (30 days): 150 TB compressed\n- Cold tier (90 days): 450 TB in object storage (compressed 5:1)`,
    examples: `**Capacity Walkthrough:**\n2000 services x 500 log lines/sec avg = 1,000,000 lines/sec\n1M lines x 500 bytes = 500 MB/sec peak, 58 MB/sec sustained\n\nKafka cluster for buffering:\n- 58 MB/sec x 3 (replication) = 174 MB/sec write throughput\n- 10 partitions across 5 brokers = sufficient\n- 24-hour retention in Kafka = 5 TB buffer\n\nElasticsearch hot tier:\n- 7-day retention, 5 TB/day = 35 TB raw + 17.5 TB index overhead = 52.5 TB\n- 20 data nodes x 3 TB SSD each = 60 TB capacity\n- Each node: 64 GB RAM, 32 cores\n\n**API Design:**\n\`\`\`\nPOST /api/v1/ingest\n  Body: { entries: [{ timestamp, service, level, message, fields: {...} }] }\n  Response: { accepted: 100, failed: 0 }\n\nPOST /api/v1/search\n  Body: { query: "error AND service:payment", timeRange: { from, to }, limit: 100 }\n  Response: { hits: [...], total: 5432, took: 45 }\n\nPOST /api/v1/aggregate\n  Body: { query: "level:error", timeRange: {...}, groupBy: "service", metric: "count" }\n  Response: { buckets: [{ key: "payment", count: 1234 }, ...] }\n\`\`\``,
    intuition: `Think of a logging pipeline as a river system: thousands of tributaries (services) feed into a collection channel (Kafka), which flows through a processing plant (stream processor) that structures and enriches the water, before filling a reservoir (Elasticsearch) where people can fish for specific drops.\n\nThe key insight is **decoupling ingestion from indexing**: services should never block waiting for their logs to be indexed. A durable buffer (Kafka) absorbs bursts and protects the indexing tier from being overwhelmed. This is the same pattern as a shock absorber in a car — it converts sharp spikes into smooth, manageable flow.\n\nAnother critical insight is **time-based index rotation**: instead of one giant index, create a new index every day (or hour during peak). This makes retention trivial (delete old indices), improves query performance (only search relevant time ranges), and enables tiered storage (move old indices to cheaper storage).\n\nBackpressure handling is essential: if the indexing tier falls behind, the pipeline must slow down ingestion gracefully rather than dropping logs or crashing. Kafka's consumer lag naturally provides this buffer.`,
    approach: `**Architecture Overview:**\n\n1. **Log Agents (Filebeat/Fluentd)**: Lightweight agents on every service host. Tail log files, parse into structured events, buffer locally, and ship to the collection tier. Handle log rotation, multiline merging (stack traces), and local backpressure.\n\n2. **Collection Tier (Kafka)**: Durable, high-throughput message bus. Topics partitioned by service or log level. Provides decoupling, buffering (absorb 10x burst for 30 min), and replay capability. Retain 24-72 hours.\n\n3. **Stream Processor (Flink/Logstash)**: Consumes from Kafka. Tasks: (a) Parse unstructured logs into structured fields using grok patterns, (b) Enrich with metadata (service name, environment, region), (c) Filter noise (health checks, debug in prod), (d) Route to appropriate indices based on log level or service.\n\n4. **Index Cluster (Elasticsearch)**: Hot-warm-cold architecture. Hot nodes (SSD): current day's index, optimized for writes and real-time search. Warm nodes (HDD): 1-30 day indices, read-only, force-merged for compact storage. Cold nodes: 30-90 day indices in frozen tier backed by object storage.\n\n5. **Index Lifecycle Management (ILM)**: Automated policy: create new index daily (or when size exceeds 50 GB), after 7 days move to warm (force merge to 1 segment, shrink replicas), after 30 days move to cold (snapshot to S3, searchable snapshot), after 90 days delete.\n\n6. **Query Layer**: API gateway with query optimization. Automatically adds time range filters. Caches frequent aggregation queries. Supports KQL (Kibana Query Language) for user-friendly search.\n\n**Data Flow:**\nService -> Log Agent (local buffer) -> Kafka topic -> Stream Processor -> Elasticsearch hot index -> ILM rotates to warm -> cold -> delete\n\n**Schema:**\n- Log document: { @timestamp, service, level, message, trace_id, span_id, host, region, fields: {...} }\n- Index naming: logs-{service}-{date} (e.g., logs-payment-2025-03-15)\n- Index template: defines mappings, settings, ILM policy for all matching indices`,
    code: `// ============================================================
// Logging Pipeline: Core Component Implementations
// ============================================================

class LogPipeline {
  constructor(options = {}) {
    this.buffer = [];
    this.bufferSizeBytes = 0;
    this.maxBufferSize = options.maxBufferSize || 10 * 1024 * 1024; // 10 MB
    this.flushInterval = options.flushInterval || 5000;
    this.batchSize = options.batchSize || 500;
    this.downstream = options.downstream || null;
    this.backpressure = false;
    this.dropCount = 0;
    this.processedCount = 0;
    this.flushTimer = null;
    this.onFlush = options.onFlush || null;
  }

  start() {
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  stop() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flush(); // final flush
  }

  ingest(logEntry) {
    const entrySize = JSON.stringify(logEntry).length;

    if (this.bufferSizeBytes + entrySize > this.maxBufferSize) {
      this.backpressure = true;
      this.dropCount++;
      return { accepted: false, reason: 'backpressure', dropCount: this.dropCount };
    }

    const enriched = {
      ...logEntry,
      '@timestamp': logEntry.timestamp || new Date().toISOString(),
      _ingested_at: Date.now(),
      _pipeline_id: this.pipelineId
    };

    this.buffer.push(enriched);
    this.bufferSizeBytes += entrySize;
    this.backpressure = false;

    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
    return { accepted: true, buffered: this.buffer.length };
  }

  flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.batchSize);
    this.bufferSizeBytes = this.buffer.reduce(
      (sum, e) => sum + JSON.stringify(e).length, 0
    );
    this.processedCount += batch.length;

    if (this.onFlush) this.onFlush(batch);
    if (this.downstream) this.downstream.receiveBatch(batch);
    return batch;
  }

  getStats() {
    return {
      buffered: this.buffer.length,
      bufferBytes: this.bufferSizeBytes,
      processed: this.processedCount,
      dropped: this.dropCount,
      backpressure: this.backpressure
    };
  }
}

class TimeBasedIndexManager {
  constructor(options = {}) {
    this.indices = new Map(); // indexName -> { docs: [], createdAt, state, sizeBytes }
    this.hotRetentionDays = options.hotRetentionDays || 7;
    this.warmRetentionDays = options.warmRetentionDays || 30;
    this.coldRetentionDays = options.coldRetentionDays || 90;
    this.maxIndexSizeBytes = options.maxIndexSize || 50 * 1024 * 1024 * 1024;
    this.rolloverSequence = new Map(); // base pattern -> current sequence
  }

  getWriteIndex(service, timestamp) {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '.');
    const baseName = \`logs-\${service}-\${dateStr}\`;

    const seq = this.rolloverSequence.get(baseName) || 1;
    const indexName = \`\${baseName}-\${String(seq).padStart(6, '0')}\`;

    if (!this.indices.has(indexName)) {
      this.indices.set(indexName, {
        docs: [], createdAt: Date.now(), state: 'hot',
        sizeBytes: 0, service, date: dateStr
      });
      this.rolloverSequence.set(baseName, seq);
    }

    const index = this.indices.get(indexName);
    if (index.sizeBytes >= this.maxIndexSizeBytes) {
      const newSeq = seq + 1;
      this.rolloverSequence.set(baseName, newSeq);
      const newName = \`\${baseName}-\${String(newSeq).padStart(6, '0')}\`;
      this.indices.set(newName, {
        docs: [], createdAt: Date.now(), state: 'hot',
        sizeBytes: 0, service, date: dateStr
      });
      return newName;
    }
    return indexName;
  }

  indexDocument(indexName, doc) {
    const index = this.indices.get(indexName);
    if (!index) return false;
    const docSize = JSON.stringify(doc).length;
    index.docs.push(doc);
    index.sizeBytes += docSize;
    return true;
  }

  applyILM() {
    const now = Date.now();
    const dayMs = 24 * 3600 * 1000;
    const transitions = { toWarm: 0, toCold: 0, deleted: 0 };

    for (const [name, index] of this.indices) {
      const ageDays = (now - index.createdAt) / dayMs;

      if (index.state === 'hot' && ageDays > this.hotRetentionDays) {
        index.state = 'warm';
        transitions.toWarm++;
      } else if (index.state === 'warm' && ageDays > this.warmRetentionDays) {
        index.state = 'cold';
        transitions.toCold++;
      } else if (index.state === 'cold' && ageDays > this.coldRetentionDays) {
        this.indices.delete(name);
        transitions.deleted++;
      }
    }
    return transitions;
  }

  getIndicesForTimeRange(start, end) {
    const results = [];
    for (const [name, index] of this.indices) {
      const indexDate = new Date(index.date.replace(/\\./g, '-')).getTime();
      if (indexDate >= start - 86400000 && indexDate <= end + 86400000) {
        results.push(name);
      }
    }
    return results;
  }
}

class StructuredLogParser {
  constructor() {
    this.patterns = [];
    this.fieldExtractors = new Map();
  }

  addPattern(name, regex, fields) {
    this.patterns.push({ name, regex: new RegExp(regex), fields });
  }

  addFieldExtractor(field, extractorFn) {
    this.fieldExtractors.set(field, extractorFn);
  }

  parse(rawLine) {
    // Try JSON first
    if (rawLine.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawLine);
        return { format: 'json', ...this.normalizeFields(parsed) };
      } catch (e) { /* not valid JSON, continue */ }
    }

    // Try registered patterns (grok-like)
    for (const { name, regex, fields } of this.patterns) {
      const match = rawLine.match(regex);
      if (match) {
        const result = { format: name };
        fields.forEach((field, idx) => { result[field] = match[idx + 1]; });
        return this.normalizeFields(result);
      }
    }

    // Fallback: extract common fields
    return this.normalizeFields({
      format: 'raw',
      message: rawLine,
      timestamp: this.extractTimestamp(rawLine),
      level: this.extractLevel(rawLine)
    });
  }

  normalizeFields(doc) {
    if (doc.timestamp) {
      const ts = new Date(doc.timestamp);
      if (!isNaN(ts.getTime())) doc['@timestamp'] = ts.toISOString();
    }
    if (doc.level) doc.level = doc.level.toUpperCase();
    for (const [field, extractor] of this.fieldExtractors) {
      if (doc.message && !doc[field]) {
        const extracted = extractor(doc.message);
        if (extracted !== null) doc[field] = extracted;
      }
    }
    return doc;
  }

  extractTimestamp(line) {
    const isoMatch = line.match(/(\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}:\\d{2}[.\\d]*Z?)/);
    if (isoMatch) return isoMatch[1];
    const syslogMatch = line.match(/^([A-Z][a-z]{2}\\s+\\d+\\s+\\d{2}:\\d{2}:\\d{2})/);
    if (syslogMatch) return syslogMatch[1];
    return null;
  }

  extractLevel(line) {
    const match = line.match(/\\b(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRITICAL)\\b/i);
    return match ? match[1] : null;
  }
}

class LogQueryEngine {
  constructor(indexManager) {
    this.indexManager = indexManager;
  }

  search(query) {
    const { text, filters, timeRange, limit = 100, offset = 0 } = query;
    const indices = this.getTargetIndices(timeRange);
    let results = [];

    for (const indexName of indices) {
      const index = this.indexManager.indices.get(indexName);
      if (!index) continue;

      for (const doc of index.docs) {
        if (this.matchesTimeRange(doc, timeRange) &&
            this.matchesFilters(doc, filters) &&
            this.matchesText(doc, text)) {
          results.push(doc);
        }
      }
    }

    results.sort((a, b) => {
      const tA = new Date(a['@timestamp'] || 0).getTime();
      const tB = new Date(b['@timestamp'] || 0).getTime();
      return tB - tA;
    });

    return {
      hits: results.slice(offset, offset + limit),
      total: results.length,
      indices: indices.length
    };
  }

  aggregate(query) {
    const { filters, timeRange, groupBy, metric = 'count' } = query;
    const searchResults = this.search({ ...query, text: null, limit: Infinity });
    const buckets = new Map();

    for (const doc of searchResults.hits) {
      const key = doc[groupBy] || '_missing';
      if (!buckets.has(key)) buckets.set(key, { count: 0, docs: [] });
      const bucket = buckets.get(key);
      bucket.count++;
      bucket.docs.push(doc);
    }

    const result = [...buckets.entries()]
      .map(([key, data]) => ({ key, count: data.count }))
      .sort((a, b) => b.count - a.count);
    return { buckets: result, total: searchResults.total };
  }

  getTargetIndices(timeRange) {
    if (!timeRange || (!timeRange.from && !timeRange.to)) {
      return [...this.indexManager.indices.keys()];
    }
    const from = timeRange.from ? new Date(timeRange.from).getTime() : 0;
    const to = timeRange.to ? new Date(timeRange.to).getTime() : Date.now();
    return this.indexManager.getIndicesForTimeRange(from, to);
  }

  matchesTimeRange(doc, timeRange) {
    if (!timeRange) return true;
    const docTime = new Date(doc['@timestamp'] || 0).getTime();
    if (timeRange.from && docTime < new Date(timeRange.from).getTime()) return false;
    if (timeRange.to && docTime > new Date(timeRange.to).getTime()) return false;
    return true;
  }

  matchesFilters(doc, filters) {
    if (!filters) return true;
    for (const [field, value] of Object.entries(filters)) {
      if (doc[field] === undefined) return false;
      if (String(doc[field]).toLowerCase() !== String(value).toLowerCase()) return false;
    }
    return true;
  }

  matchesText(doc, text) {
    if (!text) return true;
    const terms = text.toLowerCase().split(/\\s+AND\\s+/i);
    const docStr = JSON.stringify(doc).toLowerCase();
    return terms.every(term => docStr.includes(term.trim()));
  }
}`,
    jsCode: `// ============================================================
// Log Agent with Backpressure + Alert Engine
// ============================================================

class LogAgent {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'unknown';
    this.batchSize = options.batchSize || 200;
    this.flushIntervalMs = options.flushIntervalMs || 1000;
    this.maxRetries = options.maxRetries || 3;
    this.buffer = [];
    this.retryQueue = [];
    this.pendingBatches = 0;
    this.maxPendingBatches = options.maxPendingBatches || 5;
    this.stats = { sent: 0, retried: 0, dropped: 0, errors: 0 };
    this.destinations = []; // LogPipeline instances
    this.running = false;
  }

  addDestination(pipeline) {
    this.destinations.push(pipeline);
  }

  log(level, message, fields = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level: level.toUpperCase(),
      message,
      ...fields,
      host: fields.host || 'localhost',
      pid: fields.pid || process.pid
    };

    if (this.pendingBatches >= this.maxPendingBatches) {
      // Backpressure: drop low-priority logs
      if (level === 'debug' || level === 'trace') {
        this.stats.dropped++;
        return { dropped: true, reason: 'backpressure' };
      }
    }

    this.buffer.push(entry);
    if (this.buffer.length >= this.batchSize) {
      this.sendBatch();
    }
    return { buffered: true, bufferSize: this.buffer.length };
  }

  sendBatch() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.batchSize);
    this.pendingBatches++;

    for (const dest of this.destinations) {
      let success = true;
      for (const entry of batch) {
        const result = dest.ingest(entry);
        if (!result.accepted) { success = false; break; }
      }
      if (!success) {
        this.retryQueue.push({ batch, retries: 0 });
      } else {
        this.stats.sent += batch.length;
      }
    }
    this.pendingBatches--;
  }

  processRetries() {
    const pending = [...this.retryQueue];
    this.retryQueue = [];

    for (const item of pending) {
      if (item.retries >= this.maxRetries) {
        this.stats.dropped += item.batch.length;
        continue;
      }
      item.retries++;
      this.stats.retried += item.batch.length;

      let success = true;
      for (const dest of this.destinations) {
        for (const entry of item.batch) {
          if (!dest.ingest(entry).accepted) { success = false; break; }
        }
      }
      if (!success) this.retryQueue.push(item);
      else this.stats.sent += item.batch.length;
    }
  }

  start() {
    this.running = true;
    this._flushTimer = setInterval(() => this.sendBatch(), this.flushIntervalMs);
    this._retryTimer = setInterval(() => this.processRetries(), this.flushIntervalMs * 3);
  }

  stop() {
    this.running = false;
    if (this._flushTimer) clearInterval(this._flushTimer);
    if (this._retryTimer) clearInterval(this._retryTimer);
    this.sendBatch(); // final flush
    return this.stats;
  }
}

class AlertEngine {
  constructor(queryEngine) {
    this.queryEngine = queryEngine;
    this.rules = [];
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.evaluationInterval = 60000; // 1 minute
  }

  addRule(rule) {
    // rule: { id, name, query, condition: { field, operator, threshold }, window, severity, cooldownMs }
    this.rules.push({
      ...rule,
      lastTriggered: 0,
      cooldownMs: rule.cooldownMs || 300000 // 5 min default
    });
  }

  evaluate() {
    const now = Date.now();
    const triggered = [];

    for (const rule of this.rules) {
      if (now - rule.lastTriggered < rule.cooldownMs) continue;

      const windowStart = new Date(now - (rule.window || 300000)).toISOString();
      const windowEnd = new Date(now).toISOString();

      let result;
      if (rule.condition.field === 'count') {
        result = this.queryEngine.search({
          text: rule.query.text,
          filters: rule.query.filters,
          timeRange: { from: windowStart, to: windowEnd },
          limit: 1
        });
        result = { value: result.total };
      } else {
        const aggResult = this.queryEngine.aggregate({
          ...rule.query,
          timeRange: { from: windowStart, to: windowEnd },
          groupBy: rule.condition.field
        });
        result = { value: aggResult.total };
      }

      const conditionMet = this.evaluateCondition(
        result.value, rule.condition.operator, rule.condition.threshold
      );

      if (conditionMet) {
        rule.lastTriggered = now;
        const alert = {
          ruleId: rule.id, ruleName: rule.name,
          severity: rule.severity, triggeredAt: new Date(now).toISOString(),
          value: result.value, threshold: rule.condition.threshold,
          message: \`\${rule.name}: \${result.value} \${rule.condition.operator} \${rule.condition.threshold}\`
        };
        this.activeAlerts.set(rule.id, alert);
        this.alertHistory.push(alert);
        triggered.push(alert);
      } else {
        this.activeAlerts.delete(rule.id);
      }
    }
    return triggered;
  }

  evaluateCondition(value, operator, threshold) {
    switch (operator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      default: return false;
    }
  }

  getActiveAlerts() {
    return [...this.activeAlerts.values()];
  }

  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }
}`,
    explanation: `**Scaling Analysis:**\n- **Ingestion scaling**: Add Kafka partitions and stream processor instances linearly. Each Flink task manager handles ~50 MB/sec of log parsing. 3 instances handle 150 MB/sec peak.\n- **Index scaling**: Add Elasticsearch data nodes. Each hot node handles ~20,000 index operations/sec. 20 hot nodes handle 400K ops/sec (with batching).\n- **Query scaling**: Elasticsearch distributes queries across shards. Add coordinator nodes for query routing. Cache frequent dashboard queries.\n- **Agent scaling**: Agents are deployed per host. Use sidecar pattern in Kubernetes. Agents buffer locally during network issues.\n\n**Failure Modes:**\n1. **Kafka broker failure**: Replicated topics ensure no data loss. Producers retry to new leader. Consumer lag increases temporarily.\n2. **Stream processor crash**: Kafka consumer offsets enable exactly-once restart from last committed position. Brief increase in log latency.\n3. **Elasticsearch node failure**: Replica shards promoted to primary. Index writes continue on remaining nodes. Recovery copies data from replicas.\n4. **Log agent crash**: Logs written to local disk are safe. Agent resumes from file position bookmark on restart.\n5. **Network partition between agent and Kafka**: Agent buffers locally up to configurable limit, then applies backpressure (drops debug/trace logs first).\n\n**Bottleneck Identification:**\n- **Indexing throughput**: Elasticsearch bulk indexing is the most common bottleneck. Mitigation: tune bulk size (5-15 MB), refresh interval (30s for hot, 60s for warm), use doc_values for aggregations.\n- **Disk I/O on hot nodes**: SSD is mandatory. NVMe preferred for > 100K docs/sec per node.\n- **JVM heap pressure**: Elasticsearch field data and query caches consume heap. Keep heap at 50% of RAM (max 31 GB for compressed oops).\n- **Parsing CPU**: Grok patterns with complex regex are CPU-intensive. Pre-structure logs as JSON at the source when possible.\n\n**Monitoring:**\n- Kafka consumer lag per stream processor instance\n- Elasticsearch indexing rate, search latency, and cluster health\n- Log agent buffer utilization and drop rate\n- Index size growth rate vs retention policy\n- Query latency percentiles by query type\n\n**Trade-offs:**\n- **Structured vs unstructured**: JSON logs are 2-3x larger but eliminate parsing CPU. Worth it for high-volume services.\n- **Index per service vs shared index**: Per-service indices give isolation but increase cluster metadata overhead. Shared indices with routing are more efficient but risk noisy-neighbor.\n- **Real-time vs batch indexing**: Lower refresh_interval = faster search but higher indexing cost. 30s is a good balance.`,
    timeComplexity: `**Performance Characteristics:**\n- Log ingestion: O(1) per log entry (Kafka append + buffer flush)\n- Index operation: O(T) where T = number of tokens in the log line (inverted index update)\n- Full-text search: O(N/S) where N = total docs in time range, S = number of shards (parallelized)\n- Aggregation: O(D) where D = docs matching filter, using doc_values for O(1) per-doc field access\n- ILM rotation: O(1) per index (metadata update + background merge)\n- Time-range query optimization: O(I) where I = number of indices in range (typically 1-7 for hot tier)`,
    spaceComplexity: `**Storage Requirements:**\n- Raw log storage: 5 TB/day\n- Hot tier (7 days, SSD): 35 TB raw + ~18 TB index = 53 TB, with 1 replica = 106 TB across 20 nodes\n- Warm tier (23 days, HDD): force-merged and compressed ~3:1 = 38 TB, with 1 replica = 76 TB\n- Cold tier (60 days, object storage): compressed 5:1 = 60 TB in S3/GCS\n- Kafka buffer: 5 TB x 1 day retention x 3 replicas = 15 TB\n- Total infrastructure: ~200 TB hot SSD + 80 TB warm HDD + 60 TB object storage + 15 TB Kafka\n- RAM: 64 GB per hot node (50% heap, 50% OS page cache) = 1.28 TB total RAM for hot tier`,
    hints: [
      `Implement a LogPipeline class with internal buffer, configurable max size, and backpressure detection. When buffer exceeds threshold, reject new entries and signal backpressure. Flush in configurable batch sizes either on timer or when batch size is reached.`,
      `Build a TimeBasedIndexManager that creates daily indices with rollover support. When an index exceeds 50 GB, create a new segment (e.g., logs-payment-2025.03.15-000002). Implement ILM that transitions indices from hot to warm to cold based on age.`,
      `Create a StructuredLogParser that tries JSON parsing first, then falls back to registered regex patterns (grok-like), then extracts common fields (timestamp, level) from raw text. Support custom field extractors for application-specific patterns.`,
      `Implement a LogQueryEngine that targets only indices within the requested time range (pruning), applies field filters before full-text matching for efficiency, and supports AND/OR boolean queries with field scoping.`,
      `For the log agent, implement priority-based backpressure: when downstream is slow, drop DEBUG/TRACE first, then INFO, but never drop ERROR/FATAL. Maintain a separate high-priority buffer for critical logs.`,
      `Use bulk indexing with optimal batch sizes (5-15 MB per bulk request). Tune the Elasticsearch refresh_interval to 30 seconds for hot indices (default 1s is too aggressive for log ingestion). Force merge warm indices to 1 segment for query performance.`,
      `Implement a simple alerting engine that evaluates rules against the query engine periodically. Support conditions like "more than 100 errors in 5 minutes for service X". Include cooldown periods to prevent alert storms.`,
      `For schema evolution, use dynamic mappings with explicit type coercion. When a field changes type (e.g., status from integer to string), create a new index template version rather than trying to update existing mappings. Use field aliases for backward compatibility.`
    ]
  },
  {
    id: 9028,
    description: `Design a Recommendation Engine\n\n**Functional Requirements:**\n- Generate personalized recommendations for millions of users\n- Combine collaborative filtering (users who liked X also liked Y), content-based filtering (similar items by features), and popularity-based recommendations\n- Serve recommendations with < 100 ms latency\n- Refresh base recommendations daily via batch pipeline; apply real-time boosts from recent interactions\n- Handle cold-start problem for new users (no history) and new items (no interactions)\n- Support multiple recommendation surfaces (home page, item detail, search results)\n\n**Non-Functional Requirements:**\n- Scale: 50M daily active users, 10M item catalog\n- Throughput: 100K recommendation requests/sec at peak\n- Latency: p50 < 30 ms, p99 < 100 ms serving latency\n- Freshness: New items surfaced within 1 hour of publication\n- Diversity: Avoid filter bubbles; balance relevance with exploration\n\n**Capacity Estimation:**\n- User-item interaction matrix: 50M users x 10M items (extremely sparse, ~0.01% filled)\n- Interaction events: 500M clicks/day, 50M purchases/day\n- Feature store: 50M user profiles x 1 KB = 50 GB; 10M item profiles x 2 KB = 20 GB\n- Embedding vectors: 50M users x 128 floats x 4 bytes = 25.6 GB; 10M items x 128 dims = 5.1 GB\n- ANN index for 10M items: ~10 GB in memory\n- Pre-computed recommendations: 50M users x 200 candidates x 8 bytes = 80 GB`,
    examples: `**Capacity Walkthrough:**\nInteraction data for training:\n- 500M clicks + 50M purchases per day = 550M events\n- 90-day training window: 550M x 90 = 49.5B interaction records\n- Sparse matrix: only 49.5B / (50M x 10M) = 0.0099% filled\n- ALS training: 50M user vectors + 10M item vectors at 128 dimensions\n- Training time: ~2 hours on 100-node Spark cluster\n\nServing:\n- 100K requests/sec, each fetches 200 candidates then ranks top 50\n- ANN query: ~1ms per query on HNSW index\n- Ranking model inference: ~5ms per 200 candidates\n- Total: <30ms p50 end-to-end\n\n**API Design:**\n\`\`\`\nGET /api/v1/recommendations/{userId}?surface=home&limit=50\n  Response: { items: [{ itemId, score, reason }], model_version: "v23" }\n\nGET /api/v1/similar/{itemId}?limit=20\n  Response: { items: [{ itemId, similarity, shared_features }] }\n\nPOST /api/v1/events\n  Body: { userId, itemId, event: "click|purchase|view", timestamp }\n  Response: { accepted: true }\n\`\`\``,
    intuition: `Think of a recommendation engine as a matchmaker that connects users with items they are likely to enjoy. It works in two stages, just like a dating service: first, cast a wide net to find plausible matches (candidate generation), then carefully evaluate each match to rank the best ones (scoring/ranking).\n\nThe key insight behind collaborative filtering is **the wisdom of crowds**: if users A and B liked many of the same items, then items liked by A but not yet seen by B are good recommendations for B. Matrix factorization (ALS) captures this by decomposing the sparse user-item interaction matrix into two low-rank matrices — user embeddings and item embeddings — where the dot product of a user vector and item vector predicts the interaction score.\n\nThe cold-start problem is the classic chicken-and-egg: you need interactions to recommend, but you need recommendations to get interactions. The solution is a **fallback cascade**: for new users, use content-based features (demographics, stated preferences); for new items, use item features (category, description embeddings) to find similar known items.\n\nThe two-stage architecture (candidate generation + ranking) is crucial for latency. Scoring all 10M items per user is infeasible at 100K QPS. Instead, generate ~200 candidates using fast approximate nearest neighbor (ANN) search on embeddings, then apply a heavier ranking model only on those 200.`,
    approach: `**Architecture Overview:**\n\n1. **Event Ingestion**: User interactions (clicks, views, purchases, ratings) flow into Kafka. A stream processor updates a real-time feature store (Redis) with recent user activity and item popularity counters.\n\n2. **Feature Store**: Two layers: (a) Batch features computed daily (user demographics, item categories, historical engagement stats), stored in a feature warehouse (BigQuery/Hive) and synced to serving store. (b) Real-time features (last 10 clicks, session context) in Redis.\n\n3. **Training Pipeline (Daily Batch)**:\n   - Export 90-day interactions from data warehouse\n   - Train ALS matrix factorization on Spark (128-dim embeddings for users and items)\n   - Train content-based embeddings using item metadata (title, description, category) via a neural network\n   - Build ANN index (HNSW) from item embeddings for fast nearest-neighbor lookup\n   - Pre-compute top-200 candidates per user and store in Redis\n\n4. **Candidate Generation (Online)**:\n   - Source 1: Pre-computed collaborative filtering candidates (ALS dot product top-K)\n   - Source 2: ANN lookup using user embedding against item embedding index\n   - Source 3: Content-based similar items from user's recent interactions\n   - Source 4: Trending/popular items (popularity decay curve)\n   - Merge and deduplicate ~200 candidates\n\n5. **Ranking Service (Online)**:\n   - Fetch real-time features for user and all 200 candidates\n   - Apply a lightweight ranking model (gradient-boosted trees or small neural net) that scores each (user, item) pair\n   - Features: user-item embedding dot product, item freshness, user engagement history, contextual features (time of day, device)\n   - Re-rank by score, apply diversity/fairness filters, return top 50\n\n6. **Cold-Start Handling**:\n   - New users: Use demographic + onboarding preference features, fallback to popularity-based\n   - New items: Embed using content features, inject into candidate generation via content-based path\n\n**Database/Storage:**\n- Interaction events: Kafka -> data warehouse (BigQuery) for training\n- Feature store (batch): Redis cluster with user and item feature hashes\n- Feature store (real-time): Redis sorted sets for recent user clicks\n- Embedding store: ANN index (Faiss/ScaNN) served from memory\n- Pre-computed candidates: Redis sorted sets per user`,
    code: `// ============================================================
// Recommendation Engine: Core Algorithm Implementations
// ============================================================

class MatrixFactorizationALS {
  constructor(numFactors = 128, regularization = 0.1, iterations = 10) {
    this.numFactors = numFactors;
    this.lambda = regularization;
    this.iterations = iterations;
    this.userFactors = new Map(); // userId -> Float64Array
    this.itemFactors = new Map(); // itemId -> Float64Array
  }

  initRandom(users, items) {
    for (const u of users) {
      const vec = new Float64Array(this.numFactors);
      for (let i = 0; i < this.numFactors; i++) vec[i] = (Math.random() - 0.5) * 0.1;
      this.userFactors.set(u, vec);
    }
    for (const item of items) {
      const vec = new Float64Array(this.numFactors);
      for (let i = 0; i < this.numFactors; i++) vec[i] = (Math.random() - 0.5) * 0.1;
      this.itemFactors.set(item, vec);
    }
  }

  train(interactions) {
    // interactions: [{ userId, itemId, rating }]
    const userItems = new Map(); // userId -> [{itemId, rating}]
    const itemUsers = new Map(); // itemId -> [{userId, rating}]

    for (const { userId, itemId, rating } of interactions) {
      if (!userItems.has(userId)) userItems.set(userId, []);
      userItems.get(userId).push({ itemId, rating });
      if (!itemUsers.has(itemId)) itemUsers.set(itemId, []);
      itemUsers.get(itemId).push({ userId, rating });
    }

    this.initRandom([...userItems.keys()], [...itemUsers.keys()]);

    for (let iter = 0; iter < this.iterations; iter++) {
      // Fix items, solve for users
      for (const [userId, items] of userItems) {
        const newVec = this.solveForEntity(items, this.itemFactors);
        this.userFactors.set(userId, newVec);
      }
      // Fix users, solve for items
      for (const [itemId, users] of itemUsers) {
        const newVec = this.solveForEntity(users, this.userFactors);
        this.itemFactors.set(itemId, newVec);
      }
    }
  }

  solveForEntity(ratings, fixedFactors) {
    const k = this.numFactors;
    // ATA + lambda * I
    const AtA = new Float64Array(k * k);
    const Atb = new Float64Array(k);

    for (const { itemId, userId, rating } of ratings) {
      const id = itemId || userId;
      const vec = fixedFactors.get(id);
      if (!vec) continue;
      const r = rating;
      for (let i = 0; i < k; i++) {
        Atb[i] += vec[i] * r;
        for (let j = 0; j < k; j++) {
          AtA[i * k + j] += vec[i] * vec[j];
        }
      }
    }

    for (let i = 0; i < k; i++) AtA[i * k + i] += this.lambda;
    return this.solveLinearSystem(AtA, Atb, k);
  }

  solveLinearSystem(A, b, n) {
    // Simple Gaussian elimination for small n
    const aug = new Float64Array(n * (n + 1));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) aug[i * (n + 1) + j] = A[i * n + j];
      aug[i * (n + 1) + n] = b[i];
    }

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[row * (n + 1) + col]) > Math.abs(aug[maxRow * (n + 1) + col])) {
          maxRow = row;
        }
      }
      for (let j = 0; j <= n; j++) {
        const tmp = aug[col * (n + 1) + j];
        aug[col * (n + 1) + j] = aug[maxRow * (n + 1) + j];
        aug[maxRow * (n + 1) + j] = tmp;
      }
      const pivot = aug[col * (n + 1) + col];
      if (Math.abs(pivot) < 1e-10) continue;
      for (let row = col + 1; row < n; row++) {
        const factor = aug[row * (n + 1) + col] / pivot;
        for (let j = col; j <= n; j++) {
          aug[row * (n + 1) + j] -= factor * aug[col * (n + 1) + j];
        }
      }
    }

    const x = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let sum = aug[i * (n + 1) + n];
      for (let j = i + 1; j < n; j++) sum -= aug[i * (n + 1) + j] * x[j];
      const diag = aug[i * (n + 1) + i];
      x[i] = Math.abs(diag) > 1e-10 ? sum / diag : 0;
    }
    return x;
  }

  predict(userId, itemId) {
    const userVec = this.userFactors.get(userId);
    const itemVec = this.itemFactors.get(itemId);
    if (!userVec || !itemVec) return 0;
    let dot = 0;
    for (let i = 0; i < this.numFactors; i++) dot += userVec[i] * itemVec[i];
    return dot;
  }

  recommendForUser(userId, topK = 50, excludeItems = new Set()) {
    const userVec = this.userFactors.get(userId);
    if (!userVec) return [];
    const scores = [];
    for (const [itemId, itemVec] of this.itemFactors) {
      if (excludeItems.has(itemId)) continue;
      let dot = 0;
      for (let i = 0; i < this.numFactors; i++) dot += userVec[i] * itemVec[i];
      scores.push({ itemId, score: dot });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }
}

class CosineSimilarityIndex {
  constructor() {
    this.vectors = new Map();
    this.norms = new Map();
  }

  addItem(itemId, vector) {
    this.vectors.set(itemId, vector);
    let norm = 0;
    for (let i = 0; i < vector.length; i++) norm += vector[i] * vector[i];
    this.norms.set(itemId, Math.sqrt(norm));
  }

  similarity(idA, idB) {
    const vecA = this.vectors.get(idA);
    const vecB = this.vectors.get(idB);
    if (!vecA || !vecB) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
    const normA = this.norms.get(idA);
    const normB = this.norms.get(idB);
    return normA > 0 && normB > 0 ? dot / (normA * normB) : 0;
  }

  findSimilar(itemId, topK = 20) {
    const results = [];
    for (const [otherId] of this.vectors) {
      if (otherId === itemId) continue;
      results.push({ itemId: otherId, similarity: this.similarity(itemId, otherId) });
    }
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }
}`,
    jsCode: `// ============================================================
// Two-Stage Recommend-and-Rank Pipeline + Cold Start Handler
// ============================================================

class RecommendationPipeline {
  constructor(alsModel, similarityIndex, options = {}) {
    this.alsModel = alsModel;
    this.similarityIndex = similarityIndex;
    this.popularityScores = new Map();
    this.userHistory = new Map(); // userId -> Set of interacted itemIds
    this.realtimeBoosts = new Map(); // userId -> [{itemId, boost, timestamp}]
    this.coldStartHandler = new ColdStartHandler();
    this.diversityFactor = options.diversityFactor || 0.3;
  }

  updatePopularity(itemId, score) {
    this.popularityScores.set(itemId, score);
  }

  addUserInteraction(userId, itemId) {
    if (!this.userHistory.has(userId)) this.userHistory.set(userId, new Set());
    this.userHistory.get(userId).add(itemId);
  }

  addRealtimeBoost(userId, itemId, boost) {
    if (!this.realtimeBoosts.has(userId)) this.realtimeBoosts.set(userId, []);
    this.realtimeBoosts.get(userId).push({ itemId, boost, timestamp: Date.now() });
  }

  recommend(userId, options = {}) {
    const { limit = 50, surface = 'home' } = options;
    const history = this.userHistory.get(userId) || new Set();
    const isNewUser = history.size < 5;

    // Stage 1: Candidate generation
    let candidates = new Map(); // itemId -> { score, source }

    if (isNewUser) {
      const coldStartItems = this.coldStartHandler.getRecommendations(userId, 200);
      for (const item of coldStartItems) {
        candidates.set(item.itemId, { score: item.score, source: 'cold_start' });
      }
    } else {
      // Source 1: Collaborative filtering (ALS)
      const cfCandidates = this.alsModel.recommendForUser(userId, 100, history);
      for (const item of cfCandidates) {
        candidates.set(item.itemId, { score: item.score * 0.6, source: 'collaborative' });
      }

      // Source 2: Content-based (similar to recent interactions)
      const recentItems = [...history].slice(-10);
      for (const itemId of recentItems) {
        const similar = this.similarityIndex.findSimilar(itemId, 20);
        for (const sim of similar) {
          if (history.has(sim.itemId)) continue;
          const existing = candidates.get(sim.itemId);
          const score = sim.similarity * 0.3;
          if (!existing || existing.score < score) {
            candidates.set(sim.itemId, { score, source: 'content_based' });
          }
        }
      }
    }

    // Source 3: Popularity (always included for diversity)
    const topPopular = [...this.popularityScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);
    for (const [itemId, popScore] of topPopular) {
      if (history.has(itemId)) continue;
      if (!candidates.has(itemId)) {
        candidates.set(itemId, { score: popScore * 0.1, source: 'popularity' });
      }
    }

    // Stage 2: Ranking
    const ranked = this.rank(userId, candidates, surface);

    // Apply real-time boosts
    const boosts = this.realtimeBoosts.get(userId) || [];
    const recentBoosts = boosts.filter(b => Date.now() - b.timestamp < 3600000);
    for (const boost of recentBoosts) {
      const item = ranked.find(r => r.itemId === boost.itemId);
      if (item) item.score += boost.boost;
    }

    // Apply diversity re-ranking
    const diversified = this.applyDiversity(ranked, limit);
    return diversified.slice(0, limit);
  }

  rank(userId, candidates, surface) {
    const ranked = [];
    for (const [itemId, data] of candidates) {
      let score = data.score;
      const popScore = this.popularityScores.get(itemId) || 0;
      score += popScore * 0.05;

      // Surface-specific adjustments
      if (surface === 'detail') score *= 1.2;
      ranked.push({ itemId, score, source: data.source });
    }
    ranked.sort((a, b) => b.score - a.score);
    return ranked;
  }

  applyDiversity(ranked, limit) {
    if (ranked.length <= limit) return ranked;
    const result = [ranked[0]];
    const sourceCount = {};
    sourceCount[ranked[0].source] = 1;

    for (let i = 1; i < ranked.length && result.length < limit; i++) {
      const item = ranked[i];
      const sourcePenalty = (sourceCount[item.source] || 0) * this.diversityFactor;
      const adjustedScore = item.score - sourcePenalty;
      item.adjustedScore = adjustedScore;
      result.push(item);
      sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
    }
    result.sort((a, b) => (b.adjustedScore || b.score) - (a.adjustedScore || a.score));
    return result;
  }
}

class ColdStartHandler {
  constructor() {
    this.userProfiles = new Map(); // userId -> { demographics, preferences }
    this.categoryPopularity = new Map();
    this.segmentRecommendations = new Map(); // segment -> [itemIds]
  }

  setUserProfile(userId, profile) {
    this.userProfiles.set(userId, profile);
  }

  setCategoryPopularity(category, items) {
    this.categoryPopularity.set(category, items);
  }

  setSegmentRecommendations(segment, items) {
    this.segmentRecommendations.set(segment, items);
  }

  getRecommendations(userId, limit = 200) {
    const profile = this.userProfiles.get(userId);
    const results = [];

    if (profile && profile.preferences) {
      // Use stated preferences
      for (const pref of profile.preferences) {
        const categoryItems = this.categoryPopularity.get(pref) || [];
        for (const item of categoryItems.slice(0, 30)) {
          results.push({ itemId: item.itemId, score: item.score * 0.8 });
        }
      }
    }

    if (profile && profile.segment) {
      const segItems = this.segmentRecommendations.get(profile.segment) || [];
      for (const item of segItems.slice(0, 50)) {
        if (!results.find(r => r.itemId === item.itemId)) {
          results.push({ itemId: item.itemId, score: item.score * 0.5 });
        }
      }
    }

    // Always pad with global popularity
    const globalPop = this.categoryPopularity.get('__global') || [];
    for (const item of globalPop.slice(0, 50)) {
      if (!results.find(r => r.itemId === item.itemId)) {
        results.push({ itemId: item.itemId, score: item.score * 0.3 });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}`,
    explanation: `**Scaling Analysis:**\n- **Training pipeline**: Runs daily on Spark/Flink. ALS with 50M users and 10M items at 128 factors takes ~2 hours on 100 executor nodes. Distribute by user partitions for user update step, by item partitions for item update step.\n- **ANN index**: HNSW index with 10M items at 128 dims fits in ~10 GB RAM. Query time ~1ms. Replicate across multiple serving nodes for availability.\n- **Feature store**: Redis cluster with 50M user hashes + 10M item hashes. Total ~70 GB. Shard across 10 Redis nodes.\n- **Serving tier**: Stateless ranking service behind load balancer. Each instance handles ~5K requests/sec. 20 instances for 100K QPS peak.\n\n**Failure Modes:**\n1. **Training pipeline failure**: Serve stale model from previous day. Models degrade gracefully over days, not hours.\n2. **Feature store (Redis) failure**: Fall back to pre-computed candidates without real-time features. Quality degrades but latency stays low.\n3. **ANN index serving failure**: Fall back to pre-computed candidate lists. These are updated daily and stored in Redis.\n4. **Cold start for viral item**: New item with no interactions. Content-based embedding places it near similar items. Popularity signal propagates within hours.\n\n**Bottleneck Identification:**\n- **Training time**: ALS alternating optimization is embarrassingly parallel per user/item but involves large matrix operations. Bottleneck is shuffle step between user and item phases.\n- **Serving latency**: ANN query (1ms) + feature fetch (2-3ms) + ranking model inference (5ms) + overhead = ~15-20ms. Ranking model is the bottleneck; use ONNX runtime for fast inference.\n- **Feature freshness**: Real-time features depend on event pipeline latency. Target <1 min from click to feature update.\n\n**Monitoring:**\n- Model quality: offline metrics (NDCG, recall@K) and online A/B tests (CTR, conversion rate)\n- Serving latency percentiles (p50, p95, p99)\n- Cache hit rate for pre-computed candidates\n- Cold-start rate (% of requests falling back to popularity)\n- Diversity metrics (entropy of recommended item categories)\n\n**Trade-offs:**\n- **Collaborative vs content-based**: CF captures taste but suffers cold-start; content-based works for new items but can over-recommend similar items (filter bubble).\n- **Pre-computed vs real-time candidates**: Pre-computed is fast but stale; real-time is fresh but adds latency. Solution: pre-compute as primary, real-time as boost.\n- **Accuracy vs diversity**: Pure relevance ranking creates filter bubbles. Inject exploration (epsilon-greedy or MMR re-ranking) at the cost of short-term engagement.\n- **Simple (ALS) vs complex (deep learning) models**: ALS is interpretable and fast to train. Deep models capture non-linear patterns but are harder to debug and serve.`,
    timeComplexity: `**Performance Characteristics:**\n- ALS training: O(I * (N_u + N_i) * K^2 * nnz/N) per iteration where I=iterations, K=factors, nnz=non-zero interactions, N=parallelism\n- ANN query (HNSW): O(log N * ef_search) where N=10M items, ef_search=100, typically <1ms\n- Ranking inference: O(C * F) where C=200 candidates, F=feature vector size, ~5ms with optimized runtime\n- Cosine similarity (brute force): O(N * K) for finding top-K similar among N items with K-dim vectors\n- End-to-end serving: O(1) pre-computed lookup + O(C * log C) for re-ranking C candidates`,
    spaceComplexity: `**Storage Requirements:**\n- User embeddings: 50M users x 128 dims x 4 bytes = 25.6 GB\n- Item embeddings: 10M items x 128 dims x 4 bytes = 5.1 GB\n- ANN index (HNSW): ~2x embedding size = 10.2 GB for items\n- Pre-computed candidates: 50M users x 200 items x 12 bytes (itemId + score) = 120 GB\n- Feature store: 50M user profiles (1 KB) + 10M item profiles (2 KB) = 70 GB in Redis\n- Interaction history: 49.5B records at ~20 bytes = 990 GB in data warehouse\n- Real-time feature store: 50M user x 100 bytes (recent clicks) = 5 GB in Redis\n- Total serving infrastructure: ~240 GB RAM across cluster`,
    hints: [
      `Implement ALS (Alternating Least Squares) matrix factorization: alternately fix item factors and solve for user factors, then fix user factors and solve for item factors. Each solve step is a linear system (A^T A + lambda I) x = A^T b. Use Gaussian elimination for the per-entity solve.`,
      `Build a two-stage pipeline: candidate generation produces ~200 items using fast methods (ANN lookup, pre-computed lists), then a ranking model scores all 200 with richer features. This keeps latency under 100ms while using a high-quality ranking model.`,
      `Implement cosine similarity for item-item matching: normalize embedding vectors and compute dot products. Pre-compute and cache the top-K similar items per item for the "similar items" surface.`,
      `Handle cold-start with a fallback cascade: (1) content-based recommendations from user's stated preferences, (2) segment-based recommendations (users in same demographic cluster), (3) global popularity. Weight them based on confidence.`,
      `For real-time boosts, maintain a short-lived boost map per user. When a user clicks on a category, boost items in that category for the next hour. This gives immediate responsiveness without re-training the model.`,
      `Apply diversity re-ranking after scoring: penalize candidates from over-represented sources or categories. Use Maximal Marginal Relevance (MMR) or a simple source-count penalty to ensure the recommendation list covers multiple categories and sources.`,
      `Design the training pipeline to be idempotent and versioned. Each training run produces a model version (e.g., v23). The serving layer can atomically switch between model versions. Keep the previous version for instant rollback if quality drops.`,
      `Monitor for feedback loops: if recommendations drive most user interactions, the model trains on its own output and converges to a narrow set of items. Inject random exploration (5-10% of recommendations) and track diversity metrics over time.`
    ]
  },
  {
    id: 9029,
    description: `Design a CI/CD Pipeline (GitHub Actions-like)\n\n**Functional Requirements:**\n- Trigger workflows on push, pull request, schedule (cron), manual dispatch, and external webhooks\n- Define multi-step workflows in YAML with jobs containing ordered steps\n- Support parallel and sequential job execution with dependency graphs (DAG)\n- Run each job in an isolated environment (container or ephemeral VM)\n- Provide artifact upload/download between jobs and caching of dependencies\n- Secure secret management (encrypted at rest, masked in logs)\n- Real-time log streaming and workflow status updates\n\n**Non-Functional Requirements:**\n- Scale: Support 10,000 concurrent workflow runs across 50,000 repositories\n- Latency: Job pickup time < 10 seconds from trigger event\n- Reliability: No lost triggers; at-least-once execution guarantee\n- Isolation: Complete isolation between workflow runs (filesystem, network, environment)\n- Security: Secrets never exposed in logs; minimal attack surface for runner environments\n\n**Capacity Estimation:**\n- 500K workflow runs/day, average 3 jobs per workflow = 1.5M jobs/day\n- Average job duration: 5 minutes\n- Peak concurrent jobs: 10,000\n- Log volume: 1 MB per job average = 1.5 TB/day\n- Artifact storage: 500 MB per workflow average = 250 TB/day (7-day retention)\n- Cache storage: 500 MB per repo average x 50,000 repos = 25 TB`,
    examples: `**Capacity Walkthrough:**\n1.5M jobs/day = ~17.4 jobs/sec average, ~50 jobs/sec peak\nAverage job duration 5 min = 300 sec\nConcurrent jobs at peak: 50 jobs/sec x 300 sec = 15,000\nRunner pool: 15,000 / 0.8 utilization = ~19,000 runners\n\nRunner VM cost estimation:\n- 19,000 VMs x 2 vCPU x 8 GB RAM\n- Spot/preemptible pricing: ~$0.02/hour per vCPU\n- Cost: 19,000 x 2 x $0.02 = $760/hour at peak\n\nLog storage:\n- 1.5M jobs x 1 MB = 1.5 TB/day\n- 30-day retention: 45 TB\n- Compressed 5:1 = 9 TB\n\n**API Design:**\n\`\`\`\nPOST /api/v1/repos/{owner}/{repo}/actions/runs\n  Body: { workflow_file: "ci.yml", ref: "main", inputs: {...} }\n  Response: { run_id: 12345, status: "queued" }\n\nGET /api/v1/repos/{owner}/{repo}/actions/runs/{runId}\n  Response: { status: "in_progress", jobs: [{ id, name, status, steps }] }\n\nGET /api/v1/repos/{owner}/{repo}/actions/runs/{runId}/jobs/{jobId}/logs\n  Response: (streaming text/plain with live updates via SSE)\n\nPOST /api/v1/repos/{owner}/{repo}/actions/cache\n  Body: { key: "node-modules-{hash}", paths: ["node_modules/"] }\n\`\`\``,
    intuition: `Think of a CI/CD pipeline as a highly automated factory assembly line. Each workflow is a manufacturing order, each job is a workstation on the assembly line, and each step is a specific operation at that workstation. The workflow YAML is the blueprint, the scheduler is the floor manager assigning orders to stations, and runners are the workers.\n\nThe key insight is that workflows form a **Directed Acyclic Graph (DAG)**: jobs can depend on other jobs, but there cannot be circular dependencies. This DAG structure naturally tells you what can run in parallel (independent nodes) and what must wait (downstream nodes). Topological sort gives you the execution order, and you fire all ready jobs simultaneously.\n\nAnother critical insight is **ephemeral isolation**: each job runs in a fresh environment (container/VM) that is destroyed after completion. This ensures reproducibility (no state leakage between runs) and security (a compromised job cannot affect others). The cost is startup overhead (~5-10 seconds for containers, ~30-60 seconds for VMs).\n\nCaching is the key performance optimization. Without caching, every job re-downloads dependencies from scratch (npm install: 30-60 seconds). With content-addressed caching (hash of lockfile as cache key), dependency installation drops to seconds.`,
    approach: `**Architecture Overview:**\n\n1. **Event Listener**: Receives webhook events from GitHub (push, PR, etc.), cron triggers from scheduler, and manual dispatch from UI/API. Validates event, resolves workflow YAML from the repository at the correct ref/SHA, and publishes workflow run events to a queue.\n\n2. **Workflow Engine**: Consumes workflow run events. Parses YAML, builds the job DAG, resolves matrix strategies (expand matrix into individual jobs), and creates job records in the database. Manages the lifecycle: queued -> in_progress -> completed/failed/cancelled.\n\n3. **Scheduler**: Matches queued jobs to available runners based on labels (os, architecture, custom labels). Uses priority queue (FIFO within priority, higher priority for PRs over scheduled runs). Implements fair-share scheduling to prevent one repo from monopolizing runners.\n\n4. **Runner Pool**: Fleet of ephemeral environments. Auto-scaler monitors queue depth and adjusts pool size. Each runner: (a) pulls job spec, (b) checks out code, (c) restores cache, (d) executes steps sequentially, (e) uploads artifacts, (f) streams logs, (g) reports status, (h) self-terminates.\n\n5. **Artifact & Cache Store**: S3-compatible object storage. Artifacts: keyed by (run_id, artifact_name), 7-day retention. Cache: keyed by (repo, cache_key_hash), LRU eviction per repo with 10 GB quota.\n\n6. **Secret Manager**: Encrypted secrets stored in Vault/KMS. Decrypted only inside the runner at step execution time. Log masking: all secret values are pattern-matched in stdout/stderr and replaced with ***.\n\n7. **Log Service**: Each step streams output to a log aggregation service. Stored as append-only log segments. Supports real-time streaming via Server-Sent Events (SSE) and historical retrieval.\n\n**Database Schema:**\n- WorkflowRuns: runId, repoId, workflowFile, sha, status, trigger, createdAt, updatedAt\n- Jobs: jobId, runId, name, status, runnerId, startedAt, completedAt, conclusion\n- Steps: stepId, jobId, name, status, exitCode, logUrl\n- Artifacts: artifactId, runId, name, size, storageUrl, expiresAt\n- Caches: cacheId, repoId, key, version, size, storageUrl, lastAccessed\n- Secrets: secretId, repoId/orgId, name, encryptedValue, scope`,
    code: `// ============================================================
// CI/CD Pipeline: Core Component Implementations
// ============================================================

class DAGWorkflowExecutor {
  constructor() {
    this.jobs = new Map(); // jobId -> { name, needs: [], steps: [], status, result }
    this.adjacency = new Map();
    this.inDegree = new Map();
    this.callbacks = { onJobStart: null, onJobComplete: null, onStepComplete: null };
  }

  addJob(jobId, config) {
    this.jobs.set(jobId, {
      name: config.name || jobId,
      needs: config.needs || [],
      steps: config.steps || [],
      status: 'pending',
      result: null,
      startedAt: null,
      completedAt: null,
      outputs: {}
    });
    this.adjacency.set(jobId, []);
    this.inDegree.set(jobId, 0);
  }

  buildDAG() {
    for (const [jobId, job] of this.jobs) {
      for (const dep of job.needs) {
        if (!this.adjacency.has(dep)) throw new Error(\`Unknown dependency: \${dep}\`);
        this.adjacency.get(dep).push(jobId);
        this.inDegree.set(jobId, (this.inDegree.get(jobId) || 0) + 1);
      }
    }
    if (this.hasCycle()) throw new Error('Circular dependency detected in workflow');
  }

  hasCycle() {
    const visited = new Set();
    const recStack = new Set();
    const dfs = (node) => {
      visited.add(node);
      recStack.add(node);
      for (const neighbor of (this.adjacency.get(node) || [])) {
        if (!visited.has(neighbor)) { if (dfs(neighbor)) return true; }
        else if (recStack.has(neighbor)) return true;
      }
      recStack.delete(node);
      return false;
    };
    for (const jobId of this.jobs.keys()) {
      if (!visited.has(jobId) && dfs(jobId)) return true;
    }
    return false;
  }

  topologicalSort() {
    const sorted = [];
    const inDegree = new Map(this.inDegree);
    const queue = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }
    while (queue.length > 0) {
      const node = queue.shift();
      sorted.push(node);
      for (const neighbor of (this.adjacency.get(node) || [])) {
        const newDeg = inDegree.get(neighbor) - 1;
        inDegree.set(neighbor, newDeg);
        if (newDeg === 0) queue.push(neighbor);
      }
    }
    if (sorted.length !== this.jobs.size) throw new Error('Cycle detected');
    return sorted;
  }

  async execute() {
    this.buildDAG();
    const completed = new Set();
    const running = new Set();
    const inDegree = new Map(this.inDegree);

    const getReadyJobs = () => {
      const ready = [];
      for (const [jobId, job] of this.jobs) {
        if (job.status === 'pending' && inDegree.get(jobId) === 0) {
          const depsSucceeded = job.needs.every(
            dep => this.jobs.get(dep).result === 'success'
          );
          if (job.needs.length === 0 || depsSucceeded) {
            ready.push(jobId);
          } else {
            job.status = 'skipped';
            job.result = 'skipped';
            this.completeJob(jobId, completed, inDegree);
          }
        }
      }
      return ready;
    };

    return new Promise((resolve) => {
      const tick = () => {
        const ready = getReadyJobs();
        for (const jobId of ready) {
          running.add(jobId);
          this.runJob(jobId).then(result => {
            running.delete(jobId);
            this.completeJob(jobId, completed, inDegree);
            if (completed.size === this.jobs.size) {
              resolve(this.getSummary());
            } else { tick(); }
          });
        }
        if (ready.length === 0 && running.size === 0) resolve(this.getSummary());
      };
      tick();
    });
  }

  completeJob(jobId, completed, inDegree) {
    completed.add(jobId);
    for (const neighbor of (this.adjacency.get(jobId) || [])) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
    }
  }

  async runJob(jobId) {
    const job = this.jobs.get(jobId);
    job.status = 'running';
    job.startedAt = Date.now();
    if (this.callbacks.onJobStart) this.callbacks.onJobStart(jobId, job);

    for (const step of job.steps) {
      const stepResult = await this.runStep(jobId, step);
      if (this.callbacks.onStepComplete) this.callbacks.onStepComplete(jobId, step, stepResult);
      if (!stepResult.success && !step.continueOnError) {
        job.status = 'completed';
        job.result = 'failure';
        job.completedAt = Date.now();
        return 'failure';
      }
    }
    job.status = 'completed';
    job.result = 'success';
    job.completedAt = Date.now();
    if (this.callbacks.onJobComplete) this.callbacks.onJobComplete(jobId, job);
    return 'success';
  }

  async runStep(jobId, step) {
    try {
      if (step.run) {
        // Simulate command execution
        return { success: true, output: \`Executed: \${step.run}\`, exitCode: 0 };
      }
      return { success: true, output: 'Step completed', exitCode: 0 };
    } catch (err) {
      return { success: false, output: err.message, exitCode: 1 };
    }
  }

  getSummary() {
    const summary = { jobs: {}, success: true, duration: 0 };
    for (const [id, job] of this.jobs) {
      summary.jobs[id] = { status: job.result, duration: (job.completedAt || 0) - (job.startedAt || 0) };
      if (job.result === 'failure') summary.success = false;
    }
    return summary;
  }
}

class DependencyCacheManager {
  constructor(options = {}) {
    this.caches = new Map(); // "repoId:key" -> { data, size, lastAccessed, createdAt }
    this.repoQuotas = new Map(); // repoId -> { used, limit }
    this.defaultQuota = options.defaultQuota || 10 * 1024 * 1024 * 1024; // 10 GB
  }

  computeKey(lockfilePaths) {
    let hash = 0;
    const content = lockfilePaths.sort().join('|');
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
    }
    return \`cache-\${Math.abs(hash).toString(36)}\`;
  }

  save(repoId, key, data, paths) {
    const size = JSON.stringify(data).length;
    this.ensureQuota(repoId, size);

    const cacheKey = \`\${repoId}:\${key}\`;
    this.caches.set(cacheKey, {
      data, size, paths,
      lastAccessed: Date.now(),
      createdAt: Date.now()
    });

    const quota = this.repoQuotas.get(repoId) || { used: 0, limit: this.defaultQuota };
    quota.used += size;
    this.repoQuotas.set(repoId, quota);
    return { saved: true, key, size };
  }

  restore(repoId, key) {
    const cacheKey = \`\${repoId}:\${key}\`;
    const entry = this.caches.get(cacheKey);
    if (!entry) return { hit: false };
    entry.lastAccessed = Date.now();
    return { hit: true, data: entry.data, paths: entry.paths, size: entry.size };
  }

  ensureQuota(repoId, needed) {
    const quota = this.repoQuotas.get(repoId) || { used: 0, limit: this.defaultQuota };
    if (quota.used + needed <= quota.limit) return;

    // Evict LRU caches for this repo
    const repoCaches = [...this.caches.entries()]
      .filter(([k]) => k.startsWith(\`\${repoId}:\`))
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    for (const [key, entry] of repoCaches) {
      if (quota.used + needed <= quota.limit) break;
      quota.used -= entry.size;
      this.caches.delete(key);
    }
    this.repoQuotas.set(repoId, quota);
  }

  getStats(repoId) {
    const quota = this.repoQuotas.get(repoId) || { used: 0, limit: this.defaultQuota };
    const entries = [...this.caches.entries()].filter(([k]) => k.startsWith(\`\${repoId}:\`));
    return { ...quota, entryCount: entries.length, utilization: quota.used / quota.limit };
  }
}`,
    jsCode: `// ============================================================
// Runner Pool Auto-Scaler + Secret Masking Log Stream
// ============================================================

class RunnerPoolAutoscaler {
  constructor(options = {}) {
    this.runners = new Map(); // runnerId -> { status, jobId, labels, startedAt, idleSince }
    this.minRunners = options.minRunners || 10;
    this.maxRunners = options.maxRunners || 20000;
    this.targetUtilization = options.targetUtilization || 0.75;
    this.scaleUpThreshold = options.scaleUpThreshold || 0.85;
    this.scaleDownThreshold = options.scaleDownThreshold || 0.5;
    this.cooldownMs = options.cooldownMs || 60000;
    this.lastScaleAction = 0;
    this.nextRunnerId = 1;
    this.pendingJobs = [];
    this.history = [];
  }

  addRunner(labels = ['linux', 'x64']) {
    const id = \`runner-\${this.nextRunnerId++}\`;
    this.runners.set(id, {
      status: 'idle', jobId: null, labels,
      startedAt: Date.now(), idleSince: Date.now()
    });
    return id;
  }

  removeRunner(runnerId) {
    const runner = this.runners.get(runnerId);
    if (runner && runner.status === 'busy') return false;
    this.runners.delete(runnerId);
    return true;
  }

  assignJob(jobId, requiredLabels = []) {
    for (const [runnerId, runner] of this.runners) {
      if (runner.status !== 'idle') continue;
      const hasLabels = requiredLabels.every(l => runner.labels.includes(l));
      if (hasLabels) {
        runner.status = 'busy';
        runner.jobId = jobId;
        runner.idleSince = null;
        return { assigned: true, runnerId };
      }
    }
    this.pendingJobs.push({ jobId, requiredLabels, queuedAt: Date.now() });
    return { assigned: false, queuePosition: this.pendingJobs.length };
  }

  completeJob(runnerId) {
    const runner = this.runners.get(runnerId);
    if (!runner) return;
    runner.status = 'idle';
    runner.jobId = null;
    runner.idleSince = Date.now();

    // Try to assign pending job
    if (this.pendingJobs.length > 0) {
      const next = this.pendingJobs.shift();
      runner.status = 'busy';
      runner.jobId = next.jobId;
      runner.idleSince = null;
      return { reassigned: true, jobId: next.jobId };
    }
    return { reassigned: false };
  }

  evaluate() {
    const now = Date.now();
    if (now - this.lastScaleAction < this.cooldownMs) return { action: 'cooldown' };

    const total = this.runners.size;
    const busy = [...this.runners.values()].filter(r => r.status === 'busy').length;
    const utilization = total > 0 ? busy / total : 0;
    const queueDepth = this.pendingJobs.length;

    let action = 'none';
    let count = 0;

    if (utilization > this.scaleUpThreshold || queueDepth > 0) {
      const targetTotal = Math.ceil((busy + queueDepth) / this.targetUtilization);
      count = Math.min(targetTotal - total, this.maxRunners - total);
      count = Math.max(count, Math.min(queueDepth, this.maxRunners - total));
      if (count > 0) {
        action = 'scale_up';
        for (let i = 0; i < count; i++) this.addRunner();
        this.lastScaleAction = now;
      }
    } else if (utilization < this.scaleDownThreshold && total > this.minRunners) {
      const targetTotal = Math.max(Math.ceil(busy / this.targetUtilization), this.minRunners);
      count = total - targetTotal;
      if (count > 0) {
        action = 'scale_down';
        const idleRunners = [...this.runners.entries()]
          .filter(([, r]) => r.status === 'idle')
          .sort((a, b) => a[1].idleSince - b[1].idleSince);
        for (let i = 0; i < Math.min(count, idleRunners.length); i++) {
          this.removeRunner(idleRunners[i][0]);
        }
        this.lastScaleAction = now;
      }
    }

    const result = { action, count, utilization, total: this.runners.size, busy, queueDepth };
    this.history.push({ ...result, timestamp: now });
    return result;
  }
}

class SecretMaskingLogStream {
  constructor() {
    this.secrets = new Set();
    this.secretPatterns = [];
    this.logBuffer = [];
    this.subscribers = [];
    this.maxBufferSize = 10000;
  }

  registerSecret(value) {
    if (!value || value.length < 3) return;
    this.secrets.add(value);
    // Also mask base64-encoded version
    const b64 = Buffer.from(value).toString('base64');
    this.secrets.add(b64);
    // Build regex pattern for the secret and common transformations
    const escaped = value.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
    this.secretPatterns.push(new RegExp(escaped, 'g'));
  }

  maskLine(line) {
    let masked = line;
    for (const secret of this.secrets) {
      while (masked.includes(secret)) {
        masked = masked.split(secret).join('***');
      }
    }
    // Mask common secret patterns (tokens, keys)
    masked = masked.replace(/(ghp_[a-zA-Z0-9]{36})/g, '***');
    masked = masked.replace(/(AKIA[A-Z0-9]{16})/g, '***');
    masked = masked.replace(/([a-f0-9]{40})/gi, (match, p1, offset, str) => {
      if (this.looksLikeSecret(str, offset)) return '***';
      return match;
    });
    return masked;
  }

  looksLikeSecret(fullString, offset) {
    const prefix = fullString.substring(Math.max(0, offset - 20), offset).toLowerCase();
    return /(?:token|secret|key|password|credential|auth)\\s*[:=]\\s*$/.test(prefix);
  }

  write(jobId, stepName, line) {
    const masked = this.maskLine(line);
    const entry = {
      jobId, stepName, timestamp: Date.now(),
      line: masked, lineNumber: this.logBuffer.length + 1
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize / 2);
    }

    for (const sub of this.subscribers) {
      if (sub.jobId === jobId || sub.jobId === '*') {
        sub.callback(entry);
      }
    }
    return entry;
  }

  subscribe(jobId, callback) {
    const sub = { id: Math.random().toString(36).slice(2), jobId, callback };
    this.subscribers.push(sub);
    return sub.id;
  }

  unsubscribe(subId) {
    this.subscribers = this.subscribers.filter(s => s.id !== subId);
  }

  getLog(jobId, options = {}) {
    const { fromLine = 0, limit = 1000 } = options;
    return this.logBuffer
      .filter(e => e.jobId === jobId && e.lineNumber > fromLine)
      .slice(0, limit);
  }
}`,
    explanation: `**Scaling Analysis:**\n- **Horizontal scaling of workflow engine**: Stateless; add instances behind a load balancer. Each handles ~1000 workflow runs/sec (YAML parsing + DAG construction).\n- **Runner pool scaling**: Auto-scale based on queue depth. Use spot/preemptible instances for 60-70% cost savings. Maintain a warm pool of min runners for instant job pickup.\n- **Artifact/cache storage**: S3-compatible store scales automatically. Use regional replication for runner locality. Cache hits reduce job duration by 30-50%.\n- **Log storage**: Append-only log segments in object storage. Use time-partitioned indices for efficient retrieval.\n\n**Failure Modes:**\n1. **Runner crash mid-job**: Workflow engine detects heartbeat timeout. Mark job as failed. Re-run if retry policy is configured. Runner infrastructure cleans up orphaned VMs.\n2. **Workflow engine crash**: Jobs in flight continue on runners. On recovery, engine reconciles state from database. At-least-once delivery may re-trigger some jobs (idempotency key prevents duplicate execution).\n3. **Webhook delivery failure**: GitHub retries webhooks for up to 3 days. Dead-letter queue captures failed events for manual replay.\n4. **Cache corruption**: Hash-verified cache entries. On checksum mismatch, treat as cache miss and re-build. Report corruption for investigation.\n5. **Secret leak in logs**: Real-time masking catches known secret patterns. Post-processing scan catches additional patterns. Alert security team on potential leaks.\n\n**Bottleneck Identification:**\n- **Runner provisioning time**: Cold-start for VMs (30-60s) limits job pickup speed. Mitigation: warm pool of pre-provisioned runners, container-based runners (5-10s startup).\n- **Cache download**: Large caches (1 GB+) take 10-30 seconds on slow networks. Mitigation: store caches in regional object storage close to runners.\n- **DAG scheduling**: Complex workflows with 100+ jobs require efficient topological sort. O(V+E) algorithm is fast but scheduling decisions (runner assignment) can bottleneck.\n- **Log streaming**: 10,000 concurrent jobs each producing log lines at 100 lines/sec = 1M lines/sec. Buffer and batch log writes.\n\n**Monitoring:**\n- Queue depth and job wait time (time from queued to running)\n- Runner utilization and pool size over time\n- Job success/failure rates by repository, workflow, and step\n- Cache hit rate and average time saved\n- P50/P95/P99 workflow duration\n- Secret masking audit log\n\n**Trade-offs:**\n- **VMs vs containers for isolation**: VMs offer stronger isolation (hardware-level) but slower startup. Containers are fast but share kernel (security risk for untrusted code).\n- **Eager vs lazy runner provisioning**: Warm pool wastes money on idle runners; cold provisioning adds latency. Predictive scaling based on historical patterns is the best balance.\n- **Centralized vs distributed cache**: Centralized (S3) is simple but adds network latency. Distributed (local SSD on runners) is fast but wastes space with duplicates. Hybrid: cache on regional S3 with local SSD as a read-through cache.`,
    timeComplexity: `**Performance Characteristics:**\n- DAG construction and topological sort: O(V + E) where V = number of jobs, E = number of dependency edges\n- Job scheduling (runner matching): O(R * L) per job where R = available runners, L = label count. Use inverted index on labels for O(L) lookup.\n- Cache key computation: O(F) where F = total size of input files (lockfiles) for hashing\n- Cache restore: O(S) where S = cache size (network transfer dominated)\n- Log masking: O(L * P) per line where L = line length, P = number of registered secret patterns\n- Auto-scaler evaluation: O(N) where N = number of runners (aggregate utilization)`,
    spaceComplexity: `**Storage Requirements:**\n- Workflow run metadata: ~2 KB per run x 500K/day = 1 GB/day, 365 GB/year\n- Job logs: 1 MB avg x 1.5M jobs/day = 1.5 TB/day; 30-day retention compressed = 9 TB\n- Artifacts: 500 MB avg x 500K runs/day = 250 TB/day; 7-day retention = 1.75 PB (with dedup ~500 TB)\n- Cache storage: 500 MB avg x 50K repos = 25 TB (with LRU eviction per repo)\n- Runner VMs: 2 vCPU + 8 GB RAM + 50 GB SSD per runner; peak 19,000 runners = 152K vCPU, 152 TB RAM, 950 TB SSD\n- Total storage infrastructure: ~600 TB persistent + runner ephemeral storage`,
    hints: [
      `Implement a DAG-based workflow executor using topological sort. Build an adjacency list from job dependencies, compute in-degree for each job, and process jobs with in-degree 0 in parallel. When a job completes, decrement in-degree of its dependents and fire newly-ready jobs.`,
      `Build a dependency cache manager with content-addressed keys. Hash the lockfile contents (package-lock.json, yarn.lock) to generate the cache key. On cache miss, run the install and save the result. On hit, restore from cache (skipping install). Implement LRU eviction per repository with a configurable quota.`,
      `Create a runner pool auto-scaler that monitors utilization (busy/total) and queue depth. Scale up when utilization > 85% or queue depth > 0. Scale down when utilization < 50%. Include a cooldown period between scale actions to prevent thrashing. Use predictive scaling for scheduled workflows.`,
      `Implement secret masking in the log stream: register all secret values at job start. For each log line, scan for exact matches and common encodings (base64, URL-encoded) and replace with ***. Also mask common patterns like GitHub tokens (ghp_*) and AWS keys (AKIA*).`,
      `For matrix strategies (e.g., test on 3 OS x 4 Node versions = 12 jobs), expand the matrix at workflow parse time into individual jobs. Each matrix job inherits the parent job config with matrix variables substituted. All matrix jobs can run in parallel if no dependencies.`,
      `Implement job timeouts and cancellation: each job has a maximum duration (default 6 hours). The workflow engine sends a cancellation signal on timeout. The runner must respond within a grace period (30 seconds) before being forcefully terminated. Propagate cancellation to downstream jobs.`,
      `Design the log streaming system using Server-Sent Events (SSE). Each step writes to a log buffer. Subscribers receive real-time updates. For completed jobs, serve logs directly from object storage. Use line-based offset for resumable streaming (client sends last line number, server continues from there).`,
      `For workflow YAML parsing, validate the DAG at parse time by checking for cycles (DFS with back-edge detection). Reject workflows with circular dependencies before queuing any jobs. Also validate step references (uses: action/name@version) and report errors with line numbers.`
    ]
  },
  {
    id: 9030,
    description: `Design a Multi-Tenant SaaS Platform\n\n**Functional Requirements:**\n- Support thousands of tenants sharing common infrastructure\n- Strict data isolation: tenants cannot access each other's data\n- Per-tenant configuration: custom branding (logo, colors, domain), feature flags, plan-based feature gating\n- Per-tenant rate limiting and resource quotas (API calls, storage, users)\n- Tenant onboarding (self-service signup), billing integration, admin dashboard\n- Support multiple tenant tiers: free, pro, enterprise (dedicated resources for enterprise)\n\n**Non-Functional Requirements:**\n- Scale: 10,000 tenants, 1M total end-users, 50K concurrent requests\n- Latency: Tenant context resolution < 1 ms; API response < 100 ms p99\n- Isolation: Noisy-neighbor prevention — one tenant's burst cannot degrade others\n- Security: SOC2/GDPR compliance; tenant data encryption at rest and in transit\n- Availability: 99.99% for enterprise tier; 99.9% for standard tiers\n\n**Capacity Estimation:**\n- 10,000 tenants, top 1% (100 tenants) generate 80% of traffic\n- 50K concurrent requests, average 200 RPS per hot tenant\n- Database: 10,000 tenants x 1 GB average = 10 TB total data\n- Enterprise tenants (100): dedicated database schemas, 50 GB average = 5 TB\n- API calls: 100M/day total; metered per tenant for billing\n- Storage: 500 GB total for tenant assets (logos, uploads)`,
    examples: `**Capacity Walkthrough:**\nTraffic distribution:\n- 100 enterprise tenants: 200 RPS each = 20,000 RPS (40%)\n- 900 pro tenants: 20 RPS each = 18,000 RPS (36%)\n- 9,000 free tenants: 1.3 RPS each = 12,000 RPS (24%)\n- Total: 50,000 RPS peak\n\nDatabase sizing:\n- Shared pool (free/pro): 9,900 tenants x 500 MB avg = 4.95 TB\n- Dedicated (enterprise): 100 tenants x 50 GB = 5 TB\n- Connection pooling: 50K concurrent requests / 10ms avg query = 500 connections needed\n- With pgBouncer: 500 actual connections serve 50K req/sec\n\nBilling metering:\n- 100M API calls/day = ~1,150 calls/sec to meter\n- Per-tenant counters in Redis: 10,000 counters x 100 bytes = 1 MB\n\n**API Design:**\n\`\`\`\nPOST /api/v1/tenants\n  Body: { name, plan: "free|pro|enterprise", adminEmail, subdomain }\n  Response: { tenantId, apiKey, subdomain: "acme.platform.com" }\n\nGET /api/v1/tenants/{tenantId}/usage\n  Response: { period: "2025-03", apiCalls: 45230, storage: "2.1GB", users: 47 }\n\nPUT /api/v1/tenants/{tenantId}/config\n  Body: { branding: { logo, primaryColor }, features: { advancedAnalytics: true } }\n\nGET /api/v1/tenants/{tenantId}/billing\n  Response: { plan, usage, charges: [...], nextInvoice: "2025-04-01" }\n\`\`\``,
    intuition: `Think of a multi-tenant SaaS platform as an apartment building. Each tenant (company) rents a unit (their slice of the platform). Some tenants are in shared apartments (shared database), while enterprise tenants get penthouse suites (dedicated resources). The building manager (platform) provides shared utilities (infrastructure) while ensuring one tenant's loud music (traffic spike) doesn't disturb neighbors (noisy-neighbor prevention).\n\nThe key insight is the **tenant context propagation pattern**: every request must carry a tenant identifier (from subdomain, JWT, or API key) that flows through every layer of the stack — API gateway, service layer, database queries, cache keys, queue messages. If any layer forgets to filter by tenant, you have a data leak. This is why Row-Level Security (RLS) in the database acts as a safety net.\n\nThe fundamental architectural decision is the **data isolation model**: (1) shared database with tenant_id column (cheapest, least isolated), (2) schema-per-tenant (moderate isolation, moderate cost), or (3) database-per-tenant (strongest isolation, most expensive). Most platforms use a hybrid: shared DB for free/pro tiers, dedicated DB for enterprise.\n\nRate limiting in multi-tenant is different from single-tenant: you need **fair-share scheduling**. A token bucket per tenant ensures one tenant's burst doesn't consume shared resources that other tenants need. The quota is tied to the billing plan.`,
    approach: `**Architecture Overview:**\n\n1. **Tenant Router (API Gateway)**: The entry point for all requests. Resolves tenant from subdomain (acme.platform.com), JWT claim (tenant_id), or API key header. Injects tenant context into the request. Applies per-tenant rate limiting before forwarding to services.\n\n2. **Data Isolation Layer**: Three strategies based on tenant tier:\n   - **Free/Pro (Shared DB)**: Single database with tenant_id column on every table. Row-Level Security (RLS) policies enforce filtering. Connection pool shared.\n   - **Enterprise (Schema-per-tenant)**: Separate PostgreSQL schema per enterprise tenant. Same DB server but isolated tables and indexes.\n   - **Premium Enterprise (DB-per-tenant)**: Dedicated database instance. Maximum isolation and independent scaling.\n\n3. **Rate Limiter / Quota Manager**: Per-tenant token bucket rate limiter. Limits configured per plan (free: 100 req/min, pro: 1000 req/min, enterprise: 10,000 req/min). Additional quotas: storage, users, API keys. Redis-backed for distributed enforcement.\n\n4. **Billing Meter**: Every API call, storage write, and resource usage event is metered. Events flow to a usage aggregation pipeline (Kafka -> aggregator -> billing DB). Monthly invoice generation. Integration with Stripe for payment processing.\n\n5. **Configuration Service**: Per-tenant configuration store. Branding (logo URL, colors, custom domain), feature flags (enable/disable features per tenant or plan), plan limits. Cached in Redis with tenant-scoped keys.\n\n6. **Tenant Lifecycle Manager**: Onboarding: create tenant record, provision database resources, generate API keys, send welcome email. Offboarding: export data, delete resources, revoke access. Upgrade/downgrade: migrate between isolation tiers.\n\n**Database Schema:**\n- Tenants: tenantId, name, plan, subdomain, customDomain, status, createdAt\n- TenantConfig: tenantId, branding (JSON), features (JSON), quotas (JSON)\n- Users: userId, tenantId, email, role, status (RLS enforced by tenantId)\n- APIKeys: keyId, tenantId, keyHash, permissions, rateLimit\n- UsageEvents: eventId, tenantId, eventType, quantity, timestamp\n- Invoices: invoiceId, tenantId, period, lineItems, total, status\n\n**Data Flow:**\nRequest -> DNS (subdomain) -> API Gateway -> Tenant Router (resolve + inject context) -> Rate Limiter (check quota) -> Service Layer (business logic with tenant context) -> Data Layer (RLS-enforced queries) -> Response`,
    code: `// ============================================================
// Multi-Tenant SaaS Platform: Core Component Implementations
// ============================================================

class TenantRouter {
  constructor() {
    this.tenantsBySubdomain = new Map();
    this.tenantsByApiKey = new Map();
    this.tenantsById = new Map();
    this.configCache = new Map();
  }

  registerTenant(tenant) {
    // tenant: { tenantId, name, subdomain, plan, apiKeys: [], config }
    this.tenantsById.set(tenant.tenantId, tenant);
    this.tenantsBySubdomain.set(tenant.subdomain, tenant.tenantId);
    for (const key of (tenant.apiKeys || [])) {
      this.tenantsByApiKey.set(key, tenant.tenantId);
    }
    if (tenant.config) this.configCache.set(tenant.tenantId, tenant.config);
  }

  middleware() {
    return (req) => {
      const tenantId = this.resolveTenant(req);
      if (!tenantId) {
        return { status: 401, body: { error: 'Tenant not identified' } };
      }

      const tenant = this.tenantsById.get(tenantId);
      if (!tenant) {
        return { status: 404, body: { error: 'Tenant not found' } };
      }

      if (tenant.status === 'suspended') {
        return { status: 403, body: { error: 'Tenant suspended', reason: tenant.suspendReason } };
      }

      // Inject tenant context into request
      req.tenantContext = {
        tenantId: tenant.tenantId,
        plan: tenant.plan,
        config: this.configCache.get(tenantId) || {},
        isolation: this.getIsolationLevel(tenant.plan),
        dbSchema: this.getDbSchema(tenant),
        quotas: this.getQuotas(tenant.plan)
      };

      return { status: 200, proceed: true };
    };
  }

  resolveTenant(req) {
    // Strategy 1: Subdomain
    if (req.hostname) {
      const subdomain = req.hostname.split('.')[0];
      const id = this.tenantsBySubdomain.get(subdomain);
      if (id) return id;
    }
    // Strategy 2: API key header
    if (req.headers && req.headers['x-api-key']) {
      const id = this.tenantsByApiKey.get(req.headers['x-api-key']);
      if (id) return id;
    }
    // Strategy 3: JWT claim
    if (req.auth && req.auth.tenantId) {
      return req.auth.tenantId;
    }
    // Strategy 4: Path parameter
    if (req.params && req.params.tenantId) {
      return req.params.tenantId;
    }
    return null;
  }

  getIsolationLevel(plan) {
    const levels = { free: 'shared', pro: 'shared', enterprise: 'schema', premium: 'database' };
    return levels[plan] || 'shared';
  }

  getDbSchema(tenant) {
    if (tenant.plan === 'enterprise' || tenant.plan === 'premium') {
      return \`tenant_\${tenant.tenantId}\`;
    }
    return 'shared';
  }

  getQuotas(plan) {
    const quotas = {
      free:       { rateLimit: 100,   storageMB: 500,   users: 5,    apiCallsPerDay: 10000 },
      pro:        { rateLimit: 1000,  storageMB: 10240, users: 50,   apiCallsPerDay: 100000 },
      enterprise: { rateLimit: 10000, storageMB: 102400, users: 500, apiCallsPerDay: 1000000 },
      premium:    { rateLimit: 50000, storageMB: 512000, users: -1,  apiCallsPerDay: -1 }
    };
    return quotas[plan] || quotas.free;
  }
}

class RowLevelSecurity {
  constructor() {
    this.tables = new Map(); // tableName -> [rows]
    this.policies = new Map(); // tableName -> policy function
  }

  createTable(name) {
    this.tables.set(name, []);
    // Default RLS policy: filter by tenantId
    this.policies.set(name, (row, context) => row.tenantId === context.tenantId);
  }

  setPolicy(tableName, policyFn) {
    this.policies.set(tableName, policyFn);
  }

  insert(tableName, row, context) {
    const table = this.tables.get(tableName);
    if (!table) throw new Error(\`Table \${tableName} not found\`);
    // Enforce tenant_id matches context
    if (row.tenantId && row.tenantId !== context.tenantId) {
      throw new Error('Cannot insert row for different tenant');
    }
    const record = { ...row, tenantId: context.tenantId, _id: \`\${Date.now()}-\${Math.random().toString(36).slice(2)}\` };
    table.push(record);
    return record;
  }

  query(tableName, filter, context) {
    const table = this.tables.get(tableName);
    if (!table) return [];
    const policy = this.policies.get(tableName);

    return table.filter(row => {
      // Always apply RLS policy first
      if (policy && !policy(row, context)) return false;
      // Then apply user filter
      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          if (row[key] !== value) return false;
        }
      }
      return true;
    });
  }

  update(tableName, filter, updates, context) {
    const table = this.tables.get(tableName);
    if (!table) return 0;
    const policy = this.policies.get(tableName);
    let count = 0;

    for (const row of table) {
      if (policy && !policy(row, context)) continue;
      let matches = true;
      for (const [key, value] of Object.entries(filter)) {
        if (row[key] !== value) { matches = false; break; }
      }
      if (matches) {
        Object.assign(row, updates);
        row.tenantId = context.tenantId; // Prevent tenant_id mutation
        count++;
      }
    }
    return count;
  }

  delete(tableName, filter, context) {
    const table = this.tables.get(tableName);
    if (!table) return 0;
    const policy = this.policies.get(tableName);
    const before = table.length;

    const remaining = table.filter(row => {
      if (policy && !policy(row, context)) return true; // Keep rows not visible to tenant
      for (const [key, value] of Object.entries(filter)) {
        if (row[key] !== value) return true;
      }
      return false;
    });

    this.tables.set(tableName, remaining);
    return before - remaining.length;
  }
}

class TenantTokenBucketRateLimiter {
  constructor() {
    this.buckets = new Map(); // tenantId -> { tokens, capacity, refillRate, lastRefill }
    this.windowCounters = new Map(); // "tenantId:window" -> count (for daily limits)
  }

  configure(tenantId, ratePerMinute) {
    this.buckets.set(tenantId, {
      tokens: ratePerMinute,
      capacity: ratePerMinute,
      refillRate: ratePerMinute / 60, // tokens per second
      lastRefill: Date.now()
    });
  }

  tryConsume(tenantId, tokens = 1) {
    const bucket = this.buckets.get(tenantId);
    if (!bucket) return { allowed: false, reason: 'No rate limit configured' };

    // Refill tokens based on elapsed time
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetMs: Math.ceil((bucket.capacity - bucket.tokens) / bucket.refillRate * 1000)
      };
    }

    const retryAfter = Math.ceil((tokens - bucket.tokens) / bucket.refillRate);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: retryAfter,
      reason: \`Rate limit exceeded. Retry in \${retryAfter}s\`
    };
  }

  checkDailyQuota(tenantId, dailyLimit) {
    if (dailyLimit === -1) return { allowed: true }; // unlimited
    const window = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = \`\${tenantId}:\${window}\`;
    const current = this.windowCounters.get(key) || 0;

    if (current >= dailyLimit) {
      return { allowed: false, used: current, limit: dailyLimit, reason: 'Daily quota exceeded' };
    }

    this.windowCounters.set(key, current + 1);
    return { allowed: true, used: current + 1, limit: dailyLimit, remaining: dailyLimit - current - 1 };
  }

  getUsage(tenantId) {
    const bucket = this.buckets.get(tenantId);
    const window = new Date().toISOString().split('T')[0];
    const dailyUsage = this.windowCounters.get(\`\${tenantId}:\${window}\`) || 0;
    return {
      rateLimit: bucket ? { remaining: Math.floor(bucket.tokens), capacity: bucket.capacity } : null,
      dailyUsage
    };
  }

  cleanup() {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    for (const key of this.windowCounters.keys()) {
      if (key.endsWith(yesterday) || key < yesterday) {
        this.windowCounters.delete(key);
      }
    }
  }
}`,
    jsCode: `// ============================================================
// Usage Metering + Billing Aggregator + Tenant Onboarding
// ============================================================

class UsageMeter {
  constructor() {
    this.events = []; // raw usage events
    this.hourlyAggregates = new Map(); // "tenantId:YYYY-MM-DDTHH" -> { apiCalls, storage, compute }
    this.monthlyAggregates = new Map(); // "tenantId:YYYY-MM" -> aggregate
    this.pricingPlans = new Map();
  }

  setPricing(plan, pricing) {
    // pricing: { basePrice, apiCallPrice, storagePrice, overageMultiplier, included: {...} }
    this.pricingPlans.set(plan, pricing);
  }

  recordEvent(tenantId, eventType, quantity, metadata = {}) {
    const event = {
      tenantId, eventType, quantity,
      timestamp: Date.now(),
      hour: new Date().toISOString().slice(0, 13),
      month: new Date().toISOString().slice(0, 7),
      ...metadata
    };
    this.events.push(event);

    // Update hourly aggregate
    const hourKey = \`\${tenantId}:\${event.hour}\`;
    if (!this.hourlyAggregates.has(hourKey)) {
      this.hourlyAggregates.set(hourKey, { apiCalls: 0, storageBytes: 0, computeMs: 0 });
    }
    const hourAgg = this.hourlyAggregates.get(hourKey);
    if (eventType === 'api_call') hourAgg.apiCalls += quantity;
    else if (eventType === 'storage') hourAgg.storageBytes += quantity;
    else if (eventType === 'compute') hourAgg.computeMs += quantity;

    // Update monthly aggregate
    const monthKey = \`\${tenantId}:\${event.month}\`;
    if (!this.monthlyAggregates.has(monthKey)) {
      this.monthlyAggregates.set(monthKey, { apiCalls: 0, storageBytes: 0, computeMs: 0, events: 0 });
    }
    const monthAgg = this.monthlyAggregates.get(monthKey);
    if (eventType === 'api_call') monthAgg.apiCalls += quantity;
    else if (eventType === 'storage') monthAgg.storageBytes += quantity;
    else if (eventType === 'compute') monthAgg.computeMs += quantity;
    monthAgg.events++;

    return event;
  }

  getUsage(tenantId, period) {
    const key = \`\${tenantId}:\${period}\`;
    return this.monthlyAggregates.get(key) || { apiCalls: 0, storageBytes: 0, computeMs: 0, events: 0 };
  }

  getHourlyBreakdown(tenantId, date) {
    const results = [];
    for (let h = 0; h < 24; h++) {
      const hour = \`\${date}T\${String(h).padStart(2, '0')}\`;
      const key = \`\${tenantId}:\${hour}\`;
      results.push({ hour, ...(this.hourlyAggregates.get(key) || { apiCalls: 0, storageBytes: 0, computeMs: 0 }) });
    }
    return results;
  }
}

class BillingAggregator {
  constructor(usageMeter) {
    this.meter = usageMeter;
    this.invoices = [];
    this.tenantPlans = new Map();
  }

  setTenantPlan(tenantId, plan) {
    this.tenantPlans.set(tenantId, plan);
  }

  generateInvoice(tenantId, period) {
    const plan = this.tenantPlans.get(tenantId);
    const pricing = this.meter.pricingPlans.get(plan);
    if (!pricing) return { error: 'No pricing configured for plan' };

    const usage = this.meter.getUsage(tenantId, period);
    const lineItems = [];
    let total = 0;

    // Base subscription
    lineItems.push({ description: \`\${plan} plan - base\`, amount: pricing.basePrice });
    total += pricing.basePrice;

    // API calls overage
    const includedCalls = pricing.included.apiCalls || 0;
    const overageCalls = Math.max(0, usage.apiCalls - includedCalls);
    if (overageCalls > 0) {
      const callCharge = overageCalls * pricing.apiCallPrice;
      lineItems.push({
        description: \`API calls overage: \${overageCalls.toLocaleString()} calls @ $\${pricing.apiCallPrice}/call\`,
        amount: Math.round(callCharge * 100) / 100
      });
      total += callCharge;
    }

    // Storage overage
    const includedStorageGB = pricing.included.storageGB || 0;
    const usedGB = usage.storageBytes / (1024 * 1024 * 1024);
    const overageGB = Math.max(0, usedGB - includedStorageGB);
    if (overageGB > 0) {
      const storageCharge = overageGB * pricing.storagePrice;
      lineItems.push({
        description: \`Storage overage: \${overageGB.toFixed(2)} GB @ $\${pricing.storagePrice}/GB\`,
        amount: Math.round(storageCharge * 100) / 100
      });
      total += storageCharge;
    }

    const invoice = {
      invoiceId: \`inv-\${Date.now()}-\${tenantId}\`,
      tenantId, period, plan,
      lineItems,
      subtotal: Math.round(total * 100) / 100,
      tax: Math.round(total * 0.1 * 100) / 100, // 10% tax placeholder
      total: Math.round(total * 1.1 * 100) / 100,
      usage,
      generatedAt: new Date().toISOString(),
      status: 'pending'
    };

    this.invoices.push(invoice);
    return invoice;
  }

  getInvoiceHistory(tenantId, limit = 12) {
    return this.invoices
      .filter(inv => inv.tenantId === tenantId)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
      .slice(0, limit);
  }
}

class TenantOnboarder {
  constructor(router, rls, rateLimiter, meter) {
    this.router = router;
    this.rls = rls;
    this.rateLimiter = rateLimiter;
    this.meter = meter;
    this.tenants = new Map();
  }

  onboard(request) {
    const { name, plan, adminEmail, subdomain } = request;

    // Validate subdomain availability
    if (this.router.tenantsBySubdomain.has(subdomain)) {
      return { error: \`Subdomain "\${subdomain}" is already taken\` };
    }

    const tenantId = \`tn-\${Date.now().toString(36)}-\${Math.random().toString(36).slice(2, 6)}\`;
    const apiKey = \`key-\${Array.from({ length: 32 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36))
    ).join('')}\`;

    const tenant = {
      tenantId, name, plan, subdomain,
      status: 'active',
      apiKeys: [apiKey],
      config: {
        branding: { primaryColor: '#3B82F6', logoUrl: null },
        features: this.getDefaultFeatures(plan)
      },
      admin: { email: adminEmail },
      createdAt: new Date().toISOString()
    };

    // Register in all subsystems
    this.router.registerTenant(tenant);
    const quotas = this.router.getQuotas(plan);
    this.rateLimiter.configure(tenantId, quotas.rateLimit);
    this.tenants.set(tenantId, tenant);

    return {
      tenantId,
      subdomain: \`\${subdomain}.platform.com\`,
      apiKey,
      plan,
      quotas,
      dashboardUrl: \`https://\${subdomain}.platform.com/admin\`
    };
  }

  getDefaultFeatures(plan) {
    const features = {
      free:       { analytics: false, customDomain: false, sso: false, auditLog: false, apiAccess: true },
      pro:        { analytics: true,  customDomain: false, sso: false, auditLog: true,  apiAccess: true },
      enterprise: { analytics: true,  customDomain: true,  sso: true,  auditLog: true,  apiAccess: true },
      premium:    { analytics: true,  customDomain: true,  sso: true,  auditLog: true,  apiAccess: true }
    };
    return features[plan] || features.free;
  }

  upgradePlan(tenantId, newPlan) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return { error: 'Tenant not found' };
    const oldPlan = tenant.plan;
    tenant.plan = newPlan;
    tenant.config.features = this.getDefaultFeatures(newPlan);

    const newQuotas = this.router.getQuotas(newPlan);
    this.rateLimiter.configure(tenantId, newQuotas.rateLimit);
    this.router.registerTenant(tenant); // re-register with updated config

    return { tenantId, oldPlan, newPlan, newQuotas, features: tenant.config.features };
  }

  suspend(tenantId, reason) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return { error: 'Tenant not found' };
    tenant.status = 'suspended';
    tenant.suspendReason = reason;
    this.router.registerTenant(tenant);
    return { tenantId, status: 'suspended', reason };
  }
}`,
    explanation: `**Scaling Analysis:**\n- **Horizontal API scaling**: Stateless API servers behind a load balancer. Tenant context resolved from request headers, not server state. Add instances as traffic grows.\n- **Database scaling**: Shared pool uses connection pooling (pgBouncer). Shard shared pool by tenant_id hash when >10 TB. Enterprise tenants get dedicated read replicas for analytics.\n- **Rate limiter scaling**: Redis Cluster for distributed token buckets. Each Redis node handles ~100K operations/sec. 3-node cluster handles 300K rate limit checks/sec.\n- **Metering pipeline**: Kafka for buffering usage events. Stream processor aggregates hourly/daily/monthly. Idempotent processing ensures accurate billing even with retries.\n\n**Failure Modes:**\n1. **Tenant router cache miss**: Fall back to database lookup. Cache tenant config aggressively with TTL. Invalidate on config change via pub/sub.\n2. **Rate limiter Redis failure**: Fail open (allow requests) to maintain availability, but log for billing reconciliation. Switch to local in-memory rate limiting as fallback.\n3. **Noisy neighbor (one tenant spikes)**: Per-tenant rate limits prevent resource exhaustion. For database, use statement timeout and connection limits per tenant. For compute, use container CPU/memory limits.\n4. **Data isolation breach**: RLS policies are the last line of defense. Even if application code has a bug, database enforces tenant filtering. Audit logs detect anomalous cross-tenant queries.\n5. **Billing metering loss**: Usage events stored in Kafka with multi-day retention. If aggregator crashes, replay from Kafka. Idempotent aggregation prevents double-counting.\n\n**Bottleneck Identification:**\n- **Tenant context resolution**: Must be <1ms per request. Solution: in-memory cache (LRU) of tenant configs, refreshed every 30 seconds or on change notification.\n- **Database connection pooling**: Shared pool with 10K tenants. Each tenant cannot monopolize connections. Use pgBouncer transaction-level pooling with per-tenant connection limits.\n- **Feature flag evaluation**: Must be fast for every request. Solution: pre-load all tenant feature flags into local memory. Update via config change events.\n- **Invoice generation**: Monthly batch job for 10K tenants. Parallelize across workers, each handling ~100 tenants.\n\n**Monitoring:**\n- Per-tenant request rate, error rate, and latency\n- Rate limit hit rate per tenant (identify tenants needing plan upgrade)\n- Database query count and duration per tenant (detect noisy neighbors)\n- Storage utilization per tenant vs quota\n- Billing accuracy: compare metered usage with actual request logs\n- Data isolation audit: query patterns crossing tenant boundaries\n\n**Trade-offs:**\n- **Shared DB vs DB-per-tenant**: Shared is cost-effective but risks data leaks and noisy neighbors. Dedicated is safe but expensive and operationally complex (10K databases to manage).\n- **Strict vs soft rate limiting**: Strict (hard reject) prevents abuse but may reject legitimate bursts. Soft (allow burst, charge overage) is friendlier but harder to enforce resource limits.\n- **Per-tenant customization depth**: Deep customization (custom workflows, integrations) increases product value but multiplies engineering complexity. Feature flags are a good balance.\n- **Self-service vs white-glove onboarding**: Self-service scales but enterprise customers expect dedicated support. Solution: self-service for free/pro, concierge for enterprise.`,
    timeComplexity: `**Performance Characteristics:**\n- Tenant resolution: O(1) hash map lookup from subdomain/API key to tenant context\n- RLS query filtering: O(N) scan with tenant_id filter (in practice, database index on tenant_id makes it O(log N) per query)\n- Rate limit check: O(1) token bucket operation (refill + consume)\n- Daily quota check: O(1) Redis INCR with TTL\n- Usage metering: O(1) per event (append to Kafka + in-memory counter update)\n- Invoice generation: O(E) per tenant where E = number of usage event types to aggregate\n- Feature flag evaluation: O(1) per flag (hash map lookup on tenant config)`,
    spaceComplexity: `**Storage Requirements:**\n- Tenant metadata: 10,000 tenants x 5 KB config = 50 MB (cached entirely in RAM)\n- Shared database pool: 9,900 tenants x 500 MB avg = ~5 TB PostgreSQL\n- Enterprise dedicated schemas: 100 tenants x 50 GB = 5 TB\n- Rate limiter state: 10,000 tenant buckets x 200 bytes = 2 MB in Redis\n- Usage events: 100M events/day x 200 bytes = 20 GB/day in Kafka; aggregated monthly = 600 GB/year\n- Invoice storage: 10,000 tenants x 12 months x 5 KB = 600 MB/year\n- Feature flag cache: 10,000 tenants x 500 bytes = 5 MB in memory per API server\n- Total infrastructure: ~10 TB database + 25 TB object storage + 50 GB Redis`,
    hints: [
      `Implement a TenantRouter middleware that resolves tenant identity from multiple sources in priority order: subdomain, API key header, JWT claim, path parameter. Inject the full tenant context (plan, config, quotas, database schema) into the request object for downstream use.`,
      `Build Row-Level Security enforcement as a data access layer. Every query method (insert, select, update, delete) first applies a tenant-scoped policy filter. Prevent tenant_id mutation on updates. This acts as a safety net even if application code has bugs.`,
      `Create a per-tenant token bucket rate limiter: each tenant has a bucket with capacity and refill rate determined by their plan. On each request, refill based on elapsed time, then try to consume a token. Return rate limit headers (X-RateLimit-Remaining, Retry-After) for client visibility.`,
      `Implement usage metering that records events to an append-only log. Aggregate hourly and monthly in-memory for fast lookups. Use these aggregates for billing invoice generation. Ensure idempotency by deduplicating events with unique event IDs.`,
      `For noisy-neighbor prevention beyond rate limiting, implement per-tenant database connection limits, query timeouts, and CPU/memory quotas. Monitor per-tenant resource consumption and alert when a tenant approaches limits. Auto-throttle tenants that consistently hit limits.`,
      `Design the billing system to handle plan upgrades/downgrades mid-cycle. Prorate charges based on the number of days on each plan within the billing period. Generate line items for the base plan and each overage category separately for transparency.`,
      `Implement tenant onboarding as an idempotent operation: if onboarding fails midway (e.g., database provisioning succeeds but API key generation fails), retrying the operation should resume from where it left off rather than creating a duplicate tenant.`,
      `For enterprise tenants, implement data residency controls: store their data in a specific geographic region (EU, US, APAC) to comply with GDPR and other regulations. Route their requests to region-specific database instances and cache nodes.`
    ]
  }
];
