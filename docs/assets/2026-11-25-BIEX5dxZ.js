const o=3934,n="2026-11-25",e={kind:"different-approach",summary:"Your exact suffix structures replace the existing binary-search and rolling-hash approach, which has a confirmed collision error.",details:["Your suffix array + LCP solution sorts suffixes with rank doubling and stable counting sort, builds adjacent LCP values, and checks each suffix’s shortest distinguishing prefix. It takes O(n log n) time and O(n) space.","Your suffix automaton solution builds a suffix automaton, propagates occurrence counts through the shorterId tree, and finds the shortest length represented by a node that occurs once. It takes O(n) expected time and O(n) space.","The existing Python binary-searches the length and counts rolling hashes, taking O(n log n) time and O(n) space. No JavaScript or TypeScript implementation was saved.","The existing hash-only comparison is incorrect for nums = [1,20,2,1,20,2]: it returns 3 instead of 2. With base 19, [1,20] and [2,1] both hash to 39, hiding the unique pair [2,1]. Both supplied solutions return the correct answer 2."]},t=[{title:"Suffix array + LCP",code:`var smallestUniqueSubarraySuffixArray = function(nums) {
    const n = nums.length;
    if (n === 1) return 1;

    // STEP 1: Give equal numbers equal ranks.
    const sortedValues = [...nums].sort((a, b) => a - b);
    const valueRank = Object.create(null);
    let groups = 0;

    for (const num of sortedValues) {
        if (valueRank[num] === undefined) {
            valueRank[num] = groups;
            groups++;
        }
    }

    let rank = nums.map(num => valueRank[num]);
    let sa = Array.from({ length: n }, (_, i) => i);

    // Stable counting sort for one half of a rank pair.
    // A missing second half has rank -1, ordered before other ranks.
    function countSort(indices, offset) {
        const count = new Int32Array(groups + 1);

        for (const start of indices) {
            const key = start + offset < n ? rank[start + offset] + 1 : 0;
            count[key]++;
        }

        let position = 0;
        for (let key = 0; key < count.length; key++) {
            const size = count[key];
            count[key] = position;
            position += size;
        }

        const result = new Array(n);
        for (const start of indices) {
            const key = start + offset < n ? rank[start + offset] + 1 : 0;
            result[count[key]++] = start;
        }
        return result;
    }

    // STEP 2: Sort suffixes by doubling the compared prefix length.
    // First sort by the second half, then the first half.
    for (let gap = 1; gap < n; gap *= 2) {
        sa = countSort(sa, gap);
        sa = countSort(sa, 0);

        const nextRank = new Array(n);
        nextRank[sa[0]] = 0;
        let newGroups = 1;

        for (let i = 1; i < n; i++) {
            const prev = sa[i - 1];
            const curr = sa[i];
            const prevSecond = prev + gap < n ? rank[prev + gap] : -1;
            const currSecond = curr + gap < n ? rank[curr + gap] : -1;

            const different = rank[prev] !== rank[curr] || prevSecond !== currSecond;
            if (different) newGroups++;
            nextRank[curr] = newGroups - 1;
        }

        rank = nextRank;
        groups = newGroups;
        if (groups === n) break;
    }

    // STEP 3: Calculate LCP between neighboring sorted suffixes.
    // lcp[i] is the common prefix length of sa[i-1] and sa[i].
    const pos = new Array(n);
    for (let i = 0; i < n; i++) {
        pos[sa[i]] = i;
    }

    const lcp = new Array(n).fill(0);
    let common = 0;

    for (let start = 0; start < n; start++) {
        const i = pos[start];
        if (i === 0) {
            common = 0;
            continue;
        }

        const prevStart = sa[i - 1];
        while (start + common < n && prevStart + common < n && nums[start + common] === nums[prevStart + common]) {
            common++;
        }

        lcp[i] = common;
        if (common > 0) common--;
    }

    // STEP 4: The first unique prefix has length max(neighbor LCPs) + 1.
    let best = n;

    for (let i = 0; i < n; i++) {
        const prevLcp = lcp[i];
        const nextLcp = lcp[i + 1] ?? 0;
        const needed = Math.max(prevLcp, nextLcp) + 1;
        const available = n - sa[i];

        if (needed <= available) {
            best = Math.min(best, needed);
        }
    }

    return best;
};`,approach:"Sort suffix start indices using rank doubling and stable counting sort; calculate adjacent longest-common-prefix values (LCP); then find the shortest distinguishing prefix for each suffix. There is **no binary search** and **no automaton cloning**.",timeComplexity:"O(n log n)",spaceComplexity:"O(n)",variables:{n:"Number of elements in nums."},example:"smallestUniqueSubarraySuffixArray([1,2,1,2,1]) → 3",notes:["Kept as a separate function so both selected implementations can remain together."],walkthroughMarkdown:"```javascript\nnums = [1, 2, 1, 2, 1];\nsa = [4, 2, 0, 3, 1];\nlcp = [0, 1, 3, 0, 2];\nneeded = [2, 4, 4, 3, 3];\navailable = [1, 3, 5, 2, 4];\nvalidLengths = [4, 3];\nanswer = 3;\n```\n\n| Sorted suffix | LCP prev | LCP next | Needed | Available | Valid? |\n|---|---:|---:|---:|---:|---|\n| `[1]` | 0 | 1 | 2 | 1 | No |\n| `[1,2,1]` | 1 | 3 | 4 | 3 | No |\n| `[1,2,1,2,1]` | 3 | 0 | 4 | 5 | Yes |\n| `[2,1]` | 0 | 2 | 3 | 2 | No |\n| `[2,1,2,1]` | 2 | 0 | 3 | 4 | Yes |\n\n**Shortest unique prefix formula:** `needed = max(lcp[i], lcp[i + 1] ?? 0) + 1`. A suffix is valid if `needed <= n - sa[i]`."},{title:"Suffix automaton",code:`var smallestUniqueSubarray = function(nums) {
    const ROOT_ID = 0;
    const NO_ID = -1;
    const nodes = [
        { maxLength: 0, shorterId: NO_ID, next: {}, occurrenceCount: 0 }
    ];
    let lastId = ROOT_ID;

    // Copy an existing node's transitions into a clone, but split off only
    // the shorter paths. A clone is NOT a new input position (count = 0).
    function splitNode(shorterId, nextId, currNum) {
        const cloneId = nodes.length;

        nodes.push({
            maxLength: nodes[shorterId].maxLength + 1,
            shorterId: nodes[nextId].shorterId,
            next: { ...nodes[nextId].next },
            occurrenceCount: 0
        });

        // Redirect all shorter-path transitions that still point at nextId.
        while (
            shorterId !== NO_ID &&
            nodes[shorterId].next[currNum] === nextId
        ) {
            nodes[shorterId].next[currNum] = cloneId;
            shorterId = nodes[shorterId].shorterId;
        }

        nodes[nextId].shorterId = cloneId;
        return cloneId;
    }

    // Build the suffix automaton one input number at a time.
    for (const currNum of nums) {
        const newId = nodes.length;

        nodes.push({
            maxLength: nodes[lastId].maxLength + 1,
            shorterId: NO_ID,
            next: {},
            occurrenceCount: 1
        });

        // If no existing transition is found, root is the default.
        nodes[newId].shorterId = ROOT_ID;
        let shorterId = lastId;

        while (shorterId !== NO_ID) {
            const nextId = nodes[shorterId].next[currNum];
            const transitionExists = nextId !== undefined;

            if (transitionExists) {
                const expectedLength = nodes[shorterId].maxLength + 1;
                const actualLength = nodes[nextId].maxLength;
                const needsClone = expectedLength !== actualLength;

                nodes[newId].shorterId = needsClone
                    ? splitNode(shorterId, nextId, currNum)
                    : nextId;

                break;
            }

            nodes[shorterId].next[currNum] = newId;
            shorterId = nodes[shorterId].shorterId;
        }

        lastId = newId;
    }

    // Turn shorterId links into a parent -> children tree.
    const children = Array.from({ length: nodes.length }, () => []);
    for (let id = 1; id < nodes.length; id++) {
        const parentId = nodes[id].shorterId;
        children[parentId].push(id);
    }

    // Visit parents first, then reverse this order when propagating counts.
    const stack = [ROOT_ID];
    const visitOrder = [];

    while (stack.length > 0) {
        const id = stack.pop();
        visitOrder.push(id);

        for (const childId of children[id]) {
            stack.push(childId);
        }
    }

    // Propagate each node's occurrence count to its shorter-node parent.
    for (let index = visitOrder.length - 1; index > 0; index--) {
        const childId = visitOrder[index];
        const parentId = nodes[childId].shorterId;
        nodes[parentId].occurrenceCount += nodes[childId].occurrenceCount;
    }

    // Find the shortest length represented by a node occurring exactly once.
    let minUniqueLength = nums.length;

    for (let id = 1; id < nodes.length; id++) {
        const appearsExactlyOnce = nodes[id].occurrenceCount === 1;
        if (!appearsExactlyOnce) continue;

        const shorterId = nodes[id].shorterId;
        const shortestLength = nodes[shorterId].maxLength + 1;
        minUniqueLength = Math.min(minUniqueLength, shortestLength);
    }

    return minUniqueLength;
};`,approach:"Our final refactored suffix automaton: node IDs, `splitNode()`, one transition-exists check in the main loop, and occurrence propagation through the shorter-ID tree.",timeComplexity:"O(n) expected",spaceComplexity:"O(n)",variables:{n:"Number of elements in nums."},example:"smallestUniqueSubarray([1,2,1,2,1]) → 3",notes:["Preserved naming: currNum, newId, lastId, shorterId, nextId, cloneId, ROOT_ID, and NO_ID. Transitions remain plain JavaScript objects."]}],s={id:3934,date:n,comparison:e,solutions:t};export{e as comparison,n as date,s as default,o as id,t as solutions};
