# Logic practice data

## Guided Python and JavaScript practice

The default `/practice/:id` flow covers all 250 NeetCode problems in both
languages. Each lesson starts with eight pattern choices, followed by a short
sequence of focused structure questions, then implementation decisions through
the end of the solution. Each structure question offers three short text choices
about one decision. Most problems need two to four planning decisions; a single
operation can need only one.
Related operations can share a code-block question; there is no question-count
cap that can cut off the later steps. Incorrect choices stay on
the question with feedback; correct choices advance immediately. Previous step
returns to an earlier decision, Skip step advances without marking it correct,
and an already answered card offers Next step. These controls stay outside the
answer card. Skipped decisions are saved separately during an unfinished
walkthrough and can be answered later, including by going back from the end
in the same session. Completion reports
answered and skipped counts separately. The approach
is specific to the worked solution, and the UI acknowledges that other
algorithms can be valid. Pattern feedback does not reveal the next plan.
Structure cards do not display a complete plan, pseudocode outline, or future
questions. Feedback explains only the current decision. Reveal solution remains
an explicit way to inspect the full solution. Implementation prompts identify
the concrete value, test, or operation being chosen; correct feedback states
what that code actually does instead of generic claims about updating state.

The bottom Previous problem and Next problem links share the library ordering
in `src/data/logic/order.ts`: common topics first, then 1-D/2-D dynamic
programming, Math & Geometry, and Bit Manipulation as a combined group. Each
group sorts by difficulty and numeric problem ID. Links keep the selected
language and stop at the first and last problem.

Curated solutions include visible meanings for the symbols in their time and
space estimates. The two `src/data/solutions/complexity-variables-{head,tail}.ts`
banks cover the NeetCode 250. `withComplexityVariables` attaches definitions to
the selected implementation and follow-up after source overrides, checking
every symbol in each language's formulas and calculation breakdowns. These
definitions travel in each lazy solution document, so editing them requires
`npm run solutions:generate`; the complete legend bank is not loaded by the
practice library.

Implementation distractors are source mutations with independently replayed
counterexamples. The learner can inspect input, expected output, and the actual
result or exception. These are individual substitutions into the reference
implementation. They are not an unrestricted judge of alternate whole programs.
Choices test state, conditions, updates, and returned results. The coverage
checks inventory source operations and require finishing decisions, including
public design methods, rather than accepting a sampled prefix of the code.
Any provably unreachable defensive fallback is reported separately and shown
as context, not falsely counted as a tested decision. A return missing from the
available examples is not sufficient evidence that it is unreachable.
A bare early return can be tested through its direct guard in the same question:
the independent audit reparses the wrong program and requires restoring only
that guard to recover the original AST. This does not credit unrelated earlier
edits or ignored return-value changes. Standard supplied nodes, heap helpers,
and memoization declarations, plus proven redundant operations, are explicitly
listed as context rather than counted as tested logic decisions.

After the decisions, learners can run the finished code and step through real
source statements and variables. Both languages run in workers; JavaScript
uses build-time instrumentation and Python uses the existing WebAssembly
runtime. Neither worker runs before Run tests is pressed. Reveal solution is
available throughout, matches the selected language, and leaves progress intact.
Progress is saved separately for each problem and language, and invalidates
when lesson content changes. Reopening an unfinished lesson quizzes the approach
and every structure step again before resuming the saved implementation. After
reaching the end, the next visit starts a fresh attempt, including when some
decisions were skipped. Passing does not automatically mark mastery.

Only the requested lesson JSON, including its worked source, is downloaded;
the library does not fetch all 500 lessons. The separate solution explanation,
code renderer, and runtimes also load when needed. The
full LeetCode catalog remains separate from the 250-problem guided curriculum.
Existing Python drafts remain accessible from the problem details and at
`/practice/:id?draft=1`.

Useful checks (Node 22+ and Python 3):

```sh
npm run logic:test
npm run logic:guided:test
npm run logic:guided:check
npm run logic:guided:verify
npm run logic:javascript:verify
# Independent Python checks can use multiple hash seeds:
PYTHONHASHSEED=1 python3 -B tools/logic/verify-guided-python.py
# Production UI check with Playwright and Chrome installed:
LEETCODE_TEST_URL=http://127.0.0.1:5182/leetcode/ node tools/logic/browser-guided.cjs
# Focused previous/skip/next regression without running the code:
LEETCODE_TEST_URL=http://127.0.0.1:5182/leetcode/ node tools/logic/browser-guided.cjs --navigation-only
```

`generate-guided.cjs --check-artifacts` is a fast build guard for coverage,
source hashes, choices, curriculum, and content revision. The separate
`check-guided-coverage.cjs` audit parses every published source independently,
checks ordered code-block replay, and rejects missing executable lines or
finishing decisions. Supplied infrastructure and provably defensive lines are
reported separately from tested decisions. The full `--check`
executes the Python witnesses. `verify-guided-javascript.cjs` independently
executes JavaScript references and wrong choices using the browser runtime
adapter. Timeouts, recursion limits, and syntax/name errors are excluded as
proof that a choice is logically wrong. Runtime acceptance includes valid
unordered or nonunique outputs where the problem permits them.

The focused structure curriculum is authored in the three
`guided-structure-steps-{head,middle,tail}.json` banks, with language-specific
plans in `guided-structure-steps-javascript.json`. `guided-patterns.json` explains
the pattern choices; the reviewed TSV plans identify each source algorithm. Source audit hashes
in `guided-source-audit.json` require re-review when an algorithm changes.
`guided-quality-overrides.json` contains reviewed implementation choices with
replayed counterexamples; `guided-feedback.json` supplies focused
explanations for selected correct choices without changing their code.
`curriculum.test.cjs` checks all 500 language-specific lesson metadata records,
source hashes, focused choice counts, algorithm differences, and answer leaks.
For wording or planning edits, `node tools/logic/generate-guided.cjs --reuse-published`
reuses the verified implementation code and witnesses. No mutation search is
needed when those behaviors are unchanged. To regenerate executable choices, export inputs with
`node tools/logic/generate-guided.cjs --input-only`, generate the JavaScript
cache with `node tools/logic/generate-guided-javascript.cjs`, audit/repair that
cache with `node tools/logic/verify-guided-javascript.cjs
/tmp/leetcode-guided-js.json --repair`, then run
`node tools/logic/generate-curriculum.cjs` and
`node tools/logic/generate-guided.cjs`. Run the full audits before publishing.
The checked-in validation summary records the current revision and counts.

Browser checks exercise wrong and correct choices, reload and language
switching, reveal and failed-download recovery, real runs and debugger steps,
restart, and mobile/desktop layouts. Navigation checks in both languages cover
all stage boundaries, persisted skips, returning from completion, truthful answer
counts, cleared feedback, and mobile touch targets without loading a runtime.
These checks establish that the learning
flow works; they do not measure long-term retention or independent coding skill.

## Interface-only legacy draft data

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

The suite adds 136 additional cases across 62 problems. Their expected
values come from simple exhaustive oracles or directly checked edge cases in
`adversarial.py`, independently of the reference solutions. Tests establish that these cases distinguish eight
common mistakes, including reusing a Two Sum index, losing anagram counts,
missing binary-search endpoints, permitting a sale before purchase, allowing
multiple stock transactions, allowing an empty maximum subarray, and dividing
by zero in product-except-self. This is practice feedback, not a replica of
LeetCode's private judge or proof of correctness for every valid input.

The runtime audit executes all 250 reference implementations against all 730
practice cases in the actual WebAssembly CPython runtime. It also requires
eight intentionally incorrect programs to fail and accepts a brute-force Two
Sum implementation with reversed valid indices and a linear-search alternative.
Daily Temperatures also has cases for equal temperatures, no warmer day,
a single day, and resolving several pending indices. Their expected results
come from a straightforward suffix scan independent of the stack algorithm.
This tests execution and feedback independently of the preferred solution text.
The report is written to `/tmp/logic-reference-wasm-report.json`.

The original walkthrough fixture fields are preserved for the runtime adapter:
`entry`, `params`, `args`, `expected`, optional design `operations`, mutation
`resultArg`/`prefix`, structure `output`/`nodeArgs`/`distinctClone`, `roundtrip`,
`pick`, and `compare`. `prefix` is an expected array, not a boolean. The runtime
must accept semantically valid alternate answers rather than require one output
ordering or one implementation.

## Earlier free-form builder design review

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

## Earlier free-form builder browser evaluation, 7 November 2026

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
