function unboundedKnapsackDfs(items, capacity) {
  const memo = new Map();

  function dfs(index, remaining) {
    // No item types remain to choose from.
    if (index === items.length) return 0;

    const key = `${index},${remaining}`;
    if (memo.has(key)) return memo.get(key);

    const { weight, value } = items[index];
    const maxCopies = Math.floor(remaining / weight);
    let best = 0;

    // Choose this type's complete copy count, then move to the next type.
    for (let count = 0; count <= maxCopies; count++) {
      const candidate = count * value + dfs(index + 1, remaining - count * weight);
      best = Math.max(best, candidate);
    }

    memo.set(key, best);
    return best;
  }

  return dfs(0, capacity);
}
