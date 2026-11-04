import { neetcodeTopics } from '../data/neetcode250';
import NeetCodeView from './NeetCodeView';
import { Link } from 'react-router-dom';

export default function NeetCode250() {
  return (
    <>
      <Link to="/master-solution" className="inline-block mb-4 text-sm text-sky-400 light:text-sky-700 underline underline-offset-4">Master solution · all 96 audited study units →</Link>
      <NeetCodeView
        topics={neetcodeTopics}
        storagePrefix="nc250"
        title="NeetCode 250"
        description="Topic → template → questions. Memorize the pseudocode, then see it solve many problems."
      />
    </>
  );
}
