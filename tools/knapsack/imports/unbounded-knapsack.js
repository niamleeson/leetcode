function knapsack(items, capacity) {
    const dp = Array(capacity + 1).fill(0);

    for (const [w, v] of items) {
        for (let c = w; c <= capacity; c++) {
            dp[c] = Math.max(dp[c], dp[c - w] + v);
        }
    }

    return dp[capacity];
}
