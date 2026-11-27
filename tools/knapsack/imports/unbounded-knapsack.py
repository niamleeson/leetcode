def unbounded_knapsack(items, capacity):
    dp = [0] * (capacity + 1)

    for item in items:
        weight = item["weight"]
        value = item["value"]
        # Move forward so this item can be used again.
        for current in range(weight, capacity + 1):
            skip = dp[current]
            take = dp[current - weight] + value
            dp[current] = max(skip, take)

    return dp[capacity]
