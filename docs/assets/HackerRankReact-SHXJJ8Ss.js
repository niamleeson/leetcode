import{bb as j,aM as S,aO as e,aP as v,bc as N,aQ as C}from"./index-CfGSJCy8.js";const q=[{slug:"item-list-manager",title:"Item List Manager",difficulty:"Medium",topics:["useState","Controlled inputs","Immutable arrays"],summary:"Append the entered text to a list, then clear the input.",prompt:"Build a React screen for collecting a list of text items. Show a text field, an Add Item button, and an unordered list that is empty when the screen first opens. Users should be able to add several items in sequence without losing earlier entries. Empty submissions should leave the list unchanged.",example:{actions:"Enter Notebook and click Add Item. Then enter Pencil and click Add Item again.",result:"The list shows Notebook followed by Pencil, and the text field is empty after each successful addition."},requirements:["Start with an empty input and an empty unordered list.","Add Item appends the input text in insertion order.","Clear the input after adding an item; ignore empty submissions."],steps:["Keep two pieces of state: the text currently being edited and the array of saved items.","Connect the input value and onChange handler so React owns the current text.","On submit, reject blank input and append with a new array. The functional setter receives the latest list.","Clear only the input state. Render the saved array with map inside a ul."],pitfalls:["Calling items.push mutates the existing state. Use [...previous, input] instead.","A form submission reloads the page unless you call preventDefault.","Array indexes are acceptable keys here because the list only appends. Use persistent IDs if you later add deletion or reordering."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load the component.",expected:"The input and list are empty."},{action:"Add Alpha, then Beta.",expected:"The list contains Alpha followed by Beta; the input clears each time."},{action:"Submit empty text or spaces only.",expected:"The list does not change."},{action:"Add the same text twice.",expected:"Both entries remain; this is a list, not a set."}],complexity:"With n saved items, adding copies and renders O(n) entries. Stored list space is O(n), excluding the characters in the strings.",integrationNotes:["This is a standalone component. Keep the starter project’s component export, classes, and data-testid attributes when transplanting the state and handlers.","This solution also treats whitespace-only input as empty."],sourceUrl:"https://www.hackerrank.com/challenges/item-list-manager/problem"},{slug:"code-review-feedback",title:"Code Review Feedback",difficulty:"Medium",topics:["useState","Object updates","Independent counters"],summary:"Track independent positive and negative vote counts for five code-quality categories.",prompt:"Create a React feedback panel for reviewing code quality. Present five categories, each with its own Upvote and Downvote buttons and two visible counters. All counters begin at zero. Users can vote repeatedly in either direction, and the affected count should update immediately with a subtle animation while other counts remain unchanged.",example:{actions:"Click Upvote for Testing three times, then click Downvote for Documentation once.",result:"Testing has 3 upvotes and 0 downvotes. Documentation has 0 upvotes and 1 downvote. Every other counter stays at 0."},requirements:["Display Readability, Performance, Security, Documentation, and Testing.","Each category starts with zero upvotes and zero downvotes.","Each vote increments only its own counter, with a subtle visual update."],steps:["Create a separate object for each category with its name and two counters.","Pass the category index and counter name to one vote handler.","Map the previous array, copying only the category being changed. Increment the selected field with a computed property name.","Render both counts from state. Key each count span by its number so the small animation restarts when that count changes."],pitfalls:["A downvote increases the downvote count; it does not subtract from the upvote count.","Array.fill with a single object shares that object between rows. map creates independent objects.","Use a functional state update so rapid clicks build on the latest counts."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load the component.",expected:"Five categories appear with ten zero counters."},{action:"Upvote Readability twice.",expected:"Its upvote count becomes 2; all other counters remain zero."},{action:"Downvote Performance once.",expected:"Only its downvote count becomes 1."},{action:"Vote in both directions on one category.",expected:"Each counter increases independently."}],complexity:"With k categories, each vote takes O(k) for the array update and render, with O(k) stored state. Here k is fixed at 5, so both are O(1).",integrationNotes:["Preserve starter test selectors when copying this standalone component into HackerRank. The accessible button labels distinguish the categories without inventing test IDs."],sourceUrl:"https://www.hackerrank.com/challenges/code-review-feedback/problem"},{slug:"react-article-sorting",title:"Article Sorting",difficulty:"Hard",topics:["Derived state","Sorting","useMemo"],summary:"Render articles in a table and switch between highest-voted and newest-first order.",prompt:"Build an article browser that receives an articles array. Each article contains a title, an upvote count, and a publication date written as YYYY-MM-DD. Show the articles in a table, starting with the highest-voted article. Provide Most Upvoted and Most Recent controls so readers can switch between popularity and publication order.",example:{actions:"Use Hooks with 8 upvotes dated 2026-09-12 and Components with 15 upvotes dated 2026-09-03. Open the page, then click Most Recent.",result:"Initially Components appears before Hooks. After Most Recent, Hooks appears before Components."},requirements:["Accept articles with title, numeric upvotes, and an ISO YYYY-MM-DD date.","Initially order by descending upvotes.","Most Upvoted and Most Recent choose descending vote and date order respectively.","The challenge guarantees unique dates and upvote counts."],steps:["Store only the chosen sort mode. The sorted articles can be calculated from that mode and the articles prop.","Copy articles before sorting because sort changes its array in place.","Use b.upvotes - a.upvotes to put the highest vote count first.","For dates, convert both strings with new Date, then compare their getTime() timestamps. Subtract dateA from dateB to place the newest date first.","Memoize the sorted copy and render one table row per article."],pitfalls:["Sorting the articles prop directly mutates data owned by the parent.","Reversing an already-sorted list does not switch between two different sort fields.","Duplicating props into state can leave the table stale when the parent passes new articles.","Use Date objects only for comparison; keep the original date strings for rendering in the table."],code:`import { useMemo, useState } from 'react';

// articles: [{ title: 'React State', upvotes: 12, date: '2026-10-01' }]
export default function Articles({ articles }) {
  const [sortBy, setSortBy] = useState('upvotes');

  const sortedArticles = useMemo(() => {
    const copy = [...articles];
    copy.sort((a, b) => {
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;

      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
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
}`,testCases:[{action:"Pass articles with vote counts 4, 20, and 9.",expected:"The initial table orders them 20, 9, 4."},{action:"Choose Most Recent, then Most Upvoted.",expected:"Dates descend first; vote counts descend after switching back."},{action:"Freeze the input array before rendering.",expected:"Sorting still works and the original order stays unchanged."},{action:"Pass a new articles array after rendering.",expected:"The table updates using the currently selected mode."}],complexity:"Sorting n articles takes O(n log n) time when articles or the mode changes. The copied sorted list uses O(n) space; rendering the table takes O(n).",integrationNotes:["Supply the original articles array as a prop. If the starter places the sorting buttons in App, keep that layout and move sortBy to App, passing the sorted array to Articles.","Keep starter exports, styling, and data-testid attributes. Date is a valid row key under the challenge’s uniqueness guarantee."],sourceUrl:"https://www.hackerrank.com/challenges/react-article-sorting/problem"},{slug:"react-contact-form",title:"Contact Form",difficulty:"Medium",topics:["Controlled forms","Validation","Conditional rendering"],summary:"Validate a contact form and display a snapshot of a successful submission.",prompt:"Create a React contact form with fields for a person’s name, email address, and message, plus a Submit button. Start with empty fields and no feedback below the form. Require a value in every field before accepting a submission. After a successful submission, show the entered details beneath the form and clear the fields.",example:{actions:"Enter Mira as the name, mira@example.com as the email, and Please send the schedule as the message, then submit.",result:"Those three values appear beneath the form, and all inputs become empty. A submission with a missing value shows the required error instead."},requirements:["Collect a name, email address, and message.","Reject an incomplete submission with the error message: “All fields are required.”","Display a valid submission below the form and clear the inputs.","Initially show neither submitted details nor an error."],steps:["Keep draft fields, the last submitted snapshot, and the error message in separate state values.","Use each field’s name to update the corresponding property in the draft object.","Prevent page navigation on submit and check all fields before saving anything.","For valid input, save a copy of the draft, clear the error, and reset the fields. Render the saved snapshot independently of the draft."],pitfalls:["Rendering submitted details from the draft makes them disappear when you clear the form.","An email input can trigger browser validation. noValidate lets the specified custom presence validation control submission.","Update form objects immutably so edits do not alter a previously saved submission."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Submit with a field missing.",expected:"An error appears and no submitted information is displayed."},{action:"Complete all fields and submit.",expected:"The entered details appear below the form, inputs clear, and the error disappears."},{action:"Edit a draft after a successful submission.",expected:"Previously submitted details do not change while typing."},{action:"Submit a whitespace-only field.",expected:"The submission is rejected."}],complexity:"With L total input characters, presence validation takes O(L) time. Draft and submitted text occupy O(L) space; the number of fields is fixed.",integrationNotes:["The public task specifies nonempty fields; this solution does not add an email-format rule. Whitespace-only fields are treated as empty.","Keep the starter markup’s test IDs when adapting this standalone component."],sourceUrl:"https://www.hackerrank.com/challenges/react-contact-form/problem"},{slug:"react-slideshow-1",title:"Slideshow",difficulty:"Medium",topics:["useState","Array indexing","Boundary conditions"],summary:"Move through a nonempty array of slides while enforcing navigation boundaries.",prompt:"Create a React slideshow that receives a nonempty slides array, where each slide has a title and text. Display the first slide when the component loads. Provide Next, Prev, and Restart controls so users can browse the slides or return to the beginning. Disable any control that cannot move the slideshow from its current position.",example:{actions:"Supply slides titled Introduction, Exercise, and Review. Click Next twice, then click Restart.",result:"Review is shown after the two Next clicks, with Next disabled. Restart returns to Introduction, where Prev and Restart are disabled."},requirements:["Accept slides containing title and text, and initially show the first one.","Next and Prev move one slide in the corresponding direction.","Disable Prev and Restart at the beginning and Next at the end.","Restart returns to the first slide."],steps:["Store the current array index rather than a second copy of the slide object.","Read the displayed title and text directly from slides[index].","Calculate first/last flags from the index. Use them to disable unavailable actions.","Change the index with functional setters and clamp navigation to the valid range. Restart sets the index to zero."],pitfalls:["The last index is slides.length - 1, not slides.length.","Restart must be disabled along with Prev on the first slide.","With one slide, all three buttons must be disabled."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load multiple slides.",expected:"The first slide appears; Prev and Restart are disabled."},{action:"Advance to the last slide.",expected:"Next is disabled; Prev and Restart remain available."},{action:"Go back, then restart.",expected:"Prev moves back once; Restart returns directly to the beginning."},{action:"Pass a one-slide array.",expected:"The slide is visible and all navigation buttons are disabled."}],complexity:"Each navigation action takes O(1) time and O(1) extra state, excluding the supplied slide data and rendering its text.",integrationNotes:["Pass the provided nonempty slides array as a prop. The exercise uses a fixed array; no duplicated slide state or effect is needed.","Preserve any starter component name, classes, and data-testid attributes while applying the navigation logic."],sourceUrl:"https://www.hackerrank.com/challenges/react-slideshow-1/problem"}],O=[{id:"1",data:[{id:6,timestamp:1568550058964,diagnosis:{id:3,name:"Pulmonary embolism",severity:4},vitals:{bloodPressureDiastole:155,bloodPressureSystole:90,pulse:130,breathingRate:29,bodyTemperature:99.2},doctor:{id:2,name:"Dr Arnold Bullock"},userId:1,userName:"John Oliver",userDob:"02-01-1986",meta:{height:168,weight:173}}]},{id:"2",data:[{id:1,timestamp:1565637002408,diagnosis:{id:3,name:"Pulmonary embolism",severity:4},vitals:{bloodPressureDiastole:154,bloodPressureSystole:91,pulse:125,breathingRate:32,bodyTemperature:100},doctor:{id:2,name:"Dr Arnold Bullock"},userId:2,userName:"Bob Martin",userDob:"14-09-1989",meta:{height:174,weight:172}}]},{id:"3",data:[{id:9,timestamp:1548036340751,diagnosis:{id:3,name:"Pulmonary embolism",severity:4},vitals:{bloodPressureDiastole:147,bloodPressureSystole:96,pulse:130,breathingRate:28,bodyTemperature:101},doctor:{id:2,name:"Dr Arnold Bullock"},userId:3,userName:"Helena Fernandez",userDob:"23-12-1987",meta:{height:157,weight:106}}]}],P=[{slug:"patient-medical-records",title:"Patient Medical Records",difficulty:"Medium",topics:["Controlled inputs","Shared state","Conditional rendering"],sourceUrl:"https://www.hackerrank.com/challenges/patient-medical-records/problem",summary:"Choose a patient, reveal their records, and cycle through the patients with wraparound navigation.",prompt:"Build a React app for browsing the three patients supplied in medicalRecords.js. A Search component lets the user choose a patient and request their records. A Records component displays that patient’s details and medical history, with navigation to the next patient. Initially, the patient placeholder is selected and no records are visible.",example:{actions:'Select Helena Fernandez (patient ID "3") and click Show, then click Next.',result:'Show displays Helena’s details and all ten of her records. Next wraps to John Oliver (patient ID "1").'},sampleData:{title:"medicalRecords.js — 3 sample records",description:"One complete record from each patient in the supplied file: John Oliver, Bob Martin, and Helena Fernandez. Each group’s data array is shortened to one record here; the full file contains ten records per patient. Keep the full medicalRecords.js when running the solution.",code:`const medical_records = ${JSON.stringify(O,null,2)};

export default medical_records;`},requirements:["Search contains a patient dropdown and Show button; Records contains the details, table, and Next button.","Initially select the disabled placeholder and hide the records and Next button.","Show alerts “Please select a patient name” when no patient is selected; otherwise it displays that patient.","Next advances by patient ID and wraps from the last patient to the first."],steps:["Keep the dropdown selection separate from the displayed patient. Changing the dropdown alone should not replace the table.","Import medical_records from medicalRecords.js. Each item is a patient group with a string id and a data array. Sort a copy by numeric ID without changing the imported array.","Read the patient’s userName, userDob, and meta.height from data[0]. Map every item in data into a table row using timestamp, diagnosis.name, meta.weight, and doctor.name.","Show validates the selection and stores the displayed ID. Look up the corresponding patient during rendering.","Next finds the displayed index and advances with (index + 1) % patients.length.","Pass data and handlers into Search and Records. The parent coordinates the two components."],pitfalls:["Do not display the table merely because the dropdown has a value; Show is the action that reveals it.",'The group IDs are strings ("1", "2", "3"), matching the DOM select value. Keep selectedId and displayedId as strings; converting them to numbers would break strict equality with patient.id.',"Patient details are inside data[0], and diagnosis and doctor are nested objects. Render their name fields instead of the objects themselves.","Do not assume patient IDs are contiguous or equal to array indexes.","A controlled select uses value on the select element, rather than selected on an option."],integrationNotes:["This solution directly imports the default export from the supplied medicalRecords.js. No data conversion or patients prop is needed. Adjust the relative import path if the component lives in a different folder.","The supplied groups each contain ten records. The three records above are examples for reading the data structure, not a replacement for the full file.","Dates are displayed as DD/MM/YYYY in UTC to keep timestamp formatting consistent across time zones. Keep the starter’s required date format and test selectors when integrating.","Search and Records are included in one file for easy reading. Move them into the corresponding starter files if that project expects separate components."],complexity:"For P patients and R records for the displayed patient: sorting costs O(P log P) once when the module loads; each render takes O(P + R). Navigation state is O(1), and the sorted copy uses O(P) space.",testCases:[{action:"Load the component.",expected:"The placeholder is selected; no record table or Next button appears."},{action:"Click Show without selecting a patient.",expected:"An alert asks for a patient name; records remain hidden."},{action:"Select a patient, then click Show.",expected:"Their profile and every supplied record appear."},{action:"Change the dropdown without clicking Show.",expected:"The currently displayed records stay unchanged."},{action:"Click Next on the highest patient ID.",expected:"The records wrap to the lowest patient ID, even if IDs have gaps."}],code:String.raw`import React, { useState } from 'react';
import medical_records from './medicalRecords';

const patients = [...medical_records].sort(
  (a, b) => Number(a.id) - Number(b.id)
);

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return [day, month, date.getUTCFullYear()].join('/');
}

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
            {patient.data[0].userName}
          </option>
        ))}
      </select>
      <button type="button" onClick={onShow}>Show</button>
    </div>
  );
}

function Records({ patient, onNext }) {
  const profile = patient.data[0];

  return (
    <section aria-label="Patient records">
      <h2>{profile.userName}</h2>
      <p>Date of birth: {profile.userDob}</p>
      <p>Height: {profile.meta.height} cm</p>
      <table>
        <thead>
          <tr>
            <th>S.No.</th><th>Date</th><th>Diagnosis</th>
            <th>Weight</th><th>Doctor</th>
          </tr>
        </thead>
        <tbody>
          {patient.data.map((record, index) => (
            <tr key={record.id}>
              <td>{index + 1}</td>
              <td>{formatDate(record.timestamp)}</td>
              <td>{record.diagnosis.name}</td>
              <td>{record.meta.weight}</td>
              <td>{record.doctor.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={onNext}>Next</button>
    </section>
  );
}

export default function PatientMedicalRecords() {
  const [selectedId, setSelectedId] = useState('');
  const [displayedId, setDisplayedId] = useState(null);
  const displayedIndex = patients.findIndex(
    (patient) => patient.id === displayedId
  );
  const patient = patients[displayedIndex];

  function showPatient() {
    if (selectedId === '') {
      window.alert('Please select a patient name');
      return;
    }
    setDisplayedId(selectedId);
  }

  function nextPatient() {
    if (displayedIndex === -1 || patients.length === 0) return;
    const nextIndex = (displayedIndex + 1) % patients.length;
    setDisplayedId(patients[nextIndex].id);
  }

  return (
    <main>
      <Search
        patients={patients}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onShow={showPatient}
      />
      {patient && <Records patient={patient} onNext={nextPatient} />}
    </main>
  );
}`},{slug:"blog-post",title:"Blog Post",difficulty:"Medium",topics:["Controlled inputs","Immutable updates","List keys"],sourceUrl:"https://www.hackerrank.com/challenges/blog-post/problem",summary:"Create posts from a title and description, display them as cards, and delete individual posts.",prompt:"Build a React app where a user can publish and remove short blog posts. Provide a title input, a description textarea, and a Create button. Start with empty fields and no posts. Successful submissions should appear as individual cards in a grid, each containing its text and a Delete button.",example:{actions:"Enter the title “Weekend notes” and description “Visited the science museum”, then click Create. Click Delete on the new card.",result:"Creation adds one card and clears both fields. Deletion removes that card."},requirements:["Provide a title input, description textarea, and Create button.","Only create a post when both fields contain content; clear them after creation.","Render the posts in a grid, with a title, description, and Delete button for each.","Deleting one post leaves the others intact."],steps:["Use controlled state for the two draft fields and an array for published posts.","Validate the draft before updating the array. Keep ID generation in the event handler so state updaters stay pure.","Append with a functional state update and clear the draft after success.","Give each post a stable ID. Delete by filtering that ID out, even when two posts have identical text."],pitfalls:["Do not mutate the posts array with push or splice.","An array index is not a stable identity after deletion; use the generated ID as the React key.","Generate the ID before calling the state updater. React can invoke updater functions more than once in development."],integrationNotes:["This component takes no props. Keep the starter project’s component export, surrounding markup, and test selectors when transferring the state and event handlers.","The draft is trimmed for validation, but its original text is preserved in the published post."],complexity:"With N posts, creation copies O(N) references and deletion scans O(N) posts. Rendering is O(N). Stored posts use O(N + T) space, where T is their total text length.",testCases:[{action:"Click Create with either field empty or whitespace-only.",expected:"No post is added and the draft is kept."},{action:"Enter both fields and click Create.",expected:"A post card appears and both draft fields clear."},{action:"Create two posts with the same title, then delete one.",expected:"Only the selected post is removed."},{action:"Delete all posts, then create another.",expected:"The new post appears normally with a fresh identity."}],code:String.raw`import React, { useRef, useState } from 'react';

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
}`},{slug:"employee-validation",title:"Employee Validation",difficulty:"Medium",topics:["Form validation","Derived state","Dates"],sourceUrl:"https://www.hackerrank.com/challenges/employee-validation/problem",summary:"Validate four employee fields as they change and allow submission only when all are valid.",prompt:"Build an employee information form with Name, Email, Employee ID, and Joining Date fields. Check each field against the rules below and show its error whenever it is invalid. The form starts empty, with errors visible and Submit disabled. A successful submission should clear all values and restore that initial form.",example:{actions:"Enter “Nora Lee”, “nora@example.org”, ID “004281”, and today’s date. Submit the form.",result:"The valid values enable Submit. Submission clears all fields, restores their errors, and disables Submit. A future joining date would prevent submission."},requirements:["Collect a name, email, six-digit employee ID, and joining date.","The name must have at least four characters using only A–Z, a–z, and spaces. Email must have a valid format; the joining date cannot be in the future.","Show each invalid field’s error immediately, including on the initial empty form.","Enable Submit only when every field passes, then clear the form after submission."],steps:["Store the input strings in one object. A shared change handler updates the property named by the input.","Derive validity from the current strings on every render instead of maintaining a second set of validation state.","Build today’s date from local calendar components so timezone conversion does not move the allowed date boundary.","Compare the selected local midnight with the current timestamp. A numeric time comparison also rejects extended future years that string ordering could misclassify.","Derive the button’s disabled state from whether any error remains. A valid submission resets the entire object."],pitfalls:["Keep the employee ID as a string so leading zeros count toward its six digits.","Avoid toISOString().slice(0, 10) for the local today boundary: it uses UTC.","The initial state includes validation errors. Waiting for blur would change the specified behavior.","Do not mutate the shared empty-form object; replace state with new objects on edits."],integrationNotes:["The email check covers ordinary address syntax rather than attempting the full email RFC. Native browser validation is disabled so the component controls the requested errors.","The name expression follows the stated character rule literally: only A–Z, a–z, and spaces, with at least four characters.","Retain the starter’s data-testid attributes when integrating this standalone component."],complexity:"Validation takes O(L) time per edit for L total input characters. The four fields and derived errors use O(L) space; there is no growing collection.",testCases:[{action:"Load the component.",expected:"All four errors are visible and Submit is disabled."},{action:"Enter a short name, malformed email, or a non-six-digit ID.",expected:"The corresponding error stays visible."},{action:"Enter ID 001234 and otherwise valid values with today’s date.",expected:"The ID keeps its leading zeros and Submit becomes enabled."},{action:"Change the joining date to tomorrow.",expected:"The date error appears and Submit becomes disabled."},{action:"Submit valid values.",expected:"All inputs clear; all errors return; Submit is disabled again."}],code:String.raw`import React, { useState } from 'react';

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
}`},{slug:"react-word-omitter",title:"Word Omitter",difficulty:"Hard",topics:["Derived state","Filtering","Controlled inputs"],sourceUrl:"https://www.hackerrank.com/challenges/react-word-omitter/problem",summary:"Filter selected words from live input, with a toggle that restores the original sentence and a Clear action.",prompt:"Build a WordOmitter component that receives an omitWords array of strings. Let the user enter a sentence and display a version with those words removed as they type. Provide a toggle for showing the complete sentence and a Clear button. Initially, both input and output are empty, and omission is enabled.",example:{actions:'With omitWords set to ["very"], enter “The sky is very blue”. Click Show All Words, then Clear.',result:"The filtered output reads “The sky is blue”. Toggling restores “very”; Clear empties both input and output."},requirements:["Receive the omitted words through the omitWords prop.","Update the displayed output while the user types; omission is enabled initially.","Allow toggling between filtered output and the complete input.","Clear both input and output with one action; an empty input produces an empty output."],steps:["Keep only the source text and the omission toggle in state. The output can be calculated from them.","Build a Set from omitWords for direct membership checks.","In omission mode, split the text into tokens, keep tokens outside the Set, and join them. In show-all mode, return the original text.","Clear only the text. Both input and derived output clear, while the selected mode remains unchanged."],pitfalls:["Do not overwrite the original text with the filtered text; the toggle must be able to restore it.",'Do not use substring replacement: omitting "a" should not delete letters inside other words.',"Avoid storing output in separate state that can fall out of sync with the input or omitWords prop."],integrationNotes:['Example usage: <WordOmitter omitWords={["a", "the"]} />.',"The public statement does not specify case, punctuation, or whitespace normalization. This version uses exact, case-sensitive whitespace-delimited tokens and single spaces in filtered output. Show-all mode preserves the original text. If the supplied tests specify different matching rules, adjust token normalization and Set construction together.","Keep the starter’s element selectors when adding the handlers to its existing markup."],complexity:"For N input characters and M omitted-word characters, building the Set costs O(M) when omitWords changes. Filtering costs O(N) expected time and O(N) temporary space; the Set occupies O(M) space.",testCases:[{action:'Load with omitWords containing "a".',expected:"Input and output are empty, and the toggle reads Show All Words."},{action:'Type "This is a test sentence.".',expected:'The output becomes "This is test sentence.".'},{action:"Toggle to show all, then toggle back.",expected:"The original sentence returns, then filtering resumes without losing input."},{action:'Type "cat a" with "a" omitted.',expected:'The whole word "a" disappears and "cat" remains intact.'},{action:"Click Clear in either mode.",expected:"Both text areas become empty and the selected mode is preserved."}],code:String.raw`import React, { useMemo, useState } from 'react';

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
}`},{slug:"cryptorank-exchange",title:"CryptoRank Exchange",difficulty:"Medium",topics:["Validation","Derived state","Number formatting"],sourceUrl:"https://www.hackerrank.com/challenges/cryptorank-exchange/problem",summary:"Validate an exchange amount against a balance and calculate the coin quantity for each supplied rate.",prompt:"Build a React currency exchange calculator using the provided available balance and cryptocurrency rates. Let the user enter an amount and display each currency’s rate and resulting coin quantity in a table. Begin with an empty input, no validation error, and quantities shown as 0.00000000. Update the results as the amount changes.",example:{actions:"Given a balance of 80 and a currency rate of 0.125 coins per unit, enter 24. Then change the amount to 81.",result:"The valid amount displays 3.00000000 coins. The excessive amount shows a balance error and n/a."},requirements:["Start with an empty amount, no error, and zero coins displayed to eight decimal places.","Accept amounts from 0.01 through the available balance, inclusive.","Update each coin quantity immediately using amount multiplied by its exchange rate.","Show validation feedback for invalid input and n/a for nonempty invalid amounts.","After editing, an empty input reports “Amount cannot be empty”; exceeding the balance reports “Amount cannot exceed the available balance”."],steps:["Store the input as a string so an empty field stays distinguishable from numeric zero.","Track whether the user edited the field. This separates the initial empty state from an input cleared later.","Derive a single validation message from emptiness, numeric validity, the minimum, and the balance.","Calculate rows from the current amount and rates. Use toFixed(8) only for display, without saving a second table state."],pitfalls:['Number("") is zero, so check for empty input before converting.',"The challenge defines rate as coins per currency unit: multiply by the rate.","toFixed returns a string, which is useful here because trailing zeros must remain visible.","Keep pristine-empty and edited-empty states distinct; the initial render must not show an error."],integrationNotes:['Props: balance is a finite nonnegative number; currencies is an array of { code, name, rate }, with unique codes and finite nonnegative rates. Example: <CryptoRankExchange balance={1000} currencies={[{ code: "BTC", name: "Bitcoin", rate: 0.00002 }]} />. Map the starter’s supplied currency data to these field names.',"The public statement truncates the below-minimum error message. minimumError is therefore configurable; use the exact wording from your starter tests if provided.","The public statement is inconsistent about clearing the input. This solution follows its specific cleared-input example: show the empty-input error and 0.00000000. Nonempty invalid amounts show n/a. Keep the starter selectors when integrating."],complexity:"For C currencies and L amount characters, each edit takes O(C + L) time, including rendering the table. Component state uses O(L) space; the rendered rows use O(C) space.",testCases:[{action:"Load with balance 100 and rate 0.25.",expected:"The empty input has no error and displays 0.00000000 coins."},{action:"Enter 10.",expected:"The quantity becomes 2.50000000."},{action:"Enter exactly 0.01, then exactly the balance.",expected:"Both boundary values are accepted."},{action:"Enter 0 or an amount above the balance.",expected:"A validation error appears and the quantity reads n/a."},{action:"Clear the amount after editing.",expected:"The empty-input error appears and the quantity returns to 0.00000000."}],code:String.raw`import React, { useState } from 'react';

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
}`}],U="/leetcode/assets/item-list-manager-DqLRtetf.gif",F="/leetcode/assets/code-review-feedback-BSyjb-xI.gif",z="/leetcode/assets/react-article-sorting-uSHNRoB6.gif",L="/leetcode/assets/react-slideshow-1-BUsZw8hg.gif",B="/leetcode/assets/employee-validation-DU43UjLz.gif",H="/leetcode/assets/cryptorank-exchange-QANLQiw2.gif",V={"item-list-manager":[{src:U,alt:"Item List Manager with an empty item field, an Add Item button, and an empty list below.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1719046513-25632d1299-hrc-idea-manager-list-animation.gif",width:600,height:517}],"code-review-feedback":[{src:F,alt:"Five code-quality cards, each with Upvote and Downvote buttons and independent counters starting at zero.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1729722211-95d9063039-ReactApp-GoogleChrome2024-09-1200-53-27-ezgif.com-video-to-gif-converter.gif",width:800,height:450}],"react-article-sorting":[{src:z,alt:"Article table with title, upvote, and date columns and controls for sorting by Most Upvoted or Most Recent.",sourceUrl:"https://hrcdn.net/s3_pub/istreet-assets/cxj8qBL9QgGAMyKrRbBGDA/sorting-articles.gif",width:600,height:495}],"react-slideshow-1":[{src:L,alt:"Slideshow displaying a title and description, with Restart, Prev, and Next controls; Restart and Prev are disabled on the first slide.",sourceUrl:"https://hrcdn.net/s3_pub/istreet-assets/j3Q6jXZ3DOOPRlCs9hFcnQ/slideshow.gif",width:600,height:495}],"employee-validation":[{src:B,alt:"Employee form with empty name, email, employee ID, and joining-date fields, validation messages, and a disabled Submit button.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1729723881-648947a309-Untitledvideo-MadewithClipchamp-ezgif.com-optimize.gif",width:600,height:750}],"cryptorank-exchange":[{src:H,alt:"CryptoRank Exchange with an empty dollar amount field and a cryptocurrency table showing exchange rates and zero coin quantities to eight decimal places.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1729744935-207f026c08-Untitledvideo-MadewithClipchamp1-ezgif.com-optimize.gif",width:600,height:530}]},T="https://www.jointaro.com/interviews/companies/anduril/experiences/front-end-software-engineer-irvine-ca-may-1-2021-no-offer-neutral-96bace18/",W=[{collection:"Anduril",kind:"coding",slug:"anduril-file-explorer",title:"Expandable File Explorer",difficulty:"Medium",topics:["Recursion","Trees","Shared state"],sourceUrl:"https://www.teamblind.com/post/anduril-front-end-interview-yt3cx1bt",sourceLabel:"Candidate report on Blind",additionalSources:[{label:"Senior frontend report, May 2025",url:"https://discuss.frontendlead.com/t/anduril-senior-front-end-engineer-onsite-interview/1905"}],report:"A March 2025 Blind commenter reports a file-explorer screen. A May 2025 senior frontend account also describes an expandable directory component. These are candidate recollections; they do not establish file creation, renaming, or deletion requirements.",summary:"Render a nested directory tree and preserve each folder’s expansion state.",prompt:"Build a React file explorer from a hierarchy of files and folders. Users should be able to expand a folder to reveal its children and collapse it to hide them.",assumptions:["The example input is an acyclic tree. Every node has a globally unique id and an explicit type of file or folder.","Folders start collapsed. Multiple folders may be expanded, and descendant expansion is preserved when an ancestor closes.","This practice version displays files and folders; editing the filesystem is outside its assumed contract."],requirements:["Render files as leaf rows and folders as buttons with aria-expanded.","Display each expanded folder’s children recursively.","Show an Empty folder message when an expanded folder has no children.","Use immutable state updates so React renders each toggle."],example:{actions:"Expand src, then components. Collapse src and open it again.",result:"Button.jsx becomes visible, disappears with src, and reappears because components remains expanded."},steps:["Model the input as nested nodes. An explicit type distinguishes an empty folder from a file.","Keep a Set of expanded folder IDs in the parent FileExplorer component.","Copy the Set on every toggle, then add or remove the clicked ID.","FileNode renders one node. For an expanded folder it calls itself for each child.","The Set survives unmounting of hidden descendants, so closing an ancestor does not erase their expansion state."],pitfalls:["Do not mutate the existing Set and return the same object from a state setter.","Names are not unique: two folders can each contain a file named index.js. Use IDs as keys.","An empty children array still describes a folder; checking only children.length would misclassify it.","Native buttons make toggles keyboard accessible. A full ARIA tree widget would also need its own arrow-key navigation."],complexity:"Let V be the visible nodes, E the expanded folder IDs, and H the visible tree depth. Rendering takes O(V); copying the Set takes O(E), so a toggle takes O(V + E). Expansion state uses O(E), rendered output O(V), and recursive traversal depth O(H).",integrationNotes:["The sample dataset is included in the snippet. Pass a different nodes array to FileExplorer to practice another tree."],testCases:[{action:"Load the sample.",expected:"Only top-level rows appear and folder buttons are collapsed."},{action:"Expand src, then components.",expected:"Nested rows appear, including Button.jsx."},{action:"Close and reopen src.",expected:"The components folder is still expanded."},{action:"Expand public.",expected:"Empty folder appears."}],code:String.raw`import { useState } from 'react';

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
}`},{collection:"Anduril",kind:"coding",slug:"anduril-timer",title:"Timer Class + React",difficulty:"Medium",topics:["Classes","Effects","Timers","Cleanup"],sourceUrl:"https://www.jointaro.com/interviews/companies/anduril/experiences/software-engineer-united-states-december-24-2024-no-offer-positive-64f81210/",sourceLabel:"Candidate report hosted on Taro",additionalSources:[{label:"Full-stack candidate’s timer account on Reddit",url:"https://www.reddit.com/r/leetcode/comments/1dde20u/anduril_interview_experience/"}],report:"A December 24, 2024 software-engineer account hosted on Taro names a timer class connected to a React app. A separate Reddit candidate, who identifies their role as full-stack, reports a supplied interface with start, stop, and pause methods. Exact timing semantics are not published.",summary:"Build a plain JavaScript timer and connect its elapsed time to a React interface.",prompt:"Implement timekeeping in a JavaScript class, then create a React component that displays the elapsed duration and controls the class through buttons.",assumptions:["This is a count-up timer: start begins or resumes, pause preserves elapsed time, and stop stops and resets to zero.","A 50 ms interval refreshes the display. Elapsed duration is calculated from timestamps instead of counting interval callbacks.","Repeated starts do nothing while running, and unmounting releases the interval."],requirements:["Keep accumulated duration, the current start timestamp, and the interval handle in a plain class.","Support Start / resume, Pause, and Stop / reset.","Retain one timer instance for the mounted React component.","Release background work during effect cleanup without calling the React setter."],example:{actions:"Start for two seconds, pause for one second, then resume for one second.",result:"Elapsed time is approximately three seconds. The paused second is excluded. Stop / reset returns it to zero."},steps:["Store elapsedMs for completed runs and startedAt for the current run. A null start timestamp means paused.","While running, getElapsed returns elapsedMs + performance.now() - startedAt.","start creates at most one interval. Each callback publishes the current duration to React.","pause saves the current duration before clearing the start timestamp and interval; stop also resets elapsedMs.","Create the class once with a lazy useState initializer. Its constructor starts no side effects.","The effect returns dispose, which clears the interval without publishing a state update during unmount."],pitfalls:["Adding 50 on every interval callback loses time when the browser delays callbacks. Measure timestamp differences.","Use startedAt === null rather than a truthiness check: a valid timestamp can be zero.","Repeated starts must not create multiple intervals.","Resetting the displayed React value alone leaves the class’s accumulated duration incorrect."],complexity:"Every timer operation and display refresh takes O(1) time. The class stores O(1) state and owns at most one active interval.",integrationNotes:["performance.now() supplies a monotonic clock within the page. The interval controls display refresh frequency; it is not the source of elapsed time."],testCases:[{action:"Click Start / resume twice.",expected:"Only one interval runs."},{action:"Pause and wait.",expected:"The elapsed value remains unchanged."},{action:"Resume after pausing.",expected:"Elapsed time continues from the saved duration."},{action:"Stop / reset, then start again.",expected:"The next run begins from zero."},{action:"Unmount while running.",expected:"The interval is cleared."}],code:String.raw`import { useEffect, useState } from 'react';

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
}`},{collection:"Anduril",kind:"coding",slug:"anduril-search-table",title:"Search Bar + Results Table",difficulty:"Medium",topics:["Controlled inputs","Filtering","Derived state"],sourceUrl:T,sourceLabel:"May 2021 candidate report hosted on Taro",additionalSources:[{label:"December 2020 search/filter report on Taro",url:"https://www.jointaro.com/interviews/companies/anduril/experiences/front-end-engineer-new-grad-united-states-december-1-2020-no-offer-neutral-99172b8f/"}],report:"A May 2021 frontend account from Irvine names a search interface with a table. A December 2020 frontend new-grad account describes filtering supplied data in React. Both are candidate accounts hosted on Taro; the full prompts and original Glassdoor pages are not independently verified here.",summary:"Filter supplied rows from a controlled search input and render the matches in a table.",prompt:"Create a React search bar and results table. As the user edits the query, show the rows that match the input.",assumptions:["Rows contain unique ids, names, and teams. Matching is case-insensitive substring search across the combined name and team text.","Ignore leading and trailing query whitespace. An empty query shows all rows.","Data is supplied locally; networking, debounce, pagination, and sorting are not part of this example."],requirements:["Keep the input query in state and derive matching rows during rendering.","Display the result count and a table with Name and Team columns.","Display No matching people when the result is empty.","Reflect updated rows props without synchronizing a second filtered-results state."],example:{actions:"Enter platform, then change the query to JORDAN, then clear the input.",result:"The table shows Alex and Sam, then Jordan, then all four sample rows."},steps:["Store only query as state. Normalize it with trim and toLowerCase.","Filter the rows by comparing each row’s normalized searchable text with includes.","Render the result count and map each matching row into a table row keyed by id.","When there are no matches, render a single message cell spanning both columns."],pitfalls:["Filtered rows are derived data. Storing them separately can leave them stale when the input dataset changes.","Normalize both the query and the row text so mixed capitalization behaves consistently.","Use stable row IDs instead of indexes when list membership can change."],complexity:"For N rows, filtering takes O(N) time when text lengths are bounded. Rendering takes O(M) for M matches. The filtered array uses O(M) space; with longer fields, include the cost of normalizing and searching their text.",testCases:[{action:"Load with an empty query.",expected:"Every input row appears."},{action:"Search for PLATFORM with spaces around it.",expected:"Alex and Sam match."},{action:"Search for text absent from the dataset.",expected:"The count is zero and the empty message appears."},{action:"Replace the rows prop while a query is active.",expected:"Results are derived from the new rows immediately."}],code:String.raw`import { useState } from 'react';

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
}`},{collection:"Anduril",kind:"coding",slug:"anduril-month-year-form",title:"Month / Year Input Form",difficulty:"Medium",topics:["Forms","Validation","Controlled inputs"],sourceUrl:T,sourceLabel:"May 2021 candidate report hosted on Taro",report:"The May 2021 Irvine frontend account hosted on Taro also names a form for entering a month and year. It does not provide validation rules or a required visual design. The range and output format below are practice assumptions.",summary:"Validate a calendar month and year, then submit a normalized YYYY-MM value.",prompt:"Build a React form with month and year inputs. Validate the values on submission and display the accepted month/year value or a useful error.",assumptions:["Months range from 1 through 12 and years from 1000 through 9999.","Submission produces YYYY-MM, for example 2026-03. This represents a calendar month, not an instant in a time zone.","Validate on submit. The displayed Submitted value represents the last successful submission until another submission succeeds or fails."],requirements:["Keep input values as strings, including the empty editing state.","Offer all twelve months and accept a four-digit year.","Reject missing or invalid values and display an alert.","Pad a single-digit month to two digits in the submitted result."],example:{actions:"Choose month 3, type 2026, and submit.",result:"The form displays Submitted: 2026-03. Submitting an empty year instead displays an error."},steps:["Use separate string state values for month and year so inputs can be temporarily empty.","Prevent the form’s default navigation when the user submits.","Validate both strings before building the result. The year must start with a nonzero digit and contain four digits.","Combine year with a month padded to two digits. No Date object is needed.","On failure, clear the old submitted result and show an alert. On success, clear the error."],pitfalls:["Converting input to a number on every keystroke makes the empty input state harder to represent.","maxLength is an editing aid, not validation. Validate again on submission.","Creating a Date introduces day and time-zone behavior that this calendar-month contract does not need."],complexity:"Validation and formatting take O(1) time under the fixed four-digit year contract. The component stores O(1) state and renders a fixed set of twelve month choices.",testCases:[{action:"Submit with missing inputs.",expected:"An alert asks for a month and a year in range."},{action:"Submit month 3 and year 2026.",expected:"Submitted: 2026-03 appears."},{action:"Submit a year containing letters or fewer than four digits.",expected:"Submission fails and any prior result is cleared."},{action:"Submit years 1000 and 9999.",expected:"Both boundary values are accepted."}],code:String.raw`import { useState } from 'react';

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
}`}],K=[{collection:"Anduril",kind:"coding",slug:"anduril-array-utilities",title:"Array Utilities: Flatten, Map, and Reduce",difficulty:"Medium",topics:["JavaScript","Recursion","Array methods"],summary:"Implement three array helpers and explain depth, sparse arrays, and the initial accumulator.",sourceUrl:"https://www.teamblind.com/post/anduril-frontend-interview-eg52tpe3",sourceLabel:"Candidate report on Blind — May 2024",report:"A May 15, 2024 Blind commenter names Lodash-style flatten, map, and reduce questions in a frontend interview. The same commenter also promotes a preparation site and reports the autocomplete task elsewhere. This is one anonymous account; it does not establish the exact utility contracts.",prompt:"Implement flatten, mapArray, and reduceArray in JavaScript. Flatten nested arrays to a requested depth, transform existing elements with a callback, and accumulate existing elements into one result. Use the example contracts below to make the task concrete.",assumptions:["Inputs are arrays. These are array-based teaching implementations, not complete Lodash replacements or generic native-method polyfills.","flatten accepts a nonnegative integer depth or Infinity; its default depth is one. Nested arrays are acyclic.","flatten skips holes in visited arrays; mapArray preserves holes; reduceArray skips them. An explicit undefined initial value counts as supplied.","mapArray and reduceArray capture the original array length and pass the original array to callbacks. mapArray also accepts thisArg."],requirements:["Return new arrays from flatten and mapArray without modifying the input.","Respect flatten depth zero, finite depths, and Infinity.","Call mapArray callbacks with value, index, and the original array.","Call reduceArray callbacks with accumulator, value, index, and the original array.","Without an initial value, use the first existing element; throw if there is no existing element."],example:{actions:"Flatten [1, [2, [3]], 4] at depth 1 and Infinity; map [1, 2, 3] to twice each value; reduce it to a sum starting at 0.",result:"The results are [1, 2, [3], 4], [1, 2, 3, 4], [2, 4, 6], and 6."},steps:["For flatten, visit each existing entry. Recurse into a nested array only while there is depth left; otherwise append the value.","For mapArray, allocate an output array with the input length and assign transformed values only at existing indexes.","For reduceArray, decide the accumulator and startIndex before the reduction loop. If an initial value was supplied, use it and start at index 0. arguments.length >= 3 counts an explicitly supplied undefined as an initial value.","Without an initial value, find the first existing element, use it as the accumulator, and set startIndex to firstElementIndex + 1. Throw if there is no existing element. For [2, 4, 6], this means accumulator = 2 and startIndex = 1.","Begin the reduction loop at startIndex. Skip empty slots and call the callback for each remaining element; accumulator selection is already complete.","Capture length before invoking callbacks so an appended item is not unexpectedly visited during the same operation."],pitfalls:["Checking initialValue !== undefined incorrectly treats an explicitly supplied undefined as an omitted argument.","A hole is different from an element whose value is undefined. Use i in array to distinguish them.","Using push in mapArray changes positions in sparse arrays; assign result[i] instead.","Very deeply nested arrays can exhaust the call stack. An explicit stack is an alternative when unbounded nesting is a requirement."],integrationNotes:["The named exports can be used in a JavaScript module. Remove export if your interview environment runs a plain script.","Clarify whether the interviewer wants native array behavior, Lodash behavior, or a simpler dense-array contract before handling every edge case."],complexity:"For flatten, let S be the number of array slots inspected, M the output length, and D the visited nesting depth: O(S) time and O(M + D) space. For mapArray, O(N) time with a constant-time callback and O(N) output space. For reduceArray, O(N) traversal; extra working state is O(1), excluding storage allocated by the callback or accumulator.",testCases:[{action:"Flatten [1, [2, [3]]] at depths 0, 1, and Infinity.",expected:"Return [1, [2, [3]]], [1, 2, [3]], and [1, 2, 3]."},{action:"Map a sparse array with one existing element.",expected:"Keep its length and holes; invoke the callback only for that element."},{action:"Reduce [] without an initial value.",expected:"Throw a TypeError."},{action:"Reduce [] with an explicit undefined initial value.",expected:"Return undefined without invoking the callback."},{action:"Append an item inside a map or reduce callback.",expected:"The new item is beyond the captured length and is not visited."}],solutionTitle:"JavaScript solution",codeLanguage:"javascript",code:String.raw`export function flatten(array, depth = 1) {
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
}`},{collection:"Anduril",kind:"coding",slug:"anduril-autocomplete",title:"React Autocomplete Search",difficulty:"Medium",topics:["Controlled inputs","Keyboard interaction","Accessibility"],summary:"Filter local suggestions and support mouse selection, arrow keys, Enter, and Escape.",sourceUrl:"https://www.teamblind.com/post/anduril-frontend-interview-tip-vo3xz40g",sourceLabel:"Candidate report on Blind — May 2024",report:"A May 16, 2024 Blind commenter reports an autocomplete search task in React. This is the same commenter as the array-utilities report, so the two reports are not independent corroboration. API calls, debounce behavior, and keyboard requirements are not specified in the report.",prompt:"Build a React autocomplete input that displays matching suggestions and lets the user commit one. For this practice version, use a supplied local array and support keyboard and mouse interaction under the assumptions below.",assumptions:["Options have unique, stable IDs and string labels. Match labels with case-insensitive substring search after trimming the query.","An empty query shows no suggestions. Display at most eight matches in input order.","Arrow keys wrap through matches; Enter chooses the active match; Escape or losing focus closes the list.","Choosing a suggestion updates the input. Suggestions are local, so this example does not perform network requests or debounce input."],requirements:["Keep the input controlled and derive suggestions from the query and options.","Show an empty-results message when a nonempty query has no matches.","Support selection with the mouse or with ArrowDown/ArrowUp and Enter.","Keep keyboard focus on the input and expose the active option with aria-activedescendant.","Ignore keyboard selection while an input method editor is composing text."],example:{actions:"Type “al”, press ArrowDown twice, and then press Enter.",result:"Alpha and Alpine appear. The active option moves from Alpha to Alpine; Enter sets the input to Alpine and closes the suggestions."},steps:["Store the query, whether the popup is open, and the active suggestion index. Filter options during rendering.","Reset the active index whenever the query changes, then show matching suggestions.","Arrow keys open the popup and move the active index with wraparound. Enter chooses only a valid active option.","Use a generated list ID and stable option IDs for aria-controls and aria-activedescendant.","Prevent pointer-down from moving focus away from the input before a suggestion click can commit its value.","Dismiss the list and reset the active index on Escape or blur. Composition events must not trigger selection."],pitfalls:["Unconditionally handling Enter can interrupt IME text composition or submit an unintended suggestion.","An input blur can remove the suggestions before a mouse click fires. Keep input focus during pointer selection.","Do not expose aria-activedescendant for a missing or hidden option.","If options become remote, an older response can arrive after a newer query. Check request identity before accepting results."],integrationNotes:["This is a complete React example with sample local options. Keep each coding example in its own module.","Debouncing, loading/error states, and stale-response protection are possible remote-data follow-ups; the candidate report does not establish them as original requirements."],complexity:"For N options with label length bounded by L, filtering is O(N × L) per render, plus the cost of normalizing the query. The intermediate filtered array can use O(N) space; the popup renders at most eight options. Interaction state is O(query length) plus constant-size flags and an index.",testCases:[{action:"Type “AL”.",expected:"Show Alpha and Alpine; matching is case-insensitive."},{action:"Press ArrowUp before highlighting any match.",expected:"Highlight the last visible suggestion."},{action:"Press Enter on an active suggestion.",expected:"Use its label as the input value and close the popup."},{action:"Click a suggestion or leave the input.",expected:"Click commits the option; losing focus simply closes the popup."},{action:"Enter a query with no matches, then clear it.",expected:"Show “No suggestions.” for the unmatched query; clearing removes the message."}],code:String.raw`import { useId, useState } from 'react';

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
}`}],G=[{slug:"anduril-object-classification",collection:"Anduril",kind:"design",title:"Known / Unknown Objects — Frontend Design",difficulty:"Hard",topics:["System design","Live data","State management","Virtualization"],summary:"Design an interface for thousands of API objects whose classification can change.",sourceUrl:"https://discuss.frontendlead.com/t/anduril-senior-front-end-engineer-onsite-interview/1905",sourceLabel:"Candidate report — FrontendLead, May 2025",report:"A May 18, 2025 anonymous senior frontend interview report describes receiving thousands of objects from an API and flagging them as known or unknown. The report does not publish the API, update frequency, or editing rules.",prompt:"Design a frontend that displays thousands of objects from an API and supports classifying them as known or unknown. Explain the data model, UI state, update flow, rendering performance, and failure behavior.",assumptions:["For this practice answer, objects have stable IDs and server-assigned versions. Updates can arrive repeatedly and out of order.","Users may change classifications, and other users may edit the same object. The server remains authoritative.","The practice UI contains a filterable object list and a details panel. A saved label appears only after the server confirms the change."],requirements:["Clarify what known and unknown mean, who may change those values, and how fresh the interface must be.","Keep the list and details panel consistent while new object data arrives.","Render large datasets without mounting every row, and preserve selection during updates.","Expose pending edits, conflicts, failed saves, and stale connections."],example:{actions:"Select object-123 at version 7 and mark it known. Before the save completes, another user changes the same object to version 8.",result:"The server rejects the stale version-7 edit. The UI loads version 8, retains the user’s intended change, and asks them to review it before retrying."},solutionTitle:"Frontend system design solution",code:"",solutionSections:[{title:"Clarify the contract",body:"Ask what classification represents, whether users edit it, the expected object count, update rate, and acceptable display delay. Establish whether every intermediate event matters or only each object’s latest state. These answers determine transport, retention, and batching choices."},{title:"Give each object one canonical record",body:"Store server records by ID. Keep ordered IDs, selected ID, filters, and pending edits separately. Both the list and details panel look up the same record. An unsaved edit lives outside the server record so a background update cannot silently erase it.",code:`const state = {
  objectsById: {
    'object-123': {
      id: 'object-123',
      name: 'Object 123',
      classification: 'unknown',
      version: 7,
      updatedAt: 1730000000000,
    },
  },
  orderedIds: ['object-123'],
  selectedId: null,
  filter: 'all',
  pendingChangesById: {},
};`},{title:"Load a snapshot, then apply ordered updates",body:"Fetch an initial page or snapshot, then use polling, server-sent events, or WebSockets according to required freshness and API support. Ignore an update when its version is no newer than the stored version. A version orders changes for one object; a stream cursor detects gaps across the feed. After a gap or reconnect, resynchronize from a snapshot or supported replay cursor. Apply deletions explicitly so removed objects do not linger."},{title:"Bound the rendering work",body:"Virtualize the list so only visible rows and a small buffer mount. Subscribe rows to their own records, or preserve unchanged row props so memoization can help. Filter or sort on the server when the loaded dataset is too large for frequent client scans. Batch display updates, coalescing by ID only when intermediate states are unnecessary. A plain JavaScript object spread still copies the entire dictionary; use a suitable store or batch those immutable copies instead of assuming every React update is constant-time."},{title:"Save changes with conflict detection",body:"Send the desired classification with the version on which the edit was based. Keep the row marked pending until the server acknowledges the change, and prevent duplicate submissions for that object. On success, merge the returned record using the same version rule. On conflict, reload the object and let the user review their retained edit. On network failure, keep the draft and offer a retry. Optimistic presentation is another choice, but it requires rollback and protection against overwriting a newer update.",code:`// Example request contract; the server enforces the version check.
const change = {
  objectId: 'object-123',
  classification: 'known',
  expectedVersion: 7,
};`},{title:"Separate freshness from classification",body:"A disconnected feed does not change an object’s classification. Show connection status and last-update time independently. Preserve selection through unrelated updates, explain when the selected object is removed, and distinguish loading failures from save failures. Verify keyboard navigation, clear labels, and status announcements as part of the interface."}],steps:["Establish the domain meaning, data volume, update rate, and edit permissions.","Separate canonical server records from selection, filtering, and pending edits.","Specify snapshot loading, update ordering, deletion handling, and resynchronization.","Choose rendering and storage strategies that match the measured update workload.","Walk through a successful save, a stale edit, a failed request, and a disconnected feed."],pitfalls:["Do not change an object to unknown merely because its data becomes stale.","A late save response must not overwrite a newer stream version.","Virtualization limits mounted rows; it does not automatically make full-array filtering or immutable dictionary copies constant-time.","Do not discard intermediate events unless the product only needs the latest state."],complexity:"For N loaded objects and V mounted rows, record storage is O(N) and mounted list rendering is O(V). ID lookup is typically O(1). A client filter scan is O(N); sorting is O(N log N). Copying an N-entry object for an immutable update is O(N), even when only one record changes. Batching reduces how often that copy occurs.",testCases:[{action:"Receive version 6 after storing version 7.",expected:"Keep version 7; the UI does not move backward."},{action:"Select an object while unrelated rows update.",expected:"The selection and any unsaved edit remain intact."},{action:"Submit an edit after another user changes the object.",expected:"Detect the version conflict and retain the user’s draft for review."},{action:"Lose the live connection.",expected:"Mark the feed stale and resynchronize on reconnect; classifications remain unchanged."},{action:"Scroll through thousands of records.",expected:"Only visible rows and a buffer are mounted."}]},{slug:"anduril-scheduler",collection:"Anduril",kind:"design",title:"React Scheduler — Clarify and Design",difficulty:"Medium",topics:["Requirements","Forms","Time zones","State design"],summary:"Clarify the reported scheduler task, then work through an explicitly assumed appointment-calendar design.",sourceUrl:"https://www.jointaro.com/interviews/companies/anduril/experiences/software-developer-seattle-wa-december-16-2024-no-offer-neutral-557516d5/",sourceLabel:"Candidate report — Taro, December 2024",report:"A December 16, 2024 Seattle account on Taro identifies a frontend role and names a React scheduler exercise. It does not explain whether scheduling means calendar appointments, timed jobs, or something else. The original complete specification is unavailable in that report.",prompt:"The reported task is to create a scheduler app in React. Begin by establishing what is being scheduled and the required operations. The worked design below assumes an appointment calendar solely to provide a concrete practice example.",assumptions:["Practice design only: schedule non-recurring appointments on one calendar, with a title, start time, and end time.","Support create, edit, delete, and an agenda sorted by start time. Overlapping appointments are rejected; adjacent appointments are allowed.","Appointments use an explicitly selected calendar time zone. Persistence is handled by an API. None of these details is established by the candidate report."],requirements:["Clarify calendar appointments versus timed task execution before designing components.","For this practice version, validate required fields and require the end to occur after the start.","Keep saved appointments separate from the editable draft and surface failed saves.","Define time-zone interpretation, overlap rules, and persistence before implementation."],example:{actions:"With an appointment from 09:00 to 10:00 in the calendar’s zone, try adding one at 09:30–10:30 and then one at 10:00–11:00.",result:"Under the practice overlap rule, the first attempt is rejected and the adjacent appointment is accepted. This behavior is an assumed practice requirement."},solutionTitle:"Clarification and practice design answer",code:"",solutionSections:[{title:"Ask what scheduler means",body:"First ask whether the user is booking appointments, arranging jobs, or executing callbacks at future times. Ask which operations, views, data inputs, and outputs are expected. Also establish recurrence, time zones, persistence, and the time available. A calendar interface and a JavaScript task scheduler require different models; the public report alone does not choose between them."},{title:"Practice contract: an appointment agenda",body:"For this worked example, use a form plus an agenda rather than starting with a complex calendar grid. A Scheduler parent owns saved appointments and the selected calendar zone. AppointmentForm owns an editing draft and validation messages. Agenda derives the sorted visible appointments. Store the editing appointment’s ID separately, and discard or save its draft explicitly."},{title:"Make time and overlap rules explicit",body:"Retain text input while the user edits. Convert a complete date/time using the chosen calendar zone before comparing instants, and store start/end instants along with the zone used for display. A datetime-local input does not include a time zone, so parsing it as if it were UTC would change the appointment. Ask the user to resolve ambiguous daylight-saving times, and reject nonexistent local times. For the practice overlap rule, two intervals overlap when startA < endB and startB < endA. Exclude the edited appointment itself when checking conflicts."},{title:"Validate, save, and update the agenda",body:"Validate a nonblank title, valid times, start before end, and no conflicting appointment. Send the draft to the API, show a pending state, and only add or replace the saved appointment after confirmation. Preserve the draft if saving fails. Treat deletion similarly. The server must also enforce overlap rules to catch simultaneous bookings. Derive the agenda from saved appointments; sort a copy rather than mutating state."},{title:"Choose extensions after the basic flow works",body:"Build keyboard-accessible inputs and explicit edit/delete controls first. Add day/week views, drag-and-drop, recurrence, or reminders only if requested. A recurring 09:00 appointment needs a recurrence rule and calendar zone; repeatedly adding 24 hours can shift its local time across daylight-saving changes. If the interviewer instead means timed job execution, replace this calendar design with the agreed queue, execution, cancellation, and clock semantics."}],steps:["Get a concrete example of the scheduling input and expected output.","Agree on a minimal feature set and document the assumptions.","Separate saved appointments, draft fields, selected date or zone, and request status.","Define validation and conflict handling before wiring up the form and agenda.","Exercise time boundaries and failed saves before adding richer calendar interactions."],pitfalls:["Do not present the assumed calendar design as the original interview specification.","A local date/time string has no offset; do not silently interpret it in the wrong zone.","Remember to exclude the current appointment when validating an edit against overlaps.","A client conflict check alone cannot prevent concurrent server bookings."],complexity:"For N appointments, a simple conflict scan costs O(N), deriving a sorted agenda costs O(N log N), and stored appointments require O(N) space. A visible-date filter is O(N) without an index. These bounds describe the assumed practice design, not an unpublished interview solution.",testCases:[{action:"Begin the interview with only the word scheduler.",expected:"Clarify the domain and expected operations before choosing an implementation."},{action:"Submit an end time at or before the start.",expected:"The practice form shows a validation error and retains the draft."},{action:"Add an appointment starting when another ends.",expected:"The practice half-open interval rule permits it."},{action:"Edit an appointment without changing its time.",expected:"It does not conflict with itself."},{action:"A save fails or the server reports a conflict.",expected:"Keep the draft, explain the error, and allow correction or retry."}]}],Y={collection:"Reference",kind:"discussion",slug:"aria-interview-essentials",title:"ARIA Interview Essentials",difficulty:"Medium",topics:["Accessibility","ARIA","React","Keyboard interaction"],summary:"Learn ten useful ARIA attributes, two autocomplete essentials, and common implementation mistakes.",sourceUrl:"https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes",sourceLabel:"MDN ARIA reference",additionalSources:[{label:"W3C combobox pattern",url:"https://www.w3.org/WAI/ARIA/apg/patterns/combobox/"},{label:"W3C guidance on using ARIA",url:"https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/"},{label:"MDN aria-disabled",url:"https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled"},{label:"MDN aria-hidden",url:"https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden"}],prompt:"Explain how ARIA communicates accessible names, relationships, and state. Choose the appropriate attributes for an icon button, expandable panel, form error, toggle, and autocomplete input, and explain which behavior JavaScript must still implement.",assumptions:["This is an interview reference, not a reported company problem. The examples illustrate attributes rather than complete standalone components.","State values, event handlers, and option data referenced by the snippets are supplied by the surrounding component. IDs must be unique on the page; use useId when a reusable component needs its own IDs.","Use attributes on elements and roles that support them. Complex widgets still need their expected keyboard behavior and focus management."],requirements:["Distinguish an accessible name from additional descriptive text.","Keep expanded, selected, pressed, and invalid states synchronized with the interface.","Explain the relationship between a controlling element and the element it references.","Start with native HTML controls, then add ARIA where information is missing."],example:{actions:"An interviewer asks how you would make a button that opens extra details accessible.",result:"Use a native button with visible text, aria-expanded bound to the open state, and aria-controls pointing to the details element. Implement the toggle and visibility separately."},solutionTitle:"ARIA attributes and examples",code:"",codeLanguage:"jsx",solutionSections:[{title:"1. aria-label — give a control a name",body:"Use a short accessible name for a control whose visible contents do not explain its action, such as an icon-only close button. A button with clear visible text already has a name; a native form input should normally have a visible label.",code:`<button type="button" aria-label="Close dialog" onClick={onClose}>
  <span aria-hidden="true">×</span>
</button>`},{title:"2. aria-labelledby — use existing text as the name",body:"Reference the ID of text that names the element. This lets the visible heading and accessible name stay aligned. The value is an element ID, not the label text itself.",code:`<section aria-labelledby="billing-title">
  <h2 id="billing-title">Billing details</h2>
  <p>Review your saved billing information.</p>
</section>`},{title:"3. aria-describedby — attach extra information",body:"Reference instructions or an error message that explains an already named control. The distinction to remember: labelledby names the element; describedby adds information about it. Multiple description IDs can be separated by spaces.",code:`<>
  <label htmlFor="password">Password</label>
  <input id="password" type="password" aria-describedby="password-help" />
  <p id="password-help">Use at least 12 characters.</p>
</>`},{title:"4–5. aria-expanded and aria-controls — connect a disclosure",body:"aria-expanded communicates whether associated content is open. aria-controls points to the controlled element’s ID. Neither attribute changes visibility: React state and the hidden attribute handle that in this example.",code:`<>
  <button
    type="button"
    aria-expanded={open}
    aria-controls="details-panel"
    onClick={() => setOpen((previous) => !previous)}
  >
    Details
  </button>
  <div id="details-panel" hidden={!open}>
    Extra details appear here.
  </div>
</>`},{title:"6. aria-selected — identify a selected option or tab",body:"Use this state on a role that supports selection, such as an option or tab. It does not mean that every focused element is selected. The widget decides how focus and selection relate, and must implement its keyboard interaction.",code:`// One option rendered inside the widget's role="listbox" container.
<li role="option" aria-selected={option.id === selectedId}>
  {option.label}
</li>`},{title:"7. aria-pressed — describe a toggle button",body:"Expose whether a toggle button is on or off. Keep the button’s label stable so the pressed state communicates the change. This is different from whether an ordinary button is being physically held down.",code:`<button
  type="button"
  aria-pressed={isMuted}
  onClick={() => setIsMuted((previous) => !previous)}
>
  Mute
</button>`},{title:"8. aria-invalid — expose a validation error",body:"Set aria-invalid when the control fails validation, and provide useful error text. The attribute does not perform validation or explain the error by itself. Link the message with aria-describedby when it is present.",code:`<>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={Boolean(error)}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && <p id="email-error">{error}</p>}
</>`},{title:"9. aria-live — announce changing content",body:"A live region lets assistive technology announce updates without moving keyboard focus. Use polite for ordinary updates such as a result count; assertive is reserved for urgent messages that justify interrupting speech. Keep the region mounted, then update its text.",code:`<p aria-live="polite">
  {resultCount} results found
</p>`},{title:"10. aria-hidden — exclude decorative content",body:"aria-hidden removes an element and its descendants from the accessibility tree. It does not visually hide them or remove keyboard focus. Use it for redundant decoration; never place it on a focusable control or a container holding focusable controls.",code:`<button type="button" onClick={openSearch}>
  <span aria-hidden="true">🔍</span> Search
</button>`},{title:"Autocomplete: aria-autocomplete and aria-activedescendant",body:'aria-autocomplete="list" describes an input with suggested text completions in a popup. aria-activedescendant identifies the active suggestion while DOM focus remains on the input. Reference only a rendered option. The component must still implement filtering, arrow-key navigation, selection, dismissal, and any required loading behavior.',code:`<>
  <label htmlFor="search">Search</label>
  <input
    id="search"
    role="combobox"
    aria-autocomplete="list"
    aria-expanded={showSuggestions}
    aria-controls={showSuggestions ? 'suggestions' : undefined}
    aria-activedescendant={
      showSuggestions && activeOption ? activeOption.id : undefined
    }
  />
  {showSuggestions && (
    <ul id="suggestions" role="listbox" aria-label="Suggestions">
      {matches.map((option) => (
        <li
          key={option.id}
          id={option.id}
          role="option"
          aria-selected={option.id === activeOption?.id}
        >
          {option.label}
        </li>
      ))}
    </ul>
  )}
</>`},{title:"Trap: ARIA describes behavior; it does not implement it",body:'A role="button" declaration on a div does not add button keyboard behavior. A native button supplies expected focus and activation behavior. ARIA states must accurately reflect what the UI does; aria-expanded alone does not open a panel.',code:`<button type="button" onClick={save}>
  Save
</button>`},{title:"Trap: aria-disabled does not block activation",body:'aria-disabled="true" communicates a disabled state but does not prevent clicks, change focusability, or apply disabled styling. Native disabled handles the usual behavior for supported form controls. If you intentionally keep an unavailable custom control discoverable with aria-disabled, you must prevent its actions yourself.',code:`<button type="button" disabled={isSaving} onClick={save}>
  Save
</button>`},{title:"Trap: aria-hidden is not a visibility or focus control",body:"Use actual visibility and focus behavior when content becomes unavailable. For a collapsed disclosure, hidden removes the panel from display and normal interaction. Hiding a focused subtree also requires deciding where focus should move; aria-hidden alone cannot solve that.",code:`<div id="details-panel" hidden={!open}>
  <a href="/details">Read more</a>
</div>`}],steps:["Identify the native element that matches the interaction before adding a role or state.","Give the control a clear name, then add any extra description separately.","Connect related elements with unique IDs and keep state attributes synchronized with React state.","Explain the keyboard interaction and focus behavior that accompany the chosen widget pattern."],pitfalls:["Do not use aria-label as a replacement for visible labels everywhere; it can override the name users expect from visible text.","Do not put aria-selected on an arbitrary button. Use the state supported by the widget’s role, such as aria-pressed for a toggle button.","Never leave aria-activedescendant pointing to an absent or hidden option.","Do not confuse describing a disabled or hidden state with implementing the behavior."],complexity:"This reference concerns accessible semantics and interaction. Algorithmic complexity depends on the component using these attributes, not the attributes themselves. In an interview, explain the accessible name, relevant state, keyboard controls, and focus behavior.",integrationNotes:["The examples are JSX fragments. Keep the aria-* attribute names hyphenated in React and supply the surrounding state and event handlers.","For a full autocomplete implementation, see React Autocomplete Search under Other interview questions. These snippets focus on the relevant accessibility attributes."],testCases:[{action:"An icon-only button has no visible action text.",expected:'Supply an accessible name, such as aria-label="Close dialog", and hide redundant decoration.'},{action:"Explain labelledby versus describedby.",expected:"The first provides the name; the second references additional instructions or explanatory text."},{action:"Open and close a disclosure.",expected:"The content visibility and aria-expanded value change together, and aria-controls references its panel."},{action:"Navigate autocomplete options with the keyboard.",expected:"The implemented widget keeps input focus and updates aria-activedescendant to a rendered option."},{action:"Set aria-disabled on a clickable element.",expected:"Explain that activation is still possible unless the implementation prevents it."}]},J={collection:"Practice",kind:"coding",slug:"spreadsheet",title:"Spreadsheet",difficulty:"Medium",topics:["JavaScript","Parsing","Recursion"],sourceLabel:"Provided solution",summary:"Evaluate simple addition and subtraction formulas using separate operand and operator arrays.",prompt:"Implement a Spreadsheet class with setCell(cellId, input) and getCell(cellId). Store numbers or formulas beginning with =. A formula combines numbers and cell references using + and -, such as =A1+3-B1. First collect its operands and operators into separate arrays, then evaluate them from left to right. Referenced cells can contain formulas, and later edits must be reflected on the next read.",assumptions:["Inputs are numbers or valid formula strings without spaces. Formula operands are unsigned decimal numbers or cell references, joined by + or -.","Every referenced cell exists, reference spelling is consistent, and there are no circular references. This is the simple version built in the walkthrough."],requirements:["Store the original input for each cell in a Map.","Return stored numbers directly.","Collect operands and operators into separate arrays before evaluating a formula.","Resolve each operand as either a number or a reference to another cell.","Apply addition and subtraction from left to right, recalculating referenced formulas on every read."],example:{actions:"Set A1 to 10, B1 to 2, C1 to =A1+3-B1, and D1 to =C1+5. Read C1 and D1, then change A1 to 20 and read both again.",result:"C1 returns 11 and D1 returns 16. After changing A1, they return 21 and 26. The formulas stay stored, so each read uses the current cell values."},steps:["Store cell inputs in a Map. setCell saves the number or formula exactly as provided.","In getCell, return the input immediately if it is a number. Otherwise remove the leading =.","Scan the expression to build each operand. When you reach + or -, save the operand and operator in their own arrays, then start the next operand. Save the final operand after the loop.",'For A1+3-B1, the operands are ["A1", "3", "B1"] and the operators are ["+", "-"]. Collection finishes before calculation starts.',"resolveOperand tries Number(operand). If the result is a number, return it; otherwise call getCell to read the referenced cell.","Use operands[0] as the initial result. Loop through operators, pairing operators[index] with operands[index + 1], then add or subtract its resolved value.","A referenced formula follows the same process recursively. Reading C1 starts with 10, adds 3 to reach 13, then subtracts 2 to return 11."],pitfalls:["Save the final operand after scanning the expression; there is no following operator to save it for you.","Use operands[index + 1] in the calculation loop because operands[0] already became the initial result.","Keep the raw formula in the Map so future reads can use updated values from its referenced cells."],integrationNotes:["Run the standalone class and examples below as a JavaScript script. The examples print 11, 16, 21, and 26.","Build in small steps: store numbers, add two cells, resolve numeric operands, handle multiple additions, then collect separate arrays to support subtraction."],complexity:"setCell is typically O(1). A formula of n characters that references only stored numbers takes O(n) time and O(n) auxiliary space. Referenced formulas add their own evaluation work; shared formulas are recalculated, so total work can grow exponentially with dependency depth. Recursive reads retain the call stack and operand/operator arrays along the active path. Stored inputs take space proportional to their total size.",testCases:[{action:"Store A1 as 10 and read A1.",expected:"Return 10 directly."},{action:"Set A1 to 10 and B1 to 2, then evaluate =A1+3-B1.",expected:"Return 11: start at 10, add 3, then subtract 2."},{action:"Evaluate =4+5 or =10-3-2.",expected:"Return 9 and 5 respectively."},{action:"Set C1 to =A1+3-B1 and D1 to =C1+5, then change A1 from 10 to 20.",expected:"C1 changes from 11 to 21, and D1 changes from 16 to 26 on the next read."}],solutionTitle:"JavaScript solution",codeLanguage:"javascript",code:`class Spreadsheet {
  constructor() {
    this.cells = new Map();
  }

  setCell(cellId, input) {
    this.cells.set(cellId, input);
  }

  getCell(cellId) {
    const input = this.cells.get(cellId);

    if (typeof input === "number") {
      return input;
    }

    const expression = input.slice(1);
    const { operands, operators } = this.tokenize(expression);

    let result = this.resolveOperand(operands[0]);

    for (let index = 0; index < operators.length; index++) {
      const operator = operators[index];
      const right = this.resolveOperand(operands[index + 1]);

      if (operator === "+") {
        result += right;
      } else {
        result -= right;
      }
    }

    return result;
  }

  tokenize(expression) {
    const operands = [];
    const operators = [];
    let operand = "";

    for (const character of expression) {
      if (character === "+" || character === "-") {
        operands.push(operand);
        operators.push(character);
        operand = "";
      } else {
        operand += character;
      }
    }

    operands.push(operand);

    return { operands, operators };
  }

  resolveOperand(operand) {
    const number = Number(operand);

    if (!Number.isNaN(number)) {
      return number;
    }

    return this.getCell(operand);
  }
}

// Store numbers.
const sheet = new Spreadsheet();

sheet.setCell("A1", 10);
sheet.setCell("B1", 2);

// Combine references and numbers.
sheet.setCell("C1", "=A1+3-B1");
console.log(sheet.getCell("C1")); // 11

// Reference another formula.
sheet.setCell("D1", "=C1+5");
console.log(sheet.getCell("D1")); // 16

// Changes are reflected on the next read.
sheet.setCell("A1", 20);
console.log(sheet.getCell("C1")); // 21
console.log(sheet.getCell("D1")); // 26`};function a(t){return{difficulty:"Medium",codeLanguage:"jsx",solutionTitle:"React solution",...t,collection:"GreatFrontEnd",kind:"coding",sourceLabel:t.sourceUrl?"GreatFrontEnd problem":"GreatFrontEnd React catalog",sourceUrl:t.sourceUrl??"https://www.greatfrontend.com/questions/react-coding-interview-questions",integrationNotes:["Original study solution for the requirements and assumptions above. Adapt the component or hook exports to your exercise starter.",...t.integrationNotes??[]]}}const $=[a({slug:"gfe-use-array",title:"useArray",difficulty:"Medium",summary:"Manage an array with immutable, composable update commands.",prompt:"Write useArray(initialArray), returning the array and methods that add, replace, remove, filter, replace all, or clear its items.",topics:["Custom hooks","Arrays","Immutable state"],requirements:["Return { array, push, update, remove, filter, set, clear }.","Support functional updates in set and preserve queued updates.","Never mutate the previous array or its items."],example:{actions:'Start with ["tea"], push("coffee"), then update(0, "water").',result:'array is ["water", "coffee"].'},steps:["Keep one array in useState.","Use functional updates for operations that depend on current items.","Memoize commands and delegate whole-array replacement to the React setter."],pitfalls:["Calling push on the existing state array hides changes from React.","A closure over array can lose back-to-back updates."],complexity:"O(n) time and additional space for copying, filtering, replacing, or deleting items; clear is O(1).",testCases:[{action:"Push two items in the same event.",expected:"Both items are appended in order."},{action:"Remove an invalid index.",expected:"The contents remain unchanged."}],assumptions:["Indices are zero-based; invalid update/remove indices leave the contents unchanged."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-array",integrationNotes:['Inside a component: const { array, push, remove } = useArray(["tea"]); render array and call push("coffee") from a button.'],code:String.raw`import { useCallback, useState } from 'react';

export default function useArray(initialArray = []) {
  const [array, set] = useState(() => [...initialArray]);
  const push = useCallback(item => set(items => [...items, item]), []);
  const update = useCallback((index, item) => {
    set(items => items.map((old, i) => i === index ? item : old));
  }, []);
  const remove = useCallback(index => {
    set(items => items.filter((_, i) => i !== index));
  }, []);
  const filter = useCallback(predicate => set(items => items.filter(predicate)), []);
  const clear = useCallback(() => set([]), []);
  return { array, push, update, remove, filter, set, clear };
}`}),a({slug:"gfe-use-boolean-ii",title:"useBoolean II",difficulty:"Easy",summary:"Expose stable commands for turning boolean state on and off.",prompt:"Implement an optimized boolean hook whose setTrue and setFalse functions retain their identity across renders.",topics:["Custom hooks","useCallback","Boolean state"],requirements:["Default to false.","Return { value, setTrue, setFalse }.","Memoize both commands without capturing the current value."],example:{actions:"Call setTrue() twice, then setFalse().",result:"The value changes to true, stays true, and then becomes false."},steps:["Initialize boolean state.","Wrap constant-value setters in useCallback with empty dependencies.","Return the current value alongside the stable commands."],pitfalls:["Returning freshly created functions defeats the optimization.","A toggle is different from an explicit setTrue command."],complexity:"O(1) time and space per operation.",testCases:[{action:"Rerender after setTrue().",expected:"Both method references remain unchanged."}],assumptions:["The premium follow-up is modeled on the public useBoolean API: initialValue, value, setTrue, and setFalse, with stable methods."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-boolean-ii",integrationNotes:["const { value: open, setTrue: show, setFalse: hide } = useBoolean(); use show and hide as button handlers."],code:String.raw`import { useCallback, useState } from 'react';

export default function useBoolean(initialValue = false) {
  const [value, setValue] = useState(Boolean(initialValue));
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  return { value, setTrue, setFalse };
}`}),a({slug:"gfe-use-breakpoint",title:"useBreakpoint",difficulty:"Medium",summary:"Find the largest named minimum width that fits the viewport.",prompt:"Create a hook that accepts named minimum widths and reports the active breakpoint as the browser is resized.",topics:["Custom hooks","Responsive design","Event cleanup"],requirements:["Accept a map such as { mobile: 0, tablet: 768, desktop: 1024 }.","Pick the highest threshold less than or equal to innerWidth, regardless of input order.","Remove the resize listener on unmount."],example:{actions:"Use the map above and resize the window from 800px to 1100px.",result:'The return value changes from "tablet" to "desktop".'},steps:["Store the current viewport width.","Subscribe once to resize events.","Sort thresholds numerically and find the last matching name."],pitfalls:["Object key order does not establish numerical threshold order.","A width equal to a threshold must include that breakpoint."],complexity:"O(b log b) time and O(b) space per render for b breakpoints.",testCases:[{action:"Resize to exactly 768px.",expected:"Return tablet."},{action:"Use a width below every minimum.",expected:"Return undefined."}],assumptions:["Practice API: useBreakpoint(breakpoints) returns a name or undefined; thresholds are finite nonnegative minimum widths.","On the server, return undefined; ties follow the supplied object order."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-breakpoint",integrationNotes:["const breakpoint = useBreakpoint({ small: 0, large: 960 }); render breakpoint or use it to select a layout."],code:String.raw`import { useEffect, useState } from 'react';

export default function useBreakpoint(breakpoints) {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? undefined : window.innerWidth
  );
  useEffect(() => {
    const measure = () => setWidth(window.innerWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  let active;
  const entries = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);
  for (const [name, minimum] of entries) {
    if (width !== undefined && width >= minimum) active = name;
  }
  return active;
}`}),a({slug:"gfe-use-click-anywhere",title:"useClickAnywhere",difficulty:"Easy",summary:"Call the latest handler for window click events.",prompt:"Subscribe to browser-window clicks from a hook, keeping the listener current when the component receives a new callback.",topics:["Custom hooks","DOM events","Stale closures"],requirements:["Pass the MouseEvent to the handler.","Call the most recently committed handler.","Remove the listener when the component unmounts."],example:{actions:"Install a click counter, then click two different page elements.",result:"The counter increases twice."},steps:["Store the committed handler in a ref.","Install one window listener that reads that ref.","Return the matching removeEventListener call as cleanup."],pitfalls:["An effect with empty dependencies and a captured handler keeps its first callback forever.","Removing a different function does not remove the listener."],complexity:"O(1) time and space per event, excluding the callback.",testCases:[{action:"Replace the callback and click.",expected:"Only the replacement callback runs."},{action:"Click after unmount.",expected:"The hook callback does not run."}],assumptions:["Uses the normal bubbling phase on window; clicks stopped before reaching window do not reach this listener."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-click-anywhere",integrationNotes:["useClickAnywhere(() => setClicks(count => count + 1)); call the hook at the top level of your component."],code:String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useClickAnywhere(handler) {
  const latest = useRef(handler);
  useCommitEffect(() => { latest.current = handler; }, [handler]);
  useEffect(() => {
    const onClick = event => latest.current(event);
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);
}`}),a({slug:"gfe-use-click-outside",title:"useClickOutside",difficulty:"Medium",summary:"Detect a click beyond a referenced element and its descendants.",prompt:"Implement a reusable outside-click hook for dismissing a popup while leaving clicks inside the popup alone.",topics:["Custom hooks","Refs","DOM events"],requirements:["Accept an element ref and a callback.","Ignore clicks within the element, including descendants.","Read the current ref and latest callback, and clean up the document listener."],example:{actions:"Attach the ref to a menu; click its child button, then the document body.",result:"Only the body click invokes the outside handler."},steps:["Listen for document clicks in capture phase.","Check the event path or DOM containment against ref.current.","Invoke the latest callback only for clicks outside a mounted element."],pitfalls:["A null ref is not an outside click target.","Checking event.target === element misclassifies descendants."],complexity:"O(h) containment/path lookup for DOM depth h; O(1) hook storage.",testCases:[{action:"Click an element nested inside the ref target.",expected:"No callback."},{action:"Click body after removing the target.",expected:"No callback while ref.current is null."}],assumptions:["Practice API: useClickOutside(ref, handler) returns nothing and listens for click, including events whose bubbling is stopped.","Portals outside the referenced DOM subtree count as outside."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-click-outside",integrationNotes:["const menuRef = useRef(null); useClickOutside(menuRef, () => setOpen(false)); attach menuRef to the popup."],code:String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useClickOutside(ref, handler) {
  const latest = useRef(handler);
  useCommitEffect(() => { latest.current = handler; }, [handler]);
  useEffect(() => {
    const onClick = event => {
      const element = ref.current;
      if (!element) return;
      const path = event.composedPath ? event.composedPath() : [];
      if (path.includes(element) || element.contains(event.target)) return;
      latest.current(event);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [ref]);
}`}),a({slug:"gfe-use-countdown",title:"useCountdown",difficulty:"Medium",summary:"Start, pause, and reset a countdown that stops at zero.",prompt:"Build a countdown hook that begins paused, decrements at a configurable interval, and exposes controls for starting, stopping, and resetting it.",topics:["Custom hooks","Timers","State machines"],requirements:["Return { count, isRunning, start, stop, reset }.","Never decrement below zero or install duplicate intervals.","Clear the interval on pause, reset, interval changes, and unmount."],example:{actions:"Initialize with 3 and a 1000ms interval, then start and wait 4 seconds.",result:"count is 0 and isRunning is false."},steps:["Store count and running status together.","Use an interval only while running.","Apply each tick to the latest count and stop on the tick that reaches zero."],pitfalls:["Calling start twice should not double the speed.","Reset must pause the countdown as well as restore its value."],complexity:"O(1) work per tick and O(1) space.",testCases:[{action:"Pause at 2 and advance the clock.",expected:"The value remains 2."},{action:"Reset after reaching 0.",expected:"The initial count is restored and the timer is stopped."}],assumptions:["Practice API: useCountdown(initialCount, intervalMs = 1000). The initial count is a nonnegative integer; reset restores the first-render count.","Ticks represent interval firings; this is not a wall-clock deadline timer."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-countdown",integrationNotes:["const timer = useCountdown(30); render timer.count and connect timer.start, timer.stop, and timer.reset to buttons."],code:String.raw`import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCountdown(initialCount, intervalMs = 1000) {
  const initial = useRef(initialCount);
  const [state, setState] = useState({ count: initial.current, isRunning: false });
  const start = useCallback(() => setState(current =>
    current.count > 0 ? { ...current, isRunning: true } : current
  ), []);
  const stop = useCallback(() => setState(current => ({ ...current, isRunning: false })), []);
  const reset = useCallback(() => {
    setState({ count: initial.current, isRunning: false });
  }, []);
  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => {
      setState(current => {
        if (!current.isRunning) return current;
        const count = Math.max(0, current.count - 1);
        return { count, isRunning: count > 0 };
      });
    }, Math.max(1, intervalMs));
    return () => clearInterval(id);
  }, [state.isRunning, intervalMs]);
  return { ...state, start, stop, reset };
}`}),a({slug:"gfe-use-counter-ii",title:"useCounter II",difficulty:"Easy",summary:"Provide stable increment/decrement commands and a configurable reset target.",prompt:"Implement the optimized counter hook: expose a count, React-compatible setter, and memoized increment, decrement, and reset methods.",topics:["Custom hooks","useCallback","Functional updates"],requirements:["Default the initial count to 0.","Keep increment, decrement, and setCount references stable.","Reset to the current initialValue argument; reset is stable while that argument is unchanged."],example:{actions:"Initialize at 5, increment twice, decrement, and reset.",result:"The values are 5, 7, 6, and 5."},steps:["Initialize useState from initialValue.","Express relative changes as functional updates.","Include only initialValue in reset dependencies."],pitfalls:["Depending on count recreates relative commands unnecessarily.","Using a first-render ref for reset would ignore changes to the specified reset target."],complexity:"O(1) time and space per operation.",testCases:[{action:"Queue increment twice before rendering.",expected:"The count increases by 2."},{action:"Change initialValue and invoke reset.",expected:"Reset uses the new initialValue."}],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-counter-ii",integrationNotes:["const { count, increment, reset } = useCounter(10); display count and pass the commands directly as onClick handlers."],code:String.raw`import { useCallback, useState } from 'react';

export default function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(value => value + 1), []);
  const decrement = useCallback(() => setCount(value => value - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  return { count, increment, decrement, reset, setCount };
}`}),a({slug:"gfe-use-cycle",title:"useCycle",difficulty:"Easy",summary:"Cycle through positional values and wrap around after the last.",prompt:"Implement useCycle(...values), returning the current value and a function that advances one position in the sequence.",topics:["Custom hooks","Modulo arithmetic","State"],requirements:["Start at the first supplied value.","Wrap the last position back to the first.","Preserve multiple advances queued within one event."],example:{actions:'Call useCycle("red", "green", "blue"), then cycle three times.',result:'The value returns to "red".'},steps:["Store a position rather than the value itself.","Increment the position through a functional state update.","Use modulo to map the position to the current sequence length."],pitfalls:["Searching for the current value breaks sequences containing duplicates.","An empty sequence needs a defined result."],complexity:"O(1) work per advance; O(n) argument storage for n values.",testCases:[{action:'Cycle through ["a", "a", "b"].',expected:"Both a positions are visited before b."}],assumptions:["An empty sequence returns undefined and cycle does nothing. If the supplied sequence changes, retain the position modulo its new length."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-cycle",integrationNotes:['const [mode, cycle] = useCycle("list", "grid"); show mode and assign cycle to a view-switching button.'],code:String.raw`import { useCallback, useState } from 'react';

export default function useCycle(...values) {
  const [index, setIndex] = useState(0);
  const length = values.length;
  const cycle = useCallback(() => {
    if (length > 0) setIndex(current => (current + 1) % length);
  }, [length]);
  return [length ? values[index % length] : undefined, cycle];
}`}),a({slug:"gfe-use-debounce",title:"useDebounce",difficulty:"Medium",summary:"Publish a value after changes stop for the requested delay.",prompt:"Implement a value-debouncing hook suitable for waiting until a user pauses typing before processing a search term.",topics:["Custom hooks","Debouncing","Timers"],requirements:["Return the initial value immediately.","Restart the waiting period whenever the input value or delay changes.","Cancel pending work on unmount."],example:{actions:'Change a value from "r" to "re" to "react" within 300ms.',result:'With a 300ms delay, only "react" is published after the final pause.'},steps:["Store the published value separately from the input.","Schedule publication in an effect.","Clear the previous timeout before scheduling another."],pitfalls:["Leaving older timeouts active publishes stale values.","Passing a function value directly to setState would execute it."],complexity:"O(1) work and storage per change.",testCases:[{action:"Change the input again before the delay expires.",expected:"The original deadline does not publish the stale input."}],assumptions:["Practice API: useDebounce(value, delayMs); negative delays are treated as zero."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-debounce",integrationNotes:["const debouncedTerm = useDebounce(term, 300); use debouncedTerm as a search effect dependency."],code:String.raw`import { useEffect, useState } from 'react';

export default function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(() => value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(() => value), Math.max(0, delayMs));
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}`}),a({slug:"gfe-use-default",title:"useDefault",difficulty:"Easy",summary:"Substitute a fallback only for null or undefined state.",prompt:"Build a state hook that exposes a fallback value when its internal state is nullish, while retaining the normal state setter contract.",topics:["Custom hooks","Nullish values","State"],requirements:["Return [displayValue, setValue].","Use the fallback only for null and undefined.","Allow direct values and functional updates."],example:{actions:'Use fallback "Guest", then set the value to "", null, and "Sam".',result:'The displayed values are "", "Guest", and "Sam".'},steps:["Keep raw state in useState.","Apply the nullish-coalescing operator only at the return boundary.","Expose the original setter so updater functions receive raw state."],pitfalls:["The || operator incorrectly replaces 0, false, and empty strings.","Replacing raw state with the fallback changes updater semantics."],complexity:"O(1) time and space.",testCases:[{action:"Set false, 0, and an empty string.",expected:"Each value is returned unchanged."}],assumptions:["Practice API: useDefault(defaultValue, initialValue). Updater functions receive stored state, which may be nullish."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-default",integrationNotes:['const [name, setName] = useDefault("Guest", null); display name and call setName(null) to show the fallback again.'],code:String.raw`import { useState } from 'react';

export default function useDefault(defaultValue, initialValue) {
  const [value, setValue] = useState(initialValue);
  return [value ?? defaultValue, setValue];
}`}),a({slug:"gfe-use-effect-once",title:"useEffectOnce",difficulty:"Easy",summary:"Wrap a mount effect while preserving normal React cleanup semantics.",prompt:"Write a hook for effects that do not rerun because of ordinary component rerenders and that may return an unmount cleanup function.",topics:["Custom hooks","Effects","Strict Mode"],requirements:["Accept an effect callback with optional cleanup.","Use an empty dependency array.","Preserve React Strict Mode setup-cleanup-setup behavior."],example:{actions:"Register a subscription, rerender the component, then unmount.",result:"Ordinary rerenders do not resubscribe; unmount releases the subscription."},steps:["Forward the callback to useEffect.","Use an empty dependency array.","Let React invoke cleanup rather than adding a hasRun guard."],pitfalls:["A ref that skips the second Strict Mode setup can leave the component unsubscribed.","Captured props remain the initial props by design."],complexity:"O(1) hook overhead, excluding the effect and its cleanup.",testCases:[{action:"Mount inside StrictMode and unmount.",expected:"Every executed setup has a corresponding cleanup."}],assumptions:["Once means once per production mount, not once across development Strict Mode checks or actual remounts.","Effect callbacks are synchronous; start asynchronous work inside them and return synchronous cleanup."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-effect-once",integrationNotes:["useEffectOnce(() => { const unsubscribe = subscribe(); return unsubscribe; }); use only when initial captured values are sufficient."],code:String.raw`import { useEffect } from 'react';

export default function useEffectOnce(effect) {
  useEffect(effect, []);
}`}),a({slug:"gfe-use-event-listener",title:"useEventListener",difficulty:"Medium",summary:"Subscribe to a DOM event with current callbacks and reliable cleanup.",prompt:"Create a generic event-listener hook that supports an EventTarget or element ref, customizable listener options, and changing callbacks.",topics:["Custom hooks","DOM events","Refs"],requirements:["Accept type, handler, optional target, and listener options.","Default the target to window.","Detach from the exact old target before subscribing to a new target."],example:{actions:"Listen for keydown on window and replace the handler after a rerender.",result:"The next keydown reaches the replacement handler."},steps:["Update a handler ref after commit.","Resolve a ref target inside the subscription effect.","Use a matching target, event name, function, and capture option for cleanup."],pitfalls:["Reading ref.current during the first render usually yields null.","A ref object can stay stable while the DOM node it points to changes."],complexity:"O(1) subscription work per render and O(1) hook storage.",testCases:[{action:"Replace the target element and rerender.",expected:"Events on the old target no longer call the handler."}],assumptions:["Practice API: useEventListener(type, handler, target?, options?). A target may be an EventTarget or { current: EventTarget | null }.","The subscription effect reconciles after each commit so ref target replacements are observed."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-event-listener",integrationNotes:['useEventListener("keydown", event => setLastKey(event.key)); pass a ref as the third argument to scope the listener to an element.'],code:String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useEventListener(type, handler, target, options) {
  const latest = useRef(handler);
  useCommitEffect(() => { latest.current = handler; }, [handler]);
  useEffect(() => {
    const resolved = target === undefined
      ? (typeof window === 'undefined' ? null : window)
      : target && 'current' in target ? target.current : target;
    if (!resolved) return;
    const listener = event => latest.current(event);
    resolved.addEventListener(type, listener, options);
    return () => resolved.removeEventListener(type, listener, options);
  });
}`}),a({slug:"gfe-use-focus",title:"useFocus",difficulty:"Easy",summary:"Pair an element ref with a stable programmatic focus command.",prompt:"Implement a hook that lets a component attach a ref to an input and focus it from another control.",topics:["Custom hooks","Refs","Focus"],requirements:["Return [ref, focus].","Keep the focus function stable across renders.","Ignore focus calls when no element is mounted."],example:{actions:"Attach the ref to an input and invoke focus from a button.",result:"The input becomes document.activeElement."},steps:["Create a persistent object ref.","Memoize a function that calls focus on ref.current.","Forward optional focus options to the DOM API."],pitfalls:["Capturing ref.current during render captures null on mount.","A focus command should not be invoked while rendering."],complexity:"O(1) hook overhead and storage.",testCases:[{action:"Invoke focus before assigning a node.",expected:"No exception."}],assumptions:["Practice API: useFocus() returns [ref, focus]; the target is a focusable DOM element."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-focus",integrationNotes:["const [inputRef, focusInput] = useFocus(); attach inputRef to an input and use onClick={() => focusInput()}."],code:String.raw`import { useCallback, useRef } from 'react';

export default function useFocus() {
  const ref = useRef(null);
  const focus = useCallback(options => ref.current?.focus(options), []);
  return [ref, focus];
}`}),a({slug:"gfe-use-hover",title:"useHover",difficulty:"Medium",summary:"Track pointer entry and exit on an element, including replacement nodes.",prompt:"Implement a hover hook that supplies a ref for an element and reports whether the mouse is currently within that element.",topics:["Custom hooks","Callback refs","DOM events"],requirements:["Return [ref, hovered].","Use mouseenter/mouseleave so movement between children does not flicker.","Remove listeners when the target is replaced or unmounted."],example:{actions:"Enter a card, move over its child, then leave the card.",result:"hovered becomes true, stays true, and finally becomes false."},steps:["Use a stable callback ref to store the mounted node.","Subscribe to entry and exit events for that node.","Reset hover state when switching nodes and clean up old listeners."],pitfalls:["Mouseover and mouseout also fire when crossing descendants.","An object ref alone does not cause an effect to rerun when its node changes."],complexity:"O(1) per event and O(1) storage.",testCases:[{action:"Replace a hovered element with another node.",expected:"Hover resets and events on the old element have no effect."}],assumptions:["Practice API: useHover() returns a callback ref and a boolean; it tracks mouse hover rather than touch contact."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-hover",integrationNotes:['const [ref, hovered] = useHover(); return <div ref={ref}>{hovered ? "Over" : "Away"}</div>.'],code:String.raw`import { useCallback, useEffect, useState } from 'react';

export default function useHover() {
  const [node, setNode] = useState(null);
  const [hovered, setHovered] = useState(false);
  const ref = useCallback(element => { setNode(element); }, []);
  useEffect(() => {
    setHovered(false);
    if (!node) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    node.addEventListener('mouseenter', enter);
    node.addEventListener('mouseleave', leave);
    return () => {
      node.removeEventListener('mouseenter', enter);
      node.removeEventListener('mouseleave', leave);
    };
  }, [node]);
  return [ref, hovered];
}`}),a({slug:"gfe-use-idle",title:"useIdle",difficulty:"Medium",summary:"Report inactivity after a quiet period and resume on user input.",prompt:"Implement an idle detector that becomes true after a configurable period without user activity, then becomes false on the next activity event.",topics:["Custom hooks","Timers","DOM events"],requirements:["Begin active and restart the timer when activity occurs.","Observe pointer movement, pointer down, key presses, and scrolling.","Clear the timer and all listeners on unmount."],example:{actions:"Use a 5000ms threshold, wait 5 seconds, then press a key.",result:"idle becomes true, then immediately false."},steps:["Keep a boolean idle state.","Use one activity handler to clear and restart a timeout.","Install all activity listeners and release them together."],pitfalls:["Failing to clear the previous timeout makes the user idle while they are active.","Leaving a timeout after unmount creates unnecessary work."],complexity:"O(1) per activity event and O(1) storage.",testCases:[{action:"Move the pointer just before the deadline.",expected:"The full idle interval starts again."}],assumptions:["Practice API: useIdle(timeoutMs = 60000) returns a boolean. Changing timeout restarts the activity window.","Visibility changes do not count as user activity in this version."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-idle",integrationNotes:["const idle = useIdle(30000); show an away indicator when idle is true."],code:String.raw`import { useEffect, useState } from 'react';

export default function useIdle(timeoutMs = 60000) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer;
    const activity = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), Math.max(0, timeoutMs));
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll'];
    for (const event of events) window.addEventListener(event, activity, true);
    activity();
    return () => {
      clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, activity, true);
    };
  }, [timeoutMs]);
  return idle;
}`}),a({slug:"gfe-use-input-control",title:"useInputControl",difficulty:"Medium",summary:"Track a controlled input value, persistent interaction flags, and differences.",prompt:"Build an input-state hook with change and blur handlers, dirty and touched flags, a comparison to the original value, and a full reset.",topics:["Custom hooks","Controlled inputs","Form state"],requirements:["Return value, dirty, touched, different, handleChange, handleBlur, and reset.","Keep dirty true after a change even if the value returns to its initial string.","Compare and reset against the first-render value."],example:{actions:'Start with "Ada", type "Ada!", change back to "Ada", and blur.',result:"dirty and touched are true, while different is false."},steps:["Capture the initial string in a ref.","Store current value and persistent interaction flags together.","Derive different from the current and initial strings; reset all state at once."],pitfalls:["dirty is historical, while different is a current comparison.","Later initialValue arguments must not silently change the reset baseline."],complexity:"O(1) state operations, excluding string comparison length.",testCases:[{action:"Change away and back, then reset.",expected:"Returning keeps dirty true; reset clears dirty and touched."}],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-input-control",integrationNotes:['const input = useInputControl(""); bind input.value, input.handleChange, and input.handleBlur to a text input.'],code:String.raw`import { useCallback, useRef, useState } from 'react';

export default function useInputControl(initialValue = '') {
  const initial = useRef(initialValue);
  const [state, setState] = useState({ value: initial.current, dirty: false, touched: false });
  const handleChange = useCallback(event => {
    const value = event.target.value;
    setState(current => ({ ...current, value, dirty: true }));
  }, []);
  const handleBlur = useCallback(() => {
    setState(current => ({ ...current, touched: true }));
  }, []);
  const reset = useCallback(() => {
    setState({ value: initial.current, dirty: false, touched: false });
  }, []);
  return { ...state, different: state.value !== initial.current, handleChange, handleBlur, reset };
}`}),a({slug:"gfe-use-interval",title:"useInterval",difficulty:"Medium",summary:"Run a fresh callback on a stable interval and pause with null.",prompt:"Create an interval hook that does not restart its clock merely because the callback changes.",topics:["Custom hooks","Timers","Stale closures"],requirements:["Accept a callback and a delay in milliseconds.","Use the latest committed callback at every tick.","Pause for a null delay and clean up on delay changes or unmount."],example:{actions:"Set a 1000ms delay, rerender with a new callback after 500ms, then wait 500ms.",result:"The new callback runs at the original one-second deadline."},steps:["Update a callback ref after each relevant commit.","Create the interval in an effect depending only on the delay.","Clear the interval from the effect cleanup."],pitfalls:["Adding callback to interval dependencies continually restarts the clock.","Closing over the first callback produces stale state."],complexity:"O(1) overhead per tick and O(1) storage.",testCases:[{action:"Change delay to null, then advance time.",expected:"No more callbacks run until a numeric delay is restored."}],assumptions:["Practice API: useInterval(callback, delayMs), with null disabling the interval; non-null delays are nonnegative finite numbers."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-interval",integrationNotes:["useInterval(() => setElapsed(value => value + 1), running ? 1000 : null);"],code:String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useInterval(callback, delayMs) {
  const latest = useRef(callback);
  useCommitEffect(() => { latest.current = callback; }, [callback]);
  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => latest.current(), Math.max(0, delayMs));
    return () => clearInterval(id);
  }, [delayMs]);
}`}),a({slug:"gfe-use-key-press",title:"useKeyPress",difficulty:"Medium",summary:"Track whether a requested keyboard key is currently held.",prompt:"Implement a keyboard-state hook that marks a key as pressed on keydown and releases it on keyup or window blur.",topics:["Custom hooks","Keyboard events","Cleanup"],requirements:["Match KeyboardEvent.key.","Ignore unrelated keys and handle repeat keydown events safely.","Release the state on window blur and remove all listeners on unmount."],example:{actions:'Track "Escape", press it, then switch windows before releasing it.',result:"The value becomes true on press and false when the browser loses focus."},steps:["Store one pressed boolean.","Install matching keydown and keyup handlers.","Add a blur reset to avoid stuck pressed state."],pitfalls:["Event.code and event.key have different meanings.","A missed keyup after switching windows can leave state stuck."],complexity:"O(1) per keyboard event and O(1) storage.",testCases:[{action:"Press an unrelated key.",expected:"The tracked key remains unpressed."}],assumptions:["Practice API: useKeyPress(targetKey) returns a boolean; matching is case-sensitive against event.key.","Changing targetKey resets pressed state."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-key-press",integrationNotes:['const escapePressed = useKeyPress("Escape"); display keyboard state or react to it in a component effect.'],code:String.raw`import { useEffect, useState } from 'react';

export default function useKeyPress(targetKey) {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    setPressed(false);
    const down = event => { if (event.key === targetKey) setPressed(true); };
    const up = event => { if (event.key === targetKey) setPressed(false); };
    const release = () => setPressed(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
    };
  }, [targetKey]);
  return pressed;
}`}),a({slug:"gfe-use-map",title:"useMap",difficulty:"Medium",summary:"Maintain Map state with immutable writes, removals, and reset.",prompt:"Create a hook for a JavaScript Map with methods that publish new Map instances instead of mutating rendered state.",topics:["Custom hooks","Map","Immutable state"],requirements:["Return { map, set, remove, clear, reset }.","Support keys of any JavaScript type.","Use the latest state for queued operations and preserve the initial reset snapshot."],example:{actions:'Start with [["tea", 2]], call set("coffee", 1), then remove("tea").',result:"The map contains only coffee → 1."},steps:["Copy initial entries into a reset snapshot and current state.","Clone the current map before changing a key.","Memoize commands and construct a fresh map for reset or clear."],pitfalls:["Mutating a Map and reusing its identity can skip React rendering.","Object keys are compared by identity, not by their fields."],complexity:"O(n) time and space per copying operation for n entries; clear is O(1).",testCases:[{action:"Set two keys in one event and inspect the old map.",expected:"Both new keys exist; the old map is unchanged."}],assumptions:["Practice API: useMap(initialEntries = []) returns an object; set(key, value) assigns one entry.","Initial entries may be an iterable or Map. Reset uses a shallow first-render snapshot."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-map",integrationNotes:['const { map, set } = useMap([["visits", 0]]); render [...map] and call set("visits", 1).'],code:String.raw`import { useCallback, useRef, useState } from 'react';

export default function useMap(initialEntries = []) {
  const initial = useRef(null);
  if (initial.current === null) initial.current = new Map(initialEntries);
  const [map, setMap] = useState(() => new Map(initial.current));
  const set = useCallback((key, value) => {
    setMap(current => new Map(current).set(key, value));
  }, []);
  const remove = useCallback(key => {
    setMap(current => {
      const next = new Map(current);
      next.delete(key);
      return next;
    });
  }, []);
  const clear = useCallback(() => setMap(new Map()), []);
  const reset = useCallback(() => setMap(new Map(initial.current)), []);
  return { map, set, remove, clear, reset };
}`}),a({slug:"gfe-use-media-query",title:"useMediaQuery",difficulty:"Medium",summary:"Subscribe to media-query matches and switch subscriptions when the query changes.",prompt:"Implement a hook that returns whether a CSS media query matches and updates when the browser reports a change.",topics:["Custom hooks","Responsive design","Browser APIs"],requirements:["Read the initial match from matchMedia(query).matches.","Listen to the MediaQueryList change event.","Detach from the old query when the query string changes."],example:{actions:'Observe "(min-width: 800px)" and cross the 800px viewport boundary.',result:"The return value follows the media query match."},steps:["Create a MediaQueryList for the current query.","Store its match and subscribe to change.","Remove the exact listener during cleanup; use a server fallback when window is absent."],pitfalls:["A resize listener alone misses orientation and preference queries.","Subscribing only on mount leaves a changed query unobserved."],complexity:"O(1) hook work per notification and O(1) storage.",testCases:[{action:"Switch from a matching query to a nonmatching query.",expected:"The result updates and the old query listener is removed."}],assumptions:["The server fallback is false. Client environments provide the modern MediaQueryList addEventListener API."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-media-query",integrationNotes:['const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)"); use it to simplify animations.'],code:String.raw`import { useEffect, useState } from 'react';

export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}`}),a({slug:"gfe-use-mediated-state",title:"useMediatedState",difficulty:"Medium",summary:"Route state updates through either a transforming or dispatching mediator.",prompt:"Implement a state hook whose original mediator may transform a proposed value or decide when to dispatch it. Support normal functional updates and retain the first mediator across rerenders.",topics:["Custom hooks","State mediation","Refs"],requirements:["Accept mediator followed by initialState and return [state, setState].","For a unary mediator, store its returned value; for a two-argument mediator, provide a dispatch function.","Retain the original mediator and a stable public setter."],example:{actions:'Use value => value.trim(), initialize with "", then set "  hello  ".',result:'The stored value is "hello".'},steps:["Capture the initial mediator in a ref.","Resolve functional proposals against the latest dispatched value.","Call the mediator outside React updater functions so interceptors can safely perform asynchronous work."],pitfalls:["Running a side-effecting mediator inside a state updater can duplicate work in Strict Mode.","Replacing the mediator on rerender changes the stated contract."],complexity:"O(1) hook overhead and storage; mediator complexity is application-defined.",testCases:[{action:"Replace the mediator prop, then set a value.",expected:"The original mediator still applies."},{action:"Use a two-argument mediator that does not dispatch.",expected:"The state does not change."}],assumptions:["The initial value is not mediated. Function proposals are updater functions, following useState semantics.","Mediator arity is determined by function.length; a dispatching mediator must declare two ordinary parameters.","Deferred dispatches commit in invocation order and are ignored after unmount."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-mediated-state",integrationNotes:['const [name, setName] = useMediatedState(value => value.replace(/ +/g, " "), ""); bind setName(event.target.value) to an input.'],code:String.raw`import { useCallback, useEffect, useRef, useState } from 'react';

export default function useMediatedState(mediator, initialState) {
  const originalMediator = useRef(mediator);
  const [state, commit] = useState(initialState);
  const current = useRef(state);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const dispatch = useCallback(proposal => {
    if (!mounted.current) return;
    const value = typeof proposal === 'function' ? proposal(current.current) : proposal;
    current.current = value;
    commit(() => value);
  }, []);
  const setState = useCallback(proposal => {
    if (!mounted.current) return;
    const value = typeof proposal === 'function' ? proposal(current.current) : proposal;
    const mediate = originalMediator.current;
    if (mediate.length >= 2) mediate(value, dispatch);
    else {
      const transformed = mediate(value);
      dispatch(() => transformed);
    }
  }, [dispatch]);
  return [state, setState];
}`}),a({slug:"gfe-use-object",title:"useObject",difficulty:"Medium",summary:"Update a plain object through immutable set, merge, remove, and reset operations.",prompt:"Implement an object-state hook with commands for replacing a property, merging a patch, deleting a property, clearing, and restoring initial values.",topics:["Custom hooks","Objects","Immutable state"],requirements:["Return { object, set, merge, remove, clear, reset }.","Keep commands stable and derive each update from the latest object.","Use shallow copies and leave older state objects unchanged."],example:{actions:'Start with { name: "Ada" }, set("age", 30), then remove("name").',result:"The object becomes { age: 30 }."},steps:["Snapshot initial own enumerable properties.","Use object spread for replacements and patches.","Delete keys only from a newly created object."],pitfalls:["Deleting a key from the existing object mutates already-rendered state.","Shallow operations do not copy nested objects."],complexity:"O(n) time and space per shallow copy for n properties; clear is O(1).",testCases:[{action:"Merge two patches in the same event.",expected:"Both patches are reflected in the final object."}],assumptions:["Practice API: useObject(initialObject = {}); set(key, value) replaces one property and merge(patch) applies a shallow patch.","Values are plain data objects; reset restores a first-render shallow snapshot."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-object",integrationNotes:['const { object: profile, set } = useObject({ name: "" }); set("name", event.target.value) updates the name field.'],code:String.raw`import { useCallback, useRef, useState } from 'react';

export default function useObject(initialObject = {}) {
  const initial = useRef(null);
  if (initial.current === null) initial.current = { ...initialObject };
  const [object, setObject] = useState(() => ({ ...initial.current }));
  const set = useCallback((key, value) => {
    setObject(current => ({ ...current, [key]: value }));
  }, []);
  const merge = useCallback(patch => setObject(current => ({ ...current, ...patch })), []);
  const remove = useCallback(key => {
    setObject(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);
  const clear = useCallback(() => setObject({}), []);
  const reset = useCallback(() => setObject({ ...initial.current }), []);
  return { object, set, merge, remove, clear, reset };
}`}),a({slug:"gfe-use-previous",title:"usePrevious",difficulty:"Easy",summary:"Remember the previous distinct committed value, ignoring repeated values.",prompt:"Create a hook that returns the value before the latest distinct value, rather than simply the value from the last render.",topics:["Custom hooks","Refs","Value history"],requirements:["Return undefined before the first change.","Ignore repeated equal inputs.","Update history only after a render commits."],example:{actions:"Render values A, A, B, B, C.",result:"The hook returns undefined, undefined, A, A, B."},steps:["Store the last committed value and its distinct predecessor.","Derive the current answer before the effect updates history.","Advance history in the effect only when Object.is reports a change."],pitfalls:["A plain previous-render ref loses the predecessor when an unrelated rerender occurs.","Mutating history during render can record values from abandoned renders."],complexity:"O(1) time and space.",testCases:[{action:"Render 1, 2, 2, 3.",expected:"Return undefined, 1, 1, 2."},{action:"Render NaN twice.",expected:"Treat NaN as unchanged."}],assumptions:["The catalog specifies previous distinct state; this implementation compares with Object.is and stores committed render history.","Object equality is by reference; no deep comparison is performed."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-previous",integrationNotes:["const previousScore = usePrevious(score); compare score to previousScore to show whether the score rose or fell."],code:String.raw`import { useEffect, useRef } from 'react';

export default function usePrevious(value) {
  const history = useRef({ current: value, previous: undefined });
  const changed = !Object.is(history.current.current, value);
  const previous = changed ? history.current.current : history.current.previous;
  useEffect(() => {
    if (!Object.is(history.current.current, value)) {
      history.current = { current: value, previous: history.current.current };
    }
  }, [value]);
  return previous;
}`}),a({slug:"gfe-use-query",title:"useQuery",difficulty:"Medium",summary:"Manage promise status while ignoring obsolete requests and unmounted results.",prompt:"Implement useQuery(fn, deps) to run a promise-producing function when dependencies change and expose loading, success, or error state for the active request.",topics:["Custom hooks","Async state","Race conditions"],requirements:['Default deps to [] and return { status: "loading" } when a request starts.','On fulfillment return { status: "success", data }; on rejection return { status: "error", error }.',"Ignore both fulfilled and rejected results from obsolete or unmounted requests."],example:{actions:"Start request A, change the dependencies to start B, let B resolve, then let A resolve.",result:"The result remains B; the stale A result is ignored."},steps:["Store one discriminated result object to prevent incompatible fields.","Start a request in an effect controlled by deps.","Give each effect an active flag and retire it in cleanup; catch synchronous throws as errors too."],pitfalls:["Adding an inline fn to dependencies can cause an endless request loop.","Handling only successful stale responses still allows stale errors to overwrite the latest result."],complexity:"O(1) hook overhead and storage per in-flight effect; underlying request cost is external.",testCases:[{action:"Reject a stale request after a newer one succeeds.",expected:"Keep the newer success state."},{action:"Throw synchronously from fn.",expected:"Expose the thrown value through error state."}],assumptions:["The public API is useQuery(fn, deps = []), not a query-key/options API. The caller lists all values that should restart the request in deps.","No cache, retries, or network cancellation is implemented; cleanup prevents obsolete state writes."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-query",integrationNotes:['const result = useQuery(() => fetch("/api/items/" + id).then(response => { if (!response.ok) throw new Error("Request failed"); return response.json(); }), [id]); branch on result.status before reading data or error.'],code:String.raw`import { useEffect, useState } from 'react';

export default function useQuery(fn, deps = []) {
  const [result, setResult] = useState({ status: 'loading' });
  useEffect(() => {
    let active = true;
    setResult({ status: 'loading' });
    async function execute() {
      try {
        const data = await fn();
        if (active) setResult({ status: 'success', data });
      } catch (error) {
        if (active) setResult({ status: 'error', error });
      }
    }
    execute();
    return () => { active = false; };
  }, deps);
  return result;
}`}),a({slug:"gfe-use-set",title:"useSet",difficulty:"Medium",summary:"Manage unique values through immutable Set updates.",prompt:"Implement a Set hook with add, remove, toggle, reset, and clear methods, preserving React-observable object identities.",topics:["Custom hooks","Set","Immutable state"],requirements:["Return { set, add, remove, toggle, reset, clear }.","Clone before every membership update and support queued operations.","Restore the supplied initialState object on reset; clear creates a new empty Set."],example:{actions:'Start with Set(["a"]), toggle("a"), add("b"), and reset.',result:"Membership goes from a, to empty, to b, then back to the initial a Set."},steps:["Store the supplied initial Set.","Clone previous state before changing membership.","Memoize the relative commands and let reset track its initialState argument."],pitfalls:["Set.add mutates its receiver.","Reset and clear have different contents and object-identity behavior."],complexity:"O(n) time and space for cloning a Set with n values; reset and clear are O(1).",testCases:[{action:"Add a duplicate value.",expected:"Membership contains that value only once."},{action:"Reset after changes.",expected:"The returned Set is the supplied initialState object."}],assumptions:["Treat returned and initial Set objects as read-only outside the hook. Reset follows the currently supplied initialState argument."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-set",integrationNotes:["const { set: selected, toggle } = useSet(initialSelection); call toggle(id) when a checkbox changes and read selected.has(id)."],code:String.raw`import { useCallback, useState } from 'react';

const EMPTY_SET = new Set();

export default function useSet(initialState = EMPTY_SET) {
  const [set, setSet] = useState(initialState);
  const add = useCallback(item => {
    setSet(current => new Set(current).add(item));
  }, []);
  const remove = useCallback(item => {
    setSet(current => {
      const next = new Set(current);
      next.delete(item);
      return next;
    });
  }, []);
  const toggle = useCallback(item => {
    setSet(current => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);
  const reset = useCallback(() => setSet(initialState), [initialState]);
  const clear = useCallback(() => setSet(new Set()), []);
  return { set, add, remove, toggle, reset, clear };
}`}),a({slug:"gfe-use-state-with-reset",title:"useStateWithReset",difficulty:"Easy",summary:"Extend useState with a stable reset to the original initialized value.",prompt:"Write a hook that behaves like useState but also returns a reset command. Preserve lazy initialization and updater-function behavior.",topics:["Custom hooks","Lazy initialization","State"],requirements:["Return [state, setState, reset].","Evaluate a lazy initializer through useState.","Reset to the first initialized value without rerunning the initializer."],example:{actions:"Initialize lazily to 10, set to 20, and reset.",result:"State returns to 10 and reset does not call the initializer again."},steps:["Initialize state using the original useState contract.","Capture the initialized result in a ref.","Memoize reset and wrap the stored result so function-valued state remains a value."],pitfalls:["Calling a lazy initializer on each render does unnecessary work.","Later initial arguments must not overwrite the reset snapshot."],complexity:"O(1) overhead and storage, excluding initialization.",testCases:[{action:"Pass a different initial argument after mounting, then reset.",expected:"Return to the original initialized value."}],assumptions:["Reset uses the first mount value by reference; callers must follow normal immutable state conventions.","React may invoke a lazy initializer twice during development Strict Mode checks."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-state-with-reset",integrationNotes:["const [draft, setDraft, resetDraft] = useStateWithReset(() => createDraft()); connect resetDraft to a cancel button."],code:String.raw`import { useCallback, useRef, useState } from 'react';

export default function useStateWithReset(initialValue) {
  const [state, setState] = useState(initialValue);
  const initial = useRef(state);
  const reset = useCallback(() => setState(() => initial.current), []);
  return [state, setState, reset];
}`}),a({slug:"gfe-use-step",title:"useStep",difficulty:"Medium",summary:"Navigate a bounded one-based step counter for a wizard.",prompt:"Implement a step controller with next, previous, direct selection, reset, and flags indicating whether movement is possible.",topics:["Custom hooks","Bounds","State"],requirements:["Keep the step between 1 and maxStep.","Return step, canGoToNextStep, canGoToPrevStep, goToNextStep, goToPrevStep, setStep, and reset.","Clamp values when maxStep shrinks or a direct update exceeds the range."],example:{actions:"Use 3 steps and call next four times.",result:"The step stops at 3 and canGoToNextStep becomes false."},steps:["Normalize the positive maximum and define one clamping rule.","Use functional updates for relative navigation.","Derive navigation flags from the clamped step and reconcile changes to the maximum."],pitfalls:["Separate disabled-button logic does not protect programmatic method calls.","A smaller maximum can invalidate the current step."],complexity:"O(1) time and space per operation.",testCases:[{action:"Set a step above the maximum and then decrease maxStep.",expected:"Both operations clamp the current step to a valid value."}],assumptions:["Practice API: useStep(maxStep, initialStep = 1) returns an object. maxStep is a finite positive integer.","Direct setStep supports values or updater functions; reset uses the first initialStep clamped to the current maximum."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-step",integrationNotes:["const wizard = useStep(4); render wizard.step and disable Next when !wizard.canGoToNextStep."],code:String.raw`import { useCallback, useEffect, useRef, useState } from 'react';

export default function useStep(maxStep, initialStep = 1) {
  const maximum = Math.max(1, Math.floor(maxStep));
  const initial = useRef(initialStep);
  const clamp = useCallback(value => Math.min(maximum, Math.max(1, Math.floor(value))), [maximum]);
  const [storedStep, updateStep] = useState(() => clamp(initialStep));
  const step = clamp(storedStep);
  useEffect(() => { updateStep(current => clamp(current)); }, [clamp]);
  const setStep = useCallback(proposal => {
    updateStep(current => clamp(typeof proposal === 'function' ? proposal(clamp(current)) : proposal));
  }, [clamp]);
  const goToNextStep = useCallback(() => setStep(current => current + 1), [setStep]);
  const goToPrevStep = useCallback(() => setStep(current => current - 1), [setStep]);
  const reset = useCallback(() => setStep(initial.current), [setStep]);
  return {
    step, canGoToNextStep: step < maximum, canGoToPrevStep: step > 1,
    setStep, goToNextStep, goToPrevStep, reset,
  };
}`}),a({slug:"gfe-use-throttle",title:"useThrottle",difficulty:"Medium",summary:"Publish the latest value at most once per time window.",prompt:"Implement a throttled value hook that updates immediately after an idle window and keeps the latest pending input for a trailing update during a busy window.",topics:["Custom hooks","Throttling","Timers"],requirements:["Return the initial input immediately.","Preserve the current window deadline when more values arrive.","Publish the latest queued input at the trailing edge and cancel pending timers on unmount."],example:{actions:"With delay 100ms, input changes at 20ms, 50ms, and 90ms.",result:"At 100ms, publish the input from 90ms instead of postponing to 190ms."},steps:["Track the timestamp of the last publication.","Publish immediately when enough time has passed.","Otherwise schedule only the remaining window time, replacing stale pending input through effect cleanup."],pitfalls:["Restarting a full delay on every change implements debounce, not throttle.","A trailing timer must use the latest input rather than the first input in its window."],complexity:"O(1) work per change and O(1) storage.",testCases:[{action:"Send frequent changes within one delay window.",expected:"Publish the newest value at the original window boundary."}],assumptions:["Practice API: useThrottle(value, delayMs), with an immediate initial value and trailing updates; negative delays are zero.","Changing delay recalculates the deadline from the last actual publication."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-throttle",integrationNotes:["const throttledPosition = useThrottle(position, 100); use it for a lower-frequency position readout."],code:String.raw`import { useEffect, useRef, useState } from 'react';

export default function useThrottle(value, delayMs) {
  const [throttled, setThrottled] = useState(() => value);
  const lastPublished = useRef(Date.now());
  const publishedValue = useRef(value);
  useEffect(() => {
    if (Object.is(value, publishedValue.current)) return;
    const publish = () => {
      lastPublished.current = Date.now();
      publishedValue.current = value;
      setThrottled(() => value);
    };
    const remaining = Math.max(0, delayMs) - (Date.now() - lastPublished.current);
    if (remaining <= 0) {
      publish();
      return;
    }
    const id = setTimeout(publish, remaining);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return throttled;
}`}),a({slug:"gfe-use-timeout",title:"useTimeout",difficulty:"Medium",summary:"Invoke the latest callback once after a configurable delay.",prompt:"Implement a timeout hook that preserves its deadline when the callback changes, restarts when the delay changes, and cancels on unmount.",topics:["Custom hooks","Timers","Stale closures"],requirements:["Accept callback and delayMs; null disables the timer.","Use the latest committed callback at the deadline.","Restart only when delay changes and clean up the old timeout."],example:{actions:"Schedule for 500ms, replace the callback at 300ms, then wait 200ms.",result:"The replacement callback runs once at the original deadline."},steps:["Store the callback in a ref updated after commit.","Schedule an effect-owned timeout using only delay dependencies.","Clear that timeout in cleanup."],pitfalls:["Depending on callback identity can postpone the timeout on every render.","A callback ref does not replace timer cleanup."],complexity:"O(1) scheduling overhead and O(1) storage.",testCases:[{action:"Unmount before the timeout expires.",expected:"The callback never runs."}],assumptions:["Practice API: useTimeout(callback, delayMs) returns nothing; null cancels and a new numeric delay starts a fresh timeout."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-timeout",integrationNotes:["useTimeout(() => setVisible(false), visible ? 3000 : null); use it for a temporary notice."],code:String.raw`import { useEffect, useLayoutEffect, useRef } from 'react';

const useCommitEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useTimeout(callback, delayMs) {
  const latest = useRef(callback);
  useCommitEffect(() => { latest.current = callback; }, [callback]);
  useEffect(() => {
    if (delayMs === null) return;
    const id = setTimeout(() => latest.current(), Math.max(0, delayMs));
    return () => clearTimeout(id);
  }, [delayMs]);
}`}),a({slug:"gfe-use-toggle",title:"useToggle",difficulty:"Easy",summary:"Flip a boolean with a stable command or explicitly choose its next value.",prompt:"Create a boolean toggle hook whose command can invert the current state or accept an explicit boolean target.",topics:["Custom hooks","Boolean state","Functional updates"],requirements:["Default to false and return [value, toggle].","Toggle the latest value when no boolean argument is supplied.","Keep the toggle command stable across renders."],example:{actions:"Start false, toggle(), toggle(true), then toggle(false).",result:"The values are true, true, and false."},steps:["Store a boolean in useState.","Use a functional update for inversion.","Only treat actual boolean arguments as explicit assignments."],pitfalls:["A button passes an event argument; treating every truthy argument as true breaks onClick={toggle}.","Capturing value loses queued inversions."],complexity:"O(1) time and space.",testCases:[{action:"Call toggle twice in one event.",expected:"The original value is restored."}],assumptions:["Practice API: useToggle(initialValue = false) returns a tuple. Nonboolean arguments, including click events, request inversion."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-toggle",integrationNotes:["const [expanded, toggle] = useToggle(); use toggle directly as a button onClick handler and expanded for aria-expanded."],code:String.raw`import { useCallback, useState } from 'react';

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(Boolean(initialValue));
  const toggle = useCallback(next => {
    setValue(current => typeof next === 'boolean' ? next : !current);
  }, []);
  return [value, toggle];
}`}),a({slug:"gfe-use-window-size",title:"useWindowSize",difficulty:"Medium",summary:"Return the viewport width and height and update on resize.",prompt:"Write a hook that measures window.innerWidth and window.innerHeight immediately and keeps those dimensions current as the window changes size.",topics:["Custom hooks","Browser APIs","Event cleanup"],requirements:["Return { width, height }.","Measure on mount and on each resize event.","Unsubscribe from resize on unmount."],example:{actions:"Resize the viewport to 1280 by 720.",result:"The hook reports { width: 1280, height: 720 }."},steps:["Define one measurement function.","Initialize state from the browser dimensions.","Subscribe to resize and avoid publishing an identical measurement."],pitfalls:["screen.width measures the physical display rather than the viewport.","Waiting for the first resize leaves initial dimensions unavailable."],complexity:"O(1) work per resize and O(1) storage.",testCases:[{action:"Resize width and height together.",expected:"Both values update in the same state object."}],assumptions:["On the server both dimensions are undefined; normal client renders read window immediately."],sourceUrl:"https://www.greatfrontend.com/questions/javascript/use-window-size",integrationNotes:["const { width, height } = useWindowSize(); display the values in a viewport-size readout."],code:String.raw`import { useEffect, useState } from 'react';

function measure() {
  return typeof window === 'undefined'
    ? { width: undefined, height: undefined }
    : { width: window.innerWidth, height: window.innerHeight };
}

export default function useWindowSize() {
  const [size, setSize] = useState(measure);
  useEffect(() => {
    const resize = () => {
      const next = measure();
      setSize(current => current.width === next.width && current.height === next.height ? current : next);
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);
  return size;
}`})],_=[a({slug:"gfe-analog-clock",title:"Analog Clock",difficulty:"Medium",summary:"Draw a live clock with correctly positioned hour, minute, and second hands.",prompt:"Create a clock face that reflects the local wall-clock time and continues updating while mounted.",topics:["Timers","SVG","Effects"],requirements:["Show twelve hour markers and three hands.","Include minute and second fractions in the slower hands.","Read the actual clock on every tick and clean up the interval."],assumptions:["The full premium prompt is unavailable. This practice version uses a 12-hour face, local time, and one-second updates."],example:{actions:"View the clock at 03:30:00.",result:"The minute hand points down and the hour hand sits halfway between 3 and 4."},steps:["Store the current Date and replace it every second.","Convert each time unit to clockwise degrees, including fractional units.","Rotate SVG lines about the face center and provide a textual time label."],pitfalls:["Incrementing a counter instead of reading the clock introduces drift.","A fixed hour hand jumps rather than tracking the minutes."],complexity:"O(1) time and space per update.",testCases:[{action:"Advance one second.",expected:"The time label and second-hand angle update."},{action:"Unmount.",expected:"No interval remains."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/analog-clock/react",code:String.raw`import React, { useEffect, useState } from 'react';

export default function AnalogClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const second = now.getSeconds();
  const minute = now.getMinutes() + second / 60;
  const hour = (now.getHours() % 12) + minute / 60;
  const time = [now.getHours(), now.getMinutes(), second]
    .map(value => String(value).padStart(2, '0')).join(':');
  return <figure style={{ margin: 0, width: 260, textAlign: 'center' }}>
    <svg viewBox="0 0 200 200" role="img" aria-label={'Analog time ' + time}>
      <circle cx="100" cy="100" r="95" fill="#f8fafc" stroke="#334155" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, index) => <line key={index}
        x1="100" y1="13" x2="100" y2="23" stroke="#334155" strokeWidth="3"
        transform={'rotate(' + index * 30 + ' 100 100)'} />)}
      <line data-hand="hour" x1="100" y1="100" x2="100" y2="51" stroke="#0f172a" strokeWidth="7"
        strokeLinecap="round" transform={'rotate(' + hour * 30 + ' 100 100)'} />
      <line data-hand="minute" x1="100" y1="100" x2="100" y2="30" stroke="#334155" strokeWidth="5"
        strokeLinecap="round" transform={'rotate(' + minute * 6 + ' 100 100)'} />
      <line data-hand="second" x1="100" y1="110" x2="100" y2="23" stroke="#dc2626" strokeWidth="2"
        transform={'rotate(' + second * 6 + ' 100 100)'} />
      <circle cx="100" cy="100" r="5" fill="#dc2626" />
    </svg>
    <figcaption><time dateTime={now.toISOString()}>{time}</time></figcaption>
  </figure>;
}`}),a({slug:"gfe-birth-year-histogram",title:"Birth Year Histogram",difficulty:"Medium",summary:"Fetch a list of birth years and display their frequencies as proportional bars.",prompt:"Build a histogram from asynchronously loaded birth-year records. Make loading, empty data, retry, and request replacement understandable to the user.",topics:["Networking","Data aggregation","Effects"],requirements:["Aggregate repeated valid integer years and sort them numerically.","Scale the largest bar to the available width and label every frequency.","Handle loading, failure, retry, empty results, and stale requests."],assumptions:["The full premium API contract is unavailable. The endpoint prop accepts JSON arrays of integer years; the default data URL supplies an offline sample.","Years from 1 through the current year are accepted; malformed entries are ignored."],example:{actions:"Load [1990, 1992, 1990].",result:"1990 has a frequency of 2 and 1992 has a frequency of 1."},steps:["Fetch the endpoint with an AbortController and an active-effect guard.","Count valid years with a Map and sort its entries.","Render proportional bars with text labels and offer retry on failure."],pitfalls:["Lexicographic sorting is unsuitable for numeric years.","A response from a previous endpoint must not replace the current dataset."],complexity:"O(n + k log k) time and O(k) space for n records and k distinct years.",testCases:[{action:"Fetch duplicate, invalid, and unsorted years.",expected:"Only valid years are counted and bars are sorted."},{action:"Change endpoints before the first resolves.",expected:"The older response is ignored."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/birth-year-histogram/react",code:String.raw`import React, { useEffect, useState } from 'react';

const SAMPLE = 'data:application/json,%5B1988%2C1990%2C1990%2C1993%2C1993%2C1993%2C1998%5D';
export default function BirthYearHistogram({ endpoint = SAMPLE, fetcher = fetch }) {
  const [state, setState] = useState({ status: 'loading', years: [], error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ status: 'loading', years: [], error: '' });
    (async () => {
      try {
        const response = await fetcher(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load birth years.');
        const years = await response.json();
        if (!Array.isArray(years)) throw new Error('Expected an array of years.');
        if (active) setState({ status: 'ready', years, error: '' });
      } catch (error) {
        if (active) setState({ status: 'error', years: [], error: error.message });
      }
    })();
    return () => { active = false; controller.abort(); };
  }, [endpoint, fetcher, attempt]);
  const counts = new Map();
  for (const year of state.years) {
    if (Number.isInteger(year) && year > 0 && year <= new Date().getFullYear()) {
      counts.set(year, (counts.get(year) || 0) + 1);
    }
  }
  const bars = [...counts].sort((a, b) => a[0] - b[0]);
  const max = Math.max(1, ...bars.map(([, count]) => count));
  return <section aria-label="Birth year histogram" style={{ maxWidth: 540 }}>
    <h2>Birth years</h2>
    {state.status === 'loading' && <p role="status">Loading birth years…</p>}
    {state.status === 'error' && <><p role="alert">{state.error}</p>
      <button onClick={() => setAttempt(value => value + 1)}>Retry</button></>}
    {state.status === 'ready' && (bars.length ? <ul style={{ listStyle: 'none', padding: 0 }}>
      {bars.map(([year, count]) => <li key={year} aria-label={year + ': ' + count}
        style={{ display: 'grid', gridTemplateColumns: '4em 1fr 2em', gap: 8, margin: '8px 0' }}>
        <span>{year}</span><span aria-hidden="true" style={{ background: '#e2e8f0' }}>
          <span style={{ display: 'block', background: '#2563eb', height: 24, width: count / max * 100 + '%' }} />
        </span><span>{count}</span>
      </li>)}
    </ul> : <p>No valid birth years.</p>)}
  </section>;
}`}),a({slug:"gfe-connect-four",title:"Connect Four",difficulty:"Medium",summary:"Play a two-player disc game with gravity and four-direction win detection.",prompt:"Build a local two-player Connect Four game. Players select columns, discs fall into the lowest empty space, and play ends when someone connects four or the board fills.",topics:["Games","State management","Grid"],requirements:["Use a six-row, seven-column board and alternate red/yellow turns.","Reject full columns and all moves after a win or draw.","Recognize horizontal, vertical, and both diagonal wins; support restart."],assumptions:["The premium prompt is not visible. This implementation uses standard 6 × 7 Connect Four rules and local players."],example:{actions:"Alternate columns 1 and 2, with Red dropping into column 1 four times.",result:"Red wins vertically; the board stops accepting moves."},steps:["Store board, next player, and result in one state object.","Locate the bottom empty row and copy the board before placing a disc.","Count both directions on each of four axes, then check for a full board."],pitfalls:["Checking only one diagonal direction misses wins.","Full-column clicks must not consume a turn."],complexity:"O(rows × columns) per move to copy the board; O(rows × columns) space.",testCases:[{action:"Play a vertical win.",expected:"The winner is announced and all drop buttons disable."},{action:"Fill a column or restart.",expected:"A full column rejects moves; restart clears every disc."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/connect-four/react",code:String.raw`import React, { useState } from 'react';

const initialGame = () => ({ board: Array.from({ length: 6 }, () => Array(7).fill(null)), player: 'Red', result: '' });
export function hasWon(board, row, column, player) {
  return [[0, 1], [1, 0], [1, 1], [1, -1]].some(([dr, dc]) => {
    let count = 1;
    for (const direction of [-1, 1]) {
      let r = row + dr * direction, c = column + dc * direction;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        count++; r += dr * direction; c += dc * direction;
      }
    }
    return count >= 4;
  });
}
export default function ConnectFour() {
  const [game, setGame] = useState(initialGame);
  function drop(column) {
    setGame(current => {
      if (current.result || current.board[0][column]) return current;
      const board = current.board.map(row => [...row]);
      let row = 5;
      while (board[row][column]) row--;
      board[row][column] = current.player;
      const result = hasWon(board, row, column, current.player) ? current.player + ' wins!'
        : board.every(cells => cells.every(Boolean)) ? 'Draw!' : '';
      return { board, result, player: current.player === 'Red' ? 'Yellow' : 'Red' };
    });
  }
  return <section style={{ maxWidth: 490 }}>
    <h2>Connect Four</h2><p role="status">{game.result || game.player + "'s turn"}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {Array.from({ length: 7 }, (_, column) => <button key={column}
        aria-label={'Drop in column ' + (column + 1)} disabled={!!game.result || !!game.board[0][column]}
        onClick={() => drop(column)}>↓</button>)}
    </div>
    <div role="img" aria-label="Game board" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, padding: 8, background: '#2563eb' }}>
      {game.board.flatMap((row, r) => row.map((disc, c) => <span key={r + '-' + c}
        aria-label={'Row ' + (r + 1) + ', column ' + (c + 1) + ': ' + (disc || 'empty')}
        style={{ aspectRatio: '1', borderRadius: '50%', background: disc === 'Red' ? '#dc2626' : disc === 'Yellow' ? '#facc15' : 'white' }} />))}
    </div>
    <button onClick={() => setGame(initialGame())}>Restart</button>
  </section>;
}`}),a({slug:"gfe-contact-form",title:"Contact Form",difficulty:"Easy",summary:"Submit labeled contact fields using the browser’s native form mechanism.",prompt:"Create a contact form containing a name, email address, multiline message, and Send button. Let the browser send the named fields to the provided endpoint.",topics:["Forms","HTML","Accessibility"],requirements:["Provide associated labels and name attributes for all fields.",'Submit using method="post" and the supplied action URL.',"Use native form submission without a JavaScript submit handler."],assumptions:["The public exercise requests HTML submission with server-side validation. React only renders the markup; the browser owns the inputs and response navigation."],example:{actions:"Fill all three fields and press Send.",result:"The browser posts name, email, and message as form data."},steps:["Use a form with action and method attributes.","Associate unique labels using useId and add submission names.","Use a textarea for longer messages and a submit button."],pitfalls:["Fields without name attributes are absent from the request.","Preventing the submit event would disable the native submission contract."],complexity:"O(n) serialization for n characters of form data; constant component state.",testCases:[{action:"Inspect FormData after entering text.",expected:"All three named fields are present."},{action:"Submit the form.",expected:"The browser uses POST to the configured endpoint."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/contact-form/react",integrationNotes:["Native submission navigates to the response page. An embedded runner can provide a test endpoint or intercept submission outside this component."],code:String.raw`import React, { useId } from 'react';

export default function ContactForm({ endpoint = 'https://questions.greatfrontend.com/api/questions/contact-form' }) {
  const id = useId();
  return <form action={endpoint} method="post" style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
    <h2>Contact us</h2>
    <label htmlFor={id + '-name'}>Name</label>
    <input id={id + '-name'} name="name" type="text" autoComplete="name" />
    <label htmlFor={id + '-email'}>Email</label>
    <input id={id + '-email'} name="email" type="email" autoComplete="email" />
    <label htmlFor={id + '-message'}>Message</label>
    <textarea id={id + '-message'} name="message" rows={5} />
    <button type="submit">Send</button>
  </form>;
}`}),a({slug:"gfe-counter",title:"Counter",difficulty:"Easy",summary:"Increment an independent counter on each button activation.",prompt:"Render a button that displays how many times it has been activated and increases that count by one per click.",topics:["State management","Events"],requirements:["Start at zero unless an initial value is supplied.","Increment once for every activation.","Keep multiple component instances independent."],example:{actions:"Click the button three times.",result:"The displayed count changes from 0 to 3."},steps:["Initialize local state.","Use a functional updater so queued increments compose.","Render the count inside a native button."],pitfalls:["Mutating a local variable will not trigger rendering.","A module-level counter would be shared by unrelated instances."],complexity:"O(1) time and space per click.",testCases:[{action:"Click three times.",expected:"Count is 3."},{action:"Render two counters.",expected:"Updating one leaves the other unchanged."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/counter/react",code:String.raw`import React, { useState } from 'react';

export default function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);
  return <button onClick={() => setCount(value => value + 1)}
    style={{ padding: '12px 20px', borderRadius: 8, fontSize: 20 }}>
    Count: {count}
  </button>;
}`}),a({slug:"gfe-dice-roller",title:"Dice Roller",difficulty:"Medium",summary:"Roll a validated number of six-sided dice and display their pip patterns.",prompt:"Let a user choose how many dice to roll, then generate independent random values and display dice in rows of three.",topics:["Forms","Randomness","CSS Grid"],requirements:["Accept only integer counts from 1 through 12.","Roll independent values from 1 through 6 on submission.","Render pip patterns in a three-column layout and announce the results."],example:{actions:"Choose 3 dice and press Roll.",result:"Three random faces appear, each with between one and six pips."},steps:["Keep the editable count separate from the rolled results.","Validate the count before calling the random generator.","Map each face value to occupied positions in a 3 × 3 pip grid."],pitfalls:["Math.round creates biased endpoint probabilities.","Changing the input should not regenerate already rolled dice."],complexity:"O(d) time and space for d dice, with d at most 12.",testCases:[{action:"Roll using deterministic random values near 0 and 1.",expected:"Faces are 1 and 6."},{action:"Enter 0, 13, or a fractional count.",expected:"Validation rejects the roll."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/dice-roller/react",code:String.raw`import React, { useId, useState } from 'react';

const pips = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
export default function DiceRoller({ random = Math.random }) {
  const id = useId();
  const [count, setCount] = useState('3');
  const [dice, setDice] = useState([]);
  const [error, setError] = useState('');
  function roll(event) {
    event.preventDefault();
    const amount = Number(count);
    if (!Number.isInteger(amount) || amount < 1 || amount > 12) {
      setError('Enter a whole number from 1 to 12.'); return;
    }
    setError('');
    setDice(Array.from({ length: amount }, () => Math.floor(random() * 6) + 1));
  }
  return <section>
    <form onSubmit={roll} noValidate>
      <label htmlFor={id}>Number of dice</label>{' '}
      <input id={id} type="number" min="1" max="12" step="1" value={count}
        onChange={event => setCount(event.target.value)} />{' '}
      <button type="submit">Roll</button>
    </form>
    {error && <p role="alert">{error}</p>}
    <p role="status">{dice.length ? 'Rolled: ' + dice.join(', ') : 'Ready to roll.'}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 12 }}>
      {dice.map((value, index) => <div key={index} role="img" aria-label={'Die ' + (index + 1) + ': ' + value}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 8, height: 48, border: '1px solid #334155', borderRadius: 8 }}>
        {Array.from({ length: 9 }, (_, position) => <span key={position} style={{ borderRadius: '50%', background: pips[value].includes(position) ? '#0f172a' : 'transparent' }} />)}
      </div>)}
    </div>
  </section>;
}`}),a({slug:"gfe-digital-clock",title:"Digital Clock",difficulty:"Medium",summary:"Display live local time using SVG seven-segment digits.",prompt:"Build a digital clock with six seven-segment digits for hours, minutes, and seconds. Keep the display synchronized to actual time.",topics:["SVG","Timers","Effects"],requirements:["Display zero-padded 24-hour time.","Construct digits from seven individually lit segments.","Update once each second and release the timer on unmount."],assumptions:["The detailed prompt is not publicly visible. This version uses local 24-hour time with seconds and accessible text."],example:{actions:"The clock advances from 09:59:59 by one second.",result:"The display changes to 10:00:00."},steps:["Map digits to segment names.","Draw reusable SVG segments with on/off colors.","Read Date in a cleaned-up interval and provide an accessible time label."],pitfalls:["Using font glyphs alone does not implement seven-segment rendering.","Accumulating ticks drifts after browser throttling."],complexity:"O(1) time and space per tick.",testCases:[{action:"Advance across a minute boundary.",expected:"Digits carry correctly."},{action:"Unmount.",expected:"The interval is cleared."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/digital-clock/react",code:String.raw`import React, { useEffect, useState } from 'react';

const digits = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
const segments = {
  a: [10, 5, 30, 5], b: [35, 10, 35, 30], c: [35, 40, 35, 60],
  d: [10, 65, 30, 65], e: [5, 40, 5, 60], f: [5, 10, 5, 30], g: [10, 35, 30, 35],
};
function Digit({ value }) {
  return <svg viewBox="0 0 40 70" width="40" height="70" aria-hidden="true">
    {Object.entries(segments).map(([name, points]) => <line key={name}
      x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]}
      stroke={digits[Number(value)].includes(name) ? '#4ade80' : '#173126'} strokeWidth="6" strokeLinecap="round" />)}
  </svg>;
}
export default function DigitalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const value = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(number => String(number).padStart(2, '0')).join(':');
  return <time dateTime={now.toISOString()} aria-label={value}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: 20, background: '#07130d', borderRadius: 12, color: '#4ade80' }}>
    {[...value].map((character, index) => character === ':'
      ? <span key={index} aria-hidden="true" style={{ fontSize: 44 }}>:</span>
      : <Digit key={index} value={character} />)}
  </time>;
}`}),a({slug:"gfe-flight-booker",title:"Flight Booker",difficulty:"Easy",summary:"Validate one-way and return flight dates before confirming a booking.",prompt:"Build a form for choosing a one-way or return flight. Enable booking only when the required dates form a valid itinerary.",topics:["Forms","Validation","Derived state"],requirements:["Use controlled trip-type and date fields.","Disable the return date for one-way flights.","Reject missing dates and return dates earlier than departure; show a confirmation for valid submissions."],assumptions:["The premium contract is unavailable. This version permits historical departure dates, defaults to today, and confirms locally without a booking API."],example:{actions:"Choose return flight with departure 2027-06-10 and return 2027-06-09.",result:"Booking stays disabled and the return-date error is shown."},steps:["Store ISO date strings to allow chronological string comparison.","Derive validity from trip type and dates.","Snapshot the chosen itinerary into a confirmation after submission."],pitfalls:["A disabled return field must not invalidate a one-way itinerary.","UTC ISO conversion can choose the wrong local calendar day."],complexity:"O(1) time and space.",testCases:[{action:"Choose a return date before departure.",expected:"Booking is disabled."},{action:"Switch to one-way.",expected:"Return is disabled and a valid departure can be booked."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/flight-booker/react",code:String.raw`import React, { useId, useState } from 'react';

function localToday() {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
export default function FlightBooker() {
  const id = useId();
  const [trip, setTrip] = useState('one-way');
  const [departure, setDeparture] = useState(localToday);
  const [returnDate, setReturnDate] = useState(localToday);
  const [confirmation, setConfirmation] = useState('');
  const returning = trip === 'return';
  const error = !departure ? 'Choose a departure date.' : returning && !returnDate
    ? 'Choose a return date.' : returning && returnDate < departure ? 'Return must be on or after departure.' : '';
  function edit(setter, value) { setter(value); setConfirmation(''); }
  function book(event) {
    event.preventDefault();
    if (!error) setConfirmation('Booked ' + (returning ? 'return' : 'one-way') + ' flight departing ' + departure + (returning ? ', returning ' + returnDate : '') + '.');
  }
  return <form onSubmit={book} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
    <label htmlFor={id + '-trip'}>Trip type</label>
    <select id={id + '-trip'} value={trip} onChange={event => edit(setTrip, event.target.value)}>
      <option value="one-way">One-way flight</option><option value="return">Return flight</option>
    </select>
    <label htmlFor={id + '-departure'}>Departure date</label>
    <input id={id + '-departure'} type="date" value={departure} required onChange={event => edit(setDeparture, event.target.value)} />
    <label htmlFor={id + '-return'}>Return date</label>
    <input id={id + '-return'} type="date" value={returnDate} disabled={!returning} required={returning}
      aria-invalid={returning && !!error} onChange={event => edit(setReturnDate, event.target.value)} />
    {error && <p role="alert">{error}</p>}
    <button disabled={!!error}>Book</button>
    {confirmation && <p role="status">{confirmation}</p>}
  </form>;
}`}),a({slug:"gfe-generate-table",title:"Generate Table",difficulty:"Easy",summary:"Generate a numbered table with alternating downward and upward columns.",prompt:"Accept row and column counts and generate a table filled with consecutive numbers in a column-wise snake pattern.",topics:["Forms","Grid","Arithmetic"],requirements:["Accept positive integer dimensions no larger than 50.","Fill the first column top-to-bottom, the next bottom-to-top, and alternate.","Regenerate only on form submission and retain the previous table when input is invalid."],assumptions:["The premium prompt is unavailable. This practice contract chooses alternating column order and a 50 × 50 rendering limit."],example:{actions:"Generate 3 rows and 2 columns.",result:"Rows read [1, 6], [2, 5], [3, 4]."},steps:["Validate editable dimensions before committing them.","For each cell calculate its offset from the start of its column.","Render semantic table rows and cells using the committed dimensions."],pitfalls:["Using edited dimensions directly changes the table before submission.","Fractional or unbounded dimensions can create invalid arrays or excessive DOM nodes."],complexity:"O(r × c) rendering time and DOM space.",testCases:[{action:"Generate 3 × 2.",expected:"The second column reverses direction."},{action:"Submit zero or fractional dimensions.",expected:"An error appears and the previous table is preserved."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/generate-table/react",code:String.raw`import React, { useId, useState } from 'react';

export default function GenerateTable() {
  const id = useId();
  const [rows, setRows] = useState('3');
  const [columns, setColumns] = useState('3');
  const [size, setSize] = useState(null);
  const [error, setError] = useState('');
  function generate(event) {
    event.preventDefault();
    const dimensions = [Number(rows), Number(columns)];
    if (dimensions.some(value => !Number.isInteger(value) || value < 1 || value > 50)) {
      setError('Use whole numbers from 1 to 50.'); return;
    }
    setError(''); setSize(dimensions);
  }
  return <section>
    <form onSubmit={generate} noValidate style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <label htmlFor={id + '-rows'}>Rows</label>
      <input id={id + '-rows'} type="number" min="1" max="50" value={rows} onChange={event => setRows(event.target.value)} />
      <label htmlFor={id + '-columns'}>Columns</label>
      <input id={id + '-columns'} type="number" min="1" max="50" value={columns} onChange={event => setColumns(event.target.value)} />
      <button>Generate</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {size && <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', marginTop: 16 }}>
      <caption>{size[0]} rows by {size[1]} columns</caption><tbody>
        {Array.from({ length: size[0] }, (_, row) => <tr key={row}>
          {Array.from({ length: size[1] }, (_, column) => <td key={column} style={{ border: '1px solid #64748b', padding: 12, textAlign: 'center' }}>
            {column * size[0] + (column % 2 ? size[0] - row : row + 1)}
          </td>)}
        </tr>)}
      </tbody>
    </table></div>}
  </section>;
}`}),a({slug:"gfe-grid-lights",title:"Grid Lights",difficulty:"Medium",summary:"Activate cells and then switch them off in reverse activation order.",prompt:"Create eight clickable lights around an empty center. Once every light is on, deactivate them one at a time in the reverse order of the user’s clicks.",topics:["Timers","State management","Grid"],requirements:["Only inactive lights accept activation.","When all eight are on, lock interaction and remove one every 300 ms in reverse order.","Unlock when all lights are off and clean up scheduled work."],assumptions:["The premium prompt is unavailable. This version uses a 3 × 3 board with a center hole and a configurable delay defaulting to 300 ms."],example:{actions:"Activate every light, ending with the top-left corner.",result:"Top-left turns off first; the first light selected turns off last."},steps:["Keep the activation order as a stack.","Enter a draining phase once the stack reaches eight.","Schedule one pop per effect run so cleanup cancels obsolete timers."],pitfalls:["A Set alone does not make reverse-order removal explicit.","Letting users click during the drain changes the intended sequence."],complexity:"O(n) update/rendering time and O(n) space for n lights; n is 8 here.",testCases:[{action:"Activate all lights in a known order.",expected:"Each delay removes the latest remaining light."},{action:"Unmount during draining.",expected:"No pending timeout remains."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/grid-lights/react",code:String.raw`import React, { useEffect, useState } from 'react';

const positions = [0, 1, 2, 3, 5, 6, 7, 8];
export default function GridLights({ delay = 300 }) {
  const [state, setState] = useState({ order: [], draining: false });
  useEffect(() => {
    if (!state.draining) return;
    const timer = setTimeout(() => setState(current => {
      const order = current.order.slice(0, -1);
      return { order, draining: order.length > 0 };
    }), delay);
    return () => clearTimeout(timer);
  }, [state, delay]);
  function activate(position) {
    setState(current => {
      if (current.draining || current.order.includes(position)) return current;
      const order = [...current.order, position];
      return { order, draining: order.length === positions.length };
    });
  }
  return <section>
    <p role="status">{state.draining ? 'Turning lights off…' : 'Activate every light.'}</p>
    <div aria-label="Light grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 70px)', gap: 10 }}>
      {Array.from({ length: 9 }, (_, position) => position === 4 ? <span key={position} />
        : <button key={position} aria-label={'Light ' + (position + 1)} aria-pressed={state.order.includes(position)}
          disabled={state.draining || state.order.includes(position)} onClick={() => activate(position)}
          style={{ height: 70, border: '2px solid #334155', borderRadius: 6, background: state.order.includes(position) ? '#22c55e' : '#f8fafc' }} />)}
    </div>
    <button onClick={() => setState({ order: [], draining: false })} style={{ marginTop: 12 }}>Reset</button>
  </section>;
}`}),a({slug:"gfe-holy-grail",title:"Holy Grail",difficulty:"Easy",summary:"Lay out a full-height page with fixed sidebars and a flexible center.",prompt:"Create the classic header, three-column body, and footer layout using CSS. Keep the footer at the viewport bottom on short pages and below long content.",topics:["CSS Grid","Layout","Semantic HTML"],requirements:["Use a 60 px full-width header and 100 px full-width footer.","Use 100 px side columns and a center that consumes the remaining width.","Stretch all body columns equally and allow page content to grow naturally."],example:{actions:"Render a short article, then replace it with a long article.",result:"The footer initially stays at the viewport bottom, then moves below the expanded content."},steps:["Define outer grid rows as 60 px, a flexible middle, and 100 px.","Define the body columns as 100 px, minmax(0, 1fr), and 100 px.","Use semantic landmarks and break long words in the fluid column."],pitfalls:["A fixed-position footer can cover content.","A center column without min-width control can overflow when text is long."],complexity:"O(n) browser layout for n content nodes; no component state.",testCases:[{action:"Render the layout.",expected:"Header, navigation, main, aside, and footer landmarks exist."},{action:"Provide longer content.",expected:"The grid grows and the footer remains in document flow."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/holy-grail/react",code:String.raw`import React from 'react';

export default function HolyGrail({ children }) {
  const panel = { padding: 12, boxSizing: 'border-box' };
  return <div style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: '60px 1fr 100px', fontFamily: 'system-ui' }}>
    <header style={{ ...panel, background: '#cbd5e1' }}>Header</header>
    <div style={{ display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr) 100px' }}>
      <nav aria-label="Main navigation" style={{ ...panel, background: '#e2e8f0' }}>Navigation</nav>
      <main style={{ ...panel, overflowWrap: 'anywhere', minWidth: 0 }}>
        {children || <><h1>Welcome</h1><p>The center column grows with available space.</p></>}
      </main>
      <aside style={{ ...panel, background: '#e2e8f0' }}>Related content</aside>
    </div>
    <footer style={{ ...panel, background: '#cbd5e1' }}>Footer</footer>
  </div>;
}`}),a({slug:"gfe-job-board",title:"Job Board",difficulty:"Medium",summary:"Load Hacker News job IDs, fetch posting details, and reveal additional pages.",prompt:"Build a job board backed by the Hacker News API. Load a small batch of recent jobs, show their title, author, and date, and allow the user to load the next batch.",topics:["Networking","Pagination","Effects"],requirements:["Fetch jobstories.json, then fetch item details in parallel while preserving ID order.","Show loading, retryable errors, empty results, and a Load more action.","Use an HN discussion fallback for jobs without an external URL and cancel stale requests."],assumptions:["The premium prompt is unavailable. This practice contract uses batches of six, skips missing/deleted records, and retries a failed batch without duplicating previous pages."],example:{actions:"Open the board, then choose Load more.",result:"The first six postings appear, followed by the next six in API order."},steps:["Load and validate the ID list separately from detail pages.","Fetch each requested page with Promise.all and commit only when its effect is active.","Append successful pages, preserve previous pages on error, and reuse the failed page index on retry."],pitfalls:["Settling requests individually can reorder posts.","Advancing the page before a failed request is retried can skip jobs.","Endpoint changes must clear previous IDs and postings."],complexity:"O(p) requests per batch and O(n) space for n loaded postings; p defaults to 6.",testCases:[{action:"Load two pages.",expected:"Ordered jobs append without duplicates."},{action:"A detail request fails, then retry succeeds.",expected:"Earlier jobs remain and the failed page is retried."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/job-board/react",integrationNotes:["Default API: https://hacker-news.firebaseio.com/v0. Props apiBase and fetcher allow deterministic tests or a proxy."],code:String.raw`import React, { useEffect, useState } from 'react';

export default function JobBoard({ apiBase = 'https://hacker-news.firebaseio.com/v0', pageSize = 6, fetcher = fetch }) {
  const size = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 6;
  const [list, setList] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [listRetry, setListRetry] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setList(null); setJobs([]); setPage(0); setError(''); setStatus('loading');
    (async () => {
      try {
        const response = await fetcher(apiBase + '/jobstories.json', { signal: controller.signal });
        if (!response.ok) throw new Error('Could not load job IDs.');
        const ids = await response.json();
        if (!Array.isArray(ids) || !ids.every(id => Number.isInteger(id) && id > 0)) throw new Error('Invalid job ID response.');
        if (active) setList({ base: apiBase, size, ids });
      } catch (failure) {
        if (active) { setError(failure.message); setStatus('list-error'); }
      }
    })();
    return () => { active = false; controller.abort(); };
  }, [apiBase, fetcher, size, listRetry]);
  useEffect(() => {
    if (!list || list.base !== apiBase || list.size !== size) return;
    let active = true;
    const controller = new AbortController();
    setStatus('loading'); setError('');
    (async () => {
      try {
        const selected = list.ids.slice(page * size, (page + 1) * size);
        const items = await Promise.all(selected.map(async id => {
          const response = await fetcher(apiBase + '/item/' + id + '.json', { signal: controller.signal });
          if (!response.ok) throw new Error('Could not load this batch of jobs.');
          return response.json();
        }));
        if (active) {
          const visible = items.filter(item => item && !item.deleted && !item.dead);
          setJobs(previous => page === 0 ? visible : [...previous, ...visible]);
          setStatus('ready');
        }
      } catch (failure) {
        if (active) { setError(failure.message); setStatus('page-error'); }
      }
    })();
    return () => { active = false; controller.abort(); };
  }, [list, apiBase, size, fetcher, page, retry]);
  function safeLink(job) {
    try { const url = new URL(job.url); if (['https:', 'http:'].includes(url.protocol)) return url.href; } catch {}
    return 'https://news.ycombinator.com/item?id=' + job.id;
  }
  const more = list && (page + 1) * size < list.ids.length;
  return <section style={{ maxWidth: 680, fontFamily: 'system-ui' }}>
    <h1>Hacker News Jobs</h1>
    <ul style={{ listStyle: 'none', padding: 0 }}>{jobs.map(job => <li key={job.id}
      style={{ padding: 16, border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 12 }}>
      <a href={safeLink(job)} target="_blank" rel="noreferrer">{job.title || 'Untitled job'}</a>
      <p>By {job.by || 'unknown'} · {Number.isFinite(job.time) ? new Date(job.time * 1000).toLocaleDateString() : 'Date unavailable'}</p>
    </li>)}</ul>
    {status === 'loading' && <p role="status">Loading jobs…</p>}
    {error && <><p role="alert">{error}</p><button onClick={() => status === 'list-error'
      ? setListRetry(value => value + 1) : setRetry(value => value + 1)}>Retry</button></>}
    {status === 'ready' && !jobs.length && <p>No jobs available.</p>}
    {more && <button disabled={status !== 'ready'} onClick={() => { setStatus('loading'); setPage(value => value + 1); }}>Load more</button>}
  </section>;
}`}),a({slug:"gfe-like-button",title:"Like Button",difficulty:"Medium",summary:"Toggle a server-backed like state with loading and recoverable failure.",prompt:"Create a Like button that requests a like or unlike action and changes its pressed state only after a successful response.",topics:["Networking","State management","Accessibility"],requirements:["POST JSON containing action: like or unlike to the supplied endpoint.","Disable repeated actions while pending and display loading feedback.","Keep the visible label Like, expose aria-pressed, and show server error messages without changing committed state."],example:{actions:"Like succeeds, then unlike fails.",result:"The button remains pressed and displays the failure message."},steps:["Derive the requested action from committed state.","Guard concurrent requests with a ref and keep a controller for cleanup.","Commit the new state on success; preserve the old state on failure."],pitfalls:["An optimistic toggle without rollback leaves the UI wrong on failure.","A button without aria-pressed hides its toggle state from assistive technology."],complexity:"O(1) client time and space per request, excluding network latency.",testCases:[{action:"Resolve a like request successfully.",expected:"aria-pressed becomes true and the label remains Like."},{action:"Reject an unlike request.",expected:"The liked state remains and an error is shown."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/like-button/react",code:String.raw`import React, { useEffect, useRef, useState } from 'react';

export default function LikeButton({ endpoint = 'https://questions.greatfrontend.com/api/questions/like-button', fetcher = fetch }) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(null);
  useEffect(() => {
    setLoading(false); setError(''); setLiked(false);
    return () => { request.current?.abort(); request.current = null; };
  }, [endpoint, fetcher]);
  async function toggle() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError('');
    try {
      const response = await fetcher(endpoint, { method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: liked ? 'unlike' : 'like' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'The request failed.');
      if (request.current === controller) setLiked(value => !value);
    } catch (failure) {
      if (request.current === controller) setError(failure.message);
    } finally {
      if (request.current === controller) { request.current = null; setLoading(false); }
    }
  }
  return <div>
    <style>{'.gfe-like:hover:not(:disabled){border-color:#f00!important;color:#f00}.gfe-like:focus-visible{outline:3px solid #2563eb;outline-offset:3px}'}</style>
    <button className="gfe-like" onClick={toggle} aria-pressed={liked} aria-busy={loading} disabled={loading}
      style={{ display: 'inline-flex', gap: 8, padding: '8px 18px', border: '2px solid ' + (liked ? '#f00' : '#888'), borderRadius: 24, background: liked ? '#fff1f2' : 'white', color: liked ? '#f00' : '#555', fontWeight: 700 }}>
      <span aria-hidden="true">{loading ? '◌' : liked ? '♥' : '♡'}</span>Like
    </button>
    {loading && <span role="status" style={{ marginLeft: 8 }}>Saving…</span>}
    {error && <p role="alert">{error}</p>}
  </div>;
}`}),a({slug:"gfe-memory-game",title:"Memory Game",difficulty:"Medium",summary:"Match shuffled pairs while preventing overlapping turns and stale resets.",prompt:"Build a card matching game. Reveal two cards per turn, keep matching cards visible, hide mismatches after a short delay, and offer a fresh shuffled game.",topics:["Games","Timers","State management"],requirements:["Shuffle two copies of each symbol using Fisher–Yates.","Ignore revealed and matched cards and lock the board while a mismatched pair is visible.","Count attempts, announce completion, and cancel mismatch timers on reset or unmount."],assumptions:["The premium prompt is unavailable. This version uses six pairs, one-second mismatch exposure, and an injectable random function for testing."],example:{actions:"Reveal a mismatched pair, wait one second, then reveal a matching pair.",result:"The mismatch hides; the match remains visible; attempts total 2."},steps:["Give each card a distinct index after shuffling duplicated symbols.","Keep open indexes, matched indexes, and attempt count in one state object.","Resolve matches immediately and schedule a cleaned-up timeout for mismatches."],pitfalls:["Sorting with a random comparator does not create an unbiased shuffle.","A timeout from an old game must not hide cards in a restarted game."],complexity:"O(n) initialization and rendering time; O(n) space for n cards.",testCases:[{action:"Reveal two unequal cards, then try a third.",expected:"The third is ignored until the pair hides."},{action:"Restart while a mismatch is visible.",expected:"The old timer is cancelled and a fresh board starts."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/memory-game/react",code:String.raw`import React, { useEffect, useState } from 'react';

const SYMBOLS = ['🍎', '🍋', '🍇', '🍒', '🥝', '🍊'];
function makeGame(random) {
  const cards = [...SYMBOLS, ...SYMBOLS];
  for (let index = cards.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [cards[index], cards[other]] = [cards[other], cards[index]];
  }
  return { cards, open: [], matched: [], attempts: 0 };
}
export default function MemoryGame({ random = Math.random, delay = 1000 }) {
  const [game, setGame] = useState(() => makeGame(random));
  const locked = game.open.length === 2;
  useEffect(() => {
    if (!locked) return;
    const timer = setTimeout(() => setGame(current => ({ ...current, open: [] })), delay);
    return () => clearTimeout(timer);
  }, [game, locked, delay]);
  function reveal(index) {
    setGame(current => {
      if (current.open.length === 2 || current.open.includes(index) || current.matched.includes(index)) return current;
      const open = [...current.open, index];
      if (open.length < 2) return { ...current, open };
      const match = current.cards[open[0]] === current.cards[open[1]];
      return { ...current, open: match ? [] : open,
        matched: match ? [...current.matched, ...open] : current.matched, attempts: current.attempts + 1 };
    });
  }
  return <section>
    <p role="status">{game.matched.length === game.cards.length ? 'All pairs matched! ' : ''}Attempts: {game.attempts}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: 8 }}>
      {game.cards.map((symbol, index) => {
        const visible = game.open.includes(index) || game.matched.includes(index);
        return <button key={index} onClick={() => reveal(index)} disabled={locked || visible}
          aria-label={'Card ' + (index + 1) + (visible ? ': ' + symbol : ': hidden')}
          style={{ height: 72, fontSize: 28, borderRadius: 8, background: visible ? '#fef3c7' : '#dbeafe', border: '1px solid #64748b' }}>
          {visible ? symbol : '?'}
        </button>;
      })}
    </div>
    <button onClick={() => setGame(makeGame(random))} style={{ marginTop: 12 }}>New game</button>
  </section>;
}`}),a({slug:"gfe-mortgage-calculator",title:"Mortgage Calculator",difficulty:"Easy",summary:"Calculate amortized monthly payments, total repayment, and interest.",prompt:"Build a calculator that accepts principal, annual percentage interest, and a term in years. Validate the inputs and show the resulting monthly payment, total paid, and interest to two decimal places.",topics:["Forms","Arithmetic","Validation"],requirements:["Require a finite positive principal and positive whole-year term; allow nonnegative APR.","Use the amortization formula, including a separate zero-interest case.","Keep full precision during calculation and round only the displayed amounts."],assumptions:["This educational calculation covers principal and interest only. It assumes a fixed rate, monthly payments, whole-year terms, and no fees or taxes."],example:{actions:"Enter $120,000, 0% APR, and 10 years.",result:"Monthly payment is $1,000.00, total is $120,000.00, and interest is $0.00."},steps:["Parse and validate the form values.","Convert annual percentage to monthly decimal rate and years to payment count.","Compute payment and totals, guarding against nonfinite results."],pitfalls:["Dividing by the zero-rate denominator produces NaN.","Rounding the payment before calculating totals accumulates rounding errors."],complexity:"O(1) arithmetic time and space.",testCases:[{action:"Calculate a zero-interest mortgage.",expected:"Principal divides evenly across the payment count."},{action:"Enter a negative or nonnumeric input.",expected:"A validation message replaces the previous result."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/mortgage-calculator/react",code:String.raw`import React, { useId, useState } from 'react';

export function calculateMortgage(principal, annualRate, years) {
  if (![principal, annualRate, years].every(Number.isFinite) || principal <= 0 || annualRate < 0 || !Number.isInteger(years) || years <= 0) {
    throw new Error('Enter a positive loan amount, nonnegative rate, and positive whole-year term.');
  }
  const months = years * 12;
  const rate = annualRate / 1200;
  // The negative exponent avoids overflowing (1 + rate) ** months.
  const denominator = -Math.expm1(-months * Math.log1p(rate));
  const monthly = rate === 0 ? principal / months : principal * rate / denominator;
  const total = monthly * months;
  if (![monthly, total].every(Number.isFinite)) throw new Error('These values are too large to calculate.');
  return { monthly, total, interest: Math.max(0, total - principal) };
}
export default function MortgageCalculator() {
  const id = useId();
  const [fields, setFields] = useState({ principal: '300000', annualRate: '6', years: '30' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputs = [['principal', 'Loan amount ($)'], ['annualRate', 'Annual interest rate (%)'], ['years', 'Loan term (years)']];
  function calculate(event) {
    event.preventDefault(); setError(''); setResult(null);
    try {
      if (Object.values(fields).some(value => !value.trim())) throw new Error('Complete every field.');
      setResult(calculateMortgage(Number(fields.principal), Number(fields.annualRate), Number(fields.years)));
    } catch (failure) { setError(failure.message); }
  }
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  return <section style={{ maxWidth: 420 }}>
    <form onSubmit={calculate} noValidate style={{ display: 'grid', gap: 8 }}>
      {inputs.map(([name, label]) => <React.Fragment key={name}>
        <label htmlFor={id + name}>{label}</label>
        <input id={id + name} inputMode="decimal" value={fields[name]}
          onChange={event => { setFields(current => ({ ...current, [name]: event.target.value })); setResult(null); setError(''); }} />
      </React.Fragment>)}
      <button>Calculate</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {result && <dl aria-live="polite">
      <dt>Monthly payment</dt><dd>{money(result.monthly)}</dd>
      <dt>Total payment</dt><dd>{money(result.total)}</dd>
      <dt>Total interest</dt><dd>{money(result.interest)}</dd>
    </dl>}
  </section>;
}`}),a({slug:"gfe-progress-bar",title:"Progress Bar",difficulty:"Easy",summary:"Render a bounded percentage with a semantic progress indicator.",prompt:"Build a reusable progress bar and a small control for trying different completion percentages.",topics:["Accessibility","CSS","Derived state"],requirements:["Clamp finite input values to the range 0–100.","Expose progressbar semantics, bounds, and current value.","Keep the visible fill and percentage label consistent."],assumptions:["The premium prompt is unavailable. Nonfinite values become zero; the bar is determinate and updates immediately."],example:{actions:"Set the value to 125.",result:"The bar fills completely and announces 100%."},steps:["Normalize the incoming numeric value.","Use the same normalized value for width, text, and ARIA.","Render a controlled input in a separate default demonstration component."],pitfalls:["Clamping the fill but not aria-valuenow creates contradictory information.","Using a native progress element and an extra progressbar role together duplicates semantics."],complexity:"O(1) time and space.",testCases:[{action:"Pass -10, 125, and NaN.",expected:"Values normalize to 0, 100, and 0."},{action:"Edit the demo input.",expected:"The visual width and accessible value update together."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/progress-bar/react",code:String.raw`import React, { useId, useState } from 'react';

export function ProgressBar({ value = 0, label = 'Completion' }) {
  const percent = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
    style={{ position: 'relative', height: 32, borderRadius: 16, overflow: 'hidden', background: '#e2e8f0', border: '1px solid #64748b' }}>
    <div style={{ height: '100%', width: percent + '%', background: '#86efac' }} />
    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#052e16', fontWeight: 700 }}>{Math.round(percent)}%</span>
  </div>;
}
export default function ProgressBarDemo() {
  const id = useId();
  const [value, setValue] = useState('35');
  return <section style={{ maxWidth: 440, display: 'grid', gap: 12 }}>
    <label htmlFor={id}>Progress percentage</label>
    <input id={id} type="number" value={value} onChange={event => setValue(event.target.value)} />
    <ProgressBar value={Number(value)} />
  </section>;
}`}),a({slug:"gfe-signup-form",title:"Signup Form",difficulty:"Medium",summary:"Validate controlled signup fields and submit them with pending and error states.",prompt:"Build an account registration form with name, email, password, and password confirmation. Show field errors, submit only valid data, and handle server success or failure.",topics:["Forms","Validation","Networking"],requirements:["Require a name, a plausible email, an eight-character password, and matching confirmation.","POST name, email, and password as JSON and disable the form while pending.","Show server feedback, preserve values after failure, and cancel obsolete submissions."],assumptions:["The premium field and API contract is unavailable. This practice version defines its own fields and validates an eight-character minimum.","The default /api/signup endpoint must be supplied by the host; override endpoint or fetcher to connect your backend. Success accepts any 2xx response, optionally with a JSON message."],example:{actions:"Enter different password and confirmation values and submit.",result:"A confirmation error appears and no request is sent."},steps:["Keep all editable fields in controlled state and derive validation on submit.","Associate field errors with inputs and focus the first invalid field.","Send one abortable request, show its result, and clear password fields after success."],pitfalls:["Sending the confirmation password is unnecessary.","Client-side validation does not replace server-side validation.","A late response after endpoint change must not overwrite the current form status."],complexity:"O(n) validation and serialization for n input characters; O(n) form state.",testCases:[{action:"Submit invalid fields.",expected:"Errors appear without a request."},{action:"Submit valid data and receive success.",expected:"JSON excludes confirmation and password inputs clear."},{action:"Reject a request.",expected:"The form unlocks and retains user input."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/signup-form/react",code:String.raw`import React, { useEffect, useId, useRef, useState } from 'react';

export default function SignupForm({ endpoint = '/api/signup', fetcher = fetch }) {
  const id = useId();
  const [fields, setFields] = useState({ name: '', email: '', password: '', confirmation: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const request = useRef(null);
  const inputs = useRef({});
  useEffect(() => {
    setStatus('idle'); setMessage('');
    return () => { request.current?.abort(); request.current = null; };
  }, [endpoint, fetcher]);
  function edit(name, value) {
    setFields(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setStatus('idle'); setMessage('');
  }
  async function submit(event) {
    event.preventDefault();
    if (request.current) return;
    const next = {};
    if (!fields.name.trim()) next.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = 'Enter a valid email address.';
    if (fields.password.length < 8) next.password = 'Use at least eight characters.';
    if (fields.confirmation !== fields.password || !fields.confirmation) next.confirmation = 'Passwords must match.';
    setErrors(next); setMessage('');
    if (Object.keys(next).length) { inputs.current[Object.keys(next)[0]]?.focus(); return; }
    const controller = new AbortController();
    request.current = controller; setStatus('pending');
    try {
      const response = await fetcher(endpoint, { method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fields.name.trim(), email: fields.email.trim(), password: fields.password }) });
      const data = await response.json().catch(() => null);
      const serverMessage = typeof data?.message === 'string' ? data.message : '';
      if (!response.ok) throw new Error(serverMessage || 'Signup failed. Please retry.');
      if (request.current === controller) {
        setStatus('success'); setMessage(serverMessage || 'Account created.');
        setFields(current => ({ ...current, password: '', confirmation: '' }));
      }
    } catch (failure) {
      if (request.current === controller) { setStatus('error'); setMessage(failure.message); }
    } finally {
      if (request.current === controller) request.current = null;
    }
  }
  const definitions = [['name', 'Name', 'text', 'name'], ['email', 'Email', 'email', 'email'],
    ['password', 'Password', 'password', 'new-password'], ['confirmation', 'Confirm password', 'password', 'new-password']];
  return <form onSubmit={submit} noValidate style={{ maxWidth: 420 }}>
    <fieldset disabled={status === 'pending'} style={{ display: 'grid', gap: 8, border: 0, padding: 0 }}>
      <legend>Create an account</legend>
      {definitions.map(([name, label, type, autoComplete]) => <React.Fragment key={name}>
        <label htmlFor={id + name}>{label}</label>
        <input id={id + name} name={name} type={type} autoComplete={autoComplete} value={fields[name]}
          ref={node => { inputs.current[name] = node; }} aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? id + name + '-error' : undefined}
          onChange={event => edit(name, event.target.value)} />
        {errors[name] && <span id={id + name + '-error'} role="alert">{errors[name]}</span>}
      </React.Fragment>)}
      <button type="submit">{status === 'pending' ? 'Creating account…' : 'Sign up'}</button>
    </fieldset>
    {message && <p role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
  </form>;
}`}),a({slug:"gfe-star-rating",title:"Star Rating",difficulty:"Medium",summary:"Select a rating with hover previews and native radio keyboard support.",prompt:"Create a reusable star rating widget with a configurable maximum, current rating, and change callback. Hover should temporarily preview a rating without changing the committed selection.",topics:["Accessibility","Controlled components","Events"],requirements:["Fill every star through the selected or hovered value.","Restore the selected state when the pointer leaves.","Support controlled and uncontrolled use, independent instances, and keyboard selection."],example:{actions:"Select 2 stars, hover over star 4, then move away.",result:"The preview shows 4, then returns to the committed value of 2."},steps:["Separate committed value from hover preview.","Render visually styled native radio inputs with unique names.","Call onChange on selection and update internal state only when uncontrolled."],pitfalls:["Saving hover into the selected value makes a preview permanent.","Sharing a radio name across instances couples their selections."],complexity:"O(m) rendering time and DOM space for m stars.",testCases:[{action:"Hover and leave after selecting.",expected:"The committed rating is restored."},{action:"Use a controlled value and change callback.",expected:"Selection reports the new value and follows the parent prop."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/star-rating/react",code:String.raw`import React, { useId, useState } from 'react';

export default function StarRating({ max = 5, value, defaultValue = 0, onChange, label = 'Rating' }) {
  const id = useId();
  const count = Number.isInteger(max) && max > 0 ? max : 5;
  const [internal, setInternal] = useState(defaultValue);
  const [hover, setHover] = useState(null);
  const selected = Math.max(0, Math.min(count, value === undefined ? internal : value));
  const shown = hover === null ? selected : hover;
  function choose(next) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }
  return <fieldset onMouseLeave={() => setHover(null)} style={{ border: 0, padding: 0 }}>
    <legend>{label}</legend>
    <style>{'.gfe-star-input{position:absolute;opacity:0;width:1px;height:1px}.gfe-star-input:focus-visible+span{outline:2px solid #2563eb;outline-offset:3px}'}</style>
    <div style={{ display: 'inline-flex', gap: 5 }}>
      {Array.from({ length: count }, (_, index) => {
        const rating = index + 1;
        return <label key={rating} onMouseEnter={() => setHover(rating)} style={{ position: 'relative', cursor: 'pointer', fontSize: 36 }}>
          <input className="gfe-star-input" type="radio" name={id} value={rating}
            aria-label={rating + (rating === 1 ? ' star' : ' stars')} checked={selected === rating}
            onChange={() => choose(rating)} />
          <span aria-hidden="true" data-filled={rating <= shown} style={{ color: rating <= shown ? '#b45309' : '#64748b' }}>{rating <= shown ? '★' : '☆'}</span>
        </label>;
      })}
    </div>
  </fieldset>;
}`}),a({slug:"gfe-stopwatch",title:"Stopwatch",difficulty:"Medium",summary:"Measure elapsed time accurately across starts, pauses, resumes, and resets.",prompt:"Build a stopwatch with a clickable elapsed-time display, a Start/Stop button, and a Reset button. Show hours, minutes, seconds, and hundredths.",topics:["Timers","Refs","Effects"],requirements:["Both the display and Start/Stop control toggle running state.","Preserve elapsed time when paused and continue from it on resume.","Reset to zero and stop; derive elapsed time from a monotonic clock and release the interval."],example:{actions:"Run for 2 seconds, pause for 5 seconds, and run for 1 more second.",result:"The stopwatch reads 00:00:03.00."},steps:["Store accumulated duration and the current run’s start timestamp in refs.","Use performance.now to calculate elapsed duration on each repaint tick.","Format hundredths with division and modulo, and synchronize pause/reset with the refs."],pitfalls:["Adding a fixed interval duration undercounts when the browser throttles callbacks.","Failing to stop the interval on reset can immediately restart the displayed time."],complexity:"O(1) time and space per tick.",testCases:[{action:"Start, pause, resume, then reset.",expected:"Only running intervals contribute and reset stops at zero."},{action:"Advance past 60 seconds.",expected:"Seconds carry into minutes."},{action:"Unmount while running.",expected:"The interval is cleared."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/stopwatch/react",code:String.raw`import React, { useEffect, useRef, useState } from 'react';

export function formatElapsed(milliseconds) {
  const hundredths = Math.floor(milliseconds / 10);
  const parts = [Math.floor(hundredths / 360000), Math.floor(hundredths / 6000) % 60, Math.floor(hundredths / 100) % 60];
  return parts.map(value => String(value).padStart(2, '0')).join(':') + '.' + String(hundredths % 100).padStart(2, '0');
}
export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const accumulated = useRef(0);
  const started = useRef(null);
  useEffect(() => {
    if (!running) return;
    const tick = () => setElapsed(accumulated.current + performance.now() - started.current);
    const timer = setInterval(tick, 10);
    return () => clearInterval(timer);
  }, [running]);
  function toggle() {
    if (started.current !== null) {
      accumulated.current += performance.now() - started.current;
      started.current = null;
      setElapsed(accumulated.current); setRunning(false);
    } else {
      started.current = performance.now(); setRunning(true);
    }
  }
  function reset() {
    started.current = null; accumulated.current = 0;
    setRunning(false); setElapsed(0);
  }
  return <section aria-label="Stopwatch" style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
    <button onClick={toggle} aria-label={'Elapsed ' + formatElapsed(elapsed)}
      style={{ fontSize: 32, fontVariantNumeric: 'tabular-nums', padding: 16 }}>{formatElapsed(elapsed)}</button>
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={toggle}>{running ? 'Stop' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
    </div>
  </section>;
}`}),a({slug:"gfe-temperature-converter",title:"Temperature Converter",difficulty:"Easy",summary:"Keep Celsius and Fahrenheit synchronized while preserving editable input.",prompt:"Provide Celsius and Fahrenheit fields that convert in either direction as the user types. Clearing the edited field should clear the converted field.",topics:["Forms","Derived state","Arithmetic"],requirements:["Treat the last edited field as the source of truth.","Convert with C × 9/5 + 32 and (F − 32) × 5/9.","Preserve raw source text, handle empty and incomplete input, and round only derived output."],assumptions:["The premium prompt is unavailable. This version allows negative values, rounds derived results to four decimals, and shows a blank counterpart for nonnumeric input."],example:{actions:"Enter 100 Celsius, then replace Fahrenheit with 32.",result:"The first edit shows 212 Fahrenheit; the second shows 0 Celsius."},steps:["Store the edited scale and raw string together.","Compute the opposite value during render instead of syncing two effects.","Render two controlled inputs that change the source scale when edited."],pitfalls:["Mutual synchronization effects can create loops and rounding drift.",'Number("") is zero, so blank input needs an explicit check.'],complexity:"O(1) arithmetic time and state space.",testCases:[{action:"Enter 100 Celsius and then 32 Fahrenheit.",expected:"Conversions are 212 Fahrenheit and 0 Celsius."},{action:"Clear the source or type a minus sign.",expected:"The counterpart clears while the source text remains editable."}],sourceUrl:"https://www.greatfrontend.com/questions/user-interface/temperature-converter/react",code:String.raw`import React, { useId, useState } from 'react';

export default function TemperatureConverter() {
  const id = useId();
  const [source, setSource] = useState({ scale: 'celsius', text: '' });
  const numeric = source.text.trim() !== '' && Number.isFinite(Number(source.text));
  const converted = numeric ? (source.scale === 'celsius'
    ? Number(source.text) * 9 / 5 + 32 : (Number(source.text) - 32) * 5 / 9) : NaN;
  const other = Number.isFinite(converted) ? String(Number(converted.toFixed(4))) : '';
  return <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 440 }}>
    {['celsius', 'fahrenheit'].map(scale => <div key={scale} style={{ display: 'grid', gap: 6 }}>
      <label htmlFor={id + scale}>{scale === 'celsius' ? 'Celsius' : 'Fahrenheit'}</label>
      <input id={id + scale} inputMode="decimal" value={source.scale === scale ? source.text : other}
        onChange={event => setSource({ scale, text: event.target.value })} />
    </div>)}
  </section>;
}`})],l="The public catalog establishes the challenge theme and level; the full premium specification was not available. The requirements below define this original practice implementation.",o=t=>"https://www.greatfrontend.com/questions/user-interface/"+t+"/react",Q=[a({slug:"gfe-accordion-iii",title:"Accordion III",difficulty:"Medium",summary:"Keyboard accessible expandable sections.",prompt:"Create a reusable collection of disclosure sections. Readers can reveal several answers, navigate headers with the keyboard, and identify the relationship between each header and panel with assistive technology.",topics:["Accessibility","Keyboard Events","State Management"],requirements:["Use heading-wrapped buttons with aria-expanded and aria-controls.","Support Enter/Space activation through native buttons and ArrowUp/ArrowDown/Home/End header navigation.","Keep panels mounted with stable IDs and hide closed content.","Allow multiple open sections and independent component instances."],example:{actions:"Open Shipping, press End, then activate Returns.",result:"Both panels are expanded and focus is on Returns."},steps:["Store expanded item IDs in a Set.","Use useId for panel/header relationships.","Move focus through header refs without changing expansion."],pitfalls:["Using clickable headings removes native button activation.","Moving keyboard focus must not collapse an unrelated panel."],complexity:"O(n) render and Set copy per toggle; O(n) state/refs.",testCases:[{action:"Press ArrowUp on the first header.",expected:"Focus wraps to the final header."},{action:"Open two sections.",expected:"Both aria-expanded values are true."}],assumptions:[l,"Multiple simultaneous open panels and wrapping arrow navigation are supported."],sourceUrl:o("accordion-iii"),code:String.raw`import React, { useId, useRef, useState } from 'react';
const sample = [
  { id: 'shipping', title: 'Shipping', content: 'Orders arrive in three business days.' },
  { id: 'billing', title: 'Billing', content: 'We accept major payment cards.' },
  { id: 'returns', title: 'Returns', content: 'Return unused items within thirty days.' },

];
export default function Accordion({ items = sample }) {
  const prefix = useId();
  const buttons = useRef([]);
  const [expanded, setExpanded] = useState(new Set());
  function toggle(id) {
    setExpanded(previous => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function navigate(event, index) {
    const targets = { ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length, Home: 0, End: items.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    buttons.current[targets[event.key]]?.focus();
  }
  return <div style={{ maxWidth: 520, border: '1px solid #94a3b8' }}>
    {items.map((item, index) => {
      const header = prefix + '-header-' + index;
      const panel = prefix + '-panel-' + index;
      const open = expanded.has(item.id);
      return <section key={item.id}>
        <h3 style={{ margin: 0 }}><button id={header} aria-expanded={open} aria-controls={panel}
          ref={node => { buttons.current[index] = node; }}
          onClick={() => toggle(item.id)} onKeyDown={event => navigate(event, index)}
          style={{ padding: 16, width: '100%', textAlign: 'left' }}>{item.title} {open ? '−' : '+'}</button></h3>
        <div id={panel} role="region" aria-labelledby={header} hidden={!open} style={{ padding: 16 }}>{item.content}</div>
      </section>;
    })}
  </div>;
}`}),a({slug:"gfe-auth-code-input",title:"Auth Code Input",difficulty:"Hard",summary:"Six digit entry with paste and focus handling.",prompt:"Build a six-position numeric verification input. Typing advances focus, corrections stay predictable, and a pasted code fills consecutive positions. Expose a single completion callback and display the assembled value.",topics:["Forms","Refs","Keyboard Events"],requirements:["Accept only ASCII digits in six controlled inputs.","Advance after entry; support paste, Backspace, Delete, arrow keys, Home and End.","Call onComplete once for each newly completed code.","Label every digit and preserve leading zeros."],example:{actions:"Paste 012345 into the first input.",result:'All six slots fill and completion receives "012345".'},steps:["Represent the code as an array of six strings.","Share one write function between typing and paste.","Use a previous-code ref to avoid duplicate completion notifications."],pitfalls:["Numeric conversion destroys leading zeros.","A maxLength of one can truncate browser autofill before distribution."],complexity:"O(k) update and render for k slots (six in the demo).",testCases:[{action:"Paste a code containing spaces.",expected:"Only digits populate the slots."},{action:"Backspace from an empty slot.",expected:"The preceding slot clears and receives focus."}],assumptions:[l,"The code is exactly six digits; verification against a server is outside this input component."],sourceUrl:o("auth-code-input"),code:String.raw`import React, { useEffect, useRef, useState } from 'react';
export default function AuthCodeInput({ onComplete }) {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const inputs = useRef([]);
  const previousCode = useRef('');
  const code = digits.join('');
  useEffect(() => {
    if (code.length === 6 && code !== previousCode.current) onComplete?.(code);
    previousCode.current = code;
  }, [code, onComplete]);
  function focus(index) { inputs.current[Math.max(0, Math.min(5, index))]?.focus(); }
  function write(index, text) {
    const incoming = text.replace(/\D/g, '').slice(0, 6 - index);
    if (!incoming) return;
    setDigits(previous => {
      const next = [...previous];
      [...incoming].forEach((digit, offset) => { next[index + offset] = digit; });
      return next;
    });
    focus(index + incoming.length);
  }
  function clear(index) { setDigits(previous => previous.map((digit, i) => i === index ? '' : digit)); }
  function keyDown(event, index) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const target = digits[index] ? index : Math.max(0, index - 1);
      clear(target); focus(target);
    } else if (event.key === 'Delete') { event.preventDefault(); clear(index); }
    else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      focus(event.key === 'Home' ? 0 : event.key === 'End' ? 5 : index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  }
  return <fieldset style={{ border: '1px solid #94a3b8', padding: 20 }}>
    <legend>Verification code</legend>
    <div style={{ display: 'flex', gap: 8 }}>{digits.map((digit, index) =>
      <input key={index} ref={node => { inputs.current[index] = node; }}
        aria-label={'Digit ' + (index + 1)} value={digit} inputMode="numeric" pattern="[0-9]*"
        autoComplete={index === 0 ? 'one-time-code' : 'off'}
        onFocus={event => event.target.select()} onKeyDown={event => keyDown(event, index)}
        onChange={event => event.target.value ? write(index, event.target.value) : clear(index)}
        onPaste={event => { event.preventDefault(); write(index, event.clipboardData.getData('text')); }}
        style={{ width: 36, height: 44, textAlign: 'center', fontSize: 24 }} />)}</div>
    <p role="status">{code.length === 6 ? 'Complete: ' + code : 'Enter all six digits'}</p>
  </fieldset>;
}`}),a({slug:"gfe-data-table-iv",title:"Data Table IV",difficulty:"Hard",summary:"Configurable columns, filtering, sorting and pagination.",prompt:"Create a table driven by row data and column definitions. Apply a global search and individual column filters, then a stable sort, then pagination. Column definitions provide accessors, optional renderers and comparison functions.",topics:["Data Modeling","Sorting","Filtering","Pagination"],requirements:["Accept arbitrary rows, columns and a row-key function.","Filter before sorting before slicing a page.","Support ascending/descending sorting and per-column filters.","Clamp pages when data changes; reset pagination after filter or page-size changes.","Expose semantic table headers, sort state and an empty result."],example:{actions:"Search design, sort Age descending, then choose two rows per page.",result:"Matching rows are sorted before the first two are shown."},steps:["Define accessor/render/compare hooks on columns.","Derive the filtered and sorted array without mutating props.","Clamp the page and slice only after all transformations."],pitfalls:["Sorting only the current page produces globally incorrect results.","A filter can leave the current page outside the result range."],complexity:"O(nc + n log n) per derived update and O(n) extra memory for n rows and c columns.",testCases:[{action:"Filter from page three to one matching row.",expected:"The matching row appears on page one."},{action:"Sort a numeric custom accessor.",expected:"Numeric ordering is used without changing the source rows."}],assumptions:[l,"Filtering and sorting are client-side; text filters are case-insensitive substrings."],sourceUrl:o("data-table-iv"),code:String.raw`import React, { useMemo, useState } from 'react';
const sampleRows = [
  { id: 1, name: 'Amira', team: 'Design', age: 34 }, { id: 2, name: 'Bao', team: 'Engineering', age: 28 },
  { id: 3, name: 'Chloe', team: 'Design', age: 41 }, { id: 4, name: 'Dante', team: 'Support', age: 25 },
  { id: 5, name: 'Elena', team: 'Engineering', age: 37 }, { id: 6, name: 'Farah', team: 'Design', age: 30 },
];
const sampleColumns = ['name', 'team', 'age'].map(key => ({ key, label: key[0].toUpperCase() + key.slice(1), accessor: row => row[key] }));
const defaultRowKey = row => row.id;
export default function DataTable({ rows = sampleRows, columns = sampleColumns, rowKey = defaultRowKey }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const value = (column, row) => column.accessor ? column.accessor(row) : row[column.key];
  const text = input => String(input ?? '').toLocaleLowerCase();
  const visible = useMemo(() => {
    const matching = rows.filter(row =>
      (!query.trim() || columns.some(column => text(value(column, row)).includes(text(query.trim())))) &&
      columns.every(column => !filters[column.key] || text(value(column, row)).includes(text(filters[column.key]))));
    const column = columns.find(item => item.key === sort?.key);
    if (!column) return matching;
    return matching.map((row, index) => ({ row, index })).sort((a, b) => {
      const left = value(column, a.row), right = value(column, b.row);
      const result = column.compare ? column.compare(left, right) :
        typeof left === 'number' && typeof right === 'number' ? left - right :
        String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true });
      return (sort.direction === 'asc' ? result : -result) || a.index - b.index;
    }).map(item => item.row);
  }, [rows, columns, query, filters, sort]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = visible.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  function sortBy(key) {
    setSort(previous => ({ key, direction: previous?.key === key && previous.direction === 'asc' ? 'desc' : 'asc' }));
    setPage(0);
  }
  return <section style={{ display: 'grid', gap: 12 }}>
    <label>Search all columns <input value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} /></label>
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <caption>Records ({visible.length})</caption>
      <thead><tr>{columns.map(column => <th key={column.key} scope="col"
        aria-sort={sort?.key === column.key ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
        {column.sortable === false ? column.label : <button onClick={() => sortBy(column.key)}>{column.label}</button>}
        {column.filterable !== false && <input aria-label={'Filter ' + column.label} value={filters[column.key] || ''}
          style={{ display: 'block', maxWidth: 150 }} onChange={event => { setFilters({ ...filters, [column.key]: event.target.value }); setPage(0); }} />}
      </th>)}</tr></thead>
      <tbody>{pageRows.length ? pageRows.map(row => <tr key={rowKey(row)}>{columns.map(column =>
        <td key={column.key} style={{ padding: 8, borderBottom: '1px solid #cbd5e1' }}>{column.render ? column.render(value(column, row), row) : String(value(column, row) ?? '')}</td>)}</tr>) :
        <tr><td colSpan={columns.length}>No matching rows</td></tr>}</tbody>
    </table>
    <div><label>Rows per page <select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(0); }}>
      {[2, 5, 10].map(size => <option key={size}>{size}</option>)}</select></label>{' '}
      <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>{' '}
      <span aria-live="polite">Page {currentPage + 1} of {pageCount}</span>{' '}
      <button disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</button>
    </div>
  </section>;
}`}),a({slug:"gfe-file-explorer-iii",title:"File Explorer III",difficulty:"Medium",summary:"Hierarchical navigation rendered as flat sibling rows.",prompt:"Render a directory hierarchy as a flat tree: every visible file or folder is a direct child of one tree container. Preserve depth and sibling metadata for assistive technology while supporting expansion and keyboard navigation.",topics:["Trees","Accessibility","Keyboard Events"],requirements:["Flatten only expanded branches; never nest treeitem elements.","Expose aria-level, aria-posinset, aria-setsize and folder expansion.","Support Up/Down/Home/End, Right to expand or enter, Left to collapse or visit the parent.","Use one tabbable row and activate files with Enter or click."],example:{actions:"Expand src, focus App.jsx, then press Left.",result:"Focus moves to src and all rows remain DOM siblings."},steps:["Traverse expanded nodes into visible row descriptors.","Derive parent, depth and sibling positions during traversal.","Use a roving tab index and row refs to implement tree keys."],pitfalls:["Visual indentation alone does not expose hierarchy to screen readers.","Collapsing a folder must not strand focus on an unmounted child."],complexity:"O(v) flatten/render for v visible nodes; O(v + e) space including expanded IDs.",testCases:[{action:"Expand nested folders.",expected:"All visible treeitems share the tree as their parentElement."},{action:"Press Left on a child file.",expected:"Its parent folder receives focus."}],assumptions:[l,"Node IDs are unique; a children array marks a folder, including an empty folder."],sourceUrl:o("file-explorer-iii"),code:String.raw`import React, { useRef, useState } from 'react';
const sample = [
  { id: 'src', name: 'src', children: [{ id: 'app', name: 'App.jsx' },
    { id: 'assets', name: 'assets', children: [{ id: 'logo', name: 'logo.svg' }] }] },
  { id: 'readme', name: 'README.md' },
];
export default function FileExplorer({ nodes = sample, onOpen }) {
  const [expanded, setExpanded] = useState(new Set());
  const [focused, setFocused] = useState(null);
  const [selected, setSelected] = useState(null);
  const refs = useRef(new Map());
  const rows = [];
  function visit(items, level, parent) {
    items.forEach((node, index) => {
      rows.push({ node, level, parent, position: index + 1, size: items.length });
      if (node.children && expanded.has(node.id)) visit(node.children, level + 1, node.id);
    });
  }
  visit(nodes, 1, null);
  const focusId = rows.some(row => row.node.id === focused) ? focused : rows[0]?.node.id;
  function focus(id) { setFocused(id); refs.current.get(id)?.focus(); }
  function toggle(id) { setExpanded(previous => {
    const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next;
  }); }
  function activate(node) {
    if (node.children) toggle(node.id);
    else { setSelected(node.id); onOpen?.(node); }
  }
  function keyDown(event, row, index) {
    const { node } = row;
    const open = expanded.has(node.id);
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowDown') focus(rows[Math.min(index + 1, rows.length - 1)].node.id);
    if (event.key === 'ArrowUp') focus(rows[Math.max(0, index - 1)].node.id);
    if (event.key === 'Home') focus(rows[0].node.id);
    if (event.key === 'End') focus(rows[rows.length - 1].node.id);
    if (event.key === 'ArrowRight' && node.children) {
      if (!open) toggle(node.id); else if (node.children.length) focus(node.children[0].id);
    }
    if (event.key === 'ArrowLeft') {
      if (node.children && open) toggle(node.id); else if (row.parent !== null) focus(row.parent);
    }
    if (event.key === 'Enter' || event.key === ' ') activate(node);
  }
  return <div role="tree" aria-label="Project files" style={{ maxWidth: 380, border: '1px solid #94a3b8' }}>
    {rows.map((row, index) => <div key={row.node.id} role="treeitem" aria-label={row.node.name}
      aria-level={row.level} aria-posinset={row.position} aria-setsize={row.size}
      aria-expanded={row.node.children ? expanded.has(row.node.id) : undefined}
      aria-selected={selected === row.node.id} tabIndex={focusId === row.node.id ? 0 : -1}
      ref={element => { element ? refs.current.set(row.node.id, element) : refs.current.delete(row.node.id); }}
      onFocus={() => setFocused(row.node.id)} onClick={() => { focus(row.node.id); activate(row.node); }}
      onKeyDown={event => keyDown(event, row, index)}
      style={{ padding: 10, paddingLeft: 12 + (row.level - 1) * 24, cursor: 'pointer', background: selected === row.node.id ? '#dbeafe' : 'white' }}>
      <span aria-hidden="true">{row.node.children ? expanded.has(row.node.id) ? '▾ 📁 ' : '▸ 📁 ' : '📄 '}</span>{row.node.name}
    </div>)}
  </div>;
}`}),a({slug:"gfe-image-carousel-iii",title:"Image Carousel III",difficulty:"Hard",summary:"Smooth wrapping transitions using at most three slides.",prompt:"Build a looping image carousel whose DOM size stays constant as the image collection grows. Animate to the neighboring slide, then recenter without a visible jump. Provide previous/next controls, slide selectors and an optional autoplay mode.",topics:["Animation","Performance","Timers"],requirements:["Render only previous, current and next images.","Animate forward and backward across either collection boundary.","Prevent overlapping transitions and clean up transition fallback timers.","Support labeled controls, keyboard arrows and pausing autoplay while hovered or focused."],example:{actions:"From the final slide, press Next.",result:"The first slide enters smoothly and only three image elements remain."},steps:["Keep a logical index separate from the temporary track offset.","After transitionend, update the logical index and disable transition while recentering.","Use a fallback timeout and a ref lock to finish each transition exactly once."],pitfalls:["Reversing from the last slide to the first can animate across the entire track.","A timeout and transitionend must not advance twice."],complexity:"O(1) slide DOM and transition state; O(n) pagination controls.",testCases:[{action:"Navigate backward from slide one.",expected:"The last image becomes current after one transition."},{action:"Send repeated Next clicks during a transition.",expected:"Exactly one navigation completes."}],assumptions:[l,"Adjacent navigation slides; selecting a distant dot changes immediately. Autoplay is off by default."],sourceUrl:o("image-carousel-iii"),code:String.raw`import React, { useEffect, useRef, useState } from 'react';
const sample = [
  { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900', alt: 'Mountain ridge' },
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900', alt: 'Sunlight in a forest' },
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900', alt: 'Beach and ocean' },
];
export default function ImageCarousel({ images = sample, autoPlay = false, interval = 4000 }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const lock = useRef(false);
  const count = images.length;
  const current = count ? index % count : 0;
  const wrap = value => (value + count) % count;
  useEffect(() => { setIndex(0); setDirection(0); lock.current = false; }, [images]);
  function move(step) {
    if (count < 2 || lock.current) return;
    lock.current = true;
    setDirection(step);
  }
  function finish() {
    if (!lock.current) return;
    lock.current = false;
    setIndex(value => (value + direction + count) % count);
    setDirection(0);
  }
  useEffect(() => {
    if (!direction) return;
    const timer = setTimeout(finish, 380);
    return () => clearTimeout(timer);
  }, [direction, count]);
  useEffect(() => {
    if (!autoPlay || hovered || focused || count < 2 || direction) return;
    const timer = setTimeout(() => move(1), interval);
    return () => clearTimeout(timer);
  }, [autoPlay, hovered, focused, count, direction, index, interval]);
  if (!count) return <p>No images</p>;
  return <section aria-label="Image carousel" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}
    style={{ maxWidth: 600 }}>
    <div style={{ overflow: 'hidden', background: '#0f172a' }}>
      <div data-testid="carousel-track" onTransitionEnd={event => { if (event.target === event.currentTarget) finish(); }}
        style={{ display: 'flex', transform: count > 1 ? 'translateX(' + (-100 - direction * 100) + '%)' : 'none',
          transition: direction ? 'transform 320ms ease' : 'none' }}>
        {(count > 1 ? [-1, 0, 1] : [0]).map(offset => <img key={offset} src={images[wrap(current + offset)].src}
          alt={images[wrap(current + offset)].alt} aria-hidden={offset !== 0}
          style={{ flex: '0 0 100%', width: '100%', height: 300, objectFit: 'cover' }} />)}
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
      <button aria-label="Previous image" disabled={count < 2 || !!direction} onClick={() => move(-1)}>←</button>
      {images.map((_, itemIndex) => <button key={itemIndex} aria-label={'Go to image ' + (itemIndex + 1)}
        aria-current={itemIndex === current ? 'true' : undefined} disabled={!!direction} onClick={() => setIndex(itemIndex)}>{itemIndex + 1}</button>)}
      <button aria-label="Next image" disabled={count < 2 || !!direction} onClick={() => move(1)}>→</button>
    </div><p aria-live="polite">Image {current + 1} of {count}</p>
  </section>;
}`}),a({slug:"gfe-modal-dialog-iv",title:"Modal Dialog IV",difficulty:"Hard",summary:"Modal focus containment and restoration.",prompt:"Create a reusable modal with a title, body and actions. Opening it transfers focus inside, keyboard focus cannot escape, and dismissal restores the element that launched it. Support Escape, a close control and backdrop dismissal.",topics:["Accessibility","Focus Management","Effects"],requirements:["Use native dialog.showModal for modal semantics and background inertness.","Focus the first action when opening and restore the previous focus on every closing path.","Handle Tab/Shift+Tab wrapping and Escape.","Dismiss backdrop clicks without dismissing clicks on content; release scroll locks on cleanup."],example:{actions:"Open the dialog, Shift+Tab from its first button, then press Escape.",result:"Focus wraps to its last action, then returns to the launch button."},steps:["Record activeElement before opening the native dialog.","Collect enabled tabbable controls when a Tab key arrives.","Close through a shared state callback and restore focus during cleanup."],pitfalls:["Rendering an open attribute alone does not create a modal dialog.","Focus restoration must also run when a parent removes the modal."],complexity:"O(f) per Tab key for f focusable descendants; O(1) stored state.",testCases:[{action:"Press Tab on the last action.",expected:"Focus wraps to the first action."},{action:"Dismiss via backdrop or Escape.",expected:"The dialog closes and launcher regains focus."}],assumptions:[l,"Requires a browser with native HTMLDialogElement.showModal. The demo opens one modal at a time."],integrationNotes:["Native dialog supplies background inertness and assistive technology modal behavior. A lightweight jsdom dialog shim is needed in unit tests; verify native top-layer behavior in a browser."],sourceUrl:o("modal-dialog-iv"),code:String.raw`import React, { useEffect, useId, useRef, useState } from 'react';
export function Modal({ open, title, children, onClose }) {
  const dialog = useRef(null);
  const titleId = useId();
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    element.querySelector('button, input, select, textarea, [tabindex="0"]')?.focus();
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  function trapFocus(event) {
    if (event.key === 'Escape') { event.preventDefault(); closeCallback.current(); return; }
    if (event.key !== 'Tab') return;
    const elements = [...dialog.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && !element.closest('[hidden]'));
    const first = elements[0], last = elements[elements.length - 1];
    if (!first) { event.preventDefault(); dialog.current.focus(); }
    else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <dialog ref={dialog} aria-labelledby={titleId} aria-modal="true" tabIndex={-1}
    onKeyDown={trapFocus} onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    style={{ padding: 0, border: '1px solid #94a3b8', borderRadius: 12, maxWidth: 440 }}>
    <div style={{ padding: 24 }}>
      <h2 id={titleId}>{title}</h2><button aria-label="Close dialog" onClick={onClose}>×</button>{children}
    </div>
  </dialog>;
}
export default function ModalExample() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('No changes yet');
  return <main>
    <button onClick={() => setOpen(true)}>Edit profile</button><p role="status">{message}</p>
    <Modal open={open} title="Edit profile" onClose={() => setOpen(false)}>
      <label>Display name <input defaultValue="Jordan" /></label>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => setOpen(false)}>Cancel</button>
        <button onClick={() => { setMessage('Profile saved'); setOpen(false); }}>Save</button>
      </div>
    </Modal>
  </main>;
}`}),a({slug:"gfe-nested-checkboxes",title:"Nested Checkboxes",difficulty:"Hard",summary:"Tri-state selection across a hierarchy.",prompt:"Display nested choices whose parent state summarizes every descendant leaf. A parent selects or clears its entire subtree. Partial selection must appear as a mixed checkbox and update all affected ancestors.",topics:["Trees","Derived State","Accessibility"],requirements:["Store selected leaves and derive checked/mixed parent states.","Toggle every leaf under a selected parent.",'Set the DOM indeterminate property and aria-checked="mixed".',"Respect initial leaf selection and allow arbitrary depth."],example:{actions:"Select Apples inside Fruit.",result:"Fruit and Grocery become mixed; selecting Grocery checks all leaves."},steps:["Index the descendant leaves once for each node.","Count selected leaves to derive each node state.","Toggle a subtree with one immutable Set update."],pitfalls:["indeterminate is a DOM property rather than a normal JSX checkbox attribute.","Independent parent booleans can disagree with descendant state."],complexity:"O(nh) indexing/storage and render in the worst case for n nodes and height h; toggles touch the subtree leaves.",testCases:[{action:"Select one leaf then its parent.",expected:"The parent changes mixed → checked and all descendants become checked."},{action:"Clear the root.",expected:"Every descendant is unchecked."}],assumptions:["Public requirements were available. This original implementation normalizes checked/mixed state from leaf selection; a checked parent initializes all descendants as checked.","Nodes use unique IDs, name labels and optional children arrays."],sourceUrl:o("nested-checkboxes"),code:String.raw`import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
const sample = [{ id: 'grocery', name: 'Grocery', children: [
  { id: 'fruit', name: 'Fruit', children: [{ id: 'apples', name: 'Apples' }, { id: 'pears', name: 'Pears' }] },
  { id: 'bread', name: 'Bread' },
] }];
function Checkbox({ state, label, onChange }) {
  const input = useRef(null);
  useLayoutEffect(() => { input.current.indeterminate = state === 'mixed'; }, [state]);
  return <label><input ref={input} type="checkbox" checked={state === true}
    aria-checked={state} onChange={onChange} /> {label}</label>;
}
export default function NestedCheckboxes({ nodes = sample }) {
  const leaves = useMemo(() => {
    const map = new Map();
    function visit(node) {
      const ids = node.children?.length ? node.children.flatMap(visit) : [node.id];
      map.set(node.id, ids); return ids;
    }
    nodes.forEach(visit); return map;
  }, [nodes]);
  const [selected, setSelected] = useState(() => {
    const result = new Set();
    function visit(node, inherited = false) {
      const checked = inherited || node.checked === true;
      if (node.children?.length) node.children.forEach(child => visit(child, checked));
      else if (checked) result.add(node.id);
    }
    nodes.forEach(node => visit(node)); return result;
  });
  function stateFor(node) {
    const ids = leaves.get(node.id);
    const count = ids.filter(id => selected.has(id)).length;
    return count === ids.length ? true : count ? 'mixed' : false;
  }
  function toggle(node) {
    const check = stateFor(node) !== true;
    setSelected(previous => {
      const next = new Set(previous);
      leaves.get(node.id).forEach(id => check ? next.add(id) : next.delete(id)); return next;
    });
  }
  function renderNodes(items) {
    return <ul style={{ listStyle: 'none', paddingLeft: 24 }}>{items.map(node => <li key={node.id} style={{ margin: '8px 0' }}>
      <Checkbox state={stateFor(node)} label={node.name} onChange={() => toggle(node)} />
      {!!node.children?.length && renderNodes(node.children)}
    </li>)}</ul>;
  }
  return <section aria-label="Nested choices">{renderNodes(nodes)}</section>;
}`}),a({slug:"gfe-pixel-art",title:"Pixel Art",difficulty:"Medium",summary:"Paint a grid with pointer strokes and a palette.",prompt:"Make a small pixel editor with selectable colors, an eraser and a clear action. Users can paint a continuous pointer stroke across cells and can also paint an individual focused cell with the keyboard.",topics:["Pointer Events","State Management","CSS Grid"],requirements:["Render a configurable square grid and color palette.","Paint on pointer down and while dragging; stop on pointerup, pointercancel or window blur.","Offer an eraser, clear action, and keyboard activation.","Disable browser touch scrolling only on the drawing surface."],example:{actions:"Choose blue and drag over three cells.",result:"Those cells stay blue after the pointer is released."},steps:["Store each cell color in an immutable array.","Keep stroke activity in a ref so pointer events see it immediately.","Use hit testing during pointer move for touch and pen input."],pitfalls:["Pointer release outside the grid must end the stroke.","Touch implicit pointer capture prevents relying only on pointerenter."],complexity:"O(n²) grid render and immutable paint update; O(n²) memory.",testCases:[{action:"Paint, release outside the grid, then enter a new cell.",expected:"The new cell is unchanged."},{action:"Use the eraser on a colored pixel.",expected:"Its background returns to white."}],assumptions:[l,"The demo is an 8×8 grid. Colors are local state; no image export is required."],sourceUrl:o("pixel-art"),code:String.raw`import React, { useEffect, useRef, useState } from 'react';
const palette = ['#111827', '#ef4444', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
export default function PixelArt({ size = 8 }) {
  const dimension = Math.max(1, Math.min(32, Math.floor(size)));
  const [pixels, setPixels] = useState(() => Array(dimension * dimension).fill('#ffffff'));
  const [color, setColor] = useState(palette[0]);
  const drawing = useRef(false);
  const grid = useRef(null);
  useEffect(() => { setPixels(Array(dimension * dimension).fill('#ffffff')); }, [dimension]);
  useEffect(() => {
    const stop = () => { drawing.current = false; };
    window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop); window.addEventListener('blur', stop);
    return () => { window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); window.removeEventListener('blur', stop); };
  }, []);
  function paint(index) {
    setPixels(previous => previous[index] === color ? previous : previous.map((value, i) => i === index ? color : value));
  }
  return <section>
    <div aria-label="Color palette" style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      {palette.map(value => <button key={value} aria-label={'Color ' + value} aria-pressed={color === value}
        onClick={() => setColor(value)} style={{ background: value, width: 32, height: 32, border: color === value ? '3px solid #64748b' : '1px solid #94a3b8' }} />)}
      <button aria-pressed={color === '#ffffff'} onClick={() => setColor('#ffffff')}>Eraser</button>
      <button onClick={() => setPixels(Array(dimension * dimension).fill('#ffffff'))}>Clear</button>
    </div>
    <div ref={grid} aria-label="Pixel canvas" onPointerMove={event => {
      if (!drawing.current) return;
      const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-pixel]');
      if (cell && grid.current.contains(cell)) paint(Number(cell.dataset.pixel));
    }} style={{ display: 'grid', gridTemplateColumns: 'repeat(' + dimension + ', 28px)', touchAction: 'none', userSelect: 'none' }}>
      {pixels.map((value, index) => <button key={index} data-pixel={index} aria-label={'Pixel ' + (index + 1)}
        onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); drawing.current = true; paint(index); }}
        onPointerEnter={() => { if (drawing.current) paint(index); }} onClick={() => paint(index)}
        style={{ width: 28, height: 28, padding: 0, border: '1px solid #cbd5e1', background: value }} />)}
    </div>
  </section>;
}`}),a({slug:"gfe-progress-bars-iv",title:"Progress Bars IV",difficulty:"Hard",summary:"A three-slot progress queue with pause and resume.",prompt:"Add independent progress jobs to a queue. At most three may advance at once. Each running job can pause without losing work; queued jobs use the newly available slot. A resumed job rejoins the queue, and a global pause freezes every job.",topics:["Scheduling","Timers","State Machines"],requirements:["Enforce a hard concurrency cap of three.","Track queued, running, paused and complete states.","Preserve progress on pause/resume and promote waiting jobs in order.","Use elapsed time and clean up the scheduler timer.","Expose labeled progress elements and global pause/reset controls."],example:{actions:"Add four jobs and pause the first.",result:"The first freezes and the fourth starts; only three are running."},steps:["Centralize slot admission in a pure scheduling helper.","Advance running jobs from elapsed clock time in one interval.","Schedule after completion, pause, resume and insertion."],pitfalls:["A separate interval per job makes the concurrency limit difficult to enforce.","Resuming must not create a fourth running job."],complexity:"O(n log n) worst-case work per scheduler tick due to queue sorting; O(n) job storage.",testCases:[{action:"Add five jobs.",expected:"Three run and two remain queued."},{action:"Pause all, wait, then resume.",expected:"Progress is unchanged during the pause and continues afterward."}],assumptions:[l,"Each job takes two seconds of active time. Paused jobs release their slot, and resumed jobs join behind existing queued jobs."],sourceUrl:o("progress-bars-iv"),code:String.raw`import React, { useEffect, useRef, useState } from 'react';
function schedule(jobs) {
  let slots = 3 - jobs.filter(job => job.status === 'running').length;
  const admitted = new Set(jobs.filter(job => job.status === 'queued')
    .sort((a, b) => a.order - b.order).slice(0, Math.max(0, slots)).map(job => job.id));
  return jobs.map(job => admitted.has(job.id) ? { ...job, status: 'running' } : job);
}
export default function ProgressBars({ duration = 2000 }) {
  const [jobs, setJobs] = useState([]);
  const [paused, setPaused] = useState(false);
  const sequence = useRef(0);
  const queueOrder = useRef(0);
  useEffect(() => {
    if (paused) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now(), elapsed = now - last; last = now;
      setJobs(previous => schedule(previous.map(job => {
        if (job.status !== 'running') return job;
        const progress = Math.min(100, job.progress + elapsed / Math.max(1, duration) * 100);
        return { ...job, progress, status: progress === 100 ? 'complete' : 'running' };
      })));
    }, 50);
    return () => clearInterval(timer);
  }, [paused, duration]);
  function add() {
    const job = { id: ++sequence.current, order: ++queueOrder.current, progress: 0, status: 'queued' };
    setJobs(previous => schedule([...previous, job]));
  }
  function toggle(id) {
    const order = ++queueOrder.current;
    setJobs(previous => schedule(previous.map(job => job.id !== id ? job : {
      ...job, status: job.status === 'paused' ? 'queued' : 'paused', order,
    })));
  }
  return <section style={{ maxWidth: 600 }}>
    <button onClick={add}>Add progress bar</button>{' '}
    <button onClick={() => setPaused(value => !value)}>{paused ? 'Resume all' : 'Pause all'}</button>{' '}
    <button onClick={() => { setJobs([]); setPaused(false); }}>Reset</button>
    <p role="status">{paused ? 'All paused' : jobs.filter(job => job.status === 'running').length + ' running'}</p>
    <ol>{jobs.map(job => <li key={job.id} style={{ marginBottom: 12 }}>
      <label>Job {job.id} <progress aria-label={'Job ' + job.id} value={job.progress} max={100} style={{ width: 240 }} /></label>{' '}
      <span>{Math.floor(job.progress)}% · {job.status}</span>{' '}
      {job.status !== 'complete' && <button aria-label={(job.status === 'paused' ? 'Resume job ' : 'Pause job ') + job.id}
        onClick={() => toggle(job.id)}>{job.status === 'paused' ? 'Resume' : 'Pause'}</button>}
    </li>)}</ol>
  </section>;
}`}),a({slug:"gfe-selectable-cells",title:"Selectable Cells",difficulty:"Hard",summary:"Drag a rectangular grid selection in any direction.",prompt:"Build a grid where a pointer drag selects the rectangle between the starting and current cell. Selection should work in every direction, finish even when the pointer leaves the board, and have a keyboard equivalent.",topics:["Pointer Events","Geometry","Accessibility"],requirements:["Derive a rectangular selection using minimum and maximum row/column coordinates.","Use pointer capture and coordinate hit testing for mouse, touch and pen.","Finish on pointerup/cancel and support Escape to clear.","Support arrow navigation, Shift+Arrow range extension, Space selection and accessible cell state."],example:{actions:"Drag from row three, column four to row one, column two.",result:"Nine cells in the inclusive rectangle are selected."},steps:["Track anchor and endpoint rather than every cell event.","Convert pointer coordinates to clamped row and column values.","Derive aria-selected and styles from the bounding rectangle."],pitfalls:["Only tracking pointerenter misses touch movement under pointer capture.","Dragging upward or leftward requires min/max bounds."],complexity:"O(rc) rendering for r rows and c columns; O(1) selection state.",testCases:[{action:"Shift+ArrowRight then Shift+ArrowDown.",expected:"A 2×2 rectangle is selected."},{action:"Drag from bottom-right to top-left.",expected:"The same inclusive rectangle is selected as the reverse drag."}],assumptions:[l,"A new unmodified drag replaces the previous rectangle. Multiple disjoint ranges are outside this practice contract."],sourceUrl:o("selectable-cells"),code:String.raw`import React, { useRef, useState } from 'react';
export default function SelectableCells({ rows = 6, columns = 8 }) {
  const [selection, setSelection] = useState(null);
  const [focused, setFocused] = useState(0);
  const grid = useRef(null), cells = useRef([]), dragging = useRef(null);
  function point(index) { return [Math.floor(index / columns), index % columns]; }
  function selected(index) {
    if (!selection) return false;
    const [row, column] = point(index), [ar, ac] = point(selection.anchor), [er, ec] = point(selection.end);
    return row >= Math.min(ar, er) && row <= Math.max(ar, er) && column >= Math.min(ac, ec) && column <= Math.max(ac, ec);
  }
  function movePointer(event) {
    if (dragging.current === null) return;
    const rect = grid.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const row = Math.max(0, Math.min(rows - 1, Math.floor((event.clientY - rect.top) / rect.height * rows)));
    const column = Math.max(0, Math.min(columns - 1, Math.floor((event.clientX - rect.left) / rect.width * columns)));
    setSelection({ anchor: dragging.current, end: row * columns + column });
  }
  function keyDown(event, index) {
    if (event.key === 'Escape') { setSelection(null); return; }
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setSelection({ anchor: index, end: index }); return; }
    const [row, column] = point(index);
    const destinations = { ArrowLeft: row * columns + Math.max(0, column - 1), ArrowRight: row * columns + Math.min(columns - 1, column + 1),
      ArrowUp: Math.max(0, row - 1) * columns + column, ArrowDown: Math.min(rows - 1, row + 1) * columns + column,
      Home: row * columns, End: row * columns + columns - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    const next = destinations[event.key];
    if (event.shiftKey) setSelection(previous => ({ anchor: previous?.anchor ?? index, end: next }));
    else setSelection({ anchor: next, end: next });
    setFocused(next); cells.current[next]?.focus();
  }
  return <section><p>Drag to select. Use Shift + arrow keys to extend a selection.</p>
    <div ref={grid} role="grid" aria-label="Selectable cells" aria-multiselectable="true"
      onPointerMove={movePointer} onPointerUp={() => { dragging.current = null; }}
      onPointerCancel={() => { dragging.current = null; }} onLostPointerCapture={() => { dragging.current = null; }}
      style={{ display: 'grid', gridTemplateRows: 'repeat(' + rows + ', 36px)', width: columns * 42, touchAction: 'none', userSelect: 'none' }}>
      {Array.from({ length: rows }, (_, row) => <div key={row} role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(' + columns + ', 42px)' }}>
        {Array.from({ length: columns }, (_, column) => {
          const index = row * columns + column;
          return <button key={column} role="gridcell" aria-label={'Row ' + (row + 1) + ', column ' + (column + 1)}
            aria-selected={selected(index)} tabIndex={focused === index ? 0 : -1} ref={node => { cells.current[index] = node; }}
            onFocus={() => setFocused(index)} onKeyDown={event => keyDown(event, index)}
            onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); dragging.current = index;
              setSelection({ anchor: index, end: index }); setFocused(index); event.currentTarget.focus();
              grid.current.setPointerCapture?.(event.pointerId); }}
            onClick={event => { if (event.detail === 0) setSelection({ anchor: index, end: index }); }}
            style={{ border: '1px solid #94a3b8', background: selected(index) ? '#93c5fd' : '#ffffff' }}>{index + 1}</button>;
        })}
      </div>)}
    </div>
  </section>;
}`}),a({slug:"gfe-tabs-iii",title:"Tabs III",difficulty:"Medium",summary:"Accessible tabs with roving keyboard focus.",prompt:"Implement a reusable tab list with linked panels, one selected tab and predictable keyboard navigation. Support horizontal and vertical orientation and both automatic and manual activation.",topics:["Accessibility","Keyboard Events","Component Design"],requirements:["Use tablist/tab/tabpanel roles and stable ARIA relationships.","Keep only the focused tab in the tab sequence.","Support orientation-appropriate arrows, Home and End, wrapping and disabled-tab skipping.","Activate on focus in automatic mode; Enter or Space in manual mode."],example:{actions:"In manual mode, press Right then Enter.",result:"Focus moves first; the new panel appears only after Enter."},steps:["Track active and focused IDs separately.","Navigate an array of enabled tabs.","Render hidden inactive panels with matching IDs and labels."],pitfalls:["Manual activation needs separate selected and focused state.","Disabled tabs must be skipped in keyboard navigation."],complexity:"O(n) render and enabled-tab navigation; O(n) refs.",testCases:[{action:"Press End then Right in a horizontal tablist.",expected:"Focus wraps from the last enabled tab to the first."},{action:"Use Down in vertical mode.",expected:"The next enabled tab receives focus."}],assumptions:[l,"Automatic activation is the default; inactive panels remain mounted and hidden."],sourceUrl:o("tabs-iii"),code:String.raw`import React, { useId, useRef, useState } from 'react';
const sample = [{ id: 'overview', label: 'Overview', content: 'Project overview' },
  { id: 'activity', label: 'Activity', content: 'Recent activity' }, { id: 'settings', label: 'Settings', content: 'Project settings' }];
export default function Tabs({ items = sample, orientation = 'horizontal', activation = 'automatic' }) {
  const id = useId(), refs = useRef(new Map());
  const enabled = items.filter(item => !item.disabled);
  const [selected, setSelected] = useState(enabled[0]?.id);
  const [focused, setFocused] = useState(enabled[0]?.id);
  const active = enabled.some(item => item.id === selected) ? selected : enabled[0]?.id;
  const focusId = enabled.some(item => item.id === focused) ? focused : active;
  function keyDown(event, item) {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const index = enabled.findIndex(entry => entry.id === item.id);
    let target;
    if (event.key === nextKey) target = enabled[(index + 1) % enabled.length];
    if (event.key === previousKey) target = enabled[(index - 1 + enabled.length) % enabled.length];
    if (event.key === 'Home') target = enabled[0];
    if (event.key === 'End') target = enabled[enabled.length - 1];
    if (target) { event.preventDefault(); refs.current.get(target.id)?.focus(); }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item.id); }
  }
  return <section>
    <div role="tablist" aria-label="Project sections" aria-orientation={orientation}
      style={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'column' : 'row', gap: 4 }}>
      {items.map((item, index) => <button key={item.id} role="tab" id={id + '-tab-' + index}
        aria-controls={id + '-panel-' + index} aria-selected={active === item.id} disabled={item.disabled}
        tabIndex={focusId === item.id ? 0 : -1} ref={node => { refs.current.set(item.id, node); }}
        onFocus={() => { setFocused(item.id); if (activation === 'automatic') setSelected(item.id); }}
        onClick={() => { setSelected(item.id); setFocused(item.id); }} onKeyDown={event => keyDown(event, item)}
        style={{ padding: 12, borderBottom: active === item.id ? '3px solid #2563eb' : '3px solid transparent' }}>{item.label}</button>)}
    </div>
    {items.map((item, index) => <div key={item.id} role="tabpanel" id={id + '-panel-' + index}
      aria-labelledby={id + '-tab-' + index} hidden={active !== item.id} tabIndex={0} style={{ padding: 20 }}>{item.content}</div>)}
  </section>;
}`}),a({slug:"gfe-tic-tac-toe-ii",title:"Tic-tac-toe II",difficulty:"Hard",summary:"Configurable N×N board and M-in-a-row victory.",prompt:"Create a local two-player game with an adjustable board size and winning streak length. X and O alternate moves. Detect any contiguous winning segment horizontally, vertically or diagonally and stop the game after a win or draw.",topics:["Game Logic","Arrays","State Management"],requirements:["Allow N from 3 to 10 and M from 3 to N.","Check contiguous runs in four directions from the last move.","Prevent occupied-cell moves and moves after a terminal result.","Display the current player or winner/draw and provide restart/configuration."],example:{actions:"On a 5×5 board with M=3, X fills three adjacent cells in row four.",result:"X wins even though the streak does not span the entire row."},steps:["Store board, turn and terminal result together.","Count matching marks in both directions along four axes.","Reset the board whenever configuration is applied."],pitfalls:["Checking only entire rows misses shorter winning runs.","Diagonal checks must guard both row and column bounds."],complexity:"O(N²) immutable board copy/render per move; victory detection O(M) and storage O(N²).",testCases:[{action:"Complete an off-center diagonal of M marks.",expected:"The last mover wins."},{action:"Click an occupied cell.",expected:"Neither the board nor the current player changes."}],assumptions:[l,"Two local human players; no computer opponent. Changing settings starts a new round."],sourceUrl:o("tic-tac-toe-ii"),code:String.raw`import React, { useState } from 'react';
function fresh(size, target) { return { size, target, board: Array(size * size).fill(null), turn: 'X', winner: null }; }
function won(board, index, mark, size, target) {
  const row = Math.floor(index / size), column = index % size;
  return [[0, 1], [1, 0], [1, 1], [1, -1]].some(([dr, dc]) => {
    let count = 1;
    for (const direction of [-1, 1]) {
      for (let step = 1; step < target; step++) {
        const r = row + dr * step * direction, c = column + dc * step * direction;
        if (r < 0 || r >= size || c < 0 || c >= size || board[r * size + c] !== mark) break;
        count++;
      }
    }
    return count >= target;
  });
}
export default function TicTacToe({ initialSize = 3, initialTarget = 3 }) {
  const startSize = Math.max(3, Math.min(10, Math.floor(initialSize)));
  const startTarget = Math.max(3, Math.min(startSize, Math.floor(initialTarget)));
  const [game, setGame] = useState(() => fresh(startSize, startTarget));
  const [size, setSize] = useState(startSize), [target, setTarget] = useState(startTarget);
  function play(index) {
    setGame(previous => {
      if (previous.winner || previous.board[index]) return previous;
      const board = [...previous.board]; board[index] = previous.turn;
      const winner = won(board, index, previous.turn, previous.size, previous.target) ? previous.turn : board.every(Boolean) ? 'draw' : null;
      return { ...previous, board, winner, turn: previous.turn === 'X' ? 'O' : 'X' };
    });
  }
  return <section>
    <form onSubmit={event => { event.preventDefault(); setGame(fresh(size, target)); }}>
      <label>Board size <select value={size} onChange={event => { const next = Number(event.target.value); setSize(next); setTarget(value => Math.min(value, next)); }}>
        {Array.from({ length: 8 }, (_, i) => i + 3).map(value => <option key={value}>{value}</option>)}</select></label>{' '}
      <label>Winning length <select value={target} onChange={event => setTarget(Number(event.target.value))}>
        {Array.from({ length: size - 2 }, (_, i) => i + 3).map(value => <option key={value}>{value}</option>)}</select></label>{' '}
      <button>New game</button>
    </form>
    <p role="status">{game.winner === 'draw' ? 'Draw' : game.winner ? game.winner + ' wins' : 'Next player: ' + game.turn}</p>
    <div role="group" aria-label="Game board" style={{ display: 'grid', gridTemplateColumns: 'repeat(' + game.size + ', 44px)', gap: 3 }}>
      {game.board.map((mark, index) => <button key={index} disabled={!!mark || !!game.winner}
        aria-label={'Row ' + (Math.floor(index / game.size) + 1) + ', column ' + (index % game.size + 1) + ': ' + (mark || 'empty')}
        onClick={() => play(index)} style={{ width: 44, height: 44, fontSize: 24 }}>{mark}</button>)}
    </div>
    <button onClick={() => setGame(fresh(game.size, game.target))} style={{ marginTop: 12 }}>Restart</button>
  </section>;
}`}),a({slug:"gfe-todo-list",title:"Todo List",difficulty:"Medium",summary:"Add and remove independently identified tasks.",prompt:"Build a task list with a labeled text field and add action. Trim input, reject blank entries and remove the chosen task without affecting another task with the same text.",topics:["Forms","Lists","State Management"],requirements:["Add trimmed tasks through form submission.","Ignore blank submissions and clear successful input.","Delete by stable ID and support duplicate task labels.","Provide an empty state and accessible delete names."],example:{actions:"Add Read twice and delete one copy.",result:"One Read task remains."},steps:["Store task records with stable IDs.","Handle add with the form submit event.","Filter by ID for deletion."],pitfalls:["Array indices as keys can reuse the wrong DOM node after deletion.","Removing by text accidentally removes duplicates."],complexity:"O(n) addition/deletion/render and O(n) task storage.",testCases:[{action:"Submit only whitespace.",expected:"No task is added."},{action:"Delete the middle task.",expected:"The remaining tasks keep their order."}],assumptions:["The public add/delete task is implemented with local component state and a small initial list. Completion toggles are intentionally outside this exercise."],sourceUrl:o("todo-list"),code:String.raw`import React, { useRef, useState } from 'react';
const sample = [{ id: 1, text: 'Review notes' }, { id: 2, text: 'Practice React' }];
export default function TodoList({ initialTasks = sample }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState('');
  const nextId = useRef(0);
  function add(event) {
    event.preventDefault();
    const text = draft.trim(); if (!text) return;
    let id;
    do { id = 'new-' + ++nextId.current; } while (tasks.some(task => task.id === id));
    setTasks(previous => [...previous, { id, text }]); setDraft('');
  }
  return <section style={{ maxWidth: 480 }}>
    <h2>Tasks</h2><form onSubmit={add} style={{ display: 'flex', gap: 8 }}>
      <label>New task <input value={draft} onChange={event => setDraft(event.target.value)} /></label><button>Add task</button>
    </form>
    {tasks.length ? <ul>{tasks.map(task => <li key={task.id} style={{ padding: 8 }}>
      {task.text} <button aria-label={'Delete ' + task.text} onClick={() => setTasks(previous => previous.filter(item => item.id !== task.id))}>Delete</button>
    </li>)}</ul> : <p>No tasks yet</p>}
  </section>;
}`}),a({slug:"gfe-traffic-light",title:"Traffic Light",difficulty:"Medium",summary:"A repeating signal driven by per-phase durations.",prompt:"Create a three-lamp signal that starts green, turns yellow and then red, and repeats. Each phase has its own duration. Use one active timer and stop it when the component unmounts.",topics:["Effects","Timers","State Machines"],requirements:["Use green → yellow → red → green ordering.","Keep exactly one lamp illuminated.","Default to green 3000ms, yellow 500ms and red 4000ms.","Expose the current color in text as well as visually."],example:{actions:"Wait three seconds after mounting.",result:"Green switches to yellow; half a second later the signal turns red."},steps:["Define ordered phases with duration and display color.","Schedule the next phase in an effect keyed by current phase.","Clear the old timeout on phase changes and unmount."],pitfalls:["Using one fixed interval ignores different phase lengths.","Color alone does not communicate state to every user."],complexity:"O(1) state, rendering and timer work.",testCases:[{action:"Advance through all phase durations.",expected:"The cycle returns to green."},{action:"Unmount during green.",expected:"No timeout remains active."}],assumptions:["The catalog establishes the repeating signal. This implementation explicitly uses green=3000ms, yellow=500ms and red=4000ms and accepts custom durations."],sourceUrl:o("traffic-light"),code:String.raw`import React, { useEffect, useState } from 'react';
const sequence = ['green', 'yellow', 'red'];
const colors = { green: '#22c55e', yellow: '#facc15', red: '#ef4444' };
const defaults = { green: 3000, yellow: 500, red: 4000 };
export default function TrafficLight({ durations = defaults }) {
  const [phase, setPhase] = useState(0);
  const active = sequence[phase];
  const delay = durations[active] ?? defaults[active];
  useEffect(() => {
    const timer = setTimeout(() => setPhase(value => (value + 1) % sequence.length), Math.max(0, delay));
    return () => clearTimeout(timer);
  }, [phase, delay]);
  return <section aria-label="Traffic signal">
    <div style={{ background: '#111827', padding: 16, borderRadius: 18, width: 72, display: 'grid', gap: 12 }}>
      {['red', 'yellow', 'green'].map(color => <div key={color} aria-hidden="true"
        style={{ width: 72, height: 72, borderRadius: '50%', background: active === color ? colors[color] : '#374151' }} />)}
    </div><p role="status">Current light: {active}</p>
  </section>;
}`}),a({slug:"gfe-transfer-list-ii",title:"Transfer List II",difficulty:"Hard",summary:"Move selections, select all and add new list items.",prompt:"Create two lists with independent selection, bulk selection and item creation. Move checked items in either direction without duplicating or losing records. Show partial bulk selection as an indeterminate checkbox.",topics:["Sets","Forms","Derived State"],requirements:["Transfer only checked items and preserve relative order.","Provide per-list select-all/clear-all with an indeterminate state.","Add trimmed items to either side with unique IDs.","Disable transfer actions with no eligible selection and clear moved selections."],example:{actions:"Select two left items and move them right.",result:"The selected items append to the right and are no longer checked."},steps:["Store each side as an array of records and checked IDs in a Set.","Partition a source list into moved and remaining items.","Derive bulk checkbox state from selected count."],pitfalls:["Selection state must be cleared for moved items.","Labels may repeat; IDs must remain unique."],complexity:"O(n) transfer, bulk selection and render; O(n) storage.",testCases:[{action:"Check one item in a list of three.",expected:"Its select-all checkbox is mixed."},{action:"Add a duplicate label and move it.",expected:"Only its unique record moves."}],assumptions:[l,"New items append to their chosen side. Duplicate labels are allowed; ID identity controls selection."],sourceUrl:o("transfer-list-ii"),code:String.raw`import React, { useLayoutEffect, useRef, useState } from 'react';
const initial = { left: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }, { id: 'c', label: 'Cherry' }], right: [{ id: 'd', label: 'Date' }] };
function BulkCheckbox({ side, items, selected, onToggle }) {
  const ref = useRef(null);
  const count = items.filter(item => selected.has(item.id)).length;
  const mixed = count > 0 && count < items.length;
  useLayoutEffect(() => { ref.current.indeterminate = mixed; }, [mixed]);
  return <label><input ref={ref} type="checkbox" aria-label={'Select all ' + side}
    checked={items.length > 0 && count === items.length} aria-checked={mixed ? 'mixed' : items.length > 0 && count === items.length}
    disabled={!items.length} onChange={onToggle} /> Select all ({count}/{items.length})</label>;
}
export default function TransferList({ initialLists = initial }) {
  const [lists, setLists] = useState(initialLists), [selected, setSelected] = useState(new Set());
  const [drafts, setDrafts] = useState({ left: '', right: '' });
  const serial = useRef(0);
  function toggle(id) { setSelected(previous => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function toggleAll(side) {
    const all = lists[side].every(item => selected.has(item.id));
    setSelected(previous => { const next = new Set(previous); lists[side].forEach(item => all ? next.delete(item.id) : next.add(item.id)); return next; });
  }
  function transfer(from, to) {
    const moving = lists[from].filter(item => selected.has(item.id));
    const moved = new Set(moving.map(item => item.id));
    setLists(previous => ({ ...previous, [from]: previous[from].filter(item => !moved.has(item.id)), [to]: [...previous[to], ...moving] }));
    setSelected(previous => new Set([...previous].filter(id => !moved.has(id))));
  }
  function add(event, side) {
    event.preventDefault(); const label = drafts[side].trim(); if (!label) return;
    let id; do { id = 'added-' + ++serial.current; } while ([...lists.left, ...lists.right].some(item => item.id === id));
    setLists(previous => ({ ...previous, [side]: [...previous[side], { id, label }] }));
    setDrafts(previous => ({ ...previous, [side]: '' }));
  }
  return <section style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    {['left', 'right'].map(side => <fieldset key={side} style={{ minWidth: 220 }}>
      <legend>{side === 'left' ? 'Left list' : 'Right list'}</legend>
      <BulkCheckbox side={side} items={lists[side]} selected={selected} onToggle={() => toggleAll(side)} />
      <ul style={{ listStyle: 'none', padding: 0 }}>{lists[side].map(item => <li key={item.id}>
        <label><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} /> {item.label}</label>
      </li>)}</ul>{!lists[side].length && <p>No items</p>}
      <button disabled={!lists[side].some(item => selected.has(item.id))} onClick={() => transfer(side, side === 'left' ? 'right' : 'left')}>
        {side === 'left' ? 'Move right →' : '← Move left'}</button>
      <form onSubmit={event => add(event, side)} style={{ marginTop: 12 }}>
        <label>New {side} item <input value={drafts[side]} onChange={event => setDrafts({ ...drafts, [side]: event.target.value })} /></label>
        <button>Add to {side}</button>
      </form>
    </fieldset>)}
  </section>;
}`}),a({slug:"gfe-tweet",title:"Tweet",difficulty:"Easy",summary:"A responsive social post card with accessible actions.",prompt:"Recreate the information hierarchy of a short social post: avatar, author identity, timestamp, body and engagement controls. Accept post data as props and make local like/repost toggles reversible.",topics:["CSS","Component Props","Accessibility"],requirements:["Render author, handle, timestamp, multiline content and engagement counts.","Keep the card responsive and allow long words to wrap.","Use labeled interactive controls and pressed state for toggles.","Show avatar fallback initials when no image is supplied."],example:{actions:"Like a post with eight likes, then unlike it.",result:"The visible count changes to nine and back to eight."},steps:["Use a two-column avatar/content layout.","Render the timestamp with a machine-readable time element.","Derive counts from base props plus local toggle state."],pitfalls:["Icon-only controls need accessible names.","Fixed-width content can overflow on narrow screens."],complexity:"O(body length) text rendering and O(1) interactive state, plus any submitted replies.",testCases:[{action:"Toggle Like twice.",expected:"The base count is restored."},{action:"Render a multiline body.",expected:"Line breaks are retained."}],assumptions:[l,"This is an original social post layout. Likes/reposts are local; Reply sends text to an optional callback and adds a local reply."],sourceUrl:o("tweet"),code:String.raw`import React, { useState } from 'react';
const sample = { name: 'Alex Rivera', handle: 'alexbuilds', timestamp: '2026-06-12T14:30:00Z',
  body: 'Small improvements add up.\nToday: one accessible component, tested well.', likes: 8, reposts: 2, replies: 1 };
export default function Tweet({ post = sample, onReply }) {
  const [liked, setLiked] = useState(false), [reposted, setReposted] = useState(false);
  const [replying, setReplying] = useState(false), [draft, setDraft] = useState(''), [localReplies, setLocalReplies] = useState([]);
  function reply(event) {
    event.preventDefault(); const text = draft.trim(); if (!text) return;
    onReply?.(text); setLocalReplies(previous => [...previous, text]); setDraft(''); setReplying(false);
  }
  return <article aria-label={'Post by ' + post.name} style={{ display: 'flex', gap: 12, padding: 20, border: '1px solid #cbd5e1', borderRadius: 14, maxWidth: 560, fontFamily: 'system-ui' }}>
    {post.avatar ? <img src={post.avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} /> :
      <span aria-hidden="true" style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: '#dbeafe', display: 'grid', placeItems: 'center' }}>
        {post.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>}
    <div style={{ minWidth: 0, flex: 1 }}>
      <header><strong>{post.name}</strong> <span style={{ color: '#64748b' }}>@{post.handle}</span>{' · '}
        <time dateTime={post.timestamp}>{new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</time></header>
      <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.5 }}>{post.body}</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <button aria-label="Reply" onClick={() => setReplying(value => !value)}>↩ {post.replies + localReplies.length}</button>
        <button aria-label="Repost" aria-pressed={reposted} onClick={() => setReposted(value => !value)}>↻ {post.reposts + Number(reposted)}</button>
        <button aria-label="Like" aria-pressed={liked} onClick={() => setLiked(value => !value)} style={{ color: liked ? '#be185d' : 'inherit' }}>♥ {post.likes + Number(liked)}</button>
      </div>
      {replying && <form onSubmit={reply} style={{ marginTop: 16 }}><label>Reply text <input value={draft} onChange={event => setDraft(event.target.value)} /></label><button>Send reply</button></form>}
      {localReplies.map((text, index) => <p key={index} style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: 12 }}>{text}</p>)}
    </div>
  </article>;
}`}),a({slug:"gfe-undoable-counter",title:"Undoable Counter",difficulty:"Medium",summary:"Counter history with reversible actions and branching.",prompt:"Build a counter with −100, −10, −1, +1, +10 and +100 actions. Show its operation history and allow undo/redo. A new operation after undo starts a new branch and discards the abandoned future.",topics:["History","State Management","Arrays"],requirements:["Store snapshots and a current-history cursor.","Disable Undo and Redo at their boundaries.","Truncate redo history when a new change is made after undo.","Display each action with before and after values and offer reset."],example:{actions:"Apply +10, +1, Undo, then −1.",result:"The value is nine and the old +1 action can no longer be redone."},steps:["Initialize history with value zero.","Move a cursor for undo/redo instead of deleting snapshots.","Slice history at the cursor before appending a new action."],pitfalls:["Separate value and history state can become inconsistent.","An action after undo must discard the redo branch."],complexity:"O(h) append/render and O(1) cursor updates; O(h) history storage.",testCases:[{action:"Undo to the first state.",expected:"The value is zero and Undo is disabled."},{action:"Branch after undo.",expected:"Redo is disabled and abandoned actions disappear."}],assumptions:[l,"History is unbounded for the session. Reset returns to the initial zero snapshot."],sourceUrl:o("undoable-counter"),code:String.raw`import React, { useState } from 'react';
const start = () => ({ entries: [{ value: 0, delta: 0 }], cursor: 0 });
export default function UndoableCounter() {
  const [history, setHistory] = useState(start);
  const current = history.entries[history.cursor].value;
  function change(delta) {
    setHistory(previous => {
      const entries = previous.entries.slice(0, previous.cursor + 1);
      entries.push({ value: entries[entries.length - 1].value + delta, delta });
      return { entries, cursor: entries.length - 1 };
    });
  }
  return <section style={{ maxWidth: 520 }}>
    <output aria-label="Counter value" style={{ display: 'block', fontSize: 36 }}>{current}</output>
    <div style={{ display: 'flex', gap: 6 }}>{[-100, -10, -1, 1, 10, 100].map(delta =>
      <button key={delta} onClick={() => change(delta)}>{delta > 0 ? '+' + delta : delta}</button>)}</div>
    <div style={{ marginTop: 12 }}>
      <button disabled={history.cursor === 0} onClick={() => setHistory(previous => ({ ...previous, cursor: previous.cursor - 1 }))}>Undo</button>{' '}
      <button disabled={history.cursor === history.entries.length - 1} onClick={() => setHistory(previous => ({ ...previous, cursor: previous.cursor + 1 }))}>Redo</button>{' '}
      <button onClick={() => setHistory(start())}>Reset</button>
    </div>
    <ol aria-label="Counter history">{history.entries.map((entry, index) => <li key={index} aria-current={index === history.cursor ? 'step' : undefined}
      style={{ opacity: index > history.cursor ? 0.5 : 1, fontWeight: index === history.cursor ? 'bold' : 'normal' }}>
      {index === 0 ? 'Initial: 0' : (entry.delta > 0 ? '+' : '') + entry.delta + ': ' + history.entries[index - 1].value + ' → ' + entry.value}
    </li>)}</ol>
  </section>;
}`}),a({slug:"gfe-users-database",title:"Users Database",difficulty:"Medium",summary:"Filter, create, edit and delete user records.",prompt:"Create a small user directory with a live filter and a reusable create/edit form. Validate names and email addresses, keep IDs stable while editing, and let users cancel edits or delete a specific record.",topics:["CRUD","Forms","Filtering"],requirements:["Filter by name or email without changing stored records.","Create and edit using the same labeled form.","Require a trimmed name and valid unique email address.","Delete by ID, cancel editing and render empty states."],example:{actions:"Edit Morgan’s email and filter by the new address.",result:"The updated record appears with its original identity."},steps:["Keep the full users array separate from derived search results.","Track editing ID and form draft independently.","Validate, then append or replace one immutable record."],pitfalls:["Updating by filtered row index edits the wrong user.","Cancelling an edit must not mutate the original record."],complexity:"O(n) filtering, validation and record updates; O(n) storage.",testCases:[{action:"Try creating a duplicate email with different casing.",expected:"An error appears and no user is added."},{action:"Edit then cancel.",expected:"The stored record remains unchanged."}],assumptions:[l,"The directory is an in-memory CRUD model with name/email fields. The public catalog does not specify an API, so there are no invented endpoints."],sourceUrl:o("users-database"),code:String.raw`import React, { useRef, useState } from 'react';
const sample = [{ id: 1, name: 'Morgan Lee', email: 'morgan@example.com' }, { id: 2, name: 'Riley Chen', email: 'riley@example.com' }];
const blank = () => ({ name: '', email: '' });
export default function UsersDatabase({ initialUsers = sample }) {
  const [users, setUsers] = useState(initialUsers), [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null), [draft, setDraft] = useState(blank), [error, setError] = useState('');
  const serial = useRef(0);
  function cancel() { setEditing(null); setDraft(blank()); setError(''); }
  function submit(event) {
    event.preventDefault(); const name = draft.name.trim(), email = draft.email.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a name and a valid email address.'); return; }
    if (users.some(user => user.id !== editing && user.email.toLowerCase() === email.toLowerCase())) { setError('That email address already exists.'); return; }
    let id = editing;
    if (id === null) do { id = 'created-' + ++serial.current; } while (users.some(user => user.id === id));
    const record = { id, name, email };
    setUsers(previous => editing === null ? [...previous, record] : previous.map(user => user.id === editing ? record : user));
    cancel();
  }
  const query = filter.trim().toLowerCase();
  const visible = users.filter(user => (user.name + ' ' + user.email).toLowerCase().includes(query));
  return <section style={{ maxWidth: 720 }}>
    <label>Filter users <input value={filter} onChange={event => setFilter(event.target.value)} /></label>
    <table style={{ width: '100%', margin: '16px 0' }}><caption>User directory</caption>
      <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
      <tbody>{visible.map(user => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>
        <button aria-label={'Edit ' + user.name} onClick={() => { setEditing(user.id); setDraft({ name: user.name, email: user.email }); setError(''); }}>Edit</button>{' '}
        <button aria-label={'Delete ' + user.name} onClick={() => { setUsers(previous => previous.filter(item => item.id !== user.id)); if (editing === user.id) cancel(); }}>Delete</button>
      </td></tr>)}</tbody>
    </table>{!visible.length && <p>No matching users</p>}
    <form noValidate onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <h3>{editing === null ? 'Create user' : 'Edit user'}</h3>
      <label>Name <input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
      <label>Email <input type="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></label>
      {error && <p role="alert">{error}</p>}
      <div><button>{editing === null ? 'Create user' : 'Save user'}</button>{' '}<button type="button" onClick={cancel}>Cancel</button></div>
    </form>
  </section>;
}`}),a({slug:"gfe-whack-a-mole",title:"Whack-A-Mole",difficulty:"Medium",summary:"A timed arcade game with single-hit scoring.",prompt:"Create a nine-hole game with a timed round. A mole appears at a random hole and relocates periodically. Hitting it scores once, the countdown ends the round, and starting again clears the previous score and timers.",topics:["Timers","Randomness","Game State"],requirements:["Start a thirty-second round with nine holes.","Show one random mole at a time and award at most one point per appearance.","Relocate approximately every 750ms and prevent scoring after time expires.","Display score/time, support restart and clean up all timers."],example:{actions:"Hit the visible mole twice before it relocates.",result:"The score increases by one only."},steps:["Keep the active mole and deadline in refs for synchronous event guards.","Drive relocation and countdown with cleaned-up intervals.","Use the deadline to stop scoring even before the next render."],pitfalls:["Rapid clicks can score twice if the guard only reads stale state.","A restarted round must cancel timers from the previous round."],complexity:"O(1) state and per-tick work for a fixed nine-hole board.",testCases:[{action:"Double-click one appearance.",expected:"Only one point is awarded."},{action:"Advance beyond the deadline.",expected:"The board is disabled and the final score stays fixed."}],assumptions:[l,"One visible mole, nine holes and a thirty-second round are explicit practice rules. Duration and randomness are injectable for deterministic tests."],sourceUrl:o("whack-a-mole"),code:String.raw`import React, { useEffect, useRef, useState } from 'react';
export default function WhackAMole({ duration = 30, random = Math.random }) {
  const [round, setRound] = useState(0), [running, setRunning] = useState(false);
  const [score, setScore] = useState(0), [remaining, setRemaining] = useState(duration), [mole, setMole] = useState(null);
  const active = useRef(null), deadline = useRef(0), lastHole = useRef(null);
  function spawn() {
    let next = Math.min(8, Math.max(0, Math.floor(random() * 9)));
    if (next === lastHole.current) next = (next + 1) % 9;
    lastHole.current = next; active.current = next; setMole(next);
  }
  useEffect(() => {
    if (!running) return;
    spawn();
    const relocate = setInterval(() => { if (Date.now() < deadline.current) spawn(); }, 750);
    const clock = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (!left) { active.current = null; setMole(null); setRunning(false); }
    }, 50);
    return () => { clearInterval(relocate); clearInterval(clock); };
  }, [running, round]);
  function start() {
    deadline.current = Date.now() + Math.max(1, duration) * 1000;
    lastHole.current = null; active.current = null;
    setScore(0); setRemaining(duration); setRunning(true); setRound(value => value + 1);
  }
  function hit(index) {
    if (!running || Date.now() >= deadline.current || active.current !== index) return;
    active.current = null; setMole(null); setScore(value => value + 1);
  }
  return <section>
    <button onClick={start}>{running ? 'Restart round' : 'Start round'}</button>
    <p role="status">Score: {score} · Time: {remaining}s · {running ? 'Playing' : round ? 'Round finished' : 'Ready'}</p>
    <div aria-label="Mole board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 10 }}>
      {Array.from({ length: 9 }, (_, index) => <button key={index} aria-label={'Hole ' + (index + 1) + (mole === index ? ': mole' : ': empty')}
        disabled={!running} onClick={() => hit(index)} style={{ height: 80, borderRadius: '50%', fontSize: 36, background: '#d6b38a' }}>{mole === index ? '🐹' : '·'}</button>)}
    </div>
  </section>;
}`}),a({slug:"gfe-wordle",title:"Wordle",difficulty:"Hard",summary:"Six guesses with duplicate-aware letter feedback.",prompt:"Build a five-letter guessing game with six attempts, an onscreen keyboard and physical keyboard input. Evaluate exact matches before assigning present-letter hints so repeated letters never receive more credit than the answer contains.",topics:["Game Logic","Frequency Maps","Keyboard Events"],requirements:["Accept exactly five alphabetic characters and validate against a supplied word list.","Evaluate exact matches, then consume remaining answer frequencies for present/absent hints.","Keep keyboard hints at their strongest known state.","Stop after a correct guess or six valid guesses and support restart.","Announce errors, outcomes and feedback labels without relying only on color."],example:{actions:"Against APPLE, submit ALLEY.",result:"A is correct, one L is present, the extra L is absent, E is present and Y is absent."},steps:["Use a two-pass evaluation function for duplicate letters.","Store submitted guesses and derive keyboard hint priority.","Route physical keys and onscreen keys through one action handler."],pitfalls:["answer.includes(letter) incorrectly colors excess duplicate letters.","An absent hint must not overwrite a prior correct or present hint."],complexity:"O(gk + d) rendering/validation setup for g guesses, k=5 letters and d dictionary words; O(gk + d) memory.",testCases:[{action:"Guess a word with repeated letters.",expected:"Hints respect the number of copies in the answer."},{action:"Enter an unknown or short word.",expected:"An error appears without consuming an attempt."}],assumptions:[l,"The demo uses a disclosed small local dictionary and a default answer APPLE. Supply a larger dictionary and a session answer for a production game."],sourceUrl:o("wordle"),code:String.raw`import React, { useEffect, useMemo, useState } from 'react';
const dictionary = ['APPLE', 'ALLEY', 'ALLOT', 'ANGLE', 'BRAIN', 'BREAD', 'BRICK', 'CHAIR', 'CRANE', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'GREEN', 'HEART', 'HOUSE', 'LEMON', 'LIGHT', 'MANGO', 'NIGHT', 'OCEAN', 'PEACH', 'PILOT', 'PLANT', 'PLATE', 'PRIDE', 'QUIET', 'RAISE', 'RIVER', 'ROAST', 'SHARE', 'SLATE', 'SMILE', 'SOUND', 'SPACE', 'STONE', 'STORY', 'SWEET', 'TABLE', 'THINK', 'TIGER', 'TRAIN', 'WATER', 'WORLD', 'YOUTH'];
const colors = { correct: '#15803d', present: '#a16207', absent: '#475569', unknown: '#e2e8f0' };
const strength = { unknown: 0, absent: 1, present: 2, correct: 3 };
export function evaluate(guess, answer) {
  const result = Array(5).fill('absent'), remaining = {};
  for (let index = 0; index < 5; index++) {
    if (guess[index] === answer[index]) result[index] = 'correct';
    else remaining[answer[index]] = (remaining[answer[index]] || 0) + 1;
  }
  for (let index = 0; index < 5; index++) {
    if (result[index] !== 'correct' && remaining[guess[index]] > 0) {
      result[index] = 'present'; remaining[guess[index]]--;
    }
  }
  return result;
}
export default function Wordle({ answer = 'APPLE', words = dictionary }) {
  const secret = /^[A-Z]{5}$/.test(answer.toUpperCase()) ? answer.toUpperCase() : 'APPLE';
  const allowed = useMemo(() => new Set([...words.map(word => word.toUpperCase()), secret]), [words, secret]);
  const [guesses, setGuesses] = useState([]), [draft, setDraft] = useState(''), [error, setError] = useState('');
  const won = guesses[guesses.length - 1] === secret, finished = won || guesses.length === 6;
  const keyboard = {};
  const scores = guesses.map(guess => evaluate(guess, secret));
  guesses.forEach((guess, row) => [...guess].forEach((letter, column) => {
    const state = scores[row][column];
    if (strength[state] > strength[keyboard[letter] || 'unknown']) keyboard[letter] = state;
  }));
  function key(value) {
    if (finished) return;
    if (value === 'BACKSPACE') { setDraft(previous => previous.slice(0, -1)); setError(''); }
    else if (value === 'ENTER') {
      if (draft.length !== 5) { setError('Enter five letters.'); return; }
      if (!allowed.has(draft)) { setError('Word is not in the demo dictionary.'); return; }
      setGuesses(previous => [...previous, draft]); setDraft(''); setError('');
    } else if (/^[A-Z]$/.test(value)) { setDraft(previous => previous.length < 5 ? previous + value : previous); setError(''); }
  }
  useEffect(() => {
    function onKey(event) {
      if (event.ctrlKey || event.altKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      const value = event.key.toUpperCase();
      // Enter on a focused button must retain its native click activation.
      if (value === 'ENTER' && event.target.closest?.('button')) return;
      if (/^[A-Z]$/.test(value) || value === 'BACKSPACE' || value === 'ENTER') { event.preventDefault(); key(value); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, guesses, allowed, secret]);
  function restart() { setGuesses([]); setDraft(''); setError(''); }
  return <section aria-label="Word guessing game" style={{ maxWidth: 540 }}>
    <p>Guess a five-letter word in six attempts. Demo dictionary: {words.length} words.</p>
    <div aria-label="Guesses" style={{ display: 'grid', gap: 5 }}>
      {Array.from({ length: 6 }, (_, row) => <div key={row} aria-label={'Guess ' + (row + 1)} style={{ display: 'flex', gap: 5 }}>
        {Array.from({ length: 5 }, (_, column) => {
          const letter = (guesses[row] || (row === guesses.length ? draft : ''))[column] || '';
          const state = scores[row]?.[column] || 'unknown';
          return <span key={column} aria-label={letter ? letter + ': ' + (state === 'unknown' ? 'unsubmitted' : state) : 'Empty'}
            style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', border: '1px solid #94a3b8', fontWeight: 'bold', background: colors[state], color: state === 'unknown' ? '#0f172a' : '#ffffff' }}>{letter}</span>;
        })}
      </div>)}
    </div>
    <p role="status">{won ? 'You won!' : finished ? 'Answer: ' + secret : error || 'Attempt ' + (guesses.length + 1) + ' of 6'}</p>
    {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map(row => <div key={row} style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
      {[...row].map(letter => <button key={letter} aria-label={letter} disabled={finished} onClick={() => key(letter)}
        style={{ padding: '10px 8px', background: colors[keyboard[letter] || 'unknown'], color: keyboard[letter] ? '#ffffff' : '#0f172a' }}>{letter}</button>)}
    </div>)}
    <button disabled={finished} onClick={() => key('ENTER')}>Enter</button>{' '}
    <button disabled={finished} onClick={() => key('BACKSPACE')}>Backspace</button>{' '}
    <button onClick={restart}>Restart</button>
  </section>;
}`})],X=[...[..._,...Q].sort((t,d)=>t.title.localeCompare(d.title)),...[...$].sort((t,d)=>t.title.localeCompare(d.title))],E=["item-list-manager","code-review-feedback","react-article-sorting","react-contact-form","patient-medical-records","blog-post","react-slideshow-1","employee-validation","react-word-omitter","cryptorank-exchange"],Z=[...q,...P].map(t=>({...t,images:V[t.slug]})).sort((t,d)=>E.indexOf(t.slug)-E.indexOf(d.slug)),p=[...Z,...W,...K,...G,...X,J,Y],h="/hackerrank-react",x="rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-6 light:border-gray-200 light:bg-gray-50",r="text-sm leading-relaxed text-gray-400 light:text-gray-600",f="text-lg font-semibold text-white light:text-gray-900",u="text-sm text-blue-400 hover:underline light:text-blue-700",I={Easy:0,Medium:1,Hard:2},ee=["HackerRank","Anduril","GreatFrontEnd","Practice","Reference"],te={HackerRank:"HackerRank React",Anduril:"Other interview questions",GreatFrontEnd:"GreatFrontEnd React",Practice:"Additional practice",Reference:"Interview reference"};function ae(t){var d;return t.code||((d=t.solutionSections)==null?void 0:d.map(c=>[c.title,c.body,c.code].filter(Boolean).join(`

`)).join(`

`))||""}function D({value:t}){return e.jsx("span",{className:`rounded-full px-2.5 py-1 text-xs font-medium ${t==="Hard"?"bg-rose-500/10 text-rose-400 light:bg-rose-100 light:text-rose-700":t==="Easy"?"bg-emerald-500/10 text-emerald-400 light:bg-emerald-100 light:text-emerald-800":"bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-800"}`,children:t})}function ne({greatFrontendSort:t,onSortChange:d}){const[c,m]=S.useState(""),g=c.trim().toLowerCase(),b=p.filter(s=>[s.collection??"HackerRank",s.kind??"coding",s.title,s.summary,...s.topics].join(" ").toLowerCase().includes(g));return e.jsxs("div",{className:"space-y-6 pb-8",children:[e.jsxs("header",{children:[e.jsx("p",{className:"mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 light:text-emerald-700",children:"React practice"}),e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:"React questions"}),e.jsxs("p",{className:`mt-2 ${r}`,children:[p.length," questions and references for React and JavaScript interviews, with solutions, explanations, and examples."]}),e.jsx("a",{className:`mt-3 inline-block ${u}`,href:"https://www.hackerrank.com/domains/react",target:"_blank",rel:"noopener noreferrer",children:"Open HackerRank’s React catalog ↗"}),e.jsx("a",{className:`mt-3 ml-4 inline-block ${u}`,href:"https://www.greatfrontend.com/questions/react-coding-interview-questions",target:"_blank",rel:"noopener noreferrer",children:"Open GreatFrontEnd’s React catalog ↗"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"react-question-search",className:"mb-2 block text-sm font-medium text-gray-200 light:text-gray-800",children:"Find a question or concept"}),e.jsx("input",{id:"react-question-search",type:"search",value:c,onChange:s=>m(s.target.value),placeholder:"Search sorting, forms, state…",className:"w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 light:border-gray-300 light:bg-white light:text-gray-900"}),e.jsxs("p",{className:`mt-2 ${r}`,role:"status",children:[b.length," of ",p.length," questions"]})]}),b.length===0?e.jsxs("div",{className:x,children:[e.jsxs("p",{className:r,children:["No questions match “",c,"”."]}),e.jsx("button",{className:`mt-3 ${u}`,onClick:()=>m(""),children:"Clear search"})]}):ee.map(s=>{const y=b.filter(i=>(i.collection??"HackerRank")===s);if(y.length===0)return null;if(s==="GreatFrontEnd"&&t!=="default"){const i=t==="easy-first"?1:-1;y.sort((w,k)=>i*(I[w.difficulty]-I[k.difficulty]))}return e.jsxs("section",{"aria-labelledby":`collection-${s}`,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h2",{id:`collection-${s}`,className:f,children:te[s]}),s==="Anduril"&&e.jsx("p",{className:`mt-2 ${r}`,children:"Candidate reports establish the broad tasks. Each practice solution states its assumptions where the original requirements are unavailable. Difficulty labels are study estimates."}),s==="GreatFrontEnd"&&e.jsx("p",{className:`mt-2 ${r}`,children:"40 UI problems and 31 hooks, keeping the highest numbered level in each series. Original study solutions include summarized prompts, examples, and explicit assumptions."}),s==="GreatFrontEnd"&&e.jsxs("div",{className:"mt-3 flex flex-wrap items-center gap-2",children:[e.jsx("label",{htmlFor:"greatfrontend-sort",className:"text-sm font-medium text-gray-200 light:text-gray-800",children:"Sort by"}),e.jsxs("select",{id:"greatfrontend-sort",value:t,onChange:i=>d(i.target.value),className:"max-w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 light:border-gray-300 light:bg-white light:text-gray-800",children:[e.jsx("option",{value:"default",children:"Default order"}),e.jsx("option",{value:"easy-first",children:"Difficulty: easy to hard"}),e.jsx("option",{value:"hard-first",children:"Difficulty: hard to easy"})]})]})]}),e.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:y.map(i=>e.jsxs(v,{to:`${h}/${i.slug}`,className:"group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-colors hover:border-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-200 light:bg-gray-50 light:hover:border-blue-500",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between gap-3",children:[e.jsx("span",{className:"font-mono text-xs text-gray-500",children:String(p.indexOf(i)+1).padStart(2,"0")}),e.jsx(D,{value:i.difficulty})]}),e.jsx("h3",{className:"font-semibold text-white group-hover:text-blue-300 light:text-gray-900 light:group-hover:text-blue-700",children:i.title}),i.kind&&i.kind!=="coding"&&e.jsx("p",{className:"mt-2 text-xs font-medium text-emerald-400 light:text-emerald-700",children:i.collection==="Reference"?"Interview reference":i.kind==="design"?"System design / problem framing":"Interview discussion"}),e.jsx("p",{className:`mt-2 ${r}`,children:i.summary}),e.jsx("div",{className:"mt-4 flex flex-wrap gap-2",children:i.topics.map(w=>e.jsx("span",{className:"rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 light:bg-gray-200 light:text-gray-700",children:w},w))}),e.jsx("p",{className:"mt-4 text-xs font-medium text-blue-400 light:text-blue-700",children:i.collection==="Reference"?"Read reference →":"Read solution →"})]},i.slug))})]},s)})]})}function se({challenge:t}){var k,R,A;const d=N(),[c,m]=S.useState("idle"),g=p.findIndex(n=>n.slug===t.slug),b=p[g-1],s=p[g+1],y=(t.collection??"HackerRank")==="HackerRank",i=t.solutionTitle??"JavaScript + React solution";async function w(){try{await navigator.clipboard.writeText(ae(t)),m("copied")}catch{m("failed")}}return e.jsxs("article",{className:"min-w-0 space-y-6 pb-8",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsx(v,{className:u,to:h,children:"← All React questions"}),e.jsxs("label",{className:"flex flex-wrap items-center gap-2 text-xs text-gray-400 light:text-gray-600",children:["Jump to question",e.jsx("select",{"aria-label":"Jump to question",value:t.slug,onChange:n=>d(`${h}/${n.target.value}`),className:"max-w-full rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-sm text-gray-200 light:border-gray-300 light:bg-white light:text-gray-800",children:p.map((n,M)=>e.jsxs("option",{value:n.slug,children:[M+1,". ",n.title]},n.slug))})]})]}),e.jsxs("header",{children:[e.jsxs("div",{className:"mb-3 flex items-center gap-3",children:[e.jsxs("span",{className:"text-xs text-gray-500",children:["Question ",g+1," of ",p.length," · ",t.collection??"HackerRank"]}),e.jsx(D,{value:t.difficulty})]}),e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:t.title}),e.jsx("p",{className:`mt-2 ${r}`,children:t.summary}),t.sourceUrl?e.jsxs("a",{className:`mt-3 inline-block ${u}`,href:t.sourceUrl,target:"_blank",rel:"noopener noreferrer",children:[t.sourceLabel??(y?"Original question on HackerRank":"Public candidate report")," ↗"]}):t.sourceLabel&&e.jsx("p",{className:`mt-3 ${r}`,children:t.sourceLabel}),(k=t.additionalSources)==null?void 0:k.map(n=>e.jsxs("a",{className:`ml-4 mt-3 inline-block ${u}`,href:n.url,target:"_blank",rel:"noopener noreferrer",children:[n.label," ↗"]},n.url))]}),e.jsxs("section",{className:x,"aria-labelledby":"prompt-heading",children:[e.jsx("h2",{id:"prompt-heading",className:f,children:"Problem prompt"}),e.jsx("p",{className:`mt-3 ${r}`,children:t.prompt}),t.report&&e.jsxs("div",{className:"mt-4 border-l-2 border-emerald-700 pl-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"What was reported"}),e.jsx("p",{className:`mt-2 ${r}`,children:t.report})]}),(R=t.images)==null?void 0:R.map(n=>e.jsxs("figure",{className:"mt-5",children:[e.jsx("a",{href:n.src,target:"_blank",rel:"noopener noreferrer","aria-label":`Open ${t.title} reference image at full size`,className:"block overflow-hidden rounded-lg border border-gray-700 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-300",children:e.jsx("img",{src:n.src,alt:n.alt,width:n.width,height:n.height,loading:"lazy",decoding:"async",className:"mx-auto block h-auto max-w-full"})}),e.jsxs("figcaption",{className:"mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 light:text-gray-600",children:[e.jsx("a",{href:n.sourceUrl,target:"_blank",rel:"noopener noreferrer",className:"hover:underline",children:"Original HackerRank reference ↗"}),e.jsx("a",{href:n.src,target:"_blank",rel:"noopener noreferrer",className:"text-blue-400 hover:underline light:text-blue-700",children:"Open full size ↗"})]})]},n.src)),e.jsx("h3",{className:"mt-5 text-sm font-semibold text-gray-200 light:text-gray-800",children:t.collection==="Reference"?"What to know":y?"Requirements":"Practice requirements"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${r}`,children:t.requirements.map(n=>e.jsx("li",{children:n},n))}),t.assumptions&&e.jsxs("div",{className:"mt-5",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Assumptions for this answer"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${r}`,children:t.assumptions.map(n=>e.jsx("li",{children:n},n))})]}),e.jsxs("div",{className:"mt-5 border-t border-gray-800 pt-4 light:border-gray-200",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Example interaction"}),e.jsxs("dl",{className:`mt-3 space-y-3 ${r}`,children:[e.jsxs("div",{children:[e.jsx("dt",{className:"font-medium text-gray-200 light:text-gray-800",children:"User actions"}),e.jsx("dd",{className:"mt-1",children:t.example.actions})]}),e.jsxs("div",{children:[e.jsx("dt",{className:"font-medium text-gray-200 light:text-gray-800",children:"Expected result"}),e.jsx("dd",{className:"mt-1",children:t.example.result})]})]})]})]}),t.sampleData&&e.jsxs("section",{"aria-labelledby":"sample-data-heading",className:"min-w-0 space-y-3",children:[e.jsx("h2",{id:"sample-data-heading",className:f,children:t.sampleData.title}),e.jsx("p",{className:r,children:t.sampleData.description}),e.jsx(C,{code:t.sampleData.code,language:"jsx"})]}),e.jsxs("section",{"aria-labelledby":"solution-heading",className:"min-w-0 space-y-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsx("h2",{id:"solution-heading",className:f,children:i}),e.jsx("button",{onClick:w,className:"rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-800 light:hover:bg-gray-200",children:c==="copied"?"Copied!":"Copy solution"})]}),t.code&&e.jsx("p",{className:r,children:y?"Use this standalone implementation as a reference. In HackerRank’s starter project, keep its existing component exports and test selectors.":"This implementation follows the practice requirements and assumptions above."}),c!=="idle"&&e.jsx("p",{role:"status",className:r,children:c==="copied"?"Solution copied to clipboard.":"Clipboard access is unavailable. Select and copy the solution below."}),t.code&&e.jsx(C,{code:t.code,language:t.codeLanguage??"jsx"}),(A=t.solutionSections)==null?void 0:A.map(n=>e.jsxs("div",{className:x,children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:n.title}),e.jsx("p",{className:`mt-3 whitespace-pre-line ${r}`,children:n.body}),n.code&&e.jsx("div",{className:"mt-4",children:e.jsx(C,{code:n.code,language:t.codeLanguage??"javascript"})})]},n.title)),t.integrationNotes&&t.integrationNotes.length>0&&e.jsxs("div",{className:x,children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Using this solution"}),e.jsx("ul",{className:`mt-2 list-disc space-y-2 pl-5 ${r}`,children:t.integrationNotes.map(n=>e.jsx("li",{className:"whitespace-pre-wrap break-words",children:n},n))})]})]}),e.jsxs("section",{className:x,"aria-labelledby":"approach-heading",children:[e.jsx("h2",{id:"approach-heading",className:f,children:t.kind==="discussion"?"How to answer":"How it works"}),e.jsx("ol",{className:`mt-3 list-decimal space-y-3 pl-5 ${r}`,children:t.steps.map(n=>e.jsx("li",{className:"pl-1",children:n},n))}),e.jsxs("div",{className:"mt-5 border-t border-gray-800 pt-4 light:border-gray-200",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:t.kind==="discussion"?"Answer guidance":"Time and space"}),e.jsx("p",{className:`mt-2 ${r}`,children:t.complexity})]})]}),e.jsxs("section",{className:x,"aria-labelledby":"pitfalls-heading",children:[e.jsx("h2",{id:"pitfalls-heading",className:f,children:"Common mistakes"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${r}`,children:t.pitfalls.map(n=>e.jsx("li",{children:n},n))})]}),e.jsxs("section",{"aria-labelledby":"checks-heading",children:[e.jsx("h2",{id:"checks-heading",className:f,children:"Check your understanding"}),e.jsx("div",{className:"mt-3 overflow-x-auto rounded-lg border border-gray-800 light:border-gray-200",children:e.jsxs("table",{className:"w-full text-left text-sm",children:[e.jsx("thead",{className:"bg-gray-900 text-gray-200 light:bg-gray-100 light:text-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",className:"px-4 py-3 font-medium",children:"Try this"}),e.jsx("th",{scope:"col",className:"px-4 py-3 font-medium",children:"Expected behavior"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-800 text-gray-400 light:divide-gray-200 light:text-gray-600",children:t.testCases.map(n=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 align-top",children:n.action}),e.jsx("td",{className:"px-4 py-3 align-top",children:n.expected})]},n.action))})]})})]}),e.jsxs("nav",{"aria-label":"React question navigation",className:"flex flex-wrap justify-between gap-4 border-t border-gray-800 pt-5 light:border-gray-200",children:[b?e.jsxs(v,{className:u,to:`${h}/${b.slug}`,children:["← ",b.title]}):e.jsx(v,{className:u,to:h,children:"← All React questions"}),s?e.jsxs(v,{className:u,to:`${h}/${s.slug}`,children:[s.title," →"]}):e.jsx(v,{className:u,to:h,children:"Back to all questions →"})]})]})}function ie(){const{slug:t}=j(),[d,c]=S.useState("default");if(S.useEffect(()=>{window.scrollTo({top:0,left:0})},[t]),!t)return e.jsx(ne,{greatFrontendSort:d,onSortChange:c});const m=p.find(g=>g.slug===t);return m?e.jsx(se,{challenge:m},t):e.jsxs("div",{className:"space-y-3",children:[e.jsx("h1",{className:f,children:"React question not found"}),e.jsx(v,{className:u,to:h,children:"View all React questions"})]})}export{ie as default};
