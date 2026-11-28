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
