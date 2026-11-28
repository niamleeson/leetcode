function mixedKnapsackDfs(items, capacity) {
  const memo = new Map();

  function dfs(index, remaining) {
    // No item types remain, so no more value can be added.
    if (index === items.length) return 0;

    const key = `${index},${remaining}`;
    if (memo.has(key)) return memo.get(key);

    const item = items[index];
    const { weight, value, kind } = item;
    let maxCopies = Math.floor(remaining / weight);

    if (kind === "once") {
      maxCopies = Math.min(1, maxCopies);
    } else if (kind === "bounded") {
      maxCopies = Math.min(item.limit, maxCopies);
    }
    // For an unlimited type, only the remaining capacity limits copies.

    let best = 0;
    for (let count = 0; count <= maxCopies; count++) {
      const nextRemaining = remaining - count * weight;
      const candidate = count * value + dfs(index + 1, nextRemaining);
      best = Math.max(best, candidate);
    }

    memo.set(key, best);
    return best;
  }

  return dfs(0, capacity);
}
