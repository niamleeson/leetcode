var smallestUniqueSubarray = function(nums) {
    const n = nums.length;
    let largest = 0;

    for (const num of nums) {
        largest = Math.max(largest, num);
    }

    const BASE = largest + 1;
    const MOD = 1000000007;

    function hasUnique(length) {
        // The first value in a window has weight BASE^(length - 1).
        let highestPower = 1;
        for (let i = 1; i < length; i++) {
            highestPower = (highestPower * BASE) % MOD;
        }

        const groupsByHash = new Map();
        let hash = 0;

        function sameWindow(firstStart, secondStart) {
            for (let offset = 0; offset < length; offset++) {
                if (nums[firstStart + offset] !== nums[secondStart + offset]) {
                    return false;
                }
            }
            return true;
        }

        function recordWindow(start) {
            let groups = groupsByHash.get(hash);

            if (!groups) {
                groups = [];
                groupsByHash.set(hash, groups);
            }

            // Equal hashes can represent different subarrays.
            // Increase a count only after comparing the actual elements.
            for (const group of groups) {
                if (sameWindow(group.start, start)) {
                    group.count++;
                    return;
                }
            }

            groups.push({ start: start, count: 1 });
        }

        // Build the first window's hash from left to right.
        for (let i = 0; i < length; i++) {
            hash = (hash * BASE + nums[i]) % MOD;
        }
        recordWindow(0);

        // Remove the outgoing value, shift the weights, and add the new value.
        for (let start = 1; start + length <= n; start++) {
            const outgoing = (nums[start - 1] * highestPower) % MOD;
            hash = (hash - outgoing + MOD) % MOD;
            hash = (hash * BASE + nums[start + length - 1]) % MOD;
            recordWindow(start);
        }

        for (const groups of groupsByHash.values()) {
            for (const group of groups) {
                if (group.count === 1) return true;
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
