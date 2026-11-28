function maximumSaleItems(items, budget) {
  const n = items.length;
  const gain = Array(n).fill(0);
  let minPrice = Infinity;

  for (let i = 0; i < n; i++) {
    const [factor, price] = items[i];
    minPrice = Math.min(minPrice, price);

    // Include the paid copy itself and every other type received as a gift.
    for (const [other] of items) {
      if (other % factor === 0) {
        gain[i]++;
      }
    }
  }

  // -1 means uncomputed; zero is a valid cached answer.
  const memo = Array.from({ length: n }, () => Array(budget + 1).fill(-1));

  function dfs(i, rem) {
    // All first-purchase choices are made; spend the rest on cheapest copies.
    if (i === n) return Math.floor(rem / minPrice);

    // Reuse the answer for the same item index and remaining budget.
    if (memo[i][rem] !== -1) return memo[i][rem];

    const price = items[i][1];
    const skip = dfs(i + 1, rem);
    let best = skip;

    if (price <= rem) {
      // Advance the index so this type's first-purchase gain is counted once.
      const take = gain[i] + dfs(i + 1, rem - price);
      best = Math.max(best, take);
    }

    memo[i][rem] = best;
    return best;
  }

  return dfs(0, budget);
}
