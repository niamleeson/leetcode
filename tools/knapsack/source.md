# Knapsack: DFS and Bottom-Up DP

All three problems maximize total value without exceeding a capacity. Assume positive integer item weights and a nonnegative integer capacity.

- `dfs(i, c)`: maximum value obtainable using items from index `i` onward with remaining capacity `c`.
- `dp[c]`: maximum value obtainable within capacity `c` using the items processed so far.

## 1. 0/1 Knapsack

**Problem:** Given items with weights and values, return the maximum total value without exceeding the bag's capacity. Each item can be selected at most once.

### Example

```javascript
const items = [[2, 3], [3, 4]]; // [weight, value]
const capacity = 8;
// Output: 7 (take both items)
```

### DFS (recursive)

```javascript
function knapsack(items, capacity) {
    function dfs(i, c) {
        if (i === items.length) return 0;

        const [w, v] = items[i];
        const skip = dfs(i + 1, c);

        if (c < w) return skip;

        const take = v + dfs(i + 1, c - w);

        return Math.max(skip, take);
    }

    return dfs(0, capacity);
}
```

**Logic:** Skip the current item or take it and move to the next item. Both choices advance the item index, preventing reuse.

### Bottom-up DP

```javascript
function knapsack(items, capacity) {
    const dp = Array(capacity + 1).fill(0);

    for (const [w, v] of items) {
        for (let c = capacity; c >= w; c--) {
            dp[c] = Math.max(dp[c], dp[c - w] + v);
        }
    }

    return dp[capacity];
}
```

**Logic:** For each item, traverse capacities backward. Compare skipping the item with taking it and adding its value to the best solution for the remaining capacity. Backward traversal ensures the smaller capacity has not yet been updated by the current item.

## 2. Unbounded Knapsack

**Problem:** Given items with weights and values, return the maximum total value without exceeding the bag's capacity. Each item can be selected an unlimited number of times.

### Example

```javascript
const items = [[2, 3], [3, 4]];
const capacity = 8;
// Output: 12 (take the first item four times)
```

### DFS (recursive)

```javascript
function knapsack(items, capacity) {
    function dfs(i, c) {
        if (i === items.length) return 0;

        const [w, v] = items[i];
        const skip = dfs(i + 1, c);

        if (c < w) return skip;

        const take = v + dfs(i, c - w);

        return Math.max(skip, take);
    }

    return dfs(0, capacity);
}
```

**Logic:** Skip the current item and move to the next item, or take it and stay at the same index. Staying allows the same item to be selected again.

### Bottom-up DP

```javascript
function knapsack(items, capacity) {
    const dp = Array(capacity + 1).fill(0);

    for (const [w, v] of items) {
        for (let c = w; c <= capacity; c++) {
            dp[c] = Math.max(dp[c], dp[c - w] + v);
        }
    }

    return dp[capacity];
}
```

**Logic:** For each item, traverse capacities forward. The smaller capacity may already contain the current item, allowing another copy to be added.

## 3. Mixed Knapsack

**Problem:** Given items with weights, values, and a flag indicating whether an item is reusable, return the maximum total value without exceeding the bag's capacity. Some items can be selected at most once; others can be selected unlimited times.

### Example

```javascript
// [weight, value, unlimited]
const items = [[2, 3, false], [3, 4, true]];
const capacity = 8;
// Output: 11 (take the first item once and the second twice)
```

### DFS (recursive)

```javascript
function knapsack(items, capacity) {
    function dfs(i, c) {
        if (i === items.length) return 0;

        const [w, v, unlimited] = items[i];
        const skip = dfs(i + 1, c);

        if (c < w) return skip;

        const next = unlimited ? i : i + 1;
        const take = v + dfs(next, c - w);

        return Math.max(skip, take);
    }

    return dfs(0, capacity);
}
```

**Logic:** If taking a reusable item, stay at its index. Otherwise, move to the next item. Skipping always moves to the next item.

### Bottom-up DP

```javascript
function knapsack(items, capacity) {
    const dp = Array(capacity + 1).fill(0);

    for (const [w, v, unlimited] of items) {
        if (unlimited) {
            // Unbounded: forward
            for (let c = w; c <= capacity; c++) {
                dp[c] = Math.max(dp[c], dp[c - w] + v);
            }
        } else {
            // 0/1: backward
            for (let c = capacity; c >= w; c--) {
                dp[c] = Math.max(dp[c], dp[c - w] + v);
            }
        }
    }

    return dp[capacity];
}
```

**Logic:** Choose the capacity traversal direction for each item depending on whether it is reusable.

## Quick Reference

| | 0/1 Knapsack | Unbounded Knapsack | Mixed Knapsack |
|---|---|---|---|
| Item reuse | At most once | Unlimited | Depends on item |
| DFS skip | `dfs(i + 1, c)` | `dfs(i + 1, c)` | `dfs(i + 1, c)` |
| DFS take | `v + dfs(i + 1, c - w)` | `v + dfs(i, c - w)` | `v + dfs(unlimited ? i : i + 1, c - w)` |
| DP direction per item | Backward | Forward | Depends on item |
| DP loop | `c = capacity; c >= w; c--` | `c = w; c <= capacity; c++` | Choose either loop |
| Bottom-up time | O(nC) | O(nC) | O(nC) |
| Bottom-up space | O(C) | O(C) | O(C) |

Here, `n` is the number of items and `C` is the capacity.

The common DFS transition is:

```javascript
return Math.max(skip, take);
```

The common bottom-up DP transition is:

```javascript
dp[c] = Math.max(dp[c], dp[c - w] + v);
```

The DFS versions above are intentionally plain recursion to make the decisions easy to understand. They repeat subproblems and can take exponential time. Memoizing results by `(i, c)` converts each to top-down DP with O(nC) time and O(nC) total space for positive integer weights and nonzero capacity (more precisely, O(n(C + 1))).

**Remember:** DFS controls item reuse through the item index. In-place bottom-up DP controls item reuse through the capacity iteration direction. Backward prevents reuse; forward allows reuse.
