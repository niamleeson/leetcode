def knapsack(items, capacity):
    dp = [0] * (capacity + 1)

    for w, v, unlimited in items:
        if unlimited:
            # Unbounded: forward
            for c in range(w, capacity + 1):
                dp[c] = max(dp[c], dp[c - w] + v)
        else:
            # 0/1: backward
            for c in range(capacity, w - 1, -1):
                dp[c] = max(dp[c], dp[c - w] + v)

    return dp[capacity]
