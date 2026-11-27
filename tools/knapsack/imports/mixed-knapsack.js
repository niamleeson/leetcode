function mixedKnapsack(items, capacity) {
  const dp = Array(capacity + 1).fill(0);

  for (const item of items) {
    const { weight, value, kind } = item;

    if (kind === "once") {
      // Move backward: this item is available only once.
      for (let current = capacity; current >= weight; current--) {
        const skip = dp[current];
        const take = dp[current - weight] + value;
        dp[current] = Math.max(skip, take);
      }
    } else if (kind === "unlimited") {
      // Move forward: the smaller capacity may already use this item.
      for (let current = weight; current <= capacity; current++) {
        const skip = dp[current];
        const take = dp[current - weight] + value;
        dp[current] = Math.max(skip, take);
      }
    } else {
      // Read from a snapshot so this type cannot exceed its copy limit.
      const previous = dp.slice();

      for (let current = 0; current <= capacity; current++) {
        const maxCopies = Math.min(item.limit, Math.floor(current / weight));

        // dp[current] already represents taking zero copies of this type.
        for (let count = 1; count <= maxCopies; count++) {
          const remaining = current - count * weight;
          const candidate = previous[remaining] + count * value;
          dp[current] = Math.max(dp[current], candidate);
        }
      }
    }
  }

  return dp[capacity];
}
