def knapsack(items, capacity):
    def dfs(i, c):
        if i == len(items):
            return 0

        w, v = items[i]
        skip = dfs(i + 1, c)

        if c < w:
            return skip

        take = v + dfs(i + 1, c - w)

        return max(skip, take)

    return dfs(0, capacity)
