const s=2567,e="2026-11-19",t={kind:"different-approach",summary:"Your solution takes O(n) time by retaining six extremes; the existing solution sorts the full array.",details:["Both compare the same three choices: change the two smallest values, one value at each end, or the two largest values.","Your smallest and largest arrays contain at most four values before trimming, so each small sort takes constant time. The input array is unchanged.","The existing Python and TypeScript implementations sort nums in place, taking O(n log n) time. No JavaScript implementation was saved for this problem."]},a=[{title:"Track three smallest and largest values",code:`var minimizeSum = function(nums) {
    const smallest = [];
    const largest = [];

    for (const num of nums) {
        smallest.push(num);
        smallest.sort((a, b) => a - b);
        if (smallest.length > 3) smallest.pop();

        largest.push(num);
        largest.sort((a, b) => b - a);
        if (largest.length > 3) largest.pop();
    }

    return Math.min(
        largest[0] - smallest[2], // Change the two smallest.
        largest[1] - smallest[1], // Change the smallest and largest.
        largest[2] - smallest[0]  // Change the two largest.
    );
};`,approach:"Keep only the three smallest and three largest values as you scan nums; each small array is sorted and trimmed after an insertion. Compare changing the two smallest values, one value at each end, or the two largest values. The smallest remaining range is the answer.",timeComplexity:"O(n)",spaceComplexity:"O(1)",variables:{n:"Number of elements in nums."},example:"minimizeSum([1,4,7,8,5]) → 3"}],n={id:2567,date:e,comparison:t,solutions:a};export{t as comparison,e as date,n as default,s as id,a as solutions};
