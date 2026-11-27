function unboundedKnapsack(items, capacity) {
  const dp = Array(capacity + 1).fill(0);

  for (const { weight, value } of items) {
    // Move forward so this item can be used again.
    for (let current = weight; current <= capacity; current++) {
      const skip = dp[current];
      const take = dp[current - weight] + value;
      dp[current] = Math.max(skip, take);
    }
  }

  return dp[capacity];
}
