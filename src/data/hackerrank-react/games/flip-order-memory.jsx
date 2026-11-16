import { useEffect, useState } from 'react';

export function createSequence(random = Math.random) {
  // Inclusive range: Math.floor(random() * (max - min + 1)) + min.
  // The sixteen grid positions run from 0 through 15.
  return Array.from({ length: 4 }, () =>
    Math.floor(random() * (15 - 0 + 1)) + 0
  );
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
      // The gap makes two consecutive flips of the same cell distinguishable.
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
