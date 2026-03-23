import { ProblemSolution } from './types';

export const sdiVol2M2: ProblemSolution[] = [
  {
    id: 9205,
    description: `## Clarifying Questions to Ask
- What types of **metrics** do we need to monitor? (CPU, memory, disk I/O, network, QPS, error rates, business metrics?)
- What is the **scale**? How many servers/services are generating metrics?
- What is the required **data retention** period? (7 days at full resolution, 1 year downsampled?)
- What **alerting** capabilities are needed? (Threshold-based, anomaly detection, composite alerts?)
- Do we need a **query language** for ad-hoc exploration, or just pre-built dashboards?
- What is the acceptable **alert latency**? (Seconds vs minutes from metric emission to alert firing?)

## Functional Requirements
- **Collect** infrastructure and application metrics from thousands of servers
- **Store** time-series data efficiently with configurable retention policies
- **Visualize** metrics on dashboards with graphs, heatmaps, and tables
- **Alert** operators when metrics cross defined thresholds or exhibit anomalies
- Support **ad-hoc queries** over historical metric data

## Non-Functional Requirements
- **High write throughput**: Handle 10M+ data points per second ingestion
- **Low query latency**: Dashboard queries return in < 1 second
- **High availability**: Monitoring must stay up even when the systems it monitors are failing
- **Scalable storage**: Store 100M+ active time series with months of history
- **Durable**: No data loss for critical alerting metrics

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Monitored servers | 200,000 |
| Metrics per server | ~500 (CPU, mem, disk, net, app metrics) |
| Active time series | 200K × 500 = **100M** |
| Collection interval | 10 seconds |
| Data points / sec | 100M / 10 = **10M data points/sec** |
| Bytes per data point | ~16 bytes (8B timestamp + 8B float value) |
| Raw ingestion rate | 10M × 16B = **160 MB/sec** |
| Daily raw storage | 160 MB/s × 86,400 = **~13.5 TB/day** |
| After compression (10:1) | **~1.35 TB/day** |
| 1-year retention (downsampled) | ~50 TB |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle metric cardinality explosion?** Tag combinations can create millions of unique series. Enforce cardinality limits per metric name, reject series that exceed thresholds, and provide tooling for operators to identify high-cardinality offenders.
- **Pull vs push model trade-offs?** Pull (Prometheus-style) is simpler for service discovery and avoids overloading the collector, but push (StatsD/Telegraf-style) works better when services are behind firewalls or are short-lived (serverless, batch jobs). A hybrid approach supports both.
- **How would you support multi-region monitoring?** Deploy collection and storage per region. Use a global query layer that fans out to regional stores. Alerting runs locally per region to avoid cross-region latency affecting alert speed.
- **How do you avoid alert storms?** Implement alert grouping (batch related alerts), inhibition (suppress dependent alerts when a root cause fires), and silencing (mute during maintenance windows). Model alert dependencies to reduce noise.
- **How would you migrate from one TSDB to another?** Dual-write during the migration window. Validate query results match between old and new stores. Gradually shift dashboard queries to the new backend.`,
    intuition: `A metrics monitoring system is fundamentally a **high-throughput time-series data pipeline**. The central insight is that time-series data has unique properties that enable specialized storage: it is append-only, almost always written and queried in time order, and older data can be aggressively downsampled without losing operational value. This means a general-purpose database is the wrong choice — you need a time-series database optimized for sequential writes, time-range scans, and multi-resolution storage. The architecture naturally splits into four concerns: **collection** (getting data in), **storage** (keeping it efficiently), **querying** (getting it out fast), and **alerting** (acting on it in real time).`,
    approach: `## Component Overview

The system has four major layers: a **metrics collection** layer using agents on each host that push data to a central ingestion service, a **message queue** (Kafka) for buffering and decoupling, a **time-series database** for persistent storage with downsampling, and a **query/alerting** layer that serves dashboards and evaluates alert rules.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/metrics\` | Ingest | Body: \`{ metric, tags, timestamp, value }\` batch payload |
| \`GET /api/v1/query\` | Query | Params: \`metric, tags, start, end, aggregation, step\` |
| \`POST /api/v1/alerts/rules\` | Create Alert | Body: \`{ metric, condition, threshold, duration, notify }\` |
| \`GET /api/v1/alerts/active\` | List Alerts | Returns currently firing alerts |
| \`POST /api/v1/dashboards\` | Create Dashboard | Body: \`{ name, panels: [{ query, vizType }] }\` |

## Data Model

### Time-Series Data Point
| Field | Type | Notes |
|-------|------|-------|
| metric_name | STRING | e.g., \`cpu.usage\`, \`http.request.count\` |
| tags | MAP<STRING, STRING> | e.g., \`{host: "web-01", region: "us-east"}\` |
| timestamp | INT64 | Unix epoch in milliseconds |
| value | FLOAT64 | The metric value |

### Alert Rule
| Field | Type | Notes |
|-------|------|-------|
| rule_id (PK) | UUID | Unique identifier |
| metric_name | STRING | Metric to evaluate |
| tag_filters | MAP | Tag conditions to match |
| condition | ENUM | GT, LT, EQ, RATE_CHANGE |
| threshold | FLOAT64 | Trigger value |
| for_duration | INT | Seconds condition must hold before firing |
| notification_channels | LIST | Email, Slack, PagerDuty targets |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    N0["Host A"]
    N1["Host B"]
    N2["Host C"]
    N3["Metrics Agent"]
    N4["Collection Svc"]
    N5["Kafka Cluster"]
    N6[("TSDB Writers")]
    N7["Alerting Service"]
    N8["Stream Aggregator"]
    N9[("Time-Series DB")]
    N10["Pre-computed Rollups"]
    N11["Query Service"]
    N12["Dashboard UI (Grafana)"]
    N0 --> N3
    N1 --> N3
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N5 --> N7
    N5 --> N8
    N6 --> N9
    N8 --> N10
    N9 --> N11
    N10 --> N11
    N11 --> N12
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N10 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N11 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N12 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

## Data Ingestion Flow

\`\`\`mermaid
graph TD
    N0["Ad Server A"]
    N1["Ad Server B"]
    N2["Ad Server C"]
    N3[("Click events")]
    N4[("Kafka Cluster")]
    N5["Real-Time Path (Flink)"]
    N6["Batch Path"]
    N7[("Aggregation DB")]
    N8["Query Service"]
    N9["Advertiser Dashboard"]
    N0 --> N3
    N1 --> N3
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N4 --> N6
    N5 --> N7
    N6 --> N7
    N7 --> N8
    N8 --> N9
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

## Alerting Evaluation Flow

\`\`\`mermaid
graph TD
    N0["Browser / Mobile"]
    N1["CDN"]
    N2[("Static Assets (S3)")]
    N3["API Gateway"]
    N4["Hotel Service"]
    N5["Payment Service"]
    N6[("Hotel DB")]
    N7[("Reservation DB")]
    N8[("Payment DB")]
    N9["Notification Service"]
    N0 --> N1
    N0 --> N3
    N1 --> N2
    N3 --> N4
    N3 --> N5
    N4 --> N6
    N4 --> N7
    N5 --> N8
    N4 --> N9
    N5 --> N9
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`
`,
    jsCode: `## Deep Dive: Time-Series Database Storage Engine

### Why Not a General-Purpose Database?

Time-series workloads have a unique access pattern: **writes are always appended at the current time** and **reads almost always scan a contiguous time range**. General-purpose databases waste cycles on features like random-write optimization, full ACID transactions, and row-level locking that TSDB workloads do not need. A purpose-built engine can be 10-100x more efficient.

### LSM-Tree Optimized for Time

\`\`\`mermaid
graph TD
    N0["External Mail"]
    N1["SMTP Receiver"]
    N2["Processing Pipeline"]
    N3[("Email Body Store")]
    N4["Search Index (ES)"]
    N5["Push / WS Service"]
    N6["User (Web / Mobile)"]
    N7["API Server (Compose)"]
    N8["Send Queue (Kafka)"]
    N9["SMTP Sender"]
    N10["API Server (REST/IMAP)"]
    N11[("Metadata DB")]
    N12[("Object Storage")]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N2 --> N4
    N2 --> N11
    N2 --> N5
    N6 --> N7
    N6 --> N10
    N7 --> N8
    N8 --> N9
    N10 --> N11
    N10 --> N12
    N5 --> N6
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N8 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N9 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N10 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N11 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N12 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

The key optimization is **time-based partitioning**: data is sharded into fixed time blocks (e.g., 2-hour blocks). This means queries for a time range only need to open the relevant block files, and old data can be deleted by simply dropping entire block files rather than scanning and deleting individual rows.

### Compression Techniques for Time-Series

Time-series data compresses extremely well because consecutive values are highly correlated:

| Technique | Applies To | How It Works | Compression Ratio |
|-----------|-----------|--------------|-------------------|
| Delta-of-delta | Timestamps | Store difference of differences (usually 0 for regular intervals) | 20:1 |
| XOR encoding | Float values | XOR consecutive values, leading zeros compress well | 8:1 |
| Dictionary encoding | Tag values | Map repeated strings to small integers | 10:1 |
| Run-length encoding | Repeated values | Store value + count for constant metrics | 50:1+ |

### Downsampling Strategy

Raw data at 10-second resolution is expensive to store and query over long time ranges. Downsampling reduces storage and query cost:

\`\`\`mermaid
graph TD
    N0["Client (SDK / CLI)"]
    N1["API Gateway"]
    N2[("Metadata Service")]
    N3["GC Service"]
    N4[("Storage Node")]
    N5["Data File 1"]
    N6["Data File 2"]
    N7["Checksum Index"]
    N0 --> N1
    N1 --> N2
    N1 --> N4
    N4 --> N5
    N4 --> N6
    N4 --> N7
    N3 --> N2
    N3 --> N4
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N6 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N7 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

For each downsampled interval, store multiple aggregates: **min, max, avg, sum, count**. This lets dashboards show accurate graphs at any zoom level. Downsampling runs as a background job after the retention window for the higher-resolution tier expires.

### Alert Rules Engine

The alerting service evaluates rules in a streaming fashion:

\`\`\`mermaid
graph TD
    N0["Rule Evaluator"]
    N1["State Machine"]
    N2["Notification Router"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

Each alert rule has a finite state machine per matching time series. The **PENDING** state prevents spurious alerts from momentary spikes. The **RESOLVED** state sends a recovery notification. Grouping, inhibition, and silencing are handled by the notification router to prevent alert fatigue.

### Query Optimization

Dashboard queries often aggregate across many series (e.g., "average CPU across all hosts in us-east"). Optimizations include:

- **Pre-aggregated rollups**: At write time, maintain aggregate series (e.g., \`cpu.usage.avg{region="us-east"}\`) so dashboards do not need to fan out to thousands of individual series
- **Query result caching**: Cache rendered time ranges; only fetch the delta since the last query
- **Parallel fan-out**: Partition the query across time blocks and series shards, then merge results
- **Approximate queries**: Use sketches (HyperLogLog, t-digest) for cardinality and percentile queries on high-cardinality data
`,
    explanation: `## Wrap Up

### Key Design Decisions
1. **Kafka as a buffer** between collection and storage decouples ingestion from write speed, handles burst traffic, and enables multiple consumers (TSDB writers, alerting, stream aggregation) from a single data stream
2. **Time-series database** instead of a general-purpose DB exploits the append-only, time-ordered nature of metrics for 10-100x better write throughput and storage efficiency
3. **Downsampling** trades precision for storage efficiency on older data, keeping queries fast even over long time ranges
4. **Push-based collection with pull fallback** covers both long-running services and ephemeral workloads
5. **Streaming alert evaluation** directly from Kafka gives sub-minute alert latency without depending on the query path

### Scalability Bottlenecks & Mitigations
- **Write hot spots**: Partition by metric name hash across Kafka partitions and TSDB shards so no single node handles disproportionate load
- **High-cardinality tags**: Enforce cardinality limits and reject metric series that exceed per-metric thresholds
- **Query fan-out**: Pre-computed rollups and caching reduce the number of series scanned at query time
- **Alert evaluation at scale**: Shard alert rules across evaluator nodes by rule hash; each evaluator only handles a subset of rules

### Trade-Offs
| Decision | Advantage | Disadvantage |
|----------|-----------|--------------|
| Custom TSDB vs off-the-shelf | Tailored to workload | High engineering cost |
| Push vs pull collection | Works behind firewalls | Risk of overloading collector |
| Kafka buffering | Decouples, handles bursts | Adds latency (seconds) |
| Downsampling | Saves storage + speeds queries | Loses granularity for old data |
| Pre-computed rollups | Fast dashboard queries | Additional write amplification |
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Do not use a relational database as the primary metric store — time-series workloads need append-optimized storage with time-based partitioning, not row-level ACID transactions.',
      'Always buffer ingestion through a message queue like Kafka — writing directly to the TSDB creates tight coupling and makes burst traffic dangerous.',
      'Downsampling must preserve multiple aggregates (min, max, avg, sum, count) per interval — storing only the average destroys the ability to show peaks and valleys on dashboards.',
      'Alert evaluation needs a state machine with a PENDING phase — firing an alert the instant a threshold is crossed will cause alert storms from momentary spikes.'
    ]
  },
  {
    id: 9206,
    description: `## Clarifying Questions to Ask
- What is the **click volume**? How many ad clicks per day?
- What **aggregation granularity** is needed? (Per minute, per hour, per ad, per campaign?)
- What is the acceptable **latency** for aggregated results to appear? (Real-time vs minutes vs hours?)
- Do we need **exactly-once** counting for billing, or is approximate acceptable for analytics?
- How do we handle **late-arriving events** and **duplicate clicks**?
- What downstream systems consume the aggregated data? (Billing, advertiser dashboards, fraud detection?)

## Functional Requirements
- Count ad clicks and aggregate by \`ad_id\` in real-time for billing and analytics
- Support multiple **aggregation windows**: 1-minute, 1-hour, 1-day
- Support **filtering** by attributes: country, device, OS
- Provide a **reconciliation** mechanism to ensure real-time and batch counts converge
- Expose aggregated data via query APIs for advertiser dashboards

## Non-Functional Requirements
- **Exactly-once semantics**: Every click must be counted exactly once for billing accuracy
- **Low latency**: Aggregated counts available within minutes of the click event
- **High throughput**: Handle 10K+ clicks per second sustained, with burst to 50K/sec
- **Fault tolerant**: No data loss on node failure; automatic recovery
- **Scalable**: Handle 10x growth without architectural changes

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Ad clicks / day | **1 Billion** |
| Average click QPS | 1B / 86,400 ≈ **11,600 QPS** |
| Peak click QPS | ~5x average ≈ **50,000 QPS** |
| Click event size | ~500 bytes (ad_id, user_id, timestamp, IP, device, geo) |
| Raw data / day | 1B × 500B = **500 GB/day** |
| Raw data / year | **~180 TB/year** |
| Unique ads | ~2 million active ads |
| Aggregated records / day | 2M ads × 1,440 minutes ≈ **2.9B** rows (1-min granularity) |
`,
    examples: `## Follow-Up Discussion Points
- **How would you detect click fraud?** Build a fraud detection pipeline that analyzes click patterns: rapid repeated clicks from same IP, bot signatures in user-agent, abnormal geographic patterns, click-through rate anomalies. Flag suspicious clicks before they enter the billing aggregation.
- **How would you support real-time bidding (RTB) analytics?** Extend the stream processing to compute bid win rates, cost per click, and conversion attribution in real-time. Use enrichment joins against campaign metadata.
- **What if the Flink cluster goes down?** Flink checkpoints state to durable storage (S3/HDFS) at regular intervals. On restart, it recovers from the latest checkpoint and replays events from Kafka (which retains events for days). This provides exactly-once recovery.
- **How would you handle a 10x spike during a Super Bowl ad?** Kafka absorbs the spike as a buffer. Auto-scale the Flink task managers based on consumer lag. The aggregation DB handles writes well since they are partitioned by ad_id.
- **Lambda vs Kappa architecture?** Lambda runs both a batch and stream path, using batch as the source of truth for reconciliation. Kappa uses only stream processing, replaying from Kafka when corrections are needed. Kappa is simpler to maintain but harder to debug discrepancies.`,
    intuition: `Ad click aggregation is fundamentally a **distributed streaming count problem** with a billing constraint: every click must be counted **exactly once**. The core tension is between **speed** (advertisers want real-time dashboards) and **accuracy** (billing requires precise counts). The solution is a dual-path architecture: a **real-time stream processing path** for low-latency approximate counts, and a **batch reconciliation path** to verify and correct the real-time numbers. The stream processor must handle deduplication, late events, and exactly-once semantics through checkpointing and idempotent writes.`,
    approach: `## Component Overview

Raw click events flow into **Kafka** as the central event bus. A **stream processing engine** (Apache Flink) consumes these events, deduplicates them, and aggregates counts into **tumbling windows** (1-minute, 1-hour). Aggregated results are written to an **OLAP database** (ClickHouse or Druid). A separate **batch reconciliation** job (Spark/MapReduce) runs hourly on the raw event log to produce ground-truth counts, which are compared against the streaming results.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/clicks\` | Record | Body: \`{ ad_id, user_id, timestamp, ip, device, geo }\` |
| \`GET /api/v1/aggregation\` | Query | Params: \`ad_id, start, end, granularity, filters\` |
| \`GET /api/v1/aggregation/top\` | Top-N | Params: \`metric, start, end, limit\` returns top ads by clicks |
| \`GET /api/v1/reconciliation/:date\` | Recon | Returns discrepancies between real-time and batch counts |

## Data Model

### Raw Click Event (in Kafka)
| Field | Type | Notes |
|-------|------|-------|
| click_id | UUID | Globally unique, for deduplication |
| ad_id | BIGINT | The ad that was clicked |
| user_id | BIGINT | Clicker (nullable for anonymous) |
| timestamp | INT64 | Event time in ms |
| ip_address | STRING | For fraud detection |
| country | STRING | Derived from IP |
| device_type | ENUM | Mobile, Desktop, Tablet |
| os | STRING | iOS, Android, Windows, etc. |

### Aggregated Click Count (in OLAP DB)
| Field | Type | Notes |
|-------|------|-------|
| ad_id | BIGINT | Partition key |
| window_start | TIMESTAMP | Start of aggregation window |
| window_size | ENUM | 1_MIN, 1_HOUR, 1_DAY |
| click_count | BIGINT | Aggregated count |
| country | STRING | Dimension for slicing |
| device_type | ENUM | Dimension for slicing |
| updated_at | TIMESTAMP | Last update time |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    A1["Ad Server A"]
    A2["Ad Server B"]
    A3["Ad Server C"]
    Kafka["Kafka Cluster (click_events topic)"]
    RT["Real-Time Path<br/>Apache Flink<br/>Dedup, Windowed aggregation, Exactly-once"]
    Batch["Batch Path<br/>Raw events archived to S3<br/>Hourly Spark MapReduce job"]
    AggDB["Aggregation DB (ClickHouse / Druid)"]
    Recon["Reconciliation Service (compare and fix)"]
    Query["Query Service"]
    Dash["Advertiser Dashboard"]

    A1 -->|"Click events"| Kafka
    A2 -->|"Click events"| Kafka
    A3 -->|"Click events"| Kafka
    Kafka --> RT
    Kafka --> Batch
    RT --> AggDB
    Batch --> Recon
    Recon --> AggDB
    AggDB --> Query
    Query --> Dash

    style A1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style A2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style A3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style Kafka fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style RT fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Batch fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style AggDB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Recon fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Query fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Dash fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

## Real-Time Aggregation Flow

\`\`\`mermaid
sequenceDiagram
    participant AS as Ad Server
    participant K as Kafka
    participant F as Flink
    participant DB as Aggregation DB

    AS->>K: Click event
    K->>F: Consume
    Note over F: 1. Dedup by click_id (bloom filter + Redis)
    Note over F: 2. Assign to tumbling window (1 min)
    Note over F: 3. Aggregate by (ad_id, country, device)
    Note over F: 4. Window closes
    F->>DB: Emit result
    Note over DB: UPSERT into aggregation table
    Note over F: 5. Checkpoint to S3
\`\`\`

## Batch Reconciliation Flow

\`\`\`mermaid
sequenceDiagram
    participant S3 as S3 (Raw Logs)
    participant Spark as Spark Job
    participant Recon as Recon Service
    participant DB as Aggregation DB

    S3->>Spark: Read day's raw events
    Note over Spark: MapReduce:<br/>Map: (ad_id, 1)<br/>Reduce: SUM
    Spark->>Recon: Batch counts
    Recon->>DB: Fetch streaming counts
    DB-->>Recon: Streaming counts
    Note over Recon: Compare: |batch - stream| > threshold?
    Note over Recon: If mismatch: update with batch counts (source of truth)
    Recon->>DB: Update corrected counts
\`\`\`
`,
    jsCode: `## Deep Dive: Stream Processing and Exactly-Once Semantics

### Aggregation Window Types

Stream processing must group events into finite windows for aggregation. The choice of window type affects latency, accuracy, and complexity:

\`\`\`mermaid
graph TD
    subgraph Tumbling["Tumbling Window (fixed, non-overlapping)"]
        TW1["Window 1: 0:00-1:00"]
        TW2["Window 2: 1:00-2:00"]
        TW3["Window 3: 2:00-3:00"]
        TW1 --> TW2 --> TW3
        TN["Events counted independently per window"]
        TU["Used for: billing counts per minute"]
    end
    subgraph Sliding["Sliding Window (fixed size, moves continuously)"]
        SW1["Window A"]
        SW2["Window B (overlaps A)"]
        SW3["Window C (overlaps B)"]
        SN["Events appear in multiple windows"]
        SU["Used for: moving averages"]
    end
    subgraph Session["Session Window (gap-based)"]
        SS1["Session 1 (events close together)"]
        GAP["--- gap ---"]
        SS2["Session 2 (events close together)"]
        SS1 --- GAP --- SS2
        SU2["Used for: user session analytics"]
    end

    style TW1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style TW2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style TW3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style TN fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style TU fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style SW1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style SW2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style SW3 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style SN fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style SU fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style SS1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style GAP fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style SS2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style SU2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

For ad click billing, **tumbling windows** are the right choice — they produce non-overlapping, deterministic counts that can be reconciled against batch.

### Exactly-Once Semantics in Flink

Achieving exactly-once counting requires coordination across three boundaries:

\`\`\`mermaid
graph TD
    N0["Consumer offsets"]
    N1["Operator state"]
    N2["Output records"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

**How Flink checkpointing works**: Flink periodically injects checkpoint barriers into the data stream. When an operator receives a barrier, it snapshots its current state (e.g., running click counts) to durable storage (S3/HDFS). If a failure occurs, Flink rolls back all operators to the last successful checkpoint and replays events from Kafka starting at the committed offsets. The sink must use **idempotent writes** (UPSERT by \`ad_id + window_start\`) so that replayed events do not produce duplicate counts.

### Deduplication Strategy

Users may click the same ad multiple times accidentally, or network retries may produce duplicate click events. Deduplication happens at two levels:

\`\`\`mermaid
graph TD
    N0["Bloom Filter (in-memory)"]
    N1["Redis Exact Check"]
    N0 --> N1
    style N0 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

### Handling Late-Arriving Events (Watermarking)

Events can arrive out of order due to network delays. Watermarks tell the system "all events up to time T have likely arrived":

\`\`\`mermaid
graph LR
    E1["E1 (10:00:01)"] --> E3["E3 (10:00:03)"]
    E3 --> E2["E2 (10:00:02)"]
    E2 --> E15["E15 (10:00:15)"]
    E15 --> E5["E5 (10:00:05)"]
    WM["Watermark: 10:00:10 (5 sec allowed lateness)"]
    E5 -.->|"Late but within window → counted"| WM

    subgraph LatePolicy["Events after allowed lateness"]
        OA["Option A: Drop (simple, loses data)"]
        OB["Option B: Route to late events side output"]
        OC["Option C: Update previously emitted results"]
    end

    style E1 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style E3 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style E2 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style E15 fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style E5 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style WM fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style OA fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style OB fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style OC fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

For billing accuracy, **Option B** is preferred — late events are captured in the batch path which serves as the source of truth.

### MapReduce Batch Aggregation

The batch path runs periodically on the complete raw event log:

\`\`\`mermaid
graph TD
    N0[("Map Phase: raw events from S3")]
    N1["Shuffle Phase: Group by ad_id"]
    N2["Reduce Phase: SUM counts"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

This produces the ground-truth count because it processes the **complete** dataset, not a stream. The reconciliation service compares batch vs real-time counts and overwrites the real-time result when discrepancies exceed a configurable threshold (e.g., > 0.1% difference).

### Data Reconciliation

\`\`\`mermaid
graph TD
    N0["Real-Time Counts"]
    N1["Batch Counts"]
    N2["Reconciliation Service"]
    N0 --> N2
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`
`,
    explanation: `## Wrap Up

### Key Design Decisions
1. **Kafka as the central event bus** decouples click producers from consumers and provides replay capability for exactly-once recovery
2. **Apache Flink for stream processing** provides native exactly-once semantics via distributed checkpointing, eliminating the need for custom dedup infrastructure at the processing layer
3. **Tumbling windows for aggregation** produce non-overlapping counts that are deterministic and reconcilable against batch results
4. **Dual real-time + batch paths (Lambda architecture)** balances low-latency visibility with billing-grade accuracy
5. **Idempotent UPSERT writes to the aggregation DB** ensure that checkpoint recovery and event replay never produce double-counted results

### Scalability Bottlenecks & Mitigations
- **Kafka throughput**: Partition the click_events topic by ad_id hash across hundreds of partitions for parallel consumption
- **Flink state size**: For deduplication, use a Bloom filter for the hot path and offload exact checks to Redis with TTL-based cleanup
- **Aggregation DB writes**: Batch writes from Flink and use columnar OLAP stores (ClickHouse/Druid) which are optimized for high-volume append-heavy workloads
- **Late events**: Set a watermark-based allowed lateness window; events beyond this go to the batch reconciliation path

### Trade-Offs
| Decision | Advantage | Disadvantage |
|----------|-----------|--------------|
| Lambda (dual path) | Accurate billing + real-time dashboards | Two codepaths to maintain and debug |
| Kappa (stream only) | Simpler single path | Harder to guarantee billing accuracy |
| Tumbling vs sliding windows | Deterministic, reconcilable | Cannot compute moving averages |
| Bloom filter dedup | Memory-efficient, fast | Small false positive rate (drops valid clicks) |
| Flink checkpointing | Exactly-once without external coordination | Checkpoint intervals add end-to-end latency |
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Do not attempt to count clicks using a simple database counter with transactions — at 10K clicks/sec, row-level locking will create massive contention and the database will not keep up.',
      'Exactly-once semantics require end-to-end coordination: Kafka consumer offsets, Flink operator state, and DB writes must all be committed atomically via checkpointing and idempotent sinks.',
      'Always include a batch reconciliation path — streaming systems can drift due to late events, checkpoint recovery edge cases, or bugs, and billing counts must be provably correct.',
      'Watermarks must account for real-world clock skew and network delays — setting the allowed lateness too low drops legitimate events, too high delays window emission and increases state size.'
    ]
  },
  {
    id: 9207,
    description: `## Clarifying Questions to Ask
- What is the **scale**? How many hotels and rooms? How many reservations per day?
- Do we need to support **overbooking**? (Hotels commonly sell 110% of capacity)
- Is this a **single hotel chain** or a marketplace aggregating many providers?
- What **payment** flow is required? (Reserve first, charge later? Or immediate charge?)
- Do we need to handle **cancellations and refunds**?
- What is the **concurrency** level? How many users might try to book the same room simultaneously?

## Functional Requirements
- Users can **search** for available hotels by location, date range, and guest count
- Users can **view** hotel details including room types, prices, and amenities
- Users can **reserve** a specific room type for given dates
- The system must **prevent double-booking** — no two guests can book the same room for overlapping dates
- Support **cancellations** with configurable refund policies
- Hotel managers can **manage** room inventory and pricing

## Non-Functional Requirements
- **Strong consistency**: A room must never be double-booked (favor CP over AP for reservations)
- **High availability** for search and browse (eventual consistency acceptable)
- **Low latency**: Search < 200ms, reservation confirmation < 1 second
- **Idempotent** reservation API to handle retries safely

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total hotels | 500,000 |
| Avg rooms per hotel | 100 |
| Total rooms | 50 million |
| Reservations / day | **500,000** |
| Reservation QPS | 500K / 86,400 ≈ **6 QPS** |
| Peak reservation QPS | ~30 QPS |
| Search QPS | ~300 QPS (50:1 read-to-write ratio) |
| Average stay | 3 nights |
| Reservation record size | ~500 bytes |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle flash sales or event-driven demand spikes?** When a popular event is announced, thousands of users may try to book the same hotel. Use a queue-based reservation flow where requests are serialized per hotel. Display real-time availability estimates but confirm only after the reservation is committed.
- **How would you support dynamic pricing?** Maintain a pricing service that adjusts rates based on demand signals (occupancy rate, day of week, events, competitor pricing). Price is locked at the time the reservation is created, not at search time.
- **How would you expand to a multi-region deployment?** Partition data by geographic region. Each region has its own reservation database to keep consistency local. Cross-region searches aggregate results but reservations are always handled by the region that owns the hotel.
- **How would you handle group bookings (10+ rooms)?** Treat group bookings as a batch reservation with a two-phase commit: tentatively hold all rooms, then confirm or release after payment. Use a longer hold timeout (e.g., 24 hours) for group bookings.
- **What about integrating with external booking platforms (Booking.com, Expedia)?** Use a channel manager service that syncs inventory across platforms via their APIs. The reservation service is the single source of truth; external platforms get real-time availability updates via webhooks.`,
    intuition: `A hotel reservation system is fundamentally a **distributed inventory management problem** with a critical constraint: the same room-night must never be sold twice. Unlike high-throughput systems like ad click counting, the reservation QPS is quite low (~6 QPS average), so the challenge is not raw throughput but **correctness under concurrency**. The solution centers on choosing the right concurrency control mechanism — **pessimistic locking** (SELECT FOR UPDATE) for simplicity and strong guarantees, or **optimistic locking** (version column) for better performance when conflicts are rare. Since hotel reservations involve money, a relational database with ACID transactions is the natural choice over NoSQL.`,
    approach: `## Component Overview

A **CDN** serves static hotel images and listing pages. An **API Gateway** routes requests to microservices. The **Hotel Service** handles search and hotel details (read-heavy, can use caching). The **Reservation Service** handles booking with strict concurrency control using a **relational database** (PostgreSQL/MySQL) for ACID guarantees. The **Payment Service** integrates with payment processors. A **Notification Service** sends booking confirmations.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/hotels/search\` | Search | Params: \`location, checkIn, checkOut, guests, page\` |
| \`GET /api/v1/hotels/:id\` | Detail | Returns hotel info, room types, availability |
| \`POST /api/v1/reservations\` | Reserve | Body: \`{ hotelId, roomTypeId, checkIn, checkOut, guestInfo, idempotencyKey }\` |
| \`DELETE /api/v1/reservations/:id\` | Cancel | Cancels reservation, triggers refund policy |
| \`PUT /api/v1/hotels/:id/inventory\` | Manage | Hotel manager updates room count and pricing |

## Data Model

### Hotel
| Column | Type | Notes |
|--------|------|-------|
| hotel_id (PK) | BIGINT | Auto-increment |
| name | VARCHAR | Hotel name |
| address | TEXT | Full address |
| city | VARCHAR | For search indexing |
| latitude | DECIMAL | Geo search |
| longitude | DECIMAL | Geo search |
| star_rating | INT | 1-5 |

### Room Type
| Column | Type | Notes |
|--------|------|-------|
| room_type_id (PK) | BIGINT | Auto-increment |
| hotel_id (FK) | BIGINT | References Hotel |
| name | VARCHAR | e.g., "Deluxe King" |
| total_inventory | INT | Total rooms of this type |
| overbooking_factor | DECIMAL | e.g., 1.10 for 10% overbooking |
| price_per_night | DECIMAL | Base price |

### Room Inventory (Availability Ledger)
| Column | Type | Notes |
|--------|------|-------|
| room_type_id (FK) | BIGINT | References Room Type |
| date | DATE | Specific calendar date |
| total_rooms | INT | Available inventory for this date |
| reserved_rooms | INT | Currently booked count |
| version | INT | For optimistic locking |
| PRIMARY KEY | | (room_type_id, date) |

### Reservation
| Column | Type | Notes |
|--------|------|-------|
| reservation_id (PK) | BIGINT | Auto-increment |
| hotel_id (FK) | BIGINT | References Hotel |
| room_type_id (FK) | BIGINT | References Room Type |
| guest_id (FK) | BIGINT | References User |
| check_in | DATE | Start date |
| check_out | DATE | End date |
| status | ENUM | PENDING, CONFIRMED, CANCELLED |
| idempotency_key | VARCHAR(UUID) | Unique per booking attempt |
| created_at | TIMESTAMP | Booking time |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    Client["Browser / Mobile Client"]
    CDN["CDN (Images, Listings)"]
    Static["Static Assets (S3 / CloudFront)"]
    GW["API Gateway (Auth, Rate Limit, Routing)"]
    Hotel["Hotel Service (Search, Detail)"]
    Res["Reservation Service (Book / Cancel, Concurrency Ctrl)"]
    Pay["Payment Service (Charge / Refund via Stripe)"]
    HotelDB["Hotel DB (Read Replica + Redis Cache)"]
    ResDB["Reservation DB (PostgreSQL, ACID, Locking)"]
    PayDB["Payment DB (PostgreSQL, Txn records)"]
    Notif["Notification Service (Email / SMS)"]

    Client --> CDN
    CDN --> Static
    Client -->|"API calls"| GW
    GW --> Hotel
    GW --> Res
    GW --> Pay
    Hotel --> HotelDB
    Res --> ResDB
    Pay --> PayDB
    ResDB --> Notif

    style Client fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style CDN fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style Static fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style Hotel fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Res fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Pay fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style HotelDB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style ResDB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style PayDB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Notif fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

## Reservation Flow (Optimistic Locking)

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant RS as Reservation Svc
    participant DB as DB (PostgreSQL)

    C->>GW: POST /reservations {idempotencyKey}
    GW->>RS: Forward request
    RS->>DB: BEGIN TRANSACTION
    RS->>DB: SELECT reserved, total, version FROM room_inventory WHERE room_type_id AND date IN (...)
    DB-->>RS: Inventory rows
    Note over RS: Check: reserved < total * overbook factor for ALL dates?
    RS->>DB: UPDATE inventory SET reserved += 1, version += 1 WHERE version = old_version
    Note over RS: rows affected = 0? RETRY (conflict)
    RS->>DB: INSERT reservation
    RS->>DB: COMMIT
    RS-->>GW: Success
    GW-->>C: 200 OK {res_id}
\`\`\`

## Pessimistic Locking Alternative

\`\`\`
-- Instead of version-based optimistic locking:
BEGIN;
  SELECT reserved_rooms, total_rooms
  FROM room_inventory
  WHERE room_type_id = ? AND date IN (...)
  FOR UPDATE;                          -- Acquires row-level lock
                                       -- Other transactions BLOCK here

  -- Check availability
  -- If available:
  UPDATE room_inventory
  SET reserved_rooms = reserved_rooms + 1
  WHERE room_type_id = ? AND date IN (...);

  INSERT INTO reservations (...) VALUES (...);
COMMIT;                                -- Lock released
\`\`\`
`,
    jsCode: `## Deep Dive: Concurrency Control for Reservations

### The Double-Booking Problem

Without concurrency control, two users checking availability simultaneously could both see "1 room available" and both successfully book, resulting in an oversold room:

\`\`\`mermaid
sequenceDiagram
    participant A as User A
    participant DB as DB
    participant B as User B

    Note over A,B: Timeline without locking
    A->>DB: SELECT available = 1
    B->>DB: SELECT available = 1
    Note over A: Check: 1 > 0 → OK
    Note over B: Check: 1 > 0 → OK
    A->>DB: UPDATE reserved += 1
    B->>DB: UPDATE reserved += 1
    Note over A,B: BOTH succeed! Room is DOUBLE-BOOKED.
\`\`\`

### Option 1: Pessimistic Locking (SELECT FOR UPDATE)

\`\`\`mermaid
sequenceDiagram
    participant A as User A
    participant DB as DB
    participant B as User B

    Note over A,B: Pessimistic Locking (SELECT FOR UPDATE)
    A->>DB: SELECT ... FOR UPDATE
    Note over A,DB: Lock acquired on row
    B->>DB: SELECT ... FOR UPDATE
    Note over DB,B: BLOCKED (waiting for User A's lock)
    A->>DB: Check + UPDATE + COMMIT
    Note over A,DB: Lock released
    DB-->>B: Lock acquired
    Note over DB,B: Check: available = 0 → REJECT
    DB-->>B: REJECT
\`\`\`

**Pros**: Simple to reason about, guaranteed correctness, no retry logic needed.
**Cons**: Blocked transactions hold connections, risk of deadlocks if locking order is inconsistent, lower throughput under high contention.

### Option 2: Optimistic Locking (Version Column)

\`\`\`mermaid
sequenceDiagram
    participant A as User A
    participant DB as DB
    participant B as User B

    Note over A,B: Optimistic Locking (Version Column)
    A->>DB: SELECT (version=5)
    B->>DB: SELECT (version=5)
    A->>DB: UPDATE ... WHERE version=5, SET version=6
    DB-->>A: 1 row affected → OK
    B->>DB: UPDATE ... WHERE version=5
    DB-->>B: 0 rows affected → CONFLICT! Retry.
\`\`\`

**Pros**: No blocking, higher throughput when conflicts are rare (which they are for hotels — ~6 QPS).
**Cons**: Requires retry logic, wasted work on conflict, can livelock under extreme contention.

### Recommendation for Hotels

Since hotel reservation QPS is very low (~6 QPS), **either approach works well**. Optimistic locking is slightly preferred because conflicts are rare and it avoids holding database locks. For flash-sale scenarios (thousands trying to book the same hotel simultaneously), pessimistic locking is safer because it serializes access and avoids retry storms.

### Idempotency for Reservation API

Network failures and client retries can cause the same reservation request to be sent multiple times. The reservation API must be **idempotent** — processing the same request twice must not create two reservations.

\`\`\`mermaid
graph TD
    N0["Client sends POST /reserve"]
    N1["Reservation Service checks idempotency"]
    N0 --> N1
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

### Caching Strategy with CDC

Hotel details and availability are read much more often than they are updated. Use Redis to cache hotel data, and **Change Data Capture (CDC)** to invalidate caches:

\`\`\`mermaid
graph TD
    N0[("Reservation DB")]
    N1["CDC Stream (Debezium)"]
    N2["Cache Invalidator"]
    N3["Redis Cache"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
\`\`\`

This ensures the cache is eventually consistent with the database without requiring application code to manually invalidate — the CDC stream handles it automatically.

### Overbooking Support

Hotels intentionally overbook (typically 10-15%) because a percentage of guests cancel or no-show. The availability check becomes:

\`\`\`
effective_capacity = total_rooms * overbooking_factor
available = effective_capacity - reserved_rooms

Example:
  total_rooms = 100
  overbooking_factor = 1.10
  effective_capacity = 110
  reserved_rooms = 105
  available = 110 - 105 = 5 rooms still bookable

The overbooking factor is configurable per room type and
can be adjusted dynamically based on historical no-show rates.
\`\`\`
`,
    explanation: `## Wrap Up

### Key Design Decisions
1. **Relational database (PostgreSQL) for reservations** provides ACID transactions essential for preventing double-booking — this is a correctness problem, not a throughput problem
2. **Optimistic locking as the default** concurrency strategy works well at low QPS (~6 TPS) with rare conflicts, while pessimistic locking is available for high-contention scenarios
3. **Idempotency keys** on the reservation API ensure network retries and client bugs cannot create duplicate bookings
4. **CDC-based cache invalidation** keeps Redis caches fresh without coupling cache logic to business logic, and provides eventual consistency for the read-heavy search path
5. **Overbooking as a configurable factor** per room type gives hotels the flexibility to maximize revenue while managing no-show risk

### Scalability Bottlenecks & Mitigations
- **Database write contention**: At ~6 QPS for reservations, a single PostgreSQL instance handles this easily. For growth, shard by hotel_id so each hotel's inventory is on one shard
- **Search performance**: Use Elasticsearch for full-text and geo search, backed by the relational DB as the source of truth. Cache popular search results in Redis
- **Flash sale scenarios**: Queue reservation requests per hotel and process them serially to avoid retry storms from optimistic locking conflicts
- **Multi-date bookings**: A 3-night stay must atomically update 3 inventory rows. Keep all dates for one hotel on the same DB shard to avoid distributed transactions

### Trade-Offs
| Decision | Advantage | Disadvantage |
|----------|-----------|--------------|
| Relational DB (ACID) | Strong consistency for bookings | Harder to scale horizontally than NoSQL |
| Optimistic locking | No blocking, good for low contention | Retry storms under high contention |
| Pessimistic locking | Serialized access, no retries | Holds locks, risk of deadlocks |
| Microservice split | Independent scaling and deployment | Distributed transaction complexity |
| CDC cache invalidation | Decoupled, reliable | Slight delay in cache freshness |
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Do not use a NoSQL database for reservations — the double-booking problem requires ACID transactions with row-level locking or version checks that NoSQL databases cannot provide reliably.',
      'Always include an idempotency key in the reservation API — without it, network retries from flaky mobile connections will create duplicate bookings that are expensive to reconcile.',
      'Remember that a multi-night booking must atomically check and update inventory for ALL dates — checking each date separately creates a race condition where partial bookings can succeed.',
      'Overbooking is a feature, not a bug — hotels expect to sell 110% of capacity based on historical no-show rates, so the system must support configurable overbooking factors per room type.'
    ]
  },
  {
    id: 9208,
    description: `## Clarifying Questions to Ask
- What is the **scale**? How many users and how many emails per day?
- Do we need to support both **sending and receiving**, or just one direction?
- What **email protocols** must be supported? (SMTP, IMAP, POP3?)
- Is **full-text search** across email bodies required?
- Do we need **spam and virus filtering** on incoming mail?
- What are the **storage retention** requirements? (Keep emails forever?)
- Do we need **attachments**? What is the max attachment size?

## Functional Requirements
- **Send** emails to external recipients via SMTP
- **Receive** emails from external senders via SMTP
- **Store** emails with folders (Inbox, Sent, Drafts, Trash, custom labels)
- **Search** across email subjects, bodies, and attachments
- **Manage** emails: read/unread, star, label, move, delete
- Support **attachments** up to 25 MB per email

## Non-Functional Requirements
- **High availability**: Email must be always accessible (99.99% uptime)
- **Durable**: Zero email loss — once accepted, an email must never be lost
- **Low latency**: Inbox loads in < 500ms, search in < 2 seconds
- **Scalable**: Support billions of emails across hundreds of millions of users
- **Secure**: Encryption in transit (TLS), spam/virus filtering, authentication (SPF, DKIM, DMARC)

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total users | 1 billion |
| Daily active users | 500 million |
| Emails sent / day | 10 billion |
| Emails received / day | 40 billion (includes spam, ~60% filtered) |
| Average email size (no attachment) | 50 KB |
| Average email size (with attachment) | 500 KB |
| Emails with attachments | ~20% |
| Daily storage for emails | 40B x 50KB x 0.8 + 40B x 500KB x 0.2 = **~5.6 PB/day** |
| Send QPS | 10B / 86,400 ≈ **115K QPS** |
| Receive QPS | 40B / 86,400 ≈ **460K QPS** |
| Storage per user (avg) | ~10 GB over lifetime |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle email threading?** Group related emails by the \`In-Reply-To\` and \`References\` headers. Build a thread tree structure in the metadata store. Display threads as conversations in the UI.
- **How would you support email forwarding and aliases?** Maintain a routing table that maps aliases to primary mailboxes. The SMTP receiver checks this table before delivering to storage. Forwarding re-injects the email into the outbound queue with modified headers.
- **How would you handle compliance requirements (legal hold)?** Mark user accounts under legal hold. Disable permanent deletion for held accounts. Copy held emails to a separate compliance store that is immutable and auditable.
- **How would you migrate from POP3 to IMAP?** POP3 downloads emails to the client and optionally deletes from server. IMAP keeps emails server-side with synchronized state. Migration involves ensuring all client-side emails are uploaded back to the server and switching the protocol endpoint.
- **How would you handle email encryption (end-to-end)?** Support PGP/GPG or S/MIME. Store encrypted email bodies as-is — the server cannot decrypt them. Search over encrypted emails requires client-side indexing or a secure enclave approach.`,
    intuition: `A distributed email service is fundamentally a **massive asynchronous message delivery and storage system**. The key insight is that email has two distinct planes: a **transport plane** (getting emails from sender to recipient using SMTP) and a **storage/access plane** (storing emails durably and serving them to users via IMAP or a web API). These planes have very different requirements — transport needs reliability and retry logic, while storage needs efficient indexing, search, and petabyte-scale capacity. The architecture naturally separates into an inbound pipeline (receive, filter, store), an outbound pipeline (compose, queue, deliver), and a storage layer that serves the user-facing read path.`,
    approach: `## Component Overview

The system has three major subsystems: an **inbound email pipeline** (SMTP receivers that accept mail, spam/virus filters, delivery to mailbox), an **outbound email pipeline** (compose API, send queue, SMTP delivery with retries), and a **storage and access layer** (email metadata in a relational DB, email bodies in object storage, full-text search via Elasticsearch). A **WebSocket/push service** provides real-time notifications for new emails.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/mailboxes/:folder\` | List | Params: \`page, limit, sort\` returns email metadata list |
| \`GET /api/v1/emails/:id\` | Read | Returns full email with body and attachment links |
| \`POST /api/v1/emails/send\` | Send | Body: \`{ to, cc, bcc, subject, body, attachments }\` |
| \`POST /api/v1/emails/draft\` | Draft | Saves email as draft |
| \`PUT /api/v1/emails/:id/labels\` | Label | Body: \`{ addLabels, removeLabels }\` |
| \`DELETE /api/v1/emails/:id\` | Delete | Moves to Trash (soft delete) |
| \`GET /api/v1/emails/search\` | Search | Params: \`query, from, to, dateRange, hasAttachment\` |

## Data Model

### Email Metadata (Relational DB, sharded by user_id)
| Column | Type | Notes |
|--------|------|-------|
| email_id (PK) | BIGINT | Snowflake ID |
| user_id | BIGINT | Mailbox owner (partition key) |
| folder | ENUM | INBOX, SENT, DRAFTS, TRASH, SPAM |
| labels | ARRAY<STRING> | Custom user labels |
| from_address | VARCHAR | Sender |
| to_addresses | ARRAY<VARCHAR> | Recipients |
| subject | VARCHAR | Email subject |
| snippet | VARCHAR(200) | Preview of body |
| has_attachment | BOOLEAN | Quick filter flag |
| is_read | BOOLEAN | Read/unread state |
| is_starred | BOOLEAN | Starred flag |
| thread_id | BIGINT | Groups conversation threads |
| body_storage_key | VARCHAR | Pointer to object storage |
| received_at | TIMESTAMP | Delivery time |
| size_bytes | INT | Total email size |

### Attachment (Object Storage)
| Column | Type | Notes |
|--------|------|-------|
| attachment_id (PK) | UUID | Unique identifier |
| email_id (FK) | BIGINT | Parent email |
| filename | VARCHAR | Original filename |
| content_type | VARCHAR | MIME type |
| size_bytes | INT | File size |
| storage_key | VARCHAR | S3 key for the blob |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    subgraph Inbound["INBOUND EMAIL PATH"]
        ExtMail["External Mail Servers"]
        SMTP["SMTP Receiver (MX Records)"]
        Pipeline["Processing Pipeline<br/>1. Spam Filter<br/>2. Virus Scan<br/>3. SPF/DKIM/DMARC<br/>4. Content Parse"]
        BodyStore["Email Body Store (S3 / Blob)"]
        MetaDB["Email Metadata DB (PostgreSQL, sharded by user_id)"]
        Search["Search Index (Elasticsearch)"]
        Push["Push / WebSocket Service"]
    end

    subgraph Outbound["OUTBOUND EMAIL PATH"]
        User1["User (Web / Mobile)"]
        API1["API Server (Compose + Validate)"]
        Queue["Send Queue (Kafka / SQS)"]
        Sender["SMTP Sender (Outbound MTA)<br/>DNS MX lookup, TLS, Retry, Bounce handling"]
    end

    subgraph Access["USER ACCESS PATH"]
        User2["User (Web / Mobile)"]
        API2["API Server (REST / IMAP proxy)"]
        MetaDB2["Metadata DB (folder listing, search)"]
        ObjStore["Object Storage (fetch body + attachments)"]
    end

    ExtMail --> SMTP
    SMTP --> Pipeline
    Pipeline --> BodyStore
    Pipeline --> MetaDB
    MetaDB --> Search
    Search --> Push

    User1 --> API1
    API1 --> Queue
    Queue --> Sender

    User2 --> API2
    API2 --> MetaDB2
    API2 --> ObjStore

    style ExtMail fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style SMTP fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Pipeline fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style BodyStore fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style MetaDB fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Search fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Push fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style User1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style API1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Queue fill:#1e1e2e,stroke:#cba6f7,stroke-width:2px,color:#cdd6f4
    style Sender fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style User2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style API2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style MetaDB2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style ObjStore fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

## Inbound Email Flow

\`\`\`mermaid
sequenceDiagram
    participant MTA as External MTA
    participant SMTP as SMTP Receiver
    participant Spam as Spam Filter
    participant Meta as Metadata DB
    participant Obj as Object Store

    MTA->>SMTP: SMTP EHLO
    MTA->>SMTP: MAIL FROM:
    MTA->>SMTP: RCPT TO:
    MTA->>SMTP: DATA (email)
    Note over SMTP: Check SPF/DKIM/DMARC headers
    SMTP->>Spam: Spam score request
    Spam-->>SMTP: Score < threshold
    Note over SMTP: Parse MIME: extract body, attachments
    SMTP->>Obj: Store body + attachments
    SMTP->>Meta: Store metadata (user mailbox)
    SMTP-->>MTA: 250 OK
\`\`\`

## Outbound Email Flow

\`\`\`mermaid
sequenceDiagram
    participant UC as User Client
    participant API as API Server
    participant Q as Send Queue
    participant S as SMTP Sender
    participant MTA as External MTA

    UC->>API: POST /send
    Note over API: Validate: recipients, size limits, rate limits
    Note over API: Store in Sent folder
    API->>Q: Enqueue for delivery
    API-->>UC: 202 Accepted
    Q->>S: Dequeue
    Note over S: DNS MX lookup for recipient domain
    S->>MTA: SMTP handshake
    S->>MTA: DATA (email)
    MTA-->>S: 250 OK
    Note over Q: On failure: retry with exponential backoff (up to 72 hrs)
\`\`\`
`,
    jsCode: `## Deep Dive: Email Infrastructure

### Email Protocols

\`\`\`mermaid
graph TD
    N0["Protocol"]
    N1["Port"]
    N2["Purpose"]
    N3["SMTP"]
    N4["25 587"]
    N5["Server-to-server / Client submission"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N4 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N5 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

### Spam Detection Pipeline

Spam accounts for 60-80% of all email traffic. A multi-layered detection pipeline:

\`\`\`mermaid
graph TD
    Email["Incoming Email"]
    L1["Layer 1: Connection<br/>IP reputation check, Rate limiting, DNS blacklists"]
    L2["Layer 2: Authentication<br/>SPF check, DKIM verification, DMARC policy"]
    L3["Layer 3: Content<br/>Bayesian classifier, URL reputation,<br/>Attachment scan, Heuristic rules"]
    L4["Layer 4: User Signals<br/>User spam reports, Contact list"]
    Deliver["Deliver to Inbox / Spam folder / Reject"]

    Email --> L1
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> Deliver

    style Email fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style L1 fill:#1e1e2e,stroke:#f38ba8,stroke-width:2px,color:#cdd6f4
    style L2 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style L3 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style L4 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Deliver fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
\`\`\`

### Email Deliverability (SPF, DKIM, DMARC)

When sending email, the recipient's server verifies our identity to prevent spoofing:

\`\`\`
SPF (Sender Policy Framework):
  DNS TXT record: "v=spf1 ip4:192.168.1.0/24 include:_spf.google.com -all"
  Recipient checks: Is the sending IP authorized for this domain?

DKIM (DomainKeys Identified Mail):
  Outbound: Sender signs email headers + body with private key
  DNS TXT record publishes the public key
  Recipient: Verifies signature against public key
  Ensures email was not tampered with in transit

DMARC (Domain-based Message Auth):
  DNS TXT record: "v=DMARC1; p=reject; rua=mailto:reports@example.com"
  Policy that tells recipients what to do if SPF and DKIM fail
  Options: none (monitor), quarantine (spam folder), reject (bounce)
\`\`\`

### Storage Architecture

Email bodies and attachments dominate storage. Separating metadata from content is critical:

\`\`\`mermaid
graph TD
    N0[("Metadata (PostgreSQL)")]
    N1[("Email Bodies (S3)")]
    N2[("Attachments (Blob)")]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
\`\`\`

### Full-Text Search

Users expect to search email by subject, body, sender, and even attachment content:

\`\`\`mermaid
graph TD
    N0["Email arrives"]
    N1["Indexing Pipeline"]
    N2["Elasticsearch Cluster"]
    N0 --> N1
    N1 --> N2
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

### Email Threading

Emails in a conversation are linked using standard headers:

\`\`\`
Threading via Message-ID, In-Reply-To, References:

Email 1 (original):
  Message-ID: <abc@example.com>
  Subject: Project Update

Email 2 (reply):
  Message-ID: <def@example.com>
  In-Reply-To: <abc@example.com>
  References: <abc@example.com>
  Subject: Re: Project Update

Email 3 (reply to reply):
  Message-ID: <ghi@example.com>
  In-Reply-To: <def@example.com>
  References: <abc@example.com> <def@example.com>
  Subject: Re: Re: Project Update

Thread Tree:
  <abc> (original)
    |
    +-- <def> (reply)
          |
          +-- <ghi> (reply to reply)

All three emails share thread_id derived from
the first Message-ID in the References chain.
\`\`\`

### Folder and Label System

Gmail popularized labels over folders. The difference:

\`\`\`
Folders (traditional):
  Each email belongs to exactly ONE folder.
  Moving email = changing folder.

Labels (Gmail model):
  Each email can have MULTIPLE labels.
  "Inbox" and "Sent" are just special labels.
  Archiving = removing the "Inbox" label.

Data model for labels:
  email_labels table:
  | email_id | label_id |
  |----------|----------|
  | 12345    | INBOX    |
  | 12345    | WORK     |
  | 12345    | PROJECT  |

  This email appears in Inbox, Work, and Project views.
  Deleting the INBOX label "archives" it.
\`\`\`
`,
    explanation: `## Wrap Up

### Key Design Decisions
1. **Separate metadata from content storage** — email metadata in a sharded relational DB enables fast mailbox queries, while email bodies and attachments in object storage provide cost-effective petabyte-scale capacity
2. **Asynchronous outbound delivery** via a send queue with retry logic ensures emails are delivered reliably even when recipient servers are temporarily down (SMTP retries up to 72 hours per RFC)
3. **Multi-layered spam pipeline** (IP reputation, SPF/DKIM/DMARC, content ML, user signals) filters 60%+ of traffic before it reaches user mailboxes
4. **Elasticsearch for full-text search** indexes email text asynchronously, enabling sub-second search across millions of emails per user without impacting the write or read path
5. **Email deliverability** requires proper DNS configuration (SPF, DKIM, DMARC records) and IP reputation management — without these, outbound emails will be rejected by major providers

### Scalability Bottlenecks & Mitigations
- **Storage growth (5.6 PB/day)**: Use content-addressable storage to deduplicate identical email bodies (common with mailing lists), tiered storage (hot/warm/cold), and compression
- **SMTP receiver throughput**: Horizontal scale SMTP receivers behind DNS round-robin MX records. Each receiver is stateless — just accepts and enqueues
- **Search index size**: Shard Elasticsearch indices by user_id. Apply retention policies to remove old search indices (users rarely search emails older than 2 years)
- **Attachment storage**: Deduplicate at the content hash level. The same attachment sent to 1000 recipients is stored once

### Trade-Offs
| Decision | Advantage | Disadvantage |
|----------|-----------|--------------|
| Object storage for bodies | Cheap, durable, scalable | Extra hop to fetch full email |
| Relational DB for metadata | Fast queries, ACID for state changes | Must be sharded at scale |
| Elasticsearch for search | Fast full-text search | Additional infra, indexing lag |
| Async send queue | Reliable delivery with retries | Emails not instant (seconds delay) |
| Labels over folders | Flexible organization | More complex queries (many-to-many) |
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Do not store email bodies in the relational metadata database — at petabyte scale, mixing large blobs with queryable metadata destroys database performance and makes sharding impractical.',
      'Email delivery is inherently asynchronous — the SMTP protocol allows retries over 72 hours, so the outbound path must use a persistent queue with exponential backoff, not synchronous sends.',
      'SPF, DKIM, and DMARC are not optional — without proper DNS records and email signing, major providers (Gmail, Outlook) will reject or spam-folder your outbound emails.',
      'Spam filtering must happen before storage to avoid wasting storage on junk — at 60%+ spam rate, filtering after storage would more than double your storage costs.'
    ]
  },
  {
    id: 9209,
    description: `## Clarifying Questions to Ask
- What is the **scale**? How much data will be stored total?
- What is the required **durability**? (S3 offers 11 nines — 99.999999999%)
- Do we need **versioning** for objects?
- What is the expected **object size** distribution? (Many small files vs few large files?)
- Do we need **multipart upload** for large objects?
- What **consistency model** is required? (Strong read-after-write vs eventual?)
- What is the read/write ratio?

## Functional Requirements
- **PUT** objects into named buckets with unique keys
- **GET** objects by bucket + key
- **DELETE** objects
- **LIST** objects in a bucket with prefix filtering
- Support **object versioning** (keep history of overwrites)
- Support **multipart upload** for large objects (>5 GB)
- Organize objects into **buckets** (logical namespaces)

## Non-Functional Requirements
- **Extreme durability**: 99.999999999% (11 nines) — once stored, data is virtually never lost
- **High availability**: 99.99% uptime for reads and writes
- **Scalable**: Store exabytes of data across millions of objects
- **Low latency**: Time-to-first-byte < 100ms for reads
- **Cost efficient**: Optimize storage cost per GB through erasure coding

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Total stored data | 100 PB+ |
| Number of objects | 100 billion |
| Average object size | ~1 MB (power-law: many small, few huge) |
| Write QPS | 50,000 objects/sec |
| Read QPS | 200,000 objects/sec |
| Write throughput | ~50 GB/sec |
| Read throughput | ~200 GB/sec |
| Durability target | 99.999999999% (11 nines) |
| Storage nodes | ~10,000 |
`,
    examples: `## Follow-Up Discussion Points
- **How would you implement storage classes (Standard, Infrequent Access, Glacier)?** Use tiered storage with different media: SSD for Standard, HDD for Infrequent Access, and tape/cold HDD for Glacier. Move objects between tiers based on lifecycle policies. Retrieval latency increases with colder tiers (milliseconds vs hours).
- **How would you handle cross-region replication?** Asynchronously replicate objects to a second region via a replication queue. The metadata service tracks replication status. Reads can be served from either region, writes go to the primary.
- **How would you support pre-signed URLs?** Generate a URL with an embedded HMAC signature that grants temporary access to a private object. The signature includes the object key, expiration time, and allowed operations. The API gateway validates the signature without hitting the auth service.
- **How would you handle hot objects (viral content)?** Add a CDN layer in front of the data service. Cache frequently accessed objects at edge locations. Use consistent hashing to distribute load across data nodes for objects not in the CDN cache.
- **What about data corruption detection?** Store checksums (MD5/SHA-256) with each data chunk. Verify checksums on every read. Run background integrity scans that read all chunks and compare against stored checksums. Repair corrupted chunks from erasure-coded parity.`,
    intuition: `An S3-like object storage system is fundamentally about separating the **metadata plane** (what objects exist and where they are stored) from the **data plane** (the actual bytes on disk). The metadata service is a distributed key-value store mapping \`(bucket, key) -> data location\`, while the data service manages raw bytes on disk across thousands of storage nodes. The defining characteristic is **extreme durability** (11 nines), achieved through **erasure coding** — a technique that is far more space-efficient than triple replication while providing equal or better fault tolerance. Data is split into data fragments and parity fragments using Reed-Solomon codes, so any subset of fragments can reconstruct the original data.`,
    approach: `## Component Overview

The system separates into three planes: a **metadata service** backed by a distributed database that maps object keys to storage locations, a **data service** that manages the physical storage of object bytes across many nodes using erasure coding, and an **API gateway** that handles authentication, routing, and request orchestration. A **garbage collection** service reclaims space from deleted or overwritten objects.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`PUT /:bucket/:key\` | Upload | Headers: \`Content-Length, Content-Type\` Body: object bytes |
| \`GET /:bucket/:key\` | Download | Query: \`?versionId=xyz\` for specific version |
| \`DELETE /:bucket/:key\` | Delete | Adds a delete marker (versioned) or removes object |
| \`GET /:bucket?prefix=foo&delimiter=/\` | List | List objects with prefix filtering and pagination |
| \`POST /:bucket/:key?uploads\` | Init Multipart | Returns uploadId for chunked upload |
| \`PUT /:bucket/:key?partNumber=N&uploadId=X\` | Upload Part | Upload one part of multipart |
| \`POST /:bucket/:key?uploadId=X\` | Complete | Finalize multipart upload |
| \`PUT /:bucket\` | Create Bucket | Creates a new bucket namespace |

## Data Model

### Object Metadata (Distributed DB)
| Field | Type | Notes |
|-------|------|-------|
| bucket_name | STRING | Namespace (partition key) |
| object_key | STRING | User-defined key (sort key) |
| version_id | UUID | For versioned objects |
| size_bytes | BIGINT | Total object size |
| content_type | STRING | MIME type |
| checksum | STRING | SHA-256 of full object |
| data_locations | LIST<DataRef> | Pointers to data chunks on storage nodes |
| created_at | TIMESTAMP | Upload time |
| is_delete_marker | BOOLEAN | For versioned deletes |
| storage_class | ENUM | STANDARD, IA, GLACIER |

### Data Chunk Reference
| Field | Type | Notes |
|-------|------|-------|
| chunk_id | UUID | Unique chunk identifier |
| node_id | STRING | Storage node holding this chunk |
| offset | BIGINT | Byte offset within the node's data file |
| length | INT | Chunk size in bytes |
| chunk_type | ENUM | DATA or PARITY (erasure coding) |
`,
    code: `## Architecture Diagram

\`\`\`mermaid
graph TD
    Client["Client (SDK / CLI)"]
    GW["API Gateway (Auth, Routing, Rate Limiting)"]
    Meta["Metadata Service (Vitess/CockDB)<br/>bucket+key -> data locations<br/>Sharded by bucket hash"]
    Data["Data Service (Storage Nodes)<br/>Erasure coded across nodes<br/>Append-only data files"]
    GC["Garbage Collection Service<br/>Reclaims space from deleted/overwritten objects"]
    Node["Storage Node Detail:<br/>Data Files (~256MB append-only segments)<br/>[chunk1][chunk2][chunk3]...<br/>Checksum Index (chunk_id -> CRC32)"]

    Client --> GW
    GW --> Meta
    GW --> Data
    Meta --> GC
    Data --> GC
    Data --> Node

    style Client fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style GW fill:#1e1e2e,stroke:#a6e3a1,stroke-width:2px,color:#cdd6f4
    style Meta fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style Data fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style GC fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style Node fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
\`\`\`

## Object Upload Flow (PUT)

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant Meta as Metadata Svc
    participant DS as Data Service (nodes)

    C->>GW: PUT /bucket/key
    Note over GW: Auth check
    GW->>Meta: Allocate data placement
    Meta-->>GW: Write to nodes [N1,N2,N3,N4,N5,N6]
    Note over GW: Split object into chunks<br/>Erasure code: 4 data + 2 parity
    GW->>DS: Write chunks 1-4 (data) + chunks 5-6 (parity) in parallel
    DS-->>GW: All ACKs received
    GW->>Meta: Commit metadata (key -> chunk locations)
    GW-->>C: 200 OK
\`\`\`

## Object Download Flow (GET)

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant GW as API Gateway
    participant Meta as Metadata Svc
    participant DS as Data Service (nodes)

    C->>GW: GET /bucket/key
    GW->>Meta: Lookup metadata
    Meta-->>GW: Chunk locations [N1:off1, N2:off2, ...]
    GW->>DS: Read 4 data chunks in parallel
    DS-->>GW: Chunk data
    Note over GW: Verify checksums<br/>Reassemble object<br/>(If corrupt/unavailable, use parity chunks to reconstruct)
    GW-->>C: 200 OK + body
\`\`\`
`,
    jsCode: `## Deep Dive: Erasure Coding, Data Layout, and Durability

### Erasure Coding vs Replication

The fundamental choice for durability is between replication and erasure coding:

\`\`\`
3x Replication:
  Original: [A B C D]
  Replica 1: [A B C D]  (complete copy on node 2)
  Replica 2: [A B C D]  (complete copy on node 3)

  Storage overhead: 3x (200% extra)
  Can tolerate: 2 node failures
  Reconstruction: Instant (just read another copy)

Erasure Coding (4+2 Reed-Solomon):
  Original: [A B C D]
  Split into 4 data chunks + 2 parity chunks:
  Node 1: [A]     (data)
  Node 2: [B]     (data)
  Node 3: [C]     (data)
  Node 4: [D]     (data)
  Node 5: [P1]    (parity = f(A,B,C,D))
  Node 6: [P2]    (parity = g(A,B,C,D))

  Storage overhead: 1.5x (50% extra)
  Can tolerate: 2 node failures (ANY 2 of 6)
  Reconstruction: Must read 4 of 6 chunks + compute
\`\`\`

Erasure coding uses **half the storage** of 3x replication while tolerating the same number of failures. The trade-off is higher CPU cost for encoding/decoding and higher read latency during reconstruction. For an object storage system at petabyte scale, the storage savings are massive.

### Reed-Solomon Encoding

**Reed-Solomon Encoding Matrix**

\`\`\`
Original Data:    [D1] [D2] [D3] [D4]
                     |    |    |    |
                     v    v    v    v
Encoding Matrix:  [ 1  0  0  0 ]   → D1
                  [ 0  1  0  0 ]   → D2
                  [ 0  0  1  0 ]   → D3
                  [ 0  0  0  1 ]   → D4
                  [ 1  1  1  1 ]   → P1 (parity)
                  [ 1  2  4  8 ]   → P2 (parity)

Any 4 of 6 chunks can reconstruct the original data.
\`\`\`

Common erasure coding configurations:

| Config | Data | Parity | Total | Overhead | Tolerates |
|--------|------|--------|-------|----------|-----------|
| 4+2 | 4 | 2 | 6 | 1.5x | 2 failures |
| 6+3 | 6 | 3 | 9 | 1.5x | 3 failures |
| 8+4 | 8 | 4 | 12 | 1.5x | 4 failures |
| 10+4 | 10 | 4 | 14 | 1.4x | 4 failures |

Higher data-to-parity ratios reduce overhead but require more nodes and increase reconstruction time.

### Data Layout on Disk

Each storage node uses append-only segment files for storing object chunks:

\`\`\`mermaid
graph TD
    N0["Header 8B"]
    N1["Chunk A"]
    N2["Chunk B"]
    N3["Chunk C"]
    N4["Chunk D"]
    N5["chunk_id 16B"]
    N6["length 4B"]
    N7["checksum 4B"]
    N8["data N bytes"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> N6
    N6 --> N7
    N7 --> N8
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

**Why append-only?** Sequential writes are much faster than random writes on both HDD and SSD. Append-only also simplifies concurrency — no need for file locks since only one writer appends to the active segment.

### Garbage Collection

When objects are deleted or overwritten, the old data chunks become unreachable but still occupy disk space. GC reclaims this space:

\`\`\`mermaid
graph TD
    N0["Metadata Service"]
    N1["GC Scanner"]
    N2[("Storage Node Segments")]
    N3["GC Sweeper"]
    N0 --> N1
    N1 --> N2
    N1 --> N3
    style N0 fill:#1e1e2e,stroke:#fab387,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#f9e2af,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

GC runs during off-peak hours and is rate-limited to avoid impacting read/write performance.

### Object Versioning

When versioning is enabled, overwriting an object creates a new version rather than replacing the old data:

**Versioned Object Example**

\`\`\`
Bucket: my-bucket
Key:    photos/cat.jpg

Version ID    | Size   | Last Modified       | Delete Marker
v3 (latest)   | 2.1 MB | 2024-03-15 10:30   | No
v2            | 1.8 MB | 2024-03-10 08:15   | No
v1            | 1.5 MB | 2024-03-01 12:00   | No

GET /photos/cat.jpg           → returns v3
GET /photos/cat.jpg?v=v1      → returns v1
DELETE /photos/cat.jpg        → adds delete marker (v4)
GET /photos/cat.jpg?v=v2      → still returns v2
\`\`\`

### Multipart Upload

Large objects (multi-GB) are uploaded in parts, each independently retryable:

\`\`\`mermaid
graph TD
    N0["Part 1 100MB"]
    N1["Part 2 100MB"]
    N2["Part 3 100MB"]
    N3["Part 4 50MB"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    style N0 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N1 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N2 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
    style N3 fill:#1e1e2e,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4
\`\`\`

### Consistency Guarantees

\`\`\`
Strong Read-After-Write Consistency:
  1. Client PUTs object
  2. API Gateway writes data to storage nodes
  3. API Gateway commits metadata (synchronous)
  4. 200 OK returned to client
  5. Any subsequent GET is GUARANTEED to return the new object

How? The metadata commit is the linearization point.
  - Data is written BEFORE metadata is committed
  - Reads always go through metadata first
  - Until metadata is committed, the object does not "exist"
  - This provides strong consistency without distributed locks
\`\`\`
`,
    explanation: `## Wrap Up

### Key Design Decisions
1. **Separation of metadata and data planes** allows each to scale independently — metadata is a distributed database problem while data storage is a bulk I/O problem
2. **Erasure coding (e.g., 4+2 Reed-Solomon)** achieves 11-nines durability with only 1.5x storage overhead, compared to 3x for triple replication — this saves petabytes of storage at scale
3. **Append-only segment files** on storage nodes maximize write throughput by avoiding random I/O and simplify concurrency (single writer per segment)
4. **Checksum verification on every read** catches silent data corruption before it reaches the client, maintaining data integrity across billions of objects
5. **Metadata commit as the linearization point** provides strong read-after-write consistency without distributed locks — data is invisible until metadata is committed

### Scalability Bottlenecks & Mitigations
- **Metadata service throughput**: Shard the metadata database by bucket name hash. Use caching for frequently accessed object keys. The metadata per object is small (~500 bytes), so even billions of objects are manageable
- **Storage node hot spots**: Use consistent hashing for data placement with virtual nodes to distribute load evenly. Move chunks between nodes when imbalance is detected
- **Garbage collection overhead**: Rate-limit GC to use at most 10% of disk I/O. Schedule compaction during off-peak hours. Track dead-chunk ratio per segment and prioritize segments with the most garbage
- **Large object uploads**: Multipart upload allows parallel chunk uploading and independent retry per part, avoiding the need to restart a multi-GB upload on failure

### Trade-Offs
| Decision | Advantage | Disadvantage |
|----------|-----------|--------------|
| Erasure coding vs replication | 50% storage overhead vs 200% | Higher CPU for encode/decode, slower reconstruction |
| Append-only segments | Fast sequential writes, simple concurrency | Requires GC for space reclamation |
| Strong consistency | Simple programming model | Higher write latency (must wait for metadata commit) |
| Versioning | Protects against accidental deletes | Increased storage cost if not managed with lifecycle policies |
| Separate metadata DB | Independent scaling, fast lookups | Extra network hop on every operation |
`,
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    hints: [
      'Do not use triple replication at petabyte scale — the 200% storage overhead is financially impractical. Erasure coding provides equal fault tolerance at 50% overhead.',
      'The metadata commit must happen AFTER data is written to storage nodes — if metadata is committed first and the data write fails, readers will find a corrupt object. Data-before-metadata ensures consistency.',
      'Append-only storage requires garbage collection — without it, deleted and overwritten objects will accumulate and eventually fill all disks. GC must be carefully rate-limited to avoid impacting live traffic.',
      'Checksums are not optional — silent disk corruption (bit rot) is a real phenomenon at scale. Every chunk must have a checksum verified on read, and background scrubbing must detect and repair corruption proactively.'
    ]
  }
];
