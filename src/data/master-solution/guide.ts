export interface PatternGuide { remember: string; watchFor: string }

// Rules are deliberately separate from problem names: each is the reason the
// corresponding state update works, followed by the variation most easily lost.
const rows = `
A01|Keep a clear boundary between input already read and output already written.|A logical output length is different from allocating a new array; never overwrite unread input.
A02|A set answers whether a fact is already known; the meaning of that fact determines when to insert.|A visited value, a row constraint, and the beginning of a consecutive run need different membership checks.
A03|Choose a key that represents exactly what makes records belong together.|A character set loses multiplicity. Grouped timestamp histories must preserve order within each key.
A04|Look for the missing partner among earlier records before recording the current one.|Inserting first can accidentally reuse the same item. Store indices when the answer needs positions.
A05|Hash to a bucket, then resolve collisions inside that bucket.|Hashing does not guarantee unique positions. Updates must replace an existing key rather than duplicate it.
A06|Cancel competing votes; a sufficiently frequent candidate survives cancellation.|The more-than-half problem guarantees a winner. The more-than-one-third version requires two candidates and a verification pass.
A07|The heap prefix exposes its maximum while the sorted suffix grows from the right.|Bottom-up heap construction and repeated extraction are separate phases; shrink the sift-down boundary after each extraction.
A08|Maintain smaller, equal, unknown, and larger regions while inspecting one unknown item.|After swapping from the far end, inspect the incoming item. Quickselect searches only the partition containing the desired rank.
A09|Use frequency itself as a bucket index, then visit buckets from largest to smallest.|This is a count-bucket scan, not a heap. Stop after collecting k distinct values.
A10|A length tells the decoder exactly how many following characters belong to one field.|Splitting on a delimiter fails when that delimiter appears inside data. Empty fields still need a length.
A11|A prefix rectangle lets you remove the unwanted top and left areas and add their overlap back.|Padding removes boundary special cases. Coordinates in the input and prefix matrix differ by one.
A12|At each index, combine everything strictly before it with everything strictly after it.|Including the current value or dividing by it breaks the requirement, especially when zeros occur.
A13|A subarray sum equals the difference between two prefix sums.|Count earlier equal prefixes, including the empty prefix. Negative values invalidate the usual positive-sum sliding window.
A14|Put each valid positive value in its own index slot, then find the first incorrect slot.|Ignore out-of-range values and stop when the destination already contains the same value.
A15|Unlimited transactions allow every positive adjacent increase to contribute.|The same rule is invalid when only one transaction or an extra transaction cost is allowed.
P01|Compare or exchange symmetric endpoints and move toward the center.|Skipping nonletters, allowing one deletion, and rotating by three reversals are separate variations.
P02|Choose the next output item without losing either input's unread remainder.|Merging into spare array capacity must run backward; a linked-list merge reconnects nodes instead of copying values.
P03|Sorted order proves which endpoint cannot participate in a solution.|When fixing extra values for triples or quadruples, skip duplicates at every relevant level.
P04|The limiting boundary determines which side can be processed or discarded.|Container area and trapped volume have different formulas. Trapped water needs running boundary maxima.
P05|The heaviest remaining item must be assigned now; pair it with the lightest if possible.|Both successful pairs and unpaired heavy items consume one resource. Equality with the limit is allowed.
W01|Every arriving item has a corresponding departure once it leaves the allowed history.|A fixed-length character window needs exact counts; nearby duplicates use an index-distance bound.
W02|Expand the right end and repair the condition that prevents a longer answer.|The replacement variant uses a historical maximum and a length-only invariant; its retained window need not always be valid.
W03|Once requirements are satisfied, record the answer before removing from the left.|Minimum cover preserves required multiplicities. A sum-based version relies on positive input values.
W04|Keep unexpired candidates in decreasing value order; the front is the maximum.|Indices determine expiration. Remove dominated candidates from the back, not from the front.
W05|Compare today's sale with the cheapest purchase seen so far.|This allows one transaction, unlike summing every profitable rise.
S01|The stack holds the history or operands needed by the next instruction.|Postfix evaluation consumes right then left; score-history addition reads earlier scores without consuming them.
S02|Save the outer context before entering nested syntax and restore it when that syntax closes.|Matching bracket types, multi-digit repeat counts, and resetting the inner context all matter.
S03|Resolve a conflict against the latest unresolved item until no conflict remains.|Only opposite-facing asteroids collide. Parent-directory navigation cannot pop past the root.
S04|Reordering with the permitted operations makes one access discipline behave like another.|Queue-only stacks cannot secretly pop the back. A two-stack queue transfers only when its output stack is empty.
S05|Each stack depth stores the aggregate needed if that depth becomes the top again.|Duplicate minima need their own saved state; pop the aggregate and value together.
S06|An arriving item resolves earlier candidates whose ordering condition no longer holds.|Strictness differs between warmer temperatures and spans. Histogram bars need a left boundary and a final flush.
S07|Frequency chooses a bucket; order inside that bucket resolves ties.|Most-frequent stack pops use latest arrival, while LFU eviction uses oldest access within the minimum frequency.
S08|Process the nearest vehicle first so the fleet directly ahead is already known.|A following vehicle that arrives no later joins that fleet; it cannot pass through it.
B01|Define the boundary being searched before choosing the comparison and interval convention.|Exact match, first greater-or-equal, last less-or-equal, and the best length-k window are different predicates.
B02|A monotone feasibility check lets you search for the first working answer.|Choose valid lower and upper bounds. Loading and partitioning checks must preserve input order.
B03|Use the ordered half to prove where the target can lie.|Duplicates may hide which half is ordered; skipping an ambiguous endpoint can make worst-case work linear.
B04|Balance the partition sizes, then make every left-side value no greater than every right-side value.|Search the shorter array and use sentinel bounds for empty partitions. Both cross-boundary comparisons are required.
B05|Find the peak by comparing neighbors, then search each side with its own ordering.|Search the increasing side first when the smallest matching index is required; account for the restricted get API.
L01|Save the next pointer before rewiring, then reconnect the reversed section to both neighbors.|Check that a full group exists before changing its links. Head changes are easier with a dummy node.
L02|The distance or relative speed between pointers encodes the position you need.|A cycle meeting is not necessarily its entrance. Finding a middle and maintaining an n-node gap use different stopping rules.
L03|Each original object gets exactly one copied object, registered before wiring recursive references.|Equal values do not imply the same object. A visited set alone cannot provide the clone needed for an edge.
L04|Process corresponding digits with a carry and keep going until every input and the carry are exhausted.|Different input lengths and a final carry must not truncate the result.
L05|A head index and an explicit size distinguish empty from full in circular storage.|Modulo wraps positions; do not infer fullness from equal head and tail positions alone.
L06|Key lookup finds an item, and a separate ordering structure makes recency updates cheap.|A read changes recency too. LFU has a recency order inside each frequency bucket rather than one global LRU list.
T01|When you visit relative to the children determines preorder, inorder, or postorder.|A stack reverses push order. Reversing a collected traversal works for output order but not arbitrary bottom-up computations.
T02|Return the summary a parent needs, and keep a separate answer for paths or changes completed at this node.|A path passed upward can use only one branch. Check leaf removal after processing children, not before.
T03|Compare both value and shape at corresponding positions.|Matching root values is insufficient. Subtree search must try possible roots before applying full equality.
T04|Pass information about this ancestor path down to each child.|A global maximum mixes unrelated branches. BST bounds must include all ancestors and remain strict.
T05|Use the BST ordering to select a branch or find a successor.|Deletion with two children needs successor replacement and removal. Sorted inorder rank is different from tree depth.
T06|Capture the queue size before a level so newly enqueued children belong to the next level.|The rightmost result is the last node only when children are enqueued left to right.
T07|Preorder supplies the next root; its inorder position splits that root's two subtrees.|Preorder is root-left-right. Unique values permit the index map, and bounds avoid slicing subarrays.
T08|Encode missing children as well as values so the serialized shape is unambiguous.|The decoder must consume the same traversal grammar; null children are real tokens.
T09|Each subtree returns the best answer for taking its root and for skipping its root.|Taking a parent forces both children to be skipped. This remains DP even though the problem appears under Trees.
T10|Build four smaller regions and merge them only when their leaf values agree.|All four children must be leaves; equal values on internal nodes do not prove a uniform region.
H01|Retain k candidates, with the worst retained candidate at the heap root.|For the k largest values use a min-heap; for the k closest points evict the farthest retained point.
H02|Take the best eligible priority, update its remaining quantity, and reinsert when appropriate.|A temporarily blocked choice must be held out or replaced by the next choice; otherwise forbidden repetitions occur.
H03|Only the next item of each sorted stream can be the next global result.|After selecting a stream, advance just that stream. A heap and repeated candidate sorting have different costs.
H04|Sort eligibility events, move newly available work into a priority queue, and select by the required tie rules.|Jump time when nothing is available. Choosing a project can change which later projects are affordable.
H05|Keep an ordered lower half and upper half whose sizes differ by at most one.|Size balance alone is insufficient: every lower-half value must also be no greater than every upper-half value.
H06|Record changes at boundaries and reconstruct the active total with a running sum.|An ending event releases capacity at its endpoint. The displayed solution does not need a heap.
H07|The most frequent task determines repeated cooldown frames; tied maximum frequencies occupy the last frame.|Take the maximum of the frame bound and the number of tasks. This is a counting formula, not heap execution.
R01|A start index controls which choices remain and whether order matters.|Reuse the same index only when repetition is allowed; skip equal candidates at the same depth and copy saved paths.
R02|Track used positions while constructing an ordered arrangement, then undo both changes.|Duplicate values need a consistent order among equal positions; a value-only set loses distinct copies.
R03|Extend only prefixes whose counters or next-position choices remain legal.|Closing brackets cannot outnumber opening brackets. Position-specific alphabets are different from arbitrary permutations.
R04|Visited cells belong to the current candidate path, so restore them when that path returns.|Permanent marks would prevent another candidate from using the same cell later.
R05|Choose a valid next segment and recurse from its ending position.|The segment's own validity check is part of the work; do not partition first and assume every segment is valid.
R06|Place each item in one compatible bucket and undo unsuccessful placements.|Buckets with equal current sums are interchangeable at that depth; avoid exploring those equivalent placements twice.
R07|Keep occupancy sets that let you reject an attacked position immediately.|Restore columns and both diagonal identifiers after every attempted placement; counting solutions differs from saving boards.
R08|All ways to finish a suffix depend on its start position, so cache those completions.|Memoization does not eliminate the cost of constructing every output sentence. An empty completion is a valid base result.
TR01|A trie path represents a prefix; a separate terminal marker represents a stored word.|A successful prefix lookup must not make a shorter, unstored word appear present.
TR02|A literal follows one branch while a wildcard tries every character child.|Do not treat the terminal marker as another character, and require a terminal at the end of the query.
TR03|Carry a trie position through grid backtracking so impossible prefixes stop immediately.|Restore the board path, remove found terminals to avoid duplicates, and prune only exhausted trie branches.
TR04|For each prefix, choose between leaving its last character unused and finishing with a dictionary word.|The displayed implementation uses DP and a set, despite being listed in the Tries chapter.
G01|Sometimes local edge contributions or degrees answer the question without visiting paths.|Shared boundaries must not be double-counted; trust balance relies on the problem's distinct directed relationships.
G02|Lexicographic order is decided by the first differing character, or by length when one word is a prefix.|A longer word cannot precede its own prefix. Inferred constraints must not add edges for later differences.
G03|Mark a discovered state before scheduling it, then visit its reachable component once.|Count components by traversal starts, not by visited nodes; isolated vertices are components too.
G04|Put all sources in the initial queue before expanding equal-distance layers.|Starting a separate complete BFS from each source repeats work and can obscure simultaneous arrival times.
G05|The graph may be defined by allowed transformations rather than a stored edge list.|Generate only legal states, reject blocked states, and distinguish a distance in moves from a count of words.
G06|Search from the safe boundary or destination, reversing movement when necessary.|Pacific/Atlantic climbs in reverse and intersects two visited sets; surrounded regions preserves border-connected cells.
G07|A node becomes available only when all of its incoming prerequisites have been removed.|An ordinary visited set cannot replace indegrees. Include isolated nodes and detect cycles by unfinished nodes.
G08|In an undirected traversal, the edge back to the parent is expected; another discovered neighbor indicates a cycle.|Connectivity is a separate requirement. Testing removal of a candidate edge needs the correct exclusion and input-order tie rule.
G09|Reachability from one source is one row; all-pairs answers need all rows or an intermediate-vertex recurrence.|Do not reuse one global visited set across source searches. Floyd-Warshall keeps the intermediate vertex in the outer loop.
G10|Accumulate a product along equation edges and store the reciprocal relation too.|An unknown variable divided by itself is still unknown. These path weights multiply rather than add.
G11|Remove the current outer layer of leaves together to expose the next layer.|New leaves belong to the next round. Handle a single-node tree before applying the one-or-two-center stop rule.
G12|A representative identifies a component; union changes connectivity and path compression shortens future finds.|Only a successful merge reduces component count. Rank balancing and path compression are separate operations.
G13|Shared features can connect a whole group through one representative instead of every pair.|Emails are identities; prime factors require factorization. Duplicate input values can still be different graph vertices.
D01|With nonnegative edges, the smallest unsettled distance can be finalized next.|The heap can contain outdated entries. Marking an arbitrary weighted neighbor final when first enqueued is unsafe.
D02|A bottleneck path combines steps with max instead of addition, while competing paths are compared by min.|Edge-effort relaxation and the specialized vertex-elevation model have different discovery rules; do not interchange them blindly.
D03|One relaxation round may use only distances from the previous round.|Writing and reading the same array can chain several edges in one round and violate the stop limit.
D04|Consider edges by increasing cost and accept only connections between separate components.|BFS can test connectivity, but cost ordering is what makes this Kruskal. A shortest-path tree is a different objective.
D05|Compare the best spanning-tree cost with an edge excluded and with it forced.|Disconnected candidates have infinite cost, and answers must preserve original edge indices after sorting.
D06|Consume edges during exploration and append a vertex only after its outgoing edges are exhausted.|A visited-vertex set would lose repeated airports and duplicate tickets. Reverse the completed postorder route.
I01|Keep completed intervals separate from the current merged interval and extend overlap with the larger end.|Insertion starts with sorted disjoint intervals; general merging must sort first. Shared endpoints merge here.
I02|Sort by start, then either detect an overlap or remove one conflicting interval and retain the smaller end.|Touching endpoints are allowed. Keeping the larger end belongs to merging, not minimizing removals.
I03|The earliest release tells you whether an existing resource can be reused.|Delayed assignments preserve duration; available IDs and busy release times have different ordering and tie rules.
I04|Process queries in sorted order, adding eligible intervals and lazily discarding expired candidates.|Heap priority is interval size, while expiration uses the right endpoint. Restore the queries' original order.
`;

export const patternGuides: Record<string, PatternGuide> = Object.fromEntries(
  rows.trim().split('\n').map(row => {
    const [id, remember, watchFor] = row.split('|');
    return [id, { remember, watchFor }];
  }),
);

export const chapterStories: Record<string, string> = {
  'Arrays & Hashing': 'Manage package records, compare inventories, encode shipment labels, and answer totals without rescanning every shipment.',
  'Two Pointers': 'Combine route logs, pair loads, and work inward from route boundaries while preserving unread information.',
  'Sliding Window': 'Analyze recent delivery events: detect repetition, find the shortest complete event segment, and maintain recent maxima.',
  'Stack': 'Interpret delivery commands, undo history, process nested instructions, and resolve outstanding events.',
  'Binary Search': 'Search ordered histories and choose the smallest truck capacity or processing speed that meets a deadline.',
  'Linked List': 'Edit linked routes, copy their references, detect loops, and maintain route caches with explicit eviction rules.',
  'Trees': 'Inspect and edit a management hierarchy, compute summaries, and save or reconstruct its structure.',
  'Heap / Priority Queue': 'Select priority work, combine live streams, schedule arrivals, and maintain ranked load statistics.',
  'Backtracking': 'Enumerate package groups and route plans while enforcing constraints and undoing unsuccessful choices.',
  'Tries': 'Index destination labels and search exact names, prefixes, wildcard names, and names encoded in a warehouse grid.',
  'Graphs': 'Discover connected depots, spread alerts, clone networks, and order dependent delivery jobs.',
  'Advanced Graphs': 'Optimize route costs, connect depots cheaply, limit route length, and consume every delivery ticket.',
  'Intervals': 'Combine delivery windows, avoid conflicts, allocate loading bays, and answer time-window queries.',
};
