def mixed_knapsack_dfs(items, capacity):
    memo = {}

    def dfs(index, remaining):
        # No item types remain, so no more value can be added.
        if index == len(items):
            return 0

        key = (index, remaining)
        if key in memo:
            return memo[key]

        item = items[index]
        weight = item["weight"]
        value = item["value"]
        kind = item["kind"]
        max_copies = remaining // weight

        if kind == "once":
            max_copies = min(1, max_copies)
        elif kind == "bounded":
            max_copies = min(item["limit"], max_copies)
        # For an unlimited type, only the remaining capacity limits copies.

        best = 0
        for count in range(max_copies + 1):
            next_remaining = remaining - count * weight
            candidate = count * value + dfs(index + 1, next_remaining)
            best = max(best, candidate)

        memo[key] = best
        return best

    return dfs(0, capacity)
