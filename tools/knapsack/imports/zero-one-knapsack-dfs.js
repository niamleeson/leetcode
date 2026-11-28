function zeroOneKnapsackDfs(items, capacity) {
  const memo = new Map();

  function dfs(index, remaining) {
    // No items remain to choose from.
    if (index === items.length) return 0;

    const key = `${index},${remaining}`;
    if (memo.has(key)) return memo.get(key);

    const { weight, value } = items[index];
    const skip = dfs(index + 1, remaining);
    let best = skip;

    if (weight <= remaining) {
      // Move to the next item so this one cannot be taken twice.
      const take = value + dfs(index + 1, remaining - weight);
      best = Math.max(best, take);
    }

    memo.set(key, best);
    return best;
  }

  return dfs(0, capacity);
}
