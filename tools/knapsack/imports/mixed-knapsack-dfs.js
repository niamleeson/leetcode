function knapsack(items, capacity) {
    function dfs(i, c) {
        if (i === items.length) return 0;

        const [w, v, unlimited] = items[i];
        const skip = dfs(i + 1, c);

        if (c < w) return skip;

        let take;
        if (unlimited) {
            // Unbounded: stay on the same item.
            take = v + dfs(i, c - w);
        } else {
            // 0/1: move to the next item.
            take = v + dfs(i + 1, c - w);
        }

        return Math.max(skip, take);
    }

    return dfs(0, capacity);
}
