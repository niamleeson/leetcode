function knapsack(items, capacity) {
    function dfs(i, c) {
        if (i === items.length) return 0;

        const [w, v] = items[i];
        const skip = dfs(i + 1, c);

        if (c < w) return skip;

        const take = v + dfs(i, c - w);

        return Math.max(skip, take);
    }

    return dfs(0, capacity);
}
