def zero_one_knapsack_dfs(items, capacity):
    memo = {}

    def dfs(index, remaining):
        # No items remain to choose from.
        if index == len(items):
            return 0

        key = (index, remaining)
        if key in memo:
            return memo[key]

        item = items[index]
        weight = item["weight"]
        value = item["value"]
        skip = dfs(index + 1, remaining)
        best = skip

        if weight <= remaining:
            # Move to the next item so this one cannot be taken twice.
            take = value + dfs(index + 1, remaining - weight)
            best = max(best, take)

        memo[key] = best
        return best

    return dfs(0, capacity)
