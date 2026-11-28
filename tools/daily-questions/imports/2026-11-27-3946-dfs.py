class Solution:
    def maximumSaleItems(self, items, budget):
        import sys

        n = len(items)
        # A path can have n + 1 calls, and n can be 1000.
        sys.setrecursionlimit(max(sys.getrecursionlimit(), n + 100))

        gain = [0] * n
        min_price = float("inf")

        for i in range(n):
            factor, price = items[i]
            min_price = min(min_price, price)

            # Include the paid copy itself and every other type received as a gift.
            for other, _ in items:
                if other % factor == 0:
                    gain[i] += 1

        # -1 means uncomputed; zero is a valid cached answer.
        memo = [[-1] * (budget + 1) for _ in range(n)]

        def dfs(i, rem):
            # All first-purchase choices are made; spend the rest on cheapest copies.
            if i == n:
                return rem // min_price

            # Reuse the answer for the same item index and remaining budget.
            if memo[i][rem] != -1:
                return memo[i][rem]

            price = items[i][1]
            skip = dfs(i + 1, rem)
            best = skip

            if price <= rem:
                # Advance the index so this type's first-purchase gain is counted once.
                take = gain[i] + dfs(i + 1, rem - price)
                best = max(best, take)

            memo[i][rem] = best
            return best

        return dfs(0, budget)
