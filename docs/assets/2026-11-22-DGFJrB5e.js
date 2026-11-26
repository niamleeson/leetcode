const s=2124,e="2026-11-22",a={kind:"same-approach",summary:"Same ordering rule; your solution uses a seenB flag instead of searching for the substring ba.",details:["Your solution scans characters, sets seenB after a b, and returns false if a later character is a.",`The existing TypeScript returns !s.includes('ba'); Python checks that "ba" is absent. These are equivalent because the input contains only a and b.`,"Both take O(n) time and O(1) extra space. No JavaScript implementation was saved."]},n=[{title:"Track whether b has appeared",code:`var checkString = function(s) {
    let seenB = false;

    for (const char of s) {
        if (char === 'b') {
            seenB = true;
        }
        if (char === 'a' && seenB) {
            return false;
        }
    }

    return true;
};`,approach:"Track whether a `b` has appeared; any subsequent `a` makes the answer false.",timeComplexity:"O(n)",spaceComplexity:"O(1)",variables:{n:"Number of characters in s."},example:'checkString("abab") → false'}],t={id:2124,date:e,comparison:a,solutions:n};export{a as comparison,e as date,t as default,s as id,n as solutions};
