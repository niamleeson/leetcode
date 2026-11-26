const a=3411,e="2026-11-24",t={kind:"same-approach",summary:"Same subarray enumeration; your solution stops sooner once product exceeds the current GCD × LCM.",details:["Both extend each starting index while maintaining the product, GCD, and LCM, and record a length when product equals GCD × LCM.","Your code stops at prod > gcdVal * lcmVal. The existing Python computes a global limit lcm(*nums) * max(nums) and stops only after the product exceeds that limit.","For positive input values, once product exceeds the current GCD × LCM, extending the subarray cannot restore equality. Your earlier stop is valid.","Your code writes out gcd and lcm helpers. The existing Python uses its math functions. Both have O(n²) worst-case time for the bounded values and O(1) extra space. No JavaScript or TypeScript implementation was saved."]},n=[{title:"Extend subarrays with product, GCD, and LCM",code:`var maxLength = function(nums) {
    function gcd(a, b) {
        while (b !== 0) {
            const rem = a % b;
            a = b;
            b = rem;
        }
        return a;
    }

    function lcm(a, b) {
        return (a / gcd(a, b)) * b;
    }

    let best = 0;

    for (let left = 0; left < nums.length; left++) {
        let prod = 1;
        let gcdVal = 0;
        let lcmVal = 1;

        for (let right = left; right < nums.length; right++) {
            const num = nums[right];
            prod *= num;
            gcdVal = gcd(gcdVal, num);
            lcmVal = lcm(lcmVal, num);

            const target = gcdVal * lcmVal;

            if (prod === target) {
                best = Math.max(best, right - left + 1);
            } else if (prod > target) {
                break;
            }
        }
    }

    return best;
};`,approach:"Try each starting position and extend the subarray one number at a time, updating its product, GCD, and LCM. Record its length whenever product equals GCD × LCM. Stop extending that start once product is greater, because adding more positive values cannot restore equality.",timeComplexity:"O(n²) for the stated bounded values",spaceComplexity:"O(1)",variables:{n:"Number of elements in nums."},example:"maxLength([2,3,4,5,6]) → 3"}],r={id:3411,date:e,comparison:t,solutions:n};export{t as comparison,e as date,r as default,a as id,n as solutions};
