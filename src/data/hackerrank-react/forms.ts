import type { ReactChallenge } from './types';

export const formChallenges: ReactChallenge[] = [
  {
    slug: 'patient-medical-records',
    title: 'Patient Medical Records',
    difficulty: 'Medium',
    topics: ['Controlled inputs', 'Shared state', 'Conditional rendering'],
    sourceUrl: 'https://www.hackerrank.com/challenges/patient-medical-records/problem',
    summary: 'Choose a patient, reveal their records, and cycle through the patients with wraparound navigation.',
    requirements: [
      'Search contains a patient dropdown and Show button; Records contains the details, table, and Next button.',
      'Initially select the disabled placeholder and hide the records and Next button.',
      'Show alerts when no patient is selected; otherwise it displays that patient.',
      'Next advances by patient ID and wraps from the last patient to the first.',
    ],
    steps: [
      'Keep the dropdown selection separate from the displayed patient. Changing the dropdown alone should not replace the table.',
      'Sort a copy of the patient list by numeric ID so Next follows the requested order without mutating the input.',
      'Show validates the selection and stores the displayed ID. Look up the corresponding patient during rendering.',
      'Next finds the displayed index and advances with (index + 1) % patients.length.',
      'Pass data and handlers into Search and Records. The parent coordinates the two components.',
    ],
    pitfalls: [
      'Do not display the table merely because the dropdown has a value; Show is the action that reveals it.',
      'A DOM select returns a string. Convert it to a number before comparing it with numeric IDs.',
      'Do not assume patient IDs are contiguous or equal to array indexes.',
      'A controlled select uses value on the select element, rather than selected on an option.',
    ],
    integrationNotes: [
      'This standalone teaching version accepts normalized patients: { id, name, dob, height, records: [{ id, date, diagnosis, weight, doctor }] }. IDs must be unique numbers. Example: { id: 1, name: "Alex", dob: "1990-04-12", height: "170 cm", records: [{ id: 11, date: "2024-05-20", diagnosis: "Routine checkup", weight: "68 kg", doctor: "Dr. Lee" }] }.',
      'The public statement names medicalRecords.js but does not expose its full data schema. Map its patient groups and record fields to the documented shape before passing them as patients; keep the starter’s date formatting, table columns, and test selectors when integrating.',
      'Search and Records are included in one file for easy reading. Move them into the corresponding starter files if that project expects separate components.',
    ],
    complexity: 'For P patients and R records for the displayed patient: sorting costs O(P log P) when the patients prop changes; each render takes O(P + R). Navigation state is O(1), and the sorted copy uses O(P) space.',
    testCases: [
      { action: 'Load the component.', expected: 'The placeholder is selected; no record table or Next button appears.' },
      { action: 'Click Show without selecting a patient.', expected: 'An alert asks for a patient name; records remain hidden.' },
      { action: 'Select a patient, then click Show.', expected: 'Their profile and every supplied record appear.' },
      { action: 'Change the dropdown without clicking Show.', expected: 'The currently displayed records stay unchanged.' },
      { action: 'Click Next on the highest patient ID.', expected: 'The records wrap to the lowest patient ID, even if IDs have gaps.' },
    ],
    code: String.raw`import React, { useMemo, useState } from 'react';

function Search({ patients, selectedId, onSelect, onShow }) {
  return (
    <div>
      <select
        aria-label="Patient"
        value={selectedId}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>Select Patient</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
      <button type="button" onClick={onShow}>Show</button>
    </div>
  );
}

function Records({ patient, onNext }) {
  return (
    <section aria-label="Patient records">
      <h2>{patient.name}</h2>
      <p>Date of birth: {patient.dob}</p>
      <p>Height: {patient.height}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Diagnosis</th>
            <th>Weight</th><th>Doctor</th>
          </tr>
        </thead>
        <tbody>
          {patient.records.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.diagnosis}</td>
              <td>{record.weight}</td>
              <td>{record.doctor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={onNext}>Next</button>
    </section>
  );
}

// patients: [{ id, name, dob, height, records: [
//   { id, date, diagnosis, weight, doctor }
// ] }]
export default function PatientMedicalRecords({ patients = [] }) {
  const ordered = useMemo(
    () => [...patients].sort((a, b) => a.id - b.id),
    [patients]
  );
  const [selectedId, setSelectedId] = useState('');
  const [displayedId, setDisplayedId] = useState(null);
  const displayedIndex = ordered.findIndex(
    (patient) => patient.id === displayedId
  );
  const patient = ordered[displayedIndex];

  function showPatient() {
    if (selectedId === '') {
      window.alert('Please select a patient name');
      return;
    }
    setDisplayedId(Number(selectedId));
  }

  function nextPatient() {
    if (displayedIndex === -1 || ordered.length === 0) return;
    const nextIndex = (displayedIndex + 1) % ordered.length;
    setDisplayedId(ordered[nextIndex].id);
  }

  return (
    <main>
      <Search
        patients={ordered}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onShow={showPatient}
      />
      {patient && <Records patient={patient} onNext={nextPatient} />}
    </main>
  );
}`,
  },
  {
    slug: 'blog-post',
    title: 'Blog Post',
    difficulty: 'Medium',
    topics: ['Controlled inputs', 'Immutable updates', 'List keys'],
    sourceUrl: 'https://www.hackerrank.com/challenges/blog-post/problem',
    summary: 'Create posts from a title and description, display them as cards, and delete individual posts.',
    requirements: [
      'Provide a title input, description textarea, and Create button.',
      'Only create a post when both fields contain content; clear them after creation.',
      'Render the posts in a grid, with a title, description, and Delete button for each.',
      'Deleting one post leaves the others intact.',
    ],
    steps: [
      'Use controlled state for the two draft fields and an array for published posts.',
      'Validate the draft before updating the array. Keep ID generation in the event handler so state updaters stay pure.',
      'Append with a functional state update and clear the draft after success.',
      'Give each post a stable ID. Delete by filtering that ID out, even when two posts have identical text.',
    ],
    pitfalls: [
      'Do not mutate the posts array with push or splice.',
      'An array index is not a stable identity after deletion; use the generated ID as the React key.',
      'Generate the ID before calling the state updater. React can invoke updater functions more than once in development.',
    ],
    integrationNotes: [
      'This component takes no props. Keep the starter project’s component export, surrounding markup, and test selectors when transferring the state and event handlers.',
      'The draft is trimmed for validation, but its original text is preserved in the published post.',
    ],
    complexity: 'With N posts, creation copies O(N) references and deletion scans O(N) posts. Rendering is O(N). Stored posts use O(N + T) space, where T is their total text length.',
    testCases: [
      { action: 'Click Create with either field empty or whitespace-only.', expected: 'No post is added and the draft is kept.' },
      { action: 'Enter both fields and click Create.', expected: 'A post card appears and both draft fields clear.' },
      { action: 'Create two posts with the same title, then delete one.', expected: 'Only the selected post is removed.' },
      { action: 'Delete all posts, then create another.', expected: 'The new post appears normally with a fresh identity.' },
    ],
    code: String.raw`import React, { useRef, useState } from 'react';

export default function BlogPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posts, setPosts] = useState([]);
  const nextId = useRef(1);

  function createPost(event) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const post = { id: nextId.current++, title, description };
    setPosts((previous) => [...previous, post]);
    setTitle('');
    setDescription('');
  }

  function deletePost(id) {
    setPosts((previous) => previous.filter((post) => post.id !== id));
  }

  return (
    <main>
      <form onSubmit={createPost}>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <button type="submit">Create</button>
      </form>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {posts.map((post) => (
          <article key={post.id} style={{ border: '1px solid', padding: 16 }}>
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            <button type="button" onClick={() => deletePost(post.id)}>
              Delete
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}`,
  },
  {
    slug: 'employee-validation',
    title: 'Employee Validation',
    difficulty: 'Medium',
    topics: ['Form validation', 'Derived state', 'Dates'],
    sourceUrl: 'https://www.hackerrank.com/challenges/employee-validation/problem',
    summary: 'Validate four employee fields as they change and allow submission only when all are valid.',
    requirements: [
      'Collect a name, email, six-digit employee ID, and joining date.',
      'The name needs four or more letters/spaces; email needs a valid format; the date must not be in the future.',
      'Show each invalid field’s error immediately, including on the initial empty form.',
      'Enable Submit only when every field passes, then clear the form after submission.',
    ],
    steps: [
      'Store the input strings in one object. A shared change handler updates the property named by the input.',
      'Derive validity from the current strings on every render instead of maintaining a second set of validation state.',
      'Build today’s date from local calendar components so timezone conversion does not move the allowed date boundary.',
      'Compare the selected local midnight with the current timestamp. A numeric time comparison also rejects extended future years that string ordering could misclassify.',
      'Derive the button’s disabled state from whether any error remains. A valid submission resets the entire object.',
    ],
    pitfalls: [
      'Keep the employee ID as a string so leading zeros count toward its six digits.',
      'Avoid toISOString().slice(0, 10) for the local today boundary: it uses UTC.',
      'The initial state includes validation errors. Waiting for blur would change the specified behavior.',
      'Do not mutate the shared empty-form object; replace state with new objects on edits.',
    ],
    integrationNotes: [
      'The email check covers ordinary address syntax rather than attempting the full email RFC. Native browser validation is disabled so the component controls the requested errors.',
      'The name expression follows the stated character rule literally: only A–Z, a–z, and spaces, with at least four characters.',
      'Retain the starter’s data-testid attributes when integrating this standalone component.',
    ],
    complexity: 'Validation takes O(L) time per edit for L total input characters. The four fields and derived errors use O(L) space; there is no growing collection.',
    testCases: [
      { action: 'Load the component.', expected: 'All four errors are visible and Submit is disabled.' },
      { action: 'Enter a short name, malformed email, or a non-six-digit ID.', expected: 'The corresponding error stays visible.' },
      { action: 'Enter ID 001234 and otherwise valid values with today’s date.', expected: 'The ID keeps its leading zeros and Submit becomes enabled.' },
      { action: 'Change the joining date to tomorrow.', expected: 'The date error appears and Submit becomes disabled.' },
      { action: 'Submit valid values.', expected: 'All inputs clear; all errors return; Submit is disabled again.' },
    ],
    code: String.raw`import React, { useState } from 'react';

const emptyForm = { name: '', email: '', employeeId: '', joiningDate: '' };

export default function EmployeeValidationForm() {
  const [form, setForm] = useState(emptyForm);

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const joiningTime = new Date(form.joiningDate + 'T00:00:00').getTime();

  const errors = {
    name: /^[A-Za-z ]{4,}$/.test(form.name)
      ? '' : 'Name must be at least 4 characters long and only contain letters and spaces.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? '' : 'Email must be a valid email address.',
    employeeId: /^\d{6}$/.test(form.employeeId)
      ? '' : 'Employee ID must be exactly 6 digits.',
    joiningDate: form.joiningDate !== '' && joiningTime <= now.getTime()
      ? '' : 'Joining Date cannot be in the future.',
  };
  const valid = Object.values(errors).every((error) => error === '');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (valid) setForm({ ...emptyForm });
  }

  const fields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'employeeId', label: 'Employee ID', type: 'text' },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={form[field.name]}
            onChange={handleChange}
            inputMode={field.name === 'employeeId' ? 'numeric' : undefined}
            max={field.type === 'date' ? today : undefined}
            aria-invalid={Boolean(errors[field.name])}
            aria-describedby={errors[field.name] ? field.name + '-error' : undefined}
          />
          {errors[field.name] && (
            <p id={field.name + '-error'} role="alert">{errors[field.name]}</p>
          )}
        </div>
      ))}
      <button type="submit" disabled={!valid}>Submit</button>
    </form>
  );
}`,
  },
  {
    slug: 'react-word-omitter',
    title: 'Word Omitter',
    difficulty: 'Hard',
    topics: ['Derived state', 'Filtering', 'Controlled inputs'],
    sourceUrl: 'https://www.hackerrank.com/challenges/react-word-omitter/problem',
    summary: 'Filter selected words from live input, with a toggle that restores the original sentence and a Clear action.',
    requirements: [
      'Receive the omitted words through the omitWords prop.',
      'Update the displayed output while the user types; omission is enabled initially.',
      'Allow toggling between filtered output and the complete input.',
      'Clear both input and output with one action; an empty input produces an empty output.',
    ],
    steps: [
      'Keep only the source text and the omission toggle in state. The output can be calculated from them.',
      'Build a Set from omitWords for direct membership checks.',
      'In omission mode, split the text into tokens, keep tokens outside the Set, and join them. In show-all mode, return the original text.',
      'Clear only the text. Both input and derived output clear, while the selected mode remains unchanged.',
    ],
    pitfalls: [
      'Do not overwrite the original text with the filtered text; the toggle must be able to restore it.',
      'Do not use substring replacement: omitting "a" should not delete letters inside other words.',
      'Avoid storing output in separate state that can fall out of sync with the input or omitWords prop.',
    ],
    integrationNotes: [
      'Example usage: <WordOmitter omitWords={["a", "the"]} />.',
      'The public statement does not specify case, punctuation, or whitespace normalization. This version uses exact, case-sensitive whitespace-delimited tokens and single spaces in filtered output. Show-all mode preserves the original text. If the supplied tests specify different matching rules, adjust token normalization and Set construction together.',
      'Keep the starter’s element selectors when adding the handlers to its existing markup.',
    ],
    complexity: 'For N input characters and M omitted-word characters, building the Set costs O(M) when omitWords changes. Filtering costs O(N) expected time and O(N) temporary space; the Set occupies O(M) space.',
    testCases: [
      { action: 'Load with omitWords containing "a".', expected: 'Input and output are empty, and the toggle reads Show All Words.' },
      { action: 'Type "This is a test sentence.".', expected: 'The output becomes "This is test sentence.".' },
      { action: 'Toggle to show all, then toggle back.', expected: 'The original sentence returns, then filtering resumes without losing input.' },
      { action: 'Type "cat a" with "a" omitted.', expected: 'The whole word "a" disappears and "cat" remains intact.' },
      { action: 'Click Clear in either mode.', expected: 'Both text areas become empty and the selected mode is preserved.' },
    ],
    code: String.raw`import React, { useMemo, useState } from 'react';

export default function WordOmitter({ omitWords = [] }) {
  const [text, setText] = useState('');
  const [omitEnabled, setOmitEnabled] = useState(true);
  const omitted = useMemo(() => new Set(omitWords), [omitWords]);

  // Matching is exact and case-sensitive; see the integration notes.
  const output = omitEnabled
    ? text.split(/\s+/).filter((word) => word && !omitted.has(word)).join(' ')
    : text;

  return (
    <main>
      <label>
        Sentence
        <input value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <button type="button" onClick={() => setOmitEnabled((enabled) => !enabled)}>
        {omitEnabled ? 'Show All Words' : 'Omit Words'}
      </button>
      <button type="button" onClick={() => setText('')}>Clear</button>
      <p aria-label="Filtered output" aria-live="polite">{output}</p>
    </main>
  );
}`,
  },
  {
    slug: 'cryptorank-exchange',
    title: 'CryptoRank Exchange',
    difficulty: 'Medium',
    topics: ['Validation', 'Derived state', 'Number formatting'],
    sourceUrl: 'https://www.hackerrank.com/challenges/cryptorank-exchange/problem',
    summary: 'Validate an exchange amount against a balance and calculate the coin quantity for each supplied rate.',
    requirements: [
      'Start with an empty amount, no error, and zero coins displayed to eight decimal places.',
      'Accept amounts from 0.01 through the available balance, inclusive.',
      'Update each coin quantity immediately using amount multiplied by its exchange rate.',
      'Show validation feedback for invalid input and n/a for nonempty invalid amounts.',
    ],
    steps: [
      'Store the input as a string so an empty field stays distinguishable from numeric zero.',
      'Track whether the user edited the field. This separates the initial empty state from an input cleared later.',
      'Derive a single validation message from emptiness, numeric validity, the minimum, and the balance.',
      'Calculate rows from the current amount and rates. Use toFixed(8) only for display, without saving a second table state.',
    ],
    pitfalls: [
      'Number("") is zero, so check for empty input before converting.',
      'The challenge defines rate as coins per currency unit: multiply by the rate.',
      'toFixed returns a string, which is useful here because trailing zeros must remain visible.',
      'Keep pristine-empty and edited-empty states distinct; the initial render must not show an error.',
    ],
    integrationNotes: [
      'Props: balance is a finite nonnegative number; currencies is an array of { code, name, rate }, with unique codes and finite nonnegative rates. Example: <CryptoRankExchange balance={1000} currencies={[{ code: "BTC", name: "Bitcoin", rate: 0.00002 }]} />. Map the starter’s supplied currency data to these field names.',
      'The public statement truncates the below-minimum error message. minimumError is therefore configurable; use the exact wording from your starter tests if provided.',
      'The public statement is inconsistent about clearing the input. This solution follows its specific cleared-input example: show the empty-input error and 0.00000000. Nonempty invalid amounts show n/a. Keep the starter selectors when integrating.',
    ],
    complexity: 'For C currencies and L amount characters, each edit takes O(C + L) time, including rendering the table. Component state uses O(L) space; the rendered rows use O(C) space.',
    testCases: [
      { action: 'Load with balance 100 and rate 0.25.', expected: 'The empty input has no error and displays 0.00000000 coins.' },
      { action: 'Enter 10.', expected: 'The quantity becomes 2.50000000.' },
      { action: 'Enter exactly 0.01, then exactly the balance.', expected: 'Both boundary values are accepted.' },
      { action: 'Enter 0 or an amount above the balance.', expected: 'A validation error appears and the quantity reads n/a.' },
      { action: 'Clear the amount after editing.', expected: 'The empty-input error appears and the quantity returns to 0.00000000.' },
    ],
    code: String.raw`import React, { useState } from 'react';

// currencies: [{ code: 'BTC', name: 'Bitcoin', rate: 0.00002 }]
export default function CryptoRankExchange({
  balance,
  currencies,
  minimumError = 'Amount must be at least 0.01',
}) {
  const [amount, setAmount] = useState('');
  const [edited, setEdited] = useState(false);
  const empty = amount.trim() === '';
  const numericAmount = Number(amount);

  let error = '';
  if (edited) {
    if (empty) error = 'Amount cannot be empty';
    else if (!Number.isFinite(numericAmount)) error = 'Enter a valid amount';
    else if (numericAmount < 0.01) error = minimumError;
    else if (numericAmount > balance) error = 'Amount cannot exceed the available balance';
  }

  function changeAmount(event) {
    setEdited(true);
    setAmount(event.target.value);
  }

  function coinsFor(rate) {
    // Follow the public statement's explicit cleared-input example.
    if (empty) return '0.00000000';
    if (error) return 'n/a';
    return (numericAmount * rate).toFixed(8);
  }

  return (
    <main>
      <p>Available balance: {balance}</p>
      <label>
        Amount
        <input
          type="number"
          step="any"
          value={amount}
          onChange={changeAmount}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'amount-error' : undefined}
        />
      </label>
      {error && <p id="amount-error" role="alert">{error}</p>}
      <table>
        <thead>
          <tr><th>Currency</th><th>Exchange Rate</th><th>Number of Coins</th></tr>
        </thead>
        <tbody>
          {currencies.map((currency) => (
            <tr key={currency.code}>
              <td>{currency.name}</td>
              <td>{currency.rate}</td>
              <td>{coinsFor(currency.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}`,
  },
];
