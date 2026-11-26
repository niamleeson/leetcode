const s=1352,e="2026-11-23",t={kind:"same-approach",summary:"Same prefix-product algorithm; your solution uses class methods and direct division.",details:["Both reset prefix to [1] after zero and return zero if the requested range crosses that reset.","Your JavaScript uses a class, an early return after zero, and named count, total, and before values. The existing curated JavaScript uses a constructor function with prototype methods and an else branch.","Your guard k > count is equivalent to the existing k >= prefix.length. Your direct division returns the same integer as the existing Math.floor division under the problem’s guarantees.","Both have O(1) amortized add, O(1) getProduct, and O(n) space. A wrong output in the previous curated example was also corrected with this import: after adding 3, 0, 2, and 5, getProduct(3) is 0, not 20. The supplied example is correct."]},r=[{title:"Prefix products since the last zero",code:`class ProductOfNumbers {
    constructor() {
        this.prefix = [1];
    }

    add(num) {
        if (num === 0) {
            this.prefix = [1];
            return;
        }

        const last = this.prefix[this.prefix.length - 1];
        this.prefix.push(last * num);
    }

    getProduct(k) {
        const count = this.prefix.length - 1;

        if (k > count) {
            return 0;
        }

        const total = this.prefix[count];
        const before = this.prefix[count - k];
        return total / before;
    }
}`,approach:"Store cumulative products since the most recent zero, starting with [1], and reset that list whenever zero is added. If k reaches past the values stored since that reset, the requested product includes zero. Otherwise divide the latest cumulative product by the cumulative product just before the last k values.",timeComplexity:"add: O(1) amortized; getProduct: O(1)",spaceComplexity:"O(n)",variables:{n:"Number of values added; the current prefix array stores only values since the most recent zero.",k:"Number of most recently added values requested by getProduct."},example:"After add(3), add(0), add(2), add(5), add(4): getProduct(2) → 20; getProduct(4) → 0"}],n={id:1352,date:e,comparison:t,solutions:r};export{t as comparison,e as date,n as default,s as id,r as solutions};
