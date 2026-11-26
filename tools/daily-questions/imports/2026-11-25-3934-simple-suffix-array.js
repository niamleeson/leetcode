var smallestUniqueSubarray = function(nums) {
    // STEP 1: Generate every suffix.
    const suffixes = nums.map((_, i) => nums.slice(i));

    // STEP 2: Sort suffixes lexicographically.
    suffixes.sort((a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) {
                return a[i] - b[i];
            }
        }

        return a.length - b.length;
    });

    // STEP 3: Find the longest matching prefix
    // between two suffixes.
    function lcp(a, b) {
        if (!a || !b) return 0;

        let i = 0;

        while (
            i < a.length &&
            i < b.length &&
            a[i] === b[i]
        ) {
            i++;
        }

        return i;
    }

    // STEP 4: Find the shortest unique prefix
    // for every suffix.
    let best = nums.length;

    for (let i = 0; i < suffixes.length; i++) {
        const curr = suffixes[i];

        const prevLcp = lcp(curr, suffixes[i - 1]);
        const nextLcp = lcp(curr, suffixes[i + 1]);

        const needed = Math.max(prevLcp, nextLcp) + 1;

        // The suffix must contain enough elements.
        if (needed <= curr.length) {
            best = Math.min(best, needed);
        }
    }

    return best;
};
