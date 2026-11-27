def zero_one_knapsack(items, capacity):
    dp = [0] * (capacity + 1)

    for item in items:
        weight = item["weight"]
        value = item["value"]
        # Move backward so this item is used at most once.
        for current in range(capacity, weight - 1, -1):
            skip = dp[current]
            take = dp[current - weight] + value
            dp[current] = max(skip, take)

    return dp[capacity]
