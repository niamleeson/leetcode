import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lessons, TopicLesson } from '../data/lessons';
import { templateBlockMeta, splitTemplateByBlocks } from '../data/template-block-meta';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CodeBlock from './CodeBlock';
import GlossaryHighlighter from './GlossaryHighlighter';

const DSA_CATEGORIES = [
  {
    name: 'Data Structures',
    topics: [
      'Arrays & Hashing',
      'Stack',
      'Linked List',
      'Trees',
      'Tries',
      'Heap / Priority Queue',
      'Union Find',
      'Monotonic Stack',
      'Monotonic Queue',
      'Segment Tree',
      'Binary Indexed Tree',
    ],
  },
  {
    name: 'Algorithms & Techniques',
    topics: [
      'Two Pointers',
      'Sliding Window',
      'Binary Search',
      'Backtracking',
      'Graphs',
      'Dynamic Programming',
      'Greedy',
      'Divide & Conquer',
      'String Algorithms',
      'Minimum Spanning Tree',
      'Topological Sort',
    ],
  },
  {
    name: 'Specialized Topics',
    topics: [
      'Intervals',
      'Math & Geometry',
      'Bit Manipulation',
    ],
  },
  {
    name: 'Concurrency',
    topics: [
      'Concurrency',
    ],
  },
];

function LanguageToggle({ language, setLanguage }: {
  language: 'python' | 'javascript';
  setLanguage: (lang: 'python' | 'javascript') => void;
}) {
  return (
    <div className="inline-flex rounded-md bg-gray-800 p-0.5">
      <button
        onClick={() => setLanguage('javascript')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'javascript'
            ? 'bg-yellow-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        JavaScript
      </button>
      <button
        onClick={() => setLanguage('python')}
        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
          language === 'python'
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Python
      </button>
    </div>
  );
}

function splitWalkthroughBySection(walkthrough: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  // Split on ── Title ── markers, capturing the title
  const parts = walkthrough.split(/── (.+?) ──\n?/);
  // parts = [before, title1, content1, title2, content2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const content = (parts[i + 1] || '').trim();
    if (content) sections.push({ title: parts[i], content });
  }
  return sections;
}

function WalkthroughSection({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border border-sky-900/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-sky-950/20 hover:bg-sky-950/30 transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Step-by-Step Walkthrough</span>
        <span className="text-sky-600 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <pre className="p-4 text-xs text-sky-200/90 leading-relaxed whitespace-pre-wrap font-mono">{text}</pre>
      )}
    </div>
  );
}

function VerifySection({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-emerald-900/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-950/20 hover:bg-emerald-950/30 transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Verify Your Understanding</span>
        <span className="text-emerald-600 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <pre className="p-4 text-xs text-emerald-200/80 leading-relaxed whitespace-pre-wrap font-mono">{text}</pre>
      )}
    </div>
  );
}

function TemplateBlocks({ lesson, showJs, useReadable, language }: {
  lesson: TopicLesson;
  showJs: boolean;
  useReadable: boolean;
  language: 'python' | 'javascript';
}) {
  const templateStr = useReadable ? lesson.jsTemplateReadable! : (showJs ? lesson.jsTemplate! : lesson.template);
  const blocksMeta = templateBlockMeta[lesson.topic];
  const walkthroughSections = showJs && lesson.jsTemplateWalkthrough
    ? splitWalkthroughBySection(lesson.jsTemplateWalkthrough)
    : [];

  if (!blocksMeta || !blocksMeta.length) {
    return (
      <div>
        <CodeBlock code={templateStr} language={language} />
        {walkthroughSections.map((s, i) => (
          <WalkthroughSection key={i} text={s.content} />
        ))}
      </div>
    );
  }

  const { blocks, codes } = splitTemplateByBlocks(templateStr, blocksMeta, language);

  if (!blocks.length) {
    return (
      <div>
        <CodeBlock code={templateStr} language={language} />
        {walkthroughSections.map((s, i) => (
          <WalkthroughSection key={i} text={s.content} />
        ))}
      </div>
    );
  }

  // Assign walkthroughs to blocks: try title matching first, then fill remaining by order
  const blockWalkthroughs: (string | undefined)[] = blocks.map(() => undefined);
  const usedWalkthroughs = new Set<number>();

  // Pass 1: match by title
  blocks.forEach((block, bi) => {
    const name = block.title.replace(/^LC \d+: /, '').toLowerCase();
    const wi = walkthroughSections.findIndex((s, si) => {
      if (usedWalkthroughs.has(si)) return false;
      const wt = s.title.toLowerCase();
      return name.includes(wt) || wt.includes(name);
    });
    if (wi !== -1) {
      blockWalkthroughs[bi] = walkthroughSections[wi].content;
      usedWalkthroughs.add(wi);
    }
  });

  // Pass 2: assign remaining walkthroughs in order to blocks without one
  const unusedWalkthroughs = walkthroughSections
    .map((s, i) => ({ ...s, idx: i }))
    .filter(s => !usedWalkthroughs.has(s.idx));
  let unusedIdx = 0;
  blocks.forEach((_, bi) => {
    if (!blockWalkthroughs[bi] && unusedIdx < unusedWalkthroughs.length) {
      blockWalkthroughs[bi] = unusedWalkthroughs[unusedIdx].content;
      unusedIdx++;
    }
  });

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <div key={i}>
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 mb-2">
            <h5 className="text-sm font-semibold text-blue-300">{block.title}</h5>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{block.statement}</p>
          </div>
          <CodeBlock code={codes[i] || ''} language={language} />
          {blockWalkthroughs[i] && <WalkthroughSection text={blockWalkthroughs[i]!} />}
        </div>
      ))}
    </div>
  );
}

function TopicCard({ lesson, language, setLanguage, codeStyle, setCodeStyle }: {
  lesson: TopicLesson;
  language: 'python' | 'javascript';
  setLanguage: (lang: 'python' | 'javascript') => void;
  codeStyle: 'readable' | 'original';
  setCodeStyle: (style: 'readable' | 'original') => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'memorization' | 'overview' | 'mindset'>('template');

  const showJs = language === 'javascript' && !!lesson.jsTemplate;
  const useReadable = codeStyle === 'readable' && showJs && lesson.jsTemplateReadable;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <h3 className="text-white font-semibold">{lesson.topic}</h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>


      {expanded && (
        <div className="border-t border-gray-800">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['template', 'memorization', 'mindset', 'overview'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? (tab === 'mindset' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-950/20' : 'text-blue-400 border-b-2 border-blue-400 bg-blue-950/20')
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'memorization' ? 'Memorize' : tab}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-4">
            {activeTab === 'overview' && (
              <>
                <GlossaryHighlighter text={lesson.overview} className="text-sm text-gray-400 leading-relaxed whitespace-pre-line" />

                <div>
                  <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2">Key Patterns</h4>
                  <ul className="space-y-1.5">
                    {lesson.keyPatterns.map((pattern, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-blue-500 mt-0.5 shrink-0">&bull;</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-2">Common Mistakes</h4>
                  <ul className="space-y-1">
                    {lesson.commonMistakes.map((mistake, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-red-500 mt-0.5 shrink-0">&times;</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Tips</h4>
                  <ul className="space-y-1">
                    {lesson.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-400 flex gap-2">
                        <span className="text-emerald-500 mt-0.5 shrink-0">&#10003;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Complexity</h4>
                  <p className="text-sm text-gray-500">{lesson.complexity}</p>
                </div>
              </>
            )}

            {activeTab === 'template' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                    {showJs ? 'JavaScript' : 'Python'} Templates
                  </h4>
                  <div className="flex items-center gap-2">
                    {showJs && lesson.jsTemplateReadable && (
                      <div className="inline-flex rounded-md bg-gray-800 p-0.5">
                        <button
                          onClick={() => setCodeStyle('readable')}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            codeStyle === 'readable'
                              ? 'bg-emerald-600 text-white'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          Readable
                        </button>
                        <button
                          onClick={() => setCodeStyle('original')}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            codeStyle === 'original'
                              ? 'bg-gray-600 text-white'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          Original
                        </button>
                      </div>
                    )}
                    <LanguageToggle language={language} setLanguage={setLanguage} />
                  </div>
                </div>
                <TemplateBlocks
                  lesson={lesson}
                  showJs={showJs}
                  useReadable={!!useReadable}
                  language={showJs ? 'javascript' : 'python'}
                />
                {language === 'javascript' && !lesson.jsTemplate && (
                  <p className="text-xs text-yellow-500/70 mt-2 italic">
                    JavaScript template not available for this topic. Showing Python.
                  </p>
                )}
                {lesson.verification && (
                  <div className="mt-3">
                    <VerifySection text={lesson.verification} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'memorization' && (
              <div className="space-y-4">
                {lesson.memorization ? (
                  <GlossaryHighlighter text={lesson.memorization!} className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono" />
                ) : (
                  <p className="text-sm text-gray-500 italic">Memorization techniques coming soon for this topic.</p>
                )}
                {lesson.verification && (
                  <VerifySection text={lesson.verification} />
                )}
              </div>
            )}

            {activeTab === 'mindset' && (
              <div className="space-y-4">
                {lesson.mindset ? (
                  <GlossaryHighlighter text={lesson.mindset} className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono" />
                ) : (
                  <p className="text-sm text-gray-500 italic">Mindset guide coming soon for this topic.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



function AllMnemonics() {
  const allTopics = DSA_CATEGORIES.flatMap(c => c.topics);
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (name: string) => {
    setOpenTopics(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const jumpToTopic = (name: string) => {
    // Open the topic if not already open
    setOpenTopics(prev => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    // Scroll after a tick so the DOM updates
    setTimeout(() => {
      const el = document.getElementById(`mnemonic-${name.replace(/[^a-zA-Z0-9]/g, '-')}`);
      if (el) el.scrollIntoView({ block: 'start' });
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Table of contents */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Jump to topic</h3>
        <div className="flex flex-wrap gap-2">
          {allTopics.map(name => {
            const lesson = lessons[name];
            if (!lesson?.memorization) return null;
            return (
              <button
                key={name}
                onClick={() => jumpToTopic(name)}
                className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* All mnemonics as accordions */}
      {DSA_CATEGORIES.map(category => {
        const topicsWithMnemonics = category.topics.filter(
          name => lessons[name]?.memorization
        );
        if (!topicsWithMnemonics.length) return null;

        return (
          <div key={category.name}>
            <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
              {category.name}
            </h2>
            <div className="space-y-2">
              {topicsWithMnemonics.map(topicName => {
                const lesson = lessons[topicName]!;
                const isOpen = openTopics.has(topicName);

                return (
                  <div
                    key={topicName}
                    id={`mnemonic-${topicName.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    className="rounded-lg border border-gray-800 overflow-hidden scroll-mt-4"
                  >
                    <button
                      onClick={() => toggleTopic(topicName)}
                      className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-900 transition-colors cursor-pointer"
                    >
                      <h3 className="text-sm font-bold text-gray-200">{lesson.topic}</h3>
                      <span className="text-gray-500">{isOpen ? '▾' : '▸'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-2">
                        <GlossaryHighlighter text={lesson.memorization!} className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DSAReference() {
  const [language, setLanguage] = useLocalStorage<'python' | 'javascript'>('lc-language', 'javascript');
  const [codeStyle, setCodeStyle] = useLocalStorage<'readable' | 'original'>('lc-code-style', 'readable');
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'mnemonics' ? 'mnemonics' : 'topics';

  const setView = (v: 'topics' | 'mnemonics') => {
    if (v === 'mnemonics') {
      setSearchParams({ view: 'mnemonics' });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">DSA Reference Guide</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {view === 'topics'
                ? 'All data structures, algorithms, and concurrency patterns with templates, intuition, and memorization techniques.'
                : 'All memorization mnemonics in one page.'}
            </p>
          </div>
          {view === 'topics' && (
            <LanguageToggle language={language} setLanguage={setLanguage} />
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setView('topics')}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              view === 'topics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            By Topic
          </button>
          <button
            onClick={() => setView('mnemonics')}
            className={`text-xs px-3 py-1.5 rounded transition-colors ${
              view === 'mnemonics'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Mnemonics
          </button>
        </div>
      </div>

      {view === 'mnemonics' ? (
        <AllMnemonics />
      ) : (
        <>
          {/* Quick reference card */}
          <div className="bg-gradient-to-r from-blue-950/40 to-gray-900/40 border border-blue-900/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-300 mb-3">Quick Decision Guide</h3>

            {/* Arrays & Hashing */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2 mb-1">Arrays & Hashing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Find pair with target sum?</span> → Hash Map (complement lookup)</div>
              <div><span className="text-blue-400">Count frequencies / group by?</span> → Hash Map / Counter</div>
              <div><span className="text-blue-400">Subarray sum equals k?</span> → Prefix Sum + Hash Map</div>
              <div><span className="text-blue-400">Product except self?</span> → Prefix / Suffix Products</div>
              <div><span className="text-blue-400">Top-K frequent?</span> → Bucket Sort or Heap</div>
              <div><span className="text-blue-400">Duplicates / seen before?</span> → Hash Set</div>
            </div>

            {/* Two Pointers & Sliding Window */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Two Pointers & Sliding Window</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Sorted array, find pair?</span> → Two Pointers (opposite ends)</div>
              <div><span className="text-blue-400">3Sum / triplets?</span> → Fix one + Two Pointers on rest</div>
              <div><span className="text-blue-400">Container / trapping water?</span> → Two Pointers (move shorter side)</div>
              <div><span className="text-blue-400">Remove duplicates in-place?</span> → Slow/Fast pointers</div>
              <div><span className="text-blue-400">Longest substring/subarray?</span> → Sliding Window (expand right, shrink left)</div>
              <div><span className="text-blue-400">Shortest/minimum window?</span> → Sliding Window (shrink while valid)</div>
              <div><span className="text-blue-400">Fixed-size window max/sum?</span> → Sliding Window (slide, add right, drop left)</div>
              <div><span className="text-blue-400">Anagram / permutation in string?</span> → Sliding Window + Frequency Map</div>
            </div>

            {/* Stack */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Stack</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Matching brackets / nesting?</span> → Stack (push open, pop on close)</div>
              <div><span className="text-blue-400">Next greater / warmer element?</span> → Monotonic Decreasing Stack</div>
              <div><span className="text-blue-400">Next smaller element?</span> → Monotonic Increasing Stack</div>
              <div><span className="text-blue-400">Largest rectangle in histogram?</span> → Monotonic Stack (find boundaries)</div>
              <div><span className="text-blue-400">Evaluate expression / RPN?</span> → Stack (operands + operators)</div>
              <div><span className="text-blue-400">Decode nested string?</span> → Stack (track context layers)</div>
              <div><span className="text-blue-400">Min stack / special stack?</span> → Two stacks (main + min tracker)</div>
            </div>

            {/* Binary Search */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Binary Search</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Find target in sorted array?</span> → Classic Binary Search (left &lt;= right)</div>
              <div><span className="text-blue-400">First/last position of X?</span> → Boundary Binary Search (left &lt; right)</div>
              <div><span className="text-blue-400">"Minimum X such that..."?</span> → Binary Search on Answer</div>
              <div><span className="text-blue-400">Search in rotated array?</span> → Binary Search (find sorted half first)</div>
              <div><span className="text-blue-400">Koko / ship packages / split array?</span> → Binary Search on Answer + feasibility check</div>
            </div>

            {/* Linked List */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Linked List</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Reverse a list?</span> → Iterative: prev/curr/next dance</div>
              <div><span className="text-blue-400">Detect cycle?</span> → Fast/Slow pointers (Floyd&apos;s)</div>
              <div><span className="text-blue-400">Find middle?</span> → Fast/Slow pointers</div>
              <div><span className="text-blue-400">Merge sorted lists?</span> → Dummy head + compare heads</div>
              <div><span className="text-blue-400">Remove nth from end?</span> → Two pointers with n-gap</div>
              <div><span className="text-blue-400">Reorder / rearrange?</span> → Find middle → reverse 2nd half → merge</div>
              <div><span className="text-blue-400">Deep copy with random pointers?</span> → Hash Map (old → new)</div>
              <div><span className="text-blue-400">LRU Cache?</span> → Hash Map + Doubly Linked List</div>
            </div>

            {/* Trees */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trees</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Depth / height / balanced?</span> → DFS (recursive: base case + combine)</div>
              <div><span className="text-blue-400">Level-by-level traversal?</span> → BFS (queue, process per level)</div>
              <div><span className="text-blue-400">Validate BST?</span> → DFS with min/max bounds</div>
              <div><span className="text-blue-400">Lowest common ancestor?</span> → DFS (found left? found right? → root)</div>
              <div><span className="text-blue-400">Diameter / path sum?</span> → DFS with global max tracking</div>
              <div><span className="text-blue-400">Serialize / deserialize?</span> → Preorder + null markers</div>
              <div><span className="text-blue-400">Prefix lookup / autocomplete?</span> → Trie (char-by-char tree)</div>
            </div>

            {/* Heap */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Heap / Priority Queue</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Top-K elements?</span> → Min-Heap of size K</div>
              <div><span className="text-blue-400">Merge K sorted things?</span> → Min-Heap (push heads, pop smallest)</div>
              <div><span className="text-blue-400">Find running median?</span> → Two Heaps (max-heap left + min-heap right)</div>
              <div><span className="text-blue-400">Task scheduler / cooldown?</span> → Max-Heap (pick most frequent)</div>
            </div>

            {/* Graph */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Graphs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Shortest path (unweighted)?</span> → BFS</div>
              <div><span className="text-blue-400">Shortest path (weighted)?</span> → Dijkstra (min-heap)</div>
              <div><span className="text-blue-400">Connected components / islands?</span> → BFS/DFS or Union-Find</div>
              <div><span className="text-blue-400">Spread from multiple sources?</span> → Multi-source BFS</div>
              <div><span className="text-blue-400">Clone / deep copy graph?</span> → DFS/BFS + Hash Map (old → new)</div>
              <div><span className="text-blue-400">Dependency order?</span> → Topological Sort (Kahn&apos;s BFS)</div>
              <div><span className="text-blue-400">Cycle in directed graph?</span> → Topo sort (incomplete = cycle) or 3-state DFS</div>
              <div><span className="text-blue-400">Minimum cost to connect all?</span> → MST (Kruskal&apos;s or Prim&apos;s)</div>
            </div>

            {/* Backtracking */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Backtracking</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">All subsets / power set?</span> → Backtrack (record at every node)</div>
              <div><span className="text-blue-400">All permutations?</span> → Backtrack (used set, try all positions)</div>
              <div><span className="text-blue-400">Combinations that sum to target?</span> → Backtrack (start index, remaining)</div>
              <div><span className="text-blue-400">With duplicates?</span> → Sort + skip if nums[i] === nums[i-1]</div>
              <div><span className="text-blue-400">Place queens / sudoku?</span> → Backtrack + constraint sets</div>
              <div><span className="text-blue-400">Word search on grid?</span> → DFS backtrack (mark visited, restore)</div>
            </div>

            {/* DP */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dynamic Programming</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Max subarray sum?</span> → Kadane&apos;s (reset if negative)</div>
              <div><span className="text-blue-400">Climbing stairs / Fibonacci?</span> → 1D DP (dp[i] = dp[i-1] + dp[i-2])</div>
              <div><span className="text-blue-400">Rob houses (no adjacent)?</span> → 1D DP (rob or skip)</div>
              <div><span className="text-blue-400">Coin change / min cost?</span> → Unbounded Knapsack (forward loop)</div>
              <div><span className="text-blue-400">Subset sum / partition?</span> → 0/1 Knapsack (backward loop)</div>
              <div><span className="text-blue-400">Two strings (LCS, edit dist)?</span> → 2D DP (match → diagonal, else min of 3)</div>
              <div><span className="text-blue-400">Longest increasing subseq?</span> → Binary Search on tails (O(n log n))</div>
              <div><span className="text-blue-400">Buy/sell stock with cooldown?</span> → State Machine DP (hold/sold/rest)</div>
              <div><span className="text-blue-400">Can&apos;t figure out DP?</span> → Write brute-force recursion + memoize</div>
            </div>

            {/* Greedy & Intervals */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Greedy & Intervals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Can reach the end?</span> → Greedy (track farthest reachable)</div>
              <div><span className="text-blue-400">Merge overlapping intervals?</span> → Sort by start, extend end</div>
              <div><span className="text-blue-400">Min rooms / max overlap?</span> → Sort starts + ends, sweep</div>
              <div><span className="text-blue-400">Non-overlapping (max events)?</span> → Sort by end time, pick greedily</div>
              <div><span className="text-blue-400">Gas station / circular route?</span> → Greedy (deficit reset)</div>
            </div>

            {/* Bit, Math, Design */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bit Manipulation, Math & Other</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400 mb-3">
              <div><span className="text-blue-400">Find unique in pairs?</span> → XOR all elements</div>
              <div><span className="text-blue-400">Count set bits?</span> → n &amp; (n-1) removes lowest bit</div>
              <div><span className="text-blue-400">Rotate matrix 90°?</span> → Transpose + reverse rows</div>
              <div><span className="text-blue-400">Spiral traversal?</span> → 4 boundaries, shrink after each pass</div>
              <div><span className="text-blue-400">Range sum + updates?</span> → Segment Tree or BIT</div>
              <div><span className="text-blue-400">Sliding window max/min?</span> → Monotonic Deque</div>
            </div>

            {/* Concurrency */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Concurrency</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-gray-400">
              <div><span className="text-blue-400">Enforce execution order?</span> → Promise gates / Events</div>
              <div><span className="text-blue-400">Alternate two threads?</span> → Two semaphores (ping-pong)</div>
              <div><span className="text-blue-400">Producer-consumer / bounded queue?</span> → Semaphore(capacity) + Lock</div>
              <div><span className="text-blue-400">Group threads (2H + 1O)?</span> → Semaphore (ratio) + Barrier (grouping)</div>
              <div><span className="text-blue-400">Prevent deadlock?</span> → Semaphore(n-1) to break circular wait</div>
            </div>
          </div>

          {/* Categories */}
          {DSA_CATEGORIES.map(category => (
            <div key={category.name}>
              <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
                {category.name}
              </h2>
              <div className="space-y-3">
                {category.topics.map(topicName => {
                  const lesson = lessons[topicName];
                  if (!lesson) return null;
                  return (
                    <TopicCard
                      key={topicName}
                      lesson={lesson}
                      language={language}
                      setLanguage={setLanguage}
                      codeStyle={codeStyle}
                      setCodeStyle={setCodeStyle}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
