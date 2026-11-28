var smallestUniqueSubarray = function(nums) {
    const n = nums.length;
    let largest = 0;

    for (const num of nums) {
        largest = Math.max(largest, num);
    }

    const BASE = largest + 1;
    const MOD = 1000000007;

    function hasUnique(k) {
        // The first value in a k-element window has weight BASE^(k - 1).
        let power = 1;
        for (let i = 1; i < k; i++) {
            power = (power * BASE) % MOD;
        }

        const buckets = new Map();
        let hash = 0;

        // a and b are window starts; j is the offset within each window.
        function sameWindow(a, b) {
            for (let j = 0; j < k; j++) {
                if (nums[a + j] !== nums[b + j]) {
                    return false;
                }
            }
            return true;
        }

        function recordWindow(start) {
            let groups = buckets.get(hash);

            if (!groups) {
                groups = [];
                buckets.set(hash, groups);
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
        for (let i = 0; i < k; i++) {
            hash = (hash * BASE + nums[i]) % MOD;
        }
        recordWindow(0);

        // Remove the outgoing value, shift the weights, and add the new value.
        for (let start = 1; start + k <= n; start++) {
            const out = (nums[start - 1] * power) % MOD;
            hash = (hash - out + MOD) % MOD;
            hash = (hash * BASE + nums[start + k - 1]) % MOD;
            recordWindow(start);
        }

        for (const groups of buckets.values()) {
            for (const group of groups) {
                if (group.count === 1) return true;
            }
        }
        return false;
    }

    let lo = 1;
    let hi = n;
    let ans = n;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (hasUnique(mid)) {
            ans = mid;
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }

    return ans;
};
