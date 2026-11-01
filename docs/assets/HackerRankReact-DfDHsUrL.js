import{aJ as w,aK as b,aL as e,aM as c,aN as k,aO as S}from"./index-BZ-vOFSx.js";const j=[{slug:"item-list-manager",title:"Item List Manager",difficulty:"Medium",topics:["useState","Controlled inputs","Immutable arrays"],summary:"Append the entered text to a list, then clear the input.",requirements:["Start with an empty input and an empty unordered list.","Add Item appends the input text in insertion order.","Clear the input after adding an item; ignore empty submissions."],steps:["Keep two pieces of state: the text currently being edited and the array of saved items.","Connect the input value and onChange handler so React owns the current text.","On submit, reject blank input and append with a new array. The functional setter receives the latest list.","Clear only the input state. Render the saved array with map inside a ul."],pitfalls:["Calling items.push mutates the existing state. Use [...previous, input] instead.","A form submission reloads the page unless you call preventDefault.","Array indexes are acceptable keys here because the list only appends. Use persistent IDs if you later add deletion or reordering."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load the component.",expected:"The input and list are empty."},{action:"Add Alpha, then Beta.",expected:"The list contains Alpha followed by Beta; the input clears each time."},{action:"Submit empty text or spaces only.",expected:"The list does not change."},{action:"Add the same text twice.",expected:"Both entries remain; this is a list, not a set."}],complexity:"With n saved items, adding copies and renders O(n) entries. Stored list space is O(n), excluding the characters in the strings.",integrationNotes:["This is a standalone component. Keep the starter project’s component export, classes, and data-testid attributes when transplanting the state and handlers.","This solution also treats whitespace-only input as empty."],sourceUrl:"https://www.hackerrank.com/challenges/item-list-manager/problem"},{slug:"code-review-feedback",title:"Code Review Feedback",difficulty:"Medium",topics:["useState","Object updates","Independent counters"],summary:"Track independent positive and negative vote counts for five code-quality categories.",requirements:["Display Readability, Performance, Security, Documentation, and Testing.","Each category starts with zero upvotes and zero downvotes.","Each vote increments only its own counter, with a subtle visual update."],steps:["Create a separate object for each category with its name and two counters.","Pass the category index and counter name to one vote handler.","Map the previous array, copying only the category being changed. Increment the selected field with a computed property name.","Render both counts from state. Key each count span by its number so the small animation restarts when that count changes."],pitfalls:["A downvote increases the downvote count; it does not subtract from the upvote count.","Array.fill with a single object shares that object between rows. map creates independent objects.","Use a functional state update so rapid clicks build on the latest counts."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load the component.",expected:"Five categories appear with ten zero counters."},{action:"Upvote Readability twice.",expected:"Its upvote count becomes 2; all other counters remain zero."},{action:"Downvote Performance once.",expected:"Only its downvote count becomes 1."},{action:"Vote in both directions on one category.",expected:"Each counter increases independently."}],complexity:"With k categories, each vote takes O(k) for the array update and render, with O(k) stored state. Here k is fixed at 5, so both are O(1).",integrationNotes:["Preserve starter test selectors when copying this standalone component into HackerRank. The accessible button labels distinguish the categories without inventing test IDs."],sourceUrl:"https://www.hackerrank.com/challenges/code-review-feedback/problem"},{slug:"react-article-sorting",title:"Article Sorting",difficulty:"Hard",topics:["Derived state","Sorting","useMemo"],summary:"Render articles in a table and switch between highest-voted and newest-first order.",requirements:["Accept articles with title, numeric upvotes, and an ISO YYYY-MM-DD date.","Initially order by descending upvotes.","Most Upvoted and Most Recent choose descending vote and date order respectively.","The challenge guarantees unique dates and upvote counts."],steps:["Store only the chosen sort mode. The sorted articles can be calculated from that mode and the articles prop.","Copy articles before sorting because sort changes its array in place.","Use b.upvotes - a.upvotes for highest first. Fixed-width ISO dates can be compared as strings for newest first.","Memoize the sorted copy and render one table row per article."],pitfalls:["Sorting the articles prop directly mutates data owned by the parent.","Reversing an already-sorted list does not switch between two different sort fields.","Duplicating props into state can leave the table stale when the parent passes new articles."],code:`import { useMemo, useState } from 'react';

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
}`,testCases:[{action:"Pass articles with vote counts 4, 20, and 9.",expected:"The initial table orders them 20, 9, 4."},{action:"Choose Most Recent, then Most Upvoted.",expected:"Dates descend first; vote counts descend after switching back."},{action:"Freeze the input array before rendering.",expected:"Sorting still works and the original order stays unchanged."},{action:"Pass a new articles array after rendering.",expected:"The table updates using the currently selected mode."}],complexity:"Sorting n articles takes O(n log n) time when articles or the mode changes. The copied sorted list uses O(n) space; rendering the table takes O(n).",integrationNotes:["Supply the original articles array as a prop. If the starter places the sorting buttons in App, keep that layout and move sortBy to App, passing the sorted array to Articles.","Keep starter exports, styling, and data-testid attributes. Date is a valid row key under the challenge’s uniqueness guarantee."],sourceUrl:"https://www.hackerrank.com/challenges/react-article-sorting/problem"},{slug:"react-contact-form",title:"Contact Form",difficulty:"Medium",topics:["Controlled forms","Validation","Conditional rendering"],summary:"Validate a contact form and display a snapshot of a successful submission.",requirements:["Collect a name, email address, and message.","Reject an incomplete submission with the required error message.","Display a valid submission below the form and clear the inputs.","Initially show neither submitted details nor an error."],steps:["Keep draft fields, the last submitted snapshot, and the error message in separate state values.","Use each field’s name to update the corresponding property in the draft object.","Prevent page navigation on submit and check all fields before saving anything.","For valid input, save a copy of the draft, clear the error, and reset the fields. Render the saved snapshot independently of the draft."],pitfalls:["Rendering submitted details from the draft makes them disappear when you clear the form.","An email input can trigger browser validation. noValidate lets the specified custom presence validation control submission.","Update form objects immutably so edits do not alter a previously saved submission."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Submit with a field missing.",expected:"An error appears and no submitted information is displayed."},{action:"Complete all fields and submit.",expected:"The entered details appear below the form, inputs clear, and the error disappears."},{action:"Edit a draft after a successful submission.",expected:"Previously submitted details do not change while typing."},{action:"Submit a whitespace-only field.",expected:"The submission is rejected."}],complexity:"With L total input characters, presence validation takes O(L) time. Draft and submitted text occupy O(L) space; the number of fields is fixed.",integrationNotes:["The public task specifies nonempty fields; this solution does not add an email-format rule. Whitespace-only fields are treated as empty.","Keep the starter markup’s test IDs when adapting this standalone component."],sourceUrl:"https://www.hackerrank.com/challenges/react-contact-form/problem"},{slug:"react-slideshow-1",title:"Slideshow",difficulty:"Medium",topics:["useState","Array indexing","Boundary conditions"],summary:"Move through a nonempty array of slides while enforcing navigation boundaries.",requirements:["Accept slides containing title and text, and initially show the first one.","Next and Prev move one slide in the corresponding direction.","Disable Prev and Restart at the beginning and Next at the end.","Restart returns to the first slide."],steps:["Store the current array index rather than a second copy of the slide object.","Read the displayed title and text directly from slides[index].","Calculate first/last flags from the index. Use them to disable unavailable actions.","Change the index with functional setters and clamp navigation to the valid range. Restart sets the index to zero."],pitfalls:["The last index is slides.length - 1, not slides.length.","Restart must be disabled along with Prev on the first slide.","With one slide, all three buttons must be disabled."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load multiple slides.",expected:"The first slide appears; Prev and Restart are disabled."},{action:"Advance to the last slide.",expected:"Next is disabled; Prev and Restart remain available."},{action:"Go back, then restart.",expected:"Prev moves back once; Restart returns directly to the beginning."},{action:"Pass a one-slide array.",expected:"The slide is visible and all navigation buttons are disabled."}],complexity:"Each navigation action takes O(1) time and O(1) extra state, excluding the supplied slide data and rendering its text.",integrationNotes:["Pass the provided nonempty slides array as a prop. The exercise uses a fixed array; no duplicated slide state or effect is needed.","Preserve any starter component name, classes, and data-testid attributes while applying the navigation logic."],sourceUrl:"https://www.hackerrank.com/challenges/react-slideshow-1/problem"}],N=[{slug:"patient-medical-records",title:"Patient Medical Records",difficulty:"Medium",topics:["Controlled inputs","Shared state","Conditional rendering"],sourceUrl:"https://www.hackerrank.com/challenges/patient-medical-records/problem",summary:"Choose a patient, reveal their records, and cycle through the patients with wraparound navigation.",requirements:["Search contains a patient dropdown and Show button; Records contains the details, table, and Next button.","Initially select the disabled placeholder and hide the records and Next button.","Show alerts when no patient is selected; otherwise it displays that patient.","Next advances by patient ID and wraps from the last patient to the first."],steps:["Keep the dropdown selection separate from the displayed patient. Changing the dropdown alone should not replace the table.","Sort a copy of the patient list by numeric ID so Next follows the requested order without mutating the input.","Show validates the selection and stores the displayed ID. Look up the corresponding patient during rendering.","Next finds the displayed index and advances with (index + 1) % patients.length.","Pass data and handlers into Search and Records. The parent coordinates the two components."],pitfalls:["Do not display the table merely because the dropdown has a value; Show is the action that reveals it.","A DOM select returns a string. Convert it to a number before comparing it with numeric IDs.","Do not assume patient IDs are contiguous or equal to array indexes.","A controlled select uses value on the select element, rather than selected on an option."],integrationNotes:['This standalone teaching version accepts normalized patients: { id, name, dob, height, records: [{ id, date, diagnosis, weight, doctor }] }. IDs must be unique numbers. Example: { id: 1, name: "Alex", dob: "1990-04-12", height: "170 cm", records: [{ id: 11, date: "2024-05-20", diagnosis: "Routine checkup", weight: "68 kg", doctor: "Dr. Lee" }] }.',"The public statement names medicalRecords.js but does not expose its full data schema. Map its patient groups and record fields to the documented shape before passing them as patients; keep the starter’s date formatting, table columns, and test selectors when integrating.","Search and Records are included in one file for easy reading. Move them into the corresponding starter files if that project expects separate components."],complexity:"For P patients and R records for the displayed patient: sorting costs O(P log P) when the patients prop changes; each render takes O(P + R). Navigation state is O(1), and the sorted copy uses O(P) space.",testCases:[{action:"Load the component.",expected:"The placeholder is selected; no record table or Next button appears."},{action:"Click Show without selecting a patient.",expected:"An alert asks for a patient name; records remain hidden."},{action:"Select a patient, then click Show.",expected:"Their profile and every supplied record appear."},{action:"Change the dropdown without clicking Show.",expected:"The currently displayed records stay unchanged."},{action:"Click Next on the highest patient ID.",expected:"The records wrap to the lowest patient ID, even if IDs have gaps."}],code:String.raw`import React, { useMemo, useState } from 'react';

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
}`},{slug:"blog-post",title:"Blog Post",difficulty:"Medium",topics:["Controlled inputs","Immutable updates","List keys"],sourceUrl:"https://www.hackerrank.com/challenges/blog-post/problem",summary:"Create posts from a title and description, display them as cards, and delete individual posts.",requirements:["Provide a title input, description textarea, and Create button.","Only create a post when both fields contain content; clear them after creation.","Render the posts in a grid, with a title, description, and Delete button for each.","Deleting one post leaves the others intact."],steps:["Use controlled state for the two draft fields and an array for published posts.","Validate the draft before updating the array. Keep ID generation in the event handler so state updaters stay pure.","Append with a functional state update and clear the draft after success.","Give each post a stable ID. Delete by filtering that ID out, even when two posts have identical text."],pitfalls:["Do not mutate the posts array with push or splice.","An array index is not a stable identity after deletion; use the generated ID as the React key.","Generate the ID before calling the state updater. React can invoke updater functions more than once in development."],integrationNotes:["This component takes no props. Keep the starter project’s component export, surrounding markup, and test selectors when transferring the state and event handlers.","The draft is trimmed for validation, but its original text is preserved in the published post."],complexity:"With N posts, creation copies O(N) references and deletion scans O(N) posts. Rendering is O(N). Stored posts use O(N + T) space, where T is their total text length.",testCases:[{action:"Click Create with either field empty or whitespace-only.",expected:"No post is added and the draft is kept."},{action:"Enter both fields and click Create.",expected:"A post card appears and both draft fields clear."},{action:"Create two posts with the same title, then delete one.",expected:"Only the selected post is removed."},{action:"Delete all posts, then create another.",expected:"The new post appears normally with a fresh identity."}],code:String.raw`import React, { useRef, useState } from 'react';

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
}`},{slug:"employee-validation",title:"Employee Validation",difficulty:"Medium",topics:["Form validation","Derived state","Dates"],sourceUrl:"https://www.hackerrank.com/challenges/employee-validation/problem",summary:"Validate four employee fields as they change and allow submission only when all are valid.",requirements:["Collect a name, email, six-digit employee ID, and joining date.","The name needs four or more letters/spaces; email needs a valid format; the date must not be in the future.","Show each invalid field’s error immediately, including on the initial empty form.","Enable Submit only when every field passes, then clear the form after submission."],steps:["Store the input strings in one object. A shared change handler updates the property named by the input.","Derive validity from the current strings on every render instead of maintaining a second set of validation state.","Build today’s date from local calendar components so timezone conversion does not move the allowed date boundary.","Compare the selected local midnight with the current timestamp. A numeric time comparison also rejects extended future years that string ordering could misclassify.","Derive the button’s disabled state from whether any error remains. A valid submission resets the entire object."],pitfalls:["Keep the employee ID as a string so leading zeros count toward its six digits.","Avoid toISOString().slice(0, 10) for the local today boundary: it uses UTC.","The initial state includes validation errors. Waiting for blur would change the specified behavior.","Do not mutate the shared empty-form object; replace state with new objects on edits."],integrationNotes:["The email check covers ordinary address syntax rather than attempting the full email RFC. Native browser validation is disabled so the component controls the requested errors.","The name expression follows the stated character rule literally: only A–Z, a–z, and spaces, with at least four characters.","Retain the starter’s data-testid attributes when integrating this standalone component."],complexity:"Validation takes O(L) time per edit for L total input characters. The four fields and derived errors use O(L) space; there is no growing collection.",testCases:[{action:"Load the component.",expected:"All four errors are visible and Submit is disabled."},{action:"Enter a short name, malformed email, or a non-six-digit ID.",expected:"The corresponding error stays visible."},{action:"Enter ID 001234 and otherwise valid values with today’s date.",expected:"The ID keeps its leading zeros and Submit becomes enabled."},{action:"Change the joining date to tomorrow.",expected:"The date error appears and Submit becomes disabled."},{action:"Submit valid values.",expected:"All inputs clear; all errors return; Submit is disabled again."}],code:String.raw`import React, { useState } from 'react';

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
}`},{slug:"react-word-omitter",title:"Word Omitter",difficulty:"Hard",topics:["Derived state","Filtering","Controlled inputs"],sourceUrl:"https://www.hackerrank.com/challenges/react-word-omitter/problem",summary:"Filter selected words from live input, with a toggle that restores the original sentence and a Clear action.",requirements:["Receive the omitted words through the omitWords prop.","Update the displayed output while the user types; omission is enabled initially.","Allow toggling between filtered output and the complete input.","Clear both input and output with one action; an empty input produces an empty output."],steps:["Keep only the source text and the omission toggle in state. The output can be calculated from them.","Build a Set from omitWords for direct membership checks.","In omission mode, split the text into tokens, keep tokens outside the Set, and join them. In show-all mode, return the original text.","Clear only the text. Both input and derived output clear, while the selected mode remains unchanged."],pitfalls:["Do not overwrite the original text with the filtered text; the toggle must be able to restore it.",'Do not use substring replacement: omitting "a" should not delete letters inside other words.',"Avoid storing output in separate state that can fall out of sync with the input or omitWords prop."],integrationNotes:['Example usage: <WordOmitter omitWords={["a", "the"]} />.',"The public statement does not specify case, punctuation, or whitespace normalization. This version uses exact, case-sensitive whitespace-delimited tokens and single spaces in filtered output. Show-all mode preserves the original text. If the supplied tests specify different matching rules, adjust token normalization and Set construction together.","Keep the starter’s element selectors when adding the handlers to its existing markup."],complexity:"For N input characters and M omitted-word characters, building the Set costs O(M) when omitWords changes. Filtering costs O(N) expected time and O(N) temporary space; the Set occupies O(M) space.",testCases:[{action:'Load with omitWords containing "a".',expected:"Input and output are empty, and the toggle reads Show All Words."},{action:'Type "This is a test sentence.".',expected:'The output becomes "This is test sentence.".'},{action:"Toggle to show all, then toggle back.",expected:"The original sentence returns, then filtering resumes without losing input."},{action:'Type "cat a" with "a" omitted.',expected:'The whole word "a" disappears and "cat" remains intact.'},{action:"Click Clear in either mode.",expected:"Both text areas become empty and the selected mode is preserved."}],code:String.raw`import React, { useMemo, useState } from 'react';

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
}`},{slug:"cryptorank-exchange",title:"CryptoRank Exchange",difficulty:"Medium",topics:["Validation","Derived state","Number formatting"],sourceUrl:"https://www.hackerrank.com/challenges/cryptorank-exchange/problem",summary:"Validate an exchange amount against a balance and calculate the coin quantity for each supplied rate.",requirements:["Start with an empty amount, no error, and zero coins displayed to eight decimal places.","Accept amounts from 0.01 through the available balance, inclusive.","Update each coin quantity immediately using amount multiplied by its exchange rate.","Show validation feedback for invalid input and n/a for nonempty invalid amounts."],steps:["Store the input as a string so an empty field stays distinguishable from numeric zero.","Track whether the user edited the field. This separates the initial empty state from an input cleared later.","Derive a single validation message from emptiness, numeric validity, the minimum, and the balance.","Calculate rows from the current amount and rates. Use toFixed(8) only for display, without saving a second table state."],pitfalls:['Number("") is zero, so check for empty input before converting.',"The challenge defines rate as coins per currency unit: multiply by the rate.","toFixed returns a string, which is useful here because trailing zeros must remain visible.","Keep pristine-empty and edited-empty states distinct; the initial render must not show an error."],integrationNotes:['Props: balance is a finite nonnegative number; currencies is an array of { code, name, rate }, with unique codes and finite nonnegative rates. Example: <CryptoRankExchange balance={1000} currencies={[{ code: "BTC", name: "Bitcoin", rate: 0.00002 }]} />. Map the starter’s supplied currency data to these field names.',"The public statement truncates the below-minimum error message. minimumError is therefore configurable; use the exact wording from your starter tests if provided.","The public statement is inconsistent about clearing the input. This solution follows its specific cleared-input example: show the empty-input error and 0.00000000. Nonempty invalid amounts show n/a. Keep the starter selectors when integrating."],complexity:"For C currencies and L amount characters, each edit takes O(C + L) time, including rendering the table. Component state uses O(L) space; the rendered rows use O(C) space.",testCases:[{action:"Load with balance 100 and rate 0.25.",expected:"The empty input has no error and displays 0.00000000 coins."},{action:"Enter 10.",expected:"The quantity becomes 2.50000000."},{action:"Enter exactly 0.01, then exactly the balance.",expected:"Both boundary values are accepted."},{action:"Enter 0 or an amount above the balance.",expected:"A validation error appears and the quantity reads n/a."},{action:"Clear the amount after editing.",expected:"The empty-input error appears and the quantity returns to 0.00000000."}],code:String.raw`import React, { useState } from 'react';

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
}`}],f=["item-list-manager","code-review-feedback","react-article-sorting","react-contact-form","patient-medical-records","blog-post","react-slideshow-1","employee-validation","react-word-omitter","cryptorank-exchange"],n=[...j,...N].sort((t,r)=>f.indexOf(t.slug)-f.indexOf(r.slug)),l="/hackerrank-react",h="rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-6 light:border-gray-200 light:bg-gray-50",i="text-sm leading-relaxed text-gray-400 light:text-gray-600",m="text-lg font-semibold text-white light:text-gray-900",o="text-sm text-blue-400 hover:underline light:text-blue-700";function y({value:t}){return e.jsx("span",{className:`rounded-full px-2.5 py-1 text-xs font-medium ${t==="Hard"?"bg-rose-500/10 text-rose-400 light:bg-rose-100 light:text-rose-700":"bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-800"}`,children:t})}function C(){const[t,r]=b.useState(""),d=t.trim().toLowerCase(),p=n.filter(s=>[s.title,s.summary,...s.topics].join(" ").toLowerCase().includes(d));return e.jsxs("div",{className:"space-y-6 pb-8",children:[e.jsxs("header",{children:[e.jsx("p",{className:"mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 light:text-emerald-700",children:"React practice"}),e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:"HackerRank React"}),e.jsxs("p",{className:`mt-2 ${i}`,children:["All ",n.length," public practice questions, with JavaScript solutions, step-by-step explanations, and edge cases to check."]}),e.jsx("a",{className:`mt-3 inline-block ${o}`,href:"https://www.hackerrank.com/domains/react",target:"_blank",rel:"noopener noreferrer",children:"Open HackerRank’s React catalog ↗"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"react-question-search",className:"mb-2 block text-sm font-medium text-gray-200 light:text-gray-800",children:"Find a question or concept"}),e.jsx("input",{id:"react-question-search",type:"search",value:t,onChange:s=>r(s.target.value),placeholder:"Search sorting, forms, state…",className:"w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 light:border-gray-300 light:bg-white light:text-gray-900"}),e.jsxs("p",{className:`mt-2 ${i}`,role:"status",children:[p.length," of ",n.length," questions"]})]}),p.length===0?e.jsxs("div",{className:h,children:[e.jsxs("p",{className:i,children:["No questions match “",t,"”."]}),e.jsx("button",{className:`mt-3 ${o}`,onClick:()=>r(""),children:"Clear search"})]}):e.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:p.map(s=>e.jsxs(c,{to:`${l}/${s.slug}`,className:"group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-colors hover:border-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-200 light:bg-gray-50 light:hover:border-blue-500",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between gap-3",children:[e.jsx("span",{className:"font-mono text-xs text-gray-500",children:String(n.indexOf(s)+1).padStart(2,"0")}),e.jsx(y,{value:s.difficulty})]}),e.jsx("h2",{className:"font-semibold text-white group-hover:text-blue-300 light:text-gray-900 light:group-hover:text-blue-700",children:s.title}),e.jsx("p",{className:`mt-2 ${i}`,children:s.summary}),e.jsx("div",{className:"mt-4 flex flex-wrap gap-2",children:s.topics.map(u=>e.jsx("span",{className:"rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 light:bg-gray-200 light:text-gray-700",children:u},u))}),e.jsx("p",{className:"mt-4 text-xs font-medium text-blue-400 light:text-blue-700",children:"Read solution →"})]},s.slug))})]})}function D({challenge:t}){const r=k(),[d,p]=b.useState("idle"),s=n.findIndex(a=>a.slug===t.slug),u=n[s-1],g=n[s+1];async function x(){try{await navigator.clipboard.writeText(t.code),p("copied")}catch{p("failed")}}return e.jsxs("article",{className:"min-w-0 space-y-6 pb-8",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsx(c,{className:o,to:l,children:"← All React questions"}),e.jsxs("label",{className:"flex flex-wrap items-center gap-2 text-xs text-gray-400 light:text-gray-600",children:["Jump to question",e.jsx("select",{"aria-label":"Jump to question",value:t.slug,onChange:a=>r(`${l}/${a.target.value}`),className:"max-w-full rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-sm text-gray-200 light:border-gray-300 light:bg-white light:text-gray-800",children:n.map((a,v)=>e.jsxs("option",{value:a.slug,children:[v+1,". ",a.title]},a.slug))})]})]}),e.jsxs("header",{children:[e.jsxs("div",{className:"mb-3 flex items-center gap-3",children:[e.jsxs("span",{className:"text-xs text-gray-500",children:["Question ",s+1," of ",n.length]}),e.jsx(y,{value:t.difficulty})]}),e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:t.title}),e.jsx("p",{className:`mt-2 ${i}`,children:t.summary}),e.jsx("a",{className:`mt-3 inline-block ${o}`,href:t.sourceUrl,target:"_blank",rel:"noopener noreferrer",children:"Original question on HackerRank ↗"})]}),e.jsxs("section",{className:h,"aria-labelledby":"requirements-heading",children:[e.jsx("h2",{id:"requirements-heading",className:m,children:"What to build"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${i}`,children:t.requirements.map(a=>e.jsx("li",{children:a},a))})]}),e.jsxs("section",{"aria-labelledby":"solution-heading",className:"min-w-0 space-y-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsx("h2",{id:"solution-heading",className:m,children:"JavaScript + React solution"}),e.jsx("button",{onClick:x,className:"rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-800 light:hover:bg-gray-200",children:d==="copied"?"Copied!":"Copy solution"})]}),e.jsx("p",{className:i,children:"Use this standalone implementation as a reference. In HackerRank’s starter project, keep its existing component exports and test selectors."}),d!=="idle"&&e.jsx("p",{role:"status",className:i,children:d==="copied"?"Solution copied to clipboard.":"Clipboard access is unavailable. Select and copy the code below."}),e.jsx(S,{code:t.code,language:"jsx"}),t.integrationNotes&&t.integrationNotes.length>0&&e.jsxs("div",{className:h,children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Using this solution"}),e.jsx("ul",{className:`mt-2 list-disc space-y-2 pl-5 ${i}`,children:t.integrationNotes.map(a=>e.jsx("li",{className:"whitespace-pre-wrap break-words",children:a},a))})]})]}),e.jsxs("section",{className:h,"aria-labelledby":"approach-heading",children:[e.jsx("h2",{id:"approach-heading",className:m,children:"How it works"}),e.jsx("ol",{className:`mt-3 list-decimal space-y-3 pl-5 ${i}`,children:t.steps.map(a=>e.jsx("li",{className:"pl-1",children:a},a))}),e.jsxs("div",{className:"mt-5 border-t border-gray-800 pt-4 light:border-gray-200",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Time and space"}),e.jsx("p",{className:`mt-2 ${i}`,children:t.complexity})]})]}),e.jsxs("section",{className:h,"aria-labelledby":"pitfalls-heading",children:[e.jsx("h2",{id:"pitfalls-heading",className:m,children:"Common mistakes"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${i}`,children:t.pitfalls.map(a=>e.jsx("li",{children:a},a))})]}),e.jsxs("section",{"aria-labelledby":"checks-heading",children:[e.jsx("h2",{id:"checks-heading",className:m,children:"Check your understanding"}),e.jsx("div",{className:"mt-3 overflow-x-auto rounded-lg border border-gray-800 light:border-gray-200",children:e.jsxs("table",{className:"w-full text-left text-sm",children:[e.jsx("thead",{className:"bg-gray-900 text-gray-200 light:bg-gray-100 light:text-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",className:"px-4 py-3 font-medium",children:"Try this"}),e.jsx("th",{scope:"col",className:"px-4 py-3 font-medium",children:"Expected behavior"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-800 text-gray-400 light:divide-gray-200 light:text-gray-600",children:t.testCases.map(a=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 align-top",children:a.action}),e.jsx("td",{className:"px-4 py-3 align-top",children:a.expected})]},a.action))})]})})]}),e.jsxs("nav",{"aria-label":"React question navigation",className:"flex flex-wrap justify-between gap-4 border-t border-gray-800 pt-5 light:border-gray-200",children:[u?e.jsxs(c,{className:o,to:`${l}/${u.slug}`,children:["← ",u.title]}):e.jsx(c,{className:o,to:l,children:"← All React questions"}),g?e.jsxs(c,{className:o,to:`${l}/${g.slug}`,children:[g.title," →"]}):e.jsx(c,{className:o,to:l,children:"Back to all questions →"})]})]})}function I(){const{slug:t}=w();if(b.useEffect(()=>{window.scrollTo({top:0,left:0})},[t]),!t)return e.jsx(C,{});const r=n.find(d=>d.slug===t);return r?e.jsx(D,{challenge:r},t):e.jsxs("div",{className:"space-y-3",children:[e.jsx("h1",{className:m,children:"React question not found"}),e.jsx(c,{className:o,to:l,children:"View all React questions"})]})}export{I as default};
