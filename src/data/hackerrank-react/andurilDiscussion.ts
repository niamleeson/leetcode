import type { ReactChallenge } from './types';

export const andurilDiscussionChallenges: ReactChallenge[] = [
  {
    slug: 'anduril-object-classification',
    collection: 'Anduril',
    kind: 'design',
    title: 'Known / Unknown Objects — Frontend Design',
    difficulty: 'Hard',
    topics: ['System design', 'Live data', 'State management', 'Virtualization'],
    summary: 'Design an interface for thousands of API objects whose classification can change.',
    sourceUrl: 'https://discuss.frontendlead.com/t/anduril-senior-front-end-engineer-onsite-interview/1905',
    sourceLabel: 'Candidate report — FrontendLead, May 2025',
    report: 'A May 18, 2025 anonymous senior frontend interview report describes receiving thousands of objects from an API and flagging them as known or unknown. The report does not publish the API, update frequency, or editing rules.',
    prompt: 'Design a frontend that displays thousands of objects from an API and supports classifying them as known or unknown. Explain the data model, UI state, update flow, rendering performance, and failure behavior.',
    assumptions: [
      'For this practice answer, objects have stable IDs and server-assigned versions. Updates can arrive repeatedly and out of order.',
      'Users may change classifications, and other users may edit the same object. The server remains authoritative.',
      'The practice UI contains a filterable object list and a details panel. A saved label appears only after the server confirms the change.',
    ],
    requirements: [
      'Clarify what known and unknown mean, who may change those values, and how fresh the interface must be.',
      'Keep the list and details panel consistent while new object data arrives.',
      'Render large datasets without mounting every row, and preserve selection during updates.',
      'Expose pending edits, conflicts, failed saves, and stale connections.',
    ],
    example: {
      actions: 'Select object-123 at version 7 and mark it known. Before the save completes, another user changes the same object to version 8.',
      result: 'The server rejects the stale version-7 edit. The UI loads version 8, retains the user’s intended change, and asks them to review it before retrying.',
    },
    solutionTitle: 'Frontend system design solution',
    code: '',
    solutionSections: [
      {
        title: 'Clarify the contract',
        body: 'Ask what classification represents, whether users edit it, the expected object count, update rate, and acceptable display delay. Establish whether every intermediate event matters or only each object’s latest state. These answers determine transport, retention, and batching choices.',
      },
      {
        title: 'Give each object one canonical record',
        body: 'Store server records by ID. Keep ordered IDs, selected ID, filters, and pending edits separately. Both the list and details panel look up the same record. An unsaved edit lives outside the server record so a background update cannot silently erase it.',
        code: `const state = {
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
};`,
      },
      {
        title: 'Load a snapshot, then apply ordered updates',
        body: 'Fetch an initial page or snapshot, then use polling, server-sent events, or WebSockets according to required freshness and API support. Ignore an update when its version is no newer than the stored version. A version orders changes for one object; a stream cursor detects gaps across the feed. After a gap or reconnect, resynchronize from a snapshot or supported replay cursor. Apply deletions explicitly so removed objects do not linger.',
      },
      {
        title: 'Bound the rendering work',
        body: 'Virtualize the list so only visible rows and a small buffer mount. Subscribe rows to their own records, or preserve unchanged row props so memoization can help. Filter or sort on the server when the loaded dataset is too large for frequent client scans. Batch display updates, coalescing by ID only when intermediate states are unnecessary. A plain JavaScript object spread still copies the entire dictionary; use a suitable store or batch those immutable copies instead of assuming every React update is constant-time.',
      },
      {
        title: 'Save changes with conflict detection',
        body: 'Send the desired classification with the version on which the edit was based. Keep the row marked pending until the server acknowledges the change, and prevent duplicate submissions for that object. On success, merge the returned record using the same version rule. On conflict, reload the object and let the user review their retained edit. On network failure, keep the draft and offer a retry. Optimistic presentation is another choice, but it requires rollback and protection against overwriting a newer update.',
        code: `// Example request contract; the server enforces the version check.
const change = {
  objectId: 'object-123',
  classification: 'known',
  expectedVersion: 7,
};`,
      },
      {
        title: 'Separate freshness from classification',
        body: 'A disconnected feed does not change an object’s classification. Show connection status and last-update time independently. Preserve selection through unrelated updates, explain when the selected object is removed, and distinguish loading failures from save failures. Verify keyboard navigation, clear labels, and status announcements as part of the interface.',
      },
    ],
    steps: [
      'Establish the domain meaning, data volume, update rate, and edit permissions.',
      'Separate canonical server records from selection, filtering, and pending edits.',
      'Specify snapshot loading, update ordering, deletion handling, and resynchronization.',
      'Choose rendering and storage strategies that match the measured update workload.',
      'Walk through a successful save, a stale edit, a failed request, and a disconnected feed.',
    ],
    pitfalls: [
      'Do not change an object to unknown merely because its data becomes stale.',
      'A late save response must not overwrite a newer stream version.',
      'Virtualization limits mounted rows; it does not automatically make full-array filtering or immutable dictionary copies constant-time.',
      'Do not discard intermediate events unless the product only needs the latest state.',
    ],
    complexity: 'For N loaded objects and V mounted rows, record storage is O(N) and mounted list rendering is O(V). ID lookup is typically O(1). A client filter scan is O(N); sorting is O(N log N). Copying an N-entry object for an immutable update is O(N), even when only one record changes. Batching reduces how often that copy occurs.',
    testCases: [
      { action: 'Receive version 6 after storing version 7.', expected: 'Keep version 7; the UI does not move backward.' },
      { action: 'Select an object while unrelated rows update.', expected: 'The selection and any unsaved edit remain intact.' },
      { action: 'Submit an edit after another user changes the object.', expected: 'Detect the version conflict and retain the user’s draft for review.' },
      { action: 'Lose the live connection.', expected: 'Mark the feed stale and resynchronize on reconnect; classifications remain unchanged.' },
      { action: 'Scroll through thousands of records.', expected: 'Only visible rows and a buffer are mounted.' },
    ],
  },
  {
    slug: 'anduril-scheduler',
    collection: 'Anduril',
    kind: 'design',
    title: 'React Scheduler — Clarify and Design',
    difficulty: 'Medium',
    topics: ['Requirements', 'Forms', 'Time zones', 'State design'],
    summary: 'Clarify the reported scheduler task, then work through an explicitly assumed appointment-calendar design.',
    sourceUrl: 'https://www.jointaro.com/interviews/companies/anduril/experiences/software-developer-seattle-wa-december-16-2024-no-offer-neutral-557516d5/',
    sourceLabel: 'Candidate report — Taro, December 2024',
    report: 'A December 16, 2024 Seattle account on Taro identifies a frontend role and names a React scheduler exercise. It does not explain whether scheduling means calendar appointments, timed jobs, or something else. The original complete specification is unavailable in that report.',
    prompt: 'The reported task is to create a scheduler app in React. Begin by establishing what is being scheduled and the required operations. The worked design below assumes an appointment calendar solely to provide a concrete practice example.',
    assumptions: [
      'Practice design only: schedule non-recurring appointments on one calendar, with a title, start time, and end time.',
      'Support create, edit, delete, and an agenda sorted by start time. Overlapping appointments are rejected; adjacent appointments are allowed.',
      'Appointments use an explicitly selected calendar time zone. Persistence is handled by an API. None of these details is established by the candidate report.',
    ],
    requirements: [
      'Clarify calendar appointments versus timed task execution before designing components.',
      'For this practice version, validate required fields and require the end to occur after the start.',
      'Keep saved appointments separate from the editable draft and surface failed saves.',
      'Define time-zone interpretation, overlap rules, and persistence before implementation.',
    ],
    example: {
      actions: 'With an appointment from 09:00 to 10:00 in the calendar’s zone, try adding one at 09:30–10:30 and then one at 10:00–11:00.',
      result: 'Under the practice overlap rule, the first attempt is rejected and the adjacent appointment is accepted. This behavior is an assumed practice requirement.',
    },
    solutionTitle: 'Clarification and practice design answer',
    code: '',
    solutionSections: [
      {
        title: 'Ask what scheduler means',
        body: 'First ask whether the user is booking appointments, arranging jobs, or executing callbacks at future times. Ask which operations, views, data inputs, and outputs are expected. Also establish recurrence, time zones, persistence, and the time available. A calendar interface and a JavaScript task scheduler require different models; the public report alone does not choose between them.',
      },
      {
        title: 'Practice contract: an appointment agenda',
        body: 'For this worked example, use a form plus an agenda rather than starting with a complex calendar grid. A Scheduler parent owns saved appointments and the selected calendar zone. AppointmentForm owns an editing draft and validation messages. Agenda derives the sorted visible appointments. Store the editing appointment’s ID separately, and discard or save its draft explicitly.',
      },
      {
        title: 'Make time and overlap rules explicit',
        body: 'Retain text input while the user edits. Convert a complete date/time using the chosen calendar zone before comparing instants, and store start/end instants along with the zone used for display. A datetime-local input does not include a time zone, so parsing it as if it were UTC would change the appointment. Ask the user to resolve ambiguous daylight-saving times, and reject nonexistent local times. For the practice overlap rule, two intervals overlap when startA < endB and startB < endA. Exclude the edited appointment itself when checking conflicts.',
      },
      {
        title: 'Validate, save, and update the agenda',
        body: 'Validate a nonblank title, valid times, start before end, and no conflicting appointment. Send the draft to the API, show a pending state, and only add or replace the saved appointment after confirmation. Preserve the draft if saving fails. Treat deletion similarly. The server must also enforce overlap rules to catch simultaneous bookings. Derive the agenda from saved appointments; sort a copy rather than mutating state.',
      },
      {
        title: 'Choose extensions after the basic flow works',
        body: 'Build keyboard-accessible inputs and explicit edit/delete controls first. Add day/week views, drag-and-drop, recurrence, or reminders only if requested. A recurring 09:00 appointment needs a recurrence rule and calendar zone; repeatedly adding 24 hours can shift its local time across daylight-saving changes. If the interviewer instead means timed job execution, replace this calendar design with the agreed queue, execution, cancellation, and clock semantics.',
      },
    ],
    steps: [
      'Get a concrete example of the scheduling input and expected output.',
      'Agree on a minimal feature set and document the assumptions.',
      'Separate saved appointments, draft fields, selected date or zone, and request status.',
      'Define validation and conflict handling before wiring up the form and agenda.',
      'Exercise time boundaries and failed saves before adding richer calendar interactions.',
    ],
    pitfalls: [
      'Do not present the assumed calendar design as the original interview specification.',
      'A local date/time string has no offset; do not silently interpret it in the wrong zone.',
      'Remember to exclude the current appointment when validating an edit against overlaps.',
      'A client conflict check alone cannot prevent concurrent server bookings.',
    ],
    complexity: 'For N appointments, a simple conflict scan costs O(N), deriving a sorted agenda costs O(N log N), and stored appointments require O(N) space. A visible-date filter is O(N) without an index. These bounds describe the assumed practice design, not an unpublished interview solution.',
    testCases: [
      { action: 'Begin the interview with only the word scheduler.', expected: 'Clarify the domain and expected operations before choosing an implementation.' },
      { action: 'Submit an end time at or before the start.', expected: 'The practice form shows a validation error and retains the draft.' },
      { action: 'Add an appointment starting when another ends.', expected: 'The practice half-open interval rule permits it.' },
      { action: 'Edit an appointment without changing its time.', expected: 'It does not conflict with itself.' },
      { action: 'A save fails or the server reports a conflict.', expected: 'Keep the draft, explain the error, and allow correction or retry.' },
    ],
  },
];
