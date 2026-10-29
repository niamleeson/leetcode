const s=343,e="Integer Break",n="1-D Dynamic Programming",t=`var integerBreak = function(n) {
    // Special cases: 2 and 3 must be split but the pieces are smaller than the whole
    if (n === 2) return 1; // 1 + 1 = 2, product = 1
    if (n === 3) return 2; // 1 + 2 = 3, product = 2 (best: don't split the 2)

    // For n >= 4, greedily break off 3s
    // Stop at n <= 4 because:
    //   - n=4: 2*2=4, best to keep as-is (not break into 3+1=3)
    //   - n=3: already handled as remainder
    let product = 1;
    while (n > 4) {
        product *= 3;
        n -= 3;
    }

    // Multiply by remaining n (could be 2, 3, or 4 — all optimal as-is)
    return product * n;
};`,a="b617be3811bc5a3d3d2323a49078956a039d73d50da9484d405a9361831778d4",i="d120be949580d04de09546df406ed5b5a640d1e6ded6b75fa128e96dd15f723b",r="7f4c33a75fc6b0a87d0327107794faffa6423356ac276dcdf279095f9158999a",l=[{name:"Example",input:[10],expected:36,result:36,steps:[{site:9,line:1,kind:"call",label:"integerBreak",state:{n:10},input:{n:10},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:1,line:3,kind:"check",label:"n === 2",state:{n:10},input:{n:10},heap:{},value:!1,stack:["integerBreak"]},{site:3,line:4,kind:"check",label:"n === 3",state:{n:10},input:{n:10},heap:{},value:!1,stack:["integerBreak"]},{site:4,line:10,kind:"statement",label:"let product = 1;",state:{n:10,product:1},input:{n:10},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:7,line:11,kind:"check",label:"n > 4",state:{n:10,product:1},input:{n:10},heap:{},value:!0,stack:["integerBreak"]},{site:5,line:12,kind:"statement",label:"product *= 3;",state:{n:10,product:3},input:{n:10},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:6,line:13,kind:"statement",label:"n -= 3;",state:{n:7,product:3},input:{n:10},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:7,line:11,kind:"check",label:"n > 4",state:{n:7,product:3},input:{n:10},heap:{},value:!0,stack:["integerBreak"]},{site:5,line:12,kind:"statement",label:"product *= 3;",state:{n:7,product:9},input:{n:10},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:6,line:13,kind:"statement",label:"n -= 3;",state:{n:4,product:9},input:{n:10},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:7,line:11,kind:"check",label:"n > 4",state:{n:4,product:9},input:{n:10},heap:{},value:!1,stack:["integerBreak"]},{site:8,line:17,kind:"return",label:"return product * n;",state:{n:4,product:9},input:{n:10},heap:{},value:36,stack:["integerBreak"]}]},{name:"Edge case",input:[2],expected:1,result:1,steps:[{site:9,line:1,kind:"call",label:"integerBreak",state:{n:2},input:{n:2},heap:{},value:{$scalar:"undefined"},stack:["integerBreak"]},{site:1,line:3,kind:"check",label:"n === 2",state:{n:2},input:{n:2},heap:{},value:!0,stack:["integerBreak"]},{site:0,line:3,kind:"return",label:"return 1;",state:{n:2},input:{n:2},heap:{},value:1,stack:["integerBreak"]}]}],d={id:343,title:e,topic:n,code:t,sourceHash:a,generatorHash:i,fixtureHash:r,examples:l};export{t as code,d as default,l as examples,r as fixtureHash,i as generatorHash,s as id,a as sourceHash,e as title,n as topic};
