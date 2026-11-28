def knapsack(items, capacity):
    def dfs(i, c):
        if i == len(items):
            return 0

        w, v, unlimited = items[i]
        skip = dfs(i + 1, c)

        if c < w:
            return skip

        if unlimited:
            # Unbounded: stay on the same item.
            take = v + dfs(i, c - w)
        else:
            # 0/1: move to the next item.
            take = v + dfs(i + 1, c - w)

        return max(skip, take)

    return dfs(0, capacity)
