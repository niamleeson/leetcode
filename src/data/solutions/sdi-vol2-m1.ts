import { ProblemSolution } from './types';

export const sdiVol2M1: ProblemSolution[] = [
  {
    id: 9201,
    description: `## Clarifying Questions to Ask
- What is the **geographic scope**? Single city, country, or global?
- How many businesses exist in the system? How fast is the dataset growing?
- Can businesses update their location or hours in **real-time**?
- Do we need to support **filtering** (e.g., only restaurants open now)?
- What is the expected **radius range** for searches (0.5 mi to 25 mi)?
- Do we need **ranking** (ratings, distance, relevance)?

## Functional Requirements
- Given a **user's latitude/longitude** and a **search radius**, return a list of nearby businesses
- Business owners can **add, update, and delete** business information (not reflected in real-time)
- Users can view **detailed information** about a business (name, address, hours, photos)

## Non-Functional Requirements
- **Low latency**: Proximity search should complete in < 100ms
- **High availability**: Search is a revenue-critical path
- **Eventual consistency**: Business data updates can take a few minutes to propagate
- **Read-heavy**: Search QPS vastly exceeds write QPS (business CRUD is infrequent)

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total businesses | 200M |
| Daily active users | 100M |
| Search QPS (avg) | 100M / 86,400 * 5 searches/user ≈ **5,800 QPS** |
| Peak search QPS | ~12,000 QPS |
| Business update QPS | ~100 QPS (negligible) |
| Storage per business | ~1 KB (name, lat/lng, address, category, hours) |
| Total business data | 200M * 1 KB ≈ **200 GB** |
| Geospatial index size | ~50 GB (lat/lng + geohash + business_id) |
| Cache (hot geohashes) | ~5 GB (top 20% searched areas) |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle boundary cases with geohashes?** A geohash cell boundary can split two nearby points into different prefixes. The solution is to search not just the target cell but also its **8 neighboring cells**. After gathering candidates from all 9 cells, filter by actual distance using the Haversine formula.
- **What if the business dataset is unevenly distributed?** Dense areas (Manhattan) may have thousands of businesses per geohash cell while rural areas have almost none. A **quadtree** handles this better because it adaptively subdivides dense areas into smaller cells. Alternatively, use a shorter geohash prefix for dense areas.
- **How would you support real-time search filters?** Add secondary indexes for category, rating, and open-hours. Apply post-filtering on the candidate set retrieved from the geospatial index. For frequently used filter combos, maintain pre-computed filtered geohash indexes.
- **How would you support ranking by distance and rating?** Retrieve candidates within the radius, compute exact distances using Haversine formula, then apply a weighted score combining distance and business rating. Cache top-ranked results per geohash cell.
- **How does Google S2 compare to geohash?** S2 uses a Hilbert curve to map the sphere surface to 1D, providing more uniform cell shapes and better edge behavior than geohash rectangles. S2 cells can cover arbitrary regions precisely, making it useful for geofencing.`,
    intuition: `A proximity service is fundamentally a **geospatial indexing problem**. Raw SQL queries like \`WHERE lat BETWEEN x1 AND x2 AND lng BETWEEN y1 AND y2\` do not scale because they require scanning large datasets. The key insight is to convert 2D coordinates into a **1D index** (geohash) or a **tree structure** (quadtree) so that nearby locations share a common prefix or tree path. This makes range queries efficient. The system is overwhelmingly read-heavy, so caching geohash-to-business mappings and keeping the geospatial index in memory are the most impactful optimizations.`,
    approach: `## Component Overview

A **Location-Based Service (LBS)** handles proximity search queries using an in-memory geospatial index. A separate **Business Service** handles CRUD operations for business data. Both sit behind a load balancer. The geospatial index is rebuilt periodically from the business database, and search results are cached by geohash.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/search/nearby\` | Search | Params: \`lat, lng, radius, category?\` → Returns list of businesses |
| \`GET /api/v1/businesses/:id\` | Read | Returns full business details |
| \`POST /api/v1/businesses\` | Create | Body: \`{ name, lat, lng, address, hours, category }\` |
| \`PUT /api/v1/businesses/:id\` | Update | Updates business info |
| \`DELETE /api/v1/businesses/:id\` | Delete | Removes a business |

## Data Model

**Business Table**

| Column | Type | Notes |
|--------|------|-------|
| business_id (PK) | BIGINT | Auto-generated ID |
| name | VARCHAR(255) | Business name |
| latitude | DOUBLE | GPS latitude |
| longitude | DOUBLE | GPS longitude |
| address | TEXT | Street address |
| category | VARCHAR(64) | Restaurant, hotel, gas station, etc. |
| hours | JSON | Operating hours per day |
| rating | FLOAT | Average user rating |

**Geospatial Index Table (for geohash approach)**

| Column | Type | Notes |
|--------|------|-------|
| geohash (PK) | VARCHAR(12) | Geohash string at chosen precision |
| business_id (PK) | BIGINT | FK to business table |
| latitude | DOUBLE | For exact distance calculation |
| longitude | DOUBLE | For exact distance calculation |

## Geohash Precision Reference

| Precision | Cell Width | Cell Height | Use Case |
|-----------|-----------|------------|----------|
| 4 | 39.1 km | 19.5 km | 25 mi radius |
| 5 | 4.9 km | 4.9 km | 5 mi radius |
| 6 | 1.2 km | 0.6 km | 1 mi radius |
| 7 | 153 m | 153 m | 0.1 mi radius |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+        +-------------------+
|  Mobile  |------->| Load Balancer     |
|  Client  |<-------| (Nginx / ALB)     |
+----------+        +--------+----------+
                             |
              +--------------+--------------+
              |                             |
    +---------v----------+     +------------v-----------+
    | Location-Based     |     | Business Service       |
    | Service (LBS)      |     | (CRUD operations)      |
    | [Stateless]        |     | [Stateless]            |
    |                    |     |                        |
    | GET /search/nearby |     | POST/PUT/DELETE /biz   |
    +---------+----------+     +-----+----------+-------+
              |                      |          |
    +---------v----------+     +-----v----+ +---v-----------+
    | Geospatial Index   |     | Business | | Business DB   |
    | (In-Memory)        |     | Cache    | | (MySQL /      |
    |                    |     | (Redis)  | |  PostgreSQL)  |
    | Geohash -> [biz_id]|     +----------+ +-------+-------+
    +--------------------+                          |
              |                                     |
    +---------v------------------+                  |
    | Search Result Cache        |<-----------------+
    | (Redis)                    |   nightly rebuild
    | geohash:radius -> [biz]   |
    +----------------------------+
\`\`\`

## Search Flow

\`\`\`
Client            LBS                Cache          Geo Index      DB
  |                |                   |               |            |
  | GET /nearby    |                   |               |            |
  | lat,lng,radius |                   |               |            |
  |--------------->|                   |               |            |
  |                | hash(lat,lng)     |               |            |
  |                | -> geohash "9q8y" |               |            |
  |                |                   |               |            |
  |                | Check cache       |               |            |
  |                |------------------>|               |            |
  |                |     MISS          |               |            |
  |                |<------------------|               |            |
  |                |                   |               |            |
  |                | Query geohash     |               |            |
  |                | + 8 neighbors     |               |            |
  |                |------------------------------>|   |            |
  |                |     candidate IDs             |   |            |
  |                |<------------------------------|   |            |
  |                |                   |               |            |
  |                | Filter by actual  |               |            |
  |                | Haversine distance|               |            |
  |                |                   |               |            |
  |                | Fetch biz details |               |            |
  |                |---------------------------------------------->|
  |                |                   |               |     data   |
  |                |<----------------------------------------------|
  |                |                   |               |            |
  |                | Populate cache    |               |            |
  |                |------------------>|               |            |
  | JSON response  |                   |               |            |
  |<---------------|                   |               |            |
\`\`\`

## Geohash Neighbor Lookup

\`\`\`
+--------+--------+--------+
| geohash| geohash| geohash|
|  NW    |   N    |   NE   |
+--------+--------+--------+
| geohash| TARGET | geohash|
|   W    | 9q8yb  |   E    |
+--------+--------+--------+
| geohash| geohash| geohash|
|  SW    |   S    |   SE   |
+--------+--------+--------+

Search all 9 cells to handle boundary cases.
Filter candidates by exact distance with Haversine formula.
\`\`\`
`,
    jsCode: `## Deep Dive: Geohash vs Quadtree vs Google S2

### Geohash

Geohash recursively divides the world into a grid. Each division halves the longitude or latitude range alternately, producing a **base-32 encoded string**. Longer strings mean smaller cells and higher precision.

**Pros:**
- Simple to implement and index in any standard database
- Easy to find neighbors (string manipulation)
- Works well with caching (geohash prefix = cache key)

**Cons:**
- Cells are rectangular, not square, at most latitudes
- Boundary problems require querying 8 neighbors
- Fixed grid does not adapt to density

### Quadtree

A quadtree recursively divides a 2D space into four quadrants. Each node splits when it contains more than a threshold of points (e.g., 100 businesses).

**Pros:**
- **Adapts to data density** — dense areas get subdivided more finely
- No boundary problem since traversal handles adjacency naturally
- Good for in-memory indexing

**Cons:**
- Harder to distribute across servers (tree structure)
- Must be built in memory on each server (~few GB for 200M businesses)
- Updates require tree rebalancing

### Google S2

S2 maps the Earth's surface onto a unit cube, then uses a **Hilbert space-filling curve** to convert 2D points to 1D cell IDs. Cells at any level are roughly the same shape and area.

**Pros:**
- Uniform cell shapes (no elongated rectangles)
- Excellent region coverage with minimal over-coverage
- Used in production at Google

**Cons:**
- More complex implementation
- Less widely supported in standard databases

## Deep Dive: Building and Updating the Geospatial Index

The geospatial index is an in-memory data structure loaded at server startup. Since business data changes infrequently (~100 QPS), a **full rebuild every few hours** is acceptable.

**Rebuild strategy:**
1. A background job reads all 200M businesses from the primary database
2. For each business, compute the geohash at the desired precision
3. Build a hash map: \`geohash -> list of (business_id, lat, lng)\`
4. Serialize the index and store it in an object store (S3)
5. LBS servers periodically pull the latest index snapshot and swap it in

**Incremental update strategy (alternative):**
- Use a CDC (Change Data Capture) stream from the business DB
- Apply inserts/updates/deletes to the in-memory index in real-time
- More complex but avoids full rebuild lag

## Deep Dive: Scaling the Search Layer

Since LBS servers are **stateless** (each holds a copy of the geospatial index in memory), scaling is straightforward:

- **Horizontal scaling**: Add more LBS instances behind the load balancer
- **Caching**: Cache search results by \`(geohash, radius, category)\` in Redis. Business data rarely changes, so a TTL of 1-5 minutes is safe.
- **Sharding the index**: For extremely large datasets, partition the geospatial index by region (e.g., by country or top-level geohash prefix). Each LBS server handles queries for its assigned region.

## Deep Dive: Handling Radius Mismatch

When a user searches with a 5-mile radius, we pick geohash precision 5 (~4.9 km cells). But what if the number of results is too few?

**Adaptive expansion strategy:**
1. Start with the computed geohash precision
2. If results < minimum threshold (e.g., 20 businesses), shorten the geohash by 1 character (expand the search area by ~8x)
3. Repeat until enough results are found or a maximum radius is reached
4. Always filter final candidates by exact Haversine distance
`,
    explanation: `## Wrap Up

### Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Geospatial index | Geohash (primary) | Simple, cache-friendly, good enough for most use cases |
| Index location | In-memory on LBS servers | 200M businesses fit in ~few GB; sub-ms lookups |
| Database | MySQL/PostgreSQL | Business data is relational; read replicas for scale |
| Cache | Redis | Cache geohash search results; low-latency reads |
| Index rebuild | Periodic full rebuild | Business data changes slowly; simplicity wins |
| Boundary handling | Query 9 geohash cells | Standard technique to avoid missing nearby results |

### Key Tradeoffs

**Geohash vs Quadtree**: Geohash is simpler to implement, cache, and distribute. Quadtree adapts better to uneven density. For most proximity services, geohash with neighbor lookups is sufficient. Google Maps internally uses S2, but that adds implementation complexity.

**In-Memory Index vs Database Geospatial Index**: Databases like PostgreSQL (PostGIS) and MySQL support native geospatial queries. For moderate traffic, these work fine. At high QPS (10K+), an in-memory index avoids database round-trips entirely and provides predictable sub-millisecond lookup times.

**Full Rebuild vs Incremental Updates**: Full rebuilds are simpler and avoid edge cases with partial updates. Since businesses rarely change location, a rebuild every few hours is acceptable. Incremental updates via CDC are more complex but reduce staleness.

### Scalability Path
- **10K QPS**: A few LBS servers with in-memory index + Redis cache
- **100K QPS**: More LBS replicas, sharded Redis cache, multiple read replicas
- **1M QPS**: Regional deployment, CDN for static business data, partitioned geospatial index
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Always query the 8 neighboring geohash cells in addition to the target cell to handle boundary cases — two points can be physically adjacent but fall into different geohash prefixes.',
      'Business data is read-heavy and rarely changes, making it ideal for aggressive caching. Cache geohash-to-business-list mappings with a short TTL.',
      'Do not confuse geohash precision with search radius. Map each supported radius to the appropriate geohash precision level, and always post-filter candidates by exact Haversine distance.',
    ],
  },
  {
    id: 9202,
    description: `## Clarifying Questions to Ask
- How many **concurrent users** does the system need to support?
- What is the **location update frequency**? Every few seconds?
- What defines "**nearby**"? A fixed radius (e.g., 5 miles) or configurable?
- How many **friends** can a user have on average? What is the max?
- Should we store **location history**, or is this purely real-time?
- Is the friends list **bidirectional** (mutual) or one-directional (followers)?

## Functional Requirements
- Users who opt in **share their location** in real-time with friends
- The app displays friends who are **within a configurable radius** (default 5 miles)
- The friend list updates location **every few seconds** without manual refresh
- Users can **enable/disable** location sharing at any time

## Non-Functional Requirements
- **Low latency**: Location updates should propagate to friends within 1 second
- **High availability**: The feature should degrade gracefully under load
- **Eventual consistency**: Brief staleness in friend locations is acceptable
- **Scalability**: Support 100M+ DAU with concurrent WebSocket connections

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily active users | 100M |
| Concurrent users (10%) | 10M |
| Avg friends per user | 400 |
| Friends using nearby feature | 10% → 40 nearby-active friends |
| Location update interval | Every 30 seconds |
| Updates per second | 10M / 30 ≈ **333K updates/sec** |
| Fanout per update | 40 friends → **13.3M messages/sec** total fanout |
| WebSocket connections | 10M persistent connections |
| Location data per update | ~100 bytes (user_id, lat, lng, timestamp) |
| Bandwidth (inbound) | 333K * 100B ≈ **33 MB/s** |
| Bandwidth (outbound fanout) | 13.3M * 100B ≈ **1.3 GB/s** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle users with thousands of friends?** For celebrity-type users with massive friend lists, direct pub/sub fanout becomes expensive. Use a **hybrid approach**: normal users get direct fanout via pub/sub, while high-friend-count users switch to a pull model where friends periodically poll for their location rather than receiving push notifications.
- **How would you reduce unnecessary updates?** Implement a **distance-based filter**: only forward location updates to friends who were last known to be within 2x the configured radius. If a friend is 50 miles away, skip pushing updates until they move closer. This can reduce fanout by 80-90%.
- **How would you store location history?** Route location updates through a **Kafka pipeline** into a time-series database (e.g., InfluxDB or Cassandra with time-based partitioning). This decouples history storage from the real-time path and supports features like "where was my friend at 3pm?"
- **What happens when a user goes offline?** The WebSocket server detects the disconnect. Remove the user from the location cache and publish a "user offline" event to their channel. Friends' clients receive this and remove the user from the nearby friends display.
- **How do you ensure location privacy?** Users must explicitly opt in. Location sharing can be toggled per-friend or globally. The server enforces permissions before publishing updates. Location data in the cache has a short TTL (e.g., 60 seconds) so stale locations auto-expire.`,
    intuition: `Unlike a proximity service that indexes static business locations, Nearby Friends deals with **constantly moving users** who need **real-time updates**. The key insight is to use a **pub/sub model** where each user acts as a channel. When a user updates their location, the update is published to their channel, and all friends who have subscribed receive it instantly. This avoids the expensive approach of each user polling all their friends' locations. The combination of **WebSockets** for persistent bidirectional connections and **Redis Pub/Sub** (or similar) for efficient message fanout solves the real-time broadcasting problem at scale.`,
    approach: `## Component Overview

**WebSocket Servers** maintain persistent connections with mobile clients for bidirectional real-time communication. A **Location Cache** (Redis) stores the latest location of each active user. A **Pub/Sub layer** (Redis Pub/Sub or a dedicated message broker) handles fanning out location updates to friends. A **User/Friends Service** provides the friend list. A **Location History Service** asynchronously stores location data for analytics.

## API Design

| Endpoint / Event | Type | Description |
|------------------|------|-------------|
| WebSocket \`/ws/location\` | Connect | Establish persistent connection for location updates |
| \`location_update\` | WS Message (Client→Server) | \`{ lat, lng, timestamp }\` — periodic location ping |
| \`friend_location\` | WS Message (Server→Client) | \`{ friend_id, lat, lng, timestamp }\` — push update |
| \`friend_offline\` | WS Message (Server→Client) | \`{ friend_id }\` — friend went offline |
| \`GET /api/v1/friends/nearby\` | HTTP | Initial fetch of all nearby friends on app open |

## Data Model

**Location Cache (Redis)**

| Key | Value | TTL |
|-----|-------|-----|
| \`loc:{user_id}\` | \`{ lat, lng, timestamp }\` | 60 seconds |

**Pub/Sub Channels**

| Channel | Subscribers | Publisher |
|---------|-------------|-----------|
| \`user:{user_id}:location\` | All friends of user_id who are online | The WebSocket server handling user_id |

**Location History (Cassandra / Time-Series DB)**

| Column | Type | Notes |
|--------|------|-------|
| user_id (PK) | BIGINT | Partition key |
| timestamp (CK) | TIMESTAMP | Clustering key, descending |
| latitude | DOUBLE | GPS latitude |
| longitude | DOUBLE | GPS longitude |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+     WebSocket      +---------------------+
|  Mobile  |<=================>| WebSocket Servers    |
|  Client  |  Persistent Conn  | (Stateful)           |
+----------+                    |                      |
                                | - Receive loc updates|
                                | - Push friend locs   |
                                +----+--------+--------+
                                     |        |
                          +----------v--+  +--v-----------+
                          | Location    |  | Pub/Sub      |
                          | Cache       |  | (Redis       |
                          | (Redis)     |  |  Pub/Sub)    |
                          |             |  |              |
                          | user_id ->  |  | Channel per  |
                          | {lat,lng,ts}|  | user for     |
                          +-------------+  | location     |
                                           | broadcasts   |
                                           +------+-------+
                                                  |
                                     +------------v-----------+
                                     | Friend Service         |
                                     | (Who are my friends?)  |
                                     +------------------------+
                                                  |
                                     +------------v-----------+
                                     | Location History       |
                                     | Service (async)        |
                                     | Kafka -> Cassandra     |
                                     +------------------------+
\`\`\`

## Location Update Flow

\`\`\`
User A (Client)     WS Server 1      Redis Cache    Redis Pub/Sub    WS Server 2     User B (Client)
     |                   |                |               |                |               |
     | loc_update        |                |               |                |               |
     | {lat,lng,ts}      |                |               |                |               |
     |=================>|                |               |                |               |
     |                   | SET loc:A      |               |                |               |
     |                   |--------------->|               |                |               |
     |                   |     OK         |               |                |               |
     |                   |<---------------|               |                |               |
     |                   |                |               |                |               |
     |                   | PUBLISH        |               |                |               |
     |                   | user:A:location|               |                |               |
     |                   | {lat,lng,ts}   |               |                |               |
     |                   |------------------------------>|                |               |
     |                   |                |               |                |               |
     |                   |                |               | Deliver to     |               |
     |                   |                |               | subscribers    |               |
     |                   |                |               |--------------->|               |
     |                   |                |               |                |               |
     |                   |                |               |                | Compute dist  |
     |                   |                |               |                | to User B     |
     |                   |                |               |                |               |
     |                   |                |               |                | friend_loc    |
     |                   |                |               |                | (if within    |
     |                   |                |               |                |  radius)      |
     |                   |                |               |                |==============>|
     |                   |                |               |                |               |
\`\`\`

## WebSocket Connection Initialization

\`\`\`
User opens app     WS Server          Friend Service    Redis Pub/Sub    Location Cache
     |                 |                     |                |               |
     | WS Connect      |                     |                |               |
     |================>|                     |                |               |
     |                 | Get friend list     |                |               |
     |                 |-------------------->|                |               |
     |                 |   [B, C, D, E]      |                |               |
     |                 |<--------------------|                |               |
     |                 |                     |                |               |
     |                 | SUBSCRIBE to:       |                |               |
     |                 | user:B:location     |                |               |
     |                 | user:C:location     |                |               |
     |                 | user:D:location     |                |               |
     |                 | user:E:location     |                |               |
     |                 |---------------------------------->|  |               |
     |                 |                     |                |               |
     |                 | GET loc:B, loc:C,   |                |               |
     |                 |     loc:D, loc:E    |                |               |
     |                 |---------------------------------------------->|      |
     |                 |   {lat,lng,ts} x4   |                |               |
     |                 |<----------------------------------------------|      |
     |                 |                     |                |               |
     | Initial nearby  |                     |                |               |
     | friends list    |                     |                |               |
     |<=================|                     |                |               |
\`\`\`
`,
    jsCode: `## Deep Dive: Pub/Sub Fanout and Scaling

### Why Pub/Sub Over Polling?

If each user polled all their friends' locations every 30 seconds, a user with 400 friends would generate 400 cache reads per poll — that is 10M users * 400 reads / 30s = **133M reads/sec** on the cache. With pub/sub, each location update fans out only to friends who are actively online and subscribing, which is far more efficient.

### Redis Pub/Sub Limitations

Redis Pub/Sub is lightweight and fast but has limitations at massive scale:
- **No message persistence**: If a subscriber disconnects, messages are lost
- **Single-server fan-out**: Each Redis instance handles its own subscriptions
- **Memory usage**: Each channel (user) consumes some memory

**Scaling strategy**: Use a **Redis Pub/Sub cluster** with consistent hashing. Each user's channel is assigned to a specific Redis node based on their user_id hash. WebSocket servers subscribe to the relevant Redis nodes for the friends of their connected users.

### Alternative: Dedicated Message Broker (Kafka)

For even larger scale, replace Redis Pub/Sub with a system using **per-user Kafka topics** or a custom message routing layer. However, Kafka adds latency compared to Redis Pub/Sub and creates topic management overhead for millions of users.

## Deep Dive: Scaling WebSocket Connections

### The 10M Connection Challenge

Each WebSocket connection consumes a file descriptor and some memory (~10-20 KB per connection). A single server can handle ~100K-500K connections depending on hardware.

**Scaling plan:**
- **20-100 WebSocket servers** to handle 10M connections
- **Sticky sessions** via load balancer (user always connects to the same server during a session)
- **Service discovery**: When User A publishes a location update and friend B is connected to a different WS server, the pub/sub layer routes the message to the correct server

### Connection State Management

Since WebSocket servers are **stateful**, we need to handle server failures:

1. Store a mapping of \`user_id -> ws_server_id\` in Redis
2. When a WS server crashes, connected users detect the disconnect and reconnect
3. The new WS server re-subscribes to all necessary pub/sub channels
4. Missed updates during reconnection are acceptable (location data is ephemeral)

## Deep Dive: Distance Calculation and Filtering

### Server-Side vs Client-Side Filtering

**Option A: Server-side filtering** — The WS server computes the Haversine distance between the updating user and each subscribing friend, only forwarding updates to friends within the radius. This saves client bandwidth but adds CPU load to the server.

**Option B: Client-side filtering** — The server forwards all friend location updates, and the client determines which friends are nearby. Simpler server logic but wastes bandwidth on irrelevant updates.

**Recommended: Hybrid approach.** The server applies a **coarse filter** (bounding box check, which is cheap) and the client applies the **precise filter** (Haversine distance).

## Deep Dive: Location History Storage

Location updates flow through an **asynchronous pipeline** separate from the real-time path:

1. WebSocket server sends each location update to a **Kafka topic** (fire-and-forget)
2. A stream processor consumes from Kafka and writes to a **time-series database**
3. Cassandra is a good fit: partition by \`user_id\`, cluster by \`timestamp DESC\`
4. Apply TTL on rows (e.g., 30 days) to auto-expire old location data

This decoupling ensures that location history storage never impacts real-time performance.
`,
    explanation: `## Wrap Up

### Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Client connection | WebSocket | Bidirectional, persistent, low overhead for real-time |
| Location cache | Redis | Sub-ms reads for latest user location; TTL for auto-expiry |
| Message fanout | Redis Pub/Sub | Lightweight, fast, purpose-built for broadcast patterns |
| Location history | Kafka → Cassandra | Async pipeline decouples history from real-time path |
| Friend list source | User/Friend Service | Separate microservice; cached on WS server at connect time |
| Distance filtering | Hybrid (server bounding box + client Haversine) | Balances server CPU and client bandwidth |

### Key Tradeoffs

**Push (Pub/Sub) vs Pull (Polling)**: Push is far more efficient for this use case. Location updates are frequent and the number of friends is bounded. Polling would generate orders of magnitude more cache reads for the same result.

**Redis Pub/Sub vs Kafka**: Redis Pub/Sub has lower latency and is simpler for ephemeral location data. Kafka provides durability and replay but adds latency. Since location data is ephemeral (we only care about the latest position), Redis Pub/Sub is the better fit for the real-time path.

**Stateful WebSocket Servers**: The main downside is operational complexity — handling server failures, rebalancing connections, and managing sticky sessions. The alternative (long polling over HTTP) avoids statefulness but increases latency and server load significantly.

### Scalability Path
- **1M concurrent**: A handful of WS servers + single Redis Pub/Sub cluster
- **10M concurrent**: 50-100 WS servers + sharded Redis Pub/Sub + regional deployment
- **100M concurrent**: Multiple data centers, regional Pub/Sub clusters, edge WS servers
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Use a pub/sub channel per user rather than per friend-pair. When User A updates their location, they publish once to their own channel, and all subscribing friends receive it — this is O(1) publish cost regardless of friend count.',
      'WebSocket servers are stateful, so you need a mechanism to route pub/sub messages to the correct server. Store a user-to-server mapping in Redis and use it for cross-server message delivery.',
      'Do not store location history in the real-time path. Use an async pipeline (Kafka) to decouple history writes from the latency-sensitive location update flow.',
      'Apply a coarse bounding-box filter on the server side before pushing updates to clients. This avoids wasting bandwidth on friends who are clearly outside the radius.',
    ],
  },
  {
    id: 9203,
    description: `## Clarifying Questions to Ask
- Are we designing all three features (map rendering, routing, navigation) or a subset?
- What is the **geographic coverage**? Global or a single country?
- Do we need **real-time traffic** for ETA and route recalculation?
- How many **concurrent navigation sessions** do we need to support?
- Do we need **offline map support**?
- What is the map **update frequency** (new roads, construction)?

## Functional Requirements
- **Map Rendering**: Display an interactive map with pan and zoom at multiple detail levels
- **Route Planning**: Given an origin and destination, compute the optimal driving route
- **Real-Time Navigation**: Turn-by-turn directions with live ETA updates based on traffic
- **Geocoding**: Convert addresses to coordinates and vice versa

## Non-Functional Requirements
- **Low latency**: Map tiles load in < 200ms; route computation < 2 seconds
- **High availability**: Navigation cannot fail mid-trip
- **Scalability**: Support millions of concurrent navigation sessions
- **Freshness**: Traffic data should be no more than 30 seconds old
- **Bandwidth efficiency**: Minimize data usage for mobile clients

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Daily active users | 1B |
| Concurrent navigation sessions | 5M |
| Map tile requests/sec | 1B * 10 tiles/session / 86,400 ≈ **115K tile QPS** |
| Route computation requests/sec | ~10K QPS |
| GPS pings for traffic | 5M * 1 ping/sec = **5M pings/sec** |
| Map tile storage (all zoom levels) | ~50 TB (pre-rendered tiles) |
| Road network graph size | ~10 GB (nodes + edges globally) |
| Single tile size | ~50-200 KB (PNG/vector) |
| CDN bandwidth for tiles | 115K * 100KB ≈ **11 GB/s** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle map updates (new roads, closures)?** Run a **map pipeline** that ingests data from government sources, satellite imagery, and user reports. Regenerate affected tiles in the tile build system. Use versioned tile sets so clients can incrementally fetch updated tiles without re-downloading the entire map.
- **How would you support offline maps?** Allow users to pre-download a region's tiles and road graph. Store them in local device storage. The routing engine must work locally using the downloaded graph. Sync back to server when connectivity returns.
- **How would you compute ETA more accurately?** Combine historical speed data (by road segment, time of day, day of week) with real-time traffic. Use ML models trained on historical trip data to predict travel time more accurately than simple distance/speed calculations.
- **How would you handle multi-modal routing (driving + transit)?** Maintain separate graphs for each transport mode. The routing engine stitches together segments across modes, optimizing for total travel time. Transit schedules add a time-dependent dimension to the graph.
- **How would you reduce bandwidth for map rendering?** Use **vector tiles** instead of raster tiles. Vector tiles are smaller (10-50 KB vs 50-200 KB) and can be rendered on the client device with customizable styling. The client only fetches tiles for the visible viewport.`,
    intuition: `Google Maps solves three distinct but interconnected problems. **Map rendering** is a content delivery problem — pre-render tiles at every zoom level and serve them from CDN. **Route planning** is a graph algorithm problem — but naive Dijkstra on a global road graph is too slow, so the system uses **precomputation techniques** like Contraction Hierarchies to answer queries in milliseconds. **Real-time navigation** is a streaming data problem — millions of GPS pings feed into a traffic aggregation pipeline that continuously updates road segment speeds, which in turn adjust ETAs for active navigation sessions. The key insight is that each sub-problem requires a fundamentally different architecture, and they communicate through shared data layers.`,
    approach: `## Component Overview

The system consists of four major subsystems: a **Map Tile Service** backed by CDN for rendering, a **Routing Service** that computes optimal paths using a preprocessed road graph, a **Navigation Service** that provides real-time turn-by-turn guidance with traffic-aware ETAs, and a **Traffic Ingestion Pipeline** that processes GPS pings into road segment speeds.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/tiles/{z}/{x}/{y}.pbf\` | Read | Fetch a vector map tile by zoom level and coordinates |
| \`POST /api/v1/routes\` | Compute | Body: \`{ origin, destination, mode, avoid? }\` → Returns route with steps |
| \`WS /api/v1/navigation\` | Stream | Bidirectional: client sends GPS pings, server sends updated ETA/directions |
| \`GET /api/v1/geocode?q=address\` | Search | Convert address to \`{ lat, lng }\` |
| \`GET /api/v1/reverse-geocode?lat=x&lng=y\` | Lookup | Convert coordinates to address |

## Data Model

**Road Graph (Adjacency List)**

| Field | Type | Notes |
|-------|------|-------|
| node_id | INT | Intersection or waypoint |
| latitude | DOUBLE | GPS coordinate |
| longitude | DOUBLE | GPS coordinate |
| edges | LIST | Adjacent nodes with distance, speed_limit, road_type |

**Map Tile Metadata**

| Field | Type | Notes |
|-------|------|-------|
| zoom_level | INT | 0 (world) to 21 (building level) |
| x | INT | Tile column index |
| y | INT | Tile row index |
| version | INT | Tile generation version |
| storage_path | VARCHAR | S3/object store path |

**Traffic Segment**

| Field | Type | Notes |
|-------|------|-------|
| segment_id (PK) | BIGINT | Road segment identifier |
| avg_speed_kmh | FLOAT | Current average speed |
| sample_count | INT | Number of GPS samples in current window |
| updated_at | TIMESTAMP | Last update time |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+       +------------------+       +-------------------+
|  Mobile  |------>| CDN              |------>| Map Tile Service  |
|  Client  |<------| (CloudFront/     |       | (Tile Storage)    |
|          |       |  Akamai)         |       |                   |
|          |       +------------------+       | S3 / Object Store |
|          |                                   | Pre-rendered tiles|
|          |                                   +-------------------+
|          |
|          |       +------------------+
|          |------>| Load Balancer    |
|          |       +--------+---------+
|          |                |
|          |       +--------v----------------------------------+
|          |       |  API Gateway                              |
|          |       +-----+-------------+-------------+---------+
|          |             |             |             |
|          |    +--------v-----+ +----v-------+ +---v-----------+
|          |    | Routing      | | Navigation | | Geocoding     |
|          |    | Service      | | Service    | | Service       |
|          |    |              | |            | |               |
|          |    | Preprocessed | | WebSocket  | | Address <->   |
|          |    | road graph   | | sessions   | | Coordinates   |
|          |    +------+-------+ +-----+------+ +-------+-------+
|          |           |               |                |
|          |    +------v-------+ +-----v------+ +-------v-------+
|          |    | Road Graph   | | Traffic    | | Geocoding     |
|          |    | Store        | | Service    | | Index         |
|          |    | (In-Memory)  | | (Live      | | (Elasticsearch|
|          |    |              | |  speeds)   | |  / custom)    |
|          |    +--------------+ +-----+------+ +---------------+
|          |                          |
|          |                   +------v--------------+
|          |  GPS pings        | Traffic Ingestion   |
|          |------------------>| Pipeline            |
|          |                   | (Kafka -> Flink ->  |
|          |                   |  Traffic DB)        |
|          |                   +---------------------+
\`\`\`

## Map Tile Rendering Pipeline

\`\`\`
Raw Map Data          Tile Build System              CDN / Storage
(OpenStreetMap,       (Offline Pipeline)
 satellite, etc.)
     |                       |                            |
     | Ingest raw data       |                            |
     |---------------------->|                            |
     |                       | For each zoom level 0-21:  |
     |                       | Subdivide world into tiles  |
     |                       | Render vector/raster tile   |
     |                       | Apply detail level rules    |
     |                       |                            |
     |                       | Upload tiles               |
     |                       |--------------------------->|
     |                       |                            |
     |                       | Zoom 0: 1 tile (world)     |
     |                       | Zoom 10: ~1M tiles         |
     |                       | Zoom 18: ~69B tiles        |
     |                       | (only render populated     |
     |                       |  areas at high zoom)       |
\`\`\`

## Route Computation Flow

\`\`\`
Client          Routing Service        Road Graph (Memory)    Traffic Service
  |                  |                        |                     |
  | POST /routes     |                        |                     |
  | origin, dest     |                        |                     |
  |----------------->|                        |                     |
  |                  | Geocode origin/dest    |                     |
  |                  | -> graph node IDs      |                     |
  |                  |                        |                     |
  |                  | Get live segment       |                     |
  |                  | speeds                 |                     |
  |                  |-------------------------------------------->|
  |                  |     speed_map          |                     |
  |                  |<--------------------------------------------|
  |                  |                        |                     |
  |                  | Run Contraction        |                     |
  |                  | Hierarchies query      |                     |
  |                  | with traffic weights   |                     |
  |                  |----------------------->|                     |
  |                  |     shortest path      |                     |
  |                  |<-----------------------|                     |
  |                  |                        |                     |
  |                  | Expand CH shortcuts    |                     |
  |                  | into full road path    |                     |
  |                  |                        |                     |
  | Route + ETA      |                        |                     |
  |<-----------------|                        |                     |
\`\`\`

## Traffic Ingestion Pipeline

\`\`\`
Millions of         Kafka            Stream Processor       Traffic DB
GPS devices         (Ingestion)      (Flink / Spark)        (Redis + archive)
     |                  |                  |                      |
     | GPS ping         |                  |                      |
     | {lat,lng,speed,  |                  |                      |
     |  heading,ts}     |                  |                      |
     |----------------->|                  |                      |
     |                  | Buffered batch   |                      |
     |                  |----------------->|                      |
     |                  |                  | Map-match to         |
     |                  |                  | road segment         |
     |                  |                  |                      |
     |                  |                  | Aggregate speed      |
     |                  |                  | per segment          |
     |                  |                  | (sliding window)     |
     |                  |                  |                      |
     |                  |                  | Update segment speed |
     |                  |                  |--------------------->|
     |                  |                  |                      |
\`\`\`
`,
    jsCode: `## Deep Dive: Map Tiling and Zoom Levels

### The Tiling System

The world map is divided into square tiles at each zoom level using a **quad-tree subdivision**:
- **Zoom 0**: 1 tile covers the entire world
- **Zoom 1**: 4 tiles (2x2 grid)
- **Zoom N**: 4^N tiles (2^N x 2^N grid)
- **Zoom 21**: Maximum detail, individual buildings visible

At each zoom level, different features are shown:
- Zoom 0-4: Country borders, ocean labels
- Zoom 5-10: Major highways, cities, lakes
- Zoom 11-14: Local roads, neighborhoods, parks
- Zoom 15-18: Individual streets, buildings, POIs
- Zoom 19-21: Building footprints, house numbers

### Vector Tiles vs Raster Tiles

**Raster tiles** (PNG/JPEG) are pre-rendered images. Simple to serve but large (50-200 KB each), cannot be styled client-side, and require regeneration for any style change.

**Vector tiles** (Protocol Buffers) contain raw geometric data that the client renders. Much smaller (10-50 KB), support client-side styling (dark mode, custom colors), and allow smooth zoom transitions. Modern mapping services (Mapbox, Google) use vector tiles.

### CDN Strategy

Map tiles are **immutable for a given version**. Tile URL includes the version: \`/tiles/v3/{z}/{x}/{y}.pbf\`. This enables aggressive caching:
- CDN cache TTL: 30 days (tiles rarely change)
- When map data updates, increment version and regenerate affected tiles
- Popular tiles (city centers) have near-100% cache hit rate
- Rural/ocean tiles may not be cached until requested

## Deep Dive: Routing Algorithms

### Why Not Plain Dijkstra?

The global road network has ~500M nodes and ~1B edges. Plain Dijkstra explores nodes in all directions until reaching the destination, which could visit millions of nodes for a cross-country route. At 10K route QPS, this is computationally infeasible.

### Contraction Hierarchies (CH)

CH is a **precomputation-based** technique that dramatically speeds up shortest-path queries:

**Preprocessing (offline, takes hours):**
1. Rank all nodes by "importance" (highways > local streets)
2. Process nodes from least to most important
3. For each node v being "contracted": if the shortest path from neighbor u to neighbor w goes through v, add a **shortcut edge** u→w with combined weight
4. Result: a hierarchical graph where important nodes (highway junctions) have shortcut edges that skip over less important nodes

**Query (online, milliseconds):**
1. Run **bidirectional Dijkstra** — forward search from origin, backward search from destination
2. Both searches only explore edges going "upward" in the hierarchy
3. They meet at a high-importance node (typically a highway junction)
4. Unpack shortcut edges to recover the full path

**Performance**: CH answers continental-scale queries in **< 1 millisecond** after preprocessing. This is the technique used by OSRM and similar routing engines.

### Incorporating Live Traffic

The preprocessed CH graph uses static edge weights (distance or free-flow travel time). To incorporate live traffic:

1. Maintain a **live speed overlay**: a map from segment_id to current average speed
2. At query time, adjust edge weights based on live speeds
3. For heavily congested segments, increase the edge weight proportionally
4. This is an approximation — full CH with dynamic weights requires more complex techniques (Customizable Contraction Hierarchies)

## Deep Dive: Real-Time Navigation and ETA

### Navigation Session Lifecycle

1. User requests a route → Routing Service returns a path
2. Client opens a WebSocket to Navigation Service
3. Client sends GPS pings every 1-2 seconds
4. Server **map-matches** the GPS position to the current road segment
5. Server checks if the user is still on the planned route
6. If off-route: trigger **rerouting** (new route computation)
7. Server periodically recalculates ETA using live traffic on remaining segments
8. Server pushes updated ETA and next-turn instructions to client

### ETA Computation

For the remaining path segments:
- Look up current speed for each segment from the Traffic Service
- Sum up \`segment_length / current_speed\` for all remaining segments
- Add estimated delay at intersections and traffic signals
- Apply ML correction factor based on historical patterns

### Map Matching

Raw GPS coordinates are noisy and may not fall exactly on a road. **Map matching** snaps GPS points to the most likely road segment using:
- Proximity to road segments
- Heading alignment with road direction
- Continuity with previous matched positions (Hidden Markov Model approach)
`,
    explanation: `## Wrap Up

### Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Map rendering | Pre-rendered vector tiles via CDN | Immutable content, cache-friendly, bandwidth-efficient |
| Tile storage | S3 + CDN (CloudFront) | Massive scale, pay-per-request, global distribution |
| Routing algorithm | Contraction Hierarchies | Sub-millisecond queries after offline preprocessing |
| Traffic ingestion | Kafka → Flink → Redis | High-throughput stream processing with low-latency reads |
| Navigation comms | WebSocket | Continuous bidirectional stream for GPS pings and ETA updates |
| Geocoding | Elasticsearch / custom index | Full-text search with geo-awareness |

### Key Tradeoffs

**Pre-rendered vs On-Demand Tiles**: Pre-rendering all tiles at all zoom levels is storage-intensive (~50 TB) but eliminates rendering latency. On-demand rendering saves storage but adds compute latency. The hybrid approach renders popular areas in advance and generates less-visited tiles on demand with caching.

**Contraction Hierarchies vs A***: A* is simpler but still too slow for continental routes (explores too many nodes). CH requires expensive preprocessing (hours) but answers queries in under a millisecond. The preprocessing cost is amortized across billions of queries.

**Traffic Freshness vs Accuracy**: Shorter aggregation windows (10 seconds) give fresher data but are noisier (fewer samples). Longer windows (5 minutes) are more stable but may miss sudden congestion. A 30-60 second sliding window with exponential decay balances these concerns.

### Scalability Path
- **Map tiles**: CDN absorbs virtually unlimited read traffic; storage scales with S3
- **Routing**: Shard road graph by geographic region; each server handles queries within its region
- **Traffic**: Kafka partitions by geographic grid; Flink scales horizontally
- **Navigation**: Stateless navigation servers (route state stored in Redis); scale by adding instances
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Map tiles should be served from CDN, not computed on the fly. Pre-render tiles at each zoom level and treat them as static assets with long cache TTLs and versioned URLs.',
      'Plain Dijkstra on a global road graph is far too slow for production. Use Contraction Hierarchies or similar precomputation techniques that trade offline preprocessing time for sub-millisecond online query performance.',
      'Traffic ingestion and navigation are separate concerns. Ingest GPS pings through a stream processing pipeline (Kafka + Flink) and expose aggregated segment speeds via a low-latency cache (Redis) that both routing and navigation services read from.',
    ],
  },
  {
    id: 9204,
    description: `## Clarifying Questions to Ask
- What is the expected **throughput** (messages per second)?
- What **delivery guarantee** is needed? At-most-once, at-least-once, or exactly-once?
- Do messages need to be **ordered**? Globally or per-partition?
- What is the average **message size**? Are there large messages (>1 MB)?
- How long should messages be **retained**? Hours, days, or indefinitely?
- Do we need **consumer groups** (multiple independent consumers)?

## Functional Requirements
- Producers can **publish messages** to named topics
- Topics are divided into **partitions** for parallelism
- Consumers within a **consumer group** each read from exclusive partitions
- Messages are **persisted durably** and retained for a configurable period
- Messages within a partition are **strictly ordered**
- Consumers can **replay** messages by resetting their offset

## Non-Functional Requirements
- **High throughput**: Handle millions of messages per second
- **Low latency**: End-to-end delivery in < 100ms (p99)
- **Durability**: No data loss once a message is acknowledged
- **Scalability**: Add partitions and brokers to scale horizontally
- **Fault tolerance**: Survive broker failures without data loss

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Messages/sec (write) | 1M messages/sec |
| Average message size | 1 KB |
| Write throughput | 1M * 1 KB = **1 GB/s** |
| Read throughput (3 consumer groups) | 3 GB/s |
| Replication factor | 3 → Write amplification: **3 GB/s** disk I/O |
| Retention period | 7 days |
| Storage required | 1 GB/s * 86,400 * 7 ≈ **600 TB** |
| Number of topics | ~10K |
| Partitions per topic (avg) | 10 → 100K total partitions |
| Brokers needed | ~50 (assuming 20 GB/s disk throughput each) |
`,
    examples: `## Follow-Up Discussion Points
- **How would you implement exactly-once delivery?** Use **idempotent producers** (each message gets a sequence number; brokers deduplicate) combined with **transactional writes** (atomic writes across multiple partitions). On the consumer side, commit offsets and processing results atomically in a single transaction.
- **How would you handle large messages (>1 MB)?** Two approaches: (1) Store large payloads in an object store (S3) and send a reference in the message. (2) Chunk the message into smaller pieces and reassemble on the consumer side. Option 1 is simpler and preferred.
- **What happens when a consumer is slower than producers?** The consumer falls behind (consumer lag increases). Options: scale out by adding more consumers to the group (up to partition count), increase partition count, or use backpressure to slow producers. Monitor consumer lag as a critical operational metric.
- **How would you migrate from ZooKeeper to Raft-based consensus?** This mirrors Kafka's KRaft migration. Run a mixed-mode cluster where the new Raft controller co-exists with ZooKeeper. Gradually migrate metadata management to Raft. Once complete, remove ZooKeeper dependency. The benefit is simpler operations and faster controller failover.
- **How would you support multi-tenancy?** Implement per-topic quotas (bytes/sec for produce and consume). Use resource isolation at the broker level (separate I/O threads per tenant). Apply ACLs for topic-level authorization. For strong isolation, dedicated broker pools per high-priority tenant.`,
    intuition: `A distributed message queue is fundamentally a **distributed commit log**. Each partition is an append-only, ordered sequence of messages — conceptually identical to a database write-ahead log (WAL). The power of this abstraction is that **producers only append** (sequential I/O, extremely fast) and **consumers only read forward** (tracking their offset position). This sequential access pattern is why Kafka achieves such high throughput despite writing to disk — sequential disk I/O can match or exceed random SSD I/O. The core design challenge is maintaining this simplicity while adding durability (replication), scalability (partitioning), and fault tolerance (leader election and consumer rebalancing).`,
    approach: `## Component Overview

**Producers** send messages to **Brokers**, which store messages in **partitioned topic logs**. Each partition has a **leader** broker that handles reads and writes, with **follower** replicas for durability. **Consumers** in consumer groups coordinate to distribute partitions among themselves. A **Coordination Service** (ZooKeeper or Raft-based) manages broker metadata, leader election, and consumer group coordination.

## API Design

| Endpoint / Operation | Type | Description |
|---------------------|------|-------------|
| \`produce(topic, partition_key, message)\` | Producer | Append message to topic; partition_key determines target partition |
| \`consume(topic, group_id, partition)\` | Consumer | Pull messages from assigned partition starting at current offset |
| \`commit_offset(topic, group_id, partition, offset)\` | Consumer | Persist consumer's progress position |
| \`create_topic(name, partitions, replication_factor)\` | Admin | Create a new topic with specified configuration |
| \`list_offsets(topic, partition, timestamp)\` | Consumer | Find the offset for a given timestamp (for replay) |

## Data Model

**Message Format**

| Field | Type | Notes |
|-------|------|-------|
| offset | BIGINT | Monotonically increasing per partition |
| timestamp | BIGINT | Producer-set or broker-set time |
| key | BYTES | Used for partition routing (hash) |
| value | BYTES | The message payload |
| headers | MAP | Optional key-value metadata |
| crc | INT | Checksum for data integrity |

**Topic Metadata**

| Field | Type | Notes |
|-------|------|-------|
| topic_name | VARCHAR | Unique topic identifier |
| partition_count | INT | Number of partitions |
| replication_factor | INT | Copies per partition |
| retention_ms | BIGINT | How long to keep messages |
| partition_assignments | MAP | partition_id → [leader_broker, follower_brokers] |

**Consumer Offset**

| Field | Type | Notes |
|-------|------|-------|
| group_id (PK) | VARCHAR | Consumer group identifier |
| topic (PK) | VARCHAR | Topic name |
| partition (PK) | INT | Partition number |
| committed_offset | BIGINT | Last committed offset |
| metadata | VARCHAR | Optional consumer metadata |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+  +----------+  +----------+
| Producer |  | Producer |  | Producer |
+----+-----+  +----+-----+  +----+-----+
     |              |              |
     +--------------+--------------+
                    |
                    v
          +---------+----------+
          | Load Balancer /    |
          | Partition Router   |
          | (hash(key) % N)   |
          +----+----------+----+
               |          |
    +----------v---+  +---v-----------+
    | Broker 1     |  | Broker 2      |
    |              |  |               |
    | Topic-A P0   |  | Topic-A P1    |
    | (Leader)     |  | (Leader)      |
    | Topic-A P1   |  | Topic-A P0    |
    | (Follower)   |  | (Follower)    |
    +---------+----+  +----+----------+
              |             |
              +------+------+
                     |
          +----------v----------+
          | Coordination        |
          | Service             |
          | (ZooKeeper / Raft)  |
          |                     |
          | - Broker registry   |
          | - Leader election   |
          | - Consumer groups   |
          | - Topic metadata    |
          +---------------------+
                     |
              +------+------+
              |             |
    +---------v----+  +-----v---------+
    | Consumer     |  | Consumer      |
    | Group A      |  | Group B       |
    |              |  |               |
    | C1: P0       |  | C1: P0, P1   |
    | C2: P1       |  |              |
    +--------------+  +--------------+
\`\`\`

## Partition Log Structure (On Disk)

\`\`\`
Topic-A, Partition 0:

Segment Files (each ~1 GB):
+------------------------------------------------------------+
| segment-00000000000000000000.log                           |
| +--------+--------+--------+--------+--------+--------+   |
| | msg 0  | msg 1  | msg 2  | msg 3  | ...    | msg N  |   |
| | off=0  | off=1  | off=2  | off=3  |        | off=N  |   |
| +--------+--------+--------+--------+--------+--------+   |
+------------------------------------------------------------+
| segment-00000000000000000000.index                         |
| Sparse index: offset -> file position                      |
| [0 -> 0, 100 -> 28491, 200 -> 57823, ...]                 |
+------------------------------------------------------------+
| segment-00000000000000000000.timeindex                     |
| Sparse index: timestamp -> offset                          |
| [1690000000 -> 0, 1690000060 -> 523, ...]                  |
+------------------------------------------------------------+

When segment exceeds size limit, roll to new segment:
+------------------------------------------------------------+
| segment-00000000000000052341.log                           |
| +--------+--------+--------+                               |
| | msg    | msg    | msg    | ...  (active segment)         |
| | off=   | off=   | off=   |                               |
| | 52341  | 52342  | 52343  |                               |
| +--------+--------+--------+                               |
+------------------------------------------------------------+
\`\`\`

## Replication Flow

\`\`\`
Producer        Leader (Broker 1)    Follower (Broker 2)   Follower (Broker 3)
   |                  |                     |                     |
   | produce(msg)     |                     |                     |
   |----------------->|                     |                     |
   |                  | Append to local log |                     |
   |                  |                     |                     |
   |                  |    Fetch request    |                     |
   |                  |<--------------------|                     |
   |                  | Return new messages |                     |
   |                  |-------------------->|                     |
   |                  |        Append       |                     |
   |                  |                     |                     |
   |                  |    Fetch request    |                     |
   |                  |<-----------------------------------------|
   |                  | Return new messages |                     |
   |                  |----------------------------------------->|
   |                  |                     |          Append     |
   |                  |                     |                     |
   |                  | All ISR caught up   |                     |
   |                  | -> advance HW       |                     |
   |                  | (High Watermark)    |                     |
   |                  |                     |                     |
   |     ACK          |                     |                     |
   |<-----------------|                     |                     |
\`\`\`

## Consumer Rebalancing

\`\`\`
Before: Consumer Group with C1, C2 consuming Topic-A (P0, P1, P2)

  C1 -> [P0, P1]     C2 -> [P2]

C3 joins the group:

  Coordinator detects membership change
  -> Trigger rebalance
  -> Revoke all partition assignments
  -> Reassign using round-robin or range strategy

After:
  C1 -> [P0]     C2 -> [P1]     C3 -> [P2]
\`\`\`
`,
    jsCode: `## Deep Dive: On-Disk Storage Design

### Write-Ahead Log (WAL) and Segment Files

Each partition is stored as a sequence of **segment files** on disk. The active segment receives new writes; older segments are immutable (read-only).

**Segment structure:**
- **Log file** (\`.log\`): Contains the actual messages, serialized contiguously
- **Offset index** (\`.index\`): Sparse mapping from message offset to byte position in the log file. Only every Nth offset is indexed (e.g., every 4 KB of data). To find a specific offset, binary search the index for the nearest entry, then scan forward.
- **Time index** (\`.timeindex\`): Sparse mapping from timestamp to offset. Enables time-based message lookup for consumer replay.

**Why sequential I/O matters:** Producers append to the end of the active segment (sequential write). Consumers read forward from their offset (sequential read). This access pattern achieves **600+ MB/s** on commodity disks, vastly exceeding the ~100 MB/s of random I/O. The OS page cache further accelerates reads — recently written data is served from memory without hitting disk.

### Zero-Copy Transfer

When a consumer fetches messages, the broker uses the \`sendfile()\` system call (zero-copy) to transfer data directly from the page cache to the network socket, bypassing user-space entirely. This eliminates two memory copies and dramatically reduces CPU usage and latency.

### Segment Cleanup

Two strategies for cleaning up old segments:
1. **Time-based retention**: Delete segments older than the retention period (e.g., 7 days)
2. **Size-based retention**: Delete oldest segments when total partition size exceeds a limit
3. **Compaction**: Keep only the latest message per key (useful for changelog topics)

## Deep Dive: Replication and Fault Tolerance

### Leader-Follower Replication

Each partition has exactly one **leader** and N-1 **followers** (where N is the replication factor). All produce and consume requests go to the leader. Followers continuously fetch data from the leader to stay in sync.

### In-Sync Replicas (ISR)

The ISR set contains all replicas that are fully caught up with the leader (within a configurable lag threshold). A message is considered **committed** only when all ISR members have it.

**High Watermark (HW)**: The offset up to which all ISR replicas have replicated. Consumers can only read up to the high watermark — this prevents reading uncommitted data that might be lost if the leader fails.

**ISR shrinking**: If a follower falls behind (network issue, slow disk), it is removed from the ISR. The leader can now commit messages with fewer replicas. When the follower catches up, it rejoins the ISR.

### Leader Election

When a leader broker fails:
1. The coordination service detects the failure (heartbeat timeout)
2. A new leader is elected from the ISR (the first replica in the ISR list)
3. Followers switch to fetching from the new leader
4. Producers and consumers discover the new leader via metadata refresh

**Unclean leader election**: If all ISR members are down, we can either wait (sacrificing availability) or elect an out-of-sync replica (risking data loss). This is a configurable trade-off.

## Deep Dive: Consumer Group Coordination

### Partition Assignment Strategies

**Range assignment**: Partitions are sorted and divided into contiguous ranges. Consumer 1 gets P0-P3, Consumer 2 gets P4-P7. Simple but can lead to uneven distribution across multiple topics.

**Round-robin assignment**: Partitions are distributed evenly in round-robin order. More balanced distribution, especially across multiple topics.

**Sticky assignment**: Like round-robin, but minimizes partition movement during rebalancing. If a consumer is already handling P2 and P5, it keeps those partitions when possible.

### Consumer Offset Management

Consumers periodically **commit** their current offset to indicate progress. This can be stored in:
- A special internal topic (\`__consumer_offsets\`, Kafka's approach)
- An external store (ZooKeeper, database)

**Auto-commit**: The client automatically commits offsets at a regular interval (e.g., every 5 seconds). Simple but can lead to duplicates if processing fails after commit.

**Manual commit**: The application explicitly commits after processing a batch. Provides at-least-once semantics when committed after processing.

## Deep Dive: Delivery Semantics

### At-Most-Once
- Commit offset **before** processing the message
- If the consumer crashes during processing, the message is skipped on restart
- No duplicates, but possible data loss

### At-Least-Once
- Commit offset **after** processing the message
- If the consumer crashes after processing but before committing, the message is reprocessed on restart
- No data loss, but possible duplicates
- Most common choice; consumers should be idempotent

### Exactly-Once
- Requires **idempotent producers** (broker deduplicates using producer ID + sequence number)
- Requires **transactional writes** for multi-partition atomic publishes
- Consumer must commit offset and processing result atomically (e.g., write to DB and commit offset in the same transaction)
- Highest complexity and some throughput cost
`,
    explanation: `## Wrap Up

### Architecture Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage model | Append-only segment files | Sequential I/O maximizes disk throughput |
| Replication | Leader-follower with ISR | Strong durability with configurable consistency |
| Partition assignment | Hash-based routing | Guarantees ordering per key |
| Consumer coordination | Consumer groups with rebalancing | Automatic load distribution |
| Metadata management | ZooKeeper or Raft (KRaft) | Proven consensus for leader election and config |
| Message delivery | Configurable (at-most/at-least/exactly-once) | Different workloads need different guarantees |

### Key Tradeoffs

**Ordering Scope**: Messages are ordered only within a single partition, not across partitions. Global ordering would require a single partition (no parallelism). The design trades global order for horizontal scalability — consumers can process partitions in parallel.

**Push vs Pull Consumers**: Pull-based consumers (Kafka model) let each consumer control its own pace, avoid overwhelming slow consumers, and enable batching. Push-based consumers (RabbitMQ model) provide lower latency but require flow control. For high-throughput, pull is preferred.

**Replication Factor vs Throughput**: Higher replication (e.g., RF=3) provides better durability but multiplies write I/O by 3x. For workloads where some data loss is acceptable (metrics, logs), RF=2 saves resources. For financial data, RF=3 with \`acks=all\` is essential.

**ZooKeeper vs Raft (KRaft)**: ZooKeeper is battle-tested but adds an external dependency. Raft-based metadata management (like Kafka's KRaft) simplifies deployment and enables faster controller failover. The industry is moving toward removing the ZooKeeper dependency.

### Scalability Path
- **100K msg/s**: A small cluster (3-5 brokers), moderate partition count
- **1M msg/s**: 20-50 brokers, partitions tuned to match consumer parallelism
- **10M msg/s**: 100+ brokers, tiered storage (hot data on SSD, cold data on object storage), multiple data centers with cross-cluster replication
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'The key to high throughput is sequential I/O. Append-only writes and forward-only reads exploit disk and OS page cache characteristics far better than random access patterns.',
      'Messages are ordered only within a single partition. If you need ordering for a specific entity (e.g., all events for user 123), use that entity ID as the partition key so all its messages land in the same partition.',
      'Understand the ISR (In-Sync Replicas) mechanism thoroughly. The high watermark determines what consumers can read, and ISR membership determines when the leader can acknowledge writes. This is the core of the durability guarantee.',
      'Consumer group rebalancing is a critical operational concern. Use sticky assignment to minimize partition movement, and ensure consumer processing is idempotent to handle the duplicates that rebalancing can cause.',
    ],
  },
];
