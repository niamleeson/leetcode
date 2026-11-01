import type { ReactChallenge } from './types';

const irvineReport = 'https://www.jointaro.com/interviews/companies/anduril/experiences/front-end-software-engineer-irvine-ca-may-1-2021-no-offer-neutral-96bace18/';

export const andurilBasicChallenges: ReactChallenge[] = [
  {
    collection: 'Anduril',
    kind: 'coding',
    slug: 'anduril-file-explorer',
    title: 'Expandable File Explorer',
    difficulty: 'Medium',
    topics: ['Recursion', 'Trees', 'Shared state'],
    sourceUrl: 'https://www.teamblind.com/post/anduril-front-end-interview-yt3cx1bt',
    sourceLabel: 'Candidate report on Blind',
    additionalSources: [{ label: 'Senior frontend report, May 2025', url: 'https://discuss.frontendlead.com/t/anduril-senior-front-end-engineer-onsite-interview/1905' }],
    report: 'A March 2025 Blind commenter reports a file-explorer screen. A May 2025 senior frontend account also describes an expandable directory component. These are candidate recollections; they do not establish file creation, renaming, or deletion requirements.',
    summary: 'Render a nested directory tree and preserve each folder’s expansion state.',
    prompt: 'Build a React file explorer from a hierarchy of files and folders. Users should be able to expand a folder to reveal its children and collapse it to hide them.',
    assumptions: [
      'The example input is an acyclic tree. Every node has a globally unique id and an explicit type of file or folder.',
      'Folders start collapsed. Multiple folders may be expanded, and descendant expansion is preserved when an ancestor closes.',
      'This practice version displays files and folders; editing the filesystem is outside its assumed contract.',
    ],
    requirements: [
      'Render files as leaf rows and folders as buttons with aria-expanded.',
      'Display each expanded folder’s children recursively.',
      'Show an Empty folder message when an expanded folder has no children.',
      'Use immutable state updates so React renders each toggle.',
    ],
    example: {
      actions: 'Expand src, then components. Collapse src and open it again.',
      result: 'Button.jsx becomes visible, disappears with src, and reappears because components remains expanded.',
    },
    steps: [
      'Model the input as nested nodes. An explicit type distinguishes an empty folder from a file.',
      'Keep a Set of expanded folder IDs in the parent FileExplorer component.',
      'Copy the Set on every toggle, then add or remove the clicked ID.',
      'FileNode renders one node. For an expanded folder it calls itself for each child.',
      'The Set survives unmounting of hidden descendants, so closing an ancestor does not erase their expansion state.',
    ],
    pitfalls: [
      'Do not mutate the existing Set and return the same object from a state setter.',
      'Names are not unique: two folders can each contain a file named index.js. Use IDs as keys.',
      'An empty children array still describes a folder; checking only children.length would misclassify it.',
      'Native buttons make toggles keyboard accessible. A full ARIA tree widget would also need its own arrow-key navigation.',
    ],
    complexity: 'Let V be the visible nodes, E the expanded folder IDs, and H the visible tree depth. Rendering takes O(V); copying the Set takes O(E), so a toggle takes O(V + E). Expansion state uses O(E), rendered output O(V), and recursive traversal depth O(H).',
    integrationNotes: ['The sample dataset is included in the snippet. Pass a different nodes array to FileExplorer to practice another tree.'],
    testCases: [
      { action: 'Load the sample.', expected: 'Only top-level rows appear and folder buttons are collapsed.' },
      { action: 'Expand src, then components.', expected: 'Nested rows appear, including Button.jsx.' },
      { action: 'Close and reopen src.', expected: 'The components folder is still expanded.' },
      { action: 'Expand public.', expected: 'Empty folder appears.' },
    ],
    code: String.raw`import { useState } from 'react';

const FILES = [
  {
    id: 'src', name: 'src', type: 'folder',
    children: [
      {
        id: 'src-components', name: 'components', type: 'folder',
        children: [
          { id: 'button', name: 'Button.jsx', type: 'file' },
        ],
      },
      { id: 'app', name: 'App.jsx', type: 'file' },
    ],
  },
  { id: 'public', name: 'public', type: 'folder', children: [] },
  { id: 'package', name: 'package.json', type: 'file' },
];

function FileNode({ node, expanded, onToggle }) {
  if (node.type === 'file') return <li>{node.name}</li>;

  const isOpen = expanded.has(node.id);

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => onToggle(node.id)}
      >
        <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>{' '}
        {node.name}
      </button>
      {isOpen && (
        <ul>
          {node.children.length === 0 ? (
            <li>Empty folder</li>
          ) : (
            node.children.map((child) => (
              <FileNode
                key={child.id}
                node={child}
                expanded={expanded}
                onToggle={onToggle}
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
}

export default function FileExplorer({ nodes = FILES }) {
  const [expanded, setExpanded] = useState(() => new Set());

  function toggleFolder(id) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section aria-label="File explorer">
      <ul>
        {nodes.map((node) => (
          <FileNode
            key={node.id}
            node={node}
            expanded={expanded}
            onToggle={toggleFolder}
          />
        ))}
      </ul>
    </section>
  );
}`,
  },
  {
    collection: 'Anduril',
    kind: 'coding',
    slug: 'anduril-timer',
    title: 'Timer Class + React',
    difficulty: 'Medium',
    topics: ['Classes', 'Effects', 'Timers', 'Cleanup'],
    sourceUrl: 'https://www.jointaro.com/interviews/companies/anduril/experiences/software-engineer-united-states-december-24-2024-no-offer-positive-64f81210/',
    sourceLabel: 'Candidate report hosted on Taro',
    additionalSources: [{ label: 'Full-stack candidate’s timer account on Reddit', url: 'https://www.reddit.com/r/leetcode/comments/1dde20u/anduril_interview_experience/' }],
    report: 'A December 24, 2024 software-engineer account hosted on Taro names a timer class connected to a React app. A separate Reddit candidate, who identifies their role as full-stack, reports a supplied interface with start, stop, and pause methods. Exact timing semantics are not published.',
    summary: 'Build a plain JavaScript timer and connect its elapsed time to a React interface.',
    prompt: 'Implement timekeeping in a JavaScript class, then create a React component that displays the elapsed duration and controls the class through buttons.',
    assumptions: [
      'This is a count-up timer: start begins or resumes, pause preserves elapsed time, and stop stops and resets to zero.',
      'A 50 ms interval refreshes the display. Elapsed duration is calculated from timestamps instead of counting interval callbacks.',
      'Repeated starts do nothing while running, and unmounting releases the interval.',
    ],
    requirements: [
      'Keep accumulated duration, the current start timestamp, and the interval handle in a plain class.',
      'Support Start / resume, Pause, and Stop / reset.',
      'Retain one timer instance for the mounted React component.',
      'Release background work during effect cleanup without calling the React setter.',
    ],
    example: {
      actions: 'Start for two seconds, pause for one second, then resume for one second.',
      result: 'Elapsed time is approximately three seconds. The paused second is excluded. Stop / reset returns it to zero.',
    },
    steps: [
      'Store elapsedMs for completed runs and startedAt for the current run. A null start timestamp means paused.',
      'While running, getElapsed returns elapsedMs + performance.now() - startedAt.',
      'start creates at most one interval. Each callback publishes the current duration to React.',
      'pause saves the current duration before clearing the start timestamp and interval; stop also resets elapsedMs.',
      'Create the class once with a lazy useState initializer. Its constructor starts no side effects.',
      'The effect returns dispose, which clears the interval without publishing a state update during unmount.',
    ],
    pitfalls: [
      'Adding 50 on every interval callback loses time when the browser delays callbacks. Measure timestamp differences.',
      'Use startedAt === null rather than a truthiness check: a valid timestamp can be zero.',
      'Repeated starts must not create multiple intervals.',
      'Resetting the displayed React value alone leaves the class’s accumulated duration incorrect.',
    ],
    complexity: 'Every timer operation and display refresh takes O(1) time. The class stores O(1) state and owns at most one active interval.',
    integrationNotes: ['performance.now() supplies a monotonic clock within the page. The interval controls display refresh frequency; it is not the source of elapsed time.'],
    testCases: [
      { action: 'Click Start / resume twice.', expected: 'Only one interval runs.' },
      { action: 'Pause and wait.', expected: 'The elapsed value remains unchanged.' },
      { action: 'Resume after pausing.', expected: 'Elapsed time continues from the saved duration.' },
      { action: 'Stop / reset, then start again.', expected: 'The next run begins from zero.' },
      { action: 'Unmount while running.', expected: 'The interval is cleared.' },
    ],
    code: String.raw`import { useEffect, useState } from 'react';

class Timer {
  constructor(onTick) {
    this.onTick = onTick;
    this.elapsedMs = 0;
    this.startedAt = null;
    this.intervalId = null;
  }

  getElapsed() {
    return this.elapsedMs + (
      this.startedAt === null ? 0 : performance.now() - this.startedAt
    );
  }

  start() {
    if (this.startedAt !== null) return;
    this.startedAt = performance.now();
    this.intervalId = setInterval(() => {
      this.onTick(this.getElapsed());
    }, 50);
    this.onTick(this.getElapsed());
  }

  pause() {
    if (this.startedAt === null) return;
    this.elapsedMs = this.getElapsed();
    this.startedAt = null;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.onTick(this.elapsedMs);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.startedAt = null;
    this.elapsedMs = 0;
    this.onTick(0);
  }

  dispose() {
    this.elapsedMs = this.getElapsed();
    this.startedAt = null;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
}

export default function TimerApp() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timer] = useState(() => new Timer(setElapsedMs));

  useEffect(() => {
    return () => timer.dispose();
  }, [timer]);

  return (
    <section aria-label="Timer">
      <p>Elapsed: {(elapsedMs / 1000).toFixed(2)} seconds</p>
      <button type="button" onClick={() => timer.start()}>
        Start / resume
      </button>
      <button type="button" onClick={() => timer.pause()}>Pause</button>
      <button type="button" onClick={() => timer.stop()}>
        Stop / reset
      </button>
    </section>
  );
}`,
  },
  {
    collection: 'Anduril',
    kind: 'coding',
    slug: 'anduril-search-table',
    title: 'Search Bar + Results Table',
    difficulty: 'Medium',
    topics: ['Controlled inputs', 'Filtering', 'Derived state'],
    sourceUrl: irvineReport,
    sourceLabel: 'May 2021 candidate report hosted on Taro',
    additionalSources: [{ label: 'December 2020 search/filter report on Taro', url: 'https://www.jointaro.com/interviews/companies/anduril/experiences/front-end-engineer-new-grad-united-states-december-1-2020-no-offer-neutral-99172b8f/' }],
    report: 'A May 2021 frontend account from Irvine names a search interface with a table. A December 2020 frontend new-grad account describes filtering supplied data in React. Both are candidate accounts hosted on Taro; the full prompts and original Glassdoor pages are not independently verified here.',
    summary: 'Filter supplied rows from a controlled search input and render the matches in a table.',
    prompt: 'Create a React search bar and results table. As the user edits the query, show the rows that match the input.',
    assumptions: [
      'Rows contain unique ids, names, and teams. Matching is case-insensitive substring search across the combined name and team text.',
      'Ignore leading and trailing query whitespace. An empty query shows all rows.',
      'Data is supplied locally; networking, debounce, pagination, and sorting are not part of this example.',
    ],
    requirements: [
      'Keep the input query in state and derive matching rows during rendering.',
      'Display the result count and a table with Name and Team columns.',
      'Display No matching people when the result is empty.',
      'Reflect updated rows props without synchronizing a second filtered-results state.',
    ],
    example: {
      actions: 'Enter platform, then change the query to JORDAN, then clear the input.',
      result: 'The table shows Alex and Sam, then Jordan, then all four sample rows.',
    },
    steps: [
      'Store only query as state. Normalize it with trim and toLowerCase.',
      'Filter the rows by comparing each row’s normalized searchable text with includes.',
      'Render the result count and map each matching row into a table row keyed by id.',
      'When there are no matches, render a single message cell spanning both columns.',
    ],
    pitfalls: [
      'Filtered rows are derived data. Storing them separately can leave them stale when the input dataset changes.',
      'Normalize both the query and the row text so mixed capitalization behaves consistently.',
      'Use stable row IDs instead of indexes when list membership can change.',
    ],
    complexity: 'For N rows, filtering takes O(N) time when text lengths are bounded. Rendering takes O(M) for M matches. The filtered array uses O(M) space; with longer fields, include the cost of normalizing and searching their text.',
    testCases: [
      { action: 'Load with an empty query.', expected: 'Every input row appears.' },
      { action: 'Search for PLATFORM with spaces around it.', expected: 'Alex and Sam match.' },
      { action: 'Search for text absent from the dataset.', expected: 'The count is zero and the empty message appears.' },
      { action: 'Replace the rows prop while a query is active.', expected: 'Results are derived from the new rows immediately.' },
    ],
    code: String.raw`import { useState } from 'react';

const PEOPLE = [
  { id: '1', name: 'Alex Kim', team: 'Platform' },
  { id: '2', name: 'Jordan Lee', team: 'Frontend' },
  { id: '3', name: 'Sam Rivera', team: 'Platform' },
  { id: '4', name: 'Taylor Chen', team: 'Design' },
];

export default function SearchTable({ rows = PEOPLE }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    const text = (row.name + ' ' + row.team).toLowerCase();
    return text.includes(normalizedQuery);
  });

  return (
    <section>
      <label>
        Search people
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or team"
        />
      </label>
      <p role="status">
        {filteredRows.length} result{filteredRows.length === 1 ? '' : 's'}
      </p>
      <table>
        <caption>People</caption>
        <thead>
          <tr><th scope="col">Name</th><th scope="col">Team</th></tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr><td colSpan={2}>No matching people.</td></tr>
          ) : (
            filteredRows.map((row) => (
              <tr key={row.id}><td>{row.name}</td><td>{row.team}</td></tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}`,
  },
  {
    collection: 'Anduril',
    kind: 'coding',
    slug: 'anduril-month-year-form',
    title: 'Month / Year Input Form',
    difficulty: 'Medium',
    topics: ['Forms', 'Validation', 'Controlled inputs'],
    sourceUrl: irvineReport,
    sourceLabel: 'May 2021 candidate report hosted on Taro',
    report: 'The May 2021 Irvine frontend account hosted on Taro also names a form for entering a month and year. It does not provide validation rules or a required visual design. The range and output format below are practice assumptions.',
    summary: 'Validate a calendar month and year, then submit a normalized YYYY-MM value.',
    prompt: 'Build a React form with month and year inputs. Validate the values on submission and display the accepted month/year value or a useful error.',
    assumptions: [
      'Months range from 1 through 12 and years from 1000 through 9999.',
      'Submission produces YYYY-MM, for example 2026-03. This represents a calendar month, not an instant in a time zone.',
      'Validate on submit. The displayed Submitted value represents the last successful submission until another submission succeeds or fails.',
    ],
    requirements: [
      'Keep input values as strings, including the empty editing state.',
      'Offer all twelve months and accept a four-digit year.',
      'Reject missing or invalid values and display an alert.',
      'Pad a single-digit month to two digits in the submitted result.',
    ],
    example: {
      actions: 'Choose month 3, type 2026, and submit.',
      result: 'The form displays Submitted: 2026-03. Submitting an empty year instead displays an error.',
    },
    steps: [
      'Use separate string state values for month and year so inputs can be temporarily empty.',
      'Prevent the form’s default navigation when the user submits.',
      'Validate both strings before building the result. The year must start with a nonzero digit and contain four digits.',
      'Combine year with a month padded to two digits. No Date object is needed.',
      'On failure, clear the old submitted result and show an alert. On success, clear the error.',
    ],
    pitfalls: [
      'Converting input to a number on every keystroke makes the empty input state harder to represent.',
      'maxLength is an editing aid, not validation. Validate again on submission.',
      'Creating a Date introduces day and time-zone behavior that this calendar-month contract does not need.',
    ],
    complexity: 'Validation and formatting take O(1) time under the fixed four-digit year contract. The component stores O(1) state and renders a fixed set of twelve month choices.',
    testCases: [
      { action: 'Submit with missing inputs.', expected: 'An alert asks for a month and a year in range.' },
      { action: 'Submit month 3 and year 2026.', expected: 'Submitted: 2026-03 appears.' },
      { action: 'Submit a year containing letters or fewer than four digits.', expected: 'Submission fails and any prior result is cleared.' },
      { action: 'Submit years 1000 and 9999.', expected: 'Both boundary values are accepted.' },
    ],
    code: String.raw`import { useState } from 'react';

export default function MonthYearForm() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [submittedValue, setSubmittedValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const validMonth = /^(0?[1-9]|1[0-2])$/.test(month);
    const validYear = /^[1-9]\d{3}$/.test(year);

    if (!validMonth || !validYear) {
      setError('Choose a month and enter a year from 1000 to 9999.');
      setSubmittedValue('');
      return;
    }

    setError('');
    setSubmittedValue(year + '-' + month.padStart(2, '0'));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Month
        <select value={month} onChange={(event) => setMonth(event.target.value)}>
          <option value="">Choose a month</option>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={String(value)}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Year
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={year}
          onChange={(event) => setYear(event.target.value)}
          placeholder="2026"
        />
      </label>
      <button type="submit">Submit</button>
      {error && <p role="alert">{error}</p>}
      {submittedValue && <p role="status">Submitted: {submittedValue}</p>}
    </form>
  );
}`,
  },
];
