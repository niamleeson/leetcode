import type { ReactChallenge } from './types';

export const andurilAdvancedChallenges: ReactChallenge[] = [
  {
    collection: 'Anduril',
    kind: 'coding',
    slug: 'anduril-array-utilities',
    title: 'Array Utilities: Flatten, Map, and Reduce',
    difficulty: 'Medium',
    topics: ['JavaScript', 'Recursion', 'Array methods'],
    summary: 'Implement three array helpers and explain depth, sparse arrays, and the initial accumulator.',
    sourceUrl: 'https://www.teamblind.com/post/anduril-frontend-interview-eg52tpe3',
    sourceLabel: 'Candidate report on Blind — May 2024',
    report: 'A May 15, 2024 Blind commenter names Lodash-style flatten, map, and reduce questions in a frontend interview. The same commenter also promotes a preparation site and reports the autocomplete task elsewhere. This is one anonymous account; it does not establish the exact utility contracts.',
    prompt: 'Implement flatten, mapArray, and reduceArray in JavaScript. Flatten nested arrays to a requested depth, transform existing elements with a callback, and accumulate existing elements into one result. Use the example contracts below to make the task concrete.',
    assumptions: [
      'Inputs are arrays. These are array-based teaching implementations, not complete Lodash replacements or generic native-method polyfills.',
      'flatten accepts a nonnegative integer depth or Infinity; its default depth is one. Nested arrays are acyclic.',
      'flatten skips holes in visited arrays; mapArray preserves holes; reduceArray skips them. An explicit undefined initial value counts as supplied.',
      'mapArray and reduceArray capture the original array length and pass the original array to callbacks. mapArray also accepts thisArg.',
    ],
    requirements: [
      'Return new arrays from flatten and mapArray without modifying the input.',
      'Respect flatten depth zero, finite depths, and Infinity.',
      'Call mapArray callbacks with value, index, and the original array.',
      'Call reduceArray callbacks with accumulator, value, index, and the original array.',
      'Without an initial value, use the first existing element; throw if there is no existing element.',
    ],
    example: {
      actions: 'Flatten [1, [2, [3]], 4] at depth 1 and Infinity; map [1, 2, 3] to twice each value; reduce it to a sum starting at 0.',
      result: 'The results are [1, 2, [3], 4], [1, 2, 3, 4], [2, 4, 6], and 6.',
    },
    steps: [
      'For flatten, visit each existing entry. Recurse into a nested array only while there is depth left; otherwise append the value.',
      'For mapArray, allocate an output array with the input length and assign transformed values only at existing indexes.',
      'For reduceArray, decide the accumulator and startIndex before the reduction loop. If an initial value was supplied, use it and start at index 0. arguments.length >= 3 counts an explicitly supplied undefined as an initial value.',
      'Without an initial value, find the first existing element, use it as the accumulator, and set startIndex to firstElementIndex + 1. Throw if there is no existing element. For [2, 4, 6], this means accumulator = 2 and startIndex = 1.',
      'Begin the reduction loop at startIndex. Skip empty slots and call the callback for each remaining element; accumulator selection is already complete.',
      'Capture length before invoking callbacks so an appended item is not unexpectedly visited during the same operation.',
    ],
    pitfalls: [
      'Checking initialValue !== undefined incorrectly treats an explicitly supplied undefined as an omitted argument.',
      'A hole is different from an element whose value is undefined. Use i in array to distinguish them.',
      'Using push in mapArray changes positions in sparse arrays; assign result[i] instead.',
      'Very deeply nested arrays can exhaust the call stack. An explicit stack is an alternative when unbounded nesting is a requirement.',
    ],
    integrationNotes: [
      'The named exports can be used in a JavaScript module. Remove export if your interview environment runs a plain script.',
      'Clarify whether the interviewer wants native array behavior, Lodash behavior, or a simpler dense-array contract before handling every edge case.',
    ],
    complexity: 'For flatten, let S be the number of array slots inspected, M the output length, and D the visited nesting depth: O(S) time and O(M + D) space. For mapArray, O(N) time with a constant-time callback and O(N) output space. For reduceArray, O(N) traversal; extra working state is O(1), excluding storage allocated by the callback or accumulator.',
    testCases: [
      { action: 'Flatten [1, [2, [3]]] at depths 0, 1, and Infinity.', expected: 'Return [1, [2, [3]]], [1, 2, [3]], and [1, 2, 3].' },
      { action: 'Map a sparse array with one existing element.', expected: 'Keep its length and holes; invoke the callback only for that element.' },
      { action: 'Reduce [] without an initial value.', expected: 'Throw a TypeError.' },
      { action: 'Reduce [] with an explicit undefined initial value.', expected: 'Return undefined without invoking the callback.' },
      { action: 'Append an item inside a map or reduce callback.', expected: 'The new item is beyond the captured length and is not visited.' },
    ],
    solutionTitle: 'JavaScript solution',
    codeLanguage: 'javascript',
    code: String.raw`export function flatten(array, depth = 1) {
  if (!Array.isArray(array)) {
    throw new TypeError('Expected an array');
  }
  if (depth !== Infinity && (!Number.isInteger(depth) || depth < 0)) {
    throw new RangeError('Depth must be a nonnegative integer or Infinity');
  }

  const result = [];

  function visit(items, remainingDepth) {
    for (let i = 0; i < items.length; i++) {
      if (!(i in items)) continue;
      const value = items[i];

      if (Array.isArray(value) && remainingDepth > 0) {
        const nextDepth = remainingDepth === Infinity
          ? Infinity
          : remainingDepth - 1;
        visit(value, nextDepth);
      } else {
        result.push(value);
      }
    }
  }

  visit(array, depth);
  return result;
}

export function mapArray(array, callback, thisArg) {
  if (!Array.isArray(array) || typeof callback !== 'function') {
    throw new TypeError('Invalid arguments');
  }

  const length = array.length;
  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    if (i in array) {
      result[i] = callback.call(thisArg, array[i], i, array);
    }
  }
  return result;
}

export function reduceArray(array, callback, initialValue) {
  if (!Array.isArray(array) || typeof callback !== 'function') {
    throw new TypeError('Invalid arguments');
  }

  const length = array.length;
  const hasInitialValue = arguments.length >= 3;
  let accumulator = initialValue;
  let startIndex = 0;

  if (!hasInitialValue) {
    // Find the first element, skipping any leading empty slots.
    let firstElementIndex = 0;
    while (firstElementIndex < length) {
      const hasElement = firstElementIndex in array;
      if (hasElement) {
        break;
      }
      firstElementIndex++;
    }

    if (firstElementIndex === length) {
      throw new TypeError('Empty array without an initial value');
    }

    accumulator = array[firstElementIndex];
    startIndex = firstElementIndex + 1;
  }

  for (let index = startIndex; index < length; index++) {
    const hasElement = index in array;
    if (!hasElement) {
      continue;
    }

    accumulator = callback(accumulator, array[index], index, array);
  }

  return accumulator;
}`,
  },
  {
    collection: 'Anduril',
    kind: 'coding',
    slug: 'anduril-autocomplete',
    title: 'React Autocomplete Search',
    difficulty: 'Medium',
    topics: ['Controlled inputs', 'Keyboard interaction', 'Accessibility'],
    summary: 'Filter local suggestions and support mouse selection, arrow keys, Enter, and Escape.',
    sourceUrl: 'https://www.teamblind.com/post/anduril-frontend-interview-tip-vo3xz40g',
    sourceLabel: 'Candidate report on Blind — May 2024',
    report: 'A May 16, 2024 Blind commenter reports an autocomplete search task in React. This is the same commenter as the array-utilities report, so the two reports are not independent corroboration. API calls, debounce behavior, and keyboard requirements are not specified in the report.',
    prompt: 'Build a React autocomplete input that displays matching suggestions and lets the user commit one. For this practice version, use a supplied local array and support keyboard and mouse interaction under the assumptions below.',
    assumptions: [
      'Options have unique, stable IDs and string labels. Match labels with case-insensitive substring search after trimming the query.',
      'An empty query shows no suggestions. Display at most eight matches in input order.',
      'Arrow keys wrap through matches; Enter chooses the active match; Escape or losing focus closes the list.',
      'Choosing a suggestion updates the input. Suggestions are local, so this example does not perform network requests or debounce input.',
    ],
    requirements: [
      'Keep the input controlled and derive suggestions from the query and options.',
      'Show an empty-results message when a nonempty query has no matches.',
      'Support selection with the mouse or with ArrowDown/ArrowUp and Enter.',
      'Keep keyboard focus on the input and expose the active option with aria-activedescendant.',
      'Ignore keyboard selection while an input method editor is composing text.',
    ],
    example: {
      actions: 'Type “al”, press ArrowDown twice, and then press Enter.',
      result: 'Alpha and Alpine appear. The active option moves from Alpha to Alpine; Enter sets the input to Alpine and closes the suggestions.',
    },
    steps: [
      'Store the query, whether the popup is open, and the active suggestion index. Filter options during rendering.',
      'Reset the active index whenever the query changes, then show matching suggestions.',
      'Arrow keys open the popup and move the active index with wraparound. Enter chooses only a valid active option.',
      'Use a generated list ID and stable option IDs for aria-controls and aria-activedescendant.',
      'Prevent pointer-down from moving focus away from the input before a suggestion click can commit its value.',
      'Dismiss the list and reset the active index on Escape or blur. Composition events must not trigger selection.',
    ],
    pitfalls: [
      'Unconditionally handling Enter can interrupt IME text composition or submit an unintended suggestion.',
      'An input blur can remove the suggestions before a mouse click fires. Keep input focus during pointer selection.',
      'Do not expose aria-activedescendant for a missing or hidden option.',
      'If options become remote, an older response can arrive after a newer query. Check request identity before accepting results.',
    ],
    integrationNotes: [
      'This is a complete React example with sample local options. Keep each coding example in its own module.',
      'Debouncing, loading/error states, and stale-response protection are possible remote-data follow-ups; the candidate report does not establish them as original requirements.',
    ],
    complexity: 'For N options with label length bounded by L, filtering is O(N × L) per render, plus the cost of normalizing the query. The intermediate filtered array can use O(N) space; the popup renders at most eight options. Interaction state is O(query length) plus constant-size flags and an index.',
    testCases: [
      { action: 'Type “AL”.', expected: 'Show Alpha and Alpine; matching is case-insensitive.' },
      { action: 'Press ArrowUp before highlighting any match.', expected: 'Highlight the last visible suggestion.' },
      { action: 'Press Enter on an active suggestion.', expected: 'Use its label as the input value and close the popup.' },
      { action: 'Click a suggestion or leave the input.', expected: 'Click commits the option; losing focus simply closes the popup.' },
      { action: 'Enter a query with no matches, then clear it.', expected: 'Show “No suggestions.” for the unmatched query; clearing removes the message.' },
    ],
    code: String.raw`import { useId, useState } from 'react';

const OPTIONS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Alpine' },
  { id: 'c', label: 'Bravo' },
  { id: 'd', label: 'Charlie' },
  { id: 'e', label: 'Delta' },
];

export default function Autocomplete({ options = OPTIONS }) {
  const id = useId();
  const listId = id + '-suggestions';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(normalizedQuery)
      ).slice(0, 8)
    : [];

  const showSuggestions = open && matches.length > 0;
  const activeOption = showSuggestions ? matches[activeIndex] : undefined;

  function dismiss() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function choose(option) {
    setQuery(option.label);
    dismiss();
  }

  function handleKeyDown(event) {
    if (event.nativeEvent.isComposing) return;

    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length > 0) {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setOpen(true);
      setActiveIndex((previous) => {
        if (!showSuggestions || previous < 0 || previous >= matches.length) {
          return direction === 1 ? 0 : matches.length - 1;
        }
        return (previous + direction + matches.length) % matches.length;
      });
      return;
    }

    if (event.key === 'Enter' && activeOption) {
      event.preventDefault();
      choose(activeOption);
    }
    if (event.key === 'Escape') dismiss();
  }

  return (
    <div>
      <label htmlFor={id}>Search</label>
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listId : undefined}
        aria-activedescendant={activeOption ? listId + '-' + activeOption.id : undefined}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={dismiss}
        onKeyDown={handleKeyDown}
      />
      {showSuggestions && (
        <ul id={listId} role="listbox" aria-label="Suggestions">
          {matches.map((option, index) => (
            <li
              key={option.id}
              id={listId + '-' + option.id}
              role="option"
              aria-selected={index === activeIndex}
              style={{ background: index === activeIndex ? '#dbeafe' : undefined }}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {open && normalizedQuery && matches.length === 0 && (
        <p role="status">No suggestions.</p>
      )}
    </div>
  );
}`,
  },
];
