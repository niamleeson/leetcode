import type { ReactChallenge } from '../types';
import { defineChallenge } from './shared';

// Original, standalone implementations. Premium descriptions are represented by
// explicit practice contracts rather than guessed private platform requirements.
export const greatFrontendBasic: ReactChallenge[] = [
  defineChallenge({
    slug: 'gfe-analog-clock', title: 'Analog Clock', difficulty: 'Medium',
    summary: 'Draw a live clock with correctly positioned hour, minute, and second hands.',
    prompt: 'Create a clock face that reflects the local wall-clock time and continues updating while mounted.',
    topics: ['Timers', 'SVG', 'Effects'],
    requirements: ['Show twelve hour markers and three hands.', 'Include minute and second fractions in the slower hands.', 'Read the actual clock on every tick and clean up the interval.'],
    assumptions: ['The full premium prompt is unavailable. This practice version uses a 12-hour face, local time, and one-second updates.'],
    example: { actions: 'View the clock at 03:30:00.', result: 'The minute hand points down and the hour hand sits halfway between 3 and 4.' },
    steps: ['Store the current Date and replace it every second.', 'Convert each time unit to clockwise degrees, including fractional units.', 'Rotate SVG lines about the face center and provide a textual time label.'],
    pitfalls: ['Incrementing a counter instead of reading the clock introduces drift.', 'A fixed hour hand jumps rather than tracking the minutes.'],
    complexity: 'O(1) time and space per update.',
    testCases: [{ action: 'Advance one second.', expected: 'The time label and second-hand angle update.' }, { action: 'Unmount.', expected: 'No interval remains.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/analog-clock/react',
    code: String.raw`import React, { useEffect, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-birth-year-histogram', title: 'Birth Year Histogram', difficulty: 'Medium',
    summary: 'Fetch a list of birth years and display their frequencies as proportional bars.',
    prompt: 'Build a histogram from asynchronously loaded birth-year records. Make loading, empty data, retry, and request replacement understandable to the user.',
    topics: ['Networking', 'Data aggregation', 'Effects'],
    requirements: ['Aggregate repeated valid integer years and sort them numerically.', 'Scale the largest bar to the available width and label every frequency.', 'Handle loading, failure, retry, empty results, and stale requests.'],
    assumptions: ['The full premium API contract is unavailable. The endpoint prop accepts JSON arrays of integer years; the default data URL supplies an offline sample.', 'Years from 1 through the current year are accepted; malformed entries are ignored.'],
    example: { actions: 'Load [1990, 1992, 1990].', result: '1990 has a frequency of 2 and 1992 has a frequency of 1.' },
    steps: ['Fetch the endpoint with an AbortController and an active-effect guard.', 'Count valid years with a Map and sort its entries.', 'Render proportional bars with text labels and offer retry on failure.'],
    pitfalls: ['Lexicographic sorting is unsuitable for numeric years.', 'A response from a previous endpoint must not replace the current dataset.'],
    complexity: 'O(n + k log k) time and O(k) space for n records and k distinct years.',
    testCases: [{ action: 'Fetch duplicate, invalid, and unsorted years.', expected: 'Only valid years are counted and bars are sorted.' }, { action: 'Change endpoints before the first resolves.', expected: 'The older response is ignored.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/birth-year-histogram/react',
    code: String.raw`import React, { useEffect, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-connect-four', title: 'Connect Four', difficulty: 'Medium',
    summary: 'Play a two-player disc game with gravity and four-direction win detection.',
    prompt: 'Build a local two-player Connect Four game. Players select columns, discs fall into the lowest empty space, and play ends when someone connects four or the board fills.',
    topics: ['Games', 'State management', 'Grid'],
    requirements: ['Use a six-row, seven-column board and alternate red/yellow turns.', 'Reject full columns and all moves after a win or draw.', 'Recognize horizontal, vertical, and both diagonal wins; support restart.'],
    assumptions: ['The premium prompt is not visible. This implementation uses standard 6 × 7 Connect Four rules and local players.'],
    example: { actions: 'Alternate columns 1 and 2, with Red dropping into column 1 four times.', result: 'Red wins vertically; the board stops accepting moves.' },
    steps: ['Store board, next player, and result in one state object.', 'Locate the bottom empty row and copy the board before placing a disc.', 'Count both directions on each of four axes, then check for a full board.'],
    pitfalls: ['Checking only one diagonal direction misses wins.', 'Full-column clicks must not consume a turn.'],
    complexity: 'O(rows × columns) per move to copy the board; O(rows × columns) space.',
    testCases: [{ action: 'Play a vertical win.', expected: 'The winner is announced and all drop buttons disable.' }, { action: 'Fill a column or restart.', expected: 'A full column rejects moves; restart clears every disc.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/connect-four/react',
    code: String.raw`import React, { useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-contact-form', title: 'Contact Form', difficulty: 'Easy',
    summary: 'Submit labeled contact fields using the browser’s native form mechanism.',
    prompt: 'Create a contact form containing a name, email address, multiline message, and Send button. Let the browser send the named fields to the provided endpoint.',
    topics: ['Forms', 'HTML', 'Accessibility'],
    requirements: ['Provide associated labels and name attributes for all fields.', 'Submit using method="post" and the supplied action URL.', 'Use native form submission without a JavaScript submit handler.'],
    assumptions: ['The public exercise requests HTML submission with server-side validation. React only renders the markup; the browser owns the inputs and response navigation.'],
    example: { actions: 'Fill all three fields and press Send.', result: 'The browser posts name, email, and message as form data.' },
    steps: ['Use a form with action and method attributes.', 'Associate unique labels using useId and add submission names.', 'Use a textarea for longer messages and a submit button.'],
    pitfalls: ['Fields without name attributes are absent from the request.', 'Preventing the submit event would disable the native submission contract.'],
    complexity: 'O(n) serialization for n characters of form data; constant component state.',
    testCases: [{ action: 'Inspect FormData after entering text.', expected: 'All three named fields are present.' }, { action: 'Submit the form.', expected: 'The browser uses POST to the configured endpoint.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/contact-form/react',
    integrationNotes: ['Native submission navigates to the response page. An embedded runner can provide a test endpoint or intercept submission outside this component.'],
    code: String.raw`import React, { useId } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-counter', title: 'Counter', difficulty: 'Easy',
    summary: 'Increment an independent counter on each button activation.',
    prompt: 'Render a button that displays how many times it has been activated and increases that count by one per click.',
    topics: ['State management', 'Events'],
    requirements: ['Start at zero unless an initial value is supplied.', 'Increment once for every activation.', 'Keep multiple component instances independent.'],
    example: { actions: 'Click the button three times.', result: 'The displayed count changes from 0 to 3.' },
    steps: ['Initialize local state.', 'Use a functional updater so queued increments compose.', 'Render the count inside a native button.'],
    pitfalls: ['Mutating a local variable will not trigger rendering.', 'A module-level counter would be shared by unrelated instances.'],
    complexity: 'O(1) time and space per click.',
    testCases: [{ action: 'Click three times.', expected: 'Count is 3.' }, { action: 'Render two counters.', expected: 'Updating one leaves the other unchanged.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/counter/react',
    code: String.raw`import React, { useState } from 'react';

export default function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);
  return <button onClick={() => setCount(value => value + 1)}
    style={{ padding: '12px 20px', borderRadius: 8, fontSize: 20 }}>
    Count: {count}
  </button>;
}`,
  }),
  defineChallenge({
    slug: 'gfe-dice-roller', title: 'Dice Roller', difficulty: 'Medium',
    summary: 'Roll a validated number of six-sided dice and display their pip patterns.',
    prompt: 'Let a user choose how many dice to roll, then generate independent random values and display dice in rows of three.',
    topics: ['Forms', 'Randomness', 'CSS Grid'],
    requirements: ['Accept only integer counts from 1 through 12.', 'Roll independent values from 1 through 6 on submission.', 'Render pip patterns in a three-column layout and announce the results.'],
    example: { actions: 'Choose 3 dice and press Roll.', result: 'Three random faces appear, each with between one and six pips.' },
    steps: ['Keep the editable count separate from the rolled results.', 'Validate the count before calling the random generator.', 'Map each face value to occupied positions in a 3 × 3 pip grid.'],
    pitfalls: ['Math.round creates biased endpoint probabilities.', 'Changing the input should not regenerate already rolled dice.'],
    complexity: 'O(d) time and space for d dice, with d at most 12.',
    testCases: [{ action: 'Roll using deterministic random values near 0 and 1.', expected: 'Faces are 1 and 6.' }, { action: 'Enter 0, 13, or a fractional count.', expected: 'Validation rejects the roll.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/dice-roller/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-digital-clock', title: 'Digital Clock', difficulty: 'Medium',
    summary: 'Display live local time using SVG seven-segment digits.',
    prompt: 'Build a digital clock with six seven-segment digits for hours, minutes, and seconds. Keep the display synchronized to actual time.',
    topics: ['SVG', 'Timers', 'Effects'],
    requirements: ['Display zero-padded 24-hour time.', 'Construct digits from seven individually lit segments.', 'Update once each second and release the timer on unmount.'],
    assumptions: ['The detailed prompt is not publicly visible. This version uses local 24-hour time with seconds and accessible text.'],
    example: { actions: 'The clock advances from 09:59:59 by one second.', result: 'The display changes to 10:00:00.' },
    steps: ['Map digits to segment names.', 'Draw reusable SVG segments with on/off colors.', 'Read Date in a cleaned-up interval and provide an accessible time label.'],
    pitfalls: ['Using font glyphs alone does not implement seven-segment rendering.', 'Accumulating ticks drifts after browser throttling.'],
    complexity: 'O(1) time and space per tick.',
    testCases: [{ action: 'Advance across a minute boundary.', expected: 'Digits carry correctly.' }, { action: 'Unmount.', expected: 'The interval is cleared.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/digital-clock/react',
    code: String.raw`import React, { useEffect, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-flight-booker', title: 'Flight Booker', difficulty: 'Easy',
    summary: 'Validate one-way and return flight dates before confirming a booking.',
    prompt: 'Build a form for choosing a one-way or return flight. Enable booking only when the required dates form a valid itinerary.',
    topics: ['Forms', 'Validation', 'Derived state'],
    requirements: ['Use controlled trip-type and date fields.', 'Disable the return date for one-way flights.', 'Reject missing dates and return dates earlier than departure; show a confirmation for valid submissions.'],
    assumptions: ['The premium contract is unavailable. This version permits historical departure dates, defaults to today, and confirms locally without a booking API.'],
    example: { actions: 'Choose return flight with departure 2027-06-10 and return 2027-06-09.', result: 'Booking stays disabled and the return-date error is shown.' },
    steps: ['Store ISO date strings to allow chronological string comparison.', 'Derive validity from trip type and dates.', 'Snapshot the chosen itinerary into a confirmation after submission.'],
    pitfalls: ['A disabled return field must not invalidate a one-way itinerary.', 'UTC ISO conversion can choose the wrong local calendar day.'],
    complexity: 'O(1) time and space.',
    testCases: [{ action: 'Choose a return date before departure.', expected: 'Booking is disabled.' }, { action: 'Switch to one-way.', expected: 'Return is disabled and a valid departure can be booked.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/flight-booker/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-generate-table', title: 'Generate Table', difficulty: 'Easy',
    summary: 'Generate a numbered table with alternating downward and upward columns.',
    prompt: 'Accept row and column counts and generate a table filled with consecutive numbers in a column-wise snake pattern.',
    topics: ['Forms', 'Grid', 'Arithmetic'],
    requirements: ['Accept positive integer dimensions no larger than 50.', 'Fill the first column top-to-bottom, the next bottom-to-top, and alternate.', 'Regenerate only on form submission and retain the previous table when input is invalid.'],
    assumptions: ['The premium prompt is unavailable. This practice contract chooses alternating column order and a 50 × 50 rendering limit.'],
    example: { actions: 'Generate 3 rows and 2 columns.', result: 'Rows read [1, 6], [2, 5], [3, 4].' },
    steps: ['Validate editable dimensions before committing them.', 'For each cell calculate its offset from the start of its column.', 'Render semantic table rows and cells using the committed dimensions.'],
    pitfalls: ['Using edited dimensions directly changes the table before submission.', 'Fractional or unbounded dimensions can create invalid arrays or excessive DOM nodes.'],
    complexity: 'O(r × c) rendering time and DOM space.',
    testCases: [{ action: 'Generate 3 × 2.', expected: 'The second column reverses direction.' }, { action: 'Submit zero or fractional dimensions.', expected: 'An error appears and the previous table is preserved.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/generate-table/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-grid-lights', title: 'Grid Lights', difficulty: 'Medium',
    summary: 'Activate cells and then switch them off in reverse activation order.',
    prompt: 'Create eight clickable lights around an empty center. Once every light is on, deactivate them one at a time in the reverse order of the user’s clicks.',
    topics: ['Timers', 'State management', 'Grid'],
    requirements: ['Only inactive lights accept activation.', 'When all eight are on, lock interaction and remove one every 300 ms in reverse order.', 'Unlock when all lights are off and clean up scheduled work.'],
    assumptions: ['The premium prompt is unavailable. This version uses a 3 × 3 board with a center hole and a configurable delay defaulting to 300 ms.'],
    example: { actions: 'Activate every light, ending with the top-left corner.', result: 'Top-left turns off first; the first light selected turns off last.' },
    steps: ['Keep the activation order as a stack.', 'Enter a draining phase once the stack reaches eight.', 'Schedule one pop per effect run so cleanup cancels obsolete timers.'],
    pitfalls: ['A Set alone does not make reverse-order removal explicit.', 'Letting users click during the drain changes the intended sequence.'],
    complexity: 'O(n) update/rendering time and O(n) space for n lights; n is 8 here.',
    testCases: [{ action: 'Activate all lights in a known order.', expected: 'Each delay removes the latest remaining light.' }, { action: 'Unmount during draining.', expected: 'No pending timeout remains.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/grid-lights/react',
    code: String.raw`import React, { useEffect, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-holy-grail', title: 'Holy Grail', difficulty: 'Easy',
    summary: 'Lay out a full-height page with fixed sidebars and a flexible center.',
    prompt: 'Create the classic header, three-column body, and footer layout using CSS. Keep the footer at the viewport bottom on short pages and below long content.',
    topics: ['CSS Grid', 'Layout', 'Semantic HTML'],
    requirements: ['Use a 60 px full-width header and 100 px full-width footer.', 'Use 100 px side columns and a center that consumes the remaining width.', 'Stretch all body columns equally and allow page content to grow naturally.'],
    example: { actions: 'Render a short article, then replace it with a long article.', result: 'The footer initially stays at the viewport bottom, then moves below the expanded content.' },
    steps: ['Define outer grid rows as 60 px, a flexible middle, and 100 px.', 'Define the body columns as 100 px, minmax(0, 1fr), and 100 px.', 'Use semantic landmarks and break long words in the fluid column.'],
    pitfalls: ['A fixed-position footer can cover content.', 'A center column without min-width control can overflow when text is long.'],
    complexity: 'O(n) browser layout for n content nodes; no component state.',
    testCases: [{ action: 'Render the layout.', expected: 'Header, navigation, main, aside, and footer landmarks exist.' }, { action: 'Provide longer content.', expected: 'The grid grows and the footer remains in document flow.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/holy-grail/react',
    code: String.raw`import React from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-job-board', title: 'Job Board', difficulty: 'Medium',
    summary: 'Load Hacker News job IDs, fetch posting details, and reveal additional pages.',
    prompt: 'Build a job board backed by the Hacker News API. Load a small batch of recent jobs, show their title, author, and date, and allow the user to load the next batch.',
    topics: ['Networking', 'Pagination', 'Effects'],
    requirements: ['Fetch jobstories.json, then fetch item details in parallel while preserving ID order.', 'Show loading, retryable errors, empty results, and a Load more action.', 'Use an HN discussion fallback for jobs without an external URL and cancel stale requests.'],
    assumptions: ['The premium prompt is unavailable. This practice contract uses batches of six, skips missing/deleted records, and retries a failed batch without duplicating previous pages.'],
    example: { actions: 'Open the board, then choose Load more.', result: 'The first six postings appear, followed by the next six in API order.' },
    steps: ['Load and validate the ID list separately from detail pages.', 'Fetch each requested page with Promise.all and commit only when its effect is active.', 'Append successful pages, preserve previous pages on error, and reuse the failed page index on retry.'],
    pitfalls: ['Settling requests individually can reorder posts.', 'Advancing the page before a failed request is retried can skip jobs.', 'Endpoint changes must clear previous IDs and postings.'],
    complexity: 'O(p) requests per batch and O(n) space for n loaded postings; p defaults to 6.',
    testCases: [{ action: 'Load two pages.', expected: 'Ordered jobs append without duplicates.' }, { action: 'A detail request fails, then retry succeeds.', expected: 'Earlier jobs remain and the failed page is retried.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/job-board/react',
    integrationNotes: ['Default API: https://hacker-news.firebaseio.com/v0. Props apiBase and fetcher allow deterministic tests or a proxy.'],
    code: String.raw`import React, { useEffect, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-like-button', title: 'Like Button', difficulty: 'Medium',
    summary: 'Toggle a server-backed like state with loading and recoverable failure.',
    prompt: 'Create a Like button that requests a like or unlike action and changes its pressed state only after a successful response.',
    topics: ['Networking', 'State management', 'Accessibility'],
    requirements: ['POST JSON containing action: like or unlike to the supplied endpoint.', 'Disable repeated actions while pending and display loading feedback.', 'Keep the visible label Like, expose aria-pressed, and show server error messages without changing committed state.'],
    example: { actions: 'Like succeeds, then unlike fails.', result: 'The button remains pressed and displays the failure message.' },
    steps: ['Derive the requested action from committed state.', 'Guard concurrent requests with a ref and keep a controller for cleanup.', 'Commit the new state on success; preserve the old state on failure.'],
    pitfalls: ['An optimistic toggle without rollback leaves the UI wrong on failure.', 'A button without aria-pressed hides its toggle state from assistive technology.'],
    complexity: 'O(1) client time and space per request, excluding network latency.',
    testCases: [{ action: 'Resolve a like request successfully.', expected: 'aria-pressed becomes true and the label remains Like.' }, { action: 'Reject an unlike request.', expected: 'The liked state remains and an error is shown.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/like-button/react',
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-memory-game', title: 'Memory Game', difficulty: 'Medium',
    summary: 'Match shuffled pairs while preventing overlapping turns and stale resets.',
    prompt: 'Build a card matching game. Reveal two cards per turn, keep matching cards visible, hide mismatches after a short delay, and offer a fresh shuffled game.',
    topics: ['Games', 'Timers', 'State management'],
    requirements: ['Shuffle two copies of each symbol using Fisher–Yates.', 'Ignore revealed and matched cards and lock the board while a mismatched pair is visible.', 'Count attempts, announce completion, and cancel mismatch timers on reset or unmount.'],
    assumptions: ['The premium prompt is unavailable. This version uses six pairs, one-second mismatch exposure, and an injectable random function for testing.'],
    example: { actions: 'Reveal a mismatched pair, wait one second, then reveal a matching pair.', result: 'The mismatch hides; the match remains visible; attempts total 2.' },
    steps: ['Give each card a distinct index after shuffling duplicated symbols.', 'Keep open indexes, matched indexes, and attempt count in one state object.', 'Resolve matches immediately and schedule a cleaned-up timeout for mismatches.'],
    pitfalls: ['Sorting with a random comparator does not create an unbiased shuffle.', 'A timeout from an old game must not hide cards in a restarted game.'],
    complexity: 'O(n) initialization and rendering time; O(n) space for n cards.',
    testCases: [{ action: 'Reveal two unequal cards, then try a third.', expected: 'The third is ignored until the pair hides.' }, { action: 'Restart while a mismatch is visible.', expected: 'The old timer is cancelled and a fresh board starts.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/memory-game/react',
    code: String.raw`import React, { useEffect, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-mortgage-calculator', title: 'Mortgage Calculator', difficulty: 'Easy',
    summary: 'Calculate amortized monthly payments, total repayment, and interest.',
    prompt: 'Build a calculator that accepts principal, annual percentage interest, and a term in years. Validate the inputs and show the resulting monthly payment, total paid, and interest to two decimal places.',
    topics: ['Forms', 'Arithmetic', 'Validation'],
    requirements: ['Require a finite positive principal and positive whole-year term; allow nonnegative APR.', 'Use the amortization formula, including a separate zero-interest case.', 'Keep full precision during calculation and round only the displayed amounts.'],
    assumptions: ['This educational calculation covers principal and interest only. It assumes a fixed rate, monthly payments, whole-year terms, and no fees or taxes.'],
    example: { actions: 'Enter $120,000, 0% APR, and 10 years.', result: 'Monthly payment is $1,000.00, total is $120,000.00, and interest is $0.00.' },
    steps: ['Parse and validate the form values.', 'Convert annual percentage to monthly decimal rate and years to payment count.', 'Compute payment and totals, guarding against nonfinite results.'],
    pitfalls: ['Dividing by the zero-rate denominator produces NaN.', 'Rounding the payment before calculating totals accumulates rounding errors.'],
    complexity: 'O(1) arithmetic time and space.',
    testCases: [{ action: 'Calculate a zero-interest mortgage.', expected: 'Principal divides evenly across the payment count.' }, { action: 'Enter a negative or nonnumeric input.', expected: 'A validation message replaces the previous result.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/mortgage-calculator/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-progress-bar', title: 'Progress Bar', difficulty: 'Easy',
    summary: 'Render a bounded percentage with a semantic progress indicator.',
    prompt: 'Build a reusable progress bar and a small control for trying different completion percentages.',
    topics: ['Accessibility', 'CSS', 'Derived state'],
    requirements: ['Clamp finite input values to the range 0–100.', 'Expose progressbar semantics, bounds, and current value.', 'Keep the visible fill and percentage label consistent.'],
    assumptions: ['The premium prompt is unavailable. Nonfinite values become zero; the bar is determinate and updates immediately.'],
    example: { actions: 'Set the value to 125.', result: 'The bar fills completely and announces 100%.' },
    steps: ['Normalize the incoming numeric value.', 'Use the same normalized value for width, text, and ARIA.', 'Render a controlled input in a separate default demonstration component.'],
    pitfalls: ['Clamping the fill but not aria-valuenow creates contradictory information.', 'Using a native progress element and an extra progressbar role together duplicates semantics.'],
    complexity: 'O(1) time and space.',
    testCases: [{ action: 'Pass -10, 125, and NaN.', expected: 'Values normalize to 0, 100, and 0.' }, { action: 'Edit the demo input.', expected: 'The visual width and accessible value update together.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/progress-bar/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-signup-form', title: 'Signup Form', difficulty: 'Medium',
    summary: 'Validate controlled signup fields and submit them with pending and error states.',
    prompt: 'Build an account registration form with name, email, password, and password confirmation. Show field errors, submit only valid data, and handle server success or failure.',
    topics: ['Forms', 'Validation', 'Networking'],
    requirements: ['Require a name, a plausible email, an eight-character password, and matching confirmation.', 'POST name, email, and password as JSON and disable the form while pending.', 'Show server feedback, preserve values after failure, and cancel obsolete submissions.'],
    assumptions: ['The premium field and API contract is unavailable. This practice version defines its own fields and validates an eight-character minimum.', 'The default /api/signup endpoint must be supplied by the host; override endpoint or fetcher to connect your backend. Success accepts any 2xx response, optionally with a JSON message.'],
    example: { actions: 'Enter different password and confirmation values and submit.', result: 'A confirmation error appears and no request is sent.' },
    steps: ['Keep all editable fields in controlled state and derive validation on submit.', 'Associate field errors with inputs and focus the first invalid field.', 'Send one abortable request, show its result, and clear password fields after success.'],
    pitfalls: ['Sending the confirmation password is unnecessary.', 'Client-side validation does not replace server-side validation.', 'A late response after endpoint change must not overwrite the current form status.'],
    complexity: 'O(n) validation and serialization for n input characters; O(n) form state.',
    testCases: [{ action: 'Submit invalid fields.', expected: 'Errors appear without a request.' }, { action: 'Submit valid data and receive success.', expected: 'JSON excludes confirmation and password inputs clear.' }, { action: 'Reject a request.', expected: 'The form unlocks and retains user input.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/signup-form/react',
    code: String.raw`import React, { useEffect, useId, useRef, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-star-rating', title: 'Star Rating', difficulty: 'Medium',
    summary: 'Select a rating with hover previews and native radio keyboard support.',
    prompt: 'Create a reusable star rating widget with a configurable maximum, current rating, and change callback. Hover should temporarily preview a rating without changing the committed selection.',
    topics: ['Accessibility', 'Controlled components', 'Events'],
    requirements: ['Fill every star through the selected or hovered value.', 'Restore the selected state when the pointer leaves.', 'Support controlled and uncontrolled use, independent instances, and keyboard selection.'],
    example: { actions: 'Select 2 stars, hover over star 4, then move away.', result: 'The preview shows 4, then returns to the committed value of 2.' },
    steps: ['Separate committed value from hover preview.', 'Render visually styled native radio inputs with unique names.', 'Call onChange on selection and update internal state only when uncontrolled.'],
    pitfalls: ['Saving hover into the selected value makes a preview permanent.', 'Sharing a radio name across instances couples their selections.'],
    complexity: 'O(m) rendering time and DOM space for m stars.',
    testCases: [{ action: 'Hover and leave after selecting.', expected: 'The committed rating is restored.' }, { action: 'Use a controlled value and change callback.', expected: 'Selection reports the new value and follows the parent prop.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/star-rating/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-stopwatch', title: 'Stopwatch', difficulty: 'Medium',
    summary: 'Measure elapsed time accurately across starts, pauses, resumes, and resets.',
    prompt: 'Build a stopwatch with a clickable elapsed-time display, a Start/Stop button, and a Reset button. Show hours, minutes, seconds, and hundredths.',
    topics: ['Timers', 'Refs', 'Effects'],
    requirements: ['Both the display and Start/Stop control toggle running state.', 'Preserve elapsed time when paused and continue from it on resume.', 'Reset to zero and stop; derive elapsed time from a monotonic clock and release the interval.'],
    example: { actions: 'Run for 2 seconds, pause for 5 seconds, and run for 1 more second.', result: 'The stopwatch reads 00:00:03.00.' },
    steps: ['Store accumulated duration and the current run’s start timestamp in refs.', 'Use performance.now to calculate elapsed duration on each repaint tick.', 'Format hundredths with division and modulo, and synchronize pause/reset with the refs.'],
    pitfalls: ['Adding a fixed interval duration undercounts when the browser throttles callbacks.', 'Failing to stop the interval on reset can immediately restart the displayed time.'],
    complexity: 'O(1) time and space per tick.',
    testCases: [{ action: 'Start, pause, resume, then reset.', expected: 'Only running intervals contribute and reset stops at zero.' }, { action: 'Advance past 60 seconds.', expected: 'Seconds carry into minutes.' }, { action: 'Unmount while running.', expected: 'The interval is cleared.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/stopwatch/react',
    code: String.raw`import React, { useEffect, useRef, useState } from 'react';

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
}`,
  }),
  defineChallenge({
    slug: 'gfe-temperature-converter', title: 'Temperature Converter', difficulty: 'Easy',
    summary: 'Keep Celsius and Fahrenheit synchronized while preserving editable input.',
    prompt: 'Provide Celsius and Fahrenheit fields that convert in either direction as the user types. Clearing the edited field should clear the converted field.',
    topics: ['Forms', 'Derived state', 'Arithmetic'],
    requirements: ['Treat the last edited field as the source of truth.', 'Convert with C × 9/5 + 32 and (F − 32) × 5/9.', 'Preserve raw source text, handle empty and incomplete input, and round only derived output.'],
    assumptions: ['The premium prompt is unavailable. This version allows negative values, rounds derived results to four decimals, and shows a blank counterpart for nonnumeric input.'],
    example: { actions: 'Enter 100 Celsius, then replace Fahrenheit with 32.', result: 'The first edit shows 212 Fahrenheit; the second shows 0 Celsius.' },
    steps: ['Store the edited scale and raw string together.', 'Compute the opposite value during render instead of syncing two effects.', 'Render two controlled inputs that change the source scale when edited.'],
    pitfalls: ['Mutual synchronization effects can create loops and rounding drift.', 'Number("") is zero, so blank input needs an explicit check.'],
    complexity: 'O(1) arithmetic time and state space.',
    testCases: [{ action: 'Enter 100 Celsius and then 32 Fahrenheit.', expected: 'Conversions are 212 Fahrenheit and 0 Celsius.' }, { action: 'Clear the source or type a minus sign.', expected: 'The counterpart clears while the source text remains editable.' }],
    sourceUrl: 'https://www.greatfrontend.com/questions/user-interface/temperature-converter/react',
    code: String.raw`import React, { useId, useState } from 'react';

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
}`,
  }),
];
