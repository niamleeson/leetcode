function smallestUniqueSubarray(nums) {
  const n = nums.length;
  const levels = [nums];
  for (let len = 2; len <= n; len *= 2) {
    const half = len / 2;
    const prev = levels[levels.length - 1];
    const ids = [];
    const map = new Map();
    for (let i = 0; i + len <= n; i++) {
      const left = prev[i];
      const right = prev[i + half];
      const key = `${left},${right}`;
      if (!map.has(key)) {
        map.set(key, map.size);
      }
      ids.push(map.get(key));
    }
    levels.push(ids);
  }
  function hasUnique(k) {
    const level = Math.floor(Math.log2(k));
    const len = 2 ** level;
    const ids = levels[level];
    const counts = new Map();
    for (let i = 0; i + k <= n; i++) {
      const left = ids[i];
      const right = ids[i + k - len];
      const key = `${left},${right}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    for (const count of counts.values()) {
      if (count === 1) return true;
    }
    return false;
  }
  let lo = 1;
  let hi = n;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hasUnique(mid)) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
