import type { ReactChallenge } from '../types';
import { defineChallenge } from './shared';

const premiumAssumption = 'The public catalog establishes the challenge theme and level; the full premium specification was not available. The requirements below define this original practice implementation.';
const source = (slug: string) => 'https://www.greatfrontend.com/questions/user-interface/' + slug + '/react';

export const greatFrontendAdvanced: ReactChallenge[] = [
  defineChallenge({
    slug: 'gfe-accordion-iii', title: 'Accordion III', difficulty: 'Medium',
    summary: 'Keyboard accessible expandable sections.',
    prompt: 'Create a reusable collection of disclosure sections. Readers can reveal several answers, navigate headers with the keyboard, and identify the relationship between each header and panel with assistive technology.',
    topics: ['Accessibility', 'Keyboard Events', 'State Management'],
    requirements: ['Use heading-wrapped buttons with aria-expanded and aria-controls.', 'Support Enter/Space activation through native buttons and ArrowUp/ArrowDown/Home/End header navigation.', 'Keep panels mounted with stable IDs and hide closed content.', 'Allow multiple open sections and independent component instances.'],
    example: { actions: 'Open Shipping, press End, then activate Returns.', result: 'Both panels are expanded and focus is on Returns.' },
    steps: ['Store expanded item IDs in a Set.', 'Use useId for panel/header relationships.', 'Move focus through header refs without changing expansion.'],
    pitfalls: ['Using clickable headings removes native button activation.', 'Moving keyboard focus must not collapse an unrelated panel.'],
    complexity: 'O(n) render and Set copy per toggle; O(n) state/refs.',
    testCases: [{ action: 'Press ArrowUp on the first header.', expected: 'Focus wraps to the final header.' }, { action: 'Open two sections.', expected: 'Both aria-expanded values are true.' }],
    assumptions: [premiumAssumption, 'Multiple simultaneous open panels and wrapping arrow navigation are supported.'], sourceUrl: source('accordion-iii'),
    code: String.raw`import React, { useId, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-auth-code-input', title: 'Auth Code Input', difficulty: 'Hard',
    summary: 'Six digit entry with paste and focus handling.',
    prompt: 'Build a six-position numeric verification input. Typing advances focus, corrections stay predictable, and a pasted code fills consecutive positions. Expose a single completion callback and display the assembled value.',
    topics: ['Forms', 'Refs', 'Keyboard Events'],
    requirements: ['Accept only ASCII digits in six controlled inputs.', 'Advance after entry; support paste, Backspace, Delete, arrow keys, Home and End.', 'Call onComplete once for each newly completed code.', 'Label every digit and preserve leading zeros.'],
    example: { actions: 'Paste 012345 into the first input.', result: 'All six slots fill and completion receives "012345".' },
    steps: ['Represent the code as an array of six strings.', 'Share one write function between typing and paste.', 'Use a previous-code ref to avoid duplicate completion notifications.'],
    pitfalls: ['Numeric conversion destroys leading zeros.', 'A maxLength of one can truncate browser autofill before distribution.'],
    complexity: 'O(k) update and render for k slots (six in the demo).',
    testCases: [{ action: 'Paste a code containing spaces.', expected: 'Only digits populate the slots.' }, { action: 'Backspace from an empty slot.', expected: 'The preceding slot clears and receives focus.' }],
    assumptions: [premiumAssumption, 'The code is exactly six digits; verification against a server is outside this input component.'], sourceUrl: source('auth-code-input'),
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-data-table-iv', title: 'Data Table IV', difficulty: 'Hard',
    summary: 'Configurable columns, filtering, sorting and pagination.',
    prompt: 'Create a table driven by row data and column definitions. Apply a global search and individual column filters, then a stable sort, then pagination. Column definitions provide accessors, optional renderers and comparison functions.',
    topics: ['Data Modeling', 'Sorting', 'Filtering', 'Pagination'],
    requirements: ['Accept arbitrary rows, columns and a row-key function.', 'Filter before sorting before slicing a page.', 'Support ascending/descending sorting and per-column filters.', 'Clamp pages when data changes; reset pagination after filter or page-size changes.', 'Expose semantic table headers, sort state and an empty result.'],
    example: { actions: 'Search design, sort Age descending, then choose two rows per page.', result: 'Matching rows are sorted before the first two are shown.' },
    steps: ['Define accessor/render/compare hooks on columns.', 'Derive the filtered and sorted array without mutating props.', 'Clamp the page and slice only after all transformations.'],
    pitfalls: ['Sorting only the current page produces globally incorrect results.', 'A filter can leave the current page outside the result range.'],
    complexity: 'O(nc + n log n) per derived update and O(n) extra memory for n rows and c columns.',
    testCases: [{ action: 'Filter from page three to one matching row.', expected: 'The matching row appears on page one.' }, { action: 'Sort a numeric custom accessor.', expected: 'Numeric ordering is used without changing the source rows.' }],
    assumptions: [premiumAssumption, 'Filtering and sorting are client-side; text filters are case-insensitive substrings.'], sourceUrl: source('data-table-iv'),
    code: String.raw`import React, { useMemo, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-file-explorer-iii', title: 'File Explorer III', difficulty: 'Medium',
    summary: 'Hierarchical navigation rendered as flat sibling rows.',
    prompt: 'Render a directory hierarchy as a flat tree: every visible file or folder is a direct child of one tree container. Preserve depth and sibling metadata for assistive technology while supporting expansion and keyboard navigation.',
    topics: ['Trees', 'Accessibility', 'Keyboard Events'],
    requirements: ['Flatten only expanded branches; never nest treeitem elements.', 'Expose aria-level, aria-posinset, aria-setsize and folder expansion.', 'Support Up/Down/Home/End, Right to expand or enter, Left to collapse or visit the parent.', 'Use one tabbable row and activate files with Enter or click.'],
    example: { actions: 'Expand src, focus App.jsx, then press Left.', result: 'Focus moves to src and all rows remain DOM siblings.' },
    steps: ['Traverse expanded nodes into visible row descriptors.', 'Derive parent, depth and sibling positions during traversal.', 'Use a roving tab index and row refs to implement tree keys.'],
    pitfalls: ['Visual indentation alone does not expose hierarchy to screen readers.', 'Collapsing a folder must not strand focus on an unmounted child.'],
    complexity: 'O(v) flatten/render for v visible nodes; O(v + e) space including expanded IDs.',
    testCases: [{ action: 'Expand nested folders.', expected: 'All visible treeitems share the tree as their parentElement.' }, { action: 'Press Left on a child file.', expected: 'Its parent folder receives focus.' }],
    assumptions: [premiumAssumption, 'Node IDs are unique; a children array marks a folder, including an empty folder.'], sourceUrl: source('file-explorer-iii'),
    code: String.raw`import React, { useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-image-carousel-iii', title: 'Image Carousel III', difficulty: 'Hard',
    summary: 'Smooth wrapping transitions using at most three slides.',
    prompt: 'Build a looping image carousel whose DOM size stays constant as the image collection grows. Animate to the neighboring slide, then recenter without a visible jump. Provide previous/next controls, slide selectors and an optional autoplay mode.',
    topics: ['Animation', 'Performance', 'Timers'],
    requirements: ['Render only previous, current and next images.', 'Animate forward and backward across either collection boundary.', 'Prevent overlapping transitions and clean up transition fallback timers.', 'Support labeled controls, keyboard arrows and pausing autoplay while hovered or focused.'],
    example: { actions: 'From the final slide, press Next.', result: 'The first slide enters smoothly and only three image elements remain.' },
    steps: ['Keep a logical index separate from the temporary track offset.', 'After transitionend, update the logical index and disable transition while recentering.', 'Use a fallback timeout and a ref lock to finish each transition exactly once.'],
    pitfalls: ['Reversing from the last slide to the first can animate across the entire track.', 'A timeout and transitionend must not advance twice.'],
    complexity: 'O(1) slide DOM and transition state; O(n) pagination controls.',
    testCases: [{ action: 'Navigate backward from slide one.', expected: 'The last image becomes current after one transition.' }, { action: 'Send repeated Next clicks during a transition.', expected: 'Exactly one navigation completes.' }],
    assumptions: [premiumAssumption, 'Adjacent navigation slides; selecting a distant dot changes immediately. Autoplay is off by default.'], sourceUrl: source('image-carousel-iii'),
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-modal-dialog-iv', title: 'Modal Dialog IV', difficulty: 'Hard',
    summary: 'Modal focus containment and restoration.',
    prompt: 'Create a reusable modal with a title, body and actions. Opening it transfers focus inside, keyboard focus cannot escape, and dismissal restores the element that launched it. Support Escape, a close control and backdrop dismissal.',
    topics: ['Accessibility', 'Focus Management', 'Effects'],
    requirements: ['Use native dialog.showModal for modal semantics and background inertness.', 'Focus the first action when opening and restore the previous focus on every closing path.', 'Handle Tab/Shift+Tab wrapping and Escape.', 'Dismiss backdrop clicks without dismissing clicks on content; release scroll locks on cleanup.'],
    example: { actions: 'Open the dialog, Shift+Tab from its first button, then press Escape.', result: 'Focus wraps to its last action, then returns to the launch button.' },
    steps: ['Record activeElement before opening the native dialog.', 'Collect enabled tabbable controls when a Tab key arrives.', 'Close through a shared state callback and restore focus during cleanup.'],
    pitfalls: ['Rendering an open attribute alone does not create a modal dialog.', 'Focus restoration must also run when a parent removes the modal.'],
    complexity: 'O(f) per Tab key for f focusable descendants; O(1) stored state.',
    testCases: [{ action: 'Press Tab on the last action.', expected: 'Focus wraps to the first action.' }, { action: 'Dismiss via backdrop or Escape.', expected: 'The dialog closes and launcher regains focus.' }],
    assumptions: [premiumAssumption, 'Requires a browser with native HTMLDialogElement.showModal. The demo opens one modal at a time.'],
    integrationNotes: ['Native dialog supplies background inertness and assistive technology modal behavior. A lightweight jsdom dialog shim is needed in unit tests; verify native top-layer behavior in a browser.'], sourceUrl: source('modal-dialog-iv'),
    code: String.raw`import React, { useEffect, useId, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-nested-checkboxes', title: 'Nested Checkboxes', difficulty: 'Hard',
    summary: 'Tri-state selection across a hierarchy.',
    prompt: 'Display nested choices whose parent state summarizes every descendant leaf. A parent selects or clears its entire subtree. Partial selection must appear as a mixed checkbox and update all affected ancestors.',
    topics: ['Trees', 'Derived State', 'Accessibility'],
    requirements: ['Store selected leaves and derive checked/mixed parent states.', 'Toggle every leaf under a selected parent.', 'Set the DOM indeterminate property and aria-checked="mixed".', 'Respect initial leaf selection and allow arbitrary depth.'],
    example: { actions: 'Select Apples inside Fruit.', result: 'Fruit and Grocery become mixed; selecting Grocery checks all leaves.' },
    steps: ['Index the descendant leaves once for each node.', 'Count selected leaves to derive each node state.', 'Toggle a subtree with one immutable Set update.'],
    pitfalls: ['indeterminate is a DOM property rather than a normal JSX checkbox attribute.', 'Independent parent booleans can disagree with descendant state.'],
    complexity: 'O(nh) indexing/storage and render in the worst case for n nodes and height h; toggles touch the subtree leaves.',
    testCases: [{ action: 'Select one leaf then its parent.', expected: 'The parent changes mixed → checked and all descendants become checked.' }, { action: 'Clear the root.', expected: 'Every descendant is unchecked.' }],
    assumptions: ['Public requirements were available. This original implementation normalizes checked/mixed state from leaf selection; a checked parent initializes all descendants as checked.', 'Nodes use unique IDs, name labels and optional children arrays.'], sourceUrl: source('nested-checkboxes'),
    code: String.raw`import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-pixel-art', title: 'Pixel Art', difficulty: 'Medium',
    summary: 'Paint a grid with pointer strokes and a palette.',
    prompt: 'Make a small pixel editor with selectable colors, an eraser and a clear action. Users can paint a continuous pointer stroke across cells and can also paint an individual focused cell with the keyboard.',
    topics: ['Pointer Events', 'State Management', 'CSS Grid'],
    requirements: ['Render a configurable square grid and color palette.', 'Paint on pointer down and while dragging; stop on pointerup, pointercancel or window blur.', 'Offer an eraser, clear action, and keyboard activation.', 'Disable browser touch scrolling only on the drawing surface.'],
    example: { actions: 'Choose blue and drag over three cells.', result: 'Those cells stay blue after the pointer is released.' },
    steps: ['Store each cell color in an immutable array.', 'Keep stroke activity in a ref so pointer events see it immediately.', 'Use hit testing during pointer move for touch and pen input.'],
    pitfalls: ['Pointer release outside the grid must end the stroke.', 'Touch implicit pointer capture prevents relying only on pointerenter.'],
    complexity: 'O(n²) grid render and immutable paint update; O(n²) memory.',
    testCases: [{ action: 'Paint, release outside the grid, then enter a new cell.', expected: 'The new cell is unchanged.' }, { action: 'Use the eraser on a colored pixel.', expected: 'Its background returns to white.' }],
    assumptions: [premiumAssumption, 'The demo is an 8×8 grid. Colors are local state; no image export is required.'], sourceUrl: source('pixel-art'),
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-progress-bars-iv', title: 'Progress Bars IV', difficulty: 'Hard',
    summary: 'A three-slot progress queue with pause and resume.',
    prompt: 'Add independent progress jobs to a queue. At most three may advance at once. Each running job can pause without losing work; queued jobs use the newly available slot. A resumed job rejoins the queue, and a global pause freezes every job.',
    topics: ['Scheduling', 'Timers', 'State Machines'],
    requirements: ['Enforce a hard concurrency cap of three.', 'Track queued, running, paused and complete states.', 'Preserve progress on pause/resume and promote waiting jobs in order.', 'Use elapsed time and clean up the scheduler timer.', 'Expose labeled progress elements and global pause/reset controls.'],
    example: { actions: 'Add four jobs and pause the first.', result: 'The first freezes and the fourth starts; only three are running.' },
    steps: ['Centralize slot admission in a pure scheduling helper.', 'Advance running jobs from elapsed clock time in one interval.', 'Schedule after completion, pause, resume and insertion.'],
    pitfalls: ['A separate interval per job makes the concurrency limit difficult to enforce.', 'Resuming must not create a fourth running job.'],
    complexity: 'O(n log n) worst-case work per scheduler tick due to queue sorting; O(n) job storage.',
    testCases: [{ action: 'Add five jobs.', expected: 'Three run and two remain queued.' }, { action: 'Pause all, wait, then resume.', expected: 'Progress is unchanged during the pause and continues afterward.' }],
    assumptions: [premiumAssumption, 'Each job takes two seconds of active time. Paused jobs release their slot, and resumed jobs join behind existing queued jobs.'], sourceUrl: source('progress-bars-iv'),
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-selectable-cells', title: 'Selectable Cells', difficulty: 'Hard',
    summary: 'Drag a rectangular grid selection in any direction.',
    prompt: 'Build a grid where a pointer drag selects the rectangle between the starting and current cell. Selection should work in every direction, finish even when the pointer leaves the board, and have a keyboard equivalent.',
    topics: ['Pointer Events', 'Geometry', 'Accessibility'],
    requirements: ['Derive a rectangular selection using minimum and maximum row/column coordinates.', 'Use pointer capture and coordinate hit testing for mouse, touch and pen.', 'Finish on pointerup/cancel and support Escape to clear.', 'Support arrow navigation, Shift+Arrow range extension, Space selection and accessible cell state.'],
    example: { actions: 'Drag from row three, column four to row one, column two.', result: 'Nine cells in the inclusive rectangle are selected.' },
    steps: ['Track anchor and endpoint rather than every cell event.', 'Convert pointer coordinates to clamped row and column values.', 'Derive aria-selected and styles from the bounding rectangle.'],
    pitfalls: ['Only tracking pointerenter misses touch movement under pointer capture.', 'Dragging upward or leftward requires min/max bounds.'],
    complexity: 'O(rc) rendering for r rows and c columns; O(1) selection state.',
    testCases: [{ action: 'Shift+ArrowRight then Shift+ArrowDown.', expected: 'A 2×2 rectangle is selected.' }, { action: 'Drag from bottom-right to top-left.', expected: 'The same inclusive rectangle is selected as the reverse drag.' }],
    assumptions: [premiumAssumption, 'A new unmodified drag replaces the previous rectangle. Multiple disjoint ranges are outside this practice contract.'], sourceUrl: source('selectable-cells'),
    code: String.raw`import React, { useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-tabs-iii', title: 'Tabs III', difficulty: 'Medium',
    summary: 'Accessible tabs with roving keyboard focus.',
    prompt: 'Implement a reusable tab list with linked panels, one selected tab and predictable keyboard navigation. Support horizontal and vertical orientation and both automatic and manual activation.',
    topics: ['Accessibility', 'Keyboard Events', 'Component Design'],
    requirements: ['Use tablist/tab/tabpanel roles and stable ARIA relationships.', 'Keep only the focused tab in the tab sequence.', 'Support orientation-appropriate arrows, Home and End, wrapping and disabled-tab skipping.', 'Activate on focus in automatic mode; Enter or Space in manual mode.'],
    example: { actions: 'In manual mode, press Right then Enter.', result: 'Focus moves first; the new panel appears only after Enter.' },
    steps: ['Track active and focused IDs separately.', 'Navigate an array of enabled tabs.', 'Render hidden inactive panels with matching IDs and labels.'],
    pitfalls: ['Manual activation needs separate selected and focused state.', 'Disabled tabs must be skipped in keyboard navigation.'],
    complexity: 'O(n) render and enabled-tab navigation; O(n) refs.',
    testCases: [{ action: 'Press End then Right in a horizontal tablist.', expected: 'Focus wraps from the last enabled tab to the first.' }, { action: 'Use Down in vertical mode.', expected: 'The next enabled tab receives focus.' }],
    assumptions: [premiumAssumption, 'Automatic activation is the default; inactive panels remain mounted and hidden.'], sourceUrl: source('tabs-iii'),
    code: String.raw`import React, { useId, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-tic-tac-toe-ii', title: 'Tic-tac-toe II', difficulty: 'Hard',
    summary: 'Configurable N×N board and M-in-a-row victory.',
    prompt: 'Create a local two-player game with an adjustable board size and winning streak length. X and O alternate moves. Detect any contiguous winning segment horizontally, vertically or diagonally and stop the game after a win or draw.',
    topics: ['Game Logic', 'Arrays', 'State Management'],
    requirements: ['Allow N from 3 to 10 and M from 3 to N.', 'Check contiguous runs in four directions from the last move.', 'Prevent occupied-cell moves and moves after a terminal result.', 'Display the current player or winner/draw and provide restart/configuration.'],
    example: { actions: 'On a 5×5 board with M=3, X fills three adjacent cells in row four.', result: 'X wins even though the streak does not span the entire row.' },
    steps: ['Store board, turn and terminal result together.', 'Count matching marks in both directions along four axes.', 'Reset the board whenever configuration is applied.'],
    pitfalls: ['Checking only entire rows misses shorter winning runs.', 'Diagonal checks must guard both row and column bounds.'],
    complexity: 'O(N²) immutable board copy/render per move; victory detection O(M) and storage O(N²).',
    testCases: [{ action: 'Complete an off-center diagonal of M marks.', expected: 'The last mover wins.' }, { action: 'Click an occupied cell.', expected: 'Neither the board nor the current player changes.' }],
    assumptions: [premiumAssumption, 'Two local human players; no computer opponent. Changing settings starts a new round.'], sourceUrl: source('tic-tac-toe-ii'),
    code: String.raw`import React, { useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-todo-list', title: 'Todo List', difficulty: 'Medium',
    summary: 'Add and remove independently identified tasks.',
    prompt: 'Build a task list with a labeled text field and add action. Trim input, reject blank entries and remove the chosen task without affecting another task with the same text.',
    topics: ['Forms', 'Lists', 'State Management'],
    requirements: ['Add trimmed tasks through form submission.', 'Ignore blank submissions and clear successful input.', 'Delete by stable ID and support duplicate task labels.', 'Provide an empty state and accessible delete names.'],
    example: { actions: 'Add Read twice and delete one copy.', result: 'One Read task remains.' },
    steps: ['Store task records with stable IDs.', 'Handle add with the form submit event.', 'Filter by ID for deletion.'],
    pitfalls: ['Array indices as keys can reuse the wrong DOM node after deletion.', 'Removing by text accidentally removes duplicates.'],
    complexity: 'O(n) addition/deletion/render and O(n) task storage.',
    testCases: [{ action: 'Submit only whitespace.', expected: 'No task is added.' }, { action: 'Delete the middle task.', expected: 'The remaining tasks keep their order.' }],
    assumptions: ['The public add/delete task is implemented with local component state and a small initial list. Completion toggles are intentionally outside this exercise.'], sourceUrl: source('todo-list'),
    code: String.raw`import React, { useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-traffic-light', title: 'Traffic Light', difficulty: 'Medium',
    summary: 'A repeating signal driven by per-phase durations.',
    prompt: 'Create a three-lamp signal that starts green, turns yellow and then red, and repeats. Each phase has its own duration. Use one active timer and stop it when the component unmounts.',
    topics: ['Effects', 'Timers', 'State Machines'],
    requirements: ['Use green → yellow → red → green ordering.', 'Keep exactly one lamp illuminated.', 'Default to green 3000ms, yellow 500ms and red 4000ms.', 'Expose the current color in text as well as visually.'],
    example: { actions: 'Wait three seconds after mounting.', result: 'Green switches to yellow; half a second later the signal turns red.' },
    steps: ['Define ordered phases with duration and display color.', 'Schedule the next phase in an effect keyed by current phase.', 'Clear the old timeout on phase changes and unmount.'],
    pitfalls: ['Using one fixed interval ignores different phase lengths.', 'Color alone does not communicate state to every user.'],
    complexity: 'O(1) state, rendering and timer work.',
    testCases: [{ action: 'Advance through all phase durations.', expected: 'The cycle returns to green.' }, { action: 'Unmount during green.', expected: 'No timeout remains active.' }],
    assumptions: ['The catalog establishes the repeating signal. This implementation explicitly uses green=3000ms, yellow=500ms and red=4000ms and accepts custom durations.'], sourceUrl: source('traffic-light'),
    code: String.raw`import React, { useEffect, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-transfer-list-ii', title: 'Transfer List II', difficulty: 'Hard',
    summary: 'Move selections, select all and add new list items.',
    prompt: 'Create two lists with independent selection, bulk selection and item creation. Move checked items in either direction without duplicating or losing records. Show partial bulk selection as an indeterminate checkbox.',
    topics: ['Sets', 'Forms', 'Derived State'],
    requirements: ['Transfer only checked items and preserve relative order.', 'Provide per-list select-all/clear-all with an indeterminate state.', 'Add trimmed items to either side with unique IDs.', 'Disable transfer actions with no eligible selection and clear moved selections.'],
    example: { actions: 'Select two left items and move them right.', result: 'The selected items append to the right and are no longer checked.' },
    steps: ['Store each side as an array of records and checked IDs in a Set.', 'Partition a source list into moved and remaining items.', 'Derive bulk checkbox state from selected count.'],
    pitfalls: ['Selection state must be cleared for moved items.', 'Labels may repeat; IDs must remain unique.'],
    complexity: 'O(n) transfer, bulk selection and render; O(n) storage.',
    testCases: [{ action: 'Check one item in a list of three.', expected: 'Its select-all checkbox is mixed.' }, { action: 'Add a duplicate label and move it.', expected: 'Only its unique record moves.' }],
    assumptions: [premiumAssumption, 'New items append to their chosen side. Duplicate labels are allowed; ID identity controls selection.'], sourceUrl: source('transfer-list-ii'),
    code: String.raw`import React, { useLayoutEffect, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-tweet', title: 'Tweet', difficulty: 'Easy',
    summary: 'A responsive social post card with accessible actions.',
    prompt: 'Recreate the information hierarchy of a short social post: avatar, author identity, timestamp, body and engagement controls. Accept post data as props and make local like/repost toggles reversible.',
    topics: ['CSS', 'Component Props', 'Accessibility'],
    requirements: ['Render author, handle, timestamp, multiline content and engagement counts.', 'Keep the card responsive and allow long words to wrap.', 'Use labeled interactive controls and pressed state for toggles.', 'Show avatar fallback initials when no image is supplied.'],
    example: { actions: 'Like a post with eight likes, then unlike it.', result: 'The visible count changes to nine and back to eight.' },
    steps: ['Use a two-column avatar/content layout.', 'Render the timestamp with a machine-readable time element.', 'Derive counts from base props plus local toggle state.'],
    pitfalls: ['Icon-only controls need accessible names.', 'Fixed-width content can overflow on narrow screens.'],
    complexity: 'O(body length) text rendering and O(1) interactive state, plus any submitted replies.',
    testCases: [{ action: 'Toggle Like twice.', expected: 'The base count is restored.' }, { action: 'Render a multiline body.', expected: 'Line breaks are retained.' }],
    assumptions: [premiumAssumption, 'This is an original social post layout. Likes/reposts are local; Reply sends text to an optional callback and adds a local reply.'], sourceUrl: source('tweet'),
    code: String.raw`import React, { useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-undoable-counter', title: 'Undoable Counter', difficulty: 'Medium',
    summary: 'Counter history with reversible actions and branching.',
    prompt: 'Build a counter with −100, −10, −1, +1, +10 and +100 actions. Show its operation history and allow undo/redo. A new operation after undo starts a new branch and discards the abandoned future.',
    topics: ['History', 'State Management', 'Arrays'],
    requirements: ['Store snapshots and a current-history cursor.', 'Disable Undo and Redo at their boundaries.', 'Truncate redo history when a new change is made after undo.', 'Display each action with before and after values and offer reset.'],
    example: { actions: 'Apply +10, +1, Undo, then −1.', result: 'The value is nine and the old +1 action can no longer be redone.' },
    steps: ['Initialize history with value zero.', 'Move a cursor for undo/redo instead of deleting snapshots.', 'Slice history at the cursor before appending a new action.'],
    pitfalls: ['Separate value and history state can become inconsistent.', 'An action after undo must discard the redo branch.'],
    complexity: 'O(h) append/render and O(1) cursor updates; O(h) history storage.',
    testCases: [{ action: 'Undo to the first state.', expected: 'The value is zero and Undo is disabled.' }, { action: 'Branch after undo.', expected: 'Redo is disabled and abandoned actions disappear.' }],
    assumptions: [premiumAssumption, 'History is unbounded for the session. Reset returns to the initial zero snapshot.'], sourceUrl: source('undoable-counter'),
    code: String.raw`import React, { useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-users-database', title: 'Users Database', difficulty: 'Medium',
    summary: 'Filter, create, edit and delete user records.',
    prompt: 'Create a small user directory with a live filter and a reusable create/edit form. Validate names and email addresses, keep IDs stable while editing, and let users cancel edits or delete a specific record.',
    topics: ['CRUD', 'Forms', 'Filtering'],
    requirements: ['Filter by name or email without changing stored records.', 'Create and edit using the same labeled form.', 'Require a trimmed name and valid unique email address.', 'Delete by ID, cancel editing and render empty states.'],
    example: { actions: 'Edit Morgan’s email and filter by the new address.', result: 'The updated record appears with its original identity.' },
    steps: ['Keep the full users array separate from derived search results.', 'Track editing ID and form draft independently.', 'Validate, then append or replace one immutable record.'],
    pitfalls: ['Updating by filtered row index edits the wrong user.', 'Cancelling an edit must not mutate the original record.'],
    complexity: 'O(n) filtering, validation and record updates; O(n) storage.',
    testCases: [{ action: 'Try creating a duplicate email with different casing.', expected: 'An error appears and no user is added.' }, { action: 'Edit then cancel.', expected: 'The stored record remains unchanged.' }],
    assumptions: [premiumAssumption, 'The directory is an in-memory CRUD model with name/email fields. The public catalog does not specify an API, so there are no invented endpoints.'], sourceUrl: source('users-database'),
    code: String.raw`import React, { useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-whack-a-mole', title: 'Whack-A-Mole', difficulty: 'Medium',
    summary: 'A timed arcade game with single-hit scoring.',
    prompt: 'Create a nine-hole game with a timed round. A mole appears at a random hole and relocates periodically. Hitting it scores once, the countdown ends the round, and starting again clears the previous score and timers.',
    topics: ['Timers', 'Randomness', 'Game State'],
    requirements: ['Start a thirty-second round with nine holes.', 'Show one random mole at a time and award at most one point per appearance.', 'Relocate approximately every 750ms and prevent scoring after time expires.', 'Display score/time, support restart and clean up all timers.'],
    example: { actions: 'Hit the visible mole twice before it relocates.', result: 'The score increases by one only.' },
    steps: ['Keep the active mole and deadline in refs for synchronous event guards.', 'Drive relocation and countdown with cleaned-up intervals.', 'Use the deadline to stop scoring even before the next render.'],
    pitfalls: ['Rapid clicks can score twice if the guard only reads stale state.', 'A restarted round must cancel timers from the previous round.'],
    complexity: 'O(1) state and per-tick work for a fixed nine-hole board.',
    testCases: [{ action: 'Double-click one appearance.', expected: 'Only one point is awarded.' }, { action: 'Advance beyond the deadline.', expected: 'The board is disabled and the final score stays fixed.' }],
    assumptions: [premiumAssumption, 'One visible mole, nine holes and a thirty-second round are explicit practice rules. Duration and randomness are injectable for deterministic tests.'], sourceUrl: source('whack-a-mole'),
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';
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
}`,
  }),
  defineChallenge({
    slug: 'gfe-wordle', title: 'Wordle', difficulty: 'Hard',
    summary: 'Six guesses with duplicate-aware letter feedback.',
    prompt: 'Build a five-letter guessing game with six attempts, an onscreen keyboard and physical keyboard input. Evaluate exact matches before assigning present-letter hints so repeated letters never receive more credit than the answer contains.',
    topics: ['Game Logic', 'Frequency Maps', 'Keyboard Events'],
    requirements: ['Accept exactly five alphabetic characters and validate against a supplied word list.', 'Evaluate exact matches, then consume remaining answer frequencies for present/absent hints.', 'Keep keyboard hints at their strongest known state.', 'Stop after a correct guess or six valid guesses and support restart.', 'Announce errors, outcomes and feedback labels without relying only on color.'],
    example: { actions: 'Against APPLE, submit ALLEY.', result: 'A is correct, one L is present, the extra L is absent, E is present and Y is absent.' },
    steps: ['Use a two-pass evaluation function for duplicate letters.', 'Store submitted guesses and derive keyboard hint priority.', 'Route physical keys and onscreen keys through one action handler.'],
    pitfalls: ['answer.includes(letter) incorrectly colors excess duplicate letters.', 'An absent hint must not overwrite a prior correct or present hint.'],
    complexity: 'O(gk + d) rendering/validation setup for g guesses, k=5 letters and d dictionary words; O(gk + d) memory.',
    testCases: [{ action: 'Guess a word with repeated letters.', expected: 'Hints respect the number of copies in the answer.' }, { action: 'Enter an unknown or short word.', expected: 'An error appears without consuming an attempt.' }],
    assumptions: [premiumAssumption, 'The demo uses a disclosed small local dictionary and a default answer APPLE. Supply a larger dictionary and a session answer for a production game.'], sourceUrl: source('wordle'),
    code: String.raw`import React, { useEffect, useMemo, useState } from 'react';
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
}`,
  }),
];
