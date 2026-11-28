const a=2914,e="2026-11-18",n={kind:"same-approach",summary:"Same pair-counting approach; the loop starts at the other index of each pair.",details:["Your solution checks s[i] against s[i + 1] starting at i = 0. The existing JavaScript checks s[i] against s[i - 1] starting at i = 1. Both inspect the same non-overlapping pairs.","Your counter is named changes; the existing JavaScript uses ans. Both take O(n) time and O(1) extra space."]},t=[{title:"Greedy pair scan",code:`var minChanges = function(s) {
    let changes = 0;

    for (let i = 0; i < s.length; i += 2) {
        if (s[i] !== s[i + 1]) {
            changes++;
        }
    }

    return changes;
};`,approach:"Check the string in pairs: (0, 1), (2, 3), and so on. A matching pair needs no changes, while a mismatched pair needs exactly one flip. Count those mismatched pairs to get the minimum number of changes.",timeComplexity:"O(n)",spaceComplexity:"O(1)",variables:{n:"Number of characters in s."},example:'minChanges("1001") → 2',intuition:"Every valid segment has even length, so its boundaries fall between the pairs (0, 1), (2, 3), and so on. The two characters inside each pair must therefore match. Once every pair matches, those pairs themselves form a valid partition. This makes each pair an independent decision.",hints:["Where can a segment end if every segment has even length?","Check the fixed pairs (0, 1), (2, 3), and so on. How many changes does a mismatched pair require?"],pseudocode:{concept:"Count the fixed pairs whose two characters differ.",steps:["Start the change count at zero.","Visit pair starts 0, 2, 4, and so on.","If the character at the pair start differs from the next character, add one change.","Return the change count."]},explanation:`1. Advancing the index by two visits each fixed pair exactly once. The even input length guarantees that the next character exists.
2. A mismatched pair needs at least one change because it cannot lie across an even-length segment boundary. One change is also sufficient: make either character equal to the other.
3. Matching pairs need no changes. Adding the independent minimum for every pair gives the global minimum; the resulting matching pairs can be used as the required segments.`,timeComplexityBreakdown:{variables:"n is the even number of characters in the string.",phases:[{label:"Initialize the change count",cost:"O(1)"},{label:"Visit n / 2 pairs, comparing two characters and possibly adding one",cost:"O(n / 2)"},{label:"Return the count",cost:"O(1)"}],simplifications:["O(n / 2 + 1)","O(n)"],note:"Every character belongs to exactly one visited pair. The factor 1/2 does not change the linear bound."},walkthrough:`Input: s = "1001"
Indices: 0, 1, 2, 3
Initial state: changes = 0

Iteration 1: i = 0
  i < s.length: 0 < 4 -> true
  s[0] = "1"
  s[0 + 1] = s[1] = "0"
  "1" !== "0" -> true
  changes: 0 -> 1
  i += 2: 0 + 2 = 2

Iteration 2: i = 2
  i < s.length: 2 < 4 -> true
  s[2] = "0"
  s[2 + 1] = s[3] = "1"
  "0" !== "1" -> true
  changes: 1 -> 2
  i += 2: 2 + 2 = 4

Loop check: 4 < 4 -> false
Return changes = 2
One result: "1100" -> groups "11" and "00".
  Flip index 1: 0 -> 1; flip index 3: 1 -> 0.`}],i={id:2914,date:e,comparison:n,solutions:t};export{n as comparison,e as date,i as default,a as id,t as solutions};
