const a=2567,e="2026-11-19",t={kind:"different-approach",summary:"Your solution takes O(n) time by retaining six extremes; the existing solution sorts the full array.",details:["Both compare the same three choices: change the two smallest values, one value at each end, or the two largest values.","Your smallest and largest arrays contain at most four values before trimming, so each small sort takes constant time. The input array is unchanged.","The existing Python and TypeScript implementations sort nums in place, taking O(n log n) time. No JavaScript implementation was saved for this problem."]},s=[{title:"Track three smallest and largest values",code:`var minimizeSum = function(nums) {
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
};`,approach:"Keep only the three smallest and three largest values as you scan nums; each small array is sorted and trimmed after an insertion. Compare changing the two smallest values, one value at each end, or the two largest values. The smallest remaining range is the answer.",timeComplexity:"O(n)",spaceComplexity:"O(1)",variables:{n:"Number of elements in nums."},example:"minimizeSum([1,4,7,8,5]) → 3",intuition:"The score adds the smallest pair difference to the overall range. We can make the smallest difference zero by setting a changed value equal to a retained value. The remaining goal is to shrink the range. With two changes, the only useful choices are the two smallest values, one smallest and one largest, or the two largest values.",hints:["Can a changed value duplicate another value and make the smallest pair difference zero?","To shrink the overall range, which values must change: interior values or values at the extremes?","There are only three ways to distribute two changes between the low and high ends. Which three smallest and largest values determine those ranges?"],pseudocode:{concept:"Compare the three ranges left after changing two extreme values.",steps:["Keep two short lists: the three smallest values in ascending order and the three largest values in descending order.","For each input value, insert it into both lists, sort each list, and discard its fourth entry if present.","Compute the range after changing the two smallest values: largest[0] minus smallest[2].","Compute the range after changing one value at each end: largest[1] minus smallest[1].","Compute the range after changing the two largest values: largest[2] minus smallest[0].","Return the smallest of the three ranges."]},explanation:`1. The short lists preserve duplicate values and keep exactly the extremes needed for two changes. Sorting at most four values per insertion takes constant work.
2. Changing an interior value cannot remove the current minimum or maximum. Any best remaining range is therefore represented by changing two low values, one at each end, or two high values.
3. The three differences in the return statement measure those remaining ranges. Set the changed values equal to a value inside the chosen range: this avoids enlarging it and creates an equal pair, so the smallest pair difference becomes zero.
4. The total score is then just that range. Taking the minimum of the three candidates gives the minimum score.`,timeComplexityBreakdown:{variables:"n is the number of input values. Each temporary list has at most four entries before trimming.",phases:[{label:"Initialize the two short lists",cost:"O(1)"},{label:"For each of n values, insert into two lists, sort at most four entries each, and trim",cost:"O(n × 1)"},{label:"Calculate and compare the three candidate ranges",cost:"O(1)"}],simplifications:["O(n + 1)","O(n)"],note:"These are constant-sized sorts, not sorts of the full input. Duplicate values still occupy separate positions in the lists."},walkthrough:`Input: nums = [1, 4, 7, 8, 5]
Initial state: smallest = [], largest = []

Iteration 1: num = 1
  Before: smallest = []
          largest = []
  smallest.push(1) -> [1]
  sort(a - b) -> [1]
  smallest.length > 3: 1 > 3 -> false
  No pop; smallest = [1]
  largest.push(1) -> [1]
  sort(b - a) -> [1]
  largest.length > 3: 1 > 3 -> false
  No pop; largest = [1]
  End: smallest = [1]
       largest = [1]

Iteration 2: num = 4
  Before: smallest = [1]
          largest = [1]
  smallest.push(4) -> [1, 4]
  sort(a - b) -> [1, 4]
  smallest.length > 3: 2 > 3 -> false
  No pop; smallest = [1, 4]
  largest.push(4) -> [1, 4]
  sort(b - a) -> [4, 1]
  largest.length > 3: 2 > 3 -> false
  No pop; largest = [4, 1]
  End: smallest = [1, 4]
       largest = [4, 1]

Iteration 3: num = 7
  Before: smallest = [1, 4]
          largest = [4, 1]
  smallest.push(7) -> [1, 4, 7]
  sort(a - b) -> [1, 4, 7]
  smallest.length > 3: 3 > 3 -> false
  No pop; smallest = [1, 4, 7]
  largest.push(7) -> [4, 1, 7]
  sort(b - a) -> [7, 4, 1]
  largest.length > 3: 3 > 3 -> false
  No pop; largest = [7, 4, 1]
  End: smallest = [1, 4, 7]
       largest = [7, 4, 1]

Iteration 4: num = 8
  Before: smallest = [1, 4, 7]
          largest = [7, 4, 1]
  smallest.push(8) -> [1, 4, 7, 8]
  sort(a - b) -> [1, 4, 7, 8]
  smallest.length > 3: 4 > 3 -> true
  smallest.pop() removes 8 -> [1, 4, 7]
  largest.push(8) -> [7, 4, 1, 8]
  sort(b - a) -> [8, 7, 4, 1]
  largest.length > 3: 4 > 3 -> true
  largest.pop() removes 1 -> [8, 7, 4]
  End: smallest = [1, 4, 7]
       largest = [8, 7, 4]

Iteration 5: num = 5
  Before: smallest = [1, 4, 7]
          largest = [8, 7, 4]
  smallest.push(5) -> [1, 4, 7, 5]
  sort(a - b) -> [1, 4, 5, 7]
  smallest.length > 3: 4 > 3 -> true
  smallest.pop() removes 7 -> [1, 4, 5]
  largest.push(5) -> [8, 7, 4, 5]
  sort(b - a) -> [8, 7, 5, 4]
  largest.length > 3: 4 > 3 -> true
  largest.pop() removes 4 -> [8, 7, 5]
  End: smallest = [1, 4, 5]
       largest = [8, 7, 5]

All 5 input values visited; end the loop.

Candidate 1: change the two smallest
  largest[0] - smallest[2] = 8 - 5 = 3
  Change 1 and 4 to 5 -> range [5, 8], low score 0.
Candidate 2: change one value at each end
  largest[1] - smallest[1] = 7 - 4 = 3
  Change 1 to 4 and 8 to 7 -> range [4, 7], low score 0.
Candidate 3: change the two largest
  largest[2] - smallest[0] = 5 - 1 = 4
  Change 7 and 8 to 5 -> range [1, 5], low score 0.

Return Math.min(3, 3, 4) = 3`}],n={id:2567,date:e,comparison:t,solutions:s};export{t as comparison,e as date,n as default,a as id,s as solutions};
