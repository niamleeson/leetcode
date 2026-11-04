import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { masterCatalog as catalog } from '../data/master-solution/generated/catalog';
import { solutionMap } from '../data/solutions';
import { graphMinHeapJavascript } from '../data/shared-graph-heap';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ExecutionWalkthrough from './walkthroughs/ExecutionWalkthrough';
import SolutionComplexity from './SolutionComplexity';
import CodeBlock from './CodeBlock';
import programUrl from '../data/master-solution/generated/delivery-control.mjs?url';
import dailySource from '../data/master-solution/generated/daily-example.txt?raw';
import './neetcodeView.css';
import './masterSolution.css';

const problems = new Map(catalog.problems.map(problem => [problem.id, problem]));
const implementations = new Map(catalog.problems.flatMap(problem => problem.variants.map(variant => [variant.key, variant] as const)));
const usage = `// Run the complete example: node delivery-control.mjs

import { operation } from './delivery-control.mjs';

const { shipWithinDays } = operation('B02', 1011);
shipWithinDays([1, 2, 3, 4, 5], 3); // 6

// Each alternative has its own implementation.
const { MyStack } = operation('S04', 225, 'one-queue');
const stack = new MyStack();
stack.push(4);
stack.pop(); // 4`;

export default function MasterSolution() {
  const [params, setParams] = useSearchParams();
  const [savedUnit, setSavedUnit] = useLocalStorage('master-solution-last-unit', 'A01');
  const [search, setSearch] = useState('');
  const requested = params.get('unit') || savedUnit;
  const unit = catalog.units.find(item => item.id === requested) || catalog.units[0];
  const chapter = catalog.chapters.find(item => item.name === unit.chapter)!;
  const variants = unit.variantKeys.map(key => implementations.get(key)!);
  const version = variants.find(item => item.key === params.get('implementation')) || variants[0];
  const problem = problems.get(version.problemId)!;
  const primary = solutionMap[version.problemId];
  const solution = version.variant ? primary.followUp! : primary;
  const currentIndex = catalog.units.indexOf(unit);

  useEffect(() => { if (savedUnit !== unit.id) setSavedUnit(unit.id); }, [unit.id, savedUnit, setSavedUnit]);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/^#/, '');
    if (!query) return [];
    return catalog.units.filter(item => [item.id, item.name, item.chapter, item.task,
      ...item.problemIds.flatMap(id => [String(id), problems.get(id)!.title]),
    ].some(text => text.toLowerCase().includes(query)));
  }, [search]);

  function chooseUnit(id: string, implementation?: string) {
    setSearch('');
    setSavedUnit(id);
    setParams(implementation ? { unit: id, implementation } : { unit: id });
  }

  return <div className="neetcode-page master-page">
    <header className="master-heading">
      <Link to="/neetcode" className="master-link">← NeetCode 250</Link>
      <h1>Master solution</h1>
      <p className="master-subtitle">Build Delivery Control: one study project, with a complete implementation for every audited variation.</p>
      <p className="master-counts">13 chapters · {catalog.totals.units} study units · {catalog.totals.problems} problems · {catalog.totals.variants} implementations</p>
      <a className="master-action" href={programUrl} download="delivery-control.mjs">Download complete JavaScript</a>
    </header>

    <details className="master-overview">
      <summary>The master problem and how to use the solution</summary>
      <p>Your delivery company manages package records, delivery logs, linked routes, a management tree, an address directory, dependent jobs, a road network, and booking windows. Implement the operations in each chapter. Each operation has its own input and output; the daily example brings one operation from every chapter together.</p>
      <p>Start with the rule to remember, then choose an implementation. The original function names and problem constraints stay visible so you can transfer the technique back to LeetCode. All {catalog.totals.variants} implementations are included in the download, along with node constructors and shared heaps.</p>
      <p>Run the downloaded file with <code>node delivery-control.mjs</code> to execute the sample day, or import an operation to use it with your own valid inputs. Some algorithms mutate their inputs. The sample-day runner makes a copy first.</p>
      <CodeBlock code={usage} language="javascript" />
      <details>
        <summary>Input and expected result for the sample day</summary>
        <div className="master-example-pair">
          <div><h3>Input</h3><pre>{JSON.stringify(catalog.dailyExample.input, null, 2)}</pre></div>
          <div><h3>Expected result</h3><pre>{JSON.stringify(catalog.dailyExample.result, null, 2)}</pre></div>
        </div>
      </details>
      <details>
        <summary>Read the complete sample-day function</summary>
        <CodeBlock code={dailySource} language="javascript" />
      </details>
      <ol className="master-day-stages">
        {catalog.dailyExample.stages.map(stage => <li key={stage.unit}>
          <button type="button" className="master-link" onClick={() => chooseUnit(stage.unit, String(stage.problemId))}>{stage.task}</button>
        </li>)}
      </ol>
    </details>

    <div className="master-selectors">
      <label>Chapter
        <select value={unit.chapter} onChange={event => chooseUnit(catalog.chapters.find(item => item.name === event.target.value)!.unitIds[0])}>
          {catalog.chapters.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
        </select>
      </label>
      <label>Study unit
        <select value={unit.id} onChange={event => chooseUnit(event.target.value)}>
          {catalog.units.filter(item => item.chapter === unit.chapter).map(item => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}
        </select>
      </label>
      <label>Find a pattern or problem
        <input type="search" placeholder="Try 435, median, or backtracking" value={search} onChange={event => setSearch(event.target.value)} />
      </label>
    </div>
    {search.trim() && <div className="master-search-results" aria-label="Pattern search results">
      <p role="status">{matches.length} matching {matches.length === 1 ? 'unit' : 'units'}</p>
      {matches.map(item => <button type="button" key={item.id} onClick={() => {
        const query = search.trim().replace(/^#/, '').toLowerCase();
        const match = item.problemIds.find(id => String(id) === query || problems.get(id)!.title.toLowerCase().includes(query));
        chooseUnit(item.id, match ? String(match) : undefined);
      }}>{item.id} · {item.name}<span>{item.chapter}</span></button>)}
    </div>}

    <section className="master-unit" aria-label={`${unit.id} ${unit.name}`}>
      <div className="master-unit-heading">
        <div><p className="master-kicker">{unit.chapter} · {unit.id}</p><h2>{unit.name}</h2></div>
        <nav aria-label="Study unit navigation">
          <button type="button" disabled={currentIndex === 0} onClick={() => chooseUnit(catalog.units[currentIndex - 1].id)}>← Previous</button>
          <button type="button" disabled={currentIndex === catalog.units.length - 1} onClick={() => chooseUnit(catalog.units[currentIndex + 1].id)}>Next unit →</button>
        </nav>
      </div>
      <p className="master-chapter-story">{chapter.story}</p>
      <div className="master-task"><h3>Your task</h3><p>{unit.task}</p></div>
      <div className="master-rule"><h3>Remember this</h3><p>{unit.remember}</p></div>
      <div className="master-distinction"><h3>The detail that changes the solution</h3><p>{unit.watchFor}</p></div>

      <label className="master-implementation">Implementation and variation
        <select value={version.key} onChange={event => setParams({ unit: unit.id, implementation: event.target.value })}>
          {variants.map(item => <option value={item.key} key={item.key}>#{item.problemId} {item.title}{item.name !== 'Primary' ? ` · ${item.name}` : ''}</option>)}
        </select>
      </label>
      <div className="master-variation" key={version.key}>
        <div className="master-variation-heading"><h3>{version.title}{version.name !== 'Primary' ? ` · ${version.name}` : ''}</h3><a className="master-link" href={problem.url} target="_blank" rel="noreferrer">LeetCode ↗</a></div>
        <p>{primary.description}</p>
        <p className="master-variation-rule">{version.rule}</p>
        {problem.overlap.length > 0 && <details className="master-scope-note"><summary>Concepts also used here</summary>{problem.overlap.map(note => <p key={note}>{note}</p>)}</details>}
        <details className="master-input-example"><summary>Example input and output</summary><pre>{primary.examples}</pre></details>
        {[1631,743,778].includes(version.problemId) && <details className="master-helper"><summary>Shared MinHeap used by this solution</summary><CodeBlock code={graphMinHeapJavascript} language="javascript" /></details>}
        <ExecutionWalkthrough key={version.key} id={version.problemId} code={solution.jsCode!} variant={version.variant} />
        <SolutionComplexity solution={solution} language="javascript" />
      </div>
    </section>

    <details className="master-coverage">
      <summary>Scope and complete coverage map</summary>
      <p>This reference includes {catalog.totals.problems} problems from the 13 chapters above. It excludes the 1-D DP, 2-D DP, Greedy, Math &amp; Geometry, and Bit Manipulation sections. Some included problems still use those concepts; their notes identify the overlap. The {catalog.totals.units} units are a teaching organization, not a universal count of algorithms.</p>
      <p>Every listed implementation has a runnable function or constructor, a rule for its variation, an execution walkthrough, and a complexity derivation. The {catalog.totals.examples} recorded examples have matching results in the downloadable program. These examples do not prove correctness for every possible input.</p>
      <p>Complexities assume O(1) FIFO queue operations, expected O(1) hash lookups, and amortized O(1) array append.</p>
      <ul>{catalog.problems.map(item => <li key={item.id}>
        <span>#{item.id} {item.title}</span>
        {item.variants.map(variant => <button key={variant.key} className="master-link" type="button" onClick={() => chooseUnit(variant.units[0], variant.key)}>{variant.name} · {variant.units.join(', ')}</button>)}
      </li>)}</ul>
    </details>
  </div>;
}
