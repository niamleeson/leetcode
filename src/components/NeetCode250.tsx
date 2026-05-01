import { neetcodeTopics } from '../data/neetcode250';
import NeetCodeView from './NeetCodeView';

export default function NeetCode250() {
  return (
    <NeetCodeView
      topics={neetcodeTopics}
      storagePrefix="nc250"
      title="NeetCode 250"
      description="Topic → template → questions. Memorize the pseudocode, then see it solve many problems."
    />
  );
}
