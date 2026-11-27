def mixed_knapsack(items, capacity):
    dp = [0] * (capacity + 1)

    for item in items:
        weight = item["weight"]
        value = item["value"]
        kind = item["kind"]

        if kind == "once":
            # Move backward: this item is available only once.
            for current in range(capacity, weight - 1, -1):
                skip = dp[current]
                take = dp[current - weight] + value
                dp[current] = max(skip, take)
        elif kind == "unlimited":
            # Move forward: the smaller capacity may already use this item.
            for current in range(weight, capacity + 1):
                skip = dp[current]
                take = dp[current - weight] + value
                dp[current] = max(skip, take)
        else:
            # Read from a snapshot so this type cannot exceed its copy limit.
            previous = dp[:]

            for current in range(capacity + 1):
                max_copies = min(item["limit"], current // weight)

                # dp[current] already represents taking zero copies of this type.
                for count in range(1, max_copies + 1):
                    remaining = current - count * weight
                    candidate = previous[remaining] + count * value
                    dp[current] = max(dp[current], candidate)

    return dp[capacity]
