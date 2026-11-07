# Python practice execution

`createPythonRunner()` creates no worker or network request. The first `run()`
starts a module Worker and loads the pinned, self-hosted Pyodide **314.0.7**
runtime (CPython **3.14.2**). The core files, licenses, source URLs, and SHA-256
digests are in `public/vendor/pyodide/314.0.7/manifest.json`. They total
**13,561,736 bytes**; no package CDN or API server is needed at runtime.

Successful runs retain the initialized worker. Each run gets a fresh runner
namespace, and every practice case executes the submitted code in fresh globals.
The Pyodide `js` module receives an empty globals object. This separates the
learning program from the page; it is not a security sandbox for hostile code.

`stop()`, a loading failure, or a timeout terminates the worker and rejects the
pending promise. A subsequent run creates a new worker. Loading has a 45-second
timeout; execution has an independent 8-second supervisor timeout. Each practice
case also has a 500,000-event budget and a 2-second Python tracing budget. The
supervisor still works if submitted code disables tracing or enters a long
native operation.

`pythonRunner.py` uses the node constructors and fixture conversions from the
canonical walkthrough adapter, loaded through `?raw`. No reference solution
body is shipped by this runner. The code supports all 250 NeetCode fixture
contracts, including design-class operation sequences, in-place arrays, trees,
linked lists, graph clones, quadtrees, `MountainArray`, and the `guess` API.

Results include expected and actual output, failures with source line numbers,
bounded printed output, and actual execution traces. Statement snapshots show
values **after** the highlighted line. Calls and returns are explicit. Trace
frames must correspond to actual AST-defined functions, so CPython 3.14's
generated annotation functions never appear. A trace stores its first 159
frames plus the latest frame when it exceeds 160; `traceTruncated` communicates
that gap. Limiting displayed frames never disables execution limits.

Practice comparison accepts valid alternative outputs where the problem permits
them: either Two Sum pair order (with distinct in-range indices), topological
orders, optimal palindromes, tied closest points and frequent values, reordered
groups, and other fixture-specific comparisons. These are practice cases, not
LeetCode's full hidden judge suite. Additional Python packages are not installed
automatically; the mode provides the bundled standard library.

Validation:

- `npm run logic:test` includes worker lifecycle and real Python execution tests.
- `node tools/logic/verify-runtime.mjs` independently runs all 250 original
  reference solutions against all 670 practice cases in actual Pyodide, and
  checks common incorrect implementations and valid alternative approaches.

Pyodide's official documentation describes the [module Worker requirement](https://pyodide.org/en/stable/usage/webworker.html)
and [self-hosted core files](https://pyodide.org/en/stable/usage/downloading-and-deploying.html).

# Completed guided solutions

`GuidedCodeRunner` is mounted only after the guided questions finish. It shows
the completed source through the shared syntax highlighter and waits for an
explicit Run. The component selects the Python or JavaScript runner according
to the lesson language; changing the lesson, source, or language disposes the
previous worker and clears stale results. Design-class cases show each call
beside its expected and actual output.

JavaScript uses `createJavaScriptRunner()` and a module Worker loaded on Run.
The lesson includes instrumentation generated from its exact source by the
canonical Babel instrumenter during the build. The browser receives prepared
code and source locations, without Babel or Node dependencies. It executes the
code afresh on each Run; displayed trace frames are not prerecorded results.
The worker evaluates source in a fresh function for every fixture. It is for
the completed lesson source and is not a hostile-code sandbox.

`javascriptAdapter.generated.ts` is generated from the canonical node/input/
invocation helpers by `tools/logic/generate-javascript-adapter.cjs`. Run that
script with `--check` in build validation. The browser adds checks against
cyclic returned structures and accepts arbitrary remaining-prefix order for
Remove Element. `javascriptValidation.ts` handles valid alternative answers
and is also usable by the lesson generator when checking wrong choices.

JavaScript has the same 160-frame display cap, independent 500,000-event and
2-second per-case budgets, and an 8-second worker supervisor timeout. Stop,
errors, and timeouts permit a fresh-worker retry. Traces show exact original
source expressions, completed statement state, call stacks, and condition
results. An exception includes its actual message and partial trace; it omits
the line number when a mapping to the original source cannot be proven.

`node tools/logic/verify-javascript-runtime.cjs` executes all 250 JavaScript
reference solutions against the 670 practice cases and verifies every saved
frame's source location. Focused tests cover real execution, semantically
valid alternatives, incorrect Two Sum logic, trace limits, Stop/timeout/retry,
and the completion component's lazy behavior.
