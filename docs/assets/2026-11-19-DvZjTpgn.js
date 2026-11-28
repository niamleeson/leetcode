const t=2567,e="2026-11-19",a={kind:"different-approach",summary:"Your solution takes O(n) time by retaining six extremes; the existing solution sorts the full array.",details:["Both compare the same three choices: change the two smallest values, one value at each end, or the two largest values.","Your small and large arrays contain at most four values before trimming, so each small sort takes constant time. The input array is unchanged.","The existing Python and TypeScript implementations sort nums in place, taking O(n log n) time. No JavaScript implementation was saved for this problem."]},n=[{title:"Track three smallest and largest values",code:`var minimizeSum = function(nums) {
    const small = [];
    const large = [];

    for (const num of nums) {
        small.push(num);
        small.sort((a, b) => a - b);
        if (small.length > 3) small.pop();

        large.push(num);
        large.sort((a, b) => b - a);
        if (large.length > 3) large.pop();
    }

    return Math.min(
        large[0] - small[2], // Change the two smallest.
        large[1] - small[1], // Change the smallest and largest.
        large[2] - small[0]  // Change the two largest.
    );
};`,approach:"Keep small for the three smallest values and large for the three largest as you scan nums; each short array is sorted and trimmed after an insertion. Compare changing the two smallest values, one value at each end, or the two largest values. The smallest remaining range is the answer.",timeComplexity:"O(n)",spaceComplexity:"O(1)",variables:{n:"Number of elements in nums."},example:"minimizeSum([1,4,7,8,5]) → 3",intuition:"The score adds the smallest pair difference to the overall range. We can make the smallest difference zero by setting a changed value equal to a retained value. The remaining goal is to shrink the range. With two changes, the only useful choices are the two smallest values, one smallest and one largest, or the two largest values.",hints:["Can a changed value duplicate another value and make the smallest pair difference zero?","To shrink the overall range, which values must change: interior values or values at the extremes?","There are only three ways to distribute two changes between the low and high ends. Which three smallest and largest values determine those ranges?"],pseudocode:{concept:"Compare the three ranges left after changing two extreme values.",steps:["Keep two short lists: small holds the three smallest values in ascending order, and large holds the three largest values in descending order.","For each input value, insert it into both lists, sort each list, and discard its fourth entry if present.","Compute the range after changing the two smallest values: large[0] minus small[2].","Compute the range after changing one value at each end: large[1] minus small[1].","Compute the range after changing the two largest values: large[2] minus small[0].","Return the smallest of the three ranges."]},explanation:`1. The short lists preserve duplicate values and keep exactly the extremes needed for two changes. Sorting at most four values per insertion takes constant work.
2. Changing an interior value cannot remove the current minimum or maximum. Any best remaining range is therefore represented by changing two low values, one at each end, or two high values.
3. The three differences in the return statement measure those remaining ranges. Set the changed values equal to a value inside the chosen range: this avoids enlarging it and creates an equal pair, so the smallest pair difference becomes zero.
4. The total score is then just that range. Taking the minimum of the three candidates gives the minimum score.`,timeComplexityBreakdown:{variables:"n is the number of input values. Each temporary list has at most four entries before trimming.",phases:[{label:"Initialize the two short lists",cost:"O(1)"},{label:"For each of n values, insert into two lists, sort at most four entries each, and trim",cost:"O(n × 1)"},{label:"Calculate and compare the three candidate ranges",cost:"O(1)"}],simplifications:["O(n + 1)","O(n)"],note:"These are constant-sized sorts, not sorts of the full input. Duplicate values still occupy separate positions in the lists."},walkthrough:`Input: nums = [1, 4, 7, 8, 5]
Initial state: small = [], large = []

Iteration 1: num = 1
  Before: small = []
          large = []
  small.push(1) -> [1]
  sort(a - b) -> [1]
  small.length > 3: 1 > 3 -> false
  No pop; small = [1]
  large.push(1) -> [1]
  sort(b - a) -> [1]
  large.length > 3: 1 > 3 -> false
  No pop; large = [1]
  End: small = [1]
       large = [1]

Iteration 2: num = 4
  Before: small = [1]
          large = [1]
  small.push(4) -> [1, 4]
  sort(a - b) -> [1, 4]
  small.length > 3: 2 > 3 -> false
  No pop; small = [1, 4]
  large.push(4) -> [1, 4]
  sort(b - a) -> [4, 1]
  large.length > 3: 2 > 3 -> false
  No pop; large = [4, 1]
  End: small = [1, 4]
       large = [4, 1]

Iteration 3: num = 7
  Before: small = [1, 4]
          large = [4, 1]
  small.push(7) -> [1, 4, 7]
  sort(a - b) -> [1, 4, 7]
  small.length > 3: 3 > 3 -> false
  No pop; small = [1, 4, 7]
  large.push(7) -> [4, 1, 7]
  sort(b - a) -> [7, 4, 1]
  large.length > 3: 3 > 3 -> false
  No pop; large = [7, 4, 1]
  End: small = [1, 4, 7]
       large = [7, 4, 1]

Iteration 4: num = 8
  Before: small = [1, 4, 7]
          large = [7, 4, 1]
  small.push(8) -> [1, 4, 7, 8]
  sort(a - b) -> [1, 4, 7, 8]
  small.length > 3: 4 > 3 -> true
  small.pop() removes 8 -> [1, 4, 7]
  large.push(8) -> [7, 4, 1, 8]
  sort(b - a) -> [8, 7, 4, 1]
  large.length > 3: 4 > 3 -> true
  large.pop() removes 1 -> [8, 7, 4]
  End: small = [1, 4, 7]
       large = [8, 7, 4]

Iteration 5: num = 5
  Before: small = [1, 4, 7]
          large = [8, 7, 4]
  small.push(5) -> [1, 4, 7, 5]
  sort(a - b) -> [1, 4, 5, 7]
  small.length > 3: 4 > 3 -> true
  small.pop() removes 7 -> [1, 4, 5]
  large.push(5) -> [8, 7, 4, 5]
  sort(b - a) -> [8, 7, 5, 4]
  large.length > 3: 4 > 3 -> true
  large.pop() removes 4 -> [8, 7, 5]
  End: small = [1, 4, 5]
       large = [8, 7, 5]

All 5 input values visited; end the loop.

Candidate 1: change the two smallest
  large[0] - small[2] = 8 - 5 = 3
  Change 1 and 4 to 5 -> range [5, 8], low score 0.
Candidate 2: change one value at each end
  large[1] - small[1] = 7 - 4 = 3
  Change 1 to 4 and 8 to 7 -> range [4, 7], low score 0.
Candidate 3: change the two largest
  large[2] - small[0] = 5 - 1 = 4
  Change 7 and 8 to 5 -> range [1, 5], low score 0.

Return Math.min(3, 3, 4) = 3`}],s={id:2567,date:e,comparison:a,solutions:n};export{a as comparison,e as date,s as default,t as id,n as solutions};
