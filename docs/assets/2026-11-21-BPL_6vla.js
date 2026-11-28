const a=3331,e="2026-11-21",n={kind:"same-approach",summary:"Same postorder tree traversal; your solution copies ancestor maps instead of restoring per-letter stacks.",details:["Both traverse the original tree, find the nearest ancestor with the same character, and add the completed subtree size to that ancestor or the original parent.","Your DFS computes newParent before setting last for the current node, then passes new Map(last) to each child. It does not need to undo changes on return.","The existing Python and TypeScript maintain a stack of ancestors for each character, push before visiting children, use the previous stack entry as the new parent, and pop on return.","Both take O(n) time and O(n) space with the fixed 26-letter alphabet. The map-copy version has larger constant overhead. No JavaScript implementation was saved."]},t=[{title:"Recursive DFS with copied ancestor maps",code:`var findSubtreeSizes = function(parent, s) {
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
};`,approach:"Traverse the original tree while remembering the closest ancestor for each letter. Give each child its own copy of that map so visiting one child does not change the ancestors seen by another. After finishing a node’s children, add its completed subtree size to the closest same-letter ancestor, or to its original parent if none exists.",timeComplexity:"O(n) for the fixed alphabet",spaceComplexity:"O(n)",variables:{n:"Number of nodes in the tree."},example:'findSubtreeSizes([-1,0,0,1,1,1], "abaabc") → [6,3,1,1,1,1]',notes:["This is the selected recursive version. A path-shaped tree with 100,000 nodes can exceed JavaScript’s recursion limit; use an iterative version if the runtime rejects deep recursion."],intuition:"Every node chooses its new parent from its ancestors in the original tree, and all choices happen simultaneously. An original-tree DFS can remember the nearest ancestor for each letter. Once a node’s descendants have been processed, send its accumulated size directly to its chosen parent. That parent is an original ancestor, so its own DFS call has not finished yet.",hints:["The ancestor search must use the original tree. How can a DFS remember the nearest ancestor with each letter?","Choose the new parent before recording the current node in the ancestor map. Give sibling branches separate map copies.","Process descendants first, then add the node’s completed size to its chosen parent. A descendant that moves past this node should contribute directly to the higher ancestor."],pseudocode:{concept:"Find parents using original ancestors, then accumulate sizes in postorder into the chosen parents.",steps:["Build child lists from the original parent array.","Give every node an initial size of one for itself.","At a node, choose the nearest same-letter ancestor from the incoming map; if none exists, keep its original parent.","Record the current node as the nearest ancestor with its letter.","Visit each original child with a separate copy of the current ancestor map.","After all children finish, add this node’s accumulated size to its chosen parent, unless it is the root.","Start the traversal at the root with an empty map and return the size array."]},explanation:`1. The child lists never change, so each DFS path describes original ancestry. Looking up the letter before inserting the current node prevents the node from choosing itself.
2. The map holds only the closest ancestor for each letter. Copying it for each child prevents changes in one sibling branch from affecting another.
3. Each node begins with size one. A descendant adds its size directly to the parent it chose; if it skips over the current node, it is correctly excluded from that node’s final size.
4. Postorder processing ensures all contributions destined for a node have arrived before that node forwards its total. Its new parent is an original ancestor, whose call is still active.
5. Each non-root node forwards its total once, so the final array gives subtree sizes in the modified tree without rebuilding that tree. The copied maps contain at most one entry per letter; the recursive version still needs stack space proportional to tree depth.`,timeComplexityBreakdown:{variables:"n is the number of tree nodes. A is the number of possible letters; A = 26 for this problem.",phases:[{label:"Allocate child lists and initialize sizes",cost:"O(n)"},{label:"Build the original tree from n - 1 parent edges",cost:"O(n)"},{label:"Visit every node and perform ancestor lookups and size additions",cost:"O(n)"},{label:"Copy an ancestor map of at most A entries for each of n - 1 child calls",cost:"O(nA)"}],simplifications:["O(n + n + n + nA)","O(nA)","O(n) when A = 26"],note:"The map size depends on the alphabet, not the tree depth: it holds only the nearest node for each letter. Recursion can still reach n calls on a path-shaped tree."},walkthrough:`Input: parent = [-1, 0, 0, 1, 1, 1], s = "abaabc"
Node letters: 0:a, 1:b, 2:a, 3:a, 4:b, 5:c
n = 6; kids = [[], [], [], [], [], []]
size = [1, 1, 1, 1, 1, 1]  (each node counts itself)

Build iteration: node = 1, 1 < 6 -> true
  parent[1] = 0
  kids[0].push(1) -> [[1], [], [], [], [], []]
  node++: 1 -> 2

Build iteration: node = 2, 2 < 6 -> true
  parent[2] = 0
  kids[0].push(2) -> [[1, 2], [], [], [], [], []]
  node++: 2 -> 3

Build iteration: node = 3, 3 < 6 -> true
  parent[3] = 1
  kids[1].push(3) -> [[1, 2], [3], [], [], [], []]
  node++: 3 -> 4

Build iteration: node = 4, 4 < 6 -> true
  parent[4] = 1
  kids[1].push(4) -> [[1, 2], [3, 4], [], [], [], []]
  node++: 4 -> 5

Build iteration: node = 5, 5 < 6 -> true
  parent[5] = 1
  kids[1].push(5) -> [[1, 2], [3, 4, 5], [], [], [], []]
  node++: 5 -> 6

Build check: 6 < 6 -> false. Keep these original child lists.

Call 1: dfs(0, {})
  char = s[0] = "a"
  newParent = parent[0] = -1
  last.has("a") -> false
  last.set("a", 0) -> {"a": 0}
  kids[0] = [1, 2]
  Copy last for child 1: {"a": 0}

Call 2: dfs(1, {"a": 0})
  char = s[1] = "b"
  newParent = parent[1] = 0
  last.has("b") -> false
  last.set("b", 1) -> {"a": 0, "b": 1}
  kids[1] = [3, 4, 5]
  Copy last for child 3: {"a": 0, "b": 1}

Call 3: dfs(3, {"a": 0, "b": 1})
  char = s[3] = "a"
  newParent = parent[3] = 1
  last.has("a") -> true
  newParent = last.get("a") = 0
  last.set("a", 3) -> {"a": 3, "b": 1}
  kids[3] = []
  All children finished.
  newParent !== -1: 0 !== -1 -> true
  size[0] += size[3]: 1 + 1 = 2
  size = [2, 1, 1, 1, 1, 1]
Return from call 3 (node 3).

Resume call 2 (node 1) after child 3:
  Parent call still has last = {"a": 0, "b": 1}
  size = [2, 1, 1, 1, 1, 1]
  Copy last for child 4: {"a": 0, "b": 1}

Call 4: dfs(4, {"a": 0, "b": 1})
  char = s[4] = "b"
  newParent = parent[4] = 1
  last.has("b") -> true
  newParent = last.get("b") = 1
  last.set("b", 4) -> {"a": 0, "b": 4}
  kids[4] = []
  All children finished.
  newParent !== -1: 1 !== -1 -> true
  size[1] += size[4]: 1 + 1 = 2
  size = [2, 2, 1, 1, 1, 1]
Return from call 4 (node 4).

Resume call 2 (node 1) after child 4:
  Parent call still has last = {"a": 0, "b": 1}
  size = [2, 2, 1, 1, 1, 1]
  Copy last for child 5: {"a": 0, "b": 1}

Call 5: dfs(5, {"a": 0, "b": 1})
  char = s[5] = "c"
  newParent = parent[5] = 1
  last.has("c") -> false
  last.set("c", 5) -> {"a": 0, "b": 1, "c": 5}
  kids[5] = []
  All children finished.
  newParent !== -1: 1 !== -1 -> true
  size[1] += size[5]: 2 + 1 = 3
  size = [2, 3, 1, 1, 1, 1]
Return from call 5 (node 5).

Resume call 2 (node 1) after child 5:
  Parent call still has last = {"a": 0, "b": 1}
  size = [2, 3, 1, 1, 1, 1]
  All children finished.
  newParent !== -1: 0 !== -1 -> true
  size[0] += size[1]: 2 + 3 = 5
  size = [5, 3, 1, 1, 1, 1]
Return from call 2 (node 1).

Resume call 1 (node 0) after child 1:
  Parent call still has last = {"a": 0}
  size = [5, 3, 1, 1, 1, 1]
  Copy last for child 2: {"a": 0}

Call 6: dfs(2, {"a": 0})
  char = s[2] = "a"
  newParent = parent[2] = 0
  last.has("a") -> true
  newParent = last.get("a") = 0
  last.set("a", 2) -> {"a": 2}
  kids[2] = []
  All children finished.
  newParent !== -1: 0 !== -1 -> true
  size[0] += size[2]: 5 + 1 = 6
  size = [6, 3, 1, 1, 1, 1]
Return from call 6 (node 2).

Resume call 1 (node 0) after child 2:
  Parent call still has last = {"a": 0}
  size = [6, 3, 1, 1, 1, 1]
  All children finished.
  newParent !== -1: -1 !== -1 -> false
  Root has no parent; no size addition.
Return from call 1 (node 0).

Return size = [6, 3, 1, 1, 1, 1]
Node 3 moves from parent 1 to ancestor 0.
Node 1 counts itself plus nodes 4 and 5: 1 + 1 + 1 = 3.
Root 0 still contains all 6 nodes.`}],s={id:3331,date:e,comparison:n,solutions:t};export{n as comparison,e as date,s as default,a as id,t as solutions};
