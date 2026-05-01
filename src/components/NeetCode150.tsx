import { neetcode150Topics } from '../data/neetcode150';
import NeetCodeView from './NeetCodeView';

export default function NeetCode150() {
  return (
    <NeetCodeView
      topics={neetcode150Topics}
      storagePrefix="nc150"
      title="NeetCode 150"
      description="The curated 150. Same templates as the 250 — broader coverage than Blind 75, tighter than the full set."
    />
  );
}
