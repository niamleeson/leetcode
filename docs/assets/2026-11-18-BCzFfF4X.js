const i=2914,a="2026-11-18",e={kind:"same-approach",summary:"Same pair-counting approach; the loop starts at the other index of each pair.",details:["Your solution checks s[i] against s[i + 1] starting at i = 0. The existing JavaScript checks s[i] against s[i - 1] starting at i = 1. Both inspect the same non-overlapping pairs.","Your counter is named changes; the existing JavaScript uses ans. Both take O(n) time and O(1) extra space."]},n=[{title:"Greedy pair scan",code:`var minChanges = function(s) {
    let changes = 0;

    for (let i = 0; i < s.length; i += 2) {
        if (s[i] !== s[i + 1]) {
            changes++;
        }
    }

    return changes;
};`,approach:"Greedy: check pairs at indices `(0,1)`, `(2,3)`, etc. One flip per mismatched pair.",timeComplexity:"O(n)",spaceComplexity:"O(1)",variables:{n:"Number of characters in s."},example:'minChanges("1001") → 2'}],s={id:2914,date:a,comparison:e,solutions:n};export{e as comparison,a as date,s as default,i as id,n as solutions};
