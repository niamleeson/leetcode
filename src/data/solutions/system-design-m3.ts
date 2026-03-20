import { ProblemSolution } from './types';

export const solutionsM3: ProblemSolution[] = [
  {
    id: 9011,
    description: `Design an E-Commerce Platform (Amazon)

FUNCTIONAL REQUIREMENTS:
- Product catalog with full-text search, browsing by category, and multi-facet filtering (price, brand, rating, size, color)
- Shopping cart that persists across sessions and devices
- Complete checkout flow: address selection, shipping method, payment, order confirmation
- Order management: tracking, cancellation, returns, refund processing
- Product reviews and ratings with verified purchase badges
- Personalized product recommendations based on browsing and purchase history
- Seller portal for product listing, inventory management, and order fulfillment
- Flash sale support with countdown timers, limited inventory, and surge traffic handling

NON-FUNCTIONAL REQUIREMENTS:
- Support 100M+ monthly active users with 10M+ concurrent during peak events (Prime Day, Black Friday)
- Product search latency under 200ms at p99
- Cart operations under 50ms
- Order placement must be ACID-compliant with exactly-once semantics
- 99.99% availability (52 minutes downtime/year)
- Real-time inventory accuracy to prevent overselling
- PCI-DSS compliance for payment data

CAPACITY ESTIMATION:
- 500M products in catalog, average 5KB metadata each = 2.5TB catalog data
- 50M daily active users, average 20 searches/day = 1B search queries/day (~12K QPS)
- 5M orders/day, average 3 items/order = 15M inventory updates/day
- Peak flash sale: 500K concurrent users hitting a single product, 50K orders/minute
- Cart data: 50M active carts x 2KB average = 100GB in Redis
- Order data: 5M/day x 365 days x 3KB = ~5.5TB/year`,
    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Search Traffic:
- 50M DAU x 20 searches/day = 1B searches/day
- 1B / 86,400 seconds = ~11,574 QPS average
- Peak (3x average) = ~35K QPS
- Each search query hits Elasticsearch: 200ms average, need 35K x 0.2s = 7,000 concurrent search threads
- Elasticsearch cluster: 10 data nodes x 64GB RAM = 640GB hot data in memory

Flash Sale Inventory:
- Single product: 10,000 units available
- 500K users attempting purchase simultaneously
- At 50K orders/minute = 833 orders/second on a SINGLE product SKU
- Redis atomic decrement: ~100K ops/sec per shard, one shard can handle this
- BUT checkout flow is multi-step: need saga pattern for distributed transaction

Order Processing:
- 5M orders/day = ~58 orders/second average
- Each order triggers: inventory reservation, payment charge, shipping label, email notification
- Saga orchestrator handles 58 distributed transactions/second
- With 3-second average saga completion: 174 concurrent sagas

API DESIGN:

POST /api/v1/products/search
{ "query": "wireless headphones", "filters": { "price": { "min": 20, "max": 200 }, "brand": ["Sony", "Bose"], "rating": { "min": 4 } }, "sort": "relevance", "page": 1, "pageSize": 20 }

POST /api/v1/cart/items
{ "productId": "P123", "variantId": "V456", "quantity": 2 }

POST /api/v1/orders/checkout
{ "cartId": "C789", "shippingAddressId": "A001", "shippingMethod": "express", "paymentMethodId": "PM002", "idempotencyKey": "uuid-v4-here" }

GET /api/v1/orders/:orderId/tracking
Response: { "orderId": "O100", "status": "shipped", "trackingNumber": "1Z999...", "estimatedDelivery": "2024-01-15", "timeline": [...] }`,
    intuition: `Think of an e-commerce platform as a city with specialized districts. The CATALOG is a massive library with an advanced index system (Elasticsearch) that lets millions of people search simultaneously. The CART is like a personal shopping assistant who follows you around and remembers everything you picked up, even if you leave and come back tomorrow (Redis with persistence). The CHECKOUT is a careful notary process where multiple independent parties (inventory, payment, shipping) must all agree before the deal is done - this is the saga pattern, like a wedding where the officiant coordinates vows from both parties and can call it off if either says no.

The single hardest problem is the flash sale: imagine 500,000 people rushing through one door to grab 10,000 items. You need a bouncer (rate limiter), a queue (virtual waiting room), and an atomic counter (Redis DECR) that guarantees exactly 10,000 items are sold - not 10,001.

KEY INSIGHT: The checkout flow is a distributed transaction across multiple services (inventory, payment, shipping), but two-phase commit is too slow and fragile at scale. The saga pattern with compensating transactions gives you eventual consistency with the ability to roll back partial failures. Each step has an undo action: if payment fails after inventory was reserved, the compensating transaction releases the inventory.`,
    approach: `ARCHITECTURE OVERVIEW:

The platform uses a microservices architecture with an API Gateway (Kong/Envoy) routing requests to domain-specific services. Each service owns its database (Database per Service pattern).

CORE SERVICES AND DATA FLOW:

1. CATALOG SERVICE
- Elasticsearch cluster for full-text search with inverted indices
- PostgreSQL as source of truth for product data
- CDC (Change Data Capture) pipeline syncs PostgreSQL -> Kafka -> Elasticsearch
- Supports faceted search (brand, price range, rating), fuzzy matching, autocomplete
- Product data is denormalized in Elasticsearch for fast retrieval
- Schema: products(id, title, description, category_id, brand, price, images[], attributes JSONB, seller_id, created_at)
- Schema: product_variants(id, product_id, sku, size, color, price_override, weight)

2. CART SERVICE
- Redis Cluster for sub-millisecond cart operations
- Cart stored as Redis Hash: cart:{userId} -> { item1: qty, item2: qty }
- Cart metadata (prices, images) fetched from catalog service on read
- Abandoned cart detection via TTL (30 days) + async cleanup job
- Guest carts merge with user cart on login
- Schema (Redis): HSET cart:{userId} {productId}:{variantId} {quantity}

3. INVENTORY SERVICE
- PostgreSQL with row-level locking for inventory counts
- Schema: inventory(sku, warehouse_id, available_qty, reserved_qty, version)
- Optimistic locking with version column for normal operations
- Redis atomic counter for flash sales (pre-loaded from DB)
- Reservation pattern: decrement available_qty, increment reserved_qty
- TTL on reservations (15 minutes) - unreserved if checkout not completed
- Warehouse-level tracking for multi-warehouse fulfillment

4. ORDER SERVICE (Saga Orchestrator)
- Manages the checkout distributed transaction using the Saga pattern
- Saga steps: (1) Reserve Inventory -> (2) Process Payment -> (3) Create Shipment -> (4) Confirm Order
- Compensating transactions: (1) Release Inventory <- (2) Refund Payment <- (3) Cancel Shipment
- Order states: CREATED -> INVENTORY_RESERVED -> PAYMENT_PROCESSED -> SHIPPED -> DELIVERED
- PostgreSQL for order storage with outbox pattern for reliable event publishing
- Schema: orders(id, user_id, status, total_amount, shipping_address, idempotency_key, created_at)
- Schema: order_items(id, order_id, product_id, variant_id, quantity, unit_price)
- Schema: saga_state(saga_id, order_id, current_step, status, compensating_data JSONB)

5. RECOMMENDATION ENGINE
- Collaborative filtering: users who bought X also bought Y
- Content-based: similar product attributes
- Pre-computed recommendations stored in Redis sorted sets
- Real-time signals (recent views, cart items) boost recommendations
- A/B testing framework for recommendation algorithm variants

6. FLASH SALE SUBSYSTEM
- Separate entry point with dedicated infrastructure
- Virtual queue (waiting room) to control admission rate
- Pre-loaded inventory count in Redis
- Atomic Lua script for check-and-decrement
- Rate limiting per user (1 purchase per flash sale item)
- CDN-cached product pages to absorb read traffic

API ENDPOINTS:
- GET /products/:id - Product details
- POST /products/search - Full-text search with filters
- POST /cart/items - Add to cart
- DELETE /cart/items/:itemId - Remove from cart
- POST /orders/checkout - Initiate checkout saga
- GET /orders/:id - Order status
- POST /flash-sales/:id/queue - Join flash sale queue
- GET /flash-sales/:id/position - Check queue position

DATABASE CHOICES:
- PostgreSQL: Orders, inventory, product source of truth (ACID compliance)
- Elasticsearch: Product search and filtering (inverted index, relevance scoring)
- Redis: Cart data, flash sale counters, session cache, recommendations cache
- Kafka: Event streaming between services (CDC, order events, analytics)
- S3: Product images and static assets`,
    code: `// ==========================================
// E-COMMERCE PLATFORM - CORE IMPLEMENTATIONS
// ==========================================

// --- SAGA ORCHESTRATOR FOR CHECKOUT FLOW ---
class CheckoutSaga {
  constructor(inventoryService, paymentService, shippingService, orderRepo) {
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
    this.shippingService = shippingService;
    this.orderRepo = orderRepo;
    this.steps = [
      { name: 'reserveInventory', execute: (ctx) => this.reserveInventory(ctx), compensate: (ctx) => this.releaseInventory(ctx) },
      { name: 'processPayment', execute: (ctx) => this.processPayment(ctx), compensate: (ctx) => this.refundPayment(ctx) },
      { name: 'createShipment', execute: (ctx) => this.createShipment(ctx), compensate: (ctx) => this.cancelShipment(ctx) },
    ];
  }

  async execute(order) {
    const context = { order, completedSteps: [], reservations: [], paymentId: null, shipmentId: null };
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      try {
        await step.execute(context);
        context.completedSteps.push(i);
        await this.orderRepo.updateSagaState(order.id, step.name, 'COMPLETED');
      } catch (error) {
        await this.orderRepo.updateSagaState(order.id, step.name, 'FAILED');
        await this.compensate(context, i - 1);
        throw new CheckoutFailedError(\`Saga failed at step \${step.name}: \${error.message}\`);
      }
    }
    await this.orderRepo.updateStatus(order.id, 'CONFIRMED');
    return { success: true, orderId: order.id };
  }

  async compensate(context, fromStepIndex) {
    for (let i = fromStepIndex; i >= 0; i--) {
      try {
        await this.steps[i].compensate(context);
        await this.orderRepo.updateSagaState(context.order.id, this.steps[i].name, 'COMPENSATED');
      } catch (compError) {
        await this.orderRepo.updateSagaState(context.order.id, this.steps[i].name, 'COMPENSATION_FAILED');
        await this.alertOpsTeam(context.order.id, this.steps[i].name, compError);
      }
    }
    await this.orderRepo.updateStatus(context.order.id, 'CANCELLED');
  }

  async reserveInventory(ctx) {
    const reservations = [];
    for (const item of ctx.order.items) {
      const reservation = await this.inventoryService.reserve(item.sku, item.quantity, ctx.order.id);
      reservations.push(reservation);
    }
    ctx.reservations = reservations;
  }

  async releaseInventory(ctx) {
    for (const res of ctx.reservations) {
      await this.inventoryService.release(res.reservationId);
    }
  }

  async processPayment(ctx) {
    const result = await this.paymentService.charge(ctx.order.userId, ctx.order.totalAmount, ctx.order.id);
    ctx.paymentId = result.paymentId;
  }

  async refundPayment(ctx) {
    if (ctx.paymentId) await this.paymentService.refund(ctx.paymentId, ctx.order.totalAmount);
  }

  async createShipment(ctx) {
    const result = await this.shippingService.createLabel(ctx.order.shippingAddress, ctx.order.items);
    ctx.shipmentId = result.shipmentId;
  }

  async cancelShipment(ctx) {
    if (ctx.shipmentId) await this.shippingService.cancel(ctx.shipmentId);
  }

  async alertOpsTeam(orderId, stepName, error) {
    console.error(\`CRITICAL: Compensation failed for order \${orderId} at \${stepName}\`, error);
  }
}

// --- FLASH SALE INVENTORY MANAGER (Redis Atomic Operations) ---
class FlashSaleManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.luaReserveScript = \`
      local key = KEYS[1]
      local userKey = KEYS[2]
      local userId = ARGV[1]
      local quantity = tonumber(ARGV[2])
      local already = redis.call('SISMEMBER', userKey, userId)
      if already == 1 then return -2 end
      local current = tonumber(redis.call('GET', key) or '0')
      if current < quantity then return -1 end
      redis.call('DECRBY', key, quantity)
      redis.call('SADD', userKey, userId)
      return current - quantity
    \`;
  }

  async initializeSale(saleId, productSku, totalQuantity, startTime) {
    const pipeline = this.redis.pipeline();
    pipeline.set(\`flash:\${saleId}:inventory:\${productSku}\`, totalQuantity);
    pipeline.del(\`flash:\${saleId}:buyers:\${productSku}\`);
    pipeline.set(\`flash:\${saleId}:start\`, startTime);
    pipeline.set(\`flash:\${saleId}:status\`, 'SCHEDULED');
    await pipeline.exec();
  }

  async attemptPurchase(saleId, productSku, userId, quantity) {
    const status = await this.redis.get(\`flash:\${saleId}:status\`);
    if (status !== 'ACTIVE') return { success: false, reason: 'Sale not active' };
    const result = await this.redis.eval(this.luaReserveScript, 2,
      \`flash:\${saleId}:inventory:\${productSku}\`,
      \`flash:\${saleId}:buyers:\${productSku}\`,
      userId, quantity
    );
    if (result === -2) return { success: false, reason: 'Already purchased' };
    if (result === -1) return { success: false, reason: 'Out of stock' };
    return { success: true, remainingInventory: result };
  }

  async getSaleStatus(saleId, productSku) {
    const [inventory, buyerCount] = await Promise.all([
      this.redis.get(\`flash:\${saleId}:inventory:\${productSku}\`),
      this.redis.scard(\`flash:\${saleId}:buyers:\${productSku}\`)
    ]);
    return { remaining: parseInt(inventory || '0'), totalBuyers: buyerCount };
  }
}

// --- PRODUCT SEARCH QUERY BUILDER (Elasticsearch-style) ---
class ProductSearchBuilder {
  constructor() { this.query = { bool: { must: [], filter: [], should: [] } }; this.options = {}; }

  fullText(text, fields = ['title^3', 'description', 'brand^2']) {
    if (!text) return this;
    this.query.bool.must.push({ multi_match: { query: text, fields, type: 'best_fields', fuzziness: 'AUTO' } });
    return this;
  }

  category(categoryId) {
    if (categoryId) this.query.bool.filter.push({ term: { category_id: categoryId } });
    return this;
  }

  priceRange(min, max) {
    const range = {};
    if (min !== undefined) range.gte = min;
    if (max !== undefined) range.lte = max;
    if (Object.keys(range).length > 0) this.query.bool.filter.push({ range: { price: range } });
    return this;
  }

  brands(brandList) {
    if (brandList && brandList.length > 0) this.query.bool.filter.push({ terms: { brand: brandList } });
    return this;
  }

  minRating(rating) {
    if (rating) this.query.bool.filter.push({ range: { avg_rating: { gte: rating } } });
    return this;
  }

  inStock() {
    this.query.bool.filter.push({ term: { in_stock: true } });
    return this;
  }

  sortBy(field, order = 'desc') { this.options.sort = [{ [field]: { order } }]; return this; }
  paginate(page, size = 20) { this.options.from = (page - 1) * size; this.options.size = size; return this; }

  build() {
    return {
      query: this.query,
      ...this.options,
      aggs: {
        brands: { terms: { field: 'brand', size: 50 } },
        price_ranges: { range: { field: 'price', ranges: [
          { to: 25 }, { from: 25, to: 50 }, { from: 50, to: 100 },
          { from: 100, to: 200 }, { from: 200 }
        ]}},
        avg_rating: { avg: { field: 'avg_rating' } }
      }
    };
  }
}

class CheckoutFailedError extends Error {
  constructor(msg) { super(msg); this.name = 'CheckoutFailedError'; }
}`,
    jsCode: `// ==========================================
// E-COMMERCE: CART SERVICE & INVENTORY LOCK
// ==========================================

// --- SHOPPING CART SERVICE (Redis-backed) ---
class CartService {
  constructor(redisClient, catalogService) {
    this.redis = redisClient;
    this.catalog = catalogService;
    this.CART_TTL = 30 * 24 * 60 * 60; // 30 days
  }

  cartKey(userId) { return \`cart:\${userId}\`; }

  async addItem(userId, productId, variantId, quantity) {
    const product = await this.catalog.getProduct(productId);
    if (!product) throw new Error('Product not found');
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) throw new Error('Variant not found');
    const fieldKey = \`\${productId}:\${variantId}\`;
    const currentQty = parseInt(await this.redis.hget(this.cartKey(userId), fieldKey) || '0');
    const newQty = currentQty + quantity;
    if (newQty > 10) throw new Error('Maximum quantity per item is 10');
    await this.redis.hset(this.cartKey(userId), fieldKey, newQty.toString());
    await this.redis.expire(this.cartKey(userId), this.CART_TTL);
    return this.getCart(userId);
  }

  async removeItem(userId, productId, variantId) {
    await this.redis.hdel(this.cartKey(userId), \`\${productId}:\${variantId}\`);
    return this.getCart(userId);
  }

  async updateQuantity(userId, productId, variantId, quantity) {
    if (quantity <= 0) return this.removeItem(userId, productId, variantId);
    await this.redis.hset(this.cartKey(userId), \`\${productId}:\${variantId}\`, quantity.toString());
    return this.getCart(userId);
  }

  async getCart(userId) {
    const cartData = await this.redis.hgetall(this.cartKey(userId));
    if (!cartData || Object.keys(cartData).length === 0) return { items: [], total: 0 };
    const items = [];
    let total = 0;
    for (const [key, qty] of Object.entries(cartData)) {
      const [productId, variantId] = key.split(':');
      const product = await this.catalog.getProduct(productId);
      if (product) {
        const variant = product.variants.find(v => v.id === variantId);
        const price = variant ? (variant.priceOverride || product.price) : product.price;
        const subtotal = price * parseInt(qty);
        items.push({ productId, variantId, title: product.title, price, quantity: parseInt(qty), subtotal, image: product.images[0] });
        total += subtotal;
      }
    }
    return { items, total, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) };
  }

  async mergeGuestCart(guestId, userId) {
    const guestCart = await this.redis.hgetall(this.cartKey(guestId));
    if (!guestCart) return;
    for (const [key, qty] of Object.entries(guestCart)) {
      const existing = parseInt(await this.redis.hget(this.cartKey(userId), key) || '0');
      const merged = Math.min(existing + parseInt(qty), 10);
      await this.redis.hset(this.cartKey(userId), key, merged.toString());
    }
    await this.redis.del(this.cartKey(guestId));
  }
}

// --- OPTIMISTIC LOCKING INVENTORY SERVICE ---
class InventoryService {
  constructor(db) { this.db = db; }

  async reserve(sku, quantity, orderId) {
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const item = await this.db.query(
        'SELECT available_qty, reserved_qty, version FROM inventory WHERE sku = $1 FOR UPDATE',
        [sku]
      );
      if (!item.rows[0]) throw new Error(\`SKU \${sku} not found\`);
      const { available_qty, reserved_qty, version } = item.rows[0];
      if (available_qty < quantity) throw new Error(\`Insufficient stock for \${sku}: \${available_qty} < \${quantity}\`);
      const result = await this.db.query(
        \`UPDATE inventory SET available_qty = available_qty - $1,
         reserved_qty = reserved_qty + $1, version = version + 1
         WHERE sku = $2 AND version = $3\`,
        [quantity, sku, version]
      );
      if (result.rowCount === 1) {
        const reservation = await this.db.query(
          \`INSERT INTO reservations (sku, order_id, quantity, expires_at)
           VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes') RETURNING id\`,
          [sku, orderId, quantity]
        );
        return { reservationId: reservation.rows[0].id, sku, quantity };
      }
      // Version conflict, retry
    }
    throw new Error(\`Failed to reserve \${sku} after \${MAX_RETRIES} attempts\`);
  }

  async release(reservationId) {
    const res = await this.db.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING sku, quantity', [reservationId]
    );
    if (res.rows[0]) {
      await this.db.query(
        'UPDATE inventory SET available_qty = available_qty + $1, reserved_qty = reserved_qty - $1 WHERE sku = $2',
        [res.rows[0].quantity, res.rows[0].sku]
      );
    }
  }

  async cleanExpiredReservations() {
    const expired = await this.db.query(
      'DELETE FROM reservations WHERE expires_at < NOW() RETURNING sku, quantity'
    );
    for (const row of expired.rows) {
      await this.db.query(
        'UPDATE inventory SET available_qty = available_qty + $1, reserved_qty = reserved_qty - $1 WHERE sku = $2',
        [row.quantity, row.sku]
      );
    }
    return expired.rows.length;
  }
}`,
    explanation: `SCALING ANALYSIS:

1. CATALOG & SEARCH SCALING:
- Elasticsearch shards across 10+ nodes for parallel query execution
- Read replicas handle search traffic; primary handles indexing
- CDC pipeline ensures Elasticsearch stays in sync with PostgreSQL (eventual consistency, ~1s lag)
- Autocomplete uses edge n-gram tokenizer for prefix matching
- Category browse pages are cached at CDN level (TTL 5 min)

2. CART SERVICE SCALING:
- Redis Cluster with 6+ shards handles 50M active carts
- Each shard: 16GB RAM, ~8M carts per shard
- Cart reads are local to one shard (hash-based routing by userId)
- No persistence needed for carts - they are ephemeral with TTL
- Guest-to-user cart merge is an atomic operation

3. CHECKOUT/ORDER SCALING:
- Saga orchestrator runs on stateless workers pulling from Kafka
- Each saga state is persisted in PostgreSQL for crash recovery
- If orchestrator crashes mid-saga, a recovery worker picks up incomplete sagas
- Idempotency key on orders prevents double-charging on retry
- Outbox pattern: order events written to outbox table in same transaction, polled by Kafka producer

4. FLASH SALE SCALING:
- Dedicated Redis instance pre-loaded with inventory count
- Lua script ensures atomic check-and-decrement (no race conditions)
- Per-user purchase tracking prevents bulk buying
- CDN absorbs 99% of page load traffic; only purchase requests hit backend
- Virtual queue throttles admission to prevent thundering herd

FAILURE MODES:
- Elasticsearch down: Degrade to browse-by-category from PostgreSQL
- Redis cart down: Serve empty cart with "temporarily unavailable" message; carts eventually recover
- Payment service down: Saga compensation releases inventory; user prompted to retry
- Saga compensation failure: Alert ops team; manual resolution via admin dashboard
- Flash sale inventory mismatch: Reconciliation job compares Redis counter with PostgreSQL

BOTTLENECK IDENTIFICATION:
- Single-product flash sale creates hot key in Redis -> Use Redis Cluster with key on dedicated shard
- Elasticsearch indexing lag can show stale prices -> Accept 1s staleness or use cache-aside pattern
- Order service DB can become bottleneck at 10K+ orders/sec -> Shard by user_id ranges
- Inventory table contention on popular SKUs -> Use Redis for hot products, DB for long-tail

MONITORING:
- Search latency p50/p95/p99 per query type
- Cart operation latency and error rate
- Saga success/failure/compensation rates
- Flash sale: remaining inventory, orders/second, queue depth
- Inventory discrepancy between Redis and PostgreSQL
- Elasticsearch indexing lag from CDC pipeline

TRADE-OFFS:
- Saga vs 2PC: Saga allows higher availability and independent service scaling, but provides only eventual consistency. 2PC guarantees atomicity but blocks all services during commit.
- Redis cart vs DB cart: Redis is faster but volatile. For high-value carts, periodic async backup to DB provides durability without sacrificing speed.
- Elasticsearch vs Solr: Elasticsearch has better scaling and real-time indexing; Solr has more mature analytics. Both work; ES is more common in e-commerce.
- Optimistic vs pessimistic locking for inventory: Optimistic (version column) works well under normal load. Pessimistic (SELECT FOR UPDATE) needed for flash sales or single hot SKU.`,
    timeComplexity: `Search: O(1) amortized via Elasticsearch inverted index (actual cost is O(n) over matching docs, but pruned by scoring). Cart operations: O(1) Redis hash operations. Checkout saga: O(k) where k is the number of saga steps (typically 3-4). Flash sale purchase: O(1) via atomic Redis Lua script. Recommendation generation: O(n*m) offline for collaborative filtering, O(1) for serving pre-computed results.`,
    spaceComplexity: `Product catalog: 500M products x 5KB = 2.5TB in PostgreSQL + 2.5TB Elasticsearch index. Cart data: 50M active carts x 2KB = 100GB Redis. Order data: 5M orders/day x 3KB x 365 = 5.5TB/year PostgreSQL (partition by month, archive after 2 years). Flash sale: <1GB Redis per sale event. Total infrastructure: ~15TB active storage, scaling ~6TB/year for order growth.`,
    hints: [
      `Start with the checkout saga pattern - it is the most architecturally complex component. Draw the state machine for order lifecycle (CREATED -> INVENTORY_RESERVED -> PAYMENT_PROCESSED -> SHIPPED -> DELIVERED) and for each transition, identify the compensating action that rolls it back. This is the foundation of distributed transaction handling.`,
      `For flash sales, the key insight is that ALL inventory decisions must happen in a single atomic Redis operation (Lua script). Any solution that involves "check then update" as two separate calls will have race conditions. The Lua script atomically checks inventory, decrements it, and records the buyer in one non-interruptible operation.`,
      `Cart service should be eventually consistent with the catalog. Prices in the cart should be fetched fresh at checkout time (not stored in cart), because prices can change. Store only product IDs and quantities in Redis; hydrate with product details on read.`,
      `For inventory, use a two-tier approach: Redis for hot products (top 1000 SKUs by traffic) with atomic counters, and PostgreSQL with optimistic locking for the long tail. A background reconciliation job syncs Redis counters with the database every 30 seconds.`,
      `The Elasticsearch query builder should support aggregations (facets) alongside search results. Each search response should include available filters (brands, price ranges, ratings) computed from the result set, enabling the UI to show dynamic filter counts.`,
      `Design for graceful degradation: if Elasticsearch is down, fall back to database queries (slower but functional). If Redis cart is down, show cached cart data. If payment service is slow, increase saga timeout but show user a "processing" status. Every external dependency should have a circuit breaker.`,
      `Idempotency is critical for checkout. The client generates a unique idempotencyKey before submitting. If the same key is submitted twice (due to retry), the server returns the original order result instead of creating a duplicate. Store idempotency keys with a 24-hour TTL.`,
      `For monitoring flash sales in real-time, stream purchase events to a Kafka topic consumed by a real-time dashboard (Flink/Spark Streaming). Track orders/second, remaining inventory, unique buyers, and error rates. Set alerts for inventory discrepancy > 1% between Redis and DB.`
    ],
  },
  {
    id: 9012,
    description: `Design a Payment System (Stripe)

FUNCTIONAL REQUIREMENTS:
- Process credit card, debit card, and bank transfer (ACH) payments
- Support multiple currencies with real-time exchange rates
- Handle refunds (full and partial), chargebacks, and disputes
- Provide a tokenization service that replaces card numbers with secure tokens
- Implement retry-safe idempotent payment processing (exactly-once semantics)
- Double-entry ledger for complete financial audit trail
- Webhook notifications for payment status changes
- Merchant dashboard with transaction history and analytics
- Support recurring payments and subscriptions

NON-FUNCTIONAL REQUIREMENTS:
- 99.999% availability (5 minutes 15 seconds downtime/year)
- PCI-DSS Level 1 compliance (card data never touches application servers in plaintext)
- End-to-end encryption for all sensitive data
- Payment processing latency under 2 seconds at p99
- Support 10,000 transactions per second at peak
- Complete audit trail for every cent movement
- Multi-region deployment for disaster recovery

CAPACITY ESTIMATION:
- 1M merchants, 500M end users
- 50M transactions/day, average $50 each = $2.5B daily volume
- Peak: 10K TPS during events (Black Friday, Singles Day)
- Each transaction: ~2KB metadata = 100GB/day raw transaction data
- Ledger entries: 2 per transaction minimum = 100M entries/day
- 7 years retention requirement = ~250TB total ledger data`,
    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Transaction Processing:
- 50M transactions/day / 86,400 seconds = ~579 TPS average
- Peak 10K TPS (20x average) during major shopping events
- Each transaction involves: tokenize -> authorize -> capture (3 external calls)
- Authorization latency: 500ms average from card networks
- At 10K TPS with 500ms processing: 5,000 concurrent connections to card networks
- Need connection pooling and circuit breakers for each payment processor

Double-Entry Ledger:
- Each payment: minimum 2 ledger entries (debit buyer, credit merchant)
- With fees: 4 entries (debit buyer, credit merchant, debit merchant fee, credit platform)
- 50M transactions x 4 entries = 200M ledger entries/day
- Each entry: 200 bytes = 40GB/day of ledger data
- 7 years: 40GB x 365 x 7 = ~100TB ledger storage

Idempotency Store:
- 50M idempotency keys/day with 24-hour TTL
- Each key: 64 bytes (UUID + result hash) = 3.2GB in Redis
- Peak: 10K new keys/second

API DESIGN:

POST /v1/payments
{ "amount": 5000, "currency": "usd", "payment_method": "pm_1234tok", "merchant_id": "merch_567", "idempotency_key": "idk_uuid_v4", "metadata": { "order_id": "ord_890" } }
Response: { "id": "pay_abc123", "status": "succeeded", "amount": 5000, "currency": "usd", "created": 1705000000 }

POST /v1/refunds
{ "payment_id": "pay_abc123", "amount": 2500, "reason": "customer_request", "idempotency_key": "idk_refund_uuid" }

POST /v1/tokens
{ "card_number": "4242424242424242", "exp_month": 12, "exp_year": 2027, "cvc": "314" }
Response: { "token": "tok_visa_4242", "card": { "last4": "4242", "brand": "visa", "exp_month": 12, "exp_year": 2027 } }`,
    intuition: `Think of a payment system as a highly regulated bank vault combined with an obsessively precise accountant. The TOKENIZATION service is a secure lockbox: card numbers go in, opaque tokens come out, and only the lockbox can translate between them. This is not just encryption - it is a separate isolated service running in a PCI-compliant enclave with no other network access.

The DOUBLE-ENTRY LEDGER is the accountant who ensures every cent is accounted for. For every transaction, money must come from somewhere and go somewhere - debits must equal credits, always. If $100 moves from buyer to merchant, there is a $100 debit on the buyer account and a $100 credit on the merchant account. Platform fees create additional entries. This system makes it mathematically impossible to lose money without detection.

The IDEMPOTENCY layer is the memory of the system. Network failures mean clients will retry. Without idempotency, a retry could charge a customer twice. The idempotency key acts like a receipt number: "I already processed this exact request, here is the original result."

KEY INSIGHT: Payment processing is a state machine, not a single operation. A payment transitions through states (CREATED -> AUTHORIZED -> CAPTURED -> SETTLED), and each transition must be atomic, auditable, and reversible. The state machine prevents invalid transitions (you cannot capture a payment that was not authorized) and guides compensating actions (refund reverses capture, void reverses authorization).`,
    approach: `ARCHITECTURE OVERVIEW:

The payment system uses a layered architecture with strict security boundaries. The PCI-compliant zone (tokenization) is network-isolated from the main application layer. All payment mutations go through the idempotency layer before reaching the payment processor.

CORE SERVICES:

1. API GATEWAY & IDEMPOTENCY LAYER
- Every mutating request requires an idempotency key
- Before processing, check Redis for existing result with that key
- If found, return cached result (exactly-once semantics)
- If not found, acquire distributed lock, process, store result, release lock
- Idempotency keys expire after 24 hours
- Schema (Redis): SET idempotency:{key} {serialized_result} EX 86400

2. TOKENIZATION SERVICE (PCI Zone)
- Runs in isolated network segment (PCI-DSS compliant)
- Accepts raw card data, returns opaque token
- Card data encrypted at rest with HSM-managed keys (AES-256)
- Token-to-card mapping stored in dedicated encrypted database
- Only this service can communicate with card networks
- Schema: tokens(token_id, encrypted_pan, exp_month, exp_year, card_brand, last4, fingerprint, created_at)

3. PAYMENT PROCESSING SERVICE
- Orchestrates the payment lifecycle state machine
- States: CREATED -> PROCESSING -> AUTHORIZED -> CAPTURED -> SETTLED (or FAILED, VOIDED, REFUNDED)
- Uses optimistic locking on payment state transitions
- Communicates with external payment processors (Visa, Mastercard, banks) via the tokenization service
- Schema: payments(id, merchant_id, amount, currency, status, payment_method_token, idempotency_key, processor_response JSONB, created_at, updated_at, version)

4. DOUBLE-ENTRY LEDGER SERVICE
- Every money movement creates balanced debit/credit entries
- Entries are immutable (append-only) - corrections are new entries, never updates
- Running balances maintained in a separate materialized table
- Nightly reconciliation job verifies all accounts balance to zero-sum
- Schema: ledger_entries(id, account_id, entry_type ENUM('DEBIT','CREDIT'), amount, currency, payment_id, description, created_at)
- Schema: accounts(id, owner_type, owner_id, currency, balance, version)

5. RECONCILIATION ENGINE
- Compares internal ledger with external processor settlement reports
- Runs nightly batch job matching internal records with bank statements
- Flags discrepancies: missing transactions, amount mismatches, duplicate charges
- Generates reconciliation report for finance team
- Three-way match: internal ledger, processor records, bank settlement

6. WEBHOOK/NOTIFICATION SERVICE
- Publishes payment events to merchant-registered webhook URLs
- Retry with exponential backoff (1s, 2s, 4s, ... up to 24 hours)
- Signature verification (HMAC-SHA256) for webhook authenticity
- Event types: payment.succeeded, payment.failed, refund.created, chargeback.opened

7. CURRENCY CONVERSION SERVICE
- Real-time exchange rates from multiple providers
- Rate caching with 60-second refresh
- Locks exchange rate at transaction time for consistency
- Handles settlement in merchant's preferred currency

API ENDPOINTS:
- POST /v1/tokens - Tokenize card (PCI zone only)
- POST /v1/payments - Create and process payment
- POST /v1/payments/:id/capture - Capture authorized payment
- POST /v1/payments/:id/void - Void authorized payment
- POST /v1/refunds - Refund a captured payment
- GET /v1/payments/:id - Get payment details
- GET /v1/ledger/accounts/:id/entries - Get ledger entries

DATABASE CHOICES:
- PostgreSQL: Payments, ledger entries, accounts (ACID, strong consistency required)
- Redis: Idempotency cache, rate limiting, distributed locks
- HSM (Hardware Security Module): Key management for card encryption
- Kafka: Event streaming for webhooks, analytics, reconciliation
- S3: Settlement reports, reconciliation artifacts, audit logs`,
    code: `// ==========================================
// PAYMENT SYSTEM - CORE IMPLEMENTATIONS
// ==========================================

// --- IDEMPOTENT PAYMENT PROCESSOR ---
class IdempotentPaymentProcessor {
  constructor(redisClient, paymentService, ledger, lockTTL = 30000) {
    this.redis = redisClient;
    this.paymentService = paymentService;
    this.ledger = ledger;
    this.lockTTL = lockTTL;
    this.IDEMPOTENCY_TTL = 86400; // 24 hours
  }

  async processPayment(request) {
    const { idempotencyKey } = request;
    if (!idempotencyKey) throw new Error('idempotency_key is required');
    // 1. Check if already processed
    const cached = await this.redis.get(\`idem:\${idempotencyKey}\`);
    if (cached) return JSON.parse(cached);
    // 2. Acquire distributed lock
    const lockKey = \`lock:\${idempotencyKey}\`;
    const lockValue = \`\${Date.now()}_\${Math.random()}\`;
    const acquired = await this.redis.set(lockKey, lockValue, 'PX', this.lockTTL, 'NX');
    if (!acquired) throw new PaymentError('CONCURRENT_REQUEST', 'Duplicate request in progress');
    try {
      // Double-check after acquiring lock
      const rechecked = await this.redis.get(\`idem:\${idempotencyKey}\`);
      if (rechecked) return JSON.parse(rechecked);
      // 3. Process the payment
      const result = await this.paymentService.executePayment(request);
      // 4. Record in ledger
      if (result.status === 'succeeded') {
        await this.ledger.recordPayment(result.paymentId, request.merchantId,
          request.amount, request.currency);
      }
      // 5. Cache result for idempotency
      await this.redis.set(\`idem:\${idempotencyKey}\`, JSON.stringify(result), 'EX', this.IDEMPOTENCY_TTL);
      return result;
    } finally {
      // Release lock (only if we still own it)
      const currentVal = await this.redis.get(lockKey);
      if (currentVal === lockValue) await this.redis.del(lockKey);
    }
  }
}

// --- DOUBLE-ENTRY LEDGER ---
class DoubleEntryLedger {
  constructor(db) { this.db = db; }

  async recordPayment(paymentId, merchantId, amount, currency) {
    const platformFee = Math.round(amount * 0.029 + 30); // 2.9% + 30 cents
    const merchantAmount = amount - platformFee;
    return this.executeTransaction([
      { accountId: \`buyer:\${paymentId}\`, type: 'DEBIT', amount, currency, paymentId, description: 'Payment charge' },
      { accountId: \`merchant:\${merchantId}\`, type: 'CREDIT', amount: merchantAmount, currency, paymentId, description: 'Payment received' },
      { accountId: \`platform:fees\`, type: 'CREDIT', amount: platformFee, currency, paymentId, description: 'Processing fee' },
    ]);
  }

  async recordRefund(paymentId, merchantId, refundAmount, currency) {
    const refundedFee = Math.round(refundAmount * 0.029);
    return this.executeTransaction([
      { accountId: \`buyer:\${paymentId}\`, type: 'CREDIT', amount: refundAmount, currency, paymentId, description: 'Refund issued' },
      { accountId: \`merchant:\${merchantId}\`, type: 'DEBIT', amount: refundAmount - refundedFee, currency, paymentId, description: 'Refund deducted' },
      { accountId: \`platform:fees\`, type: 'DEBIT', amount: refundedFee, currency, paymentId, description: 'Fee reversal' },
    ]);
  }

  async executeTransaction(entries) {
    const totalDebits = entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0);
    const totalCredits = entries.filter(e => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0);
    if (totalDebits !== totalCredits) throw new Error(\`Unbalanced transaction: debits=\${totalDebits} credits=\${totalCredits}\`);
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const txnId = \`txn_\${Date.now()}_\${Math.random().toString(36).slice(2, 10)}\`;
      for (const entry of entries) {
        await client.query(
          \`INSERT INTO ledger_entries (txn_id, account_id, entry_type, amount, currency, payment_id, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)\`,
          [txnId, entry.accountId, entry.type, entry.amount, entry.currency, entry.paymentId, entry.description]
        );
        const balanceOp = entry.type === 'CREDIT' ? '+' : '-';
        await client.query(
          \`INSERT INTO accounts (id, balance, currency) VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET balance = accounts.balance \${balanceOp} $2\`,
          [entry.accountId, entry.amount, entry.currency]
        );
      }
      await client.query('COMMIT');
      return { txnId, entries: entries.length };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getBalance(accountId) {
    const result = await this.db.query('SELECT balance, currency FROM accounts WHERE id = $1', [accountId]);
    return result.rows[0] || { balance: 0, currency: 'usd' };
  }
}

// --- PAYMENT STATE MACHINE ---
class PaymentStateMachine {
  constructor() {
    this.transitions = {
      created:    { authorize: 'authorized', fail: 'failed' },
      authorized: { capture: 'captured', void: 'voided', fail: 'failed' },
      captured:   { settle: 'settled', refund: 'refunded', chargeback: 'disputed' },
      settled:    { refund: 'refunded', chargeback: 'disputed' },
      disputed:   { resolve_merchant: 'settled', resolve_buyer: 'refunded' },
      refunded:   {},
      voided:     {},
      failed:     { retry: 'created' },
    };
  }

  canTransition(currentState, action) {
    return !!(this.transitions[currentState] && this.transitions[currentState][action]);
  }

  transition(currentState, action) {
    if (!this.canTransition(currentState, action)) {
      throw new PaymentError('INVALID_TRANSITION', \`Cannot \${action} payment in \${currentState} state\`);
    }
    return this.transitions[currentState][action];
  }

  getAvailableActions(currentState) {
    return Object.keys(this.transitions[currentState] || {});
  }
}

// --- RECONCILIATION DIFF ENGINE ---
class ReconciliationEngine {
  constructor(db, processorClient) { this.db = db; this.processorClient = processorClient; }

  async reconcile(date) {
    const [internal, external] = await Promise.all([
      this.getInternalTransactions(date),
      this.processorClient.getSettlementReport(date),
    ]);
    const internalMap = new Map(internal.map(t => [t.processorRef, t]));
    const externalMap = new Map(external.map(t => [t.referenceId, t]));
    const results = { matched: [], missingExternal: [], missingInternal: [], amountMismatch: [] };
    for (const [ref, intTxn] of internalMap) {
      const extTxn = externalMap.get(ref);
      if (!extTxn) { results.missingExternal.push(intTxn); continue; }
      if (intTxn.amount !== extTxn.amount) {
        results.amountMismatch.push({ internal: intTxn, external: extTxn, diff: intTxn.amount - extTxn.amount });
      } else {
        results.matched.push({ internal: intTxn, external: extTxn });
      }
      externalMap.delete(ref);
    }
    for (const [, extTxn] of externalMap) results.missingInternal.push(extTxn);
    results.summary = {
      date, totalInternal: internal.length, totalExternal: external.length,
      matchedCount: results.matched.length, discrepancies: results.missingExternal.length + results.missingInternal.length + results.amountMismatch.length,
      matchRate: ((results.matched.length / Math.max(internal.length, 1)) * 100).toFixed(2) + '%',
    };
    return results;
  }

  async getInternalTransactions(date) {
    const result = await this.db.query(
      \`SELECT id, processor_ref, amount, currency, status, created_at
       FROM payments WHERE DATE(created_at) = $1 AND status IN ('captured','settled')\`, [date]
    );
    return result.rows;
  }
}

class PaymentError extends Error {
  constructor(code, msg) { super(msg); this.code = code; this.name = 'PaymentError'; }
}`,
    jsCode: `// ==========================================
// PAYMENT SYSTEM: WEBHOOK & CURRENCY SERVICE
// ==========================================

// --- WEBHOOK DELIVERY SERVICE ---
class WebhookDeliveryService {
  constructor(db, httpClient, queue) {
    this.db = db;
    this.httpClient = httpClient;
    this.queue = queue;
    this.MAX_RETRIES = 8;
    this.RETRY_DELAYS = [1, 2, 4, 8, 30, 60, 300, 3600]; // seconds
  }

  async publishEvent(eventType, paymentId, data) {
    const merchants = await this.getMerchantWebhooks(data.merchantId, eventType);
    for (const webhook of merchants) {
      const event = {
        id: \`evt_\${Date.now()}_\${Math.random().toString(36).slice(2, 10)}\`,
        type: eventType,
        created: Math.floor(Date.now() / 1000),
        data: { paymentId, ...data },
      };
      const signature = this.signPayload(event, webhook.secret);
      await this.db.query(
        \`INSERT INTO webhook_events (id, merchant_id, webhook_url, event_type, payload, signature, status, attempts)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0)\`,
        [event.id, data.merchantId, webhook.url, eventType, JSON.stringify(event), signature]
      );
      await this.queue.enqueue('webhook_delivery', { eventId: event.id });
    }
  }

  async deliverWebhook(eventId) {
    const event = await this.db.query('SELECT * FROM webhook_events WHERE id = $1', [eventId]);
    if (!event.rows[0]) return;
    const record = event.rows[0];
    if (record.attempts >= this.MAX_RETRIES) {
      await this.db.query(\`UPDATE webhook_events SET status = 'failed' WHERE id = $1\`, [eventId]);
      return;
    }
    try {
      const response = await this.httpClient.post(record.webhook_url, {
        headers: { 'Content-Type': 'application/json', 'X-Signature': record.signature, 'X-Event-Id': eventId },
        body: record.payload,
        timeout: 10000,
      });
      if (response.status >= 200 && response.status < 300) {
        await this.db.query(\`UPDATE webhook_events SET status = 'delivered', delivered_at = NOW() WHERE id = $1\`, [eventId]);
      } else {
        throw new Error(\`HTTP \${response.status}\`);
      }
    } catch (err) {
      const nextAttempt = record.attempts + 1;
      const delay = this.RETRY_DELAYS[Math.min(nextAttempt - 1, this.RETRY_DELAYS.length - 1)];
      await this.db.query(
        \`UPDATE webhook_events SET attempts = $1, last_error = $2, next_retry_at = NOW() + INTERVAL '\${delay} seconds' WHERE id = $3\`,
        [nextAttempt, err.message, eventId]
      );
      await this.queue.enqueueDelayed('webhook_delivery', { eventId }, delay * 1000);
    }
  }

  signPayload(payload, secret) {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }

  async getMerchantWebhooks(merchantId, eventType) {
    const result = await this.db.query(
      \`SELECT url, secret FROM merchant_webhooks
       WHERE merchant_id = $1 AND (event_types @> ARRAY[$2] OR event_types @> ARRAY['*']) AND active = true\`,
      [merchantId, eventType]
    );
    return result.rows;
  }
}

// --- MULTI-CURRENCY CONVERSION SERVICE ---
class CurrencyService {
  constructor(redisClient, rateProviders) {
    this.redis = redisClient;
    this.providers = rateProviders;
    this.RATE_CACHE_TTL = 60; // 60 seconds
    this.SUPPORTED = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'inr', 'brl'];
    this.DECIMAL_PLACES = { jpy: 0, default: 2 };
  }

  async convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return { amount, currency: toCurrency, rate: 1 };
    if (!this.SUPPORTED.includes(fromCurrency) || !this.SUPPORTED.includes(toCurrency)) {
      throw new Error(\`Unsupported currency pair: \${fromCurrency}/\${toCurrency}\`);
    }
    const rate = await this.getRate(fromCurrency, toCurrency);
    const decimals = this.DECIMAL_PLACES[toCurrency] || this.DECIMAL_PLACES.default;
    const converted = Math.round(amount * rate * Math.pow(10, decimals)) / Math.pow(10, decimals);
    return { amount: converted, currency: toCurrency, rate, originalAmount: amount, originalCurrency: fromCurrency, timestamp: Date.now() };
  }

  async getRate(from, to) {
    const cacheKey = \`fx:\${from}:\${to}\`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return parseFloat(cached);
    const rate = await this.fetchRateWithFallback(from, to);
    await this.redis.set(cacheKey, rate.toString(), 'EX', this.RATE_CACHE_TTL);
    return rate;
  }

  async fetchRateWithFallback(from, to) {
    for (const provider of this.providers) {
      try {
        const rate = await provider.getRate(from, to);
        if (rate > 0) return rate;
      } catch (err) {
        continue; // Try next provider
      }
    }
    throw new Error(\`Unable to fetch rate for \${from}/\${to} from any provider\`);
  }

  async lockRate(from, to, durationSeconds = 300) {
    const rate = await this.getRate(from, to);
    const lockId = \`ratelock_\${Date.now()}_\${Math.random().toString(36).slice(2, 8)}\`;
    await this.redis.set(\`ratelock:\${lockId}\`, JSON.stringify({ from, to, rate, expiresAt: Date.now() + durationSeconds * 1000 }), 'EX', durationSeconds);
    return { lockId, rate, expiresAt: Date.now() + durationSeconds * 1000 };
  }

  async useLockedRate(lockId) {
    const data = await this.redis.get(\`ratelock:\${lockId}\`);
    if (!data) throw new Error('Rate lock expired or not found');
    const parsed = JSON.parse(data);
    if (Date.now() > parsed.expiresAt) throw new Error('Rate lock expired');
    return parsed.rate;
  }
}`,
    explanation: `SCALING ANALYSIS:

1. IDEMPOTENCY LAYER:
- Redis stores 50M keys/day with 24-hour TTL, ~3.2GB
- At 10K TPS peak, Redis handles this easily (100K+ ops/sec)
- Distributed lock prevents double-processing during concurrent retries
- Lock TTL (30s) prevents deadlock if processor crashes mid-transaction
- After lock release, the cached result serves all subsequent retries

2. DOUBLE-ENTRY LEDGER:
- 200M entries/day requires partitioned PostgreSQL (by date)
- Monthly table partitions: ledger_entries_2024_01, ledger_entries_2024_02, etc.
- Append-only design means entries are never updated (write-optimized)
- Running balances in accounts table avoid scanning all entries
- Nightly reconciliation verifies SUM(debits) = SUM(credits) per account

3. PAYMENT PROCESSING:
- Connection pool to card networks: 5,000 concurrent connections across 10 payment processor nodes
- Circuit breaker per processor: if Visa gateway fails, route to backup processor
- Timeout handling: if authorization takes >5s, mark as UNKNOWN and reconcile later
- Multi-region active-passive: primary in us-east, failover in eu-west

4. PCI-DSS COMPLIANCE:
- Tokenization service runs in isolated VPC with no internet access
- Card data encrypted with HSM-managed keys (AES-256-GCM)
- Network segmentation: application servers never see card numbers
- All access logged and audited; quarterly penetration testing
- Key rotation every 90 days with zero-downtime re-encryption

FAILURE MODES:
- Card network timeout: Mark payment as PENDING, poll for result, reconcile in batch
- Double charge (idempotency failure): Ledger makes it detectable; automatic refund triggered
- Ledger imbalance: CRITICAL alert; halt affected merchant payouts until resolved
- Webhook delivery failure: Retry up to 8 times over 24 hours; merchant can poll status API
- Currency rate stale: Fall back to last known rate + 1% buffer; flag for manual review

BOTTLENECK IDENTIFICATION:
- Ledger writes at 200M/day: Partition by date, use batch inserts (1000 entries per batch)
- Idempotency key lookup at 10K/s: Redis handles this; add read replicas for redundancy
- Settlement report generation: Pre-aggregate hourly; nightly job only merges hourly summaries
- Reconciliation with large data sets: Use MapReduce-style parallel comparison

MONITORING:
- Payment success/failure rate per processor, per currency, per card brand
- Authorization latency p50/p95/p99 per card network
- Ledger balance drift (should always be zero across all accounts)
- Idempotency cache hit rate (high hit rate may indicate client retry storms)
- Webhook delivery success rate and average delivery latency
- Reconciliation discrepancy count and total amount

TRADE-OFFS:
- Synchronous vs async payment: Sync gives immediate feedback but holds connection. Async is more resilient but requires polling/webhooks for status.
- Single vs multi-processor: Multiple processors provide redundancy but increase reconciliation complexity.
- Strong consistency vs availability: The ledger MUST be strongly consistent (money cannot be lost). Other components (analytics, webhooks) can be eventually consistent.
- Flat fee vs percentage: Stripe charges 2.9% + 30 cents. This simplifies the ledger (fixed formula) but may not be competitive for high-value transactions.`,
    timeComplexity: `Payment processing: O(1) for idempotency check (Redis GET), O(1) for lock acquisition, O(k) for saga steps where k is constant (authorize + capture = 2). Ledger operations: O(n) for recording n entries in a transaction (typically 3-4). Reconciliation: O(n + m) where n is internal records and m is external records for a given date (hash-join). Webhook delivery: O(1) per delivery attempt, O(r) total for r retries.`,
    spaceComplexity: `Idempotency cache: 50M keys x 64B = 3.2GB Redis (24h TTL, auto-evicting). Ledger: 200M entries/day x 200B = 40GB/day, 14.6TB/year. Partitioned by month, archived to cold storage after 2 years (5TB hot). Payment records: 50M/day x 2KB = 100GB/day, 36.5TB/year. Token vault: 500M tokens x 500B = 250GB encrypted database. Total active: ~8TB hot storage + 50TB warm + 200TB cold (7-year retention).`,
    hints: [
      `The idempotency key is the single most important concept in payment systems. Every mutating API call must accept an idempotency key. The implementation pattern is: check cache -> acquire lock -> double-check cache -> process -> store result -> release lock. The double-check after lock acquisition prevents a race condition where two requests pass the initial check simultaneously.`,
      `The double-entry ledger must NEVER update or delete entries. Every correction is a new entry that offsets the original. This immutable append-only design provides a complete audit trail and makes it trivial to verify correctness: the sum of all entries for any account at any point in time must equal the current balance.`,
      `PCI-DSS compliance requires network segmentation. The tokenization service must run in an isolated environment where raw card data can exist. Application servers only ever see tokens. This means the tokenization service has its own dedicated database, its own deployment pipeline, and strict access controls. Most companies use a third-party vault (Stripe, Braintree) to avoid PCI scope entirely.`,
      `The payment state machine prevents invalid operations. For example, you cannot refund a payment that is only authorized (you must void it instead). You cannot capture a payment that is already captured. Encoding these rules in a state machine makes the system self-documenting and prevents bugs from incorrect API usage.`,
      `For multi-currency support, lock the exchange rate at transaction creation time and store it with the payment record. Do NOT convert at settlement time, as rates may have changed. The rate lock pattern (store rate with TTL in Redis) ensures the customer sees the same amount they will be charged.`,
      `Reconciliation is the safety net that catches everything else. Run it nightly with a three-way match: (1) your internal ledger, (2) the payment processor settlement report, and (3) the bank statement. Any discrepancy triggers an alert. The reconciliation engine should output a clear diff showing matched, missing, and mismatched transactions.`,
      `Design for partial failures: if the payment succeeds at the processor but your database write fails, you have charged the customer without recording it. Solution: use the outbox pattern - write the payment result AND an outbox event in the same database transaction. A separate process reads the outbox and publishes to Kafka. This guarantees consistency between your database and event stream.`,
      `For 99.999% availability, deploy multi-region active-passive. The primary region handles all traffic. If it fails, DNS failover routes to the secondary region which has a warm standby of all services. The ledger database uses synchronous replication to the secondary region to prevent data loss. Accept that failover takes 30-60 seconds (this is within the 5-minute annual budget).`
    ],
  },
  {
    id: 9013,
    description: `Design a Hotel Booking System (Booking.com)

FUNCTIONAL REQUIREMENTS:
- Search available rooms by location, check-in/check-out dates, number of guests, and price range
- Display hotel details with photos, amenities, reviews, and room types
- Book rooms with real-time availability checks (prevent double-booking)
- Support cancellations and modifications with configurable policies
- Dynamic pricing based on occupancy, season, demand, and competitor rates
- Hotel management portal for property owners to manage listings, rates, and availability
- Guest reviews and ratings with verified stay badges
- Multiple payment methods and currency support

NON-FUNCTIONAL REQUIREMENTS:
- Handle 500K concurrent users during holiday booking peaks
- Search results returned within 500ms
- Booking confirmation within 3 seconds
- Zero double-bookings (strong consistency for reservations)
- 99.99% availability
- Support 1M+ hotel properties globally

CAPACITY ESTIMATION:
- 1M hotels, average 100 rooms each = 100M rooms globally
- Each room has availability for 365 days = 36.5B room-date records
- 10M searches/day, 500K bookings/day
- Peak: 5x average during holiday season = 2.5M bookings/day
- Average booking: 2 nights, 1 room = 2 room-night records
- Search index: 1M hotels x 5KB = 5GB (fits in memory)`,
    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Availability Storage:
- 100M rooms x 365 days = 36.5B room-date records
- Each record: room_id (8B) + date (4B) + status (1B) + price (4B) + booking_id (8B) = 25 bytes
- Total: 36.5B x 25B = ~912GB
- Partitioned by hotel_id and date range: hot partition (next 90 days) = ~9B records = 225GB
- Can fit in PostgreSQL with proper partitioning and indexing

Search Traffic:
- 10M searches/day = ~116 searches/second average
- Peak: 580/second
- Each search scans Elasticsearch for hotels matching criteria, then checks availability service
- Two-phase search: (1) ES returns matching hotels (50ms), (2) Availability check for top 50 hotels (100ms)

Booking Concurrency:
- 500K bookings/day = ~6 bookings/second average
- Peak: 30 bookings/second
- BUT for popular hotels during peak: 100+ concurrent booking attempts for the same room-date
- Need row-level locking or optimistic concurrency control

API DESIGN:

POST /api/v1/search
{ "location": { "lat": 48.8566, "lng": 2.3522, "radiusKm": 10 }, "checkIn": "2024-07-01", "checkOut": "2024-07-05", "guests": 2, "rooms": 1, "priceRange": { "min": 100, "max": 300 }, "currency": "eur" }

POST /api/v1/bookings
{ "hotelId": "H123", "roomTypeId": "RT456", "checkIn": "2024-07-01", "checkOut": "2024-07-05", "guestInfo": { "name": "John Doe", "email": "john@example.com" }, "paymentMethodId": "PM789", "idempotencyKey": "uuid" }

PUT /api/v1/bookings/:bookingId/modify
{ "newCheckOut": "2024-07-06", "idempotencyKey": "uuid2" }

DELETE /api/v1/bookings/:bookingId
{ "reason": "change_of_plans" }`,
    intuition: `Think of a hotel booking system as a giant calendar grid. Each hotel has rooms, each room has dates, and each date-cell can only hold ONE booking. The fundamental problem is preventing two people from booking the same cell simultaneously.

Imagine a popular beachfront hotel on New Year's Eve. Hundreds of users are searching and attempting to book the last available room at the exact same moment. The system must guarantee that exactly ONE person succeeds and everyone else gets a "sold out" message - not an error, not a double-booking, not a "we are sorry, someone else booked it while you were checking out."

The search problem is a funnel: Location filter (geo-query) -> Date availability filter -> Price/amenity filter -> Sort by relevance. Each stage narrows the result set. The key insight is that search should be OPTIMISTIC (show rooms that are probably available based on cached data) while booking must be PESSIMISTIC (lock the row and verify in real-time).

KEY INSIGHT: The availability system is a date-range overlap detection problem. A room is unavailable for dates [checkIn, checkOut) if ANY existing booking overlaps with that range. The SQL condition is: existing.check_in < new.check_out AND existing.check_out > new.check_in. Combined with row-level locking (SELECT FOR UPDATE), this guarantees no double-bookings.

Dynamic pricing is a multi-variable optimization: higher occupancy -> higher price, peak season -> higher price, last-minute availability -> discount or premium depending on demand signals. The pricing engine runs continuously, adjusting rates based on real-time data.`,
    approach: `ARCHITECTURE OVERVIEW:

The system uses a service-oriented architecture with separate services for search, availability, booking, pricing, and hotel management. The search path is optimized for speed (Elasticsearch + caching), while the booking path is optimized for correctness (PostgreSQL with row-level locking).

CORE SERVICES:

1. SEARCH SERVICE
- Elasticsearch for hotel discovery: geo-queries, full-text, faceted filtering
- Hotel documents indexed with location (geo_point), amenities, star rating, base price
- Two-phase search: (1) Elasticsearch returns candidate hotels, (2) Availability service filters by actual room availability
- Results cached by search parameters (5-minute TTL) for identical queries
- Schema (ES): hotel { id, name, location: geo_point, city, country, star_rating, amenities[], room_types[{ id, name, base_price, max_guests }], avg_review_score, photos[] }

2. AVAILABILITY SERVICE
- PostgreSQL table: room_availability(hotel_id, room_type_id, room_number, date, status, booking_id, price)
- Partitioned by hotel_id (hash) and date (range - monthly partitions)
- For search: aggregate query counts available rooms per type for date range
- For booking: row-level lock (SELECT FOR UPDATE) on specific room-dates
- Alternative: room_bookings table with date ranges and overlap check
- Schema: room_bookings(id, hotel_id, room_type_id, room_number, check_in, check_out, booking_id, status)
- Overlap check: WHERE room_number = X AND check_in < new_checkout AND check_out > new_checkin

3. BOOKING SERVICE
- Orchestrates the booking flow: check availability -> lock room -> charge payment -> confirm
- Booking states: PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT -> CANCELLED
- Cancellation policies stored per hotel: free cancellation until X days before, partial refund, non-refundable
- Idempotency key prevents double-bookings from client retries
- Schema: bookings(id, hotel_id, room_type_id, room_number, guest_id, check_in, check_out, total_price, currency, status, cancellation_policy, idempotency_key, created_at)

4. PRICING ENGINE
- Base rate set by hotel owner per room type
- Dynamic multipliers: occupancy factor, seasonal factor, demand factor, day-of-week factor
- Final price = base_rate x occupancy_multiplier x season_multiplier x demand_multiplier x dow_multiplier
- Occupancy: >80% occupancy -> 1.3x, >90% -> 1.5x, >95% -> 2.0x
- Prices pre-computed nightly for next 365 days, stored in availability table
- Real-time adjustments via Kafka events when bookings/cancellations change occupancy

5. HOTEL MANAGEMENT PORTAL
- Hotel owners manage room types, base rates, photos, amenities
- Bulk availability uploads (CSV/API) for channel managers
- Dashboard: occupancy rates, revenue, upcoming check-ins, reviews
- Rate calendar: visual interface to set prices per room type per date

API ENDPOINTS:
- POST /search - Search hotels with filters
- GET /hotels/:id - Hotel details with room types
- GET /hotels/:id/availability?checkIn=X&checkOut=Y - Room availability and pricing
- POST /bookings - Create booking
- PUT /bookings/:id/modify - Modify dates
- DELETE /bookings/:id - Cancel booking
- GET /bookings/:id - Booking details

DATABASE CHOICES:
- PostgreSQL: Bookings, availability (ACID required for no-double-booking guarantee)
- Elasticsearch: Hotel search (geo-queries, full-text, faceted filtering)
- Redis: Search result cache, session data, rate limiting
- Kafka: Event streaming (booking events -> pricing engine, analytics)
- S3 + CDN: Hotel photos and static assets`,
    code: `// ==========================================
// HOTEL BOOKING SYSTEM - CORE IMPLEMENTATIONS
// ==========================================

// --- AVAILABILITY CHECKER WITH DATE-RANGE OVERLAP DETECTION ---
class AvailabilityService {
  constructor(db) { this.db = db; }

  async checkAvailability(hotelId, roomTypeId, checkIn, checkOut) {
    const result = await this.db.query(
      \`SELECT room_number, COUNT(*) as booking_count
       FROM room_bookings
       WHERE hotel_id = $1 AND room_type_id = $2
         AND status IN ('confirmed', 'checked_in')
         AND check_in < $4 AND check_out > $3
       GROUP BY room_number\`,
      [hotelId, roomTypeId, checkIn, checkOut]
    );
    const bookedRooms = new Set(result.rows.map(r => r.room_number));
    const allRooms = await this.db.query(
      'SELECT room_number FROM rooms WHERE hotel_id = $1 AND room_type_id = $2 AND active = true',
      [hotelId, roomTypeId]
    );
    const available = allRooms.rows.filter(r => !bookedRooms.has(r.room_number));
    return { hotelId, roomTypeId, checkIn, checkOut, availableCount: available.length, availableRooms: available.map(r => r.room_number) };
  }

  async getHotelAvailabilitySummary(hotelId, checkIn, checkOut) {
    const roomTypes = await this.db.query(
      'SELECT DISTINCT rt.id, rt.name, rt.max_guests, rt.base_price FROM room_types rt WHERE rt.hotel_id = $1',
      [hotelId]
    );
    const summary = [];
    for (const rt of roomTypes.rows) {
      const avail = await this.checkAvailability(hotelId, rt.id, checkIn, checkOut);
      if (avail.availableCount > 0) {
        const pricing = await this.getPriceForDates(hotelId, rt.id, checkIn, checkOut);
        summary.push({ roomTypeId: rt.id, name: rt.name, maxGuests: rt.max_guests, availableRooms: avail.availableCount, totalPrice: pricing.total, pricePerNight: pricing.perNight, nights: pricing.nights });
      }
    }
    return summary;
  }

  async getPriceForDates(hotelId, roomTypeId, checkIn, checkOut) {
    const result = await this.db.query(
      \`SELECT date, price FROM room_pricing
       WHERE hotel_id = $1 AND room_type_id = $2 AND date >= $3 AND date < $4
       ORDER BY date\`,
      [hotelId, roomTypeId, checkIn, checkOut]
    );
    const total = result.rows.reduce((sum, r) => sum + parseFloat(r.price), 0);
    const nights = result.rows.length;
    return { total: Math.round(total * 100) / 100, perNight: Math.round((total / Math.max(nights, 1)) * 100) / 100, nights, breakdown: result.rows };
  }
}

// --- CONCURRENT BOOKING HANDLER WITH PESSIMISTIC LOCKING ---
class BookingService {
  constructor(db, paymentService, pricingEngine) {
    this.db = db;
    this.paymentService = paymentService;
    this.pricingEngine = pricingEngine;
  }

  async createBooking(request) {
    const { hotelId, roomTypeId, checkIn, checkOut, guestId, paymentMethodId, idempotencyKey } = request;
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL lock_timeout = \\'5s\\'');
      // 1. Find and lock an available room (pessimistic locking)
      const availableRoom = await client.query(
        \`SELECT r.room_number FROM rooms r
         WHERE r.hotel_id = $1 AND r.room_type_id = $2 AND r.active = true
           AND r.room_number NOT IN (
             SELECT rb.room_number FROM room_bookings rb
             WHERE rb.hotel_id = $1 AND rb.room_type_id = $2
               AND rb.status IN ('confirmed', 'checked_in')
               AND rb.check_in < $4 AND rb.check_out > $3
           )
         ORDER BY r.room_number
         LIMIT 1
         FOR UPDATE OF r SKIP LOCKED\`,
        [hotelId, roomTypeId, checkIn, checkOut]
      );
      if (availableRoom.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, reason: 'No rooms available for selected dates' };
      }
      const roomNumber = availableRoom.rows[0].room_number;
      // 2. Calculate total price
      const pricing = await this.pricingEngine.calculateTotal(hotelId, roomTypeId, checkIn, checkOut);
      // 3. Insert booking record
      const booking = await client.query(
        \`INSERT INTO bookings (hotel_id, room_type_id, room_number, guest_id, check_in, check_out,
          total_price, currency, status, idempotency_key)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', $9)
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING id, status\`,
        [hotelId, roomTypeId, roomNumber, guestId, checkIn, checkOut, pricing.total, pricing.currency, idempotencyKey]
      );
      if (booking.rows.length === 0) {
        await client.query('ROLLBACK');
        const existing = await this.db.query('SELECT id, status FROM bookings WHERE idempotency_key = $1', [idempotencyKey]);
        return { success: true, bookingId: existing.rows[0].id, note: 'Duplicate request' };
      }
      // 4. Insert room_bookings overlap record
      await client.query(
        \`INSERT INTO room_bookings (hotel_id, room_type_id, room_number, check_in, check_out, booking_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')\`,
        [hotelId, roomTypeId, roomNumber, checkIn, checkOut, booking.rows[0].id]
      );
      await client.query('COMMIT');
      // 5. Charge payment (after commit to ensure booking is recorded)
      try {
        await this.paymentService.charge(guestId, pricing.total, pricing.currency, booking.rows[0].id);
      } catch (payErr) {
        await this.cancelBooking(booking.rows[0].id, 'payment_failed');
        return { success: false, reason: 'Payment failed', error: payErr.message };
      }
      return { success: true, bookingId: booking.rows[0].id, roomNumber, totalPrice: pricing.total, currency: pricing.currency };
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.message.includes('lock timeout')) return { success: false, reason: 'High demand - please retry' };
      throw err;
    } finally {
      client.release();
    }
  }

  async cancelBooking(bookingId, reason) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const booking = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
      if (!booking.rows[0]) throw new Error('Booking not found');
      if (booking.rows[0].status === 'cancelled') return { success: true, note: 'Already cancelled' };
      const policy = await this.getCancellationPolicy(booking.rows[0]);
      await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', bookingId]);
      await client.query('UPDATE room_bookings SET status = $1 WHERE booking_id = $2', ['cancelled', bookingId]);
      await client.query('COMMIT');
      if (policy.refundPercentage > 0) {
        const refundAmount = Math.round(booking.rows[0].total_price * policy.refundPercentage / 100);
        await this.paymentService.refund(bookingId, refundAmount);
      }
      return { success: true, refundPercentage: policy.refundPercentage };
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  }

  async getCancellationPolicy(booking) {
    const daysUntilCheckIn = Math.ceil((new Date(booking.check_in) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilCheckIn > 7) return { refundPercentage: 100 };
    if (daysUntilCheckIn > 3) return { refundPercentage: 50 };
    return { refundPercentage: 0 };
  }
}

// --- DYNAMIC PRICING CALCULATOR ---
class DynamicPricingEngine {
  constructor(db) { this.db = db; }

  async calculateTotal(hotelId, roomTypeId, checkIn, checkOut) {
    const dates = this.getDateRange(checkIn, checkOut);
    let total = 0;
    const breakdown = [];
    for (const date of dates) {
      const price = await this.calculateNightPrice(hotelId, roomTypeId, date);
      total += price.final;
      breakdown.push({ date, basePrice: price.base, finalPrice: price.final, multipliers: price.multipliers });
    }
    return { total: Math.round(total * 100) / 100, nights: dates.length, currency: 'usd', breakdown };
  }

  async calculateNightPrice(hotelId, roomTypeId, date) {
    const basePrice = await this.getBasePrice(hotelId, roomTypeId);
    const occupancy = await this.getOccupancyRate(hotelId, date);
    const multipliers = {
      occupancy: this.getOccupancyMultiplier(occupancy),
      season: this.getSeasonMultiplier(date),
      dayOfWeek: this.getDayOfWeekMultiplier(date),
      demand: await this.getDemandMultiplier(hotelId, date),
    };
    const combinedMultiplier = Object.values(multipliers).reduce((a, b) => a * b, 1);
    return { base: basePrice, final: Math.round(basePrice * combinedMultiplier * 100) / 100, multipliers };
  }

  getOccupancyMultiplier(rate) {
    if (rate >= 0.95) return 2.0;
    if (rate >= 0.90) return 1.5;
    if (rate >= 0.80) return 1.3;
    if (rate >= 0.60) return 1.1;
    if (rate <= 0.30) return 0.8;
    return 1.0;
  }

  getSeasonMultiplier(date) {
    const month = new Date(date).getMonth();
    const peakMonths = [5, 6, 7, 11]; // Jun, Jul, Aug, Dec
    const offPeakMonths = [0, 1, 10]; // Jan, Feb, Nov
    if (peakMonths.includes(month)) return 1.4;
    if (offPeakMonths.includes(month)) return 0.85;
    return 1.0;
  }

  getDayOfWeekMultiplier(date) {
    const day = new Date(date).getDay();
    if (day === 5 || day === 6) return 1.2; // Fri, Sat premium
    if (day === 0 || day === 1) return 0.9; // Sun, Mon discount
    return 1.0;
  }

  async getDemandMultiplier(hotelId, date) {
    const searchCount = await this.db.query(
      'SELECT search_count FROM search_analytics WHERE hotel_id = $1 AND date = $2',
      [hotelId, date]
    );
    const count = searchCount.rows[0] ? searchCount.rows[0].search_count : 0;
    if (count > 1000) return 1.3;
    if (count > 500) return 1.15;
    return 1.0;
  }

  async getBasePrice(hotelId, roomTypeId) {
    const result = await this.db.query('SELECT base_price FROM room_types WHERE hotel_id = $1 AND id = $2', [hotelId, roomTypeId]);
    return result.rows[0] ? parseFloat(result.rows[0].base_price) : 100;
  }

  async getOccupancyRate(hotelId, date) {
    const result = await this.db.query(
      \`SELECT
         (SELECT COUNT(*) FROM room_bookings WHERE hotel_id = $1 AND check_in <= $2 AND check_out > $2 AND status = 'confirmed') as booked,
         (SELECT COUNT(*) FROM rooms WHERE hotel_id = $1 AND active = true) as total\`,
      [hotelId, date]
    );
    const { booked, total } = result.rows[0];
    return total > 0 ? booked / total : 0;
  }

  getDateRange(checkIn, checkOut) {
    const dates = [];
    const current = new Date(checkIn);
    const end = new Date(checkOut);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}`,
    jsCode: `// ==========================================
// HOTEL BOOKING: SEARCH & GEO QUERIES
// ==========================================

// --- HOTEL SEARCH SERVICE (Elasticsearch Integration) ---
class HotelSearchService {
  constructor(esClient, availabilityService, cache) {
    this.es = esClient;
    this.availability = availabilityService;
    this.cache = cache;
    this.CACHE_TTL = 300; // 5 minutes
  }

  async search(params) {
    const cacheKey = \`search:\${JSON.stringify(params)}\`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Phase 1: Elasticsearch geo + filter query
    const esQuery = this.buildSearchQuery(params);
    const esResults = await this.es.search({ index: 'hotels', body: esQuery });
    const hotelIds = esResults.hits.hits.map(h => h._source.id);

    // Phase 2: Filter by real-time availability
    const availableHotels = [];
    const availChecks = hotelIds.map(async (hotelId) => {
      const avail = await this.availability.getHotelAvailabilitySummary(
        hotelId, params.checkIn, params.checkOut
      );
      if (avail.length > 0) {
        const hit = esResults.hits.hits.find(h => h._source.id === hotelId);
        availableHotels.push({
          hotel: hit._source,
          score: hit._score,
          availableRoomTypes: avail,
          lowestPrice: Math.min(...avail.map(a => a.totalPrice)),
        });
      }
    });
    await Promise.all(availChecks);

    // Sort by relevance score + price
    availableHotels.sort((a, b) => {
      if (params.sortBy === 'price') return a.lowestPrice - b.lowestPrice;
      if (params.sortBy === 'rating') return b.hotel.avg_review_score - a.hotel.avg_review_score;
      return b.score - a.score; // Default: relevance
    });

    const result = {
      hotels: availableHotels.slice(0, params.pageSize || 20),
      total: availableHotels.length,
      filters: this.extractFilters(esResults.aggregations),
    };
    await this.cache.set(cacheKey, JSON.stringify(result), 'EX', this.CACHE_TTL);
    return result;
  }

  buildSearchQuery(params) {
    const must = [];
    const filter = [];

    // Geo distance filter
    if (params.location) {
      filter.push({
        geo_distance: {
          distance: \`\${params.radiusKm || 10}km\`,
          location: { lat: params.location.lat, lon: params.location.lng },
        },
      });
    }

    // City/destination text search
    if (params.destination) {
      must.push({ multi_match: { query: params.destination, fields: ['name^3', 'city^2', 'country', 'description'], fuzziness: 'AUTO' } });
    }

    // Guest count filter
    if (params.guests) {
      filter.push({ nested: { path: 'room_types', query: { range: { 'room_types.max_guests': { gte: params.guests } } } } });
    }

    // Price range
    if (params.priceRange) {
      if (params.priceRange.min) filter.push({ nested: { path: 'room_types', query: { range: { 'room_types.base_price': { gte: params.priceRange.min } } } } });
      if (params.priceRange.max) filter.push({ nested: { path: 'room_types', query: { range: { 'room_types.base_price': { lte: params.priceRange.max } } } } });
    }

    // Star rating
    if (params.starRating) {
      filter.push({ terms: { star_rating: Array.isArray(params.starRating) ? params.starRating : [params.starRating] } });
    }

    // Amenities
    if (params.amenities && params.amenities.length > 0) {
      filter.push({ terms: { amenities: params.amenities } });
    }

    return {
      query: { bool: { must, filter } },
      size: 50, // Fetch more than page size to account for availability filtering
      _source: ['id', 'name', 'city', 'country', 'star_rating', 'avg_review_score', 'photos', 'amenities', 'location'],
      aggs: {
        star_ratings: { terms: { field: 'star_rating' } },
        amenities: { terms: { field: 'amenities', size: 30 } },
        price_ranges: { nested: { path: 'room_types' }, aggs: { prices: { histogram: { field: 'room_types.base_price', interval: 50 } } } },
      },
    };
  }

  extractFilters(aggs) {
    if (!aggs) return {};
    return {
      starRatings: (aggs.star_ratings ? aggs.star_ratings.buckets : []).map(b => ({ value: b.key, count: b.doc_count })),
      amenities: (aggs.amenities ? aggs.amenities.buckets : []).map(b => ({ value: b.key, count: b.doc_count })),
      priceDistribution: aggs.price_ranges && aggs.price_ranges.prices ? aggs.price_ranges.prices.buckets.map(b => ({ from: b.key, count: b.doc_count })) : [],
    };
  }
}

// --- BOOKING MODIFICATION SERVICE ---
class BookingModificationService {
  constructor(db, bookingService, pricingEngine, paymentService) {
    this.db = db;
    this.bookingService = bookingService;
    this.pricingEngine = pricingEngine;
    this.paymentService = paymentService;
  }

  async modifyDates(bookingId, newCheckIn, newCheckOut, idempotencyKey) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const booking = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
      if (!booking.rows[0]) throw new Error('Booking not found');
      const b = booking.rows[0];
      if (b.status !== 'confirmed') throw new Error(\`Cannot modify booking in \${b.status} status\`);

      // Check if new dates are available (excluding current booking)
      const conflict = await client.query(
        \`SELECT id FROM room_bookings
         WHERE hotel_id = $1 AND room_number = $2 AND booking_id != $3
           AND status = 'confirmed' AND check_in < $5 AND check_out > $4\`,
        [b.hotel_id, b.room_number, bookingId, newCheckIn, newCheckOut]
      );
      if (conflict.rows.length > 0) {
        await client.query('ROLLBACK');
        return { success: false, reason: 'New dates not available for this room' };
      }

      // Calculate new price
      const newPricing = await this.pricingEngine.calculateTotal(b.hotel_id, b.room_type_id, newCheckIn, newCheckOut);
      const priceDiff = newPricing.total - parseFloat(b.total_price);

      // Update booking and room_bookings
      await client.query(
        'UPDATE bookings SET check_in = $1, check_out = $2, total_price = $3 WHERE id = $4',
        [newCheckIn, newCheckOut, newPricing.total, bookingId]
      );
      await client.query(
        'UPDATE room_bookings SET check_in = $1, check_out = $2 WHERE booking_id = $3',
        [newCheckIn, newCheckOut, bookingId]
      );
      await client.query('COMMIT');

      // Handle price difference
      if (priceDiff > 0) {
        await this.paymentService.charge(b.guest_id, priceDiff, newPricing.currency, bookingId);
      } else if (priceDiff < 0) {
        await this.paymentService.refund(bookingId, Math.abs(priceDiff));
      }

      return { success: true, bookingId, newCheckIn, newCheckOut, newTotal: newPricing.total, priceDifference: priceDiff };
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  }
}`,
    explanation: `SCALING ANALYSIS:

1. SEARCH SERVICE:
- Elasticsearch cluster: 5 data nodes, 3 master nodes
- Hotel index sharded by region (5 shards, 1 replica each)
- 5GB index fits entirely in memory across the cluster
- Search latency: 50ms for Elasticsearch + 100ms for availability checks = 150ms total
- Cache hit rate ~40% for popular destinations -> effective QPS on ES reduced by 40%
- During peak, add read replicas to Elasticsearch

2. AVAILABILITY SERVICE:
- 36.5B room-date records partitioned: hot (next 90 days) = 9B records in PostgreSQL
- Indexed on (hotel_id, room_type_id, date) for fast range queries
- Row-level locking handles concurrent booking attempts
- SKIP LOCKED avoids deadlocks: if a room is locked, skip to next available room
- Connection pooling (PgBouncer): 500 connections across 10 app servers

3. BOOKING CONCURRENCY:
- Pessimistic locking (SELECT FOR UPDATE SKIP LOCKED) prevents double-booking
- Lock timeout (5 seconds) prevents indefinite blocking
- Idempotency key prevents duplicate bookings from client retries
- Average 6 bookings/second, peak 30/second - well within PostgreSQL capacity

4. PRICING ENGINE:
- Pre-compute prices nightly for all rooms for next 365 days
- Store in room_pricing table: 100M rooms x 365 = 36.5B rows (partitioned by date)
- Real-time recalculation triggered by booking events via Kafka
- Cache hot hotel prices in Redis (top 10K hotels by search volume)

FAILURE MODES:
- Elasticsearch down: Show cached results + fallback to PostgreSQL text search (degraded but functional)
- PostgreSQL down: No new bookings possible; show cached search results and "temporarily unavailable" for booking
- Payment failure after booking confirmed: Cancel booking, release room, notify guest
- Double-booking due to replication lag: Use synchronous replication for booking table; verify at check-in time

BOTTLENECK IDENTIFICATION:
- Popular hotels during holidays: hundreds of concurrent booking attempts for same dates
  -> SKIP LOCKED ensures fast failure rather than queue waiting
- Search + availability two-phase adds latency
  -> Pre-compute availability summary, update via CDC, serve from cache
- Pricing recalculation after every booking
  -> Batch pricing updates every 5 minutes rather than per-booking

MONITORING:
- Booking success/failure rate per hotel
- Double-booking incidents (should be zero - any occurrence is critical)
- Search latency breakdown: Elasticsearch time vs availability check time
- Room occupancy rates by region, hotel, and room type
- Pricing accuracy: compare dynamic prices with competitor rates
- Lock contention: count of lock timeouts per hotel

TRADE-OFFS:
- Pessimistic vs optimistic locking: Pessimistic (SELECT FOR UPDATE) guarantees no double-booking but can cause contention. Optimistic (version column) is faster but requires retry logic. We chose pessimistic with SKIP LOCKED for the best of both worlds.
- Pre-computed vs real-time availability: Pre-computed is faster but can be stale. Real-time is accurate but slower. The two-phase search approach (fast filter + real-time verify) balances both.
- Per-night vs per-stay pricing: Per-night allows flexible rates but complicates the booking flow. Per-stay is simpler but less flexible. We chose per-night with aggregation.`,
    timeComplexity: `Search: O(1) Elasticsearch query + O(k) availability checks for top k hotels (k=50). Booking: O(1) with pessimistic lock acquisition (single row lock). Pricing calculation: O(n) where n is the number of nights. Cancellation: O(1) with row-level lock. Date modification: O(1) conflict check + O(n) pricing recalculation.`,
    spaceComplexity: `Hotel search index: 1M hotels x 5KB = 5GB Elasticsearch. Room availability: 36.5B records x 25B = 912GB PostgreSQL (partitioned, 225GB hot). Bookings: 500K/day x 1KB x 365 = 182GB/year. Price cache: top 10K hotels x 365 days x 10 room types x 50B = 1.8GB Redis. Search cache: 100K unique queries x 5KB = 500MB Redis. Total: ~1.2TB active, growing ~200GB/year.`,
    hints: [
      `The double-booking prevention problem is solved with pessimistic locking using SELECT FOR UPDATE SKIP LOCKED. The SKIP LOCKED clause is critical: instead of blocking when a row is locked (which causes queuing), it skips locked rows and tries the next available room. This turns a contention problem into a graceful degradation.`,
      `Two-phase search is essential for performance. Phase 1 (Elasticsearch) narrows 1M hotels to 50 candidates in 50ms using geo-distance, text matching, and facets. Phase 2 (PostgreSQL) checks real-time availability for those 50 hotels in 100ms. Checking all 1M hotels for availability would take minutes.`,
      `Dynamic pricing should be pre-computed, not calculated on every search. A nightly batch job computes prices for all room types for the next 365 days. Real-time adjustments happen asynchronously when bookings or cancellations change occupancy rates. This keeps search fast while maintaining pricing accuracy within 5 minutes of real-time.`,
      `Handle the payment-after-booking pattern carefully. The booking is committed to the database BEFORE payment is charged. If payment fails, the system automatically cancels the booking and releases the room. This prevents holding database locks during the 2-3 second payment processing time, which would cause massive contention.`,
      `Cancellation policies should be data-driven, not hardcoded. Store the policy as a JSON configuration per hotel: { "freeCancellationDays": 7, "partialRefundDays": 3, "partialRefundPercent": 50 }. This allows hotel owners to customize policies without code changes.`,
      `For the date range overlap detection, the SQL condition is: existing.check_in < new.check_out AND existing.check_out > new.check_in. This is the canonical interval overlap formula. Draw two timelines on paper to convince yourself it catches all four overlap cases: (1) existing contains new, (2) new contains existing, (3) overlap on left, (4) overlap on right.`,
      `Cache search results aggressively but invalidate intelligently. A search for "Paris, July 1-5, 2 guests" can be cached for 5 minutes. But when a booking is made for a Paris hotel on those dates, proactively invalidate related cache entries. Use a Kafka consumer that listens for booking events and clears matching cache keys.`,
      `For load testing the booking flow under concurrency, simulate the worst case: 1000 concurrent users trying to book the same room on the same date. Verify that exactly 1 succeeds, 999 get a clear "no rooms available" response, and there are zero double-bookings. This is the acceptance test that proves your locking strategy works.`
    ],
  },
  {
    id: 9014,
    description: `Design a Ticket Booking System (Ticketmaster)

FUNCTIONAL REQUIREMENTS:
- Browse and search events by category, location, date, and artist
- View venue seat maps with real-time availability
- Select specific seats with a time-limited hold (10-minute checkout window)
- Complete purchase with payment processing
- Virtual waiting queue for high-demand events (millions of users in seconds)
- Transfer and resell tickets with anti-scalping measures
- QR code ticket generation and validation at venue entry

NON-FUNCTIONAL REQUIREMENTS:
- Handle extreme traffic spikes: 10M+ users arriving in 30 seconds for a popular event on-sale
- Seat holds must expire precisely after timeout (no leaked holds)
- Zero overselling: every seat sold exactly once
- Sub-second seat map updates for real-time availability feedback
- 99.99% availability during on-sale events
- Fair queuing: first-come-first-served with bot protection

CAPACITY ESTIMATION:
- 500K events/year, average 10K seats each = 5B seat-records/year
- Popular event on-sale: 10M users arrive in 30 seconds = 333K requests/second
- Of those, only 50K seats available = 99.5% of users will not get tickets
- Seat hold: 50K concurrent holds with 10-minute TTL = 50K Redis keys with TTL
- Normal operations: 1M ticket sales/day, 10M searches/day
- Peak QPS during on-sale: 500K (mostly queue status polling)`,
    examples: `CAPACITY ESTIMATION WALKTHROUGH:

On-Sale Traffic Spike:
- Taylor Swift concert: 50,000 seats
- 10M fans load the page within 30 seconds of on-sale time
- 10M / 30 = 333K requests/second initial burst
- CDN absorbs static content (event page, seat map images): ~90% of requests
- Backend sees ~33K requests/second for dynamic queue/seat operations
- Virtual queue admits 5,000 users/minute (to match checkout capacity)
- 50,000 seats / 5,000 per minute = 10 minutes to sell out

Queue Mechanics:
- 10M users get queue positions 1 through 10,000,000
- Batch admission: positions 1-5000 admitted at T+0, 5001-10000 at T+1min, etc.
- Each admitted user has 10 minutes to select seats and complete checkout
- Concurrent active shoppers: ~50,000 (10 batches of 5,000)
- If user does not complete in 10 min, seats released back to pool

Seat Hold Management:
- 50K seats with 10-minute holds = 50K Redis keys with TTL
- Each hold: seat_id (16B) + user_id (16B) + expiry (8B) = 40B per hold
- Total hold data: 50K x 40B = 2MB (trivial for Redis)
- Hold expiry check: Redis TTL handles this automatically
- On hold expiry: Lua script releases seat back to available pool

API DESIGN:

POST /api/v1/queue/join
{ "eventId": "EVT_123", "userId": "U456" }
Response: { "queueToken": "qt_abc", "position": 45023, "estimatedWaitMinutes": 9 }

GET /api/v1/queue/status?token=qt_abc
Response: { "position": 12000, "admitted": false, "estimatedWaitMinutes": 3 }
OR: { "position": 0, "admitted": true, "sessionToken": "st_xyz", "expiresIn": 600 }

POST /api/v1/seats/hold
{ "eventId": "EVT_123", "seatIds": ["S1-A-12", "S1-A-13"], "sessionToken": "st_xyz" }
Response: { "holdId": "H789", "seats": [...], "expiresAt": "2024-01-15T10:10:00Z", "holdDurationSeconds": 600 }

POST /api/v1/bookings/confirm
{ "holdId": "H789", "paymentMethodId": "PM001", "idempotencyKey": "uuid" }`,
    intuition: `A ticket booking system is fundamentally different from a hotel booking system because of the EXTREME traffic spikes and the INDIVIDUAL SEAT granularity. While a hotel has interchangeable rooms, a concert has 50,000 unique seats, each with different value, and 10 million people want them simultaneously.

Think of it like a concert venue door opening. Without a queue, you get a stampede (system crash). The VIRTUAL QUEUE is the rope line: it converts an uncontrollable surge into a controlled flow. Users get a position number and are admitted in batches. Inside the venue, once you pick up an item from a shelf (select a seat), you have 10 minutes to take it to the register (checkout). If you do not, it goes back on the shelf for the next person.

The SEAT MAP is a giant bitmap in Redis. Each bit represents a seat: 0 = available, 1 = taken. Checking if a seat is available is O(1). Reserving it is an atomic GETBIT + SETBIT in a Lua script. For a 50,000-seat venue, the entire bitmap is ~6KB - it fits in a single Redis key.

KEY INSIGHT: The system has two modes that require completely different architectures. NORMAL MODE handles browsing and purchasing for everyday events (low traffic, standard web architecture). ON-SALE MODE handles the initial rush for popular events (extreme traffic, queue-based admission, Redis-heavy, CDN-cached static content). The virtual queue is the bridge between uncontrollable demand and controllable supply.`,
    approach: `ARCHITECTURE OVERVIEW:

The system operates in two distinct modes. Normal mode uses a standard microservices architecture. On-sale mode activates additional infrastructure: virtual queue, dedicated Redis clusters, CDN pre-warming, and auto-scaled seat selection workers.

CORE SERVICES:

1. VIRTUAL QUEUE SERVICE
- Users join queue before on-sale time, get a randomized position (prevents bot advantage from faster connections)
- Queue backed by Redis sorted set: ZADD queue:{eventId} {timestamp} {userId}
- Batch admission: every N seconds, admit the next batch of users
- Admitted users receive a time-limited session token (JWT with 10-minute expiry)
- Queue status polling: cached response, updated every 2 seconds
- Bot protection: CAPTCHA before queue entry, device fingerprinting, rate limiting per IP

2. SEAT MAP SERVICE
- Redis bitmap per event section: seats:{eventId}:{section} - each bit is a seat
- Three states tracked: available (bit=0 in hold bitmap AND booking bitmap), held (bit=1 in hold bitmap), booked (bit=1 in booking bitmap)
- Seat metadata (row, number, price tier) in Elasticsearch for browsing
- Real-time availability: read bitmap, return available seats for section
- WebSocket push for seat map updates (every 2 seconds during on-sale)

3. HOLD SERVICE
- Atomic seat hold via Redis Lua script: check bit, set bit, create hold record with TTL
- Hold record: Redis key hold:{holdId} with 10-minute TTL containing seat IDs and user ID
- On TTL expiry: Redis keyspace notification triggers hold cleanup (release seats in bitmap)
- Maximum 6 seats per hold (anti-scalping)
- Hold extension not allowed (prevents indefinite holding)

4. BOOKING SERVICE
- Accepts hold ID, verifies hold still active, processes payment
- Atomic transition: remove hold, set booking bitmap, create booking record in PostgreSQL
- Idempotency key prevents double-charges
- On successful booking: generate QR code ticket, send confirmation email
- Schema: bookings(id, event_id, user_id, seat_ids JSONB, total_price, status, payment_id, created_at)
- Schema: tickets(id, booking_id, seat_id, qr_code, status, transfer_history JSONB)

5. EVENT DISCOVERY SERVICE
- Elasticsearch for event search: text, category, location (geo), date range
- Event pages served from CDN (pre-warmed before on-sale)
- Venue seat maps are static SVG/JSON templates cached at CDN

6. QUEUE POSITION ESTIMATOR
- Estimates wait time based on: position in queue, admission rate, average checkout time
- Updates dynamically as batches are admitted and seats sell
- Formula: estimatedWait = (position / admissionRate) - elapsedTime
- Admission rate adjusts based on checkout completion rate

API ENDPOINTS:
- GET /events/search - Search events
- GET /events/:id - Event details (CDN-cached)
- POST /queue/join - Join virtual queue
- GET /queue/status - Check queue position
- GET /events/:id/seats/:section - Get seat availability for section
- POST /seats/hold - Hold selected seats
- POST /bookings/confirm - Complete purchase
- POST /tickets/:id/transfer - Transfer ticket to another user

DATABASE CHOICES:
- Redis: Virtual queue (sorted sets), seat bitmaps, holds (TTL keys), session tokens
- PostgreSQL: Bookings, tickets, users, events source of truth
- Elasticsearch: Event discovery, venue search
- Kafka: Event streaming (booking events, analytics, notifications)
- CDN (CloudFront): Static event pages, seat map templates, images`,
    code: `// ==========================================
// TICKET BOOKING SYSTEM - CORE IMPLEMENTATIONS
// ==========================================

// --- VIRTUAL QUEUE WITH BATCH ADMISSION ---
class VirtualQueue {
  constructor(redisClient) {
    this.redis = redisClient;
    this.BATCH_SIZE = 5000;
    this.ADMISSION_INTERVAL_MS = 60000; // 1 minute
    this.SESSION_TTL = 600; // 10 minutes
  }

  async joinQueue(eventId, userId) {
    const queueKey = \`queue:\${eventId}\`;
    const dedupKey = \`queue_dedup:\${eventId}:\${userId}\`;
    // Prevent duplicate joins
    const exists = await this.redis.get(dedupKey);
    if (exists) return JSON.parse(exists);
    // Add to sorted set with score = current timestamp + random jitter (fairness)
    const score = Date.now() + Math.random() * 1000;
    await this.redis.zadd(queueKey, score, userId);
    await this.redis.set(dedupKey, '', 'EX', 7200); // 2-hour dedup window
    const position = await this.redis.zrank(queueKey, userId);
    const totalInQueue = await this.redis.zcard(queueKey);
    const estimatedWait = this.estimateWait(position, totalInQueue);
    const result = { queueToken: \`qt_\${eventId}_\${userId}\`, position: position + 1, totalInQueue, estimatedWaitMinutes: estimatedWait };
    await this.redis.set(dedupKey, JSON.stringify(result), 'EX', 7200);
    return result;
  }

  async getQueueStatus(eventId, userId) {
    const queueKey = \`queue:\${eventId}\`;
    const admittedKey = \`admitted:\${eventId}:\${userId}\`;
    // Check if already admitted
    const session = await this.redis.get(admittedKey);
    if (session) return { admitted: true, sessionToken: session, position: 0, estimatedWaitMinutes: 0 };
    const position = await this.redis.zrank(queueKey, userId);
    if (position === null) return { admitted: false, position: -1, error: 'Not in queue' };
    const totalInQueue = await this.redis.zcard(queueKey);
    return { admitted: false, position: position + 1, totalInQueue, estimatedWaitMinutes: this.estimateWait(position, totalInQueue) };
  }

  async admitNextBatch(eventId) {
    const queueKey = \`queue:\${eventId}\`;
    // Get the next BATCH_SIZE users from sorted set
    const users = await this.redis.zrange(queueKey, 0, this.BATCH_SIZE - 1);
    if (users.length === 0) return { admitted: 0 };
    const pipeline = this.redis.pipeline();
    const sessions = {};
    for (const userId of users) {
      const sessionToken = \`st_\${eventId}_\${Date.now()}_\${Math.random().toString(36).slice(2, 10)}\`;
      sessions[userId] = sessionToken;
      pipeline.set(\`admitted:\${eventId}:\${userId}\`, sessionToken, 'EX', this.SESSION_TTL);
      pipeline.set(\`session:\${sessionToken}\`, JSON.stringify({ eventId, userId, admittedAt: Date.now() }), 'EX', this.SESSION_TTL);
    }
    // Remove admitted users from queue
    pipeline.zrem(queueKey, ...users);
    await pipeline.exec();
    return { admitted: users.length, remaining: await this.redis.zcard(queueKey) };
  }

  estimateWait(position, totalInQueue) {
    const batchesAhead = Math.ceil(position / this.BATCH_SIZE);
    return Math.ceil(batchesAhead * (this.ADMISSION_INTERVAL_MS / 60000));
  }

  async validateSession(sessionToken) {
    const data = await this.redis.get(\`session:\${sessionToken}\`);
    if (!data) return null;
    return JSON.parse(data);
  }
}

// --- SEAT HOLD MANAGER WITH TTL EXPIRATION ---
class SeatHoldManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.HOLD_TTL = 600; // 10 minutes
    this.MAX_SEATS_PER_HOLD = 6;
    this.holdScript = \`
      local holdBitmap = KEYS[1]
      local bookBitmap = KEYS[2]
      local holdKey = KEYS[3]
      local userId = ARGV[1]
      local holdId = ARGV[2]
      local ttl = tonumber(ARGV[3])
      local seatCount = tonumber(ARGV[4])
      local seats = {}
      for i = 5, 4 + seatCount do
        seats[#seats + 1] = tonumber(ARGV[i])
      end
      -- Check all seats are available
      for _, seatIdx in ipairs(seats) do
        if redis.call('GETBIT', holdBitmap, seatIdx) == 1 then return -1 end
        if redis.call('GETBIT', bookBitmap, seatIdx) == 1 then return -2 end
      end
      -- Set hold bits
      for _, seatIdx in ipairs(seats) do
        redis.call('SETBIT', holdBitmap, seatIdx, 1)
      end
      -- Create hold record with TTL
      local holdData = cjson.encode({userId = userId, seats = seats, createdAt = tonumber(ARGV[4 + seatCount + 1])})
      redis.call('SET', holdKey, holdData, 'EX', ttl)
      return 1
    \`;
  }

  async holdSeats(eventId, sectionId, seatIndices, userId) {
    if (seatIndices.length > this.MAX_SEATS_PER_HOLD) {
      throw new Error(\`Maximum \${this.MAX_SEATS_PER_HOLD} seats per hold\`);
    }
    const holdId = \`hold_\${Date.now()}_\${Math.random().toString(36).slice(2, 10)}\`;
    const result = await this.redis.eval(
      this.holdScript, 3,
      \`seats_hold:\${eventId}:\${sectionId}\`,
      \`seats_book:\${eventId}:\${sectionId}\`,
      \`hold:\${holdId}\`,
      userId, holdId, this.HOLD_TTL, seatIndices.length,
      ...seatIndices, Date.now()
    );
    if (result === -1) return { success: false, reason: 'One or more seats already held' };
    if (result === -2) return { success: false, reason: 'One or more seats already booked' };
    // Schedule cleanup on expiry
    this.scheduleHoldCleanup(eventId, sectionId, holdId, seatIndices);
    return { success: true, holdId, seats: seatIndices, expiresIn: this.HOLD_TTL, expiresAt: new Date(Date.now() + this.HOLD_TTL * 1000).toISOString() };
  }

  async releaseHold(eventId, sectionId, holdId) {
    const holdData = await this.redis.get(\`hold:\${holdId}\`);
    if (!holdData) return { released: false, reason: 'Hold not found or expired' };
    const { seats } = JSON.parse(holdData);
    const pipeline = this.redis.pipeline();
    for (const seatIdx of seats) {
      pipeline.setbit(\`seats_hold:\${eventId}:\${sectionId}\`, seatIdx, 0);
    }
    pipeline.del(\`hold:\${holdId}\`);
    await pipeline.exec();
    return { released: true, seats };
  }

  async confirmHold(eventId, sectionId, holdId) {
    const holdData = await this.redis.get(\`hold:\${holdId}\`);
    if (!holdData) throw new Error('Hold expired');
    const { seats, userId } = JSON.parse(holdData);
    const pipeline = this.redis.pipeline();
    for (const seatIdx of seats) {
      pipeline.setbit(\`seats_hold:\${eventId}:\${sectionId}\`, seatIdx, 0);
      pipeline.setbit(\`seats_book:\${eventId}:\${sectionId}\`, seatIdx, 1);
    }
    pipeline.del(\`hold:\${holdId}\`);
    await pipeline.exec();
    return { confirmed: true, seats, userId };
  }

  scheduleHoldCleanup(eventId, sectionId, holdId, seatIndices) {
    setTimeout(async () => {
      const exists = await this.redis.exists(\`hold:\${holdId}\`);
      if (!exists) {
        const pipeline = this.redis.pipeline();
        for (const seatIdx of seatIndices) {
          pipeline.setbit(\`seats_hold:\${eventId}:\${sectionId}\`, seatIdx, 0);
        }
        await pipeline.exec();
      }
    }, (this.HOLD_TTL + 5) * 1000);
  }

  async getAvailableSeats(eventId, sectionId, totalSeats) {
    const [holdBits, bookBits] = await Promise.all([
      this.redis.getBuffer(\`seats_hold:\${eventId}:\${sectionId}\`),
      this.redis.getBuffer(\`seats_book:\${eventId}:\${sectionId}\`),
    ]);
    const available = [];
    for (let i = 0; i < totalSeats; i++) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = 7 - (i % 8);
      const isHeld = holdBits && holdBits.length > byteIndex ? (holdBits[byteIndex] >> bitIndex) & 1 : 0;
      const isBooked = bookBits && bookBits.length > byteIndex ? (bookBits[byteIndex] >> bitIndex) & 1 : 0;
      if (!isHeld && !isBooked) available.push(i);
    }
    return available;
  }
}`,
    jsCode: `// ==========================================
// TICKET BOOKING: QUEUE ESTIMATOR & BOOKING
// ==========================================

// --- QUEUE POSITION ESTIMATOR ---
class QueuePositionEstimator {
  constructor(redisClient) {
    this.redis = redisClient;
    this.metricsWindow = 300; // 5-minute sliding window
  }

  async estimate(eventId, position) {
    const metrics = await this.getMetrics(eventId);
    if (!metrics || metrics.admissionRate === 0) {
      return { estimatedWaitSeconds: -1, estimatedWaitFormatted: 'Calculating...' };
    }
    const seatsRemaining = metrics.totalSeats - metrics.bookedSeats;
    if (position > seatsRemaining) {
      return { estimatedWaitSeconds: -1, estimatedWaitFormatted: 'Tickets may sell out before your turn', likelyAvailable: false };
    }
    const secondsPerUser = 1 / metrics.effectiveThroughput;
    const estimatedSeconds = Math.ceil(position * secondsPerUser);
    return {
      estimatedWaitSeconds: estimatedSeconds,
      estimatedWaitFormatted: this.formatWait(estimatedSeconds),
      positionInQueue: position,
      admissionRate: metrics.admissionRate,
      checkoutCompletionRate: metrics.checkoutCompletionRate,
      seatsRemaining,
      likelyAvailable: true,
    };
  }

  async recordMetrics(eventId, metrics) {
    const key = \`queue_metrics:\${eventId}\`;
    const timestamp = Math.floor(Date.now() / 1000);
    const pipeline = this.redis.pipeline();
    pipeline.hset(key, 'admissionRate', metrics.admissionRate.toString());
    pipeline.hset(key, 'checkoutCompletionRate', metrics.checkoutCompletionRate.toString());
    pipeline.hset(key, 'totalSeats', metrics.totalSeats.toString());
    pipeline.hset(key, 'bookedSeats', metrics.bookedSeats.toString());
    pipeline.hset(key, 'avgCheckoutTimeSeconds', metrics.avgCheckoutTimeSeconds.toString());
    pipeline.hset(key, 'lastUpdated', timestamp.toString());
    pipeline.expire(key, 7200);
    await pipeline.exec();
  }

  async getMetrics(eventId) {
    const data = await this.redis.hgetall(\`queue_metrics:\${eventId}\`);
    if (!data || !data.admissionRate) return null;
    const admissionRate = parseFloat(data.admissionRate);
    const checkoutRate = parseFloat(data.checkoutCompletionRate);
    return {
      admissionRate,
      checkoutCompletionRate: checkoutRate,
      effectiveThroughput: admissionRate * checkoutRate,
      totalSeats: parseInt(data.totalSeats),
      bookedSeats: parseInt(data.bookedSeats),
      avgCheckoutTimeSeconds: parseFloat(data.avgCheckoutTimeSeconds),
    };
  }

  formatWait(seconds) {
    if (seconds < 60) return \`Less than a minute\`;
    if (seconds < 3600) return \`About \${Math.ceil(seconds / 60)} minutes\`;
    return \`About \${Math.floor(seconds / 3600)} hours \${Math.ceil((seconds % 3600) / 60)} minutes\`;
  }
}

// --- TICKET BOOKING ORCHESTRATOR ---
class TicketBookingService {
  constructor(db, seatHoldManager, queue, paymentService) {
    this.db = db;
    this.holdManager = seatHoldManager;
    this.queue = queue;
    this.paymentService = paymentService;
  }

  async selectAndHoldSeats(eventId, sectionId, seatIndices, sessionToken) {
    // Validate session (user was admitted from queue)
    const session = await this.queue.validateSession(sessionToken);
    if (!session) throw new BookingError('SESSION_EXPIRED', 'Your session has expired. Please rejoin the queue.');
    if (session.eventId !== eventId) throw new BookingError('INVALID_SESSION', 'Session does not match event.');
    // Attempt to hold seats
    const holdResult = await this.holdManager.holdSeats(eventId, sectionId, seatIndices, session.userId);
    if (!holdResult.success) throw new BookingError('HOLD_FAILED', holdResult.reason);
    return holdResult;
  }

  async confirmBooking(holdId, paymentMethodId, idempotencyKey) {
    // Get hold details
    const holdData = await this.holdManager.redis.get(\`hold:\${holdId}\`);
    if (!holdData) throw new BookingError('HOLD_EXPIRED', 'Your seat hold has expired. Please select seats again.');
    const hold = JSON.parse(holdData);
    // Calculate total price
    const seatPrices = await this.getSeatPrices(hold.eventId, hold.sectionId, hold.seats);
    const totalPrice = seatPrices.reduce((sum, s) => sum + s.price, 0);
    // Process payment
    let paymentResult;
    try {
      paymentResult = await this.paymentService.charge(hold.userId, totalPrice, 'usd', idempotencyKey);
    } catch (payErr) {
      throw new BookingError('PAYMENT_FAILED', \`Payment failed: \${payErr.message}\`);
    }
    // Confirm hold -> booking (atomic in Redis)
    const eventParts = holdId.split('_');
    const eventId = hold.eventId || eventParts[0];
    const sectionId = hold.sectionId || 'main';
    await this.holdManager.confirmHold(eventId, sectionId, holdId);
    // Create booking record in PostgreSQL
    const booking = await this.db.query(
      \`INSERT INTO bookings (user_id, event_id, seat_ids, total_price, payment_id, status, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6)
       ON CONFLICT (idempotency_key) DO NOTHING RETURNING id\`,
      [hold.userId, eventId, JSON.stringify(hold.seats), totalPrice, paymentResult.paymentId, idempotencyKey]
    );
    if (booking.rows.length === 0) {
      const existing = await this.db.query('SELECT id FROM bookings WHERE idempotency_key = $1', [idempotencyKey]);
      return { bookingId: existing.rows[0].id, duplicate: true };
    }
    // Generate tickets
    const tickets = await this.generateTickets(booking.rows[0].id, eventId, hold.seats, hold.userId);
    return { bookingId: booking.rows[0].id, tickets, totalPrice, seatCount: hold.seats.length };
  }

  async generateTickets(bookingId, eventId, seatIndices, userId) {
    const tickets = [];
    for (const seatIdx of seatIndices) {
      const qrData = JSON.stringify({ bookingId, eventId, seat: seatIdx, userId, ts: Date.now() });
      const crypto = require('crypto');
      const qrCode = crypto.createHash('sha256').update(qrData + 'secret_salt').digest('hex');
      const ticket = await this.db.query(
        'INSERT INTO tickets (booking_id, event_id, seat_index, qr_code, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [bookingId, eventId, seatIdx, qrCode, 'valid']
      );
      tickets.push({ ticketId: ticket.rows[0].id, seat: seatIdx, qrCode });
    }
    return tickets;
  }

  async getSeatPrices(eventId, sectionId, seatIndices) {
    const result = await this.db.query(
      'SELECT seat_index, price_tier, price FROM seat_pricing WHERE event_id = $1 AND section_id = $2 AND seat_index = ANY($3)',
      [eventId, sectionId, seatIndices]
    );
    return result.rows.map(r => ({ seat: r.seat_index, tier: r.price_tier, price: parseFloat(r.price) }));
  }
}

class BookingError extends Error {
  constructor(code, msg) { super(msg); this.code = code; this.name = 'BookingError'; }
}`,
    explanation: `SCALING ANALYSIS:

1. VIRTUAL QUEUE:
- Redis sorted set handles 10M members efficiently
- ZADD is O(log N) = O(log 10M) = ~23 operations per insert
- At 333K inserts/second: need Redis Cluster with 4+ shards
- Queue status polling: cache response per user for 2 seconds (reduces QPS by 50%)
- Total queue data: 10M users x 50B = 500MB (fits on single Redis node)

2. SEAT MAP (BITMAPS):
- 50K seats per venue = 6.25KB per bitmap
- Two bitmaps per section (hold + booked) = 12.5KB per section
- 10 sections per venue = 125KB total per event
- GETBIT/SETBIT are O(1) operations
- Lua script for atomic hold: 100K operations/second per shard

3. HOLD SERVICE:
- 50K concurrent holds = 50K Redis keys with TTL
- Each key: 200B = 10MB total (trivial)
- TTL expiration: Redis handles natively, O(1) per expiration
- Keyspace notifications for cleanup: async, non-blocking
- Worst case: all 50K holds expire at once (cleanup backlog: 50K setbit operations = <1 second)

4. BOOKING THROUGHPUT:
- 50K seats sold in 10 minutes = 83 bookings/second
- PostgreSQL easily handles this with proper indexing
- Idempotency prevents double-charges during the rush

ON-SALE MODE ARCHITECTURE:
- CDN pre-warmed with event page, seat map template, static assets
- API Gateway rate limits: 1 queue join per user, 1 status poll per 2 seconds
- Separate on-sale API cluster (auto-scaled) from normal operations
- Redis Cluster dedicated to on-sale events (isolated from normal operations)
- Real-time dashboard: seats sold/second, queue depth, error rate

FAILURE MODES:
- Redis failure during on-sale: Queue state is lost; restart sale with fresh queue (extreme but necessary)
- Hold expiry not triggered: Backup cleanup job runs every 30 seconds, releasing orphaned holds
- Payment timeout after hold confirmed: Hold remains; user can retry within hold window
- Double-booking after Redis recovery: PostgreSQL constraint (unique seat_id + event_id) is the final safety net
- Queue position disputes: Audit log of all queue operations with timestamps

BOTTLENECK IDENTIFICATION:
- Queue join during first 30 seconds: 333K/s -> Redis Cluster with 4+ shards + rate limiting
- Seat map polling by 50K admitted users: WebSocket push instead of polling (1 update per 2s)
- Payment processing 83 TPS: Standard for payment gateways; add retry with backoff
- Ticket generation: Async after booking confirmation; user gets booking ID immediately

MONITORING:
- Queue depth and drain rate in real-time
- Seat availability per section (updated every 2 seconds)
- Hold creation rate, expiry rate, and conversion rate (held -> booked)
- Payment success/failure/timeout rates during on-sale
- Bot detection: flag users with suspicious patterns (too-fast clicks, multiple IPs)
- End-to-end latency: queue join -> seat selection -> booking confirmation

TRADE-OFFS:
- Random queue position vs FIFO: Random prevents bot advantage (bots that connect faster get no benefit). FIFO rewards preparation but advantages bots. Random is fairer for humans.
- Seat holds with TTL vs no holds: Holds prevent "while you were checking out, someone took your seat" but temporarily reduce available inventory. Without holds, checkout race conditions frustrate users. Holds with reasonable TTL (10 min) is the industry standard.
- Bitmap vs database for seat status: Bitmap is O(1) and fits in memory but is volatile. Database is durable but slow under extreme concurrency. Use both: Redis bitmap for real-time operations, PostgreSQL as the durable backup. Reconcile continuously.`,
    timeComplexity: `Queue join: O(log N) Redis ZADD where N is queue size. Queue status: O(1) cached lookup. Seat availability: O(S) where S is seats per section (bitmap scan). Seat hold: O(k) where k is number of seats held (atomic Lua script). Booking confirmation: O(k) for k seats (bitmap update + DB insert). Queue admission batch: O(B * log N) where B is batch size.`,
    spaceComplexity: `Virtual queue: 10M users x 50B = 500MB Redis. Seat bitmaps: 50K seats x 2 bitmaps x 1 bit = 12.5KB per event (negligible). Holds: 50K concurrent x 200B = 10MB Redis. Bookings: 50K per event x 500B = 25MB PostgreSQL per event. Tickets: 50K per event x 200B = 10MB. Queue metrics: 1KB per event. Total per major on-sale event: ~520MB Redis + 35MB PostgreSQL.`,
    hints: [
      `The virtual queue is the most critical component for high-demand events. It converts uncontrollable burst traffic (10M requests in 30 seconds) into controlled flow (5,000 users admitted per minute). Without the queue, the backend would crash or produce a terrible user experience. Implement the queue as a Redis sorted set with randomized scores to prevent bot advantage.`,
      `Use Redis bitmaps for seat availability tracking. A 50,000-seat venue requires only 6.25KB per bitmap. GETBIT and SETBIT are O(1) operations. Use TWO bitmaps per section: one for holds and one for confirmed bookings. A seat is available only if both bits are 0. This separation allows holds to expire without affecting bookings.`,
      `The seat hold Lua script MUST be atomic. It checks all requested seats are available, then sets all hold bits in a single non-interruptible operation. If you check and set in separate Redis commands, two users can both see a seat as available and both hold it. The Lua script runs on the Redis server and is guaranteed atomic.`,
      `Handle hold expiration with a belt-and-suspenders approach. Primary: Redis TTL on the hold key. Backup: a scheduled cleanup job that scans for expired holds every 30 seconds. Tertiary: on any seat operation, verify the hold bitmap matches active holds. This triple-layer ensures no seats are permanently leaked.`,
      `For bot protection, randomize queue positions rather than using strict FIFO. Bots that connect microseconds earlier should not get better positions than humans. Open the queue 30 minutes before on-sale, shuffle positions at on-sale time, then admit in shuffled order. Also require CAPTCHA before queue entry and implement device fingerprinting.`,
      `Separate on-sale infrastructure from normal operations. On-sale events should have dedicated Redis clusters, dedicated API servers (auto-scaled), and dedicated database connection pools. This prevents a popular on-sale from degrading the experience for users browsing other events or managing their existing tickets.`,
      `The queue position estimator should be HONEST with users. If there are 50K seats and the user is at position 100K, tell them tickets will likely sell out before their turn. This reduces frustration (users can stop waiting) and reduces server load (fewer users polling for status). Update the estimate every 2 seconds based on actual admission and booking rates.`,
      `Design the seat map UI as a client-side rendering with server-sent updates. The server sends the initial bitmap state, then pushes diffs via WebSocket every 2 seconds (only changed bits). The client renders the seat map locally. This reduces server load to O(delta) per update instead of O(total seats) and enables smooth real-time visualization.`
    ],
  },
  {
    id: 9015,
    description: `Design a Food Delivery System (DoorDash)

FUNCTIONAL REQUIREMENTS:
- Customers browse restaurant menus, place orders, and track delivery in real-time
- Restaurants receive orders, manage menus, update preparation status
- Drivers (dashers) accept delivery assignments, navigate to restaurant and customer
- Match orders with optimal available drivers based on proximity and capacity
- Real-time GPS tracking of driver location
- Estimated time of arrival (ETA) for each order stage
- Surge pricing during high-demand periods
- Reviews and ratings for restaurants, food, and drivers

NON-FUNCTIONAL REQUIREMENTS:
- Support 10M+ orders per day across 100K+ restaurants
- Order placement to driver assignment in under 30 seconds
- Real-time location updates every 5 seconds from active drivers
- ETA accuracy within 3 minutes 90% of the time
- 99.95% availability
- Handle dinner-time peak (5x average traffic)

CAPACITY ESTIMATION:
- 10M orders/day, peak 50M orders/day during events
- 500K active drivers at peak sending GPS every 5 seconds = 100K location updates/second
- 100K restaurants with average 50 menu items = 5M menu items
- Average order: $25, platform takes 20% = $5 commission = $50M daily revenue
- Location data: 500K drivers x 12 updates/min x 60 min x 8 hours = 2.88B location points/day
- ETA calculations: 10M orders x 5 ETA updates each = 50M ETA computations/day`,
    examples: `CAPACITY ESTIMATION WALKTHROUGH:

Location Ingestion:
- 500K active drivers x (1 update / 5 seconds) = 100K GPS updates/second
- Each update: driver_id (8B) + lat (8B) + lng (8B) + timestamp (8B) + heading (4B) + speed (4B) = 40B
- Data rate: 100K x 40B = 4MB/second = 345GB/day
- Storage: keep 30 days of history = 10.3TB (compress to ~2TB)
- Real-time store (Redis): 500K drivers x 40B = 20MB (trivially small)

Driver Matching:
- 10M orders/day = ~116 orders/second average
- Peak (5x): 580 orders/second
- Each order needs: find drivers within 5km, score by distance + rating + capacity
- Geospatial query: Redis GEO with 500K drivers -> O(N+log(N)) for GEORADIUS
- Average 10-50 candidate drivers per order -> score and rank in ~5ms
- Total matching latency target: <100ms

ETA Computation:
- 10M orders x 5 ETA updates = 50M computations/day = ~580/second
- Each ETA: restaurant prep time + driver-to-restaurant + restaurant-to-customer
- Uses historical data, real-time traffic, current kitchen load
- Pre-compute common routes, cache for 5 minutes

Surge Pricing:
- Divide service area into hexagonal zones (H3 geospatial index)
- Each zone: track supply (available drivers) and demand (pending orders)
- Update multiplier every 2 minutes based on supply/demand ratio
- 10K zones x update every 2 min = 83 zone updates/second

API DESIGN:

POST /api/v1/orders
{ "restaurantId": "R123", "items": [{ "menuItemId": "MI456", "quantity": 2, "customizations": ["no onions"] }], "deliveryAddress": { "lat": 37.7749, "lng": -122.4194 }, "paymentMethodId": "PM789" }

GET /api/v1/orders/:orderId/track
Response: { "orderId": "O100", "status": "driver_enroute_to_customer", "driver": { "name": "Alex", "lat": 37.775, "lng": -122.420, "heading": 45 }, "eta": { "minutes": 8, "updatedAt": "..." } }

POST /api/v1/drivers/location
{ "lat": 37.7750, "lng": -122.4195, "heading": 90, "speed": 25 }`,
    intuition: `A food delivery system is a real-time three-sided marketplace connecting customers, restaurants, and drivers. Think of it as an air traffic control system for food. The DISPATCH service is the control tower: it sees all orders (planes needing pilots) and all available drivers (pilots) on a map, and must assign each order to the best driver within seconds.

The LOCATION SERVICE is the radar system: it ingests GPS pings from hundreds of thousands of moving drivers every few seconds and makes that data queryable in real-time. The challenge is not storing it (20MB in Redis) but making it queryable: "find all available drivers within 5km of this restaurant, sorted by distance."

The ORDER STATE MACHINE is the flight plan: an order transitions through well-defined states (PLACED -> CONFIRMED -> PREPARING -> READY -> PICKED_UP -> ENROUTE -> DELIVERED), and each transition triggers different actions (notify customer, notify driver, start ETA countdown, etc.). Invalid transitions are rejected.

KEY INSIGHT: The driver matching problem is a bipartite matching optimization. On one side are orders waiting for drivers. On the other side are available drivers. The goal is to minimize total delivery time across all active orders, not just optimize each order individually. A driver 3km from restaurant A but heading toward restaurant B might be a better match for an order from B, even though another driver is closer to B but heading away. This is why geohash-based proximity is necessary but not sufficient - you also need direction, speed, and current load.`,
    approach: `ARCHITECTURE OVERVIEW:

The system uses event-driven microservices. Orders flow through a state machine. Driver locations stream into a geospatial index. The dispatch service matches orders with drivers using a scoring algorithm. Real-time updates push to all three parties via WebSockets.

CORE SERVICES:

1. ORDER SERVICE (State Machine)
- Manages the complete order lifecycle
- States: PLACED -> RESTAURANT_CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> DRIVER_ASSIGNED -> PICKED_UP -> ENROUTE -> DELIVERED (or CANCELLED at various stages)
- Each state transition publishes event to Kafka
- Compensation actions: CANCELLED triggers refund, restaurant compensation, driver reassignment
- Schema: orders(id, customer_id, restaurant_id, driver_id, items JSONB, subtotal, delivery_fee, surge_multiplier, total, status, placed_at, estimated_delivery, delivered_at)

2. MATCHING/DISPATCH SERVICE
- Triggered when order status becomes READY_FOR_PICKUP (or earlier for pre-dispatch)
- Queries Redis GEO for drivers near the restaurant
- Scores candidates: distance_score x rating_score x capacity_score x direction_score
- Sends assignment to top driver; if declined, offers to next candidate
- Timeout: if no driver accepts in 60 seconds, expand search radius and increase driver incentive
- Schema (Redis): GEOADD drivers:available {lng} {lat} {driverId}

3. LOCATION SERVICE
- Ingests GPS updates from drivers via lightweight UDP or HTTP endpoint
- Writes to Redis GEO (current position) and Kafka (location history)
- Updates geohash index for efficient proximity queries
- Pushes location updates to relevant customers via WebSocket
- Detects anomalies: driver stationary for too long, impossible speed, GPS spoofing
- Schema (Redis): GEO key drivers:active; Hash key driver:{id}:meta { status, heading, speed, lastUpdate }

4. ETA SERVICE
- Three-component ETA: prep_time + pickup_travel + delivery_travel
- prep_time: ML model based on restaurant historical data, current queue length, time of day
- pickup_travel: Google Maps / OSRM distance matrix with real-time traffic
- delivery_travel: restaurant-to-customer route calculation
- Recalculates every 60 seconds for active orders
- Caches common routes (restaurant-to-zone centroids) for 5 minutes

5. SURGE PRICING ENGINE
- Divides service area into H3 hexagonal zones (resolution 8, ~0.7km per hex)
- Per zone: tracks available_drivers and pending_orders in real-time
- Surge multiplier = max(1, demand_score / supply_score)
- demand_score = pending_orders / historical_avg_orders
- supply_score = available_drivers / historical_avg_drivers
- Updates every 2 minutes
- Communicates multiplier to customer app before order confirmation

6. RESTAURANT SERVICE
- Menu management: items, prices, availability, customization options
- Order acceptance/rejection with SLA (must respond within 5 minutes)
- Preparation time estimates updated based on actual performance
- Kitchen display system integration
- Schema: restaurants(id, name, location, cuisine, rating, avg_prep_time, is_open)
- Schema: menu_items(id, restaurant_id, name, description, price, category, available, customizations JSONB)

7. REAL-TIME NOTIFICATION SERVICE
- WebSocket connections for customer order tracking
- Push notifications for order status changes
- Driver app: new assignment offers, navigation, delivery confirmation
- Restaurant app: new order alerts, preparation reminders

API ENDPOINTS:
- POST /orders - Place order
- GET /orders/:id/track - Real-time tracking
- POST /orders/:id/cancel - Cancel order
- POST /drivers/location - Update driver location (high-frequency)
- POST /drivers/assignments/:id/accept - Accept/decline delivery
- GET /restaurants/:id/menu - Restaurant menu
- GET /surge/zones - Current surge multipliers for area

DATABASE CHOICES:
- PostgreSQL: Orders, restaurants, menus, users, payments (ACID)
- Redis: Driver locations (GEO), surge multipliers, order cache, driver status
- Elasticsearch: Restaurant search (text + geo)
- Kafka: Event streaming (order events, location events, analytics)
- TimescaleDB/InfluxDB: Location history (time-series optimized)
- S3: Menu images, receipt archives`,
    code: `// ==========================================
// FOOD DELIVERY SYSTEM - CORE IMPLEMENTATIONS
// ==========================================

// --- ORDER STATE MACHINE ---
class OrderStateMachine {
  constructor() {
    this.transitions = {
      placed:               { confirm: 'restaurant_confirmed', cancel: 'cancelled', reject: 'rejected' },
      restaurant_confirmed: { start_prep: 'preparing', cancel: 'cancelled' },
      preparing:            { ready: 'ready_for_pickup', cancel: 'cancelled_preparing' },
      ready_for_pickup:     { assign_driver: 'driver_assigned', cancel: 'cancelled_ready' },
      driver_assigned:      { pickup: 'picked_up', driver_cancel: 'ready_for_pickup', cancel: 'cancelled_assigned' },
      picked_up:            { enroute: 'enroute' },
      enroute:              { arrive: 'arrived', deliver: 'delivered' },
      arrived:              { deliver: 'delivered' },
      delivered:            {},
      cancelled:            {},
      cancelled_preparing:  {},
      cancelled_ready:      {},
      cancelled_assigned:   {},
      rejected:             {},
    };
    this.sideEffects = {
      restaurant_confirmed: ['notify_customer', 'start_driver_search'],
      preparing:            ['update_eta'],
      ready_for_pickup:     ['notify_driver', 'update_eta'],
      driver_assigned:      ['notify_customer', 'notify_restaurant', 'start_tracking'],
      picked_up:            ['notify_customer', 'update_eta'],
      enroute:              ['notify_customer', 'update_eta'],
      delivered:            ['notify_customer', 'process_payment', 'request_rating'],
      cancelled:            ['refund_customer', 'notify_restaurant'],
      cancelled_preparing:  ['refund_customer', 'compensate_restaurant'],
      cancelled_assigned:   ['refund_customer', 'compensate_restaurant', 'release_driver'],
    };
  }

  canTransition(currentState, action) {
    return !!(this.transitions[currentState] && this.transitions[currentState][action]);
  }

  transition(currentState, action) {
    if (!this.canTransition(currentState, action)) {
      throw new Error(\`Invalid transition: \${currentState} -> \${action}\`);
    }
    const newState = this.transitions[currentState][action];
    return { newState, sideEffects: this.sideEffects[newState] || [] };
  }

  getValidActions(state) {
    return Object.keys(this.transitions[state] || {});
  }

  isFinalState(state) {
    return Object.keys(this.transitions[state] || {}).length === 0;
  }
}

// --- GEOSPATIAL DRIVER MATCHING ---
class DriverMatchingService {
  constructor(redisClient) {
    this.redis = redisClient;
    this.DEFAULT_RADIUS_KM = 5;
    this.MAX_RADIUS_KM = 15;
    this.RADIUS_INCREMENT_KM = 3;
    this.MAX_CANDIDATES = 20;
  }

  async findBestDriver(order) {
    const { restaurantLat, restaurantLng } = order;
    let radius = this.DEFAULT_RADIUS_KM;
    let candidates = [];

    while (candidates.length < 3 && radius <= this.MAX_RADIUS_KM) {
      candidates = await this.redis.georadius(
        'drivers:available', restaurantLng, restaurantLat,
        radius, 'km', 'WITHCOORD', 'WITHDIST', 'ASC', 'COUNT', this.MAX_CANDIDATES
      );
      if (candidates.length < 3) radius += this.RADIUS_INCREMENT_KM;
    }

    if (candidates.length === 0) return null;

    const scored = await Promise.all(candidates.map(async (c) => {
      const driverId = c[0];
      const distance = parseFloat(c[1]);
      const [lng, lat] = c[2].map(parseFloat);
      const meta = await this.redis.hgetall(\`driver:\${driverId}:meta\`);
      const score = this.calculateScore(distance, meta, order, lat, lng);
      return { driverId, distance, lat, lng, score, ...meta };
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0];
  }

  calculateScore(distance, driverMeta, order, driverLat, driverLng) {
    // Distance score: closer is better (inverse, normalized)
    const distanceScore = Math.max(0, 1 - (distance / this.MAX_RADIUS_KM));

    // Rating score: higher rating is better
    const rating = parseFloat(driverMeta.rating || '4.5');
    const ratingScore = (rating - 3) / 2; // Normalize 3-5 to 0-1

    // Direction score: driver heading toward restaurant is better
    const heading = parseFloat(driverMeta.heading || '0');
    const bearingToRestaurant = this.calculateBearing(driverLat, driverLng, order.restaurantLat, order.restaurantLng);
    const angleDiff = Math.abs(heading - bearingToRestaurant);
    const normalizedAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff;
    const directionScore = Math.max(0, 1 - (normalizedAngle / 180));

    // Acceptance rate score
    const acceptanceRate = parseFloat(driverMeta.acceptanceRate || '0.85');

    // Weighted combination
    return (distanceScore * 0.4) + (ratingScore * 0.15) + (directionScore * 0.25) + (acceptanceRate * 0.2);
  }

  calculateBearing(lat1, lng1, lat2, lng2) {
    const toRad = (d) => d * Math.PI / 180;
    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  async updateDriverLocation(driverId, lat, lng, heading, speed) {
    const pipeline = this.redis.pipeline();
    pipeline.geoadd('drivers:available', lng, lat, driverId);
    pipeline.hmset(\`driver:\${driverId}:meta\`, { lat: lat.toString(), lng: lng.toString(), heading: heading.toString(), speed: speed.toString(), lastUpdate: Date.now().toString() });
    await pipeline.exec();
  }

  async removeDriver(driverId) {
    const pipeline = this.redis.pipeline();
    pipeline.zrem('drivers:available', driverId);
    pipeline.del(\`driver:\${driverId}:meta\`);
    await pipeline.exec();
  }
}

// --- SURGE PRICING CALCULATOR ---
class SurgePricingEngine {
  constructor(redisClient) {
    this.redis = redisClient;
    this.MIN_MULTIPLIER = 1.0;
    this.MAX_MULTIPLIER = 3.0;
    this.UPDATE_INTERVAL_SEC = 120;
  }

  async calculateSurge(zoneId) {
    const [demandStr, supplyStr, histDemandStr, histSupplyStr] = await Promise.all([
      this.redis.get(\`zone:\${zoneId}:demand\`),
      this.redis.get(\`zone:\${zoneId}:supply\`),
      this.redis.get(\`zone:\${zoneId}:hist_demand\`),
      this.redis.get(\`zone:\${zoneId}:hist_supply\`),
    ]);
    const demand = parseInt(demandStr || '0');
    const supply = parseInt(supplyStr || '1');
    const histDemand = parseInt(histDemandStr || '1');
    const histSupply = parseInt(histSupplyStr || '1');
    const demandRatio = demand / Math.max(histDemand, 1);
    const supplyRatio = supply / Math.max(histSupply, 1);
    const rawMultiplier = demandRatio / Math.max(supplyRatio, 0.1);
    const smoothed = 0.7 * rawMultiplier + 0.3 * 1.0; // Smooth toward 1.0
    const multiplier = Math.min(this.MAX_MULTIPLIER, Math.max(this.MIN_MULTIPLIER, Math.round(smoothed * 10) / 10));
    await this.redis.set(\`zone:\${zoneId}:surge\`, multiplier.toString(), 'EX', this.UPDATE_INTERVAL_SEC * 2);
    return { zoneId, multiplier, demand, supply, demandRatio: demandRatio.toFixed(2), supplyRatio: supplyRatio.toFixed(2) };
  }

  async getSurgeForLocation(lat, lng) {
    const zoneId = this.latLngToH3Zone(lat, lng);
    const cached = await this.redis.get(\`zone:\${zoneId}:surge\`);
    return cached ? parseFloat(cached) : 1.0;
  }

  latLngToH3Zone(lat, lng) {
    // Simplified H3-like zone ID (real system uses Uber's H3 library)
    const latBucket = Math.floor(lat * 100);
    const lngBucket = Math.floor(lng * 100);
    return \`h3_\${latBucket}_\${lngBucket}\`;
  }

  async recordDemand(lat, lng) {
    const zoneId = this.latLngToH3Zone(lat, lng);
    await this.redis.incr(\`zone:\${zoneId}:demand\`);
    await this.redis.expire(\`zone:\${zoneId}:demand\`, this.UPDATE_INTERVAL_SEC * 2);
  }

  async recordSupply(lat, lng) {
    const zoneId = this.latLngToH3Zone(lat, lng);
    await this.redis.incr(\`zone:\${zoneId}:supply\`);
    await this.redis.expire(\`zone:\${zoneId}:supply\`, this.UPDATE_INTERVAL_SEC * 2);
  }
}`,
    jsCode: `// ==========================================
// FOOD DELIVERY: ETA PREDICTOR & ORDER TRACKER
// ==========================================

// --- ETA PREDICTOR ---
class ETAPredictor {
  constructor(db, redisClient, routingService) {
    this.db = db;
    this.redis = redisClient;
    this.routing = routingService;
    this.CACHE_TTL = 300; // 5 minutes
  }

  async predictETA(order) {
    const prepTime = await this.estimatePrepTime(order);
    const pickupTravel = await this.estimateTravel(
      order.driverLat, order.driverLng, order.restaurantLat, order.restaurantLng
    );
    const deliveryTravel = await this.estimateTravel(
      order.restaurantLat, order.restaurantLng, order.customerLat, order.customerLng
    );
    const totalMinutes = prepTime + pickupTravel.minutes + deliveryTravel.minutes;
    const bufferMinutes = this.calculateBuffer(order, totalMinutes);
    return {
      totalMinutes: Math.round(totalMinutes + bufferMinutes),
      breakdown: {
        prepTimeMinutes: prepTime,
        pickupTravelMinutes: pickupTravel.minutes,
        deliveryTravelMinutes: deliveryTravel.minutes,
        bufferMinutes,
        pickupDistanceKm: pickupTravel.distanceKm,
        deliveryDistanceKm: deliveryTravel.distanceKm,
      },
      estimatedDeliveryTime: new Date(Date.now() + (totalMinutes + bufferMinutes) * 60000).toISOString(),
      confidence: this.calculateConfidence(order),
    };
  }

  async estimatePrepTime(order) {
    // Factor 1: Restaurant's historical average
    const histResult = await this.db.query(
      \`SELECT AVG(EXTRACT(EPOCH FROM (picked_up_at - restaurant_confirmed_at)) / 60) as avg_prep
       FROM orders WHERE restaurant_id = $1 AND status = 'delivered'
       AND placed_at > NOW() - INTERVAL '30 days' LIMIT 1000\`,
      [order.restaurantId]
    );
    const historicalAvg = histResult.rows[0] ? parseFloat(histResult.rows[0].avg_prep) || 20 : 20;

    // Factor 2: Current kitchen load
    const activeOrders = await this.db.query(
      \`SELECT COUNT(*) as cnt FROM orders
       WHERE restaurant_id = $1 AND status IN ('restaurant_confirmed', 'preparing')\`,
      [order.restaurantId]
    );
    const kitchenLoad = parseInt(activeOrders.rows[0].cnt);
    const loadMultiplier = 1 + (kitchenLoad * 0.1); // Each active order adds 10%

    // Factor 3: Order complexity (number of items)
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const complexityMultiplier = 1 + (Math.max(0, itemCount - 3) * 0.05); // +5% per item beyond 3

    // Factor 4: Time of day (lunch/dinner rush)
    const hour = new Date().getHours();
    const rushMultiplier = (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 20) ? 1.15 : 1.0;

    return Math.round(historicalAvg * loadMultiplier * complexityMultiplier * rushMultiplier);
  }

  async estimateTravel(fromLat, fromLng, toLat, toLng) {
    const cacheKey = \`route:\${Math.round(fromLat*1000)}:\${Math.round(fromLng*1000)}:\${Math.round(toLat*1000)}:\${Math.round(toLng*1000)}\`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Use routing service (Google Maps / OSRM) for accurate estimates
    let result;
    try {
      result = await this.routing.getRoute(fromLat, fromLng, toLat, toLng);
    } catch (err) {
      // Fallback: Haversine distance with average speed
      const distanceKm = this.haversineDistance(fromLat, fromLng, toLat, toLng);
      const avgSpeedKmH = 25; // Urban average
      result = { minutes: Math.round((distanceKm / avgSpeedKmH) * 60), distanceKm: Math.round(distanceKm * 10) / 10 };
    }
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', this.CACHE_TTL);
    return result;
  }

  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  calculateBuffer(order, baseMinutes) {
    // Add buffer based on conditions
    let buffer = baseMinutes * 0.1; // 10% base buffer
    const hour = new Date().getHours();
    if ((hour >= 17 && hour <= 19)) buffer += 3; // Rush hour
    if (order.isRaining) buffer += 5; // Weather
    return Math.round(buffer);
  }

  calculateConfidence(order) {
    let confidence = 0.85; // Base confidence
    if (order.driverAssigned) confidence += 0.05;
    if (order.restaurantConfirmed) confidence += 0.05;
    const hour = new Date().getHours();
    if (hour >= 17 && hour <= 19) confidence -= 0.1; // Less confident during rush
    return Math.min(0.95, Math.max(0.5, Math.round(confidence * 100) / 100));
  }
}

// --- REAL-TIME ORDER TRACKER ---
class OrderTracker {
  constructor(redisClient, wsServer) {
    this.redis = redisClient;
    this.ws = wsServer;
    this.subscribers = new Map(); // orderId -> Set of WebSocket connections
  }

  async subscribe(orderId, wsConnection) {
    if (!this.subscribers.has(orderId)) this.subscribers.set(orderId, new Set());
    this.subscribers.get(orderId).add(wsConnection);
    // Send current state immediately
    const state = await this.getOrderState(orderId);
    if (state) wsConnection.send(JSON.stringify({ type: 'order_state', data: state }));
    wsConnection.on('close', () => {
      const subs = this.subscribers.get(orderId);
      if (subs) { subs.delete(wsConnection); if (subs.size === 0) this.subscribers.delete(orderId); }
    });
  }

  async updateDriverLocation(orderId, driverId, lat, lng, heading, speed) {
    const locationData = { driverId, lat, lng, heading, speed, timestamp: Date.now() };
    await this.redis.set(\`tracking:\${orderId}:driver\`, JSON.stringify(locationData), 'EX', 3600);
    this.broadcast(orderId, { type: 'driver_location', data: locationData });
  }

  async updateOrderStatus(orderId, status, metadata) {
    const stateData = { orderId, status, ...metadata, updatedAt: Date.now() };
    await this.redis.set(\`tracking:\${orderId}:status\`, JSON.stringify(stateData), 'EX', 86400);
    this.broadcast(orderId, { type: 'status_update', data: stateData });
  }

  async updateETA(orderId, etaData) {
    await this.redis.set(\`tracking:\${orderId}:eta\`, JSON.stringify(etaData), 'EX', 3600);
    this.broadcast(orderId, { type: 'eta_update', data: etaData });
  }

  broadcast(orderId, message) {
    const subs = this.subscribers.get(orderId);
    if (!subs) return;
    const payload = JSON.stringify(message);
    for (const ws of subs) {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(payload);
      } else {
        subs.delete(ws);
      }
    }
  }

  async getOrderState(orderId) {
    const [status, driver, eta] = await Promise.all([
      this.redis.get(\`tracking:\${orderId}:status\`),
      this.redis.get(\`tracking:\${orderId}:driver\`),
      this.redis.get(\`tracking:\${orderId}:eta\`),
    ]);
    return {
      status: status ? JSON.parse(status) : null,
      driverLocation: driver ? JSON.parse(driver) : null,
      eta: eta ? JSON.parse(eta) : null,
    };
  }
}`,
    explanation: `SCALING ANALYSIS:

1. LOCATION INGESTION:
- 100K GPS updates/second from 500K active drivers
- Redis GEO handles this easily (GEOADD is O(log N))
- Location history streams to Kafka -> TimescaleDB for analytics
- No need to persist real-time locations to disk (Redis is sufficient)
- If Redis crashes, drivers re-send location on next 5-second tick

2. DRIVER MATCHING:
- 580 orders/second peak, each requiring GEORADIUS query
- Redis GEORADIUS on 500K entries: ~1ms per query
- Scoring 20 candidates: ~5ms (parallel Redis HGETALL + compute)
- Total matching latency: ~10ms (well under 30-second SLA)
- If first-choice driver declines, fall through to second-choice (add ~30s per decline)

3. ORDER SERVICE:
- 10M orders/day = 116/second average, 580/second peak
- PostgreSQL handles this with connection pooling (100 connections, 5 app servers)
- Order state transitions published to Kafka for downstream services
- Hot path (status updates) cached in Redis; cold path (order history) in PostgreSQL

4. ETA SERVICE:
- 50M computations/day = 580/second
- Each computation: 1 DB query (prep time) + 2 routing API calls (cached 5 min)
- Route cache hit rate ~70% for common restaurant-zone pairs
- Fallback to Haversine distance when routing service is slow

5. SURGE PRICING:
- 10K zones x update every 2 minutes = 83 updates/second (trivial)
- Per-zone data: 4 Redis keys x 8 bytes = 32B per zone = 320KB total
- Customer app fetches surge before order confirmation (1 Redis GET)

FAILURE MODES:
- Driver app loses GPS: Use last known location + heading for 30 seconds, then mark driver as "stale"
- Driver declines assignment: Offer to next-best driver. After 3 declines, increase driver incentive and expand radius.
- Restaurant goes offline: Cancel pending orders, refund customers, notify affected drivers
- ETA wildly inaccurate: Flag orders where actual - estimated > 15 minutes for model retraining
- Surge pricing malfunction: Cap at 3x, alert ops, fall back to static pricing per zone

BOTTLENECK IDENTIFICATION:
- Popular restaurants during dinner: 50+ concurrent orders -> restaurant becomes the bottleneck (kitchen capacity)
  -> Show "busy" badge, extend ETA, potentially pause new orders temporarily
- Driver shortage in specific zones: Surge pricing incentivizes drivers to move to high-demand areas
- Google Maps API rate limits: Cache aggressively; use OSRM as fallback
- WebSocket connections for tracking: 100K concurrent trackers -> 100K WebSocket connections
  -> Use WebSocket server cluster with sticky sessions, broadcast via Redis Pub/Sub

MONITORING:
- Order-to-assignment latency (target: <30 seconds)
- ETA accuracy: |actual - predicted| distribution (target: 90% within 3 minutes)
- Driver utilization: active time / online time (target: 60-70%)
- Surge multiplier distribution across zones
- Order completion rate (target: >95%)
- Driver acceptance rate per market
- Location update freshness: % of drivers with update in last 10 seconds

TRADE-OFFS:
- Pre-dispatch vs on-ready dispatch: Pre-dispatch (assign driver before food is ready) reduces total delivery time but wastes driver time if restaurant is slow. On-ready dispatch is more efficient for drivers but adds wait time. Hybrid: pre-dispatch for fast restaurants (avg prep < 15 min), on-ready for slow ones.
- Nearest driver vs best driver: Nearest minimizes pickup time but may not optimize overall system. Scoring multiple factors (distance, direction, rating, acceptance rate) produces better outcomes but is more complex and harder to explain to drivers.
- Precise ETA vs range: A precise ETA ("arrives in 23 minutes") feels more professional but is often wrong. A range ("25-35 minutes") is more accurate but feels less precise. Show a range with a point estimate: "Estimated 28 minutes (25-35)".
- Individual vs batch matching: Matching one order at a time is simpler but suboptimal. Batch matching (assign all pending orders together) optimizes globally but adds latency for individual orders. Use batch matching during peak hours, individual during off-peak.`,
    timeComplexity: `Location update: O(log N) Redis GEOADD where N is the number of active drivers. Driver matching: O(log N) for GEORADIUS + O(k log k) for scoring and sorting k candidates. Order state transition: O(1) database update + O(1) Kafka publish. ETA calculation: O(1) database query + O(1) routing API call (cached). Surge calculation: O(1) per zone (4 Redis GETs + arithmetic).`,
    spaceComplexity: `Driver locations (real-time): 500K drivers x 40B = 20MB Redis. Driver metadata: 500K x 200B = 100MB Redis. Surge zones: 10K zones x 32B = 320KB Redis. Order tracking: 100K active orders x 500B = 50MB Redis. Route cache: 100K routes x 100B = 10MB Redis. Total Redis: ~200MB. Order history: 10M/day x 2KB x 365 = 7.3TB/year PostgreSQL. Location history: 345GB/day x 30 days = 10.3TB TimescaleDB (compressed ~2TB).`,
    hints: [
      `The order state machine is the backbone of the entire system. Every other service reacts to state transitions published as events. When an order moves to RESTAURANT_CONFIRMED, the dispatch service starts searching for drivers. When it moves to PICKED_UP, the ETA service recalculates. When it moves to DELIVERED, the payment service finalizes the charge. Design the state machine first, then build everything else around it.`,
      `For driver matching, use Redis GEO commands (GEOADD, GEORADIUS) for the spatial query, then apply a multi-factor scoring function. Distance alone is insufficient - a driver 2km away but heading toward the restaurant at 30km/h will arrive faster than a driver 1km away but stuck in traffic heading the other direction. Include heading, speed, rating, and acceptance rate in the score.`,
      `Surge pricing should be zone-based using a hexagonal grid (like Uber H3). Hexagons tile the plane without gaps, each hex has 6 equidistant neighbors, and they approximate circles better than squares. Track supply (available drivers) and demand (pending orders) per zone, and compute the multiplier as the demand-to-supply ratio normalized against historical averages.`,
      `ETA prediction is a three-component model: restaurant preparation time + driver-to-restaurant travel + restaurant-to-customer travel. Each component uses different data sources. Prep time uses the restaurant historical average and current kitchen load. Travel times use a routing service with real-time traffic. Add a buffer (10% + weather + rush hour) and provide a confidence score.`,
      `Location updates should be ingested through a lightweight, high-throughput endpoint. Consider UDP for driver location updates (acceptable to lose occasional updates). Write to Redis GEO for real-time queries and Kafka for historical storage. Do NOT write every location update to PostgreSQL - use a time-series database (TimescaleDB/InfluxDB) for location history.`,
      `Handle the "no driver available" scenario gracefully. Start with a 5km radius. If no drivers found, expand to 10km, then 15km, each time increasing the driver incentive. If still no drivers after 3 minutes, notify the customer with options: wait longer, cancel for full refund, or switch to pickup. This transparent communication reduces frustration.`,
      `For real-time order tracking, use WebSockets with a fan-out pattern. The driver app sends location updates to the location service. The location service publishes to a Redis Pub/Sub channel. The tracking service subscribes and pushes updates to the customer WebSocket. This decouples the driver from the customer and allows multiple customers to track the same driver (e.g., stacked orders).`,
      `Design for driver stacking: a driver can carry 2-3 orders simultaneously from different restaurants if the routes are compatible. The matching algorithm should consider whether a driver currently carrying an order is heading toward the new order restaurant. Stacking increases driver earnings and reduces delivery costs, but must not degrade ETA accuracy for either order.`
    ],
  },
];
