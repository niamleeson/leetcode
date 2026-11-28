class Solution:
    def maximumSaleItems(self, items, budget):
        import sys

        n = len(items)
        # A path can have n + 1 calls, and n can be 1000.
        sys.setrecursionlimit(max(sys.getrecursionlimit(), n + 100))

        first_purchase_gains = [0] * n
        cheapest_price = float("inf")

        for index in range(n):
            factor, price = items[index]
            cheapest_price = min(cheapest_price, price)

            # Include the paid copy itself and every other type received as a gift.
            for other_factor, _ in items:
                if other_factor % factor == 0:
                    first_purchase_gains[index] += 1

        # -1 means uncomputed; zero is a valid cached answer.
        memo = [[-1] * (budget + 1) for _ in range(n)]

        def dfs(index, remaining):
            # All first-purchase choices are made; spend the rest on cheapest copies.
            if index == n:
                return remaining // cheapest_price

            # Reuse the answer for the same item index and remaining budget.
            if memo[index][remaining] != -1:
                return memo[index][remaining]

            price = items[index][1]
            skip = dfs(index + 1, remaining)
            best = skip

            if price <= remaining:
                # Advance the index so this type's first-purchase gain is counted once.
                take = first_purchase_gains[index] + dfs(index + 1, remaining - price)
                best = max(best, take)

            memo[index][remaining] = best
            return best

        return dfs(0, budget)
