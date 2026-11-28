const a=3041,e="2026-11-20",n={kind:"different-approach",summary:"Your solution avoids sorting by scanning consecutive value groups; the existing Python solution sorts first.",details:["Both keep the longest consecutive chain ending at each value and consider keeping x or increasing it to x + 1.","Your frequency map records real copies, vals contains x and x + 1, and each consecutive group starts only where the previous possible value is absent. Every actual copy is processed once.","Your update reads both previous DP states before writing either result. The existing Python writes dp[num + 1] before dp[num] to avoid reusing the same element.","Your expected time is O(n) with O(n) extra space. The existing Python uses sorted(nums), so its time is O(n log n) and its extra space is O(n). No JavaScript or TypeScript implementation was saved."]},t=[{title:"Frequency groups and dynamic programming",code:`var maxSelectedElements = function(nums) {
    const freq = new Map();
    const vals = new Set();
    const dp = new Map();
    let best = 0;

    for (const x of nums) {
        freq.set(x, (freq.get(x) ?? 0) + 1);
        vals.add(x);
        vals.add(x + 1);
    }

    // Process one real copy of x: either keep x or increase it to x + 1.
    function update(x) {
        // Read both BEFORE writing, so this input element is not used twice.
        const prev = dp.get(x - 1) ?? 0;
        const curr = dp.get(x) ?? 0;

        const keep = prev + 1;
        const inc = curr + 1;

        dp.set(x, keep);
        dp.set(x + 1, inc);
        best = Math.max(best, keep, inc);
    }

    for (const start of vals) {
        // Each consecutive group is processed from its smallest possible value.
        if (vals.has(start - 1)) continue;

        let x = start;
        while (vals.has(x)) {
            const cnt = freq.get(x) ?? 0;
            for (let i = 0; i < cnt; i++) {
                update(x);
            }
            x++;
        }
    }

    return best;
};`,approach:"Count the copies of each number and store possible final values in vals, where each x can stay x or become x + 1. Group consecutive values and process every real copy in increasing value order, reading both old DP values before writing the keep and increase results so one element is never used twice. Track the longest chain found.",timeComplexity:"O(n) expected",spaceComplexity:"O(n)",variables:{n:"Number of elements in nums."},example:"maxSelectedElements([2,1,5,1,1]) → 3",intuition:"A number x has only two possible final values: x and x + 1. Track the longest consecutive chain ending at each final value. Processing input values in increasing order lets a new copy either extend a chain ending at x - 1 or extend one ending at x. Gaps among all possible final values separate the work into independent groups, so we can discover their starts without sorting the array.",hints:["If a selected chain ends at value x, what information would let you extend it with one more number?","A copy of x can stay x or become x + 1. Read the old chain lengths ending at x - 1 and x before updating either result.","Put every possible final value into a set. A value with no predecessor in that set starts a consecutive group that you can scan in increasing order."],pseudocode:{concept:"Extend consecutive chains once for each real input copy, using its two allowed final values.",steps:["Count the copies of each input value in freq, and add both x and x + 1 to vals, the set of possible final values.","Start with an empty map of best chain lengths and a best answer of zero.","For each possible value, skip it as a group start if its predecessor is also possible.","From each remaining group start, advance one value at a time while that value is in vals.","Read cnt = freq.get(x), using zero for a missing value. For i from 0 to cnt - 1, process one real copy: first read the old chain lengths ending at x - 1 and x.","Store the keep result at x and the increase result at x + 1, each one longer than its corresponding old chain.","Update the best answer after every real copy, then return it after all groups are processed."]},explanation:`1. The frequency map freq counts real input copies. The set vals also contains possible final values that no original element has, because increasing a smaller value can produce them. Such values still connect a group, but contribute no input copies themselves.
2. A group starts exactly where the predecessor is absent. Scanning from that start visits its values in increasing order; no selected consecutive chain can cross a missing possible value.
3. For one copy of x, keeping it extends an old chain ending at x - 1. Increasing it extends an old chain ending at x. Both old lengths are read before either write, so this same copy cannot supply two positions in a chain.
4. Repeating the update for the recorded frequency allows separate duplicate copies to make separate choices. The running best records every chain length produced, even when a later update changes a map entry.
5. There are at most twice as many possible values as input elements. Every group value and every real copy is processed once, giving expected linear time with hash maps and a hash set.`,timeComplexityBreakdown:{variables:"n is the number of input elements. There are at most 2n distinct possible final values.",phases:[{label:"Build the frequency map and possible-value set",cost:"O(n) expected"},{label:"Check each possible value to find group starts",cost:"O(n) expected"},{label:"Walk all disjoint groups; each possible value is visited once",cost:"O(n) expected"},{label:"Apply the constant-size DP update once per real input copy",cost:"O(n) expected"}],simplifications:["O(n + n + n + n) expected","O(n) expected"],note:"The nested group and copy loops do not multiply to n²: groups are disjoint, and all frequencies sum to n. The expected bound assumes average constant-time hash-map and hash-set operations."},walkthrough:`Input: nums = [2, 1, 5, 1, 1]
Initial state: freq = {}, vals = [], dp = {}, best = 0
Map/Set order below is insertion order, not sorted order.
dp[v] = longest chain ending at v; a missing entry reads as 0.

Build iteration 1: x = 2
  freq.get(2) = undefined
  freq[2] = (undefined ?? 0) + 1 = 1
  add(2): new -> [2]
  add(2 + 1 = 3): new
    vals = [2, 3]
  freq = {2: 1}

Build iteration 2: x = 1
  freq.get(1) = undefined
  freq[1] = (undefined ?? 0) + 1 = 1
  add(1): new -> [2, 3, 1]
  add(1 + 1 = 2): already present
    vals = [2, 3, 1]
  freq = {2: 1, 1: 1}

Build iteration 3: x = 5
  freq.get(5) = undefined
  freq[5] = (undefined ?? 0) + 1 = 1
  add(5): new -> [2, 3, 1, 5]
  add(5 + 1 = 6): new
    vals = [2, 3, 1, 5, 6]
  freq = {2: 1, 1: 1, 5: 1}

Build iteration 4: x = 1
  freq.get(1) = 1
  freq[1] = (1 ?? 0) + 1 = 2
  add(1): already present -> [2, 3, 1, 5, 6]
  add(1 + 1 = 2): already present
    vals = [2, 3, 1, 5, 6]
  freq = {2: 1, 1: 2, 5: 1}

Build iteration 5: x = 1
  freq.get(1) = 2
  freq[1] = (2 ?? 0) + 1 = 3
  add(1): already present -> [2, 3, 1, 5, 6]
  add(1 + 1 = 2): already present
    vals = [2, 3, 1, 5, 6]
  freq = {2: 1, 1: 3, 5: 1}

Build loop complete.

Group-start check 1: start = 2
  vals.has(2 - 1 = 1) -> true
  continue; a smaller value starts this group.

Group-start check 2: start = 3
  vals.has(3 - 1 = 2) -> true
  continue; a smaller value starts this group.

Group-start check 3: start = 1
  vals.has(1 - 1 = 0) -> false
  x = start = 1
  vals.has(1) -> true
  cnt = freq.get(1) ?? 0 = 3; i = 0
  i < cnt: 0 < 3 -> true
    update(1): dp = {}, best = 0
      Read BEFORE writing:
        prev = dp.get(1 - 1 = 0) ?? 0 = 0
        curr = dp.get(1) ?? 0 = 0
      keep = 0 + 1 = 1
      inc = 0 + 1 = 1
      dp.set(1, 1) -> {1: 1}
      dp.set(1 + 1 = 2, 1)
        dp = {1: 1, 2: 1}
      best = Math.max(0, 1, 1) = 1
    Return from update(1).
  i++: 0 -> 1
  i < cnt: 1 < 3 -> true
    update(1): dp = {1: 1, 2: 1}, best = 1
      Read BEFORE writing:
        prev = dp.get(1 - 1 = 0) ?? 0 = 0
        curr = dp.get(1) ?? 0 = 1
      keep = 0 + 1 = 1
      inc = 1 + 1 = 2
      dp.set(1, 1) -> {1: 1, 2: 1}
      dp.set(1 + 1 = 2, 2)
        dp = {1: 1, 2: 2}
      best = Math.max(1, 1, 2) = 2
    Return from update(1).
  i++: 1 -> 2
  i < cnt: 2 < 3 -> true
    update(1): dp = {1: 1, 2: 2}, best = 2
      Read BEFORE writing:
        prev = dp.get(1 - 1 = 0) ?? 0 = 0
        curr = dp.get(1) ?? 0 = 1
      keep = 0 + 1 = 1
      inc = 1 + 1 = 2
      dp.set(1, 1) -> {1: 1, 2: 2}
      dp.set(1 + 1 = 2, 2)
        dp = {1: 1, 2: 2}
      best = Math.max(2, 1, 2) = 2
    Return from update(1).
  i++: 2 -> 3
  i < cnt: 3 < 3 -> false
  x++: 1 -> 2
  vals.has(2) -> true
  cnt = freq.get(2) ?? 0 = 1; i = 0
  i < cnt: 0 < 1 -> true
    update(2): dp = {1: 1, 2: 2}, best = 2
      Read BEFORE writing:
        prev = dp.get(2 - 1 = 1) ?? 0 = 1
        curr = dp.get(2) ?? 0 = 2
      keep = 1 + 1 = 2
      inc = 2 + 1 = 3
      dp.set(2, 2) -> {1: 1, 2: 2}
      dp.set(2 + 1 = 3, 3)
        dp = {1: 1, 2: 2, 3: 3}
      best = Math.max(2, 2, 3) = 3
    Return from update(2).
  i++: 0 -> 1
  i < cnt: 1 < 1 -> false
  x++: 2 -> 3
  vals.has(3) -> true
  cnt = freq.get(3) ?? 0 = 0; i = 0
  i < cnt: 0 < 0 -> false
  No real input copy: do not call update.
  x++: 3 -> 4
  vals.has(4) -> false; end this group.

Group-start check 4: start = 5
  vals.has(5 - 1 = 4) -> false
  x = start = 5
  vals.has(5) -> true
  cnt = freq.get(5) ?? 0 = 1; i = 0
  i < cnt: 0 < 1 -> true
    update(5): dp = {1: 1, 2: 2, 3: 3}, best = 3
      Read BEFORE writing:
        prev = dp.get(5 - 1 = 4) ?? 0 = 0
        curr = dp.get(5) ?? 0 = 0
      keep = 0 + 1 = 1
      inc = 0 + 1 = 1
      dp.set(5, 1) -> {1: 1, 2: 2, 3: 3, 5: 1}
      dp.set(5 + 1 = 6, 1)
        dp = {1: 1, 2: 2, 3: 3, 5: 1, 6: 1}
      best = Math.max(3, 1, 1) = 3
    Return from update(5).
  i++: 0 -> 1
  i < cnt: 1 < 1 -> false
  x++: 5 -> 6
  vals.has(6) -> true
  cnt = freq.get(6) ?? 0 = 0; i = 0
  i < cnt: 0 < 0 -> false
  No real input copy: do not call update.
  x++: 6 -> 7
  vals.has(7) -> false; end this group.

Group-start check 5: start = 6
  vals.has(6 - 1 = 5) -> true
  continue; a smaller value starts this group.

All 5 possible values checked; end the outer loop.
Return best = 3

Selected chain: [1, 2, 3].
  Keep one 1; change another 1 to 2; change the original 2 to 3.
  These are three different input copies.
Read-before-write check for the first 1:
  Old curr = 0 -> inc = 1.
  Reading the newly written dp[1] would falsely reuse that same copy.`}],s={id:3041,date:e,comparison:n,solutions:t};export{n as comparison,e as date,s as default,a as id,t as solutions};
