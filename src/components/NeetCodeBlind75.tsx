import { blind75Topics } from '../data/neetcodeBlind75';
import NeetCodeView from './NeetCodeView';

export default function NeetCodeBlind75() {
  return (
    <NeetCodeView
      topics={blind75Topics}
      storagePrefix="nc75"
      title="NeetCode Blind 75"
      description="The classic 75. Same templates as the 250 — same patterns, fewer reps to keep them sharp."
    />
  );
}
