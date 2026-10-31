import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NeetCodeTopic, neetcodeTopics } from '../data/neetcode250';
import NeetCodeView from './NeetCodeView';
import { solutionMap } from '../data/solutions';

const topics: NeetCodeTopic[] = ['Arrays', 'Trees'].map(name => ({
  name,
  problems: [],
  templates: [{
    id: name.toLowerCase(),
    name: `${name} template`,
    mnemonic: `${name} pattern`,
    pseudocode: `${name} pseudocode`,
    python: `${name} Python code`,
    javascript: `${name} JavaScript code`,
    problemIds: [],
  }],
}));

function showPage(storagePrefix = 'nc250') {
  return render(
    <MemoryRouter>
      <NeetCodeView topics={topics} storagePrefix={storagePrefix} title="NeetCode" description="Templates" />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it.each([323,684,721,1462,1489,1584,2709])('shows BFS first for #%i and loads the later version independently in both languages',async id=>{
  const problem=neetcodeTopics.flatMap(topic=>topic.problems).find(problem=>problem.id===id)!;
  const solution=solutionMap[id],alternative=solution.followUp!;
  const topic:NeetCodeTopic={name:'Graphs',problems:[problem],templates:[{...topics[0].templates[0],problemIds:[id]}]};
  render(<MemoryRouter><NeetCodeView topics={[topic]} storagePrefix="nc250" title="NeetCode" description="Templates"/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:/^Graphs 1 template/}));
  fireEvent.click(screen.getByRole('button',{name:'Expand solution'}));
  const firstHeading=screen.getByRole('heading',{name:`${solution.solutionTitle} · JavaScript Solution`});
  const secondHeading=screen.getByRole('heading',{name:`${alternative.label}: ${alternative.title}`});
  expect(firstHeading.compareDocumentPosition(secondHeading)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  await screen.findByRole('slider',{name:`${problem.title} step`});
  await screen.findByRole('slider',{name:`${problem.title} · ${alternative.title} step`});
  const first=screen.getByRole('region',{name:`${problem.title} walkthrough`});
  const second=screen.getByRole('region',{name:`${problem.title} · ${alternative.title} walkthrough`});
  for(const [panel,code] of [[first,solution.jsCode!],[second,alternative.jsCode!]] as const) {
    expect([...panel.querySelectorAll('.traversal-line-content')].map(line=>line.textContent).join('\n')).toBe(code);
  }
  fireEvent.click(within(second).getByRole('button',{name:'Next →'}));
  expect((within(first).getByRole('slider') as HTMLInputElement).value).toBe('0');
  expect((within(second).getByRole('slider') as HTMLInputElement).value).toBe('1');
  fireEvent.click(within(first).getByRole('checkbox',{name:'Highlight code'}));
  for(const panel of [first,second])expect((within(panel).getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  fireEvent.click(screen.getByRole('button',{name:'Python'}));
  expect(screen.getByRole('heading',{name:`${solution.solutionTitle} · Python Solution`})).toBeTruthy();
  expect(screen.getByRole('heading',{name:`${alternative.label}: ${alternative.title}`})).toBeTruthy();
  expect(screen.queryAllByRole('slider')).toHaveLength(0);
  expect([...document.querySelectorAll('pre code')].map(code=>code.textContent)).toContain(solution.code);
  expect([...document.querySelectorAll('pre code')].map(code=>code.textContent)).toContain(alternative.code);
});

it('shows both island solutions, loads independent players, and shares the highlight preference',async()=>{
  const problem=neetcodeTopics.flatMap(topic=>topic.problems).find(problem=>problem.id===200)!;
  const islandTopic:NeetCodeTopic={name:'Graphs',problems:[problem],templates:[{...topics[0].templates[0],problemIds:[200]}]};
  render(<MemoryRouter><NeetCodeView topics={[islandTopic]} storagePrefix="nc250" title="NeetCode" description="Templates"/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:/^Graphs 1 template/}));
  fireEvent.click(screen.getByRole('button',{name:'Expand solution'}));
  expect(screen.getByRole('heading',{name:'Recursive DFS · JavaScript Solution'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Alternative: Iterative DFS (explicit stack)'})).toBeTruthy();
  await screen.findByRole('slider',{name:/Number of Islands · Iterative DFS/});
  await screen.findByRole('slider',{name:'Number of Islands step'});
  const recursive=screen.getByRole('region',{name:'Number of Islands walkthrough'});
  const iterative=screen.getByRole('region',{name:'Number of Islands · Iterative DFS (explicit stack) walkthrough'});
  fireEvent.click(within(iterative).getByRole('checkbox',{name:'Highlight code'}));
  for(const panel of [recursive,iterative])expect((within(panel).getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  fireEvent.click(within(iterative).getByRole('button',{name:'Next →'}));
  expect((within(iterative).getByRole('slider') as HTMLInputElement).value).toBe('1');
  expect((within(recursive).getByRole('slider') as HTMLInputElement).value).toBe('0');
  fireEvent.click(screen.getByRole('button',{name:'Python'}));
  expect(screen.queryAllByRole('slider')).toHaveLength(0);
  expect(screen.getByRole('heading',{name:'Recursive DFS · Python Solution'})).toBeTruthy();
  expect(screen.getByRole('heading',{name:'Alternative: Iterative DFS (explicit stack)'})).toBeTruthy();
  expect(document.body.textContent).toContain('stack.append((nr, nc))');
});

describe('shared template tab preference', () => {
  it('syncs open and newly opened topics, survives remounting, and follows the chosen language', () => {
    let page = showPage();
    fireEvent.click(screen.getByRole('button', { name: /^Arrays 1 template/ }));
    fireEvent.click(screen.getByRole('button', { name: 'JavaScript', pressed: false }));
    expect(JSON.parse(localStorage.getItem('nc250-template-tab')!)).toBe('code');

    fireEvent.click(screen.getByRole('button', { name: /^Trees 1 template/ }));
    expect(screen.getAllByRole('button', { name: 'JavaScript', pressed: true })).toHaveLength(2);

    page.unmount();
    page = showPage();
    expect(screen.getAllByRole('button', { name: 'JavaScript', pressed: true })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Python' }));
    expect(screen.getAllByRole('button', { name: 'Python', pressed: true })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Pseudocode (memorize)' })[1]);
    expect(screen.getAllByRole('button', { name: 'Pseudocode (memorize)', pressed: true })).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem('nc250-template-tab')!)).toBe('pseudocode');
    page.unmount();
    showPage();
    expect(screen.getAllByRole('button', { name: 'Pseudocode (memorize)', pressed: true })).toHaveLength(2);
  });

  it('keeps the preference scoped to its page', () => {
    localStorage.setItem('nc250-template-tab', JSON.stringify('code'));
    showPage('nc150');
    fireEvent.click(screen.getByRole('button', { name: /^Arrays 1 template/ }));
    expect(screen.getByRole('button', { name: 'Pseudocode (memorize)', pressed: true })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('nc250-template-tab')!)).toBe('code');
  });
});
