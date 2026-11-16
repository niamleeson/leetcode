import { useEffect, useState } from 'react';

export function createSequence(random = Math.random) {
  const availableCells = Array.from({ length: 16 }, (_, index) => index);
  const sequence = [];

  for (let step = 0; step < 4; step++) {
    // Inclusive range: Math.floor(random() * (max - min + 1)) + min.
    // Choose an index from 0 through the last index in the remaining cells.
    const randomIndex = Math.floor(random() * (availableCells.length - 1 - 0 + 1)) + 0;
    const cell = availableCells[randomIndex];
    sequence.push(cell);

    // Remove this cell so it cannot be chosen again in the same round.
    availableCells.splice(randomIndex, 1);
  }

  return sequence;
}

export default function FlipOrderMemory({ random = Math.random }) {
  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('ready');
  const [activeCell, setActiveCell] = useState(null);
  const [nextStep, setNextStep] = useState(0);

  function handleNewRound() {
    setSequence(createSequence(random));
    setActiveCell(null);
    setNextStep(0);
    setPhase('showing');
  }

  useEffect(() => {
    // Play the sequence only during the watching phase.
    if (phase !== 'showing') return;

    const timers = [];
    sequence.forEach((cell, step) => {
      // Each flip is visible for 500 ms, followed by a 300 ms blank gap.
      // The gap clearly separates one flip from the next.
      timers.push(setTimeout(() => setActiveCell(cell), step * 800));
      timers.push(setTimeout(() => setActiveCell(null), step * 800 + 500));
    });
    timers.push(setTimeout(() => setPhase('playing'), sequence.length * 800));

    // A new round or unmount must cancel every remaining flip from this round.
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [sequence, phase]);

  function handleCellClick(index) {
    // Ignore clicks during playback and after the round has ended.
    if (phase !== 'playing') return;

    if (index !== sequence[nextStep]) {
      setPhase('wrong');
      return;
    }

    const completedSteps = nextStep + 1;
    setNextStep(completedSteps);
    if (completedSteps === sequence.length) setPhase('success');
  }

  let message = 'Press New round to watch four flips.';
  if (phase === 'showing') message = 'Watch the four flips.';
  if (phase === 'playing') {
    message = nextStep === 0
      ? 'Your turn: choose flip 1 of 4.'
      : `Correct! Choose flip ${nextStep + 1} of 4.`;
  }
  if (phase === 'wrong') message = `Wrong order at flip ${nextStep + 1}. Start a new round.`;
  if (phase === 'success') message = 'Correct order! All four flips remembered.';

  return <section aria-label="Flip order memory">
    <p role="status">{message}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: 4 }}>
      {Array.from({ length: 16 }, (_, index) => {
        const visible = activeCell === index;
        return <button key={index}
          aria-label={`Row ${Math.floor(index / 4) + 1} column ${index % 4 + 1}`}
          aria-pressed={visible}
          disabled={phase !== 'playing'}
          onClick={() => handleCellClick(index)}
          style={{ height: 64, fontSize: 24, color: '#111827', background: visible ? '#fde047' : '#e2e8f0' }}>
          {visible ? '●' : '?'}
        </button>;
      })}
    </div>
    <button onClick={handleNewRound}>New round</button>
  </section>;
}
