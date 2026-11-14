import { useEffect, useReducer } from 'react';

export function makeDeck(random = Math.random) {
  const cards = ['A', 'B', 'C', 'D', 'E', 'F'].flatMap(value => [value, value])
    .map((value, id) => ({ id, value }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
const start = cards => ({ cards, flipped: [], matched: [], moves: 0 });
export function memoryReducer(state, action) {
  if (action.type === 'reset') return start(action.cards);
  if (action.type === 'hide') return { ...state, flipped: [] };
  if (action.type !== 'flip' || state.flipped.length === 2 ||
      state.flipped.includes(action.id) || state.matched.includes(action.id)) return state;
  const card = state.cards.find(item => item.id === action.id);
  if (!card) return state;
  const flipped = [...state.flipped, card.id];
  if (flipped.length === 1) return { ...state, flipped };
  const first = state.cards.find(item => item.id === flipped[0]);
  return first.value === card.value
    ? { ...state, flipped: [], matched: [...state.matched, ...flipped], moves: state.moves + 1 }
    : { ...state, flipped, moves: state.moves + 1 };
}

export default function MemoryMatching({ initialCards }) {
  const [state, dispatch] = useReducer(memoryReducer, initialCards, cards => start(cards || makeDeck()));
  useEffect(() => {
    if (state.flipped.length !== 2) return;
    const timer = setTimeout(() => dispatch({ type: 'hide' }), 800);
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
          onClick={() => dispatch({ type: 'flip', id: card.id })}
          style={{ height: 64, fontSize: 24 }}>{visible ? card.value : '?'}</button>;
      })}
    </div>
    <button onClick={() => dispatch({ type: 'reset', cards: makeDeck() })}>New game</button>
  </section>;
}
