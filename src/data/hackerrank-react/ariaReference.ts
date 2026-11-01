import type { ReactChallenge } from './types';

export const ariaReferenceChallenge: ReactChallenge = {
  collection: 'Reference',
  kind: 'discussion',
  slug: 'aria-interview-essentials',
  title: 'ARIA Interview Essentials',
  difficulty: 'Medium',
  topics: ['Accessibility', 'ARIA', 'React', 'Keyboard interaction'],
  summary: 'Learn ten useful ARIA attributes, two autocomplete essentials, and common implementation mistakes.',
  sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes',
  sourceLabel: 'MDN ARIA reference',
  additionalSources: [
    { label: 'W3C combobox pattern', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/' },
    { label: 'W3C guidance on using ARIA', url: 'https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/' },
    { label: 'MDN aria-disabled', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled' },
    { label: 'MDN aria-hidden', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden' },
  ],
  prompt: 'Explain how ARIA communicates accessible names, relationships, and state. Choose the appropriate attributes for an icon button, expandable panel, form error, toggle, and autocomplete input, and explain which behavior JavaScript must still implement.',
  assumptions: [
    'This is an interview reference, not a reported company problem. The examples illustrate attributes rather than complete standalone components.',
    'State values, event handlers, and option data referenced by the snippets are supplied by the surrounding component. IDs must be unique on the page; use useId when a reusable component needs its own IDs.',
    'Use attributes on elements and roles that support them. Complex widgets still need their expected keyboard behavior and focus management.',
  ],
  requirements: [
    'Distinguish an accessible name from additional descriptive text.',
    'Keep expanded, selected, pressed, and invalid states synchronized with the interface.',
    'Explain the relationship between a controlling element and the element it references.',
    'Start with native HTML controls, then add ARIA where information is missing.',
  ],
  example: {
    actions: 'An interviewer asks how you would make a button that opens extra details accessible.',
    result: 'Use a native button with visible text, aria-expanded bound to the open state, and aria-controls pointing to the details element. Implement the toggle and visibility separately.',
  },
  solutionTitle: 'ARIA attributes and examples',
  code: '',
  codeLanguage: 'jsx',
  solutionSections: [
    {
      title: '1. aria-label — give a control a name',
      body: 'Use a short accessible name for a control whose visible contents do not explain its action, such as an icon-only close button. A button with clear visible text already has a name; a native form input should normally have a visible label.',
      code: `<button type="button" aria-label="Close dialog" onClick={onClose}>
  <span aria-hidden="true">×</span>
</button>`,
    },
    {
      title: '2. aria-labelledby — use existing text as the name',
      body: 'Reference the ID of text that names the element. This lets the visible heading and accessible name stay aligned. The value is an element ID, not the label text itself.',
      code: `<section aria-labelledby="billing-title">
  <h2 id="billing-title">Billing details</h2>
  <p>Review your saved billing information.</p>
</section>`,
    },
    {
      title: '3. aria-describedby — attach extra information',
      body: 'Reference instructions or an error message that explains an already named control. The distinction to remember: labelledby names the element; describedby adds information about it. Multiple description IDs can be separated by spaces.',
      code: `<>
  <label htmlFor="password">Password</label>
  <input id="password" type="password" aria-describedby="password-help" />
  <p id="password-help">Use at least 12 characters.</p>
</>`,
    },
    {
      title: '4–5. aria-expanded and aria-controls — connect a disclosure',
      body: 'aria-expanded communicates whether associated content is open. aria-controls points to the controlled element’s ID. Neither attribute changes visibility: React state and the hidden attribute handle that in this example.',
      code: `<>
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
</>`,
    },
    {
      title: '6. aria-selected — identify a selected option or tab',
      body: 'Use this state on a role that supports selection, such as an option or tab. It does not mean that every focused element is selected. The widget decides how focus and selection relate, and must implement its keyboard interaction.',
      code: `// One option rendered inside the widget's role="listbox" container.
<li role="option" aria-selected={option.id === selectedId}>
  {option.label}
</li>`,
    },
    {
      title: '7. aria-pressed — describe a toggle button',
      body: 'Expose whether a toggle button is on or off. Keep the button’s label stable so the pressed state communicates the change. This is different from whether an ordinary button is being physically held down.',
      code: `<button
  type="button"
  aria-pressed={isMuted}
  onClick={() => setIsMuted((previous) => !previous)}
>
  Mute
</button>`,
    },
    {
      title: '8. aria-invalid — expose a validation error',
      body: 'Set aria-invalid when the control fails validation, and provide useful error text. The attribute does not perform validation or explain the error by itself. Link the message with aria-describedby when it is present.',
      code: `<>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={Boolean(error)}
    aria-describedby={error ? 'email-error' : undefined}
  />
  {error && <p id="email-error">{error}</p>}
</>`,
    },
    {
      title: '9. aria-live — announce changing content',
      body: 'A live region lets assistive technology announce updates without moving keyboard focus. Use polite for ordinary updates such as a result count; assertive is reserved for urgent messages that justify interrupting speech. Keep the region mounted, then update its text.',
      code: `<p aria-live="polite">
  {resultCount} results found
</p>`,
    },
    {
      title: '10. aria-hidden — exclude decorative content',
      body: 'aria-hidden removes an element and its descendants from the accessibility tree. It does not visually hide them or remove keyboard focus. Use it for redundant decoration; never place it on a focusable control or a container holding focusable controls.',
      code: `<button type="button" onClick={openSearch}>
  <span aria-hidden="true">🔍</span> Search
</button>`,
    },
    {
      title: 'Autocomplete: aria-autocomplete and aria-activedescendant',
      body: 'aria-autocomplete="list" describes an input with suggested text completions in a popup. aria-activedescendant identifies the active suggestion while DOM focus remains on the input. Reference only a rendered option. The component must still implement filtering, arrow-key navigation, selection, dismissal, and any required loading behavior.',
      code: `<>
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
</>`,
    },
    {
      title: 'Trap: ARIA describes behavior; it does not implement it',
      body: 'A role="button" declaration on a div does not add button keyboard behavior. A native button supplies expected focus and activation behavior. ARIA states must accurately reflect what the UI does; aria-expanded alone does not open a panel.',
      code: `<button type="button" onClick={save}>
  Save
</button>`,
    },
    {
      title: 'Trap: aria-disabled does not block activation',
      body: 'aria-disabled="true" communicates a disabled state but does not prevent clicks, change focusability, or apply disabled styling. Native disabled handles the usual behavior for supported form controls. If you intentionally keep an unavailable custom control discoverable with aria-disabled, you must prevent its actions yourself.',
      code: `<button type="button" disabled={isSaving} onClick={save}>
  Save
</button>`,
    },
    {
      title: 'Trap: aria-hidden is not a visibility or focus control',
      body: 'Use actual visibility and focus behavior when content becomes unavailable. For a collapsed disclosure, hidden removes the panel from display and normal interaction. Hiding a focused subtree also requires deciding where focus should move; aria-hidden alone cannot solve that.',
      code: `<div id="details-panel" hidden={!open}>
  <a href="/details">Read more</a>
</div>`,
    },
  ],
  steps: [
    'Identify the native element that matches the interaction before adding a role or state.',
    'Give the control a clear name, then add any extra description separately.',
    'Connect related elements with unique IDs and keep state attributes synchronized with React state.',
    'Explain the keyboard interaction and focus behavior that accompany the chosen widget pattern.',
  ],
  pitfalls: [
    'Do not use aria-label as a replacement for visible labels everywhere; it can override the name users expect from visible text.',
    'Do not put aria-selected on an arbitrary button. Use the state supported by the widget’s role, such as aria-pressed for a toggle button.',
    'Never leave aria-activedescendant pointing to an absent or hidden option.',
    'Do not confuse describing a disabled or hidden state with implementing the behavior.',
  ],
  complexity: 'This reference concerns accessible semantics and interaction. Algorithmic complexity depends on the component using these attributes, not the attributes themselves. In an interview, explain the accessible name, relevant state, keyboard controls, and focus behavior.',
  integrationNotes: [
    'The examples are JSX fragments. Keep the aria-* attribute names hyphenated in React and supply the surrounding state and event handlers.',
    'For a full autocomplete implementation, see React Autocomplete Search in the Anduril question group. These snippets focus on the relevant accessibility attributes.',
  ],
  testCases: [
    { action: 'An icon-only button has no visible action text.', expected: 'Supply an accessible name, such as aria-label="Close dialog", and hide redundant decoration.' },
    { action: 'Explain labelledby versus describedby.', expected: 'The first provides the name; the second references additional instructions or explanatory text.' },
    { action: 'Open and close a disclosure.', expected: 'The content visibility and aria-expanded value change together, and aria-controls references its panel.' },
    { action: 'Navigate autocomplete options with the keyboard.', expected: 'The implemented widget keeps input focus and updates aria-activedescendant to a rendered option.' },
    { action: 'Set aria-disabled on a clickable element.', expected: 'Explain that activation is still possible unless the implementation prevents it.' },
  ],
};
