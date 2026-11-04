import{aP as R,aQ as y,aR as e,aS as u,aT as T,aU as b}from"./index-BdHEKuex.js";const N=[{slug:"item-list-manager",title:"Item List Manager",difficulty:"Medium",topics:["useState","Controlled inputs","Immutable arrays"],summary:"Append the entered text to a list, then clear the input.",prompt:"Build a React screen for collecting a list of text items. Show a text field, an Add Item button, and an unordered list that is empty when the screen first opens. Users should be able to add several items in sequence without losing earlier entries. Empty submissions should leave the list unchanged.",example:{actions:"Enter Notebook and click Add Item. Then enter Pencil and click Add Item again.",result:"The list shows Notebook followed by Pencil, and the text field is empty after each successful addition."},requirements:["Start with an empty input and an empty unordered list.","Add Item appends the input text in insertion order.","Clear the input after adding an item; ignore empty submissions."],steps:["Keep two pieces of state: the text currently being edited and the array of saved items.","Connect the input value and onChange handler so React owns the current text.","On submit, reject blank input and append with a new array. The functional setter receives the latest list.","Clear only the input state. Render the saved array with map inside a ul."],pitfalls:["Calling items.push mutates the existing state. Use [...previous, input] instead.","A form submission reloads the page unless you call preventDefault.","Array indexes are acceptable keys here because the list only appends. Use persistent IDs if you later add deletion or reordering."],code:`import { useState } from 'react';

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
}`,testCases:[{action:"Load multiple slides.",expected:"The first slide appears; Prev and Restart are disabled."},{action:"Advance to the last slide.",expected:"Next is disabled; Prev and Restart remain available."},{action:"Go back, then restart.",expected:"Prev moves back once; Restart returns directly to the beginning."},{action:"Pass a one-slide array.",expected:"The slide is visible and all navigation buttons are disabled."}],complexity:"Each navigation action takes O(1) time and O(1) extra state, excluding the supplied slide data and rendering its text.",integrationNotes:["Pass the provided nonempty slides array as a prop. The exercise uses a fixed array; no duplicated slide state or effect is needed.","Preserve any starter component name, classes, and data-testid attributes while applying the navigation logic."],sourceUrl:"https://www.hackerrank.com/challenges/react-slideshow-1/problem"}],D=[{id:"1",data:[{id:6,timestamp:1568550058964,diagnosis:{id:3,name:"Pulmonary embolism",severity:4},vitals:{bloodPressureDiastole:155,bloodPressureSystole:90,pulse:130,breathingRate:29,bodyTemperature:99.2},doctor:{id:2,name:"Dr Arnold Bullock"},userId:1,userName:"John Oliver",userDob:"02-01-1986",meta:{height:168,weight:173}}]},{id:"2",data:[{id:1,timestamp:1565637002408,diagnosis:{id:3,name:"Pulmonary embolism",severity:4},vitals:{bloodPressureDiastole:154,bloodPressureSystole:91,pulse:125,breathingRate:32,bodyTemperature:100},doctor:{id:2,name:"Dr Arnold Bullock"},userId:2,userName:"Bob Martin",userDob:"14-09-1989",meta:{height:174,weight:172}}]},{id:"3",data:[{id:9,timestamp:1548036340751,diagnosis:{id:3,name:"Pulmonary embolism",severity:4},vitals:{bloodPressureDiastole:147,bloodPressureSystole:96,pulse:130,breathingRate:28,bodyTemperature:101},doctor:{id:2,name:"Dr Arnold Bullock"},userId:3,userName:"Helena Fernandez",userDob:"23-12-1987",meta:{height:157,weight:106}}]}],E=[{slug:"patient-medical-records",title:"Patient Medical Records",difficulty:"Medium",topics:["Controlled inputs","Shared state","Conditional rendering"],sourceUrl:"https://www.hackerrank.com/challenges/patient-medical-records/problem",summary:"Choose a patient, reveal their records, and cycle through the patients with wraparound navigation.",prompt:"Build a React app for browsing the three patients supplied in medicalRecords.js. A Search component lets the user choose a patient and request their records. A Records component displays that patient’s details and medical history, with navigation to the next patient. Initially, the patient placeholder is selected and no records are visible.",example:{actions:'Select Helena Fernandez (patient ID "3") and click Show, then click Next.',result:'Show displays Helena’s details and all ten of her records. Next wraps to John Oliver (patient ID "1").'},sampleData:{title:"medicalRecords.js — 3 sample records",description:"One complete record from each patient in the supplied file: John Oliver, Bob Martin, and Helena Fernandez. Each group’s data array is shortened to one record here; the full file contains ten records per patient. Keep the full medicalRecords.js when running the solution.",code:`const medical_records = ${JSON.stringify(D,null,2)};

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
}`}],O="/leetcode/assets/item-list-manager-DqLRtetf.gif",M="/leetcode/assets/code-review-feedback-BSyjb-xI.gif",q="/leetcode/assets/react-article-sorting-uSHNRoB6.gif",F="/leetcode/assets/react-slideshow-1-BUsZw8hg.gif",P="/leetcode/assets/employee-validation-DU43UjLz.gif",U="/leetcode/assets/cryptorank-exchange-QANLQiw2.gif",B={"item-list-manager":[{src:O,alt:"Item List Manager with an empty item field, an Add Item button, and an empty list below.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1719046513-25632d1299-hrc-idea-manager-list-animation.gif",width:600,height:517}],"code-review-feedback":[{src:M,alt:"Five code-quality cards, each with Upvote and Downvote buttons and independent counters starting at zero.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1729722211-95d9063039-ReactApp-GoogleChrome2024-09-1200-53-27-ezgif.com-video-to-gif-converter.gif",width:800,height:450}],"react-article-sorting":[{src:q,alt:"Article table with title, upvote, and date columns and controls for sorting by Most Upvoted or Most Recent.",sourceUrl:"https://hrcdn.net/s3_pub/istreet-assets/cxj8qBL9QgGAMyKrRbBGDA/sorting-articles.gif",width:600,height:495}],"react-slideshow-1":[{src:F,alt:"Slideshow displaying a title and description, with Restart, Prev, and Next controls; Restart and Prev are disabled on the first slide.",sourceUrl:"https://hrcdn.net/s3_pub/istreet-assets/j3Q6jXZ3DOOPRlCs9hFcnQ/slideshow.gif",width:600,height:495}],"employee-validation":[{src:P,alt:"Employee form with empty name, email, employee ID, and joining-date fields, validation messages, and a disabled Submit button.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1729723881-648947a309-Untitledvideo-MadewithClipchamp-ezgif.com-optimize.gif",width:600,height:750}],"cryptorank-exchange":[{src:U,alt:"CryptoRank Exchange with an empty dollar amount field and a cryptocurrency table showing exchange rates and zero coin quantities to eight decimal places.",sourceUrl:"https://s3.amazonaws.com/hr-assets/0/1729744935-207f026c08-Untitledvideo-MadewithClipchamp1-ezgif.com-optimize.gif",width:600,height:530}]},k="https://www.jointaro.com/interviews/companies/anduril/experiences/front-end-software-engineer-irvine-ca-may-1-2021-no-offer-neutral-96bace18/",z=[{collection:"Anduril",kind:"coding",slug:"anduril-file-explorer",title:"Expandable File Explorer",difficulty:"Medium",topics:["Recursion","Trees","Shared state"],sourceUrl:"https://www.teamblind.com/post/anduril-front-end-interview-yt3cx1bt",sourceLabel:"Candidate report on Blind",additionalSources:[{label:"Senior frontend report, May 2025",url:"https://discuss.frontendlead.com/t/anduril-senior-front-end-engineer-onsite-interview/1905"}],report:"A March 2025 Blind commenter reports a file-explorer screen. A May 2025 senior frontend account also describes an expandable directory component. These are candidate recollections; they do not establish file creation, renaming, or deletion requirements.",summary:"Render a nested directory tree and preserve each folder’s expansion state.",prompt:"Build a React file explorer from a hierarchy of files and folders. Users should be able to expand a folder to reveal its children and collapse it to hide them.",assumptions:["The example input is an acyclic tree. Every node has a globally unique id and an explicit type of file or folder.","Folders start collapsed. Multiple folders may be expanded, and descendant expansion is preserved when an ancestor closes.","This practice version displays files and folders; editing the filesystem is outside its assumed contract."],requirements:["Render files as leaf rows and folders as buttons with aria-expanded.","Display each expanded folder’s children recursively.","Show an Empty folder message when an expanded folder has no children.","Use immutable state updates so React renders each toggle."],example:{actions:"Expand src, then components. Collapse src and open it again.",result:"Button.jsx becomes visible, disappears with src, and reappears because components remains expanded."},steps:["Model the input as nested nodes. An explicit type distinguishes an empty folder from a file.","Keep a Set of expanded folder IDs in the parent FileExplorer component.","Copy the Set on every toggle, then add or remove the clicked ID.","FileNode renders one node. For an expanded folder it calls itself for each child.","The Set survives unmounting of hidden descendants, so closing an ancestor does not erase their expansion state."],pitfalls:["Do not mutate the existing Set and return the same object from a state setter.","Names are not unique: two folders can each contain a file named index.js. Use IDs as keys.","An empty children array still describes a folder; checking only children.length would misclassify it.","Native buttons make toggles keyboard accessible. A full ARIA tree widget would also need its own arrow-key navigation."],complexity:"Let V be the visible nodes, E the expanded folder IDs, and H the visible tree depth. Rendering takes O(V); copying the Set takes O(E), so a toggle takes O(V + E). Expansion state uses O(E), rendered output O(V), and recursive traversal depth O(H).",integrationNotes:["The sample dataset is included in the snippet. Pass a different nodes array to FileExplorer to practice another tree."],testCases:[{action:"Load the sample.",expected:"Only top-level rows appear and folder buttons are collapsed."},{action:"Expand src, then components.",expected:"Nested rows appear, including Button.jsx."},{action:"Close and reopen src.",expected:"The components folder is still expanded."},{action:"Expand public.",expected:"Empty folder appears."}],code:String.raw`import { useState } from 'react';

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
}`},{collection:"Anduril",kind:"coding",slug:"anduril-search-table",title:"Search Bar + Results Table",difficulty:"Medium",topics:["Controlled inputs","Filtering","Derived state"],sourceUrl:k,sourceLabel:"May 2021 candidate report hosted on Taro",additionalSources:[{label:"December 2020 search/filter report on Taro",url:"https://www.jointaro.com/interviews/companies/anduril/experiences/front-end-engineer-new-grad-united-states-december-1-2020-no-offer-neutral-99172b8f/"}],report:"A May 2021 frontend account from Irvine names a search interface with a table. A December 2020 frontend new-grad account describes filtering supplied data in React. Both are candidate accounts hosted on Taro; the full prompts and original Glassdoor pages are not independently verified here.",summary:"Filter supplied rows from a controlled search input and render the matches in a table.",prompt:"Create a React search bar and results table. As the user edits the query, show the rows that match the input.",assumptions:["Rows contain unique ids, names, and teams. Matching is case-insensitive substring search across the combined name and team text.","Ignore leading and trailing query whitespace. An empty query shows all rows.","Data is supplied locally; networking, debounce, pagination, and sorting are not part of this example."],requirements:["Keep the input query in state and derive matching rows during rendering.","Display the result count and a table with Name and Team columns.","Display No matching people when the result is empty.","Reflect updated rows props without synchronizing a second filtered-results state."],example:{actions:"Enter platform, then change the query to JORDAN, then clear the input.",result:"The table shows Alex and Sam, then Jordan, then all four sample rows."},steps:["Store only query as state. Normalize it with trim and toLowerCase.","Filter the rows by comparing each row’s normalized searchable text with includes.","Render the result count and map each matching row into a table row keyed by id.","When there are no matches, render a single message cell spanning both columns."],pitfalls:["Filtered rows are derived data. Storing them separately can leave them stale when the input dataset changes.","Normalize both the query and the row text so mixed capitalization behaves consistently.","Use stable row IDs instead of indexes when list membership can change."],complexity:"For N rows, filtering takes O(N) time when text lengths are bounded. Rendering takes O(M) for M matches. The filtered array uses O(M) space; with longer fields, include the cost of normalizing and searching their text.",testCases:[{action:"Load with an empty query.",expected:"Every input row appears."},{action:"Search for PLATFORM with spaces around it.",expected:"Alex and Sam match."},{action:"Search for text absent from the dataset.",expected:"The count is zero and the empty message appears."},{action:"Replace the rows prop while a query is active.",expected:"Results are derived from the new rows immediately."}],code:String.raw`import { useState } from 'react';

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
}`},{collection:"Anduril",kind:"coding",slug:"anduril-month-year-form",title:"Month / Year Input Form",difficulty:"Medium",topics:["Forms","Validation","Controlled inputs"],sourceUrl:k,sourceLabel:"May 2021 candidate report hosted on Taro",report:"The May 2021 Irvine frontend account hosted on Taro also names a form for entering a month and year. It does not provide validation rules or a required visual design. The range and output format below are practice assumptions.",summary:"Validate a calendar month and year, then submit a normalized YYYY-MM value.",prompt:"Build a React form with month and year inputs. Validate the values on submission and display the accepted month/year value or a useful error.",assumptions:["Months range from 1 through 12 and years from 1000 through 9999.","Submission produces YYYY-MM, for example 2026-03. This represents a calendar month, not an instant in a time zone.","Validate on submit. The displayed Submitted value represents the last successful submission until another submission succeeds or fails."],requirements:["Keep input values as strings, including the empty editing state.","Offer all twelve months and accept a four-digit year.","Reject missing or invalid values and display an alert.","Pad a single-digit month to two digits in the submitted result."],example:{actions:"Choose month 3, type 2026, and submit.",result:"The form displays Submitted: 2026-03. Submitting an empty year instead displays an error."},steps:["Use separate string state values for month and year so inputs can be temporarily empty.","Prevent the form’s default navigation when the user submits.","Validate both strings before building the result. The year must start with a nonzero digit and contain four digits.","Combine year with a month padded to two digits. No Date object is needed.","On failure, clear the old submitted result and show an alert. On success, clear the error."],pitfalls:["Converting input to a number on every keystroke makes the empty input state harder to represent.","maxLength is an editing aid, not validation. Validate again on submission.","Creating a Date introduces day and time-zone behavior that this calendar-month contract does not need."],complexity:"Validation and formatting take O(1) time under the fixed four-digit year contract. The component stores O(1) state and renders a fixed set of twelve month choices.",testCases:[{action:"Submit with missing inputs.",expected:"An alert asks for a month and a year in range."},{action:"Submit month 3 and year 2026.",expected:"Submitted: 2026-03 appears."},{action:"Submit a year containing letters or fewer than four digits.",expected:"Submission fails and any prior result is cleared."},{action:"Submit years 1000 and 9999.",expected:"Both boundary values are accepted."}],code:String.raw`import { useState } from 'react';

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
}`}],L=[{collection:"Anduril",kind:"coding",slug:"anduril-array-utilities",title:"Array Utilities: Flatten, Map, and Reduce",difficulty:"Medium",topics:["JavaScript","Recursion","Array methods"],summary:"Implement three array helpers and explain depth, sparse arrays, and the initial accumulator.",sourceUrl:"https://www.teamblind.com/post/anduril-frontend-interview-eg52tpe3",sourceLabel:"Candidate report on Blind — May 2024",report:"A May 15, 2024 Blind commenter names Lodash-style flatten, map, and reduce questions in a frontend interview. The same commenter also promotes a preparation site and reports the autocomplete task elsewhere. This is one anonymous account; it does not establish the exact utility contracts.",prompt:"Implement flatten, mapArray, and reduceArray in JavaScript. Flatten nested arrays to a requested depth, transform existing elements with a callback, and accumulate existing elements into one result. Use the example contracts below to make the task concrete.",assumptions:["Inputs are arrays. These are array-based teaching implementations, not complete Lodash replacements or generic native-method polyfills.","flatten accepts a nonnegative integer depth or Infinity; its default depth is one. Nested arrays are acyclic.","flatten skips holes in visited arrays; mapArray preserves holes; reduceArray skips them. An explicit undefined initial value counts as supplied.","mapArray and reduceArray capture the original array length and pass the original array to callbacks. mapArray also accepts thisArg."],requirements:["Return new arrays from flatten and mapArray without modifying the input.","Respect flatten depth zero, finite depths, and Infinity.","Call mapArray callbacks with value, index, and the original array.","Call reduceArray callbacks with accumulator, value, index, and the original array.","Without an initial value, use the first existing element; throw if there is no existing element."],example:{actions:"Flatten [1, [2, [3]], 4] at depth 1 and Infinity; map [1, 2, 3] to twice each value; reduce it to a sum starting at 0.",result:"The results are [1, 2, [3], 4], [1, 2, 3, 4], [2, 4, 6], and 6."},steps:["For flatten, visit each existing entry. Recurse into a nested array only while there is depth left; otherwise append the value.","For mapArray, allocate an output array with the input length and assign transformed values only at existing indexes.","For reduceArray, decide the accumulator and startIndex before the reduction loop. If an initial value was supplied, use it and start at index 0. arguments.length >= 3 counts an explicitly supplied undefined as an initial value.","Without an initial value, find the first existing element, use it as the accumulator, and set startIndex to firstElementIndex + 1. Throw if there is no existing element. For [2, 4, 6], this means accumulator = 2 and startIndex = 1.","Begin the reduction loop at startIndex. Skip empty slots and call the callback for each remaining element; accumulator selection is already complete.","Capture length before invoking callbacks so an appended item is not unexpectedly visited during the same operation."],pitfalls:["Checking initialValue !== undefined incorrectly treats an explicitly supplied undefined as an omitted argument.","A hole is different from an element whose value is undefined. Use i in array to distinguish them.","Using push in mapArray changes positions in sparse arrays; assign result[i] instead.","Very deeply nested arrays can exhaust the call stack. An explicit stack is an alternative when unbounded nesting is a requirement."],integrationNotes:["The named exports can be used in a JavaScript module. Remove export if your interview environment runs a plain script.","Clarify whether the interviewer wants native array behavior, Lodash behavior, or a simpler dense-array contract before handling every edge case."],complexity:"For flatten, let S be the number of array slots inspected, M the output length, and D the visited nesting depth: O(S) time and O(M + D) space. For mapArray, O(N) time with a constant-time callback and O(N) output space. For reduceArray, O(N) traversal; extra working state is O(1), excluding storage allocated by the callback or accumulator.",testCases:[{action:"Flatten [1, [2, [3]]] at depths 0, 1, and Infinity.",expected:"Return [1, [2, [3]]], [1, 2, [3]], and [1, 2, 3]."},{action:"Map a sparse array with one existing element.",expected:"Keep its length and holes; invoke the callback only for that element."},{action:"Reduce [] without an initial value.",expected:"Throw a TypeError."},{action:"Reduce [] with an explicit undefined initial value.",expected:"Return undefined without invoking the callback."},{action:"Append an item inside a map or reduce callback.",expected:"The new item is beyond the captured length and is not visited."}],solutionTitle:"JavaScript solution",codeLanguage:"javascript",code:String.raw`export function flatten(array, depth = 1) {
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
}`}],V=[{slug:"anduril-object-classification",collection:"Anduril",kind:"design",title:"Known / Unknown Objects — Frontend Design",difficulty:"Hard",topics:["System design","Live data","State management","Virtualization"],summary:"Design an interface for thousands of API objects whose classification can change.",sourceUrl:"https://discuss.frontendlead.com/t/anduril-senior-front-end-engineer-onsite-interview/1905",sourceLabel:"Candidate report — FrontendLead, May 2025",report:"A May 18, 2025 anonymous senior frontend interview report describes receiving thousands of objects from an API and flagging them as known or unknown. The report does not publish the API, update frequency, or editing rules.",prompt:"Design a frontend that displays thousands of objects from an API and supports classifying them as known or unknown. Explain the data model, UI state, update flow, rendering performance, and failure behavior.",assumptions:["For this practice answer, objects have stable IDs and server-assigned versions. Updates can arrive repeatedly and out of order.","Users may change classifications, and other users may edit the same object. The server remains authoritative.","The practice UI contains a filterable object list and a details panel. A saved label appears only after the server confirms the change."],requirements:["Clarify what known and unknown mean, who may change those values, and how fresh the interface must be.","Keep the list and details panel consistent while new object data arrives.","Render large datasets without mounting every row, and preserve selection during updates.","Expose pending edits, conflicts, failed saves, and stale connections."],example:{actions:"Select object-123 at version 7 and mark it known. Before the save completes, another user changes the same object to version 8.",result:"The server rejects the stale version-7 edit. The UI loads version 8, retains the user’s intended change, and asks them to review it before retrying."},solutionTitle:"Frontend system design solution",code:"",solutionSections:[{title:"Clarify the contract",body:"Ask what classification represents, whether users edit it, the expected object count, update rate, and acceptable display delay. Establish whether every intermediate event matters or only each object’s latest state. These answers determine transport, retention, and batching choices."},{title:"Give each object one canonical record",body:"Store server records by ID. Keep ordered IDs, selected ID, filters, and pending edits separately. Both the list and details panel look up the same record. An unsaved edit lives outside the server record so a background update cannot silently erase it.",code:`const state = {
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
};`},{title:"Separate freshness from classification",body:"A disconnected feed does not change an object’s classification. Show connection status and last-update time independently. Preserve selection through unrelated updates, explain when the selected object is removed, and distinguish loading failures from save failures. Verify keyboard navigation, clear labels, and status announcements as part of the interface."}],steps:["Establish the domain meaning, data volume, update rate, and edit permissions.","Separate canonical server records from selection, filtering, and pending edits.","Specify snapshot loading, update ordering, deletion handling, and resynchronization.","Choose rendering and storage strategies that match the measured update workload.","Walk through a successful save, a stale edit, a failed request, and a disconnected feed."],pitfalls:["Do not change an object to unknown merely because its data becomes stale.","A late save response must not overwrite a newer stream version.","Virtualization limits mounted rows; it does not automatically make full-array filtering or immutable dictionary copies constant-time.","Do not discard intermediate events unless the product only needs the latest state."],complexity:"For N loaded objects and V mounted rows, record storage is O(N) and mounted list rendering is O(V). ID lookup is typically O(1). A client filter scan is O(N); sorting is O(N log N). Copying an N-entry object for an immutable update is O(N), even when only one record changes. Batching reduces how often that copy occurs.",testCases:[{action:"Receive version 6 after storing version 7.",expected:"Keep version 7; the UI does not move backward."},{action:"Select an object while unrelated rows update.",expected:"The selection and any unsaved edit remain intact."},{action:"Submit an edit after another user changes the object.",expected:"Detect the version conflict and retain the user’s draft for review."},{action:"Lose the live connection.",expected:"Mark the feed stale and resynchronize on reconnect; classifications remain unchanged."},{action:"Scroll through thousands of records.",expected:"Only visible rows and a buffer are mounted."}]},{slug:"anduril-scheduler",collection:"Anduril",kind:"design",title:"React Scheduler — Clarify and Design",difficulty:"Medium",topics:["Requirements","Forms","Time zones","State design"],summary:"Clarify the reported scheduler task, then work through an explicitly assumed appointment-calendar design.",sourceUrl:"https://www.jointaro.com/interviews/companies/anduril/experiences/software-developer-seattle-wa-december-16-2024-no-offer-neutral-557516d5/",sourceLabel:"Candidate report — Taro, December 2024",report:"A December 16, 2024 Seattle account on Taro identifies a frontend role and names a React scheduler exercise. It does not explain whether scheduling means calendar appointments, timed jobs, or something else. The original complete specification is unavailable in that report.",prompt:"The reported task is to create a scheduler app in React. Begin by establishing what is being scheduled and the required operations. The worked design below assumes an appointment calendar solely to provide a concrete practice example.",assumptions:["Practice design only: schedule non-recurring appointments on one calendar, with a title, start time, and end time.","Support create, edit, delete, and an agenda sorted by start time. Overlapping appointments are rejected; adjacent appointments are allowed.","Appointments use an explicitly selected calendar time zone. Persistence is handled by an API. None of these details is established by the candidate report."],requirements:["Clarify calendar appointments versus timed task execution before designing components.","For this practice version, validate required fields and require the end to occur after the start.","Keep saved appointments separate from the editable draft and surface failed saves.","Define time-zone interpretation, overlap rules, and persistence before implementation."],example:{actions:"With an appointment from 09:00 to 10:00 in the calendar’s zone, try adding one at 09:30–10:30 and then one at 10:00–11:00.",result:"Under the practice overlap rule, the first attempt is rejected and the adjacent appointment is accepted. This behavior is an assumed practice requirement."},solutionTitle:"Clarification and practice design answer",code:"",solutionSections:[{title:"Ask what scheduler means",body:"First ask whether the user is booking appointments, arranging jobs, or executing callbacks at future times. Ask which operations, views, data inputs, and outputs are expected. Also establish recurrence, time zones, persistence, and the time available. A calendar interface and a JavaScript task scheduler require different models; the public report alone does not choose between them."},{title:"Practice contract: an appointment agenda",body:"For this worked example, use a form plus an agenda rather than starting with a complex calendar grid. A Scheduler parent owns saved appointments and the selected calendar zone. AppointmentForm owns an editing draft and validation messages. Agenda derives the sorted visible appointments. Store the editing appointment’s ID separately, and discard or save its draft explicitly."},{title:"Make time and overlap rules explicit",body:"Retain text input while the user edits. Convert a complete date/time using the chosen calendar zone before comparing instants, and store start/end instants along with the zone used for display. A datetime-local input does not include a time zone, so parsing it as if it were UTC would change the appointment. Ask the user to resolve ambiguous daylight-saving times, and reject nonexistent local times. For the practice overlap rule, two intervals overlap when startA < endB and startB < endA. Exclude the edited appointment itself when checking conflicts."},{title:"Validate, save, and update the agenda",body:"Validate a nonblank title, valid times, start before end, and no conflicting appointment. Send the draft to the API, show a pending state, and only add or replace the saved appointment after confirmation. Preserve the draft if saving fails. Treat deletion similarly. The server must also enforce overlap rules to catch simultaneous bookings. Derive the agenda from saved appointments; sort a copy rather than mutating state."},{title:"Choose extensions after the basic flow works",body:"Build keyboard-accessible inputs and explicit edit/delete controls first. Add day/week views, drag-and-drop, recurrence, or reminders only if requested. A recurring 09:00 appointment needs a recurrence rule and calendar zone; repeatedly adding 24 hours can shift its local time across daylight-saving changes. If the interviewer instead means timed job execution, replace this calendar design with the agreed queue, execution, cancellation, and clock semantics."}],steps:["Get a concrete example of the scheduling input and expected output.","Agree on a minimal feature set and document the assumptions.","Separate saved appointments, draft fields, selected date or zone, and request status.","Define validation and conflict handling before wiring up the form and agenda.","Exercise time boundaries and failed saves before adding richer calendar interactions."],pitfalls:["Do not present the assumed calendar design as the original interview specification.","A local date/time string has no offset; do not silently interpret it in the wrong zone.","Remember to exclude the current appointment when validating an edit against overlaps.","A client conflict check alone cannot prevent concurrent server bookings."],complexity:"For N appointments, a simple conflict scan costs O(N), deriving a sorted agenda costs O(N log N), and stored appointments require O(N) space. A visible-date filter is O(N) without an index. These bounds describe the assumed practice design, not an unpublished interview solution.",testCases:[{action:"Begin the interview with only the word scheduler.",expected:"Clarify the domain and expected operations before choosing an implementation."},{action:"Submit an end time at or before the start.",expected:"The practice form shows a validation error and retains the draft."},{action:"Add an appointment starting when another ends.",expected:"The practice half-open interval rule permits it."},{action:"Edit an appointment without changing its time.",expected:"It does not conflict with itself."},{action:"A save fails or the server reports a conflict.",expected:"Keep the draft, explain the error, and allow correction or retry."}]}],W={collection:"Reference",kind:"discussion",slug:"aria-interview-essentials",title:"ARIA Interview Essentials",difficulty:"Medium",topics:["Accessibility","ARIA","React","Keyboard interaction"],summary:"Learn ten useful ARIA attributes, two autocomplete essentials, and common implementation mistakes.",sourceUrl:"https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes",sourceLabel:"MDN ARIA reference",additionalSources:[{label:"W3C combobox pattern",url:"https://www.w3.org/WAI/ARIA/apg/patterns/combobox/"},{label:"W3C guidance on using ARIA",url:"https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/"},{label:"MDN aria-disabled",url:"https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled"},{label:"MDN aria-hidden",url:"https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden"}],prompt:"Explain how ARIA communicates accessible names, relationships, and state. Choose the appropriate attributes for an icon button, expandable panel, form error, toggle, and autocomplete input, and explain which behavior JavaScript must still implement.",assumptions:["This is an interview reference, not a reported company problem. The examples illustrate attributes rather than complete standalone components.","State values, event handlers, and option data referenced by the snippets are supplied by the surrounding component. IDs must be unique on the page; use useId when a reusable component needs its own IDs.","Use attributes on elements and roles that support them. Complex widgets still need their expected keyboard behavior and focus management."],requirements:["Distinguish an accessible name from additional descriptive text.","Keep expanded, selected, pressed, and invalid states synchronized with the interface.","Explain the relationship between a controlling element and the element it references.","Start with native HTML controls, then add ARIA where information is missing."],example:{actions:"An interviewer asks how you would make a button that opens extra details accessible.",result:"Use a native button with visible text, aria-expanded bound to the open state, and aria-controls pointing to the details element. Implement the toggle and visibility separately."},solutionTitle:"ARIA attributes and examples",code:"",codeLanguage:"jsx",solutionSections:[{title:"1. aria-label — give a control a name",body:"Use a short accessible name for a control whose visible contents do not explain its action, such as an icon-only close button. A button with clear visible text already has a name; a native form input should normally have a visible label.",code:`<button type="button" aria-label="Close dialog" onClick={onClose}>
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
</div>`}],steps:["Identify the native element that matches the interaction before adding a role or state.","Give the control a clear name, then add any extra description separately.","Connect related elements with unique IDs and keep state attributes synchronized with React state.","Explain the keyboard interaction and focus behavior that accompany the chosen widget pattern."],pitfalls:["Do not use aria-label as a replacement for visible labels everywhere; it can override the name users expect from visible text.","Do not put aria-selected on an arbitrary button. Use the state supported by the widget’s role, such as aria-pressed for a toggle button.","Never leave aria-activedescendant pointing to an absent or hidden option.","Do not confuse describing a disabled or hidden state with implementing the behavior."],complexity:"This reference concerns accessible semantics and interaction. Algorithmic complexity depends on the component using these attributes, not the attributes themselves. In an interview, explain the accessible name, relevant state, keyboard controls, and focus behavior.",integrationNotes:["The examples are JSX fragments. Keep the aria-* attribute names hyphenated in React and supply the surrounding state and event handlers.","For a full autocomplete implementation, see React Autocomplete Search in the Anduril question group. These snippets focus on the relevant accessibility attributes."],testCases:[{action:"An icon-only button has no visible action text.",expected:'Supply an accessible name, such as aria-label="Close dialog", and hide redundant decoration.'},{action:"Explain labelledby versus describedby.",expected:"The first provides the name; the second references additional instructions or explanatory text."},{action:"Open and close a disclosure.",expected:"The content visibility and aria-expanded value change together, and aria-controls references its panel."},{action:"Navigate autocomplete options with the keyboard.",expected:"The implemented widget keeps input focus and updates aria-activedescendant to a rendered option."},{action:"Set aria-disabled on a clickable element.",expected:"Explain that activation is still possible unless the implementation prevents it."}]},K={collection:"Practice",kind:"coding",slug:"spreadsheet",title:"Spreadsheet",difficulty:"Medium",topics:["JavaScript","Parsing","Recursion"],sourceLabel:"Provided solution",summary:"Evaluate simple addition and subtraction formulas using separate operand and operator arrays.",prompt:"Implement a Spreadsheet class with setCell(cellId, input) and getCell(cellId). Store numbers or formulas beginning with =. A formula combines numbers and cell references using + and -, such as =A1+3-B1. First collect its operands and operators into separate arrays, then evaluate them from left to right. Referenced cells can contain formulas, and later edits must be reflected on the next read.",assumptions:["Inputs are numbers or valid formula strings without spaces. Formula operands are unsigned decimal numbers or cell references, joined by + or -.","Every referenced cell exists, reference spelling is consistent, and there are no circular references. This is the simple version built in the walkthrough."],requirements:["Store the original input for each cell in a Map.","Return stored numbers directly.","Collect operands and operators into separate arrays before evaluating a formula.","Resolve each operand as either a number or a reference to another cell.","Apply addition and subtraction from left to right, recalculating referenced formulas on every read."],example:{actions:"Set A1 to 10, B1 to 2, C1 to =A1+3-B1, and D1 to =C1+5. Read C1 and D1, then change A1 to 20 and read both again.",result:"C1 returns 11 and D1 returns 16. After changing A1, they return 21 and 26. The formulas stay stored, so each read uses the current cell values."},steps:["Store cell inputs in a Map. setCell saves the number or formula exactly as provided.","In getCell, return the input immediately if it is a number. Otherwise remove the leading =.","Scan the expression to build each operand. When you reach + or -, save the operand and operator in their own arrays, then start the next operand. Save the final operand after the loop.",'For A1+3-B1, the operands are ["A1", "3", "B1"] and the operators are ["+", "-"]. Collection finishes before calculation starts.',"resolveOperand tries Number(operand). If the result is a number, return it; otherwise call getCell to read the referenced cell.","Use operands[0] as the initial result. Loop through operators, pairing operators[index] with operands[index + 1], then add or subtract its resolved value.","A referenced formula follows the same process recursively. Reading C1 starts with 10, adds 3 to reach 13, then subtracts 2 to return 11."],pitfalls:["Save the final operand after scanning the expression; there is no following operator to save it for you.","Use operands[index + 1] in the calculation loop because operands[0] already became the initial result.","Keep the raw formula in the Map so future reads can use updated values from its referenced cells."],integrationNotes:["Run the standalone class and examples below as a JavaScript script. The examples print 11, 16, 21, and 26.","Build in small steps: store numbers, add two cells, resolve numeric operands, handle multiple additions, then collect separate arrays to support subtraction."],complexity:"setCell is typically O(1). A formula of n characters that references only stored numbers takes O(n) time and O(n) auxiliary space. Referenced formulas add their own evaluation work; shared formulas are recalculated, so total work can grow exponentially with dependency depth. Recursive reads retain the call stack and operand/operator arrays along the active path. Stored inputs take space proportional to their total size.",testCases:[{action:"Store A1 as 10 and read A1.",expected:"Return 10 directly."},{action:"Set A1 to 10 and B1 to 2, then evaluate =A1+3-B1.",expected:"Return 11: start at 10, add 3, then subtract 2."},{action:"Evaluate =4+5 or =10-3-2.",expected:"Return 9 and 5 respectively."},{action:"Set C1 to =A1+3-B1 and D1 to =C1+5, then change A1 from 10 to 20.",expected:"C1 changes from 11 to 21, and D1 changes from 16 to 26 on the next read."}],solutionTitle:"JavaScript solution",codeLanguage:"javascript",code:`class Spreadsheet {
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
console.log(sheet.getCell("D1")); // 26`},S=["item-list-manager","code-review-feedback","react-article-sorting","react-contact-form","patient-medical-records","blog-post","react-slideshow-1","employee-validation","react-word-omitter","cryptorank-exchange"],$=[...N,...E].map(t=>({...t,images:B[t.slug]})).sort((t,r)=>S.indexOf(t.slug)-S.indexOf(r.slug)),d=[...$,...z,...L,...V,K,W],c="/hackerrank-react",f="rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-6 light:border-gray-200 light:bg-gray-50",n="text-sm leading-relaxed text-gray-400 light:text-gray-600",p="text-lg font-semibold text-white light:text-gray-900",l="text-sm text-blue-400 hover:underline light:text-blue-700",H=["HackerRank","Anduril","Practice","Reference"],Y={HackerRank:"HackerRank React",Anduril:"Anduril interview questions",Practice:"Additional practice",Reference:"Interview reference"};function J(t){var r;return t.code||((r=t.solutionSections)==null?void 0:r.map(o=>[o.title,o.body,o.code].filter(Boolean).join(`

`)).join(`

`))||""}function A({value:t}){return e.jsx("span",{className:`rounded-full px-2.5 py-1 text-xs font-medium ${t==="Hard"?"bg-rose-500/10 text-rose-400 light:bg-rose-100 light:text-rose-700":"bg-amber-500/10 text-amber-400 light:bg-amber-100 light:text-amber-800"}`,children:t})}function Q(){const[t,r]=y.useState(""),o=t.trim().toLowerCase(),h=d.filter(i=>[i.collection??"HackerRank",i.kind??"coding",i.title,i.summary,...i.topics].join(" ").toLowerCase().includes(o));return e.jsxs("div",{className:"space-y-6 pb-8",children:[e.jsxs("header",{children:[e.jsx("p",{className:"mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 light:text-emerald-700",children:"React practice"}),e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:"React questions"}),e.jsxs("p",{className:`mt-2 ${n}`,children:[d.length," questions and references for React and JavaScript interviews, with solutions, explanations, and examples."]}),e.jsx("a",{className:`mt-3 inline-block ${l}`,href:"https://www.hackerrank.com/domains/react",target:"_blank",rel:"noopener noreferrer",children:"Open HackerRank’s React catalog ↗"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"react-question-search",className:"mb-2 block text-sm font-medium text-gray-200 light:text-gray-800",children:"Find a question or concept"}),e.jsx("input",{id:"react-question-search",type:"search",value:t,onChange:i=>r(i.target.value),placeholder:"Search sorting, forms, state…",className:"w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 light:border-gray-300 light:bg-white light:text-gray-900"}),e.jsxs("p",{className:`mt-2 ${n}`,role:"status",children:[h.length," of ",d.length," questions"]})]}),h.length===0?e.jsxs("div",{className:f,children:[e.jsxs("p",{className:n,children:["No questions match “",t,"”."]}),e.jsx("button",{className:`mt-3 ${l}`,onClick:()=>r(""),children:"Clear search"})]}):H.map(i=>{const m=h.filter(s=>(s.collection??"HackerRank")===i);return m.length===0?null:e.jsxs("section",{"aria-labelledby":`collection-${i}`,className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h2",{id:`collection-${i}`,className:p,children:Y[i]}),i==="Anduril"&&e.jsx("p",{className:`mt-2 ${n}`,children:"Candidate reports establish the broad tasks. Each practice solution states its assumptions where the original requirements are unavailable. Difficulty labels are study estimates."})]}),e.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:m.map(s=>e.jsxs(u,{to:`${c}/${s.slug}`,className:"group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-colors hover:border-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-200 light:bg-gray-50 light:hover:border-blue-500",children:[e.jsxs("div",{className:"mb-3 flex items-center justify-between gap-3",children:[e.jsx("span",{className:"font-mono text-xs text-gray-500",children:String(d.indexOf(s)+1).padStart(2,"0")}),e.jsx(A,{value:s.difficulty})]}),e.jsx("h3",{className:"font-semibold text-white group-hover:text-blue-300 light:text-gray-900 light:group-hover:text-blue-700",children:s.title}),s.kind&&s.kind!=="coding"&&e.jsx("p",{className:"mt-2 text-xs font-medium text-emerald-400 light:text-emerald-700",children:s.collection==="Reference"?"Interview reference":s.kind==="design"?"System design / problem framing":"Interview discussion"}),e.jsx("p",{className:`mt-2 ${n}`,children:s.summary}),e.jsx("div",{className:"mt-4 flex flex-wrap gap-2",children:s.topics.map(g=>e.jsx("span",{className:"rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 light:bg-gray-200 light:text-gray-700",children:g},g))}),e.jsx("p",{className:"mt-4 text-xs font-medium text-blue-400 light:text-blue-700",children:s.collection==="Reference"?"Read reference →":"Read solution →"})]},s.slug))})]},i)})]})}function _({challenge:t}){var v,x,w;const r=T(),[o,h]=y.useState("idle"),i=d.findIndex(a=>a.slug===t.slug),m=d[i-1],s=d[i+1],g=(t.collection??"HackerRank")==="HackerRank",C=t.solutionTitle??"JavaScript + React solution";async function I(){try{await navigator.clipboard.writeText(J(t)),h("copied")}catch{h("failed")}}return e.jsxs("article",{className:"min-w-0 space-y-6 pb-8",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsx(u,{className:l,to:c,children:"← All React questions"}),e.jsxs("label",{className:"flex flex-wrap items-center gap-2 text-xs text-gray-400 light:text-gray-600",children:["Jump to question",e.jsx("select",{"aria-label":"Jump to question",value:t.slug,onChange:a=>r(`${c}/${a.target.value}`),className:"max-w-full rounded-md border border-gray-700 bg-gray-900 px-2 py-2 text-sm text-gray-200 light:border-gray-300 light:bg-white light:text-gray-800",children:d.map((a,j)=>e.jsxs("option",{value:a.slug,children:[j+1,". ",a.title]},a.slug))})]})]}),e.jsxs("header",{children:[e.jsxs("div",{className:"mb-3 flex items-center gap-3",children:[e.jsxs("span",{className:"text-xs text-gray-500",children:["Question ",i+1," of ",d.length," · ",t.collection??"HackerRank"]}),e.jsx(A,{value:t.difficulty})]}),e.jsx("h1",{className:"text-2xl font-bold text-white light:text-gray-900",children:t.title}),e.jsx("p",{className:`mt-2 ${n}`,children:t.summary}),t.sourceUrl?e.jsxs("a",{className:`mt-3 inline-block ${l}`,href:t.sourceUrl,target:"_blank",rel:"noopener noreferrer",children:[t.sourceLabel??(g?"Original question on HackerRank":"Public candidate report")," ↗"]}):t.sourceLabel&&e.jsx("p",{className:`mt-3 ${n}`,children:t.sourceLabel}),(v=t.additionalSources)==null?void 0:v.map(a=>e.jsxs("a",{className:`ml-4 mt-3 inline-block ${l}`,href:a.url,target:"_blank",rel:"noopener noreferrer",children:[a.label," ↗"]},a.url))]}),e.jsxs("section",{className:f,"aria-labelledby":"prompt-heading",children:[e.jsx("h2",{id:"prompt-heading",className:p,children:"Problem prompt"}),e.jsx("p",{className:`mt-3 ${n}`,children:t.prompt}),t.report&&e.jsxs("div",{className:"mt-4 border-l-2 border-emerald-700 pl-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"What was reported"}),e.jsx("p",{className:`mt-2 ${n}`,children:t.report})]}),(x=t.images)==null?void 0:x.map(a=>e.jsxs("figure",{className:"mt-5",children:[e.jsx("a",{href:a.src,target:"_blank",rel:"noopener noreferrer","aria-label":`Open ${t.title} reference image at full size`,className:"block overflow-hidden rounded-lg border border-gray-700 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 light:border-gray-300",children:e.jsx("img",{src:a.src,alt:a.alt,width:a.width,height:a.height,loading:"lazy",decoding:"async",className:"mx-auto block h-auto max-w-full"})}),e.jsxs("figcaption",{className:"mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 light:text-gray-600",children:[e.jsx("a",{href:a.sourceUrl,target:"_blank",rel:"noopener noreferrer",className:"hover:underline",children:"Original HackerRank reference ↗"}),e.jsx("a",{href:a.src,target:"_blank",rel:"noopener noreferrer",className:"text-blue-400 hover:underline light:text-blue-700",children:"Open full size ↗"})]})]},a.src)),e.jsx("h3",{className:"mt-5 text-sm font-semibold text-gray-200 light:text-gray-800",children:t.collection==="Reference"?"What to know":g?"Requirements":"Practice requirements"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${n}`,children:t.requirements.map(a=>e.jsx("li",{children:a},a))}),t.assumptions&&e.jsxs("div",{className:"mt-5",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Assumptions for this answer"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${n}`,children:t.assumptions.map(a=>e.jsx("li",{children:a},a))})]}),e.jsxs("div",{className:"mt-5 border-t border-gray-800 pt-4 light:border-gray-200",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Example interaction"}),e.jsxs("dl",{className:`mt-3 space-y-3 ${n}`,children:[e.jsxs("div",{children:[e.jsx("dt",{className:"font-medium text-gray-200 light:text-gray-800",children:"User actions"}),e.jsx("dd",{className:"mt-1",children:t.example.actions})]}),e.jsxs("div",{children:[e.jsx("dt",{className:"font-medium text-gray-200 light:text-gray-800",children:"Expected result"}),e.jsx("dd",{className:"mt-1",children:t.example.result})]})]})]})]}),t.sampleData&&e.jsxs("section",{"aria-labelledby":"sample-data-heading",className:"min-w-0 space-y-3",children:[e.jsx("h2",{id:"sample-data-heading",className:p,children:t.sampleData.title}),e.jsx("p",{className:n,children:t.sampleData.description}),e.jsx(b,{code:t.sampleData.code,language:"jsx"})]}),e.jsxs("section",{"aria-labelledby":"solution-heading",className:"min-w-0 space-y-3",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3",children:[e.jsx("h2",{id:"solution-heading",className:p,children:C}),e.jsx("button",{onClick:I,className:"rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-700 light:border-gray-300 light:bg-gray-100 light:text-gray-800 light:hover:bg-gray-200",children:o==="copied"?"Copied!":"Copy solution"})]}),t.code&&e.jsx("p",{className:n,children:g?"Use this standalone implementation as a reference. In HackerRank’s starter project, keep its existing component exports and test selectors.":"This implementation follows the practice requirements and assumptions above."}),o!=="idle"&&e.jsx("p",{role:"status",className:n,children:o==="copied"?"Solution copied to clipboard.":"Clipboard access is unavailable. Select and copy the solution below."}),t.code&&e.jsx(b,{code:t.code,language:t.codeLanguage??"jsx"}),(w=t.solutionSections)==null?void 0:w.map(a=>e.jsxs("div",{className:f,children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:a.title}),e.jsx("p",{className:`mt-3 whitespace-pre-line ${n}`,children:a.body}),a.code&&e.jsx("div",{className:"mt-4",children:e.jsx(b,{code:a.code,language:t.codeLanguage??"javascript"})})]},a.title)),t.integrationNotes&&t.integrationNotes.length>0&&e.jsxs("div",{className:f,children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:"Using this solution"}),e.jsx("ul",{className:`mt-2 list-disc space-y-2 pl-5 ${n}`,children:t.integrationNotes.map(a=>e.jsx("li",{className:"whitespace-pre-wrap break-words",children:a},a))})]})]}),e.jsxs("section",{className:f,"aria-labelledby":"approach-heading",children:[e.jsx("h2",{id:"approach-heading",className:p,children:t.kind==="discussion"?"How to answer":"How it works"}),e.jsx("ol",{className:`mt-3 list-decimal space-y-3 pl-5 ${n}`,children:t.steps.map(a=>e.jsx("li",{className:"pl-1",children:a},a))}),e.jsxs("div",{className:"mt-5 border-t border-gray-800 pt-4 light:border-gray-200",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-200 light:text-gray-800",children:t.kind==="discussion"?"Answer guidance":"Time and space"}),e.jsx("p",{className:`mt-2 ${n}`,children:t.complexity})]})]}),e.jsxs("section",{className:f,"aria-labelledby":"pitfalls-heading",children:[e.jsx("h2",{id:"pitfalls-heading",className:p,children:"Common mistakes"}),e.jsx("ul",{className:`mt-3 list-disc space-y-2 pl-5 ${n}`,children:t.pitfalls.map(a=>e.jsx("li",{children:a},a))})]}),e.jsxs("section",{"aria-labelledby":"checks-heading",children:[e.jsx("h2",{id:"checks-heading",className:p,children:"Check your understanding"}),e.jsx("div",{className:"mt-3 overflow-x-auto rounded-lg border border-gray-800 light:border-gray-200",children:e.jsxs("table",{className:"w-full text-left text-sm",children:[e.jsx("thead",{className:"bg-gray-900 text-gray-200 light:bg-gray-100 light:text-gray-800",children:e.jsxs("tr",{children:[e.jsx("th",{scope:"col",className:"px-4 py-3 font-medium",children:"Try this"}),e.jsx("th",{scope:"col",className:"px-4 py-3 font-medium",children:"Expected behavior"})]})}),e.jsx("tbody",{className:"divide-y divide-gray-800 text-gray-400 light:divide-gray-200 light:text-gray-600",children:t.testCases.map(a=>e.jsxs("tr",{children:[e.jsx("td",{className:"px-4 py-3 align-top",children:a.action}),e.jsx("td",{className:"px-4 py-3 align-top",children:a.expected})]},a.action))})]})})]}),e.jsxs("nav",{"aria-label":"React question navigation",className:"flex flex-wrap justify-between gap-4 border-t border-gray-800 pt-5 light:border-gray-200",children:[m?e.jsxs(u,{className:l,to:`${c}/${m.slug}`,children:["← ",m.title]}):e.jsx(u,{className:l,to:c,children:"← All React questions"}),s?e.jsxs(u,{className:l,to:`${c}/${s.slug}`,children:[s.title," →"]}):e.jsx(u,{className:l,to:c,children:"Back to all questions →"})]})]})}function Z(){const{slug:t}=R();if(y.useEffect(()=>{window.scrollTo({top:0,left:0})},[t]),!t)return e.jsx(Q,{});const r=d.find(o=>o.slug===t);return r?e.jsx(_,{challenge:r},t):e.jsxs("div",{className:"space-y-3",children:[e.jsx("h1",{className:p,children:"React question not found"}),e.jsx(u,{className:l,to:c,children:"View all React questions"})]})}export{Z as default};
