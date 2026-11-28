function maximumSaleItems(items, budget) {
  const n = items.length;
  const firstPurchaseGains = Array(n).fill(0);
  let cheapestPrice = Infinity;

  for (let index = 0; index < n; index++) {
    const [factor, price] = items[index];
    cheapestPrice = Math.min(cheapestPrice, price);

    // Include the paid copy itself and every other type received as a gift.
    for (const [otherFactor] of items) {
      if (otherFactor % factor === 0) {
        firstPurchaseGains[index]++;
      }
    }
  }

  // -1 means uncomputed; zero is a valid cached answer.
  const memo = Array.from({ length: n }, () => Array(budget + 1).fill(-1));

  function dfs(index, remaining) {
    // All first-purchase choices are made; spend the rest on cheapest copies.
    if (index === n) return Math.floor(remaining / cheapestPrice);

    // Reuse the answer for the same item index and remaining budget.
    if (memo[index][remaining] !== -1) return memo[index][remaining];

    const price = items[index][1];
    const skip = dfs(index + 1, remaining);
    let best = skip;

    if (price <= remaining) {
      // Advance the index so this type's first-purchase gain is counted once.
      const take = firstPurchaseGains[index] + dfs(index + 1, remaining - price);
      best = Math.max(best, take);
    }

    memo[index][remaining] = best;
    return best;
  }

  return dfs(0, budget);
}
