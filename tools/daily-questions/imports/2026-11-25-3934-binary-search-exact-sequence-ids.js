var smallestUniqueSubarray = function(nums) {
    const n = nums.length;

    // Level 0 describes blocks of length 1: the value itself is an exact ID.
    // Each later level describes blocks twice as long.
    const idsByLevel = [nums];

    for (let blockLength = 2; blockLength <= n; blockLength *= 2) {
        const halfLength = blockLength / 2;
        const previous = idsByLevel[idsByLevel.length - 1];
        const current = [];
        const idsByLeft = new Map();
        let nextId = 0;

        for (let start = 0; start + blockLength <= n; start++) {
            const leftId = previous[start];
            const rightId = previous[start + halfLength];
            let idsByRight = idsByLeft.get(leftId);

            if (!idsByRight) {
                idsByRight = new Map();
                idsByLeft.set(leftId, idsByRight);
            }

            // Reuse an ID only when BOTH half IDs match.
            // IDs are local to this level, and 0 is a valid ID.
            if (!idsByRight.has(rightId)) {
                idsByRight.set(rightId, nextId);
                nextId++;
            }

            current.push(idsByRight.get(rightId));
        }

        idsByLevel.push(current);
    }

    function hasUnique(length) {
        // Find the largest power-of-two block that fits inside this length.
        let level = 0;
        let blockLength = 1;
        while (blockLength * 2 <= length) {
            blockLength *= 2;
            level++;
        }

        const ids = idsByLevel[level];
        const countsByFirst = new Map();

        for (let start = 0; start + length <= n; start++) {
            const firstId = ids[start];
            const lastStart = start + length - blockLength;
            const lastId = ids[lastStart];
            let countsByLast = countsByFirst.get(firstId);

            if (!countsByLast) {
                countsByLast = new Map();
                countsByFirst.set(firstId, countsByLast);
            }

            // The first and last blocks cover the entire window.
            // Matching both IDs means the entire sequences are equal.
            const count = countsByLast.get(lastId) ?? 0;
            countsByLast.set(lastId, count + 1);
        }

        // Count every window before deciding whether a sequence occurs once.
        for (const countsByLast of countsByFirst.values()) {
            for (const count of countsByLast.values()) {
                if (count === 1) return true;
            }
        }
        return false;
    }

    let lo = 1;
    let hi = n;
    let answer = n;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (hasUnique(mid)) {
            answer = mid;
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }

    return answer;
};
