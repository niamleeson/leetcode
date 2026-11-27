function zeroOneKnapsack(items, capacity) {
  const dp = Array(capacity + 1).fill(0);

  for (const { weight, value } of items) {
    // Move backward so this item is used at most once.
    for (let current = capacity; current >= weight; current--) {
      const skip = dp[current];
      const take = dp[current - weight] + value;
      dp[current] = Math.max(skip, take);
    }
  }

  return dp[capacity];
}
