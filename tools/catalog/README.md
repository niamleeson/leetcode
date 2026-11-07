# Complete local LeetCode catalog

The checked-in official snapshot contains all 4,101 numbered LeetCode problems
returned by the public GraphQL question list on November 7, 2026. The root
category and `all-code-essentials` reported the same total. Database, JavaScript,
shell, concurrency, and premium questions are included.

`official-snapshot.json` records the original IDs, slugs, difficulty, premium
flags, and topic tags. `sources.json` pins the exact public source commits.
Imported content is generated once and committed; production builds never fetch
LeetCode or a third-party repository.

To regenerate, extract the pinned GitHub source archives into one directory
using the directory names in `sources.json`, then run:

```sh
python3 tools/catalog/import.py --sources-dir /path/to/extracted-sources
python3 tools/catalog/import.test.py
node tools/catalog/check-catalog.cjs
```

The importer uses each doocs entry's first approach and its populated code
blocks. Empty implementations are filled from walkccc, then from kamyu's C++
sources. Raw kamyu Python 2 code is never labeled Python 3. A fallback is marked
as an alternative implementation when its algorithm may differ from the
upstream approach discussion. Fourteen new explanation entries document the
selected implementation directly, with independent validation notes kept in
the authored JSON files.

Documents live in `public/catalog/<content-revision>/<id>.json`. The revision is
the hash of all document content and metadata. Only lightweight metadata ships
in the initial application bundle; the browser requests problem content when
the reader opens it. Existing curated problems and solutions take precedence.
The original official tags remain available as `sourceTopics`, alongside study
topic names used by the app.

Every document contains source and license links. The full CC BY-SA 4.0 and MIT
notices are shipped in `public/catalog/licenses`. Imported/adapted doocs material
and the original explanatory additions are distributed under CC BY-SA 4.0;
MIT fallback source retains its original license and notices. The app code is
separate from these attributed content documents.

The coverage check compares exact official ID sets, verifies every local
statement/explanation/implementation, rejects placeholders and unsafe statement
markup, parses JavaScript/TypeScript source, and checks the content revision.
Python source is parsed by the importer. These are structural completeness and
syntax checks; they are not a claim that thousands of solutions have been run
against LeetCode's private judge tests.
