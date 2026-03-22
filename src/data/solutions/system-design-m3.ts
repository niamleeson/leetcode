import { ProblemSolution } from './types';

export const solutionsM3: ProblemSolution[] = [
  {
    id: 9011,
    description: `## Clarifying Questions to Ask
- What is the **scale**? How many products, daily active users, and orders per day?
- What are the **peak traffic patterns**? Do we have flash sales or events like Black Friday?
- Do we need to support **multiple sellers** (marketplace) or single-seller only?
- What **payment methods** do we support? Do we handle payments in-house or use a provider?
- Do we need **real-time inventory** tracking or is eventual consistency acceptable?

## Functional Requirements
- **Product catalog** with search, category browsing, and multi-facet filtering
- **Shopping cart** that persists across sessions and devices
- **Checkout flow** with address, shipping, payment, and order confirmation
- **Order management** with tracking, cancellation, and return processing
- **Inventory management** with real-time stock updates to prevent overselling

## Non-Functional Requirements
- **Low latency**: Search < 200ms at p99, cart operations < 50ms
- **High availability**: 99.99% uptime, graceful degradation during failures
- **Consistency**: Order placement must be ACID-compliant with exactly-once semantics
- **Scalability**: Support 100M+ MAU with 10M+ concurrent during peak events

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Products in catalog | 500M, ~5KB each = **2.5 TB** |
| Daily active users | 50M, ~20 searches/day = **1B searches/day** |
| Search QPS | 1B / 86,400 ≈ **11.6K QPS** (peak: ~35K) |
| Orders / day | 5M orders, avg 3 items = **15M inventory updates/day** |
| Cart data | 50M active carts x 2KB = **100 GB** in Redis |
| Order storage / year | 5M/day x 365 x 3KB ≈ **5.5 TB/year** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle flash sales?** → Dedicated infrastructure with pre-warmed Redis inventory counters. Lua scripts for atomic decrement. Virtual queue to throttle checkout traffic and ensure fairness.
- **How would you support multi-region?** → Deploy catalog and search per region with local caches. Orders route to the region closest to the warehouse. Cross-region replication for product data with eventual consistency.
- **How would you prevent overselling?** → Two-tier inventory: Redis atomic counters for hot products, PostgreSQL with optimistic locking for the long tail. Background reconciliation every 30 seconds.
- **How would you handle partial failures during checkout?** → Saga pattern with compensating transactions. If payment succeeds but inventory reservation fails, trigger automatic refund. Idempotency keys prevent duplicate orders on retry.
- **How would you add personalized recommendations?** → Async pipeline: user events → Kafka → feature store. Serve recommendations from a pre-computed model cache. Fallback to popularity-based recommendations if ML service is down.`,
    intuition: `An e-commerce platform is fundamentally a **distributed transaction coordinator** — it must keep catalog, inventory, cart, and payment systems consistent while serving millions of concurrent users. The core design challenge is maintaining **real-time inventory accuracy** during high-concurrency flash sales while keeping the checkout flow fast and reliable.`,
    approach: `## Component Overview

A **stateless API gateway** routes requests to domain-specific microservices: Product, Search, Cart, Order, Inventory, and Payment. **Elasticsearch** powers product search with faceted filtering. **Redis** stores shopping carts and hot inventory counters. **PostgreSQL** is the source of truth for orders and inventory. A **saga orchestrator** coordinates the multi-step checkout process across services.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/products/search?q=&filters=\` | Search | Full-text search with facets |
| \`GET /api/v1/products/:id\` | Read | Product details with availability |
| \`POST /api/v1/cart/items\` | Create | Add item to cart: \`{ productId, quantity }\` |
| \`POST /api/v1/orders\` | Create | Place order: \`{ cartId, addressId, paymentMethod, idempotencyKey }\` |
| \`GET /api/v1/orders/:id\` | Read | Order status and tracking |

## Data Model

| Table | Key Columns | Notes |
|-------|-------------|-------|
| products | id, name, category_id, price, seller_id | Replicated to Elasticsearch |
| inventory | sku_id (PK), warehouse_id, quantity, version | Optimistic locking via version |
| cart_items | user_id, product_id, quantity | Stored in Redis with 30-day TTL |
| orders | id, user_id, status, total, idempotency_key | Status: CREATED → PAID → SHIPPED → DELIVERED |
| order_items | order_id, product_id, quantity, price_at_purchase | Price snapshot at checkout time |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+       +------------------+       +------------------+
| Client   |------>| API Gateway      |------>| Product Service  |
| (Web/App)|       | (Rate Limiting,  |       | (Catalog CRUD)   |
+----------+       |  Auth, Routing)  |       +--------+---------+
                   +--------+---------+                |
                            |                  +-------v---------+
              +-------------+-------------+    | Elasticsearch   |
              |             |             |    | (Search/Filter)  |
     +--------v---+ +-------v----+ +------v--+ +----------------+
     | Cart       | | Order      | | Inventory|
     | Service    | | Service    | | Service  |
     | (Redis)    | | (Saga      | | (Redis + |
     |            | | Orchestrator| | Postgres)|
     +--------+---+ +------+-----+ +----+-----+
              |            |             |
              |     +------v-------------v-----+
              |     | PostgreSQL (Orders,       |
              |     | Inventory, Transactions)  |
              |     +--------------------------+
              |            |
              |     +------v-----+
              +---->| Payment    |
                    | Service    |
                    | (Stripe)   |
                    +------------+
\`\`\`

## Write Flow (Place Order)

\`\`\`
Client        API Gateway     Order Svc      Inventory       Payment
  |               |               |               |              |
  | POST /orders  |               |               |              |
  |-------------->|               |               |              |
  |               | Create order  |               |              |
  |               |-------------->|               |              |
  |               |               | Reserve stock |              |
  |               |               |-------------->|              |
  |               |               |   Confirmed   |              |
  |               |               |<--------------|              |
  |               |               | Charge card   |              |
  |               |               |------------------------------>|
  |               |               |   Payment OK  |              |
  |               |               |<------------------------------|
  |               |               | Commit order  |              |
  |               |  Order ID     |               |              |
  |               |<--------------|               |              |
  |  { orderId }  |               |               |              |
  |<--------------|               |               |              |
\`\`\`

## Read Flow (Product Search)

\`\`\`
Client        API Gateway     Product Svc    Elasticsearch    Cache
  |               |               |               |              |
  | GET /search   |               |               |              |
  |-------------->|               |               |              |
  |               | Search        |               |              |
  |               |-------------->|               |              |
  |               |               | Check cache   |              |
  |               |               |------------------------------>|
  |               |               |               |   [MISS]     |
  |               |               | Query ES      |              |
  |               |               |-------------->|              |
  |               |               | Results+facets|              |
  |               |               |<--------------|              |
  |               |               | Cache results |              |
  |               |               |------------------------------>|
  |               | Products[]    |               |              |
  |               |<--------------|               |              |
  |  Results      |               |               |              |
  |<--------------|               |               |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Checkout Saga Pattern

The checkout process spans multiple services. A saga orchestrator coordinates the steps with compensating transactions for failures.

\`\`\`
+----------------------------------------------------------+
| Checkout Saga Orchestrator                                |
|                                                           |
| Step 1: Reserve Inventory                                 |
|   Action:  inventory.reserve(sku, qty)                    |
|   Compensate: inventory.release(sku, qty)                 |
|                                                           |
| Step 2: Process Payment                                   |
|   Action:  payment.charge(amount, idempotencyKey)         |
|   Compensate: payment.refund(transactionId)               |
|                                                           |
| Step 3: Confirm Order                                     |
|   Action:  order.confirm(orderId)                         |
|   Compensate: order.cancel(orderId)                       |
|                                                           |
| Step 4: Notify (async, no compensate)                     |
|   Action:  notification.send(orderId, email)              |
+----------------------------------------------------------+

State Machine:
  CREATED --> INVENTORY_RESERVED --> PAYMENT_PROCESSED
     |               |                      |
     v               v                      v
  CANCELLED    STOCK_RELEASED         REFUND_ISSUED
                     |                      |
                     v                      v
                 CANCELLED              CANCELLED
\`\`\`

Each step is idempotent. If the saga fails at step 2, it calls the compensating action for step 1. The idempotency key ensures retries never double-charge.

---

## Deep Dive: Flash Sale Inventory with Redis Lua

During flash sales, thousands of users hit a single SKU simultaneously. A Redis Lua script handles this atomically.

\`\`\`
+-----------------------------------------------+
| Redis Lua Script (Atomic)                      |
|                                                |
| 1. GET inventory:{sku}                         |
| 2. IF quantity >= requested THEN               |
|      DECRBY inventory:{sku} requested          |
|      SADD reserved:{sku} buyer_id              |
|      RETURN "RESERVED"                         |
|    ELSE                                        |
|      RETURN "SOLD_OUT"                         |
+-----------------------------------------------+
             |
             | async reconciliation (every 30s)
             v
+-----------------------------------------------+
| PostgreSQL                                     |
| inventory table                                |
|                                                |
| sku_id | warehouse | quantity | version        |
| SKU001 | WH-EAST  | 9,847   | 42             |
+-----------------------------------------------+
\`\`\`

The two-tier approach: Redis handles burst traffic (100K+ ops/sec), PostgreSQL is source of truth. A reconciliation job syncs them periodically.

---

## Deep Dive: Search with Faceted Filtering

\`\`\`
+---------------------------------------------------+
| Elasticsearch Cluster (10 nodes)                   |
|                                                    |
| Index: products                                    |
| Shards: 20 primary + 20 replicas                  |
|                                                    |
| Query Pipeline:                                    |
| +-----------------------------------------------+ |
| | 1. Full-text match on name, description       | |
| | 2. Filter by category, price range, brand     | |
| | 3. Compute aggregations (facet counts)        | |
| | 4. Sort by relevance + boost (sponsored)      | |
| | 5. Return top 20 results + filter counts      | |
| +-----------------------------------------------+ |
|                                                    |
| Response includes:                                 |
| - results[]: product summaries                     |
| - facets: { brands: [...], priceRanges: [...] }   |
| - total: 12,483 matches                           |
+---------------------------------------------------+
\`\`\`

Search results are cached for 5 minutes by query hash. Booking events invalidate related cache entries via Kafka consumer.
`,
    explanation: `## Bottlenecks & Improvements
- **Flash sale thundering herd** → Virtual queue with admission control. Only N users enter checkout at a time. Others see their queue position and estimated wait time
- **Inventory consistency** → Redis-to-DB reconciliation can drift. Run conflict detection every 30s and alert if discrepancy exceeds 1%. Redis is authoritative during flash sales
- **Search index lag** → Elasticsearch replication is async. A product update may take 1-2 seconds to appear in search. Acceptable for catalog, but inventory counts in search results should come from Redis, not ES
- **Saga failure recovery** → If the orchestrator itself crashes mid-saga, use a persistent saga log. On restart, replay incomplete sagas from their last known state

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Saga over 2PC | More complex failure handling, but no distributed locks and better availability |
| Redis + PostgreSQL for inventory | Dual-write complexity, but handles flash sale concurrency that DB alone cannot |
| Elasticsearch over DB search | Additional infrastructure and sync lag, but sub-200ms search with facets at scale |
| Cart in Redis over DB | Data loss risk on Redis failure, but 50ms cart operations vs 10ms+ with DB |
| Idempotency keys for checkout | Client complexity (must generate keys), but prevents duplicate orders on retry |

## Monitoring & Alerting
- **Order success rate**: Track end-to-end checkout completion. Alert if drops below 98%
- **Inventory discrepancy**: Redis vs PostgreSQL delta per SKU. Alert if > 1%
- **Search latency**: p50, p95, p99. Alert if p99 exceeds 500ms
- **Saga completion time**: Track per-step latency. Alert if any step exceeds 5s
`,
    timeComplexity: "Search: O(1) cache hit or O(log N) ES query. Cart ops: O(1) Redis. Order placement: O(1) per step in saga, ~5 steps total.",
    spaceComplexity: "~2.5 TB catalog, ~100 GB cart cache, ~5.5 TB/year orders. Elasticsearch index ~500 GB. Grows linearly with products and orders.",
    hints: [
      "Start with the checkout saga — it is the most architecturally complex component. Draw the state machine for order lifecycle and identify compensating actions for each step.",
      "For flash sales, ALL inventory decisions must happen in a single atomic Redis Lua script. Any check-then-update as two calls will have race conditions.",
      "Cart should be eventually consistent with catalog. Fetch prices fresh at checkout time, not from the cart. Store only product IDs and quantities in Redis.",
      "Design for graceful degradation: if Elasticsearch is down, fall back to DB queries. If Redis cart is down, show cached data. Every dependency needs a circuit breaker."
    ],
  },
  {
    id: 9012,
    description: `## Clarifying Questions to Ask
- What **payment methods** do we support? Credit cards, debit, ACH, digital wallets?
- What is the **transaction volume**? How many payments per second at peak?
- Do we need **multi-currency** support with real-time exchange rates?
- What **compliance requirements** apply? PCI-DSS level? SOC 2?
- Do we handle **settlement** ourselves or rely on acquiring banks?

## Functional Requirements
- Process payments across multiple methods (card, ACH, digital wallet)
- **Tokenize** sensitive card data so application servers never see raw card numbers
- Support **refunds** (full/partial), **chargebacks**, and dispute management
- Maintain a **double-entry ledger** for every financial transaction
- Provide **idempotent** APIs to prevent duplicate charges on retry

## Non-Functional Requirements
- **Exactly-once** payment processing semantics (no double charges)
- **99.999% availability** (< 5.3 minutes downtime/year)
- **PCI-DSS Level 1** compliance for card data handling
- Process up to **10,000 TPS** at peak with < 500ms latency

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Transactions / day | 100M |
| Peak TPS | **10,000** (holiday surges) |
| Average transaction size | $50, ~2KB record |
| Ledger entries / day | 200M (2 per transaction: debit + credit) |
| Storage / year | 100M x 365 x 2KB ≈ **73 TB/year** |
| Tokenization vault | 500M unique cards x 500B ≈ **250 GB** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle network partitions during payment?** → The payment gateway writes to a local WAL before calling the processor. If the response is lost, a reconciliation job queries the processor by idempotency key to determine the actual outcome. Never assume failure — always reconcile.
- **How would you support multi-currency?** → Lock the exchange rate at transaction creation time and store it with the payment record. Use a rate service that caches rates with 60s TTL from a provider like ECB or Open Exchange Rates.
- **How would you detect fraud in real-time?** → A rules engine (velocity checks, geo anomalies) runs synchronously in < 50ms. An ML model scores asynchronously. High-risk transactions are held for review. Combine both scores for a final decision.
- **How would you handle a processor outage?** → Circuit breaker pattern. After N failures, route traffic to a secondary processor. Queue non-urgent payments (ACH) for retry. Alert on-call immediately.
- **How would you audit every transaction?** → Immutable event log. Every state change is appended, never updated. Nightly reconciliation matches internal ledger against processor settlement reports and bank statements.`,
    intuition: `A payment system is fundamentally a **distributed state machine with financial correctness guarantees** — every dollar that enters must be accounted for, and no transaction can be lost or duplicated. The core design challenges are: (1) ensuring **exactly-once processing** despite network failures and retries, and (2) maintaining an **immutable audit trail** that passes regulatory compliance.`,
    approach: `## Component Overview

An **API gateway** with rate limiting and authentication routes payment requests. A **Payment Orchestrator** manages the transaction lifecycle through a state machine. A **Tokenization Vault** (PCI-scoped) handles sensitive card data. A **Double-Entry Ledger** records every financial movement. A **Fraud Detection Service** scores transactions in real-time before authorization.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/payments\` | Create | Body: \`{ amount, currency, method, token, idempotencyKey }\` → Returns \`{ paymentId, status }\` |
| \`POST /api/v1/payments/:id/capture\` | Update | Capture a previously authorized payment |
| \`POST /api/v1/payments/:id/refund\` | Create | Body: \`{ amount, reason, idempotencyKey }\` |
| \`GET /api/v1/payments/:id\` | Read | Payment status and history |
| \`POST /api/v1/tokens\` | Create | Tokenize card: \`{ cardNumber, expiry, cvv }\` → \`{ token }\` |

## Data Model

| Table | Key Columns | Notes |
|-------|-------------|-------|
| payments | id, idempotency_key (unique), amount, currency, status, method | Status: CREATED → AUTHORIZED → CAPTURED → SETTLED |
| ledger_entries | id, payment_id, account_id, type (DEBIT/CREDIT), amount | Immutable, append-only. Sum of debits = sum of credits |
| tokens | token (PK), encrypted_card, card_fingerprint, created_at | PCI-scoped database, HSM-encrypted |
| refunds | id, payment_id, amount, status, idempotency_key | Linked to original payment |
| fraud_scores | payment_id, rule_score, ml_score, decision | ALLOW / REVIEW / BLOCK |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+       +------------------+       +------------------+
| Merchant |------>| API Gateway      |------>| Payment          |
| Client   |       | (Auth, Rate      |       | Orchestrator     |
+----------+       |  Limit, TLS)     |       | (State Machine)  |
                   +------------------+       +--------+---------+
                                                       |
                   +-----------------------------------+---+
                   |                   |                    |
          +--------v--------+ +--------v--------+ +--------v--------+
          | Tokenization    | | Fraud Detection | | Ledger Service  |
          | Vault           | | Service         | | (Double-Entry)  |
          | (PCI Isolated)  | | (Rules + ML)    | |                 |
          |                 | |                 | | Debit + Credit  |
          | HSM Encryption  | | < 50ms sync    | | for every txn   |
          +--------+--------+ +--------+--------+ +--------+--------+
                   |                   |                    |
          +--------v--------+         |            +--------v--------+
          | Token DB        |         |            | Ledger DB       |
          | (Isolated VPC)  |         |            | (Append-only)   |
          +-----------------+         |            +-----------------+
                                      |
                              +-------v---------+
                              | Payment         |
                              | Processor       |
                              | (Visa/MC/ACH)   |
                              +-----------------+
\`\`\`

## Write Flow (Process Payment)

\`\`\`
Merchant     API Gateway    Orchestrator   Fraud Svc    Processor    Ledger
  |              |              |              |            |           |
  | POST /pay   |              |              |            |           |
  |------------->|              |              |            |           |
  |              | Check idemp. |              |            |           |
  |              |------------->|              |            |           |
  |              |              | Score txn    |            |           |
  |              |              |------------->|            |           |
  |              |              | ALLOW        |            |           |
  |              |              |<-------------|            |           |
  |              |              | Authorize    |            |           |
  |              |              |-------------------------->|           |
  |              |              |   Approved   |            |           |
  |              |              |<--------------------------|           |
  |              |              | Record debit+credit       |           |
  |              |              |---------------------------------------->|
  |              |              |              |            |   ACK     |
  |              |  { paymentId, status }      |            |           |
  |              |<-------------|              |            |           |
  |  Authorized  |              |              |            |           |
  |<-------------|              |              |            |           |
\`\`\`

## Read Flow (Payment Status)

\`\`\`
Merchant     API Gateway    Orchestrator   Payment DB     Ledger DB
  |              |              |              |              |
  | GET /pay/:id |              |              |              |
  |------------->|              |              |              |
  |              | Lookup       |              |              |
  |              |------------->|              |              |
  |              |              | Get payment  |              |
  |              |              |------------->|              |
  |              |              | Get entries  |              |
  |              |              |------------------------------>|
  |              |              |              |              |
  |              |  { payment + history }      |              |
  |              |<-------------|              |              |
  |  Status      |              |              |              |
  |<-------------|              |              |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Idempotency Implementation

The most critical property of a payment system — ensuring no duplicate charges despite retries.

\`\`\`
+-------------------------------------------------------+
| Idempotency Flow                                       |
|                                                        |
| Request arrives with idempotency_key: "abc-123"        |
|                                                        |
| +---------------------------------------------------+ |
| | 1. SELECT * FROM idempotency_keys                 | |
| |    WHERE key = "abc-123"                          | |
| |                                                   | |
| | [FOUND] --> Return stored response (HTTP 200)     | |
| |                                                   | |
| | [NOT FOUND] --> INSERT key with status "STARTED"  | |
| |    (unique constraint prevents race condition)    | |
| +---------------------------------------------------+ |
|                                                        |
| +---------------------------------------------------+ |
| | 2. Process payment normally                       | |
| |    Authorization -> Capture -> Ledger entry       | |
| +---------------------------------------------------+ |
|                                                        |
| +---------------------------------------------------+ |
| | 3. UPDATE idempotency_keys                        | |
| |    SET response = {paymentId, status}, TTL = 24h  | |
| |    WHERE key = "abc-123"                          | |
| +---------------------------------------------------+ |
+-------------------------------------------------------+
\`\`\`

The idempotency key is a unique constraint in the database. Concurrent duplicate requests: the first INSERT wins, the second gets a constraint violation and waits for the first to complete.

---

## Deep Dive: Double-Entry Ledger

Every financial movement creates exactly two entries that sum to zero, ensuring the books always balance.

\`\`\`
Payment of $100 from Customer to Merchant:

+-----------------------------------------------------+
| Ledger Entries (Immutable, Append-Only)              |
|                                                      |
| Entry 1: DEBIT  customer_account  -$100.00           |
| Entry 2: CREDIT merchant_account  +$100.00           |
|          --------------------------------            |
|          NET:                       $0.00            |
|                                                      |
| Refund of $30:                                       |
|                                                      |
| Entry 3: DEBIT  merchant_account  -$30.00            |
| Entry 4: CREDIT customer_account  +$30.00            |
|          --------------------------------            |
|          NET:                       $0.00            |
+-----------------------------------------------------+

Invariant: SUM(all entries) = 0 ALWAYS
          SUM(debits) = SUM(credits) per transaction

Reconciliation:
+-------------------+  +-------------------+  +----------------+
| Internal Ledger   |  | Processor Report  |  | Bank Statement |
| (our records)     |  | (Visa/MC daily)   |  | (daily)        |
+--------+----------+  +--------+----------+  +-------+--------+
         |                       |                     |
         +-----------+-----------+---------------------+
                     |
              +------v------+
              | Three-Way   |
              | Match       |
              | (nightly)   |
              +------+------+
                     |
          +----------+-----------+
          | MATCHED | MISSING | MISMATCH |
          | (99.9%) | (alert) | (alert)  |
          +---------+---------+----------+
\`\`\`

---

## Deep Dive: Payment State Machine

\`\`\`
+-----------------------------------------------------------+
| Payment State Machine                                      |
|                                                            |
|   CREATED --------> AUTHORIZED --------> CAPTURED          |
|     |                   |                    |             |
|     | (fraud block)     | (void)             | (settle)   |
|     v                   v                    v             |
|   DECLINED           VOIDED             SETTLED            |
|                                              |             |
|                                    +---------+---------+   |
|                                    |                   |   |
|                                    v                   v   |
|                              PARTIAL_REFUND      FULL_REFUND|
|                                                            |
| Rules:                                                     |
| - Cannot refund AUTHORIZED (must void instead)             |
| - Cannot capture VOIDED                                    |
| - Refund amount <= captured amount                         |
| - State transitions are append-only events                 |
+-----------------------------------------------------------+
\`\`\`

Each transition is recorded as an immutable event. The current state is derived by replaying events (event sourcing), ensuring a complete audit trail.
`,
    explanation: `## Bottlenecks & Improvements
- **Processor latency spikes** → Circuit breaker with fallback to secondary processor. Queue non-critical payments (subscriptions) for retry. Real-time monitoring of processor response times
- **Ledger write throughput** → Append-only design enables high write throughput. Partition ledger by account_id. Archive entries older than 2 years to cold storage
- **Idempotency key storage** → Keys expire after 24 hours. Use Redis for fast lookups with PostgreSQL as durable backup. Bloom filter as first-pass check
- **PCI scope creep** → Strict network segmentation. Tokenization vault is the only system that touches raw card data. All other services use tokens only

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Idempotency keys over deduplication | Client must generate unique keys, but guarantees exactly-once even across retries |
| Double-entry ledger over single-entry | More storage and write overhead, but self-auditing and regulatorily compliant |
| Event sourcing for state machine | Higher read complexity (must replay), but complete audit trail and ability to reconstruct any point in time |
| Separate tokenization vault | Operational complexity of isolated infrastructure, but minimizes PCI scope for main application |
| Synchronous fraud check | Adds 30-50ms latency, but blocks fraudulent transactions before authorization |

## Monitoring & Alerting
- **Payment success rate**: Per processor, per method. Alert if drops below 99.5%
- **Ledger balance check**: SUM(debits) must equal SUM(credits). Alert on any imbalance immediately
- **Idempotency hit rate**: High rate may indicate client retry storms or bugs
- **Fraud false positive rate**: Track legitimate transactions blocked. Target < 0.5%
`,
    timeComplexity: "Payment processing: O(1) per step — idempotency check, fraud score, processor call, ledger write. End-to-end ~300-500ms dominated by processor latency.",
    spaceComplexity: "~73 TB/year for ledger entries. ~250 GB for token vault. Idempotency keys: ~10 GB with 24h TTL. Grows linearly with transaction volume.",
    hints: [
      "Start with the idempotency mechanism — it is the single most important property. Without it, network retries will cause double charges, which is the worst possible failure mode.",
      "The double-entry ledger is non-negotiable for financial systems. Every transaction creates a debit and credit that sum to zero. This makes reconciliation straightforward and catches bugs early.",
      "PCI-DSS compliance drives architecture: the tokenization vault must be in an isolated network segment. Application servers should never see raw card numbers — only tokens.",
      "Design the payment state machine explicitly. Each state transition has validation rules (e.g., cannot refund an authorized-only payment). This prevents invalid operations and serves as documentation."
    ],
  },
  {
    id: 9013,
    description: `## Clarifying Questions to Ask
- What is the **scale**? How many hotels, rooms, and bookings per day?
- How do we handle **double-booking** prevention? What consistency model?
- Do we need to support **overbooking** strategies used by hotels?
- What is the **cancellation policy** model? Per-hotel configurable or global?
- Do we need **dynamic pricing** based on occupancy and demand?

## Functional Requirements
- **Search** available rooms by location, dates, guests, and price range
- **Real-time availability** checks to prevent double-booking
- **Book rooms** with payment processing and confirmation
- **Cancellations and modifications** with configurable refund policies
- **Dynamic pricing** based on occupancy, season, and demand signals

## Non-Functional Requirements
- **Strong consistency** for booking operations (no double-booking)
- **Low latency**: Search < 300ms, booking confirmation < 2s
- **High availability**: 99.99% uptime, especially during peak travel seasons
- **Scale**: Support 1M+ hotels, 50M searches/day, 1M bookings/day

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Hotels | 1M, average 100 rooms = **100M rooms** |
| Searches / day | 50M → **580 QPS** (peak: ~2K) |
| Bookings / day | 1M → **12 QPS** (peak: ~50) |
| Availability records | 100M rooms x 365 days = **36.5B rows/year** |
| Booking storage / year | 1M/day x 365 x 2KB ≈ **730 GB/year** |
| Search index size | 1M hotels x 10KB ≈ **10 GB** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle overbooking?** → Allow configurable overbooking percentage per hotel (e.g., 105% capacity). Track actual vs booked inventory separately. When overbooked guests arrive, offer upgrades or partner hotel placement with compensation.
- **How would you support last-minute deals?** → A scheduled job identifies unsold rooms within 48 hours of check-in. Automatically applies discount tiers (10% at 48h, 20% at 24h, 30% at 12h). Push notifications to users who searched for that destination.
- **How would you scale for peak travel season?** → Pre-warm caches with popular destinations. Auto-scale search infrastructure. Use read replicas for availability queries. Only the actual booking needs strong consistency.
- **How would you handle timezone complexity?** → All dates stored as hotel-local dates (not UTC timestamps). Check-in is always "local date" at the hotel. Search API accepts dates in hotel timezone. This avoids confusion for travelers crossing timezones.
- **How would you add price comparison?** → Aggregate pricing from multiple channels (direct, OTAs). Cache competitor prices with 15-minute TTL. Show best-price guarantee badge when direct price is lowest.`,
    intuition: `A hotel booking system is fundamentally a **calendar-based inventory manager with strong consistency requirements** — it must track room availability across date ranges and guarantee that no room is double-booked. The core challenge is efficiently querying **date-range availability** across millions of rooms while maintaining strict consistency at the moment of booking.`,
    approach: `## Component Overview

A **Search Service** backed by Elasticsearch handles hotel and room discovery. An **Availability Service** manages room-date inventory using PostgreSQL with row-level locking. A **Booking Service** orchestrates the reservation flow. A **Pricing Service** computes dynamic rates based on occupancy and demand. **Redis** caches search results and hotel details.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`GET /api/v1/hotels/search?location=&checkin=&checkout=&guests=\` | Search | Available hotels with prices |
| \`GET /api/v1/hotels/:id/rooms?checkin=&checkout=\` | Read | Room types and availability |
| \`POST /api/v1/bookings\` | Create | Body: \`{ hotelId, roomType, checkin, checkout, guestInfo, paymentToken }\` |
| \`PUT /api/v1/bookings/:id/cancel\` | Update | Cancel with refund per policy |
| \`GET /api/v1/bookings/:id\` | Read | Booking details and status |

## Data Model

| Table | Key Columns | Notes |
|-------|-------------|-------|
| hotels | id, name, location (lat/lng), city, star_rating | Geo-indexed for location search |
| room_types | id, hotel_id, name, base_price, max_guests, amenities | Room categories per hotel |
| room_availability | room_type_id, date, total_rooms, booked_rooms, version | One row per room-type per date, optimistic locking |
| bookings | id, hotel_id, room_type_id, checkin, checkout, status, user_id | Status: CONFIRMED → CHECKED_IN → COMPLETED / CANCELLED |
| pricing_rules | hotel_id, room_type_id, season, day_of_week, multiplier | Dynamic pricing configuration |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+       +------------------+       +------------------+
| Client   |------>| API Gateway      |------>| Search Service   |
| (Web/App)|       | (Auth, Rate      |       | (Elasticsearch)  |
+----------+       |  Limiting)       |       +--------+---------+
                   +--------+---------+                |
                            |                  +-------v---------+
              +-------------+-------------+    | Hotel/Room Data |
              |             |             |    | (Read Replicas) |
     +--------v---+ +-------v----+ +------v--+ +----------------+
     | Booking    | | Avail.     | | Pricing |
     | Service    | | Service    | | Service |
     |            | |            | |         |
     | Saga flow  | | Date-range | | Dynamic |
     |            | | queries    | | rates   |
     +--------+---+ +------+-----+ +----+----+
              |            |             |
              |     +------v-------------v-----+
              |     | PostgreSQL                |
              |     | (Bookings, Availability,  |
              |     |  Pricing Rules)           |
              |     +--------------------------+
              |            |
              |     +------v-----------+
              +---->| Payment Service  |
                    +------------------+
\`\`\`

## Write Flow (Make Booking)

\`\`\`
Client       API Gateway    Booking Svc    Avail. Svc     Payment
  |              |              |              |              |
  | POST /book  |              |              |              |
  |------------->|              |              |              |
  |              | Create       |              |              |
  |              |------------->|              |              |
  |              |              | Check+Lock   |              |
  |              |              |------------->|              |
  |              |              |              |              |
  |              |              | BEGIN TXN    |              |
  |              |              | SELECT ... WHERE            |
  |              |              | room_type_id=X AND date     |
  |              |              | BETWEEN checkin AND checkout |
  |              |              | AND booked < total          |
  |              |              | FOR UPDATE                  |
  |              |              |              |              |
  |              |              | UPDATE booked_rooms += 1    |
  |              |              | INSERT booking              |
  |              |              | COMMIT        |              |
  |              |              |              |              |
  |              |              | Charge card  |              |
  |              |              |------------------------------>|
  |              |              |   Paid       |              |
  |              |              |<------------------------------|
  |              |  Confirmed   |              |              |
  |              |<-------------|              |              |
  |  Booking ID  |              |              |              |
  |<-------------|              |              |              |
\`\`\`

## Read Flow (Search Availability)

\`\`\`
Client       API Gateway    Search Svc     Cache          Avail. Svc
  |              |              |              |              |
  | GET /search  |              |              |              |
  |------------->|              |              |              |
  |              | Search       |              |              |
  |              |------------->|              |              |
  |              |              | Check cache  |              |
  |              |              |------------->|              |
  |              |              | [MISS]       |              |
  |              |              | Query ES for hotels         |
  |              |              | Get availability            |
  |              |              |------------------------------>|
  |              |              | Room counts per date        |
  |              |              |<------------------------------|
  |              |              | Cache 5 min  |              |
  |              |              |------------->|              |
  |              | Hotels+rooms |              |              |
  |              |<-------------|              |              |
  |  Results     |              |              |              |
  |<-------------|              |              |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Date-Range Availability Query

The most performance-critical operation — checking room availability across a date range while preventing double-booking.

\`\`\`
Availability Table (one row per room-type per date):

+---------------+------------+-------------+--------------+---------+
| room_type_id  | date       | total_rooms | booked_rooms | version |
+---------------+------------+-------------+--------------+---------+
| RT_101        | 2025-07-01 | 10          | 7            | 42      |
| RT_101        | 2025-07-02 | 10          | 8            | 38      |
| RT_101        | 2025-07-03 | 10          | 10           | 55      |  <-- FULL
| RT_101        | 2025-07-04 | 10          | 6            | 29      |
+---------------+------------+-------------+--------------+---------+

Query: "Book RT_101 for July 1-4"
  Must check ALL dates in range have available rooms.
  July 3 is full --> booking fails.

SQL (with pessimistic locking):
  BEGIN;
  SELECT date, total_rooms, booked_rooms
    FROM room_availability
    WHERE room_type_id = 'RT_101'
      AND date >= '2025-07-01' AND date < '2025-07-04'
      AND total_rooms > booked_rooms
    FOR UPDATE;

  -- If COUNT(rows) = number_of_nights, all dates available
  -- Update all rows in range atomically
  UPDATE room_availability
    SET booked_rooms = booked_rooms + 1
    WHERE room_type_id = 'RT_101'
      AND date >= '2025-07-01' AND date < '2025-07-04';
  COMMIT;
\`\`\`

FOR UPDATE locks the rows, preventing concurrent bookings from double-booking the same room-dates.

---

## Deep Dive: Dynamic Pricing Engine

\`\`\`
+------------------------------------------------------+
| Pricing Service                                       |
|                                                       |
| Inputs:                                               |
| +--------------------------------------------------+ |
| | 1. Base price (room type)              $150       | |
| | 2. Occupancy multiplier (80% full)     x 1.3     | |
| | 3. Seasonal factor (summer)            x 1.2     | |
| | 4. Day-of-week (Saturday)              x 1.1     | |
| | 5. Demand signal (search volume)       x 1.05    | |
| +--------------------------------------------------+ |
|                                                       |
| Calculation:                                          |
|   $150 x 1.3 x 1.2 x 1.1 x 1.05 = $270.27          |
|   Rounded: $270/night                                 |
|                                                       |
| +--------------------------------------------------+ |
| | Price Boundaries:                                 | |
| | - Floor: base_price x 0.7  ($105 minimum)        | |
| | - Ceiling: base_price x 3.0 ($450 maximum)       | |
| | - Rate parity: cannot exceed OTA listed price     | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
\`\`\`

Prices are pre-computed nightly for the next 365 days and cached. Real-time adjustments happen when occupancy changes by > 5% since last computation.

---

## Deep Dive: Booking Cancellation with Policy Engine

\`\`\`
+------------------------------------------------------+
| Cancellation Policy Engine                            |
|                                                       |
| Policy (per hotel, stored as config):                 |
|                                                       |
|   Days before check-in:                               |
|   +--------------------------------------------------+|
|   | > 7 days   | Full refund (100%)                  ||
|   | 3-7 days   | Partial refund (50%)                ||
|   | 1-3 days   | No refund (0%)                      ||
|   | < 1 day    | No refund, no-show fee applied      ||
|   +--------------------------------------------------+|
|                                                       |
| Flow:                                                 |
|   1. Look up booking -> get hotel cancellation policy |
|   2. Calculate days until check-in                    |
|   3. Apply refund percentage                          |
|   4. Release room availability (booked_rooms -= 1)    |
|   5. Process refund via payment service               |
|   6. Notify guest and hotel                           |
+------------------------------------------------------+
\`\`\`
`,
    explanation: `## Bottlenecks & Improvements
- **Hot hotel contention** → Popular hotels get many concurrent booking attempts on the same dates. Row-level locking handles this but creates queuing. For very hot properties, use Redis-based optimistic reservation with DB confirmation
- **Search result freshness** → Cached search results may show rooms that are just booked. Accept stale-by-5-minutes for search results; do a real-time availability check when user clicks "Book Now"
- **Date range query performance** → Querying availability across a 14-night stay checks 14 rows. Index on (room_type_id, date) makes this fast. For longer stays, pre-compute weekly availability summaries
- **Global hotel coverage** → Hotels in different regions need low-latency access. Deploy read replicas per region. Writes route to the primary region of the hotel (based on hotel location)

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Row-per-date over bitmap | More storage, but simpler queries and natural fit for SQL range operations |
| Pessimistic locking over optimistic | Lower throughput under contention, but guarantees no double-booking without retry logic |
| Pre-computed pricing over real-time | Stale prices (up to 1 hour), but eliminates pricing computation from the booking hot path |
| Elasticsearch for search over DB | Additional infrastructure to maintain, but sub-300ms search with geo and text queries |
| Cache search results 5 min | May show unavailable rooms, but reduces DB load by 90%+ |

## Monitoring & Alerting
- **Double-booking detection**: Nightly audit compares bookings against availability. Alert on any overcount
- **Booking success rate**: Track funnel from search → detail → book → confirm. Alert if conversion drops
- **Availability sync**: Compare cached availability vs DB. Alert if drift exceeds 5%
- **Payment failure rate**: Track by hotel and region. Alert if > 2% failures
`,
    timeComplexity: "Search: O(1) cache hit or O(log N) ES query. Booking: O(nights) for date-range lock and update. Cancellation: O(nights) to release dates.",
    spaceComplexity: "~36.5B availability rows/year (~700 GB with indexing). ~730 GB/year bookings. Search index ~10 GB. Grows with hotels x dates.",
    hints: [
      "The date-range availability check is the core technical challenge. One row per room-type per date with FOR UPDATE locking prevents double-booking while keeping queries simple.",
      "Separate search (eventually consistent, cached) from booking (strongly consistent, real-time). Search can tolerate stale data; booking cannot.",
      "Cancellation policies should be data-driven configuration, not code. Store as JSON per hotel so owners can customize without engineering involvement.",
      "For the overlap detection formula: existing.check_in < new.check_out AND existing.check_out > new.check_in. This catches all four overlap cases."
    ],
  },
  {
    id: 9014,
    description: `## Clarifying Questions to Ask
- What is the **peak concurrency**? How many users try to buy tickets simultaneously for a hot event?
- Do users select **specific seats** or are they assigned automatically?
- How long is the **hold/checkout window** before reserved seats are released?
- Do we need a **virtual queue** (waiting room) for high-demand events?
- What **anti-scalping measures** are required (purchase limits, bot detection)?

## Functional Requirements
- Browse and search **events** by category, location, date, and artist
- View **venue seat maps** with real-time seat availability
- **Select and hold seats** with a time-limited checkout window (10 minutes)
- **Virtual waiting queue** for high-demand events with fair ordering
- **Purchase tickets** with payment processing and QR code generation

## Non-Functional Requirements
- **Strong consistency** for seat assignments (no double-selling)
- Handle **millions of concurrent users** hitting a single event on-sale
- **Seat holds expire** reliably after timeout (no permanent leaks)
- Sub-second **seat map updates** for real-time availability visualization

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Events on platform | 500K active events |
| Seats per major venue | 20,000 - 80,000 |
| Peak concurrent users (hot event) | **5M+ in waiting queue** |
| Ticket purchases / second (peak) | **10,000 TPS** |
| Seat status updates | 80K seats x real-time = **40K updates/sec** |
| Ticket storage / year | 200M tickets x 1KB ≈ **200 GB/year** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you prevent bots?** → CAPTCHA before queue entry, device fingerprinting, behavioral analysis (click patterns, mouse movement). Randomize queue positions rather than strict FIFO so early-connecting bots gain no advantage.
- **How would you handle a partial system failure during on-sale?** → Dedicated on-sale infrastructure isolated from normal operations. If payment fails after seat hold, auto-release after timeout. Circuit breakers prevent cascade failures. Users keep queue position.
- **How would you support dynamic pricing?** → Track demand signals (queue length, sell velocity) and adjust prices per section in real-time. Show users the price before they commit. Store price-at-purchase with the ticket.
- **What if a user's session dies mid-checkout?** → Seat hold is tied to a session token with TTL in Redis. User can resume checkout within the hold window using the same session. After TTL expiry, seats are released automatically.
- **How would you handle ticket transfers and resale?** → Generate new QR code on transfer, invalidate the old one. For resale, enforce price caps (e.g., max 1.5x face value). Verify identity at venue entry to match ticket holder.`,
    intuition: `A ticket booking system is fundamentally a **high-concurrency seat reservation engine** — millions of users compete for a fixed, finite inventory where every item (seat) is unique and cannot be oversold. The core design challenge is managing a **massive thundering herd** when tickets go on sale while maintaining fairness and preventing both double-selling and permanent seat leaks.`,
    approach: `## Component Overview

A **Virtual Queue Service** manages the waiting room using Redis sorted sets to throttle admission during high-demand on-sales. A **Seat Inventory Service** tracks per-seat status using Redis bitmaps for performance. A **Hold Manager** with TTL-based expiration ensures seats are released if checkout is not completed. **PostgreSQL** is the source of truth for completed bookings.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/queue/join\` | Create | Join waiting queue: \`{ eventId, sessionToken }\` → \`{ position, estimatedWait }\` |
| \`GET /api/v1/queue/status\` | Read | Check queue position and admission status |
| \`GET /api/v1/events/:id/seats\` | Read | Seat map with real-time availability |
| \`POST /api/v1/holds\` | Create | Hold seats: \`{ eventId, seatIds[], sessionToken }\` → \`{ holdId, expiresAt }\` |
| \`POST /api/v1/purchases\` | Create | Complete purchase: \`{ holdId, paymentToken }\` → \`{ ticketIds[], qrCodes[] }\` |

## Data Model

| Table | Key Columns | Notes |
|-------|-------------|-------|
| events | id, name, venue_id, date, on_sale_time, total_seats | Event metadata |
| seats | event_id, seat_id, section, row, number, status | Status: AVAILABLE → HELD → SOLD |
| holds | id, event_id, seat_ids[], session_token, expires_at | TTL-based, auto-release on expiry |
| tickets | id, event_id, seat_id, user_id, qr_code, price | Immutable after purchase |
| queue_entries | event_id, session_token, position, admitted_at | Virtual queue state |
`,
    code: `## Architecture Diagram

\`\`\`
+----------+       +------------------+       +------------------+
| Users    |------>| CDN / Edge       |------>| Virtual Queue    |
| (5M+)    |       | (Static assets,  |       | Service          |
+----------+       |  queue page)     |       | (Redis Sorted    |
                   +------------------+       |  Sets)           |
                                              +--------+---------+
                                                       |
                                              Admitted users only
                                                       |
                   +------------------+       +--------v---------+
                   | WebSocket Server |<------| Seat Inventory   |
                   | (Real-time seat  |       | Service          |
                   |  map updates)    |       | (Redis Bitmaps)  |
                   +------------------+       +--------+---------+
                                                       |
                                              +--------v---------+
                                              | Hold Manager     |
                                              | (TTL-based holds)|
                                              | 10-min window    |
                                              +--------+---------+
                                                       |
                                              +--------v---------+
                                              | Purchase Service |
                                              | (Payment + QR)   |
                                              +--------+---------+
                                                       |
                                              +--------v---------+
                                              | PostgreSQL       |
                                              | (Tickets, Orders)|
                                              +------------------+
\`\`\`

## Write Flow (Select and Purchase Seats)

\`\`\`
User         Queue Svc      Seat Svc       Hold Mgr       Purchase
  |              |              |              |              |
  | Join queue   |              |              |              |
  |------------->|              |              |              |
  | Position: 847|              |              |              |
  |<-------------|              |              |              |
  |    ...wait...|              |              |              |
  | Admitted!    |              |              |              |
  |<-------------|              |              |              |
  |              |              |              |              |
  | GET /seats   |              |              |              |
  |-------------------------->|              |              |
  | Seat map bitmap            |              |              |
  |<--------------------------|              |              |
  |              |              |              |              |
  | POST /holds (seatIds)      |              |              |
  |-------------------------->|              |              |
  |              |              | Create hold  |              |
  |              |              |------------->|              |
  |              |              | TTL: 10 min  |              |
  |              |              |<-------------|              |
  | Hold confirmed (10 min)    |              |              |
  |<--------------------------|              |              |
  |              |              |              |              |
  | POST /purchase (holdId)    |              |              |
  |--------------------------------------------------->|
  |              |              |              |  Verify hold |
  |              |              |              |<-------------|
  |              |              |              |  Valid       |
  |              |              |              |------------->|
  |              |              |              |  Mark SOLD   |
  |  Tickets + QR codes        |              |              |
  |<---------------------------------------------------|
\`\`\`

## Read Flow (Real-Time Seat Map)

\`\`\`
User         WebSocket       Seat Svc       Redis Bitmap
  |              |              |              |
  | Connect WS   |              |              |
  |------------->|              |              |
  |              | Subscribe    |              |
  |              | event:123    |              |
  |              |              |              |
  |              | Initial bitmap              |
  |              |<-------------|              |
  | Full seat map|              |              |
  |<-------------|              |              |
  |              |              |              |
  |   (another user holds seat 42)             |
  |              |              | BIT SET      |
  |              |              |------------->|
  |              | Diff: seat 42 -> HELD       |
  |              |<-------------|              |
  | Update seat 42              |              |
  |<-------------|              |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Virtual Queue for High-Demand Events

When millions of users hit an on-sale simultaneously, the queue absorbs the thundering herd and admits users at a controlled rate.

\`\`\`
+------------------------------------------------------+
| Virtual Queue Architecture                            |
|                                                       |
| Pre-sale (queue opens 30 min before on-sale):         |
| +--------------------------------------------------+ |
| | Redis Sorted Set: queue:{eventId}                | |
| |                                                  | |
| | Score = random (shuffled at on-sale time)        | |
| | Member = session_token                           | |
| |                                                  | |
| | session_abc -> 0.142  (position after shuffle)   | |
| | session_def -> 0.287                             | |
| | session_ghi -> 0.501                             | |
| | ...5M entries                                    | |
| +--------------------------------------------------+ |
|                                                       |
| On-sale (admission begins):                           |
| +--------------------------------------------------+ |
| | Admission Rate Controller                        | |
| |                                                  | |
| | Target: 500 users/second admitted                | |
| | Based on: checkout capacity, not queue size      | |
| |                                                  | |
| | Every 2 seconds:                                 | |
| |   ZPOPMIN queue:{eventId} 1000                   | |
| |   Move to admitted:{eventId} set                 | |
| |   Notify via WebSocket: "You are now admitted"   | |
| +--------------------------------------------------+ |
|                                                       |
| Position Estimator (honest with users):               |
| +--------------------------------------------------+ |
| | Position: 50,247 of 2,100,000                    | |
| | Available seats: 20,000                          | |
| | Admission rate: 500/sec                          | |
| | Estimated wait: ~100 seconds                     | |
| | NOTE: Tickets may sell out before your turn      | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
\`\`\`

Queue positions are randomized (not FIFO) to defeat bots that connect milliseconds early. CAPTCHA is required before joining.

---

## Deep Dive: Seat Inventory with Redis Bitmaps

\`\`\`
+------------------------------------------------------+
| Redis Bitmap: seats:{eventId}                         |
|                                                       |
| Bit index = seat_id (0 to 79,999 for 80K venue)     |
| Bit value: 0 = AVAILABLE, 1 = HELD or SOLD          |
|                                                       |
| Memory: 80,000 bits = 10 KB per event                |
|                                                       |
| +--------------------------------------------------+ |
| | Operations:                                      | |
| |                                                  | |
| | Check seat:  GETBIT seats:123 4502  --> 0 (free) | |
| | Hold seat:   SETBIT seats:123 4502  --> 1        | |
| | Release:     SETBIT seats:123 4502  --> 0        | |
| | Count avail: BITCOUNT seats:123     --> 62,481   | |
| |                                                  | |
| | Atomic multi-seat hold (Lua script):             | |
| | 1. Check all requested bits are 0                | |
| | 2. If yes, set all bits to 1                     | |
| | 3. If any bit is 1, return CONFLICT              | |
| +--------------------------------------------------+ |
|                                                       |
| Second bitmap for SOLD vs HELD distinction:           |
| +--------------------------------------------------+ |
| | sold:{eventId}   - permanent                     | |
| | held:{eventId}   - with TTL per seat             | |
| |                                                  | |
| | Seat state = held[i] OR sold[i]                  | |
| | Display: held=yellow, sold=red, neither=green    | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
\`\`\`

---

## Deep Dive: Hold Expiration and Seat Release

\`\`\`
+------------------------------------------------------+
| Hold Manager (Belt and Suspenders)                    |
|                                                       |
| Layer 1: Redis TTL                                    |
| +--------------------------------------------------+ |
| | SET hold:{holdId} {seatIds} EX 600               | |
| | When key expires -> keyspace notification         | |
| |                  -> release seats in bitmap       | |
| +--------------------------------------------------+ |
|                                                       |
| Layer 2: Cleanup Job (every 30 seconds)               |
| +--------------------------------------------------+ |
| | SELECT * FROM holds                              | |
| |   WHERE status = 'ACTIVE'                        | |
| |   AND expires_at < NOW()                         | |
| |                                                  | |
| | For each expired hold:                           | |
| |   1. Clear bits in Redis bitmap                  | |
| |   2. Update hold status = 'EXPIRED'              | |
| |   3. Log for auditing                            | |
| +--------------------------------------------------+ |
|                                                       |
| Layer 3: On-access verification                       |
| +--------------------------------------------------+ |
| | Before any seat operation:                       | |
| |   Verify hold is still active in Redis           | |
| |   If not, release and return error               | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
\`\`\`

Three layers ensure no seat is permanently leaked, even if Redis TTL events are missed.
`,
    explanation: `## Bottlenecks & Improvements
- **Queue thundering herd** → The queue page itself is served from CDN (static HTML/JS). Only queue status polling hits the backend. Use long-polling or WebSocket to reduce poll frequency
- **Seat map broadcast storm** → With 50K+ concurrent viewers, pushing every seat change to every user is expensive. Batch updates every 2 seconds and only send diffs (changed bits), not the full bitmap
- **Hold expiration reliability** → Redis keyspace notifications are not guaranteed. The cleanup job catches anything missed. On-access verification is the final safety net
- **Payment timeout during hold** → If payment takes > 10 minutes, the hold expires and seats are released mid-payment. Extend hold by 2 minutes when payment is initiated, and cap at 12 minutes total

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Virtual queue over direct access | Adds wait time for all users, but prevents system overload and ensures fairness |
| Redis bitmaps over DB rows per seat | Less flexible querying, but 10KB per event vs 80K rows, and O(1) bit operations |
| Randomized queue over FIFO | Less intuitive for users, but defeats bots that connect early |
| 10-minute hold window | Too short frustrates slow users, too long starves waiting users. 10 min is industry standard |
| Separate on-sale infrastructure | Higher cost, but prevents hot events from degrading normal operations |

## Monitoring & Alerting
- **Double-sell detection**: After each on-sale, count sold tickets per seat. Alert if any seat has count > 1
- **Hold leak detection**: Compare active holds vs bitmap bits. Alert if bitmap shows held seats with no matching hold record
- **Queue admission rate**: Track actual vs target. Alert if admission stalls (stuck queue)
- **Seat map update latency**: Track WebSocket push delay. Alert if > 3 seconds behind real-time
`,
    timeComplexity: "Queue join: O(log N) sorted set insert. Seat hold: O(K) for K seats via bitmap. Purchase: O(1) per seat. Seat map: O(1) bitmap read, 10KB transfer.",
    spaceComplexity: "Queue: ~50 bytes x 5M users = ~250 MB per hot event. Seat bitmap: ~10 KB per event. Tickets: ~200 GB/year. Redis total for active events: < 5 GB.",
    hints: [
      "The virtual queue is the key architectural decision. Without it, millions of simultaneous requests will overwhelm any backend. Admit users at the rate your checkout pipeline can handle.",
      "Redis bitmaps are ideal for seat inventory: 80K seats in 10KB, O(1) per-seat operations, and Lua scripts for atomic multi-seat holds. Much faster than DB row-per-seat.",
      "Hold expiration needs three layers: Redis TTL (primary), cleanup job (backup), on-access verification (safety net). Never rely on a single mechanism for releasing seats.",
      "Be honest with queue position estimates. If 50K seats remain and user is at position 100K, tell them tickets will likely sell out. This reduces frustration and server load."
    ],
  },
  {
    id: 9015,
    description: `## Clarifying Questions to Ask
- What is the **delivery radius**? City-level or cross-city?
- How many **concurrent drivers** and **active orders** at peak?
- What **ETA accuracy** is expected? Within how many minutes?
- Do we support **order stacking** (multiple deliveries per driver)?
- What **real-time tracking** granularity is needed? (GPS update frequency)

## Functional Requirements
- Customers **browse menus**, place orders, and **track delivery** in real-time
- Restaurants **receive orders**, manage menus, and update preparation status
- **Match orders** with optimal drivers based on proximity, load, and route
- **Real-time GPS tracking** of driver location throughout delivery
- **ETA prediction** for each stage: preparation, pickup, and delivery

## Non-Functional Requirements
- **Low latency**: Order placement < 1s, driver matching < 5s
- **High throughput**: Support 1M+ concurrent deliveries at peak mealtimes
- Location updates processed within **2 seconds** of transmission
- **99.9% availability** with graceful degradation (matching > ETA > tracking)

## Capacity Estimation

| Metric | Estimate |
|--------|----------|
| Orders / day | 10M |
| Peak concurrent deliveries | **1M** (lunch/dinner rush) |
| Active drivers at peak | **500K** |
| Location updates / second | 500K drivers x 1 update/4s = **125K/sec** |
| Order storage / year | 10M/day x 365 x 3KB ≈ **11 TB/year** |
| Location data / day | 125K/sec x 86,400 x 100B ≈ **1 TB/day** |
`,
    examples: `## Follow-Up Discussion Points
- **How would you handle no available drivers?** → Expand search radius progressively (5km → 10km → 15km), increasing driver incentive at each step. After 3 minutes, notify customer with options: wait longer, cancel for full refund, or switch to pickup.
- **How would you support order stacking?** → A driver can carry 2-3 orders if routes are compatible. The matching algorithm checks if a driver's current route passes near the new restaurant. Stacking increases efficiency but must not degrade ETA for existing orders.
- **How would you handle surge pricing?** → Use hexagonal geo-zones (H3 grid). Track supply (available drivers) and demand (pending orders) per zone. Compute multiplier as demand-to-supply ratio normalized against historical averages. Update every 60 seconds.
- **How would you improve ETA accuracy?** → Three-component model: restaurant prep time (historical avg + current load) + driver-to-restaurant travel (routing API + traffic) + restaurant-to-customer travel. Add buffers for weather and rush hour. Continuously refine based on actual delivery times.
- **How would you handle restaurant-side delays?** → If prep time exceeds estimate by more than 5 minutes, delay driver dispatch to avoid idle waiting. Notify customer with updated ETA. Track restaurant reliability scores for future matching and ranking.`,
    intuition: `A food delivery system is fundamentally a **real-time logistics optimization engine** — it must continuously match supply (drivers) with demand (orders) across a dynamic geographic space while predicting accurate ETAs. The core challenge is the **three-way coordination** between customer, restaurant, and driver, where each has different constraints and timelines.`,
    approach: `## Component Overview

An **Order Service** manages the order lifecycle. A **Dispatch Service** matches orders to drivers using a scoring algorithm with Redis GEO for spatial queries. A **Location Service** ingests high-throughput GPS updates and stores them in Redis. A **Tracking Service** pushes real-time updates to customers via WebSockets. An **ETA Service** predicts delivery times using routing data and historical patterns.

## API Design

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`POST /api/v1/orders\` | Create | Place order: \`{ restaurantId, items[], deliveryAddress }\` |
| \`GET /api/v1/orders/:id/track\` | Read | WebSocket upgrade for real-time tracking |
| \`POST /api/v1/drivers/location\` | Update | GPS update: \`{ lat, lng, heading, speed }\` (every 4s) |
| \`POST /api/v1/dispatch/accept\` | Update | Driver accepts: \`{ orderId, driverId }\` |
| \`GET /api/v1/orders/:id/eta\` | Read | Current ETA breakdown by stage |

## Data Model

| Table | Key Columns | Notes |
|-------|-------------|-------|
| orders | id, customer_id, restaurant_id, driver_id, status, total | Status: PLACED → CONFIRMED → PREPARING → PICKED_UP → DELIVERED |
| restaurants | id, name, location, avg_prep_time, rating | Geo-indexed |
| drivers | id, name, status, vehicle_type, rating, current_location | Status: AVAILABLE, BUSY, OFFLINE |
| driver_locations | driver_id, lat, lng, heading, speed, timestamp | Redis GEO + time-series DB |
| delivery_routes | order_id, pickup_eta, delivery_eta, actual_times | ETA tracking and model training |
`,
    code: `## Architecture Diagram

\`\`\`
+-----------+     +------------------+     +------------------+
| Customer  |---->| API Gateway      |---->| Order Service    |
| App       |     |                  |     | (Lifecycle mgmt) |
+-----------+     +--+---------------+     +--------+---------+
                     |                              |
+-----------+        |                     +--------v---------+
| Restaurant|--------+                     | Dispatch Service |
| App       |        |                     | (Order-Driver    |
+-----------+        |                     |  matching)       |
                     |                     +--------+---------+
+-----------+        |                              |
| Driver    |--------+                     +--------v---------+
| App       |                              | Redis GEO        |
+-----------+                              | (Driver positions|
     |                                     |  + matching)     |
     | GPS updates                         +--------+---------+
     | (every 4s)                                   |
     v                                              |
+------------------+                       +--------v---------+
| Location Service |---------------------->| ETA Service      |
| (High-throughput |    location data      | (Prediction      |
|  ingestion)      |                       |  model)          |
+--------+---------+                       +------------------+
         |
+--------v---------+       +------------------+
| Redis GEO +      |------>| Tracking Service |
| Kafka (events)   |       | (WebSocket push  |
+------------------+       |  to customers)   |
                           +------------------+
\`\`\`

## Write Flow (Place Order and Dispatch)

\`\`\`
Customer     Order Svc      Dispatch       Redis GEO      Driver
  |              |              |              |              |
  | POST /order  |              |              |              |
  |------------->|              |              |              |
  |              | Create order |              |              |
  |              | status=PLACED|              |              |
  |              |              |              |              |
  |              | Find driver  |              |              |
  |              |------------->|              |              |
  |              |              | GEORADIUS    |              |
  |              |              | 5km around   |              |
  |              |              | restaurant   |              |
  |              |              |------------->|              |
  |              |              | [driver1,    |              |
  |              |              |  driver2,..] |              |
  |              |              |<-------------|              |
  |              |              |              |              |
  |              |              | Score & rank |              |
  |              |              | (distance,   |              |
  |              |              |  rating,     |              |
  |              |              |  heading)    |              |
  |              |              |              |              |
  |              |              | Push offer   |              |
  |              |              |------------------------------>|
  |              |              |   ACCEPT     |              |
  |              |              |<------------------------------|
  |              | Driver matched|              |              |
  |              |<-------------|              |              |
  |  Confirmed   |              |              |              |
  |<-------------|              |              |              |
\`\`\`

## Read Flow (Real-Time Tracking)

\`\`\`
Driver        Location Svc    Redis GEO     Tracking Svc    Customer
  |               |              |              |              |
  | GPS update    |              |              |              |
  | (lat,lng)     |              |              |              |
  |-------------->|              |              |              |
  |               | GEOADD       |              |              |
  |               |------------->|              |              |
  |               | Publish to   |              |              |
  |               | Kafka topic  |              |              |
  |               |              |              |              |
  |               |              |    Consume   |              |
  |               |              |    location  |              |
  |               |              |------------->|              |
  |               |              |              | Push via WS  |
  |               |              |              |------------->|
  |               |              |              |  {lat, lng,  |
  |               |              |              |   eta: 8min} |
  |               |              |              |              |
\`\`\`
`,
    jsCode: `## Deep Dive: Driver Matching Algorithm

The dispatch service must find the best driver for each order, balancing speed, cost, and driver experience.

\`\`\`
+------------------------------------------------------+
| Dispatch Service - Matching Flow                      |
|                                                       |
| Step 1: Spatial Query                                 |
| +--------------------------------------------------+ |
| | GEORADIUS restaurant:location 5km                | |
| | Returns: [driver_a: 1.2km, driver_b: 3.1km,     | |
| |           driver_c: 0.8km, driver_d: 4.5km]     | |
| +--------------------------------------------------+ |
|                                                       |
| Step 2: Multi-Factor Scoring                          |
| +--------------------------------------------------+ |
| | For each candidate driver:                       | |
| |                                                  | |
| | score = w1 * distance_score                      | |
| |       + w2 * heading_score                       | |
| |       + w3 * rating_score                        | |
| |       + w4 * acceptance_rate                     | |
| |       + w5 * current_load_score                  | |
| |                                                  | |
| | driver_c: 0.8km, heading toward, 4.8 rating     | |
| |   score = 0.4*0.95 + 0.2*0.9 + 0.2*0.96        | |
| |         + 0.1*0.88 + 0.1*1.0 = 0.94             | |
| |                                                  | |
| | driver_a: 1.2km, heading away, 4.5 rating       | |
| |   score = 0.4*0.85 + 0.2*0.3 + 0.2*0.90        | |
| |         + 0.1*0.92 + 0.1*0.8 = 0.75             | |
| +--------------------------------------------------+ |
|                                                       |
| Step 3: Offer to Top-Scored Driver                    |
| +--------------------------------------------------+ |
| | Send push notification to driver_c               | |
| | Timeout: 30 seconds to accept                    | |
| | If declined/timeout: offer to next driver        | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
\`\`\`

Distance alone is insufficient. A driver heading toward the restaurant at speed will arrive faster than a closer driver stuck in traffic heading the other direction.

---

## Deep Dive: ETA Prediction Model

\`\`\`
+------------------------------------------------------+
| ETA Service - Three-Component Model                   |
|                                                       |
| Component 1: Restaurant Prep Time                     |
| +--------------------------------------------------+ |
| | Inputs:                                          | |
| |   - Restaurant historical avg: 18 min           | |
| |   - Current active orders: 12 (busy)            | |
| |   - Order complexity: 5 items (above avg)       | |
| |   - Time of day: 12:30 PM (lunch rush)          | |
| |                                                  | |
| | Model: base_prep * load_factor * complexity      | |
| | = 18 * 1.3 * 1.1 = 25.7 min                     | |
| +--------------------------------------------------+ |
|                                                       |
| Component 2: Driver-to-Restaurant Travel              |
| +--------------------------------------------------+ |
| | Inputs:                                          | |
| |   - Distance: 2.1 km                            | |
| |   - Routing API: 8 min (with traffic)           | |
| |   - Weather: rain (+2 min buffer)               | |
| |                                                  | |
| | = 8 + 2 = 10 min                                | |
| +--------------------------------------------------+ |
|                                                       |
| Component 3: Restaurant-to-Customer Travel            |
| +--------------------------------------------------+ |
| | Inputs:                                          | |
| |   - Distance: 3.4 km                            | |
| |   - Routing API: 12 min (with traffic)          | |
| |   - Weather: rain (+3 min buffer)               | |
| |                                                  | |
| | = 12 + 3 = 15 min                               | |
| +--------------------------------------------------+ |
|                                                       |
| Total ETA: max(prep, driver_to_rest) + rest_to_cust  |
|          = max(25.7, 10) + 15                         |
|          = 25.7 + 15 = 40.7 min                      |
|          Displayed: ~41 min (confidence: 85%)         |
+------------------------------------------------------+
\`\`\`

Prep time and driver-to-restaurant overlap (driver waits if food is not ready). The ETA is continuously refined as real data arrives.

---

## Deep Dive: Location Ingestion Pipeline

\`\`\`
+------------------------------------------------------+
| Location Service - High-Throughput Pipeline           |
|                                                       |
| 500K drivers sending GPS every 4 seconds              |
| = 125,000 updates/second                              |
|                                                       |
| +--------------------------------------------------+ |
| | Driver App                                       | |
| |   POST /drivers/location                         | |
| |   { lat, lng, heading, speed, ts }               | |
| |   (lightweight endpoint, minimal validation)     | |
| +--------------------------------------------------+ |
|         |                                             |
|         v                                             |
| +--------------------------------------------------+ |
| | Location Service (stateless, auto-scaled)        | |
| |                                                  | |
| | 1. Write to Redis GEO (for real-time queries)    | |
| |    GEOADD drivers:active {lng} {lat} {driverId}  | |
| |                                                  | |
| | 2. Publish to Kafka topic: driver.locations      | |
| |    (for downstream consumers)                    | |
| +--------------------------------------------------+ |
|         |                       |                     |
|         v                       v                     |
| +----------------+    +-------------------------+     |
| | Redis GEO      |    | Kafka -> Consumers      |    |
| | (latest pos.)  |    |                         |    |
| | Used by:       |    | -> Tracking Service     |    |
| |  - Dispatch    |    |    (push to customers)  |    |
| |  - ETA Service |    | -> TimescaleDB          |    |
| |                |    |    (historical storage)  |    |
| +----------------+    | -> Analytics            |    |
|                       +-------------------------+     |
+------------------------------------------------------+
\`\`\`

Redis GEO holds only the latest position per driver (real-time). Kafka distributes to all consumers. TimescaleDB stores historical data for ETA model training.
`,
    explanation: `## Bottlenecks & Improvements
- **Location ingestion throughput** → 125K updates/sec is manageable with a small cluster. If scaling to 1M+, use UDP for location updates (acceptable to lose occasional pings) and batch writes to Redis
- **Driver matching latency** → GEORADIUS is O(N) within the radius. For dense urban areas with many drivers, this is fast. Pre-filter by driver status (AVAILABLE only) to reduce candidates
- **ETA accuracy degradation** → ETAs drift as conditions change. Continuously recalculate and push updated ETAs. Track predicted vs actual for model improvement. Alert if average error exceeds 5 minutes
- **WebSocket connection limits** → 1M concurrent tracking sessions requires many WebSocket servers. Use Redis Pub/Sub to fan out location updates to the right server. Each server handles ~50K connections

## Key Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| Redis GEO over PostGIS | Less feature-rich spatial queries, but 10x throughput for simple radius lookups |
| Kafka for location events over direct push | Added latency (100-500ms), but decouples producers from consumers and enables replay |
| Three-component ETA over ML black box | Less accurate in edge cases, but interpretable, debuggable, and works without large training data |
| Push matching over driver bidding | Drivers cannot cherry-pick orders, but ensures fast matching and fair distribution |
| 4-second GPS interval over continuous | Loses some precision, but reduces data volume by 75% and saves driver battery |

## Monitoring & Alerting
- **Match success rate**: Percentage of orders matched within 5 minutes. Alert if drops below 95%
- **ETA accuracy**: Track predicted vs actual delivery time. Alert if mean error exceeds 5 minutes
- **Location freshness**: Alert if a driver's last update is > 30 seconds old while marked AVAILABLE
- **Order state stuck**: Alert if any order stays in PREPARING for > 45 minutes (restaurant issue)
`,
    timeComplexity: "Location update: O(log N) Redis GEO insert. Driver matching: O(K) for K candidates in radius. ETA: O(1) computation with cached routing data. Order placement: O(1).",
    spaceComplexity: "Redis GEO: ~50 bytes x 500K drivers = ~25 MB. Location history: ~1 TB/day in TimescaleDB. Orders: ~11 TB/year. Kafka retention: ~3 days = ~3 TB.",
    hints: [
      "The order state machine is the backbone. Every service reacts to state transitions published as events. Design the state machine first, then build everything else around it.",
      "For driver matching, use Redis GEO for spatial queries, then apply multi-factor scoring. Distance alone is insufficient — heading, speed, rating, and current load all matter.",
      "ETA is a three-component model: prep time + driver-to-restaurant + restaurant-to-customer. Prep and driver travel overlap. Continuously refine with actual delivery data.",
      "Location updates need a lightweight, high-throughput pipeline. Write to Redis GEO for real-time queries and Kafka for distribution. Never write every update to a relational database."
    ],
  },
];
