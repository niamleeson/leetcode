"""Small, independently solved counterexamples for common beginner mistakes.

Expected values come from deliberately simple exhaustive oracles, never from
the app's reference implementation. These remain practice cases, not a claim
to reproduce LeetCode's hidden judge.
"""
from collections import Counter
from itertools import combinations


def two_sum(nums, target, offset=0):
    pairs = [(a, b) for a, b in combinations(range(len(nums)), 2) if nums[a] + nums[b] == target]
    assert len(pairs) == 1, 'Two Sum practice inputs must have one valid pair'
    return [index + offset for index in pairs[0]]


def duplicate(nums):
    return any(nums[a] == nums[b] for a, b in combinations(range(len(nums)), 2))


def anagram(left, right):
    # Sort the entire inputs, independently of a frequency-map implementation.
    return sorted(left) == sorted(right)


def search(nums, target):
    return next((index for index, value in enumerate(nums) if value == target), -1)


def stock(prices):
    return max([0] + [prices[sell] - prices[buy] for buy, sell in combinations(range(len(prices)), 2)])


def prefix(words):
    return max((words[0][:length] for length in range(len(words[0]) + 1)
                if all(word.startswith(words[0][:length]) for word in words)), key=len)


def parentheses(text):
    # Repeated pair deletion is a different model from the usual stack solution.
    while True:
        reduced = text.replace('()', '').replace('[]', '').replace('{}', '')
        if reduced == text:
            return not reduced
        text = reduced


def product_except_self(nums):
    result = []
    for omitted in range(len(nums)):
        product = 1
        for index, value in enumerate(nums):
            if index != omitted:
                product *= value
        result.append(product)
    return result


def max_subarray(nums):
    return max(sum(nums[left:right]) for left in range(len(nums)) for right in range(left + 1, len(nums) + 1))


def stairs(n):
    if n == 0:
        return 1
    return sum(stairs(n - step) for step in (1, 2) if step <= n)


def robber(nums):
    best = 0
    for mask in range(1 << len(nums)):
        if mask & (mask << 1):
            continue
        best = max(best, sum(value for index, value in enumerate(nums) if mask & (1 << index)))
    return best


def jump(nums):
    reachable = {0}
    for index in range(len(nums)):
        if index in reachable:
            reachable.update(range(index + 1, min(len(nums), index + nums[index] + 1)))
    return len(nums) - 1 in reachable


def cases():
    added = {}

    def add(id, name, args, expected):
        added.setdefault(id, []).append({'name': name, 'args': args, 'expected': expected})

    for nums, target, name in [([0, 4, 3, 0], 0, 'Two different zero indices'),
                                ([-3, 4, 3, 90], 0, 'Negative complement'),
                                ([2, 5, 5, 11], 10, 'Equal values at distinct indices'),
                                ([3, 2, 4], 6, 'Do not reuse the current index'),
                                ([7, 2, 9, 13], 20, 'Pair spans the array')]:
        add(1, name, [nums, target], two_sum(nums, target))
    for nums, name in [([1], 'Singleton has no duplicate'), ([0, 0], 'Duplicate zero'),
                       ([-2, 1, -2], 'Nonadjacent negative duplicate'),
                       ([5, 4, 3, 2, 1], 'Descending unique values'), ([1, 1, 2, 3], 'Duplicate at the beginning')]:
        add(217, name, [nums], duplicate(nums))
    for left, right, name in [('aacc', 'ccac', 'Same letters with different counts'),
                              ('ab', 'a', 'Different lengths'), ('a', 'a', 'Single matching character'),
                              ('ab', 'ba', 'Different order'), ('aab', 'abb', 'Repeated-character imbalance')]:
        add(242, name, [left, right], anagram(left, right))
    for nums, target, name in [([-1], -1, 'Singleton present'), ([-1], 0, 'Singleton absent'),
                              ([1, 3], 3, 'Right endpoint'), ([1, 3], 1, 'Left endpoint'),
                              ([1, 3], 2, 'Missing between two values'),
                              ([-10, -3, 0, 5, 9], -10, 'First of an odd-length array'),
                              ([-10, -3, 0, 5, 9], 9, 'Last of an odd-length array')]:
        add(704, name, [nums, target], search(nums, target))
    for prices, name in [([2, 4, 1], 'Sell must follow buy'), ([3, 2, 6, 5, 0, 3], 'Only one transaction'),
                         ([1], 'No selling day'), ([2, 1, 2, 0, 1], 'Two tempting small trades'),
                         ([1, 2, 3, 4], 'Monotone increase'), ([3, 3, 3], 'Equal prices'),
                         ([6, 1, 3, 2, 4, 7], 'Best pair spans local dips')]:
        add(121, name, [prices], stock(prices))
    for nums in [[1], [1, 2, 1], [2, 2], [1000, 1]]:
        add(1929, 'Concatenation shape and repeated values', [nums], [nums[i % len(nums)] for i in range(2 * len(nums))])
    for words in [['a'], ['ab', 'a'], ['', 'x'], ['car', 'cat', 'cab'], ['interview', 'internet', 'internal']]:
        add(14, 'Prefix ends at a mismatch or a shorter word', [words], prefix(words))
    for value in [' ', '0P', 'a.', '.,', 'race a car']:
        cleaned = ''.join(character.lower() for character in value if character.isalnum())
        add(125, 'Ignore punctuation but keep letters and digits', [value], cleaned == cleaned[::-1])
    for value in ['()', '([)]', ']', '((', '{}[]()', '{[]}']:
        add(20, 'Bracket order and incomplete pairs', [value], parentheses(value))
    for nums in [[0, 1, 2, 3], [0, 0, 2], [-1, 1, 0, -3, 3], [2, 3]]:
        add(238, 'Zero counts, signs, and excluded index', [nums], product_except_self(nums))
    for nums in [[-3, -2, -5], [1], [0, 0], [5, -2, 3], [2, -5, 4, -1, 2]]:
        add(53, 'Nonempty subarray and negative values', [nums], max_subarray(nums))
    for n in [1, 2, 3, 5, 8]:
        add(70, 'Count distinct step sequences', [n], stairs(n))
    for nums in [[2, 1, 1, 2], [2, 7, 9, 3, 1], [5], [0, 0], [4, 1, 2, 7, 5, 3, 1]]:
        add(198, 'Adjacent houses cannot both be selected', [nums], robber(nums))
    for nums in [[-4, 2, 2], [1], [0, 1, 0]]:
        unique = [value for value, count in Counter(nums).items() if count == 1]
        assert len(unique) == 1
        add(136, 'Single value with signed and zero values', [nums], unique[0])
    for nums in [[0], [1], [3, 0, 1], [0, 1, 2, 3]]:
        missing = [number for number in range(len(nums) + 1) if number not in nums]
        assert len(missing) == 1
        add(268, 'Missing value may be an endpoint', [nums], missing[0])
    for nums, target in [([1, 3, 5, 6], 0), ([1, 3, 5, 6], 7), ([1, 3, 5, 6], 2),
                         ([1, 3, 5, 6], 5), ([1], 0), ([1], 2)]:
        add(35, 'Insertion can be before, inside, or after the array', [nums, target], sum(value < target for value in nums))
    for nums in [[3, 2, 1, 0, 4], [0], [2, 0, 0], [1, 0, 1], [2, 1, 0, 1]]:
        add(55, 'Reachability across a zero barrier', [nums], jump(nums))
    for nums, target in [([2, 7, 11, 15], 9), ([-1, 0], -1), ([1, 1], 2), ([1, 2, 3, 4], 6)]:
        add(167, 'One-based distinct indices in a sorted array', [nums, target], two_sum(nums, target, offset=1))
    return added
