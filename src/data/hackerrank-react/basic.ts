import type { ReactChallenge } from './types';

export const basicChallenges: ReactChallenge[] = [
  {
    slug: 'item-list-manager',
    title: 'Item List Manager',
    difficulty: 'Medium',
    topics: ['useState', 'Controlled inputs', 'Immutable arrays'],
    summary: 'Append the entered text to a list, then clear the input.',
    prompt: 'Build a React screen for collecting a list of text items. Show a text field, an Add Item button, and an unordered list that is empty when the screen first opens. Users should be able to add several items in sequence without losing earlier entries. Empty submissions should leave the list unchanged.',
    example: {
      actions: 'Enter Notebook and click Add Item. Then enter Pencil and click Add Item again.',
      result: 'The list shows Notebook followed by Pencil, and the text field is empty after each successful addition.',
    },
    requirements: [
      'Start with an empty input and an empty unordered list.',
      'Add Item appends the input text in insertion order.',
      'Clear the input after adding an item; ignore empty submissions.',
    ],
    steps: [
      'Keep two pieces of state: the text currently being edited and the array of saved items.',
      'Connect the input value and onChange handler so React owns the current text.',
      'On submit, reject blank input and append with a new array. The functional setter receives the latest list.',
      'Clear only the input state. Render the saved array with map inside a ul.',
    ],
    pitfalls: [
      'Calling items.push mutates the existing state. Use [...previous, input] instead.',
      'A form submission reloads the page unless you call preventDefault.',
      'Array indexes are acceptable keys here because the list only appends. Use persistent IDs if you later add deletion or reordering.',
    ],
    code: `import { useState } from 'react';

export default function ItemListManager() {
  const [input, setInput] = useState('');
  const [items, setItems] = useState([]);

  function addItem(event) {
    event.preventDefault();
    if (!input.trim()) return;

    // Copy the array; preserve the entered text for nonblank items.
    setItems(previous => [...previous, input]);
    setInput('');
  }

  return (
    <section>
      <form onSubmit={addItem}>
        <label htmlFor="item-input">Item</label>
        <input
          id="item-input"
          value={input}
          onChange={event => setInput(event.target.value)}
        />
        <button type="submit">Add Item</button>
      </form>

      <ul aria-label="Items">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}`,
    testCases: [
      { action: 'Load the component.', expected: 'The input and list are empty.' },
      { action: 'Add Alpha, then Beta.', expected: 'The list contains Alpha followed by Beta; the input clears each time.' },
      { action: 'Submit empty text or spaces only.', expected: 'The list does not change.' },
      { action: 'Add the same text twice.', expected: 'Both entries remain; this is a list, not a set.' },
    ],
    complexity: 'With n saved items, adding copies and renders O(n) entries. Stored list space is O(n), excluding the characters in the strings.',
    integrationNotes: [
      'This is a standalone component. Keep the starter project’s component export, classes, and data-testid attributes when transplanting the state and handlers.',
      'This solution also treats whitespace-only input as empty.',
    ],
    sourceUrl: 'https://www.hackerrank.com/challenges/item-list-manager/problem',
  },
  {
    slug: 'code-review-feedback',
    title: 'Code Review Feedback',
    difficulty: 'Medium',
    topics: ['useState', 'Object updates', 'Independent counters'],
    summary: 'Track independent positive and negative vote counts for five code-quality categories.',
    prompt: 'Create a React feedback panel for reviewing code quality. Present five categories, each with its own Upvote and Downvote buttons and two visible counters. All counters begin at zero. Users can vote repeatedly in either direction, and the affected count should update immediately with a subtle animation while other counts remain unchanged.',
    example: {
      actions: 'Click Upvote for Testing three times, then click Downvote for Documentation once.',
      result: 'Testing has 3 upvotes and 0 downvotes. Documentation has 0 upvotes and 1 downvote. Every other counter stays at 0.',
    },
    requirements: [
      'Display Readability, Performance, Security, Documentation, and Testing.',
      'Each category starts with zero upvotes and zero downvotes.',
      'Each vote increments only its own counter, with a subtle visual update.',
    ],
    steps: [
      'Create a separate object for each category with its name and two counters.',
      'Pass the category index and counter name to one vote handler.',
      'Map the previous array, copying only the category being changed. Increment the selected field with a computed property name.',
      'Render both counts from state. Key each count span by its number so the small animation restarts when that count changes.',
    ],
    pitfalls: [
      'A downvote increases the downvote count; it does not subtract from the upvote count.',
      'Array.fill with a single object shares that object between rows. map creates independent objects.',
      'Use a functional state update so rapid clicks build on the latest counts.',
    ],
    code: `import { useState } from 'react';

const ASPECTS = [
  'Readability', 'Performance', 'Security', 'Documentation', 'Testing',
];

export default function CodeReviewFeedback() {
  const [feedback, setFeedback] = useState(() =>
    ASPECTS.map(name => ({ name, upvotes: 0, downvotes: 0 }))
  );

  function vote(index, counter) {
    setFeedback(previous => previous.map((aspect, i) =>
      i === index
        ? { ...aspect, [counter]: aspect[counter] + 1 }
        : aspect
    ));
  }

  return (
    <div>
      <style>{\`
        @keyframes feedback-count-in {
          from { opacity: 0.5; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feedback-count {
          display: inline-block;
          animation: feedback-count-in 180ms ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .feedback-count { animation: none; }
        }
      \`}</style>

      {feedback.map((aspect, index) => (
        <section key={aspect.name} aria-labelledby={'aspect-' + index}>
          <h2 id={'aspect-' + index}>{aspect.name}</h2>
          <button
            aria-label={'Upvote ' + aspect.name}
            onClick={() => vote(index, 'upvotes')}
          >
            Upvote
          </button>
          <button
            aria-label={'Downvote ' + aspect.name}
            onClick={() => vote(index, 'downvotes')}
          >
            Downvote
          </button>
          <p aria-live="polite">
            Upvotes: <span key={aspect.upvotes} className="feedback-count">
              {aspect.upvotes}
            </span>
          </p>
          <p aria-live="polite">
            Downvotes: <span key={aspect.downvotes} className="feedback-count">
              {aspect.downvotes}
            </span>
          </p>
        </section>
      ))}
    </div>
  );
}`,
    testCases: [
      { action: 'Load the component.', expected: 'Five categories appear with ten zero counters.' },
      { action: 'Upvote Readability twice.', expected: 'Its upvote count becomes 2; all other counters remain zero.' },
      { action: 'Downvote Performance once.', expected: 'Only its downvote count becomes 1.' },
      { action: 'Vote in both directions on one category.', expected: 'Each counter increases independently.' },
    ],
    complexity: 'With k categories, each vote takes O(k) for the array update and render, with O(k) stored state. Here k is fixed at 5, so both are O(1).',
    integrationNotes: [
      'Preserve starter test selectors when copying this standalone component into HackerRank. The accessible button labels distinguish the categories without inventing test IDs.',
    ],
    sourceUrl: 'https://www.hackerrank.com/challenges/code-review-feedback/problem',
  },
  {
    slug: 'react-article-sorting',
    title: 'Article Sorting',
    difficulty: 'Hard',
    topics: ['Derived state', 'Sorting', 'useMemo'],
    summary: 'Render articles in a table and switch between highest-voted and newest-first order.',
    prompt: 'Build an article browser that receives an articles array. Each article contains a title, an upvote count, and a publication date written as YYYY-MM-DD. Show the articles in a table, starting with the highest-voted article. Provide Most Upvoted and Most Recent controls so readers can switch between popularity and publication order.',
    example: {
      actions: 'Use Hooks with 8 upvotes dated 2026-09-12 and Components with 15 upvotes dated 2026-09-03. Open the page, then click Most Recent.',
      result: 'Initially Components appears before Hooks. After Most Recent, Hooks appears before Components.',
    },
    requirements: [
      'Accept articles with title, numeric upvotes, and an ISO YYYY-MM-DD date.',
      'Initially order by descending upvotes.',
      'Most Upvoted and Most Recent choose descending vote and date order respectively.',
      'The challenge guarantees unique dates and upvote counts.',
    ],
    steps: [
      'Store only the chosen sort mode. The sorted articles can be calculated from that mode and the articles prop.',
      'Copy articles before sorting because sort changes its array in place.',
      'Use b.upvotes - a.upvotes for highest first. Fixed-width ISO dates can be compared as strings for newest first.',
      'Memoize the sorted copy and render one table row per article.',
    ],
    pitfalls: [
      'Sorting the articles prop directly mutates data owned by the parent.',
      'Reversing an already-sorted list does not switch between two different sort fields.',
      'Duplicating props into state can leave the table stale when the parent passes new articles.',
    ],
    code: `import { useMemo, useState } from 'react';

// articles: [{ title: 'React State', upvotes: 12, date: '2026-10-01' }]
export default function Articles({ articles }) {
  const [sortBy, setSortBy] = useState('upvotes');

  const sortedArticles = useMemo(() => {
    const copy = [...articles];
    copy.sort((a, b) => sortBy === 'upvotes'
      ? b.upvotes - a.upvotes
      : b.date.localeCompare(a.date)
    );
    return copy;
  }, [articles, sortBy]);

  return (
    <section>
      <div>
        <button
          aria-pressed={sortBy === 'upvotes'}
          onClick={() => setSortBy('upvotes')}
        >
          Most Upvoted
        </button>
        <button
          aria-pressed={sortBy === 'date'}
          onClick={() => setSortBy('date')}
        >
          Most Recent
        </button>
      </div>

      <table>
        <thead>
          <tr><th>Title</th><th>Upvotes</th><th>Date</th></tr>
        </thead>
        <tbody>
          {sortedArticles.map(article => (
            <tr key={article.date}>
              <td>{article.title}</td>
              <td>{article.upvotes}</td>
              <td>{article.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}`,
    testCases: [
      { action: 'Pass articles with vote counts 4, 20, and 9.', expected: 'The initial table orders them 20, 9, 4.' },
      { action: 'Choose Most Recent, then Most Upvoted.', expected: 'Dates descend first; vote counts descend after switching back.' },
      { action: 'Freeze the input array before rendering.', expected: 'Sorting still works and the original order stays unchanged.' },
      { action: 'Pass a new articles array after rendering.', expected: 'The table updates using the currently selected mode.' },
    ],
    complexity: 'Sorting n articles takes O(n log n) time when articles or the mode changes. The copied sorted list uses O(n) space; rendering the table takes O(n).',
    integrationNotes: [
      'Supply the original articles array as a prop. If the starter places the sorting buttons in App, keep that layout and move sortBy to App, passing the sorted array to Articles.',
      'Keep starter exports, styling, and data-testid attributes. Date is a valid row key under the challenge’s uniqueness guarantee.',
    ],
    sourceUrl: 'https://www.hackerrank.com/challenges/react-article-sorting/problem',
  },
  {
    slug: 'react-contact-form',
    title: 'Contact Form',
    difficulty: 'Medium',
    topics: ['Controlled forms', 'Validation', 'Conditional rendering'],
    summary: 'Validate a contact form and display a snapshot of a successful submission.',
    prompt: 'Create a React contact form with fields for a person’s name, email address, and message, plus a Submit button. Start with empty fields and no feedback below the form. Require a value in every field before accepting a submission. After a successful submission, show the entered details beneath the form and clear the fields.',
    example: {
      actions: 'Enter Mira as the name, mira@example.com as the email, and Please send the schedule as the message, then submit.',
      result: 'Those three values appear beneath the form, and all inputs become empty. A submission with a missing value shows the required error instead.',
    },
    requirements: [
      'Collect a name, email address, and message.',
      'Reject an incomplete submission with the error message: “All fields are required.”',
      'Display a valid submission below the form and clear the inputs.',
      'Initially show neither submitted details nor an error.',
    ],
    steps: [
      'Keep draft fields, the last submitted snapshot, and the error message in separate state values.',
      'Use each field’s name to update the corresponding property in the draft object.',
      'Prevent page navigation on submit and check all fields before saving anything.',
      'For valid input, save a copy of the draft, clear the error, and reset the fields. Render the saved snapshot independently of the draft.',
    ],
    pitfalls: [
      'Rendering submitted details from the draft makes them disappear when you clear the form.',
      'An email input can trigger browser validation. noValidate lets the specified custom presence validation control submission.',
      'Update form objects immutably so edits do not alter a previously saved submission.',
    ],
    code: `import { useState } from 'react';

const EMPTY_FORM = { name: '', email: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  function changeField(event) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();

    if (Object.values(form).some(value => !value.trim())) {
      setError('All fields are required.');
      setSubmitted(null);
      return;
    }

    // Keep submitted data separate so clearing the draft does not erase it.
    setSubmitted({ ...form });
    setError('');
    setForm(EMPTY_FORM);
  }

  return (
    <section>
      <form onSubmit={submit} noValidate>
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name" name="name"
          value={form.name} onChange={changeField}
        />

        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email" name="email" type="email"
          value={form.email} onChange={changeField}
        />

        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message" name="message"
          value={form.message} onChange={changeField}
        />

        <button type="submit">Submit</button>
      </form>

      {error && <p role="alert">{error}</p>}
      {submitted && (
        <section aria-label="Submitted information">
          <h2>Submitted information</h2>
          <p>Name: {submitted.name}</p>
          <p>Email: {submitted.email}</p>
          <p>Message: {submitted.message}</p>
        </section>
      )}
    </section>
  );
}`,
    testCases: [
      { action: 'Submit with a field missing.', expected: 'An error appears and no submitted information is displayed.' },
      { action: 'Complete all fields and submit.', expected: 'The entered details appear below the form, inputs clear, and the error disappears.' },
      { action: 'Edit a draft after a successful submission.', expected: 'Previously submitted details do not change while typing.' },
      { action: 'Submit a whitespace-only field.', expected: 'The submission is rejected.' },
    ],
    complexity: 'With L total input characters, presence validation takes O(L) time. Draft and submitted text occupy O(L) space; the number of fields is fixed.',
    integrationNotes: [
      'The public task specifies nonempty fields; this solution does not add an email-format rule. Whitespace-only fields are treated as empty.',
      'Keep the starter markup’s test IDs when adapting this standalone component.',
    ],
    sourceUrl: 'https://www.hackerrank.com/challenges/react-contact-form/problem',
  },
  {
    slug: 'react-slideshow-1',
    title: 'Slideshow',
    difficulty: 'Medium',
    topics: ['useState', 'Array indexing', 'Boundary conditions'],
    summary: 'Move through a nonempty array of slides while enforcing navigation boundaries.',
    prompt: 'Create a React slideshow that receives a nonempty slides array, where each slide has a title and text. Display the first slide when the component loads. Provide Next, Prev, and Restart controls so users can browse the slides or return to the beginning. Disable any control that cannot move the slideshow from its current position.',
    example: {
      actions: 'Supply slides titled Introduction, Exercise, and Review. Click Next twice, then click Restart.',
      result: 'Review is shown after the two Next clicks, with Next disabled. Restart returns to Introduction, where Prev and Restart are disabled.',
    },
    requirements: [
      'Accept slides containing title and text, and initially show the first one.',
      'Next and Prev move one slide in the corresponding direction.',
      'Disable Prev and Restart at the beginning and Next at the end.',
      'Restart returns to the first slide.',
    ],
    steps: [
      'Store the current array index rather than a second copy of the slide object.',
      'Read the displayed title and text directly from slides[index].',
      'Calculate first/last flags from the index. Use them to disable unavailable actions.',
      'Change the index with functional setters and clamp navigation to the valid range. Restart sets the index to zero.',
    ],
    pitfalls: [
      'The last index is slides.length - 1, not slides.length.',
      'Restart must be disabled along with Prev on the first slide.',
      'With one slide, all three buttons must be disabled.',
    ],
    code: `import { useState } from 'react';

// slides: [{ title: 'Welcome', text: 'First slide' }, ...]
// The challenge guarantees at least one slide.
export default function Slides({ slides }) {
  const [index, setIndex] = useState(0);
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  return (
    <section>
      <nav aria-label="Slide controls">
        <button disabled={isFirst} onClick={() => setIndex(0)}>
          Restart
        </button>
        <button
          disabled={isFirst}
          onClick={() => setIndex(current => Math.max(0, current - 1))}
        >
          Prev
        </button>
        <button
          disabled={isLast}
          onClick={() => setIndex(current =>
            Math.min(slides.length - 1, current + 1)
          )}
        >
          Next
        </button>
      </nav>

      <article aria-live="polite">
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
      </article>
    </section>
  );
}`,
    testCases: [
      { action: 'Load multiple slides.', expected: 'The first slide appears; Prev and Restart are disabled.' },
      { action: 'Advance to the last slide.', expected: 'Next is disabled; Prev and Restart remain available.' },
      { action: 'Go back, then restart.', expected: 'Prev moves back once; Restart returns directly to the beginning.' },
      { action: 'Pass a one-slide array.', expected: 'The slide is visible and all navigation buttons are disabled.' },
    ],
    complexity: 'Each navigation action takes O(1) time and O(1) extra state, excluding the supplied slide data and rendering its text.',
    integrationNotes: [
      'Pass the provided nonempty slides array as a prop. The exercise uses a fixed array; no duplicated slide state or effect is needed.',
      'Preserve any starter component name, classes, and data-testid attributes while applying the navigation logic.',
    ],
    sourceUrl: 'https://www.hackerrank.com/challenges/react-slideshow-1/problem',
  },
];
