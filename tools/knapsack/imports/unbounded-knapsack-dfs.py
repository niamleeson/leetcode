def unbounded_knapsack_dfs(items, capacity):
    memo = {}

    def dfs(index, remaining):
        # No item types remain to choose from.
        if index == len(items):
            return 0

        key = (index, remaining)
        if key in memo:
            return memo[key]

        item = items[index]
        weight = item["weight"]
        value = item["value"]
        max_copies = remaining // weight
        best = 0

        # Choose this type's complete copy count, then move to the next type.
        for count in range(max_copies + 1):
            candidate = count * value + dfs(index + 1, remaining - count * weight)
            best = max(best, candidate)

        memo[key] = best
        return best

    return dfs(0, capacity)
