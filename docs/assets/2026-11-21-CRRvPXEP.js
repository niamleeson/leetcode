const s=3331,e="2026-11-21",t={kind:"same-approach",summary:"Same postorder tree traversal; your solution copies ancestor maps instead of restoring per-letter stacks.",details:["Both traverse the original tree, find the nearest ancestor with the same character, and add the completed subtree size to that ancestor or the original parent.","Your DFS computes newParent before setting last for the current node, then passes new Map(last) to each child. It does not need to undo changes on return.","The existing Python and TypeScript maintain a stack of ancestors for each character, push before visiting children, use the previous stack entry as the new parent, and pop on return.","Both take O(n) time and O(n) space with the fixed 26-letter alphabet. The map-copy version has larger constant overhead. No JavaScript implementation was saved."]},n=[{title:"Recursive DFS with copied ancestor maps",code:`var findSubtreeSizes = function(parent, s) {
    const n = parent.length;
    const kids = Array.from({ length: n }, () => []);
    const size = new Array(n).fill(1);

    for (let node = 1; node < n; node++) {
        kids[parent[node]].push(node);
    }

    function dfs(node, last) {
        const char = s[node];
        let newParent = parent[node];

        if (last.has(char)) {
            newParent = last.get(char);
        }

        // This map belongs only to the current recursive call.
        last.set(char, node);

        for (const child of kids[node]) {
            dfs(child, new Map(last));
        }

        // Add this completed subtree to its parent in the MODIFIED tree.
        if (newParent !== -1) {
            size[newParent] += size[node];
        }
    }

    dfs(0, new Map());
    return size;
};`,approach:"Traverse the original tree while remembering the closest ancestor for each letter. Give each child its own copy of that map so visiting one child does not change the ancestors seen by another. After finishing a node’s children, add its completed subtree size to the closest same-letter ancestor, or to its original parent if none exists.",timeComplexity:"O(n) for the fixed alphabet",spaceComplexity:"O(n)",variables:{n:"Number of nodes in the tree."},example:'findSubtreeSizes([-1,0,0,1,1,1], "abaabc") → [6,3,1,1,1,1]',notes:["This is the selected recursive version. A path-shaped tree with 100,000 nodes can exceed JavaScript’s recursion limit; use an iterative version if the runtime rejects deep recursion."]}],a={id:3331,date:e,comparison:t,solutions:n};export{t as comparison,e as date,a as default,s as id,n as solutions};
