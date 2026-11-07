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


def daily_temperatures(temperatures):
    # Exhaustively search each suffix rather than sharing the stack algorithm.
    return [next((later - day for later in range(day + 1, len(temperatures))
                  if temperatures[later] > temperature), 0)
            for day, temperature in enumerate(temperatures)]


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
    for temperatures, name in [([70, 70, 71], 'Equal temperatures are not warmer'),
                               ([75, 74, 73], 'No future warmer day keeps zero'),
                               ([70], 'The last day has no future day'),
                               ([75, 70, 65, 80], 'One warmer day resolves several pending indices')]:
        add(739, name, [temperatures], daily_temperatures(temperatures))
    # Structural edge cases have directly inspectable expected results. Empty
    # inputs are included only where the problem's node-count constraints allow.
    add(100, 'Matching values in different branches are different trees',
        [{'$tree': [1, 2]}, {'$tree': [1, None, 2]}], False)
    add(100, 'One tree is empty and the other has a root', [{'$tree': []}, {'$tree': [1]}], False)
    add(110, 'Propagate an imbalance from the left subtree', [{'$tree': [1, 2, None, 3, None, 4]}], False)
    add(110, 'Propagate an imbalance from the right subtree', [{'$tree': [1, None, 2, None, 3, None, 4]}], False)
    add(138, 'Copying an empty random-pointer list returns an empty list', [{'$randomList': []}], [])
    add(143, 'A singleton list stays unchanged', [{'$list': [1]}], [1])
    for problem_id in [144, 145]:
        add(problem_id, 'An empty tree has no traversal values', [{'$tree': []}], [])
    add(450, 'Deleting from an empty tree stays empty', [{'$tree': []}, 0], [])
    add(450, 'Replace a deleted root by its only left child', [{'$tree': [2, 1]}, 2], [1])
    add(450, 'Replace a deleted root by its only right child', [{'$tree': [1, None, 2]}, 1], [2])
    add(450, 'Delete a node in the right subtree', [{'$tree': [2, 1, 3]}, 3], [2, 1])
    add(450, 'An absent key preserves the tree', [{'$tree': [2, 1, 3]}, 4], [2, 1, 3])
    add(98, 'A valid search tree must be accepted', [{'$tree': [2, 1, 3]}], True)
    add(41, 'All positives from one through the length are present', [[1, 2, 3]], 4)
    add(680, 'An existing palindrome needs no deletion', ['racecar'], True)
    # Additional valid-input branches needed for the complete guided flow.
    # Every input below was checked against the local official catalog bounds.
    add(567, 'A longer pattern cannot fit into a shorter text', ['abc', 'ab'], False)
    mountain = [1, 3, 5, 4, 2]
    add(1095, 'The target appears only on the descending mountain side',
        [4, {'$mountain': mountain}], search(mountain, 4))
    add(622, 'Removing from an empty queue must not corrupt later operations', [1],
        [None, False, True, 7, True, False, -1])
    added[622][-1]['operations'] = [['deQueue', []], ['enQueue', [7]], ['Rear', []],
                                  ['deQueue', []], ['deQueue', []], ['Front', []]]
    uniform = [[0] * 4 for _ in range(4)]
    # The quad adapter decodes the constructed tree back to its original grid.
    add(427, 'A uniform nontrivial zero grid can collapse into one leaf', [uniform], uniform)
    # Five total units cannot form four equal integer sides; a length-five
    # stick also cannot fit a side of length two in a perimeter of eight.
    add(473, 'The perimeter is not divisible into four equal sides', [[1, 1, 1, 2]], False)
    add(473, 'One matchstick is longer than the required side', [[5, 1, 1, 1]], False)
    # A sum of 20 implies four buckets of 5, but the 4 has no 1 to pair with.
    # This is a real search failure despite no value exceeding the target.
    add(698, 'Divisibility does not guarantee an equal-sum partition', [[2, 2, 2, 2, 3, 4, 5], 4], False)
    add(698, 'A number cannot exceed its required subset sum', [[5, 1, 1, 1], 4], False)
    add(208, 'Missing first and later prefix characters must both be rejected', [],
        [None, None, False, False, False, True])
    added[208][-1]['operations'] = [['insert', ['apple']], ['startsWith', ['bat']],
                                  ['startsWith', ['apx']], ['search', ['app']], ['startsWith', ['app']]]
    add(997, 'No person is trusted by everyone else without trusting anyone',
        [3, [[1, 2], [2, 3]]], -1)
    add(953, 'A first differing character can violate the alphabet order',
        [['hello', 'apple'], 'abcdefghijklmnopqrstuvwxyz'], False)
    add(994, 'A grid with no fresh oranges needs zero minutes', [[[0, 2], [2, 0]]], 0)
    # These are all eight one-move neighbors of 0000; the target itself is not
    # a deadend, but every path out of the start is blocked.
    blocked_neighbors = ['1000', '9000', '0100', '0900', '0010', '0090', '0001', '0009']
    add(752, 'An unblocked start can still be isolated from the target', [blocked_neighbors, '8888'], -1)
    add(399, 'Known variables in disconnected components have no ratio',
        [[['a', 'b'], ['c', 'd']], [2.0, 3.0], [['a', 'c'], ['b', 'd']]], [-1.0, -1.0])
    add(127, 'The ending word must belong to the dictionary',
        ['hit', 'cog', ['hot', 'dot', 'dog']], 0)
    add(127, 'A present ending word can still be unreachable',
        ['hit', 'cog', ['hot', 'cog']], 0)
    add(1137, 'The third base value is one', [2], 1)
    # Taking the first three stones yields 6 against 6. Taking fewer lets the
    # opponent score more, so optimal play ties.
    add(1406, 'Optimal play can finish with equal scores', [[1, 2, 3, 6]], 'Tie')
    add(97, 'The target length must equal both source lengths combined', ['a', 'b', 'aba'], False)
    add(860, 'The first customer cannot receive change before any five is collected', [[10]], False)
    negatives = [-3, -2, -5]
    circular_best = max(sum(negatives[(start + offset) % len(negatives)] for offset in range(length))
                        for start in range(len(negatives)) for length in range(1, len(negatives) + 1))
    add(918, 'An all-negative circular array still requires a nonempty subarray', [negatives], circular_best)
    add(978, 'A singleton is a turbulent subarray of length one', [[7]], 1)
    add(1871, 'A blocked final position cannot be reached', ['01', 1, 1], False)
    add(678, 'An early closing parenthesis cannot be repaired by later characters', [')('], parentheses(')('))
    # The smallest card 1 requires 2 and 3; no 3 exists, even though six cards
    # can be split into two groups of three by size alone.
    add(846, 'A divisible hand can still be missing a required consecutive card', [[1, 2, 4, 5, 6, 7], 3], False)
    for number in [1534236469, -1563847412]:
        reversed_value = int(str(abs(number))[::-1]) * (-1 if number < 0 else 1)
        expected = reversed_value if -(2 ** 31) <= reversed_value <= 2 ** 31 - 1 else 0
        add(7, 'A reversed integer outside the signed 32-bit range returns zero', [number], expected)
    add(572, 'Searching past a nonmatching leaf does not find a subtree',
        [{'$tree': [1]}, {'$tree': [2]}], False)
    add(460, 'Updating an existing cache key must preserve other entries', [2],
        [None, None, None, None, 2, 10])
    added[460][-1]['operations'] = [['put', [1, 1]], ['put', [2, 2]],
                                  ['put', [1, 10]], ['get', [2]], ['get', [1]]]
    deeper_heap = [9, 1, 8, 2, 7, 3, 6, 4, 5]
    add(912, 'Heap repair may need to descend more than one level', [deeper_heap], sorted(deeper_heap))
    add(200, 'An island can extend left from a lower row',
        [[list('001'), list('111')]], 1)
    border_connected = [list('XXXOX'), list('XOOOX'), list('XXXXX'), list('XXXXX'), list('XXXXX')]
    add(130, 'Border-connected cells remain safe when a path turns left',
        [border_connected], border_connected)
    add(230, 'Later inorder ranks require traversing a right subtree',
        [{'$tree': [2, 1, 3]}, 3], 3)
    add(295, 'Four increasing values require rebalancing both heap directions', [],
        [None, None, None, None, None, 2.5])
    added[295][-1]['operations'] = [['addNum', [1]], ['addNum', [2]], ['addNum', [3]],
                                  ['addNum', [4]], ['findMedian', []]]
    add(572, 'Matching root values do not erase a missing child',
        [{'$tree': [1]}, {'$tree': [1, 2]}], False)
    add(355, 'Another user appears in the feed only while followed', [],
        [None, None, [], None, [20], None, []])
    added[355][-1]['operations'] = [['postTweet', [2, 20]], ['getNewsFeed', [1]],
                                  ['follow', [1, 2]], ['getNewsFeed', [1]],
                                  ['unfollow', [1, 2]], ['getNewsFeed', [1]]]
    add(47, 'Repeated values need not be adjacent in the input', [[1, 2, 1]],
        [[1, 1, 2], [1, 2, 1], [2, 1, 1]])
    for distances, count in [([7, 9, 8, 11, 2, 3, 6, 5, 4, 12, 10, 1], 5),
                             ([1, 2, 7, 12, 8, 6, 9, 5, 14, 10, 15, 3, 13, 11, 4], 6)]:
        points = [[distance, 0] for distance in distances]
        nearest = sorted(points, key=lambda point: point[0] ** 2 + point[1] ** 2)[:count]
        add(973, 'Extracting nearest points requires multilevel heap repair', [points, count], nearest)
    add(127, 'A one-letter transformation needs no intermediate word',
        ['hit', 'cit', ['cit']], 2)
    return added
