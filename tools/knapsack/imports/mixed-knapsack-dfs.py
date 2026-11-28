def knapsack(items, capacity):
    def dfs(i, c):
        if i == len(items):
            return 0

        w, v, unlimited = items[i]
        skip = dfs(i + 1, c)

        if c < w:
            return skip

        next = i if unlimited else i + 1
        take = v + dfs(next, c - w)

        return max(skip, take)

    return dfs(0, capacity)
