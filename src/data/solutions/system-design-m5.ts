import { ProblemSolution } from './types';

export const solutionsM5: ProblemSolution[] = [
  {
    id: 9021,
    description: `Design a Social Graph (Facebook/LinkedIn)\n\n**Functional Requirements:**\n- Store billions of user nodes and hundreds of billions of edges (friendships, follows)\n- Support both symmetric relationships (mutual friends on Facebook) and asymmetric relationships (followers on LinkedIn/Twitter)\n- Compute mutual friends between any two users in real time\n- Calculate degrees of separation (shortest path) up to 6 hops\n- Generate friend recommendations (People You May Know / PYMK) based on graph topology\n- Support graph queries: "friends of friends who work at Google and live in SF"\n\n**Non-Functional Requirements:**\n- Graph traversal within 100ms for up to 3 hops from any node\n- 99.99% availability for read operations\n- Handle 500K+ read QPS for friend list lookups\n- Eventually consistent for edge additions (friend requests) within 2 seconds\n- Support nodes with extremely high degree (celebrities with 50M+ followers)\n\n**Capacity Estimation:**\n- 2 billion users, average 500 connections each = 500 billion directed edges\n- Each edge: 8 bytes (source) + 8 bytes (dest) + 8 bytes (metadata) = 24 bytes\n- Total edge storage: 500B x 24 bytes = 12 TB raw, ~36 TB with 3x replication\n- Node metadata: 2B x 200 bytes = 400 GB\n- Friend list reads: 500K QPS, writes: 50K QPS (10:1 ratio)\n- Mutual friends query: 100K QPS\n- PYMK generation: batch job processing 200M users daily`,
    examples: `**Exercise 1: Capacity Estimation Walkthrough**\nAssume 2B users with average 500 connections. A 3-hop BFS from a user touches: hop1 = 500 friends, hop2 = 500 x 500 = 250K, hop3 = 250K x 500 = 125M. To compute mutual friends between two users, you intersect their friend lists. If each list is 500 entries, sorted intersection is O(1000). For PYMK, you scan friends-of-friends (250K candidates), count shared connections, and rank. At 100K mutual friend queries/sec, each touching ~1000 IDs, the system must resolve 100M ID lookups/second from cache.\n\n**Exercise 2: API Design**\n\`\`\`\nPOST /v1/friendships\n  Body: { user_id, target_id, type: "friend" | "follow" }\n  Response: 201 { friendship_id, status: "pending" | "accepted" }\n\nGET /v1/users/{user_id}/friends?cursor=xxx&limit=50\n  Response: 200 { friends: [{ id, name, mutual_count }], next_cursor }\n\nGET /v1/users/{user_id}/mutual-friends/{other_id}?limit=20\n  Response: 200 { mutual_friends: [...], total_count }\n\nGET /v1/users/{user_id}/degrees-of-separation/{other_id}\n  Response: 200 { degrees: 3, path: [id1, id2, id3, id4] }\n\nGET /v1/users/{user_id}/recommendations?limit=50\n  Response: 200 { recommendations: [{ id, name, score, mutual_count, reasons }] }\n\`\`\`\n\n**Exercise 3: Database Schema Design**\n\`\`\`\nusers: { user_id (PK), name, profile_data, created_at }\nedges: { source_id, dest_id, type, created_at } (PK: source_id + dest_id)\nadjacency_list: { user_id (PK), friend_ids (sorted list), follower_ids (sorted list) }\nrecommendation_cache: { user_id (PK), recommendations (JSON), generated_at, ttl }\n\`\`\``,
    intuition: `Think of the social graph as a massive city road network. Each person is an intersection, and each friendship is a road. Finding mutual friends is like finding intersections reachable from both of two starting points. Degrees of separation is the shortest driving route between two intersections.\n\nThe key insight is that social graphs follow a **power-law distribution**: most users have a few hundred connections, but some have millions. This means you cannot treat all nodes equally. High-degree nodes (celebrities) must be handled differently: their adjacency lists are too large to scan linearly, so you shard them, cache them aggressively, and avoid full fan-out.\n\nThe second key insight is **bidirectional BFS** for shortest path. Instead of exploring from one side (which expands exponentially), you explore from both sides simultaneously. At 3 hops, unidirectional BFS touches 500^3 = 125M nodes. Bidirectional BFS touches 2 x 500^1.5 ~ 22K nodes. That is a 5000x reduction.\n\nFor friend recommendations, the mental model is a **weighted voting system**: each friend-of-friend gets one vote per shared connection. The candidates with the most votes (mutual friends) are the strongest recommendations. Additional signals like shared employer, school, location, and interaction frequency boost the score.\n\nFacebook's TAO (The Associations and Objects) system is the canonical architecture: a write-through cache over a sharded MySQL backend, optimized for the association query pattern (get all edges from a node of a given type). Every read hits cache first; cache misses go to the database and populate the cache. The write path goes to the database first, then invalidates/updates the cache.`,
    approach: `**High-Level Architecture:**\n\nClients -> Load Balancer -> API Gateway -> Graph Query Service -> [Cache Layer (TAO-like)] -> [Graph Store (Sharded DB)]\n                                                      |-> Recommendation Service -> [ML Pipeline]\n                                                      |-> Search/Traversal Engine\n\n**Component Deep Dive:**\n\n1. **Graph Store (Sharded MySQL/RocksDB)**\n   - Store adjacency lists: for each user, maintain a sorted list of friend IDs\n   - Shard by user_id using consistent hashing across 1000+ shards\n   - Each shard holds ~2M users and their edges\n   - Use both forward edges (user -> friends) and reverse edges (user -> followers)\n   - Store edge metadata (type, timestamp, interaction score) alongside each edge\n\n2. **Cache Layer (TAO-like)**\n   - Two-tier cache: L1 (per-region, 10K servers) and L2 (cross-region, 2K servers)\n   - L1 handles 99% of reads with sub-millisecond latency\n   - L2 serves as a fallback and reduces database fan-out\n   - Cache objects (user profiles) and associations (edge lists) separately\n   - Write-through: writes go to DB, then cache is updated/invalidated\n   - High-degree node optimization: cache friend lists in chunks of 5000\n\n3. **Traversal Engine**\n   - Bidirectional BFS for shortest path: expand from both source and target simultaneously\n   - Bloom filters at each hop to quickly check visited set membership\n   - Early termination when the two frontiers intersect\n   - Depth limit of 6 (small-world property ensures most pairs connect within 6 hops)\n   - Parallel expansion: fan out BFS level exploration across multiple workers\n\n4. **Mutual Friends Service**\n   - Fetch sorted friend lists for both users from cache\n   - Sorted intersection algorithm: O(n + m) where n, m are list sizes\n   - For high-degree nodes, use bitmap intersection (pre-computed bitmaps in cache)\n   - Cache mutual friend counts for frequently queried pairs\n\n5. **PYMK Recommendation Pipeline**\n   - Batch job (daily): for each user, scan friends-of-friends, count shared connections\n   - Score = mutual_friend_count * w1 + same_company * w2 + same_school * w3 + same_city * w4 + interaction_frequency * w5\n   - Store top 200 recommendations per user in recommendation cache\n   - Real-time boost: when a new edge is added, re-score affected candidates\n   - ML re-ranking: train a model on accept/reject signals to personalize ordering\n\n6. **Graph Partitioning Strategy**\n   - Hash-based partitioning by user_id for even distribution\n   - Locality optimization: replicate edges of users who interact frequently to the same shard\n   - Balanced partitioning goal: minimize cross-shard edges while keeping shard sizes equal\n   - Use METIS-style graph partitioning offline, then apply the partition map\n\n**Data Flow - Mutual Friends Query:**\n1. Client requests mutual friends of user A and user B\n2. API Gateway routes to Graph Query Service\n3. Service fetches friend list of A from cache (L1 hit)\n4. Service fetches friend list of B from cache (L1 hit)\n5. Sorted intersection computed in-memory\n6. Hydrate results with profile data from cache\n7. Return to client in <50ms total`,
    code: `// Social Graph Engine - Core Implementation
// Supports adjacency list storage, bidirectional BFS, mutual friends, and PYMK

class SocialGraph {
  constructor() {
    // adjacency lists: userId -> Set of connected userIds
    this.forward = new Map();  // user -> people they follow/befriend
    this.reverse = new Map();  // user -> people who follow/befriend them
    this.edgeMeta = new Map(); // "src:dst" -> { type, weight, timestamp }
    this.userMeta = new Map(); // userId -> { name, company, school, city }
  }

  addUser(userId, metadata = {}) {
    if (!this.forward.has(userId)) {
      this.forward.set(userId, new Set());
      this.reverse.set(userId, new Set());
      this.userMeta.set(userId, metadata);
    }
  }

  addEdge(src, dst, type = "friend", weight = 1.0) {
    this.forward.get(src).add(dst);
    this.reverse.get(dst).add(src);
    this.edgeMeta.set(src + ":" + dst, { type, weight, ts: Date.now() });
    // Symmetric friendship: add reverse edge too
    if (type === "friend") {
      this.forward.get(dst).add(src);
      this.reverse.get(src).add(dst);
      this.edgeMeta.set(dst + ":" + src, { type, weight, ts: Date.now() });
    }
  }

  getFriends(userId) {
    return Array.from(this.forward.get(userId) || []);
  }

  // Sorted intersection for mutual friends - O(n + m)
  getMutualFriends(userA, userB) {
    const friendsA = this.getFriends(userA).sort((a, b) => a - b);
    const friendsB = this.getFriends(userB).sort((a, b) => a - b);
    const mutual = [];
    let i = 0, j = 0;
    while (i < friendsA.length && j < friendsB.length) {
      if (friendsA[i] === friendsB[j]) {
        mutual.push(friendsA[i]);
        i++; j++;
      } else if (friendsA[i] < friendsB[j]) {
        i++;
      } else {
        j++;
      }
    }
    return mutual;
  }

  // Bidirectional BFS for degrees of separation
  degreesOfSeparation(source, target, maxDepth = 6) {
    if (source === target) return { degrees: 0, path: [source] };
    const frontS = new Map([[source, null]]);  // node -> parent
    const frontT = new Map([[target, null]]);
    let queueS = [source], queueT = [target];
    let depth = 0;

    while (depth < maxDepth && (queueS.length > 0 || queueT.length > 0)) {
      depth++;
      // Expand the smaller frontier first for efficiency
      if (queueS.length <= queueT.length) {
        const nextQ = [];
        for (const node of queueS) {
          for (const neighbor of this.getFriends(node)) {
            if (frontT.has(neighbor)) {
              return this._buildPath(frontS, frontT, node, neighbor, source, target);
            }
            if (!frontS.has(neighbor)) {
              frontS.set(neighbor, node);
              nextQ.push(neighbor);
            }
          }
        }
        queueS = nextQ;
      } else {
        const nextQ = [];
        for (const node of queueT) {
          for (const neighbor of this.getFriends(node)) {
            if (frontS.has(neighbor)) {
              return this._buildPath(frontS, frontT, neighbor, node, source, target);
            }
            if (!frontT.has(neighbor)) {
              frontT.set(neighbor, node);
              nextQ.push(neighbor);
            }
          }
        }
        queueT = nextQ;
      }
    }
    return { degrees: -1, path: [] };
  }

  _buildPath(frontS, frontT, meetS, meetT, source, target) {
    const pathLeft = [];
    let cur = meetS;
    while (cur !== null) { pathLeft.unshift(cur); cur = frontS.get(cur); }
    const pathRight = [];
    cur = meetT;
    while (cur !== null) { pathRight.push(cur); cur = frontT.get(cur); }
    const fullPath = pathLeft.concat(pathRight);
    return { degrees: fullPath.length - 1, path: fullPath };
  }

  // PYMK: Friend-of-friend recommendations with scoring
  recommendFriends(userId, topK = 20) {
    const friends = this.forward.get(userId);
    if (!friends) return [];
    const scores = new Map(); // candidateId -> score
    const mutualMap = new Map(); // candidateId -> count of shared friends

    // Phase 1: Count mutual connections (friends of friends)
    for (const friendId of friends) {
      const fof = this.forward.get(friendId) || new Set();
      for (const candidate of fof) {
        if (candidate === userId || friends.has(candidate)) continue;
        mutualMap.set(candidate, (mutualMap.get(candidate) || 0) + 1);
      }
    }

    // Phase 2: Score candidates with multiple signals
    const userInfo = this.userMeta.get(userId) || {};
    for (const [candidate, mutualCount] of mutualMap) {
      const candInfo = this.userMeta.get(candidate) || {};
      let score = mutualCount * 10;  // base: mutual friends
      if (userInfo.company && userInfo.company === candInfo.company) score += 5;
      if (userInfo.school && userInfo.school === candInfo.school) score += 4;
      if (userInfo.city && userInfo.city === candInfo.city) score += 2;
      // Interaction-weighted: friends with higher edge weight contribute more
      for (const friendId of friends) {
        if ((this.forward.get(friendId) || new Set()).has(candidate)) {
          const meta = this.edgeMeta.get(userId + ":" + friendId);
          if (meta) score += meta.weight * 2;
        }
      }
      scores.set(candidate, score);
    }

    // Phase 3: Sort and return top K
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([candidateId, score]) => ({
        userId: candidateId,
        score,
        mutualCount: mutualMap.get(candidateId),
        metadata: this.userMeta.get(candidateId)
      }));
  }
}

// Graph Partitioner - Assigns nodes to shards for distributed storage
class GraphPartitioner {
  constructor(numShards) {
    this.numShards = numShards;
    this.shardMap = new Map();     // nodeId -> shardId
    this.shardLoads = new Array(numShards).fill(0);
  }

  // Simple hash-based partition
  hashPartition(nodeId) {
    let hash = 0;
    const key = String(nodeId);
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % this.numShards;
  }

  assignNode(nodeId) {
    const shard = this.hashPartition(nodeId);
    this.shardMap.set(nodeId, shard);
    this.shardLoads[shard]++;
    return shard;
  }

  getShardForNode(nodeId) {
    return this.shardMap.get(nodeId) ?? this.hashPartition(nodeId);
  }

  // Check balance: max deviation from average load
  getBalanceMetrics() {
    const avg = this.shardLoads.reduce((s, v) => s + v, 0) / this.numShards;
    const maxLoad = Math.max(...this.shardLoads);
    const minLoad = Math.min(...this.shardLoads);
    return { avg, maxLoad, minLoad, skew: (maxLoad - minLoad) / avg };
  }
}`,
    jsCode: `// Advanced Social Graph Components: Bloom Filter + Cache Layer

// Bloom Filter for fast "visited" checks during BFS traversal
class BloomFilter {
  constructor(size = 1000000, numHashes = 7) {
    this.size = size;
    this.numHashes = numHashes;
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }

  _hashes(value) {
    const str = String(value);
    const results = [];
    for (let seed = 0; seed < this.numHashes; seed++) {
      let h = seed * 0x9747b28c;
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
        h ^= h >>> 15;
      }
      results.push(Math.abs(h) % this.size);
    }
    return results;
  }

  add(value) {
    for (const pos of this._hashes(value)) {
      this.bits[pos >>> 3] |= (1 << (pos & 7));
    }
  }

  mightContain(value) {
    for (const pos of this._hashes(value)) {
      if (!(this.bits[pos >>> 3] & (1 << (pos & 7)))) return false;
    }
    return true;
  }
}

// TAO-like Cache Layer for social graph data
class GraphCache {
  constructor(maxSize = 100000, ttlMs = 300000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();      // key -> { value, expiry, accessCount }
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  _makeKey(type, id, assocType) {
    return type + ":" + id + (assocType ? ":" + assocType : "");
  }

  getObject(userId) {
    return this._get(this._makeKey("obj", userId));
  }

  getAssociations(userId, type) {
    return this._get(this._makeKey("assoc", userId, type));
  }

  putObject(userId, data) {
    this._put(this._makeKey("obj", userId), data);
  }

  putAssociations(userId, type, friendIds) {
    this._put(this._makeKey("assoc", userId, type), friendIds);
  }

  _get(key) {
    const entry = this.cache.get(key);
    if (!entry) { this.misses++; return null; }
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    entry.accessCount++;
    this.hits++;
    return entry.value;
  }

  _put(key, value) {
    if (this.cache.size >= this.maxSize) this._evict();
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
      accessCount: 1
    });
  }

  _evict() {
    // LRU-like: evict entries with lowest access count
    let minKey = null, minCount = Infinity;
    for (const [key, entry] of this.cache) {
      if (entry.accessCount < minCount) {
        minCount = entry.accessCount;
        minKey = key;
      }
    }
    if (minKey) this.cache.delete(minKey);
  }

  invalidate(userId) {
    for (const key of this.cache.keys()) {
      if (key.includes(":" + userId)) this.cache.delete(key);
    }
  }

  getHitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
}

// Optimized BFS with Bloom filter for large-scale graph traversal
function bfsWithBloom(graph, startId, maxHops, targetFilter) {
  const bloom = new BloomFilter(1000000, 7);
  const results = [];
  let frontier = [startId];
  bloom.add(startId);

  for (let hop = 0; hop < maxHops && frontier.length > 0; hop++) {
    const nextFrontier = [];
    for (const nodeId of frontier) {
      const friends = graph.getFriends(nodeId);
      for (const friendId of friends) {
        if (bloom.mightContain(friendId)) continue;
        bloom.add(friendId);
        nextFrontier.push(friendId);
        if (targetFilter(friendId, hop + 1)) {
          results.push({ id: friendId, hops: hop + 1 });
        }
      }
    }
    frontier = nextFrontier;
  }
  return results;
}`,
    explanation: `**Scaling Analysis:**\n\n1. **Read Path Performance**: Friend list lookups hit the TAO cache (L1) 99.9% of the time, achieving <1ms latency. Cache is partitioned by user_id across 10K+ servers, each holding ~200K users' adjacency lists in memory.\n\n2. **Write Path**: Edge additions go to the leader database shard, then asynchronously propagate to cache invalidation. Two-phase: (a) write to DB, (b) invalidate/update cache. Eventual consistency window: 1-2 seconds.\n\n3. **Mutual Friends at Scale**: For two users with 500 friends each, sorted intersection takes ~1000 comparisons (~5 microseconds). With 100K QPS, this requires only ~50 CPU cores. The bottleneck is fetching the lists, not computing the intersection.\n\n4. **BFS Traversal Scaling**: Bidirectional BFS for 3-hop separation explores ~22K nodes instead of 125M. With Bloom filters, the visited-set check is O(1). Total time: ~20ms for 3 hops including cache lookups.\n\n5. **High-Degree Node Handling**: Users with >100K connections have their adjacency lists chunked into 5K segments. Only the first chunk is cached eagerly; subsequent chunks are loaded on demand. For PYMK, celebrities are excluded as candidates (they do not benefit from mutual-friend recommendations).\n\n**Failure Modes:**\n- Cache server crash: L2 cache absorbs the load; L1 rebuilds from L2 + DB within minutes\n- Database shard failure: replica promotion within 30 seconds; stale reads from cache during failover\n- Network partition between regions: each region operates independently with eventual cross-region sync\n- Hot user (celebrity): dedicated cache shard with higher memory allocation; rate-limit traversal queries involving high-degree nodes\n\n**Bottleneck Analysis:**\n- Memory: 500B edges x 24 bytes = 12TB total. With 10K cache servers, each holds ~1.2GB of edge data. Comfortable.\n- Network: 500K QPS x 4KB avg response = 2GB/s. Distributed across thousands of servers, this is trivial.\n- CPU: PYMK batch job for 2B users x 250K candidates each = enormous. Solution: run on a dedicated MapReduce cluster, process incrementally (only re-score users whose graph changed in last 24h).\n\n**Trade-offs:**\n- Hash partitioning vs. graph-aware partitioning: Hash is simple and balanced but causes many cross-shard queries for BFS. Graph-aware (METIS) reduces cross-shard edges by 40% but requires expensive periodic repartitioning.\n- Materialized mutual friends vs. computed on-the-fly: Pre-computing mutual friend counts for all pairs is O(n^2) and infeasible. Instead, cache results for recently queried pairs with short TTL.\n- TAO vs. native graph DB (Neo4j): TAO scales better for simple association queries. Neo4j is better for complex Cypher queries but harder to shard beyond a single machine.\n\n**Monitoring:**\n- Cache hit rate per shard (target: >99.5%)\n- P99 latency for mutual friend queries (target: <50ms)\n- BFS timeout rate (target: <0.1% of queries exceed 100ms)\n- PYMK recommendation acceptance rate (measure quality)\n- Cross-shard query ratio (lower is better)`,
    timeComplexity: `Mutual friends: O(n + m) where n, m are friend list sizes (typically ~500 each, so ~1000 ops). Bidirectional BFS for k hops: O(b^(k/2)) where b is average branching factor (500), so 3-hop = ~22K nodes explored vs 125M for unidirectional. PYMK generation: O(f * avg_friends) per user where f is friend count. Friend list lookup: O(1) from cache. Full graph BFS with Bloom filter: O(V + E) for reachable subgraph with O(1) membership checks.`,
    spaceComplexity: `Edge storage: 500B edges x 24 bytes = 12 TB raw, 36 TB with 3x replication. Node metadata: 2B x 200 bytes = 400 GB. TAO cache (L1): 10K servers x 32 GB RAM = 320 TB total cache capacity, holding hot adjacency lists. Bloom filter per BFS query: 1M bits / 8 = 125 KB per traversal (short-lived). PYMK recommendation cache: 2B users x 200 candidates x 12 bytes = 4.8 TB. Total system storage: ~50 TB persistent + ~320 TB cache.`,
    hints: [
      `Bidirectional BFS is the single most important optimization for shortest-path queries in social graphs. It reduces the explored nodes from b^k to 2*b^(k/2), which for typical social graphs (b=500, k=6) means exploring ~45K nodes instead of 31 trillion. Always expand the smaller frontier first.`,
      `For mutual friends, use sorted array intersection rather than hash set intersection. Sorted intersection has better cache locality and is faster in practice for lists under 10K elements. For users with >100K friends, switch to bitmap intersection using Roaring Bitmaps for sub-millisecond performance.`,
      `Handle the high-degree node problem (celebrities with millions of followers) by sharding their adjacency lists into chunks. When computing PYMK, skip celebrities as candidates entirely since mutual-friend signals are meaningless for them. Instead, recommend celebrities through a separate trending/popularity pipeline.`,
      `Use a TAO-like two-tier cache architecture. L1 caches are per-region and handle 99%+ of reads. L2 caches are the fallback layer that reduces fan-out to the database. Cache both objects (user profiles) and associations (edge lists) with different TTLs. Invalidate on write, not on timer.`,
      `Graph partitioning matters enormously for BFS performance. Hash partitioning distributes evenly but causes ~80% of BFS edges to cross shard boundaries. Graph-aware partitioning (using METIS or similar) can reduce cross-shard edges to ~40%, halving network round-trips during traversal. Run repartitioning weekly as the graph evolves.`,
      `For PYMK at scale, do not recompute all 2B users daily. Use incremental processing: only re-score users whose local graph topology changed (new edges added/removed). This typically reduces the daily batch job from processing 2B users to ~50M users (the active set).`,
      `Implement circuit breakers around BFS traversal queries. If a query exceeds 100ms or explores more than 50K nodes, terminate early and return partial results. This prevents a single expensive query from consuming resources that affect other users.`,
      `Consider storing pre-computed social features (mutual friend count, interaction frequency, shared attributes) in a feature store. These features power both PYMK recommendations and feed ranking. Update them incrementally with each graph mutation rather than recomputing from scratch.`
    ]
  },
  {
    id: 9022,
    description: `Design a Ride-Sharing Service (Uber)\n\n**Functional Requirements:**\n- Riders request rides by specifying pickup and dropoff locations\n- Match riders with the nearest available driver within 5 seconds\n- Track real-time driver locations (GPS updates every 3-5 seconds)\n- Support trip lifecycle: request -> match -> driver en route -> pickup -> in progress -> dropoff -> payment -> rating\n- Dynamic surge pricing based on supply/demand ratio per geographic zone\n- Support ride types: UberX, UberXL, UberBlack, Pool\n- ETA estimation for driver arrival and trip duration\n\n**Non-Functional Requirements:**\n- Match latency: <5 seconds from request to driver notification\n- Location update ingestion: handle 1M+ concurrent drivers sending updates every 4 seconds = 250K updates/sec\n- 99.9% availability for ride requests\n- Location accuracy: track drivers within 10-meter precision\n- Payment processing: exactly-once semantics for fare charging\n\n**Capacity Estimation:**\n- 1M concurrent drivers, 5M concurrent riders\n- Location updates: 1M drivers x 1 update/4s = 250K writes/sec\n- Ride requests: 10K requests/sec at peak\n- Each location update: 8 bytes (lat) + 8 bytes (lng) + 8 bytes (driver_id) + 8 bytes (timestamp) = 32 bytes\n- Location write throughput: 250K x 32 bytes = 8 MB/sec\n- Trip records: 20M trips/day, each ~2KB = 40 GB/day`,
    examples: `**Exercise 1: Capacity Estimation for Location Service**\nWith 1M active drivers updating location every 4 seconds: 250K writes/sec to the spatial index. Each write requires updating a geohash entry (remove old, insert new). Using Redis with geospatial commands (GEOADD), each operation is O(log N). At 250K ops/sec and ~50 microseconds per op, we need ~12.5 CPU-seconds of work per second, so ~13 Redis instances (with headroom, 20 instances sharded by city/region). Memory: 1M drivers x 100 bytes per entry = 100 MB per shard. Reads for nearest driver: 10K/sec x O(log N + K) per GEORADIUS query.\n\n**Exercise 2: API Design**\n\`\`\`\nPOST /v1/rides/request\n  Body: { rider_id, pickup: { lat, lng }, dropoff: { lat, lng }, ride_type: "uberx" }\n  Response: 202 { ride_id, status: "matching", estimated_fare: { min, max, surge_multiplier } }\n\nPOST /v1/drivers/{driver_id}/location\n  Body: { lat, lng, heading, speed, timestamp }\n  Response: 204\n\nGET /v1/rides/{ride_id}/status\n  Response: 200 { status, driver: { id, name, location, eta }, fare_estimate }\n\nPOST /v1/rides/{ride_id}/complete\n  Body: { final_location: { lat, lng } }\n  Response: 200 { fare: { base, distance, time, surge, toll, total }, payment_status }\n\nGET /v1/supply-demand?lat=37.7749&lng=-122.4194&radius_km=5\n  Response: 200 { zone_id, available_drivers: 45, pending_requests: 120, surge_multiplier: 2.3 }\n\`\`\`\n\n**Exercise 3: Trip State Machine**\n\`\`\`\nSTATES: REQUESTING -> MATCHING -> DRIVER_ASSIGNED -> DRIVER_EN_ROUTE -> ARRIVED_AT_PICKUP -> IN_PROGRESS -> ARRIVED_AT_DROPOFF -> COMPLETED -> PAYMENT_PROCESSED -> RATED\nERROR STATES: NO_DRIVERS_AVAILABLE, DRIVER_CANCELLED, RIDER_CANCELLED, PAYMENT_FAILED\nTransitions triggered by: rider actions, driver actions, location events, timeouts, payment events\n\`\`\``,
    intuition: `Think of Uber as a real-time marketplace with a spatial dimension. On one side you have riders who create demand at specific GPS coordinates; on the other side you have drivers who represent supply moving through space continuously. The core problem is spatial matching: given a point (rider), find the nearest available points (drivers) from a constantly moving set.\n\nThe key insight is **geospatial indexing**. You cannot search all 1M drivers for every ride request. Instead, you organize drivers in a spatial data structure (geohash grid or QuadTree) that allows you to query "all drivers within 2km of this point" in O(log N + K) time where K is the number of results.\n\nGeohashing is the workhorse: it converts (lat, lng) into a string prefix where nearby locations share prefixes. A geohash of precision 6 (~1.2km x 0.6km cells) lets you find candidate drivers by simply querying all drivers whose geohash shares the same prefix. To handle cell-boundary problems, also query the 8 neighboring cells.\n\nThe second key insight is **expanding ring search**: start with a small radius (500m), and if not enough drivers are found, expand to 1km, 2km, 5km. This avoids querying a huge radius when there is a driver 200m away.\n\nSurge pricing is a feedback loop: high demand/low supply in a zone increases the price multiplier, which discourages marginal riders and attracts nearby drivers, restoring balance. The pricing model must update every 1-2 minutes based on zone-level supply/demand ratios.`,
    approach: `**High-Level Architecture:**\n\nRider App/Driver App -> Load Balancer -> API Gateway\n  -> Location Service (write path: ingest driver GPS)\n  -> Matching Service (find nearest driver, assign)\n  -> Trip Service (state machine, lifecycle)\n  -> Pricing Service (surge, fare calculation)\n  -> Payment Service (charge rider, pay driver)\n  -> Notification Service (push to rider/driver)\n\n**Component Deep Dive:**\n\n1. **Location Service**\n   - Ingests 250K location updates/sec from drivers\n   - Stores current driver locations in a geospatial index (Redis GEOADD or custom QuadTree)\n   - Sharded by city/region: each shard handles one metro area\n   - Each driver has: { driver_id, lat, lng, heading, speed, status, ride_type, timestamp }\n   - Old locations are written to a time-series DB (InfluxDB) for trip reconstruction\n   - Geohash precision 7 (~150m cells) for fine-grained proximity queries\n\n2. **Matching Service**\n   - Receives ride request with pickup location\n   - Queries Location Service for available drivers within expanding radius\n   - Ranks candidates by: distance, ETA (using road network, not Euclidean), driver rating, acceptance rate\n   - Sends ride offer to top-ranked driver; if declined/timeout (15 sec), offers to next\n   - Batch matching optimization: accumulate requests for 2 seconds, then solve assignment problem for better global matches\n   - UberPool: match multiple riders heading in similar direction to same driver\n\n3. **Trip Service**\n   - Manages trip state machine with event-driven transitions\n   - Persists trip state to a database (PostgreSQL/DynamoDB)\n   - Emits events on state changes for other services to consume\n   - Handles edge cases: driver no-show (auto-cancel after 5 min), rider no-show, mid-trip cancellation\n   - Records trip waypoints for route reconstruction and fare verification\n\n4. **Pricing Service**\n   - Base fare = base_price + (per_mile * distance) + (per_minute * duration) + booking_fee\n   - Surge multiplier per zone: surge = max(1.0, demand_count / (supply_count * target_ratio))\n   - Zones defined by geohash prefix (precision 5, ~5km cells)\n   - Supply/demand counters updated every 60 seconds from Location Service and Trip Service\n   - Upfront pricing: estimate fare before trip starts using historical route data\n\n5. **ETA Service**\n   - Uses road network graph (OpenStreetMap data) with real-time traffic overlays\n   - Dijkstra/A* for point-to-point ETA\n   - Pre-computed distance matrices for common origin-destination pairs\n   - ML model trained on historical trip data to adjust ETAs for time-of-day, weather, events\n\n**Data Flow - Ride Request:**\n1. Rider submits pickup/dropoff in app\n2. Pricing Service computes upfront fare estimate with current surge\n3. Rider confirms; Trip Service creates trip in REQUESTING state\n4. Matching Service queries Location Service for nearest available drivers\n5. Best driver receives push notification with trip details\n6. Driver accepts -> trip transitions to DRIVER_ASSIGNED -> DRIVER_EN_ROUTE\n7. Location Service tracks driver movement; ETA Service updates rider\n8. Driver arrives at pickup -> rider notified -> trip transitions to IN_PROGRESS\n9. Trip completes at dropoff -> fare finalized -> payment processed`,
    code: `// Ride-Sharing Service - Core Implementation
// GeohashIndex, Nearest Driver Finder, Trip State Machine, Surge Pricing

class GeohashIndex {
  constructor(precision = 7) {
    this.precision = precision;
    this.grid = new Map();       // geohash -> Map(driverId -> driverData)
    this.driverHash = new Map(); // driverId -> current geohash
  }

  // Encode lat/lng to geohash string
  encode(lat, lng) {
    const chars = "0123456789bcdefghjkmnpqrstuvwxyz";
    let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;
    let hash = "", bit = 0, ch = 0, isLng = true;
    while (hash.length < this.precision) {
      if (isLng) {
        const mid = (minLng + maxLng) / 2;
        if (lng >= mid) { ch = ch * 2 + 1; minLng = mid; }
        else { ch = ch * 2; maxLng = mid; }
      } else {
        const mid = (minLat + maxLat) / 2;
        if (lat >= mid) { ch = ch * 2 + 1; minLat = mid; }
        else { ch = ch * 2; maxLat = mid; }
      }
      isLng = !isLng;
      bit++;
      if (bit === 5) { hash += chars[ch]; bit = 0; ch = 0; }
    }
    return hash;
  }

  // Get 8 neighboring geohash cells plus the center
  getNeighborHashes(hash) {
    // Simplified: return prefixes of varying length to simulate neighbors
    // In production, compute actual neighbor hashes using bit manipulation
    const neighbors = [hash];
    const prefix = hash.slice(0, -1);
    const chars = "0123456789bcdefghjkmnpqrstuvwxyz";
    for (const c of chars) {
      const candidate = prefix + c;
      if (candidate !== hash) neighbors.push(candidate);
    }
    return neighbors;
  }

  updateDriverLocation(driverId, lat, lng, metadata = {}) {
    const newHash = this.encode(lat, lng);
    const oldHash = this.driverHash.get(driverId);
    // Remove from old cell
    if (oldHash && oldHash !== newHash) {
      const oldCell = this.grid.get(oldHash);
      if (oldCell) { oldCell.delete(driverId); if (oldCell.size === 0) this.grid.delete(oldHash); }
    }
    // Insert into new cell
    if (!this.grid.has(newHash)) this.grid.set(newHash, new Map());
    this.grid.get(newHash).set(driverId, { lat, lng, ts: Date.now(), ...metadata });
    this.driverHash.set(driverId, newHash);
  }

  removeDriver(driverId) {
    const hash = this.driverHash.get(driverId);
    if (hash) {
      const cell = this.grid.get(hash);
      if (cell) { cell.delete(driverId); if (cell.size === 0) this.grid.delete(hash); }
      this.driverHash.delete(driverId);
    }
  }

  // Find drivers in a geohash cell and its neighbors
  getDriversNear(lat, lng) {
    const centerHash = this.encode(lat, lng);
    const hashes = this.getNeighborHashes(centerHash);
    const drivers = [];
    for (const h of hashes) {
      const cell = this.grid.get(h);
      if (cell) {
        for (const [id, data] of cell) {
          drivers.push({ driverId: id, ...data });
        }
      }
    }
    return drivers;
  }
}

// Haversine distance in kilometers
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Expanding ring search for nearest available drivers
function findNearestDrivers(geoIndex, lat, lng, k = 5, maxRadiusKm = 10) {
  const radii = [0.5, 1, 2, 5, maxRadiusKm];
  let candidates = [];

  for (const radius of radii) {
    const nearby = geoIndex.getDriversNear(lat, lng);
    candidates = nearby
      .map(d => ({ ...d, distance: haversineKm(lat, lng, d.lat, d.lng) }))
      .filter(d => d.distance <= radius && d.status !== "busy")
      .sort((a, b) => a.distance - b.distance);
    if (candidates.length >= k) break;
  }
  return candidates.slice(0, k);
}

// Trip State Machine
class TripStateMachine {
  constructor(tripId, riderId) {
    this.tripId = tripId;
    this.riderId = riderId;
    this.driverId = null;
    this.state = "REQUESTING";
    this.history = [{ state: "REQUESTING", ts: Date.now() }];
    this.transitions = {
      REQUESTING:       ["MATCHING", "RIDER_CANCELLED"],
      MATCHING:         ["DRIVER_ASSIGNED", "NO_DRIVERS", "RIDER_CANCELLED"],
      DRIVER_ASSIGNED:  ["DRIVER_EN_ROUTE", "DRIVER_CANCELLED", "RIDER_CANCELLED"],
      DRIVER_EN_ROUTE:  ["ARRIVED_AT_PICKUP", "DRIVER_CANCELLED", "RIDER_CANCELLED"],
      ARRIVED_AT_PICKUP:["IN_PROGRESS", "RIDER_NO_SHOW", "RIDER_CANCELLED"],
      IN_PROGRESS:      ["COMPLETED"],
      COMPLETED:        ["PAYMENT_PROCESSING"],
      PAYMENT_PROCESSING: ["PAYMENT_SUCCESS", "PAYMENT_FAILED"],
      PAYMENT_SUCCESS:  ["RATED", "CLOSED"],
      PAYMENT_FAILED:   ["PAYMENT_PROCESSING", "DISPUTE"],
    };
  }

  canTransition(newState) {
    const allowed = this.transitions[this.state];
    return allowed && allowed.includes(newState);
  }

  transition(newState, metadata = {}) {
    if (!this.canTransition(newState)) {
      throw new Error("Invalid transition: " + this.state + " -> " + newState);
    }
    this.state = newState;
    this.history.push({ state: newState, ts: Date.now(), ...metadata });
    return this.state;
  }

  assignDriver(driverId) {
    this.driverId = driverId;
    this.transition("DRIVER_ASSIGNED", { driverId });
  }

  getDuration() {
    const start = this.history.find(h => h.state === "IN_PROGRESS");
    const end = this.history.find(h => h.state === "COMPLETED");
    if (!start || !end) return 0;
    return (end.ts - start.ts) / 1000; // seconds
  }
}

// Surge Pricing Calculator
class SurgePricingCalculator {
  constructor() {
    this.zones = new Map();  // zoneId -> { supply, demand, multiplier, lastUpdated }
    this.baseRates = { baseFare: 2.50, perMile: 1.75, perMinute: 0.35, bookingFee: 2.20 };
    this.surgeConfig = { minMultiplier: 1.0, maxMultiplier: 5.0, targetRatio: 0.7 };
  }

  updateZoneMetrics(zoneId, availableDrivers, pendingRequests) {
    const ratio = availableDrivers / Math.max(pendingRequests, 1);
    let multiplier;
    if (ratio >= this.surgeConfig.targetRatio) {
      multiplier = 1.0;
    } else if (ratio <= 0.1) {
      multiplier = this.surgeConfig.maxMultiplier;
    } else {
      // Linear interpolation between target ratio and critical ratio
      const normalizedScarcity = 1 - (ratio / this.surgeConfig.targetRatio);
      multiplier = 1.0 + normalizedScarcity * (this.surgeConfig.maxMultiplier - 1.0);
    }
    multiplier = Math.round(multiplier * 10) / 10; // round to 0.1
    this.zones.set(zoneId, {
      supply: availableDrivers, demand: pendingRequests,
      multiplier, lastUpdated: Date.now()
    });
    return multiplier;
  }

  calculateFare(distanceMiles, durationMinutes, zoneId) {
    const zone = this.zones.get(zoneId) || { multiplier: 1.0 };
    const baseCost = this.baseRates.baseFare +
      (this.baseRates.perMile * distanceMiles) +
      (this.baseRates.perMinute * durationMinutes);
    const surgedCost = baseCost * zone.multiplier;
    const total = surgedCost + this.baseRates.bookingFee;
    return {
      baseFare: this.baseRates.baseFare,
      distanceCharge: Math.round(this.baseRates.perMile * distanceMiles * 100) / 100,
      timeCharge: Math.round(this.baseRates.perMinute * durationMinutes * 100) / 100,
      surgeMultiplier: zone.multiplier,
      bookingFee: this.baseRates.bookingFee,
      total: Math.round(total * 100) / 100
    };
  }
}`,
    jsCode: `// Ride-Sharing: Driver Dispatch Orchestrator + ETA Estimator

class DispatchOrchestrator {
  constructor(geoIndex, surgePricing) {
    this.geoIndex = geoIndex;
    this.surge = surgePricing;
    this.pendingRequests = new Map();  // rideId -> request details
    this.driverOffers = new Map();     // driverId -> current offer
    this.offerTimeoutMs = 15000;       // 15 sec to accept
  }

  async requestRide(rideId, riderId, pickup, dropoff, rideType) {
    const trip = new TripStateMachine(rideId, riderId);
    trip.transition("MATCHING");
    this.pendingRequests.set(rideId, {
      trip, pickup, dropoff, rideType,
      attempts: 0, maxAttempts: 5, startTime: Date.now()
    });
    return this._attemptMatch(rideId);
  }

  _attemptMatch(rideId) {
    const request = this.pendingRequests.get(rideId);
    if (!request || request.attempts >= request.maxAttempts) {
      if (request) request.trip.transition("NO_DRIVERS");
      return { status: "no_drivers", rideId };
    }
    request.attempts++;
    const candidates = findNearestDrivers(
      this.geoIndex, request.pickup.lat, request.pickup.lng,
      3, // find top 3
      2 + request.attempts * 2  // expand radius each attempt
    );
    if (candidates.length === 0) {
      return this._attemptMatch(rideId); // retry with wider radius
    }
    // Score and rank candidates
    const scored = candidates.map(d => ({
      ...d,
      score: this._scoreDriver(d, request)
    })).sort((a, b) => b.score - a.score);

    const bestDriver = scored[0];
    return this._offerToDriver(rideId, bestDriver.driverId, request);
  }

  _scoreDriver(driver, request) {
    let score = 100;
    score -= driver.distance * 20;   // closer is better
    score += (driver.rating || 4.5) * 5;  // higher rating
    score += (driver.acceptRate || 0.8) * 10; // higher accept rate
    // Penalize if driver heading away from pickup
    if (driver.heading !== undefined) {
      const angleDiff = Math.abs(driver.heading - this._bearingTo(
        driver.lat, driver.lng, request.pickup.lat, request.pickup.lng
      ));
      if (angleDiff > 90) score -= 15;
    }
    return score;
  }

  _bearingTo(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  _offerToDriver(rideId, driverId, request) {
    this.driverOffers.set(driverId, {
      rideId, offeredAt: Date.now(), timeoutMs: this.offerTimeoutMs
    });
    // In production this sends a push notification and waits for response
    return {
      status: "offered",
      rideId,
      driverId,
      expiresIn: this.offerTimeoutMs
    };
  }

  driverAccept(driverId, rideId) {
    const request = this.pendingRequests.get(rideId);
    if (!request) return { error: "ride_not_found" };
    request.trip.assignDriver(driverId);
    this.geoIndex.updateDriverLocation(driverId,
      request.pickup.lat, request.pickup.lng, { status: "busy" });
    this.driverOffers.delete(driverId);
    return { status: "assigned", rideId, driverId, trip: request.trip };
  }

  driverDecline(driverId, rideId) {
    this.driverOffers.delete(driverId);
    return this._attemptMatch(rideId);
  }
}

// ETA Estimator using simple road-network heuristic
class ETAEstimator {
  constructor() {
    this.speedByHour = new Map(); // hour -> avg speed km/h
    this._initDefaults();
    this.historicalTrips = [];    // for ML-like adjustment
  }

  _initDefaults() {
    // Average city driving speeds by hour of day
    for (let h = 0; h < 24; h++) {
      let speed;
      if (h >= 7 && h <= 9) speed = 15;       // morning rush
      else if (h >= 16 && h <= 19) speed = 12; // evening rush
      else if (h >= 22 || h <= 5) speed = 40;  // late night
      else speed = 25;                          // normal
      this.speedByHour.set(h, speed);
    }
  }

  estimateETA(fromLat, fromLng, toLat, toLng) {
    const straightLine = haversineKm(fromLat, fromLng, toLat, toLng);
    const roadFactor = 1.4; // roads are ~40% longer than straight line
    const roadDistance = straightLine * roadFactor;
    const hour = new Date().getHours();
    const avgSpeed = this.speedByHour.get(hour) || 25;
    const etaMinutes = (roadDistance / avgSpeed) * 60;
    // Add intersection delay: roughly 30 sec per km in city
    const intersectionDelay = roadDistance * 0.5;
    const totalMinutes = etaMinutes + intersectionDelay;
    return {
      distanceKm: Math.round(roadDistance * 10) / 10,
      etaMinutes: Math.round(totalMinutes * 10) / 10,
      etaSeconds: Math.round(totalMinutes * 60),
      avgSpeedKmh: avgSpeed,
      confidence: straightLine < 5 ? 0.85 : 0.7  // closer = more confident
    };
  }

  // Record actual trip for future calibration
  recordActualTrip(estimatedMinutes, actualMinutes, hour, distanceKm) {
    this.historicalTrips.push({ estimatedMinutes, actualMinutes, hour, distanceKm });
    // Adjust speed for this hour based on error
    if (this.historicalTrips.length % 100 === 0) {
      this._recalibrate();
    }
  }

  _recalibrate() {
    const byHour = new Map();
    for (const trip of this.historicalTrips.slice(-10000)) {
      if (!byHour.has(trip.hour)) byHour.set(trip.hour, []);
      byHour.get(trip.hour).push(trip.distanceKm / (trip.actualMinutes / 60));
    }
    for (const [hour, speeds] of byHour) {
      const avgActual = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      this.speedByHour.set(hour, Math.round(avgActual * 10) / 10);
    }
  }
}`,
    explanation: `**Scaling Analysis:**\n\n1. **Location Service at Scale**: 250K writes/sec is handled by sharding the geospatial index by city/region. Each city (e.g., San Francisco) has 10K-50K active drivers, easily fitting in a single Redis instance. With 200 cities, you need ~200 Redis shards plus replicas. Total memory: 1M drivers x 100 bytes = 100 MB, trivially small.\n\n2. **Matching Latency**: The expanding ring search starts at 500m and typically finds drivers on the first ring in urban areas. Querying a geohash cell and its 8 neighbors returns ~50-200 candidates. Scoring 200 candidates takes <1ms. Total match time: 50-200ms for the search + 15s max wait for driver acceptance. P95 total: <20 seconds.\n\n3. **Trip Service Throughput**: 10K new trips/sec, each with ~8 state transitions = 80K state writes/sec. PostgreSQL with 5 shards (by city) handles this comfortably. Each trip record is ~2KB, so daily storage = 20M trips x 2KB = 40 GB/day.\n\n4. **Surge Pricing Update Frequency**: Zone metrics update every 60 seconds. With ~10K zones globally, this is 10K calculations/minute, trivial. The challenge is ensuring consistency: all API servers must see the same surge multiplier for a zone. Use Redis pub/sub to broadcast updates.\n\n**Failure Modes:**\n- Location service shard failure: drivers in that region become invisible. Mitigation: replica promotion + driver app retries to alternate shard.\n- Matching service crash mid-offer: driver gets notification but backend lost state. Mitigation: persist offer to DB before sending; on restart, check pending offers.\n- Payment service failure after trip completion: rider gets free ride. Mitigation: queue payment for retry; never mark trip as fully closed until payment succeeds.\n- GPS drift/spoofing: driver appears at wrong location. Mitigation: cross-validate with cell tower triangulation; detect impossible speed (>200 km/h between updates).\n\n**Bottleneck Identification:**\n- The location write path (250K/sec) is the highest throughput component. Redis GEOADD handles this, but you need careful sharding and monitoring of per-shard QPS.\n- The matching service during surge events: when demand spikes 10x, the number of pending requests and match attempts grows proportionally. Solution: batch matching every 2 seconds to solve an assignment problem optimally rather than greedy one-by-one matching.\n- ETA calculation for every candidate driver during matching: if evaluating 200 candidates x 10K requests/sec = 2M ETA calls/sec. Solution: pre-compute ETA matrices for popular areas; use straight-line estimates for initial filtering, road-network ETA only for top 10 candidates.\n\n**Trade-offs:**\n- Geohash vs. QuadTree: Geohash is simpler (string prefix matching, works with Redis) but has edge-case issues at cell boundaries. QuadTree provides more uniform spatial queries but requires custom implementation and is harder to distribute.\n- Greedy matching (first available driver) vs. batch matching (accumulate requests, solve globally): Greedy is faster (lower rider wait time) but suboptimal (a driver 1km away might be assigned when a driver 200m away becomes available 2 seconds later). Batch matching improves global efficiency by 10-15% but adds 2-3 seconds of latency.\n- Surge pricing granularity: fine-grained zones (1km cells) are more accurate but cause "surge boundaries" where one side of a street has 3x pricing and the other has 1x. Coarser zones (5km) are smoother but less responsive.\n\n**Monitoring:**\n- P50/P95/P99 match latency (target: <5s/<15s/<30s)\n- Driver utilization rate (target: 60-70% during peak)\n- Surge zone accuracy: correlation between surge multiplier and actual wait time\n- GPS update staleness: % of drivers with updates older than 10 seconds\n- Trip completion rate: % of requested trips that complete successfully\n- Payment failure rate and retry success rate`,
    timeComplexity: `Geohash encode: O(precision) = O(7) constant. Nearest driver search: O(K * log K) where K is candidates in radius (~200 in urban). Trip state transition: O(1) lookup + O(1) write. Surge calculation per zone: O(1). Full match cycle: O(K log K) for ranking + O(attempts * K) worst case with retries. Location update: O(log N) for geospatial index update where N is drivers in that shard.`,
    spaceComplexity: `Driver location index: 1M drivers x 100 bytes = 100 MB in-memory across all shards. Trip records: 20M/day x 2KB = 40 GB/day, 14.6 TB/year. Historical location traces: 1M drivers x 21,600 updates/day x 32 bytes = 691 GB/day (store 7 days = 4.8 TB, then archive). Surge zone state: 10K zones x 100 bytes = 1 MB. ETA cache/pre-computed matrices: ~500 MB per city for road network graph.`,
    hints: [
      `Geohash is the foundation of the location service. Use precision 7 (~150m cells) for driver indexing. Always query the center cell plus 8 neighbors to avoid boundary issues. Store the geohash as a Redis sorted set key for O(log N) range queries, or use Redis native GEOADD/GEORADIUS commands.`,
      `Implement expanding ring search for driver matching. Start with 500m radius and double until you find enough candidates or hit the max radius (10km). This avoids expensive wide-radius queries when a driver is nearby. In rural areas, start with a wider initial radius (2km) since driver density is lower.`,
      `The trip state machine must be persisted to a database, not just in-memory. If the matching service crashes, you need to recover the state of all in-progress trips. Use event sourcing: store each state transition as an immutable event, and rebuild state by replaying events. This also provides a full audit trail.`,
      `Surge pricing requires a feedback loop with dampening. If you set surge too high too fast, all riders cancel and drivers flood in, causing the surge to crash to 1.0, then demand rebounds. Use exponential moving average (EMA) on supply/demand ratios with a smoothing factor of 0.3 to prevent oscillation.`,
      `For UberPool matching, you need a more sophisticated algorithm than simple nearest-driver. Model it as a constrained optimization: minimize total detour time for all riders in the pool, subject to maximum detour per rider (e.g., 5 minutes). This is an NP-hard problem; use greedy heuristics with lookahead.`,
      `Driver ETA is critical for rider experience. Never use straight-line distance as the displayed ETA. Even a simple heuristic (straight-line x 1.4 road factor / average speed by time-of-day) is much better. For production, integrate with a routing engine (OSRM or Google Directions API) for road-network ETAs.`,
      `Handle the "phantom driver" problem: a driver's GPS shows them as available and nearby, but they are actually in a parking garage, on a highway, or their phone is off. Solution: require drivers to actively confirm availability every 30 seconds; expire driver entries from the index after 15 seconds without an update.`,
      `Payment must have exactly-once semantics. Use idempotency keys for every payment attempt. The flow should be: (1) create a pending payment record with unique trip_id, (2) charge payment provider with idempotency key = trip_id, (3) on success, mark payment complete. On failure, retry with the same idempotency key.`
    ]
  },
  {
    id: 9023,
    description: `Design an Online Code Editor (Replit)\n\n**Functional Requirements:**\n- Browser-based IDE with syntax highlighting, autocomplete, and file tree management\n- Execute code in 20+ programming languages (JavaScript, Python, Java, Go, Rust, etc.)\n- Sandboxed execution per user session with resource limits (CPU, memory, network)\n- Real-time terminal output streamed to the browser via WebSocket\n- Persist user workspaces (project files, dependencies, configuration)\n- Share projects via URL and fork existing projects\n- Package management (npm, pip, cargo) within the sandbox\n\n**Non-Functional Requirements:**\n- Code execution startup latency: <2 seconds for warm containers, <5 seconds for cold start\n- Terminal output latency: <50ms from process stdout to browser display\n- Support 100K concurrent active sessions\n- 99.9% availability for the editor; 99.5% for execution (containers can restart)\n- Isolation: one user's code cannot access another user's filesystem, network, or processes\n- Resource limits: max 1 CPU core, 512MB RAM, 1GB disk per session\n\n**Capacity Estimation:**\n- 100K concurrent sessions x 512MB RAM = 50 TB RAM for containers\n- Assuming 10% are actively executing at any time = 10K running containers\n- WebSocket connections: 100K persistent connections\n- File operations: 200K saves/minute (auto-save every 2 seconds for active users)\n- Container images: 20 language runtimes x 2GB avg = 40GB base images\n- Workspace storage: 1M users x 100MB avg workspace = 100 TB on object storage`,
    examples: `**Exercise 1: Resource Limit Estimation**\nWith 100K concurrent sessions: if each gets 512MB RAM, total RAM = 50 TB. Using 256GB RAM servers, you need ~200 servers just for container memory. But only ~10% execute simultaneously, so 10K active containers x 512MB = 5 TB, needing ~20 high-memory servers. The other 90K sessions need only the editor frontend (no container). Use container pooling: keep 5K warm containers pre-allocated across languages, spin up on demand for the rest.\n\n**Exercise 2: API Design**\n\`\`\`\nPOST /v1/workspaces\n  Body: { name, language, template: "blank" | "react" | "flask" }\n  Response: 201 { workspace_id, url, files: [...] }\n\nGET /v1/workspaces/{id}/files/{path}\n  Response: 200 { content, language, size, last_modified }\n\nPUT /v1/workspaces/{id}/files/{path}\n  Body: { content }\n  Response: 200 { saved: true, version }\n\nPOST /v1/workspaces/{id}/execute\n  Body: { command: "node index.js", stdin: "" }\n  Response: 202 { execution_id }\n  (output streamed via WebSocket: ws://api/v1/workspaces/{id}/terminal)\n\nPOST /v1/workspaces/{id}/fork\n  Response: 201 { new_workspace_id, url }\n\nDELETE /v1/workspaces/{id}/containers\n  Response: 200 { stopped: true }\n\`\`\`\n\n**Exercise 3: Container Resource Profile**\n\`\`\`\nLanguage Profiles:\n  JavaScript/Node: 256MB RAM, 0.5 CPU, node:18-alpine image (150MB)\n  Python:          512MB RAM, 0.5 CPU, python:3.11-slim image (200MB)\n  Java:            1GB RAM, 1.0 CPU, openjdk:17-slim image (400MB)\n  Rust:            1GB RAM, 1.0 CPU, rust:1.70-slim image (800MB)\n  Go:              512MB RAM, 0.5 CPU, golang:1.21-alpine image (300MB)\n\`\`\``,
    intuition: `Think of an online code editor as three distinct systems bolted together: (1) a rich text editor in the browser (like VS Code), (2) a container orchestrator (like a mini Kubernetes), and (3) a file storage system (like a simplified Dropbox).\n\nThe key insight is **separation of the editing experience from the execution environment**. The editor runs entirely in the browser using Monaco Editor (the same engine as VS Code). It communicates with the backend only for: file persistence, code execution, and terminal I/O. This means 90% of the user experience (typing, syntax highlighting, autocomplete for local files) works even if the backend is temporarily unavailable.\n\nThe second key insight is **container pooling with pre-warming**. Cold-starting a container (pulling image, initializing runtime, installing dependencies) takes 5-30 seconds. Users will not wait that long. Instead, maintain a pool of pre-warmed containers for each popular language. When a user starts a session, assign them an already-running container from the pool. This reduces startup to <2 seconds (just workspace file mounting).\n\nThe third key insight is **security through isolation layers**. User code is untrusted and potentially malicious (fork bombs, crypto miners, network scanners). Defense in depth: (1) container isolation via Linux namespaces + cgroups, (2) seccomp profiles blocking dangerous syscalls, (3) network policies blocking internal service access, (4) resource limits (CPU, memory, disk, PID count), (5) execution timeouts.\n\nFor the terminal, use a WebSocket that relays between the browser and the container's PTY (pseudo-terminal). The server acts as a bidirectional pipe: user keystrokes go from browser -> WebSocket -> container stdin, and container stdout -> WebSocket -> browser terminal emulator (xterm.js).`,
    approach: `**High-Level Architecture:**\n\nBrowser (Monaco Editor + xterm.js) <-> CDN/Static Assets\n        |                    |\n   REST API             WebSocket\n        |                    |\n   API Gateway ---------------------\n     |        |        |           |\n  Workspace  Container  Terminal   Auth\n  Service    Orchestrator Relay    Service\n     |           |          |\n  Object     Container    Container\n  Storage     Pool       (user code)\n  (S3)      Manager\n\n**Component Deep Dive:**\n\n1. **Editor Frontend (Monaco Editor)**\n   - Monaco Editor embedded in browser for code editing\n   - xterm.js for terminal emulation in browser\n   - File tree component communicates with Workspace Service REST API\n   - Language Server Protocol (LSP) client for autocomplete (connects to LSP server in container)\n   - Auto-save: debounced, saves after 2 seconds of inactivity via REST API\n   - Offline capability: cache files in IndexedDB, sync when reconnected\n\n2. **Container Orchestrator**\n   - Manages lifecycle of execution containers (create, start, stop, destroy)\n   - Uses Firecracker microVMs (200ms boot) or gVisor-sandboxed Docker containers\n   - Resource limits enforced via cgroups v2: CPU, memory, disk I/O, PID count\n   - Network isolation: containers can access the internet (for package installs) but not internal services\n   - Container reaping: idle containers stopped after 15 minutes, destroyed after 1 hour\n\n3. **Container Pool Manager**\n   - Maintains a pool of pre-warmed containers per language\n   - Pool size based on historical demand: JavaScript 2000, Python 1500, Java 500, etc.\n   - When pool drops below threshold, spin up new containers in background\n   - Health checking: periodically verify pooled containers are responsive\n   - Pool allocation strategy: FIFO (oldest warm container first)\n\n4. **Terminal Relay (WebSocket)**\n   - Maintains WebSocket connection to browser and PTY connection to container\n   - Bidirectional relay: keystrokes -> container stdin, container stdout -> browser\n   - Handles terminal resize events (SIGWINCH)\n   - Buffers output during reconnection; replays missed output on reconnect\n   - Rate limiting: max 1MB/sec output to prevent browser flooding\n\n5. **Workspace Storage**\n   - Files stored in object storage (S3) organized by workspace_id/file_path\n   - Metadata (file tree, permissions, last modified) in PostgreSQL\n   - On container assignment, workspace files are mounted/synced to container filesystem\n   - File versioning: keep last 50 versions of each file for undo history\n   - Fork operation: deep-copy workspace metadata + create symlinks to original files (copy-on-write)\n\n6. **Execution Engine**\n   - Receives execute command, routes to assigned container\n   - Wraps user command with resource limits and timeout\n   - Captures exit code, stdout, stderr, execution time, memory usage\n   - Kills process on timeout (default 30 seconds for free tier, 5 minutes for paid)\n   - Returns execution metadata alongside output\n\n**Data Flow - Code Execution:**\n1. User writes code in Monaco Editor in browser\n2. Auto-save sends file content to Workspace Service (REST PUT)\n3. User clicks "Run" -> POST /execute with command\n4. API routes to Container Orchestrator\n5. If no container assigned: grab one from warm pool, mount workspace files\n6. Execute command inside container with resource limits\n7. Container stdout/stderr streamed through Terminal Relay WebSocket to browser\n8. xterm.js renders output in browser terminal\n9. Exit code and execution stats returned via WebSocket`,
    code: `// Online Code Editor - Core Implementation
// CodeExecutor with limits, Container Pool Manager, WebSocket Relay, File Manager

class CodeExecutor {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 30000;
    this.maxMemoryMB = options.maxMemoryMB || 512;
    this.maxOutputBytes = options.maxOutputBytes || 5 * 1024 * 1024; // 5MB
    this.executions = new Map(); // execId -> execution state
    this.nextId = 1;
  }

  execute(containerId, command, stdin = "") {
    const execId = "exec_" + (this.nextId++);
    const execution = {
      id: execId, containerId, command, status: "running",
      stdout: "", stderr: "", exitCode: null,
      startTime: Date.now(), endTime: null,
      memoryUsedMB: 0, outputBytes: 0
    };
    this.executions.set(execId, execution);

    // Simulate async execution with resource tracking
    const timeoutHandle = setTimeout(() => {
      if (execution.status === "running") {
        execution.status = "timeout";
        execution.stderr += "\\nProcess killed: execution time limit exceeded (" +
          this.timeoutMs + "ms)";
        execution.endTime = Date.now();
      }
    }, this.timeoutMs);

    // In production, this would spawn a process inside the container
    // via Docker exec or Firecracker API
    execution._timeout = timeoutHandle;
    execution._resolve = null;
    execution.promise = new Promise(resolve => {
      execution._resolve = resolve;
    });

    return execution;
  }

  appendOutput(execId, stream, data) {
    const exec = this.executions.get(execId);
    if (!exec || exec.status !== "running") return false;
    exec.outputBytes += data.length;
    if (exec.outputBytes > this.maxOutputBytes) {
      exec.status = "output_limit";
      exec.stderr += "\\nOutput limit exceeded (" + this.maxOutputBytes + " bytes)";
      this.complete(execId, 1);
      return false;
    }
    if (stream === "stdout") exec.stdout += data;
    else exec.stderr += data;
    return true;
  }

  complete(execId, exitCode, memoryUsedMB = 0) {
    const exec = this.executions.get(execId);
    if (!exec) return null;
    if (exec.status === "running") exec.status = exitCode === 0 ? "success" : "error";
    exec.exitCode = exitCode;
    exec.endTime = Date.now();
    exec.memoryUsedMB = memoryUsedMB;
    clearTimeout(exec._timeout);
    if (exec._resolve) exec._resolve(exec);
    return {
      id: exec.id, status: exec.status, exitCode,
      durationMs: exec.endTime - exec.startTime,
      memoryUsedMB, outputBytes: exec.outputBytes
    };
  }

  getExecution(execId) {
    return this.executions.get(execId) || null;
  }
}

class ContainerPoolManager {
  constructor() {
    this.pools = new Map();         // language -> [container objects]
    this.assigned = new Map();      // sessionId -> container
    this.containerMeta = new Map(); // containerId -> metadata
    this.nextContainerId = 1;
    this.config = {
      javascript: { poolSize: 50, memoryMB: 256, cpuCores: 0.5, image: "node:18-alpine" },
      python:     { poolSize: 40, memoryMB: 512, cpuCores: 0.5, image: "python:3.11-slim" },
      java:       { poolSize: 20, memoryMB: 1024, cpuCores: 1.0, image: "openjdk:17-slim" },
      go:         { poolSize: 20, memoryMB: 512, cpuCores: 0.5, image: "golang:1.21-alpine" },
      rust:       { poolSize: 10, memoryMB: 1024, cpuCores: 1.0, image: "rust:1.70-slim" },
    };
  }

  initPool(language) {
    const cfg = this.config[language];
    if (!cfg) throw new Error("Unsupported language: " + language);
    if (!this.pools.has(language)) this.pools.set(language, []);
    const pool = this.pools.get(language);
    const toCreate = cfg.poolSize - pool.length;
    for (let i = 0; i < toCreate; i++) {
      const container = this._createContainer(language, cfg);
      pool.push(container);
    }
    return { language, poolSize: pool.length, ready: pool.filter(c => c.status === "warm").length };
  }

  _createContainer(language, cfg) {
    const id = "ctr_" + (this.nextContainerId++);
    const container = {
      id, language, status: "warm",
      image: cfg.image, memoryMB: cfg.memoryMB, cpuCores: cfg.cpuCores,
      createdAt: Date.now(), lastUsed: null, sessionId: null
    };
    this.containerMeta.set(id, container);
    return container;
  }

  acquireContainer(sessionId, language) {
    const pool = this.pools.get(language);
    if (!pool || pool.length === 0) {
      // Cold start: create a new container on demand
      const cfg = this.config[language];
      if (!cfg) return null;
      const container = this._createContainer(language, cfg);
      container.status = "assigned";
      container.sessionId = sessionId;
      container.lastUsed = Date.now();
      this.assigned.set(sessionId, container);
      // Trigger pool replenishment in background
      this._replenishPool(language);
      return container;
    }
    // Take from warm pool (FIFO: oldest first)
    const container = pool.shift();
    container.status = "assigned";
    container.sessionId = sessionId;
    container.lastUsed = Date.now();
    this.assigned.set(sessionId, container);
    // Replenish if pool is below 20%
    if (pool.length < (this.config[language].poolSize * 0.2)) {
      this._replenishPool(language);
    }
    return container;
  }

  releaseContainer(sessionId) {
    const container = this.assigned.get(sessionId);
    if (!container) return false;
    this.assigned.delete(sessionId);
    // Reset container state for reuse
    container.status = "warm";
    container.sessionId = null;
    container.lastUsed = Date.now();
    const pool = this.pools.get(container.language);
    if (pool && pool.length < this.config[container.language].poolSize) {
      pool.push(container); // return to pool
    } else {
      container.status = "destroyed";
      this.containerMeta.delete(container.id);
    }
    return true;
  }

  _replenishPool(language) {
    const pool = this.pools.get(language);
    const cfg = this.config[language];
    const needed = cfg.poolSize - pool.length;
    for (let i = 0; i < needed; i++) {
      pool.push(this._createContainer(language, cfg));
    }
  }

  getPoolStats() {
    const stats = {};
    for (const [lang, pool] of this.pools) {
      stats[lang] = {
        warm: pool.filter(c => c.status === "warm").length,
        total: pool.length,
        assigned: Array.from(this.assigned.values()).filter(c => c.language === lang).length,
        targetPoolSize: this.config[lang].poolSize
      };
    }
    return stats;
  }

  reapIdleContainers(maxIdleMs = 900000) {
    const now = Date.now();
    let reaped = 0;
    for (const [sessionId, container] of this.assigned) {
      if (container.lastUsed && (now - container.lastUsed) > maxIdleMs) {
        this.releaseContainer(sessionId);
        reaped++;
      }
    }
    return reaped;
  }
}`,
    jsCode: `// Online Code Editor: WebSocket Terminal Relay + Workspace File Manager

class TerminalRelay {
  constructor() {
    this.sessions = new Map();  // sessionId -> session state
    this.outputBuffer = new Map(); // sessionId -> buffered output during disconnect
    this.maxBufferSize = 100000; // max chars to buffer during disconnect
  }

  createSession(sessionId, containerId) {
    const session = {
      sessionId, containerId,
      connected: false,
      ws: null,          // WebSocket connection to browser
      pty: null,          // PTY connection to container
      rows: 24, cols: 80,
      outputHistory: "",  // ring buffer of recent output for reconnection
      historyLimit: 50000,
      createdAt: Date.now()
    };
    this.sessions.set(sessionId, session);
    this.outputBuffer.set(sessionId, []);
    return session;
  }

  connectClient(sessionId, wsConnection) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.ws = wsConnection;
    session.connected = true;

    // Replay buffered output from disconnection period
    const buffer = this.outputBuffer.get(sessionId) || [];
    if (buffer.length > 0) {
      const missed = buffer.join("");
      this._sendToClient(session, { type: "output", data: missed, replay: true });
      this.outputBuffer.set(sessionId, []);
    }

    // Set up message handlers
    wsConnection.onMessage = (msg) => this._handleClientMessage(sessionId, msg);
    wsConnection.onClose = () => this._handleClientDisconnect(sessionId);
    return true;
  }

  _handleClientMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (message.type === "input") {
      // Forward keystroke to container PTY
      this._sendToContainer(session, message.data);
    } else if (message.type === "resize") {
      session.rows = message.rows;
      session.cols = message.cols;
      // Send SIGWINCH to container PTY
      this._resizeContainerPTY(session, message.rows, message.cols);
    }
  }

  handleContainerOutput(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Append to output history (ring buffer)
    session.outputHistory += data;
    if (session.outputHistory.length > session.historyLimit) {
      session.outputHistory = session.outputHistory.slice(-session.historyLimit);
    }

    if (session.connected && session.ws) {
      this._sendToClient(session, { type: "output", data: data });
    } else {
      // Buffer output for replay when client reconnects
      const buffer = this.outputBuffer.get(sessionId) || [];
      buffer.push(data);
      // Trim buffer if too large
      let totalLen = buffer.reduce((s, b) => s + b.length, 0);
      while (totalLen > this.maxBufferSize && buffer.length > 0) {
        totalLen -= buffer.shift().length;
      }
      this.outputBuffer.set(sessionId, buffer);
    }
  }

  _handleClientDisconnect(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.connected = false;
      session.ws = null;
      // Container keeps running; output is buffered
    }
  }

  _sendToClient(session, message) {
    if (session.ws && session.connected) {
      session.ws.send(JSON.stringify(message));
    }
  }

  _sendToContainer(session, input) {
    // In production: write to container's stdin via Docker exec stream or Firecracker vsock
    if (session.pty) session.pty.write(input);
  }

  _resizeContainerPTY(session, rows, cols) {
    if (session.pty) session.pty.resize(cols, rows);
  }

  destroySession(sessionId) {
    this.sessions.delete(sessionId);
    this.outputBuffer.delete(sessionId);
  }
}

class WorkspaceFileManager {
  constructor() {
    this.workspaces = new Map();   // workspaceId -> { files, metadata }
    this.versions = new Map();     // workspaceId:path -> [versions]
    this.maxVersions = 50;
  }

  createWorkspace(workspaceId, ownerId, language, template = "blank") {
    const workspace = {
      id: workspaceId, ownerId, language,
      files: new Map(), // path -> { content, size, lastModified, version }
      metadata: { createdAt: Date.now(), name: "Untitled", isPublic: false }
    };
    // Initialize with template files
    const templates = this._getTemplate(language, template);
    for (const [path, content] of Object.entries(templates)) {
      this._writeFile(workspace, path, content);
    }
    this.workspaces.set(workspaceId, workspace);
    return { id: workspaceId, files: this.listFiles(workspaceId) };
  }

  _getTemplate(language, template) {
    const templates = {
      javascript: {
        blank: { "index.js": "// Start coding here\\nconsole.log('Hello, World!');\\n",
                 "package.json": JSON.stringify({ name: "project", version: "1.0.0", main: "index.js" }, null, 2) },
        react: { "index.js": "import React from 'react';\\n// React app\\n",
                 "package.json": JSON.stringify({ name: "react-app", dependencies: { react: "^18.0.0" } }, null, 2) }
      },
      python: {
        blank: { "main.py": "# Start coding here\\nprint('Hello, World!')\\n",
                 "requirements.txt": "" },
        flask: { "app.py": "from flask import Flask\\napp = Flask(__name__)\\n",
                 "requirements.txt": "flask>=2.0\\n" }
      }
    };
    const langTemplates = templates[language] || templates.javascript;
    return langTemplates[template] || langTemplates.blank;
  }

  _writeFile(workspace, path, content) {
    const existing = workspace.files.get(path);
    const version = existing ? existing.version + 1 : 1;
    workspace.files.set(path, {
      content, size: content.length,
      lastModified: Date.now(), version
    });
    // Store version history
    const vKey = workspace.id + ":" + path;
    if (!this.versions.has(vKey)) this.versions.set(vKey, []);
    const vHistory = this.versions.get(vKey);
    vHistory.push({ version, content, timestamp: Date.now() });
    if (vHistory.length > this.maxVersions) vHistory.shift();
    return version;
  }

  readFile(workspaceId, path) {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return null;
    const file = ws.files.get(path);
    return file ? { path, ...file } : null;
  }

  writeFile(workspaceId, path, content) {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return null;
    const version = this._writeFile(ws, path, content);
    return { path, version, size: content.length };
  }

  deleteFile(workspaceId, path) {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return false;
    return ws.files.delete(path);
  }

  listFiles(workspaceId) {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) return [];
    return Array.from(ws.files.entries()).map(([path, file]) => ({
      path, size: file.size, lastModified: file.lastModified, version: file.version
    }));
  }

  forkWorkspace(sourceId, newId, newOwnerId) {
    const source = this.workspaces.get(sourceId);
    if (!source) return null;
    const forked = {
      id: newId, ownerId: newOwnerId, language: source.language,
      files: new Map(source.files), // shallow copy (copy-on-write in production)
      metadata: { ...source.metadata, createdAt: Date.now(), forkedFrom: sourceId }
    };
    this.workspaces.set(newId, forked);
    return { id: newId, files: this.listFiles(newId), forkedFrom: sourceId };
  }

  getFileVersions(workspaceId, path) {
    const vKey = workspaceId + ":" + path;
    return (this.versions.get(vKey) || []).map(v => ({
      version: v.version, timestamp: v.timestamp, size: v.content.length
    }));
  }

  restoreVersion(workspaceId, path, version) {
    const vKey = workspaceId + ":" + path;
    const history = this.versions.get(vKey) || [];
    const target = history.find(v => v.version === version);
    if (!target) return null;
    return this.writeFile(workspaceId, path, target.content);
  }
}`,
    explanation: `**Scaling Analysis:**\n\n1. **Container Management at Scale**: With 100K concurrent sessions, the container pool needs careful sizing. Only ~10% execute at any moment (10K containers). Using Firecracker microVMs (boot in 125ms, 5MB memory overhead per VM), you can pack ~200 VMs per server (256GB RAM, 64 cores). So 10K active containers need ~50 servers. The warm pool adds ~5K pre-allocated containers = 25 more servers. Total: ~75 execution servers.\n\n2. **WebSocket Scaling**: 100K persistent WebSocket connections. Each connection uses ~10KB of memory. Total: 1GB, easily handled by 5-10 WebSocket servers with 20K connections each. Use sticky sessions (hash sessionId to server) so reconnections go to the same server that has the output buffer.\n\n3. **File Storage**: 200K saves/minute = 3.3K writes/sec to object storage. S3 handles this trivially. For hot path (auto-save), write to a local cache first, then batch-flush to S3 every 5 seconds. This reduces S3 writes to ~600/sec.\n\n4. **Cold Start Optimization**: Pre-warm containers for the top 5 languages cover 90% of sessions. For rare languages, accept 5-second cold start. Use container snapshots (Firecracker snapshot/restore) to reduce cold start to <1 second: snapshot a container after language runtime is initialized, then restore from snapshot for each new session.\n\n**Failure Modes:**\n- Container crash during execution: detect via health check failure; restart container, remount workspace, notify user. Output up to crash point is preserved in terminal buffer.\n- WebSocket server crash: clients reconnect automatically; output buffer for disconnection period is lost. Mitigation: replicate output buffer to Redis.\n- Storage service unavailable: editor continues working locally (IndexedDB), files sync when storage returns. Risk: user closes browser tab and loses unsaved changes. Mitigation: periodic localStorage backup.\n- Fork bomb / infinite loop in user code: cgroups PID limit (max 128 processes) prevents fork bombs. CPU time limit (30 sec) kills infinite loops. Memory limit (512MB) triggers OOM killer for memory leaks.\n\n**Bottleneck Identification:**\n- Container cold start is the primary UX bottleneck. Warm pool and Firecracker snapshots are essential. Monitor: pool utilization, cold start rate, P95 startup latency.\n- File sync latency: if auto-save is slow, users lose work. Monitor: save latency P99, save failure rate.\n- WebSocket output throughput: a user running "cat /dev/urandom" can generate output at disk speed. Rate limit to 1MB/sec per session.\n\n**Trade-offs:**\n- Docker containers vs. Firecracker microVMs: Docker is simpler and has a larger ecosystem, but provides weaker isolation (shared kernel). Firecracker provides VM-level isolation with near-container performance but requires more operational expertise.\n- Persistent containers vs. ephemeral: Persistent containers (stay alive between sessions) give instant startup but consume resources even when idle. Ephemeral containers (destroyed after each session) save resources but require workspace remount on every session.\n- Monaco Editor vs. CodeMirror: Monaco is more full-featured (VS Code parity) but heavier (~5MB JavaScript bundle). CodeMirror is lighter (~500KB) and more customizable but has fewer built-in features.\n\n**Monitoring:**\n- Container pool utilization per language (target: 60-80% warm pool used)\n- P50/P95 container startup latency (target: <500ms warm, <3s cold)\n- Execution timeout rate (target: <5%, indicates users need higher limits)\n- WebSocket reconnection rate (target: <2%, indicates network instability)\n- File save success rate (target: >99.9%)\n- Memory utilization per container (alert at >80% of limit)`,
    timeComplexity: `Container acquisition from warm pool: O(1) (pop from queue). File read/write: O(1) hash lookup + O(content_size) for storage. WebSocket relay: O(1) per message, constant overhead per keystroke. Container cold start: O(1) but with high constant factor (~2-5 seconds). Pool replenishment: O(k) where k is containers to create, runs asynchronously. File version lookup: O(versions) = O(50) bounded.`,
    spaceComplexity: `Container memory: 10K active x 512MB avg = 5 TB RAM across execution servers. Warm pool: 5K containers x 256MB avg = 1.28 TB. WebSocket state: 100K sessions x 60KB (session + buffer) = 6 GB. Workspace storage: 1M users x 100MB avg = 100 TB on S3 (with deduplication: ~40 TB). Version history: 1M users x 10 files x 50 versions x 5KB avg = 2.5 TB. Container images: 20 languages x 2GB = 40GB base (cached on each execution server).`,
    hints: [
      `Container pre-warming is the single most impactful optimization. Maintain a warm pool sized at 20% above peak concurrent executions per language. Monitor pool drain rate and auto-scale pool size. Use Firecracker snapshot/restore for sub-second "cold" starts: snapshot a container after runtime initialization, restore from snapshot for each new session.`,
      `Use Firecracker microVMs instead of Docker containers for production workloads. Firecracker boots in 125ms, provides hardware-level isolation (separate kernel per VM), and uses only 5MB of overhead per VM. This is what AWS Lambda and Replit use in production. Docker is acceptable for development/hobby tiers.`,
      `Security defense in depth is critical since you are running untrusted code. Layer 1: Firecracker/gVisor for kernel isolation. Layer 2: seccomp profile blocking dangerous syscalls (ptrace, mount, etc.). Layer 3: cgroups v2 for resource limits (CPU, memory, PID, disk I/O). Layer 4: network policy (allow outbound HTTP/HTTPS, block everything else). Layer 5: execution timeout.`,
      `The WebSocket terminal relay must handle disconnection gracefully. Buffer container output during disconnection (up to 100KB). On reconnect, replay the buffer so the user sees what happened while disconnected. If the buffer overflows, send a "[output truncated]" marker. Persist the buffer to Redis for cross-server reconnection.`,
      `File auto-save should be debounced (2-second delay after last keystroke) and batched (multiple files saved in one request). Use ETags or version numbers for optimistic concurrency: if two browser tabs edit the same file, the second save detects a version conflict and prompts the user to merge or overwrite.`,
      `For package management (npm install, pip install), do NOT run in the user's execution container synchronously. Instead, use a dedicated build container that installs packages, creates a layer/snapshot, and then the execution container loads from that snapshot. This prevents package installation from consuming the user's CPU/memory limits.`,
      `Implement workspace forking as copy-on-write. When a user forks a project, copy only the metadata (file tree, file pointers). The actual file contents point to the original workspace's storage. Only when the forking user modifies a file is it copied to their own storage. This makes fork nearly instant and saves storage.`,
      `Monitor and alert on "container escape" signals: containers making unexpected network connections to internal services, unexpected syscall patterns, or CPU usage that exceeds cgroup limits (should be impossible, but monitor anyway). Have an incident response plan for potential sandbox escapes.`
    ]
  },
  {
    id: 9024,
    description: `Design a Real-Time Collaborative Editor (Google Docs)\n\n**Functional Requirements:**\n- Multiple users (up to 100 per document) edit the same document simultaneously\n- All users converge to the same document state regardless of edit order or network delays\n- Support rich text formatting (bold, italic, headers, lists, links)\n- Show real-time cursor positions and selections of all collaborators\n- Track full revision history with ability to view/restore any past version\n- Support comments and suggestions (tracked changes)\n- Offline editing with automatic sync and conflict resolution on reconnect\n\n**Non-Functional Requirements:**\n- Perceived edit latency: <100ms (optimistic local apply)\n- Convergence guarantee: all clients reach identical state within 2 seconds\n- Support documents up to 10MB of text (roughly 2 million words)\n- 99.99% availability for document reads, 99.9% for real-time collaboration\n- Support 50M concurrent documents with at least 1 active editor\n- Handle network partitions gracefully (offline mode)\n\n**Capacity Estimation:**\n- 50M active documents, 200M total users\n- Average document: 50KB text, 500 operations/hour during active editing\n- Peak operations: 50M docs x 10% active x 500 ops/hr / 3600 = 694K operations/sec\n- Operation size: ~100 bytes (type + position + content + metadata)\n- Operation throughput: 694K x 100 bytes = 69.4 MB/sec\n- Document snapshots: 50M x 50KB = 2.5 TB\n- Operation logs: 694K ops/sec x 86400 sec x 100 bytes = 6 TB/day`,
    examples: `**Exercise 1: Operational Transformation Walkthrough**\nUser A and User B both start with document "ABCD". User A inserts "X" at position 1 (intent: "AXBCD"). User B deletes character at position 2 (intent: "ABD"). Without OT, applying A's op then B's op gives "AXBD" (B deletes pos 2 which is now "B", wrong). With OT: transform B's delete against A's insert. Since A inserted before B's position, B's position shifts right: delete(pos=3). Result: "AXBD" -> actually we need "AXBD". Let's trace carefully:\n- Server receives A's insert(1,"X") first, applies it: "AXBCD"\n- Server transforms B's delete(2) against A's insert(1,"X"): since 1 <= 2, shift right -> delete(3)\n- Server applies transformed delete(3): "AXBD"\n- B receives A's insert(1,"X"), transforms own pending: already handled\n- Both converge to "AXBD" which preserves both intents: X inserted after A, and C deleted\n\n**Exercise 2: API and WebSocket Protocol Design**\n\`\`\`\n// REST endpoints\nPOST /v1/documents { title, content } -> { doc_id, version: 0 }\nGET /v1/documents/{id}?version=latest -> { doc_id, content, version, collaborators }\nGET /v1/documents/{id}/history?from=0&to=100 -> { operations: [...] }\nPOST /v1/documents/{id}/snapshots -> { snapshot_id, version }\n\n// WebSocket protocol\nClient -> Server: { type: "operation", doc_id, client_version, ops: [{type: "insert", pos: 5, text: "hello"}] }\nServer -> Client: { type: "ack", server_version: 42 }  // your op was accepted\nServer -> Others: { type: "remote_op", server_version: 42, user_id, ops: [...] }  // transformed op\nClient -> Server: { type: "cursor", doc_id, position: 15, selection: { anchor: 10, head: 15 } }\nServer -> Others: { type: "presence", user_id, name, color, cursor: {...} }\n\`\`\`\n\n**Exercise 3: Convergence Proof Sketch**\nOT guarantees convergence via the transformation property: for any two concurrent operations a and b, applying a then transform(b, a) produces the same state as applying b then transform(a, b). This is called TP1 (Transformation Property 1). The server enforces a total order on operations. Each client transforms incoming remote operations against any local pending operations. Since all clients see the same total order from the server, they all converge to the same state.`,
    intuition: `Think of a collaborative editor as a **version control system operating in real time**. Each keystroke is a "commit" that must be merged with concurrent "commits" from other users. The challenge Git solves with manual merge conflicts, a collaborative editor must solve automatically and instantly.\n\nThe key insight is **Operational Transformation (OT)**: instead of sending document snapshots back and forth (expensive and lossy), send lightweight operations (insert "X" at position 5, delete 3 characters at position 10). When two users edit concurrently, their operations are **transformed** against each other so that both can be applied and the document converges to a consistent state.\n\nThe mental model: imagine two people editing a printed page with scissors and glue simultaneously. If person A inserts a paragraph at the top, all of person B's position references below that point shift down. OT is the algorithm that automatically adjusts those position references.\n\nThe architecture follows a **client-server model with optimistic local apply**:\n1. User types a character -> immediately applied to local document (feels instant)\n2. Operation sent to server -> server assigns a global sequence number\n3. Server transforms the operation against any concurrent operations it received\n4. Server broadcasts the transformed operation to all other clients\n5. Other clients transform the remote operation against their local pending operations and apply\n\nThe alternative to OT is **CRDTs (Conflict-free Replicated Data Types)**, which assign a unique ID to every character and use those IDs (not positions) to determine ordering. CRDTs are simpler to reason about (no transformation logic) and naturally support peer-to-peer, but they use more memory (each character carries metadata) and are harder to implement efficiently for rich text.\n\nGoogle Docs uses OT. Figma uses CRDTs. Both work; the trade-off is complexity vs. memory overhead.`,
    approach: `**High-Level Architecture:**\n\nBrowser (Editor + OT Client) <-> WebSocket <-> Collaboration Server <-> Document Store\n                                                    |-> Presence Service\n                                                    |-> History/Snapshot Service\n\n**Component Deep Dive:**\n\n1. **Client Editor (Optimistic Local Apply)**\n   - Uses a rich text editor (ProseMirror, Quill, or Slate.js) for rendering\n   - OT client maintains three states:\n     a. "synced" - the last state confirmed by server\n     b. "pending" - operations sent to server but not yet acknowledged\n     c. "buffer" - operations made locally but not yet sent\n   - On local edit: apply to document immediately, add to buffer\n   - On server ack: move pending ops to synced; send buffer as new pending\n   - On remote op: transform against pending + buffer, apply to document\n\n2. **Collaboration Server (Operation Serialization)**\n   - Each document has a single "owner" server (sharded by doc_id)\n   - Maintains the authoritative operation log (append-only)\n   - Receives operations from clients, validates, transforms, assigns version number\n   - Broadcasts transformed operations to all connected clients\n   - Transformation: when a client sends op based on version N, but server is at version M > N, transform op against operations N+1 through M\n   - Uses a lock-free single-writer model: one goroutine per document processes ops sequentially\n\n3. **OT Engine (Transformation Functions)**\n   - Core operations: insert(position, text), delete(position, count), retain(count)\n   - Transform function: given two concurrent ops (a, b), produce (a', b') such that:\n     apply(apply(doc, a), b') = apply(apply(doc, b), a')\n   - Insert vs Insert: if same position, break tie by user_id (lower ID goes first)\n   - Insert vs Delete: if insert position <= delete position, shift delete right by insert length\n   - Delete vs Insert: if delete position < insert position, shift insert left by delete length\n   - Compose function: merge consecutive operations into one for efficiency\n\n4. **Document Store**\n   - Operation log: append-only log of all operations per document (stored in Kafka or a log-structured DB)\n   - Snapshots: periodic full document state captured every 1000 operations\n   - To reconstruct document at version V: find nearest snapshot before V, replay operations from snapshot version to V\n   - Storage: snapshots in S3, recent operation log in Redis (last 10K ops), full log in Kafka/DynamoDB\n\n5. **Presence Service (Cursor Tracking)**\n   - Tracks each user's cursor position, selection range, and display name/color\n   - Cursor positions are transformed along with document operations (if user A inserts text before user B's cursor, B's cursor shifts right)\n   - Broadcasts presence updates to all collaborators every 50ms (throttled)\n   - Heartbeat-based: if no update for 30 seconds, mark user as inactive\n\n6. **Snapshot and History Service**\n   - Takes snapshots every N operations or T minutes\n   - Supports "view revision history" by replaying operations from snapshots\n   - Named versions (user-created checkpoints) stored as snapshot + metadata\n   - Compact old operation logs: operations older than 90 days are discarded, only snapshots remain\n\n7. **Offline Support**\n   - Client stores document state and pending operations in IndexedDB\n   - On reconnect: client sends its base version + all pending operations\n   - Server transforms pending ops against all ops that happened while client was offline\n   - If offline for >24 hours, fall back to diff-based merge (compare offline doc with current server doc)\n\n**Data Flow - Concurrent Edit:**\n1. User A types "hello" at position 10 (doc version 50)\n2. Client A applies locally, sends insert(10, "hello", v:50) to server\n3. Meanwhile, User B deletes 3 chars at position 5 (doc version 50)\n4. Client B applies locally, sends delete(5, 3, v:50) to server\n5. Server receives A's op first, applies to doc (now v:51)\n6. Server receives B's op (base v:50, but server is at v:51)\n7. Server transforms B's delete(5,3) against A's insert(10,"hello"):\n   Since delete position 5 < insert position 10, no shift needed -> delete(5,3) unchanged\n8. Server applies transformed B's op (now v:52)\n9. Server sends A's op to client B; B transforms against own pending ops\n10. Server sends transformed B's op to client A; A transforms against own pending\n11. Both clients converge to same document state`,
    code: `// Real-Time Collaborative Editor - Core OT Implementation
// Operational Transformation engine with insert/delete, server, document model

// Operation types: insert text at position, delete count chars at position
class Operation {
  constructor(ops = []) {
    // ops: array of { type: "insert"|"delete"|"retain", pos, text, count }
    this.ops = ops;
    this.baseVersion = 0;
    this.userId = null;
    this.timestamp = Date.now();
  }

  static insert(pos, text, userId) {
    const op = new Operation([{ type: "insert", pos, text }]);
    op.userId = userId;
    return op;
  }

  static delete(pos, count, userId) {
    const op = new Operation([{ type: "delete", pos, count }]);
    op.userId = userId;
    return op;
  }
}

// OT Transform: given two concurrent ops, adjust positions so both can apply
function transformOp(opA, opB) {
  // Returns [transformedA, transformedB]
  // After applying opA then transformedB, result equals applying opB then transformedA
  const a = opA.ops[0];
  const b = opB.ops[0];
  if (!a || !b) return [opA, opB];

  let newA = { ...a };
  let newB = { ...b };

  if (a.type === "insert" && b.type === "insert") {
    if (a.pos < b.pos || (a.pos === b.pos && (opA.userId || "") < (opB.userId || ""))) {
      newB = { ...b, pos: b.pos + a.text.length };
    } else {
      newA = { ...a, pos: a.pos + b.text.length };
    }
  } else if (a.type === "insert" && b.type === "delete") {
    if (a.pos <= b.pos) {
      newB = { ...b, pos: b.pos + a.text.length };
    } else if (a.pos >= b.pos + b.count) {
      newA = { ...a, pos: a.pos - b.count };
    } else {
      // Insert inside deleted range: adjust insert to start of delete
      newA = { ...a, pos: b.pos };
    }
  } else if (a.type === "delete" && b.type === "insert") {
    if (b.pos <= a.pos) {
      newA = { ...a, pos: a.pos + b.text.length };
    } else if (b.pos >= a.pos + a.count) {
      newB = { ...b, pos: b.pos - a.count };
    } else {
      newB = { ...b, pos: a.pos };
    }
  } else if (a.type === "delete" && b.type === "delete") {
    if (a.pos >= b.pos + b.count) {
      newA = { ...a, pos: a.pos - b.count };
    } else if (b.pos >= a.pos + a.count) {
      newB = { ...b, pos: b.pos - a.count };
    } else {
      // Overlapping deletes: compute non-overlapping portions
      const overlapStart = Math.max(a.pos, b.pos);
      const overlapEnd = Math.min(a.pos + a.count, b.pos + b.count);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      newA = { ...a, pos: Math.min(a.pos, b.pos), count: a.count - overlap };
      newB = { ...b, pos: Math.min(a.pos, b.pos), count: b.count - overlap };
    }
  }

  const tA = new Operation([newA]);
  tA.userId = opA.userId;
  tA.baseVersion = opA.baseVersion;
  const tB = new Operation([newB]);
  tB.userId = opB.userId;
  tB.baseVersion = opB.baseVersion;
  return [tA, tB];
}

// Collaboration Server: manages operation ordering and broadcast
class CollaborationServer {
  constructor() {
    this.documents = new Map(); // docId -> { content, version, opLog, clients }
  }

  createDocument(docId, initialContent = "") {
    this.documents.set(docId, {
      content: initialContent,
      version: 0,
      opLog: [],        // all operations in server order
      clients: new Map(), // clientId -> { sendFn, pendingAck }
      snapshots: [{ version: 0, content: initialContent, timestamp: Date.now() }]
    });
  }

  joinDocument(docId, clientId, sendFn) {
    const doc = this.documents.get(docId);
    if (!doc) return null;
    doc.clients.set(clientId, { sendFn, lastVersion: doc.version });
    return { content: doc.content, version: doc.version };
  }

  leaveDocument(docId, clientId) {
    const doc = this.documents.get(docId);
    if (doc) doc.clients.delete(clientId);
  }

  receiveOperation(docId, clientId, operation) {
    const doc = this.documents.get(docId);
    if (!doc) return null;

    // Transform against all ops since client's base version
    let transformedOp = operation;
    for (let i = operation.baseVersion; i < doc.version; i++) {
      const serverOp = doc.opLog[i];
      const [, newClient] = transformOp(serverOp, transformedOp);
      transformedOp = newClient;
    }

    // Apply transformed operation to server document
    doc.content = this._applyOp(doc.content, transformedOp);
    transformedOp.baseVersion = doc.version;
    doc.opLog.push(transformedOp);
    doc.version++;

    // Snapshot every 1000 operations
    if (doc.version % 1000 === 0) {
      doc.snapshots.push({
        version: doc.version, content: doc.content, timestamp: Date.now()
      });
    }

    // ACK the sender
    const sender = doc.clients.get(clientId);
    if (sender) {
      sender.sendFn({ type: "ack", version: doc.version });
      sender.lastVersion = doc.version;
    }

    // Broadcast to all other clients
    for (const [cid, client] of doc.clients) {
      if (cid !== clientId) {
        client.sendFn({
          type: "remote_op", version: doc.version,
          userId: clientId, ops: transformedOp.ops
        });
        client.lastVersion = doc.version;
      }
    }

    return { version: doc.version, transformedOps: transformedOp.ops };
  }

  _applyOp(content, operation) {
    for (const op of operation.ops) {
      if (op.type === "insert") {
        content = content.slice(0, op.pos) + op.text + content.slice(op.pos);
      } else if (op.type === "delete") {
        content = content.slice(0, op.pos) + content.slice(op.pos + op.count);
      }
    }
    return content;
  }

  getHistory(docId, fromVersion, toVersion) {
    const doc = this.documents.get(docId);
    if (!doc) return [];
    return doc.opLog.slice(fromVersion, toVersion).map((op, i) => ({
      version: fromVersion + i + 1, ops: op.ops,
      userId: op.userId, timestamp: op.timestamp
    }));
  }

  getDocumentAtVersion(docId, targetVersion) {
    const doc = this.documents.get(docId);
    if (!doc) return null;
    // Find nearest snapshot before target
    let snapshot = doc.snapshots[0];
    for (const s of doc.snapshots) {
      if (s.version <= targetVersion) snapshot = s;
      else break;
    }
    // Replay operations from snapshot to target
    let content = snapshot.content;
    for (let i = snapshot.version; i < targetVersion; i++) {
      content = this._applyOp(content, doc.opLog[i]);
    }
    return { content, version: targetVersion };
  }
}`,
    jsCode: `// Collaborative Editor: OT Client + Cursor Presence Tracker

// Client-side OT state machine
class OTClient {
  constructor(clientId, sendToServer) {
    this.clientId = clientId;
    this.sendToServer = sendToServer; // function to send ops to server
    this.document = "";
    this.serverVersion = 0;
    this.state = "synchronized"; // synchronized | awaiting_ack | awaiting_ack_with_buffer
    this.pending = null;  // op sent to server, awaiting ack
    this.buffer = null;   // ops made while awaiting ack
  }

  // User makes a local edit
  applyLocal(operation) {
    // Immediately apply to local document
    this.document = this._apply(this.document, operation);

    if (this.state === "synchronized") {
      // Send directly to server
      this.state = "awaiting_ack";
      this.pending = operation;
      operation.baseVersion = this.serverVersion;
      this.sendToServer(operation);
    } else if (this.state === "awaiting_ack") {
      // Buffer this operation
      this.state = "awaiting_ack_with_buffer";
      this.buffer = operation;
    } else if (this.state === "awaiting_ack_with_buffer") {
      // Compose with existing buffer
      this.buffer = this._compose(this.buffer, operation);
    }
  }

  // Server acknowledged our pending operation
  handleAck(serverVersion) {
    this.serverVersion = serverVersion;

    if (this.state === "awaiting_ack") {
      this.state = "synchronized";
      this.pending = null;
    } else if (this.state === "awaiting_ack_with_buffer") {
      // Send buffer as next pending
      this.state = "awaiting_ack";
      this.pending = this.buffer;
      this.buffer = null;
      this.pending.baseVersion = this.serverVersion;
      this.sendToServer(this.pending);
    }
  }

  // Received a remote operation from server
  handleRemoteOp(remoteOp) {
    this.serverVersion++;

    if (this.state === "synchronized") {
      // Apply directly
      this.document = this._apply(this.document, remoteOp);
    } else if (this.state === "awaiting_ack") {
      // Transform remote against pending
      const [newPending, transformedRemote] = transformOp(this.pending, remoteOp);
      this.pending = newPending;
      this.document = this._apply(this.document, transformedRemote);
    } else if (this.state === "awaiting_ack_with_buffer") {
      // Transform remote against pending, then against buffer
      const [newPending, temp] = transformOp(this.pending, remoteOp);
      this.pending = newPending;
      const [newBuffer, transformedRemote] = transformOp(this.buffer, temp);
      this.buffer = newBuffer;
      this.document = this._apply(this.document, transformedRemote);
    }
  }

  _apply(doc, operation) {
    if (!operation || !operation.ops) return doc;
    for (const op of operation.ops) {
      if (op.type === "insert") {
        doc = doc.slice(0, op.pos) + op.text + doc.slice(op.pos);
      } else if (op.type === "delete") {
        doc = doc.slice(0, op.pos) + doc.slice(op.pos + op.count);
      }
    }
    return doc;
  }

  _compose(opA, opB) {
    // Simplified: chain operations together
    const composed = new Operation([...opA.ops, ...opB.ops]);
    composed.userId = this.clientId;
    return composed;
  }
}

// Cursor presence tracker - shows where each collaborator's cursor is
class CursorPresenceTracker {
  constructor() {
    this.cursors = new Map(); // userId -> { position, selection, name, color, lastUpdate }
    this.colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F1948A", "#82E0AA"
    ];
    this.nextColorIdx = 0;
    this.heartbeatTimeout = 30000; // 30 seconds
  }

  addUser(userId, name) {
    const color = this.colors[this.nextColorIdx % this.colors.length];
    this.nextColorIdx++;
    this.cursors.set(userId, {
      position: 0, selection: null, name, color,
      lastUpdate: Date.now(), isActive: true
    });
    return color;
  }

  removeUser(userId) {
    this.cursors.delete(userId);
  }

  updateCursor(userId, position, selection = null) {
    const cursor = this.cursors.get(userId);
    if (cursor) {
      cursor.position = position;
      cursor.selection = selection;
      cursor.lastUpdate = Date.now();
      cursor.isActive = true;
    }
  }

  // Transform all cursor positions when an operation is applied
  transformCursors(operation, excludeUserId) {
    for (const [userId, cursor] of this.cursors) {
      if (userId === excludeUserId) continue;
      for (const op of operation.ops || []) {
        if (op.type === "insert") {
          if (cursor.position >= op.pos) {
            cursor.position += op.text.length;
          }
          if (cursor.selection) {
            if (cursor.selection.anchor >= op.pos) cursor.selection.anchor += op.text.length;
            if (cursor.selection.head >= op.pos) cursor.selection.head += op.text.length;
          }
        } else if (op.type === "delete") {
          if (cursor.position >= op.pos + op.count) {
            cursor.position -= op.count;
          } else if (cursor.position > op.pos) {
            cursor.position = op.pos;
          }
          if (cursor.selection) {
            const adjustPos = (p) => {
              if (p >= op.pos + op.count) return p - op.count;
              if (p > op.pos) return op.pos;
              return p;
            };
            cursor.selection.anchor = adjustPos(cursor.selection.anchor);
            cursor.selection.head = adjustPos(cursor.selection.head);
          }
        }
      }
    }
  }

  getActiveCursors() {
    const now = Date.now();
    const active = [];
    for (const [userId, cursor] of this.cursors) {
      if (now - cursor.lastUpdate > this.heartbeatTimeout) {
        cursor.isActive = false;
      }
      if (cursor.isActive) {
        active.push({ userId, ...cursor });
      }
    }
    return active;
  }

  // Serialize cursor state for broadcast
  getCursorBroadcast() {
    return this.getActiveCursors().map(c => ({
      userId: c.userId,
      name: c.name,
      color: c.color,
      position: c.position,
      selection: c.selection
    }));
  }
}

// Document with operation log and snapshot compaction
class CollaborativeDocument {
  constructor(docId, content = "") {
    this.docId = docId;
    this.content = content;
    this.version = 0;
    this.opLog = [];
    this.snapshots = [{ version: 0, content, ts: Date.now() }];
    this.snapshotInterval = 500;
    this.presence = new CursorPresenceTracker();
  }

  applyOperation(op) {
    for (const o of op.ops) {
      if (o.type === "insert") {
        this.content = this.content.slice(0, o.pos) + o.text + this.content.slice(o.pos);
      } else if (o.type === "delete") {
        this.content = this.content.slice(0, o.pos) + this.content.slice(o.pos + o.count);
      }
    }
    this.opLog.push({ ...op, appliedAt: this.version });
    this.version++;
    this.presence.transformCursors(op, op.userId);
    if (this.version % this.snapshotInterval === 0) this.takeSnapshot();
    return this.version;
  }

  takeSnapshot() {
    this.snapshots.push({ version: this.version, content: this.content, ts: Date.now() });
    return this.snapshots.length - 1;
  }

  compact(keepVersionsAfter) {
    // Remove old operation log entries that are covered by snapshots
    const oldLen = this.opLog.length;
    this.opLog = this.opLog.filter(op => op.appliedAt >= keepVersionsAfter);
    this.snapshots = this.snapshots.filter(s => s.version >= keepVersionsAfter || s.version === 0);
    return { removedOps: oldLen - this.opLog.length };
  }
}`,
    explanation: `**Scaling Analysis:**\n\n1. **Operation Throughput**: 694K operations/sec at peak. Each operation requires: validation, transformation (O(concurrent_ops) per op), application, and broadcast. The transformation step is the bottleneck. With single-writer-per-document design, each document's operations are serialized. A single core can process ~50K OT transforms/sec. With 5M active documents across 10K servers, each server handles ~500 documents and ~70 ops/sec per server -- very comfortable.\n\n2. **WebSocket Connections**: 50M concurrent documents x 2 avg editors = 100M WebSocket connections. Each connection uses ~10KB memory. Total: 1TB across all servers. With 10K WebSocket servers, each handles 10K connections (100MB) -- no problem.\n\n3. **Operation Log Storage**: 6 TB/day of operation logs. Use Kafka for recent ops (7-day retention = 42 TB) and archive to S3 for long-term history. Snapshots: 50M docs x 50KB x 1 snapshot/day = 2.5 TB/day for daily snapshots.\n\n4. **Document Reconstruction**: To open a document, fetch latest snapshot and replay recent ops. With snapshots every 500 ops, worst case is replaying 499 ops (~10ms). Average case: <100 ops replay (~2ms).\n\n**Failure Modes:**\n- Collaboration server crash: the "owner" server for a document crashes. Mitigation: detect via heartbeat within 5 seconds, failover to replica that has been receiving replicated operation log. Clients reconnect, send their base version, server catches them up.\n- Split brain (two servers think they own the same document): use a distributed lock (ZooKeeper/etcd) for document ownership. Only the lock holder processes operations. If lock expires, a new server acquires it and replays from the shared operation log.\n- Client sends operations based on a very old version: the server must transform against potentially thousands of intervening operations. If the gap is >10K ops, reject and ask client to refetch the full document.\n- Operation log corruption: snapshots serve as checkpoints. Worst case: lose operations between last snapshot and corruption point. Mitigation: synchronous replication of operation log to 3 replicas.\n\n**Bottleneck Analysis:**\n- OT transformation is CPU-bound and serial per document. A "hot" document with 100 concurrent editors generating 100 ops/sec requires 100 transforms/sec for the first op, 99 for the second, etc. Total: ~5000 transforms/sec. A single core handles this easily, but a viral document with 10K concurrent editors would be problematic. Solution: limit collaborators per document (100) and use operation batching.\n- WebSocket broadcast fan-out: with 100 collaborators per document, each operation triggers 99 outbound messages. At 100 ops/sec per doc: 9900 outbound msgs/sec. Across all documents: 694K x 99 / (5M active docs / 100 collaborators) = manageable per server.\n- Presence updates are high frequency but low priority. Throttle to every 100ms and use unreliable delivery (UDP semantics over WebSocket -- drop stale updates).\n\n**Trade-offs:**\n\n1. **OT vs. CRDT**:\n   - OT: simpler operations, smaller wire format, requires central server for ordering. Google Docs uses OT.\n   - CRDT: no central server needed (peer-to-peer possible), guaranteed convergence without transformation, but larger metadata per character (unique ID + logical clock). Figma and Yjs use CRDTs.\n   - OT is better for server-mediated collaboration with rich text. CRDTs are better for offline-first and P2P scenarios.\n\n2. **Snapshot frequency**: More frequent snapshots = faster document open time, but more storage. Less frequent = less storage, but slower reconstruction. Sweet spot: every 500-1000 operations.\n\n3. **Operation granularity**: Character-level ops (each keystroke) give the smoothest real-time experience but generate the most traffic. Word-level or sentence-level batching reduces traffic but increases perceived latency. Solution: character-level locally, batch into 50ms windows for server transmission.\n\n**Monitoring:**\n- Operation processing latency P50/P99 per document (target: <10ms/<50ms)\n- Convergence lag: time between operation at source and application at all clients (target: <500ms P99)\n- Transform queue depth per document (alert if >1000 pending transforms)\n- Snapshot creation success rate and latency\n- Operation log size per document (alert if growing faster than compaction)\n- WebSocket connection churn rate (high churn indicates network instability)`,
    timeComplexity: `OT transform of two operations: O(1) for simple insert/delete. Transforming a new op against N concurrent ops: O(N). In practice, N is small (1-5 concurrent ops at any moment). Server processing per operation: O(N) where N is the version gap between client and server. Document reconstruction from snapshot: O(K) where K is ops since last snapshot (max 500-1000). Cursor position update on remote op: O(C) where C is number of collaborators (~100 max). Full document open: O(1) snapshot fetch + O(K) replay.`,
    spaceComplexity: `Per-document memory on collaboration server: document content (avg 50KB) + recent op log (1000 ops x 100 bytes = 100KB) + client state (100 collaborators x 1KB = 100KB) = ~250KB per active document. Total for 5M active docs: 1.25 TB across all servers. Operation log storage: 6 TB/day in Kafka (7-day retention = 42 TB). Snapshots: 50M docs x 50KB = 2.5 TB (latest only). Client-side: document copy (50KB) + pending/buffer ops (<10KB) + cursor presence data (<5KB) = ~65KB per client.`,
    hints: [
      `The OT client state machine has exactly three states: Synchronized (no pending ops), AwaitingAck (one op sent, waiting for server confirmation), and AwaitingAckWithBuffer (one op sent, additional local edits buffered). This is the Jupiter protocol used by Google Wave and Google Docs. Every local edit and every server message transitions between these states. Get this state machine right and convergence is guaranteed.`,
      `Transform functions must satisfy TP1 (Transformation Property 1): for concurrent ops A and B, applying A then transform(B, A) must produce the same document as applying B then transform(A, B). Test this property exhaustively with property-based testing (all combinations of insert/delete at various positions). A single bug in transform logic causes divergence that is extremely hard to debug in production.`,
      `Cursor positions are part of the collaboration state and must be transformed alongside document operations. When User A inserts text before User B's cursor, B's cursor must shift right by the inserted length. Implement cursor transformation as a special case of position transformation in your OT engine. Without this, cursors will appear to "jump" randomly as others edit.`,
      `Snapshot compaction is essential for long-lived documents. A document edited for years accumulates millions of operations. Store snapshots every 500-1000 operations. To reconstruct version V, find the nearest snapshot at version S <= V and replay V - S operations. Compact old operation logs that are fully covered by snapshots (keep at least 30 days of ops for undo history).`,
      `For offline support, the client must store its local document state and all pending operations in IndexedDB. On reconnect, send the base version and all pending ops. The server transforms them against everything that happened while offline. For very long offline periods (>24 hours with many edits), fall back to a three-way merge: common ancestor + server version + client version.`,
      `Rich text OT is significantly more complex than plain text OT. Formatting operations (bold, italic) must also be transformed. Use a library like ShareDB (Node.js OT server) or Yjs (CRDT-based) rather than building from scratch. If you must build custom, start with plain text OT and add formatting as a separate layer on top.`,
      `Rate-limit operations from a single client to prevent abuse (e.g., a script sending 1000 ops/sec). Enforce a per-client rate of 50 ops/sec with burst allowance of 200. Also limit document size (10MB) and collaborator count (100) to bound server resource usage per document.`,
      `Use operation batching on the wire: instead of sending every keystroke individually, batch keystrokes into 50ms windows and send as a single compound operation. This reduces WebSocket message rate by 10-20x while keeping perceived latency under 100ms. On the server side, batch broadcasts: send one message per 50ms window to each client with all accumulated remote operations.`
    ]
  }
];
