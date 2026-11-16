import { useEffect, useState } from 'react';

export function makeDeck(random = Math.random) {
  const cards = ['A', 'B', 'C', 'D', 'E', 'F'].flatMap(value => [value, value])
    .map((value, id) => ({ id, value }));
  for (let i = cards.length - 1; i > 0; i--) {
    // Inclusive range: Math.floor(random() * (max - min + 1)) + min.
    // min = 0; max = i, which starts at cards.length - 1.
    const j = Math.floor(random() * (i - 0 + 1)) + 0;
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatching({ initialCards }) {
  const [state, setState] = useState(() => ({
    cards: initialCards || makeDeck(),
    flipped: [],
    matched: [],
    moves: 0,
  }));

  function handleFlip(id) {
    setState(previous => {
      if (
        previous.flipped.length === 2 ||
        previous.flipped.includes(id) ||
        previous.matched.includes(id)
      ) {
        return previous;
      }

      const card = previous.cards.find(item => item.id === id);
      if (!card) return previous;

      const flipped = [...previous.flipped, id];

      // Record the first card and wait for the second.
      if (flipped.length === 1) {
        return { ...previous, flipped };
      }

      // The second card completes one attempt.
      const firstCard = previous.cards.find(item => item.id === flipped[0]);
      const moves = previous.moves + 1;

      if (firstCard.value === card.value) {
        return {
          ...previous,
          flipped: [],
          matched: [...previous.matched, ...flipped],
          moves,
        };
      }

      // Leave a mismatch visible until the effect hides it.
      return { ...previous, flipped, moves };
    });
  }

  function handleNewGame() {
    setState({
      cards: makeDeck(),
      flipped: [],
      matched: [],
      moves: 0,
    });
  }

  useEffect(() => {
    if (state.flipped.length !== 2) return;

    const timer = setTimeout(() => {
      setState(previous => ({ ...previous, flipped: [] }));
    }, 800);

    return () => clearTimeout(timer);
  }, [state.flipped]);

  const won = state.matched.length === state.cards.length;
  return <section aria-label="Memory matching">
    <p role="status">{won ? 'All pairs found! ' : ''}Moves: {state.moves}</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: 4 }}>
      {state.cards.map((card, index) => {
        const visible = state.flipped.includes(card.id) || state.matched.includes(card.id);
        return <button key={card.id} aria-label={`Card ${index + 1}: ${visible ? card.value : 'hidden'}`}
          disabled={visible || state.flipped.length === 2 || won}
          onClick={() => handleFlip(card.id)}
          style={{ height: 64, fontSize: 24 }}>{visible ? card.value : '?'}</button>;
      })}
    </div>
    <button onClick={handleNewGame}>New game</button>
  </section>;
}
