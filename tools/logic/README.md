# Logic practice data

Generate or check the interface-only practice assets:

```sh
node tools/logic/generate.cjs
node tools/logic/generate.cjs --check
python3 tools/logic/data.test.py
# With the checked-in Pyodide runtime available, use Node 22+:
node tools/logic/verify-runtime.mjs
```

The authoring process reads the NeetCode 250, curated descriptions, Python ASTs,
and existing walkthrough fixtures. Published data contains problem statements,
two examples, public function/method signatures, `pass` stubs, and practice
input/output cases. It contains no reference implementation, algorithm imports,
helper methods, solution-local variable names, ordered solution steps, traces,
or preferred next action. The generator and tests enforce a field allowlist and
check that every stub body consists only of `pass`.

All 250 problems have their existing normal/edge cases. Design problems preserve
constructors and public operations; Codec problems preserve both roundtrip
methods. The generic builder can use these interfaces without loading the
reference algorithm. Static content is requested per problem from a versioned
directory; only the small metadata manifest loads initially.

The suite adds 76 distinct counterexamples to 18 early problems. Their expected
values come from simple exhaustive oracles in `adversarial.py`, independently
of the reference solutions. Tests establish that these cases distinguish eight
common mistakes, including reusing a Two Sum index, losing anagram counts,
missing binary-search endpoints, permitting a sale before purchase, allowing
multiple stock transactions, allowing an empty maximum subarray, and dividing
by zero in product-except-self. This is practice feedback, not a replica of
LeetCode's private judge or proof of correctness for every valid input.

The runtime audit executes all 250 reference implementations against all 670
practice cases in the actual WebAssembly CPython runtime. It also requires
eight intentionally incorrect programs to fail and accepts a brute-force Two
Sum implementation with reversed valid indices and a linear-search alternative.
This tests execution and feedback independently of the preferred solution text.
The report is written to `/tmp/logic-reference-wasm-report.json`.

The original walkthrough fixture fields are preserved for the runtime adapter:
`entry`, `params`, `args`, `expected`, optional design `operations`, mutation
`resultArg`/`prefix`, structure `output`/`nodeArgs`/`distinctClone`, `roundtrip`,
`pick`, and `compare`. `prefix` is an expected array, not a boolean. The runtime
must accept semantically valid alternate answers rather than require one output
ordering or one implementation.

## Learning design review

The learner should choose state, conditions, operations, loop bounds, ordering,
and returned values. A small syntax palette can reduce typing while preserving
those decisions. It should be generic across problems, show no recommended next
step, and allow valid alternatives and meaningful wrong programs. A palette
made from the specific reference solution would instead reveal much of the
reasoning task. This is a design assessment, not a measured learning result.

Execution feedback should identify an actual counterexample or exception and
let the learner inspect their own state. Passing these visible cases should not
automatically mark an algorithm mastered. A voluntary explanation of why a
boundary case works, or a later attempt on a fresh instance, can test more than
recognition without adding a compulsory second mode.

Research supports restraint in efficacy claims. A study of optional Parsons
scaffolding found faster completion in a classroom sample of 81 students but
no significant pretest-to-posttest learning gain in either condition. The
present generic builder differs from Parsons ordering exercises, so that
finding does not directly establish its effects. See Hou, Ericson, and Wang,
[Using Adaptive Parsons Problems to Scaffold Write-Code Problems](https://doi.org/10.1145/3501385.3543977), ICER 2022.

Retrieval practice improved delayed retention in experiments using prose
passages. That supports considering voluntary later reconstruction, but it does
not prove transfer to independent algorithm design in this app. See Roediger
and Karpicke, [Test-Enhanced Learning](https://doi.org/10.1111/j.1467-9280.2006.01693.x),
Psychological Science, 2006.

To measure usefulness, compare independent code-writing on an unseen but
related problem immediately and after a delay; count solution reveals and
test-driven edits separately. Completion speed, taps, or same-session green
checks alone cannot establish retention or transfer.

## Browser evaluation, 7 November 2026

A production build was exercised in isolated Chrome at 390 × 844 and desktop
widths, using the visible controls. No reference solution was loaded during
practice. Five complete solutions were built without keyboard input:

| Exercise | Construction taps, including category switches | Practice cases passed |
| --- | ---: | ---: |
| Two Sum | 9 | 6 |
| Contains Duplicate | 12 | 7 |
| Valid Anagram, sorting comparison | 2 | 7 |
| Binary Search | 27 | 9 |
| Stock profit | 11 | 9 |

These are experienced-tester interaction counts, not novice completion times or
learning scores. The short Anagram solution especially demonstrates recognition
of an available operation; it is not evidence of independent algorithm mastery.
Advanced expressions may still require custom editing. All 250 problems have
interfaces and execution cases; tap-only coverage is not claimed for every
possible implementation.

Moving the Two Sum store before its lookup produced `[0, 0]` and failed three
of six cases. Moving Contains Duplicate's final return inside its loop failed
four of seven. The UI allowed both mistakes and exposed actual inputs, results,
and source-linked locals. Editing, block movement, token replacement, undo,
draft restoration, method selection, light/dark themes, mobile width, and
search were exercised. A follow-up run tested a missing runtime download,
retry, Stop during an infinite loop, and a successful new run.

Review found and fixed generated Python annotation frames leaking into traces,
misleading collection representations, missing operation sequences for design
cases, code separated from the debugger on phones, duplicate action choices,
and a category-change race that could collapse newly opened statement options.
The current statement is repeated beside the debugger variables so stepping
never requires scrolling back to the editor to identify the line.

The production dashboard loads 254,594 gzip bytes of JavaScript (about 0.1KiB
more than before this feature). Direct practice entry loads 272,796 gzip bytes
of JavaScript plus one small problem document. Neither path loads the Python
runtime, a solution document, or prerecorded execution traces. Python assets
are requested only on Run. Local cold runs took about 1.3 seconds including UI
interaction; network and device speed affect first-run time.

Reproduce browser checks with Playwright installed and Chrome available:

```sh
LEETCODE_TEST_URL=http://127.0.0.1:5181/leetcode/ node tools/logic/browser-audit.cjs
LEETCODE_TEST_URL=http://127.0.0.1:5181/leetcode/ node tools/logic/browser-runtime-errors.cjs
```
